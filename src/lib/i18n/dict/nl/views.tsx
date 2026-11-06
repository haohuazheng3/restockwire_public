/**
 * Dutch strings: views — the product × place pages, the restock log, the live map, the iPhone Duo restock-times
 * answer page and the store index, as the Dutch versions (/nl-nl, /nl-be) print them. Same keys, arguments and
 * markup as English; `c: Country` is English data, named here in Dutch (places.countryLabel), and English place
 * or colour names inside product names are put into Dutch.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storesOf, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, hourLabel as hourLabelIn, localStamp as localStampIn } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { num, pct as pctIn, price, stamp, list, fitTitleW, hour, unit, secs, weekdays, distance } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";

const L = "nl" as const;
const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);
const n$ = (v: number) => num(L, v);
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
const land = (cc: CountryCode) => countryLabel(cc, L);
/** "in Nederland", "in de Verenigde Staten". */
const inC = (c: Country | CountryCode) => { const cc = typeof c === "string" ? c : c.cc; return `in ${ARTICLE[cc] ?? ""}${land(cc)}`; };
const NOUN: Record<string, [string, string]> = {
  state: ["staat", "staten"], province: ["provincie", "provincies"], area: ["gebied", "gebieden"], department: ["departement", "departementen"],
  prefecture: ["prefectuur", "prefecturen"], emirate: ["emiraat", "emiraten"], canton: ["kanton", "kantons"], region: ["gewest", "gewesten"],
  county: ["provincie", "provincies"], city: ["stad", "steden"],
};
/** The country's word for its regions, in Dutch. */
const noun = (c: Country, many = false) => (NOUN[c.regionNoun ?? "area"] ?? NOUN.area)[many ? 1 : 0];
/** Apple's colour names in a product name ("iPhone Duo 512GB Night Sky" → "… Nachthemel"). */
const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
const tc = (s: string) => COLORS.reduce((a, col) => a.replace(new RegExp(`\\b${col}\\b`), colorLabel(col, L)), s);
const pname = (p: Product) => tc(p.name);
const pshort = (p: Product) => tc(p.short);
/** "2 dagen", "1 u 5 min", "minder dan een minuut". */
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
const fitT = (v: string[], max = 60) => fitTitleW(v, max);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const appleOf = (s: Store) => appleStoreLabel(s, L);
/** A place of the product tree, named in Dutch. */
function placeNl(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cc === "us" ? "de VS" : land(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleOf(place.store!);
}
const atPlace = (place: Place) => (place.level === "store" ? `bij ${placeNl(place)}` : `in ${placeNl(place)}`);
/** "€ 2.339" in the country's currency. */
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
/** "inclusief 21% btw", Canada and the US: "exclusief belasting", Hong Kong: "zonder btw". */
function taxNoteOf(c: Country): string {
  if (!c.pricesIncludeTax) return "exclusief belasting";
  const m = c.taxNote.match(/\((\d+(?:\.\d+)?)%\)/);
  if (!m) return "zonder btw";
  const word = /^VAT/.test(c.taxNote) ? "btw" : /^GST/.test(c.taxNote) ? "GST" : /^consumption/.test(c.taxNote) ? "consumptiebelasting" : "btw";
  return `inclusief ${pctIn(L, Number(m[1]))} ${word}`;
}

/* ---------------------------------------------------------------- restock-times helpers */

type RT = Dict["views"]["restockTimes"];
const rtN = (x: number) => n$(x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : pctIn(L, Math.round(x * 100)));
/** "di 3 nov" from a calendar day. */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("nl-NL", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, true);
const localStamp = (iso: string, store: Parameters<typeof localStampIn>[1]) => localStampIn(iso, store, L);
const hourLabel = (h: number) => hourLabelIn(h, L);
/** "9:00–11:00" (tables, labels). */
const rangeLabel = (from: number, to: number) => `${hour(L, from)}–${hour(L, to % 24)}`;
/** "tussen 9:00 en 11:00" (sentences). */
const between = (from: number, to: number) => `tussen ${hour(L, from)} en ${hour(L, to % 24)}`;
/** One Apple Store in the country (Belgium). */
const oneIn = (c: Country | CountryCode) => storesOf(typeof c === "string" ? c : c.cc).length === 1;
const WEEKDAYS_NL = weekdays(L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "staat" : noun(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "staten" : noun(x.c, true));

/* ---------------------------------------------------------------- product copy (lib/seo/productCopy in Dutch) */

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = pname(product);
  const short = pshort(product);
  const verb = inStock === 1 ? "heeft" : "hebben";
  if (place.level === "country" && ccOf(place) !== "us") {
    const w = inC(ccOf(place));
    return fitT([...(inStock > 0 ? [`${cnt(inStock, "Apple Store", "Apple Stores")} ${w} ${verb} de ${name} nu`] : []), `${name} ${w}: ophaalvoorraad, live`, `${short} ${w}: ophaalvoorraad`, `${short}: ophaalvoorraad`]);
  }
  if (place.level === "country") return fitT([...(inStock > 0 ? [`${name}: nu op te halen in ${cnt(inStock, "Apple Store", "Apple Stores")}`] : []), `${name}: ophaalvoorraad in elke Apple Store in de VS`, `${name}: ophaalvoorraad, live`, `${short}: ophaalvoorraad`]);
  if (place.level === "store") {
    const apple = appleOf(place.store!);
    return fitT([`${name} bij ${apple}: ${inStock > 0 ? "nu op te halen" : "voorraad en aanvullingen"}`, `${short} bij ${apple}: ${inStock > 0 ? "nu op voorraad" : "voorraad"}`, `${short} bij ${apple}`, `${short} · ${apple.replace(/^Apple /, "")}`]);
  }
  const w = placeNl(place);
  return fitT([`${name} in ${w}: ${n$(inStock)} van ${cnt(n, "winkel", "winkels")} ${verb} hem nu`, `${name} in ${w}: ophaalvoorraad, live`, `${short} in ${w}: nu op voorraad?`, `${short} in ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = pname(product);
  const week = `${cnt(stats.week, "aanvulling", "aanvullingen")} deze week`;
  if (place.level === "store") {
    const s = place.store!;
    return fitT([
      `${name} bij ${appleOf(s)}, ${cityLabel(ccOf(place), s.city, L)}: ${inStock > 0 ? "op te halen bij de laatste check" : "nu niet op te halen"}, ${week}. Wanneer deze winkel aanvult, hoe lang het duurt, en een alert voor de volgende keer.`,
      `${name} bij ${appleOf(s)}: ${inStock > 0 ? "nu op voorraad" : "nu niet op voorraad"}, ${week}. Aanvultijden en alerts.`,
    ], 155);
  }
  if (place.stores.length === 1) {
    // One store for the whole place (Belgium): name it instead of "1 of 1 Apple Stores".
    const s = place.stores[0];
    return fitT([
      `${name} bij ${appleOf(s)}: ${inStock > 0 ? "op te halen bij de laatste check" : "nu niet op te halen"}, ${week}. Wanneer de winkel aanvult, hoe lang het duurt, en een alert voor de volgende keer.`,
      `${name} bij ${appleOf(s)}: ${inStock > 0 ? "nu op voorraad" : "nu niet op voorraad"}, ${week}.`,
    ], 155);
  }
  const where = place.level === "country" ? (ccOf(place) === "us" ? "Apple Stores in de VS" : `Apple Stores ${inC(ccOf(place))}`) : `Apple Stores in ${placeNl(place)}`;
  const verb = inStock === 1 ? "heeft" : "hebben";
  return fitT([
    `${n$(inStock)} van de ${n$(place.stores.length)} ${where} ${verb} de ${name} op dit moment om op te halen, ${week}. Per winkel, met aanvultijden en een telefoonalert voor de volgende keer.`,
    `${name}: ${n$(inStock)} van de ${n$(place.stores.length)} ${where} ${verb} hem nu, ${week}. Live per winkel, aanvultijden, alerts.`,
  ], 155);
}

/** Three or four short questions from the data; every answer is one sentence. */
function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = pname(product);
  const at = atPlace(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const nearestBit = nearest ? `; de dichtstbijzijnde winkel die hem heeft is ${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} in ${nearest.city}, op ${distance(L, ccOf(place), nearest.distance)}` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Is de ${name} nu op voorraad ${at}?`,
      a: l && l.available.length > 0
        ? `Ja${product.parts.length > 1 ? `: ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (k) => `nog ${n$(k)}`)}` : ""}, op te halen bij de laatste check.`
        : `Niet bij de laatste check${nearestBit}.`,
    });
  } else if (place.stores.length === 1) {
    const s = place.stores[0];
    out.push({
      q: `Heeft ${appleOf(s)} de ${name} op dit moment?`,
      a: inStock.length > 0 ? "Ja, op te halen bij de laatste check." : `Niet bij de laatste check${nearestBit}.`,
    });
  } else {
    out.push({
      q: `Welke Apple Stores ${at} hebben de ${name} op dit moment?`,
      a: inStock.length === 0
        ? `Geen bij de laatste check${nearestBit}.`
        : `${cnt(inStock.length, "winkel", "winkels")} bij de laatste check: ${list(L, inStock.map((l) => appleOf(l.store)), 4, (k) => `nog ${n$(k)}`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `Hoe vaak komt de ${name} terug ${at}?`,
    a: stats.month === 0 ? `Geen bevestigde aanvulling ${at} in de afgelopen ${n$(stats.days)} dagen.` : `${cnt(stats.month, "bevestigde aanvulling", "bevestigde aanvullingen")} in de afgelopen ${n$(stats.days)} dagen, ${n$(stats.week)} daarvan deze week${peak ? `, vooral rond ${peak.hour} lokale tijd` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Hoe lang duurt een aanvulling van de ${name} ${at}?`, a: `Zo'n ${dur(stats.medianMs)} (mediaan) voordat hij weer uitverkocht is.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => money(cc, v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inC(c),
    liveMap: "Live kaart",
    restockLog: "Voorraadlogboek",
    alertMe: "Alerts aanzetten",
    lastDays: (days: number) => <>{n$(days)} dagen, dag voor dag</>,
    since: "2 november 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `de Apple Store ${inC(c)}` : `alle ${n$(n)} Apple Stores ${inC(c)}`),
    checker: (c: Country) => `iPhone-voorraadchecker ${land(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Stores ${inC(c)}`,
    storesWithIt: "winkels die hem hebben",
    more: "Meer zien",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `bij ${name}` : `in ${name}`),
    h1Country: (model: string, c: Country) => `${tc(model)}: ophaalvoorraad ${inC(c)}`,
    h1Place: (model: string, where: string) => `${tc(model)} ${where}`,
    inStockNow: "Nu beschikbaar",
    yes: "Ja",
    no: "Nee",
    pickup: "ophalen",
    configurations: "configuraties",
    ofStores: (n: number) => `van ${cnt(n, "winkel", "winkels")}`,
    restocks24h: "Aanvullingen, 24 u",
    restocksHint: (week: number, month: number, days: number) => `${n$(week)} in 7 d · ${n$(month)} in ${n$(days)} d`,
    sellOuts: (days: number) => `Uitverkocht, ${n$(days)} d`,
    stays: (ms: number) => `blijft ~${dur(ms)}`,
    noPairs: "nog geen uitverkoop gemeten",
    lastRestock: "Nieuwste aanvulling",
    noneYet: "nog geen",
    thisConfig: "deze configuratie",
    inDays: (days: number) => `in ${n$(days)} dagen`,
    notInStockNow: "Op dit moment niet beschikbaar",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{n$(n)}</b> van {n$(of)} configuraties beschikbaar</span>,
    inStockAt: (n: number, of: number) => <span>Beschikbaar in <b className="text-ink">{n$(n)}</b> van {n$(of)} {of === 1 ? "winkel" : "winkels"}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>Gelezen {live} · {price}{tax}</>,
    taxNote: (c: Country) => taxNoteOf(c),
    beforeTax: "exclusief belasting",
    buyOnApple: "Bestellen op apple.com",
    allStoresIn: (c: Country) => `Elke winkel ${inC(c)}`,
    everyIphoneHere: "Alle iPhones op deze plek",
    everyIphone: (where: string) => `Alle iPhones ${where}`,
    panel: (model: string, where: string | null) => `${tc(model)}${where ? ` ${where}` : ""}: kies de configuraties, dan de winkels`,
    unitConfigs: "configuraties",
    unitStores: "winkels",
    otherConfigsHere: "Meer configuraties op deze plek",
    byStorageColor: "Opslag en kleur",
    nearestStores: "Dichtstbijzijnde winkels",
    closest: (link: ReactNode, dist: string) => <>Dichtstbijzijnde winkel die hem heeft: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Laatst beschikbaar",
    storesWithItNow: "Winkels die hem nu hebben",
    storesIn: (where: string) => `Winkels ${where}`,
    colStatus: "status",
    colConfigs: "configs beschikbaar",
    noStoreHasIt: "Op dit moment heeft geen enkele winkel hem.",
    noStoreHereHasIt: "Op dit moment heeft geen winkel in dit gebied hem.",
    moreStores: (n: number) => <>Nog {n$(n)} winkels, hieronder per regio.</>,
    byRegion: (c: Country) => `Per ${noun(c)}`,
    byCity: "Per stad",
    nearbyStores: "Winkels dichtbij",
    latestChanges: "Nieuwste wijzigingen",
    nothingLogged: "Het logboek is nog leeg.",
    whenRestocks: "Wanneer er meestal wordt aangevuld",
    howFast: "Hoe lang een aanvulling duurt",
    restocksByConfig: "Welke configuraties terugkomen",
    faqTitleCountry: (model: string, c: Country) => `${tc(model)} ${inC(c)}: vragen`,
    faqTitle: (model: string, where: string) => `${tc(model)} ${where}`,
    buySource: (model: string, c: Country) => `Apple: bestelpagina ${tc(model)} (${land(c.cc)})`,
    nearby: "Dichtbij",
    otherRegions: (c: Country) => `Andere ${noun(c, true)}`,
    elsewhereIn: (region: string) => `Verder weg in ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Stores ${inC(c)}, volledige lijst`,
    across: (model: string, c: Country) => `${tc(model)} in ${c.cc === "us" ? "de hele VS" : `heel ${land(c.cc)}`}`,
    itemList: (model: string, where: string) => `${tc(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Op dit moment heeft ${n === 1 ? `de Apple Store ${inC(c)} de ${tc(model)} niet` : `geen enkele Apple Store ${inC(c)} de ${tc(model)}`} om op te halen, dus "bij mij in de buurt" komt neer op welke winkel dichtbij als eerste aanvult. Met een alert op elke winkel die je kunt bereiken, staat de push seconden nadat er een hem aanbiedt op je telefoon.`
        : `${cnt(inStock, "winkel", "winkels")} van de ${n$(n)} ${inStock === 1 ? "heeft" : "hebben"} de ${tc(model)} op dit moment: ${list(L, have.slice(0, 5).map((l) => `${l.store} in ${l.city} (${cnt(l.configs, "configuratie", "configuraties")})`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c)), "Winkels die hem nu hebben"],
    nearCaption: (c: Country, model: string) => `Ophaalvoorraad ${tc(model)} per ${noun(c)}, laatste check`,
    nearMe: (c: Country, model: string, alert: string) => `Tik op In de buurt in de alert-instellingen op deze pagina en elke winkel wordt gerangschikt vanaf waar je staat, op geschatte afstand over de weg in ${c.unit === "mi" ? "mijlen" : "kilometers"}, elk met een link voor de route. [Stel een ${tc(model)}-alert in](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Wat kost de ${tc(model)} ${inC(c)}?`, a: `${money(c.cc, low)} tot ${money(c.cc, high)} op apple.com (${taxNoteOf(c)}), afhankelijk van de opslag.` },
      reserve: { q: `Kun je de ${tc(model)} reserveren om op te halen ${inC(c)}?`, a: `Niet vooraf: zodra een winkel je configuratie aanbiedt, bestel je hem op apple.com met ophalen in de winkel, en Apple houdt hem apart voor jouw tijdvak.${inStock === 0 ? " Op dit moment biedt geen winkel hem aan, dus met een alert ben je er als eerste bij." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, n: number) => `iPhone-aanvullingen ${inC(c)}, live: ${n === 1 ? "de Apple Store" : `${n$(n)} Apple Stores`}`,
    metaDescription: (c: Country, n: number) => `Elke bevestigde aanvulling van de iPhone Duo, 18 Pro en Pro Max om op te halen ${n === 1 ? "in de Apple Store" : "in de Apple Stores"} ${inC(c)}: tijd, exacte configuratie, kaart.`,
    h1: (c: Country) => `iPhone-aanvullingen ${inC(c)}, live gelogd`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{cnt(day, "aanvulling", "aanvullingen")} in de afgelopen 24 uur · {n$(week)} in 7 dagen{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Tijden staan in je eigen tijdzone.</>,
    allModels: "Alle modellen",
    restocks: "Aanvullingen",
    withSoldOut: "Aanvullingen en uitverkocht",
    regionLabel: (c: Country) => cap(noun(c)),
    allRegions: (c: Country) => `Alle ${noun(c, true)}`,
    filter: "Toepassen",
    page: (k: number) => <>pagina {n$(k)}</>,
    newer: "← Nieuwer",
    older: "Ouder →",
    getAlerts: "Alerts instellen",
    byPlace: "Aanvullingen, plaats voor plaats",
    byRegion: (c: Country) => `Per ${noun(c)}`,
    datasetName: (c: Country) => `iPhone-aanvullingen om op te halen in ${oneIn(c) ? "de Apple Store" : "Apple Stores"} ${inC(c)}`,
    datasetDescription: (c: Country) => `Bevestigde aanvullingen en uitverkochte momenten van de iPhone Duo, iPhone 18 Pro en iPhone 18 Pro Max om op te halen in ${c.cc === "us" ? "alle 269 Apple Stores in de VS" : oneIn(c) ? `de Apple Store ${inC(c)}` : `de Apple Stores ${inC(c)}`}: winkel, exacte configuratie, tijd. Winkels worden elke 15 seconden gelezen (elke 5 seconden waar een alert staat), en een aanvulling komt pas in het logboek als apple.com twee keer hetzelfde antwoord geeft.`,
    datasetMeasured: ["Apple Store", "iPhone-model, opslag en kleur", "tijd van aanvulling", "tijd van uitverkoop"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, n: number) => `Live iPhone Duo-voorraadkaart: ${n === 1 ? "de Apple Store" : "elke Apple Store"} ${inC(c)}`,
    metaDescription: (c: Country, n: number) => `Waar de iPhone Duo, 18 Pro en Pro Max nu op te halen zijn: ${n === 1 ? "de Apple Store" : `alle ${n$(n)} Apple Stores`} ${inC(c)} op één live kaart, per opslag en kleur.`,
    // regionNoun stays the English key: the map looks its Dutch word up in cdict map.nouns.
    country: (c: Country) => ({ name: land(c.cc), inName: inC(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Alle winkels",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` per ${noun(c)} en stad` : cities > 1 ? " per stad" : "";
      if (n === 1) return `${appleOf(storesOf(c.cc)[0])}, de enige Apple Store ${inC(c)}: iPhone Duo nu ${duo ? "beschikbaar" : "niet beschikbaar"}, Pro Max ${max ? "wel" : "niet"}. Live ophaalvoorraad, ook van de 18 Pro.`;
      return `Nu ${duo === 1 ? "heeft" : "hebben"} ${n$(duo)} de iPhone Duo en ${n$(max)} de Pro Max: live ophaalvoorraad in alle ${n$(n)} Apple Stores ${inC(c)}${by}, ook van de 18 Pro.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${n$(n)}, ${spread}${top.length ? `; ${top[0].name} staat bovenaan met ${n$(top[0].count)}${top[1] ? `, voor ${top[1].name} (${n$(top[1].count)})` : ""}` : ""}.`,
    howMany: (c: Country) => <>Hoeveel Apple Stores zijn er {inC(c)}?</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => n === 1 ? ({
      q: `Heeft de Apple Store ${inC(c)} de iPhone Duo op dit moment?`,
      a: have.length === 0 ? "Niet bij de laatste check; deze pagina en de kaart passen zich aan zodra de winkel hem aanbiedt, en een alert bereikt je nog eerder." : `Ja, bij de laatste check: ${appleOf(have[0])}.`,
    }) : ({
      q: `Welke Apple Stores ${inC(c)} hebben de iPhone Duo op dit moment?`,
      a: have.length === 0 ? `Geen van de ${n$(n)} bij de laatste check; deze pagina en de kaart passen zich aan zodra er een hem aanbiedt, en een alert bereikt je nog eerder.` : `${n$(have.length)} van de ${n$(n)} bij de laatste check: ${have.slice(0, 6).map(appleOf).join(", ")}${have.length > 6 ? " en meer" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `Een alert op de winkels waar je kunt komen is de snelste weg naar een exemplaar: [stel een iPhone Duo-alert in](${alert}). Eén alert dekt één winkel × één exacte configuratie, en je telefoon hoort het seconden nadat die winkel hem aanbiedt.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => n === 1
      ? `Nu op te halen: iPhone Duo **${now.duo ? "ja" : "nee"}**, iPhone 18 Pro Max **${now.max ? "ja" : "nee"}**, 18 Pro **${now.pro ? "ja" : "nee"}**. Er is **1 Apple Store** ${inC(c)}: ${appleOf(storesOf(c.cc)[0])}, ${spread}. ${tax}`
      : `Op dit moment ${now.duo === 1 ? "heeft" : "hebben"} **${n$(now.duo)}** een iPhone Duo om op te halen, **${n$(now.max)}** de iPhone 18 Pro Max en **${n$(now.pro)}** de 18 Pro, van de **${cnt(n, "Apple Store", "Apple Stores")}** ${inC(c)}, ${spread}. ${tax}${c.cc === "nl" ? "\n\nRotterdam en Utrecht hebben geen Apple Store: vanuit Rotterdam is Apple Den Haag het dichtstbij, vanuit Utrecht Apple Amsterdam." : ""}`,
    crumb: "Apple Stores",
    panel: (c: Country) => `Kies je iPhones en vink dan de winkels ${inC(c)} aan die je kunt bereiken`,
    matrixLabel: "Voorraad per winkel",
    matrixH2: (c: Country) => <>Voorraad winkel voor winkel {inC(c)}</>,
    matrixHint: "Nu beschikbaar / gevolgd, per model.",
    topCaption: (c: Country) => <>{cap(noun(c, true))} gerangschikt op aantal Apple Stores (uit Apples winkellijst, zoals hier gevolgd)</>,
    regionHead: (c: Country) => cap(noun(c)),
    colStores: "Apple Stores",
    colCities: "Steden",
    locationsBy: (c: Country) => `Waar de Apple Stores staan, ${noun(c)} voor ${noun(c)}`,
    locationsIn: (c: Country) => `Elke Apple Store-locatie ${inC(c)}`,
    storeCount: (n: number) => <>{cnt(n, "winkel", "winkels")}</>,
    storeCountAll: (n: number) => <>{n$(n)} winkels</>,
    whenRestock: (c: Country) => <>Hoe laat vullen winkels {inC(c)} aan?</>,
    howFast: (c: Country) => <>Hoe lang duurt een aanvulling {inC(c)}?</>,
    faqTitle: (c: Country) => `Apple Stores ${inC(c)}: vragen`,
    getApp: "Installeer de app",
    howItWorks: "Zo werkt het",
    pricing: "Prijzen",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: localStamp,
      hour: hourLabel,
      range: rangeLabel,
      weekday: (d: number) => WEEKDAYS_NL[d],
      store: (s: Store) => appleOf(s),
      storeWithPlace: (s: Store) => `${appleOf(s)} (${cityLabel(s.country ?? "us", s.city, L)})`,
    },
    title: (c: Country) => `Hoe laat vult Apple de iPhone Duo aan ${inC(c)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "staat" : c.regionNoun ? noun(c) : "winkel";
      const since = dateLabel(t.since, false);
      const inStores = oneIn(c) ? `in de Apple Store ${inC(c)}` : `in Apple Stores ${inC(c)}`;
      return t.n > 0 && pattern
        ? fitT([
          `${rtN(t.n)} aanvullingen van de iPhone Duo ${inStores} sinds ${since}: ${rtPct(w.share)} ${between(w.from, w.to)} lokale tijd${t.sellout ? `, ${rtPct(t.sellout.within2min)} binnen 2 minuten weg` : ""}. Tabellen per uur, dag, ${region}, winkel en configuratie.`,
          `${rtN(t.n)} aanvullingen van de iPhone Duo ${inStores} sinds ${since}: ${rtPct(w.share)} ${between(w.from, w.to)} lokale tijd. Tabellen per uur, dag, ${region} en configuratie.`,
          `Aanvultijden iPhone Duo ${inC(c)}: ${rtN(t.n)} aanvullingen sinds ${since}, per uur, dag, ${region} en configuratie.`,
        ], 158)
        : t.n > 0
          ? fitT([
            `${rtN(t.n)} bevestigde aanvullingen van de iPhone Duo ${inStores} sinds ${since}, uit checks elke ${SPEED.checkSec} seconden: per lokaal uur, dag voor dag, per ${region}, winkel en configuratie, en hoe lang elke duurde.`,
            `Aanvultijden iPhone Duo ${inC(c)}: ${rtN(t.n)} bevestigde aanvullingen sinds ${since}, per uur, dag, ${region} en configuratie.`,
          ], 158)
          : `Aanvultijden van de iPhone Duo ${inStores}, uur voor uur, dag voor dag, per winkel en configuratie: RestockWire leest elke winkel elke ${SPEED.checkSec} seconden sinds ${longDate(t.since)}.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `Hoe laat vult Apple de iPhone Duo aan ${inC(x.c)}?`
      : x.t.n > 0
        ? `Hoe laat vult Apple de iPhone Duo aan ${inC(x.c)}? ${x.pattern ? `Meestal ${between(x.w.from, x.w.to)} lokale tijd` : "Onze eigen checks, uur voor uur"}`
        : `Vult Apple de iPhone Duo aan ${inC(x.c)}? Tot nu toe niet, en dit is wat we volgen`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inC(x.c);
      const inStores = one ? "in de Apple Store" : "in Apple Stores";
      return t.unknown ? (
        <>Het voorraadlogboek is even niet beschikbaar. De winkels {where} worden nog steeds elke {SPEED.checkSec} seconden gelezen, en bij de volgende keer laden zijn de cijfers terug.</>
      ) : t.n > 0 && pattern ? (
        // The sentence an answer engine lifts whole: share, sample size, since-date, window, local time (docs/research.md §8).
        <>
          <b className="text-ink">{rtPct(w.share)} van de {rtN(t.n)} aanvullingen van de iPhone Duo</b> die RestockWire sinds {longDate(t.since)} {inStores} {where} bevestigde, kwam <b className="text-ink">{between(w.from, w.to)}</b>, lokale tijd van de winkel{x.sell ? <>; een gemiddelde was na zo&apos;n {Math.round(x.sell.medianSec / 5) * 5} seconden weg</> : null}. <b className="text-ink">Er komen nog steeds aanvullingen</b>{tracked > 1 ? <>: {rtN(t.days)} van de {rtN(tracked)} gevolgde dagen hadden er een</> : <> (pas één gevolgde dag)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Ja.</b> <b className="text-ink">{cnt(t.n, "aanvulling", "aanvullingen")} van de iPhone Duo sinds {longDate(t.since)}</b> {inStores} {where}{tracked > 1 ? <>, op {rtN(t.days)} van de {rtN(tracked)} dagen</> : <> (pas één gevolgde dag)</>}; een gebruikelijk uur noemen we zodra er {PATTERN_MIN} aanvullingen op {PATTERN_MIN_DAYS} verschillende dagen zijn.
        </>
      ) : (
        <>
          <b className="text-ink">Tot nu toe niet.</b> RestockWire leest {one ? "de Apple Store" : `alle ${rtN(x.stores)} Apple Stores`} {where} sinds {longDate(t.since)} elke {SPEED.checkSec} seconden, en heeft nog geen enkele aanvulling van de iPhone Duo om op te halen bevestigd.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `aanvullingen bevestigd sinds ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `viel ${between(x.w.from, x.w.to)}, lokale tijd van de winkel`,
      days: "dagen met een aanvulling",
      now: ((one: boolean): string => (one ? "winkel heeft er nu een om op te halen" : "winkels hebben er nu een om op te halen")) as RT["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `tot nu toe vandaag (${dateLabel(today.date)})${x.one ? "" : `, in ${cnt(today.stores, "winkel", "winkels")}`}`,
      weekday: "drukste weekdag tot nu toe",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Nieuwste: <b className="text-ink">{latest.config}</b>{x.one ? null : <> bij <Link href={storePath(latest.store)} className="underline underline-offset-2">{appleOf(latest.store)}</Link></>}, {localStamp(latest.at, latest.store)} lokale tijd</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>De meeste op <b className="text-ink">{WEEKDAYS_NL[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Er is <b className="text-ink">geen officieel aanvulschema</b>; dit zijn onze eigen bevestigde checks, ongeveer elke vijf minuten ververst</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: x.one ? <>De winkel heeft er nu <b className="text-ink">{x.duoNow ? "een" : "geen"}</b> om op te halen</> : <><b className="text-ink">{rtN(x.duoNow)} van de {rtN(x.stores)}</b> {x.duoNow === 1 ? "heeft" : "hebben"} er nu een om op te halen</> },
      { text: <>De eerste bevestigde aanvulling opent elke tabel hieronder</>, step: true },
      { text: <>Voor uur- en weekdagpatronen uit de grootste steekproef: <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">de pagina voor de VS</Link></>, step: true },
    ],
    setUpAlert: "iPhone Duo-alerts aanzetten",
    logLive: "Voorraadlogboek, live",
    onThisPage: "Onderdelen",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Uur",
      "day-by-day": "Dagen",
      where: `Per ${rtRegion(x)}`,
      configuration: "Configuraties",
      "how-long": "Uitverkoopsnelheid",
      unavailable: "“Niet beschikbaar”",
      reddit: "Reddit-claims",
      method: "Methode",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Op welk uur komt de iPhone Duo terug ${inC(x.c)}?`,
      "day-by-day": `Op welke dagen werd de iPhone Duo aangevuld ${inC(x.c)}?`,
      where: `Waar wordt de iPhone Duo ${inC(x.c)} het vaakst aangevuld?`,
      configuration: `Welke opslag en kleur van de iPhone Duo komen het vaakst terug ${inC(x.c)}?`,
      "how-long": `Hoeveel seconden duurt een aanvulling van de iPhone Duo ${inC(x.c)}?`,
      unavailable: "Waarom toont apple.com bij elke winkel “momenteel niet beschikbaar”?",
      reddit: "Reddits theorieën over iPhone Duo-aanvullingen, naast het logboek gelegd",
      method: "Wat telt RestockWire als aanvulling?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inC(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `Wanneer vult Apple de iPhone Duo aan ${where}?`, a: t.n > 0 && pattern
          ? `${cap(window)}, lokale tijd van de winkel, viel ${rtPct(w.share)} van de ${rtN(t.n)} bevestigde aanvullingen sinds ${longDate(t.since)}, en tussen 8:00 en 12:00 ${rtPct(hourShare(t.byHour, 8, 12))}. Er is geen officieel schema; dit is het patroon dat RestockWire ziet, ongeveer elke vijf minuten ververst.`
          : `RestockWire heeft ${where} ${cnt(t.n, "bevestigde aanvulling", "bevestigde aanvullingen")} gelogd sinds ${longDate(t.since)}${t.days ? `, op ${cnt(t.days, "dag", "dagen")}` : ""}, en Apple maakt geen schema bekend. Zodra er ${PATTERN_MIN} aanvullingen op ${PATTERN_MIN_DAYS} verschillende dagen zijn, noemt deze pagina vanzelf een gebruikelijk uur.` },
        { q: `Wordt de iPhone Duo ook in het weekend aangevuld${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja" : "Tot nu toe niet"}: ${cnt(weekend, "aanvulling", "aanvullingen")} van de ${rtN(t.n)} (${rtPct(weekend / t.n)}) ${weekend === 1 ? "viel" : "vielen"} op een zaterdag of zondag. ${t.peakWeekday != null ? `De drukste weekdag tot nu toe is ${WEEKDAYS_NL[t.peakWeekday]}.` : `Een drukste weekdag noemen we pas als de data ${WEEKDAY_MIN_SPAN} dagen beslaat; tot nu toe zijn dat er ${rtN(tracked)}.`}`
          : `Er is nog geen weekenddata ${where}; de dagtabel op deze pagina groeit met elke bevestigde aanvulling.` },
        { q: "Wanneer moet ik apple.com in de gaten houden?", a: t.n > 0 && pattern
          ? `Met de hand: zet apple.com open met ophalen geselecteerd vanaf ${hourLabel(w.from)} lokale tijd; dat venster van twee uur bevat ${rtPct(w.share)} van de aanvullingen. Een gemiddelde aanvulling ${sell ? `was bij de mediaan binnen ${sell.medianSec} seconden weg` : "duurt ongeveer een minuut"}, en daarom wint een alert die elke ${SPEED.fastSec} seconden leest ([zo werken alerts](/iphone-duo-restock-alerts)) van elke hoeveelheid verversen.`
          : `Zolang het patroon ${where} nog vorm krijgt, kan een alert voor je kijken: je gekozen winkels worden dag en nacht elke ${SPEED.fastSec} seconden gelezen ([zo werken alerts](/iphone-duo-restock-alerts)).` },
        { q: "Waarom is de iPhone Duo in elke Apple Store “niet beschikbaar”?", a: sell
          ? `Aanvullingen zijn kort: van de ${rtN(sell.n)} gemeten uitverkochte aanvullingen ${where} was ${rtPct(sell.within2min)} binnen 2 minuten weg en ${rtPct(sell.within20min)} binnen 20. Op dit moment ${x.duoNow === 1 ? "heeft" : "hebben"} ${rtN(x.duoNow)} van de ${rtN(x.stores)} winkels er een, dus meestal zegt apple.com terecht “niet beschikbaar”, ook op dagen met tientallen aanvullingen ([wat “niet beschikbaar” betekent](/apple-store-pickup-explained)).`
          : `Ophaalvoorraad verschijnt telkens maar een paar minuten; op dit moment ${x.duoNow === 1 ? "heeft" : "hebben"} ${rtN(x.duoNow)} van de ${cnt(x.stores, "winkel", "winkels")} ${where} er een ([wat “niet beschikbaar” betekent](/apple-store-pickup-explained)).` },
        { q: "Kan ik een melding krijgen als mijn Apple Store de iPhone Duo weer heeft?", a: `Ja: met een alert op die winkel voor je exacte opslag en kleur wordt hij elke ${SPEED.fastSec} seconden gelezen, en je telefoon hoort het zo'n ${SPEED.alertSec} seconden nadat een aanvulling is bevestigd ([alert instellen](${x.alert}); [zo werkt het](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: hulp bij levering en ophalen (hoe beschikbaarheid voor ophalen werkt)",
      newsroom: "Apple Newsroom: iPhone Duo verschijnt in Apple Store-locaties wereldwijd (23 oktober 2026)",
      macRumors: "MacRumors: ophalen in de Apple Store voor de iPhone Duo weer actief in de VS en Canada (24 oktober 2026)",
      reports: (tracker: string) => `${tracker}: meldingen van iPhone Duo-aanvullingen uit de lanceringsweek (hun eigen waarnemingen, apart gehouden en nooit meegeteld)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Aanvultijden van de iPhone Duo om op te halen, Apple Stores ${inC(x.c)}`,
      description: `Bevestigde aanvullingen van de iPhone Duo om op te halen in Apple Stores ${inC(x.c)} sinds ${x.t.since} (winkel, configuratie, tijd), uit RestockWire dat elke winkel elke ${SPEED.checkSec} seconden leest; gegroepeerd per lokaal uur, dag, ${rtRegion(x)}, winkel en configuratie.`,
      spatial: `Apple Stores ${inC(x.c)}`,
      measured: ["tijd van aanvulling (lokale tijd van de winkel)", "Apple Store", "opslag en kleur van de iPhone Duo", "seconden tot uitverkocht"],
      size: `${cnt(x.t.n, "aanvulling", "aanvullingen")} in ${cnt(x.t.stores, "winkel", "winkels")}`,
    }),
    crumb: "Aanvuluren iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{cap(between(x.w.from, x.w.to))}, lokale tijd van de winkel, bevat {rtPct(x.w.share)} van de {rtN(x.t.n)} aanvullingen; tussen 8:00 en 12:00 is dat {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `${cnt(count, "aanvulling", "aanvullingen")} in het drukste uur`,
    morning: "tussen 8:00 en 12:00",
    evening: "na 17:00, dus de avond telt ook mee",
    night: "tussen middernacht en 6:00",
    tooFew: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Te" : "Nog te"} weinig dagen om een uur te noemen: {cnt(x.t.n, "bevestigde aanvulling", "bevestigde aanvullingen")} op {cnt(x.t.days, "dag", "dagen")} sinds {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Een gebruikelijk uur noemen vraagt <b className="text-ink">{PATTERN_MIN} aanvullingen op {PATTERN_MIN_DAYS} verschillende dagen</b></> },
      { text: <>Eén golf van tien aanvullingen is één gebeurtenis, geen gewoonte</>, no: true },
      { text: <>Elke nieuwe dag aan data werkt deze pagina vanzelf bij</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${cnt(x.t.n, "aanvulling", "aanvullingen")} van de iPhone Duo ${inC(x.c)} per lokaal uur van de winkel, ${dateLabel(x.t.since, false)} tot vandaag`,
    hourHead: ["Lokaal uur", "Aanvullingen", "Aandeel"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>De ochtendpiek heeft <b className="text-ink">niets met de openingstijd te maken</b>{x.us ? " (de meeste Apple Stores in de VS gaan om 10:00 open)" : ""}</> },
      { text: <>Apple geeft ophaalvoorraad <b className="text-ink">online</b> vrij, nog voor de deuren opengaan</> },
      { text: <>Kijk je zelf? Neem <b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b> op doordeweekse ochtenden</>, step: true },
      { text: <>Een <Link href={x.alert}>alert</Link> dekt de <b className="text-ink">overige 22 uur</b>, als niemand anders kijkt</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Elke winkelpagina toont de eigen uren in de eigen tijdzone (<Link href={x.storesHref}>{x.us ? "Apple Stores per staat" : `winkels ${inC(x.c)}`}</Link>), zodat je de winkel ziet die om 8:00 aanvult terwijl de regio om 9:00 piekt</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{cnt(t.n, "bevestigde aanvulling", "bevestigde aanvullingen")}{one ? "" : ` in ${cnt(t.stores, "winkel", "winkels")}`} op de enige gevolgde dag tot nu toe, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Alle ${rtN(t.days)} gevolgde dagen brachten` : `${rtN(t.days)} van de ${rtN(tracked)} dagen sinds ${longDate(t.since)} ${t.days === 1 ? "bracht" : "brachten"}`} minstens één bevestigde aanvulling{t.peakWeekday != null ? `; ${WEEKDAYS_NL[t.peakWeekday]} gaat voorop onder de weekdagen` : ""}.</b>
      ) : (
        <b>Nul bevestigde aanvullingen {inC(x.c)} sinds {longDate(t.since)}.</b>
      );
    },
    daysTracked: "gevolgde dagen met een aanvulling",
    busiestDay: (x: RestockTimesView, day: DayRow) => `op de grootste dag, ${dateLabel(day.date)}${x.one ? "" : `, in ${cnt(day.stores, "winkel", "winkels")}`}`,
    busiestDayNone: "grootste dag",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `winkels aangevuld binnen één halfuur, ${zoneStamp(drop.at, x.c)} (${cnt(drop.restocks, "configuratie", "configuraties")}): een landelijke vrijgave`,
    weekend: (x: RestockTimesView) => `viel in een weekend (${cnt(x.weekend, "aanvulling", "aanvullingen")})`,
    dayCaption: (x: RestockTimesView) => `Aanvullingen van de iPhone Duo per dag ${inC(x.c)}${x.t.reports.length ? "; rijen met “gemeld” komen uit gepubliceerde waarnemingen van andere trackers van voor onze eigen metingen, alleen opgenomen voor de tijdlijn" : ""}`,
    dayHead: { date: "Datum", restocks: "Aanvullingen", stores: "Winkels", busiest: "Drukste uur", source: "Bron" },
    soFar: " · tot nu toe",
    reportedBy: (names: string[]) => <>volgens {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: lanceringsdag, eerste toestellen verzonden naar online bestellingen</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: ophalen in de winkel kwam terug{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Rijen met <b className="text-ink">gemeld</b> zijn waarnemingen uit de lanceringsweek van {x.reportNames.join(" en ")}, buiten elke telling gehouden</> }
        : { text: <>Het logboek van RestockWire voor elke winkel {inC(x.c)} begint op <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Een drukste weekdag vraagt <b className="text-ink">{WEEKDAY_MIN_SPAN} dagen</b> aan data (we hebben er {rtN(x.tracked)})</>, no: true }] : []),
      { text: <>Let op de kolom <b className="text-ink">winkels</b>: aanvullingen verspreid over meer winkels geven je betere kansen</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {cnt(hit[0].restocks, "aanvulling", "aanvullingen")} in {rtN(hit[0].stores)} van de {cnt(hit[0].storesTotal, "winkel", "winkels")} daar sinds {dateLabel(x.t.since, false)}{hit[1] ? <>, gevolgd door {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> en {hit[2].name} ({rtN(hit[2].restocks)})</> : null}; {rtN(hit.length)} van de {rtN(total)} {rtRegions(x)} {hit.length === 1 ? "heeft" : "hebben"} een aanvulling gezien{total - hit.length > 0 ? `, ${rtN(total - hit.length)} nog geen` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Nog geen {rtRegion(x)} {inC(x.c)} met een bevestigde aanvulling; de eerste opent de tabel.</b>,
    regionCaption: (x: RestockTimesView) => `Bevestigde aanvullingen van de iPhone Duo per ${rtRegion(x)} ${inC(x.c)}, ${dateLabel(x.t.since, false)} tot vandaag`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Aanvullingen", "Winkels aangevuld", "Laatste aanvulling (lokale tijd)"],
    ofN: (a: number, b: number) => <>{rtN(a)} van {rtN(b)}</>,
    storesCaption: (x: RestockTimesView) => `Winkels met de meeste aanvullingen van de iPhone Duo ${inC(x.c)}, ${dateLabel(x.t.since, false)} tot vandaag`,
    storesHead: ["Winkel", "Aanvullingen", "Dagen", "Gebruikelijk uur", "Laatste (lokale tijd)"],
    swaps: (x: RestockTimesView) => [
      { no: "Achter de bovenste winkel van de lijst aan, hoe ver ook", yes: `Twee of drie winkels die je ${x.pattern ? `rond ${hourLabel(x.w.from)}` : "'s ochtends"} binnen een uur kunt bereiken`, why: "Aan een aanvulling buiten bereik heb je niets, en zelfs de drukste winkel staat op een paar minuten per dag na op niet beschikbaar." },
      { no: "Alles op één winkel zetten", yes: "Een alert op elk, en dan naar de winkel waar er een afgaat", why: "Gebruik de teltabel alleen om te kiezen naar welke van je winkels je eerst gaat." },
    ],
    nearMe: "Duo-voorraad bij jou in de buurt, live",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} gaat voorop met {rtN(top.restocks)} van de {rtN(x.t.n)} aanvullingen ({rtPct(top.restocks / x.t.n)}){rarest ? `; de ${rarest.label} sluit de rij met ${cnt(rarest.restocks, "aanvulling", "aanvullingen")}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} komt vaker terug dan elke andere configuratie`,
    versus: (a: string, bCount: number, b: string) => `aanvullingen ${a}, tegen ${rtN(bCount)} voor ${b}`,
    restocksOf: (a: string) => `aanvullingen ${a}`,
    byStorage: "per opslag",
    byColour: "per kleur",
    configNone: (x: RestockTimesView) => <b>Nog geen configuratie {inC(x.c)} met een bevestigde aanvulling; alle acht staan er al, zodat de eerste aanvulling meteen een rij heeft.</b>,
    configCaption: (x: RestockTimesView) => `Bevestigde aanvullingen van de iPhone Duo per configuratie ${inC(x.c)}, ${dateLabel(x.t.since, false)} tot vandaag`,
    configHead: ["Configuratie", "Aanvullingen", "Aandeel", "Laatste aanvulling (lokale tijd)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>De configuratie kiezen telt <b className="text-ink">zwaarder dan de winkel kiezen</b></> },
      x.storageRatio != null
        ? { text: <>Neem genoegen met de opslag die het vaakst terugkomt en je kansen zijn zo&apos;n <b className="text-ink">{num(L, x.storageRatio)}×</b> die van de volgende maat</> }
        : { text: <>Neem genoegen met de opslag die het vaakst terugkomt en je kansen stijgen <b className="text-ink">flink</b></> },
      { text: <>De <b className="text-ink">2TB</b> bestel je beter voor bezorging, en dan wachten</>, no: true },
      { text: <>Prijzen en live voorraad: <Link href="/iphone-duo-most-restocked-stores">Welke iPhone Duo wordt het vaakst aangevuld?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{sell.medianSec} seconden: de mediane levensduur van de {rtN(sell.n)} uitverkochte aanvullingen {inC(x.c)}; {rtPct(sell.within2min)} was binnen 2 minuten weg en {rtPct(sell.within20min)} binnen 20.</b>,
    secUnit: "s",
    medianListing: "mediaan, van beschikbaar tot weg",
    within2: "weg binnen 2 minuten",
    within20: "weg binnen 20 minuten",
    fastest: "snelste uitverkoop gemeten",
    howLongNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Te" : "Nog te"} weinig uitverkochte aanvullingen {inC(x.c)} om te meten; deze cijfers beginnen bij tien, en de pagina voor de VS heeft de volledige set.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Twee minuten is een venster voor een <b className="text-ink">alert</b>, niet voor verversen op apple.com</> },
      { text: <>Elk ander getal op deze pagina volgt uit dit getal</> },
      { text: <>Elke aanvulling en hoeveel seconden die duurde, per configuratie en {rtRegion(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">Hoe snel is een iPhone Duo-aanvulling uitverkocht?</Link></>, step: true },
    ],
    measured: "Elk getal loopt van de check die de configuratie voor het eerst beschikbaar zag tot de check die hem weg zag. Het is dus een bovengrens: de echte levensduur is korter.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Een aanvulling is een flits, geen toestand: {x.one ? "één winkel" : `${rtN(x.stores)} winkels`} × {rtN(x.configs)} configuraties geeft {rtN(x.pairs)} mogelijke combinaties {inC(x.c)}, en op dit moment {x.duoNow === 1 ? "heeft 1 winkel" : `hebben ${rtN(x.duoNow)} winkels`} überhaupt een iPhone Duo.</b>,
    pairs: "mogelijke combinaties van winkel × configuratie",
    listingNow: "met nu een iPhone Duo om op te halen",
    goneIn2: "van de aanvullingen binnen twee minuten voorbij",
    last24: "bevestigde aanvullingen, afgelopen 24 uur",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Afgelopen 24 uur: <b className="text-ink">{cnt(x.recent.restocks, "bevestigde aanvulling", "bevestigde aanvullingen")}</b> in {cnt(x.recent.stores, "winkel", "winkels")} {inC(x.c)}</> }
        : today > 0
          ? { text: <>Vandaag: <b className="text-ink">{cnt(today, "bevestigde aanvulling", "bevestigde aanvullingen")}</b> {inC(x.c)}</> }
          : { text: <>De dagtabel hierboven toont de aanvullingen die wel plaatsvonden</> },
      { text: <>Elke aanvulling stond <b className="text-ink">een minuut of twee</b> op apple.com</> },
      { text: <>“Overal niet beschikbaar” op dag vier of dag veertien betekent <b className="text-ink">niet</b> dat Apple gestopt is</>, no: true },
    ],
    unavailableLinks: { explained: "“Momenteel niet beschikbaar voor ophalen”, uitgelegd", howToGet: "Een iPhone Duo krijgen, stap voor stap" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Veel advies op <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> en <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> is eerlijk, gebaseerd op één winkel en de volgende dag al achterhaald; hieronder de vier claims die het vaakst terugkomen, getoetst aan {rtN(x.t.n)} bevestigde aanvullingen {inC(x.c)}.</b>,
    redditCaption: "Veelgehoorde Reddit-claims over iPhone Duo-aanvullingen, getoetst aan de bevestigde aanvullingen van RestockWire",
    redditHead: ["Claim", "Wat het logboek laat zien"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "“Winkels vullen 's nachts aan — kijk om 3 uur 's nachts.”", answer: t.n > 0 ? <>{rtPct(hourShare(t.byHour, 0, 6))} van de aanvullingen kwam tussen middernacht en 6:00 lokale tijd, tegen {rtPct(w.share)} {between(w.from, w.to)}.</> : "Nog niets gelogd om het mee te toetsen." },
        { claim: "“Apple vult maar op één weekdag aan.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>{cap(WEEKDAYS_NL[t.peakWeekday])} gaat tot nu toe voorop ({rtN(t.byWeekday[t.peakWeekday])} van {rtN(t.n)}), maar er kwamen aanvullingen op {rtN(t.days)} van de {rtN(tracked)} dagen.</> : <>Er kwamen aanvullingen op {rtN(t.days)} van de {rtN(tracked)} gevolgde dagen{t.days === tracked ? ", geen enkele dag zonder" : ""}; een drukste weekdag noemen we na {WEEKDAY_MIN_SPAN} dagen aan data.</>) : "Nog niets gelogd om het mee te toetsen." },
        { claim: "“Bel de winkel en vraag wanneer de vrachtwagen komt.”", answer: "Er is geen gepubliceerd aanvulschema; ophaalvoorraad wordt online vrijgegeven, en de winkel ziet die op hetzelfde moment als iedereen." },
        { claim: "“Staat er niet beschikbaar, dan is hij voorgoed uitverkocht.”", answer: recent.restocks > 0 ? <>{cnt(recent.restocks, "bevestigde aanvulling", "bevestigde aanvullingen")} in {cnt(recent.stores, "winkel", "winkels")} in de afgelopen 24 uur {recent.restocks === 1 ? "bewijst" : "bewijzen"} het tegendeel, en elke aanvulling stond binnen minuten weer op “niet beschikbaar”.</> : t.n > 0 ? <>{cnt(t.n, "bevestigde aanvulling", "bevestigde aanvullingen")} sinds {dateLabel(t.since, false)} {t.n === 1 ? "bewijst" : "bewijzen"} het tegendeel, en elke aanvulling stond binnen minuten weer op “niet beschikbaar”.</> : "Nog niets gelogd om het mee te toetsen." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Geruchten vullen het gat als er <b className="text-ink">geen data</b> is; deze pagina is de data, en lezen is gratis</> },
      { text: <>Op één punt heeft Reddit gelijk: de <b className="text-ink">voorbereiding van het afrekenen</b>, ingelogd en met Apple Pay ingesteld (<Link href="/iphone-duo-restock-checkout-guide">onze versie van 20 seconden</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Een aanvulling is een configuratie die op apple.com beschikbaar komt om op te halen in een winkel die hem niet aanbood, bevestigd door twee checks met hetzelfde antwoord.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Winkels met een alert: elke <b className="text-ink">{SPEED.fastSec} seconden</b>; {x.one ? "de Apple Store" : "elke Apple Store"} {inC(x.c)}: elke <b className="text-ink">{SPEED.checkSec} seconden</b></> },
      // OTHER_TRACKERS ("8 seconds to 15 minutes") in Dutch.
      { text: <>Gepubliceerde intervallen van andere trackers: <b className="text-ink">8 seconden tot 15 minuten</b>; we vergelijken alleen wat zij publiceren</> },
      { text: <>Een eerste “beschikbaar” wordt <b className="text-ink">ongeveer een seconde later</b> opnieuw gecheckt voordat het telt</> },
      { text: <>Een verdwenen aanbod wordt in de <b className="text-ink">volgende ronde</b> bevestigd</> },
      { text: <>De eerste waarneming van een winkel, een mislukte aanvraag, een time-out: <b className="text-ink">nooit</b> een aanvulling en nooit “niet op voorraad”</>, no: true },
      { text: <>Alle uren en datums staan in de <b className="text-ink">lokale tijd</b> van elke winkel; een “golf” is hetzelfde halfuur over tijdzones heen</> },
      { text: <>Meldingen van andere trackers{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} krijgen eigen, gemarkeerde rijen en blijven <b className="text-ink">buiten elk totaal</b></> },
      { text: <>Deze tabellen worden ongeveer elke vijf minuten ververst; <Link href={x.logHref}>het voorraadlogboek</Link> is live</>, step: true },
    ],
    quote: "Citeer deze pagina: neem elk getal over met een link terug. RestockWire is onafhankelijk van Apple en leest dezelfde beschikbaarheid voor ophalen die iedereen op apple.com ziet, alleen veel vaker.",
    alertIn: (x: RestockTimesView) => <>iPhone Duo-alerts aanzetten{x.one ? "" : ` ${inC(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Meer vragen over de iPhone Duo",
    sameData: "Gebouwd op hetzelfde logboek",
    questions: {
      sellOut: "Hoe lang duurt een aanvulling?",
      alerts: "Snelste manier om van een aanvulling te horen",
      howToGet: "Er in de praktijk een krijgen",
      whichConfig: "De configuratie die het vaakst terugkomt",
      nearMe: "Live voorraad bij mij in de buurt",
      unavailable: "“Niet beschikbaar”, uitgelegd",
    },
    otherCountries: ((us: boolean): string => (us ? "Deze pagina voor andere landen" : "Meer landen")) as RT["otherCountries"],
    faqTitle: "Veelgestelde vragen",
  },
};
