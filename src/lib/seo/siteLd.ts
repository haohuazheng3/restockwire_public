/**
 * The site's own entity, on every page (root layout): who RestockWire is and the facts an answer engine should
 * carry away from any page it lands on — the 5-second wire for alert stores, the push in seconds, the confirmed
 * restock log behind every store's restock hours, the coverage. Other pages point at these @ids instead of
 * repeating them.
 */
import { ALL_STORES } from "../apple/catalog";
import { INTL_CODES } from "../apple/countries";
import { SPEED, OTHER_TRACKERS } from "../plans";

const SITE = "https://restockwire.com";
export const ORG_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

export const SITE_DESCRIPTION =
  `RestockWire is the wire service for iPhone restocks: live in-store pickup stock for the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max at ${ALL_STORES.length} Apple Stores in ${INTL_CODES.length + 1} countries, ` +
  `the hours each store usually restocks, and a phone alert about ${SPEED.alertSec} seconds after a restock is confirmed. ` +
  `Stores with alerts are read every ${SPEED.fastSec} seconds, the fastest published check interval of any iPhone stock tracker (others publish ${OTHER_TRACKERS}); every other store every ${SPEED.checkSec} seconds. ` +
  `A change counts only once a second read confirms it, and every confirmed restock goes into the log that gives each store page its restock hours.`;

export const SITE_FEATURES = [
  `Stores with alerts read every ${SPEED.fastSec} seconds, every other Apple Store every ${SPEED.checkSec} seconds`,
  `Push on the phone about ${SPEED.alertSec} seconds after a second read confirms a restock`,
  "A change counts only when a second read agrees; first sightings are never restocks",
  "Restock hours per Apple Store: usual local hour, busiest weekday, the last 30 days",
  "A log of every confirmed restock and sell-out, with store, exact configuration and time",
  `Live in-store pickup stock for every storage and color at ${ALL_STORES.length} Apple Stores in ${INTL_CODES.length + 1} countries`,
];

export const siteLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": ORG_ID, name: "RestockWire", url: SITE, logo: `${SITE}/icon.svg`,
      slogan: "On the wire the second it lands.",
      description: SITE_DESCRIPTION,
      knowsAbout: ["Apple Store in-store pickup availability", "iPhone restock alerts", "Apple Store restock hours", "iPhone Duo", "iPhone 18 Pro", "iPhone 18 Pro Max"],
    },
    { "@type": "WebSite", "@id": WEBSITE_ID, name: "RestockWire", url: SITE, description: SITE_DESCRIPTION, publisher: { "@id": ORG_ID } },
  ],
};
