/**
 * العربية: modules — وحدات عودة التوفر والمتاجر والمخزون (src/components/{restocks,stores,stock}).
 * `label` عبارة مكان تحمل حرف الجر («في دبي»، «في Apple دبي مول»، «هنا»). الأرقام تصل خامًا فتُنسَّق هنا؛ المدد والأوقات
 * والتواريخ تصل منسّقة. فترات الفحص 15 ثانية (كل متجر) و5 ثوانٍ (المتاجر التي عليها تنبيهات) فقط.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CONFIGS, DAYS, SELLOUTS, STORES_G, N, count, forms, theStoresG } from "./util";

const CHECK = "كل 15 ثانية، و5 ثوانٍ مع تنبيه";
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
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · ${count(restocks, RESTOCKS)} · ${count(soldouts, SELLOUTS)}`,
    legendRestocks: "عودات التوفر",
    legendSoldouts: "حالات النفاد",
  },

  last24: {
    title: (label: string) => `عودات توفر iPhone Duo ${label} في آخر 24 ساعة`,
    asOf: (when: string) => `قُرئ في ${when}`,
    localTime: (when: string) => `${when} بالتوقيت المحلي`,
    anAppleStore: "متجر Apple",
    unknown: "عدد آخر 24 ساعة غير متاح في هذه اللحظة؛ المخزون المباشر وسجل عودة التوفر في هذه الصفحة لم يتأثرا.",
    none: (label: string, asOf: string) => <><b className="text-ink">صفر عودة توفر لـiPhone Duo {label} في آخر 24 ساعة</b> (قُرئ في {asOf}).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">{`${count(o.restocks, RESTOCKS)} لـiPhone Duo`} {o.one ? o.label : `في ${N(o.withStores)} من ${theStoresG(o.allStores)} ${o.label}`}</b> في آخر 24 ساعة؛ وأحدثها <b className="text-ink">{o.config}</b>{o.store != null && <> في {o.store}</>}، {o.when} بالتوقيت المحلي.</>
    ),
    tileRestocks: "عودات توفر مؤكدة في 24 ساعة",
    tileConfigsBack: "خيارات عادت للظهور",
    tileStores: (configs: number, allConfigs: number) => `متاجر عاد إليها التوفر${configs ? ` · ${N(configs)} من ${count(allConfigs, CONFIGS)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>الأحدث · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>السابقة لها · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "لا شيء أقدم في السجل",
    caption: (label: string, asOf: string) => `كل خيارات iPhone Duo ${label}: عودات التوفر المؤكدة في آخر 24 ساعة، قُرئت في ${asOf}`,
    thConfig: "الخيار",
    thRestocks: "عودات التوفر",
    thStores: "المتاجر",
    thLast: "أحدث عودة توفر (بالتوقيت المحلي)",
    thNow: "معروض الآن",
    ofStores: (n: number, total: number) => `${N(n)} من ${N(total)}`,
    noneIn24: "لا شيء في 24 ساعة",
    yes: "نعم",
    no: "لا",
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
    byHour: (zone: string) => `حسب الساعة · ${zone}`,
    byWeekday: "حسب يوم الأسبوع",
    barReported: (n: number) => ` (+${N(n)} أبلغت عنها متتبعات أخرى)`,
    barReportedTitle: (bar: string, n: number) => `${bar}: ${N(n)} أبلغت عنها متتبعات أخرى`,
    legendOurs: "أكدها RestockWire",
  },

  feed: {
    empty: "السجل فارغ حتى الآن.",
    available: "متوفر",
    soldOut: "نفد",
    soldOutAt: (time: ReactNode) => <>نفد {time}</>,
    since: (time: ReactNode) => <>معروض منذ {time}</>,
    restockedAt: (time: ReactNode) => <>عاد {time}</>,
    mapAria: (store: string) => `اعثر على ${store} في الخريطة`,
    map: "الخريطة",
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
    half: (label: string, duration: string) => `${duration}: الوقت الذي استغرقه نفاد نصف عودات التوفر ${label}.`,
    none: (label: string, days: number) => `لم يعد شيء إلى التوفر ثم ينفد ${label} في آخر ${d(days)}.`,
    whatDuo: "iPhone Duo",
    whatAll: "كل أجهزة iPhone",
    tileHalf: (what: string) => <>نفد نصفها خلال · {what}</>,
    tileWithin30: "نفدت خلال 30 ث",
    tileWithin60: "نفدت خلال دقيقة",
    tileFastest: (n: number, days: number) => <>الأسرع · {count(n, SOLD_RESTOCKS)}، {N(days)} ي</>,
    caption: (days: number) => `لكل iPhone، آخر ${d(days)}`,
    thIphone: "iPhone",
    thSoldOut: "نفد",
    thHalf: "نفد نصفها خلال",
    thWithin30: "≤ 30 ث",
    thWithin60: "≤ دقيقة",
    thFastest: "الأسرع",
    each: "صف لكل عودة توفر",
    barNote: (full: string) => `طول الشريط = ثواني العرض · ${full} يملأ الصف`,
    stillListed: (duration: string) => `ما زال معروضًا · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "كيف نقيس هذه الأوقات",
    measured: (estimated: boolean) =>
      `الصف الذي يقول «نفد خلال 45–60 ث» يعني أن فحصنا بعد 45 ثانية من أول رصد وجد الخيار لا يزال معروضًا، وأن الفحص بعد 60 ثانية وجده قد اختفى. عرض كل نطاق هو الفاصل بين الفحوص: 5 ثوانٍ في المتاجر التي عليها تنبيهات، و15 ثانية في كل مكان آخر${estimated ? "؛ والصفوف المعلّمة بـ≈ تعود إلى ما قبل حفظنا للفحص الأخير، فحدّها دورة الـ15 ثانية بدلًا من ذلك" : ""}. وقد يظهر عرض أقصر من فاصل واحد ويختفي بين فحصين، لذا فالنسبة الحقيقية لما ينفد خلال 30 ثانية أعلى مما يُظهره الجدول.`,
  },

  configTable: {
    title: "كل الخيارات في هذا المتجر",
    titleAt: (store: string) => `كل الخيارات في ${store}`,
    lookupOff: (hasRows: boolean) => `أوقفت Apple الاستعلام عن الاستلام من هذا المتجر في الوقت الحالي${hasRows ? " (أحدث إجاباته مدرجة أدناه)" : ""}`,
    tracked: (n: number) => `${count(n, CONFIGS)} تحت المراقبة`,
    firstSweep: "أول جولة فحص جارية · تظهر الحالات خلال دقيقة",
    inStock: (n: number, total: number) => `${N(n)} من ${N(total)} معروضة`,
    available: "متوفر",
    unavailable: "غير متوفر",
    noLookup: "لا استعلام عن الاستلام",
    notChecked: "لم يُفحص بعد",
    since: (ago: ReactNode) => <>معروض منذ {ago}</>,
    lastAvailable: (ago: ReactNode) => <>آخر عرض {ago}</>,
    neverHere: "لم يُعرض هنا حتى الآن",
    buy: "اطلب",
    alertAria: (model: string, config: string, store: string) => `نبّهني حين يعرض ${store} جهاز ${model} ${config}`,
    alert: "فعّل التنبيهات ←",
  },

  matrix: {
    store: "المتجر",
    checked: "الفحص",
    cellTitle: (model: string, n: number, total: number) => `${model}: ${N(n)} من ${count(total, CONFIGS)} معروضة`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `لا ${short}`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `${N(n)} من ${count(total, CONFIGS)} معروضة الآن`,
    noneNow: (total: number) => `0 من ${count(total, CONFIGS)} في هذه اللحظة`,
    lookupOff: "أوقفت Apple الاستعلام عن الاستلام من هذا المتجر في الوقت الحالي",
    notChecked: "لم يُفحص بعد",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>قُرئ {ago}</>,
    alert: "فعّل التنبيهات ←",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>قُرئ {ago} · {CHECK}</>,
    map: "اعرضه على الخريطة",
    alert: "راقب هذا المتجر",
    alsoIn: (region: string) => `المزيد في ${region}`,
    acrossLine: "أقرب المتاجر عبر الحدود",
    elsewhere: "أقرب المتاجر الأبعد",
  },

  hours: {
    title: "ساعات العمل",
    local: (zone: string) => `التوقيت المحلي · ${zone}`,
    today: (hours: string, week: string) => ` · اليوم ${hours} · ${week}`,
    directions: "الاتجاهات",
    applePage: "هذا المتجر على apple.com",
    liveMap: "الخريطة المباشرة",
    storePage: "صفحة المتجر",
    closed: "مغلق",
    everyDay: (hours: string) => `يوميًا ${hours}`,
    openNow: (closes: string) => `مفتوح الآن · يغلق ${closes}`,
    opensAt: (opens: string) => `يفتح الساعة ${opens}`,
    closedToday: (next: string | null) => (next ? `مغلق اليوم · يفتح ${next}` : "مغلق اليوم"),
    closedNow: (next: string | null) => (next ? `مغلق الآن · يفتح ${next}` : "مغلق الآن"),
    nextOpen: (day: string | null, time: string) => `${day ?? "غدًا"} الساعة ${time}`,
  },

  liveStats: {
    inStock: "معروض الآن",
    storesWith: "متاجر فيها مخزون",
    lastCheck: "آخر فحص",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `${N(n)} من ${count(stores, STORES_G)} ${n === 1 ? "يعرض" : "تعرض"} ${short} الآن`,
    lastCheck: (ago: ReactNode) => <>آخر فحص {ago}</>,
    firstSweep: "أول جولة فحص جارية.",
    noneListed: (model: string, storage: string | null, color: string | null) => `في هذه اللحظة لا يعرض أي متجر ${model}${storage ? ` ${storage}` : ""}${color ? ` بلون ${color}` : ""}.`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>عُرض {ago}</>,
    loading: "جارٍ تحميل المخزون",
  },
};
