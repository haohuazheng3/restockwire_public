/**
 * RestockWire relay — runs on the data host next to this site's database (systemd restockwire-relay.service).
 *
 * The stock itself is observed by a separate poller cluster (poller/main.ts, running on its own hosts with routed
 * IPv6 egress). This process mirrors what that cluster records into this site's database and turns it into this
 * site's alerts, so the site code, the admin board and the watchdog see exactly the tables they always did:
 *
 *  • store_sku_status   every row whose check or change is newer than the last tick (STATUS_EVERY_MS, 4 s);
 *                       a full pass at start-up. One multi-row upsert per tick, rows that did not change skipped.
 *  • availability_events by id cursor every second, re-reading the last RECENT_MIN minutes for columns written
 *                       late (seen_until on a sell-out). A restock newer than NOTIFY_MAX_AGE_MS goes to
 *                       notifyRestocks — the same function the poller calls after its own confirmation — which
 *                       matches this site's watches and sends its pushes and e-mails (dedupe: notifications
 *                       (watch, event) unique index + the 30 min cool-down). Older ones are mirrored silently:
 *                       an alert about a restock from an hour ago is worse than none.
 *  • poller_state       heartbeat, alive:*, cluster, poller:config* — never the keys this site writes itself
 *                       (watchdog*, relay*), so the health rules and the admin board read the cluster's state.
 *  • sweeps             by started_at cursor (the admin charts); poll_log is not mirrored (27k rows an hour of
 *                       request-level diagnostics that only the cluster's own operators need).
 *  • relay:alive        written here every tick (cursors, lag, counts) for /api/health and the admin board.
 *
 * Source access: SOURCE_DATABASE_URL (the cluster's primary) and optionally SOURCE_DATABASE_URL_2 (its streaming
 * replica, read first while it answers), TLS pinned to SOURCE_DATABASE_CA_FILE, a read-only role. A source that
 * fails is set aside for SOURCE_RETRY_MS and the other one is used.
 *
 * FAST_TARGETS_EXPORT=1 additionally writes the (store, part) pairs this site's paid alerts point at into the
 * source's fast_targets_external table every 60 s, so the cluster's fast lane asks those stores every 5 s too
 * (needs a role with INSERT/DELETE on that table; off until the cluster carries the table).
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { Pool, type PoolConfig } from "pg";
import { sql } from "drizzle-orm";
import { db, poolConfig } from "../src/lib/db";

/** The local pool itself: these statements bind whole arrays (unnest), which the sql template would expand. */
function local() {
  return (db() as unknown as { $client: { query: (text: string, params?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }> } }).$client;
}
import { readState, writeState } from "../src/lib/stock/sweep";
import { notifyRestocks } from "../src/lib/stock/notify";
import type { Transition } from "../src/lib/stock/ingest";
import { loadFastTargets } from "../src/lib/stock/fastlane";
import { errorMessage, recordError } from "../src/lib/errors";
import { logOps } from "../src/lib/ops";

const HOST = process.env.HOST_LABEL || "rw-1";
const STATUS_EVERY_MS = Number(process.env.STATUS_EVERY_MS) || 4_000;
const EVENTS_EVERY_MS = Number(process.env.EVENTS_EVERY_MS) || 1_000;
const STATE_EVERY_MS = Number(process.env.STATE_EVERY_MS) || 5_000;
const SWEEPS_EVERY_MS = Number(process.env.SWEEPS_EVERY_MS) || 15_000;
const FAST_EXPORT_EVERY_MS = 60_000;
const RECENT_MIN = 10;
/** A restock older than this when it reaches us is mirrored but never alerted. */
const NOTIFY_MAX_AGE_MS = Number(process.env.NOTIFY_MAX_AGE_MS) || 120_000;
const SOURCE_RETRY_MS = 60_000;
/** No tick finished for this long → exit; systemd starts a clean process. */
const STUCK_MS = 120_000;
const SITE_KEY = "restockwire";

/* ---------------------------------------------------------------- source databases */

interface Source { name: string; pool: Pool; badUntil: number }

function sourcePool(url: string, name: string): Source {
  const caFile = process.env.SOURCE_DATABASE_CA_FILE;
  const ca = caFile ? readFileSync(caFile, "utf8") : process.env.SOURCE_DATABASE_CA;
  const cfg: PoolConfig = { ...poolConfig(url, { DATABASE_CA: ca, DATABASE_POOL_MAX: "3" }), application_name: `restockwire-relay-${HOST}` };
  const pool = new Pool(cfg);
  pool.on("error", (e) => console.error(`[source ${name}] idle connection closed: ${e.message}`));
  return { name, pool, badUntil: 0 };
}

const sources: Source[] = [];
if (process.env.SOURCE_DATABASE_URL_2) sources.push(sourcePool(process.env.SOURCE_DATABASE_URL_2, "replica"));
if (process.env.SOURCE_DATABASE_URL) sources.push(sourcePool(process.env.SOURCE_DATABASE_URL, "primary"));
if (sources.length === 0) throw new Error("SOURCE_DATABASE_URL missing");

let sourceInUse = sources[0].name;
/** Runs a read on the first source not set aside; a connection-level failure sets it aside and tries the next. */
async function sourceQuery<T>(text: string, params: unknown[] = []): Promise<T[]> {
  const now = Date.now();
  const order = [...sources].sort((a, b) => (a.badUntil > now ? 1 : 0) - (b.badUntil > now ? 1 : 0));
  let lastError: unknown;
  for (const s of order) {
    try {
      const r = await s.pool.query(text, params);
      sourceInUse = s.name;
      return r.rows as T[];
    } catch (e) {
      lastError = e;
      s.badUntil = Date.now() + SOURCE_RETRY_MS;
      console.warn(`[source ${s.name}] ${errorMessage(e)} — set aside for ${SOURCE_RETRY_MS / 1000} s`);
    }
  }
  throw lastError;
}

/* ---------------------------------------------------------------- mirrors */

interface StatusRow { store_number: string; part_number: string; status: string; quote: string | null; since: Date | null; last_checked_at: Date | null; last_changed_at: Date | null; last_available_at: Date | null; pending_status: string | null; pending_since: Date | null; pending_seen: number }

let statusCursor = new Date(0); // first pass copies everything
const stats = { statusRows: 0, statusTicks: 0, events: 0, eventTicks: 0, notified: { matched: 0, sent: 0, failed: 0, skipped: 0 }, sweeps: 0, lastEventAt: null as string | null, lastStatusAt: null as string | null, errors: 0 };

async function mirrorStatus(): Promise<void> {
  const rows = await sourceQuery<StatusRow>(
    `select store_number, part_number, status, quote, since, last_checked_at, last_changed_at, last_available_at, pending_status, pending_since, pending_seen
       from store_sku_status
      where greatest(coalesce(last_checked_at, 'epoch'::timestamptz), coalesce(last_changed_at, 'epoch'::timestamptz)) > $1`,
    [statusCursor],
  );
  if (rows.length === 0) return;
  let newest = statusCursor.getTime();
  for (const r of rows) {
    const t = Math.max(r.last_checked_at?.getTime() ?? 0, r.last_changed_at?.getTime() ?? 0);
    if (t > newest) newest = t;
  }
  for (let i = 0; i < rows.length; i += 2000) {
    const c = rows.slice(i, i + 2000);
    await local().query(`
      insert into store_sku_status (store_number, part_number, status, quote, since, last_checked_at, last_changed_at, last_available_at, pending_status, pending_since, pending_seen)
      select * from unnest($1::text[], $2::text[], $3::text[], $4::text[],
                           $5::timestamptz[], $6::timestamptz[], $7::timestamptz[], $8::timestamptz[],
                           $9::text[], $10::timestamptz[], $11::int[])
      on conflict (store_number, part_number) do update set
        status = excluded.status, quote = excluded.quote, since = excluded.since, last_checked_at = excluded.last_checked_at, last_changed_at = excluded.last_changed_at,
        last_available_at = excluded.last_available_at, pending_status = excluded.pending_status, pending_since = excluded.pending_since, pending_seen = excluded.pending_seen
      -- Only a newer check replaces a row: this site's own fast lane (poller/fast.ts) may hold a fresher one.
      where store_sku_status.last_checked_at is null
         or excluded.last_checked_at > store_sku_status.last_checked_at
         or (excluded.last_checked_at = store_sku_status.last_checked_at and excluded.status is distinct from store_sku_status.status)`, [c.map((r) => r.store_number), c.map((r) => r.part_number), c.map((r) => r.status), c.map((r) => r.quote), c.map((r) => r.since), c.map((r) => r.last_checked_at), c.map((r) => r.last_changed_at), c.map((r) => r.last_available_at), c.map((r) => r.pending_status), c.map((r) => r.pending_since), c.map((r) => r.pending_seen)]);
  }
  // One second of overlap: rows stamped in the same instant as the newest one are read again (the upsert is idempotent).
  statusCursor = new Date(newest - 1_000);
  stats.statusRows += rows.length;
  stats.statusTicks++;
  stats.lastStatusAt = new Date(newest).toISOString();
}

interface EventRow { id: number; store_number: string; part_number: string; kind: string; quote: string | null; at: Date; sweep_id: string | null; first_seen: boolean; seen_until: Date | null }

let eventCursor = 0;

async function mirrorEvents(): Promise<void> {
  const rows = await sourceQuery<EventRow>(
    `select id, store_number, part_number, kind, quote, at, sweep_id, first_seen, seen_until
       from availability_events
      where id > $1 or at > now() - make_interval(mins => ${RECENT_MIN})
      order by id`,
    [eventCursor],
  );
  if (rows.length === 0) return;
  await local().query(`
    insert into availability_events (id, store_number, part_number, kind, quote, at, sweep_id, first_seen, seen_until)
    select * from unnest($1::bigint[], $2::text[], $3::text[], $4::text[],
                         $5::text[], $6::timestamptz[], $7::text[], $8::boolean[], $9::timestamptz[])
    on conflict (id) do update set quote = excluded.quote, first_seen = excluded.first_seen, seen_until = excluded.seen_until
    where availability_events.seen_until is distinct from excluded.seen_until or availability_events.first_seen is distinct from excluded.first_seen`, [rows.map((r) => Number(r.id)), rows.map((r) => r.store_number), rows.map((r) => r.part_number), rows.map((r) => r.kind), rows.map((r) => r.quote), rows.map((r) => r.at), rows.map((r) => r.sweep_id), rows.map((r) => r.first_seen), rows.map((r) => r.seen_until)]);
  const fresh = rows.filter((r) => Number(r.id) > eventCursor);
  eventCursor = Math.max(eventCursor, ...rows.map((r) => Number(r.id)));
  stats.events += fresh.length;
  stats.eventTicks++;
  if (fresh.length) stats.lastEventAt = fresh[fresh.length - 1].at.toISOString();
  // Local events (this site's fast lane) take ids from 5,000,000,000 up (migration 0015): no collision with mirrored ids.

  const now = new Date();
  const alertable = fresh.filter((r) => r.kind === "restock" && !r.first_seen && now.getTime() - r.at.getTime() <= NOTIFY_MAX_AGE_MS);
  const stale = fresh.filter((r) => r.kind === "restock" && !r.first_seen).length - alertable.length;
  if (stale > 0) await logOps("poller", "warn", `relay: ${stale} restock(s) arrived older than ${NOTIFY_MAX_AGE_MS / 1000} s and were not alerted`, { host: HOST, oldestId: fresh[0]?.id });
  if (alertable.length === 0) return;
  const transitions: Transition[] = alertable.map((r) => ({ storeNumber: r.store_number, partNumber: r.part_number, kind: "restock", quote: r.quote, firstSeen: false, at: r.at, seenUntil: r.seen_until }));
  const s = await notifyRestocks(transitions, alertable.map((r) => Number(r.id)), now);
  stats.notified.matched += s.matched; stats.notified.sent += s.sent; stats.notified.failed += s.failed; stats.notified.skipped += s.skipped;
  if (s.sent || s.failed) console.log(`[relay] ${alertable.length} restock(s) → matched ${s.matched} sent ${s.sent} failed ${s.failed} skipped ${s.skipped}`);
}

/** Keys this site writes into its own poller_state: never overwritten by the mirror. */
const OWN_KEY_PREFIXES = ["watchdog", "relay"];

async function mirrorState(): Promise<void> {
  const rows = await sourceQuery<{ key: string; value: Record<string, unknown>; updated_at: Date }>(`select key, value, updated_at from poller_state`);
  const keep = rows.filter((r) => !OWN_KEY_PREFIXES.some((p) => r.key.startsWith(p)));
  if (keep.length === 0) return;
  await local().query(`
    insert into poller_state (key, value, updated_at)
    select * from unnest($1::text[], $2::jsonb[], $3::timestamptz[])
    on conflict (key) do update set value = excluded.value, updated_at = excluded.updated_at
    where poller_state.updated_at is distinct from excluded.updated_at`, [keep.map((r) => r.key), keep.map((r) => JSON.stringify(r.value)), keep.map((r) => r.updated_at)]);
}

interface SweepRow { id: string; started_at: Date; finished_at: Date | null; mode: string; host: string; requests: number; failures: number; stores_covered: number; transitions: number; duration_ms: number | null }
let sweepCursor = new Date(Date.now() - 60 * 60 * 1000);

async function mirrorSweeps(): Promise<void> {
  const rows = await sourceQuery<SweepRow>(`select id, started_at, finished_at, mode, host, requests, failures, stores_covered, transitions, duration_ms from sweeps where started_at > $1 order by started_at limit 1000`, [sweepCursor]);
  if (rows.length === 0) return;
  await local().query(`
    insert into sweeps (id, started_at, finished_at, mode, host, requests, failures, stores_covered, transitions, duration_ms)
    select * from unnest($1::text[], $2::timestamptz[], $3::timestamptz[], $4::text[], $5::text[],
                         $6::int[], $7::int[], $8::int[], $9::int[], $10::int[])
    on conflict (id) do update set finished_at = excluded.finished_at, requests = excluded.requests, failures = excluded.failures, stores_covered = excluded.stores_covered, transitions = excluded.transitions, duration_ms = excluded.duration_ms
    where sweeps.finished_at is distinct from excluded.finished_at`, [rows.map((r) => r.id), rows.map((r) => r.started_at), rows.map((r) => r.finished_at), rows.map((r) => r.mode), rows.map((r) => r.host), rows.map((r) => r.requests), rows.map((r) => r.failures), rows.map((r) => r.stores_covered), rows.map((r) => r.transitions), rows.map((r) => r.duration_ms)]);
  // Rounds still running when read are read again next time (finished_at arrives later): keep the cursor 60 s behind.
  sweepCursor = new Date(Math.max(...rows.map((r) => r.started_at.getTime())) - 60_000);
  stats.sweeps += rows.length;
}

/** The stores × parts this site's paid alerts point at, for the cluster's fast lane (FAST_TARGETS_EXPORT=1). */
async function exportFastTargets(): Promise<void> {
  const targets = await loadFastTargets();
  const pairs = [...targets].flatMap(([store, parts]) => parts.map((p) => ({ store, p })));
  const primary = sources.find((s) => s.name === "primary") ?? sources[0];
  const client = await primary.pool.connect();
  try {
    await client.query("begin");
    await client.query("delete from fast_targets_external where site = $1", [SITE_KEY]);
    if (pairs.length) {
      await client.query(
        `insert into fast_targets_external (site, store_number, part_number, updated_at) select $1, * , now() from unnest($2::text[], $3::text[])`,
        [SITE_KEY, pairs.map((x) => x.store), pairs.map((x) => x.p)],
      );
    }
    await client.query("commit");
  } catch (e) {
    await client.query("rollback").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

/* ---------------------------------------------------------------- loops */

let lastProgress = Date.now();
const started = Date.now();

function loop(name: string, everyMs: number, fn: () => Promise<void>): void {
  void (async () => {
    for (;;) {
      const t0 = Date.now();
      try {
        await fn();
        lastProgress = Date.now();
      } catch (e) {
        stats.errors++;
        console.error(`[relay:${name}] ${errorMessage(e)}`);
        await recordError("poller", `relay ${name}: ${errorMessage(e)}`, { host: HOST, source: sourceInUse }).catch(() => undefined);
        await new Promise((r) => setTimeout(r, Math.min(everyMs * 5, 30_000)));
      }
      await new Promise((r) => setTimeout(r, Math.max(100, everyMs - (Date.now() - t0))));
    }
  })();
}

async function heartbeat(): Promise<void> {
  const lagSec = stats.lastStatusAt ? Math.round((Date.now() - new Date(stats.lastStatusAt).getTime()) / 1000) : null;
  await writeState("relay:alive", {
    host: HOST, at: new Date().toISOString(), startedAt: new Date(started).toISOString(), source: sourceInUse,
    cursors: { status: statusCursor.toISOString(), eventId: eventCursor, sweeps: sweepCursor.toISOString() },
    lagSec, ...stats, node: process.version,
  });
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const d = db();
  // Start after what is already here: nothing before this moment is alerted, whatever the notifications table says.
  const maxId = (await d.execute(sql`select coalesce(max(id), 0)::bigint as id from availability_events where id < 5000000000`)).rows[0] as { id: string | number };
  eventCursor = Number(maxId.id);
  const prev = await readState<{ cursors?: { eventId?: number } }>("relay:alive").catch(() => null);
  // A restart keeps alerting from where the previous process stopped, if that is more recent than the table's max.
  if (prev?.value.cursors?.eventId && prev.value.cursors.eventId > eventCursor) eventCursor = prev.value.cursors.eventId;
  console.log(`[relay] start host=${HOST} sources=${sources.map((s) => s.name).join(",")} eventCursor=${eventCursor} status=${STATUS_EVERY_MS}ms events=${EVENTS_EVERY_MS}ms`);
  await logOps("poller", "info", "relay started", { host: HOST, eventCursor, sources: sources.map((s) => s.name), commit: process.env.COMMIT ?? null, node: process.version });

  loop("status", STATUS_EVERY_MS, mirrorStatus);
  loop("events", EVENTS_EVERY_MS, mirrorEvents);
  loop("state", STATE_EVERY_MS, mirrorState);
  loop("sweeps", SWEEPS_EVERY_MS, mirrorSweeps);
  loop("heartbeat", STATE_EVERY_MS, heartbeat);
  if (process.env.FAST_TARGETS_EXPORT === "1") loop("fast-targets", FAST_EXPORT_EVERY_MS, exportFastTargets);

  for (const sig of ["SIGTERM", "SIGINT"] as const) {
    process.on(sig, () => {
      logOps("poller", "info", `relay stopping (${sig})`, { host: HOST }).finally(() => process.exit(0));
      setTimeout(() => process.exit(0), 3000).unref();
    });
  }
  setInterval(() => {
    if (Date.now() - lastProgress < STUCK_MS) return;
    console.error(`[relay] no tick finished for ${Math.round((Date.now() - lastProgress) / 1000)} s — exiting for a restart`);
    void logOps("poller", "error", "relay stuck — restarting the process", { host: HOST }).catch(() => undefined);
    setTimeout(() => process.exit(1), 2000);
  }, 10_000);
}

main().catch((e) => { console.error(e); process.exit(1); });
