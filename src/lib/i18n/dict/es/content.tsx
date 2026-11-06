/**
 * Spanish (Spain): content — the SEO building blocks (FAQ, browse rows, stat strips, product parts, sources), the
 * enrich helpers' words (hours, durations, FAQ answers, titles), live tokens, the restock-pattern sentence and
 * photo alt text. Arguments arrive formatted for Spanish (numbers, durations, "9:00" hours, colour names).
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { aprox, cap, fixDay, fixHour } from "./words";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

/** "las 9:00" / "la 1:00" for an hour label. */
const lasS = (hour: string): string => { const x = fixHour(hour); return /^1:/.test(x) ? `la ${x}` : `las ${x}`; };
/** "los lunes", "los sábados". */
const losDays = (day: string): string => { const d = fixDay(day); return /o$/.test(d) ? `los ${d}s` : `los ${d}`; };
/** "Todas las provincias" / "Todos los estados". */
const FEM = new Set(["provincias", "zonas", "prefecturas", "regiones", "ciudades"]);

export const content: Dict["content"] = {
  hours: {
    closed: "Cerrado",
    everyDay: (hours: string) => `Todos los días ${hours}`,
    tomorrow: "mañana",
    dayAt: (day: string, time: string) => `${day} a ${lasS(time)}`,
    closedTodayOpens: (next: string) => `Hoy cerrado · abre ${next}`,
    closedToday: "Hoy cerrado",
    opensAt: (time: string) => `Abre a ${lasS(time)}`,
    openNow: (closes: string) => `Abierto · cierra a ${lasS(closes)}`,
    closedNowOpens: (next: string) => `Cerrado ahora · abre ${next}`,
    closedNow: "Cerrado ahora",
  },

  duration: {
    underAMinute: "menos de un minuto",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} más`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `del ${place}` : `en ${place}`),
    nRestocks: f({ one: "# reposición", other: "# reposiciones" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Cero reposiciones ${where} en los últimos ${days} días` : `${count} ${where} en los últimos ${days} días (${week} en la última semana)`}${peak ? `, concentradas hacia ${lasS(peak.hour)}, hora local${peak.day ? `, con ${losDays(peak.day)} como el día de más movimiento` : ""}` : ""}; Apple no anuncia ningún calendario.`,
    lastsNone: (where: string) => `Todavía no se han agotado suficientes reposiciones ${where} para ponerle una cifra.`,
    lasts: (days: string, duration: string) => `${cap(aprox(duration))} de mediana: es lo que una configuración repuesta siguió disponible antes de agotarse, en los últimos ${days} días.`,
    storeIn: (store: string, line: string) => `${store} en ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `¿Dónde hay stock del ${model} para recoger ahora mismo?`,
    modelStockNone: (model: string) => `Ningún Apple Store de EE. UU. lo tenía en la última comprobación; esta página muestra el primero en cuanto el ${model} aparezca para recogida.`,
    nUsStores: f({ one: "# Apple Store de EE. UU.", other: "# Apple Store de EE. UU." }),
    modelStockSome: (count: string) => `${count} en la última comprobación, cada uno con sus configuraciones en esta página.`,
    priceQ: (model: string) => `¿Cuánto cuesta el ${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `De ${low} a ${high}, libre, según la capacidad (${storages}), en ${colors}.`,
    modelRestockQ: (model: string) => `¿Cada cuánto se repone el ${model}?`,
    modelLastsQ: (model: string) => `Cuando el ${model} vuelve, ¿cuánto tiempo sigue disponible?`,
    reserveQ: (model: string) => `¿Hay forma de reservar el ${model} para recogerlo?`,
    reserveA: "No por adelantado: cuando una tienda pone disponible tu configuración, la pides en apple.com con «Recogida», y Apple te la guarda para la franja horaria que elijas.",

    storeStockQ: (store: string, model: string) => `¿Hay stock del ${model} en ${store}?`,
    nConfigs: f({ one: "# configuración", other: "# configuraciones" }),
    storeStockYes: (count: string) => `Sí: ${count} en la última comprobación, con la capacidad y el color en la tabla de esta página.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No, no en la última comprobación${other ? `; eso sí, tiene ${other.pro} configuraciones del iPhone 18 Pro y ${other.proMax} del 18 Pro Max` : ", y tampoco tiene ninguna configuración del 18 Pro ni del 18 Pro Max"}.`,
    hoursQ: (store: string) => `¿Cuándo abre ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "Consulta la tabla de horarios de esta página"}${today ? `; hoy, ${today}` : ""}; dirección: ${address}${phone ? `, teléfono ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `¿Cada cuánto se repone el iPhone en ${store}?`,
    storeLastsQ: (store: string) => `¿Cuánto tiempo sigue disponible una reposición en ${store}?`,
    storeNearestQ: (store: string) => `¿Qué Apple Store quedan más cerca de ${store}?`,

    placeStockQ: (place: string, model: string) => `¿Qué Apple Store de ${place} tienen ahora el ${model} para recoger?`,
    placeStockNone: (place: string, model: string) => `Ninguno en la última comprobación; en cuanto una tienda de ${place} ponga disponible el ${model}, aparecerá en esta página.`,
    nStores: f({ one: "# tienda", other: "# tiendas" }),
    placeStockSome: (count: string, stores: string) => `${count} en la última comprobación: ${stores}.`,
    countQ: (place: string) => `¿Cuántos Apple Store hay en ${place}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count: string, stores: string) => `${count}, entre ellos ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
    placeRestockQ: (place: string) => `¿Cada cuánto se repone el iPhone en ${place}?`,
    placeLastsQ: (place: string) => `¿Cuánto dura el stock en ${place} cuando vuelve?`,
    placeNearestQ: (place: string) => `¿Qué Apple Store fuera de ${place} quedan más cerca?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "todos los Apple Store de EE. UU." : `los Apple Store de ${place}`;
    return [
      "La recogida en tienda es una compra en apple.com: eliges la configuración y la tienda al pagar, pagas online y la recoges en persona, a menudo el mismo día. Las tiendas de los operadores y el stock de estantería son otra cosa.",
      `En ${at}, RestockWire lee cada configuración seguida cada 15 segundos, o cada 5 segundos donde hay una alerta. Un cambio solo cuenta cuando lo confirma una segunda comprobación, así que un fallo puntual nunca aparece como reposición ni como agotamiento.`,
      "Cada cambio confirmado entra en el registro, y con ese registro se dibujan el gráfico de reposiciones y el historial de esta página.",
    ];
  },
  alertRule: "Una alerta es una tienda más un iPhone exacto (modelo, capacidad, color); segundos después de que apple.com lo marque como disponible sale un aviso push, o un correo si ningún dispositivo recibe notificaciones.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store en ${name}: iPhone Duo en ${duoNow} de ${stores}`,
      `Apple Store en ${name}: stock del iPhone Duo en directo`,
      `Apple Store en ${name}: stock del iPhone Duo ahora`,
      `Apple Store ${name}: stock de iPhone en directo`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store en ${city}, ${code}: iPhone Duo en ${duoNow} de ${stores}`,
      `Apple Store en ${city}, ${code}: iPhone Duo en directo`,
      `Apple Store en ${city}, ${code}: stock del iPhone Duo`,
      `Apple Store ${city}: stock de iPhone en directo`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: stock de iPhone en directo, reposiciones y recogida`,
        `${name}${r}: stock de iPhone en directo y reposiciones`,
        `${name}${r}: stock de iPhone en directo y horario`,
        `${name}: stock de iPhone en directo, reposiciones y recogida`,
        `${name}: stock de iPhone en directo y horario`,
        `${name}: stock de iPhone en directo`,
        `${name} – stock en directo`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `Stock del ${name} para recogida: en ${storesNow} Apple Store ahora`,
      `Stock del ${name}: ${storesNow} Apple Store ahora`,
      `Stock del ${name} para recogida en tienda, en directo`,
    ],
  },

  tokens: {
    tooFewToMeasure: "todavía no hay datos suficientes",
    noneLoggedYet: "todavía ninguna registrada",
    noneYet: "de momento ninguna",
  },

  pattern: {
    none: (days: string) => `Cero reposiciones confirmadas en los últimos ${days} días.`,
    nConfirmed: f({ one: "# reposición confirmada", other: "# reposiciones confirmadas" }),
    countIn: (count: string, days: string) => `${count} en los últimos ${days} días`,
    stay: (minutes: string) => `; una reposición suele seguir disponible ~${minutes} min`,
    nDays: f({ one: "# día", other: "# días" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` en ${onDays}` : ""}, todavía no bastan para fijar una hora habitual${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Hora habitual de reposición: ${fixHour(hour)}, hora local${weekday ? `, y el ${fixDay(weekday)} es el día de más movimiento` : ""}; ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ one: "estado", other: "estados" }),
    province: f({ one: "provincia", other: "provincias" }),
    area: f({ one: "zona", other: "zonas" }),
    department: f({ one: "departamento", other: "departamentos" }),
    prefecture: f({ one: "prefectura", other: "prefecturas" }),
    emirate: f({ one: "emirato", other: "emiratos" }),
    canton: f({ one: "cantón", other: "cantones" }),
    region: f({ one: "región", other: "regiones" }),
    county: f({ one: "provincia", other: "provincias" }),
    city: f({ one: "ciudad", other: "ciudades" }),
  } as Record<string, Forms>,

  measured: "Cómo se miden las cifras",

  faqTitle: "Preguntas y respuestas",
  breadcrumb: "Ruta de navegación",
  keepExploring: "Más en RestockWire",
  browse: {
    storesByState: "Tiendas por estado",
    allStatesCities: "Todos los estados y ciudades →",
    liveByModel: "Stock en directo, modelo a modelo",
    modelStock: (model: string) => `Stock del ${model}`,
    thisPage: "esta página",
    restockLog: (short: string) => `Registro de reposiciones del ${short}`,
    liveMap: "Mapa en directo",
    mostStores: "Con más tiendas",
    allStates: "Todos los estados",
    bigCities: "Grandes ciudades",
    cities: "Ciudades",
    storesBy: (region: string) => `Tiendas por ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Todos los Apple Store de {country} →</>,
    allRegions: (regions: string) => `${FEM.has(regions) ? "Todas las" : "Todos los"} ${regions}`,
  },
  modelCards: "Elige un iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Reposición más reciente: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> en {store}</>,
  },
  statStrip: {
    inStockNow: "Disponibles ahora",
    ofStores: (n: string) => `de ${n} tiendas`,
    stores: "Tiendas",
    nCities: f({ one: "# ciudad", other: "# ciudades" }),
    tracked: "en seguimiento",
    modelNow: (short: string) => `${short} ahora`,
    configsInStock: "configuraciones disponibles",
    storesWithStock: f({ one: "tienda con stock", other: "tiendas con stock" }),
    restocks24h: "Reposiciones, 24 h",
    restocksHint: (week: string, month: string, days: string) => `${week} en 7 d · ${month} en ${days} d`,
    sellOuts: (days: string) => `Agotamientos ${days} d`,
    stays: (duration: string) => `dura ~${duration}`,
    noPairs: "aún sin agotamientos emparejados",
    lastRestock: "Reposición más reciente",
    noneYet: "de momento ninguna",
    inLastDays: (days: string) => `en los últimos ${days} días`,
  },
  product: {
    chooseIphone: "Elige tu iPhone",
    storage: "Capacidad",
    color: "Color",
    all: "Todos",
    numbersAre: (unit: ReactNode) => <>Cada cifra cuenta las {unit} que lo tienen ahora.</>,
    seen: (ago: ReactNode) => <>disponible {ago}</>,
    last: (ago: ReactNode) => <>última vez {ago}</>,
    notSeenYet: "de momento sin stock",
    firstCheckPending: "primera comprobación en camino",
    inStock: "En stock",
    inStockLower: "en stock",
    none: "ninguno",
    here: "aquí",
    notAvailable: "No disponible",
    notCheckedYet: "Aún sin comprobar",
    availableForPickup: "Disponible para recogida",
    since: (ago: ReactNode) => <> · disponible desde {ago}</>,
    lastInStock: (ago: ReactNode) => <>Disponible por última vez {ago}</>,
    neverSeen: "De momento nunca ha estado disponible en esta tienda",
    firstCheckSoon: "Primera comprobación en menos de un minuto",
    buy: "Pedir en apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Leído {checked} · {note}</>,
    checkNote: "cada 15 s; 5 s con alerta",
  },

  source: (source: ReactNode) => <>Datos: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Fuentes",
  allUsStores: "los 269 Apple Store de EE. UU.",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Comprobaciones propias de RestockWire en directo desde el {since}: cada configuración del iPhone Duo, 18 Pro y 18 Pro Max en {where}, leída cada 15 segundos (cada 5 segundos donde hay una alerta); cifras de esta página leídas a fecha de {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>En directo: cuántos de los {stores} Apple Store tienen cada configuración del {model} para recogida</>,
    storage: "Capacidad",
    pricesCaption: (model: ReactNode) => <>{model}: precio en apple.com (libre, sin impuestos) junto al stock para recogida en directo</>,
    price: "Precio",
    bestColor: "Color más disponible, tiendas ahora",
    noRestock: (model: string) => `Todavía no hay ninguna reposición del ${model} registrada.`,
    clockLabel: (model: string) => `del ${model} en todo el país`,
    storesWithIt: "Tiendas que lo tienen ahora",
    pairsInStock: "Pares tienda × configuración disponibles",
    restocksLogged: "Reposiciones registradas",
    medianTime: "Tiempo mediano disponible",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Mostrador de recogida de madera con el rótulo Pickup dentro de un Apple Store", caption: "Los pedidos con recogida se entregan en un mostrador como este." },
    "phone-map": { alt: "Manos usando una app de mapas en un smartphone al aire libre", caption: "La distancia importa más de lo que parece cuando una reposición dura un minuto." },
    "phone-card-payment": { alt: "Una mujer con un iPhone y una tarjeta de crédito pagando online", caption: "Pagar online para recoger en tienda." },
    "phone-on-box": { alt: "Un smartphone nuevo apoyado sobre su caja blanca", caption: "Un móvil nuevo, recién sacado de la caja." },
    "city-map-phone": { alt: "Dos personas consultando un mapa de la ciudad en un móvil", caption: "Planificar la ruta hasta la tienda." },
    "phone-notification": { alt: "Mano sujetando un móvil con notificaciones en la pantalla de bloqueo", caption: "Una alerta llega a la pantalla de bloqueo." },
    "apple-store-crowd-inside": { alt: "Gente haciendo cola dentro de un Apple Store lleno en un centro comercial", caption: "Colas en un Apple Store la semana del lanzamiento: el stock que llega a la tienda vuela en minutos." },
    "apple-store-glass-canopy": { alt: "Apple Store con fachada de cristal y marquesina de madera de noche", caption: "Un Apple Store acristalado al caer la noche." },
    "apple-store-night-vancouver": { alt: "Un Apple Store iluminado de noche en Vancouver", caption: "Apple Store de noche: el stock para recogida puede aparecer a cualquier hora, pero llega mucho más a menudo por la mañana." },
    "phone-hand-camera": { alt: "Persona sujetando un iPhone con triple cámara", caption: "Los modelos Pro son por los que se hace cola." },
    "place-es-spain": { alt: "La Ciudad de las Artes y las Ciencias de Valencia bajo un cielo azul", caption: "La Ciudad de las Artes y las Ciencias, Valencia." },
    "place-es-madrid-region": { alt: "Los rascacielos de las Cuatro Torres, en el norte de Madrid, con la sierra al fondo", caption: "Las Cuatro Torres, el distrito de negocios de Madrid." },
    "place-es-madrid": { alt: "El edificio Metrópolis en la Gran Vía de Madrid bajo un cielo despejado", caption: "El edificio Metrópolis, en la Gran Vía de Madrid." },
    "place-es-barcelona": { alt: "Vista aérea de la Sagrada Família sobre el Eixample de Barcelona al atardecer", caption: "La Sagrada Família, Barcelona, al atardecer." },
  },
};
