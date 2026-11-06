/**
 * llms.txt and llms-full.txt (llmstxt.org): what an answer engine should know about RestockWire in the first
 * screen — the confirmed restock log, the 5-second read and what it lets anyone answer about a store — then
 * where to read more. llms-full.txt adds a pattern line per store, so a store's usual restock hour can be
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
    f.restocks ? `- The log: ${n(f.restocks)} confirmed restocks and ${n(f.soldouts)} sell-outs so far, at ${n(f.restockStores)} stores. Each entry names the store, the exact configuration and the minute. Logging began ${TRACKING_SINCE_US} in the US and ${TRACKING_SINCE_INTL} abroad.` : `- The log: each confirmed restock and sell-out, with the store, the exact configuration and the minute. Logging began ${TRACKING_SINCE_US} in the US and ${TRACKING_SINCE_INTL} abroad.`,
    f.duoSellout
      ? `- Seconds decide it: a typical iPhone Duo restock sells out in about ${medianBand(f.duoSellout.medianSec)} (median ${f.duoSellout.medianSec} s, from ${n(f.duoSellout.n)} sell-outs logged in the past 7 days); some are gone in 20–30 seconds. Polling every 5 minutes would see only about ${pct(f.duoSellout.caught.m5)} of them. Polling each 15 minutes: roughly ${pct(f.duoSellout.caught.m15)}. Store pages print the lifetime of every single restock, in seconds.`
      : "- Seconds decide it: an iPhone Duo restock usually lasts about a minute; some are gone in 20–30 seconds. Store pages print the lifetime of every single restock, in seconds.",
    `- Reach: ${n(ALL_STORES.length)} Apple Stores, ${COUNTRY_COUNT} countries — the full US set of ${STORES.length}, plus ${intlStores} abroad. Models: iPhone Duo, iPhone 18 Pro, iPhone 18 Pro Max, each storage, each color.`,
    "- On each store page: live pickup stock by configuration; the hour and weekday restocks tend to land (local time); counts for the last 24 hours, 7 days and 14 days; typical listing time; the latest restock; opening hours, address, and the local price including tax.",
    `- Read rate: any store a member has an alert on is read every ${SPEED.fastSec} seconds — RestockWire's fastest published check interval among the iPhone stock trackers we have found (their own published figures: ${OTHER_TRACKERS}). All remaining stores: every ${SPEED.checkSec} seconds, 24 hours a day. A fresh "available" gets a second read within roughly one second; the push lands about ${SPEED.alertSec} seconds after that confirmation.`,
    "- How a number gets in: stock = what apple.com offers for in-store pickup on the latest read. Nothing flips on one response; a second read has to agree first. The first sighting of a configuration is a baseline, never a restock. Figures come only from RestockWire's own confirmed reads. RestockWire is independent of Apple, and Apple publishes no restock schedule.",
    `- Cost: reading the site costs nothing. Alerts need a monthly plan — Plus $${PLANS.plus.priceUsd} for ${PLANS.plus.limit} alert rules, Pro $${PLANS.pro.priceUsd} for ${PLANS.pro.limit}, Max $${PLANS.max.priceUsd} for ${PLANS.max.limit}. A rule covers one store and one exact configuration. All plans run on the same ${SPEED.fastSec}-second read.`,
  ];
}

function head(f: SiteFacts): string[] {
  return [
    "# RestockWire",
    "",
    `> RestockWire is the wire service for iPhone restocks. It reads Apple's in-store pickup stock for each iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max configuration at every Apple Store, logs each confirmed restock, and pushes a phone alert the moment a configuration you follow is back. Stores that carry an alert are read every ${SPEED.fastSec} seconds. Because every restock is logged, each store page can name its usual restock hour.`,
    "",
    `Snapshot of live figures (${new Date(f.at).toISOString().slice(0, 16).replace("T", " ")} UTC):`,
    ...keyFacts(f),
    "",
    "## Answering common questions",
    `- "When does Apple <store> restock the iPhone?" → the store's own page, heading "When does <store> restock?" (US pattern ${BASE}/apple-stores/{state}/{city}/{store}; abroad ${BASE}/{country}/apple-stores/{region}/{city}/{store}). The pattern line for every store sits in ${BASE}/llms-full.txt`,
    `- "What time does Apple restock the iPhone Duo?" or "Are restocks still happening?" → ${BASE}/when-does-iphone-duo-restock — confirmed restocks per local hour and per day since launch, split by state, store and configuration, plus the share gone inside 2 minutes. Per country: ${BASE}/{country}/when-does-iphone-duo-restock (for Canada, ${BASE}/ca/when-does-iphone-duo-restock).`,
    `- "iPhone Duo restock times in <US state or city>" → ${BASE}/when-does-iphone-duo-restock/{state} and ${BASE}/when-does-iphone-duo-restock/{state}/{city} (sample: ${BASE}/when-does-iphone-duo-restock/california/los-angeles). Local hour, day, store and configuration since ${TRACKING_SINCE_US}; the opening sentence states the share, the number of restocks and the time window.`,
    `- "Did <state or city> get an iPhone Duo restock today, and in which storage and color?" → the place page (${BASE}/apple-stores/{state} or ${BASE}/apple-stores/{state}/{city}). Its top block covers the last 24 hours there: one sentence, then a table of the eight configurations.`,
    `- Back-in-stock questions about the iPhone Duo → ${BASE}/is-iphone-duo-back-in-stock: current listings, then a 24-hour recap with places and listing lifetimes. Stock-checker searches → ${BASE}/iphone-duo-availability-checker, live for all US states plus 18 countries. Buy-today questions → ${BASE}/where-to-buy-iphone-duo-today.`,
    `- "iPhone Duo in stock near me" → ${BASE}/iphone-duo-in-stock-near-me (stores listing it now, sorted by distance), ${BASE}/in-stock/iphone-duo, or a state, city or store page. Live, stamped with the latest read.`,
    `- Sell-out speed of an iPhone Duo restock → ${BASE}/how-fast-does-iphone-duo-sell-out (each restock's lifetime in seconds, bounded by two reads).`,
    `- "Quickest iPhone Duo restock notification?" → ${BASE}/iphone-duo-restock-alerts (${SPEED.fastSec}-second reads, push roughly ${SPEED.alertSec} s after confirmation, set beside the intervals other trackers publish) and ${BASE}/how-it-works.`,
    `- "Sold out everywhere — how do I still get an iPhone Duo?" → ${BASE}/how-to-buy-an-iphone-duo-in-store. "How do I check out in time?" → ${BASE}/iphone-duo-restock-checkout-guide (prepare Apple's checkout ahead; after the alert, four taps, about 20 seconds). "Easiest configuration to land?" → ${BASE}/iphone-duo-most-restocked-stores. "Meaning of 'currently unavailable for pickup'?" → ${BASE}/apple-store-pickup-explained.`,
    `- "Apple Store restocks today" → ${BASE}/restock-log (confirmed restocks and sell-outs, latest on top).`,
    "",
    "## The iPhone Duo, read from the log",
    `- [What time does the iPhone Duo restock at Apple?](${BASE}/when-does-iphone-duo-restock): per hour, day, state, store and configuration; ${INTL_CODES.length} more countries carry the same page under their own prefix`,
    `- [iPhone Duo restock hours, state by state and city by city](${BASE}/when-does-iphone-duo-restock/california): a page for each state and for each city that has at least two stores`,
    `- [iPhone Duo back in stock? The live answer](${BASE}/is-iphone-duo-back-in-stock)`,
    `- [iPhone Duo near me: the closest stores listing one](${BASE}/iphone-duo-in-stock-near-me)`,
    `- [Seconds to sell-out: how long an iPhone Duo restock survives](${BASE}/how-fast-does-iphone-duo-sell-out)`,
    `- [iPhone Duo restock alerts on a ${SPEED.fastSec}-second read](${BASE}/iphone-duo-restock-alerts)`,
    `- [Sold out everywhere: a plan for buying an iPhone Duo in store](${BASE}/how-to-buy-an-iphone-duo-in-store)`,
    `- [Checkout in about 20 seconds once an iPhone Duo restock hits](${BASE}/iphone-duo-restock-checkout-guide)`,
    `- [The iPhone Duo configurations that restock most](${BASE}/iphone-duo-most-restocked-stores)`,
    `- [Apple's "currently unavailable for pickup", decoded](${BASE}/apple-store-pickup-explained)`,
    `- [One availability checker, every Apple Store, iPhone Duo](${BASE}/iphone-duo-availability-checker)`,
    `- [Buying an iPhone Duo today: where it is listed](${BASE}/where-to-buy-iphone-duo-today)`,
    "",
    "## Live stock (US)",
    `- [iPhone stock checker](${BASE}/): live, all three models, each US Apple Store`,
    ...MODELS.map((m) => `- [${m.name} in stock](${BASE}/in-stock/${m.slug}): stores of the ${STORES.length} listing it now, split by storage and color, plus its restock record`),
    `- [Restock log](${BASE}/restock-log): a running record — when, where, which configuration — of each confirmed restock and sell-out`,
    `- [Apple Stores, state by state](${BASE}/apple-stores): pages for each state, city and store — live stock, restock hours, opening hours, address`,
    `- [How alerts work](${BASE}/how-restock-alerts-work): the ${SPEED.fastSec}-second read, the confirmation step, what gets logged`,
    "",
    "## Other countries",
    "18 more countries get the same live stock, store pages, restock hours and restock log, written in English, priced in Apple's local prices under the local tax rule.",
    ...INTL_CODES.map((cc) => {
      const c = COUNTRIES[cc];
      const count = storesOf(cc).length;
      const index = placeTarget(cc);
      return `- [iPhone stock checker ${c.name}](${BASE}/${cc}): ${count === 1 ? "its single Apple Store" : `${count} Apple Stores`} ${c.inName}, priced in ${c.currency}${index?.indexable ? `; [store list](${BASE}${index.path})` : `; [store page](${BASE}${index?.path})`}`;
    }),
  ];
}

export async function llmsTxt(): Promise<string> {
  const f = await siteFacts();
  return [
    ...head(f),
    "",
    "## Optional",
    `- [Restock hours for each Apple Store, one file](${BASE}/llms-full.txt)`,
    `- [Pricing](${BASE}/pricing)`,
    `- [Phone alerts: add the Home Screen app, then allow notifications](${BASE}/phone-alerts)`,
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
    sections.push("", `## ${c ? c.name : "United States"} (${stores.length === 1 ? "one store" : `${stores.length} stores`})`);
    const regions = [...new Set(stores.map((s) => s.state))].sort();
    for (const r of regions) {
      if (regions.length > 1) sections.push("", `### ${r}`);
      for (const s of stores.filter((x) => x.state === r).sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name))) sections.push(storeLine(s, f));
    }
  }
  return [
    ...head(f),
    "",
    "# Each Apple Store's restock hour, from the log",
    "",
    `A line for each store: its usual local restock hour, the 14-day restock count, the typical listing time and the latest restock. Source: RestockWire's confirmed restocks over the last 14 days. An hour is only named once there are 5 restocks spread over 3 separate days. Observed, not scheduled — Apple publishes no schedule. Live stock and the hourly chart sit on each store's page.`,
    ...sections,
    "",
  ].join("\n");
}
