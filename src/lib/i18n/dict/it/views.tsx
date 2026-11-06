/**
 * Italian view strings (product × place pages, restock log, live map, restock-times page, store index).
 * Data objects (Country, Store, Product, Place) come in English and get their Italian names here; plain string
 * arguments are already Italian. Model names follow Apple; English colour names inside a `model` are swapped for
 * Apple's Italian colour names.
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

/* ===== section: helpers */

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
/** Locative for a page's place: country, city or region, or "da" + store. */
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

/* ===== section: product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = pName(product), short = pShort(product);
  if (place.level === "country") {
    const where = inPaese(ccOf(place));
    return fitTitleW([...(inStock > 0 ? [`${name}: ritirabile ora in ${inStock === 1 ? "1 Apple Store" : `${N(inStock)} Apple Store`} ${where}`] : []), `${name} ${where}: ritiro in negozio, live`, `${name} ${where}: dove ritirarlo`, `${short} ${where}: dove ritirarlo`, `${short}: dove ritirarlo`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([`${name} da ${apple(s)}: ${inStock > 0 ? "ritirabile ora" : "disponibilità e rifornimenti"}`, `${short} da ${apple(s)}: ${inStock > 0 ? "disponibile ora" : "disponibilità"}`, `${short} da ${apple(s)}, ${cityLabel(s.country, s.city, IT)}`, `${short} da ${apple(s)}`, `${short} da ${storeLabel(s, IT)}`, `${short} · ${storeLabel(s, IT)}`]);
  }
  const at = aLuogo(placeIt(place));
  return fitTitleW([...(inStock > 0 ? [`${name} ${at}: ce l'${ha(inStock)} ${N(inStock)} ${inStock === 1 ? "negozio" : "negozi"} su ${N(n)}`] : []), `${name} ${at}: ritiro in negozio, live`, `${short} ${at}: c'è adesso?`, `${short} ${at}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = pName(product);
  const week = `${pl(stats.week, "rifornimento", "rifornimenti")} in settimana`;
  if (place.level === "store") {
    const s = place.store!;
    const cc = ccOf(place);
    const loc = `${cityLabel(s.country, s.city, IT)}${cc === "us" ? ` ${s.stateCode ?? ""}`.trimEnd() : `, ${paese(cc)}`}`;
    return fitTitleW([
      `${name} da ${apple(s)}, ${loc}: ${inStock > 0 ? "ritirabile all'ultima lettura" : "non ritirabile in questo momento"}, ${week}. Quando rifornisce questo negozio, quanto dura un rifornimento e un avviso per il prossimo.`,
      `${name} da ${apple(s)}: ${inStock > 0 ? "ritirabile adesso" : "adesso non ritirabile"}, ${week}. Ore tipiche dei rifornimenti, avvisi.`,
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
  const nearName = nearest ? (/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`) : "";
  const near = nearest ? `${nearName} (${nearest.city}, ${distance(IT, cc, nearest.distance)})` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `L'${name} è disponibile ${at} in questo momento?`,
      a: l && l.available.length > 0
        ? `Sì, all'ultimo controllo${product.parts.length > 1 ? `, in queste versioni: ${list(IT, l.available.map((i) => `${i.storage} ${colorLabel(i.color, IT)}`), 4, (k) => `altre ${N(k)}`)}` : ""}.`
        : `No, non all'ultimo controllo${near ? `. Il più vicino che ce l'ha: ${near}` : ""}.`,
    });
  } else {
    out.push({
      q: `${cap(at)}, dove si ritira l'${name} adesso?`,
      a: inStock.length === 0
        ? `In nessun negozio, all'ultimo controllo${near ? `. Il più vicino che ce l'ha: ${near}` : ""}.`
        : `All'ultimo controllo, in ${pl(inStock.length, "negozio", "negozi")}: ${list(IT, inStock.map((x) => apple(x.store)), 4, (k) => `altri ${N(k)}`)}.`,
    });
  }
  const peak = peakOf(clock, IT);
  out.push({
    q: `Con che frequenza viene rifornito l'${name} ${at}?`,
    a: stats.month === 0 ? `${N(stats.days)} giorni senza rifornimenti confermati ${at}.` : `In ${N(stats.days)} giorni ${pl(stats.month, "rifornimento confermato", "rifornimenti confermati")}, di cui ${N(stats.week)} in settimana${peak ? `; l'ora più frequente sono le ${peak.hour}, ora del negozio` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Quando l'${name} torna ${at}, quanto resta in vendita?`, a: `Mediana: ${fmtDuration(stats.medianMs, IT)}, poi è di nuovo esaurito.` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(IT, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ===== section: views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inPaese(c.cc),
    liveMap: "Mappa live",
    restockLog: "Diario dei rifornimenti",
    alertMe: "Ricevi avvisi",
    lastDays: (days: number) => <>{N(days)} giorni, uno per uno</>,
    since: "2 novembre 2026",
    sourcesWhere: (n: number, c: Country) => (n === 1 ? `l'Apple Store ${inPaese(c.cc)}` : `i ${N(n)} Apple Store ${inPaese(c.cc)}, nessuno escluso`),
    checker: (c: Country) => `Disponibilità iPhone ${inPaese(c.cc)}`,
    appleStoresIn: (c: Country) => `Apple Store ${inPaese(c.cc)}`,
    storesWithIt: "negozi che lo hanno",
    more: "Vedi altro",
  },

  /* ===== section: /in-stock/{product}/{place…} */
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
    thisConfig: "la configurazione scelta",
    inDays: (days: number) => `in ${N(days)} giorni`,
    notInStockNow: "Non ritirabile al momento",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{N(n)}</b> configurazioni su {N(of)} ritirabili</span>,
    inStockAt: (n: number, of: number) => <span>Ritiro possibile in <b className="text-ink">{N(n)}</b> su {N(of)} {of === 1 ? "negozio" : "negozi"}</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>Letto {live} · {p}{tax}</>,
    taxNote: (c: Country) => taxNoteIt(c),
    beforeTax: "imposte escluse",
    buyOnApple: "Ordina su apple.com",
    allStoresIn: (c: Country) => `Ogni negozio ${inPaese(c.cc)}`,
    everyIphoneHere: "Tutti gli iPhone in questo luogo",
    everyIphone: (where: string) => `Ogni iPhone ${where}`,
    panel: (model: string, where: string | null) => `${itName(model)}${where ? ` ${where}` : ""}: scegli le configurazioni, poi i negozi`,
    unitConfigs: "configurazioni",
    unitStores: "negozi",
    otherConfigsHere: "Altre configurazioni in questo luogo",
    byStorageColor: "Capacità e colore",
    nearestStores: "Negozi a portata",
    closest: (link: ReactNode, dist: string) => <>Più vicino con disponibilità: {link} · {dist}</>,
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
    faqTitle: (model: string, where: string) => `${itName(model)} ${where}: le risposte`,
    buySource: (model: string, c: Country) => `Store Apple ${paese(c.cc)}: acquisto ${itName(model)}`,
    nearby: "Qui vicino",
    otherRegions: (c: Country) => altre(c),
    elsewhereIn: (region: string) => `Più lontano, in provincia di ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Store ${inPaese(c.cc)}, elenco completo`,
    across: (model: string, c: Country) => `${itName(model)}, ${inTutto(c.cc)}`,
    itemList: (model: string, where: string) => `${itName(model)} ${where}: i negozi`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `Zero Apple Store ${inPaese(c.cc)} con l'${itName(model)} ritirabile, adesso. «Vicino a me» diventa allora una gara: quale negozio intorno a te si rifornisce per primo. Metti un avviso su ciascuno che puoi raggiungere e il telefono suona pochi secondi dopo il rifornimento.`
        : `L'${itName(model)} è ritirabile adesso in ${inStock === 1 ? "1 negozio" : `${N(inStock)} negozi`} su ${N(n)}: ${list(IT, have.slice(0, 5).map((l) => `${l.store}, ${l.city} (${pl(l.configs, "configurazione", "configurazioni")})`), 5)}.`,
    nearHead: (c: Country) => [cap(regione(c)), "Negozi che lo hanno ora"],
    nearCaption: (c: Country, model: string) => `${itName(model)}, ${regione(c)} per ${regione(c)}: negozi con ritiro all'ultimo controllo`,
    nearMe: (_c: Country, model: string, alert: string) => `Nel pannello avvisi di questa pagina c'è «Vicino a me»: i negozi si mettono in fila dal più vicino, con i chilometri stimati su strada e il link al percorso. [Avviso per l'${itName(model)}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const m = itName(model);
      return {
        price: { q: `${cap(inPaese(c.cc))}, che prezzo ha l'${m}?`, a: `Su apple.com da ${price(IT, c, low)} a ${price(IT, c, high)}, secondo la capacità (${taxNoteIt(c)}).` },
        reserve: { q: `L'${m} si prenota in anticipo per il ritiro ${inPaese(c.cc)}?`, a: `No. Si ordina su apple.com con il Ritiro in negozio solo quando un negozio ha la tua configurazione; Apple poi la tiene per la fascia oraria scelta.${inStock === 0 ? " Adesso nessun negozio ce l'ha: con un avviso arrivi tra i primi." : ""}` },
      };
    },
  },

  /* ===== section: /restock-log */
  restocks: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Rifornimenti iPhone ${inPaese(c.cc)}, live da ${n === 1 ? "l'Apple Store" : `${N(n)} Apple Store`}`, `iPhone ${inPaese(c.cc)}: diario live dei rifornimenti`, `Rifornimenti iPhone ${inPaese(c.cc)}`]),
    metaDescription: (c: Country, n: number) => `Ogni rifornimento confermato di iPhone Duo, 18 Pro e Pro Max per il Ritiro in negozio ${n === 1 ? "nell'Apple Store" : "negli Apple Store"} ${inPaese(c.cc)}: ora, configurazione esatta, mappa.`,
    h1: (c: Country) => `Rifornimenti iPhone ${inPaese(c.cc)}, mentre accadono`,
    summary: (day: number, week: number, model?: string, region?: string) => <>Ultime 24 ore: {pl(day, "rifornimento", "rifornimenti")} · 7 giorni: {N(week)}{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Orari nel tuo fuso.</>,
    allModels: "Tutti i modelli",
    restocks: "Rifornimenti",
    withSoldOut: "Rifornimenti ed esaurimenti",
    regionLabel: (c: Country) => cap(regione(c)),
    allRegions: (c: Country) => tutteLe(c),
    filter: "Applica",
    page: (k: number) => <>pagina {N(k)}</>,
    newer: "← Più recenti",
    older: "Più vecchi →",
    getAlerts: "Imposta gli avvisi",
    byPlace: "Dove sono tornati gli iPhone",
    byRegion: (c: Country) => `Per ${regione(c)}`,
    datasetName: (c: Country) => `Apple Store ${inPaese(c.cc)}: rifornimenti iPhone per il Ritiro in negozio`,
    datasetDescription: (c: Country) => `Ogni rifornimento ed esaurimento confermato di iPhone Duo, iPhone 18 Pro e iPhone 18 Pro Max per il Ritiro in negozio ${c.cc === "us" ? "nei 269 Apple Store degli Stati Uniti, nessuno escluso" : `negli Apple Store ${inPaese(c.cc)}`}, con negozio, configurazione esatta e ora. I negozi vengono letti ogni 15 secondi (ogni 5 secondi dove c'è un avviso), e un rifornimento entra nel registro solo quando apple.com dà la stessa risposta due volte.`,
    datasetMeasured: ["negozio Apple", "iPhone: modello, capacità, colore", "momento del ritorno in vendita", "momento dell'esaurimento"],
  },

  /* ===== section: /live-map */
  map: {
    metaTitle: (c: Country, n: number) => fitTitleW([`Mappa iPhone Duo in diretta: ${n === 1 ? "l'Apple Store" : "ogni Apple Store"} ${inPaese(c.cc)}`, `Mappa iPhone Duo in diretta ${inPaese(c.cc)}`, "Mappa iPhone Duo in diretta"]),
    metaDescription: (c: Country, n: number) => `Dove iPhone Duo, 18 Pro e Pro Max sono ritirabili in negozio adesso: ${n === 1 ? "l'Apple Store" : `tutti i ${N(n)} Apple Store`} ${inPaese(c.cc)} su un'unica mappa in diretta, per capacità e colore.`,
    /** regionNoun stays the English key: the map reads its Italian words from cdict map.nouns. */
    country: (c: Country) => ({ name: paese(c.cc), inName: inPaese(c.cc), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Tutti i negozi",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ===== section: /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `, divisi per ${regione(c)} e città` : cities > 1 ? ", divisi per città" : "";
      return `iPhone Duo ritirabile adesso in ${N(duo)} negozi, Pro Max in ${N(max)}. Stato live dei ${N(n)} Apple Store ${inPaese(c.cc)}${by}, con il 18 Pro.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${N(n)}, ${spread}${top.length ? `; in testa ${top[0].name} con ${N(top[0].count)}${top[1] ? `, davanti a ${top[1].name} (${N(top[1].count)})` : ""}` : ""}.`,
    howMany: (c: Country) => <>{cap(inPaese(c.cc))}, quanti sono gli Apple Store?</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `Dove si ritira l'iPhone Duo ${inPaese(c.cc)} adesso?`,
      a: have.length === 0 ? `Nessuno ${dei(n)} all'ultima lettura; questa pagina e la mappa cambiano appena uno lo mette a disposizione, e un avviso ti raggiunge prima di entrambe.` : `${N(have.length)} su ${N(n)} all'ultima lettura: ${have.slice(0, 6).map(apple).join(", ")}${have.length > 6 ? " e altri" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, IT),
    duoBlock: (alert: string) => `La strada più rapida per averne uno è un avviso sui negozi che puoi raggiungere: [imposta un avviso per l'iPhone Duo](${alert}). Un avviso copre un negozio × una configurazione esatta, e il telefono lo sa pochi secondi dopo che quel negozio lo mette a disposizione.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `In questo momento **${N(now.duo)}** hanno un iPhone Duo ritirabile, **${N(now.max)}** l'iPhone 18 Pro Max e **${N(now.pro)}** il 18 Pro, su **${N(n)} Apple Store** ${inPaese(c.cc)}, ${spread}. ${tax}`,
    crumb: "Negozi Apple",
    panel: (c: Country) => `Prima gli iPhone, poi i negozi ${inPaese(c.cc)} alla tua portata`,
    matrixLabel: "Negozio per negozio",
    matrixH2: (c: Country) => <>Disponibilità negozio per negozio {inPaese(c.cc)}</>,
    matrixHint: "Ritirabili ora / monitorati, per ogni modello.",
    topCaption: (c: Country) => <>{cap(regione(c, true))} in classifica per numero di Apple Store (fonte: elenco negozi di Apple, come lo seguiamo noi)</>,
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
    howItWorks: "Il metodo",
    pricing: "Prezzi",
  },

  /* ===== section: /when-does-iphone-duo-restock */
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
          `iPhone Duo ${where}: ${il(rtPct(w.share))} dei ${N(t.n)} rifornimenti dal ${since} cade ${tra(w.from, w.to)}, ora del negozio${t.sellout ? `; ${il(rtPct(t.sellout.within2min))} finisce in 2 minuti` : ""}. Dati per ora, giorno, ${region}, negozio, versione.`,
          `iPhone Duo ${where}: ${il(rtPct(w.share))} dei ${N(t.n)} rifornimenti dal ${since} cade ${tra(w.from, w.to)}, ora del negozio. Dati per ora, giorno, ${region} e versione.`,
          `Quando torna l'iPhone Duo ${where}: ${N(t.n)} rifornimenti dal ${since}, divisi per ora, giorno, ${region}, versione.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `iPhone Duo ${where}, dal ${since}: ${pl(t.n, "rifornimento confermato", "rifornimenti confermati")} dai controlli ogni 15 secondi. Ora del negozio, giorni, ${region}, negozi, versioni e durata di ciascuno.`,
            `Quando torna l'iPhone Duo ${where}: ${pl(t.n, "rifornimento confermato", "rifornimenti confermati")} dal ${since}, divisi per ora, giorno, ${region}, versione.`,
          ], 158)
          : fitTitleW([
            `Dal ${giornoLungo(t.since)} RestockWire controlla ogni Apple Store ${where} ogni 15 secondi in attesa dell'iPhone Duo. Qui i rifornimenti per ora, giorno, negozio e versione.`,
            `iPhone Duo ${where}: controllo di ogni negozio ogni 15 secondi dal ${since}; rifornimenti per ora, negozio e versione.`,
          ], 158);
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `A che ora Apple rifornisce l'iPhone Duo ${inPaese(x.c.cc)}?`
      : x.t.n > 0
        ? `A che ora Apple rifornisce l'iPhone Duo ${inPaese(x.c.cc)}? ${x.pattern ? `Più spesso ${tra(x.w.from, x.w.to)}, ora locale` : "I nostri controlli, ora per ora"}`
        : `iPhone Duo ${inPaese(x.c.cc)}: ancora nessun rifornimento, e come lo stiamo aspettando`,
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
      restocks: (x: RestockTimesView) => `ritorni verificati due volte, dal ${giorno(x.t.since, false)}`,
      window: (x: RestockTimesView) => `caduti ${tra(x.w.from, x.w.to)} (ora del negozio)`,
      days: "giorni con un rifornimento",
      /** English infers a literal union for this ternary; the cast widens it to Italian text. */
      now: ((one: boolean): string => (one ? "negozio lo ha ritirabile in questo momento" : "negozi lo hanno ritirabile in questo momento")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `finora oggi (${giorno(today.date)})${x.one ? "" : `, in ${pl(today.stores, "negozio", "negozi")}`}`,
      weekday: "giorno della settimana in testa, per ora",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Il più recente: <b className="text-ink">{latest.config}</b>{x.one ? null : <> da <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, IT)} ora locale</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{cap(ilGiorno(x.t.peakWeekday))}</b> ne porta di più</> }] : []),
      { text: <>Apple <b className="text-ink">non pubblica un calendario</b> dei rifornimenti: qui ci sono solo i nostri controlli confermati, ricalcolati ogni cinque minuti circa</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{N(x.duoNow)} su {N(x.stores)}</b> {x.one ? "lo ha" : "lo hanno"} ritirabile in questo momento</> },
      { text: <>Il primo rifornimento confermato avvia tutte le tabelle qui sotto</>, step: true },
      { text: <>Andamento per ora e per giorno su molti più dati: <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">la pagina USA (in inglese)</Link></>, step: true },
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
      "how-long": `iPhone Duo ${inPaese(x.c.cc)}: quanti secondi resta in vendita dopo un rifornimento?`,
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
        { q: `Sabato e domenica l'iPhone Duo torna${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "Sì" : "Finora no"}: ${pl(weekend, "rifornimento", "rifornimenti")} su ${N(t.n)} (${rtPct(weekend / t.n)}) di sabato o di domenica. ${t.peakWeekday != null ? `Il giorno più intenso finora è ${GIORNI[t.peakWeekday]}.` : `Indichiamo il giorno più intenso solo quando i dati coprono ${WEEKDAY_MIN_SPAN} giorni; per ora ne coprono ${N(tracked)}.`}`
          : `Finora non ci sono dati sul fine settimana ${where}; la tabella dei giorni di questa pagina cresce con ogni rifornimento confermato.` },
        { q: "Quando conviene iniziare a guardare apple.com?", a: t.n > 0 && pattern
          ? `Se controlli a mano, apri apple.com sul ritiro ${dalle(w.from)} (ora del negozio): in quelle due ore cade ${il(rtPct(w.share))} dei ritorni. Ma ${sell ? `la mediana è di ${N(sell.medianSec)} secondi prima dell'esaurimento` : "in genere tutto finisce in un minuto"}: un avviso sul giro dei 5 secondi ([come funzionano gli avvisi](/iphone-duo-restock-alerts)) vale più di cento ricariche.`
          : `Mentre la tendenza ${where} si sta ancora formando, un avviso può guardare al posto tuo: i negozi che scegli passano sul giro dei 5 secondi, giorno e notte ([come funzionano gli avvisi](/iphone-duo-restock-alerts)).` },
        { q: "Perché l'iPhone Duo risulta «non disponibile» in ogni Apple Store?", a: sell
          ? `I rifornimenti sono brevi: ${dei(sell.n)} rifornimenti esauriti misurati ${where}, ${il(rtPct(sell.within2min))} è sparito entro 2 minuti e ${il(rtPct(sell.within20min))} entro 20. In questo momento ${N(x.duoNow)} negozi su ${N(x.stores)} lo hanno, quindi quasi sempre apple.com dice il vero con «non disponibile», anche nei giorni con decine di rifornimenti ([cosa significa «non disponibile»](/apple-store-pickup-explained)).`
          : `La disponibilità per il ritiro compare per pochi minuti alla volta; in questo momento ${N(x.duoNow)} su ${pl(x.stores, "negozio", "negozi")} ${where} lo hanno ([cosa significa «non disponibile»](/apple-store-pickup-explained)).` },
        { q: "Posso ricevere una notifica quando il mio Apple Store ha di nuovo l'iPhone Duo?", a: `Sì: un avviso su quel negozio con capacità e colore esatti lo sposta sul giro dei 5 secondi, e il telefono lo sa circa 3 secondi dopo un rifornimento confermato ([imposta un avviso](${x.alert}); [come funziona](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: assistenza Consegna e ritiro (come funziona la disponibilità per il ritiro)",
      newsroom: "Apple Newsroom, 23 ottobre 2026 (in inglese): l'iPhone Duo entra negli Apple Store del mondo",
      macRumors: "MacRumors, 24 ottobre 2026 (in inglese): negli Stati Uniti e in Canada riparte il ritiro in negozio dell'iPhone Duo",
      reports: (tracker: string) => `${tracker}: rifornimenti di iPhone Duo segnalati nella settimana del lancio (dati loro, separati, mai sommati ai nostri)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `Apple Store ${inPaese(x.c.cc)}: quando torna l'iPhone Duo per il Ritiro in negozio`,
      description: `Dal ${giornoLungo(x.t.since)}, ogni rifornimento confermato di iPhone Duo per il Ritiro in negozio negli Apple Store ${inPaese(x.c.cc)}, con negozio, versione e ora. Fonte: i controlli di RestockWire, uno ogni 15 secondi per negozio. Raggruppati per ora del negozio, giorno, ${rtRegion(x)}, negozio e versione.`,
      spatial: `Apple Store ${inPaese(x.c.cc)}`,
      measured: ["momento del rifornimento, ora del negozio", "negozio Apple", "iPhone Duo: capacità e colore", "durata in secondi fino all'esaurimento"],
      size: `${pl(x.t.n, "rifornimento", "rifornimenti")} in ${pl(x.t.stores, "negozio", "negozi")}`,
    }),
    crumb: "Quando torna l'iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>Fascia {fascia(x.w.from, x.w.to)} (ora del negozio): {il(rtPct(x.w.share))} {dei(x.t.n)} rifornimenti. Mattina, 8:00–12:00: {il(rtPct(hourShare(x.t.byHour, 8, 12)))}.</b>,
    busiestHour: (count: number) => `${pl(count, "rifornimento", "rifornimenti")} nell'ora più intensa`,
    morning: "nella fascia 8:00–12:00",
    evening: "dalle 17:00 in poi: la sera non è tempo perso",
    night: "nella fascia 0:00–6:00",
    tooFew: (x: RestockTimesView) => (x.t.n > 0
      ? <b>Orario tipico non ancora calcolabile: dal {giornoLungo(x.t.since)}, {pl(x.t.n, "rifornimento confermato", "rifornimenti confermati")} su {pl(x.t.days, "giorno", "giorni")}.</b>
      : <b>Orario tipico non ancora calcolabile: dal {giornoLungo(x.t.since)}, zero rifornimenti confermati.</b>),
    tooFewKeys: (): Point[] => [
      { text: <>Un orario tipico arriva solo con <b className="text-ink">{PATTERN_MIN} rifornimenti su {PATTERN_MIN_DAYS} giorni diversi</b></> },
      { text: <>Una raffica di dieci rifornimenti è un singolo evento, non un&apos;abitudine</>, no: true },
      { text: <>Ogni nuovo giorno di dati aggiorna questa pagina da solo</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `iPhone Duo ${inPaese(x.c.cc)}, ${giorno(x.t.since, false)}–oggi: ${pl(x.t.n, "rifornimento", "rifornimenti")}, fascia per fascia (ora del negozio)`,
    hourHead: ["Ora locale", "Rifornimenti", "Quota"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>L&apos;orario di apertura <b className="text-ink">non spiega</b> il picco della mattina{x.us ? " (negli Stati Uniti quasi tutti gli Apple Store aprono alle 10:00)" : ""}</> },
      { text: <>Apple rilascia la disponibilità per il ritiro <b className="text-ink">online</b>, prima che aprano le porte</> },
      { text: <>Controlli a mano? Tieni d&apos;occhio <b className="text-ink">{fascia(x.w.from, x.w.to)}</b>, nelle mattine dei giorni feriali</>, step: true },
      { text: <>Per le <b className="text-ink">altre 22 ore</b>, quando non guarda nessuno, c&apos;è l&apos;<Link href={x.alert}>avviso</Link></>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Ogni pagina di negozio mostra i propri orari nel proprio fuso (<Link href={x.storesHref}>{x.us ? "negozi stato per stato" : `negozi ${inPaese(x.c.cc)}`}</Link>), così puoi trovare il negozio che rifornisce alle 8:00 quando la sua zona ha il picco alle 9:00</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      if (t.n > 0 && tracked === 1) return <b>{pl(t.n, "rifornimento confermato", "rifornimenti confermati")}{one ? "" : `, ${pl(t.stores, "negozio", "negozi")} coinvolti,`} nel solo giorno monitorato finora, {giorno(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>;
      if (t.n > 0) {
        const days = t.days === tracked ? `Nessun giorno a vuoto: ${N(t.days)} su ${N(t.days)} monitorati` : `Dal ${giornoLungo(t.since)}, ${N(t.days)} giorni su ${N(tracked)}`;
        return <b>{days} con almeno un rifornimento confermato{t.peakWeekday != null ? `; in testa ${ilGiorno(t.peakWeekday)}` : ""}.</b>;
      }
      return <b>Zero rifornimenti confermati {inPaese(x.c.cc)} dal {giornoLungo(t.since)}.</b>;
    },
    daysTracked: "giorni monitorati con almeno un ritorno",
    busiestDay: (x: RestockTimesView, day: DayRow) => `giornata record: ${giorno(day.date)}${x.one ? "" : `, ${pl(day.stores, "negozio", "negozi")} coinvolti`}`,
    busiestDayNone: "giorno record",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `negozi riforniti in una sola mezz'ora, ${conFuso(drop.at, x.c)}: ${pl(drop.restocks, "configurazione", "configurazioni")}, rilascio su scala nazionale`,
    weekend: (x: RestockTimesView) => `di sabato o domenica (${pl(x.weekend, "rifornimento", "rifornimenti")})`,
    dayCaption: (x: RestockTimesView) => `iPhone Duo ${inPaese(x.c.cc)}, giorno per giorno${x.t.reports.length ? ". Righe «segnalato»: dati pubblicati da altri tracker prima che partissimo, messi lì solo come cronologia" : ""}`,
    dayHead: { date: "Giorno", restocks: "Ritorni", stores: "Negozi coinvolti", busiest: "Ora di punta", source: "Fonte" },
    soFar: " · finora",
    reportedBy: (names: string[]) => <>secondo {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{giorno(launch)}</b>: lancio, le prime unità partono verso gli ordini online</> },
      { text: <><b className="text-ink">{giorno(resumed)}</b>: torna il Ritiro in negozio{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Le righe <b className="text-ink">«segnalato»</b> sono osservazioni della settimana del lancio di {list(IT, x.reportNames)}, escluse da ogni conteggio</> }
        : { text: <>Il registro di RestockWire per ogni negozio {inPaese(x.c.cc)} parte dal <b className="text-ink">{giornoLungo(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Per il giorno della settimana più intenso servono <b className="text-ink">{WEEKDAY_MIN_SPAN} giorni</b> di dati (ne abbiamo {N(x.tracked)})</>, no: true }] : []),
      { text: <>Guarda la colonna <b className="text-ink">negozi</b>: rifornimenti distribuiti su più negozi ti danno più probabilità</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>In testa {hit[0].name}, con {pl(hit[0].restocks, "rifornimento", "rifornimenti")} dal {giorno(x.t.since, false)} {hit[0].storesTotal === 1 ? "nel suo unico negozio" : `(${N(hit[0].stores)} negozi su ${N(hit[0].storesTotal)})`}{hit[1] ? <>; segue {hit[1].name} con {N(hit[1].restocks)}</> : null}{hit[2] ? <>, quindi {hit[2].name} con {N(hit[2].restocks)}</> : null}. Con almeno un rifornimento: {hit.length === 1 ? `1 ${rtRegion(x)} su ${N(total)}` : `${N(hit.length)} ${rtRegions(x)} su ${N(total)}`}{total - hit.length > 0 ? `; a secco ${N(total - hit.length)}` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Finora {nessuna(nounOf(x))} {inPaese(x.c.cc)} ha un rifornimento confermato; il primo avvia la tabella.</b>,
    regionCaption: (x: RestockTimesView) => `iPhone Duo ${inPaese(x.c.cc)}, ${rtRegion(x)} per ${rtRegion(x)}: rifornimenti confermati, ${giorno(x.t.since, false)}–oggi`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Ritorni", "Negozi coinvolti", "Più recente (ora del negozio)"],
    ofN: (a: number, b: number) => <>{N(a)} su {N(b)}</>,
    storesCaption: (x: RestockTimesView) => `Classifica dei negozi ${inPaese(x.c.cc)} per rifornimenti di iPhone Duo, ${giorno(x.t.since, false)}–oggi`,
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
    versus: (a: string, bCount: number, b: string) => `ritorni per ${a}; ${b} ne ha ${N(bCount)}`,
    restocksOf: (a: string) => `ritorni per ${a}`,
    byStorage: "capacità a confronto",
    byColour: "colori a confronto",
    configNone: (x: RestockTimesView) => <b>{x.t.n > 0 ? "Nessuna" : "Ancora nessuna"} configurazione {inPaese(x.c.cc)} ha un rifornimento confermato; sono elencate tutte e {N(x.configs)}, così il primo rifornimento trova la sua riga pronta.</b>,
    configCaption: (x: RestockTimesView) => `iPhone Duo ${inPaese(x.c.cc)}, versione per versione: rifornimenti confermati, ${giorno(x.t.since, false)}–oggi`,
    configHead: ["Capacità e colore", "Ritorni", "Quota", "Più recente (ora del negozio)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Scegliere la configurazione conta <b className="text-ink">più che scegliere il negozio</b></> },
      x.storageRatio != null
        ? { text: <>Capacità più frequente contro la seconda: circa <b className="text-ink">{N(x.storageRatio)}×</b> le probabilità</> }
        : { text: <>Prendi la capacità che torna più spesso: le probabilità salgono <b className="text-ink">parecchio</b></> },
      { text: <>Vuoi il <b className="text-ink">2TB</b>? Meglio la consegna a casa, con un po&apos; di attesa</>, no: true },
      { text: <>Prezzi e stato live: <Link href="/iphone-duo-most-restocked-stores">l&apos;iPhone Duo che torna più spesso</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{N(sell.medianSec)} secondi: la vita mediana {dei(sell.n)} rifornimenti esauriti {inPaese(x.c.cc)}; {il(rtPct(sell.within2min))} è sparito entro 2 minuti e {il(rtPct(sell.within20min))} entro 20.</b>,
    secUnit: "s",
    medianListing: "durata mediana, dalla comparsa all'esaurimento",
    within2: "spariti entro 2 minuti",
    within20: "spariti entro 20 minuti",
    fastest: "record: l'esaurimento più veloce",
    howLongNone: (x: RestockTimesView) => <b>Misura non ancora possibile {inPaese(x.c.cc)}: servono almeno dieci rifornimenti esauriti{x.t.n > 0 ? "" : ", e per ora non ce n'è nessuno"}. Il quadro completo è sulla pagina USA.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Due minuti sono una finestra per un <b className="text-ink">avviso</b>, non per ricaricare apple.com</> },
      { text: <>Tutti gli altri numeri di questa pagina discendono da questo</> },
      { text: <>Durata in secondi di ogni rifornimento, per versione e {rtRegion(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">quanto resta in vendita l&apos;iPhone Duo</Link></>, step: true },
    ],
    measured: "Ogni durata parte dal controllo che vede per primo la configurazione e finisce con quello che la trova esaurita: è un massimo, la durata vera è più corta.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>Un rifornimento è un lampo, non uno stato: {x.one ? "un negozio" : `${N(x.stores)} negozi`} × {N(x.configs)} configurazioni fanno {N(x.pairs)} disponibilità possibili {inPaese(x.c.cc)}, e in questo momento {x.duoNow === 1 ? "1 negozio ha" : `${N(x.duoNow)} negozi hanno`} un iPhone Duo qualsiasi.</b>,
    pairs: "disponibilità possibili negozio × configurazione",
    listingNow: "con un iPhone Duo ritirabile in questo momento",
    goneIn2: "dei rifornimenti esauriti in 2 minuti",
    last24: "rifornimenti confermati, ultime 24 ore",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>{cap(inPaese(x.c.cc))}, nelle ultime 24 ore: <b className="text-ink">{pl(x.recent.restocks, "rifornimento confermato", "rifornimenti confermati")}</b>, {pl(x.recent.stores, "negozio", "negozi")} coinvolti</> }
        : today > 0
          ? { text: <>{cap(inPaese(x.c.cc))}, da stamattina: <b className="text-ink">{pl(today, "rifornimento confermato", "rifornimenti confermati")}</b></> }
          : { text: <>I rifornimenti avvenuti sono nella tabella dei giorni, qui sopra</> },
      { text: <>Ognuno è rimasto su apple.com per <b className="text-ink">un minuto o due</b></> },
      { text: <>«Non disponibile ovunque» al giorno 4 o al giorno 14 <b className="text-ink">non</b> significa che Apple ha chiuso i rubinetti</>, no: true },
    ],
    unavailableLinks: { explained: "«Al momento non disponibile per il ritiro», spiegato", howToGet: "Come avere un iPhone Duo, passo per passo" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Quattro voci che girano su <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> e <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>, contro {pl(x.t.n, "rifornimento confermato", "rifornimenti confermati")} {inPaese(x.c.cc)}. Sono consigli in buona fede, ma nati da un solo negozio e vecchi già il giorno dopo.</b>,
    redditCaption: "Voci di Reddit sui rifornimenti di iPhone Duo, messe contro il registro di RestockWire",
    redditHead: ["Affermazione", "Cosa mostra il registro"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«La merce arriva di notte, puntate la sveglia alle 3.»", answer: t.n > 0 ? <>Fascia 0:00–6:00, ora del negozio: {il(rtPct(hourShare(t.byHour, 0, 6)))} dei rifornimenti. Fascia {fascia(w.from, w.to)}: {il(rtPct(w.share))}.</> : "Il registro è ancora vuoto: niente da verificare." },
        { claim: "«C'è un solo giorno a settimana in cui Apple rifornisce.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>Finora è in testa {ilGiorno(t.peakWeekday)} ({N(t.byWeekday[t.peakWeekday])} su {N(t.n)}), ma i rifornimenti sono arrivati in {N(t.days)} giorni su {N(tracked)}.</> : <>I rifornimenti sono arrivati in {N(t.days)} giorni monitorati su {N(tracked)}{t.days === tracked ? ", nemmeno uno senza" : ""}; indichiamo il giorno più intenso dopo {WEEKDAY_MIN_SPAN} giorni di dati.</>) : "Il registro è ancora vuoto: niente da verificare." },
        { claim: "«Telefona al negozio e fatti dire quando arriva il furgone.»", answer: "Un calendario pubblico dei rifornimenti non c'è. Il ritiro viene aperto online e il personale del negozio lo scopre insieme a tutti." },
        { claim: "«Non disponibile vuol dire finito, punto.»", answer: recent.restocks > 0 ? <>{pl(recent.restocks, "rifornimento confermato", "rifornimenti confermati")} in {pl(recent.stores, "negozio", "negozi")} nelle ultime 24 ore {recent.restocks === 1 ? "dimostra il contrario, ed è tornato" : "dimostrano il contrario, e ognuno è tornato"} «non disponibile» nel giro di pochi minuti.</> : t.n > 0 ? <>{pl(t.n, "rifornimento confermato", "rifornimenti confermati")} dal {giorno(t.since, false)} {t.n === 1 ? "dimostra il contrario, ed è tornato" : "dimostrano il contrario, e ognuno è tornato"} «non disponibile» nel giro di pochi minuti.</> : "Il registro è ancora vuoto: niente da verificare." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Le voci riempiono il vuoto quando <b className="text-ink">mancano i dati</b>; questa pagina sono i dati, e leggerla è gratis</> },
      { text: <>Su una cosa Reddit ha ragione: la <b className="text-ink">preparazione al pagamento</b>, accesso fatto e Apple Pay impostato (<Link href="/iphone-duo-restock-checkout-guide">il nostro checkout da 20 secondi</Link>)</> },
    ],

    // ---- method
    methodLead: <b>Un rifornimento è una configurazione che compare per il Ritiro in negozio su apple.com in un negozio che prima non l&apos;aveva, confermata da due controlli concordanti.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Negozi con un avviso: ogni <b className="text-ink">5 secondi</b>; {x.one ? "l'Apple Store" : "ogni Apple Store"} {inPaese(x.c.cc)}: ogni <b className="text-ink">15 secondi</b></> },
      { text: <>Altri tracker: intervalli pubblicati <b className="text-ink">tra 8 secondi e 15 minuti</b>. Niente confronti senza un numero pubblico</> },
      { text: <>Ogni primo «disponibile» passa un secondo controllo <b className="text-ink">a un secondo di distanza</b>, prima di finire nei conti</> },
      { text: <>Se una disponibilità sparisce, lo conferma <b className="text-ink">il giro dopo</b></> },
      { text: <>Il primo avvistamento di un negozio, una richiesta fallita, un timeout: <b className="text-ink">mai</b> un rifornimento e mai «esaurito»</>, no: true },
      { text: <>Ora e data seguono sempre il <b className="text-ink">fuso del negozio</b>; un&apos;«ondata» = stessa mezz&apos;ora, fusi diversi</> },
      { text: <>Dati di altri tracker{x.t.reports.length ? ` (${list(IT, x.reportNames)})` : ""}: righe separate ed etichettate, <b className="text-ink">fuori da ogni totale</b></> },
      { text: <>Queste tabelle si aggiornano circa ogni cinque minuti; <Link href={x.logHref}>il diario dei rifornimenti</Link> invece è live</>, step: true },
    ],
    quote: "Cita questa pagina: riprendi qualsiasi numero con un link a questa pagina. RestockWire è indipendente da Apple e legge la stessa disponibilità per il ritiro che chiunque vede su apple.com, solo molto più spesso.",
    alertIn: (x: RestockTimesView) => <>Avvisi per l&apos;iPhone Duo{x.one ? "" : ` ${inPaese(x.c.cc)}`}</>,

    // ---- related, FAQ, sources
    related: "iPhone Duo: altre risposte",
    sameData: "Dallo stesso registro",
    questions: {
      sellOut: "Quanto dura un rifornimento?",
      alerts: "Il modo più rapido per sapere di un rifornimento",
      howToGet: "Averne uno, in pratica",
      whichConfig: "La configurazione che torna più spesso",
      nearMe: "Disponibilità vicino a me, in diretta",
      unavailable: "«Non disponibile», spiegato",
    },
    otherCountries: ((us: boolean): string => (us ? "La stessa pagina, altri paesi" : "Altri paesi")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "Domande frequenti",
  },
};
