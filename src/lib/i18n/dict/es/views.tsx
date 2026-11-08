/**
 * Spanish (Spain): views — the product × place pages, the restock log, the live map, the iPhone Duo restock-times
 * page and the store index under /es-es/. Arguments and shapes match English (dict/en/views.tsx). Store, Place and
 * Product objects carry English data and get their Spanish names from places.ts; hours are written 9:00.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, stateCodeOf, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import type { StoreLine } from "@/lib/seo/productData";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { distance, fitTitleW, list, num, price, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import { L, n, pc, pais, enPais, dePais, noun, cap, taxNote, h, lasH, range, between, tc, fixHour, fixDay, losDias, todoPais, otherTrackers, apples, tiendas, reposiciones, dias, v, aprox } from "./words";

/* ---------------------------------------------------------------- Spanish names of English data */

const apple = (s: Store): string => appleStoreLabel(s, L);
const cityOf = (s: Store): string => cityLabel(s.country ?? "us", s.city, L);
const ccOf = (p: { country?: CountryCode }): CountryCode => p.country ?? "us";
/** "iPhone Duo 256GB Cielo nocturno". */
const pName = (p: Product): string => tc(p.name);
const pShort = (p: Product): string => tc(p.short);
/** A place's name in Spanish. */
function placeEs(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cc === "us" ? "EE. UU." : pais(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return apple(place.store!);
}
/** The place with en in front (country names get their article). */
const enLugar = (place: Place): string => (place.level === "country" ? (ccOf(place) === "us" ? "en EE. UU." : enPais(ccOf(place))) : `en ${placeEs(place)}`);
/** Same place, with de instead of en. */
const deLugar = (place: Place): string => (place.level === "country" ? (ccOf(place) === "us" ? "de EE. UU." : dePais(ccOf(place))) : `de ${placeEs(place)}`);
const configs = (x: number) => `${n(x)} ${x === 1 ? "configuración" : "configuraciones"}`;
const confirmadas = (x: number) => `${reposiciones(x)} ${x === 1 ? "confirmada" : "confirmadas"}`;
const appleName = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const cc = ccOf(place);
  if (place.level === "country" && cc !== "us") {
    return fitTitleW([
      ...(inStock > 0 ? [`${apples(inStock)} ${dePais(cc)} ${v(inStock, "tiene", "tienen")} el ${pName(product)} ahora`] : []),
      `${pName(product)} ${enPais(cc)}: stock para recogida, en directo`,
      `${pShort(product)} ${enPais(cc)}: stock para recogida`,
      `Stock del ${pShort(product)} para recogida`,
    ]);
  }
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${pName(product)}: ${apples(inStock)} lo ${v(inStock, "tiene", "tienen")} para recogida ahora`] : []),
      `${pName(product)}: recogida en cualquier Apple Store de EE. UU.`,
      `${pName(product)}: stock para recogida en directo`,
      `Stock del ${pShort(product)} para recogida`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${pName(product)} en ${apple(s)}: ${inStock > 0 ? "disponible para recogida ahora" : "stock y reposiciones"}`,
      `${pShort(product)} en ${apple(s)}: ${inStock > 0 ? "en stock ahora" : "stock"}`,
      `${pShort(product)} en ${apple(s)}`,
      `${pShort(product)} en ${storeLabel(s, L)}`,
      `${pShort(product)} · ${storeLabel(s, L)}`,
    ]);
  }
  const w = placeEs(place);
  return fitTitleW([
    `${pName(product)} en ${w}: ${n(inStock)} de ${tiendas(place.stores.length)} lo ${v(inStock, "tiene", "tienen")} ahora`,
    `${pName(product)} en ${w}: stock para recogida, en directo`,
    `${pShort(product)} en ${w}: ¿en stock ahora?`,
    `${pShort(product)} en ${w}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const week = `${reposiciones(stats.week)} esta semana`;
  if (place.level === "store") {
    const s = place.store!;
    const locality = ccOf(place) === "us" ? `${s.city} ${stateCodeOf(s)}` : cityOf(s);
    return fitTitleW([
      `${pName(product)} en ${apple(s)}, ${locality}: ${inStock > 0 ? "disponible para recogida en la última comprobación" : "no disponible para recogida ahora mismo"}, ${week}. Cuándo repone esta tienda, cuánto dura y una alerta para la próxima.`,
      `${pName(product)} en ${apple(s)}: ${inStock > 0 ? "en stock ahora" : "sin stock ahora"}, ${week}. Horas de reposición y alertas.`,
    ], 155);
  }
  const cc = ccOf(place);
  const where = place.level === "country" ? (cc === "us" ? "Apple Store de EE. UU." : `Apple Store ${dePais(cc)}`) : `Apple Store de ${placeEs(place)}`;
  const k = place.stores.length;
  return fitTitleW([
    `${n(inStock)} de ${n(k)} ${where} ${v(inStock, "tiene", "tienen")} el ${pName(product)} para recogida en este momento, ${week}. Tienda a tienda, con horas de reposición y una alerta en el móvil para la próxima.`,
    `${pName(product)}: ${n(inStock)} de ${n(k)} ${where} lo ${v(inStock, "tiene", "tienen")} ahora, ${week}. Tienda a tienda, horas de reposición y aviso al móvil.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = enLugar(place);
  const cc = ccOf(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const nearestBit = nearest ? `; la tienda más cercana que lo tiene es ${appleName(nearest.name)}, en ${nearest.city}, a ${distance(L, cc, nearest.distance)}` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `¿Hay stock del ${pName(product)} ${at} ahora mismo?`,
      a: l && l.available.length > 0
        ? `Sí, lo hay${product.parts.length > 1 ? ` (${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (x) => `${n(x)} más`)})` : ""}: así salía en la última revisión.`
        : `No, según la última revisión${nearestBit}.`,
    });
  } else {
    out.push({
      q: `¿Qué Apple Store ${deLugar(place)} tienen el ${pName(product)} ahora mismo?`,
      a: inStock.length === 0
        ? `Ninguno, según la última revisión${nearestBit}.`
        : `${tiendas(inStock.length)}, según la última revisión: ${list(L, inStock.map((x) => apple(x.store)), 4, (x) => `${n(x)} más`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `¿Cada cuánto vuelve el ${pName(product)} ${at}?`,
    a: stats.month === 0
      ? `Ninguna reposición confirmada ${at} en los últimos ${n(stats.days)} días.`
      : `${cap(confirmadas(stats.month))} en los últimos ${n(stats.days)} días, ${n(stats.week)} de ellas esta semana${peak ? `, concentradas hacia ${/^1:/.test(peak.hour) ? "la" : "las"} ${peak.hour}, hora local` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `¿Cuánto dura una reposición del ${pName(product)} ${at}?`, a: `${cap(aprox(fmtDuration(stats.medianMs, L)))} de mediana antes de volver a agotarse.` });
  return out;
}

/** "2339 €–3839 €": the price range of the page's configurations. */
function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (x: number) => price(L, COUNTRIES[cc], x);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- formato para la página de horas de reposición */

const rtN = (x: number) => num(L, x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pc(Math.round(x * 100)));
const dtf = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("es-ES", o);
/** Short date, with or without the weekday. */
const dateLabel = (ymd: string, weekday = true) => dtf({ timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** Long date: day, month and year. */
const longDate = (ymd: string) => dtf({ timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "27 oct, 9:30 CET". */
const zoneStamp = (iso: string, c: Country) => dtf({ timeZone: c.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
const wd = (d: number) => weekdays(L)[d];
const rn = (x: { us: boolean; c: Country }) => noun(x.c, x.us);

const OTHER = otherTrackers(OTHER_TRACKERS);

/* ---------------------------------------------------------------- views */

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? `en ${x.place.name}` : enPais(x.c.cc));
const rtD = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? `de ${x.place.name}` : dePais(x.c.cc));
const rnU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? ({ one: x.place.kind === "region" ? "ciudad" : "tienda", other: x.place.kind === "region" ? "ciudades" : "tiendas", f: true } as ReturnType<typeof rn>) : rn(x));
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => enPais(c.cc),
    liveMap: "Mapa en directo",
    restockLog: "Registro de reposiciones",
    alertMe: "Recibir alertas",
    lastDays: (days: number) => <>{n(days)} días, día a día</>,
    since: "2 de noviembre de 2026",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `el Apple Store ${dePais(c.cc)}` : `los ${apples(k)} ${dePais(c.cc)}`),
    checker: (c: Country) => `Comprobador de stock de iPhone ${enPais(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Store ${enPais(c.cc)}`,
    storesWithIt: "tiendas que lo tienen",
    more: "Ver más",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => `en ${name}`,
    h1Country: (model: string, c: Country) => `Stock del ${tc(model)} para recogida en tienda ${enPais(c.cc)}`,
    h1Place: (model: string, where: string) => `${tc(model)} ${where}`,
    inStockNow: "Disponible ahora",
    yes: "Sí",
    no: "No",
    pickup: "recogida",
    configurations: "configuraciones",
    ofStores: (k: number) => `de ${tiendas(k)}`,
    restocks24h: "Reposiciones, 24 h",
    restocksHint: (week: number, month: number, days: number) => `${n(week)} en 7 d · ${n(month)} en ${n(days)} d`,
    sellOuts: (days: number) => `Agotamientos ${n(days)} d`,
    stays: (ms: number) => `dura ~${fmtDuration(ms, L)}`,
    noPairs: "aún sin agotamientos emparejados",
    lastRestock: "Reposición más reciente",
    noneYet: "de momento ninguna",
    thisConfig: "esta configuración",
    inDays: (days: number) => `en ${n(days)} días`,
    notInStockNow: "No disponible en este momento",
    configsInStock: (k: number, of: number) => <span><b className="text-ink">{n(k)}</b> de {n(of)} configuraciones disponibles</span>,
    inStockAt: (k: number, of: number) => <span>Disponible en <b className="text-ink">{n(k)}</b> de {n(of)} {of === 1 ? "tienda" : "tiendas"}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>Leído {live} · {p}{tax}</>,
    taxNote: (c: Country) => taxNote(c),
    beforeTax: "sin impuestos",
    buyOnApple: "Pedir en apple.com",
    allStoresIn: (c: Country) => `Todas las tiendas ${dePais(c.cc)}`,
    everyIphoneHere: "Todos los iPhone en este lugar",
    everyIphone: (where: string) => `Todos los iPhone ${where}`,
    panel: (model: string, where: string | null) => `${tc(model)}${where ? ` ${where}` : ""}: elige las configuraciones y luego las tiendas`,
    unitConfigs: "configuraciones",
    unitStores: "tiendas",
    otherConfigsHere: "Más configuraciones en este lugar",
    byStorageColor: "Capacidad y color",
    nearestStores: "Las tiendas más próximas",
    closest: (link: ReactNode, dist: string) => <>La tienda más cercana que lo tiene: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Disponibles más recientemente",
    storesWithItNow: "Tiendas que lo tienen ahora",
    storesIn: (where: string) => `Tiendas ${where}`,
    colStatus: "estado",
    colConfigs: "configuraciones disponibles",
    noStoreHasIt: "Ninguna tienda lo tiene en este momento.",
    noStoreHereHasIt: "Ninguna tienda de esta zona lo tiene en este momento.",
    moreStores: (k: number) => <>{n(k)} tiendas más, ordenadas por estado más abajo.</>,
    byRegion: (c: Country) => `Por ${noun(c).one}`,
    byCity: "Por ciudad",
    nearbyStores: "Tiendas cercanas",
    latestChanges: "Cambios más recientes",
    nothingLogged: "De momento el registro está vacío.",
    whenRestocks: "Horas habituales de reposición",
    howFast: "Cuánto dura una reposición",
    restocksByConfig: "Qué configuraciones se reponen",
    faqTitleCountry: (model: string, c: Country) => `${tc(model)} ${enPais(c.cc)}: preguntas`,
    faqTitle: (model: string, where: string) => `${tc(model)} ${where}`,
    buySource: (model: string, c: Country) => `Apple: página de compra del ${tc(model)} (${pais(c.cc)})`,
    nearby: "Alrededor",
    otherRegions: (c: Country) => { const nn = noun(c); return `${nn.f ? "Otras" : "Otros"} ${nn.other}`; },
    elsewhereIn: (region: string) => `Más lejos, en ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Store ${enPais(c.cc)}: lista completa`,
    across: (model: string, c: Country) => `${tc(model)} en ${c.cc === "us" ? "todo EE. UU." : todoPais(c.cc)}`,
    itemList: (model: string, where: string) => `${tc(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `En este momento ningún Apple Store ${dePais(c.cc)} tiene el ${tc(model)} disponible para recogida, así que «cerca de mí» se reduce a qué tienda cercana repone primero. Con una alerta en cada tienda a la que puedas llegar, el aviso llega a tu móvil segundos después de que una lo ponga disponible.`
        : `${tiendas(inStock)} de ${n(k)} ${v(inStock, "tiene", "tienen")} el ${tc(model)} en este momento: ${list(L, have.slice(0, 5).map((l) => `${l.store}, en ${l.city} (${configs(l.configs)})`), 5)}.`,
    nearHead: (c: Country) => [cap(noun(c).one), "Tiendas que lo tienen ahora"],
    nearCaption: (c: Country, model: string) => `Stock del ${tc(model)} para recogida por ${noun(c).one}, última comprobación`,
    nearMe: (_c: Country, model: string, alert: string) => `Toca «Cerca de mí» en la configuración de alertas de esta página y todas las tiendas se ordenan desde donde estás, por distancia estimada por carretera en kilómetros, cada una con un enlace para llegar. [Crea una alerta del ${tc(model)}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => ({
      price: { q: `¿Cuánto cuesta el ${tc(model)} ${enPais(c.cc)}?`, a: `Entre ${price(L, c, low)} y ${price(L, c, high)} en apple.com (${taxNote(c)}); lo que cambia el precio es la capacidad.` },
      reserve: { q: `¿Hay forma de reservar el ${tc(model)} para recogerlo ${enPais(c.cc)}?`, a: `No por adelantado: cuando una tienda pone disponible tu configuración, la pides en apple.com con «Recogida», y Apple te la guarda para tu franja horaria.${inStock === 0 ? " Ahora mismo ninguna tienda lo tiene, así que una alerta es la forma de llegar el primero." : ""}` },
    }),
  },

  restocks: {
    metaTitle: (c: Country, k: number) => fitTitleW([`Registro de reposiciones de iPhone en directo ${enPais(c.cc)}: ${k === 1 ? "el Apple Store" : apples(k)}`, `Reposiciones de iPhone en directo ${enPais(c.cc)}: ${k === 1 ? "el Apple Store" : apples(k)}`, `Reposiciones de iPhone en directo ${enPais(c.cc)}`]),
    metaDescription: (c: Country, k: number) => `Cada reposición confirmada para recogida en tienda del iPhone Duo, 18 Pro y Pro Max en ${k === 1 ? "el Apple Store" : "los Apple Store"} ${dePais(c.cc)}: hora, configuración exacta y mapa.`,
    h1: (c: Country) => `Reposiciones de iPhone ${enPais(c.cc)}, en el momento en que ocurren`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{reposiciones(day)} en las últimas 24 horas · {n(week)} en 7 días{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Las horas se muestran en tu propia zona horaria.</>,
    allModels: "Todos los modelos",
    restocks: "Reposiciones",
    withSoldOut: "Reposiciones y agotamientos",
    regionLabel: (c: Country) => cap(noun(c).one),
    allRegions: (c: Country) => { const nn = noun(c); return `${nn.f ? "Todas las" : "Todos los"} ${nn.other}`; },
    filter: "Aplicar",
    page: (k: number) => <>página {n(k)}</>,
    newer: "← Más recientes",
    older: "Más antiguas →",
    getAlerts: "Configurar alertas",
    byPlace: "Reposiciones, lugar a lugar",
    byRegion: (c: Country) => `Por ${noun(c).one}`,
    datasetName: (c: Country) => `Reposiciones de iPhone para recogida en tienda en los Apple Store ${dePais(c.cc)}`,
    datasetDescription: (c: Country) => `Reposiciones y agotamientos confirmados para recogida en tienda del iPhone Duo, iPhone 18 Pro y iPhone 18 Pro Max en ${c.cc === "us" ? "cada uno de los 269 Apple Store de EE. UU." : `cada Apple Store ${dePais(c.cc)}`}: tienda, configuración exacta y hora. Las tiendas se leen cada 15 segundos (cada 5 segundos donde hay una alerta), y una reposición solo entra en el registro cuando apple.com da la misma respuesta dos veces.`,
    datasetMeasured: ["tienda Apple", "configuración del iPhone (modelo, capacidad, color)", "momento de la reposición", "momento del agotamiento"],
  },

  map: {
    metaTitle: (c: Country, k: number) => fitTitleW([`Mapa del stock del iPhone Duo en directo: ${k === 1 ? "el Apple Store" : "cada Apple Store"} ${dePais(c.cc)}`, `Mapa del stock del iPhone Duo en directo ${enPais(c.cc)}`]),
    metaDescription: (c: Country, k: number) => `Dónde están disponibles ahora mismo para recogida en tienda el iPhone Duo, 18 Pro y Pro Max: ${k === 1 ? "el Apple Store" : `los ${apples(k)}`} ${dePais(c.cc)} en un mapa en directo, por capacidad y color.`,
    // regionNoun stays the country data's key: the map looks its Spanish words up in cdict map.nouns.
    country: (c: Country) => ({ name: pais(c.cc), inName: enPais(c.cc), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Todas las tiendas",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `, ${noun(c).one} a ${noun(c).one} y ciudad a ciudad` : cities > 1 ? ", ciudad a ciudad" : "";
      return `${n(duo)} ${v(duo, "tiene", "tienen")} el iPhone Duo y ${n(max)} el Pro Max ahora mismo: stock para recogida en directo en los ${apples(k)} ${dePais(c.cc)}${by}, 18 Pro incluido.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `${n(k)}, ${spread}${top.length ? `; ${top[0].name} va en cabeza con ${n(top[0].count)}${top[1] ? `, por delante de ${top[1].name} (${n(top[1].count)})` : ""}` : ""}.`,
    howMany: (c: Country) => <>Apple Store {enPais(c.cc)}: ¿cuántos hay?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `¿Qué Apple Store ${dePais(c.cc)} tienen el iPhone Duo ahora mismo?`,
      a: have.length === 0
        ? `Ninguno de los ${n(k)}, según la última revisión. Página y mapa cambian en cuanto uno lo tenga; una alerta llega antes que los dos.`
        : `${n(have.length)} de los ${n(k)}, según la última revisión: ${list(L, have.map(apple), 6, (x) => `${n(x)} más`)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: ctx.peak ? { ...ctx.peak, hour: fixHour(ctx.peak.hour), day: ctx.peak.day ? fixDay(ctx.peak.day) : null } : ctx.peak, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `Una alerta en las tiendas a las que puedes llegar es el camino más rápido para conseguir uno: [crea una alerta del iPhone Duo](${alert}). Una alerta cubre una tienda × una configuración exacta, y tu móvil se entera segundos después de que esa tienda lo ponga disponible.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `En este momento **${n(now.duo)}** ${v(now.duo, "tiene", "tienen")} un iPhone Duo disponible para recogida, **${n(now.max)}** el iPhone 18 Pro Max y **${n(now.pro)}** el 18 Pro, de un total de **${apples(k)}** ${enPais(c.cc)}, ${spread}. ${tax}`,
    crumb: "Tiendas Apple",
    panel: (c: Country) => `Elige tus iPhone y marca las tiendas ${dePais(c.cc)} que te quedan a mano`,
    matrixLabel: "Stock por tienda",
    matrixH2: (c: Country) => <>Stock tienda a tienda {enPais(c.cc)}</>,
    matrixHint: "Disponibles ahora / seguidas, por modelo.",
    topCaption: (c: Country) => <>{cap(noun(c).other)} ordenadas por número de Apple Store (según la lista oficial de tiendas de Apple, tal como la seguimos aquí)</>,
    regionHead: (c: Country) => cap(noun(c).one),
    colStores: "Apple Store",
    colCities: "Ciudades",
    locationsBy: (c: Country) => { const nn = noun(c); return `Dónde están los Apple Store, ${nn.one} a ${nn.one}`; },
    locationsIn: (c: Country) => `Todas las ubicaciones de Apple Store ${enPais(c.cc)}`,
    storeCount: (k: number) => <>{tiendas(k)}</>,
    storeCountAll: (k: number) => <>{n(k)} tiendas</>,
    whenRestock: (c: Country) => <>¿A qué hora reponen las tiendas {dePais(c.cc)}?</>,
    howFast: (c: Country) => <>¿Cuánto dura una reposición {enPais(c.cc)}?</>,
    faqTitle: (c: Country) => `Apple Store ${enPais(c.cc)}: preguntas`,
    getApp: "Instalar la app",
    howItWorks: "Cómo funciona",
    pricing: "Precios",
  },

  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: (x: number) => h(x),
      range,
      weekday: (d: number) => wd(d),
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${apple(s)} (${cityOf(s)})`,
    },
    title: (c: Country, place?: RestockTimesPlace) => `¿A qué hora repone Apple el iPhone Duo ${place ? `en ${place.name}` : enPais(c.cc)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "ciudad" : "tienda") : c.cc === "us" ? "estado" : c.regionNoun ? noun(c).one : "tienda";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `iPhone Duo ${rtW(x)}: el ${rtPct(w.share)} de ${reposiciones(t.n)} llega ${between(w.from, w.to)} (hora de la tienda)${t.sellout ? `, y el ${rtPct(t.sellout.within2min)} se agota en 2 minutos` : ""}. Datos desde el ${since}, con desglose horario, diario, por ${region}, por tienda y por configuración.`,
          `iPhone Duo ${rtW(x)}: el ${rtPct(w.share)} de ${reposiciones(t.n)} llega ${between(w.from, w.to)} (hora de la tienda). Datos desde el ${since}, con desglose horario, diario, por ${region} y configuración.`,
          `¿Cuándo vuelve el iPhone Duo ${rtW(x)}? ${cap(reposiciones(t.n))} desde el ${since}, con desglose horario, diario, por ${region} y configuración.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `iPhone Duo ${rtW(x)}: ${confirmadas(t.n)} desde el ${since}, cada tienda revisada cada ${SPEED.checkSec} segundos. Desglose horario, diario, por ${region}, tienda y configuración, con la duración de cada una.`,
            `¿Cuándo vuelve el iPhone Duo ${rtW(x)}? ${cap(confirmadas(t.n))} desde el ${since}, con desglose horario, diario, por ${region} y configuración.`,
          ], 158)
          : fitTitleW([
            `¿Cuándo vuelve el iPhone Duo ${rtW(x)}? Desde el ${longDate(t.since)}, RestockWire revisa cada tienda cada ${SPEED.checkSec} segundos; aquí, el desglose por hora, día, tienda y configuración exacta.`,
            `¿Cuándo vuelve el iPhone Duo ${rtW(x)}? Cada tienda, revisada cada ${SPEED.checkSec} segundos desde el ${dateLabel(t.since, false)}.`,
          ], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `¿A qué hora repone Apple el iPhone Duo ${rtW(x)}?`
      : x.t.n > 0
        ? `¿A qué hora repone Apple el iPhone Duo ${rtW(x)}? ${x.pattern ? `Sobre todo ${between(x.w.from, x.w.to)}, hora local` : "Nuestras propias comprobaciones, hora a hora"}`
        : `¿Hay reposiciones del iPhone Duo ${rtW(x)}? Todavía no: esto es lo que vigilamos`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const de = rtD(x);
      return t.unknown ? (
        <>El registro de reposiciones no está disponible en este momento. Las tiendas {de} se siguen leyendo cada {SPEED.checkSec} segundos, y las cifras vuelven en la próxima carga de la página.</>
      ) : t.n > 0 && pattern ? (
        <>
          <b className="text-ink">El {rtPct(w.share)} de las {rtN(t.n)} reposiciones del iPhone Duo</b> que RestockWire ha confirmado en {one ? "el Apple Store" : "los Apple Store"} {de} desde el {longDate(t.since)} llegó <b className="text-ink">{between(w.from, w.to)}</b> según el reloj de la tienda{x.sell ? <>; una reposición típica se agotó en unos {rtN(Math.round(x.sell.medianSec / 5) * 5)} segundos</> : null}. <b className="text-ink">Las reposiciones siguen llegando</b>{tracked > 1 ? <>: {rtN(t.days)} de los {rtN(tracked)} días de seguimiento tuvieron al menos una</> : <> (de momento, solo llevamos un día)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Sí.</b> <b className="text-ink">{cap(reposiciones(t.n))} del iPhone Duo desde el {longDate(t.since)}</b> en {one ? "el Apple Store" : "los Apple Store"} {de}{tracked > 1 ? <>, en {rtN(t.days)} de los {rtN(tracked)} días</> : <> (de momento, solo llevamos un día)</>}; indicamos una hora habitual cuando hay {PATTERN_MIN} reposiciones en {PATTERN_MIN_DAYS} días distintos.
        </>
      ) : (
        <>
          <b className="text-ink">De momento, no.</b> Desde el {longDate(t.since)}, RestockWire ha leído {one ? "el Apple Store" : `los ${x.stores} Apple Store`} {de} cada {SPEED.checkSec} segundos sin confirmar ni una sola reposición del iPhone Duo para recogida.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `reposiciones con doble comprobación (desde el ${dateLabel(x.t.since, false)})`,
      window: (x: RestockTimesView) => `cayeron ${between(x.w.from, x.w.to)}, según el reloj de la tienda`,
      days: "días con alguna reposición",
      // English infers literal return types: the Spanish words go through a cast.
      now: ((one: boolean) => (one ? "tienda con uno disponible para recogida en este momento" : "tiendas con uno disponible para recogida en este momento")) as unknown as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `en lo que va de hoy (${dateLabel(today.date)})${x.one ? "" : `, en ${tiendas(today.stores)}`}`,
      weekday: "el día de la semana con más movimiento hasta ahora",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>La más reciente: <b className="text-ink">{latest.config}</b>{x.one ? null : <> en <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, L)}, hora local</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{cap(losDias(wd(x.t.peakWeekday)))}</b> son los que más traen</> }] : []),
      { text: <><b className="text-ink">No hay calendario oficial de reposiciones</b>; estas cifras son nuestras propias comprobaciones confirmadas, actualizadas cada cinco minutos aproximadamente</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{rtN(x.duoNow)} de {rtN(x.stores)}</b> {x.duoNow === 1 ? "tiene" : "tienen"} uno disponible para recogida en este momento</> },
      { text: <>La primera reposición confirmada pone en marcha todas las tablas de abajo</>, step: true },
      { text: <>Para patrones por hora y día de la semana con la muestra más grande, consulta <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">la página de EE. UU. (en inglés)</Link></>, step: true },
    ],
    setUpAlert: "Recibir alertas del iPhone Duo",
    logLive: "Registro de reposiciones en directo",
    onThisPage: "Secciones",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Hora",
      "day-by-day": "Días",
      where: `Por ${rnU(x).one}`,
      configuration: "Configuraciones",
      "how-long": "Velocidad de agotamiento",
      unavailable: "«No disponible»",
      reddit: "Lo que dice Reddit",
      method: "Método",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `¿A qué hora vuelve el iPhone Duo ${rtW(x)}?`,
      "day-by-day": `¿Qué días se repuso el iPhone Duo ${rtW(x)}?`,
      where: `¿Dónde se repone más a menudo el iPhone Duo ${rtW(x)}?`,
      configuration: `¿Qué capacidad y color del iPhone Duo se reponen más ${rtW(x)}?`,
      "how-long": `¿Cuántos segundos dura una reposición del iPhone Duo ${rtW(x)}?`,
      unavailable: "¿Por qué apple.com muestra «no disponible» en todas las tiendas?",
      reddit: "Las teorías de Reddit sobre las reposiciones del iPhone Duo, contrastadas con el registro",
      method: "¿Qué cuenta como reposición en RestockWire?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
      return [
        { q: `¿En qué franja vuelve el iPhone Duo ${where}?`, a: t.n > 0 && pattern
          ? `${cap(between(w.from, w.to))} (reloj de la tienda): ahí cae el ${rtPct(w.share)} de ${rtN(t.n)} reposiciones con doble comprobación, contadas desde el ${longDate(t.since)}. La franja de 8:00 a 12:00 suma el ${rtPct(hourShare(t.byHour, 8, 12))}. No hay calendario oficial; este es el patrón que observa RestockWire, actualizado cada cinco minutos aproximadamente.`
          : `RestockWire tiene registradas ${confirmadas(t.n)} ${where} desde el ${longDate(t.since)}${t.days ? `, en ${dias(t.days)}` : ""}, y Apple no anuncia ningún calendario. Cuando haya ${PATTERN_MIN} reposiciones en ${PATTERN_MIN_DAYS} días distintos, esta página indicará por sí sola una hora habitual.` },
        { q: `¿Hay reposiciones del iPhone Duo los fines de semana${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Sí" : "De momento, ninguna"}: ${reposiciones(weekend)} de ${rtN(t.n)} (${rtPct(weekend / t.n)}) ${weekend === 1 ? "cayó" : "cayeron"} en sábado o domingo. ${t.peakWeekday != null ? `El día de la semana con más movimiento hasta ahora es el ${wd(t.peakWeekday)}.` : `Solo indicamos el día de la semana con más movimiento cuando los datos abarcan ${WEEKDAY_MIN_SPAN} días; de momento abarcan ${rtN(tracked)}.`}`
          : `De momento no hay datos de fin de semana ${where}; la tabla día a día de esta página crece con cada reposición confirmada.` },
        { q: "¿Cuándo debería empezar a mirar apple.com?", a: t.n > 0 && pattern
          ? `Si miras a mano, ten apple.com abierto con la recogida seleccionada desde ${lasH(w.from)}, hora local: en esas dos horas cae el ${rtPct(w.share)} del total. ${sell ? `La mediana hasta el agotamiento: ${rtN(sell.medianSec)} segundos` : "Lo normal es que dure alrededor de un minuto"}; por eso una alerta que comprueba cada ${SPEED.fastSec} segundos ([cómo funcionan las alertas, en inglés](/iphone-duo-restock-alerts)) gana a cualquier cantidad de recargas.`
          : `Mientras el patrón ${where} se va formando, una alerta puede vigilar por ti: las tiendas que elijas se comprueban cada ${SPEED.fastSec} segundos, de día y de noche ([cómo funcionan las alertas, en inglés](/iphone-duo-restock-alerts)).` },
        { q: "¿Por qué apple.com dice «no disponible» para el iPhone Duo en cada tienda?", a: sell
          ? `Porque cada reposición dura poco: de ${rtN(sell.n)} con inicio y fin medidos ${where}, el ${rtPct(sell.within2min)} desapareció en menos de 2 minutos y el ${rtPct(sell.within20min)}, en menos de 20. En este momento ${rtN(x.duoNow)} de ${rtN(x.stores)} tiendas ${x.duoNow === 1 ? "tiene" : "tienen"} uno, así que casi siempre apple.com dice con razón «no disponible», incluso los días con decenas de reposiciones ([qué significa «no disponible», en inglés](/apple-store-pickup-explained)).`
          : `Porque el stock para recogida aparece durante unos minutos cada vez; en este momento ${rtN(x.duoNow)} de ${tiendas(x.stores)} ${where} ${x.duoNow === 1 ? "tiene" : "tienen"} uno ([qué significa «no disponible», en inglés](/apple-store-pickup-explained)).` },
        { q: "¿Puedo recibir un aviso cuando mi Apple Store vuelva a tener el iPhone Duo?", a: `Sí: una alerta en esa tienda con tu capacidad y color exactos la pone en la ronda de ${SPEED.fastSec} segundos, y el aviso llega a tu móvil unos ${SPEED.alertSec} segundos tras confirmarse la reposición ([crear una alerta](${x.alert}); [cómo funciona, en inglés](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: ayuda de Entrega y Recogida (cómo funciona la disponibilidad para recogida)",
      newsroom: "Apple Newsroom, 23 de octubre de 2026: lanzamiento mundial del iPhone Duo en tienda",
      macRumors: "MacRumors, 24 de octubre de 2026: la recogida en tienda del iPhone Duo se reactiva en EE. UU. y Canadá",
      reports: (tracker: string) => `${tracker}: informes de reposiciones del iPhone Duo en la semana del lanzamiento (sus propias observaciones, mostradas aparte y nunca contadas)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `iPhone Duo: reposiciones para recogida por hora, tiendas Apple ${rtD(x)}`,
      description: `Reposiciones confirmadas del iPhone Duo para recogida en tienda en los Apple Store ${rtD(x)} desde el ${x.t.since} (tienda, configuración, hora), a partir de RestockWire, que lee cada tienda cada ${SPEED.checkSec} segundos; agrupadas por hora local, día, ${x.place?.kind === "city" ? "" : `${rnU(x).one}, `}tienda y configuración exacta.`,
      spatial: `Apple Store ${rtD(x)}`,
      measured: ["momento de la reposición (reloj de la tienda)", "tienda Apple", "configuración del iPhone Duo (capacidad, color)", "segundos hasta agotarse"],
      size: `${reposiciones(x.t.n)} en ${tiendas(x.t.stores)}`,
    }),
    crumb: "iPhone Duo: cuándo se repone",

    timeLead: (x: RestockTimesView) => <b>{cap(between(x.w.from, x.w.to))} (reloj de la tienda) se concentra el {rtPct(x.w.share)} de las {rtN(x.t.n)} reposiciones; entre las 8:00 y las 12:00, el {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `${reposiciones(count)} en la hora de más movimiento`,
    morning: "de 8:00 a 12:00",
    evening: "después de las 17:00: las tardes también cuentan",
    night: "de 0:00 a 6:00",
    tooFew: (x: RestockTimesView) => <b>{x.t.n > 0 ? "No hay" : "Todavía no hay"} días suficientes para fijar una hora: {confirmadas(x.t.n)} en {dias(x.t.days)} desde el {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Para fijar una hora habitual hacen falta <b className="text-ink">{PATTERN_MIN} reposiciones en {PATTERN_MIN_DAYS} días distintos</b></> },
      { text: <>Una ráfaga de diez reposiciones es un solo evento, no una costumbre</>, no: true },
      { text: <>Cada nuevo día de datos actualiza esta página por sí solo</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `iPhone Duo ${rtW(x)}: ${reposiciones(x.t.n)} según la hora de cada tienda, ${dateLabel(x.t.since, false)}–hoy`,
    hourHead: ["Hora local", "Reposiciones", "Porcentaje"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Que se concentren por la mañana <b className="text-ink">no depende de cuándo abre la tienda</b>{x.us ? " (la mayoría de los Apple Store de EE. UU. abre a las 10:00)" : ""}</> },
      { text: <>Apple libera el stock para recogida <b className="text-ink">online</b>, antes de que abran las puertas</> },
      { text: <>¿Vigilas a mano? Cubre <b className="text-ink">{range(x.w.from, x.w.to)}</b> las mañanas de los días laborables</>, step: true },
      { text: <>Una <Link href={x.alert}>alerta</Link> cubre las <b className="text-ink">22 horas restantes</b>, cuando nadie más está mirando</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Cada página de tienda muestra sus propias horas en su propia zona horaria (<Link href={x.storesHref}>{x.us ? "Apple Store, estado a estado" : `tiendas ${rtD(x)}`}</Link>), así que puedes detectar la tienda que repone a las 8:00 cuando su zona tiene el pico a las 9:00</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{cap(confirmadas(t.n))}{one ? "" : ` en ${tiendas(t.stores)}`} en el único día de seguimiento hasta ahora, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Los ${rtN(t.days)} días de seguimiento tuvieron` : `Desde el ${longDate(t.since)}, ${rtN(t.days)} de ${rtN(tracked)} días tuvieron`} al menos una reposición confirmada{t.peakWeekday != null ? `; el ${wd(t.peakWeekday)} va en cabeza entre los días de la semana` : ""}.</b>
      ) : (
        <b>Cero reposiciones confirmadas {rtW(x)} desde el {longDate(t.since)}.</b>
      );
    },
    daysTracked: "días de seguimiento con alguna reposición",
    busiestDay: (x: RestockTimesView, day: DayRow) => `en el día de más movimiento, ${dateLabel(day.date)}${x.one ? "" : `, en ${tiendas(day.stores)}`}`,
    busiestDayNone: "día de más movimiento",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `tiendas repusieron en la misma media hora, ${zoneStamp(drop.at, x.c)} (${configs(drop.restocks)}): una liberación a escala nacional`,
    weekend: (x: RestockTimesView) => `cayeron en fin de semana (${reposiciones(x.weekend)})`,
    dayCaption: (x: RestockTimesView) => `Reposiciones diarias del iPhone Duo ${rtW(x)}${x.t.reports.length ? "; las filas marcadas «según…» proceden de observaciones publicadas por otros rastreadores antes de que empezara nuestro seguimiento, incluidas solo para la cronología" : ""}`,
    dayHead: { date: "Fecha", restocks: "Reposiciones", stores: "Tiendas", busiest: "Hora punta", source: "Fuente" },
    soFar: " · por ahora",
    reportedBy: (names: string[]) => <>según {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: día del lanzamiento, primeras unidades enviadas a los pedidos online</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: vuelve la recogida en tienda{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Las filas <b className="text-ink">según…</b> son observaciones de {x.reportNames.join(" y ")} en la semana del lanzamiento, fuera de todos los recuentos</> }
        : { text: <>El registro de RestockWire para todas las tiendas {rtD(x)} empieza el <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Para el día de la semana con más movimiento hacen falta <b className="text-ink">{WEEKDAY_MIN_SPAN} días</b> de datos (tenemos {rtN(x.tracked)})</>, no: true }] : []),
      { text: <>Fíjate en la columna <b className="text-ink">tiendas</b>: las reposiciones repartidas entre más tiendas te dan más opciones</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {reposiciones(hit[0].restocks)} en {rtN(hit[0].stores)} de sus {tiendas(hit[0].storesTotal)} desde el {dateLabel(x.t.since, false)}{hit[1] ? <>, seguida de {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> y {hit[2].name} ({rtN(hit[2].restocks)})</> : null}; {rtN(hit.length)} de {rtN(total)} {rnU(x).other} {hit.length === 1 ? "ha" : "han"} visto alguna reposición{total - hit.length > 0 ? `, ${rtN(total - hit.length)} todavía ninguna` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>De momento {rnU(x).f ? "ninguna" : "ningún"} {rnU(x).one} {rtD(x)} tiene una reposición confirmada; la primera pondrá en marcha la tabla.</b>,
    regionCaption: (x: RestockTimesView) => `Reposiciones confirmadas del iPhone Duo por ${rnU(x).one} ${rtW(x)}, del ${dateLabel(x.t.since, false)} a hoy`,
    regionHead: (x: RestockTimesView) => [cap(rnU(x).one), "Reposiciones", "Tiendas con reposición", "La más reciente (hora de la tienda)"],
    ofN: (a: number, b: number) => <>{rtN(a)} de {rtN(b)}</>,
    storesCaption: (x: RestockTimesView) => `Las tiendas con más reposiciones del iPhone Duo ${rtW(x)}, del ${dateLabel(x.t.since, false)} a hoy`,
    storesHead: ["Tienda", "Reposiciones", "Días", "Hora habitual", "Última (hora local)"],
    swaps: (x: RestockTimesView) => [
      { no: "Perseguir la tienda que encabeza la lista, esté donde esté", yes: `Dos o tres tiendas a las que puedas llegar en menos de una hora ${x.pattern ? `hacia ${lasH(x.w.from)}` : "por la mañana"}`, why: "Una reposición fuera de tu alcance no te sirve de nada, y hasta la tienda con más movimiento marca «no disponible» todo el día salvo unos minutos." },
      { no: "Apostarlo todo a una sola tienda", yes: "Una alerta en cada una, y vas a la que avise", why: "Usa la tabla de recuentos solo para decidir a cuál de tus tiendas ir primero." },
    ],
    nearMe: "Stock del Duo cerca de mí, en directo",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} va en cabeza con {rtN(top.restocks)} de las {rtN(x.t.n)} reposiciones ({rtPct(top.restocks / x.t.n)}){rarest ? `; el ${rarest.label} va a la cola con ${reposiciones(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} se repone más que cualquier otra configuración`,
    versus: (a: string, bCount: number, b: string) => `reposiciones de ${a}, frente a ${rtN(bCount)} de ${b}`,
    restocksOf: (a: string) => `reposiciones de ${a}`,
    byStorage: "por capacidad",
    byColour: "por color",
    configNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Ninguna" : "Todavía ninguna"} configuración {rtW(x)} tiene una reposición confirmada; las ocho aparecen en la lista para que la primera reposición tenga ya su fila.</b>,
    configCaption: (x: RestockTimesView) => `Reposiciones confirmadas del iPhone Duo por configuración ${rtW(x)}, del ${dateLabel(x.t.since, false)} a hoy`,
    configHead: ["Configuración", "Reposiciones", "Porcentaje", "La más reciente (hora de la tienda)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Elegir la configuración importa <b className="text-ink">más que elegir la tienda</b></> },
      x.storageRatio != null
        ? { text: <>Si te conformas con la capacidad más repuesta, tus probabilidades son unas <b className="text-ink">{rtN(x.storageRatio)}×</b> las de la siguiente</> }
        : { text: <>Si te conformas con la capacidad más repuesta, tus probabilidades suben <b className="text-ink">mucho</b></> },
      { text: <>El de <b className="text-ink">2TB</b> es para pedirlo con envío a casa y esperar</>, no: true },
      { text: <>Precios y stock en directo: <Link href="/iphone-duo-most-restocked-stores">¿Qué iPhone Duo se repone más? (en inglés)</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{rtN(sell.medianSec)} segundos: la vida mediana de las {rtN(sell.n)} reposiciones agotadas {rtW(x)}; el {rtPct(sell.within2min)} desapareció en menos de 2 minutos y el {rtPct(sell.within20min)}, en menos de 20.</b>,
    secUnit: "s",
    medianListing: "disponibilidad mediana, de que aparece a que se agota",
    within2: "agotadas en menos de 2 minutos",
    within20: "agotadas en menos de 20 minutos",
    fastest: "el agotamiento más rápido registrado",
    howLongNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "No hay" : "Todavía no hay"} suficientes reposiciones agotadas {rtW(x)} para medirlo; estas cifras empiezan a partir de diez, y la página de EE. UU. tiene el conjunto completo.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Dos minutos es una ventana para una <b className="text-ink">alerta</b>, no para darle a recargar en apple.com</> },
      { text: <>Todas las demás cifras de esta página se derivan de esta</> },
      { text: <>Cada reposición y cuántos segundos duró, por configuración y {rnU(x).one}: <Link href="/how-fast-does-iphone-duo-sell-out">¿Cuánto tarda en agotarse una reposición del iPhone Duo? (en inglés)</Link></>, step: true },
    ],
    measured: "Cada cifra va de la comprobación que encontró la configuración disponible por primera vez a la que la encontró agotada, así que es un techo: la duración real es más corta.",

    unavailableLead: (x: RestockTimesView) => <b>Una reposición es un destello, no un estado: {x.one ? "una tienda" : `${rtN(x.stores)} tiendas`} × {rtN(x.configs)} configuraciones dan {rtN(x.pairs)} combinaciones posibles {rtW(x)}, y ahora mismo {rtN(x.duoNow)} {x.duoNow === 1 ? "tienda tiene" : "tiendas tienen"} algún iPhone Duo disponible.</b>,
    pairs: "combinaciones tienda × configuración posibles",
    listingNow: "con un iPhone Duo disponible para recogida ahora mismo",
    goneIn2: "de las reposiciones terminan en menos de dos minutos",
    last24: "reposiciones confirmadas, últimas 24 horas",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Últimas 24 horas: <b className="text-ink">{confirmadas(x.recent.restocks)}</b> en {tiendas(x.recent.stores)} {rtW(x)}</> }
        : today > 0
          ? { text: <>Hoy: <b className="text-ink">{confirmadas(today)}</b> {rtW(x)}</> }
          : { text: <>La tabla día a día de arriba recoge las reposiciones que sí se produjeron</> },
      { text: <>Cada una estuvo en apple.com <b className="text-ink">un minuto o dos</b></> },
      { text: <>Ver «no disponible en ninguna parte» el cuarto día o el decimocuarto <b className="text-ink">no</b> significa que Apple haya dejado de reponer</>, no: true },
    ],
    unavailableLinks: { explained: "«No disponible para recogida», explicado (en inglés)", howToGet: "Cómo conseguir un iPhone Duo, paso a paso (en inglés)" },

    redditLead: (x: RestockTimesView) => <b>Buena parte de los consejos de <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> y <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> son sinceros, se basan en una sola tienda y caducan al día siguiente; abajo, las cuatro afirmaciones que más se repiten, contrastadas con {rtN(x.t.n)} reposiciones confirmadas {rtW(x)}.</b>,
    redditCaption: "Afirmaciones frecuentes en Reddit sobre las reposiciones del iPhone Duo, contrastadas con las reposiciones confirmadas por RestockWire",
    redditHead: ["Afirmación", "Lo que muestra el registro"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«Las tiendas reponen de madrugada: mira a las 3:00.»", answer: t.n > 0 ? <>El {rtPct(hourShare(t.byHour, 0, 6))} de las reposiciones llegó entre las 0:00 y las 6:00, hora local, frente al {rtPct(w.share)} {between(w.from, w.to)}.</> : "Todavía no hay nada registrado con lo que comprobarlo." },
        { claim: "«Apple solo repone un día de la semana.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>El {wd(t.peakWeekday)} va en cabeza por ahora ({rtN(t.byWeekday[t.peakWeekday])} de {rtN(t.n)}), pero hubo reposiciones en {rtN(t.days)} de {rtN(tracked)} días.</> : <>Hubo reposiciones en {rtN(t.days)} de {rtN(tracked)} días de seguimiento{t.days === tracked ? ", sin un solo día sin ellas" : ""}; indicamos el día de la semana con más movimiento tras {WEEKDAY_MIN_SPAN} días de datos.</>) : "Todavía no hay nada registrado con lo que comprobarlo." },
        { claim: "«Llama a la tienda y pregunta cuándo llega el camión.»", answer: "No hay ningún calendario de reposiciones publicado; el stock para recogida se libera online, y la tienda lo ve en el mismo momento que todo el mundo." },
        { claim: "«Si pone no disponible, se ha agotado para siempre.»", answer: recent.restocks > 0 ? <>{cap(confirmadas(recent.restocks))} en {tiendas(recent.stores)} en las últimas 24 horas demuestran lo contrario, y todas volvieron a «no disponible» en cuestión de minutos.</> : t.n > 0 ? <>{cap(confirmadas(t.n))} desde el {dateLabel(t.since, false)} demuestran lo contrario, y todas volvieron a «no disponible» en cuestión de minutos.</> : "Todavía no hay nada registrado con lo que comprobarlo." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Los rumores llenan el hueco cuando <b className="text-ink">no hay datos</b>; esta página son los datos, y leerla es gratis</> },
      { text: <>En algo acierta Reddit: la <b className="text-ink">preparación del pago</b>, con la sesión iniciada y Apple Pay configurado (<Link href="/iphone-duo-restock-checkout-guide">nuestra versión en 20 segundos, en inglés</Link>)</> },
    ],

    methodLead: <b>Una reposición es una configuración que aparece para recogida en tienda en apple.com en una tienda que no la tenía, confirmada por dos comprobaciones coincidentes.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Tiendas con alerta: cada <b className="text-ink">{SPEED.fastSec} segundos</b>; {x.one ? "el Apple Store" : "el resto de Apple Store"} {rtD(x)}: cada <b className="text-ink">{SPEED.checkSec} segundos</b></> },
      { text: <>Intervalos publicados por otros rastreadores: <b className="text-ink">{OTHER}</b>; solo comparamos lo que publican</> },
      { text: <>Un primer «disponible» se vuelve a comprobar <b className="text-ink">aproximadamente un segundo después</b> antes de contar</> },
      { text: <>Una disponibilidad que desaparece se confirma en la <b className="text-ink">ronda siguiente</b></> },
      { text: <>La primera vez que vemos una tienda, una petición fallida, un tiempo de espera agotado: <b className="text-ink">nunca</b> es una reposición ni un «sin stock»</>, no: true },
      { text: <>Todas las horas y fechas van en la <b className="text-ink">hora local</b> de cada tienda; una «oleada» es la misma media hora en distintas zonas horarias</> },
      { text: <>Los informes de otros rastreadores{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} tienen sus propias filas marcadas y quedan <b className="text-ink">fuera de todos los totales</b></> },
      { text: <>Estas tablas se actualizan cada cinco minutos aproximadamente; <Link href={x.logHref}>el registro de reposiciones</Link> es en directo</>, step: true },
    ],
    quote: "Cita esta página: puedes usar cualquier cifra de aquí con un enlace de vuelta. RestockWire es independiente de Apple y lee la misma disponibilidad para recogida que cualquiera puede ver en apple.com, solo que muchísimo más a menudo.",
    alertIn: (x: RestockTimesView) => <>Recibir alertas del iPhone Duo{x.one ? "" : ` ${rtW(x)}`}</>,

    related: "Más preguntas sobre el iPhone Duo",
    sameData: "Con el mismo registro",
    questions: {
      sellOut: "¿Cuánto dura una reposición?",
      alerts: "La forma más rápida de enterarte de una reposición",
      howToGet: "Cómo conseguir uno en la práctica",
      whichConfig: "La configuración que más se repone",
      nearMe: "Stock cerca de mí, en directo",
      unavailable: "«No disponible», explicado",
    },
    otherCountries: ((us: boolean) => (us ? "Esta página en otros países" : "Más países")) as unknown as Dict["views"]["restockTimes"]["otherCountries"],
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "Páginas por ciudad",
      storesLive: (x: RestockTimesView) => `Apple Store ${rtD(x)}: existencias en directo`,
      countryPage: (c: Country) => `Horas de reposición del iPhone Duo ${enPais(c.cc)}, todas las tiendas`,
      sourcesWhere: (x: RestockTimesView) => `las ${x.stores} tiendas Apple ${rtD(x)}`,
    },
    faqTitle: "Preguntas habituales",
  },
};
