/**
 * Dutch strings: wire — the four restock-log modules (RestockHeatmap, RestockStreak, SellOutRanking,
 * RestockLeaderboard). `label` arrives as a Dutch place phrase ("in Noord-Holland", "bij Apple Amsterdam", "hier");
 * `what` is a phone or configuration name and stays untranslated. Weekdays, hours, durations and percentages
 * arrive formatted in Dutch.
 */
import type { Dict } from "../en";
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";

const n$ = (v: number) => num("nl", v);
/** A count with its noun: "1 aanvulling", "3 aanvullingen". */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
const aanv = (n: number) => cnt(n, "aanvulling", "aanvullingen");
/** The region noun arrives in English ("state", "province"); the table names it in Dutch. */
const NOUN: Record<string, string> = { state: "staat", province: "provincie", area: "gebied", department: "departement", prefecture: "prefectuur", emirate: "emiraat", canton: "kanton", region: "gewest", county: "provincie", city: "stad" };
const noun = (w: string) => NOUN[w] ?? w;

export const wire: Dict["wire"] = {
  /** RestockHeatmap: a 7 × 24 grid of confirmed restocks by local weekday and hour. */
  heatmap: {
    title: (what: string, label: string) => `Wanneer komt de ${what} ${label} terug? Weekdag × uur`,
    unknown: "Het raster per weekdag en uur is nu even niet te laden; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    none: (label: string, days: number) => `Nog geen bevestigde aanvulling ${label} in de afgelopen ${n$(days)} dagen. Het raster vult zich vanaf de eerste.`,
    /** Under 5 restocks or under 3 days with one. */
    thin: (n: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${aanv(n)} ${label} op ${cnt(activeDays, "dag", "dagen")} in de afgelopen ${n$(days)}: te weinig om een patroon te noemen. RestockWire wacht op ${n$(min)} aanvullingen verspreid over ${n$(minDays)} dagen.`,
    /** `weekday` "dinsdag", `window` "7–9 uur", `share` "34%". */
    pattern: (label: string, weekday: string, window: string, share: string, n: number, days: number) => (
      <>De meeste aanvullingen {label} komen op <b className="text-ink">{weekday}</b>, tussen <b className="text-ink">{window}</b> lokale tijd ({share} van {n$(n)} in de afgelopen {n$(days)} dagen).</>
    ),
    /** Under 14 days of span: the hour, but no weekday claim. */
    patternHours: (label: string, window: string, share: string, n: number, spanDays: number) => (
      <>De meeste aanvullingen {label} komen tussen <b className="text-ink">{window}</b> lokale tijd ({share} van {n$(n)}); {cnt(spanDays, "dag", "dagen")} aan data is nog te kort om een weekdag te noemen.</>
    ),
    caption: (what: string, label: string, days: number) => `Bevestigde aanvullingen van de ${what} ${label} per lokale weekdag en uur, afgelopen ${n$(days)} dagen`,
    /** Every cell's title and screen-reader text: `hours` "7–8 uur". */
    cell: (weekday: string, hours: string, n: number) => `${weekday} ${hours}: ${aanv(n)}`,
    /** The busiest cell. */
    busiest: (weekday: string, hours: string, n: number) => `drukst · ${weekday} ${hours} · ${aanv(n)}`,
    legendFewer: "minder",
    legendMore: "meer",
    /** Multi-zone sets (a state across two zones, a country): every store counted in its own zone. */
    localTime: "lokale tijd van elke winkel",
    measuredTitle: "Zo meten we dit",
    measured: (min: number, minDays: number, span: number) =>
      `Elk vak telt de bevestigde aanvullingen van RestockWire (twee checks die het eens zijn; de eerste waarneming in een winkel telt nooit mee) die in dat lokale uur van die weekdag binnenkwamen, in de tijdzone van de winkel zelf. Een patroon noemen we vanaf ${n$(min)} aanvullingen op ${n$(minDays)} verschillende dagen, een weekdag pas als de data ${n$(span)} dagen beslaat. Tien aanvullingen in één golf zijn één gebeurtenis, geen gewoonte.`,
  },

  /** RestockStreak: days since the last restock, the longest drought, this week against last, the typical gap. */
  streak: {
    title: (what: string, label: string) => `Reeksen en stiltes in de aanvullingen van de ${what} ${label}`,
    unknown: "De reeksen zijn nu even niet te laden; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    none: (label: string, days: number) => `Geen bevestigde aanvulling ${label} in de afgelopen ${n$(days)} dagen: de stilte beslaat het hele venster.`,
    /** `since` "2 dagen geleden" / "vandaag"; `longest` "5,2 dagen" or null under two drops; `trend` the arrow line below or null when both weeks are 0. */
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Laatste bevestigde aanvulling {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; de langste stilte in {n$(o.days)} dagen duurde <b className="text-ink">{o.longest}</b></>}{o.trend && <>; deze week <b className="text-ink">{n$(o.thisWeek)}</b> {o.thisWeek === 1 ? "aanvulling" : "aanvullingen"}, vorige week {n$(o.lastWeek)} ({o.trend})</>}.</>
    ),
    today: "vandaag",
    daysAgo: (n: number) => `${cnt(n, "dag", "dagen")} geleden`,
    hoursAgo: (n: number) => `${n$(n)} uur geleden`,
    tileSince: "sinds de laatste bevestigde aanvulling",
    tileSinceNone: (days: number) => `geen aanvulling in ${n$(days)} dagen`,
    tileLongest: (days: number) => `langste stilte tussen aanvullingen · ${n$(days)} d`,
    /** `prev` last week's count. */
    tileWeek: (prev: number) => `aanvullingen in de afgelopen 7 dagen · ${n$(prev)} de week ervoor`,
    tileMedian: "gebruikelijke tijd tussen twee golven",
    up: "↑ meer dan vorige week",
    down: "↓ minder dan vorige week",
    flat: "→ gelijk aan vorige week",
    none2: "–",
    measuredTitle: "Zo meten we dit",
    measured: "Een golf is elke bevestigde aanvulling binnen hetzelfde halfuur in de winkels die hier meetellen: acht configuraties die tegelijk terugkomen zijn één golf, geen acht. De tijd ertussen meten we van golf tot golf. ‘Deze week’ is de afgelopen 7 dagen, ‘vorige week’ de 7 dagen daarvoor. Bevestigd betekent dat twee checks van RestockWire het eens waren (elke winkel elke 15 seconden, winkels met een alert elke 5 seconden); de eerste waarneming in een winkel telt nooit mee.",
  },

  /** SellOutRanking: the place's stores ranked by how fast their restocks sold out. */
  ranking: {
    title: (what: string, label: string) => `Welke winkels ${label} zijn de ${what} het snelst kwijt?`,
    unknown: "De ranglijst van uitverkoop is nu even niet te laden; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    /** Fewer than two stores qualify. `k` stores qualified, `min` pairs needed. */
    thin: (label: string, k: number, min: number, days: number) =>
      `Nog te weinig gemeten uitverkopen ${label}: ${cnt(k, "winkel", "winkels")} met ${n$(min)} of meer aanvullingen die uitverkocht raakten in de afgelopen ${n$(days)} dagen, en een ranglijst heeft er twee nodig.`,
    /** `fastest`/`slowest` are store links; `fastSec`/`slowSec` formatted durations. */
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>Snelst {o.label}: <b className="text-ink">{o.fastest}</b>, de helft van de aanvullingen binnen <b className="text-ink">{o.fastSec}</b> weg; traagst: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (afgelopen {n$(o.days)} dagen).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `Aanvullingen van de ${what} ${label} naar hoe snel ze uitverkocht waren, afgelopen ${n$(days)} dagen; winkels met ${n$(min)} of meer gemeten uitverkopen`,
    thRank: "#",
    thStore: "Winkel",
    thMedian: "Helft weg binnen",
    thFastest: "Snelst",
    thPairs: "Uitverkochte aanvullingen",
    /** The share of stores that made the table: "8 van 12 winkels gerangschikt". */
    footnote: (ranked: number, total: number) => `${n$(ranked)} van ${cnt(total, "winkel", "winkels")} gerangschikt`,
    measuredTitle: "Zo meten we dit",
    measured: (min: number) =>
      `‘Helft weg binnen’ is de mediane tijd tussen de check van RestockWire die een aanvulling als eerste zag en de check die hem als eerste weg zag. Het is een bovengrens: winkels met een alert worden elke 5 seconden gecheckt, alle andere elke 15 seconden. Alleen winkels met ${n$(min)} of meer uitverkochte aanvullingen in het venster komen in de lijst; een aanbod korter dan één check kan ons ontgaan, dus heel snelle winkels lijken iets trager dan ze zijn.`,
  },

  /** RestockLeaderboard: the stores with the most confirmed restocks in the last 7 days and their share. */
  leaderboard: {
    title: (what: string, label: string, days: number) => `Welke winkels ${label} kregen de ${what} het vaakst terug? Afgelopen ${n$(days)} dagen`,
    unknown: "De ranglijst is nu even niet te laden; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    none: (what: string, label: string, days: number) => `Geen bevestigde aanvulling van de ${what} ${label} in de afgelopen ${n$(days)} dagen.`,
    /** `store` a link, `share` "10%". */
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> staat {o.label} bovenaan met <b className="text-ink">{n$(o.n)}</b> van {o.total === 1 ? "1 bevestigde aanvulling" : `${n$(o.total)} bevestigde aanvullingen`} (<b className="text-ink">{o.share}</b>) in de afgelopen {n$(o.days)} dagen.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Stores ${label} naar bevestigde aanvullingen van de ${what}, afgelopen ${n$(days)} dagen`,
    thRank: "#",
    thStore: "Winkel",
    thRestocks: "Aanvullingen",
    thShare: "Aandeel",
    /** Below the table: "10 van 41 winkels met een aanvulling · 212 aanvullingen in totaal". */
    footnote: (shown: number, stores: number, total: number) => `${n$(shown)} van ${cnt(stores, "winkel", "winkels")} met een aanvulling · ${aanv(total)} in totaal`,
    /** The same count by state (US) or region. `noun` arrives in English: "state" / "province" / "area". */
    regionsTitle: (w: string) => `Per ${noun(w)}`,
    regionsCaption: (what: string, label: string, days: number, w: string) => `Bevestigde aanvullingen van de ${what} ${label} per ${noun(w)}, afgelopen ${n$(days)} dagen`,
    thRegion: (w: string) => { const d = noun(w); return d.charAt(0).toUpperCase() + d.slice(1); },
    thStores: "Winkels",
    measuredTitle: "Zo meten we dit",
    measured: (what: string) =>
      `Bevestigde aanvullingen van de ${what} in de afgelopen 7 dagen, uit RestockWire's eigen checks van ophalen in de winkel op apple.com (elke winkel elke 15 seconden, winkels met een alert elke 5 seconden; twee checks moeten het eens zijn; de eerste waarneming in een winkel telt nooit mee). Het aandeel is berekend op alle bevestigde aanvullingen op dezelfde plek in hetzelfde venster.`,
  },
};
