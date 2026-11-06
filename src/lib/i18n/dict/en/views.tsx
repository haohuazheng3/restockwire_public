/**
 * English strings: views — the product × place pages, the restock log, the live map, the iPhone Duo restock-times
 * answer page and the store index, shared by the US, the English country trees and the native versions. English
 * here is exactly what those pages have always printed (same text, markup and classes). Server only.
 *
 * For translators
 * - `c: Country` carries English data only (c.inName = in the UK, c.short = UK, c.regionNoun = county). Use
 *   places.countryLabel(c.cc, lang) for the country and your language's own word for its regions.
 * - String arguments named name, place, region, city, store and config are translated before they reach you.
 *   `Store` / `Place` objects are English data: name them with places.appleStoreLabel / cityLabel / regionLabel.
 * - Numbers arrive raw: format them for your language (format.ts: num, pct, plural, stamp, hour…).
 * - Strings with **bold** / [label](href) are rendered by Inline / Md; hrefs stay in their English form (/jp/…),
 *   the site moves them to the reader's language. JSX entries keep their markup (classes, links) as they are.
 * - Never translate model names (iPhone Duo, iPhone 18 Pro, 18 Pro Max), storage sizes, "Apple Store",
 *   "RestockWire", URLs or part numbers. Check intervals are only ever 15 and 5 seconds; no refund wording.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { appleName, storeLocality, storePath, type Store } from "@/lib/apple/catalog";
import { theName, type Country } from "@/lib/apple/countries";
import { faq as placeFaq, fitTitle, fmtDuration, listWords, plural, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import { priceLabel, productDescription, productFaq, productTitle } from "@/lib/seo/productCopy";
import type { PlaceLevel } from "@/lib/seo/products";
import { regionWord } from "@/lib/seo/countryLinks";
import { hourShare, rangeLabel, type DayRow, type RestockTimes, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAYS, WEEKDAY_MIN_SPAN, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------- restock-times helpers */

/** The restock-times page's numbers (lib/content/restockTimes.ts) and its busiest two-hour window. */
export interface RestockTimesMeta {
  c: Country;
  t: RestockTimes;
  /** The busiest two local hours [from, to) and their share (0–1) of all restocks. */
  w: { from: number; to: number; share: number };
  /** A usual hour may be stated (enough restocks over enough days). */
  pattern: boolean;
}
/** Everything the restock-times page's sentences use. */
export interface RestockTimesView extends RestockTimesMeta {
  us: boolean;
  /** The country has one Apple Store. */
  one: boolean;
  /** Days from the first tracked one to today. */
  tracked: number;
  /** The country's Apple Stores. */
  stores: number;
  /** Stores listing an iPhone Duo right now. */
  duoNow: number;
  /** Restocks on a Saturday or Sunday. */
  weekend: number;
  sell: SelloutFacts | null;
  /** The last 24 hours. */
  recent: { restocks: number; stores: number };
  /** iPhone Duo configurations, and stores × configurations. */
  configs: number;
  pairs: number;
  /** How many times the most-restocked storage beat the next one (1 decimal), when there are two. */
  storageRatio: number | null;
  /** Other trackers whose launch-week reports are shown. */
  reportNames: string[];
  /** Links: the alert setup, the restock log, the country's store index. */
  alert: string;
  logHref: string;
  storesHref: string;
}

const rtN = (x: number) => x.toLocaleString("en-US");
/** Whole-percent shares; a share under half a percent reads "<1%", never a misleading "0%". */
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** A YYYY-MM-DD day as a short label, weekday first by default (Thu, Oct 29). */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
/** The same day spelled out in full, with the year. */
const longDate = (ymd: string) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
/** "Oct 27, 9:30 AM EDT": an instant in the country's reference zone (for waves across a country's zones). */
const zoneStamp = (iso: string, c: Country) => new Intl.DateTimeFormat("en-US", { timeZone: c.timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(iso));
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "state" : (x.c.regionNoun ?? "area"));
const rtRegions = (x: { us: boolean; c: Country }) => (x.us ? "states" : (x.c.regionNounPlural ?? "areas"));
const rtYet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : " yet");

/* ---------------------------------------------------------------- views */

export const views = {
  /** Pieces several of these pages share. */
  common: {
    /** "in the UK": the country after a phrase, also handed to the restock modules as their place label. */
    inCountry: (c: Country) => c.inName,
    liveMap: "Live map",
    restockLog: "Restock log",
    alertMe: "Get alerts",
    /** Heading over the daily chart. */
    lastDays: (days: number) => <>{days} days, day by day</>,
    /** The date other countries' tracking began (the sources line: "Live data since …"). */
    since: "November 2, 2026",
    /** Source list: where the live data comes from. */
    sourcesWhere: (n: number, c: Country) => `${n === 1 ? "the Apple Store" : `all ${n} Apple Stores`} ${c.inName}`,
    /** Anchor text pointing at a country's home page. */
    checker: (c: Country) => `${c.short} iPhone stock checker`,
    appleStoresIn: (c: Country) => `Apple Stores ${c.inName}`,
    /** Label handed to the modules: "stores with it" (… of 39 stores with it). */
    storesWithIt: "stores listing it",
    more: "See more",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    /** Titles, descriptions and FAQ of the product × place pages (lib/seo/productCopy): same arguments, same shapes. */
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    /** "£999–£1,599": the price range of the page's configurations (format.price for your language). */
    priceLabel,
    /** Preposition plus place, at for a store and in for anything larger; `name` is already translated. */
    inPlace: (name: string, level: PlaceLevel) => (level === "store" ? `at ${name}` : `in ${name}`),
    /** H1 for country-level product pages that have no fixed title. */
    h1Country: (model: string, c: Country) => `${model} in-store pickup stock ${c.inName}`,
    /** H1 for a city, region or store page; `where` comes from inPlace. */
    h1Place: (model: string, where: string) => `${model} ${where}`,
    // The four stat tiles.
    inStockNow: "Listed now",
    yes: "Yes",
    no: "No",
    /** Hint under "Yes/No" when Apple gives no pickup quote. */
    pickup: "pickup",
    configurations: "configurations",
    /** Hint: "of 39 stores". */
    ofStores: (n: number) => `of ${n} store${n === 1 ? "" : "s"}`,
    restocks24h: "Restocks, 24 h",
    restocksHint: (week: number, month: number, days: number) => `${week} in 7 d · ${month} in ${days} d`,
    sellOuts: (days: number) => `Sell-outs ${days} d`,
    /** Tile hint: median listing time in milliseconds. */
    stays: (ms: number) => `stays ~${fmtDuration(ms)}`,
    noPairs: "no sell-outs paired yet",
    lastRestock: "Newest restock",
    noneYet: "none so far",
    thisConfig: "this configuration",
    inDays: (days: number) => `in ${days} days`,
    // The status line under the H1.
    notInStockNow: "Not listed at the moment",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{n}</b> of {of} configurations listed</span>,
    inStockAt: (n: number, of: number) => <span>Listed at <b className="text-ink">{n}</b> of {of} store{of === 1 ? "" : "s"}</span>,
    /** Status line: `live` = the ticking relative time; `tax` = tax phrase that already starts with a separator. */
    checked: (live: ReactNode, price: string, tax: string) => <>Read {live} · {price}{tax}</>,
    /** Apple's prices and tax there: "VAT (20%) included". */
    taxNote: (c: Country) => c.taxNote,
    /** Canada: Apple's prices are before tax. */
    beforeTax: "before tax",
    buyOnApple: "Order on apple.com",
    allStoresIn: (c: Country) => `Every store ${c.inName}`,
    everyIphoneHere: "All iPhones at this place",
    everyIphone: (where: string) => `All iPhones ${where}`,
    /** Summary row of the alert panel; the US national page passes no `where`. */
    panel: (model: string, where: string | null) => `${model}${where ? ` ${where}` : ""}: choose the configurations, then the stores`,
    /** ProductNav's count unit. */
    unitConfigs: "configurations",
    unitStores: "stores",
    otherConfigsHere: "More configurations at this place",
    byStorageColor: "Storage and color",
    nearestStores: "Closest stores",
    /** Nearest listing store with its distance. */
    closest: (link: ReactNode, dist: string) => <>Nearest store listing it: {link} · {dist}</>,
    /** Inside that link on a place page: "Ginza, Tokyo". */
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "Listed most recently",
    storesWithItNow: "Stores listing it now",
    storesIn: (where: string) => `Stores ${where}`,
    colStatus: "status",
    colConfigs: "configs listed",
    noStoreHasIt: "No store lists it at the moment.",
    noStoreHereHasIt: "No store in this area lists it at the moment.",
    moreStores: (n: number) => <>{n} more stores, sorted by state below.</>,
    byRegion: (c: Country) => `By ${c.regionNoun ?? "area"}`,
    byCity: "By city",
    nearbyStores: "Stores close by",
    latestChanges: "Newest changes",
    nothingLogged: "The log is empty so far.",
    whenRestocks: "Usual restock hours",
    howFast: "How long a restock lasts",
    restocksByConfig: "Which configurations restock",
    /** FAQ heading on a country's model page. */
    faqTitleCountry: (model: string, c: Country) => `${model} ${c.inName}: questions`,
    /** FAQ heading everywhere else. */
    faqTitle: (model: string, where: string) => `${model} ${where}`,
    /** Sources list: Apple's own order page for the model. */
    buySource: (model: string, c: Country) => `Apple: ${model} order page (${c.short})`,
    nearby: "Close by",
    otherRegions: (c: Country) => `Other ${c.regionNounPlural ?? "areas"}`,
    elsewhereIn: (region: string) => `Further afield in ${region}`,
    everyAppleStoreIn: (c: Country) => `Apple Stores ${c.inName}, complete list`,
    /** Section label for the country-wide view; `model` is the short name. */
    across: (model: string, c: Country) => `${model} across ${c.cc === "us" ? "the US" : theName(c)}`,
    /** Name of the JSON-LD ItemList of stores. */
    itemList: (model: string, where: string) => `${model} ${where}`,
    /** Near-me answer on a country's model page; `have` lists the stores that carry it, names translated. */
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `At this moment no Apple Store ${c.inName} lists the ${model} for pickup, so "near me" comes down to which nearby store restocks first. An alert on each store you can reach puts the push on your phone seconds after one lists it.`
        : `${plural(inStock, "store")} of ${n} ${inStock === 1 ? "lists" : "list"} the ${model} at this moment: ${listWords(have.slice(0, 5).map((l) => `${l.store} in ${l.city} (${l.configs} config${l.configs === 1 ? "" : "s"})`), 5)}.`,
    /** Its table by region: head and caption. */
    nearHead: (c: Country) => [cap(c.regionNoun!), "Stores listing it now"],
    nearCaption: (c: Country, model: string) => `${model} pickup stock per ${c.regionNoun}, latest check`,
    /** Closing paragraph of that section, with a markdown link to the alert setup. */
    nearMe: (c: Country, model: string, alert: string) => `Tap Near me in the alert setup on this page and every store is ranked from where you stand, by estimated road distance in ${c.unit === "mi" ? "miles" : "kilometres"}, each with a directions link. [Set up a ${model} alert](${alert}).`,
    /** Price and reservation FAQs on a country's model page; `low` and `high` are whole amounts. */
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => new Intl.NumberFormat(c.priceLocale ?? c.locale, { style: "currency", currency: c.currency, maximumFractionDigits: 0 }).format(v);
      return {
        price: { q: `What does the ${model} cost ${c.inName}?`, a: `${money(low)} to ${money(high)} on apple.com (${c.taxNote}), set by storage.` },
        reserve: { q: `Is there a way to reserve the ${model} for pickup ${c.inName}?`, a: `Not in advance: when a store lists your configuration you order it on apple.com with in-store pickup, and Apple holds it for your time slot.${inStock === 0 ? " No store lists it at the moment, so an alert is how you get there first." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    /** n = the country's Apple Stores. */
    metaTitle: (c: Country, n: number) => `Live iPhone restock log ${c.inName}: ${n === 1 ? "the Apple Store" : `${n} Apple Stores`}`,
    /** 140–160 characters. */
    metaDescription: (c: Country, n: number) => `Each confirmed in-store pickup restock of the iPhone Duo, 18 Pro and Pro Max at ${n === 1 ? "the Apple Store" : "Apple Stores"} ${c.inName}: time, exact configuration, map.`,
    h1: (c: Country) => `iPhone restocks ${c.inName}, as they happen`,
    /** Counter line over the log; `model` and `region` are the filters in use, if any. */
    summary: (day: number, week: number, model?: string, region?: string) => <>{day} restock{day === 1 ? "" : "s"} in the last 24 hours · {week} in 7 days{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. Times are shown in your own time zone.</>,
    allModels: "All models",
    restocks: "Restocks",
    withSoldOut: "Restocks and sell-outs",
    /** The region filter's label ("County") and first option ("All counties"). */
    regionLabel: (c: Country) => cap(c.regionNoun ?? "area"),
    allRegions: (c: Country) => `All ${c.regionNounPlural ?? "areas"}`,
    filter: "Apply",
    page: (k: number) => <>page {k}</>,
    newer: "← Newer",
    older: "Older →",
    getAlerts: "Set up alerts",
    byPlace: "Restocks, place by place",
    byRegion: (c: Country) => `By ${c.regionNoun ?? "area"}`,
    /** The log as a Dataset (JSON-LD). */
    datasetName: (c: Country) => `iPhone in-store pickup restocks at Apple Stores ${c.inName}`,
    datasetDescription: (c: Country) => `Confirmed in-store pickup restocks and sell-outs of the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max at ${c.cc === "us" ? "all 269 US Apple Stores" : `the Apple Stores ${c.inName}`}: store, exact configuration, time. Stores are read every 15 seconds (every 5 seconds where an alert is set), and a restock enters the log only after apple.com gives the same answer twice.`,
    datasetMeasured: ["Apple Store", "iPhone model with storage and colour", "time of restock", "time of sell-out"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    /** n = the country's Apple Stores. */
    metaTitle: (c: Country, n: number) => `Live iPhone Duo stock map: ${n === 1 ? "the Apple Store" : "every Apple Store"} ${c.inName}`,
    /** 140–160 characters. */
    metaDescription: (c: Country, n: number) => `Where the iPhone Duo, 18 Pro and Pro Max are listed for in-store pickup right now: ${n === 1 ? "the Apple Store" : `all ${n} Apple Stores`} ${c.inName} on one live map, by storage and color.`,
    /** What the map (a browser component) is told about the country: its name, "in …" form and region words. */
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "All stores",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    /** `regions` and `cities` count the places that have a store; `duo` and `max` count stores listing each model now. */
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `, sorted by ${c.regionNoun} and city` : cities > 1 ? ", sorted by city" : "";
      return `${duo} list the iPhone Duo and ${max} the Pro Max right now: live pickup stock at all ${n} Apple Stores ${c.inName}${by}, 18 Pro included.`;
    },
    /** Store-count answer; `spread` comes from place.spreadPhrase and `top` holds the biggest regions, names translated. */
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${n}, ${spread}${top.length ? `; ${top[0].name} leads with ${top[0].count}${top[1] ? `, ahead of ${top[1].name} (${top[1].count})` : ""}` : ""}.`,
    howMany: (c: Country) => <>Apple Stores {c.inName}: how many are there?</>,
    /** Live Duo FAQ; `have` = the stores listing it at the latest check. */
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `Which Apple Stores ${c.inName} list the iPhone Duo right now?`,
      a: have.length === 0 ? `None of the ${n} at the latest check; this page and the map change the moment one lists it, and an alert reaches you before either.` : `${have.length} of the ${n} at the latest check: ${have.slice(0, 6).map((x) => `Apple ${x.name}`).join(", ")}${have.length > 6 ? " and more" : ""}.`,
    }),
    /** The shared place FAQ minus count, stock and lasts, which this page covers in its own sections. */
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }),
    /** The Duo keyword section's paragraph (markdown link to the alert setup). */
    duoBlock: (alert: string) => `An alert on the stores you can reach is the quickest route to one: [set up an iPhone Duo alert](${alert}). One alert covers one store × one exact configuration, and your phone hears seconds after that store lists it.`,
    /** Opening paragraph rendered by Inline (**bold** allowed); `spread` and `tax` come from the place dictionary. */
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `At this moment **${now.duo}** list an iPhone Duo for pickup, **${now.max}** the iPhone 18 Pro Max and **${now.pro}** the 18 Pro, out of **${n} Apple Store${n === 1 ? "" : "s"}** ${c.inName}, ${spread}. ${tax}`,
    crumb: "Apple Stores",
    /** Alert panel summary row. */
    panel: (c: Country) => `Choose your phones, then tick the stores ${c.inName} within reach`,
    matrixLabel: "Stock per store",
    matrixH2: (c: Country) => <>Store-by-store stock {c.inName}</>,
    matrixHint: "Listed now / tracked, for each model.",
    /** The table of regions with the most stores. */
    topCaption: (c: Country) => <>{regionWord(c.cc, true, true)} ranked by Apple Store count (from Apple&apos;s retail store list, as tracked here)</>,
    regionHead: (c: Country) => regionWord(c.cc, false, true),
    colStores: "Apple Stores",
    colCities: "Cities",
    locationsBy: (c: Country) => `Where the Apple Stores are, ${regionWord(c.cc)} by ${regionWord(c.cc)}`,
    locationsIn: (c: Country) => `Every Apple Store location ${c.inName}`,
    /** A region card's count, and the whole country's when it has no regions. */
    storeCount: (n: number) => <>{n} store{n > 1 ? "s" : ""}</>,
    storeCountAll: (n: number) => <>{n} stores</>,
    whenRestock: (c: Country) => <>What time do stores {c.inName} restock?</>,
    howFast: (c: Country) => <>How long does a restock last {c.inName}?</>,
    faqTitle: (c: Country) => `Apple Stores ${c.inName}: questions`,
    getApp: "Get the app",
    howItWorks: "How it works",
    pricing: "Pricing",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    /** Number, date and name formats of this page (tables included). */
    fmt: {
      n: rtN,
      /** A share 0–1 as a whole percent ("<1%" under half a percent). */
      pct: rtPct,
      /** A calendar day (YYYY-MM-DD): "Thu, Oct 29", or "Oct 29" without the weekday. */
      date: dateLabel,
      longDate,
      /** An instant in the country's reference zone, with the zone: "Oct 27, 9:30 AM EDT". */
      zoneStamp,
      /** An instant in the store's own zone: "Nov 2, 2:31 PM". */
      local: localStamp,
      /** A local hour, and a window [from, to): "9 AM", "9–11 AM", "noon–2 PM". */
      hour: hourLabel,
      range: rangeLabel,
      /** 0 = Sunday. */
      weekday: (d: number) => WEEKDAYS[d],
      /** A store, and a store with where it is (tables). */
      store: (s: Store) => appleName(s),
      storeWithPlace: (s: Store) => `${appleName(s)} (${storeLocality(s)})`,
    },
    /** Base of the title and H1 outside the US, whose title is fixed elsewhere. */
    title: (c: Country) => `What Time Does Apple Restock the iPhone Duo ${c.inName}?`,
    /** Longest variant that fits 158 characters wins. */
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "state" : (c.regionNoun ?? "store");
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitle([
          `Apple Stores ${c.inName}: ${rtPct(w.share)} of ${rtN(t.n)} iPhone Duo restocks since ${since} came ${rangeLabel(w.from, w.to)} local time${t.sellout ? `; ${rtPct(t.sellout.within2min)} sold out inside 2 minutes` : ""}. Hour, day, ${region}, store and config tables.`,
          `Apple Stores ${c.inName}: ${rtPct(w.share)} of ${rtN(t.n)} iPhone Duo restocks since ${since} came ${rangeLabel(w.from, w.to)} local time. Hour, day, ${region} and config tables.`,
          `When the iPhone Duo restocks ${c.inName}: ${rtN(t.n)} restocks since ${since}, split by hour, day, ${region} and configuration.`,
        ], 158)
        : t.n > 0
          ? fitTitle([
            `${rtN(t.n)} iPhone Duo restocks confirmed at Apple Stores ${c.inName} since ${since}, each store read every ${SPEED.checkSec} seconds. Split by local hour, date, ${region}, store and configuration, with time to sell-out.`,
            `When the iPhone Duo restocks ${c.inName}: ${rtN(t.n)} confirmed restocks since ${since}, split by hour, day, ${region} and configuration.`,
          ], 158)
          : `iPhone Duo restock tables for Apple Stores ${c.inName} by hour, day, store and configuration, from reads of each store every ${SPEED.checkSec} seconds since ${longDate(t.since)}.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `What time does Apple restock the iPhone Duo ${x.c.inName}?`
      : x.t.n > 0
        ? `What time does Apple restock the iPhone Duo ${x.c.inName}? ${x.pattern ? `${rangeLabel(x.w.from, x.w.to)} local time, most often` : "Our own checks, hour by hour"}`
        : `Has Apple restocked the iPhone Duo ${x.c.inName} yet? Not so far; here is what we are watching`,
    /** The answer paragraph under the H1. */
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = x.c.inName;
      return t.unknown ? (
        <>The restock log is unavailable for a moment. The stores {where} are still on the {SPEED.checkSec}-second wire, and the numbers return on the next page load.</>
      ) : t.n > 0 && pattern ? (
        // The sentence an answer engine lifts whole: share, sample size, since-date, window, local time (docs/research.md §8).
        <>
          <b className="text-ink">{rtPct(w.share)} of the {rtN(t.n)} iPhone Duo restocks</b> RestockWire confirmed at {one ? "the Apple Store" : "Apple Stores"} {where} since {longDate(t.since)} arrived <b className="text-ink">between {rangeLabel(w.from, w.to)}</b>, store local time{x.sell ? <>; a typical one was gone in about {Math.round(x.sell.medianSec / 5) * 5} seconds</> : null}. <b className="text-ink">Restocks are still coming</b>{tracked > 1 ? <>: {t.days} of the {tracked} tracked days had one</> : <> (one tracked day so far)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">Yes.</b> <b className="text-ink">{rtN(t.n)} iPhone Duo restocks since {longDate(t.since)}</b> at {one ? "the Apple Store" : "Apple Stores"} {where}{tracked > 1 ? <>, on {t.days} of the {tracked} days</> : <> (one tracked day so far)</>}; we name a usual hour once there are {PATTERN_MIN} restocks across {PATTERN_MIN_DAYS} separate days.
        </>
      ) : (
        <>
          <b className="text-ink">Not so far.</b> RestockWire has read {one ? "the Apple Store" : `all ${x.stores} Apple Stores`} {where} every {SPEED.checkSec} seconds since {longDate(t.since)} without confirming a single iPhone Duo pickup restock.
        </>
      );
    },
    /** The four hero tiles' labels. */
    hero: {
      restocks: (x: RestockTimesView) => `restocks confirmed since ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `fell ${rangeLabel(x.w.from, x.w.to)}, store local time`,
      days: "days that had a restock",
      now: (one: boolean): string => (one ? "store listing one for pickup at this moment" : "stores listing one for pickup at this moment"),
      today: (x: RestockTimesView, today: DayRow) => `so far today (${dateLabel(today.date)})${x.one ? "" : `, across ${plural(today.stores, "store")}`}`,
      weekday: "the busiest weekday to date",
    },
    /** Lines under the hero tiles; `latest`: today's latest restock (`config` in your language). */
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>Newest: <b className="text-ink">{latest.config}</b>{x.one ? null : <> at <Link href={storePath(latest.store)} className="underline underline-offset-2">{appleName(latest.store)}</Link></>}, {localStamp(latest.at, latest.store)} local time</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{WEEKDAYS[x.t.peakWeekday]}s</b> bring the most</> }] : []),
      { text: <>There is <b className="text-ink">no official restock schedule</b>; these figures are our own confirmed checks, refreshed roughly every five minutes</>, no: true },
    ],
    /** The same with no restock yet. */
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{x.duoNow} of {x.stores}</b> {x.one ? "lists" : "list"} one for pickup at this moment</> },
      { text: <>The first confirmed restock starts every table below</>, step: true },
      { text: <>For hour and weekday patterns from the largest sample, see <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">the US page</Link></>, step: true },
    ],
    setUpAlert: "Get iPhone Duo alerts",
    logLive: "Live restock log",
    onThisPage: "Sections",
    /** The section chips (short) and H2s (questions), by section id. */
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "Hour",
      "day-by-day": "Days",
      where: `Per ${rtRegion(x)}`,
      configuration: "Configurations",
      "how-long": "Sell-out speed",
      unavailable: "“Unavailable”",
      reddit: "Reddit claims",
      method: "Method",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `At what hour does the iPhone Duo come back ${x.c.inName}?`,
      "day-by-day": `On which days did the iPhone Duo restock ${x.c.inName}?`,
      where: `Where ${x.c.inName} does the iPhone Duo restock most often?`,
      configuration: `Which iPhone Duo storage and color restock most ${x.c.inName}?`,
      "how-long": `How many seconds does an iPhone Duo restock last ${x.c.inName}?`,
      unavailable: "Why does apple.com show “currently unavailable” at every store?",
      reddit: "Reddit's iPhone Duo restock theories, checked against the log",
      method: "What counts as a restock on RestockWire?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = x.c.inName;
      const window = rangeLabel(w.from, w.to);
      return [
        { q: `Which hours bring iPhone Duo restocks ${where}?`, a: t.n > 0 && pattern
          ? `${window} store local time carried ${rtPct(w.share)} of the ${rtN(t.n)} confirmed restocks since ${longDate(t.since)}, and 8 AM to noon carried ${rtPct(hourShare(t.byHour, 8, 12))}. There is no official schedule; this is the pattern RestockWire observes, refreshed roughly every five minutes.`
          : `RestockWire has ${plural(t.n, "confirmed restock")} on record ${where} since ${longDate(t.since)}${t.days ? `, across ${plural(t.days, "day")}` : ""}, and Apple announces no schedule. Once there are ${PATTERN_MIN} restocks across ${PATTERN_MIN_DAYS} separate days, this page names a usual hour on its own.` },
        { q: `Do iPhone Duo restocks happen on weekends${us ? "" : ` ${where}`}?`, a: t.n > 0
          ? `${weekend > 0 ? "They do" : "None so far"}: ${plural(weekend, "restock")} of ${rtN(t.n)} (${rtPct(weekend / t.n)}) fell on a Saturday or Sunday. ${t.peakWeekday != null ? `The busiest weekday to date is ${WEEKDAYS[t.peakWeekday]}.` : `We name a busiest weekday only once the data covers ${WEEKDAY_MIN_SPAN} days; it covers ${tracked} so far.`}`
          : `There is no weekend data ${where} so far; the day table on this page grows with each confirmed restock.` },
        { q: "When should I start watching apple.com?", a: t.n > 0 && pattern
          ? `By hand, have apple.com open with pickup selected from ${hourLabel(w.from)} local time; that two-hour window holds ${rtPct(w.share)} of restocks. Then the clock runs fast: the median restock ${sell ? `was gone within ${sell.medianSec} seconds` : "lasts about a minute"}, which is why an alert on the ${SPEED.fastSec}-second wire ([how alerts work](/iphone-duo-restock-alerts)) beats any amount of refreshing.`
          : `While the pattern ${where} is still forming, an alert can watch for you: your chosen stores go on the ${SPEED.fastSec}-second wire, day and night ([how alerts work](/iphone-duo-restock-alerts)).` },
        { q: "Why is the iPhone Duo “unavailable” at every Apple Store?", a: sell
          ? `Restocks are brief: of the ${rtN(sell.n)} sold-out restocks measured ${where}, ${rtPct(sell.within2min)} were gone inside 2 minutes and ${rtPct(sell.within20min)} inside 20. At this moment ${x.duoNow} of ${x.stores} stores list one, so most of the time apple.com truthfully says “unavailable”, even on days with dozens of restocks ([what “unavailable” means](/apple-store-pickup-explained)).`
          : `Pickup stock shows up for minutes at a time; at this moment ${x.duoNow} of ${plural(x.stores, "store")} ${where} list one ([what “unavailable” means](/apple-store-pickup-explained)).` },
        { q: "Can I get a notification when my Apple Store gets the iPhone Duo back?", a: `Yes: an alert on that store with your exact storage and colour moves it to the ${SPEED.fastSec}-second wire; once a restock is confirmed, your phone has it within about ${SPEED.alertSec} seconds ([set up an alert](${x.alert}); [how it works](/how-restock-alerts-work)).` },
      ];
    },
    /** Source list labels (`tracker`: another tracker's name). */
    sources: {
      applePickup: "Apple: Delivery and Pickup help (how pickup availability works)",
      newsroom: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide (October 23, 2026)",
      macRumors: "MacRumors: Apple Store pickup system for iPhone Duo went live again in the US and Canada (October 24, 2026)",
      reports: (tracker: string) => `${tracker}: launch-week iPhone Duo restock reports (their own observations, kept separate and never counted)`,
    },
    /** Structured data: WebPage plus Dataset. */
    ld: (x: RestockTimesView) => ({
      datasetName: `iPhone Duo in-store pickup restock times, Apple Stores ${x.c.inName}`,
      description: `Confirmed iPhone Duo in-store pickup restocks at Apple Stores ${x.c.inName} since ${x.t.since} (store, configuration, time), from RestockWire reading each store every ${SPEED.checkSec} seconds; grouped by local hour, day, ${rtRegion(x)}, store and configuration.`,
      spatial: `Apple Stores ${x.c.inName}`,
      measured: ["local restock time at the store", "Apple Store", "iPhone Duo storage size and colour", "time to sell-out in seconds"],
      size: `${x.t.n} restocks at ${x.t.stores} stores`,
    }),
    crumb: "iPhone Duo restock hours",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>{rangeLabel(x.w.from, x.w.to)}, store local time, holds {rtPct(x.w.share)} of the {rtN(x.t.n)} restocks; 8 AM to noon holds {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (count: number) => `${rtN(count)} restocks in the single busiest hour`,
    morning: "from 8 AM to noon",
    evening: "after 5 PM, so evenings still count",
    night: "from midnight to 6 AM",
    tooFew: (x: RestockTimesView) => <b>Not enough days to name an hour{rtYet(x)}: {plural(x.t.n, "confirmed restock")} across {plural(x.t.days, "day")} since {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>Naming a usual hour takes <b className="text-ink">{PATTERN_MIN} restocks across {PATTERN_MIN_DAYS} separate days</b></> },
      { text: <>One burst of ten restocks is a single event, not a habit</>, no: true },
      { text: <>Each new day of data updates this page on its own</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${rtN(x.t.n)} iPhone Duo restocks ${x.c.inName} by store local hour, ${dateLabel(x.t.since, false)} to today`,
    hourHead: ["Local hour", "Restocks", "Share"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>The morning peak has <b className="text-ink">nothing to do with opening time</b>{x.us ? " (most US Apple Stores open at 10 AM)" : ""}</> },
      { text: <>Apple releases pickup stock <b className="text-ink">online</b>, ahead of the doors opening</> },
      { text: <>Watching by hand? Cover <b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b> on weekday mornings</>, step: true },
      { text: <>An <Link href={x.alert}>alert</Link> covers the <b className="text-ink">remaining 22 hours</b>, when nobody else is looking</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>Each store page charts its own hours in its own zone (<Link href={x.storesHref}>{x.us ? "every state's Apple Stores" : `stores ${x.c.inName}`}</Link>), so you can spot the store that restocks at 8 AM when its region peaks at 9</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{rtN(t.n)} confirmed restocks{one ? "" : ` across ${plural(t.stores, "store")}`} on the single tracked day so far, {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `All ${t.days} tracked days` : `${t.days} of the ${tracked} days since ${longDate(t.since)}`} brought at least one confirmed restock{t.peakWeekday != null ? `; ${WEEKDAYS[t.peakWeekday]} leads the weekdays` : ""}.</b>
      ) : (
        <b>Zero confirmed restocks {x.c.inName} since {longDate(t.since)}.</b>
      );
    },
    daysTracked: "tracked days that had a restock",
    busiestDay: (x: RestockTimesView, day: DayRow) => `on the biggest day, ${dateLabel(day.date)}${x.one ? "" : `, across ${plural(day.stores, "store")}`}`,
    busiestDayNone: "biggest day",
    /** `drop` = the half hour in which the most stores restocked at once. */
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `stores restocked inside one half hour at ${zoneStamp(drop.at, x.c)} (${rtN(drop.restocks)} configurations), a nationwide release`,
    weekend: (x: RestockTimesView) => `fell on a weekend (${plural(x.weekend, "restock")})`,
    dayCaption: (x: RestockTimesView) => `Daily iPhone Duo restocks ${x.c.inName}${x.t.reports.length ? `; rows marked “reported” come from other trackers' published observations before our tracking started, included for the timeline only` : ""}`,
    /** Day-table columns; single-store countries drop `stores`. */
    dayHead: { date: "Date", restocks: "Restocks", stores: "Stores", busiest: "Busiest hour", source: "Source" },
    soFar: " · so far",
    reportedBy: (names: string[]) => <>per {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: launch day, first units shipped to online orders</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: in-store pickup came back{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">Reported</b> rows are launch-week observations from {x.reportNames.join(" and ")}, left out of every count</> }
        : { text: <>RestockWire&apos;s log for every store {x.c.inName} begins <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>A busiest weekday needs <b className="text-ink">{WEEKDAY_MIN_SPAN} days</b> of data (we have {x.tracked})</>, no: true }] : []),
      { text: <>Watch the <b className="text-ink">stores</b> column: restocks spread over more stores give you better odds</>, step: true },
    ],

    // ---- where
    /** `hit` = regions with any restock, biggest first, names translated; `total` = every region that has a store. */
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {rtN(hit[0].restocks)} restocks at {hit[0].stores} of its {plural(hit[0].storesTotal, "store")} since {dateLabel(x.t.since, false)}{hit[1] ? <>, followed by {hit[1].name} ({rtN(hit[1].restocks)})</> : null}{hit[2] ? <> and {hit[2].name} ({rtN(hit[2].restocks)})</> : null}; {hit.length} of {total} {rtRegions(x)} have seen a restock{total - hit.length > 0 ? `, ${total - hit.length} still none` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>Not one {rtRegion(x)} {x.c.inName} has a confirmed restock so far; the first one starts the table.</b>,
    regionCaption: (x: RestockTimesView) => `iPhone Duo restocks per ${rtRegion(x)} ${x.c.inName}, confirmed, ${dateLabel(x.t.since, false)} to today`,
    regionHead: (x: RestockTimesView) => [cap(rtRegion(x)), "Restocks", "Stores that restocked", "Latest restock (local time)"],
    /** "3 of 5" (stores restocked of the region's stores). */
    ofN: (a: number, b: number) => <>{a} of {b}</>,
    storesCaption: (x: RestockTimesView) => `Top stores for iPhone Duo restocks ${x.c.inName}, ${dateLabel(x.t.since, false)} to today`,
    storesHead: ["Store", "Restocks", "Days", "Usual hour", "Latest (local time)"],
    swaps: (x: RestockTimesView) => [
      { no: "Chasing the top store on the list, however far away", yes: `Two or three stores you can reach within an hour of ${x.pattern ? hourLabel(x.w.from) : "the morning"}`, why: "A restock out of reach does you no good, and even the busiest store shows unavailable for all but a few minutes a day." },
      { no: "Betting on a single store", yes: "An alert on each, then go to whichever fires", why: "Use the count table only to decide which of your stores to head for first." },
    ],
    nearMe: "Duo stock near me, live",

    // ---- configuration
    /** `top`/`rarest`: the most and least restocked configurations (labels in your language). */
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label} leads with {rtN(top.restocks)} of the {rtN(x.t.n)} restocks ({rtPct(top.restocks / x.t.n)}){rarest ? `; the ${rarest.label} trails with ${plural(rarest.restocks, "restock")}` : ""}.</b>
    ),
    /** Tile labels for the configuration section. */
    mostRestocked: (config: string) => `${config} restocks more than any other configuration`,
    /** Compares two storage sizes or two colours by restock count. */
    versus: (a: string, bCount: number, b: string) => `${a} restocks, versus ${rtN(bCount)} for ${b}`,
    restocksOf: (a: string) => `${a} restocks`,
    byStorage: "per storage size",
    byColour: "per colour",
    configNone: (x: RestockTimesView) => <b>Not one configuration {x.c.inName} has a confirmed restock{rtYet(x)}; all eight are listed so the first restock has its row ready.</b>,
    configCaption: (x: RestockTimesView) => `iPhone Duo restocks per configuration ${x.c.inName}, confirmed, ${dateLabel(x.t.since, false)} to today`,
    configHead: ["Configuration", "Restocks", "Share", "Latest restock (local time)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>Picking the configuration matters <b className="text-ink">more than picking the store</b></> },
      x.storageRatio != null
        ? { text: <>Settle for the most-restocked storage and your odds run about <b className="text-ink">{x.storageRatio}×</b> those of the next size</> }
        : { text: <>Settle for the most-restocked storage and your odds rise <b className="text-ink">sharply</b></> },
      { text: <>The <b className="text-ink">2TB</b> is one to order for delivery and wait on</>, no: true },
      { text: <>Prices and live stock: <Link href="/iphone-duo-most-restocked-stores">Which iPhone Duo restocks most?</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{sell.medianSec} seconds: the median life of the {rtN(sell.n)} sold-out restocks {x.c.inName}; {rtPct(sell.within2min)} were gone inside 2 minutes and {rtPct(sell.within20min)} inside 20.</b>,
    /** Unit after a number of seconds in the tiles. */
    secUnit: "s",
    medianListing: "median listing, from listed to gone",
    within2: "gone inside 2 minutes",
    within20: "gone inside 20 minutes",
    fastest: "quickest sell-out on record",
    howLongNone: (x: RestockTimesView) => <b>Not enough sold-out restocks {x.c.inName} to measure{rtYet(x)}; these figures start at ten, and the US page has the full set.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>Two minutes is a window for an <b className="text-ink">alert</b>, not for hitting refresh on apple.com</> },
      { text: <>Every other number on this page follows from this one</> },
      { text: <>Each restock and how many seconds it lasted, per configuration and {rtRegion(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">How fast does an iPhone Duo restock sell out?</Link></>, step: true },
    ],
    measured: "Each figure runs from the check that first found the configuration listed to the check that found it gone, which makes it a ceiling: real lifetimes are shorter.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>A restock is a blip, not a state: {x.one ? "one store" : `${rtN(x.stores)} stores`} × {x.configs} configurations makes {rtN(x.pairs)} possible listings {x.c.inName}, and right now {x.duoNow} {x.duoNow === 1 ? "store lists" : "stores list"} any iPhone Duo at all.</b>,
    pairs: "possible store × configuration listings",
    listingNow: "with an iPhone Duo listed for pickup right now",
    goneIn2: "of restocks over within two minutes",
    last24: "confirmed restocks, past 24 hours",
    /** `today`: today's restocks so far (when the last 24 hours have none). */
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>Past 24 hours: <b className="text-ink">{plural(x.recent.restocks, "confirmed restock")}</b> at {plural(x.recent.stores, "store")} {x.c.inName}</> }
        : today > 0
          ? { text: <>Today: <b className="text-ink">{plural(today, "confirmed restock")}</b> {x.c.inName}</> }
          : { text: <>The day table above lists the restocks that did take place</> },
      { text: <>Each was on apple.com for <b className="text-ink">a minute or two</b></> },
      { text: <>Seeing “unavailable everywhere” on day four or day fourteen does <b className="text-ink">not</b> mean Apple has stopped</>, no: true },
    ],
    unavailableLinks: { explained: "“Currently unavailable for pickup”, explained", howToGet: "Getting an iPhone Duo, step by step" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>Much of the advice in <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> and <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> is honest, based on one store, and out of date by the next day; below are the four claims that come up most, tested against {rtN(x.t.n)} confirmed restocks {x.c.inName}.</b>,
    redditCaption: "Frequent Reddit claims about iPhone Duo restocks, tested against RestockWire's confirmed restocks",
    redditHead: ["Claim", "What the log shows"],
    /** The four claims and what the numbers say. */
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "“Stores restock overnight — check at 3 AM.”", answer: t.n > 0 ? <>{rtPct(hourShare(t.byHour, 0, 6))} of restocks came between midnight and 6 AM local time, against {rtPct(w.share)} between {rangeLabel(w.from, w.to)}.</> : "Nothing on record yet to test it with." },
        { claim: "“Apple only restocks on one weekday.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>{WEEKDAYS[t.peakWeekday]} leads so far ({rtN(t.byWeekday[t.peakWeekday])} of {rtN(t.n)}), yet restocks came on {t.days} of {tracked} days.</> : <>Restocks came on {t.days} of {tracked} tracked days{t.days === tracked ? ", not one day without" : ""}; we name a busiest weekday after {WEEKDAY_MIN_SPAN} days of data.</>) : "Nothing on record yet to test it with." },
        { claim: "“Call the store and ask when the truck comes.”", answer: "There is no published restock schedule; pickup stock is released online, and the store sees it at the same moment everyone else does." },
        { claim: "“If it says unavailable, it's sold out for good.”", answer: recent.restocks > 0 ? <>{plural(recent.restocks, "confirmed restock")} at {plural(recent.stores, "store")} in the last 24 hours prove otherwise, and each went back to “unavailable” within minutes.</> : t.n > 0 ? <>{rtN(t.n)} confirmed restocks since {dateLabel(t.since, false)} prove otherwise, and each went back to “unavailable” within minutes.</> : "Nothing on record yet to test it with." },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>Rumours fill the gap when there is <b className="text-ink">no data</b>; this page is the data, and reading it is free</> },
      { text: <>Reddit gets one thing right: the <b className="text-ink">checkout prep</b>, signed in with Apple Pay set (<Link href="/iphone-duo-restock-checkout-guide">our 20-second version</Link>)</> },
    ],

    // ---- method
    methodLead: <b>A restock is a configuration appearing for in-store pickup on apple.com at a store that did not list it, confirmed by two matching checks.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>Stores with an alert: every <b className="text-ink">{SPEED.fastSec} seconds</b>; {x.one ? "the Apple Store" : "every Apple Store"} {x.c.inName}: every <b className="text-ink">{SPEED.checkSec} seconds</b></> },
      { text: <>Published intervals of other trackers: <b className="text-ink">{OTHER_TRACKERS}</b>; we compare only what they publish</> },
      { text: <>A first “available” is re-checked <b className="text-ink">about a second later</b> before it counts</> },
      { text: <>A vanished listing is confirmed on the <b className="text-ink">following round</b></> },
      { text: <>A store&apos;s first sighting, a failed request, a timeout: <b className="text-ink">never</b> a restock and never “out of stock”</>, no: true },
      { text: <>All hours and dates are in each store&apos;s <b className="text-ink">local time</b>; a “wave” is the same half hour across zones</> },
      { text: <>Reports from other trackers{x.t.reports.length ? ` (${x.reportNames.join(", ")})` : ""} get labelled rows of their own and are <b className="text-ink">left out of every total</b></> },
      { text: <>These tables refresh roughly every five minutes; <Link href={x.logHref}>the restock log</Link> is live</>, step: true },
    ],
    quote: "Cite this page: quote any number here with a link back. RestockWire is independent of Apple and reads the same pickup availability anyone can see on apple.com, only much more often.",
    /** The closing button: "Set up an iPhone Duo alert in the UK". */
    alertIn: (x: RestockTimesView) => <>Get iPhone Duo alerts{x.one ? "" : ` ${x.c.inName}`}</>,

    // ---- related, FAQ, sources
    related: "Related iPhone Duo answers",
    sameData: "Built on the same log",
    questions: {
      sellOut: "How long does a restock last?",
      alerts: "Quickest way to hear about a restock",
      howToGet: "Getting one in practice",
      whichConfig: "The configuration that restocks most",
      nearMe: "Live stock near me",
      unavailable: "“Unavailable”, explained",
    },
    otherCountries: (us: boolean): string => (us ? "Same page, other countries" : "More countries"),
    faqTitle: "Common questions",
  },
};
