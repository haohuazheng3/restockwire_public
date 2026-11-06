/**
 * Titles, answer-first intros and keyword sections for the state and city pages: the location pages people land on
 * from "apple store {place}" and "iphone duo {place}". Every sentence is built from the live stock, the confirmed
 * restock log and the 2026 sales-tax table, so a page says what only that place's data can say. Headings are the
 * questions people ask about the place; the first sentence under each one answers it.
 */
import { PART_INDEX, STATE_CODES, STORES, catalogFor, appleName, statesWithStores, citiesWithStores, type ModelKey, type Store } from "../apple/catalog";
import type { PlaceStats, StoreStockSummary } from "../stock/queries";
import { SALES_TAX, withTax } from "@/content/sales-tax";
import { neighborStates } from "./links";
import { SPEED } from "../plans";
import { fitTitle, fmtDuration, fmtPrice, listWords, plural, alertHref } from "./enrich";
import type { Block, Faq } from "../content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";

export interface PlaceCopyInput {
  kind: "state" | "city";
  /** "New Jersey" or "Chicago". */
  name: string;
  state: string;
  stateSlug: string;
  citySlug?: string;
  stores: Store[];
  cities?: number;
  stockNow: Record<ModelKey, number>;
  stock: Map<string, StoreStockSummary>;
  duo: PlaceStats;
  max: PlaceStats;
}

/** "since October 29, when tracking began" while the 30-day window still reaches back to the start, else "in the last 30 days". */
export function sinceWhen(now = Date.now()): string {
  return now - Date.parse("2026-10-29T00:00:00Z") < 30 * 86400_000 ? "since October 29, when tracking began" : "in the last 30 days";
}

const ET = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * Two place names collide with another page's search (DataForSEO, the SEO plan §10): people looking for New York
 * City type "apple store nyc" (6,600 a month), while the New York state page answers "apple stores in new
 * york" (390); Washington State is "apple stores in washington state" (320), D.C. is "apple store dc"
 * (12,100). The titles and the prose name these places the way their own searches do.
 */
const SAID: Record<string, { title: string; prose: string }> = {
  "city:New York|New York": { title: "NYC", prose: "New York City" },
  "state:Washington": { title: "Washington State", prose: "Washington State" },
};
const said = (i: PlaceCopyInput) => SAID[i.kind === "city" ? `city:${i.name}|${i.state}` : `state:${i.name}`];

/** The place as titles and descriptions name it. */
function where(i: PlaceCopyInput): string {
  return said(i)?.title ?? (i.kind === "city" ? `${i.name}, ${STATE_CODES[i.state] ?? i.state}` : i.name);
}

/** The place as sentences name it. */
export function placeName(i: PlaceCopyInput): string {
  return said(i)?.prose ?? i.name;
}

export function placeTitle(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const w = where(i);
  return fitTitle([
    `Apple Stores in ${w}: iPhone Duo Pickup at ${n === 2 ? "Both" : `All ${n}`}, Live`,
    `Apple Stores in ${w}: iPhone Duo Pickup, Live`,
    `Apple Stores in ${placeName(i)}: iPhone Duo Pickup, Live`,
    `Apple Stores in ${placeName(i)}: iPhone Stock Now`,
    `Apple Stores in ${placeName(i)}: iPhone Stock`,
  ]);
}

export function placeDescription(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const tax = SALES_TAX[i.state];
  const taxBit = tax ? (tax.combined === 0 ? ", and no sales tax" : ` and the price after ${i.state} sales tax`) : "";
  return fitTitle([
    `${i.stockNow.duo} of ${n} Apple Stores in ${where(i)} list the iPhone Duo for pickup now, ${i.stockNow["18-pro-max"]} the 18 Pro Max. Store by store, with restock hours${taxBit}.`,
    `${i.stockNow.duo} of ${n} Apple Stores in ${placeName(i)} list the iPhone Duo now, ${i.stockNow["18-pro-max"]} the 18 Pro Max. Live by store, with restock hours.`,
  ], 155);
}

/** One sentence, live state first: how many of the place's stores list each model at this minute (the tax has its own section). */
export function placeIntro(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, spread over ${plural(i.cities, "city", "cities")},` : "";
  return `**${duo}** of the **${plural(n, "Apple Store")}** in ${placeName(i)}${cities} ${duo === 1 ? "lists" : "list"} an iPhone Duo for pickup at this minute; the iPhone 18 Pro Max is at **${i.stockNow["18-pro-max"]}**, the iPhone 18 Pro at **${i.stockNow["18-pro"]}**.`;
}

/** Configurations of a model that the fewest stores here have right now (ties broken by catalog order). */
function scarcest(i: PlaceCopyInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  const counts = new Map<string, number>(catalogFor(model).map((c) => [c.partNumber, 0]));
  for (const s of i.stores) for (const p of i.stock.get(s.storeNumber)?.perModel[model].parts ?? []) counts.set(p, (counts.get(p) ?? 0) + 1);
  return [...counts.entries()].map(([p, n]) => ({ label: `${PART_INDEX.get(p)!.storage} ${PART_INDEX.get(p)!.color}`, stores: n })).sort((a, b) => a.stores - b.stores).slice(0, k);
}

function pairsPct(i: PlaceCopyInput, model: ModelKey): number {
  const total = i.stores.length * catalogFor(model).length;
  const avail = i.stores.reduce((a, s) => a + (i.stock.get(s.storeNumber)?.perModel[model].available ?? 0), 0);
  return Math.round((100 * avail) / Math.max(1, total));
}

const duoStoresNow = (i: PlaceCopyInput) => i.stores.filter((s) => (i.stock.get(s.storeNumber)?.perModel.duo.available ?? 0) > 0);

/** The Duo section's one-sentence answer to "which stores have it right now?". */
function duoLead(i: PlaceCopyInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Yes, at ${have.length} of ${n} stores**: ${listWords(have.map((s) => appleName(s)), 4)} ${have.length === 1 ? "lists" : "list"} an iPhone Duo for pickup at this minute.`;
  if (st.month > 0) return `**Not at this minute**: none of the ${n} stores lists an iPhone Duo, though together they have restocked it **${plural(st.month, "time")}** ${sinceWhen()}.`;
  return `**Not at this minute**: none of the ${n} stores lists an iPhone Duo, and none has a confirmed Duo restock ${sinceWhen()}.`;
}

/** The Duo section's key points: the latest restock, the record, how long a listing lasted, then the alert. */
function duoPoints(i: PlaceCopyInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Latest Duo restock here:** ${ET.format(new Date(st.lastRestock.at))} ET at ${appleName(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Confirmed ${sinceWhen()}:** ${plural(st.month, "Duo restock")} across the stores in ${w}`);
  if (st.medianMs != null) items.push(`**How long a listing lasts:** about ${fmtDuration(st.medianMs)} at the median before the Duo sells out again`);
  items.push(`**Fastest route to one:** [put the iPhone Duo on the wire in ${w}](${alert}) at the ${n <= 3 ? (n === 2 ? "two" : "three") : `${Math.min(n, 5)} nearest`} stores you would drive to; stores with alerts are read every ${SPEED.fastSec} seconds`);
  items.push(`**One alert rule** is one store × one exact configuration, and the push lands about ${SPEED.alertSec} seconds after a second read confirms the restock`);
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: `**That changes in a minute:** Duo restocks land in bursts across the country, and every store here is on the ${SPEED.checkSec}-second wire.` });
  blocks.push({ t: "ul", items });
  return blocks;
}

export function placeSections(i: PlaceCopyInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeName(i);
  const t = SALES_TAX[i.state];
  const alert = alertHref({ model: "duo", state: i.stateSlug, city: i.kind === "city" ? i.citySlug : undefined });
  const scarce = scarcest(i, "18-pro-max");
  const pm = i.stockNow["18-pro-max"];
  const sections: KeywordSection[] = [
    {
      id: "iphone-duo",
      h2: `Which Apple Stores in ${w} have the iPhone Duo right now?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `Is the iPhone 18 Pro Max in stock in ${w}?`,
      lead: pm > 0
        ? `**Yes, at ${pm} of ${n} stores**, with **${pairsPct(i, "18-pro-max")}%** of the ${n * 16} store × configuration pairs in ${w} listed at this minute.`
        : `**Not at this minute**: none of the ${n} stores in ${w} lists an iPhone 18 Pro Max for pickup.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Hardest to find right now:** ${listWords(scarce.map((x) => `${x.label} (${x.stores} of ${n} stores)`))}`] : []),
        `**iPhone 18 Pro:** ${i.stockNow["18-pro"]} of ${n} stores, ${pairsPct(i, "18-pro")}% of its pairs listed`,
        `**Confirmed ${sinceWhen()}:** ${i.max.month ? plural(i.max.month, "18 Pro Max restock") : "no 18 Pro Max restock yet"}`,
        ...(i.max.medianMs != null ? [`**How long a listing lasts:** about ${fmtDuration(i.max.medianMs)} at the median before a Pro Max sells out again`] : []),
      ] }],
    },
  ];
  if (t) {
    const nb = neighborStates(i.state).map((s) => ({ name: s.name, t: SALES_TAX[s.name] })).filter((x) => x.t && x.t.combined > 0).sort((a, b) => b.t!.combined - a.t!.combined)[0];
    const rows: [string, number][] = [["iPhone Duo 256GB", 1999], ["iPhone Duo 1TB", 2599], ["iPhone 18 Pro Max 256GB", 1299], ["iPhone 18 Pro Max 1TB", 1899], ["iPhone 18 Pro 256GB", 1199]];
    const table: Block = {
      t: "table",
      head: ["iPhone", "apple.com price", t.combined === 0 ? `At pickup in ${i.state}` : `After ${t.combined}% tax`],
      rows: rows.map(([label, price]) => [label, money(price), money(withTax(price, i.state)!.total)]),
      caption: `What each iPhone comes to in ${i.state} at the state's average combined sales tax (${t.combined}%)`,
      source: "[Tax Foundation, rates as of January 1, 2026](https://taxfoundation.org/data/all/state/sales-tax-rates/); prices from apple.com",
    };
    const blocks: Block[] = [table];
    if (t.combined === 0) {
      if (nb) blocks.push({ t: "note", text: `**Across the line:** in ${nb.name} the same Duo comes to about ${money(withTax(1999, nb.name)!.total)}, which is why buyers cross into ${i.state} for theirs.` });
    } else {
      blocks.push({ t: "ul", items: [
        `**State rate:** ${t.state}%`,
        `**Average local add-on:** ${t.avgLocal}%`,
        "**The store's rate applies:** tax follows the pickup store, not your home address",
        ...(i.kind === "city" ? [`**Inside ${w}:** local rates can sit above the state average`] : []),
      ] });
    }
    sections.push({
      id: "price-with-tax",
      h2: `What does the iPhone Duo cost in ${w} after sales tax?`,
      lead: t.combined === 0
        ? `**$1,999, the apple.com price**: ${i.state} charges no sales tax, so a 256GB iPhone Duo costs exactly that at pickup.`
        : `**About ${money(withTax(1999, i.state)!.total)}** for a 256GB iPhone Duo at pickup, once ${i.state}'s average combined sales tax of **${t.combined}%** is added to apple.com's $1,999.`,
      blocks,
    });
  }
  return sections;
}

/** The tax question for the FAQ (null when the state is not in the table). */
export function taxFaq(i: PlaceCopyInput): Faq | null {
  const t = SALES_TAX[i.state];
  if (!t) return null;
  return {
    q: `What is the iPhone Duo's price in ${placeName(i)} with tax?`,
    a: t.combined === 0
      ? `Exactly $1,999 for the 256GB: ${i.state} adds no sales tax at pickup, so the apple.com price is the final one.`
      : `About ${money(withTax(1999, i.state)!.total)} for the 256GB and ${money(withTax(2599, i.state)!.total)} for the 1TB at ${i.state}'s average combined rate of ${t.combined}%; the pickup store's own local rate sets the exact figure.`,
  };
}

/**
 * The /apple-stores hub's own questions, computed from the store list and the tax table (nothing typed in):
 * how many stores and where most of them are, and which Apple Store states charge no sales tax.
 */
export function hubFaq(): { count: Faq; taxFree: Faq } {
  const states = statesWithStores();
  const cities = citiesWithStores();
  const top = [...states].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 3);
  const free = states.filter((s) => SALES_TAX[s.name]?.combined === 0).map((s) => s.name);
  const highest = states.filter((s) => SALES_TAX[s.name]).sort((a, b) => SALES_TAX[b.name].combined - SALES_TAX[a.name].combined)[0];
  const cheapest = catalogFor("duo").reduce((a, b) => (b.price < a.price ? b : a));
  const taxed = withTax(cheapest.price, highest.name)!;
  return {
    count: { q: "How many Apple Stores does the US have, and where are they?", a: `${STORES.length}, in ${cities.length} cities across ${states.length - 1} states and Washington, D.C.; ${top[0].name} has the most (${top[0].count}), followed by ${top[1].name} (${top[1].count}) and ${top[2].name} (${top[2].count}).` },
    taxFree: { q: "Where can you pick up an iPhone at an Apple Store with no sales tax?", a: `${listWords(free)}: there an iPhone Duo ${cheapest.storage} costs its ${fmtPrice(cheapest.price)} list price at pickup, while in ${highest.name} (${taxed.rate}%, the highest average rate of any Apple Store state) the same phone comes to about ${fmtPrice(taxed.total)}.` },
  };
}
