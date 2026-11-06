/**
 * RestockWire fast lane — a small, separate process that runs on the poller cluster's hosts next to (never inside)
 * their own poller, under its own systemd unit with hard CPU and memory caps (restockwire-fast.service):
 *
 *  • every FAST_CADENCE_SEC (5) it asks Apple about each store this site's paid alerts point at (loadFastTargets on
 *    this site's database), one request per store with only the watched configurations — the same fast round the
 *    poller uses (stock/fastlane.ts: ingest, instant confirm ~1 s later, alerts through notifyRestocks);
 *  • FAST_SCOPE picks the stores: "us" (on the US host) or "intl" (on the other countries' host);
 *  • egress: a fresh random address inside the host's routed IPv6 range per request (read-only from the host's
 *    prefix file, IPV6_PREFIX_FILE). Apple counts per address, so this never eats the host poller's budget;
 *  • everything it writes goes to THIS site's database (DATABASE_URL = the data host); nothing is written to the
 *    poller cluster's database. Local event ids live above 5,000,000,000 (migration 0015), far from mirrored ids.
 *  • a round that is mostly 541s pauses the lane for 60 s; a round never overlaps the next.
 */
import "dotenv/config";
import os from "node:os";
import { readFileSync } from "node:fs";
import { Agent, fetch as undiciFetch } from "undici";
import { loadFastTargets, runFastRound } from "../src/lib/stock/fastlane";
import { countryOfStore } from "../src/lib/apple/catalog";
import type { Egress } from "../src/lib/stock/sweep";
import { writeState } from "../src/lib/stock/sweep";
import type { FetchLike } from "../src/lib/apple/client";
import { errorMessage, recordError } from "../src/lib/errors";
import { logOps } from "../src/lib/ops";
import { prefixFromInterfaces, randomAddressIn } from "./ipv6";

const HOST = process.env.HOST_LABEL || os.hostname();
const SCOPE = (process.env.FAST_SCOPE || "us") as "us" | "intl";
const CADENCE_SEC = Number(process.env.FAST_CADENCE_SEC) || 5;
const CONCURRENCY = Number(process.env.FAST_CONCURRENCY) || 6;
const TIMEOUT_MS = Number(process.env.FAST_TIMEOUT_MS) || 4500;

function prefix(): string {
  const v = process.env.IPV6_PREFIX || "auto";
  if (v !== "auto") return v;
  const file = process.env.IPV6_PREFIX_FILE || "/opt/restockwire/ipv6-prefix";
  try {
    const s = readFileSync(file, "utf8").trim();
    if (/^[0-9a-f:]+\/\d{1,3}$/i.test(s)) return s;
  } catch { /* fall through */ }
  return prefixFromInterfaces(os.networkInterfaces());
}

function fetchBoundTo(localAddress: string): FetchLike {
  // localAddress must be a top-level Agent option (inside `connect` undici ignores it).
  const agent = new Agent({ localAddress, connect: { family: 6, timeout: 10_000 }, keepAliveTimeout: 1_000 });
  return async (url, init) => {
    const res = await undiciFetch(url, { headers: init.headers, signal: init.signal, dispatcher: agent });
    return { status: res.status, text: () => res.text() };
  };
}

class Ipv6Egress implements Egress {
  name = "ipv6";
  constructor(private p: string) {}
  async acquire() {
    const addr = randomAddressIn(this.p);
    return { fetch: fetchBoundTo(addr), label: `ipv6:${addr}`, release: () => undefined };
  }
}

const stats = { scope: SCOPE, rounds: 0, requests: 0, failures: 0, throttled: 0, transitions: 0, confirmed: 0, sent: 0, stores: 0, pairs: 0, lastAt: null as string | null, lastDurationMs: 0, errors: 0, paused: false };

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL missing");
  const p = prefix();
  if (!p) throw new Error("no IPv6 prefix: the fast lane needs the host's routed range");
  const egress = new Ipv6Egress(p);
  console.log(`[rw-fast] start host=${HOST} scope=${SCOPE} cadence=${CADENCE_SEC}s concurrency=${CONCURRENCY} prefix=${p}`);
  await logOps("poller", "info", "restockwire fast lane started", { host: HOST, scope: SCOPE, cadenceSec: CADENCE_SEC, prefix: p });
  for (const sig of ["SIGTERM", "SIGINT"] as const) process.on(sig, () => process.exit(0));

  let targets = new Map<string, string[]>(), targetsAt = 0, backoffUntil = 0, lastErrorLog = 0, lastBeat = 0;
  for (;;) {
    const t0 = Date.now();
    try {
      stats.paused = Date.now() < backoffUntil;
      if (!stats.paused) {
        if (Date.now() - targetsAt > 60_000) { targets = await loadFastTargets(); targetsAt = Date.now(); }
        const mine = new Map([...targets].filter(([store]) => (countryOfStore(store) === "us") === (SCOPE === "us")));
        stats.stores = mine.size; stats.pairs = [...mine.values()].reduce((a, x) => a + x.length, 0);
        if (mine.size > 0) {
          const r = await runFastRound({ egress, targets: mine, concurrency: CONCURRENCY, timeoutMs: TIMEOUT_MS });
          stats.rounds++; stats.requests += r.requests; stats.failures += r.failures; stats.throttled += r.throttled;
          stats.transitions += r.transitions; stats.confirmed += r.confirmed; stats.sent += r.notified.sent;
          stats.lastAt = new Date().toISOString(); stats.lastDurationMs = r.durationMs;
          if (r.transitions || r.confirmed) console.log(`[rw-fast] req=${r.requests} fail=${r.failures} 541=${r.throttled} trans=${r.transitions} confirmed=${r.confirmed} ${r.durationMs}ms`);
          if (r.requests >= 4 && r.throttled / r.requests >= 0.5) {
            backoffUntil = Date.now() + 60_000;
            await logOps("poller", "warn", `restockwire fast lane throttled (${r.throttled}/${r.requests}) — pausing 60 s`, { host: HOST, scope: SCOPE });
          }
        }
      }
      if (Date.now() - lastBeat > 10_000) { lastBeat = Date.now(); await writeState(`rwfast:${SCOPE}`, { host: HOST, at: new Date().toISOString(), ...stats }); }
    } catch (e) {
      stats.errors++;
      if (Date.now() - lastErrorLog > 10 * 60_000) {
        lastErrorLog = Date.now();
        await recordError("poller", `restockwire fast lane round failed: ${errorMessage(e)}`, { host: HOST, scope: SCOPE }).catch(() => undefined);
      }
    }
    await new Promise((r) => setTimeout(r, Math.max(500, CADENCE_SEC * 1000 - (Date.now() - t0))));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
