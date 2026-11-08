import { describe, expect, it } from "vitest";
import { stockFromRows, wireNowFrom, type StockLike } from "@/lib/content/wireNow";
import { partNumbersFor, storesOf } from "@/lib/apple/catalog";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import type { Sellouts } from "@/lib/stock/sellouts";
import { STATS_DAYS } from "@/lib/stock/window";
import { dict } from "@/lib/i18n/dict";
import { LANGS } from "@/lib/i18n/locales";

/* 2026-11-08: the "On the wire · iPhone Duo {here}" bulletin every place page opens with (lib/content/wireNow.ts). */

const mi = storesOf("us").filter((s) => s.state === "Michigan");
const duo = partNumbersFor("duo");
const TZ = "America/Detroit";
const at = (h: number, m = 0) => new Date(Date.UTC(2026, 10, 7, h, m)).toISOString();
const noSell: Sellouts = { summary: { n: 0, medianSec: null, within30: 0, within60: 0, within120: 0, fastestSec: null, days: STATS_DAYS }, byModel: {}, recent: [] };
const noClock: RestockStats = { total: 0, byHour: Array(24).fill(0), byWeekday: Array(7).fill(0), days: STATS_DAYS, tz: TZ, dates: 0, spanDays: 0 };
const noStats: PlaceStats = { day: 0, week: 0, month: 0, soldouts: 0, medianMs: null, medianSamples: 0, restockStores: 0, lastRestock: null, daily: [], byPart: [], days: STATS_DAYS, tz: TZ };

function stock(opts: { duoAt?: Record<string, string[]>; checked?: string } = {}): Map<string, StockLike> {
  const map = new Map<string, StockLike>();
  for (const s of mi) {
    const parts = opts.duoAt?.[s.storeNumber] ?? [];
    map.set(s.storeNumber, { lastCheckedAt: new Date(opts.checked ?? at(9, 22)), perModel: { duo: { available: parts.length, parts }, "18-pro": { available: 14, parts: [] }, "18-pro-max": { available: 11, parts: [] } } });
  }
  return map;
}

describe("wireNowFrom", () => {
  it("says nothing is listed, names the newest listing with its lifetime, counts the window and the other models", () => {
    const byHour = Array.from({ length: 24 }, (_, h) => (h === 9 ? 18 : h === 10 ? 15 : h === 8 ? 4 : 1));
    const clock: RestockStats = { ...noClock, total: byHour.reduce((a, b) => a + b, 0), byHour, dates: 10, spanDays: 12 };
    const stats: PlaceStats = { ...noStats, month: 57, week: 20, day: 3, soldouts: 40, restockStores: 5, lastRestock: { storeNumber: mi[0].storeNumber, partNumber: duo[0], at: at(17, 23) }, byPart: [{ partNumber: duo[0], restocks: 24 }, { partNumber: duo[1], restocks: 20 }], daily: [{ day: "2026-11-07", restocks: 3, soldouts: 2 }] };
    const sell: Sellouts = { ...noSell, summary: { n: 40, medianSec: 93, within30: 0.2, within60: 0.45, within120: 0.6, fastestSec: 5, days: STATS_DAYS }, recent: [
      { id: 1, at: new Date(at(17, 23)), storeNumber: mi[0].storeNumber, partNumber: duo[0], lowSec: 300, highSec: 420, exact: true, listedSec: null },
      { id: 2, at: new Date(at(16, 26)), storeNumber: mi[1].storeNumber, partNumber: duo[1], lowSec: 240, highSec: 300, exact: true, listedSec: null },
      { id: 3, at: new Date(at(15, 0)), storeNumber: mi[1].storeNumber, partNumber: "MJW44LL/A", lowSec: 3600, highSec: 3615, exact: true, listedSec: null }, // an 18 Pro Max row: not a Duo
    ] };
    const d = wireNowFrom({ stores: mi, stock: stock(), clock, stats, sell, alerts: { days: 7, sent: 45, stores: 5 }, configsTotal: 8, now: new Date(at(9, 22)) });
    expect(d.storesTotal).toBe(6);
    expect(d.listed).toEqual([]);
    expect(d.others).toEqual({ pro: 6, max: 6 });
    expect(d.last).toMatchObject({ storeNumber: mi[0].storeNumber, partNumber: duo[0], lowSec: 300, highSec: 420 });
    expect(d.lastThree.map((r) => r.partNumber)).toEqual([duo[0], duo[1]]); // the Pro Max row is left out
    expect(d.n).toBe(57);
    expect(d.days).toBe(STATS_DAYS);
    expect(d.restockStores).toBe(5);
    expect(d.pattern).toBe(true);
    expect(d.peakHour).toBe(9);
    expect(d.peakCount).toBe(18);
    expect(d.window).toMatchObject({ from: 9, to: 11 });
    expect(d.medianSec).toBe(93);
    expect(d.within60).toBe(0.45);
    expect(d.longest7dSec).toBe(420);
    expect(d.topPart).toEqual({ partNumber: duo[0], restocks: 24 });
    expect(d.today).toBe(3);
    expect(d.alerts).toEqual({ days: 7, sent: 45, stores: 5 });
    expect(d.checkedAt).toBe(at(9, 22));
    expect(d.zones).toEqual([TZ]);
  });
  it("lists the stores with stock, most configurations first; no pattern and no sell-out figures under the thresholds", () => {
    const clock: RestockStats = { ...noClock, total: 4, byHour: Array.from({ length: 24 }, (_, h) => (h === 9 ? 4 : 0)), dates: 2, spanDays: 2 };
    const stats: PlaceStats = { ...noStats, month: 4, lastRestock: { storeNumber: mi[2].storeNumber, partNumber: duo[2], at: at(18, 0) } };
    const sell: Sellouts = { ...noSell, summary: { ...noSell.summary, n: 4, medianSec: 50, within60: 0.75 } };
    const d = wireNowFrom({ stores: mi, stock: stock({ duoAt: { [mi[3].storeNumber]: [duo[0]], [mi[4].storeNumber]: [duo[0], duo[1], duo[2]] } }), clock, stats, sell, configsTotal: 8 });
    expect(d.listed.map((x) => [x.storeNumber, x.configs])).toEqual([[mi[4].storeNumber, 3], [mi[3].storeNumber, 1]]);
    expect(d.last).toMatchObject({ storeNumber: mi[2].storeNumber, at: at(18, 0), highSec: null });
    expect(d.lastThree).toEqual([]);
    expect(d.pattern).toBe(false);
    expect(d.medianSec).toBeNull(); // under 10 timed sell-outs
    expect(d.within60).toBeNull();
    expect(d.longest7dSec).toBeNull();
  });
  it("a single store counts its configurations for the other models; a country page's rows build the stock map", () => {
    const one = [mi[0]];
    const d = wireNowFrom({ stores: one, stock: stock(), clock: noClock, stats: noStats, sell: noSell, configsTotal: 8 });
    expect(d.others).toEqual({ pro: 14, max: 11 });
    const map = stockFromRows([{ storeNumber: mi[0].storeNumber, availableParts: [duo[0]], lastCheckedAt: new Date(at(1)) } as never]);
    const e = wireNowFrom({ stores: mi, stock: map, others: { pro: 200, max: 190 }, clock: noClock, stats: noStats, sell: noSell, configsTotal: 8 });
    expect(e.listed).toEqual([{ storeNumber: mi[0].storeNumber, configs: 1, parts: [duo[0]] }]);
    expect(e.others).toEqual({ pro: 200, max: 190 });
    expect(e.checkedAt).toBe(at(1));
  });
});

describe("the bulletin's strings exist in every language and carry their numbers", () => {
  it("summary, verdicts and tiles", () => {
    for (const lang of LANGS) {
      const w = dict(lang).modules.wireNow;
      const summary = w.summary({ range: "R", zone: "Z", pct: "58%", n: 57, stores: 6, label: "X", days: 14, busiest: "B", busiestN: 18, config: "C", k: 24, median: "M", one: false });
      for (const piece of ["58%", "57", "X", "R", "B", "18", "M", "C", "24", "14"]) expect(summary, `${lang} summary lacks ${piece}`).toContain(piece);
      expect(w.tooFew({ n: 3, label: "X", days: 14, one: false, stores: 6 }), lang).toMatch(/3/);
      expect(w.alerts({ sent: 45, stores: 5, total: 6, days: 7, label: "X", one: false }), lang).toMatch(/45/);
      expect(w.zone("America/New_York"), lang).toMatch(/\S/);
      expect(w.secs(45), lang).toMatch(/45/);
      expect(w.mins(5), lang).toMatch(/5/);
      expect(w.tRestocks(14), lang).toMatch(/14/);
      expect(w.allModels({ n: 456, days: 14, peak: "P" }), lang).toMatch(/456/);
      expect(dict(lang).content.statStrip.scoped("A", "Duo"), lang).toContain("Duo");
      expect(dict(lang).pages.common.whenDuoRestocks("X"), lang).toContain("X");
      expect(dict(lang).pages.store.whenDuoRestocks("Y"), lang).toContain("Y");
    }
  });
  it("English opens with the window, names RestockWire and groups thousands; no sentence is the sister site's", () => {
    const w = dict("en").modules.wireNow;
    const s = w.summary({ range: "9–11 AM", zone: "store local time", pct: "58%", n: 3891, stores: 269, label: "in the US", days: 14, busiest: "9–10 AM", busiestN: 1481, config: "512GB Star White", k: 1110, median: "about 75 seconds", one: false });
    expect(s).toBe("9 to 11 AM store local time is when the iPhone Duo comes back in the US: that window took 58% of the 3,891 restocks RestockWire logged across 269 stores in the US over the last 14 days. Peak hour 9–10 AM, 1,481 restocks. The 512GB Star White led the log (1,110 of 3,891). Median listing: gone in about 75 seconds.");
    expect(s).not.toMatch(/PickupChecker|since tracking began|confirmed at the/);
    expect(w.eyebrow("in Michigan")).toBe("The iPhone Duo wire in Michigan");
    expect(w.method).not.toMatch(/two checks agree/);
  });
  it("the stat-strip tile label does not put a tilde before 'under a minute'", () => {
    const d = dict("en").content.statStrip;
    expect(d.stays("under a minute")).toBe("stays under a minute");
    expect(d.stays("3 min")).toBe("stays ~3 min");
    expect(d.scoped("Restocks, 24 h", "Duo")).toBe("Duo · Restocks, 24 h");
  });
});
