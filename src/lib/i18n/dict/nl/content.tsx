/**
 * Dutch strings: content — the SEO building blocks (FAQ, browse/related rows, stat strips, product parts, sources,
 * live widgets), the enrich helpers, live {{tokens}}, the restock-pattern sentence and photo alt text.
 * Arguments arrive written for Dutch (numbers, durations, names); these functions arrange the words around them.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
/** Same facts as CHECK_NOTE in lib/plans.ts. */
const CHECK = "elke 15 s, 5 s met een alert";

export const content: Dict["content"] = {
  hours: {
    closed: "Gesloten",
    everyDay: (hours: string) => `Elke dag ${hours}`,
    tomorrow: "morgen",
    dayAt: (day: string, time: string) => `${day} om ${time}`,
    closedTodayOpens: (next: string) => `Vandaag gesloten · open ${next}`,
    closedToday: "Vandaag gesloten",
    opensAt: (time: string) => `Open vanaf ${time}`,
    openNow: (closes: string) => `Nu open · sluit om ${closes}`,
    closedNowOpens: (next: string) => `Nu gesloten · open ${next}`,
    closedNow: "Nu gesloten",
  },

  duration: {
    underAMinute: "korter dan een minuut",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `nog ${n}`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `bij ${place}` : kind === "model" ? `voor de ${place}` : `in ${place}`),
    nRestocks: f({ one: "# aanvulling", other: "# aanvullingen" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Geen enkele aanvulling ${where} in de afgelopen ${days} dagen` : `${count} ${where} in de afgelopen ${days} dagen (${week} in de laatste week)`}${peak ? `, vooral rond ${peak.hour} lokale tijd${peak.day ? `, met ${peak.day} als drukste dag` : ""}` : ""}; Apple maakt zelf geen schema bekend.`,
    lastsNone: (where: string) => `Er zijn ${where} nog te weinig aanvullingen uitverkocht om er een getal op te plakken.`,
    lasts: (days: string, duration: string) => `Zo'n ${duration} (mediaan): zo lang bleef een aangevulde configuratie beschikbaar voordat hij uitverkocht was, gemeten over de afgelopen ${days} dagen.`,
    storeIn: (store: string, line: string) => `${store} in ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `Waar is de ${model} nu op voorraad om op te halen?`,
    modelStockNone: (model: string) => `Bij de laatste check had geen enkele Apple Store in de VS hem; deze pagina toont de eerste zodra de ${model} beschikbaar is om op te halen.`,
    nUsStores: f({ one: "# Apple Store in de VS", other: "# Apple Stores in de VS" }),
    modelStockSome: (count: string) => `${count} bij de laatste check, elk op deze pagina met de beschikbare configuraties.`,
    priceQ: (model: string) => `Wat kost de ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} tot ${high} simlockvrij, afhankelijk van de opslag (${storages}), in ${colors}.`,
    modelRestockQ: (model: string) => `Hoe vaak wordt de ${model} aangevuld?`,
    modelLastsQ: (model: string) => `Hoe lang blijft de ${model} beschikbaar als hij terug is?`,
    reserveQ: (model: string) => `Kun je de ${model} reserveren om op te halen?`,
    reserveA: "Niet vooraf: zodra een winkel je configuratie beschikbaar heeft, bestel je hem op apple.com met ophalen in de winkel, en Apple houdt hem apart voor het tijdvak dat je kiest.",

    storeStockQ: (store: string, model: string) => `Is de ${model} op voorraad bij ${store}?`,
    nConfigs: f({ one: "# configuratie", other: "# configuraties" }),
    storeStockYes: (count: string) => `Ja: ${count} bij de laatste check, met opslag en kleur in de tabel op deze pagina.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Nee, niet bij de laatste check${other ? `; wel configuraties van de iPhone 18 Pro (${other.pro}) en de 18 Pro Max (${other.proMax})` : ", en ook geen configuratie van de 18 Pro of 18 Pro Max"}.`,
    hoursQ: (store: string) => `Wanneer is ${store} open?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Zie de tabel met openingstijden op deze pagina"}${today ? `; vandaag ${today.replace(/\((\p{Lu})/u, (_m, c: string) => `(${c.toLowerCase()}`)}` : ""}; adres: ${address}${phone ? `, telefoon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Hoe vaak wordt de iPhone aangevuld bij ${store}?`,
    storeLastsQ: (store: string) => `Hoe lang blijft een aanvulling beschikbaar bij ${store}?`,
    storeNearestQ: (store: string) => `Welke Apple Stores liggen het dichtst bij ${store}?`,

    placeStockQ: (place: string, model: string) => `Welke Apple Stores in ${place} hebben de ${model} nu beschikbaar om op te halen?`,
    placeStockNone: (place: string, model: string) => `Geen bij de laatste check; zodra een winkel in ${place} de ${model} beschikbaar heeft, verschijnt hij op deze pagina.`,
    nStores: f({ one: "# winkel", other: "# winkels" }),
    placeStockSome: (count: string, stores: string) => `${count} bij de laatste check: ${stores}.`,
    countQ: (place: string) => `Hoeveel Apple Stores zijn er in ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    countMany: (count: string, stores: string) => `${count}, onder meer ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `Hoe vaak wordt de iPhone aangevuld in ${place}?`,
    placeLastsQ: (place: string) => `Hoe lang blijft voorraad in ${place} beschikbaar als hij terug is?`,
    placeNearestQ: (place: string) => `Welke Apple Stores buiten ${place} liggen het dichtstbij?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "elke Apple Store in de VS" : `de Apple Stores in ${place}`;
    return [
      "Ophalen in de winkel is een aankoop op apple.com: je kiest bij het afrekenen de configuratie en de winkel, betaalt online en haalt hem zelf op, vaak nog dezelfde dag. Providerwinkels en voorraad in de schappen zijn een aparte voorraad.",
      `Bij ${at} leest RestockWire elke gevolgde configuratie elke 15 seconden, of elke 5 seconden waar een alert staat. Een tweede check moet een wijziging bevestigen voordat die telt, dus een eenmalige storing verschijnt nooit als aanvulling of uitverkoop.`,
      "Elke bevestigde wijziging gaat het logboek in, en uit dat logboek komen de aanvulgrafiek en de geschiedenis op deze pagina.",
    ];
  },
  alertRule: "Een alert is één winkel plus één exacte telefoon (model, opslag, kleur); binnen seconden nadat apple.com op beschikbaar springt, gaat er een push uit, of een e-mail als geen apparaat meldingen ontvangt.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores in ${name}: iPhone Duo beschikbaar bij ${duoNow} van ${stores}`,
      `Apple Stores in ${name} – live ophaalvoorraad iPhone Duo`,
      `Apple Stores in ${name} – iPhone Duo-voorraad nu`,
      `Apple Stores ${name} – live iPhone-voorraad`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: iPhone Duo bij ${duoNow} van ${stores}`,
      `Apple Stores in ${city}, ${code} – live iPhone Duo ophalen`,
      `Apple Stores in ${city}, ${code} – iPhone Duo-voorraad nu`,
      `Apple Stores ${city} – live iPhone-voorraad`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: live iPhone-voorraad, aanvuluren, ophalen`,
        `${name}${r}: live iPhone-voorraad en aanvuluren`,
        `${name}${r}: live iPhone-voorraad en openingstijden`,
        `${name}: live iPhone-voorraad, aanvuluren, ophalen`,
        `${name}: live iPhone-voorraad en openingstijden`,
        `${name}: live iPhone-voorraad`,
        `${name} – live voorraad`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} ophaalvoorraad: nu beschikbaar bij ${storesNow} Apple Stores`,
      `${name} ophaalvoorraad: nu ${storesNow} Apple Stores`,
      `${name} ophalen in de winkel, live voorraad`,
    ],
  },

  tokens: {
    tooFewToMeasure: "nog niet genoeg data",
    noneLoggedYet: "nog niets vastgelegd",
    noneYet: "nog geen",
  },

  pattern: {
    none: (days: string) => `Geen enkele bevestigde aanvulling in de afgelopen ${days} dagen.`,
    nConfirmed: f({ one: "# bevestigde aanvulling", other: "# bevestigde aanvullingen" }),
    countIn: (count: string, days: string) => `${count} in de afgelopen ${days} dagen`,
    stay: (minutes: string) => `; een aanvulling blijft meestal ~${minutes} min beschikbaar`,
    nDays: f({ one: "# dag", other: "# dagen" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` op ${onDays}` : ""}, nog niet genoeg voor een vast uur${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Gebruikelijk aanvuluur: ${hour} lokale tijd${weekday ? `, met ${weekday} als drukste dag` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "staat", other: "staten" }),
    province: f({ one: "provincie", other: "provincies" }),
    area: f({ one: "gebied", other: "gebieden" }),
    department: f({ one: "departement", other: "departementen" }),
    prefecture: f({ one: "prefectuur", other: "prefecturen" }),
    emirate: f({ one: "emiraat", other: "emiraten" }),
    canton: f({ one: "kanton", other: "kantons" }),
    region: f({ one: "gewest", other: "gewesten" }),
    county: f({ one: "provincie", other: "provincies" }),
    city: f({ one: "stad", other: "steden" }),
  } as Record<string, Forms>,

  measured: "Zo worden de cijfers gemeten",

  faqTitle: "Vragen en antwoorden",
  breadcrumb: "Kruimelpad",
  keepExploring: "Meer van RestockWire",
  browse: {
    storesByState: "Winkels per staat",
    allStatesCities: "Alle staten en steden →",
    liveByModel: "Live voorraad, model voor model",
    modelStock: (model: string) => `${model}-voorraad`,
    thisPage: "deze pagina",
    restockLog: (short: string) => `Aanvullogboek ${short}`,
    liveMap: "Live kaart",
    mostStores: "Meeste winkels",
    allStates: "Alle staten",
    bigCities: "Grote steden",
    cities: "Steden",
    storesBy: (region: string) => `Winkels per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Alle Apple Stores in {country} →</>,
    allRegions: (regions: string) => `Alle ${regions}`,
  },
  modelCards: "Kies een iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Nieuwste aanvulling: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> bij {store}</>,
  },
  statStrip: {
    inStockNow: "Nu beschikbaar",
    ofStores: (n: string) => `van ${n} winkels`,
    stores: "Winkels",
    nCities: f({ one: "# stad", other: "# steden" }),
    tracked: "gevolgd",
    modelNow: (short: string) => `${short} nu`,
    configsInStock: "configuraties beschikbaar",
    storesWithStock: f({ one: "winkel met voorraad", other: "winkels met voorraad" }),
    restocks24h: "Aanvullingen, 24 u",
    restocksHint: (week: string, month: string, days: string) => `${week} in 7 d · ${month} in ${days} d`,
    sellOuts: (days: string) => `Uitverkocht ${days} d`,
    stays: (duration: string) => `blijft ~${duration}`,
    noPairs: "nog geen uitverkoop gekoppeld",
    lastRestock: "Nieuwste aanvulling",
    noneYet: "nog geen",
    inLastDays: (days: string) => `in de afgelopen ${days} dagen`,
  },
  product: {
    chooseIphone: "Kies je iPhone",
    storage: "Opslag",
    color: "Kleur",
    all: "Alle",
    numbersAre: (unit: ReactNode) => <>Elk getal telt de {unit} die hem nu beschikbaar hebben.</>,
    seen: (ago: ReactNode) => <>beschikbaar {ago}</>,
    last: (ago: ReactNode) => <>laatst {ago}</>,
    notSeenYet: "nog niet beschikbaar geweest",
    firstCheckPending: "eerste check onderweg",
    inStock: "Op voorraad",
    inStockLower: "op voorraad",
    none: "geen",
    here: "hier",
    notAvailable: "Niet beschikbaar",
    notCheckedYet: "Nog niet gecheckt",
    availableForPickup: "Beschikbaar om op te halen",
    since: (ago: ReactNode) => <> · beschikbaar sinds {ago}</>,
    lastInStock: (ago: ReactNode) => <>Laatst beschikbaar {ago}</>,
    neverSeen: "Tot nu toe nooit beschikbaar geweest in deze winkel",
    firstCheckSoon: "Eerste check binnen een minuut",
    buy: "Bestel op apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Gelezen {checked} · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>Data: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Bronnen",
  allUsStores: "alle 269 Apple Stores in de VS",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Eigen live checks van RestockWire sinds {since}: elke configuratie van de iPhone Duo, 18 Pro en 18 Pro Max bij {where}, elke 15 seconden gelezen (elke 5 seconden waar een alert staat); cijfers op deze pagina gelezen om {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: hoeveel van de {stores} Apple Stores elke configuratie van de {model} beschikbaar hebben om op te halen</>,
    storage: "Opslag",
    pricesCaption: (model: ReactNode) => <>{model}: prijs op apple.com (simlockvrij, exclusief belasting) naast de live ophaalvoorraad</>,
    price: "Prijs",
    bestColor: "Vaakst beschikbare kleur, winkels nu",
    noRestock: (model: string) => `Van de ${model} is nog geen aanvulling vastgelegd.`,
    clockLabel: (model: string) => `voor de ${model} in het hele land`,
    storesWithIt: "Winkels die hem nu hebben",
    pairsInStock: "Winkel × configuratie beschikbaar",
    restocksLogged: "Vastgelegde aanvullingen",
    medianTime: "Mediane tijd beschikbaar",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Alt text and captions for the generic photos and the Dutch-speaking countries' place photos (others fall back to English). */
  photos: {
    "apple-store-pickup-counter": { alt: "Houten ophaalbalie met een bord Pickup in een Apple Store", caption: "Bestellingen om op te halen krijg je mee aan een balie als deze." },
    "phone-map": { alt: "Handen die op straat navigeren met een kaartapp op een smartphone", caption: "Afstand telt zwaarder dan je denkt als nieuwe voorraad maar een minuut blijft staan." },
    "phone-card-payment": { alt: "Een vrouw met een iPhone en een bankpas die online betaalt", caption: "Online betalen, ophalen in de winkel." },
    "phone-on-box": { alt: "Een nieuwe smartphone op zijn witte doos", caption: "Een nieuwe telefoon, net uit de doos." },
    "city-map-phone": { alt: "Twee mensen die een stadsplattegrond bekijken op een telefoon", caption: "De route naar de winkel plannen." },
    "phone-notification": { alt: "Hand met een telefoon die meldingen toont op het toegangsscherm", caption: "Een alert komt binnen op het toegangsscherm." },
    "apple-store-crowd-inside": { alt: "Een menigte in de rij in een drukke Apple Store in een winkelcentrum", caption: "Drukte in de lanceringsweek: de voorraad die het schap haalt, is in minuten weg." },
    "apple-store-glass-canopy": { alt: "Apple Store met een glazen gevel en een houten luifel 's avonds", caption: "Een Apple Store met glazen pui na zonsondergang." },
    "apple-store-night-vancouver": { alt: "Een verlichte Apple Store 's avonds in Vancouver", caption: "Apple Store bij avond: ophaalvoorraad kan op elk uur verschijnen, maar komt veel vaker 's ochtends." },
    "phone-hand-camera": { alt: "Iemand houdt een iPhone met drie camera's vast", caption: "Voor de Pro-modellen staan mensen in de rij." },
    "place-nl-netherlands": { alt: "Grachtenpanden met puntgevels in Amsterdam, weerspiegeld in het water onder een heldere lucht", caption: "Grachtenpanden in Amsterdam." },
    "place-nl-north-holland": { alt: "Molen De Adriaan aan het Spaarne in Haarlem", caption: "Molen De Adriaan aan het Spaarne, Haarlem." },
    "place-be-belgium": { alt: "Het Brusselse stadhuis en de gildehuizen op de Grote Markt bij zonsondergang", caption: "De Grote Markt in Brussel bij zonsondergang." },
  },
};
