/**
 * /how-restock-alerts-work: the check cycle, the two-answer rule and what is recorded, shown as tiles, tables, keyword lines and a
 * step strip. Each H2 is a question with one answer-first sentence; every number is live.
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
import { ALL_STORES, STORES, storePath, appleName } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { PLANS, SPEED, OTHER_TRACKERS } from "@/lib/plans";
import { PATTERN_DAYS, TRACKING_SINCE_INTL, TRACKING_SINCE_US, WEEKDAYS, hourLabel, siteFacts, type SiteFacts } from "@/lib/content/siteFacts";
import { medianBand } from "@/lib/stock/sellouts";
import { Chips, Measured, Points, Stat, StatGrid, StepStrip } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const TITLE = "How Restock Alerts Work: Check, Confirm, Push in Seconds";
const DESCRIPTION = `Your Apple Stores are read every ${SPEED.fastSec} seconds, each restock is confirmed by a second check, and the push lands ~${SPEED.alertSec} s later. Every restock is logged by store.`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: "/how-restock-alerts-work" },
  openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description: DESCRIPTION, url: "/how-restock-alerts-work" },
};

const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const COUNTRIES_COVERED = ["Canada", "the UK", "Australia", "Germany", "France", "Italy", "Spain", "Japan", "South Korea", "Hong Kong", "Singapore", "the UAE", "Switzerland", "the Netherlands", "Sweden", "Taiwan", "Austria", "Belgium"];

/** The US store with the most restocks and a stated pattern: the worked example of "when does my store restock". */
function example(f: SiteFacts) {
  const best = Object.values(f.patterns).filter((p) => p.peakHour != null && STORES.some((s) => s.storeNumber === p.storeNumber)).sort((a, b) => b.restocks - a.restocks)[0];
  const store = best ? STORES.find((s) => s.storeNumber === best.storeNumber) : undefined;
  return best && store ? { p: best, store, name: appleName(store), path: storePath(store) } : null;
}

/** A question, its one-sentence answer, then the UI. */
function Section({ id, h2, lead, facts, children }: { id: string; h2: string; lead: string; facts: Facts; children: ReactNode }) {
  return (
    <section id={id} className="pane scroll-mt-24 p-5 sm:p-7">
      <h2 className="display text-2xl sm:text-3xl">{h2}</h2>
      <p className="mt-3 text-base text-ink-2 sm:text-lg"><Inline text={lead} facts={facts} /></p>
      {children}
    </section>
  );
}
/** Where to go next: a row of chip links. */
function LinkRow({ links, className = "mt-4" }: { links: { label: string; href: string }[]; className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {links.map((l) => l.href.startsWith("http") ? <a key={l.href} href={l.href} target="_blank" rel="noopener" className="chip chip-sm">{l.label}</a> : <Link key={l.href} href={l.href} className="chip chip-sm">{l.label}</Link>)}
    </div>
  );
}

export default async function HowItWorks() {
  const f = await siteFacts();
  const facts = await getFacts();
  const ex = example(f);
  const intl = ALL_STORES.length - STORES.length;
  const ds = f.duoSellout;
  const typical = ds ? `about ${medianBand(ds.medianSec)}` : "about a minute";

  const cycleTable: Block = { t: "table", head: ["Step on the wire", "Timing"], rows: [
    ["Stores in your alerts: checked", `every **${SPEED.fastSec} seconds**`],
    [`All other Apple Stores (${n(ALL_STORES.length)} in total): checked`, `every ${SPEED.checkSec} seconds`],
    ["A first \"available\": asked a second time", "about 1 second later"],
    ["Confirmed restock: push on your phone", `about **${SPEED.alertSec} seconds**`],
    ["A typical iPhone Duo restock: listed until gone", `${typical}; some in 20–30 s`],
    ["Intervals other iPhone stock trackers publish", OTHER_TRACKERS],
  ], caption: "The RestockWire cycle runs day and night", source: "RestockWire's poller and restock log; other trackers' intervals as each publishes them (November 2026)" };
  const dataTable: Block = { t: "table", head: ["Recorded", "Shown on"], rows: [
    ["Each confirmed restock and sell-out, with store, configuration and time", "[the restock log](/restock-log) and every store page"],
    ["Live pickup stock per storage and color", "every store, city and state page, with the last check time"],
    ["The usual restock hour and weekday, in local time", "\"When does … restock?\" on each store, city and state page"],
    [`Restocks over 24 hours, 7 days and ${PATTERN_DAYS} days`, "pages for each store, city, state and iPhone model"],
    ["How long a restock usually stays listed", "those pages too, as a \"stays ~N min\" note"],
    ["The configurations that return most", "the per-configuration restock table on every store page"],
    ["Local price including tax", "each store page and each state page"],
  ], caption: f.restocks ? `${n(f.restocks)} confirmed restocks and ${n(f.soldouts)} sell-outs on file` : "On file since tracking began", source: `RestockWire restock log (US since ${TRACKING_SINCE_US}, other countries since ${TRACKING_SINCE_INTL})` };

  const speedLead = `**${SPEED.fastSec} seconds** between checks at the stores in your alerts, ${SPEED.checkSec} seconds across all ${n(ALL_STORES.length)} stores, and about **${SPEED.alertSec} seconds** from a confirmed restock to your phone. ${SPEED.fastSec} seconds is the shortest interval any iPhone stock tracker we know of publishes.`;
  const realLead = "**Two answers from apple.com must agree.** The second ask goes out about a second after the first, so a glitch never becomes an alert and a real restock is not delayed.";
  const dataLead = `Each confirmed restock and sell-out at each store, with exact configuration and time${f.restocks ? `: **${n(f.restocks)}** restocks at ${n(f.restockStores)} stores so far` : ""}. Every page works out from that log when restocks land, how often, and how long they last.`;
  const yourStoreLead = `The store's own page says, under **"When does … restock?"**: the usual local hour, the busiest weekday and the last ${PATTERN_DAYS} days. Apple publishes no schedule; this is the nearest thing.`;
  const coverageLead = `Three iPhones in every configuration, at **${n(ALL_STORES.length)}** Apple Stores across ${INTL_CODES.length + 1} countries.`;
  const costLead = `From **$${PLANS.plus.priceUsd}** a month for alerts; browsing costs nothing.`;

  const nav = [
    { id: "speed", label: "The 5-second wire" },
    { id: "confirmed", label: "Double check" },
    { id: "data", label: "The log" },
    { id: "your-store", label: "Your store's hour" },
    { id: "coverage", label: "Coverage" },
    { id: "cost", label: "Plans" },
    { id: "limits", label: "Limits" },
  ];

  const faq: Faq[] = [
    { q: "Why does RestockWire check twice before it alerts?", a: "Because apple.com sometimes returns a one-off wrong answer. A second ask about a second later must agree, so a glitch never reaches your phone ([restock log](/restock-log))." },
    { q: "How does RestockWire's check interval compare with other trackers?", a: `The stores in your alerts are checked every ${SPEED.fastSec} seconds; other iPhone stock trackers publish ${OTHER_TRACKERS}. Only intervals each tracker states publicly are compared.` },
    { q: "Is there an official Apple restock schedule I can use instead?", a: "No. Apple shows pickup availability per store and configuration, never a schedule; RestockWire's restock hours are observed store by store ([Apple: Delivery and Pickup](https://www.apple.com/shop/shipping-pickup))." },
    { q: "Who runs RestockWire, and does Apple have a part in it?", a: "RestockWire is independent and not affiliated with Apple. It reads the same public pickup availability apple.com shows everyone, only far more often." },
  ];
  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup, how pickup availability works", url: "https://www.apple.com/shop/shipping-pickup" },
    { label: "Apple: Shipping & Pickup help, what to bring", url: "https://www.apple.com/shop/help/shipping_delivery" },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/how-restock-alerts-work`, url: `${site}/how-restock-alerts-work`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: f.at },
      {
        "@type": "HowTo", name: "Finding when your Apple Store restocks the iPhone",
        step: [
          { "@type": "HowToStep", name: "Open your store's page", text: "Type a store, city or ZIP into search, or pick a state from the Apple Stores list.", url: `${site}/apple-stores` },
          { "@type": "HowToStep", name: "Read “When does … restock?”", text: "It gives the usual local restock hour, the busiest weekday and the last 14 days." },
          { "@type": "HowToStep", name: "Look at your configuration", text: "The per-configuration restock table ranks which storage and color come back most." },
          { "@type": "HowToStep", name: "Add an alert", text: `The store then moves to ${SPEED.fastSec}-second checks and your phone hears about a confirmed restock ${SPEED.alertSec} seconds later.` },
        ],
      },
      {
        "@type": "Dataset", "@id": `${site}/restock-log#dataset`, name: "RestockWire restock log: iPhone pickup at Apple Stores",
        description: "Each confirmed in-store pickup restock and sell-out of the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max at Apple Stores in 19 countries, with store, configuration and time, from RestockWire's own checks.",
        url: `${site}/restock-log`, creator: { "@id": `${site}/#organization` }, isAccessibleForFree: true,
        temporalCoverage: `${TRACKING_SINCE_US}/..`, spatialCoverage: "Apple Stores across the United States plus 18 further countries",
        variableMeasured: ["Apple Store", "iPhone model, storage and color", "restock time", "sell-out time", "time in stock"],
        ...(f.restocks ? { size: `${f.restocks} restocks, ${f.soldouts} sell-outs` } : {}),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow mb-4">RestockWire · check, confirm, push</div>
          <h1 className="display text-4xl sm:text-6xl">How RestockWire alerts work: check, confirm, push</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">Every store is on the {SPEED.checkSec}-second wire; yours are on the <b className="text-ink">{SPEED.fastSec}-second</b> one. A second check confirms each restock, the push lands about <b className="text-ink">{SPEED.alertSec} seconds</b> later, and the log keeps every one, so each store page knows when that store usually restocks.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#notify" className="btn btn-primary btn-lg">Start an alert</Link>
            <Link href="/restock-log" className="btn btn-ghost btn-lg">Open the restock log</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={`${SPEED.fastSec}`} unit="s" label="between checks at the stores in your alerts" tone="accent" />
          <Stat value={`${SPEED.checkSec}`} unit="s" label={<>between checks everywhere else, {n(ALL_STORES.length)} stores</>} />
          <Stat value={`~${SPEED.alertSec}`} unit="s" label="from confirmed restock to your phone" />
          <Stat value={f.restocks ? n(f.restocks) : "—"} label={f.restocks ? <>restocks on file · {n(f.soldouts)} sell-outs</> : "restocks on file since tracking began"} live={!!f.restocks} />
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* speed */}
        <Section id="speed" h2="How often does RestockWire read each Apple Store?" lead={speedLead} facts={facts}>
          <BlockView b={cycleTable} facts={facts} />
          <StatGrid cols={3}>
            <Stat value={ds ? `${ds.medianSec}` : "~60"} unit="s" label={ds ? <>median iPhone Duo listing, last 7 days · {n(ds.n)} restocks</> : "median iPhone Duo listing"} tone="warn" />
            <Stat value={ds ? pct(ds.caught.m5) : "—"} label="of them seen by a tracker checking every 5 minutes" tone="muted" />
            <Stat value={ds ? pct(ds.caught.m15) : "—"} label="by one checking every 15 minutes" tone="muted" />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>A Duo restock lasts {typical}, some only 20–30 seconds: <b className="text-ink">the interval is the product</b></> },
            { text: <>On {SPEED.fastSec}-second checks you hear about it while it can still be reserved</>, step: true },
            { text: <>A slower tracker&apos;s two checks can straddle the whole listing, which then never shows up at all</>, no: true },
            { text: <>Each store, city, state and country page answers <b className="text-ink">&quot;How fast do restocks sell out?&quot;</b> with every restock&apos;s seconds (&quot;sold out in 45–60 s&quot;) and the share gone inside 30 seconds and a minute</> },
          ]} />
          <Figure id="phone-notification" />
        </Section>

        {/* confirmed */}
        <Section id="confirmed" h2="How is a restock confirmed before you hear about it?" lead={realLead} facts={facts}>
          <Points className="mt-5" size="base" items={[
            { text: <><b className="text-ink">Errors never read as sold out</b> · a failed or timed-out request changes nothing · it is re-asked from a fresh address</> },
            { text: <><b className="text-ink">Two matching answers</b> · ~1 s apart · a single odd response is discarded</> },
            { text: <><b className="text-ink">One push per restock</b> · no repeats while it stays listed · none for a store&apos;s first sighting</> },
            { text: <><b className="text-ink">Sell-outs get confirmed as well</b> · a vanished listing is re-checked on the next round ({SPEED.checkSec} s)</> },
          ]} />
        </Section>

        {/* data */}
        <Section id="data" h2="What goes into the restock log?" lead={dataLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={f.restocks ? n(f.restocks) : "—"} label="restocks confirmed" tone="accent" />
            <Stat value={f.soldouts ? n(f.soldouts) : "—"} label="sell-outs confirmed" />
            <Stat value={f.restockStores ? n(f.restockStores) : "—"} label="stores restocked at least once" />
          </StatGrid>
          <BlockView b={dataTable} facts={facts} />
          <Measured>
            These numbers come from our own confirmed checks only. Where a page shows other trackers&apos; reports, they form a separate, labelled series and are never added in. US since {TRACKING_SINCE_US}; other countries since {TRACKING_SINCE_INTL}.
          </Measured>
        </Section>

        {/* your store */}
        <Section id="your-store" h2="What hour does my Apple Store usually restock?" lead={yourStoreLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Open your store", hint: <Inline text="search by store, city or ZIP from any page, or go through [Apple Stores by state](/apple-stores)" facts={facts} /> },
            { title: "Read \"When does … restock?\"", hint: `the usual local hour, the busiest weekday, and the last ${PATTERN_DAYS} days` },
            { title: "Check your configuration's row", hint: "does your exact storage and color come back often?" },
            { title: "Add an alert", hint: <>on that store and configuration, so the wire watches for you: {SPEED.fastSec}-second checks from then on</> },
          ]} />
          {ex ? (
            <>
              <div className="eyebrow mt-6">Worked example: <Link href={ex.path} className="normal-case tracking-normal text-ink underline underline-offset-2">{ex.name}</Link>, last {PATTERN_DAYS} days</div>
              <StatGrid cols={4} className="mt-3">
                <Stat value={hourLabel(ex.p.peakHour!)} label="usual restock hour, local time" tone="accent" />
                <Stat value={n(ex.p.restocks)} label="restocks confirmed" />
                <Stat value={ex.p.peakWeekday != null ? WEEKDAYS[ex.p.peakWeekday] : "—"} label={ex.p.peakWeekday != null ? "busiest weekday" : "busiest weekday: two weeks of data needed"} tone={ex.p.peakWeekday != null ? "plain" : "muted"} />
                <Stat value={ex.p.medianStayMin != null ? `~${ex.p.medianStayMin}` : "—"} unit={ex.p.medianStayMin != null ? "min" : undefined} label="typical time a restock stayed listed" />
              </StatGrid>
            </>
          ) : (
            <Points className="mt-5" items={[{ text: <>Every store page gives the usual hour, the busiest weekday and the last {PATTERN_DAYS} days, one day at a time</> }]} />
          )}
          <Points className="mt-5" items={[
            { text: <>The chart says when to be ready; the alert is what gets the phone</>, step: true },
            { text: <><b className="text-ink">History, not a promise</b>: Apple publishes no schedule, and launch week may look nothing like the next</>, no: true },
          ]} />
          <LinkRow links={[{ label: "iPhone Duo restock hours across the US", href: "/when-does-iphone-duo-restock" }, { label: "iPhone Duo sell-out times", href: "/how-fast-does-iphone-duo-sell-out" }]} />
          <Figure id="apple-store-pickup-counter" />
        </Section>

        {/* coverage */}
        <Section id="coverage" h2="Which Apple Stores and iPhone models are on the wire?" lead={coverageLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value="3" label="iPhones: Duo, 18 Pro, 18 Pro Max, all storage and colors, at Apple's local prices" />
            <Stat value={STORES.length} label="US Apple Stores" tone="accent" />
            <Stat value={n(intl)} label={<>across {INTL_CODES.length} more countries</>} />
          </StatGrid>
          <Chips className="mt-4" items={COUNTRIES_COVERED} />
          <LinkRow links={[{ label: "US stores", href: "/apple-stores" }, { label: "United Kingdom", href: "/uk" }, { label: "Japan", href: "/jp" }]} />
        </Section>

        {/* cost */}
        <Section id="cost" h2="How much do RestockWire alerts cost?" lead={costLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>Plus: {PLANS.plus.limit} alert rules</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>Pro: {PLANS.pro.limit} alert rules</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>Max: {PLANS.max.limit} alert rules</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>An alert is one store × one exact configuration</> },
            { text: <Inline text={`The ${SPEED.fastSec}-second checks are the same on every plan ([pricing](/pricing))`} facts={facts} /> },
            { text: <>Live stock, restock hours and the log: <b className="text-ink">free</b></> },
          ]} />
        </Section>

        {/* limits */}
        <Section id="limits" h2="Where does RestockWire stop?" lead="At **what apple.com shows**, and no further." facts={facts}>
          <Points className="mt-5" items={[
            { text: <Inline text="iPhone notifications need the Home Screen app ([install](/phone-alerts)); with no device set up, alerts arrive by e-mail from alerts@restockwire.com" facts={facts} /> },
            { text: <>Public availability only: no unit counts, no holds</>, no: true },
            { text: <>Apple can show stock that is already promised to other orders</>, no: true },
          ]} />
          <p className="mt-4 text-sm text-ink-3">Cite this page: quote the method with a link back. RestockWire is independent of Apple.</p>
          <div className="mt-5"><Link href="/#notify" className="btn btn-primary">Start an alert</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="How-it-works questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} Apple Stores in ${INTL_CODES.length + 1} countries`} since={TRACKING_SINCE_US} /></div>
    </div>
  );
}
