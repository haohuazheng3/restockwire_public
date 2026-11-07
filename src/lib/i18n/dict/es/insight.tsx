/**
 * Spanish (Spain): RestockWire's own page families under /es-es/ — estado de la recogida en Apple Store, informes
 * semanales de reposiciones, las Apple Store que más rápido se agotan, tienda contra tienda y tres guías de
 * notificaciones. Same keys and arguments as English (dict/en/insight.tsx). Arguments arrive formatted for Spanish;
 * `w.name` is the bare country name, so the preposition and article are added here. iOS labels as Apple España
 * writes them (Ajustes, Concentración, Resumen programado…).
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { cap } from "./words";

/** Country names that take an article in Spanish. */
const ART: Record<string, string> = {
  "Reino Unido": "el Reino Unido",
  "Países Bajos": "los Países Bajos",
  "Emiratos Árabes Unidos": "los Emiratos Árabes Unidos",
  "Estados Unidos": "EE. UU.",
};
const art = (w: Where): string => (w.us ? "EE. UU." : ART[w.name] ?? w.name);
/** "en España", "en el Reino Unido", "en EE. UU.". */
const en = (w: Where): string => `en ${art(w)}`;
/** "de España", "del Reino Unido". */
const de = (w: Where): string => {
  const a = art(w);
  return a.startsWith("el ") ? `del ${a.slice(3)}` : `de ${a}`;
};
/** Plural picker for counts that arrive as formatted strings or numbers. */
const pl = (x: string | number, one: string, many: string): string => (Number(String(x).replace(/\D/g, "")) === 1 ? one : many);

export const insight: InsightDict = {
  nav: {
    status: "Estado de la recogida en Apple Store",
    reports: "Informes semanales de reposiciones",
    fastest: "Las Apple Store que más rápido se agotan",
    compare: "Tienda contra tienda",
    guides: "Guías de notificaciones en el móvil",
    otherCountries: "Esta misma página para otro país",
    updated: (when: string) => `Actualizado: ${when}`,
    sources: "Fuentes y método",
    cite: "¿Citas estas cifras? Enlaza esta página como fuente.",
    alertCta: "Crear un aviso de reposición",
    logCta: "Ver el registro de reposiciones",
  },

  status: {
    title: (w: Where) => (w.us ? "¿Falla la recogida en Apple Store? Estado en EE. UU." : `Estado de la recogida en Apple Store ${en(w)}`),
    h1: (w: Where) => (w.us ? "¿Funciona ahora la consulta de recogida de Apple?" : `¿Funciona ahora la consulta de recogida de Apple ${en(w)}?`),
    meta: (v: StatusView) =>
      `En directo: Apple respondió en el último minuto a las consultas de recogida de ${v.answered} de ${v.stores} Apple Store ${en(v.w)}. Tasa de fallos, horas difíciles del último día y qué hacer si se atasca.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Sí. En el último minuto, Apple respondió a las consultas de recogida de ${v.answered} de ${v.stores} Apple Store ${en(v.w)}, y en la última hora falló el ${v.failLastHour} de las peticiones.`
        : v.verdict === "slow"
          ? `A medias. En el último minuto, Apple respondió para ${v.answered} de ${v.stores} Apple Store ${en(v.w)}; en la última hora falló el ${v.failLastHour} de las peticiones, así que parte del stock puede aparecer con retraso.`
          : v.verdict === "down"
            ? `Ahora mismo no. En el último minuto, Apple solo respondió para ${v.answered} de ${v.stores} Apple Store ${en(v.w)}. El stock que ves en apple.com y aquí puede estar desfasado hasta que se recupere.`
            : `RestockWire no puede leer el estado ${en(v.w)} en este momento. Vuelve a cargar dentro de un minuto.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Funciona", slow: "Lento", down: "Sin respuesta", unknown: "Desconocido" })[v],
    tiles: {
      answered: "tiendas que respondieron en el último minuto",
      age: "antigüedad mediana de la última consulta por tienda",
      failHour: "peticiones fallidas, últimos 60 minutos",
      failDay: "peticiones fallidas, últimas 24 horas",
    },
    nowH2: "¿Qué ve RestockWire ahora mismo?",
    nowLead: (v: StatusView) =>
      `${v.answered} de ${v.stores} tiendas respondieron en el último minuto${v.age ? `; una tienda típica se consultó hace ${v.age}` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Cada Apple Store ${en(v.w)} se consulta en rondas de 15 segundos; las tiendas con avisos, cada 5 segundos.`,
      v.oldest ? `La tienda que más lleva esperando respondió por última vez hace ${v.oldest}.` : "Ninguna tienda ha respondido todavía en este intervalo.",
      Number(v.never) > 0
        ? `${v.never} ${pl(v.never, "tienda no ha respondido nunca", "tiendas no han respondido nunca")}: Apple no ofrece ahí consulta de recogida en este momento.`
        : "Todas las tiendas han respondido al menos una vez.",
    ],
    dayH2: "¿Cómo han ido las últimas 24 horas?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Sin incidencias: ninguna de las últimas 24 horas llegó al 5 % de peticiones fallidas (${v.failDay} en total).`
        : `${v.roughHours} ${v.roughHours === 1 ? "hora difícil" : "horas difíciles"} en las últimas 24, con un 5 % o más de peticiones fallidas: ${v.roughList}. En total falló el ${v.failDay}.`,
    hourCaption: (zone: string) => `Peticiones y fallos por hora, últimas 24 horas (${zone})`,
    hourHead: ["Hora", "Peticiones", "Fallidas", "% fallidas"],
    whyH2: "¿Por qué apple.com muestra todas las tiendas como no disponibles?",
    whyLead: "Casi siempre porque la configuración está agotada. A veces, porque la propia consulta de Apple va mal.",
    whyPoints: [
      "**Agotado:** la consulta responde con normalidad y simplemente no aparece ninguna tienda. Esta página sigue en verde.",
      "**Fallo de la consulta:** las respuestas fallan o llegan vacías para todas las tiendas a la vez. Esta página pasa a ámbar o rojo en menos de un minuto.",
      "**Tu sesión:** una pestaña antigua de apple.com puede conservar una respuesta vieja. Recarga la página de la bolsa antes de fiarte.",
    ],
    doH2: "¿Qué hacer cuando se atascan las consultas de recogida?",
    doLead: "Deja el aviso activado y espera. Una consulta atascada se recupera sola, y las reposiciones de mientras se siguen confirmando.",
    doSteps: [
      "Deja el aviso en marcha: RestockWire sigue preguntando y te avisa en cuanto llega una reposición confirmada.",
      "No recargues apple.com cada pocos segundos: no acelera la consulta de Apple.",
      "Vuelve a esta página en cinco minutos. Los baches vistos hasta ahora han durado de unos minutos a unas dos horas.",
      "Cuando vuelva el verde, abre la página de tu tienda: el registro de reposiciones muestra lo que llegó durante el corte.",
    ],
    methodH2: "¿Cómo se mide el estado?",
    methodPoints: [
      "**Actualidad:** la última consulta correcta de cada tienda, a partir de las consultas de recogida propias de RestockWire.",
      "**Fallos:** peticiones fallidas por hora en la ronda que cubre este país, según los registros de nuestros servidores de consulta.",
      "**Veredicto:** Funciona = el 90 % de las tiendas respondió en el último minuto y menos del 5 % de fallos; Sin respuesta = menos de la mitad.",
    ],
    otherH2: "Estado de la recogida en otros países",
    faq: (v: StatusView) => [
      { q: "¿Está caída la recogida en tienda de apple.com?", a: v.verdict === "ok" ? `No ${en(v.w)}, ahora mismo: ${v.answered} de ${v.stores} tiendas respondieron en el último minuto.` : `Ahora mismo va mal ${en(v.w)}: ${v.answered} de ${v.stores} tiendas respondieron en el último minuto.` },
      { q: "¿Un estado en rojo significa que el iPhone está agotado?", a: "No. El rojo indica que la consulta de Apple falla; un agotado es una respuesta normal y deja el estado en verde." },
      { q: "¿Cada cuánto se actualiza esta página?", a: "Cada visita lee cifras nuevas; los recuentos tienen como mucho 30 segundos." },
      { q: "¿Me perderé una reposición mientras la consulta esté caída?", a: "Puede que la veas tarde. RestockWire confirma cada reposición en cuanto vuelven las respuestas y te avisa entonces." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Informes semanales de reposiciones de iPhone, EE. UU." : `Reposiciones de iPhone ${en(w)}, semana a semana`),
    indexH1: (w: Where) => (w.us ? "Informes semanales de reposiciones de iPhone" : `Informes semanales de reposiciones de iPhone ${en(w)}`),
    indexMeta: (w: Where) => `Cada semana de reposiciones del iPhone Duo, 18 Pro y 18 Pro Max en las Apple Store ${de(w)}: cifras, tiendas con más actividad, configuraciones y velocidad de agotado.`,
    indexLead: (w: Where, n: number) =>
      n === 0
        ? `El primer informe ${en(w)} aparecerá cuando una semana sume ${"20"} reposiciones confirmadas.`
        : `${n} ${n === 1 ? "semana registrada" : "semanas registradas"} ${en(w)}. Cada edición es el registro de reposiciones confirmadas de RestockWire de una semana de lunes a domingo, en hora local.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} ${pl(restocks, "reposición", "reposiciones")}${complete ? "" : " · en curso"}`,
    title: (w: Where, range: string) => (w.us ? `Reposiciones de iPhone, ${range}` : `Reposiciones de iPhone ${en(w)}, ${range}`),
    h1: (w: Where, range: string) => `Reposiciones de iPhone ${en(w)}, semana del ${range}`,
    meta: (v: ReportView) => `${v.restocks} reposiciones confirmadas de iPhone en ${v.stores} Apple Store ${de(v.w)}, ${v.range}. La tienda y el día con más actividad, la configuración más difícil y lo rápido que se agotó todo.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "En lo que va de semana: "}${v.restocks} reposiciones confirmadas en ${v.stores} Apple Store ${en(v.w)}${v.change ? `, ${v.change} frente a la semana anterior` : ""}.${v.topStore ? ` ${v.topStore} va en cabeza con ${v.topStoreN}.` : ""}${v.medianSell ? ` Una reposición típica del iPhone Duo duró ${v.medianSell}.` : ""}`,
    partial: (days: number) => `El seguimiento cubre ${days} ${days === 1 ? "día" : "días"} de esta semana.`,
    running: "Esta semana sigue abierta; las cifras se actualizan con cada reposición confirmada.",
    tiles: {
      restocks: "reposiciones confirmadas",
      stores: "tiendas con alguna reposición",
      sell: "disponibilidad mediana del iPhone Duo",
      change: "frente a la semana anterior",
    },
    countH2: "¿Cuántas reposiciones trajo la semana?",
    countLead: (v: ReportView) => `${v.restocks} en total: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro} e iPhone 18 Pro Max ${v.proMax}, repartidas en ${v.configs} configuraciones.`,
    storesH2: "¿Qué Apple Store repusieron más?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, con ${v.topStoreN} reposiciones. Debajo, las diez primeras.` : "Ninguna tienda repuso esta semana."),
    storesHead: ["#", "Apple Store", "Reposiciones"],
    configsH2: "¿Qué configuraciones del iPhone Duo volvieron?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `La que más volvió: ${v.topConfig} (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` La que menos: ${v.lastConfig}.` : ""}` : "Ninguna configuración del iPhone Duo se repuso esta semana.",
    configsHead: ["Configuración", "Reposiciones"],
    sellH2: "¿Cuánto tardaron en agotarse?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `Una reposición típica del iPhone Duo duró ${v.medianSell}; el ${v.within60} se agotó en menos de un minuto (${v.sellN} reposiciones cronometradas).` : "Esta semana hay muy pocos agotados cronometrados para sacar conclusiones.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `La semana anterior: ${v.prevMedianSell}.` : ""),
    daysH2: "¿Qué días hubo más movimiento?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${cap(v.busiestDay)}, con ${v.busiestDayN} reposiciones${v.quietDay ? `; el más tranquilo fue el ${v.quietDay}` : ""}.` : "Todavía no hay reposiciones que repartir por días."),
    daysHead: ["Día", "Reposiciones"],
    weekdays: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"],
    prevH2: "¿Cómo se compara con la semana anterior?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null
        ? "No hay una semana anterior registrada con la que comparar."
        : v.change == null
          ? `La semana anterior registró ${v.prevRestocks}. La variación aparece cuando las dos semanas están completas y con seguimiento entero.`
          : v.changeDir === "up"
            ? `Más movida: ${v.restocks} reposiciones frente a ${v.prevRestocks} (${v.change}).`
            : v.changeDir === "down"
              ? `Más tranquila: ${v.restocks} reposiciones frente a ${v.prevRestocks} (${v.change}).`
              : `Más o menos igual: ${v.restocks} frente a ${v.prevRestocks}.`,
    prevNote: "Una semana a medias compara unos días con una semana entera; lee la variación cuando la semana cierre.",
    readH2: "¿Qué significa esta semana si quieres comprar uno?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Las reposiciones se concentraron el ${v.busiestDay}: ten los avisos activados todo ese día.` : "Ten los avisos activados todos los días: las reposiciones no siguen un horario fijo.",
      v.medianSell ? `Con una disponibilidad típica de ${v.medianSell}, la reserva tiene que empezar segundos después del aviso.` : "Duran poco: actúa a los pocos segundos del aviso.",
      v.topStore ? `${v.topStore} fue la que más repuso; si te pilla cerca, añádela a tu aviso.` : "Vigila las tiendas a las que puedas llegar; una segunda tienda cercana duplica tus opciones.",
    ],
    methodH2: "¿Cómo se cuenta el informe?",
    methodPoints: [
      "**Reposición:** una configuración que pasa de no disponible a disponible en una tienda, confirmada por una segunda consulta. Las primeras apariciones no cuentan.",
      "**Semana:** del lunes a las 0:00 al domingo a las 24:00, en la zona horaria principal del país.",
      "**Tiempo disponible:** desde una reposición confirmada hasta el siguiente agotado confirmado de la misma tienda y configuración.",
    ],
    archiveH2: "Otras semanas",
    faq: (v: ReportView) => [
      { q: `¿Cuántos iPhone repuso Apple ${en(v.w)} esta semana?`, a: `RestockWire confirmó ${v.restocks} reposiciones en ${v.stores} tiendas; cada una es una configuración que vuelve en una tienda, no un número de unidades.` },
      { q: "¿Publica Apple cifras de reposición?", a: "No. Estas cifras son observaciones confirmadas por RestockWire de la disponibilidad para recogida de Apple." },
      { q: "¿Cuándo sale un informe nuevo?", a: "Cada lunes empieza una semana nueva; su página se completa a medida que se confirman reposiciones y se cierra el domingo por la noche." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Apple Store donde antes se agota el iPhone Duo" : `Apple Store que antes se agotan ${en(w)}`),
    h1: (w: Where) => `¿En qué Apple Store ${de(w)} se agota antes el iPhone Duo?`,
    meta: (v: RankView) => `${v.fastest ?? "La tienda más rápida"} ${en(v.w)}: las reposiciones del iPhone Duo vuelan en ${v.fastestSec ?? "segundos"} de mediana. Todas las tiendas clasificadas, últimos ${v.days} días, y dónde aún tienes opciones.`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest} es la más rápida: una reposición típica del iPhone Duo se agotó allí en ${v.fastestSec} (${v.fastestN} reposiciones cronometradas, últimos ${v.days} días).${v.slowest ? ` En ${v.slowest} duró ${v.slowestSec}.` : ""}`
        : `Todavía hay muy pocos agotados cronometrados ${en(v.w)} en los últimos ${v.days} días para clasificar tiendas.`,
    tiles: { fastest: "tienda más rápida, disponibilidad mediana", slowest: "tienda clasificada más lenta", ranked: "tiendas clasificadas", country: "mediana de todo el país" },
    fastH2: "Las tiendas más rápidas",
    fastLead: (v: RankView) => `${v.ranked} tiendas suman ${v.minPairs} o más reposiciones cronometradas en los últimos ${v.days} días. Primero, la mediana más rápida.`,
    head: ["#", "Apple Store", "Disponibilidad mediana", "La más corta", "Cronometradas", "Reposiciones"],
    slowH2: "¿Dónde todavía tienes opciones?",
    slowLead: (v: RankView) => (v.slowest ? `Al final de la tabla: ${v.slowest} mantuvo una reposición típica durante ${v.slowestSec}. Cuanto más dura, más tiempo para pagar.` : "Todavía no hay datos suficientes."),
    meansH2: "¿Qué supone para ti una tienda rápida?",
    meansPoints: (v: RankView) => [
      `Una mediana de ${v.fastestSec ?? "unos pocos segundos"} no deja tiempo para mirar: ten la configuración en la bolsa y Apple Pay listo.`,
      "Añade a tu aviso una tienda cercana más lenta: dos tiendas duplican tus opciones.",
      "La velocidad refleja la demanda alrededor de la tienda, no cuánto stock llega.",
    ],
    methodH2: "¿Cómo se elabora la clasificación?",
    methodPoints: (v: RankView) => [
      `**Tiempo disponible:** desde una reposición confirmada hasta el siguiente agotado confirmado de la misma configuración en la misma tienda; solo iPhone Duo, últimos ${v.days} días.`,
      `**Tiendas clasificadas:** ${v.minPairs} o más reposiciones cronometradas; con menos, una sola reposición con suerte decidiría.`,
      "**Márgenes:** los tiempos son cotas superiores hasta la siguiente consulta (entre 5 y 15 segundos).",
    ],
    faq: (v: RankView) => [
      { q: `¿En qué Apple Store ${de(v.w)} cuesta más conseguir un iPhone Duo?`, a: v.fastest ? `En ${v.fastest}: sus reposiciones se agotaron antes, en ${v.fastestSec} de mediana.` : "Todavía no hay datos suficientes para decirlo." },
      { q: "¿Agotarse rápido significa que llegan menos móviles?", a: "No necesariamente. Sobre todo significa que hay más gente esperando en esa tienda." },
      { q: "¿Cada cuánto se actualiza la clasificación?", a: "Cada pocos minutos, con los últimos 14 días." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store frente a Apple Store: reposiciones" : `Apple Store ${en(w)}, frente a frente`),
    indexH1: (w: Where) => `Dos Apple Store en la misma ciudad: ¿cuál repone más ${en(w)}?`,
    indexMeta: (w: Where) => `Apple Store vecinas ${en(w)}, lado a lado: reposiciones de iPhone de los últimos 14 días, la hora habitual, cuánto dura una reposición y cuál vigilar.`,
    indexLead: (n: string) => `${n} ${pl(n, "comparación", "comparaciones")}: cada una enfrenta una tienda con su vecina más cercana de la misma ciudad.`,
    title: (a: string, b: string) => `${a} o ${b}: ¿cuál repone más?`,
    h1: (a: string, b: string) => `${a} o ${b}: ¿cuál recibe más reposiciones de iPhone?`,
    meta: (v: CompareView) => `${v.a.name} frente a ${v.b.name}, a ${v.distance} en ${v.city}: reposiciones de iPhone de los últimos ${v.days} días, hora habitual, tiempo disponible y qué tienda vigilar.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} y ${v.b.name} repusieron con la misma frecuencia` : `${(v.more === "a" ? v.a : v.b).name} repuso más`;
      const nums = ` (${v.a.restocks} frente a ${v.b.restocks} en los últimos ${v.days} días)`;
      const slow = v.slower ? ` Las reposiciones duraron más en ${(v.slower === "a" ? v.a : v.b).name}, lo que te da más tiempo para pagar.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Lado a lado, últimos ${days} días`,
    rows: { restocks: "Todas las reposiciones", duo: "Reposiciones del iPhone Duo", peak: "Hora habitual de reposición (local)", sell: "Disponibilidad mediana del iPhone Duo", sellN: "Reposiciones cronometradas", last: "Última reposición" },
    none: "sin datos suficientes",
    moreH2: "¿Qué tienda recibe más reposiciones de iPhone?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Ninguna: las dos tuvieron ${v.a.restocks}.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, con ${v.ratio} las reposiciones de la otra` : ""}.`),
    hourH2: "¿A qué hora repone cada una?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name}, sobre todo hacia las ${v.a.peak}; ${v.b.name}, hacia las ${v.b.peak}.` : "Una de las dos tiene todavía muy pocas reposiciones para fijar una hora habitual.",
    sellH2: "¿Dónde dura más una reposición?",
    sellLead: (v: CompareView) =>
      v.slower ? `En ${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} frente a ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "Aún no hay una diferencia clara: hay muy pocos agotados cronometrados o las dos medianas están a menos de un 15 % entre sí.",
    pickH2: "¿Cuál deberías vigilar?",
    pickPoints: (v: CompareView) => [
      `Las dos: están a ${v.distance}, y un mismo plan de avisos cubre varias tiendas.`,
      v.more !== "tie" ? `Si solo puedes ir a una, ${(v.more === "a" ? v.a : v.b).name} repuso más a menudo.` : "Si solo puedes ir a una, elige la más cercana: reponen lo mismo.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} te da más segundos por reposición.` : "Los tiempos disponibles todavía no dan un ganador claro.",
    ],
    methodH2: "¿De dónde salen estas cifras?",
    methodPoints: (v: CompareView) => [
      `Las reposiciones confirmadas por RestockWire en ambas tiendas durante los últimos ${v.days} días; una reposición cuenta cuando la confirma una segunda consulta.`,
      "La hora habitual solo se indica a partir de 5 reposiciones repartidas en 3 días.",
      "Los tiempos disponibles son cotas superiores hasta la siguiente consulta; solo iPhone Duo.",
    ],
    storePages: "Páginas de las tiendas",
    otherPairs: "Más comparaciones",
    faq: (v: CompareView) => [
      { q: `¿Es mejor ${v.a.name} o ${v.b.name} para recoger un iPhone Duo?`, a: v.more === "tie" ? "Repusieron con la misma frecuencia en los últimos 14 días; elige la más cercana o vigila las dos." : `${(v.more === "a" ? v.a : v.b).name} repuso más a menudo en los últimos 14 días.` },
      { q: "¿Puedo vigilar las dos tiendas?", a: "Sí, con dos avisos: un aviso es una tienda y una configuración, así que dos tiendas ocupan dos avisos de tu plan." },
      { q: "¿Las dos tiendas reponen a la vez?", a: "Normalmente no. Cada tienda recibe sus propias entregas; compara arriba sus horas habituales." },
    ],
  },

  guides: {
    watch: {
      title: "Avisos de reposición de iPhone en el Apple Watch",
      h1: "¿Cómo recibir avisos de reposición de iPhone en el Apple Watch?",
      meta: "Recibe en la muñeca los avisos de RestockWire: app en la pantalla de inicio, notificaciones activadas, duplicado en la app Watch y los ajustes que los mandan al iPhone.",
      answer: (live: string | null) =>
        `Añade RestockWire a la pantalla de inicio del iPhone, activa sus notificaciones y deja el duplicado activado en la app Watch: los avisos llegarán al Apple Watch siempre que el iPhone esté bloqueado.${live ? ` Con reposiciones que duran ${live} de mediana, un toque en la muñeca te ahorra los segundos de buscar el móvil.` : ""}`,
      sections: [
        {
          h2: "¿Qué necesitas antes?",
          lead: "Un iPhone con iOS 16.4 o posterior, RestockWire en la pantalla de inicio y las notificaciones permitidas.",
          points: [
            "Abre restockwire.com en Safari, toca Compartir y luego «Añadir a pantalla de inicio».",
            "Abre RestockWire desde la pantalla de inicio, inicia sesión y toca «Activar notificaciones».",
            "Acepta el aviso. Las notificaciones de la app web se comportan como las de cualquier app, en la pantalla bloqueada y en el Centro de notificaciones.",
          ],
        },
        {
          h2: "¿Cómo llegan los avisos al reloj?",
          lead: "Por duplicado: Apple envía cada notificación a un solo dispositivo, al reloj cuando el iPhone está bloqueado o en reposo.",
          points: [
            "iPhone desbloqueado y en uso: el aviso aparece en el iPhone, no en el reloj.",
            "iPhone bloqueado o en reposo y reloj desbloqueado en la muñeca: el aviso va al reloj.",
            "Reloj bloqueado o en «No molestar»: el aviso va al iPhone.",
          ],
        },
        {
          h2: "¿Qué ajustes del reloj conviene revisar?",
          lead: "Dos: el duplicado para RestockWire y si los avisos se muestran con la muñeca bajada.",
          points: [
            "En el iPhone, abre la app Watch, toca Notificaciones y mira en «Duplicar alertas del iPhone de». Si aparece RestockWire, déjalo activado.",
            "Las notificaciones aparecen al levantar la muñeca. Para verlas sin levantarla, activa «Mostrar notificaciones con la muñeca bajada» (Show Notifications on Wrist Down).",
            "El modo de bajo consumo apaga la pantalla siempre activa, así que quizá tengas que levantar la muñeca para leer un aviso.",
          ],
        },
        {
          h2: "¿Qué hacer cuando el aviso te toca la muñeca?",
          lead: "Actúa en el iPhone en segundos: la reserva se hace en apple.com.",
          points: [
            "Lee la tienda y la configuración en el reloj y desbloquea el iPhone.",
            "Toca el aviso en el iPhone para abrir la página de la tienda y el enlace de Apple.",
            "Ten Apple Pay configurado en apple.com para pagar con un par de toques.",
          ],
        },
      ],
      faq: [
        { q: "¿Funcionan los avisos de RestockWire en el Apple Watch?", a: "Sí. Las notificaciones de una app web de la pantalla de inicio aparecen en un Apple Watch enlazado como las de cualquier app." },
        { q: "¿Por qué el aviso salió en el iPhone y no en el reloj?", a: "El iPhone estaba desbloqueado, o el reloj estaba bloqueado o en «No molestar»; en esos casos Apple lo entrega al iPhone." },
        { q: "¿Necesito una app aparte para el reloj?", a: "No. El reloj muestra los avisos que recibe el iPhone; no hay nada que instalar en el reloj." },
      ],
      sources: [
        { label: "WebKit: notificaciones push para apps web en iOS y iPadOS (en inglés)", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Soporte de Apple: notificaciones en el Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Manual de uso del Apple Watch: gestionar notificaciones", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Que el modo Concentración no te oculte los avisos",
      h1: "¿Cómo hacer que los avisos atraviesen Concentración y el Resumen programado?",
      meta: "Deja pasar los avisos de RestockWire en un modo de Concentración, sácalos del Resumen programado y haz que suenen y se vean en la pantalla bloqueada. Paso a paso, iOS 16.4 o posterior.",
      answer: (live: string | null) =>
        `Añade RestockWire a las apps permitidas de cada modo de Concentración y pon su entrega de notificaciones en inmediata: así el aviso suena aunque haya un modo activado.${live ? ` Una reposición dura ${live} de mediana, así que un aviso retenido para un resumen llega tarde.` : ""}`,
      sections: [
        {
          h2: "¿Cómo se permite RestockWire en un modo de Concentración?",
          lead: "En Ajustes, abre Concentración, elige el modo, toca Apps y añade RestockWire en «Permitir notificaciones de».",
          points: [
            "Apple permite que un modo de Concentración deje pasar o silencie apps web concretas añadidas a la pantalla de inicio.",
            "Repítelo en cada modo que uses: Dormir, Trabajo, Personal y los que hayas creado.",
            "Los ajustes de Concentración de una app web con el mismo nombre se sincronizan con tus otros dispositivos Apple.",
          ],
        },
        {
          h2: "¿Cómo se sacan los avisos del Resumen programado?",
          lead: "Deja RestockWire sin marcar en la lista del resumen, o pon su entrega en inmediata.",
          points: [
            "Ajustes > Notificaciones > Resumen programado: la lista de la A a la Z decide qué apps se retienen para el resumen.",
            "O bien Ajustes > Notificaciones > RestockWire > «Entrega de notificaciones» > «Entrega inmediata» (Notification Delivery > Immediate Delivery).",
            "Una reposición retenida para el resumen de las 8:00 lleva mucho rato agotada.",
          ],
        },
        {
          h2: "¿Qué ajustes de notificación importan más?",
          lead: "Permitir notificaciones activado, Pantalla bloqueada y Tiras activadas, Sonidos activado.",
          points: [
            "El estilo de tira Persistente mantiene el aviso en pantalla hasta que hagas algo.",
            "«Mostrar previsualizaciones: Si está desbloqueado» oculta la tienda y la configuración con la pantalla bloqueada; elige Siempre si quieres leerlas de un vistazo.",
            "Apple no documenta un nivel Urgente para las notificaciones de apps web, así que no cuentes con él para atravesar un modo de Concentración: eso lo hace la lista de permitidas.",
          ],
        },
        {
          h2: "¿Cómo se prueba?",
          lead: "Envíate una notificación de prueba desde tu cuenta de RestockWire con un modo de Concentración activado.",
          points: [
            "Abre RestockWire desde la pantalla de inicio, ve a tu cuenta y toca «Enviar notificación de prueba».",
            "Activa el modo de Concentración que más uses y envía otra.",
            "Si llega sin sonido o no llega, revisa la lista de permitidas del modo y el ajuste de entrega.",
          ],
        },
      ],
      faq: [
        { q: "¿Un modo de Concentración bloquea los avisos de RestockWire?", a: "Sí, salvo que RestockWire esté en la lista de permitidas de ese modo. Añádelo una vez en cada modo." },
        { q: "¿Puede RestockWire enviar notificaciones urgentes?", a: "Apple no documenta ese nivel para el push de apps web, así que RestockWire se apoya en la lista de permitidas de Concentración." },
        { q: "¿Por qué me llegan los avisos todos juntos por la mañana?", a: "Los está reteniendo el Resumen programado. Pon RestockWire en «Entrega inmediata»." },
      ],
      sources: [
        { label: "Manual de uso del iPhone: permitir o silenciar notificaciones en un modo de Concentración", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "Manual de uso del iPhone: cambiar los ajustes de notificaciones", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: notificaciones push para apps web en iOS y iPadOS (en inglés)", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "Avisos de reposición de iPhone en Android y Wear OS",
      h1: "¿Se pueden recibir avisos de reposición de iPhone en Android o en un reloj Wear OS?",
      meta: "¿Esperas un iPhone desde un móvil Android? Los avisos de RestockWire funcionan en Chrome sin instalar nada y llegan a un reloj Wear OS o Galaxy enlazado.",
      answer: (live: string | null) =>
        `Sí. Abre RestockWire en Chrome para Android, inicia sesión y permite las notificaciones cuando Chrome lo pida; los avisos llegan como los de cualquier app y pueden pasar a un reloj enlazado.${live ? ` Las reposiciones duran ${live} de mediana, así que deja las notificaciones con sonido.` : ""}`,
      sections: [
        {
          h2: "¿Cómo se activan los avisos en Chrome?",
          lead: "Inicia sesión en restockwire.com con Chrome y toca Permitir cuando la web pida enviarte notificaciones.",
          points: [
            "No hay nada que instalar: Chrome pide permiso cuando una web quiere enviarte notificaciones.",
            "Si antes tocaste Bloquear, abre la configuración del sitio desde la barra de direcciones y permite las notificaciones.",
            "En Android, añadir RestockWire a la pantalla de inicio es opcional; solo le da su propio icono.",
          ],
        },
        {
          h2: "¿Llegan los avisos a un reloj Wear OS o Galaxy?",
          lead: "Normalmente sí: las notificaciones del móvil pasan por defecto a un reloj Wear OS enlazado.",
          points: [
            "Es Chrome quien publica los avisos de RestockWire, así que el reloj los muestra bajo Chrome.",
            "En un Galaxy Watch, abre Galaxy Wearable > Ajustes del reloj > Notificaciones > Notificaciones de aplicaciones y deja Chrome activado.",
            "Si dejan de llegar, comprueba que el ahorro de batería no esté limitando Chrome en segundo plano.",
          ],
        },
        {
          h2: "¿Y en un portátil?",
          lead: "Chrome, Edge y Firefox en un ordenador muestran los mismos avisos mientras el navegador esté abierto.",
          points: [
            "Inicia sesión y permite las notificaciones en el navegador que más tengas abierto.",
            "Cada dispositivo con las notificaciones activadas recibe todos los avisos.",
            "Si ningún dispositivo tiene las notificaciones activadas, RestockWire te envía el aviso por correo.",
          ],
        },
      ],
      faq: [
        { q: "¿Necesito un iPhone para usar RestockWire?", a: "No. Cualquier móvil u ordenador con un navegador compatible con notificaciones web recibe los avisos." },
        { q: "¿Por qué mi reloj muestra el aviso bajo Chrome?", a: "En Android, Chrome entrega las notificaciones de las webs, así que el reloj las agrupa bajo Chrome." },
        { q: "¿Puedo recibir avisos en dos móviles?", a: "Sí. Inicia sesión y permite las notificaciones en cada uno; todos los dispositivos reciben todos los avisos." },
      ],
      sources: [
        { label: "Ayuda de Google Chrome: usar notificaciones", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: notificaciones en Wear OS (en inglés)", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: gestionar notificaciones en un Galaxy Watch (en inglés)", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Más guías de notificaciones",
  },
};
