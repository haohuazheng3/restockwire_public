import type { CDict } from "../en";

/** Swedish client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Se {label} på livekartan",
    cta: "Se den på livekartan →",
  },
  reports: {
    legend: "Rapporterat av andra bevakningstjänster ({sources}), {range}",
    note: "{mark}: {what} som {links} publicerade för {range}. Det är observationer från de sajterna; RestockWire har inte bekräftat dem och ingen av våra siffror räknar med dem.",
    what: "påfyllningar av {models}",
    whatAny: "påfyllningar",
    markDashed: "Streckade",
    markDashedRings: "Streckade ringar",
    markHollowDots: "Ihåliga prickar",
  },
};
