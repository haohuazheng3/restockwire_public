import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { MAX_ALERTS_PER_HOUR, SAME_BATCH_GAP_MS, batchAlreadyAlerted, batchStart, underHourlyCap } from "@/lib/stock/notify";
import { decide } from "@/lib/stock/ingest";

/**
 * 2026-11-09: a second batch of the same store × configuration alerts again. The old 30-minute cool-down held back
 * 3,386 alerts in 14 days (22 % of real restocks follow another within 30 minutes). Only a flood guard is left.
 */
describe("repeat restocks alert again", () => {
  const now = new Date("2026-11-09T06:00:00Z");
  const ago = (min: number) => new Date(now.getTime() - min * 60_000);

  it("alerts a second batch minutes after the first", () => {
    expect(underHourlyCap([ago(2)], now)).toBe(true);
    expect(underHourlyCap([ago(0.5), ago(10), ago(25)], now)).toBe(true);
  });
  it("holds only once the hourly cap is reached, and counts the last 60 minutes only", () => {
    const six = [1, 5, 12, 20, 33, 50].map(ago);
    expect(MAX_ALERTS_PER_HOUR).toBe(6);
    expect(underHourlyCap(six, now)).toBe(false);
    expect(underHourlyCap(six.slice(1), now)).toBe(true);
    expect(underHourlyCap([...six.slice(1), ago(61)], now)).toBe(true);
  });
  it("has no 30-minute cool-down left in the alert path", () => {
    const src = readFileSync("src/lib/stock/notify.ts", "utf8");
    expect(src).not.toMatch(/COOLDOWN_MS/);
    expect(src).not.toMatch(/30 \* 60 \* 1000/);
  });
});

/** 2026-11-09 (owner): one batch is one alert from start to end — never one per check, never again after a short dip. */
describe("one batch, one alert", () => {
  const t = (s: number) => new Date(Date.UTC(2026, 10, 9, 6, 0, 0) + s * 1000);

  it("a listing seen again on every 5-second check is no new event (alerts fire on transitions only)", () => {
    const prev = { status: "available" as const, quote: null, pendingStatus: null, pendingSince: null, pendingSeen: 0 };
    for (let i = 1; i <= 12; i++) expect(decide(prev, { available: true, quote: null }, t(5 * i)).commit).toBeNull();
  });
  it("a first restock starts its own batch", () => {
    expect(batchStart([], t(0))).toEqual(t(0));
    expect(batchStart([{ kind: "restock", at: t(0), seenUntil: null }], t(0))).toEqual(t(0));
  });
  it("off the shelf for under 2 minutes and back: the same batch as the listing before", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "soldout", at: t(70), seenUntil: t(55) },
      { kind: "restock", at: t(110), seenUntil: null },
    ];
    expect(SAME_BATCH_GAP_MS).toBe(120_000);
    expect(batchStart(ev, t(110))).toEqual(t(0));
  });
  it("follows several short dips back to the first listing", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "soldout", at: t(40), seenUntil: t(25) },
      { kind: "restock", at: t(90), seenUntil: null },
      { kind: "soldout", at: t(150), seenUntil: t(135) },
      { kind: "restock", at: t(200), seenUntil: null },
    ];
    expect(batchStart(ev, t(200))).toEqual(t(0));
  });
  it("back after 2 minutes or more off the shelf: a new batch", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "soldout", at: t(60), seenUntil: t(45) },
      { kind: "restock", at: t(165), seenUntil: null },
    ];
    expect(batchStart(ev, t(165))).toEqual(t(165));
    // A long gap further back ends the walk: the batch starts at the listing after it.
    const chain = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "soldout", at: t(60), seenUntil: t(45) },
      { kind: "restock", at: t(400), seenUntil: null },
      { kind: "soldout", at: t(460), seenUntil: t(445) },
      { kind: "restock", at: t(500), seenUntil: null },
    ];
    expect(batchStart(chain, t(500))).toEqual(t(400));
  });
  it("uses the sell-out time when its last-seen check is missing", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "soldout", at: t(60), seenUntil: null },
      { kind: "restock", at: t(150), seenUntil: null },
    ];
    expect(batchStart(ev, t(150))).toEqual(t(0)); // 90 s after the sell-out
  });
});

/**
 * 2026-11-10: the fast lane's own event and the relay's mirrored event for the same listing arrive seconds apart (or
 * with the same `at`); every member got two pushes for one restock (R047 16:35:23 + 16:35:29, R230 15:00:19 twice).
 */
describe("two copies of one listing alert once", () => {
  const t = (s: number) => new Date(Date.UTC(2026, 10, 10, 15, 0, 0) + s * 1000);

  it("a restock right after another with no sell-out between is the same batch", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null }, // fast lane, alerted at t(1)
      { kind: "restock", at: t(6), seenUntil: null }, // relay copy
    ];
    expect(batchStart(ev, t(6))).toEqual(t(0));
    expect(batchAlreadyAlerted(batchStart(ev, t(6)), [t(1)])).toBe(true);
  });
  it("two copies with the same time: the alert sent after it covers the second", () => {
    expect(batchAlreadyAlerted(batchStart([{ kind: "restock", at: t(0), seenUntil: null }], t(0)), [t(2)])).toBe(true);
  });
  it("duplicated listing, a short dip, back again: still the first listing's batch", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "restock", at: t(2), seenUntil: null },
      { kind: "soldout", at: t(40), seenUntil: t(35) },
      { kind: "soldout", at: t(40), seenUntil: t(35) },
      { kind: "restock", at: t(90), seenUntil: null },
    ];
    expect(batchStart(ev, t(90))).toEqual(t(0));
    expect(batchAlreadyAlerted(batchStart(ev, t(90)), [t(1)])).toBe(true);
  });
  it("a new batch after a long gap still alerts, and an alert from an older batch does not hold it", () => {
    const ev = [
      { kind: "restock", at: t(0), seenUntil: null },
      { kind: "restock", at: t(2), seenUntil: null },
      { kind: "soldout", at: t(60), seenUntil: t(55) },
      { kind: "restock", at: t(600), seenUntil: null },
    ];
    expect(batchStart(ev, t(600))).toEqual(t(600));
    expect(batchAlreadyAlerted(batchStart(ev, t(600)), [t(1)])).toBe(false);
    expect(batchAlreadyAlerted(undefined, [t(1)])).toBe(false);
  });
});

/**
 * 2026-11-12: the fast lane (linode-2/3) and the relay (linode-4) each alert their own copy of one listing within a
 * second; the second sender must see the first one's claim and skip (11-12 14:31:12.126/.308, one member, two pushes).
 */
describe("claim under the per store × part lock", () => {
  const at = (s: number) => new Date(Date.UTC(2026, 10, 12, 14, 31, 0) + s * 1000);
  const hit = (eventId: number, watchId = "w1") => ({ watchId, store: "R041", part: "MK1H4LL/A", eventId });
  const start = () => at(9);

  it("the relay copy is skipped once the fast lane's claim is recorded", async () => {
    const { pickUnalerted } = await import("@/lib/stock/notify");
    const fastClaim = [{ watchId: "w1", storeNumber: "R041", partNumber: "MK1H4LL/A", eventId: 5001000065, createdAt: at(12) }];
    expect(pickUnalerted([hit(100111666)], fastClaim, start)).toEqual([]);
  });
  it("another member, or another configuration, is still alerted", async () => {
    const { pickUnalerted } = await import("@/lib/stock/notify");
    const fastClaim = [{ watchId: "w1", storeNumber: "R041", partNumber: "MK1H4LL/A", eventId: 5001000065, createdAt: at(12) }];
    expect(pickUnalerted([hit(100111666, "w2")], fastClaim, start)).toHaveLength(1);
    expect(pickUnalerted([{ ...hit(100111666), part: "MK1E4LL/A" }], fastClaim, start)).toHaveLength(1);
  });
  it("two copies in one call are one alert, and a first alert goes out", async () => {
    const { pickUnalerted } = await import("@/lib/stock/notify");
    expect(pickUnalerted([hit(5001000065), hit(100111666)], [], start)).toEqual([hit(5001000065)]);
  });
  it("an alert for an older batch does not hold back a new one", async () => {
    const { pickUnalerted } = await import("@/lib/stock/notify");
    const old = [{ watchId: "w1", storeNumber: "R041", partNumber: "MK1H4LL/A", eventId: 1, createdAt: at(-600) }];
    expect(pickUnalerted([hit(2)], old, start)).toHaveLength(1);
  });
  it("notify.ts claims under an advisory lock before it sends", () => {
    const src = readFileSync("src/lib/stock/notify.ts", "utf8");
    expect(src).toMatch(/pg_advisory_xact_lock/);
    expect(src.indexOf("pg_advisory_xact_lock")).toBeLessThan(src.indexOf("sendPushToRows(devices"));
  });
});
