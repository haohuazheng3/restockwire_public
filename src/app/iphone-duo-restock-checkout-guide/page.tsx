/**
 * /iphone-duo-restock-checkout-guide: the 20-second checkout, told in pictures and keywords. Everything except the
 * last four taps is done before the restock — Apple's checkout staged on the exact configuration, kept open through
 * the hour the reader's stores usually restock — so the push leaves Pickup, the store, the first slot and Apple Pay.
 * Each step is a title, two or three keyword lines and a hand-drawn illustration (CheckoutMocks), never Apple's
 * screens; the sentences live in the FAQ and the HowTo schema. Every number is live.
 */
import type { Metadata } from "next";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { Figure } from "@/components/content/Figure";
import { RichFaq, SourceList } from "@/components/content/RichFaq";
import { emptyFacts } from "@/lib/content/facts";
import type { Faq, Source } from "@/lib/content/types";
import { AlertBannerMock, AutoLockMock, CheckoutSheetMock, RestockWindowMock, StorePickMock, TermsMock, TimeSlotMock } from "@/components/content/CheckoutMocks";
import { PART_INDEX, STORES } from "@/lib/apple/catalog";
import { SPEED } from "@/lib/plans";
import { TRACKING_SINCE_US, siteFacts } from "@/lib/content/siteFacts";
import { busiestWindow, duoRestockTimes, rangeLabel } from "@/lib/content/restockTimes";
import { medianBand } from "@/lib/stock/sellouts";
import { alertHref } from "@/lib/seo/enrich";
import { Do, Dont, Points, Stat, StatGrid, Swap, type Point } from "@/components/ui/Viz";

export const dynamic = "force-dynamic";

const PATH = "/iphone-duo-restock-checkout-guide";
const TITLE = "iPhone Duo Restock Checkout Guide: Reserve in 20 Seconds";
const SITE = "https://restockwire.com";
const APPLE_PICKUP = "https://www.apple.com/shop/shipping-pickup";
const APPLE_PAY = "https://support.apple.com/apple-pay";
const APPLE_STORE_APP = "https://apps.apple.com/us/app/apple-store/id375380948";
const WIKI_APPLE_PAY = "https://en.wikipedia.org/wiki/Apple_Pay";

const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));

/** Seconds the reader spends: four taps after the push lands. */
const YOU_SEC = 20;

export async function generateMetadata(): Promise<Metadata> {
  const t = await duoRestockTimes("us");
  const band = t.sellout ? medianBand(t.sellout.medianSec) : "about a minute";
  const description = `An iPhone Duo listing lasts ${band}. Stage Apple's checkout first and the push leaves four taps: Pickup, the store, the first slot, Apple Pay: ${YOU_SEC} s.`;
  return {
    title: { absolute: `${TITLE} · RestockWire` },
    description,
    alternates: { canonical: PATH },
    openGraph: { type: "article", siteName: "RestockWire", title: TITLE, description, url: PATH },
  };
}

/** One keyword line per step card; `plain` is its full sentence for the HowTo schema. */
type GuidePoint = Point & { plain: string };
interface Step { title: string; points: GuidePoint[]; art: React.ReactNode }

function StepCard({ step, index }: { step: Step; index: number }) {
  return (
    <li id={`step-${index}`} className="pane flex scroll-mt-24 flex-col p-5 sm:p-6">
      <div className="flex items-center gap-3"><span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-[var(--accent-ink)]">{index}</span><h3 className="text-lg font-semibold leading-tight">{step.title}</h3></div>
      <Points items={step.points} className="mt-3" />
      <div className="mt-5 flex flex-1 items-end justify-center pt-8">{step.art}</div>
    </li>
  );
}

/** The four taps as a row of numbered pills. */
function TapFlow({ taps }: { taps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-2" aria-label="Four taps after the push">
      {taps.map((t, i) => (
        <li key={t} className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-[var(--pane-solid)] py-1 ps-1 pe-3.5 text-sm font-semibold text-ink">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-[var(--accent-ink)]">{i + 1}</span>{t}
          </span>
          {i < taps.length - 1 && <span aria-hidden className="text-ink-3">→</span>}
        </li>
      ))}
    </ol>
  );
}

export default async function GrabRestockGuide() {
  const [t, f] = await Promise.all([duoRestockTimes("us"), siteFacts()]);
  const facts = emptyFacts();
  const sell = t.sellout;
  const band = sell ? medianBand(sell.medianSec) : "about a minute";
  /** "in the 60–80 seconds before it sells out" / "in the minute before it sells out". */
  const h1Band = sell ? medianBand(sell.medianSec) : "minute";
  const w = busiestWindow(t.byHour);
  const window = rangeLabel(w.from, w.to);
  const pattern = t.peakHour != null;
  const ds = f.duoSellout;
  const top = t.byPart[0];
  const topItem = top ? PART_INDEX.get(top.partNumber) : undefined;
  const topName = topItem ? `${topItem.storage} ${topItem.color}` : "512GB Star White";
  const topShare = top && t.n ? top.restocks / t.n : 0;
  const alert = alertHref({ model: "duo" });
  const reserveAt = SPEED.alertSec + YOU_SEC;
  const budget = [
    { label: "Restock confirmed → push", sec: SPEED.alertSec, tone: "bg-ink/25" },
    { label: "Your four taps", sec: YOU_SEC, tone: "bg-accent" },
    { label: sell ? `Median listing: ${sell.medianSec} s` : "Median listing", sec: sell ? Math.max(sell.medianSec - YOU_SEC - SPEED.alertSec, 10) : 60, tone: "bg-ink/10" },
  ];
  const total = budget.reduce((a, b) => a + b.sec, 0);
  const taps = ["Pickup – In-Store", "The store it named", "First slot", "Apple Pay"];

  const before: Step[] = [
    {
      title: "Know your hour",
      points: [
        { text: <>Staged <b className="text-ink">10 minutes ahead</b> of it</>, plain: "Have everything staged ten minutes before the window opens" },
        pattern
          ? { text: <><b className="text-ink">{window}</b> store local time: <b className="text-ink">{pct(w.share)}</b> of US Duo restocks</>, plain: `${pct(w.share)} of US iPhone Duo restocks land ${window} in the store's local time` }
          : { text: <>Each store page shows its usual hour</>, plain: "Each store page shows its usual restock hour" },
        { text: <>Signed in? <Link href="/account#restock-times" className="underline underline-offset-2">your own stores&apos; hours</Link></>, plain: "Members see their own stores' restock hours on the dashboard" },
      ],
      art: <RestockWindowMock />,
    },
    {
      title: "Stage Apple's checkout",
      points: [
        { text: <>In the <a href={APPLE_STORE_APP} target="_blank" rel="noopener" className="underline underline-offset-2">Apple Store app</a>, pick the exact <b className="text-ink">storage + colour</b></>, plain: "In the Apple Store app, pick the exact storage and colour" },
        { text: <>Go on to <b className="text-ink">Delivery &amp; Pickup</b> with ZIP and <a href={APPLE_PAY} target="_blank" rel="noopener" className="underline underline-offset-2">Apple Pay</a> filled in</>, plain: "Continue to the Delivery & Pickup sheet with ZIP, address and Apple Pay filled in" },
        { text: <>Keep delivery selected and <b className="text-ink">wait on this sheet</b></>, plain: "Keep delivery selected and wait on this sheet" },
      ],
      art: <CheckoutSheetMock />,
    },
    {
      title: "Terms ticked · screen awake",
      points: [
        { text: <>Fastest: <b className="text-ink">unlocked, one full payment</b>, no box at all</>, plain: "Unlocked and paid in full shows no agreement box" },
        { text: <>Carrier plan or financing? Tick <b className="text-ink">I agree</b> now</>, plain: "With a carrier plan or financing, tick I agree to the above terms now" },
        { text: <>Auto-Lock → <b className="text-ink">Never</b>; touch the sheet every 10–15 min</>, plain: "Set Auto-Lock to Never for the window and touch the sheet every 10–15 minutes" },
      ],
      art: <TermsMock />,
    },
  ];
  const during: Step[] = [
    {
      title: "Read the push, skip the tap",
      points: [
        { text: <>Note the <b className="text-ink">store name</b>, then swipe back to the app</>, plain: "Note the store name and swipe back to the Apple Store app" },
        { text: <>A tap opens Safari and a brand-new checkout</>, plain: "Tapping the notification opens apple.com in Safari with a brand-new checkout", no: true },
        { text: <>It arrives <b className="text-ink">~{SPEED.alertSec} s</b> after two matching checks</>, plain: `The push arrives about ${SPEED.alertSec} seconds after two matching checks` },
      ],
      art: <AlertBannerMock />,
    },
    {
      title: "Pickup, then the named store",
      points: [
        { text: <>Tap <b className="text-ink">Pickup – In-Store</b></>, plain: "Tap Pickup – In-Store on the sheet" },
        { text: <>Tap the store showing <b className="text-ink">Available Today</b></>, plain: "Tap the store the alert named, the one showing Available Today" },
        { text: <>Row still unavailable? Go back, tap Pickup again</>, plain: "If the row still reads unavailable, go back and tap Pickup again" },
      ],
      art: <StorePickMock />,
    },
    {
      title: "Earliest slot",
      points: [
        { text: <>Pick the <b className="text-ink">first time</b> on the list</>, plain: "Pick the first pickup time on the list" },
        { text: ds ? <>Last week, <b className="text-ink">{pct(ds.within30)}</b> of restocks were over inside 30 s</> : <>Some restocks are over inside 30 s</>, plain: ds ? `${pct(ds.within30)} of last week's Duo restocks were over inside 30 seconds` : "Some restocks are over inside 30 seconds" },
        { text: <>Any slot gets the same phone</>, plain: "Any slot gets the same phone" },
      ],
      art: <TimeSlotMock />,
    },
    {
      title: "Apple Pay, and it is yours",
      points: [
        { text: <>Double-click, Face ID, <b className="text-ink">reserved</b></>, plain: "Double-click the side button, confirm with Face ID, and the order is placed" },
        { text: <>Face ID failed? Enter the passcode, do <b className="text-ink">not</b> tap Pay again</>, plain: "If Face ID fails, enter the passcode; do not tap the pay button again" },
        { text: <>At the store: QR code + photo ID</>, plain: "At the store, show the order's QR code and a photo ID" },
      ],
      art: <AutoLockMock />,
    },
  ];
  const steps = [...before, ...during];

  const wrong: [string, string][] = [
    ["The alert names a different colour", "Decide in advance · switching on the sheet costs ~10 s"],
    ["The sheet reset, terms un-ticked", "Rebuild it now · touch it every 10–15 min"],
    ["Pickup still reads unavailable", "Back → Pickup again, for a fresh answer"],
    ["Face ID failed", "Passcode · never a second Pay tap"],
    ["The slot vanished", "Take the next one · none left? wait for the next alert"],
  ];

  const faq: Faq[] = [
    { q: "What if the restock is a different color or storage from the one I staged?", a: `Switching on the sheet costs about ten seconds, so decide beforehand whether you would take it. Better: stage the configuration that returns most${topShare ? ` (${topName}: ${pct(topShare)} of all US Duo restocks from ${longDate(t.since)} on)` : ""} and put your alerts on exactly that one ([most-restocked configurations](/iphone-duo-most-restocked-stores)).` },
    { q: "Should I buy unlocked or through a carrier for a faster checkout?", a: "Unlocked and paid in full: no agreement box, no eligibility check, fewer things to fail at the last second. A carrier plan works if you tick the agreement before the window and again whenever the sheet reloads." },
    { q: "Can I stage the checkout in Safari or on a Mac instead of the app?", a: "Yes: apple.com has the same Delivery & Pickup sheet, so Safari on an iPhone, iPad or a Mac with Apple Pay works. A second device staged as backup is fine as long as you finish only one order." },
    { q: "Will RestockWire place the order for me?", a: `No: RestockWire tells you within seconds that a store lists your configuration, and you make the reservation on apple.com. It reads the same public pickup availability anyone can, every ${SPEED.fastSec} seconds at the stores in your alerts, and is independent of Apple.` },
  ];
  const sources: Source[] = [
    { label: "Apple: Delivery and Pickup, how pickup and the hold work", url: APPLE_PICKUP },
    { label: "Apple Support: Apple Pay, paying with Face ID", url: APPLE_PAY },
    { label: "App Store: the Apple Store app", url: APPLE_STORE_APP },
    { label: "Wikipedia: Apple Pay", url: WIKI_APPLE_PAY },
  ];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${SITE}${PATH}`, url: `${SITE}${PATH}`, name: TITLE, about: { "@id": `${SITE}/#organization` }, isPartOf: { "@id": `${SITE}/#website` }, dateModified: t.at },
      {
        "@type": "HowTo", name: "Reserving an iPhone Duo restock for Apple Store pickup in about 20 seconds", totalTime: "PT20S",
        description: `Stage Apple's checkout on the exact configuration ahead of the restock window, then answer the push in four taps: Pickup – In-Store, the store it named, the first time slot, Apple Pay. A typical iPhone Duo listing lasts ${band}.`,
        supply: [{ "@type": "HowToSupply", name: "The Apple Store app or apple.com, signed in, Apple Pay set up" }, { "@type": "HowToSupply", name: "A RestockWire alert on that configuration at the stores you can reach" }],
        step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, url: `${SITE}${PATH}#step-${i + 1}`, text: `${s.points.map((p) => (p.no ? `Do not: ${p.plain}` : p.plain)).join(". ")}.` })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:pt-12">
      <JsonLd data={ld} />

      {/* hero */}
      <section className="grid items-center lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div>
          <div className="eyebrow mb-4">Checkout drill · about {YOU_SEC} seconds</div>
          <h1 className="text-4xl sm:text-6xl display">How do I check out an iPhone Duo restock in the {h1Band} before it sells out?</h1>
          <p className="mt-5 max-w-xl text-lg text-ink-2"><b className="text-ink">Four taps after the push</b>, because Apple&apos;s checkout is already staged before the restock.</p>
          <div className="mt-5"><TapFlow taps={taps} /></div>
          {sell && <p className="mt-5 max-w-xl text-sm text-ink-3"><b className="text-ink">{sell.medianSec} s</b> is the median across {n(sell.n)} timed US restocks. The drill takes about <b className="text-ink">{YOU_SEC}</b>.</p>}
          <div className="mt-7 flex gap-3 flex-wrap">
            <a href="#before" className="btn btn-primary btn-lg">Go to the steps</a>
            <Link href={alert} className="btn btn-ghost btn-lg">Start an alert</Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm"><CheckoutSheetMock /></div>
      </section>

      {/* budget */}
      <section className="pane mt-14 p-6 sm:p-8" aria-labelledby="budget-h">
        <h2 id="budget-h" className="text-2xl sm:text-4xl display">How many seconds does a restock give you?</h2>
        <p className="mt-3 text-ink-2"><b className="text-ink">{sell ? `About ${band}.` : "About a minute."}</b> {sell ? <>{pct(sell.within2min)} were gone inside two minutes; median of {n(sell.n)} timed US restocks since {longDate(t.since)}.</> : <>Going by every restock timed so far.</>}</p>
        <StatGrid cols={3} className="mt-5">
          <Stat value={sell ? `${sell.medianSec}` : "~60"} unit="s" label="Median listing before sell-out" />
          <Stat value={`${SPEED.alertSec}`} unit="s" label="Restock confirmed → push on your phone" />
          <Stat value={`${YOU_SEC}`} unit="s" label="Your four taps, after one practice run" tone="accent" />
        </StatGrid>
        <div className="mt-5 flex h-10 w-full overflow-hidden rounded-full border border-line-2" role="img" aria-label={budget.map((b) => `${b.label}: ${b.sec} seconds`).join("; ")}>
          {budget.map((b) => <div key={b.label} className={`${b.tone} flex items-center justify-center px-2 text-[11px] font-semibold text-ink`} style={{ width: `${(b.sec / total) * 100}%` }} title={`${b.label}: ${b.sec} s`}><span className="truncate">{b.sec} s</span></div>)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-3">{budget.map((b) => <span key={b.label} className="inline-flex items-center gap-1.5"><span className={`rounded-sm h-2 w-2 ${b.tone}`} />{b.label}</span>)}</div>
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2 text-sm text-ink-2"><Do /><span>From the staged sheet: reserved by <b className="text-ink">second {reserveAt}</b>{ds ? <>, ahead of <b className="text-ink">~{pct(1 - ds.within30)}</b> of sell-outs logged last week</> : null}</span></div>
          <div className="flex items-start gap-2 text-sm text-ink-3"><Dont /><span>From the app&apos;s home screen: model, storage, colour, address, <b>second 90</b>, too late</span></div>
        </div>
        <p className="mt-4 text-xs text-ink-3">Each lifetime falls between two of our checks ({SPEED.fastSec} s apart at alert stores), so it is an upper bound. <Link href="/how-fast-does-iphone-duo-sell-out" className="hover:underline underline-offset-2">Seconds per restock, every one</Link>.</p>
      </section>

      {/* steps: before */}
      <section id="before" className="mt-16 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-2xl sm:text-4xl display">Ten minutes before</h2>
          <span className="text-sm text-ink-3">Three set-ups · ahead of your stores&apos; hour</span>
        </div>
        <ol className="mt-6 grid md:grid-cols-3 gap-4">
          {before.map((s, i) => <StepCard key={s.title} step={s} index={i + 1} />)}
        </ol>
      </section>

      {/* steps: during */}
      <section id="during" className="mt-14 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="text-2xl sm:text-4xl display">The moment the push lands</h2>
          <span className="text-sm text-ink-3">Four taps · nothing else until Apple confirms on screen</span>
        </div>
        <ol className="mt-6 grid md:grid-cols-2 xl:grid-cols-4 gap-4">
          {during.map((s, i) => <StepCard key={s.title} step={s} index={before.length + i + 1} />)}
        </ol>
      </section>

      {/* our view */}
      <section className="mt-16 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="pane p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl display">Three swaps that save seconds</h2>
          <p className="mt-2 text-sm text-ink-2">Stage everything, leave four taps. These changes cut the most time.</p>
          <ol className="mt-5 grid sm:grid-cols-3 gap-3">
            <Swap no="Staging any configuration" yes="Staging the one your alerts watch" why={topShare ? <>{topName} is {pct(topShare)} of US Duo restocks; a mismatch costs ~10 s.</> : <>Alerts on the staged configuration at two or three stores; a mismatch costs ~10 s.</>} />
            <Swap no="Tapping the notification" yes="Reading it and swiping to the app" why="The push opens a fresh apple.com in Safari; your staged sheet is in the app." />
            <Swap no="Carrier plan with installments" yes="Unlocked, one full payment" why="No agreement box and no eligibility check at the last step." />
          </ol>
          <div className="mt-4 flex flex-wrap text-xs gap-2">
            <span className="chip chip-sm pointer-events-none">Auto-Lock → Never saves 3–4 s</span>
            <span className="chip chip-sm pointer-events-none">Backup device staged · finish only one order</span>
          </div>
        </div>
        <div className="pane p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl display">When something breaks</h2>
          <table className="mt-4 w-full text-sm">
            <thead><tr className="text-start text-xs uppercase tracking-wide text-ink-3"><th className="pb-2 font-semibold">Problem</th><th className="pb-2 font-semibold">Fix</th></tr></thead>
            <tbody>
              {wrong.map(([a, b]) => (
                <tr key={a} className="border-t border-line align-top">
                  <td className="pe-3 py-2.5 text-ink-3">{a}</td>
                  <td className="py-2.5 font-medium text-ink">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* faster? */}
      <section className="pane p-6 sm:p-8 mt-6">
        <h2 className="text-2xl sm:text-3xl display">Can a person go any faster?</h2>
        <p className="mt-2 text-sm text-ink-2"><b className="text-ink">Barely.</b> The push is the earliest honest signal; everything after it is practice.</p>
        <StatGrid cols={3} className="mt-5">
          <Stat value={`~${YOU_SEC}`} unit="s" label="This drill, after one practice run" tone="accent" />
          <Stat value="8–12" unit="s" label="Human floor: push plus four taps, eyes on the sheet" />
          <Stat value="✗" label="Auto-ordering scripts: against Apple's terms, risky for your account. Not offered here." tone="muted" />
        </StatGrid>
        <ul className="mt-5 grid gap-2 text-sm text-ink-2 sm:grid-cols-2">
          <li className="flex items-start gap-2"><Do /><span>{YOU_SEC} practised seconds beat a listing that lasts {band}</span></li>
          <li className="flex items-start gap-2"><Do /><span>The stores in your alerts: on the <b className="text-ink">{SPEED.fastSec}-second</b> wire</span></li>
          <li className="flex items-start gap-2"><Do /><span>A first &quot;available&quot; is re-asked ~1 s later; the push follows ~{SPEED.alertSec} s after they match</span></li>
          {ds && <li className="flex items-start gap-2 text-ink-3"><Dont /><span>Checking once a minute catches <b>{pct(ds.caught.m1)}</b> of Duo restocks; once in 5 minutes, <b>{pct(ds.caught.m5)}</b></span></li>}
        </ul>
        <p className="mt-4 text-xs text-ink-3">Cite this page: quote the drill or its numbers with a link back. RestockWire is independent of Apple.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Link href={alert} className="btn btn-primary">Start an alert</Link><Link href="/account#restock-times" className="btn btn-ghost">My stores&apos; restock hours</Link><Link href="/how-to-buy-an-iphone-duo-in-store" className="btn btn-ghost">The full buying plan</Link></div>
      </section>

      <div className="mx-auto mt-10 max-w-3xl"><Figure id="phone-card-payment" /></div>
      <div className="mx-auto mt-10 max-w-3xl"><RichFaq items={faq} facts={facts} title="Checkout questions" /></div>
      <div className="mx-auto mt-8 max-w-3xl"><SourceList sources={sources} facts={facts} where={`all ${STORES.length} US Apple Stores`} since={longDate(TRACKING_SINCE_US)} /></div>
    </div>
  );
}
