/** Dutch client strings: content — the first-screen stock checker (QuickCheck) and the navigation skeletons. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone-model",
    search: "Apple Store, stad of ZIP-code",
    useLocation: "Zoek mijn locatie",
    nearMe: "📍 In de buurt",
    locationOff: "Deze site heeft geen toegang tot je locatie. Typ een ZIP-code.",
    storesNow: "De {what} is nu beschikbaar om op te halen bij **{n} van {total}** Apple Stores in de VS",
    nearestTo: " · dichtst bij {place}",
    you: "jou",
    noMatch: "Niets gevonden. Typ een ZIP-code van 5 cijfers of een stad.",
    inStock: "{n}/{total} beschikbaar",
    soldOut: "Uitverkocht",
    alertMe: "Alert zodra hij beschikbaar is",
    allStores: "Bekijk alle {n} winkels →",
    here: "hier",
  },
  skeleton: {
    loading: "Laden",
  },
};
