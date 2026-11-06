import type { CDict } from "../en";

/** Swedish client strings: content — the first-screen stock checker and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone-modell",
    search: "Sök postnummer, ort, Apple Store",
    useLocation: "Använd position",
    nearMe: "📍 Min plats",
    locationOff: "Positionen är blockerad för sajten. Ange ett postnummer.",
    storesNow: "Just nu: {what} går att hämta i **{n} av {total}** Apple Store-butiker i USA",
    nearestTo: " · närmast {place}",
    you: "dig",
    noMatch: "Ingen träff. Prova ett femsiffrigt postnummer eller en ort.",
    inStock: "{n}/{total} listade",
    soldOut: "Slutsåld",
    alertMe: "Notis när den dyker upp",
    allStores: "Samtliga {n} butiker →",
    here: "här",
  },
  skeleton: {
    loading: "Laddar",
  },
};
