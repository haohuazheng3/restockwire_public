/**
 * /where-to-buy-iphone-duo-today: "Where can I buy an iPhone Duo today?" for the person who wants a phone in hand today,
 * does not know tracker sites exist and will take any legitimate channel. Every H2 is a question with one quotable
 * answer sentence under it; the rest is tiles, tables and keyword lines. Apple Store pickup is the one channel we
 * measure (apple.com pickup availability, every store every 15 s); apple.com delivery, carriers and retailers are
 * described by what their official pages offer, with a link, never with a stock or delivery claim we did not measure.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { RestockFeed } from "@/components/restocks/RestockFeed";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap, type Point } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleBuyUrl, appleFamilyUrl, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storeTimeZone, storesOf, type CatalogItem, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { CHECK_NOTE, PLANS, SPEED } from "@/lib/plans";
import { PATTERN_MIN, PATTERN_MIN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, rangeLabel, type StoreRow } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow } from "@/lib/stock/queries";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref, fitTitle, fmtPrice } from "@/lib/seo/enrich";

export const dynamic = "force-dynamic";

const PATH = "/where-to-buy-iphone-duo-today";
const SITE = "https://restockwire.com";
/** 57 characters; the phrase people type, then the promise the page keeps. */
const TITLE = "Where Can I Buy an iPhone Duo Today? Live US Store List";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const FCC_UNLOCK = "https://www.fcc.gov/consumers/guides/cell-phone-unlocking-faqs";
const WIKI_SIM_LOCK = "https://en.wikipedia.org/wiki/SIM_lock";
const CARRIERS = [
  { name: "AT&T", url: "https://www.att.com/buy/phones/" },
  { name: "Verizon", url: "https://www.verizon.com/smartphones/" },
  { name: "T-Mobile", url: "https://www.t-mobile.com/cell-phones" },
];
const BEST_BUY = { name: "Best Buy", url: "https://www.bestbuy.com/" };
/** The one price sentence, verbatim, once in the body and once in a FAQ answer (the brief's wording). */
const PRICE_SENTENCE = `From $${PLANS.plus.priceUsd} a month, the stores you pick go on ${SPEED.fastSec}-second checks and a push lands about ${SPEED.alertSec} s after each confirmed restock.`;

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
/** Clock time in the store's own zone, e.g. 9:31 AM. */
const clockAt = (iso: string, store: Store) => new Intl.DateTimeFormat("en-US", { timeZone: storeTimeZone(store), hour: "numeric", minute: "2-digit" }).format(new Date(iso));
const cfgName = (i: CatalogItem) => `${i.storage} ${i.color}`;
const cfgOf = (partNumber: string) => { const i = PART_INDEX.get(partNumber); return i ? cfgName(i) : partNumber; };
const stores = (k: number) => (k === 1 ? "1 store" : `${k} stores`);

/** Reads run once per request; metadata and page share them. */
const load = cache(async () => {
  const [stockNow, recent, f, facts, t, rows, feed, abroad] = await Promise.all([
    storesWithStockNow(undefined, "us"),
    recentByConfig({ country: "us" }),
    siteFacts(),
    getFacts(),
    duoRestockTimes("us"),
    modelStock("duo", "us"),
    restockFeed({ model: "duo", limit: 8, country: "us" }),
    Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
  ]);
  return { stockNow, recent, f, facts, t, rows, feed, abroad };
});

interface StateRow { name: string; now: number; total: number; lastAt: string | null; lastStore: Store | undefined }
interface ConfigRow { item: CatalogItem; now: number; restocks: number }

function add(map: Map<string, Set<string>>, key: string, value: string) {
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

/** All page numbers, derived once from the reads; the stockUnknown and t.unknown flags stop a failed read from showing as zero. */
function derive(d: Awaited<ReturnType<typeof load>>) {
  const { stockNow, recent, f, facts, t, rows } = d;
  const items = catalogFor("duo");
  // modelStock always has a row for every store × configuration; an empty array means the read failed.
  const stockUnknown = rows.length === 0 || facts.models.duo?.unknown === true;
  const avail = rows.filter((r) => r.status === "available");
  const storesNow = stockUnknown ? stockNow.duo : new Set(avail.map((r) => r.storeNumber)).size;
  const pairsNow = avail.length;

  const totals = new Map(statesWithStores().map((s) => [s.name, s.count]));
  const byState = new Map<string, Set<string>>();
  for (const r of avail) { const s = storeByNumber(r.storeNumber); if (s) add(byState, s.state, r.storeNumber); }
  const regionLast = new Map(t.byRegion.map((r) => [r.name, r]));
  const states: StateRow[] = [...byState.entries()]
    .map(([name, set]) => ({ name, now: set.size, total: totals.get(name) ?? 0, lastAt: regionLast.get(name)?.lastAt ?? null, lastStore: regionLast.get(name)?.lastStore ? storeByNumber(regionLast.get(name)!.lastStore!) : undefined }))
    .sort((a, b) => b.now - a.now || b.total - a.total || a.name.localeCompare(b.name))
    .slice(0, 10);

  const nowByPart = new Map<string, Set<string>>();
  for (const r of avail) add(nowByPart, r.partNumber, r.storeNumber);
  const restocksByPart = new Map(t.byPart.map((p) => [p.partNumber, p.restocks]));
  const configs: ConfigRow[] = items
    .map((item) => ({ item, now: nowByPart.get(item.partNumber)?.size ?? 0, restocks: restocksByPart.get(item.partNumber) ?? 0 }))
    .sort((a, b) => b.restocks - a.restocks || b.now - a.now);
  const topCfg = configs[0] && configs[0].restocks > 0 ? configs[0] : null;
  const lastCfg = topCfg && configs.length > 1 && configs[configs.length - 1].item !== topCfg.item ? configs[configs.length - 1] : null;

  const latest = recent.latest ?? t.latest;
  const latestStore = latest ? storeByNumber(latest.storeNumber) : undefined;
  const ds = f.duoSellout;
  const medianSec = ds?.medianSec ?? t.sellout?.medianSec ?? null;
  const band = medianSec != null ? medianBand(medianSec) : null;
  const top = t.topStores[0];
  const topStore = top ? storeByNumber(top.storeNumber) : undefined;
  const topStores = t.topStores.slice(0, 5).map((r) => ({ ...r, store: storeByNumber(r.storeNumber) })).filter((r): r is StoreRow & { store: Store } => Boolean(r.store));
  const pattern = t.peakHour != null && t.n > 0;
  const bw = pattern ? busiestWindow(t.byHour) : null;
  const since = longDate(t.since);
  const tracked = Math.max(t.daily.length, t.days, 1);

  const abroad = INTL_CODES.map((cc, i) => ({ cc, now: d.abroad[i].duo, total: storesOf(cc).length })).sort((a, b) => b.now - a.now || b.total - a.total);
  const abroadNow = abroad.reduce((a, c) => a + c.now, 0);
  const intlStores = abroad.reduce((a, c) => a + c.total, 0);

  return { items, stockUnknown, storesNow, pairsNow, states, configs, topCfg, lastCfg, latest, latestStore, medianSec, band, top, topStore, topStores, pattern, bw, since, tracked, abroad, abroadNow, intlStores, recent, t, f, facts, feed: d.feed };
}
type View = ReturnType<typeof derive>;

/** ≤ 158 characters, from the live numbers; the first variant that fits wins. */
function description(v: View): string {
  if (v.stockUnknown || v.recent.unknown) {
    return fitTitle([
      `Buying an iPhone Duo today: Apple Store pickup at all ${STORES.length} US stores, read every ${SPEED.checkSec} seconds, weighed against apple.com delivery, carriers and retailers.`,
      `Buying an iPhone Duo today: Apple Store pickup at all ${STORES.length} US stores, weighed against apple.com delivery, carriers and big-box retailers.`,
    ], 158);
  }
  return fitTitle([
    `Pickup stock now: ${v.storesNow} of ${STORES.length} US Apple Stores list the iPhone Duo; ${n(v.recent.restocks)} restocks over the past day${v.band ? `, each gone in about ${v.band}` : ""}. The buy-today list, by store.`,
    `Pickup stock now: ${v.storesNow} of ${STORES.length} US Apple Stores list the iPhone Duo; ${n(v.recent.restocks)} restocks over the past day. The buy-today list, store by store.`,
    `iPhone Duo for pickup now at ${v.storesNow} of ${STORES.length} US Apple Stores. Where to buy one today, store by store, and what each channel offers.`,
  ], 158);
}

export async function generateMetadata(): Promise<Metadata> {
  const v = derive(await load());
  const d = description(v);
  return {
    title: { absolute: `${TITLE} · RestockWire` },
    description: d,
    alternates: { canonical: PATH },
    openGraph: { url: PATH, type: "article", siteName: "RestockWire", description: d, title: TITLE },
  };
}

const th = "border-b border-line-2 py-2 pe-3 text-start font-semibold text-ink";
const td = "py-2 pe-3 align-top tabular-nums";
const rowTh = "py-2 pe-3 text-start font-medium text-ink";

function Table({ caption, head, children, min = "28rem" }: { caption: string; head: string[]; children: ReactNode; min?: string }) {
  return (
    <div className="overflow-x-auto my-5">
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

/** A row of page links as chips; outside links open in a new tab. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return (
    <div className="my-3 flex flex-wrap gap-1.5">
      {items.map((l) => l.href.startsWith("http")
        ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm no-underline!">{l.label}</a>
        : <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}
    </div>
  );
}

const Out = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener">{children}</a>;

export default async function WhereToBuyPage() {
  const v = derive(await load());
  const { items, stockUnknown, storesNow, pairsNow, states, configs, topCfg, lastCfg, latest, latestStore, medianSec, band, top, topStore, topStores, bw, since, tracked, abroad, abroadNow, intlStores, recent, t, facts, feed } = v;
  const alert = alertHref({ model: "duo" });
  const asOf = `${ET.format(new Date(facts.at))} ET`;
  const latestLine = !latest || !latestStore
    ? "none logged yet"
    : `${cfgOf(latest.partNumber)} at ${appleName(latestStore)} (${cityLine(latestStore)}), ${localStamp(latest.at, latestStore)} store local time`;
  const storeLink = (s: Store) => <Link href={storePath(s)} className="hover:underline">{appleName(s)}</Link>;
  const win = bw ? rangeLabel(bw.from, bw.to) : null;

  const sections = [
    { id: "now", nav: "Listed now", h2: "Which Apple Stores have an iPhone Duo you can buy today?" },
    { id: "delivery", nav: "Delivery", h2: "Should you just order the iPhone Duo for delivery?" },
    { id: "which-store", nav: "Best store", h2: "Which Apple Store gives you the best chance?" },
    { id: "carriers", nav: "Carriers, Best Buy", h2: "Can you buy an iPhone Duo from a carrier or Best Buy?" },
    { id: "configuration", nav: "Easiest model", h2: "Which iPhone Duo configuration is easiest to buy today?" },
    { id: "the-minute", nav: "When it returns", h2: "How do you get one the moment it comes back?" },
    { id: "abroad", nav: "Other countries", h2: "Where is the iPhone Duo sold outside the US?" },
  ];
  const h2 = (id: string) => sections.find((s) => s.id === id)!.h2;

  // ------------------------------------------------------------------------------------------- answer sentences
  const intro: ReactNode = stockUnknown || recent.unknown
    ? <><b className="text-ink">Apple Store pickup</b> is the surest way to buy an iPhone Duo today. The live count did not load this time, so the restock log below is the freshest sign of where one just appeared; RestockWire reads all <b className="text-ink">{STORES.length} US Apple Stores</b> every {SPEED.checkSec} seconds{band ? <>, and a typical restock sells out in about <b className="text-ink">{band}</b></> : null}. The answer is one store at one minute, not a city.</>
    : <><b className="text-ink">{storesNow} of {STORES.length} US Apple Stores</b> list an iPhone Duo for pickup right now, after <b className="text-ink">{n(recent.restocks)} restocks</b> in the last 24 hours{band ? <>; a typical one sells out in about <b className="text-ink">{band}</b></> : null}. <b className="text-ink">Apple Store pickup</b> is the surest route today, and the answer is one store at one minute, not a city.</>;

  const nowLead = stockUnknown
    ? `The live count did not load this time. RestockWire reads all ${STORES.length} US Apple Stores every ${SPEED.checkSec} seconds; the confirmed restocks below are the freshest record of where an iPhone Duo just appeared.`
    : storesNow > 0
      ? `${storesNow} of ${STORES.length} US Apple Stores list at least one iPhone Duo configuration for pickup now (${n(pairsNow)} store × configuration listings)${states[0] ? `; ${states[0].name} leads with ${states[0].now} of its ${stores(states[0].total)}` : ""}. Last confirmed restock: ${latestLine}.`
      : `None right now: 0 of ${STORES.length} US Apple Stores list an iPhone Duo for pickup at ${asOf}, the usual state between restocks. ${recent.unknown ? "" : `Past 24 hours: ${n(recent.restocks)} restocks. `}Most recent confirmed: ${latestLine}.`;

  const storeLead = top && topStore
    ? `${appleName(topStore)} in ${cityLine(topStore)} tops the US count: ${n(top.restocks)} confirmed iPhone Duo restocks across ${top.days} ${top.days === 1 ? "day" : "days"} from ${since}${top.peakHour != null ? `, usually near ${hourLabel(top.peakHour)} local time` : ""}, the last at ${localStamp(top.lastAt, topStore)} store local time.`
    : t.unknown
      ? "The restock log did not load this time, so the ranking is empty until reload. The rule holds anyway: go to the store the alert names, not simply the nearest."
      : `Zero confirmed iPhone Duo restocks at US Apple Stores from ${since} so far; the first will show here with its store time.`;

  const windowSentence = bw && win
    ? `Timing matters as much as the store: ${pct(bw.share)} of the ${n(t.n)} iPhone Duo restocks RestockWire confirmed at US Apple Stores since ${since} landed between ${win} store local time. The best store is the one that restocks most, in that window, with the pickup reservation placed from your phone first.`
    : t.unknown
      ? "The hour-by-hour pattern returns on the restock-hours page once the log loads."
      : `${n(t.n)} confirmed ${t.n === 1 ? "restock" : "restocks"} on ${t.days} ${t.days === 1 ? "day" : "days"} is not enough for a usual hour (RestockWire waits for ${PATTERN_MIN} over ${PATTERN_MIN_DAYS} days); the hour table builds itself on the restock-hours page.`;

  const configLead = topCfg
    ? `${cfgName(topCfg.item)} (${fmtPrice(topCfg.item.price)} pre-tax) has returned most: ${pct(topCfg.restocks / Math.max(1, t.n))} of US restocks, ${n(topCfg.restocks)} of ${n(t.n)} from ${since}${lastCfg ? `, against ${n(lastCfg.restocks)} for ${cfgName(lastCfg.item)}` : ""}, and ${stockUnknown ? "its live store count did not load" : `${stores(topCfg.now)} ${topCfg.now === 1 ? "lists" : "list"} it now`}.`
    : t.unknown
      ? "No ranking this time: the restock log did not load. The table still has every configuration's price and apple.com order page."
      : `No configuration has a confirmed restock since ${since} yet; the table lists all ${items.length} with Apple's list price and order page, and ranks itself as restocks arrive.`;

  const minuteLead = `About 20 seconds, if two or three stores are on alert and Apple's checkout is staged to its last step: the push lands about ${SPEED.alertSec} seconds after a confirmed restock${band ? `, inside a listing that typically lasts ${band}` : ""}.`;

  const abroadLead = `At Apple's own stores and online store in each of the ${INTL_CODES.length} other countries on the wire (${n(intlStores)} Apple Stores since ${longDate(TRACKING_SINCE_INTL)}). ${abroadNow} of those stores list one for pickup now${abroad[0] && abroad[0].now > 0 ? `, the most in ${COUNTRIES[abroad[0].cc].name} (${abroad[0].now} of ${abroad[0].total})` : ""}.`;

  // ------------------------------------------------------------------------------------------------------ FAQ
  const faq: Faq[] = [
    { q: "Is there anywhere I can get an iPhone Duo the same day?", a: stockUnknown || recent.unknown
      ? `A US Apple Store that lists one for pickup: reserve on apple.com with "I'll pick it up" and collect it there. RestockWire reads all ${STORES.length} stores every ${SPEED.checkSec} seconds (the live count did not load this time); the [live list](/in-stock/iphone-duo) is free.`
      : `A US Apple Store that lists one for pickup: ${storesNow} of ${STORES.length} do now and ${n(recent.restocks)} restocked in the last 24 hours. Reserve on apple.com with "I'll pick it up" and collect it there; the [live list](/in-stock/iphone-duo) is free.` },
    { q: "Do Apple Stores keep any iPhone Duo for walk-in buyers?", a: `Not reliably: Duo stock goes out as online pickup reservations, and ${band ? `a typical listing is gone in about ${band}` : "listings are short-lived"}, so the batch is reserved before you reach the counter. Reserve first and Apple holds the phone at that store ([Apple: Delivery and Pickup](${APPLE_PICKUP})).` },
    { q: "I need one this week: which storage and color should I pick?", a: topCfg
      ? `${cfgName(topCfg.item)}, which accounts for ${pct(topCfg.restocks / Math.max(1, t.n))} of US restocks (${n(topCfg.restocks)} of ${n(t.n)} from ${since})${stockUnknown ? "" : `, ${stores(topCfg.now)} listing it now`}${lastCfg ? `, while ${cfgName(lastCfg.item)} has ${n(lastCfg.restocks)}` : ""}. Fix the storage, accept any color, and see [the full ranking](/iphone-duo-most-restocked-stores).`
      : `No ranking yet: no configuration has a confirmed restock since ${since} in a readable log. Fix the storage you need, accept any color, and watch [the ranking](/iphone-duo-most-restocked-stores) fill in.` },
    { q: "How do I hear about it when a store near me gets one?", a: `${PRICE_SENTENCE} Pick reachable stores on [iPhone Duo near me](/iphone-duo-in-stock-near-me); on iPhone, add RestockWire to your Home Screen first ([install guide](/phone-alerts)), and alerts come by e-mail while no device is set up.` },
  ];

  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup, how pickup availability and holds work", url: APPLE_PICKUP },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide, October 23, 2026", url: APPLE_NEWSROOM },
    { label: "MacRumors: iPhone Duo pickup at US Apple Stores, October 24, 2026", url: MACRUMORS },
    { label: "FCC: Cell Phone Unlocking FAQs, the official guide to carrier locks", url: FCC_UNLOCK },
    { label: "Wikipedia: SIM lock", url: WIKI_SIM_LOCK },
  ];

  // --------------------------------------------------------------------------------------------------- JSON-LD
  const desc = description(v);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, about: { "@id": `${SITE}/#organization` }, isPartOf: { "@id": `${SITE}/#website` }, description: desc, dateModified: facts.at },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "Live iPhone Duo pickup availability at US Apple Stores",
        description: `The US Apple Stores, of ${STORES.length}, listing each iPhone Duo configuration for in-store pickup now, read from apple.com every ${SPEED.checkSec} seconds (${SPEED.fastSec} at stores with alerts), plus RestockWire's confirmed restocks from ${longDate(TRACKING_SINCE_US)} broken down per state, store and configuration, and live listings in ${INTL_CODES.length} more countries.`,
        url: `${SITE}${PATH}`, creator: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: `Apple Stores in the United States, plus the ${INTL_CODES.length} other countries on the wire`,
        variableMeasured: ["Apple Store", "US state", "iPhone Duo configuration (storage, color)", "pickup listing at load time", "confirmed restocks", "most recent restock (store local time)"],
        measurementTechnique: `Each store's apple.com pickup status is fetched on a ${SPEED.checkSec}-second loop (${SPEED.fastSec}-second where an alert points); two agreeing reads about a second apart confirm a restock; a first sighting never counts`,
        ...(t.n ? { size: `${n(t.n)} confirmed restocks` } : {}),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { label: "Buy an iPhone Duo today" }]} />
      <h1 className="mt-3 text-3xl sm:text-5xl display">Where can I buy an iPhone Duo today?</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">{intro}</p>
      <p className="mt-3 text-sm text-ink-3">{STORES.length} Apple Stores on the wire, checked {CHECK_NOTE} · counting since {longDate(TRACKING_SINCE_US)} · last update {asOf}</p>

      <StatGrid cols={4} className="mt-6">
        <Stat value={stockUnknown ? "–" : `${storesNow}/${STORES.length}`} label="US Apple Stores with a Duo for pickup now" tone={!stockUnknown && storesNow > 0 ? "ok" : "muted"} live={!stockUnknown} />
        <Stat label="US restocks, past 24 hours" value={recent.unknown ? "–" : n(recent.restocks)} tone={recent.unknown ? "muted" : "plain"} />
        {latest && latestStore
          ? <Stat size="sm" value={clockAt(latest.at, latestStore)} label={<>last restock · {cfgOf(latest.partNumber)} · {storeLink(latestStore)}, store local time</>} />
          : <Stat value="–" label="last restock: none logged yet" tone="muted" />}
        <Stat value={medianSec ?? "–"} unit={medianSec != null ? "s" : undefined} label="median seconds before a restock sells out" tone={medianSec != null ? "warn" : "muted"} />
      </StatGrid>
      <Points className="mt-4" items={[
        { text: <><b className="text-ink">Apple Store pickup</b>: reserve online, collect at the store; the realistic same-day route</> },
        { text: <>Turning up without a reservation: the batch is gone before you reach the counter</>, no: true },
        { text: <><b className="text-ink">apple.com delivery</b>: every configuration, with a date at checkout for your ZIP (not tracked here)</> },
        { text: <><b className="text-ink">Carriers and retailers</b>: they sell iPhones; check their pages for the Duo, since we read no stock there</>, step: true },
      ]} />
      <div className="mt-6 flex gap-3 flex-wrap">
        <Link href={alert} className="btn btn-primary">Put stores near me on the wire</Link>
        <Link href="/iphone-duo-in-stock-near-me" className="btn btn-ghost">Closest stores with one</Link>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap text-sm gap-2">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.nav}</a>)}
      </nav>
      <Figure id="phone-card-payment" eager />

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- in stock right now */}
        <section id="now" className="scroll-mt-24">
          <h2>{h2("now")}</h2>
          <p><b>{nowLead}</b></p>
          <StatGrid cols={4} className="my-4">
            <Stat value={stockUnknown ? "–" : `${storesNow}/${STORES.length}`} label="stores with one now" tone={!stockUnknown && storesNow > 0 ? "ok" : "muted"} live={!stockUnknown} />
            <Stat label="past-day restocks" value={recent.unknown ? "–" : n(recent.restocks)} />
            {latest && latestStore
              ? <Stat size="sm" value={clockAt(latest.at, latestStore)} label={<>{storeLink(latestStore)} · last restock, local time</>} />
              : <Stat value="–" label="last restock: none logged yet" tone="muted" />}
            <Stat value={medianSec ?? "–"} unit={medianSec != null ? "s" : undefined} label="median seconds a listing lasts" tone={medianSec != null ? "warn" : "muted"} />
          </StatGrid>
          {states.length > 0 ? (
            <Table caption={`Top ${states.length} states by Apple Stores listing an iPhone Duo for pickup at ${asOf}; most recent confirmed restock in store local time`} head={["State", "Stores with one now", "Most recent restock"]} min="30rem">
              {states.map((r) => (
                <tr key={r.name} className="border-b border-line">
                  <th scope="row" className={rowTh}><Link href={statePath(r.name)} className="hover:underline">{r.name}</Link></th>
                  <td className={td}>{r.now} of {r.total}</td>
                  <td className="py-2 pe-3 align-top">{r.lastAt && r.lastStore ? <>{localStamp(r.lastAt, r.lastStore)} · {storeLink(r.lastStore)}</> : "–"}</td>
                </tr>
              ))}
            </Table>
          ) : (
            <>
              <div className="eyebrow mt-5">{stockUnknown ? "Most recent confirmed restocks" : "Nothing listed now: the most recent confirmed restocks"}</div>
              <div className="my-3"><RestockFeed rows={feed} showModel={false} model="duo" emptyText="No confirmed iPhone Duo restock in the log yet." /></div>
            </>
          )}
          <Keys items={[
            { text: <>Rank the stores by distance from you, or follow the map</>, step: true },
            { text: <>&quot;Available&quot; means <b className="text-ink">reservable for pickup now</b>{band ? <>, typically for about <b className="text-ink">{band}</b></> : null}</> },
            { text: <>A listing is <b className="text-ink">one store × one configuration</b>, never a city; the state table is a shortlist, not a promise</> },
            { text: <>Every US Apple Store on the <b className="text-ink">{SPEED.checkSec}-second</b> wire; alert stores on the {SPEED.fastSec}-second one</> },
          ]} />
          <ChipLinks items={[
            { href: "/iphone-duo-in-stock-near-me", label: "Closest store with a Duo" },
            { href: "/iphone-duo-availability-checker", label: "Availability checker, store by store" },
            { href: "/live-map", label: "Live map, every store" },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- apple.com delivery */}
        <section id="delivery" className="scroll-mt-24">
          <h2>{h2("delivery")}</h2>
          <p><b>If a date works for you, yes: apple.com sells all {items.length} configurations unlocked for delivery and shows the estimate at checkout for your ZIP. RestockWire does not track those dates, so weigh Apple&apos;s date against the pickup odds here.</b></p>
          <p>Delivery is the certain route; pickup is the fast one. {t.unknown ? "Every confirmed restock in our log" : `${n(t.n)} confirmed restocks at ${t.stores} US Apple Stores since ${since}`} show phones reaching stores in small batches, and a pickup listing is stock for today. Once the pickup order is placed, Apple holds the phone at that store (<Out href={APPLE_PICKUP}>Apple: Delivery and Pickup</Out>); a delivery order only holds your place for the date Apple quotes.</p>
          {!t.unknown && t.n > 0 && (
            <StatGrid cols={3} className="my-4">
              <Stat value={n(t.n)} label={<>restocks at US Apple Stores since {since}</>} tone="accent" />
              <Stat value={`${t.stores}/${STORES.length}`} label="stores restocked at least once" />
              <Stat value={t.today ? n(t.today.restocks) : `${t.days}/${tracked}`} label={t.today ? "restocks so far today (store local days)" : "days with a restock / days tracked"} />
            </StatGrid>
          )}
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="Driving store to store across a city" yes="Two or three stores, and the right minute" why="A listing is one store and one configuration, reserved online in seconds; the drive comes afterwards." />
            <Swap no="Watching the apple.com date slide all week" yes="Placing the delivery order, then adding pickup alerts" why="Whichever arrives first wins; check Apple's order page for how to cancel the other before you end up with two." />
          </ol>
          <Keys items={[
            { text: <>Weigh them yourself: Apple&apos;s date against the restock counts here</>, step: true },
            { text: <>Pickup listing: what the store can hand over <b className="text-ink">today</b>, read from the apple.com page anyone can open</> },
            { text: <>Delivery estimate: Apple shows it at checkout for your ZIP; RestockWire does <b className="text-ink">not track</b> it</> },
          ]} />
          <ChipLinks items={[
            ...(topCfg ? [{ href: appleBuyUrl(topCfg.item), label: `Order ${cfgName(topCfg.item)} on apple.com (restocks most)` }] : []),
            { href: APPLE_DUO, label: "Every iPhone Duo configuration on apple.com" },
            { href: "/in-stock/iphone-duo", label: "Pickup stock at every US store, live" },
          ]} />
          <Figure id="doorstep-packages" />
        </section>

        {/* ---------------------------------------------------------------- which store */}
        <section id="which-store" className="scroll-mt-24">
          <h2>{h2("which-store")}</h2>
          <p><b>{storeLead}</b></p>
          <p>{windowSentence}</p>
          {topStores.length > 0 && (
            <Table caption={`Top ${topStores.length} US Apple Stores by confirmed iPhone Duo restocks since ${since}; a usual hour only from ${PATTERN_MIN} restocks on ${PATTERN_MIN_DAYS} days; most recent restock in store local time`} head={["Store", "Restocks", "Days", "Usual hour", "Most recent"]} min="34rem">
              {topStores.map((r) => (
                <tr key={r.storeNumber} className="border-b border-line">
                  <th scope="row" className={rowTh}>{storeLink(r.store)}<span className="font-normal text-ink-3"> · {cityLine(r.store)}</span></th>
                  <td className={td}>{n(r.restocks)}</td>
                  <td className={td}>{r.days}</td>
                  <td className={td}>{r.peakHour != null ? hourLabel(r.peakHour) : "–"}</td>
                  <td className="py-2 pe-3 align-top">{localStamp(r.lastAt, r.store)}</td>
                </tr>
              ))}
            </Table>
          )}
          <Keys items={[
            { text: <>Head for the store the push names, in its usual window, with checkout staged</>, step: true },
            { text: <>Each state has an hour-by-hour page for its stores, for example <Link href="/when-does-iphone-duo-restock/florida">Florida</Link></> },
            { text: <>No reservation, no phone: Duo stock leaves as <b className="text-ink">online pickup reservations</b> and the counter hands over only those (<Link href="/how-to-buy-an-iphone-duo-in-store">buying one in store</Link> · <Link href="/apple-store-pickup-explained">the apple.com wording</Link>)</>, no: true },
          ]} />
          <ChipLinks items={[
            { href: "/when-does-iphone-duo-restock", label: "iPhone Duo restock hours" },
            { href: "/when-does-iphone-duo-restock/florida", label: "Florida restock hours (one page per state)" },
            { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- carriers and retailers */}
        <section id="carriers" className="scroll-mt-24">
          <h2>{h2("carriers")}</h2>
          <p><b>Yes, they sell iPhones, but RestockWire can only verify one of the four US channels: Apple Store pickup, read from apple.com at all {STORES.length} stores every {SPEED.checkSec} seconds. apple.com delivery, carrier stores and sites, and big-box retailers are described below, not measured.</b></p>
          <Table caption="Each channel: what its official page lets you do, and what RestockWire can check" head={["Channel", "What its page lets you do", "Can RestockWire check it?", "Official page"]} min="40rem">
            <tr className="border-b border-line">
              <th scope="row" className={rowTh}>Apple Store pickup</th>
              <td className="py-2 pe-3 align-top">Reserve a configuration at a store listing it and collect it there; Apple holds a placed pickup order</td>
              <td className="py-2 pe-3 align-top font-medium text-ink">Yes: every US Apple Store every {SPEED.checkSec} s; all numbers on this page</td>
              <td className="py-2 pe-3 align-top"><Out href={APPLE_PICKUP}>Apple: Delivery and Pickup</Out></td>
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className={rowTh}>apple.com delivery</th>
              <td className="py-2 pe-3 align-top">Order any configuration, unlocked; an estimate shows at checkout for your ZIP</td>
              <td className="py-2 pe-3 align-top text-ink-3">No: delivery dates are not tracked</td>
              <td className="py-2 pe-3 align-top"><Out href={APPLE_DUO}>iPhone Duo on apple.com</Out></td>
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className={rowTh}>Carrier stores and sites</th>
              <td className="py-2 pe-3 align-top">Sell iPhones, usually with the carrier&apos;s plans and financing; check their page for the Duo</td>
              <td className="py-2 pe-3 align-top text-ink-3">No: no carrier stock is read</td>
              <td className="py-2 pe-3 align-top">{CARRIERS.map((c, i) => <span key={c.url}>{i > 0 && " · "}<Out href={c.url}>{c.name}</Out></span>)}</td>
            </tr>
            <tr className="border-b border-line">
              <th scope="row" className={rowTh}>Big-box retailers</th>
              <td className="py-2 pe-3 align-top">Sell iPhones; check their page for the Duo</td>
              <td className="py-2 pe-3 align-top text-ink-3">No: no retailer stock is read</td>
              <td className="py-2 pe-3 align-top"><Out href={BEST_BUY.url}>{BEST_BUY.name}</Out></td>
            </tr>
          </Table>
          <p>Worth knowing before you buy from a carrier: the phone may come with a carrier lock or financing terms that an unlocked phone from Apple does not have. The FCC&apos;s <Out href={FCC_UNLOCK}>Cell Phone Unlocking FAQs</Out> explain what a carrier lock is and when carriers unlock, and <Out href={WIKI_SIM_LOCK}>SIM lock</Out> is the name for the lock itself. Read them before trading &quot;in stock today&quot; for a line you did not want.</p>
          <Keys items={[
            { text: <>A carrier or retailer may have one today; we cannot see it and will not pretend to</>, step: true },
            { text: <>Apple Store pickup is the <b className="text-ink">only channel measured</b>; the other rows describe pages, not stock</> },
            { text: <>apple.com and Apple Stores sell the Duo <b className="text-ink">unlocked</b>; every apple.com configuration page is the unlocked one</> },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- configuration */}
        <section id="configuration" className="scroll-mt-24">
          <h2>{h2("configuration")}</h2>
          <p><b>{configLead}</b></p>
          <p>Need it this week? Fix the storage and take any of its colors; holding out for one color can turn a one-week wait into three. The rows below differ in restocks, not in price, and every row is the same phone.</p>
          <Table caption={`The ${items.length} iPhone Duo configurations: US Apple Stores listing each for pickup at ${asOf}, confirmed restocks since ${since}, Apple's list price before tax, and the apple.com order page`} head={["Storage · color", "Listing it now", `Restocks since ${since}`, "Price", "apple.com"]} min="36rem">
            {configs.map((r) => (
              <tr key={r.item.partNumber} className={`border-b border-line ${r.restocks === 0 && r.now === 0 ? "text-ink-3" : ""}`}>
                <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={r.item.color} />{cfgName(r.item)}</span></th>
                <td className={`${td} ${r.now > 0 ? "font-semibold text-ok" : ""}`}>{stockUnknown ? "–" : r.now}</td>
                <td className={td}>{t.unknown ? "–" : n(r.restocks)}</td>
                <td className={td}>{fmtPrice(r.item.price)}</td>
                <td className="py-2 pe-3 align-top"><Out href={appleBuyUrl(r.item)}>Order</Out></td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>Two acceptable colors means two alerts per store; <Link href="/iphone-duo-most-restocked-stores">the ranking</Link> lays out the odds</>, step: true },
            { text: <>&quot;Stores now&quot; is this minute; <b className="text-ink">restocks</b> is the record since {since}</> },
            { text: <>Apple list prices on apple.com, <b className="text-ink">before sales tax</b>, which differs by state</> },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- the minute it is back */}
        <section id="the-minute" className="scroll-mt-24">
          <h2>{h2("the-minute")}</h2>
          <p><b>{minuteLead}</b></p>
          <p>{PRICE_SENTENCE}</p>
          <StepStrip className="lg:grid-cols-4! my-4" steps={[
            { title: "Choose stores and a configuration", hint: "two or three reachable stores; an alert is one store × one exact configuration" },
            { title: "Add the Home Screen app, allow pushes", hint: <>on iPhone, add RestockWire to your Home Screen and allow notifications (<Link href="/phone-alerts">how</Link>)</> },
            { title: "Stage Apple's checkout", hint: "be signed in with Apple Pay or a card saved, and leave the buy page open on pickup" },
            { title: "Act on the push in about 20 seconds", hint: "pick the store it names, confirm pickup, pay; the reservation is the order" },
          ]} />
          <Keys items={[
            { text: <>Free to browse; alerts: {PLANS.plus.name} ${PLANS.plus.priceUsd} ({PLANS.plus.limit} alerts), {PLANS.pro.name} ${PLANS.pro.priceUsd} ({PLANS.pro.limit}), {PLANS.max.name} ${PLANS.max.priceUsd} ({PLANS.max.limit}) a month</>, step: true },
            { text: <>The push comes about <b className="text-ink">{SPEED.alertSec} s</b> after two checks agree; your stores are read every <b className="text-ink">{SPEED.fastSec} s</b>, all others every {SPEED.checkSec}</> },
            { text: <>Typing an address mid-restock is how people miss it</>, no: true },
          ]} />
          <ChipLinks items={[
            { href: "/iphone-duo-restock-alerts", label: "What an alert does" },
            { href: "/iphone-duo-restock-checkout-guide", label: "Checkout drill, four taps" },
            { href: "/phone-alerts", label: "Home Screen app" },
          ]} />
          <p><Link href={alert} className="btn btn-primary">Start an iPhone Duo alert</Link></p>
          <Figure id="apple-store-pickup-counter" />
        </section>

        {/* ---------------------------------------------------------------- outside the US */}
        <section id="abroad" className="scroll-mt-24">
          <h2>{h2("abroad")}</h2>
          <p><b>{abroadLead}</b></p>
          <Table caption={`Apple Stores listing an iPhone Duo for pickup at ${asOf} across the ${INTL_CODES.length} other countries on the wire, most first; each country's apple.com store also sells it online`} head={["Country", "Stores with one now", "Stores tracked", "apple.com"]} min="30rem">
            {abroad.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now === 0 ? "text-ink-3" : ""}`}>
                <th scope="row" className={rowTh}><Link href={`${prefixOf(c.cc)}/in-stock/iphone-duo`} className="hover:underline">{COUNTRIES[c.cc].name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-ok" : ""}`}>{c.now}</td>
                <td className={td}>{c.total}</td>
                <td className="py-2 pe-3 align-top"><Out href={appleFamilyUrl("duo", c.cc)}>iPhone Duo, {COUNTRIES[c.cc].short}</Out></td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>Apple&apos;s country stores sell online too; their delivery dates are not tracked either</>, step: true },
            { text: <>On the wire since <b className="text-ink">{longDate(TRACKING_SINCE_INTL)}</b>, with the same {SPEED.checkSec}-second checks and {SPEED.fastSec}-second alerts</> },
            { text: <>Each country page: the same live list, its own stores, prices in its currency</> },
          ]} />
          <Measured title="Reading these numbers">
            A store counts as listing an iPhone Duo when apple.com shows at least one configuration available for pickup there at our latest check: every {SPEED.checkSec} seconds at each store, {SPEED.fastSec} at stores with alerts. A restock counts only when two checks about a second apart agree, and a store&apos;s first sighting after launch never counts. Carrier and retailer pages are described, not read; RestockWire has no data on their stock.
          </Measured>
          <p className="text-sm text-ink-3">Cite this page: quote any figure with a link back. RestockWire is independent of Apple and reads the pickup availability apple.com shows everyone, only far more often.</p>
        </section>
      </div>

      <RelatedBlock>
        <LinkRow title="Other iPhone Duo questions, same data" links={[
          { href: "/is-iphone-duo-back-in-stock", label: "Back in stock at this minute?" },
          { href: "/when-does-iphone-duo-restock", label: "When does the iPhone Duo restock?" },
          { href: "/how-fast-does-iphone-duo-sell-out", label: "How many seconds does a restock last?" },
          { href: "/iphone-duo-in-stock-near-me", label: "Closest store with a Duo" },
          { href: "/how-to-buy-an-iphone-duo-in-store", label: "Buying one in store while sold out" },
          { href: "/iphone-duo-restock-checkout-guide", label: "The 20-second checkout" },
          { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
          { href: "/apple-store-pickup-explained", label: "Pickup status explained" },
        ]} />
        <LinkRow title="Live" links={[
          { href: "/in-stock/iphone-duo", label: "Every US store, live" },
          { href: "/restock-log", label: "Restock log" },
          { href: "/live-map", label: "Live map" },
          { href: "/apple-stores", label: "Every US Apple Store, by state" },
        ]} />
        <LinkRow title="Asked another way" links={[
          { href: "/iphone-duo-availability-checker", label: "iPhone Duo availability checker" },
          { href: "/iphone-duo-restock-alerts", label: "iPhone Duo restock alerts" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq title="Where-to-buy questions" items={faq} facts={facts} /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`${STORES.length} US Apple Stores, plus ${INTL_CODES.length} more countries from ${longDate(TRACKING_SINCE_INTL)}`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
