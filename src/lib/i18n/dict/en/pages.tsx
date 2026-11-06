/**
 * English strings: pages — the home board and the region, city and store pages of every country tree (the US and
 * the English country trees render these exact strings). Place names arrive already in the page's language.
 * `cc` arguments: the page's country (use the language's own name for it: places.countryLabel).
 * Labels handed to the restock modules (Last24Hours, RestockClock, SellOutTimes, DailyBars, RestocksByConfig):
 * English "in Michigan" / "at Apple Somerset" / "here" — each language writes them to fit its own module sentences.
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { CHECK_NOTE } from "@/lib/plans";

const inName = (cc: CountryCode) => COUNTRIES[cc].inName;

export const pages = {
  common: {
    /** "every 15 s, 5 s with an alert" — the check cadence note. */
    checkNote: CHECK_NOTE,
    appleStores: "Apple Stores",
    showOnMap: "See it on the map",
    restockLogs: "Restock records",
    fullLog: "Complete log →",
    restocksBy: "Which configurations restock",
    lastDays: (days: number) => `${days} days of restocks, one bar per day`,
    nearbyCities: "Apple Store cities nearby",
    neighboringStates: "Bordering states",
    acrossStateLine: "Just over the state line",
    allUsRestocks: "Every US restock",
    allRestocksIn: (cc: CountryCode) => `Every restock ${inName(cc)}`,
    regionRestocks: (place: string) => `Restocks across ${place}`,
    onTheMap: (place: string) => `Map view of ${place}`,
    allOf: (place: string) => `${place} overview`,
    allOfArrow: (place: string) => `${place} overview →`,
    /** Store and its city on one line. */
    storeAndCity: (store: string, city: string) => `${store} · ${city}`,
    /** Source list entry pointing at Apple's page for one store. */
    appleStorePage: (store: string) => `Apple's own page for ${store}`,
    /** Source list: the stores the live data covers (e.g. every Apple Store in Japan). */
    sourcesWhere: (n: number, cc: CountryCode) => `all ${n} Apple Stores ${inName(cc)}`,
    /** Place label for the restock modules (English: "in Michigan"). */
    inPlace: (place: string) => `in ${place}`,
    /** Store label for the same modules (English: "at Apple Somerset"). */
    atPlace: (place: string) => `at ${place}`,
    here: "here",
    storesWithIt: "stores listing it",
    whenRestock: (place: string) => `When does Apple restock in ${place}?`,
    howFast: (place: string) => `How long does a restock last in ${place}?`,
    latestIn: (place: string) => `Most recent restocks in ${place}`,
    noneIn: (place: string) => `${place} has no restock on record so far.`,
    faqTitle: (place: string) => `${place} Apple Stores: questions`,
    itemList: (place: string) => `Apple Store locations in ${place}`,
    alertIn: (place: string) => `Get alerts for ${place}`,
    panelPick: (place: string) => `Choose your phones, then tick the ${place} stores within reach`,
    matrixH2: "Store-by-store stock, every model",
    matrixHint: "Listed now / tracked, for each model.",
    matrixLabel: "Stock per store",
    cityPage: "Open the city page →",
    storePage: "Open the store page →",
    /** The "Live data since" date on country pages. */
    since: "November 2, 2026",
  },
  home: {
    storesWith: (short: string) => `stores listing the ${short}`,
    restocks24: "restocks, last 24 h",
    week: (n: number) => ` · ${n} in 7 d`,
    lastCheck: "latest check",
    more: (n: number) => `and ${n} more`,
    latest: (short: string) => `${short}: newest restocks`,
    none: (short: string) => `Nothing has restocked for the ${short} so far.`,
    allRestocks: "Full restock log",
    modelMap: (short: string) => `${short} on the map`,
    buy: "Order on apple.com",
    liveStock: (short: string) => `${short} stock, live`,
    live: "Live",
    alsoTracking: "Also tracked:",
    liveMap: "Live map",
    allStores: "Every store",
    questions: "Common questions",
  },
  region: {
    counts: (stores: number, cities: number) => `${stores} stores in ${cities} cit${cities > 1 ? "ies" : "y"} · checked ${CHECK_NOTE}`,
    nearbyOutside: (place: string) => `Nearest Apple Stores beyond ${place}'s borders`,
    nearbyHint: (place: string) => `Measured from the midpoint of ${place}'s stores.`,
    beyond: (place: string) => `Outside ${place}`,
    everyStore: (place: string) => `${place}, store by store`,
    /** Heading for the bordering regions, using the country's plural region noun (provinces, cantons…). */
    nearestRegions: (cc: CountryCode) => `Neighboring ${COUNTRIES[cc].regionNounPlural ?? "areas"} ${inName(cc)}`,
  },
  city: {
    /** City header line: store count and the check cadence. */
    counts: (stores: number) => `${stores} Apple Stores · checked ${CHECK_NOTE}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "About this store",
    outside: (place: string) => `Nearest stores beyond ${place}`,
    outsideRegion: (region: string) => `Nearest beyond ${region}`,
    around: (place: string) => `Near ${place}`,
    otherCities: (region: string) => `More ${region} cities with a store`,
  },
  store: {
    /** Store meta description in three lengths; the longest one within 155 characters is used. */
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `Live in-store pickup stock at ${a.place} (${a.street}, ${a.city}): ${a.duo} iPhone Duo, ${a.pro} 18 Pro and ${a.pm} Pro Max configs tracked, with hours, restock hours and nearby stores.`,
      `${a.place}, ${a.where}: pickup stock for ${a.duo} Duo, ${a.pro} 18 Pro and ${a.pm} Pro Max configs, live, with today's hours and usual restock times.`,
      `${a.place}, ${a.city}: ${a.duo} Duo, ${a.pro} 18 Pro, ${a.pm} Pro Max configs live, plus hours and restocks.`,
    ],
    /** "Tokyo, Japan" — where the store is, for the description. */
    where: (city: string, cc: CountryCode) => `${city}, ${COUNTRIES[cc].short}`,
    taxQ: (place: string) => `What does the iPhone Duo cost at ${place} once tax is added?`,
    pickupQ: (place: string) => `Does ${place} do in-store pickup for apple.com orders?`,
    pickupA: (place: string) => `Yes: at checkout choose "I'll pick it up" and ${place}, wait until Apple says the order is ready, then bring the order number, a government photo ID and the QR code or Wallet pass (a screenshot of the code is refused).`,
    /** "Apple Store Ginza": the store as people say it. */
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "Apple Store ") : `Apple Store ${name}`),
    hoursH2: (storeWord: string) => `${storeWord}: opening hours, address and pickup rules`,
    /** Opening line of the hours section. */
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place}'s address is ${address}${phone ? `; phone ${phone}` : ""}. Hours today: ${today}. Across the week: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Come in only after Apple's pickup notification** ([Apple's pickup rules](${helpUrl}))`,
      `**Have with you:** the order number · a government photo ID · the QR code or Wallet pass`,
      `**Refused:** a screenshot of the code`,
      `**Sending someone else?** Only a pickup contact named at checkout`,
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Get directions to ${place}](${dirUrl})${appleUrl ? ` · [This store on apple.com](${appleUrl})` : ""}`,
    /** Single-store places: heading, then the country or city variant. */
    onlyH2: (where: string, place: string) => `${place}: the one Apple Store ${where}`,
    /** Country with a single store. */
    onlyInCountry: (place: string, cc: CountryCode) => `Every in-store pickup ${inName(cc)} goes through ${place}, the country's only Apple Store. There is no backup store when a configuration appears here, so an alert on this store is the whole plan.`,
    /** Only store in its city. `backups` lists the next stores with distance and can be empty. */
    onlyInCity: (city: string, place: string, backups: string) => `${place} is the only Apple Store in ${city}.${backups ? ` Next nearest: ${backups}.` : ""}`,
    /** One backup store with its city and distance. */
    backup: (apple: string, city: string, dist: string) => `${apple} in ${city} (${dist})`,
    onlyBlockCountry: (place: string) => `An alert is one store plus one exact configuration; when ${place} lists yours for pickup, your phone hears within seconds.`,
    onlyBlock: (place: string) => `When ${place} does not have your configuration, those backups deserve an alert too: each alert is one store plus one exact configuration, and the push lands seconds after that store lists it.`,
    /** Opening paragraph: per model, configurations listed now out of those tracked; `peak` is the usual restock hour, or null. */
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>Right now {a.place}{a.street ? ` at ${a.street}` : ""} has <b className="text-ink">{a.duo} of {a.duoOf}</b> iPhone Duo configurations, <b className="text-ink">{a.pro} of {a.proOf}</b> of the iPhone 18 Pro and <b className="text-ink">{a.pm} of {a.pmOf}</b> of the iPhone 18 Pro Max listed for in-store pickup.{a.peak ? <> The usual restock hour here is <b className="text-ink">{a.peak}</b> local time.</> : null}</>
    ),
    restocks30: (n: number) => `${n} restocks in 30 days`,
    lookupOff: "Apple has switched off in-store pickup lookups for this store for now. RestockWire asks again every 30 minutes and lists its stock the moment Apple answers.",
    checked: "Checked",
    alertHere: (short: string) => `Watch this store for the ${short}`,
    panel: (name: string) => `Apple ${name}: choose the phones, then tick this store and any others within reach`,
    configsInStock: "configs listed",
    stockNowH2: "Listed for pickup at this moment",
    whenRestock: (name: string) => `What time does ${name} restock?`,
    howFast: (name: string) => `How long does a restock last at ${name}?`,
    history: "Restock log for this store",
    historyEmpty: "Nothing recorded at this store yet, neither a restock nor a sell-out.",
    nearby: "Stores close by",
    elsewhereIn: (region: string) => `Further afield in ${region}`,
    faqTitle: (place: string) => `${place}: questions`,
    applePage: (place: string) => `Apple's own page for ${place} (hours, events)`,
    /** Source list scope on a country page: the single store (Austria) or the full count (Japan). */
    sourcesWhere: (n: number, cc: CountryCode) => `${n === 1 ? "the single Apple Store" : `all ${n} Apple Stores`} ${inName(cc)}`,
    around: (place: string) => `Near ${place}`,
    otherInCity: (city: string) => `${city}'s other Apple Stores`,
    cityPage: (city: string) => `${city} overview`,
    moreIn: (region: string) => `Other stores in ${region}`,
    everyIn: (cc: CountryCode) => `Apple Stores ${inName(cc)}, complete list`,
    allIn: (cc: CountryCode) => `Every Apple Store ${inName(cc)}`,
    countryHome: (cc: CountryCode) => `${COUNTRIES[cc].name} overview`,
    footnote: "Stock status is what apple.com reports for in-store pickup at the most recent check.",
    footnoteIntl: (cc: CountryCode, regionWord: string) => ` Prices are in ${COUNTRIES[cc].currency} and distances in ${COUNTRIES[cc].unit === "mi" ? "miles" : "kilometres"}. RestockWire is neither a ${regionWord} nor a retailer site.`,
  },
};
