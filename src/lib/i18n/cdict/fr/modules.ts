/** Chaînes client françaises : modules (mini-carte, note sur les signalements d’autres sites de suivi). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "Voir {label} sur la carte en direct",
    cta: "Le voir sur la carte en direct →",
  },
  reports: {
    legend: "Relevés tiers ({sources}), {range}",
    note: "{mark} : {what} que {links} ont publiés pour {range}. Ce sont des observations de ces sites ; RestockWire ne les a pas confirmées et aucun de nos chiffres ne les inclut.",
    what: "retours en stock ({models})",
    whatAny: "retours en stock, tous modèles",
    markDashed: "En pointillés",
    markDashedRings: "Points cerclés de tirets",
    markHollowDots: "Points évidés",
  },
};
