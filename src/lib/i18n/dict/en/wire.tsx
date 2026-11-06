/**
 * English strings: wire — the four restock-log modules of src/components/restocks/{RestockHeatmap,RestockStreak,
 * SellOutRanking,RestockLeaderboard}.tsx (data: src/lib/content/wire.ts).
 *
 * For translators:
 * - `label` is a place phrase with its preposition ("in Ohio", "at Apple Somerset", "here", "in the US").
 * - `what` is a phone or configuration name and is never translated ("iPhone Duo", "iPhone Duo 512GB Night Sky").
 * - Counts arrive raw; durations ("45 s", "2 days"), hours ("7–9 AM"), weekdays ("Tuesday") and percentages ("34%")
 *   arrive formatted for the language. `store` nodes are links: keep them where they are.
 * - Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 * - The thresholds are facts, not copy: a pattern from 5 restocks over 3 days, a weekday only over 14 days, a store
 *   ranked from 3 timed sell-outs.
 */
import type { ReactNode } from "react";

const s = (n: number) => (n === 1 ? "" : "s");

export const wire = {
  /** RestockHeatmap: a 7 × 24 grid of confirmed restocks by local weekday and hour. */
  heatmap: {
    title: (what: string, label: string) => `When does the ${what} restock ${label}? Weekday × hour`,
    unknown: "The weekday-by-hour grid could not be read just now; the live stock and the restock log on this page are unaffected.",
    none: (label: string, days: number) => `No confirmed restock ${label} in the last ${days} days yet — the grid fills in from the first one.`,
    /** Under 5 restocks or under 3 days with one. */
    thin: (n: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${n} restock${s(n)} ${label} on ${activeDays} day${s(activeDays)} in the last ${days} — not enough data yet to call a pattern (RestockWire waits for ${min} restocks over ${minDays} days).`,
    /** `weekday` "Tuesday", `window` "7–9 AM", `share` "34%". */
    pattern: (label: string, weekday: string, window: string, share: string, n: number, days: number) => (
      <>Most restocks {label} land on <b className="text-ink">{weekday}s</b>, between <b className="text-ink">{window}</b> local time ({share} of {n} in the last {days} days).</>
    ),
    /** Under 14 days of span: the hour, but no weekday claim. */
    patternHours: (label: string, window: string, share: string, n: number, spanDays: number) => (
      <>Most restocks {label} land between <b className="text-ink">{window}</b> local time ({share} of {n}); {spanDays} day{s(spanDays)} of data is too few to name a weekday yet.</>
    ),
    caption: (what: string, label: string, days: number) => `Confirmed ${what} restocks ${label} by local weekday and hour, last ${days} days`,
    /** Every cell's title and screen-reader text: `hours` "7–8 AM". */
    cell: (weekday: string, hours: string, n: number) => `${weekday} ${hours}: ${n} restock${s(n)}`,
    /** The busiest cell. */
    busiest: (weekday: string, hours: string, n: number) => `busiest · ${weekday} ${hours} · ${n} restock${s(n)}`,
    legendFewer: "fewer",
    legendMore: "more",
    /** Multi-zone sets (a state across two zones, a country): every store counted in its own zone. */
    localTime: "each store's own local time",
    measuredTitle: "How this is measured",
    measured: (min: number, minDays: number, span: number) =>
      `Each cell counts RestockWire's confirmed restocks (two checks agreeing; a store's first sighting never counted) that landed in that local hour of that weekday over the window, in the store's own time zone. A pattern is stated from ${min} restocks over ${minDays} different days, a weekday only once the data spans ${span} days — ten restocks in one burst are one event, not a habit.`,
  },

  /** RestockStreak: days since the last restock, the longest drought, this week against last, the typical gap. */
  streak: {
    title: (what: string, label: string) => `${what} restock streaks and droughts ${label}`,
    unknown: "The streak numbers could not be read just now; the live stock and the restock log on this page are unaffected.",
    none: (label: string, days: number) => `No confirmed restock ${label} in the last ${days} days — the current quiet spell is the whole window.`,
    /** `since` "2 days ago" / "today"; `longest` "5.2 days" or null under two drops; `trend` the arrow line below or null when both weeks are 0. */
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Last confirmed restock {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; the longest quiet spell in {o.days} days was <b className="text-ink">{o.longest}</b></>}{o.trend && <>; <b className="text-ink">{o.thisWeek}</b> restock{s(o.thisWeek)} this week against {o.lastWeek} last week ({o.trend})</>}.</>
    ),
    today: "today",
    daysAgo: (n: number) => `${n} day${s(n)} ago`,
    hoursAgo: (n: number) => `${n} hour${s(n)} ago`,
    tileSince: "since the last confirmed restock",
    tileSinceNone: (days: number) => `no restock in ${days} days`,
    tileLongest: (days: number) => `longest quiet spell between restocks · ${days} d`,
    /** `prev` last week's count. */
    tileWeek: (prev: number) => `restocks in the last 7 days · ${prev} the week before`,
    tileMedian: "typical gap between restock drops",
    up: "↑ up on last week",
    down: "↓ down on last week",
    flat: "→ same as last week",
    none2: "–",
    measuredTitle: "How this is measured",
    measured: "A restock drop is every confirmed restock within the same half hour at the stores counted here, so eight configurations landing together are one drop, not eight; gaps are measured between drops. “This week” is the last 7 days, “last week” the 7 before them. Confirmed means two of RestockWire's checks agreed (every store every 15 seconds, stores with alerts every 5); a store's first sighting is never counted.",
  },

  /** SellOutRanking: the place's stores ranked by how fast their restocks sold out. */
  ranking: {
    title: (what: string, label: string) => `Which stores sell out the ${what} fastest ${label}?`,
    unknown: "The sell-out ranking could not be read just now; the live stock and the restock log on this page are unaffected.",
    /** Fewer than two stores qualify. `k` stores qualified, `min` pairs needed. */
    thin: (label: string, k: number, min: number, days: number) =>
      `Not enough timed sell-outs ${label} yet: ${k} store${s(k)} with ${min} or more restocks that sold out in the last ${days} days, and a ranking needs two.`,
    /** `fastest`/`slowest` are store links; `fastSec`/`slowSec` formatted durations. */
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>Fastest {o.label}: <b className="text-ink">{o.fastest}</b>, half its restocks gone within <b className="text-ink">{o.fastSec}</b>; slowest: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (last {o.days} days).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `${what} restocks ${label} by how fast they sold out, last ${days} days; stores with ${min} or more timed sell-outs`,
    thRank: "#",
    thStore: "Store",
    thMedian: "Half gone within",
    thFastest: "Fastest",
    thPairs: "Sold-out restocks",
    /** The share of stores that made the table: "8 of 12 stores ranked". */
    footnote: (ranked: number, total: number) => `${ranked} of ${total} store${s(total)} ranked`,
    measuredTitle: "How this is measured",
    measured: (min: number) =>
      `“Half gone within” is the median time from RestockWire's check that first saw a restock to the check that first saw it gone — an upper bound: stores with alerts are checked every 5 seconds, every other store every 15. Only stores with ${min} or more restocks that sold out in the window are ranked; a listing shorter than one check can be missed, so very fast stores look a little slower than they are.`,
  },

  /** RestockLeaderboard: the stores with the most confirmed restocks in the last 7 days and their share. */
  leaderboard: {
    title: (what: string, label: string, days: number) => `Which stores restocked the ${what} most ${label}? Last ${days} days`,
    unknown: "The leaderboard could not be read just now; the live stock and the restock log on this page are unaffected.",
    none: (what: string, label: string, days: number) => `No confirmed ${what} restock ${label} in the last ${days} days.`,
    /** `store` a link, `share` "10%". */
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> led {o.label} with <b className="text-ink">{o.n}</b> of {o.total} confirmed restock{s(o.total)} (<b className="text-ink">{o.share}</b>) in the last {o.days} days.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Stores ${label} by confirmed ${what} restocks, last ${days} days`,
    thRank: "#",
    thStore: "Store",
    thRestocks: "Restocks",
    thShare: "Share",
    /** Below the table: "10 of 41 stores with a restock · 212 restocks in all". */
    footnote: (shown: number, stores: number, total: number) => `${shown} of ${stores} store${s(stores)} with a restock · ${total} restock${s(total)} in all`,
    /** The same count by state (US) or region. `noun` "state" / "province" / "area". */
    regionsTitle: (noun: string) => `By ${noun}`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `Confirmed ${what} restocks ${label} by ${noun}, last ${days} days`,
    thRegion: (noun: string) => noun.charAt(0).toUpperCase() + noun.slice(1),
    thStores: "Stores",
    measuredTitle: "How this is measured",
    measured: (what: string) =>
      `Confirmed ${what} restocks in the last 7 days from RestockWire's own checks of apple.com in-store pickup (every store every 15 seconds, stores with alerts every 5; two checks must agree; a store's first sighting is never counted). The share is of every confirmed restock in the same place and window.`,
  },
};
