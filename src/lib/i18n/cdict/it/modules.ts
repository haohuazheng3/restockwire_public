import type { CDict } from "../en";

/** Italian client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Apri {label} sulla mappa live",
    cta: "Aprilo sulla mappa live →",
  },
  reports: {
    legend: "Da tracker esterni ({sources}) · {range}",
    note: "{mark}: {what} pubblicati da {links} per il periodo {range}. Sono osservazioni di quei siti; RestockWire non li ha confermati e nessuno dei nostri numeri li include.",
    what: "rifornimenti di {models}",
    whatAny: "rifornimenti",
    markDashed: "Tratteggiate",
    markDashedRings: "Cerchio a tratteggio",
    markHollowDots: "Punti vuoti",
  },
};
