/**
 * Dutch strings: account (dashboard page, restock modules on it, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are: billing is in US dollars everywhere.
 */
import { SPEED } from "@/lib/plans";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Laden",
  meta: { title: "Mijn alerts" },
  signedInAs: (email: string) => `Account: ${email}`,
  title: "Mijn alerts",
  units: { s: "s", min: "min", taps: "tikken" },

  plan: {
    title: "Abonnement",
    none: "Geen abonnement op dit account, dus alerts staan op pauze",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n$(on)} van ${n$(limit)} alerts actief`,
    renews: (date: string) => ` · volgende afschrijving ${date}`,
    ends: (date: string) => ` · stopt ${date}`,
  },

  sent: {
    title: "Afgeleverde alerts",
    last: (ago: string) => `Meest recent ${ago}`,
    none: "Nog niets afgeleverd",
    empty: "Er is nog geen alert uitgegaan.",
    channel: { push: "melding", email: "e-mail" } as Record<string, string>,
    status: { sent: "verstuurd", failed: "mislukt", skipped: "overgeslagen" } as Record<string, string>,
  },

  fast: {
    title: "Reserveren in 20 seconden",
    sub: "alles behalve de laatste vier tikken, vooraf gedaan",
    lasts: "zo lang blijft een gewone Duo-aanvulling beschikbaar",
    push: "bevestigde aanvulling → push op je telefoon",
    tapsLeft: "tikken over zodra de push binnenkomt",
    steps: [
      { title: "Ken je venster", hint: "de gebruikelijke uren van je winkels staan hieronder · sta 10 min van tevoren klaar" },
      { title: "Zet Apples afrekenpagina klaar", hint: "exacte opslag en kleur → Levering en ophalen" },
      { title: "Accepteer de voorwaarden vooraf · of koop simlockvrij", hint: "simlockvrij en in één keer betaald toont geen vinkje" },
      { title: "Voorkom dat het scherm vergrendelt", hint: "Automatische vergrendeling → Nooit · tik het elke 10–15 min even aan" },
      { title: "Gaat hij af: lees, en ga dan", hint: "Ophalen → de genoemde winkel → eerste tijdvak → Apple Pay" },
    ],
    guide: "De uitleg van twee minuten",
    window: "Jouw aanvulvenster",
  },

  restock: {
    title: "Aanvuluren bij je winkels",
    anyIphone: "iPhone",
    and: " en ",
    yours: (n: number) => (n === 1 ? "jouw winkel" : `jouw ${n$(n)} winkels`),
    Yours: (n: number) => (n === 1 ? "Jouw winkel" : `Jouw ${n$(n)} winkels`),
    otherStores: (n: number) => cnt(n, "extra winkel", "extra winkels"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${cnt(stores, "winkel", "winkels")} · afgelopen ${n$(days)} dagen · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `piekuur bij ${yours} · dan ${then}` : `piekuur bij ${yours}`),
    busiestArea: (stores: number, zone: string) => `piekuur van ${n$(stores)} winkels samen (${zone})`,
    next: (inHours: number) => `volgend venster · ${inHours === 0 ? "dit uur" : `over ${n$(inHours)} u`}`,
    typical: "zo lang blijft een gewone aanvulling beschikbaar",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `nog niets aangevuld bij ${yours} · afgelopen ${n$(days)} dagen` : `aanvullingen bij ${yours} · afgelopen ${n$(days)} dagen${pattern ? "" : " · te weinig voor een patroon"}`),
    byHour: (busiestInGreen: boolean) => `Uur voor uur${busiestInGreen ? " · drukste in groen" : ""}`,
    byWeekday: (busiest: string | null) => `Dag voor dag${busiest ? ` · drukst op ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Per uur (${zone}), ${yours}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Per weekdag, ${yours}: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${n$(n)}${reported ? ` (+${n$(reported)} volgens andere trackers)` : ""}`,
    barTitle: (label: string, n: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${cnt(n, "aanvulling", "aanvullingen")} bij ${yours}${area ? ` · ${n$(area.n)} in de tijdzone ${area.zone}` : ""}${reported ? ` · ${n$(reported)} volgens andere trackers` : ""}`,
    now: "nu",
    allZone: (stores: number, zone: string) => `${n$(stores)} winkels samen, tijdzone ${zone}`,
    reportMarkBars: "Gestreept",
    reportMarkDots: "Holle stippen",
    sellTitle: "Hoe lang aanvullingen bij je winkels duren",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${cnt(stores, "winkel", "winkels")} · afgelopen ${n$(days)} dagen`,
    sellLabel: (yours: string) => `bij ${yours}`,
  },

  success: {
    metaTitle: "Je alerts zijn live",
    isOn: (plan: string) => `${plan} is actief`,
    yourPlan: "Je abonnement",
    received: "Betaling bevestigd",
    onPlan: (limit: number) => `Je abonnement heeft ${n$(limit)} alerts.`,
    planOn: "Je abonnement is actief.",
    pending: "Geef het een minuut: het abonnement verschijnt zo in je account.",
    open: "Naar mijn alerts",
    another: "Nog een alert instellen",
    saved: (n: number) => `${cnt(n, "alert", "alerts")} opgeslagen · Stripe stuurt het betaalbewijs`,
    pushOn: "Meldingen",
    pushNext: "Nog één stap: alerts op je telefoon",
  },

  install: {
    metaTitle: "Download de app — voorraadalerts direct op je toegangsscherm",
    metaDescription: "Zet RestockWire op je beginscherm en je krijgt een melding zodra een iPhone Duo, 18 Pro of Pro Max beschikbaar is om op te halen in een winkel bij jou in de buurt.",
  },

  pricing: {
    metaTitle: "Abonnementen: $5 = 10 alerts, $10 = 20, $20 = 50",
    metaDescription: `Voorraadalerts voor iPhones om op te halen in elke Apple Store in de VS: checks om de ${SPEED.fastSec} seconden op de winkels die je kiest, een push zo'n ${SPEED.alertSec} seconden na een bevestigde aanvulling. Plus $5/maand voor 10 alerts, Pro $10 voor 20, Max $20 voor 50. Altijd opzegbaar.`,
    title: "Prijzen",
    lead: "**Een alert is één winkel × één exacte iPhone.** Al het andere op de site is gratis te lezen.",
    chips: ["Alle 269 Apple Stores in de VS", "Altijd opzegbaar", "Kaart of Link"],
    fastest: "Geen iPhone-voorraadtracker publiceert een korter checkinterval",
    everyFast: `**${SPEED.fastSec} seconden** tussen checks op je winkels · de intervallen die andere trackers publiceren: 8 seconden tot 15 minuten`,
    sellsOut: (band: string) => `**${band}**: zo lang blijft een gewone aanvulling van de iPhone Duo beschikbaar; sommige zijn in 20–30 seconden weg`,
    band: (range: string) => `${range} seconden`,
    aboutMinute: "ongeveer een minuut",
    sameSpeed: "Eén snelheid voor elk abonnement",
    rechecked: "tussen checks op je winkels",
    toPhone: "bevestiging → push op je telefoon",
    listing: "een gewone Duo-aanvulling, van beschikbaar tot weg",
    note: { plus: "1 iPhone × 10 winkels", pro: "2 iPhones × 10 winkels", max: "5 iPhones × 10 winkels" } as Record<string, string>,
    month: "/ maand",
    alerts: (n: number) => `${n$(n)} alerts`,
    perks: [`Checks om de ${SPEED.fastSec} seconden op je winkels, om de ${SPEED.checkSec} seconden op alle 269`, `Een bevestigde aanvulling in zo'n ${SPEED.alertSec} s op je telefoon`],
    cancel: "Altijd opzegbaar",
    get: (plan: string) => `Kies ${plan}`,
    billing: "Gefactureerd via Stripe · kaart of Link · abonnementswijzigingen naar rato verrekend",
    refund: "Bedacht? [Je krijgt binnen 7 dagen je geld volledig terug](/refunds), zolang er nog geen voorraadalert bij je is aangekomen",
  },
};
