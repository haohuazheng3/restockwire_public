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
  meta: { title: "Mina bevakningar" },
  signedInAs: (email: string) => `Konto: ${email}`,
  title: "Mina bevakningar",
  units: { s: "s", min: "min", taps: "tryck" },

  plan: {
    title: "Plan",
    none: "Kontot har ingen plan, så bevakningarna är pausade",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${on} av ${limit} bevakningar igång`,
    renews: (date: string) => ` · nästa dragning ${date}`,
    ends: (date: string) => ` · upphör ${date}`,
  },

  sent: {
    title: "Levererade notiser",
    last: (ago: string) => `Senast ${ago}`,
    none: "Inget levererat än",
    empty: "Ingen notis har gått ut än.",
    channel: { push: "notis", email: "mejl" } as Record<string, string>,
    status: { sent: "skickad", failed: "misslyckades", skipped: "hoppades över" } as Record<string, string>,
  },

  fast: {
    title: "En reservation på 20 sekunder",
    sub: "allt utom de fyra sista trycken, klart i förväg",
    lasts: "så länge ligger en typisk Duo ute",
    push: "bekräftad påfyllning → notis i telefonen",
    tapsLeft: "tryck kvar när notisen kommer",
    steps: [
      { title: "Känn ditt fönster", hint: "dina butikers vanliga tider står nedan · var redo 10 min innan" },
      { title: "Ladda Apples kassa i förväg", hint: "exakt lagring och färg → Leverans och hämtning" },
      { title: "Godkänn villkoren tidigt · eller köp olåst", hint: "olåst och fullt betald visar ingen kryssruta alls" },
      { title: "Hindra skärmen från att låsas", hint: "Automatiskt lås → Aldrig · rör den var 10–15:e min" },
      { title: "När notisen kommer: läs, agera sedan", hint: "Hämta i butik → butiken som nämns → första tiden → Apple Pay" },
    ],
    guide: "Genomgången på två minuter",
    window: "Ditt påfyllningsfönster",
  },

  restock: {
    title: "Påfyllningstider i dina butiker",
    anyIphone: "iPhone",
    and: " och ",
    yours: (k: number) => (k === 1 ? "din butik" : `dina ${k} butiker`),
    Yours: (k: number) => (k === 1 ? "Din butik" : `Dina ${k} butiker`),
    otherStores: (k: number) => pl(k, "annan butik", "andra butiker"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${pl(stores, "butik", "butiker")} · senaste ${days} dagarna · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `toppen i ${yours} · sedan ${then}` : `toppen i ${yours}`),
    busiestArea: (stores: number, zone: string) => `toppen i alla ${stores} butiker inom ${zone}`,
    next: (inHours: number) => `nästa fönster · ${inHours === 0 ? "den här timmen" : `om ${inHours} tim`}`,
    typical: "så länge ligger en typisk listning ute",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `inga påfyllningar i ${yours} än · senaste ${days} dagarna` : `påfyllningar i ${yours} · senaste ${days} dagarna${pattern ? "" : " · för få för ett mönster"}`),
    byHour: (busiestInGreen: boolean) => `Timme för timme${busiestInGreen ? " · toppen i grönt" : ""}`,
    byWeekday: (busiest: string | null) => `Dag för dag${busiest ? ` · toppen på ${busiest}ar` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Påfyllningar per timme i ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Påfyllningar per veckodag i ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${reported} rapporterade av andra bevakningstjänster)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${pl(k, "påfyllning", "påfyllningar")} i ${yours}${area ? ` · ${area.n} inom hela ${area.zone}` : ""}${reported ? ` · ${reported} rapporterade av andra bevakningstjänster` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `Samtliga ${stores} butiker inom ${zone}`,
    reportMarkBars: "Streckade",
    reportMarkDots: "Ihåliga prickar",
    sellTitle: "Så länge varar påfyllningarna i dina butiker",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${pl(stores, "butik", "butiker")} · senaste ${days} dagarna`,
    sellLabel: (yours: string) => `i ${yours}`,
  },

  success: {
    metaTitle: "Dina bevakningar är igång",
    isOn: (plan: string) => `${plan} är aktiv`,
    yourPlan: "Din plan",
    received: "Betalningen är bekräftad",
    onPlan: (limit: number) => `Din plan rymmer ${limit} bevakningar.`,
    planOn: "Din plan är aktiv.",
    pending: "Ge det en minut: abonnemanget dyker snart upp på ditt konto.",
    open: "Till mina bevakningar",
    another: "Skapa en bevakning till",
    saved: (k: number) => `${pl(k, "bevakning sparad", "bevakningar sparade")} · Stripe skickar kvittot`,
    pushOn: "Notiser",
    pushNext: "Ett steg kvar: notiser i telefonen",
  },

  install: {
    metaTitle: "Skaffa appen – påfyllningar direkt till låsskärmen",
    metaDescription: "Lägg RestockWire på hemskärmen så når en notis dig i samma sekund som en iPhone Duo, 18 Pro eller Pro Max listas för hämtning i en butik nära dig.",
  },

  pricing: {
    metaTitle: "Priser – 10 bevakningar $5, 20 för $10, 50 för $20",
    metaDescription: `Notiser om påfyllning för hämtning i butik i alla Apple Store i USA: butikerna du väljer kollas var ${SPEED.fastSec}:e sekund, notis cirka ${SPEED.alertSec} sekunder efter en bekräftad påfyllning. Plus $5/mån för 10 bevakningar, Pro $10 för 20, Max $20 för 50. Avsluta när du vill.`,
    title: "Priser",
    lead: "**En bevakning är en butik × en exakt iPhone.** Allt annat på sajten är gratis att läsa.",
    chips: ["Alla 269 Apple Store-butiker i USA", "Avsluta när du vill", "Kort eller Link"],
    fastest: "Ingen lagerkoll för iPhone publicerar ett kortare kontrollintervall",
    everyFast: `**${SPEED.fastSec} sekunder** mellan kontrollerna av dina butiker · intervallen andra tjänster publicerar: från 8 sekunder till 15 minuter`,
    sellsOut: (band: string) => `**${band}**: så länge en typisk påfyllning av iPhone Duo ligger ute; vissa är borta på 20–30 sekunder`,
    band: (r: string) => `${r} sekunder`,
    aboutMinute: "ungefär en minut",
    sameSpeed: "Samma hastighet i alla planer",
    rechecked: "mellan kontrollerna av dina butiker",
    toPhone: "från bekräftad påfyllning till din telefon",
    listing: "en typisk Duo-listning, från listad till borta",
    note: { plus: "1 iPhone × 10 butiker", pro: "2 iPhone × 10 butiker", max: "5 iPhone × 10 butiker" } as Record<string, string>,
    month: "/ månad",
    alerts: (k: number) => `${k} bevakningar`,
    perks: [`Dina butiker kollas var ${SPEED.fastSec}:e sekund, alla 269 var ${SPEED.checkSec}:e`, `En bekräftad påfyllning i telefonen på cirka ${SPEED.alertSec} s`],
    cancel: "Avsluta när du vill",
    get: (plan: string) => `Välj ${plan}`,
    billing: "Fakturering via Stripe · kort eller Link · planbyten räknas om proportionellt",
    refund: "Ångrat dig? [Full återbetalning inom 7 dagar](/refunds) så länge ingen notis om påfyllning har nått dig",
  },
};
