import type { CDict } from "../en";

/** Spanish (Spain) client strings: content — the first-screen stock checker and the navigation skeletons. */
export const content: CDict["content"] = {
  quickCheck: {
    model: "Modelo de iPhone",
    search: "Código postal, ciudad o Apple Store",
    useLocation: "Localízame",
    nearMe: "📍 Cerca de mí",
    locationOff: "Este sitio no tiene acceso a tu ubicación. Escribe un código postal.",
    storesNow: "El {what} está disponible para recogida en **{n} de {total}** Apple Store de EE. UU. ahora mismo",
    nearestTo: " · los más cercanos a {place}",
    you: "ti",
    noMatch: "No se ha encontrado nada. Escribe un código postal de 5 cifras o una ciudad.",
    inStock: "{n}/{total} disponibles",
    soldOut: "Agotado",
    alertMe: "Recibe una alerta cuando esté disponible",
    allStores: "Explora las {n} tiendas →",
    here: "aquí",
  },
  skeleton: {
    loading: "Cargando",
  },
};
