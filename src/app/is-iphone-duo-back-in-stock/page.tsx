/**
 * /is-iphone-duo-back-in-stock: the back-in-stock question, answered for the person who typed exactly that and
 * does not know a tracker exists. The first sentence is the whole answer with live numbers (how many US Apple Stores
 * list one now, the last 24 hours, the latest confirmed restock with its store and local time); the sections under
 * it say where, which configurations, how long "back in stock" lasts, when the next window usually opens, how to be
 * told the moment it happens, and the 18 other countries. Every number is RestockWire's own, read at request time;
 * a read that fails says so instead of showing a zero as a fact.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap, type Point } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storeTimeZone, storesOf, type CatalogItem, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { CHECK_NOTE, OTHER_TRACKERS, PLANS, SPEED } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAYS, hourLabel, localHourDay, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, rangeLabel } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow, type RestockRow } from "@/lib/stock/queries";
import { alertHref, fmtPrice, plural } from "@/lib/seo/enrich";

export const dynamic = "force-dynamic";

const SITE = "https://restockwire.com";
const PATH = "/is-iphone-duo-back-in-stock";
/** 55 characters with the 269-store count. */
const TITLE = `Is the iPhone Duo Back in Stock? Live Count, ${STORES.length} Stores`;
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const WIKI_STOCKOUT = "https://en.wikipedia.org/wiki/Stockout";
const DAY_MS = 86400_000;
/** restockFeed hands out at most 200 rows a page; the 24-hour window is walked page by page, up to this many. */
const FEED_PAGE = 200;
const FEED_PAGES = 5;
/** The one price sentence, in the body and in a FAQ answer, word for word. */
const PRICE_SENTENCE = `Alerts start at $${PLANS.plus.priceUsd}/month: your stores go on the ${SPEED.fastSec}-second wire, and a confirmed restock reaches your phone about ${SPEED.alertSec} s later.`;

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const ET_STAMP = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
/** Clock time as the store itself reads it, e.g. 9:41 AM. */
const clockAt = (iso: string, store: Store) => new Intl.DateTimeFormat("en-US", { timeZone: storeTimeZone(store), hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const cfgName = (i: CatalogItem) => `${i.storage} ${i.color}`;
/** Ratio wording: whole numbers from 3× up, one decimal under that. */
const times = (r: number) => (r >= 3 ? `${Math.round(r)}×` : `${(Math.round(r * 10) / 10).toFixed(1)}×`);

/** "today", "yesterday" or "on Nov 3", by the store's own calendar. */
function dayWord(iso: string, store: Store, now: Date): string {
  const tz = storeTimeZone(store);
  const d = localHourDay(iso, tz).date;
  if (d === localHourDay(now.toISOString(), tz).date) return "today";
  if (d === localHourDay(new Date(now.getTime() - DAY_MS).toISOString(), tz).date) return "yesterday";
  const md = new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric" }).format(new Date(iso));
  return `on ${md}`;
}

/** "about 4 minutes ago", computed on the server for this request (the page is never cached). */
function agoText(iso: string, now: Date): string {
  const s = Math.max(0, Math.round((now.getTime() - Date.parse(iso)) / 1000));
  if (s < 60) return "under a minute ago";
  const m = Math.round(s / 60);
  if (m < 60) return `about ${plural(m, "minute")} ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `about ${plural(h, "hour")} ago`;
  return `about ${plural(Math.round(h / 24), "day")} ago`;
}

/**
 * Confirmed US iPhone Duo restocks, newest first, reaching back at least 24 hours: restockFeed pages at 200 rows,
 * so pages are read until one ends before the window, at most FEED_PAGES of them (then complete is false).
 */
async function duoFeed(now: Date): Promise<{ rows: RestockRow[]; complete: boolean }> {
  const since = now.getTime() - DAY_MS;
  const rows: RestockRow[] = [];
  for (let page = 0; page < FEED_PAGES; page++) {
    const batch = await restockFeed({ model: "duo", limit: FEED_PAGE, country: "us", page });
    rows.push(...batch);
    if (batch.length < FEED_PAGE || batch[batch.length - 1].at.getTime() < since) return { rows, complete: true };
  }
  return { rows, complete: false };
}

/** One read per request, shared by the metadata and the page. */
const load = cache(async () => {
  const now = new Date();
  const [t, recent, stock, feed, f, facts, abroad] = await Promise.all([
    duoRestockTimes("us"),
    recentByConfig({ country: "us" }),
    modelStock("duo", "us"),
    duoFeed(now),
    siteFacts(),
    getFacts(),
    Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
  ]);
  return { now, t, recent, stock, feed, f, facts, abroad };
});

/** Pure: every number the page and its description quote, from the raw reads. */
function derive(d: Awaited<ReturnType<typeof load>>) {
  const { now, t, recent, stock, feed } = d;
  // A status row exists for every store × configuration since the first sweep, so an empty read is a failed one.
  const stockUnknown = stock.length === 0;
  const nowByStore = new Map<string, Set<string>>();
  for (const r of stock) {
    if (r.status !== "available") continue;
    const set = nowByStore.get(r.storeNumber) ?? new Set<string>();
    set.add(r.partNumber);
    nowByStore.set(r.storeNumber, set);
  }
  const storesNow = nowByStore.size;
  const nowByState = new Map<string, number>();
  const nowByPart = new Map<string, number>();
  for (const [storeNumber, parts] of nowByStore) {
    const s = storeByNumber(storeNumber);
    if (s) nowByState.set(s.state, (nowByState.get(s.state) ?? 0) + 1);
    for (const p of parts) nowByPart.set(p, (nowByPart.get(p) ?? 0) + 1);
  }

  const since24 = now.getTime() - DAY_MS;
  const last24 = feed.rows.filter((r) => r.at.getTime() >= since24);
  // Thousands of restocks sit in the log: an empty feed while the log has rows is a failed read, not a quiet day.
  const feedUnknown = feed.rows.length === 0 && (t.n > 0 || Boolean(t.unknown));
  // The 24-hour figures: the walked feed when it covers the window, else the cached grouped read.
  const h24 = !feedUnknown && feed.complete
    ? { restocks: last24.length, stores: new Set(last24.map((r) => r.storeNumber)).size, unknown: false }
    : { restocks: recent.restocks, stores: recent.stores, unknown: Boolean(recent.unknown) || feedUnknown };

  // The latest confirmed restock: the feed is the freshest read; the five-minute aggregate stands in when it failed.
  const first = feed.rows[0];
  const latestStore = first ? first.store : t.latest ? storeByNumber(t.latest.storeNumber) : undefined;
  const latest = first
    ? { store: first.store, item: first.item as CatalogItem | undefined, at: first.at.toISOString() }
    : t.latest && latestStore
      ? { store: latestStore, item: PART_INDEX.get(t.latest.partNumber), at: t.latest.at }
      : null;

  const states = statesWithStores().map((st) => {
    const rows = last24.filter((r) => r.store.state === st.name);
    const newest = rows[0];
    return {
      name: st.name, code: st.code, total: st.count, path: statePath(st.name),
      now: nowByState.get(st.name) ?? 0,
      restocks: rows.length, stores: new Set(rows.map((r) => r.storeNumber)).size,
      latest: newest ? { store: newest.store, at: newest.at.toISOString() } : null,
    };
  }).sort((a, b) => b.now - a.now || b.restocks - a.restocks || a.name.localeCompare(b.name));
  const statesNow = states.filter((s) => s.now > 0);
  const states24 = states.filter((s) => s.restocks > 0);
  const active = states.filter((s) => s.now > 0 || s.restocks > 0);

  const items = catalogFor("duo");
  const partRows = new Map(t.byPart.map((p) => [p.partNumber, p]));
  const recentParts = new Map(recent.byPart.map((p) => [p.partNumber, p]));
  const configs = items.map((item) => {
    const p = partRows.get(item.partNumber);
    const restocks = p?.restocks ?? 0;
    const lastStore = p?.lastStore ? storeByNumber(p.lastStore) : undefined;
    return { item, name: cfgName(item), restocks, share: t.n ? restocks / t.n : 0, lastAt: p?.lastAt ?? null, lastStore, now: nowByPart.get(item.partNumber) ?? 0, h24: recentParts.get(item.partNumber)?.restocks ?? 0 };
  }).sort((a, b) => b.restocks - a.restocks || a.name.localeCompare(b.name));
  const topCfg = configs[0];
  const lastCfg = configs[configs.length - 1];
  // The spread between the most- and least-restocked configuration, stated only when it is a real one.
  const spread = topCfg && lastCfg && lastCfg.restocks > 0 && topCfg !== lastCfg ? topCfg.restocks / lastCfg.restocks : 0;
  const ratio = spread >= 1.2 ? spread : null;
  // Which lever moves the odds more: the gap between storage sizes or the gap between colors, in restocks.
  const byStorage = new Map<string, number>(), byColor = new Map<string, number>();
  for (const c of configs) { byStorage.set(c.item.storage, (byStorage.get(c.item.storage) ?? 0) + c.restocks); byColor.set(c.item.color, (byColor.get(c.item.color) ?? 0) + c.restocks); }
  const gap = (m: Map<string, number>) => { const v = [...m.values()]; return v.length ? Math.max(...v) - Math.min(...v) : 0; };
  const storageWins = gap(byStorage) >= gap(byColor);

  const tracked = Math.max(t.daily.length, t.days, 1);
  const have = t.n > 0 && !t.unknown;
  const pattern = have && t.peakHour != null;
  const w = busiestWindow(t.byHour);
  const sell = t.sellout;
  const ds = d.f.duoSellout;
  const band = sell ? medianBand(sell.medianSec) : ds ? medianBand(ds.medianSec) : null;
  const top = t.topStores[0];
  const topStore = top ? storeByNumber(top.storeNumber) : undefined;

  const intl = INTL_CODES.map((cc, i) => ({ cc, name: COUNTRIES[cc].name, now: d.abroad[i].duo, total: storesOf(cc).length, href: prefixOf(cc) + "/in-stock/iphone-duo" }))
    .sort((a, b) => b.now - a.now || INTL_CODES.indexOf(a.cc) - INTL_CODES.indexOf(b.cc));
  const intlNow = intl.reduce((a, c) => a + c.now, 0);
  const intlTotal = intl.reduce((a, c) => a + c.total, 0);

  return { now, t, stockUnknown, storesNow, h24, latest, last24, feedUnknown, feedComplete: feed.complete && !feedUnknown, states, statesNow, states24, active, items, configs, topCfg, lastCfg, ratio, storageWins, tracked, have, pattern, w, sell, ds, band, top, topStore, intl, intlNow, intlTotal, feedRows: feed.rows.slice(0, 12) };
}

/** The meta description: the quotable first sentence, cut to the clause that fits 158 characters. */
function describe(v: ReturnType<typeof derive>): string {
  const a = v.stockUnknown
    ? `iPhone Duo in-store pickup stock at all ${STORES.length} US Apple Stores, read live`
    : v.storesNow > 0
      ? `${v.storesNow} of ${STORES.length} US Apple Stores have an iPhone Duo for pickup at this minute`
      : `No US Apple Store has an iPhone Duo for pickup at this minute`;
  const b = v.h24.unknown ? "" : v.h24.restocks === 0 ? "; no confirmed restock in 24 hours" : `; 24 h: ${n(v.h24.restocks)} confirmed, ${plural(v.h24.stores, "store")}`;
  const c = ` States, configurations, seconds a listing lasts, the usual hour; all stores read each ${SPEED.checkSec} s.`;
  const fits = [`${a}${b}.${c}`, `${a}${b}.`, `${a}.`].find((s) => s.length <= 158);
  return fits ?? `${a}.`.slice(0, 158);
}

export async function generateMetadata(): Promise<Metadata> {
  const view = derive(await load());
  const description = describe(view);
  return {
    title: { absolute: `${TITLE} · RestockWire` },
    description,
    alternates: { canonical: PATH },
    openGraph: { url: PATH, type: "article", siteName: "RestockWire", description, title: TITLE },
  };
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";
const DASH = "–";

function Table({ caption, head, children, min = "28rem" }: { caption: string; head: string[]; children: ReactNode; min?: string }) {
  return (
    <div className="my-5 overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ minWidth: min }}>
        <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>
        <thead><tr>{head.map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** Keyword lines inside the prose pane (the pane's list indent is turned off). */
function Keys({ items, className = "my-3" }: { items: Point[]; className?: string }) {
  return <Points items={items} className={`${className} ml-0!`} />;
}

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

export default async function DuoBackInStock() {
  const d = await load();
  const v = derive(d);
  const { now, t, stockUnknown, storesNow, h24, latest, feedUnknown, states, statesNow, states24, active, items, configs, topCfg, lastCfg, ratio, storageWins, tracked, have, pattern, w, sell, ds, band, top, topStore, intl, intlNow, intlTotal, feedRows } = v;
  const facts = d.facts;
  const since = longDate(t.since);
  const asOf = `${ET_STAMP.format(now)} ET`;
  const alert = alertHref({ model: "duo" });
  const description = describe(v);
  const storeLink = (s: Store) => <Link href={storePath(s)} className="hover:underline">{appleName(s)}</Link>;
  const nowKnown = !stockUnknown;
  const yesNow = nowKnown && storesNow > 0;
  const perDay = have ? Math.round(t.n / tracked) : 0;
  const quietStates = states.length - active.length;
  const configs24 = configs.filter((c) => c.h24 > 0).length;
  const topIntl = intl[0];

  const sections = [
    { id: "now", nav: "This minute", h2: "Is any Apple Store listing the iPhone Duo at this minute?" },
    { id: "where", nav: "Which states", h2: "Which states have the iPhone Duo back in stock?" },
    { id: "configurations", nav: "Storage and color", h2: "Which iPhone Duo configurations come back most often?" },
    { id: "how-long", nav: "Seconds it lasts", h2: "How many seconds does a back-in-stock listing last?" },
    { id: "when", nav: "Next window", h2: "What time of day does the iPhone Duo usually come back?" },
    { id: "alerts", nav: "Get the push", h2: "How do you hear about a restock within seconds?" },
    { id: "abroad", nav: "Other countries", h2: "Is the iPhone Duo back in stock in other countries?" },
  ];
  const h2Of = (id: string) => sections.find((s) => s.id === id)!.h2;

  /* ---------------------------------------------------------------- the sentences every section opens with */
  const h24Clause = h24.unknown
    ? <>, and the 24-hour count did not come back for this request.</>
    : h24.restocks > 0
      ? <>; the past 24 hours logged <b className="text-ink">{n(h24.restocks)}</b> confirmed {h24.restocks === 1 ? "restock" : "restocks"} across <b className="text-ink">{plural(h24.stores, "store")}</b>.</>
      : <>, and the last 24 hours brought no confirmed restock anywhere in the US.</>;
  const latestClause = latest
    ? yesNow
      ? <> The newest of them: <b className="text-ink">{appleName(latest.store)}</b> ({cityLine(latest.store)}), <b className="text-ink">{clockAt(latest.at, latest.store)}</b> local time {dayWord(latest.at, latest.store, now)}.</>
      : <> The last one landed at <b className="text-ink">{appleName(latest.store)}</b> ({cityLine(latest.store)}) <b className="text-ink">{agoText(latest.at, now)}</b>, {clockAt(latest.at, latest.store)} local time.</>
    : null;

  const whereLead = stockUnknown
    ? `The live read failed for this request, so the "now" column is blank; the 24-hour column still says where the iPhone Duo came back${states24.length ? `: ${plural(states24.length, "state")}, ${states24[0].name} first with ${plural(states24[0].restocks, "restock")}` : ""}.`
    : statesNow.length > 0
      ? `${plural(statesNow.length, "state", "states")} at this minute: ${statesNow.slice(0, 4).map((s) => `${s.name} (${s.now} of ${s.total})`).join(", ")}${statesNow.length > 4 ? ` and ${statesNow.length - 4} more` : ""}; over the last 24 hours restocks were confirmed in ${plural(states24.length, "state")}.`
      : states24.length > 0
        ? `None at this minute; over the last 24 hours restocks were confirmed in ${plural(states24.length, "state")}, ${states24[0].name} leading with ${plural(states24[0].restocks, "restock")} across ${plural(states24[0].stores, "store")}.`
        : `None at this minute and none in the last 24 hours; the table below appears with the next confirmed restock.`;

  const configLead = have && topCfg && topCfg.restocks > 0
    ? `${topCfg.name} is on top with ${pct(topCfg.share)}: ${n(topCfg.restocks)} of ${n(t.n)} restocks confirmed in the US from ${since}${lastCfg && lastCfg.restocks < topCfg.restocks ? `, while ${lastCfg.name} has ${n(lastCfg.restocks)} (${pct(lastCfg.share)})` : ", with all eight configurations level so far"}${ratio ? `; the most common one has returned ${times(ratio)} as often as the rarest` : ""}.`
    : t.unknown
      ? "The restock log did not come back for this request; the eight configurations below refill on the next load."
      : `No US restock has been confirmed since ${since}; the eight configurations are listed below and sort themselves as restocks land.`;

  const howLongLead = sell
    ? `${sell.medianSec} seconds is the median: half of the ${n(sell.n)} US iPhone Duo restocks that sold out since ${since} were gone by then, ${pct(sell.within2min)} inside 2 minutes and ${pct(sell.within20min)} inside 20, which is about ${band} and less time than a reload-and-scroll takes.`
    : ds
      ? `${ds.medianSec} seconds is the median over the last 7 days: half of the ${n(ds.n)} iPhone Duo restocks that sold out were gone by then and ${pct(ds.within30)} inside 30 seconds, so a page reloaded by hand nearly always shows it gone.`
      : "Seconds to a few minutes: a median is stated only once ten or more confirmed restocks have sold out, and until then the plain answer is that a listing seen by hand is usually gone before checkout ends.";

  const whenLead = pattern
    ? `There is no schedule from Apple; what the log shows is ${hourLabel(w.from)} to ${hourLabel(w.to % 24)} store time, which caught ${pct(w.share)} of ${n(t.n)} US iPhone Duo restocks from ${since}${t.peakWeekday != null ? `; the busiest weekday so far is ${WEEKDAYS[t.peakWeekday]}` : ""}.`
    : have
      ? `There is no schedule from Apple, and ${n(t.n)} confirmed restocks on ${plural(t.days, "day")} since ${since} are too few to call an hour: we say "usually" only from 5 restocks on 3 different days.`
      : `There is no schedule from Apple, and no confirmed US restock yet to read a pattern from; the window appears after 5 restocks on 3 different days.`;

  const abroadLead = intlNow > 0 && topIntl
    ? `${intlNow} of ${n(intlTotal)} tracked Apple Stores across ${INTL_CODES.length} more countries list an iPhone Duo for pickup at this minute, ${topIntl.name} first (${topIntl.now} of ${topIntl.total}); stock, part numbers and prices are per country, so a US restock says nothing about Toronto or London.`
    : `Zero of ${n(intlTotal)} tracked Apple Stores across ${INTL_CODES.length} more countries list an iPhone Duo for pickup at this minute; stock, part numbers and prices are per country, each with its own page below.`;

  /* ---------------------------------------------------------------- FAQ, sources, structured data */
  const faq: Faq[] = [
    { q: "Is the iPhone Duo in stock at any Apple Store right now?", a: stockUnknown
      ? `The live read failed for this request; [live iPhone Duo stock](/in-stock/iphone-duo) has each US Apple Store as of its latest ${SPEED.checkSec}-second read${h24.unknown ? "" : `; 24-hour tally: ${n(h24.restocks)} confirmed restocks, ${plural(h24.stores, "store")}`}.`
      : yesNow
        ? `Yes: ${storesNow} of the ${STORES.length} US Apple Stores had one listed for pickup when this page loaded (${asOf})${latest ? `, the newest at ${appleName(latest.store)} in ${cityLine(latest.store)} at ${clockAt(latest.at, latest.store)} local time ${dayWord(latest.at, latest.store, now)}` : ""}. A listing lasts about ${band ?? "a minute"}, so open [live stock](/in-stock/iphone-duo) now rather than this answer later.`
        : `Not at this minute: no US Apple Store listed one for pickup when this page loaded (${asOf})${h24.unknown ? "" : `; the past day still logged ${n(h24.restocks)} confirmed ${h24.restocks === 1 ? "restock" : "restocks"}`}${latest ? `, the last ${agoText(latest.at, now)} at ${appleName(latest.store)}` : ""}. It returns in bursts of about ${band ?? "a minute"} each.` },
    { q: "How many times a day does the iPhone Duo come back in stock?", a: have
      ? `Roughly ${n(perDay)} per day nationwide: ${n(t.n)} confirmed restocks, ${t.stores} stores, ${tracked} days from ${since}${h24.unknown ? "" : `; the past 24 hours alone had ${n(h24.restocks)}`}. A restock is one store × one configuration, so a single store sees a few a week; that is why alerts go on two or three stores.`
      : `Not knowable yet: the count of confirmed US restocks since ${since} is at the top of this page and this answer fills in from it. All ${STORES.length} US Apple Stores are checked every ${SPEED.checkSec} seconds.` },
    { q: "Will it still be in stock by the time I reach the store?", a: sell
      ? `Rarely: half of the ${n(sell.n)} sold-out US restocks since ${since} were gone within ${sell.medianSec} seconds, ${pct(sell.within2min)} within 2 minutes and ${pct(sell.within20min)} within 20, the fastest within ${sell.fastestSec} seconds. Reserve on apple.com first and let Apple hold it; each figure is capped by two of our checks ([sell-out seconds, per restock](/how-fast-does-iphone-duo-sell-out)).`
      : `Rarely: every confirmed iPhone Duo restock so far lasted seconds to a few minutes, and a median is quoted once ten or more restocks in the window have sold out. Reserve on apple.com first; [sell-out seconds, per restock](/how-fast-does-iphone-duo-sell-out) posts the figure as soon as there is one.` },
    { q: "Where has the iPhone Duo come back most often?", a: top && topStore
      ? `[${appleName(topStore)}](${storePath(topStore)}) in ${cityLine(topStore)}, with ${n(top.restocks)} confirmed restocks on ${plural(top.days, "day")} since ${since}${top.peakHour != null ? `, most often around ${hourLabel(top.peakHour)} local time` : ""}. Busy flagship stores lead the count, which makes them the better stores to watch rather than the shorter queue ([most-restocked storage and colors](/iphone-duo-most-restocked-stores)).`
      : `No store can be named yet; [most-restocked storage and colors](/iphone-duo-most-restocked-stores) ranks them from ${since} as restocks are confirmed.` },
    { q: "Can I get a notification the moment it is back in stock?", a: `${PRICE_SENTENCE} Choose the configuration and the Apple Stores you can reach, put RestockWire on your iPhone's Home Screen and allow notifications once ([install guide](/phone-alerts)); ${PLANS.plus.name} covers ${PLANS.plus.limit} alerts, ${PLANS.pro.name} ${PLANS.pro.limit} for $${PLANS.pro.priceUsd}, ${PLANS.max.name} ${PLANS.max.limit} for $${PLANS.max.priceUsd} ([pricing](/pricing)).` },
  ];

  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (pickup availability and holds, in Apple's words)", url: APPLE_PICKUP },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide, October 23, 2026", url: APPLE_NEWSROOM },
    { label: "MacRumors: US Apple Store pickup for the iPhone Duo resumes, October 24, 2026", url: MACRUMORS },
    { label: "Wikipedia: Stockout (the term behind “out of stock” and “back in stock”)", url: WIKI_STOCKOUT },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, about: { "@id": `${SITE}/#organization` }, isPartOf: { "@id": `${SITE}/#website` }, description, dateModified: now.toISOString() },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "iPhone Duo back in stock: live pickup listings and confirmed restocks at US Apple Stores",
        description: `How many of the ${STORES.length} US Apple Stores have an iPhone Duo listed for in-store pickup at this minute, plus every confirmed restock (two agreeing reads of apple.com, first sightings left out) with its store, configuration and local time, grouped by state and by configuration, with the seconds each listing lasted; every store read every ${SPEED.checkSec} seconds, stores with alerts every ${SPEED.fastSec}.`,
        url: `${SITE}${PATH}`, creator: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "United States: every Apple Store",
        variableMeasured: ["Apple Store", "US state", "iPhone Duo storage and color", "pickup listing at this minute", "time of each confirmed restock", "confirmed restocks over 24 hours", "seconds a listing lasted"],
        ...(have ? { size: `${n(t.n)} confirmed restocks at ${t.stores} stores` } : {}),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { label: "iPhone Duo back in stock" }]} />
      <h1 className="display mt-3 text-3xl sm:text-5xl">Is the iPhone Duo back in stock right now?</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">
        {stockUnknown
          ? <>No live answer for this request: the read of apple.com pickup availability failed, so the number of the <b className="text-ink">{STORES.length}</b> US Apple Stores with an iPhone Duo at this minute is unknown</>
          : yesNow
            ? <>Yes. At this minute <b className="text-ink">{storesNow}</b> of the <b className="text-ink">{STORES.length}</b> US Apple Stores {storesNow === 1 ? "has" : "have"} an iPhone Duo listed for in-store pickup</>
            : <>No. At this minute <b className="text-ink">none</b> of the {STORES.length} US Apple Stores has an iPhone Duo listed for pickup</>}
        {h24Clause}
        {latestClause}
      </p>
      <p className="mt-3 text-sm text-ink-3">As of {asOf} · tracked since {longDate(TRACKING_SINCE_US)} · {STORES.length} US Apple Stores · checks {CHECK_NOTE}</p>

      <StatGrid cols={4} className="mt-6">
        <Stat value={stockUnknown ? "–" : `${storesNow}/${STORES.length}`} label="US Apple Stores with an iPhone Duo listed for pickup at this minute" tone={yesNow ? "ok" : "muted"} live={nowKnown} />
        <Stat value={h24.unknown ? "–" : n(h24.restocks)} label={h24.unknown ? "restocks over the last 24 hours (not readable for this request)" : <>confirmed restocks over the last 24 hours · {plural(h24.stores, "store")}</>} tone={h24.restocks > 0 ? "plain" : "muted"} />
        {latest
          ? <Stat size="sm" value={clockAt(latest.at, latest.store)} label={<>newest restock · {appleName(latest.store)}, {cityLine(latest.store)} · local time, {dayWord(latest.at, latest.store, now)}</>} />
          : <Stat value="–" label="newest confirmed restock" tone="muted" />}
        {sell
          ? <Stat value={sell.medianSec} unit="s" label={<>median listing, seen to gone · {n(sell.n)} sold-out restocks since {since}</>} tone="warn" />
          : ds
            ? <Stat value={ds.medianSec} unit="s" label={<>median listing, seen to gone · last 7 days</>} tone="warn" />
            : <Stat value="–" label="median seconds a listing lasts (stated from 10 timed sell-outs)" tone="muted" />}
      </StatGrid>
      <Points className="mt-4" items={[
        have
          ? { text: <><b className="text-ink">{n(t.n)}</b> confirmed restocks at {t.stores} of {STORES.length} stores since {since}</> }
          : { text: <>Counting since {since}; every event sits in <Link href="/restock-log">the restock log</Link></> },
        { text: <>One <b className="text-ink">&ldquo;back in stock&rdquo;</b> = one store × one configuration flipping from unavailable to available on apple.com, held to a second read about a second later</> },
        { text: <>Every US Apple Store is read every <b className="text-ink">{SPEED.checkSec} seconds</b>; a store with an alert on it every {SPEED.fastSec}</> },
        { text: <>The 12 newest restocks are listed below, latest on top</>, step: true },
      ]} />
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={alert} className="btn btn-primary">Push me when it comes back</Link>
        <Link href="/in-stock/iphone-duo" className="btn btn-ghost">Every store, live</Link>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.nav}</a>)}
      </nav>
      <Figure id="apple-store-pickup-counter" eager />

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- right now */}
        <section id="now" className="scroll-mt-24">
          <h2>{h2Of("now")}</h2>
          <p><b>{stockUnknown
            ? `No answer for this request: the live read failed, and a failed read is not a zero. The restocks listed below come from the log and stand.`
            : yesNow
              ? `Yes. ${storesNow} of the ${STORES.length} US Apple Stores ${storesNow === 1 ? "has" : "have"} an iPhone Duo listed for in-store pickup as of ${asOf}${h24.unknown ? "" : `; 24-hour tally ${n(h24.restocks)} confirmed ${h24.restocks === 1 ? "restock" : "restocks"} across ${plural(h24.stores, "store")}`}; a yes here is good for about ${band ?? "a minute"}, so act on it now rather than later.`
              : `No. None of the ${STORES.length} US Apple Stores has an iPhone Duo listed for pickup as of ${asOf}${h24.unknown ? "" : h24.restocks === 0 ? "; the past day logged no confirmed restock either" : `; still, the past day logged ${n(h24.restocks)} confirmed ${h24.restocks === 1 ? "restock" : "restocks"} across ${plural(h24.stores, "store")}`}; for a phone that sells out in about ${band ?? "a minute"}, "unavailable" is the resting state.`}</b></p>
          <StatGrid cols={4} className="my-4">
            <Stat value={stockUnknown ? "–" : storesNow} label="stores with one listed at this minute" tone={yesNow ? "ok" : "muted"} live={nowKnown} />
            <Stat value={h24.unknown ? "–" : n(h24.restocks)} label="restocks over the last 24 h" tone={h24.restocks > 0 ? "plain" : "muted"} />
            <Stat value={h24.unknown ? "–" : `${h24.stores}/${STORES.length}`} label="stores that restocked in 24 h" tone={h24.stores > 0 ? "plain" : "muted"} />
            <Stat value={h24.unknown ? "–" : `${configs24}/${items.length}`} label="configurations seen back in 24 h" tone={configs24 > 0 ? "plain" : "muted"} />
          </StatGrid>
          <Keys items={[
            { text: <>Each card below is one confirmed restock, <b className="text-ink">latest on top</b>; a dimmed card has sold out again since</> },
            { text: <>A <a href={WIKI_STOCKOUT} target="_blank" rel="noopener">stockout</a> ends the moment apple.com marks a configuration available for pickup; <b className="text-ink">that moment is the record</b>, store by store</> },
            { text: <>Apple&apos;s <a href={APPLE_PICKUP} target="_blank" rel="noopener">pickup page</a> says what a store can hand over now and nothing about the next batch</> },
            { text: <>The whole record since {since}, with filters: <Link href="/restock-log">the restock log</Link></>, step: true },
          ]} />
          <div className="my-5 [&_a]:no-underline">
            <RestockFeed rows={feedRows} model="duo" showModel={false} emptyText={feedUnknown || t.unknown ? "The restock log did not come back for this request." : `No iPhone Duo restock has been confirmed since ${since}.`} />
          </div>
          <ChipLinks items={[{ href: "/restock-log", label: "Restock log, every event" }, { href: "/in-stock/iphone-duo", label: "Live stock, store by store" }, { href: "/apple-store-pickup-explained", label: "What apple.com's wording means" }]} />
        </section>

        {/* ---------------------------------------------------------------- where */}
        <section id="where" className="scroll-mt-24">
          <h2>{h2Of("where")}</h2>
          <p><b>{whereLead}</b></p>
          {active.length > 0 ? (
            <Table caption={`States with an iPhone Duo listed at this minute or a confirmed restock in the last 24 hours, stock first; ${quietStates === 0 ? "every state is here" : `${plural(quietStates, "other state has", "other states have")} neither`}. ${v.feedComplete ? "" : "The 24-hour columns cover the newest 1,000 restocks only."}`.trim()} head={["State", "Stores with one now", "Restocks, 24 h", "Stores restocked, 24 h", "Newest, local time"]} min="36rem">
              {active.map((s) => (
                <tr key={s.name} className={`border-b border-line ${s.now > 0 ? "bg-ok/[0.06]" : ""}`}>
                  <th scope="row" className={rowTh}><Link href={s.path} className="hover:underline">{s.name}</Link></th>
                  <td className={`${td} ${s.now > 0 ? "font-semibold text-ok" : ""}`}>{stockUnknown ? "–" : `${s.now} of ${s.total}`}</td>
                  <td className={td}>{n(s.restocks)}</td>
                  <td className={td}>{s.stores ? `${s.stores} of ${s.total}` : "–"}</td>
                  <td className="py-2 pe-3 align-top">{s.latest ? <>{localStamp(s.latest.at, s.latest.store)} · {storeLink(s.latest.store)}</> : DASH}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <Keys items={[{ text: <>No state has a listing at this minute or a confirmed restock in the last 24 hours; the table returns with the next one</>, no: true }]} />
          )}
          <Keys items={[
            { text: <>&ldquo;Stores with one now&rdquo; is live to the last {SPEED.checkSec}-second read; the 24-hour columns count confirmed restocks only, first sightings left out</> },
            { text: <><b className="text-ink">Big states sit on top</b> because they have more stores, not because any one store there is likelier to have one</> },
            { text: <>Prefer distance to state lines: <Link href="/iphone-duo-in-stock-near-me">iPhone Duo near me</Link> sorts by your location or ZIP</>, step: true },
          ]} />
          <ChipLinks items={[{ href: "/iphone-duo-in-stock-near-me", label: "Nearest stores with one" }, { href: "/live-map", label: "Every store on the map" }, { href: "/apple-stores", label: "Store list, state by state" }]} />
        </section>

        {/* ---------------------------------------------------------------- configurations */}
        <section id="configurations" className="scroll-mt-24">
          <h2>{h2Of("configurations")}</h2>
          <p><b>{configLead}</b></p>
          {have && topCfg && topCfg.restocks > 0 && (
            <StatGrid cols={3} className="my-4">
              {configs.slice(0, 3).map((c, i) => (
                <Stat key={c.item.partNumber} value={n(c.restocks)} label={<><span className="inline-flex items-center gap-1.5"><Swatch color={c.item.color} className="h-2.5 w-2.5" />{c.name}</span> · {pct(c.share)} of all restocks · {fmtPrice(c.item.price)}</>} tone={i === 0 ? "accent" : "plain"} />
              ))}
            </StatGrid>
          )}
          <Table caption={`The ${items.length} iPhone Duo configurations across the ${STORES.length} US Apple Stores, ranked by confirmed restocks; Apple's list prices before sales tax`} head={["Configuration", "Price", `Restocks since ${since}`, "Share", "24 h", "Stores with it now", "Newest restock, local time"]} min="44rem">
            {configs.map((c) => (
              <tr key={c.item.partNumber} className="border-b border-line">
                <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={c.item.color} />{c.name}</span></th>
                <td className={td}>{fmtPrice(c.item.price)}</td>
                <td className={td}>{t.unknown ? "–" : n(c.restocks)}</td>
                <td className={td}>{t.unknown || !t.n ? "–" : pct(c.share)}</td>
                <td className={td}>{h24.unknown ? "–" : n(c.h24)}</td>
                <td className={td}>{stockUnknown ? "–" : c.now ? <span className="font-semibold text-ok">{c.now} of {STORES.length}</span> : `0 of ${STORES.length}`}</td>
                <td className="py-2 pe-3 align-top">{c.lastAt && c.lastStore ? <>{localStamp(c.lastAt, c.lastStore)} · {storeLink(c.lastStore)}</> : DASH}</td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>Shares are shares of restocks, never of units; Apple shows availability and no quantities</> },
            { text: <>An alert is <b className="text-ink">a single store plus a single configuration</b>; two acceptable colors at one store take two alerts</> },
            ratio && topCfg && lastCfg
              ? { text: <>Our reading: holding out for <b className="text-ink">{lastCfg.name}</b> means joining the slowest queue; {topCfg.name} has returned {times(ratio)} as often, and a case hides the color anyway</>, no: true }
              : have
                ? { text: <>Our reading: {storageWins ? "fix the storage you want and take either color; storage has moved the odds more than color so far" : "take whichever color returns more in the size you want; color has moved the odds more than storage so far"}</> }
                : { text: <>Our reading: fix the storage you want and take either color; a configuration you would send back is a reservation someone else lost</> },
            { text: <>Storage versus color, and the rarest size: <Link href="/iphone-duo-most-restocked-stores">the configuration ranking</Link></>, step: true },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- how long */}
        <section id="how-long" className="scroll-mt-24">
          <h2>{h2Of("how-long")}</h2>
          <p><b>{howLongLead}</b></p>
          {sell && (
            <StatGrid cols={4} className="my-4">
              <Stat value={sell.medianSec} unit="s" label={<>median listing, seen to gone · {n(sell.n)} sold-out restocks</>} tone="accent" />
              <Stat value={pct(sell.within2min)} label="sold out inside 2 minutes" tone="warn" />
              <Stat value={pct(sell.within20min)} label="sold out inside 20 minutes" />
              <Stat value={sell.fastestSec} unit="s" label="quickest sell-out on record" />
            </StatGrid>
          )}
          {ds && (
            <Keys items={[
              { text: <>Last 7 days: median <b className="text-ink">{ds.medianSec} s</b> across {n(ds.n)} sold-out restocks, <b className="text-ink">{pct(ds.within30)}</b> gone inside 30 seconds</> },
              { text: <>A tracker reading once a minute would have caught about {pct(ds.caught.m1)} of them; one reading every 5 minutes, {pct(ds.caught.m5)}</>, no: true },
            ]} />
          )}
          <p>The count at the top of this page describes this minute; the log under it describes how often the minute comes round, which is why both are here. The phone is bought out faster than it arrives, so <b className="text-ink">unavailable is the resting state</b> and available is the exception, lasting about {band ?? "a minute"}. &ldquo;Back in stock&rdquo; is an event timed in seconds, not a page you can browse to.</p>
          <ol className="my-4 grid sm:grid-cols-2 gap-3">
            <Swap no="Hunt for whichever store is 'back in stock' this minute" yes="Stage checkout first, then wait for the push" why="The people who get the phone did the setup before the alert: signed in, Apple Pay ready, the buy page open." />
            <Swap no="Refresh apple.com by hand all day" yes={<>Hear about a confirmed restock about {SPEED.alertSec} seconds after it lands</>} why={band ? `At roughly ${band} per listing, most restocks start and end between two refreshes.` : "At seconds per listing, most restocks start and end between two refreshes."} />
          </ol>
          <Keys items={[
            { text: <>Every duration sits between two of our reads, so it is an <b className="text-ink">upper bound</b>; the real listing was shorter</> },
            { text: <>Each restock with the seconds it lasted: <Link href="/how-fast-does-iphone-duo-sell-out">the sell-out timer</Link></>, step: true },
          ]} />
          <Figure id="apple-store-queue" />
        </section>

        {/* ---------------------------------------------------------------- when */}
        <section id="when" className="scroll-mt-24">
          <h2>{h2Of("when")}</h2>
          <p><b>{whenLead}</b></p>
          {have && (
            <StatGrid cols={4} className="my-4">
              {pattern
                ? <Stat size="sm" value={rangeLabel(w.from, w.to)} label={<>peak two-hour window, store time · {pct(w.share)} of {n(t.n)}</>} tone="accent" />
                : <Stat value={`${t.days}/${tracked}`} label="restock days out of days on the wire" />}
              <Stat value={t.today ? n(t.today.restocks) : "0"} label={t.today ? <>restocks so far today · {plural(t.today.stores, "store")}</> : "restocks so far today"} tone={t.today && t.today.restocks > 0 ? "plain" : "muted"} />
              <Stat value={`${t.days}/${tracked}`} label="tracked days that saw a restock" />
              {t.peakWeekday != null
                ? <Stat size="sm" label="top weekday so far" value={WEEKDAYS[t.peakWeekday]} />
                : <Stat value="–" label={<>busiest weekday: named once restocks span 14 days (they span {t.spanDays})</>} tone="muted" />}
            </StatGrid>
          )}
          <Keys items={[
            { text: <>A window is a <b className="text-ink">share</b>, not an appointment; restocks land outside it as well</> },
            { text: <>Apple Stores have had the iPhone Duo since <a href={APPLE_NEWSROOM} target="_blank" rel="noopener"><b className="text-ink">October 23, 2026</b></a>; US pickup reservations reopened the day after (<a href={MACRUMORS} target="_blank" rel="noopener">MacRumors</a>) and have come in bursts since</> },
            { text: <>Hour-by-hour and day-by-day for the whole US: <Link href="/when-does-iphone-duo-restock">the restock clock</Link></>, step: true },
          ]} />
          <p>Every state and two-plus-store city has the same question answered with its own stores and local hours, for instance <Link href="/when-does-iphone-duo-restock/california">California</Link> and <Link href="/when-does-iphone-duo-restock/new-york/new-york">New York City</Link>.</p>
          <ChipLinks items={[{ href: "/when-does-iphone-duo-restock", label: "US restock hours and days" }, { href: "/when-does-iphone-duo-restock/california", label: "California" }, { href: "/when-does-iphone-duo-restock/new-york/new-york", label: "New York City" }]} />
        </section>

        {/* ---------------------------------------------------------------- alerts */}
        <section id="alerts" className="scroll-mt-24">
          <h2>{h2Of("alerts")}</h2>
          <p><b>{PRICE_SENTENCE}</b> No iPhone stock tracker we know of publishes a shorter interval (the others publish {OTHER_TRACKERS}), and against a listing that lasts about {band ?? "a minute"} that gap decides whether the push is something you can act on or news about a phone already gone.</p>
          <StepStrip className="lg:grid-cols-3! my-4" steps={[
            { title: "Stage Apple's checkout", hint: <>signed in, Apple Pay ready, the configuration&apos;s buy page open; when the push lands, switch the store and pay</> },
            { title: "Choose the store and configuration", hint: <>each alert is a single Apple Store and a single storage + color; pick the two or three you could reach by morning, not ten far away</> },
            { title: "Put RestockWire on your Home Screen", hint: <>on iPhone, add it from Safari and allow notifications once; alerts come as pushes, or by email while no device is set up</> },
          ]} />
          <Keys items={[
            { text: <>One push per restock, naming the store and the configuration; sell-outs send nothing</> },
            { text: <><b className="text-ink">{PLANS.plus.name}</b> ${PLANS.plus.priceUsd}/month for {PLANS.plus.limit} alerts · {PLANS.pro.name} ${PLANS.pro.priceUsd} for {PLANS.pro.limit} · {PLANS.max.name} ${PLANS.max.priceUsd} for {PLANS.max.limit}; browsing costs nothing</> },
            { text: <>Checking by hand costs nothing and is nearly always late</>, no: true },
          ]} />
          <ChipLinks items={[{ href: "/iphone-duo-restock-alerts", label: "What an alert covers" }, { href: "/iphone-duo-restock-checkout-guide", label: "Checkout in 20 seconds, tap by tap" }, { href: "/phone-alerts", label: "Put the app on your Home Screen" }]} />
          <p><Link href={alert} className="btn btn-primary no-underline!">Set an iPhone Duo alert</Link></p>
          <Figure id="phone-notification" />
        </section>

        {/* ---------------------------------------------------------------- abroad */}
        <section id="abroad" className="scroll-mt-24">
          <h2>{h2Of("abroad")}</h2>
          <p><b>{abroadLead}</b></p>
          <Table caption={`Apple Stores with an iPhone Duo listed for pickup at this minute, by country; tracked since ${longDate(TRACKING_SINCE_INTL)}, each country with its own part numbers and prices. A country whose read failed shows 0 for this request.`} head={["Country", "Stores with one now", "Apple Stores tracked"]} min="22rem">
            {intl.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now > 0 ? "bg-ok/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={c.href} className="hover:underline">{c.name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-ok" : ""}`}>{c.now}</td>
                <td className={td}>{c.total}</td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>Alerts reach these stores too, on the same {SPEED.fastSec}-second wire</> },
            { text: <>Same {SPEED.checkSec}-second reads, same two-read rule, since <b className="text-ink">{longDate(TRACKING_SINCE_INTL)}</b></> },
            { text: <>Each country&apos;s own restock hours: <Link href="/ca/when-does-iphone-duo-restock">Canada</Link>, <Link href="/uk/when-does-iphone-duo-restock">the UK</Link>, <Link href="/au/when-does-iphone-duo-restock">Australia</Link>, <Link href="/jp/when-does-iphone-duo-restock">Japan</Link></>, step: true },
          ]} />
          <Measured title="Where the numbers come from">
            Every {SPEED.checkSec} seconds (every {SPEED.fastSec} for a store an alert points at) RestockWire asks apple.com whether each iPhone Duo configuration is available for in-store pickup at each Apple Store it tracks. A restock enters the log when two reads about a second apart both show the configuration listed; the first sighting of a store × configuration never counts; a sell-out is confirmed on the next round. None of this is a forecast, a carrier&apos;s stock or a delivery date.
          </Measured>
          <p className="text-sm text-ink-3">Cite this page: quote any figure freely, with a link back. RestockWire is independent of Apple and reads the same public pickup availability any shopper sees on apple.com, only far more often.</p>
        </section>
      </div>

      <RelatedBlock>
        <LinkRow title="Other ways of asking" links={[
          { href: "/iphone-duo-availability-checker", label: "Check iPhone Duo stock" },
          { href: "/where-to-buy-iphone-duo-today", label: "Buying one today: where" },
          { href: "/when-does-iphone-duo-restock", label: "US restock hours" },
          { href: "/how-fast-does-iphone-duo-sell-out", label: "Sell-out seconds" },
          { href: "/iphone-duo-restock-alerts", label: "What an alert does" },
          { href: "/iphone-duo-in-stock-near-me", label: "iPhone Duo near me" },
          { href: "/how-to-buy-an-iphone-duo-in-store", label: "How to get an iPhone Duo in store" },
          { href: "/iphone-duo-restock-checkout-guide", label: "Checkout in 20 seconds" },
          { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
          { href: "/apple-store-pickup-explained", label: "Apple pickup wording, decoded" },
        ]} />
        <LinkRow title="Live right now" links={[
          { href: "/in-stock/iphone-duo", label: "iPhone Duo stock, store by store" },
          { href: "/restock-log", label: "Restock log" },
          { href: "/live-map", label: "Live map" },
          { href: "/apple-stores", label: "Store list, state by state" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq title="Asked often" items={faq} facts={facts} /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`the ${STORES.length} US Apple Stores (plus the stores of ${INTL_CODES.length} other countries since ${longDate(TRACKING_SINCE_INTL)})`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
