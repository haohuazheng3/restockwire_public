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
const cap1 = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const de = (x: string) => (/^[aeiouyhâéèêîôû]/i.test(x) ? `d’${x}` : `de ${x}`);
type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "Fermé",
    everyDay: (hours) => `7 jours sur 7, ${hours}`,
    tomorrow: "demain",
    dayAt: (day, time) => `${day} à ${time}`,
    closedTodayOpens: (next) => `Porte close aujourd’hui · réouverture ${next}`,
    closedToday: "Porte close aujourd’hui",
    opensAt: (time) => `Ouverture à ${time}`,
    openNow: (closes) => `Ouvert · fermeture à ${closes}`,
    closedNowOpens: (next) => `Fermé · réouverture ${next}`,
    closedNow: "Fermé à cette heure",
  },

  duration: {
    underAMinute: "sous la minute",
    pair: (a, b) => `${a} ${b}`,
  },
  listMore: (n) => `+ ${n}`,
  nearLine: (place, distance) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `chez ${place}` : kind === "model" ? `pour l’${place}` : dans(place)),
    nRestocks: f({ one: "# remise en stock", other: "# remises en stock" }),
    restockA: ({ count, where, days, week, peak }) =>
      `${count == null ? `Zéro remise en stock ${where} en ${days} jours` : `${count} ${where} en ${days} jours, dont ${week} ces 7 derniers jours`}${peak ? `. Créneau dominant : ${peak.hour} (heure du magasin)${peak.day ? `, surtout le ${peak.day}` : ""}` : ""}. Apple ne publie pas de calendrier : ces chiffres sont nos relevés.`,
    lastsNone: (where) => `Pas de chiffre fiable ${where} : trop peu de remises en stock suivies jusqu’à la rupture.`,
    lasts: (days, duration) => `${duration} en médiane. Mesure : temps entre la remise en stock d’une configuration et sa rupture, sur ${days} jours.`,
    storeIn: (store, line) => `${store} à ${line}`,
    nearestA: (stores) => `${stores}.`,

    modelStockQ: (model) => `Quels magasins proposent l’${model} en retrait à cette minute ?`,
    modelStockNone: (model) => `Aucun, au dernier passage. Le premier Apple Store américain qui proposera l’${model} en retrait s’affichera ici.`,
    nUsStores: f({ one: "# magasin aux États-Unis", other: "# magasins aux États-Unis" }),
    modelStockSome: (count) => `${count} au dernier passage. La liste de la page détaille les configurations de chacun.`,
    priceQ: (model) => `Quel est le prix de l’${model} ?`,
    priceA: (low, high, storages, colors) => `${low} au plus bas, ${high} au plus haut, sans opérateur. Capacités : ${storages}. Coloris : ${colors}.`,
    modelRestockQ: (model) => `L’${model} revient-il souvent en stock ?`,
    modelLastsQ: (model) => `Combien de minutes l’${model} tient-il en rayon après une remise en stock ?`,
    reserveQ: (model) => `L’${model} se réserve-t-il à l’avance pour un retrait ?`,
    reserveA: "Non. La réservation se fait à l’achat : configuration affichée, commande sur apple.com avec retrait, puis Apple la garde jusqu’à votre créneau.",

    storeStockQ: (store, model) => `${store} : l’${model} est-il disponible ?`,
    nConfigs: f({ one: "# variante", other: "# variantes" }),
    storeStockYes: (count) => `Oui, ${count} au dernier passage. Capacités et coloris : voir le tableau.`,
    storeStockNo: (other) => `Non, rien au dernier passage${other ? `. À côté : ${other.pro} variantes d’iPhone 18 Pro et ${other.proMax} de 18 Pro Max en ligne` : ". Ni 18 Pro ni 18 Pro Max non plus"}.`,
    hoursQ: (store) => `${store} : quels horaires ?`,
    hoursA: ({ hours, today, address, phone }) => `${today ? `Aujourd’hui : ${today}. ` : ""}${hours ?? "Semaine complète dans le tableau ci-dessus"}. Adresse : ${address}${phone ? ` · tél. ${phone}` : ""}.`,
    storeRestockQ: (store) => `Combien de remises en stock d’iPhone chez ${store} ?`,
    storeLastsQ: (store) => `Chez ${store}, le stock part-il vite ?`,
    storeNearestQ: (store) => `Plan B : quels magasins autour ${de(store)} ?`,

    placeStockQ: (place, model) => `${cap1(dans(place))}, où trouver l’${model} en retrait maintenant ?`,
    placeStockNone: (place, model) => `Nulle part au dernier passage. Le premier magasin ${dans(place)} qui proposera l’${model} s’inscrira ici.`,
    nStores: f({ one: "# point de retrait", other: "# points de retrait" }),
    placeStockSome: (count, stores) => `${count} au dernier passage — ${stores}.`,
    countQ: (place) => `${cap1(dans(place))}, combien d’Apple Store ?`,
    nAppleStores: f({ one: "Un seul magasin", other: "# magasins Apple" }),
    countMany: (count, stores) => `${count}. Par exemple : ${stores}.`,
    countOne: (count, store) => `${count} — ${store}.`,
    placeRestockQ: (place) => `${cap1(dans(place))}, combien de remises en stock d’iPhone ?`,
    placeLastsQ: (place) => `${cap1(dans(place))}, en combien de temps le stock disparaît-il ?`,
    placeNearestQ: (place) => `Hors ${place}, quels magasins restent à portée ?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `chez ${place}` : kind === "model" ? "dans tout le réseau Apple américain" : `dans les Apple Store ${dans(place)}`;
    return [
      `Le fil RestockWire passe ${at} toutes les 15 secondes, et toutes les 5 secondes pour les magasins visés par une alerte. Chaque configuration suivie est relue à ce rythme. Une variation n’est retenue qu’après un second contrôle concordant : un accroc isolé ne devient ni remise en stock ni rupture.`,
      "Ce qui est suivi, c’est le retrait en magasin d’apple.com : configuration et magasin choisis au paiement, achat en ligne, appareil remis sur place, souvent dans la journée. Le stock en rayon et les boutiques d’opérateurs relèvent d’un autre circuit.",
      "Toute variation confirmée rejoint le registre. Graphique et historique de cette page en sont tirés directement.",
    ];
  },
  alertRule: "Règle d’une alerte : un magasin × un téléphone précis (modèle, capacité, couleur). apple.com passe à « disponible » ? Quelques secondes plus tard, notification sur vos appareils, ou e-mail si aucun ne les accepte.",

  titles: {
    state: (name, duoNow, stores) => [
      `${name} : iPhone Duo en retrait dans ${duoNow}/${stores} Apple Store`,
      `${name} : l’iPhone Duo en retrait, magasin par magasin`,
      `${name} : où est l’iPhone Duo en Apple Store ?`,
      `${name} : stock iPhone des Apple Store`,
    ],
    city: (city, code, duoNow, stores) => [
      `${city} (${code}) : iPhone Duo dans ${duoNow}/${stores} Apple Store`,
      `${city} (${code}) : l’iPhone Duo en retrait, au fil des minutes`,
      `${city} (${code}) : où est l’iPhone Duo ?`,
      `${city} : stock iPhone des Apple Store`,
    ],
    store: (name, region) => storeTitleVariants(name, region),
    model: (name, storesNow) => [
      `${name} en retrait : ${storesNow} Apple Store le proposent`,
      `${name} : ${storesNow} Apple Store avec du stock`,
      `${name} : le retrait en Apple Store, minute par minute`,
    ],
  },

  tokens: {
    tooFewToMeasure: "échantillon encore trop mince",
    noneLoggedYet: "registre encore vide",
    noneYet: "néant à ce jour",
  },

  pattern: {
    none: (days) => `${days} jours sans remise en stock confirmée.`,
    nConfirmed: f({ one: "# remise en stock confirmée", other: "# remises en stock confirmées" }),
    countIn: (count, days) => `${count} en ${days} jours`,
    stay: (minutes) => ` ; le stock tient en général ~${minutes} min`,
    nDays: f({ one: "# jour", other: "# jours" }),
    tooFew: (count, onDays, stay) => `Pas encore de créneau habituel : ${count}${onDays ? ` en ${onDays}` : ""}, c’est trop peu${stay}.`,
    usual: (hour, weekday, count, stay) => `Créneau habituel : ${hour} (heure du magasin)${weekday ? `, ${weekday} en tête` : ""}. Bilan : ${count}${stay}.`,
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

  measured: "Méthode de mesure",

  faqTitle: "Vos questions, nos réponses",
  breadcrumb: "Chemin de navigation",
  keepExploring: "Ailleurs sur RestockWire",
  browse: {
    storesByState: "Les magasins, État par État",
    allStatesCities: "Chaque État, chaque ville →",
    liveByModel: "Chaque modèle, son stock",
    modelStock: (model) => `${model} : le stock`,
    thisPage: "la page en cours",
    restockLog: (short) => `${short} : fil des remises en stock`,
    liveMap: "Carte temps réel",
    mostStores: "Là où les magasins sont les plus nombreux",
    allStates: "Liste des États",
    bigCities: "Métropoles",
    cities: "Villes",
    storesBy: (region) => `Rangés par ${region}`,
    allStoresIn: ({ country }) => <>Tout le réseau Apple Store {dans(country)} →</>,
    allRegions: (regions) => `Liste des ${regions}`,
  },
  modelCards: "Quel iPhone vous intéresse ?",
  narrative: {
    lastRestock: (config, at, ago) => <>{" "}Dernière remise en stock captée : {config}{at}, {ago}.</>,
    at: (store) => <> chez {store}</>,
  },
  statStrip: {
    inStockNow: "En ligne à l’instant",
    ofStores: (n) => `parmi ${n} magasins`,
    stores: "Magasins",
    nCities: f({ one: "# ville", other: "# villes" }),
    tracked: "sous surveillance",
    modelNow: (short) => `${short}, à l’instant`,
    configsInStock: "variantes en ligne",
    storesWithStock: f({ one: "magasin qui a du stock en ligne", other: "magasins qui ont du stock en ligne" }),
    restocks24h: "Remises en stock sur 24 h",
    /** A tile that counts one model only (its short name first). */
    scoped: (label, model) => `${model} · ${label}`,
    restocksHint: (week, month, days) => `7 j : ${week} · ${days} j : ${month}`,
    sellOuts: (days) => `${days} j de ruptures`,
    stays: (duration) => (duration === "sous la minute" ? `tient ${duration}` : `tient ~${duration}`),
    noPairs: "aucun couple remise en stock / rupture encore",
    lastRestock: "Dernière remise en stock",
    noneYet: "néant à ce jour",
    inLastDays: (days) => `en ${days} jours`,
  },
  product: {
    chooseIphone: "Quel iPhone ?",
    storage: "Capacité",
    color: "Couleur",
    all: "Toutes",
    numbersAre: (unit) => <>Les chiffres = nombre de {unit} qui le proposent à l’instant.</>,
    seen: (ago) => <>en ligne {ago}</>,
    last: (ago) => <>vu {ago}</>,
    notSeenYet: "jamais vu en ligne",
    firstCheckPending: "premier contrôle imminent",
    inStock: "En stock",
    inStockLower: "en stock",
    none: "aucun",
    here: "ici",
    notAvailable: "Pas en ligne",
    notCheckedYet: "Contrôle à venir",
    availableForPickup: "Retrait possible",
    since: (ago) => <> · en ligne depuis {ago}</>,
    lastInStock: (ago) => <>Vu en ligne pour la dernière fois {ago}</>,
    neverSeen: "Ce magasin ne l’a encore jamais proposé",
    firstCheckSoon: "Premier contrôle dans la minute",
    buy: "Vers apple.com",
    checked: (checked, note) => <>Contrôlé {checked} · {note}</>,
    checkNote: "fil de 15 s · 5 s sous alerte",
  },

  source: (source) => <>Source : {source}</>,
  photoCredit: (link) => <>Crédit photo : {link}</>,
  sources: "Sources",
  allUsStores: "les 269 Apple Store du territoire américain",
  trackerSource: (where, since, asOf) => <>Relevés RestockWire en temps réel, ouverts le {since}. Périmètre : iPhone Duo, iPhone 18 Pro et iPhone 18 Pro Max, toutes configurations, {where}. Cadence : 15 secondes, 5 secondes pour les magasins sous alerte. Chiffres figés à {asOf}.</>,
  live: {
    configsCaption: (stores, model) => <>{model}, variante par variante : nombre d’Apple Store (sur {stores}) qui la proposent en retrait à l’instant</>,
    storage: "Capacité",
    pricesCaption: (model) => <>{model} : stock en retrait à l’instant et prix apple.com (sans opérateur, hors taxes)</>,
    price: "Prix",
    bestColor: "Coloris le plus présent en magasin à l’instant",
    noRestock: (model) => `${model} : registre des remises en stock encore vide.`,
    clockLabel: (model) => `pour l’${model}, tous magasins du pays confondus`,
    storesWithIt: "Magasins qui le proposent à l’instant",
    pairsInStock: "Paires magasin × variante en ligne",
    restocksLogged: "Remises en stock consignées",
    medianTime: "Temps en ligne médian",
    underOneMin: (min) => `< ${min}`,
  },

  /** Les photos génériques et celles des lieux de France, Belgique, Suisse et Canada ; les autres restent en anglais. */
  photos: {
    "apple-store-pickup-counter": { alt: "Atrium lumineux d’un centre commercial, escalators et façade d’Apple Store", caption: "En galerie marchande, le stock de retrait est souvent garni avant l’ouverture des portes." },
    "phone-map": { alt: "Gros plan, en extérieur, sur une main qui tient un smartphone ouvert sur une application de cartes", caption: "Quand le stock tient une minute, chaque kilomètre jusqu’au magasin pèse." },
    "phone-card-payment": { alt: "Une femme règle sans contact avec son smartphone sur un terminal de paiement", caption: "Le retrait se paie en ligne, avant d’aller au magasin." },
    "phone-on-box": { alt: "Smartphone dans sa boîte, sur fond blanc", caption: "Configuration exacte, magasin exact : c’est l’unité de chaque alerte." },
    "city-map-phone": { alt: "Un jeune couple suit un itinéraire sur un téléphone pendant un trajet sur une route de campagne", caption: "Le trajet compte : visez le magasin que vous atteindrez à temps." },
    "phone-notification": { alt: "Gros plan sur une main qui tient un smartphone affichant une citation de motivation", caption: "La notification tombe sur l’écran que vous avez déjà en main." },
    "apple-store-crowd-inside": { alt: "Clients qui essaient des appareils aux tables d’un Apple Store, dans un centre commercial de Bangkok", caption: "Côté boutique, les tables servent aux démonstrations ; la file du retrait se forme au fond." },
    "apple-store-glass-canopy": { alt: "Apple Store tout en verre au bord de la rivière, dans le centre de Chicago", caption: "Une vitrine Apple du centre de Chicago, au bord de l’eau." },
    "apple-store-night-vancouver": { alt: "Vancouver la nuit vue du ciel : gratte-ciel éclairés et pont illuminé", caption: "Vancouver de nuit. Le stock de retrait peut tomber à toute heure, mais le matin domine." },
    "phone-hand-camera": { alt: "Main qui tient un smartphone à coque orange et triple objectif photo", caption: "Triple objectif : la signature des modèles Pro." },
    "place-fr-france": { alt: "Paris de nuit au bord du fleuve, tours éclairées à l’horizon", caption: "France : Paris de nuit, côté fleuve." },
    "place-fr-paris": { alt: "Vue aérienne nocturne de Paris et de ses monuments illuminés", caption: "Paris vu d’en haut, la nuit." },
    "place-fr-lyon": { alt: "Coucher de soleil sur la Saône à Lyon, façades d’immeubles et reflets sur l’eau", caption: "Lyon : la Saône au soleil couchant." },
    "place-fr-bouches-du-rhone": { alt: "Le Vieux-Port de Marseille et la ville en arrière-plan, promeneurs sur les quais", caption: "Bouches-du-Rhône : le Vieux-Port de Marseille." },
    "place-fr-seine-et-marne": { alt: "Église ancienne et rivière sous le soleil, à Provins", caption: "Seine-et-Marne : Provins par beau temps." },
    "place-fr-yvelines": { alt: "Grilles dorées du château de Versailles sous un ciel bleu vif", caption: "Yvelines : les grilles dorées de Versailles." },
    "place-be-belgium": { alt: "Anvers vue du ciel au crépuscule, ciel aux couleurs vives", caption: "Belgique : Anvers à la tombée du jour." },
    "place-ch-geneva": { alt: "Genève sous un ciel nuageux, les Alpes suisses en toile de fond", caption: "Genève, face aux Alpes." },
    "place-ch-zurich": { alt: "Toits historiques de la vieille ville de Zurich par temps clair", caption: "Zurich : les toits de la vieille ville." },
    "place-ca-canada": { alt: "Toronto au coucher du soleil, la tour CN et les lumières de la ville reflétées dans le lac", caption: "Canada : Toronto au crépuscule, depuis le lac." },
    "place-ca-quebec": { alt: "Gratte-ciel du centre-ville de Montréal en noir et blanc", caption: "Québec : Montréal en noir et blanc." },
    "place-ca-ontario": { alt: "Gratte-ciel de Toronto et tour CN sous un ciel couvert", caption: "Ontario : Toronto sous les nuages." },
    "place-ca-alberta": { alt: "Gratte-ciel de Calgary encadrés de verdure sous un ciel dégagé", caption: "Alberta : Calgary par temps clair." },
    "place-ca-british-columbia": { alt: "Bateaux amarrés dans une marina à l’heure dorée, gratte-ciel de Vancouver dans la lumière du couchant", caption: "Colombie-Britannique : Vancouver à l’heure dorée." },
    "place-ca-calgary": { alt: "Centre-ville de Calgary entouré de feuillages d’automne", caption: "Calgary en automne." },
    "place-ca-edmonton": { alt: "Tours modernes du centre-ville d’Edmonton au crépuscule", caption: "Edmonton à la tombée du jour." },
    "place-ca-ottawa": { alt: "Édifices du Parlement d’Ottawa et la rivière des Outaouais par temps clair", caption: "Ottawa : le Parlement au-dessus de la rivière." },
    "place-ca-toronto": { alt: "Gratte-ciel de Toronto, tour CN et front de lac sous un ciel bleu", caption: "Toronto : la tour CN côté lac." },
    "compare-pickup-bag": { alt: "Deux personnes se passent un sac de courses en intérieur", caption: "Le retrait se termine au comptoir ; le choix du bon magasin commence bien avant." },
    "compare-two-stores": { alt: "Passants qui se reflètent dans une vitrine sur une rue animée", caption: "Deux magasins d’une même ville se réapprovisionnent souvent à des heures différentes." },
    "guide-android-phone": { alt: "Main tenant un smartphone Android affichant l’écran d’accueil", caption: "Sur Android, Chrome livre les alertes sans rien installer." },
    "guide-android-watch": { alt: "Gros plan sur une femme portant une montre connectée", caption: "Une montre Wear OS jumelée affiche les alertes que Chrome reçoit." },
    "guide-focus-desk": { alt: "Jeune femme qui consulte son smartphone à un bureau, à côté d’un ordinateur portable", caption: "La Concentration « Travail » est celle où l’on oublie d’autoriser RestockWire." },
    "guide-focus-phone-night": { alt: "Femme qui utilise son smartphone dans une chambre sombre, éclairée par l’écran", caption: "La Concentration « Sommeil » coupe les alertes si RestockWire n’est pas dans les autorisations." },
    "guide-watch-notification": { alt: "Main qui touche une montre connectée portée au poignet, en extérieur", caption: "Lisez le magasin au poignet, puis réservez sur l’iPhone." },
    "guide-watch-wrist": { alt: "Gros plan en noir et blanc d’une montre connectée affichant des notifications au poignet", caption: "iPhone verrouillé, l’alerte de réassort arrive sur la montre." },
    "ranking-checkout": { alt: "Client qui paie avec son smartphone sur un terminal de caisse en magasin", caption: "Dans les magasins les plus rapides, la réservation doit aboutir quelques secondes après l’alerte." },
    "ranking-queue": { alt: "File de personnes devant un magasin très fréquenté, dans une rue en ville", caption: "Les ruptures rapides suivent la demande autour du magasin, pas la taille de la livraison." },
    "reports-delivery-boxes": { alt: "Cartons empilés devant les quais de chargement d’un entrepôt", caption: "Le stock arrive en magasin par livraisons ; le rapport hebdomadaire compte ce qui atteint le rayon de retrait." },
    "reports-iphone-boxes": { alt: "Un iPhone neuf, sa boîte et ses accessoires de charge posés sur une table en bois", caption: "Chaque réassort du rapport correspond à une configuration de retour dans un magasin." },
    "status-phone-check": { alt: "Femme qui regarde attentivement son smartphone dans une pièce sombre", caption: "En attendant une vérification de retrait : les minutes où l’état de la requête compte." },
    "status-store-counter": { alt: "Main tenant un smartphone qui affiche une icône de chargement", caption: "Une requête bloquée ressemble à ceci ; la page d’état dit si le problème vient d’Apple ou de votre téléphone." },
  },
};
