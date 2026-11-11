/**
 * Spanish (Spain): account — the dashboard, its restock modules, /phone-alerts, /checkout/success and /pricing. Plan
 * names and dollar amounts stay as they are (billing is in USD everywhere).
 */
import type { Dict } from "../en";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { n, tiendas, reposiciones, otherTrackers } from "./words";

const s = (k: number, one: string, many: string) => `${n(k)} ${k === 1 ? one : many}`;

export const account: Dict["account"] = {
  loading: "Cargando",
  meta: { title: "Mis alertas" },
  signedInAs: (email: string) => `Cuenta: ${email}`,
  title: "Mis alertas",
  units: { s: "s", min: "min", taps: "toques" },

  plan: {
    title: "Plan",
    none: "Esta cuenta no tiene plan, así que las alertas están en pausa",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(on)} de ${n(limit)} alertas en marcha`,
    renews: (date: string) => ` · próximo cobro el ${date}`,
    ends: (date: string) => ` · se detiene el ${date}`,
  },

  sent: {
    title: "Alertas entregadas",
    last: (ago: string) => `La más reciente, ${ago}`,
    none: "Aún no se ha entregado ninguna",
    empty: "Todavía no ha salido ninguna alerta.",
    channel: { push: "notificación", email: "correo" } as Record<string, string>,
    status: { sent: "enviada", delivered: "entregada", failed: "fallida", skipped: "omitida" } as Record<string, string>,
  },

  fast: {
    title: "Una reserva en 20 segundos",
    sub: "todo salvo los cuatro últimos toques, hecho de antemano",
    lasts: "lo que suele seguir disponible un Duo",
    push: "reposición confirmada → aviso en tu móvil",
    tapsLeft: "toques que quedan cuando llega el aviso",
    steps: [
      { title: "Conoce tu franja", hint: "las horas habituales de tus tiendas están abajo · tenlo todo listo 10 min antes" },
      { title: "Deja preparado el pago de Apple", hint: "capacidad y color exactos → Entrega y recogida" },
      { title: "Acepta antes las condiciones · o cómpralo libre", hint: "libre y pagado al contado no muestra ninguna casilla" },
      { title: "Que no se bloquee la pantalla", hint: "Bloqueo automático → Nunca · tócala cada 10–15 min" },
      { title: "Cuando salte: lee y luego actúa", hint: "Recogida → la tienda indicada → primera franja → Apple Pay" },
    ],
    guide: "La guía de dos minutos",
    window: "Tu franja de reposición",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "Alerta entregada", sent: "Alerta enviada", other: "No está en tus alertas", before: "Antes de tu alerta" },
    title: "Horas de reposición en tus tiendas",
    anyIphone: "iPhone",
    and: " y ",
    yours: (k: number) => (k === 1 ? "tu tienda" : `tus ${n(k)} tiendas`),
    Yours: (k: number) => (k === 1 ? "Tu tienda" : `Tus ${n(k)} tiendas`),
    otherStores: (k: number) => s(k, "tienda adicional", "tiendas adicionales"),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${tiendas(stores)} · últimos ${n(days)} días · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `hora punta en ${yours} · después, ${then}` : `hora punta en ${yours}`),
    busiestArea: (stores: number, zone: string) => `hora punta en las ${n(stores)} tiendas con ${zone}`,
    next: (inHours: number) => `siguiente franja habitual · ${inHours === 0 ? "ya, en esta hora" : `en ${n(inHours)} h`}`,
    typical: "lo que suele seguir disponible una reposición",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `todavía nada repuesto en ${yours} · últimos ${n(days)} días` : `reposiciones en ${yours} · últimos ${n(days)} días${pattern ? "" : " · no bastan para una pauta"}`),
    byHour: (busiestInGreen: boolean) => `Hora a hora${busiestInGreen ? " · la hora punta, en verde" : ""}`,
    byWeekday: (busiest: string | null) => `Día a día${busiest ? ` · el de más: ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `Reposiciones por hora en ${yours}, ${zone}: ${items}`,
    weekdayChart: (yours: string, items: string) => `Reposiciones por día de la semana en ${yours}: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}${reported ? ` (+${n(reported)} publicadas por otros rastreadores)` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}: ${reposiciones(k)} en ${yours}${area ? ` · ${n(area.n)} en el resto de tiendas con ${area.zone}` : ""}${reported ? ` · ${n(reported)} publicadas por otros rastreadores` : ""}`,
    now: "ahora",
    allZone: (stores: number, zone: string) => `Las ${n(stores)} tiendas con ${zone}`,
    reportMarkBars: "En discontinua",
    reportMarkDots: "Puntos huecos",
    sellTitle: "Cuánto duran las reposiciones de tus tiendas",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${tiendas(stores)} · últimos ${n(days)} días`,
    sellLabel: (yours: string) => `en ${yours}`,
  },

  success: {
    metaTitle: "Tus alertas están en marcha",
    isOn: (plan: string) => `${plan} está activo`,
    yourPlan: "Tu plan",
    received: "Pago confirmado",
    onPlan: (limit: number) => `Tu plan incluye ${n(limit)} alertas.`,
    planOn: "Tu plan está activo.",
    pending: "Dale un minuto: la suscripción aparecerá enseguida en tu cuenta.",
    open: "Ir a mis alertas",
    another: "Crear otra alerta",
    saved: (k: number) => `${s(k, "alerta guardada", "alertas guardadas")} · Stripe te envía el recibo`,
    pushOn: "Notificaciones",
    pushNext: "Un paso más: las alertas en tu móvil",
  },

  install: {
    metaTitle: "Instala la app: alertas de reposición directas a tu pantalla de bloqueo",
    metaDescription: "Pon RestockWire en tu pantalla de inicio y te llegará una notificación en el instante en que una tienda cercana tenga un iPhone Duo, 18 Pro o Pro Max disponible para recogida.",
  },

  pricing: {
    metaTitle: "Precios: 10 alertas por $5, 20 por $10, 50 por $20",
    metaDescription: `Alertas de reposición para recoger un iPhone en cualquier Apple Store de EE. UU.: comprobaciones cada ${SPEED.fastSec} segundos en las tiendas que elijas y un aviso unos ${SPEED.alertSec} segundos después de una reposición confirmada. Plus, $5 al mes por 10 alertas; Pro, $10 por 20; Max, $20 por 50. Cancela cuando quieras.`,
    title: "Precios",
    lead: "**Una alerta es una tienda × un iPhone exacto.** Todo lo demás de la web se consulta gratis.",
    chips: ["Los 269 Apple Store de EE. UU.", "Cancela cuando quieras", "Tarjeta o Link"],
    fastest: "Ningún rastreador de stock de iPhone publica un intervalo de comprobación más corto",
    everyFast: `**${SPEED.fastSec} segundos** entre comprobaciones en tus tiendas · los intervalos que publican otros rastreadores: ${otherTrackers(OTHER_TRACKERS)}`,
    sellsOut: (band: string) => `**${band}**: lo que suele seguir disponible una reposición típica del iPhone Duo; algunas desaparecen en 20–30 segundos`,
    band: (r: string) => `${r} segundos`,
    aboutMinute: "alrededor de un minuto",
    sameSpeed: "La misma velocidad en todos los planes",
    rechecked: "entre comprobaciones en tus tiendas",
    toPhone: "de la reposición confirmada a tu móvil",
    listing: "un Duo típico, de disponible a agotado",
    note: { plus: "1 iPhone × 10 tiendas", pro: "2 iPhone × 10 tiendas", max: "5 iPhone × 10 tiendas" } as Record<string, string>,
    month: "/ mes",
    alerts: (k: number) => `${n(k)} alertas`,
    perks: [
      `Comprobaciones cada ${SPEED.fastSec} segundos en tus tiendas y cada ${SPEED.checkSec} segundos en las 269`,
      `Una reposición confirmada en tu móvil en unos ${SPEED.alertSec} s`,
    ],
    cancel: "Cancela cuando quieras",
    get: (plan: string) => `Elegir ${plan}`,
    billing: "Cobros vía Stripe (tarjeta o Link) · al subir de plan pagas solo los días que quedan; al bajar, cambia en la renovación",
    refund: "¿Has cambiado de idea? [Puedes pedir el reembolso completo en los primeros 7 días](/refunds) siempre que no te haya llegado ninguna alerta de reposición",
  },
};
