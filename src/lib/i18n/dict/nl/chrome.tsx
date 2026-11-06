import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Dutch strings: chrome — footer, 404 page. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Live ophaalvoorraad en voorraadalerts voor alle 269 Apple Stores in de VS. Het hele land wordt elke 15 seconden gelezen; de winkels uit je alerts elke 5 seconden.",
    blurbIn: (allStores: string) => `Live ophaalvoorraad en voorraadalerts voor ${allStores}. Elke winkel wordt elke 15 seconden gelezen; de winkels uit je alerts elke 5 seconden.`,
    trademark: "RestockWire is een onafhankelijke dienst, niet verbonden aan en niet goedgekeurd door Apple Inc. Apple, iPhone en Apple Store zijn handelsmerken van Apple Inc.",
    product: "Product",
    duoStock: "iPhone Duo-voorraad",
    proStock: "iPhone 18 Pro-voorraad",
    proMaxStock: "iPhone 18 Pro Max-voorraad",
    restockLog: "Voorraadlogboek",
    liveMap: "Live kaart",
    storesByState: "Winkels per staat",
    pricing: "Prijzen",
    company: "Bedrijf",
    howItWorks: "Zo werkt het",
    getApp: "Download de app",
    about: "Over",
    contact: "Contact",
    allStates: "Alle staten en steden →",
    storesIn: "Apple Stores",
    allStores: "Alle winkels →",
    legal: "Juridisch",
    privacy: "Privacy",
    terms: "Voorwaarden",
    refunds: "Terugbetalingen",
    englishOnly: "Alleen in het Engels",
    questions: "Vragen over de iPhone Duo",
    restockTimes: "Hoe laat vult Apple de iPhone Duo aan?",
    countries: "Landen",
    status: "Status",
  },
  notFound: {
    title: "Geen pagina op dit adres",
    body: (stores: ReactNode, map: ReactNode) => <>Hier is niets gepubliceerd. Via de {stores} of de {map} zit je weer op het goede spoor.</>,
    stores: "winkellijst per staat",
    map: "live voorraadkaart",
    home: "Naar de startpagina",
  },
};
