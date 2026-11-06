/**
 * /apple-store-pickup-explained: what "currently unavailable for pickup" means, shown as tiles, tables,
 * keyword lines and swaps. Each H2 is a question with one answer-first sentence; every number is live.
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
import { STORES, appleName, storePath } from "@/lib/apple/catalog";
import { SPEED } from "@/lib/plans";
import { TRACKING_SINCE_US, hourLabel } from "@/lib/content/siteFacts";
import { DUO_LAUNCH_DAY, DUO_PICKUP_RESUMED, busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { storesWithStockNow } from "@/lib/stock/queries";
import { alertHref } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const TITLE = "Currently Unavailable for Pickup: What Apple Means";
const DESCRIPTION = "On apple.com, \"currently unavailable for pickup\" means that store lists none of that exact iPhone right now. It is not never: iPhone Duo pickup stock lasts minutes.";
const PATH = "/apple-store-pickup-explained";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_HELP = "https://www.apple.com/shop/help/shipping_delivery";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description: DESCRIPTION, url: PATH },
};

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const hl = (h: number) => hourLabel(h % 24);
const ET_DAY = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "long", day: "numeric" });
const ET_TIME = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

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

export default async function PickupAvailabilityExplained() {
  const [facts, rt, recent, now] = await Promise.all([getFacts(), duoRestockTimes("us"), recentByConfig({ country: "us" }), storesWithStockNow(undefined, "us")]);
  const so = rt.sellout; // every confirmed US iPhone Duo restock since tracking began that sold out
  const since = longDate(rt.since);
  const bw = rt.peakHour != null && rt.n > 0 ? busiestWindow(rt.byHour) : null;
  const drop = rt.drops[0];
  const latestStore = rt.latest ? STORES.find((s) => s.storeNumber === rt.latest!.storeNumber) : undefined;
  const setupHref = alertHref({ model: "duo" });
  const thin = rt.unknown || rt.n === 0;
  const haveRecent = !recent.unknown && recent.restocks > 0;

  const showsTable: Block = { t: "table", head: ["apple.com tells you", "apple.com never tells you"], rows: [
    ["The state at the instant you searched", "When the store last had it, or when it will again"],
    ["Whether each store on the list has your exact configuration for pickup now; another color at the same store is a separate answer", "How many units a store holds"],
    ["A short list of stores around one ZIP code: in our poller's experience up to about a dozen within roughly 250 miles", "Every store in the country at once"],
    ["Delivery estimates for the same configuration", "Any restock schedule"],
  ], caption: "What the public availability answer contains; Apple's own page describes the pickup flow.", source: `[Apple: Delivery and Pickup](${APPLE_PICKUP}); RestockWire's checks of apple.com pickup availability since ${longDate(TRACKING_SINCE_US)}` };
  const kindsTable: Block = { t: "table", head: ["How you buy", "What you get", "What it hangs on"], rows: [
    ["Pickup reservation (\"I'll pick it up\" on apple.com)", "one specific phone held for you at one store, with a pickup window Apple states by e-mail", "that store listing your exact configuration at the second you check out"],
    ["Delivery", "a place in a queue with an estimated date", "Apple's supply; dates were reported slipping into 2027 within days of launch"],
    ["Walking in", "a shot at whatever the counter can sell that day", "stock not allocated to orders; at the Duo's launch, reported as little or none in most markets"],
  ], caption: "One product page, three different things for sale.", source: `[Apple Newsroom, ${ET_DAY.format(new Date(`${DUO_LAUNCH_DAY}T12:00:00Z`))}](${NEWSROOM}); [MacRumors, ${ET_DAY.format(new Date(`${DUO_PICKUP_RESUMED}T12:00:00Z`))}](${MACRUMORS})` };

  const howLead = `**One store, one exact configuration, one moment**: for each store near your ZIP, Apple returns listed for pickup today or "currently unavailable", with no quantity, no restock time and no schedule.`;
  const kindsLead = "A reservation is **one specific phone Apple holds for you at one store**. Delivery is a queue whose dates were reported slipping into 2027 within days of launch; walking in is a hope that rests on stock Apple has not allocated to orders.";
  const flipsLead = so
    ? `**${so.medianSec} seconds** is the median life of an iPhone Duo pickup listing: of ${n(so.n)} sold-out US restocks since ${since}, **${pct(so.within2min)}** were gone inside 2 minutes and the quickest inside ${so.fastestSec} seconds.`
    : "A pickup listing is a small allocation chased by many people at once: it appears, is reserved within minutes, and the store reads unavailable again. Exact lifetimes show here once ten confirmed restocks have sold out.";
  const oftenLead = `Every **${SPEED.checkSec} seconds** for each US Apple Store and every **${SPEED.fastSec} seconds** for stores with alerts, from our side; apple.com itself only answers at the moment you ask, and RestockWire shows a change only once two answers agree.`;
  const afterLead = "You wait for Apple's ready e-mail, which states the pickup window, then show **the order number or QR code and a government-issued photo ID** at the Pickup counter, or send the designated contact you named at checkout.";
  const staffLead = `No: Apple publishes no restock schedule and staff have none to share${bw ? `. The nearest thing is the observed pattern: **${pct(bw.share)}** of the ${n(rt.n)} confirmed US iPhone Duo restocks since ${since} landed between ${hl(bw.from)} and ${hl(bw.to)} local time` : ". The nearest thing is the observed pattern on each store page, once a store has enough restocks to state one"}.`;

  const nav = [
    { id: "how-it-works", label: "The two states" },
    { id: "reservation-vs-walk-in", label: "Reserve, walk in, ship" },
    { id: "why-it-flips", label: "Minutes-long listings" },
    { id: "how-often", label: "Refresh rate" },
    { id: "after-reserve", label: "Collecting it" },
    { id: "staff", label: "Ask staff?" },
  ];

  const faq: Faq[] = [
    { q: "My store has said unavailable for a week. Will it ever restock?", a: so ? `Very likely: since ${since}, ${n(rt.n)} confirmed iPhone Duo restocks reached ${n(rt.stores)} US Apple Stores, and the median one was gone within ${so.medianSec} seconds. A store can restock often and still read unavailable nearly every time you look.` : "Very likely: restocks appear and sell out within minutes, so a store can restock often and still read unavailable nearly every time you look ([restock log](/restock-log))." },
    { q: "Can I hold an iPhone Duo for pickup and pay later?", a: "No: a pickup reservation is a completed apple.com order with in-store pickup chosen; there is no hold without checkout. If you change your mind, cancel the order." },
    { q: "How many days do I have to collect a pickup order?", a: `Apple states the window per order in the ready-for-pickup e-mail, so RestockWire quotes no number. If you cannot make it, cancel the order ([Apple: Shipping & Pickup help](${APPLE_HELP})).` },
    { q: "Why do two people searching different ZIP codes see different stores?", a: so ? `Each ZIP gets its own short list of nearby stores, and a listing can appear and sell out between two looks, since the median Duo listing lasts ${so.medianSec} seconds. The stores around you are on [iPhone Duo near me](/iphone-duo-in-stock-near-me).` : "Each ZIP gets its own short list of nearby stores, and a listing can appear and sell out between two looks. The stores around you are on [iPhone Duo near me](/iphone-duo-in-stock-near-me)." },
  ];

  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup, how in-store pickup works", url: APPLE_PICKUP },
    { label: "Apple: Shipping & Pickup help, what to bring", url: APPLE_HELP },
    { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide", url: NEWSROOM },
    { label: "MacRumors: iPhone Duo Apple Store pickup in the US", url: MACRUMORS },
    { label: "Wikipedia: Apple Store", url: "https://en.wikipedia.org/wiki/Apple_Store" },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: rt.at, mentions: { "@id": `${site}/restock-log#dataset` } },
      {
        "@type": "HowTo", name: "Reserving an iPhone Duo for Apple Store pickup",
        step: [
          { "@type": "HowToStep", name: "Pick the exact configuration on apple.com", text: "Availability is per store and per storage and color." },
          { "@type": "HowToStep", name: "Choose \"I'll pick it up\" at a store listing it", text: "Listings can vanish within a minute; be signed in with Apple Pay ready." },
          { "@type": "HowToStep", name: "Wait for the ready-for-pickup e-mail", text: "It gives the pickup window for your order." },
          { "@type": "HowToStep", name: "Collect at the Pickup counter", text: "Show the order number or QR code and a government-issued photo ID, or send the designated contact named at checkout.", url: APPLE_HELP },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="eyebrow mb-4">apple.com pickup status · a snapshot, not a verdict</div>
          <h1 className="display text-4xl sm:text-6xl">What does &quot;currently unavailable for pickup&quot; mean on apple.com?</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2">It means <b className="text-ink">that store does not list that exact storage and color for pickup at this instant</b>. It does not mean never. iPhone Duo pickup stock lives for minutes, so nearly every store reads &quot;unavailable&quot; at a random moment, even on a day with hundreds of restocks.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/in-stock/iphone-duo" className="btn btn-primary btn-lg">iPhone Duo pickup stock, live</Link>
            <Link href={setupHref} className="btn btn-ghost btn-lg">Start an alert</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={so ? `${so.medianSec}` : "—"} unit={so ? "s" : undefined} label="median listing before sell-out" tone="warn" />
          <Stat value={so ? pct(so.within2min) : "—"} label="of sold-out restocks over inside 2 minutes" tone="warn" />
          <Stat value={haveRecent ? n(recent.restocks) : "—"} label={haveRecent ? <>restocks in the last 24 hours · {n(recent.stores)} US Apple Stores</> : "last 24 hours: count did not load"} live={haveRecent} />
          <Stat value={!thin ? n(rt.n) : "—"} label={!thin ? <>US restocks confirmed since {since}</> : "confirmed restocks: building"} />
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* how availability works */}
        <Section id="how-it-works" h2="How does apple.com decide what to show for pickup?" lead={howLead} facts={facts}>
          <BlockView b={showsTable} facts={facts} />
          <Points items={[
            { text: <Inline text={`RestockWire queries from enough points to cover all ${STORES.length} US Apple Stores every round ([how it works](/how-restock-alerts-work))`} facts={facts} />, step: true },
            { text: <>Every ZIP has its own short store list: <b className="text-ink">someone 50 miles away sees stores you do not</b></> },
          ]} />
          <Figure id="apple-store-entrance-busy" />
        </Section>

        {/* reservation vs walk-in vs delivery */}
        <Section id="reservation-vs-walk-in" h2="Pickup reservation, walk-in or delivery: what is each one?" lead={kindsLead} facts={facts}>
          <BlockView b={kindsTable} facts={facts} />
          <ol className="grid gap-3 sm:grid-cols-2">
            <Swap no="Hoping the counter has one" yes="Reserving the pickup slot on apple.com" why="A reservation is one phone held in your name; the counter sells only what is left unallocated." />
            <Swap no="Waiting on delivery or trying a walk-in" yes="Treating the reservation as the real product" why="Delivery suits people who can wait months; a walk-in is a lottery with hidden odds; the reservation is where a few seconds of speed buy the phone." />
          </ol>
          <Points className="mt-5" items={[
            { text: <Inline text={`US pickup reservations were reported a day later ([MacRumors](${MACRUMORS}))`} facts={facts} /> },
            { text: <Inline text={`iPhone Duo in Apple Stores since ${longDate(DUO_LAUNCH_DAY)} ([Apple Newsroom](${NEWSROOM}))`} facts={facts} /> },
          ]} />
          <Figure id="click-and-collect-queue" />
        </Section>

        {/* why it flips */}
        <Section id="why-it-flips" h2="Why does a store go available and back to unavailable in minutes?" lead={flipsLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={!recent.unknown ? n(now.duo) : "—"} label={<>US Apple Stores of {STORES.length} listing any iPhone Duo for pickup now</>} live={!recent.unknown} />
            <Stat value={so ? pct(so.within20min) : "—"} label="of sold-out restocks over inside 20 minutes" tone="muted" />
            <Stat value={drop ? n(drop.stores) : "—"} label={drop ? <>stores restocked in one 30-minute slot on {ET_DAY.format(new Date(drop.at))}, the largest wave · {drop.restocks} restocks</> : "largest single wave: appears as restocks are confirmed"} tone="warn" />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <Inline text={`**Last confirmed restock:** ${rt.latest && latestStore ? `[${appleName(latestStore)}](${storePath(latestStore)}), ${ET_TIME.format(new Date(rt.latest.at))} ET` : "see [the restock log](/restock-log)"}`} facts={facts} />, step: true },
            { text: <>Small allocation, thousands of buyers: the listing lasts seconds to minutes</>, no: true },
            { text: <>A listing <b className="text-ink">shows up</b> when Apple assigns units at that store to online pickup and <b className="text-ink">goes</b> when the last one is reserved</> },
            { text: <>Waves hit a dozen stores together and clear them within minutes, so checking one store by hand finds nothing</> },
          ]} />
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Checking one store by hand" yes="Alerts across several stores" why="A wave lands at a dozen stores at once and is gone before a second reload." />
            <Swap no="Reading the page like a shelf" yes="Reading it like a pulse" why="&quot;Unavailable&quot; is the resting state; &quot;available&quot; is the event." />
          </ol>
          <LinkRow links={[{ label: "Seconds each restock lasted", href: "/how-fast-does-iphone-duo-sell-out" }, { label: "Restock hours", href: "/when-does-iphone-duo-restock" }]} />
        </Section>

        {/* how often */}
        <Section id="how-often" h2="How often is pickup availability checked?" lead={oftenLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`${SPEED.fastSec}`} unit="s" label="between checks at stores with alerts" tone="accent" />
            <Stat value={`${SPEED.checkSec}`} unit="s" label={<>between checks at every US Apple Store ({n(STORES.length)}, day and night)</>} />
            <Stat value={`~${SPEED.alertSec}`} unit="s" label="from confirmed restock to your phone" />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <><b className="text-ink">Your open tab never updates itself</b>: it shows the answer to the search you ran; you must search again to see a change</>, no: true },
            { text: <><b className="text-ink">Two answers, one restock</b>: a second answer about a second later must agree; a sell-out is confirmed on the next round</> },
            { text: <><b className="text-ink">Errors are not &quot;out of stock&quot;</b>: a failed or timed-out request changes nothing; unavailable here means apple.com said so, twice</> },
            { text: <Inline text={`An alert closes that gap: your phone hears about a confirmed restock ${SPEED.alertSec} seconds later ([iPhone Duo restock alerts](/iphone-duo-restock-alerts))`} facts={facts} />, step: true },
          ]} />
          <Measured>
            How often Apple&apos;s own systems refresh the figure behind the page is unknown to us, and we will not guess. We can say how often we ask: {n(STORES.length)} stores every {SPEED.checkSec} seconds, day and night, since {longDate(TRACKING_SINCE_US)}.
          </Measured>
        </Section>

        {/* after you reserve */}
        <Section id="after-reserve" h2="What happens once your pickup order is placed?" lead={afterLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Apple confirms, then says it is ready", hint: "two e-mails; the ready one gives the pickup window for your order, so we quote no number" },
            { title: "Have the right things with you", hint: <Inline text={`the order number or QR code from that e-mail and a government-issued photo ID ([Apple: Shipping & Pickup help](${APPLE_HELP})); a designated contact brings their own ID`} facts={facts} /> },
            { title: "Head to the Pickup counter", hint: "not the line at the door; pickup orders are handed over apart from walk-in sales" },
            { title: "Cannot make it? Cancel", hint: "from your order page instead of letting the hold run out; the phone returns to the page for someone else" },
          ]} />
          <Figure id="apple-store-pickup-counter" />
        </Section>

        {/* staff */}
        <Section id="staff" h2="Do Apple Store employees know when stock arrives?" lead={staffLead} facts={facts}>
          <StatGrid cols={2} className="mt-5">
            <Stat value={bw ? pct(bw.share) : "—"} label={bw ? <>of restocks landed {hl(bw.from)}–{hl(bw.to)} local time, the nearest thing to a schedule</> : "a store's usual hour appears after five restocks on three separate days"} tone="accent" />
            <Stat value={!thin ? n(rt.stores) : "—"} label={<>US stores with a confirmed restock since {since}</>} />
          </StatGrid>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Asking staff for a schedule" yes="Reading the store page's usual hour" why={<>Nothing official says a schedule exists; every store page shows its usual hour{bw ? "" : " once five restocks on three separate days allow it"}.</>} />
            <Swap no="Planning a morning around a chart" yes="Setting an alert" why="A chart is right on average, an alert every time; launch week may look nothing like the next." />
          </ol>
          <LinkRow links={[{ label: "iPhone Duo restock hours", href: "/when-does-iphone-duo-restock" }, { label: "Most-restocked configurations", href: "/iphone-duo-most-restocked-stores" }]} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={setupHref} className="btn btn-primary">Start an iPhone Duo alert</Link>
            <span className="text-sm text-ink-3">{SPEED.fastSec}-second checks on your stores; the push about {SPEED.alertSec} seconds after a confirmed restock.</span>
          </div>
          <p className="mt-4 text-sm text-ink-3">Cite this page: quote it with a link back. RestockWire is independent of Apple and reads the same public pickup availability you can.</p>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Pickup questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} since={TRACKING_SINCE_US} /></div>
    </div>
  );
}
