/**
 * /when-does-iphone-duo-restock/{state} and /when-does-iphone-duo-restock/{state}/{city}: "When does the iPhone Duo restock in
 * Los Angeles?" answered for one US state or two-plus-store city, in the shape an answer engine quotes (docs/research.md
 * §8): the title is the question, the first sentence carries the share, the sample size, the since-date and the local
 * time, the date it was updated is visible, and every table is the place's own stores. Every number is RestockWire's
 * own confirmed observation over the place's stores (lib/content/restockTimes.ts, duoRestockTimesAt), compared with
 * the national figures where that says something. English only: these pages exist for the US tree.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock, type Crumb } from "@/components/seo/Related";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { Chips, Measured, Points, Stat, StatGrid, StepStrip, Swap, type Point } from "@/components/ui/Viz";
import { emptyFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { STATE_CODES, STORES, appleName, catalogFor, cityPath, citiesWithStores, hasStatePage, statePath, statesWithStores, storeByNumber, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { busiestWindow, duoRestockTimes, duoRestockTimesAt, hourShare, rangeLabel, restockTimesPath, type DayRow, type RestockTimes } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAYS, WEEKDAY_MIN_SPAN, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { recentByConfig } from "@/lib/stock/recent";
import { RestockHeatmap } from "@/components/restocks/RestockHeatmap";
import { restockHeatmap } from "@/lib/content/wire";
import { storesStock, storesWithStockNow } from "@/lib/stock/queries";
import { alertHref, fitTitle, plural } from "@/lib/seo/enrich";
import { nearbyCities, neighborStates } from "@/lib/seo/links";
import { CHECK_NOTE, PLANS, SPEED } from "@/lib/plans";
import { placePhotos } from "@/content/place-photos";

const SITE = "https://restockwire.com";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const WIKI_MEDIAN = "https://en.wikipedia.org/wiki/Median";

/** A US state with a page of its own, or a two-plus-store city (the only places with a restock-times page). */
export interface RestockPlace {
  kind: "state" | "city";
  state: string;
  stateSlug: string;
  stateCode: string;
  city?: string;
  citySlug?: string;
  /** As sentences say it: "Los Angeles", "New York City", "Texas", "Washington State". */
  name: string;
  /** As the breadcrumb says it: "Los Angeles", "Texas". */
  label: string;
  stores: Store[];
  /** /apple-stores/{state}[/{city}]: the place's live page. */
  storesHref: string;
  /** This page. */
  href: string;
}

/** The two names titles and sentences use where the plain city or state name would mislead (placeCopy.ts says the same). */
const SAID: Record<string, string> = { "city:New York|New York": "New York City", "state:Washington": "Washington State" };

/** The state's page place, or null when the state has no page of its own (one store, or one city: the proxy 308s). */
export function statePlaceOf(slug: string): RestockPlace | null {
  const s = statesWithStores().find((x) => x.slug === slug);
  if (!s || !hasStatePage(s.name)) return null;
  const stores = STORES.filter((x) => x.state === s.name).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  const name = SAID[`state:${s.name}`] ?? s.name;
  return { kind: "state", state: s.name, stateSlug: s.slug, stateCode: s.code, name, label: s.name, stores, storesHref: statePath(s.name), href: `/when-does-iphone-duo-restock/${s.slug}` };
}

/** The city's page place, or null for a one-store city (its store's page answers) or an unknown one. */
export function cityPlaceOf(state: string, city: string): RestockPlace | null {
  const c = citiesWithStores().find((x) => x.stateSlug === state && x.slug === city);
  if (!c || c.stores.length < 2) return null;
  const stores = [...c.stores].sort((a, b) => a.name.localeCompare(b.name));
  const name = SAID[`city:${c.name}|${c.state}`] ?? c.name;
  return { kind: "city", state: c.state, stateSlug: c.stateSlug, stateCode: STATE_CODES[c.state] ?? c.state, city: c.name, citySlug: c.slug, name, label: c.name, stores, storesHref: cityPath(c.state, c.name), href: `/when-does-iphone-duo-restock/${c.stateSlug}/${c.slug}` };
}

/** Every place with a page: the states first, then the cities (sitemap, the national page's link rows). */
export function restockPlaces(): { states: RestockPlace[]; cities: RestockPlace[] } {
  const states = statesWithStores().map((s) => statePlaceOf(s.slug)).filter((p): p is RestockPlace => Boolean(p));
  const cities = citiesWithStores().filter((c) => c.stores.length > 1).map((c) => cityPlaceOf(c.stateSlug, c.slug)).filter((p): p is RestockPlace => Boolean(p));
  return { states, cities };
}

/* ---------------------------------------------------------------- formats */

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; under half a percent reads "<1%", never "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "Nov 5, 2026, 10:12 AM PST": the visible "updated" stamp, in the place's zone. */
const updatedStamp = (iso: string, tz: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
const secs = (s: number) => (s < 120 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
/** "about 70 seconds", "about 3 minutes": the sell-out median as a sentence says it. */
const about = (s: number) => (s < 100 ? `about ${Math.round(s / 5) * 5} seconds` : s < 3600 ? `about ${Math.round(s / 60)} minutes` : `about ${(s / 3600).toFixed(1)} hours`);

/** "Pacific time", "Eastern time"; a place across two zones says "store local time". */
const ZONE_WORD: Record<string, string> = {
  "America/New_York": "Eastern", "America/Detroit": "Eastern", "America/Kentucky/Louisville": "Eastern", "America/Indiana/Indianapolis": "Eastern",
  "America/Chicago": "Central", "America/Denver": "Mountain", "America/Boise": "Mountain", "America/Phoenix": "Arizona",
  "America/Los_Angeles": "Pacific", "America/Anchorage": "Alaska", "Pacific/Honolulu": "Hawaii", "America/Puerto_Rico": "Atlantic",
};
function zoneWord(stores: Store[]): { word: string; one: boolean; tz: string } {
  const zones = [...new Set(stores.map((s) => storeTimeZone(s)))];
  const tz = zones[0];
  if (zones.length === 1 && ZONE_WORD[tz]) return { word: `${ZONE_WORD[tz]} time`, one: true, tz };
  return { word: "store local time", one: zones.length === 1, tz };
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";

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

function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/* ---------------------------------------------------------------- data */

const load = cache(async (place: RestockPlace) => {
  const numbers = place.stores.map((s) => s.storeNumber);
  return Promise.all([duoRestockTimesAt("us", place.stores), duoRestockTimes("us"), storesWithStockNow(numbers, "us"), recentByConfig({ storeNumbers: numbers, country: "us" }), storesStock(numbers), restockHeatmap({ storeNumbers: numbers, country: "us", model: "duo" })] as const);
});

/** "58% of the 412 iPhone Duo restocks … since October 29, 2026 landed between 9 and 11 AM Pacific time": the sentence everything else repeats. */
function quotable(place: RestockPlace, t: RestockTimes, zone: string): string {
  const k = place.stores.length;
  const where = `${k} Apple Stores in ${place.name}`;
  if (t.unknown) return `The restock log for the ${where} did not load this time. The stores stay on the wire every ${SPEED.checkSec} seconds; reload and the numbers come back.`;
  if (t.n === 0) return `Not yet: RestockWire has read the ${where} every ${SPEED.checkSec} seconds since ${longDate(t.since)} and has confirmed no iPhone Duo pickup restock there.`;
  const w = busiestWindow(t.byHour);
  if (t.peakHour != null) {
    return `Mostly between ${rangeLabel(w.from, w.to)} ${zone}: that window holds ${pct(w.share)} of the ${n(t.n)} iPhone Duo restocks RestockWire confirmed at the ${where} since ${longDate(t.since)}${t.sellout ? `, and a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
  }
  return `No usual hour yet: the ${where} have restocked the iPhone Duo ${plural(t.n, "time")} on ${plural(t.days, "day")} since ${longDate(t.since)}, and RestockWire names an hour only after ${PATTERN_MIN} restocks over ${PATTERN_MIN_DAYS} different days${t.sellout ? `; a typical one sold out in ${about(t.sellout.medianSec)}` : ""}.`;
}

/**
 * The question is the title; "Times by Hour" rides along only while the whole tag (with the " · RestockWire" suffix,
 * 16 characters) stays within the 65 Bing's URL inspection flags as "title too long". Never truncated: a long place
 * name keeps its full question.
 */
function titleOf(place: RestockPlace): string {
  const q = `When Does the iPhone Duo Restock in ${place.name}?`;
  return q.length + " Hour by Hour".length + 16 <= 65 ? `${q} Hour by Hour` : q;
}

export async function placeRestockTimesMetadata(place: RestockPlace): Promise<Metadata> {
  const [t] = await load(place);
  const title = titleOf(place);
  const zone = zoneWord(place.stores).word;
  const q = quotable(place, t, zone);
  const description = fitTitle([q, `${q.split(";")[0].split(", and a typical")[0]}.`, `${n(t.n)} confirmed iPhone Duo restocks in ${place.name} since ${dateLabel(t.since, false)}: the hours, days and stores they landed at.`], 158);
  return {
    title: { absolute: `${title} · RestockWire` },
    description,
    alternates: { canonical: place.href },
    openGraph: { type: "article", siteName: "RestockWire", title, description, url: place.href },
  };
}

export async function PlaceRestockTimesPage({ place }: { place: RestockPlace }) {
  const [t, us, stockNow, recent, stock, heat] = await load(place);
  const { stores } = place;
  const k = stores.length;
  const city = place.kind === "city";
  const zone = zoneWord(stores);
  const facts = emptyFacts("us");
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? `${i.storage} ${i.color}` : p; };
  const w = busiestWindow(t.byHour);
  const uw = busiestWindow(us.byHour);
  const pattern = t.peakHour != null;
  const duoNow = stockNow.duo;
  const today = t.today;
  const tracked = Math.max(t.daily.length, t.days, 1);
  const hours = t.byHour.map((count, hour) => ({ hour, count })).filter((h) => h.count > 0);
  const topHours = [...hours].sort((a, b) => b.count - a.count).slice(0, 3);
  const busiestDay = t.daily.reduce<DayRow | null>((a, d) => (d.restocks > (a?.restocks ?? 0) ? d : a), null);
  const weekend = t.byWeekday[0] + t.byWeekday[6];
  const sell = t.sellout;
  const storeRows = t.topStores.map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r) => r.store);
  const quiet = stores.filter((s) => !t.topStores.some((r) => r.storeNumber === s.storeNumber));
  const top = storeRows[0];
  const parts = t.byPart;
  const topPart = parts[0];
  const lastPart = parts.length ? parts[parts.length - 1] : undefined;
  const latestStore = t.latest ? storeByNumber(t.latest.storeNumber) : undefined;
  const nowAt = (s: Store) => (stock.get(s.storeNumber)?.perModel.duo.available ?? 0) > 0;
  const alert = alertHref({ model: "duo", state: place.stateSlug, city: place.citySlug });
  const stateHref = hasStatePage(place.state) ? restockTimesPath(place.state) : null;
  const share = t.n && us.n ? Math.round((t.n / us.n) * 1000) / 10 : 0;
  const lead = quotable(place, t, zone.word);
  const title = titleOf(place);
  const h1 = `When does the iPhone Duo restock in ${place.name}?`;
  const [photo1, photo2] = placePhotos(city ? `${place.city}, ${place.state}` : place.state);

  // Sideways: the state's other cities with a page, the bordering states' pages; a city's nearest other cities' pages.
  const cityPages = citiesWithStores().filter((c) => c.state === place.state && c.stores.length > 1 && c.slug !== place.citySlug).map((c) => ({ href: restockTimesPath(c.state, c.name), label: c.name, meta: String(c.stores.length) }));
  const neighborPages = neighborStates(place.state).filter((s) => hasStatePage(s.name)).map((s) => ({ href: restockTimesPath(s.name), label: s.name, meta: String(s.count) }));
  const mid = { lat: stores.reduce((a, s) => a + s.lat, 0) / k, lng: stores.reduce((a, s) => a + s.lng, 0) / k };
  const nearPages = city ? nearbyCities(mid.lat, mid.lng, { limit: 10, maxMiles: 200 }).filter((c) => c.count > 1 && !(c.state === place.state && c.name === place.city)).slice(0, 6).map((c) => ({ href: restockTimesPath(c.state, c.name), label: `${c.name}, ${c.stateCode}`, meta: `${Math.round(c.distance)} mi` })) : [];

  const sections = [
    { id: "time-of-day", nav: "Restock hour", h2: `What hour do ${place.name} Apple Stores restock the iPhone Duo?` },
    { id: "day-by-day", nav: "Every day", h2: `On which days did ${place.name} get iPhone Duo restocks?` },
    { id: "stores", nav: city ? "Each store" : "Each store and city", h2: `Which ${place.name} Apple Store gets the most iPhone Duo restocks?` },
    { id: "configuration", nav: "Storage and color", h2: `Which storage and color come back most in ${place.name}?` },
    { id: "how-long", nav: "Sell-out speed", h2: `How fast does an iPhone Duo restock sell out in ${place.name}?` },
    { id: "right-now", nav: "Live now", h2: `Does any ${place.name} Apple Store list the iPhone Duo now?` },
    { id: "alerts", nav: "Get the next one", h2: `How do you get the next ${place.name} restock in time?` },
    { id: "method", nav: "Method", h2: "What counts as a restock on this page?" },
  ];
  const h2Of = (id: string) => sections.find((s) => s.id === id)!.h2;

  const faq: Faq[] = [
    { q: `What time should I watch for an iPhone Duo restock in ${place.name}?`, a: t.n > 0 && pattern
      ? `${lead} The single busiest hour is ${rangeLabel(t.peakHour!, t.peakHour! + 1)} (${n(t.byHour[t.peakHour!])} restocks) and ${pct(hourShare(t.byHour, 8, 12))} landed between 8 AM and noon; Apple publishes no schedule, so this is RestockWire's own count over the ${k} stores, refreshed roughly every five minutes.`
      : `${lead} Apple publishes no schedule; until ${place.name} has enough restocks, [the US page](/when-does-iphone-duo-restock) carries the national pattern.` },
    { q: `Is the iPhone Duo more likely to come back on a weekend in ${place.name}?`, a: t.n > 0
      ? `${weekend > 0 ? "It happens" : "Not so far"}: ${plural(weekend, "restock")} of ${n(t.n)} fell on a Saturday or Sunday (${pct(weekend / t.n)}). ${t.peakWeekday != null ? `${WEEKDAYS[t.peakWeekday]} leads the week.` : `A busiest weekday is named only once the data spans ${WEEKDAY_MIN_SPAN} days; it spans ${tracked}.`}`
      : `No weekend figure for ${place.name} yet; the day-by-day table fills in from the first confirmed restock.` },
    { q: `Which store in ${place.name} should I put an alert on first?`, a: top
      ? `[${appleName(top.store!)}](${storePath(top.store!)}) has the most: ${plural(top.restocks, "confirmed restock")} on ${plural(top.days, "day")} since ${longDate(t.since)}${top.peakHour != null ? `, usually near ${hourLabel(top.peakHour)} local time` : ""}, the last ${localStamp(top.lastAt, top.store!)}. ${storeRows.length > 1 ? `Each store restocks on its own, so add the others you can reach${quiet.length ? `; ${plural(quiet.length, "store")} in ${place.name} ${quiet.length === 1 ? "has" : "have"} had none yet` : ""}.` : ""}`
      : `None yet: no Apple Store in ${place.name} has a confirmed iPhone Duo restock since ${longDate(t.since)}, and all ${k} stay on the wire every ${SPEED.checkSec} seconds.` },
    { q: `How many seconds do I have once a ${place.name} restock lands?`, a: sell
      ? `About ${secs(sell.medianSec)}: that is the [median](${WIKI_MEDIAN}) of ${n(sell.n)} timed restocks in ${place.name}, with ${pct(sell.within2min)} gone inside 2 minutes and ${pct(sell.within20min)} inside 20 (US median ${us.sellout ? secs(us.sellout.medianSec) : "about a minute"}). Each figure runs from the check that saw the listing to the check that saw it gone, so it is an upper bound.`
      : `Not enough local data: fewer than 10 ${place.name} restocks are timed to a sell-out, and nationally half are gone within ${us.sellout ? secs(us.sellout.medianSec) : "about a minute"} ([sell-out times](/how-fast-does-iphone-duo-sell-out)).` },
    { q: `What does an alert for ${place.name} cost, and how fast is it?`, a: `From $${PLANS.plus.priceUsd} a month: the stores you pick go on the ${SPEED.fastSec}-second wire and a push lands about ${SPEED.alertSec} s after a restock is confirmed. One alert is one store × one exact configuration, so [pick ${place.name} stores](${alert}) in the storage and color you would buy, then read [how alerts work](/iphone-duo-restock-alerts) and [the 20-second checkout](/iphone-duo-restock-checkout-guide).` },
  ];

  const sources: Source[] = [
    { label: "Apple: Shipping & Pickup, how in-store pickup works", url: APPLE_PICKUP },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide", url: APPLE_NEWSROOM },
    { label: "MacRumors: iPhone Duo pickup at US Apple Stores, October 24, 2026", url: MACRUMORS },
    { label: "Wikipedia: Median", url: WIKI_MEDIAN },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${place.href}`, url: `${SITE}${place.href}`, name: title, headline: h1, description: lead, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: t.at, inLanguage: "en-US" },
      {
        "@type": "Dataset", "@id": `${SITE}${place.href}#dataset`, name: `${place.name} Apple Stores: confirmed iPhone Duo restocks`,
        description: `Each iPhone Duo in-store pickup restock RestockWire confirmed at the ${k} Apple Stores in ${place.name} since ${longDate(t.since)}, read every ${SPEED.checkSec} seconds: counted by store, by local hour, by day and by configuration, with the seconds each one stayed listed.`,
        url: `${SITE}${place.href}`, creator: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true, temporalCoverage: `${t.since}/..`, dateModified: t.at,
        spatialCoverage: { "@type": "Place", name: city ? `${place.city}, ${place.stateCode}, US` : `${place.state}, US`, ...(city ? { containedInPlace: { "@type": "AdministrativeArea", name: place.state } } : {}) },
        variableMeasured: ["Confirmed restocks per store and per day", "Confirmed restocks per local hour", "Restocks per storage and color", "Seconds listed before sell-out"],
        ...(t.n ? { size: `${n(t.n)} restocks` } : {}),
        inLanguage: "en-US",
      },
    ],
  };

  const crumbs: Crumb[] = [
    { href: "/", label: "RestockWire" },
    { href: "/when-does-iphone-duo-restock", label: "iPhone Duo restock hours" },
    ...(city && stateHref ? [{ href: stateHref, label: place.state }] : []),
    { label: place.label },
  ];

  const heroTiles: ReactNode[] = t.n > 0 && !t.unknown
    ? [
      <Stat key="n" value={n(t.n)} label={`restocks confirmed at ${plural(k, "store")} since ${dateLabel(t.since, false)}`} tone="accent" />,
      pattern
        ? <Stat key="w" value={pct(w.share)} label={`landed ${rangeLabel(w.from, w.to)}, ${zone.word}`} />
        : <Stat key="d" value={`${t.days}/${tracked}`} label="days with a restock / days tracked" />,
      <Stat key="now" value={`${duoNow}/${k}`} label="stores listing one for pickup now" live />,
      today
        ? <Stat key="today" value={n(today.restocks)} label={`so far today (${dateLabel(today.date)}), at ${plural(today.stores, "store")}`} />
        : sell
          ? <Stat key="sell" value={sell.medianSec} unit="s" label="median seconds before a restock sold out" tone="warn" />
          : <Stat key="d2" value={`${t.days}/${tracked}`} label="days with a restock / days tracked" />,
    ]
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={crumbs} />
      <h1 className="display mt-3 text-3xl sm:text-5xl">{h1}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">
        {t.unknown || t.n === 0 ? lead : pattern ? (
          <>Mostly <b className="text-ink">between {rangeLabel(w.from, w.to)} {zone.word}</b>: that window holds <b className="text-ink">{pct(w.share)} of the {n(t.n)} iPhone Duo restocks</b> RestockWire confirmed at the {k} Apple Stores in {place.name} since {longDate(t.since)}{sell ? <>, and a typical one sold out in <b className="text-ink">{about(sell.medianSec)}</b></> : null}.</>
        ) : (
          <>No usual hour yet: the {k} Apple Stores in {place.name} have restocked the iPhone Duo <b className="text-ink">{plural(t.n, "time")} since {longDate(t.since)}</b> on {plural(t.days, "day")}, and we name an hour only after {PATTERN_MIN} restocks over {PATTERN_MIN_DAYS} different days{sell ? <>; a typical one sold out in <b className="text-ink">{about(sell.medianSec)}</b></> : null}.</>
        )}
      </p>
      <p className="mt-2 text-sm text-ink-3">{plural(k, "Apple Store")} on the wire, checked {CHECK_NOTE} · counting since {longDate(t.since)} · last update {updatedStamp(t.at, zone.tz)}</p>
      {heroTiles.length > 0 && <StatGrid cols={4} className="mt-6">{heroTiles}</StatGrid>}
      {!t.unknown && t.n > 0 && (
        <Points className="mt-4" items={[
          ...(t.latest && latestStore ? [{ text: <>Last one: <b className="text-ink">{cfg(t.latest.partNumber)}</b> at <Link href={storePath(latestStore)} className="underline underline-offset-2">{appleName(latestStore)}</Link>, {localStamp(t.latest.at, latestStore)} local time</> }] : []),
          ...(pattern && us.peakHour != null ? [{ text: <>{place.name} {Math.abs(w.share - uw.share) < 0.03 ? "tracks the US pattern" : w.share > uw.share ? "packs more into its window than the US does" : "spreads wider through the day than the US does"}: nationally <b className="text-ink">{pct(uw.share)}</b> of {n(us.n)} restocks land {rangeLabel(uw.from, uw.to)} store local time</> }] : []),
          ...(t.peakWeekday != null ? [{ text: <>Busiest weekday: <b className="text-ink">{WEEKDAYS[t.peakWeekday]}</b></> }] : []),
          { text: <>No schedule from Apple: <b className="text-ink">our own confirmed checks</b>, refreshed roughly every five minutes</>, no: true },
        ]} />
      )}
      {!t.unknown && t.n === 0 && (
        <Points className="mt-4" items={[
          { text: <><b className="text-ink">{duoNow} of {k}</b> stores list one for pickup at this moment</> },
          { text: <>Every table below starts filling at the first confirmed restock</>, step: true },
          { text: <>Meanwhile, the pattern across all US stores: <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">the national page</Link></>, step: true },
        ]} />
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={alert} className="btn btn-primary">Put {place.name} stores on my wire</Link>
        <Link href={place.storesHref} className="btn btn-ghost">{place.name} stock, live</Link>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.nav}</a>)}
      </nav>
      <Figure id={photo1} eager />

      <div className="mt-8"><RestockHeatmap data={heat} label={`in ${place.name}`} stores={stores} /></div>

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- time of day */}
        <section id="time-of-day" className="scroll-mt-24">
          <h2>{h2Of("time-of-day")}</h2>
          {pattern ? (
            <>
              <p><b className="text-ink">{rangeLabel(t.peakHour!, t.peakHour! + 1)}</b> is the busiest hour, with {n(t.byHour[t.peakHour!])} restocks; mornings carry the day, with <b className="text-ink">{pct(hourShare(t.byHour, 8, 12))}</b> of the {n(t.n)} in {place.name} landing between 8 AM and noon {zone.one ? zone.word : "in each store's local time"}.</p>
              <StatGrid cols={4} className="my-4">
                <Stat value={<span className="text-2xl sm:text-3xl">{rangeLabel(t.peakHour!, t.peakHour! + 1)}</span>} label={`peak hour · ${n(t.byHour[t.peakHour!])} restocks`} tone="accent" />
                <Stat value={pct(hourShare(t.byHour, 8, 12))} label="8 AM – noon" />
                <Stat value={pct(hourShare(t.byHour, 17, 24))} label="5 PM – midnight" />
                <Stat value={pct(hourShare(t.byHour, 0, 6))} label="midnight – 6 AM" tone="muted" />
              </StatGrid>
              {topHours.length > 0 && <Chips className="my-3" items={topHours.map((h) => `${rangeLabel(h.hour, h.hour + 1)} · ${n(h.count)}`)} on={[0]} />}
            </>
          ) : (
            <>
              <p>No hour to name yet: {place.name} has {plural(t.n, "restock")} on {plural(t.days, "day")}. An hour needs {PATTERN_MIN} restocks over {PATTERN_MIN_DAYS} separate days, so one busy burst never passes for a habit.</p>
              <Keys items={[
                { text: <>Each confirmed restock adds a row on its own</>, step: true },
                { text: <>Across the US, from {n(us.n)} restocks: <Link href="/when-does-iphone-duo-restock">{us.peakHour != null ? `${pct(uw.share)} between ${rangeLabel(uw.from, uw.to)} local time` : "the national page"}</Link></>, step: true },
              ]} />
            </>
          )}
          {hours.length > 0 && (
            <Table caption={`${place.name} iPhone Duo restocks per local hour, ${dateLabel(t.since, false)} to today; empty hours omitted`} head={["Store local hour", "Restocks", "Share"]} min="20rem">
              {hours.map((h) => (
                <tr key={h.hour} className={`border-b border-line ${pattern && h.hour >= w.from && h.hour < w.to ? "bg-accent/[0.06]" : ""}`}>
                  <th scope="row" className={rowTh}>{rangeLabel(h.hour, h.hour + 1)}</th>
                  <td className={td}>{n(h.count)}</td>
                  <td className={td}>{pct(h.count / t.n)}</td>
                </tr>
              ))}
            </Table>
          )}
          {pattern && (
            <Keys items={[
              { text: <>Be set up by <b className="text-ink">{hourLabel(Math.max(0, w.from - 1))}</b>; by {hourLabel(w.to)} most of the day&apos;s restocks are in</>, step: true },
              { text: <>Afternoons, noon to 5 PM: {pct(hourShare(t.byHour, 12, 17))}, {hourShare(t.byHour, 12, 17) >= 0.25 ? "a genuine second window" : "quiet but not empty"}</> },
              { text: <>A {hourLabel(w.from)} restock is usually gone {sell ? about(sell.medianSec) : "about a minute"} later: the window tells you when to be ready, not when to start looking</>, no: true },
            ]} />
          )}
        </section>

        {/* ---------------------------------------------------------------- day by day */}
        <section id="day-by-day" className="scroll-mt-24">
          <h2>{h2Of("day-by-day")}</h2>
          <p>{t.n > 0 ? <><b className="text-ink">{t.days} of {tracked} days</b> since {longDate(t.since)} brought at least one restock to {place.name}{busiestDay ? <>; the peak was <b className="text-ink">{dateLabel(busiestDay.date)}</b>, with {n(busiestDay.restocks)} at {plural(busiestDay.stores, "store")}</> : null}.</> : <>{place.name} has had no day with a confirmed restock since {longDate(t.since)}.</>}</p>
          {t.n > 0 && (
            <StatGrid cols={3} className="my-4">
              <Stat value={`${t.days}/${tracked}`} label="restock days / days on the wire" />
              {busiestDay ? <Stat value={n(busiestDay.restocks)} label={`peak day · ${dateLabel(busiestDay.date)}`} tone="accent" /> : <Stat value="–" label="peak day" tone="muted" />}
              <Stat value={pct(weekend / t.n)} label={`on weekends (${n(weekend)})`} />
            </StatGrid>
          )}
          <Table caption={`${place.name} iPhone Duo restocks per day, newest first, by each store's local date`} head={["Day", "Restocks", "Stores", "Peak hour"]} min="26rem">
            {[...t.daily].reverse().map((d) => (
              <tr key={d.date} className="border-b border-line">
                <th scope="row" className={rowTh}>{dateLabel(d.date)}{today && d.date === today.date ? <span className="text-ink-3"> · still counting</span> : ""}</th>
                <td className={td}>{n(d.restocks)}</td>
                <td className={td}>{d.stores}</td>
                <td className={td}>{d.peakHour == null ? "–" : rangeLabel(d.peakHour, d.peakHour + 1)}</td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>Every day since {dateLabel(t.since, false)} has a row; a quiet one reads <b className="text-ink">0</b>, not blank</> },
            { text: <>Counting began {longDate(t.since)}, six days after the iPhone Duo went on sale; launch-week reports from other trackers sit on the national page, in rows of their own</> },
            { text: <>A busiest weekday needs {WEEKDAY_MIN_SPAN} days of data{t.peakWeekday != null ? <>; right now <b className="text-ink">{WEEKDAYS[t.peakWeekday]}</b> is ahead</> : null}</>, step: true },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- stores (and cities) */}
        <section id="stores" className="scroll-mt-24">
          <h2>{h2Of("stores")}</h2>
          {top ? (
            <p><b className="text-ink"><Link href={storePath(top.store!)}>{appleName(top.store!)}</Link></b>, with <b className="text-ink">{n(top.restocks)} confirmed restocks</b> on {plural(top.days, "day")}{top.peakHour != null ? <>, most often near {hourLabel(top.peakHour)}</> : null}. {storeRows.length} of the {k} stores in {place.name} {storeRows.length === 1 ? "has" : "have"} restocked at least once{quiet.length ? <>; {plural(quiet.length, "store")} still {quiet.length === 1 ? "waits" : "wait"}</> : null}.</p>
          ) : (
            <p>None so far: no Apple Store in {place.name} has a confirmed iPhone Duo restock since {longDate(t.since)}. The first one starts the table.</p>
          )}
          {!city && t.byCity.length > 1 && (
            <Table caption={`${place.name} cities by iPhone Duo restocks since ${dateLabel(t.since, false)}; a one-store city links straight to its store`} head={["City", "Restocks", "Stores", "Most recent"]} min="30rem">
              {t.byCity.map((r) => (
                <tr key={r.slug} className="border-b border-line">
                  <th scope="row" className={rowTh}><Link href={r.path} className="hover:underline">{r.name}</Link></th>
                  <td className={td}>{n(r.restocks)}</td>
                  <td className={td}>{r.stores} of {r.storesTotal}</td>
                  <td className="py-2 pe-3 align-top">{r.lastAt && r.lastStore && storeByNumber(r.lastStore) ? <>{localStamp(r.lastAt, storeByNumber(r.lastStore)!)} · <Link href={storePath(storeByNumber(r.lastStore)!)} className="hover:underline">{storeByNumber(r.lastStore)!.name}</Link></> : "–"}</td>
                </tr>
              ))}
            </Table>
          )}
          <Table caption={`All ${k} Apple Stores in ${place.name}: confirmed iPhone Duo restocks since ${dateLabel(t.since, false)}, the usual hour once there are ${PATTERN_MIN} restocks on ${PATTERN_MIN_DAYS} days, the most recent one in store local time, and live pickup stock`} head={["Store", "Restocks", "Days", "Usual hour", "Most recent", "Live"]} min="38rem">
            {storeRows.map((r) => (
              <tr key={r.storeNumber} className="border-b border-line">
                <th scope="row" className={rowTh}><Link href={storePath(r.store!)} className="hover:underline">{appleName(r.store!)}</Link>{!city && <span className="font-normal text-ink-3"> · {r.store!.city}</span>}</th>
                <td className={td}>{n(r.restocks)}</td>
                <td className={td}>{r.days}</td>
                <td className={td}>{r.peakHour != null ? hourLabel(r.peakHour) : "–"}</td>
                <td className="py-2 pe-3 align-top">{localStamp(r.lastAt, r.store!)}</td>
                <td className={td}>{nowAt(r.store!) ? <span className="text-ok">in stock</span> : <span className="text-ink-3">–</span>}</td>
              </tr>
            ))}
            {quiet.map((s) => (
              <tr key={s.storeNumber} className="border-b border-line text-ink-3">
                <th scope="row" className="py-2 pe-3 text-start font-medium"><Link href={storePath(s)} className="hover:underline">{appleName(s)}</Link>{!city && <span className="font-normal"> · {s.city}</span>}</th>
                <td className={td}>0</td>
                <td className={td}>0</td>
                <td className={td}>–</td>
                <td className="py-2 pe-3 align-top">not yet</td>
                <td className={td}>{nowAt(s) ? <span className="text-ok">in stock</span> : "–"}</td>
              </tr>
            ))}
          </Table>
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="Driving over at a store's 'usual' hour" yes="Reserving on apple.com the moment the push lands, then driving" why="Walk-in Duo stock is rare; a pickup order is what holds the phone." />
            <Swap no={`Only the closest store in ${place.name}`} yes={`Every ${place.name} store within a 20-minute drive`} why="Stores restock independently; the next one may well be a town over." />
          </ol>
          <ChipLinks items={[{ href: place.storesHref, label: `Every ${place.name} store, live` }, { href: "/iphone-duo-in-stock-near-me", label: "Nearest store with a Duo" }]} />
          <Figure id={photo2} />
        </section>

        {/* ---------------------------------------------------------------- configuration */}
        <section id="configuration" className="scroll-mt-24">
          <h2>{h2Of("configuration")}</h2>
          {topPart && topPart.restocks > 0 ? (
            <p><b className="text-ink">{cfg(topPart.partNumber)}</b>, with <b className="text-ink">{n(topPart.restocks)} of {n(t.n)} restocks</b> in {place.name} ({pct(topPart.restocks / t.n)}){lastPart && lastPart.partNumber !== topPart.partNumber ? <>; {cfg(lastPart.partNumber)} has {plural(lastPart.restocks, "restock")}</> : null}. {lastPart && lastPart.restocks > 0 && topPart.restocks / lastPart.restocks >= 2 ? <> That is about <b className="text-ink">{Math.round(topPart.restocks / lastPart.restocks)}×</b> the rarest one: flexible buyers in {place.name} get that much more chance.</> : <> Being flexible on storage or color still raises your chances in {place.name}.</>}</p>
          ) : (
            <p>No configuration has come back in {place.name} yet. All eight have a row below, ready for the first restock.</p>
          )}
          <Table caption={`${place.name}: iPhone Duo restocks per storage and color since ${dateLabel(t.since, false)}`} head={["Storage and color", "Restocks", "Share", "Most recent"]}>
            {parts.map((p) => (
              <tr key={p.partNumber} className="border-b border-line">
                <th scope="row" className={rowTh}>{cfg(p.partNumber)}</th>
                <td className={td}>{n(p.restocks)}</td>
                <td className={td}>{t.n ? pct(p.restocks / t.n) : "–"}</td>
                <td className="py-2 pe-3 align-top">{p.lastAt && p.lastStore && storeByNumber(p.lastStore) ? <>{localStamp(p.lastAt, storeByNumber(p.lastStore)!)} · <Link href={storePath(storeByNumber(p.lastStore)!)} className="hover:underline">{storeByNumber(p.lastStore)!.name}</Link></> : "–"}</td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>An alert covers one store × one exact configuration: choose the one you would really buy</> },
            { text: <>The US-wide ranking usually agrees: <Link href="/iphone-duo-most-restocked-stores">most-restocked iPhone Duo configurations</Link></>, step: true },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- how long */}
        <section id="how-long" className="scroll-mt-24">
          <h2>{h2Of("how-long")}</h2>
          {sell ? (
            <>
              <p><b className="text-ink">{secs(sell.medianSec)}</b> is the median across <b className="text-ink">{n(sell.n)} timed restocks</b> in {place.name}{us.sellout ? <>, {sell.medianSec < us.sellout.medianSec - 10 ? "quicker than" : sell.medianSec > us.sellout.medianSec + 10 ? "slower than" : "close to"} the US figure of {secs(us.sellout.medianSec)}</> : null}; {pct(sell.within2min)} were gone inside 2 minutes and {pct(sell.within20min)} inside 20.</p>
              <StatGrid cols={4} className="my-4">
                <Stat value={sell.medianSec} unit="s" label="median listing, seconds" tone="accent" />
                <Stat value={pct(sell.within2min)} label="sold out inside 2 minutes" tone="warn" />
                <Stat value={pct(sell.within20min)} label="sold out inside 20 minutes" />
                <Stat value={sell.fastestSec} unit="s" label="quickest sell-out" />
              </StatGrid>
            </>
          ) : (
            <p>No local figure yet: {place.name} has fewer than 10 restocks timed to a sell-out. Across the US half are gone within {us.sellout ? secs(us.sellout.medianSec) : "about a minute"}, and nothing here points to {place.name} being slower.</p>
          )}
          <Keys items={[
            { text: <>Measured from the check that saw the listing to the check that saw it gone: an <b className="text-ink">upper bound</b>, never rounded down</> },
            { text: <>Why a hand-refreshed apple.com nearly always says &ldquo;unavailable&rdquo;: <Link href="/apple-store-pickup-explained">the status explained</Link></> },
            { text: <>Each restock with its own seconds: <Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo sell-out times</Link></>, step: true },
          ]} />
          {sell && <Measured>Each lifetime falls between two RestockWire checks, {SPEED.checkSec} s apart ({SPEED.fastSec} s at stores with alerts), so a 40-second restock can read as 45. Listings still live when the page loads are left out.</Measured>}
        </section>

        {/* ---------------------------------------------------------------- right now */}
        <section id="right-now" className="scroll-mt-24">
          <h2>{h2Of("right-now")}</h2>
          <p>{recent.unknown ? <>The live read did not load this time. {place.name} stays on the wire; reload for the current count.</> : <><b className="text-ink">{duoNow} of the {k}</b> Apple Stores in {place.name} {duoNow === 1 ? "lists" : "list"} an iPhone Duo for pickup at this moment; the last 24 hours brought <b className="text-ink">{plural(recent.restocks, "restock")}</b> at {plural(recent.stores, "store")}{recent.latest && storeByNumber(recent.latest.storeNumber) ? <>, most recently {cfg(recent.latest.partNumber)} at <Link href={storePath(storeByNumber(recent.latest.storeNumber)!)}>{appleName(storeByNumber(recent.latest.storeNumber)!)}</Link>, {localStamp(recent.latest.at, storeByNumber(recent.latest.storeNumber)!)}</> : null}.</>}</p>
          <StatGrid cols={3} className="my-4">
            <Stat value={`${duoNow}/${k}`} label="stores with pickup stock now" live tone={duoNow > 0 ? "ok" : "plain"} />
            <Stat value={n(recent.restocks)} label="restocks, last 24 hours" tone={recent.restocks > 0 ? "plain" : "muted"} />
            <Stat value={`${recent.stores}/${k}`} label="stores restocked, last 24 hours" tone={recent.stores > 0 ? "plain" : "muted"} />
          </StatGrid>
          <Keys items={[
            { text: <>Store by store, configuration by configuration, with the last check time: <Link href={place.storesHref}>{place.name} Apple Stores</Link></>, step: true },
            { text: <>Newest first, every confirmed restock in {place.state}: <Link href={`/restock-log?model=duo&state=${place.stateSlug}`}>restock log</Link></>, step: true },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- alerts */}
        <section id="alerts" className="scroll-mt-24">
          <h2>{h2Of("alerts")}</h2>
          <p>Let the wire watch and have checkout staged {pattern ? <>before <b className="text-ink">{hourLabel(w.from)}</b></> : "by morning"}: a typical {place.name} restock is over in {sell ? about(sell.medianSec) : "about a minute"}, shorter than one reload and scroll.</p>
          <p><b className="text-ink">{SPEED.fastSec}-second checks on your stores, from ${PLANS.plus.priceUsd} a month.</b> The push lands about {SPEED.alertSec} s after a restock is confirmed. One alert is one store × one exact configuration: Plus holds {PLANS.plus.limit}, Pro {PLANS.pro.limit}, Max {PLANS.max.limit}.</p>
          <StepStrip className="my-4" steps={[
            { title: `Choose ${place.name} stores`, hint: "plus the exact storage and color" },
            { title: "Add the Home Screen app", hint: "required for iPhone alerts" },
            { title: "Stage apple.com checkout", hint: "stop one step short" },
            { title: "Act on the push", hint: "four taps, about 20 seconds" },
          ]} />
          <p><Link href={alert} className="btn btn-primary">Put {place.name} stores on my wire</Link></p>
          <ChipLinks items={[{ href: "/iphone-duo-restock-alerts", label: "What an alert does" }, { href: "/iphone-duo-restock-checkout-guide", label: "The 20-second checkout" }, { href: "/phone-alerts", label: "Home Screen app" }]} />
        </section>

        {/* ---------------------------------------------------------------- method */}
        <section id="method" className="scroll-mt-24">
          <h2>{h2Of("method")}</h2>
          <p>Two checks in a row seeing apple.com switch one configuration from &ldquo;currently unavailable&rdquo; to available for pickup at one of the {k} stores in {place.name}. One check alone never counts.</p>
          <Keys items={[
            { text: <>Cadence: <b className="text-ink">{SPEED.checkSec} seconds</b> for every Apple Store in {place.name}, <b className="text-ink">{SPEED.fastSec}</b> for stores with an alert</> },
            { text: <>Confirmation: a first &ldquo;available&rdquo; is re-asked <b className="text-ink">about a second later</b></> },
            { text: <>Sell-out: confirmed on the <b className="text-ink">next round</b> of checks</> },
            { text: <>Never counted: a store&apos;s first sighting, a failed request, a timeout. None of them is a restock or a sell-out</>, no: true },
            { text: <>Clock: each store&apos;s <b className="text-ink">local time</b>{zone.one ? <>, {zone.word} across {place.name}</> : <>; {place.name} covers two zones</>}</> },
            { text: <>Source: RestockWire&apos;s own checks only; other trackers&apos; launch-week reports appear separately on the national page</> },
            { text: <>This page refreshes roughly every five minutes; <Link href={`/restock-log?model=duo&state=${place.stateSlug}`}>the restock log</Link> is live</>, step: true },
          ]} />
          <p className="text-sm text-ink-3">Cite this page: quote any figure here with a link back. RestockWire is independent of Apple and reads the same pickup availability apple.com shows everyone, only far more often.</p>
        </section>
      </div>

      <RelatedBlock title="Restock hours in other places">
        {city && stateHref && <LinkRow title={`${place.state}, statewide`} links={[{ href: stateHref, label: `When does the iPhone Duo restock in ${SAID[`state:${place.state}`] ?? place.state}?` }]} />}
        {cityPages.length > 0 && <LinkRow title={city ? `More ${place.state} cities` : `${place.name}, city by city`} links={cityPages} />}
        {nearPages.length > 0 && <LinkRow title="Cities nearby" links={nearPages} />}
        {neighborPages.length > 0 && <LinkRow title="States next door" links={neighborPages} />}
        <LinkRow title="Across the US" links={[{ href: "/when-does-iphone-duo-restock", label: "When does the iPhone Duo restock in the US?", meta: t.n && us.n ? `${place.name}: ${share}% of US restocks` : undefined }]} />
        <LinkRow title={`${place.name} right now`} links={[
          { href: place.storesHref, label: `${place.name} Apple Stores` },
          { href: `/restock-log?model=duo&state=${place.stateSlug}`, label: `Restock log: ${place.state}` },
          { href: `/live-map?state=${place.stateCode}&model=duo`, label: "Live map" },
          { href: "/in-stock/iphone-duo", label: "iPhone Duo at every US store" },
        ]} />
        <LinkRow title="Other iPhone Duo questions" links={[
          { href: "/is-iphone-duo-back-in-stock", label: "Is it back in stock now?" },
          { href: "/how-fast-does-iphone-duo-sell-out", label: "How many seconds does a restock last?" },
          { href: "/iphone-duo-most-restocked-stores", label: "Which storage and color return most?" },
          { href: "/iphone-duo-restock-alerts", label: "Quickest restock alerts" },
          { href: "/how-to-buy-an-iphone-duo-in-store", label: "Getting one while it is sold out" },
          { href: "/where-to-buy-iphone-duo-today", label: "Buying one today" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq items={faq} facts={facts} title={`${place.name} iPhone Duo restocks: questions`} /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`the ${k} Apple Stores in ${place.name}`} since={longDate(t.since)} /></div>
    </div>
  );
}
