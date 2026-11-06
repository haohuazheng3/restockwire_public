/**
 * Notification texts in Dutch (push, alert email, "notifications stopped" email, device names, Stripe checkout line).
 * Plain TS with no imports besides types: the poller sends these too.
 */
import type { NotifyText } from "./en";

export const notifyNl: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Reserveer hem op apple.com.`,
  testTitle: "RestockWire-test: meldingen werken",
  testBody: (time: string, device: string) => `Verstuurd om ${time} naar je ${device}. Een echte voorraadalert komt precies zo binnen, seconden na de bevestiging.`,
  device: {
    iphoneApp: "iPhone (app op beginscherm)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (geïnstalleerde app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `computer${browser ? ` (${browser})` : ""}`,
    other: "dit apparaat",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` +${more} meer` : ""}`,
    intro: "Op dit moment beschikbaar om op te halen in de winkel:",
    reserve: "Reserveren",
    store: "Winkel",
    tip: 'Ophaalvoorraad is zelden lang beschikbaar. Kies in de Apple Store-app of op apple.com "Ophalen" en dan deze winkel.',
    manage: (url: string) => `Deze alert wijzigen of pauzeren: ${url}`,
    htmlTitle: "Nu beschikbaar om op te halen",
    htmlReserve: "Reserveer op apple.com",
    htmlStorePage: "Open de winkelpagina →",
    htmlTip: "Ophaalvoorraad is zelden lang beschikbaar. Kies in de Apple Store-app of op apple.com <b>Ophalen</b> en dan deze winkel.",
    htmlManage: "Deze alert wijzigen of pauzeren",
    cancel: (url: string) => `Heb je je iPhone al? Opzeggen kan altijd: ${url}`,
    htmlGotIt: "Heb je je iPhone al?",
    htmlCancel: "Opzeggen kan altijd",
    nudge: (url: string) => `E-mail is de reserveroute: op geen enkele telefoon in je account staan meldingen aan. Een push komt zo'n 3 seconden na een bevestigde aanvulling binnen. Overstappen: open RestockWire vanaf je beginscherm en tik op "Zet meldingen aan": ${url}`,
    htmlNudge: (url: string) => `E-mail is de reserveroute: op geen enkele telefoon in je account staan meldingen aan. Een <b>push komt zo'n 3 seconden</b> na een bevestigde aanvulling binnen. Open RestockWire vanaf je beginscherm en tik op <b>Zet meldingen aan</b>. <a href="${url}" style="color:#0a7f3f">Stappen om in te stellen →</a>`,
  },
  nudge: {
    subject: "Je RestockWire-alerts kunnen in zo'n 3 seconden op je telefoon staan",
    intro: "Zo'n 3 seconden: zo snel staat een push op een telefoon nadat RestockWire een aanvulling heeft bevestigd. Een gewone aanvulling van de iPhone Duo is na ongeveer een minuut weg, en e-mail is trager. Je alerts komen nu per e-mail, omdat op geen enkele telefoon in je account meldingen aanstaan.",
    howTitle: "Overstappen kost minder dan een minuut:",
    stepsIos: ["iPhone: ga in Safari naar restockwire.com, tik op Deel en dan op Zet op beginscherm.", "Start RestockWire vanaf het beginscherm, niet vanuit Safari, en log in.", "Tik op de accountpagina op Zet meldingen aan en dan op Sta toe."],
    stepsOther: "Android of computer: ga naar restockwire.com/account en tik op Zet meldingen aan.",
    after: "De e-mails blijven komen tot een apparaat aanstaat. Daarna komen alerts als melding binnen en stoppen de e-mails.",
    cta: (url: string) => `Stappen met afbeeldingen: ${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${limit} alerts. Je winkels worden elke ${fastSec} s gelezen, alle andere winkels elke ${checkSec} s; een bevestigde aanvulling staat in zo'n ${alertSec} s op je telefoon. Maandelijks gefactureerd, altijd opzegbaar.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android-telefoon", desktop: "computer", other: "apparaat" },
    subject: (device: string) => `Je ${device} krijgt geen meldingen van RestockWire meer`,
    gone: (device: string) => `De pushdienst meldt dat je ${device} het RestockWire-abonnement heeft laten vallen. Meldingen komen er dus niet meer aan.`,
    byEmail: "Tot meldingen weer aanstaan, komen je voorraadalerts per e-mail.",
    reopenIos: 'Oplossen: start RestockWire vanaf je beginscherm, niet vanuit Safari, en tik op de accountpagina op "Zet meldingen aan".',
    reopenOther: 'Oplossen: open RestockWire, ga naar Account en tik op "Zet meldingen aan".',
    causes: "Meestal gebeurt dit als de app van het beginscherm is verwijderd, meldingen in Instellingen zijn uitgezet of de telefoon uit een reservekopie is hersteld.",
  },
};
