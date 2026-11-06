import type { CDict } from "../en";

/** Swedish client strings: content — the first-screen stock checker and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone-modell",
    search: "Postnummer, stad eller Apple Store",
    useLocation: "Hitta mig",
    nearMe: "📍 Nära mig",
    locationOff: "Sajten har ingen åtkomst till din plats. Skriv ett postnummer i stället.",
    storesNow: "{what} listas för hämtning i **{n} av {total}** Apple Store-butiker i USA just nu",
    nearestTo: " · närmast {place}",
    you: "dig",
    noMatch: "Inget hittades. Skriv ett femsiffrigt postnummer eller en stad.",
    inStock: "{n}/{total} listade",
    soldOut: "Slutsåld",
    alertMe: "Få en notis när den listas",
    allStores: "Bläddra bland alla {n} butiker →",
    here: "här",
  },
  skeleton: {
    loading: "Laddar",
  },
};
