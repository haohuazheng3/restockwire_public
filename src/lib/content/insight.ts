/**
 * Data for RestockWire's own page families (2026-11-07, owner: "以独特与旧网站… 我网站覆盖的每个语言都做"), none of
 * which the sister site has:
 *
 *  1. Apple pickup status — is Apple's in-store pickup lookup answering in a country right now, and how did it do over
 *     the last 24 hours (lane failure rate per hour from `sweeps`, per-store freshness from `store_sku_status`).
 *  2. Weekly restock reports — one dated edition per country and week (Monday–Sunday in the country's reference
 *     zone): restocks, stores, configurations, days, the week before, sell-out speed.
 *  3. Fastest-selling Apple Stores — the sell-out ranking (wire.ts) over STATS_DAYS, with each store's restock count.
 *  4. Store vs store — two Apple Stores of one city side by side (each store and its nearest neighbour in the city).
 *
 * Numbers and ISO strings only; every sentence is written per language by the dictionaries (dict/<lang>/insight.tsx).
 * Cached a minute (status) to five minutes (the rest).
 */
import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db, hasDatabase } from "../db";
import { PART_INDEX, modelKeyFor, storesOf, type ModelKey, type Store } from "../apple/catalog";
import { COUNTRIES, type CountryCode } from "../apple/countries";
import { countryScope } from "../stock/queries";
import { recordError, errorMessage } from "../errors";
import { STATS_DAYS } from "../stock/window";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US } from "./siteFacts";

const list = (xs: string[]) => sql.join(xs.map((x) => sql`${x}`), sql`, `);
const scopeSql = (stores: string[] | null, parts: string[] | null) => sql`${stores ? sql`and store_number in (${list(stores)})` : sql``} ${parts ? sql`and part_number in (${list(parts)})` : sql``}`;
const iso = (v: string | Date) => new Date(v).toISOString();
const median = (v: number[]): number | null => {
  if (!v.length) return null;
  const s = [...v].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

async function guarded<T>(what: string, fallback: T, run: () => Promise<T>): Promise<T> {
  if (!hasDatabase()) return fallback;
  try {
    return await run();
  } catch (e) {
    await recordError("web", `insight ${what}: ${errorMessage(e)}`).catch(() => undefined);
    return fallback;
  }
}

/** The three phone guides (components/pages/insight/GuidePage.tsx): English at the root, one per native version. */
export const GUIDE_SLUGS = { watch: "restock-alerts-on-apple-watch", focus: "restock-alerts-in-focus-mode", android: "restock-alerts-on-android" } as const;

/* ================================================================ 1. Apple pickup status */

/** A store counts as answered when its newest check is younger than this. */
export const FRESH_SEC = 60;

export interface LaneHour { hour: string; requests: number; failures: number }
export type StatusVerdict = "ok" | "slow" | "down" | "unknown";
export interface PickupStatus {
  at: string;
  cc: CountryCode;
  stores: number;
  /** Stores whose newest check is under FRESH_SEC old. */
  answered: number;
  /** Stores with no check at all yet (Apple has never answered for them, e.g. no pickup lookups offered). */
  never: number;
  medianAgeSec: number | null;
  oldestAgeSec: number | null;
  /** The last 24 hours of the lane that covers this country (the US lane or the international lane), oldest first. */
  hours: LaneHour[];
  /** Requests and failures in the last 60 minutes of that lane. */
  lastHour: { requests: number; failures: number };
  /** Hours in the window with 5 % or more failed requests. */
  rough: LaneHour[];
  verdict: StatusVerdict;
  unknown?: boolean;
}

/** Pure: the verdict from freshness and the last hour's failure rate. */
export function statusVerdict(answered: number, offered: number, lastHour: { requests: number; failures: number }): StatusVerdict {
  if (offered <= 0) return "unknown";
  const share = answered / offered;
  const fail = lastHour.requests ? lastHour.failures / lastHour.requests : 0;
  if (share < 0.5) return "down";
  if (share < 0.9 || fail >= 0.05) return "slow";
  return "ok";
}

/** Pure: hours with a failure rate of 5 % or more (and at least 20 requests). */
export function roughHours(hours: LaneHour[]): LaneHour[] {
  return hours.filter((h) => h.requests >= 20 && h.failures / h.requests >= 0.05);
}

const cachedStatus = unstable_cache(
  async (cc: CountryCode): Promise<PickupStatus> => {
    const stores = storesOf(cc).map((s) => s.storeNumber);
    const now = Date.now();
    const fresh = (await db().execute(sql`
      select store_number, max(last_checked_at) as last
      from store_sku_status where store_number in (${list(stores)}) group by store_number`)).rows as { store_number: string; last: string | Date | null }[];
    const ages = fresh.filter((r) => r.last).map((r) => (now - new Date(r.last!).getTime()) / 1000);
    const answered = ages.filter((a) => a < FRESH_SEC).length;
    const never = stores.length - fresh.filter((r) => r.last).length;
    const modes = cc === "us" ? sql`mode in ('full', 'degraded')` : sql`mode = 'intl'`;
    const rows = (await db().execute(sql`
      select date_trunc('hour', started_at) as hour, sum(requests)::int as requests, sum(failures)::int as failures
      from sweeps where ${modes} and started_at > now() - interval '24 hours'
      group by 1 order by 1`)).rows as { hour: string | Date; requests: number; failures: number }[];
    const hours = rows.map((r) => ({ hour: iso(r.hour), requests: Number(r.requests), failures: Number(r.failures) }));
    const lastRows = (await db().execute(sql`
      select coalesce(sum(requests), 0)::int as requests, coalesce(sum(failures), 0)::int as failures
      from sweeps where ${modes} and started_at > now() - interval '60 minutes'`)).rows as { requests: number; failures: number }[];
    const lastHour = { requests: Number(lastRows[0]?.requests ?? 0), failures: Number(lastRows[0]?.failures ?? 0) };
    const offered = stores.length - never;
    const m = median(ages);
    return {
      at: new Date(now).toISOString(), cc, stores: stores.length, answered, never,
      medianAgeSec: m == null ? null : Math.round(m), oldestAgeSec: ages.length ? Math.round(Math.max(...ages)) : null,
      hours, lastHour, rough: roughHours(hours), verdict: statusVerdict(answered, offered, lastHour),
    };
  },
  ["insight-status-v1"],
  { revalidate: 30 },
);

export function emptyStatus(cc: CountryCode): PickupStatus {
  return { at: new Date().toISOString(), cc, stores: storesOf(cc).length, answered: 0, never: 0, medianAgeSec: null, oldestAgeSec: null, hours: [], lastHour: { requests: 0, failures: 0 }, rough: [], verdict: "unknown", unknown: true };
}

export async function pickupStatus(cc: CountryCode): Promise<PickupStatus> {
  return guarded("status", emptyStatus(cc), () => cachedStatus(cc));
}

/* ================================================================ 2. weekly reports */

/** A country edition exists for a week from this many confirmed restocks. */
export const REPORT_MIN_RESTOCKS = 20;

/** "2026-w45": the ISO week of a YYYY-MM-DD date. */
export function isoWeekOf(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day + 3); // Thursday of this week decides the year
  const year = d.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((d.getTime() - jan4.getTime()) / 86400_000 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${year}-w${String(week).padStart(2, "0")}`;
}

/** "2026-w45" → its Monday and Sunday (YYYY-MM-DD); null for a malformed id. */
export function weekRange(week: string): { start: string; end: string } | null {
  const m = /^(\d{4})-w(\d{2})$/.exec(week);
  if (!m) return null;
  const year = Number(m[1]), n = Number(m[2]);
  if (n < 1 || n > 53) return null;
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4.getTime() - ((jan4.getUTCDay() + 6) % 7) * 86400_000 + (n - 1) * 7 * 86400_000);
  const sunday = new Date(monday.getTime() + 6 * 86400_000);
  const out = { start: monday.toISOString().slice(0, 10), end: sunday.toISOString().slice(0, 10) };
  return isoWeekOf(out.start) === week ? out : null;
}

/** Every week from the country's first tracked day up to the current one (newest first). */
export function weeksSince(cc: CountryCode, today: string): string[] {
  const first = cc === "us" ? TRACKING_SINCE_US : TRACKING_SINCE_INTL;
  const out: string[] = [];
  let w = isoWeekOf(first);
  const last = isoWeekOf(today);
  for (let guard = 0; guard < 600; guard++) {
    out.push(w);
    if (w === last) break;
    const r = weekRange(w)!;
    w = isoWeekOf(new Date(Date.parse(`${r.end}T00:00:00Z`) + 86400_000).toISOString().slice(0, 10));
  }
  return out.reverse();
}

export interface WeekReport {
  cc: CountryCode;
  week: string;
  start: string;
  end: string;
  /** False while the week is still running (in the country's reference zone). */
  complete: boolean;
  /** Days of this week the country was tracked (a launch week can start mid-week). */
  trackedDays: number;
  restocks: number;
  stores: number;
  /** Configurations (part numbers) that restocked at least once. */
  configs: number;
  byModel: Record<ModelKey, number>;
  /** Monday = 0 … Sunday = 6, local days. */
  byDay: number[];
  topStores: { storeNumber: string; n: number }[];
  /** iPhone Duo configurations, most restocks first. */
  duoParts: { partNumber: string; n: number }[];
  /** iPhone Duo restock lifetimes that ended in a sell-out this week. */
  sell: { n: number; medianSec: number | null; within60: number | null };
  prev: { restocks: number; stores: number; medianSec: number | null } | null;
  /** True when the week before was only partly tracked (a launch week): its count is not a fair comparison. */
  prevPartial: boolean;
  unknown?: boolean;
}

const zeroModels = (): Record<ModelKey, number> => ({ duo: 0, "18-pro": 0, "18-pro-max": 0 });

export function localToday(cc: CountryCode, now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: COUNTRIES[cc].timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

const cachedWeek = unstable_cache(
  async (cc: CountryCode, week: string, stores: string[] | null, parts: string[] | null): Promise<Omit<WeekReport, "complete" | "trackedDays" | "prevPartial">> => {
    const r = weekRange(week)!;
    const tz = COUNTRIES[cc].timeZone;
    const prevStart = new Date(Date.parse(`${r.start}T00:00:00Z`) - 7 * 86400_000).toISOString().slice(0, 10);
    // Local week boundaries: the window is [Monday 00:00, next Monday 00:00) in the country's reference zone.
    const window = (a: string, b: string) => sql`at >= (${a}::date)::timestamp at time zone ${tz} and at < (${b}::date + 1)::timestamp at time zone ${tz}`;
    const ev = (await db().execute(sql`
      select store_number, part_number, extract(isodow from at at time zone ${tz})::int as dow
      from availability_events
      where kind = 'restock' and not first_seen and ${window(r.start, r.end)} ${scopeSql(stores, parts)}`)).rows as { store_number: string; part_number: string; dow: number }[];
    const life = (a: string, b: string) => db().execute(sql`
      with e as (
        select store_number, part_number, at, kind, lead(kind) over w as next_kind, lead(at) over w as next_at
        from availability_events
        where not first_seen and ${window(a, b)} ${scopeSql(stores, parts)}
        window w as (partition by store_number, part_number order by at)
      )
      select part_number, extract(epoch from next_at - at)::float8 as secs from e where kind = 'restock' and next_kind = 'soldout'`);
    const lives = ((await life(r.start, r.end)).rows as { part_number: string; secs: number }[]).filter((x) => PART_INDEX.get(x.part_number)?.model === "iPhone Duo").map((x) => Number(x.secs));
    const prevRows = (await db().execute(sql`
      select count(*)::int as n, count(distinct store_number)::int as s
      from availability_events where kind = 'restock' and not first_seen and ${window(prevStart, new Date(Date.parse(`${r.start}T00:00:00Z`) - 86400_000).toISOString().slice(0, 10))} ${scopeSql(stores, parts)}`)).rows as { n: number; s: number }[];
    const prevLives = ((await life(prevStart, new Date(Date.parse(`${r.start}T00:00:00Z`) - 86400_000).toISOString().slice(0, 10))).rows as { part_number: string; secs: number }[]).filter((x) => PART_INDEX.get(x.part_number)?.model === "iPhone Duo").map((x) => Number(x.secs));

    const byModel = zeroModels();
    const byDay = [0, 0, 0, 0, 0, 0, 0];
    const perStore = new Map<string, number>();
    const perPart = new Map<string, number>();
    for (const e of ev) {
      const item = PART_INDEX.get(e.part_number);
      if (!item) continue;
      byModel[modelKeyFor(item.model)]++;
      byDay[(Number(e.dow) + 6) % 7]++;
      perStore.set(e.store_number, (perStore.get(e.store_number) ?? 0) + 1);
      if (item.model === "iPhone Duo") perPart.set(e.part_number, (perPart.get(e.part_number) ?? 0) + 1);
    }
    const prevN = Number(prevRows[0]?.n ?? 0);
    const m = median(lives);
    const pm = median(prevLives);
    return {
      cc, week, start: r.start, end: r.end,
      restocks: ev.length, stores: perStore.size, configs: new Set(ev.map((e) => e.part_number)).size,
      byModel, byDay,
      topStores: [...perStore.entries()].map(([storeNumber, n]) => ({ storeNumber, n })).sort((a, b) => b.n - a.n || a.storeNumber.localeCompare(b.storeNumber)).slice(0, 10),
      duoParts: [...perPart.entries()].map(([partNumber, n]) => ({ partNumber, n })).sort((a, b) => b.n - a.n),
      sell: { n: lives.length, medianSec: m == null ? null : Math.round(m), within60: lives.length ? lives.filter((s) => s <= 60).length / lives.length : null },
      prev: prevN > 0 ? { restocks: prevN, stores: Number(prevRows[0]?.s ?? 0), medianSec: pm == null ? null : Math.round(pm) } : null,
    };
  },
  ["insight-week-v1"],
  { revalidate: 300 },
);

/** Days of week `week` that fall on or after the country's first tracked day and on or before today. */
export function trackedDaysOf(cc: CountryCode, week: string, today: string): number {
  const r = weekRange(week);
  if (!r) return 0;
  const first = cc === "us" ? TRACKING_SINCE_US : TRACKING_SINCE_INTL;
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.parse(`${r.start}T00:00:00Z`) + i * 86400_000).toISOString().slice(0, 10);
    if (d >= first && d <= today) n++;
  }
  return n;
}

export async function weekReport(cc: CountryCode, week: string): Promise<WeekReport | null> {
  const r = weekRange(week);
  if (!r) return null;
  const today = localToday(cc);
  if (r.start > today || r.end < (cc === "us" ? TRACKING_SINCE_US : TRACKING_SINCE_INTL)) return null;
  const scope = countryScope(cc, null, null);
  const empty: WeekReport = { cc, week, start: r.start, end: r.end, complete: r.end < today, trackedDays: trackedDaysOf(cc, week, today), restocks: 0, stores: 0, configs: 0, byModel: zeroModels(), byDay: [0, 0, 0, 0, 0, 0, 0], topStores: [], duoParts: [], sell: { n: 0, medianSec: null, within60: null }, prev: null, prevPartial: false, unknown: true };
  const prevWeek = isoWeekOf(new Date(Date.parse(`${r.start}T00:00:00Z`) - 86400_000).toISOString().slice(0, 10));
  return guarded("week", empty, async () => ({
    ...(await cachedWeek(cc, week, scope.stores ? [...scope.stores].sort() : null, scope.parts ? [...scope.parts].sort() : null)),
    complete: r.end < today,
    trackedDays: trackedDaysOf(cc, week, today),
    prevPartial: trackedDaysOf(cc, prevWeek, today) < 7,
  }));
}

/** The weeks of a country that have an edition (REPORT_MIN_RESTOCKS or more), newest first. */
export async function reportWeeks(cc: CountryCode): Promise<{ week: string; restocks: number; complete: boolean }[]> {
  const today = localToday(cc);
  const weeks = weeksSince(cc, today);
  const out: { week: string; restocks: number; complete: boolean }[] = [];
  for (const w of weeks) {
    const rep = await weekReport(cc, w);
    if (rep && !rep.unknown && rep.restocks >= REPORT_MIN_RESTOCKS) out.push({ week: w, restocks: rep.restocks, complete: rep.complete });
  }
  return out;
}

/* ================================================================ 3 & 4. store comparisons */

/** Store slugs are unique inside a country (tested); a pair's URL segment is "{a}-vs-{b}", alphabetical. */
export function pairSlug(a: Store, b: Store): string {
  const [x, y] = [a.slug, b.slug].sort();
  return `${x}-vs-${y}`;
}

function km(a: Store, b: Store): number {
  const r = Math.PI / 180, R = 6371;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * The comparisons a country gets: inside every city with two or more stores, each store and its nearest neighbour in
 * that city (the choice a shopper actually weighs), deduplicated. Pure.
 */
export function comparePairs(cc: CountryCode): { slug: string; a: Store; b: Store; km: number }[] {
  const byCity = new Map<string, Store[]>();
  for (const s of storesOf(cc)) { const k = `${s.state}|${s.city}`; byCity.set(k, [...(byCity.get(k) ?? []), s]); }
  const out = new Map<string, { slug: string; a: Store; b: Store; km: number }>();
  for (const group of byCity.values()) {
    if (group.length < 2) continue;
    for (const s of group) {
      const nearest = group.filter((x) => x.storeNumber !== s.storeNumber).sort((p, q) => km(s, p) - km(s, q))[0];
      const [a, b] = [s, nearest].sort((p, q) => p.slug.localeCompare(q.slug));
      const slug = pairSlug(a, b);
      if (!out.has(slug)) out.set(slug, { slug, a, b, km: Math.round(km(a, b) * 10) / 10 });
    }
  }
  return [...out.values()].sort((p, q) => p.slug.localeCompare(q.slug));
}

export function findPair(cc: CountryCode, slug: string) {
  return comparePairs(cc).find((p) => p.slug === slug) ?? null;
}

/** Countries with a fastest-selling ranking page (five stores or more). */
export const RANKING_MIN_STORES = 5;
export function hasRankingPage(cc: CountryCode): boolean {
  return storesOf(cc).length >= RANKING_MIN_STORES;
}

/** Per-store restock counts and newest restock over STATS_DAYS for a set of stores (for the ranking and the comparison). */
export interface StoreWindow { storeNumber: string; restocks: number; duoRestocks: number; lastAt: string | null }
const cachedWindows = unstable_cache(
  async (stores: string[]): Promise<StoreWindow[]> => {
    const rows = (await db().execute(sql`
      select store_number, part_number, count(*)::int as n, max(at) as last
      from availability_events
      where kind = 'restock' and not first_seen and at > now() - make_interval(days => ${STATS_DAYS}) and store_number in (${list(stores)})
      group by 1, 2`)).rows as { store_number: string; part_number: string; n: number; last: string | Date }[];
    const by = new Map<string, StoreWindow>(stores.map((s) => [s, { storeNumber: s, restocks: 0, duoRestocks: 0, lastAt: null }]));
    for (const r of rows) {
      const w = by.get(r.store_number);
      if (!w) continue;
      w.restocks += Number(r.n);
      if (PART_INDEX.get(r.part_number)?.model === "iPhone Duo") w.duoRestocks += Number(r.n);
      const last = iso(r.last);
      if (!w.lastAt || last > w.lastAt) w.lastAt = last;
    }
    return [...by.values()];
  },
  ["insight-windows-v1"],
  { revalidate: 300 },
);

export async function storeWindows(storeNumbers: string[]): Promise<StoreWindow[]> {
  const sorted = [...storeNumbers].sort();
  return guarded("windows", sorted.map((s) => ({ storeNumber: s, restocks: 0, duoRestocks: 0, lastAt: null })), () => cachedWindows(sorted));
}

