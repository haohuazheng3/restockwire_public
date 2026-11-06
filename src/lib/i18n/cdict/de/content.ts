/** German client strings: content — the first-screen stock checker and the navigation skeletons. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone-Modell",
    search: "Apple Store, Stadt oder ZIP-Code",
    useLocation: "Standort ermitteln",
    nearMe: "📍 In der Nähe",
    locationOff: "Diese Website hat keinen Standortzugriff. Geben Sie stattdessen einen ZIP-Code ein.",
    storesNow: "Das {what} ist gerade in **{n} von {total}** Apple Stores in den USA zur Abholung gelistet",
    nearestTo: " · am nächsten bei {place}",
    you: "Ihnen",
    noMatch: "Nichts gefunden. Geben Sie einen 5-stelligen ZIP-Code oder eine Stadt ein.",
    inStock: "{n}/{total} gelistet",
    soldOut: "Ausverkauft",
    alertMe: "Alarm, sobald gelistet",
    allStores: "Alle {n} Stores durchsuchen →",
    here: "hier",
  },
  skeleton: {
    loading: "Wird geladen",
  },
};
