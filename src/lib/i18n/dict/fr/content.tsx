/**
 * Chaînes françaises : content — briques SEO (FAQ, liens, bandeaux de chiffres, pièces produit, sources, widgets en
 * direct), helpers d’enrich (horaires, durées, réponses FAQ, titres), jetons {{…}}, phrase de tendance d’un magasin
 * et textes alternatifs des photos. Les arguments arrivent déjà rédigés pour la langue (nombres, durées, noms).
 */
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { dans } from "./util";
import { storeTitleVariants } from "./place";

const f = (x: Forms): Forms => x;
/** "de Paris" / "d’Apple Opéra". */
const de = (x: string) => (/^[aeiouyhâéèêîôû]/i.test(x) ? `d’${x}` : `de ${x}`);
type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "Fermé",
    everyDay: (hours) => `Tous les jours ${hours}`,
    tomorrow: "demain",
    dayAt: (day, time) => `${day} à ${time}`,
    closedTodayOpens: (next) => `Fermé aujourd’hui · ouvre ${next}`,
    closedToday: "Fermé aujourd’hui",
    opensAt: (time) => `Ouvre à ${time}`,
    openNow: (closes) => `Ouvert en ce moment · ferme à ${closes}`,
    closedNowOpens: (next) => `Fermé en ce moment · ouvre ${next}`,
    closedNow: "Fermé en ce moment",
  },

  duration: {
    underAMinute: "moins d’une minute",
    pair: (a, b) => `${a} ${b}`,
  },
  listMore: (n) => `${n} de plus`,
  nearLine: (place, distance) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `chez ${place}` : kind === "model" ? `pour l’${place}` : dans(place)),
    nRestocks: f({ one: "# retour en stock", other: "# retours en stock" }),
    restockA: ({ count, where, days, week, peak }) =>
      `${count == null ? `Aucun retour en stock ${where} sur les ${days} derniers jours` : `${count} ${where} sur les ${days} derniers jours (${week} la semaine passée)`}${peak ? `, groupés autour de ${peak.hour}, heure locale${peak.day ? `, le ${peak.day} étant le jour le plus chargé` : ""}` : ""} ; Apple n’annonce lui-même aucun calendrier.`,
    lastsNone: (where) => `Pas encore assez de retours en stock épuisés ${where} pour avancer un chiffre.`,
    lasts: (days, duration) => `Environ ${duration} en médiane : c’est le temps pendant lequel une configuration revenue en stock est restée affichée avant d’être épuisée, sur les ${days} derniers jours.`,
    storeIn: (store, line) => `${store} à ${line}`,
    nearestA: (stores) => `${stores}.`,

    modelStockQ: (model) => `Où l’${model} est-il disponible en retrait en ce moment ?`,
    modelStockNone: (model) => `Aucun Apple Store américain ne l’affichait à la dernière vérification ; cette page indique le premier dès que l’${model} apparaît en retrait.`,
    nUsStores: f({ one: "# Apple Store américain", other: "# Apple Store américains" }),
    modelStockSome: (count) => `${count} à la dernière vérification, chacun listé sur cette page avec ses configurations.`,
    priceQ: (model) => `Combien coûte l’${model} ?`,
    priceA: (low, high, storages, colors) => `De ${low} à ${high}, débloqué, selon la capacité (${storages}), en ${colors}.`,
    modelRestockQ: (model) => `À quelle fréquence l’${model} est-il réapprovisionné ?`,
    modelLastsQ: (model) => `Une fois l’${model} de retour, combien de temps reste-t-il affiché ?`,
    reserveQ: (model) => `Peut-on réserver l’${model} en retrait ?`,
    reserveA: "Pas à l’avance : quand un magasin affiche votre configuration, vous la commandez sur apple.com avec retrait en magasin, et Apple la garde pour le créneau que vous choisissez.",

    storeStockQ: (store, model) => `L’${model} est-il en stock chez ${store} ?`,
    nConfigs: f({ one: "# configuration", other: "# configurations" }),
    storeStockYes: (count) => `Oui : ${count} à la dernière vérification, avec capacité et couleur dans le tableau de cette page.`,
    storeStockNo: (other) => `Non, pas à la dernière vérification${other ? ` ; il affiche en revanche ${other.pro} configurations iPhone 18 Pro et ${other.proMax} 18 Pro Max` : ", et il n’a pas non plus de configuration 18 Pro ou 18 Pro Max"}.`,
    hoursQ: (store) => `Quand ${store} est-il ouvert ?`,
    hoursA: ({ hours, today, address, phone }) => `${hours ?? "Voir le tableau des horaires sur cette page"}${today ? ` ; aujourd’hui ${today}` : ""} ; adresse : ${address}${phone ? `, téléphone ${phone}` : ""}.`,
    storeRestockQ: (store) => `À quelle fréquence l’iPhone est-il réapprovisionné chez ${store} ?`,
    storeLastsQ: (store) => `Combien de temps un retour en stock reste-t-il affiché chez ${store} ?`,
    storeNearestQ: (store) => `Quels Apple Store sont les plus proches ${de(store)} ?`,

    placeStockQ: (place, model) => `Quels Apple Store ${dans(place)} affichent l’${model} en retrait en ce moment ?`,
    placeStockNone: (place, model) => `Aucun à la dernière vérification ; dès qu’un magasin ${dans(place)} affiche l’${model}, il apparaît sur cette page.`,
    nStores: f({ one: "# magasin", other: "# magasins" }),
    placeStockSome: (count, stores) => `${count} à la dernière vérification : ${stores}.`,
    countQ: (place) => `Combien y a-t-il d’Apple Store ${dans(place)} ?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count, stores) => `${count}, parmi lesquels ${stores}.`,
    countOne: (count, store) => `${count} : ${store}.`,
    placeRestockQ: (place) => `À quelle fréquence l’iPhone est-il réapprovisionné ${dans(place)} ?`,
    placeLastsQ: (place) => `Combien de temps le stock dure-t-il ${dans(place)} une fois de retour ?`,
    placeNearestQ: (place) => `Quels Apple Store hors ${place} sont les plus proches ?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `Chez ${place}` : kind === "model" ? "Dans chaque Apple Store américain" : `Dans les Apple Store ${dans(place)}`;
    return [
      "Le retrait en magasin est un achat sur apple.com : vous choisissez la configuration et le magasin au paiement, vous payez en ligne et vous récupérez l’appareil sur place, souvent le jour même. Les boutiques des opérateurs et le stock en rayon forment un tout autre circuit.",
      `${at}, RestockWire lit chaque configuration suivie toutes les 15 secondes, ou toutes les 5 secondes là où une alerte est réglée. Un changement ne compte qu’une fois confirmé par une seconde vérification : un raté isolé n’apparaît jamais comme un retour en stock ni comme une rupture.`,
      "Chaque changement confirmé entre dans le journal, et ce journal trace le graphique des retours en stock et l’historique de cette page.",
    ];
  },
  alertRule: "Une alerte, c’est un magasin et un téléphone exact (modèle, capacité, couleur) ; quelques secondes après qu’apple.com passe à « disponible », une notification part, ou un e-mail si aucun appareil n’accepte les notifications.",

  titles: {
    state: (name, duoNow, stores) => [
      `Apple Store ${name} : iPhone Duo affiché dans ${duoNow} sur ${stores}`,
      `Apple Store ${name} – stock iPhone Duo en retrait, en direct`,
      `Apple Store ${name} – stock iPhone Duo maintenant`,
      `Apple Store ${name} – stock iPhone en direct`,
    ],
    city: (city, code, duoNow, stores) => [
      `Apple Store ${city} (${code}) : iPhone Duo dans ${duoNow} sur ${stores}`,
      `Apple Store ${city} (${code}) – iPhone Duo en retrait, en direct`,
      `Apple Store ${city} (${code}) – stock iPhone Duo maintenant`,
      `Apple Store ${city} – stock iPhone en direct`,
    ],
    store: (name, region) => storeTitleVariants(name, region),
    model: (name, storesNow) => [
      `Stock ${name} en retrait : affiché dans ${storesNow} Apple Store`,
      `Stock ${name} en retrait : ${storesNow} Apple Store maintenant`,
      `Stock ${name} en retrait en magasin, en direct`,
    ],
  },

  tokens: {
    tooFewToMeasure: "pas encore assez de données",
    noneLoggedYet: "aucun relevé pour l’instant",
    noneYet: "aucun jusqu’ici",
  },

  pattern: {
    none: (days) => `Aucun retour en stock confirmé sur les ${days} derniers jours.`,
    nConfirmed: f({ one: "# retour en stock confirmé", other: "# retours en stock confirmés" }),
    countIn: (count, days) => `${count} sur les ${days} derniers jours`,
    stay: (minutes) => ` ; un retour en stock reste généralement affiché ~${minutes} min`,
    nDays: f({ one: "# jour", other: "# jours" }),
    tooFew: (count, onDays, stay) => `${count}${onDays ? ` sur ${onDays}` : ""}, pas encore assez pour dégager une heure habituelle${stay}.`,
    usual: (hour, weekday, count, stay) => `Heure habituelle de retour en stock : ${hour}, heure locale${weekday ? `, le ${weekday} étant le jour le plus chargé` : ""} ; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "État", other: "États" }),
    province: f({ one: "province", other: "provinces" }),
    area: f({ one: "région", other: "régions" }),
    department: f({ one: "département", other: "départements" }),
    prefecture: f({ one: "préfecture", other: "préfectures" }),
    emirate: f({ one: "émirat", other: "émirats" }),
    canton: f({ one: "canton", other: "cantons" }),
    region: f({ one: "région", other: "régions" }),
    county: f({ one: "comté", other: "comtés" }),
    city: f({ one: "ville", other: "villes" }),
  } as Record<string, Forms>,

  measured: "Comment les chiffres sont mesurés",

  faqTitle: "Questions et réponses",
  breadcrumb: "Fil d’Ariane",
  keepExploring: "Plus de RestockWire",
  browse: {
    storesByState: "Magasins par État",
    allStatesCities: "Chaque État et chaque ville →",
    liveByModel: "Stock en direct, modèle par modèle",
    modelStock: (model) => `Stock ${model}`,
    thisPage: "cette page",
    restockLog: (short) => `Relevé des retours en stock ${short}`,
    liveMap: "Carte en direct",
    mostStores: "Les plus grands nombres de magasins",
    allStates: "Tous les États",
    bigCities: "Grandes villes",
    cities: "Villes",
    storesBy: (region) => `Magasins par ${region}`,
    allStoresIn: ({ country }) => <>Chaque Apple Store {dans(country)} →</>,
    allRegions: (regions) => `${/^(provinces|régions|préfectures|villes)$/.test(regions) ? "Toutes les" : "Tous les"} ${regions}`,
  },
  modelCards: "Choisissez un iPhone",
  narrative: {
    lastRestock: (config, at, ago) => <>{" "}Retour en stock le plus récent : {config}{at}, {ago}.</>,
    at: (store) => <> chez {store}</>,
  },
  statStrip: {
    inStockNow: "Affiché maintenant",
    ofStores: (n) => `sur ${n} magasins`,
    stores: "Magasins",
    nCities: f({ one: "# ville", other: "# villes" }),
    tracked: "suivis en direct",
    modelNow: (short) => `${short} maintenant`,
    configsInStock: "config. affichées",
    storesWithStock: f({ one: "magasin avec du stock affiché", other: "magasins avec du stock affiché" }),
    restocks24h: "Retours en stock, 24 h",
    restocksHint: (week, month, days) => `${week} en 7 j · ${month} en ${days} j`,
    sellOuts: (days) => `Ruptures ${days} j`,
    stays: (duration) => `reste ~${duration}`,
    noPairs: "aucune rupture appariée pour l’instant",
    lastRestock: "Retour en stock le plus récent",
    noneYet: "aucun jusqu’ici",
    inLastDays: (days) => `sur les ${days} derniers jours`,
  },
  product: {
    chooseIphone: "Choisissez votre iPhone",
    storage: "Capacité",
    color: "Couleur",
    all: "Toutes",
    numbersAre: (unit) => <>Chaque chiffre compte les {unit} qui l’affichent maintenant.</>,
    seen: (ago) => <>affiché {ago}</>,
    last: (ago) => <>dernier {ago}</>,
    notSeenYet: "pas encore affiché",
    firstCheckPending: "première vérification en route",
    inStock: "En stock",
    inStockLower: "en stock",
    none: "aucun",
    here: "ici",
    notAvailable: "Non affiché",
    notCheckedYet: "Pas encore vérifié",
    availableForPickup: "Affiché en retrait",
    since: (ago) => <> · affiché depuis {ago}</>,
    lastInStock: (ago) => <>Dernier affichage {ago}</>,
    neverSeen: "Jamais affiché dans ce magasin jusqu’ici",
    firstCheckSoon: "Première vérification d’ici une minute",
    buy: "Commander sur apple.com",
    checked: (checked, note) => <>Lu {checked} · {note}</>,
    checkNote: "toutes les 15 s, 5 s avec une alerte",
  },

  source: (source) => <>Données : {source}</>,
  photoCredit: (link) => <>Photo : {link}</>,
  sources: "Sources",
  allUsStores: "chacun des 269 Apple Store des États-Unis",
  trackerSource: (where, since, asOf) => <>Les vérifications en direct de RestockWire depuis le {since} : chaque configuration d’iPhone Duo, d’iPhone 18 Pro et d’iPhone 18 Pro Max dans {where}, lue toutes les 15 secondes (toutes les 5 secondes là où une alerte est réglée) ; chiffres de cette page relevés à {asOf}.</>,
  live: {
    configsCaption: (stores, model) => <>En direct : combien des {stores} Apple Store affichent chaque configuration {model} en retrait</>,
    storage: "Capacité",
    pricesCaption: (model) => <>{model} : prix apple.com (débloqué, hors taxes) à côté du stock en retrait en direct</>,
    price: "Prix",
    bestColor: "Couleur la plus affichée, magasins en ce moment",
    noRestock: (model) => `Aucun retour en stock relevé pour l’${model} jusqu’ici.`,
    clockLabel: (model) => `pour l’${model} dans tout le pays`,
    storesWithIt: "Magasins qui l’affichent maintenant",
    pairsInStock: "Couples magasin × config. affichés",
    restocksLogged: "Retours en stock relevés",
    medianTime: "Durée médiane d’affichage",
    underOneMin: (min) => `< ${min}`,
  },

  /** Les photos génériques et celles des lieux de France, Belgique, Suisse et Canada ; les autres restent en anglais. */
  photos: {
    "apple-store-pickup-counter": { alt: "Comptoir de retrait en bois avec un panneau « Pickup » dans un Apple Store", caption: "Les commandes en retrait se récupèrent à un comptoir comme celui-ci." },
    "phone-map": { alt: "Mains qui suivent un itinéraire sur une application de cartes, en extérieur", caption: "La distance compte plus qu’on ne le croit quand un retour en stock dure une minute." },
    "phone-card-payment": { alt: "Une femme tient un iPhone et une carte bancaire pour payer en ligne", caption: "Payer en ligne pour un retrait en magasin." },
    "phone-on-box": { alt: "Un smartphone neuf posé sur sa boîte blanche", caption: "Un téléphone neuf, tout juste sorti de sa boîte." },
    "city-map-phone": { alt: "Deux personnes consultent un plan de ville sur un téléphone", caption: "Préparer le trajet jusqu’au magasin." },
    "phone-notification": { alt: "Main tenant un téléphone qui affiche des notifications sur l’écran verrouillé", caption: "Une alerte arrive sur l’écran verrouillé." },
    "apple-store-crowd-inside": { alt: "Une foule fait la queue dans un Apple Store très fréquenté d’un centre commercial", caption: "La foule de la semaine de lancement dans un Apple Store : le stock qui arrive en rayon part en quelques minutes." },
    "apple-store-glass-canopy": { alt: "Apple Store avec façade vitrée et auvent en bois, de nuit", caption: "Un Apple Store vitré, à la nuit tombée." },
    "apple-store-night-vancouver": { alt: "Un Apple Store illuminé la nuit à Vancouver", caption: "Un Apple Store de nuit : le stock en retrait peut apparaître à toute heure, mais il arrive bien plus souvent le matin." },
    "phone-hand-camera": { alt: "Une personne tient un iPhone à triple appareil photo", caption: "Les modèles Pro sont ceux pour lesquels on fait la queue." },
    "place-fr-france": { alt: "La tour Eiffel au-dessus de la Seine et ses bateaux-mouches par une journée ensoleillée", caption: "La tour Eiffel et la Seine, Paris." },
    "place-fr-paris": { alt: "L’avenue des Champs-Élysées et ses arbres vue d’en haut au crépuscule", caption: "Les Champs-Élysées, Paris, au crépuscule." },
    "place-fr-lyon": { alt: "Façades colorées du Vieux Lyon sur les quais, sous la basilique Notre-Dame de Fourvière", caption: "Le Vieux Lyon au pied de la colline de Fourvière." },
    "place-fr-bouches-du-rhone": { alt: "Voiliers dans le Vieux-Port de Marseille, Notre-Dame de la Garde sur la colline", caption: "Le Vieux-Port de Marseille sous Notre-Dame de la Garde." },
    "place-fr-seine-et-marne": { alt: "Le château de Fontainebleau qui se reflète dans son étang", caption: "Le château de Fontainebleau, Seine-et-Marne." },
    "place-fr-yvelines": { alt: "La cour de marbre et la façade dorée du château de Versailles", caption: "Le château de Versailles, Yvelines." },
    "place-be-belgium": { alt: "L’hôtel de ville et les maisons des corporations de la Grand-Place de Bruxelles au coucher du soleil", caption: "La Grand-Place de Bruxelles au coucher du soleil." },
    "place-ch-geneva": { alt: "Vue aérienne du jet d’eau sur le lac Léman, avec la ville et les montagnes en arrière-plan", caption: "Le jet d’eau de Genève sur le lac Léman." },
    "place-ch-zurich": { alt: "Les tours jumelles du Grossmünster au-dessus de la Limmat, dans la vieille ville de Zurich", caption: "Le Grossmünster et la Limmat, Zurich." },
    "place-ca-canada": { alt: "La tour CN et le Rogers Centre au-dessus des gratte-ciel de Toronto, vus de l’autre côté de l’eau par beau temps", caption: "La tour CN et Toronto vus du lac." },
    "place-ca-quebec": { alt: "Le Château Frontenac dominant les toits du Vieux-Québec", caption: "Le Château Frontenac, Québec." },
    "place-ca-ontario": { alt: "Les chutes du Fer-à-Cheval, à Niagara Falls, en Ontario, enveloppées de brume au-dessus de la rivière Niagara", caption: "Les chutes du Fer-à-Cheval, Niagara Falls, Ontario." },
    "place-ca-alberta": { alt: "Le lac Louise et ses sommets enneigés dans le parc national Banff, en Alberta", caption: "Le lac Louise, parc national Banff, Alberta." },
    "place-ca-british-columbia": { alt: "Les tours du centre-ville de Vancouver au-dessus d’une marina, avec les montagnes de la Rive-Nord derrière", caption: "Vancouver et les montagnes de la Rive-Nord, Colombie-Britannique." },
    "place-ca-calgary": { alt: "Les gratte-ciel du centre-ville de Calgary et la tour de Calgary sous un ciel dégagé", caption: "Le centre-ville de Calgary et la tour de Calgary." },
    "place-ca-edmonton": { alt: "Le centre-ville d’Edmonton au-dessus de la rivière Saskatchewan Nord gelée, par une claire journée d’hiver", caption: "Edmonton au-dessus de la rivière Saskatchewan Nord, en hiver." },
    "place-ca-ottawa": { alt: "L’édifice du Centre et la tour de la Paix sur la colline du Parlement, à Ottawa, sous un ciel bleu", caption: "La colline du Parlement, Ottawa." },
    "place-ca-toronto": { alt: "L’ancien hôtel de ville derrière le square Nathan Phillips et son bassin, au centre-ville de Toronto", caption: "Le square Nathan Phillips et l’ancien hôtel de ville, Toronto." },
  },
};
