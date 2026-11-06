/**
 * Notification texts in Swedish (push, alert email, "notifications stopped" email, device names, Stripe checkout
 * line). Plain TS with no imports besides types: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifySv: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` – ${quote}` : ""}. Öppna apple.com för att reservera.`,
  testTitle: "Test från RestockWire: notiserna fungerar",
  testBody: (time: string, device: string) => `Skickad ${time} till din ${device}. En riktig notis om påfyllning landar precis så här, några sekunder efter att den bekräftats.`,
  device: {
    iphoneApp: "iPhone (hemskärmsapp)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installerad app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `dator${browser ? ` (${browser})` : ""}`,
    other: "den här enheten",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` +${more} till` : ""}`,
    intro: "Listad för hämtning i butik just nu:",
    reserve: "Reservera",
    store: "Butik",
    tip: "Listningar för hämtning varar sällan länge. Välj ”Hämta i butik” i appen Apple Store eller på apple.com och sedan den här butiken.",
    manage: (url: string) => `Ändra eller pausa den här bevakningen: ${url}`,
    htmlTitle: "Listad för hämtning nu",
    htmlReserve: "Reservera på apple.com",
    htmlStorePage: "Öppna butikssidan →",
    htmlTip: "Listningar för hämtning varar sällan länge. Välj <b>Hämta i butik</b> i appen Apple Store eller på apple.com och sedan den här butiken.",
    htmlManage: "Ändra eller pausa den här bevakningen",
    cancel: (url: string) => `Har du din iPhone nu? Avsluta när du vill: ${url}`,
    htmlGotIt: "Har du din iPhone nu?",
    htmlCancel: "Avsluta när du vill",
    nudge: (url: string) => `Mejl är reservvägen: ingen telefon på ditt konto har notiser påslagna. En notis landar cirka 3 sekunder efter en bekräftad påfyllning. Byt genom att öppna RestockWire från hemskärmen och trycka på ”Slå på notiser”: ${url}`,
    htmlNudge: (url: string) => `Mejl är reservvägen: ingen telefon på ditt konto har notiser påslagna. En <b>notis landar cirka 3 sekunder</b> efter en bekräftad påfyllning. Öppna RestockWire från hemskärmen och tryck på <b>Slå på notiser</b>. <a href="${url}" style="color:#0a7f3f">Steg för steg →</a>`,
  },
  nudge: {
    subject: "Dina bevakningar från RestockWire kan nå telefonen på cirka 3 sekunder",
    intro: "Cirka 3 sekunder: så snabbt når en notis telefonen efter att RestockWire bekräftat en påfyllning. En typisk påfyllning av iPhone Duo är borta på ungefär en minut, och mejl är långsammare. Dina bevakningar kommer via mejl nu eftersom ingen telefon på ditt konto har notiser påslagna.",
    howTitle: "Att byta tar under en minut:",
    stepsIos: ["iPhone: gå till restockwire.com i Safari, tryck på Dela och sedan ”Lägg till på hemskärmen”.", "Starta RestockWire från hemskärmen, inte Safari, och logga in.", "Tryck på ”Slå på notiser” på kontosidan och sedan på ”Tillåt”."],
    stepsOther: "Android eller dator: gå till restockwire.com/account och tryck på ”Slå på notiser”.",
    after: "Mejlen fortsätter tills en enhet är påslagen. Därefter kommer bevakningarna som notiser och mejlen upphör.",
    cta: (url: string) => `Steg för steg med bilder: ${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${limit} bevakningar. Dina butiker läses var ${fastSec}:e sekund och alla andra butiker var ${checkSec}:e sekund; en bekräftad påfyllning når din telefon på cirka ${alertSec} s. Månadsvis, avsluta när du vill.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-telefon", desktop: "dator", other: "enhet" },
    subject: (device: string) => `Din ${device} tar inte längre emot notiser från RestockWire`,
    gone: (device: string) => `Notistjänsten meddelar att din ${device} har tappat sin prenumeration hos RestockWire, så notiserna når den inte längre.`,
    byEmail: "Tills notiserna är påslagna igen kommer dina bevakningar via mejl.",
    reopenIos: "Åtgärda det genom att starta RestockWire från hemskärmen, inte Safari, och trycka på ”Slå på notiser” på kontosidan.",
    reopenOther: "Åtgärda det genom att öppna RestockWire, gå till kontosidan och trycka på ”Slå på notiser”.",
    causes: "Det händer oftast när appen tas bort från hemskärmen, notiserna stängs av i Inställningar eller telefonen återställs från en säkerhetskopia.",
  },
};
