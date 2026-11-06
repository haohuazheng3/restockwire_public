import type { CDict } from "../en";

/** Italian client strings: content — the first-screen stock checker and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "Modello di iPhone",
    search: "Apple Store, città o CAP",
    useLocation: "Trova la mia posizione",
    nearMe: "📍 Vicino a me",
    locationOff: "Questo sito non ha accesso alla posizione. Inserisci invece un CAP.",
    storesNow: "In questo momento l'{what} è disponibile per il ritiro in **{n} Apple Store su {total}** negli Stati Uniti",
    nearestTo: " · per distanza da {place}",
    you: "te",
    noMatch: "Nessun risultato. Inserisci un CAP di 5 cifre o una città.",
    inStock: "{n}/{total} disponibili",
    soldOut: "Esaurito",
    alertMe: "Ricevi un avviso quando è disponibile",
    allStores: "Sfoglia tutti i {n} negozi →",
    here: "qui",
  },
  skeleton: {
    loading: "Caricamento",
  },
};
