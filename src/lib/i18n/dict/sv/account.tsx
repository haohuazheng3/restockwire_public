/**
 * Swedish strings: account (dashboard, its restock modules, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are (billing is in USD everywhere). Strings with **bold** / [label](href) render
 * through <Md>.
 */
import type { Dict } from "../en";
import { SPEED } from "@/lib/plans";
import { n, pl } from "./util";

export const account: Dict["account"] = {
  loading: "Laddar",
  meta: { title: "Bevakningar och notiser" },
  signedInAs: (email: string) => `Inloggad: ${email}`,
  title: "Dina bevakningar",
  units: { s: "s", min: "min", taps: "tryck" },

  plan: {
    title: "Plan",
    none: "Ingen plan på kontot – bevakningarna står still",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on}/${limit} bevakningar aktiva`,
    renews: (date: string) => ` · förnyas ${date}`,
    ends: (date: string) => ` · slutar ${date}`,
  },

  sent: {
    title: "Utskickade notiser",
    last: (ago: string) => `Senaste: ${ago}`,
    none: "Inga utskick ännu",
    empty: "Inga notiser utskickade ännu.",
    channel: { push: "notis", email: "mejl" } as Record<string, string>,
    status: { sent: "skickad", delivered: "levererad", failed: "misslyckad", skipped: "överhoppad" } as Record<string, string>,
  },

  fast: {
    title: "Reservera på 20 sekunder",
    sub: "förbered allt utom de sista fyra trycken",
    lasts: "typisk tid en Duo ligger ute",
    push: "bekräftad påfyllning → telefonen",
    tapsLeft: "tryck återstår när notisen landar",
    steps: [
      { title: "Lär dig ditt tidsfönster", hint: "dina butikers vanliga tider finns nedan · var beredd 10 min före" },
      { title: "Öppna Apples kassa i förväg", hint: "rätt lagring och färg → Leverans och hämtning" },
      { title: "Godkänn villkoren i förväg · eller välj olåst", hint: "olåst och fullt betald har ingen kryssruta" },
      { title: "Låt inte skärmen slockna", hint: "Automatiskt lås → Aldrig · tryck på skärmen var 10–15:e min" },
      { title: "Notisen kommer: läs först, agera sen", hint: "Hämta i butik → butiken i notisen → första tiden → Apple Pay" },
    ],
    guide: "Hela genomgången, två minuter",
    window: "Ditt fönster för påfyllning",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Notis levererad", sent: "Notis skickad", other: "Inte bland dina bevakningar", before: "Före din bevakning" },
    title: "När dina butiker fyller på",
    anyIphone: "iPhone",
    and: " och ",
    yours: (k: number) => (k === 1 ? "den valda butiken" : `de ${k} valda butikerna`),
    Yours: (k: number) => (k === 1 ? "Den valda butiken" : `De ${k} valda butikerna`),
    otherStores: (k: number) => pl(k, "övrig butik", "övriga butiker"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "butik", "butiker")} · ${days} dagar bakåt · ${zone}`,
    busiest: (yours: string, then: string | null): string => (then ? `flest i ${yours} · därefter ${then}` : `flest i ${yours}`),
    busiestArea: (stores: number, zone: string): string => `flest i hela tidszonen (${zone}), ${stores} butiker`,
    next: (inHours: number) => `nästa fönster · ${inHours === 0 ? "pågår nu" : `om ${inHours} tim`}`,
    typical: "typisk tid en listning ligger ute",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${days} dagar bakåt · ännu ingen påfyllning i ${yours}` : `${days} dagar bakåt · påfyllningar i ${yours}${pattern ? "" : " · underlaget räcker inte till ett mönster"}`),
    byHour: (busiestInGreen: boolean) => `Per timme${busiestInGreen ? " · grönt = flest" : ""}`,
    byWeekday: (busiest: string | null) => `Per veckodag${busiest ? ` · flest på ${busiest}ar` : ""}`,
    hourChart: (yours: string, zone: string, items: string): string => `Per timme (${zone}) i ${yours}: ${items}`,
    weekdayChart: (yours: string, items: string): string => `Per veckodag i ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number): string => `${label} ${n(k)}${reported ? ` (+${reported} från externa källor)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number): string =>
      `${label} · ${yours}: ${pl(k, "påfyllning", "påfyllningar")}${area ? ` · hela ${area.zone}: ${area.n}` : ""}${reported ? ` · externa källor: ${reported}` : ""}`,
    now: "just nu",
    allZone: (stores: number, zone: string) => `Alla ${stores} butiker i tidszonen ${zone}`,
    reportMarkBars: "Randiga staplar",
    reportMarkDots: "Ofyllda prickar",
    sellTitle: "Hur länge påfyllningarna räcker i dina butiker",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "butik", "butiker")} · ${days} dagar bakåt`,
    sellLabel: (yours: string) => `i ${yours}`,
  },

  success: {
    metaTitle: "Bevakningarna är aktiva",
    isOn: (plan: string) => `${plan} är igång`,
    yourPlan: "Aktiv plan",
    received: "Betalning mottagen",
    onPlan: (limit: number) => `Planen täcker ${limit} bevakningar.`,
    planOn: "Planen är igång.",
    pending: "Abonnemanget syns på kontot inom en minut.",
    open: "Öppna bevakningarna",
    another: "Ny bevakning",
    saved: (k: number) => `${pl(k, "bevakning sparad", "bevakningar sparade")} · kvittot kommer från Stripe`,
    pushOn: "Notiser",
    pushNext: "Sista steget: notiser i telefonen",
  },

  install: {
    metaTitle: "Hemskärmsappen – påfyllningar på låsskärmen",
    metaDescription: "RestockWire på hemskärmen: notisen landar samma sekund som en iPhone Duo, 18 Pro eller Pro Max går att hämta i en butik nära dig. Inget att ladda ner.",
  },

  pricing: {
    metaTitle: "Priser: $5 för 10 bevakningar, $10 för 20, $20 för 50",
    metaDescription: `Hämtning i butik, alla Apple Store i USA. Dina butiker var ${SPEED.fastSec}:e sekund, notis ~${SPEED.alertSec} s efter påfyllning. Plus $5/mån: 10 bevakningar, Pro $10: 20, Max $20: 50.`,
    title: "Planer och priser",
    lead: "**En bevakning = en butik × en exakt iPhone.** Resten av sajten är fri att läsa.",
    chips: ["269 Apple Store-butiker i USA", "Uppsägning när som helst", "Kort eller Link"],
    fastest: "Inget publicerat kontrollintervall för iPhone-lager är kortare",
    everyFast: `Dina butiker: **${SPEED.fastSec} sekunder** mellan kontrollerna · publicerade intervall hos andra: 8 sekunder–15 minuter`,
    sellsOut: (band: string) => `En typisk iPhone Duo-påfyllning ligger ute i **${band}**; vissa försvinner på 20–30 sekunder`,
    band: (r: string) => `${r} sekunder`,
    aboutMinute: "runt en minut",
    sameSpeed: "Hastigheten är densamma i alla planer",
    rechecked: "mellan två kontroller av dina butiker",
    toPhone: "bekräftad påfyllning → telefonen",
    listing: "typisk Duo-listning, från att den dyker upp tills den är borta",
    note: { plus: "1 iPhone i 10 butiker", pro: "2 iPhone i 10 butiker", max: "5 iPhone i 10 butiker" } as Record<string, string>,
    month: "/ månad",
    alerts: (k: number) => `${k} bevakningar`,
    perks: [`Dina butiker: var ${SPEED.fastSec}:e sekund. Alla 269: var ${SPEED.checkSec}:e`, `Bekräftad påfyllning når telefonen på cirka ${SPEED.alertSec} s`],
    cancel: "Uppsägning när som helst",
    get: (plan: string) => `Ta ${plan}`,
    billing: "Stripe sköter betalningen · kort eller Link · uppgradering räknas per dag, nedgradering gäller från förnyelsen",
    refund: "Ångrar du dig? [Pengarna tillbaka inom 7 dagar](/refunds), om ingen påfyllningsnotis har skickats till dig efter betalningen",
  },
};
