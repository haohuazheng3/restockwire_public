/**
 * /how-fast-does-iphone-duo-sell-out: "How fast does the iPhone Duo sell out?" answered in seconds. Every H2 is a question
 * with one quotable answer sentence under it; the rest is tiles, tables, keyword lines and swap cards, with the
 * measurement notes folded. Every figure is RestockWire's own, bounded by two checks.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { SellOutTimes } from "@/components/restocks/SellOutTimes";
import { Measured, Points, Stat, StatGrid, Swap, type Point } from "@/components/ui/Viz";
import { getFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { STORES, catalogFor, statePath, storeByNumber, storeTimeZone, type CatalogItem } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, type CountryCode } from "@/lib/apple/countries";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAY_MIN_SPAN, localHourDay, siteFacts } from "@/lib/content/siteFacts";
import { duoRestockTimes } from "@/lib/content/restockTimes";
import { ROUND_SEC, medianBand, sellouts, summarize, type SelloutRow, type SelloutSummary } from "@/lib/stock/sellouts";

export const dynamic = "force-dynamic";

const TITLE = "How Fast Does the iPhone Duo Sell Out? Timed Restocks";
const DESCRIPTION = "Seconds an iPhone Duo restock stays listed for Apple Store pickup: the median, the share gone inside 30 s and 2 min, by configuration, state and country.";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const WIKI_MEDIAN = "https://en.wikipedia.org/wiki/Median";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: "/how-fast-does-iphone-duo-sell-out" },
  openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description: DESCRIPTION, url: "/how-fast-does-iphone-duo-sell-out" },
};

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** Table cells: to the second. */
const secs = (s: number | null) => (s == null ? "–" : s < 120 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
/** Tiles: a listing that stays hours reads as hours, short enough for a big number. */
const life = (s: number | null) => (s == null ? "–" : s < 120 ? `${s} s` : s < 3600 ? `${Math.round(s / 60)} min` : `${(s / 3600).toFixed(1)} h`);
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (ymd: string) => LONG.format(new Date(`${ymd}T12:00:00Z`));
const cfgName = (i: CatalogItem) => `${i.storage} ${i.color}`;
/** A row is "solid" from this many timed sell-outs; fewer is an anecdote and the table says so. */
const SOLID = 10;
const ABROAD: CountryCode[] = ["ca", "uk", "au", "jp", "de", "fr"];

/** Pure: the sold-out rows grouped by a key, each group summarised, most rows first. Restocks still listed are left out. */
function grouped<K extends string>(rows: SelloutRow[], days: number, keyOf: (r: SelloutRow) => K | undefined): { key: K; s: SelloutSummary }[] {
  const by = new Map<K, number[]>();
  for (const r of rows) {
    if (r.highSec == null) continue;
    const k = keyOf(r);
    if (!k) continue;
    by.set(k, [...(by.get(k) ?? []), r.highSec]);
  }
  return [...by.entries()].map(([key, v]) => ({ key, s: summarize(v, days) })).sort((a, b) => b.s.n - a.s.n);
}

/** Pure: weekday against weekend sell-outs (each store's own local day) and the span of days the rows cover. */
function weekendSplit(rows: SelloutRow[], days: number): { weekday: SelloutSummary; weekend: SelloutSummary; spanDays: number } {
  const wk: number[] = [], we: number[] = [], dates = new Set<string>();
  for (const r of rows) {
    if (r.highSec == null) continue;
    const store = storeByNumber(r.storeNumber);
    const { weekday, date } = localHourDay(new Date(r.at).toISOString(), store ? storeTimeZone(store) : "America/New_York");
    dates.add(date);
    (weekday === 0 || weekday === 6 ? we : wk).push(r.highSec);
  }
  const sorted = [...dates].sort();
  const spanDays = sorted.length ? Math.round((Date.parse(sorted[sorted.length - 1]) - Date.parse(sorted[0])) / 86400_000) + 1 : 0;
  return { weekday: summarize(wk, days), weekend: summarize(we, days), spanDays };
}

function LifeTable({ caption, head, rows }: { caption: string; head: string; rows: { label: ReactNode; s: SelloutSummary }[] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <caption className="mb-2 text-start text-xs text-ink-3">{caption}</caption>
        <thead>
          <tr className="border-b border-line-2 text-start text-ink">
            <th scope="col" className="py-2 pe-3 font-semibold">{head}</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Timed</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Median</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Gone ≤ 30 s</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Gone ≤ 1 min</th>
            <th scope="col" className="py-2 pe-3 font-semibold">Quickest</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line">
              <th scope="row" className="py-2 pe-3 text-start font-medium text-ink">{r.label}</th>
              <td className="py-2 pe-3 tabular-nums">{r.s.n}{r.s.n > 0 && r.s.n < SOLID ? <span className="text-ink-3"> · sparse</span> : null}</td>
              <td className="py-2 pe-3 tabular-nums">{secs(r.s.medianSec)}</td>
              <td className="py-2 pe-3 tabular-nums">{r.s.n ? pct(r.s.within30) : "–"}</td>
              <td className="py-2 pe-3 tabular-nums">{r.s.n ? pct(r.s.within60) : "–"}</td>
              <td className="py-2 pe-3 tabular-nums">{secs(r.s.fastestSec)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Keyword lines inside the prose pane (the pane's list indent is turned off). */
function Keys({ items }: { items: Point[] }) {
  return <Points items={items} className="my-3 ml-0!" />;
}

/** A row of page links as chips. */
function ChipLinks({ items }: { items: { href: string; label: string }[] }) {
  return <div className="my-3 flex flex-wrap gap-1.5">{items.map((l) => <Link key={l.href} href={l.href} className="chip chip-sm no-underline!">{l.label}</Link>)}</div>;
}

/** "Reads → means": the legend for every figure on the page. */
function KeyTable({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[20rem] text-sm">
        <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 pe-3 font-semibold">You read</th><th className="pb-2 font-semibold">It means</th></tr></thead>
        <tbody>
          {rows.map(([a, b], i) => (
            <tr key={i} className="border-t border-line align-top">
              <td className="py-2 pe-3 font-semibold tabular-nums text-ink">{a}</td>
              <td className="py-2 text-ink-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SellOutTimesPage() {
  const [us, all, rt, f, facts, abroad] = await Promise.all([
    sellouts({ country: "us", model: "duo", limit: 1000 }),
    sellouts({ country: "us" }),
    duoRestockTimes("us"),
    siteFacts(),
    getFacts(),
    Promise.all(ABROAD.map((cc) => sellouts({ country: cc, model: "duo" }))),
  ]);
  const s = us.summary;
  const days = s.days;
  const have = s.n > 0 && s.medianSec != null;
  // "since October 29, 2026" while the window still reaches back to the first tracked day; "over the last 30 days" after that.
  const sinceLabel = Date.parse(facts.at) - days * 86400_000 <= Date.parse(`${TRACKING_SINCE_US}T00:00:00Z`) ? `since ${longDate(TRACKING_SINCE_US)}` : `over the last ${days} days`;
  const band = have ? medianBand(s.medianSec!) : null;

  const items = catalogFor("duo");
  const byPart = new Map(grouped(us.recent, days, (r) => r.partNumber).map((g) => [g.key, g.s]));
  const configRows = items.map((i) => ({ item: i, s: byPart.get(i.partNumber) ?? summarize([], days) }));
  const solidConfigs = configRows.filter((r) => r.s.n >= SOLID && r.s.medianSec != null).sort((a, b) => a.s.medianSec! - b.s.medianSec!);
  const fastCfg = solidConfigs[0], slowCfg = solidConfigs[solidConfigs.length - 1];

  const regions = grouped(us.recent, days, (r) => storeByNumber(r.storeNumber)?.state).slice(0, 8);
  const solidRegions = regions.filter((r) => r.s.n >= SOLID && r.s.medianSec != null).sort((a, b) => a.s.medianSec! - b.s.medianSec!);
  const fastSt = solidRegions[0], slowSt = solidRegions[solidRegions.length - 1];

  const wk = weekendSplit(us.recent, days);
  const weekendKnown = wk.spanDays >= WEEKDAY_MIN_SPAN && wk.weekday.n >= SOLID && wk.weekend.n >= SOLID && wk.weekday.medianSec != null && wk.weekend.medianSec != null;

  const pro = all.byModel["18-pro"], pm = all.byModel["18-pro-max"];
  const ds = f.duoSellout;
  const sel = rt.sellout;
  const countries = ABROAD.map((cc, i) => ({ cc, s: abroad[i].summary })).sort((a, b) => b.s.n - a.s.n);
  const timedAbroad = countries.filter((c) => c.s.n > 0 && c.s.medianSec != null);

  const sections = [
    { id: "stay", nav: "Seconds listed", h2: "How many seconds does an iPhone Duo listing last?" },
    { id: "configurations", nav: "Storage and color", h2: "Which iPhone Duo configuration sells out fastest?" },
    { id: "states", nav: "State by state", h2: "Do some states sell out faster than others?" },
    { id: "countries", nav: "Abroad", h2: "How long does a Duo restock last outside the US?" },
    { id: "trackers", nav: "Slow checks", h2: "How much does a tracker on a five-minute check miss?" },
    { id: "method", nav: "How we time it", h2: "How does RestockWire time a sell-out?" },
    { id: "unavailable", nav: "Always unavailable?", h2: "Why is every store \"currently unavailable\" when you look?" },
  ];

  const faq: Faq[] = [
    { q: "Is a minute enough time to reserve an iPhone Duo?", a: have
      ? `Only with checkout already staged: half of the ${n(s.n)} restocks timed ${sinceLabel} were gone within ${s.medianSec} seconds, ${pct(s.within30)} within 30, the quickest in ${s.fastestSec}. Have the buy page open with pickup chosen before the push, not after it.`
      : "Only with checkout already staged. No sold-out restock sits in the current window to time, but every earlier iPhone Duo restock we logged lasted seconds between two checks, and this answer refills with the next one." },
    { q: "Does storage or color change how fast a Duo sells out?", a: fastCfg
      ? `By seconds, not minutes: ${cfgName(fastCfg.item)} has the shortest median at ${fastCfg.s.medianSec} seconds over ${fastCfg.s.n} sold-out restocks${slowCfg && slowCfg !== fastCfg ? `, ${cfgName(slowCfg.item)} the longest among rows with at least ${SOLID}, at ${slowCfg.s.medianSec}` : ""}. Every configuration is gone in about a minute, so buy the one you want.`
      : `Not measurably yet: no configuration has ${SOLID} timed sell-outs in the window, and RestockWire does not rank a handful. The table marks sparse rows and this answer fills in on its own.` },
    { q: "Do weekend restocks of the iPhone Duo last longer?", a: weekendKnown
      ? `Barely: a median of ${wk.weekend.medianSec} seconds on Saturdays and Sundays (${wk.weekend.n} timed) against ${wk.weekday.medianSec} on weekdays (${wk.weekday.n}), in each store's own local day over ${wk.spanDays} days.`
      : `Unknown so far: a weekday comparison needs timed sell-outs spanning ${WEEKDAY_MIN_SPAN} days, and ours span ${wk.spanDays}. The measured medians replace this sentence once the span is reached.` },
    { q: "Why does refreshing apple.com never catch a listing?", a: band
      ? `Because a listing lives about ${band} and the rest of the day reads "currently unavailable"; two reloads a few minutes apart miss almost all of them. An alert on your stores arrives about ${SPEED.alertSec} seconds after a restock is confirmed ([what one alert covers](/iphone-duo-restock-alerts)).`
      : `Because a listing lives seconds and the rest of the day reads "currently unavailable"; two reloads a few minutes apart miss almost all of them. An alert on your stores arrives about ${SPEED.alertSec} seconds after a restock is confirmed ([what one alert covers](/iphone-duo-restock-alerts)).` },
    { q: "How does RestockWire know a listing is gone?", a: `A configuration counts as listed when two checks about a second apart both see it for pickup, and as gone when the next round no longer does; the seconds between the two checks are the figure. All ${STORES.length} US Apple Stores are read every ${SPEED.checkSec} seconds and stores with alerts every ${SPEED.fastSec}, since ${longDate(TRACKING_SINCE_US)}; RestockWire is independent of Apple and counts no other tracker's reports.` },
  ];
  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (in-store pickup availability and holds)", url: APPLE_PICKUP },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide (October 23, 2026)", url: APPLE_NEWSROOM },
    { label: "Wikipedia: Median (the middle value)", url: WIKI_MEDIAN },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/how-fast-does-iphone-duo-sell-out`, url: `${site}/how-fast-does-iphone-duo-sell-out`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: facts.at },
      {
        "@type": "Dataset", "@id": `${site}/how-fast-does-iphone-duo-sell-out#dataset`, name: "Seconds each iPhone Duo restock stayed listed at US Apple Stores",
        description: `For every confirmed iPhone Duo in-store pickup restock at a US Apple Store, the seconds between the RestockWire check that saw it listed and the check that saw it gone (checks ${SPEED.fastSec}–${SPEED.checkSec} seconds apart), summarised as the median and the shares gone within 30 seconds, 1 minute, 2 minutes and 20 minutes, by configuration, state and country.`,
        url: `${site}/how-fast-does-iphone-duo-sell-out`, creator: { "@id": `${site}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "US Apple Stores; Canada, the UK, Australia, Japan, Germany and France as a comparison",
        variableMeasured: ["Apple Store", "iPhone Duo storage and color", "time of the restock", "time of the sell-out", "seconds listed (lower and upper bound)"],
        measurementTechnique: `Two agreeing RestockWire checks about a second apart open a listing, the first check that no longer sees it closes it; every US Apple Store is read every ${SPEED.checkSec} seconds and stores with alerts every ${SPEED.fastSec}; first sightings are excluded`,
        ...(have ? { size: `${s.n} sold-out restocks` } : {}),
      },
    ],
  };

  /** The longer view the module above does not show (2 and 20 minutes), then the other iPhones for contrast. */
  const longerTiles: { value: ReactNode; unit?: string; label: string; tone: "warn" | "plain" | "muted" }[] = have
    ? [
      sel ? { value: pct(sel.within2min), label: `sold out inside 2 minutes (every timed Duo restock since ${longDate(TRACKING_SINCE_US)}, ${n(sel.n)})`, tone: "warn" } : { value: pct(s.within120), label: "sold out inside 2 minutes", tone: "warn" },
      ...(sel ? [{ value: pct(sel.within20min), label: "sold out inside 20 minutes", tone: "plain" as const }] : []),
      ...(pro?.medianSec != null ? [{ value: life(pro.medianSec), label: "iPhone 18 Pro, same window: median time listed", tone: "muted" as const }] : []),
      ...(pm?.medianSec != null ? [{ value: life(pm.medianSec), label: "iPhone 18 Pro Max, same window: median time listed", tone: "muted" as const }] : []),
    ]
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <JsonLd data={ld} />
      <h1 className="display text-3xl sm:text-5xl">How fast does the iPhone Duo sell out after a restock?</h1>
      <p className="mt-4 text-lg text-ink-2">
        {have
          ? <>Half of them inside <b className="text-ink">{s.medianSec} seconds</b>: that is the median over {n(s.n)} US Apple Store restocks that sold out {sinceLabel}, so a typical listing lives <b className="text-ink">about {band}</b>.</>
          : <>No timed sell-out sits inside the last {days} days of the log, so there is no figure to quote at this moment; the tiles below refill with the next restock that sells out.</>}
      </p>
      <StatGrid cols={3} className="mt-6">
        <Stat value={have ? s.medianSec : "–"} unit={have ? "s" : undefined} label="median: half of all listings were gone within" tone="accent" />
        <Stat value={have ? pct(s.within30) : "–"} label="sold out inside 30 seconds" tone="warn" />
        <Stat value={n(s.n)} label={`sold-out restocks timed ${sinceLabel}`} />
      </StatGrid>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/#notify" className="btn btn-primary">Alert me before it is gone</Link>
        <a href="#stay" className="btn btn-ghost">Restock by restock, in seconds</a>
      </div>
      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-sm">
        {sections.map((x) => <a key={x.id} href={`#${x.id}`} className="chip px-3 py-1.5 text-xs">{x.nav}</a>)}
      </nav>

      <div className="pane prose-site mt-8 p-6 sm:p-8">
        {/* ---------------------------------------------------------------- how long */}
        <section id="stay" className="scroll-mt-24">
          <h2>{sections[0].h2}</h2>
          <p><b>{have
            ? `About ${band}: of the ${n(s.n)} iPhone Duo restocks that sold out ${sinceLabel}, half were gone within ${s.medianSec} seconds, ${pct(s.within60)} inside a minute, and the quickest in ${s.fastestSec} seconds.`
            : `No sold-out restock falls inside the last ${days} days to time; every earlier iPhone Duo restock in the log lasted seconds between two checks, and this sentence refills with the next one.`}</b></p>
          <Keys items={[
            { text: <><b className="text-ink">still listed</b> = not sold out yet; the figure keeps counting</> },
            { text: <>A range such as <b className="text-ink">45–60 s</b> = gone somewhere between two checks; a single figure = both checks agreed</> },
            { text: <>Each line is <b className="text-ink">one restock at one store</b>, in that store&apos;s local time</> },
            { text: <>Store by store, the same list sits on <Link href="/apple-stores">every store page</Link></>, step: true },
          ]} />
          <div className="my-5"><SellOutTimes data={us} label="at US Apple Stores" showStore limit={12} /></div>
          {longerTiles.length > 0 && (
            <StatGrid cols={longerTiles.length >= 4 ? 4 : longerTiles.length === 3 ? 3 : 2} className="my-4">
              {longerTiles.map((t) => <Stat key={t.label} value={t.value} unit={t.unit} label={t.label} tone={t.tone} />)}
            </StatGrid>
          )}
          <Measured title="Two minutes, twenty minutes, and the Pro models">
            {sel ? <>The 2-minute and 20-minute shares cover every timed Duo sell-out since {longDate(TRACKING_SINCE_US)} ({n(sel.n)}); every other figure covers the last {days} days. </> : null}
            Stores with alerts are read every {SPEED.fastSec} seconds and every other store every {ROUND_SEC}, so no range on this page is wider than that. The iPhone 18 Pro figures are the same window, shown for contrast: the Duo is the one iPhone where seconds decide.
          </Measured>
          <Figure id="night-line" />
        </section>

        {/* ---------------------------------------------------------------- by configuration */}
        <section id="configurations" className="scroll-mt-24">
          <h2>{sections[1].h2}</h2>
          <p><b>{solidConfigs.length >= 2 && fastCfg && slowCfg
            ? `${cfgName(fastCfg.item)}, by a few seconds: among configurations with at least ${SOLID} timed sell-outs its median is ${fastCfg.s.medianSec} seconds, and ${cfgName(slowCfg.item)} is the slowest at ${slowCfg.s.medianSec}; nothing worth planning around.`
            : solidConfigs.length === 1 && fastCfg
              ? `Only ${cfgName(fastCfg.item)} has ${SOLID} or more timed sell-outs so far (median ${fastCfg.s.medianSec} seconds over ${fastCfg.s.n}); the other rows hold a handful of restocks each, so there is no ranking yet.`
              : `No ranking yet: no configuration has reached ${SOLID} timed sell-outs in the window, so the rows below are single stories rather than a pattern.`}</b></p>
          <LifeTable head="Configuration" caption={`Seconds each iPhone Duo configuration stayed listed before it sold out at US Apple Stores, last ${days} days; "sparse" marks fewer than ${SOLID} sell-outs`} rows={configRows.map((r) => ({ label: cfgName(r.item), s: r.s }))} />
          <Keys items={[
            { text: <>Stores with alerts are timed to <b className="text-ink">{SPEED.fastSec} s</b>, the others to <b className="text-ink">{ROUND_SEC} s</b>: that is our resolution, not demand</> },
            { text: <>Fewer than <b className="text-ink">{SOLID}</b> sell-outs in a row: marked sparse, left unranked</> },
          ]} />
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="Guess which configuration will come back" yes={<Link href="/iphone-duo-most-restocked-stores">Which iPhone Duo restocks most</Link>} why="That is a different question, answered there by configuration and by store." />
            <Swap no="Chase the color that seems to sell slowest" yes="Set the alert on the storage and color you want" why="The rows differ by seconds; hearing about the restock within seconds is what gets you the phone." />
          </ol>
        </section>

        {/* ---------------------------------------------------------------- by state */}
        <section id="states" className="scroll-mt-24">
          <h2>{sections[2].h2}</h2>
          <p><b>{regions[0]
            ? `${regions[0].key} has the most timed sell-outs (${regions[0].s.n}, median ${regions[0].s.medianSec} seconds against ${s.medianSec} nationally)${solidRegions.length >= 2 && fastSt && slowSt && fastSt !== slowSt ? `; of the states with at least ${SOLID}, ${fastSt.key} is quickest at a median of ${fastSt.s.medianSec} seconds and ${slowSt.key} slowest at ${slowSt.s.medianSec}.` : "; no second state has enough timed sell-outs yet for a fair comparison."}`
            : `Nothing to compare yet: no state has a timed iPhone Duo sell-out inside the last ${days} days.`}</b></p>
          {regions.length > 0 && (
            <LifeTable head="State" caption={`The ${regions.length} states with the most timed iPhone Duo sell-outs over the last ${days} days`} rows={regions.map((r) => ({ label: <Link href={statePath(r.key)} className="underline-offset-2 hover:underline">{r.key}</Link>, s: r.s }))} />
          )}
          <Keys items={[
            { text: <>Grouped by <b className="text-ink">state</b> on purpose: a city&apos;s three sell-outs are not a speed</> },
            { text: <>The big states lead because they have <b className="text-ink">more stores</b>, not quicker shoppers</> },
            { text: <>Timed to <b className="text-ink">{SPEED.fastSec} s</b> at alert stores and <b className="text-ink">{ROUND_SEC} s</b> elsewhere: up to {ROUND_SEC - SPEED.fastSec} s of extra width</> },
            { text: <>Each <Link href="/apple-stores">state page</Link> carries this table; the {STORES.length} store pages list every restock</>, step: true },
          ]} />
        </section>

        {/* ---------------------------------------------------------------- other countries */}
        <section id="countries" className="scroll-mt-24">
          <h2>{sections[3].h2}</h2>
          <p><b>{timedAbroad[0]
            ? `Early figures only, since tracking abroad began ${longDate(TRACKING_SINCE_INTL)}: ${COUNTRIES[timedAbroad[0].cc].name} has the most timed iPhone Duo sell-outs so far (${timedAbroad[0].s.n}, median ${timedAbroad[0].s.medianSec} seconds)${have ? `, against ${s.medianSec} seconds in the US` : ""}.`
            : `No figure yet: no sold-out iPhone Duo restock has been timed outside the US since tracking of the other ${INTL_CODES.length} countries began on ${longDate(TRACKING_SINCE_INTL)}.`}</b></p>
          <LifeTable head="Country" caption={`iPhone Duo sell-out times by country: the US since ${longDate(TRACKING_SINCE_US)}, the others since ${longDate(TRACKING_SINCE_INTL)}`} rows={[
            { label: <Link href="/" className="underline-offset-2 hover:underline">United States</Link>, s },
            ...countries.map((c) => ({ label: <Link href={`/${c.cc}`} className="underline-offset-2 hover:underline">{COUNTRIES[c.cc].name}</Link>, s: c.s })),
          ]} />
          <Keys items={[
            { text: <>Every country page carries the same table for <b className="text-ink">every store</b>, filling in on its own</>, step: true },
            { text: <>Fewer than <b className="text-ink">{SOLID}</b> sell-outs: a first reading, not a result</> },
          ]} />
          <ChipLinks items={[{ href: "/ca", label: "Canada" }, { href: "/uk", label: "United Kingdom" }, { href: "/au", label: "Australia" }, { href: "/jp", label: "Japan" }, { href: "/de", label: "Germany" }, { href: "/fr", label: "France" }]} />
        </section>

        {/* ---------------------------------------------------------------- slow trackers */}
        <section id="trackers" className="scroll-mt-24">
          <h2>{sections[4].h2}</h2>
          <p><b>{ds
            ? `Most of the restocks: over the last 7 days (${n(ds.n)} timed iPhone Duo sell-outs) a check every 5 minutes would have seen about ${pct(ds.caught.m5)} of them, a check every 15 minutes about ${pct(ds.caught.m15)}, and a check every minute only about ${pct(ds.caught.m1)}.`
            : "Most of the restocks: a listing that disappears before the next check comes round is never seen at all; the catch rates below are computed from the last 7 days once 20 sell-outs have been timed."}</b></p>
          {ds && (
            <StatGrid cols={4} className="my-4">
              <Stat value={pct(ds.caught.m1)} label="of Duo restocks seen by a check once a minute" tone="warn" />
              <Stat value={pct(ds.caught.m5)} label="seen by a check once in 5 minutes" tone="warn" />
              <Stat value={pct(ds.caught.m15)} label="seen by a check once in 15 minutes" tone="warn" />
              <Stat value={`~${SPEED.alertSec}`} unit="s" label="RestockWire: from the confirmed restock to the push on your phone" tone="accent" />
            </StatGrid>
          )}
          <ol className="my-4 grid gap-3 sm:grid-cols-2">
            <Swap no="Reloading apple.com yourself" yes="One alert on two or three stores" why={`Your stores are on the ${SPEED.fastSec}-second wire and every other Apple Store on the ${SPEED.checkSec}-second one; a first "available" is asked again about a second later, and the push lands about ${SPEED.alertSec} seconds after that.`} />
            <Swap no="A tracker that looks every few minutes" yes={`A check every ${SPEED.fastSec} seconds`} why={band ? `A listing that lives about ${band} is usually gone between two slow looks.` : "A listing that lives seconds is usually gone between two slow looks."} />
          </ol>
          <Keys items={[
            { text: <>Published intervals elsewhere run from <b className="text-ink">{OTHER_TRACKERS}</b>; we quote published numbers only</> },
            { text: <><Link href="/iphone-duo-restock-alerts">What one alert covers</Link> · <Link href="/pricing">what it costs</Link></>, step: true },
          ]} />
          <Measured>
            A listing that lasts d seconds is seen by a check that comes round every T seconds with probability d over T, capped at one. Our durations are upper bounds, because the sell-out happened some time before the check that saw it gone, so these rates flatter the slow trackers and never RestockWire.
          </Measured>
          <Figure id="phone-hand-camera" />
        </section>

        {/* ---------------------------------------------------------------- method */}
        <section id="method" className="scroll-mt-24">
          <h2>{sections[5].h2}</h2>
          <p><b>By counting the seconds between the check that first saw a configuration listed for pickup and the check that first saw it gone, at every US Apple Store since {longDate(TRACKING_SINCE_US)}.</b></p>
          <KeyTable rows={[
            ["still listed", <>Not sold out yet; the figure counts upward</>],
            ["60 s", <>Both checks agreed to the second</>],
            ["45–60 s", <>Still there at the check 45 seconds after it appeared, gone at the check 60 seconds after</>],
            ["≈", <>The oldest rows: bounded by the {ROUND_SEC}-second round rather than two exact checks</>],
            ["sparse", <>Fewer than {SOLID} sell-outs; shown, not ranked</>],
            ["median", <>The <a href={WIKI_MEDIAN} target="_blank" rel="noopener">middle value</a>: half lasted less, half more; never the average</>],
          ]} />
          <Keys items={[
            { text: <>Stores with alerts every <b className="text-ink">{SPEED.fastSec} seconds</b>, every other store every <b className="text-ink">{ROUND_SEC}</b></> },
            { text: <>A restock = two agreeing checks about <b className="text-ink">1 s</b> apart</> },
            { text: <>A sell-out = confirmed on the <b className="text-ink">next round</b></> },
            { text: <>Launch days before <b className="text-ink">{longDate(TRACKING_SINCE_US)}</b> and first sightings: excluded</> },
            { text: <>A single odd response never reaches the log</>, no: true },
          ]} />
          <Measured title="What the floor hides">
            A listing shorter than one check can appear and vanish between two checks without ever being recorded. The share gone within 20–30 seconds is therefore a floor; the true figure is higher than any table on this page shows.
          </Measured>
        </section>

        {/* ---------------------------------------------------------------- why unavailable */}
        <section id="unavailable" className="scroll-mt-24">
          <h2>{sections[6].h2}</h2>
          <p><b>{band
            ? `Because you are looking between restocks: a listing that lives about ${band} is on the page for that long and "currently unavailable" for the rest of the day.`
            : "Because you are looking between restocks: a listing that lives seconds is on the page for those seconds and \"currently unavailable\" for the rest of the day."}</b></p>
          <Keys items={[
            { text: <>Sold faster than it arrives: <b className="text-ink">unavailable</b> is the Duo&apos;s normal state</>, no: true },
            { text: <><a href={APPLE_PICKUP} target="_blank" rel="noopener">Apple&apos;s pickup page</a> shows what a store can hand over <b className="text-ink">right now</b>, never when the next lot lands</> },
            { text: <>In Apple Stores since <a href={APPLE_NEWSROOM} target="_blank" rel="noopener"><b className="text-ink">October 23, 2026</b></a></> },
            { text: <>RestockWire&apos;s job: telling you within seconds, while the listing is still there to reserve</>, step: true },
          ]} />
          <ChipLinks items={[
            { href: "/when-does-iphone-duo-restock", label: "The hours Apple restocks the iPhone Duo" },
            { href: "/apple-store-pickup-explained", label: "What pickup availability means" },
            { href: "/how-to-buy-an-iphone-duo-in-store", label: "How to get an iPhone Duo" },
          ]} />
          <Figure id="apple-store-crowd-inside" />
          <p className="text-sm text-ink-3">Cite this page: quote these figures freely with a link back. RestockWire is independent and not affiliated with Apple; it reads the same pickup availability apple.com shows anyone, only far more often.</p>
        </section>
        <p><Link href="/#notify" className="btn btn-primary">Alert me before it is gone</Link></p>
      </div>
      <div className="mt-10"><RichFaq items={faq} facts={facts} title="More on sell-out speed" /></div>
      <div className="mt-8"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores (and the stores of ${INTL_CODES.length} other countries since ${longDate(TRACKING_SINCE_INTL)})`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
