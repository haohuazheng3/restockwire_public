/**
 * Chaînes françaises : views — pages produit × lieu, fil des remises en stock, carte temps réel, page des créneaux de
 * l’iPhone Duo et annuaire des magasins. Signatures identiques à l’anglais. Product / Place / Store / Country sont des
 * données anglaises, traduites ici via places.ts ; `name`, `place`, `region`, `city` sont déjà en français.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesPlace, RestockTimesView } from "../en/views";
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
/** Coloris anglais remplacés par leur nom français officiel. */
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
/** Le lieu avec sa préposition française (pays, région, ville ou « chez » pour un magasin). */
function atFr(p: Place): string {
  if (p.level === "country") return IN[ccOf(p)];
  return p.level === "store" ? `chez ${placeFr(p)}` : dans(placeFr(p));
}
/** Nom de pays français → forme prépositionnelle ; sinon, préposition propre au lieu. */
function inName(name: string): string {
  const code = (Object.keys(NAME) as CountryCode[]).find((k) => NAME[k] === name || countryLabel(k, "fr") === name);
  return code ? IN[code] : dans(name);
}
const prodName = (p: Product) => fx(p.name);
const prodShort = (p: Product) => fx(p.short);
const nStores = (k: number) => plural("fr", k, { one: "# magasin", other: "# magasins" });
const nRestocks = (k: number) => plural("fr", k, { one: "# remise en stock", other: "# remises en stock" });
const nConfirmed = (k: number) => plural("fr", k, { one: "# remise en stock confirmée", other: "# remises en stock confirmées" });
const nDays = (k: number) => plural("fr", k, { one: "# jour", other: "# jours" });

/* ---------------------------------------------------------------- product × place copy */

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = ccOf(place);
  const name = prodName(product), short = prodShort(product);
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${name} ${IN[code]} : retrait ouvert dans ${inStock} Apple Store`] : []),
      `${name} ${IN[code]} : le retrait, à la minute`,
      `${short} ${IN[code]} : où le retirer ?`,
      `${short} : où le retirer ?`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const store = apple(s);
    return fitTitleW([
      `${store} : ${name}, ${inStock > 0 ? "retrait ouvert à l’instant" : "retrait et créneaux du stock"}`,
      `${store} : ${short}, ${inStock > 0 ? "disponible à l’instant" : "le stock"}`,
      `${short} chez ${store}`,
      `${short} chez ${storeLabel(s, L(code))}`,
      `${short} · ${storeLabel(s, L(code))}`,
    ]);
  }
  const w = dans(placeFr(place));
  return fitTitleW([
    `${name} ${w} : retrait ouvert dans ${inStock}/${place.stores.length} magasins`,
    `${name} ${w} : le retrait, à la minute`,
    `${short} ${w} : disponible à l’instant ?`,
    `${short} ${w}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = prodName(product);
  const week = `${nRestocks(stats.week)} en 7 jours`;
  const code = ccOf(place);
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${apple(s)}, ${cityLabel(code, s.city, L(code))} — ${name} : ${inStock > 0 ? "retrait ouvert au dernier contrôle" : "retrait fermé à l’instant"} ; ${week}. Créneaux du stock, durée de tenue, alerte pour le prochain.`,
      `${apple(s)} — ${name} : ${inStock > 0 ? "disponible à l’instant" : "indisponible à l’instant"} ; ${week}. Créneaux du stock et alertes.`,
    ], 155);
  }
  const where = place.level === "country" ? `Apple Store ${IN[code]}` : `Apple Store ${dans(placeFr(place))}`;
  return fitTitleW([
    `${name} : retrait ouvert dans ${inStock}/${place.stores.length} ${where} à l’instant ; ${week}. Détail par magasin, créneaux du stock, alerte pour le prochain.`,
    `Retrait de l’${name} : ${where}, ${inStock}/${place.stores.length} à l’instant ; ${week}. Créneaux et alertes par magasin.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const code = ccOf(place);
  const name = prodName(product);
  const at = atFr(place);
  const inStock = lines.filter((l) => l.available.length > 0);
  const near = nearest ? `. Plus proche avec du stock : ${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`}, ${nearest.city}, à ${distance("fr", code, nearest.distance)}` : "";
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${cap(at)}, l’${name} est-il disponible à l’instant ?`,
      a: l && l.available.length > 0
        ? `Retrait ouvert au dernier contrôle${product.parts.length > 1 ? ` — ${list("fr", l.available.map((i) => `${i.storage} ${colorLabel(i.color, "fr")}`), 4)}` : ""}.`
        : `Non, rien au dernier contrôle${near}.`,
    });
  } else {
    out.push({
      q: `${cap(at)}, où retirer l’${name} à l’instant ?`,
      a: inStock.length === 0
        ? `Nulle part au dernier contrôle${near}.`
        : `${nStores(inStock.length)} au dernier contrôle — ${list("fr", inStock.map((l) => apple(l.store)), 4, (r) => `+ ${r}`)}.`,
    });
  }
  const peak = peakOf(clock, "fr");
  out.push({
    q: `${cap(at)}, combien de remises en stock pour l’${name} ?`,
    a: stats.month === 0 ? `Zéro en ${stats.days} jours.` : `${nConfirmed(stats.month)} en ${stats.days} jours, dont ${stats.week} sur les 7 derniers${peak ? `. Créneau dominant : ${peak.hour} (heure du magasin)` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `${cap(at)}, l’${name} reste-t-il longtemps en stock ?`, a: `${fmtDuration(stats.medianMs, "fr")} en médiane, puis rupture.` });
  return out;
}

function priceLabel(product: Product): string {
  const code = ccOf(product);
  const prices = catalogFor(product.model, code).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L(code), COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- helpers de la page des créneaux */

const rtN = (x: number) => num("fr", x);
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1 %" : pct("fr", Math.round(x * 100)));
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L(c.cc), iso, c.timeZone, true);
const hourFr = (h: number) => hour("fr", h, true);
const rangeFr = (from: number, to: number) => `${hourFr(from)}–${hourFr(to % 24)}`;
/** Plage horaire en toutes lettres : "entre 9 h et 11 h". */
const between = (from: number, to: number) => `entre ${hourFr(from)} et ${hourFr(to % 24)}`;
const WD = weekdays("fr");
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "État" : noun(x.c).one);
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "États" : noun(x.c).other);
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " à ce stade");
const rtIn = (c: Country) => IN[c.cc];
const EN = " (en anglais)";

/* ---------------------------------------------------------------- views */

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "city" ? `à ${x.place.name}` : `en ${x.place.name}`) : rtIn(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "ville" : "magasin") : rtRegion(x));
const rtUs = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "villes" : "magasins") : rtRegions(x));
export const views: Dict["views"] = {
  common: {
    inCountry: (c) => IN[c.cc],
    liveMap: "Carte temps réel",
    restockLog: "Fil des remises en stock",
    alertMe: "Créer une alerte",
    lastDays: (days) => <>Jour après jour, sur {days} jours</>,
    since: "2 novembre 2026",
    sourcesWhere: (n, c) => (n === 1 ? `le seul Apple Store ${IN[c.cc]}` : `${num(L(c.cc), n)} Apple Store ${IN[c.cc]}`),
    checker: (c) => `L’iPhone en retrait ${IN[c.cc]}, au fil`,
    appleStoresIn: (c) => `Apple Store ${IN[c.cc]}`,
    storesWithIt: "magasins qui le proposent",
    more: "Afficher la suite",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `chez ${name}` : level === "country" ? inName(name) : dans(name)),
    h1Country: (model, c) => `${fx(model)} ${IN[c.cc]} : où le retirer à l’instant`,
    h1Place: (model, where) => `${fx(model)} ${where}`,
    inStockNow: "En ligne à l’instant",
    yes: "Oui",
    no: "Non",
    pickup: "retrait",
    configurations: "variantes",
    ofStores: (n) => `parmi ${nStores(n)}`,
    restocks24h: "Remises en stock sur 24 h",
    restocksHint: (week, month, days) => `7 j : ${week} · ${days} j : ${month}`,
    sellOuts: (days) => `${days} j de ruptures`,
    stays: (ms) => `tient ~${fmtDuration(ms, "fr")}`,
    noPairs: "aucun couple remise en stock / rupture encore",
    lastRestock: "Dernière remise en stock",
    noneYet: "néant à ce jour",
    thisConfig: "cette variante",
    inDays: (days) => `en ${days} jours`,
    notInStockNow: "Hors ligne à l’instant",
    configsInStock: (n, of) => <span><b className="text-ink">{n}</b>/{of} {n > 1 ? "variantes en ligne" : "variante en ligne"}</span>,
    inStockAt: (n, of) => <span>En ligne dans <b className="text-ink">{n}</b>/{of} {of > 1 ? "magasins" : "magasin"}</span>,
    checked: (live, priceText, tax) => <>Contrôlé {live} · {priceText}{tax}</>,
    taxNote: (c) => taxNote(c.cc),
    beforeTax: "hors taxes",
    buyOnApple: "Ouvrir sur apple.com",
    allStoresIn: (c) => `Tout le réseau ${IN[c.cc]}`,
    everyIphoneHere: "Les autres iPhone, même lieu",
    everyIphone: (where) => `Chaque iPhone ${where}`,
    panel: (model, where) => `${fx(model)}${where ? ` ${where}` : ""} : variantes d’abord, magasins ensuite`,
    unitConfigs: "variantes",
    unitStores: "magasins",
    otherConfigsHere: "Autres variantes, même lieu",
    byStorageColor: "Par capacité et coloris",
    nearestStores: "À courte distance",
    closest: (link, dist) => <>À {dist}, du stock : {link}</>,
    storeCity: (store, city) => <>{store}, {city}</>,
    mostRecentlyInStock: "Vu en ligne en dernier",
    storesWithItNow: "Magasins qui le proposent à l’instant",
    storesIn: (where) => `Les magasins ${where}`,
    colStatus: "état",
    colConfigs: "variantes en ligne",
    noStoreHasIt: "Retrait fermé partout à l’instant.",
    noStoreHereHasIt: "Retrait fermé dans tout le secteur à l’instant.",
    moreStores: (n) => <>La suite (+ {n}) : liste par région, plus bas.</>,
    byRegion: (c) => `Par ${noun(c).one}`,
    byCity: "Par ville",
    nearbyStores: "Les voisins immédiats",
    latestChanges: "Dernières variations",
    nothingLogged: "Registre vide à ce jour.",
    whenRestocks: "À quelle heure le stock revient-il ?",
    howFast: "Combien de temps le stock tient-il ?",
    restocksByConfig: "Les variantes qui reviennent le plus",
    faqTitleCountry: (model, c) => `FAQ — ${fx(model)} ${IN[c.cc]}`,
    faqTitle: (model, where) => `${fx(model)} ${where}`,
    buySource: (model, c) => `Apple (${NAME[c.cc]}) — fiche d’achat de l’${fx(model)}`,
    nearby: "À deux pas",
    otherRegions: (c) => `${cap(noun(c).other)}, les autres`,
    elsewhereIn: (region) => `Ailleurs ${dans(region)}`,
    everyAppleStoreIn: (c) => `Apple Store ${IN[c.cc]} : la liste intégrale`,
    across: (model, c) => `${fx(model)} : tout le réseau ${IN[c.cc]}`,
    itemList: (model, where) => `${fx(model)} ${where}`,
    nearLead: (c, model, inStock, n, have) =>
      inStock === 0
        ? `${fx(model)} : retrait fermé dans tous les Apple Store ${IN[c.cc]} à l’instant. La vraie question devient : quel magasin proche sera réassorti en premier ? Placez une alerte sur chacun de ceux que vous pouvez rejoindre ; la notification part quelques secondes après la mise en ligne.`
        : `${fx(model)} à l’instant : ${nStores(inStock)}/${n} — ${list(L(c.cc), have.slice(0, 5).map((l) => `${l.store}, ${l.city} (${plural("fr", l.configs, { one: "# variante", other: "# variantes" })})`), 5)}.`,
    nearHead: (c) => [cap(noun(c).one), "Magasins avec stock à l’instant"],
    nearCaption: (c, model) => `${fx(model)}, ${noun(c).one} par ${noun(c).one} : retrait au dernier contrôle`,
    nearMe: (c, model, alert) => `Dans le module d’alerte de la page, touchez Autour de moi : les magasins se rangent par distance routière estimée (km) depuis votre position, chacun avec son itinéraire. [Alerte ${fx(model)}](${alert}).`,
    modelFaq: (c, model, low, high, inStock): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L(c.cc), c, v);
      return {
        price: { q: `${fx(model)} ${IN[c.cc]} : quel prix ?`, a: `${money(low)} à ${money(high)} sur apple.com selon la capacité (${taxNote(c.cc)}).` },
        reserve: { q: `${cap(IN[c.cc])}, l’${fx(model)} se réserve-t-il avant d’être en stock ?`, a: `Non. On réserve en achetant : variante affichée, commande avec retrait sur apple.com, Apple la garde jusqu’au créneau.${inStock === 0 ? " Retrait fermé partout à l’instant : seule une alerte vous place en tête." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c, n) => `Remises en stock iPhone ${IN[c.cc]}, à la minute (${n === 1 ? "1 Apple Store" : `${num(L(c.cc), n)} Apple Store`})`,
    metaDescription: (c, n) => `Le fil des remises en stock confirmées ${IN[c.cc]} (${n === 1 ? "1 Apple Store" : `${num(L(c.cc), n)} Apple Store`}) : iPhone Duo, 18 Pro et Pro Max en retrait, avec l’heure, la variante exacte et le magasin sur la carte.`,
    h1: (c) => `${cap(IN[c.cc])}, le fil des remises en stock iPhone`,
    summary: (day, week, model, region) => <>24 h : {nRestocks(day)} · 7 j : {num("fr", week)}{model ? ` · ${fx(model)}` : ""}{region ? ` · ${region}` : ""}. Heures données dans votre fuseau.</>,
    allModels: "Modèle : tous",
    restocks: "Remises en stock",
    withSoldOut: "Remises en stock + ruptures",
    regionLabel: (c) => cap(noun(c).one),
    allRegions: (c) => `${cap(noun(c).one)} : ${noun(c).f ? "toutes" : "tous"}`,
    filter: "Filtrer",
    page: (k) => <>page {k}</>,
    newer: "← Plus récent",
    older: "Plus ancien →",
    getAlerts: "M’alerter",
    byPlace: "Le fil, lieu par lieu",
    byRegion: (c) => `Par ${noun(c).one}`,
    datasetName: (c) => `RestockWire — remises en stock iPhone (retrait), Apple Store ${IN[c.cc]}`,
    datasetDescription: (c) => `Registre des remises en stock et des ruptures confirmées (retrait en magasin) pour l’iPhone Duo, l’iPhone 18 Pro et l’iPhone 18 Pro Max, ${c.cc === "us" ? "sur les 269 Apple Store du territoire américain" : `sur les Apple Store ${IN[c.cc]}`}. Champs : magasin, variante exacte, horodatage. Cadence : 15 secondes, 5 secondes pour les magasins sous alerte. Inscription après deux réponses concordantes d’apple.com.`,
    datasetMeasured: ["Apple Store", "variante d’iPhone (modèle, capacité, coloris)", "horodatage de la remise en stock", "horodatage de la rupture"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c, n) => `iPhone Duo ${IN[c.cc]} : la carte du retrait (${n === 1 ? "1 Apple Store" : `${num(L(c.cc), n)} Apple Store`})`,
    metaDescription: (c, n) => `${cap(IN[c.cc])}, ${n === 1 ? "1 Apple Store" : `${num(L(c.cc), n)} Apple Store`} sur une carte temps réel : où retirer l’iPhone Duo, le 18 Pro ou le Pro Max à l’instant. Filtres par capacité et coloris, mise à jour continue.`,
    // English region keys stay (the client map strings use them); only the country is named in French.
    country: (c) => ({ name: NAME[c.cc], inName: IN[c.cc], regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "Chaque magasin",
    storeCity: (store, city) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c, n, regions, cities, duo, max) => {
      const by = c.regionNoun && regions > 1 ? `, classés par ${noun(c).one} et par ville` : cities > 1 ? ", classés par ville" : "";
      return `${cap(IN[c.cc])}, ${num(L(c.cc), n)} Apple Store suivis à la minute${by}. À l’instant : iPhone Duo en retrait dans ${duo}, Pro Max dans ${max}. Le 18 Pro aussi.`;
    },
    countAnswer: (n, spread, top) => `${n}, ${spread}${top.length ? `. Première place : ${top[0].name} (${top[0].count})${top[1] ? `, puis ${top[1].name} (${top[1].count})` : ""}` : ""}.`,
    howMany: (c) => <>{cap(IN[c.cc])}, combien d’Apple Store ?</>,
    duoNow: (c, n, have): FaqItem => ({
      q: `${cap(IN[c.cc])}, quels Apple Store ont l’iPhone Duo à l’instant ?`,
      a: have.length === 0 ? `Aucun sur ${n} au dernier contrôle. Page et carte basculent dès qu’un magasin le propose ; une alerte vous prévient avant elles.` : `${have.length}/${n} au dernier contrôle — ${have.slice(0, 6).map((x) => apple(x)).join(", ")}${have.length > 6 ? ", entre autres" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L(ctx.stores[0]?.country)),
    duoBlock: (alert) => `Pour décrocher un iPhone Duo, rien ne va plus vite qu’une alerte sur les magasins à portée : [alerte iPhone Duo](${alert}). 1 alerte = 1 magasin × 1 variante précise ; la notification suit la mise en ligne de quelques secondes.`,
    intro: (c, n, spread, now, tax) => `${cap(IN[c.cc])}, retrait ouvert à l’instant : iPhone Duo **${now.duo}**, iPhone 18 Pro Max **${now.max}**, 18 Pro **${now.pro}**. Réseau : **${plural(L(c.cc), n, { one: "# Apple Store", other: "# Apple Store" })}**, ${spread}. ${tax}`,
    crumb: "Apple Store",
    panel: (c) => `Deux choix : les iPhone voulus, puis les magasins accessibles ${IN[c.cc]}`,
    matrixLabel: "Grille magasins × modèles",
    matrixH2: (c) => <>{cap(IN[c.cc])}, chaque magasin, chaque modèle</>,
    matrixHint: "En ligne / suivies, modèle par modèle.",
    topCaption: (c) => <>{cap(noun(c).other)} par nombre d’Apple Store, du plus grand au plus petit (source : annuaire Apple suivi par RestockWire)</>,
    regionHead: (c) => cap(noun(c).one),
    colStores: "Apple Store",
    colCities: "Villes",
    locationsBy: (c) => `La carte du réseau, ${noun(c).one} après ${noun(c).one}`,
    locationsIn: (c) => `${cap(IN[c.cc])}, magasin par magasin`,
    storeCount: (n) => <>{nStores(n)}</>,
    storeCountAll: (n) => <>{nStores(n)}</>,
    whenRestock: (c) => <>{cap(IN[c.cc])}, à quelle heure le stock revient-il ?</>,
    howFast: (c) => <>{cap(IN[c.cc])}, le stock tient combien de temps ?</>,
    faqTitle: (c) => `FAQ — Apple Store ${IN[c.cc]}`,
    getApp: "Installer l’app",
    howItWorks: "Le fonctionnement",
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
    title: (c: Country, place?: RestockTimesPlace) => `iPhone Duo ${place ? (place.kind === "city" ? `à ${place.name}` : `en ${place.name}`) : IN[c.cc]} : à quelle heure revient le stock ?`,
    metaDescription: (x) => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "ville" : "magasin") : c.cc === "us" ? "État" : c.regionNoun ? noun(c).one : "magasin";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `iPhone Duo ${rtW(x)} : ${rtPct(w.share)} des remises en stock tombent ${between(w.from, w.to)} (heure du magasin), sur ${rtN(t.n)} depuis le ${since}${t.sellout ? ` ; ${rtPct(t.sellout.within2min)} épuisées en 2 min` : ""}. Par heure, jour, ${region}, magasin, variante.`,
          `iPhone Duo ${rtW(x)} : ${rtPct(w.share)} des remises en stock tombent ${between(w.from, w.to)} (heure du magasin), sur ${rtN(t.n)} depuis le ${since}. Par heure, jour, ${region} et variante.`,
          `iPhone Duo ${rtW(x)} : ${rtN(t.n)} remises en stock depuis le ${since}, ventilées par heure, jour, ${region} et variante.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `iPhone Duo ${rtW(x)} : ${rtN(t.n)} remises en stock confirmées depuis le ${since}, sur le fil des 15 secondes. Ventilation par heure, jour, ${region}, magasin et variante, durée de chacune incluse.`,
            `iPhone Duo ${rtW(x)} : ${rtN(t.n)} remises en stock confirmées depuis le ${since}. Ventilation par heure, jour, ${region} et variante.`,
          ], 158)
          : `iPhone Duo ${rtW(x)} : créneaux de remise en stock par heure, par jour, par magasin et par variante. Chaque Apple Store passe sur le fil des 15 secondes depuis le ${longDate(t.since)}.`;
    },
    h1: (x) => x.t.unknown
      ? `iPhone Duo ${rtW(x)} : à quelle heure revient le stock ?`
      : x.t.n > 0
        ? `iPhone Duo ${rtW(x)} : à quelle heure revient le stock ? ${x.pattern ? `Surtout ${between(x.w.from, x.w.to)} (heure du magasin)` : "Nos relevés, heure après heure"}`
        : `iPhone Duo ${rtW(x)} : toujours aucune remise en stock. Ce que nous guettons`,
    intro: (x) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtW(x);
      return t.unknown ? (
        <>Registre momentanément inaccessible. Le fil des 15 secondes continue {where} ; les chiffres réapparaîtront au prochain chargement.</>
      ) : t.n > 0 && pattern ? (
        <>
          Créneau dominant {where} : <b className="text-ink">{between(w.from, w.to)}</b> (heure du magasin), avec <b className="text-ink">{rtPct(w.share)} des {rtN(t.n)} remises en stock d’iPhone Duo</b> confirmées depuis le {longDate(t.since)} {one ? "sur l’Apple Store" : "sur les Apple Store"} du pays{x.sell ? <>. Durée de vie médiane : environ {Math.round(x.sell.medianSec / 5) * 5} secondes</> : null}. <b className="text-ink">Le flux ne s’arrête pas</b>{tracked > 1 ? <> : {t.days} jours avec au moins une remise en stock, sur {tracked} suivis</> : <> (un seul jour de suivi à ce stade)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Oui.</b> <b className="text-ink">{rtN(t.n)} remises en stock d’iPhone Duo depuis le {longDate(t.since)}</b> {one ? "sur l’Apple Store" : "sur les Apple Store"} {where}{tracked > 1 ? <>, réparties sur {t.days} jours (sur {tracked})</> : <> (un seul jour de suivi à ce stade)</>}. Un créneau habituel n’est publié qu’à partir de {PATTERN_MIN} remises en stock sur {PATTERN_MIN_DAYS} jours différents.
        </>
      ) : (
        <>
          <b className="text-ink">Pas encore.</b> Depuis le {longDate(t.since)}, {one ? "l’Apple Store" : `les ${x.stores} Apple Store`} {where} passe{one ? "" : "nt"} sur le fil des 15 secondes : aucune remise en stock d’iPhone Duo en retrait confirmée à ce jour.
        </>
      );
    },
    hero: {
      restocks: (x) => `remises en stock confirmées, depuis le ${dateLabel(x.t.since, false)}`,
      window: (x) => `${between(x.w.from, x.w.to)} (heure du magasin)`,
      days: "jours « actifs » (≥ 1 remise en stock)",
      now: (one) => (one ? "magasin avec du stock en retrait à l’instant" : "magasins avec du stock en retrait à l’instant"),
      today: (x, today: DayRow) => `aujourd’hui à cette heure (${dateLabel(today.date)})${x.one ? "" : `, sur ${nStores(today.stores)}`}`,
      weekday: "jour de la semaine en tête, à ce jour",
    },
    heroPoints: (x, latest): Point[] => [
      ...(latest ? [{ text: <>Dernière en date : <b className="text-ink">{latest.config}</b>{x.one ? null : <> chez <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}, {localStamp(latest.at, latest.store, L(latest.store.country))} (heure du magasin)</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>Jour le plus actif : le <b className="text-ink">{WD[x.t.peakWeekday]}</b></> }] : []),
      { text: <>Apple ne publie <b className="text-ink">aucun calendrier de réassort</b>. Source unique : nos contrôles confirmés, recalculés toutes les cinq minutes environ</>, no: true },
    ],
    emptyPoints: (x): Point[] => [
      { text: <>À l’instant : <b className="text-ink">{x.duoNow}/{x.stores}</b> {x.duoNow > 1 ? "magasins proposent" : "magasin propose"} le retrait</> },
      { text: <>Les tableaux plus bas démarreront avec la première remise en stock confirmée</>, step: true },
      { text: <>L’échantillon le plus large, heure par heure et jour par jour : <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">la page États-Unis</Link>{EN}</>, step: true },
    ],
    setUpAlert: "Alerte iPhone Duo",
    logLive: "Le fil des remises en stock, à la minute",
    onThisPage: "Sommaire",
    nav: (x) => ({
      "time-of-day": "Heures",
      "day-by-day": "Jours",
      where: `${cap(rtU(x))}s`,
      configuration: "Variantes",
      "how-long": "Durée de vie",
      unavailable: "« Indisponible »",
      reddit: "Reddit",
      method: "Méthode",
    }),
    h2: (x) => ({
      "time-of-day": `${cap(rtW(x))}, à quelle heure l’iPhone Duo revient-il ?`,
      "day-by-day": `${cap(rtW(x))}, l’iPhone Duo jour après jour`,
      where: `${cap(rtW(x))}, où l’iPhone Duo revient-il le plus ?`,
      configuration: `${cap(rtW(x))}, quelles variantes d’iPhone Duo reviennent le plus ?`,
      "how-long": `${cap(rtW(x))}, combien de secondes avant la rupture ?`,
      unavailable: "« Actuellement indisponible » partout sur apple.com : pourquoi ?",
      reddit: "iPhone Duo : les rumeurs de Reddit face à notre registre",
      method: "Remise en stock : notre définition",
    }),
    faq: (x): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
      const window = between(w.from, w.to);
      return [
        { q: `${cap(where)}, à quelle heure l’iPhone Duo revient-il en stock ?`, a: t.n > 0 && pattern
          ? `${cap(window)} (heure du magasin) : ${rtPct(w.share)} des ${rtN(t.n)} remises en stock confirmées depuis le ${longDate(t.since)}. La plage 8 h–midi en pèse ${rtPct(hourShare(t.byHour, 8, 12))}. Aucun calendrier officiel : c’est notre mesure, recalculée toutes les cinq minutes environ.`
          : `${cap(nConfirmed(t.n))} ${where} depuis le ${longDate(t.since)}${t.days ? `, sur ${nDays(t.days)}` : ""}. Apple ne publie aucun calendrier. Le créneau habituel s’affichera seul à partir de ${PATTERN_MIN} remises en stock sur ${PATTERN_MIN_DAYS} jours différents.` },
        { q: `Le stock d’iPhone Duo revient-il aussi le samedi et le dimanche${us ? "" : ` ${where}`} ?`, a: t.n > 0
          ? `${weekend > 0 ? "Oui" : "Pas à ce jour"} : week-end = ${nRestocks(weekend)} sur ${rtN(t.n)} (${rtPct(weekend / t.n)}). ${t.peakWeekday != null ? `En tête de semaine : le ${WD[t.peakWeekday]}.` : `Le jour le plus actif n’est désigné qu’après ${WEEKDAY_MIN_SPAN} jours de données ; compteur actuel : ${tracked}.`}`
          : `Rien à dire du week-end ${where} pour l’instant : le tableau des jours grandit à chaque remise en stock confirmée.` },
        { q: "Surveillance manuelle : quel horaire ?", a: t.n > 0 && pattern
          ? `En manuel : apple.com ouvert, option retrait cochée, dès ${hourFr(w.from)} (heure du magasin). Ces deux heures pèsent ${rtPct(w.share)} des remises en stock. ${sell ? `Durée de vie médiane : ${sell.medianSec} secondes` : "Durée de vie : une minute environ"}. D’où l’intérêt d’une alerte sur le fil des 5 secondes ([alertes, page en anglais](/iphone-duo-restock-alerts)) face au rafraîchissement manuel.`
          : `${cap(where)}, le créneau n’est pas encore établi. Une alerte veille pour vous : vos magasins passent sur le fil des 5 secondes, nuit comprise ([alertes, page en anglais](/iphone-duo-restock-alerts)).` },
        { q: "« Indisponible » dans tous les Apple Store : est-ce normal ?", a: sell
          ? `Oui, car le stock disparaît vite : ${where}, sur ${rtN(sell.n)} remises en stock mesurées jusqu’à la rupture, ${rtPct(sell.within2min)} ont duré moins de 2 minutes et ${rtPct(sell.within20min)} moins de 20. À l’instant, ${x.duoNow}/${x.stores} magasins proposent le retrait : « indisponible » est donc la réponse exacte la plupart du temps, même un jour chargé ([le sens d’« indisponible », page en anglais](/apple-store-pickup-explained)).`
          : `Oui : le stock de retrait ne reste en ligne que quelques minutes. À l’instant, ${x.duoNow}/${nStores(x.stores)} ${where} le proposent ([le sens d’« indisponible », page en anglais](/apple-store-pickup-explained)).` },
        { q: "Mon Apple Store reçoit l’iPhone Duo : comment le savoir aussitôt ?", a: `Avec une alerte sur ce magasin, capacité et coloris précis. Le magasin passe alors sur le fil des 5 secondes, et la notification arrive environ 3 secondes après la confirmation ([créer l’alerte](${x.alert}) ; [le mécanisme, page en anglais](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple — page d’aide sur le retrait et la disponibilité en magasin (en anglais)",
      newsroom: "Apple Newsroom, 23 octobre 2026 (en anglais) — arrivée de l’iPhone Duo dans les Apple Store",
      macRumors: "MacRumors, 24 octobre 2026 (en anglais) — retour du retrait en Apple Store pour l’iPhone Duo aux États-Unis et au Canada",
      reports: (tracker) => `${tracker} — relevés de remises en stock d’iPhone Duo, semaine de lancement (données tierces, affichées à part, exclues de nos chiffres)`,
    },
    ld: (x) => ({
      datasetName: `RestockWire — créneaux de remise en stock de l’iPhone Duo (retrait), Apple Store ${rtW(x)}`,
      description: `Remises en stock confirmées de l’iPhone Duo en retrait, Apple Store ${rtW(x)}, depuis le ${longDate(x.t.since)} : magasin, variante, horodatage. Relevés RestockWire sur le fil des 15 secondes, agrégés par heure du magasin, jour, ${x.place?.kind === "city" ? "" : `${rtU(x)}, `}magasin et variante.`,
      spatial: `Apple Store ${rtW(x)}`,
      measured: ["horodatage de la remise en stock (heure du magasin)", "Apple Store", "variante d’iPhone Duo (capacité, coloris)", "durée en secondes jusqu’à la rupture"],
      size: `${nRestocks(x.t.n)} sur ${nStores(x.t.stores)}`,
    }),
    crumb: "Créneaux de l’iPhone Duo",

    // ---- time of day
    timeLead: (x) => <b>{cap(between(x.w.from, x.w.to))} (heure du magasin) : {rtPct(x.w.share)} des {rtN(x.t.n)} remises en stock. De 8 h à midi : {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count) => `${nRestocks(count)} sur l’heure de pointe`,
    morning: "8 h – midi",
    evening: "17 h et au-delà : le stock tombe aussi le soir",
    night: "minuit – 6 h",
    tooFew: (x) => <b>Trop peu de jours pour fixer un créneau{rtYet(x)} : {nConfirmed(x.t.n)}, {nDays(x.t.days)}, depuis le {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Seuil de publication d’un créneau : <b className="text-ink">{PATTERN_MIN} remises en stock sur {PATTERN_MIN_DAYS} jours différents</b></> },
      { text: <>Une rafale isolée ne fait pas un créneau</>, no: true },
      { text: <>La page se met à jour seule, jour après jour</>, step: true },
    ],
    hourCaption: (x) => `iPhone Duo ${rtW(x)} : ${nRestocks(x.t.n)} ventilées par heure du magasin, du ${dateLabel(x.t.since, false)} à ce jour`,
    hourHead: ["Heure du magasin", "Remises en stock", "Poids"],
    morningKeys: (x): Point[] => [
      { text: <>Rien à voir avec l’heure d’ouverture{x.us ? " (10 h dans la plupart des Apple Store américains)" : ""} : <b className="text-ink">le pic du matin la précède</b></> },
      { text: <>Apple publie le stock de retrait <b className="text-ink">sur apple.com d’abord</b> ; le magasin ouvre ensuite</> },
      { text: <>Surveillance manuelle : visez <b className="text-ink">{rangeFr(x.w.from, x.w.to)}</b> en semaine</>, step: true },
      { text: <>Les <b className="text-ink">22 autres heures</b>, quand plus personne ne regarde ? Une <Link href={x.alert}>alerte</Link> s’en charge</>, step: true },
    ],
    storeChartKeys: (x): Point[] => [{ text: <>Chaque fiche magasin a son propre graphique horaire, dans son fuseau (<Link href={x.storesHref}>{x.us ? "les magasins, État par État" : `magasins ${rtW(x)}`}</Link>) : de quoi repérer le magasin servi à 8 h quand sa région culmine à 9 h</>, step: true }],

    // ---- day by day
    dayLead: (x) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>Un seul jour de suivi à ce stade ({dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}) : {nConfirmed(t.n)}{one ? "" : `, ${nStores(t.stores)}`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `${t.days} jours suivis, ${t.days} jours avec` : `${t.days} jour${t.days > 1 ? "s" : ""} sur ${tracked} depuis le ${longDate(t.since)} avec`} au moins une remise en stock confirmée{t.peakWeekday != null ? `. En tête : le ${WD[t.peakWeekday]}` : ""}.</b>
      ) : (
        <b>{cap(rtW(x))}, zéro remise en stock confirmée depuis le {longDate(t.since)}.</b>
      );
    },
    daysTracked: "jours actifs sur la période suivie",
    busiestDay: (x, day) => `record : ${dateLabel(day.date)}${x.one ? "" : `, ${nStores(day.stores)}`}`,
    busiestDayNone: "jour record",
    drop: (x, drop) => `magasins servis dans la même demi-heure, ${zoneStamp(drop.at, x.c)} (${plural("fr", drop.restocks, { one: "# variante", other: "# variantes" })}) : un lâcher national`,
    weekend: (x) => `le week-end (${nRestocks(x.weekend)})`,
    dayCaption: (x) => `iPhone Duo ${rtW(x)} : remises en stock jour par jour${x.t.reports.length ? ". Lignes « signalé » : données publiées par des sites de suivi tiers avant l’ouverture de notre fil, gardées pour la chronologie seulement" : ""}`,
    dayHead: { date: "Jour", restocks: "Remises en stock", stores: "Magasins", busiest: "Heure de pointe", source: "Origine" },
    soFar: " · en cours",
    reportedBy: (names) => <>source : {names.join(" / ")}</>,
    dayKeys: (x, launch, resumed): Point[] => [
      { text: <>Jour J, <b className="text-ink">{dateLabel(launch)}</b> : les commandes en ligne partent en livraison</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b> : réouverture du retrait en magasin{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>{x.reportNames.join(" et ")} ont publié des relevés pendant la semaine de lancement : lignes <b className="text-ink">signalé</b>, hors de tout total</> }
        : { text: <>Ouverture du fil {rtW(x)}, tous magasins : <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>Jour record désigné après <b className="text-ink">{WEEKDAY_MIN_SPAN} jours</b> de données (compteur : {x.tracked})</>, no: true }] : []),
      { text: <>Surveillez la colonne <b className="text-ink">magasins</b> : plus le stock est dispersé, plus vos chances montent</>, step: true },
    ],

    // ---- where
    whereLead: (x, hit, total) => (
      <b>En tête depuis le {dateLabel(x.t.since, false)} : {hit[0].name}, {nRestocks(hit[0].restocks)} sur {hit[0].stores}/{nStores(hit[0].storesTotal)}{hit[1] ? <> ; puis {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <>, {hit[2].name} ({rtN(hit[2].restocks)})</> : null}. Bilan : {hit.length}/{total} {rtUs(x)} servis{total - hit.length > 0 ? `, ${total - hit.length} encore à zéro` : ""}.</b>
    ),
    whereNone: (x) => <b>{cap(rtW(x))}, {x.us || !noun(x.c).f ? "aucun" : "aucune"} {rtU(x)} n’a encore de remise en stock confirmée. Le tableau démarrera avec la première.</b>,
    regionCaption: (x) => `iPhone Duo ${rtW(x)} : remises en stock confirmées par ${rtU(x)}, du ${dateLabel(x.t.since, false)} à ce jour`,
    regionHead: (x) => [cap(rtU(x)), "Remises en stock", "Magasins servis", "Dernière (heure du magasin)"],
    ofN: (a, b) => <>{a}/{b}</>,
    storesCaption: (x) => `iPhone Duo ${rtW(x)} : les magasins les plus servis, du ${dateLabel(x.t.since, false)} à ce jour`,
    storesHead: ["Magasin", "Remises en stock", "Jours", "Créneau habituel", "Dernière (heure du magasin)"],
    swaps: (x) => [
      { no: "Viser le n° 1 du classement, même à l’autre bout du pays", yes: `Deux ou trois magasins à moins d’une heure, en veille dès ${x.pattern ? hourFr(x.w.from) : "le matin"}`, why: "Un stock inaccessible ne sert à rien. Et même le magasin le plus actif reste « indisponible » presque toute la journée." },
      { no: "Parier sur un seul magasin", yes: "Une alerte par magasin, puis direction celui qui sonne", why: "Le classement sert uniquement à choisir lequel de vos magasins rejoindre d’abord." },
    ],
    nearMe: `Le Duo près de chez moi, à la minute${EN}`,

    // ---- configuration
    configLead: (x, top, rarest) => (
      <b>N° 1 : {top.label}, {rtN(top.restocks)} remises en stock sur {rtN(x.t.n)} ({rtPct(top.restocks / x.t.n)}){rarest ? `. Dernier : ${rarest.label}, ${nRestocks(rarest.restocks)}` : ""}.</b>
    ),
    mostRestocked: (config) => `${config} : la variante la plus souvent de retour`,
    versus: (a, bCount, b) => `en ${a}, face à ${rtN(bCount)} en ${b}`,
    restocksOf: (a) => `remises en stock en ${a}`,
    byStorage: "capacité",
    byColour: "coloris",
    configNone: (x) => <b>{cap(rtW(x))}, aucune variante n’a encore de remise en stock confirmée{rtYet(x)}. Les huit lignes attendent déjà la première.</b>,
    configCaption: (x) => `iPhone Duo ${rtW(x)} : remises en stock confirmées par variante, du ${dateLabel(x.t.since, false)} à ce jour`,
    configHead: ["Variante", "Remises en stock", "Poids", "Dernière (heure du magasin)"],
    configKeys: (x): Point[] => [
      { text: <>La variante pèse <b className="text-ink">plus lourd que le magasin</b></> },
      x.storageRatio != null
        ? { text: <>Visez la capacité la plus servie : environ <b className="text-ink">{num("fr", x.storageRatio)}×</b> plus de chances qu’avec la suivante</> }
        : { text: <>Gain <b className="text-ink">net</b> si vous visez la capacité la plus servie</> },
      { text: <>Le <b className="text-ink">2TB</b>, lui, passe par la livraison, avec délai</>, no: true },
      { text: <>Prix et stock à la minute : <Link href="/iphone-duo-most-restocked-stores">quel iPhone Duo revient le plus souvent ?</Link>{EN}</>, step: true },
    ],

    // ---- how long
    howLongLead: (x, sell: SelloutFacts) => <b>{cap(rtW(x))}, durée de vie médiane : {sell.medianSec} secondes, sur {rtN(sell.n)} remises en stock suivies jusqu’à la rupture. Moins de 2 min : {rtPct(sell.within2min)}. Moins de 20 min : {rtPct(sell.within20min)}.</b>,
    secUnit: "s",
    medianListing: "durée en ligne médiane",
    within2: "épuisées en moins de 2 min",
    within20: "épuisées en moins de 20 min",
    fastest: "rupture la plus rapide relevée",
    howLongNone: (x) => <b>{cap(rtW(x))}, pas assez de cycles complets{rtYet(x)} : mesure à partir de dix. Série complète sur la page États-Unis (en anglais).</b>,
    howLongKeys: (x): Point[] => [
      { text: <>Deux minutes : assez pour une <b className="text-ink">alerte</b>, trop peu pour rafraîchir apple.com à la main</> },
      { text: <>Tout le reste de la page découle de ce chiffre</> },
      { text: <>Chaque remise en stock et sa durée, par variante et par {rtU(x)} : <Link href="/how-fast-does-iphone-duo-sell-out">en combien de temps l’iPhone Duo est-il épuisé ?</Link>{EN}</>, step: true },
    ],
    measured: "Mesure : du contrôle qui voit la variante apparaître à celui qui la voit disparaître. C’est un majorant ; la durée réelle est plus courte.",

    // ---- unavailable
    unavailableLead: (x) => <b>Le stock passe comme un éclair. {cap(rtW(x))} : {x.one ? "1 magasin" : `${rtN(x.stores)} magasins`} × {x.configs} variantes = {rtN(x.pairs)} combinaisons possibles. À l’instant, {x.duoNow} {x.duoNow > 1 ? "magasins proposent" : "magasin propose"} un iPhone Duo, toutes variantes confondues.</b>,
    pairs: "combinaisons magasin × variante",
    listingNow: "avec un iPhone Duo en retrait à l’instant",
    goneIn2: "des remises en stock finies en moins de 2 min",
    last24: "remises en stock confirmées, 24 h",
    unavailableKeys: (x, today): Point[] => [
      x.recent.restocks > 0
        ? { text: <>24 dernières heures : <b className="text-ink">{nConfirmed(x.recent.restocks)}</b>, {nStores(x.recent.stores)} {rtW(x)}</> }
        : today > 0
          ? { text: <>Aujourd’hui : <b className="text-ink">{nConfirmed(today)}</b> {rtW(x)}</> }
          : { text: <>Le tableau des jours, plus haut, recense les remises en stock bien réelles</> },
      { text: <><b className="text-ink">Une à deux minutes</b> de présence sur apple.com, à chaque fois</> },
      { text: <>Apple n’a <b className="text-ink">pas</b> cessé les envois parce qu’apple.com dit « indisponible » partout un jour donné</>, no: true },
    ],
    unavailableLinks: { explained: `« Actuellement indisponible pour le retrait » : décryptage${EN}`, howToGet: `iPhone Duo : la méthode pour l’obtenir${EN}` },

    // ---- reddit
    redditLead: (x) => <b>Sur <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> comme sur <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>, les conseils sont souvent de bonne foi, tirés d’un seul magasin, périmés le lendemain. Les quatre plus répétés, passés au crible de {rtN(x.t.n)} remises en stock confirmées {rtW(x)} :</b>,
    redditCaption: "iPhone Duo : quatre idées reçues de Reddit, vérifiées sur le registre RestockWire",
    redditHead: ["Idée reçue", "Verdict du registre"],
    claims: (x): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "« Le réassort se fait la nuit, il faut regarder vers 3 h. »", answer: t.n > 0 ? <>Minuit–6 h (heure du magasin) : {rtPct(hourShare(t.byHour, 0, 6))} des remises en stock. {cap(between(w.from, w.to))} : {rtPct(w.share)}.</> : "Registre encore vide : impossible de trancher." },
        { claim: "« Il n’y a qu’un jour de réassort par semaine. »", answer: t.n > 0 ? (t.peakWeekday != null ? <>Le {WD[t.peakWeekday]} est en tête ({rtN(t.byWeekday[t.peakWeekday])}/{rtN(t.n)}), mais {t.days} jours sur {tracked} ont eu leur remise en stock.</> : <>{t.days} jours sur {tracked} ont eu leur remise en stock{t.days === tracked ? ", sans exception" : ""}. Jour record désigné après {WEEKDAY_MIN_SPAN} jours de données.</>) : "Registre encore vide : impossible de trancher." },
        { claim: "« Le magasin sait quand passe le camion, il suffit d’appeler. »", answer: "Aucun calendrier n’existe. Le stock de retrait est libéré en ligne ; le magasin le découvre en même temps que vous." },
        { claim: "« Marqué indisponible = plus jamais disponible. »", answer: recent.restocks > 0 ? <>Faux : {nConfirmed(recent.restocks)} sur {nStores(recent.stores)} en 24 heures, chacune retombée à « indisponible » en quelques minutes.</> : t.n > 0 ? <>Faux : {rtN(t.n)} remises en stock confirmées depuis le {dateLabel(t.since, false)}, chacune retombée à « indisponible » en quelques minutes.</> : "Registre encore vide : impossible de trancher." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Sans <b className="text-ink">données</b>, les rumeurs prospèrent. Ici, les données sont publiques et gratuites</> },
      { text: <>Un conseil de Reddit tient la route : <b className="text-ink">préparer le paiement</b> (compte connecté, Apple Pay prêt). Notre méthode en 20 secondes : <Link href="/iphone-duo-restock-checkout-guide">le guide</Link>{EN}</> },
    ],

    // ---- method
    methodLead: <b>Remise en stock = une variante qui passe en retrait sur apple.com dans un magasin où elle n’était pas proposée, avec deux contrôles concordants.</b>,
    methodKeys: (x): Point[] => [
      { text: <>Cadence : <b className="text-ink">5 secondes</b> pour les magasins sous alerte, <b className="text-ink">15 secondes</b> pour {x.one ? "l’Apple Store" : "l’ensemble des Apple Store"} {rtW(x)}</> },
      { text: <>Pour comparaison, intervalles publiés par d’autres sites de suivi : <b className="text-ink">8 secondes à 15 minutes</b></> },
      { text: <>Contre-vérification <b className="text-ink">environ une seconde après</b> tout premier « disponible »</> },
      { text: <>Rupture : validée par le <b className="text-ink">cycle d’après</b></> },
      { text: <>Premier relevé d’un magasin, requête ratée, délai dépassé : ni remise en stock ni rupture, <b className="text-ink">jamais</b></>, no: true },
      { text: <>Heures et dates en <b className="text-ink">heure du magasin</b> ; une « vague » = la même demi-heure dans chaque fuseau</> },
      { text: <>Données de sites tiers{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} : lignes à part, étiquetées, <b className="text-ink">hors de tout total</b></> },
      { text: <>Recalcul des tableaux : toutes les cinq minutes environ. En temps réel : <Link href={x.logHref}>le fil des remises en stock</Link></>, step: true },
    ],
    quote: "Citer cette page : tout chiffre peut être repris, avec un lien vers elle. RestockWire est indépendant d’Apple ; nous lisons la disponibilité en retrait publique d’apple.com, simplement beaucoup plus souvent.",
    alertIn: (x) => <>Alerte iPhone Duo{x.one ? "" : ` ${rtW(x)}`}</>,

    // ---- related, FAQ, sources
    related: "iPhone Duo : d’autres réponses",
    sameData: `Même registre, autre angle${EN}`,
    questions: {
      sellOut: "Combien de temps tient le stock ?",
      alerts: "Être prévenu le premier",
      howToGet: "Décrocher le sien, en pratique",
      whichConfig: "La variante qui revient le plus",
      nearMe: "Le stock autour de moi",
      unavailable: "« Indisponible » : ce que ça veut dire",
    },
    otherCountries: (us) => (us ? "Version d’autres pays" : "Autres pays"),
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "Pages par ville",
      storesLive: (x: RestockTimesView) => `Apple Store ${rtW(x)} : stock en direct`,
      countryPage: (c: Country) => `Heures de remise en stock de l’iPhone Duo ${IN[c.cc]}, tous les magasins`,
      sourcesWhere: (x: RestockTimesView) => `les ${x.stores} Apple Store ${rtW(x)}`,
    },
    faqTitle: "Vos questions",
  },
};
