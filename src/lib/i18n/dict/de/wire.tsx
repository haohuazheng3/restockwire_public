/**
 * German strings: wire — the four restock-log modules (RestockHeatmap, RestockStreak, SellOutRanking,
 * RestockLeaderboard). `label` arrives with its preposition ("in Bayern", "bei Apple Rosenstraße", "hier",
 * "in den USA"); `what` is a phone or configuration name and stays untranslated. Weekdays arrive as "Dienstag".
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { REGION_FORMS, plural } from "./util";

const restocks = (k: number) => plural(k, "Restock", "Restocks");
const tage = (k: number) => plural(k, "Tag", "Tagen");
/** "Dienstag" → "dienstags". */
/** The region noun arrives in English ("state", "province"): Apple's regions in German. */
const region = (noun: string) => REGION_FORMS[noun]?.one ?? noun;
const weekdayAdv = (d: string) => `${d.toLowerCase()}s`;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `Wann kommt das ${what} ${label} wieder? Wochentag × Uhrzeit`,
    unknown: "Das Raster nach Wochentag und Uhrzeit ist gerade nicht lesbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    none: (label: string, days: number) => `${label[0].toUpperCase()}${label.slice(1)} gab es in den letzten ${days} Tagen noch keinen bestätigten Restock; das Raster füllt sich ab dem ersten.`,
    thin: (k: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${restocks(k)} ${label} an ${tage(activeDays)} in den letzten ${days}: noch zu wenig für ein Muster (RestockWire wartet auf ${min} Restocks an ${minDays} Tagen).`,
    pattern: (label: string, weekday: string, window: string, share: string, k: number, days: number) => (
      <>Die meisten Restocks {label} kommen <b className="text-ink">{weekdayAdv(weekday)}</b>, zwischen <b className="text-ink">{window}</b> Ortszeit ({share} von {k} in den letzten {days} Tagen).</>
    ),
    patternHours: (label: string, window: string, share: string, k: number, spanDays: number) => (
      <>Die meisten Restocks {label} kommen zwischen <b className="text-ink">{window}</b> Ortszeit ({share} von {k}); Daten aus {tage(spanDays)} reichen noch nicht, um einen Wochentag zu nennen.</>
    ),
    caption: (what: string, label: string, days: number) => `Bestätigte ${what}-Restocks ${label} nach Wochentag und Ortszeit, letzte ${days} Tage`,
    cell: (weekday: string, hours: string, k: number) => `${weekday} ${hours}: ${restocks(k)}`,
    busiest: (weekday: string, hours: string, k: number) => `am häufigsten · ${weekday} ${hours} · ${restocks(k)}`,
    legendFewer: "weniger",
    legendMore: "mehr",
    localTime: "jeweils Ortszeit des Stores",
    measuredTitle: "So wird gemessen",
    measured: (min: number, minDays: number, span: number) =>
      `Jede Zelle zählt die bestätigten Restocks von RestockWire (zwei Prüfungen stimmen überein; die erste Sichtung in einem Store zählt nie), die im Zeitraum in diese Stunde dieses Wochentags fielen, in der Zeitzone des Stores. Ein Muster nennen wir ab ${min} Restocks an ${minDays} verschiedenen Tagen, einen Wochentag erst, wenn die Daten ${span} Tage umfassen: Zehn Restocks in einem Schwung sind ein Ereignis, keine Gewohnheit.`,
  },

  streak: {
    title: (what: string, label: string) => `${what}: Restock-Serien und Flauten ${label}`,
    unknown: "Die Serien-Zahlen sind gerade nicht lesbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    none: (label: string, days: number) => `Kein bestätigter Restock ${label} in den letzten ${days} Tagen: Die aktuelle Flaute umfasst den ganzen Zeitraum.`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Letzter bestätigter Restock {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; die längste Flaute in {o.days} Tagen dauerte <b className="text-ink">{o.longest}</b></>}{o.trend && <>; diese Woche <b className="text-ink">{o.thisWeek}</b>, letzte Woche {o.lastWeek} ({o.trend})</>}.</>
    ),
    today: "heute",
    daysAgo: (k: number) => `vor ${tage(k)}`,
    hoursAgo: (k: number) => `vor ${plural(k, "Stunde", "Stunden")}`,
    tileSince: "seit dem letzten bestätigten Restock",
    tileSinceNone: (days: number) => `kein Restock in ${days} Tagen`,
    tileLongest: (days: number) => `längste Flaute zwischen Restocks · ${days} T.`,
    tileWeek: (prev: number) => `Restocks in den letzten 7 Tagen · ${prev} in der Woche davor`,
    tileMedian: "typischer Abstand zwischen Restock-Schüben",
    up: "↑ mehr als letzte Woche",
    down: "↓ weniger als letzte Woche",
    flat: "→ wie letzte Woche",
    none2: "–",
    measuredTitle: "So wird gemessen",
    measured: "Ein Restock-Schub umfasst alle bestätigten Restocks derselben halben Stunde in den hier gezählten Stores: Acht Konfigurationen, die zusammen kommen, sind ein Schub, nicht acht. Abstände messen wir zwischen Schüben. „Diese Woche“ sind die letzten 7 Tage, „letzte Woche“ die 7 davor. Bestätigt heißt, dass zwei Prüfungen von RestockWire übereinstimmen (jeder Store alle 15 Sekunden, Stores mit Alarm alle 5); die erste Sichtung in einem Store zählt nie.",
  },

  ranking: {
    title: (what: string, label: string) => `Welche Stores ${label} sind beim ${what} am schnellsten ausverkauft?`,
    unknown: "Die Ausverkaufs-Rangliste ist gerade nicht lesbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    thin: (label: string, k: number, min: number, days: number) =>
      `Noch zu wenige gemessene Ausverkäufe ${label}: ${plural(k, "Store", "Stores")} mit ${min} oder mehr ausverkauften Restocks in den letzten ${days} Tagen, und eine Rangliste braucht zwei.`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>Am schnellsten {o.label}: <b className="text-ink">{o.fastest}</b>, die Hälfte der Restocks war binnen <b className="text-ink">{o.fastSec}</b> weg; am langsamsten: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (letzte {o.days} Tage).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `${what}-Restocks ${label} nach Ausverkaufstempo, letzte ${days} Tage; Stores mit ${min} oder mehr gemessenen Ausverkäufen`,
    thRank: "#",
    thStore: "Store",
    thMedian: "Halb weg nach",
    thFastest: "Am schnellsten",
    thPairs: "Ausverkaufte Restocks",
    footnote: (ranked: number, total: number) => `${ranked} von ${plural(total, "Store", "Stores")} in der Rangliste`,
    measuredTitle: "So wird gemessen",
    measured: (min: number) =>
      `„Halb weg nach“ ist der Median der Zeit von der Prüfung, die einen Restock zuerst sah, bis zu der, die ihn zuerst als weg sah – eine Obergrenze: Stores mit Alarm prüfen wir alle 5 Sekunden, alle anderen alle 15. In der Rangliste stehen nur Stores mit ${min} oder mehr ausverkauften Restocks im Zeitraum; ein Angebot, das kürzer als eine Prüfung hält, kann durchrutschen, sehr schnelle Stores wirken daher etwas langsamer, als sie sind.`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `Welche Stores ${label} hatten die meisten ${what}-Restocks? Letzte ${days} Tage`,
    unknown: "Die Rangliste ist gerade nicht lesbar; Live-Bestand und Restock-Protokoll auf dieser Seite sind davon nicht betroffen.",
    none: (what: string, label: string, days: number) => `Kein bestätigter ${what}-Restock ${label} in den letzten ${days} Tagen.`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> liegt {o.label} vorn, mit <b className="text-ink">{o.n}</b> von {o.total} bestätigten {o.total === 1 ? "Restock" : "Restocks"} (<b className="text-ink">{o.share}</b>) in den letzten {o.days} Tagen.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Stores ${label} nach bestätigten ${what}-Restocks, letzte ${days} Tage`,
    thRank: "#",
    thStore: "Store",
    thRestocks: "Restocks",
    thShare: "Anteil",
    footnote: (shown: number, stores: number, total: number) => `${shown} von ${plural(stores, "Store", "Stores")} mit Restock · insgesamt ${restocks(total)}`,
    regionsTitle: (noun: string) => `Nach ${region(noun)}`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `Bestätigte ${what}-Restocks ${label} nach ${region(noun)}, letzte ${days} Tage`,
    thRegion: (noun: string) => region(noun),
    thStores: "Stores",
    measuredTitle: "So wird gemessen",
    measured: (what: string) =>
      `Bestätigte ${what}-Restocks der letzten 7 Tage aus RestockWires eigenen Prüfungen der Abholung im Store auf apple.com (jeder Store alle 15 Sekunden, Stores mit Alarm alle 5; zwei Prüfungen müssen übereinstimmen; die erste Sichtung in einem Store zählt nie). Der Anteil bezieht sich auf alle bestätigten Restocks am selben Ort im selben Zeitraum.`,
  },
};
