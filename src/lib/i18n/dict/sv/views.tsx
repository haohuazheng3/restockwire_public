/**
 * Swedish strings: views — the product × place pages, the restock log, the live map, the iPhone Duo restock-times
 * answer page and the store index, translated from the English wire-service copy (du-form). `c: Country` is English
 * data: Sweden is named with countryLabel ("Sverige"). Store and Place objects are English data too; names are
 * written with Apple Sweden's forms (places.ts). Check intervals are only ever 15 and 5 seconds; no refund wording.
 * Links to pages that exist only in English carry "(på engelska)" in their label.
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
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { SV, apple, between, cap, color, dur, fit, klock, kr, land, n, noun, pl, prod, range, share, taxNote, words } from "./util";

/* ---------------------------------------------------------------- helpers */

const WD = weekdays(SV);
/** "tors 29 okt." from a calendar day, or "29 okt." without the weekday. */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** "29 oktober 2026". */
const longDate = (ymd: string) => new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "27 okt. 9:30 CET": an instant in the country's reference zone. */
const zoneStamp = (iso: string, c: Country) => stamp(SV, iso, c.timeZone, true);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "delstat" : noun(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "delstater" : noun(x.c, true));
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " ännu");
/** "Ingen"/"Inget" before a region word (område, departement and emirat are neuter). */
const none = (word: string) => (/^(område|departement|emirat)/.test(word) ? "Inget" : "Ingen");
const restocksN = (k: number) => pl(k, "påfyllning", "påfyllningar");
const confirmedN = (k: number) => pl(k, "bekräftad påfyllning", "bekräftade påfyllningar");
const storesN = (k: number) => pl(k, "butik", "butiker");
const inLand = (c: Country) => `i ${land(c.cc)}`;
/** "Apple X" from a bare store name. */
const appleOf = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);
/** A place in Swedish (Place objects carry English names). */
function placeName(place: Place): string {
  const cc: CountryCode = place.country ?? "us";
  if (place.level === "country") return land(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, SV);
  if (place.level === "city") return cityLabel(cc, place.city!, SV);
  return apple(place.store!);
}


/* ---------------------------------------------------------------- product × place (mirrors lib/seo/productCopy) */

function productTitle(product: Product, place: Place, inStock: number): string {
  const k = place.stores.length;
  const cc: CountryCode = place.country ?? "us";
  const name = prod(product.name);
  const short = prod(product.short);
  if (place.level === "country") {
    const w = land(cc);
    return fit([
      ...(inStock > 0 ? [`${pl(inStock, "Apple Store", "Apple Store-butiker")} i ${w} listar ${name} nu`] : []),
      `${name} i ${w}: lager för hämtning, live`,
      `${short} i ${w}: lager för hämtning`,
      `${short}: lager för hämtning`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = apple(s);
    return fit([
      `${name} på ${a}: ${inStock > 0 ? "listad för hämtning nu" : "lager och påfyllningar"}`,
      `${short} på ${a}: ${inStock > 0 ? "i lager nu" : "lagerstatus"}`,
      `${short} på ${a}`,
      `${short} på ${s.name}`,
      `${short} · ${s.name.replace(/^The /, "")}`,
    ]);
  }
  const w = placeName(place);
  return fit([`${name} i ${w}: ${inStock} av ${k} butiker listar den nu`, `${name} i ${w}: lager för hämtning, live`, `${short} i ${w}: i lager nu?`, `${short} i ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const cc: CountryCode = place.country ?? "us";
  const name = prod(product.name);
  const week = `${restocksN(stats.week)} den här veckan`;
  if (place.level === "store") {
    const s = place.store!;
    const a = apple(s);
    return fit([
      `${name} på ${a}, ${cityLabel(cc, s.city, SV)}: ${inStock > 0 ? "listad för hämtning vid senaste avläsningen" : "inte listad för hämtning just nu"}, ${week}. När butiken fyller på, hur länge det räcker och en notis inför nästa gång.`,
      `${name} på ${a}: ${inStock > 0 ? "i lager nu" : "inte i lager nu"}, ${week}. Påfyllningstider och notiser.`,
    ], 155);
  }
  const where = place.level === "country" ? `Apple Store-butiker i ${land(cc)}` : `Apple Store-butiker i ${placeName(place)}`;
  return fit([
    `${inStock} av ${place.stores.length} ${where} listar ${name} för hämtning just nu, ${week}. Butik för butik, med påfyllningstider och en notis i telefonen inför nästa.`,
    `${name}: ${inStock} av ${place.stores.length} ${where} har den nu, ${week}. Live per butik, påfyllningstider, notiser.`,
  ], 155);
}

/** Three or four short, data-driven questions; every answer is one sentence. */
function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const cc: CountryCode = place.country ?? "us";
  const out: FaqItem[] = [];
  const name = prod(product.name);
  const at = place.level === "store" ? `på ${apple(place.store!)}` : `i ${placeName(place)}`;
  const nearestBit = nearest ? `; närmaste butik som listar den är ${appleOf(nearest.name)} i ${nearest.city}, ${distance(SV, cc, nearest.distance)} bort` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Finns ${name} i lager ${at} just nu?`,
      a: l && l.available.length > 0
        ? `Ja${product.parts.length > 1 ? `: ${words(l.available.map((i) => `${i.storage} ${color(i.color)}`), 4)}` : ""}, listad för hämtning vid senaste avläsningen.`
        : `Inte vid senaste avläsningen${nearestBit}.`,
    });
  } else {
    out.push({
      q: `Vilka Apple Store-butiker ${at} listar ${name} just nu?`,
      a: inStock.length === 0
        ? `Inga vid senaste avläsningen${nearestBit}.`
        : `${storesN(inStock.length)} vid senaste avläsningen: ${words(inStock.map((l) => apple(l.store)), 4)}.`,
    });
  }
  const peak = peakOf(clock, SV);
  out.push({
    q: `Hur ofta kommer ${name} tillbaka ${at}?`,
    a: stats.month === 0 ? `Ingen bekräftad påfyllning ${at} de senaste ${stats.days} dagarna.` : `${confirmedN(stats.month)} de senaste ${stats.days} dagarna, varav ${n(stats.week)} den här veckan${peak ? `, oftast runt ${peak.hour} lokal tid` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Hur länge räcker en påfyllning av ${name} ${at}?`, a: `Medianen är ${dur(stats.medianMs)} innan den tar slut igen.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc: CountryCode = product.country ?? "us";
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  return lo === hi ? kr(cc, lo) : `${kr(cc, lo)}–${kr(cc, hi)}`;
}

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inLand(c),
    liveMap: "Livekarta",
    restockLog: "Påfyllningslogg",
    alertMe: "Få notiser",
    lastDays: (days: number) => <>{days} dagar, dag för dag</>,
    since: "2 november 2026",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `Apple Store-butiken ${inLand(c)}` : `alla ${k} Apple Store-butiker ${inLand(c)}`),
    checker: (c: Country) => `iPhone-lagerkoll ${land(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Store-butiker ${inLand(c)}`,
    storesWithIt: "butiker som listar den",
    more: "Visa fler",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `på ${name}` : `i ${name}`),
    h1Country: (model: string, c: Country) => `${prod(model)}: lager för hämtning i butik ${inLand(c)}`,
    h1Place: (model: string, where: string) => `${prod(model)} ${where}`,
    inStockNow: "Listad nu",
    yes: "Ja",
    no: "Nej",
    pickup: "hämtning",
    configurations: "konfigurationer",
    ofStores: (k: number) => `av ${storesN(k)}`,
    restocks24h: "Påfyllningar, 24 tim",
    restocksHint: (week: number, month: number, days: number) => `${n(week)} på 7 d · ${n(month)} på ${days} d`,
    sellOuts: (days: number) => `Slutsålt ${days} d`,
    stays: (ms: number) => `räcker ~${dur(ms)}`,
    noPairs: "ingen matchad slutförsäljning ännu",
    lastRestock: "Senaste påfyllning",
    noneYet: "ingen hittills",
    thisConfig: "den här konfigurationen",
    inDays: (days: number) => `på ${days} dagar`,
    notInStockNow: "Inte listad just nu",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{k}</b> av {of} konfigurationer listade</span>,
    inStockAt: (k: number, of: number) => <span>Listad i <b className="text-ink">{k}</b> av {of} {of === 1 ? "butik" : "butiker"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>Avläst {live} · {price}{tax}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "före skatt",
    buyOnApple: "Beställ på apple.com",
    allStoresIn: (c: Country) => `Varje butik ${inLand(c)}`,
    everyIphoneHere: "Alla iPhone på den här platsen",
    everyIphone: (where: string) => `Alla iPhone ${where}`,
    panel: (model: string, where: string | null) => `${prod(model)}${where ? ` ${where}` : ""}: välj konfigurationer, sedan butiker`,
    unitConfigs: "konfigurationer",
    unitStores: "butiker",
    otherConfigsHere: "Fler konfigurationer här",
    byStorageColor: "Lagring och färg",
    nearestStores: "Närmaste butiker",
    closest: (link: ReactNode, dist: string) => <>Närmaste butik som listar den: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Senast listad",
    storesWithItNow: "Butiker som listar den nu",
    storesIn: (where: string) => `Butiker ${where}`,
    colStatus: "status",
    colConfigs: "konfig. listade",
    noStoreHasIt: "Ingen butik listar den just nu.",
    noStoreHereHasIt: "Ingen butik i det här området listar den just nu.",
    moreStores: (k: number) => <>{k} butiker till, sorterade per delstat nedan.</>,
    byRegion: (c: Country) => `Per ${noun(c)}`,
    byCity: "Per stad",
    nearbyStores: "Butiker i närheten",
    latestChanges: "Senaste ändringarna",
    nothingLogged: "Loggen är tom än så länge.",
    whenRestocks: "Vanliga påfyllningstider",
    howFast: "Hur länge en påfyllning räcker",
    restocksByConfig: "Vilka konfigurationer fylls på",
    faqTitleCountry: (model: string, c: Country) => `${prod(model)} ${inLand(c)}: frågor`,
    faqTitle: (model: string, where: string) => `${prod(model)} ${where}`,
    buySource: (model: string, c: Country) => `Apple: beställningssida för ${prod(model)} (${land(c.cc)})`,
    nearby: "I närheten",
    otherRegions: (c: Country) => `Andra ${noun(c, true)}`,
    elsewhereIn: (region: string) => `Längre bort i ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Store-butiker ${inLand(c)}, hela listan`,
    across: (model: string, c: Country) => `${prod(model)} i hela ${land(c.cc)}`,
    itemList: (model: string, where: string) => `${prod(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Just nu listar ingen Apple Store ${inLand(c)} ${model} för hämtning, så ”nära mig” avgörs av vilken butik i närheten som fyller på först. Med en bevakning på varje butik du kan nå kommer notisen till din telefon sekunder efter att en av dem listar den.`
        : `${inStock} av ${k} butiker listar ${model} just nu: ${words(have.slice(0, 5).map((l) => `${l.store} i ${l.city} (${pl(l.configs, "konfiguration", "konfigurationer")})`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c)), "Butiker som listar den nu"],
    nearCaption: (c: Country, model: string) => `Lager av ${model} för hämtning per ${noun(c)}, senaste kontrollen`,
    nearMe: (c: Country, model: string, alert: string) => `Tryck på Nära mig i bevakningen på den här sidan så rangordnas varje butik från där du står, efter uppskattat vägavstånd i ${c.unit === "mi" ? "engelska mil" : "kilometer"}, och varje butik får en länk till vägbeskrivning. [Bevaka ${model}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Vad kostar ${model} ${inLand(c)}?`, a: `${kr(c.cc, low)} till ${kr(c.cc, high)} på apple.com (${taxNote(c)}), beroende på lagring.` },
      reserve: { q: `Går det att reservera ${model} för hämtning ${inLand(c)}?`, a: `Inte i förväg: när en butik listar din konfiguration beställer du den på apple.com med hämtning i butik, och Apple håller den till din tid.${inStock === 0 ? " Ingen butik listar den just nu, så med en bevakning är du först." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, k: number) => `Påfyllningslogg för iPhone ${inLand(c)}, live: ${k === 1 ? "Apple Store-butiken" : `${k} Apple Store-butiker`}`,
    metaDescription: (c: Country, k: number) => `Varje bekräftad påfyllning för hämtning i butik av iPhone Duo, 18 Pro och Pro Max i ${k === 1 ? "Apple Store-butiken" : "Apple Store-butikerna"} ${inLand(c)}: tid, exakt konfiguration, karta.`,
    h1: (c: Country) => `iPhone-påfyllningar ${inLand(c)}, medan de sker`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{restocksN(day)} de senaste 24 timmarna · {n(week)} på 7 dagar{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Tiderna visas i din egen tidszon.</>,
    allModels: "Alla modeller",
    restocks: "Påfyllningar",
    withSoldOut: "Påfyllningar och slutsålt",
    regionLabel: (c: Country) => cap(noun(c)),
    allRegions: (c: Country) => `Alla ${noun(c, true)}`,
    filter: "Använd",
    page: (k: number) => <>sida {k}</>,
    newer: "← Nyare",
    older: "Äldre →",
    getAlerts: "Ställ in notiser",
    byPlace: "Påfyllningar, plats för plats",
    byRegion: (c: Country) => `Per ${noun(c)}`,
    datasetName: (c: Country) => `Påfyllningar av iPhone för hämtning i butik i Apple Store-butikerna ${inLand(c)}`,
    datasetDescription: (c: Country) => `Bekräftade påfyllningar och slutförsäljningar för hämtning i butik av iPhone Duo, iPhone 18 Pro och iPhone 18 Pro Max i ${c.cc === "us" ? "alla 269 Apple Store-butiker i USA" : `Apple Store-butikerna ${inLand(c)}`}: butik, exakt konfiguration, tid. Butikerna läses var 15:e sekund (var 5:e sekund där en bevakning finns), och en påfyllning hamnar i loggen först när apple.com har gett samma svar två gånger.`,
    datasetMeasured: ["Apple Store", "iPhone-modell, lagring och färg", "tidpunkt för påfyllning", "tidpunkt för slutsålt"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, k: number) => `Livekarta över lager av iPhone Duo: ${k === 1 ? "Apple Store-butiken" : "varje Apple Store"} ${inLand(c)}`,
    metaDescription: (c: Country, k: number) => `Var iPhone Duo, 18 Pro och Pro Max listas för hämtning i butik just nu: ${k === 1 ? "Apple Store-butiken" : `alla ${k} Apple Store-butiker`} ${inLand(c)} på en livekarta, per lagring och färg.`,
    // Data for the map component (it looks the region word up by this English key).
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Alla butiker",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const named = words(storesOf(c.cc).map((s) => { const nm = apple(s).replace(/^Apple /, ""); const city = cityLabel(c.cc, s.city, SV); return nm.includes(city) ? nm : `${nm} (${city})`; }));
      const by = c.regionNoun && regions > 1 ? ` per ${noun(c)} och stad` : cities > 1 ? " per stad" : "";
      return fit([
        ...(k <= 4 ? [`${duo} listar iPhone Duo och ${max} Pro Max just nu: lager för hämtning live i alla ${k} Apple Store-butiker ${inLand(c)}, ${named}. 18 Pro ingår.`] : []),
        `${duo} listar iPhone Duo och ${max} Pro Max just nu: lager för hämtning live i alla ${k} Apple Store-butiker ${inLand(c)}${by}, 18 Pro inräknad.`,
      ], 160);
    },
    // A lead is named only when one region clearly has the most (no "leads with 1").
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => {
      const lead = top.length && top[0].count > 1 && (!top[1] || top[0].count > top[1].count) ? `; ${top[0].name} leder med ${top[0].count}${top[1] ? `, före ${top[1].name} (${top[1].count})` : ""}` : "";
      const sthlm = /Solna/.test(spread) && /Täby/.test(spread) ? "; Stockholms två butiker ligger i Solna (Mall of Scandinavia) och Täby (Täby Centrum), ingen i innerstan" : "";
      return `${k}, ${spread}${lead}${sthlm}.`;
    },
    howMany: (c: Country) => <>Hur många Apple Store-butiker finns det {inLand(c)}?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `Vilka Apple Store-butiker ${inLand(c)} listar iPhone Duo just nu?`,
      a: have.length === 0
        ? `Ingen av de ${k} vid senaste kontrollen; sidan och kartan ändras i samma stund som en butik listar den, och en bevakning når dig före båda.`
        : `${have.length} av de ${k} vid senaste kontrollen: ${have.length > 6 ? `${have.slice(0, 6).map((x) => apple(x)).join(", ")} med flera` : words(have.map((x) => apple(x)))}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, SV),
    duoBlock: (alert: string) => `En bevakning på butikerna du kan nå är snabbaste vägen till en: [bevaka iPhone Duo](${alert}). En bevakning gäller en butik × en exakt konfiguration, och din telefon får veta det sekunder efter att butiken listar den.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) =>
      `Just nu listar **${now.duo}** en iPhone Duo för hämtning, **${now.max}** iPhone 18 Pro Max och **${now.pro}** 18 Pro, av **${pl(k, "Apple Store", "Apple Store-butiker")}** ${inLand(c)}, ${spread}${/Solna/.test(spread) && /Täby/.test(spread) ? " (Solna och Täby är Stockholms två)" : ""}. ${tax}`,
    crumb: "Apple Store-butiker",
    panel: (c: Country) => `Välj dina telefoner och bocka sedan i butikerna ${inLand(c)} som du kan nå`,
    matrixLabel: "Lager per butik",
    matrixH2: (c: Country) => <>Lager butik för butik {inLand(c)}</>,
    matrixHint: "Listad nu / bevakad, per modell.",
    topCaption: (c: Country) => <>{cap(noun(c, true))} rangordnade efter antal Apple Store-butiker (från Apples butikslista, så som den bevakas här)</>,
    regionHead: (c: Country) => cap(noun(c)),
    colStores: "Apple Store-butiker",
    colCities: "Städer",
    locationsBy: (c: Country) => `Var Apple Store-butikerna ligger, ${noun(c)} för ${noun(c)}`,
    locationsIn: (c: Country) => `Varje Apple Store ${inLand(c)}`,
    storeCount: (k: number) => <>{k} {k > 1 ? "butiker" : "butik"}</>,
    storeCountAll: (k: number) => <>{k} butiker</>,
    whenRestock: (c: Country) => <>Vilken tid fyller butikerna {inLand(c)} på?</>,
    howFast: (c: Country) => <>Hur länge räcker en påfyllning {inLand(c)}?</>,
    faqTitle: (c: Country) => `Apple Store-butiker ${inLand(c)}: frågor`,
    getApp: "Hämta appen",
    howItWorks: "Så fungerar det",
    pricing: "Priser",
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
      storeWithPlace: (s: Store) => `${apple(s)} (${cityLabel(s.country, s.city, SV)})`,
    },
    title: (c: Country) => `Vilken tid fyller Apple på iPhone Duo ${inLand(c)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "delstat" : c.regionNoun ? noun(c) : "butik";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fit([
          `${restocksN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}: ${share(w.share)} ${between(w.from, w.to)} lokal tid${t.sellout ? `, ${share(t.sellout.within2min)} borta inom 2 minuter` : ""}. Tabeller per timme, dag, ${region}, butik och konfiguration.`,
          `${restocksN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}: ${share(w.share)} ${between(w.from, w.to)} lokal tid. Tabeller per timme, dag, ${region} och konfiguration.`,
          `Påfyllningstider för iPhone Duo ${inLand(c)}: ${restocksN(t.n)} sedan ${since}, per timme, dag, ${region} och konfiguration.`,
        ], 158)
        : t.n > 0
          ? fit([
            `${confirmedN(t.n)} av iPhone Duo i Apple Store-butiker ${inLand(c)} sedan ${since}, från kontroller var ${SPEED.checkSec}:e sekund: per lokal timme, dag för dag, per ${region}, butik och konfiguration, och hur länge var och en räckte.`,
            `Påfyllningstider för iPhone Duo ${inLand(c)}: ${confirmedN(t.n)} sedan ${since}, per timme, dag, ${region} och konfiguration.`,
          ], 158)
          : fit([
            `Påfyllningstider för iPhone Duo i Apple Store-butiker ${inLand(c)}, timme för timme, dag för dag, per butik och konfiguration, från RestockWire som läser varje butik var ${SPEED.checkSec}:e sekund sedan ${longDate(t.since)}.`,
            `Påfyllningstider för iPhone Duo ${inLand(c)}: timme för timme och per butik, från kontroller var ${SPEED.checkSec}:e sekund sedan ${since}.`,
          ], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `Vilken tid fyller Apple på iPhone Duo ${inLand(x.c)}?`
      : x.t.n > 0
        ? `Vilken tid fyller Apple på iPhone Duo ${inLand(x.c)}? ${x.pattern ? `Oftast ${range(x.w.from, x.w.to)} lokal tid` : "Våra egna kontroller, timme för timme"}`
        : `Fyller Apple på iPhone Duo ${inLand(x.c)}? Inte hittills, och det här bevakar vi`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inLand(x.c);
      return t.unknown ? (
        <>Påfyllningsloggen går inte att läsa för tillfället. Butikerna {where} läses fortfarande var {SPEED.checkSec}:e sekund, och siffrorna kommer tillbaka vid nästa sidladdning.</>
      ) : t.n > 0 && pattern ? (
        // The sentence an answer engine lifts whole: share, sample size, since-date, window, local time (docs/research.md §8).
        <>
          <b className="text-ink">{share(w.share)} av de {n(t.n)} påfyllningarna av iPhone Duo</b> som RestockWire bekräftat i {one ? "Apple Store-butiken" : "Apple Store-butikerna"} {where} sedan {longDate(t.since)} kom <b className="text-ink">{between(w.from, w.to)}</b>, butikens lokala tid{x.sell ? <>; en typisk påfyllning var borta efter ungefär {Math.round(x.sell.medianSec / 5) * 5} sekunder</> : null}. <b className="text-ink">Påfyllningarna fortsätter</b>{tracked > 1 ? <>: {t.days} av {tracked} bevakade dagar hade minst en</> : <> (en bevakad dag hittills)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Ja.</b> <b className="text-ink">{restocksN(t.n)} av iPhone Duo sedan {longDate(t.since)}</b> i {one ? "Apple Store-butiken" : "Apple Store-butikerna"} {where}{tracked > 1 ? <>, på {t.days} av {tracked} dagar</> : <> (en bevakad dag hittills)</>}; vi anger en vanlig tid när det finns {PATTERN_MIN} påfyllningar på {PATTERN_MIN_DAYS} olika dagar.
        </>
      ) : (
        <>
          <b className="text-ink">Inte hittills.</b> RestockWire har läst {one ? "Apple Store-butiken" : `alla ${x.stores} Apple Store-butiker`} {where} var {SPEED.checkSec}:e sekund sedan {longDate(t.since)} utan att bekräfta en enda påfyllning av iPhone Duo för hämtning.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `bekräftade påfyllningar sedan ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `kom ${between(x.w.from, x.w.to)}, butikens lokala tid`,
      days: "dagar med minst en påfyllning",
      // English infers a literal return type here; the Swedish words are the same shape.
      now: ((one: boolean) => (one ? "butik listar en för hämtning just nu" : "butiker listar en för hämtning just nu")) as unknown as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `hittills idag (${dateLabel(today.date)})${x.one ? "" : `, i ${storesN(today.stores)}`}`,
      weekday: "den mest aktiva veckodagen hittills",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Senaste: <b className="text-ink">{latest.config}</b>{x.one ? null : <> på <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, SV)} lokal tid</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Flest på <b className="text-ink">{WD[x.t.peakWeekday]}ar</b></> }] : []),
      { text: <>Det finns <b className="text-ink">inget officiellt schema för påfyllningar</b>; siffrorna är våra egna bekräftade kontroller, uppdaterade ungefär var femte minut</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{x.duoNow} av {x.stores}</b> listar en för hämtning just nu</> },
      { text: <>Första bekräftade påfyllningen startar varje tabell nedan</>, step: true },
      { text: <>Mönster per timme och veckodag från det största underlaget finns på <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">sidan för USA (på engelska)</Link></>, step: true },
    ],
    setUpAlert: "Få notiser om iPhone Duo",
    logLive: "Påfyllningsloggen live",
    onThisPage: "Avsnitt",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Timme",
      "day-by-day": "Dagar",
      where: `Per ${rtRegion(x)}`,
      configuration: "Konfigurationer",
      "how-long": "Hur snabbt slut",
      unavailable: "”Inte tillgänglig”",
      reddit: "Reddit-påståenden",
      method: "Metod",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Vilken timme kommer iPhone Duo tillbaka ${inLand(x.c)}?`,
      "day-by-day": `Vilka dagar fylldes iPhone Duo på ${inLand(x.c)}?`,
      where: `Var ${inLand(x.c)} fylls iPhone Duo på oftast?`,
      configuration: `Vilken lagring och färg av iPhone Duo fylls på oftast ${inLand(x.c)}?`,
      "how-long": `Hur många sekunder räcker en påfyllning av iPhone Duo ${inLand(x.c)}?`,
      unavailable: "Varför visar apple.com ”inte tillgänglig” i varje butik?",
      reddit: "Reddits teorier om påfyllningar av iPhone Duo, kollade mot loggen",
      method: "Vad räknas som en påfyllning på RestockWire?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inLand(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `När fyller Apple på iPhone Duo ${where}?`, a: t.n > 0 && pattern
          ? `${cap(window)} i butikens lokala tid kom ${share(w.share)} av de ${n(t.n)} bekräftade påfyllningarna sedan ${longDate(t.since)}, och mellan kl. 8 och 12 kom ${share(hourShare(t.byHour, 8, 12))}. Det finns inget officiellt schema; det här är mönstret RestockWire ser, uppdaterat ungefär var femte minut.`
          : `RestockWire har loggat ${confirmedN(t.n)} ${where} sedan ${longDate(t.since)}${t.days ? `, på ${pl(t.days, "dag", "dagar")}` : ""}, och Apple aviserar inget schema. När det finns ${PATTERN_MIN} påfyllningar på ${PATTERN_MIN_DAYS} olika dagar anger sidan själv en vanlig tid.` },
        { q: `Fyller Apple på iPhone Duo på helgerna${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja" : "Inte hittills"}: ${restocksN(weekend)} av ${n(t.n)} (${share(weekend / t.n)}) kom på en lördag eller söndag. ${t.peakWeekday != null ? `Den mest aktiva veckodagen hittills är ${WD[t.peakWeekday]}.` : `Vi anger en mest aktiv veckodag först när datan täcker ${WEEKDAY_MIN_SPAN} dagar; hittills täcker den ${tracked}.`}`
          : `Det finns ingen helgdata ${where} hittills; dagtabellen på sidan växer med varje bekräftad påfyllning.` },
        { q: "När ska jag börja hålla koll på apple.com?", a: t.n > 0 && pattern
          ? `För hand: ha apple.com öppet med hämtning vald från ${klock(w.from)} lokal tid; det tvåtimmarsfönstret rymmer ${share(w.share)} av påfyllningarna. En typisk påfyllning ${sell ? `var borta inom ${sell.medianSec} sekunder (median)` : "räcker ungefär en minut"}, och därför slår en bevakning som läser butiken var ${SPEED.fastSec}:e sekund ([så fungerar notiser, på engelska](/iphone-duo-restock-alerts)) hur mycket uppdaterande som helst.`
          : `Medan mönstret ${where} fortfarande tar form kan en bevakning hålla utkik åt dig: butikerna du väljer läses var ${SPEED.fastSec}:e sekund, dygnet runt ([så fungerar notiser, på engelska](/iphone-duo-restock-alerts)).` },
        { q: "Varför är iPhone Duo ”inte tillgänglig” i varje Apple Store?", a: sell
          ? `Påfyllningarna är korta: av de ${n(sell.n)} slutsålda påfyllningarna vi mätt ${where} var ${share(sell.within2min)} borta inom 2 minuter och ${share(sell.within20min)} inom 20. Just nu listar ${x.duoNow} av ${x.stores} butiker en, så för det mesta säger apple.com sanningsenligt ”inte tillgänglig”, även dagar med dussintals påfyllningar ([vad ”inte tillgänglig” betyder, på engelska](/apple-store-pickup-explained)).`
          : `Lager för hämtning dyker upp några minuter i taget; just nu listar ${x.duoNow} av ${storesN(x.stores)} ${where} en ([vad ”inte tillgänglig” betyder, på engelska](/apple-store-pickup-explained)).` },
        { q: "Kan jag få en notis när min Apple Store får tillbaka iPhone Duo?", a: `Ja: en bevakning på den butiken med exakt lagring och färg gör att butiken läses var ${SPEED.fastSec}:e sekund, och din telefon får veta det ungefär ${SPEED.alertSec} sekunder efter att en påfyllning bekräftats ([skapa en bevakning](${x.alert}); [så fungerar det, på engelska](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: hjälp om leverans och hämtning (så fungerar tillgänglighet för hämtning)",
      newsroom: "Apple Newsroom: iPhone Duo kommer till Apple Store-butiker över hela världen (23 oktober 2026)",
      macRumors: "MacRumors: systemet för hämtning av iPhone Duo i Apple Store i gång igen i USA och Kanada (24 oktober 2026)",
      reports: (tracker: string) => `${tracker}: rapporter om påfyllningar av iPhone Duo under lanseringsveckan (deras egna observationer, hålls separat och räknas aldrig)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Påfyllningstider för hämtning av iPhone Duo i butik, Apple Store-butiker ${inLand(x.c)}`,
      description: `Bekräftade påfyllningar för hämtning i butik av iPhone Duo i Apple Store-butiker ${inLand(x.c)} sedan ${x.t.since} (butik, konfiguration, tid), från RestockWire som läser varje butik var ${SPEED.checkSec}:e sekund; grupperade per lokal timme, dag, ${rtRegion(x)}, butik och konfiguration.`,
      spatial: `Apple Store-butiker ${inLand(x.c)}`,
      measured: ["tidpunkt för påfyllning (butikens lokala tid)", "Apple Store", "lagring och färg för iPhone Duo", "sekunder till slutsålt"],
      size: `${restocksN(x.t.n)} i ${storesN(x.t.stores)}`,
    }),
    crumb: "Påfyllningstider för iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{cap(between(x.w.from, x.w.to))}, butikens lokala tid, rymmer {share(x.w.share)} av de {n(x.t.n)} påfyllningarna; mellan kl. 8 och 12 rymmer {share(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `${restocksN(count)} under den mest aktiva enskilda timmen`,
    morning: "mellan kl. 8 och 12",
    evening: "efter kl. 17, så kvällarna räknas också",
    night: "mellan midnatt och kl. 6",
    tooFew: (x: RestockTimesView) => <b>För få dagar för att ange en timme{rtYet(x)}: {confirmedN(x.t.n)} på {pl(x.t.days, "dag", "dagar")} sedan {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>En vanlig timme kräver <b className="text-ink">{PATTERN_MIN} påfyllningar på {PATTERN_MIN_DAYS} olika dagar</b></> },
      { text: <>En våg på tio påfyllningar är en enda händelse, ingen vana</>, no: true },
      { text: <>Varje ny dag med data uppdaterar sidan av sig själv</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${restocksN(x.t.n)} av iPhone Duo ${inLand(x.c)} per lokal timme i butiken, ${dateLabel(x.t.since, false)} till idag`,
    hourHead: ["Lokal timme", "Påfyllningar", "Andel"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Morgontoppen har <b className="text-ink">inget med öppettiden att göra</b>{x.us ? " (de flesta Apple Store i USA öppnar kl. 10)" : ""}</> },
      { text: <>Apple släpper lagret för hämtning <b className="text-ink">online</b>, innan dörrarna öppnar</> },
      { text: <>Håller du koll för hand? Bevaka <b className="text-ink">{range(x.w.from, x.w.to)}</b> på vardagsmorgnar</>, step: true },
      { text: <>En <Link href={x.alert}>bevakning</Link> täcker <b className="text-ink">de återstående 22 timmarna</b>, när ingen annan tittar</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Varje butikssida visar sina egna timmar i sin egen tidszon (<Link href={x.storesHref}>{x.us ? "Apple Store per delstat" : `butikerna ${inLand(x.c)}`}</Link>), så du hittar butiken som fyller på kl. 8 när resten av {rtRegion(x) === "område" ? "området" : "regionen"} toppar kl. 9</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{confirmedN(t.n)}{one ? "" : ` i ${storesN(t.stores)}`} under den enda bevakade dagen hittills, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Alla ${t.days} bevakade dagar` : `${t.days} av de ${tracked} dagarna sedan ${longDate(t.since)}`} hade minst en bekräftad påfyllning{t.peakWeekday != null ? `; ${WD[t.peakWeekday]} leder bland veckodagarna` : ""}.</b>
      ) : (
        <b>Noll bekräftade påfyllningar {inLand(x.c)} sedan {longDate(t.since)}.</b>
      );
    },
    daysTracked: "bevakade dagar med minst en påfyllning",
    busiestDay: (x: RestockTimesView, day: DayRow) => `den största dagen, ${dateLabel(day.date)}${x.one ? "" : `, i ${storesN(day.stores)}`}`,
    busiestDayNone: "största dagen",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `butiker fyllde på inom samma halvtimme, ${zoneStamp(drop.at, x.c)} (${pl(drop.restocks, "konfiguration", "konfigurationer")}): ett nationellt släpp`,
    weekend: (x: RestockTimesView) => `kom på en helg (${restocksN(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `Påfyllningar av iPhone Duo per dag ${inLand(x.c)}${x.t.reports.length ? "; rader märkta ”rapporterad” kommer från andra bevakningstjänsters publicerade observationer innan vår bevakning startade och finns bara med för tidslinjen" : ""}`,
    dayHead: { date: "Datum", restocks: "Påfyllningar", stores: "Butiker", busiest: "Mest aktiva timmen", source: "Källa" },
    soFar: " · hittills",
    reportedBy: (names: string[]) => <>enligt {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: lanseringsdag, de första exemplaren skickades till onlinebeställningar</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: hämtning i butik kom tillbaka{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Rader märkta <b className="text-ink">rapporterad</b> är observationer från lanseringsveckan av {words(x.reportNames)}, utanför varje summa</> }
        : { text: <>RestockWires logg för varje butik {inLand(x.c)} börjar <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>En mest aktiv veckodag kräver <b className="text-ink">{WEEKDAY_MIN_SPAN} dagar</b> med data (vi har {x.tracked})</>, no: true }] : []),
      { text: <>Håll ögonen på kolumnen <b className="text-ink">butiker</b>: påfyllningar utspridda över fler butiker ger dig bättre odds</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {restocksN(hit[0].restocks)} {hit[0].storesTotal === 1 ? "i sin enda butik" : `i ${hit[0].stores} av sina ${hit[0].storesTotal} butiker`} sedan {dateLabel(x.t.since, false)}{hit[1] ? <>, följt av {hit[1].name} ({n(hit[1].restocks)})</> : null}{hit[2] ? <> och {hit[2].name} ({n(hit[2].restocks)})</> : null}; {hit.length} av {total} {rtRegions(x)} har haft en påfyllning{total - hit.length > 0 ? `, ${total - hit.length} fortfarande ingen` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{none(rtRegion(x))} {rtRegion(x)} {inLand(x.c)} har någon bekräftad påfyllning hittills; den första startar tabellen.</b>,
    regionCaption: (x: RestockTimesView) => `Bekräftade påfyllningar av iPhone Duo per ${rtRegion(x)} ${inLand(x.c)}, ${dateLabel(x.t.since, false)} till idag`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Påfyllningar", "Butiker som fyllt på", "Senaste påfyllning (lokal tid)"],
    ofN: (a: number, b: number) => <>{a} av {b}</>,
    storesCaption: (x: RestockTimesView) => `Butikerna med flest påfyllningar av iPhone Duo ${inLand(x.c)}, ${dateLabel(x.t.since, false)} till idag`,
    storesHead: ["Butik", "Påfyllningar", "Dagar", "Vanlig timme", "Senast (lokal tid)"],
    swaps: (x: RestockTimesView) => [
      { no: "Jaga butiken högst upp på listan, hur långt bort den än ligger", yes: `Två eller tre butiker du når inom en timme runt ${x.pattern ? klock(x.w.from) : "morgonen"}`, why: "En påfyllning utom räckhåll hjälper dig inte, och även den mest aktiva butiken visar ”inte tillgänglig” alla utom några få minuter om dagen." },
      { no: "Satsa allt på en enda butik", yes: "En bevakning på var och en, och åk till den som slår larm", why: "Använd tabellen bara för att avgöra vilken av dina butiker du ska åka till först." },
    ],
    nearMe: "Duo i lager nära mig, live",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} leder med {n(top.restocks)} av de {n(x.t.n)} påfyllningarna ({share(top.restocks / x.t.n)}){rarest ? `; ${rarest.label} kommer sist med ${restocksN(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} fylls på oftare än någon annan konfiguration`,
    versus: (a: string, bCount: number, b: string) => `påfyllningar av ${a}, mot ${n(bCount)} för ${b}`,
    restocksOf: (a: string) => `påfyllningar av ${a}`,
    byStorage: "per lagringsstorlek",
    byColour: "per färg",
    configNone: (x: RestockTimesView) => <b>Ingen konfiguration {inLand(x.c)} har en bekräftad påfyllning{rtYet(x)}; alla åtta listas så att den första påfyllningen har sin rad redo.</b>,
    configCaption: (x: RestockTimesView) => `Bekräftade påfyllningar av iPhone Duo per konfiguration ${inLand(x.c)}, ${dateLabel(x.t.since, false)} till idag`,
    configHead: ["Konfiguration", "Påfyllningar", "Andel", "Senaste påfyllning (lokal tid)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Att välja konfiguration spelar <b className="text-ink">större roll än att välja butik</b></> },
      x.storageRatio != null
        ? { text: <>Nöj dig med den lagring som fylls på oftast så blir dina odds ungefär <b className="text-ink">{n(x.storageRatio)}×</b> så höga som för nästa storlek</> }
        : { text: <>Nöj dig med den lagring som fylls på oftast så stiger dina odds <b className="text-ink">kraftigt</b></> },
      { text: <><b className="text-ink">2TB</b> är en att beställa för leverans och vänta på</>, no: true },
      { text: <>Priser och lager live: <Link href="/iphone-duo-most-restocked-stores">Vilken iPhone Duo fylls på oftast? (på engelska)</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{sell.medianSec} sekunder: medianlivslängden för de {n(sell.n)} slutsålda påfyllningarna {inLand(x.c)}; {share(sell.within2min)} var borta inom 2 minuter och {share(sell.within20min)} inom 20.</b>,
    secUnit: "s",
    medianListing: "median, från listad till borta",
    within2: "borta inom 2 minuter",
    within20: "borta inom 20 minuter",
    fastest: "snabbast slutsåld hittills",
    howLongNone: (x: RestockTimesView) => <b>För få slutsålda påfyllningar {inLand(x.c)} för att mäta{rtYet(x)}; siffrorna börjar vid tio, och sidan för USA har hela underlaget.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Två minuter är ett fönster för en <b className="text-ink">bevakning</b>, inte för att trycka på uppdatera på apple.com</> },
      { text: <>Alla andra siffror på sidan följer av den här</> },
      { text: <>Varje påfyllning och hur många sekunder den räckte, per konfiguration och {rtRegion(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">Hur snabbt säljer en påfyllning av iPhone Duo slut? (på engelska)</Link></>, step: true },
    ],
    measured: "Varje siffra räknas från kontrollen som först såg konfigurationen listad till kontrollen som såg den borta, vilket gör den till ett tak: de verkliga livslängderna är kortare.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>En påfyllning är ett ögonblick, inte ett tillstånd: {x.one ? "en butik" : `${n(x.stores)} butiker`} × {x.configs} konfigurationer ger {n(x.pairs)} möjliga listningar {inLand(x.c)}, och just nu listar {x.duoNow === 1 ? "1 butik" : `${x.duoNow} butiker`} någon iPhone Duo över huvud taget.</b>,
    pairs: "möjliga listningar butik × konfiguration",
    listingNow: "med en iPhone Duo listad för hämtning just nu",
    goneIn2: "av påfyllningarna över inom två minuter",
    last24: "bekräftade påfyllningar, senaste 24 timmarna",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Senaste 24 timmarna: <b className="text-ink">{confirmedN(x.recent.restocks)}</b> i {storesN(x.recent.stores)} {inLand(x.c)}</> }
        : today > 0
          ? { text: <>Idag: <b className="text-ink">{confirmedN(today)}</b> {inLand(x.c)}</> }
          : { text: <>Dagtabellen ovan visar påfyllningarna som faktiskt ägde rum</> },
      { text: <>Var och en låg ute på apple.com i <b className="text-ink">en minut eller två</b></> },
      { text: <>Att se ”inte tillgänglig överallt” på dag fyra eller dag fjorton betyder <b className="text-ink">inte</b> att Apple har slutat</>, no: true },
    ],
    unavailableLinks: { explained: "”Inte tillgänglig för hämtning just nu”, förklarat (på engelska)", howToGet: "Skaffa en iPhone Duo, steg för steg (på engelska)" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Många av råden i <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> och <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> är ärligt menade, bygger på en enda butik och är inaktuella dagen efter; nedan är de fyra påståenden som dyker upp oftast, testade mot {n(x.t.n)} bekräftade påfyllningar {inLand(x.c)}.</b>,
    redditCaption: "Vanliga påståenden på Reddit om påfyllningar av iPhone Duo, testade mot RestockWires bekräftade påfyllningar",
    redditHead: ["Påstående", "Vad loggen visar"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "”Butikerna fyller på under natten – kolla kl. 3.”", answer: t.n > 0 ? <>{share(hourShare(t.byHour, 0, 6))} av påfyllningarna kom mellan midnatt och kl. 6 lokal tid, mot {share(w.share)} {between(w.from, w.to)}.</> : "Inget loggat ännu att testa det mot." },
        { claim: "”Apple fyller bara på en viss veckodag.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>{cap(WD[t.peakWeekday])} leder hittills ({n(t.byWeekday[t.peakWeekday])} av {n(t.n)}), men påfyllningar kom på {t.days} av {tracked} dagar.</> : <>Påfyllningar kom på {t.days} av {tracked} bevakade dagar{t.days === tracked ? ", inte en enda dag utan" : ""}; vi anger en mest aktiv veckodag efter {WEEKDAY_MIN_SPAN} dagars data.</>) : "Inget loggat ännu att testa det mot." },
        { claim: "”Ring butiken och fråga när lastbilen kommer.”", answer: "Det finns inget publicerat schema för påfyllningar; lagret för hämtning släpps online, och butiken ser det i samma ögonblick som alla andra." },
        { claim: "”Står det inte tillgänglig är den slut för gott.”", answer: recent.restocks > 0 ? <>{confirmedN(recent.restocks)} i {storesN(recent.stores)} de senaste 24 timmarna visar motsatsen, och var och en gick tillbaka till ”inte tillgänglig” inom några minuter.</> : t.n > 0 ? <>{confirmedN(t.n)} sedan {dateLabel(t.since, false)} visar motsatsen, och var och en gick tillbaka till ”inte tillgänglig” inom några minuter.</> : "Inget loggat ännu att testa det mot." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Rykten fyller tomrummet när det <b className="text-ink">saknas data</b>; den här sidan är datan, och den är gratis att läsa</> },
      { text: <>En sak har Reddit rätt i: <b className="text-ink">förberedelserna inför kassan</b>, inloggad och med Apple Pay klart (<Link href="/iphone-duo-restock-checkout-guide">vår 20-sekundersversion, på engelska</Link>)</> },
    ],

    // ---- method
    methodLead: <b>En påfyllning är en konfiguration som dyker upp för hämtning i butik på apple.com i en butik som inte listade den, bekräftad av två kontroller som stämmer överens.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Butiker med bevakning: var <b className="text-ink">{SPEED.fastSec}:e sekund</b>; {x.one ? "Apple Store-butiken" : "varje Apple Store"} {inLand(x.c)}: var <b className="text-ink">{SPEED.checkSec}:e sekund</b></> },
      // OTHER_TRACKERS ("8 seconds to 15 minutes") in Swedish.
      { text: <>Andra bevakningstjänsters publicerade intervall: <b className="text-ink">från 8 sekunder till 15 minuter</b>; vi jämför bara det de själva publicerar</> },
      { text: <>Ett första ”tillgänglig” kontrolleras igen <b className="text-ink">ungefär en sekund senare</b> innan det räknas</> },
      { text: <>En försvunnen listning bekräftas vid <b className="text-ink">nästa varv</b></> },
      { text: <>En butiks första observation, en misslyckad förfrågan, en timeout: <b className="text-ink">aldrig</b> en påfyllning och aldrig ”slut i lager”</>, no: true },
      { text: <>Alla timmar och datum anges i varje butiks <b className="text-ink">lokala tid</b>; en ”våg” är samma halvtimme över tidszonerna</> },
      { text: <>Rapporter från andra bevakningstjänster{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} får egna märkta rader och <b className="text-ink">hålls utanför varje summa</b></> },
      { text: <>Tabellerna uppdateras ungefär var femte minut; <Link href={x.logHref}>påfyllningsloggen</Link> är live</>, step: true },
    ],
    quote: "Citera den här sidan: använd gärna vilken siffra som helst härifrån med en länk tillbaka. RestockWire är oberoende av Apple och läser samma tillgänglighet för hämtning som vem som helst kan se på apple.com, bara mycket oftare.",
    alertIn: (x: RestockTimesView) => <>Få notiser om iPhone Duo{x.one ? "" : ` ${inLand(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Fler frågor om iPhone Duo",
    sameData: "Byggt på samma logg",
    questions: {
      sellOut: "Hur länge räcker en påfyllning?",
      alerts: "Snabbaste sättet att få veta",
      howToGet: "Att få tag på en i praktiken",
      whichConfig: "Konfigurationen som fylls på oftast",
      nearMe: "Lager live nära mig",
      unavailable: "”Inte tillgänglig”, förklarat",
    },
    otherCountries: ((us: boolean) => (us ? "Den här sidan för andra länder" : "Fler länder")) as unknown as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Vanliga frågor",
  },
};
