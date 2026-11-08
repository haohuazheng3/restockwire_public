/**
 * German strings: views — the product × place pages, the restock log, the live map, the iPhone Duo
 * restock-times answer page and the store index. `c: Country` is English data: named here in German
 * (util.land / inLand); place names passed as strings are already German. Formal register (Sie).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { distance, list, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import { LANG, cap, dativ, fitDe, ganzIn, inLand, inOrt, land, modelDe, money, n, pct, plural, regionWord, span, taxNote, uhr, zwischen } from "./util";

const apple = (s: Store) => appleStoreLabel(s, LANG);
const words = (items: string[], max = 6) => list(LANG, items, max, (k) => `${n(k)} weitere`);
const hat = (k: number) => (k === 1 ? "hat" : "haben");
/** "listet" / "listen": the verb agreeing with a count of stores. */
const listet = (k: number) => (k === 1 ? "listet" : "listen");
const restocks = (k: number) => plural(k, "Restock", "Restocks");
const confirmed = (k: number) => plural(k, "bestätigter Restock", "bestätigte Restocks");
const storesN = (k: number) => plural(k, "Store", "Stores");
const dayN = (k: number) => (k === 1 ? "einem Tag" : `${n(k)} Tagen`);
const wd = (d: number) => weekdays(LANG)[d];
/** Weekday as an adverb (montags). */
const wdAdv = (d: number) => `${wd(d).toLowerCase()}s`;

/* ---------------------------------------------------------------- restock-times helpers */

const rtN = (x: number) => n(x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pct(Math.round(x * 100)));
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("de-DE", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(LANG, iso, c.timeZone, true);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "Bundesstaat" : regionWord(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "Bundesstaaten" : regionWord(x.c, true));
const where = (c: Country) => inLand(c.cc);
/** "im Apple Store" / "in den Apple Stores". */
const inStores = (one: boolean) => (one ? "im Apple Store" : "in den Apple Stores");

/* ---------------------------------------------------------------- product × place helpers */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** "iPhone Duo 512GB Nachthimmel" / "Duo 512GB Nachthimmel": the product in German. */
const prodName = (p: Product) => [modelByKey(p.model)!.name, p.storage, p.color ? colorLabel(p.color, LANG) : null].filter(Boolean).join(" ");
const prodShort = (p: Product) => [modelByKey(p.model)!.short, p.storage, p.color ? colorLabel(p.color, LANG) : null].filter(Boolean).join(" ");
/** The place in German: the country, region, city or "Apple …" store. */
function placeN(place: Place): string {
  const cc = ccOf(place);
  if (cc === "us") return place.level === "country" ? "USA" : place.name;
  if (place.level === "country") return land(cc);
  if (place.level === "state") return `${cc === "ch" ? "Kanton " : ""}${regionLabel(cc, place.state!, LANG)}`;
  if (place.level === "city") return cityLabel(cc, place.city!, LANG);
  return apple(place.store!);
}
/** "in München", "bei Apple Rosenstraße", "in Deutschland". */
const atPlace = (place: Place) => (place.level === "store" ? `bei ${placeN(place)}` : place.level === "country" ? inLand(ccOf(place)) : inOrt(placeN(place)));
const withApple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);
/** "mit 512GB" for a storage, "in Nachthimmel" for a colour. */
const mitIn = (s: string) => (/\d(GB|TB)$/.test(s) ? "mit" : "in");

function productTitle(product: Product, place: Place, inStock: number): string {
  const name = prodName(product), short = prodShort(product);
  const cc = ccOf(place);
  if (place.level === "country" && cc !== "us") {
    return fitDe([
      ...(inStock > 0 ? [`${plural(inStock, "Apple Store", "Apple Stores")} ${inLand(cc)} ${listet(inStock)} das ${name} jetzt`] : []),
      `${name} ${inLand(cc)}: Abholbestand, live`,
      `${short} ${inLand(cc)}: Abholbestand`,
      `${short}: Abholbestand`,
    ], 60, cc);
  }
  if (place.level === "country") {
    return fitDe([
      ...(inStock > 0 ? [`${name}: ${plural(inStock, "Apple Store", "Apple Stores")} ${listet(inStock)} es jetzt zur Abholung`] : []),
      `${name}: Abholbestand in jedem US-Apple-Store`,
      `${name}: Abholbestand, live`,
      `${short}: Abholbestand`,
    ], 60, cc);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitDe([
      `${name} bei ${apple(s)}: ${inStock > 0 ? "jetzt zur Abholung gelistet" : "Abholbestand und Restocks"}`,
      `${short} bei ${apple(s)}: ${inStock > 0 ? "jetzt vorrätig" : "Bestand"}`,
      `${short} bei ${apple(s)}`,
      `${short} bei ${storeLabel(s, LANG)}`,
      `${short} · ${storeLabel(s, LANG)}`,
    ], 60, cc);
  }
  const k = place.stores.length;
  const w = inOrt(placeN(place));
  return fitDe([`${name} ${w}: ${inStock} von ${n(k)} Stores ${listet(inStock)} es jetzt`, `${name} ${w}: Abholbestand, live`, `${short} ${w}: jetzt vorrätig?`, `${short} ${w}`], 60, cc);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prodName(product);
  const week = `${restocks(stats.week)} diese Woche`;
  const cc = ccOf(place);
  if (place.level === "store") {
    const s = place.store!;
    return fitDe([
      `${name} bei ${apple(s)}, ${cityLabel(cc, s.city, LANG)}: ${inStock > 0 ? "bei der letzten Abfrage zur Abholung gelistet" : "derzeit nicht zur Abholung gelistet"}, ${week}. Wann dieser Store auffüllt, wie lange es hält, und ein Alarm für den nächsten Restock.`,
      `${name} bei ${apple(s)}: ${inStock > 0 ? "jetzt vorrätig" : "derzeit nicht vorrätig"}, ${week}. Restock-Zeiten und Alarme.`,
    ], 155, cc);
  }
  const w = place.level === "country" ? `Apple Stores ${inLand(cc)}` : `Apple Stores ${inOrt(placeN(place))}`;
  const k = place.stores.length;
  return fitDe([
    `${inStock} von ${n(k)} ${w} ${listet(inStock)} das ${name} in dieser Minute zur Abholung, ${week}. Store für Store, mit Restock-Zeiten und Handy-Alarm für den nächsten.`,
    `${name}: ${inStock} von ${n(k)} ${w} ${hat(inStock)} es jetzt, ${week}. Bestand je Store, dazu Restock-Zeiten und Alarm.`,
  ], 155, cc);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = prodName(product);
  const at = atPlace(place);
  const cc = ccOf(place);
  const dist = (miles: number) => distance(LANG, cc, miles);
  const inStock = lines.filter((l) => l.available.length > 0);
  const nearestBit = nearest ? `; der nächste Store, der es listet, ist ${withApple(nearest.name)} in ${nearest.city}, ${dist(nearest.distance)} entfernt` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `Ist das ${name} ${at} gerade vorrätig?`,
      a: l && l.available.length > 0
        ? `Ja, die letzte Abfrage zeigt es zur Abholung${product.parts.length > 1 ? `: ${words(l.available.map((i) => `${i.storage} ${colorLabel(i.color, LANG)}`), 4)}` : ""}.`
        : `Bei der letzten Abfrage nicht${nearestBit}.`,
    });
  } else {
    out.push({
      q: `Welche Apple Stores ${at} listen das ${name} gerade?`,
      a: inStock.length === 0
        ? `Keiner bei der letzten Abfrage${nearestBit}.`
        : `${storesN(inStock.length)} bei der letzten Abfrage: ${words(inStock.map((l) => apple(l.store)), 4)}.`,
    });
  }
  const peak = peakOf(clock, LANG);
  out.push({
    q: `Wie häufig gibt es ${at} Nachschub beim ${name}?`,
    a: stats.month === 0 ? `In ${stats.days} Tagen kein einziger bestätigter Restock ${at}.` : `${stats.days}-Tage-Bilanz: ${confirmed(stats.month)}, in dieser Woche ${n(stats.week)}${peak ? `; Häufung gegen ${peak.hour} Ortszeit` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Wie lange hält ein Restock des ${name} ${at}?`, a: `Typisch (Median) sind etwa ${fmtDuration(stats.medianMs, LANG)} – dann ist es wieder weg.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => money(COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? `in ${x.place.name}` : where(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "Stadt" : "Store") : rtRegion(x));
const rtUs = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "Städte" : "Stores") : rtRegions(x));
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inLand(c.cc),
    liveMap: "Live-Karte",
    restockLog: "Restock-Protokoll",
    alertMe: "Alarme einrichten",
    lastDays: (days: number) => <>{days} Tage, Tag für Tag</>,
    since: "2. November 2026",
    sourcesWhere: (k: number, c: Country) => `${k === 1 ? "der Apple Store" : `alle ${n(k)} Apple Stores`} ${where(c)}`,
    checker: (c: Country) => `iPhone-Bestandscheck ${where(c)}`,
    appleStoresIn: (c: Country) => `Apple Stores ${where(c)}`,
    storesWithIt: "Stores, die es listen",
    more: "Mehr ansehen",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `bei ${name}` : inOrt(name)),
    h1Country: (model: string, c: Country) => `${modelDe(model)}: Abholbestand im Store ${where(c)}`,
    h1Place: (model: string, w: string) => `${modelDe(model)} ${w}`,
    // The four stat tiles.
    inStockNow: "Jetzt gelistet",
    yes: "Ja",
    no: "Nein",
    pickup: "Abholung",
    configurations: "Konfigurationen",
    ofStores: (k: number) => `von ${storesN(k)}`,
    restocks24h: "Restocks, 24 Std.",
    restocksHint: (week: number, month: number, days: number) => `${n(week)} in 7 Tg. · ${n(month)} in ${days} Tg.`,
    sellOuts: (days: number) => `Ausverkäufe, ${days} Tg.`,
    stays: (ms: number) => `hält ~${fmtDuration(ms, LANG)}`,
    noPairs: "noch kein Ausverkauf zugeordnet",
    lastRestock: "Neuester Restock",
    noneYet: "bisher keiner",
    thisConfig: "diese Konfiguration",
    inDays: (days: number) => `in ${days} Tagen`,
    // The status line under the H1.
    notInStockNow: "Derzeit nicht gelistet",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{n(k)}</b> von {n(of)} Konfigurationen gelistet</span>,
    inStockAt: (k: number, of: number) => <span>Gelistet in <b className="text-ink">{n(k)}</b> von {storesN(of)}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>Abgefragt {live} · {price}{tax}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "vor Steuern",
    buyOnApple: "Auf apple.com bestellen",
    allStoresIn: (c: Country) => `Jeder Store ${where(c)}`,
    everyIphoneHere: "Alle iPhones an diesem Ort",
    everyIphone: (w: string) => `Alle iPhones ${w}`,
    panel: (model: string, w: string | null) => `${modelDe(model)}${w ? ` ${w}` : ""}: erst die Konfigurationen wählen, dann die Stores`,
    unitConfigs: "Konfigurationen",
    unitStores: "Stores",
    otherConfigsHere: "Weitere Konfigurationen an diesem Ort",
    byStorageColor: "Speicher und Farbe",
    nearestStores: "Nächstgelegene Stores",
    closest: (link: ReactNode, dist: string) => <>Nächster Store, der es listet: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Zuletzt gelistet",
    storesWithItNow: "Stores, die es jetzt listen",
    storesIn: (w: string) => `Stores ${w}`,
    colStatus: "Status",
    colConfigs: "Konfig. gelistet",
    noStoreHasIt: "Derzeit listet es kein Store.",
    noStoreHereHasIt: "Derzeit listet es kein Store in dieser Gegend.",
    moreStores: (k: number) => <>{n(k)} weitere Stores, unten nach Region sortiert.</>,
    byRegion: (c: Country) => `Nach ${regionWord(c)}`,
    byCity: "Nach Stadt",
    nearbyStores: "Stores in der Nähe",
    latestChanges: "Neueste Änderungen",
    nothingLogged: "Das Protokoll ist bisher leer.",
    whenRestocks: "Übliche Restock-Zeiten",
    howFast: "Wie lange ein Restock hält",
    restocksByConfig: "Welche Konfigurationen zurückkommen",
    faqTitleCountry: (model: string, c: Country) => `${modelDe(model)} ${where(c)}: Fragen`,
    faqTitle: (model: string, w: string) => `${modelDe(model)} ${w}`,
    buySource: (model: string, c: Country) => `Apple: Bestellseite ${modelDe(model)} (${land(c.cc)})`,
    nearby: "Ganz in der Nähe",
    otherRegions: (c: Country) => `Andere ${regionWord(c, true)}`,
    elsewhereIn: (region: string) => `Weiter entfernt ${inOrt(region)}`,
    everyAppleStoreIn: (c: Country) => `Apple Stores ${where(c)}, vollständige Liste`,
    across: (model: string, c: Country) => `${modelDe(model)} ${ganzIn(c.cc)}`,
    itemList: (model: string, w: string) => `${modelDe(model)} ${w}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Derzeit listet kein Apple Store ${where(c)} das ${modelDe(model)} zur Abholung. „In meiner Nähe“ heißt also: Welcher Store in Reichweite füllt zuerst auf? Ein Alarm für jeden erreichbaren Store bringt den Push Sekunden nach der Listung auf Ihr Handy.`
        : `${n(inStock)} von ${storesN(k)} ${listet(inStock)} das ${modelDe(model)} in diesem Moment: ${words(have.slice(0, 5).map((l) => `${l.store} in ${l.city} (${plural(l.configs, "Konfiguration", "Konfigurationen")})`), 5)}.`,
    nearHead: (c: Country) => [cap(regionWord(c)), "Stores, die es jetzt listen"],
    nearCaption: (c: Country, model: string) => `${modelDe(model)}: Abholbestand je ${regionWord(c)}, letzte Abfrage`,
    nearMe: (c: Country, model: string, alert: string) => `Tippen Sie in der Alarm-Einrichtung auf dieser Seite auf „In der Nähe“: Jeder Store wird nach Ihrem Standort gereiht, nach geschätzter Straßenentfernung in ${c.unit === "mi" ? "Meilen" : "Kilometern"}, jeweils mit Link zur Route. [${modelDe(model)}-Alarm einrichten](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `Was kostet das ${modelDe(model)} ${where(c)}?`, a: `${money(c, low)} bis ${money(c, high)} auf apple.com (${taxNote(c)}), je nach Speicher.` },
      reserve: { q: `Lässt sich das ${modelDe(model)} ${where(c)} zur Abholung reservieren?`, a: `Nicht im Voraus: Sobald ein Store Ihre Konfiguration listet, bestellen Sie sie auf apple.com mit Abholung im Store, und Apple legt sie für Ihr Zeitfenster zurück.${inStock === 0 ? " Derzeit listet sie kein Store, also erfahren Sie es mit einem Alarm als Erstes." : ""}` },
    }),
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, k: number) => `iPhone-Restock-Protokoll ${where(c)}, live: ${k === 1 ? "der Apple Store" : `${n(k)} Apple Stores`}`,
    metaDescription: (c: Country, k: number) => `Jeder bestätigte Restock von iPhone Duo, 18 Pro und Pro Max zur Abholung ${inStores(k === 1)} ${where(c)}: Uhrzeit, genaue Konfiguration, Karte.`,
    h1: (c: Country) => `iPhone-Restocks ${where(c)}, in Echtzeit`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{restocks(day)} in den letzten 24 Stunden · {n(week)} in 7 Tagen{model ? ` · ${modelDe(model)}` : ""}{region ? ` · ${region}` : ""}. Alle Zeiten in Ihrer eigenen Zeitzone.</>,
    allModels: "Alle Modelle",
    restocks: "Restocks",
    withSoldOut: "Restocks und Ausverkäufe",
    regionLabel: (c: Country) => cap(regionWord(c)),
    allRegions: (c: Country) => `Alle ${regionWord(c, true)}`,
    filter: "Anwenden",
    page: (k: number) => <>Seite {k}</>,
    newer: "← Neuer",
    older: "Älter →",
    getAlerts: "Alarme einrichten",
    byPlace: "Restocks, Ort für Ort",
    byRegion: (c: Country) => `Nach ${regionWord(c)}`,
    datasetName: (c: Country) => `iPhone-Restocks zur Abholung in Apple Stores ${where(c)}`,
    datasetDescription: (c: Country) => `Bestätigte Restocks und Ausverkäufe von iPhone Duo, iPhone 18 Pro und iPhone 18 Pro Max zur Abholung ${c.cc === "us" ? "in allen 269 Apple Stores in den USA" : `in den Apple Stores ${where(c)}`}: Store, genaue Konfiguration, Uhrzeit. Die Stores werden alle 15 Sekunden gelesen (alle 5 Sekunden, wo ein Alarm gesetzt ist), und ein Restock kommt erst ins Protokoll, wenn apple.com zweimal dieselbe Antwort gibt.`,
    datasetMeasured: ["Apple Store", "Modell, Speicher, Farbe", "Zeitpunkt des Restocks", "Zeitpunkt des Ausverkaufs"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, k: number) => `Live-Karte zum iPhone-Duo-Bestand: ${k === 1 ? "der Apple Store" : "jeder Apple Store"} ${where(c)}`,
    metaDescription: (c: Country, k: number) => `Wo iPhone Duo, 18 Pro und Pro Max gerade zur Abholung gelistet sind: ${k === 1 ? "der Apple Store" : `alle ${n(k)} Apple Stores`} ${where(c)} auf einer Live-Karte, nach Speicher und Farbe.`,
    // The map looks up its region words by the English key (cdict map.nouns), so the keys stay English.
    country: (c: Country) => ({ name: land(c.cc), inName: where(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Alle Stores",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `, sortiert nach ${regionWord(c)} und Stadt` : cities > 1 ? ", sortiert nach Stadt" : "";
      return `${duo} ${listet(duo)} gerade das iPhone Duo, ${max} das Pro Max: Live-Abholbestand in allen ${n(k)} Apple Stores ${where(c)}${by}, 18 Pro inklusive.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `${n(k)}, ${spread}${top.length ? `; ${top[0].name} führt mit ${top[0].count}${top[1] ? `, vor ${top[1].name} (${top[1].count})` : ""}` : ""}.`,
    howMany: (c: Country) => <>Wie viele Apple Stores gibt es eigentlich {where(c)}?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `Welche Apple Stores ${where(c)} listen das iPhone Duo gerade?`,
      a: have.length === 0 ? `Keiner der ${n(k)} bei der letzten Abfrage; diese Seite und die Karte ändern sich, sobald einer es listet, und ein Alarm erreicht Sie vor beiden.` : `${have.length} von ${n(k)} bei der letzten Abfrage: ${words(have.map(apple), 6)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, LANG),
    duoBlock: (alert: string) => `Ein Alarm für die Stores in Ihrer Reichweite ist der schnellste Weg zu einem: [iPhone-Duo-Alarm einrichten](${alert}). Ein Alarm gilt für einen Store × eine genaue Konfiguration, und Ihr Handy erfährt es Sekunden, nachdem dieser Store sie listet.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `Live-Stand: iPhone Duo abholbereit in **${now.duo}**, iPhone 18 Pro Max in **${now.max}**, 18 Pro in **${now.pro}** – bei **${k === 1 ? "einem Apple Store" : `${n(k)} Apple Stores`}** ${where(c)}, ${spread}. ${tax}`,
    crumb: "Apple Stores",
    panel: (c: Country) => `Wählen Sie Ihre iPhones, dann die Stores ${where(c)} in Ihrer Reichweite`,
    matrixLabel: "Bestand je Store",
    matrixH2: (c: Country) => <>Bestand Store für Store {where(c)}</>,
    matrixHint: "Je Modell: aktuell gelistet / insgesamt erfasst.",
    topCaption: (c: Country) => <>{cap(regionWord(c, true))} nach Zahl der Apple Stores (aus Apples Store-Liste, wie hier erfasst)</>,
    regionHead: (c: Country) => cap(regionWord(c)),
    colStores: "Apple Stores",
    colCities: "Städte",
    locationsBy: (c: Country) => `Wo die Apple Stores sind, ${regionWord(c)} für ${regionWord(c)}`,
    locationsIn: (c: Country) => `Alle Apple-Store-Standorte ${where(c)}`,
    storeCount: (k: number) => <>{storesN(k)}</>,
    storeCountAll: (k: number) => <>{n(k)} Stores</>,
    whenRestock: (c: Country) => <>Um wie viel Uhr füllen die Stores {where(c)} auf?</>,
    howFast: (c: Country) => <>Wie lange hält ein Restock {where(c)}?</>,
    faqTitle: (c: Country) => `Apple Stores ${where(c)}: Fragen`,
    getApp: "App laden",
    howItWorks: "So funktioniert es",
    pricing: "Preise",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, LANG),
      hour: (h: number) => uhr(h),
      range: span,
      weekday: wd,
      store: apple,
      storeWithPlace: (s: Store) => `${apple(s)} (${cityLabel(s.country ?? "us", s.city, LANG)})`,
    },
    title: (c: Country, place?: RestockTimesPlace) => `Um wie viel Uhr füllt Apple das iPhone Duo ${place ? `in ${place.name}` : where(c)} auf?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "Stadt" : "Store") : c.cc === "us" ? "Bundesstaat" : c.regionNoun ? regionWord(c) : "Store";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitDe([
          `${rtPct(w.share)} aller iPhone-Duo-Restocks ${rtW(x)} fallen ${zwischen(w.from, w.to)} Ortszeit (${rtN(t.n)} seit ${since}${t.sellout ? `, ${rtPct(t.sellout.within2min)} in unter 2 Minuten weg` : ""}). Aufgeschlüsselt je Stunde, Tag, ${region}, Store, Konfiguration.`,
          `${rtPct(w.share)} aller iPhone-Duo-Restocks ${rtW(x)} fallen ${zwischen(w.from, w.to)} Ortszeit (${rtN(t.n)} seit ${since}). Aufgeschlüsselt je Stunde, Tag, ${region}, Konfiguration.`,
          `iPhone-Duo-Restock-Zeiten ${rtW(x)}: ${rtN(t.n)} Restocks seit ${since}, nach Stunde, Tag, ${region} und Konfiguration.`,
        ], 158, c.cc)
        : t.n > 0
          ? fitDe([
            `Seit ${since} hat RestockWire ${rtW(x)} ${rtN(t.n)} iPhone-Duo-Restocks bestätigt, abgefragt alle ${SPEED.checkSec} Sekunden. Hier je Ortszeit, Tag, ${region}, Store und Konfiguration, samt Haltedauer.`,
            `Rückkehr des iPhone Duo ${rtW(x)}: ${rtN(t.n)} Restocks seit ${since}, je Stunde, Tag, ${region} und Konfiguration.`,
          ], 158, c.cc)
          : `Rückkehr des iPhone Duo ${rtW(x)} – je Stunde, Tag, Store und Konfiguration. Seit dem ${longDate(t.since)} fragt RestockWire jeden Apple Store alle ${SPEED.checkSec} Sekunden ab.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `Um wie viel Uhr füllt Apple das iPhone Duo ${rtW(x)} auf?`
      : x.t.n > 0
        ? `Um wie viel Uhr füllt Apple das iPhone Duo ${rtW(x)} auf? ${x.pattern ? `Meist ${span(x.w.from, x.w.to)} Ortszeit` : "Unsere eigenen Abfragen, Stunde für Stunde"}`
        : `Füllt Apple das iPhone Duo ${rtW(x)} wieder auf? Bisher nicht, und das beobachten wir`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const wh = rtW(x);
      return t.unknown ? (
        <>Das Restock-Protokoll ist kurz nicht erreichbar. Die Stores {wh} bleiben im {SPEED.checkSec}-Sekunden-Takt, und beim nächsten Laden sind die Zahlen zurück.</>
      ) : t.n > 0 && pattern ? (
        // The sentence an answer engine lifts whole: share, sample size, since-date, window, local time (docs/research.md §8).
        <>
          <b className="text-ink">{rtPct(w.share)} der {rtN(t.n)} iPhone-Duo-Restocks</b>, die RestockWire seit dem {longDate(t.since)} {inStores(one)} {wh} bestätigt hat, kamen <b className="text-ink">{zwischen(w.from, w.to)}</b>, Ortszeit des Stores{x.sell ? <>; ein typischer war nach etwa {Math.round(x.sell.medianSec / 5) * 5} Sekunden weg</> : null}. <b className="text-ink">Es kommen weiter Restocks</b>{tracked > 1 ? <>: An {t.days} der {tracked} erfassten Tage gab es einen</> : <> (bisher ein erfasster Tag)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Ja.</b> <b className="text-ink">{rtN(t.n)} iPhone-Duo-Restocks seit dem {longDate(t.since)}</b> {inStores(one)} {wh}{tracked > 1 ? <>, an {t.days} der {tracked} Tage</> : <> (bisher ein erfasster Tag)</>}; eine übliche Uhrzeit nennen wir ab {PATTERN_MIN} Restocks an {PATTERN_MIN_DAYS} verschiedenen Tagen.
        </>
      ) : (
        <>
          <b className="text-ink">Bisher nicht.</b> RestockWire liest {one ? "den Apple Store" : `alle ${n(x.stores)} Apple Stores`} {wh} seit dem {longDate(t.since)} alle {SPEED.checkSec} Sekunden und hat noch keinen einzigen iPhone-Duo-Restock zur Abholung bestätigt.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `Restocks bestätigt, Zählung ab ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `fielen ${zwischen(x.w.from, x.w.to)}, Ortszeit des Stores`,
      days: "Tage mit Restock",
      now: (one: boolean): string => (one ? "Store listet gerade eins zur Abholung" : "Stores listen gerade eins zur Abholung"),
      today: (x: RestockTimesView, today: DayRow) => `bisher heute (${dateLabel(today.date)})${x.one ? "" : `, in ${storesN(today.stores)}`}`,
      weekday: "der bisher stärkste Wochentag",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Neuester: <b className="text-ink">{latest.config}</b>{x.one ? null : <> bei <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, LANG)} Ortszeit</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Die meisten kommen <b className="text-ink">{wdAdv(x.t.peakWeekday)}</b></> }] : []),
      { text: <>Es gibt <b className="text-ink">keinen offiziellen Restock-Plan</b>; diese Zahlen stammen aus unseren eigenen bestätigten Abfragen, etwa alle fünf Minuten aktualisiert</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{x.duoNow} von {x.stores}</b> {listet(x.duoNow)} in diesem Moment eins zur Abholung</> },
      { text: <>Der erste bestätigte Restock eröffnet jede Tabelle unten</>, step: true },
      { text: <>Muster nach Stunde und Wochentag aus der größten Stichprobe: <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">die US-Seite</Link></>, step: true },
    ],
    setUpAlert: "iPhone-Duo-Alarme einrichten",
    logLive: "Live-Restock-Protokoll",
    onThisPage: "Abschnitte",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Uhrzeit",
      "day-by-day": "Tage",
      where: `Je ${rtU(x)}`,
      configuration: "Konfigurationen",
      "how-long": "Ausverkauf",
      unavailable: "„Nicht verfügbar“",
      reddit: "Reddit-Thesen",
      method: "Methode",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `Zu welcher Uhrzeit kommt das iPhone Duo ${rtW(x)} zurück?`,
      "day-by-day": `An welchen Tagen gab es ${rtW(x)} iPhone-Duo-Restocks?`,
      where: `Wo ${rtW(x)} kommt das iPhone Duo am häufigsten zurück?`,
      configuration: `Welcher Speicher und welche Farbe des iPhone Duo kommen ${rtW(x)} am häufigsten zurück?`,
      "how-long": `Wie viele Sekunden hält ein iPhone-Duo-Restock ${rtW(x)}?`,
      unavailable: "Wieso steht auf apple.com überall „derzeit nicht verfügbar“?",
      reddit: "Reddits iPhone-Duo-Restock-Theorien, am Protokoll geprüft",
      method: "Was zählt bei RestockWire als Restock?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const wh = rtW(x);
      const window = zwischen(w.from, w.to);
      return [
        { q: `Wann füllt Apple das iPhone Duo ${wh} auf?`, a: t.n > 0 && pattern
          ? `Am häufigsten ${window} Store-Ortszeit: ${rtPct(w.share)} von ${rtN(t.n)} Restocks seit dem ${longDate(t.since)}; der Vormittag von 8 bis 12 Uhr bringt ${rtPct(hourShare(t.byHour, 8, 12))}. Apple veröffentlicht keinen Plan – das ist das gemessene Muster, neu berechnet etwa alle fünf Minuten.`
          : `RestockWire hat ${wh} seit dem ${longDate(t.since)} ${confirmed(t.n)} erfasst${t.days ? `, an ${dayN(t.days)}` : ""}, und Apple kündigt keinen Plan an. Ab ${PATTERN_MIN} Restocks an ${PATTERN_MIN_DAYS} verschiedenen Tagen nennt diese Seite von selbst eine übliche Uhrzeit.` },
        { q: `Gibt es iPhone-Duo-Restocks auch am Wochenende${us ? "" : ` ${wh}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Ja" : "Bisher nicht"}: ${restocks(weekend)} von ${rtN(t.n)} (${rtPct(weekend / t.n)}) fielen auf einen Samstag oder Sonntag. ${t.peakWeekday != null ? `Der bisher stärkste Wochentag ist der ${wd(t.peakWeekday)}.` : `Einen Spitzen-Wochentag gibt es ab ${WEEKDAY_MIN_SPAN} Tagen Datenbasis; aktuell sind es ${tracked}.`}`
          : `Für ${wh} gibt es bisher keine Wochenend-Daten; die Tagestabelle auf dieser Seite wächst mit jedem bestätigten Restock.` },
        { q: "Ab wann sollte ich apple.com beobachten?", a: t.n > 0 && pattern
          ? `Ab ${uhr(w.from)} Ortszeit, mit apple.com offen und Abholung vorgewählt: In diese zwei Stunden fallen ${rtPct(w.share)} aller Restocks. Weil ein Angebot ${sell ? `im Median nach ${sell.medianSec} Sekunden verschwindet` : "nur rund eine Minute hält"}, ist ein Alarm im ${SPEED.fastSec}-Sekunden-Takt schneller als jedes Neuladen ([so funktionieren Alarme](/iphone-duo-restock-alerts)).`
          : `Solange sich ${wh} noch kein Muster zeigt, kann ein Alarm für Sie aufpassen: Ihre gewählten Stores kommen in den ${SPEED.fastSec}-Sekunden-Takt, Tag und Nacht ([so funktionieren Alarme](/iphone-duo-restock-alerts)).` },
        { q: "Weshalb meldet jeder Apple Store das iPhone Duo als „nicht verfügbar“?", a: sell
          ? `Restocks sind kurz: Von den ${rtN(sell.n)} gemessenen ausverkauften Restocks ${wh} waren ${rtPct(sell.within2min)} binnen 2 Minuten weg und ${rtPct(sell.within20min)} binnen 20. In diesem Moment ${listet(x.duoNow)} ${x.duoNow} von ${x.stores} Stores eins, also zeigt apple.com meistens zu Recht „nicht verfügbar“, selbst an Tagen mit Dutzenden Restocks ([was „nicht verfügbar“ bedeutet](/apple-store-pickup-explained)).`
          : `Abholbestand taucht jeweils nur für Minuten auf; in diesem Moment ${listet(x.duoNow)} ${x.duoNow} von ${storesN(x.stores)} ${wh} eins ([was „nicht verfügbar“ bedeutet](/apple-store-pickup-explained)).` },
        { q: "Gibt es einen Alarm, sobald mein Apple Store das iPhone Duo wieder hat?", a: `Ja. Mit einem Alarm (Store plus exakter Speicher und Farbe) wird der Store im ${SPEED.fastSec}-Sekunden-Takt abgefragt; der Push folgt rund ${SPEED.alertSec} Sekunden auf die Bestätigung. [Alarm anlegen](${x.alert}) · [Ablauf erklärt](/how-restock-alerts-work)` },
      ];
    },
    sources: {
      applePickup: "Apple: Hilfe zu Lieferung und Abholung (wie die Abhol-Verfügbarkeit funktioniert)",
      newsroom: "Apple Newsroom, 23. Oktober 2026: Marktstart des iPhone Duo in den Apple Stores weltweit",
      macRumors: "MacRumors, 24. Oktober 2026: Abholung im Store für das iPhone Duo in USA und Kanada wieder freigeschaltet",
      reports: (tracker: string) => `${tracker}: iPhone-Duo-Restock-Meldungen aus der Launch-Woche (eigene Beobachtungen des Trackers, getrennt gezeigt und nie mitgezählt)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Abhol-Restocks des iPhone Duo ${rtW(x)}: Zeitpunkte`,
      description: `Jeder von RestockWire bestätigte iPhone-Duo-Restock zur Abholung ${rtW(x)} seit ${x.t.since}, mit Store, Konfiguration und Uhrzeit. Jeder Store wird alle ${SPEED.checkSec} Sekunden abgefragt; ausgewertet je Ortszeit, Tag, ${x.place?.kind === "city" ? "" : `${rtU(x)}, `}Store und Konfiguration.`,
      spatial: `Apple Stores ${rtW(x)}`,
      measured: ["Uhrzeit des Restocks (Store-Ortszeit)", "Apple Store", "Speicher und Farbe des iPhone Duo", "Sekunden bis ausverkauft"],
      size: `${restocks(x.t.n)} in ${storesN(x.t.stores)}`,
    }),
    crumb: "iPhone-Duo-Restock-Zeiten",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{span(x.w.from, x.w.to)}, Ortszeit des Stores: {rtPct(x.w.share)} der {rtN(x.t.n)} Restocks; 8–12 Uhr: {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (k: number) => `${restocks(k)} in der stärksten Einzelstunde`,
    morning: "von 8 bis 12 Uhr",
    evening: "nach 17 Uhr – auch abends tut sich etwas",
    night: "von Mitternacht bis 6 Uhr",
    tooFew: (x: RestockTimesView) => <b>Noch zu wenige Tage für eine Uhrzeit: {confirmed(x.t.n)} an {dayN(x.t.days)} seit dem {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Für eine übliche Uhrzeit braucht es <b className="text-ink">{PATTERN_MIN} Restocks an {PATTERN_MIN_DAYS} verschiedenen Tagen</b></> },
      { text: <>Ein Schwall von zehn Restocks ist ein Einzelfall, kein Muster</>, no: true },
      { text: <>Jeder neue Tag mit Daten aktualisiert diese Seite von selbst</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `Je Stunde (Store-Ortszeit): ${rtN(x.t.n)} iPhone-Duo-Restocks ${rtW(x)}, ${dateLabel(x.t.since, false)} bis heute`,
    hourHead: ["Ortszeit", "Restocks", "Anteil"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Die Morgenspitze hat <b className="text-ink">nichts mit der Öffnungszeit zu tun</b>{x.us ? " (die meisten US-Apple-Stores öffnen um 10 Uhr)" : ""}</> },
      { text: <>Abholbestand erscheint <b className="text-ink">online</b>, noch bevor der Store öffnet</> },
      { text: <>Von Hand beobachten? Dann <b className="text-ink">{span(x.w.from, x.w.to)}</b> an Werktagmorgen</>, step: true },
      { text: <>Ein <Link href={x.alert}>Alarm</Link> deckt die <b className="text-ink">übrigen 22 Stunden</b> ab, wenn sonst niemand hinsieht</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Jede Store-Seite zeigt ihre eigenen Uhrzeiten in ihrer eigenen Zeitzone (<Link href={x.storesHref}>{x.us ? "Apple Stores je Bundesstaat" : `Stores ${rtW(x)}`}</Link>) – so finden Sie den Store, der um 8 Uhr auffüllt, während seine Region um 9 Uhr ihre Spitze hat</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{confirmed(t.n)}{one ? "" : ` in ${storesN(t.stores)}`} am bisher einzigen erfassten Tag, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Alle ${t.days} erfassten Tage` : `${t.days} der ${tracked} Tage seit dem ${longDate(t.since)}`} brachten mindestens einen bestätigten Restock{t.peakWeekday != null ? `; unter den Wochentagen führt der ${wd(t.peakWeekday)}` : ""}.</b>
      ) : (
        <b>Null bestätigte Restocks {rtW(x)} seit dem {longDate(t.since)}.</b>
      );
    },
    daysTracked: "erfasste Tage mit Restock",
    busiestDay: (x: RestockTimesView, day: DayRow) => `am stärksten Tag, ${dateLabel(day.date)}${x.one ? "" : `, in ${storesN(day.stores)}`}`,
    busiestDayNone: "Spitzentag",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `Stores mit Restock innerhalb einer halben Stunde, ${zoneStamp(drop.at, x.c)} (${plural(drop.restocks, "Konfiguration", "Konfigurationen")}): eine landesweite Freigabe`,
    weekend: (x: RestockTimesView) => `fielen auf ein Wochenende (${restocks(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `iPhone-Duo-Restocks ${rtW(x)}, je Tag${x.t.reports.length ? "; mit „gemeldet“ markierte Zeilen stammen aus veröffentlichten Beobachtungen anderer Tracker vor Beginn unserer Erfassung und stehen nur für die Zeitleiste da" : ""}`,
    dayHead: { date: "Datum", restocks: "Restocks", stores: "Stores", busiest: "Stärkste Stunde", source: "Quelle" },
    soFar: " · bisher",
    reportedBy: (names: string[]) => <>laut {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: Launch-Tag, erste Geräte an Online-Bestellungen ausgeliefert</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: Abholung im Store wieder möglich{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Zeilen mit <b className="text-ink">gemeldet</b> sind Beobachtungen aus der Launch-Woche von {x.reportNames.join(" und ")}, in keiner Zählung enthalten</> }
        : { text: <>RestockWires Protokoll für jeden Store {rtW(x)} beginnt am <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Ein stärkster Wochentag braucht <b className="text-ink">{WEEKDAY_MIN_SPAN} Tage</b> Daten (wir haben {x.tracked})</>, no: true }] : []),
      { text: <>Achten Sie auf die Spalte <b className="text-ink">Stores</b>: Restocks über mehr Stores verteilt verbessern Ihre Chancen</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {restocks(hit[0].restocks)} in {hit[0].stores} von {storesN(hit[0].storesTotal)} seit {dateLabel(x.t.since, false)}{hit[1] ? <>, gefolgt von {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> und {hit[2].name} ({rtN(hit[2].restocks)})</> : null}; in {hit.length} von {total} {dativ(rtUs(x))} gab es schon einen Restock{total - hit.length > 0 ? `, in ${total - hit.length} noch keinen` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{cap(rtUs(x))} {rtW(x)}: bisher kein bestätigter Restock; der erste eröffnet die Tabelle.</b>,
    regionCaption: (x: RestockTimesView) => `Bestätigte iPhone-Duo-Restocks je ${rtU(x)} ${rtW(x)}, ${dateLabel(x.t.since, false)} bis heute`,
    regionHead: (x: RestockTimesView) => [cap(rtU(x)), "Restocks", "Stores mit Restock", "Neuester Restock (Ortszeit)"],
    ofN: (a: number, b: number) => <>{a} von {b}</>,
    storesCaption: (x: RestockTimesView) => `Top-Stores für iPhone-Duo-Restocks ${rtW(x)}, ${dateLabel(x.t.since, false)} bis heute`,
    storesHead: ["Store", "Restocks", "Tage", "Übliche Stunde", "Zuletzt (Ortszeit)"],
    swaps: (x: RestockTimesView) => [
      { no: "Dem Spitzen-Store der Liste nachjagen, egal wie weit weg", yes: `Zwei oder drei Stores, die Sie binnen einer Stunde erreichen – ${x.pattern ? `ab ${uhr(x.w.from)}` : "am Morgen"}`, why: "Ein Restock außer Reichweite nützt Ihnen nichts, und selbst der aktivste Store zeigt bis auf wenige Minuten am Tag „nicht verfügbar“." },
      { no: "Alles auf einen einzigen Store setzen", yes: "Ein Alarm für jeden, dann zu dem fahren, der zuerst meldet", why: "Die Zähltabelle hilft nur bei der Entscheidung, welchen Ihrer Stores Sie zuerst ansteuern." },
    ],
    nearMe: "Duo-Bestand in meiner Nähe, live",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} führt mit {rtN(top.restocks)} der {rtN(x.t.n)} Restocks ({rtPct(top.restocks / x.t.n)}){rarest ? `; am Ende liegt ${rarest.label} mit ${restocks(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} kommt öfter zurück als jede andere Konfiguration`,
    versus: (a: string, bCount: number, b: string) => `Restocks ${mitIn(a)} ${a} – zum Vergleich: ${rtN(bCount)} ${mitIn(b)} ${b}`,
    restocksOf: (a: string) => `Restocks ${mitIn(a)} ${a}`,
    byStorage: "je Speichergröße",
    byColour: "je Farbe",
    configNone: (x: RestockTimesView) => <b>Bisher hat keine Konfiguration {rtW(x)} einen bestätigten Restock; alle acht stehen schon da, damit der erste Restock seine Zeile hat.</b>,
    configCaption: (x: RestockTimesView) => `Bestätigte iPhone-Duo-Restocks je Konfiguration ${rtW(x)}, ${dateLabel(x.t.since, false)} bis heute`,
    configHead: ["Konfiguration", "Restocks", "Anteil", "Neuester Restock (Ortszeit)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Die Wahl der Konfiguration zählt <b className="text-ink">mehr als die Wahl des Stores</b></> },
      x.storageRatio != null
        ? { text: <>Wer sich auf den häufigsten Speicher einlässt, hat etwa <b className="text-ink">{n(x.storageRatio)}×</b> so gute Chancen wie bei der nächsten Größe</> }
        : { text: <>Wer sich auf den häufigsten Speicher einlässt, verbessert seine Chancen <b className="text-ink">deutlich</b></> },
      { text: <>Das <b className="text-ink">2TB</b>-Modell bestellt man besser zur Lieferung und wartet</>, no: true },
      { text: <>Preise und Live-Bestand: <Link href="/iphone-duo-most-restocked-stores">Welches iPhone Duo kommt am häufigsten zurück?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{sell.medianSec} Sekunden: die mittlere Lebensdauer der {rtN(sell.n)} ausverkauften Restocks {rtW(x)}; {rtPct(sell.within2min)} waren binnen 2 Minuten weg, {rtPct(sell.within20min)} binnen 20.</b>,
    secUnit: "s",
    medianListing: "Median, von gelistet bis weg",
    within2: "nach unter 2 Minuten weg",
    within20: "nach unter 20 Minuten weg",
    fastest: "schnellster Ausverkauf im Protokoll",
    howLongNone: (x: RestockTimesView) => <b>Noch zu wenige ausverkaufte Restocks {rtW(x)} zum Messen; diese Zahlen beginnen ab zehn, die US-Seite hat den vollständigen Satz.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Zwei Minuten sind ein Fenster für einen <b className="text-ink">Alarm</b>, nicht für Neuladen auf apple.com</> },
      { text: <>Jede andere Zahl auf dieser Seite folgt aus dieser</> },
      { text: <>Jeder Restock und wie viele Sekunden er hielt, je Konfiguration und {rtU(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">Wie schnell ist ein iPhone-Duo-Restock ausverkauft?</Link></>, step: true },
    ],
    measured: "Jede Zahl reicht von der Abfrage, die die Konfiguration zuerst gelistet fand, bis zu der, die sie weg fand – sie ist also eine Obergrenze: Die echte Lebensdauer ist kürzer.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Ein Restock ist ein Aufblitzen, kein Zustand: {x.one ? "ein Store" : `${rtN(x.stores)} Stores`} × {x.configs} Konfigurationen ergibt {rtN(x.pairs)} mögliche Listungen {rtW(x)}, und gerade {x.duoNow === 1 ? "listet 1 Store" : `listen ${x.duoNow} Stores`} überhaupt ein iPhone Duo.</b>,
    pairs: "mögliche Listungen aus Store × Konfiguration",
    listingNow: "mit gerade gelistetem iPhone Duo zur Abholung",
    goneIn2: "der Restocks nach unter zwei Minuten vorbei",
    last24: "bestätigte Restocks, letzte 24 Stunden",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Letzte 24 Stunden: <b className="text-ink">{confirmed(x.recent.restocks)}</b> in {storesN(x.recent.stores)} {rtW(x)}</> }
        : today > 0
          ? { text: <>Heute: <b className="text-ink">{confirmed(today)}</b> {rtW(x)}</> }
          : { text: <>Die Tagestabelle oben zeigt die Restocks, die es tatsächlich gab</> },
      { text: <>Jeder stand <b className="text-ink">ein, zwei Minuten</b> auf apple.com</> },
      { text: <>„Überall nicht verfügbar“ an Tag vier oder Tag vierzehn heißt <b className="text-ink">nicht</b>, dass Apple aufgehört hat</>, no: true },
    ],
    unavailableLinks: { explained: "„Derzeit nicht zur Abholung verfügbar“, erklärt", howToGet: "Ein iPhone Duo bekommen, Schritt für Schritt" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Viele Ratschläge in <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> und <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> sind ehrlich, beruhen auf einem einzigen Store und sind am nächsten Tag überholt; unten die vier häufigsten Behauptungen, geprüft an {rtN(x.t.n)} bestätigten Restocks {rtW(x)}.</b>,
    redditCaption: "Häufige Reddit-Behauptungen zu iPhone-Duo-Restocks, geprüft an RestockWires bestätigten Restocks",
    redditHead: ["Behauptung", "Was das Protokoll zeigt"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "„Die Stores füllen nachts auf – um 3 Uhr nachsehen.“", answer: t.n > 0 ? <>{rtPct(hourShare(t.byHour, 0, 6))} der Restocks kamen zwischen Mitternacht und 6 Uhr Ortszeit, gegenüber {rtPct(w.share)} {zwischen(w.from, w.to)}.</> : "Noch nichts erfasst, um es zu prüfen." },
        { claim: "„Apple füllt nur an einem Wochentag auf.“", answer: t.n > 0 ? (t.peakWeekday != null ? <>Der {wd(t.peakWeekday)} führt bisher ({rtN(t.byWeekday[t.peakWeekday])} von {rtN(t.n)}), doch Restocks gab es an {t.days} von {tracked} Tagen.</> : <>Restocks gab es an {t.days} von {tracked} erfassten Tagen{t.days === tracked ? ", kein einziger Tag ohne" : ""}; einen stärksten Wochentag nennen wir nach {WEEKDAY_MIN_SPAN} Tagen Daten.</>) : "Noch nichts erfasst, um es zu prüfen." },
        { claim: "„Ruf im Store an und frag, wann der Lkw kommt.“", answer: "Es gibt keinen veröffentlichten Restock-Plan; Abholbestand wird online freigegeben, und der Store sieht ihn im selben Moment wie alle anderen." },
        { claim: "„Steht da ‚nicht verfügbar‘, ist es endgültig ausverkauft.“", answer: recent.restocks > 0 ? <>{confirmed(recent.restocks)} in {storesN(recent.stores)} in den letzten 24 Stunden beweisen das Gegenteil, und jeder war binnen Minuten wieder „nicht verfügbar“.</> : t.n > 0 ? <>{confirmed(t.n)} seit {dateLabel(t.since, false)} beweisen das Gegenteil, und jeder war binnen Minuten wieder „nicht verfügbar“.</> : "Noch nichts erfasst, um es zu prüfen." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Gerüchte füllen die Lücke, wo es <b className="text-ink">keine Daten</b> gibt; diese Seite sind die Daten, und sie zu lesen kostet nichts</> },
      { text: <>Eines hat Reddit richtig: die <b className="text-ink">Checkout-Vorbereitung</b>, angemeldet und mit eingerichtetem Apple Pay (<Link href="/iphone-duo-restock-checkout-guide">unsere 20-Sekunden-Version</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Ein Restock ist eine Konfiguration, die auf apple.com in einem Store zur Abholung erscheint, der sie vorher nicht gelistet hatte – bestätigt durch zwei übereinstimmende Abfragen.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Stores mit Alarm: alle <b className="text-ink">{SPEED.fastSec} Sekunden</b>; {x.one ? "der Apple Store" : "jeder Apple Store"} {rtW(x)}: alle <b className="text-ink">{SPEED.checkSec} Sekunden</b></> },
      // OTHER_TRACKERS ("8 seconds to 15 minutes") in German.
      { text: <>Veröffentlichte Intervalle anderer Tracker: <b className="text-ink">8 Sekunden bis 15 Minuten</b>; wir vergleichen nur, was sie selbst veröffentlichen</> },
      { text: <>Ein erstes „verfügbar“ wird <b className="text-ink">etwa eine Sekunde später</b> erneut geprüft, bevor es zählt</> },
      { text: <>Ein verschwundenes Angebot wird in der <b className="text-ink">folgenden Runde</b> bestätigt</> },
      { text: <>Die erste Sichtung eines Stores, eine fehlgeschlagene Anfrage, eine Zeitüberschreitung: <b className="text-ink">nie</b> ein Restock und nie „ausverkauft“</>, no: true },
      { text: <>Alle Uhrzeiten und Daten in der <b className="text-ink">Ortszeit</b> des jeweiligen Stores; eine „Welle“ ist dieselbe halbe Stunde über Zeitzonen hinweg</> },
      { text: <>Meldungen anderer Tracker{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} bekommen eigene, markierte Zeilen und sind <b className="text-ink">in keiner Summe enthalten</b></> },
      { text: <>Diese Tabellen werden etwa alle fünf Minuten aktualisiert; <Link href={x.logHref}>das Restock-Protokoll</Link> ist live</>, step: true },
    ],
    quote: "Diese Seite zitieren: Jede Zahl hier darf mit einem Link zurück zitiert werden. RestockWire ist unabhängig von Apple und liest dieselbe Abhol-Verfügbarkeit, die jeder auf apple.com sehen kann, nur viel öfter.",
    alertIn: (x: RestockTimesView) => <>{x.one ? "iPhone-Duo-Alarme einrichten" : `iPhone-Duo-Alarme ${rtW(x)} einrichten`}</>,

    // ---- related, FAQ, sources
    related: "Weitere Fragen zum iPhone Duo",
    sameData: "Aus demselben Protokoll",
    questions: {
      sellOut: "Wie lange hält ein Restock?",
      alerts: "Am schnellsten von einem Restock erfahren",
      howToGet: "So bekommen Sie eins in der Praxis",
      whichConfig: "Die Konfiguration, die am häufigsten zurückkommt",
      nearMe: "Live-Bestand in meiner Nähe",
      unavailable: "„Nicht verfügbar“, erklärt",
    },
    otherCountries: (us: boolean): string => (us ? "Gleiche Seite, anderes Land" : "Weitere Länder"),
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "Stadtseiten",
      storesLive: (x: RestockTimesView) => `Apple Stores ${rtW(x)}: Live-Bestand`,
      countryPage: (c: Country) => `iPhone-Duo-Restock-Zeiten ${where(c)}, alle Stores`,
      sourcesWhere: (x: RestockTimesView) => `alle ${x.stores} Apple Stores ${rtW(x)}`,
    },
    faqTitle: "Häufige Fragen",
  },
};
