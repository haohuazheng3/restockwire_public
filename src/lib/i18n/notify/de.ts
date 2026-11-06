/**
 * Notification texts in German (push, alert email, "notifications stopped" email, Stripe checkout line).
 * Plain TS, no imports but types: the poller sends these too. Switzerland gets them with ß → ss.
 */
import type { NotifyText } from "./en";

export const notifyDe: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` – ${quote}` : ""}. Jetzt auf apple.com sichern.`,
  testTitle: "RestockWire-Test: Mitteilungen funktionieren",
  testBody: (time: string, device: string) => `Gesendet um ${time} an: ${device}. Ein echter Restock-Alarm kommt genau so an, Sekunden nach der Bestätigung.`,
  device: {
    iphoneApp: "iPhone-App vom Home-Bildschirm",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installierte App)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `Computer${browser ? ` (${browser})` : ""}`,
    other: "dieses Endgerät",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` +${more} weitere` : ""}`,
    intro: "In diesem Moment zur Abholung im Store gelistet:",
    reserve: "Reservieren",
    store: "Store",
    tip: "Abhol-Angebote halten selten lange. Wählen Sie in der Apple Store App oder auf apple.com „Abholen“ und dann diesen Store.",
    manage: (url: string) => `Diesen Alarm ändern oder pausieren: ${url}`,
    htmlTitle: "Jetzt zur Abholung gelistet",
    htmlReserve: "Auf apple.com reservieren",
    htmlStorePage: "Zur Store-Seite →",
    htmlTip: "Abhol-Angebote halten selten lange. Wählen Sie in der Apple Store App oder auf apple.com <b>Abholen</b> und dann diesen Store.",
    htmlManage: "Diesen Alarm ändern oder pausieren",
    cancel: (url: string) => `Haben Sie Ihr iPhone schon? Jederzeit kündbar: ${url}`,
    htmlGotIt: "Haben Sie Ihr iPhone schon?",
    htmlCancel: "Jederzeit kündigen",
    nudge: (url: string) => `Diese E-Mail ist der Notweg: Kein Handy in Ihrem Konto hat Mitteilungen an. Per Push wären Sie etwa 3 Sekunden nach der Bestätigung informiert. Umstellen: RestockWire vom Home-Bildschirm starten, „Mitteilungen einschalten“ antippen: ${url}`,
    htmlNudge: (url: string) => `Diese E-Mail ist der Notweg: Kein Handy in Ihrem Konto hat Mitteilungen an. <b>Per Push wären Sie etwa 3 Sekunden</b> nach der Bestätigung informiert. Dazu RestockWire vom Home-Bildschirm starten und <b>Mitteilungen einschalten</b> antippen. <a href="${url}" style="color:#0a7f3f">Einrichtung →</a>`,
  },
  nudge: {
    subject: "Ihre RestockWire-Alarme können Ihr Handy in etwa 3 Sekunden erreichen",
    intro: "Etwa 3 Sekunden: So schnell erreicht ein Push das Handy, nachdem RestockWire einen Restock bestätigt hat. Ein typischer iPhone-Duo-Restock ist nach etwa einer Minute weg, und E-Mail ist langsamer. Ihre Alarme kommen derzeit per E-Mail, weil auf keinem Handy in Ihrem Konto Mitteilungen eingeschaltet sind.",
    howTitle: "Das Umstellen dauert keine Minute:",
    stepsIos: ["iPhone: restockwire.com in Safari aufrufen, auf „Teilen“ tippen, dann auf „Zum Home-Bildschirm“.", "RestockWire vom Home-Bildschirm starten, nicht aus Safari, und anmelden.", "Auf der Kontoseite auf „Mitteilungen einschalten“ tippen, dann auf „Erlauben“."],
    stepsOther: "Android oder Computer: restockwire.com/account aufrufen und auf „Mitteilungen einschalten“ tippen.",
    after: "Die E-Mails laufen weiter, bis ein Gerät eingeschaltet ist. Danach kommen die Alarme als Mitteilung, und die E-Mails hören auf.",
    cta: (url: string) => `Einrichtung mit Bildern: ${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${limit} Alarme. Ihre Stores werden im ${fastSec}-Sekunden-Takt gelesen, alle anderen Stores im ${checkSec}-Sekunden-Takt; ein bestätigter Restock ist in etwa ${alertSec} Sek. auf Ihrem Handy. Monatliche Abrechnung, jederzeit kündbar.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-Smartphone", desktop: "Computer", other: "Endgerät" },
    subject: (device: string) => `Ihr ${device} empfängt keine RestockWire-Mitteilungen mehr`,
    gone: (device: string) => `Laut Push-Dienst hat Ihr ${device} sein RestockWire-Abo beendet; Mitteilungen erreichen das Gerät daher nicht mehr.`,
    byEmail: "Bis Mitteilungen wieder eingeschaltet sind, kommen Ihre Restock-Alarme per E-Mail.",
    reopenIos: "Zum Beheben starten Sie RestockWire vom Home-Bildschirm, nicht aus Safari, und tippen auf der Kontoseite auf „Mitteilungen einschalten“.",
    reopenOther: "Zum Beheben öffnen Sie RestockWire, gehen zu „Konto“ und tippen auf „Mitteilungen einschalten“.",
    causes: "Meist passiert das, wenn die App vom Home-Bildschirm gelöscht, Mitteilungen in den Einstellungen ausgeschaltet oder das Handy aus einem Backup wiederhergestellt wurde.",
  },
};
