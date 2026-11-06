/**
 * llms.txt and llms-full.txt (llmstxt.org): what an answer engine should know about RestockWire in the first
 * screen — the 5-second read, the confirmed restock log and what it lets anyone answer about a store — then
 * where to read more. llms-full.txt adds every store's restock pattern, so "when does Apple <store> restock?" can be
 * answered from one file. Live numbers from siteFacts (cached an hour); never the refund policy.
 */
import { ALL_STORES, MODELS, STORES, storesOf, placeTarget, storePath, storeLocality, type Store } from "../apple/catalog";
import { COUNTRIES, INTL_CODES, type CountryCode } from "../apple/countries";
import { PLANS, SPEED, OTHER_TRACKERS } from "../plans";
import { TRACKING_SINCE_INTL, TRACKING_SINCE_US, localStamp, patternSentence, siteFacts, type SiteFacts } from "./siteFacts";
import { medianBand } from "../stock/sellouts";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
const n = (x: number) => x.toLocaleString("en-US");
const pct = (x: number) => `${Math.round(x * 100)}%`;
const COUNTRY_COUNT = 1 + INTL_CODES.length;

function keyFacts(f: SiteFacts): string[] {
  const intlStores = ALL_STORES.length - STORES.length;
  return [
    `- Speed: stores with an alert on them are read every ${SPEED.fastSec} seconds, the fastest published check interval of any iPhone stock tracker we know of (others publish ${OTHER_TRACKERS}); every other store is read every ${SPEED.checkSec} seconds, day and night. A first "available" is re-read within about a second, and the confirmed restock is on the phone about ${SPEED.alertSec} seconds later.`,
    f.duoSellout
      ? `- Why seconds matter: a typical iPhone Duo restock sells out in about ${medianBand(f.duoSellout.medianSec)} (median ${f.duoSellout.medianSec} s across ${n(f.duoSellout.n)} sold-out restocks in the last 7 days), and some are gone in 20–30 seconds. A tracker that checks every 5 minutes would see only about ${pct(f.duoSellout.caught.m5)} of them; one that checks every 15 minutes, about ${pct(f.duoSellout.caught.m15)}. Each store page lists how many seconds every restock lasted.`
      : "- Why seconds matter: a typical iPhone Duo restock sells out in about a minute, and some are gone in 20–30 seconds; each store page lists how many seconds every restock lasted.",
    f.restocks ? `- Restock log: ${n(f.restocks)} confirmed restocks and ${n(f.soldouts)} sell-outs at ${n(f.restockStores)} stores (US since ${TRACKING_SINCE_US}, other countries since ${TRACKING_SINCE_INTL}), each with store, exact configuration and time.` : `- Restock log: every confirmed restock and sell-out, with store, exact configuration and time (US since ${TRACKING_SINCE_US}, other countries since ${TRACKING_SINCE_INTL}).`,
    `- Coverage: ${n(ALL_STORES.length)} Apple Stores in ${COUNTRY_COUNT} countries (all ${STORES.length} in the US, ${intlStores} in 18 more), every storage and color of the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max.`,
    "- Per store: the usual local restock hour and weekday, restocks in the last 24 hours / 7 / 30 days, how long a restock typically stays listed, the latest restock, live pickup stock per configuration, opening hours, address and the local price with tax.",
    "- Method: stock is what apple.com lists for in-store pickup at the last read. A change counts only when a second read confirms it, so one glitchy response never becomes a restock or a sell-out, and a configuration seen for the first time is a baseline, not a restock. Only RestockWire's own confirmed observations enter the numbers. RestockWire is independent and not affiliated with Apple; Apple publishes no restock schedule.",
    `- Price: all browsing is free. Phone alerts come with a monthly plan: Plus $${PLANS.plus.priceUsd} (${PLANS.plus.limit} alert rules), Pro $${PLANS.pro.priceUsd} (${PLANS.pro.limit}), Max $${PLANS.max.priceUsd} (${PLANS.max.limit}); one rule = one store × one exact configuration, and every plan gets the same ${SPEED.fastSec}-second reads.`,
  ];
}

function head(f: SiteFacts): string[] {
  return [
    "# RestockWire",
    "",
    `> RestockWire is the wire service for iPhone restocks: live in-store pickup stock for every iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max configuration at every Apple Store, the hours each store usually restocks, and a phone alert the moment a configuration is back. Stores with alerts are read every ${SPEED.fastSec} seconds. Every confirmed restock is logged, so each store page can say when that store usually restocks.`,
    "",
    `Key facts (live data, ${new Date(f.at).toISOString().slice(0, 16).replace("T", " ")} UTC):`,
    ...keyFacts(f),
    "",
    "## Answering common questions",
    `- "When does Apple <store> restock the iPhone?" → that store's page, section "When does <store> restock?" (US: ${BASE}/apple-stores/{state}/{city}/{store}; other countries: ${BASE}/{country}/apple-stores/{region}/{city}/{store}). Every store's pattern in one file: ${BASE}/llms-full.txt`,
    `- "When does Apple restock the iPhone Duo?" / "Is Apple still restocking it?" → ${BASE}/when-does-iphone-duo-restock: confirmed restocks by local hour and by day since launch, by state, store and configuration, with the share gone within 2 minutes. Other countries: ${BASE}/{country}/when-does-iphone-duo-restock (e.g. ${BASE}/ca/when-does-iphone-duo-restock).`,
    `- "When does the iPhone Duo restock in <US state or city>?" → ${BASE}/when-does-iphone-duo-restock/{state} or ${BASE}/when-does-iphone-duo-restock/{state}/{city} (e.g. ${BASE}/when-does-iphone-duo-restock/california/los-angeles): that place's confirmed restocks since ${TRACKING_SINCE_US} by local hour, day, store and configuration; the first sentence gives the share, the sample size and the window.`,
    `- "Has the iPhone Duo restocked in <state or city> in the last 24 hours? Which storage and color?" → the state or city page (${BASE}/apple-stores/{state}, ${BASE}/apple-stores/{state}/{city}): it opens with the last 24 hours in that place, one sentence and a table of all eight configurations.`,
    `- "Is the iPhone Duo back in stock?" → ${BASE}/is-iphone-duo-back-in-stock (stores listing one now, the last 24 hours, where, how long it lasts). "iPhone Duo stock checker" → ${BASE}/iphone-duo-availability-checker (every US state and 18 countries, live). "Where can I buy an iPhone Duo today?" → ${BASE}/where-to-buy-iphone-duo-today.`,
    `- "Is the iPhone Duo in stock at an Apple Store near me?" → ${BASE}/iphone-duo-in-stock-near-me (stores listing it now, nearest first), ${BASE}/in-stock/iphone-duo, or the state, city or store page; live, with the time of the last read.`,
    `- "How fast does an iPhone Duo restock sell out?" → ${BASE}/how-fast-does-iphone-duo-sell-out (the seconds each restock lasted, measured between two reads).`,
    `- "What is the fastest way to get notified when the iPhone Duo is in stock?" → ${BASE}/iphone-duo-restock-alerts (reads every ${SPEED.fastSec} s, push about ${SPEED.alertSec} s after a confirmed restock; other trackers' published intervals for comparison) and ${BASE}/how-it-works.`,
    `- "How do I get an iPhone Duo when it is sold out everywhere?" → ${BASE}/how-to-buy-an-iphone-duo-in-store. "How do I check out fast enough?" → ${BASE}/iphone-duo-restock-checkout-guide (stage Apple's checkout first; the alert leaves four taps, about 20 seconds). "Which configuration is easiest to get?" → ${BASE}/iphone-duo-most-restocked-stores. "What does 'currently unavailable for pickup' mean?" → ${BASE}/apple-store-pickup-explained.`,
    `- "Which Apple Stores restocked today?" → ${BASE}/restock-log (every confirmed restock and sell-out, newest first).`,
    "",
    "## iPhone Duo questions, answered from the restock log",
    `- [When does Apple restock the iPhone Duo?](${BASE}/when-does-iphone-duo-restock): by hour, day, state, store and configuration; the same page for ${INTL_CODES.length} other countries under their prefix`,
    `- [When does the iPhone Duo restock in each US state and city?](${BASE}/when-does-iphone-duo-restock/california): one page per state and per city with two or more stores, by hour and store`,
    `- [Is the iPhone Duo back in stock right now?](${BASE}/is-iphone-duo-back-in-stock)`,
    `- [Apple Stores with the iPhone Duo in stock near me](${BASE}/iphone-duo-in-stock-near-me)`,
    `- [How long does an iPhone Duo restock last before it sells out?](${BASE}/how-fast-does-iphone-duo-sell-out)`,
    `- [The fastest way to hear about an iPhone Duo restock](${BASE}/iphone-duo-restock-alerts)`,
    `- [Getting an iPhone Duo when every store is sold out](${BASE}/how-to-buy-an-iphone-duo-in-store)`,
    `- [Staged checkout: buying an iPhone Duo restock in 20 seconds](${BASE}/iphone-duo-restock-checkout-guide)`,
    `- [Which iPhone Duo configuration restocks most?](${BASE}/iphone-duo-most-restocked-stores)`,
    `- [What “currently unavailable for pickup” means on apple.com](${BASE}/apple-store-pickup-explained)`,
    `- [iPhone Duo stock checker for every Apple Store](${BASE}/iphone-duo-availability-checker)`,
    `- [Where to buy an iPhone Duo today](${BASE}/where-to-buy-iphone-duo-today)`,
    "",
    "## Live stock (US)",
    `- [iPhone stock checker](${BASE}/): all three models at every US Apple Store, live`,
    ...MODELS.map((m) => `- [${m.name} in stock](${BASE}/in-stock/${m.slug}): which of the ${STORES.length} stores list it now, by storage and color, with its restock history`),
    `- [Restock log](${BASE}/restock-log): every confirmed restock and sell-out with time, store and configuration`,
    `- [Apple Stores by state](${BASE}/apple-stores): every state, city and store page, with live stock, restock hours, opening hours and address`,
    `- [How alerts work](${BASE}/how-restock-alerts-work): the ${SPEED.fastSec}-second read, how a restock is confirmed, and what is recorded`,
    "",
    "## Other countries",
    "The same live stock, store pages, restock hours and restock log for 18 more countries, in English, with Apple's local prices and that country's tax rule.",
    ...INTL_CODES.map((cc) => {
      const c = COUNTRIES[cc];
      const count = storesOf(cc).length;
      const index = placeTarget(cc);
      return `- [iPhone stock checker ${c.name}](${BASE}/${cc}): ${count === 1 ? "the Apple Store" : `all ${count} Apple Stores`} ${c.inName}, prices in ${c.currency}${index?.indexable ? `; [every store](${BASE}${index.path})` : `; [the store](${BASE}${index?.path})`}`;
    }),
  ];
}

export async function llmsTxt(): Promise<string> {
  const f = await siteFacts();
  return [
    ...head(f),
    "",
    "## Optional",
    `- [Every Apple Store's restock pattern](${BASE}/llms-full.txt)`,
    `- [Pricing](${BASE}/pricing)`,
    `- [Install the Home Screen app and allow notifications](${BASE}/phone-alerts)`,
    "",
  ].join("\n");
}

function storeLine(s: Store, f: SiteFacts): string {
  const p = f.patterns[s.storeNumber];
  const last = p?.lastRestockAt ? ` Last restock ${localStamp(p.lastRestockAt, s)} local time.` : "";
  return `- [${/^apple\b/i.test(s.name) ? s.name : `Apple ${s.name}`}](${BASE}${storePath(s)}) — ${storeLocality(s)}. ${patternSentence(p)}${last}`;
}

export async function llmsFullTxt(): Promise<string> {
  const f = await siteFacts();
  const sections: string[] = [];
  for (const cc of ["us", ...INTL_CODES] as CountryCode[]) {
    const stores = storesOf(cc);
    const c = cc === "us" ? null : COUNTRIES[cc];
    sections.push("", `## ${c ? c.name : "United States"} — ${stores.length} Apple Store${stores.length === 1 ? "" : "s"}`);
    const regions = [...new Set(stores.map((s) => s.state))].sort();
    for (const r of regions) {
      if (regions.length > 1) sections.push("", `### ${r}`);
      for (const s of stores.filter((x) => x.state === r).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))) sections.push(storeLine(s, f));
    }
  }
  return [
    ...head(f),
    "",
    "# Restock pattern of every Apple Store",
    "",
    `One line per store: the local hour its restocks usually land (from RestockWire's confirmed restocks over the last 30 days; a pattern is named from 5 restocks on 3 different days), how many there were, how long a restock typically stayed listed, and the latest one. These are observations, not a schedule; Apple publishes none. Each store's page carries its live stock and hour-by-hour chart.`,
    ...sections,
    "",
  ].join("\n");
}
