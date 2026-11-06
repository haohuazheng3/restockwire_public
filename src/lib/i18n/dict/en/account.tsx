/**
 * English strings: account (dashboard page, restock modules on it, install / checkout / pricing pages). Numbers reach
 * these functions raw and print as the site always has; another language may format them (format.num …). Strings
 * with **bold** / [label](href) render through <Md>.
 */
import { OTHER_TRACKERS, SPEED, SPEED_PERKS } from "@/lib/plans";

const s = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const account = {
  loading: "Loading",
  meta: { title: "My alerts" },
  signedInAs: (email: string) => `Account: ${email}`,
  title: "My alerts",
  /** Short units under the big numbers. */
  units: { s: "s", min: "min", taps: "taps" },

  plan: {
    title: "Plan",
    none: "No plan on this account, so alerts are paused",
    /** "Plus · 3 of 10 alerts on", then " · renews Dec 1" or " · ends Dec 1" ({date} arrives formatted). */
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on} of ${limit} alerts running`,
    renews: (date: string) => ` · next charge ${date}`,
    ends: (date: string) => ` · stops ${date}`,
  },

  sent: {
    title: "Alerts delivered",
    last: (ago: string) => `Most recent ${ago}`,
    none: "None delivered yet",
    empty: "No alert has gone out yet.",
    channel: { push: "notification", email: "email" } as Record<string, string>,
    status: { sent: "sent", failed: "failed", skipped: "skipped" } as Record<string, string>,
  },

  /** "Reserve it in 20 seconds" (FastCheckoutCard). */
  fast: {
    title: "A 20-second reservation",
    sub: "everything except the final four taps, done in advance",
    lasts: "how long a typical Duo listing stays up",
    push: "confirmed restock → push on your phone",
    tapsLeft: "taps left once the push arrives",
    steps: [
      { title: "Know your window", hint: "your stores' usual hours are below · be staged 10 min before" },
      { title: "Pre-load Apple's checkout", hint: "exact storage and colour → Delivery & Pickup" },
      { title: "Agree to the terms early · or buy unlocked", hint: "unlocked and paid in full shows no checkbox at all" },
      { title: "Stop the screen locking", hint: "Auto-Lock → Never · nudge it every 10–15 min" },
      { title: "When it fires: read, then move", hint: "Pickup → the named store → first slot → Apple Pay" },
    ],
    guide: "The two-minute walkthrough",
    window: "Your restock window",
  },

  /**
   * "When your stores restock" and "How fast your restocks sell out" (RestockTimes). {zone}: "Eastern" in English
   * (so "… time" follows it); in other languages the full Intl zone name ("日本標準時"), which already says "time".
   * Hours ("9 AM") arrive formatted.
   */
  restock: {
    title: "Restock hours at your stores",
    /** Every model: "iPhone"; otherwise the models' names joined. */
    anyIphone: "iPhone",
    and: " and ",
    yours: (n: number) => (n === 1 ? "the store you watch" : `the ${n} stores you watch`),
    Yours: (n: number) => (n === 1 ? "The store you watch" : `The ${n} stores you watch`),
    otherStores: (n: number) => s(n, "store in the same zone", "stores in the same zone"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} at ${s(stores, "store")} · ${days}-day window · ${zone} time`,
    /** Peak-hour tile labels. */
    busiest: (yours: string, then: string | null) => `${yours}: peak hour${then ? ` (runner-up ${then})` : ""}`,
    busiestArea: (stores: number, zone: string) => `${zone}-time peak, all ${stores} stores`,
    next: (inHours: number) => (inHours === 0 ? "restock window: this hour" : `restock window in ${inHours} h`),
    typical: "how long a typical listing lasts",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `nothing restocked at ${yours} yet · past ${days} days` : `restocks at ${yours} · past ${days} days${pattern ? "" : " · not enough for a pattern"}`),
    byHour: (busiestInGreen: boolean) => `Per hour${busiestInGreen ? " · green marks the peak" : ""}`,
    byWeekday: (busiest: string | null) => `Per weekday${busiest ? ` · ${busiest} leads` : ""}`,
    /** Chart summary for screen readers; {items} joins entries such as "9 AM 2" or "Monday 1". */
    hourChart: (yours: string, zone: string, items: string) => `Hourly restock count for ${yours} (${zone} time): ${items}`,
    /** Same summary, per weekday. */
    weekdayChart: (yours: string, items: string) => `Restock count per weekday for ${yours}: ${items}`,
    /** One entry of that summary. */
    chartItem: (label: string, n: number, reported: number) => `${label} ${n}${reported ? ` (+${reported} from other trackers' logs)` : ""}`,
    /** Bar tooltip, e.g. "10–11 AM: 2 restocks at the store you watch · 5 across Eastern time · 1 from other trackers' logs". */
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${s(n, "restock")} at ${yours}${area ? ` · ${area.n} across ${area.zone} time` : ""}${reported ? ` · ${reported} in other trackers' logs` : ""}`,
    /** Timeline marker for the current minute. */
    now: "now",
    /** Legend entry for the whole time zone. */
    allZone: (stores: number, zone: string) => `All ${stores} stores that keep ${zone} time`,
    /** Starts the other trackers' footnote under the charts. */
    reportMarkBars: "Dashed",
    reportMarkDots: "Hollow dots",
    sellTitle: "How long your stores' restocks last",
    sellMeta: (what: string, stores: number, days: number) => `${what} at ${s(stores, "store")} · ${days}-day window`,
    /** Ends the sell-out sentence ("… gone in about 60–80 seconds at the store you watch"). */
    sellLabel: (yours: string) => `at ${yours}`,
  },

  /** /checkout/success. */
  success: {
    metaTitle: "Your alerts are live",
    isOn: (plan: string) => `${plan} is active`,
    yourPlan: "Your plan",
    received: "Payment confirmed",
    onPlan: (limit: number) => `Your plan carries ${limit} alerts.`,
    planOn: "Your plan is active.",
    pending: "Give it a minute: the subscription shows up in your account shortly.",
    open: "Go to my alerts",
    another: "Set up one more alert",
    saved: (n: number) => `${n} alert${n === 1 ? "" : "s"} saved · Stripe sends the receipt`,
    pushOn: "Notifications",
    pushNext: "One more step: alerts on your phone",
  },

  /** /phone-alerts (the guide itself is client: cdict install). */
  install: {
    metaTitle: "Get the app — restock alerts straight to your lock screen",
    metaDescription: "Put RestockWire on your Home Screen and a notification reaches you the second an iPhone Duo, 18 Pro or Pro Max is listed for pickup at a store near you.",
  },

  /** /pricing. Plan names and dollar amounts are not translated (billing is in USD everywhere). */
  pricing: {
    metaTitle: "Pricing — 10 alerts $5, 20 for $10, 50 for $20",
    metaDescription: `Restock alerts for in-store iPhone pickup at every US Apple Store: ${SPEED.fastSec}-second checks on the stores you choose, a push about ${SPEED.alertSec} seconds after a confirmed restock. Plus $5/month for 10 alerts, Pro $10 for 20, Max $20 for 50. Cancel anytime.`,
    title: "Pricing",
    lead: "**An alert is one store × one exact iPhone.** Everything else on the site is free to read.",
    chips: ["Every one of the 269 US Apple Stores", "Cancel anytime", "Card or Link"],
    fastest: "No iPhone stock tracker publishes a shorter check interval",
    everyFast: `**${SPEED.fastSec} seconds** between checks on your stores · the intervals other trackers publish: ${OTHER_TRACKERS}`,
    /** {band}: a range such as "60–80 seconds", or the "about a minute" fallback. */
    sellsOut: (band: string) => `**${band}**: how long a typical iPhone Duo restock stays listed; some are gone in 20–30 seconds`,
    band: (range: string) => `${range} seconds`,
    aboutMinute: "about a minute",
    sameSpeed: "One speed for every plan",
    rechecked: "between checks on your stores",
    toPhone: "from confirmed restock to your phone",
    listing: "a typical Duo listing, from listed to gone",
    note: { plus: "1 iPhone × 10 stores", pro: "2 iPhones × 10 stores", max: "5 iPhones × 10 stores" } as Record<string, string>,
    month: "/ month",
    alerts: (n: number) => `${n} alerts`,
    perks: [...SPEED_PERKS] as string[],
    cancel: "No contract · cancel when you like",
    get: (plan: string) => `Choose ${plan}`,
    billing: "Billed through Stripe · card or Link · plan changes are prorated",
    /** The refund policy line, as published (no other refund wording anywhere). */
    refund: "Changed your mind? [A full refund is available within 7 days](/refunds) as long as no restock alert has reached you",
  },
};
