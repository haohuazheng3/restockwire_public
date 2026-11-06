/** German client strings: modules (MiniMap, and the other-trackers footnote). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "{label} auf der Live-Karte ansehen",
    cta: "Zur Live-Karte →",
  },
  reports: {
    legend: "Meldungen Dritter ({sources}), {range}",
    note: "{mark}: {what}, die {links} für {range} veröffentlicht hat. Das sind Beobachtungen dieser Seiten; RestockWire hat sie nicht bestätigt, und keine unserer Zahlen enthält sie.",
    what: "Restocks von {models}",
    whatAny: "Restocks",
    markDashed: "Gestrichelt",
    markDashedRings: "Gestrichelte Ringe",
    markHollowDots: "Hohle Punkte",
  },
};
