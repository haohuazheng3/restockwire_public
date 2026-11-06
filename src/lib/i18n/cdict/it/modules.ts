import type { CDict } from "../en";

/** Italian client strings: modules (MiniMap, and the other-trackers footnote). */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "Vedi {label} sulla mappa in tempo reale",
    cta: "Vedilo sulla mappa in tempo reale →",
  },
  reports: {
    legend: "Segnalati da altri tracker ({sources}), {range}",
    note: "{mark}: {what} pubblicati da {links} per il periodo {range}. Sono osservazioni di quei siti; RestockWire non li ha confermati e nessuno dei nostri numeri li include.",
    what: "rifornimenti di {models}",
    whatAny: "rifornimenti",
    markDashed: "Tratteggiate",
    markDashedRings: "Cerchi tratteggiati",
    markHollowDots: "Punti vuoti",
  },
};
