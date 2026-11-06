/**
 * The "wire" modules — four readings of the same confirmed-restock log (availability_events, kind = 'restock',
 * first_seen = false) that the earlier site never had: a weekday × hour heatmap, streaks and droughts, a sell-out
 * speed ranking of stores, and a weekly leaderboard. One SQL statement per module per render, scoped to a country
 * (countryScope: a country's own part numbers where it has them, else its store list) and optionally to a place
 * (store list) and a model or exact parts; cached five minutes. The cache holds numbers and ISO strings only —
 * every sentence is rendered per language by the components (docs/i18n.md §7 rule 7).
 *
 * The per-store local time of the heatmap is folded here, not in SQL: restocks are bucketed to 30-minute slots in
 * SQL (every store's zone offset is a multiple of 30 minutes and a slot never straddles a DST switch), then each
 * slot is read in its store's own zone (storeTimeZone), exactly as restockTimes.ts does.
 */
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db, hasDatabase } from "../db";
import { countryOfStore, partNumbersFor, storeByNumber, storeTimeZone, type ModelKey } from "../apple/catalog";
import type { CountryCode } from "../apple/countries";
import { countryScope } from "../stock/queries";
import { recordError, errorMessage } from "../errors";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localHourDay } from "./siteFacts";
import { busiestWindow } from "./restockTimes";

/** The heatmap, streaks and ranking look back this many days; the leaderboard LEADERBOARD_DAYS. */
export const WIRE_DAYS = 30;
export const LEADERBOARD_DAYS = 7;
/** A store enters the sell-out ranking from this many timed restock → sell-out pairs. */
export const RANKING_MIN_PAIRS = 3;
/** The leaderboard keeps this many stores (components may show fewer). */
export const LEADERBOARD_SIZE = 10;

/**
 * What a module is counted over: a country (default the US, or the stores' country), optionally a place (store
 * list) and a model or exact part numbers. No stores = the whole country.
 */
export interface WireScope { storeNumbers?: string[] | null; country?: CountryCode; model?: ModelKey; parts?: string[] | null }

/** Pure: the cache arguments of a scope (sorted lists, so the same place always hits the same entry); null when the scope is empty. */
export function resolveScope(o: WireScope): { cc: CountryCode; stores: string[] | null; parts: string[] | null } | null {
  const cc = o.country ?? (o.storeNumbers?.length ? countryOfStore(o.storeNumbers[0]) : undefined) ?? "us";
  const parts = o.parts ?? (o.model ? partNumbersFor(o.model, [], [], cc) : null);
  if ((o.storeNumbers && o.storeNumbers.length === 0) || (parts && parts.length === 0)) return null;
  const scope = countryScope(cc, o.storeNumbers ?? null, parts);
  return { cc, stores: scope.stores ? [...scope.stores].sort() : null, parts: scope.parts ? [...scope.parts].sort() : null };
}

const list = (xs: string[]) => sql.join(xs.map((x) => sql`${x}`), sql`, `);
/** The SQL of a resolved scope on availability_events. */
const scopeSql = (stores: string[] | null, parts: string[] | null) => sql`${stores ? sql`and store_number in (${list(stores)})` : sql``} ${parts ? sql`and part_number in (${list(parts)})` : sql``}`;
const iso = (v: string | Date) => new Date(v).toISOString();
const argmax = (v: number[]) => v.indexOf(Math.max(...v));
const tzOfStore = (n: string): string => { const s = storeByNumber(n); return s ? storeTimeZone(s) : "UTC"; };

/* ---------------------------------------------------------------- 1. heatmap */

export interface HeatRow { storeNumber: string; slot: string; n: number }

export interface Heatmap {
  at: string;
  days: number;
  n: number;
  /** Distinct stores with a restock. */
  stores: number;
  /** Local days with at least one restock, and the span from the first to the last of them (inclusive). */
  activeDays: number;
  spanDays: number;
  /** grid[weekday 0 = Sunday][local hour 0–23]. */
  grid: number[][];
  byHour: number[];
  byWeekday: number[];
  /** The busiest cell (first of equals); null without restocks. */
  peak: { weekday: number; hour: number; n: number } | null;
  /** PATTERN_MIN restocks on PATTERN_MIN_DAYS days: a pattern may be stated. */
  enough: boolean;
  /** The busiest two-hour window of local hours [from, to) and its share of `n`; null until `enough`. */
  window: { from: number; to: number; share: number } | null;
  /** The busiest weekday; null until `enough` and WEEKDAY_MIN_SPAN days of span. */
  peakWeekday: number | null;
  /** The read failed: placeholders, not "nothing happened". */
  unknown?: boolean;
}

export function emptyHeatmap(days = WIRE_DAYS, now = new Date()): Heatmap {
  return { at: now.toISOString(), days, n: 0, stores: 0, activeDays: 0, spanDays: 0, grid: Array.from({ length: 7 }, () => Array(24).fill(0)), byHour: Array(24).fill(0), byWeekday: Array(7).fill(0), peak: null, enough: false, window: null, peakWeekday: null };
}

/** Pure: the 7 × 24 grid from 30-minute slot rows, each read in its store's own zone; thresholds as restockTimes. */
export function heatmapFrom(rows: HeatRow[], tzOf: (store: string) => string = tzOfStore, days = WIRE_DAYS, now = new Date()): Heatmap {
  const out = emptyHeatmap(days, now);
  const dates = new Set<string>();
  const stores = new Set<string>();
  for (const r of rows) {
    if (r.n <= 0) continue;
    const { hour, weekday, date } = localHourDay(r.slot, tzOf(r.storeNumber));
    out.grid[weekday][hour] += r.n;
    out.byHour[hour] += r.n;
    out.byWeekday[weekday] += r.n;
    out.n += r.n;
    dates.add(date);
    stores.add(r.storeNumber);
  }
  const sorted = [...dates].sort();
  out.stores = stores.size;
  out.activeDays = sorted.length;
  out.spanDays = sorted.length ? Math.round((Date.parse(sorted[sorted.length - 1]) - Date.parse(sorted[0])) / 86400_000) + 1 : 0;
  if (out.n > 0) {
    let best = { weekday: 0, hour: 0, n: -1 };
    for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) if (out.grid[d][h] > best.n) best = { weekday: d, hour: h, n: out.grid[d][h] };
    out.peak = best;
  }
  out.enough = out.n >= PATTERN_MIN && out.activeDays >= PATTERN_MIN_DAYS;
  out.window = out.enough ? busiestWindow(out.byHour) : null;
  out.peakWeekday = out.enough && out.spanDays >= WEEKDAY_MIN_SPAN ? argmax(out.byWeekday) : null;
  return out;
}

const cachedHeatmap = unstable_cache(
  async (stores: string[] | null, parts: string[] | null, days: number): Promise<Heatmap> => {
    // One grouped read: rows ≈ (store, half hour) pairs with a restock — a burst of eight configurations is one row.
    const res = await db().execute(sql`
      select store_number, date_bin('30 minutes', at, timestamp with time zone '2026-01-01 00:00:00+00') as slot, count(*)::int as n
      from availability_events
      where not first_seen and kind = 'restock' and at > now() - make_interval(days => ${days}) ${scopeSql(stores, parts)}
      group by 1, 2`);
    const rows = (res.rows as { store_number: string; slot: string | Date; n: number }[]).map((r): HeatRow => ({ storeNumber: r.store_number, slot: iso(r.slot), n: Number(r.n) }));
    return heatmapFrom(rows, tzOfStore, days, new Date());
  },
  ["wire-heatmap-v1"],
  { revalidate: 300 },
);

/** Confirmed restocks of the scope over the last 30 days as a local weekday × hour grid; placeholders flagged `unknown` on a failed read. */
export async function restockHeatmap(o: WireScope = {}): Promise<Heatmap> {
  const s = resolveScope(o);
  if (!hasDatabase() || !s) return emptyHeatmap();
  try {
    return await cachedHeatmap(s.stores, s.parts, WIRE_DAYS);
  } catch (e) {
    await recordError("web", `wire heatmap: ${errorMessage(e)}`).catch(() => undefined);
    return { ...emptyHeatmap(), unknown: true };
  }
}

/* ---------------------------------------------------------------- 2. streaks and droughts */

export interface Streak {
  at: string;
  days: number;
  /** Confirmed restocks in the window. */
  n: number;
  lastAt: string | null;
  firstAt: string | null;
  /** The last 7 days, and the 7 before them. */
  thisWeek: number;
  lastWeek: number;
  /** Restock "drops": distinct half hours with at least one restock. Gaps are measured between drops. */
  drops: number;
  /** Longest and median gap between consecutive drops, seconds; null under two drops. */
  maxGapSec: number | null;
  medianGapSec: number | null;
  unknown?: boolean;
}

export function emptyStreak(days = WIRE_DAYS, now = new Date()): Streak {
  return { at: now.toISOString(), days, n: 0, lastAt: null, firstAt: null, thisWeek: 0, lastWeek: 0, drops: 0, maxGapSec: null, medianGapSec: null };
}

export type Trend = "up" | "down" | "flat";

/** Pure: what the streak tiles say at render time — seconds since the last restock and this week against last. */
export function streakFacts(s: Streak, now = new Date()): { sinceSec: number | null; sinceDays: number | null; trend: Trend | null } {
  const sinceSec = s.lastAt ? Math.max(0, Math.round((now.getTime() - Date.parse(s.lastAt)) / 1000)) : null;
  const sinceDays = sinceSec == null ? null : Math.floor(sinceSec / 86400);
  const trend: Trend | null = s.thisWeek === 0 && s.lastWeek === 0 ? null : s.thisWeek > s.lastWeek ? "up" : s.thisWeek < s.lastWeek ? "down" : "flat";
  return { sinceSec, sinceDays, trend };
}

/** Pure: gaps between consecutive drops (ISO half-hour slots, any order) → the longest and the median, seconds. The SQL does the same. */
export function gapStats(slots: string[]): { drops: number; maxGapSec: number | null; medianGapSec: number | null } {
  const t = [...new Set(slots.map((s) => Date.parse(s)))].sort((a, b) => a - b);
  if (t.length < 2) return { drops: t.length, maxGapSec: null, medianGapSec: null };
  const gaps = t.slice(1).map((x, i) => (x - t[i]) / 1000).sort((a, b) => a - b);
  const mid = gaps.length % 2 ? gaps[(gaps.length - 1) / 2] : (gaps[gaps.length / 2 - 1] + gaps[gaps.length / 2]) / 2;
  return { drops: t.length, maxGapSec: gaps[gaps.length - 1], medianGapSec: mid };
}

const cachedStreak = unstable_cache(
  async (stores: string[] | null, parts: string[] | null, days: number): Promise<Streak> => {
    // One statement, one row: the window's restocks once (CTE materialised), then counts, the two weeks and the
    // gaps between distinct half hours (a drop of eight configurations is one event, not eight gaps of 0 s).
    const res = await db().execute(sql`
      with r as (
        select at, date_bin('30 minutes', at, timestamp with time zone '2026-01-01 00:00:00+00') as slot
        from availability_events
        where not first_seen and kind = 'restock' and at > now() - make_interval(days => ${days}) ${scopeSql(stores, parts)}
      ), d as (
        select slot, extract(epoch from slot - lag(slot) over (order by slot))::float8 as gap
        from (select distinct slot from r) s
      )
      select (select count(*)::int from r) as n,
             (select max(at) from r) as last_at,
             (select min(at) from r) as first_at,
             (select count(*)::int from r where at > now() - interval '7 days') as this_week,
             (select count(*)::int from r where at <= now() - interval '7 days' and at > now() - interval '14 days') as last_week,
             (select count(*)::int from d) as drops,
             (select max(gap) from d) as max_gap,
             (select percentile_cont(0.5) within group (order by gap) from d where gap is not null) as median_gap`);
    const r = res.rows[0] as { n: number; last_at: string | Date | null; first_at: string | Date | null; this_week: number; last_week: number; drops: number; max_gap: number | null; median_gap: number | null } | undefined;
    const out = emptyStreak(days, new Date());
    if (!r) return out;
    const num = (v: unknown): number | null => (v == null || !Number.isFinite(Number(v)) ? null : Number(v));
    return { ...out, n: Number(r.n), lastAt: r.last_at ? iso(r.last_at) : null, firstAt: r.first_at ? iso(r.first_at) : null, thisWeek: Number(r.this_week), lastWeek: Number(r.last_week), drops: Number(r.drops), maxGapSec: num(r.max_gap), medianGapSec: num(r.median_gap) };
  },
  ["wire-streak-v1"],
  { revalidate: 300 },
);

/** Streaks and droughts of the scope over the last 30 days (counts, last restock, gaps between drops); `unknown` on a failed read. */
export async function restockStreak(o: WireScope = {}): Promise<Streak> {
  const s = resolveScope(o);
  if (!hasDatabase() || !s) return emptyStreak();
  try {
    return await cachedStreak(s.stores, s.parts, WIRE_DAYS);
  } catch (e) {
    await recordError("web", `wire streak: ${errorMessage(e)}`).catch(() => undefined);
    return { ...emptyStreak(), unknown: true };
  }
}

/* ---------------------------------------------------------------- 3. sell-out speed ranking */

export interface RankRow {
  storeNumber: string;
  /** Timed restock → sell-out pairs in the window. */
  n: number;
  /** Median and fastest "gone by" (restock `at` to the sell-out's `at`: an upper bound, as sellouts.ts counts), seconds. */
  medianSec: number;
  fastestSec: number;
}

export interface SelloutRanking {
  at: string;
  days: number;
  minPairs: number;
  /** Fastest median first; only stores with `minPairs` pairs or more. */
  rows: RankRow[];
  unknown?: boolean;
}

export function emptyRanking(days = WIRE_DAYS, now = new Date()): SelloutRanking {
  return { at: now.toISOString(), days, minPairs: RANKING_MIN_PAIRS, rows: [] };
}

/** Pure: the ranking from per-store aggregates — stores under `minPairs` out, fastest median first, more pairs break a tie. */
export function rankingFrom(rows: RankRow[], minPairs = RANKING_MIN_PAIRS): RankRow[] {
  return rows
    .filter((r) => r.n >= minPairs && Number.isFinite(r.medianSec) && storeByNumber(r.storeNumber))
    .map((r) => ({ ...r, medianSec: Math.round(r.medianSec), fastestSec: Math.round(r.fastestSec) }))
    .sort((a, b) => a.medianSec - b.medianSec || b.n - a.n || a.storeNumber.localeCompare(b.storeNumber));
}

const cachedRanking = unstable_cache(
  async (stores: string[] | null, parts: string[] | null, days: number, minPairs: number): Promise<SelloutRanking> => {
    // The same pairing as lib/stock/sellouts.ts: a restock's life ends at the next event of the same store × part
    // when that is a sell-out (lead() over the pair's events), aggregated per store in SQL — one row per store.
    const res = await db().execute(sql`
      with e as (
        select store_number, at, kind,
               lead(kind) over w as next_kind, lead(at) over w as next_at
        from availability_events
        where not first_seen and at > now() - make_interval(days => ${days}) ${scopeSql(stores, parts)}
        window w as (partition by store_number, part_number order by at)
      )
      select store_number, count(*)::int as n,
             percentile_cont(0.5) within group (order by extract(epoch from next_at - at))::float8 as median_sec,
             min(extract(epoch from next_at - at))::float8 as fastest_sec
      from e where kind = 'restock' and next_kind = 'soldout'
      group by store_number having count(*) >= ${minPairs}`);
    const rows = (res.rows as { store_number: string; n: number; median_sec: number; fastest_sec: number }[]).map((r): RankRow => ({ storeNumber: r.store_number, n: Number(r.n), medianSec: Number(r.median_sec), fastestSec: Number(r.fastest_sec) }));
    return { ...emptyRanking(days, new Date()), minPairs, rows: rankingFrom(rows, minPairs) };
  },
  ["wire-ranking-v1"],
  { revalidate: 300 },
);

/** The scope's stores ranked by how fast their restocks sold out over the last 30 days (default: the iPhone Duo); `unknown` on a failed read. */
export async function selloutRanking(o: WireScope = {}): Promise<SelloutRanking> {
  const s = resolveScope({ model: "duo", ...o });
  if (!hasDatabase() || !s) return emptyRanking();
  try {
    return await cachedRanking(s.stores, s.parts, WIRE_DAYS, RANKING_MIN_PAIRS);
  } catch (e) {
    await recordError("web", `wire ranking: ${errorMessage(e)}`).catch(() => undefined);
    return { ...emptyRanking(), unknown: true };
  }
}

/* ---------------------------------------------------------------- 4. weekly leaderboard */

export interface LeaderRow { storeNumber: string; n: number; /** Of every confirmed restock in the scope and window (0–1). */ share: number }

export interface Leaderboard {
  at: string;
  days: number;
  /** Every confirmed restock in the scope and window, and the distinct stores with one. */
  total: number;
  stores: number;
  /** Most restocks first, at most LEADERBOARD_SIZE. */
  rows: LeaderRow[];
  /** Every region (US state, province…) with a restock, most first: the same count by the stores' region. */
  regions: RegionLeaderRow[];
  unknown?: boolean;
}

export interface RegionLeaderRow { region: string; n: number; share: number; /** Stores of the region with a restock. */ stores: number }

export function emptyLeaderboard(days = LEADERBOARD_DAYS, now = new Date()): Leaderboard {
  return { at: now.toISOString(), days, total: 0, stores: 0, rows: [], regions: [] };
}

/** Pure: the top `limit` stores with their share of `total`, and every region's sum (stores the catalogue no longer has are dropped). */
export function leaderboardFrom(rows: { storeNumber: string; n: number }[], total: number, limit = LEADERBOARD_SIZE): Pick<Leaderboard, "rows" | "stores" | "regions"> {
  const known = rows.filter((r) => r.n > 0 && storeByNumber(r.storeNumber));
  const top = [...known].sort((a, b) => b.n - a.n || a.storeNumber.localeCompare(b.storeNumber)).slice(0, limit);
  const share = (n: number) => (total > 0 ? n / total : 0);
  const byRegion = new Map<string, { n: number; stores: number }>();
  for (const r of known) { const name = storeByNumber(r.storeNumber)!.state; const a = byRegion.get(name) ?? { n: 0, stores: 0 }; a.n += r.n; a.stores++; byRegion.set(name, a); }
  const regions = [...byRegion.entries()].map(([region, a]) => ({ region, n: a.n, stores: a.stores, share: share(a.n) })).sort((a, b) => b.n - a.n || a.region.localeCompare(b.region));
  return { stores: known.length, rows: top.map((r) => ({ storeNumber: r.storeNumber, n: r.n, share: share(r.n) })), regions };
}

const cachedLeaderboard = unstable_cache(
  async (stores: string[] | null, parts: string[] | null, days: number, limit: number): Promise<Leaderboard> => {
    // Grouping sets: one row per store and one grand-total row (store_number null) in the same read.
    const res = await db().execute(sql`
      select store_number, count(*)::int as n
      from availability_events
      where not first_seen and kind = 'restock' and at > now() - make_interval(days => ${days}) ${scopeSql(stores, parts)}
      group by grouping sets ((store_number), ())`);
    const rows = res.rows as { store_number: string | null; n: number }[];
    const total = Number(rows.find((r) => r.store_number == null)?.n ?? 0);
    const perStore = rows.filter((r): r is { store_number: string; n: number } => r.store_number != null).map((r) => ({ storeNumber: r.store_number, n: Number(r.n) }));
    return { ...emptyLeaderboard(days, new Date()), total, ...leaderboardFrom(perStore, total, limit) };
  },
  ["wire-leaderboard-v2"],
  { revalidate: 300 },
);

/** The scope's stores with the most confirmed restocks over the last 7 days (default: the iPhone Duo), with shares; `unknown` on a failed read. */
export async function restockLeaderboard(o: WireScope = {}): Promise<Leaderboard> {
  const s = resolveScope({ model: "duo", ...o });
  if (!hasDatabase() || !s) return emptyLeaderboard();
  try {
    return await cachedLeaderboard(s.stores, s.parts, LEADERBOARD_DAYS, LEADERBOARD_SIZE);
  } catch (e) {
    await recordError("web", `wire leaderboard: ${errorMessage(e)}`).catch(() => undefined);
    return { ...emptyLeaderboard(), unknown: true };
  }
}
