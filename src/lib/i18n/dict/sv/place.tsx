/**
 * Swedish copy builders for a country's page tree (the English twin is lib/seo/countryCopy.ts), aimed at /sv-se/.
 * Titles open with the Swedish search phrasing (apple store sverige, apple mall of scandinavia, iphone duo pris);
 * intros answer first; then keyword sections, the price block (moms included) and FAQs. Sweden is the target, but
 * every country branch stays so each function covers all inputs.
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { alertHref, type FaqItem } from "@/lib/seo/enrich";
import { stamp } from "@/lib/i18n/format";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Dict } from "../en";
import { SV, apple, cap, color, dur, fit, klock, kr, land, n, noun, pc, pl, taxNote, taxWord, words } from "./util";

const TRACKING_START = Date.parse("2026-11-02T00:00:00Z");

/** Window wording: counted from the 2 November start while the 30-day window still reaches it, else 30 days back. */
function sinceWhen(now = Date.now()): string {
  return now - TRACKING_START < 30 * 86400_000 ? "sedan starten 2 november" : "på 30 dagar";
}

/** Date and time in the country's own zone. */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(SV, iso, COUNTRIES[cc].timeZone, true);
}

/** Stockholm's two stores sit in Solna and Täby; the city itself has none. */
const STOCKHOLM = new Set(["R626", "R505"]);

/* ------------------------------------------------------------------ sources */

/** Source links: Apple's pages for the country and the EU's own VAT table in Swedish. */
function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  const help = pickupHelp(code);
  const list = storeListSource(code);
  const tax: Source = code === "se"
    ? { label: "EU:s portal Your Europe – momssatser land för land", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_sv.htm" }
    : TAX_SOURCES[code];
  return {
    pickupHelp: { label: `Apple-support, ${land(code)}: leverans, hämtning och vad som krävs vid disken`, url: help.url },
    storeList: { label: `Apples butiksförteckning, ${land(code)}`, url: list.url },
    tax,
  };
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `I ${region} hamnar iPhone Duo 256GB runt ${kr(cc, t.total)}: ${kr(cc, duo)} från Apple plus ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label}.`;
    return `iPhone Duo 256GB: ${kr(cc, duo)} före skatt. Provinsen där du hämtar lägger till 5–15 % i kassan.`;
  }
  const r = includedRate(c);
  if (r == null) return `iPhone Duo 256GB vid hämtning: ${kr(cc, duo)}, slutpris. Ingen moms i Hongkong.`;
  return `iPhone Duo 256GB vid hämtning i ${land(cc)}: ${kr(cc, duo)}, slutpris med ${pc(r)} ${taxWord(c)}.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = cc === "us" ? TAX_SOURCES.ca : sources(cc).tax;
  const shop = c.buyPath ?? c.shopPath;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const parts = t.hst ? `${pc(t.hst)} HST` : t.pst ? `${pc(t.gst)} GST och ${pc(t.pst)} ${t.label.split(" + ")[1]}` : `${pc(t.gst)} GST (ingen provinsskatt)`;
      return {
        id: "price-with-tax",
        h2: `${m.name} i ${placeName}: vad blir priset med skatt?`,
        lead: `**Runt ${kr(cc, withProvinceTax(base, region!)!.total)}** för ${m.name} 256GB vid hämtning i ${placeName}. Grunden är Apples **${kr(cc, base)} före skatt**; ovanpå kommer ${parts} (${region}).`,
        blocks: [
          { t: "table", head: ["iPhone", "Pris på apple.com", `Med ${pc(t.total)} ${t.label}`], rows: rows.map(([label, p]) => [label, kr(cc, p), kr(cc, withProvinceTax(p, region!)!.total)]), caption: `${region}: iPhone-priser med ${t.label} (${pc(t.total)})`, source: `[${src.label}](${src.url}) · prisuppgifter: apple.com/ca` },
          { t: "note", text: "**Skattesatsen följer butiken:** provinsen där du hämtar gäller – inte provinsen du bor i." },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} i Kanada: pris med skatt i varje provins`,
      lead: `**${kr(cc, withProvinceTax(base, cheapest)!.total)} (${cheapest}) upp till ${kr(cc, withProvinceTax(base, dearest)!.total)} (${dearest})** för ${m.name} 256GB. Apple anger ${kr(cc, base)} före skatt; hämtprovinsen lägger till mellan ${pc(CA_PROVINCE_TAX[cheapest].total)} och ${pc(CA_PROVINCE_TAX[dearest].total)}.`,
      blocks: [{
        t: "table",
        head: ["Provins", "Skatteslag", "Total sats", `${m.short} 256GB inkl. skatt`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pc(CA_PROVINCE_TAX[p].total), kr(cc, withProvinceTax(base, p)!.total)]),
        caption: "Provinser med Apple Store: skatten som läggs på vid hämtning",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}) · prisuppgifter: apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tw = taxWord(c);
  return {
    id: "price",
    h2: `${m.name}-pris i ${land(cc)}: ${kr(cc, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `**${kr(cc, base)} – samma som på apple.com** – för ${m.name} 256GB vid hämtning i ${placeName}. Hongkong har **varken moms eller försäljningsskatt**.`
      : `**${kr(cc, base)}** för ${m.name} 256GB vid hämtning i ${placeName}. **${pc(r)} ${tw} ingår** (${kr(cc, beforeTax(c, base))} exkl. ${tw}), och kassan lägger inte till något.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "apple.com-pris"] : ["iPhone", "apple.com-pris", `Exkl. ${pc(r)} ${tw}`],
      rows: rows.map(([label, p]) => (r == null ? [label, kr(cc, p)] : [label, kr(cc, p), kr(cc, beforeTax(c, p))])),
      caption: `${land(cc)}: slutpris vid hämtning, enligt Apple${r == null ? "" : ` (inkl. ${tw})`}`,
      source: `[${src.label}](${src.url}) · prisuppgifter: apple.com/${shop}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `iPhone Duo i ${placeName}: vad blir det med skatt?`, a: `Runt ${kr(cc, t.total)} för 256GB. Hämtbutiken lägger ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label} på Apples ${kr(cc, duo)}.` }
      : { q: "Visar Apple Kanada priser med skatt?", a: `Nej. iPhone Duo 256GB står som ${kr(cc, duo)} före skatt; provinsen där du hämtar lägger till GST, HST eller provinsskatt – ${pc(5)} i Alberta, upp till ${pc(14.975)} i Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Tillkommer moms på iPhone i Hongkong?", a: `Nej, Hongkong har varken moms eller försäljningsskatt. iPhone Duo 256GB kostar ${kr(cc, duo)} vid hämtning, samma som på apple.com.` }
    : { q: `Är ${taxWord(c)} med i Apples priser i ${land(cc)}?`, a: `Ja. ${kr(cc, duo)} för iPhone Duo 256GB innehåller ${pc(r)} ${taxWord(c)}, och hämtningen kostar inget extra.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `Apple Store ${w}: iPhone Duo live i ${k === 2 ? "två av två butiker" : `${k} butiker`}`,
    `Apple Store ${w}: iPhone Duo-lager live`,
    `Apple Store ${w}: iPhone-lager just nu`,
    `Apple Store ${w}: iPhone-lager`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `. Duo-pris: ca ${kr(cc, t.total)} inkl. skatt (${region})` : `. Duo-pris: ${kr(cc, duo)} före skatt`; }
  return `. Duo-pris: ${kr(cc, duo)} ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `Just nu i ${w}: iPhone Duo att hämta i ${i.stockNow.duo} av ${k} Apple Store-butiker, 18 Pro Max i ${i.stockNow["18-pro-max"]}. Varje butik, påfyllningstider${priceBit(i.cc, i.region)}.`,
    `Just nu i ${w}: iPhone Duo att hämta i ${i.stockNow.duo} av ${k} Apple Store-butiker, 18 Pro Max i ${i.stockNow["18-pro-max"]}. Varje butik live, plus påfyllningstider.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `, ${pl(i.cities, "ort", "orter")}` : "";
  return `Att hämta i ${i.name} nu: iPhone Duo i **${duo}** av **${pl(k, "Apple Store", "Apple Store-butiker")}**${cities}. iPhone 18 Pro Max: **${i.stockNow["18-pro-max"]}**. iPhone 18 Pro: **${i.stockNow["18-pro"]}**.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**${have.length} av ${k} butiker har den**: iPhone Duo går att hämta på ${words(have.map((s) => apple(s)), 4)}.`;
  if (st.month > 0) return `**Ingen just nu.** Alla ${k} butiker saknar iPhone Duo för stunden – men de har fått in den **${pl(st.month, "gång", "gånger")}** ${sinceWhen()}.`;
  return `**Ingen just nu.** Alla ${k} butiker saknar iPhone Duo, och ingen bekräftad Duo-påfyllning finns ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Senast in:** ${apple(last)}, ${whenIn(i.cc, st.lastRestock.at)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Duo-påfyllningar ${sinceWhen()}:** ${n(st.month)} bekräftade i ${w}`);
  if (st.medianMs != null) items.push(`**Tid innan slut:** median ${dur(st.medianMs)} per Duo-påfyllning`);
  items.push(`**Bevakning:** [iPhone Duo i ${w}](${alert}) – välj ${k <= 3 ? (k === 2 ? "båda butikerna" : "alla tre butikerna") : `upp till ${Math.min(k, 5)} butiker nära dig`}. Bevakade butiker läses var 5:e sekund`);
  items.push("**Regel:** en bevakning = en butik × en exakt konfiguration. Notisen går ut cirka 3 sekunder efter att andra avläsningen bekräftat påfyllningen");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Läget vänder snabbt.** Med en bevakning ser du nästa påfyllning långt innan en manuell omladdning av apple.com hinner visa den." });
  blocks.push({ t: "ul", items });
  return blocks;
}

/** Storage + colour label from scarcest(), with the colour in Swedish. */
const cfg = (label: string) => { const [st, ...rest] = label.split(" "); return `${st} ${color(rest.join(" "))}`; };

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = i.name;
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const duoH2 = `iPhone Duo i ${w}: vilka butiker har den nu?`;
  return [
    { id: "iphone-duo", h2: duoH2, lead: duoLead(i), blocks: duoPoints(i, w, alert) },
    {
      id: "iphone-18-pro-max",
      h2: `Går iPhone 18 Pro Max att hämta i ${w}?`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**${i.stockNow["18-pro-max"]} av ${k} butiker har den.** Av ${n(k * pm)} möjliga par butik × konfiguration i ${w} är **${pc(pairsPct(i, "18-pro-max"))}** att hämta just nu.`
        : `**Ingen just nu.** iPhone 18 Pro Max saknas för hämtning i samtliga ${k} butiker i ${w}.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Knappast tillgång nu:** ${words(scarce.map((x) => `${cfg(x.label)} – ${x.stores}/${k} butiker`))}`] : []),
        `**iPhone 18 Pro:** att hämta i ${i.stockNow["18-pro"]}/${k} butiker · ${pc(pairsPct(i, "18-pro"))} av paren`,
        `**18 Pro Max-påfyllningar ${sinceWhen()}:** ${i.max.month ? `${n(i.max.month)} bekräftade` : "ännu ingen"}`,
        ...(i.max.medianMs != null ? [`**Tid innan slut:** median ${dur(i.max.medianMs)} per Pro Max-påfyllning`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  const hub = "Stockholm";
  const towns = [...new Set(storesOf(cc).map((s) => (STOCKHOLM.has(s.storeNumber) ? hub : s.city)))];
  towns.sort((x, y) => (x === hub ? -1 : y === hub ? 1 : x.localeCompare(y, "sv")));
  return fit([
    ...(cc === "se" ? [`Apple Store i Sverige – ${towns.join(" & ")}: iPhone Duo live`] : []),
    `Apple Store ${w}: iPhone Duo live i ${k === 2 ? "två av två butiker" : `${k} butiker`}`,
    `Apple Store ${w}: iPhone Duo-lager live`,
    `Apple Store ${w}: iPhone-lager, live`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  return fit([
    `iPhone-lager ${w}: hämtning live i ${k === 1 ? "Apple Store" : `${k} Apple Store-butiker`}`,
    `iPhone-lager ${w}: hämtning i butik, live`,
  ], 70);
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `iPhone-lager i ${land(cc)}: live i landets Apple Store` : `iPhone-lager i ${land(cc)}: live från ${k} Apple Store-butiker`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `landets enda Apple Store (${land(cc)})` : `varenda Apple Store i ${land(cc)} (${k} st.)`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const names = cities.map((x) => x.name);
  const towns = pl(cities.length, "ort", "orter");
  switch (true) {
    case storesOf(cc).length === 1: return `i ${names[0]}`;
    case names.length === 1: return `samtliga i ${names[0]}`;
    case names.length <= 4: return `i ${words([...names].sort((x, y) => x.localeCompare(y, "sv")))}`;
    case !c.regionNoun || regions.length === 1: return `på ${towns}`;
    default: return `på ${towns} fördelade över ${regions.length} ${noun(c, regions.length !== 1)}`;
  }
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const w = land(cc);
  const all = k === 1 ? "Apple Store" : k === 2 ? "två Apple Store" : `${k} Apple Store-butiker`;
  return {
    title: fit([`${m.name} i ${w}: lager live i ${all}`, `${m.name} i lager i ${w}? Live`, `${m.name}: lager i ${w}`], 70),
    h2: [`${m.name} i ${w}: vilka butiker har den nu?`, priceSection(cc, w, undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const priceText = cc === "ca" ? `**${kr(cc, r.low)}** före skatt` : `**${kr(cc, r.low)}**, ${taxNote(c)}`;
  const now = inStock === 0
    ? (k === 1 ? `${land(cc)}: ${m.name} går **inte** att hämta i landets enda Apple Store just nu` : `${land(cc)}: ${m.name} går **inte** att hämta i någon av ${k} Apple Store-butiker just nu`)
    : `${land(cc)}: ${m.name} går att hämta i **${inStock} av ${k}** Apple Store-butiker just nu`;
  return `${now}. Pris från ${priceText}. Kontroll av varje butik: **var 15:e sekund**.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fit([
    `${land(cc)} just nu: ${m.name} finns att hämta hos ${inStock} av ${k} Apple Store-butiker. Per butik och konfiguration, med påfyllningstider och pris från ${kr(cc, r.low)}${cc === "ca" ? " före skatt" : ""}.`,
    `${land(cc)} just nu: ${m.name} i ${inStock} av ${k} Apple Store-butiker. Hämtlager live per butik och konfiguration, påfyllningstider, bevakningar.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => {
    const link = `[${m.name}](${prefix}/in-stock/${m.slug})`;
    return [link, n(catalogFor(m.key, cc).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)];
  });
}

/* ------------------------------------------------------------------ country home */

function homeDescription(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const cur = COUNTRIES[cc].currency === "SEK" ? "kronor" : COUNTRIES[cc].currency;
  return fit([
    `Live från ${allStoresPhrase(cc)}: iPhone Duo, 18 Pro och 18 Pro Max för hämtning, kontrollerat var 15:e sekund. ${k === 1 ? "Priser" : "Påfyllningstider och priser"} i ${cur}; notis när din butik fyller på.`,
    `Live från ${allStoresPhrase(cc)}: iPhone Duo, 18 Pro och 18 Pro Max för hämtning, var 15:e sekund. Notis när din butik fyller på.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `Läget i ${land(cc)} nu: **{{duo.storesNow}} av ${k}** ${k === 1 ? "Apple Store-butik" : "Apple Store-butiker"} har iPhone Duo att hämta. iPhone 18 Pro Max: **{{pm.storesNow}}**. iPhone 18 Pro: **{{pro.storesNow}}**. Senast bekräftade Duo-påfyllning: **{{duo.lastRestock}}**.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  const w = land(cc);
  const by = cc !== "se" && c.regionNoun ? noun(c) : "ort";
  const unit = c.unit === "mi" ? "miles" : "kilometer";
  return [
    {
      id: "iphone-stock",
      h2: `iPhone-lager i ${w}: vad finns att hämta nu?`,
      lead: `Tabellen är live. Den bygger på apple.com:s egna besked om hämtning i butik för varje konfiguration i ${allStoresPhrase(cc)}, kontrollerat var 15:e sekund${k > 1 ? ` och uppdelat på butik, ${by} och konfiguration` : ""}.`,
      blocks: [
        { t: "table", head: ["Modell", "Konfigurationer", "Butiker med den nu", "Påfyllningar (bekräftade)"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `${w}, läge {{asOf}}` },
        { t: "ul", items: [
          "**Två avläsningar krävs:** en ändring publiceras först när nästa kontroll säger samma sak – ett felaktigt svar från apple.com blir aldrig påfyllning eller slutsålt",
          "**Första observationen räknas inte:** en konfiguration som dyker upp för första gången blir bara startläget",
          `**Allt utgår från loggen:** varje bekräftad ändring sparas i [påfyllningsloggen](${i.restocksPath}), och diagrammen på ${i.index?.indexable ? `[butikssidorna](${i.index.path})` : "butikssidan"} ritas därifrån`,
          `**Omfattning:** ${spreadPhrase(cc)}, med Apples priser och artikelnummer för ${w}. Bevakade butiker läses var 5:e sekund`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, w),
    {
      id: "alerts",
      h2: `Hur får jag en notis när en butik i ${w} fyller på?`,
      lead: `Välj ${k === 1 ? "butiken" : "butiker"} och exakt telefon. Listar ${k === 1 ? "butiken" : "någon av dem"} den för hämtning når notisen dig cirka 3 sekunder efter bekräftelsen.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `Under **Bevaka**: välj iPhone, lagring och färg. Butiken är given: ${apple(stores[0])}, ${stores[0].city}.` : `Under **Bevaka**: välj iPhone, lagring och färg och bocka sedan i butikerna inom räckhåll – närmast först, med ${unit} längs vägen och restid.`,
          "iPhone: lägg RestockWire på hemskärmen och tillåt notiser – iOS skickar webbnotiser bara till installerade appar ([guiden](/phone-alerts)).",
          "Notisen kommer: öppna apple.com via den, välj Hämta i butik och samma butik i kassan.",
        ] },
        { t: "table", head: ["Plan", "USD/månad", "Antal bevakningar"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "Bevakning = butik × exakt konfiguration. Att titta kostar inget, och alla planer har samma hastighet ([planer](/pricing))" },
        { t: "note", text: "**Vår linje:** bevaka Duo i varje butik du når. För 18 Pro och Pro Max – titta på livesiffrorna först." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const w = land(cc);
  const count = pl(rt.n, "påfyllning", "påfyllningar");
  const when = rt.n === 0
    ? `Ännu ingen bekräftad sedan starten 2 november. [Påfyllningstider för iPhone Duo i ${w}](${rt.path}) fylls på timme för timme och dag för dag när de kommer.`
    : rt.peakHour != null
      ? `Oftast kring **${klock(rt.peakHour)} lokal tid**. Underlag: ${count} (alla bekräftade) i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november. [Per timme och per dag](${rt.path}).`
      : `${cap(count)} (alla bekräftade) i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november – utspritt på för få dagar för en vanlig tid ännu. [Per timme och per dag](${rt.path}).`;
  return [
    { q: `iPhone Duo i ${w}: vilka Apple Store-butiker har den nu?`, a: `Vid senaste avläsningen ({{asOf}}): {{duo.storesNow}} av ${k}. [iPhone Duo-lager i ${w}](${p}/in-stock/iphone-duo) visar butik och konfiguration, uppdaterat var 15:e sekund.` },
    { q: `Vilken tid kommer iPhone Duo-påfyllningarna i ${w}?`, a: when },
    { q: `Hur fort upptäcker RestockWire en påfyllning i ${w}?`, a: `Bevakade butiker läses var 5:e sekund, ${k === 1 ? "butiken" : "alla butiker"} i ${w} minst var 15:e. Ett första ”tillgänglig” kontrolleras om inom en sekund, och den bekräftade påfyllningen når telefonen cirka 3 sekunder senare.` },
    { q: "Kostar det något att se lagret?", a: "Nej. Livelagret, kartan och påfyllningsloggen är fria. En plan ger bevakningar, i US-dollar: Plus $5/mån för 10, Pro $10 för 20, Max $20 för 50 – uppsägning när som helst ([priser](/pricing))." },
    taxFaq(cc, w),
    { q: "Håller en bevakning telefonen åt mig?", a: `Nej. Bara en apple.com-order med Hämta i butik reserverar. Bevakningen ger dig försprånget till kassan; när du betalat håller Apple telefonen ([Apple om hämtning](${pickupHelp(cc).url})).` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire iPhone-lager ${land(cc)}`,
  offer: "Gratis: livelager, karta och påfyllningslogg. Bevakningar från $5/mån",
  itemList: (cc: CountryCode) => `${land(cc)}: Apple Store-butiker`,
  restockTimesChip: "Klockslag för påfyllning",
  storesByRegion: (cc: CountryCode) => `Butiker, ${noun(COUNTRIES[cc])} för ${noun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `${land(cc)}: lager plats för plats`,
  selloutH2: (cc: CountryCode) => `Hur snabbt tar en iPhone-påfyllning slut i ${land(cc)}?`,
  selloutLabel: (cc: CountryCode) => `bland Apple Store-butikerna i ${land(cc)}`,
  last24Label: (cc: CountryCode) => `i ${land(cc)}`,
  newsroom: "Apple Newsroom (engelska, 23 okt. 2026): iPhone Duo lanseras i Apple Store världen över",
};

/**
 * Store <title> and H1 open with the store name, the way Swedish searches are phrased (apple mall of scandinavia,
 * apple täby centrum, apple emporia), then the stock promise. Both Stockholm-area stores get ", Stockholm"; Täby is
 * written Apple Store Täby Centrum; other towns are appended in parentheses when the name lacks them.
 */
function storeTitle(s: Store, region?: string): string {
  const stockholm = STOCKHOLM.has(s.storeNumber);
  const name = s.storeNumber === "R505" ? "Apple Store Täby Centrum" : apple(s);
  const shown = stockholm ? ", Stockholm" : region && !name.toLowerCase().includes(region.toLowerCase()) ? ` (${region})` : "";
  return fit([
    `${name}${shown}: iPhone-lager i dag, hämtning, öppettider`,
    `${name}${shown}: iPhone-lager i dag & öppettider`,
    `${name}${shown}: iPhone-lager i dag`,
    `${name}: iPhone-lager i dag & öppettider`,
    `${name}: iPhone-lager i dag`,
    `${name}: iPhone-lager`,
  ]);
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel: (_cc: CountryCode, name: string) => name,
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
  home,
  storeTitle,
  sources,
};
