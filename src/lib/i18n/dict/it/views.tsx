/**
 * Italian strings: views — product × place pages, the restock log, the live map, the iPhone Duo restock-times page
 * and the store index. `Country`, `Store`, `Product` and `Place` arrive as English data and are named here in Italian;
 * string arguments (`name`, `place`, `region`, `where`, `config`) arrive already in Italian. Model names stay as Apple
 * writes them; a `model` that carries an English colour ("iPhone Duo 256GB Night Sky") is given Apple's Italian one.
 */
import type { ReactNode } from "react";
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
import { distance, fitTitleW, list, pct, price } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import {
  GIORNI, IT, Il, aLuogo, altre, cap, conFuso, dalle, dei, fascia, giorno, giornoLungo, il, ilGiorno, inPaese, inTutto, n as N, nessuna,
  ora, paese, pl, regione, tra, taxNoteIt, tutteLe,
} from "./util";

/* ---------------------------------------------------------------- helpers */

const COLORS = ["Night Sky", "Star White", "Burgundy", "Glacier", "Silver", "Black"];
/** "iPhone Duo 256GB Night Sky" → "iPhone Duo 256GB Cielo notturno". */
const itName = (s: string) => COLORS.reduce((a, c) => a.replace(new RegExp(`\\b${c}\\b`, "g"), colorLabel(c, IT)), s);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const apple = (s: Store) => appleStoreLabel(s, IT);
/** Product names in Italian: model, storage, Apple's Italian colour. */
const pName = (p: Product) => [modelByKey(p.model)!.name, p.storage, p.color ? colorLabel(p.color, IT) : undefined].filter(Boolean).join(" ");
const pShort = (p: Product) => [modelByKey(p.model)!.short, p.storage, p.color ? colorLabel(p.color, IT) : undefined].filter(Boolean).join(" ");
/** A place in Italian (country, region, city or store). */
function placeIt(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return paese(cc);
  if (place.level === "state") return `${regionLabel(cc, place.state ?? place.name, IT)}${cc === "it" ? " e provincia" : ""}`;
  if (place.level === "city") return cityLabel(cc, place.city ?? place.label, IT);
  return apple(place.store!);
}
/** "in Italia", "a Roma", "da Apple Via del Corso". */
function atIt(place: Place): string {
  if (place.level === "country") return inPaese(ccOf(place));
  if (place.level === "store") return `da ${apple(place.store!)}`;
  return aLuogo(placeIt(place));
}
const ha = (k: number) => (k === 1 ? "ha" : "hanno");
/** Whole-percent share of 0–1; under half a percent "<1%", never a misleading "0%". */
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : pct(IT, Math.round(x * 100)));
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "stato" : regione(x.c));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "stati" : regione(x.c, true));
const nounOf = (x: { us: boolean; c: Country }) => (x.us ? { regionNoun: "state" } : x.c);

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = pName(product), short = pShort(product);
  if (place.level === "country") {
    const where = inPaese(ccOf(place));
    return fitTitleW([...(inStock > 0 ? [`${name}: ritirabile ora in ${inStock === 1 ? "1 Apple Store" : `${N(inStock)} Apple Store`} ${where}`] : []), `${name} ${where}: ritiro in negozio, in diretta`, `${name} ${where}: disponibilità per il ritiro`, `${short} ${where}: disponibilità per il ritiro`, `${short}: disponibilità per il ritiro`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([`${name} da ${apple(s)}: ${inStock > 0 ? "ritirabile ora" : "disponibilità e rifornimenti"}`, `${short} da ${apple(s)}: ${inStock > 0 ? "disponibile ora" : "disponibilità"}`, `${short} da ${apple(s)}, ${cityLabel(s.country, s.city, IT)}`, `${short} da ${apple(s)}`, `${short} da ${storeLabel(s, IT)}`, `${short} · ${storeLabel(s, IT)}`]);
  }
  const at = aLuogo(placeIt(place));
  return fitTitleW([...(inStock > 0 ? [`${name} ${at}: ce l'${ha(inStock)} ${N(inStock)} ${inStock === 1 ? "negozio" : "negozi"} su ${N(n)}`] : []), `${name} ${at}: ritiro in negozio, in diretta`, `${short} ${at}: disponibile ora?`, `${short} ${at}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = pName(product);
  const week = `${pl(stats.week, "rifornimento", "rifornimenti")} questa settimana`;
  if (place.level === "store") {
    const s = place.store!;
    const cc = ccOf(place);
    const loc = `${cityLabel(s.country, s.city, IT)}${cc === "us" ? ` ${s.stateCode ?? ""}`.trimEnd() : `, ${paese(cc)}`}`;
    return fitTitleW([
      `${name} da ${apple(s)}, ${loc}: ${inStock > 0 ? "ritirabile all'ultima lettura" : "non ritirabile in questo momento"}, ${week}. Quando rifornisce questo negozio, quanto dura un rifornimento e un avviso per il prossimo.`,
      `${name} da ${apple(s)}: ${inStock > 0 ? "disponibile ora" : "non disponibile ora"}, ${week}. Orari dei rifornimenti e avvisi.`,
    ], 155);
  }
  const where = atIt(place);
  const n = place.stores.length;
  return fitTitleW([
    `${N(inStock)} Apple Store su ${N(n)} ${where} ${ha(inStock)} l'${name} per il ritiro in questo momento, ${week}. Negozio per negozio, con gli orari dei rifornimenti e un avviso sul telefono per il prossimo.`,
    `${name}: ${N(inStock)} Apple Store su ${N(n)} ${where} ce l'${ha(inStock)} ora, ${week}. Per negozio, orari dei rifornimenti, avvisi.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = pName(product);
  const at = atIt(place);
  const cc = ccOf(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} a ${nearest.city}, a ${distance(IT, cc, nearest.distance)}` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `L'${name} è disponibile ${at} in questo momento?`,
      a: l && l.available.length > 0
        ? `Sì${product.parts.length > 1 ? `: ${list(IT, l.available.map((i) => `${i.storage} ${colorLabel(i.color, IT)}`), 4, (k) => `altre ${N(k)}`)}` : ""}, ritirabile all'ultima lettura.`
        : `Non all'ultima lettura${near ? `; il negozio più vicino che ce l'ha è ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `Quali Apple Store ${at} hanno l'${name} in questo momento?`,
      a: inStock.length === 0
        ? `Nessuno all'ultima lettura${near ? `; il più vicino che ce l'ha è ${near}` : ""}.`
        : `${pl(inStock.length, "negozio", "negozi")} all'ultima lettura: ${list(IT, inStock.map((x) => apple(x.store)), 4, (k) => `altri ${N(k)}`)}.`,
    });
  }
  const peak = peakOf(clock, IT);
  out.push({
    q: `Ogni quanto torna l'${name} ${at}?`,
    a: stats.month === 0 ? `Nessun rifornimento confermato ${at} negli ultimi ${N(stats.days)} giorni.` : `${pl(stats.month, "rifornimento confermato", "rifornimenti confermati")} negli ultimi ${N(stats.days)} giorni, ${N(stats.week)} questa settimana${peak ? `, concentrati verso le ${peak.hour} (ora locale)` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Quanto dura un rifornimento di ${name} ${at}?`, a: `Circa ${fmtDuration(stats.medianMs, IT)} (mediana), poi si esaurisce di nuovo.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(IT, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inPaese(c.cc),
    liveMap: "Mappa in diretta",
    restockLog: "Registro dei rifornimenti",
    alertMe: "Ricevi avvisi",
    lastDays: (days: number) => <>{N(days)} giorni, uno per uno</>,
    since: "2 novembre 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `l'Apple Store ${inPaese(c.cc)}` : `tutti i ${N(n)} Apple Store ${inPaese(c.cc)}`),
    checker: (c: Country) => `Disponibilità iPhone ${inPaese(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Store ${inPaese(c.cc)}`,
    storesWithIt: "negozi che lo hanno",
    more: "Vedi altro",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    /** A region in Italy is a province: "a Roma e provincia". */
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `da ${name}` : level === "state" ? `${aLuogo(name)} e provincia` : aLuogo(name)),
    h1Country: (model: string, c: Country) => `${itName(model)}: ritiro in negozio ${inPaese(c.cc)}`,
    h1Place: (model: string, where: string) => `${itName(model)} ${where}`,
    inStockNow: "Ritirabile ora",
    yes: "Sì",
    no: "No",
    pickup: "ritiro",
    configurations: "configurazioni",
    ofStores: (n: number) => `su ${N(n)} ${n === 1 ? "negozio" : "negozi"}`,
    restocks24h: "Rifornimenti, 24 h",
    restocksHint: (week: number, month: number, days: number) => `${N(week)} in 7 g · ${N(month)} in ${N(days)} g`,
    sellOuts: (days: number) => `Esaurimenti ${N(days)} g`,
    stays: (ms: number) => `resta ~${fmtDuration(ms, IT)}`,
    noPairs: "ancora nessun esaurimento abbinato",
    lastRestock: "Rifornimento più recente",
    noneYet: "finora nessuno",
    thisConfig: "questa configurazione",
    inDays: (days: number) => `in ${N(days)} giorni`,
    notInStockNow: "Non ritirabile al momento",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{N(n)}</b> configurazioni su {N(of)} ritirabili</span>,
    inStockAt: (n: number, of: number) => <span>Ritirabile in <b className="text-ink">{N(n)}</b> {n === 1 ? "negozio" : "negozi"} su {N(of)}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>Letto {live} · {p}{tax}</>,
    taxNote: (c: Country) => taxNoteIt(c),
    beforeTax: "tasse escluse",
    buyOnApple: "Ordina su apple.com",
    allStoresIn: (c: Country) => `Ogni negozio ${inPaese(c.cc)}`,
    everyIphoneHere: "Tutti gli iPhone in questo luogo",
    everyIphone: (where: string) => `Tutti gli iPhone ${where}`,
    panel: (model: string, where: string | null) => `${itName(model)}${where ? ` ${where}` : ""}: scegli le configurazioni, poi i negozi`,
    unitConfigs: "configurazioni",
    unitStores: "negozi",
    otherConfigsHere: "Altre configurazioni in questo luogo",
    byStorageColor: "Capacità e colore",
    nearestStores: "I negozi più vicini",
    closest: (link: ReactNode, dist: string) => <>Il negozio più vicino che lo ha: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Ritirabili più di recente",
    storesWithItNow: "Negozi che lo hanno ora",
    storesIn: (where: string) => `Negozi ${where}`,
    colStatus: "stato",
    colConfigs: "configurazioni ritirabili",
    noStoreHasIt: "Al momento nessun negozio lo ha.",
    noStoreHereHasIt: "Al momento nessun negozio di questa zona lo ha.",
    moreStores: (n: number) => <>Altri {N(n)} negozi, ordinati per provincia qui sotto.</>,
    byRegion: (c: Country) => `Per ${regione(c)}`,
    byCity: "Per città",
    nearbyStores: "Negozi nei dintorni",
    latestChanges: "Cambiamenti più recenti",
    nothingLogged: "Il registro per ora è vuoto.",
    whenRestocks: "Orari tipici dei rifornimenti",
    howFast: "Quanto dura un rifornimento",
    restocksByConfig: "Quali configurazioni tornano",
    faqTitleCountry: (model: string, c: Country) => `${itName(model)} ${inPaese(c.cc)}: domande`,
    faqTitle: (model: string, where: string) => `${itName(model)} ${where}`,
    buySource: (model: string, c: Country) => `Apple: pagina d'acquisto di ${itName(model)} (${paese(c.cc)})`,
    nearby: "Qui vicino",
    otherRegions: (c: Country) => altre(c),
    elsewhereIn: (region: string) => `Più lontano, in provincia di ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Store ${inPaese(c.cc)}, elenco completo`,
    across: (model: string, c: Country) => `${itName(model)} ${inTutto(c.cc)}`,
    itemList: (model: string, where: string) => `${itName(model)} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `In questo momento nessun Apple Store ${inPaese(c.cc)} ha l'${itName(model)} ritirabile, quindi «vicino a me» si riduce a capire quale negozio nei dintorni lo rifornisce per primo. Con un avviso su ogni negozio che puoi raggiungere, la notifica arriva sul telefono pochi secondi dopo che uno lo mette a disposizione.`
        : `${inStock === 1 ? "1 negozio" : `${N(inStock)} negozi`} su ${N(n)} ${ha(inStock)} l'${itName(model)} in questo momento: ${list(IT, have.slice(0, 5).map((l) => `${l.store} a ${l.city} (${pl(l.configs, "configurazione", "configurazioni")})`), 5)}.`,
    nearHead: (c: Country) => [cap(regione(c)), "Negozi che lo hanno ora"],
    nearCaption: (c: Country, model: string) => `${itName(model)}: disponibilità per il ritiro per ${regione(c)}, ultima lettura`,
    nearMe: (_c: Country, model: string, alert: string) => `Tocca Vicino a me nella configurazione degli avvisi di questa pagina: ogni negozio viene ordinato a partire da dove ti trovi, per distanza stimata su strada in chilometri, ciascuno con il link alle indicazioni. [Imposta un avviso per l'${itName(model)}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const m = itName(model);
      return {
        price: { q: `Quanto costa l'${m} ${inPaese(c.cc)}?`, a: `Da ${price(IT, c, low)} a ${price(IT, c, high)} su apple.com (${taxNoteIt(c)}), in base alla capacità.` },
        reserve: { q: `Si può prenotare l'${m} per il ritiro ${inPaese(c.cc)}?`, a: `Non in anticipo: quando un negozio mette a disposizione la tua configurazione la ordini su apple.com con il Ritiro in negozio, e Apple la tiene da parte per la tua fascia oraria.${inStock === 0 ? " Al momento nessun negozio ce l'ha, quindi un avviso è il modo per arrivarci per primo." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Rifornimenti iPhone ${inPaese(c.cc)} in diretta: ${n === 1 ? "l'Apple Store" : `${N(n)} Apple Store`}`, `Registro dei rifornimenti iPhone ${inPaese(c.cc)}, in diretta`, `Rifornimenti iPhone ${inPaese(c.cc)}`]),
    metaDescription: (c: Country, n: number) => `Ogni rifornimento confermato di iPhone Duo, 18 Pro e Pro Max per il Ritiro in negozio ${n === 1 ? "nell'Apple Store" : "negli Apple Store"} ${inPaese(c.cc)}: ora, configurazione esatta, mappa.`,
    h1: (c: Country) => `Rifornimenti iPhone ${inPaese(c.cc)}, mentre accadono`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{pl(day, "rifornimento", "rifornimenti")} nelle ultime 24 ore · {N(week)} in 7 giorni{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Gli orari sono nel tuo fuso orario.</>,
    allModels: "Tutti i modelli",
    restocks: "Rifornimenti",
    withSoldOut: "Rifornimenti ed esaurimenti",
    regionLabel: (c: Country) => cap(regione(c)),
    allRegions: (c: Country) => tutteLe(c),
    filter: "Applica",
    page: (k: number) => <>pagina {N(k)}</>,
    newer: "← Più recenti",
    older: "Meno recenti →",
    getAlerts: "Imposta gli avvisi",
    byPlace: "Rifornimenti, luogo per luogo",
    byRegion: (c: Country) => `Per ${regione(c)}`,
    datasetName: (c: Country) => `Rifornimenti iPhone per il Ritiro in negozio negli Apple Store ${inPaese(c.cc)}`,
    datasetDescription: (c: Country) => `Rifornimenti ed esaurimenti confermati di iPhone Duo, iPhone 18 Pro e iPhone 18 Pro Max per il Ritiro in negozio ${c.cc === "us" ? "in tutti i 269 Apple Store degli Stati Uniti" : `negli Apple Store ${inPaese(c.cc)}`}: negozio, configurazione esatta, ora. I negozi vengono letti ogni 15 secondi (ogni 5 secondi dove c'è un avviso), e un rifornimento entra nel registro solo quando apple.com dà la stessa risposta due volte.`,
    datasetMeasured: ["Apple Store", "modello, capacità e colore dell'iPhone", "ora del rifornimento", "ora dell'esaurimento"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Mappa iPhone Duo in diretta: ${n === 1 ? "l'Apple Store" : "ogni Apple Store"} ${inPaese(c.cc)}`, `Mappa iPhone Duo in diretta ${inPaese(c.cc)}`, "Mappa iPhone Duo in diretta"]),
    metaDescription: (c: Country, n: number) => `Dove iPhone Duo, 18 Pro e Pro Max sono ritirabili in negozio adesso: ${n === 1 ? "l'Apple Store" : `tutti i ${N(n)} Apple Store`} ${inPaese(c.cc)} su un'unica mappa in diretta, per capacità e colore.`,
    /** regionNoun stays the English key: the map reads its Italian words from cdict map.nouns. */
    country: (c: Country) => ({ name: paese(c.cc), inName: inPaese(c.cc), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Tutti i negozi",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` per ${regione(c)} e città` : cities > 1 ? " per città" : "";
      return `In questo momento ${N(duo)} hanno l'iPhone Duo e ${N(max)} il Pro Max: disponibilità per il ritiro in diretta in tutti i ${N(n)} Apple Store ${inPaese(c.cc)}${by}, 18 Pro compreso.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${N(n)}, ${spread}${top.length ? `; in testa ${top[0].name} con ${N(top[0].count)}${top[1] ? `, davanti a ${top[1].name} (${N(top[1].count)})` : ""}` : ""}.`,
    howMany: (c: Country) => <>Quanti Apple Store ci sono {inPaese(c.cc)}?</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `Quali Apple Store ${inPaese(c.cc)} hanno l'iPhone Duo in questo momento?`,
      a: have.length === 0 ? `Nessuno ${dei(n)} all'ultima lettura; questa pagina e la mappa cambiano appena uno lo mette a disposizione, e un avviso ti raggiunge prima di entrambe.` : `${N(have.length)} su ${N(n)} all'ultima lettura: ${have.slice(0, 6).map(apple).join(", ")}${have.length > 6 ? " e altri" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, IT),
    duoBlock: (alert: string) => `La strada più rapida per averne uno è un avviso sui negozi che puoi raggiungere: [imposta un avviso per l'iPhone Duo](${alert}). Un avviso copre un negozio × una configurazione esatta, e il telefono lo sa pochi secondi dopo che quel negozio lo mette a disposizione.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `In questo momento **${N(now.duo)}** hanno un iPhone Duo ritirabile, **${N(now.max)}** l'iPhone 18 Pro Max e **${N(now.pro)}** il 18 Pro, su **${N(n)} Apple Store** ${inPaese(c.cc)}, ${spread}. ${tax}`,
    crumb: "Apple Store",
    panel: (c: Country) => `Scegli gli iPhone, poi spunta i negozi ${inPaese(c.cc)} che puoi raggiungere`,
    matrixLabel: "Disponibilità per negozio",
    matrixH2: (c: Country) => <>Disponibilità negozio per negozio {inPaese(c.cc)}</>,
    matrixHint: "Ritirabili ora / monitorati, per ogni modello.",
    topCaption: (c: Country) => <>{cap(regione(c, true))} in ordine di numero di Apple Store (dall&apos;elenco dei negozi Apple, come monitorato qui)</>,
    regionHead: (c: Country) => cap(regione(c)),
    colStores: "Apple Store",
    colCities: "Città",
    locationsBy: (c: Country) => `Dove sono gli Apple Store, ${regione(c)} per ${regione(c)}`,
    locationsIn: (c: Country) => `Tutti gli Apple Store ${inPaese(c.cc)}, indirizzo per indirizzo`,
    storeCount: (n: number) => <>{N(n)} {n > 1 ? "negozi" : "negozio"}</>,
    storeCountAll: (n: number) => <>{N(n)} negozi</>,
    whenRestock: (c: Country) => <>A che ora riforniscono i negozi {inPaese(c.cc)}?</>,
    howFast: (c: Country) => <>Quanto dura un rifornimento {inPaese(c.cc)}?</>,
    faqTitle: (c: Country) => `Apple Store ${inPaese(c.cc)}: domande`,
    getApp: "Scarica l'app",
    howItWorks: "Come funziona",
    pricing: "Prezzi",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: giorno,
      longDate: giornoLungo,
      zoneStamp: conFuso,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, IT),
      hour: ora,
      range: fascia,
      weekday: (d: number) => GIORNI[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${apple(s)} (${cityLabel(s.country, s.city, IT)})`,
    },
    title: (c: Country) => `A che ora Apple rifornisce l'iPhone Duo ${inPaese(c.cc)}?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const where = inPaese(c.cc);
      const region = c.cc === "us" ? "stato" : c.regionNoun ? regione(c) : "negozio";
      const since = giorno(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${pl(t.n, "rifornimento", "rifornimenti")} di iPhone Duo negli Apple Store ${where} dal ${since}: ${il(rtPct(w.share))} ${tra(w.from, w.to)} ora locale${t.sellout ? `, ${il(rtPct(t.sellout.within2min))} sparito entro 2 minuti` : ""}. Tabelle per ora, giorno, ${region}, negozio e configurazione.`,
          `${pl(t.n, "rifornimento", "rifornimenti")} di iPhone Duo negli Apple Store ${where} dal ${since}: ${il(rtPct(w.share))} ${tra(w.from, w.to)} ora locale. Tabelle per ora, giorno, ${region} e configurazione.`,
          `Orari dei rifornimenti di iPhone Duo ${where}: ${N(t.n)} dal ${since}, per ora, giorno, ${region} e configurazione.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${pl(t.n, "rifornimento confermato", "rifornimenti confermati")} di iPhone Duo negli Apple Store ${where} dal ${since}, da controlli ogni 15 secondi: per ora locale, giorno per giorno, per ${region}, negozio e configurazione, e quanto è durato ognuno.`,
            `Orari dei rifornimenti di iPhone Duo ${where}: ${pl(t.n, "rifornimento confermato", "rifornimenti confermati")} dal ${since}, per ora, giorno, ${region} e configurazione.`,
          ], 158)
          : fitTitleW([
            `Orari dei rifornimenti di iPhone Duo negli Apple Store ${where}, ora per ora, giorno per giorno, per negozio e configurazione: RestockWire legge ogni negozio ogni 15 secondi dal ${giornoLungo(t.since)}.`,
            `Orari dei rifornimenti di iPhone Duo ${where}: ogni negozio letto ogni 15 secondi dal ${since}, ora per ora, per negozio e configurazione.`,
          ], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `A che ora Apple rifornisce l'iPhone Duo ${inPaese(x.c.cc)}?`
      : x.t.n > 0
        ? `A che ora Apple rifornisce l'iPhone Duo ${inPaese(x.c.cc)}? ${x.pattern ? `Più spesso ${tra(x.w.from, x.w.to)}, ora locale` : "I nostri controlli, ora per ora"}`
        : `Apple sta rifornendo l'iPhone Duo ${inPaese(x.c.cc)}? Finora no, ed ecco cosa teniamo d'occhio`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = inPaese(x.c.cc);
      return t.unknown ? (
        <>Il registro dei rifornimenti non è disponibile per un momento. I negozi {where} restano sul giro dei 15 secondi, e i numeri tornano al prossimo caricamento della pagina.</>
      ) : t.n > 0 && pattern ? (
        <>
          <b className="text-ink">{Il(rtPct(w.share))} {dei(t.n)} rifornimenti di iPhone Duo</b> che RestockWire ha confermato {one ? "nell'Apple Store" : "negli Apple Store"} {where} dal {giornoLungo(t.since)} è arrivato <b className="text-ink">{tra(w.from, w.to)}</b>, ora locale del negozio{x.sell ? <>; uno tipico è sparito in circa {N(Math.round(x.sell.medianSec / 5) * 5)} secondi</> : null}. <b className="text-ink">I rifornimenti continuano ad arrivare</b>{tracked > 1 ? <>: {N(t.days)} {dei(tracked)} giorni monitorati ne hanno avuto uno</> : <> (finora un solo giorno monitorato)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Sì.</b> <b className="text-ink">{pl(t.n, "rifornimento", "rifornimenti")} di iPhone Duo dal {giornoLungo(t.since)}</b> {one ? "nell'Apple Store" : "negli Apple Store"} {where}{tracked > 1 ? <>, in {N(t.days)} {dei(tracked)} giorni</> : <> (finora un solo giorno monitorato)</>}; indichiamo un orario tipico quando ci sono {PATTERN_MIN} rifornimenti in {PATTERN_MIN_DAYS} giorni diversi.
        </>
      ) : (
        <>
          <b className="text-ink">Finora no.</b> Dal {giornoLungo(t.since)} RestockWire legge {one ? "l'Apple Store" : `tutti i ${N(x.stores)} Apple Store`} {where} ogni 15 secondi senza aver confermato un solo rifornimento di iPhone Duo per il ritiro.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `rifornimenti confermati dal ${giorno(x.t.since, false)}`,
      window: (x: RestockTimesView) => `arrivati ${tra(x.w.from, x.w.to)}, ora locale del negozio`,
      days: "giorni con un rifornimento",
      /** English infers a literal union for this ternary; the cast widens it to Italian text. */
      now: ((one: boolean): string => (one ? "negozio lo ha ritirabile in questo momento" : "negozi lo hanno ritirabile in questo momento")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `finora oggi (${giorno(today.date)})${x.one ? "" : `, in ${pl(today.stores, "negozio", "negozi")}`}`,
      weekday: "il giorno della settimana più intenso finora",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Il più recente: <b className="text-ink">{latest.config}</b>{x.one ? null : <> da <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, IT)} ora locale</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{cap(ilGiorno(x.t.peakWeekday))}</b> ne porta di più</> }] : []),
      { text: <>Non esiste <b className="text-ink">un calendario ufficiale dei rifornimenti</b>; questi numeri sono i nostri controlli confermati, aggiornati circa ogni cinque minuti</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{N(x.duoNow)} su {N(x.stores)}</b> {x.one ? "lo ha" : "lo hanno"} ritirabile in questo momento</> },
      { text: <>Il primo rifornimento confermato avvia tutte le tabelle qui sotto</>, step: true },
      { text: <>Per le tendenze per ora e giorno della settimana sul campione più ampio, vedi <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">la pagina degli Stati Uniti (in inglese)</Link></>, step: true },
    ],
    setUpAlert: "Ricevi avvisi per l'iPhone Duo",
    logLive: "Registro dei rifornimenti in diretta",
    onThisPage: "Sezioni",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Ora",
      "day-by-day": "Giorni",
      where: `Per ${rtRegion(x)}`,
      configuration: "Configurazioni",
      "how-long": "Velocità di esaurimento",
      unavailable: "«Non disponibile»",
      reddit: "Le voci su Reddit",
      method: "Metodo",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `A che ora torna l'iPhone Duo ${inPaese(x.c.cc)}?`,
      "day-by-day": `In quali giorni è tornato l'iPhone Duo ${inPaese(x.c.cc)}?`,
      where: `Dove ${inPaese(x.c.cc)} torna più spesso l'iPhone Duo?`,
      configuration: `Quali capacità e colori di iPhone Duo tornano di più ${inPaese(x.c.cc)}?`,
      "how-long": `Quanti secondi dura un rifornimento di iPhone Duo ${inPaese(x.c.cc)}?`,
      unavailable: "Perché apple.com dice «al momento non disponibile» in ogni negozio?",
      reddit: "Le teorie di Reddit sui rifornimenti di iPhone Duo, verificate con il registro",
      method: "Che cosa conta come rifornimento per RestockWire?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = inPaese(x.c.cc);
      return [
        { q: `Quando rifornisce Apple l'iPhone Duo ${where}?`, a: t.n > 0 && pattern
          ? `${cap(tra(w.from, w.to))}, ora locale del negozio, è arrivato ${il(rtPct(w.share))} ${dei(t.n)} rifornimenti confermati dal ${giornoLungo(t.since)}, e tra le 8:00 e mezzogiorno ${il(rtPct(hourShare(t.byHour, 8, 12)))}. Non esiste un calendario ufficiale; questa è la tendenza che osserva RestockWire, aggiornata circa ogni cinque minuti.`
          : `RestockWire ha registrato ${pl(t.n, "rifornimento confermato", "rifornimenti confermati")} ${where} dal ${giornoLungo(t.since)}${t.days ? `, in ${pl(t.days, "giorno", "giorni")}` : ""}, e Apple non annuncia alcun calendario. Quando ci saranno ${PATTERN_MIN} rifornimenti in ${PATTERN_MIN_DAYS} giorni diversi, questa pagina indicherà da sola un orario tipico.` },
        { q: `I rifornimenti di iPhone Duo arrivano anche nel fine settimana${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Sì" : "Finora no"}: ${pl(weekend, "rifornimento", "rifornimenti")} su ${N(t.n)} (${rtPct(weekend / t.n)}) di sabato o di domenica. ${t.peakWeekday != null ? `Il giorno più intenso finora è ${GIORNI[t.peakWeekday]}.` : `Indichiamo il giorno più intenso solo quando i dati coprono ${WEEKDAY_MIN_SPAN} giorni; per ora ne coprono ${N(tracked)}.`}`
          : `Finora non ci sono dati sul fine settimana ${where}; la tabella dei giorni di questa pagina cresce con ogni rifornimento confermato.` },
        { q: "Quando conviene iniziare a guardare apple.com?", a: t.n > 0 && pattern
          ? `A mano, tieni aperto apple.com con il ritiro selezionato ${dalle(w.from)} ora locale; quella fascia di due ore raccoglie ${il(rtPct(w.share))} dei rifornimenti. Un rifornimento tipico ${sell ? `è sparito entro ${N(sell.medianSec)} secondi (mediana)` : "dura circa un minuto"}, ed è per questo che un avviso sul giro dei 5 secondi ([come funzionano gli avvisi](/iphone-duo-restock-alerts)) batte qualsiasi quantità di ricariche.`
          : `Mentre la tendenza ${where} si sta ancora formando, un avviso può guardare al posto tuo: i negozi che scegli passano sul giro dei 5 secondi, giorno e notte ([come funzionano gli avvisi](/iphone-duo-restock-alerts)).` },
        { q: "Perché l'iPhone Duo risulta «non disponibile» in ogni Apple Store?", a: sell
          ? `I rifornimenti sono brevi: ${dei(sell.n)} rifornimenti esauriti misurati ${where}, ${il(rtPct(sell.within2min))} è sparito entro 2 minuti e ${il(rtPct(sell.within20min))} entro 20. In questo momento ${N(x.duoNow)} negozi su ${N(x.stores)} lo hanno, quindi quasi sempre apple.com dice il vero con «non disponibile», anche nei giorni con decine di rifornimenti ([cosa significa «non disponibile»](/apple-store-pickup-explained)).`
          : `La disponibilità per il ritiro compare per pochi minuti alla volta; in questo momento ${N(x.duoNow)} su ${pl(x.stores, "negozio", "negozi")} ${where} lo hanno ([cosa significa «non disponibile»](/apple-store-pickup-explained)).` },
        { q: "Posso ricevere una notifica quando il mio Apple Store ha di nuovo l'iPhone Duo?", a: `Sì: un avviso su quel negozio con capacità e colore esatti lo sposta sul giro dei 5 secondi, e il telefono lo sa circa 3 secondi dopo un rifornimento confermato ([imposta un avviso](${x.alert}); [come funziona](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: assistenza Consegna e ritiro (come funziona la disponibilità per il ritiro)",
      newsroom: "Apple Newsroom (in inglese): iPhone Duo arriva negli Apple Store di tutto il mondo (23 ottobre 2026)",
      macRumors: "MacRumors (in inglese): il sistema di ritiro negli Apple Store per l'iPhone Duo è tornato attivo negli Stati Uniti e in Canada (24 ottobre 2026)",
      reports: (tracker: string) => `${tracker}: segnalazioni di rifornimenti di iPhone Duo nella settimana del lancio (osservazioni loro, tenute a parte e mai conteggiate)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Orari dei rifornimenti di iPhone Duo per il Ritiro in negozio, Apple Store ${inPaese(x.c.cc)}`,
      description: `Rifornimenti confermati di iPhone Duo per il Ritiro in negozio negli Apple Store ${inPaese(x.c.cc)} dal ${giornoLungo(x.t.since)} (negozio, configurazione, ora), da RestockWire che legge ogni negozio ogni 15 secondi; raggruppati per ora locale, giorno, ${rtRegion(x)}, negozio e configurazione.`,
      spatial: `Apple Store ${inPaese(x.c.cc)}`,
      measured: ["ora del rifornimento (ora locale del negozio)", "Apple Store", "capacità e colore dell'iPhone Duo", "secondi prima dell'esaurimento"],
      size: `${pl(x.t.n, "rifornimento", "rifornimenti")} in ${pl(x.t.stores, "negozio", "negozi")}`,
    }),
    crumb: "Orari dei rifornimenti iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{cap(tra(x.w.from, x.w.to))}, ora locale del negozio, è arrivato {il(rtPct(x.w.share))} {dei(x.t.n)} rifornimenti; tra le 8:00 e mezzogiorno {il(rtPct(hourShare(x.t.byHour, 8, 12)))}.</b>,
    busiestHour: (count: number) => `${pl(count, "rifornimento", "rifornimenti")} nell'ora più intensa`,
    morning: "tra le 8:00 e mezzogiorno",
    evening: "dopo le 17:00, quindi anche la sera conta",
    night: "tra mezzanotte e le 6:00",
    tooFew: (x: RestockTimesView) => (x.t.n > 0
      ? <b>Troppo pochi giorni per indicare un orario: {pl(x.t.n, "rifornimento confermato", "rifornimenti confermati")} in {pl(x.t.days, "giorno", "giorni")} dal {giornoLungo(x.t.since)}.</b>
      : <b>Ancora troppo pochi giorni per indicare un orario: nessun rifornimento confermato dal {giornoLungo(x.t.since)}.</b>),
    tooFewKeys: (): Point[] => [
      { text: <>Per indicare un orario tipico servono <b className="text-ink">{PATTERN_MIN} rifornimenti in {PATTERN_MIN_DAYS} giorni diversi</b></> },
      { text: <>Una raffica di dieci rifornimenti è un singolo evento, non un&apos;abitudine</>, no: true },
      { text: <>Ogni nuovo giorno di dati aggiorna questa pagina da solo</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${pl(x.t.n, "rifornimento", "rifornimenti")} di iPhone Duo ${inPaese(x.c.cc)} per ora locale del negozio, dal ${giorno(x.t.since, false)} a oggi`,
    hourHead: ["Ora locale", "Rifornimenti", "Quota"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>Il picco del mattino <b className="text-ink">non c&apos;entra con l&apos;orario di apertura</b>{x.us ? " (quasi tutti gli Apple Store degli Stati Uniti aprono alle 10:00)" : ""}</> },
      { text: <>Apple rilascia la disponibilità per il ritiro <b className="text-ink">online</b>, prima che aprano le porte</> },
      { text: <>Guardi a mano? Copri la fascia <b className="text-ink">{fascia(x.w.from, x.w.to)}</b> la mattina dei giorni feriali</>, step: true },
      { text: <>Un <Link href={x.alert}>avviso</Link> copre le <b className="text-ink">altre 22 ore</b>, quando nessun altro sta guardando</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Ogni pagina di negozio mostra i propri orari nel proprio fuso (<Link href={x.storesHref}>{x.us ? "Apple Store per stato" : `negozi ${inPaese(x.c.cc)}`}</Link>), così puoi trovare il negozio che rifornisce alle 8:00 quando la sua zona ha il picco alle 9:00</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      if (t.n > 0 && tracked === 1) return <b>{pl(t.n, "rifornimento confermato", "rifornimenti confermati")}{one ? "" : ` in ${pl(t.stores, "negozio", "negozi")}`} nell&apos;unico giorno monitorato finora, {giorno(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>;
      if (t.n > 0) {
        const days = t.days === tracked ? `Tutti i ${N(t.days)} giorni monitorati hanno portato` : `${N(t.days)} ${dei(tracked)} giorni dal ${giornoLungo(t.since)} ${t.days === 1 ? "ha portato" : "hanno portato"}`;
        return <b>{days} almeno un rifornimento confermato{t.peakWeekday != null ? `; tra i giorni della settimana è in testa ${ilGiorno(t.peakWeekday)}` : ""}.</b>;
      }
      return <b>Zero rifornimenti confermati {inPaese(x.c.cc)} dal {giornoLungo(t.since)}.</b>;
    },
    daysTracked: "giorni monitorati con un rifornimento",
    busiestDay: (x: RestockTimesView, day: DayRow) => `nel giorno più intenso, ${giorno(day.date)}${x.one ? "" : `, in ${pl(day.stores, "negozio", "negozi")}`}`,
    busiestDayNone: "giorno più intenso",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `negozi riforniti nella stessa mezz'ora, ${conFuso(drop.at, x.c)} (${pl(drop.restocks, "configurazione", "configurazioni")}): un rilascio nazionale`,
    weekend: (x: RestockTimesView) => `arrivati nel fine settimana (${pl(x.weekend, "rifornimento", "rifornimenti")})`,
    dayCaption: (x: RestockTimesView) => `Rifornimenti giornalieri di iPhone Duo ${inPaese(x.c.cc)}${x.t.reports.length ? "; le righe «segnalato» vengono da osservazioni pubblicate da altri tracker prima dell'inizio del nostro monitoraggio, incluse solo per la cronologia" : ""}`,
    dayHead: { date: "Data", restocks: "Rifornimenti", stores: "Negozi", busiest: "Ora più intensa", source: "Fonte" },
    soFar: " · finora",
    reportedBy: (names: string[]) => <>secondo {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{giorno(launch)}</b>: giorno del lancio, prime unità spedite agli ordini online</> },
      { text: <><b className="text-ink">{giorno(resumed)}</b>: torna il Ritiro in negozio{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Le righe <b className="text-ink">«segnalato»</b> sono osservazioni della settimana del lancio di {list(IT, x.reportNames)}, escluse da ogni conteggio</> }
        : { text: <>Il registro di RestockWire per ogni negozio {inPaese(x.c.cc)} parte dal <b className="text-ink">{giornoLungo(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Per il giorno della settimana più intenso servono <b className="text-ink">{WEEKDAY_MIN_SPAN} giorni</b> di dati (ne abbiamo {N(x.tracked)})</>, no: true }] : []),
      { text: <>Guarda la colonna <b className="text-ink">negozi</b>: rifornimenti distribuiti su più negozi ti danno più probabilità</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {pl(hit[0].restocks, "rifornimento", "rifornimenti")} {hit[0].storesTotal === 1 ? "nel suo unico negozio" : `in ${N(hit[0].stores)} dei suoi ${N(hit[0].storesTotal)} negozi`} dal {giorno(x.t.since, false)}{hit[1] ? <>, poi {hit[1].name} ({N(hit[1].restocks)})</> : null}{hit[2] ? <> e {hit[2].name} ({N(hit[2].restocks)})</> : null}; {hit.length === 1 ? `1 ${rtRegion(x)} su ${N(total)} ha visto` : `${N(hit.length)} ${rtRegions(x)} su ${N(total)} hanno visto`} un rifornimento{total - hit.length > 0 ? `, ${N(total - hit.length)} ancora nessuno` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Finora {nessuna(nounOf(x))} {inPaese(x.c.cc)} ha un rifornimento confermato; il primo avvia la tabella.</b>,
    regionCaption: (x: RestockTimesView) => `Rifornimenti confermati di iPhone Duo per ${rtRegion(x)} ${inPaese(x.c.cc)}, dal ${giorno(x.t.since, false)} a oggi`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Rifornimenti", "Negozi riforniti", "Ultimo rifornimento (ora locale)"],
    ofN: (a: number, b: number) => <>{N(a)} su {N(b)}</>,
    storesCaption: (x: RestockTimesView) => `I negozi con più rifornimenti di iPhone Duo ${inPaese(x.c.cc)}, dal ${giorno(x.t.since, false)} a oggi`,
    storesHead: ["Negozio", "Rifornimenti", "Giorni", "Ora tipica", "Ultimo (ora locale)"],
    swaps: (x: RestockTimesView) => [
      { no: "Inseguire il primo negozio della lista, per quanto lontano", yes: `Due o tre negozi raggiungibili entro un'ora, pronti ${x.pattern ? dalle(x.w.from) : "dal mattino"}`, why: "Un rifornimento fuori portata non ti serve, e anche il negozio più attivo risulta non disponibile per tutto il giorno tranne pochi minuti." },
      { no: "Puntare su un solo negozio", yes: "Un avviso su ciascuno, poi vai dove scatta", why: "Usa la tabella dei conteggi solo per decidere in quale dei tuoi negozi andare per primo." },
    ],
    nearMe: "Duo vicino a me, in diretta",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>In testa {top.label}, con {N(top.restocks)} {dei(x.t.n)} rifornimenti ({rtPct(top.restocks / x.t.n)}){rarest ? `; in coda ${rarest.label}, con ${pl(rarest.restocks, "rifornimento", "rifornimenti")}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} torna più di qualsiasi altra configurazione`,
    versus: (a: string, bCount: number, b: string) => `rifornimenti di ${a}, contro ${N(bCount)} di ${b}`,
    restocksOf: (a: string) => `rifornimenti di ${a}`,
    byStorage: "per capacità",
    byColour: "per colore",
    configNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Nessuna" : "Ancora nessuna"} configurazione {inPaese(x.c.cc)} ha un rifornimento confermato; sono elencate tutte e {N(x.configs)}, così il primo rifornimento trova la sua riga pronta.</b>,
    configCaption: (x: RestockTimesView) => `Rifornimenti confermati di iPhone Duo per configurazione ${inPaese(x.c.cc)}, dal ${giorno(x.t.since, false)} a oggi`,
    configHead: ["Configurazione", "Rifornimenti", "Quota", "Ultimo rifornimento (ora locale)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Scegliere la configurazione conta <b className="text-ink">più che scegliere il negozio</b></> },
      x.storageRatio != null
        ? { text: <>Accontentati della capacità che torna più spesso e le tue probabilità sono circa <b className="text-ink">{N(x.storageRatio)}×</b> quelle della capacità successiva</> }
        : { text: <>Accontentati della capacità che torna più spesso e le tue probabilità salgono <b className="text-ink">nettamente</b></> },
      { text: <>Il <b className="text-ink">2TB</b> conviene ordinarlo con consegna e aspettare</>, no: true },
      { text: <>Prezzi e disponibilità in diretta: <Link href="/iphone-duo-most-restocked-stores">Quale iPhone Duo torna più spesso?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{N(sell.medianSec)} secondi: la vita mediana {dei(sell.n)} rifornimenti esauriti {inPaese(x.c.cc)}; {il(rtPct(sell.within2min))} è sparito entro 2 minuti e {il(rtPct(sell.within20min))} entro 20.</b>,
    secUnit: "s",
    medianListing: "durata mediana, dalla comparsa all'esaurimento",
    within2: "spariti entro 2 minuti",
    within20: "spariti entro 20 minuti",
    fastest: "l'esaurimento più rapido registrato",
    howLongNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Troppo" : "Ancora troppo"} pochi rifornimenti esauriti {inPaese(x.c.cc)} per misurarlo; questi numeri partono da dieci, e la pagina degli Stati Uniti ha il quadro completo.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Due minuti sono una finestra per un <b className="text-ink">avviso</b>, non per ricaricare apple.com</> },
      { text: <>Tutti gli altri numeri di questa pagina discendono da questo</> },
      { text: <>Ogni rifornimento e quanti secondi è durato, per configurazione e {rtRegion(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">In quanto tempo si esaurisce un rifornimento di iPhone Duo?</Link></>, step: true },
    ],
    measured: "Ogni dato va dal controllo che ha trovato per primo la configurazione disponibile a quello che l'ha trovata sparita, quindi è un tetto massimo: le durate reali sono più brevi.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Un rifornimento è un lampo, non uno stato: {x.one ? "un negozio" : `${N(x.stores)} negozi`} × {N(x.configs)} configurazioni fanno {N(x.pairs)} disponibilità possibili {inPaese(x.c.cc)}, e in questo momento {x.duoNow === 1 ? "1 negozio ha" : `${N(x.duoNow)} negozi hanno`} un iPhone Duo qualsiasi.</b>,
    pairs: "disponibilità possibili negozio × configurazione",
    listingNow: "con un iPhone Duo ritirabile in questo momento",
    goneIn2: "dei rifornimenti finiti entro due minuti",
    last24: "rifornimenti confermati, ultime 24 ore",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Ultime 24 ore: <b className="text-ink">{pl(x.recent.restocks, "rifornimento confermato", "rifornimenti confermati")}</b> in {pl(x.recent.stores, "negozio", "negozi")} {inPaese(x.c.cc)}</> }
        : today > 0
          ? { text: <>Oggi: <b className="text-ink">{pl(today, "rifornimento confermato", "rifornimenti confermati")}</b> {inPaese(x.c.cc)}</> }
          : { text: <>La tabella dei giorni qui sopra elenca i rifornimenti che ci sono stati</> },
      { text: <>Ognuno è rimasto su apple.com per <b className="text-ink">un minuto o due</b></> },
      { text: <>Vedere «non disponibile ovunque» al quarto o al quattordicesimo giorno <b className="text-ink">non</b> vuol dire che Apple ha smesso</>, no: true },
    ],
    unavailableLinks: { explained: "«Al momento non disponibile per il ritiro», spiegato", howToGet: "Come avere un iPhone Duo, passo per passo" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Molti consigli su <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> e <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> sono onesti, basati su un solo negozio e superati il giorno dopo; qui sotto le quattro affermazioni più frequenti, messe alla prova con {pl(x.t.n, "rifornimento confermato", "rifornimenti confermati")} {inPaese(x.c.cc)}.</b>,
    redditCaption: "Affermazioni frequenti su Reddit sui rifornimenti di iPhone Duo, verificate con i rifornimenti confermati da RestockWire",
    redditHead: ["Affermazione", "Cosa mostra il registro"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«I negozi riforniscono di notte: controlla alle 3.»", answer: t.n > 0 ? <>{Il(rtPct(hourShare(t.byHour, 0, 6)))} dei rifornimenti è arrivato tra mezzanotte e le 6:00 ora locale, contro {il(rtPct(w.share))} {tra(w.from, w.to)}.</> : "Ancora niente nel registro per verificarlo." },
        { claim: "«Apple rifornisce solo in un giorno della settimana.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>Finora è in testa {ilGiorno(t.peakWeekday)} ({N(t.byWeekday[t.peakWeekday])} su {N(t.n)}), ma i rifornimenti sono arrivati in {N(t.days)} giorni su {N(tracked)}.</> : <>I rifornimenti sono arrivati in {N(t.days)} giorni monitorati su {N(tracked)}{t.days === tracked ? ", nemmeno uno senza" : ""}; indichiamo il giorno più intenso dopo {WEEKDAY_MIN_SPAN} giorni di dati.</>) : "Ancora niente nel registro per verificarlo." },
        { claim: "«Chiama il negozio e chiedi quando arriva il camion.»", answer: "Non esiste un calendario dei rifornimenti pubblicato; la disponibilità per il ritiro viene rilasciata online, e il negozio la vede nello stesso momento di tutti gli altri." },
        { claim: "«Se dice non disponibile, è esaurito per sempre.»", answer: recent.restocks > 0 ? <>{pl(recent.restocks, "rifornimento confermato", "rifornimenti confermati")} in {pl(recent.stores, "negozio", "negozi")} nelle ultime 24 ore {recent.restocks === 1 ? "dimostra il contrario, ed è tornato" : "dimostrano il contrario, e ognuno è tornato"} «non disponibile» nel giro di pochi minuti.</> : t.n > 0 ? <>{pl(t.n, "rifornimento confermato", "rifornimenti confermati")} dal {giorno(t.since, false)} {t.n === 1 ? "dimostra il contrario, ed è tornato" : "dimostrano il contrario, e ognuno è tornato"} «non disponibile» nel giro di pochi minuti.</> : "Ancora niente nel registro per verificarlo." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Le voci riempiono il vuoto quando <b className="text-ink">mancano i dati</b>; questa pagina sono i dati, e leggerla è gratis</> },
      { text: <>Su una cosa Reddit ha ragione: la <b className="text-ink">preparazione al pagamento</b>, accesso fatto e Apple Pay impostato (<Link href="/iphone-duo-restock-checkout-guide">la nostra versione in 20 secondi</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Un rifornimento è una configurazione che compare per il Ritiro in negozio su apple.com in un negozio che prima non l&apos;aveva, confermata da due controlli concordanti.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Negozi con un avviso: ogni <b className="text-ink">5 secondi</b>; {x.one ? "l'Apple Store" : "ogni Apple Store"} {inPaese(x.c.cc)}: ogni <b className="text-ink">15 secondi</b></> },
      { text: <>Intervalli pubblicati da altri tracker: <b className="text-ink">da 8 secondi a 15 minuti</b>; confrontiamo solo ciò che pubblicano</> },
      { text: <>Un primo «disponibile» viene ricontrollato <b className="text-ink">circa un secondo dopo</b> prima di contare</> },
      { text: <>Una disponibilità sparita viene confermata al <b className="text-ink">giro successivo</b></> },
      { text: <>Il primo avvistamento di un negozio, una richiesta fallita, un timeout: <b className="text-ink">mai</b> un rifornimento e mai «esaurito»</>, no: true },
      { text: <>Ore e date sono sempre nell&apos;<b className="text-ink">ora locale</b> di ogni negozio; un&apos;«ondata» è la stessa mezz&apos;ora in fusi diversi</> },
      { text: <>Le segnalazioni di altri tracker{x.t.reports.length ? ` (${list(IT, x.reportNames)})` : ""} hanno righe proprie, etichettate, e sono <b className="text-ink">escluse da ogni totale</b></> },
      { text: <>Queste tabelle si aggiornano circa ogni cinque minuti; <Link href={x.logHref}>il registro dei rifornimenti</Link> è in diretta</>, step: true },
    ],
    quote: "Cita questa pagina: riprendi qualsiasi numero con un link a questa pagina. RestockWire è indipendente da Apple e legge la stessa disponibilità per il ritiro che chiunque vede su apple.com, solo molto più spesso.",
    alertIn: (x: RestockTimesView) => <>Ricevi avvisi per l&apos;iPhone Duo{x.one ? "" : ` ${inPaese(x.c.cc)}`}</>,

    // ---- related, FAQ, sources
    related: "Altre domande sull'iPhone Duo",
    sameData: "Dallo stesso registro",
    questions: {
      sellOut: "Quanto dura un rifornimento?",
      alerts: "Il modo più rapido per sapere di un rifornimento",
      howToGet: "Averne uno, in pratica",
      whichConfig: "La configurazione che torna più spesso",
      nearMe: "Disponibilità vicino a me, in diretta",
      unavailable: "«Non disponibile», spiegato",
    },
    otherCountries: ((us: boolean): string => (us ? "Questa pagina per altri paesi" : "Altri paesi")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Domande frequenti",
  },
};
