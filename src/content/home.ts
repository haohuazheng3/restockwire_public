/** Home page copy: the wire's front page. Titles live in titles.ts (HOME_TITLES); the section keys below are its H2 keywords. */
import type { Block, Faq, Source } from "@/lib/content/types";

/** The live wire first: the latest confirmed Duo restock, then who lists what at this minute. */
export const HOME_INTRO = "Latest confirmed iPhone Duo restock: **{{duo.lastRestock}}**. At this minute **{{duo.storesNow}} of 269** US Apple Stores list a Duo for pickup, **{{pm.storesNow}}** an iPhone 18 Pro Max and **{{pro.storesNow}}** an iPhone 18 Pro.";

export const HOME_SECTIONS: Record<string, { lead: string; blocks: Block[] }> = {
  "apple inventory checker": {
    lead: "The inventory below is apple.com's own in-store pickup availability, read for all **40 configurations** at **269 stores**: every store **every 15 seconds**, stores with alerts **every 5**.",
    blocks: [
      { t: "table", head: ["Model", "Configurations", "Stores listing it now", "Confirmed restocks"], rows: [["[iPhone Duo](/in-stock/iphone-duo)", "8", "{{duo.storesNow}}", "{{duo.restocks}}"], ["[iPhone 18 Pro](/in-stock/iphone-18-pro)", "16", "{{pro.storesNow}}", "{{pro.restocks}}"], ["[iPhone 18 Pro Max](/in-stock/iphone-18-pro-max)", "16", "{{pm.storesNow}}", "{{pm.restocks}}"]], caption: "The wire at this minute; restocks counted since {{trackingSince}}", source: "RestockWire's live read of all 269 US Apple Stores" },
      { t: "ul", items: [
        "**Confirmed means twice:** a change is published only after a second read agrees with the first",
        "**First sightings are not restocks:** a configuration seen for the first time sets the baseline and never enters the count",
        "**One bad answer, no story:** a single glitchy apple.com response never shows as a restock or a sell-out",
        "**The log is the source:** every confirmed change lands in the [restock log](/restock-log), and each store's restock-hour chart is drawn from it",
      ] },
      { t: "img", id: "phone-notification" },
    ],
  },
  "apple store stock checker": {
    lead: "Reading the checker costs nothing; an alert, from **$5 a month**, does the refreshing for you: your stores sit on the 5-second wire, and a confirmed restock is on your phone about **3 seconds** later.",
    blocks: [
      { t: "ol", items: [
        "Pick the iPhone, storage and color under **Alert me**, then tick the stores you can reach; the nearest come first, with miles and drive time.",
        "On an iPhone, add RestockWire to your Home Screen and allow notifications; iOS delivers web push only to an installed app ([how to install](/phone-alerts)).",
        "When the push lands, open apple.com from it and check out with in-store pickup; Apple holds the unit once you have paid.",
      ] },
      { t: "table", head: ["Plan", "Monthly", "Alert rules"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "One rule = one store × one exact configuration; the speed is the same on every plan ([pricing](/pricing))", source: "RestockWire pricing" },
      { t: "note", text: "**Our read:** put the Duo on the wire at three to five stores you would actually drive to; for the 18 Pro and Pro Max, look at the live counts first, since most configurations sit in stock at most stores." },
      { t: "img", id: "apple-store-pickup-counter" },
    ],
  },
};

export const HOME_FAQ: Faq[] = [
  { q: "How quickly does RestockWire see a restock?", a: "Stores with alerts are read every 5 seconds and every other US Apple Store every 15; a first \"available\" is re-read within a second, and the confirmed restock is on your phone about 3 seconds later. A Duo listing lasts {{duo.medianStay}} at the median, which is why the gap matters." },
  { q: "Which iPhone Duo configuration has restocked most?", a: "{{duo.topConfig}}, counting every confirmed restock since {{trackingSince}}. The [restock log](/restock-log) breaks the count down by store and configuration." },
  { q: "Do I need a plan to look at stock?", a: "No. The live board, the map, the restock log and every store page are free; a plan only adds alert rules: Plus $5 a month for 10, Pro $10 for 20, Max $20 for 50, cancelled whenever you like ([pricing](/pricing))." },
  { q: "Why does my iPhone need the Home Screen app?", a: "iOS delivers web push only to a site installed on the Home Screen. Open restockwire.com in Safari, use Share → Add to Home Screen, then open it from there, sign in and allow notifications ([guide](/phone-alerts))." },
  { q: "Does an alert hold the phone for me?", a: "No; only an apple.com pickup order does that. The alert gets you to checkout first, and Apple holds the unit once you have paid ([Apple's pickup help](https://www.apple.com/shop/help/shipping_delivery))." },
];

export const HOME_SOURCES: Source[] = [
  { label: "Apple Shipping & Pickup help — bring ID and the QR code to the counter", url: "https://www.apple.com/shop/help/shipping_delivery" },
  { label: "Apple Delivery and Pickup — how apple.com shows pickup availability", url: "https://www.apple.com/shop/shipping-pickup" },
  { label: "Apple Newsroom, Oct 23, 2026 — iPhone Duo arrives at Apple Store locations worldwide", url: "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/" },
];
