/**
 * Chaînes françaises : modules — retours en stock, magasins et stock (src/components/{restocks,stores,stock}).
 * `label` est déjà une expression de lieu avec sa préposition (« à Paris », « dans le Rhône », « chez Apple Opéra »,
 * « ici »). Les nombres arrivent bruts (num / plural) ; durées, heures et dates arrivent déjà formatées.
 */
import type { Dict } from "../en";
import { num, plural } from "@/lib/i18n/format";

const n = (v: number) => num("fr", v);
const restocks = (v: number) => plural("fr", v, { one: "# retour en stock", other: "# retours en stock" });
const soldouts = (v: number) => plural("fr", v, { one: "# rupture", other: "# ruptures" });

export const modules: Dict["modules"] = {
  daily: {
    empty: (label, days) => `Rien à tracer ${label} pour l’instant : aucun retour en stock ni rupture sur les ${days} derniers jours. Le premier dessinera la première barre.`,
    summary: (r, s, label, days, activeDays) => `${restocks(r)} et ${soldouts(s)} ${label} sur les ${days} derniers jours, répartis sur ${plural("fr", activeDays, { one: "# jour", other: "# jours" })}.`,
    busiest: (day, r) => <> Le jour le plus chargé, <b className="text-ink">{day}</b>, en a compté {n(r)}.</>,
    barAria: (day, r, s) => `${day} : ${restocks(r)} et ${soldouts(s)}`,
    barTitle: (day, r, s) => `${day} · ${restocks(r)} · ${soldouts(s)}`,
    legendRestocks: "retours en stock",
    legendSoldouts: "ruptures",
  },

  last24: {
    title: (label) => `Les dernières 24 heures de retours en stock d’iPhone Duo ${label}`,
    asOf: (when) => `relevé le ${when}`,
    localTime: (when) => `${when}, heure locale`,
    anAppleStore: "un Apple Store",
    unknown: "Le décompte sur 24 heures n’est pas disponible pour le moment ; le stock en direct et le journal des retours en stock de cette page ne sont pas concernés.",
    none: (label, asOf) => <><b className="text-ink">Aucun retour en stock d’iPhone Duo {label} sur les dernières 24 heures</b> (relevé le {asOf}).</>,
    some: (o) => (
      <><b className="text-ink">{restocks(o.restocks)} d’iPhone Duo {o.one ? o.label : `dans ${n(o.withStores)} ${o.allStores > 1 ? `des ${n(o.allStores)} Apple Store` : "Apple Store sur 1"} ${o.label}`}</b> sur les dernières 24 heures ; le plus récent : un <b className="text-ink">{o.config}</b>{o.store != null && <> chez {o.store}</>}, {o.when}, heure locale.</>
    ),
    tileRestocks: "retours en stock confirmés en 24 h",
    tileConfigsBack: "configurations réapparues",
    tileStores: (configs, allConfigs) => `magasins réapprovisionnés${configs ? ` · ${plural("fr", configs, { one: "# configuration", other: "# configurations" })} sur ${n(allConfigs)}` : ""}`,
    tileLatest: (config, store) => <>le plus récent · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config, store, day) => <>le précédent · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "rien de plus ancien dans le journal",
    caption: (label, asOf) => `Chaque configuration d’iPhone Duo ${label} : retours en stock confirmés sur les dernières 24 heures, relevé le ${asOf}`,
    thConfig: "Configuration",
    thRestocks: "Retours en stock",
    thStores: "Magasins",
    thLast: "Dernier retour en stock (heure locale)",
    thNow: "En ligne maintenant",
    ofStores: (k, total) => `${n(k)} sur ${n(total)}`,
    noneIn24: "aucun en 24 h",
    yes: "oui",
    no: "non",
    countedTitle: "Ce qui compte ici comme un retour en stock",
    counted: "Ce sont les relevés de RestockWire lui-même sur le retrait en magasin d’apple.com : chaque magasin toutes les 15 secondes, les magasins avec alertes toutes les 5 secondes. Un retour en stock n’entre au journal que si deux vérifications concordent ; la toute première lecture d’un magasin ne compte pas ; rien de ce que publient d’autres sites de suivi n’y est mélangé.",
    alert: (label) => `Recevoir des alertes${label != null ? ` ${label}` : ""} : la prochaine vous parvient en quelques secondes`,
  },

  clock: {
    none: (label, days) => `Aucun retour en stock ${label} sur les ${days} derniers jours pour l’instant.`,
    thin: (total, label, days, dates) => `${restocks(total)} ${label} sur les ${days} derniers jours${dates != null ? ` (sur ${plural("fr", dates, { one: "# jour", other: "# jours" })})` : ""} : pas encore assez pour désigner une heure habituelle.`,
    pattern: (total, label, days, hour, day) => (
      <>{restocks(total)} {label} sur les {days} derniers jours. L’heure habituelle est <b className="text-ink">{hour}</b>, heure locale{day ? <> ; c’est le <b className="text-ink">{day}</b> qu’il y en a le plus</> : null}.</>
    ),
    byHour: (zone) => `Par heure · ${zone}`,
    byWeekday: "Par jour de la semaine",
    barReported: (k) => ` (+${n(k)} ${k > 1 ? "signalés" : "signalé"} par d’autres sites de suivi)`,
    barReportedTitle: (bar, k) => `${bar} : ${n(k)} ${k > 1 ? "signalés" : "signalé"} par d’autres sites de suivi`,
    legendOurs: "Confirmé par RestockWire",
  },

  feed: {
    empty: "Le journal est vide pour l’instant.",
    available: "Disponible",
    soldOut: "Épuisé",
    soldOutAt: (time) => <>parti {time}</>,
    since: (time) => <>en ligne depuis {time}</>,
    restockedAt: (time) => <>revenu {time}</>,
    mapAria: (store) => `Trouver ${store} sur la carte`,
    map: "Carte",
    buyAria: (model, config) => `Commander l’${model} ${config} sur apple.com`,
    buy: "Commander sur apple.com",
  },

  byConfig: {
    empty: (label, days) => `Pas encore de classement : rien n’est revenu en stock ${label} sur les ${days} derniers jours.`,
    intro: (label, days) => `Les configurations revenues ${label} sur les ${days} derniers jours, classées par fréquence.`,
    times: (k) => `${n(k)}×`,
    alert: "Recevoir des alertes",
  },

  sellout: {
    typical: (label, band) => `Un retour en stock typique d’iPhone Duo ${label} est resté en ligne ${band} environ avant d’être épuisé.`,
    half: (label, duration) => `${duration} : le temps qu’il a fallu pour que la moitié des retours en stock ${label} soient épuisés.`,
    none: (label, days) => `Rien ${label} n’est revenu en stock puis n’a été épuisé sur les ${days} derniers jours.`,
    whatDuo: "iPhone Duo",
    whatAll: "tous les iPhone",
    tileHalf: (what) => <>moitié partie en · {what}</>,
    tileWithin30: "partis en moins de 30 s",
    tileWithin60: "partis en moins d’1 min",
    tileFastest: (k, days) => <>le plus rapide · {restocks(k)} épuisés, {days} j</>,
    caption: (days) => `Par iPhone, ${days} derniers jours`,
    thIphone: "iPhone",
    thSoldOut: "Épuisés",
    thHalf: "Moitié partie en",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Le plus rapide",
    each: "Une ligne par retour en stock",
    barNote: (full) => `longueur de barre = secondes en ligne · ${full} remplit la ligne`,
    stillListed: (duration) => `toujours en ligne · ${duration}`,
    approx: (range) => `≈ ${range}`,
    measuredTitle: "Comment ces durées sont mesurées",
    measured: (estimated) =>
      `Une ligne « épuisé en 45–60 s » signifie que notre vérification 45 secondes après la première observation trouvait encore la configuration en ligne, et que celle des 60 secondes ne la trouvait plus. La largeur de chaque fourchette est l’écart entre deux vérifications : 5 secondes dans les magasins avec alertes, 15 secondes partout ailleurs${estimated ? " ; les lignes marquées ≈ datent d’avant l’enregistrement de la dernière vérification et sont bornées par le tour de 15 secondes" : ""}. Une offre plus courte qu’un écart peut apparaître et disparaître entre deux vérifications : la part réelle partie en moins de 30 secondes est donc plus élevée que ce qu’indique le tableau.`,
  },

  configTable: {
    title: "Toutes les configurations de ce magasin",
    titleAt: (store) => `Toutes les configurations chez ${store}`,
    lookupOff: (hasRows) => `Apple a désactivé pour le moment la consultation du retrait en magasin pour ce magasin${hasRows ? " (ses réponses les plus récentes figurent ci-dessous)" : ""}`,
    tracked: (k) => plural("fr", k, { one: "# configuration sur le fil", other: "# configurations sur le fil" }),
    firstSweep: "Premier passage en cours · les statuts s’affichent d’ici une minute",
    inStock: (k, total) => `${n(k)} sur ${n(total)} en ligne`,
    available: "Disponible",
    unavailable: "Indisponible",
    noLookup: "pas de consultation du retrait",
    notChecked: "pas encore vérifié",
    since: (ago) => <>en ligne depuis {ago}</>,
    lastAvailable: (ago) => <>en ligne pour la dernière fois {ago}</>,
    neverHere: "jamais en ligne ici jusqu’à présent",
    buy: "Commander",
    alertAria: (model, config, store) => `Recevoir une alerte quand ${store} propose l’${model} ${config}`,
    alert: "Recevoir des alertes →",
  },

  matrix: {
    store: "Magasin",
    checked: "Vérifié",
    cellTitle: (model, k, total) => `${model} : ${plural("fr", k, { one: "# configuration", other: "# configurations" })} sur ${n(total)} en ligne`,
  },

  nearby: {
    duo: (short, k) => `${short} · ${n(k)}`,
    noDuo: (short) => `pas de ${short}`,
  },

  stockByModel: {
    availableNow: (k, total) => `${plural("fr", k, { one: "# configuration", other: "# configurations" })} sur ${n(total)} en ligne maintenant`,
    noneNow: (total) => `0 configuration sur ${n(total)} en ce moment`,
    lookupOff: "Apple a désactivé pour le moment la consultation du retrait pour ce magasin",
    notChecked: "pas encore vérifié",
    more: (k) => `+${n(k)}`,
    checked: (ago) => <>relevé {ago}</>,
    alert: "Recevoir des alertes →",
  },

  storeBlock: {
    checked: (ago) => <>Relevé {ago} · toutes les 15 s, 5 s avec une alerte</>,
    map: "Voir sur la carte",
    alert: "Surveiller ce magasin",
    alsoIn: (region) => `Autres magasins : ${region}`,
    acrossLine: "Magasins les plus proches de l’autre côté de la limite",
    elsewhere: "Magasins les plus proches, plus loin",
  },

  hours: {
    title: "Horaires d’ouverture",
    local: (zone) => `Heure locale · ${zone}`,
    today: (hours, week) => ` · aujourd’hui ${hours} · ${week}`,
    directions: "Itinéraire",
    applePage: "ce magasin sur apple.com",
    liveMap: "Carte en direct",
    storePage: "Page du magasin",
    closed: "Fermé",
    everyDay: (hours) => `Tous les jours ${hours}`,
    openNow: (closes) => `Ouvert · ferme à ${closes}`,
    opensAt: (opens) => `Ouvre à ${opens}`,
    closedToday: (next) => (next ? `Fermé aujourd’hui · ouvre ${next}` : "Fermé aujourd’hui"),
    closedNow: (next) => (next ? `Fermé en ce moment · ouvre ${next}` : "Fermé en ce moment"),
    nextOpen: (day, time) => `${day ?? "demain"} à ${time}`,
  },

  liveStats: {
    inStock: "En ligne maintenant",
    storesWith: "Magasins avec stock",
    lastCheck: "Dernière vérification",
    none: "—",
  },

  board: {
    summary: (k, stores, short) => `${plural("fr", k, { one: "# magasin", other: "# magasins" })} sur ${n(stores)} ${k > 1 ? "proposent" : "propose"} le ${short} en ce moment`,
    lastCheck: (ago) => <>Dernière vérification {ago}</>,
    firstSweep: "Premier passage en cours.",
    noneListed: (model, storage, color) => `En ce moment, aucun magasin ne propose l’${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""}.`,
    more: (k) => `+${n(k)}`,
    seen: (ago) => <>En ligne {ago}</>,
    loading: "Chargement du stock",
  },
};
