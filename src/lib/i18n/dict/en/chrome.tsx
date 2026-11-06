import type { ReactNode } from "react";

/** English strings: chrome — footer, 404 page, the language-version note. (Header labels are client strings: cdict chrome.nav.) */
export const chrome = {
  footer: {
    blurb: "Live in-store pickup stock and restock alerts for every one of the 269 US Apple Stores. The whole country is on the 15-second wire; the stores your alerts name are on the 5-second one.",
    /** On a country's native pages: the same line for that country (e.g. "the 11 Apple Stores across Japan"). */
    blurbIn: (allStores: string) => `Live in-store pickup stock and restock alerts for ${allStores}. Every store is on the 15-second wire; the stores your alerts name are on the 5-second one.`,
    trademark: "RestockWire is an independent service with no affiliation to, and no endorsement from, Apple Inc. Apple, iPhone and Apple Store are trademarks of Apple Inc.",
    product: "Product",
    duoStock: "iPhone Duo: live stock",
    proStock: "iPhone 18 Pro: live stock",
    proMaxStock: "iPhone 18 Pro Max: live stock",
    restockLog: "Restock log",
    liveMap: "Live map",
    storesByState: "Stores by state",
    pricing: "Pricing",
    company: "Company",
    howItWorks: "How it works",
    getApp: "Get the app",
    about: "About",
    contact: "Contact",
    allStates: "Every state and city →",
    /** Native pages: the country's regions/cities column. */
    storesIn: "Apple Stores",
    allStores: "Every store →",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    refunds: "Refunds",
    /** Native pages: legal texts and the guides are in English; said once, next to them. */
    englishOnly: "English only",
    questions: "iPhone Duo questions",
    restockTimes: "What time does Apple restock the iPhone Duo?",
    countries: "Countries",
    status: "Status",
  },
  notFound: {
    title: "No page at this address",
    /** `stores`, `map`: the two links (already built), placed in the sentence. */
    body: (stores: ReactNode, map: ReactNode) => <>Nothing is published here. The {stores} or the {map} will get you back on track.</>,
    stores: "store list by state",
    map: "live stock map",
    home: "Go to the home page",
  },
};
