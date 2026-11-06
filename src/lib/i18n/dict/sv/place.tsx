/**
 * Swedish strings: place — the copy builders of a country's page tree (English: lib/seo/countryCopy.ts), written
 * for /sv-se/…: titles that lead with what Swedes type ("apple store sverige", "apple mall of scandinavia",
 * "iphone duo pris"), Answer-First intros, keyword sections, the price/tax section (moms ingår) and FAQs.
 * Built for Sweden; the other countries' branches are kept so the functions stay complete.
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

/** "sedan bevakningen startade den 2 november" while the 30-day window reaches back to the start, else "de senaste 30 dagarna". */
function sinceWhen(now = Date.now()): string {
  return now - TRACKING_START < 30 * 86400_000 ? "sedan bevakningen startade den 2 november" : "de senaste 30 dagarna";
}

/** "2 nov. 15:04 CET" in the country's zone. */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(SV, iso, COUNTRIES[cc].timeZone, true);
}

/** The Stockholm stores: there is no Apple Store inside Stockholm city, Solna and Täby are where Stockholm shops. */
const STOCKHOLM = new Set(["R626", "R505"]);

/* ------------------------------------------------------------------ sources */

/** Apple's Swedish pages, and Your Europe's VAT page in Swedish. */
function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  const help = pickupHelp(code);
  const list = storeListSource(code);
  const tax: Source = code === "se"
    ? { label: "Your Europe (EU): momssatser i EU-länderna", url: "https://europa.eu/youreurope/business/taxation/vat/vat-rules-rates/index_sv.htm" }
    : TAX_SOURCES[code];
  return {
    pickupHelp: { label: `Apple: hjälp om leverans och hämtning (${land(code)}) – vad du ska ta med när du hämtar`, url: help.url },
    storeList: { label: `Apple: butikslista (${land(code)})`, url: list.url },
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
    if (t) return `En iPhone Duo med 256GB landar på ungefär ${kr(cc, t.total)} i ${region}: Apples ${kr(cc, duo)} plus ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label}.`;
    return `En iPhone Duo med 256GB kostar ${kr(cc, duo)} utan skatt; hämtbutikens provins lägger på 5–15 % i kassan.`;
  }
  const r = includedRate(c);
  if (r == null) return `${kr(cc, duo)} är hela priset för en iPhone Duo med 256GB vid hämtning: Hongkong tar inte ut någon moms.`;
  return `${kr(cc, duo)} är hela priset för en iPhone Duo med 256GB vid hämtning i ${land(cc)}, ${pc(r)} ${taxWord(c)} inräknad.`;
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
        h2: `Vad kostar ${m.name} i ${placeName} med skatt?`,
        lead: `**Ungefär ${kr(cc, withProvinceTax(base, region!)!.total)}** för ${m.name} med 256GB i en butik i ${placeName}: Apples **${kr(cc, base)} utan skatt** plus ${region}s ${parts}.`,
        blocks: [
          { t: "table", head: ["iPhone", "Pris på apple.com", `Med ${pc(t.total)} ${t.label}`], rows: rows.map(([label, p]) => [label, kr(cc, p), kr(cc, withProvinceTax(p, region!)!.total)]), caption: `Vad varje iPhone kostar i ${region} med ${t.label} (${pc(t.total)})`, source: `[${src.label}](${src.url}); priser från apple.com/ca` },
          { t: "note", text: "**Hämtbutiken avgör skatten:** det är butikens provins som bestämmer satsen, inte din hemadress." },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `Vad kostar ${m.name} i Kanada med skatt, provins för provins?`,
      lead: `**Från ${kr(cc, withProvinceTax(base, cheapest)!.total)} i ${cheapest} till ${kr(cc, withProvinceTax(base, dearest)!.total)} i ${dearest}** för en ${m.name} med 256GB: Apples ${kr(cc, base)} är utan skatt, och hämtbutikens provins lägger på ${pc(CA_PROVINCE_TAX[cheapest].total)} till ${pc(CA_PROVINCE_TAX[dearest].total)}.`,
      blocks: [{
        t: "table",
        head: ["Provins", "Skatt", "Sats", `${m.short} 256GB med skatt`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, pc(CA_PROVINCE_TAX[p].total), kr(cc, withProvinceTax(base, p)!.total)]),
        caption: "Skatt vid hämtning i butik, i varje provins med en Apple Store",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); priser från apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tw = taxWord(c);
  return {
    id: "price",
    h2: `Vad kostar ${m.name} i ${land(cc)}? ${kr(cc, base)}, ${taxNote(c)}`,
    lead: r == null
      ? `**${kr(cc, base)}, exakt priset på apple.com**, för ${m.name} med 256GB vid hämtning i ${placeName}: Hongkong tar ut **ingen moms** eller försäljningsskatt.`
      : `**${kr(cc, base)}** för ${m.name} med 256GB vid hämtning i ${placeName}, med **${pc(r)} ${tw} redan inräknad** (${kr(cc, beforeTax(c, base))} utan ${tw}); inget läggs till i kassan.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "Pris på apple.com"] : ["iPhone", "Pris på apple.com", `Utan ${pc(r)} ${tw}`],
      rows: rows.map(([label, p]) => (r == null ? [label, kr(cc, p)] : [label, kr(cc, p), kr(cc, beforeTax(c, p))])),
      caption: `Apples priser i ${land(cc)}, så som du betalar dem vid hämtning${r == null ? "" : ` (${tw} inräknad)`}`,
      source: `[${src.label}](${src.url}); priser från apple.com/${shop}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `Vad kostar iPhone Duo i ${placeName} med skatt?`, a: `Ungefär ${kr(cc, t.total)} för 256GB: ${region}s ${pc(t.rate)} ${CA_PROVINCE_TAX[region!].label} ovanpå Apples ${kr(cc, duo)}, som hämtbutiken tar ut.` }
      : { q: "Ingår skatten i Apples kanadensiska priser?", a: `Nej: iPhone Duo med 256GB kostar ${kr(cc, duo)} utan skatt. Hämtbutikens provins lägger på GST, HST eller provinsskatt, från ${pc(5)} i Alberta till ${pc(14.975)} i Québec.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "Betalar man moms på en iPhone i Hongkong?", a: `Nej: Hongkong har ingen moms eller försäljningsskatt. iPhone Duo med 256GB kostar ${kr(cc, duo)} vid hämtning, exakt som på apple.com.` }
    : { q: `Ingår ${taxWord(c)} redan i Apples priser i ${land(cc)}?`, a: `Ja: ${kr(cc, duo)} för en iPhone Duo med 256GB inkluderar ${pc(r)} ${taxWord(c)}. Inget mer läggs till när du hämtar i butiken.` };
}

/* ------------------------------------------------------------------ region / city pages */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `Apple Store ${w}: hämta iPhone Duo i ${k === 2 ? "båda butikerna" : `alla ${k} butiker`}, live`,
    `Apple Store ${w}: hämta iPhone Duo, live`,
    `Apple Store ${w}: iPhone i lager nu`,
    `Apple Store ${w}: iPhone i lager`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? ` och Duo för ca ${kr(cc, t.total)} med skatt i ${region}` : ` och Duo för ${kr(cc, duo)} utan skatt`; }
  return ` och Duo för ${kr(cc, duo)} ${taxNote(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = i.name;
  return fit([
    `${i.stockNow.duo} av ${k} Apple Store-butiker i ${w} listar iPhone Duo för hämtning nu, ${i.stockNow["18-pro-max"]} 18 Pro Max. Butik för butik, med påfyllningstider${priceBit(i.cc, i.region)}.`,
    `${i.stockNow.duo} av ${k} Apple Store-butiker i ${w} listar iPhone Duo nu, ${i.stockNow["18-pro-max"]} 18 Pro Max. Live per butik, med påfyllningstider.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` (fördelade på ${pl(i.cities, "stad", "städer")})` : "";
  return `**${duo}** av **${pl(k, "Apple Store", "Apple Store-butiker")}** i ${i.name}${cities} listar en iPhone Duo för hämtning just nu; iPhone 18 Pro Max finns i **${i.stockNow["18-pro-max"]}**, iPhone 18 Pro i **${i.stockNow["18-pro"]}**.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**Ja, i ${have.length} av ${k} butiker**: ${words(have.map((s) => apple(s)), 4)} listar en iPhone Duo för hämtning just nu.`;
  if (st.month > 0) return `**Inte just nu**: ingen av de ${k} butikerna listar en iPhone Duo, men tillsammans har de fyllt på den **${pl(st.month, "gång", "gånger")}** ${sinceWhen()}.`;
  return `**Inte just nu**: ingen av de ${k} butikerna listar en iPhone Duo, och ingen har en bekräftad påfyllning av Duo ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**Senaste påfyllning av Duo här:** ${whenIn(i.cc, st.lastRestock.at)} på ${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**Bekräftat ${sinceWhen()}:** ${pl(st.month, "påfyllning av Duo", "påfyllningar av Duo")} i butikerna i ${w}`);
  if (st.medianMs != null) items.push(`**Så länge en listning räcker:** ungefär ${dur(st.medianMs)} i median innan Duo är slutsåld igen`);
  items.push(`**Snabbaste vägen till en:** [bevaka iPhone Duo i ${w}](${alert}) i ${k <= 3 ? (k === 2 ? "de två butikerna" : "de tre butikerna") : `de ${Math.min(k, 5)} närmaste butikerna`} du kan ta dig till; butiker med bevakning läses av var 5:e sekund`);
  items.push("**En bevakning** är en butik × en exakt konfiguration, och notisen kommer ungefär 3 sekunder efter att en andra avläsning bekräftat påfyllningen");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**Det kan ändras på en minut:** en bevakning ser nästa påfyllning långt innan en omladdning av apple.com skulle göra det." });
  blocks.push({ t: "ul", items });
  return blocks;
}

/** "256GB Night Sky" (scarcest's English label) → "256GB natthimmel". */
const cfg = (label: string) => { const [st, ...rest] = label.split(" "); return `${st} ${color(rest.join(" "))}`; };

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = i.name;
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    { id: "iphone-duo", h2: `Vilka Apple Store-butiker i ${w} har iPhone Duo just nu?`, lead: duoLead(i), blocks: duoPoints(i, w, alert) },
    {
      id: "iphone-18-pro-max",
      h2: `Finns iPhone 18 Pro Max i lager i ${w}?`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**Ja, i ${i.stockNow["18-pro-max"]} av ${k} butiker**, med **${pc(pairsPct(i, "18-pro-max"))}** av de ${n(k * pm)} kombinationerna av butik × konfiguration i ${w} listade just nu.`
        : `**Inte just nu**: ingen av de ${k} butikerna i ${w} listar en iPhone 18 Pro Max för hämtning.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**Svårast att hitta just nu:** ${words(scarce.map((x) => `${cfg(x.label)} (${x.stores} av ${k} butiker)`))}`] : []),
        `**iPhone 18 Pro:** ${i.stockNow["18-pro"]} av ${k} butiker, ${pc(pairsPct(i, "18-pro"))} av kombinationerna listade`,
        `**Bekräftat ${sinceWhen()}:** ${i.max.month ? pl(i.max.month, "påfyllning av 18 Pro Max", "påfyllningar av 18 Pro Max") : "ingen påfyllning av 18 Pro Max än"}`,
        ...(i.max.medianMs != null ? [`**Så länge en listning räcker:** ungefär ${dur(i.max.medianMs)} i median innan en Pro Max är slutsåld igen`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  const towns = [...new Set(storesOf(cc).map((s) => (STOCKHOLM.has(s.storeNumber) ? "Stockholm" : s.city)))].sort((a, b) => (a === "Stockholm" ? -1 : b === "Stockholm" ? 1 : a.localeCompare(b, "sv")));
  return fit([
    ...(cc === "se" ? [`Apple Store Sverige: ${towns.join(" & ")} – hämta iPhone Duo, live`] : []),
    `Apple Store ${w}: hämta iPhone Duo i ${k === 2 ? "båda butikerna" : `alla ${k} butiker`}, live`,
    `Apple Store ${w}: hämta iPhone Duo, live`,
    `Apple Store ${w}: iPhone i lager, live`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = land(cc);
  return fit([
    `iPhone-lagerkoll ${w}: hämtning live i ${k === 1 ? "Apple Store" : `${k} Apple Store-butiker`}`,
    `iPhone-lagerkoll ${w}: lager för hämtning live`,
  ], 70);
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `iPhone-lager för hämtning live i Apple Store i ${land(cc)}` : `iPhone-lager för hämtning live i alla ${k} Apple Store-butiker i ${land(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `den enda Apple Store-butiken i ${land(cc)}` : `alla ${k} Apple Store-butiker i ${land(cc)}`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const k = storesOf(cc).length;
  if (k === 1) return `i ${cities[0].name}`;
  if (cities.length === 1) return `alla i ${cities[0].name}`;
  if (cities.length <= 4) return `i ${words(cities.map((x) => x.name).sort((a, b) => a.localeCompare(b, "sv")))}`;
  if (!c.regionNoun || regions.length === 1) return `i ${pl(cities.length, "stad", "städer")}`;
  return `i ${pl(cities.length, "stad", "städer")} i ${regions.length} ${noun(c, regions.length !== 1)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const w = land(cc);
  const all = k === 1 ? "Apple Store" : k === 2 ? "båda Apple Store-butikerna" : `alla ${k} Apple Store-butiker`;
  return {
    title: fit([`Finns ${m.name} i lager i ${w}? ${cap(all)}, live`, `Finns ${m.name} i lager i ${w}? Live`, `${m.name} i lager i ${w}`], 70),
    h2: [`Vilka Apple Store-butiker i ${w} har ${m.name} just nu?`, priceSection(cc, w, undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const priceText = cc === "ca" ? `**${kr(cc, r.low)}** utan skatt` : `**${kr(cc, r.low)}**, ${taxNote(c)}`;
  const now = inStock === 0
    ? (k === 1 ? `Just nu listar Apple Store-butiken i ${land(cc)} **inte** ${m.name} för hämtning` : `Just nu listar **ingen** av de ${k} Apple Store-butikerna i ${land(cc)} ${m.name} för hämtning`)
    : `Just nu listar **${inStock} av ${k}** Apple Store-butiker i ${land(cc)} ${m.name} för hämtning`;
  return `${now} (varje butik läses av **var 15:e sekund**); priserna börjar på ${priceText}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fit([
    `${inStock} av ${k} Apple Store-butiker i ${land(cc)} listar ${m.name} för hämtning just nu. Butik för butik och konfiguration för konfiguration, från ${kr(cc, r.low)}${cc === "ca" ? " utan skatt" : ""}, med påfyllningstider.`,
    `${inStock} av ${k} Apple Store-butiker i ${land(cc)} listar ${m.name} nu. Lager för hämtning live per butik och konfiguration, påfyllningstider och bevakningar.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, n(catalogFor(m.key, cc).length), n(storesNow[m.key] ?? 0), n(restocks[m.key] ?? 0)]);
}

/* ------------------------------------------------------------------ country home */

function homeDescription(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const cur = COUNTRIES[cc].currency === "SEK" ? "kronor" : COUNTRIES[cc].currency;
  return fit([
    `iPhone Duo, 18 Pro och 18 Pro Max att hämta i ${allStoresPhrase(cc)}, avläst var 15:e sekund. ${k === 1 ? "Priser" : "Påfyllningstider och priser"} i ${cur}, och en notis i samma sekund som din butik fyller på.`,
    `iPhone Duo, 18 Pro och 18 Pro Max att hämta i ${allStoresPhrase(cc)}, avläst var 15:e sekund. En notis när din butik fyller på.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `Senaste bekräftade påfyllning av iPhone Duo i ${land(cc)}: **{{duo.lastRestock}}**. Just nu listar **{{duo.storesNow}} av ${k}** ${k === 1 ? "Apple Store-butik" : "Apple Store-butiker"} en Duo för hämtning, **{{pm.storesNow}}** en iPhone 18 Pro Max och **{{pro.storesNow}}** en iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  const w = land(cc);
  const by = cc === "se" ? "stad" : c.regionNoun ? noun(c) : "stad";
  const unit = c.unit === "mi" ? "miles" : "kilometer";
  return [
    {
      id: "iphone-stock",
      h2: `Vilka iPhone finns i lager i ${w} just nu?`,
      lead: `Tabellen svarar live: apple.com:s egen tillgänglighet för hämtning i butik för varje konfiguration i ${allStoresPhrase(cc)}, avläst var 15:e sekund${k > 1 ? ` och uppdelad per butik, per ${by} och per konfiguration` : ""}.`,
      blocks: [
        { t: "table", head: ["Modell", "Konfigurationer", "Butiker som listar den nu", "Bekräftade påfyllningar"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `Läget i ${w} per {{asOf}}` },
        { t: "ul", items: [
          "**Bekräftat betyder två gånger:** en ändring publiceras först när en andra avläsning håller med, så ett felaktigt svar från apple.com syns aldrig som påfyllning eller slutsålt",
          "**Första observationer är inga påfyllningar:** en konfiguration som syns för första gången sätter bara utgångsläget",
          `**Loggen är källan:** varje bekräftad ändring hamnar i [påfyllningsloggen](${i.restocksPath}), som ritar påfyllningsdiagrammen på ${i.index?.indexable ? `[butikssidorna](${i.index.path})` : "butikssidan"}`,
          `**Täckning:** ${spreadPhrase(cc)}, med Apples egna priser och artikelnummer för ${w}; butiker med bevakning läses av var 5:e sekund`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, w),
    {
      id: "alerts",
      h2: `Hur fungerar lagerbevakning i ${w}?`,
      lead: `Du väljer ${k === 1 ? "butiken" : "butikerna"} och exakt vilken telefon; när ${k === 1 ? "butiken" : "någon av dem"} listar den för hämtning i butik får du en notis ungefär 3 sekunder efter att påfyllningen bekräftats.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `Välj iPhone, lagring och färg under **Bevaka**; butiken är ${apple(stores[0])} i ${stores[0].city}.` : `Välj iPhone, lagring och färg under **Bevaka** och bocka sedan i butikerna du når; de närmaste visas först, med ${unit} längs vägen och körtid.`,
          "På iPhone: lägg till RestockWire på hemskärmen och tillåt notiser; iOS levererar webbnotiser bara till en installerad app ([så installerar du](/phone-alerts)).",
          "När notisen kommer: öppna apple.com från den och välj Hämta i butik i just den butiken i kassan.",
        ] },
        { t: "table", head: ["Plan", "Per månad (USD)", "Bevakningar"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "En bevakning = en butik × en exakt konfiguration; att titta är gratis, och hastigheten är densamma i alla planer ([priser](/pricing))" },
        { t: "note", text: "**Vår bedömning:** Duo är värd en bevakning i varje butik du når; för 18 Pro och Pro Max, kolla siffrorna live först." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const w = land(cc);
  const count = pl(rt.n, "bekräftad påfyllning", "bekräftade påfyllningar");
  const when = rt.n === 0
    ? `Ingen bekräftad än sedan bevakningen startade den 2 november. [När fyller Apple på iPhone Duo i ${w}?](${rt.path}) räknar varje påfyllning per lokal timme och dag allteftersom de kommer.`
    : rt.peakHour != null
      ? `De flesta kommer runt **${klock(rt.peakHour)} lokal tid**: ${count} i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november. [Timme för timme och dag för dag](${rt.path}).`
      : `${cap(count)} i ${rt.stores} av ${rt.storesTotal} butiker sedan 2 november, på för få dagar för att peka ut en vanlig tid än. [Timme för timme och dag för dag](${rt.path}).`;
  return [
    { q: `Vilka Apple Store-butiker i ${w} listar iPhone Duo just nu?`, a: `{{duo.storesNow}} av ${k} vid senaste avläsningen ({{asOf}}). [iPhone Duo i lager i ${w}](${p}/in-stock/iphone-duo) visar varje butik och konfiguration och uppdateras var 15:e sekund.` },
    { q: `När fyller Apple på iPhone Duo i ${w}?`, a: when },
    { q: `Hur snabbt ser RestockWire en påfyllning i ${w}?`, a: `Butiker med bevakning läses av var 5:e sekund och ${k === 1 ? `Apple Store-butiken i ${w}` : `varje Apple Store i ${w}`} var 15:e sekund; ett första ”tillgänglig” läses av igen inom en sekund. Den bekräftade påfyllningen når din telefon ungefär 3 sekunder senare.` },
    { q: "Behöver jag en plan för att se lagret?", a: "Nej: lagret live, kartan och påfyllningsloggen är gratis. En plan lägger till bevakningar, debiterade i amerikanska dollar: Plus $5 i månaden för 10, Pro $10 för 20, Max $20 för 50, och du avslutar när du vill ([priser](/pricing))." },
    taxFaq(cc, w),
    { q: "Reserverar en bevakning telefonen åt mig?", a: `Nej, det gör bara en beställning med Hämta i butik på apple.com. Bevakningen tar dig först till kassan, och Apple håller enheten åt dig när du har betalat ([Apples hjälp om hämtning](${pickupHelp(cc).url})).` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire iPhone-lagerkoll ${land(cc)}`,
  offer: "Lagret live, kartan och påfyllningsloggen är gratis; bevakningar från $5 i månaden",
  itemList: (cc: CountryCode) => `Apple Store-butiker i ${land(cc)}`,
  restockTimesChip: "Påfyllningstider",
  storesByRegion: (cc: CountryCode) => `Butiker per ${noun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `Lager per plats i ${land(cc)}`,
  selloutH2: (cc: CountryCode) => `Hur länge räcker en iPhone-påfyllning i ${land(cc)}?`,
  selloutLabel: (cc: CountryCode) => `i Apple Store-butikerna i ${land(cc)}`,
  last24Label: (cc: CountryCode) => `i ${land(cc)}`,
  newsroom: "Apple Newsroom: iPhone Duo kommer till Apple Store-butiker världen över (23 okt. 2026, på engelska)",
};

/**
 * Store page <title> and H1: the store first (what Swedes type: "apple mall of scandinavia", "apple täby centrum",
 * "apple emporia"), then the promise. The two Stockholm stores carry "Stockholm" ("apple store stockholm"), Täby leads
 * with "Apple Store Täby" ("apple store täby"); elsewhere the town follows in parentheses when it is the only store there.
 */
function storeTitle(s: Store, region?: string): string {
  const stockholm = STOCKHOLM.has(s.storeNumber);
  const name = s.storeNumber === "R505" ? "Apple Store Täby Centrum" : apple(s);
  const shown = stockholm ? ", Stockholm" : region && !name.toLowerCase().includes(region.toLowerCase()) ? ` (${region})` : "";
  return fit([
    `${name}${shown}: iPhone i lager idag, hämtning & öppettider`,
    `${name}${shown}: iPhone i lager idag & öppettider`,
    `${name}${shown}: iPhone i lager idag`,
    `${name}: iPhone i lager idag & öppettider`,
    `${name}: iPhone i lager idag`,
    `${name}: iPhone i lager`,
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
