import type { ReactNode } from "react";
import type { Dict } from "../en";

/** Spanish (Spain): chrome — footer, 404 page, the language-version note. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "Stock en directo para recogida en tienda y alertas de reposición en cada uno de los 269 Apple Store de EE. UU. Todo el país se comprueba cada 15 segundos; las tiendas de tus alertas, cada 5 segundos.",
    blurbIn: (allStores: string) => `Stock en directo para recogida en tienda y alertas de reposición en ${allStores}. Cada tienda se comprueba cada 15 segundos; las tiendas de tus alertas, cada 5 segundos.`,
    trademark: "RestockWire es un servicio independiente, sin vínculo con Apple Inc. ni respaldo de su parte. Apple, iPhone y Apple Store son marcas comerciales de Apple Inc.",
    product: "Producto",
    duoStock: "Stock del iPhone Duo",
    proStock: "Stock del iPhone 18 Pro",
    proMaxStock: "Stock del iPhone 18 Pro Max",
    restockLog: "Registro de reposiciones",
    liveMap: "Mapa en directo",
    storesByState: "Tiendas por estado",
    pricing: "Precios",
    company: "Empresa",
    howItWorks: "Cómo funciona",
    getApp: "Descarga la app",
    about: "Quiénes somos",
    contact: "Contacto",
    allStates: "Todos los estados y ciudades →",
    storesIn: "Apple Store",
    allStores: "Todas las tiendas →",
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Condiciones",
    refunds: "Reembolsos",
    englishOnly: "Solo en inglés",
    questions: "Preguntas sobre el iPhone Duo",
    restockTimes: "¿A qué hora repone Apple el iPhone Duo?",
    countries: "Países",
    status: "Estado del servicio",
  },
  notFound: {
    title: "No hay ninguna página en esta dirección",
    body: (stores: ReactNode, map: ReactNode) => <>Aquí no hay nada publicado. Con {stores} o con el {map} volverás al buen camino.</>,
    stores: "la lista de tiendas por estado",
    map: "mapa de stock en directo",
    home: "Ir a la página de inicio",
  },
};
