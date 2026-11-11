/**
 * Italian strings: account (dashboard, its restock modules, install / checkout / pricing pages). {zone} arrives as the
 * full Italian zone name ("Ora dell'Europa centrale"), which already says "ora".
 */
import type { Dict } from "../en";
import { cap, ilData, n as N, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Caricamento",
  meta: { title: "Avvisi e piano" },
  signedInAs: (email: string) => `Account: ${email}`,
  title: "Il tuo pannello avvisi",
  units: { s: "s", min: "min", taps: "tocchi" },

  plan: {
    title: "Piano",
    none: "Nessun piano su questo account: gli avvisi sono in pausa",
    summary: (plan: string, on: number, limit: number) => `${plan} · attivi ${N(on)} su ${N(limit)}`,
    renews: (date: string) => ` · prossimo addebito ${ilData(date)}`,
    ends: (date: string) => ` · si ferma ${ilData(date)}`,
  },

  sent: {
    title: "Avvisi recapitati",
    last: (ago: string) => `L'ultimo ${ago}`,
    none: "Ancora nessuno recapitato",
    empty: "Non è ancora partito nessun avviso.",
    channel: { push: "notifica", email: "email" } as Record<string, string>,
    status: { sent: "partito", delivered: "consegnato", failed: "fallito", skipped: "non inviato" } as Record<string, string>,
  },

  fast: {
    title: "Una prenotazione in 20 secondi",
    sub: "tutto pronto in anticipo, tranne gli ultimi quattro tocchi",
    lasts: "vita tipica online di un Duo appena tornato",
    push: "dalla conferma al telefono",
    tapsLeft: "tocchi rimasti dopo la notifica",
    steps: [
      { title: "Segna la tua fascia oraria", hint: "orari tipici dei tuoi negozi più sotto · pronto 10 min prima" },
      { title: "Prepara il checkout di Apple", hint: "capacità e colore esatti → Consegna e ritiro" },
      { title: "Termini già accettati · o versione sbloccata", hint: "sbloccato con pagamento intero = zero caselle da spuntare" },
      { title: "Evita che lo schermo si blocchi", hint: "Blocco automatico → Mai · toccalo ogni 10–15 min" },
      { title: "Quando scatta: leggi, poi muoviti", hint: "Ritiro → il negozio indicato → primo orario → Apple Pay" },
    ],
    guide: "La guida passo passo in due minuti",
    window: "Quando riforniscono i tuoi negozi",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Avviso consegnato", sent: "Avviso inviato", other: "Non tra i tuoi avvisi", before: "Prima del tuo avviso" },
    title: "Orari di rifornimento dei tuoi negozi",
    anyIphone: "iPhone",
    and: " e ",
    yours: (n: number) => (n === 1 ? "il negozio che segui" : `i ${N(n)} negozi che segui`),
    Yours: (n: number) => (n === 1 ? "Il negozio che segui" : `I ${N(n)} negozi che segui`),
    otherStores: (n: number) => pl(n, "negozio in più", "negozi in più"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${zone} · ${pl(stores, "negozio", "negozi")} · finestra di ${N(days)} giorni`,
    busiest: (yours: string, then: string | null) => (then ? `l'ora più carica per ${yours}, seguita da ${then}` : `l'ora più carica per ${yours}`),
    busiestArea: (stores: number, zone: string) => `l'ora più carica sui ${N(stores)} negozi del fuso (${zone})`,
    next: (inHours: number) => `fascia successiva: ${inHours === 0 ? "è adesso" : `fra ${N(inHours)} h`}`,
    typical: "quanto dura di solito un prodotto disponibile",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${N(days)} giorni senza rifornimenti per ${yours}` : `rifornimenti in ${N(days)} giorni, ${yours}${pattern ? "" : " · campione ancora scarso per un'abitudine"}`),
    byHour: (busiestInGreen: boolean) => `Ora per ora${busiestInGreen ? " · ora di punta in verde" : ""}`,
    byWeekday: (busiest: string | null) => `Giorno per giorno${busiest ? ` · picco ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${cap(yours)}, rifornimenti per fascia oraria (${zone}): ${items}`,
    weekdayChart: (yours: string, items: string) => `${cap(yours)}, rifornimenti per giorno: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? `, più ${N(reported)} da tracker esterni` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label} · ${yours}: ${pl(n, "rifornimento", "rifornimenti")}${area ? ` · fuso ${area.zone}: ${N(area.n)}` : ""}${reported ? ` · tracker esterni: ${N(reported)}` : ""}`,
    now: "adesso",
    allZone: (stores: number, zone: string) => `${N(stores)} negozi del fuso (${zone})`,
    reportMarkBars: "Tratteggiate",
    reportMarkDots: "Pallini vuoti",
    sellTitle: "Quanto durano i rifornimenti dei tuoi negozi",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "negozio", "negozi")} · ultimi ${N(days)} giorni`,
    sellLabel: (yours: string) => `per ${yours}`,
  },

  success: {
    metaTitle: "I tuoi avvisi sono attivi",
    isOn: (plan: string) => `${plan} è attivo`,
    yourPlan: "Piano attivo",
    received: "Pagamento confermato",
    onPlan: (limit: number) => `Il tuo piano include ${N(limit)} avvisi.`,
    planOn: "Piano attivo da ora.",
    pending: "Dagli un minuto: l'abbonamento comparirà a breve nel tuo account.",
    open: "Vai ai miei avvisi",
    another: "Imposta un altro avviso",
    saved: (n: number) => `${pl(n, "avviso salvato", "avvisi salvati")} · la ricevuta arriva da Stripe`,
    pushOn: "Notifiche",
    pushNext: "Ultimo passo: avvisi sul telefono",
  },

  install: {
    metaTitle: "Scarica l'app: avvisi di rifornimento direttamente sulla schermata di blocco",
    metaDescription: "Aggiungi RestockWire alla schermata Home: una notifica ti raggiunge nell'istante in cui un iPhone Duo, 18 Pro o Pro Max diventa disponibile per il ritiro in un negozio vicino a te.",
  },

  pricing: {
    metaTitle: "Prezzi: 10 avvisi a $5, 20 a $10, 50 a $20",
    metaDescription: "Avvisi di rifornimento per il ritiro di iPhone in negozio negli Apple Store: controlli ogni 5 secondi sui negozi che scegli, una notifica circa 3 secondi dopo un rifornimento confermato. Plus $5 al mese per 10 avvisi, Pro $10 per 20, Max $20 per 50. Disdici quando vuoi.",
    title: "Prezzi",
    lead: "**Un avviso è un negozio × un iPhone esatto.** Tutto il resto del sito si consulta gratis.",
    /** The English chip names the 269 US stores; an Italian reader is not on the US page, so no US-only number here. */
    chips: ["Ogni Apple Store sotto controllo", "Disdetta libera", "Carta o Link"],
    fastest: "Nessun tracker di disponibilità iPhone dichiara un intervallo di controllo più breve",
    everyFast: "**5 secondi** tra un controllo e l'altro sui tuoi negozi · gli intervalli dichiarati dagli altri tracker: da 8 secondi a 15 minuti",
    sellsOut: (band: string) => `**${band}**: quanto resta disponibile di solito un rifornimento di iPhone Duo; alcuni spariscono in 20–30 secondi`,
    band: (range: string) => `${range} secondi`,
    aboutMinute: "più o meno un minuto",
    sameSpeed: "Una sola velocità per tutti i piani",
    rechecked: "tra un controllo e l'altro sui tuoi negozi",
    toPhone: "dal rifornimento confermato al tuo telefono",
    listing: "un Duo disponibile tipico, dall'arrivo all'esaurimento",
    note: { plus: "1 iPhone × 10 negozi", pro: "2 iPhone × 10 negozi", max: "5 iPhone × 10 negozi" } as Record<string, string>,
    month: "/ mese",
    alerts: (n: number) => `${N(n)} avvisi`,
    perks: ["Controlli ogni 5 secondi sui tuoi negozi, ogni 15 secondi su tutti gli altri", "Un rifornimento confermato sul tuo telefono in circa 3 s"],
    cancel: "Disdetta in qualsiasi momento",
    get: (plan: string) => `Scegli ${plan}`,
    billing: "Fatturazione tramite Stripe · carta o Link · salire di piano costa i giorni rimasti, scendere vale dal rinnovo",
    refund: "Hai cambiato idea? [Il rimborso completo è disponibile entro 7 giorni](/refunds) purché non ti abbia raggiunto nessun avviso di rifornimento",
  },
};
