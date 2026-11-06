/**
 * Italian strings: account (dashboard, its restock modules, install / checkout / pricing pages). {zone} arrives as the
 * full Italian zone name ("Ora dell'Europa centrale"), which already says "ora".
 */
import type { Dict } from "../en";
import { ilData, n as N, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Caricamento",
  meta: { title: "I miei avvisi" },
  signedInAs: (email: string) => `Account: ${email}`,
  title: "I miei avvisi",
  units: { s: "s", min: "min", taps: "tocchi" },

  plan: {
    title: "Piano",
    none: "Nessun piano su questo account: gli avvisi sono in pausa",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${N(on)} avvisi attivi su ${N(limit)}`,
    renews: (date: string) => ` · prossimo addebito ${ilData(date)}`,
    ends: (date: string) => ` · si ferma ${ilData(date)}`,
  },

  sent: {
    title: "Avvisi recapitati",
    last: (ago: string) => `L'ultimo ${ago}`,
    none: "Ancora nessuno recapitato",
    empty: "Non è ancora partito nessun avviso.",
    channel: { push: "notifica", email: "email" } as Record<string, string>,
    status: { sent: "inviato", failed: "non riuscito", skipped: "saltato" } as Record<string, string>,
  },

  fast: {
    title: "Una prenotazione in 20 secondi",
    sub: "tutto pronto in anticipo, tranne gli ultimi quattro tocchi",
    lasts: "quanto resta online di solito un Duo disponibile",
    push: "rifornimento confermato → notifica sul telefono",
    tapsLeft: "tocchi che restano quando arriva la notifica",
    steps: [
      { title: "Conosci la tua fascia", hint: "gli orari abituali dei tuoi negozi sono qui sotto · sii pronto 10 min prima" },
      { title: "Prepara il checkout di Apple", hint: "capacità e colore esatti → Consegna e ritiro" },
      { title: "Accetta prima i termini · o compra sbloccato", hint: "sbloccato e pagato per intero: nessuna casella da spuntare" },
      { title: "Evita che lo schermo si blocchi", hint: "Blocco automatico → Mai · toccalo ogni 10–15 min" },
      { title: "Quando scatta: leggi, poi muoviti", hint: "Ritiro → il negozio indicato → primo orario → Apple Pay" },
    ],
    guide: "La guida passo passo in due minuti",
    window: "La tua fascia di rifornimento",
  },

  restock: {
    title: "Orari di rifornimento dei tuoi negozi",
    anyIphone: "iPhone",
    and: " e ",
    yours: (n: number) => (n === 1 ? "il tuo negozio" : `i tuoi ${N(n)} negozi`),
    Yours: (n: number) => (n === 1 ? "Il tuo negozio" : `I tuoi ${N(n)} negozi`),
    otherStores: (n: number) => pl(n, "altro negozio", "altri negozi"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "negozio", "negozi")} · ultimi ${N(days)} giorni · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `ora di punta per ${yours} · poi ${then}` : `ora di punta per ${yours}`),
    busiestArea: (stores: number, zone: string) => `ora di punta tra tutti i ${N(stores)} negozi (${zone})`,
    next: (inHours: number) => `prossima fascia · ${inHours === 0 ? "in quest'ora" : `tra ${N(inHours)} h`}`,
    typical: "quanto dura di solito un prodotto disponibile",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `ancora nessun rifornimento per ${yours} · ultimi ${N(days)} giorni` : `rifornimenti per ${yours} · ultimi ${N(days)} giorni${pattern ? "" : " · troppo pochi per una tendenza"}`),
    byHour: (busiestInGreen: boolean) => `Ora per ora${busiestInGreen ? " · ora di punta in verde" : ""}`,
    byWeekday: (busiest: string | null) => `Giorno per giorno${busiest ? ` · picco ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Rifornimenti per ${yours} ora per ora, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Rifornimenti per ${yours} per giorno della settimana: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (+${N(reported)} ${reported === 1 ? "segnalato" : "segnalati"} da altri tracker)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(n, "rifornimento", "rifornimenti")} per ${yours}${area ? ` · ${N(area.n)} in tutta la zona (${area.zone})` : ""}${reported ? ` · ${N(reported)} ${reported === 1 ? "segnalato" : "segnalati"} da altri tracker` : ""}`,
    now: "ora",
    allZone: (stores: number, zone: string) => `Tutti i ${N(stores)} negozi (${zone})`,
    reportMarkBars: "Tratteggiate",
    reportMarkDots: "Punti vuoti",
    sellTitle: "Quanto durano i rifornimenti dei tuoi negozi",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "negozio", "negozi")} · ultimi ${N(days)} giorni`,
    sellLabel: (yours: string) => `per ${yours}`,
  },

  success: {
    metaTitle: "I tuoi avvisi sono attivi",
    isOn: (plan: string) => `${plan} è attivo`,
    yourPlan: "Il tuo piano",
    received: "Pagamento confermato",
    onPlan: (limit: number) => `Il tuo piano include ${N(limit)} avvisi.`,
    planOn: "Il tuo piano è attivo.",
    pending: "Dagli un minuto: l'abbonamento comparirà a breve nel tuo account.",
    open: "Vai ai miei avvisi",
    another: "Imposta un altro avviso",
    saved: (n: number) => `${pl(n, "avviso salvato", "avvisi salvati")} · la ricevuta arriva da Stripe`,
    pushOn: "Notifiche",
    pushNext: "Ancora un passo: gli avvisi sul telefono",
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
    chips: ["Tutti gli Apple Store monitorati", "Disdici quando vuoi", "Carta o Link"],
    fastest: "Nessun tracker di disponibilità iPhone dichiara un intervallo di controllo più breve",
    everyFast: "**5 secondi** tra un controllo e l'altro sui tuoi negozi · gli intervalli dichiarati dagli altri tracker: da 8 secondi a 15 minuti",
    sellsOut: (band: string) => `**${band}**: quanto resta disponibile di solito un rifornimento di iPhone Duo; alcuni spariscono in 20–30 secondi`,
    band: (range: string) => `${range} secondi`,
    aboutMinute: "circa un minuto",
    sameSpeed: "Una sola velocità per tutti i piani",
    rechecked: "tra un controllo e l'altro sui tuoi negozi",
    toPhone: "dal rifornimento confermato al tuo telefono",
    listing: "un Duo disponibile tipico, dall'arrivo all'esaurimento",
    note: { plus: "1 iPhone × 10 negozi", pro: "2 iPhone × 10 negozi", max: "5 iPhone × 10 negozi" } as Record<string, string>,
    month: "/ mese",
    alerts: (n: number) => `${N(n)} avvisi`,
    perks: ["Controlli ogni 5 secondi sui tuoi negozi, ogni 15 secondi su tutti gli altri", "Un rifornimento confermato sul tuo telefono in circa 3 s"],
    cancel: "Disdici quando vuoi",
    get: (plan: string) => `Scegli ${plan}`,
    billing: "Fatturazione tramite Stripe · carta o Link · i cambi di piano sono calcolati pro rata",
    refund: "Hai cambiato idea? [Il rimborso completo è disponibile entro 7 giorni](/refunds) purché non ti abbia raggiunto nessun avviso di rifornimento",
  },
};
