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
/** Weekday in the plural with its article (lunes → los lunes; sábado → los sábados). */
const losDays = (day: string): string => { const d = fixDay(day); return /o$/.test(d) ? `los ${d}s` : `los ${d}`; };
/** Region nouns that are feminine, so the browse row says Todas, not Todos. */
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
    closedNowOpens: (next: string) => `Ahora cerrado · abre ${next}`,
    closedNow: "Ahora cerrado",
  },

  duration: {
    underAMinute: "menos de 1 minuto",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `${n} más`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `del ${place}` : `en ${place}`),
    nRestocks: f({ one: "# reposición", other: "# reposiciones" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Cero reposiciones ${where} en los últimos ${days} días` : `${count} ${where} en los últimos ${days} días (${week} en la última semana)`}${peak ? `; el pico, hacia ${lasS(peak.hour)} (hora de la tienda)${peak.day ? ` y ${losDays(peak.day)}` : ""}` : ""}; Apple no anuncia ningún calendario.`,
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
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No, no en la última comprobación${other ? `. Lo que sí había: ${other.pro} del iPhone 18 Pro y ${other.proMax} del 18 Pro Max` : ". Del 18 Pro y del 18 Pro Max, tampoco nada"}.`,
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
    const at = kind === "store" ? place : kind === "model" ? "cada Apple Store de EE. UU." : `los Apple Store de ${place}`;
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
      `Apple Store en ${name}: iPhone Duo, stock al momento`,
      `Apple Store en ${name}: ¿hay iPhone Duo hoy?`,
      `Apple Store ${name}: stock de iPhone en directo`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store en ${city}, ${code}: iPhone Duo en ${duoNow} de ${stores}`,
      `Apple Store en ${city}, ${code}: iPhone Duo al momento`,
      `Apple Store en ${city}, ${code}: ¿hay iPhone Duo?`,
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
      `${name}: recogida en tienda, stock al momento`,
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
    allStatesCities: "Estados y ciudades, uno a uno →",
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
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Apple Store de {country}: la lista entera →</>,
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
    "apple-store-pickup-counter": { alt: "Amplio atrio de un centro comercial con un Apple Store, escaleras mecánicas y luz natural", caption: "Las tiendas de centro comercial como esta reponen la recogida antes de abrir las puertas." },
    "phone-map": { alt: "Primer plano, al aire libre, de una mano con un smartphone que muestra una app de mapas", caption: "Con un minuto de margen, cada kilómetro hasta la tienda cuenta." },
    "phone-card-payment": { alt: "Mujer que paga sin contacto con su smartphone en un datáfono", caption: "Se paga en apple.com; se recoge en la tienda." },
    "phone-on-box": { alt: "Smartphone en su caja sobre fondo blanco", caption: "Aún en su caja, ya reservado." },
    "city-map-phone": { alt: "Pareja joven que se orienta con el móvil durante un viaje por una carretera rural", caption: "La ruta a la tienda, decidida antes del aviso." },
    "phone-notification": { alt: "Primer plano de una mano con un móvil que muestra la frase motivadora «Hard Work Forever Pays.»", caption: "En esta pantalla aparece el aviso." },
    "apple-store-crowd-inside": { alt: "Clientes probando dispositivos en las mesas de un Apple Store dentro de un centro comercial de Bangkok", caption: "Dentro de la tienda, cada mesa es para probar; la cola de recogida se forma al fondo." },
    "apple-store-glass-canopy": { alt: "Exterior de un Apple Store moderno de cristal junto al río, en el centro de Chicago", caption: "Chicago: un Apple Store de cristal junto al río." },
    "apple-store-night-vancouver": { alt: "Vista aérea de Vancouver de noche, con el skyline y el puente iluminados", caption: "Vancouver de noche. Hay reposiciones a cualquier hora, pero la mañana se lleva la mayoría." },
    "phone-hand-camera": { alt: "Primer plano de una mano con un smartphone de funda naranja y tres cámaras", caption: "Los Pro: el modelo que más colas genera." },
    "place-es-spain": { alt: "Vista aérea del frente de playa de Benidorm con el edificio Intempo", caption: "España: Benidorm y el Intempo, desde el aire." },
    "place-es-madrid-region": { alt: "Tejados históricos y Plaza Mayor de Chinchón bajo un cielo azul despejado", caption: "Comunidad de Madrid: la Plaza Mayor de Chinchón." },
    "place-es-madrid": { alt: "Vista de Madrid al anochecer, con sus edificios más reconocibles", caption: "Madrid al caer la tarde." },
    "place-es-barcelona": { alt: "Panorámica de Barcelona con la Torre Glòries en una mañana despejada", caption: "Barcelona: la Torre Glòries por la mañana." },
    "compare-pickup-bag": { alt: "Dos personas se pasan una bolsa de compras en un interior", caption: "La recogida termina en el mostrador; elegir bien la tienda empieza mucho antes." },
    "compare-two-stores": { alt: "Transeúntes reflejados en el escaparate de cristal de una calle concurrida", caption: "Dos tiendas de la misma ciudad suelen reponer a horas distintas." },
    "guide-android-phone": { alt: "Mano que sostiene un smartphone Android con la pantalla de inicio", caption: "En Android, Chrome entrega los avisos sin instalar nada." },
    "guide-android-watch": { alt: "Primer plano de una mujer con un reloj inteligente", caption: "Un reloj Wear OS vinculado muestra los avisos que recibe Chrome." },
    "guide-focus-desk": { alt: "Mujer joven mirando el móvil en un escritorio de oficina junto a un portátil", caption: "El modo de concentración «Trabajo» es donde más se olvida permitir RestockWire." },
    "guide-focus-phone-night": { alt: "Mujer usando el móvil en un dormitorio a oscuras, iluminada por la pantalla", caption: "El modo «Sueño» silencia los avisos salvo que RestockWire esté en la lista de permitidos." },
    "guide-watch-notification": { alt: "Mano que toca un reloj inteligente en la muñeca, al aire libre", caption: "Mira la tienda en la muñeca y reserva en el iPhone." },
    "guide-watch-wrist": { alt: "Primer plano en blanco y negro de un reloj inteligente con notificaciones en la muñeca", caption: "Con el iPhone bloqueado, el aviso de reposición llega al reloj." },
    "ranking-checkout": { alt: "Cliente pagando con el móvil en el terminal de caja de una tienda", caption: "En las tiendas más rápidas, la reserva debe completarse segundos después del aviso." },
    "ranking-queue": { alt: "Gente haciendo cola frente a una tienda concurrida en una calle de ciudad", caption: "Los agotados rápidos siguen a la demanda alrededor de la tienda, no al tamaño de la entrega." },
    "reports-delivery-boxes": { alt: "Cajas de cartón apiladas frente a los muelles de carga de un almacén", caption: "El stock llega a las tiendas en entregas; el informe semanal cuenta lo que llega a la estantería de recogida." },
    "reports-iphone-boxes": { alt: "Un iPhone nuevo, su caja y accesorios de carga sobre una mesa de madera", caption: "Cada reposición del informe es una configuración que vuelve a una tienda." },
    "status-phone-check": { alt: "Mujer mirando con atención su móvil en una habitación con poca luz", caption: "Esperando una consulta de recogida: los minutos en que importa saber el estado de la consulta." },
    "status-store-counter": { alt: "Mano que sostiene un móvil con un icono de carga en pantalla", caption: "Así se ve una consulta colgada; la página de estado dice si es cosa de Apple o de tu móvil." },
  },
};
