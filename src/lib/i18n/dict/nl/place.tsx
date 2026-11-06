/**
 * Dutch strings: place — the copy builders of the country pages, written for the Netherlands (/nl-nl) and Belgium
 * (/nl-be): titles, Answer-First intros, keyword sections, price/btw sections and FAQs, from live numbers.
 * Same functions, arguments and return shapes as English (lib/seo/countryCopy.ts). Other countries get a correct
 * Dutch fallback (Canada's provincial tax, Hong Kong without VAT), though only NL and BE have Dutch pages.
 */
import * as CC from "@/lib/seo/countryCopy";
import type { IntlPlaceInput, HomeCopyInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax, TAX_SOURCES } from "@/content/country-tax";
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { alertHref, type FaqItem } from "@/lib/seo/enrich";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Block, Faq, Source } from "@/lib/content/types";
import { num, pct, price, stamp, list, fitTitleW, hour, unit, secs } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
const n$ = (v: number) => num(L, v);
/** "Nederland", "België". */
const land = (cc: CountryCode) => countryLabel(cc, L);
/** "in Nederland", "in de Verenigde Staten", "in het Verenigd Koninkrijk". */
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
const inC = (cc: CountryCode) => `in ${ARTICLE[cc] ?? ""}${land(cc)}`;
/** Apple's own store in the reader's language: NL apple.com/nl, Belgium's Dutch store apple.com/be-nl. */
const SHOP: Partial<Record<CountryCode, string>> = { nl: "nl", be: "be-nl" };
const shopOf = (cc: CountryCode) => SHOP[cc] ?? COUNTRIES[cc].buyPath ?? COUNTRIES[cc].shopPath;
/** The Dutch word for a country's regions (Dutch provinces, Belgian gewesten…). */
const NOUN: Record<string, [string, string]> = {
  state: ["staat", "staten"], province: ["provincie", "provincies"], area: ["gebied", "gebieden"], department: ["departement", "departementen"],
  prefecture: ["prefectuur", "prefecturen"], emirate: ["emiraat", "emiraten"], canton: ["kanton", "kantons"], region: ["gewest", "gewesten"],
  county: ["provincie", "provincies"], city: ["stad", "steden"],
};
const noun = (cc: CountryCode, many = false) => (NOUN[COUNTRIES[cc].regionNoun ?? "area"] ?? NOUN.area)[many ? 1 : 0];
/** The tax inside the price, in Dutch. */
const taxWord = (cc: CountryCode) => { const t = COUNTRIES[cc].taxNote; return /^VAT/.test(t) ? "btw" : /^GST/.test(t) ? "GST" : /^consumption/.test(t) ? "consumptiebelasting" : "btw"; };
/** "inclusief 21% btw", "zonder btw" (Hong Kong), "exclusief btw" (Canada, the US). */
const taxNote = (cc: CountryCode) => { const r = includedRate(COUNTRIES[cc]); return r == null ? (cc === "hk" ? "zonder btw" : "exclusief belasting") : `inclusief ${pct(L, r)} ${taxWord(cc)}`; };
/** A count with its noun. */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
/** "2 dagen", "1 u 5 min": how long a listing stayed up. */
const dur = (ms: number) => {
  const s = Math.round(ms / 1000);
  if (s < 60) return "minder dan een minuut";
  const m = Math.floor(s / 60);
  if (m < 60) return unit(L, m, "m");
  const h = Math.floor(m / 60);
  if (h < 24) return secs(L, m * 60);
  const d = Math.floor(h / 24);
  return h % 24 ? `${unit(L, d, "d")} ${unit(L, h % 24, "h")}` : unit(L, d, "d");
};
/** A place named in Dutch (idempotent: a Dutch name passes through). */
const placeName = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const appleOf = (s: Store) => appleStoreLabel(s, L);
const fitT = (v: string[], max = 60) => fitTitleW(v, max);

/* ------------------------------------------------------------------ time */

/** "sinds 2 november, toen de meting begon" while the 30-day window still reaches back to the start, else "in de afgelopen 30 dagen". */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${CC.INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "sinds 2 november, toen de meting begon" : "in de afgelopen 30 dagen";
}

/** "3 nov, 10:05 CET" in the country's zone. */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(L, iso, COUNTRIES[cc].timeZone, true);
}

/** A place that is also a US Apple Store city or state gets its country ("Manchester, Verenigd Koninkrijk"). */
function placeLabel(cc: CountryCode, name: string): string {
  return CC.placeLabel(cc, name) === name ? name : `${name}, ${land(cc)}`;
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const duo = CC.priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `Een iPhone Duo met 256GB komt in ${region} op ongeveer ${money(cc, t.total)}: Apples ${money(cc, duo)} plus ${pct(L, t.rate)} ${CA_PROVINCE_TAX[region!].label}.`;
    return `Een iPhone Duo met 256GB kost ${money(cc, duo)} exclusief belasting; de provincie van de ophaalwinkel telt aan de balie 5% tot 15% erbij.`;
  }
  const r = includedRate(COUNTRIES[cc]);
  if (r == null) return `${money(cc, duo)} is de volledige prijs van een iPhone Duo met 256GB bij ophalen: Hongkong rekent geen omzetbelasting.`;
  return `${money(cc, duo)} is de volledige prijs van een iPhone Duo met 256GB bij ophalen ${inC(cc)}, inclusief ${pct(L, r)} ${taxWord(cc)}.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** The EU's VAT page in Dutch, for the two Dutch-speaking countries; the English source elsewhere. */
function taxSource(cc: CountryCode): Source {
  if (cc === "nl" || cc === "be") return { label: "Your Europe (Europese Unie): btw-tarieven in de EU-lidstaten", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_nl.htm" };
  return TAX_SOURCES[cc as Exclude<CountryCode, "us">];
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = CC.priceOf(cc, model) ?? 0;
  const src = taxSource(cc);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = CC.priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const table: Block = {
        t: "table",
        head: ["iPhone", "Prijs op apple.com", `Met ${pct(L, t.total)} ${t.label}`],
        rows: rows.map(([label, p]) => [label, money(cc, p), money(cc, withProvinceTax(p, region!)!.total)]),
        caption: `Wat elke iPhone in ${region} kost met ${t.label} (${pct(L, t.total)})`,
        source: `[${src.label}](${src.url}); prijzen van apple.com/ca`,
      };
      const parts = t.hst ? `${pct(L, t.hst)} HST` : t.pst ? `${pct(L, t.gst)} GST en ${pct(L, t.pst)} ${t.label.split(" + ")[1]}` : `${pct(L, t.gst)} GST (geen provinciale belasting)`;
      return {
        id: "price-with-tax",
        h2: `Wat kost de ${m.name} in ${placeName} inclusief belasting?`,
        lead: `**Ongeveer ${money(cc, withProvinceTax(base, region!)!.total)}** voor de ${m.name} met 256GB in een winkel in ${placeName}: Apples **${money(cc, base)} exclusief belasting**, plus ${parts} van ${region}.`,
        blocks: [table, { t: "note", text: "**De ophaalwinkel bepaalt het tarief:** de provincie van de winkel telt, niet je woonadres." }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `Wat kost de ${m.name} in Canada inclusief belasting, per provincie?`,
      lead: `**Van ${money(cc, withProvinceTax(base, cheapest)!.total)} in ${cheapest} tot ${money(cc, withProvinceTax(base, dearest)!.total)} in ${dearest}** voor een ${m.name} met 256GB: Apples ${money(cc, base)} is exclusief belasting, en de provincie van de ophaalwinkel telt er ${pct(L, CA_PROVINCE_TAX[cheapest].total)} tot ${pct(L, CA_PROVINCE_TAX[dearest].total)} bij.`,
      blocks: [{
        t: "table",
        head: ["Provincie", "Belasting", "Tarief", `${m.short} 256GB met belasting`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pct(L, CA_PROVINCE_TAX[p].total), money(cc, withProvinceTax(base, p)!.total)]),
        caption: "Belasting op ophalen in de winkel, in elke provincie met een Apple Store",
        source: `[${src.label}](${src.url}); prijzen van apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxWord(cc);
  return {
    id: "price",
    h2: `Wat kost de ${m.name} ${inC(cc)}? ${money(cc, base)}, ${taxNote(cc)}`,
    lead: r == null
      ? `**${money(cc, base)}, precies de apple.com-prijs**, voor de ${m.name} met 256GB bij ophalen in ${placeName}: Hongkong rekent **geen omzetbelasting** of btw.`
      : `**${money(cc, base)}** voor de ${m.name} met 256GB bij ophalen in ${placeName}, met **${pct(L, r)} ${tn} al inbegrepen** (${money(cc, beforeTax(c, base))} zonder ${tn}); aan de balie komt er niets bij.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Prijs op apple.com"] : ["iPhone", "Prijs op apple.com", `Zonder ${pct(L, r)} ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(cc, p)] : [label, money(cc, p), money(cc, beforeTax(c, p))])),
      caption: `Prijzen van Apple ${inC(cc)}, zoals je ze bij ophalen betaalt${r == null ? "" : ` (${tn} inbegrepen)`}`,
      source: `[${src.label}](${src.url}); prijzen van apple.com/${shopOf(cc)}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const duo = CC.priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Wat is de prijs van de iPhone Duo in ${placeName} met belasting?`, a: `Ongeveer ${money(cc, t.total)} voor 256GB: ${pct(L, t.rate)} ${CA_PROVINCE_TAX[region!].label} van ${region} bovenop Apples ${money(cc, duo)}, gerekend door de ophaalwinkel.` }
      : { q: "Zit de belasting in Apples Canadese prijzen?", a: `Nee: de iPhone Duo met 256GB kost ${money(cc, duo)} exclusief belasting. De provincie van de ophaalwinkel telt GST, HST of provinciale belasting erbij, van 5% in Alberta tot ${pct(L, 14.975)} in Quebec.` };
  }
  const r = includedRate(COUNTRIES[cc]);
  return r == null
    ? { q: "Betaal je omzetbelasting op een iPhone in Hongkong?", a: `Nee: Hongkong kent geen omzetbelasting of btw. De iPhone Duo met 256GB kost bij ophalen ${money(cc, duo)}, precies zoals op apple.com.` }
    : { q: `Zit de ${taxWord(cc)} al in Apples prijzen ${inC(cc)}?`, a: `Ja: de ${money(cc, duo)} voor een iPhone Duo met 256GB is inclusief ${pct(L, r)} ${taxWord(cc)}. Aan de ophaalbalie komt er niets meer bij.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, placeName(i));
  if (n === 1) return fitT([`Apple Store in ${w}: iPhone Duo ophalen, live`, `Apple Store in ${w}: iPhone-voorraad nu`, `Apple Store ${w}: iPhone-voorraad`]);
  return fitT([
    `Apple Stores in ${w}: iPhone Duo ophalen in ${n === 2 ? "beide" : `alle ${n}`}, live`,
    `Apple Stores in ${w}: iPhone Duo ophalen, live`,
    `Apple Stores in ${w}: iPhone-voorraad nu`,
    `Apple Stores in ${w}: iPhone-voorraad`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const duo = CC.priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` en de Duo voor ca. ${money(cc, t.total)} met belasting van ${region}` : ` en de Duo voor ${money(cc, duo)} excl. belasting`; }
  return ` en de Duo voor ${money(cc, duo)}, ${taxNote(cc)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeLabel(i.cc, placeName(i));
  if (n === 1) {
    const one = appleOf(i.stores[0]);
    return fitT([
      `${one} in ${w} biedt de iPhone Duo nu ${i.stockNow.duo ? "wel" : "niet"} aan om op te halen, de 18 Pro Max ${i.stockNow["18-pro-max"] ? "wel" : "niet"}. Live, met aanvultijden${priceBit(i.cc, i.region)}.`,
      `${one} in ${w}: iPhone Duo nu ${i.stockNow.duo ? "wel" : "niet"} op te halen, 18 Pro Max ${i.stockNow["18-pro-max"] ? "wel" : "niet"}. Live, met aanvultijden.`,
    ], 155);
  }
  const verb = i.stockNow.duo === 1 ? "biedt" : "bieden";
  return fitT([
    `${n$(i.stockNow.duo)} van de ${n$(n)} Apple Stores in ${w} ${verb} de iPhone Duo nu aan om op te halen, ${n$(i.stockNow["18-pro-max"])} de 18 Pro Max. Per winkel, met aanvultijden${priceBit(i.cc, i.region)}.`,
    `${n$(i.stockNow.duo)} van de ${n$(n)} Apple Stores in ${w} ${verb} de iPhone Duo nu aan, ${n$(i.stockNow["18-pro-max"])} de 18 Pro Max. Live per winkel, met aanvultijden.`,
  ], 155);
}

/** Live state first: how many of the place's stores list each model at this minute. */
function placeIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeName(i);
  const pmNow = i.stockNow["18-pro-max"];
  const proNow = i.stockNow["18-pro"];
  if (n === 1) {
    const one = appleOf(i.stores[0]);
    return `**${one}**, de enige Apple Store in ${w}, biedt op dit moment ${i.stockNow.duo ? "**wel**" : "**geen**"} iPhone Duo aan om op te halen; de iPhone 18 Pro Max ${pmNow ? "**wel**" : "**niet**"}, de iPhone 18 Pro ${proNow ? "**wel**" : "**niet**"}.`;
  }
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, verspreid over ${cnt(i.cities, "stad", "steden")},` : "";
  return `**${n$(i.stockNow.duo)}** van de **${cnt(n, "Apple Store", "Apple Stores")}** in ${w}${cities} ${i.stockNow.duo === 1 ? "biedt" : "bieden"} op dit moment een iPhone Duo aan om op te halen; de iPhone 18 Pro Max staat op **${n$(pmNow)}**, de iPhone 18 Pro op **${n$(proNow)}**.`;
}

/** The scarcest configurations of a model across the place's stores (colour names in Dutch). */
function scarcest(i: IntlPlaceInput, model: ModelKey, k = 2): { label: string; stores: number }[] {
  return CC.scarcest(i, model, 99).map((x) => {
    const cut = x.label.indexOf(" ");
    return { label: cut < 0 ? x.label : `${x.label.slice(0, cut)} ${colorLabel(x.label.slice(cut + 1), L)}`, stores: x.stores };
  }).slice(0, k);
}

function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = CC.duoStoresNow(i);
  const st = i.duo;
  const since = sinceWhen();
  if (n === 1) {
    const one = appleOf(i.stores[0]);
    if (have.length > 0) return `**Ja**: ${one} biedt op dit moment een iPhone Duo aan om op te halen.`;
    if (st.month > 0) return `**Nu even niet**: ${one} biedt geen iPhone Duo aan, maar vulde hem ${since} wel **${n$(st.month)} keer** aan.`;
    return `**Nu even niet**: ${one} biedt geen iPhone Duo aan, en heeft ${since} nog geen bevestigde Duo-aanvulling.`;
  }
  if (have.length > 0) return `**Ja, bij ${n$(have.length)} van de ${n$(n)} winkels**: ${list(L, have.map(appleOf), 4, (k) => `nog ${n$(k)}`)} ${have.length === 1 ? "biedt" : "bieden"} op dit moment een iPhone Duo aan om op te halen.`;
  if (st.month > 0) return `**Nu even niet**: geen van de ${n$(n)} winkels biedt een iPhone Duo aan, al vulden ze hem samen ${since} **${n$(st.month)} keer** aan.`;
  return `**Nu even niet**: geen van de ${n$(n)} winkels biedt een iPhone Duo aan, en geen enkele heeft ${since} een bevestigde Duo-aanvulling.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = CC.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Laatste Duo-aanvulling hier:** ${whenIn(i.cc, st.lastRestock.at)} bij ${appleOf(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Bevestigd ${sinceWhen()}:** ${cnt(st.month, "Duo-aanvulling", "Duo-aanvullingen")} in ${n === 1 ? "deze winkel" : `de winkels in ${w}`}`);
  if (st.medianMs != null) items.push(`**Hoe lang hij beschikbaar blijft:** zo'n ${dur(st.medianMs)} (mediaan) voordat de Duo weer uitverkocht is`);
  const which = n === 1 ? "" : n <= 3 ? ` bij de ${n === 2 ? "twee" : "drie"} winkels waar je heen zou gaan` : ` bij de ${Math.min(n, 5)} dichtstbijzijnde winkels waar je heen zou gaan`;
  items.push(`**Snelste weg naar een exemplaar:** [zet een alert op de iPhone Duo in ${n === 1 ? appleOf(i.stores[0]) : w}](${alert})${which}; winkels met een alert worden elke 5 seconden gelezen`);
  items.push("**Eén alertregel** is één winkel × één exacte configuratie, en de push komt zo'n 3 seconden nadat een tweede check de aanvulling bevestigt");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Dat kan binnen een minuut anders zijn:** een alert ziet de volgende aanvulling lang voordat je hem met verversen op apple.com zou vinden." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeName(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: n === 1 ? `Heeft ${appleOf(i.stores[0])} in ${w} de iPhone Duo nu?` : `Welke Apple Stores in ${w} hebben de iPhone Duo nu?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `Is de iPhone 18 Pro Max op voorraad in ${w}?`,
      lead: n === 1
        ? (pmNow > 0
          ? `**Ja**: ${appleOf(i.stores[0])} biedt op dit moment **${pct(L, CC.pairsPct(i, "18-pro-max"))}** van de ${n$(pm)} configuraties van de iPhone 18 Pro Max aan om op te halen.`
          : `**Nu even niet**: ${appleOf(i.stores[0])} biedt geen iPhone 18 Pro Max aan om op te halen.`)
        : (pmNow > 0
          ? `**Ja, bij ${n$(pmNow)} van de ${n$(n)} winkels**, en op dit moment is **${pct(L, CC.pairsPct(i, "18-pro-max"))}** van de ${n$(n * pm)} combinaties van winkel × configuratie in ${w} beschikbaar.`
          : `**Nu even niet**: geen van de ${n$(n)} winkels in ${w} biedt een iPhone 18 Pro Max aan om op te halen.`),
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Nu het moeilijkst te vinden:** ${list(L, scarce.map((x) => `${x.label} (${n === 1 ? (x.stores ? "beschikbaar" : "niet beschikbaar") : `${n$(x.stores)} van ${n$(n)} winkels`})`))}`] : []),
        `**iPhone 18 Pro:** ${n === 1 ? (i.stockNow["18-pro"] ? "beschikbaar" : "nu niet beschikbaar") : `${n$(i.stockNow["18-pro"])} van ${n$(n)} winkels`}, ${pct(L, CC.pairsPct(i, "18-pro"))} van de ${n === 1 ? "configuraties" : "combinaties"} beschikbaar`,
        `**Bevestigd ${sinceWhen()}:** ${i.max.month ? cnt(i.max.month, "18 Pro Max-aanvulling", "18 Pro Max-aanvullingen") : "nog geen 18 Pro Max-aanvulling"}`,
        ...(i.max.medianMs != null ? [`**Hoe lang hij beschikbaar blijft:** zo'n ${dur(i.max.medianMs)} (mediaan) voordat een Pro Max weer uitverkocht is`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = land(cc);
  return fitT([
    n === 1 ? `Apple Store ${inC(cc)}: iPhone Duo ophalen, live` : `Apple Stores ${inC(cc)}: iPhone Duo ophalen in ${n === 2 ? "beide" : `alle ${n}`}, live`,
    `Apple Stores ${inC(cc)}: iPhone Duo ophalen, live`,
    `Apple Stores ${w}: iPhone-voorraad, live`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = land(cc);
  return fitT([
    `iPhone-voorraadchecker ${w}: live ophalen ${n === 1 ? "in de Apple Store" : `in ${n$(n)} Apple Stores`}`,
    `iPhone-voorraadchecker ${w}: live ophaalvoorraad`,
  ], 70);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `Live iPhone-ophaalvoorraad in de Apple Store ${inC(cc)}` : `Live iPhone-ophaalvoorraad in alle ${n$(n)} Apple Stores ${inC(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `de enige Apple Store ${inC(cc)}` : `alle ${n$(n)} Apple Stores ${inC(cc)}`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `in ${cityLabel(cc, cities[0].name, L)}`;
  if (cities.length === 1) return `allemaal in ${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `in ${cnt(cities.length, "stad", "steden")}`;
  return `in ${cnt(cities.length, "stad", "steden")}, verspreid over ${n$(regions.length)} ${noun(cc, regions.length !== 1)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "de Apple Store" : n === 2 ? "beide Apple Stores" : `alle ${n} Apple Stores`;
  return {
    title: fitT([`Is de ${m.name} op voorraad ${inC(cc)}? ${all[0].toUpperCase()}${all.slice(1)}, live`, `Is de ${m.name} op voorraad ${inC(cc)}? Live`, `${m.name}-voorraad ${inC(cc)}`], 70),
    h2: [n === 1 ? `Heeft de Apple Store ${inC(cc)} de ${m.name} nu?` : `Welke Apple Stores ${inC(cc)} hebben de ${m.name} nu?`, priceSection(cc, land(cc), undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = CC.priceRange(cc, model);
  const priceTxt = cc === "ca" ? `**${money(cc, r.low)}** exclusief belasting` : `**${money(cc, r.low)}**, ${taxNote(cc)}`;
  const lead = inStock === 0
    ? (n === 1 ? `Op dit moment biedt de Apple Store ${inC(cc)} de ${m.name} **niet** aan om op te halen` : `Op dit moment biedt **geen** van de ${n$(n)} Apple Stores ${inC(cc)} de ${m.name} aan om op te halen`)
    : `Op dit moment ${inStock === 1 ? "biedt" : "bieden"} **${n$(inStock)} van de ${n$(n)}** Apple Stores ${inC(cc)} de ${m.name} aan om op te halen`;
  return `${lead} (elke winkel wordt **elke 15 seconden** gelezen); prijzen vanaf ${priceTxt}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = CC.priceRange(cc, model);
  const verb = inStock === 1 ? "biedt" : "bieden";
  return fitT([
    `${n$(inStock)} van de ${n$(n)} Apple Stores ${inC(cc)} ${verb} de ${m.name} op dit moment aan om op te halen. Per winkel en per configuratie, vanaf ${money(cc, r.low)}${cc === "ca" ? " excl. belasting" : ""}, met aanvultijden.`,
    `${n$(inStock)} van de ${n$(n)} Apple Stores ${inC(cc)} ${verb} de ${m.name} nu aan. Live ophaalvoorraad per winkel en configuratie, aanvultijden en alerts.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, n$(catalogFor(m.key, cc).length), n$(storesNow[m.key] ?? 0), n$(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = c.currency === "EUR" ? "euro" : c.currency;
  return fitT([
    `Live ophaalvoorraad van de iPhone Duo, 18 Pro en 18 Pro Max in ${allStoresPhrase(cc)}, elke 15 seconden gelezen. ${n === 1 ? "Prijzen" : "Aanvultijden en prijzen"} in ${cur}, en een push zodra je winkel aanvult.`,
    `Live ophaalvoorraad van de iPhone Duo, 18 Pro en 18 Pro Max in ${allStoresPhrase(cc)}, elke 15 seconden gelezen, met een push zodra je winkel aanvult.`,
  ], 160);
}

function homeIntro(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const latest = `Laatste bevestigde aanvulling van de iPhone Duo ${inC(cc)}: **{{duo.lastRestock}}**.`;
  if (n === 1) {
    const s = appleOf(storesOf(cc)[0]);
    return `${latest} Op dit moment biedt ${s} **{{duo.pairsNow}} van de {{duo.pairsTotal}}** iPhone Duo-configuraties aan om op te halen, **{{pm.pairsNow}}** van de iPhone 18 Pro Max en **{{pro.pairsNow}}** van de iPhone 18 Pro.`;
  }
  return `${latest} Op dit moment bieden **{{duo.storesNow}} van de ${n$(n)}** Apple Stores een Duo aan om op te halen, **{{pm.storesNow}}** een iPhone 18 Pro Max en **{{pro.storesNow}}** een iPhone 18 Pro.`;
}

/** Where people look for a store that isn't there (Google Ads: "apple store rotterdam" 1,600, "apple store utrecht" 1,300 a month). */
const NO_STORE_HERE: Partial<Record<CountryCode, string>> = {
  nl: "**Geen Apple Store in Rotterdam of Utrecht:** vanuit Rotterdam is Apple Den Haag het dichtstbij (hemelsbreed zo'n 20 km), vanuit Utrecht Apple Amsterdam (zo'n 35 km)",
  be: "**Geen Apple Store in Antwerpen of Gent:** Apple Brussels is de enige in België, hemelsbreed zo'n 45 km van Antwerpen en 50 km van Gent",
};

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const stores = storesOf(cc);
  const unitWord = c.unit === "mi" ? "mijl" : "kilometers";
  return [
    {
      id: "iphone-stock",
      h2: `Welke iPhones zijn nu op voorraad ${inC(cc)}?`,
      lead: `De tabel geeft het antwoord, live: de eigen ophaalbeschikbaarheid van apple.com voor elke configuratie in ${allStoresPhrase(cc)}, elke 15 seconden gelezen${n > 1 ? ` en uitgesplitst per winkel, per ${c.regionNoun ? noun(cc) : "stad"} en per configuratie` : ""}.`,
      blocks: [
        { t: "table", head: ["Model", "Configuraties", "Winkels die hem nu aanbieden", "Bevestigde aanvullingen"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Live stand ${inC(cc)} van {{asOf}}` },
        { t: "ul", items: [
          "**Bevestigd betekent twee keer:** een wijziging verschijnt pas als een tweede check het bevestigt, dus één haperend antwoord van apple.com wordt nooit een aanvulling of uitverkoop",
          "**Een eerste waarneming is geen aanvulling:** een configuratie die we voor het eerst zien, legt alleen de beginstand vast",
          `**Het logboek is de bron:** elke bevestigde wijziging gaat het [voorraadlogboek](${i.restocksPath}) in, dat de grafieken tekent op ${i.index?.indexable ? `[de winkelpagina's](${i.index.path})` : "de winkelpagina"}`,
          `**Dekking:** ${spreadPhrase(cc)}, met Apples eigen prijzen en artikelnummers voor ${land(cc)}; winkels met een alert worden elke 5 seconden gelezen`,
          ...(NO_STORE_HERE[cc] ? [NO_STORE_HERE[cc]!] : []),
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, land(cc)),
    {
      id: "alerts",
      h2: `Hoe werken aanvulalerts ${inC(cc)}?`,
      lead: `Je kiest de winkel${n === 1 ? "" : "s"} en de exacte iPhone; zodra ${n === 1 ? "de winkel" : "een ervan"} hem aanbiedt om op te halen, staat er zo'n 3 seconden na de bevestiging een push op je telefoon.`,
      blocks: [
        { t: "ol", items: [
          n === 1 ? `Kies onder **Waarschuw me** de iPhone, de opslag en de kleur; de winkel is ${appleOf(stores[0])} in ${cityLabel(cc, stores[0].city, L)}.` : `Kies onder **Waarschuw me** de iPhone, de opslag en de kleur, en vink de winkels aan waar je kunt komen; de dichtstbijzijnde staan bovenaan, met ${unitWord} over de weg en reistijd.`,
          "Zet RestockWire op een iPhone op je beginscherm en sta meldingen toe; iOS bezorgt webpush alleen aan een geïnstalleerde app ([zo installeer je het](/phone-alerts)).",
          "Komt de push binnen, open apple.com dan vanuit de melding en reken af met ophalen in die winkel.",
        ] },
        { t: "table", head: ["Abonnement", "Per maand (USD)", "Alertregels"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Eén regel = één winkel × één exacte configuratie; rondkijken blijft gratis, en de snelheid is op elk abonnement gelijk ([prijzen](/pricing))" },
        { t: "note", text: "**Onze inschatting:** de Duo verdient een alert bij elke winkel waar je kunt komen; kijk bij de 18 Pro en Pro Max eerst naar de live cijfers." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const one = n === 1 ? appleOf(storesOf(cc)[0]) : null;
  const at = one ? `bij ${one}` : `in ${n$(rt.stores)} van de ${n$(rt.storesTotal)} winkels`;
  const when = rt.n === 0
    ? `Nog geen enkele bevestigd sinds de meting op 2 november begon. [Wanneer vult Apple de iPhone Duo aan ${inC(cc)}?](${rt.path}) telt ze per lokaal uur en per dag zodra ze binnenkomen.`
    : rt.peakHour != null
      ? `De meeste komen rond **${hour(L, rt.peakHour, true)} lokale tijd**: ${cnt(rt.n, "bevestigde aanvulling", "bevestigde aanvullingen")} ${at} sinds 2 november. [Per uur en per dag](${rt.path}).`
      : `${cnt(rt.n, "bevestigde aanvulling", "bevestigde aanvullingen")} ${at} sinds 2 november, op te weinig dagen om al een vast uur te noemen. [Per uur en per dag](${rt.path}).`;
  return [
    one
      ? { q: `Biedt ${one} de iPhone Duo op dit moment aan?`, a: `Bij de laatste check ({{asOf}}) stonden er {{duo.pairsNow}} van de {{duo.pairsTotal}} configuraties klaar. [iPhone Duo-voorraad ${inC(cc)}](${p}/in-stock/iphone-duo) toont elke configuratie en ververst elke 15 seconden.` }
      : { q: `Welke Apple Stores ${inC(cc)} bieden de iPhone Duo op dit moment aan?`, a: `{{duo.storesNow}} van de ${n$(n)} bij de laatste check ({{asOf}}). [iPhone Duo-voorraad ${inC(cc)}](${p}/in-stock/iphone-duo) noemt elke winkel en configuratie en ververst elke 15 seconden.` },
    { q: `Wanneer vult Apple de iPhone Duo aan ${inC(cc)}?`, a: when },
    { q: `Hoe snel ziet RestockWire een aanvulling ${inC(cc)}?`, a: `Winkels met een alert worden elke 5 seconden gelezen, ${n === 1 ? `de Apple Store ${inC(cc)}` : `elke Apple Store ${inC(cc)}`} elke 15; een eerste "beschikbaar" wordt binnen een seconde opnieuw gelezen. De bevestigde aanvulling staat zo'n 3 seconden later op je telefoon.` },
    { q: "Heb ik een abonnement nodig om de voorraad te bekijken?", a: "Nee: live voorraad, de kaart en het voorraadlogboek zijn gratis. Een abonnement voegt alertregels toe, afgerekend in Amerikaanse dollars: Plus $5 per maand voor 10, Pro $10 voor 20, Max $20 voor 50, op te zeggen wanneer je wilt ([prijzen](/pricing))." },
    taxFaq(cc, land(cc)),
    { q: "Houdt een alert de iPhone voor me vast?", a: `Nee; dat doet alleen een bestelling om op te halen op apple.com. Met de alert ben je als eerste bij het afrekenen, en Apple legt het toestel apart zodra je betaald hebt ([Apple: hulp bij ophalen](${sources(cc as Exclude<CountryCode, "us">).pickupHelp.url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire iPhone-voorraadchecker ${land(cc)}`,
  offer: "Live voorraad, de kaart en het voorraadlogboek zijn gratis; alertabonnementen vanaf $5 per maand",
  itemList: (cc: CountryCode) => `Apple Stores ${inC(cc)}`,
  restockTimesChip: "Aanvultijden",
  storesByRegion: (cc: CountryCode) => `Winkels per ${noun(cc)}`,
  browse: (cc: CountryCode) => `Voorraad per plaats ${inC(cc)}`,
  selloutH2: (cc: CountryCode) => `Hoe lang blijft een iPhone-aanvulling ${inC(cc)} beschikbaar?`,
  selloutLabel: (cc: CountryCode) => (storesOf(cc).length === 1 ? `in de Apple Store ${inC(cc)}` : `in de Apple Stores ${inC(cc)}`),
  last24Label: (cc: CountryCode) => inC(cc),
  newsroom: "Apple Newsroom: iPhone Duo komt naar Apple Stores wereldwijd (23 oktober 2026)",
};

/**
 * Store page <title> and H1: "Apple Den Haag: live iPhone-voorraad, aanvultijden, ophalen". People search the store's
 * name as they say it ("apple brussel"), so a store named after its city reads with the Dutch city name.
 */
function storeTitle(s: Store, region?: string): string {
  const cc = s.country ?? "us";
  const city = cityLabel(cc, s.city, L);
  const name = s.name === s.city && city !== s.city ? `Apple ${city}` : appleOf(s);
  const shown = region && !name.toLowerCase().includes(region.toLowerCase()) && !s.name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  const r = shown ? ` (${shown})` : "";
  return fitT([
    `${name}${r}: live iPhone-voorraad, aanvultijden, ophalen`,
    `${name}${r}: live iPhone-voorraad & aanvultijden`,
    `${name}${r}: live iPhone-voorraad & openingstijden`,
    `${name}: live iPhone-voorraad, aanvultijden, ophalen`,
    `${name}: live iPhone-voorraad & openingstijden`,
    `${name}: live iPhone-voorraad`,
    `${name} – live voorraad`,
  ]);
}

/** Apple's pickup help and store list in Dutch (NL: apple.com/nl; Belgium: the be-nl store and the benl store list). */
function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  if (code === "nl") return {
    pickupHelp: { label: "Apple: hulp bij levering en ophalen (Nederland): wat je meeneemt bij het ophalen", url: "https://www.apple.com/nl/shop/help/shipping_delivery" },
    storeList: { label: "Apple: lijst van Apple Stores (Nederland)", url: "https://www.apple.com/nl/retail/storelist/" },
    tax: taxSource(code),
  };
  if (code === "be") return {
    pickupHelp: { label: "Apple: hulp bij levering en ophalen (België): wat je meeneemt bij het ophalen", url: "https://www.apple.com/be-nl/shop/help/shipping_delivery" },
    storeList: { label: "Apple: lijst van Apple Stores (België)", url: "https://www.apple.com/benl/retail/storelist/" },
    tax: taxSource(code),
  };
  return { pickupHelp: pickupHelp(code), storeList: storeListSource(code), tax: TAX_SOURCES[code] };
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
  sources,
};

