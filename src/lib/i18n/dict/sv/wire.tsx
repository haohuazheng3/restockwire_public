/**
 * Swedish strings: wire — the four restock-log modules (RestockHeatmap, RestockStreak, SellOutRanking,
 * RestockLeaderboard). `label` already carries its preposition ("i Solna", "på Apple Täby", "här", "i Sverige");
 * `what` is a product name and is never translated. Durations, hours, weekdays ("tisdag") and percentages arrive
 * formatted for Swedish; the region noun arrives in English ("state", "area") and is mapped here.
 */
import type { Dict } from "../en";
import type { ReactNode } from "react";
import { NOUNS, cap, n, pl } from "./util";

const restocks = (v: number) => pl(v, "påfyllning", "påfyllningar");
const days_ = (v: number) => pl(v, "dag", "dagar");
const stores_ = (v: number) => pl(v, "butik", "butiker");
/** "state" → "delstat", "area" → "område". */
const nounSv = (noun: string) => NOUNS[noun]?.[0] ?? noun;

export const wire: Dict["wire"] = {
  /** RestockHeatmap: a 7 × 24 grid of confirmed restocks by local weekday and hour. */
  heatmap: {
    title: (what: string, label: string) => `När fylls ${what} på ${label}? Veckodag × timme`,
    unknown: "Rutnätet med veckodag och timme gick inte att läsa in just nu. Lagret live och påfyllningsloggen på sidan påverkas inte.",
    none: (label: string, days: number) => `Ingen bekräftad påfyllning ${label} de senaste ${n(days)} dagarna ännu. Rutnätet fylls i från den första.`,
    thin: (k: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${restocks(k)} ${label} på ${days_(activeDays)} av de senaste ${n(days)}. Det räcker inte för att se ett mönster än: RestockWire väntar på ${n(min)} påfyllningar under ${n(minDays)} dagar.`,
    pattern: (label: string, weekday: string, window: string, share: string, k: number, days: number) => (
      <>De flesta påfyllningar {label} kommer på <b className="text-ink">{weekday}ar</b>, <b className="text-ink">{window}</b> lokal tid ({share} av {n(k)} de senaste {n(days)} dagarna).</>
    ),
    patternHours: (label: string, window: string, share: string, k: number, spanDays: number) => (
      <>De flesta påfyllningar {label} kommer <b className="text-ink">{window}</b> lokal tid ({share} av {n(k)}). {cap(days_(spanDays))} med data är för lite för att peka ut en veckodag än.</>
    ),
    caption: (what: string, label: string, days: number) => `Bekräftade påfyllningar av ${what} ${label} per veckodag och lokal timme, senaste ${n(days)} dagarna`,
    cell: (weekday: string, hours: string, k: number) => `${weekday} ${hours}: ${restocks(k)}`,
    busiest: (weekday: string, hours: string, k: number) => `flest · ${weekday} ${hours} · ${restocks(k)}`,
    legendFewer: "färre",
    legendMore: "fler",
    localTime: "varje butiks lokala tid",
    measuredTitle: "Så mäter vi",
    measured: (min: number, minDays: number, span: number) =>
      `Varje ruta räknar RestockWires bekräftade påfyllningar (två kontroller som stämmer överens; en butiks första observation räknas aldrig) som kom under den lokala timmen den veckodagen, i butikens egen tidszon. Ett mönster anges först vid ${n(min)} påfyllningar på ${n(minDays)} olika dagar, en veckodag först när datan spänner över ${n(span)} dagar. Tio påfyllningar i en enda våg är en händelse, inte en vana.`,
  },

  /** RestockStreak: days since the last restock, the longest drought, this week against last, the typical gap. */
  streak: {
    title: (what: string, label: string) => `${what} ${label}: påfyllningar och tysta perioder`,
    unknown: "Siffrorna om påfyllningsrytmen gick inte att läsa in just nu. Lagret live och påfyllningsloggen på sidan påverkas inte.",
    none: (label: string, days: number) => `Ingen bekräftad påfyllning ${label} de senaste ${n(days)} dagarna. Hela perioden är en enda tyst period.`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Senaste bekräftade påfyllning {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; längsta tysta perioden på {n(o.days)} dagar var <b className="text-ink">{o.longest}</b></>}{o.trend && <>; <b className="text-ink">{restocks(o.thisWeek)}</b> den här veckan mot {n(o.lastWeek)} förra veckan ({o.trend})</>}.</>
    ),
    today: "idag",
    daysAgo: (k: number) => (k === 1 ? "för 1 dag sedan" : `för ${n(k)} dagar sedan`),
    hoursAgo: (k: number) => (k === 1 ? "för 1 timme sedan" : `för ${n(k)} timmar sedan`),
    tileSince: "sedan senaste bekräftade påfyllning",
    tileSinceNone: (days: number) => `ingen påfyllning på ${n(days)} dagar`,
    tileLongest: (days: number) => `längsta tysta perioden mellan påfyllningar · ${n(days)} d`,
    tileWeek: (prev: number) => `påfyllningar senaste 7 dagarna · ${n(prev)} veckan innan`,
    tileMedian: "typiskt mellanrum mellan påfyllningsvågor",
    up: "↑ fler än förra veckan",
    down: "↓ färre än förra veckan",
    flat: "→ samma som förra veckan",
    none2: "–",
    measuredTitle: "Så mäter vi",
    measured: "En påfyllningsvåg är alla bekräftade påfyllningar inom samma halvtimme i butikerna som räknas här, så åtta konfigurationer som kommer samtidigt är en våg, inte åtta. Mellanrummen mäts mellan vågor. ”Den här veckan” är de senaste 7 dagarna, ”förra veckan” de 7 dagarna före dem. Bekräftad betyder att två av RestockWires kontroller stämde överens (varje butik var 15:e sekund, butiker med bevakning var 5:e); en butiks första observation räknas aldrig.",
  },

  /** SellOutRanking: the place's stores ranked by how fast their restocks sold out. */
  ranking: {
    title: (what: string, label: string) => `Vilka butiker säljer slut på ${what} snabbast ${label}?`,
    unknown: "Topplistan över slutförsäljning gick inte att läsa in just nu. Lagret live och påfyllningsloggen på sidan påverkas inte.",
    thin: (label: string, k: number, min: number, days: number) =>
      `För få tidsmätta slutförsäljningar ${label} än: ${stores_(k)} med ${n(min)} eller fler påfyllningar som sålde slut de senaste ${n(days)} dagarna, och en topplista kräver två.`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>Snabbast {o.label}: <b className="text-ink">{o.fastest}</b>, där hälften av påfyllningarna var borta inom <b className="text-ink">{o.fastSec}</b>; långsammast: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (senaste {n(o.days)} dagarna).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `Påfyllningar av ${what} ${label} efter hur snabbt de sålde slut, senaste ${n(days)} dagarna; butiker med ${n(min)} eller fler tidsmätta slutförsäljningar`,
    thRank: "#",
    thStore: "Butik",
    thMedian: "Hälften borta inom",
    thFastest: "Snabbast",
    thPairs: "Slutsålda påfyllningar",
    footnote: (ranked: number, total: number) => `${n(ranked)} av ${stores_(total)} rankade`,
    measuredTitle: "Så mäter vi",
    measured: (min: number) =>
      `”Hälften borta inom” är mediantiden från RestockWires kontroll som först såg en påfyllning till kontrollen som först såg den borta. Det är en övre gräns: butiker med bevakning kollas var 5:e sekund, alla andra var 15:e. Bara butiker med ${n(min)} eller fler påfyllningar som sålde slut under perioden rankas. En listning kortare än en kontroll kan missas, så mycket snabba butiker ser lite långsammare ut än de är.`,
  },

  /** RestockLeaderboard: the stores with the most confirmed restocks in the last 7 days and their share. */
  leaderboard: {
    title: (what: string, label: string, days: number) => `Vilka butiker fyllde på ${what} oftast ${label}? Senaste ${n(days)} dagarna`,
    unknown: "Topplistan gick inte att läsa in just nu. Lagret live och påfyllningsloggen på sidan påverkas inte.",
    none: (what: string, label: string, days: number) => `Ingen bekräftad påfyllning av ${what} ${label} de senaste ${n(days)} dagarna.`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> ledde {o.label} med <b className="text-ink">{n(o.n)}</b> av {n(o.total)} {o.total === 1 ? "bekräftad påfyllning" : "bekräftade påfyllningar"} (<b className="text-ink">{o.share}</b>) de senaste {n(o.days)} dagarna.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Store-butiker ${label} efter bekräftade påfyllningar av ${what}, senaste ${n(days)} dagarna`,
    thRank: "#",
    thStore: "Butik",
    thRestocks: "Påfyllningar",
    thShare: "Andel",
    footnote: (shown: number, stores: number, total: number) => `${n(shown)} av ${stores_(stores)} med en påfyllning · ${restocks(total)} totalt`,
    regionsTitle: (noun: string) => `Per ${nounSv(noun)}`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `Bekräftade påfyllningar av ${what} ${label} per ${nounSv(noun)}, senaste ${n(days)} dagarna`,
    thRegion: (noun: string) => cap(nounSv(noun)),
    thStores: "Butiker",
    measuredTitle: "Så mäter vi",
    measured: (what: string) =>
      `Bekräftade påfyllningar av ${what} de senaste 7 dagarna, från RestockWires egna kontroller av hämtning i butik på apple.com (varje butik var 15:e sekund, butiker med bevakning var 5:e; två kontroller måste stämma överens; en butiks första observation räknas aldrig). Andelen räknas på alla bekräftade påfyllningar på samma plats under samma period.`,
  },
};
