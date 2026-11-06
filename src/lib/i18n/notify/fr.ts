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
  pushBody: (where, quote) => `${where}${quote ? ` — ${quote}` : ""}. Ouvrez apple.com pour le réserver.`,
  testTitle: "Test RestockWire : les notifications fonctionnent",
  testBody: (time, device) => `Envoyé à ${time} sur votre ${device}. Une vraie alerte de retour en stock arrive exactement comme celle-ci, quelques secondes après sa confirmation.`,
  device: {
    iphoneApp: "iPhone (app de l’écran d’accueil)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (app installée)",
    android: (browser) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser) => `ordinateur${browser ? ` (${browser})` : ""}`,
    other: "cet appareil",
  },
  email: {
    subject: (cfg, store, more) => `${cfg} · ${store}${more > 0 ? ` +${more} autre${more > 1 ? "s" : ""}` : ""}`,
    intro: "Proposé en retrait en magasin à cet instant :",
    reserve: "Réserver",
    store: "Magasin",
    tip: "Les offres de retrait durent rarement longtemps. Dans l’app Apple Store ou sur apple.com, choisissez « Retrait », puis ce magasin.",
    manage: (url) => `Modifier ou mettre en pause cette alerte : ${url}`,
    htmlTitle: "Proposé en retrait maintenant",
    htmlReserve: "Réserver sur apple.com",
    htmlStorePage: "Ouvrir la page du magasin →",
    htmlTip: "Les offres de retrait durent rarement longtemps. Dans l’app Apple Store ou sur apple.com, choisissez <b>Retrait</b>, puis ce magasin.",
    htmlManage: "Modifier ou mettre en pause cette alerte",
    cancel: (url: string) => `Vous avez votre iPhone ? Résiliable à tout moment : ${url}`,
    htmlGotIt: "Vous avez votre iPhone ?",
    htmlCancel: "Résiliable à tout moment",
    nudge: (url: string) => `L’e-mail est la solution de repli : aucun téléphone de votre compte n’a les notifications activées. Une notification arrive environ 3 secondes après un retour en stock confirmé. Pour changer, ouvrez RestockWire depuis votre écran d’accueil et touchez « Activer les notifications » : ${url}`,
    htmlNudge: (url: string) => `L’e-mail est la solution de repli : aucun téléphone de votre compte n’a les notifications activées. Une <b>notification arrive environ 3 secondes</b> après un retour en stock confirmé. Ouvrez RestockWire depuis votre écran d’accueil et touchez <b>Activer les notifications</b>. <a href="${url}" style="color:#0a7f3f">Étapes de configuration →</a>`,
  },
  nudge: {
    subject: "Vos alertes RestockWire peuvent arriver sur votre téléphone en 3 secondes environ",
    intro: "Environ 3 secondes : c’est le temps qu’il faut à une notification pour atteindre un téléphone après que RestockWire a confirmé un retour en stock. Un retour en stock typique d’iPhone Duo disparaît en une minute environ, et l’e-mail est plus lent. Vos alertes arrivent par e-mail parce qu’aucun téléphone de votre compte n’a les notifications activées.",
    howTitle: "Le changement prend moins d’une minute :",
    stepsIos: ["iPhone : allez sur restockwire.com dans Safari, touchez Partager, puis « Sur l’écran d’accueil ».", "Lancez RestockWire depuis l’écran d’accueil, pas depuis Safari, et connectez-vous.", "Sur la page Compte, touchez « Activer les notifications », puis « Autoriser »."],
    stepsOther: "Android ou ordinateur : allez sur restockwire.com/account et touchez « Activer les notifications ».",
    after: "L’e-mail continue tant qu’aucun appareil n’est activé. Ensuite, les alertes arrivent en notification et les e-mails s’arrêtent.",
    cta: (url: string) => `Étapes de configuration illustrées : ${url}`,
  },
  checkoutSubmit: (plan, limit, fastSec, checkSec, alertSec) => `${plan} : ${limit} alertes. Vos magasins sont vérifiés toutes les ${fastSec} s et tous les autres toutes les ${checkSec} s ; un retour en stock confirmé arrive sur votre téléphone en ${alertSec} s environ. Facturé chaque mois, résiliable à tout moment.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "téléphone Android", desktop: "ordinateur", other: "appareil" },
    subject: (device) => `Votre ${device} ne reçoit plus les notifications RestockWire`,
    gone: (device) => `Le service de notifications signale que votre ${device} a abandonné son abonnement RestockWire : les notifications ne lui parviennent plus.`,
    byEmail: "Tant que les notifications ne sont pas réactivées, vos alertes de retour en stock arrivent par e-mail.",
    reopenIos: "Pour corriger cela, lancez RestockWire depuis votre écran d’accueil, pas depuis Safari, et touchez « Activer les notifications » sur la page Compte.",
    reopenOther: "Pour corriger cela, ouvrez RestockWire, allez dans Compte et touchez « Activer les notifications ».",
    causes: "Cela arrive en général quand l’app est supprimée de l’écran d’accueil, que les notifications sont désactivées dans Réglages ou que le téléphone est restauré à partir d’une sauvegarde.",
  },
};

export const notifyFr: NotifyText = typo(raw);
