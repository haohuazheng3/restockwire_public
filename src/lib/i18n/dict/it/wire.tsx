/**
 * Italian strings: wire — the four restock-log modules (RestockHeatmap, RestockStreak, SellOutRanking,
 * RestockLeaderboard). `label` arrives with its preposition ("a Roma", "da Apple Via del Corso", "in Italia", "qui");
 * weekdays arrive as Italian names ("martedì"), hours as "7:00–9:00", `noun` as the English region word ("province").
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { cap, n as N, nounForms, pl } from "./util";

/** "il martedì" / "la domenica" (the habitual "on Tuesdays"). */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);
/** The English region word ("province") in Italian, singular. */
const regione1 = (noun: string) => (nounForms[noun] ?? nounForms.area).one;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `Quando torna disponibile l'${what} ${label}? Giorno × ora`,
    unknown: "La griglia giorno per ora non è leggibile in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    none: (label: string, days: number) => `Ancora nessun rifornimento confermato ${label} negli ultimi ${N(days)} giorni: la griglia si riempie dal primo.`,
    thin: (n: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${pl(n, "rifornimento", "rifornimenti")} ${label} in ${pl(activeDays, "giorno", "giorni")} degli ultimi ${N(days)}: ancora troppo pochi dati per parlare di una tendenza (RestockWire aspetta ${N(min)} rifornimenti in ${N(minDays)} giorni).`,
    pattern: (label: string, weekday: string, window: string, share: string, n: number, days: number) => (
      <>La maggior parte dei rifornimenti {label} arriva <b className="text-ink">{ilDay(weekday)}</b>, nella fascia <b className="text-ink">{window}</b> ora locale ({share} di {N(n)} negli ultimi {N(days)} giorni).</>
    ),
    patternHours: (label: string, window: string, share: string, n: number, spanDays: number) => (
      <>La maggior parte dei rifornimenti {label} arriva nella fascia <b className="text-ink">{window}</b> ora locale ({share} di {N(n)}); {pl(spanDays, "giorno", "giorni")} di dati sono ancora troppo pochi per indicare un giorno della settimana.</>
    ),
    caption: (what: string, label: string, days: number) => `Rifornimenti confermati di ${what} ${label} per giorno della settimana e ora locale, ultimi ${N(days)} giorni`,
    cell: (weekday: string, hours: string, n: number) => `${cap(weekday)} ${hours}: ${pl(n, "rifornimento", "rifornimenti")}`,
    busiest: (weekday: string, hours: string, n: number) => `il più intenso · ${weekday} ${hours} · ${pl(n, "rifornimento", "rifornimenti")}`,
    legendFewer: "meno",
    legendMore: "più",
    localTime: "l'ora locale di ciascun negozio",
    measuredTitle: "Come lo misuriamo",
    measured: (min: number, minDays: number, span: number) =>
      `Ogni casella conta i rifornimenti confermati da RestockWire (due controlli concordi; la prima lettura di un negozio non conta mai) arrivati in quell'ora locale di quel giorno della settimana nel periodo, nel fuso orario del negozio. Una tendenza viene indicata da ${N(min)} rifornimenti in ${N(minDays)} giorni diversi, un giorno della settimana solo quando i dati coprono ${N(span)} giorni: dieci rifornimenti in un'unica ondata sono un evento, non un'abitudine.`,
  },

  streak: {
    title: (what: string, label: string) => `Serie e periodi di magra dei rifornimenti di ${what} ${label}`,
    unknown: "I numeri delle serie non sono leggibili in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    none: (label: string, days: number) => `Nessun rifornimento confermato ${label} negli ultimi ${N(days)} giorni: l'attuale periodo di calma copre tutto l'intervallo.`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Ultimo rifornimento confermato {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; il periodo di calma più lungo in {N(o.days)} giorni è durato <b className="text-ink">{o.longest}</b></>}{o.trend && <>; <b className="text-ink">{N(o.thisWeek)}</b> {o.thisWeek === 1 ? "rifornimento" : "rifornimenti"} questa settimana contro {N(o.lastWeek)} la settimana scorsa ({o.trend})</>}.</>
    ),
    today: "oggi",
    daysAgo: (n: number) => `${pl(n, "giorno", "giorni")} fa`,
    hoursAgo: (n: number) => `${pl(n, "ora", "ore")} fa`,
    tileSince: "dall'ultimo rifornimento confermato",
    tileSinceNone: (days: number) => `nessun rifornimento in ${N(days)} giorni`,
    tileLongest: (days: number) => `periodo di calma più lungo tra due rifornimenti · ${N(days)} g`,
    tileWeek: (prev: number) => `rifornimenti negli ultimi 7 giorni · ${N(prev)} la settimana prima`,
    tileMedian: "intervallo tipico tra due ondate di rifornimenti",
    up: "↑ in aumento sulla settimana scorsa",
    down: "↓ in calo sulla settimana scorsa",
    flat: "→ come la settimana scorsa",
    none2: "–",
    measuredTitle: "Come lo misuriamo",
    measured: "Un'ondata di rifornimenti è l'insieme dei rifornimenti confermati nella stessa mezz'ora nei negozi contati qui, quindi otto configurazioni arrivate insieme sono un'ondata, non otto; gli intervalli si misurano tra un'ondata e l'altra. «Questa settimana» sono gli ultimi 7 giorni, «la settimana scorsa» i 7 precedenti. Confermato significa che due controlli di RestockWire concordano (ogni negozio ogni 15 secondi, i negozi con avvisi ogni 5); la prima lettura di un negozio non conta mai.",
  },

  ranking: {
    title: (what: string, label: string) => `In quali negozi ${label} l'${what} si esaurisce più in fretta?`,
    unknown: "La classifica degli esaurimenti non è leggibile in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    thin: (label: string, k: number, min: number, days: number) =>
      `Ancora troppo pochi esaurimenti cronometrati ${label}: ${k === 1 ? "1 negozio ha" : `${N(k)} negozi hanno`} almeno ${N(min)} rifornimenti esauriti negli ultimi ${N(days)} giorni, e per una classifica ne servono due.`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>Il più rapido {o.label}: <b className="text-ink">{o.fastest}</b>, con metà dei rifornimenti spariti entro <b className="text-ink">{o.fastSec}</b>; il più lento: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (ultimi {N(o.days)} giorni).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `Rifornimenti di ${what} ${label} in base alla velocità di esaurimento, ultimi ${N(days)} giorni; negozi con almeno ${N(min)} esaurimenti cronometrati`,
    thRank: "#",
    thStore: "Negozio",
    thMedian: "Metà esaurita entro",
    thFastest: "Il più rapido",
    thPairs: "Rifornimenti esauriti",
    footnote: (ranked: number, total: number) => `${N(ranked)} ${total === 1 ? "negozio su 1" : `negozi su ${N(total)}`} in classifica`,
    measuredTitle: "Come lo misuriamo",
    measured: (min: number) =>
      `«Metà esaurita entro» è il tempo mediano tra il controllo di RestockWire che ha visto per primo un rifornimento e quello che per primo lo ha trovato esaurito: è un limite superiore, perché i negozi con avvisi vengono controllati ogni 5 secondi e tutti gli altri ogni 15. In classifica entrano solo i negozi con almeno ${N(min)} rifornimenti esauriti nel periodo; una disponibilità più breve di un controllo può sfuggire, quindi i negozi molto rapidi sembrano un po' più lenti di quanto siano.`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `Quali negozi ${label} hanno rifornito di più l'${what}? Ultimi ${N(days)} giorni`,
    unknown: "La classifica non è leggibile in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    none: (what: string, label: string, days: number) => `Nessun rifornimento confermato di ${what} ${label} negli ultimi ${N(days)} giorni.`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> è in testa {o.label} con <b className="text-ink">{N(o.n)}</b> {o.total === 1 ? "rifornimento confermato su 1" : `rifornimenti confermati su ${N(o.total)}`} (<b className="text-ink">{o.share}</b>) negli ultimi {N(o.days)} giorni.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Store ${label} per rifornimenti confermati di ${what}, ultimi ${N(days)} giorni`,
    thRank: "#",
    thStore: "Negozio",
    thRestocks: "Rifornimenti",
    thShare: "Quota",
    footnote: (shown: number, stores: number, total: number) => `${N(shown)} ${stores === 1 ? "negozio su 1" : `negozi su ${N(stores)}`} con un rifornimento · ${pl(total, "rifornimento", "rifornimenti")} in tutto`,
    regionsTitle: (noun: string) => `Per ${regione1(noun)}`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `Rifornimenti confermati di ${what} ${label} per ${regione1(noun)}, ultimi ${N(days)} giorni`,
    thRegion: (noun: string) => cap(regione1(noun)),
    thStores: "Negozi",
    measuredTitle: "Come lo misuriamo",
    measured: (what: string) =>
      `Rifornimenti confermati di ${what} negli ultimi 7 giorni, dai controlli di RestockWire sul Ritiro in negozio di apple.com (ogni negozio ogni 15 secondi, i negozi con avvisi ogni 5; due controlli devono concordare; la prima lettura di un negozio non conta mai). La quota è calcolata su tutti i rifornimenti confermati nello stesso luogo e nello stesso periodo.`,
  },
};
