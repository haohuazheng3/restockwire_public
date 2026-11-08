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
    closed: "لا يفتح",
    everyDay: (hours: string) => `كل أيام الأسبوع ${hours}`,
    tomorrow: "في الغد",
    dayAt: (day: string, time: string) => `${day}، ${time}`,
    closedTodayOpens: (next: string) => `لا يفتح اليوم · الافتتاح التالي ${next}`,
    closedToday: "لا يفتح اليوم",
    opensAt: (time: string) => `يفتح عند ${time}`,
    openNow: (closes: string) => `يعمل الآن · حتى ${closes}`,
    closedNowOpens: (next: string) => `مغلق حاليًا · يفتح ${next}`,
    closedNow: "مغلق حاليًا",
  },

  duration: {
    underAMinute: "دون الدقيقة",
    pair: (a: string, b: string) => `${a} و${b}`,
  },
  listMore: (n: string) => `و${n} غيرها`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    /** How answers name the page: «في Apple دبي مول»، «لجهاز iPhone Duo»، «في دبي». */
    where: (kind: Kind, place: string) => (kind === "model" ? `بالنسبة إلى ${place}` : `في ${place}`),
    nRestocks: TIMES,
    restockA: ({ count: c, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${c == null ? `لم يُسجَّل أي توفر ${where} خلال آخر ${daysOf(days)}` : `سُجّل التوفر ${where} ${c} خلال آخر ${daysOf(days)} (${parseN(week) === 0 ? "لا شيء منها في الأسبوع الماضي" : `منها ${week} في الأسبوع الماضي`})`}${peak ? `، وتتركز حول الساعة ${peak.hour} بالتوقيت المحلي${peak.day ? `، وأكثر الأيام نشاطًا ${peak.day}` : ""}` : ""}؛ ولا تعلن Apple نفسها أي جدول.`,
    lastsNone: (where: string) => `لم تنفد بعدُ حالات توفر كافية ${where} لتحديد رقم.`,
    lasts: (days: string, duration: string) => `نحو ${duration} في الوسيط: هذه هي المدة التي بقي فيها الخيار معروضًا بعد عودته قبل أن ينفد، خلال آخر ${daysOf(days)}.`,
    storeIn: (store: string, line: string) => `${store}، ${line}`,
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

    storeStockQ: (store: string, model: string) => `هل يعرض ${store} جهاز ${model} للاستلام؟`,
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
    placeStockSome: (c: string, stores: string) => `${c} في آخر قراءة: ${stores}.`,
    countQ: (place: string) => `ما عدد متاجر Apple الموجودة في ${place}؟`,
    nAppleStores: forms({ one: "متجر Apple واحد", two: "متجرا Apple", few: "# متاجر Apple", many: "# متجرًا", other: "# متجر Apple" }),
    countMany: (c: string, stores: string) => (c.startsWith("متجرا") ? `${c}، هما ${stores}.` : `${c}؛ من بينها ${stores}.`),
    countOne: (c: string, store: string) => `${c}: ${store}.`,
    placeRestockQ: (place: string) => `كم مرة يعود iPhone إلى المخزون في ${place}؟`,
    placeLastsQ: (place: string) => `كم يدوم المخزون في ${place} بعد عودته؟`,
    placeNearestQ: (place: string) => `ما أقرب متاجر Apple خارج ${place}؟`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "جميع متاجر Apple الأمريكية" : `متاجر Apple داخل ${place}`;
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
      `ابل ستور ${city}، ${code}: ${duoNow} من ${count(parseN(stores), STORES_G)} تعرض iPhone Duo`,
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
    countIn: (c: string, days: string) => `رُصد توفر مؤكد ${c} في آخر ${daysOf(days)}`,
    stay: (minutes: string) => `، ويبقى التوفر معروضًا عادةً نحو ${count(parseN(minutes), MINUTES)}`,
    nDays: DAYS,
    tooFew: (c: string, onDays: string | null, stay: string) => `${c}${onDays ? ` في ${onDays}` : ""}، وهذا لا يكفي بعدُ لتحديد ساعة معتادة${stay}.`,
    usual: (hour: string, weekday: string | null, c: string, stay: string) => `ساعة التوفر المعتادة: ${hour} بالتوقيت المحلي${weekday ? `، و${weekday} أكثر الأيام نشاطًا` : ""}؛ ${c}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(NOUNS).map(([k, w]) => [k, { one: w.one, other: w.other }])) as Record<string, Forms>,

  measured: "كيف نقيس هذه الأرقام",

  faqTitle: "أسئلة وأجوبة",
  breadcrumb: "مسار الصفحة",
  keepExploring: "المزيد من RestockWire",
  browse: {
    storesByState: "متاجر كل ولاية",
    allStatesCities: "تصفّح الولايات والمدن ←",
    liveByModel: "المخزون المباشر، طرازًا طرازًا",
    modelStock: (model: string) => `توفر ${model}`,
    thisPage: "أنت هنا",
    restockLog: (short: string) => `سجل عودات ${short}`,
    liveMap: "خريطة المخزون",
    mostStores: "حسب عدد المتاجر",
    allStates: "الولايات كلها",
    bigCities: "أكبر المدن",
    cities: "مدن",
    storesBy: (region: string) => `المتاجر في كل ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>متاجر Apple كلها في {country} ←</>,
    allRegions: (regions: string) => `جميع ال${regions}`,
  },
  modelCards: "اختر iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}أحدث توفر: {config}{at}، {ago}.</>,
    at: (store: ReactNode) => <> بمتجر {store}</>,
  },
  statStrip: {
    inStockNow: "معروض الآن",
    ofStores: (n: string) => `من أصل ${count(parseN(n), STORES_G)}`,
    stores: "عدد المتاجر",
    nCities: CITIES,
    tracked: "قيد الرصد",
    modelNow: (short: string) => `${short} حاليًا`,
    configsInStock: "خيارات معروضة",
    storesWithStock: forms({ one: "متجر يعرض مخزونًا", two: "متجران يعرضان مخزونًا", few: "متاجر تعرض مخزونًا", many: "متجرًا يعرض مخزونًا", other: "متجر يعرض مخزونًا" }),
    restocks24h: "التوفر، 24 ساعة",
    /** A tile that counts one model only (its short name first). */
    scoped: (label: string, model: string) => `${model} · ${label}`,
    restocksHint: (week: string, month: string, days: string) => `${week} خلال 7 أيام · ${month} خلال ${daysOf(days)}`,
    sellOuts: (days: string) => `حالات النفاد · ${daysOf(days)}`,
    stays: (duration: string) => (duration === "دون الدقيقة" ? `يبقى ${duration}` : `يبقى نحو ${duration}`),
    noPairs: "لا حالات نفاد مقترنة بعد",
    lastRestock: "أحدث توفر",
    noneYet: "لا شيء حتى الآن",
    inLastDays: (days: string) => `في آخر ${daysOf(days)}`,
  },
  product: {
    chooseIphone: "اختر هاتفك iPhone",
    storage: "سعة التخزين",
    color: "الألوان",
    all: "كلها",
    numbersAre: (unit: ReactNode) => <>كل رقم يعدّ {unit} التي تعرضه الآن.</>,
    seen: (ago: ReactNode) => <>عُرض {ago}</>,
    last: (ago: ReactNode) => <>آخر ظهور {ago}</>,
    notSeenYet: "لم يُعرض حتى الآن",
    firstCheckPending: "أول فحص في الطريق",
    inStock: "متوفر الآن",
    inStockLower: "متوفر الآن",
    none: "لا شيء",
    here: "هنا",
    notAvailable: "غير معروض",
    notCheckedYet: "بانتظار أول فحص",
    availableForPickup: "معروض للاستلام",
    since: (ago: ReactNode) => <> · معروض {ago}</>,
    lastInStock: (ago: ReactNode) => <>آخر عرض {ago}</>,
    neverSeen: "لم يُعرض في هذا المتجر حتى الآن",
    firstCheckSoon: "يبدأ الفحص خلال دقيقة",
    buy: "اطلبه من apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>آخر قراءة {checked} · {note}</>,
    checkNote: "كل متجر كل 15 ثانية، ومتاجر التنبيهات كل 5 ثوانٍ",
  },

  source: (source: ReactNode) => <>البيانات: {source}</>,
  photoCredit: (link: ReactNode) => <>تصوير: {link}</>,
  sources: "مراجع البيانات",
  allUsStores: "كل متاجر Apple الـ269 في الولايات المتحدة",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>فحوص RestockWire المباشرة منذ {since}: كل خيار من iPhone Duo و18 Pro و18 Pro Max في {where}، يُقرأ كل 15 ثانية (وكل 5 ثوانٍ حيث يوجد تنبيه)؛ وقُرئت أرقام هذه الصفحة في {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>مباشر: عدد متاجر Apple (من أصل {stores}) التي تعرض كل خيار من {model} للاستلام</>,
    storage: "سعة التخزين",
    pricesCaption: (model: ReactNode) => <>{model}: سعر apple.com (غير مقفل، قبل الضريبة) بجانب مخزون الاستلام المباشر</>,
    price: "سعر Apple",
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
    "apple-store-pickup-counter": { alt: "ردهة واسعة في مركز تسوق تضم متجر Apple، مع سلالم متحركة وضوء طبيعي", caption: "متاجر المراكز التجارية مثل هذا تجدّد مخزون الاستلام قبل فتح الأبواب." },
    "phone-map": { alt: "لقطة قريبة في الهواء الطلق ليد تمسك هاتفًا ذكيًا يعرض تطبيق خرائط", caption: "العرض يعيش دقيقة؛ والطريق إلى المتجر يحسم الأمر." },
    "phone-card-payment": { alt: "امرأة تدفع دون تلامس بهاتفها الذكي عند جهاز دفع", caption: "ادفع على الإنترنت، واستلم من المتجر." },
    "phone-on-box": { alt: "هاتف ذكي داخل علبته على خلفية بيضاء", caption: "ما زال في علبته، ومحجوز لك." },
    "city-map-phone": { alt: "شابان يستعينان بالهاتف لمعرفة الطريق في رحلة على طريق ريفي", caption: "من يسكن بعيدًا يخطط لطريقه إلى المتجر مسبقًا." },
    "phone-notification": { alt: "لقطة قريبة ليد تمسك هاتفًا ذكيًا تظهر على شاشته عبارة «Hard Work Forever Pays.»", caption: "على هذه الشاشة يصلك التنبيه." },
    "apple-store-crowd-inside": { alt: "متسوقون يجرّبون الأجهزة على طاولات متجر Apple داخل مركز تسوق في بانكوك", caption: "داخل المتجر: كل طاولة منصة تجربة، وطابور الاستلام يتشكل في الخلف." },
    "apple-store-glass-canopy": { alt: "الواجهة الخارجية لمتجر Apple حديث بتصميم زجاجي على ضفة النهر في وسط شيكاغو", caption: "شيكاغو: متجر Apple زجاجي على النهر." },
    "apple-store-night-vancouver": { alt: "منظر جوي لأفق فانكوفر وجسرها المضاءين ليلًا", caption: "فانكوفر ليلًا. عودة المخزون ممكنة في أي ساعة، والصباح يحمل معظمها." },
    "phone-hand-camera": { alt: "لقطة قريبة ليد تمسك هاتفًا ذكيًا بغطاء برتقالي وثلاث عدسات كاميرا", caption: "من أجل طرازات Pro تتشكل الطوابير." },
    "place-ae-uae": { alt: "دبي مارينا ليلًا بناطحات سحاب مضاءة تنعكس أضواؤها على الماء", caption: "الإمارات: دبي مارينا ليلًا." },
    "place-ae-abu-dhabi": { alt: "أفق أبوظبي ينعكس على مياه الخليج الهادئة في يوم مشمس", caption: "أبوظبي: الأفق على صفحة الخليج." },
    "place-ae-abu-dhabi-emirate": { alt: "صورة بالأبيض والأسود لأفق أبوظبي ليلًا", caption: "إمارة أبوظبي: الأفق ليلًا بالأبيض والأسود." },
    "place-ae-dubai": { alt: "يخوت فاخرة في دبي مارينا أمام ناطحات سحاب شهيرة في ضوء الصباح", caption: "دبي: يخوت دبي مارينا في الصباح." },
    "compare-pickup-bag": { alt: "شخصان يتبادلان حقيبة تسوق في مكان داخلي", caption: "ينتهي الاستلام عند المنضدة، أما اختيار المتجر المناسب فيبدأ قبل ذلك بكثير." },
    "compare-two-stores": { alt: "مارّة تنعكس صورهم على واجهة متجر زجاجية في شارع مزدحم", caption: "متجران في المدينة نفسها كثيرًا ما يجدّدان المخزون في ساعات مختلفة." },
    "guide-android-phone": { alt: "يد تمسك هاتف Android تظهر عليه الشاشة الرئيسية", caption: "على Android يوصل Chrome التنبيهات دون تثبيت أي شيء." },
    "guide-android-watch": { alt: "لقطة قريبة لامرأة ترتدي ساعة ذكية", caption: "تعرض ساعة Wear OS المقترنة التنبيهات التي يستقبلها Chrome." },
    "guide-focus-desk": { alt: "شابة تتفقد هاتفها على مكتب في العمل بجانب حاسوب محمول", caption: "وضع التركيز «العمل» هو الذي ينسى الناس إضافة RestockWire إليه." },
    "guide-focus-phone-night": { alt: "امرأة تستخدم هاتفها في غرفة نوم مظلمة تضيئها الشاشة", caption: "وضع التركيز «النوم» يكتم التنبيهات ما لم يكن RestockWire ضمن قائمة المسموح بها." },
    "guide-watch-notification": { alt: "يد تنقر على ساعة ذكية في المعصم في الهواء الطلق", caption: "اقرأ اسم المتجر على معصمك، ثم احجز من iPhone." },
    "guide-watch-wrist": { alt: "لقطة قريبة بالأبيض والأسود لساعة ذكية تعرض إشعارات على المعصم", caption: "حين يكون iPhone مقفلًا، يصل تنبيه إعادة التوفر إلى الساعة." },
    "ranking-checkout": { alt: "زبون يدفع بهاتفه عند جهاز الدفع في متجر", caption: "في أسرع المتاجر، يجب أن يكتمل الحجز خلال ثوانٍ من التنبيه." },
    "ranking-queue": { alt: "أشخاص يصطفون أمام متجر مزدحم في شارع بالمدينة", caption: "نفاد المخزون السريع يتبع الطلب حول المتجر، لا حجم الشحنة." },
    "reports-delivery-boxes": { alt: "صناديق كرتونية مكدسة أمام أرصفة التحميل في مستودع", caption: "يصل المخزون إلى المتاجر في شحنات؛ ويحسب التقرير الأسبوعي ما يصل إلى رف الاستلام." },
    "reports-iphone-boxes": { alt: "iPhone جديد مع علبته وملحقات الشحن على طاولة خشبية", caption: "كل إعادة توفر في التقرير هي إعداد واحد يعود في متجر واحد." },
    "status-phone-check": { alt: "امرأة تنظر عن قرب إلى هاتفها في غرفة خافتة الإضاءة", caption: "انتظار فحص الاستلام: الدقائق التي تهمّ فيها معرفة حالة الاستعلام." },
    "status-store-counter": { alt: "يد تمسك هاتفًا تظهر عليه أيقونة تحميل", caption: "هكذا يبدو الاستعلام المتوقف؛ وصفحة الحالة تخبرك إن كان السبب Apple أم هاتفك." },
  },
};
