/**
 * Notification texts in Swedish (push, alert email, "notifications stopped" email, device names, Stripe checkout
 * line). Plain TS with no imports besides types: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifySv: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` – ${quote}` : ""}. Reservera på apple.com.`,
  testTitle: "RestockWire-test: notiserna når fram",
  testBody: (time: string, device: string) => `${time} · skickad till din ${device}. Så här ser en riktig påfyllningsnotis ut – den kommer sekunder efter bekräftelsen.`,
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
    intro: "Går att hämta i butik nu:",
    reserve: "Reservera",
    store: "Butik",
    tip: "Hämtlager brukar ta slut på minuter. Gå till ”Hämta i butik” i Apple Store-appen eller på apple.com och välj den här butiken.",
    manage: (url: string) => `Pausa eller ändra bevakningen: ${url}`,
    htmlTitle: "Att hämta nu",
    htmlReserve: "Reservera på apple.com",
    htmlStorePage: "Butikens sida →",
    htmlTip: "Hämtlager brukar ta slut på minuter. Gå till <b>Hämta i butik</b> i Apple Store-appen eller på apple.com och välj den här butiken.",
    htmlManage: "Pausa eller ändra bevakningen",
    cancel: (url: string) => `Telefonen redan köpt? Säg upp planen när som helst: ${url}`,
    htmlGotIt: "Telefonen redan köpt?",
    htmlCancel: "Säg upp planen när som helst",
    nudge: (url: string) => `Det här mejlet är reserven: inget av kontots enheter har notiser aktiva. Notiser kommer cirka 3 sekunder efter en bekräftad påfyllning. Öppna RestockWire från hemskärmen och tryck på ”Aktivera notiser”: ${url}`,
    htmlNudge: (url: string) => `Det här mejlet är reserven: inget av kontots enheter har notiser aktiva. <b>Notiser kommer cirka 3 sekunder</b> efter en bekräftad påfyllning. Öppna RestockWire från hemskärmen och tryck på <b>Aktivera notiser</b>. <a href="${url}" style="color:#0a7f3f">Guiden →</a>`,
  },
  nudge: {
    subject: "Cirka 3 sekunder: få dina RestockWire-bevakningar som notiser",
    intro: "En notis når telefonen cirka 3 sekunder efter att RestockWire bekräftat en påfyllning. Mejl tar längre tid, och en typisk iPhone Duo-påfyllning är borta på ungefär en minut. Just nu går dina bevakningar via mejl: inget av kontots enheter har notiser aktiva.",
    howTitle: "Klart på under en minut:",
    stepsIos: ["iPhone: öppna restockwire.com i Safari → Dela → ”Lägg till på hemskärmen”.", "Starta RestockWire från hemskärmen (inte Safari) och logga in.", "Kontosidan: ”Aktivera notiser”, därefter ”Tillåt”."],
    stepsOther: "Android eller dator: restockwire.com/account → ”Aktivera notiser”.",
    after: "Så länge ingen enhet är aktiverad kommer mejl. När en är det tar notiserna över och mejlen slutar.",
    cta: (url: string) => `Bildguide: ${url}`,
  },
  stopped: {
    subject: (device: string) => `Notiserna når inte längre din ${device} – RestockWire`,
    gone: (device: string) => `Notistjänsten rapporterar att prenumerationen för din ${device} är borta. RestockWires notiser kommer inte fram dit.`,
    byEmail: "Bevakningarna går via mejl tills notiserna är aktiva igen.",
    reopenIos: "Lösning: starta RestockWire från hemskärmen (inte Safari) och tryck på ”Aktivera notiser” på kontosidan.",
    reopenOther: "Lösning: öppna RestockWire, gå till kontosidan, tryck på ”Aktivera notiser”.",
    causes: "Vanligaste skälen: appen raderades från hemskärmen, notiser stängdes av under Inställningar eller telefonen återställdes från säkerhetskopia.",
    deviceWord: { ios: "iPhone", android: "Android-telefon", desktop: "dator", other: "enhet" },
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan} · ${limit} bevakningar. Var ${fastSec}:e sekund för dina butiker, var ${checkSec}:e för övriga; bekräftad påfyllning till telefonen på cirka ${alertSec} s. Löper per månad, uppsägning när som helst.`,
};
