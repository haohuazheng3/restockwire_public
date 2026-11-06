/**
 * Chaînes françaises : account (tableau de bord, modules de réassort, pages installation, paiement réussi, tarifs).
 * Les noms de formule et les montants en dollars restent tels quels (facturation en USD partout).
 */
import type { Dict } from "../en";
import { num } from "@/lib/i18n/format";
import { SPEED } from "@/lib/plans";

const n = (v: number) => num("fr", v);
const s = (k: number, one: string, many = `${one}s`) => `${n(k)} ${k > 1 ? many : one}`;

export const account: Dict["account"] = {
  loading: "Chargement",
  meta: { title: "Mes alertes" },
  signedInAs: (email) => `Compte : ${email}`,
  title: "Mes alertes",
  units: { s: "s", min: "min", taps: "touchers" },

  plan: {
    title: "Formule",
    none: "Aucune formule sur ce compte : les alertes sont en pause",
    summary: (plan, on, limit) => `${plan} · ${n(on)} alerte${on > 1 ? "s" : ""} en service sur ${n(limit)}`,
    renews: (date) => ` · prochain prélèvement le ${date}`,
    ends: (date) => ` · s’arrête le ${date}`,
  },

  sent: {
    title: "Alertes délivrées",
    last: (ago) => `La plus récente ${ago}`,
    none: "Aucune délivrée pour l’instant",
    empty: "Aucune alerte n’est encore partie.",
    channel: { push: "notification", email: "e-mail" } as Record<string, string>,
    status: { sent: "envoyée", failed: "échec", skipped: "ignorée" } as Record<string, string>,
  },

  fast: {
    title: "Une réservation en 20 secondes",
    sub: "tout est fait d’avance, sauf les quatre derniers touchers",
    lasts: "durée de mise en ligne typique d’un Duo",
    push: "retour en stock confirmé → notification sur votre téléphone",
    tapsLeft: "touchers restants à l’arrivée de la notification",
    steps: [
      { title: "Connaissez votre créneau", hint: "les heures habituelles de vos magasins sont ci-dessous · soyez prêt 10 min avant" },
      { title: "Préchargez le paiement Apple", hint: "capacité et couleur exactes → Livraison et retrait" },
      { title: "Acceptez les conditions d’avance · ou achetez-le débloqué", hint: "débloqué et payé comptant : aucune case à cocher" },
      { title: "Empêchez l’écran de se verrouiller", hint: "Verrouillage auto → Jamais · touchez-le toutes les 10–15 min" },
      { title: "Quand elle tombe : lisez, puis agissez", hint: "Retrait → le magasin indiqué → premier créneau → Apple Pay" },
    ],
    guide: "Le guide pas à pas en deux minutes",
    window: "Votre créneau de retour en stock",
  },

  restock: {
    title: "Heures de retour en stock dans vos magasins",
    anyIphone: "iPhone",
    and: " et ",
    yours: (k) => (k === 1 ? "votre magasin" : `vos ${n(k)} magasins`),
    Yours: (k) => (k === 1 ? "Votre magasin" : `Vos ${n(k)} magasins`),
    otherStores: (k) => s(k, "autre magasin", "autres magasins"),
    meta: (what, stores, days, zone) => `${what} · ${s(stores, "magasin")} · ${days} derniers jours · ${zone}`,
    busiest: (yours, then) => (then ? `heure de pointe dans ${yours} · puis ${then}` : `heure de pointe dans ${yours}`),
    busiestArea: (stores, zone) => `pointe sur l’ensemble des ${n(stores)} magasins (${zone})`,
    next: (inHours) => `prochain créneau · ${inHours === 0 ? "cette heure-ci" : `dans ${n(inHours)} h`}`,
    typical: "durée de mise en ligne typique",
    count: (yours, days, total, pattern) => (total === 0 ? `aucun retour en stock dans ${yours} pour l’instant · ${days} derniers jours` : `retours en stock dans ${yours} · ${days} derniers jours${pattern ? "" : " · pas assez pour une tendance"}`),
    byHour: (busiestInGreen) => `Heure par heure${busiestInGreen ? " · pointe en vert" : ""}`,
    byWeekday: (busiest) => `Jour par jour${busiest ? ` · pointe le ${busiest}` : ""}`,
    hourChart: (yours, zone, items) => `Retours en stock par heure dans ${yours} (${zone}) : ${items}`,
    weekdayChart: (yours, items) => `Retours en stock par jour de la semaine dans ${yours} : ${items}`,
    chartItem: (label, k, reported) => `${label} ${n(k)}${reported ? ` (+${s(reported, "signalé", "signalés")} par d’autres sites de suivi)` : ""}`,
    barTitle: (label, k, yours, area, reported) =>
      `${label} : ${s(k, "retour en stock", "retours en stock")} dans ${yours}${area ? ` · ${n(area.n)} sur tout le fuseau (${area.zone})` : ""}${reported ? ` · ${s(reported, "signalé", "signalés")} par d’autres sites de suivi` : ""}`,
    now: "maintenant",
    allZone: (stores, zone) => `Chacun des ${n(stores)} magasins du fuseau (${zone})`,
    reportMarkBars: "En pointillés",
    reportMarkDots: "Points creux",
    sellTitle: "Combien de temps durent les retours en stock de vos magasins",
    sellMeta: (what, stores, days) => `${what} · ${s(stores, "magasin")} · ${days} derniers jours`,
    sellLabel: (yours) => `dans ${yours}`,
  },

  success: {
    metaTitle: "Vos alertes sont en service",
    isOn: (plan) => `${plan} est actif`,
    yourPlan: "Votre formule",
    received: "Paiement confirmé",
    onPlan: (limit) => `Votre formule compte ${n(limit)} alertes.`,
    planOn: "Votre formule est active.",
    pending: "Patientez une minute : l’abonnement apparaît bientôt dans votre compte.",
    open: "Aller à mes alertes",
    another: "Créer une autre alerte",
    saved: (k) => `${s(k, "alerte enregistrée", "alertes enregistrées")} · Stripe envoie le reçu`,
    pushOn: "Notifications",
    pushNext: "Dernière étape : les alertes sur votre téléphone",
  },

  install: {
    metaTitle: "Installer l’app : les alertes de retour en stock sur l’écran verrouillé",
    metaDescription: "Placez RestockWire sur votre écran d’accueil : une notification vous parvient à la seconde où un iPhone Duo, 18 Pro ou Pro Max est proposé au retrait dans un magasin près de chez vous.",
  },

  pricing: {
    metaTitle: "Tarifs : 10 alertes $5, 20 pour $10, 50 pour $20",
    metaDescription: `Alertes de retour en stock pour le retrait d’iPhone dans chaque Apple Store des États-Unis : vos magasins vérifiés toutes les ${SPEED.fastSec} secondes, une notification environ ${SPEED.alertSec} secondes après un retour confirmé. Plus $5/mois pour 10 alertes, Pro $10 pour 20, Max $20 pour 50. Résiliable à tout moment.`,
    title: "Tarifs",
    lead: "**Une alerte = un magasin × un iPhone exact.** Tout le reste du site se consulte gratuitement.",
    chips: ["Les 269 Apple Store des États-Unis", "Résiliable à tout moment", "Carte ou Link"],
    fastest: "Aucun suivi de stock iPhone n’annonce un intervalle de vérification plus court",
    everyFast: `**${SPEED.fastSec} secondes** entre deux vérifications de vos magasins · les intervalles annoncés par les autres sites de suivi : de 8 secondes à 15 minutes`,
    sellsOut: (band) => `**${band}** : la durée de mise en ligne d’un retour en stock typique d’iPhone Duo ; certains disparaissent en 20 à 30 secondes`,
    band: (range) => `${range} secondes`,
    aboutMinute: "environ une minute",
    sameSpeed: "Une seule vitesse pour toutes les formules",
    rechecked: "entre deux vérifications de vos magasins",
    toPhone: "du retour en stock confirmé à votre téléphone",
    listing: "un Duo typique, de la mise en ligne à l’épuisement",
    note: { plus: "1 iPhone × 10 magasins", pro: "2 iPhone × 10 magasins", max: "5 iPhone × 10 magasins" } as Record<string, string>,
    month: "/ mois",
    alerts: (k) => `${n(k)} alertes`,
    perks: [
      `Vérifications toutes les ${SPEED.fastSec} secondes sur vos magasins, toutes les ${SPEED.checkSec} secondes sur les 269`,
      `Un retour en stock confirmé sur votre téléphone en ${SPEED.alertSec} s environ`,
    ],
    cancel: "Résiliable à tout moment",
    get: (plan) => `Choisir ${plan}`,
    billing: "Facturé via Stripe · carte ou Link · changements de formule au prorata",
    refund: "Changé d’avis ? [Un remboursement intégral est possible sous 7 jours](/refunds) tant qu’aucune alerte de retour en stock ne vous est parvenue",
  },
};
