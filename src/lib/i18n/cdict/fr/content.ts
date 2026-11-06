/** Chaînes client françaises : content — le vérificateur de stock en haut de page et les squelettes de navigation. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "Modèle d’iPhone",
    search: "Apple Store, ville ou code postal",
    useLocation: "Me localiser",
    nearMe: "📍 Autour de moi",
    locationOff: "Ce site n’a pas accès à votre position. Saisissez plutôt un code postal.",
    storesNow: "L’{what} est proposé en retrait dans **{n} sur {total}** Apple Store des États-Unis en ce moment",
    nearestTo: " · classés depuis {place}",
    you: "vous",
    noMatch: "Rien trouvé. Saisissez un code postal à 5 chiffres ou une ville.",
    inStock: "{n}/{total} en ligne",
    soldOut: "Épuisé",
    alertMe: "Recevoir une alerte quand il est en ligne",
    allStores: "Parcourir les {n} magasins →",
    here: "ici",
  },
  skeleton: {
    loading: "Chargement",
  },
};
