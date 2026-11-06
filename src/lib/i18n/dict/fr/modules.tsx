/**
 * Chaînes françaises : modules — retours en stock, magasins et stock (src/components/{restocks,stores,stock}).
 * `label` arrive avec sa préposition de lieu (« à Paris », « dans le Rhône », « chez Apple Opéra », « ici »).
 * Nombres bruts (num / plural) ; durées, heures et dates déjà mises en forme par l’appelant.
 */
import type { Dict } from "../en";
import { num, plural } from "@/lib/i18n/format";

const n = (v: number) => num("fr", v);
const restocks = (v: number) => plural("fr", v, { one: "# remise en stock", other: "# remises en stock" });
const soldouts = (v: number) => plural("fr", v, { one: "# rupture", other: "# ruptures" });
const jours = (v: number) => plural("fr", v, { one: "# jour", other: "# jours" });
const variantes = (v: number) => plural("fr", v, { one: "# variante", other: "# variantes" });

export const modules: Dict["modules"] = {
  daily: {
    empty: (label, days) => `Graphique vide ${label} : ${days} jours sans remise en stock ni rupture. La première barre viendra avec le premier mouvement.`,
    summary: (r, s, label, days, activeDays) => `Bilan ${label}, ${days} jours : ${restocks(r)}, ${soldouts(s)}, sur ${jours(activeDays)} d’activité.`,
    busiest: (day, r) => <> Record : <b className="text-ink">{day}</b>, avec {n(r)}.</>,
    barAria: (day, r, s) => `${day} — ${restocks(r)}, ${soldouts(s)}`,
    barTitle: (day, r, s) => `${day} — ${restocks(r)} / ${soldouts(s)}`,
    legendRestocks: "remises en stock",
    legendSoldouts: "ruptures de stock",
  },

  last24: {
    title: (label) => `iPhone Duo ${label} : les 24 dernières heures`,
    asOf: (when) => `arrêté au ${when}`,
    localTime: (when) => `${when} (heure du magasin)`,
    anAppleStore: "un Apple Store",
    unknown: "Bilan 24 h momentanément indisponible. Le stock en temps réel et le fil des remises en stock fonctionnent normalement.",
    none: (label, asOf) => <><b className="text-ink">iPhone Duo {label} : 24 heures sans remise en stock</b> (arrêté au {asOf}).</>,
    some: (o) => (
      <>En 24 heures : <b className="text-ink">{restocks(o.restocks)} d’iPhone Duo {o.one ? o.label : `${o.label}, dans ${n(o.withStores)} Apple Store sur ${n(o.allStores)}`}</b>. Dernière en date : <b className="text-ink">{o.config}</b>{o.store != null && <> chez {o.store}</>}, {o.when} (heure du magasin).</>
    ),
    tileRestocks: "remises en stock confirmées, 24 h",
    tileConfigsBack: "variantes revenues",
    tileStores: (configs, allConfigs) => `magasins réassortis${configs ? ` · ${variantes(configs)} sur ${n(allConfigs)}` : ""}`,
    tileLatest: (config, store) => <>dernière · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config, store, day) => <>avant-dernière · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "registre vide avant celle-ci",
    caption: (label, asOf) => `iPhone Duo ${label}, variante par variante : remises en stock confirmées en 24 h (arrêté au ${asOf})`,
    thConfig: "Variante",
    thRestocks: "Remises en stock",
    thStores: "Magasins",
    thLast: "Dernière (heure du magasin)",
    thNow: "En ligne à l’instant",
    ofStores: (k, total) => `${n(k)}/${n(total)}`,
    noneIn24: "néant sur 24 h",
    yes: "oui",
    no: "non",
    countedTitle: "Qu’appelle-t-on remise en stock ici ?",
    counted: "Uniquement nos propres relevés du retrait en magasin d’apple.com. Cadence : 15 secondes pour tous les magasins, 5 secondes pour ceux visés par une alerte. Deux contrôles concordants sont exigés avant toute inscription. Le premier relevé d’un magasin est exclu. Aucune donnée d’un site de suivi tiers n’est mêlée à ce décompte.",
    alert: (label) => `Alerte${label != null ? ` ${label}` : ""} : la prochaine remise en stock sur votre écran en quelques secondes`,
  },

  clock: {
    none: (label, days) => `${label.charAt(0).toUpperCase()}${label.slice(1)} : aucune remise en stock en ${days} jours, à ce stade.`,
    thin: (total, label, days, dates) => `${restocks(total)} ${label} en ${days} jours${dates != null ? `, sur ${jours(dates)}` : ""}. Trop peu pour fixer un créneau habituel.`,
    pattern: (total, label, days, hour, day) => (
      <>Créneau habituel : <b className="text-ink">{hour}</b> (heure du magasin){day ? <>, avec le <b className="text-ink">{day}</b> en tête</> : null}. Base : {restocks(total)} {label} en {days} jours.</>
    ),
    byHour: (zone) => `Heure par heure · ${zone}`,
    byWeekday: "Du lundi au dimanche",
    barReported: (k) => ` (+${n(k)} de source tierce)`,
    barReportedTitle: (bar, k) => `${bar} — source tierce : ${n(k)}`,
    legendOurs: "Confirmé par RestockWire",
  },

  feed: {
    empty: "Aucune entrée au fil pour l’instant.",
    available: "Disponible",
    soldOut: "Épuisé",
    soldOutAt: (time) => <>épuisé {time}</>,
    since: (time) => <>en ligne depuis {time}</>,
    restockedAt: (time) => <>de retour {time}</>,
    mapAria: (store) => `${store} sur la carte`,
    map: "Plan",
    buyAria: (model, config) => `${model} ${config} : page d’achat apple.com`,
    buy: "Vers apple.com",
  },

  byConfig: {
    empty: (label, days) => `Classement vide ${label} : aucune variante revenue en ${days} jours.`,
    intro: (label, days) => `Variantes revenues en stock ${label} en ${days} jours, de la plus fréquente à la plus rare.`,
    times: (k) => `${n(k)}×`,
    alert: "Créer une alerte",
  },

  sellout: {
    typical: (label, band) => `iPhone Duo ${label} : une remise en stock tient en général ${band} avant la rupture.`,
    half: (label, duration) => `${label.charAt(0).toUpperCase()}${label.slice(1)}, la moitié des remises en stock disparaît en ${duration}.`,
    none: (label, days) => `Aucun cycle complet remise en stock → rupture ${label} en ${days} jours.`,
    whatDuo: "iPhone Duo",
    whatAll: "l’ensemble des iPhone",
    tileHalf: (what) => <>50 % épuisé en · {what}</>,
    tileWithin30: "épuisés en 30 s ou moins",
    tileWithin60: "épuisés en 1 min ou moins",
    tileFastest: (k, days) => <>record · {restocks(k)} suivies jusqu’à la rupture, {days} j</>,
    caption: (days) => `Modèle par modèle, ${days} jours`,
    thIphone: "iPhone",
    thSoldOut: "Ruptures",
    thHalf: "50 % épuisé en",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Record",
    each: "Chaque ligne = une remise en stock",
    barNote: (full) => `barre = secondes en ligne · pleine à ${full}`,
    stillListed: (duration) => `encore en ligne · ${duration}`,
    approx: (range) => `≈ ${range}`,
    measuredTitle: "D’où viennent ces durées ?",
    measured: (estimated) =>
      `Lecture d’une ligne « épuisé en 45–60 s » : le contrôle à 45 secondes voyait encore la variante en ligne, celui à 60 secondes ne la voyait plus. Chaque fourchette a la largeur d’un intervalle entre deux contrôles, soit 5 secondes pour les magasins sous alerte et 15 secondes pour les autres${estimated ? ". Les lignes ≈ sont antérieures à l’archivage du dernier contrôle : elles sont bornées par le cycle de 15 secondes" : ""}. Un stock plus bref qu’un intervalle peut passer inaperçu : la vraie part de ruptures en moins de 30 secondes est donc supérieure à celle du tableau.`,
  },

  configTable: {
    title: "Les variantes de ce magasin, une par une",
    titleAt: (store) => `${store} : chaque variante, en direct`,
    lookupOff: (hasRows) => `Consultation du retrait coupée par Apple pour ce magasin${hasRows ? " ; dernières réponses connues ci-dessous" : ""}`,
    tracked: (k) => plural("fr", k, { one: "# variante suivie", other: "# variantes suivies" }),
    firstSweep: "Premier passage en cours · statuts sous une minute",
    inStock: (k, total) => `${n(k)}/${n(total)} en ligne`,
    available: "Disponible",
    unavailable: "Indisponible",
    noLookup: "retrait non consultable",
    notChecked: "contrôle à venir",
    since: (ago) => <>en ligne depuis {ago}</>,
    lastAvailable: (ago) => <>vu en ligne {ago}</>,
    neverHere: "jamais proposé ici à ce jour",
    buy: "Acheter",
    alertAria: (model, config, store) => `Alerte : ${store}, ${model} ${config}`,
    alert: "Créer une alerte →",
  },

  matrix: {
    store: "Magasin",
    checked: "Contrôle",
    cellTitle: (model, k, total) => `${model} — ${variantes(k)} en ligne sur ${n(total)}`,
  },

  nearby: {
    duo: (short, k) => `${short} : ${n(k)}`,
    noDuo: (short) => `${short} : 0`,
  },

  stockByModel: {
    availableNow: (k, total) => `En ligne à l’instant : ${variantes(k)} sur ${n(total)}`,
    noneNow: (total) => `En ligne à l’instant : 0 sur ${n(total)}`,
    lookupOff: "Consultation du retrait coupée par Apple pour ce magasin",
    notChecked: "contrôle à venir",
    more: (k) => `+${n(k)}`,
    checked: (ago) => <>contrôlé {ago}</>,
    alert: "Créer une alerte →",
  },

  storeBlock: {
    checked: (ago) => <>Contrôlé {ago} · fil de 15 s, 5 s sous alerte</>,
    map: "Situer sur la carte",
    alert: "Surveiller ce magasin",
    alsoIn: (region) => `${region} : les autres magasins`,
    acrossLine: "Juste de l’autre côté de la limite",
    elsewhere: "Hors secteur, au plus près",
  },

  hours: {
    title: "Horaires",
    local: (zone) => `Heure du magasin · ${zone}`,
    today: (hours, week) => ` · ce jour : ${hours} · ${week}`,
    directions: "Y aller",
    applePage: "la fiche apple.com du magasin",
    liveMap: "Carte temps réel",
    storePage: "Fiche du magasin",
    closed: "Fermé",
    everyDay: (hours) => `7 jours sur 7, ${hours}`,
    openNow: (closes) => `Ouvert · fermeture à ${closes}`,
    opensAt: (opens) => `Ouverture à ${opens}`,
    closedToday: (next) => (next ? `Porte close aujourd’hui · réouverture ${next}` : "Porte close aujourd’hui"),
    closedNow: (next) => (next ? `Fermé · réouverture ${next}` : "Fermé à cette heure"),
    nextOpen: (day, time) => `${day ?? "demain"}, ${time}`,
  },

  liveStats: {
    inStock: "En ligne à l’instant",
    storesWith: "Magasins approvisionnés",
    lastCheck: "Dernier contrôle",
    none: "—",
  },

  board: {
    summary: (k, stores, short) => `${short} à l’instant : ${plural("fr", k, { one: "# magasin", other: "# magasins" })} sur ${n(stores)}`,
    lastCheck: (ago) => <>Dernier contrôle {ago}</>,
    firstSweep: "Premier passage en cours.",
    noneListed: (model, storage, color) => `Aucun magasin ne propose l’${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} à l’instant.`,
    more: (k) => `+${n(k)}`,
    seen: (ago) => <>En ligne {ago}</>,
    loading: "Stock en cours de lecture",
  },
};
