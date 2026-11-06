/**
 * Textes de notification en français (notification push, e-mail d’alerte, e-mail « notifications arrêtées », ligne
 * du paiement Stripe). Code du poller : aucun import hors types. La typographie française (espaces insécables avant
 * : ; ? ! % et dans « ») est appliquée à la fin, sur chaque chaîne et chaque résultat de fonction.
 */
import type { NotifyText } from "./en";

const nb = (s: string): string => s.replace(/ ([:;?!%»])/g, (_m, p: string) => `${p === ":" || p === "»" ? " " : " "}${p}`).replace(/« /g, "« ");
function typo<T>(d: T): T {
  if (typeof d === "string") return nb(d) as T;
  if (Array.isArray(d)) return d.map((x) => typo(x)) as T;
  if (typeof d === "function") return ((...a: unknown[]) => typo((d as (...x: unknown[]) => unknown)(...a))) as T;
  if (d && typeof d === "object") return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, typo(v)])) as T;
  return d;
}

const raw: NotifyText = {
  pushTitle: (cfg) => cfg,
  pushBody: (where, quote) => `${where}${quote ? ` — ${quote}` : ""}. En retrait maintenant, réservation sur apple.com.`,
  testTitle: "RestockWire, essai : le canal est ouvert",
  testBody: (time, device) => `Essai parti à ${time} vers votre ${device}. Les vraies alertes arrivent sous cette forme, quelques secondes après chaque remise en stock confirmée.`,
  device: {
    iphoneApp: "iPhone (app installée sur l’écran d’accueil)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (app ajoutée)",
    android: (browser) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser) => `ordinateur${browser ? ` (${browser})` : ""}`,
    other: "cet appareil",
  },
  email: {
    subject: (cfg, store, more) => `${cfg} · ${store}${more > 0 ? ` +${more} autre${more > 1 ? "s" : ""}` : ""}`,
    intro: "Retrait en magasin ouvert, à la minute où nous écrivons :",
    reserve: "Réserver",
    store: "Magasin",
    tip: "Ce stock part vite. App Apple Store ou apple.com : option « Retrait », puis ce magasin.",
    manage: (url) => `Changer ou suspendre l’alerte : ${url}`,
    htmlTitle: "Retrait ouvert à l’instant",
    htmlReserve: "Réserver en ligne (apple.com)",
    htmlStorePage: "Fiche du magasin →",
    htmlTip: "Ce stock part vite. App Apple Store ou apple.com : option <b>Retrait</b>, puis ce magasin.",
    htmlManage: "Changer ou suspendre l’alerte",
    cancel: (url: string) => `iPhone en poche ? L’abonnement s’arrête quand vous voulez : ${url}`,
    htmlGotIt: "iPhone en poche ?",
    htmlCancel: "Arrêter l’abonnement",
    nudge: (url: string) => `Pourquoi un e-mail ? Aucun téléphone de votre compte n’accepte les notifications. Une notification, elle, tombe environ 3 secondes après la confirmation. Pour basculer : RestockWire depuis l’écran d’accueil, puis « Activer les notifications » : ${url}`,
    htmlNudge: (url: string) => `Pourquoi un e-mail ? Aucun téléphone de votre compte n’accepte les notifications. Une notification, elle, <b>tombe environ 3 secondes après la confirmation</b>. Pour basculer : RestockWire depuis l’écran d’accueil, puis <b>Activer les notifications</b>. <a href="${url}" style="color:#0a7f3f">Le pas-à-pas →</a>`,
  },
  nudge: {
    subject: "RestockWire : vos alertes, 3 secondes environ après la confirmation, sur votre téléphone",
    intro: "Une remise en stock d’iPhone Duo dure en général une minute environ. Par notification, l’alerte atteint votre téléphone environ 3 secondes après notre confirmation ; par e-mail, c’est plus long. Aujourd’hui, vous recevez des e-mails : aucun téléphone de votre compte n’accepte les notifications.",
    howTitle: "Moins d’une minute de réglage :",
    stepsIos: ["iPhone : restockwire.com dans Safari, bouton Partager, puis « Sur l’écran d’accueil ».", "Ouvrez RestockWire par son icône (pas par Safari) et connectez-vous.", "Page Compte : « Activer les notifications », puis « Autoriser »."],
    stepsOther: "Android, ordinateur : une seule étape, « Activer les notifications » sur restockwire.com/account.",
    after: "Tant qu’aucun appareil n’est prêt, l’e-mail prend le relais. Dès qu’un appareil l’est, place aux notifications, fin des e-mails.",
    cta: (url: string) => `Le pas-à-pas en images : ${url}`,
  },
  checkoutSubmit: (plan, limit, fastSec, checkSec, alertSec) => `${plan}, ${limit} alertes. Fil de ${fastSec} s pour vos magasins, ${checkSec} s pour les autres ; ${alertSec} s environ entre la confirmation et votre téléphone. Mensuel, sans engagement.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "smartphone Android", desktop: "ordinateur", other: "appareil" },
    subject: (device) => `Notifications RestockWire coupées sur votre ${device}`,
    gone: (device) => `Selon le service de notifications, votre ${device} s’est désabonné de RestockWire. Plus rien ne lui parvient.`,
    byEmail: "D’ici la réactivation, vos alertes partent par e-mail.",
    reopenIos: "Correctif : ouvrez RestockWire par son icône sur l’écran d’accueil (pas dans Safari), puis page Compte, « Activer les notifications ».",
    reopenOther: "Correctif : RestockWire, page Compte, « Activer les notifications ».",
    causes: "Causes habituelles : icône retirée de l’écran d’accueil, notifications coupées dans Réglages, ou téléphone restauré depuis une sauvegarde.",
  },
};

export const notifyFr: NotifyText = typo(raw);
