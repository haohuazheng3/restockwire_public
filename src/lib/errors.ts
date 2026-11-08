import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db, hasDatabase, schema } from "./db";

/**
 * Error inbox: every failure the site or poller hits is grouped by fingerprint and counted,
 * so the admin dashboard shows "what is broken, how often, since when" instead of raw logs.
 */
export async function recordError(
  source: "web" | "poller" | "worker",
  message: string,
  sample?: Record<string, unknown>,
): Promise<void> {
  try {
    console.error(`[${source}] ${message}`, sample ? JSON.stringify(sample).slice(0, 2000) : "");
    if (!hasDatabase()) return;
    const normalized = errorFingerprintText(message);
    const fingerprint = createHash("sha1").update(`${source}:${normalized}`).digest("hex").slice(0, 24);
    await db()
      .insert(schema.errorGroups)
      .values({ fingerprint, source, message: message.slice(0, 1000), sample: sample ?? null, count: 1 })
      .onConflictDoUpdate({
        target: schema.errorGroups.fingerprint,
        set: {
          count: sql`${schema.errorGroups.count} + 1`,
          lastSeenAt: new Date(),
          sample: sample ?? null,
          resolvedAt: null,
        },
      });
  } catch (e) {
    console.error("[errors] failed to record error", e);
  }
}

/**
 * The text an error group is keyed on. Numbers become "#", and IP addresses become "<ip>" first:
 * poller messages carry a random IPv6 source address per request, and hex groups survive the digit
 * pass, so one network blip on 2026-11-05 (≈130 requests) opened ≈130 separate error groups.
 */
export function errorFingerprintText(message: string): string {
  return message
    .replace(/(?<![\w:])[0-9a-f]{0,4}(?::[0-9a-f]{0,4}){2,7}(?::\d+)?(?![\w:])/gi, "<ip>")
    .replace(/\b\d{1,3}(?:\.\d{1,3}){3}(?::\d+)?\b/g, "<ip>")
    .replace(/\d+/g, "#")
    .slice(0, 300);
}

/**
 * Browser reports that say nothing about this site. The error inbox fails /api/health while a group is open and the
 * probe then mails the owner, so these must not open groups at all (2026-11-08: one visitor's Brave Wallet opened
 * five groups during checkout and the site read "down" for two hours):
 *  • "Script error." — the browser hides the message and stack of a script from another origin (extensions, wallet
 *    injections). The reporter wraps it in a new Error, so its only frame is the reporter itself.
 *  • wallet / extension globals (window.ethereum, solana, phantom…) that an injected script failed to set up.
 *  • a bare network loss with no frame of our own: Safari's "Load failed", Chrome's "Failed to fetch", Firefox's
 *    "NetworkError…" — the connection dropped or the page was left mid-request. With a frame of ours it is kept.
 */
export function isBrowserNoise(name: string, message: string, stack: string): boolean {
  const m = message.trim();
  if (/^Script error\.?$/i.test(m)) return true;
  // Nothing on this site is called ethereum/solana/…: any report naming them is a wallet extension talking to itself.
  if (/\b(ethereum|solana|phantom|keplr|tronWeb|BinanceChain|MetaMask|coinbaseWallet)\b/i.test(m)) return true;
  const ownFrame = stack.split("\n").some((l) => /restockwire\.com|\/_next\//.test(l) && !/global code@/.test(l));
  if (!ownFrame && /^TypeError$/i.test(name) && /^(Load failed|Failed to fetch|NetworkError when attempting to fetch resource\.?|The network connection was lost\.?|cancelled|The request timed out\.?)$/i.test(m)) return true;
  return false;
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) {
    // Drizzle wraps driver errors as "Failed query: <sql>"; the reason lives in .cause — put it first.
    const cause = (e as { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message && !e.message.includes(cause.message)) {
      const head = e.message.startsWith("Failed query:") ? "Failed query" : e.message;
      return `${head}: ${cause.message}${e.message.startsWith("Failed query:") ? ` — ${e.message.slice(14, 160)}` : ""}`;
    }
    return e.message;
  }
  return typeof e === "string" ? e : JSON.stringify(e);
}
