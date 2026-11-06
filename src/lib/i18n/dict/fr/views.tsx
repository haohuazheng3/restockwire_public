/**
 * Chaînes françaises : views — pages produit × lieu, journal des retours en stock, carte en direct, page « Quand
 * Apple réapprovisionne-t-il l’iPhone Duo ? » et index des magasins. Mêmes arguments et mêmes formes que l’anglais.
 * Les objets Product / Place / Store / Country arrivent en données anglaises : ils sont nommés ici en français
 * (places.ts) ; les chaînes `name`, `place`, `region`, `city` arrivent déjà en français.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { RestockTimesMeta } from "../en/views";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, PlaceLevel, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { distance, fitTitleW, hour, list, num, pct, plural, price, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import { IN, NAME, L, cap, dans, noun } from "./util";
import { taxNote } from "./place";

/* ---------------------------------------------------------------- French names for English data */

const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
/** "iPhone Duo 512GB Night Sky" → "iPhone Duo 512GB Ciel nocturne". */
const fx = (s: string) => COLORS.reduce((a, c) => a.replace(new RegExp(`\\b${c}\\b`, "g"), colorLabel(c, "fr")), s);
const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
const apple = (s: Store) => appleStoreLabel(s, L(s.country));
/** A place's French name: "France", "Rhône", "Paris", "Apple Opéra". */
function placeFr(p: Place): string {
  const code = ccOf(p);
  const lg = L(code);
  if (p.level === "country") return NAME[code];
  if (p.level === "state") return regionLabel(code, p.state!, lg);
  if (p.level === "city") return cityLabel(code, p.city!, lg);
  return appleStoreLabel(p.store!, lg);
}
/** "en France", "dans le Rhône", "à Paris", "chez Apple Opéra". */
function atFr(p: Place): string {
  if (p.level === "country") return IN[ccOf(p)];
  return p.level === "store" ? `chez ${placeFr(p)}` : dans(placeFr(p));
}
/** A country's name given in French back to "en France" (else the place's own preposition). */
function inName(name: string): string {
  const code = (Object.keys(NAME) as CountryCode[]).find((k) => NAME[k] === name || countryLabel(k, "fr") === name);
  return code ? IN[code] : dans(name);
}
const prodName = (p: Product) => fx(p.name);
const prodShort = (p: Product) => fx(p.short);
const nStores = (k: number) => plural("fr", k, { one: "# magasin", other: "# magasins" });
const nRestocks = (k: number) => plural("fr", k, { one: "# retour en stock", other: "# retours en stock" });
const nConfirmed = (k: number) => plural("fr", k, { one: "# retour en stock confirmé", other: "# retours en stock confirmés" });
const nDays = (k: number) => plural("fr", k, { one: "# jour", other: "# jours" });

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = ccOf(place);
  const name = prodName(product), short = prodShort(product);
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${plural("fr", inStock, { one: "# Apple Store", other: "# Apple Store" })} ${IN[code]} affichent l’${name}`] : []),
      `${name} ${IN[code]} : stock en retrait, en direct`,
      `${short} ${IN[code]} : stock en retrait`,
      `${short} : stock en retrait`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const store = apple(s);
    return fitTitleW([
      `${name} chez ${store} : ${inStock > 0 ? "affiché en retrait maintenant" : "stock en retrait et retours"}`,
      `${short} chez ${store} : ${inStock > 0 ? "en stock maintenant" : "stock"}`,
      `${short} chez ${store}`,
      `${short} chez ${storeLabel(s, L(code))}`,
      `${short} · ${storeLabel(s, L(code))}`,
    ]);
  }
  const w = dans(placeFr(place));
  return fitTitleW([
    `${name} ${w} : affiché dans ${inStock} sur ${place.stores.length} magasins`,
    `${name} ${w} : stock en retrait, en direct`,
    `${short} ${w} : en stock maintenant ?`,
    `${short} ${w}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prodName(product);
  const week = `${nRestocks(stats.week)} cette semaine`;
  const code = ccOf(place);
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${name} chez ${apple(s)}, ${cityLabel(code, s.city, L(code))} : ${inStock > 0 ? "affiché en retrait au dernier relevé" : "pas affiché en retrait en ce moment"}, ${week}. Quand ce magasin est réapprovisionné, combien de temps ça dure, et une alerte pour le prochain.`,
      `${name} chez ${apple(s)} : ${inStock > 0 ? "en stock maintenant" : "pas en stock maintenant"}, ${week}. Heures de retour en stock et alertes.`,
    ], 155);
  }
  const where = place.level === "country" ? `Apple Store ${IN[code]}` : `Apple Store ${dans(placeFr(place))}`;
  return fitTitleW([
    `${inStock} des ${place.stores.length} ${where} affichent l’${name} en retrait à cette minute, ${week}. Magasin par magasin, avec heures de retour en stock et une alerte pour le prochain.`,
    `${name} : ${inStock} des ${place.stores.length} ${where} l’ont maintenant, ${week}. En direct par magasin, heures de retour, alertes.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const code = ccOf(place);
  const name = prodName(product);
  const at = atFr(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? ` ; le magasin le plus proche qui l’affiche est ${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`} à ${nearest.city}, à ${distance("fr", code, nearest.distance)}` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `L’${name} est-il en stock ${at} en ce moment ?`,
      a: l && l.available.length > 0
        ? `Oui${product.parts.length > 1 ? ` : ${list("fr", l.available.map((i) => `${i.storage} ${colorLabel(i.color, "fr")}`), 4)}` : ""}, affiché en retrait au dernier relevé.`
        : `Pas au dernier relevé${near}.`,
    });
  } else {
    out.push({
      q: `Quels Apple Store ${at} affichent l’${name} en ce moment ?`,
      a: inStock.length === 0
        ? `Aucun au dernier relevé${near}.`
        : `${nStores(inStock.length)} au dernier relevé : ${list("fr", inStock.map((l) => apple(l.store)), 4, (r) => `${r} de plus`)}.`,
    });
  }
  const peak = peakOf(clock, "fr");
  out.push({
    q: `À quelle fréquence l’${name} revient-il ${at} ?`,
    a: stats.month === 0 ? `Aucun retour en stock confirmé ${at} sur les ${stats.days} derniers jours.` : `${nConfirmed(stats.month)} sur les ${stats.days} derniers jours, dont ${stats.week} cette semaine${peak ? `, groupés autour de ${peak.hour}, heure locale` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `Combien de temps dure un retour en stock de l’${name} ${at} ?`, a: `Environ ${fmtDuration(stats.medianMs, "fr")} en médiane avant d’être de nouveau épuisé.` });
  return out;
}

function priceLabel(product: Product): string {
  const code = ccOf(product);
  const prices = catalogFor(product.model, code).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L(code), COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- restock-times helpers */

const rtN = (x: number) => num("fr", x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pct("fr", Math.round(x * 100)));
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L(c.cc), iso, c.timeZone, true);
const hourFr = (h: number) => hour("fr", h, true);
const rangeFr = (from: number, to: number) => `${hourFr(from)}–${hourFr(to % 24)}`;
/** "entre 9 h et 11 h". */
const between = (from: number, to: number) => `entre ${hourFr(from)} et ${hourFr(to % 24)}`;
const WD = weekdays("fr");
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "État" : noun(x.c).one);
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "États" : noun(x.c).other);
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " pour l’instant");
const rtIn = (c: Country) => IN[c.cc];
const EN = " (en anglais)";

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c) => IN[c.cc],
    liveMap: "Carte en direct",
    restockLog: "Journal des retours en stock",
    alertMe: "Recevoir des alertes",
    lastDays: (days) => <>{days} jours, jour par jour</>,
    since: "2 novembre 2026",
    sourcesWhere: (n, c) => (n === 1 ? `l’Apple Store ${IN[c.cc]}` : `les ${num(L(c.cc), n)} Apple Store ${IN[c.cc]}`),
    checker: (c) => `Suivi du stock iPhone ${IN[c.cc]}`,
    appleStoresIn: (c) => `Apple Store ${IN[c.cc]}`,
    storesWithIt: "magasins qui l’affichent",
    more: "Voir plus",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `chez ${name}` : level === "country" ? inName(name) : dans(name)),
    h1Country: (model, c) => `${fx(model)} : stock en retrait en magasin ${IN[c.cc]}`,
    h1Place: (model, where) => `${fx(model)} ${where}`,
    inStockNow: "Affiché maintenant",
    yes: "Oui",
    no: "Non",
    pickup: "retrait",
    configurations: "configurations",
    ofStores: (n) => `sur ${nStores(n)}`,
    restocks24h: "Retours en stock, 24 h",
    restocksHint: (week, month, days) => `${week} en 7 j · ${month} en ${days} j`,
    sellOuts: (days) => `Ruptures ${days} j`,
    stays: (ms) => `reste ~${fmtDuration(ms, "fr")}`,
    noPairs: "aucune rupture appariée pour l’instant",
    lastRestock: "Retour en stock le plus récent",
    noneYet: "aucun jusqu’ici",
    thisConfig: "cette configuration",
    inDays: (days) => `en ${days} jours`,
    notInStockNow: "Pas affiché en ce moment",
    configsInStock: (n, of) => <span><b className="text-ink">{n}</b> {n > 1 ? "configurations affichées" : "configuration affichée"} sur {of}</span>,
    inStockAt: (n, of) => <span>Affiché dans <b className="text-ink">{n}</b> {of > 1 ? "magasins" : "magasin"} sur {of}</span>,
    checked: (live, priceText, tax) => <>Lu {live} · {priceText}{tax}</>,
    taxNote: (c) => taxNote(c.cc),
    beforeTax: "hors taxes",
    buyOnApple: "Commander sur apple.com",
    allStoresIn: (c) => `Chaque magasin ${IN[c.cc]}`,
    everyIphoneHere: "Tous les iPhone à cet endroit",
    everyIphone: (where) => `Tous les iPhone ${where}`,
    panel: (model, where) => `${fx(model)}${where ? ` ${where}` : ""} : choisissez les configurations, puis les magasins`,
    unitConfigs: "configurations",
    unitStores: "magasins",
    otherConfigsHere: "Autres configurations à cet endroit",
    byStorageColor: "Capacité et couleur",
    nearestStores: "Magasins les plus proches",
    closest: (link, dist) => <>Magasin le plus proche qui l’affiche : {link} · {dist}</>,
    storeCity: (store, city) => <>{store}, {city}</>,
    mostRecentlyInStock: "Affiché le plus récemment",
    storesWithItNow: "Magasins qui l’affichent maintenant",
    storesIn: (where) => `Magasins ${where}`,
    colStatus: "statut",
    colConfigs: "config. affichées",
    noStoreHasIt: "Aucun magasin ne l’affiche en ce moment.",
    noStoreHereHasIt: "Aucun magasin de ce secteur ne l’affiche en ce moment.",
    moreStores: (n) => <>{n} magasins de plus, classés par région ci-dessous.</>,
    byRegion: (c) => `Par ${noun(c).one}`,
    byCity: "Par ville",
    nearbyStores: "Magasins tout proches",
    latestChanges: "Changements les plus récents",
    nothingLogged: "Le journal est vide pour l’instant.",
    whenRestocks: "Heures habituelles de retour en stock",
    howFast: "Combien de temps dure un retour en stock",
    restocksByConfig: "Quelles configurations reviennent",
    faqTitleCountry: (model, c) => `${fx(model)} ${IN[c.cc]} : vos questions`,
    faqTitle: (model, where) => `${fx(model)} ${where}`,
    buySource: (model, c) => `Apple : page de commande de l’${fx(model)} (${NAME[c.cc]})`,
    nearby: "Tout près",
    otherRegions: (c) => `Autres ${noun(c).other}`,
    elsewhereIn: (region) => `Plus loin ${dans(region)}`,
    everyAppleStoreIn: (c) => `Les Apple Store ${IN[c.cc]}, liste complète`,
    across: (model, c) => `${fx(model)} partout ${IN[c.cc]}`,
    itemList: (model, where) => `${fx(model)} ${where}`,
    nearLead: (c, model, inStock, n, have) =>
      inStock === 0
        ? `En ce moment, aucun Apple Store ${IN[c.cc]} n’affiche l’${fx(model)} en retrait : « près de chez moi » se résume donc à savoir quel magasin proche sera réapprovisionné le premier. Une alerte sur chaque magasin à votre portée envoie la notification sur votre téléphone quelques secondes après que l’un d’eux l’affiche.`
        : `${nStores(inStock)} sur ${n} ${inStock === 1 ? "affiche" : "affichent"} l’${fx(model)} en ce moment : ${list(L(c.cc), have.slice(0, 5).map((l) => `${l.store} à ${l.city} (${plural("fr", l.configs, { one: "# config.", other: "# config." })})`), 5)}.`,
    nearHead: (c) => [cap(noun(c).one), "Magasins qui l’affichent maintenant"],
    nearCaption: (c, model) => `Stock en retrait de l’${fx(model)} par ${noun(c).one}, dernière vérification`,
    nearMe: (c, model, alert) => `Touchez Près de moi dans la création d’alerte de cette page : chaque magasin est classé depuis l’endroit où vous êtes, selon la distance estimée par la route en kilomètres, avec un lien d’itinéraire. [Créer une alerte ${fx(model)}](${alert}).`,
    modelFaq: (c, model, low, high, inStock): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L(c.cc), c, v);
      return {
        price: { q: `Combien coûte l’${fx(model)} ${IN[c.cc]} ?`, a: `De ${money(low)} à ${money(high)} sur apple.com (${taxNote(c.cc)}), selon la capacité.` },
        reserve: { q: `Peut-on réserver l’${fx(model)} en retrait ${IN[c.cc]} ?`, a: `Pas à l’avance : quand un magasin affiche votre configuration, vous la commandez sur apple.com avec retrait en magasin, et Apple la garde pour votre créneau.${inStock === 0 ? " Aucun magasin ne l’affiche en ce moment : une alerte est votre façon d’arriver le premier." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c, n) => `Journal en direct des retours en stock iPhone ${IN[c.cc]} : ${n === 1 ? "l’Apple Store" : `${num(L(c.cc), n)} Apple Store`}`,
    metaDescription: (c, n) => `Chaque retour en stock confirmé de l’iPhone Duo, du 18 Pro et du Pro Max en retrait ${n === 1 ? "à l’Apple Store" : "dans les Apple Store"} ${IN[c.cc]} : heure, configuration exacte, carte.`,
    h1: (c) => `Les retours en stock iPhone ${IN[c.cc]}, en temps réel`,
    summary: (day, week, model, region) => <>{nRestocks(day)} sur les dernières 24 heures · {num("fr", week)} en 7 jours{model ? ` · ${fx(model)}` : ""}{region ? ` · ${region}` : ""}. Les heures s’affichent dans votre propre fuseau horaire.</>,
    allModels: "Tous les modèles",
    restocks: "Retours en stock",
    withSoldOut: "Retours en stock et ruptures",
    regionLabel: (c) => cap(noun(c).one),
    allRegions: (c) => `${noun(c).f ? "Toutes les" : "Tous les"} ${noun(c).other}`,
    filter: "Appliquer",
    page: (k) => <>page {k}</>,
    newer: "← Plus récents",
    older: "Plus anciens →",
    getAlerts: "Créer des alertes",
    byPlace: "Les retours en stock, lieu par lieu",
    byRegion: (c) => `Par ${noun(c).one}`,
    datasetName: (c) => `Retours en stock d’iPhone en retrait dans les Apple Store ${IN[c.cc]}`,
    datasetDescription: (c) => `Retours en stock et ruptures confirmés en retrait en magasin de l’iPhone Duo, de l’iPhone 18 Pro et de l’iPhone 18 Pro Max ${c.cc === "us" ? "dans les 269 Apple Store des États-Unis" : `dans les Apple Store ${IN[c.cc]}`} : magasin, configuration exacte, heure. Les magasins sont lus toutes les 15 secondes (toutes les 5 secondes là où une alerte est réglée), et un retour en stock n’entre au journal qu’après deux réponses identiques d’apple.com.`,
    datasetMeasured: ["Apple Store", "modèle, capacité et couleur de l’iPhone", "heure du retour en stock", "heure de la rupture"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c, n) => `Carte en direct du stock iPhone Duo : ${n === 1 ? "l’Apple Store" : "chaque Apple Store"} ${IN[c.cc]}`,
    metaDescription: (c, n) => `Où l’iPhone Duo, le 18 Pro et le Pro Max sont affichés en retrait en ce moment : ${n === 1 ? "l’Apple Store" : `les ${num(L(c.cc), n)} Apple Store`} ${IN[c.cc]} sur une seule carte en direct, par capacité et couleur.`,
    // The map keeps the English region keys (its client strings are keyed by them) and names the country itself.
    country: (c) => ({ name: NAME[c.cc], inName: IN[c.cc], regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Tous les magasins",
    storeCity: (store, city) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c, n, regions, cities, duo, max) => {
      const by = c.regionNoun && regions > 1 ? ` par ${noun(c).one} et par ville` : cities > 1 ? " par ville" : "";
      return `${duo} affichent l’iPhone Duo et ${max} le Pro Max en ce moment : stock en retrait en direct dans les ${num(L(c.cc), n)} Apple Store ${IN[c.cc]}${by}, 18 Pro compris.`;
    },
    countAnswer: (n, spread, top) => `${n}, ${spread}${top.length ? ` ; ${top[0].name} arrive en tête avec ${top[0].count}${top[1] ? `, devant ${top[1].name} (${top[1].count})` : ""}` : ""}.`,
    howMany: (c) => <>Combien y a-t-il d’Apple Store {IN[c.cc]} ?</>,
    duoNow: (c, n, have): FaqItem => ({
      q: `Quels Apple Store ${IN[c.cc]} affichent l’iPhone Duo en ce moment ?`,
      a: have.length === 0 ? `Aucun des ${n} à la dernière vérification ; cette page et la carte changent dès que l’un d’eux l’affiche, et une alerte vous prévient avant l’une comme l’autre.` : `${have.length} sur ${n} à la dernière vérification : ${have.slice(0, 6).map((x) => apple(x)).join(", ")}${have.length > 6 ? " et d’autres" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L(ctx.stores[0]?.country)),
    duoBlock: (alert) => `Une alerte sur les magasins à votre portée est le chemin le plus court vers un iPhone Duo : [créer une alerte iPhone Duo](${alert}). Une alerte couvre un magasin × une configuration exacte, et votre téléphone le sait quelques secondes après que ce magasin l’affiche.`,
    intro: (c, n, spread, now, tax) => `En ce moment, **${now.duo}** affichent un iPhone Duo en retrait, **${now.max}** l’iPhone 18 Pro Max et **${now.pro}** le 18 Pro, sur **${plural(L(c.cc), n, { one: "# Apple Store", other: "# Apple Store" })}** ${IN[c.cc]}, ${spread}. ${tax}`,
    crumb: "Apple Store",
    panel: (c) => `Choisissez vos iPhone, puis cochez les magasins ${IN[c.cc]} à votre portée`,
    matrixLabel: "Stock par magasin",
    matrixH2: (c) => <>Le stock magasin par magasin {IN[c.cc]}</>,
    matrixHint: "Affichées maintenant / suivies, pour chaque modèle.",
    topCaption: (c) => <>{cap(noun(c).other)} classé{noun(c).f ? "e" : ""}s par nombre d’Apple Store (d’après la liste des magasins d’Apple, telle que suivie ici)</>,
    regionHead: (c) => cap(noun(c).one),
    colStores: "Apple Store",
    colCities: "Villes",
    locationsBy: (c) => `Où sont les Apple Store, ${noun(c).one} par ${noun(c).one}`,
    locationsIn: (c) => `Chaque Apple Store ${IN[c.cc]}`,
    storeCount: (n) => <>{nStores(n)}</>,
    storeCountAll: (n) => <>{nStores(n)}</>,
    whenRestock: (c) => <>À quelle heure les magasins {IN[c.cc]} sont-ils réapprovisionnés ?</>,
    howFast: (c) => <>Combien de temps dure un retour en stock {IN[c.cc]} ?</>,
    faqTitle: (c) => `Apple Store ${IN[c.cc]} : vos questions`,
    getApp: "Installer l’app",
    howItWorks: "Comment ça marche",
    pricing: "Tarifs",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: rtN,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L(store.country)),
      hour: hourFr,
      range: rangeFr,
      weekday: (d: number) => WD[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => `${apple(s)} (${cityLabel(s.country, s.city, L(s.country))})`,
    },
    title: (c) => `À quelle heure Apple réapprovisionne-t-il l’iPhone Duo ${IN[c.cc]} ?`,
    metaDescription: (x) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "État" : c.regionNoun ? noun(c).one : "magasin";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${rtN(t.n)} retours en stock d’iPhone Duo dans les Apple Store ${rtIn(c)} depuis le ${since} : ${rtPct(w.share)} ${between(w.from, w.to)}, heure locale${t.sellout ? `, ${rtPct(t.sellout.within2min)} partis en 2 minutes` : ""}. Tableaux par heure, jour, ${region}, magasin et configuration.`,
          `${rtN(t.n)} retours en stock d’iPhone Duo dans les Apple Store ${rtIn(c)} depuis le ${since} : ${rtPct(w.share)} ${between(w.from, w.to)}, heure locale. Tableaux par heure, jour, ${region} et configuration.`,
          `Heures de retour en stock de l’iPhone Duo ${rtIn(c)} : ${rtN(t.n)} depuis le ${since}, par heure, jour, ${region} et configuration.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${rtN(t.n)} retours en stock d’iPhone Duo confirmés dans les Apple Store ${rtIn(c)} depuis le ${since}, vérifiés toutes les 15 secondes : par heure locale, jour par jour, par ${region}, magasin et configuration, avec la durée de chacun.`,
            `Heures de retour en stock de l’iPhone Duo ${rtIn(c)} : ${rtN(t.n)} confirmés depuis le ${since}, par heure, jour, ${region} et configuration.`,
          ], 158)
          : `Heures de retour en stock de l’iPhone Duo dans les Apple Store ${rtIn(c)}, heure par heure, jour par jour, par magasin et configuration : RestockWire lit chaque magasin toutes les 15 secondes depuis le ${longDate(t.since)}.`;
    },
    h1: (x) => x.t.unknown
      ? `À quelle heure Apple réapprovisionne-t-il l’iPhone Duo ${rtIn(x.c)} ?`
      : x.t.n > 0
        ? `À quelle heure Apple réapprovisionne-t-il l’iPhone Duo ${rtIn(x.c)} ? ${x.pattern ? `Le plus souvent ${between(x.w.from, x.w.to)}, heure locale` : "Nos propres relevés, heure par heure"}`
        : `Apple réapprovisionne-t-il l’iPhone Duo ${rtIn(x.c)} ? Pas jusqu’ici, et voici ce que nous surveillons`,
    intro: (x) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtIn(x.c);
      return t.unknown ? (
        <>Le journal des retours en stock est indisponible un instant. Les magasins {where} restent vérifiés toutes les 15 secondes, et les chiffres reviennent au prochain chargement de la page.</>
      ) : t.n > 0 && pattern ? (
        <>
          <b className="text-ink">{rtPct(w.share)} des {rtN(t.n)} retours en stock d’iPhone Duo</b> confirmés par RestockWire {one ? "à l’Apple Store" : "dans les Apple Store"} {where} depuis le {longDate(t.since)} sont arrivés <b className="text-ink">{between(w.from, w.to)}</b>, heure locale du magasin{x.sell ? <> ; un retour typique était parti en environ {Math.round(x.sell.medianSec / 5) * 5} secondes</> : null}. <b className="text-ink">Les retours en stock continuent</b>{tracked > 1 ? <> : {t.days} des {tracked} jours suivis en ont eu un</> : <> (un seul jour suivi pour l’instant)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Oui.</b> <b className="text-ink">{rtN(t.n)} retours en stock d’iPhone Duo depuis le {longDate(t.since)}</b> {one ? "à l’Apple Store" : "dans les Apple Store"} {where}{tracked > 1 ? <>, sur {t.days} des {tracked} jours</> : <> (un seul jour suivi pour l’instant)</>} ; nous indiquons une heure habituelle à partir de {PATTERN_MIN} retours en stock sur {PATTERN_MIN_DAYS} jours distincts.
        </>
      ) : (
        <>
          <b className="text-ink">Pas jusqu’ici.</b> RestockWire lit {one ? "l’Apple Store" : `les ${x.stores} Apple Store`} {where} toutes les 15 secondes depuis le {longDate(t.since)} sans avoir confirmé un seul retour en stock d’iPhone Duo en retrait.
        </>
      );
    },
    hero: {
      restocks: (x) => `retours en stock confirmés depuis le ${dateLabel(x.t.since, false)}`,
      window: (x) => `${between(x.w.from, x.w.to)}, heure locale du magasin`,
      days: "jours avec un retour en stock",
      now: (one) => (one ? "magasin en affiche un en retrait à cet instant" : "magasins en affichent un en retrait à cet instant"),
      today: (x, today: DayRow) => `aujourd’hui jusqu’ici (${dateLabel(today.date)})${x.one ? "" : `, dans ${nStores(today.stores)}`}`,
      weekday: "le jour de semaine le plus chargé à ce jour",
    },
    heroPoints: (x, latest): Point[] => [
      ...(latest ? [{ text: <>Le plus récent : <b className="text-ink">{latest.config}</b>{x.one ? null : <> chez <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, L(latest.store.country))}, heure locale</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>C’est le <b className="text-ink">{WD[x.t.peakWeekday]}</b> qu’il y en a le plus</> }] : []),
      { text: <>Il n’existe <b className="text-ink">aucun calendrier officiel de réapprovisionnement</b> ; ces chiffres sont nos propres vérifications confirmées, actualisées environ toutes les cinq minutes</>, no: true },
    ],
    emptyPoints: (x): Point[] => [
      { text: <><b className="text-ink">{x.duoNow} sur {x.stores}</b> en {x.duoNow > 1 ? "affichent" : "affiche"} un en retrait à cet instant</> },
      { text: <>Le premier retour en stock confirmé ouvre chacun des tableaux ci-dessous</>, step: true },
      { text: <>Pour les tendances par heure et par jour sur l’échantillon le plus large, voir <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">la page des États-Unis</Link>{EN}</>, step: true },
    ],
    setUpAlert: "Recevoir des alertes iPhone Duo",
    logLive: "Journal des retours en stock en direct",
    onThisPage: "Sections",
    nav: (x) => ({
      "time-of-day": "Heure",
      "day-by-day": "Jours",
      where: `Par ${rtRegion(x)}`,
      configuration: "Configurations",
      "how-long": "Vitesse d’épuisement",
      unavailable: "« Indisponible »",
      reddit: "Rumeurs Reddit",
      method: "Méthode",
    }),
    h2: (x) => ({
      "time-of-day": `À quelle heure l’iPhone Duo revient-il ${rtIn(x.c)} ?`,
      "day-by-day": `Quels jours l’iPhone Duo a-t-il été réapprovisionné ${rtIn(x.c)} ?`,
      where: `Où l’iPhone Duo est-il le plus souvent réapprovisionné ${rtIn(x.c)} ?`,
      configuration: `Quelles capacités et couleurs d’iPhone Duo reviennent le plus ${rtIn(x.c)} ?`,
      "how-long": `Combien de secondes dure un retour en stock d’iPhone Duo ${rtIn(x.c)} ?`,
      unavailable: "Pourquoi apple.com affiche-t-il « actuellement indisponible » dans tous les magasins ?",
      reddit: "Les théories de Reddit sur les retours en stock de l’iPhone Duo, confrontées au journal",
      method: "Qu’est-ce qui compte comme retour en stock sur RestockWire ?",
    }),
    faq: (x): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtIn(x.c);
      const window = between(w.from, w.to);
      return [
        { q: `Quand Apple réapprovisionne-t-il l’iPhone Duo ${where} ?`, a: t.n > 0 && pattern
          ? `Le créneau ${window}, heure locale du magasin, a concentré ${rtPct(w.share)} des ${rtN(t.n)} retours en stock confirmés depuis le ${longDate(t.since)}, et la tranche de 8 h à midi ${rtPct(hourShare(t.byHour, 8, 12))}. Il n’y a pas de calendrier officiel ; c’est la tendance observée par RestockWire, actualisée environ toutes les cinq minutes.`
          : `RestockWire a ${nConfirmed(t.n)} au journal ${where} depuis le ${longDate(t.since)}${t.days ? `, sur ${nDays(t.days)}` : ""}, et Apple n’annonce aucun calendrier. Dès qu’il y aura ${PATTERN_MIN} retours en stock sur ${PATTERN_MIN_DAYS} jours distincts, cette page indiquera d’elle-même une heure habituelle.` },
        { q: `Y a-t-il des retours en stock d’iPhone Duo le week-end${us ? "" : ` ${where}`} ?`, a: t.n > 0
          ? `${weekend > 0 ? "Oui" : "Aucun jusqu’ici"} : ${nRestocks(weekend)} sur ${rtN(t.n)} (${rtPct(weekend / t.n)}) ${weekend > 1 ? "sont tombés" : "est tombé"} un samedi ou un dimanche. ${t.peakWeekday != null ? `Le jour de semaine le plus chargé à ce jour est le ${WD[t.peakWeekday]}.` : `Nous ne désignons un jour le plus chargé qu’une fois ${WEEKDAY_MIN_SPAN} jours de données couverts ; nous en avons ${tracked} pour l’instant.`}`
          : `Pas encore de données de week-end ${where} ; le tableau par jour de cette page s’allonge à chaque retour en stock confirmé.` },
        { q: "Quand commencer à surveiller apple.com ?", a: t.n > 0 && pattern
          ? `À la main, gardez apple.com ouvert, retrait sélectionné, dès ${hourFr(w.from)}, heure locale ; ce créneau de deux heures concentre ${rtPct(w.share)} des retours en stock. Un retour typique ${sell ? `était parti en ${sell.medianSec} secondes en médiane` : "dure environ une minute"} : c’est pourquoi une alerte vérifiée toutes les 5 secondes ([fonctionnement des alertes, en anglais](/iphone-duo-restock-alerts)) bat n’importe quelle séance d’actualisation.`
          : `Tant que la tendance ${where} se dessine encore, une alerte peut guetter à votre place : les magasins choisis sont vérifiés toutes les 5 secondes, jour et nuit ([fonctionnement des alertes, en anglais](/iphone-duo-restock-alerts)).` },
        { q: "Pourquoi l’iPhone Duo est-il « indisponible » dans tous les Apple Store ?", a: sell
          ? `Les retours en stock sont brefs : sur les ${rtN(sell.n)} retours épuisés mesurés ${where}, ${rtPct(sell.within2min)} étaient partis en moins de 2 minutes et ${rtPct(sell.within20min)} en moins de 20. À cet instant, ${x.duoNow} des ${x.stores} magasins en affichent un : la plupart du temps, apple.com dit donc vrai en affichant « indisponible », même les jours à plusieurs dizaines de retours ([ce que signifie « indisponible », en anglais](/apple-store-pickup-explained)).`
          : `Le stock en retrait n’apparaît que quelques minutes à la fois ; à cet instant, ${x.duoNow} sur ${nStores(x.stores)} ${where} en ${x.duoNow > 1 ? "affichent" : "affiche"} un ([ce que signifie « indisponible », en anglais](/apple-store-pickup-explained)).` },
        { q: "Puis-je être prévenu quand mon Apple Store récupère l’iPhone Duo ?", a: `Oui : une alerte sur ce magasin, avec votre capacité et votre couleur exactes, le fait passer aux vérifications toutes les 5 secondes, et votre téléphone l’apprend environ 3 secondes après la confirmation d’un retour en stock ([créer une alerte](${x.alert}) ; [comment ça marche, en anglais](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple : aide Livraison et retrait (comment fonctionne la disponibilité en retrait, en anglais)",
      newsroom: "Apple Newsroom : l’iPhone Duo arrive dans les Apple Store du monde entier (23 octobre 2026, en anglais)",
      macRumors: "MacRumors : le système de retrait en Apple Store pour l’iPhone Duo de nouveau actif aux États-Unis et au Canada (24 octobre 2026, en anglais)",
      reports: (tracker) => `${tracker} : signalements de retours en stock d’iPhone Duo pendant la semaine de lancement (leurs propres observations, tenues à part et jamais comptées)`,
    },
    ld: (x) => ({
      datasetName: `Heures de retour en stock de l’iPhone Duo en retrait, Apple Store ${rtIn(x.c)}`,
      description: `Retours en stock confirmés de l’iPhone Duo en retrait en magasin dans les Apple Store ${rtIn(x.c)} depuis le ${longDate(x.t.since)} (magasin, configuration, heure), d’après RestockWire qui lit chaque magasin toutes les 15 secondes ; regroupés par heure locale, jour, ${rtRegion(x)}, magasin et configuration.`,
      spatial: `Apple Store ${rtIn(x.c)}`,
      measured: ["heure du retour en stock (heure locale du magasin)", "Apple Store", "capacité et couleur de l’iPhone Duo", "secondes avant épuisement"],
      size: `${nRestocks(x.t.n)} dans ${nStores(x.t.stores)}`,
    }),
    crumb: "Heures de retour en stock de l’iPhone Duo",

    // ---- time of day
    timeLead: (x) => <b>Le créneau {between(x.w.from, x.w.to)}, heure locale du magasin, concentre {rtPct(x.w.share)} des {rtN(x.t.n)} retours en stock ; la tranche de 8 h à midi en concentre {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count) => `${nRestocks(count)} sur l’heure la plus chargée`,
    morning: "de 8 h à midi",
    evening: "après 17 h : les soirées comptent aussi",
    night: "de minuit à 6 h",
    tooFew: (x) => <b>Pas assez de jours pour indiquer une heure{rtYet(x)} : {nConfirmed(x.t.n)} sur {nDays(x.t.days)} depuis le {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Indiquer une heure habituelle demande <b className="text-ink">{PATTERN_MIN} retours en stock sur {PATTERN_MIN_DAYS} jours distincts</b></> },
      { text: <>Une rafale de dix retours en stock est un seul événement, pas une habitude</>, no: true },
      { text: <>Chaque nouveau jour de données met cette page à jour d’elle-même</>, step: true },
    ],
    hourCaption: (x) => `${nRestocks(x.t.n)} d’iPhone Duo ${rtIn(x.c)} par heure locale du magasin, du ${dateLabel(x.t.since, false)} à aujourd’hui`,
    hourHead: ["Heure locale", "Retours en stock", "Part"],
    morningKeys: (x): Point[] => [
      { text: <>Le pic du matin <b className="text-ink">n’a rien à voir avec l’heure d’ouverture</b>{x.us ? " (la plupart des Apple Store américains ouvrent à 10 h)" : ""}</> },
      { text: <>Apple libère le stock en retrait <b className="text-ink">en ligne</b>, avant l’ouverture des portes</> },
      { text: <>Vous surveillez à la main ? Couvrez <b className="text-ink">{rangeFr(x.w.from, x.w.to)}</b> les matins de semaine</>, step: true },
      { text: <>Une <Link href={x.alert}>alerte</Link> couvre les <b className="text-ink">22 heures restantes</b>, quand personne d’autre ne regarde</>, step: true },
    ],
    storeChartKeys: (x): Point[] => [{ text: <>Chaque page magasin trace ses propres heures dans son propre fuseau (<Link href={x.storesHref}>{x.us ? "Apple Store par État" : `magasins ${rtIn(x.c)}`}</Link>) : vous repérez ainsi le magasin réapprovisionné à 8 h quand sa région culmine à 9 h</>, step: true }],

    // ---- day by day
    dayLead: (x) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{nConfirmed(t.n)}{one ? "" : ` dans ${nStores(t.stores)}`} sur le seul jour suivi pour l’instant, le {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `Les ${t.days} jours suivis ont tous apporté` : `${t.days} des ${tracked} jours depuis le ${longDate(t.since)} ${t.days > 1 ? "ont apporté" : "a apporté"}`} au moins un retour en stock confirmé{t.peakWeekday != null ? ` ; le ${WD[t.peakWeekday]} mène parmi les jours de la semaine` : ""}.</b>
      ) : (
        <b>Aucun retour en stock confirmé {rtIn(x.c)} depuis le {longDate(t.since)}.</b>
      );
    },
    daysTracked: "jours suivis avec un retour en stock",
    busiestDay: (x, day) => `le jour le plus chargé, ${dateLabel(day.date)}${x.one ? "" : `, dans ${nStores(day.stores)}`}`,
    busiestDayNone: "jour le plus chargé",
    drop: (x, drop) => `magasins réapprovisionnés dans la même demi-heure, ${zoneStamp(drop.at, x.c)} (${plural("fr", drop.restocks, { one: "# configuration", other: "# configurations" })}) : une mise en vente nationale`,
    weekend: (x) => `tombés un week-end (${nRestocks(x.weekend)})`,
    dayCaption: (x) => `Retours en stock quotidiens d’iPhone Duo ${rtIn(x.c)}${x.t.reports.length ? " ; les lignes marquées « signalé » viennent d’observations publiées par d’autres sites de suivi avant le début de notre suivi, incluses pour la chronologie uniquement" : ""}`,
    dayHead: { date: "Date", restocks: "Retours en stock", stores: "Magasins", busiest: "Heure la plus chargée", source: "Source" },
    soFar: " · jusqu’ici",
    reportedBy: (names) => <>selon {names.join(" / ")}</>,
    dayKeys: (x, launch, resumed): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b> : jour du lancement, premières unités expédiées aux commandes en ligne</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b> : retour du retrait en magasin{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>Les lignes <b className="text-ink">signalé</b> sont des observations de la semaine de lancement publiées par {x.reportNames.join(" et ")}, exclues de tous les comptes</> }
        : { text: <>Le journal de RestockWire pour chaque magasin {rtIn(x.c)} commence le <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Un jour le plus chargé demande <b className="text-ink">{WEEKDAY_MIN_SPAN} jours</b> de données (nous en avons {x.tracked})</>, no: true }] : []),
      { text: <>Regardez la colonne <b className="text-ink">magasins</b> : des retours en stock répartis sur plus de magasins vous donnent de meilleures chances</>, step: true },
    ],

    // ---- where
    whereLead: (x, hit, total) => (
      <b>{hit[0].name} : {nRestocks(hit[0].restocks)} dans {hit[0].stores} de ses {nStores(hit[0].storesTotal)} depuis le {dateLabel(x.t.since, false)}{hit[1] ? <>, suivi de {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> et de {hit[2].name} ({rtN(hit[2].restocks)})</> : null} ; {hit.length} des {total} {rtRegions(x)} ont vu un retour en stock{total - hit.length > 0 ? `, ${total - hit.length} toujours aucun` : ""}.</b>
    ),
    whereNone: (x) => <b>{x.us || !noun(x.c).f ? "Aucun" : "Aucune"} {rtRegion(x)} {rtIn(x.c)} n’a de retour en stock confirmé jusqu’ici ; le premier ouvrira le tableau.</b>,
    regionCaption: (x) => `Retours en stock d’iPhone Duo confirmés par ${rtRegion(x)} ${rtIn(x.c)}, du ${dateLabel(x.t.since, false)} à aujourd’hui`,
    regionHead: (x) => [cap(rtRegion(x)), "Retours en stock", "Magasins réapprovisionnés", "Dernier retour en stock (heure locale)"],
    ofN: (a, b) => <>{a} sur {b}</>,
    storesCaption: (x) => `Les magasins en tête des retours en stock d’iPhone Duo ${rtIn(x.c)}, du ${dateLabel(x.t.since, false)} à aujourd’hui`,
    storesHead: ["Magasin", "Retours en stock", "Jours", "Heure habituelle", "Dernier (heure locale)"],
    swaps: (x) => [
      { no: "Courir après le premier magasin de la liste, aussi loin soit-il", yes: `Deux ou trois magasins à moins d’une heure de chez vous, dès ${x.pattern ? hourFr(x.w.from) : "le matin"}`, why: "Un retour en stock hors de portée ne vous sert à rien, et même le magasin le plus actif affiche « indisponible », sauf quelques minutes par jour." },
      { no: "Tout miser sur un seul magasin", yes: "Une alerte sur chacun, puis filer vers celui qui se déclenche", why: "Le tableau des comptes ne sert qu’à décider vers lequel de vos magasins partir en premier." },
    ],
    nearMe: `Stock du Duo près de chez moi, en direct${EN}`,

    // ---- configuration
    configLead: (x, top, rarest) => (
      <b>{top.label} arrive en tête avec {rtN(top.restocks)} des {rtN(x.t.n)} retours en stock ({rtPct(top.restocks / x.t.n)}){rarest ? ` ; ${rarest.label} ferme la marche avec ${nRestocks(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config) => `${config} revient plus souvent que toute autre configuration`,
    versus: (a, bCount, b) => `retours en stock en ${a}, contre ${rtN(bCount)} en ${b}`,
    restocksOf: (a) => `retours en stock en ${a}`,
    byStorage: "par capacité",
    byColour: "par couleur",
    configNone: (x) => <b>Aucune configuration {rtIn(x.c)} n’a de retour en stock confirmé{rtYet(x)} ; les huit sont listées pour que le premier retour ait déjà sa ligne.</b>,
    configCaption: (x) => `Retours en stock d’iPhone Duo confirmés par configuration ${rtIn(x.c)}, du ${dateLabel(x.t.since, false)} à aujourd’hui`,
    configHead: ["Configuration", "Retours en stock", "Part", "Dernier retour en stock (heure locale)"],
    configKeys: (x): Point[] => [
      { text: <>Choisir la configuration compte <b className="text-ink">plus que choisir le magasin</b></> },
      x.storageRatio != null
        ? { text: <>Contentez-vous de la capacité la plus réapprovisionnée : vos chances sont environ <b className="text-ink">{num("fr", x.storageRatio)}×</b> celles de la capacité suivante</> }
        : { text: <>Contentez-vous de la capacité la plus réapprovisionnée : vos chances grimpent <b className="text-ink">nettement</b></> },
      { text: <>Le <b className="text-ink">2TB</b> se commande en livraison, et s’attend</>, no: true },
      { text: <>Prix et stock en direct : <Link href="/iphone-duo-most-restocked-stores">Quel iPhone Duo revient le plus souvent ?</Link>{EN}</>, step: true },
    ],

    // ---- how long
    howLongLead: (x, sell: SelloutFacts) => <b>{sell.medianSec} secondes : la durée de vie médiane des {rtN(sell.n)} retours en stock épuisés {rtIn(x.c)} ; {rtPct(sell.within2min)} étaient partis en moins de 2 minutes et {rtPct(sell.within20min)} en moins de 20.</b>,
    secUnit: "s",
    medianListing: "affichage médian, de l’apparition à la disparition",
    within2: "partis en moins de 2 minutes",
    within20: "partis en moins de 20 minutes",
    fastest: "épuisement le plus rapide relevé",
    howLongNone: (x) => <b>Pas assez de retours en stock épuisés {rtIn(x.c)} pour mesurer{rtYet(x)} ; ces chiffres démarrent à dix, et la page des États-Unis (en anglais) a la série complète.</b>,
    howLongKeys: (x): Point[] => [
      { text: <>Deux minutes, c’est une fenêtre pour une <b className="text-ink">alerte</b>, pas pour actualiser apple.com</> },
      { text: <>Tous les autres chiffres de cette page découlent de celui-ci</> },
      { text: <>Chaque retour en stock et sa durée en secondes, par configuration et par {rtRegion(x)} : <Link href="/how-fast-does-iphone-duo-sell-out">En combien de temps un retour en stock d’iPhone Duo est-il épuisé ?</Link>{EN}</>, step: true },
    ],
    measured: "Chaque chiffre va de la vérification qui a vu la configuration affichée pour la première fois à celle qui l’a vue disparaître : c’est donc un plafond, les durées réelles sont plus courtes.",

    // ---- unavailable
    unavailableLead: (x) => <b>Un retour en stock est un éclair, pas un état : {x.one ? "un magasin" : `${rtN(x.stores)} magasins`} × {x.configs} configurations font {rtN(x.pairs)} affichages possibles {rtIn(x.c)}, et à cet instant {x.duoNow} {x.duoNow > 1 ? "magasins affichent" : "magasin affiche"} un iPhone Duo, quel qu’il soit.</b>,
    pairs: "affichages magasin × configuration possibles",
    listingNow: "avec un iPhone Duo affiché en retrait à cet instant",
    goneIn2: "des retours en stock terminés en moins de deux minutes",
    last24: "retours en stock confirmés, dernières 24 heures",
    unavailableKeys: (x, today): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Dernières 24 heures : <b className="text-ink">{nConfirmed(x.recent.restocks)}</b> dans {nStores(x.recent.stores)} {rtIn(x.c)}</> }
        : today > 0
          ? { text: <>Aujourd’hui : <b className="text-ink">{nConfirmed(today)}</b> {rtIn(x.c)}</> }
          : { text: <>Le tableau par jour ci-dessus liste les retours en stock qui ont bien eu lieu</> },
      { text: <>Chacun est resté sur apple.com <b className="text-ink">une minute ou deux</b></> },
      { text: <>Voir « indisponible partout » au quatrième ou au quatorzième jour ne veut <b className="text-ink">pas</b> dire qu’Apple a arrêté</>, no: true },
    ],
    unavailableLinks: { explained: `« Actuellement indisponible pour le retrait », expliqué${EN}`, howToGet: `Obtenir un iPhone Duo, étape par étape${EN}` },

    // ---- reddit
    redditLead: (x) => <b>Une bonne partie des conseils de <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> et <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> est sincère, fondée sur un seul magasin et dépassée dès le lendemain ; voici les quatre affirmations qui reviennent le plus, testées sur {rtN(x.t.n)} retours en stock confirmés {rtIn(x.c)}.</b>,
    redditCaption: "Affirmations fréquentes sur Reddit à propos des retours en stock de l’iPhone Duo, testées sur les retours en stock confirmés par RestockWire",
    redditHead: ["Affirmation", "Ce que montre le journal"],
    claims: (x): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "« Les magasins sont réapprovisionnés la nuit : vérifiez à 3 h du matin. »", answer: t.n > 0 ? <>{rtPct(hourShare(t.byHour, 0, 6))} des retours en stock sont arrivés entre minuit et 6 h, heure locale, contre {rtPct(w.share)} {between(w.from, w.to)}.</> : "Rien encore au journal pour la tester." },
        { claim: "« Apple ne réapprovisionne qu’un seul jour de la semaine. »", answer: t.n > 0 ? (t.peakWeekday != null ? <>Le {WD[t.peakWeekday]} mène pour l’instant ({rtN(t.byWeekday[t.peakWeekday])} sur {rtN(t.n)}), mais des retours en stock ont eu lieu {t.days} des {tracked} jours.</> : <>Des retours en stock ont eu lieu {t.days} des {tracked} jours suivis{t.days === tracked ? ", sans un seul jour sans" : ""} ; nous désignons un jour le plus chargé après {WEEKDAY_MIN_SPAN} jours de données.</>) : "Rien encore au journal pour la tester." },
        { claim: "« Appelez le magasin et demandez quand arrive le camion. »", answer: "Il n’existe aucun calendrier publié ; le stock en retrait est libéré en ligne, et le magasin le voit au même moment que tout le monde." },
        { claim: "« S’il est indiqué indisponible, c’est épuisé pour de bon. »", answer: recent.restocks > 0 ? <>{nConfirmed(recent.restocks)} dans {nStores(recent.stores)} sur les dernières 24 heures prouvent le contraire, et chacun est repassé à « indisponible » en quelques minutes.</> : t.n > 0 ? <>{rtN(t.n)} retours en stock confirmés depuis le {dateLabel(t.since, false)} prouvent le contraire, et chacun est repassé à « indisponible » en quelques minutes.</> : "Rien encore au journal pour la tester." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Les rumeurs comblent le vide quand il n’y a <b className="text-ink">pas de données</b> ; cette page, ce sont les données, et les lire est gratuit</> },
      { text: <>Reddit a raison sur un point : la <b className="text-ink">préparation du paiement</b>, compte connecté et Apple Pay prêt (<Link href="/iphone-duo-restock-checkout-guide">notre version en 20 secondes</Link>{EN})</> },
    ],

    // ---- method
    methodLead: <b>Un retour en stock, c’est une configuration qui apparaît en retrait en magasin sur apple.com dans un magasin qui ne l’affichait pas, confirmée par deux vérifications concordantes.</b>,
    methodKeys: (x): Point[] => [
      { text: <>Magasins avec une alerte : toutes les <b className="text-ink">5 secondes</b> ; {x.one ? "l’Apple Store" : "chaque Apple Store"} {rtIn(x.c)} : toutes les <b className="text-ink">15 secondes</b></> },
      { text: <>Intervalles publiés par d’autres sites de suivi : <b className="text-ink">de 8 secondes à 15 minutes</b> ; nous ne comparons que ce qu’ils publient</> },
      { text: <>Un premier « disponible » est revérifié <b className="text-ink">environ une seconde plus tard</b> avant de compter</> },
      { text: <>Une offre disparue est confirmée au <b className="text-ink">tour suivant</b></> },
      { text: <>La première observation d’un magasin, une requête échouée, un délai dépassé : <b className="text-ink">jamais</b> un retour en stock, jamais « en rupture »</>, no: true },
      { text: <>Toutes les heures et dates sont dans l’<b className="text-ink">heure locale</b> de chaque magasin ; une « vague » est la même demi-heure d’un fuseau à l’autre</> },
      { text: <>Les signalements d’autres sites de suivi{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} ont leurs propres lignes, étiquetées, et sont <b className="text-ink">exclus de tous les totaux</b></> },
      { text: <>Ces tableaux s’actualisent environ toutes les cinq minutes ; <Link href={x.logHref}>le journal des retours en stock</Link> est en direct</>, step: true },
    ],
    quote: "Citez cette page : reprenez n’importe quel chiffre avec un lien vers elle. RestockWire est indépendant d’Apple et lit la même disponibilité en retrait que chacun peut voir sur apple.com, simplement bien plus souvent.",
    alertIn: (x) => <>Recevoir des alertes iPhone Duo{x.one ? "" : ` ${rtIn(x.c)}`}</>,

    // ---- related, FAQ, sources
    related: "Plus de questions sur l’iPhone Duo",
    sameData: `Construit sur le même journal${EN}`,
    questions: {
      sellOut: "Combien de temps dure un retour en stock ?",
      alerts: "Le moyen le plus rapide d’apprendre un retour en stock",
      howToGet: "En obtenir un, concrètement",
      whichConfig: "La configuration qui revient le plus",
      nearMe: "Le stock en direct près de chez moi",
      unavailable: "« Indisponible », expliqué",
    },
    otherCountries: (us) => (us ? "Cette page pour d’autres pays" : "Plus de pays"),
    faqTitle: "Questions courantes",
  },
};
