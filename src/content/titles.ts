/**
 * Round 2 of the SEO plan (the SEO plan《三轮规则》): one entry title per bound keyword.
 * <title> and H1 carry the main keyword's entry title; each secondary keyword gets an H2 written as a
 * standalone result title, followed by a block that answers that keyword's own motive. The same page
 * serves every visitor (no cloaking): Google picks among these on-page candidates per query.
 *
 * The national product pages and the home page read their titles here; the store, city and state pages
 * build theirs in src/lib/seo/enrich.ts (storeTitle) and src/lib/seo/placeCopy.ts (placeTitle).
 */

export interface EntryTitles {
  /** Main keyword → <title> and H1. */
  main: { keyword: string; title: string; h1?: string };
  /** Secondary keywords → H2 entry titles. */
  h2: { keyword: string; title: string }[];
  description: string;
}

/** Product pages at US level, keyed by product slug. */
export const PRODUCT_TITLES: Record<string, EntryTitles> = {
  "iphone-duo": {
    main: { keyword: "iphone duo in store", title: "iPhone Duo in Store Now: 269 Apple Stores, Live", h1: "iPhone Duo in store right now, across 269 Apple Stores" },
    h2: [
      { keyword: "apple store duo", title: "Apple Store Duo stock: pickup listings versus walk-in" },
      { keyword: "iphone duo near me", title: "iPhone Duo near me: closest stores and their restock hours" },
    ],
    description: "Which Apple Store near you has the iPhone Duo in store now? Live pickup listings at 269 US stores, every Night Sky and Star White config, and restock hours.",
  },
  "iphone-18-pro-max": {
    main: { keyword: "iphone 18 pro max in stock", title: "iPhone 18 Pro Max In Stock Now at 269 Apple Stores", h1: "iPhone 18 Pro Max in stock now, across 269 Apple Stores" },
    h2: [
      { keyword: "iphone 18 pro max in stock near me", title: "iPhone 18 Pro Max in stock near me, nearest store on top" },
      { keyword: "iphone 18 pro max stock", title: "iPhone 18 Pro Max stock for each storage size and color" },
    ],
    description: "The iPhone 18 Pro Max in stock for pickup right now: each storage and color at 269 US Apple Stores, with the restock log and the usual hour behind every store.",
  },
  "iphone-18-pro-max-burgundy": {
    main: { keyword: "iphone 18 pro max burgundy", title: "iPhone 18 Pro Max Burgundy: Price and Stock Now", h1: "iPhone 18 Pro Max Burgundy: price and stock right now" },
    h2: [
      { keyword: "iphone 18 pro max dark cherry", title: "iPhone 18 Pro Max Dark Cherry? Apple calls it Burgundy" },
      { keyword: "iphone 18 pro max cherry red", title: "iPhone 18 Pro Max cherry red (Burgundy), size by size" },
    ],
    description: "The iPhone 18 Pro Max Burgundy, the deep red once rumored as Dark Cherry, from $1,299: live pickup stock for each storage size at 269 US Apple Stores.",
  },
  "iphone-18-pro-max-glacier": {
    main: { keyword: "iphone 18 pro max glacier", title: "iPhone 18 Pro Max Glacier: Price and Stock Now", h1: "iPhone 18 Pro Max Glacier: price and stock right now" },
    h2: [
      { keyword: "iphone 18 pro max blue", title: "iPhone 18 Pro Max blue is called Glacier: who has it" },
      { keyword: "iphone 18 pro max glacier blue", title: "Glacier blue iPhone 18 Pro Max, per storage and store" },
    ],
    description: "The iPhone 18 Pro Max Glacier is the pale blue one, from $1,299. Live pickup stock for each storage size at 269 US Apple Stores, with usual restock hours.",
  },
  "iphone-18-pro-max-silver": {
    main: { keyword: "iphone 18 pro max silver", title: "iPhone 18 Pro Max Silver: Price and Stock Now", h1: "iPhone 18 Pro Max Silver: price and stock right now" },
    h2: [
      { keyword: "silver iphone 18 pro max", title: "Silver iPhone 18 Pro Max: the storage that turns up most" },
      { keyword: "iphone 18 pro max silver color", title: "iPhone 18 Pro Max silver color beside Glacier and Black" },
    ],
    description: "The iPhone 18 Pro Max Silver from $1,299: live pickup stock per storage size at 269 US Apple Stores, and how many seconds each size lasts once it is back.",
  },
  "iphone-18-pro-glacier": {
    main: { keyword: "iphone 18 pro glacier", title: "iPhone 18 Pro Glacier: Price and Stock Now", h1: "iPhone 18 Pro Glacier: price and stock right now" },
    h2: [{ keyword: "iphone 18 pro blue", title: "iPhone 18 Pro blue is called Glacier: stock per size" }],
    description: "The iPhone 18 Pro Glacier is the pale blue one, from $1,199. Live pickup stock for each storage size at 269 US Apple Stores, with the usual restock hours.",
  },
  "iphone-duo-night-sky": {
    main: { keyword: "iphone duo night sky", title: "iPhone Duo Night Sky: Stock Now and Restock Log", h1: "iPhone Duo Night Sky: stock now and the restock log" },
    h2: [{ keyword: "iphone duo black", title: "iPhone Duo black? Apple calls the dark Duo Night Sky" }],
    description: "The iPhone Duo Night Sky is the dark one. Live pickup stock at 269 US Apple Stores, a log of each Night Sky restock, and an alert that fires on the next.",
  },
  "iphone-duo-star-white": {
    main: { keyword: "iphone duo star white", title: "iPhone Duo Star White: Stock Now and Restock Log", h1: "iPhone Duo Star White: stock now and the restock log" },
    h2: [{ keyword: "iphone duo white", title: "iPhone Duo white is called Star White: stock, restocks" }],
    description: "The iPhone Duo Star White is the light one. Live pickup stock at 269 US Apple Stores, a log of each Star White restock, and an alert the second one lands.",
  },
  "iphone-duo-1tb": {
    main: { keyword: "iphone duo 1tb", title: "iPhone Duo 1TB ($2,599): Pickup Stock Right Now", h1: "iPhone Duo 1TB ($2,599): pickup stock right now" },
    h2: [{ keyword: "iphone duo 1tb price", title: "iPhone Duo 1TB price: $2,599 unlocked, $108.29 monthly" }],
    description: "iPhone Duo 1TB, $2,599 unlocked: whether any of 269 US Apple Stores lists it for pickup at this moment, how often it comes back, and an alert for the next one.",
  },
  "iphone-duo-2tb": {
    main: { keyword: "iphone duo 2tb", title: "iPhone Duo 2TB ($3,199): Pickup Stock Right Now", h1: "iPhone Duo 2TB ($3,199): pickup stock right now" },
    h2: [{ keyword: "iphone duo 2tb price", title: "iPhone Duo 2TB price: $3,199. Does it ever restock?" }],
    description: "iPhone Duo 2TB, $3,199 unlocked, the Duo stores list least often. Live pickup stock at 269 US Apple Stores and an alert that fires on the next restock there.",
  },
};

/** Home page (the category tool). */
export const HOME_TITLES: EntryTitles = {
  main: { keyword: "iphone stock checker", title: "iPhone Stock Checker: Live Stock at 269 Apple Stores", h1: "Live iPhone stock checker, 269 US Apple Stores" },
  h2: [
    { keyword: "apple inventory checker", title: "Apple inventory checker: Duo, 18 Pro, Pro Max per store" },
    { keyword: "apple store stock checker", title: "Apple Store stock checker that alerts you on restock" },
  ],
  description: "Live iPhone Duo, 18 Pro and Pro Max pickup stock at 269 US Apple Stores, every restock logged by store, configuration and minute.",
};

/** Store pages bound to measured keywords, keyed by store slug. `city` is set when a one-store city's query is bound too. */
export const STORE_KEYWORDS: Record<string, { main: string; store: string; city?: string }> = {
  fifthavenue: { main: "apple fifth avenue", store: "apple store fifth avenue" },
  soho: { main: "apple soho", store: "apple store soho" },
  downtownbrooklyn: { main: "apple downtown brooklyn", store: "apple store downtown brooklyn" },
  unionsquare: { main: "apple union square", store: "apple store union square" },
  floridamall: { main: "apple florida mall", store: "apple store florida mall" },
  boylstonstreet: { main: "apple boylston street", store: "apple store boylston street", city: "apple store boston" },
  aventura: { main: "apple aventura", store: "apple store aventura" },
  williamsburg: { main: "apple williamsburg", store: "apple store williamsburg" },
  west14thstreet: { main: "apple west 14th street", store: "apple store west 14th street" },
  worldtradecenter: { main: "apple world trade center", store: "apple store world trade center" },
  upperwestside: { main: "apple upper west side", store: "apple store upper west side" },
  millenia: { main: "apple millenia", store: "apple store millenia" },
  lincolnpark: { main: "apple lincoln park", store: "apple store lincoln park" },
  pioneerplace: { main: "apple pioneer place", store: "apple store pioneer place" },
  walnutstreet: { main: "apple walnut street", store: "apple store walnut street", city: "apple store philadelphia" },
  universityvillage: { main: "apple university village", store: "apple store university village" },
  valleyfair: { main: "apple valley fair", store: "apple store valley fair" },
  oakbrook: { main: "apple oakbrook", store: "apple store oakbrook", city: "apple store oak brook" },
  highlandvillage: { main: "apple highland village", store: "apple store highland village" },
  southlaketownsquare: { main: "apple southlake town square", store: "apple store southlake town square", city: "apple store southlake" },
  thegrove: { main: "apple the grove", store: "apple store the grove" },
  pasadena: { main: "apple pasadena", store: "apple store pasadena" },
  victoriagardens: { main: "apple victoria gardens", store: "apple store victoria gardens", city: "apple store rancho cucamonga" },
  fashionvalley: { main: "apple fashion valley", store: "apple store fashion valley" },
  southpark: { main: "apple southpark", store: "apple store southpark", city: "apple store charlotte" },
  bartoncreek: { main: "apple barton creek", store: "apple store barton creek" },
  universityparkvillage: { main: "apple university park village", store: "apple store university park village", city: "apple store fort worth" },
  "4thstreet": { main: "apple 4th street", store: "apple store 4th street", city: "apple store berkeley" },
};
