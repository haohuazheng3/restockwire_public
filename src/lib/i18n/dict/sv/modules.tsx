/**
 * Swedish strings: modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("i Sverige", "på Apple Emporia", "här"); numbers arrive raw and are written Swedish style (12 345).
 * Check intervals are only ever 15 seconds (every store) and 5 seconds (stores with alerts).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, pl } from "./util";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Inget att visa ${label} än: ingen påfyllning och inget slutsålt de senaste ${days} dagarna. Den första ritar den första stapeln.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${pl(restocks, "påfyllning", "påfyllningar")} och ${n(soldouts)} slutsålda ${label} de senaste ${days} dagarna, fördelade på ${pl(activeDays, "dag", "dagar")}.`,
    busiest: (day: string, restocks: number) => <> Största dagen, <b className="text-ink">{day}</b>, gav {n(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${pl(restocks, "påfyllning", "påfyllningar")} och ${n(soldouts)} slutsålda`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${pl(restocks, "påfyllning", "påfyllningar")} · ${n(soldouts)} slutsålda`,
    legendRestocks: "påfyllningar",
    legendSoldouts: "slutsålda",
  },

  last24: {
    title: (label: string) => `Påfyllningar av iPhone Duo ${label} under de senaste 24 timmarna`,
    asOf: (when: string) => `läst ${when}`,
    localTime: (when: string) => `${when} lokal tid`,
    anAppleStore: "en Apple Store",
    unknown: "Antalet för 24 timmar går inte att visa just nu; lagret live och påfyllningsloggen på sidan påverkas inte.",
    none: (label: string, asOf: string) => <><b className="text-ink">Noll påfyllningar av iPhone Duo {label} de senaste 24 timmarna</b> (läst {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${pl(o.restocks, "påfyllning", "påfyllningar")} av iPhone Duo`} {o.one ? o.label : `i ${o.withStores} av ${o.allStores} Apple Store-butiker ${o.label}`}</b> de senaste 24 timmarna; den senaste var en <b className="text-ink">{o.config}</b>{o.store != null && <> på {o.store}</>}, {o.when} lokal tid.</>
    ),
    tileRestocks: "bekräftade påfyllningar på 24 tim",
    tileConfigsBack: "konfigurationer som dök upp igen",
    tileStores: (configs: number, allConfigs: number) => `butiker som fyllde på${configs ? ` · ${configs} av ${allConfigs} konfigurationer` : ""}`,
    tileLatest: (config: string, store: string | null) => <>senaste · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>den före · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "inget tidigare registrerat",
    caption: (label: string, asOf: string) => `Varje konfiguration av iPhone Duo ${label}: bekräftade påfyllningar de senaste 24 timmarna, läst ${asOf}`,
    thConfig: "Konfiguration",
    thRestocks: "Påfyllningar",
    thStores: "Butiker",
    thLast: "Senaste påfyllning (lokal tid)",
    thNow: "Listad nu",
    ofStores: (k: number, total: number) => `${k} av ${total}`,
    noneIn24: "ingen på 24 tim",
    yes: "ja",
    no: "nej",
    countedTitle: "Det här räknas som en påfyllning",
    counted: "Det här är RestockWires egna avläsningar av hämtning i butik på apple.com: varje butik var 15:e sekund, butiker med bevakning var 5:e. En påfyllning hamnar i loggen först när två kontroller stämmer överens; första gången en butik läses räknas inte; inget som andra bevakningstjänster publicerar blandas in.",
    alert: (label: string | null) => `Få notiser${label != null ? ` ${label}` : ""}: nästa når dig på några sekunder`,
  },

  clock: {
    none: (label: string, days: number) => `Ingen påfyllning ${label} de senaste ${days} dagarna hittills.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${pl(total, "påfyllning", "påfyllningar")} ${label} de senaste ${days} dagarna${dates != null ? ` (på ${pl(dates, "dag", "dagar")})` : ""}: inte nog än för att peka ut en vanlig tid.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{pl(total, "påfyllning", "påfyllningar")} {label} de senaste {days} dagarna. Den vanliga tiden är <b className="text-ink">{hour}</b> lokal tid{day ? <>; <b className="text-ink">{day}ar</b> ger flest</> : null}.</>
    ),
    byHour: (zone: string) => `Per timme · ${zone}`,
    byWeekday: "Per veckodag",
    barReported: (k: number) => ` (+${k} rapporterade av andra bevakningstjänster)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${k} rapporterade av andra bevakningstjänster`,
    legendOurs: "Bekräftat av RestockWire",
  },

  feed: {
    empty: "Loggen är tom än så länge.",
    available: "Tillgänglig",
    soldOut: "Slutsåld",
    soldOutAt: (time: ReactNode) => <>borta {time}</>,
    since: (time: ReactNode) => <>listad sedan {time}</>,
    restockedAt: (time: ReactNode) => <>tillbaka {time}</>,
    mapAria: (store: string) => `Hitta ${store} på kartan`,
    map: "Karta",
    buyAria: (model: string, config: string) => `Beställ ${model} ${config} på apple.com`,
    buy: "Beställ på apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Ingen topplista än: inget har fyllts på ${label} de senaste ${days} dagarna.`,
    intro: (label: string, days: number) => `Konfigurationerna som kom tillbaka ${label} de senaste ${days} dagarna, rankade efter hur ofta.`,
    times: (k: number) => `${k}×`,
    alert: "Få notiser",
  },

  sellout: {
    typical: (label: string, band: string) => `En typisk påfyllning av iPhone Duo ${label} varade i ungefär ${band} innan den sålde slut.`,
    half: (label: string, duration: string) => `${duration}: så lång tid tog det innan hälften av påfyllningarna ${label} var slutsålda.`,
    none: (label: string, days: number) => `Inget ${label} har fyllts på och sedan sålt slut de senaste ${days} dagarna.`,
    whatDuo: "iPhone Duo",
    whatAll: "alla iPhone",
    tileHalf: (what: string) => <>hälften borta inom · {what}</>,
    tileWithin30: "borta inom 30 s",
    tileWithin60: "borta inom 1 min",
    tileFastest: (k: number, days: number) => <>snabbast · {pl(k, "slutsåld påfyllning", "slutsålda påfyllningar")}, {days} d</>,
    caption: (days: number) => `Per iPhone, senaste ${days} dagarna`,
    thIphone: "iPhone",
    thSoldOut: "Slutsålda",
    thHalf: "Hälften borta inom",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Snabbast",
    each: "En rad per påfyllning",
    barNote: (full: string) => `stapelns längd = sekunder listad · ${full} fyller raden`,
    stillListed: (duration: string) => `fortfarande listad · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Så mäts tiderna",
    measured: (estimated: boolean) =>
      `En rad som säger ”slutsåld på 45–60 s” betyder att vår kontroll 45 sekunder efter första observationen fortfarande hittade konfigurationen listad, och att kontrollen 60 sekunder efter hittade den borta. Bredden på varje intervall är glappet mellan kontrollerna: 5 sekunder i butiker med bevakning, 15 sekunder överallt annars${estimated ? "; rader märkta ≈ är från innan vi sparade den senaste kontrollen och begränsas i stället av 15-sekundersvarvet" : ""}. En listning kortare än ett glapp kan dyka upp och försvinna mellan två kontroller, så den verkliga andelen som är borta inom 30 sekunder är högre än tabellen visar.`,
  },

  configTable: {
    title: "Alla konfigurationer i den här butiken",
    titleAt: (store: string) => `Alla konfigurationer på ${store}`,
    lookupOff: (hasRows: boolean) => `Apple har stängt av sökning efter hämtning i butik för den här butiken just nu${hasRows ? " (de senaste svaren listas nedan)" : ""}`,
    tracked: (k: number) => `${k} konfigurationer bevakas`,
    firstSweep: "Första kontrollvarvet pågår · status fylls i inom en minut",
    inStock: (k: number, total: number) => `${k} av ${total} listade`,
    available: "Tillgänglig",
    unavailable: "Inte tillgänglig",
    noLookup: "ingen sökning efter hämtning",
    notChecked: "inte kollad än",
    since: (ago: ReactNode) => <>listad sedan {ago}</>,
    lastAvailable: (ago: ReactNode) => <>senast listad {ago}</>,
    neverHere: "aldrig listad här hittills",
    buy: "Beställ",
    alertAria: (model: string, config: string, store: string) => `Få en notis när ${store} listar ${model} ${config}`,
    alert: "Få notiser →",
  },

  matrix: {
    store: "Butik",
    checked: "Kollad",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${k} av ${total} konfigurationer listade`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${k}`,
    noDuo: (short: string) => `ingen ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${k} av ${total} konfigurationer listade nu`,
    noneNow: (total: number) => `0 av ${total} konfigurationer just nu`,
    lookupOff: "Apple har stängt av sökning efter hämtning för den här butiken just nu",
    notChecked: "inte kollad än",
    more: (k: number) => `+${k}`,
    checked: (ago: ReactNode) => <>läst {ago}</>,
    alert: "Få notiser →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Läst {ago} · var 15:e sekund, var 5:e med bevakning</>,
    map: "Visa på kartan",
    alert: "Bevaka den här butiken",
    alsoIn: (region: string) => `Mer i ${region}`,
    acrossLine: "Närmaste butikerna på andra sidan delstatsgränsen",
    elsewhere: "Närmaste butikerna längre bort",
  },

  hours: {
    title: "Öppettider",
    local: (zone: string) => `Lokal tid · ${zone}`,
    today: (hours: string, week: string) => ` · idag ${hours} · ${week}`,
    directions: "Vägbeskrivning",
    applePage: "butiken på apple.com",
    liveMap: "Livekarta",
    storePage: "Butikssida",
    closed: "Stängt",
    everyDay: (hours: string) => `Alla dagar ${hours}`,
    openNow: (closes: string) => `Öppet nu · stänger kl. ${closes}`,
    opensAt: (opens: string) => `Öppnar kl. ${opens}`,
    closedToday: (next: string | null) => (next ? `Stängt idag · öppnar ${next}` : "Stängt idag"),
    closedNow: (next: string | null) => (next ? `Stängt nu · öppnar ${next}` : "Stängt nu"),
    nextOpen: (day: string | null, time: string) => `${day ?? "i morgon"} kl. ${time}`,
  },

  liveStats: {
    inStock: "Listade nu",
    storesWith: "Butiker m. lager",
    lastCheck: "Senaste kontroll",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${k} av ${stores} butiker listar ${short} just nu`,
    lastCheck: (ago: ReactNode) => <>Senaste kontroll {ago}</>,
    firstSweep: "Första kontrollvarvet pågår.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Just nu listar ingen butik ${model}${storage ? ` ${storage}` : ""}${color ? ` i ${color}` : ""}.`,
    more: (k: number) => `+${k}`,
    seen: (ago: ReactNode) => <>Listad {ago}</>,
    loading: "Laddar lager",
  },
};
