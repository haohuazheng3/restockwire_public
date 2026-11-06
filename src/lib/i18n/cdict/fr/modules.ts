/** Chaînes client françaises : modules (mini-carte, note sur les signalements d’autres sites de suivi). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "Voir {label} sur la carte en direct",
    cta: "Le voir sur la carte en direct →",
  },
  reports: {
    legend: "Signalés par d’autres sites de suivi ({sources}), {range}",
    note: "{mark} : {what} que {links} ont publiés pour {range}. Ce sont des observations de ces sites ; RestockWire ne les a pas confirmées et aucun de nos chiffres ne les inclut.",
    what: "retours en stock d’{models}",
    whatAny: "retours en stock",
    markDashed: "En pointillés",
    markDashedRings: "Cercles en pointillés",
    markHollowDots: "Points creux",
  },
};
