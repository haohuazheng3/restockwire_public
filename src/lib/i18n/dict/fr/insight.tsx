/**
 * Chaînes françaises : insight — statut du retrait Apple, rapports hebdomadaires des retours en stock, Apple Store les
 * plus rapides à se vider, magasin contre magasin et trois guides téléphone. Même structure que dict/en/insight.tsx.
 * Les nombres, durées, dates et noms de magasins arrivent déjà formatés ; `w.name` est le nom du pays en français et
 * reçoit sa préposition via dans() (« en France », « au Canada », « aux États-Unis »). Libellés iOS : ceux d’Apple
 * France (Réglages, Concentration, Résumé programmé…). Espaces ordinaires : la typographie est appliquée dans index.ts.
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { plural } from "@/lib/i18n/format";
import { dans } from "./util";

/** « en France », « au Canada », « aux États-Unis ». */
const en = (w: Where) => dans(w.name);
const weeks = (k: number) => plural("fr", k, { one: "# semaine", other: "# semaines" });
const hours = (k: number) => plural("fr", k, { one: "# heure difficile", other: "# heures difficiles" });
const dayCount = (k: number) => plural("fr", k, { one: "# jour", other: "# jours" });

export const insight: InsightDict = {
  nav: {
    status: "Statut du retrait Apple",
    reports: "Rapports hebdomadaires des retours en stock",
    fastest: "Les Apple Store qui se vident le plus vite",
    compare: "Magasin contre magasin",
    guides: "Guides d’alertes sur téléphone",
    otherCountries: "La même page pour un autre pays",
    updated: (when: string) => `Mis à jour ${when}`,
    sources: "Sources et méthode",
    cite: "Vous reprenez ces chiffres ? Citez cette page en lien comme source.",
    alertCta: "Recevoir une alerte de retour en stock",
    logCta: "Ouvrir le journal des retours en stock",
  },

  status: {
    title: (w: Where) => (w.us ? "Retrait Apple Store en panne ? Statut, États-Unis" : `Retrait Apple Store ${en(w)} : statut en direct`),
    h1: (w: Where) => (w.us ? "La vérification du retrait en magasin d’Apple fonctionne-t-elle en ce moment ?" : `La vérification du retrait en magasin d’Apple fonctionne-t-elle ${en(w)} en ce moment ?`),
    meta: (v: StatusView) =>
      `En direct : Apple a répondu pour ${v.answered} des ${v.stores} Apple Store ${en(v.w)} dans la dernière minute. Taux d’échec, heures difficiles des dernières 24 h et que faire quand ça coince.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Oui. Apple a répondu aux requêtes de retrait pour ${v.answered} des ${v.stores} Apple Store ${en(v.w)} dans la dernière minute, et ${v.failLastHour} des requêtes ont échoué sur l’heure écoulée.`
        : v.verdict === "slow"
          ? `En partie. Apple a répondu pour ${v.answered} des ${v.stores} Apple Store ${en(v.w)} dans la dernière minute ; ${v.failLastHour} des requêtes ont échoué sur l’heure écoulée, certains stocks peuvent donc s’afficher en retard.`
          : v.verdict === "down"
            ? `Pas en ce moment. Apple n’a répondu que pour ${v.answered} des ${v.stores} Apple Store ${en(v.w)} dans la dernière minute. Le stock affiché sur apple.com et ici peut être périmé jusqu’au rétablissement.`
            : `RestockWire ne parvient pas à lire le statut ${en(v.w)} pour l’instant. Rechargez dans une minute.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Fonctionne", slow: "Lent", down: "Ne répond pas", unknown: "Inconnu" })[v],
    tiles: {
      answered: "magasins ayant répondu dans la dernière minute",
      age: "âge médian de la dernière vérification d’un magasin",
      failHour: "requêtes en échec, 60 dernières minutes",
      failDay: "requêtes en échec, 24 dernières heures",
    },
    nowH2: "Que voit RestockWire en ce moment ?",
    nowLead: (v: StatusView) =>
      `${v.answered} des ${v.stores} magasins ont répondu dans la dernière minute${v.age ? ` ; un magasin type a été lu il y a ${v.age}` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Chaque Apple Store ${en(v.w)} passe sur le cycle de 15 secondes ; les magasins visés par une alerte, toutes les 5 secondes.`,
      v.oldest ? `Le magasin qui attend le plus a répondu pour la dernière fois il y a ${v.oldest}.` : "Aucun magasin n’a encore répondu sur cette période.",
      Number(v.never) > 0 ? `Magasins restés sans réponse : ${v.never}. Apple n’y propose pas de vérification du retrait pour l’instant.` : "Chaque magasin a répondu au moins une fois.",
    ],
    dayH2: "Comment se sont passées les dernières 24 heures ?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Sans accroc : aucune des 24 dernières heures n’a dépassé 5 % de requêtes en échec (${v.failDay} au total).`
        : `${hours(v.roughHours)} sur les 24 dernières, chacune avec 5 % de requêtes en échec ou plus : ${v.roughList}. Au total, ${v.failDay} d’échecs.`,
    hourCaption: (zone: string) => `Requêtes et échecs par heure, 24 dernières heures (${zone})`,
    hourHead: ["Heure", "Requêtes", "Échecs", "Part en échec"],
    whyH2: "Pourquoi apple.com affiche-t-il tous les magasins indisponibles ?",
    whyLead: "Le plus souvent, la configuration est épuisée. Parfois, c’est la vérification d’Apple elle-même qui peine.",
    whyPoints: [
      "**Épuisé :** la vérification répond normalement et ne liste simplement aucun magasin. Cette page reste verte.",
      "**Vérification en difficulté :** les réponses échouent ou reviennent vides pour tous les magasins à la fois. Cette page passe à l’orange ou au rouge en moins d’une minute.",
      "**Votre session :** un onglet apple.com ancien peut garder une vieille réponse. Rechargez la page du panier avant de vous y fier.",
    ],
    doH2: "Que faire quand la vérification du retrait est bloquée ?",
    doLead: "Gardez votre alerte active et patientez. La vérification se rétablit seule, et les retours en stock survenus entre-temps sont tout de même confirmés.",
    doSteps: [
      "Laissez l’alerte tourner : RestockWire continue d’interroger Apple et vous prévient dès qu’un retour en stock est confirmé.",
      "Ne rechargez pas apple.com toutes les deux secondes : cela n’accélère pas la vérification d’Apple.",
      "Revenez sur cette page dans cinq minutes. Les périodes difficiles observées jusqu’ici ont duré de quelques minutes à environ deux heures.",
      "Quand elle repasse au vert, ouvrez la page de votre magasin : le journal des retours en stock montre ce qui est arrivé pendant la coupure.",
    ],
    methodH2: "Comment ce statut est-il mesuré ?",
    methodPoints: [
      "**Fraîcheur :** la dernière vérification réussie de chaque magasin, issue des propres requêtes de retrait de RestockWire.",
      "**Échecs :** requêtes en échec par heure dans le cycle qui couvre ce pays, telles que nos serveurs de relevé les enregistrent.",
      "**Verdict :** Fonctionne = 90 % des magasins ont répondu dans la dernière minute et moins de 5 % d’échecs ; Ne répond pas = moins de la moitié.",
    ],
    otherH2: "Statut du retrait dans d’autres pays",
    faq: (v: StatusView) => [
      { q: "Le retrait en magasin d’apple.com est-il en panne ?", a: v.verdict === "ok" ? `Pas ${en(v.w)} en ce moment : ${v.answered} des ${v.stores} magasins ont répondu dans la dernière minute.` : `Il peine ${en(v.w)} en ce moment : ${v.answered} des ${v.stores} magasins ont répondu dans la dernière minute.` },
      { q: "Un statut rouge veut-il dire que l’iPhone est épuisé ?", a: "Non. Rouge signifie que la vérification d’Apple échoue ; « épuisé » est une réponse normale et laisse le statut au vert." },
      { q: "À quelle fréquence cette page est-elle mise à jour ?", a: "Chaque visite lit des chiffres frais ; les compteurs datent de 30 secondes au plus." },
      { q: "Vais-je rater un retour en stock pendant une panne ?", a: "Vous pourriez l’apprendre en retard. RestockWire confirme chaque retour en stock dès que les réponses reviennent, et vous alerte à ce moment-là." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Rapports hebdo des retours d’iPhone, États-Unis" : `Rapports hebdo des retours d’iPhone ${en(w)}`),
    indexH1: (w: Where) => (w.us ? "Rapports hebdomadaires des retours en stock d’iPhone" : `Rapports hebdomadaires des retours en stock d’iPhone ${en(w)}`),
    indexMeta: (w: Where) => `Chaque semaine de retours en stock d’iPhone Duo, 18 Pro et 18 Pro Max dans les Apple Store ${en(w)} : volumes, magasins les plus actifs, configurations et vitesse d’épuisement.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `Le premier rapport ${en(w)} paraît dès qu’une semaine compte ${"20"} retours en stock confirmés.` : `${weeks(n)} en archive ${en(w)}. Chaque édition reprend le journal des retours en stock confirmés par RestockWire sur une semaine du lundi au dimanche, heure locale.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} retours en stock${complete ? "" : " · en cours"}`,
    title: (w: Where, range: string) => (w.us ? `Retours d’iPhone en stock, ${range}` : `Retours d’iPhone en stock ${en(w)}, ${range}`),
    h1: (w: Where, range: string) => `Retours en stock d’iPhone ${en(w)}, semaine du ${range}`,
    meta: (v: ReportView) => `${v.restocks} retours en stock d’iPhone confirmés dans ${v.stores} Apple Store ${en(v.w)}, ${v.range}. Magasin et jour les plus actifs, configuration la plus rare et vitesse d’épuisement.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "Cette semaine, pour l’instant : "}${v.restocks} retours en stock confirmés dans ${v.stores} Apple Store ${en(v.w)}${v.change ? `, ${v.change} par rapport à la semaine précédente` : ""}.${v.topStore ? ` ${v.topStore} arrive en tête avec ${v.topStoreN}.` : ""}${v.medianSell ? ` Un retour en stock d’iPhone Duo typique est resté en ligne ${v.medianSell}.` : ""}`,
    partial: (days: number) => `Le suivi couvre ${dayCount(days)} de cette semaine.`,
    running: "La semaine est en cours ; les chiffres bougent à chaque retour en stock confirmé.",
    tiles: {
      restocks: "retours en stock confirmés",
      stores: "magasins avec un retour en stock",
      sell: "durée médiane en ligne, iPhone Duo",
      change: "par rapport à la semaine précédente",
    },
    countH2: "Combien de retours en stock cette semaine ?",
    countLead: (v: ReportView) => `${v.restocks} au total : iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, sur ${v.configs} configurations.`,
    storesH2: "Quels Apple Store ont eu le plus de retours en stock ?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, avec ${v.topStoreN} retours en stock. Les dix premiers figurent ci-dessous.` : "Aucun magasin n’a eu de retour en stock cette semaine."),
    storesHead: ["#", "Apple Store", "Retours en stock"],
    configsH2: "Quelles configurations d’iPhone Duo sont revenues ?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `${v.topConfig} est revenue le plus souvent (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` ${v.lastConfig} est revenue le moins.` : ""}` : "Aucune configuration d’iPhone Duo n’est revenue en stock cette semaine.",
    configsHead: ["Configuration", "Retours en stock"],
    sellH2: "En combien de temps les retours en stock sont-ils partis ?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `Un retour en stock d’iPhone Duo typique est resté en ligne ${v.medianSell} ; ${v.within60} sont partis en moins d’une minute (${v.sellN} retours en stock chronométrés).` : "Trop peu de ruptures chronométrées cette semaine pour conclure.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `La semaine précédente : ${v.prevMedianSell}.` : ""),
    daysH2: "Quels jours ont été les plus actifs ?",
    daysLead: (v: ReportView) => (v.busiestDay ? `Le ${v.busiestDay}, avec ${v.busiestDayN} retours en stock${v.quietDay ? ` ; le ${v.quietDay} a été le plus calme` : ""}.` : "Pas encore de retours en stock à répartir sur les jours."),
    daysHead: ["Jour", "Retours en stock"],
    weekdays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    prevH2: "Comment se compare-t-elle à la semaine précédente ?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "Aucune semaine précédente en archive pour comparer." : v.change == null ? `La semaine précédente a enregistré ${v.prevRestocks}. L’évolution s’affiche une fois les deux semaines terminées et entièrement suivies.` : v.changeDir === "up" ? `Plus active : ${v.restocks} retours en stock contre ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Plus calme : ${v.restocks} retours en stock contre ${v.prevRestocks} (${v.change}).` : `À peu près pareil : ${v.restocks} contre ${v.prevRestocks}.`,
    prevNote: "Une semaine incomplète compare une partie de semaine à une semaine pleine ; lisez l’évolution une fois la semaine close.",
    readH2: "Qu’est-ce que cette semaine change pour acheter ?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Les retours en stock se sont concentrés le ${v.busiestDay} : gardez vos alertes actives toute la journée.` : "Gardez vos alertes actives tous les jours : les retours en stock n’ont pas d’horaire fixe.",
      v.medianSell ? `Avec une durée en ligne typique de ${v.medianSell}, la réservation doit commencer dans les secondes qui suivent l’alerte.` : "Les mises en ligne sont brèves : agissez dans les secondes qui suivent une alerte.",
      v.topStore ? `${v.topStore} a eu le plus de retours en stock ; s’il est près de chez vous, ajoutez-le à votre alerte.` : "Surveillez les magasins à votre portée ; un deuxième magasin proche double vos chances.",
    ],
    methodH2: "Comment le rapport est-il compté ?",
    methodPoints: [
      "**Retour en stock :** une configuration qui passe d’indisponible à disponible dans un magasin, confirmée par une seconde vérification. Les premières observations ne comptent pas.",
      "**Semaine :** du lundi 0 h au dimanche 24 h, dans le fuseau horaire principal du pays.",
      "**Durée en ligne :** d’un retour en stock confirmé à la rupture confirmée suivante, même magasin et même configuration.",
    ],
    archiveH2: "Autres semaines",
    faq: (v: ReportView) => [
      { q: `Combien d’iPhone Apple a-t-il remis en stock ${en(v.w)} cette semaine ?`, a: `RestockWire a confirmé ${v.restocks} retours en stock dans ${v.stores} magasins ; chacun correspond à une configuration revenue dans un magasin, pas à un nombre d’appareils.` },
      { q: "Apple publie-t-il ses chiffres de réassort ?", a: "Non. Ces chiffres sont les observations confirmées de RestockWire sur la disponibilité au retrait chez Apple." },
      { q: "Quand un nouveau rapport paraît-il ?", a: "Chaque lundi commence une nouvelle semaine ; sa page se remplit au fil des retours en stock confirmés et se clôt le dimanche soir." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Apple Store où l’iPhone Duo part le plus vite" : `Apple Store qui se vident le plus vite ${en(w)}`),
    h1: (w: Where) => `Quels Apple Store ${en(w)} écoulent l’iPhone Duo le plus vite ?`,
    meta: (v: RankView) => `${v.fastest ?? "Le magasin le plus rapide"} ${en(v.w)} : les retours en stock d’iPhone Duo partent en ${v.fastestSec ?? "quelques secondes"} en médiane. Tous les magasins classés, ${v.days} derniers jours, et où vous gardez une chance.`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest} est le plus rapide : un retour en stock d’iPhone Duo typique y est parti en ${v.fastestSec} (${v.fastestN} retours en stock chronométrés, ${v.days} derniers jours).${v.slowest ? ` Chez ${v.slowest}, il est resté ${v.slowestSec}.` : ""}`
        : `Trop peu de ruptures chronométrées ${en(v.w)} sur les ${v.days} derniers jours pour classer les magasins.`,
    tiles: { fastest: "magasin le plus rapide, durée médiane", slowest: "magasin classé le plus lent", ranked: "magasins classés", country: "médiane du pays entier" },
    fastH2: "Les magasins les plus rapides",
    fastLead: (v: RankView) => `${v.ranked} magasins comptent au moins ${v.minPairs} retours en stock chronométrés sur les ${v.days} derniers jours. Médiane la plus courte en premier.`,
    head: ["#", "Apple Store", "Durée médiane", "Le plus rapide", "Chronométrés", "Retours en stock"],
    slowH2: "Où gardez-vous une chance ?",
    slowLead: (v: RankView) => (v.slowest ? `En bas du tableau : ${v.slowest} a gardé un retour en stock typique ${v.slowestSec}. Plus la mise en ligne dure, plus vous avez le temps de payer.` : "Pas encore assez de données."),
    meansH2: "Qu’implique un magasin rapide pour vous ?",
    meansPoints: (v: RankView) => [
      `Une médiane de ${v.fastestSec ?? "quelques secondes"} ne laisse pas le temps de flâner : ayez la configuration dans votre panier et Apple Pay prêt.`,
      "Ajoutez à votre alerte un magasin plus lent à proximité : deux magasins doublent vos chances.",
      "La vitesse reflète la demande autour du magasin, pas la quantité de stock reçue.",
    ],
    methodH2: "Comment le classement est-il établi ?",
    methodPoints: (v: RankView) => [
      `**Durée en ligne :** d’un retour en stock confirmé à la rupture confirmée suivante, même configuration et même magasin, iPhone Duo uniquement, ${v.days} derniers jours.`,
      `**Magasins classés :** au moins ${v.minPairs} retours en stock chronométrés ; en dessous, un seul retour chanceux suffirait à décider.`,
      "**Bornes :** les durées sont des bornes hautes jusqu’à la vérification suivante (de 5 à 15 secondes d’écart).",
    ],
    faq: (v: RankView) => [
      { q: `Dans quel Apple Store ${en(v.w)} est-il le plus dur d’acheter un iPhone Duo ?`, a: v.fastest ? `${v.fastest} : ses retours en stock sont partis le plus vite, ${v.fastestSec} en médiane.` : "Pas encore assez de données pour le dire." },
      { q: "Une rupture rapide signifie-t-elle moins de téléphones ?", a: "Pas forcément. Elle signifie surtout que plus de gens attendent ce magasin." },
      { q: "À quelle fréquence le classement est-il mis à jour ?", a: "Toutes les quelques minutes, sur les 14 derniers jours." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store contre Apple Store : retours d’iPhone" : `Apple Store ${en(w)} comparés : retours d’iPhone`),
    indexH1: (w: Where) => `Deux Apple Store dans la même ville : lequel est le plus réapprovisionné ${en(w)} ?`,
    indexMeta: (w: Where) => `Des Apple Store voisins ${en(w)} côte à côte : retours en stock d’iPhone sur 14 jours, heure habituelle, durée en ligne et magasin à surveiller.`,
    indexLead: (n: string) => `${n} comparaisons, chacune entre un magasin et son plus proche voisin dans la même ville.`,
    title: (a: string, b: string) => `${a} ou ${b} : lequel a plus de retours ?`,
    h1: (a: string, b: string) => `${a} ou ${b} : lequel reçoit le plus de retours en stock d’iPhone ?`,
    meta: (v: CompareView) => `${v.a.name} contre ${v.b.name}, à ${v.distance} l’un de l’autre à ${v.city} : retours en stock d’iPhone sur ${v.days} jours, heure habituelle, durée en ligne et magasin à surveiller.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} et ${v.b.name} ont eu autant de retours en stock l’un que l’autre` : `${(v.more === "a" ? v.a : v.b).name} a eu plus de retours en stock`;
      const nums = ` (${v.a.restocks} contre ${v.b.restocks} sur les ${v.days} derniers jours)`;
      const slow = v.slower ? ` Les retours en stock ont duré plus longtemps chez ${(v.slower === "a" ? v.a : v.b).name}, ce qui vous laisse plus de temps pour payer.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Côte à côte, ${days} derniers jours`,
    rows: { restocks: "Tous les retours en stock", duo: "Retours en stock d’iPhone Duo", peak: "Heure habituelle (locale)", sell: "Durée médiane en ligne, iPhone Duo", sellN: "Retours chronométrés", last: "Dernier retour en stock" },
    none: "pas assez de données",
    moreH2: "Quel magasin reçoit le plus de retours en stock d’iPhone ?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Aucun des deux : ${v.a.restocks} chacun.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, ${v.ratio} plus de retours en stock` : ""}.`),
    hourH2: "À quelle heure chacun est-il réapprovisionné ?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} le plus souvent vers ${v.a.peak} ; ${v.b.name} vers ${v.b.peak}.` : "L’un des deux a encore trop peu de retours en stock pour dégager une heure habituelle.",
    sellH2: "Où un retour en stock dure-t-il le plus longtemps ?",
    sellLead: (v: CompareView) =>
      v.slower ? `Chez ${(v.slower === "a" ? v.a : v.b).name} : ${(v.slower === "a" ? v.a : v.b).medianSell} contre ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "Pas encore de différence nette : trop peu de ruptures chronométrées, ou les deux médianes sont à moins de 15 % l’une de l’autre.",
    pickH2: "Lequel surveiller ?",
    pickPoints: (v: CompareView) => [
      `Les deux : ${v.distance} les séparent, et un seul forfait d’alertes couvre plusieurs magasins.`,
      v.more !== "tie" ? `Si vous ne pouvez en rejoindre qu’un, ${(v.more === "a" ? v.a : v.b).name} a eu des retours en stock plus souvent.` : "Si vous ne pouvez en rejoindre qu’un, prenez le plus proche : leurs retours en stock sont à égalité.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} vous laisse plus de secondes par retour en stock.` : "Les durées en ligne ne désignent pas encore de gagnant.",
    ],
    methodH2: "D’où viennent ces chiffres ?",
    methodPoints: (v: CompareView) => [
      `Les retours en stock confirmés par RestockWire dans les deux magasins sur les ${v.days} derniers jours ; un retour compte dès qu’une seconde vérification le confirme.`,
      "L’heure habituelle n’est donnée qu’à partir de 5 retours en stock répartis sur 3 jours.",
      "Les durées en ligne sont des bornes hautes jusqu’à la vérification suivante, iPhone Duo uniquement.",
    ],
    storePages: "Pages des magasins",
    otherPairs: "Autres comparaisons",
    faq: (v: CompareView) => [
      { q: `${v.a.name} ou ${v.b.name} : lequel choisir pour retirer un iPhone Duo ?`, a: v.more === "tie" ? "Ils ont eu autant de retours en stock sur les 14 derniers jours ; prenez le plus proche ou surveillez les deux." : `${(v.more === "a" ? v.a : v.b).name} a eu des retours en stock plus souvent sur les 14 derniers jours.` },
      { q: "Puis-je surveiller les deux magasins ?", a: "Oui, avec deux alertes. Une alerte = un magasin et une configuration : deux magasins utilisent donc deux alertes de votre forfait." },
      { q: "Les deux magasins sont-ils réapprovisionnés en même temps ?", a: "Généralement non. Chaque magasin reçoit ses propres livraisons ; comparez leurs heures habituelles plus haut." },
    ],
  },

  guides: {
    watch: {
      title: "Alertes de retour d’iPhone sur Apple Watch",
      h1: "Comment recevoir les alertes de retour en stock d’iPhone sur votre Apple Watch ?",
      meta: "Les alertes de retour en stock RestockWire au poignet : app sur l’écran d’accueil, notifications activées, recopie dans l’app Watch, et les réglages qui les renvoient vers l’iPhone.",
      answer: (live: string | null) =>
        `Installez RestockWire sur l’écran d’accueil de votre iPhone, activez ses notifications et laissez la recopie active dans l’app Watch : les alertes arrivent alors sur votre Apple Watch dès que l’iPhone est verrouillé.${live ? ` Un retour en stock dure ${live} en médiane : une pression au poignet vous épargne les secondes passées à chercher votre téléphone.` : ""}`,
      sections: [
        {
          h2: "De quoi avez-vous besoin d’abord ?",
          lead: "Un iPhone sous iOS 16.4 ou ultérieur, avec RestockWire sur l’écran d’accueil et les notifications autorisées.",
          points: [
            "Ouvrez restockwire.com dans Safari, touchez Partager, puis « Sur l’écran d’accueil ».",
            "Ouvrez RestockWire depuis l’écran d’accueil, connectez-vous et touchez « Activer les notifications ».",
            "Touchez « Autoriser ». Les notifications de l’app web se comportent alors comme celles de toute app, sur l’écran verrouillé et dans le Centre de notifications.",
          ],
        },
        {
          h2: "Comment les alertes arrivent-elles sur la montre ?",
          lead: "Par recopie : Apple envoie chaque notification à un seul appareil, la montre quand l’iPhone est verrouillé ou en veille.",
          points: [
            "iPhone déverrouillé et en cours d’utilisation : l’alerte s’affiche sur l’iPhone, pas sur la montre.",
            "iPhone verrouillé ou en veille, montre déverrouillée au poignet : l’alerte va sur la montre.",
            "Montre verrouillée ou en mode Ne pas déranger : l’alerte va sur l’iPhone.",
          ],
        },
        {
          h2: "Quels réglages de la montre vérifier ?",
          lead: "Deux : la recopie pour RestockWire, et l’affichage des alertes poignet baissé.",
          points: [
            "Sur l’iPhone, ouvrez l’app Watch, touchez Notifications et regardez la liste des alertes de l’iPhone recopiées (Mirror iPhone Alerts From). Si RestockWire y figure, laissez-le activé.",
            "Les notifications s’affichent quand vous levez le poignet. Pour les voir sans le lever, activez l’affichage des notifications poignet baissé (Show Notifications on Wrist Down).",
            "Le mode Économie d’énergie coupe l’écran toujours activé : il faudra peut-être lever le poignet pour lire une alerte.",
          ],
        },
        {
          h2: "Que faire quand l’alerte vous tapote le poignet ?",
          lead: "Agissez sur l’iPhone en quelques secondes : la réservation elle-même se fait sur apple.com.",
          points: [
            "Lisez le magasin et la configuration sur la montre, puis déverrouillez l’iPhone.",
            "Touchez l’alerte sur l’iPhone pour ouvrir la page du magasin et le lien Apple.",
            "Gardez Apple Pay configuré sur apple.com pour payer en deux touches.",
          ],
        },
      ],
      faq: [
        { q: "Les alertes RestockWire fonctionnent-elles sur Apple Watch ?", a: "Oui. Les notifications d’une app web placée sur l’écran d’accueil s’affichent sur une Apple Watch jumelée comme celles de n’importe quelle app." },
        { q: "Pourquoi l’alerte est-elle arrivée sur mon iPhone et pas sur ma montre ?", a: "L’iPhone était déverrouillé, ou la montre était verrouillée ou en mode Ne pas déranger ; Apple livre alors sur l’iPhone." },
        { q: "Faut-il une app distincte sur la montre ?", a: "Non. La montre affiche les alertes que reçoit l’iPhone ; rien à installer sur la montre." },
      ],
      sources: [
        { label: "WebKit : Web Push pour les apps web sur iOS et iPadOS (en anglais)", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Assistance Apple : les notifications sur votre Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Guide d’utilisation de l’Apple Watch : gérer les notifications", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Alertes de retour d’iPhone malgré la Concentration",
      h1: "Comment laisser passer les alertes de retour en stock malgré la Concentration et le Résumé programmé ?",
      meta: "Laissez passer les alertes RestockWire pendant un mode Concentration, sortez-les du Résumé programmé, avec son et écran verrouillé. Pas à pas, iOS 16.4 et ultérieur.",
      answer: (live: string | null) =>
        `Ajoutez RestockWire aux apps autorisées de chaque mode Concentration et réglez ses notifications sur une remise immédiate : une alerte de retour en stock sonne alors même pendant une Concentration.${live ? ` Un retour en stock dure ${live} en médiane : une alerte retenue pour un résumé arrive trop tard.` : ""}`,
      sections: [
        {
          h2: "Comment autoriser RestockWire dans une Concentration ?",
          lead: "Dans Réglages, ouvrez Concentration, choisissez le mode, touchez Apps et ajoutez RestockWire aux notifications autorisées.",
          points: [
            "Apple permet à une Concentration d’autoriser ou de faire taire des apps web précises ajoutées à l’écran d’accueil.",
            "Recommencez pour chaque mode utilisé : Sommeil, Travail, Personnel et ceux que vous avez créés.",
            "Les réglages de Concentration d’une app web du même nom se synchronisent sur vos autres appareils Apple.",
          ],
        },
        {
          h2: "Comment sortir les alertes du Résumé programmé ?",
          lead: "Laissez RestockWire décoché dans la liste du résumé, ou réglez sa remise sur Immédiate.",
          points: [
            "Réglages > Notifications > Résumé programmé : la liste de A à Z décide quelles apps sont retenues pour le résumé.",
            "Ou Réglages > Notifications > RestockWire : choisissez la remise immédiate (Immediate Delivery) plutôt que le Résumé programmé.",
            "Un retour en stock retenu pour un résumé de 8 h est épuisé depuis longtemps.",
          ],
        },
        {
          h2: "Quels réglages de notification comptent le plus ?",
          lead: "Autoriser les notifications activé, Écran verrouillé et Bannières activés, Sons activés.",
          points: [
            "Le style de bannière Persistant garde l’alerte à l’écran jusqu’à ce que vous agissiez.",
            "Afficher les aperçus « Si déverrouillé » masque le magasin et la configuration sur l’écran verrouillé ; choisissez « Toujours » pour les lire d’un coup d’œil.",
            "Apple ne documente pas de niveau « urgent » (Time Sensitive) pour les notifications d’apps web : ne comptez pas dessus pour traverser une Concentration, c’est la liste des apps autorisées qui s’en charge.",
          ],
        },
        {
          h2: "Comment tester ?",
          lead: "Envoyez-vous une notification de test depuis votre compte RestockWire, une Concentration activée.",
          points: [
            "Ouvrez RestockWire depuis l’écran d’accueil, allez dans votre compte et touchez « Envoyer une notification de test ».",
            "Activez la Concentration que vous utilisez le plus et envoyez-en une autre.",
            "Si elle arrive sans son ou pas du tout, revérifiez les apps autorisées de la Concentration et le réglage de remise.",
          ],
        },
      ],
      faq: [
        { q: "Une Concentration bloque-t-elle les alertes RestockWire ?", a: "Oui, sauf si RestockWire figure parmi les apps autorisées de ce mode. Ajoutez-le une fois par mode." },
        { q: "RestockWire peut-il envoyer des notifications urgentes ?", a: "Apple ne documente pas ce niveau pour les notifications push des apps web ; RestockWire s’appuie donc sur la liste des apps autorisées de la Concentration." },
        { q: "Pourquoi mes alertes arrivent-elles groupées le matin ?", a: "Le Résumé programmé les retient. Réglez RestockWire sur la remise immédiate." },
      ],
      sources: [
        { label: "Guide d’utilisation de l’iPhone : autoriser ou faire taire les notifications pour une Concentration", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "Guide d’utilisation de l’iPhone : modifier les réglages des notifications", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit : Web Push pour les apps web sur iOS et iPadOS (en anglais)", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "Alertes de retour d’iPhone sur Android et Wear OS",
      h1: "Peut-on recevoir les alertes de retour en stock d’iPhone sur un téléphone Android ou une montre Wear OS ?",
      meta: "Vous guettez un iPhone depuis un téléphone Android ? Les alertes RestockWire fonctionnent dans Chrome sans rien installer et arrivent sur une montre Wear OS ou Galaxy jumelée.",
      answer: (live: string | null) =>
        `Oui. Ouvrez RestockWire dans Chrome sur Android, connectez-vous et autorisez les notifications quand Chrome le demande ; les alertes arrivent alors comme celles de toute app et peuvent être relayées vers une montre jumelée.${live ? ` Une mise en ligne dure ${live} en médiane : gardez des notifications bien audibles.` : ""}`,
      sections: [
        {
          h2: "Comment activer les alertes dans Chrome ?",
          lead: "Connectez-vous sur restockwire.com dans Chrome et touchez Autoriser quand le site demande à envoyer des notifications.",
          points: [
            "Rien à installer : Chrome demande l’autorisation quand un site veut vous envoyer des notifications.",
            "Si vous avez touché Bloquer auparavant, ouvrez les paramètres du site depuis la barre d’adresse et autorisez les notifications.",
            "Ajouter RestockWire à l’écran d’accueil est facultatif sur Android ; le site y gagne sa propre icône.",
          ],
        },
        {
          h2: "Les alertes arrivent-elles sur une montre Wear OS ou Galaxy ?",
          lead: "En général oui : les notifications du téléphone sont relayées par défaut vers une montre Wear OS jumelée.",
          points: [
            "C’est Chrome qui publie les alertes RestockWire : la montre les affiche donc sous Chrome.",
            "Sur une Galaxy Watch, ouvrez Galaxy Wearable > Paramètres de la montre > Notifications > Notifications des applications (App notifications) et laissez Chrome activé.",
            "Si les alertes s’arrêtent, vérifiez que l’économie de batterie ne restreint pas Chrome en arrière-plan.",
          ],
        },
        {
          h2: "Et sur un ordinateur ?",
          lead: "Chrome, Edge et Firefox sur ordinateur affichent les mêmes alertes tant que le navigateur tourne.",
          points: [
            "Connectez-vous et autorisez les notifications dans le navigateur que vous laissez ouvert le plus souvent.",
            "Chaque appareil où les notifications sont activées reçoit chaque alerte.",
            "Si aucun appareil n’a les notifications activées, RestockWire envoie l’alerte par e-mail.",
          ],
        },
      ],
      faq: [
        { q: "Faut-il un iPhone pour utiliser RestockWire ?", a: "Non. Tout téléphone ou ordinateur doté d’un navigateur compatible avec les notifications web reçoit les alertes." },
        { q: "Pourquoi ma montre affiche-t-elle l’alerte sous Chrome ?", a: "Sur Android, c’est Chrome qui livre les notifications des sites web : la montre les range donc sous Chrome." },
        { q: "Puis-je recevoir les alertes sur deux téléphones ?", a: "Oui. Connectez-vous et autorisez les notifications sur chacun ; chaque appareil reçoit chaque alerte." },
      ],
      sources: [
        { label: "Aide Google Chrome : utiliser les notifications", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers : les notifications sur Wear OS (en anglais)", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung : gérer les notifications sur une Galaxy Watch (en anglais)", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Autres guides d’alertes sur téléphone",
  },
};
