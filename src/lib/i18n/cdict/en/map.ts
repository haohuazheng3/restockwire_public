/**
 * English client strings: map (the live pickup-stock map). {model} is a model's short name ("Duo") or "iPhone", never
 * translated; {in} is "in Japan" (English: the site's own "in the US", "in the UK"; other languages fill `inCountry`).
 */
export const map = {
  title: "Live pickup stock map",
  leadUs: "All {n} US Apple Stores",
  leadOne: "The Apple Store {in}",
  leadAll: "All {n} Apple Stores {in}",
  leadTail: ", updated live. The larger the dot, the more {model} configurations are listed.",
  inCountry: "in {country}",
  /** "Updated 7s ago": {ago} is the live counter. */
  updated: "Updated {ago}",
  waiting: "First sweep on its way",
  allModels: "All models",
  storage: "Storage",
  anyStorage: "Any storage",
  color: "Color",
  anyColor: "Any color",
  mapLabelUs: "Map of US Apple Stores",
  mapLabel: "Map of Apple Stores {in}",
  loading: "Map loading…",
  errors: {
    library: "The map library failed to load.",
    webgl: "The map needs WebGL2, which this browser has off or does not support",
    tiles: "Map tiles failed to load ({reason})",
    network: "network",
    /** Follows the error. */
    tail: "{error}. The store list below works as normal.",
  },
  locating: "Locating…",
  nearMe: "📍 Near me",
  /** The US region buttons. */
  regions: { "Lower 48": "Lower 48", Alaska: "Alaska", Hawaii: "Hawaii", "Puerto Rico": "Puerto Rico" } as Record<string, string>,
  allOf: "All of {country}",
  legend: { inStock: "listed", none: "none", unchecked: "not checked yet" },
  rightNow: "At this moment",
  ofStores: "of {n} stores",
  configs: { one: "{n} {model} configuration listed", other: "{n} {model} configurations listed" },
  noneListed: "At this moment no store lists this configuration.",
  firstSweep: "First sweep under way.",
  selected: "Selected store",
  close: "Close",
  /** {ago} is the live counter. */
  checked: "{city}, {region} · checked {ago}",
  openStore: "Go to the store page →",
  alertHere: "Watch this store",
  withStock: "Stores listing stock",
  tapDot: "Tap any dot to see that store.",
  nothingMatching: "No store matches this filter at the moment.",
  /** The tooltip over a dot. */
  popupCount: "{n} listed",
  popupNone: "none",
  byRegion: "By {noun}",
  regionsHave: "{model} stock in {n} of {total} {nouns}.",
  /** The US table. */
  usNoun: "state",
  usNouns: "states and territories",
  usHeader: "State",
  table: { stores: "Stores", withStock: "Listing stock", configs: "Configurations", share: "Share", page: "page" },
  /**
   * What each country's stores are grouped by (countries.ts regionNoun), singular and plural. English pages keep the
   * country data's own words; another language reads these. `area` also stands for a country without such a level.
   */
  nouns: {
    state: { one: "state", other: "states" },
    province: { one: "province", other: "provinces" },
    area: { one: "area", other: "areas" },
    department: { one: "department", other: "departments" },
    prefecture: { one: "prefecture", other: "prefectures" },
    emirate: { one: "emirate", other: "emirates" },
    canton: { one: "canton", other: "cantons" },
    county: { one: "county", other: "counties" },
    region: { one: "region", other: "regions" },
    city: { one: "city", other: "cities" },
  } as Record<string, { one: string; other: string }>,
};
