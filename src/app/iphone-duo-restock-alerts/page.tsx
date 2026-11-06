/**
 * /iphone-duo-restock-alerts: what one alert is and why the interval decides, shown as tiles, a step strip, tables and
 * swaps. Each H2 is a question with one answer-first sentence; every number is live.
 */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { BlockView } from "@/components/content/Blocks";
import { Inline } from "@/components/content/Inline";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { AlertBannerMock } from "@/components/content/CheckoutMocks";
import { getFacts, type Facts } from "@/lib/content/facts";
import type { Block, Faq, Source } from "@/lib/content/types";
import { ALL_STORES, STORES, appleName, storePath } from "@/lib/apple/catalog";
import { INTL_CODES } from "@/lib/apple/countries";
import { OTHER_TRACKERS, PLANS, SPEED } from "@/lib/plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, hourLabel, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const TITLE = "iPhone Duo Restock Alerts: Fastest Way to Get Notified";
const DESCRIPTION = `A push about ${SPEED.alertSec} s after an iPhone Duo restock is confirmed: RestockWire reads the Apple Stores you pick every ${SPEED.fastSec} seconds. A Duo listing lasts about a minute.`;
const PATH = "/iphone-duo-restock-alerts";
const WEB_PUSH = "https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers";
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

export default async function DuoStockAlerts() {
  const [f, facts, rt] = await Promise.all([siteFacts(), getFacts(), duoRestockTimes("us")]);
  const ds = f.duoSellout; // iPhone Duo restocks of the last 7 days that sold out
  const so = rt.sellout; // every confirmed US Duo restock since tracking began that sold out
  const intl = ALL_STORES.length - STORES.length;
  const typical = ds ? `about ${medianBand(ds.medianSec)}` : "about a minute";
  const since = longDate(rt.since);
  const bw = rt.peakHour != null && rt.n > 0 ? busiestWindow(rt.byHour) : null;
  const top = rt.topStores[0];
  const topStore = top ? STORES.find((s) => s.storeNumber === top.storeNumber) : undefined;
  const setupHref = alertHref({ model: "duo" });

  const alertTable: Block = { t: "table", head: ["One alert", "What that means"], rows: [
    ["Reach", `the ${STORES.length} US Apple Stores, plus ${intl} stores across ${INTL_CODES.length} other countries`],
    ["Scope", "one Apple Store × one exact configuration: model, storage and color"],
    ["Proof", "two matching answers from apple.com about 1 second apart; one answer is never a restock"],
    ["Delivery", `a push about ${SPEED.alertSec} seconds after the second answer; an e-mail instead when no device has notifications on`],
  ], caption: "Every paid plan runs on the same checks at the same speed.", source: "RestockWire's poller; the two-answer rule in full on [how it works](/how-restock-alerts-work)" };
  const compareTable: Block = { t: "table", head: ["Tracker", "Interval between checks, as each site publishes it (November 2026)", "Push delay, as claimed"], rows: [
    ["RestockWire", `every ${SPEED.fastSec} seconds at stores with an alert; every ${SPEED.checkSec} seconds across all ${STORES.length} US stores`, `about ${SPEED.alertSec} seconds after the restock is confirmed`],
    ["InStock Radar", "8 seconds at stores a paid alert points at; \"every few minutes\" elsewhere for new models", "a median of 2 seconds, by their account"],
    ["Store Stock Checker", "15 seconds at \"your Apple Stores\", up to 5 stores on a plan", "about 2 seconds, by their account"],
    ["iPhoneStockChecker.com", "once a minute, as reported", "not published"],
    ["ManzanaTracker", "about every 5 minutes", "not published"],
    ["Apple Inventory Check", "once in 15 minutes", "not published"],
  ], caption: "Self-published intervals only. RestockWire has not measured anyone else's service and does not pretend to.", source: "each tracker's own website as read in November 2026; RestockWire's figures from its poller" };

  const fastLead = ds
    ? `**${ds.medianSec} seconds** is the median over the last 7 days: half of the ${n(ds.n)} sold-out Duo restocks were gone by then, **${pct(ds.within30)}** inside 30 s${so ? `; since ${since}, **${pct(so.within2min)}** of ${n(so.n)} US Duo restocks were over within 2 minutes` : ""}.`
    : so ? `Minutes at most: since ${since}, **${pct(so.within2min)}** of ${n(so.n)} confirmed US iPhone Duo restocks were over within 2 minutes and ${pct(so.within20min)} within 20, around a median listing of ${so.medianSec} seconds.`
    : "Unmeasured for now: RestockWire states a sell-out time only once 20 or more confirmed restocks have sold out, and the current window holds fewer.";
  const howLead = `Three steps, none of them yours: your stores are read every **${SPEED.fastSec} seconds** (every other US Apple Store every ${SPEED.checkSec}), a first "available" is asked again about a second later, and once both answers agree the push goes out: on your phone **~${SPEED.alertSec} seconds** after Apple lists it.`;
  const compareLead = `Yes, as far as published numbers go: RestockWire's **${SPEED.fastSec} seconds** is the shortest interval any iPhone stock tracker we know of states on its own site; the others publish ${OTHER_TRACKERS}, and published figures are the only ones we compare.`;
  const setupLead = "Four steps and about two minutes: choose the iPhone, storage and color; tick the stores within your reach; on iPhone, put RestockWire on your Home Screen; then **reserve on apple.com straight from the push**.";
  const costLead = `**$${PLANS.plus.priceUsd} a month** buys ${PLANS.plus.limit} alerts (${PLANS.plus.name}); ${PLANS.pro.name} is $${PLANS.pro.priceUsd} for ${PLANS.pro.limit} and ${PLANS.max.name} $${PLANS.max.priceUsd} for ${PLANS.max.limit}; one alert is one store × one exact configuration, and browsing stock costs nothing.`;
  const arrivesLead = `Read the store name, tap through to "I'll pick it up" at that store and pay with Apple Pay while already signed in: the typical window is **${typical}**, and the people who get the phone staged all of this before the push came.`;

  const nav = [
    { id: "how-fast", label: "The window" },
    { id: "how-alerts-work", label: "Check, confirm, push" },
    { id: "compare", label: "Other trackers" },
    { id: "setup", label: "Set one up" },
    { id: "cost", label: "What it costs" },
    { id: "when-it-arrives", label: "When it buzzes" },
  ];

  const faq: Faq[] = [
    { q: "Does an iPhone Duo alert need an app from the App Store?", a: `No: RestockWire added to your Home Screen from Safari is a web app, and Apple delivers web push to Home Screen web apps once you allow notifications ([Apple Developer](${WEB_PUSH}); [install guide](/phone-alerts)). With no device set up, the alert comes by e-mail from alerts@restockwire.com.` },
    { q: "What counts as one alert?", a: `One Apple Store watched for one exact configuration; a second acceptable color at the same store is a second alert. ${PLANS.plus.name} holds ${PLANS.plus.limit}, ${PLANS.pro.name} ${PLANS.pro.limit} and ${PLANS.max.name} ${PLANS.max.limit}, which for most people means one configuration at the stores they can reach ([pricing](/pricing)).` },
    { q: "Will RestockWire reserve the phone when it alerts me?", a: "No: the push tells you within seconds that a store lists your configuration, and the reservation is yours to place on apple.com with in-store pickup, where Apple then holds the phone. RestockWire is independent and not affiliated with Apple; it reads the same pickup availability anyone can see, only far more often." },
    { q: `Why not check every second instead of every ${SPEED.fastSec}?`, a: `Because apple.com answers only so many requests from one address, and every restock needs a second answer about a second later anyway; asking every second would not shorten that and would risk getting no answers at all. At ${SPEED.fastSec} seconds the longest gap between a restock and our first look is ${SPEED.fastSec} seconds${ds ? `, against a median listing of ${ds.medianSec}` : ""}.` },
    { q: "Do the alerts cover Apple Stores in Canada, the UK or Japan?", a: `Yes: ${intl} Apple Stores in ${INTL_CODES.length} other countries have been tracked since ${longDate(TRACKING_SINCE_INTL)}, with the same ${SPEED.fastSec}-second reads at stores with alerts. Start from the country's page, such as [Canada](/ca), [the UK](/uk), [Australia](/au) or [Japan](/jp).` },
  ];

  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup (how in-store pickup works)", url: "https://www.apple.com/shop/shipping-pickup" },
    { label: "Apple: Shipping & Pickup help (what a pickup needs)", url: APPLE_HELP },
    { label: "Apple Developer: Sending web push notifications in web apps and browsers", url: WEB_PUSH },
    { label: "Wikipedia: Push technology (what a push notification is)", url: "https://en.wikipedia.org/wiki/Push_technology" },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}${PATH}`, url: `${site}${PATH}`, description: DESCRIPTION, name: TITLE, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: f.at },
      {
        "@type": "HowTo", name: "How to set up an iPhone Duo restock alert",
        totalTime: "PT2M",
        step: [
          { "@type": "HowToStep", name: "Choose the iPhone, storage and color", text: "An alert covers one exact configuration.", url: `${site}${setupHref}` },
          { "@type": "HowToStep", name: "Tick the stores within your reach", text: "The list runs nearest first, each with an estimated drive time." },
          { "@type": "HowToStep", name: "Put RestockWire on your Home Screen and allow notifications", text: "On iPhone, the alert is a web push to the Home Screen app.", url: `${site}/phone-alerts` },
          { "@type": "HowToStep", name: "Reserve on apple.com from the push", text: `The push lands about ${SPEED.alertSec} seconds after a restock is confirmed; choose in-store pickup at the store it names.` },
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
          <div className="eyebrow mb-4">iPhone Duo · restock alerts</div>
          <h1 className="display text-4xl sm:text-6xl">How do you get notified the second the iPhone Duo is back in stock?</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2"><b className="text-ink">A push from a tracker that never stops looking</b>: RestockWire reads the stores you pick every <b className="text-ink">{SPEED.fastSec} seconds</b>, the shortest interval any iPhone stock tracker we know of publishes (the others state {OTHER_TRACKERS}), and a confirmed restock reaches your phone about <b className="text-ink">{SPEED.alertSec} seconds</b> later.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={setupHref} className="btn btn-primary btn-lg">Alert me on my stores</Link>
            <Link href="/iphone-duo-restock-checkout-guide" className="btn btn-ghost btn-lg">Checkout in 20 seconds</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          <Stat value={`${SPEED.fastSec}`} unit="s" label="between reads of a store your alert points at" tone="accent" />
          <Stat value={`~${SPEED.alertSec}`} unit="s" label="from the confirmed restock to the push" />
          <Stat value={ds ? `${ds.medianSec}` : "~60"} unit="s" label={ds ? <>median Duo listing, seen to gone · last 7 days, {n(ds.n)} restocks</> : "median Duo listing, seen to gone"} tone="warn" />
          <Stat value={ds ? pct(ds.within30) : "20–30"} unit={ds ? undefined : "s"} label={ds ? "of last week's restocks over inside 30 seconds" : "how long some restocks last"} tone="warn" />
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* how fast */}
        <Section id="how-fast" h2="How long is the window after an iPhone Duo restock?" lead={fastLead} facts={facts}>
          {so && (
            <StatGrid cols={3} className="mt-5">
              <Stat value={`${so.medianSec}`} unit="s" label={<>median listing since {since} · {n(so.n)} sold-out restocks</>} tone="warn" />
              <Stat value={pct(so.within2min)} label="over inside 2 minutes" />
              <Stat value={pct(so.within20min)} label="over inside 20 minutes" tone="muted" />
            </StatGrid>
          )}
          {ds ? (
            <>
              <div className="eyebrow mt-6">Share of last week&apos;s Duo restocks a tracker would have caught at least once</div>
              <StatGrid cols={4} className="mt-3">
                <Stat value="all" label={<>reading every {SPEED.fastSec} seconds (RestockWire, stores with alerts): the set our checks saw</>} tone="accent" />
                <Stat value={pct(ds.caught.m1)} label="reading once a minute" tone="muted" />
                <Stat value={pct(ds.caught.m5)} label="reading once in 5 minutes" tone="muted" />
                <Stat value={pct(ds.caught.m15)} label="reading once in 15 minutes" tone="muted" />
              </StatGrid>
              <Measured>
                A listing that lasts d seconds is caught by a check every T seconds with probability min(1, d ÷ T), computed over the {n(ds.n)} Duo restocks that sold out in the last 7 days. A restock&apos;s life runs from the check that first saw it to the check that first saw it gone, so each duration is an upper bound and these rates are kind to the slower trackers.
              </Measured>
            </>
          ) : (
            <p className="pane-2 mt-5 p-4 text-sm text-ink-3">The catch-rate tiles return once 20 or more confirmed iPhone Duo restocks have sold out within the last 7 days; until then RestockWire shows nothing rather than a shaky number.</p>
          )}
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Reloading apple.com by hand" yes={<>Your stores read every {SPEED.fastSec} seconds</>} why="A reload every few minutes mostly finds nothing: the listing came and went between two of them." />
            <Swap no="A tracker that looks every 5 or 15 minutes" yes={<>A push about {SPEED.alertSec} s after confirmation</>} why={ds ? <>A history of restocks, not an alert: at 5 minutes it misses <b>{pct(1 - ds.caught.m5)}</b> of Duo restocks outright, at 15 minutes <b>{pct(1 - ds.caught.m15)}</b>.</> : "A history of restocks, not an alert: it can tell you a store had stock this morning, which is true and no use."} />
          </ol>
          <LinkRow links={[{ label: "Every restock timed to the second", href: "/how-fast-does-iphone-duo-sell-out" }]} />
          <Figure id="texting-city-street" />
        </Section>

        {/* how alerts work */}
        <Section id="how-alerts-work" h2="What happens between the restock and your phone buzzing?" lead={howLead} facts={facts}>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div>
              <StepStrip className="lg:grid-cols-2!" steps={[
                { title: "Read", hint: <>your exact configuration at your stores every {SPEED.fastSec} seconds; every other US Apple Store every {SPEED.checkSec}</> },
                { title: "Confirm", hint: "a first \"available\" is asked again about a second later; only two agreeing answers make a restock" },
                { title: "Push", hint: <Inline text={`about ${SPEED.alertSec} seconds after confirmation, to the RestockWire app on your Home Screen ([install](/phone-alerts)), with the store and configuration in the title; no device set up → an e-mail from alerts@restockwire.com`} facts={facts} /> },
                { title: "Once", hint: "one push per restock: nothing while it stays listed, nothing when it sells out, nothing for a store's first sighting" },
              ]} />
              <BlockView b={alertTable} facts={facts} />
              <Points items={[
                { text: <>Nothing to download; one permission prompt</> },
                { text: <Inline text={`On iPhone the alert is a [web push](https://en.wikipedia.org/wiki/Push_technology) to a Home Screen web app, which Safari supports ([Apple Developer](${WEB_PUSH}))`} facts={facts} /> },
                { text: <>The banner names the store; read it, then reserve</>, step: true },
              ]} />
            </div>
            <div className="mx-auto w-full max-w-[16rem] lg:mx-0"><AlertBannerMock /></div>
          </div>
          <Figure id="phone-notification" />
        </Section>

        {/* compare */}
        <Section id="compare" h2={`Is a ${SPEED.fastSec}-second check really the shortest interval around?`} lead={compareLead} facts={facts}>
          <BlockView b={compareTable} facts={facts} />
          {ds && (
            <>
              <div className="eyebrow">Share of a median listing&apos;s life ({ds.medianSec} s) that can pass before a tracker&apos;s first look</div>
              <StatGrid cols={2} className="mt-3">
                <Stat value={`up to ${pct(SPEED.fastSec / ds.medianSec)}`} label={<>on a {SPEED.fastSec}-second interval</>} tone="accent" />
                <Stat value={`up to ${pct(SPEED.checkSec / ds.medianSec)}`} label="on a 15-second interval" tone="warn" />
              </StatGrid>
            </>
          )}
          <Points className="mt-5" items={[
            { text: <>&quot;Fastest&quot; with no interval attached is a slogan</>, no: true },
            { text: <>The interval is the one number every tracker <b className="text-ink">chooses and can publish</b></> },
            { text: <>RestockWire&apos;s is <b className="text-ink">{SPEED.fastSec} seconds</b>; hold us to it</>, step: true },
          ]} />
        </Section>

        {/* setup */}
        <Section id="setup" h2="How do you set up an iPhone Duo restock alert?" lead={setupLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Choose the iPhone, storage and color", hint: "an alert is one exact configuration; a second acceptable color is a second alert" },
            { title: "Tick the stores within your reach", hint: "nearest first, each with an estimated drive time" },
            { title: "Put RestockWire on your Home Screen", hint: <Inline text={`on iPhone, then allow notifications ([step by step](/phone-alerts))`} facts={facts} /> },
            { title: "Reserve from the push", hint: "open apple.com from it and check out with in-store pickup at the store the push names" },
          ]} />
          <h3 className="mt-7 text-lg font-semibold">Which stores belong on the alert?</h3>
          <p className="mt-2 text-ink-2">The two or three you could stand in by <b className="text-ink">9 AM</b>, and the ones that restock most often.</p>
          <StatGrid cols={2} className="mt-4">
            {bw
              ? <Stat value={pct(bw.share)} label={<>of the {n(rt.n)} confirmed US Duo restocks since {since} landed between {hl(bw.from)} and {hl(bw.to)} local time</>} tone="accent" />
              : <Stat value="—" label={<>the hour-by-hour picture lives on <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">when the iPhone Duo restocks</Link></>} tone="muted" />}
            {top && topStore
              ? <Stat value={n(top.restocks)} label={<><Link href={storePath(topStore)} className="underline underline-offset-2">{appleName(topStore)}</Link> · the most confirmed Duo restocks since {since} · {top.days} days</>} />
              : <Stat value="—" label="the store with the most restocks appears here as they are confirmed" tone="muted" />}
          </StatGrid>
          <Points className="mt-4" items={[
            { text: <>A store you cannot reach in the morning is a weaker pick than a farther one you can</>, no: true },
          ]} />
          <LinkRow links={[{ label: "When the iPhone Duo restocks", href: "/when-does-iphone-duo-restock" }, { label: "Which iPhone Duo restocks most", href: "/iphone-duo-most-restocked-stores" }, { label: "iPhone Duo near me", href: "/iphone-duo-in-stock-near-me" }]} />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href={setupHref} className="btn btn-primary">Alert me on my stores</Link>
            <span className="text-sm text-ink-3">From that moment your stores are read every {SPEED.fastSec} seconds.</span>
          </div>
          <Figure id="apple-store-night-vancouver" />
        </Section>

        {/* cost */}
        <Section id="cost" h2="How much do iPhone Duo alerts cost?" lead={costLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={`$${PLANS.plus.priceUsd}`} unit="/ month" label={<>{PLANS.plus.limit} alert rules · {PLANS.plus.name}</>} tone="accent" />
            <Stat value={`$${PLANS.pro.priceUsd}`} unit="/ month" label={<>{PLANS.pro.limit} alert rules · {PLANS.pro.name}</>} />
            <Stat value={`$${PLANS.max.priceUsd}`} unit="/ month" label={<>{PLANS.max.limit} alert rules · {PLANS.max.name}</>} />
          </StatGrid>
          <Points className="mt-5" items={[
            { text: <>Same {SPEED.fastSec}-second reads and ~{SPEED.alertSec}-second push on every plan · live stock and the restock log cost nothing to browse</> },
            { text: <><b className="text-ink">{PLANS.plus.limit} alerts</b> = one configuration at {PLANS.plus.limit} stores, or two at five: enough for one metro area</> },
            { text: <>{PLANS.pro.name} and {PLANS.max.name}: more colors, more people, or a longer drive radius</> },
          ]} />
          <LinkRow links={[{ label: "Pricing", href: "/pricing" }]} />
        </Section>

        {/* when it arrives */}
        <Section id="when-it-arrives" h2="What do you do in the seconds after the push?" lead={arrivesLead} facts={facts}>
          <StepStrip className="mt-5 lg:grid-cols-4!" steps={[
            { title: "Signed in before it comes", hint: "Apple Pay or a card and your address already saved; typing an address during a restock is how the phone is lost" },
            { title: "Tap → \"I'll pick it up\"", hint: "at the store the push names; if that store already reads unavailable, try your other stores, since one lot often reaches several" },
            { title: "Finish the checkout", hint: "the reservation is the order; Apple e-mails when it is ready and names the pickup window" },
            { title: "Bring what Apple asks for", hint: <Inline text={`the order number or QR code from the pickup e-mail and a government-issued photo ID ([Apple: Shipping & Pickup help](${APPLE_HELP}))`} facts={facts} /> },
          ]} />
          <LinkRow links={[{ label: "Tap by tap: the 20-second checkout, staged before the window", href: "/iphone-duo-restock-checkout-guide" }, { label: "The wider plan: how to get an iPhone Duo", href: "/how-to-buy-an-iphone-duo-in-store" }, { label: "What apple.com's pickup wording means", href: "/apple-store-pickup-explained" }]} />
          <p className="mt-5 text-sm text-ink-3">Cite this page: quote any figure with a link to it. RestockWire is independent and not affiliated with Apple; every number is its own observation of apple.com pickup availability.</p>
          <div className="mt-5"><Link href={setupHref} className="btn btn-primary">Set up an alert</Link></div>
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Alerts, answered" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`${n(ALL_STORES.length)} Apple Stores in ${INTL_CODES.length + 1} countries`} since={TRACKING_SINCE_US} /></div>
    </div>
  );
}
