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

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("de-DE");
export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label[0].toUpperCase()}${label.slice(1)} gibt es noch nichts zu zeichnen: kein Restock und kein Ausverkauf in den letzten ${days} Tagen. Der erste zeichnet den ersten Balken.`,
    summary: (r: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${restocks(r)} und ${ausverkaeufe(soldouts)} ${label} in den letzten ${days} Tagen, verteilt auf ${tage(activeDays)}.`,
    busiest: (day: string, r: number) => <> Der stärkste Tag, der <b className="text-ink">{day}</b>, brachte {n(r)}.</>,
    barAria: (day: string, r: number, soldouts: number) => `${day}: ${restocks(r)} und ${ausverkaeufe(soldouts)}`,
    barTitle: (day: string, r: number, soldouts: number) => `${day} · ${restocks(r)} · ${ausverkaeufe(soldouts)}`,
    legendRestocks: "Restocks",
    legendSoldouts: "Ausverkauft",
  },

  last24: {
    title: (label: string) => `Die letzten 24 Stunden: iPhone-Duo-Restocks ${label}`,
    asOf: (when: string) => `abgelesen ${when}`,
    localTime: (when: string) => `${when} Ortszeit`,
    anAppleStore: "ein Apple Store",
    unknown: "Die 24-Stunden-Zahl ist gerade nicht verfügbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    none: (label: string, asOf: string) => <><b className="text-ink">Null iPhone-Duo-Restocks {label} in den letzten 24 Stunden</b> (abgelesen {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${restocks(o.restocks)} beim iPhone Duo ${o.one ? o.label : `in ${n(o.withStores)} von ${n(o.allStores)} Apple ${o.allStores === 1 ? "Store" : "Stores"} ${o.label}`}`}</b> binnen 24 Stunden – zuletzt ein <b className="text-ink">{o.config}</b>{o.store != null && <> bei {o.store}</>}, {o.when} Ortszeit.</>
    ),
    tileRestocks: "bestätigte Restocks in 24 Std.",
    tileConfigsBack: "Konfigurationen wieder aufgetaucht",
    tileStores: (configs: number, allConfigs: number) => `Stores mit frischem Bestand${configs ? ` · ${n(configs)} von ${n(allConfigs)} Konfigurationen` : ""}`,
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
    barReported: (k: number) => ` (+${n(k)} laut Dritten)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} laut Meldungen Dritter`,
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
    lookupOff: (hasRows: boolean) => `Apple hat die Abholabfrage für diesen Store gerade abgeschaltet${hasRows ? " (unten die zuletzt erhaltenen Antworten)" : ""}`,
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
    checked: (ago: ReactNode) => <>Abgelesen {ago} · {SPEED.checkSec}-Sek.-Takt, mit Alarm {SPEED.fastSec} Sek.</>,
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
    openNow: (closes: string) => `Geöffnet bis ${closes}`,
    opensAt: (opens: string) => `Ab ${opens} geöffnet`,
    closedToday: (next: string | null) => (next ? `Heute Ruhetag · wieder offen ${next}` : "Heute Ruhetag"),
    closedNow: (next: string | null) => (next ? `Gerade zu · wieder offen ${next}` : "Gerade zu"),
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
  /** WireNow: die Meldung, mit der Regions-, Stadt-, Store-, Länder- und Duo-Modellseiten öffnen. `label` kommt mit Präposition („in Bayern“, „bei Apple Rosenstraße“); alle Zahlen sind die letzten 14 Tage. */
  wireNow: {
    eyebrow: (label: string) => `Auf dem Draht · iPhone Duo ${label}`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>Zuletzt gelistet: <b className="text-ink">{o.config}</b>{o.store != null && <> bei {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number) => `In den letzten ${WN(days)} Tagen wurde ${label} kein iPhone Duo gelistet.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">Gerade gelistet bei {WN(o.k)} von {WN(o.n)} Stores</b> {o.label} (Stand {o.stamp}): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">Gerade gelistet: {o.k} von {o.total} Konfigurationen</b> bei {o.name} (Stand {o.stamp}): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">Nichts gelistet, Stand {o.stamp}</b>: keiner der {WN(o.n)} Apple Stores {o.label} zeigt ein iPhone Duo zur Abholung.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">Nichts gelistet, Stand {o.stamp}</b>: {o.name} zeigt keine iPhone-Duo-Konfiguration zur Abholung.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} Konfig.)</>,
    configItem: (config: string) => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro: ${o.pro} von ${o.configs} Konfigurationen hier; 18 Pro Max: ${o.max}.` : `Das iPhone 18 Pro gibt es bei ${o.pro} davon, das 18 Pro Max bei ${o.max}.`),
    tRestocks: (days: number) => `Duo-Restocks, letzte ${WN(days)} Tage`,
    tGone60: "der gemessenen Listungen binnen einer Minute weg",
    tLongest: "längste Listung dieser Woche",
    tWindow: (range: string) => `der Restocks fielen ${range}`,
    tToday: "Restocks heute bisher",
    tStores: (n: number) => `von ${WN(n)} Stores hatten im Zeitraum einen Restock`,
    wireTime: (stamp: string) => `Drahtzeit ${stamp}`,
    reads: (note: string) => `Abfrage ${note}`,
    window: (days: number) => `${WN(days)}-Tage-Fenster`,
    method: "ein Restock zählt erst, wenn zwei Abfragen übereinstimmen; die erste Sichtung eines Stores zählt nie",
    zone: () => "Ortszeit des Stores",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }) =>
      `${o.range} ${o.zone}: dann kommt das iPhone Duo ${o.label} zurück. In diesem Fenster lagen ${o.pct} der ${WN(o.n)} Restocks, die RestockWire ${o.one ? "hier" : `bei ${WN(o.stores)} Apple Stores ${o.label}`} in den letzten ${WN(o.days)} Tagen festgehalten hat. Spitzenstunde ${o.busiest} mit ${WN(o.busiestN)} Restocks.${o.config ? ` Am häufigsten kam ${o.config} (${WN(o.k)} von ${WN(o.n)}).` : ""}${o.median ? ` Median-Listung: nach ${o.median} weg.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }) => `${WN(o.n)} iPhone-Duo-Restock${o.n === 1 ? "" : "s"} ${o.one ? o.label : `bei den ${WN(o.stores)} Apple Stores ${o.label}`} in den letzten ${WN(o.days)} Tagen: zu wenige für eine übliche Stunde. Jeder einzelne steht unten.`,
    hourByHour: "Jede Stunde, jeder Store →",
    lastThree: (n: number, label: string) => (n === 1 ? `Die letzte Duo-Listung ${label}` : `Die letzten ${WN(n)} Duo-Listungen ${label}`),
    secs: (n: number) => `${WN(n)} s`,
    mins: (n: number) => `${WN(n)} Min.`,
    upRange: (low: string, high: string) => `gelistet ${low}–${high}`,
    upAbout: (x: string) => `gelistet etwa ${x}`,
    stillUp: (x: string) => `noch gelistet (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }) => (o.one
      ? `In den letzten ${WN(o.days)} Tagen gingen ${WN(o.sent)} Benachrichtigungen für Duo-Restocks ${o.label} hinaus.`
      : `In den letzten ${WN(o.days)} Tagen gingen ${WN(o.sent)} Benachrichtigungen für Duo-Restocks bei ${WN(o.stores)} der ${WN(o.total)} Stores ${o.label} hinaus.`),
    alertMe: (name: string) => `${name} auf den 5-Sekunden-Draht legen`,
    unknown: "Die Musterzahlen ließen sich diesmal nicht lesen; die Listung oben ist live.",
    allModels: (o: { n: number; days: number; peak: string | null }) => `Alle drei iPhones zusammen: ${WN(o.n)} Restocks in ${WN(o.days)} Tagen${o.peak ? `, Spitze ${o.peak}` : ""}.`,
  },
};
