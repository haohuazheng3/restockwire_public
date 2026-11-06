/**
 * Hand-written copy for the keyword-bound product pages at US level (/in-stock/...).
 * Titles come from titles.ts; this file holds what answers them: an answer-first intro that opens with where
 * the phone is in stock right now, one block per secondary keyword (its H2 is that keyword's entry title),
 * extra FAQ, photos and sources. Numbers are live tokens (see lib/content/facts.ts). Shape: one-sentence intro
 * and leads, key points as bullets and tables, a judgment call as one short note.
 */
import type { Block, Faq, Source } from "@/lib/content/types";

export interface ProductCopy {
  intro: string;
  /** Keyed by secondary keyword (must match titles.ts). */
  sections: Record<string, { lead: string; blocks: Block[] }>;
  faq: Faq[];
  photos: string[];
  sources: Source[];
}

const APPLE_PICKUP: Source = { label: "Apple: Shipping & Pickup help (what to bring to a pickup)", url: "https://www.apple.com/shop/help/shipping_delivery" };
const APPLE_DUO_SHOP: Source = { label: "Apple: Shop iPhone Duo (prices and monthly cost)", url: "https://www.apple.com/shop/buy-iphone/iphone-duo" };
const APPLE_PRO_SHOP: Source = { label: "Apple: Shop iPhone 18 Pro and 18 Pro Max", url: "https://www.apple.com/shop/buy-iphone/iphone-18-pro" };
const APPLE_PRO_SPECS: Source = { label: "Apple: iPhone 18 Pro and 18 Pro Max technical specifications", url: "https://www.apple.com/iphone-18-pro/specs/" };
const DUO_LAUNCH: Source = { label: "Apple Newsroom: iPhone Duo arrives at Apple Store locations worldwide (Oct 23, 2026)", url: "https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/" };
const COLOR_RUMORS: Source = { label: "MacRumors: every iPhone 18 Pro color rumor, including Dark Cherry", url: "https://www.macrumors.com/guide/iphone-18-pro-ultra-colors/" };
const GLACIER_MACWORLD: Source = { label: "Macworld: the Glacier iPhone 18 Pro Max", url: "https://www.macworld.com/article/3240104/glacier-iphone-18-pro-max-is-anti-cosmic-orange.html" };

/** Storage × stores-now table for one color (rows filled by tokens). */
function colorTable(prefix: "pm" | "pro", color: string, prices: [string, string][]): Block {
  return {
    t: "table",
    head: ["Storage", "Unlocked price", "Stores listing it now", "Confirmed restocks"],
    rows: prices.map(([size, price]) => [size, price, `{{${prefix}.cfg:${size} ${color}}}`, `{{${prefix}.rcfg:${size} ${color}}}`]),
    caption: `${color} by storage: stores listing it at this minute, out of 269`,
    source: "Prices from apple.com; stock and confirmed restocks from RestockWire's live read",
  };
}

const PM_PRICES: [string, string][] = [["256GB", "$1,299"], ["512GB", "$1,499"], ["1TB", "$1,899"], ["2TB", "$2,499"]];
const PRO_PRICES: [string, string][] = [["256GB", "$1,199"], ["512GB", "$1,399"], ["1TB", "$1,799"], ["2TB", "$2,399"]];

export const PRODUCT_COPY: Record<string, ProductCopy> = {
  "iphone-duo": {
    intro: "At this minute **{{duo.storesNow}} of 269** US Apple Stores list an iPhone Duo for pickup. All **8 configurations** are read **every 15 seconds**, and **every 5** at stores with alerts.",
    sections: {
      "apple store duo": {
        lead: "Walk-in and pickup sell from the **same store inventory**, so apple.com's pickup check is the most reliable way to see whether a store has a Duo.",
        blocks: [
          { t: "ul", items: [
            "**No Duo listed online, none at the counter:** both draw on one inventory",
            "**Pickup order:** on apple.com or in the Apple Store app, choose \"I'll pick it up\" and the store, then pay",
            "**At the counter:** bring the order number, a government photo ID and the QR code ([Apple's pickup rules](https://www.apple.com/shop/help/shipping_delivery))",
            "**Walking in:** works only while units are still unallocated",
            "**Short since day one:** the Duo [reached stores on October 23, 2026](https://www.apple.com/newsroom/2026/10/iphone-duo-arrives-at-apple-store-locations-worldwide/)",
          ] },
          { t: "note", text: "**Our read:** a rumor or a two-hour-old post is not a reason to drive; the live list on this page is, and an alert tells you the minute a store lists one." },
          { t: "img", id: "apple-store-pickup-counter" },
        ],
      },
      "iphone duo near me": {
        lead: "**{{duo.restocks}} confirmed Duo restocks at {{duo.restockStores}} stores** since {{trackingSince}}; tap **Near me** or enter a ZIP to rank every store by distance.",
        blocks: [
          { t: "live", id: "restocks", model: "duo" },
          { t: "ul", items: [
            "**How long a listing lasts:** **{{duo.medianStay}}** at the median",
            "**Put 3 to 5 stores on the wire:** the ones you can reach, not only the closest",
            "**One alert rule** covers one store × one exact configuration",
            "**The push** lands seconds after a store flips to available",
          ] },
        ],
      },
    },
    faq: [
      { q: "Which iPhone Duo restocks most often?", a: "The {{duo.topConfig}} so far. Since {{trackingSince}}, 256GB Night Sky has {{duo.rcfg:256GB Night Sky}} confirmed restocks and 2TB Star White {{duo.rcfg:2TB Star White}}: the more storage, the longer the wait." },
      { q: "Is a Duo held for me once I place a pickup order?", a: "Yes, it is yours once you pay. Apple sends a QR code when it is ready, and you show it with a photo ID ([Apple](https://www.apple.com/shop/help/shipping_delivery))." },
    ],
    photos: ["apple-store-queue"],
    sources: [DUO_LAUNCH, APPLE_PICKUP, APPLE_DUO_SHOP],
  },

  "iphone-18-pro-max": {
    intro: "At this minute **{{pm.storesNow}} of 269** Apple Stores list an iPhone 18 Pro Max for pickup, and **{{pm.pairsPct}}** of all store × configuration pairs are in stock.",
    sections: {
      "iphone 18 pro max in stock near me": {
        lead: "Enter a ZIP or tap **Near me** and all 269 stores sort by distance, each with a count of its **16 configurations** listed now.",
        blocks: [
          { t: "ul", items: [
            "**Your configuration matters more than distance:** most stores have some Pro Max, fewer have yours",
            "**Open any store** in the checker for its 16 configurations one by one",
            "**A 20-minute drive pays off:** a listed Pro Max stays listed **{{pm.medianStay}}** at the median, unlike the Duo",
            "**Price:** $1,299 (256GB) to $2,499 (2TB), unlocked",
          ] },
          { t: "img", id: "phone-map" },
        ],
      },
      "iphone 18 pro max stock": {
        lead: "The sixteen configurations sell out unevenly; the grid shows how many of the 269 stores list each one at this minute.",
        blocks: [
          { t: "live", id: "configs", model: "18-pro-max" },
          { t: "ul", items: [
            "**256GB comes back most:** it sells fastest, and a missing 256GB often returns within hours",
            "**Since {{trackingSince}}:** **{{pm.restocks}} confirmed restocks** and **{{pm.soldouts}} sell-outs** across the line",
            "**A high count:** go now",
            "**A low count:** put it on the wire",
          ] },
        ],
      },
    },
    faq: [
      { q: "Can I find an iPhone 18 Pro Max today?", a: "Very likely: {{pm.storesNow}} of 269 US Apple Stores list at least one configuration right now. Single sizes and colors still run out store by store every day, and the [restock log](/restock-log?model=18-pro-max) shows which." },
      { q: "Do Apple Stores sell the iPhone 18 Pro Max unlocked?", a: "Yes, from $1,299. Order on [apple.com](https://www.apple.com/shop/buy-iphone/iphone-18-pro) and collect it the same day at any store this page lists with your configuration." },
    ],
    photos: ["phone-hand-camera"],
    sources: [APPLE_PRO_SHOP, APPLE_PRO_SPECS, APPLE_PICKUP],
  },

  "iphone-18-pro-max-burgundy": {
    intro: "**{{pm.color:Burgundy}} of 269** Apple Stores list a Burgundy iPhone 18 Pro Max for pickup at this minute; the deep red finish runs **$1,299** (256GB) to **$2,499** (2TB).",
    sections: {
      "iphone 18 pro max dark cherry": {
        lead: "**Dark Cherry is Burgundy**: the leaks before launch called it Dark Cherry, and Apple shipped it as Burgundy.",
        blocks: [
          { t: "ul", items: [
            "**On apple.com and the box:** Burgundy",
            "**At checkout and in RestockWire alerts:** Burgundy too",
            "**Every storage size** comes in Burgundy",
            "**Where the old name came from:** [MacRumors' color guide](https://www.macrumors.com/guide/iphone-18-pro-ultra-colors/)",
          ] },
          { t: "img", id: "red-phone" },
        ],
      },
      "iphone 18 pro max cherry red": {
        lead: "Burgundy reads as a dark wine red, not a bright cherry; this is how many of the 269 stores list each size at this minute:",
        blocks: [
          colorTable("pm", "Burgundy", PM_PRICES),
          { t: "note", text: "**Our read:** choose the storage first, then read its row; switching colors to get the phone a day sooner is a swap most people regret within a week." },
        ],
      },
    },
    faq: [
      { q: "Is there a red iPhone 18 Pro Max other than Burgundy?", a: "No. Burgundy is its only red finish, and searches for cherry red, red or Dark Cherry all lead to it." },
      { q: "Which Burgundy size is easiest to find?", a: "At this minute 256GB Burgundy is at {{pm.cfg:256GB Burgundy}} stores and 2TB Burgundy at {{pm.cfg:2TB Burgundy}}. The table on this page refreshes with every read." },
    ],
    photos: ["red-iphone-set"],
    sources: [APPLE_PRO_SHOP, COLOR_RUMORS, APPLE_PICKUP],
  },

  "iphone-18-pro-max-glacier": {
    intro: "**{{pm.color:Glacier}} of 269** Apple Stores list a Glacier iPhone 18 Pro Max for pickup at this minute; the light-blue finish runs **$1,299** (256GB) to **$2,499** (2TB).",
    sections: {
      "iphone 18 pro max blue": {
        lead: "**Glacier** is the blue iPhone 18 Pro Max: a pale, icy blue, not navy, and the only blue Apple sells this year.",
        blocks: [
          { t: "ul", items: [
            "**Photos mislead:** light finishes shift a lot with lighting",
            "**See it in a store** before you commit to a 2TB",
            "**Macworld's take:** [Glacier is the anti-Cosmic Orange](https://www.macworld.com/article/3240104/glacier-iphone-18-pro-max-is-anti-cosmic-orange.html), the quiet answer to last year's loud color",
          ] },
          { t: "img", id: "light-blue-case" },
        ],
      },
      "iphone 18 pro max glacier blue": {
        lead: "Glacier blue comes in all **four storage sizes**; the table shows stores listing each one now and confirmed restocks since {{trackingSince}}:",
        blocks: [
          colorTable("pm", "Glacier", PM_PRICES),
          { t: "ul", items: [
            "**The national count hides a lot:** stock varies store by store",
            "**Enter your ZIP** in the checker above for the stores you can reach",
          ] },
        ],
      },
    },
    faq: [
      { q: "What color is the blue iPhone 18 Pro Max called?", a: "Glacier. It is the only blue on the 18 Pro Max and 18 Pro; the other finishes are Silver, Black and Burgundy." },
      { q: "Which Glacier size is in the most stores right now?", a: "256GB Glacier is at {{pm.cfg:256GB Glacier}} stores, 512GB at {{pm.cfg:512GB Glacier}}, 1TB at {{pm.cfg:1TB Glacier}} and 2TB at {{pm.cfg:2TB Glacier}}." },
    ],
    photos: ["blue-phone"],
    sources: [APPLE_PRO_SHOP, GLACIER_MACWORLD, APPLE_PICKUP],
  },

  "iphone-18-pro-max-silver": {
    intro: "**{{pm.color:Silver}} of 269** US Apple Stores list a Silver iPhone 18 Pro Max for pickup at this minute, priced **$1,299** (256GB) to **$2,499** (2TB).",
    sections: {
      "silver iphone 18 pro max": {
        lead: "The easiest Silver to get is the size with the **biggest store count** in the table, unless you need the extra storage.",
        blocks: [
          colorTable("pm", "Silver", PM_PRICES),
          { t: "img", id: "phone-on-box" },
        ],
      },
      "iphone 18 pro max silver color": {
        lead: "Silver is the light, neutral finish, a white-silver back with a bright frame; Black, Glacier and Burgundy complete the four, each in every size.",
        blocks: [
          { t: "table", head: ["Color", "Stores listing any size now", "Confirmed restocks"], rows: [["Silver", "{{pm.color:Silver}}", "{{pm.rcolor:Silver}}"], ["Black", "{{pm.color:Black}}", "{{pm.rcolor:Black}}"], ["Glacier", "{{pm.color:Glacier}}", "{{pm.rcolor:Glacier}}"], ["Burgundy", "{{pm.color:Burgundy}}", "{{pm.rcolor:Burgundy}}"]], caption: "The four iPhone 18 Pro Max colors side by side, live", source: "RestockWire's live read" },
          { t: "note", text: "**Our read:** torn between two colors? Compare both rows; the one listed near you today usually beats a week's wait for a shade you stop noticing within a month." },
        ],
      },
    },
    faq: [
      { q: "Does the iPhone 18 Pro Max come in white?", a: "Silver is the nearest, with a white-silver back. Apple sells no separate white finish for it this year." },
      { q: "Is Silver priced differently from the other colors?", a: "No. Every color costs the same per size: $1,299, $1,499, $1,899 and $2,499 unlocked." },
    ],
    photos: ["apple-store-pickup-counter"],
    sources: [APPLE_PRO_SHOP, APPLE_PRO_SPECS, APPLE_PICKUP],
  },

  "iphone-18-pro-glacier": {
    intro: "**{{pro.color:Glacier}} of 269** Apple Stores list a Glacier iPhone 18 Pro for pickup at this minute; the light-blue finish runs **$1,199** (256GB) to **$2,399** (2TB).",
    sections: {
      "iphone 18 pro blue": {
        lead: "**Glacier** is the blue iPhone 18 Pro, the same pale blue as the 18 Pro Max, offered in all **four storage sizes**:",
        blocks: [
          colorTable("pro", "Glacier", PRO_PRICES),
          { t: "ul", items: [
            "**The two models sell out differently** store by store",
            "**Fine with the bigger screen?** Check the [18 Pro Max Glacier page](/in-stock/iphone-18-pro-max-glacier)",
          ] },
          { t: "img", id: "light-blue-case" },
        ],
      },
    },
    faq: [
      { q: "Do the iPhone 18 Pro and 18 Pro Max share the Glacier color?", a: "Yes. Both Pro models come in the same four finishes: Silver, Black, Glacier and Burgundy." },
      { q: "What does the Glacier iPhone 18 Pro cost?", a: "The same as any other color: $1,199 (256GB), $1,399 (512GB), $1,799 (1TB) and $2,399 (2TB), unlocked." },
    ],
    photos: ["blue-phone"],
    sources: [APPLE_PRO_SHOP, GLACIER_MACWORLD, APPLE_PICKUP],
  },

  "iphone-duo-night-sky": {
    intro: "**{{duo.color:Night Sky}} of 269** Apple Stores list a Night Sky iPhone Duo for pickup at this minute, after **{{duo.rcolor:Night Sky}} confirmed Night Sky restocks** since {{trackingSince}}.",
    sections: {
      "iphone duo black": {
        lead: "The black iPhone Duo is called **Night Sky**; Star White is the only other color, and both cost **$1,999 to $3,199**.",
        blocks: [
          { t: "table", head: ["Storage", "Price", "Stores listing it now", "Confirmed restocks"], rows: [["256GB", "$1,999", "{{duo.cfg:256GB Night Sky}}", "{{duo.rcfg:256GB Night Sky}}"], ["512GB", "$2,199", "{{duo.cfg:512GB Night Sky}}", "{{duo.rcfg:512GB Night Sky}}"], ["1TB", "$2,599", "{{duo.cfg:1TB Night Sky}}", "{{duo.rcfg:1TB Night Sky}}"], ["2TB", "$3,199", "{{duo.cfg:2TB Night Sky}}", "{{duo.rcfg:2TB Night Sky}}"]], caption: "Night Sky iPhone Duo by storage: live pickup stock and restocks", source: "Prices from apple.com; RestockWire's live read" },
          { t: "ul", items: [
            "**Put both colors on the wire** at the same size: roughly twice the chances",
            "**Compare** with [Star White's restocks](/in-stock/iphone-duo-star-white): more restocks, faster route",
          ] },
          { t: "img", id: "black-phone" },
        ],
      },
    },
    faq: [
      { q: "Is Night Sky the black iPhone Duo?", a: "Yes, it is the dark finish and the closest thing to black. The Duo comes in two colors: Night Sky and Star White." },
      { q: "Which Duo color is easier to get, Night Sky or Star White?", a: "Compare the restock counts: since {{trackingSince}}, Night Sky has {{duo.rcolor:Night Sky}} and Star White {{duo.rcolor:Star White}}. The higher number is the easier color, and both sell out within minutes." },
    ],
    photos: ["foldable-hands"],
    sources: [APPLE_DUO_SHOP, DUO_LAUNCH, APPLE_PICKUP],
  },

  "iphone-duo-star-white": {
    intro: "**{{duo.color:Star White}} of 269** Apple Stores list a Star White iPhone Duo for pickup at this minute, after **{{duo.rcolor:Star White}} confirmed Star White restocks** since {{trackingSince}}.",
    sections: {
      "iphone duo white": {
        lead: "**Star White** is the white iPhone Duo and one of its two colors, next to Night Sky, at the same **$1,999 to $3,199**.",
        blocks: [
          { t: "table", head: ["Storage", "Price", "Stores listing it now", "Confirmed restocks"], rows: [["256GB", "$1,999", "{{duo.cfg:256GB Star White}}", "{{duo.rcfg:256GB Star White}}"], ["512GB", "$2,199", "{{duo.cfg:512GB Star White}}", "{{duo.rcfg:512GB Star White}}"], ["1TB", "$2,599", "{{duo.cfg:1TB Star White}}", "{{duo.rcfg:1TB Star White}}"], ["2TB", "$3,199", "{{duo.cfg:2TB Star White}}", "{{duo.rcfg:2TB Star White}}"]], caption: "Star White iPhone Duo by storage: live pickup stock and restocks", source: "Prices from apple.com; RestockWire's live read" },
          { t: "ul", items: [
            "**White or nothing?** Alerts at every store you can reach, not just one",
            "**Star White sells out as fast** as any Duo restock",
          ] },
          { t: "img", id: "foldable-apps" },
        ],
      },
    },
    faq: [
      { q: "What is the white iPhone Duo called?", a: "Star White. It is one of the two Duo finishes; the other is Night Sky." },
      { q: "How many times has the Star White iPhone Duo restocked?", a: "{{duo.rcolor:Star White}} confirmed restocks at US Apple Stores since {{trackingSince}}. Each listing lasted about as long as other Duo restocks: {{duo.medianStay}} at the median." },
    ],
    photos: ["apple-store-entrance"],
    sources: [APPLE_DUO_SHOP, DUO_LAUNCH, APPLE_PICKUP],
  },

  "iphone-duo-1tb": {
    intro: "**{{duo.storage:1TB}} of 269** Apple Stores list a 1TB iPhone Duo for pickup at this minute, after **{{duo.rstorage:1TB}} confirmed 1TB restocks** since {{trackingSince}}; it costs **$2,599** unlocked.",
    sections: {
      "iphone duo 1tb price": {
        lead: "**$2,599** buys the 1TB iPhone Duo in either color, or **$108.29 a month** over 24 months on Apple Card Monthly Installments, before tax.",
        blocks: [
          { t: "table", head: ["iPhone Duo", "Price", "Monthly (ACMI)", "Lease from"], rows: [["256GB", "$1,999", "$83.29", "$57.99"], ["512GB", "$2,199", "$91.62", "$63.80"], ["**1TB**", "**$2,599**", "**$108.29**", "**$75.40**"], ["2TB", "$3,199", "$133.29", "$92.81"]], caption: "iPhone Duo prices on apple.com, checked October 30, 2026 (before tax and trade-in)", source: "[Apple: Shop iPhone Duo](https://www.apple.com/shop/buy-iphone/iphone-duo)" },
          { t: "ul", items: [
            "**Against 512GB:** $400 more",
            "**Against 2TB:** $600 less",
            "**Pays off if:** you shoot a lot of 4K video for the Duo's big inner screen",
          ] },
          { t: "note", text: "**Our read:** photos, apps and offline maps fit in 512GB, and the $400 stays with you." },
          { t: "img", id: "phone-card-payment" },
        ],
      },
    },
    faq: [
      { q: "What does the 1TB iPhone Duo cost after sales tax?", a: "$2,599 plus your state's rate, for example 6.25% in Texas or 7.25% statewide in California before local rates. [Apple Stores by state](/apple-stores) lists every rate, and each state page prices the Duo with its tax." },
      { q: "Can I find a 1TB iPhone Duo anywhere right now?", a: "{{duo.storage:1TB}} of 269 stores list one at this minute. Since {{trackingSince}}, 1TB Night Sky has restocked {{duo.rcfg:1TB Night Sky}} times and 1TB Star White {{duo.rcfg:1TB Star White}} times." },
    ],
    photos: ["foldable-hands"],
    sources: [APPLE_DUO_SHOP, APPLE_PICKUP],
  },

  "iphone-duo-2tb": {
    intro: "**{{duo.storage:2TB}} of 269** Apple Stores list a 2TB iPhone Duo for pickup at this minute, after **{{duo.rstorage:2TB}} confirmed 2TB restocks** since {{trackingSince}}; at **$3,199** it is the hardest Duo to find.",
    sections: {
      "iphone duo 2tb price": {
        lead: "**$3,199** buys the 2TB iPhone Duo in either color, or **$133.29 a month** over 24 months on Apple Card Monthly Installments, before tax.",
        blocks: [
          { t: "table", head: ["Size", "Price", "Stores listing it now", "Confirmed restocks"], rows: [["2TB Night Sky", "$3,199", "{{duo.cfg:2TB Night Sky}}", "{{duo.rcfg:2TB Night Sky}}"], ["2TB Star White", "$3,199", "{{duo.cfg:2TB Star White}}", "{{duo.rcfg:2TB Star White}}"], ["1TB (either color)", "$2,599", "{{duo.storage:1TB}}", "{{duo.rstorage:1TB}}"]], caption: "iPhone Duo 2TB: price and live pickup stock", source: "[Apple: Shop iPhone Duo](https://www.apple.com/shop/buy-iphone/iphone-duo); RestockWire's live read" },
          { t: "ul", items: [
            "**Is it ever in stock?** Rarely: 2TB has the fewest restocks of any Duo size",
            "**The count:** **{{duo.rstorage:2TB}}** 2TB restocks since {{trackingSince}}, against {{duo.rstorage:1TB}} for 1TB",
            "**1TB saves $600**",
          ] },
          { t: "note", text: "**Our read:** go 1TB unless 2TB is a hard requirement; if it is, put both colors on the wire at every store within a drive you would make." },
          { t: "img", id: "night-line" },
        ],
      },
    },
    faq: [
      { q: "Why is a 2TB iPhone Duo so rare?", a: "It restocks least: {{duo.rstorage:2TB}} confirmed 2TB restocks since {{trackingSince}} against {{duo.rstorage:256GB}} for 256GB. Duo restocks also stay listed only {{duo.medianStay}} at the median." },
      { q: "What is the monthly price of the 2TB iPhone Duo?", a: "$133.29 a month over 24 months on Apple Card Monthly Installments, or a lease from $92.81 a month with Apple Upgrade, before tax ([Apple](https://www.apple.com/shop/buy-iphone/iphone-duo))." },
    ],
    photos: ["foldable-apps"],
    sources: [APPLE_DUO_SHOP, APPLE_PICKUP],
  },
};
