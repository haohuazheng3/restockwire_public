/**
 * Swedish strings: content — FAQ, browse rows, stat strips, product parts, sources, live widgets, the enrich
 * helpers (opening hours, durations, FAQ answers, titles), live tokens, the restock-pattern sentence and photo alt
 * text. Arguments arrive formatted ("31 påfyllningar", "kl. 9", "natthimmel"); the words go around them.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { NOUNS } from "./util";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "Stängt",
    everyDay: (hours: string) => `Alla dagar ${hours}`,
    tomorrow: "i morgon",
    dayAt: (day: string, time: string) => `${day} kl. ${time}`,
    closedTodayOpens: (next: string) => `Stängt idag · öppnar ${next}`,
    closedToday: "Stängt idag",
    opensAt: (time: string) => `Öppnar kl. ${time}`,
    openNow: (closes: string) => `Öppet nu · stänger kl. ${closes}`,
    closedNowOpens: (next: string) => `Stängt nu · öppnar ${next}`,
    closedNow: "Stängt nu",
  },

  duration: {
    underAMinute: "under en minut",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `${k} till`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `på ${place}` : kind === "model" ? `för ${place}` : `i ${place}`),
    nRestocks: f({ one: "# påfyllning", other: "# påfyllningar" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Noll påfyllningar ${where} de senaste ${days} dagarna` : `${count} ${where} de senaste ${days} dagarna (${week} den senaste veckan)`}${peak ? `, samlade runt ${peak.hour} lokal tid${peak.day ? `, flest på ${peak.day}ar` : ""}` : ""}; Apple själv publicerar inget schema.`,
    lastsNone: (where: string) => `För få påfyllningar ${where} har sålt slut än för att sätta en siffra på det.`,
    lasts: (days: string, duration: string) => `Ungefär ${duration} i median: så länge låg en påfylld konfiguration ute innan den sålde slut, de senaste ${days} dagarna.`,
    storeIn: (store: string, line: string) => `${store} i ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `Var finns ${model} att hämta just nu?`,
    modelStockNone: (model: string) => `Ingen Apple Store i USA listade den vid senaste kontrollen; sidan visar den första i samma stund som ${model} dyker upp för hämtning.`,
    nUsStores: f({ one: "# Apple Store i USA", other: "# Apple Store-butiker i USA" }),
    modelStockSome: (count: string) => `${count} vid senaste kontrollen, var och en listad på sidan med sina konfigurationer.`,
    priceQ: (model: string) => `Vad kostar ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} till ${high} olåst, beroende på lagring (${storages}), i ${colors}.`,
    modelRestockQ: (model: string) => `Hur ofta fylls ${model} på?`,
    modelLastsQ: (model: string) => `När ${model} väl är tillbaka, hur länge ligger den ute?`,
    reserveQ: (model: string) => `Går det att reservera ${model} för hämtning?`,
    reserveA: "Inte i förväg: när en butik listar din konfiguration beställer du den på apple.com med hämtning i butik, och Apple håller den till tiden du väljer.",

    storeStockQ: (store: string, model: string) => `Finns ${model} i lager på ${store}?`,
    nConfigs: f({ one: "# konfiguration", other: "# konfigurationer" }),
    storeStockYes: (count: string) => `Ja: ${count} vid senaste kontrollen, med lagring och färg i tabellen på sidan.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Nej, inte vid senaste kontrollen${other ? `; däremot listar den ${other.pro} konfigurationer av iPhone 18 Pro och ${other.proMax} av 18 Pro Max` : ", och ingen konfiguration av 18 Pro eller 18 Pro Max heller"}.`,
    hoursQ: (store: string) => `När har ${store} öppet?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Se tabellen med öppettider på sidan"}${today ? `; idag ${today}` : ""}; adress: ${address}${phone ? `, telefon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Hur ofta fylls iPhone på hos ${store}?`,
    storeLastsQ: (store: string) => `Hur länge ligger en påfyllning ute på ${store}?`,
    storeNearestQ: (store: string) => `Vilka Apple Store ligger närmast ${store}?`,

    placeStockQ: (place: string, model: string) => `Vilka Apple Store i ${place} listar ${model} för hämtning just nu?`,
    placeStockNone: (place: string, model: string) => `Ingen vid senaste kontrollen; i samma stund som en butik i ${place} listar ${model} syns den på sidan.`,
    nStores: f({ one: "# butik", other: "# butiker" }),
    placeStockSome: (count: string, stores: string) => `${count} vid senaste kontrollen: ${stores}.`,
    countQ: (place: string) => `Hur många Apple Store finns det i ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store-butiker" }),
    countMany: (count: string, stores: string) => `${count}, bland dem ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `Hur ofta fylls iPhone på i ${place}?`,
    placeLastsQ: (place: string) => `Hur länge räcker lagret i ${place} när det väl är tillbaka?`,
    placeNearestQ: (place: string) => `Vilka Apple Store utanför ${place} ligger närmast?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `På ${place}` : kind === "model" ? "I alla Apple Store i USA" : `I Apple Store-butikerna i ${place}`;
    return [
      "Hämtning i butik är ett köp på apple.com: du väljer konfiguration och butik i kassan, betalar online och hämtar själv, ofta samma dag. Operatörernas butiker och lagret på hyllan är en separat pott.",
      `${at} läser RestockWire varje bevakad konfiguration var 15:e sekund, eller var 5:e sekund där en bevakning finns. En andra kontroll måste bekräfta en ändring innan den räknas, så ett enstaka fel blir aldrig en påfyllning eller ett slutsålt.`,
      "Varje bekräftad ändring hamnar i loggen, och loggen ritar påfyllningsdiagrammet och historiken på den här sidan.",
    ];
  },
  alertRule: "En bevakning är en butik plus en exakt telefon (modell, lagring, färg); inom några sekunder från att apple.com slår om till tillgänglig går en notis ut, eller ett mejl om ingen enhet tar emot notiser.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store i ${name}: iPhone Duo listad i ${duoNow} av ${stores}`,
      `Apple Store i ${name} – iPhone Duo att hämta, live`,
      `Apple Store i ${name} – iPhone Duo i lager nu`,
      `Apple Store ${name} – iPhone i lager live`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store i ${city}, ${code}: iPhone Duo i ${duoNow} av ${stores}`,
      `Apple Store i ${city}, ${code} – iPhone Duo att hämta, live`,
      `Apple Store i ${city}, ${code} – iPhone Duo i lager nu`,
      `Apple Store ${city} – iPhone i lager live`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone i lager live, påfyllningstider, hämtning`,
        `${name}${r}: iPhone i lager live & påfyllningstider`,
        `${name}${r}: iPhone i lager live & öppettider`,
        `${name}: iPhone i lager live, påfyllningstider, hämtning`,
        `${name}: iPhone i lager live & öppettider`,
        `${name}: iPhone i lager live`,
        `${name} – lager live`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} att hämta: listad i ${storesNow} Apple Store-butiker nu`,
      `${name} att hämta: ${storesNow} Apple Store-butiker nu`,
      `${name} – lager för hämtning i butik, live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "för lite data än",
    noneLoggedYet: "ingen registrerad än",
    noneYet: "ingen hittills",
  },

  pattern: {
    none: (days: string) => `Noll bekräftade påfyllningar de senaste ${days} dagarna.`,
    nConfirmed: f({ one: "# bekräftad påfyllning", other: "# bekräftade påfyllningar" }),
    countIn: (count: string, days: string) => `${count} de senaste ${days} dagarna`,
    stay: (minutes: string) => `; en påfyllning ligger oftast ute ~${minutes} min`,
    nDays: f({ one: "# dag", other: "# dagar" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` på ${onDays}` : ""}, ännu inte nog för en vanlig tid${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Vanlig påfyllningstid: ${hour} lokal tid${weekday ? `, med ${weekday} som den livligaste dagen` : ""}; ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, [one, other]]) => [k, f({ one, other })])) as Record<string, Forms>,

  measured: "Så mäts siffrorna",

  faqTitle: "Frågor och svar",
  breadcrumb: "Sökväg",
  keepExploring: "Mer från RestockWire",
  browse: {
    storesByState: "Butiker per delstat",
    allStatesCities: "Alla delstater och städer →",
    liveByModel: "Lager live, modell för modell",
    modelStock: (model: string) => `${model} i lager`,
    thisPage: "den här sidan",
    restockLog: (short: string) => `Påfyllningslogg för ${short}`,
    liveMap: "Livekarta",
    mostStores: "Flest butiker",
    allStates: "Alla delstater",
    bigCities: "Storstäder",
    cities: "Städer",
    storesBy: (region: string) => `Butiker per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Alla Apple Store i {country} →</>,
    allRegions: (regions: string) => `Samtliga ${regions}`,
  },
  modelCards: "Välj en iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Senaste påfyllning: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> på {store}</>,
  },
  statStrip: {
    inStockNow: "Listade nu",
    ofStores: (k: string) => `av ${k} butiker`,
    stores: "Butiker",
    nCities: f({ one: "# stad", other: "# städer" }),
    tracked: "bevakas",
    modelNow: (short: string) => `${short} nu`,
    configsInStock: "konfig. listade",
    storesWithStock: f({ one: "butik med lager", other: "butiker med lager" }),
    restocks24h: "Påfyllningar, 24 tim",
    restocksHint: (week: string, month: string, days: string) => `${week} på 7 d · ${month} på ${days} d`,
    sellOuts: (days: string) => `Slutsålda ${days} d`,
    stays: (duration: string) => `ligger ute ~${duration}`,
    noPairs: "inga slutsålda kopplade än",
    lastRestock: "Senaste påfyllning",
    noneYet: "ingen hittills",
    inLastDays: (days: string) => `de senaste ${days} dagarna`,
  },
  product: {
    chooseIphone: "Välj din iPhone",
    storage: "Lagring",
    color: "Färg",
    all: "Alla",
    numbersAre: (u: ReactNode) => <>Varje siffra räknar {u} som listar den nu.</>,
    seen: (ago: ReactNode) => <>listad {ago}</>,
    last: (ago: ReactNode) => <>senast {ago}</>,
    notSeenYet: "inte listad hittills",
    firstCheckPending: "första kontrollen är på väg",
    inStock: "I lager",
    inStockLower: "i lager",
    none: "inga",
    here: "här",
    notAvailable: "Inte listad",
    notCheckedYet: "Inte kollad än",
    availableForPickup: "Listad för hämtning",
    since: (ago: ReactNode) => <> · listad sedan {ago}</>,
    lastInStock: (ago: ReactNode) => <>Senast listad {ago}</>,
    neverSeen: "Aldrig listad i den här butiken hittills",
    firstCheckSoon: "Första kontrollen inom en minut",
    buy: "Beställ på apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Läst {checked} · {note}</>,
    checkNote: "var 15:e sekund, var 5:e med bevakning",
  },

  source: (s: ReactNode) => <>Data: {s}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Källor",
  allUsStores: "alla 269 Apple Store-butiker i USA",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWires egna livekontroller sedan {since}: varje konfiguration av iPhone Duo, 18 Pro och 18 Pro Max i {where}, läst var 15:e sekund (var 5:e sekund där en bevakning finns); siffrorna på sidan lästa {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: hur många av {stores} Apple Store-butiker som listar varje konfiguration av {model} för hämtning</>,
    storage: "Lagring",
    pricesCaption: (model: ReactNode) => <>{model}: pris på apple.com (olåst, före skatt) bredvid lager för hämtning live</>,
    price: "Pris",
    bestColor: "Mest listade färg, butiker nu",
    noRestock: (model: string) => `${model} har ingen registrerad påfyllning än.`,
    clockLabel: (model: string) => `för ${model} i hela landet`,
    storesWithIt: "Butiker som listar den nu",
    pairsInStock: "Listade par butik × konfig.",
    restocksLogged: "Registrerade påfyllningar",
    medianTime: "Mediantid listad",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Disk av trä med en skylt för hämtning inne i en Apple Store", caption: "Beställningar för hämtning lämnas ut vid en disk som den här." },
    "phone-map": { alt: "Händer som navigerar med en kartapp i mobilen utomhus", caption: "Avståndet spelar större roll än man tror när en påfyllning varar en minut." },
    "phone-card-payment": { alt: "En kvinna med en iPhone och ett betalkort som betalar online", caption: "Betalning online för hämtning i butik." },
    "phone-on-box": { alt: "En ny mobiltelefon som ligger på sin vita kartong", caption: "En ny telefon, direkt ur kartongen." },
    "city-map-phone": { alt: "Två personer som tittar på en stadskarta i mobilen", caption: "Vägen till butiken planeras." },
    "phone-notification": { alt: "En hand som håller en mobil med notiser på låsskärmen", caption: "En notis landar på låsskärmen." },
    "apple-store-crowd-inside": { alt: "Folk som köar inne i en välbesökt Apple Store i ett köpcentrum", caption: "Trängsel i en Apple Store under lanseringsveckan: lagret som når hyllorna tar slut på minuter." },
    "apple-store-glass-canopy": { alt: "Apple Store med glasfasad och tak av trä på kvällen", caption: "En Apple Store med glasfasad efter mörkrets inbrott." },
    "apple-store-night-vancouver": { alt: "En upplyst Apple Store en kväll i Vancouver", caption: "Apple Store på kvällen: lager för hämtning kan dyka upp när som helst, men kommer betydligt oftare på morgonen." },
    "phone-hand-camera": { alt: "En person som håller en iPhone med trippelkamera", caption: "Det är Pro-modellerna folk köar för." },
    "place-se-sweden": { alt: "Riddarholmskyrkan och kajen vid Gamla stan i Stockholm", caption: "Riddarholmen vid Gamla stan i Stockholm." },
  },
};
