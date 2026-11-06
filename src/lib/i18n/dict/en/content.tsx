/**
 * English strings: content — the SEO building blocks (FAQ, browse/related rows, stat strips, product parts, sources,
 * live widgets), the enrich helpers (opening hours, durations, FAQ answers, titles), live {{tokens}}
 * (lib/content/facts.ts), the restock-pattern sentence (lib/content/siteFacts.ts) and photo alt text.
 *
 * For translators: arguments arrive already written for the language — numbers formatted, durations, distances,
 * store, city and colour names in their local form, counts with their noun (e.g. "31 restocks", made from the plural
 * objects below, where "#" stands for the number). A translation only places words around them. JSX-returning functions
 * keep their elements; translators change the words between braces and nothing else. Never translate model names (iPhone Duo, 18 Pro, 18 Pro Max),
 * storage sizes, "Apple Store", "RestockWire" or apple.com. Check intervals are only ever 15 and 5 seconds.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import photoList from "@/content/images.json";

/** Plural forms of one phrase ("#" = the number); a language without plurals fills in just the other form. */
const f = (x: Forms): Forms => x;

/** Which kind of page the FAQ or explainer belongs to. */
type Kind = "state" | "city" | "store" | "model";

export const content = {
  /* ------------------------------------------------------------ lib/seo/enrich.ts: opening hours (24-hour times) */
  hours: {
    closed: "Closed",
    /** Same hours all week, e.g. "Every day 10:00–21:00". */
    everyDay: (hours: string) => `Every day ${hours}`,
    tomorrow: "tomorrow",
    /** Next opening on a later day, e.g. "Sun at 11:00" (day = short weekday name). */
    dayAt: (day: string, time: string) => `${day} at ${time}`,
    /** next: e.g. "tomorrow at 10:00" or "Sun at 11:00". */
    closedTodayOpens: (next: string) => `Closed today · opens ${next}`,
    /** Status labels for today (tests pin these exact words). */
    closedToday: "Closed today",
    opensAt: (time: string) => `Opens at ${time}`,
    openNow: (closes: string) => `Open now · closes ${closes}`,
    closedNowOpens: (next: string) => `Closed now · opens ${next}`,
    /** Closed, with no later opening known. */
    closedNow: "Closed now",
  },

  /* ------------------------------------------------------------ enrich.ts: little format helpers */
  duration: {
    /** How long stock stayed listed, below one minute. */
    underAMinute: "under a minute",
    /** Two parts of one duration: "2 h" + "15 min" → "2 h 15 min". */
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  /** Tail of a shortened list ("a, b, c and 4 more"). */
  listMore: (n: string) => `${n} more`,
  /** City of a nearby store plus distance, e.g. "Toronto (19 km)". */
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  /* ------------------------------------------------------------ enrich.ts: FAQ entries (each answer is one sentence) */
  faq: {
    /** The place phrase answers use, e.g. "at Apple The Summit", "for the iPhone Duo", "in Texas". */
    where: (kind: Kind, place: string) => (kind === "store" ? `at ${place}` : kind === "model" ? `for the ${place}` : `in ${place}`),
    nRestocks: f({ one: "# restock", other: "# restocks" }),
    /**
     * Restock frequency answer. count is e.g. "31 restocks" (null if nothing was logged); where comes from faq.where;
     * peak holds the usual local hour and the busiest weekday whenever the data supports one.
     */
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Zero restocks ${where} over the last ${days} days` : `${count} ${where} over the last ${days} days (${week} in the past week)`}${peak ? `, the bulk of them${peak.day ? ` on ${peak.day}s and` : ""} around ${peak.hour} local time` : ""}; Apple itself announces no schedule.`,
    lastsNone: (where: string) => `Not enough restocks ${where} have sold out yet to put a number on it.`,
    /** duration arrives formatted, e.g. "2 h 15 min". */
    lasts: (days: string, duration: string) => `About ${duration} at the median: that is how long a restocked configuration stayed listed before selling out, over the last ${days} days.`,
    /** A nearby store inside an answer, store name then its city line. */
    storeIn: (store: string, line: string) => `${store} in ${line}`,
    /** Answer that just lists the closest stores. */
    nearestA: (stores: string) => `${stores}.`,

    // US model pages
    modelStockQ: (model: string) => `Where is the ${model} in stock for pickup right now?`,
    modelStockNone: (model: string) => `No US Apple Store listed it at the latest check; this page lists the first one the moment the ${model} appears for pickup.`,
    nUsStores: f({ one: "# US Apple Store", other: "# US Apple Stores" }),
    /** count arrives as e.g. "3 US Apple Stores". */
    modelStockSome: (count: string) => `${count} at the latest check, each listed on this page with its configurations.`,
    priceQ: (model: string) => `What does the ${model} cost?`,
    /** storages and colors arrive as ready-made lists. */
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} to ${high} unlocked, set by storage (${storages}), in ${colors}.`,
    modelRestockQ: (model: string) => `How often is the ${model} restocked?`,
    modelLastsQ: (model: string) => `Once the ${model} is back, how long does it stay listed?`,
    reserveQ: (model: string) => `Is there a way to reserve the ${model} for pickup?`,
    reserveA: "Not in advance: when a store lists your configuration you order it on apple.com with in-store pickup, and Apple holds it for the time slot you pick.",

    // store pages
    storeStockQ: (store: string, model: string) => `Is the ${model} in stock at ${store}?`,
    nConfigs: f({ one: "# configuration", other: "# configurations" }),
    /** count arrives as e.g. "2 configurations". */
    storeStockYes: (count: string) => `Yes: ${count} at the latest check, with storage and color in the table on this page.`,
    /** Duo absent. other carries the current 18 Pro and 18 Pro Max config counts, or is null when both are zero. */
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No, not at the latest check${other ? `; it does list ${other.pro} iPhone 18 Pro and ${other.proMax} 18 Pro Max configurations` : ", and it has no 18 Pro or 18 Pro Max configuration either"}.`,
    hoursQ: (store: string) => `When is ${store} open?`,
    /** hours is the weekly line or null; today is today's hours with the open/closed note, or null. */
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "See the hours table on this page"}${today ? `; today ${today}` : ""}; address: ${address}${phone ? `, phone ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `How often is the iPhone restocked at ${store}?`,
    storeLastsQ: (store: string) => `How long does a restock stay listed at ${store}?`,
    storeNearestQ: (store: string) => `Which Apple Stores are closest to ${store}?`,

    // region, city and country pages
    placeStockQ: (place: string, model: string) => `Which Apple Stores in ${place} list the ${model} for pickup right now?`,
    /** Nothing listed anywhere in the place. */
    placeStockNone: (place: string, model: string) => `None at the latest check; the moment a store in ${place} lists the ${model}, it appears on this page.`,
    nStores: f({ one: "# store", other: "# stores" }),
    /** count like "2 stores", followed by the store names. */
    placeStockSome: (count: string, stores: string) => `${count} at the latest check: ${stores}.`,
    countQ: (place: string) => `How many Apple Stores are there in ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    /** More than one store: the count, then at most three names (state pages append the city). */
    countMany: (count: string, stores: string) => `${count}, among them ${stores}.`,
    /** Exactly one store: the count, then its name. */
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `How often is the iPhone restocked in ${place}?`,
    placeLastsQ: (place: string) => `How long does stock last in ${place} once it is back?`,
    placeNearestQ: (place: string) => `Which Apple Stores outside ${place} are closest?`,
  },

  /* ------------------------------------------------------------ enrich.ts: pickup explainer + alert definition */
  /** Three short paragraphs on how in-store pickup and our checks work. */
  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "every US Apple Store" : `Apple Stores in ${place}`;
    return [
      `In-store pickup is an apple.com purchase: you choose the configuration and the store at checkout, pay online and collect it in person, often the same day. Carrier stores and walk-in shelf stock are a separate pool.`,
      `At ${at}, RestockWire reads every tracked configuration every 15 seconds, or every 5 seconds where an alert is set. A second check has to confirm a change before it counts, so a one-off glitch never shows up as a restock or a sell-out.`,
      `Each confirmed change goes into the log, and the log draws the restock chart and the history on this page.`,
    ];
  },
  alertRule: "An alert is one store plus one exact phone (model, storage size, color); within seconds of apple.com switching to available, a push goes out, or an e-mail if no device takes notifications.",

  /* ------------------------------------------------------------ enrich.ts: page titles (≤ 60 characters; the first that fits wins) */
  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores in ${name}: iPhone Duo listed at ${duoNow} of ${stores}`,
      `Apple Stores in ${name} – live iPhone Duo pickup stock`,
      `Apple Stores in ${name} – iPhone Duo stock now`,
      `${name} Apple Stores – live iPhone stock`,
    ],
    /** code is the two-letter state abbreviation. */
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: iPhone Duo at ${duoNow} of ${stores}`,
      `Apple Stores in ${city}, ${code} – live iPhone Duo pickup`,
      `Apple Stores in ${city}, ${code} – iPhone Duo stock now`,
      `${city} Apple Stores – live iPhone stock`,
    ],
    /** Store <title> and H1: the store name leads (the search term), the promise follows. region is the city or state when the store is its only one, else null. */
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: Live iPhone Stock, Restock Hours, Pickup`,
        `${name}${r}: Live iPhone Stock & Restock Hours`,
        `${name}${r}: Live iPhone Stock & Hours`,
        `${name}: Live iPhone Stock, Restock Hours, Pickup`,
        `${name}: Live iPhone Stock & Hours`,
        `${name}: Live iPhone Stock`,
        `${name} – live stock`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} pickup stock: listed at ${storesNow} Apple Stores now`,
      `${name} pickup stock: ${storesNow} Apple Stores now`,
      `${name} in-store pickup stock, live now`,
    ],
  },

  /* ------------------------------------------------------------ lib/content/facts.ts: live {{tokens}} in articles */
  tokens: {
    /** {{duo.medianStay}} before there are enough restock → sell-out pairs. */
    tooFewToMeasure: "not enough data yet",
    /** {{duo.lastRestock}} before the first restock. */
    noneLoggedYet: "none on record yet",
    /** {{duo.topConfig}} before the first restock. */
    noneYet: "none so far",
  },

  /* ------------------------------------------------------------ lib/content/siteFacts.ts: one store's restock pattern */
  pattern: {
    /** days is the look-back window, 30. */
    none: (days: string) => `Zero confirmed restocks over the last ${days} days.`,
    nConfirmed: f({ one: "# confirmed restock", other: "# confirmed restocks" }),
    /** count arrives as e.g. "30 confirmed restocks". */
    countIn: (count: string, days: string) => `${count} over the last ${days} days`,
    /** Median listing time of a restock, in minutes. */
    stay: (minutes: string) => `; a restock usually stays listed ~${minutes} min`,
    nDays: f({ one: "# day", other: "# days" }),
    /** Restocks spread over too few local days for a pattern; onDays is e.g. "2 days", or null. */
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` on ${onDays}` : ""}, not yet enough for a usual hour${stay}.`,
    /** hour like "8 AM" or "noon"; weekday is a day name or null. */
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Usual restock hour: ${hour} local time${weekday ? `, with ${weekday} the busiest day` : ""}; ${count}${stay}.`,
  },

  /* ------------------------------------------------------------ lib/seo/countryLinks.ts: a country's word for its regions */
  regionNouns: {
    state: f({ one: "state", other: "states" }),
    province: f({ one: "province", other: "provinces" }),
    area: f({ one: "area", other: "areas" }),
    department: f({ one: "department", other: "departments" }),
    prefecture: f({ one: "prefecture", other: "prefectures" }),
    emirate: f({ one: "emirate", other: "emirates" }),
    canton: f({ one: "canton", other: "cantons" }),
    region: f({ one: "region", other: "regions" }),
    county: f({ one: "county", other: "counties" }),
    city: f({ one: "city", other: "cities" }),
  } as Record<string, Forms>,

  /* ------------------------------------------------------------ components/ui/Viz.tsx */
  measured: "How the numbers are measured",

  /* ------------------------------------------------------------ components/seo/* */
  /** Faq and RichFaq heading. */
  faqTitle: "Questions and answers",
  breadcrumb: "Breadcrumb",
  keepExploring: "More from RestockWire",
  browse: {
    storesByState: "Stores by state",
    allStatesCities: "Every state and city →",
    liveByModel: "Live stock, model by model",
    modelStock: (model: string) => `${model} stock`,
    thisPage: "this page",
    /** short is the short model name (Duo, 18 Pro, 18 Pro Max). */
    restockLog: (short: string) => `${short} restock record`,
    liveMap: "Live map",
    mostStores: "Largest store counts",
    allStates: "All states",
    bigCities: "Major cities",
    cities: "Cities",
    /** region is the singular region noun from regionNouns. */
    storesBy: (region: string) => `Stores by ${region}`,
    /** inName ("in the UK") exists in English only; translations use country, the plain country name. */
    allStoresIn: ({ inName }: { inName: string; country: string }) => <>Every Apple Store {inName} →</>,
    /** regions is the plural region noun. */
    allRegions: (regions: string) => `Every one of the ${regions}`,
  },
  modelCards: "Pick an iPhone",
  narrative: {
    /** " Last restock: <b>iPhone Duo 256GB Black</b> at Apple X, 3m ago." `at` is narrative.at or nothing. */
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Newest restock: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> at {store}</>,
  },
  statStrip: {
    inStockNow: "Listed now",
    ofStores: (n: string) => `out of ${n} stores`,
    stores: "Stores",
    nCities: f({ one: "# city", other: "# cities" }),
    tracked: "on the wire",
    /** short model name, e.g. Duo. */
    modelNow: (short: string) => `${short} now`,
    configsInStock: "configs listed",
    storesWithStock: f({ one: "store listing stock", other: "stores listing stock" }),
    restocks24h: "Restocks, 24 h",
    /** "9 in 7 d · 31 in 30 d" (d = days). */
    restocksHint: (week: string, month: string, days: string) => `${week} in 7 d · ${month} in ${days} d`,
    sellOuts: (days: string) => `Sell-outs ${days} d`,
    stays: (duration: string) => `stays ~${duration}`,
    noPairs: "no sell-outs paired yet",
    lastRestock: "Newest restock",
    noneYet: "none so far",
    inLastDays: (days: string) => `in the last ${days} days`,
  },
  product: {
    chooseIphone: "Pick your iPhone",
    storage: "Storage",
    color: "Color",
    /** Facet chip for every storage size / every colour. */
    all: "All",
    /** `unit`: "stores" / "configurations". */
    numbersAre: (unit: ReactNode) => <>Each number counts {unit} listing it now.</>,
    seen: (ago: ReactNode) => <>listed {ago}</>,
    last: (ago: ReactNode) => <>last {ago}</>,
    notSeenYet: "not listed so far",
    firstCheckPending: "first check on its way",
    inStock: "In stock",
    /** Place list rows (lower case). */
    inStockLower: "in stock",
    none: "none",
    /** Drive time under a few hundred metres. */
    here: "here",
    notAvailable: "Not listed",
    notCheckedYet: "Not checked yet",
    availableForPickup: "Listed for pickup",
    since: (ago: ReactNode) => <> · listed since {ago}</>,
    lastInStock: (ago: ReactNode) => <>Last listed {ago}</>,
    neverSeen: "Never listed at this store so far",
    firstCheckSoon: "First check coming within a minute",
    buy: "Order on apple.com",
    /** `checked`: "7s ago" (ticks); `note`: checkNote. */
    checked: (checked: ReactNode, note: ReactNode) => <>Read {checked} · {note}</>,
    /** Same words as CHECK_NOTE in lib/plans.ts. */
    checkNote: "every 15 s, 5 s with an alert",
  },

  /* ------------------------------------------------------------ components/content/* */
  /** Table source line under a content table. */
  source: (source: ReactNode) => <>Data: {source}</>,
  /** Photo credit; link renders as photographer / Pexels. */
  photoCredit: (link: ReactNode) => <>Photo: {link}</>,
  sources: "Sources",
  /** Default `where` of the tracker line. */
  allUsStores: "every one of the 269 US Apple Stores",
  /** First source line, our own tracker. since = tracking start date; asOf = when the numbers on the page were read. */
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire&apos;s own live checks since {since}: each iPhone Duo, 18 Pro and 18 Pro Max configuration at {where}, read every 15 seconds (every 5 seconds where an alert is set); figures on this page read at {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: how many of {stores} Apple Stores list each {model} configuration for pickup</>,
    storage: "Storage",
    pricesCaption: (model: ReactNode) => <>{model}: apple.com price (unlocked, before tax) next to live pickup stock</>,
    price: "Price",
    bestColor: "Most-listed color, stores now",
    noRestock: (model: string) => `The ${model} has no restock on record yet.`,
    /** RestockClock label for a model across the whole country. */
    clockLabel: (model: string) => `for the ${model} across the country`,
    storesWithIt: "Stores listing it now",
    pairsInStock: "Store × config pairs listed",
    restocksLogged: "Restocks on record",
    medianTime: "Median time listed",
    /** Below one minute. */
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Photo alt text and caption by image id. English is src/content/images.json itself (scripts/pexels.mjs writes it); a translation lists the ids it covers. */
  photos: Object.fromEntries((photoList as { id: string; alt: string; caption?: string }[]).map((p) => [p.id, p.caption ? { alt: p.alt, caption: p.caption } : { alt: p.alt }])) as Record<string, { alt: string; caption?: string }>,
};
