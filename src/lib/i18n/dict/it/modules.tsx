/**
 * Italian strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("a Roma", "da Apple Via del Corso", "in Italia", "qui"); numbers arrive raw and are grouped here.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { dei, n as N, pl } from "./util";

const CHECK_NOTE = "15 s per tutti, 5 s se c'è un avviso";
/** "il martedì" / "la domenica" from a weekday name. */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("it-IT");
export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Grafico vuoto ${label}: in ${N(days)} giorni zero rifornimenti e zero esaurimenti. La prima barra arriva col primo evento.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `In ${N(days)} giorni ${label}: ${pl(restocks, "rifornimento", "rifornimenti")}, ${pl(soldouts, "esaurimento", "esaurimenti")}, con attività in ${pl(activeDays, "giorno", "giorni")}.`,
    busiest: (day: string, restocks: number) => <> Record il <b className="text-ink">{day}</b>: {N(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "rifornimento", "rifornimenti")} e ${pl(soldouts, "esaurimento", "esaurimenti")}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: tornati ${N(restocks)}, finiti ${N(soldouts)}`,
    legendRestocks: "tornati",
    legendSoldouts: "finiti",
  },

  last24: {
    title: (label: string) => `iPhone Duo ${label}: cosa è tornato nelle ultime 24 ore`,
    asOf: (when: string) => `rilevato il ${when}`,
    localTime: (when: string) => `${when} (ora del negozio)`,
    anAppleStore: "un Apple Store",
    unknown: "Conteggio delle 24 ore momentaneamente assente. Stato live e diario dei rifornimenti funzionano lo stesso.",
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
    thConfig: "Capacità e colore",
    thRestocks: "Ritorni",
    thStores: "Negozi coinvolti",
    thLast: "Più recente (ora del negozio)",
    thNow: "Ritirabile adesso",
    ofStores: (n: number, total: number) => `${N(n)}/${N(total)}`,
    noneIn24: "zero in 24 h",
    yes: "sì",
    no: "no",
    countedTitle: "Che cosa conta qui come rifornimento",
    counted: "Sono letture di RestockWire del Ritiro in negozio di apple.com: ogni negozio ogni 15 secondi, i negozi con avvisi ogni 5. Un rifornimento entra nel registro solo quando due controlli concordano; la primissima lettura di un negozio non conta; nulla di ciò che pubblicano altri tracker viene mescolato.",
    alert: (label: string | null) => `Ricevi avvisi${label != null ? ` ${label}` : ""}: il prossimo ti raggiunge in pochi secondi`,
  },

  clock: {
    none: (label: string, days: number) => `${N(days)} giorni senza rifornimenti ${label}, finora.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `Campione ancora scarso per un orario abituale: ${pl(total, "rifornimento", "rifornimenti")} ${label} in ${N(days)} giorni${dates != null ? `, sparsi su ${pl(dates, "giorno", "giorni")}` : ""}.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Di solito verso <b className="text-ink">le {hour}</b>, ora del negozio{day ? <>, e soprattutto <b className="text-ink">{ilDay(day)}</b></> : null}: è quanto dicono {pl(total, "rifornimento", "rifornimenti")} {label} in {N(days)} giorni.</>
    ),
    byHour: (zone: string) => `Fascia oraria · ${zone}`,
    byWeekday: "Giorno per giorno",
    barReported: (n: number) => `, più ${N(n)} da tracker esterni`,
    barReportedTitle: (bar: string, n: number) => `${bar} · tracker esterni: ${N(n)}`,
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
    empty: (label: string, days: number) => `Classifica vuota: in ${N(days)} giorni nessuna configurazione è tornata ${label}.`,
    intro: (label: string, days: number) => `In testa la configurazione tornata più spesso ${label}; finestra di ${N(days)} giorni.`,
    times: (n: number) => `${N(n)}×`,
    alert: "Ricevi avvisi",
  },

  sellout: {
    typical: (label: string, band: string) => `Un rifornimento tipico di iPhone Duo ${label} è durato circa ${band} prima di esaurirsi.`,
    half: (label: string, duration: string) => `Metà dei rifornimenti ${label} è finita entro ${duration}.`,
    none: (label: string, days: number) => `In ${N(days)} giorni nessun ciclo completo ${label}: niente è tornato e poi finito.`,
    whatDuo: "iPhone Duo",
    whatAll: "ogni iPhone",
    tileHalf: (what: string) => <>tempo per bruciarne la metà · {what}</>,
    tileWithin30: "spariti entro 30 s",
    tileWithin60: "spariti entro 1 min",
    tileFastest: (n: number, days: number) => <>record di velocità · su {pl(n, "esaurimento", "esaurimenti")} in {N(days)} g</>,
    caption: (days: number) => `Per iPhone, ultimi ${N(days)} giorni`,
    thIphone: "iPhone",
    thSoldOut: "Esauriti",
    thHalf: "Metà finita in",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Record",
    each: "Una riga per rifornimento",
    barNote: (full: string) => `lunghezza della barra = secondi in vendita · ${full} riempie la riga`,
    stillListed: (duration: string) => `ancora in vendita dopo ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Come misuriamo questi tempi",
    measured: (estimated: boolean) =>
      `Una riga con «esaurito in 45–60 s» significa che il nostro controllo 45 secondi dopo il primo avvistamento trovava ancora la configurazione disponibile, e quello 60 secondi dopo non la trovava più. L'ampiezza di ogni intervallo è la distanza tra due controlli: 5 secondi nei negozi con avvisi, 15 secondi in tutti gli altri${estimated ? "; le righe segnate con ≈ risalgono a prima che registrassimo l'ultimo controllo e sono delimitate invece dal giro di 15 secondi" : ""}. Una disponibilità più breve di un intervallo può comparire e sparire tra due controlli, quindi la quota reale esaurita entro 30 secondi è più alta di quella in tabella.`,
  },

  configTable: {
    title: "Il negozio, configurazione per configurazione",
    titleAt: (store: string) => `${store}, configurazione per configurazione`,
    lookupOff: (hasRows: boolean) => `Al momento Apple ha disattivato la verifica del Ritiro in negozio per questo negozio${hasRows ? " (le sue risposte più recenti sono qui sotto)" : ""}`,
    tracked: (n: number) => `${N(n)} configurazioni sotto controllo`,
    firstSweep: "Primo giro in corso: gli stati arrivano entro un minuto",
    inStock: (n: number, total: number) => `${N(n)} su ${N(total)} disponibili`,
    available: "Disponibile",
    unavailable: "Non disponibile",
    noLookup: "ritiro non verificabile",
    notChecked: "in coda per il controllo",
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
    cellTitle: (model: string, n: number, total: number) => `${model}, ritirabili ${N(n)} configurazioni su ${N(total)}`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short}: ${N(n)}`,
    noDuo: (short: string) => `${short}: zero`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `Ritirabili adesso: ${N(n)} configurazioni su ${N(total)}`,
    noneNow: (total: number) => `Ritirabili adesso: 0 configurazioni su ${N(total)}`,
    lookupOff: "Al momento Apple ha disattivato la verifica del ritiro per questo negozio",
    notChecked: "in coda per il controllo",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>letto {ago}</>,
    alert: "Ricevi avvisi →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Letto {ago} · {CHECK_NOTE}</>,
    map: "Vedilo sulla mappa",
    alert: "Tieni d'occhio questo negozio",
    alsoIn: (region: string) => `Altro da ${region}`,
    acrossLine: "Al di là del confine di stato",
    elsewhere: "I negozi più vicini un po' più lontano",
  },

  hours: {
    title: "Quando è aperto",
    local: (zone: string) => `Ora locale (${zone})`,
    today: (hours: string, week: string) => ` · orario di oggi ${hours} · ${week}`,
    directions: "Indicazioni",
    applePage: "questo negozio su apple.com",
    liveMap: "Mappa live",
    storePage: "Scheda del negozio",
    everyDay: (hours: string) => `${hours}, sette giorni su sette`,
    closed: "Chiuso",
    openNow: (closes: string) => `Aperto · chiusura alle ${closes}`,
    opensAt: (opens: string) => `Apertura alle ${opens}`,
    closedToday: (next: string | null) => (next ? `Oggi chiuso · riapre ${next}` : "Oggi chiuso"),
    closedNow: (next: string | null) => (next ? `Adesso chiuso · riapre ${next}` : "Adesso chiuso"),
    nextOpen: (day: string | null, time: string) => `${day ?? "domani"}, ore ${time}`,
  },

  liveStats: {
    inStock: "Ritirabili adesso",
    storesWith: "Negozi che ce l'hanno",
    lastCheck: "Letto",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${short} ritirabile adesso: ${N(n)} negozi su ${N(stores)}`,
    lastCheck: (ago: ReactNode) => <>Letto {ago}</>,
    firstSweep: "Primo giro in corso.",
    noneListed: (model: string, storage: string | null, color: string | null) => `${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""}: adesso non è ritirabile in nessun negozio.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>Disponibile {ago}</>,
    loading: "La disponibilità sta arrivando",
  },
  /** WireNow: il dispaccio con cui aprono le pagine di regione, città, negozio, paese e iPhone Duo. `label` arriva con la preposizione («a Milano», «da Apple Piazza Liberty»); tutte le cifre sono degli ultimi 14 giorni. */
  wireNow: {
    eyebrow: (label: string) => `Sul filo · iPhone Duo ${label}`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>Ultima volta in lista: <b className="text-ink">{o.config}</b>{o.store != null && <> da {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number) => `Nessun iPhone Duo in lista ${label} negli ultimi ${WN(days)} giorni.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">In lista adesso in {WN(o.k)} negozi su {WN(o.n)}</b> {o.label} (lettura {o.stamp}): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">In lista adesso: {o.k} versioni su {o.total}</b> da {o.name} (lettura {o.stamp}): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">Niente in lista alle {o.stamp}</b>: nessuno dei {WN(o.n)} Apple Store {o.label} mostra un iPhone Duo per il ritiro.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">Niente in lista alle {o.stamp}</b>: {o.name} non mostra alcuna versione dell’iPhone Duo per il ritiro.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} version{configs === 1 ? "e" : "i"})</>,
    configItem: (config: string) => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro: ${o.pro} versioni su ${o.configs} qui; 18 Pro Max: ${o.max}.` : `L'iPhone 18 Pro è in ${o.pro} di questi, il 18 Pro Max in ${o.max}.`),
    tRestocks: (days: number) => `rifornimenti Duo, ultimi ${WN(days)} giorni`,
    tGone60: "delle liste cronometrate sparite entro un minuto",
    tLongest: "lista più lunga della settimana",
    tWindow: (range: string) => `dei rifornimenti caduti ${range}`,
    tToday: "rifornimenti di oggi, finora",
    tStores: (n: number) => `negozi su ${WN(n)} riforniti nel periodo`,
    wireTime: (stamp: string) => `Ora del filo ${stamp}`,
    reads: (note: string) => `letture ${note}`,
    window: (days: number) => `finestra di ${WN(days)} giorni`,
    method: "un rifornimento conta solo con due letture concordi; la prima apparizione di un negozio non conta mai",
    zone: () => "ora del negozio",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }) =>
      `${o.range}, ${o.zone}: è lì che l'iPhone Duo torna ${o.label}. Quella fascia ha preso ${o.pct} dei ${WN(o.n)} rifornimenti che RestockWire ha registrato ${o.one ? "qui" : `nei ${WN(o.stores)} Apple Store ${o.label}`} negli ultimi ${WN(o.days)} giorni. Ora di punta ${o.busiest}, ${WN(o.busiestN)} rifornimenti.${o.config ? ` La ${o.config} è tornata più spesso (${WN(o.k)} su ${WN(o.n)}).` : ""}${o.median ? ` Lista mediana: sparita in ${o.median}.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }) => `${WN(o.n)} riforniment${o.n === 1 ? "o" : "i"} dell'iPhone Duo ${o.one ? o.label : `nei ${WN(o.stores)} Apple Store ${o.label}`} negli ultimi ${WN(o.days)} giorni: troppo pochi per un'ora abituale. Ognuno è elencato sotto.`,
    hourByHour: "Ogni ora, ogni negozio →",
    lastThree: (n: number, label: string) => (n === 1 ? `L'ultima lista del Duo ${label}` : `Le ultime ${WN(n)} liste del Duo ${label}`),
    secs: (n: number) => `${WN(n)} s`,
    mins: (n: number) => `${WN(n)} min`,
    upRange: (low: string, high: string) => `in lista ${low}–${high}`,
    upAbout: (x: string) => `in lista circa ${x}`,
    stillUp: (x: string) => `ancora in lista (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }) => (o.one
      ? `${WN(o.sent)} avvis${o.sent === 1 ? "o" : "i"} per rifornimenti Duo ${o.label} negli ultimi ${WN(o.days)} giorni.`
      : `${WN(o.sent)} avvis${o.sent === 1 ? "o" : "i"} per rifornimenti Duo in ${WN(o.stores)} dei ${WN(o.total)} negozi ${o.label} negli ultimi ${WN(o.days)} giorni.`),
    alertMe: (name: string) => `Metti ${name} sul filo dei 5 secondi`,
    unknown: "Stavolta le cifre del pattern non si sono lette; la lista qui sopra è in tempo reale.",
    allModels: (o: { n: number; days: number; peak: string | null }) => `I tre iPhone insieme: ${WN(o.n)} rifornimenti in ${WN(o.days)} giorni${o.peak ? `, picco alle ${o.peak}` : ""}.`,
  },
};
