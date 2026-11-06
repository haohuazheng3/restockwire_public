import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Swedish strings: chrome — footer, 404 page, the language-version note. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Påfyllningsnyheter från 269 Apple Store-butiker i USA, i realtid. Dina bevakade butiker läses var 5:e sekund, övriga var 15:e. Bekräftad påfyllning blir en notis i telefonen.",
    blurbIn: (allStores: string) => `Påfyllningsnyheter från ${allStores}, i realtid. Dina bevakade butiker läses var 5:e sekund, övriga var 15:e. Bekräftad påfyllning blir en notis i telefonen.`,
    trademark: "Apple, iPhone och Apple Store är Apple Inc:s varumärken. RestockWire drivs självständigt och är varken knutet till eller godkänt av Apple Inc.",
    product: "Tjänsten",
    duoStock: "Lagerläge: iPhone Duo",
    proStock: "Lagerläge: iPhone 18 Pro",
    proMaxStock: "Lagerläge: iPhone 18 Pro Max",
    restockLog: "Påfyllningar, logg",
    liveMap: "Livekarta",
    storesByState: "Delstat för delstat",
    pricing: "Priser",
    company: "RestockWire",
    howItWorks: "Så funkar notiserna",
    getApp: "Hemskärmsappen",
    about: "Om RestockWire",
    contact: "Kontakt",
    allStates: "Varje delstat, varje stad →",
    storesIn: "Apple Store-butiker",
    allStores: "Hela butikslistan →",
    legal: "Regler",
    privacy: "Integritet",
    terms: "Villkor",
    refunds: "Pengarna tillbaka",
    englishOnly: "På engelska",
    questions: "iPhone Duo: svar",
    restockTimes: "Klockslagen för iPhone Duo-påfyllning",
    countries: "Länder",
    status: "Systemstatus",
  },
  notFound: {
    title: "Adressen leder ingenstans",
    body: (stores: ReactNode, map: ReactNode) => <>Sidan finns inte, eller har flyttat. Fortsätt via {stores} eller {map}.</>,
    stores: "butikerna delstat för delstat",
    map: "livekartan",
    home: "Startsidan",
  },
};
