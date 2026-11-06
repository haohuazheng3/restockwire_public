/**
 * English strings: content — the SEO building blocks (FAQ, browse/related rows, stat strips, product parts, sources,
 * live widgets), the enrich helpers (opening hours, durations, FAQ answers, titles), live {{tokens}}
 * (lib/content/facts.ts), the restock-pattern sentence (lib/content/siteFacts.ts) and photo alt text.
 *
 * For translators: arguments arrive already written for the language — numbers formatted, durations, distances,
 * store, city and colour names in their local form, counts with their noun ("31 restocks", built from the `{ one,
 * other }` forms here, "#" = the number). A translation arranges words around them. Functions that return JSX keep
 * the same elements: only the words around `{…}` change. Never translate model names (iPhone Duo, 18 Pro, 18 Pro Max),
 * storage sizes, "Apple Store", "RestockWire" or apple.com. Check intervals are only ever 15 and 5 seconds.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import photoList from "@/content/images.json";

/** Plural forms of one phrase ("#" = the number); a language without plurals gives `other` only. */
const f = (x: Forms): Forms => x;

/** The page a FAQ or explainer is about. */
type Kind = "state" | "city" | "store" | "model";

export const content = {
  /* ------------------------------------------------------------ lib/seo/enrich.ts: opening hours (24-hour times) */
  hours: {
    closed: "Closed",
    /** All seven days the same: "Every day 10:00–21:00". */
    everyDay: (hours: string) => `Every day ${hours}`,
    tomorrow: "tomorrow",
    /** The next opening on a later day: "Sun at 11:00" (`day` is a short weekday name). */
    dayAt: (day: string, time: string) => `${day} at ${time}`,
    /** `next`: "tomorrow at 10:00" / "Sun at 11:00". */
    closedTodayOpens: (next: string) => `Closed today · opens ${next}`,
    closedToday: "Closed today",
    opensAt: (time: string) => `Opens at ${time}`,
    openNow: (closes: string) => `Open now · closes ${closes}`,
    closedNowOpens: (next: string) => `Closed now · opens ${next}`,
    closedNow: "Closed now",
  },

  /* ------------------------------------------------------------ enrich.ts: small formatters */
  duration: {
    /** How long stock stayed listed, below one minute. */
    underAMinute: "under a minute",
    /** Two parts of one duration: "2 h" + "15 min" → "2 h 15 min". */
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  /** The last item of a list cut short: "a, b, c and 4 more". */
  listMore: (n: string) => `${n} more`,
  /** "Austin, TX (12 mi)" / "Toronto (19 km)": a nearby store's city and its distance. */
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  /* ------------------------------------------------------------ enrich.ts: FAQ (one sentence per answer) */
  faq: {
    /** How answers name the page: "at Apple The Summit", "for the iPhone Duo", "in Texas". */
    where: (kind: Kind, place: string) => (kind === "store" ? `at ${place}` : kind === "model" ? `for the ${place}` : `in ${place}`),
    nRestocks: f({ one: "# restock", other: "# restocks" }),
    /**
     * How often a place restocks. `count`: "31 restocks", or null when none was logged; `where` from faq.where;
     * `peak`: the usual local hour ("10 AM") and busiest weekday ("Tuesday"), when the data shows one.
     */
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Zero restocks ${where} over the last ${days} days` : `${count} ${where} over the last ${days} days (${week} in the past week)`}${peak ? `, clustered around ${peak.hour} local time${peak.day ? `, with ${peak.day}s the busiest` : ""}` : ""}; Apple itself announces no schedule.`,
    lastsNone: (where: string) => `Not enough restocks ${where} have sold out yet to put a number on it.`,
    /** `duration`: "2 h 15 min". */
    lasts: (days: string, duration: string) => `About ${duration} at the median: that is how long a restocked configuration stayed listed before selling out, over the last ${days} days.`,
    /** One nearby store in an answer: "Apple Bridge Street in Huntsville, AL (90 mi)". */
    storeIn: (store: string, line: string) => `${store} in ${line}`,
    /** The answer listing the nearest stores ("A, B and C"). */
    nearestA: (stores: string) => `${stores}.`,

    // model pages (the US)
    modelStockQ: (model: string) => `Where is the ${model} in stock for pickup right now?`,
    modelStockNone: (model: string) => `No US Apple Store listed it at the latest check; this page lists the first one the moment the ${model} appears for pickup.`,
    nUsStores: f({ one: "# US Apple Store", other: "# US Apple Stores" }),
    /** `count`: "3 US Apple Stores". */
    modelStockSome: (count: string) => `${count} at the latest check, each listed on this page with its configurations.`,
    priceQ: (model: string) => `What does the ${model} cost?`,
    /** `storages`: "256GB, 512GB, 1TB"; `colors`: "Night Sky and Star White". */
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} to ${high} unlocked, set by storage (${storages}), in ${colors}.`,
    modelRestockQ: (model: string) => `How often is the ${model} restocked?`,
    modelLastsQ: (model: string) => `Once the ${model} is back, how long does it stay listed?`,
    reserveQ: (model: string) => `Is there a way to reserve the ${model} for pickup?`,
    reserveA: "Not in advance: when a store lists your configuration you order it on apple.com with in-store pickup, and Apple holds it for the time slot you pick.",

    // store pages
    storeStockQ: (store: string, model: string) => `Is the ${model} in stock at ${store}?`,
    nConfigs: f({ one: "# configuration", other: "# configurations" }),
    /** `count`: "2 configurations". */
    storeStockYes: (count: string) => `Yes: ${count} at the latest check, with storage and color in the table on this page.`,
    /** No Duo: `pro` / `proMax` = configurations of the 18 Pro / 18 Pro Max listed now (null when both are 0). */
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No, not at the latest check${other ? `; it does list ${other.pro} iPhone 18 Pro and ${other.proMax} 18 Pro Max configurations` : ", and it has no 18 Pro or 18 Pro Max configuration either"}.`,
    hoursQ: (store: string) => `When is ${store} open?`,
    /** `hours`: the week ("Mon–Sat 10:00–21:00 · Sun 11:00–18:00") or null; `today`: "10:00–21:00 (open now)" or null. */
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "See the hours table on this page"}${today ? `; today ${today}` : ""}; address: ${address}${phone ? `, phone ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `How often is the iPhone restocked at ${store}?`,
    storeLastsQ: (store: string) => `How long does a restock stay listed at ${store}?`,
    storeNearestQ: (store: string) => `Which Apple Stores are closest to ${store}?`,

    // state, city and country pages
    placeStockQ: (place: string, model: string) => `Which Apple Stores in ${place} list the ${model} for pickup right now?`,
    placeStockNone: (place: string, model: string) => `None at the latest check; the moment a store in ${place} lists the ${model}, it appears on this page.`,
    nStores: f({ one: "# store", other: "# stores" }),
    /** `count`: "2 stores"; `stores`: their names, listed. */
    placeStockSome: (count: string, stores: string) => `${count} at the latest check: ${stores}.`,
    countQ: (place: string) => `How many Apple Stores are there in ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    /** Several stores: "5 Apple Stores, including A, B and C". `stores`: up to three names (state pages add "in {city}"). */
    countMany: (count: string, stores: string) => `${count}, among them ${stores}.`,
    /** One store: "1 Apple Store: Apple The Summit". */
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `How often is the iPhone restocked in ${place}?`,
    placeLastsQ: (place: string) => `How long does stock last in ${place} once it is back?`,
    placeNearestQ: (place: string) => `Which Apple Stores outside ${place} are closest?`,
  },

  /* ------------------------------------------------------------ enrich.ts: explainer and the alert rule */
  /** "In-store pickup at …": three short paragraphs. */
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
    /** `code`: the state's two-letter code. */
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: iPhone Duo at ${duoNow} of ${stores}`,
      `Apple Stores in ${city}, ${code} – live iPhone Duo pickup`,
      `Apple Stores in ${city}, ${code} – iPhone Duo stock now`,
      `${city} Apple Stores – live iPhone stock`,
    ],
    /** Store page <title> and H1: "Apple {name}" first (what people search), then the promise. `region`: the only store's city or state, or null. */
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
    /** `days`: the window (30). */
    none: (days: string) => `Zero confirmed restocks over the last ${days} days.`,
    nConfirmed: f({ one: "# confirmed restock", other: "# confirmed restocks" }),
    /** `count`: "30 confirmed restocks". */
    countIn: (count: string, days: string) => `${count} over the last ${days} days`,
    /** Median minutes a restock stayed listed. */
    stay: (minutes: string) => `; a restock usually stays listed ~${minutes} min`,
    nDays: f({ one: "# day", other: "# days" }),
    /** Restocks on too few local days to call a pattern: `onDays` "2 days" or null. */
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` on ${onDays}` : ""}, not yet enough for a usual hour${stay}.`,
    /** `hour`: "8 AM" / "noon"; `weekday`: "Friday" or null. */
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
    /** `short`: "Duo", "18 Pro", "18 Pro Max". */
    restockLog: (short: string) => `${short} restock record`,
    liveMap: "Live map",
    mostStores: "Largest store counts",
    allStates: "All states",
    bigCities: "Major cities",
    cities: "Cities",
    /** `region`: the country's word for its regions (regionNouns), singular. */
    storesBy: (region: string) => `Stores by ${region}`,
    /** `inName` is English only ("in the UK"); other languages use `country`, the country's name. */
    allStoresIn: ({ inName }: { inName: string; country: string }) => <>Every Apple Store {inName} →</>,
    /** `regions`: the region word, plural. */
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
    /** `short`: "Duo", "18 Pro"… */
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
  /** Photo credit: `link` is "{photographer} / Pexels". */
  photoCredit: (link: ReactNode) => <>Photo: {link}</>,
  sources: "Sources",
  /** Default `where` of the tracker line. */
  allUsStores: "every one of the 269 US Apple Stores",
  /** The first source: our own tracker. `since`: the date tracking began; `asOf`: when this page's numbers were read. */
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire&apos;s own live checks since {since}: each iPhone Duo, 18 Pro and 18 Pro Max configuration at {where}, read every 15 seconds (every 5 seconds where an alert is set); figures on this page read at {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: how many of {stores} Apple Stores list each {model} configuration for pickup</>,
    storage: "Storage",
    pricesCaption: (model: ReactNode) => <>{model}: apple.com price (unlocked, before tax) next to live pickup stock</>,
    price: "Price",
    bestColor: "Most-listed color, stores now",
    noRestock: (model: string) => `The ${model} has no restock on record yet.`,
    /** RestockClock label: "for the iPhone Duo nationwide". */
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
