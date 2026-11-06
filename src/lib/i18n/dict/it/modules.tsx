/**
 * Italian strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("a Roma", "da Apple Via del Corso", "in Italia", "qui"); numbers arrive raw and are grouped here.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { dei, n as N, pl } from "./util";

const CHECK_NOTE = "ogni 15 s, 5 s con un avviso";
/** "il martedì" / "la domenica" from a weekday name. */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Ancora niente da mostrare ${label}: nessun rifornimento né esaurimento negli ultimi ${N(days)} giorni. Il primo disegnerà la prima barra.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${pl(restocks, "rifornimento", "rifornimenti")} e ${pl(soldouts, "esaurimento", "esaurimenti")} ${label} negli ultimi ${N(days)} giorni, distribuiti su ${pl(activeDays, "giorno", "giorni")}.`,
    busiest: (day: string, restocks: number) => <> Il giorno più ricco, il <b className="text-ink">{day}</b>, ne ha portati {N(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "rifornimento", "rifornimenti")} e ${pl(soldouts, "esaurimento", "esaurimenti")}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${pl(restocks, "rifornimento", "rifornimenti")} · ${pl(soldouts, "esaurimento", "esaurimenti")}`,
    legendRestocks: "rifornimenti",
    legendSoldouts: "esaurimenti",
  },

  last24: {
    title: (label: string) => `Le ultime 24 ore di rifornimenti di iPhone Duo ${label}`,
    asOf: (when: string) => `rilevato il ${when}`,
    localTime: (when: string) => `${when} ora locale`,
    anAppleStore: "un Apple Store",
    unknown: "Il conteggio delle 24 ore non è disponibile in questo momento; la disponibilità in tempo reale e il registro dei rifornimenti di questa pagina non ne risentono.",
    none: (label: string, asOf: string) => <><b className="text-ink">Zero rifornimenti di iPhone Duo {label} nelle ultime 24 ore</b> (rilevato il {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{pl(o.restocks, "rifornimento di iPhone Duo", "rifornimenti di iPhone Duo")} {o.one ? o.label : `in ${N(o.withStores)} ${o.allStores === 1 ? "Apple Store su 1" : `${dei(o.allStores)} Apple Store`} ${o.label}`}</b> nelle ultime 24 ore; il più recente è stato un <b className="text-ink">{o.config}</b>{o.store != null && <> da {o.store}</>}, {o.when} ora locale.</>
    ),
    tileRestocks: "rifornimenti confermati in 24 h",
    tileConfigsBack: "configurazioni ricomparse",
    tileStores: (configs: number, allConfigs: number) => `negozi riforniti${configs ? ` · ${N(configs)} configurazioni su ${N(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>il più recente · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>quello prima · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "niente di precedente in archivio",
    caption: (label: string, asOf: string) => `Ogni configurazione di iPhone Duo ${label}: rifornimenti confermati nelle ultime 24 ore, rilevati il ${asOf}`,
    thConfig: "Configurazione",
    thRestocks: "Rifornimenti",
    thStores: "Negozi",
    thLast: "Ultimo rifornimento (ora locale)",
    thNow: "Disponibile ora",
    ofStores: (n: number, total: number) => `${N(n)} su ${N(total)}`,
    noneIn24: "nessuno in 24 h",
    yes: "sì",
    no: "no",
    countedTitle: "Che cosa conta qui come rifornimento",
    counted: "Sono letture di RestockWire del Ritiro in negozio di apple.com: ogni negozio ogni 15 secondi, i negozi con avvisi ogni 5. Un rifornimento entra nel registro solo quando due controlli concordano; la primissima lettura di un negozio non conta; nulla di ciò che pubblicano altri tracker viene mescolato.",
    alert: (label: string | null) => `Ricevi avvisi${label != null ? ` ${label}` : ""}: il prossimo ti raggiunge in pochi secondi`,
  },

  clock: {
    none: (label: string, days: number) => `Finora nessun rifornimento ${label} negli ultimi ${N(days)} giorni.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${pl(total, "rifornimento", "rifornimenti")} ${label} negli ultimi ${N(days)} giorni${dates != null ? ` (in ${pl(dates, "giorno", "giorni")})` : ""}: ancora troppo pochi per indicare un orario abituale.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{pl(total, "rifornimento", "rifornimenti")} {label} negli ultimi {N(days)} giorni. L&apos;orario abituale sono <b className="text-ink">le {hour}</b> ora locale{day ? <>; il giorno che ne porta di più è <b className="text-ink">{ilDay(day)}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Per ora · ${zone}`,
    byWeekday: "Per giorno della settimana",
    barReported: (n: number) => ` (+${N(n)} ${n === 1 ? "segnalato" : "segnalati"} da altri tracker)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} ${n === 1 ? "segnalato" : "segnalati"} da altri tracker`,
    legendOurs: "Confermati da RestockWire",
  },

  feed: {
    empty: "Per ora il registro è vuoto.",
    available: "Disponibile",
    soldOut: "Esaurito",
    soldOutAt: (time: ReactNode) => <>sparito {time}</>,
    since: (time: ReactNode) => <>disponibile da {time}</>,
    restockedAt: (time: ReactNode) => <>tornato {time}</>,
    mapAria: (store: string) => `Trova ${store} sulla mappa`,
    map: "Mappa",
    buyAria: (model: string, config: string) => `Ordina l'${model} ${config} su apple.com`,
    buy: "Ordina su apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Ancora nessuna classifica: niente è tornato disponibile ${label} negli ultimi ${N(days)} giorni.`,
    intro: (label: string, days: number) => `Le configurazioni tornate disponibili ${label} negli ultimi ${N(days)} giorni, in ordine di frequenza.`,
    times: (n: number) => `${N(n)}×`,
    alert: "Ricevi avvisi",
  },

  sellout: {
    typical: (label: string, band: string) => `Un rifornimento tipico di iPhone Duo ${label} è durato circa ${band} prima di esaurirsi.`,
    half: (label: string, duration: string) => `${duration}: il tempo in cui si è esaurita metà dei rifornimenti ${label}.`,
    none: (label: string, days: number) => `Negli ultimi ${N(days)} giorni nulla ${label} è stato rifornito e poi esaurito.`,
    whatDuo: "iPhone Duo",
    whatAll: "tutti gli iPhone",
    tileHalf: (what: string) => <>metà esaurita entro · {what}</>,
    tileWithin30: "spariti entro 30 s",
    tileWithin60: "spariti entro 1 min",
    tileFastest: (n: number, days: number) => <>il più rapido · {pl(n, "rifornimento esaurito", "rifornimenti esauriti")}, {N(days)} g</>,
    caption: (days: number) => `Per iPhone, ultimi ${N(days)} giorni`,
    thIphone: "iPhone",
    thSoldOut: "Esauriti",
    thHalf: "Metà esaurita entro",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Il più rapido",
    each: "Una riga per rifornimento",
    barNote: (full: string) => `lunghezza della barra = secondi in vendita · ${full} riempie la riga`,
    stillListed: (duration: string) => `ancora disponibile · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Come misuriamo questi tempi",
    measured: (estimated: boolean) =>
      `Una riga con «esaurito in 45–60 s» significa che il nostro controllo 45 secondi dopo il primo avvistamento trovava ancora la configurazione disponibile, e quello 60 secondi dopo non la trovava più. L'ampiezza di ogni intervallo è la distanza tra due controlli: 5 secondi nei negozi con avvisi, 15 secondi in tutti gli altri${estimated ? "; le righe segnate con ≈ risalgono a prima che registrassimo l'ultimo controllo e sono delimitate invece dal giro di 15 secondi" : ""}. Una disponibilità più breve di un intervallo può comparire e sparire tra due controlli, quindi la quota reale esaurita entro 30 secondi è più alta di quella in tabella.`,
  },

  configTable: {
    title: "Tutte le configurazioni in questo negozio",
    titleAt: (store: string) => `Tutte le configurazioni da ${store}`,
    lookupOff: (hasRows: boolean) => `Al momento Apple ha disattivato la verifica del Ritiro in negozio per questo negozio${hasRows ? " (le sue risposte più recenti sono qui sotto)" : ""}`,
    tracked: (n: number) => `${N(n)} configurazioni sul filo`,
    firstSweep: "Primo giro in corso · gli stati compaiono entro un minuto",
    inStock: (n: number, total: number) => `${N(n)} su ${N(total)} disponibili`,
    available: "Disponibile",
    unavailable: "Non disponibile",
    noLookup: "nessuna verifica del ritiro",
    notChecked: "non ancora controllato",
    since: (ago: ReactNode) => <>disponibile da {ago}</>,
    lastAvailable: (ago: ReactNode) => <>ultima disponibilità {ago}</>,
    neverHere: "finora mai disponibile qui",
    buy: "Ordina",
    alertAria: (model: string, config: string, store: string) => `Ricevi un avviso quando ${store} ha disponibile l'${model} ${config}`,
    alert: "Ricevi avvisi →",
  },

  matrix: {
    store: "Negozio",
    checked: "Controllato",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} configurazioni su ${N(total)} disponibili`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `nessun ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)} configurazioni su ${N(total)} disponibili ora`,
    noneNow: (total: number) => `0 configurazioni su ${N(total)} in questo momento`,
    lookupOff: "Al momento Apple ha disattivato la verifica del ritiro per questo negozio",
    notChecked: "non ancora controllato",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>letto {ago}</>,
    alert: "Ricevi avvisi →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Letto {ago} · {CHECK_NOTE}</>,
    map: "Vedilo sulla mappa",
    alert: "Tieni d'occhio questo negozio",
    alsoIn: (region: string) => `Altro da ${region}`,
    acrossLine: "I negozi più vicini oltre il confine dello stato",
    elsewhere: "I negozi più vicini un po' più lontano",
  },

  hours: {
    title: "Orari di apertura",
    local: (zone: string) => `Ora locale (${zone})`,
    today: (hours: string, week: string) => ` · oggi ${hours} · ${week}`,
    directions: "Indicazioni",
    applePage: "questo negozio su apple.com",
    liveMap: "Mappa in tempo reale",
    storePage: "Pagina del negozio",
    closed: "Chiuso",
    everyDay: (hours: string) => `Tutti i giorni ${hours}`,
    openNow: (closes: string) => `Aperto ora · chiude alle ${closes}`,
    opensAt: (opens: string) => `Apre alle ${opens}`,
    closedToday: (next: string | null) => (next ? `Chiuso oggi · apre ${next}` : "Chiuso oggi"),
    closedNow: (next: string | null) => (next ? `Chiuso ora · apre ${next}` : "Chiuso ora"),
    nextOpen: (day: string | null, time: string) => `${day ?? "domani"} alle ${time}`,
  },

  liveStats: {
    inStock: "Disponibili ora",
    storesWith: "Negozi con disponibilità",
    lastCheck: "Ultimo controllo",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(n)} negozi su ${N(stores)} hanno il ${short} disponibile in questo momento`,
    lastCheck: (ago: ReactNode) => <>Ultimo controllo {ago}</>,
    firstSweep: "Primo giro in corso.",
    noneListed: (model: string, storage: string | null, color: string | null) => `In questo momento nessun negozio ha disponibile l'${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""}.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>Disponibile {ago}</>,
    loading: "Caricamento della disponibilità",
  },
};
