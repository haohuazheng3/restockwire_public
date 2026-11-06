/**
 * Spanish (Spain) strings: wire — the four restock-log modules (RestockHeatmap, RestockStreak, SellOutRanking,
 * RestockLeaderboard). `label` arrives with its preposition ("en Madrid", "en Apple Passeig de Gràcia", "en España",
 * "aquí"); weekdays arrive as Spanish names ("martes"), hours as "7:00–9:00", `noun` as the English region word
 * ("province").
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { NOUNS, cap, dias, losDias, n as N, reposiciones, tiendas } from "./words";

/** The English region word ("province") in Spanish, singular. */
const region1 = (noun: string) => (NOUNS[noun] ?? NOUNS.area).one;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `¿Cuándo repone Apple el ${what} ${label}? Día × hora`,
    unknown: "Ahora mismo no se puede leer la cuadrícula por día y hora; el stock en directo y el registro de reposiciones de esta página no se ven afectados.",
    none: (label: string, days: number) => `Todavía no hay ninguna reposición confirmada ${label} en los últimos ${N(days)} días: la cuadrícula se rellena a partir de la primera.`,
    thin: (n: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${reposiciones(n)} ${label} en ${dias(activeDays)} de los últimos ${N(days)}: aún no hay datos suficientes para hablar de una pauta (RestockWire espera a tener ${N(min)} reposiciones en ${N(minDays)} días).`,
    pattern: (label: string, weekday: string, window: string, share: string, n: number, days: number) => (
      <>La mayoría de las reposiciones {label} llegan <b className="text-ink">{losDias(weekday)}</b>, en la franja de <b className="text-ink">{window}</b>, hora local ({share} de {N(n)} en los últimos {N(days)} días).</>
    ),
    patternHours: (label: string, window: string, share: string, n: number, spanDays: number) => (
      <>La mayoría de las reposiciones {label} llegan en la franja de <b className="text-ink">{window}</b>, hora local ({share} de {N(n)}); {dias(spanDays)} de datos son todavía pocos para señalar un día de la semana.</>
    ),
    caption: (what: string, label: string, days: number) => `Reposiciones confirmadas del ${what} ${label} por día de la semana y hora local, últimos ${N(days)} días`,
    cell: (weekday: string, hours: string, n: number) => `${cap(weekday)} ${hours}: ${reposiciones(n)}`,
    busiest: (weekday: string, hours: string, n: number) => `la franja más activa · ${weekday} ${hours} · ${reposiciones(n)}`,
    legendFewer: "menos",
    legendMore: "más",
    localTime: "la hora local de cada tienda",
    measuredTitle: "Cómo se mide",
    measured: (min: number, minDays: number, span: number) =>
      `Cada casilla cuenta las reposiciones confirmadas por RestockWire (dos comprobaciones coincidentes; la primera vez que se ve una tienda nunca cuenta) que llegaron en esa hora local de ese día de la semana durante el periodo, en la zona horaria de la propia tienda. Solo se habla de una pauta a partir de ${N(min)} reposiciones en ${N(minDays)} días distintos, y de un día de la semana solo cuando los datos abarcan ${N(span)} días: diez reposiciones de golpe son un hecho aislado, no una costumbre.`,
  },

  streak: {
    title: (what: string, label: string) => `Rachas y sequías de reposiciones del ${what} ${label}`,
    unknown: "Ahora mismo no se pueden leer las cifras de rachas; el stock en directo y el registro de reposiciones de esta página no se ven afectados.",
    none: (label: string, days: number) => `Ninguna reposición confirmada ${label} en los últimos ${N(days)} días: la racha sin reposiciones ocupa todo el periodo.`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>Última reposición confirmada {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>; la racha más larga sin reposiciones en {N(o.days)} días duró <b className="text-ink">{o.longest}</b></>}{o.trend && <>; <b className="text-ink">{N(o.thisWeek)}</b> {o.thisWeek === 1 ? "reposición" : "reposiciones"} esta semana frente a {N(o.lastWeek)} la semana pasada ({o.trend})</>}.</>
    ),
    today: "hoy",
    daysAgo: (n: number) => `hace ${dias(n)}`,
    hoursAgo: (n: number) => `hace ${N(n)} ${n === 1 ? "hora" : "horas"}`,
    tileSince: "desde la última reposición confirmada",
    tileSinceNone: (days: number) => `ninguna reposición en ${N(days)} días`,
    tileLongest: (days: number) => `racha más larga sin reposiciones · ${N(days)} d`,
    tileWeek: (prev: number) => `reposiciones en los últimos 7 días · ${N(prev)} la semana anterior`,
    tileMedian: "intervalo habitual entre tandas de reposición",
    up: "↑ más que la semana pasada",
    down: "↓ menos que la semana pasada",
    flat: "→ igual que la semana pasada",
    none2: "–",
    measuredTitle: "Cómo se mide",
    measured: "Una tanda de reposición agrupa todas las reposiciones confirmadas en la misma media hora en las tiendas contadas aquí, así que ocho configuraciones que llegan juntas son una tanda, no ocho; los intervalos se miden entre tandas. «Esta semana» son los últimos 7 días y «la semana pasada», los 7 anteriores. Confirmada significa que dos comprobaciones de RestockWire coincidieron (cada tienda cada 15 segundos, las tiendas con alertas cada 5); la primera vez que se ve una tienda nunca cuenta.",
  },

  ranking: {
    title: (what: string, label: string) => `¿En qué tiendas ${label} se agota antes el ${what}?`,
    unknown: "Ahora mismo no se puede leer la clasificación de agotamientos; el stock en directo y el registro de reposiciones de esta página no se ven afectados.",
    thin: (label: string, k: number, min: number, days: number) =>
      `Todavía hay pocos agotamientos cronometrados ${label}: ${tiendas(k)} con ${N(min)} o más reposiciones agotadas en los últimos ${N(days)} días, y para una clasificación hacen falta dos.`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>La más rápida {o.label}: <b className="text-ink">{o.fastest}</b>, con la mitad de sus reposiciones agotadas en <b className="text-ink">{o.fastSec}</b>; la más lenta: <b className="text-ink">{o.slowest}</b>, {o.slowSec} (últimos {N(o.days)} días).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `Reposiciones del ${what} ${label} según lo rápido que se agotaron, últimos ${N(days)} días; tiendas con ${N(min)} o más agotamientos cronometrados`,
    thRank: "#",
    thStore: "Tienda",
    thMedian: "Mitad agotada en",
    thFastest: "La más rápida",
    thPairs: "Reposiciones agotadas",
    footnote: (ranked: number, total: number) => `${N(ranked)} de ${tiendas(total)} en la clasificación`,
    measuredTitle: "Cómo se mide",
    measured: (min: number) =>
      `«Mitad agotada en» es el tiempo mediano entre la comprobación de RestockWire que vio primero una reposición y la que vio primero que se había agotado. Es un límite superior: las tiendas con alertas se comprueban cada 5 segundos y el resto cada 15. Solo entran en la clasificación las tiendas con ${N(min)} o más reposiciones agotadas en el periodo; un stock que dura menos que una comprobación puede pasar desapercibido, así que las tiendas muy rápidas parecen algo más lentas de lo que son.`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `¿Qué tiendas ${label} repusieron más el ${what}? Últimos ${N(days)} días`,
    unknown: "Ahora mismo no se puede leer la clasificación; el stock en directo y el registro de reposiciones de esta página no se ven afectados.",
    none: (what: string, label: string, days: number) => `Ninguna reposición confirmada del ${what} ${label} en los últimos ${N(days)} días.`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <><b className="text-ink">{o.store}</b> encabeza la lista {o.label} con <b className="text-ink">{N(o.n)}</b> de {o.total === 1 ? "1 reposición confirmada" : `${N(o.total)} reposiciones confirmadas`} (<b className="text-ink">{o.share}</b>) en los últimos {N(o.days)} días.</>
    ),
    caption: (what: string, label: string, days: number) => `Apple Store ${label} por reposiciones confirmadas del ${what}, últimos ${N(days)} días`,
    thRank: "#",
    thStore: "Tienda",
    thRestocks: "Reposiciones",
    thShare: "Cuota",
    footnote: (shown: number, stores: number, total: number) => `${N(shown)} de ${tiendas(stores)} con alguna reposición · ${reposiciones(total)} en total`,
    regionsTitle: (noun: string) => `Por ${region1(noun)}`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `Reposiciones confirmadas del ${what} ${label} por ${region1(noun)}, últimos ${N(days)} días`,
    thRegion: (noun: string) => cap(region1(noun)),
    thStores: "Tiendas",
    measuredTitle: "Cómo se mide",
    measured: (what: string) =>
      `Reposiciones confirmadas del ${what} en los últimos 7 días, según las propias comprobaciones de RestockWire de la recogida en tienda de apple.com (cada tienda cada 15 segundos, las tiendas con alertas cada 5; dos comprobaciones tienen que coincidir; la primera vez que se ve una tienda nunca cuenta). La cuota se calcula sobre todas las reposiciones confirmadas en el mismo lugar y periodo.`,
  },
};
