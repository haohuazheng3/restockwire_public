/**
 * /iphone-duo-availability-checker: "iPhone Duo stock checker", the words Google and Gemini use for this kind of site. The
 * page is the checker: a server-rendered table of every US state with the Apple Stores listing an iPhone Duo for
 * pickup right now, then how to check on apple.com yourself, how our checks work, what we know about each store,
 * which configurations turn up, the observed restock pattern (never a schedule), the 18 other countries, and alerts.
 * Every H2 is a question with one quotable answer sentence under it; every number is live and RestockWire's own,
 * and a read that fails says so instead of showing zeros as facts.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cache } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Breadcrumbs, LinkRow, RelatedBlock } from "@/components/seo/Related";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { LiveChecked } from "@/components/site/LiveChecked";
import { Swatch } from "@/components/stores/ConfigTable";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap, type Point } from "@/components/ui/Viz";
import { getFacts, tokenValue } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { ALL_STORES, STORES, appleBuyUrl, appleName, catalogFor, cityLine, statePath, statesWithStores, storeByNumber, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, prefixOf } from "@/lib/apple/countries";
import { CHECK_NOTE, OTHER_TRACKERS, PLANS, SPEED } from "@/lib/plans";
import { PATTERN_MIN, PATTERN_MIN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, hourShare, rangeLabel } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { modelStock, restockFeed, storesWithStockNow } from "@/lib/stock/queries";
import { medianBand } from "@/lib/stock/sellouts";
import { SALES_TAX_SOURCE, withTax } from "@/content/sales-tax";
import { alertHref, compressHours, fmtPrice, fullAddress, normalizeHours, plural } from "@/lib/seo/enrich";

export const dynamic = "force-dynamic";

const SITE = "https://restockwire.com";
const PATH = "/iphone-duo-availability-checker";
const TITLE_STATIC = "iPhone Duo Availability Checker: All Apple Stores Live";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const WIKI_INVENTORY = "https://en.wikipedia.org/wiki/Inventory";
/** The one price sentence, word for word, in the body and in a FAQ answer (answer engines quote it as is). */
const PRICE_SENTENCE = `${SPEED.fastSec}-second checks on the stores you pick, from $${PLANS.plus.priceUsd} a month, and a push about ${SPEED.alertSec} s after each confirmed restock.`;
const QUOTE = "Cite this page: quote any figure with a link back. RestockWire is independent of Apple and reads the pickup availability apple.com shows everyone, only far more often.";

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const SHORT = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" });
const shortDate = (ymd: string) => SHORT.format(new Date(`${ymd}T12:00:00Z`));
const UPDATED = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const hl = (h: number) => hourLabel(h % 24);

/** One read for generateMetadata and the page (React cache): the title's live count is the table's live count. */
const load = cache(async () => Promise.all([
  modelStock("duo", "us"),
  recentByConfig({ country: "us" }),
  duoRestockTimes("us"),
  siteFacts(),
  getFacts(),
  restockFeed({ model: "duo", limit: 200, country: "us" }),
  Promise.all(INTL_CODES.map((cc) => storesWithStockNow(undefined, cc))),
]));

/** Distinct US stores with at least one iPhone Duo configuration available, from the model's status rows. */
function storesNowFrom(rows: { storeNumber: string; status: string }[]): number {
  return new Set(rows.filter((r) => r.status === "available").map((r) => r.storeNumber)).size;
}

export async function generateMetadata(): Promise<Metadata> {
  const [rows, , , , facts] = await load();
  // A status row exists for every tracked store × configuration, so no rows at all means the read failed, not "no stock".
  const live = rows.length > 0;
  const duoNow = live ? storesNowFrom(rows) : null;
  const asOf = tokenValue("asOf", facts) ?? "";
  const title = duoNow ? `iPhone Duo Availability: ${duoNow} of ${STORES.length} Apple Stores Now` : TITLE_STATIC;
  // ≤ 158 characters with the largest possible count and the longest "asOf" ("Nov 25, 12:45 PM ET"): 157.
  const description = duoNow != null
    ? `iPhone Duo pickup stock now (${asOf}): ${duoNow} of ${STORES.length} US Apple Stores, by state and configuration, plus ${INTL_CODES.length} other countries; read every ${SPEED.checkSec} s.`
    : `Live iPhone Duo pickup stock at all ${STORES.length} US Apple Stores, by state and configuration, plus ${INTL_CODES.length} other countries. Every store is read every ${SPEED.checkSec} seconds.`;
  return {
    title: { absolute: `${title} · RestockWire` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "RestockWire", title, description, url: PATH },
  };
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

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/** "Reads → means": a two-column legend. */
function KeyTable({ head, rows }: { head: [string, string]; rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[20rem] text-sm">
        <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 pe-3 font-semibold">{head[0]}</th><th className="pb-2 font-semibold">{head[1]}</th></tr></thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="whitespace-nowrap py-2 pe-3 font-semibold text-ink">{a}</td>
              <td className="py-2 text-ink-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface StateRow { name: string; path: string; stores: number; withStock: number; configs: number; restocks: number | null; lastAt: string | null; lastStore: Store | null }

export default async function StockCheckerPage() {
  const [rows, recent, t, f, facts, feed, intlNow] = await load();
  const live = rows.length > 0;
  const available = rows.filter((r) => r.status === "available");
  const duoNow = storesNowFrom(rows);
  const asOf = tokenValue("asOf", facts) ?? "";
  const updated = `${UPDATED.format(new Date(facts.at))} ET`;
  const intlStores = ALL_STORES.length - STORES.length;
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = items.find((x) => x.partNumber === p); return i ? `${i.storage} ${i.color}` : p; };
  const since = longDate(t.since);
  const sell = t.sellout;
  const band = sell ? medianBand(sell.medianSec) : null;
  const alert = alertHref({ model: "duo" });
  /** The newest check among the model's status rows: the figure LiveChecked keeps true while the page is open. */
  const lastChecked = rows.reduce<string | null>((a, r) => (r.lastCheckedAt && (!a || r.lastCheckedAt > a) ? r.lastCheckedAt : a), null);
  const stampAt = (iso: string, store: Store) => `${localStamp(iso, store)} local time`;

  // ---- the checker: every US state, stores listing a Duo now, configurations, restocks and the last one
  const byState = new Map<string, { stores: Set<string>; parts: Set<string> }>();
  for (const r of available) {
    const s = storeByNumber(r.storeNumber);
    if (!s) continue;
    const a = byState.get(s.state) ?? { stores: new Set<string>(), parts: new Set<string>() };
    a.stores.add(r.storeNumber); a.parts.add(r.partNumber); byState.set(s.state, a);
  }
  const region = new Map(t.byRegion.map((r) => [r.name, r]));
  // The last restock per state: the 5-minute restock-times read, overlaid with the live feed where it is newer.
  const last = new Map<string, { at: string; store: Store }>();
  for (const r of t.byRegion) { const s = r.lastStore ? storeByNumber(r.lastStore) : undefined; if (r.lastAt && s) last.set(r.name, { at: r.lastAt, store: s }); }
  for (const r of feed) { const cur = last.get(r.store.state); const at = r.at.toISOString(); if (!cur || at > cur.at) last.set(r.store.state, { at, store: r.store }); }
  const states: StateRow[] = statesWithStores().map((st) => ({
    name: st.name, path: statePath(st.name), stores: st.count,
    withStock: byState.get(st.name)?.stores.size ?? 0, configs: byState.get(st.name)?.parts.size ?? 0,
    restocks: t.unknown ? null : region.get(st.name)?.restocks ?? 0,
    lastAt: last.get(st.name)?.at ?? null, lastStore: last.get(st.name)?.store ?? null,
  })).sort((a, b) => (b.withStock > 0 ? 1 : 0) - (a.withStock > 0 ? 1 : 0) || b.withStock - a.withStock || a.name.localeCompare(b.name));
  const statesHit = states.filter((s) => s.withStock > 0);
  const topState = statesHit[0];
  const latest = recent.latest ? { ...recent.latest, store: storeByNumber(recent.latest.storeNumber) } : null;

  // ---- configurations: stores listing each one now, restocks in 24 h and since tracking began
  const nowByPart = new Map<string, number>();
  for (const r of available) nowByPart.set(r.partNumber, (nowByPart.get(r.partNumber) ?? 0) + 1);
  const sincePart = new Map(t.byPart.map((p) => [p.partNumber, p]));
  const dayPart = new Map(recent.byPart.map((p) => [p.partNumber, p]));
  const configs = [...items].sort((a, b) => (sincePart.get(b.partNumber)?.restocks ?? 0) - (sincePart.get(a.partNumber)?.restocks ?? 0) || (nowByPart.get(b.partNumber) ?? 0) - (nowByPart.get(a.partNumber) ?? 0));
  const topCfg = !t.unknown && t.n > 0 ? configs.find((i) => (sincePart.get(i.partNumber)?.restocks ?? 0) > 0) : undefined;
  const topCfgN = topCfg ? sincePart.get(topCfg.partNumber)!.restocks : 0;
  const mostNow = live ? [...configs].sort((a, b) => (nowByPart.get(b.partNumber) ?? 0) - (nowByPart.get(a.partNumber) ?? 0))[0] : undefined;
  const mostNowN = mostNow ? nowByPart.get(mostNow.partNumber) ?? 0 : 0;

  // ---- one real store: the US store with the most confirmed Duo restocks since tracking began
  const topRow = t.topStores[0];
  const topStore = topRow ? storeByNumber(topRow.storeNumber) : undefined;
  const topPattern = topStore ? f.patterns[topStore.storeNumber] : undefined;
  const topNow = topStore ? available.filter((r) => r.storeNumber === topStore.storeNumber).length : 0;
  const cheapest = Math.min(...items.map((i) => i.price));
  const topTax = topStore ? withTax(cheapest, topStore.state) : null;
  const topHours = topStore?.hours ? compressHours(normalizeHours(topStore.hours)) : null;

  // ---- the observed pattern
  const pattern = !t.unknown && t.peakHour != null;
  const w = busiestWindow(t.byHour);

  // ---- the 18 other countries
  const countries = INTL_CODES.map((cc, i) => ({ cc, now: intlNow[i].duo, stores: storesOf(cc).length })).sort((a, b) => (b.now > 0 ? 1 : 0) - (a.now > 0 ? 1 : 0));
  const intlDuoNow = countries.reduce((a, c) => a + c.now, 0);
  const intlHit = countries.filter((c) => c.now > 0);

  const sections = [
    { id: "states", nav: "Listed now", h2: "Which Apple Stores list the iPhone Duo for pickup this minute?" },
    { id: "apple", nav: "On apple.com", h2: "Can you check iPhone Duo stock on apple.com yourself?" },
    { id: "how", nav: "The method", h2: "How does the RestockWire checker read Apple Stores?" },
    { id: "store", nav: "One store", h2: "What does the checker show for a single store?" },
    { id: "configs", nav: "Configurations", h2: "Which iPhone Duo configurations turn up in stock most?" },
    { id: "when", nav: "Restock hours", h2: "Can a stock checker predict a store's next restock?" },
    { id: "countries", nav: "Abroad", h2: "Does the iPhone Duo checker cover other countries?" },
    { id: "alerts", nav: "Alerts", h2: "How do you stop checking and get a push instead?" },
  ];
  const h2Of = (id: string) => sections.find((s) => s.id === id)!.h2;

  const faq: Faq[] = [
    { q: "Where can I check iPhone Duo stock at every Apple Store at once?", a: `Here: RestockWire reads all ${STORES.length} US Apple Stores every ${SPEED.checkSec} seconds (plus ${intlStores} stores in ${INTL_CODES.length} other countries) and lists the states and stores with one now${t.unknown ? "" : `, with ${n(t.n)} US restocks logged since ${since}`}. Browsing is free; [alerts](/iphone-duo-restock-alerts) push a restock to your phone within seconds.` },
    { q: "How current is the stock this checker shows?", a: `Every US Apple Store is read every ${SPEED.checkSec} seconds and the stores in paid alerts every ${SPEED.fastSec} (other trackers publish ${OTHER_TRACKERS}). A first "available" counts only once a second answer about a second later agrees, and a failed request never counts as sold out.` },
    { q: "Why does every store say \"currently unavailable for pickup\" when I look?", a: sell && band
      ? `Because you land between restocks: a typical Duo listing lasts about ${band} (median ${sell.medianSec} seconds over ${n(sell.n)} timed sell-outs since ${since}). The state table shows where it reads "available" now, and [the wording explained](/apple-store-pickup-explained) covers the rest.`
      : `Because you land between restocks: a Duo listing lasts seconds to a few minutes, then reads "currently unavailable" for the rest of the day. The state table shows where it reads "available" now, and [the wording explained](/apple-store-pickup-explained) covers the rest.` },
    { q: "What does the checker cost, and what do alerts cost?", a: `The checker, every store page, the [map](/live-map) and the [restock log](/restock-log) are free. ${PRICE_SENTENCE} ${PLANS.plus.name} holds ${PLANS.plus.limit} alerts, ${PLANS.pro.name} ${PLANS.pro.limit} ($${PLANS.pro.priceUsd}), ${PLANS.max.name} ${PLANS.max.limit} ($${PLANS.max.priceUsd}); each alert covers a single store and a single exact configuration ([pricing](/pricing)).` },
  ];

  const sources: Source[] = [
    { label: "Apple, Delivery and Pickup: how pickup holds work", url: APPLE_PICKUP },
    { label: "Apple: Buy iPhone Duo, the availability this checker reads", url: APPLE_DUO },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide, October 23, 2026", url: APPLE_NEWSROOM },
    { label: "MacRumors: iPhone Duo pickup at US Apple Stores, October 24, 2026", url: MACRUMORS },
    { label: SALES_TAX_SOURCE.label, url: SALES_TAX_SOURCE.url },
    { label: "Wikipedia: Inventory", url: WIKI_INVENTORY },
  ];

  const description = `Live iPhone Duo pickup stock at all ${STORES.length} US Apple Stores, by state and configuration, plus ${INTL_CODES.length} other countries; every store read every ${SPEED.checkSec} seconds.`;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE_STATIC, description, isPartOf: { "@id": `${SITE}/#website` }, about: { "@id": `${SITE}/#organization` }, dateModified: facts.at },
      {
        "@type": "WebApplication", "@id": `${SITE}${PATH}#app`, name: "RestockWire iPhone Duo availability checker", url: `${SITE}${PATH}`,
        description: `Reads iPhone Duo in-store pickup availability at all ${STORES.length} US Apple Stores every ${SPEED.checkSec} seconds (plus ${intlStores} stores in ${INTL_CODES.length} other countries), shows the states and stores with one now, and logs each confirmed restock.`,
        applicationCategory: "UtilitiesApplication", operatingSystem: "Any",
        featureList: [
          `Live iPhone Duo pickup stock at ${STORES.length} US Apple Stores by state, store and configuration`,
          `${SPEED.checkSec}-second checks at every store; ${SPEED.fastSec}-second checks at stores with an alert`,
          "A second check confirms each restock before it counts",
          "A log of each confirmed restock and sell-out with store, configuration and local time",
          `A push to your phone ~${SPEED.alertSec} seconds once a restock is confirmed`,
        ],
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: `Browsing costs nothing; alerts start at $${PLANS.plus.priceUsd}/month` },
        publisher: { "@id": `${SITE}/#organization` },
      },
      {
        "@type": "Dataset", "@id": `${SITE}${PATH}#dataset`, name: "Live iPhone Duo pickup stock per US state",
        description: `Per US state with an Apple Store: the stores listing an iPhone Duo for in-store pickup at the latest check, which configurations are listed, restocks confirmed from ${since} on and the latest one, from RestockWire's reads of apple.com every ${SPEED.checkSec} seconds.`,
        url: `${SITE}${PATH}`, creator: { "@id": `${SITE}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores in the United States",
        variableMeasured: ["US state", "Apple Stores listing an iPhone Duo for pickup", "iPhone Duo configurations in stock", "confirmed restocks", "most recent restock, store local time"],
        measurementTechnique: `apple.com in-store pickup availability read every ${SPEED.checkSec} seconds (every ${SPEED.fastSec} at stores with alerts); a second agreeing check required; first sightings excluded`,
        ...(t.unknown || t.n === 0 ? {} : { size: `${n(t.n)} confirmed restocks` }),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <JsonLd data={ld} />
      <Breadcrumbs items={[{ href: "/", label: "RestockWire" }, { label: "iPhone Duo availability checker" }]} />
      <h1 className="display mt-3 text-3xl sm:text-5xl">iPhone Duo availability checker: which Apple Stores have it now?</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-2">
        {live ? (
          <>
            <b className="text-ink">{duoNow === 0 ? "No US Apple Store" : plural(duoNow, "US Apple Store")}</b> {duoNow === 1 || duoNow === 0 ? "lists" : "list"} an iPhone Duo for pickup right now{recent.unknown ? "" : <>, after <b className="text-ink">{plural(recent.restocks, "restock")}</b> in the last 24 hours</>}. RestockWire reads all <b className="text-ink">{STORES.length}</b> US stores (and <b className="text-ink">{intlStores}</b> in {INTL_CODES.length} more countries) every {SPEED.checkSec} seconds; last check <LiveChecked iso={lastChecked} model="duo" className="font-semibold text-ink" />.
          </>
        ) : (
          <>
            The live read did not load this time. RestockWire still reads all <b className="text-ink">{STORES.length}</b> US Apple Stores (and <b className="text-ink">{intlStores}</b> in {INTL_CODES.length} more countries) every {SPEED.checkSec} seconds; the table below keeps each state&apos;s stores and confirmed restocks, and the live columns return on reload.
          </>
        )}
      </p>
      <p className="mt-2 text-sm text-ink-3">{n(ALL_STORES.length)} Apple Stores on the wire, checked {CHECK_NOTE} · counting since {longDate(TRACKING_SINCE_US)} · last update {updated}</p>

      <StatGrid cols={4} className="mt-6">
        <Stat value={live ? duoNow : "–"} label={`US Apple Stores of ${STORES.length} listing a Duo for pickup now`} tone={duoNow > 0 ? "ok" : "plain"} live={live} />
        <Stat value={recent.unknown ? "–" : recent.restocks} label={recent.unknown ? "last 24 hours: count did not load" : `restocks in the last 24 hours, at ${plural(recent.stores, "store")}`} tone={recent.restocks > 0 ? "plain" : "muted"} />
        <Stat value={t.unknown ? "–" : n(t.n)} label={`US iPhone Duo restocks confirmed since ${since}`} />
        {sell
          ? <Stat value={sell.medianSec} unit="s" label={`median listing before sell-out (${n(sell.n)} timed)`} tone="warn" />
          : <Stat value={`${SPEED.checkSec}`} unit="s" label="between checks at every US Apple Store" tone="accent" />}
      </StatGrid>
      <Points className="mt-4" items={[
        { text: <>Alerts put a confirmed restock on your phone about <b className="text-ink">{SPEED.alertSec} s</b> later</>, step: true },
        { text: <><b className="text-ink">{SPEED.checkSec} s</b> for all {STORES.length} US stores; <b className="text-ink">{SPEED.fastSec} s</b> for stores with an alert</> },
        { text: <>A restock counts after two matching answers from apple.com; a failed request is never read as sold out</> },
        { text: <>Store local time throughout; RestockWire is independent of Apple</> },
      ]} />
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={alert} className="btn btn-primary">Put my stores on the wire</Link>
        <Link href="/iphone-duo-in-stock-near-me" className="btn btn-ghost">Closest stores with one</Link>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {sections.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.nav}</a>)}
      </nav>
      <Figure id="apple-store-entrance-busy" eager />

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- the checker */}
        <section id="states" className="scroll-mt-24">
          <h2>{h2Of("states")}</h2>
          <p><b>{!live
            ? `The live read did not load this time. The table still lists every US state with its Apple Stores, its confirmed iPhone Duo restocks since ${since} and the most recent one; each state page has its own live table.`
            : duoNow > 0 && topState
              ? `${duoNow} of ${STORES.length} US Apple Stores at ${asOf}, across ${plural(statesHit.length, "state")}. ${topState.name} is ahead: ${topState.withStock} out of ${plural(topState.stores, "store")} there; every state with an Apple Store is below, states with stock on top.`
              : `None at ${asOf}, which is normal between restocks. ${latest && latest.store ? `The last confirmed restock was a ${cfg(latest.partNumber)} at ${appleName(latest.store)}, ${stampAt(latest.at, latest.store)}` : "No restock was confirmed in the last 24 hours either"}; the table keeps each state's restock count and most recent one.`}</b></p>
          <Table caption={`US states with an Apple Store: stores listing an iPhone Duo for pickup at the latest check${live ? ` (${asOf})` : ""}, which configurations are listed, restocks confirmed from ${since} on and the latest, in store local time`} head={["State", "Stores with a Duo now", "Configurations listed", `Restocks since ${shortDate(t.since)}`, "Most recent restock"]} min="40rem">
            {states.map((s) => (
              <tr key={s.name} className={`border-b border-line ${s.withStock > 0 ? "bg-ok/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={s.path} className="hover:underline">{s.name}</Link></th>
                <td className={`${td} ${s.withStock > 0 ? "font-semibold text-ok" : ""}`}>{live ? `${s.withStock} of ${s.stores}` : "–"}</td>
                <td className={td}>{live ? (s.configs > 0 ? `${s.configs} of ${items.length}` : "–") : "–"}</td>
                <td className={td}>{s.restocks == null ? "–" : n(s.restocks)}</td>
                <td className="py-2 pe-3 align-top">{s.lastAt && s.lastStore ? <>{localStamp(s.lastAt, s.lastStore)} · <Link href={storePath(s.lastStore)} className="hover:underline">{appleName(s.lastStore)}</Link></> : "–"}</td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>On sale in Apple Stores since <a href={APPLE_NEWSROOM} target="_blank" rel="noopener">October 23, 2026</a> and bought faster than it arrives: an empty column is the usual reading</>, no: true },
            { text: <>Shaded rows: a store in that state listed a Duo at the latest check</> },
            { text: <><b className="text-ink">Configurations listed</b>: distinct storage × color pairs anywhere in the state, out of {items.length}</> },
            { text: <>One-store states link directly to the store page</> },
          ]} />
          <ChipLinks items={[
            { href: "/iphone-duo-in-stock-near-me", label: "Closest stores with one" },
            { href: "/live-map", label: `All ${STORES.length} stores on the map` },
            { href: "/in-stock/iphone-duo", label: "Every store × configuration" },
            { href: "/apple-stores", label: "Stores by state" },
          ]} />
          <Measured title="What puts a store in this table">
            A store shows stock only after two checks in a row both read &quot;available&quot; for the same configuration, and leaves only when the next round confirms it is gone. A configuration&apos;s first sighting at a store never counts as a restock, so launch listings from before {longDate(TRACKING_SINCE_US)} are left out. A failed read shows a dash, never a zero.
          </Measured>
        </section>

        {/* ---------------------------------------------------------------- apple.com */}
        <section id="apple" className="scroll-mt-24">
          <h2>{h2Of("apple")}</h2>
          <p><b>Yes, one configuration and one ZIP at a time: on the <a href={APPLE_DUO} target="_blank" rel="noopener">iPhone Duo buy page</a>, pick storage and color, choose &quot;Pick up&quot;, enter a ZIP, and Apple marks nearby stores &quot;Available Today&quot; or &quot;Currently unavailable for pickup&quot; for that instant (<a href={APPLE_PICKUP} target="_blank" rel="noopener">Apple&apos;s pickup page</a>).</b></p>
          <StepStrip className="my-4 lg:grid-cols-3!" steps={[
            { title: "Pick the configuration", hint: "storage and color, unlocked; price shown before tax" },
            { title: "Pick up → type a ZIP", hint: "Apple lists the stores near it, usually up to a dozen" },
            { title: "Read each store line", hint: "\"Available Today\" can be reserved now; \"Currently unavailable for pickup\" means not this moment" },
          ]} />
          <Keys items={[
            { text: <>Every phrase on the pickup page, decoded: <Link href="/apple-store-pickup-explained">pickup availability explained</Link></>, step: true },
            { text: <>No alert: a Duo listing lasts about <b className="text-ink">{band ?? "a minute"}</b>{sell ? ` (median ${sell.medianSec} s, ${n(sell.n)} timed sell-outs)` : ""}, so it usually comes and goes between reloads</>, no: true },
            { text: <>No memory: nothing says when the store last had one or how long it lasted</>, no: true },
            { text: <>One ZIP × one configuration per search: {items.length} configurations across two ZIPs is {items.length * 2} reloads</>, no: true },
            { text: <>US pickup opened October 24, 2026, a day after launch (<a href={MACRUMORS} target="_blank" rel="noopener">MacRumors</a>)</> },
          ]} />
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="ZIP after ZIP after ZIP" yes={<Link href="/iphone-duo-in-stock-near-me">All stores, nearest first</Link>} why={`All ${STORES.length} US Apple Stores in one list, live stock on each.`} />
            <Swap no="Reloading apple.com every few minutes" yes="A checker that reloads for you and pushes to your phone" why={`Each US store is read every ${SPEED.checkSec} seconds, alert stores every ${SPEED.fastSec}; the push lands about ${SPEED.alertSec} seconds after a confirmed restock.`} />
          </ol>
          <Figure id="click-and-collect-queue" />
        </section>

        {/* ---------------------------------------------------------------- how it works */}
        <section id="how" className="scroll-mt-24">
          <h2>{h2Of("how")}</h2>
          <p><b>By asking apple.com the shopper&apos;s pickup question for all {items.length} iPhone Duo configurations at each of the {STORES.length} US Apple Stores every {SPEED.checkSec} seconds ({SPEED.fastSec} at stores with an alert), and keeping only answers two checks in a row agree on. Every live table on the site is built from those answers alone.</b></p>
          <StatGrid cols={4} className="my-4">
            <Stat value={`${SPEED.fastSec}`} unit="s" label="between checks at a store with an alert" tone="accent" />
            <Stat value={`${SPEED.checkSec}`} unit="s" label="between checks at every US Apple Store" tone="accent" />
            <Stat value="~1" unit="s" label={<>until a first &quot;available&quot; is asked again</>} />
            <Stat value={t.unknown ? "–" : n(t.n)} label={`US Duo restocks on file since ${since}`} />
          </StatGrid>
          <Keys items={[
            { text: <>Cadence: <b className="text-ink">{SPEED.checkSec} seconds</b> at every store, <b className="text-ink">{SPEED.fastSec} seconds</b> at stores with an alert</> },
            { text: <>Confirmation: a first &quot;available&quot; is re-asked about a second later and counts only if both agree</> },
            { text: <>Sell-outs: confirmed on the next round, so one stray response never becomes a sell-out</> },
            { text: <>A failed or slow request is never logged as &quot;out of stock&quot;</>, no: true },
            { text: <>Store local time; US data since <b className="text-ink">{longDate(TRACKING_SINCE_US)}</b>, elsewhere since {longDate(TRACKING_SINCE_INTL)}</> },
            { text: <>Published intervals elsewhere: <b className="text-ink">{OTHER_TRACKERS}</b>; we compare published numbers only</> },
            { text: <>Every confirmation rule in one place: <Link href="/how-restock-alerts-work">how alerts work</Link></>, step: true },
          ]} />
          <Measured title="What &quot;in stock&quot; means on RestockWire">
            It is Apple&apos;s own in-store pickup availability for a store, read from apple.com: can that store hand over that configuration now. <a href={WIKI_INVENTORY} target="_blank" rel="noopener">Inventory</a> in the usual sense is the goods a shop holds; Apple publishes no unit counts, so no page here claims a quantity, a delivery date or a carrier&apos;s stock. Each store line is available or not, and we log when it changes.
          </Measured>
        </section>

        {/* ---------------------------------------------------------------- per store */}
        <section id="store" className="scroll-mt-24">
          <h2>{h2Of("store")}</h2>
          <p><b>Live stock for all {items.length} configurations, restocks over 24 hours and 30 days, the usual restock hour once there is enough data, each restock&apos;s seconds, opening hours, address and the price with state sales tax{topStore && topRow ? `. Example: ${appleName(topStore)} in ${cityLine(topStore)}, the US store with the most confirmed Duo restocks since ${since} (${n(topRow.restocks)})` : ""}.</b></p>
          {topStore && topRow ? (
            <>
              <StatGrid cols={4} className="my-4">
                <Stat value={n(topRow.restocks)} label={<>Duo restocks at <Link href={storePath(topStore)} className="underline underline-offset-2">{appleName(topStore)}</Link> since {since}, over {plural(topRow.days, "day")}</>} tone="accent" />
                {topRow.peakHour != null
                  ? <Stat value={<span className="text-2xl sm:text-3xl">{rangeLabel(topRow.peakHour, topRow.peakHour + 1)}</span>} label="usual restock hour, local time" />
                  : <Stat value="–" label={`usual hour: needs ${PATTERN_MIN} restocks on ${PATTERN_MIN_DAYS} separate days`} tone="muted" />}
                <Stat value={<span className="text-2xl sm:text-3xl">{localStamp(topRow.lastAt, topStore)}</span>} label="most recent confirmed restock, local time" />
                <Stat value={live ? `${topNow}/${items.length}` : "–"} label="configurations listed now" live={live} tone={topNow > 0 ? "ok" : "plain"} />
              </StatGrid>
              <KeyTable head={["On the store page", `${appleName(topStore)} now`]} rows={[
                ["Live stock", <>Each of the {items.length} configurations, marked listed or not as of the newest check</>],
                ["Restocks", <>{n(topRow.restocks)} since {since}{topPattern ? `, ${topPattern.restocks} in the last 30 days` : ""}, each with local time and seconds listed</>],
                ["Usual hour", <>{topRow.peakHour != null ? `${rangeLabel(topRow.peakHour, topRow.peakHour + 1)} local time, from ${plural(topRow.days, "day")} of restocks` : `not yet: needs ${PATTERN_MIN} restocks on ${PATTERN_MIN_DAYS} separate days`}</>],
                ...(topHours ? [["Hours", <>{topHours}</>] as [ReactNode, ReactNode]] : []),
                ["Address", <>{fullAddress(topStore)}</>],
                ...(topTax ? [["Price with tax", <>{fmtPrice(cheapest)} before tax; roughly {fmtPrice(topTax.total)} once {topStore.state} adds its {topTax.rate}% average state-plus-local rate (<a href={SALES_TAX_SOURCE.url} target="_blank" rel="noopener">Tax Foundation, 2026</a>)</>] as [ReactNode, ReactNode]] : []),
              ]} />
              <ChipLinks items={[
                { href: storePath(topStore), label: `${appleName(topStore)} store page` },
                { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked stores" },
                { href: "/apple-stores", label: `All ${STORES.length} stores, state by state` },
              ]} />
            </>
          ) : (
            <>
              <p>The worked example appears once the restock log loads; meanwhile every store page under <Link href="/apple-stores">the state-by-state store list</Link> shows the same facts for its own store.</p>
              <ChipLinks items={[{ href: "/apple-stores", label: `All ${STORES.length} stores, state by state` }, { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked stores" }]} />
            </>
          )}
          <Keys items={[
            { text: <>Set an alert for a store from that store&apos;s page</>, step: true },
            { text: <>Each restock shows the <b className="text-ink">seconds it lasted</b>, measured between two checks</> },
            { text: <>A usual hour needs <b className="text-ink">{PATTERN_MIN} restocks on {PATTERN_MIN_DAYS} separate days</b>; one burst is an event, not a habit</> },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- configurations */}
        <section id="configs" className="scroll-mt-24">
          <h2>{h2Of("configs")}</h2>
          <p><b>{topCfg
            ? `${cfg(topCfg.partNumber)}, with ${pct(topCfgN / t.n)} of all ${n(t.n)} US iPhone Duo restocks confirmed from ${since} on${live && mostNow && mostNowN > 0 ? `; at this moment ${cfg(mostNow.partNumber)} is listed by the most stores (${plural(mostNowN, "store")})` : live ? "; at this moment no store lists any configuration" : ""}. The table covers all ${items.length}, with stores listing each now, restocks in 24 hours and since launch, and Apple's buy page.`
            : t.unknown
              ? "No ranking this time: the restock log did not load. The table still lists all eight configurations with Apple's buy page for each, and fills in on reload."
              : `No ranking yet: no configuration has a confirmed restock. The table lists all ${items.length} with the stores listing each now and Apple's buy page.`}</b></p>
          <Table caption={`The ${items.length} iPhone Duo configurations sold in the US: stores listing each for pickup at the latest check, and confirmed restocks over 24 hours and since ${since}`} head={["Configuration", "Price", "Stores now", "24 h", `Since ${shortDate(t.since)}`, "apple.com"]} min="40rem">
            {configs.map((i) => {
              const now = nowByPart.get(i.partNumber) ?? 0;
              const day = dayPart.get(i.partNumber)?.restocks ?? 0;
              const all = sincePart.get(i.partNumber)?.restocks ?? 0;
              return (
                <tr key={i.partNumber} className={`border-b border-line ${now > 0 ? "bg-ok/[0.06]" : ""}`}>
                  <th scope="row" className={rowTh}><span className="inline-flex items-center gap-2"><Swatch color={i.color} />{i.storage} {i.color}</span></th>
                  <td className={td}>{fmtPrice(i.price)}</td>
                  <td className={`${td} ${now > 0 ? "font-semibold text-ok" : ""}`}>{live ? `${now} of ${STORES.length}` : "–"}</td>
                  <td className={td}>{recent.unknown ? "–" : day}</td>
                  <td className={td}>{t.unknown ? "–" : n(all)}</td>
                  <td className="py-2 pe-3 align-top"><a href={appleBuyUrl(i)} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap underline underline-offset-2 hover:text-ink">Open on apple.com</a></td>
                </tr>
              );
            })}
          </Table>
          <Keys items={[
            { text: <>&quot;Open on apple.com&quot; goes to Apple&apos;s page for that configuration; choose Pick up there and enter your ZIP</>, step: true },
            { text: <><b className="text-ink">Stores now</b>: US Apple Stores listing that exact configuration at the latest check</> },
            { text: <>Apple list prices before sales tax; state and store pages add the tax</> },
          ]} />
          <ChipLinks items={[
            { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
            { href: "/in-stock/iphone-duo", label: "Duo stock by configuration, store and state" },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- when */}
        <section id="when" className="scroll-mt-24">
          <h2>{h2Of("when")}</h2>
          <p><b>{pattern
            ? `No one can honestly predict it; the checker reports a pattern. ${pct(w.share)} of all ${n(t.n)} US iPhone Duo restocks confirmed from ${since} on landed between ${hl(w.from)} and ${hl(w.to)} store local time: something to plan around, not an appointment.`
            : t.unknown
              ? "No one can honestly predict it; the checker reports a pattern, and the restock log did not load this time. The hourly tables come back on reload."
              : `No one can honestly predict it; the checker reports a pattern, and it names one only after ${PATTERN_MIN} restocks on ${PATTERN_MIN_DAYS} separate days. The US log holds ${n(t.n)} so far.`}</b></p>
          {pattern && (
            <StatGrid cols={4} className="my-4">
              <Stat value={pct(w.share)} label={`of ${n(t.n)} restocks since ${since} landed ${hl(w.from)}–${hl(w.to)} local time`} tone="accent" />
              <Stat value={<span className="text-2xl sm:text-3xl">{rangeLabel(t.peakHour!, t.peakHour! + 1)}</span>} label={`peak hour (${n(t.byHour[t.peakHour!])} restocks)`} />
              <Stat value={pct(hourShare(t.byHour, 8, 12))} label="8 AM to noon" />
              <Stat value={pct(hourShare(t.byHour, 17, 24))} label="5 PM onward" tone="muted" />
            </StatGrid>
          )}
          <Keys items={[
            { text: <>A pattern is a count; a schedule would be a guess</>, no: true },
            { text: <>All hours are <b className="text-ink">store local time</b>: one national drop at 9:30 ET reads differently in each zone</> },
            { text: <>Hour tables for each state and city: <Link href="/when-does-iphone-duo-restock/texas">Texas</Link>, <Link href="/when-does-iphone-duo-restock/california/los-angeles">Los Angeles</Link>, and the rest from the national page</> },
            { text: <>Hour by hour and day by day: <Link href="/when-does-iphone-duo-restock">iPhone Duo restock hours</Link></>, step: true },
          ]} />
          <ChipLinks items={[
            { href: "/when-does-iphone-duo-restock", label: "iPhone Duo restock hours" },
            { href: "/how-fast-does-iphone-duo-sell-out", label: "Seconds per restock" },
            { href: "/restock-log", label: "Live restock log" },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- other countries */}
        <section id="countries" className="scroll-mt-24">
          <h2>{h2Of("countries")}</h2>
          <p><b>{live
            ? `Yes: ${intlStores} Apple Stores in ${INTL_CODES.length} other countries have been on the same ${SPEED.checkSec}-second checks since ${longDate(TRACKING_SINCE_INTL)}, and ${intlDuoNow === 0 ? "none of them lists" : `${plural(intlDuoNow, "of them lists", "of them list")}`} an iPhone Duo for pickup now${intlHit.length > 0 ? ` (${intlHit.map((c) => COUNTRIES[c.cc].short).join(", ")})` : ""}. Each country has its own live page, store pages and alerts.`
            : `Yes: ${intlStores} Apple Stores in ${INTL_CODES.length} other countries have been on the same ${SPEED.checkSec}-second checks since ${longDate(TRACKING_SINCE_INTL)}. The live read did not load this time; each country page carries its own live table.`}</b></p>
          <Table caption={`${INTL_CODES.length} more countries on the wire since ${longDate(TRACKING_SINCE_INTL)}: Apple Stores listing an iPhone Duo for pickup at the latest check, and stores tracked`} head={["Country", "Stores with a Duo now", "Stores tracked", "Pages"]} min="30rem">
            {countries.map((c) => (
              <tr key={c.cc} className={`border-b border-line ${c.now > 0 ? "bg-ok/[0.06]" : ""}`}>
                <th scope="row" className={rowTh}><Link href={`${prefixOf(c.cc)}/in-stock/iphone-duo`} className="hover:underline">{COUNTRIES[c.cc].name}</Link></th>
                <td className={`${td} ${c.now > 0 ? "font-semibold text-ok" : ""}`}>{live ? `${c.now} of ${c.stores}` : "–"}</td>
                <td className={td}>{c.stores}</td>
                <td className="py-2 pe-3 align-top"><Link href={prefixOf(c.cc) || "/"} className="hover:underline">{COUNTRIES[c.cc].short} front page</Link> · <Link href={`${prefixOf(c.cc)}/when-does-iphone-duo-restock`} className="hover:underline">restock hours</Link></td>
              </tr>
            ))}
          </Table>
          <Keys items={[
            { text: <>An alert on a store abroad behaves the same: <b className="text-ink">{SPEED.fastSec}-second</b> checks, a push about {SPEED.alertSec} s after confirmation</> },
            { text: <>Each country&apos;s pages use its own currency, time zones and Apple&apos;s local store names</> },
            { text: <>Austria and Belgium each have one Apple Store; their country page is that store&apos;s page</> },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- alerts */}
        <section id="alerts" className="scroll-mt-24">
          <h2>{h2Of("alerts")}</h2>
          <p><b>{PRICE_SENTENCE}</b></p>
          <StatGrid cols={3} className="my-4">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={`${PLANS.plus.name} · ${PLANS.plus.limit} alerts`} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={`${PLANS.pro.name} · ${PLANS.pro.limit} alerts`} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={`${PLANS.max.name} · ${PLANS.max.limit} alerts`} />
          </StatGrid>
          <Keys items={[
            { text: <>From the push: &quot;I&apos;ll pick it up&quot; at that store on apple.com, then pay: <Link href="/iphone-duo-restock-checkout-guide">the 20-second checkout</Link></>, step: true },
            { text: <>An alert is <b className="text-ink">a single Apple Store paired with a single exact configuration</b> (model, storage, color); two colors at one store take two alerts</> },
            { text: <>One push per restock with store and configuration; none for sell-outs</> },
            { text: <>Pushes reach iPhone through the <Link href="/phone-alerts">Home Screen app</Link>; no App Store download</> },
          ]} />
          <ChipLinks items={[
            { href: "/iphone-duo-restock-alerts", label: "What an alert covers" },
            { href: "/pricing", label: "Plans" },
            { href: "/phone-alerts", label: "Home Screen app setup" },
          ]} />
          <p><Link href={alert} className="btn btn-primary">Start an iPhone Duo alert</Link></p>
          <Figure id="phone-notification" />
          <p className="text-sm text-ink-3">{QUOTE}</p>
        </section>
      </div>

      <RelatedBlock title="More from the wire">
        <LinkRow title="The same log answers these too" links={[
          { href: "/is-iphone-duo-back-in-stock", label: "Duo back in stock right now?" },
          { href: "/when-does-iphone-duo-restock", label: "When does the iPhone Duo restock?" },
          { href: "/how-fast-does-iphone-duo-sell-out", label: "How many seconds does a restock last?" },
          { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
          { href: "/iphone-duo-in-stock-near-me", label: "Closest store with a Duo" },
          { href: "/iphone-duo-restock-alerts", label: "iPhone Duo restock alerts" },
          { href: "/iphone-duo-restock-checkout-guide", label: "The 20-second checkout" },
          { href: "/apple-store-pickup-explained", label: "Pickup status explained" },
        ]} />
        <LinkRow title="Live" links={[
          { href: "/in-stock/iphone-duo", label: "Every store, live" },
          { href: "/restock-log", label: "Restock log" },
          { href: "/live-map", label: "Live map" },
          { href: "/apple-stores", label: "Stores by state" },
        ]} />
        <LinkRow title="Asked another way" links={[
          { href: "/where-to-buy-iphone-duo-today", label: "Where can I buy an iPhone Duo today?" },
          { href: "/how-to-buy-an-iphone-duo-in-store", label: "Buying one in store while sold out" },
        ]} />
      </RelatedBlock>

      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Checker questions" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores (and ${intlStores} stores in ${INTL_CODES.length} other countries since ${longDate(TRACKING_SINCE_INTL)})`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
