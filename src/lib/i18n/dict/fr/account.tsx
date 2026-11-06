/**
 * Chaînes françaises : account (tableau de bord, modules de réassort, pages installation, paiement réussi, tarifs).
 * Les noms de formule et les montants en dollars restent tels quels (facturation en USD partout).
 */
import type { Dict } from "../en";
import { num } from "@/lib/i18n/format";
import { SPEED } from "@/lib/plans";

const n = (v: number) => num("fr", v);
const cap1 = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
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
    title: "20 secondes, de la notification à la réservation",
    sub: "préparation en amont ; au moment venu, quatre touchers",
    lasts: "temps en ligne habituel d’un Duo",
    push: "de la confirmation à votre écran",
    tapsLeft: "touchers une fois la notification reçue",
    steps: [
      { title: "10 minutes avant le créneau, en place", hint: "créneaux habituels de vos magasins : plus bas sur cette page" },
      { title: "Page Apple ouverte, variante choisie", hint: "capacité + coloris exacts → Livraison et retrait" },
      { title: "Débloqué payé comptant, ou conditions acceptées d’avance", hint: "en débloqué comptant, aucune case à cocher" },
      { title: "Écran toujours allumé", hint: "Verrouillage auto : Jamais · un toucher toutes les 10–15 min" },
      { title: "Notification reçue : on lit, on enchaîne", hint: "Retrait → magasin de la notification → premier créneau → Apple Pay" },
    ],
    guide: "La méthode complète, deux minutes de lecture",
    window: "Le créneau à guetter",
  },

  restock: {
    title: "Heures de retour en stock dans vos magasins",
    anyIphone: "iPhone",
    and: " et ",
    yours: (k) => (k === 1 ? "le magasin suivi" : `les ${n(k)} magasins suivis`),
    Yours: (k) => (k === 1 ? "Le magasin suivi" : `Les ${n(k)} magasins suivis`),
    otherStores: (k) => s(k, "magasin voisin", "magasins voisins"),
    meta: (what, stores, days, zone) => `${what} · ${s(stores, "magasin")} · fenêtre de ${days} jours · heure ${zone}`,
    busiest: (yours, then) => (then ? `créneau le plus chargé, ${yours} · ensuite ${then}` : `créneau le plus chargé, ${yours}`),
    busiestArea: (stores, zone) => `créneau le plus chargé, heure ${zone}, sur ${n(stores)} magasins`,
    next: (inHours) => `créneau suivant · ${inHours === 0 ? "en cours" : `d’ici ${n(inHours)} h`}`,
    typical: "temps en ligne habituel",
    count: (yours, days, total, pattern) => (total === 0 ? `${cap1(yours)} : zéro retour en stock sur ${days} jours, pour l’instant` : `${cap1(yours)} : retours en stock sur ${days} jours${pattern ? "" : " · trop peu pour dégager une tendance"}`),
    byHour: (busiestInGreen) => `Par heure${busiestInGreen ? " · le créneau phare en vert" : ""}`,
    byWeekday: (busiest) => `Par jour${busiest ? ` · le plus actif : ${busiest}` : ""}`,
    hourChart: (yours, zone, items) => `${cap1(yours)}, heure ${zone}, retours en stock heure par heure : ${items}`,
    weekdayChart: (yours, items) => `${cap1(yours)}, retours en stock selon le jour : ${items}`,
    chartItem: (label, k, reported) => `${label} ${n(k)}${reported ? ` (+${n(reported)} de source tierce)` : ""}`,
    barTitle: (label, k, yours, area, reported) =>
      `${label} — ${yours} : ${s(k, "retour en stock", "retours en stock")}${area ? ` · fuseau ${area.zone} au complet : ${n(area.n)}` : ""}${reported ? ` · source tierce : ${n(reported)}` : ""}`,
    now: "à présent",
    allZone: (stores, zone) => `Fuseau ${zone} au complet : ${n(stores)} magasins`,
    reportMarkBars: "Barres en tirets",
    reportMarkDots: "Points évidés",
    sellTitle: "Combien de temps le stock tient-il dans vos magasins ?",
    sellMeta: (what, stores, days) => `${what} · ${s(stores, "magasin")} · fenêtre de ${days} jours`,
    sellLabel: (yours) => `dans ${yours}`,
  },

  success: {
    metaTitle: "Alertes actives",
    isOn: (plan) => `${plan} : c’est parti`,
    yourPlan: "Formule en cours",
    received: "Paiement reçu",
    onPlan: (limit) => `Capacité de la formule : ${n(limit)} alertes.`,
    planOn: "Formule en service.",
    pending: "Abonnement en cours d’inscription : il apparaît d’ici une minute.",
    open: "Voir mes alertes",
    another: "Nouvelle alerte",
    saved: (k) => `${s(k, "alerte prête", "alertes prêtes")} · reçu envoyé par Stripe`,
    pushOn: "Notifications",
    pushNext: "Reste une étape : brancher le téléphone",
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
    aboutMinute: "une minute, à peu près",
    sameSpeed: "Une seule vitesse pour toutes les formules",
    rechecked: "entre deux vérifications de vos magasins",
    toPhone: "entre la confirmation et votre écran",
    listing: "un Duo typique, de la mise en ligne à l’épuisement",
    note: { plus: "1 iPhone × 10 magasins", pro: "2 iPhone × 10 magasins", max: "5 iPhone × 10 magasins" } as Record<string, string>,
    month: "/ mois",
    alerts: (k) => `${n(k)} alertes`,
    perks: [
      `Vérifications toutes les ${SPEED.fastSec} secondes sur vos magasins, toutes les ${SPEED.checkSec} secondes sur les 269`,
      `Un retour en stock confirmé sur votre téléphone en ${SPEED.alertSec} s environ`,
    ],
    cancel: "Sans engagement, arrêt quand vous voulez",
    get: (plan) => `Choisir ${plan}`,
    billing: "Facturé via Stripe · carte ou Link · changements de formule au prorata",
    refund: "[Remboursement intégral sous 7 jours](/refunds) après un paiement, si aucune vraie alerte de remise en stock n’a suivi (les tests ne comptent pas)",
  },
};
