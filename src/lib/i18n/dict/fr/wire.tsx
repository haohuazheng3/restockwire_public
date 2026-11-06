/**
 * Chaînes françaises : wire — les quatre modules du journal des retours en stock (RestockHeatmap, RestockStreak,
 * SellOutRanking, RestockLeaderboard). `label` porte déjà sa préposition (« à Paris », « ici », « en France ») ;
 * `what` est un nom de produit, jamais traduit. Durées, heures, jours et pourcentages arrivent déjà formatés.
 */
import type { Dict } from "../en";
import { num, plural } from "@/lib/i18n/format";
import { NOUN_FORMS, cap } from "./util";

const n = (v: number) => num("fr", v);
const restocks = (v: number) => plural("fr", v, { one: "# retour en stock", other: "# retours en stock" });
const days_ = (v: number) => plural("fr", v, { one: "# jour", other: "# jours" });
const stores_ = (v: number) => plural("fr", v, { one: "# magasin", other: "# magasins" });
/** The region noun arrives in English ("province", "area", "state"). */
const nounFr = (noun: string) => NOUN_FORMS[noun]?.one ?? noun;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what, label) => `Quand l’${what} revient-il en stock ${label} ? Jour × heure`,
    unknown: "La grille jour par heure n’a pas pu être lue à l’instant ; le stock en direct et le journal des retours en stock de cette page ne sont pas concernés.",
    none: (label, days) => `Aucun retour en stock confirmé ${label} sur les ${days} derniers jours pour l’instant ; la grille se remplit dès le premier.`,
    thin: (k, label, days, activeDays, min, minDays) =>
      `${restocks(k)} ${label} sur ${days_(activeDays)} au cours des ${days} derniers : pas encore assez de données pour parler de tendance (RestockWire attend ${n(min)} retours en stock sur ${n(minDays)} jours).`,
    pattern: (label, weekday, window, share, k, days) => (
      <>La plupart des retours en stock {label} tombent le <b className="text-ink">{weekday}</b>, entre <b className="text-ink">{window}</b>, heure locale ({share} des {n(k)} des {days} derniers jours).</>
    ),
    patternHours: (label, window, share, k, spanDays) => (
      <>La plupart des retours en stock {label} tombent entre <b className="text-ink">{window}</b>, heure locale ({share} sur {n(k)}) ; {days_(spanDays)} de données, c’est encore trop peu pour désigner un jour de la semaine.</>
    ),
    caption: (what, label, days) => `Retours en stock confirmés de l’${what} ${label} par jour de la semaine et heure locale, ${days} derniers jours`,
    cell: (weekday, hours, k) => `${weekday} ${hours} : ${restocks(k)}`,
    busiest: (weekday, hours, k) => `le plus chargé · ${weekday} ${hours} · ${restocks(k)}`,
    legendFewer: "moins",
    legendMore: "plus",
    localTime: "l’heure locale de chaque magasin",
    measuredTitle: "Comment c’est mesuré",
    measured: (min, minDays, span) =>
      `Chaque case compte les retours en stock confirmés par RestockWire (deux vérifications concordantes ; la première observation d’un magasin ne compte jamais) tombés à cette heure locale de ce jour de la semaine sur la période, dans le fuseau horaire du magasin. Une tendance n’est annoncée qu’à partir de ${n(min)} retours en stock sur ${n(minDays)} jours différents, un jour de la semaine seulement quand les données couvrent ${n(span)} jours : dix retours en stock d’un seul coup font un événement, pas une habitude.`,
  },

  streak: {
    title: (what, label) => `Séries et périodes creuses des retours en stock de l’${what} ${label}`,
    unknown: "Les chiffres des séries n’ont pas pu être lus à l’instant ; le stock en direct et le journal des retours en stock de cette page ne sont pas concernés.",
    none: (label, days) => `Aucun retour en stock confirmé ${label} sur les ${days} derniers jours : la période creuse actuelle couvre toute la fenêtre.`,
    lead: (o) => (
      <>Dernier retour en stock confirmé {o.label} : <b className="text-ink">{o.since}</b>{o.longest && <> ; la plus longue période creuse en {o.days} jours a duré <b className="text-ink">{o.longest}</b></>}{o.trend && <> ; <b className="text-ink">{restocks(o.thisWeek)}</b> cette semaine contre {n(o.lastWeek)} la semaine dernière ({o.trend})</>}.</>
    ),
    today: "aujourd’hui",
    daysAgo: (k) => `il y a ${days_(k)}`,
    hoursAgo: (k) => `il y a ${plural("fr", k, { one: "# heure", other: "# heures" })}`,
    tileSince: "depuis le dernier retour en stock confirmé",
    tileSinceNone: (days) => `aucun retour en stock en ${days} jours`,
    tileLongest: (days) => `plus longue période creuse entre deux retours en stock · ${days} j`,
    tileWeek: (prev) => `retours en stock sur les 7 derniers jours · ${n(prev)} la semaine d’avant`,
    tileMedian: "écart typique entre deux vagues de retours en stock",
    up: "↑ en hausse sur la semaine dernière",
    down: "↓ en baisse sur la semaine dernière",
    flat: "→ comme la semaine dernière",
    none2: "–",
    measuredTitle: "Comment c’est mesuré",
    measured: "Une vague regroupe tous les retours en stock confirmés dans la même demi-heure dans les magasins comptés ici : huit configurations arrivées ensemble font une vague, pas huit ; les écarts se mesurent entre vagues. « Cette semaine », ce sont les 7 derniers jours, « la semaine dernière » les 7 d’avant. Confirmé signifie que deux vérifications de RestockWire concordent (chaque magasin toutes les 15 secondes, les magasins avec alertes toutes les 5 secondes) ; la première observation d’un magasin ne compte jamais.",
  },

  ranking: {
    title: (what, label) => `Quels magasins épuisent l’${what} le plus vite ${label} ?`,
    unknown: "Le classement des ruptures n’a pas pu être lu à l’instant ; le stock en direct et le journal des retours en stock de cette page ne sont pas concernés.",
    thin: (label, k, min, days) =>
      `Pas encore assez de ruptures chronométrées ${label} : ${stores_(k)} avec au moins ${n(min)} retours en stock épuisés sur les ${days} derniers jours, et il en faut deux pour un classement.`,
    lead: (o) => (
      <>Le plus rapide {o.label} : <b className="text-ink">{o.fastest}</b>, la moitié de ses retours en stock partis en <b className="text-ink">{o.fastSec}</b> ; le plus lent : <b className="text-ink">{o.slowest}</b>, {o.slowSec} ({o.days} derniers jours).</>
    ),
    caption: (what, label, days, min) => `Retours en stock de l’${what} ${label} classés par vitesse d’épuisement, ${days} derniers jours ; magasins avec au moins ${n(min)} ruptures chronométrées`,
    thRank: "#",
    thStore: "Magasin",
    thMedian: "Moitié partie en",
    thFastest: "Le plus rapide",
    thPairs: "Retours en stock épuisés",
    footnote: (ranked, total) => `${n(ranked)} ${total > 1 ? "magasins" : "magasin"} sur ${n(total)} ${ranked > 1 ? "classés" : "classé"}`,
    measuredTitle: "Comment c’est mesuré",
    measured: (min) =>
      `« Moitié partie en » est le temps médian entre la vérification de RestockWire qui a vu un retour en stock en premier et celle qui l’a vu disparaître : une borne haute, car les magasins avec alertes sont vérifiés toutes les 5 secondes, tous les autres toutes les 15 secondes. Seuls les magasins avec au moins ${n(min)} retours en stock épuisés sur la période sont classés ; une offre plus courte qu’une vérification peut passer inaperçue, si bien que les magasins très rapides paraissent un peu plus lents qu’ils ne le sont.`,
  },

  leaderboard: {
    title: (what, label, days) => `Quels magasins ont reçu l’${what} le plus souvent ${label} ? ${days} derniers jours`,
    unknown: "Le classement n’a pas pu être lu à l’instant ; le stock en direct et le journal des retours en stock de cette page ne sont pas concernés.",
    none: (what, label, days) => `Aucun retour en stock confirmé de l’${what} ${label} sur les ${days} derniers jours.`,
    lead: (o) => (
      <><b className="text-ink">{o.store}</b> arrive en tête {o.label} avec <b className="text-ink">{n(o.n)}</b> des {restocks(o.total)} confirmés (<b className="text-ink">{o.share}</b>) sur les {o.days} derniers jours.</>
    ),
    caption: (what, label, days) => `Apple Store ${label} par retours en stock confirmés de l’${what}, ${days} derniers jours`,
    thRank: "#",
    thStore: "Magasin",
    thRestocks: "Retours en stock",
    thShare: "Part",
    footnote: (shown, stores, total) => `${n(shown)} ${stores > 1 ? "magasins" : "magasin"} sur ${n(stores)} avec un retour en stock · ${restocks(total)} au total`,
    regionsTitle: (noun) => `Par ${nounFr(noun)}`,
    regionsCaption: (what, label, days, noun) => `Retours en stock confirmés de l’${what} ${label} par ${nounFr(noun)}, ${days} derniers jours`,
    thRegion: (noun) => cap(nounFr(noun)),
    thStores: "Magasins",
    measuredTitle: "Comment c’est mesuré",
    measured: (what) =>
      `Retours en stock confirmés de l’${what} sur les 7 derniers jours, d’après les propres vérifications de RestockWire du retrait en magasin sur apple.com (chaque magasin toutes les 15 secondes, les magasins avec alertes toutes les 5 secondes ; deux vérifications doivent concorder ; la première observation d’un magasin ne compte jamais). La part se calcule sur l’ensemble des retours en stock confirmés au même endroit et sur la même période.`,
  },
};
