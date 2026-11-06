import { NextResponse } from "next/server";
import { env, bearerOk } from "@/lib/env";
import { readState, writeState } from "@/lib/stock/sweep";
import { notifyOwner } from "@/lib/mail/owner";
import { recordError, errorMessage } from "@/lib/errors";
import { logOps } from "@/lib/ops";
import { loadFastTargets } from "@/lib/stock/fastlane";
import { countryOfStore } from "@/lib/apple/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Vercel Cron, every minute. RestockWire does not poll Apple itself: the poller cluster does, and this site gets its
 * stock through the relay (poller/relay.ts) plus its own fast lanes (poller/fast.ts) for the stores its paid alerts
 * point at. So this watchdog watches exactly those links — never the cluster's own hosts (their capacity, standby,
 * US worker: the cluster's operators are alerted by the cluster itself), and it never polls Apple from Vercel.
 *
 *  • relay   relay:alive older than RELAY_STALE_MS, or data lag over LAG_MAX_SEC → one mail, one on recovery
 *  • source  the mirrored cluster heartbeat older than SOURCE_STALE_MS → one mail (the whole stock feed is quiet)
 *  • fast    a fast lane (rwfast:us / rwfast:intl) older than FAST_STALE_MS while paid alerts point at stores in its
 *            scope → one mail, one on recovery
 * Each link mails once per episode and once when it is fine again; a reminder every REMIND_MS while it lasts.
 * The database is on the data host: when it is unreachable the mail worker's probe takes over (it keeps its own state).
 */
const RELAY_STALE_MS = 2 * 60_000;
const LAG_MAX_SEC = 180;
const SOURCE_STALE_MS = 5 * 60_000;
const FAST_STALE_MS = 3 * 60_000;
const REMIND_MS = 3 * 60 * 60_000;

interface LinkState { down: boolean; since: string | null; mailedAt: string | null }
type WatchState = Record<string, LinkState>;
const IDLE: LinkState = { down: false, since: null, mailedAt: null };

const ageOf = (s: { value: { at?: string }; updatedAt: Date } | null) => (s ? Date.now() - new Date(s.value.at ?? s.updatedAt).getTime() : Infinity);
const mins = (ms: number) => (Number.isFinite(ms) ? `${Math.round(ms / 60000)} min` : "never");

export async function GET(req: Request) {
  if (!bearerOk(req, env.cronSecret())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const [relay, source, fastUs, fastIntl, prev, targets] = await Promise.all([
      readState<{ at?: string; lagSec?: number | null; source?: string }>("relay:alive"),
      readState<{ at?: string; host?: string }>("heartbeat"),
      readState<{ at?: string; host?: string }>("rwfast:us"),
      readState<{ at?: string; host?: string }>("rwfast:intl"),
      readState<WatchState>("watchdog:rw"),
      loadFastTargets().catch(() => new Map<string, string[]>()),
    ]);
    const st: WatchState = { ...(prev?.value ?? {}) };
    const now = new Date();
    const paidUs = [...targets.keys()].some((s) => countryOfStore(s) === "us");
    const paidIntl = [...targets.keys()].some((s) => countryOfStore(s) !== "us");
    const relayAge = ageOf(relay), sourceAge = ageOf(source), usAge = ageOf(fastUs), intlAge = ageOf(fastIntl);
    const links: { key: string; bad: boolean; what: string; detail: string; fix: string }[] = [
      { key: "relay", bad: relayAge > RELAY_STALE_MS || (relay?.value.lagSec ?? 0) > LAG_MAX_SEC, what: "Stock relay", detail: `last report ${mins(relayAge)} ago, data lag ${relay?.value.lagSec ?? "?"} s, reading from ${relay?.value.source ?? "?"}`, fix: "ssh root@<data host> systemctl status restockwire-relay; journalctl -u restockwire-relay -n 50" },
      { key: "source", bad: sourceAge > SOURCE_STALE_MS, what: "Stock feed from the poller cluster", detail: `cluster heartbeat last seen ${mins(sourceAge)} ago (host ${source?.value.host ?? "?"})`, fix: "the cluster's own alerts say why; this site shows stale stock until it is back" },
      { key: "fast-us", bad: paidUs && usAge > FAST_STALE_MS, what: "US fast lane", detail: `last report ${mins(usAge)} ago from ${fastUs?.value.host ?? "?"}`, fix: "ssh root@<US poller host> systemctl status restockwire-fast" },
      { key: "fast-intl", bad: paidIntl && intlAge > FAST_STALE_MS, what: "Other-countries fast lane", detail: `last report ${mins(intlAge)} ago from ${fastIntl?.value.host ?? "?"}`, fix: "ssh root@<standby poller host> systemctl status restockwire-fast" },
    ];
    for (const l of links) {
      const s = { ...IDLE, ...(st[l.key] ?? {}) };
      if (l.bad && !s.down) {
        s.down = true; s.since = now.toISOString(); s.mailedAt = now.toISOString();
        await logOps("cron", "warn", `${l.what} down: ${l.detail}`);
        await notifyOwner(`[RestockWire] ${l.what} is down`, `${l.detail}.\n\nNext: ${l.fix}.\nOne more mail when it is back (reminders every 3 h while it lasts).`).catch(() => undefined);
      } else if (l.bad && s.down && s.mailedAt && now.getTime() - new Date(s.mailedAt).getTime() > REMIND_MS) {
        s.mailedAt = now.toISOString();
        await notifyOwner(`[RestockWire] ${l.what} still down`, `${l.detail} (down since ${s.since}).\n\nNext: ${l.fix}.`).catch(() => undefined);
      } else if (!l.bad && s.down) {
        await logOps("cron", "info", `${l.what} back: ${l.detail}`);
        await notifyOwner(`[RestockWire] ${l.what} is back`, `${l.detail} (it was down since ${s.since}).`).catch(() => undefined);
        Object.assign(s, IDLE);
      }
      st[l.key] = s;
    }
    if (JSON.stringify(st) !== JSON.stringify(prev?.value ?? {})) await writeState("watchdog:rw", st as unknown as Record<string, unknown>);
    // One debug row per run: the admin health strip proves the cron itself is alive.
    await logOps("cron", "debug", "watchdog tick", { relayAgeMs: Number.isFinite(relayAge) ? relayAge : null, sourceAgeMs: Number.isFinite(sourceAge) ? sourceAge : null, down: links.filter((l) => l.bad).map((l) => l.key) });
    return NextResponse.json({ ok: links.every((l) => !l.bad), links: links.map((l) => ({ key: l.key, bad: l.bad, detail: l.detail })) });
  } catch (e) {
    await recordError("web", `watchdog failed: ${errorMessage(e)}`).catch(() => undefined);
    await probeFromWorker();
    return NextResponse.json({ error: "watchdog failed" }, { status: 500 });
  }
}

/**
 * The database lives on the data host, so when it is unreachable this route can neither keep state nor mail on
 * schedule. The mail worker's probe checks /api/health and keeps its own down/recovery state, so it mails once.
 */
async function probeFromWorker(): Promise<void> {
  const url = env.mailWorkerUrl(), token = env.mailWorkerToken();
  if (!url || !token) return;
  await fetch(`${url.replace(/\/$/, "")}/probe`, { method: "POST", headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20_000) }).catch(() => undefined);
}
