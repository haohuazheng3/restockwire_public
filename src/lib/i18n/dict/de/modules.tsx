/**
 * German strings: modules — restock, store and stock modules. `label` is a place phrase the page builds
 * ("in Bayern", "bei Apple Rosenstraße", "hier"); numbers arrive raw and are formatted here.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { SPEED } from "@/lib/plans";
import { inOrt, n, plural } from "./util";

const restocks = (x: number) => plural(x, "Restock", "Restocks");
const ausverkaeufe = (x: number) => plural(x, "Ausverkauf", "Ausverkäufe");
const tage = (x: number) => (x === 1 ? "einem Tag" : `${n(x)} Tagen`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label[0].toUpperCase()}${label.slice(1)} gibt es noch nichts zu zeichnen: kein Restock und kein Ausverkauf in den letzten ${days} Tagen. Der erste zeichnet den ersten Balken.`,
    summary: (r: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${restocks(r)} und ${ausverkaeufe(soldouts)} ${label} in den letzten ${days} Tagen, verteilt auf ${tage(activeDays)}.`,
    busiest: (day: string, r: number) => <> Der stärkste Tag, der <b className="text-ink">{day}</b>, brachte {n(r)}.</>,
    barAria: (day: string, r: number, soldouts: number) => `${day}: ${restocks(r)} und ${ausverkaeufe(soldouts)}`,
    barTitle: (day: string, r: number, soldouts: number) => `${day} · ${restocks(r)} · ${ausverkaeufe(soldouts)}`,
    legendRestocks: "Restocks",
    legendSoldouts: "Ausverkäufe",
  },

  last24: {
    title: (label: string) => `Die letzten 24 Stunden: iPhone-Duo-Restocks ${label}`,
    asOf: (when: string) => `abgelesen ${when}`,
    localTime: (when: string) => `${when} Ortszeit`,
    anAppleStore: "ein Apple Store",
    unknown: "Die 24-Stunden-Zahl ist gerade nicht verfügbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    none: (label: string, asOf: string) => <><b className="text-ink">Null iPhone-Duo-Restocks {label} in den letzten 24 Stunden</b> (abgelesen {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${restocks(o.restocks)} beim iPhone Duo`} {o.one ? o.label : `in ${n(o.withStores)} von ${n(o.allStores)} Apple ${o.allStores === 1 ? "Store" : "Stores"} ${o.label}`}</b> in den letzten 24 Stunden; der jüngste war ein <b className="text-ink">{o.config}</b>{o.store != null && <> bei {o.store}</>}, {o.when} Ortszeit.</>
    ),
    tileRestocks: "bestätigte Restocks in 24 Std.",
    tileConfigsBack: "Konfigurationen wieder aufgetaucht",
    tileStores: (configs: number, allConfigs: number) => `Stores mit Restock${configs ? ` · ${n(configs)} von ${n(allConfigs)} Konfigurationen` : ""}`,
    tileLatest: (config: string, store: string | null) => <>jüngster · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>der davor · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "nichts Früheres erfasst",
    caption: (label: string, asOf: string) => `Jede iPhone-Duo-Konfiguration ${label}: bestätigte Restocks der letzten 24 Stunden, abgelesen ${asOf}`,
    thConfig: "Konfiguration",
    thRestocks: "Restocks",
    thStores: "Stores",
    thLast: "Jüngster Restock (Ortszeit)",
    thNow: "Jetzt gelistet",
    ofStores: (k: number, total: number) => `${n(k)} von ${n(total)}`,
    noneIn24: "keiner in 24 Std.",
    yes: "ja",
    no: "nein",
    countedTitle: "Was hier als Restock zählt",
    counted: `Das sind RestockWires eigene Abfragen der Abholung im Store auf apple.com: jeder Store alle ${SPEED.checkSec} Sekunden, Stores mit Alarm alle ${SPEED.fastSec}. Ein Restock kommt erst ins Protokoll, wenn zwei Prüfungen übereinstimmen; die allererste Abfrage eines Stores zählt nicht; Meldungen anderer Tracker werden nie eingemischt.`,
    alert: (label: string | null) => `Alarme${label != null ? ` ${label}` : ""} einrichten: Der nächste erreicht Sie in Sekunden`,
  },

  clock: {
    none: (label: string, days: number) => `Bisher kein Restock ${label} in den letzten ${days} Tagen.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${restocks(total)} ${label} in den letzten ${days} Tagen${dates != null ? ` (an ${tage(dates)})` : ""}: noch zu wenig, um eine übliche Stunde zu nennen.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{restocks(total)} {label} in den letzten {days} Tagen. Die übliche Stunde ist <b className="text-ink">{hour}</b> Ortszeit{day ? <>; am meisten bringt der <b className="text-ink">{day}</b></> : null}.</>
    ),
    byHour: (zone: string) => `Nach Stunde · ${zone}`,
    byWeekday: "Nach Wochentag",
    barReported: (k: number) => ` (+${n(k)} von anderen Trackern gemeldet)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} von anderen Trackern gemeldet`,
    legendOurs: "Von RestockWire bestätigt",
  },

  feed: {
    empty: "Das Protokoll ist bisher leer.",
    available: "Verfügbar",
    soldOut: "Ausverkauft",
    soldOutAt: (time: ReactNode) => <>weg {time}</>,
    since: (time: ReactNode) => <>gelistet seit {time}</>,
    restockedAt: (time: ReactNode) => <>wieder da {time}</>,
    mapAria: (store: string) => `${store} auf der Karte finden`,
    map: "Karte",
    buyAria: (model: string, config: string) => `${model} ${config} auf apple.com bestellen`,
    buy: "Auf apple.com bestellen",
  },

  byConfig: {
    empty: (label: string, days: number) => `Noch keine Rangliste: ${label} ist in den letzten ${days} Tagen nichts wieder aufgetaucht.`,
    intro: (label: string, days: number) => `Die Konfigurationen, die ${label} in den letzten ${days} Tagen wiederkamen, nach Häufigkeit sortiert.`,
    times: (k: number) => `${n(k)}×`,
    alert: "Alarme einrichten",
  },

  sellout: {
    typical: (label: string, band: string) => `Ein typischer iPhone-Duo-Restock ${label} hielt etwa ${band}, bevor er ausverkauft war.`,
    half: (label: string, duration: string) => `${duration}: So lange dauerte es, bis die Hälfte der Restocks ${label} ausverkauft war.`,
    none: (label: string, days: number) => `${label[0].toUpperCase()}${label.slice(1)} ist in den letzten ${days} Tagen nichts wieder aufgetaucht und dann ausverkauft gewesen.`,
    whatDuo: "iPhone Duo",
    whatAll: "alle iPhones",
    tileHalf: (what: string) => <>Hälfte weg binnen · {what}</>,
    tileWithin30: "weg binnen 30 Sek.",
    tileWithin60: "weg binnen 1 Min.",
    tileFastest: (k: number, days: number) => <>am schnellsten · {n(k)} ausverkaufte Restocks, {days} T.</>,
    caption: (days: number) => `Je iPhone, letzte ${days} Tage`,
    thIphone: "iPhone",
    thSoldOut: "Ausverkauft",
    thHalf: "Hälfte weg binnen",
    thWithin30: "≤ 30 Sek.",
    thWithin60: "≤ 1 Min.",
    thFastest: "Am schnellsten",
    each: "Eine Zeile je Restock",
    barNote: (full: string) => `Balkenlänge = Sekunden gelistet · ${full} füllt die Zeile`,
    stillListed: (duration: string) => `noch gelistet · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "Wie diese Zeiten gemessen werden",
    measured: (estimated: boolean) =>
      `Eine Zeile mit „in 45–60 Sek. ausverkauft“ bedeutet: Unsere Prüfung 45 Sekunden nach der ersten Sichtung fand die Konfiguration noch gelistet, die Prüfung nach 60 Sekunden nicht mehr. Die Breite jeder Spanne ist der Abstand zwischen zwei Prüfungen: ${SPEED.fastSec} Sekunden in Stores mit Alarm, ${SPEED.checkSec} Sekunden überall sonst${estimated ? "; mit ≈ markierte Zeilen stammen aus der Zeit, bevor wir die letzte Prüfung gespeichert haben, und sind stattdessen durch die 15-Sekunden-Runde begrenzt" : ""}. Ein Angebot, das kürzer als ein Abstand hält, kann zwischen zwei Prüfungen auftauchen und verschwinden; der echte Anteil, der binnen 30 Sekunden weg ist, liegt also höher, als die Tabelle zeigt.`,
  },

  configTable: {
    title: "Alle Konfigurationen in diesem Store",
    titleAt: (store: string) => `Alle Konfigurationen bei ${store}`,
    lookupOff: (hasRows: boolean) => `Apple hat die Abholabfrage für diesen Store gerade abgeschaltet${hasRows ? " (die letzten Antworten stehen unten)" : ""}`,
    tracked: (k: number) => `${n(k)} Konfigurationen im Takt`,
    firstSweep: "Erste Runde läuft · der Status erscheint binnen einer Minute",
    inStock: (k: number, total: number) => `${n(k)} von ${n(total)} gelistet`,
    available: "Verfügbar",
    unavailable: "Nicht verfügbar",
    noLookup: "keine Abholabfrage",
    notChecked: "noch nicht geprüft",
    since: (ago: ReactNode) => <>gelistet seit {ago}</>,
    lastAvailable: (ago: ReactNode) => <>zuletzt gelistet {ago}</>,
    neverHere: "hier bisher nie gelistet",
    buy: "Bestellen",
    alertAria: (model: string, config: string, store: string) => `Alarm, sobald ${store} das ${model} ${config} listet`,
    alert: "Alarm einrichten →",
  },

  matrix: {
    store: "Store",
    checked: "Geprüft",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${n(k)} von ${n(total)} Konfigurationen gelistet`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `kein ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)} von ${n(total)} Konfigurationen jetzt gelistet`,
    noneNow: (total: number) => `0 von ${n(total)} Konfigurationen im Moment`,
    lookupOff: "Apple hat die Abholabfrage für diesen Store gerade abgeschaltet",
    notChecked: "noch nicht geprüft",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>abgelesen {ago}</>,
    alert: "Alarm einrichten →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Abgelesen {ago} · alle {SPEED.checkSec} Sek., {SPEED.fastSec} Sek. mit Alarm</>,
    map: "Auf der Karte ansehen",
    alert: "Diesen Store beobachten",
    alsoIn: (region: string) => `Mehr ${inOrt(region)}`,
    acrossLine: "Nächste Stores jenseits der Grenze",
    elsewhere: "Nächste Stores weiter weg",
  },

  hours: {
    title: "Öffnungszeiten",
    local: (zone: string) => `Ortszeit · ${zone}`,
    today: (hours: string, week: string) => ` · heute ${hours} · ${week}`,
    directions: "Route",
    applePage: "dieser Store auf apple.com",
    liveMap: "Live-Karte",
    storePage: "Store-Seite",
    closed: "Geschlossen",
    everyDay: (hours: string) => `Täglich ${hours}`,
    openNow: (closes: string) => `Jetzt geöffnet · schließt um ${closes}`,
    opensAt: (opens: string) => `Öffnet um ${opens}`,
    closedToday: (next: string | null) => (next ? `Heute geschlossen · öffnet ${next}` : "Heute geschlossen"),
    closedNow: (next: string | null) => (next ? `Jetzt geschlossen · öffnet ${next}` : "Jetzt geschlossen"),
    nextOpen: (day: string | null, time: string) => `${day ?? "morgen"} um ${time}`,
  },

  liveStats: {
    inStock: "Jetzt gelistet",
    storesWith: "Stores m. Bestand",
    lastCheck: "Letzte Prüfung",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${n(k)} von ${n(stores)} Stores listen das ${short} gerade`,
    lastCheck: (ago: ReactNode) => <>Letzte Prüfung {ago}</>,
    firstSweep: "Erste Runde läuft.",
    noneListed: (model: string, storage: string | null, color: string | null) => `Im Moment listet kein Store das ${model}${storage ? ` ${storage}` : ""}${color ? ` in ${color}` : ""}.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>Gelistet {ago}</>,
    loading: "Bestand wird geladen",
  },
};
