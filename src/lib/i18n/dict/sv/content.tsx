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
    everyDay: (hours: string): string => `Varje dag ${hours}`,
    tomorrow: "i morgon",
    dayAt: (day: string, time: string): string => `${day} kl. ${time}`,
    closedTodayOpens: (next: string): string => `Stängt i dag · öppnar ${next}`,
    closedToday: "Stängt i dag",
    opensAt: (time: string): string => `Öppnar kl. ${time}`,
    openNow: (closes: string): string => `Öppet · stänger kl. ${closes}`,
    closedNowOpens: (next: string): string => `Stängt · öppnar ${next}`,
    closedNow: "Stängt för tillfället",
  },

  duration: {
    underAMinute: "mindre än en minut",
    pair: (a: string, b: string): string => `${a} ${b}`,
  },
  listMore: (k: string): string => `${k} till`,
  nearLine: (place: string, distance: string): string => `${place} · ${distance}`,

  faq: {
    nRestocks: f({ one: "# påfyllning", other: "# påfyllningar" }),
    where: (kind: Kind, place: string): string => (kind === "store" ? `på ${place}` : kind === "model" ? `för ${place}` : `i ${place}`),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }): string =>
      `${count == null ? `${days} dagar bakåt: ingen påfyllning ${where}` : `${days} dagar bakåt: ${count} ${where}, varav ${week} den senaste veckan`}${peak ? `. Tyngdpunkt kring ${peak.hour} (lokal tid)${peak.day ? `, oftast på ${peak.day}ar` : ""}` : ""}. Apple publicerar inget schema.`,
    lastsNone: (where: string): string => `Ännu för få slutsålda påfyllningar ${where} för en pålitlig siffra.`,
    lasts: (days: string, duration: string): string => `Median ${duration}: så länge en påfylld konfiguration låg ute innan den tog slut (${days} dagar bakåt).`,
    storeIn: (store: string, line: string): string => `${store}, ${line}`,
    nearestA: (stores: string): string => `${stores}.`,

    modelStockQ: (model: string): string => `${model}: i vilka butiker går den att hämta nu?`,
    modelStockNone: (model: string): string => `Vid senaste kontrollen: ingen Apple Store i USA. Första butiken som listar ${model} för hämtning visas här direkt.`,
    nUsStores: f({ one: "# Apple Store (USA)", other: "# Apple Store-butiker (USA)" }),
    modelStockSome: (count: string): string => `Senaste kontrollen: ${count}. Sidan listar varje butik med dess konfigurationer.`,
    priceQ: (model: string): string => `Vilket pris har ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string): string => `Olåst: ${low}–${high} beroende på lagring (${storages}). Färger: ${colors}.`,
    modelRestockQ: (model: string): string => `Hur ofta kommer ${model} tillbaka i lager?`,
    modelLastsQ: (model: string): string => `Hur snabbt tar ${model} slut efter en påfyllning?`,
    reserveQ: (model: string): string => `Kan man förhandsboka ${model} för hämtning?`,
    reserveA: "Nej, inte i förväg. Listar en butik din konfiguration beställer du på apple.com med hämtning i butik; Apple håller telefonen till den tid du valt.",
    nConfigs: f({ one: "# konfiguration", other: "# konfigurationer" }),

    storeStockQ: (store: string, model: string): string => `Har ${store} ${model} i lager?`,
    storeStockYes: (count: string): string => `Ja – ${count} vid senaste kontrollen. Lagring och färg står i tabellen.`,
    storeStockNo: (other: { pro: string; proMax: string } | null): string => `Nej, inte vid senaste kontrollen${other ? `. Däremot: ${other.pro} st. iPhone 18 Pro-konfigurationer och ${other.proMax} för 18 Pro Max` : ". Inte heller 18 Pro eller 18 Pro Max"}.`,
    hoursQ: (store: string): string => `Vilka öppettider har ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }): string =>
      `${hours ?? "Öppettiderna står i tabellen på sidan"}${today ? ` · i dag ${today}` : ""} · adress ${address}${phone ? ` · tel. ${phone}` : ""}.`,
    storeRestockQ: (store: string): string => `Hur ofta får ${store} in nya iPhone?`,
    storeLastsQ: (store: string): string => `Hur fort tar en påfyllning slut på ${store}?`,
    storeNearestQ: (store: string): string => `Vilka butiker ligger närmast ${store}?`,

    placeStockQ: (place: string, model: string): string => `Vilka butiker i ${place} har ${model} att hämta nu?`,
    placeStockNone: (place: string, model: string): string => `Ingen vid senaste kontrollen. När en butik i ${place} listar ${model} dyker den upp här direkt.`,
    nStores: f({ one: "# butik", other: "# butiker" }),
    placeStockSome: (count: string, stores: string): string => `${count} vid senaste kontrollen – ${stores}.`,
    countQ: (place: string): string => `Hur många Apple Store-butiker har ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store-butiker" }),
    countMany: (count: string, stores: string): string => `${count}. Bland dem: ${stores}.`,
    countOne: (count: string, store: string): string => `${count} – ${store}.`,
    placeRestockQ: (place: string): string => `Hur ofta kommer iPhone tillbaka i ${place}?`,
    placeLastsQ: (place: string): string => `Hur snabbt säljer en påfyllning slut i ${place}?`,
    placeNearestQ: (place: string): string => `Vilka butiker utanför ${place} ligger närmast?`,
  },

  explainer: (kind: Kind, place: string): string[] => {
    const at = kind === "store" ? `På ${place}` : kind === "model" ? "I samtliga Apple Store i USA" : `Bland Apple Store-butikerna i ${place}`;
    return [
      `${at} kontrollerar RestockWire varje konfiguration var 15:e sekund – var 5:e där någon har en bevakning. En ändring räknas först när nästa kontroll bekräftar den; ett enstaka felsvar blir aldrig en påfyllning eller ett slutsålt.`,
      "Loggen sparar varje bekräftad ändring. Diagrammet och historiken på sidan byggs direkt ur den.",
      "Hämtning i butik = köp på apple.com. Du väljer konfiguration och butik i kassan, betalar online och hämtar själv, ofta samma dag. Operatörsbutiker och hyllvaror i butiken räknas inte hit.",
    ];
  },
  alertRule: "En bevakning = en butik + en exakt telefon (modell, lagring, färg). Slår apple.com om till tillgänglig skickas en notis inom sekunder – eller ett mejl om ingen enhet tar emot notiser.",

  titles: {
    state: (name: string, duoNow: string, stores: string): string[] => [
      `Apple Store i ${name}: ${duoNow}/${stores} har iPhone Duo nu`,
      `Apple Store i ${name}: iPhone Duo för hämtning, live`,
      `Apple Store i ${name}: lagerläge iPhone Duo`,
      `Apple Store ${name}: iPhone-lager live`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string): string[] => [
      `Apple Store i ${city}, ${code}: ${duoNow}/${stores} har iPhone Duo`,
      `Apple Store i ${city}, ${code}: iPhone Duo för hämtning, live`,
      `Apple Store i ${city}, ${code}: lagerläge iPhone Duo`,
      `Apple Store ${city}: iPhone-lager live`,
    ],
    store: (name: string, region: string | null): string[] => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone-lager live, påfyllningar, hämtning`,
        `${name}${r}: iPhone-lager live, påfyllningstider`,
        `${name}${r}: iPhone-lager live, öppettider`,
        `${name}: iPhone-lager live, påfyllningar, hämtning`,
        `${name}: iPhone-lager live, öppettider`,
        `${name}: iPhone-lager live`,
        `${name} – lagerläge`,
      ];
    },
    model: (name: string, storesNow: string): string[] => [
      `${name} för hämtning: ${storesNow} Apple Store-butiker just nu`,
      `${name}: ${storesNow} Apple Store-butiker har den nu`,
      `${name} – hämtlager i butik, live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "underlag saknas ännu",
    noneLoggedYet: "ingen loggad ännu",
    noneYet: "ingen ännu",
  },

  pattern: {
    none: (days: string): string => `${days} dagar bakåt: ingen bekräftad påfyllning.`,
    nConfirmed: f({ one: "# påfyllning som bekräftats", other: "# påfyllningar som bekräftats" }),
    countIn: (count: string, days: string): string => `${count} på ${days} dagar`,
    stay: (minutes: string): string => `; typisk tid ute ~${minutes} min`,
    nDays: f({ one: "# dag", other: "# dagar" }),
    tooFew: (count: string, onDays: string | null, stay: string): string => `${count}${onDays ? ` fördelat på ${onDays}` : ""} – för tunt underlag för en vanlig tid${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string): string => `Påfyllningar kommer oftast ${hour} lokal tid${weekday ? `, och ${weekday} är toppdagen` : ""} · ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, [one, other]]) => [k, f({ one, other })])) as Record<string, Forms>,

  measured: "Metod: så räknar vi",

  faqTitle: "Snabba svar",
  breadcrumb: "Du är här",
  keepExploring: "Vidare på RestockWire",
  browse: {
    storesByState: "Delstat för delstat",
    allStatesCities: "Varje delstat, varje stad →",
    liveByModel: "Livelager per modell",
    modelStock: (model: string): string => `Lagerläge: ${model}`,
    thisPage: "denna sida",
    restockLog: (short: string): string => `${short}: påfyllningslogg`,
    liveMap: "Livekarta",
    mostStores: "Störst antal butiker",
    allStates: "Samtliga delstater",
    bigCities: "De stora städerna",
    cities: "Orter",
    storesBy: (region: string): string => `${region} för ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Samtliga Apple Store i {country} →</>,
    allRegions: (regions: string): string => `Alla ${regions}`,
  },
  modelCards: "Vilken iPhone?",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Senast påfylld: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> på {store}</>,
  },
  statStrip: {
    inStockNow: "Att hämta nu",
    ofStores: (k: string): string => `av ${k} butiker`,
    stores: "Butiker",
    nCities: f({ one: "# ort", other: "# orter" }),
    tracked: "bevakade",
    modelNow: (short: string): string => `${short} just nu`,
    configsInStock: "konfig. att hämta",
    storesWithStock: f({ one: "butik har lager", other: "butiker har lager" }),
    restocks24h: "Påfyllningar (24 tim)",
    /** A tile that counts one model only (its short name first). */
    scoped: (label: string, model: string): string => `${model} · ${label}`,
    restocksHint: (week: string, month: string, days: string): string => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string): string => `Slutsålt, ${days} d`,
    stays: (duration: string): string => (duration === "mindre än en minut" ? `ute ${duration}` : `ute ~${duration}`),
    noPairs: "inga slutsålda att para ihop ännu",
    lastRestock: "Senast påfyllt",
    noneYet: "ingen ännu",
    inLastDays: (days: string): string => `${days} dagar bakåt`,
  },
  product: {
    chooseIphone: "Din iPhone",
    storage: "Lagring",
    color: "Färg",
    all: "Alla",
    numbersAre: (u: ReactNode) => <>Siffran = antal {u} som listar den just nu.</>,
    seen: (ago: ReactNode) => <>sedd {ago}</>,
    last: (ago: ReactNode) => <>senast {ago}</>,
    notSeenYet: "ännu inte listad",
    firstCheckPending: "första kontrollen kommer strax",
    inStock: "I lager",
    inStockLower: "i lager",
    none: "inga",
    here: "här",
    notAvailable: "Ej listad",
    notCheckedYet: "Ej kontrollerad ännu",
    availableForPickup: "Kan hämtas",
    since: (ago: ReactNode) => <> · ute sedan {ago}</>,
    lastInStock: (ago: ReactNode) => <>Senast att hämta {ago}</>,
    neverSeen: "Har aldrig listats i den här butiken",
    firstCheckSoon: "Kontrolleras inom en minut",
    buy: "Köp på apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Kontrollerad {checked} · {note}</>,
    checkNote: "var 5:e sekund med bevakning, annars var 15:e",
  },

  source: (s: ReactNode) => <>Källa: {s}</>,
  photoCredit: (link: ReactNode) => <>Bild: {link}</>,
  sources: "Källor",
  allUsStores: "USA:s samtliga 269 Apple Store-butiker",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Egen datainsamling sedan {since}: RestockWire kontrollerar varje konfiguration av iPhone Duo, 18 Pro och 18 Pro Max i {where} var 15:e sekund (var 5:e där bevakning finns). Siffrorna avlästa {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>{model} live: antal av {stores} Apple Store-butiker som har varje konfiguration att hämta</>,
    storage: "Lagring",
    pricesCaption: (model: ReactNode) => <>{model}: apple.com-pris (olåst, exkl. skatt) och hämtlager live</>,
    price: "Pris",
    bestColor: "Färg i flest butiker nu",
    noRestock: (model: string): string => `Ingen påfyllning av ${model} loggad ännu.`,
    clockLabel: (model: string): string => `${model}, hela landet`,
    storesWithIt: "Butiker med den nu",
    pairsInStock: "Par butik × konfig. i lager",
    restocksLogged: "Loggade påfyllningar",
    medianTime: "Mediantid ute",
    underOneMin: (min: string): string => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Ljust köpcentrumatrium med en Apple Store och rulltrappor", caption: "Butiker i köpcentrum fyller ofta på hämtlagret innan dörrarna öppnar." },
    "phone-map": { alt: "Hand som håller en mobil med en kartapp, utomhus", caption: "Kartan först: en påfyllning varar ofta bara en minut, så avståndet avgör." },
    "phone-card-payment": { alt: "Kvinna som betalar kontaktlöst med mobilen vid en betalterminal", caption: "Betalningen sker online innan du hämtar i butik." },
    "phone-on-box": { alt: "Mobiltelefon i förpackning mot vit bakgrund", caption: "Målet: telefonen i handen samma dag." },
    "city-map-phone": { alt: "Ungt par som navigerar med mobilen på en bilresa på landsbygden", caption: "Närmaste butik är inte alltid den snabbaste att nå." },
    "phone-notification": { alt: "Hand som håller en mobil med citatet ”Hard Work Forever Pays.” på skärmen", caption: "Notisen landar på låsskärmen, sekunder efter bekräftelsen." },
    "apple-store-crowd-inside": { alt: "Kunder som testar enheter vid borden i en Apple Store i ett köpcentrum i Bangkok", caption: "Lanseringsveckor: hyllorna töms på minuter, och hämtkön bildas längst in." },
    "apple-store-glass-canopy": { alt: "Modern Apple Store i glas vid floden i centrala Chicago", caption: "Glasfasad vid floden i Chicago." },
    "apple-store-night-vancouver": { alt: "Vancouvers upplysta skyline och bro sedd från ovan en kväll", caption: "Kvällsljus i Vancouver. Hämtlager kan dyka upp när som helst, men morgonen dominerar." },
    "phone-hand-camera": { alt: "Närbild på en hand med en mobil i orange skal och tre kameralinser", caption: "Pro-modellerna är dem köerna handlar om." },
    "place-se-sweden": { alt: "Riddarholmskyrkan i Stockholm i skymningen, speglad i stilla vatten", caption: "Sverige: Riddarholmen i skymning, Stockholm." },
    "compare-pickup-bag": { alt: "Två personer räcker över en shoppingkasse inomhus", caption: "Hämtningen slutar vid disken; valet av rätt butik börjar långt tidigare." },
    "compare-two-stores": { alt: "Fotgängare speglas i ett glasskyltfönster på en livlig gata", caption: "Två butiker i samma stad fyller ofta på vid olika tider." },
    "guide-android-phone": { alt: "Hand som håller en Android-telefon med hemskärmen framme", caption: "På Android levererar Chrome aviseringarna utan att du installerar något." },
    "guide-android-watch": { alt: "Närbild av en kvinna med en smartklocka", caption: "En parkopplad Wear OS-klocka visar aviseringarna som Chrome tar emot." },
    "guide-focus-desk": { alt: "Ung kvinna kollar mobilen vid ett kontorsskrivbord bredvid en laptop", caption: "Fokusläget Arbete är det många glömmer att lägga till RestockWire i." },
    "guide-focus-phone-night": { alt: "Kvinna som använder mobilen i ett mörkt sovrum, upplyst av skärmen", caption: "Fokusläget Sömn tystar aviseringar om inte RestockWire finns bland de tillåtna." },
    "guide-watch-notification": { alt: "Hand som trycker på en smartklocka på handleden, utomhus", caption: "Läs butiken på handleden och reservera sedan i iPhone." },
    "guide-watch-wrist": { alt: "Svartvit närbild av en smartklocka med aviseringar på en handled", caption: "När iPhone är låst hamnar påfyllningsaviseringen på klockan." },
    "ranking-checkout": { alt: "Kund som betalar med mobilen vid en kassaterminal i en butik", caption: "I de snabbaste butikerna måste reservationen bli klar inom sekunder efter aviseringen." },
    "ranking-queue": { alt: "Människor köar utanför en välbesökt butik på en stadsgata", caption: "Snabba slutförsäljningar följer efterfrågan runt butiken, inte leveransens storlek." },
    "reports-delivery-boxes": { alt: "Staplade kartonger framför ett lagers lastkajer", caption: "Lagret når butikerna i leveranser; veckorapporten räknar det som når hämthyllan." },
    "reports-iphone-boxes": { alt: "En ny iPhone med kartong och laddtillbehör på ett träbord", caption: "Varje påfyllning i rapporten är en konfiguration som kommer tillbaka i en butik." },
    "status-phone-check": { alt: "Kvinna som tittar noga på mobilen i ett dunkelt rum", caption: "I väntan på en hämtkontroll: minuterna då det spelar roll att veta förfrågans status." },
    "status-store-counter": { alt: "Hand som håller en mobil som visar en laddningssymbol", caption: "Så ser en förfrågan som hänger sig ut; statussidan visar om felet ligger hos Apple eller i din telefon." },
  },
};
