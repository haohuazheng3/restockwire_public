/**
 * /iphone-duo-most-restocked-stores: the eight configurations ranked by confirmed restocks, shown as tiles, tables and
 * keyword lines. Each H2 is a question with one answer-first sentence; the numbers are live from the restock log.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFacts, type Facts } from "@/lib/content/facts";
import type { Block, Faq, Source } from "@/lib/content/types";
import { PART_INDEX, STORES, appleName, catalogFor, storeByNumber, storePath } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { PLANS, SPEED } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, localStamp } from "@/lib/content/siteFacts";
import { duoRestockTimes, type RestockTimes } from "@/lib/content/restockTimes";
import { fmtPrice, listWords, plural } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const TITLE = "Which iPhone Duo Restocks Most Often? Odds by Configuration";
const DESCRIPTION = "iPhone Duo restocks at every US Apple Store by storage and color: the configuration that returns most, the one that returns least, and who lists each now.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: "/iphone-duo-most-restocked-stores" },
  openGraph: { url: "/iphone-duo-most-restocked-stores", type: "article", siteName: "RestockWire", description: DESCRIPTION, title: TITLE },
};

const APPLE_DUO = "https://www.apple.com/shop/buy-iphone/iphone-duo";
const PICKUP = "https://www.apple.com/shop/shipping-pickup";
const WIKI_FOLDABLE = "https://en.wikipedia.org/wiki/Foldable_smartphone";
/** The other countries whose mix we compare, in the order the site lists them. */
const ABROAD: CountryCode[] = ["ca", "uk", "au", "jp"];

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const points = (x: number) => `${Math.round(x * 100)} points`;
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const longDate = (date: string) => LONG.format(new Date(`${date}T12:00:00Z`));
const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function storeLink(storeNumber: string): string {
  const s = storeByNumber(storeNumber);
  return s ? `[${appleName(s)}](${storePath(s)})` : storeNumber;
}
/** "[Apple Fifth Avenue](…), Nov 2, 9:31 AM local time" for a restock. */
function lastLine(at: string | null, storeNumber: string | null): string {
  if (!at || !storeNumber) return "none so far";
  const s = storeByNumber(storeNumber);
  return s ? `${storeLink(storeNumber)}, ${localStamp(at, s)} local time` : `${ET.format(new Date(at))} ET`;
}
/** A country's most-restocked configuration (storage, color), or null before its first confirmed restock. */
function topAbroad(t: RestockTimes): { name: string; storage: string; restocks: number } | null {
  const p = t.byPart.find((x) => x.restocks > 0);
  const i = p ? PART_INDEX.get(p.partNumber) : undefined;
  return p && i ? { name: `${i.storage} ${i.color}`, storage: i.storage, restocks: p.restocks } : null;
}

/** A question, its one-sentence answer, then the UI. */
function Section({ id, h2, lead, facts, children }: { id: string; h2: string; lead: string; facts: Facts; children: ReactNode }) {
  return (
    <section id={id} className="pane p-5 sm:p-7 scroll-mt-24">
      <h2 className="text-2xl sm:text-3xl display">{h2}</h2>
      <p className="mt-3 text-base text-ink-2 sm:text-lg"><Inline text={lead} facts={facts} /></p>
      {children}
    </section>
  );
}
/** Where to go next: a row of chip links. */
function LinkRow({ links, className = "mt-4" }: { links: { label: string; href: string }[]; className?: string }) {
  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {links.map((l) => /^https?:/.test(l.href) ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm">{l.label}</a> : <Link key={l.href} href={l.href} className="chip chip-sm">{l.label}</Link>)}
    </div>
  );
}

export default async function WhichDuoRestocksMost() {
  const [t, facts, ...abroad] = await Promise.all([duoRestockTimes("us"), getFacts(), ...ABROAD.map((cc) => duoRestockTimes(cc))]);
  const duo = facts.models.duo;
  const have = t.n > 0 && !t.unknown;
  const since = longDate(t.since);
  const intlSince = longDate(TRACKING_SINCE_INTL);
  const items = catalogFor("duo");
  const storages = [...new Set(items.map((i) => i.storage))];
  const colors = [...new Set(items.map((i) => i.color))];
  const nowOf = (name: string): number | null => (duo && !duo.unknown ? duo.byConfig[name] ?? 0 : null);
  const nowText = (v: number | null) => (v == null ? "—" : n(v));

  // One row per configuration, most restocks first (byPart is zero-filled for all eight).
  const rows = t.byPart.flatMap((p) => {
    const item = items.find((i) => i.partNumber === p.partNumber) ?? PART_INDEX.get(p.partNumber);
    if (!item) return [];
    const name = `${item.storage} ${item.color}`;
    return [{ ...p, item, name, price: item.price, share: t.n ? p.restocks / t.n : 0, now: nowOf(name) }];
  });
  const most = rows[0];
  const fewest = rows.length ? rows[rows.length - 1] : undefined;
  const storageRows = storages.map((storage) => {
    const rs = rows.filter((r) => r.item.storage === storage);
    const restocks = rs.reduce((a, r) => a + r.restocks, 0);
    return { storage, restocks, share: t.n ? restocks / t.n : 0, price: rs[0]?.price ?? items.find((i) => i.storage === storage)?.price ?? 0, now: rs.reduce<number | null>((a, r) => (a == null || r.now == null ? null : a + r.now), 0) };
  });
  const colorRows = colors.map((color) => ({ color, restocks: rows.filter((r) => r.item.color === color).reduce((a, r) => a + r.restocks, 0) })).map((r) => ({ ...r, share: t.n ? r.restocks / t.n : 0 }));
  const storageSorted = [...storageRows].sort((a, b) => b.restocks - a.restocks);
  const colorSorted = [...colorRows].sort((a, b) => b.restocks - a.restocks);
  const storageGap = storageSorted.length ? storageSorted[0].share - storageSorted[storageSorted.length - 1].share : 0;
  const colorGap = colorSorted.length >= 2 ? colorSorted[0].share - colorSorted[colorSorted.length - 1].share : 0;
  const storageWins = storageGap >= colorGap;
  const leadStorage = storageSorted[0];
  const biggest = storages[storages.length - 1];
  const big = storageRows.find((r) => r.storage === biggest);
  const bigRows = rows.filter((r) => r.item.storage === biggest);
  const bigLast = bigRows.filter((r) => r.lastAt).sort((a, b) => (b.lastAt! > a.lastAt! ? 1 : -1))[0];
  const abroadRows = ABROAD.map((cc, i) => ({ cc, name: COUNTRIES[cc].name, t: abroad[i], top: topAbroad(abroad[i]) }));
  const abroadWithData = abroadRows.filter((r) => r.top);
  const sameStorage = abroadWithData.filter((r) => leadStorage && r.top!.storage === leadStorage.storage);
  const todayLine = t.today ? `${plural(t.today.restocks, "restock")} at ${plural(t.today.stores, "store")}` : "nothing counted yet";
  const ratio = most && fewest && have && fewest.share > 0 ? Math.max(1, Math.round(most.share / fewest.share)) : null;
  const oneIn = big && big.share > 0 ? Math.max(1, Math.round(1 / big.share)) : null;

  const rankTable: Block = { t: "table", head: ["Configuration", "Price", `Confirmed restocks since ${since}`, "Share of all", "Most recent", "Listed now at"], rows: rows.map((r) => [r.name, fmtPrice(r.price), n(r.restocks), pct(r.share), lastLine(r.lastAt, r.lastStore), `{{duo.cfg:${r.name}}}`]), caption: `The eight iPhone Duo configurations ranked by confirmed restocks across the ${STORES.length} US Apple Stores`, source: `RestockWire restock log; prices as shown on [apple.com](${APPLE_DUO}), sales tax not included` };
  const storageTable: Block = { t: "table", head: ["Storage", "Price (both colors)", "Confirmed restocks", "Share", "Listed now at"], rows: storageRows.map((r) => [r.storage, fmtPrice(r.price), n(r.restocks), pct(r.share), nowText(r.now)]), caption: "Summed by storage size", source: "RestockWire restock log" };
  const colorTable: Block = { t: "table", head: ["Color", "Confirmed restocks", "Share", "Listed now at"], rows: colorRows.map((r) => [r.color, n(r.restocks), pct(r.share), `{{duo.color:${r.color}}}`]), caption: "Summed by color", source: "RestockWire restock log" };
  const abroadTable: Block = { t: "table", head: ["Country", "Configuration with most restocks", "Its restocks", "All Duo restocks", "Stores with one"], rows: abroadRows.map((r) => [`[${r.name}](/${r.cc}/when-does-iphone-duo-restock)`, r.top ? r.top.name : r.t.unknown ? "—" : "none confirmed so far", r.top ? n(r.top.restocks) : "—", n(r.t.n), `${n(r.t.stores)} of ${r.t.storesTotal}`]), caption: `Each country's own Apple Stores and part numbers, counted since ${intlSince}`, source: "RestockWire restock log" };

  const mostLead = have && most
    ? `**${most.name}** is first: **${n(most.restocks)}** confirmed restocks on the US wire from ${since}${rows[1] ? `, ahead of ${rows[1].name} on ${n(rows[1].restocks)}` : ""}.`
    : "Eight configurations, one ranking: every confirmed restock at every US Apple Store is counted here, and the order updates as they land.";
  const storageLead = have && storageSorted.length >= 2 && colorSorted.length >= 2
    ? `**${storageWins ? "Storage size" : "Color"}**, by the wider gap: ${storageSorted[0].storage} holds **${pct(storageSorted[0].share)}** of confirmed US restocks against ${pct(storageSorted[storageSorted.length - 1].share)} for ${storageSorted[storageSorted.length - 1].storage}, while ${colorSorted[0].color} holds **${pct(colorSorted[0].share)}** against ${pct(colorSorted[1].share)} for ${colorSorted[1].color}.`
    : "The one whose best and worst option sit furthest apart; both sums below are built from the same confirmed restocks and fill in together.";
  const bigLead = have && big
    ? `Rarely, but yes: **${n(big.restocks)}** confirmed ${biggest} restocks since ${since}, which is **${pct(big.share)}** of every iPhone Duo restock, and {{duo.storage:${biggest}}} US stores list one at this moment.`
    : `Now and then: the ${biggest} is the thinnest slice of the mix, and its live store count fills in here as restocks are confirmed.`;
  const watchLead = `Two or three you would actually keep, at two or three stores, starting with the storage that restocks most${leadStorage && have ? ` (**${leadStorage.storage}**, ${pct(leadStorage.share)} of restocks)` : ""}: one alert is one store × one exact configuration, and the odds stack.`;
  const abroadLead = abroadWithData.length
    ? `Thin data so far, but ${abroadWithData.map((r) => `**${r.name}** has ${r.top!.name} in front (${plural(r.top!.restocks, "restock")})`).join(", ")}, counted since ${intlSince}.`
    : `Not knowable yet: RestockWire began reading the other countries on ${intlSince}, and the table fills in with each one's first confirmed restocks.`;
  const countLead = `One restock = **two checks of apple.com, about a second apart**, both listing the configuration for pickup at that store; a store × configuration's first sighting is left out, and the count starts on ${longDate(TRACKING_SINCE_US)}.`;

  const nav = [
    { id: "most", label: "Ranked" },
    { id: "storage-or-color", label: "Size or color" },
    { id: "2tb", label: `${biggest} odds` },
    { id: "watch", label: "Alert strategy" },
    { id: "countries", label: "Abroad" },
    { id: "counting", label: "Method" },
  ];

  const c0 = colors[0], c1 = colors[1] ?? colors[0];
  const s0 = storages[0], s1 = storages[1] ?? storages[0];
  const priceGap = fmtPrice((items.find((i) => i.storage === s1)?.price ?? 0) - items[0].price);
  const faq: Faq[] = [
    { q: `Which iPhone Duo color is easier to find, ${c0} or ${c1}?`, a: have && colorSorted.length === 2
      ? `${colorSorted[0].color}, by a little: ${n(colorSorted[0].restocks)} confirmed US restocks (${pct(colorSorted[0].share)}) against ${n(colorSorted[1].restocks)} (${pct(colorSorted[1].share)}) for ${colorSorted[1].color} since ${since}, with {{duo.color:${colorSorted[0].color}}} stores listing a ${colorSorted[0].color} and {{duo.color:${colorSorted[1].color}}} a ${colorSorted[1].color} right now. A gap that small is not worth waiting on.`
      : `Neither by much so far; right now {{duo.color:${c0}}} stores list a ${c0} and {{duo.color:${c1}}} a ${c1}.` },
    { q: `Is the ${s1} restocked more often than the ${s0}?`, a: have && storageRows.length >= 2
      ? `${storageRows[1].restocks > storageRows[0].restocks ? "Yes" : storageRows[1].restocks < storageRows[0].restocks ? `No, the ${s0} leads` : "They are level"}: ${n(storageRows[1].restocks)} confirmed ${s1} restocks (${pct(storageRows[1].share)}) against ${n(storageRows[0].restocks)} for the ${s0} (${pct(storageRows[0].share)}) since ${since}. The ${s1} costs ${priceGap} more.`
      : `The storage table above carries the live answer; the ${s1} costs ${priceGap} more than the ${s0}.` },
    { q: "Does a high restock share mean Apple builds more of that configuration?", a: "No: Apple publishes nothing about allocation by configuration, and RestockWire counts only pickup listings as apple.com shows them, store by store. A share here describes restocks, never units built or shipped." },
    { q: "How many alerts does one configuration at three stores take?", a: `Three: each store × configuration pair is one alert, set on [the alert setup](/#notify), and every alert's store is checked every ${SPEED.fastSec} seconds. Plus holds ${PLANS.plus.limit} alerts for $${PLANS.plus.priceUsd} a month, Pro ${PLANS.pro.limit}, Max ${PLANS.max.limit}.` },
    { q: "Where are today's iPhone Duo restocks listed?", a: `In [the restock log](/restock-log), every confirmed restock and sell-out with its store, configuration and time; so far today: ${todayLine}. RestockWire is independent of Apple and reads the public pickup availability on apple.com.` },
  ];
  const sources: Source[] = [
    { label: "Apple: Buy iPhone Duo (every configuration and its price)", url: APPLE_DUO },
    { label: "Apple: Delivery and Pickup (how in-store pickup availability works)", url: PICKUP },
    { label: "Wikipedia: Foldable smartphone", url: WIKI_FOLDABLE },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/iphone-duo-most-restocked-stores`, url: `${site}/iphone-duo-most-restocked-stores`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: t.at },
      {
        "@type": "Dataset", "@id": `${site}/iphone-duo-most-restocked-stores#dataset`, name: "iPhone Duo restocks by storage and color at US Apple Stores",
        description: `Each iPhone Duo storage size and color's confirmed in-store pickup restocks across all ${STORES.length} Apple Stores in the US, tallied by RestockWire's own checks from ${longDate(TRACKING_SINCE_US)}.`,
        url: `${site}/iphone-duo-most-restocked-stores`, creator: { "@id": `${site}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores in the United States",
        variableMeasured: ["storage size and color of the iPhone Duo", "confirmed pickup restocks", "share of all iPhone Duo restocks", "most recent restock", "stores listing the configuration now"],
        ...(have ? { size: `${t.n} restocks over ${rows.length} configurations` } : {}),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow mb-4">iPhone Duo · restocks by storage and color</div>
          <h1 className="text-4xl sm:text-6xl display">Which iPhone Duo storage and color restocks the most?</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">
            {have && most && fewest
              ? <><b className="text-ink">{most.name}</b> leads: <b className="text-ink">{pct(most.share)}</b> of the {n(t.n)} iPhone Duo restocks RestockWire has confirmed in the US since {since} were that one ({fmtPrice(most.price)}); {fewest.name} trails at {pct(fewest.share)}.</>
              : <>RestockWire reads all eight configurations at all {STORES.length} US Apple Stores every {SPEED.checkSec} seconds; the ranking by storage and color, and the live store count for each, fills in here.</>}
          </p>
          <div className="mt-7 flex gap-3 flex-wrap">
            <Link href="/#notify" className="btn btn-primary btn-lg">Alert me on a configuration</Link>
            <Link href="/in-stock/iphone-duo" className="btn btn-ghost btn-lg">Duo stock, live</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={most ? n(most.restocks) : "—"} label={most ? <>{most.name} · top of the ranking since {since}</> : "configuration with the most restocks"} tone="accent" />
          <Stat value={fewest ? n(fewest.restocks) : "—"} label={fewest ? <>{fewest.name} · bottom of the ranking</> : "configuration with the fewest"} tone="muted" />
          <Stat value={most ? nowText(most.now) : "—"} label={most ? <>US stores (of {STORES.length}) listing the {most.name} now</> : "stores with it listed now"} live={!!most && most.now != null} />
          <Stat value={fewest ? nowText(fewest.now) : "—"} label={fewest ? <>listing the {fewest.name} now</> : "stores with it listed now"} tone="muted" />
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* ranking */}
        <Section id="most" h2="Which iPhone Duo configuration has the most confirmed restocks?" lead={mostLead} facts={facts}>
          <BlockView b={rankTable} facts={facts} />
          <Points items={[
            { text: t.sellout ? <>&quot;Listed now at&quot; is live and usually small: half of all Duo restocks had sold out within <b className="text-ink">{n(t.sellout.medianSec)} seconds</b></> : <>&quot;Listed now at&quot; is live and usually small: most listings are gone within minutes</>, no: true },
            { text: <>Each store answers for each configuration on its own: pickup availability is per store, per storage, per color</> },
            { text: <Inline text={`${storages.length} storage sizes × ${colors.length} colors (${listWords(colors)}) make **eight configurations** of Apple's first [foldable smartphone](${WIKI_FOLDABLE})`} facts={facts} /> },
          ]} />
          <Figure id="foldable-hands" />
        </Section>

        {/* storage vs color */}
        <Section id="storage-or-color" h2="Does storage size or color move the odds more?" lead={storageLead} facts={facts}>
          <StatGrid cols={2} className="mt-5">
            <Stat value={have ? points(storageGap) : "—"} label="spread between the most- and least-restocked storage size, in share of all restocks" tone={storageWins ? "accent" : "plain"} />
            <Stat value={have ? points(colorGap) : "—"} label="spread between the two colors" tone={storageWins ? "plain" : "accent"} />
          </StatGrid>
          <BlockView b={storageTable} facts={facts} />
          <BlockView b={colorTable} facts={facts} />
          <Points items={have ? [
            { text: storageWins ? <><b className="text-ink">Choose by storage</b>, then take either color: the size decides your odds</> : <><b className="text-ink">This week color decides</b>: take {colorSorted[0]?.color ?? "the leading color"} in the size you want</> },
            { text: <>Twice the restocks means <b className="text-ink">twice the pushes</b> for that configuration</>, step: true },
          ] : [
            { text: <>The wider spread marks the lever worth pulling</> },
            { text: <>Both spreads fill in as restocks are confirmed</>, step: true },
          ]} />
          <Figure id="two-phones-sky" />
        </Section>

        {/* the biggest size */}
        <Section id="2tb" h2={`Does the ${biggest} iPhone Duo ever come back in stock?`} lead={bigLead} facts={facts}>
          <StatGrid cols={4} className="mt-5">
            <Stat value={big ? n(big.restocks) : "—"} label={<>{biggest} restocks since {since}{big && have ? <> · {pct(big.share)} of every Duo restock</> : null}</>} tone="accent" />
            <Stat value={<Inline text={`{{duo.storage:${biggest}}}`} facts={facts} />} label={<>US stores (of {STORES.length}) with a {biggest} listed right now</>} live />
            {bigRows.length === 2
              ? <Stat value={<>{n(bigRows[0].restocks)}<span className="text-base text-ink-3"> / </span>{n(bigRows[1].restocks)}</>} label={<>{bigRows[0].item.color} / {bigRows[1].item.color}</>} tone="muted" />
              : <Stat value="—" label="by color" tone="muted" />}
            <Stat value={fmtPrice(items[items.length - 1].price)} label={<>both colors · {fmtPrice(items[items.length - 1].price - items[0].price)} above the {storages[0]}</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>Alert on the {biggest} <b className="text-ink">and the next size down</b></> },
            { text: <Inline text={`**Most recent ${biggest} restock:** ${bigLast ? `${bigLast.name} at ${lastLine(bigLast.lastAt, bigLast.lastStore)}` : "none confirmed so far"}`} facts={facts} /> },
            { text: oneIn ? <>One Duo restock in <b className="text-ink">{oneIn}</b> is a {biggest} (a {pct(big!.share)} share); at one store that can mean days between chances</> : <>The {biggest} is the thinnest slice of the mix; at one store that can mean days between chances</>, no: true },
          ]} />
          <LinkRow links={[{ label: `${biggest} stock, live`, href: "/in-stock/iphone-duo" }, { label: "Stores near you with one listed", href: "/iphone-duo-in-stock-near-me" }]} />
        </Section>

        {/* what to watch */}
        <Section id="watch" h2="Which configurations should your alerts cover?" lead={watchLead} facts={facts}>
          <StepStrip className="mt-5" steps={[
            { title: <>Start with {leadStorage && have ? leadStorage.storage : "the storage that restocks most"}</>, hint: "most of the pushes will carry this size" },
            { title: "Add the next size you would keep", hint: "a return is a reservation someone else lost; skip sizes you would send back" },
            { title: "Tick both colors", hint: "color shifts the odds less than storage, and a case hides most of it" },
            { title: "Pick two or three stores", hint: <Inline text={`3 stores × 3 configurations = ${plural(9, "alert")}, within Plus's ${PLANS.plus.limit} ([pricing](/pricing))`} facts={facts} /> },
          ]} />
          <StatGrid cols={3} className="mt-6">
            <Stat value={ratio ? `${ratio}×` : "—"} label={ratio && most && fewest ? <>pushes for {most.name} ({pct(most.share)}) for every one for {fewest.name} ({pct(fewest.share)})</> : "pushes for the top configuration against the bottom one"} tone="accent" />
            <Stat value={`${SPEED.fastSec}`} unit="s" label="between checks at the stores your alerts name" />
            <Stat value={`~${SPEED.alertSec}`} unit="s" label="from confirmed restock to the push" />
          </StatGrid>
          <LinkRow links={[{ label: "Create the alerts", href: "/#notify" }, { label: "What one alert covers", href: "/iphone-duo-restock-alerts" }]} />
          <Figure id="phone-on-box" />
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/#notify" className="btn btn-primary">Alert me on these configurations</Link>
            <span className="text-sm text-ink-3">Plus is ${PLANS.plus.priceUsd}/month for {PLANS.plus.limit} alerts.</span>
          </div>
        </Section>

        {/* other countries */}
        <Section id="countries" h2="Is the same configuration restocking most abroad?" lead={abroadLead} facts={facts}>
          <BlockView b={abroadTable} facts={facts} />
          {abroadWithData.length > 0 && leadStorage && (
            <Points items={[
              sameStorage.length === abroadWithData.length
                ? { text: <>The US pattern travels: <b className="text-ink">{listWords(abroadWithData.map((r) => r.name))}</b> {abroadWithData.length === 1 ? "also leads" : "all also lead"} with the {leadStorage.storage}</> }
                : { text: <>The mix already parts ways: <b className="text-ink">{listWords(abroadWithData.filter((r) => r.top!.storage !== leadStorage.storage).map((r) => `${r.name} (${r.top!.storage})`))}</b> {abroadWithData.length - sameStorage.length === 1 ? "leads" : "lead"} with a size other than the US&apos;s {leadStorage.storage}</> },
              { text: <>Hour-of-day and day-by-day tables for each country are on its own page</>, step: true },
            ]} />
          )}
          <Measured title="A few days, not a pattern">
            Reading outside the US started on {intlSince}; what you see is days of restocks, not a habit. A country&apos;s favourite configuration becomes a pattern only with enough restocks over enough days, the same bar our hour-of-day patterns have to clear.
          </Measured>
        </Section>

        {/* how we count */}
        <Section id="counting" h2="What counts as a restock in these numbers?" lead={countLead} facts={facts}>
          <Points className="mt-5" size="base" items={[
            { text: <><b className="text-ink">All {STORES.length} US stores every {SPEED.checkSec} seconds</b> · stores with alerts every {SPEED.fastSec} · since {longDate(TRACKING_SINCE_US)}, the other countries since {intlSince}</> },
            { text: <><b className="text-ink">Two checks must agree</b> · about a second apart · a lone answer is discarded</> },
            { text: <><b className="text-ink">The first sighting is left out</b> · it opens a store × configuration&apos;s history; it is not a restock</> },
            { text: <><b className="text-ink">Our own observations only</b> · other trackers&apos; reports stay a separate, labelled series and never enter these counts</> },
            { text: <Inline text={`Shares are of restocks, not of units: apple.com shows availability, never quantities ([Apple: Delivery and Pickup](${PICKUP})), so one phone and ten count alike`} facts={facts} />, no: true },
          ]} />
          <LinkRow links={[{ label: "Check, confirm, push: how RestockWire works", href: "/how-restock-alerts-work" }, { label: "The restocks behind these counts", href: "/restock-log" }, { label: "Getting an iPhone Duo when every store says unavailable", href: "/how-to-buy-an-iphone-duo-in-store" }, { label: "The hours Apple restocks the iPhone Duo", href: "/when-does-iphone-duo-restock" }, { label: "How quickly a restock sells out", href: "/how-fast-does-iphone-duo-sell-out" }]} />
          <p className="mt-4 text-sm text-ink-3">Cite this page: any figure here may be quoted with a link to it. RestockWire is independent of Apple and reads only the pickup availability apple.com shows the public.</p>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} /></div>
    </div>
  );
}
