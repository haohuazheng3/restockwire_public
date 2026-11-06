/**
 * Dutch strings: modules — the restock, store and stock modules. `label` is a place phrase the page builds
 * ("in Noord-Holland", "bij Apple Haarlem", "hier"); numbers arrive raw and are formatted here.
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import { colorLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";

const L = "nl" as const;
const n$ = (v: number) => num(L, v);
/** "1 aanvulling", "3 aanvullingen". */
const cnt = (n: number, one: string, many: string) => `${n$(n)} ${n === 1 ? one : many}`;
/** Same facts as CHECK_NOTE in lib/plans.ts. */
const CHECK = "elke 15 s, 5 s met een alert";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Nog niets in beeld ${label}: geen aanvulling of uitverkoop in de afgelopen ${n$(days)} dagen. De eerste tekent de eerste balk.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${cnt(restocks, "aanvulling", "aanvullingen")} en ${cnt(soldouts, "uitverkoop", "uitverkopen")} ${label} in de afgelopen ${n$(days)} dagen, verspreid over ${cnt(activeDays, "dag", "dagen")}.`,
    busiest: (day: string, restocks: number) => <> De grootste dag, <b className="text-ink">{day}</b>, bracht er {n$(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${cnt(restocks, "aanvulling", "aanvullingen")} en ${cnt(soldouts, "uitverkoop", "uitverkopen")}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${cnt(restocks, "aanvulling", "aanvullingen")} · ${cnt(soldouts, "uitverkoop", "uitverkopen")}`,
    legendRestocks: "aanvullingen",
    legendSoldouts: "uitverkopen",
  },

  last24: {
    title: (label: string) => `De laatste 24 uur aan iPhone Duo-aanvullingen ${label}`,
    asOf: (when: string) => `gelezen om ${when}`,
    localTime: (when: string) => `${when} lokale tijd`,
    anAppleStore: "een Apple Store",
    unknown: "Het aantal van de afgelopen 24 uur is op dit moment niet beschikbaar; de live voorraad en het voorraadlogboek op deze pagina werken gewoon.",
    none: (label: string, asOf: string) => <><b className="text-ink">Geen enkele iPhone Duo-aanvulling {label} in de afgelopen 24 uur</b> (gelezen om {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${cnt(o.restocks, "iPhone Duo-aanvulling", "iPhone Duo-aanvullingen")}`} {o.one ? o.label : `bij ${n$(o.withStores)} van de ${n$(o.allStores)} Apple Store${o.allStores === 1 ? "" : "s"} ${o.label}`}</b> in de afgelopen 24 uur; de nieuwste was een <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, {o.when} lokale tijd.</>
    ),
    tileRestocks: "bevestigde aanvullingen in 24 u",
    tileConfigsBack: "configuraties die terugkwamen",
    tileStores: (configs: number, allConfigs: number) => `winkels die aanvulden${configs ? ` · ${n$(configs)} van ${n$(allConfigs)} configuraties` : ""}`,
    tileLatest: (config: string, store: string | null) => <>nieuwste · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>de vorige · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "niets eerders vastgelegd",
    caption: (label: string, asOf: string) => `Elke configuratie van de iPhone Duo ${label}: bevestigde aanvullingen in de afgelopen 24 uur, gelezen om ${asOf}`,
    thConfig: "Configuratie",
    thRestocks: "Aanvullingen",
    thStores: "Winkels",
    thLast: "Nieuwste aanvulling (lokale tijd)",
    thNow: "Nu beschikbaar",
    ofStores: (n: number, total: number) => `${n$(n)} van ${n$(total)}`,
    noneIn24: "geen in 24 u",
    yes: "ja",
    no: "nee",
    countedTitle: "Wat hier als aanvulling telt",
    counted: "Dit zijn de eigen metingen van RestockWire van ophalen in de winkel op apple.com: elke winkel elke 15 seconden, winkels met alerts elke 5 seconden. Een aanvulling komt pas in het logboek als twee checks het eens zijn; de allereerste meting van een winkel telt niet mee; niets wat andere trackers publiceren wordt erbij gemengd.",
    alert: (label: string | null) => `Zet een alert${label != null ? ` ${label}` : ""}: de volgende staat binnen seconden op je telefoon`,
  },

  clock: {
    none: (label: string, days: number) => `Nog geen aanvulling ${label} in de afgelopen ${n$(days)} dagen.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${cnt(total, "aanvulling", "aanvullingen")} ${label} in de afgelopen ${n$(days)} dagen${dates != null ? ` (op ${cnt(dates, "dag", "dagen")})` : ""}: nog niet genoeg om een vast uur te noemen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{cnt(total, "aanvulling", "aanvullingen")} {label} in de afgelopen {n$(days)} dagen. Het gebruikelijke uur is <b className="text-ink">{hour}</b> lokale tijd{day ? <>; <b className="text-ink">{day}</b> brengt de meeste</> : null}.</>
    ),
    byHour: (zone: string) => `Per uur · ${zone}`,
    byWeekday: "Per weekdag",
    barReported: (n: number) => ` (+${n$(n)} gemeld door andere trackers)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${n$(n)} gemeld door andere trackers`,
    legendOurs: "Bevestigd door RestockWire",
  },

  feed: {
    empty: "Het logboek is nog leeg.",
    available: "Beschikbaar",
    soldOut: "Uitverkocht",
    soldOutAt: (time: ReactNode) => <>weg {time}</>,
    since: (time: ReactNode) => <>beschikbaar sinds {time}</>,
    restockedAt: (time: ReactNode) => <>terug {time}</>,
    mapAria: (store: string) => `Zoek ${store} op de kaart`,
    map: "Kaart",
    buyAria: (model: string, config: string) => `Bestel de ${model} ${config} op apple.com`,
    buy: "Bestel op apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Nog geen ranglijst: er is ${label} niets aangevuld in de afgelopen ${n$(days)} dagen.`,
    intro: (label: string, days: number) => `De configuraties die ${label} terugkwamen in de afgelopen ${n$(days)} dagen, gerangschikt op hoe vaak.`,
    times: (n: number) => `${n$(n)}×`,
    alert: "Alerts instellen",
  },

  sellout: {
    typical: (label: string, band: string) => `Een gewone iPhone Duo-aanvulling ${label} bleef zo'n ${band} beschikbaar voordat hij uitverkocht was.`,
    half: (label: string, duration: string) => `${duration}: zo lang duurde het voordat de helft van de aanvullingen ${label} uitverkocht was.`,
    none: (label: string, days: number) => `Er is ${label} in de afgelopen ${n$(days)} dagen niets aangevuld en daarna uitverkocht.`,
    whatDuo: "iPhone Duo",
    whatAll: "alle iPhones",
    tileHalf: (what: string) => <>helft weg binnen · {what}</>,
    tileWithin30: "weg binnen 30 s",
    tileWithin60: "weg binnen 1 min",
    tileFastest: (n: number, days: number) => <>snelste · {cnt(n, "uitverkochte aanvulling", "uitverkochte aanvullingen")}, {n$(days)} d</>,
    caption: (days: number) => `Per iPhone, afgelopen ${n$(days)} dagen`,
    thIphone: "iPhone",
    thSoldOut: "Uitverkocht",
    thHalf: "Helft weg binnen",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Snelste",
    each: "Eén rij per aanvulling",
    barNote: (full: string) => `balklengte = seconden beschikbaar · ${full} vult de rij`,
    stillListed: (duration: string) => `nog beschikbaar · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Zo worden deze tijden gemeten",
    measured: (estimated: boolean) =>
      `Een rij met “uitverkocht in 45–60 s” betekent: onze check 45 seconden na de eerste waarneming vond de configuratie nog beschikbaar, en de check 60 seconden erna vond hem weg. De breedte van elk bereik is de tijd tussen twee checks: 5 seconden bij winkels met alerts, 15 seconden overal elders${estimated ? "; rijen met ≈ zijn van vóór we de laatste check opsloegen en worden in plaats daarvan begrensd door de ronde van 15 seconden" : ""}. Een aanbod dat korter duurt dan één tussenpoos kan tussen twee checks verschijnen en verdwijnen, dus het echte aandeel dat binnen 30 seconden weg is, ligt hoger dan de tabel laat zien.`,
  },

  configTable: {
    title: "Alle configuraties in deze winkel",
    titleAt: (store: string) => `Alle configuraties bij ${store}`,
    lookupOff: (hasRows: boolean) => `Apple heeft het opvragen van ophaalvoorraad voor deze winkel op dit moment uitgezet${hasRows ? " (de meest recente antwoorden staan hieronder)" : ""}`,
    tracked: (n: number) => `${n$(n)} configuraties gevolgd`,
    firstSweep: "Eerste ronde loopt · de status verschijnt binnen een minuut",
    inStock: (n: number, total: number) => `${n$(n)} van ${n$(total)} beschikbaar`,
    available: "Beschikbaar",
    unavailable: "Niet beschikbaar",
    noLookup: "geen ophaalgegevens",
    notChecked: "nog niet gecheckt",
    since: (ago: ReactNode) => <>beschikbaar sinds {ago}</>,
    lastAvailable: (ago: ReactNode) => <>laatst beschikbaar {ago}</>,
    neverHere: "hier tot nu toe nooit beschikbaar geweest",
    buy: "Bestel",
    alertAria: (model: string, config: string, store: string) => `Krijg een alert zodra ${store} de ${model} ${config} beschikbaar heeft`,
    alert: "Alerts instellen →",
  },

  matrix: {
    store: "Winkel",
    checked: "Gecheckt",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${n$(n)} van ${n$(total)} configuraties beschikbaar`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${n$(n)}`,
    noDuo: (short: string) => `geen ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${n$(n)} van ${n$(total)} configuraties nu beschikbaar`,
    noneNow: (total: number) => `0 van ${n$(total)} configuraties op dit moment`,
    lookupOff: "Apple heeft het opvragen van ophaalvoorraad voor deze winkel op dit moment uitgezet",
    notChecked: "nog niet gecheckt",
    more: (n: number) => `+${n$(n)}`,
    checked: (ago: ReactNode) => <>gelezen {ago}</>,
    alert: "Alerts instellen →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Gelezen {ago} · {CHECK}</>,
    map: "Bekijk op de kaart",
    alert: "Volg deze winkel",
    alsoIn: (region: string) => `Meer in ${region}`,
    acrossLine: "Dichtstbijzijnde winkels over de staatsgrens",
    elsewhere: "Dichtstbijzijnde winkels verder weg",
  },

  hours: {
    title: "Openingstijden",
    local: (zone: string) => `Lokale tijd · ${zone}`,
    today: (hours: string, week: string) => ` · vandaag ${hours} · ${week}`,
    directions: "Route",
    applePage: "deze winkel op apple.com",
    liveMap: "Live kaart",
    storePage: "Winkelpagina",
    closed: "Gesloten",
    everyDay: (hours: string) => `Elke dag ${hours}`,
    openNow: (closes: string) => `Nu open · sluit om ${closes}`,
    opensAt: (opens: string) => `Open vanaf ${opens}`,
    closedToday: (next: string | null) => (next ? `Vandaag gesloten · open ${next}` : "Vandaag gesloten"),
    closedNow: (next: string | null) => (next ? `Nu gesloten · open ${next}` : "Nu gesloten"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} om ${time}`,
  },

  liveStats: {
    inStock: "Nu beschikbaar",
    storesWith: "Winkels met voorraad",
    lastCheck: "Laatste check",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${n$(n)} van de ${n$(stores)} winkels ${n === 1 ? "heeft" : "hebben"} de ${short} nu beschikbaar`,
    lastCheck: (ago: ReactNode) => <>Laatste check {ago}</>,
    firstSweep: "Eerste ronde loopt.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Op dit moment heeft geen enkele winkel de ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${colorLabel(color, L)}` : ""} beschikbaar.`,
    more: (n: number) => `+${n$(n)}`,
    seen: (ago: ReactNode) => <>Beschikbaar {ago}</>,
    loading: "Voorraad wordt geladen",
  },
};
