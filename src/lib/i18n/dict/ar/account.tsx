/**
 * العربية: account (صفحة «تنبيهاتي» ووحدات التوفر فيها، و/phone-alerts و/checkout/success و/pricing). تتبع الشخص لا المتجر،
 * فقد تكون متاجره في أي دولة. **الخط العريض** و[النص](الرابط) عبر <Md>. أسماء الباقات ومبالغ الدولار لا تُترجم.
 */
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import type { Dict } from "../en";
import { ALERTS, ALERTS_G, DAYS, HOURS, N, SECONDS, STORES, count, forms } from "./util";

const secs = (n: number) => count(n, SECONDS);
/** "من 8 ثوانٍ إلى 15 دقيقة". */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `من ${secs(Number(m[1]))} إلى ${N(Number(m[2]))} دقيقة` : OTHER_TRACKERS;
})();
const OTHER_STORES = forms({ one: "متجر آخر", two: "متجران آخران", few: "# متاجر أخرى", many: "# متجرًا آخر", other: "# متجر آخر" });
const RESTOCKS = forms({ one: "عودة توفر واحدة", two: "عودتا توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
const yours = (n: number) => (n === 1 ? "متجرك" : n === 2 ? "متجريك" : `متاجرك الـ${N(n)}`);
const Yours = yours;

export const account: Dict["account"] = {
  loading: "لحظة، تُحمَّل البيانات",
  meta: { title: "لوحة التنبيهات" },
  signedInAs: (email: string) => `الحساب: ${email}`,
  title: "لوحة التنبيهات",
  units: { s: "ث", min: "د", taps: "نقرات" },

  plan: {
    title: "اشتراكك الحالي",
    none: "لا توجد باقة على هذا الحساب، لذا التنبيهات متوقفة",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${N(on)} من ${count(limit, ALERTS)} قيد التشغيل`,
    renews: (date: string) => ` · الخصم التالي ${date}`,
    ends: (date: string) => ` · تتوقف في ${date}`,
  },

  sent: {
    title: "التنبيهات التي وصلت",
    last: (ago: string) => `أحدثها ${ago}`,
    none: "لم يصل أي تنبيه بعد",
    empty: "لم يخرج أي تنبيه حتى الآن.",
    channel: { push: "إشعار فوري", email: "بريد" },
    status: { sent: "وصل", failed: "لم يصل", skipped: "لم يُرسل" },
  },

  fast: {
    title: "حجز في 20 ثانية",
    sub: "كل شيء ما عدا النقرات الأربع الأخيرة، منجز مسبقًا",
    lasts: "كم يبقى عرض Duo المعتاد متاحًا",
    push: "عودة توفر مؤكدة ← إشعار على هاتفك",
    tapsLeft: "نقرات متبقية بعد وصول الإشعار",
    steps: [
      { title: "اعرف نافذتك", hint: "الساعات المعتادة لمتاجرك أدناه · كن جاهزًا قبلها بـ10 دقائق" },
      { title: "جهّز صفحة الدفع في Apple مسبقًا", hint: "السعة واللون بالتحديد ← Delivery & Pickup" },
      { title: "وافق على الشروط مبكرًا · أو اشترِ غير مقفل", hint: "غير المقفل المدفوع بالكامل لا يعرض أي خانة اختيار" },
      { title: "امنع قفل الشاشة", hint: "«قفل تلقائي» ← «أبدًا» · المسها كل 10–15 دقيقة" },
      { title: "حين يصل التنبيه: اقرأ ثم تحرّك", hint: "Pickup ← المتجر المذكور ← أول موعد ← Apple Pay" },
    ],
    guide: "الشرح الكامل في دقيقتين",
    window: "نافذة عودة التوفر لديك",
  },

  restock: {
    title: "ساعات عودة التوفر في متاجرك",
    anyIphone: "iPhone",
    and: " و",
    yours,
    Yours,
    otherStores: (n: number) => count(n, OTHER_STORES),
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${count(stores, STORES)} · آخر ${count(days, DAYS)} · بتوقيت ${zone}`,
    busiest: (y: string, then: string | null) => (then ? `ساعة الذروة في ${y} · تليها ${then}` : `ساعة الذروة في ${y}`),
    busiestArea: (stores: number, zone: string) => `ذروة المتاجر الـ${N(stores)} العاملة بتوقيت ${zone}`,
    next: (inHours: number) => `أقرب نافذة · ${inHours === 0 ? "خلال هذه الساعة" : `بعد ${count(inHours, HOURS)}`}`,
    typical: "كم يدوم العرض المعتاد",
    count: (y: string, days: number, total: number, pattern: boolean) => (total === 0 ? `لم يعد أي توفر في ${y} بعد · آخر ${count(days, DAYS)}` : `عودات التوفر في ${y} · آخر ${count(days, DAYS)}${pattern ? "" : " · لا تكفي لاستخلاص نمط"}`),
    byHour: (busiestInGreen: boolean) => `ساعة بساعة${busiestInGreen ? " · الذروة بالأخضر" : ""}`,
    byWeekday: (busiest: string | null) => `يومًا بيوم${busiest ? ` · الذروة ${busiest}` : ""}`,
    hourChart: (y: string, zone: string, items: string) => `توزيع عودات التوفر في ${y} على ساعات اليوم (توقيت ${zone}): ${items}`,
    weekdayChart: (y: string, items: string) => `توزيع عودات التوفر في ${y} على أيام الأسبوع: ${items}`,
    chartItem: (label: string, n: number, reported: number) => `${label} ${N(n)}${reported ? ` (و${N(reported)} من بلاغات متتبعات أخرى)` : ""}`,
    barTitle: (label: string, n: number, y: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label} · ${count(n, RESTOCKS)} في ${y}${area ? ` · ${N(area.n)} في المنطقة الزمنية ${area.zone}` : ""}${reported ? ` · و${N(reported)} من بلاغات متتبعات أخرى` : ""}`,
    now: "الآن",
    allZone: (stores: number, zone: string) => `المتاجر الـ${N(stores)} العاملة بتوقيت ${zone} مجتمعةً`,
    reportMarkBars: "الأعمدة ذات الحد المتقطع",
    reportMarkDots: "الدوائر المجوفة",
    sellTitle: "كم تصمد عودات التوفر في متاجرك",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${count(stores, STORES)} · مدة الرصد ${count(days, DAYS)}`,
    sellLabel: (y: string) => `ضمن ${y}`,
  },

  success: {
    metaTitle: "تنبيهاتك تعمل الآن",
    isOn: (plan: string) => `باقة ${plan} تعمل`,
    yourPlan: "اشتراكك",
    received: "تم تأكيد الدفع",
    onPlan: (limit: number) => `تتضمن باقتك ${count(limit, ALERTS_G)}.`,
    planOn: "اشتراكك يعمل الآن.",
    pending: "امنحها دقيقة: سيظهر الاشتراك في حسابك قريبًا.",
    open: "اذهب إلى تنبيهاتي",
    another: "أنشئ تنبيهًا آخر",
    saved: (n: number) => `تم حفظ ${count(n, ALERTS_G)} · يرسل Stripe الإيصال`,
    pushOn: "إشعارات الهاتف",
    pushNext: "خطوة أخيرة: التنبيهات على هاتفك",
  },

  install: {
    metaTitle: "احصل على التطبيق: تنبيهات عودة التوفر مباشرة على شاشة القفل",
    metaDescription: "ضع RestockWire على شاشتك الرئيسية، ويصلك إشعار في اللحظة التي يُعرض فيها iPhone Duo أو 18 Pro أو Pro Max للاستلام في متجر قريب منك.",
  },

  pricing: {
    metaTitle: "الأسعار: 10 تنبيهات بـ$5، و20 بـ$10، و50 بـ$20",
    metaDescription: `تنبيهات عودة توفر iPhone للاستلام من المتجر في كل متاجر Apple في الولايات المتحدة: فحص كل ${secs(SPEED.fastSec)} على المتاجر التي تختارها، وإشعار بعد نحو ${secs(SPEED.alertSec)} من تأكيد عودة التوفر. Plus بـ$5 شهريًا لعشرة تنبيهات، وPro بـ$10 لعشرين، وMax بـ$20 لخمسين. ألغِ في أي وقت.`,
    title: "الأسعار",
    lead: "**التنبيه الواحد = متجر واحد × iPhone محدد واحد.** وكل ما عدا ذلك على الموقع متاح للقراءة مجانًا.",
    chips: ["كل متاجر Apple الـ269 في الولايات المتحدة", "ألغِ في أي وقت", "بطاقة أو Link"],
    fastest: "لا يعلن أي متتبع لمخزون iPhone عن فاصل فحص أقصر",
    everyFast: `**${secs(SPEED.fastSec)}** بين فحص وآخر لمتاجرك · الفواصل التي تعلنها المتتبعات الأخرى: ${others}`,
    sellsOut: (band: string) => `**${band}**: المدة التي يبقى فيها توفر iPhone Duo المعتاد معروضًا، وبعضه يختفي خلال 20–30 ثانية`,
    band: (range: string) => `${range} ثانية`,
    aboutMinute: "نحو دقيقة",
    sameSpeed: "سرعة واحدة لكل الباقات",
    rechecked: "بين فحص وآخر لمتاجرك",
    toPhone: "من تأكيد عودة التوفر إلى هاتفك",
    listing: "عرض Duo المعتاد، من ظهوره حتى نفاده",
    note: { plus: "10 متاجر لجهاز iPhone واحد", pro: "10 متاجر لكلٍّ من جهازي iPhone", max: "10 متاجر لكلٍّ من 5 أجهزة iPhone" },
    month: "/ شهريًا",
    alerts: (n: number) => count(n, ALERTS),
    perks: [
      `فحص كل ${secs(SPEED.fastSec)} لمتاجرك، وكل ${secs(SPEED.checkSec)} للمتاجر الـ269 كلها`,
      `عودة توفر مؤكدة على هاتفك خلال ${secs(SPEED.alertSec)} تقريبًا`,
    ],
    cancel: "الإلغاء متاح متى شئت",
    get: (plan: string) => `اختر ${plan}`,
    billing: "الفوترة عبر Stripe · بطاقة أو Link · تغيير الباقة يُحتسب بالتناسب",
    refund: "غيّرت رأيك؟ [يمكنك استرداد المبلغ كاملًا خلال 7 أيام](/refunds) ما دام لم يصلك أي تنبيه بعودة التوفر",
  },
};
