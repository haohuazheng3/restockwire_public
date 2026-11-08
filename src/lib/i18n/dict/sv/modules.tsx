/**
 * Swedish strings: modules — the restock, store and stock modules. `label` comes with its own preposition
 * (i Sverige / på Apple Emporia / här). Raw numbers are printed Swedish style (12 345). Cadence: 15 s for every
 * store, 5 s for stores under an alert, nothing else.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, pl } from "./util";

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("sv-SE");
export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number): string => `${days} dagar bakåt ${label}: varken påfyllning eller slutsålt. Första händelsen ger första stapeln.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number): string =>
      `${days} dagar bakåt ${label}: ${pl(restocks, "påfyllning", "påfyllningar")} och ${n(soldouts)} slutsålda, utspritt över ${pl(activeDays, "dag", "dagar")}.`,
    busiest: (day: string, restocks: number) => <> Toppdag: <b className="text-ink">{day}</b>, med {n(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number): string => `${day} – ${pl(restocks, "påfyllning", "påfyllningar")}, ${n(soldouts)} slutsålda`,
    barTitle: (day: string, restocks: number, soldouts: number): string => `${day}: ${pl(restocks, "påfyllning", "påfyllningar")}, ${n(soldouts)} slutsålda`,
    legendSoldouts: "slutsålt",
    legendRestocks: "påfyllt",
  },

  last24: {
    title: (label: string): string => `Senaste dygnet: iPhone Duo-påfyllningar ${label}`,
    asOf: (when: string): string => `avläst ${when}`,
    localTime: (when: string): string => `${when} lokal tid`,
    anAppleStore: "en Apple Store",
    unknown: "Dygnssiffran är inte tillgänglig just nu. Livelagret och loggen på sidan fungerar som vanligt.",
    none: (label: string, asOf: string) => <><b className="text-ink">Senaste dygnet: ingen iPhone Duo-påfyllning {label}</b> (avläst {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>Senaste dygnet: <b className="text-ink">{`iPhone Duo, ${pl(o.restocks, "påfyllning", "påfyllningar")}`} {o.one ? o.label : `${o.label}, i ${o.withStores} av ${o.allStores} Apple Store-butiker`}</b>. Senast in: <b className="text-ink">{o.config}</b>{o.store != null && <> på {o.store}</>}, {o.when} lokal tid.</>
    ),
    tileRestocks: "påfyllningar, bekräftade, 24 tim",
    tileConfigsBack: "konfigurationer tillbaka",
    tileStores: (configs: number, allConfigs: number): string => `butiker med påfyllning${configs ? ` · ${configs}/${allConfigs} konfigurationer` : ""}`,
    tileLatest: (config: string, store: string | null) => <>senast · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>näst senast · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "inget äldre i loggen",
    caption: (label: string, asOf: string): string => `iPhone Duo ${label}, konfiguration för konfiguration: bekräftade påfyllningar senaste dygnet (avläst ${asOf})`,
    thConfig: "Konfiguration",
    thRestocks: "Påfyllningar",
    thStores: "Butiker",
    thLast: "Senast (lokal tid)",
    thNow: "Att hämta nu",
    ofStores: (k: number, total: number): string => `${k}/${total}`,
    noneIn24: "ingen senaste dygnet",
    yes: "ja",
    no: "nej",
    countedTitle: "Vad räknas som påfyllning?",
    counted: "Bara RestockWires egna avläsningar av hämtning i butik på apple.com: var 5:e sekund i butiker med bevakning, var 15:e i övriga. Loggen tar med en påfyllning först när två kontroller visar samma sak. En butiks allra första avläsning räknas aldrig, och siffror från andra bevakningstjänster ingår inte.",
    alert: (label: string | null): string => `Bevaka${label != null ? ` ${label}` : ""} – nästa påfyllning når dig på sekunder`,
  },

  clock: {
    none: (label: string, days: number): string => `${days} dagar bakåt: ännu ingen påfyllning ${label}.`,
    thin: (total: number, label: string, days: number, dates: number | null): string =>
      `${days} dagar bakåt: ${pl(total, "påfyllning", "påfyllningar")} ${label}${dates != null ? `, fördelat på ${pl(dates, "dag", "dagar")}` : ""}. För tunt för en vanlig tid.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>Vanligast: <b className="text-ink">{hour}</b> lokal tid{day ? <>, och <b className="text-ink">{day}ar</b> toppar veckan</> : null}. Underlag: {pl(total, "påfyllning", "påfyllningar")} {label}, {days} dagar bakåt.</>
    ),
    byHour: (zone: string): string => `Timme för timme · ${zone}`,
    byWeekday: "Veckodag för veckodag",
    barReported: (k: number): string => ` (+${k} enligt externa källor)`,
    barReportedTitle: (bar: string, k: number): string => `${bar} · externa källor: ${k}`,
    legendOurs: "RestockWire-bekräftat",
  },

  feed: {
    empty: "Inga poster i loggen ännu.",
    available: "Att hämta",
    soldOut: "Slut",
    soldOutAt: (time: ReactNode) => <>slut {time}</>,
    since: (time: ReactNode) => <>ute sedan {time}</>,
    restockedAt: (time: ReactNode) => <>påfylld {time}</>,
    mapAria: (store: string): string => `${store} på kartan`,
    map: "Kartvy",
    buyAria: (model: string, config: string): string => `${model} ${config}: köp på apple.com`,
    buy: "Köp på apple.com",
  },

  byConfig: {
    empty: (label: string, days: number): string => `Topplistan är tom: ${days} dagar bakåt utan påfyllning ${label}.`,
    intro: (label: string, days: number): string => `Flest gånger tillbaka ${label}, ${days} dagar bakåt – konfiguration för konfiguration.`,
    times: (k: number): string => `${k}×`,
    alert: "Bevaka",
  },

  sellout: {
    typical: (label: string, band: string): string => `iPhone Duo ${label}: en typisk påfyllning låg ute i cirka ${band} innan den tog slut.`,
    half: (label: string, duration: string): string => `Hälften av påfyllningarna ${label} var slut efter ${duration}.`,
    none: (label: string, days: number): string => `${days} dagar bakåt: ingen påfyllning ${label} som också sålt slut.`,
    whatDuo: "iPhone Duo",
    whatAll: "alla iPhone",
    tileHalf: (what: string) => <>halva slut efter · {what}</>,
    tileWithin30: "slut på ≤ 30 s",
    tileWithin60: "slut på ≤ 1 min",
    tileFastest: (k: number, days: number) => <>snabbast av {pl(k, "slutsåld påfyllning", "slutsålda påfyllningar")} · {days} d</>,
    caption: (days: number): string => `iPhone för iPhone, ${days} dagar bakåt`,
    thIphone: "iPhone",
    thSoldOut: "Slut",
    thHalf: "Halva slut efter",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "Snabbast",
    each: "En rad = en påfyllning",
    barNote: (full: string): string => `stapel = sekunder ute · hel rad = ${full}`,
    stillListed: (duration: string): string => `ute fortfarande · ${duration}`,
    approx: (range: string): string => `≈ ${range}`,
    measuredTitle: "Hur tiderna mäts",
    measured: (estimated: boolean): string =>
      `”Slut på 45–60 s” betyder två kontroller: 45 sekunder efter första observationen fanns konfigurationen kvar, 60 sekunder efter var den borta. Intervallets bredd är tiden mellan kontrollerna – 5 sekunder i butiker med bevakning, 15 sekunder i övriga${estimated ? ". Rader med ≈ är äldre än sparandet av senaste kontroll och följer därför 15-sekundersrundan" : ""}. En listning som är kortare än ett intervall kan komma och gå osedd, så den verkliga andelen slut inom 30 sekunder ligger högre än tabellen.`,
  },

  configTable: {
    title: "Butikens alla konfigurationer",
    titleAt: (store: string): string => `${store}: varje konfiguration`,
    lookupOff: (hasRows: boolean): string => `Hämtningssökningen för butiken är avstängd av Apple just nu${hasRows ? " – senaste svaren visas nedan" : ""}`,
    tracked: (k: number): string => `${k} konfigurationer under bevakning`,
    firstSweep: "Första kontrollrundan pågår · status inom en minut",
    inStock: (k: number, total: number): string => `${k}/${total} att hämta`,
    available: "Att hämta",
    unavailable: "Ej att hämta",
    noLookup: "hämtningssökning saknas",
    notChecked: "ej kontrollerad",
    since: (ago: ReactNode) => <>ute sedan {ago}</>,
    lastAvailable: (ago: ReactNode) => <>senast ute {ago}</>,
    neverHere: "aldrig listad i butiken",
    buy: "Köp",
    alertAria: (model: string, config: string, store: string): string => `Bevaka ${model} ${config} på ${store}`,
    alert: "Bevaka →",
  },

  matrix: {
    store: "Butik",
    checked: "Kontroll",
    cellTitle: (model: string, k: number, total: number): string => `${model} · ${k}/${total} konfigurationer att hämta`,
  },

  nearby: {
    noDuo: (short: string): string => `${short} saknas`,
    duo: (short: string, k: number): string => `${short}: ${k}`,
  },

  stockByModel: {
    lookupOff: "Hämtningssökningen för butiken är avstängd av Apple just nu",
    availableNow: (k: number, total: number): string => `${k}/${total} konfigurationer att hämta nu`,
    noneNow: (total: number): string => `0/${total} konfigurationer just nu`,
    notChecked: "ej kontrollerad",
    more: (k: number): string => `+${k}`,
    checked: (ago: ReactNode) => <>avläst {ago}</>,
    alert: "Bevaka →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Avläst {ago} · var 5:e sekund med bevakning, annars var 15:e</>,
    map: "Kartvy",
    alert: "Bevaka butiken",
    alsoIn: (region: string): string => `Fler i ${region}`,
    acrossLine: "Närmast över delstatsgränsen",
    elsewhere: "Närmast i övrigt",
  },

  hours: {
    title: "Öppet",
    local: (zone: string): string => `${zone} (lokal tid)`,
    today: (hours: string, week: string): string => ` · i dag ${hours} · ${week}`,
    directions: "Hitta dit",
    applePage: "apple.com-sidan för butiken",
    liveMap: "Livekarta",
    storePage: "Butikens sida",
    closed: "Stängt",
    everyDay: (hours: string): string => `Varje dag ${hours}`,
    openNow: (closes: string): string => `Öppet · stänger kl. ${closes}`,
    opensAt: (opens: string): string => `Öppnar kl. ${opens}`,
    closedToday: (next: string | null): string => (next ? `Stängt i dag · öppnar ${next}` : "Stängt i dag"),
    closedNow: (next: string | null): string => (next ? `Stängt · öppnar ${next}` : "Stängt för tillfället"),
    nextOpen: (day: string | null, time: string): string => `${day ?? "i morgon"} kl. ${time}`,
  },

  liveStats: {
    inStock: "Att hämta nu",
    storesWith: "Butiker med lager",
    lastCheck: "Senast avläst",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string): string => `${short} just nu: ${k} av ${stores} butiker`,
    lastCheck: (ago: ReactNode) => <>Senast avläst {ago}</>,
    firstSweep: "Första kontrollrundan pågår.",
    noneListed: (model: string, storage: string | null, color: string | null): string => `${model}${storage ? ` ${storage}` : ""}${color ? ` i ${color}` : ""} finns inte att hämta någonstans just nu.`,
    more: (k: number): string => `+${k}`,
    seen: (ago: ReactNode) => <>Ute {ago}</>,
    loading: "Hämtar lagerläget",
  },
  /** WireNow: bulletinen som region-, stads-, butiks-, lands- och iPhone Duo-sidor öppnar med. `label` kommer med preposition („i Stockholm", „hos Apple Täby Centrum"); alla siffror gäller 14 dagar. */
  wireNow: {
    eyebrow: (label: string): string => `På tråden · iPhone Duo ${label}`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>Senast listad: <b className="text-ink">{o.config}</b>{o.store != null && <> hos {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number): string => `Ingen iPhone Duo-listning bekräftad ${label} de senaste ${WN(days)} dagarna.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">Listad just nu i {WN(o.k)} av {WN(o.n)} butiker</b> {o.label} (avläst {o.stamp}): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">Listad just nu: {o.k} av {o.total} konfigurationer</b> hos {o.name} (avläst {o.stamp}): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">Inget listat kl. {o.stamp}</b>: ingen av de {WN(o.n)} Apple Store {o.label} visar någon iPhone Duo för hämtning.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">Inget listat kl. {o.stamp}</b>: {o.name} visar ingen iPhone Duo-konfiguration för hämtning.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} konfig.)</>,
    configItem: (config: string): string => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }): string => (o.one ? `iPhone 18 Pro: ${o.pro} av ${o.configs} konfigurationer här; 18 Pro Max: ${o.max}.` : `iPhone 18 Pro finns i ${o.pro} av dem, 18 Pro Max i ${o.max}.`),
    tRestocks: (days: number): string => `Duo-påfyllningar, senaste ${WN(days)} dagarna`,
    tGone60: "av de tidtagna listningarna borta inom en minut",
    tLongest: "veckans längsta listning",
    tWindow: (range: string): string => `av påfyllningarna kom ${range}`,
    tToday: "påfyllningar i dag hittills",
    tStores: (n: number): string => `av ${WN(n)} butiker fick påfyllning under perioden`,
    wireTime: (stamp: string): string => `Trådtid ${stamp}`,
    reads: (note: string): string => `avläsning ${note}`,
    window: (days: number): string => `${WN(days)}-dagarsfönster`,
    method: "en påfyllning räknas först när två avläsningar stämmer överens; en butiks första observation räknas aldrig",
    zone: (): string => "butikens lokala tid",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }): string =>
      `${o.range} ${o.zone}: då kommer iPhone Duo tillbaka ${o.label}. Det fönstret tog ${o.pct} av de ${WN(o.n)} påfyllningar som RestockWire loggade ${o.one ? "här" : `i ${WN(o.stores)} Apple Store ${o.label}`} de senaste ${WN(o.days)} dagarna. Toppen ${o.busiest}, ${WN(o.busiestN)} påfyllningar.${o.config ? ` ${o.config} kom tillbaka oftast (${WN(o.k)} av ${WN(o.n)}).` : ""}${o.median ? ` Medianlistning: borta efter ${o.median}.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }): string => `${WN(o.n)} iPhone Duo-påfyllning${o.n === 1 ? "" : "ar"} ${o.one ? o.label : `i de ${WN(o.stores)} Apple Store ${o.label}`} de senaste ${WN(o.days)} dagarna: för få för en vanlig timme. Var och en står nedan.`,
    hourByHour: "Varje timme, varje butik →",
    lastThree: (n: number, label: string): string => (n === 1 ? `Senaste Duo-listningen ${label}` : `De ${WN(n)} senaste Duo-listningarna ${label}`),
    secs: (n: number): string => `${WN(n)} s`,
    mins: (n: number): string => `${WN(n)} min`,
    upRange: (low: string, high: string): string => `listad ${low}–${high}`,
    upAbout: (x: string): string => `listad omkring ${x}`,
    stillUp: (x: string): string => `fortfarande listad (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }): string => (o.one
      ? `${WN(o.sent)} avisering${o.sent === 1 ? "" : "ar"} gick ut för Duo-påfyllningar ${o.label} de senaste ${WN(o.days)} dagarna.`
      : `${WN(o.sent)} avisering${o.sent === 1 ? "" : "ar"} gick ut för Duo-påfyllningar i ${WN(o.stores)} av de ${WN(o.total)} butikerna ${o.label} de senaste ${WN(o.days)} dagarna.`),
    alertMe: (name: string): string => `Lägg ${name} på 5-sekunderstråden`,
    unknown: "Mönstersiffrorna gick inte att läsa den här gången; listningen ovan är live.",
    allModels: (o: { n: number; days: number; peak: string | null }): string => `Alla tre iPhone tillsammans: ${WN(o.n)} påfyllningar på ${WN(o.days)} dagar${o.peak ? `, topp ${o.peak}` : ""}.`,
  },
};
