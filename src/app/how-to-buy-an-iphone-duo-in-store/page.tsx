/**
 * /how-to-buy-an-iphone-duo-in-store: the wider plan, told in numbers and keywords. Every H2 is a question an answer engine
 * can quote, with one answer-first sentence under it; everything else is tiles, tables, keyword lines, swaps and a
 * step strip. All numbers are live from the restock log.
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
import { PART_INDEX, STORES, appleName, catalogFor, storeByNumber, storeLocality, storePath } from "@/lib/apple/catalog";
import { PLANS, SPEED } from "@/lib/plans";
import { WEEKDAYS, WEEKDAY_MIN_SPAN, hourLabel, localStamp, siteFacts } from "@/lib/content/siteFacts";
import { DUO_LAUNCH_DAY, DUO_PICKUP_RESUMED, busiestWindow, duoRestockTimes, hourShare } from "@/lib/content/restockTimes";
import { recentByConfig } from "@/lib/stock/recent";
import { medianBand } from "@/lib/stock/sellouts";
import { fmtPrice, listWords, plural } from "@/lib/seo/enrich";
import { Measured, Points, Stat, StatGrid, StepStrip, Swap } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const TITLE = "How to Buy an iPhone Duo In Store While It Is Sold Out";
const DESCRIPTION = `Apple Stores restock the iPhone Duo daily; it sells out in minutes. The hour it lands, the stores and configurations with the best odds, and 7 steps to reserve.`;

export const metadata: Metadata = {
  title: { absolute: `${TITLE} · RestockWire` },
  description: DESCRIPTION,
  alternates: { canonical: "/how-to-buy-an-iphone-duo-in-store" },
  openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description: DESCRIPTION, url: "/how-to-buy-an-iphone-duo-in-store" },
};

const NEWSROOM = "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/";
const MACRUMORS = "https://macrumors.com/2026/10/24/apple-store-pickup-iphone-duo-us/";
const PICKUP = "https://www.apple.com/shop/shipping-pickup";
const PICKUP_HELP = "https://www.apple.com/shop/help/shipping_delivery";

const n = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const DAY = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" });
const LONG = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" });
const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
/** "Sun, Nov 2" / "October 29, 2026" for a YYYY-MM-DD local date. */
const dayLabel = (date: string) => DAY.format(new Date(`${date}T12:00:00Z`));
const longDate = (date: string) => LONG.format(new Date(`${date}T12:00:00Z`));

/** "9 and 11 AM" when both ends share a meridiem, else "10 AM and noon". */
function windowLabel(from: number, to: number): string {
  const a = hourLabel(from), b = hourLabel(to % 24);
  const plain = /^\d+ [AP]M$/;
  if (plain.test(a) && plain.test(b) && a.slice(-2) === b.slice(-2)) return `${a.slice(0, -3)} and ${b}`;
  return `${a} and ${b}`;
}
/** "[Apple Fifth Avenue](/apple-stores/…)" for a store number. */
function storeLink(storeNumber: string): string {
  const s = storeByNumber(storeNumber);
  return s ? `[${appleName(s)}](${storePath(s)})` : storeNumber;
}
/** "Nov 2, 9:31 AM local time" in the store's own zone. */
function stamp(iso: string, storeNumber: string): string {
  const s = storeByNumber(storeNumber);
  return s ? `${localStamp(iso, s)} local time` : `${ET.format(new Date(iso))} ET`;
}
function cfgName(partNumber: string): string {
  const i = PART_INDEX.get(partNumber);
  return i ? `${i.storage} ${i.color}` : "an iPhone Duo";
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

export default async function HowToGetDuo() {
  const [t, f, facts, recent] = await Promise.all([duoRestockTimes("us"), siteFacts(), getFacts(), recentByConfig({ country: "us" })]);
  const have = t.n > 0 && !t.unknown;
  const since = longDate(t.since);
  const win = busiestWindow(t.byHour);
  const window = windowLabel(win.from, win.to);
  const night = hourShare(t.byHour, 0, 6);
  const evening = hourShare(t.byHour, 18, 24);
  const typical = t.sellout ? `about ${medianBand(t.sellout.medianSec)}` : null;
  const ds = f.duoSellout;
  const items = catalogFor("duo");
  const prices = items.map((i) => i.price);
  const low = Math.min(...prices), high = Math.max(...prices);
  const storages = [...new Set(items.map((i) => i.storage))];
  const colors = [...new Set(items.map((i) => i.color))];
  const parts = t.byPart.map((p) => ({ ...p, item: PART_INDEX.get(p.partNumber), share: t.n ? p.restocks / t.n : 0 }));
  const top = parts.find((p) => p.restocks > 0 && p.item);
  const topName = top?.item ? `${top.item.storage} ${top.item.color}` : null;
  const topPrice = top ? items.find((i) => i.partNumber === top.partNumber)?.price : undefined;
  const storageRows = storages.map((storage) => {
    const restocks = parts.filter((p) => p.item?.storage === storage).reduce((a, p) => a + p.restocks, 0);
    return { storage, restocks, share: t.n ? restocks / t.n : 0, price: items.find((i) => i.storage === storage)?.price ?? 0 };
  });
  const bestStorage = [...storageRows].sort((a, b) => b.restocks - a.restocks)[0];
  const colorRows = colors.map((color) => ({ color, restocks: parts.filter((p) => p.item?.color === color).reduce((a, p) => a + p.restocks, 0) })).sort((a, b) => b.restocks - a.restocks);
  const regions = t.byRegion.filter((r) => r.restocks > 0).slice(0, 3);
  const topStores = t.topStores.slice(0, 5);
  const drop = t.drops[0];
  const last7 = [...t.daily].slice(-7).reverse();
  const busiest = [...t.daily].filter((d) => d.restocks > 0).sort((a, b) => b.restocks - a.restocks)[0];
  const repN = t.reports.reduce((a, d) => a + d.restocks, 0);
  const daysSinceLaunch = Math.max(1, Math.floor((Date.parse(t.at) - Date.parse(`${DUO_LAUNCH_DAY}T00:00:00Z`)) / 86400_000));
  const todayLine = t.today ? `${plural(t.today.restocks, "restock")} at ${plural(t.today.stores, "store")}` : "no count yet";

  const waysTable: Block = { t: "table", head: ["Route", "What you end up with", "Time to a phone", "RestockWire's read"], rows: [
    ["Pickup reservation the moment a store restocks", "A phone held in your name at a store you choose, at list price", "Days, with the right stores watched at the right hour", "The one route measured in days"],
    ["Delivery order on apple.com", "A ship date that slides as Apple catches up", `A day after launch, MacRumors saw estimates [pushing into late January](${MACRUMORS}), into 2027`, "Fine if you can wait"],
    ["A carrier store or Best Buy", "Their own allocation, often tied to a plan", "Unknown: we do not track them", "Ask them; we have no odds to give"],
  ], caption: "Three routes to an iPhone Duo today", source: `[MacRumors, ${longDate(DUO_PICKUP_RESUMED)}](${MACRUMORS}); RestockWire restock log` };

  const whenLead = have
    ? `Between **${window}** local time, mostly: that window holds **${pct(win.share)}** of the ${n(t.n)} confirmed US restocks since ${since}${t.peakWeekday != null ? `, and **${WEEKDAYS[t.peakWeekday]}** leads the week` : ""}.`
    : "Daily, clustered in the morning. Apple publishes no schedule; the hours RestockWire observes below are the nearest thing to one.";

  const storesTable: Block | null = topStores.length ? { t: "table", head: ["Store", `Restocks since ${since}`, "Restock days", "Usual hour", "Most recent"], rows: topStores.map((s) => {
    const store = storeByNumber(s.storeNumber);
    return [`${storeLink(s.storeNumber)}${store ? ` · ${storeLocality(store)}` : ""}`, n(s.restocks), String(s.days), s.peakHour != null ? hourLabel(s.peakHour) : "not enough data", stamp(s.lastAt, s.storeNumber)];
  }), caption: "Top five US Apple Stores by confirmed iPhone Duo restocks", source: "RestockWire restock log" } : null;
  const storageTable: Block = { t: "table", head: ["Storage", "Price, either color", `Restocks since ${since}`, "Share"], rows: storageRows.map((r) => [r.storage, fmtPrice(r.price), n(r.restocks), pct(r.share)]), caption: "iPhone Duo restocks per storage size across all US Apple Stores", source: "RestockWire restock log; prices from [apple.com](https://www.apple.com/shop/buy-iphone/iphone-duo)" };
  const oddsLead = have && topName && topPrice != null && regions[0]
    ? `**${pct(top!.share)}** of confirmed restocks are **${topName}** (${fmtPrice(topPrice)}), the configuration that returns most; the leading states are ${regions.map((r) => `[${r.name}](${r.path})`).join(", ")}.`
    : "The configuration that comes back most and the states where restocks happen most; the ranking builds from RestockWire's confirmed restocks.";

  const supplyLead = have && busiest
    ? `Steady and thin: **${n(t.n)}** confirmed restocks over **${plural(t.days, "day")}** since ${since}, each lot small enough to sell out in minutes.`
    : `Every US Apple Store has been on the wire since ${since}; the daily table builds as restocks are confirmed.`;
  const dailyTable: Block | null = last7.length ? { t: "table", head: ["Day", "Confirmed restocks", "Stores restocked", "Peak hour"], rows: last7.map((d) => [dayLabel(d.date), n(d.restocks), n(d.stores), d.peakHour != null ? hourLabel(d.peakHour) : "—"]), caption: `iPhone Duo restocks per day across all ${STORES.length} US Apple Stores, newest first; today is still counting`, source: "RestockWire restock log; days in each store's local zone" } : null;

  const nav = [
    { id: "ways", label: "Routes" },
    { id: "when", label: "The hour" },
    { id: "odds", label: "Odds" },
    { id: "playbook", label: "Seven steps" },
    { id: "walk-in", label: "Walk-ins" },
    { id: "what-fails", label: "Dead ends" },
    { id: "supply", label: "Supply" },
  ];

  const storageAnswer = storageRows.length >= 2 && t.n > 0
    ? `${bestStorage.storage} returns most, ${pct(bestStorage.share)} of confirmed US restocks since ${since} (${storageRows.map((r) => `${r.storage} ${pct(r.share)}`).join(", ")}), at ${storages[0]} ${fmtPrice(storageRows[0].price)} and ${storages[1]} ${fmtPrice(storageRows[1].price)}. Put alerts on both, lead with ${bestStorage.storage}, and take the first push.`
    : "Put alerts on both; the storage split builds as restocks are confirmed, and [the configuration ranking](/iphone-duo-most-restocked-stores) covers all eight.";
  const faq: Faq[] = [
    { q: "Can I still find an iPhone Duo in an Apple Store this week?", a: `Yes, through pickup restocks: ${n(recent.restocks)} were confirmed in the last 24 hours at ${plural(recent.stores, "store")}, and right now {{duo.storesNow}} of {{duo.storesTotal}} US Apple Stores list at least one configuration${typical ? `. Each listing lasts ${typical}` : ""}.` },
    { q: `${storages[0]} or ${storages[1]}: which is easier to get?`, a: storageAnswer },
    { q: "Once I reserve pickup, is the phone really mine?", a: `Yes: a pickup reservation is an order for that store, and Apple [walks you through pickup by e-mail and notification](${PICKUP}) with your time. Bring the order number and a government photo ID.` },
    { q: "What delivery date will apple.com give me?", a: `The one at checkout, and it moves; a day after launch MacRumors saw estimates [pushing into late January](${MACRUMORS}). RestockWire tracks pickup stock, not delivery dates.` },
    { q: `Are $${PLANS.plus.priceUsd}-a-month alerts worth it here?`, a: `If you want the phone this month, yes: Plus puts ${PLANS.plus.limit} alerts on the ${SPEED.fastSec}-second wire with a push about ${SPEED.alertSec} seconds after a confirmed restock${typical ? `, against listings that last ${typical}` : ""}. If the delivery date works for you, keep the money.` },
  ];
  const sources: Source[] = [
    { label: `Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide, ${longDate(DUO_LAUNCH_DAY)}`, url: NEWSROOM },
    { label: `MacRumors: iPhone Duo Apple Store pickup resumes in the US and Canada, ${longDate(DUO_PICKUP_RESUMED)}`, url: MACRUMORS },
    { label: "Apple: Delivery and Pickup, how in-store pickup works", url: PICKUP },
    { label: "Apple: Shipping & Pickup help", url: PICKUP_HELP },
    { label: "Wikipedia: iPhone", url: "https://en.wikipedia.org/wiki/IPhone" },
  ];

  const site = "https://restockwire.com";
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${site}/how-to-buy-an-iphone-duo-in-store`, url: `${site}/how-to-buy-an-iphone-duo-in-store`, name: TITLE, description: DESCRIPTION, isPartOf: { "@id": `${site}/#website` }, about: { "@id": `${site}/#organization` }, dateModified: t.at },
      {
        "@type": "HowTo", name: "Getting a sold-out iPhone Duo through Apple Store pickup",
        description: `Reserve in-store pickup the second a store restocks. Most restocks land between ${window} local time and sell out in minutes, so stage the account, cover several stores and configurations, and act on the push within seconds.`,
        step: [
          { "@type": "HowToStep", name: "Get apple.com ready", text: "Sign in and save Apple Pay or a card plus your address, so checkout takes seconds.", url: PICKUP },
          { "@type": "HowToStep", name: "Pick two or three reachable stores", text: "A reservation is for one store; each store page lists its usual restock hour.", url: `${site}/apple-stores` },
          { "@type": "HowToStep", name: "Allow a second configuration", text: "Your storage plus the next size, in either color." },
          { "@type": "HowToStep", name: "Put one alert on each store and configuration", text: `Those stores move to ${SPEED.fastSec}-second checks; on iPhone, add the Home Screen app for push notifications.`, url: `${site}/#notify` },
          { "@type": "HowToStep", name: "Reserve straight from the push", text: "Open the link, choose I'll pick it up, pick the store and a time slot, then pay." },
          { "@type": "HowToStep", name: "Watch for Apple's pickup e-mail", text: "Apple confirms the pickup time by e-mail and notification." },
          { "@type": "HowToStep", name: "Collect with the order number and photo ID", text: "Show the order's QR code or number and a government photo ID.", url: PICKUP_HELP },
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
          <div className="eyebrow mb-4">iPhone Duo · getting one</div>
          <h1 className="display text-4xl sm:text-6xl">How to buy an iPhone Duo in store when it is sold out</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2"><b className="text-ink">Reserve pickup the second a store restocks.</b> Ordering and waiting is slower. Know the hour, cover the stores with the best odds, and act on the push within seconds.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/#notify" className="btn btn-primary btn-lg">Start my alerts</Link>
            <Link href="/iphone-duo-restock-checkout-guide" className="btn btn-ghost btn-lg">20-second checkout guide</Link>
          </div>
        </div>
        <StatGrid cols={2}>
          {have ? <Stat value={n(t.n)} label={<>US restocks confirmed since {since} · {n(t.stores)} of {STORES.length} stores</>} /> : <Stat value={STORES.length} label={<>US Apple Stores read every {SPEED.checkSec} seconds</>} />}
          {!recent.unknown ? <Stat value={n(recent.restocks)} label={<>last 24 hours · {plural(recent.stores, "store")}</>} live /> : <Stat value="—" label="last 24 hours: count did not load" tone="muted" />}
          {have ? <Stat value={pct(win.share)} label={<>landed {window}, store local time</>} tone="accent" /> : <Stat value={`${SPEED.fastSec}`} unit="s" label="between checks at alert stores" tone="accent" />}
          {t.sellout ? <Stat value={`${t.sellout.medianSec}`} unit="s" label="median listing before sell-out" tone="warn" /> : <Stat value={`~${SPEED.alertSec}`} unit="s" label="confirmed restock to your phone" />}
        </StatGrid>
      </section>

      <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-sm">
        {nav.map((s) => <a key={s.id} href={`#${s.id}`} className="chip px-3 py-1.5 text-xs">{s.label}</a>)}
      </nav>

      <div className="mt-6 grid gap-5">
        {/* ways */}
        <Section id="ways" h2="Which route gets you an iPhone Duo fastest?" facts={facts}
          lead="**A pickup reservation the moment a store restocks**, measured in days; apple.com delivery gives a sliding date, and carriers or Best Buy are untracked.">
          <BlockView b={waysTable} facts={facts} />
          <Points items={[
            { text: <>Supply reaches stores in small lots; each lot is a restock RestockWire confirms and logs</>, step: true },
            { text: <Inline text={`Pickup slots disappeared at pre-order and [came back ${longDate(DUO_PICKUP_RESUMED)}](${MACRUMORS}), with most stores showing none`} facts={facts} /> },
            { text: <Inline text={`**${fmtPrice(low)}** (${storages[0]}) to **${fmtPrice(high)}** (${storages[storages.length - 1]}) · ${listWords(colors)}`} facts={facts} /> },
            { text: <Inline text={`Apple's first foldable [iPhone](https://en.wikipedia.org/wiki/IPhone), on sale since ${longDate(DUO_LAUNCH_DAY)} ([Apple Newsroom](${NEWSROOM}))`} facts={facts} /> },
          ]} />
          <Figure id="apple-store-crowd-inside" />
        </Section>

        {/* when */}
        <Section id="when" h2="What hour should you be ready?" lead={whenLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={have ? pct(win.share) : "—"} label={<>{window} local time</>} tone="accent" />
            <Stat value={have ? pct(evening) : "—"} label="after 6 PM: rare, not impossible" tone="muted" />
            <Stat value={have ? pct(night) : "—"} label="midnight to 6 AM: overnight drops barely happen" tone="muted" />
          </StatGrid>
          <Points className="mt-5" items={[
            ...(t.latest ? [{ text: <Inline text={`**Last one:** ${cfgName(t.latest.partNumber)} at ${storeLink(t.latest.storeNumber)}, ${stamp(t.latest.at, t.latest.storeNumber)}`} facts={facts} /> }] : []),
            { text: <Inline text={`**So far today:** ${todayLine}`} facts={facts} /> },
            ...(drop ? [{ text: <><b className="text-ink">Largest wave:</b> {plural(drop.stores, "store")} restocked within one half hour, near {ET.format(new Date(drop.at))} ET</> }] : []),
            ...(have && t.peakWeekday == null ? [{ text: <>Busiest weekday: {WEEKDAY_MIN_SPAN} days of data needed, {t.spanDays} so far</>, no: true }] : []),
            { text: <>In that window, be signed in with your phone at hand; alerts on several stores beat refreshing one</>, step: true },
          ]} />
          <Measured>
            <Inline text={`History, not a promise: Apple publishes no restock schedule ([Apple: Delivery and Pickup](${PICKUP})) and the launch is only ${daysSinceLaunch} days old. The hour says when to be ready; the push says when to move.`} facts={facts} />
          </Measured>
          <LinkRow links={[{ label: "iPhone Duo restock hours, store by store", href: "/when-does-iphone-duo-restock" }, { label: "Sell-out times, every restock", href: "/how-fast-does-iphone-duo-sell-out" }]} />
        </Section>

        {/* odds */}
        <Section id="odds" h2="Where are your odds best, by store and configuration?" lead={oddsLead} facts={facts}>
          {regions.length > 0 && (
            <StatGrid cols={3} className="mt-5">
              {regions.map((r, i) => <Stat key={r.slug} value={n(r.restocks)} label={<><Link href={r.path} className="underline underline-offset-2">{r.name}</Link> · {plural(r.stores, "store")} restocked</>} tone={i === 0 ? "accent" : "plain"} />)}
            </StatGrid>
          )}
          {storesTable && <BlockView b={storesTable} facts={facts} />}
          <BlockView b={storageTable} facts={facts} />
          {colorRows.length === 2 && t.n > 0 && (
            <StatGrid cols={2} className="mt-2">
              <Stat value={n(colorRows[0].restocks)} label={<>{colorRows[0].color} · restocks confirmed</>} />
              <Stat value={n(colorRows[1].restocks)} label={<>{colorRows[1].color} · restocks confirmed</>} tone="muted" />
            </StatGrid>
          )}
          <Points className="mt-5" items={[
            { text: <>3 stores × 2 configurations = <b className="text-ink">{plural(6, "alert")}</b>: six chances at a push</>, step: true },
            { text: <>Start with <b className="text-ink">{bestStorage ? `the ${bestStorage.storage}` : "the storage that returns most"}</b> and accept either color</> },
            { text: <><b className="text-ink">Storage matters more</b> than color</> },
            { text: <>Cover <b className="text-ink">two or three</b> reachable stores, not one favorite</> },
          ]} />
          <LinkRow links={[{ label: "Eight configurations, ranked", href: "/iphone-duo-most-restocked-stores" }, { label: "Nearest store with a Duo", href: "/iphone-duo-in-stock-near-me" }, { label: "Every store, live", href: "/in-stock/iphone-duo" }]} />
          <Figure id="foldable-butterfly" />
        </Section>

        {/* playbook */}
        <Section id="playbook" h2="What are the seven steps to a pickup reservation?" facts={facts}
          lead="Stage the account, pick the stores, put one alert on each store × configuration, then **reserve from the push in under a minute**.">
          <StepStrip className="mt-5" steps={[
            { title: "Sign in to apple.com today", hint: <Inline text={`save Apple Pay or a card and your address; checkout must take seconds ([Apple: Delivery and Pickup](${PICKUP}))`} facts={facts} /> },
            { title: "Choose two or three stores", hint: "ones you can reach; every store page shows its usual hour" },
            { title: "Allow a second configuration", hint: "your storage and the next size, either color" },
            { title: "One alert per store × configuration", hint: <Inline text={`[set alerts](/#notify) · on iPhone, [add the Home Screen app](/phone-alerts) first · those stores then go on ${SPEED.fastSec}-second checks`} facts={facts} /> },
            { title: "Reserve from the push", hint: "its link → \"I'll pick it up\" → the store → a time slot → pay; no browsing, no color changes" },
            { title: "Watch for Apple's pickup e-mail", hint: "the reservation is an order; Apple confirms the time by e-mail and notification" },
            { title: "Bring the QR code and a photo ID", hint: <Inline text={`the order number (the e-mail has a QR code) and a government photo ID ([Apple's pickup help](${PICKUP_HELP}))`} facts={facts} /> },
          ]} />
          <StatGrid cols={3} className="mt-6">
            <Stat value={t.sellout ? `${t.sellout.medianSec}` : "~60"} unit="s" label="median iPhone Duo listing before sell-out" tone="warn" />
            <Stat value={`~${SPEED.alertSec}`} unit="s" label="from confirmed restock to your phone" />
            <Stat value="20" unit="s" label={<>four taps, with apple.com checkout staged in advance: <Link href="/iphone-duo-restock-checkout-guide" className="underline underline-offset-2">tap-by-tap guide</Link></>} tone="accent" />
          </StatGrid>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/#notify" className="btn btn-primary">Start my alerts</Link>
            <span className="text-sm text-ink-3"><Inline text={`${PLANS.plus.limit} alerts on Plus for $${PLANS.plus.priceUsd}/month; [all plans](/pricing).`} facts={facts} /></span>
          </div>
          <Figure id="phone-card-payment" />
        </Section>

        {/* walk-in */}
        <Section id="walk-in" h2="Does walking into an Apple Store work?" facts={facts}
          lead="Not reliably: a few people managed it at launch, but **pickup slots are the stock you can count on**.">
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Asking staff when stock arrives" yes="Watching the pickup listing" why="No one outside Apple knows how many units a store keeps back, and staff have no restock schedule to read out." />
            <Swap no="Queueing at the door on a hunch" yes="Reserving the slot from home" why="A walk-in is a gamble; a reservation is a held phone. RestockWire logs the moment a pickup slot appears on apple.com." />
          </ol>
          <Points className="mt-5" items={[
            { text: <>Want it this week? Reserve it</>, step: true },
            { text: <Inline text={`[Apple's announcement](${NEWSROOM}) points buyers to apple.com and the app as well as stores, and says nothing on walk-in quantities`} facts={facts} /> },
            { text: <Inline text={`[MacRumors](${MACRUMORS}) saw long launch-day queues worldwide, with "some lucky customers" leaving with one`} facts={facts} /> },
          ]} />
        </Section>

        {/* what fails */}
        <Section id="what-fails" h2="Which tactics waste your time?" facts={facts}
          lead="Hand-refreshing apple.com, phoning the store, paying a reseller and staying up for a night restock. The numbers show why.">
          <ol className="mt-5 grid gap-3 sm:grid-cols-2">
            <Swap no="Staying up for a night restock" yes={<>Sleep, and be ready by {hourLabel(win.from)}</>} why={<>{have ? pct(night) : "A tiny share"} of confirmed US restocks since {since} landed between midnight and 6 AM local time.</>} />
            <Swap no="Hand-refreshing apple.com" yes={<>A push ~{SPEED.alertSec} s after confirmation</>} why={ds ? <>Of {n(ds.n)} Duo restocks that sold out in the last 7 days, <b>{pct(ds.within30)}</b> lasted 30 seconds or less; a reload each minute catches about {pct(ds.caught.m1)}, each 5 minutes {pct(ds.caught.m5)}, each 15 minutes {pct(ds.caught.m15)}.</> : "Listings last minutes and mostly come and go between two reloads. The exact catch rate shows here once enough of last week's restocks have sold out."} />
            <Swap no="Paying a reseller" yes={<>List price, from {fmtPrice(low)}, when you reserve</>} why="A resale premium on a sold-out phone buys only time." />
            <Swap no="Phoning the store" yes="Checking the store page's usual hour" why="Apple publishes no restock schedule; staff see the same pickup availability as you." />
          </ol>
        </Section>

        {/* supply */}
        <Section id="supply" h2="How much stock has arrived since launch?" lead={supplyLead} facts={facts}>
          <StatGrid cols={3} className="mt-5">
            <Stat value={busiest ? n(busiest.restocks) : "—"} label={busiest ? <>peak day · {dayLabel(busiest.date)} · {plural(busiest.stores, "store")}</> : "peak day: appears with the first restocks"} tone="accent" />
            <Stat value={t.today ? n(t.today.restocks) : "—"} label={t.today ? <>so far today · {plural(t.today.stores, "store")} · still counting</> : "so far today: no count yet"} live={!!t.today} />
            <Stat value={t.reports.length ? n(repN) : "—"} label={t.reports.length ? <>other trackers&apos; launch-week reports, {dayLabel(t.reports[0].date)}–{dayLabel(t.reports[t.reports.length - 1].date)} · kept separate, never added to ours</> : "other trackers' launch-week reports: kept separate, never added"} tone="muted" />
          </StatGrid>
          {dailyTable && <BlockView b={dailyTable} facts={facts} />}
          <p className="mt-4 text-sm text-ink-3">Cite this page: quote any figure here with a link back. RestockWire is independent of Apple and counts only restocks a second check confirms.</p>
          <LinkRow className="mt-2" links={[{ label: "How the numbers are built", href: "/how-restock-alerts-work" }, { label: "Pickup availability explained", href: "/apple-store-pickup-explained" }, { label: "Restock log, today", href: "/restock-log" }]} />
        </Section>
      </div>

      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Buying questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} /></div>
    </div>
  );
}
