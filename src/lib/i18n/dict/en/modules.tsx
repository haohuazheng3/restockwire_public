/**
 * English strings: modules — the restock, store and stock modules (src/components/{restocks,stores,stock}).
 *
 * For translators:
 * - `label` is a place phrase the page builds ("in Ohio", "at Apple Somerset", "here"); it already carries its preposition.
 * - Numbers arrive raw (English prints them as the site always has, "1170"); other languages format them with
 *   num() / plural() from @/lib/i18n/format. Durations, times, dates and percentages arrive already formatted.
 * - Functions that return JSX keep the bold runs (<b className="text-ink">) and the passed-in nodes (links, live times).
 * - Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import { CHECK_NOTE } from "@/lib/plans";

const s = (n: number) => (n === 1 ? "" : "s");

export const modules = {
  /** DailyBars: 30 days of restocks (bars) and sell-outs (stacked under them). */
  daily: {
    empty: (label: string, days: number) => `Nothing to chart ${label} yet: no restock or sell-out in the last ${days} days. The first one draws the first bar.`,
    /** The chart's lead line; `activeDays` counts the dates with any movement. */
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `Last ${days} days ${label}: ${restocks} restock${s(restocks)}, ${soldouts} sell-out${s(soldouts)}, ${activeDays} active day${s(activeDays)}.`,
    /** Follows `summary` (leading space). `day` is a short date ("10/26"). */
    busiest: (day: string, restocks: number) => <> The biggest day, <b className="text-ink">{day}</b>, brought {restocks}.</>,
    /** Screen-reader text of one bar. */
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${restocks} restocks and ${soldouts} sell-outs`,
    /** Hover text of the same bar. */
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${restocks} restocks · ${soldouts} sell-outs`,
    legendRestocks: "restocks",
    legendSoldouts: "sell-outs",
  },

  /** Last24Hours block: a lead sentence, three number tiles, then one table row per iPhone Duo configuration. */
  last24: {
    title: (label: string) => `The last 24 hours of iPhone Duo restocks ${label}`,
    /** `when` arrives formatted, with its zone or the words local time, e.g. Nov 3, 10:00 AM EST. */
    asOf: (when: string) => `read at ${when}`,
    localTime: (when: string) => `${when} local time`,
    /** Stands in for a store the catalogue no longer has. */
    anAppleStore: "an Apple Store",
    unknown: "The 24-hour count is not available at this moment; the live stock and the restock log on this page are unaffected.",
    none: (label: string, asOf: string) => <><b className="text-ink">Zero iPhone Duo restocks {label} in the last 24 hours</b> (read at {asOf}).</>,
    /**
     * `one` = single-store page, so the store counts are dropped. `config` = storage plus colour of the newest
     * restock; `store` = link to where it happened, or null on a single-store page; `when` = local date and time.
     */
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${o.restocks} iPhone Duo restock${s(o.restocks)} `}{o.one ? o.label : `at ${o.withStores} of the ${o.allStores} Apple Store${s(o.allStores)} ${o.label}`}</b> in the last 24 hours; the newest was a <b className="text-ink">{o.config}</b>{o.store != null && <> at {o.store}</>}, {o.when} local time.</>
    ),
    tileRestocks: "confirmed restocks in 24 h",
    tileConfigsBack: "configurations that reappeared",
    /** With `configs` at 0 only the store part of the label is printed. */
    tileStores: (configs: number, allConfigs: number) => `stores that restocked${configs ? ` · ${configs} of ${allConfigs} configurations` : ""}`,
    /** `store` is dropped (null) where the page is a single store. */
    tileLatest: (config: string, store: string | null) => <>newest · {config}{store != null && <> · {store}</>}</>,
    /** The last restock before the 24 hours; `day` its local date ("Nov 1"). */
    tileBefore: (config: string, store: string | null, day: string) => <>the one before · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "nothing earlier on record",
    caption: (label: string, asOf: string) => `Every iPhone Duo configuration ${label}: confirmed restocks over the last 24 hours, read at ${asOf}`,
    thConfig: "Configuration",
    thRestocks: "Restocks",
    thStores: "Stores",
    thLast: "Latest restock (local time)",
    thNow: "Listed now",
    /** "2 of 5" stores. */
    ofStores: (n: number, total: number) => `${n} of ${total}`,
    noneIn24: "none in 24 h",
    yes: "yes",
    no: "no",
    countedTitle: "What counts as a restock here",
    counted: "These are RestockWire's own reads of apple.com in-store pickup: every store every 15 seconds, stores with alerts every 5. A restock enters the log only after two checks agree; the first time a store is ever read does not count; nothing published by other trackers is mixed in.",
    /** Single-store pages pass `label` as null. */
    alert: (label: string | null) => `Get alerts${label != null ? ` ${label}` : ""}: the next one reaches you in seconds`,
  },

  /** RestockClock: when restocks arrive, by local hour and weekday. */
  clock: {
    none: (label: string, days: number) => `Zero restocks ${label} across the last ${days} days.`,
    /** Under 5 restocks, or spread over under 3 dates; `dates` is passed only in the second case. */
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${total} restock${s(total)} ${label} in the last ${days} days${dates != null ? ` (on ${dates} day${s(dates)})` : ""}: not enough yet to name a usual hour.`,
    /** `hour` is a local hour label such as 9 AM; `day` names the top weekday, or null before 14 days of data. */
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{total} restocks {label} in the last {days} days. The usual hour is <b className="text-ink">{hour}</b> local time{day ? <>; <b className="text-ink">{day}</b> brings the most</> : null}.</>
    ),
    /** English gets the zone as a city name (New York); native versions receive the zone's local name. */
    byHour: (zone: string) => `By hour · ${zone} time`,
    byWeekday: "Per weekday",
    /** Tacked onto a bar label such as 9 AM: 3; starts with a space. */
    barReported: (n: number) => ` (+${n} from other trackers)`,
    /** Tooltip of a bar that has third-party reports. */
    barReportedTitle: (bar: string, n: number) => `${bar} · plus ${n} from other trackers`,
    legendOurs: "Confirmed by RestockWire",
  },

  /** RestockFeed: one card per restock or sell-out. */
  feed: {
    empty: "The log is empty so far.",
    available: "Available",
    soldOut: "Sold out",
    /** `time` is the reader's local time ("Today 5:42 PM"). */
    soldOutAt: (time: ReactNode) => <>gone {time}</>,
    since: (time: ReactNode) => <>listed since {time}</>,
    restockedAt: (time: ReactNode) => <>came back {time}</>,
    mapAria: (store: string) => `Find ${store} on the map`,
    map: "Map",
    /** `config` = storage and colour, already in the reader's language. */
    buyAria: (model: string, config: string) => `Order the ${model} ${config} on apple.com`,
    buy: "Order on apple.com",
  },

  /** RestocksByConfig: which configurations came back, most first. */
  byConfig: {
    empty: (label: string, days: number) => `No ranking yet: nothing has restocked ${label} in the last ${days} days.`,
    /** Lead line over the ranked list. */
    intro: (label: string, days: number) => `Ranked by count: each configuration that restocked ${label} over ${days} days.`,
    times: (n: number) => `${n}×`,
    alert: "Get alerts",
  },

  /** SellOutTimes: how fast restocks sell out. Durations arrive formatted ("45–60 s", "2 min 05 s"). */
  sellout: {
    /** `band` is a formatted span of seconds, e.g. 60–80 seconds. */
    typical: (label: string, band: string) => `A typical iPhone Duo restock ${label} lasted about ${band} before it sold out.`,
    /** The median, as a lead line. */
    half: (label: string, duration: string) => `${duration}: the time it took for half of the restocks ${label} to sell out.`,
    /** No restock-to-sell-out pair in the window. */
    none: (label: string, days: number) => `No restock ${label} has run through to a sell-out in the last ${days} days.`,
    whatDuo: "iPhone Duo",
    whatAll: "all iPhones",
    tileHalf: (what: string) => <>half gone within · {what}</>,
    tileWithin30: "gone inside 30 s",
    tileWithin60: "gone inside 1 min",
    tileFastest: (n: number, days: number) => <>fastest · {n} sold-out restocks, {days} d</>,
    caption: (days: number) => `Per iPhone, last ${days} days`,
    thIphone: "iPhone",
    thSoldOut: "Sold out",
    thHalf: "Half gone within",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Fastest",
    each: "One row per restock",
    /** `full` is the duration that spans the whole row, e.g. 180 s. */
    barNote: (full: string) => `bar length = seconds listed · ${full} fills the row`,
    stillListed: (duration: string) => `still listed · ${duration}`,
    /** Older rows: the span comes from the 15-second round, not from two stored checks. */
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "How these times are measured",
    /** `estimated` is true when at least one row carries the ≈ sign. */
    measured: (estimated: boolean) =>
      `A row that reads “sold out in 45–60 s” means our check 45 seconds after the first sighting still found the configuration listed, and the check 60 seconds after found it gone. The width of each range is the gap between checks: 5 seconds at stores with alerts, 15 seconds everywhere else${estimated ? "; rows marked ≈ come from before we stored the last check and are bounded by the 15-second round instead" : ""}. A listing shorter than one gap can appear and vanish between two checks, so the true share gone within 30 seconds is higher than the table shows.`,
  },

  /** ConfigTable: every configuration at one store. */
  configTable: {
    title: "All configurations at this store",
    titleAt: (store: string) => `All configurations at ${store}`,
    /** `hasRows` is true when older answers still fill the table under it. */
    lookupOff: (hasRows: boolean) => `Apple has in-store pickup lookups switched off for this store at the moment${hasRows ? " (its most recent answers are listed below)" : ""}`,
    tracked: (n: number) => `${n} configurations on the wire`,
    firstSweep: "First sweep in progress · statuses fill in within a minute",
    inStock: (n: number, total: number) => `${n} of ${total} listed`,
    /** Fallback labels for when apple.com sends no pickup quote of its own. */
    available: "Available",
    unavailable: "Unavailable",
    noLookup: "no pickup lookup",
    notChecked: "not checked yet",
    /** `ago` ticks ("7s ago"). */
    since: (ago: ReactNode) => <>listed since {ago}</>,
    lastAvailable: (ago: ReactNode) => <>last listed {ago}</>,
    neverHere: "never listed here so far",
    buy: "Order",
    alertAria: (model: string, config: string, store: string) => `Get an alert when ${store} lists the ${model} ${config}`,
    alert: "Get alerts →",
  },

  /** ModelStoreMatrix: one row per store, one cell per model. */
  matrix: {
    store: "Store",
    checked: "Checked",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n} of ${total} configurations listed`,
  },

  /** NearbyStores chips; `short` is the model's short name, e.g. Duo. */
  nearby: {
    duo: (short: string, n: number) => `${short} · ${n}`,
    noDuo: (short: string) => `no ${short}`,
  },

  /** StockByModel: a card for each iPhone model on a store page. */
  stockByModel: {
    availableNow: (n: number, total: number) => `${n} of ${total} configurations listed now`,
    noneNow: (total: number) => `0 of ${total} configurations at the moment`,
    lookupOff: "Apple has pickup lookups switched off for this store at the moment",
    notChecked: "not checked yet",
    more: (n: number) => `+${n}`,
    /** `ago` ticks ("7s ago"). */
    checked: (ago: ReactNode) => <>read {ago}</>,
    alert: "Get alerts →",
  },

  /** StoreBlock: a store in full on a thin region or city page. */
  storeBlock: {
    /** `ago` ticks; then the check intervals (15 s, 5 s with an alert). */
    checked: (ago: ReactNode) => <>Read {ago} · {CHECK_NOTE}</>,
    map: "See it on the map",
    alert: "Watch this store",
    alsoIn: (region: string) => `More of ${region}`,
    acrossLine: "Closest stores over the state line",
    elsewhere: "Closest stores further out",
  },

  /** StoreInfo / HoursTable: address, hours and today's status (times are 24-hour "10:00"). */
  hours: {
    title: "Opening hours",
    /** `zone` is the zone's city name, e.g. New York. */
    local: (zone: string) => `${zone} local time`,
    /** Follows the open/closed line; begins with a separator dot. */
    today: (hours: string, week: string) => ` · today ${hours} · ${week}`,
    directions: "Directions",
    applePage: "this store on apple.com",
    liveMap: "Live map",
    storePage: "Store page",
    closed: "Closed",
    everyDay: (hours: string) => `Every day ${hours}`,
    openNow: (closes: string) => `Open now · closes ${closes}`,
    opensAt: (opens: string) => `Opens at ${opens}`,
    /** `next` comes from nextOpen below; null when no day of the week opens. */
    closedToday: (next: string | null) => (next ? `Closed today · opens ${next}` : "No opening today"),
    closedNow: (next: string | null) => (next ? `Closed now · opens ${next}` : "Closed now"),
    /** `day` is a short weekday name such as Mon, or null for tomorrow. */
    nextOpen: (day: string | null, time: string) => `${day ?? "tomorrow"} at ${time}`,
  },

  /** LiveStats: three numbers on the home page. */
  liveStats: {
    inStock: "Listed now",
    storesWith: "Stores w/ stock",
    lastCheck: "Latest check",
    none: "—",
  },

  /** StockBoard: stores with a model in stock now. */
  board: {
    summary: (n: number, stores: number, short: string) => `${n} of ${stores} stores list the ${short} right now`,
    lastCheck: (ago: ReactNode) => <>Latest check {ago}</>,
    firstSweep: "First sweep in progress.",
    /** `storage` and `color` stay null unless the board is filtered. */
    noneListed: (model: string, storage: string | null, color: string | null) => `At this moment no store lists the ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""}.`,
    more: (n: number) => `+${n}`,
    seen: (ago: ReactNode) => <>Listed {ago}</>,
    loading: "Loading stock",
  },
};
