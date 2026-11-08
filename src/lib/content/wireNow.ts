/**
 * "On the wire: iPhone Duo {here}": the bulletin a place page opens with since 2026-11-08 (state/region, city,
 * store, country home, store index, the Duo model pages). Answer engines quote the page that already states the
 * conclusion in its first lines, so the block gives it to them in RestockWire's own order: the last listing first
 * (the wire line), then whether anything is listed right now, four 14-day figures, the dated method line, one
 * quotable paragraph and the last three listings with how long each stayed up.
 *
 * Every number comes from reads the page already makes — live stock (storesStock / stockByStore), the Duo-only
 * 14-day clock (restockStats), the Duo-only place statistics (placeStats) and the Duo sell-out rows (sellouts);
 * the only new read is how many alerts went out (alertsSentAt). The window is STATS_DAYS (14 days) throughout:
 * this site never prints a "since launch" figure for a place. Pure except `alertsSentAt`; JSON-safe.
 */
import { unstable_cache } from "next/cache";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { db, hasDatabase, schema } from "../db";
import { PART_INDEX, modelKeyFor, storeTimeZone, type ModelKey, type Store } from "../apple/catalog";
import type { PlaceStats, RestockStats, StoreStockRow } from "../stock/queries";
import type { Sellouts } from "../stock/sellouts";
import { STATS_DAYS } from "../stock/window";
import { busiestWindow } from "./restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, localHourDay } from "./siteFacts";
import { recordError, errorMessage } from "../errors";

/** What the block needs of a store's live stock: when it was last read and, per model, the parts listed. */
export interface StockLike { lastCheckedAt: Date | null; perModel: Partial<Record<ModelKey, { available: number; parts: string[] }>> }

/** A country page's stock map from the Duo rows it already reads (stockByStore); the other models come from `others`. */
export function stockFromRows(rows: StoreStockRow[]): Map<string, StockLike> {
  const map = new Map<string, StockLike>();
  for (const r of rows) map.set(r.storeNumber, { lastCheckedAt: r.lastCheckedAt ?? null, perModel: { duo: { available: r.availableParts.length, parts: r.availableParts } } });
  return map;
}

/** Alerts RestockWire pushed for restocks at these stores in the last `days` days (counts only; nobody is named). */
export interface AlertsSent { days: number; sent: number; stores: number }

const alertsCached = unstable_cache(
  async (stores: string[], days: number): Promise<AlertsSent> => {
    const n = schema.notifications;
    const rows = await db()
      .select({ sent: sql<number>`count(*)::int`, stores: sql<number>`count(distinct ${n.storeNumber})::int` })
      .from(n)
      .where(and(eq(n.status, "sent"), inArray(n.storeNumber, stores), gt(n.createdAt, new Date(Date.now() - days * 86400_000))));
    return { days, sent: rows[0]?.sent ?? 0, stores: rows[0]?.stores ?? 0 };
  },
  ["rw-alerts-sent-v1"],
  { revalidate: 300 },
);

export async function alertsSentAt(storeNumbers: string[], days = 7): Promise<AlertsSent | null> {
  if (!hasDatabase() || storeNumbers.length === 0) return null;
  try {
    return await alertsCached([...storeNumbers].sort(), days);
  } catch (e) {
    await recordError("web", `alerts sent ${storeNumbers.length} stores: ${errorMessage(e)}`).catch(() => undefined);
    return null;
  }
}

/** One Duo listing: when it appeared, and how long it stayed up (bounds between two reads) or has stayed up so far. */
export interface WireListing {
  at: string;
  storeNumber: string;
  partNumber: string;
  /** Seconds it was still up (lower) and gone by (upper); null while still up or unknown. */
  lowSec: number | null;
  highSec: number | null;
  /** Bounded by two recorded reads (true) or by the 15-second round (false). */
  exact: boolean;
  /** Still up: seconds since it appeared. */
  upSec: number | null;
}

export interface WireNow {
  /** When this was computed. */
  at: string;
  /** The newest read of any of the place's stores; null when none has been read. */
  checkedAt: string | null;
  storesTotal: number;
  /** Stores with an iPhone Duo listed right now, most configurations first. */
  listed: { storeNumber: string; configs: number; parts: string[] }[];
  /** iPhone Duo configurations a store can list in this country (8). */
  configsTotal: number;
  /** The other two models: stores with any configuration (place) / configurations here (store). */
  others: { pro: number; max: number };
  /** The newest Duo listing in the window, with its lifetime when the sell-out rows carry it. */
  last: WireListing | null;
  /** The last three Duo listings (newest first) the sell-out rows cover. */
  lastThree: WireListing[];
  /** The statistics window (STATS_DAYS) and the Duo restocks confirmed in it. */
  days: number;
  n: number;
  /** Distinct stores with a restock in the window. */
  restockStores: number;
  /** A usual hour may be stated (the same rule as the clock: PATTERN_MIN restocks on PATTERN_MIN_DAYS days). */
  pattern: boolean;
  peakHour: number | null;
  peakCount: number;
  /** The busiest two local hours of the window and their share of its restocks. */
  window: { from: number; to: number; share: number };
  /** Median seconds a listing stayed up (window); null under 10 timed sell-outs. */
  medianSec: number | null;
  /** Share of timed listings gone inside a minute; null under 10. */
  within60: number | null;
  /** The longest listing of the last 7 days, seconds (gone-by bound, or still up); null without one. */
  longest7dSec: number | null;
  /** Most restocked configuration in the window. */
  topPart: { partNumber: string; restocks: number } | null;
  /** Restocks today so far (the place's local date). */
  today: number;
  alerts: AlertsSent | null;
  /** Distinct time zones of the place's stores (one → the sentences may name it). */
  zones: string[];
  /** A statistics read failed: the pattern figures are placeholders. */
  unknown: boolean;
}

export interface WireNowInput {
  stores: Store[];
  stock: Map<string, StockLike>;
  /** The other models' counts when `stock` carries only the Duo (country pages: stores with any configuration). */
  others?: { pro: number; max: number };
  /** Duo-only, STATS_DAYS: the hour/weekday histogram and the place statistics. */
  clock: RestockStats;
  stats: PlaceStats;
  /** Duo parts only (the all-model recent list fills up with Pro / Pro Max rows and the Duo's last three vanish). */
  sell: Sellouts;
  alerts?: AlertsSent | null;
  now?: Date;
  /** iPhone Duo configurations per store in this country (catalogFor("duo", cc).length). */
  configsTotal: number;
}

const isDuo = (partNumber: string) => { const i = PART_INDEX.get(partNumber); return Boolean(i && modelKeyFor(i.model) === "duo"); };
const argmax = (v: number[]) => v.indexOf(Math.max(...v));

/** Pure: the block's numbers from what the page already loaded. */
export function wireNowFrom(i: WireNowInput): WireNow {
  const now = i.now ?? new Date();
  const numbers = new Set(i.stores.map((s) => s.storeNumber));
  let checkedAt: string | null = null;
  const listed: WireNow["listed"] = [];
  let pro = 0, max = 0;
  for (const s of i.stores) {
    const sum = i.stock.get(s.storeNumber);
    if (!sum) continue;
    if (sum.lastCheckedAt && (!checkedAt || sum.lastCheckedAt.toISOString() > checkedAt)) checkedAt = sum.lastCheckedAt.toISOString();
    const duo = sum.perModel.duo;
    if (duo && duo.available > 0) listed.push({ storeNumber: s.storeNumber, configs: duo.available, parts: duo.parts });
    const p = sum.perModel["18-pro"]?.available ?? 0, m = sum.perModel["18-pro-max"]?.available ?? 0;
    if (i.stores.length === 1) { pro = p; max = m; }
    else { if (p > 0) pro++; if (m > 0) max++; }
  }
  if (i.others) { pro = i.others.pro; max = i.others.max; }
  listed.sort((a, b) => b.configs - a.configs || a.storeNumber.localeCompare(b.storeNumber));

  // The sell-out rows (the window, newest first) carry each Duo listing's lifetime.
  const rows: WireListing[] = i.sell.recent
    .filter((r) => numbers.has(r.storeNumber) && isDuo(r.partNumber))
    .map((r) => ({ at: r.at.toISOString(), storeNumber: r.storeNumber, partNumber: r.partNumber, lowSec: r.lowSec, highSec: r.highSec, exact: r.exact, upSec: r.listedSec }))
    .sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  const lastThree = rows.slice(0, 3);
  let last: WireListing | null = lastThree[0] ?? null;
  const lr = i.stats.lastRestock;
  if (lr && isDuo(lr.partNumber) && numbers.has(lr.storeNumber) && (!last || lr.at > last.at)) last = { at: lr.at, storeNumber: lr.storeNumber, partNumber: lr.partNumber, lowSec: null, highSec: null, exact: false, upSec: null };

  const weekAgo = now.getTime() - 7 * 86400_000;
  let longest: number | null = null;
  for (const r of rows) {
    if (Date.parse(r.at) < weekAgo) continue;
    const life = r.highSec ?? r.upSec;
    if (life != null && (longest == null || life > longest)) longest = life;
  }

  const c = i.clock;
  const pattern = c.total >= PATTERN_MIN && (c.dates ?? Infinity) >= PATTERN_MIN_DAYS;
  const peakHour = pattern ? argmax(c.byHour) : null;
  const sellSum = i.sell.byModel.duo ?? i.sell.summary;
  const timed = sellSum.n >= 10;
  const todayKey = localHourDay(now.toISOString(), i.stats.tz).date;
  const today = i.stats.daily.find((d) => d.day === todayKey)?.restocks ?? 0;
  const top = [...i.stats.byPart].filter((p) => isDuo(p.partNumber)).sort((a, b) => b.restocks - a.restocks)[0];

  return {
    at: now.toISOString(),
    checkedAt,
    storesTotal: i.stores.length,
    listed,
    configsTotal: i.configsTotal,
    others: { pro, max },
    last,
    lastThree,
    days: i.stats.days || STATS_DAYS,
    n: i.stats.month,
    restockStores: i.stats.restockStores,
    pattern,
    peakHour,
    peakCount: peakHour != null ? c.byHour[peakHour] ?? 0 : 0,
    window: busiestWindow(c.byHour),
    medianSec: timed ? sellSum.medianSec : null,
    within60: timed ? sellSum.within60 : null,
    longest7dSec: longest,
    topPart: top && top.restocks > 0 ? { partNumber: top.partNumber, restocks: top.restocks } : null,
    today,
    alerts: i.alerts ?? null,
    zones: [...new Set(i.stores.map((s) => storeTimeZone(s)))],
    unknown: Boolean(i.stats.unknown),
  };
}
