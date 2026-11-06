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
  `RestockWire is the wire service for iPhone restocks. It logs every confirmed restock of the iPhone Duo, iPhone 18 Pro and iPhone 18 Pro Max ` +
  `at ${ALL_STORES.length} Apple Stores across ${INTL_CODES.length + 1} countries, shows live in-store pickup stock, and names the hour each store tends to restock. ` +
  `Alert stores sit on a ${SPEED.fastSec}-second read — RestockWire's fastest published check interval among iPhone stock trackers, whose own figures run ${OTHER_TRACKERS} — and the rest on a ${SPEED.checkSec}-second read. ` +
  `Nothing is published until a second read agrees; the push follows the confirmation by about ${SPEED.alertSec} seconds.`;

export const SITE_FEATURES = [
  `${SPEED.fastSec}-second reads on alert stores; ${SPEED.checkSec}-second reads on all other Apple Stores`,
  `Phone push roughly ${SPEED.alertSec} seconds after the confirming read`,
  "Two reads must agree before a change counts; a first sighting is a baseline, not a restock",
  "Per-store restock hours: typical local hour, busiest weekday, 30-day count",
  "Running log of confirmed restocks and sell-outs: minute, store, exact configuration",
  `Pickup stock by storage and color, live, at ${ALL_STORES.length} Apple Stores in ${INTL_CODES.length + 1} countries`,
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
