/**
 * Spanish (Spain): modules — restock, store and stock blocks. The place label comes in with its preposition
 * already attached (en + place, or aquí); numbers come raw and are formatted below, durations and times come formatted.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { n, reposiciones, dias, tiendas, v } from "./words";

const agotamientos = (x: number) => `${n(x)} ${x === 1 ? "agotamiento" : "agotamientos"}`;
const configs = (x: number) => `${n(x)} ${x === 1 ? "configuración" : "configuraciones"}`;
const CHECK_NOTE = "ronda de 15 s · 5 s si tiene alerta";
/** Article for an hour: la before 1:xx, las otherwise. */
const las = (hour: string) => (/^1:/.test(hour) ? `la ${hour}` : `las ${hour}`);

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("es-ES");
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
    thLast: "Repuesta por última vez (hora de la tienda)",
    thNow: "¿Disponible ya?",
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
      `${n(days)} días, ${reposiciones(total)} ${label}${dates != null ? `, repartidas en ${dias(dates)}` : ""}. Con eso aún no sale una hora habitual.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{reposiciones(total)} {label} en los últimos {n(days)} días. La hora habitual es hacia <b className="text-ink">{las(hour)}</b>, hora local{day ? <>; el <b className="text-ink">{day}</b> es el día que más trae</> : null}.</>
    ),
    byHour: (zone: string) => `Por hora · ${zone}`,
    byWeekday: "Día a día",
    barReported: (k: number) => ` (+${n(k)} publicadas por otros rastreadores)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: ${n(k)} publicadas por otros rastreadores`,
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
    title: "Esta tienda, configuración a configuración",
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
    closedToday: (next: string | null) => (next ? `Hoy cerrado · abre ${next}` : "Hoy cerrado"),
    closedNow: (next: string | null) => (next ? `Ahora cerrado · abre ${next}` : "Ahora cerrado"),
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
    lastCheck: (ago: ReactNode) => <>Revisado {ago}</>,
    firstSweep: "Aún corre la primera comprobación.",
    noneListed: (model: string, storage: string | null, color: string | null) => `En este momento ninguna tienda tiene el ${model}${storage ? ` ${storage}` : ""}${color ? ` en ${color}` : ""}.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>Disponible {ago}</>,
    loading: "Cargando stock",
  },
  /** WireNow: el boletín con el que abren las páginas de región, ciudad, tienda, país e iPhone Duo. `label` llega con preposición («en Madrid», «en Apple Puerta del Sol»); todas las cifras son de los últimos 14 días. */
  wireNow: {
    eyebrow: (label: string) => `En el hilo · iPhone Duo ${label}`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>Última vez listado: <b className="text-ink">{o.config}</b>{o.store != null && <> en {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number) => `Ningún iPhone Duo listado ${label} en los últimos ${WN(days)} días.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">Listado ahora mismo en {WN(o.k)} de {WN(o.n)} tiendas</b> {o.label} (lectura {o.stamp}): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">Listado ahora mismo: {o.k} de {o.total} configuraciones</b> en {o.name} (lectura {o.stamp}): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">Nada listado a las {o.stamp}</b>: ninguna de las {WN(o.n)} tiendas Apple {o.label} muestra un iPhone Duo para recogida.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">Nada listado a las {o.stamp}</b>: {o.name} no muestra ninguna configuración del iPhone Duo para recogida.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs} config.)</>,
    configItem: (config: string) => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro: ${o.pro} de ${o.configs} configuraciones aquí; 18 Pro Max: ${o.max}.` : `El iPhone 18 Pro está en ${o.pro} de ellas, el 18 Pro Max en ${o.max}.`),
    tRestocks: (days: number) => `reposiciones del Duo, últimos ${WN(days)} días`,
    tGone60: "de los listados cronometrados se agotó en menos de un minuto",
    tLongest: "listado más largo de la semana",
    tWindow: (range: string) => `de las reposiciones cayeron ${range}`,
    tToday: "reposiciones de hoy, por ahora",
    tStores: (n: number) => `de ${WN(n)} tiendas repusieron en el periodo`,
    wireTime: (stamp: string) => `Hora del hilo ${stamp}`,
    reads: (note: string) => `lecturas ${note}`,
    window: (days: number) => `ventana de ${WN(days)} días`,
    method: "una reposición cuenta solo con dos lecturas coincidentes; la primera aparición de una tienda nunca cuenta",
    zone: () => "hora de la tienda",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }) =>
      `${o.range}, ${o.zone}: a esa hora vuelve el iPhone Duo ${o.label}. Esa franja se llevó el ${o.pct} de las ${WN(o.n)} reposiciones que RestockWire registró ${o.one ? "aquí" : `en las ${WN(o.stores)} tiendas Apple ${o.label}`} en los últimos ${WN(o.days)} días. Hora punta ${o.busiest}, ${WN(o.busiestN)} reposiciones.${o.config ? ` La ${o.config} fue la más repuesta (${WN(o.k)} de ${WN(o.n)}).` : ""}${o.median ? ` Listado mediano: agotado en ${o.median}.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }) => `${WN(o.n)} reposición${o.n === 1 ? "" : "es"} del iPhone Duo ${o.one ? o.label : `en las ${WN(o.stores)} tiendas Apple ${o.label}`} en los últimos ${WN(o.days)} días: pocas para hablar de una hora habitual. Cada una aparece abajo.`,
    hourByHour: "Cada hora, cada tienda →",
    lastThree: (n: number, label: string) => (n === 1 ? `El último listado del Duo ${label}` : `Los últimos ${WN(n)} listados del Duo ${label}`),
    secs: (n: number) => `${WN(n)} s`,
    mins: (n: number) => `${WN(n)} min`,
    upRange: (low: string, high: string) => `listado ${low}–${high}`,
    upAbout: (x: string) => `listado unos ${x}`,
    stillUp: (x: string) => `sigue listado (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }) => (o.one
      ? `${WN(o.sent)} aviso${o.sent === 1 ? "" : "s"} por reposiciones del Duo ${o.label} en los últimos ${WN(o.days)} días.`
      : `${WN(o.sent)} aviso${o.sent === 1 ? "" : "s"} por reposiciones del Duo en ${WN(o.stores)} de las ${WN(o.total)} tiendas ${o.label} en los últimos ${WN(o.days)} días.`),
    alertMe: (name: string) => `Poner ${name} en el hilo de 5 segundos`,
    unknown: "Esta vez no se pudieron leer las cifras de patrón; el listado de arriba está en directo.",
    allModels: (o: { n: number; days: number; peak: string | null }) => `Los tres iPhone juntos: ${WN(o.n)} reposiciones en ${WN(o.days)} días${o.peak ? `, pico a las ${o.peak}` : ""}.`,
  },
};
