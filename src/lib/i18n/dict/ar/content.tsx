/**
 * العربية: content — أجزاء صفحات SEO (الأسئلة الشائعة، روابط التصفح، شرائط الأرقام، أجزاء صفحة الطراز، المصادر،
 * الوحدات المباشرة)، ساعات العمل، المدد، عناوين الصفحات، رموز {{tokens}}، جملة نمط التوفر، ونصوص الصور.
 * تصل الأرقام والمدد والمسافات وأسماء المتاجر والمدن والألوان منسّقة بالعربية. لا تُترجم أسماء الطرازات والسعات وApple Store
 * وRestockWire وapple.com. فترات الفحص 15 ثانية و5 ثوانٍ فقط.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { APPLE_STORES, CITIES, CONFIGS, DAYS, MINUTES, NOUNS, STORES, STORES_G, TIMES, count, daysOf, forms, parseN, searchedStore, streetAr } from "./util";

type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "مغلق",
    everyDay: (hours: string) => `يوميًا ${hours}`,
    tomorrow: "غدًا",
    dayAt: (day: string, time: string) => `${day} الساعة ${time}`,
    closedTodayOpens: (next: string) => `مغلق اليوم · يفتح ${next}`,
    closedToday: "مغلق اليوم",
    opensAt: (time: string) => `يفتح الساعة ${time}`,
    openNow: (closes: string) => `مفتوح الآن · يغلق الساعة ${closes}`,
    closedNowOpens: (next: string) => `مغلق الآن · يفتح ${next}`,
    closedNow: "مغلق الآن",
  },

  duration: {
    underAMinute: "أقل من دقيقة",
    pair: (a: string, b: string) => `${a} و${b}`,
  },
  listMore: (n: string) => `${n} أخرى`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    /** How answers name the page: «في Apple دبي مول»، «لجهاز iPhone Duo»، «في دبي». */
    where: (kind: Kind, place: string) => (kind === "model" ? `لجهاز ${place}` : `في ${place}`),
    nRestocks: TIMES,
    restockA: ({ count: c, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${c == null ? `لم يُسجَّل أي توفر ${where} خلال آخر ${daysOf(days)}` : `سُجّل التوفر ${where} ${c} خلال آخر ${daysOf(days)} (${parseN(week) === 0 ? "لا شيء منها في الأسبوع الماضي" : `منها ${week} في الأسبوع الماضي`})`}${peak ? `، وتتركز حول الساعة ${peak.hour} بالتوقيت المحلي${peak.day ? `، وأكثر الأيام نشاطًا ${peak.day}` : ""}` : ""}؛ ولا تعلن Apple نفسها أي جدول.`,
    lastsNone: (where: string) => `لم تنفد بعدُ حالات توفر كافية ${where} لتحديد رقم.`,
    lasts: (days: string, duration: string) => `نحو ${duration} في الوسيط: هذه هي المدة التي بقي فيها الخيار معروضًا بعد عودته قبل أن ينفد، خلال آخر ${daysOf(days)}.`,
    storeIn: (store: string, line: string) => `${store} في ${line}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `أين يتوفر ${model} للاستلام الآن؟`,
    modelStockNone: (model: string) => `لم يعرضه أي متجر Apple في الولايات المتحدة عند آخر فحص؛ وتذكر هذه الصفحة أول متجر لحظة ظهور ${model} للاستلام.`,
    nUsStores: forms({ one: "متجر Apple واحد في الولايات المتحدة", two: "متجرا Apple في الولايات المتحدة", few: "# متاجر Apple في الولايات المتحدة", many: "# متجرًا في الولايات المتحدة", other: "# متجر Apple في الولايات المتحدة" }),
    modelStockSome: (c: string) => `${c} عند آخر فحص، وكلٌّ منها مذكور في هذه الصفحة مع خياراته.`,
    priceQ: (model: string) => `كم يبلغ سعر ${model}؟`,
    priceA: (low: string, high: string, storages: string, colors: string) => `من ${low} إلى ${high} غير مقفل، ويتحدد السعر بالسعة (${storages})، بألوان ${colors}.`,
    modelRestockQ: (model: string) => `كم مرة يعود ${model} إلى المخزون؟`,
    modelLastsQ: (model: string) => `بعد عودة ${model}، كم يبقى معروضًا؟`,
    reserveQ: (model: string) => `هل هناك طريقة لحجز ${model} للاستلام؟`,
    reserveA: "ليس مسبقًا: حين يعرض متجرٌ خيارك، تطلبه من apple.com مع الاستلام من المتجر، فتحتفظ به Apple لك في الموعد الذي تختاره.",

    storeStockQ: (store: string, model: string) => `هل يتوفر ${model} في ${store}؟`,
    nConfigs: CONFIGS,
    storeStockYes: (c: string) => `نعم: ${c} عند آخر فحص، والسعة واللون في الجدول بهذه الصفحة.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `لا، ليس عند آخر فحص${other ? `؛ لكنه يعرض ${other.pro} من خيارات iPhone 18 Pro و${other.proMax} من خيارات 18 Pro Max` : "، ولا يعرض أي خيار من 18 Pro أو 18 Pro Max أيضًا"}.`,
    hoursQ: (store: string) => `متى يفتح ${store}؟`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "راجع جدول الساعات في هذه الصفحة"}${today ? `؛ اليوم ${today}` : ""}؛ العنوان: ${streetAr(address)}${phone ? `، الهاتف ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `كم مرة يعود iPhone إلى المخزون في ${store}؟`,
    storeLastsQ: (store: string) => `كم يبقى التوفر معروضًا في ${store}؟`,
    storeNearestQ: (store: string) => `ما أقرب متاجر Apple إلى ${store}؟`,

    placeStockQ: (place: string, model: string) => `أي متاجر Apple في ${place} تعرض ${model} للاستلام الآن؟`,
    placeStockNone: (place: string, model: string) => `لا شيء عند آخر فحص؛ ولحظة أن يعرض متجر في ${place} ${model}، يظهر في هذه الصفحة.`,
    nStores: STORES,
    placeStockSome: (c: string, stores: string) => `${c} عند آخر فحص: ${stores}.`,
    countQ: (place: string) => `كم عدد متاجر Apple في ${place}؟`,
    nAppleStores: forms({ one: "متجر Apple واحد", two: "متجرا Apple", few: "# متاجر Apple", many: "# متجرًا", other: "# متجر Apple" }),
    countMany: (c: string, stores: string) => (c.startsWith("متجرا") ? `${c}: ${stores}.` : `${c}، منها ${stores}.`),
    countOne: (c: string, store: string) => `${c}: ${store}.`,
    placeRestockQ: (place: string) => `كم مرة يعود iPhone إلى المخزون في ${place}؟`,
    placeLastsQ: (place: string) => `كم يدوم المخزون في ${place} بعد عودته؟`,
    placeNearestQ: (place: string) => `ما أقرب متاجر Apple خارج ${place}؟`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "كل متاجر Apple في الولايات المتحدة" : `متاجر Apple في ${place}`;
    return [
      "الاستلام من المتجر عملية شراء عبر apple.com: تختار الخيار والمتجر عند الدفع، وتدفع أونلاين، ثم تستلم بنفسك، وغالبًا في اليوم نفسه. أما متاجر شركات الاتصالات والمعروض على الرفوف لمن يدخل المتجر فمخزون منفصل.",
      `في ${at}، يقرأ RestockWire كل خيار يتابعه كل 15 ثانية، أو كل 5 ثوانٍ حيث يوجد تنبيه. ولا يُحتسب أي تغيير قبل أن يؤكده فحص ثانٍ، فلا يظهر خلل عابر أبدًا على أنه توفر أو نفاد.`,
      "كل تغيير مؤكد يدخل السجل، ومن هذا السجل يُرسم مخطط التوفر والتاريخ في هذه الصفحة.",
    ];
  },
  alertRule: "التنبيه الواحد متجر واحد وهاتف محدد واحد (الطراز والسعة واللون)؛ وخلال ثوانٍ من تحوّل apple.com إلى «متوفر» يصلك إشعار فوري، أو بريد إلكتروني إن لم يكن لديك جهاز يستقبل الإشعارات.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `ابل ستور ${name}: iPhone Duo معروض في ${duoNow} من ${count(parseN(stores), STORES_G)}`,
      `ابل ستور ${name}: مخزون استلام iPhone Duo مباشرةً`,
      `ابل ستور ${name}: مخزون iPhone Duo الآن`,
      `ابل ستور ${name}: مخزون iPhone مباشرةً`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `ابل ستور ${city}، ${code}: iPhone Duo في ${duoNow} من ${count(parseN(stores), STORES_G)}`,
      `ابل ستور ${city}، ${code}: استلام iPhone Duo مباشرةً`,
      `ابل ستور ${city}، ${code}: مخزون iPhone Duo الآن`,
      `ابل ستور ${city}: مخزون iPhone مباشرةً`,
    ],
    /** «ابل دبي مول» أولًا (كما يكتبها الناس في البحث)، ثم الوعد. */
    store: (name: string, region: string | null) => {
      const n = searchedStore(name);
      const r = region ? ` (${region})` : "";
      return [
        `${n}${r}: مخزون iPhone المباشر، أوقات التوفر، الاستلام`,
        `${n}${r}: مخزون iPhone المباشر وأوقات التوفر`,
        `${n}${r}: مخزون iPhone المباشر وساعات العمل`,
        `${n}: مخزون iPhone المباشر، أوقات التوفر، الاستلام`,
        `${n}: مخزون iPhone المباشر وساعات العمل`,
        `${n}: مخزون iPhone المباشر`,
        `${n} – المخزون المباشر`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `مخزون ${name} للاستلام: معروض الآن في ${storesNow} من متاجر Apple`,
      `مخزون ${name} للاستلام: ${count(parseN(storesNow), APPLE_STORES)} الآن`,
      `مخزون ${name} للاستلام من المتجر، مباشرةً الآن`,
    ],
  },

  tokens: {
    tooFewToMeasure: "لا بيانات كافية بعد",
    noneLoggedYet: "لا شيء مسجل بعد",
    noneYet: "لا شيء حتى الآن",
  },

  pattern: {
    none: (days: string) => `لا توفر مؤكدًا خلال آخر ${daysOf(days)}.`,
    nConfirmed: TIMES,
    countIn: (c: string, days: string) => `تأكد التوفر ${c} خلال آخر ${daysOf(days)}`,
    stay: (minutes: string) => `، ويبقى التوفر معروضًا عادةً نحو ${count(parseN(minutes), MINUTES)}`,
    nDays: DAYS,
    tooFew: (c: string, onDays: string | null, stay: string) => `${c}${onDays ? ` في ${onDays}` : ""}، وهذا لا يكفي بعدُ لتحديد ساعة معتادة${stay}.`,
    usual: (hour: string, weekday: string | null, c: string, stay: string) => `ساعة التوفر المعتادة: ${hour} بالتوقيت المحلي${weekday ? `، و${weekday} أكثر الأيام نشاطًا` : ""}؛ ${c}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, w]) => [k, { one: w.one, other: w.other }])) as Record<string, Forms>,

  measured: "كيف نقيس هذه الأرقام",

  faqTitle: "أسئلة وأجوبة",
  breadcrumb: "مسار التنقل",
  keepExploring: "المزيد من RestockWire",
  browse: {
    storesByState: "المتاجر حسب الولاية",
    allStatesCities: "كل الولايات والمدن ←",
    liveByModel: "المخزون المباشر، طرازًا طرازًا",
    modelStock: (model: string) => `مخزون ${model}`,
    thisPage: "هذه الصفحة",
    restockLog: (short: string) => `سجل توفر ${short}`,
    liveMap: "الخريطة المباشرة",
    mostStores: "الأكثر متاجر",
    allStates: "كل الولايات",
    bigCities: "المدن الكبرى",
    cities: "المدن",
    storesBy: (region: string) => `المتاجر حسب ال${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>كل متاجر Apple في {country} ←</>,
    allRegions: (regions: string) => `جميع ال${regions}`,
  },
  modelCards: "اختر iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}أحدث توفر: {config}{at}، {ago}.</>,
    at: (store: ReactNode) => <> في {store}</>,
  },
  statStrip: {
    inStockNow: "معروض الآن",
    ofStores: (n: string) => `من أصل ${count(parseN(n), STORES_G)}`,
    stores: "المتاجر",
    nCities: CITIES,
    tracked: "قيد الرصد",
    modelNow: (short: string) => `${short} الآن`,
    configsInStock: "خيارات معروضة",
    storesWithStock: forms({ one: "متجر يعرض مخزونًا", two: "متجران يعرضان مخزونًا", few: "متاجر تعرض مخزونًا", many: "متجرًا يعرض مخزونًا", other: "متجر يعرض مخزونًا" }),
    restocks24h: "التوفر، 24 ساعة",
    restocksHint: (week: string, month: string, days: string) => `${week} خلال 7 أيام · ${month} خلال ${daysOf(days)}`,
    sellOuts: (days: string) => `النفاد · ${daysOf(days)}`,
    stays: (duration: string) => `يبقى نحو ${duration}`,
    noPairs: "لا حالات نفاد مقترنة بعد",
    lastRestock: "أحدث توفر",
    noneYet: "لا شيء حتى الآن",
    inLastDays: (days: string) => `خلال آخر ${daysOf(days)}`,
  },
  product: {
    chooseIphone: "اختر هاتفك iPhone",
    storage: "السعة",
    color: "اللون",
    all: "الكل",
    numbersAre: (unit: ReactNode) => <>كل رقم يعدّ {unit} التي تعرضه الآن.</>,
    seen: (ago: ReactNode) => <>عُرض {ago}</>,
    last: (ago: ReactNode) => <>آخر مرة {ago}</>,
    notSeenYet: "لم يُعرض حتى الآن",
    firstCheckPending: "أول فحص في الطريق",
    inStock: "متوفر",
    inStockLower: "متوفر",
    none: "لا يوجد",
    here: "هنا",
    notAvailable: "غير معروض",
    notCheckedYet: "لم يُفحص بعد",
    availableForPickup: "معروض للاستلام",
    since: (ago: ReactNode) => <> · معروض {ago}</>,
    lastInStock: (ago: ReactNode) => <>آخر عرض {ago}</>,
    neverSeen: "لم يُعرض في هذا المتجر حتى الآن",
    firstCheckSoon: "أول فحص خلال دقيقة",
    buy: "اطلبه من apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>آخر قراءة {checked} · {note}</>,
    checkNote: "كل 15 ثانية، و5 ثوانٍ مع تنبيه",
  },

  source: (source: ReactNode) => <>البيانات: {source}</>,
  photoCredit: (link: ReactNode) => <>الصورة: {link}</>,
  sources: "المصادر",
  allUsStores: "كل متاجر Apple الـ269 في الولايات المتحدة",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>فحوص RestockWire المباشرة منذ {since}: كل خيار من iPhone Duo و18 Pro و18 Pro Max في {where}، يُقرأ كل 15 ثانية (وكل 5 ثوانٍ حيث يوجد تنبيه)؛ وقُرئت أرقام هذه الصفحة في {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>مباشر: عدد متاجر Apple (من أصل {stores}) التي تعرض كل خيار من {model} للاستلام</>,
    storage: "السعة",
    pricesCaption: (model: ReactNode) => <>{model}: سعر apple.com (غير مقفل، قبل الضريبة) بجانب مخزون الاستلام المباشر</>,
    price: "السعر",
    bestColor: "اللون الأكثر عرضًا (عدد المتاجر الآن)",
    noRestock: (model: string) => `لا يوجد في السجل أي توفر لجهاز ${model} بعد.`,
    clockLabel: (model: string) => `لجهاز ${model} في أنحاء البلاد`,
    storesWithIt: "متاجر تعرضه الآن",
    pairsInStock: "أزواج متجر × خيار معروضة",
    restocksLogged: "حالات التوفر المسجلة",
    medianTime: "وسيط مدة العرض",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "منضدة استلام خشبية عليها لافتة Pickup داخل متجر Apple", caption: "تُسلَّم طلبات الاستلام عند منضدة كهذه." },
    "phone-map": { alt: "يدان تستخدمان تطبيق خرائط على هاتف ذكي في الهواء الطلق", caption: "حين يدوم التوفر دقيقة واحدة، تصبح المسافة إلى المتجر أهم مما يظن الناس." },
    "phone-card-payment": { alt: "امرأة تحمل iPhone وبطاقة ائتمان لتدفع أونلاين", caption: "الدفع أونلاين ثم الاستلام من المتجر." },
    "phone-on-box": { alt: "هاتف ذكي جديد فوق علبته البيضاء", caption: "هاتف جديد خرج للتو من علبته." },
    "city-map-phone": { alt: "شخصان يتفقدان خريطة المدينة على هاتف", caption: "تخطيط الطريق إلى المتجر." },
    "phone-notification": { alt: "يد تحمل هاتفًا تظهر على شاشة قفله إشعارات", caption: "التنبيه يصل إلى شاشة القفل." },
    "apple-store-crowd-inside": { alt: "حشد يصطف داخل متجر Apple مزدحم في مركز تسوق", caption: "زحام أسبوع الإطلاق داخل متجر Apple: المخزون الذي يصل إلى الرفوف ينفد في دقائق." },
    "apple-store-glass-canopy": { alt: "متجر Apple بواجهة زجاجية ومظلة خشبية ليلًا", caption: "متجر Apple بواجهة زجاجية بعد حلول الظلام." },
    "apple-store-night-vancouver": { alt: "متجر Apple مضاء ليلًا في فانكوفر", caption: "متجر Apple ليلًا: قد يظهر مخزون الاستلام في أي ساعة، لكنه يظهر صباحًا أكثر بكثير." },
    "phone-hand-camera": { alt: "شخص يحمل iPhone بثلاث كاميرات", caption: "طرازات Pro هي التي يصطف الناس من أجلها." },
    "place-ae-uae": { alt: "برج العرب خلف أشجار النخيل وجسر مقوّس للمشاة في مدينة جميرا بدبي", caption: "برج العرب، دبي." },
    "place-ae-abu-dhabi": { alt: "أبراج الواجهة البحرية في أبوظبي عبر مياه زرقاء صافية في يوم مشمس", caption: "أفق أبوظبي من البحر." },
    "place-ae-abu-dhabi-emirate": { alt: "القباب والمآذن البيضاء لجامع الشيخ زايد الكبير تحت سماء زرقاء", caption: "جامع الشيخ زايد الكبير، أبوظبي." },
    "place-ae-dubai": { alt: "منظر جوي لوسط مدينة دبي يرتفع فيه برج خليفة فوق دبي مول", caption: "وسط مدينة دبي: برج خليفة ودبي مول، حيث يقع متجر Apple دبي مول." },
  },
};
