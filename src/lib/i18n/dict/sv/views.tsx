/**
 * Swedish views: product × place pages, restock log, live map, the iPhone Duo restock-times page and the store
 * index. Written in Swedish wire style (du-form) from the English source. Country, Store and Place objects carry
 * English data; Swedish names come from countryLabel and places.ts. Cadence is 15 s and 5 s only; no refund wording.
 * Links to English-only pages say "(engelska)" in the label.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import type { Country, CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { distance, stamp, weekdays } from "@/lib/i18n/format";
import { cityLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import { SV, apple, cap, color, dur, fit, klock, kr, land, n, noun, pl, prod, range, share, taxNote, words } from "./util";

/* ---------------------------------------------------------------- helpers */

const WD = weekdays(SV);
/** Short calendar day, optionally with its weekday. */
const dateLabel = (ymd: string, weekday = true): string => new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** Full calendar date. */
const longDate = (ymd: string): string => new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ymd}T12:00:00Z`));
/** Date and time in the country's reference zone. */
const zoneStamp = (iso: string, c: Country): string => stamp(SV, iso, c.timeZone, true);
const rtRegion = (x: { us: boolean; c: Country }): string => (x.us ? "delstat" : noun(x.c));
const rtRegions = (x: { us: boolean; c: Country }): string => (x.us ? "delstater" : noun(x.c, true));
const rtYet = (x: RestockTimesMeta): string => (x.t.n > 0 ? "" : " ännu");
/** Neuter region words (område, departement, emirat) take Inget, the rest Ingen. */
const none = (word: string): string => (/^(område|departement|emirat)/.test(word) ? "Inget" : "Ingen");
const restocksN = (k: number): string => pl(k, "påfyllning", "påfyllningar");
const confirmedN = (k: number): string => pl(k, "verifierad påfyllning", "verifierade påfyllningar");
const storesN = (k: number): string => pl(k, "butik", "butiker");
const inLand = (c: Country): string => `i ${land(c.cc)}`;
/** Prefixes Apple to a bare store name. */
const appleOf = (name: string): string => (/^apple\b/i.test(name) ? name : ["Apple", name].join(" "));
/** Swedish name for a Place (Place objects hold English names). */
function placeName(place: Place): string {
  const cc: CountryCode = place.country ?? "us";
  switch (place.level) {
    case "country": return land(cc);
    case "state": return regionLabel(cc, place.state!, SV);
    case "city": return cityLabel(cc, place.city!, SV);
    default: return apple(place.store!);
  }
}


/* ---------------------------------------------------------------- product × place (Swedish twin of lib/seo/productCopy) */

function productTitle(product: Product, place: Place, inStock: number): string {
  const k = place.stores.length;
  const cc: CountryCode = place.country ?? "us";
  const name = prod(product.name);
  const short = prod(product.short);
  if (place.level === "country") {
    const w = land(cc);
    return fit([
      ...(inStock > 0 ? [`${name} i ${w}: att hämta i ${pl(inStock, "Apple Store", "Apple Store-butiker")} nu`] : []),
      `${name} i ${w}: hämtlager live`,
      `${short} i ${w}: hämtlager`,
      `${short}: hämtlager`,
    ]);
  }
  if (place.level === "store") {
    const st = place.store!;
    const label = apple(st);
    return fit([
      `${name} på ${label}: ${inStock > 0 ? "att hämta nu" : "lagerläge och påfyllningar"}`,
      `${short} på ${label}: ${inStock > 0 ? "i lager nu" : "lagerläge"}`,
      `${short} på ${label}`,
      `${short} på ${st.name}`,
      `${short} · ${st.name.replace(/^The /, "")}`,
    ]);
  }
  const w = placeName(place);
  return fit([`${name} i ${w}: lager i ${inStock}/${k} butiker nu`, `${name} i ${w}: hämtlager live`, `${short} i ${w}: finns den nu?`, `${short} i ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prod(product.name);
  const cc: CountryCode = place.country ?? "us";
  const week = `${restocksN(stats.week)} på 7 dagar`;
  if (place.level === "store") {
    const st = place.store!;
    const label = apple(st);
    return fit([
      `${label}, ${cityLabel(cc, st.city, SV)}: ${name} ${inStock > 0 ? "gick att hämta vid senaste avläsningen" : "går inte att hämta just nu"} · ${week}. Butikens påfyllningstider, hur länge lagret räcker och notis nästa gång.`,
      `${label}: ${name} ${inStock > 0 ? "i lager nu" : "slut just nu"} · ${week}. Påfyllningstider och notiser.`,
    ], 155);
  }
  const where = place.level === "country" ? land(cc) : placeName(place);
  return fit([
    `Just nu: ${name} finns att hämta hos ${inStock} av ${place.stores.length} Apple Store-butiker, ${where} · ${week}. Varje butik, påfyllningstider och notis i telefonen nästa gång.`,
    `${name}, ${where}: ${inStock} av ${place.stores.length} Apple Store-butiker har den nu · ${week}. Butik för butik, påfyllningstider, notiser.`,
  ], 155);
}

/** Three or four short questions built from the live numbers; one-sentence answers. */
function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const cc: CountryCode = place.country ?? "us";
  const out: FaqItem[] = [];
  const name = prod(product.name);
  const at = place.level === "store" ? `på ${apple(place.store!)}` : `i ${placeName(place)}`;
  const nearestBit = nearest ? `. Närmast med den: ${appleOf(nearest.name)}, ${nearest.city} – ${distance(SV, cc, nearest.distance)}` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    const listed = l && l.available.length > 0;
    const which = product.parts.length > 1 && listed ? ` (${words(l.available.map((i) => `${i.storage} ${color(i.color)}`), 4)})` : "";
    out.push({
      q: `Har ${apple(place.store!)} ${name} att hämta nu?`,
      a: listed ? `Ja, vid senaste avläsningen${which}.` : `Nej, inte vid senaste avläsningen${nearestBit}.`,
    });
  } else {
    out.push({
      q: `${name} ${at}: vilka butiker har den nu?`,
      a: inStock.length === 0
        ? `Ingen vid senaste avläsningen${nearestBit}.`
        : `Senaste avläsningen: ${storesN(inStock.length)} – ${words(inStock.map((l) => apple(l.store)), 4)}.`,
    });
  }
  const peak = peakOf(clock, SV);
  out.push({
    q: `Hur ofta kommer ${name} tillbaka ${at}?`,
    a: stats.month === 0
      ? `${stats.days} dagar bakåt: ingen verifierad påfyllning ${at}.`
      : `${stats.days} dagar bakåt: ${confirmedN(stats.month)}, varav ${n(stats.week)} på 7 dagar${peak ? `. Oftast kring ${peak.hour} lokal tid` : ""}.`,
  });
  const median = stats.medianMs;
  if (median != null) out.push({ a: `Median ${dur(median)} innan den tar slut igen.`, q: `Hur snabbt tar ${name} slut ${at} efter en påfyllning?` });
  return out;
}

function priceLabel(product: Product): string {
  const cc: CountryCode = product.country ?? "us";
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  return lo === hi ? kr(cc, lo) : `${kr(cc, lo)}–${kr(cc, hi)}`;
}

/* ---------------------------------------------------------------- views */

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? `i ${x.place.name}` : inLand(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "stad" : "butik") : rtRegion(x));
const rtUs = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "städer" : "butiker") : rtRegions(x));
const rtL = (x: { c: Country; place?: RestockTimesPlace }) => x.place?.name ?? land(x.c.cc);
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inLand(c),
    liveMap: "Livekarta",
    restockLog: "Påfyllningslogg",
    alertMe: "Bevaka",
    lastDays: (days: number) => <>Dag för dag, {days} dagar</>,
    since: "2 november 2026",
    sourcesWhere: (k: number, c: Country): string => (k === 1 ? `landets enda Apple Store (${land(c.cc)})` : `samtliga ${k} Apple Store-butiker ${inLand(c)}`),
    checker: (c: Country): string => `iPhone-lager ${land(c.cc)}`,
    appleStoresIn: (c: Country): string => `${land(c.cc)}: Apple Store-butiker`,
    storesWithIt: "butiker med den att hämta",
    more: "Fler",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel): string => (level === "store" ? `på ${name}` : `i ${name}`),
    h1Country: (model: string, c: Country): string => `${prod(model)} ${inLand(c)}: hämtlager i butik`,
    h1Place: (model: string, where: string): string => `${prod(model)} ${where}`,
    inStockNow: "Att hämta nu",
    yes: "Ja",
    no: "Nej",
    pickup: "hämtning",
    configurations: "konfigurationer",
    ofStores: (k: number): string => `av ${storesN(k)}`,
    restocks24h: "Påfyllningar (24 tim)",
    restocksHint: (week: number, month: number, days: number): string => `7 d: ${n(week)} · ${days} d: ${n(month)}`,
    sellOuts: (days: number): string => `Slutsålt, ${days} d`,
    stays: (ms: number): string => `ute ~${dur(ms)}`,
    noPairs: "inga slutsålda att para ihop ännu",
    lastRestock: "Senast påfyllt",
    noneYet: "ingen ännu",
    thisConfig: "denna konfiguration",
    inDays: (days: number): string => `${days} dagar bakåt`,
    notInStockNow: "Ej att hämta nu",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{k}</b>/{of} konfigurationer att hämta</span>,
    inStockAt: (k: number, of: number) => <span>Att hämta i <b className="text-ink">{k}</b>/{of} {of === 1 ? "butik" : "butiker"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>Avläst {live} · {price}{tax}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "exkl. skatt",
    buyOnApple: "Köp på apple.com",
    allStoresIn: (c: Country): string => `Samtliga butiker ${inLand(c)}`,
    everyIphoneHere: "Varje iPhone här",
    everyIphone: (where: string): string => `Varje iPhone ${where}`,
    panel: (model: string, where: string | null): string => `Bevaka ${prod(model)}${where ? ` ${where}` : ""}: konfigurationer först, butiker sedan`,
    unitConfigs: "konfigurationer",
    unitStores: "butiker",
    otherConfigsHere: "Övriga konfigurationer här",
    byStorageColor: "Lagring × färg",
    nearestStores: "Kortast avstånd",
    closest: (link: ReactNode, dist: string) => <>Närmast med den: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store} ({city})</>,
    mostRecentlyInStock: "Senast att hämta",
    storesWithItNow: "Butiker med den just nu",
    storesIn: (where: string): string => `Butikerna ${where}`,
    colStatus: "läge",
    colConfigs: "konfig. att hämta",
    noStoreHasIt: "Ingen butik har den att hämta just nu.",
    noStoreHereHasIt: "Inte en butik i området har den just nu.",
    moreStores: (k: number) => <>Ytterligare {k} butiker, ordnade efter delstat nedan.</>,
    byRegion: (c: Country): string => `${cap(noun(c))} för ${noun(c)}`,
    byCity: "Ort för ort",
    nearbyStores: "Butiker runt omkring",
    latestChanges: "Färskast i loggen",
    nothingLogged: "Inga poster i loggen ännu.",
    whenRestocks: "När kommer nytt lager?",
    howFast: "Hur fort tar det slut?",
    restocksByConfig: "Konfigurationerna som kommer tillbaka",
    faqTitleCountry: (model: string, c: Country): string => `Frågor om ${prod(model)} ${inLand(c)}`,
    faqTitle: (model: string, where: string): string => `Frågor: ${prod(model)} ${where}`,
    buySource: (model: string, c: Country): string => `${prod(model)} hos Apple, köpsida (${land(c.cc)})`,
    nearby: "Runt omkring",
    otherRegions: (c: Country): string => `Fler ${noun(c, true)}`,
    elsewhereIn: (region: string): string => `Längre bort, ${region}`,
    everyAppleStoreIn: (c: Country): string => `${land(c.cc)}: komplett butikslista`,
    across: (model: string, c: Country): string => `${prod(model)}, hela ${land(c.cc)}`,
    itemList: (model: string, where: string): string => `Butiker: ${prod(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]): string =>
      inStock === 0
        ? `Ingen Apple Store ${inLand(c)} har ${model} att hämta just nu. ”Nära mig” handlar därför om vilken butik i närheten som fyller på först – med en bevakning på varje butik du når kommer notisen sekunder efter att någon av dem listar den.`
        : `${model} går att hämta i ${inStock} av ${k} butiker. Störst urval: ${words(have.slice(0, 5).map((l) => `${l.store}, ${l.city} – ${pl(l.configs, "konfiguration", "konfigurationer")}`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c)), "Butiker med den nu"],
    nearCaption: (c: Country, model: string): string => `${model}: hämtlager per ${noun(c)}, senaste avläsningen`,
    nearMe: (c: Country, model: string, alert: string): string => `Använd Min plats i bevakningen här: butikerna sorteras från din position efter uppskattat vägavstånd (${c.unit === "mi" ? "engelska mil" : "kilometer"}), med vägbeskrivning för varje. [Bevaka ${model}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const span = `${kr(c.cc, low)}–${kr(c.cc, high)}`;
      return {
        price: { a: `${span} på apple.com, beroende på lagring (${taxNote(c)}).`, q: `Vilket pris har ${model} ${inLand(c)}?` },
        reserve: { a: `Nej, inte i förväg. Listar en butik din konfiguration beställer du på apple.com med hämtning i butik; Apple håller telefonen till din tid.${inStock === 0 ? " Ingen butik har den just nu – en bevakning gör dig först." : ""}`, q: `Går ${model} att förhandsboka för upphämtning ${inLand(c)}?` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, k: number): string => `iPhone-påfyllningar ${inLand(c)}, live: ${k === 1 ? "landets Apple Store" : `${k} Apple Store-butiker`}`,
    metaDescription: (c: Country, k: number): string => `Logg över varje bekräftad påfyllning för hämtning i butik – iPhone Duo, 18 Pro och Pro Max – i ${k === 1 ? "landets Apple Store" : "alla Apple Store-butiker"} ${inLand(c)}: klockslag, exakt konfiguration, karta.`,
    h1: (c: Country): string => `iPhone-påfyllningar ${inLand(c)}, i realtid`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Senaste dygnet: {restocksN(day)} · 7 dagar: {n(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Klockslagen visas i din tidszon.</>,
    allModels: "Samtliga modeller",
    restocks: "Påfyllningar",
    withSoldOut: "Påfyllningar + slutsålt",
    regionLabel: (c: Country) => cap(noun(c)),
    allRegions: (c: Country): string => `Samtliga ${noun(c, true)}`,
    filter: "Filtrera",
    page: (k: number) => <>sida {k}</>,
    newer: "← Senare",
    older: "Tidigare →",
    getAlerts: "Starta en bevakning",
    byPlace: "Plats för plats",
    byRegion: (c: Country): string => `${cap(noun(c))} för ${noun(c)}`,
    datasetName: (c: Country): string => `iPhone-påfyllningar för hämtning i butik, Apple Store ${inLand(c)}`,
    datasetDescription: (c: Country): string => `Bekräftade påfyllningar och slutsålt för hämtning i butik – iPhone Duo, iPhone 18 Pro, iPhone 18 Pro Max – i ${c.cc === "us" ? "USA:s samtliga 269 Apple Store-butiker" : `Apple Store-butikerna ${inLand(c)}`}: butik, exakt konfiguration, klockslag. Kontroll var 15:e sekund, var 5:e sekund där bevakning finns. En påfyllning loggas först när apple.com gett samma besked två gånger i rad.`,
    datasetMeasured: ["Apple Store", "iPhone-modell, lagring, färg", "klockslag för påfyllning", "klockslag för slutsålt"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, k: number): string => `iPhone Duo-lager på karta, live: ${k === 1 ? "landets Apple Store" : "varje Apple Store"} ${inLand(c)}`,
    metaDescription: (c: Country, k: number): string => `Livekarta ${inLand(c)}: ${k === 1 ? "landets Apple Store" : `samtliga ${k} Apple Store-butiker`} och var iPhone Duo, 18 Pro och Pro Max går att hämta just nu – filtrera på lagring och färg.`,
    // The map component reads the region word by this English key, so these stay raw data.
    country: (c: Country) => ({ inName: c.inName, name: c.name, regionNounPlural: c.regionNounPlural, regionNoun: c.regionNoun }),
    everyStore: "Samtliga butiker",
    storeCity: (store: string, city: string): string => `${store} (${city})`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number): string => {
      const named = words(storesOf(c.cc).map((s) => { const nm = apple(s).replace(/^Apple /, ""); const city = cityLabel(c.cc, s.city, SV); return nm.includes(city) ? nm : `${nm} (${city})`; }));
      let by = "";
      if (c.regionNoun && regions > 1) by = `, ordnat per ${noun(c)} och ort`;
      else if (cities > 1) by = ", ordnat per ort";
      const short = k <= 4 ? [`Just nu: iPhone Duo i ${duo}, Pro Max i ${max} – hämtlager live i samtliga ${k} Apple Store-butiker ${inLand(c)}: ${named}. 18 Pro också.`] : [];
      return fit([
        ...short,
        `Just nu: iPhone Duo i ${duo}, Pro Max i ${max} – hämtlager live i samtliga ${k} Apple Store-butiker ${inLand(c)}${by}. 18 Pro också.`,
      ], 160);
    },
    // A leader is only named when one region clearly tops the count (never "leads with 1").
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]): string => {
      const lead = top.length && top[0].count > 1 && (!top[1] || top[0].count > top[1].count) ? `. Flest: ${top[0].name} (${top[0].count})${top[1] ? `, därefter ${top[1].name} (${top[1].count})` : ""}` : "";
      const sthlm = /Solna/.test(spread) && /Täby/.test(spread) ? ". Stockholmsbutikerna ligger utanför innerstaden: Mall of Scandinavia i Solna och Täby Centrum" : "";
      return `${k}, ${spread}${lead}${sthlm}.`;
    },
    howMany: (c: Country) => <>Antal Apple Store-butiker {inLand(c)}?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => {
      const listed = have.length > 6 ? `${have.slice(0, 6).map((x) => apple(x)).join(", ")} m.fl.` : words(have.map((x) => apple(x)));
      return {
        q: `iPhone Duo ${inLand(c)}: vilka Apple Store-butiker har den nu?`,
        a: have.length === 0
          ? `Ingen av ${k} vid senaste avläsningen. Sidan och kartan uppdateras samma sekund som en butik listar den – en bevakning hinner före båda.`
          : `Senaste avläsningen: ${have.length} av ${k} – ${listed}.`,
      };
    },
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, SV),
    duoBlock: (alert: string): string => `Kortaste vägen till en Duo: [bevaka iPhone Duo](${alert}) i butikerna du når. En bevakning = en butik × en exakt konfiguration, och telefonen får beskedet sekunder efter att butiken listar den.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string): string =>
      `Att hämta just nu, av **${pl(k, "Apple Store", "Apple Store-butiker")}** ${inLand(c)} (${spread}${/Solna/.test(spread) && /Täby/.test(spread) ? "; Solna och Täby täcker Stockholm" : ""}): iPhone Duo i **${now.duo}**, iPhone 18 Pro Max i **${now.max}**, 18 Pro i **${now.pro}**. ${tax}`,
    crumb: "Butikerna",
    panel: (c: Country): string => `Bocka i telefoner och de butiker ${inLand(c)} du kan ta dig till`,
    matrixLabel: "Lagerläge per butik",
    matrixH2: (c: Country) => <>Varje butik {inLand(c)}, lagerläge</>,
    matrixHint: "Att hämta nu / bevakad, per modell.",
    topCaption: (c: Country) => <>{cap(noun(c, true))} efter antal Apple Store-butiker (Apples butikslista, som bevakas här)</>,
    regionHead: (c: Country) => cap(noun(c)),
    colStores: "Antal butiker",
    colCities: "Orter",
    locationsBy: (c: Country): string => `Butikernas lägen, ${noun(c)} för ${noun(c)}`,
    locationsIn: (c: Country): string => `Alla Apple Store ${inLand(c)}`,
    storeCount: (k: number) => <>{k} {k > 1 ? "butiker" : "butik"}</>,
    storeCountAll: (k: number) => <>{k} butiker</>,
    whenRestock: (c: Country) => <>När fyller butikerna {inLand(c)} på?</>,
    howFast: (c: Country) => <>Hur snabbt tar en påfyllning slut {inLand(c)}?</>,
    faqTitle: (c: Country): string => `Frågor om Apple Store ${inLand(c)}`,
    getApp: "Hemskärmsappen",
    howItWorks: "Så funkar notiserna",
    pricing: "Planer och priser",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n,
      pct: share,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, SV),
      hour: (h: number) => klock(h),
      range,
      weekday: (d: number) => WD[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store): string => `${apple(s)}, ${cityLabel(s.country, s.city, SV)}`,
    },
    title: (c: Country, place?: RestockTimesPlace): string => `iPhone Duo ${place ? `i ${place.name}` : inLand(c)}: vilken tid kommer påfyllningarna?`,
    metaDescription: (x: RestockTimesMeta): string => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "stad" : "butik") : c.cc === "us" ? "delstat" : (c.regionNoun && noun(c)) || "butik";
      const since = dateLabel(t.since, false);
      if (t.n > 0 && pattern) {
        const sold = t.sellout ? `; ${share(t.sellout.within2min)} slut på 2 min` : "";
        return fit([
          `Sedan ${since}: ${restocksN(t.n)} av iPhone Duo ${rtW(x)}, varav ${share(w.share)} ${range(w.from, w.to)} lokal tid${sold}. Per timme, dag, ${region}, butik, konfiguration.`,
          `Sedan ${since}: ${restocksN(t.n)} av iPhone Duo ${rtW(x)}, varav ${share(w.share)} ${range(w.from, w.to)} lokal tid. Per timme, dag, ${region}, konfiguration.`,
          `iPhone Duo ${rtW(x)}: ${restocksN(t.n)} sedan ${since}, uppdelat på timme, dag, ${region} och konfiguration.`,
        ], 158);
      }
      if (t.n > 0) {
        return fit([
          `Sedan ${since}: ${confirmedN(t.n)} av iPhone Duo ${rtW(x)}, uppmätt med kontroll var ${SPEED.checkSec}:e sekund. Per timme, dag, ${region}, butik och konfiguration – plus tid innan slut.`,
          `iPhone Duo ${rtW(x)}: ${confirmedN(t.n)} sedan ${since}, uppdelat på timme, dag, ${region} och konfiguration.`,
        ], 158);
      }
      return fit([
        `iPhone Duo ${rtW(x)}: påfyllningar timme för timme, dag för dag, butik för butik. RestockWire kontrollerar varje Apple Store var ${SPEED.checkSec}:e sekund sedan ${longDate(t.since)}.`,
        `iPhone Duo ${rtW(x)}: påfyllningar per timme och butik, kontrollerat var ${SPEED.checkSec}:e sekund sedan ${since}.`,
      ], 158);
    },
    h1: (x: RestockTimesView): string => {
      if (x.t.unknown) return `iPhone Duo ${rtW(x)}: vilken tid kommer påfyllningarna?`;
      if (x.t.n > 0) return `iPhone Duo ${rtW(x)}: vilken tid kommer påfyllningarna? ${x.pattern ? `Oftast ${range(x.w.from, x.w.to)} lokal tid` : "Egna kontroller, timme för timme"}`;
      return `Påfyllning av iPhone Duo ${rtW(x)}? Ingen än – så här bevakar vi`;
    },
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtW(x);
      if (t.unknown) {
        return <>Loggen går inte att läsa just nu. Kontrollen av butikerna {where} fortsätter var {SPEED.checkSec}:e sekund; siffrorna är tillbaka vid nästa sidladdning.</>;
      }
      if (t.n > 0 && pattern) {
        // The one sentence an answer engine can quote whole: share, sample, start date, window, local time (docs/research.md §8).
        return (
          <>
            <b className="text-ink">{share(w.share)} av {n(t.n)} iPhone Duo-påfyllningar</b> {where} – bekräftade av RestockWire i {one ? "landets Apple Store" : "Apple Store-butikerna"} sedan {longDate(t.since)} – kom <b className="text-ink">{range(w.from, w.to)}</b> i butikens lokala tid{x.sell ? <>. Median innan slut: cirka {Math.round(x.sell.medianSec / 5) * 5} sekunder</> : null}. <b className="text-ink">Flödet håller i sig</b>{tracked > 1 ? <>: påfyllning {t.days} av {tracked} dagar</> : <> (en dag med bevakning hittills)</>}.
          </>
        );
      }
      if (t.n > 0) {
        return (
          <>
            <b className="text-ink">Ja.</b> <b className="text-ink">Sedan {longDate(t.since)}: {restocksN(t.n)} av iPhone Duo</b> i {one ? "landets Apple Store" : "Apple Store-butikerna"} {where}{tracked > 1 ? <>, fördelat på {t.days} av {tracked} dagar</> : <> (en dag med bevakning hittills)</>}. En vanlig tid anges från {PATTERN_MIN} påfyllningar på {PATTERN_MIN_DAYS} olika dagar.
          </>
        );
      }
      return (
        <>
          <b className="text-ink">Nej, inte ännu.</b> Sedan {longDate(t.since)} kontrollerar RestockWire {one ? "landets Apple Store" : `samtliga ${x.stores} Apple Store-butiker`} {where} var {SPEED.checkSec}:e sekund – utan en enda bekräftad iPhone Duo-påfyllning för hämtning.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView): string => `påfyllningar, verifierade, sedan ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView): string => `kom ${range(x.w.from, x.w.to)} (butikens tid)`,
      days: "dagar som hade påfyllning",
      now: (one: boolean): string => (one ? "butik har en att hämta nu" : "butiker har en att hämta nu"),
      today: (x: RestockTimesView, today: DayRow): string => `i dag hittills (${dateLabel(today.date)})${x.one ? "" : ` · ${storesN(today.stores)}`}`,
      weekday: "toppdag i veckan hittills",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Senast in: <b className="text-ink">{latest.config}</b>{x.one ? null : <>, <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>} – {localStamp(latest.at, latest.store, SV)} lokal tid</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Toppdag: <b className="text-ink">{WD[x.t.peakWeekday]}ar</b></> }] : []),
      { text: <>Apple har <b className="text-ink">inget publicerat påfyllningsschema</b>. Siffrorna är våra egna bekräftade kontroller, omräknade ungefär var femte minut</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>Att hämta nu: <b className="text-ink">{x.duoNow} av {x.stores}</b> butiker</> },
      { text: <>Tabellerna nedan fylls från första bekräftade påfyllningen</>, step: true },
      { text: <>Timmar och veckodagar från det största underlaget: <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">USA-sidan (engelska)</Link></>, step: true },
    ],
    setUpAlert: "Bevaka iPhone Duo",
    logLive: "Loggen, live",
    onThisPage: "Innehåll",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Klockslag",
      "day-by-day": "Per dag",
      where: `${cap(rtU(x))} för ${rtU(x)}`,
      configuration: "Lagring och färg",
      "how-long": "Tid innan slut",
      unavailable: "”Ej tillgänglig”",
      reddit: "Reddit-myter",
      method: "Så mäter vi",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Vilket klockslag kommer iPhone Duo tillbaka ${rtW(x)}?`,
      "day-by-day": `Vilka dagar har iPhone Duo fyllts på ${rtW(x)}?`,
      where: `I vilka delar ${rtW(x)} kommer iPhone Duo oftast tillbaka?`,
      configuration: `Vilken iPhone Duo – lagring och färg – kommer tillbaka oftast ${rtW(x)}?`,
      "how-long": `Hur många sekunder ligger en iPhone Duo-påfyllning ute ${rtW(x)}?`,
      unavailable: "Varför står det ”inte tillgänglig” i alla butiker på apple.com?",
      reddit: "Reddit om iPhone Duo-påfyllningar: myterna mot loggen",
      method: "Hur definierar RestockWire en påfyllning?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
      const window = range(w.from, w.to);
      return [
        { q: `Vilken tid kommer iPhone Duo-påfyllningarna ${where}?`, a: t.n > 0 && pattern
          ? `${share(w.share)} av ${n(t.n)} bekräftade påfyllningar från och med ${longDate(t.since)} kom ${window} lokal tid; ${share(hourShare(t.byHour, 8, 12))} kom kl. 8–12. Apple har inget schema – det här är mönstret RestockWire mäter, omräknat ungefär var femte minut.`
          : `Sedan ${longDate(t.since)}: ${confirmedN(t.n)} ${where}${t.days ? `, ${pl(t.days, "dag", "dagar")} med påfyllning` : ""}. Apple publicerar inget schema; sidan anger en vanlig tid så snart det finns ${PATTERN_MIN} påfyllningar på ${PATTERN_MIN_DAYS} olika dagar.` },
        { q: `Kommer iPhone Duo tillbaka även på helger${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja" : "Inte hittills"} – lördag och söndag stod för ${restocksN(weekend)} av ${n(t.n)} (${share(weekend / t.n)}). ${t.peakWeekday != null ? `Toppdag hittills: ${WD[t.peakWeekday]}.` : `En toppdag anges först när underlaget spänner över ${WEEKDAY_MIN_SPAN} dagar; nu är det ${tracked}.`}`
          : `Ingen helgdata ${where} ännu. Dagstabellen på sidan växer med varje bekräftad påfyllning.` },
        { q: "Från vilken tid lönar det sig att bevaka apple.com?", a: t.n > 0 && pattern
          ? `Manuellt: ha apple.com öppet med hämtning vald från ${klock(w.from)} lokal tid – de två timmarna rymmer ${share(w.share)} av påfyllningarna. ${sell ? `Median innan slut: ${sell.medianSec} sekunder` : "En påfyllning räcker oftast runt en minut"}, så en bevakning som läser butiken var ${SPEED.fastSec}:e sekund ([notiser förklarade, engelska](/iphone-duo-restock-alerts)) vinner över all uppdatering för hand.`
          : `Mönstret ${where} håller fortfarande på att ta form. En bevakning tittar åt dig under tiden: dina butiker läses var ${SPEED.fastSec}:e sekund, dygnet runt ([notiser förklarade, engelska](/iphone-duo-restock-alerts)).` },
        { q: "Varför visar varje Apple Store iPhone Duo som ”inte tillgänglig”?", a: sell
          ? `Fönstren är korta. ${cap(where)}: ${n(sell.n)} uppmätta slutsålda påfyllningar, ${share(sell.within2min)} borta på 2 minuter och ${share(sell.within20min)} på 20. Just nu har ${x.duoNow} av ${x.stores} butiker en – så ”inte tillgänglig” stämmer för det mesta, även dagar med dussintals påfyllningar ([vad beskedet betyder, engelska](/apple-store-pickup-explained)).`
          : `Hämtlager dyker upp några minuter åt gången. Just nu: ${x.duoNow} av ${storesN(x.stores)} ${where} ([vad beskedet betyder, engelska](/apple-store-pickup-explained)).` },
        { q: "Går det att få en notis när just min Apple Store får in iPhone Duo?", a: `Ja. Med en bevakning på butiken – exakt lagring och färg – läses den var ${SPEED.fastSec}:e sekund, och telefonen får beskedet cirka ${SPEED.alertSec} sekunder efter bekräftad påfyllning ([starta en bevakning](${x.alert}); [hur det funkar, engelska](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple-support: leverans och hämtning (hur hämtningsstatus fungerar)",
      newsroom: "Apple Newsroom (23 oktober 2026): iPhone Duo lanseras i Apple Store världen över",
      macRumors: "MacRumors (24 oktober 2026): hämtning i butik för iPhone Duo öppen igen i USA och Kanada",
      reports: (tracker: string): string => `${tracker}: egna observationer av iPhone Duo-påfyllningar lanseringsveckan (redovisas separat, ingår aldrig i summorna)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `iPhone Duo, hämtning i butik: påfyllningstider i Apple Store ${rtW(x)}`,
      description: `Bekräftade iPhone Duo-påfyllningar för hämtning i butik, Apple Store ${rtW(x)}, sedan ${x.t.since}: butik, konfiguration, klockslag. RestockWire kontrollerar varje butik var ${SPEED.checkSec}:e sekund; data grupperad på lokal timme, dag, ${x.place?.kind === "city" ? "" : `${rtU(x)}, `}butik och konfiguration.`,
      spatial: `${rtL(x)}: Apple Store`,
      measured: ["klockslag för påfyllning (butikens tid)", "Apple Store", "iPhone Duo: lagring, färg", "sekunder innan slutsålt"],
      size: `${restocksN(x.t.n)}, ${storesN(x.t.stores)}`,
    }),
    crumb: "iPhone Duo: påfyllningstider",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{cap(range(x.w.from, x.w.to))} (butikens tid): {share(x.w.share)} av {n(x.t.n)} påfyllningar. Kl. 8–12: {share(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number): string => `${restocksN(count)} under topptimmen`,
    morning: "kl. 8–12",
    evening: "efter kl. 17 – kvällen räknas också",
    night: "kl. 0–6",
    tooFew: (x: RestockTimesView) => <b>Ännu för få dagar för en vanlig timme{rtYet(x)}: {confirmedN(x.t.n)} på {pl(x.t.days, "dag", "dagar")} sedan {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Vanlig timme kräver <b className="text-ink">{PATTERN_MIN} påfyllningar på {PATTERN_MIN_DAYS} olika dagar</b></> },
      { text: <>Tio påfyllningar i en våg = en händelse, inte ett mönster</>, no: true },
      { text: <>Sidan räknar om sig själv för varje ny dag</>, step: true },
    ],
    hourCaption: (x: RestockTimesView): string => `iPhone Duo ${rtW(x)}: ${restocksN(x.t.n)} fördelade på butikens lokala timme, ${dateLabel(x.t.since, false)}–i dag`,
    hourHead: ["Timme (lokal)", "Påfyllningar", "% av alla"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Morgontoppen är <b className="text-ink">oberoende av öppettiden</b>{x.us ? " (de flesta Apple Store i USA öppnar kl. 10)" : ""}</> },
      { text: <>Hämtlagret släpps <b className="text-ink">online</b>, före öppning</> },
      { text: <>Bevakar du själv? Sikta på <b className="text-ink">{range(x.w.from, x.w.to)}</b> vardagsmorgnar</>, step: true },
      { text: <>Resterande <b className="text-ink">22 timmar</b> sköter en <Link href={x.alert}>bevakning</Link> – när ingen annan tittar</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Butikssidorna visar varje butiks egna timmar i dess tidszon (<Link href={x.storesHref}>{x.us ? "butikerna delstat för delstat" : `butikerna ${rtW(x)}`}</Link>). Så hittar du butiken som fyller på kl. 8 medan resten av {rtU(x) === "område" ? "området" : "regionen"} toppar kl. 9</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      if (t.n > 0 && tracked === 1) {
        return <b>Första bevakade dagen, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}: {confirmedN(t.n)}{one ? "" : ` i ${storesN(t.stores)}`}.</b>;
      }
      if (t.n > 0) {
        return <b>{t.days === tracked ? `Samtliga ${t.days} bevakade dagar` : `${t.days} av ${tracked} dagar sedan ${longDate(t.since)}`} hade minst en bekräftad påfyllning{t.peakWeekday != null ? `. Toppdag: ${WD[t.peakWeekday]}` : ""}.</b>;
      }
      return <b>Sedan {longDate(t.since)}: ingen bekräftad påfyllning {rtW(x)}.</b>;
    },
    daysTracked: "bevakade dagar som hade påfyllning",
    busiestDay: (x: RestockTimesView, day: DayRow): string => `toppdagen, ${dateLabel(day.date)}${x.one ? "" : ` · ${storesN(day.stores)}`}`,
    busiestDayNone: "toppdagen",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }): string => `butiker fick påfyllning inom samma halvtimme, ${zoneStamp(drop.at, x.c)} (${pl(drop.restocks, "konfiguration", "konfigurationer")}) – ett nationellt släpp`,
    weekend: (x: RestockTimesView): string => `föll på lördag eller söndag (${restocksN(x.weekend)})`,
    dayCaption: (x: RestockTimesView): string => `iPhone Duo-påfyllningar dag för dag ${rtW(x)}${x.t.reports.length ? ". Rader märkta ”rapporterad” är andra bevakningstjänsters publicerade observationer från före vår start – med bara för tidslinjens skull" : ""}`,
    dayHead: { date: "Dag", restocks: "Påfyllningar", stores: "Butiker", busiest: "Topptimme", source: "Ursprung" },
    soFar: " · pågår",
    reportedBy: (names: string[]) => <>källa: {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b> – lansering; första exemplaren gick till onlineorder</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b> – hämtning i butik öppnade igen{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">Rapporterad</b>-rader: lanseringsveckans observationer från {words(x.reportNames)}, utanför alla summor</> }
        : { text: <>RestockWires logg för butikerna {rtW(x)} startar <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Toppdag kräver <b className="text-ink">{WEEKDAY_MIN_SPAN} dagar</b> data – nu: {x.tracked}</>, no: true }] : []),
      { text: <>Titta på <b className="text-ink">butiker</b>-kolumnen: ju fler butiker en påfyllning sprids över, desto bättre chans</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>Flest: {hit[0].name} med {restocksN(hit[0].restocks)} sedan {dateLabel(x.t.since, false)} ({hit[0].storesTotal === 1 ? "en butik" : `${hit[0].stores} av ${hit[0].storesTotal} butiker`}){hit[1] ? <>, sedan {hit[1].name} ({n(hit[1].restocks)})</> : null}{hit[2] ? <> och {hit[2].name} ({n(hit[2].restocks)})</> : null}. {hit.length}/{total} {rtUs(x)} har haft påfyllning{total - hit.length > 0 ? `; ${total - hit.length} väntar ännu` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{none(rtU(x))} {rtU(x)} {rtW(x)} har en bekräftad påfyllning ännu. Den första öppnar tabellen.</b>,
    regionCaption: (x: RestockTimesView): string => `${cap(rtU(x))} för ${rtU(x)} ${rtW(x)}: iPhone Duo-påfyllningar, ${dateLabel(x.t.since, false)}–i dag`,
    regionHead: (x: RestockTimesView) => [cap(rtU(x)), "Påfyllningar", "Butiker med påfyllning", "Senast (lokal tid)"],
    ofN: (a: number, b: number) => <>{a}/{b}</>,
    storesCaption: (x: RestockTimesView): string => `Topplista ${rtW(x)}: butiker med flest iPhone Duo-påfyllningar, ${dateLabel(x.t.since, false)}–i dag`,
    storesHead: ["Butik", "Påfyllningar", "Dagar", "Typisk timme", "Senast (lokal tid)"],
    swaps: (x: RestockTimesView) => [
      { no: "Åka till listans etta, oavsett avstånd", yes: `Två–tre butiker inom en timme, redo runt ${x.pattern ? klock(x.w.from) : "morgonen"}`, why: "En påfyllning du inte hinner till är värdelös – och även toppbutiken står på ”inte tillgänglig” nästan hela dagen." },
      { no: "Lägga alla ägg i en butik", yes: "Bevaka flera och åk dit notisen pekar", why: "Tabellen är till för att välja ordning bland dina egna butiker." },
    ],
    nearMe: "Duo nära mig, live",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>Etta: {top.label} – {n(top.restocks)} av {n(x.t.n)} påfyllningar ({share(top.restocks / x.t.n)}){rarest ? `. Jumbo: ${rarest.label}, ${restocksN(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string): string => `${config} kommer tillbaka oftast av alla konfigurationer`,
    versus: (a: string, bCount: number, b: string): string => `för ${a} – jämfört med ${n(bCount)} för ${b}`,
    restocksOf: (a: string): string => `för ${a}`,
    byStorage: "lagring för lagring",
    byColour: "färg för färg",
    configNone: (x: RestockTimesView) => <b>Ännu ingen konfiguration {rtW(x)} med bekräftad påfyllning{rtYet(x)}. Alla åtta står listade så att första påfyllningen har sin rad.</b>,
    configCaption: (x: RestockTimesView): string => `iPhone Duo ${rtW(x)}, konfiguration för konfiguration: bekräftade påfyllningar ${dateLabel(x.t.since, false)}–i dag`,
    configHead: ["Konfiguration", "Påfyllningar", "% av alla", "Senast (lokal tid)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Valet av konfiguration <b className="text-ink">väger tyngre än valet av butik</b></> },
      x.storageRatio != null
        ? { text: <>Ta lagringen som kommer tillbaka oftast: cirka <b className="text-ink">{n(x.storageRatio)}×</b> bättre odds än nästa storlek</> }
        : { text: <>Ta lagringen som kommer tillbaka oftast – oddsen ökar <b className="text-ink">rejält</b></> },
      { text: <><b className="text-ink">2TB</b>: beställ för leverans och ha tålamod</>, no: true },
      { text: <>Pris och lager live: <Link href="/iphone-duo-most-restocked-stores">Vilken iPhone Duo fylls på oftast? (engelska)</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>Median {sell.medianSec} sekunder: så länge låg {n(sell.n)} uppmätta påfyllningar ute {rtW(x)}. {share(sell.within2min)} borta på 2 minuter, {share(sell.within20min)} på 20.</b>,
    secUnit: "s",
    medianListing: "median, ute till slut",
    within2: "slut på ≤ 2 min",
    within20: "slut på ≤ 20 min",
    fastest: "snabbaste slutförsäljningen hittills",
    howLongNone: (x: RestockTimesView) => <b>För få slutsålda påfyllningar {rtW(x)} för en mätning{rtYet(x)}. Siffrorna startar vid tio – USA-sidan har hela underlaget.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Två minuter räcker för en <b className="text-ink">bevakning</b> – inte för manuell uppdatering av apple.com</> },
      { text: <>Resten av sidans siffror följer av den här</> },
      { text: <>Varje påfyllning med sekunder ute, per konfiguration och {rtU(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">Hur snabbt säljer iPhone Duo slut efter en påfyllning? (engelska)</Link></>, step: true },
    ],
    measured: "Tiden mäts från kontrollen som först såg konfigurationen till kontrollen som såg den borta. Siffran är alltså ett tak – den faktiska tiden ute är kortare.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Påfyllning är ett ögonblick, inte ett läge. {x.one ? "En butik" : `${n(x.stores)} butiker`} × {x.configs} konfigurationer = {n(x.pairs)} möjliga listningar {rtW(x)}; just nu har {x.duoNow === 1 ? "1 butik" : `${x.duoNow} butiker`} någon iPhone Duo alls.</b>,
    pairs: "möjliga par butik × konfiguration",
    listingNow: "med iPhone Duo att hämta just nu",
    goneIn2: "av påfyllningarna slut på ≤ 2 min",
    last24: "bekräftade påfyllningar senaste dygnet",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Senaste dygnet: <b className="text-ink">{confirmedN(x.recent.restocks)}</b>, {storesN(x.recent.stores)} {rtW(x)}</> }
        : today > 0
          ? { text: <>I dag: <b className="text-ink">{confirmedN(today)}</b> {rtW(x)}</> }
          : { text: <>Dagstabellen ovan visar varje påfyllning som faktiskt skedde</> },
      { text: <>Varje påfyllning syntes på apple.com i <b className="text-ink">en till två minuter</b></> },
      { text: <>”Inte tillgänglig” överallt dag fyra eller dag fjorton betyder <b className="text-ink">inte</b> att Apple slutat fylla på</>, no: true },
    ],
    unavailableLinks: { explained: "Beskedet ”inte tillgänglig för hämtning” förklarat (engelska)", howToGet: "iPhone Duo i handen, steg för steg (engelska)" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Råden i <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> och <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> är välmenta men bygger ofta på en enda butik och åldras på ett dygn. Här är de fyra vanligaste, prövade mot {n(x.t.n)} bekräftade påfyllningar {rtW(x)}.</b>,
    redditCaption: "Reddit-påståenden om iPhone Duo-påfyllningar, prövade mot RestockWires bekräftade påfyllningar",
    redditHead: ["Påståendet", "Loggens svar"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      const empty = "Loggen har inget att pröva det mot ännu.";
      return [
        { claim: "”Påfyllningen sker på natten – kolla kl. 3.”", answer: t.n > 0 ? <>Kl. 0–6 lokal tid: {share(hourShare(t.byHour, 0, 6))} av påfyllningarna. {range(w.from, w.to)}: {share(w.share)}.</> : empty },
        { claim: "”Apple fyller bara på en viss veckodag.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>Toppdag hittills: {WD[t.peakWeekday]} ({n(t.byWeekday[t.peakWeekday])} av {n(t.n)}) – men påfyllning skedde {t.days} av {tracked} dagar.</> : <>Påfyllning skedde {t.days} av {tracked} bevakade dagar{t.days === tracked ? " – ingen dag utan" : ""}. En toppdag anges efter {WEEKDAY_MIN_SPAN} dagars data.</>) : empty },
        { claim: "”Ring butiken och fråga när leveransen kommer.”", answer: "Inget påfyllningsschema publiceras. Hämtlagret släpps online, och butiken ser det samtidigt som alla andra." },
        { claim: "”Inte tillgänglig betyder slut för gott.”", answer: recent.restocks > 0 ? <>Senaste dygnet: {confirmedN(recent.restocks)} i {storesN(recent.stores)}. Varje påfyllning återgick till ”inte tillgänglig” inom minuter.</> : t.n > 0 ? <>Sedan {dateLabel(t.since, false)}: {confirmedN(t.n)}. Varje påfyllning återgick till ”inte tillgänglig” inom minuter.</> : empty },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Rykten växer där <b className="text-ink">data saknas</b>. Här är datan – fri att läsa</> },
      { text: <>Där har Reddit rätt: <b className="text-ink">förbered kassan</b> – inloggad, Apple Pay klart (<Link href="/iphone-duo-restock-checkout-guide">20-sekundersguiden, engelska</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Påfyllning = en konfiguration som dyker upp för hämtning i butik på apple.com i en butik som inte hade den, bekräftad av två överensstämmande kontroller.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Bevakade butiker: var <b className="text-ink">{SPEED.fastSec}:e sekund</b>. {x.one ? "Landets Apple Store" : "Alla Apple Store"} {rtW(x)}: var <b className="text-ink">{SPEED.checkSec}:e sekund</b></> },
      // OTHER_TRACKERS ("8 seconds to 15 minutes"), Swedish wording.
      { text: <>Publicerade intervall hos andra bevakningstjänster: <b className="text-ink">8 sekunder–15 minuter</b>. Vi jämför enbart med vad de själva publicerar</> },
      { text: <>Ett första ”tillgänglig” kontrolleras om <b className="text-ink">efter cirka en sekund</b> innan det räknas</> },
      { text: <>En försvunnen listning bekräftas <b className="text-ink">vid nästa kontrollrunda</b></> },
      { text: <>Första avläsningen av en butik, ett misslyckat anrop, en timeout: <b className="text-ink">aldrig</b> påfyllning, aldrig ”slut”</>, no: true },
      { text: <>Timmar och datum står i varje butiks <b className="text-ink">lokala tid</b>; en ”våg” = samma halvtimme över tidszonerna</> },
      { text: <>Andra bevakningstjänsters rapporter{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} har egna märkta rader och <b className="text-ink">ingår aldrig i summorna</b></> },
      { text: <>Tabellerna räknas om ungefär var femte minut; <Link href={x.logHref}>loggen</Link> är live</>, step: true },
    ],
    quote: "Citera gärna: alla siffror här får användas med en länk tillbaka. RestockWire är fristående från Apple och läser samma hämtningsstatus som alla kan se på apple.com – bara betydligt oftare.",
    alertIn: (x: RestockTimesView) => <>Bevaka iPhone Duo{x.one ? "" : ` ${rtW(x)}`}</>,

    // ---- related, FAQ, sources
    related: "Mer om iPhone Duo",
    sameData: "Samma logg, andra frågor",
    questions: {
      sellOut: "Hur fort tar en påfyllning slut?",
      alerts: "Snabbaste beskedet",
      howToGet: "Så får du tag på en",
      whichConfig: "Konfigurationen som kommer tillbaka oftast",
      nearMe: "Livelager nära dig",
      unavailable: "”Inte tillgänglig” – vad betyder det?",
    },
    otherCountries: (us: boolean): string => (us ? "Samma sida, fler länder" : "Fler länder"),
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "Stadssidor",
      storesLive: (x: RestockTimesView): string => `Apple Store ${rtW(x)}: lager just nu`,
      countryPage: (c: Country): string => `Påfyllningstider för iPhone Duo ${inLand(c)}, alla butiker`,
      sourcesWhere: (x: RestockTimesView): string => `alla ${x.stores} Apple Store ${rtW(x)}`,
    },
    faqTitle: "Snabba svar",
  },
};
