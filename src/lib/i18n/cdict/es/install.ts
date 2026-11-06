import type { CDict } from "../en";

/**
 * Spanish (Spain) client strings: install (the /phone-alerts guide and its drawn phone screens). The mock labels are the
 * words iOS, Android and Chrome show in Spanish (Spain): Compartir, Añadir a pantalla de inicio, Permitir, Ajustes.
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "App en la pantalla de inicio · nada que descargar",
    title: "Reposiciones, directas a tu pantalla de bloqueo.",
    lead: "Una reposición confirmada llega a tu pantalla de bloqueo en segundos. Hacen falta dos cosas: RestockWire en tu pantalla de inicio y las notificaciones permitidas.",
    seeSteps: "Ver los pasos",
    sendTest: "Enviar un aviso de prueba",
    turnOn: "Activar notificaciones",
    already: "**✓ Ya está configurado.** Tus alertas llegan a {label}. Sigue los pasos de abajo para añadir también este dispositivo. {link}",
    myAlerts: "Mis alertas",
  },
  progress: {
    homeScreen: "Añadida a la pantalla de inicio",
    signedIn: "Sesión iniciada",
    on: "Notificaciones permitidas",
    blocked: "Bloqueadas en los ajustes: el paso {n} lo arregla.",
  },
  steps: {
    title: "Cómo activar las notificaciones",
    intro: {
      ios: "El iPhone y el iPad solo entregan notificaciones a la app de la pantalla de inicio.",
      android: "En Android, Chrome puede avisarte por sí solo; instalarla es opcional.",
      desktop: "Funciona en el navegador, no hay nada que instalar.",
    },
    tabsLabel: "Elige tu dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordenador" },
    ios: {
      safari: { title: "Entra en restockwire.com con Safari", text: "Tiene que ser Safari; ni Chrome ni los navegadores integrados en otras apps pueden hacerlo." },
      share: { title: "Toca Compartir", text: "iPhone: barra inferior. iPad: barra superior." },
      choose: { title: "Busca «Añadir a pantalla de inicio» en la hoja", text: "¿No lo ves? Desplaza la hoja hacia abajo." },
      add: { title: "Toca Añadir", text: "Deja el nombre RestockWire." },
      open: { title: "Abre el icono nuevo y entra con tu correo", text: "La app inicia sesión por separado; usa el mismo correo y ahí estarán tus alertas." },
      allow: { title: "«Activar notificaciones» → Permitir", text: "Lo encuentras en tu página de alertas. El iPhone solo lo pregunta la primera vez." },
    },
    android: {
      chrome: { title: "Entra en restockwire.com con Chrome", text: "Samsung Internet y Edge también sirven; los navegadores integrados en otras apps, no." },
      install: { title: "Instala la app", text: "Un solo toque, sin pasar por ninguna tienda de apps." },
      menu: { title: "En el menú ⋮, «Añadir a pantalla de inicio»", text: "En algunos móviles aparece como **Instalar aplicación**." },
      open: { title: "Abre RestockWire e inicia sesión", text: "Está en la pantalla de inicio o en el cajón de apps; con el mismo correo tienes tus alertas." },
      allow: { title: "«Activar notificaciones» → Permitir", text: "Android solo lo pregunta la primera vez. Una pestaña de Chrome también sirve." },
    },
    desktop: {
      allow: { title: "Toca «Activar notificaciones»", text: "Funciona en Chrome, Edge, Firefox y Safari 16 o posterior; el navegador lo pregunta una sola vez." },
      install: { title: "Opcional: úsala como app", text: "En Chrome o Edge, usa el icono de instalar de la barra de direcciones; así las notificaciones llegan con el navegador cerrado." },
      phone: { title: "Añade también tu móvil", text: "Inicia sesión allí con el mismo correo. Cada dispositivo con las notificaciones activadas recibe cada alerta." },
    },
  },
  action: {
    install: "Instalar RestockWire",
    on: "✓ Este dispositivo recibe notificaciones.",
    sendTest: "Enviar un aviso de prueba",
    needsInstall: "Se activa dentro de la app de la pantalla de inicio.",
    signInFirst: "Inicia sesión para empezar",
    signInThenOn: "Entra y activa los avisos",
    turnOn: "Activar notificaciones",
    denied: "Bloqueadas: permite RestockWire en Ajustes y vuelve a cargar la página.",
  },
  notes: [
    { q: "¿Gasta batería?", a: "No. Las comprobaciones se hacen en los servidores de RestockWire, no en tu móvil." },
    { q: "¿Por qué el iPhone necesita Safari?", a: "Añadir una web a la pantalla de inicio es una función de Safari; los navegadores integrados en otras apps no la tienen." },
    { q: "¿Más de un dispositivo?", a: "Usa el mismo correo en cada uno, y cada uno recibe todas las alertas." },
    { q: "¿Y el correo?", a: "Si ningún dispositivo tiene las notificaciones activadas, la alerta se envía a tu correo." },
  ],
  cta: { title: "¿Todavía no tienes nada que vigilar?", button: "Crea tus alertas" },

  mocks: {
    share: "Compartir",
    shareSheet: { copy: "Copiar", readingList: "Añadir a la lista de lectura", bookmark: "Añadir marcador", favorites: "Añadir a Favoritos", addToHome: "Añadir a pantalla de inicio", markup: "Marcación" },
    addDialog: { cancel: "Cancelar", title: "Añadir a pantalla de inicio", add: "Añadir", note: "Se añadirá un icono a tu pantalla de inicio para que puedas acceder rápidamente a este sitio web." },
    iosAlert: { title: "“RestockWire” quiere enviarte notificaciones", text: "Las notificaciones pueden incluir alertas, sonidos y globos en los iconos. Puedes configurarlas en Ajustes.", dontAllow: "No permitir", allow: "Permitir" },
    chromeMenuLabel: "Menú",
    chromeMenu: { before: ["Nueva pestaña", "Historial", "Descargas", "Marcadores", "Compartir…"], add: "Añadir a pantalla de inicio", after: ["Versión para ordenadores"] },
    androidAlert: { title: "¿Permitir que RestockWire te envíe notificaciones?", dontAllow: "No permitir", allow: "Permitir" },
    desktopAlert: { wantsTo: "restockwire.com quiere", show: "Mostrar notificaciones", block: "Bloquear", allow: "Permitir" },
    desktopInstall: { callout: "Instalar", title: "¿Instalar RestockWire?", text: "Funciona en una ventana aparte", cancel: "Cancelar", install: "Instalar" },
    lockScreen: { date: "jueves, 29 de octubre", now: "ahora", title: "iPhone 18 Pro 512GB Plata", body: "Apple Puerta del Sol · Madrid — Disponible hoy. Abre apple.com para reservarlo." },
  },
};
