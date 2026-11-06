import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Italian strings: chrome — footer, 404 page, the language-version note. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Disponibilità per il ritiro in negozio in tempo reale e avvisi di rifornimento per tutti i 269 Apple Store degli Stati Uniti. Tutto il paese passa sul filo dei 15 secondi; i negozi indicati nei tuoi avvisi su quello dei 5 secondi.",
    blurbIn: (allStores: string) => `Disponibilità per il ritiro in negozio in tempo reale e avvisi di rifornimento per ${allStores}. Ogni negozio passa sul filo dei 15 secondi; quelli indicati nei tuoi avvisi su quello dei 5 secondi.`,
    trademark: "RestockWire è un servizio indipendente, non affiliato ad Apple Inc. né da essa approvato. Apple, iPhone e Apple Store sono marchi di Apple Inc.",
    product: "Prodotto",
    duoStock: "iPhone Duo in negozio",
    proStock: "iPhone 18 Pro in negozio",
    proMaxStock: "iPhone 18 Pro Max in negozio",
    restockLog: "Diario dei rifornimenti",
    liveMap: "Mappa live",
    storesByState: "Negozi stato per stato",
    pricing: "Prezzi",
    company: "Azienda",
    howItWorks: "Il metodo",
    getApp: "Scarica l'app",
    about: "Chi siamo",
    contact: "Contatti",
    allStates: "Ogni stato, ogni città →",
    storesIn: "Apple Store",
    allStores: "Tutti i negozi →",
    legal: "Regole",
    privacy: "Privacy",
    terms: "Termini",
    refunds: "Rimborsi",
    englishOnly: "Solo in inglese",
    questions: "iPhone Duo: le risposte",
    restockTimes: "A che ora Apple rifornisce l'iPhone Duo?",
    countries: "Paesi",
    status: "Il servizio adesso",
  },
  notFound: {
    title: "A questo indirizzo non c'è nessuna pagina",
    body: (stores: ReactNode, map: ReactNode) => <>Qui non è pubblicato nulla. L&apos;{stores} o la {map} ti rimettono sulla strada giusta.</>,
    stores: "elenco dei negozi per stato",
    map: "mappa della disponibilità in tempo reale",
    home: "Vai alla home page",
  },
};
