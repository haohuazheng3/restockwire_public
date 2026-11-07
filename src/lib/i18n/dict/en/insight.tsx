/**
 * RestockWire's own page families (2026-11-07): Apple pickup status, weekly restock reports, fastest-selling Apple
 * Stores, store vs store, and three phone guides. English is the source and the type (InsightDict); every other
 * language mirrors this file in dict/<lang>/insight.tsx with the same keys and argument lists.
 *
 * Pages pass every number already formatted for the page's language (counts, seconds, dates, store names), so a
 * dictionary only writes sentences around them. Voice: docs/voice.md — answer first, short sentences, numbers first,
 * no hype. Cadence wording follows tests/cadence-copy.test.ts ("15 seconds" / "5 seconds" only).
 */

/** The country as the page names it: `name` ("Japan", "the US"), `in` ("in Japan", "in the US"). */
export interface Where { name: string; in: string; us: boolean; stores: string }

/* ------------------------------------------------------------------------------------------ status */
export interface StatusView {
  w: Where;
  verdict: "ok" | "slow" | "down" | "unknown";
  /** Formatted counts. */
  answered: string;
  stores: string;
  never: string;
  /** "4 s" — the median age of the newest check per store. */
  age: string | null;
  oldest: string | null;
  /** Failed share of the last 60 minutes, "0.4%". */
  failLastHour: string;
  failDay: string;
  roughHours: number;
  roughList: string;
  /** "Nov 7, 3:12 PM EST". */
  updated: string;
}

/* ------------------------------------------------------------------------------------------ reports */
export interface ReportView {
  w: Where;
  /** "Nov 2–8, 2026". */
  range: string;
  complete: boolean;
  trackedDays: number;
  restocks: string;
  stores: string;
  configs: string;
  duo: string;
  pro: string;
  proMax: string;
  topStore: string | null;
  topStoreN: string | null;
  topConfig: string | null;
  topConfigN: string | null;
  lastConfig: string | null;
  busiestDay: string | null;
  busiestDayN: string | null;
  quietDay: string | null;
  medianSell: string | null;
  within60: string | null;
  sellN: string;
  prevRestocks: string | null;
  /** Signed change against the week before, "+18%" / "−7%"; null without a week before. */
  change: string | null;
  changeDir: "up" | "down" | "flat" | null;
  prevMedianSell: string | null;
}

/* ------------------------------------------------------------------------------------------ ranking */
export interface RankView {
  w: Where;
  days: string;
  ranked: string;
  minPairs: string;
  fastest: string | null;
  fastestSec: string | null;
  fastestN: string | null;
  slowest: string | null;
  slowestSec: string | null;
  spread: string | null;
  countryMedian: string | null;
}

/* ------------------------------------------------------------------------------------------ compare */
export interface CompareSide {
  name: string;
  restocks: string;
  duo: string;
  peak: string | null;
  medianSell: string | null;
  sellN: string;
  last: string | null;
}
export interface CompareView {
  w: Where;
  city: string;
  a: CompareSide;
  b: CompareSide;
  distance: string;
  days: string;
  /** Which store had more restocks: "a" | "b" | "tie". */
  more: "a" | "b" | "tie";
  /** Which store's restocks lasted longer (a better chance to buy): "a" | "b" | null when unknown. */
  slower: "a" | "b" | null;
  ratio: string | null;
}

export const insight = {
  nav: {
    status: "Apple pickup status",
    reports: "Weekly restock reports",
    fastest: "Fastest-selling Apple Stores",
    compare: "Store vs store",
    guides: "Phone alert guides",
    otherCountries: "The same page for another country",
    updated: (when: string) => `Updated ${when}`,
    sources: "Sources and method",
    cite: "Quoting these numbers? Link to this page as the source.",
    alertCta: "Get a restock alert",
    logCta: "Open the restock log",
  },

  status: {
    title: (w: Where) => (w.us ? "Is Apple Store Pickup Down? Live Status, US" : `Apple Store Pickup Status ${w.in}, Live`),
    h1: (w: Where) => (w.us ? "Is Apple's in-store pickup check working right now?" : `Is Apple's in-store pickup check working ${w.in} right now?`),
    meta: (v: StatusView) =>
      `Live: Apple answered pickup lookups for ${v.answered} of ${v.stores} Apple Stores ${v.w.in} in the last minute. Failure rate, rough hours of the last day and what to do when checks stall.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Yes. Apple answered pickup lookups for ${v.answered} of ${v.stores} Apple Stores ${v.w.in} in the last minute, and ${v.failLastHour} of requests failed in the past hour.`
        : v.verdict === "slow"
          ? `Partly. Apple answered for ${v.answered} of ${v.stores} Apple Stores ${v.w.in} in the last minute; ${v.failLastHour} of requests failed in the past hour, so some stock may show late.`
          : v.verdict === "down"
            ? `Not right now. Apple answered for only ${v.answered} of ${v.stores} Apple Stores ${v.w.in} in the last minute. Stock shown on apple.com and here may be stale until it recovers.`
            : `RestockWire cannot read the status ${v.w.in} at this moment. Reload in a minute.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Working", slow: "Slow", down: "Not answering", unknown: "Unknown" })[v],
    tiles: {
      answered: "stores answered in the last minute",
      age: "median age of a store's newest check",
      failHour: "failed requests, last 60 minutes",
      failDay: "failed requests, last 24 hours",
    },
    nowH2: "What does RestockWire see right now?",
    nowLead: (v: StatusView) =>
      `${v.answered} of ${v.stores} stores answered within the last minute${v.age ? `; a typical store was read ${v.age} ago` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Every Apple Store ${v.w.in} is read on a 15-second round; stores with alerts on them every 5 seconds.`,
      v.oldest ? `The store waiting longest was last answered ${v.oldest} ago.` : "No store has been answered yet in this window.",
      Number(v.never) > 0 ? `${v.never} store(s) never answered: Apple offers no pickup lookup there right now.` : "Every store has answered at least once.",
    ],
    dayH2: "How did the last 24 hours go?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Smoothly: no hour of the last 24 had 5% or more failed requests (${v.failDay} overall).`
        : `${v.roughHours} rough hour(s) in the last 24, each with 5% or more failed requests: ${v.roughList}. Overall ${v.failDay} failed.`,
    hourCaption: (zone: string) => `Requests and failures per hour, last 24 hours (${zone})`,
    hourHead: ["Hour", "Requests", "Failed", "Share failed"],
    whyH2: "Why does apple.com show every store as unavailable?",
    whyLead: "Usually because the configuration is sold out. Sometimes because Apple's lookup itself is struggling.",
    whyPoints: [
      "**Sold out:** the lookup answers normally and simply lists no store. This page stays green.",
      "**Lookup trouble:** answers fail or come back empty for every store at once. This page turns amber or red within a minute.",
      "**Your session:** a stale apple.com tab can keep an old answer. Reload the bag page before you trust it.",
    ],
    doH2: "What should you do when pickup checks stall?",
    doLead: "Keep your alert on and wait. A stalled lookup recovers on its own, and restocks that land meanwhile still get confirmed.",
    doSteps: [
      "Leave the alert running: RestockWire keeps asking and alerts as soon as a confirmed restock comes through.",
      "Do not refresh apple.com every few seconds: it does not speed Apple's lookup up.",
      "Check this page again in five minutes. Rough patches seen so far lasted minutes to about two hours.",
      "When it turns green, open your store's page: the restock log shows anything that landed during the gap.",
    ],
    methodH2: "How is the status measured?",
    methodPoints: [
      "**Freshness:** the newest successful check of each store, from RestockWire's own pickup lookups.",
      "**Failures:** failed requests per hour in the round that covers this country, as logged by our pollers.",
      "**Verdict:** Working = 90% of stores answered in the last minute and under 5% failures; Not answering = under half.",
    ],
    otherH2: "Pickup status in other countries",
    faq: (v: StatusView) => [
      { q: "Is apple.com in-store pickup down?", a: v.verdict === "ok" ? `Not ${v.w.in} right now: ${v.answered} of ${v.stores} stores answered in the last minute.` : `It is struggling ${v.w.in} right now: ${v.answered} of ${v.stores} stores answered in the last minute.` },
      { q: "Does a red status mean the iPhone is sold out?", a: "No. Red means Apple's lookup is failing; sold out is a normal answer and keeps the status green." },
      { q: "How often is this page updated?", a: "Each visit reads fresh numbers; the counts are at most 30 seconds old." },
      { q: "Will I miss a restock while the lookup is down?", a: "You might see it late. RestockWire confirms every restock as soon as answers return and alerts you then." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Weekly iPhone Restock Reports, US Apple Stores" : `Weekly iPhone Restock Reports ${w.in}`),
    indexH1: (w: Where) => (w.us ? "Weekly iPhone restock reports" : `Weekly iPhone restock reports ${w.in}`),
    indexMeta: (w: Where) => `Every week of iPhone Duo, 18 Pro and 18 Pro Max restocks at Apple Stores ${w.in}: counts, busiest stores, configurations and sell-out speed, week by week.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `The first report ${w.in} appears once a week has ${"20"} confirmed restocks.` : `${n} week(s) on file ${w.in}. Each edition is RestockWire's confirmed restock log for one Monday-to-Sunday week, local time.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} restocks${complete ? "" : " · so far"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone Restock Report, ${range}` : `iPhone Restock Report ${w.in}, ${range}`),
    h1: (w: Where, range: string) => `iPhone restocks ${w.in}, week of ${range}`,
    meta: (v: ReportView) => `${v.restocks} confirmed iPhone restocks at ${v.stores} Apple Stores ${v.w.in}, ${v.range}. Busiest store, busiest day, hardest configuration and how fast restocks sold out.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "So far this week: "}${v.restocks} confirmed restocks at ${v.stores} Apple Stores ${v.w.in}${v.change ? `, ${v.change} on the week before` : ""}.${v.topStore ? ` ${v.topStore} led with ${v.topStoreN}.` : ""}${v.medianSell ? ` A typical iPhone Duo restock lasted ${v.medianSell}.` : ""}`,
    partial: (days: number) => `Tracking covers ${days} day(s) of this week.`,
    running: "This week is still running; the numbers update with every confirmed restock.",
    tiles: {
      restocks: "confirmed restocks",
      stores: "stores with a restock",
      sell: "median iPhone Duo listing",
      change: "against the week before",
    },
    countH2: "How many restocks did the week bring?",
    countLead: (v: ReportView) => `${v.restocks} in all: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, across ${v.configs} configurations.`,
    storesH2: "Which Apple Stores restocked most?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, with ${v.topStoreN} restocks. The top ten are below.` : "No store restocked this week."),
    storesHead: ["#", "Apple Store", "Restocks"],
    configsH2: "Which iPhone Duo configurations came back?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `${v.topConfig} came back most (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` ${v.lastConfig} came back least.` : ""}` : "No iPhone Duo configuration restocked this week.",
    configsHead: ["Configuration", "Restocks"],
    sellH2: "How fast did restocks sell out?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `A typical iPhone Duo restock lasted ${v.medianSell}; ${v.within60} were gone within a minute (${v.sellN} timed restocks).` : "Too few timed sell-outs this week to say.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `The week before: ${v.prevMedianSell}.` : ""),
    daysH2: "Which days were busiest?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}, with ${v.busiestDayN} restocks${v.quietDay ? `; ${v.quietDay} was quietest` : ""}.` : "No restocks to spread over the days yet."),
    daysHead: ["Day", "Restocks"],
    weekdays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    prevH2: "How does it compare with the week before?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "There is no week before on file to compare with." : v.change == null ? `The week before logged ${v.prevRestocks}. The change is shown once both weeks are complete and fully tracked.` : v.changeDir === "up" ? `Busier: ${v.restocks} restocks against ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Quieter: ${v.restocks} restocks against ${v.prevRestocks} (${v.change}).` : `About the same: ${v.restocks} against ${v.prevRestocks}.`,
    prevNote: "A partial week compares a part week with a full one; read the change once the week closes.",
    readH2: "What does this week mean for buying one?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Restocks clustered on ${v.busiestDay}: keep alerts on through that day.` : "Keep alerts on every day: restocks have no fixed schedule.",
      v.medianSell ? `With a typical listing of ${v.medianSell}, a reservation has to start within seconds of the alert.` : "Listings are short: act within seconds of an alert.",
      v.topStore ? `${v.topStore} restocked most; if it is near you, put it on your alert.` : "Watch the stores you can reach; a second nearby store doubles your chances.",
    ],
    methodH2: "How is the report counted?",
    methodPoints: [
      "**Restock:** a configuration going from unavailable to available at one store, confirmed by a second check. First sightings are not counted.",
      "**Week:** Monday 00:00 to Sunday 24:00 in the country's main time zone.",
      "**Listing time:** from a confirmed restock to the next confirmed sell-out of the same store and configuration.",
    ],
    archiveH2: "Other weeks",
    faq: (v: ReportView) => [
      { q: `How many iPhones did Apple restock ${v.w.in} this week?`, a: `RestockWire confirmed ${v.restocks} restock events at ${v.stores} stores; each event is one configuration coming back at one store, not a unit count.` },
      { q: "Does Apple publish restock numbers?", a: "No. These counts are RestockWire's own confirmed observations of Apple's pickup availability." },
      { q: "When is a new report published?", a: "Every Monday a new week starts; its page fills in as restocks are confirmed and closes on Sunday night." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Fastest-Selling Apple Stores for the iPhone Duo" : `Fastest-Selling Apple Stores ${w.in}`),
    h1: (w: Where) => `Which Apple Stores ${w.in} sell out the iPhone Duo fastest?`,
    meta: (v: RankView) => `${v.fastest ?? "The fastest store"} ${v.w.in}: iPhone Duo restocks gone in ${v.fastestSec ?? "seconds"} at the median. Every ranked store, last ${v.days} days, and where you still have a chance.`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest} is fastest: a typical iPhone Duo restock there sold out in ${v.fastestSec} (${v.fastestN} timed restocks, last ${v.days} days).${v.slowest ? ` At ${v.slowest} it lasted ${v.slowestSec}.` : ""}`
        : `Too few timed sell-outs ${v.w.in} in the last ${v.days} days to rank stores yet.`,
    tiles: { fastest: "fastest store, median listing", slowest: "slowest ranked store", ranked: "stores ranked", country: "median for the whole country" },
    fastH2: "The fastest stores",
    fastLead: (v: RankView) => `${v.ranked} stores have ${v.minPairs} or more timed restocks in the last ${v.days} days. Fastest median first.`,
    head: ["#", "Apple Store", "Median listing", "Quickest", "Timed restocks", "Restocks"],
    slowH2: "Where do you still have a chance?",
    slowLead: (v: RankView) => (v.slowest ? `At the bottom of the table: ${v.slowest} kept a typical restock for ${v.slowestSec}. Longer listings leave more time to check out.` : "Not enough data yet."),
    meansH2: "What does a fast store mean for you?",
    meansPoints: (v: RankView) => [
      `A median of ${v.fastestSec ?? "a few seconds"} leaves no time to browse: have the configuration in your bag and Apple Pay ready.`,
      "Add a slower store nearby to your alert: two stores double your chances.",
      "Speed reflects demand around the store, not how much stock arrives.",
    ],
    methodH2: "How is the ranking built?",
    methodPoints: (v: RankView) => [
      `**Listing time:** from a confirmed restock to the next confirmed sell-out of the same configuration at the same store, iPhone Duo only, last ${v.days} days.`,
      `**Ranked stores:** ${v.minPairs} or more timed restocks; fewer would let one lucky restock decide.`,
      "**Bounds:** times are upper bounds to the next check (5 to 15 seconds apart).",
    ],
    faq: (v: RankView) => [
      { q: `Which Apple Store ${v.w.in} is hardest to buy an iPhone Duo at?`, a: v.fastest ? `${v.fastest}: its restocks sold out fastest, ${v.fastestSec} at the median.` : "Not enough data yet to say." },
      { q: "Does a fast sell-out mean fewer phones?", a: "Not necessarily. It mostly means more people are waiting for that store." },
      { q: "How often is the ranking updated?", a: "Every few minutes, over the last 14 days." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store vs Apple Store: iPhone Restocks Compared" : `Apple Stores ${w.in} Compared: iPhone Restocks`),
    indexH1: (w: Where) => `Two Apple Stores in one city: which restocks more ${w.in}?`,
    indexMeta: (w: Where) => `Neighbouring Apple Stores ${w.in} side by side: iPhone restocks in the last 14 days, the usual hour, how long a restock lasts and which one to watch.`,
    indexLead: (n: string) => `${n} comparisons, each a store and its nearest neighbour in the same city.`,
    title: (a: string, b: string) => `${a} vs ${b}: Which Restocks More?`,
    h1: (a: string, b: string) => `${a} or ${b}: which gets more iPhone restocks?`,
    meta: (v: CompareView) => `${v.a.name} vs ${v.b.name}, ${v.distance} apart in ${v.city}: iPhone restocks in the last ${v.days} days, usual hour, listing time, and which store to watch.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} and ${v.b.name} restocked equally often` : `${(v.more === "a" ? v.a : v.b).name} restocked more`;
      const nums = ` (${v.a.restocks} vs ${v.b.restocks} in the last ${v.days} days)`;
      const slow = v.slower ? ` Restocks lasted longer at ${(v.slower === "a" ? v.a : v.b).name}, which gives you more time to check out.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Side by side, last ${days} days`,
    rows: { restocks: "All restocks", duo: "iPhone Duo restocks", peak: "Usual restock hour (local)", sell: "Median iPhone Duo listing", sellN: "Timed restocks", last: "Latest restock" },
    none: "not enough data",
    moreH2: "Which store gets more iPhone restocks?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Neither: both had ${v.a.restocks}.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, ${v.ratio} as many` : ""}.`),
    hourH2: "At what time does each one restock?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} most often around ${v.a.peak}; ${v.b.name} around ${v.b.peak}.` : "One of the two has too few restocks to name a usual hour yet.",
    sellH2: "Where does a restock last longer?",
    sellLead: (v: CompareView) =>
      v.slower ? `At ${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} against ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "No clear difference yet: too few timed sell-outs, or the two medians are within 15% of each other.",
    pickH2: "Which one should you watch?",
    pickPoints: (v: CompareView) => [
      `Both: they are ${v.distance} apart, and one alert plan covers several stores.`,
      v.more !== "tie" ? `If you can only reach one, ${(v.more === "a" ? v.a : v.b).name} restocked more often.` : "If you can only reach one, pick the closer one: their restock counts are level.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} gives you more seconds per restock.` : "Listing times show no clear winner yet.",
    ],
    methodH2: "Where do these numbers come from?",
    methodPoints: (v: CompareView) => [
      `RestockWire's confirmed restocks at both stores over the last ${v.days} days; a restock counts once a second check confirms it.`,
      "The usual hour is named only from 5 restocks spread over 3 days.",
      "Listing times are upper bounds to the next check, iPhone Duo only.",
    ],
    storePages: "Store pages",
    otherPairs: "More comparisons",
    faq: (v: CompareView) => [
      { q: `Is ${v.a.name} or ${v.b.name} better for an iPhone Duo pickup?`, a: v.more === "tie" ? "They restocked equally often in the last 14 days; choose the closer one or watch both." : `${(v.more === "a" ? v.a : v.b).name} restocked more often in the last 14 days.` },
      { q: "Can I watch both stores?", a: "Yes, with two alerts: an alert is one store and one configuration, so two stores use two of your plan's alerts." },
      { q: "Do the two stores restock at the same time?", a: "Not usually. Each store gets its own deliveries; compare their usual hours above." },
    ],
  },

  /**
   * Three phone guides. Facts verified 2026-11-07 against Apple Support, WebKit and Google sources (listed per guide);
   * anything Apple does not document is written as "if you see it" or left out. `live` is RestockWire's measured
   * median iPhone Duo listing ("74 s"), or null.
   */
  guides: {
    watch: {
      title: "iPhone Restock Alerts on Apple Watch: Setup Guide",
      h1: "How do you get iPhone restock alerts on your Apple Watch?",
      meta: "Get RestockWire's restock alerts on your wrist: Home Screen app, notifications on, mirroring in the Watch app, and the settings that send an alert to your iPhone instead.",
      answer: (live: string | null) =>
        `Install RestockWire on your iPhone's Home Screen, turn its notifications on, and leave mirroring on in the Watch app: alerts then reach your Apple Watch whenever the iPhone is locked.${live ? ` With restocks lasting ${live} at the median, a tap on the wrist saves the seconds it takes to find your phone.` : ""}`,
      sections: [
        {
          h2: "What do you need first?",
          lead: "An iPhone on iOS 16.4 or later with RestockWire added to the Home Screen and notifications allowed.",
          points: [
            "Open restockwire.com in Safari, tap Share, then Add to Home Screen.",
            "Open RestockWire from the Home Screen, sign in, and tap Turn on notifications.",
            "Allow the prompt. Web-app notifications then behave like any app's, on the Lock Screen and in Notification Center.",
          ],
        },
        {
          h2: "How do alerts reach the watch?",
          lead: "By mirroring: Apple sends each notification to one device, the watch when your iPhone is locked or asleep.",
          points: [
            "iPhone unlocked and in use: the alert shows on the iPhone, not the watch.",
            "iPhone locked or asleep and the watch unlocked on your wrist: the alert goes to the watch.",
            "Watch locked or in Do Not Disturb: the alert goes to the iPhone instead.",
          ],
        },
        {
          h2: "Which Watch settings should you check?",
          lead: "Two: mirroring for RestockWire, and whether alerts show with your wrist down.",
          points: [
            "On iPhone, open the Watch app, tap Notifications, and look under Mirror iPhone Alerts From. If RestockWire is listed, keep it on.",
            "Notifications show when you raise your wrist. To see them without raising it, turn on Show Notifications on Wrist Down.",
            "Low Power Mode turns off the always-on display, so you may need to raise your wrist to read an alert.",
          ],
        },
        {
          h2: "What should you do when the alert taps your wrist?",
          lead: "Act on your iPhone within seconds: the reservation itself happens on apple.com.",
          points: [
            "Read the store and configuration on the watch, then unlock your iPhone.",
            "Tap the alert on the iPhone to open the store's page and the Apple link.",
            "Keep Apple Pay set up on apple.com so checkout takes a couple of taps.",
          ],
        },
      ],
      faq: [
        { q: "Do RestockWire alerts work on Apple Watch?", a: "Yes. Notifications from a Home Screen web app appear on a paired Apple Watch like any app's." },
        { q: "Why did the alert show on my iPhone and not my watch?", a: "Your iPhone was unlocked, or the watch was locked or in Do Not Disturb; Apple then delivers to the iPhone." },
        { q: "Do I need a separate watch app?", a: "No. The watch shows the alerts your iPhone receives; there is nothing to install on the watch." },
      ],
      sources: [
        { label: "WebKit: Web Push for Web Apps on iOS and iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple Support: Notifications on your Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch User Guide: Manage notifications", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Don't Miss iPhone Restock Alerts in Focus Mode",
      h1: "How do you keep restock alerts coming through Focus and Scheduled Summary?",
      meta: "Let RestockWire's restock alerts through a Focus, keep them out of Scheduled Summary and set them to sound and show on the Lock Screen. Step by step, iOS 16.4 and later.",
      answer: (live: string | null) =>
        `Add RestockWire to each Focus's allowed apps and set its notifications to Deliver Immediately: then a restock alert sounds even while a Focus is on.${live ? ` A restock lasts ${live} at the median, so an alert held back for a summary is an alert too late.` : ""}`,
      sections: [
        {
          h2: "How do you allow RestockWire in a Focus?",
          lead: "In Settings, open Focus, pick the Focus, tap Apps, and add RestockWire under Allow Notifications From.",
          points: [
            "Apple lets a Focus allow or silence specific web apps you added to the Home Screen.",
            "Repeat for every Focus you use: Sleep, Work, Personal and any you created.",
            "Focus settings for a web app with the same name sync to your other Apple devices.",
          ],
        },
        {
          h2: "How do you keep alerts out of Scheduled Summary?",
          lead: "Leave RestockWire unticked in the summary list, or set its delivery to Immediate.",
          points: [
            "Settings > Notifications > Scheduled Summary: the A to Z list decides which apps are held for the summary.",
            "Or Settings > Notifications > RestockWire > Notification Delivery > Immediate Delivery.",
            "A restock held for an 8 AM summary is long sold out by then.",
          ],
        },
        {
          h2: "Which notification settings matter most?",
          lead: "Allow Notifications on, Lock Screen and Banners on, Sounds on.",
          points: [
            "Banner style Persistent keeps the alert on screen until you act on it.",
            "Show Previews When Unlocked hides the store and configuration on a locked screen; choose Always if you want to read them at a glance.",
            "Apple documents no Time Sensitive level for web-app notifications, so do not count on it to break through a Focus: the allow list does that.",
          ],
        },
        {
          h2: "How do you test it?",
          lead: "Send yourself a test notification from your RestockWire account with a Focus switched on.",
          points: [
            "Open RestockWire from the Home Screen, go to your account and tap Send a test notification.",
            "Switch on the Focus you use most and send another.",
            "If it arrives silently or not at all, recheck the Focus allow list and the delivery setting.",
          ],
        },
      ],
      faq: [
        { q: "Will a Focus block RestockWire alerts?", a: "Yes, unless RestockWire is on that Focus's allowed list. Add it once per Focus." },
        { q: "Can RestockWire send Time Sensitive notifications?", a: "Apple documents no such level for web-app push, so RestockWire relies on the Focus allow list instead." },
        { q: "Why do my alerts arrive in a bundle in the morning?", a: "Scheduled Summary is holding them. Set RestockWire to Immediate Delivery." },
      ],
      sources: [
        { label: "iPhone User Guide: Allow or silence notifications for a Focus", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone User Guide: Change notification settings", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: Web Push for Web Apps on iOS and iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "iPhone Restock Alerts on Android and Wear OS",
      h1: "Can you get iPhone restock alerts on an Android phone or Wear OS watch?",
      meta: "Watching for an iPhone from an Android phone? RestockWire alerts work in Chrome without installing anything, and they reach a paired Wear OS or Galaxy watch.",
      answer: (live: string | null) =>
        `Yes. Open RestockWire in Chrome on Android, sign in and allow notifications when Chrome asks; alerts then arrive like any app's and can be bridged to a paired watch.${live ? ` Listings last ${live} at the median, so keep notifications loud.` : ""}`,
      sections: [
        {
          h2: "How do you turn alerts on in Chrome?",
          lead: "Sign in at restockwire.com in Chrome and tap Allow when the site asks to send notifications.",
          points: [
            "Nothing to install: Chrome asks for permission when a site wants to notify you.",
            "If you tapped Block earlier, open the site settings from the address bar and allow notifications.",
            "Adding RestockWire to the Home Screen is optional on Android; it gives the site its own icon.",
          ],
        },
        {
          h2: "Will alerts reach a Wear OS or Galaxy watch?",
          lead: "Usually yes: phone notifications bridge to a paired Wear OS watch by default.",
          points: [
            "Chrome posts RestockWire's alerts, so the watch shows them under Chrome.",
            "On a Galaxy Watch, open Galaxy Wearable > Watch settings > Notifications > App notifications and keep Chrome on.",
            "If alerts stop, check that battery saving is not restricting Chrome in the background.",
          ],
        },
        {
          h2: "What about a laptop?",
          lead: "Chrome, Edge and Firefox on a computer can show the same alerts while the browser runs.",
          points: [
            "Sign in and allow notifications in the browser you keep open most.",
            "Each device with notifications on receives every alert.",
            "If no device has notifications on, RestockWire emails the alert instead.",
          ],
        },
      ],
      faq: [
        { q: "Do I need an iPhone to use RestockWire?", a: "No. Any phone or computer with a browser that supports web notifications can receive the alerts." },
        { q: "Why does my watch show the alert under Chrome?", a: "On Android, Chrome delivers website notifications, so the watch lists them under Chrome." },
        { q: "Can I get alerts on two phones?", a: "Yes. Sign in and allow notifications on each; every device receives every alert." },
      ],
      sources: [
        { label: "Google Chrome Help: Use notifications", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: Notifications on Wear OS", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: Manage notifications on a Galaxy Watch", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "More phone alert guides",
  },
};

export type InsightDict = typeof insight;
