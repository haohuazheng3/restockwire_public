/**
 * Titles, answer-first intros, keyword sections and FAQs for the pages of the other 18 countries: the country
 * home, its store index, region, city and model pages. Every sentence is built from that country's live stock,
 * its confirmed restock log, its apple.com prices and its tax rule, so a page says what only that place's data
 * can say. Headings are the questions people ask; the first sentence under each answers it. All English; prices
 * in the local currency; distances in the country's unit.
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, appleName, modelByKey, type ModelKey, type Store } from "../apple/catalog";
import { COUNTRIES, formatPrice, theName, type Country, type CountryCode } from "../apple/countries";
import type { PlaceStats, StoreStockSummary } from "../stock/queries";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, taxName, withProvinceTax } from "@/content/country-tax";
import { fitTitle, fmtDuration, listWords, plural, alertHref, storeTitle as enStoreTitle, type FaqItem } from "./enrich";
import type { Block } from "../content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Faq } from "../content/types";
import { hourLabel } from "../content/siteFacts";

/** Other countries' stores have been checked since this day (the US since October 29). */
export const INTL_TRACKING_SINCE = "2026-11-02";

/** "since November 2, when tracking began" while the 30-day window still reaches back to the start, else "in the last 30 days". */
export function sinceWhenIntl(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "since November 2, when tracking began" : "in the last 30 days";
}

const money = (c: Country, v: number) => formatPrice(c, v);

/** Lowest price of a model in one storage size (colours cost the same), in the country's currency. */
export function priceOf(cc: CountryCode, model: ModelKey, storage = "256GB"): number | null {
  const prices = catalogFor(model, cc).filter((i) => i.storage === storage).map((i) => i.price);
  return prices.length ? Math.min(...prices) : null;
}
/** Lowest and highest price of a model. */
export function priceRange(cc: CountryCode, model: ModelKey): { low: number; high: number } {
  const p = catalogFor(model, cc).map((i) => i.price);
  return { low: Math.min(...p), high: Math.max(...p) };
}

/** Place names that are also US Apple Store cities or states get the country (the SEO plan §12: "Manchester, UK"). */
const US_NAMES = new Set([...citiesWithStores("us").map((c) => c.name.toLowerCase()), ...statesWithStores("us").map((s) => s.name.toLowerCase())]);
export function placeLabel(cc: CountryCode, name: string): string {
  return US_NAMES.has(name.toLowerCase()) ? `${name}, ${COUNTRIES[cc].short}` : name;
}

/** The word for a region: "city" for Taiwan, otherwise "province", "prefecture"… */
const noun = (c: Country, plural = false) => (plural ? c.regionNounPlural : c.regionNoun) ?? (plural ? "areas" : "area");

/* ------------------------------------------------------------------ tax */

/** One sentence: what a 256GB Duo costs here and what tax that holds (region = a Canadian province, when known). */
export function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `A 256GB iPhone Duo comes to about ${money(c, t.total)} in ${region}: Apple's ${money(c, duo)} plus ${t.rate}% ${CA_PROVINCE_TAX[region!].label}.`;
    return `Apple prices the 256GB iPhone Duo at ${money(c, duo)} before tax. At pickup, the store's province adds 5% to 15%.`;
  }
  const r = includedRate(c);
  if (r == null) return `${money(c, duo)} is the whole price of a 256GB iPhone Duo at pickup: Hong Kong adds no sales tax.`;
  return `${money(c, duo)} is the whole price of a 256GB iPhone Duo at pickup ${c.inName}, ${r}% ${taxName(c)} included.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The price section of a place or model page: Canada adds its province taxes, everyone else shows what the price holds. */
export function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = TAX_SOURCES[cc as Exclude<CountryCode, "us">];
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["iPhone", "apple.com price", `With ${t.total}% ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]),
        caption: `What each iPhone comes to in ${region} with ${t.label} (${t.total}%)`,
        source: `[${src.label}](${src.url}); Apple price list: apple.com/ca`,
      };
      return {
        id: "price-with-tax",
        h2: `What does the ${m.name} cost in ${placeName} after sales tax?`,
        lead: `**About ${money(c, withProvinceTax(base, region!)!.total)}** for the 256GB ${m.name} at a store in ${placeName}: Apple's **${money(c, base)} before tax**, plus ${region}'s ${t.hst ? `${t.hst}% HST` : t.pst ? `${t.gst}% GST and ${t.pst}% ${t.label.split(" + ")[1]}` : `${t.gst}% GST, with no provincial tax on top`}.`,
        blocks: [table, { t: "note", text: "**The pickup store sets the rate:** its province decides the tax, not your home address." }],
      };
    }
    // The whole country: one row per province with a store.
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `What does the ${m.name} cost in Canada after sales tax, by province?`,
      lead: `**From ${money(c, withProvinceTax(base, cheapest)!.total)} in ${cheapest} to ${money(c, withProvinceTax(base, dearest)!.total)} in ${dearest}** for a 256GB ${m.name}: Apple's ${money(c, base)} excludes tax, and the pickup store's province adds ${CA_PROVINCE_TAX[cheapest].total}% to ${CA_PROVINCE_TAX[dearest].total}%.`,
      blocks: [{
        t: "table",
        head: ["Province", "Tax", "Rate", `${m.short} 256GB with tax`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "Provincial tax at the pickup counter, for each province that has an Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); Apple price list: apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxName(c);
  return {
    id: "price",
    h2: `How much is the ${m.name} ${c.inName}? ${money(c, base)}, ${c.taxNote}`,
    lead: r == null
      ? `**${money(c, base)}, exactly the apple.com price**, for the 256GB ${m.name} at pickup in ${placeName}: Hong Kong charges **no sales tax** or VAT.`
      : `**${money(c, base)}** for the 256GB ${m.name} at pickup in ${placeName}, with **${r}% ${tn} already included** (${money(c, beforeTax(c, base))} before tax); nothing is added at the counter.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "apple.com price"] : ["iPhone", "apple.com price", `Before ${r}% ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `Apple's ${c.adjective} prices, as paid at pickup${r == null ? "" : ` (${tn} included)`}`,
      source: `[${src.label}](${src.url}); Apple price list: apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

/** The tax question for a FAQ. */
export function taxFaqIntl(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `What is the iPhone Duo's price in ${placeName} with tax?`, a: `About ${money(c, t.total)} for the 256GB: ${region}'s ${t.rate}% ${CA_PROVINCE_TAX[region!].label} on top of Apple's ${money(c, duo)}, charged by the pickup store.` }
      : { q: "Is tax included in Apple's Canadian prices?", a: `No. Apple lists ${money(c, duo)} for the 256GB iPhone Duo, before tax; tax depends on the pickup province and runs 5% (Alberta) to 14.975% (Quebec), as GST, HST or PST.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Is an iPhone tax-free in Hong Kong?", a: `Yes: Hong Kong charges neither VAT nor sales tax. You pay ${money(c, duo)} for the 256GB iPhone Duo at pickup, the apple.com figure to the cent.` }
    : { q: `Is ${taxName(c)} already in Apple's prices ${c.inName}?`, a: `Yes: the ${money(c, duo)} for a 256GB iPhone Duo includes ${r}% ${taxName(c)}. Nothing more is added at the pickup counter.` };
}

/* ------------------------------------------------------------------ region / city pages */

export interface IntlPlaceInput {
  cc: CountryCode;
  kind: "state" | "city";
  /** "Ontario" or "Toronto". */
  name: string;
  /** The region (province, state…) the place is in, or is. */
  region: string;
  regionSlug: string;
  citySlug?: string;
  stores: Store[];
  cities?: number;
  stockNow: Record<ModelKey, number>;
  stock: Map<string, StoreStockSummary>;
  duo: PlaceStats;
  max: PlaceStats;
}

export function intlPlaceTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, i.name);
  return fitTitle([
    `Apple Stores in ${w}: iPhone Duo Pickup at ${n === 2 ? "Both" : `All ${n}`}, Live`,
    `Apple Stores in ${w}: iPhone Duo Pickup, Live`,
    `Apple Stores in ${w}: iPhone Stock Now`,
    `Apple Stores in ${w}: iPhone Stock`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` and the Duo at about ${money(c, t.total)} with ${region} tax` : ` and the Duo at ${money(c, duo)} before tax`; }
  return ` and the Duo at ${money(c, duo)}, ${c.taxNote}`;
}

export function intlPlaceDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, i.name);
  return fitTitle([
    `${i.stockNow.duo} of ${n} Apple Stores in ${w} list the iPhone Duo for pickup now, ${i.stockNow["18-pro-max"]} the 18 Pro Max. Store by store, with restock hours${priceBit(i.cc, i.region)}.`,
    `${i.stockNow.duo} of ${n} Apple Stores in ${w} list the iPhone Duo now, ${i.stockNow["18-pro-max"]} the 18 Pro Max. Live by store, with restock hours.`,
  ], 155);
}

/** One sentence, live state first: how many of the place's stores list each model at this minute (the price has its own section). */
export function intlPlaceIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, spread over ${plural(i.cities, "city", "cities")},` : "";
  return `**${duo}** of the **${plural(n, "Apple Store")}** in ${i.name}${cities} ${duo === 1 ? "lists" : "list"} an iPhone Duo for pickup at this minute; the iPhone 18 Pro Max is at **${i.stockNow["18-pro-max"]}**, the iPhone 18 Pro at **${i.stockNow["18-pro"]}**.`;
}

/** "Nov 2, 3:04 PM GMT" in the country's zone. */
export function whenIn(cc: CountryCode, iso: string | Date): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: COUNTRIES[cc].timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
}

export function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const items = catalogFor(model, i.cc);
  const counts = new Map<string, number>(items.map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) if (counts.has(p)) counts.set(p, (counts.get(p) ?? 0) + 1);
  const by = new Map(items.map((c) => [c.partNumber, c]));
  return [...counts.entries()].map(([p, n]) => ({ label: `${by.get(p)!.storage} ${by.get(p)!.color}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

export function pairsPct(i: IntlPlaceInput, model: ModelKey): number {
  const total = i.stores.length * catalogFor(model, i.cc).length;
  const avail = i.stores.reduce((a, s) => a + (i.stock.get(s.storeNumber)?.perModel[model].available ?? 0), 0);
  return Math.round((100 * avail) / Math.max(1, total));
}

export const duoStoresNow = (i: IntlPlaceInput) => i.stores.filter((s) => (i.stock.get(s.storeNumber)?.perModel.duo.available ?? 0) > 0);

/** The Duo section's one-sentence answer to "which stores have it right now?". */
function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Yes, at ${have.length} of ${n} stores**: ${listWords(have.map((s) => appleName(s)), 4)} ${have.length === 1 ? "lists" : "list"} an iPhone Duo for pickup at this minute.`;
  if (st.month > 0) return `**Not at this minute**: none of the ${n} stores lists an iPhone Duo, though together they have restocked it **${plural(st.month, "time")}** ${sinceWhenIntl()}.`;
  return `**Not at this minute**: none of the ${n} stores lists an iPhone Duo, and none has a confirmed Duo restock ${sinceWhenIntl()}.`;
}

/** The Duo section's key points: the restock record, the last one, how long a listing lasted, and the alert. */
function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Latest Duo restock here:** ${whenIn(i.cc, st.lastRestock.at)} at ${appleName(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Confirmed ${sinceWhenIntl()}:** ${plural(st.month, "Duo restock")} across the stores in ${w}`);
  if (st.medianMs != null) items.push(`**How long a listing lasts:** about ${fmtDuration(st.medianMs)} at the median before the Duo sells out again`);
  items.push(`**Fastest route to one:** [put the iPhone Duo on the wire in ${w}](${alert}) across the ${n <= 3 ? (n === 2 ? "two" : "three") : `${Math.min(n, 5)} nearest`} stores you would travel to; stores with alerts are read every 5 seconds`);
  items.push("**One alert rule** is one store × one exact configuration, and the push lands about 3 seconds after a second read confirms the restock");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**That changes in a minute:** an alert sees the next restock long before a refresh of apple.com would." });
  blocks.push({ t: "ul", items });
  return blocks;
}

export function intlPlaceSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = i.name;
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `iPhone Duo in ${w}: which stores list it this minute?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `iPhone 18 Pro Max stock in ${w}: listed or not?`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**Yes, at ${i.stockNow["18-pro-max"]} of ${n} stores**, with **${pairsPct(i, "18-pro-max")}%** of the ${n * pm} store × configuration pairs in ${w} listed at this minute.`
        : `**Not at this minute**: none of the ${n} stores in ${w} lists an iPhone 18 Pro Max for pickup.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Hardest to find right now:** ${listWords(scarce.map((x) => `${x.label} (${x.stores} of ${n} stores)`))}`] : []),
        `**iPhone 18 Pro:** ${i.stockNow["18-pro"]} of ${n} stores, ${pairsPct(i, "18-pro")}% of its pairs listed`,
        `**Confirmed ${sinceWhenIntl()}:** ${i.max.month ? plural(i.max.month, "18 Pro Max restock") : "no 18 Pro Max restock yet"}`,
        ...(i.max.medianMs != null ? [`**How long a listing lasts:** about ${fmtDuration(i.max.medianMs)} at the median before a Pro Max sells out again`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

export function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = theName(COUNTRIES[cc]);
  return fitTitle([`Apple Stores in ${w}: iPhone Duo Pickup at ${n === 2 ? "Both" : `All ${n}`}, Live`, `Apple Stores in ${w}: iPhone Duo Pickup, Live`, `Apple Stores in ${COUNTRIES[cc].short}: iPhone Stock, Live`], 70);
}

export function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const short = COUNTRIES[cc].short;
  return fitTitle([`iPhone Stock Checker ${short}: Live Pickup at ${plural(n, "Apple Store")}`, `iPhone Stock Checker ${short}: Live Pickup Stock`], 70);
}

export function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const c = COUNTRIES[cc];
  return n === 1 ? `Live iPhone pickup stock at the Apple Store ${c.inName}` : `Live iPhone pickup stock at all ${n} Apple Stores ${c.inName}`;
}

/** Country phrase: all N stores, or the only store. */
export function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `the only Apple Store ${COUNTRIES[cc].inName}` : `all ${n} Apple Stores ${COUNTRIES[cc].inName}`;
}

/** Where a country's stores are: city and region counts in one phrase. */
export function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `in ${cities[0].name}`;
  if (cities.length === 1) return `all in ${cities[0].name}`;
  if (!c.regionNoun || regions.length === 1) return `in ${plural(cities.length, "city", "cities")}`;
  return `in ${plural(cities.length, "city", "cities")} across ${regions.length} ${noun(c, regions.length !== 1)}`;
}

/** The model page's bound titles: "Is the {Model} in Stock {inCountry}? All {n} Apple Stores, Live". */
export function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "The Apple Store" : n === 2 ? "Both Apple Stores" : `All ${n} Apple Stores`;
  return {
    title: fitTitle([`Is the ${m.name} in Stock ${c.inName}? ${all}, Live`, `Is the ${m.name} in Stock ${c.inName}? Live`, `${m.name} Stock ${c.inName}`], 70),
    h2: [`Which Apple Stores ${c.inName} have the ${m.name} right now?`, priceSection(cc, theName(c), undefined, model).h2],
  };
}

/** The model page's answer-first intro and description. */
export function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const price = cc === "ca" ? `**${money(c, r.low)}** before tax` : `**${money(c, r.low)}**, ${c.taxNote}`;
  return `${inStock === 0 ? `At this minute ${n === 1 ? `the Apple Store ${c.inName} does **not** list` : `**none** of the ${n} Apple Stores ${c.inName} lists`} the ${m.name} for pickup` : `At this minute **${inStock} of ${n}** Apple Stores ${c.inName} list the ${m.name} for pickup`} (every store is read **every 15 seconds**); prices start at ${price}.`;
}

export function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fitTitle([
    `${inStock} of ${n} Apple Stores ${c.inName} list the ${m.name} for pickup at this minute. Store by store and configuration by configuration, from ${money(c, r.low)}${cc === "ca" ? " before tax" : ""}, with restock hours.`,
    `${inStock} of ${n} Apple Stores ${c.inName} list the ${m.name} now. Live pickup stock by store and configuration, restock hours and alerts.`,
  ], 155);
}

/** Table rows for the country home: one per model. */
export function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, String(catalogFor(m.key, cc).length), String(storesNow[m.key] ?? 0), String(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home (moved from HomePage) */

export function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  return `Live iPhone Duo, 18 Pro and 18 Pro Max pickup stock at ${allStoresPhrase(cc)}, read every 15 seconds. ${n === 1 ? "Prices" : "Restock hours and prices"} in ${c.currency}, and a push the second your store restocks.`;
}

export function homeIntro(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  return `Latest confirmed iPhone Duo restock ${c.inName}: **{{duo.lastRestock}}**. At this minute **{{duo.storesNow}} of ${n}** Apple Store${n === 1 ? "" : "s"} list a Duo for pickup, **{{pm.storesNow}}** an iPhone 18 Pro Max and **{{pro.storesNow}}** an iPhone 18 Pro.`;
}

export interface HomeCopyInput {
  cc: CountryCode;
  /** Stores with each model now / restocks logged (the table). */
  storesNow: Record<ModelKey, number>;
  restocks: Record<ModelKey, number>;
  /** Paths the copy links to (English form). */
  restocksPath: string;
  index: { path: string; indexable: boolean } | null;
}

/** The country home's three keyword sections (the price one from priceSection). */
export function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const unit = c.unit === "mi" ? "miles" : "kilometres";
  return [
    {
      id: "iphone-stock",
      h2: `Which iPhones are in stock ${c.inName} right now?`,
      lead: `The table answers it live: apple.com's own in-store pickup availability for every configuration at ${allStoresPhrase(cc)}, read every 15 seconds${n > 1 ? ` and broken down by store, by ${c.regionNoun ?? "city"} and by configuration` : ""}.`,
      blocks: [
        { t: "table", head: ["Model", "Configurations", "Stores listing it now", "Confirmed restocks"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `The wire ${c.inName} as of {{asOf}}` },
        { t: "ul", items: [
          "**Confirmed means twice:** a change is published only once a second read agrees, so one glitchy apple.com answer never shows as a restock or a sell-out",
          "**First sightings are not restocks:** a configuration seen for the first time only sets the baseline",
          `**The log is the source:** every confirmed change goes into the [restock log](${i.restocksPath}), which draws the restock charts on ${i.index?.indexable ? `[the store pages](${i.index.path})` : "the store page"}`,
          `**Coverage:** ${spreadPhrase(cc)}, with Apple's own ${c.adjective} prices and part numbers; stores with alerts are read every 5 seconds`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, theName(c)),
    {
      id: "alerts",
      h2: `How do restock alerts work ${c.inName}?`,
      lead: `You pick the store${n === 1 ? "" : "s"} and the exact phone; when ${n === 1 ? "the store" : "one of them"} lists it for in-store pickup, a push lands on your phone about 3 seconds after the restock is confirmed.`,
      blocks: [
        { t: "ol", items: [
          n === 1 ? `Choose the iPhone, storage and color under **Get alerts**; the store is ${stores[0].name} in ${stores[0].city}.` : `Choose the iPhone, storage and color under **Get alerts**, then tick the stores you can reach; the nearest come first, with ${unit} on the road and minutes of driving shown.`,
          "On an iPhone, add RestockWire to your Home Screen and allow notifications; iOS delivers web push only to an installed app ([how to install](/phone-alerts)).",
          "Tap the push, land on apple.com, and pay with in-store pickup at the store it named.",
        ] },
        { t: "table", head: ["Plan", "Monthly (USD)", "Alert rules"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "One rule = one store × one exact configuration; browsing stays free, and the speed is the same on every plan ([pricing](/pricing))" },
        { t: "note", text: "**Our read:** the Duo earns alerts at every store you can reach; for the 18 Pro and Pro Max, check the live counts first." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

export interface RestockTimesBrief {
  /** Confirmed Duo restocks since tracking began, stores with one, stores in the country. */
  n: number; stores: number; storesTotal: number;
  /** The usual local hour, once the pattern threshold is met (5 restocks on 3 days), else null. */
  peakHour: number | null;
  /** Path of the country's restock-times page (English form). */
  path: string;
}

/** The country home's FAQ (live tokens filled by RichFaq). */
export function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const when = rt.n === 0
    ? `None confirmed yet since tracking began on November 2. [When does Apple restock the iPhone Duo ${c.inName}?](${rt.path}) counts each one by local hour and day as they come.`
    : rt.peakHour != null
      ? `Most land around **${hourLabel(rt.peakHour)} local time**: ${rt.n.toLocaleString("en-US")} confirmed restocks at ${rt.stores} of ${rt.storesTotal} stores since November 2. [Restocks per hour and per day](${rt.path}).`
      : `Since November 2: ${rt.n.toLocaleString("en-US")} confirmed restocks at ${rt.stores} of ${rt.storesTotal} stores. That is spread over too few days for a usual hour. [Restocks per hour and per day](${rt.path}).`;
  // Native versions add the restock-times answer as their own question (their own place builders); English
  // keeps it for later and spends its five questions on stock, speed, price, tax and holds.
  void when;
  return [
    { q: `Which Apple Stores ${c.inName} list the iPhone Duo at this minute?`, a: `{{duo.storesNow}} of ${n} at the last read ({{asOf}}). [iPhone Duo stock ${c.inName}](${p}/in-stock/iphone-duo) names each store and configuration and refreshes every 15 seconds.` },
    { q: `How quickly does RestockWire see a restock ${c.inName}?`, a: `Stores with alerts are read every 5 seconds and every Apple Store ${c.inName} every 15; a first "available" is re-read within a second. The confirmed restock is on your phone about 3 seconds later.` },
    { q: "Do I need a plan to look at stock?", a: "No: live stock, the map and the restock log are free. A plan adds alert rules, billed in US dollars: Plus $5 a month for 10, Pro $10 for 20, Max $20 for 50, cancelled whenever you like ([pricing](/pricing))." },
    taxFaqIntl(cc, theName(c)),
    { q: "Does an alert hold the phone for me?", a: `No; only an apple.com pickup order does that. The alert gets you to checkout first, and Apple holds the unit once you have paid ([Apple's pickup help](${pickupHelp(cc).url})).` },
  ];
}

/** Small labels of the country home. */
export const homeLabels = {
  appName: (cc: CountryCode) => `RestockWire iPhone stock checker ${COUNTRIES[cc].short}`,
  offer: "Live stock, the map and the restock log are free; alert plans start at $5 a month",
  itemList: (cc: CountryCode) => `Apple Stores ${COUNTRIES[cc].inName}`,
  restockTimesChip: "Restock hours",
  /** The chip to the store index on a country with regions: "Stores by province". */
  storesByRegion: (cc: CountryCode) => `Stores by ${noun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `Stock by place ${COUNTRIES[cc].inName}`,
  selloutH2: (cc: CountryCode) => `How long does an iPhone restock last ${COUNTRIES[cc].inName}?`,
  selloutLabel: (cc: CountryCode) => `at Apple Stores ${COUNTRIES[cc].inName}`,
  last24Label: (cc: CountryCode) => COUNTRIES[cc].inName,
  newsroom: "Apple Newsroom, Oct 23, 2026 — iPhone Duo arrives at Apple Store locations worldwide",
};

/** A store page's <title> and H1 (the English store title); `region`: the city or state in parentheses when the store is its only one. */
export function storeTitleIntl(s: Store, region?: string): string {
  return enStoreTitle(s, undefined, undefined, region);
}
