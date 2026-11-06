/**
 * German strings: account (dashboard page, its restock modules, install / checkout / pricing pages). Plan names
 * and dollar amounts are not translated (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { SPEED } from "@/lib/plans";
import { n, plural } from "./util";

const stores = (k: number) => plural(k, "Store", "Stores");

export const account: Dict["account"] = {
  loading: "Wird geladen",
  meta: { title: "Meine Alarme" },
  signedInAs: (email: string) => `Konto: ${email}`,
  title: "Meine Alarme",
  units: { s: "Sek.", min: "Min.", taps: "Taps" },

  plan: {
    title: "Tarif",
    none: "Kein Tarif in diesem Konto, Alarme sind daher pausiert",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)} von ${n(limit)} Alarmen aktiv`,
    renews: (date: string) => ` · nächste Abbuchung am ${date}`,
    ends: (date: string) => ` · endet am ${date}`,
  },

  sent: {
    title: "Zugestellte Alarme",
    last: (ago: string) => `Zuletzt ${ago}`,
    none: "Noch keiner zugestellt",
    empty: "Bisher ist kein Alarm verschickt worden.",
    channel: { push: "Mitteilung", email: "E-Mail" } as Record<string, string>,
    status: { sent: "gesendet", failed: "fehlgeschlagen", skipped: "übersprungen" } as Record<string, string>,
  },

  fast: {
    title: "Reserviert in 20 Sekunden",
    sub: "alles bis auf die letzten vier Taps vorab erledigt",
    lasts: "so lange bleibt ein typisches Duo-Angebot online",
    push: "bestätigter Restock → Push aufs Handy",
    tapsLeft: "Taps bleiben, wenn der Push kommt",
    steps: [
      { title: "Ihr Zeitfenster kennen", hint: "die üblichen Stunden Ihrer Stores stehen unten · 10 Min. vorher bereit sein" },
      { title: "Apples Checkout vorladen", hint: "genauer Speicher und Farbe → Lieferung & Abholung" },
      { title: "Bedingungen vorab akzeptieren · oder ohne Vertrag kaufen", hint: "ohne Vertrag und voll bezahlt gibt es gar kein Häkchen" },
      { title: "Bildschirmsperre abschalten", hint: "Automatische Sperre → Nie · alle 10–15 Min. kurz antippen" },
      { title: "Wenn er kommt: lesen, dann handeln", hint: "Abholung → der genannte Store → erstes Zeitfenster → Apple Pay" },
    ],
    guide: "Die Zwei-Minuten-Anleitung",
    window: "Ihr Restock-Zeitfenster",
  },

  restock: {
    title: "Restock-Stunden Ihrer Stores",
    anyIphone: "iPhone",
    and: " und ",
    yours: (k: number) => (k === 1 ? "Ihrem Store" : `Ihren ${n(k)} Stores`),
    Yours: (k: number) => (k === 1 ? "Ihr Store" : `Ihre ${n(k)} Stores`),
    otherStores: (k: number) => (k === 1 ? "1 anderen Store" : `${n(k)} anderen Stores`),
    meta: (what: string, k: number, days: number, zone: string) => `${what} · ${stores(k)} · letzte ${days} Tage · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `Spitzenstunde in ${yours} · danach ${then}` : `Spitzenstunde in ${yours}`),
    busiestArea: (k: number, zone: string) => `Spitze über alle ${n(k)} Stores (${zone})`,
    next: (inHours: number) => `nächstes Fenster · ${inHours === 0 ? "diese Stunde" : `in ${inHours} Std.`}`,
    typical: "so lange hält ein typisches Angebot",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `noch kein Restock in ${yours} · letzte ${days} Tage` : `Restocks in ${yours} · letzte ${days} Tage${pattern ? "" : " · zu wenige für ein Muster"}`),
    byHour: (busiestInGreen: boolean) => `Stunde für Stunde${busiestInGreen ? " · Spitze in Grün" : ""}`,
    byWeekday: (busiest: string | null) => `Tag für Tag${busiest ? ` · Spitze ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Restocks in ${yours} nach Stunde, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Restocks in ${yours} nach Wochentag: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} von anderen Trackern gemeldet)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${plural(k, "Restock", "Restocks")} in ${yours}${area ? ` · ${n(area.n)} insgesamt (${area.zone})` : ""}${reported ? ` · ${n(reported)} von anderen Trackern gemeldet` : ""}`,
    now: "jetzt",
    allZone: (k: number, zone: string) => `Alle ${n(k)} Stores (${zone})`,
    reportMarkBars: "Gestrichelt",
    reportMarkDots: "Hohle Punkte",
    sellTitle: "Wie lange die Restocks Ihrer Stores halten",
    sellMeta: (what: string, k: number, days: number) => `${what} · ${stores(k)} · letzte ${days} Tage`,
    sellLabel: (yours: string) => `in ${yours}`,
  },

  success: {
    metaTitle: "Ihre Alarme laufen",
    isOn: (plan: string) => `${plan} ist aktiv`,
    yourPlan: "Ihr Tarif",
    received: "Zahlung bestätigt",
    onPlan: (limit: number) => `Ihr Tarif umfasst ${n(limit)} Alarme.`,
    planOn: "Ihr Tarif ist aktiv.",
    pending: "Einen Moment bitte: Das Abo erscheint gleich in Ihrem Konto.",
    open: "Zu meinen Alarmen",
    another: "Noch einen Alarm einrichten",
    saved: (k: number) => `${plural(k, "Alarm", "Alarme")} gespeichert · Stripe schickt den Beleg`,
    pushOn: "Mitteilungen",
    pushNext: "Noch ein Schritt: Alarme aufs Handy",
  },

  install: {
    metaTitle: "App holen – Restock-Alarme direkt auf den Sperrbildschirm",
    metaDescription: "Legen Sie RestockWire auf den Home-Bildschirm: Die Mitteilung kommt, sobald ein Store in Ihrer Nähe ein iPhone Duo, 18 Pro oder Pro Max zur Abholung listet.",
  },

  pricing: {
    metaTitle: "Preise – 10 Alarme $5, 20 für $10, 50 für $20",
    metaDescription: `Restock-Alarme für die iPhone-Abholung im Apple Store: Ihre Stores im ${SPEED.fastSec}-Sekunden-Takt geprüft, ein Push etwa ${SPEED.alertSec} Sekunden nach einem bestätigten Restock. Plus $5/Monat für 10 Alarme, Pro $10 für 20, Max $20 für 50. Jederzeit kündbar.`,
    title: "Preise",
    lead: "**Ein Alarm ist ein Store × ein exaktes iPhone.** Alles andere auf der Seite lesen Sie kostenlos.",
    chips: ["Alle Apple Stores in Deutschland, Österreich und der Schweiz", "Jederzeit kündbar", "Karte oder Link"],
    fastest: "Kein iPhone-Bestandstracker nennt ein kürzeres Prüfintervall",
    everyFast: `**${SPEED.fastSec} Sekunden** zwischen zwei Prüfungen Ihrer Stores · die Intervalle anderer Tracker laut eigenen Angaben: 8 Sekunden bis 15 Minuten`,
    sellsOut: (band: string) => `**${band}**: So lange bleibt ein typischer iPhone-Duo-Restock gelistet; manche sind nach 20–30 Sekunden weg`,
    band: (range: string) => `${range} Sekunden`,
    aboutMinute: "etwa eine Minute",
    sameSpeed: "Ein Tempo für jeden Tarif",
    rechecked: "zwischen zwei Prüfungen Ihrer Stores",
    toPhone: "vom bestätigten Restock bis aufs Handy",
    listing: "ein typisches Duo-Angebot, von gelistet bis weg",
    note: { plus: "1 iPhone × 10 Stores", pro: "2 iPhones × 10 Stores", max: "5 iPhones × 10 Stores" } as Record<string, string>,
    month: "/ Monat",
    alerts: (k: number) => `${n(k)} Alarme`,
    perks: [`${SPEED.fastSec}-Sekunden-Takt für Ihre Stores, ${SPEED.checkSec}-Sekunden-Takt für alle anderen`, `Bestätigter Restock in etwa ${SPEED.alertSec} Sek. auf Ihrem Handy`] as string[],
    cancel: "Jederzeit kündbar",
    get: (plan: string) => `${plan} wählen`,
    billing: "Abrechnung über Stripe · Karte oder Link · Tarifwechsel werden anteilig verrechnet",
    refund: "Doch nichts für Sie? [Innerhalb von 7 Tagen gibt es das Geld voll zurück](/refunds), solange Sie keinen Restock-Alarm erhalten haben",
  },
};
