/**
 * German strings: content — SEO building blocks, the enrich helpers (opening hours, durations, FAQ answers,
 * titles), live {{tokens}}, the restock-pattern sentence and photo alt text. Arguments arrive written for German
 * (numbers formatted, names in Apple's German form, counts with their noun).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { SPEED } from "@/lib/plans";
import { inOrt } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "Geschlossen",
    everyDay: (hours: string) => `Täglich ${hours}`,
    tomorrow: "morgen",
    dayAt: (day: string, time: string) => `${day} um ${time}`,
    closedTodayOpens: (next: string) => `Heute geschlossen · öffnet ${next}`,
    closedToday: "Heute geschlossen",
    opensAt: (time: string) => `Öffnet um ${time}`,
    openNow: (closes: string) => `Jetzt geöffnet · schließt um ${closes}`,
    closedNowOpens: (next: string) => `Jetzt geschlossen · öffnet ${next}`,
    closedNow: "Jetzt geschlossen",
  },

  duration: {
    underAMinute: "unter einer Minute",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} weitere`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `bei ${place}` : kind === "model" ? `beim ${place}` : inOrt(place)),
    nRestocks: f({ one: "# Restock", other: "# Restocks" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Null Restocks ${where} in den letzten ${days} Tagen` : `${count} ${where} in den letzten ${days} Tagen (${week} davon in der vergangenen Woche)`}${peak ? `, gehäuft gegen ${peak.hour} Ortszeit${peak.day ? `, am meisten ${peak.day.toLowerCase()}s` : ""}` : ""}; Apple selbst kündigt keinen Zeitplan an.`,
    lastsNone: (where: string) => `${where[0].toUpperCase()}${where.slice(1)} sind noch zu wenige Restocks ausverkauft, um eine Zahl zu nennen.`,
    lasts: (days: string, duration: string) => `Im Median etwa ${duration}: So lange blieb eine wieder aufgetauchte Konfiguration in den letzten ${days} Tagen gelistet, bevor sie ausverkauft war.`,
    storeIn: (store: string, line: string) => `${store} in ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `Wo ist das ${model} gerade zur Abholung vorrätig?`,
    modelStockNone: (model: string) => `Bei der letzten Prüfung listete es kein Apple Store in den USA; diese Seite zeigt den ersten, sobald das ${model} zur Abholung auftaucht.`,
    nUsStores: f({ one: "# Apple Store in den USA", other: "# Apple Stores in den USA" }),
    modelStockSome: (count: string) => `${count} bei der letzten Prüfung, jeder auf dieser Seite mit seinen Konfigurationen.`,
    priceQ: (model: string) => `Was kostet das ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} bis ${high} ohne Vertrag, je nach Speicher (${storages}), in ${colors}.`,
    modelRestockQ: (model: string) => `Wie oft wird das ${model} aufgefüllt?`,
    modelLastsQ: (model: string) => `Wie lange bleibt das ${model} gelistet, wenn es wieder da ist?`,
    reserveQ: (model: string) => `Lässt sich das ${model} zur Abholung reservieren?`,
    reserveA: "Nicht im Voraus: Sobald ein Store Ihre Konfiguration listet, bestellen Sie sie auf apple.com mit Abholung im Store, und Apple hält sie für das gewählte Zeitfenster bereit.",

    storeStockQ: (store: string, model: string) => `Hat ${store} das ${model} vorrätig?`,
    nConfigs: f({ one: "# Konfiguration", other: "# Konfigurationen" }),
    storeStockYes: (count: string) => `Ja: ${count} bei der letzten Prüfung, Speicher und Farbe stehen in der Tabelle auf dieser Seite.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Nein, nicht bei der letzten Prüfung${other ? `; gelistet sind aber ${other.pro} Konfigurationen des iPhone 18 Pro und ${other.proMax} des 18 Pro Max` : ", und auch keine Konfiguration des 18 Pro oder 18 Pro Max"}.`,
    hoursQ: (store: string) => `Wann hat ${store} geöffnet?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Siehe die Öffnungszeiten auf dieser Seite"}${today ? `; heute ${today}` : ""}; Adresse: ${address}${phone ? `, Telefon ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Wie oft wird das iPhone bei ${store} aufgefüllt?`,
    storeLastsQ: (store: string) => `Wie lange bleibt ein Restock bei ${store} gelistet?`,
    storeNearestQ: (store: string) => `Welche Apple Stores liegen ${store} am nächsten?`,

    placeStockQ: (place: string, model: string) => `Welche Apple Stores ${inOrt(place)} listen das ${model} gerade zur Abholung?`,
    placeStockNone: (place: string, model: string) => `Bei der letzten Prüfung keiner; sobald ein Store ${inOrt(place)} das ${model} listet, erscheint er auf dieser Seite.`,
    nStores: f({ one: "# Store", other: "# Stores" }),
    placeStockSome: (count: string, stores: string) => `${count} bei der letzten Prüfung: ${stores}.`,
    countQ: (place: string) => `Wie viele Apple Stores gibt es ${inOrt(place)}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Stores" }),
    countMany: (count: string, stores: string) => `${count}, darunter ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `Wie oft wird das iPhone ${inOrt(place)} aufgefüllt?`,
    placeLastsQ: (place: string) => `Wie lange hält der Bestand ${inOrt(place)}, wenn er wieder da ist?`,
    placeNearestQ: (place: string) => `Welche Apple Stores außerhalb von ${place} liegen am nächsten?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `Bei ${place}` : kind === "model" ? "In jedem Apple Store in den USA" : `In den Apple Stores ${inOrt(place)}`;
    return [
      "Abholung im Store ist ein Kauf auf apple.com: Sie wählen Konfiguration und Store im Checkout, bezahlen online und holen das Gerät persönlich ab, oft noch am selben Tag. Mobilfunk-Shops und Ware im Regal sind ein getrennter Bestand.",
      `${at} liest RestockWire jede erfasste Konfiguration alle ${SPEED.checkSec} Sekunden, oder alle ${SPEED.fastSec} Sekunden, wo ein Alarm gesetzt ist. Eine zweite Prüfung muss eine Änderung bestätigen, bevor sie zählt; ein einmaliger Aussetzer erscheint so nie als Restock oder Ausverkauf.`,
      "Jede bestätigte Änderung kommt ins Protokoll, und aus dem Protokoll entstehen das Restock-Diagramm und der Verlauf auf dieser Seite.",
    ];
  },
  alertRule: "Ein Alarm ist ein Store plus ein exaktes Handy (Modell, Speicher, Farbe); Sekunden nachdem apple.com auf verfügbar springt, geht ein Push raus, oder eine E-Mail, wenn kein Gerät Mitteilungen empfängt.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Stores ${inOrt(name)}: iPhone Duo in ${duoNow} von ${stores} gelistet`,
      `Apple Stores ${inOrt(name)}: iPhone-Duo-Bestand zur Abholung live`,
      `Apple Stores ${inOrt(name)}: iPhone-Duo-Bestand jetzt`,
      `Apple Stores ${inOrt(name)}: iPhone-Bestand live`,
      `Apple Store ${name}: iPhone-Bestand`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Stores in ${city}, ${code}: iPhone Duo in ${duoNow} von ${stores}`,
      `Apple Stores in ${city}, ${code}: iPhone Duo zur Abholung live`,
      `Apple Stores in ${city}, ${code}: iPhone-Duo-Bestand jetzt`,
      `Apple Stores in ${city}: iPhone-Bestand live`,
      `Apple Store ${city}: iPhone-Bestand`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone-Bestand live, Restock-Zeiten, Abholung`,
        `${name}${r}: iPhone-Bestand live & Restock-Zeiten`,
        `${name}${r}: iPhone-Bestand live & Öffnungszeiten`,
        `${name}${r}: iPhone-Bestand live`,
        `${name}: iPhone-Bestand live, Restock-Zeiten, Abholung`,
        `${name}: iPhone-Bestand live & Öffnungszeiten`,
        `${name}: iPhone-Bestand live`,
        `${name} – Bestand live`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} zur Abholung: jetzt in ${storesNow} Apple Stores gelistet`,
      `${name} zur Abholung: jetzt in ${storesNow} Apple Stores`,
      `${name}: Bestand zur Abholung im Store, live`,
      `${name}: Bestand live`,
    ],
  },

  tokens: {
    tooFewToMeasure: "noch nicht genug Daten",
    noneLoggedYet: "noch keiner erfasst",
    noneYet: "bisher keiner",
  },

  pattern: {
    none: (days: string) => `Null bestätigte Restocks in den letzten ${days} Tagen.`,
    nConfirmed: f({ one: "# bestätigter Restock", other: "# bestätigte Restocks" }),
    countIn: (count: string, days: string) => `${count} in den letzten ${days} Tagen`,
    stay: (minutes: string) => `; ein Restock bleibt meist ~${minutes} Min. gelistet`,
    nDays: f({ one: "# Tag", other: "# Tagen" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` an ${onDays}` : ""}, noch nicht genug für eine übliche Stunde${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Übliche Restock-Stunde: ${hour} Ortszeit${weekday ? `, stärkster Tag ist der ${weekday}` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "Bundesland", other: "Bundesländer" }),
    province: f({ one: "Provinz", other: "Provinzen" }),
    area: f({ one: "Region", other: "Regionen" }),
    department: f({ one: "Département", other: "Départements" }),
    prefecture: f({ one: "Präfektur", other: "Präfekturen" }),
    emirate: f({ one: "Emirat", other: "Emirate" }),
    canton: f({ one: "Kanton", other: "Kantone" }),
    region: f({ one: "Region", other: "Regionen" }),
    county: f({ one: "Provinz", other: "Provinzen" }),
    city: f({ one: "Stadt", other: "Städte" }),
  } as Record<string, Forms>,

  measured: "Wie die Zahlen gemessen werden",

  faqTitle: "Fragen und Antworten",
  breadcrumb: "Navigationspfad",
  keepExploring: "Mehr von RestockWire",
  browse: {
    storesByState: "Stores nach Bundesstaat",
    allStatesCities: "Alle Bundesstaaten und Städte →",
    liveByModel: "Live-Bestand, Modell für Modell",
    modelStock: (model: string) => `${model} Bestand`,
    thisPage: "diese Seite",
    restockLog: (short: string) => `${short}: Restock-Verlauf`,
    liveMap: "Live-Karte",
    mostStores: "Die meisten Stores",
    allStates: "Alle Bundesstaaten",
    bigCities: "Großstädte",
    cities: "Städte",
    storesBy: (region: string) => `Stores nach ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Alle Apple Stores {inOrt(country)} →</>,
    allRegions: (regions: string) => `Alle ${regions}`,
  },
  modelCards: "iPhone wählen",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Jüngster Restock: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> bei {store}</>,
  },
  statStrip: {
    inStockNow: "Jetzt gelistet",
    ofStores: (n: string) => `von ${n} Stores`,
    stores: "Stores",
    nCities: f({ one: "# Stadt", other: "# Städte" }),
    tracked: "im Takt",
    modelNow: (short: string) => `${short} jetzt`,
    configsInStock: "Konfig. gelistet",
    storesWithStock: f({ one: "Store mit Bestand", other: "Stores mit Bestand" }),
    restocks24h: "Restocks, 24 Std.",
    restocksHint: (week: string, month: string, days: string) => `${week} in 7 T. · ${month} in ${days} T.`,
    sellOuts: (days: string) => `Ausverkäufe ${days} T.`,
    stays: (duration: string) => `hält ~${duration}`,
    noPairs: "noch keine Ausverkäufe zugeordnet",
    lastRestock: "Jüngster Restock",
    noneYet: "bisher keiner",
    inLastDays: (days: string) => `in den letzten ${days} Tagen`,
  },
  product: {
    chooseIphone: "Ihr iPhone wählen",
    storage: "Speicher",
    color: "Farbe",
    all: "Alle",
    numbersAre: (unit: ReactNode) => <>Jede Zahl zählt die {unit}, die es jetzt listen.</>,
    seen: (ago: ReactNode) => <>gelistet {ago}</>,
    last: (ago: ReactNode) => <>zuletzt {ago}</>,
    notSeenYet: "bisher nicht gelistet",
    firstCheckPending: "erste Prüfung unterwegs",
    inStock: "Vorrätig",
    inStockLower: "vorrätig",
    none: "keine",
    here: "hier",
    notAvailable: "Nicht gelistet",
    notCheckedYet: "Noch nicht geprüft",
    availableForPickup: "Zur Abholung gelistet",
    since: (ago: ReactNode) => <> · gelistet seit {ago}</>,
    lastInStock: (ago: ReactNode) => <>Zuletzt gelistet {ago}</>,
    neverSeen: "In diesem Store bisher nie gelistet",
    firstCheckSoon: "Erste Prüfung binnen einer Minute",
    buy: "Auf apple.com bestellen",
    checked: (checked: ReactNode, note: ReactNode) => <>Abgelesen {checked} · {note}</>,
    checkNote: `alle ${SPEED.checkSec} Sek., ${SPEED.fastSec} Sek. mit Alarm`,
  },

  source: (source: ReactNode) => <>Daten: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Quellen",
  allUsStores: "alle 269 Apple Stores in den USA",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWires eigene Live-Prüfungen seit {since}, Abdeckung: {where}. Jede Konfiguration von iPhone Duo, 18 Pro und 18 Pro Max wird alle {SPEED.checkSec} Sekunden gelesen (alle {SPEED.fastSec} Sekunden, wo ein Alarm gesetzt ist); Zahlen auf dieser Seite abgelesen {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>Live: wie viele der {stores} Apple Stores jede {model}-Konfiguration zur Abholung listen</>,
    storage: "Speicher",
    pricesCaption: (model: ReactNode) => <>{model}: Preis auf apple.com (ohne Vertrag, vor Steuern) neben dem Live-Bestand zur Abholung</>,
    price: "Preis",
    bestColor: "Meistgelistete Farbe, Stores jetzt",
    noRestock: (model: string) => `Für das ${model} ist noch kein Restock erfasst.`,
    clockLabel: (model: string) => `für das ${model} im ganzen Land`,
    storesWithIt: "Stores, die es jetzt listen",
    pairsInStock: "Store × Konfig. gelistet",
    restocksLogged: "Erfasste Restocks",
    medianTime: "Median gelistet",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Abholtheke aus Holz mit einem Pickup-Schild in einem Apple Store", caption: "Abholbestellungen gehen an einer Theke wie dieser über den Tisch." },
    "phone-map": { alt: "Hände navigieren im Freien mit einer Karten-App auf dem Smartphone", caption: "Wenn ein Restock eine Minute hält, zählt die Entfernung mehr, als man denkt." },
    "phone-card-payment": { alt: "Eine Frau hält ein iPhone und eine Kreditkarte, um online zu bezahlen", caption: "Online bezahlen, im Store abholen." },
    "phone-on-box": { alt: "Ein neues Smartphone auf seinem weißen Karton", caption: "Ein neues Handy, frisch ausgepackt." },
    "city-map-phone": { alt: "Zwei Personen sehen sich einen Stadtplan auf dem Handy an", caption: "Die Route zum Store planen." },
    "phone-notification": { alt: "Hand hält ein Handy mit Mitteilungen auf dem Sperrbildschirm", caption: "Ein Alarm landet auf dem Sperrbildschirm." },
    "apple-store-crowd-inside": { alt: "Menschen stehen in einem vollen Apple Store in einem Einkaufszentrum an", caption: "Andrang in der Launch-Woche: Was ins Regal kommt, ist binnen Minuten weg." },
    "apple-store-glass-canopy": { alt: "Apple Store mit Glasfassade und Holzvordach bei Nacht", caption: "Ein Apple Store mit Glasfront nach Einbruch der Dunkelheit." },
    "apple-store-night-vancouver": { alt: "Ein beleuchteter Apple Store bei Nacht in Vancouver", caption: "Apple Store bei Nacht: Abhol-Bestand kann zu jeder Stunde auftauchen, morgens aber weit häufiger." },
    "phone-hand-camera": { alt: "Person hält ein iPhone mit Dreifach-Kamera", caption: "Für die Pro-Modelle stellen sich die Leute an." },
    "place-at-vienna": { alt: "Der Stephansdom über den Dächern Wiens unter blauem Himmel", caption: "Der Stephansdom über der Wiener Altstadt." },
    "place-ch-geneva": { alt: "Luftaufnahme des Jet d’Eau im Genfersee mit der Stadt und den Bergen dahinter", caption: "Der Jet d’Eau im Genfersee." },
    "place-ch-zurich": { alt: "Die Doppeltürme des Grossmünsters über der Limmat in der Zürcher Altstadt", caption: "Grossmünster und Limmat, Zürich." },
    "place-de-bavaria": { alt: "Schloss Neuschwanstein über grünem Wald im bayerischen Voralpenland", caption: "Schloss Neuschwanstein, Schwangau, Bayern." },
    "place-de-berlin": { alt: "Der Berliner Dom mit dem Fernsehturm dahinter", caption: "Berliner Dom und Fernsehturm." },
    "place-de-brandenburg-gate": { alt: "Das Brandenburger Tor in Berlin an einem klaren Tag", caption: "Das Brandenburger Tor, Berlin." },
    "place-de-cologne": { alt: "Der Kölner Dom hinter der Hohenzollernbrücke über den Rhein an einem sonnigen Tag", caption: "Kölner Dom und Hohenzollernbrücke." },
    "place-de-hamburg": { alt: "Die Elbphilharmonie über dem Hamburger Hafen mit einer Hafenfähre davor", caption: "Die Elbphilharmonie im Hamburger Hafen." },
    "place-de-hesse": { alt: "Frankfurts Hochhäuser am Main unter dramatischen Wolken", caption: "Frankfurt am Main, Hessen." },
    "place-de-munich": { alt: "Luftaufnahme von Marienplatz, Neuem Rathaus und Frauenkirche in München", caption: "Marienplatz und Frauenkirche, München." },
    "place-de-north-rhine-westphalia": { alt: "Rheinturm und die Gebäude des MedienHafens am Rhein in Düsseldorf", caption: "MedienHafen und Rheinturm in Düsseldorf, Nordrhein-Westfalen." },
  },
};
