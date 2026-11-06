/**
 * العربية: wire — وحدات سجل عودة التوفر الأربع (RestockHeatmap وRestockStreak وSellOutRanking وRestockLeaderboard).
 * `label` يحمل حرف الجر ويصل مترجمًا («في دبي»، «هنا»، «في الإمارات»)؛ `what` اسم منتج لا يُترجم. المدد والساعات
 * والأيام والنسب تصل منسّقة؛ الأعداد تصل خامًا. الاسم الذي يصف المنطقة (`noun`) يصل بالإنجليزية ("state" / "emirate"…).
 */
import type { Dict } from "../en";
import { DAYS, HOURS, N, NOUNS, STORES_G, count, forms } from "./util";

const RESTOCKS = forms({ one: "عودة توفر واحدة", two: "عودتا توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
/** After a preposition or «من» ("من 41 عودة توفر"). */
const RESTOCKS_G = forms({ one: "عودة توفر واحدة", two: "عودتي توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
const r = (v: number) => count(v, RESTOCKS);
const rg = (v: number) => count(v, RESTOCKS_G);
const d = (v: number) => count(v, DAYS);
/** The region noun, from its English key. */
const nounAr = (noun: string) => NOUNS[noun]?.one ?? NOUNS.area.one;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what, label) => `متى يعود ${what} إلى التوفر ${label}؟ اليوم × الساعة`,
    unknown: "تعذّرت قراءة شبكة الأيام والساعات الآن؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    none: (label, days) => `لا عودة توفر مؤكدة ${label} في آخر ${d(days)} حتى الآن، وتبدأ الشبكة بالامتلاء من أول عودة.`,
    thin: (k, label, days, activeDays, min, minDays) =>
      `${r(k)} ${label} على مدى ${d(activeDays)} خلال آخر ${d(days)}: البيانات لا تكفي بعد للحديث عن نمط (ينتظر RestockWire ${rg(min)} على مدى ${d(minDays)}).`,
    pattern: (label, weekday, window, share, k, days) => (
      <>معظم عودات التوفر {label} تقع أيام <b className="text-ink">{weekday}</b>، بين <b className="text-ink">{window}</b> بالتوقيت المحلي ({share} من {N(k)} في آخر {d(days)}).</>
    ),
    patternHours: (label, window, share, k, spanDays) => (
      <>معظم عودات التوفر {label} تقع بين <b className="text-ink">{window}</b> بالتوقيت المحلي ({share} من {N(k)})؛ بيانات {d(spanDays)} لا تكفي بعد لتحديد يوم من الأسبوع.</>
    ),
    caption: (what, label, days) => `عودات توفر ${what} المؤكدة ${label} حسب يوم الأسبوع والساعة المحلية، آخر ${d(days)}`,
    cell: (weekday, hours, k) => `${weekday} ${hours}: ${r(k)}`,
    busiest: (weekday, hours, k) => `الأكثر نشاطًا · ${weekday} ${hours} · ${r(k)}`,
    legendFewer: "أقل",
    legendMore: "أكثر",
    localTime: "التوقيت المحلي لكل متجر",
    measuredTitle: "كيف نقيس هذا",
    measured: (min, minDays, span) =>
      `تعدّ كل خانة عودات التوفر التي أكدها RestockWire (فحصان متطابقان؛ وأول رصد لأي متجر لا يُحتسب أبدًا) ووقعت في تلك الساعة المحلية من ذلك اليوم خلال الفترة، بحسب المنطقة الزمنية للمتجر نفسه. لا نعلن نمطًا إلا بعد ${rg(min)} على مدى ${d(minDays)} مختلفة، ولا نسمّي يومًا من الأسبوع إلا حين تغطي البيانات ${d(span)}: عشر عودات في دفعة واحدة حدث واحد، لا عادة.`,
  },

  streak: {
    title: (what, label) => `فترات توفر ${what} وفترات انقطاعه ${label}`,
    unknown: "تعذّرت قراءة أرقام الفترات الآن؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    none: (label, days) => `لا عودة توفر مؤكدة ${label} في آخر ${d(days)}: فترة الهدوء الحالية تغطي الفترة كلها.`,
    lead: (o) => (
      <>آخر عودة توفر مؤكدة {o.label}: <b className="text-ink">{o.since}</b>{o.longest && <>؛ وأطول فترة هدوء خلال {d(o.days)} كانت <b className="text-ink">{o.longest}</b></>}{o.trend && <>؛ و<b className="text-ink">{r(o.thisWeek)}</b> هذا الأسبوع مقابل {N(o.lastWeek)} الأسبوع الماضي ({o.trend})</>}.</>
    ),
    today: "اليوم",
    daysAgo: (k) => `منذ ${count(k, DAYS)}`,
    hoursAgo: (k) => `منذ ${count(k, HOURS)}`,
    tileSince: "منذ آخر عودة توفر مؤكدة",
    tileSinceNone: (days) => `لا عودة توفر منذ ${d(days)}`,
    tileLongest: (days) => `أطول فترة هدوء بين عودتين للتوفر · ${N(days)} يوم`,
    tileWeek: (prev) => `عودات التوفر في آخر 7 أيام · ${N(prev)} في الأسبوع الذي قبله`,
    tileMedian: "الفاصل المعتاد بين موجات عودة التوفر",
    up: "↑ أكثر من الأسبوع الماضي",
    down: "↓ أقل من الأسبوع الماضي",
    flat: "→ مثل الأسبوع الماضي",
    none2: "–",
    measuredTitle: "كيف نقيس هذا",
    measured: "الموجة هي كل عودات التوفر المؤكدة خلال نصف الساعة نفسها في المتاجر المحسوبة هنا، فثمانية خيارات تصل معًا موجة واحدة لا ثماني؛ والفواصل تُقاس بين الموجات. «هذا الأسبوع» هو آخر 7 أيام، و«الأسبوع الماضي» الأيام السبعة التي قبلها. «مؤكدة» تعني أن فحصين من فحوص RestockWire تطابقا (كل متجر كل 15 ثانية، والمتاجر التي عليها تنبيهات كل 5 ثوانٍ)؛ وأول رصد لأي متجر لا يُحتسب أبدًا.",
  },

  ranking: {
    title: (what, label) => `أي المتاجر ينفد فيها ${what} أسرع ${label}؟`,
    unknown: "تعذّرت قراءة ترتيب سرعة النفاد الآن؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    thin: (label, k, min, days) =>
      `لا تتوفر بعد حالات نفاد موقوتة كافية ${label}: ${count(k, STORES_G)} فيها ${rg(min)} أو أكثر نفدت في آخر ${d(days)}، والترتيب يحتاج إلى متجرين.`,
    lead: (o) => (
      <>الأسرع {o.label}: <b className="text-ink">{o.fastest}</b>، نفد نصف عودات التوفر فيه خلال <b className="text-ink">{o.fastSec}</b>؛ والأبطأ: <b className="text-ink">{o.slowest}</b>، {o.slowSec} (آخر {d(o.days)}).</>
    ),
    caption: (what, label, days, min) => `عودات توفر ${what} ${label} مرتبة حسب سرعة نفادها، آخر ${d(days)}؛ المتاجر التي سجلت ${N(min)} حالات نفاد موقوتة أو أكثر`,
    thRank: "#",
    thStore: "المتجر",
    thMedian: "نفد نصفها خلال",
    thFastest: "الأسرع",
    thPairs: "عودات توفر نفدت",
    footnote: (ranked, total) => `${N(ranked)} من ${count(total, STORES_G)} في الترتيب`,
    measuredTitle: "كيف نقيس هذا",
    measured: (min) =>
      `«نفد نصفها خلال» هو الوقت الوسيط بين فحص RestockWire الذي رأى عودة التوفر أولًا والفحص الذي رأى نفادها أولًا، وهو حد أعلى: المتاجر التي عليها تنبيهات تُفحص كل 5 ثوانٍ، وكل متجر آخر كل 15 ثانية. لا نرتّب إلا المتاجر التي سجلت ${rg(min)} أو أكثر نفدت خلال الفترة؛ وقد يفوتنا عرض أقصر من فاصل الفحص، لذا تبدو المتاجر السريعة جدًا أبطأ قليلًا مما هي عليه.`,
  },

  leaderboard: {
    title: (what, label, days) => `أي المتاجر عاد إليها ${what} أكثر من غيرها ${label}؟ آخر ${d(days)}`,
    unknown: "تعذّرت قراءة لوحة الصدارة الآن؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    none: (what, label, days) => `لا عودة توفر مؤكدة لـ${what} ${label} في آخر ${d(days)}.`,
    lead: (o) => (
      <><b className="text-ink">{o.store}</b> تصدّر {o.label} بـ<b className="text-ink">{N(o.n)}</b> من {rg(o.total)} مؤكدة (<b className="text-ink">{o.share}</b>) في آخر {d(o.days)}.</>
    ),
    caption: (what, label, days) => `متاجر Apple ${label} حسب عودات توفر ${what} المؤكدة، آخر ${d(days)}`,
    thRank: "#",
    thStore: "المتجر",
    thRestocks: "عودات التوفر",
    thShare: "الحصة",
    footnote: (shown, stores, total) => `${N(shown)} من ${count(stores, STORES_G)} شهدت عودة توفر · ${rg(total)} في المجموع`,
    regionsTitle: (noun) => `حسب ال${nounAr(noun)}`,
    regionsCaption: (what, label, days, noun) => `عودات توفر ${what} المؤكدة ${label} حسب ال${nounAr(noun)}، آخر ${d(days)}`,
    thRegion: (noun) => `ال${nounAr(noun)}`,
    thStores: "المتاجر",
    measuredTitle: "كيف نقيس هذا",
    measured: (what) =>
      `عودات توفر ${what} المؤكدة في آخر 7 أيام، من فحوص RestockWire نفسه لخدمة الاستلام من المتجر على apple.com (كل متجر كل 15 ثانية، والمتاجر التي عليها تنبيهات كل 5 ثوانٍ؛ يجب أن يتطابق فحصان؛ وأول رصد لأي متجر لا يُحتسب أبدًا). الحصة محسوبة من كل عودات التوفر المؤكدة في المكان نفسه والفترة نفسها.`,
  },
};
