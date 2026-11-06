import type { CDict } from "../en";

/** Swedish client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "{label} på livekartan",
    cta: "Öppna livekartan →",
  },
  reports: {
    legend: "Externa källor ({sources}), {range}",
    note: "{mark}: {what} enligt {links}, {range}. Uppgifterna kommer från de sajterna. RestockWire har inte kontrollerat dem själv, och de ingår inte i någon av våra siffror.",
    what: "påfyllningar för {models}",
    whatAny: "påfyllningar",
    markDashed: "Streckade",
    markDashedRings: "Streckade cirklar",
    markHollowDots: "Ofyllda prickar",
  },
};
