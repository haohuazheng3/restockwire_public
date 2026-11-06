import type { CDict } from "../en";

/** Spanish (Spain) client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Ver {label} en el mapa en directo",
    cta: "Verla en el mapa en directo →",
  },
  reports: {
    legend: "Publicadas por otros rastreadores ({sources}), {range}",
    note: "{mark}: {what} que {links} publicaron para {range}. Son observaciones de esas webs; RestockWire no las ha confirmado y ninguna de nuestras cifras las incluye.",
    what: "reposiciones del {models}",
    whatAny: "reposiciones",
    markDashed: "En discontinua",
    markDashedRings: "Anillos discontinuos",
    markHollowDots: "Puntos huecos",
  },
};
