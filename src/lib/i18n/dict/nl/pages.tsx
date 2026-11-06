/**
 * Dutch strings: pages — the home board and the region, city and store pages of the Dutch versions (/nl-nl, /nl-be).
 * Place names arrive in Dutch. Labels handed to the restock modules ("in Noord-Holland", "bij Apple Haarlem", "hier")
 * fit the Dutch module sentences (modules.tsx).
 */
import type { CountryCode } from "@/lib/apple/countries";
import { COUNTRIES } from "@/lib/apple/countries";
import { num } from "@/lib/i18n/format";
import { countryLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const ARTICLE: Partial<Record<CountryCode, string>> = { us: "de ", uk: "het ", ae: "de " };
/** "in Nederland", "in de Verenigde Staten". */
const inC = (cc: CountryCode) => `in ${ARTICLE[cc] ?? ""}${countryLabel(cc, L)}`;
const NOUN: Record<string, string> = { state: "staat", province: "provincie", area: "gebied", department: "departement", prefecture: "prefectuur", emirate: "emiraat", canton: "kanton", region: "gewest", county: "provincie", city: "stad" };
const NOUNS: Record<string, string> = { state: "staten", province: "provincies", area: "gebieden", department: "departementen", prefecture: "prefecturen", emirate: "emiraten", canton: "kantons", region: "gewesten", county: "provincies", city: "steden" };
/** The cadence note, as CHECK_NOTE says it in English. */
const CHECK = "elke 15 sec., 5 sec. met een alert";
/** The store as Dutch speakers name a store called after its city ("Brussels" → "Brussel"). */
const SAID: Record<string, string> = { Brussels: "Brussel", "The Hague": "Den Haag" };

export const pages: Dict["pages"] = {
  common: {
    checkNote: CHECK,
    appleStores: "Apple Stores",
    showOnMap: "Bekijk op de kaart",
    restockLogs: "Logboek van aanvullingen",
    fullLog: "Hele logboek →",
    restocksBy: "Welke configuraties terugkomen",
    lastDays: (days: number) => `${n$(days)} dagen aanvullingen, één balk per dag`,
    nearbyCities: "Steden met een Apple Store in de buurt",
    neighboringStates: "Aangrenzende staten",
    acrossStateLine: "Net over de staatsgrens",
    allUsRestocks: "Elke aanvulling in de VS",
    allRestocksIn: (cc: CountryCode) => `Elke aanvulling ${inC(cc)}`,
    regionRestocks: (place: string) => `Aanvullingen in heel ${place}`,
    onTheMap: (place: string) => `${place} op de kaart`,
    allOf: (place: string) => `Overzicht ${place}`,
    allOfArrow: (place: string) => `Overzicht ${place} →`,
    storeAndCity: (store: string, city: string) => `${store} · ${city}`,
    appleStorePage: (store: string) => `Apples eigen pagina van ${/^apple\b/i.test(store) ? store : `Apple ${store}`}`,
    sourcesWhere: (n: number, cc: CountryCode) => (n === 1 ? `de Apple Store ${inC(cc)}` : `alle ${n$(n)} Apple Stores ${inC(cc)}`),
    inPlace: (place: string) => `in ${place}`,
    atPlace: (place: string) => `bij ${place}`,
    here: "hier",
    storesWithIt: "winkels met voorraad",
    whenRestock: (place: string) => `Wanneer vult Apple aan in ${place}?`,
    howFast: (place: string) => `Hoe lang blijft een aanvulling in ${place} beschikbaar?`,
    latestIn: (place: string) => `Recentste aanvullingen in ${place}`,
    noneIn: (place: string) => `In ${place} is tot nu toe geen aanvulling gelogd.`,
    faqTitle: (place: string) => `Apple Stores in ${place}: vragen`,
    itemList: (place: string) => `Apple Stores in ${place}`,
    alertIn: (place: string) => `Alerts voor ${place}`,
    panelPick: (place: string) => `Kies je iPhones en vink de winkels in ${place} aan die je kunt bereiken`,
    matrixH2: "Voorraad per winkel, elk model",
    matrixHint: "Nu beschikbaar / gevolgd, per model.",
    matrixLabel: "Voorraad per winkel",
    cityPage: "Naar de stadspagina →",
    storePage: "Naar de winkelpagina →",
    since: "2 november 2026",
  },
  home: {
    storesWith: (short: string) => `winkels met de ${short}`,
    restocks24: "aanvullingen, laatste 24 u",
    week: (n: number) => ` · ${n$(n)} in 7 d`,
    lastCheck: "laatste check",
    more: (n: number) => `en nog ${n$(n)}`,
    latest: (short: string) => `${short}: nieuwste aanvullingen`,
    none: (short: string) => `Nog geen aanvulling van de ${short}.`,
    allRestocks: "Volledig logboek",
    modelMap: (short: string) => `${short} op de kaart`,
    buy: "Bestel op apple.com",
    liveStock: (short: string) => `${short}-voorraad, live`,
    live: "Live",
    alsoTracking: "Ook gevolgd:",
    liveMap: "Live kaart",
    allStores: "Alle winkels",
    questions: "Veelgestelde vragen",
  },
  region: {
    counts: (stores: number, cities: number) => `${n$(stores)} winkels in ${n$(cities)} ${cities === 1 ? "stad" : "steden"} · gecheckt ${CHECK}`,
    nearbyOutside: (place: string) => `Dichtstbijzijnde Apple Stores over de grens van ${place}`,
    nearbyHint: (place: string) => `Gemeten vanaf het midden van de winkels in ${place}.`,
    beyond: (place: string) => `Buiten ${place}`,
    everyStore: (place: string) => `${place}, winkel voor winkel`,
    nearestRegions: (cc: CountryCode) => `Aangrenzende ${NOUNS[COUNTRIES[cc].regionNoun ?? "area"] ?? "gebieden"} ${inC(cc)}`,
  },
  city: {
    counts: (stores: number) => `${n$(stores)} Apple Stores · gecheckt ${CHECK}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Over deze winkel",
    outside: (place: string) => `Dichtstbijzijnde winkels buiten ${place}`,
    outsideRegion: (region: string) => `Dichtstbij buiten ${region}`,
    around: (place: string) => `Bij ${place} in de buurt`,
    otherCities: (region: string) => `Meer steden in ${region} met een winkel`,
  },
  store: {
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `Live ophaalvoorraad bij ${a.place} (${a.street}, ${a.city}): ${n$(a.duo)} iPhone Duo-, ${n$(a.pro)} 18 Pro- en ${n$(a.pm)} Pro Max-configuraties gevolgd, met openingstijden, aanvultijden en winkels in de buurt.`,
      `${a.place}, ${a.where}: live ophaalvoorraad van ${n$(a.duo)} Duo-, ${n$(a.pro)} 18 Pro- en ${n$(a.pm)} Pro Max-configuraties, met de openingstijden van vandaag en de gebruikelijke aanvultijden.`,
      `${a.place}, ${a.city}: ${n$(a.duo)} Duo-, ${n$(a.pro)} 18 Pro- en ${n$(a.pm)} Pro Max-configuraties live, plus openingstijden en aanvullingen.`,
    ],
    where: (city: string, cc: CountryCode) => `${city}, ${countryLabel(cc, L)}`,
    taxQ: (place: string) => `Wat kost de iPhone Duo bij ${place} inclusief belasting?`,
    pickupQ: (place: string) => `Kun je een bestelling van apple.com ophalen bij ${place}?`,
    pickupA: (place: string) => `Ja. Kies bij het afrekenen "Ik haal het op" en ${place}, wacht tot Apple meldt dat je bestelling klaarligt, en neem dan het bestelnummer, een officieel identiteitsbewijs met foto en de QR-code of Wallet-pas mee (een screenshot van de code wordt geweigerd).`,
    storeWord: (name: string) => {
      const bare = name.replace(/^apple\s*/i, "");
      return `Apple Store ${SAID[bare] ?? bare}`;
    },
    hoursH2: (storeWord: string) => `${storeWord}: openingstijden, adres en regels voor ophalen`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place} zit op ${address}${phone ? `; telefoon ${phone}` : ""}. Vandaag open: ${today}. De hele week: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Kom pas na Apples melding dat je bestelling klaarligt** ([Apples regels voor ophalen](${helpUrl}))`,
      "**Neem mee:** het bestelnummer · een officieel identiteitsbewijs met foto · de QR-code of Wallet-pas",
      "**Geweigerd:** een screenshot van de code",
      "**Stuur je iemand anders?** Alleen een ophaalcontact dat je bij het afrekenen hebt opgegeven",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Route naar ${place}](${dirUrl})${appleUrl ? ` · [Deze winkel op apple.com](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `${place}: de enige Apple Store ${where}`,
    onlyInCountry: (place: string, cc: CountryCode) => `Elke bestelling om op te halen ${inC(cc)} loopt via ${place}, de enige Apple Store van het land. Duikt hier een configuratie op, dan is er geen reservewinkel, dus een alert op deze winkel is je hele plan.${cc === "be" ? " Ook vanuit Antwerpen (hemelsbreed zo'n 45 km) en Gent (zo'n 50 km) is dit de dichtstbijzijnde." : ""}`,
    onlyInCity: (city: string, place: string, backups: string) => `${place} is de enige Apple Store in ${city}.${backups ? ` Daarna het dichtstbij: ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple} in ${city} (${dist})`,
    onlyBlockCountry: (place: string) => `Een alert is één winkel plus één exacte configuratie; zodra ${place} de jouwe aanbiedt om op te halen, weet je telefoon het binnen seconden.`,
    onlyBlock: (place: string) => `Heeft ${place} jouw configuratie niet, dan verdienen die reservewinkels ook een alert: elke alert is één winkel plus één exacte configuratie, en de push komt seconden nadat die winkel hem aanbiedt.`,
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>Op dit moment biedt {a.place}{a.street ? ` (${a.street})` : ""} <b className="text-ink">{n$(a.duo)} van de {n$(a.duoOf)}</b> configuraties van de iPhone Duo aan om op te halen, <b className="text-ink">{n$(a.pro)} van de {n$(a.proOf)}</b> van de iPhone 18 Pro en <b className="text-ink">{n$(a.pm)} van de {n$(a.pmOf)}</b> van de iPhone 18 Pro Max.{a.peak ? <> Het gebruikelijke aanvuluur hier is <b className="text-ink">{a.peak}</b> lokale tijd.</> : null}</>
    ),
    restocks30: (n: number) => `${n$(n)} ${n === 1 ? "aanvulling" : "aanvullingen"} in 30 dagen`,
    lookupOff: "Apple heeft de voorraadcheck voor ophalen in deze winkel voorlopig uitgezet. RestockWire vraagt het elke 30 minuten opnieuw en toont de voorraad zodra Apple antwoordt.",
    checked: "Gecheckt",
    alertHere: (short: string) => `Volg deze winkel voor de ${short}`,
    panel: (name: string) => `Apple ${SAID[name] ?? name}: kies de iPhones en vink deze winkel aan, plus andere die je kunt bereiken`,
    configsInStock: "configs beschikbaar",
    stockNowH2: "Nu beschikbaar om op te halen",
    whenRestock: (name: string) => `Hoe laat vult ${name} aan?`,
    howFast: (name: string) => `Hoe lang blijft een aanvulling bij ${name} beschikbaar?`,
    history: "Voorraadlogboek van deze winkel",
    historyEmpty: "Bij deze winkel is nog niets gelogd, geen aanvulling en geen uitverkoop.",
    nearby: "Winkels dichtbij",
    elsewhereIn: (region: string) => `Verderop in ${region}`,
    faqTitle: (place: string) => `${place}: vragen`,
    applePage: (place: string) => `Apples eigen pagina van ${place} (openingstijden, sessies)`,
    sourcesWhere: (n: number, cc: CountryCode) => (n === 1 ? `de enige Apple Store ${inC(cc)}` : `alle ${n$(n)} Apple Stores ${inC(cc)}`),
    around: (place: string) => `Bij ${place} in de buurt`,
    otherInCity: (city: string) => `De andere Apple Stores in ${city}`,
    cityPage: (city: string) => `Overzicht ${city}`,
    moreIn: (region: string) => `Andere winkels in ${region}`,
    everyIn: (cc: CountryCode) => `Apple Stores ${inC(cc)}, volledige lijst`,
    allIn: (cc: CountryCode) => `Elke Apple Store ${inC(cc)}`,
    countryHome: (cc: CountryCode) => `Overzicht ${countryLabel(cc, L)}`,
    footnote: "De voorraadstatus is wat apple.com bij de laatste check meldt voor ophalen in de winkel.",
    footnoteIntl: (cc: CountryCode, regionWord: string) => ` Prijzen in ${COUNTRIES[cc].currency === "EUR" ? "euro" : COUNTRIES[cc].currency}, afstanden in ${COUNTRIES[cc].unit === "mi" ? "mijl" : "kilometers"}. RestockWire is geen site van een ${NOUN[regionWord] ?? regionWord} en geen winkelsite.`,
  },
};
