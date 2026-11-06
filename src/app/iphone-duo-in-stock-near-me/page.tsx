/**
 * /iphone-duo-in-stock-near-me: "Which Apple Stores have the iPhone Duo near me right now?" The finder does the work; the
 * sections under it keep one quotable answer sentence per question and show the rest as tiles, steps, swap cards,
 * tables and keyword lines. Every number is live and RestockWire's own.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { NearMeFinder, type NearMeData } from "@/components/content/NearMeFinder";
import { Measured, Points, Stat, StatGrid, Swap, type Point } from "@/components/ui/Viz";
import { getFacts, tokenValue } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, cityLine, stateCodeOf, statePath, storeByNumber, storePath, type Store } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { SPEED } from "@/lib/plans";
import { TRACKING_SINCE_US, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { recentByConfig } from "@/lib/stock/recent";
import { stockByStore } from "@/lib/stock/queries";
import { alertHref, itemListJsonLd, listWords, plural } from "@/lib/seo/enrich";

export const dynamic = "force-dynamic";

const TITLE = "iPhone Duo in Stock Near Me: Nearest Apple Stores Now";
const DESCRIPTION = `The Apple Stores near you that list the iPhone Duo for pickup now, ranked by distance from you or your ZIP across all ${STORES.length} US stores, read every ${SPEED.checkSec} s.`;
const APPLE_STORES = "https://www.apple.com/retail/storelist/";
const CENSUS_GAZETTEER = "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: "/iphone-duo-in-stock-near-me" },
  openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description: DESCRIPTION, url: "/iphone-duo-in-stock-near-me" },
};

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));

type Now = { store: Store; parts: string[] };

/** Keyword lines inside the prose pane (the pane's list indent is turned off). */
function Keys({ items }: { items: Point[] }) {
  return <Points items={items} className="my-3 ml-0!" />;
}

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/** Numbered step cards: a title and a one-line hint each. */
function Steps({ steps }: { steps: { title: ReactNode; hint: ReactNode }[] }) {
  return (
    <ol className="my-4 grid gap-3 sm:grid-cols-3">
      {steps.map((s, i) => (
        <li key={i} className="pane-2 flex gap-3 p-4">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-[var(--accent-ink)]">{i + 1}</span>
          <span className="min-w-0 text-sm leading-snug"><span className="block font-semibold text-ink">{s.title}</span><span className="mt-1 block text-xs text-ink-3">{s.hint}</span></span>
        </li>
      ))}
    </ol>
  );
}

/** "Figure → how it is made": the legend for the finder's distances. */
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

export default async function NearMePage() {
  const [rows, recent, rt, facts] = await Promise.all([stockByStore("duo"), recentByConfig({ country: "us" }), duoRestockTimes("us"), getFacts()]);
  const items = catalogFor("duo");
  const cfg = (p: string) => { const i = PART_INDEX.get(p); return i ? `${i.storage} ${i.color}` : p; };
  // stockByStore answers [] both for "no rows" and for a read that failed; a status row exists for every tracked store, so [] means unreadable.
  const unknown = rows.length === 0;
  const now: Now[] = rows
    .filter((r) => r.availableParts.length > 0)
    .map((r) => ({ store: storeByNumber(r.storeNumber), parts: r.availableParts }))
    .filter((x): x is Now => Boolean(x.store))
    .sort((a, b) => a.store.state.localeCompare(b.store.state) || a.store.city.localeCompare(b.store.city) || a.store.name.localeCompare(b.store.name));
  const count = now.length;
  const byState = new Map<string, Now[]>();
  for (const x of now) byState.set(x.store.state, [...(byState.get(x.store.state) ?? []), x]);
  const states = [...byState.keys()].sort();
  const asOf = tokenValue("asOf", facts) ?? "";
  const win = busiestWindow(rt.byHour);
  const hasPattern = rt.n > 0 && !rt.unknown;
  const winLabel = `${hourLabel(win.from)} and ${hourLabel(win.to)}`;
  const top: { store: Store; restocks: number }[] = [];
  for (const t of rt.topStores.slice(0, 3)) { const store = storeByNumber(t.storeNumber); if (store) top.push({ store, restocks: t.restocks }); }
  const latest = recent.latest ? { ...recent.latest, store: storeByNumber(recent.latest.storeNumber) } : null;
  const sell = rt.sellout;
  /** "about 60–80 seconds" from the timed sell-outs, or a wording that claims no number while there are none. */
  const lasts = sell ? `about ${medianBand(sell.medianSec)}` : "seconds to a few minutes";
  const alert = alertHref({ model: "duo" });

  const data: NearMeData = {
    stock: Object.fromEntries(now.map((x) => [x.store.storeNumber, x.parts.map(cfg)])),
    total: items.length,
    alertPattern: alertHref({ model: "duo", store: "STORE_NUMBER" }),
    asOf,
  };

  const sections = [
    { id: "now", nav: "Listed now", h2: "Which Apple Stores list the iPhone Duo for pickup at this moment?" },
    { id: "find", nav: "Nearest store", h2: "How do you find the closest Apple Store with an iPhone Duo?" },
    { id: "best", nav: "Close vs busy", h2: "Should you watch the closest store or the busiest one?" },
    { id: "ai", nav: "Every state", h2: "Can an AI assistant answer \"near me\" from this page?" },
    { id: "distance", nav: "Miles and minutes", h2: "How are the distances on this page worked out?" },
  ];

  const faq: Faq[] = [
    { q: "I check my local Apple Store every day and it is always sold out. Why?", a: sell
      ? `Because a Duo listing lasts about ${medianBand(sell.medianSec)}: half of the ${n(sell.n)} restocks we timed were gone within ${sell.medianSec} seconds, so a manual refresh nearly always lands between restocks. [Sell-out times](/how-fast-does-iphone-duo-sell-out) has every figure; an alert does the refreshing for you.`
      : "Because a Duo listing lasts seconds to a few minutes, so a manual refresh nearly always lands between restocks. [Sell-out times](/how-fast-does-iphone-duo-sell-out) measures each one; an alert does the refreshing for you." },
    { q: "Does the finder need my location?", a: "No: a 5-digit ZIP works, ranked from its Census center, and the browser only downloads a small file of ZIP centers picked by the first three digits. If you do share your location, it stays on your device, rounded to about a kilometer, and nothing about you is sent or stored." },
    { q: "How fresh is the list of stores with stock?", a: `It was built at ${asOf} from checks of every US Apple Store every ${SPEED.checkSec} seconds (${SPEED.fastSec} seconds for stores with alerts), and a store shows stock only after two checks in a row agree. Reload for a newer list.` },
    { q: "Does this page cover Apple Stores in Canada, the UK or elsewhere?", a: `It ranks the ${STORES.length} US Apple Stores only. The ${INTL_CODES.length} other countries on the wire have their own pages with live iPhone Duo stock: [Canada](/ca), [the UK](/uk), [Australia](/au), [Japan](/jp), [Germany](/de), [France](/fr) and the rest from the country switch.` },
    { q: "Will RestockWire hold the phone for me?", a: `No: RestockWire tells you the moment a store lists your configuration, and you reserve it on apple.com, where Apple holds it at that store ([Apple: Delivery and Pickup](${APPLE_PICKUP})). RestockWire is independent of Apple.` },
  ];
  const sources: Source[] = [
    { label: "Apple: store list, every Apple Store location", url: APPLE_STORES },
    { label: "US Census Bureau: gazetteer files for ZIP Code Tabulation Areas", url: CENSUS_GAZETTEER },
    { label: "Apple: Delivery and Pickup, how in-store pickup works", url: APPLE_PICKUP },
  ];

  const site = "https://restockwire.com";
  const ld = [
    { "@context": "https://schema.org", "@type": "WebPage", "@id": `${site}/iphone-duo-in-stock-near-me`, url: `${site}/iphone-duo-in-stock-near-me`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: facts.at },
    ...(count > 0 ? [itemListJsonLd(`US Apple Stores listing the iPhone Duo for pickup at ${asOf}`, now.map((x) => x.store))] : []),
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <JsonLd data={ld} />
      <h1 className="display text-3xl sm:text-5xl">Is the iPhone Duo in stock near me?</h1>
      <p className="mt-4 text-lg text-ink-2">
        {unknown
          ? <>The live stock read did not load this time. The finder below still ranks all <b className="text-ink">{STORES.length}</b> US Apple Stores by distance from you or your ZIP.</>
          : count > 0
            ? <><b className="text-ink">{count} of {STORES.length}</b> US Apple Stores list an iPhone Duo for pickup as of {asOf}: {listWords(now.map((x) => `${appleName(x.store)} (${stateCodeOf(x.store)})`), 5)}.</>
            : <><b className="text-ink">None of the {STORES.length}</b> US Apple Stores lists an iPhone Duo for pickup as of {asOf}. Your nearest stores are the ones to put on the wire.</>}
      </p>
      <StatGrid cols={3} className="mt-6">
        <Stat value={unknown ? "–" : count} label={`US Apple Stores of ${STORES.length} with a Duo for pickup (${asOf})`} tone={count > 0 ? "ok" : "plain"} live={!unknown} />
        <Stat value={recent.restocks} label={`Duo restocks, last 24 hours, at ${plural(recent.stores, "store")}`} />
        {hasPattern
          ? <Stat value={pct(win.share)} label={`of ${n(rt.n)} restocks since ${longDate(rt.since)} landed ${winLabel} local time`} />
          : sell
            ? <Stat value={sell.medianSec} unit="s" label="median seconds before a listing sells out" tone="warn" />
            : <Stat value="–" label="usual restock hour: not enough data yet" tone="muted" />}
      </StatGrid>
      <div className="mt-6"><NearMeFinder data={data} /></div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href={alert} className="btn btn-primary">Put my nearest stores on the wire</Link>
        <Link href="/live-map" className="btn btn-ghost">Live map</Link>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {sections.map((x) => <a key={x.id} href={`#${x.id}`} className="chip px-3 py-1.5 text-xs">{x.nav}</a>)}
      </nav>

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- right now */}
        <section id="now" className="scroll-mt-24">
          <h2>{sections[0].h2}</h2>
          <p><b>{unknown
            ? "The live list did not load this time; the store pages the finder links to are not affected."
            : count > 0
              ? `${plural(count, "store")} across ${plural(states.length, "state")} at ${asOf}, grouped by state with the configurations each one shows.`
              : `None at ${asOf}; ${recent.restocks > 0 && latest ? `the last restock was a ${cfg(latest.partNumber)} at ${latest.store ? appleName(latest.store) : "an Apple Store"}, ${localStamp(latest.at, latest.store ?? STORES[0])} local time` : "and no store restocked it in the last 24 hours"}.`}</b></p>
          {count > 0 && states.map((st) => (
            <div key={st}>
              <h3><Link href={statePath(st)}>{st}</Link></h3>
              <ul>
                {byState.get(st)!.map((x) => (
                  <li key={x.store.storeNumber}>
                    <Link href={storePath(x.store)}>{appleName(x.store)}</Link>, {cityLine(x.store)}: {x.parts.map(cfg).join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {!unknown && count > 0 && (
            <Keys items={[
              { text: <>Listings last <b className="text-ink">{lasts}</b>; this one may be gone before you get there</>, no: true },
              { text: <>Hence the finder offers an <b className="text-ink">alert per store</b> instead of a list to keep refreshing</>, step: true },
              { text: <>Open any store page for all <b className="text-ink">{items.length} configurations</b> live and its usual restock hour</> },
            ]} />
          )}
          {!unknown && count === 0 && (
            <>
              <Keys items={[
                ...(hasPattern ? [{ text: <>Most restocks land <b className="text-ink">{winLabel}</b> local time: <b className="text-ink">{pct(win.share)}</b> of {n(rt.n)} since {longDate(rt.since)}</>, step: true }] : []),
                { text: <>Each listing lasts <b className="text-ink">{lasts}</b>, then shows unavailable for the rest of the day</>, no: true },
                { text: <>An empty list is how this page <b className="text-ink">usually looks</b>; nothing is broken</> },
              ]} />
              <ChipLinks items={[{ href: "/when-does-iphone-duo-restock", label: "iPhone Duo restock hours" }, { href: "/restock-log", label: "Live restock log" }]} />
            </>
          )}
        </section>

        {/* ---------------------------------------------------------------- find */}
        <section id="find" className="scroll-mt-24">
          <h2>{sections[1].h2}</h2>
          <p><b>The finder at the top does it: all {STORES.length} US Apple Stores, ranked in your browser by distance from you or your ZIP, with live iPhone Duo stock on the ten closest.</b></p>
          <Steps steps={[
            { title: "Share your location or enter a ZIP", hint: "Ranking happens in your browser. Your location stays on your device; a ZIP only picks a small file of ZIP centers by its first three digits." },
            { title: "Check each store's badge", hint: `"Duo in stock: 3 of ${items.length} configs" is what the store lists now; "none right now" is the normal, sold-out state.` },
            { title: "Put two or three reachable stores on the wire", hint: `They move to ${SPEED.fastSec}-second checks, and a confirmed restock reaches your phone about ${SPEED.alertSec} seconds later.` },
          ]} />
          <ChipLinks items={[
            { href: "/apple-stores", label: "Stores by state" },
            { href: "/live-map", label: `All ${STORES.length} stores on the live map` },
            { href: "/in-stock/iphone-duo", label: "Stores listing the Duo now" },
          ]} />
          <Figure id="navigation-app-street" />
        </section>

        {/* ---------------------------------------------------------------- nearest vs busiest */}
        <section id="best" className="scroll-mt-24">
          <h2>{sections[2].h2}</h2>
          <p><b>{hasPattern
            ? `The closest ones you can reach by ${hourLabel(win.from)} local time: ${pct(win.share)} of the ${n(rt.n)} iPhone Duo restocks since ${longDate(rt.since)} landed ${winLabel}, and you collect a pickup order in person.`
            : "The two or three you can actually reach on a weekday morning, not the single store with the most restocks."}</b></p>
          <Keys items={[
            { text: <><b className="text-ink">Restock count</b> only changes how often an alert comes</> },
            { text: <><b className="text-ink">Distance</b> decides whether you can act on it</> },
          ]} />
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="One store, one alert" yes="Your closest stores × the one configuration you want" why={`Those stores on the ${SPEED.fastSec}-second wire; the push about ${SPEED.alertSec} seconds after a confirmed restock.`} />
            <Swap no="The top-restock store, three hours out" yes="Two or three stores within easy reach" why="You pick up a pickup order at that store, in person, usually the same day." />
          </ol>
          {hasPattern && top.length > 0 && (
            <div className="my-4 overflow-x-auto">
              <table className="w-full min-w-[20rem] text-sm">
                <caption className="mb-2 text-start text-xs text-ink-3">Most iPhone Duo restocks since {longDate(rt.since)}: shown because people ask, not as a reason to drive there</caption>
                <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 pe-3 font-semibold">Store</th><th className="pb-2 font-semibold">Restocks</th></tr></thead>
                <tbody>
                  {top.map((t) => (
                    <tr key={t.store.storeNumber} className="border-t border-line">
                      <td className="py-2 pe-3 font-medium text-ink"><Link href={storePath(t.store)}>{appleName(t.store)}</Link>, {cityLine(t.store)}</td>
                      <td className="py-2 tabular-nums">{n(t.restocks)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ChipLinks items={[
            { href: "/iphone-duo-most-restocked-stores", label: "Most-restocked configurations" },
            { href: "/when-does-iphone-duo-restock", label: "Restock hour per store" },
            { href: "/iphone-duo-restock-alerts", label: "What an alert covers" },
            { href: "/phone-alerts", label: "Home Screen app" },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- any state */}
        <section id="ai" className="scroll-mt-24">
          <h2>{sections[3].h2}</h2>
          <p><b>Yes, plainly: the page covers all {STORES.length} US Apple Stores, the list above names each one listing the iPhone Duo now, and every state has a page of its own to start from.</b></p>
          {unknown
            ? <p>The live list did not load this time; each state page carries its own.</p>
            : count > 0
              ? (
                <>
                  <p className="text-sm text-ink-3">States with an Apple Store listing the iPhone Duo at {asOf}:</p>
                  <ChipLinks items={states.map((st) => ({ href: statePath(st), label: st }))} />
                </>
              )
              : <p>No state has a store listing the iPhone Duo at {asOf}; each state page shows when its stores usually restock.</p>}
          <Keys items={[
            { text: <>apple.com pickup stock read every <b className="text-ink">{SPEED.checkSec} seconds</b>; RestockWire is independent of Apple</> },
            { text: <>Each state has a page under <Link href="/apple-stores">/apple-stores</Link> with <b className="text-ink">live stock</b> and restock hours</> },
            { text: <>Cities with two or more stores get a page too</> },
            { text: <>Open your state: <Link href={statePath("California")}>California</Link>, <Link href={statePath("Texas")}>Texas</Link> or any other</>, step: true },
          ]} />
          <Figure id="phone-map" />
        </section>

        {/* ---------------------------------------------------------------- distance */}
        <section id="distance" className="scroll-mt-24">
          <h2>{sections[4].h2}</h2>
          <p><b>As estimated road miles and door-to-door drive time from you or your ZIP&apos;s center: neither a straight line nor a routed trip.</b></p>
          <KeyTable head={["Number", "How we get it"]} rows={[
            ["The stores", <>All <b className="text-ink">{STORES.length}</b> US Apple Stores and their coordinates, from <a href={APPLE_STORES} target="_blank" rel="noopener">Apple&apos;s store list</a></>],
            ["Your ZIP", <>The population-weighted center of its ZIP Code Tabulation Area, from the <a href={CENSUS_GAZETTEER} target="_blank" rel="noopener">US Census Bureau gazetteer files</a></>],
            ["Road miles", <>Straight-line distance × <b className="text-ink">1.2–1.35</b>, more for short trips, since roads wind</>],
            ["Drive time", <>Roughly <b className="text-ink">5 minutes</b> to set off and park, then <b className="text-ink">22 mph</b> in town rising to <b className="text-ink">60 mph</b> on longer highway trips; rush hour is not modeled</>],
          ]} />
          <Measured>
            Two estimated miles can take 10 minutes or 25, depending on the hour. Use the figure to choose which stores to watch; use the store page&apos;s address and map to get there.
          </Measured>
          <p className="text-sm text-ink-3">Cite this page: quote the store list or any figure with a link back. RestockWire is independent of Apple.</p>
          <Figure id="apple-store-entrance-busy" />
        </section>
        <p><Link href={alert} className="btn btn-primary">Put my nearest stores on the wire</Link></p>
      </div>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="Near-me questions" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
