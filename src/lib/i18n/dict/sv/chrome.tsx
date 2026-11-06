import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Swedish strings: chrome — footer, 404 page, the language-version note. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Lager för hämtning i butik live och notiser om påfyllning för alla 269 Apple Store-butiker i USA. Hela landet läses var 15:e sekund; butikerna i dina bevakningar var 5:e.",
    blurbIn: (allStores: string) => `Lager för hämtning i butik live och notiser om påfyllning för ${allStores}. Varje butik läses var 15:e sekund; butikerna i dina bevakningar var 5:e.`,
    trademark: "RestockWire är en fristående tjänst utan koppling till eller stöd från Apple Inc. Apple, iPhone och Apple Store är varumärken som tillhör Apple Inc.",
    product: "Produkt",
    duoStock: "iPhone Duo i lager",
    proStock: "iPhone 18 Pro i lager",
    proMaxStock: "iPhone 18 Pro Max i lager",
    restockLog: "Påfyllningslogg",
    liveMap: "Livekarta",
    storesByState: "Butiker per delstat",
    pricing: "Priser",
    company: "Företaget",
    howItWorks: "Så fungerar det",
    getApp: "Skaffa appen",
    about: "Om oss",
    contact: "Kontakt",
    allStates: "Alla delstater och städer →",
    storesIn: "Apple Store-butiker",
    allStores: "Alla butiker →",
    legal: "Juridik",
    privacy: "Integritet",
    terms: "Villkor",
    refunds: "Återbetalning",
    englishOnly: "Endast på engelska",
    questions: "Frågor om iPhone Duo",
    restockTimes: "Vilken tid fyller Apple på iPhone Duo?",
    countries: "Länder",
    status: "Driftstatus",
  },
  notFound: {
    title: "Ingen sida på den här adressen",
    body: (stores: ReactNode, map: ReactNode) => <>Här finns inget publicerat. {stores} eller {map} tar dig tillbaka på rätt spår.</>,
    stores: "Butikslistan per delstat",
    map: "livekartan",
    home: "Till startsidan",
  },
};
