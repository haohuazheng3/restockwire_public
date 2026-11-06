/**
 * Notification texts in Spanish (Spain): push, alert email, "notifications stopped" email, device names, Stripe
 * checkout line. Plain TS, types only: the poller sends these too. Form of address: "tú", as on the site.
 */
import type { NotifyText } from "./en";

export const notifyEs: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Abre apple.com para reservarlo.`,
  testTitle: "Prueba de RestockWire: las notificaciones funcionan",
  testBody: (time: string, device: string) => `Enviada a las ${time} a tu ${device}. Una alerta de reposición real llega exactamente así, segundos después de confirmarse.`,
  device: {
    iphoneApp: "iPhone (app de la pantalla de inicio)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (app instalada)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `ordenador${browser ? ` (${browser})` : ""}`,
    // Always follows "tu" ("a tu dispositivo").
    other: "dispositivo",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` y ${more} más` : ""}`,
    intro: "Disponible para recogida en tienda en este momento:",
    reserve: "Reservar",
    store: "Tienda",
    tip: "El stock para recogida rara vez dura mucho. En la app Apple Store o en apple.com, elige «Recogida» y después esta tienda.",
    manage: (url: string) => `Cambia o pausa esta alerta: ${url}`,
    htmlTitle: "Disponible para recogida ahora",
    htmlReserve: "Reservar en apple.com",
    htmlStorePage: "Abrir la página de la tienda →",
    htmlTip: "El stock para recogida rara vez dura mucho. En la app Apple Store o en apple.com, elige <b>Recogida</b> y después esta tienda.",
    htmlManage: "Cambia o pausa esta alerta",
    cancel: (url: string) => `¿Ya tienes tu iPhone? Cancela cuando quieras: ${url}`,
    htmlGotIt: "¿Ya tienes tu iPhone?",
    htmlCancel: "Cancela cuando quieras",
    nudge: (url: string) => `El correo es la vía de reserva: ningún móvil de tu cuenta tiene las notificaciones activadas. Una notificación llega unos 3 segundos después de una reposición confirmada. Para cambiar, abre RestockWire desde tu pantalla de inicio y toca «Activar notificaciones»: ${url}`,
    htmlNudge: (url: string) => `El correo es la vía de reserva: ningún móvil de tu cuenta tiene las notificaciones activadas. Una <b>notificación llega unos 3 segundos</b> después de una reposición confirmada. Abre RestockWire desde tu pantalla de inicio y toca <b>Activar notificaciones</b>. <a href="${url}" style="color:#0a7f3f">Pasos de configuración →</a>`,
  },
  nudge: {
    subject: "Tus alertas de RestockWire pueden llegar a tu móvil en unos 3 segundos",
    intro: "Unos 3 segundos: eso es lo que tarda una notificación en llegar al móvil después de que RestockWire confirme una reposición. Una reposición típica del iPhone Duo desaparece en un minuto más o menos, y el correo es más lento. Ahora tus alertas llegan por correo porque ningún móvil de tu cuenta tiene las notificaciones activadas.",
    howTitle: "Cambiarlo lleva menos de un minuto:",
    stepsIos: ["iPhone: entra en restockwire.com con Safari, toca Compartir y después «Añadir a pantalla de inicio».", "Abre RestockWire desde la pantalla de inicio, no desde Safari, e inicia sesión.", "En la página Cuenta, toca «Activar notificaciones» y después «Permitir»."],
    stepsOther: "Android u ordenador: entra en restockwire.com/account y toca «Activar notificaciones».",
    after: "El correo sigue hasta que actives un dispositivo. A partir de entonces, las alertas llegan como notificaciones y los correos se detienen.",
    cta: (url: string) => `Pasos de configuración con imágenes: ${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${limit} alertas. Tus tiendas se comprueban cada ${fastSec} s y el resto cada ${checkSec} s; una reposición confirmada llega a tu móvil en unos ${alertSec} s. Cobro mensual, cancela cuando quieras.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "móvil Android", desktop: "ordenador", other: "dispositivo" },
    subject: (device: string) => `Tu ${device} ya no recibe las notificaciones de RestockWire`,
    gone: (device: string) => `El servicio de notificaciones indica que tu ${device} ha dado de baja su suscripción a RestockWire, así que las notificaciones ya no le llegan.`,
    byEmail: "Hasta que vuelvas a activar las notificaciones, tus alertas de reposición te llegarán por correo.",
    reopenIos: "Para arreglarlo, abre RestockWire desde tu pantalla de inicio, no desde Safari, y toca «Activar notificaciones» en la página Cuenta.",
    reopenOther: "Para arreglarlo, abre RestockWire, ve a Cuenta y toca «Activar notificaciones».",
    causes: "Suele pasar cuando se borra la app de la pantalla de inicio, se desactivan las notificaciones en Ajustes o se restaura el móvil desde una copia de seguridad.",
  },
};
