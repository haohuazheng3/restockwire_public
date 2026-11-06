import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ unstable_cache: (fn: unknown) => fn }));
vi.mock("@vercel/functions", () => ({ attachDatabasePool: () => undefined }));
vi.mock("@/components/ui/PendingLink", () => ({ PendingLink: ({ children }: { children: unknown }) => children }));
const { heatmapFrom, gapStats, streakFacts, emptyStreak, rankingFrom, leaderboardFrom, resolveScope, emptyHeatmap, emptyRanking, emptyLeaderboard } = await import("@/lib/content/wire");
const { storesOf, storeTimeZone, partNumbersFor } = await import("@/lib/apple/catalog");
const { localHourDay } = await import("@/lib/content/siteFacts");
const { renderToStaticMarkup } = await import("react-dom/server");
const { RestockHeatmap } = await import("@/components/restocks/RestockHeatmap");
const { RestockStreak } = await import("@/components/restocks/RestockStreak");
const { SellOutRanking } = await import("@/components/restocks/SellOutRanking");
const { RestockLeaderboard } = await import("@/components/restocks/RestockLeaderboard");
const { DICTS } = await import("@/lib/i18n/dict/all");

/** An instant that reads as `hour`:00 local on `date` in `tz` (searched, so DST never bites). */
function localInstant(tz: string, date: string, hour: number): string {
  let t = Date.parse(`${date}T${String(hour).padStart(2, "0")}:00:00Z`) - 14 * 3600_000;
  for (let i = 0; i < 29; i++, t += 3600_000) {
    const l = localHourDay(new Date(t).toISOString(), tz);
    if (l.date === date && l.hour === hour) return new Date(t).toISOString();
  }
  throw new Error("no instant");
}

const us = storesOf("us");
const ny = us.find((s) => s.state === "New York")!;
const ca = us.find((s) => s.state === "California")!;
const tz = (n: string) => storeTimeZone(us.find((s) => s.storeNumber === n)!);
const row = (store: typeof ny, date: string, hour: number, n = 1) => ({ storeNumber: store.storeNumber, slot: localInstant(storeTimeZone(store), date, hour), n });

describe("heatmap bucketing and thresholds", () => {
  it("reads each slot in its store's own zone (7 AM in New York and 7 AM in LA land in the same cell)", () => {
    // 2026-11-03 is a Tuesday.
    const h = heatmapFrom([row(ny, "2026-11-03", 7, 2), row(ca, "2026-11-03", 7, 1)], tz);
    expect(h.grid[2][7]).toBe(3);
    expect(h.n).toBe(3);
    expect(h.stores).toBe(2);
    expect(h.peak).toEqual({ weekday: 2, hour: 7, n: 3 });
  });
  it("states no pattern under 5 restocks or 3 days, an hour from 5 on 3 days, a weekday only over 14 days", () => {
    expect(heatmapFrom([row(ny, "2026-11-03", 7, 9), row(ny, "2026-11-04", 8, 1)], tz)).toMatchObject({ enough: false, window: null, peakWeekday: null });
    expect(heatmapFrom([row(ny, "2026-11-03", 7, 1), row(ny, "2026-11-04", 7, 1), row(ny, "2026-11-05", 7, 1)], tz).enough).toBe(false);
    const short = heatmapFrom([row(ny, "2026-11-03", 7, 2), row(ny, "2026-11-04", 8, 2), row(ny, "2026-11-05", 7, 1)], tz);
    expect(short).toMatchObject({ enough: true, peakWeekday: null, spanDays: 3 });
    expect(short.window).toMatchObject({ from: 7, to: 9, share: 1 });
    const long = heatmapFrom([row(ny, "2026-10-20", 7, 2), row(ny, "2026-10-27", 7, 2), row(ny, "2026-11-03", 7, 2)], tz);
    expect(long.spanDays).toBe(15);
    expect(long.peakWeekday).toBe(2);
  });
  it("is an empty 7 × 24 grid with nothing", () => {
    const e = emptyHeatmap();
    expect(e.grid).toHaveLength(7);
    expect(e.grid.every((r) => r.length === 24 && r.every((x) => x === 0))).toBe(true);
    expect(heatmapFrom([], tz).peak).toBeNull();
  });
});

describe("streaks", () => {
  it("measures gaps between distinct drops", () => {
    const t0 = Date.parse("2026-11-01T10:00:00Z");
    const at = (h: number) => new Date(t0 + h * 3600_000).toISOString();
    expect(gapStats([at(0), at(0), at(2), at(10), at(11)])).toEqual({ drops: 4, maxGapSec: 8 * 3600, medianGapSec: 2 * 3600 });
    expect(gapStats([at(0)])).toEqual({ drops: 1, maxGapSec: null, medianGapSec: null });
  });
  it("says how long since the last restock and which way the week went", () => {
    const now = new Date("2026-11-06T12:00:00Z");
    const s = { ...emptyStreak(), n: 4, lastAt: "2026-11-04T06:00:00Z", thisWeek: 3, lastWeek: 1 };
    expect(streakFacts(s, now)).toEqual({ sinceSec: 54 * 3600, sinceDays: 2, trend: "up" });
    expect(streakFacts({ ...s, thisWeek: 0, lastWeek: 2 }, now).trend).toBe("down");
    expect(streakFacts({ ...s, thisWeek: 0, lastWeek: 0 }, now).trend).toBeNull();
    expect(streakFacts(emptyStreak(), now)).toEqual({ sinceSec: null, sinceDays: null, trend: null });
  });
});

describe("sell-out ranking and leaderboard", () => {
  const [a, b, c] = us;
  it("ranks fastest median first, drops stores under 3 pairs and unknown stores", () => {
    const r = rankingFrom([
      { storeNumber: a.storeNumber, n: 5, medianSec: 80.4, fastestSec: 20 },
      { storeNumber: b.storeNumber, n: 3, medianSec: 45, fastestSec: 30 },
      { storeNumber: c.storeNumber, n: 2, medianSec: 10, fastestSec: 5 },
      { storeNumber: "R000", n: 9, medianSec: 1, fastestSec: 1 },
    ]);
    expect(r.map((x) => x.storeNumber)).toEqual([b.storeNumber, a.storeNumber]);
    expect(r[1].medianSec).toBe(80);
  });
  it("keeps the top stores with their share and sums regions", () => {
    const l = leaderboardFrom([{ storeNumber: ny.storeNumber, n: 6 }, { storeNumber: ca.storeNumber, n: 3 }, { storeNumber: "R000", n: 1 }], 10, 1);
    expect(l.rows).toEqual([{ storeNumber: ny.storeNumber, n: 6, share: 0.6 }]);
    expect(l.stores).toBe(2);
    expect(l.regions.map((x) => x.region)).toEqual(["New York", "California"]);
    expect(l.regions[1]).toMatchObject({ n: 3, stores: 1, share: 0.3 });
  });
});

describe("scope", () => {
  it("scopes a whole country, a place and a model", () => {
    const whole = resolveScope({ country: "us" })!;
    expect(whole.stores).toBeNull();
    expect(whole.parts!.length).toBeGreaterThan(0);
    const place = resolveScope({ storeNumbers: [ny.storeNumber, ca.storeNumber], model: "duo" })!;
    expect(place.stores).toEqual([ny.storeNumber, ca.storeNumber].sort());
    expect(place.parts).toEqual([...partNumbersFor("duo", [], [], "us")].sort());
    expect(resolveScope({ storeNumbers: [] })).toBeNull();
  });
});

describe("components render through the JSON data cache and are never empty", () => {
  const json = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
  it("heatmap: sentence, 168 labelled cells, the busiest named; the thin variant still draws the grid", () => {
    const rows = [row(ny, "2026-10-20", 7, 2), row(ny, "2026-10-27", 8, 2), row(ny, "2026-11-03", 7, 2)];
    const html = renderToStaticMarkup(RestockHeatmap({ data: json(heatmapFrom(rows, tz)), label: "here", stores: [ny] }));
    expect(html).toContain("Most restocks here land on <b class=\"text-ink\">Tuesdays</b>");
    expect(html).toContain("7–9 AM");
    expect((html.match(/<td /g) ?? []).length).toBe(168);
    expect(html).toContain('aria-label="Tuesday 7–8 AM: 4 restocks"');
    expect(html).toContain("busiest · Tuesday 7–8 AM · 4 restocks");
    const thin = renderToStaticMarkup(RestockHeatmap({ data: json(emptyHeatmap()), label: "here" }));
    expect(thin).toContain("No confirmed restock here in the last 14 days yet");
    expect((thin.match(/<td /g) ?? []).length).toBe(168);
  });
  it("streak: four tiles, or one line without restocks", () => {
    const now = new Date("2026-11-06T12:00:00Z");
    const s = { ...emptyStreak(), n: 9, lastAt: "2026-11-04T06:00:00Z", thisWeek: 3, lastWeek: 1, drops: 5, maxGapSec: 5 * 86400, medianGapSec: 7200 };
    const html = renderToStaticMarkup(RestockStreak({ data: json(s), label: "here", now }));
    expect(html).toContain("2 days ago");
    expect(html).toContain("5 d");
    expect(html).toContain("↑ up on last week");
    expect(renderToStaticMarkup(RestockStreak({ data: emptyStreak(), label: "here", now }))).toContain("No confirmed restock here in the last 14 days");
  });
  it("ranking and leaderboard: name the leaders; one line when there is nothing", () => {
    const ranking = { ...emptyRanking(), rows: rankingFrom([{ storeNumber: ny.storeNumber, n: 4, medianSec: 40, fastestSec: 12 }, { storeNumber: ca.storeNumber, n: 3, medianSec: 95, fastestSec: 50 }]) };
    const r = renderToStaticMarkup(SellOutRanking({ data: json(ranking), label: "in the US", storesTotal: 2 }));
    expect(r).toContain("Fastest in the US");
    expect(r).toContain("40 s");
    expect(renderToStaticMarkup(SellOutRanking({ data: emptyRanking(), label: "here", storesTotal: 3 }))).toContain("Not enough timed sell-outs here yet");
    const board = { ...emptyLeaderboard(), total: 9, ...leaderboardFrom([{ storeNumber: ny.storeNumber, n: 6 }, { storeNumber: ca.storeNumber, n: 3 }], 9) };
    const l = renderToStaticMarkup(RestockLeaderboard({ data: json(board), label: "in the US", regions: "state" }));
    expect(l).toContain("67%");
    expect(l).toContain("By state");
    expect(renderToStaticMarkup(RestockLeaderboard({ data: emptyLeaderboard(), label: "here" }))).toContain("No confirmed iPhone Duo restock here in the last 7 days.");
  });
});

describe("dictionaries", () => {
  it("every language has the wire strings with English's keys", () => {
    const keys = (o: object): string[] => Object.entries(o).flatMap(([k, v]): string[] => (v && typeof v === "object" ? keys(v).map((x: string) => `${k}.${x}`) : [k])).sort();
    const en = keys(DICTS.en.wire);
    for (const [lang, d] of Object.entries(DICTS)) expect(keys(d.wire), lang).toEqual(en);
  });
});
