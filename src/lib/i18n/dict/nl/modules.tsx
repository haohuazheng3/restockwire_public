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

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("nl-NL");
export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Nog niets in beeld ${label}: geen aanvulling of uitverkoop in de afgelopen ${n$(days)} dagen. De eerste tekent de eerste balk.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${n$(days)} dagen ${label}: ${cnt(restocks, "keer terug", "keer terug")}, ${cnt(soldouts, "keer uitverkocht", "keer uitverkocht")}, op ${cnt(activeDays, "actieve dag", "actieve dagen")}.`,
    busiest: (day: string, restocks: number) => <> De grootste dag, <b className="text-ink">{day}</b>, bracht er {n$(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${cnt(restocks, "aanvulling", "aanvullingen")} en ${cnt(soldouts, "uitverkoop", "uitverkopen")}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · terug ${n$(restocks)}× · weg ${n$(soldouts)}×`,
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
      <>Laatste 24 uur: <b className="text-ink">{`${n$(o.restocks)}× iPhone Duo terug`} {o.one ? o.label : `in ${n$(o.withStores)} van ${n$(o.allStores)} Apple Store${o.allStores === 1 ? "" : "s"} ${o.label}`}</b>. Meest recent: <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, om {o.when} ter plaatse.</>
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
    none: (label: string, days: number) => `${n$(days)} dagen gevolgd ${label}, nog geen enkele keer terug.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${cnt(total, "aanvulling", "aanvullingen")} ${label} in de afgelopen ${n$(days)} dagen${dates != null ? ` (op ${cnt(dates, "dag", "dagen")})` : ""}: nog niet genoeg om een vast uur te noemen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{cnt(total, "aanvulling", "aanvullingen")} {label} in de afgelopen {n$(days)} dagen. Het gebruikelijke uur is <b className="text-ink">{hour}</b> lokale tijd{day ? <>; <b className="text-ink">{day}</b> brengt de meeste</> : null}.</>
    ),
    byHour: (zone: string) => `Per uur · ${zone}`,
    byWeekday: "Weekdag voor weekdag",
    barReported: (n: number) => ` (+${n$(n)} via andere trackers)`,
    barReportedTitle: (bar: string, n: number) => `${bar} · ${n$(n)} via andere trackers`,
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
    map: "Op kaart",
    buyAria: (model: string, config: string) => `${model} ${config} kopen op apple.com`,
    buy: "Bestel op apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Nog geen ranglijst: er is ${label} niets aangevuld in de afgelopen ${n$(days)} dagen.`,
    intro: (label: string, days: number) => `Wat ${label} het vaakst terugkwam, ${n$(days)} dagen, meeste eerst.`,
    times: (n: number) => `${n$(n)}×`,
    alert: "Alerts instellen",
  },

  sellout: {
    typical: (label: string, band: string) => `Een gewone iPhone Duo-aanvulling ${label} bleef zo'n ${band} beschikbaar voordat hij uitverkocht was.`,
    half: (label: string, duration: string) => `Na ${duration} was de helft van de aanvullingen ${label} alweer op.`,
    none: (label: string, days: number) => `Geen meetbare uitverkoop ${label}: ${n$(days)} dagen zonder aanvulling die weer opraakte.`,
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
    cellTitle: (model: string, n: number, total: number) => `${model} · ${n$(n)}/${n$(total)} configuraties klaar`,
  },

  nearby: {
    duo: (short: string, n: number) => `${n$(n)}× ${short}`,
    noDuo: (short: string) => `geen ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `Nu ${n$(n)}/${n$(total)} configuraties te halen`,
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
    acrossLine: "Net over de staatsgrens",
    elsewhere: "Dichtstbijzijnde winkels verder weg",
  },

  hours: {
    title: "Openingstijden",
    local: (zone: string) => `Lokale tijd · ${zone}`,
    today: (hours: string, week: string) => ` · ${hours} vandaag · ${week}`,
    directions: "Route",
    applePage: "deze winkel op apple.com",
    liveMap: "Live kaart",
    storePage: "Winkelpagina",
    closed: "Gesloten",
    everyDay: (hours: string) => `Elke dag ${hours}`,
    openNow: (closes: string) => `Open tot ${closes}`,
    opensAt: (opens: string) => `Open vanaf ${opens}`,
    closedToday: (next: string | null) => (next ? `Dicht vandaag · weer open ${next}` : "Dicht vandaag"),
    closedNow: (next: string | null) => (next ? `Nu dicht · weer open ${next}` : "Nu dicht"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"}, ${time}`,
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
  /** WireNow: het bulletin waarmee regio-, stads-, winkel-, land- en iPhone Duo-pagina's openen. `label` komt met voorzetsel („in Amsterdam", „bij Apple Amsterdam"); alle cijfers gaan over 14 dagen. */
  wireNow: {
    eyebrow: (label: string) => `Op de draad · iPhone Duo ${label}`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>Laatst vermeld: <b className="text-ink">{o.config}</b>{o.store != null && <> bij {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number) => `Geen iPhone Duo-vermelding bevestigd ${label} in de laatste ${WN(days)} dagen.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">Nu vermeld bij {WN(o.k)} van {WN(o.n)} winkels</b> {o.label} (gelezen {o.stamp}): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">Nu vermeld: {o.k} van {o.total} configuraties</b> bij {o.name} (gelezen {o.stamp}): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">Niets vermeld om {o.stamp}</b>: geen van de {WN(o.n)} Apple Stores {o.label} toont een iPhone Duo om af te halen.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">Niets vermeld om {o.stamp}</b>: {o.name} toont geen enkele iPhone Duo-configuratie om af te halen.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} config.)</>,
    configItem: (config: string) => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro: ${o.pro} van ${o.configs} configuraties hier; 18 Pro Max: ${o.max}.` : `De iPhone 18 Pro ligt bij ${o.pro} ervan, de 18 Pro Max bij ${o.max}.`),
    tRestocks: (days: number) => `Duo-aanvullingen, laatste ${WN(days)} dagen`,
    tGone60: "van de getimede vermeldingen binnen een minuut weg",
    tLongest: "langste vermelding van deze week",
    tWindow: (range: string) => `van de aanvullingen viel ${range}`,
    tToday: "aanvullingen vandaag tot nu toe",
    tStores: (n: number) => `van ${WN(n)} winkels hadden in de periode een aanvulling`,
    wireTime: (stamp: string) => `Draadtijd ${stamp}`,
    reads: (note: string) => `gelezen ${note}`,
    window: (days: number) => `venster van ${WN(days)} dagen`,
    method: "een aanvulling telt pas als twee lezingen overeenkomen; de eerste waarneming van een winkel telt nooit",
    zone: () => "tijd ter plaatse",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }) =>
      `${o.range} ${o.zone}: dan komt de iPhone Duo terug ${o.label}. Dat venster nam ${o.pct} van de ${WN(o.n)} aanvullingen die RestockWire ${o.one ? "hier" : `bij ${WN(o.stores)} Apple Stores ${o.label}`} in de laatste ${WN(o.days)} dagen vastlegde. Piekuur ${o.busiest}, ${WN(o.busiestN)} aanvullingen.${o.config ? ` De ${o.config} kwam het vaakst terug (${WN(o.k)} van ${WN(o.n)}).` : ""}${o.median ? ` Mediane vermelding: weg na ${o.median}.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }) => `${WN(o.n)} iPhone Duo-aanvulling${o.n === 1 ? "" : "en"} ${o.one ? o.label : `bij de ${WN(o.stores)} Apple Stores ${o.label}`} in de laatste ${WN(o.days)} dagen: te weinig voor een gebruikelijk uur. Elke staat hieronder.`,
    hourByHour: "Elk uur, elke winkel →",
    lastThree: (n: number, label: string) => (n === 1 ? `De laatste Duo-vermelding ${label}` : `De laatste ${WN(n)} Duo-vermeldingen ${label}`),
    secs: (n: number) => `${WN(n)} s`,
    mins: (n: number) => `${WN(n)} min`,
    upRange: (low: string, high: string) => `vermeld ${low}–${high}`,
    upAbout: (x: string) => `vermeld ongeveer ${x}`,
    stillUp: (x: string) => `nog vermeld (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }) => (o.one
      ? `${WN(o.sent)} melding${o.sent === 1 ? "" : "en"} verstuurd voor Duo-aanvullingen ${o.label} in de afgelopen ${WN(o.days)} dagen.`
      : `${WN(o.sent)} melding${o.sent === 1 ? "" : "en"} verstuurd voor Duo-aanvullingen bij ${WN(o.stores)} van de ${WN(o.total)} winkels ${o.label} in de afgelopen ${WN(o.days)} dagen.`),
    alertMe: (name: string) => `Zet ${name} op de 5-secondendraad`,
    unknown: "De patrooncijfers konden deze keer niet worden gelezen; de vermelding hierboven is live.",
    allModels: (o: { n: number; days: number; peak: string | null }) => `Alle drie de iPhones samen: ${WN(o.n)} aanvullingen in ${WN(o.days)} dagen${o.peak ? `, piek ${o.peak}` : ""}.`,
  },
};
