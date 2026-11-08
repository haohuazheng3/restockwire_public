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
    closedTodayOpens: (next: string) => `Dicht vandaag · weer open ${next}`,
    closedToday: "Dicht vandaag",
    opensAt: (time: string) => `Gaat open om ${time}`,
    openNow: (closes: string) => `Open tot ${closes}`,
    closedNowOpens: (next: string) => `Nu dicht · weer open ${next}`,
    closedNow: "Nu dicht",
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
      `${count == null ? `${days} dagen lang niets teruggekomen ${where}` : `${count} ${where} over ${days} dagen, waarvan ${week} deze week`}${peak ? `; piek rond ${peak.hour} (tijd ter plaatse)${peak.day ? `, ${peak.day} is de topdag` : ""}` : ""}. Een schema publiceert Apple niet.`,
    lastsNone: (where: string) => `Er zijn ${where} nog te weinig aanvullingen uitverkocht om er een getal op te plakken.`,
    lasts: (days: string, duration: string) => `Zo'n ${duration} (mediaan): zo lang bleef een aangevulde configuratie beschikbaar voordat hij uitverkocht was, gemeten over de afgelopen ${days} dagen.`,
    storeIn: (store: string, line: string) => `${store} in ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `Waar is de ${model} nu op voorraad om op te halen?`,
    modelStockNone: (model: string) => `Volgens de recentste check nergens in de VS. Komt de ${model} ergens terug voor ophalen, dan staat die winkel hier als eerste.`,
    nUsStores: f({ one: "# Amerikaanse Apple Store", other: "# Amerikaanse Apple Stores" }),
    modelStockSome: (count: string) => `Volgens de recentste check ${count}; per winkel staan de klaarliggende configuraties op deze pagina.`,
    priceQ: (model: string) => `Hoeveel betaal je voor de ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Simlockvrij van ${low} tot ${high}; de opslag (${storages}) bepaalt het bedrag. Kleuren: ${colors}.`,
    modelRestockQ: (model: string) => `Hoe vaak wordt de ${model} aangevuld?`,
    modelLastsQ: (model: string) => `Hoe lang blijft de ${model} beschikbaar als hij terug is?`,
    reserveQ: (model: string) => `Kun je de ${model} reserveren om op te halen?`,
    reserveA: "Niet vooraf: zodra een winkel je configuratie beschikbaar heeft, bestel je hem op apple.com met ophalen in de winkel, en Apple houdt hem apart voor het tijdvak dat je kiest.",

    storeStockQ: (store: string, model: string) => `Is de ${model} op voorraad bij ${store}?`,
    nConfigs: f({ one: "# configuratie", other: "# configuraties" }),
    storeStockYes: (count: string) => `Volgens de recentste check wel: ${count}. Opslag en kleur staan in de tabel hieronder.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Op het laatste checkmoment niet${other ? `. De iPhone 18 Pro lag er wel (${other.pro}), net als de 18 Pro Max (${other.proMax})` : "; ook de 18 Pro en de 18 Pro Max ontbraken"}.`,
    hoursQ: (store: string) => `Wanneer is ${store} open?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Zie de tabel met openingstijden op deze pagina"}${today ? `; vandaag ${today.replace(/\((\p{Lu})/u, (_m, c: string) => `(${c.toLowerCase()}`)}` : ""}; adres: ${address}${phone ? `, telefoon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Hoe vaak wordt de iPhone aangevuld bij ${store}?`,
    storeLastsQ: (store: string) => `Hoe lang blijft een aanvulling beschikbaar bij ${store}?`,
    storeNearestQ: (store: string) => `Welke Apple Stores liggen het dichtst bij ${store}?`,

    placeStockQ: (place: string, model: string) => `Waar in ${place} ligt de ${model} nu klaar om op te halen?`,
    placeStockNone: (place: string, model: string) => `Volgens de recentste check nergens. Krijgt een winkel in ${place} de ${model} terug, dan staat die hier meteen.`,
    nStores: f({ one: "# winkel", other: "# winkels" }),
    placeStockSome: (count: string, stores: string) => `Volgens de recentste check ${count}: ${stores}.`,
    countQ: (place: string) => `Hoeveel Apple Stores telt ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    countMany: (count: string, stores: string) => `${count}, waaronder ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `Hoe vaak wordt de iPhone aangevuld in ${place}?`,
    placeLastsQ: (place: string) => `Hoe lang blijft voorraad in ${place} beschikbaar als hij terug is?`,
    placeNearestQ: (place: string) => `Welke Apple Stores buiten ${place} liggen het dichtstbij?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "alle Amerikaanse Apple Stores" : `de Apple Stores in ${place}`;
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
    countIn: (count: string, days: string) => `${count} over ${days} dagen`,
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
    allStatesCities: "Elke staat, elke stad →",
    liveByModel: "Live voorraad, model voor model",
    modelStock: (model: string) => `${model}-voorraad`,
    thisPage: "deze pagina",
    restockLog: (short: string) => `Aanvullogboek ${short}`,
    liveMap: "Live kaart",
    mostStores: "Meeste winkels",
    allStates: "Elke staat",
    bigCities: "Grote steden",
    cities: "Steden",
    storesBy: (region: string) => `Winkels per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Elke Apple Store in {country} →</>,
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
    storesWithStock: f({ one: "winkel waar hij klaarligt", other: "winkels waar hij klaarligt" }),
    restocks24h: "Aanvullingen, 24 u",
    /** A tile that counts one model only (its short name first). */
    scoped: (label: string, model: string) => `${model} · ${label}`,
    restocksHint: (week: string, month: string, days: string) => `7 d: ${week} · ${days} d: ${month}`,
    sellOuts: (days: string) => `Uitverkocht ${days} d`,
    stays: (duration: string) => (duration === "korter dan een minuut" ? `blijft ${duration}` : `blijft ~${duration}`),
    noPairs: "nog geen uitverkoop gekoppeld",
    lastRestock: "Nieuwste aanvulling",
    noneYet: "nog geen",
    inLastDays: (days: string) => `over ${days} dagen`,
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
    availableForPickup: "Klaar om op te halen",
    since: (ago: ReactNode) => <> · beschikbaar sinds {ago}</>,
    lastInStock: (ago: ReactNode) => <>Laatst beschikbaar {ago}</>,
    neverSeen: "Tot nu toe nooit beschikbaar geweest in deze winkel",
    firstCheckSoon: "Binnen een minuut de eerste check",
    buy: "Bestel op apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Gelezen {checked} · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>Data: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Bronnen",
  allUsStores: "de 269 Amerikaanse Apple Stores",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Eigen live checks van RestockWire sinds {since}: elke configuratie van de iPhone Duo, 18 Pro en 18 Pro Max bij {where}, elke 15 seconden gelezen (elke 5 seconden waar een alert staat); cijfers op deze pagina gelezen om {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: hoeveel van de {stores} Apple Stores elke configuratie van de {model} beschikbaar hebben om op te halen</>,
    storage: "Opslag",
    pricesCaption: (model: ReactNode) => <>{model}: prijs op apple.com (simlockvrij, exclusief belasting) naast de live ophaalvoorraad</>,
    price: "Prijs",
    bestColor: "Vaakst beschikbare kleur, winkels nu",
    noRestock: (model: string) => `Van de ${model} is nog geen aanvulling vastgelegd.`,
    clockLabel: (model: string) => `${model}, landelijk`,
    storesWithIt: "Winkels die hem nu hebben",
    pairsInStock: "Winkel × configuratie beschikbaar",
    restocksLogged: "Vastgelegde aanvullingen",
    medianTime: "Mediane tijd beschikbaar",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Alt text and captions for the generic photos and the Dutch-speaking countries' place photos (others fall back to English). */
  photos: {
    "apple-store-pickup-counter": { alt: "Ruim atrium van een winkelcentrum met een Apple Store, roltrappen en daglicht", caption: "Winkels in een winkelcentrum zoals deze vullen de ophaalvoorraad aan voordat de deuren opengaan." },
    "phone-map": { alt: "Close-up buiten van een hand met een smartphone waarop een kaartapp openstaat", caption: "Blijft voorraad maar een minuut liggen, dan beslist de reistijd." },
    "phone-card-payment": { alt: "Vrouw betaalt contactloos met haar smartphone bij een betaalterminal", caption: "Eerst betalen op apple.com, dan ophalen aan de balie." },
    "phone-on-box": { alt: "Smartphone in zijn doos tegen een witte achtergrond", caption: "Nog in de doos: zo neem je hem mee uit de winkel." },
    "city-map-phone": { alt: "Jong stel navigeert met een telefoon tijdens een autorit over een landweg", caption: "Onderweg naar de winkel, route op de telefoon." },
    "phone-notification": { alt: "Close-up van een hand met een smartphone die de spreuk 'Hard Work Forever Pays.' toont", caption: "Het scherm waar je alert straks oplicht." },
    "apple-store-crowd-inside": { alt: "Klanten proberen apparaten uit aan de tafels van een Apple Store in een winkelcentrum in Bangkok", caption: "Binnen is elke tafel een demotafel; de rij voor ophalen staat achterin." },
    "apple-store-glass-canopy": { alt: "Moderne Apple Store van glas aan de rivier in het centrum van Chicago", caption: "Glas en staal aan het water in Chicago." },
    "apple-store-night-vancouver": { alt: "Luchtfoto van de verlichte skyline en brug van Vancouver bij nacht", caption: "Vancouver bij nacht. Ophaalvoorraad duikt vaker 's ochtends op dan 's avonds." },
    "phone-hand-camera": { alt: "Close-up van een hand met een smartphone in een oranje hoesje en drie cameralenzen", caption: "Drie cameralenzen op de achterkant." },
    "place-nl-netherlands": { alt: "Luchtfoto van de Stevenskerk in Nijmegen bij zonsondergang", caption: "Nederland: de Stevenskerk in Nijmegen." },
    "place-nl-north-holland": { alt: "Luchtfoto van de Erasmusbrug en de skyline van Rotterdam in de schemering", caption: "Erasmusbrug en skyline van Rotterdam bij schemer." },
    "place-be-belgium": { alt: "Luchtfoto van Antwerpen in de schemering onder een kleurrijke lucht", caption: "België: Antwerpen vanuit de lucht, bij valavond." },
    "compare-pickup-bag": { alt: "Twee mensen geven elkaar binnen een boodschappentas aan", caption: "Ophalen eindigt aan de balie; de juiste winkel kiezen begint veel eerder." },
    "compare-two-stores": { alt: "Voetgangers weerspiegeld in een glazen etalage aan een drukke straat", caption: "Twee winkels in dezelfde stad vullen vaak op verschillende uren aan." },
    "guide-android-phone": { alt: "Hand met een Android-smartphone waarop het beginscherm te zien is", caption: "Op Android levert Chrome de meldingen af, zonder iets te installeren." },
    "guide-android-watch": { alt: "Close-up van een vrouw met een smartwatch om de pols", caption: "Een gekoppeld Wear OS-horloge toont de meldingen die Chrome ontvangt." },
    "guide-focus-desk": { alt: "Jonge vrouw kijkt op kantoor naast haar laptop op haar smartphone", caption: "Bij de focus ‘Werk’ vergeten mensen RestockWire toe te voegen." },
    "guide-focus-phone-night": { alt: "Vrouw gebruikt haar smartphone in een donkere slaapkamer, verlicht door het scherm", caption: "De focus ‘Slaap’ dempt meldingen tenzij RestockWire op de lijst met toegestane apps staat." },
    "guide-watch-notification": { alt: "Een hand tikt buiten op een smartwatch om de pols", caption: "Lees de winkel af op je pols en reserveer daarna op je iPhone." },
    "guide-watch-wrist": { alt: "Zwart-witte close-up van een smartwatch met meldingen om een pols", caption: "Met de iPhone vergrendeld komt de voorraadmelding op het horloge binnen." },
    "ranking-checkout": { alt: "Klant betaalt met een smartphone bij een kassaterminal in een winkel", caption: "Bij de snelste winkels moet een reservering binnen seconden na de melding rond zijn." },
    "ranking-queue": { alt: "Mensen staan in de rij voor een drukke winkel in een stadsstraat", caption: "Snel uitverkocht volgt de vraag rond een winkel, niet de omvang van de levering." },
    "reports-delivery-boxes": { alt: "Gestapelde kartonnen dozen voor de laadperrons van een magazijn", caption: "Voorraad komt per levering in de winkels; het weekrapport telt wat het ophaalschap bereikt." },
    "reports-iphone-boxes": { alt: "Een nieuwe iPhone met doos en oplaadaccessoires op een houten tafel", caption: "Elke aanvulling in het rapport is één configuratie die terugkomt in één winkel." },
    "status-phone-check": { alt: "Vrouw kijkt aandachtig naar haar smartphone in een schemerige kamer", caption: "Wachten op een ophaalcheck: de minuten waarin de status van de opvraging telt." },
    "status-store-counter": { alt: "Hand met een smartphone waarop een laadicoon draait", caption: "Zo ziet een vastgelopen opvraging eruit; de statuspagina vertelt of het aan Apple of aan je telefoon ligt." },
  },
};
