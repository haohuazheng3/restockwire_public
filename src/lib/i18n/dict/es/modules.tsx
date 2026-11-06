/**
 * Spanish (Spain): modules — the restock, store and stock modules. `label` arrives with its preposition
 * ("en Madrid", "en Apple Puerta del Sol", "aquí"); numbers raw (formatted here), durations and times formatted.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, reposiciones, dias, tiendas, v } from "./words";

const agotamientos = (x: number) => `${n(x)} ${x === 1 ? "agotamiento" : "agotamientos"}`;
const configs = (x: number) => `${n(x)} ${x === 1 ? "configuración" : "configuraciones"}`;
const CHECK_NOTE = "cada 15 s; 5 s con alerta";
/** "las 9:00" / "la 1:00". */
const las = (hour: string) => (/^1:/.test(hour) ? `la ${hour}` : `las ${hour}`);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `Todavía no hay nada que dibujar ${label}: ninguna reposición ni agotamiento en los últimos ${n(days)} días. La primera dibujará la primera barra.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${reposiciones(restocks)} y ${agotamientos(soldouts)} ${label} en los últimos ${n(days)} días, ${activeDays === 1 ? "en un solo día" : `repartidos en ${dias(activeDays)}`}.`,
    busiest: (day: string, restocks: number) => <> El día más intenso, el <b className="text-ink">{day}</b>, trajo {n(restocks)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${reposiciones(restocks)}, ${agotamientos(soldouts)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${reposiciones(restocks)} · ${agotamientos(soldouts)}`,
    legendRestocks: "reposiciones",
    legendSoldouts: "agotamientos",
  },

  last24: {
    title: (label: string) => `Las últimas 24 horas de reposiciones del iPhone Duo ${label}`,
    asOf: (when: string) => `comprobado el ${when}`,
    localTime: (when: string) => `${when}, hora local`,
    anAppleStore: "un Apple Store",
    unknown: "El recuento de 24 horas no está disponible en este momento; el stock en directo y el registro de reposiciones de esta página no se ven afectados.",
    none: (label: string, asOf: string) => <><b className="text-ink">Cero reposiciones del iPhone Duo {label} en las últimas 24 horas</b> (comprobado el {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>En las últimas 24 horas, el iPhone Duo se ha repuesto <b className="text-ink">{o.restocks === 1 ? "una vez" : `${n(o.restocks)} veces`} {o.one ? o.label : `en ${n(o.withStores)} de los ${n(o.allStores)} Apple Store ${o.label.replace(/^en /, "de ")}`}</b>; la más reciente fue un <b className="text-ink">{o.config}</b>{o.store != null && <> en {o.store}</>}, el {o.when}, hora local.</>
    ),
    tileRestocks: "reposiciones confirmadas · 24 h",
    tileConfigsBack: "configuraciones que reaparecieron",
    tileStores: (cfgs: number, allConfigs: number) => `tiendas que repusieron${cfgs ? ` · ${n(cfgs)} de ${configs(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>la más reciente · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>la anterior · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "nada anterior registrado",
    caption: (label: string, asOf: string) => `Cada configuración del iPhone Duo ${label}: reposiciones confirmadas en las últimas 24 horas, comprobado el ${asOf}`,
    thConfig: "Configuración",
    thRestocks: "Reposiciones",
    thStores: "Tiendas",
    thLast: "Última reposición (hora local)",
    thNow: "En stock ahora",
    ofStores: (k: number, total: number) => `${n(k)} de ${n(total)}`,
    noneIn24: "ninguna en 24 h",
    yes: "sí",
    no: "no",
    countedTitle: "Qué cuenta aquí como reposición",
    counted: "Son las propias comprobaciones de RestockWire sobre la recogida en tienda de apple.com: cada tienda cada 15 segundos, las tiendas con alertas cada 5. Una reposición entra en el registro solo cuando dos comprobaciones coinciden; la primera vez que se comprueba una tienda no cuenta, y no se mezcla nada publicado por otros rastreadores.",
    alert: (label: string | null) => `Recibe alertas${label != null ? ` ${label}` : ""}: la próxima te llega en segundos`,
  },

  clock: {
    none: (label: string, days: number) => `Por ahora, ninguna reposición ${label} en los últimos ${n(days)} días.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${reposiciones(total)} ${label} en los últimos ${n(days)} días${dates != null ? ` (en ${dias(dates)})` : ""}: todavía no bastan para señalar una hora habitual.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{reposiciones(total)} {label} en los últimos {n(days)} días. La hora habitual es hacia <b className="text-ink">{las(hour)}</b>, hora local{day ? <>; el <b className="text-ink">{day}</b> es el día que más trae</> : null}.</>
    ),
    byHour: (zone: string) => `Por hora · ${zone}`,
    byWeekday: "Por día de la semana",
    barReported: (k: number) => ` (+${n(k)} según otros rastreadores)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} según otros rastreadores`,
    legendOurs: "Confirmadas por RestockWire",
  },

  feed: {
    empty: "Por ahora el registro está vacío.",
    available: "Disponible",
    soldOut: "Agotado",
    soldOutAt: (time: ReactNode) => <>se agotó {time}</>,
    since: (time: ReactNode) => <>disponible desde {time}</>,
    restockedAt: (time: ReactNode) => <>volvió {time}</>,
    mapAria: (store: string) => `Ver ${store} en el mapa`,
    map: "Mapa",
    buyAria: (model: string, config: string) => `Pedir el ${model} ${config} en apple.com`,
    buy: "Pedir en apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `Aún no hay clasificación: no se ha repuesto nada ${label} en los últimos ${n(days)} días.`,
    intro: (label: string, days: number) => `Las configuraciones que volvieron ${label} en los últimos ${n(days)} días, ordenadas por frecuencia.`,
    times: (k: number) => `${n(k)}×`,
    alert: "Recibe alertas",
  },

  sellout: {
    typical: (label: string, band: string) => `Una reposición típica del iPhone Duo ${label} duró unos ${band} antes de agotarse.`,
    half: (label: string, duration: string) => `${duration}: lo que tardó en agotarse la mitad de las reposiciones ${label}.`,
    none: (label: string, days: number) => `Nada ${label} se ha repuesto y luego agotado en los últimos ${n(days)} días.`,
    whatDuo: "iPhone Duo",
    whatAll: "todos los iPhone",
    tileHalf: (what: string) => <>la mitad agotada en · {what}</>,
    tileWithin30: "agotadas en menos de 30 s",
    tileWithin60: "agotadas en menos de 1 min",
    tileFastest: (k: number, days: number) => <>la más rápida · {reposiciones(k)} agotadas, {n(days)} d</>,
    caption: (days: number) => `Por iPhone, últimos ${n(days)} días`,
    thIphone: "iPhone",
    thSoldOut: "Agotadas",
    thHalf: "Mitad agotada en",
    thWithin30: "≤ 30 s",
    thWithin60: "≤ 1 min",
    thFastest: "La más rápida",
    each: "Una fila por reposición",
    barNote: (full: string) => `largo de la barra = segundos disponible · ${full} llena la fila`,
    stillListed: (duration: string) => `aún disponible · ${duration}`,
    approx: (r: string) => `≈ ${r}`,
    measuredTitle: "Cómo se miden estos tiempos",
    measured: (estimated: boolean) =>
      `Una fila que dice «agotado en 45–60 s» significa que nuestra comprobación 45 segundos después de verla por primera vez aún encontró la configuración disponible, y la de los 60 segundos ya no. El ancho de cada intervalo es la distancia entre comprobaciones: 5 segundos en las tiendas con alertas, 15 segundos en todas las demás${estimated ? "; las filas marcadas con ≈ son de antes de que guardáramos la última comprobación y se acotan con la ronda de 15 segundos" : ""}. Un stock que dura menos que ese intervalo puede aparecer y desaparecer entre dos comprobaciones, así que la proporción real agotada en 30 segundos es mayor de lo que muestra la tabla.`,
  },

  configTable: {
    title: "Todas las configuraciones de esta tienda",
    titleAt: (store: string) => `Todas las configuraciones en ${store}`,
    lookupOff: (hasRows: boolean) => `Apple tiene desactivadas ahora mismo las consultas de recogida en esta tienda${hasRows ? " (abajo están sus respuestas más recientes)" : ""}`,
    tracked: (k: number) => `${configs(k)} en vigilancia`,
    firstSweep: "Primera ronda en curso · los estados aparecen en menos de un minuto",
    inStock: (k: number, total: number) => `${n(k)} de ${n(total)} disponibles`,
    available: "Disponible",
    unavailable: "No disponible",
    noLookup: "sin consulta de recogida",
    notChecked: "aún sin comprobar",
    since: (ago: ReactNode) => <>disponible desde {ago}</>,
    lastAvailable: (ago: ReactNode) => <>disponible por última vez {ago}</>,
    neverHere: "nunca ha estado disponible aquí",
    buy: "Pedir",
    alertAria: (model: string, config: string, store: string) => `Recibe una alerta cuando ${store} tenga disponible el ${model} ${config}`,
    alert: "Recibe alertas →",
  },

  matrix: {
    store: "Tienda",
    checked: "Comprobado",
    cellTitle: (model: string, k: number, total: number) => `${model}: ${n(k)} de ${configs(total)} disponibles`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `sin ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `${n(k)} de ${configs(total)} ${v(k, "disponible", "disponibles")} ahora`,
    noneNow: (total: number) => `0 de ${configs(total)} en este momento`,
    lookupOff: "Apple tiene desactivadas ahora mismo las consultas de recogida en esta tienda",
    notChecked: "aún sin comprobar",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>comprobado {ago}</>,
    alert: "Recibe alertas →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>Comprobado {ago} · {CHECK_NOTE}</>,
    map: "Ver en el mapa",
    alert: "Vigila esta tienda",
    alsoIn: (region: string) => `Más tiendas en ${region}`,
    acrossLine: "Tiendas más cercanas al otro lado del límite estatal",
    elsewhere: "Tiendas más cercanas, algo más lejos",
  },

  hours: {
    title: "Horario",
    local: (zone: string) => `Hora local de ${zone}`,
    today: (hours: string, week: string) => ` · hoy ${hours} · ${week}`,
    directions: "Cómo llegar",
    applePage: "esta tienda en apple.com",
    liveMap: "Mapa en directo",
    storePage: "Página de la tienda",
    closed: "Cerrado",
    everyDay: (hours: string) => `Todos los días ${hours}`,
    openNow: (closes: string) => `Abierto ahora · cierra a ${las(closes)}`,
    opensAt: (opens: string) => `Abre a ${las(opens)}`,
    closedToday: (next: string | null) => (next ? `Cerrado hoy · abre ${next}` : "Cerrado hoy"),
    closedNow: (next: string | null) => (next ? `Cerrado ahora · abre ${next}` : "Cerrado ahora"),
    nextOpen: (day: string | null, time: string) => `${day ?? "mañana"} a ${las(time)}`,
  },

  liveStats: {
    inStock: "Disponibles ahora",
    storesWith: "Tiendas con stock",
    lastCheck: "Última comprobación",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${n(k)} de ${tiendas(stores)} ${v(k, "tiene", "tienen")} el ${short} en este momento`,
    lastCheck: (ago: ReactNode) => <>Última comprobación {ago}</>,
    firstSweep: "Primera ronda en curso.",
    noneListed: (model: string, storage: string | null, color: string | null) => `En este momento ninguna tienda tiene el ${model}${storage ? ` ${storage}` : ""}${color ? ` en ${color}` : ""}.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>Disponible {ago}</>,
    loading: "Cargando stock",
  },
};
