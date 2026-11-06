/**
 * Italian strings: place — the copy builders of the country pages (Italian version of lib/seo/countryCopy.ts):
 * titles, Answer-First intros, keyword sections, price/IVA sections and FAQs, built from live numbers.
 * Titles lead with what Italians type: "Apple Store Roma", "Apple Store Italia", "Apple Via del Corso", "iPhone Duo prezzo".
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { INTL_TRACKING_SINCE, priceOf, priceRange, scarcest, pairsPct, duoStoresNow, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { fitTitleW, list, pct, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import { IT, aLuogo, aggettivo, dei, eur, il, inPaese, leOre, n as N, paese, pl, regione, taxIt, taxNoteIt } from "./util";

/* ------------------------------------------------------------------ small pieces */

/** "dal 2 novembre, quando è iniziato il monitoraggio" while the 30-day window reaches back to the start, else "negli ultimi 30 giorni". */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "dal 2 novembre, quando è iniziato il monitoraggio" : "negli ultimi 30 giorni";
}

/** Place names that are also US Apple Store cities or states get the country ("Manchester, Regno Unito"). */
const US_NAMES = new Set([...citiesWithStores("us").map((c) => c.name.toLowerCase()), ...statesWithStores("us").map((s) => s.name.toLowerCase())]);
function placeLabel(cc: CountryCode, name: string): string {
  return US_NAMES.has(name.toLowerCase()) ? `${name}, ${paese(cc)}` : name;
}

/** The page's place in Italian: a city or a region (province). */
const localName = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, IT) : regionLabel(i.cc, i.name, IT));
/** Italy's region pages are provinces with several towns: "Roma e provincia" (the store index passes the whole country, no slug). */
const withProvince = (i: IntlPlaceInput, w: string) => (i.kind === "state" && i.cc === "it" && i.regionSlug ? `${w} e provincia` : w);

const apple = (s: Store) => appleStoreLabel(s, IT);
const ha = (k: number) => (k === 1 ? "ha" : "hanno");
/** "256GB Night Sky" (English label) → "256GB Cielo notturno". */
const cfgIt = (label: string) => label.replace(/^(\S+) (.+)$/, (_m, st: string, col: string) => `${st} ${colorLabel(col, IT)}`);
const CURRENCY: Record<string, string> = { EUR: "euro", USD: "dollari USA", GBP: "sterline", CHF: "franchi svizzeri", JPY: "yen", CAD: "dollari canadesi", AUD: "dollari australiani", SEK: "corone svedesi", KRW: "won", HKD: "dollari di Hong Kong", SGD: "dollari di Singapore", AED: "dirham", TWD: "dollari taiwanesi" };

/* ------------------------------------------------------------------ tax */

/** "nessuno dei 5 negozi … ha" / "il negozio … non ha" (one store). */
const nessunoHa = (n: number, rest = "") => (n === 1 ? `il negozio${rest} non ha` : `nessuno ${dei(n)} negozi${rest} ha`);

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Un iPhone Duo da 256GB arriva a circa ${eur(c, t.total)} in ${region}: i ${eur(c, duo)} di Apple più la ${CA_PROVINCE_TAX[region!].label} del ${t.rate}%.`;
    return `Un iPhone Duo da 256GB costa ${eur(c, duo)} tasse escluse; la provincia del negozio di ritiro aggiunge dal 5% al 15% alla cassa.`;
  }
  const r = includedRate(c);
  if (r == null) return `${eur(c, duo)} è il prezzo completo di un iPhone Duo da 256GB al ritiro: Hong Kong non applica imposte sulle vendite.`;
  return `${eur(c, duo)} è il prezzo completo di un iPhone Duo da 256GB al ritiro ${inPaese(cc)}, ${taxIt(c)} al ${pct(IT, r)} inclusa.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** Italy's tax source in Italian (Your Europe has every EU language); elsewhere the English one. */
function taxSource(cc: Exclude<CountryCode, "us">): Source {
  const src = TAX_SOURCES[cc];
  if (src.url.includes("europa.eu/youreurope")) return { label: "La tua Europa (Unione europea): aliquote IVA applicate nei paesi dell'UE", url: src.url.replace(/index_en\.htm$/, "index_it.htm") };
  return src;
}
function pickupHelpIt(cc: CountryCode): Source {
  const s = pickupHelp(cc);
  return cc === "it" ? { label: "Apple: Spedizione e ritiro (cosa portare al ritiro)", url: s.url } : s;
}
function storeListIt(cc: CountryCode): Source {
  const s = storeListSource(cc);
  return cc === "it" ? { label: "Apple: elenco degli Apple Store (Italia)", url: s.url } : s;
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["iPhone", "Prezzo su apple.com", `Con ${t.label} (${pct(IT, t.total)})`],
        rows: rows.map(([label, p]) => [label, eur(c, p), eur(c, withProvinceTax(p, region!)!.total)]),
        caption: `Quanto costa ogni iPhone in ${region} con ${t.label} (${pct(IT, t.total)})`,
        source: `[${src.label}](${src.url}); prezzi da apple.com/ca`,
      };
      const parts = t.hst ? `l'HST del ${t.hst}%` : t.pst ? `la GST del ${t.gst}% e la ${t.label.split(" + ")[1]} del ${t.pst}%` : `la GST del ${t.gst}% (senza imposta provinciale)`;
      return {
        id: "price-with-tax",
        h2: `Quanto costa l'${m.name} ${aLuogo(placeName)} con le tasse?`,
        lead: `**Circa ${eur(c, withProvinceTax(base, region!)!.total)}** per l'${m.name} da 256GB in un negozio ${aLuogo(placeName)}: i **${eur(c, base)} tasse escluse** di Apple, più ${parts} (${region}).`,
        blocks: [table, { t: "note", text: "**L'aliquota la decide il negozio di ritiro:** conta la sua provincia, non il tuo indirizzo." }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `Quanto costa l'${m.name} in Canada con le tasse, provincia per provincia?`,
      lead: `**Da ${eur(c, withProvinceTax(base, cheapest)!.total)} in ${cheapest} a ${eur(c, withProvinceTax(base, dearest)!.total)} in ${dearest}** per un ${m.name} da 256GB: i ${eur(c, base)} di Apple sono tasse escluse, e la provincia del negozio di ritiro aggiunge un'imposta compresa tra ${pct(IT, CA_PROVINCE_TAX[cheapest].total)} e ${pct(IT, CA_PROVINCE_TAX[dearest].total)}.`,
      blocks: [{
        t: "table",
        head: ["Provincia", "Imposta", "Aliquota", `${m.short} 256GB con le tasse`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(IT, CA_PROVINCE_TAX[p].total), eur(c, withProvinceTax(base, p)!.total)]),
        caption: "Imposte su un ritiro in negozio, in ogni provincia con un Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); prezzi da apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxIt(c);
  return {
    id: "price",
    h2: `Quanto costa l'${m.name} ${inPaese(cc)}? ${eur(c, base)}, ${taxNoteIt(c)}`,
    lead: r == null
      ? `**${eur(c, base)}, esattamente il prezzo di apple.com**, per l'${m.name} da 256GB al ritiro ${aLuogo(placeName)}: Hong Kong non applica **imposte sulle vendite** né IVA.`
      : `**${eur(c, base)}** per l'${m.name} da 256GB al ritiro ${aLuogo(placeName)}, con **${tn} al ${pct(IT, r)} già inclusa** (${eur(c, beforeTax(c, base))} senza ${tn}); alla cassa non si aggiunge nulla.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Prezzo su apple.com"] : ["iPhone", "Prezzo su apple.com", `Senza ${tn} (${pct(IT, r)})`],
      rows: rows.map(([label, p]) => (r == null ? [label, eur(c, p)] : [label, eur(c, p), eur(c, beforeTax(c, p))])),
      caption: `Prezzi dell'Apple Store online ${aggettivo(cc)}, come si pagano al ritiro${r == null ? "" : ` (${tn} inclusa)`}`,
      source: `[${src.label}](${src.url}); prezzi da apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Quanto costa l'iPhone Duo ${aLuogo(placeName)} con le tasse?`, a: `Circa ${eur(c, t.total)} per il 256GB: la ${CA_PROVINCE_TAX[region!].label} del ${pct(IT, t.rate)} (${region}) in aggiunta ai ${eur(c, duo)} di Apple, applicata dal negozio di ritiro.` }
      : { q: "Le tasse sono incluse nei prezzi Apple in Canada?", a: `No: l'iPhone Duo da 256GB costa ${eur(c, duo)} tasse escluse. La provincia del negozio di ritiro aggiunge GST, HST o imposta provinciale, dal 5% in Alberta al 14,975% in Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "A Hong Kong si pagano imposte sulle vendite su un iPhone?", a: `No: Hong Kong non ha imposte sulle vendite né IVA. L'iPhone Duo da 256GB costa ${eur(c, duo)} al ritiro, esattamente come indicato su apple.com.` }
    : { q: `L'${taxIt(c)} è già inclusa nei prezzi Apple ${inPaese(cc)}?`, a: `Sì: i ${eur(c, duo)} di un iPhone Duo da 256GB includono l'${taxIt(c)} al ${pct(IT, r)}. Alla cassa del ritiro non si aggiunge altro.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, localName(i));
  const where = withProvince(i, w);
  return fitTitleW([
    `Apple Store ${where}: ritiro iPhone Duo ${n === 2 ? "in entrambi i negozi" : `nei ${N(n)} negozi`}, in tempo reale`,
    `Apple Store ${where}: ritiro iPhone Duo in tempo reale`,
    `Apple Store ${where}: disponibilità iPhone adesso`,
    `Apple Store ${where}: disponibilità iPhone`,
    `Apple Store ${w}: disponibilità iPhone`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` e l'iPhone Duo a circa ${eur(c, t.total)} con le tasse (${region})` : ` e l'iPhone Duo a ${eur(c, duo)} tasse escluse`; }
  return ` e l'iPhone Duo a ${eur(c, duo)}, ${taxNoteIt(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const where = aLuogo(withProvince(i, placeLabel(i.cc, localName(i))));
  const duo = i.stockNow.duo, pm = i.stockNow["18-pro-max"];
  return fitTitleW([
    `${N(duo)} Apple Store su ${N(n)} ${where} ${ha(duo)} l'iPhone Duo per il ritiro adesso, ${N(pm)} l'iPhone 18 Pro Max. Negozio per negozio, con gli orari dei rifornimenti${priceBit(i.cc, i.region)}.`,
    `${N(duo)} Apple Store su ${N(n)} ${where} ${ha(duo)} l'iPhone Duo adesso, ${N(pm)} il 18 Pro Max. In tempo reale per negozio, con gli orari dei rifornimenti.`,
  ], 155);
}

/** One sentence, live state first: how many of the place's stores list each model at this minute. */
function placeIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const duo = i.stockNow.duo;
  const where = aLuogo(withProvince(i, localName(i)));
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, distribuiti in ${N(i.cities)} città,` : "";
  return `In questo momento **${N(duo)}** su **${N(n)} Apple Store** ${where}${cities} ${ha(duo)} un iPhone Duo disponibile per il ritiro; l'iPhone 18 Pro Max è in **${N(i.stockNow["18-pro-max"])}**, l'iPhone 18 Pro in **${N(i.stockNow["18-pro"])}**.`;
}

function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(IT, iso, COUNTRIES[cc].timeZone, true);
}

/** The Duo section's one-sentence answer to "which stores have it right now?". */
function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Sì, in ${have.length === 1 ? "1 negozio" : `${N(have.length)} negozi`} su ${N(n)}**: ${list(IT, have.map(apple), 4, (k) => `altri ${N(k)}`)} ${ha(have.length)} un iPhone Duo disponibile per il ritiro in questo momento.`;
  if (st.month > 0) return `**Non in questo momento**: ${nessunoHa(n)} un iPhone Duo, anche se ${n === 1 ? "è stato rifornito" : "insieme l'hanno rifornito"} **${pl(st.month, "volta", "volte")}** ${sinceWhen()}.`;
  return `**Non in questo momento**: ${nessunoHa(n)} un iPhone Duo, e non c'è nessun rifornimento di Duo confermato ${sinceWhen()}.`;
}

/** The Duo section's key points: the last restock, the record, how long a listing lasted, and the alert. */
function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Ultimo rifornimento di Duo qui:** ${whenIn(i.cc, st.lastRestock.at)} da ${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Confermati ${sinceWhen()}:** ${pl(st.month, "rifornimento di iPhone Duo", "rifornimenti di iPhone Duo")} nei negozi ${aLuogo(w)}`);
  if (st.medianMs != null) items.push(`**Quanto dura una disponibilità:** circa ${fmtDuration(st.medianMs, IT)} (mediana) prima che il Duo si esaurisca di nuovo`);
  const which = n === 1 ? "nel negozio" : n <= 3 ? `nei ${n === 2 ? "due" : "tre"} negozi` : `nei ${Math.min(n, 5)} negozi più vicini`;
  items.push(`**La via più rapida per averne uno:** [metti l'iPhone Duo sul filo ${aLuogo(w)}](${alert}) ${which} in cui andresti davvero; i negozi con avvisi vengono letti ogni 5 secondi`);
  items.push("**Una regola di avviso** è un negozio × una configurazione esatta, e la notifica arriva circa 3 secondi dopo che una seconda lettura ha confermato il rifornimento");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Cambia da un minuto all'altro:** un avviso vede il prossimo rifornimento molto prima di quanto farebbe un aggiornamento di apple.com." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = withProvince(i, localName(i));
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pmN = catalogFor("18-pro-max", i.cc).length;
  const pm = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `Quali Apple Store ${aLuogo(w)} hanno l'iPhone Duo in questo momento?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `L'iPhone 18 Pro Max è disponibile ${aLuogo(w)}?`,
      lead: pm > 0
        ? `**Sì, in ${pm === 1 ? "1 negozio" : `${N(pm)} negozi`} su ${N(n)}**, con **${il(pct(IT, pairsPct(i, "18-pro-max")))}** delle ${N(n * pmN)} combinazioni negozio × configurazione ${aLuogo(w)} disponibile in questo momento.`
        : `**Non in questo momento**: ${nessunoHa(n, ` ${aLuogo(w)}`)} un iPhone 18 Pro Max per il ritiro.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**${scarce.length === 1 ? "Il più difficile" : "I più difficili"} da trovare adesso:** ${list(IT, scarce.map((x) => `${cfgIt(x.label)} (in ${N(x.stores)} negozi su ${N(n)})`))}`] : []),
        `**iPhone 18 Pro:** ${N(i.stockNow["18-pro"])} negozi su ${N(n)}, ${pct(IT, pairsPct(i, "18-pro"))} delle sue combinazioni disponibili`,
        `**Confermati ${sinceWhen()}:** ${i.max.month ? pl(i.max.month, "rifornimento di 18 Pro Max", "rifornimenti di 18 Pro Max") : "ancora nessun rifornimento di 18 Pro Max"}`,
        ...(i.max.medianMs != null ? [`**Quanto dura una disponibilità:** circa ${fmtDuration(i.max.medianMs, IT)} (mediana) prima che un Pro Max si esaurisca di nuovo`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const where = inPaese(cc);
  const all = n === 1 ? "" : n === 2 ? " in entrambi i negozi" : ` in tutti i ${N(n)} negozi`;
  return fitTitleW([`Apple Store ${where}: ritiro iPhone Duo${all}, in tempo reale`, `Apple Store ${where}: ritiro iPhone Duo in tempo reale`, `Apple Store ${where}: disponibilità iPhone in tempo reale`], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const p = paese(cc);
  return fitTitleW([
    ...(n > 1 ? [`Apple Store ${p}: disponibilità iPhone in tempo reale nei ${N(n)} negozi`] : []),
    `Apple Store ${p}: disponibilità iPhone per il ritiro in tempo reale`,
    `Apple Store ${p}: disponibilità iPhone`,
  ]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `Disponibilità iPhone per il ritiro in tempo reale nell'Apple Store ${inPaese(cc)}` : `Disponibilità iPhone per il ritiro in tempo reale in tutti i ${N(n)} Apple Store ${inPaese(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `l'unico Apple Store ${inPaese(cc)}` : `tutti i ${N(n)} Apple Store ${inPaese(cc)}`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  const city0 = cityLabel(cc, cities[0].name, IT);
  if (n === 1) return aLuogo(city0);
  if (cities.length === 1) return `tutti ${aLuogo(city0)}`;
  if (!c.regionNoun || regions.length === 1) return `in ${N(cities.length)} città`;
  return `in ${N(cities.length)} città di ${N(regions.length)} ${regione(c, regions.length !== 1)}`;
}

/** The model page's bound titles: "iPhone Duo disponibile in Italia? Tutti i 17 Apple Store, in tempo reale". */
function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const where = inPaese(cc);
  const all = n === 1 ? "L'Apple Store" : n === 2 ? "Entrambi gli Apple Store" : `Tutti i ${N(n)} Apple Store`;
  return {
    title: fitTitleW([`${m.name} disponibile ${where}? ${all}, in tempo reale`, `${m.name} disponibile ${where}? In tempo reale`, `${m.name}: disponibilità ${where}`], 70),
    h2: [`Quali Apple Store ${where} hanno l'${m.name} in questo momento?`, priceSection(cc, paese(cc), undefined, model).h2],
  };
}

/** The model page's answer-first intro. */
function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const where = inPaese(cc);
  const price = cc === "ca" ? `**${eur(c, r.low)}** tasse escluse` : `**${eur(c, r.low)}**, ${taxNoteIt(c)}`;
  const now = inStock === 0
    ? (n === 1 ? `In questo momento l'Apple Store ${where} **non ha** l'${m.name} per il ritiro` : `In questo momento **nessuno** ${dei(n)} Apple Store ${where} ha l'${m.name} per il ritiro`)
    : `In questo momento **${N(inStock)} su ${N(n)}** Apple Store ${where} ${ha(inStock)} l'${m.name} per il ritiro`;
  return `${now} (ogni negozio viene letto **ogni 15 secondi**); prezzi a partire da ${price}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const where = inPaese(cc);
  return fitTitleW([
    `${N(inStock)} Apple Store su ${N(n)} ${where} ${ha(inStock)} l'${m.name} per il ritiro in questo momento. Negozio per negozio e configurazione per configurazione, da ${eur(c, r.low)}${cc === "ca" ? " tasse escluse" : ""}, con gli orari dei rifornimenti.`,
    `${N(inStock)} Apple Store su ${N(n)} ${where} ${ha(inStock)} l'${m.name} adesso. Disponibilità per il ritiro per negozio e configurazione, orari dei rifornimenti e avvisi.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, N(catalogFor(m.key, cc).length), N(storesNow[m.key] ?? 0), N(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = CURRENCY[c.currency] ?? c.currency;
  return fitTitleW([
    `Disponibilità di iPhone Duo, 18 Pro e 18 Pro Max per il ritiro in ${allStoresPhrase(cc)}, letta ogni 15 secondi. ${n === 1 ? "Prezzi" : "Orari dei rifornimenti e prezzi"} in ${cur}, e una notifica appena il tuo negozio viene rifornito.`,
    `Disponibilità di iPhone Duo, 18 Pro e Pro Max per il ritiro ${n === 1 ? `nell'Apple Store ${inPaese(cc)}` : `nei ${N(n)} Apple Store ${inPaese(cc)}`}, ogni 15 secondi. Orari dei rifornimenti, prezzi in ${cur} e notifiche.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return `Ultimo rifornimento confermato di iPhone Duo ${inPaese(cc)}: **{{duo.lastRestock}}**. In questo momento **{{duo.storesNow}} Apple Store su ${N(n)}** hanno un Duo per il ritiro, **{{pm.storesNow}}** un iPhone 18 Pro Max e **{{pro.storesNow}}** un iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const where = inPaese(cc);
  const r = c.regionNoun ? regione(c) : "città";
  return [
    {
      id: "iphone-stock",
      h2: `Quali iPhone sono disponibili ${where} in questo momento?`,
      lead: `La tabella risponde in tempo reale: la disponibilità per il Ritiro in negozio di apple.com per ogni configurazione in ${allStoresPhrase(cc)}, letta ogni 15 secondi${n > 1 ? ` e suddivisa per negozio, per ${r} e per configurazione` : ""}.`,
      blocks: [
        { t: "table", head: ["Modello", "Configurazioni", "Negozi che lo hanno ora", "Rifornimenti confermati"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Il filo ${where}, situazione al {{asOf}}` },
        { t: "ul", items: [
          "**Confermato vuol dire due volte:** un cambiamento viene pubblicato solo quando una seconda lettura lo conferma, così una risposta anomala di apple.com non appare mai come un rifornimento o un esaurimento",
          "**Il primo avvistamento non è un rifornimento:** una configurazione vista per la prima volta fissa solo il punto di partenza",
          `**La fonte è il registro:** ogni cambiamento confermato finisce nel [registro dei rifornimenti](${i.restocksPath}), da cui nascono i grafici dei rifornimenti ${i.index?.indexable ? `delle [pagine dei negozi](${i.index.path})` : "della pagina del negozio"}`,
          `**Copertura:** ${spreadPhrase(cc)}, con i prezzi e i codici prodotto dell'Apple Store online ${aggettivo(cc)}; i negozi con avvisi vengono letti ogni 5 secondi`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, paese(cc)),
    {
      id: "alerts",
      h2: `Come funzionano gli avvisi di rifornimento ${where}?`,
      lead: `Scegli ${n === 1 ? "il negozio" : "i negozi"} e l'iPhone esatto; quando ${n === 1 ? "il negozio" : "uno di essi"} lo rende disponibile per il Ritiro in negozio, ti arriva una notifica sul telefono circa 3 secondi dopo la conferma del rifornimento.`,
      blocks: [
        { t: "ol", items: [
          n === 1 ? `Scegli iPhone, capacità e colore in **Avvisami**; il negozio è ${apple(stores[0])}, ${cityLabel(cc, stores[0].city, IT)}.` : "Scegli iPhone, capacità e colore in **Avvisami**, poi seleziona i negozi che puoi raggiungere: i più vicini sono in cima, con i chilometri su strada e il tempo in auto.",
          "Su iPhone aggiungi RestockWire alla schermata Home e consenti le notifiche: iOS consegna le notifiche web solo a un'app installata ([come installarla](/phone-alerts)).",
          "Quando arriva la notifica, aprila per andare su apple.com e completa l'acquisto con il Ritiro in negozio in quel negozio.",
        ] },
        { t: "table", head: ["Piano", "Al mese (USD)", "Regole di avviso"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Una regola = un negozio × una configurazione esatta; consultare la disponibilità resta gratis, e la velocità è la stessa su tutti i piani ([prezzi](/pricing))" },
        { t: "note", text: "**Il nostro parere:** l'iPhone Duo merita un avviso in ogni negozio che puoi raggiungere; per 18 Pro e Pro Max guarda prima i numeri in tempo reale." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const where = inPaese(cc);
  const when = rt.n === 0
    ? `Nessuno confermato finora, da quando il monitoraggio è iniziato il 2 novembre. [Quando torna disponibile l'iPhone Duo ${where}?](${rt.path}) li conta per ora e giorno locali man mano che arrivano.`
    : rt.peakHour != null
      ? `La maggior parte arriva verso **${leOre(rt.peakHour)}, ora locale**: ${pl(rt.n, "rifornimento confermato", "rifornimenti confermati")} in ${N(rt.stores)} negozi su ${N(rt.storesTotal)} dal 2 novembre. [Ora per ora e giorno per giorno](${rt.path}).`
      : `${pl(rt.n, "rifornimento confermato", "rifornimenti confermati")} in ${N(rt.stores)} negozi su ${N(rt.storesTotal)} dal 2 novembre, in troppo pochi giorni per indicare ancora un orario abituale. [Ora per ora e giorno per giorno](${rt.path}).`;
  return [
    { q: `Quali Apple Store ${where} hanno l'iPhone Duo in questo momento?`, a: `{{duo.storesNow}} su ${N(n)} all'ultima lettura ({{asOf}}). [Disponibilità iPhone Duo ${where}](${p}/in-stock/iphone-duo) indica ogni negozio e configurazione e si aggiorna ogni 15 secondi.` },
    { q: `Quando torna disponibile l'iPhone Duo ${where}?`, a: when },
    { q: `Quanto velocemente RestockWire vede un rifornimento ${where}?`, a: `I negozi con avvisi vengono letti ogni 5 secondi e tutti gli Apple Store ${where} ogni 15; un primo «disponibile» viene riletto entro un secondo. Il rifornimento confermato arriva sul tuo telefono circa 3 secondi dopo.` },
    { q: "Serve un piano per consultare la disponibilità?", a: "No: disponibilità in tempo reale, mappa e registro dei rifornimenti sono gratis. Un piano aggiunge le regole di avviso, addebitate in dollari USA: Plus $5 al mese per 10, Pro $10 per 20, Max $20 per 50, e si disdice quando vuoi ([prezzi](/pricing))." },
    taxFaq(cc, paese(cc)),
    { q: "Un avviso mi tiene da parte il telefono?", a: `No: lo fa solo un ordine su apple.com con ritiro in negozio. L'avviso ti porta per primo al pagamento, e Apple tiene da parte l'apparecchio una volta che hai pagato ([aiuto Apple sul ritiro](${pickupHelpIt(cc).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire: verifica disponibilità iPhone ${paese(cc)}`,
  offer: "Disponibilità in tempo reale, mappa e registro dei rifornimenti sono gratis; i piani di avviso partono da $5 al mese",
  itemList: (cc: CountryCode) => `Apple Store ${inPaese(cc)}`,
  restockTimesChip: "Orari dei rifornimenti",
  storesByRegion: (cc: CountryCode) => `Negozi per ${regione(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `Disponibilità per luogo ${inPaese(cc)}`,
  selloutH2: (cc: CountryCode) => `Quanto dura un rifornimento di iPhone ${inPaese(cc)}?`,
  selloutLabel: (cc: CountryCode) => `negli Apple Store ${inPaese(cc)}`,
  last24Label: (cc: CountryCode) => inPaese(cc),
  newsroom: "Apple Newsroom (in inglese): iPhone Duo arriva negli Apple Store di tutto il mondo (23 ottobre 2026)",
};

/** "Apple Via del Corso: disponibilità iPhone oggi, ritiro e orari"; `region` (Italian) when it is the city's or province's only store. */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, IT);
  const shown = region && !s.name.toLowerCase().includes(region.toLowerCase()) && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  const r = shown ? ` (${shown})` : "";
  return fitTitleW([
    `${name}${r}: disponibilità iPhone oggi, ritiro e orari`,
    `${name}${r}: disponibilità iPhone oggi e orari`,
    `${name}${r}: disponibilità iPhone e orari`,
    `${name}: disponibilità iPhone oggi, ritiro e orari`,
    `${name}: disponibilità iPhone e orari`,
    `${name}: disponibilità iPhone`,
    `${name} – disponibilità`,
  ]);
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel,
  whenIn,
  taxSentence,
  priceSection,
  taxFaq,
  placeTitle,
  placeDescription,
  placeIntro,
  placeSections,
  storesIndexTitle,
  homeTitle,
  homeH1,
  allStoresPhrase,
  spreadPhrase,
  modelPageTitles,
  modelIntro,
  modelDescription,
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({ pickupHelp: pickupHelpIt(code), storeList: storeListIt(code), tax: taxSource(code) }),
};
