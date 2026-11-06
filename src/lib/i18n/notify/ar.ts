/**
 * نصوص الإشعارات بالعربية (الإشعار الفوري، بريد التنبيه، بريد «توقفت الإشعارات»، أسماء الأجهزة، سطر صفحة الدفع في Stripe).
 * يرسلها الـpoller أيضًا، لذا لا استيراد إلا للأنواع. الأرقام غربية. (Stripe لا يدعم العربية، فتبقى صفحة الدفع بالإنجليزية.)
 */
import type { NotifyText } from "./en";

/** Arabic counting: one / two / 3–10 / 11–99 / 100+. */
const ar = (n: number, one: string, two: string, few: string, many: string): string => {
  const r = n % 100;
  return n === 1 ? one : n === 2 ? two : r >= 3 && r <= 10 ? `${n} ${few}` : r >= 11 ? `${n} ${many}` : `${n} ${one}`;
};
const secs = (n: number) => ar(n, "ثانية", "ثانيتين", "ثوانٍ", "ثانية");
const alerts = (n: number) => ar(n, "تنبيه واحد", "تنبيهان", "تنبيهات", "تنبيهًا");

export const notifyAr: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. افتح apple.com لتحجزه.`,
  testTitle: "اختبار RestockWire: الإشعارات تعمل",
  testBody: (time: string, device: string) => `أُرسل ${time} إلى ${device}. تنبيه عودة التوفر الحقيقي يصل بهذه الطريقة تمامًا، بعد ثوانٍ من تأكيده.`,
  device: {
    iphoneApp: "iPhone (تطبيق الشاشة الرئيسية)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (تطبيق مثبّت)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `الكمبيوتر${browser ? ` (${browser})` : ""}`,
    other: "هذا الجهاز",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` +${more} أخرى` : ""}`,
    intro: "معروض للاستلام من المتجر في هذه اللحظة:",
    reserve: "احجز",
    store: "المتجر",
    tip: "عروض الاستلام نادرًا ما تدوم طويلًا. في تطبيق Apple Store أو على apple.com، اختر «Pick up» (الاستلام) ثم هذا المتجر.",
    manage: (url: string) => `غيّر هذا التنبيه أو أوقفه مؤقتًا: ${url}`,
    htmlTitle: "معروض للاستلام الآن",
    htmlReserve: "احجز على apple.com",
    htmlStorePage: "افتح صفحة المتجر ←",
    htmlTip: "عروض الاستلام نادرًا ما تدوم طويلًا. في تطبيق Apple Store أو على apple.com، اختر <b>Pick up</b> (الاستلام) ثم هذا المتجر.",
    htmlManage: "غيّر هذا التنبيه أو أوقفه مؤقتًا",
    cancel: (url: string) => `حصلت على iPhone الآن؟ ألغِ في أي وقت: ${url}`,
    htmlGotIt: "حصلت على iPhone الآن؟",
    htmlCancel: "ألغِ في أي وقت",
    nudge: (url: string) => `البريد هو الطريق الاحتياطي: لا يوجد في حسابك هاتف مفعّل عليه الإشعارات. الإشعار يصل بعد نحو 3 ثوانٍ من تأكيد عودة التوفر. للتحويل، افتح RestockWire من الشاشة الرئيسية واضغط «تفعيل الإشعارات»: ${url}`,
    htmlNudge: (url: string) => `البريد هو الطريق الاحتياطي: لا يوجد في حسابك هاتف مفعّل عليه الإشعارات. <b>الإشعار يصل بعد نحو 3 ثوانٍ</b> من تأكيد عودة التوفر. افتح RestockWire من الشاشة الرئيسية واضغط <b>تفعيل الإشعارات</b>. <a href="${url}" style="color:#0a7f3f">خطوات الإعداد ←</a>`,
  },
  nudge: {
    subject: "يمكن أن تصل تنبيهات RestockWire إلى هاتفك خلال 3 ثوانٍ تقريبًا",
    intro: "نحو 3 ثوانٍ: هذا هو الوقت الذي يحتاجه الإشعار ليصل إلى الهاتف بعد أن يؤكد RestockWire عودة التوفر. عودة توفر iPhone Duo المعتادة تنفد خلال دقيقة تقريبًا، والبريد أبطأ. تصلك تنبيهاتك الآن بالبريد لأنه لا يوجد في حسابك هاتف مفعّل عليه الإشعارات.",
    howTitle: "التحويل يستغرق أقل من دقيقة:",
    stepsIos: ["على iPhone: افتح restockwire.com في Safari، واضغط «مشاركة» ثم «إضافة إلى الشاشة الرئيسية».", "شغّل RestockWire من الشاشة الرئيسية، لا من Safari، وسجّل الدخول.", "في صفحة الحساب، اضغط «تفعيل الإشعارات» ثم «سماح»."],
    stepsOther: "على Android أو الكمبيوتر: افتح restockwire.com/account واضغط «تفعيل الإشعارات».",
    after: "يستمر البريد إلى أن يُفعَّل جهاز. بعدها تصل التنبيهات كإشعارات ويتوقف البريد.",
    cta: (url: string) => `خطوات الإعداد بالصور: ${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${alerts(limit)}. تُفحص متاجرك كل ${secs(fastSec)} وكل متجر آخر كل ${secs(checkSec)}؛ وتصل عودة التوفر المؤكدة إلى هاتفك خلال ${secs(alertSec)} تقريبًا. فوترة شهرية، ألغِ في أي وقت.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "هاتف Android", desktop: "الكمبيوتر", other: "الجهاز" },
    subject: (device: string) => `لم يعد ${device} يستقبل إشعارات RestockWire`,
    gone: (device: string) => `تفيد خدمة الإشعارات بأن ${device} ألغى اشتراكه في RestockWire، لذا لم تعد الإشعارات تصل إليه.`,
    byEmail: "إلى أن تعود الإشعارات، تصلك تنبيهات عودة التوفر بالبريد الإلكتروني.",
    reopenIos: "لإصلاح ذلك، شغّل RestockWire من الشاشة الرئيسية، لا من Safari، واضغط «تفعيل الإشعارات» في صفحة الحساب.",
    reopenOther: "لإصلاح ذلك، افتح RestockWire، وانتقل إلى الحساب واضغط «تفعيل الإشعارات».",
    causes: "يحدث هذا عادةً حين يُحذف التطبيق من الشاشة الرئيسية، أو تُوقف الإشعارات من الإعدادات، أو يُستعاد الهاتف من نسخة احتياطية.",
  },
};
