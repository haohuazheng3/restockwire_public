/** German strings: chrome — footer, 404 page, the language-version note. (Header labels are client strings: cdict chrome.nav.) */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Live-Bestand zur Abholung und Restock-Alarme für alle 269 Apple Stores in den USA. Das ganze Land läuft im 15-Sekunden-Takt, die Stores Ihrer Alarme im 5-Sekunden-Takt.",
    blurbIn: (allStores: string) => `Live-Bestand zur Abholung und Restock-Alarme für ${allStores}. Jeder Store läuft im 15-Sekunden-Takt, die Stores Ihrer Alarme im 5-Sekunden-Takt.`,
    trademark: "RestockWire ist ein unabhängiger Dienst, weder mit Apple Inc. verbunden noch von Apple unterstützt. Apple, iPhone und Apple Store sind Marken der Apple Inc.",
    product: "Produkt",
    duoStock: "iPhone Duo Bestand",
    proStock: "iPhone 18 Pro Bestand",
    proMaxStock: "iPhone 18 Pro Max Bestand",
    restockLog: "Restock-Protokoll",
    liveMap: "Live-Karte",
    storesByState: "Stores nach Bundesstaat",
    pricing: "Preise",
    company: "Unternehmen",
    howItWorks: "So funktioniert’s",
    getApp: "App holen",
    about: "Über RestockWire",
    contact: "Kontakt",
    allStates: "Alle Bundesstaaten und Städte →",
    storesIn: "Apple Stores",
    allStores: "Alle Stores →",
    legal: "Rechtliches",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    refunds: "Rückerstattung",
    englishOnly: "nur auf Englisch",
    questions: "Fragen zum iPhone Duo",
    restockTimes: "Wann füllt Apple das iPhone Duo auf?",
    countries: "Länder",
    status: "Status",
  },
  notFound: {
    title: "Unter dieser Adresse gibt es keine Seite",
    body: (stores: ReactNode, map: ReactNode) => <>Hier ist nichts veröffentlicht. Die {stores} oder die {map} bringen Sie zurück.</>,
    stores: "Store-Liste nach Bundesstaat",
    map: "Live-Bestandskarte",
    home: "Zur Startseite",
  },
};
