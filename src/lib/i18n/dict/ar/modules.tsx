/**
 * العربية: modules — وحدات عودة التوفر والمتاجر والمخزون (src/components/{restocks,stores,stock}).
 * `label` عبارة مكان تحمل حرف الجر («في دبي»، «في Apple دبي مول»، «هنا»). الأرقام تصل خامًا فتُنسَّق هنا؛ المدد والأوقات
 * والتواريخ تصل منسّقة. فترات الفحص 15 ثانية (كل متجر) و5 ثوانٍ (المتاجر التي عليها تنبيهات) فقط.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CONFIGS, DAYS, SELLOUTS, STORES_G, N, count, forms, theStoresG } from "./util";

const CHECK = "15 ثانية لكل متجر · 5 ثوانٍ لمتاجر التنبيهات";
const RESTOCKS = forms({ one: "عودة توفر واحدة", two: "عودتا توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
const RESTOCKS_G = forms({ one: "عودة توفر واحدة", two: "عودتي توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
const SOLD_RESTOCKS = forms({ one: "عودة توفر واحدة نفدت", two: "عودتي توفر نفدتا", few: "# عودات توفر نفدت", many: "# عودةً للتوفر نفدت", other: "# عودة توفر نفدت" });
const d = (n: number) => count(n, DAYS);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `لا شيء يُرسم ${label} بعد: لا عودة توفر ولا نفاد في آخر ${d(days)}. أول حالة ترسم أول عمود.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${count(restocks, RESTOCKS)} و${count(soldouts, SELLOUTS)} ${label} في آخر ${d(days)}، موزّعة على ${d(activeDays)}.`,
    busiest: (day: string, restocks: number) => <> وأكثر الأيام نشاطًا، <b className="text-ink">{day}</b>، حمل {count(restocks, RESTOCKS_G)}.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: ${count(restocks, RESTOCKS)} و${count(soldouts, SELLOUTS)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day}: ${count(restocks, RESTOCKS)}، ${count(soldouts, SELLOUTS)}`,
    legendRestocks: "عودات التوفر",
    legendSoldouts: "حالات النفاد",
  },

  last24: {
    title: (label: string) => `عودات توفر iPhone Duo ${label} في آخر 24 ساعة`,
    asOf: (when: string) => `قُرئ في ${when}`,
    localTime: (when: string) => `${when} (توقيت المتجر)`,
    anAppleStore: "أحد متاجر Apple",
    unknown: "عدد آخر 24 ساعة غير متاح في هذه اللحظة؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    none: (label: string, asOf: string) => <><b className="text-ink">صفر عودة توفر لـiPhone Duo {label} في آخر 24 ساعة</b> (قُرئ في {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${count(o.restocks, RESTOCKS)} لـiPhone Duo`} {o.one ? o.label : `في ${N(o.withStores)} من ${theStoresG(o.allStores)} ${o.label}`}</b> في آخر 24 ساعة؛ وأحدثها <b className="text-ink">{o.config}</b>{o.store != null && <> في {o.store}</>}، {o.when} بالتوقيت المحلي.</>
    ),
    tileRestocks: "عودات توفر مؤكدة في 24 ساعة",
    tileConfigsBack: "خيارات عادت للظهور",
    tileStores: (configs: number, allConfigs: number) => `متاجر عاد إليها التوفر${configs ? ` · ${N(configs)} من ${count(allConfigs, CONFIGS)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>آخرها · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>السابقة لها · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "لا شيء أقدم في السجل",
    caption: (label: string, asOf: string) => `كل خيارات iPhone Duo ${label}: عودات التوفر المؤكدة في آخر 24 ساعة، قُرئت في ${asOf}`,
    thConfig: "السعة واللون",
    thRestocks: "عودات التوفر",
    thStores: "عدد المتاجر",
    thLast: "أحدث عودة توفر (بالتوقيت المحلي)",
    thNow: "معروض الآن",
    ofStores: (n: number, total: number) => `${N(n)}/${N(total)}`,
    noneIn24: "لا شيء في 24 ساعة",
    yes: "معروض",
    no: "غير معروض",
    countedTitle: "ما الذي يُعدّ عودة توفر هنا",
    counted: "هذه قراءات RestockWire نفسه لخدمة الاستلام من المتجر على apple.com: كل متجر كل 15 ثانية، والمتاجر التي عليها تنبيهات كل 5 ثوانٍ. لا تدخل عودة التوفر السجل إلا بعد أن يتطابق فحصان؛ وأول قراءة لأي متجر لا تُحتسب؛ ولا نخلط بها أي شيء تنشره المتتبعات الأخرى.",
    alert: (label: string | null) => `فعّل التنبيهات${label != null ? ` ${label}` : ""}: تصلك العودة التالية خلال ثوانٍ`,
  },

  clock: {
    none: (label: string, days: number) => `لا عودة توفر ${label} في آخر ${d(days)} حتى الآن.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${count(total, RESTOCKS)} ${label} في آخر ${d(days)}${dates != null ? ` (على مدى ${d(dates)})` : ""}: لا يكفي ذلك بعد لتحديد ساعة معتادة.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{count(total, RESTOCKS)} {label} في آخر {d(days)}. الساعة المعتادة <b className="text-ink">{hour}</b> بالتوقيت المحلي{day ? <>؛ و<b className="text-ink">{day}</b> يحمل أكثرها</> : null}.</>
    ),
    byHour: (zone: string) => `ساعات اليوم · ${zone}`,
    byWeekday: "أيام الأسبوع",
    barReported: (n: number) => ` (و${N(n)} من بلاغات متتبعات أخرى)`,
    barReportedTitle: (bar: string, n: number) => `${bar} · و${N(n)} من بلاغات متتبعات أخرى`,
    legendOurs: "أكدها RestockWire",
  },

  feed: {
    empty: "السجل فارغ حتى الآن.",
    available: "معروض الآن",
    soldOut: "انتهى",
    soldOutAt: (time: ReactNode) => <>انتهى {time}</>,
    since: (time: ReactNode) => <>معروض منذ {time}</>,
    restockedAt: (time: ReactNode) => <>عاد {time}</>,
    mapAria: (store: string) => `اعثر على ${store} في الخريطة`,
    map: "على الخريطة",
    buyAria: (model: string, config: string) => `اطلب ${model} ${config} من apple.com`,
    buy: "اطلب من apple.com",
  },

  byConfig: {
    empty: (label: string, days: number) => `لا ترتيب بعد: لم يعد أي شيء إلى التوفر ${label} في آخر ${d(days)}.`,
    intro: (label: string, days: number) => `الخيارات التي عادت ${label} في آخر ${d(days)}، مرتبة حسب عدد المرات.`,
    times: (n: number) => `${N(n)}×`,
    alert: "فعّل التنبيهات",
  },

  sellout: {
    typical: (label: string, band: string) => `عودة توفر iPhone Duo المعتادة ${label} دامت نحو ${band} قبل أن تنفد.`,
    half: (label: string, duration: string) => `نصف عودات التوفر ${label} اختفى خلال ${duration}.`,
    none: (label: string, days: number) => `لا عودة توفر انتهت بالنفاد ${label} في آخر ${d(days)}.`,
    whatDuo: "iPhone Duo",
    whatAll: "أجهزة iPhone جميعها",
    tileHalf: (what: string) => <>نفد نصفها خلال · {what}</>,
    tileWithin30: "نفدت خلال 30 ث",
    tileWithin60: "نفدت خلال دقيقة",
    tileFastest: (n: number, days: number) => <>الأسرع · {count(n, SOLD_RESTOCKS)}، {N(days)} ي</>,
    caption: (days: number) => `لكل iPhone، آخر ${d(days)}`,
    thIphone: "iPhone",
    thSoldOut: "حالات النفاد",
    thHalf: "نفد نصفها خلال",
    thWithin30: "≤ 30 ث",
    thWithin60: "≤ 60 ث",
    thFastest: "أسرع نفاد",
    each: "صف لكل عودة توفر",
    barNote: (full: string) => `طول الشريط = ثواني العرض · ${full} يملأ الصف`,
    stillListed: (duration: string) => `لم ينفد بعد · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "كيف نقيس هذه الأوقات",
    measured: (estimated: boolean) =>
      `الصف الذي يقول «نفد خلال 45–60 ث» يعني أن فحصنا بعد 45 ثانية من أول رصد وجد الخيار لا يزال معروضًا، وأن الفحص بعد 60 ثانية وجده قد اختفى. عرض كل نطاق هو الفاصل بين الفحوص: 5 ثوانٍ في المتاجر التي عليها تنبيهات، و15 ثانية في كل مكان آخر${estimated ? "؛ والصفوف المعلّمة بـ≈ تعود إلى ما قبل حفظنا للفحص الأخير، فحدّها دورة الـ15 ثانية بدلًا من ذلك" : ""}. وقد يظهر عرض أقصر من فاصل واحد ويختفي بين فحصين، لذا فالنسبة الحقيقية لما ينفد خلال 30 ثانية أعلى مما يُظهره الجدول.`,
  },

  configTable: {
    title: "خيارات هذا المتجر واحدًا واحدًا",
    titleAt: (store: string) => `ما يعرضه ${store}، خيارًا خيارًا`,
    lookupOff: (hasRows: boolean) => `أوقفت Apple الاستعلام عن الاستلام من هذا المتجر في الوقت الحالي${hasRows ? " (أحدث إجاباته مدرجة أدناه)" : ""}`,
    tracked: (n: number) => `${count(n, CONFIGS)} تحت المراقبة`,
    firstSweep: "أول جولة فحص جارية · تظهر الحالات خلال دقيقة",
    inStock: (n: number, total: number) => `${N(n)} من ${N(total)} معروضة`,
    available: "معروض الآن",
    unavailable: "غير معروض",
    noLookup: "الاستعلام موقوف",
    notChecked: "بانتظار أول فحص",
    since: (ago: ReactNode) => <>معروض منذ {ago}</>,
    lastAvailable: (ago: ReactNode) => <>آخر عرض {ago}</>,
    neverHere: "لم يُعرض هنا حتى الآن",
    buy: "اطلب",
    alertAria: (model: string, config: string, store: string) => `نبّهني حين يعرض ${store} جهاز ${model} ${config}`,
    alert: "فعّل التنبيهات ←",
  },

  matrix: {
    store: "اسم المتجر",
    checked: "آخر قراءة",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} من ${count(total, CONFIGS)} معروضة`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short}: ${N(n)}`,
    noDuo: (short: string) => `${short}: لا شيء`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `معروض الآن: ${N(n)} من ${count(total, CONFIGS)}`,
    noneNow: (total: number) => `0 من ${count(total, CONFIGS)} في هذه اللحظة`,
    lookupOff: "أوقفت Apple الاستعلام عن الاستلام من هذا المتجر في الوقت الحالي",
    notChecked: "بانتظار أول فحص",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>قُرئ {ago}</>,
    alert: "فعّل التنبيهات ←",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>قُرئ {ago} · {CHECK}</>,
    map: "اعرضه على الخريطة",
    alert: "راقب هذا المتجر",
    alsoIn: (region: string) => `المزيد في ${region}`,
    acrossLine: "متاجر قريبة خلف الحدود",
    elsewhere: "أقرب المتاجر الأبعد",
  },

  hours: {
    title: "مواعيد الفتح",
    local: (zone: string) => `بتوقيت المتجر · ${zone}`,
    today: (hours: string, week: string) => ` · ساعات اليوم ${hours} · ${week}`,
    directions: "طريقك إلى المتجر",
    applePage: "هذا المتجر على apple.com",
    liveMap: "خريطة المخزون",
    storePage: "صفحة هذا المتجر",
    closed: "لا يفتح",
    everyDay: (hours: string) => `كل أيام الأسبوع ${hours}`,
    openNow: (closes: string) => `يعمل الآن · حتى ${closes}`,
    opensAt: (opens: string) => `يفتح عند ${opens}`,
    closedToday: (next: string | null) => (next ? `لا يفتح اليوم · الافتتاح التالي ${next}` : "لا يفتح اليوم"),
    closedNow: (next: string | null) => (next ? `مغلق حاليًا · يفتح ${next}` : "مغلق حاليًا"),
    nextOpen: (day: string | null, time: string) => `${day ?? "في الغد"}، ${time}`,
  },

  liveStats: {
    inStock: "معروض الآن",
    storesWith: "متاجر تعرض مخزونًا",
    lastCheck: "أحدث قراءة",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(n)} من ${count(stores, STORES_G)} ${n === 1 ? "يعرض" : "تعرض"} ${short} الآن`,
    lastCheck: (ago: ReactNode) => <>أحدث قراءة {ago}</>,
    firstSweep: "أول جولة فحص جارية.",
    noneListed: (model: string, storage: string | null, color: string | null) => `في هذه اللحظة لا يعرض أي متجر ${model}${storage ? ` ${storage}` : ""}${color ? ` بلون ${color}` : ""}.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>عُرض {ago}</>,
    loading: "نقرأ المخزون…",
  },
};
