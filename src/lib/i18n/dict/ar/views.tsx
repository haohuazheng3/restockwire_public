/**
 * العربية: views — صفحات «الطراز × المكان»، وسجل التوفر، والخريطة المباشرة، وصفحة أوقات توفر iPhone Duo، وفهرس المتاجر.
 * `c: Country` بيانات إنجليزية: اسم الدولة من util.country، وكلمة المنطقة من util.regionNoun. السلاسل `name` `place` `region`
 * `city` `store` `config` تصل بالعربية؛ أما كائنات Store / Place فإنجليزية فتُسمّى عبر places. العبارات المسلّمة للوحدات
 * (inPlace / inCountry) تحمل حرف الجر («في دبي»، «في الإمارات»). لا تُترجم أسماء الطرازات والسعات وRestockWire والروابط.
 * فترات الفحص 15 ثانية و5 ثوانٍ فقط؛ ولا ذكر للاسترداد.
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { list, stamp, weekdays, price as priceIn, distance, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import { content } from "./content";
import {
  APPLE_STORES, CONFIGS, DAYS, L, N, SECONDS, STORES, STORES_G, TIMES, allWord, apple, count, country, durAr, inCountry,
  regionNoun, regionsCount, taxNoteAr, theStoresG,
} from "./util";

const cn = (c: Pick<Country, "cc">) => country(c.cc);
const inC = (c: Pick<Country, "cc">) => inCountry(c.cc);
const listAr = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
const secs = (n: number) => count(n, SECONDS);
/** "من 8 ثوانٍ إلى 15 دقيقة": what other trackers publish about themselves. */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `من ${count(Number(m[1]), SECONDS)} إلى ${N(Number(m[2]))} دقيقة` : OTHER_TRACKERS;
})();

/* ---------------------------------------------------------------- product × place names */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** "iPhone Duo 512GB سماء الليل". */
function productName(p: Product, short = false): string {
  const m = modelByKey(p.model)!;
  return `${short ? m.short : m.name}${p.storage ? ` ${p.storage}` : ""}${p.color ? ` ${colorLabel(p.color, L)}` : ""}`;
}
/** " (العين)" when the store's name does not already say its city. */
const cityNote = (s: Store) => { const city = cityLabel(s.country ?? "us", s.city, L); return appleStoreLabel(s, L).includes(city) ? "" : ` (${city})`; };
/** The place in Arabic: the country, an emirate, a city, «Apple دبي مول». */
function placeNameAr(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return country(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleStoreLabel(place.store!, L);
}

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = productName(product), short = productName(product, true);
  if (place.level === "country") {
    const w = inCountry(ccOf(place));
    return fitTitleW([...(inStock > 0 ? [`${name} ${w}: معروض الآن في ${N(inStock)} من متاجر Apple`] : []), `${name} ${w}: مخزون الاستلام مباشرةً`, `${short} ${w}: مخزون الاستلام`, `مخزون ${short} للاستلام`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    return fitTitleW([
      `${name} في ${a}: ${inStock > 0 ? "معروض للاستلام الآن" : "مخزون الاستلام وحالات التوفر"}`,
      `${short} في ${a}: ${inStock > 0 ? "متوفر الآن" : "المخزون"}`,
      `${short} في ${a}`,
      `${short} في ${storeLabel(s, L)}`,
      `${short} · ${storeLabel(s, L)}`,
    ]);
  }
  const w = placeNameAr(place);
  return fitTitleW([`${name} في ${w}: ${N(inStock)} من ${count(n, STORES_G)} تعرضه الآن`, `${name} في ${w}: مخزون الاستلام مباشرةً`, `${short} في ${w}: متوفر الآن؟`, `${short} في ${w}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = productName(product);
  const week = stats.week === 0 ? "لم يعد هذا الأسبوع" : `عاد ${count(stats.week, TIMES)} هذا الأسبوع`;
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    return fitTitleW([
      `${name} في ${a}${cityNote(s)}: ${inStock > 0 ? "معروض للاستلام عند آخر قراءة" : "غير معروض للاستلام الآن"}، و${week}. متى يتوفر في هذا المتجر، وكم يدوم، وتنبيه للمرة القادمة.`,
      `${name} في ${a}: ${inStock > 0 ? "متوفر الآن" : "غير متوفر الآن"}، و${week}. أوقات التوفر والتنبيهات.`,
    ], 155);
  }
  const cc = ccOf(place);
  const where = place.level === "country" ? inCountry(cc) : `في ${placeNameAr(place)}`;
  const n = place.stores.length;
  return fitTitleW([
    `${N(inStock)} من ${count(n, APPLE_STORES)} ${where} تعرض ${name} للاستلام في هذه الدقيقة، و${week}. متجرًا متجرًا، مع أوقات التوفر وتنبيه على الهاتف للمرة القادمة.`,
    `${name}: يتوفر الآن في ${N(inStock)} من ${count(n, APPLE_STORES)} ${where}، و${week}. مباشر لكل متجر، وأوقات التوفر، والتنبيهات.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = productName(product);
  const at = placeNameAr(place);
  const cc = ccOf(place);
  const nearestBit = nearest ? `؛ وأقرب متجر يعرضه هو ${apple(nearest.name)} في ${nearest.city}، على بُعد ${distance(L, cc, nearest.distance)}` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `هل يتوفر ${name} في ${at} الآن؟`,
      a: l && l.available.length > 0
        ? `نعم${product.parts.length > 1 ? `: ${listAr(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}` : ""}، معروض للاستلام عند آخر قراءة.`
        : `ليس عند آخر قراءة${nearestBit}.`,
    });
  } else {
    out.push({
      q: `أي متاجر Apple في ${at} تعرض ${name} الآن؟`,
      a: inStock.length === 0
        ? `لا شيء عند آخر قراءة${nearestBit}.`
        : `${count(inStock.length, STORES)} عند آخر قراءة: ${listAr(inStock.map((x) => appleStoreLabel(x.store, L)), 4)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `كم مرة يعود ${name} إلى المخزون في ${at}؟`,
    a: stats.month === 0 ? `لا توفر مؤكدًا في ${at} خلال آخر ${count(stats.days, DAYS)}.` : `تأكد التوفر ${count(stats.month, TIMES)} خلال آخر ${count(stats.days, DAYS)}، منها ${N(stats.week)} هذا الأسبوع${peak ? `، وتتركز حول الساعة ${peak.hour} بالتوقيت المحلي` : ""}.`,
  });
  if (stats.medianMs != null) out.push({ q: `كم يدوم توفر ${name} في ${at}؟`, a: `نحو ${durAr(stats.medianMs)} في الوسيط قبل أن ينفد من جديد.` });
  return out;
}

function priceLabelAr(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => priceIn(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)} – ${f(hi)}`;
}

/* ---------------------------------------------------------------- restock-times formats */

const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const df = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("ar-AE-u-nu-latn", { timeZone: "UTC", ...o });
/** "الثلاثاء، 3 نوفمبر" / "3 نوفمبر". */
const dateLabel = (ymd: string, weekday = true) => df({ month: "long", day: "numeric", ...(weekday ? { weekday: "long" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => df({ month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => (c.cc === "ae" ? `${stamp(L, iso, c.timeZone)} (توقيت الإمارات)` : stamp(L, iso, c.timeZone, true));
/** "9:00". */
const hourLabel = (h: number) => `${h % 24}:00`;
/** "9:00–11:00". */
const rangeLabel = (from: number, to: number) => `${hourLabel(from)}–${hourLabel(to)}`;
/** "من 9:00 إلى 11:00" inside a sentence. */
const between = (from: number, to: number) => `من ${hourLabel(from)} إلى ${hourLabel(to)}`;
const weekdayName = (d: number) => weekdays(L)[d];
const storeAr = (s: Store) => appleStoreLabel(s, L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "ولاية" : regionNoun(x.c));
const zero = "لا شيء في السجل بعد لنختبره به.";

/** The peak handed over in English ("10 AM", "Tuesday") → Arabic ("10:00", "الثلاثاء"). */
function peakAr(p: FaqContext["peak"]): FaqContext["peak"] {
  if (!p) return p;
  const m = p.hour.match(/^(\d{1,2}) (AM|PM)$/);
  const hour = m ? hourLabel((Number(m[1]) % 12) + (m[2] === "PM" ? 12 : 0)) : p.hour === "noon" ? "12:00" : p.hour === "midnight" ? "0:00" : p.hour;
  const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(p.day ?? "");
  return { ...p, hour, day: en >= 0 ? weekdayName(en) : p.day };
}

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? `في ${x.place.name}` : inC(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "مدينة" : "متجر") : rtRegion(x));
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => inC(c),
    liveMap: "خريطة المخزون",
    restockLog: "سجل العودات",
    alertMe: "فعّل التنبيهات",
    lastDays: (days: number) => <>{count(days, DAYS)}، يومًا بيوم</>,
    since: "2 نوفمبر 2026",
    sourcesWhere: (n: number, c: Country) => `${n === 1 ? "متجر Apple" : `جميع ${theStoresG(n)}`} ${inC(c)}`,
    checker: (c: Country) => `أداة فحص مخزون iPhone ${inC(c)}`,
    appleStoresIn: (c: Country) => `فروع Apple ${inC(c)}`,
    storesWithIt: "متاجر تعرضه",
    more: "عرض المزيد",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel: priceLabelAr,
    inPlace: (name: string) => `في ${name}`,
    h1Country: (model: string, c: Country) => `مخزون ${model} للاستلام من المتجر ${inC(c)}`,
    h1Place: (model: string, where: string) => `${model} ${where}`,
    inStockNow: "معروض الآن",
    yes: "نعم",
    no: "لا",
    pickup: "استلام",
    configurations: "خيارات",
    ofStores: (n: number) => `من أصل ${count(n, STORES_G)}`,
    restocks24h: "التوفر، 24 ساعة",
    restocksHint: (week: number, month: number, days: number) => `${N(week)} خلال 7 أيام · ${N(month)} خلال ${count(days, DAYS)}`,
    sellOuts: (days: number) => `حالات النفاد · ${count(days, DAYS)}`,
    stays: (ms: number) => `يبقى نحو ${durAr(ms)}`,
    noPairs: "لا حالات نفاد مقترنة بعد",
    lastRestock: "أحدث توفر",
    noneYet: "لا شيء حتى الآن",
    thisConfig: "الخيار المحدد",
    inDays: (days: number) => `على مدى ${count(days, DAYS)}`,
    notInStockNow: "غير معروض في هذه اللحظة",
    configsInStock: (n: number, of: number) => <span><b className="text-ink">{N(n)}</b> من {count(of, CONFIGS)} معروضة</span>,
    inStockAt: (n: number, of: number) => <span>معروض في <b className="text-ink">{N(n)}</b> من {count(of, STORES_G)}</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>آخر قراءة {live} · {price}{tax}</>,
    taxNote: (c: Country) => taxNoteAr(c),
    beforeTax: "دون ضريبة",
    buyOnApple: "اطلبه من apple.com",
    allStoresIn: (c: Country) => `دليل المتاجر ${inC(c)}`,
    everyIphoneHere: "كل أجهزة iPhone في هذا المكان",
    everyIphone: (where: string) => `أجهزة iPhone كلها ${where}`,
    panel: (model: string, where: string | null) => `${model}${where ? ` ${where}` : ""}: اختر الخيارات، ثم المتاجر`,
    unitConfigs: "الخيارات",
    unitStores: "المتاجر",
    otherConfigsHere: "خيارات أخرى في هذا المكان",
    byStorageColor: "السعة واللون",
    nearestStores: "المتاجر الأقرب",
    closest: (link: ReactNode, dist: string) => <>أقرب متجر يعرضه: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}، {city}</>,
    mostRecentlyInStock: "الأحدث عرضًا",
    storesWithItNow: "متاجر تعرضه الآن",
    storesIn: (where: string) => `متاجر Apple ${where}`,
    colStatus: "الوضع الآن",
    colConfigs: "خيارات معروضة",
    noStoreHasIt: "لا يعرضه أي متجر في هذه اللحظة.",
    noStoreHereHasIt: "لا يعرضه أي متجر في هذه المنطقة في هذه اللحظة.",
    moreStores: (n: number) => <>متاجر أخرى ({N(n)})، مرتبة حسب المنطقة أدناه.</>,
    byRegion: (c: Country) => `في كل ${regionNoun(c)}`,
    byCity: "مدينةً مدينة",
    nearbyStores: "متاجر على مقربة",
    latestChanges: "آخر المستجدات",
    nothingLogged: "السجل فارغ حتى الآن.",
    whenRestocks: "أوقات التوفر المعتادة",
    howFast: "كم يدوم التوفر",
    restocksByConfig: "أي الخيارات تتوفر",
    faqTitleCountry: (model: string, c: Country) => `${model} ${inC(c)}: أسئلة`,
    faqTitle: (model: string, where: string) => `${model} ${where}`,
    buySource: (model: string, c: Country) => `Apple: صفحة طلب ${model} (${cn(c)}، بالإنجليزية)`,
    nearby: "بالقرب",
    otherRegions: (c: Country) => `بقية ال${regionNoun(c, true)}`,
    elsewhereIn: (region: string) => `أبعد قليلًا في ${region}`,
    everyAppleStoreIn: (c: Country) => `متاجر Apple ${inC(c)}: القائمة الكاملة`,
    across: (model: string, c: Country) => `${model} في أنحاء ${cn(c)}`,
    itemList: (model: string, where: string) => `${model} ${where}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `في هذه اللحظة لا يعرض أي متجر Apple ${inC(c)} ${model} للاستلام، لذا فـ«الأقرب مني» يعني: أي متجر قريب يتوفر فيه أولًا. تنبيه على كل متجر يمكنك الوصول إليه يوصل الإشعار إلى هاتفك بعد ثوانٍ من عرض أحدها له.`
        : `${N(inStock)} من ${count(n, STORES_G)} ${inStock === 1 ? "يعرض" : "تعرض"} ${model} في هذه اللحظة: ${listAr(have.slice(0, 5).map((l) => `${l.store} في ${l.city} (${count(l.configs, CONFIGS)})`), 5)}.`,
    nearHead: (c: Country) => [`ال${regionNoun(c)}`, "متاجر تعرضه الآن"],
    nearCaption: (c: Country, model: string) => `مخزون ${model} للاستلام في كل ${regionNoun(c)}، عند آخر فحص`,
    nearMe: (_c: Country, model: string, alert: string) => `اضغط «بالقرب مني» في إعداد التنبيه في هذه الصفحة، فتُرتَّب كل المتاجر حسب بُعدها عن مكانك، بمسافة الطريق التقديرية بالكيلومتر، ولكلٍّ منها رابط للاتجاهات. [فعّل تنبيه ${model}](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => priceIn(L, c, v);
      return {
        price: { q: `كم يبلغ سعر ${model} ${inC(c)}؟`, a: `من ${money(low)} إلى ${money(high)} على apple.com (${taxNoteAr(c)})، ويتحدد السعر بالسعة.` },
        reserve: { q: `هل هناك طريقة لحجز ${model} للاستلام ${inC(c)}؟`, a: `ليس مسبقًا: حين يعرض متجرٌ خيارك، تطلبه من apple.com${c.cc === "ae" ? " (صفحة الشراء بالإنجليزية)" : ""} مع الاستلام من المتجر، فتحتفظ به Apple لك في موعدك.${inStock === 0 ? " ولا يعرضه أي متجر في هذه اللحظة، لذا فالتنبيه هو طريقك لتكون الأول." : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, n: number) => `سجل توفر iPhone المباشر ${inC(c)}: ${n === 1 ? "متجر Apple" : count(n, APPLE_STORES)}`,
    metaDescription: (c: Country, n: number) => `كل توفر مؤكد لأجهزة iPhone Duo و18 Pro وPro Max للاستلام من ${n === 1 ? "متجر Apple" : "متاجر Apple"} ${inC(c)}: الوقت والخيار الدقيق والخريطة.`,
    h1: (c: Country) => `توفر iPhone ${inC(c)} لحظة حدوثه`,
    summary: (day: number, week: number, model?: string, region?: string) => <>{day === 0 ? "لا توفر" : `توفر ${count(day, TIMES)}`} خلال آخر 24 ساعة · {N(week)} خلال 7 أيام{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. تظهر الأوقات بتوقيتك المحلي.</>,
    allModels: "الطرازات كلها",
    restocks: "عودات التوفر",
    withSoldOut: "التوفر والنفاد",
    regionLabel: (c: Country) => `ال${regionNoun(c)}`,
    allRegions: (c: Country) => `ال${regionNoun(c, true)} كلها`,
    filter: "تطبيق",
    page: (k: number) => <>صفحة {N(k)}</>,
    newer: "→ أحدث",
    older: "أقدم ←",
    getAlerts: "شغّل التنبيهات",
    byPlace: "التوفر، مكانًا مكانًا",
    byRegion: (c: Country) => `في كل ${regionNoun(c)}`,
    datasetName: (c: Country) => `حالات توفر iPhone للاستلام من المتجر في متاجر Apple ${inC(c)}`,
    datasetDescription: (c: Country) => `حالات التوفر والنفاد المؤكدة لأجهزة iPhone Duo وiPhone 18 Pro وiPhone 18 Pro Max للاستلام من ${c.cc === "us" ? "جميع متاجر Apple الـ269 في الولايات المتحدة" : `متاجر Apple ${inC(c)}`}: المتجر والخيار الدقيق والوقت. تُقرأ المتاجر كل 15 ثانية (وكل 5 ثوانٍ حيث يوجد تنبيه)، ولا يدخل التوفر السجل إلا بعد أن يعطي apple.com الإجابة نفسها مرتين.`,
    datasetMeasured: ["متجر Apple", "الطراز والسعة واللون", "لحظة العودة", "لحظة النفاد"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, n: number) => `خريطة مخزون iPhone Duo المباشرة: ${n === 1 ? "متجر Apple" : "كل متاجر Apple"} ${inC(c)}`,
    metaDescription: (c: Country, n: number) => `أين تُعرض أجهزة iPhone Duo و18 Pro وPro Max للاستلام من المتجر الآن: ${n === 1 ? "متجر Apple" : `جميع ${theStoresG(n)}`} ${inC(c)} على خريطة مباشرة واحدة، حسب السعة واللون.`,
    country: (c: Country) => ({ name: cn(c), inName: inC(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "جميع المتاجر",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? ` مرتبة حسب ال${regionNoun(c)} ثم المدينة` : cities > 1 ? " مرتبة حسب المدينة" : "";
      return `iPhone Duo معروض الآن في ${N(duo)} وPro Max في ${N(max)}: مخزون الاستلام المباشر في ${n === 1 ? "متجر Apple" : `جميع ${theStoresG(n)}`} ${inC(c)}${by}، ومعه 18 Pro.`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${count(n, APPLE_STORES)}، ${spread}${top.length ? `؛ وتتصدر ${top[0].name} بـ${N(top[0].count)}${top[1] ? `، تليها ${top[1].name} (${N(top[1].count)})` : ""}` : ""}.`,
    howMany: (c: Country) => <>كم متجرًا تملك Apple {inC(c)}؟</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `أي متاجر Apple ${inC(c)} تعرض iPhone Duo الآن؟`,
      a: have.length === 0 ? `لا شيء من ${allWord(n)} عند آخر فحص؛ تتغير هذه الصفحة والخريطة لحظة أن يعرضه أحدها، والتنبيه يصلك قبلهما.` : `${N(have.length)} من ${count(n, STORES_G)} عند آخر فحص: ${listAr(have.map(storeAr), 6)}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: peakAr(ctx.peak), omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `أسرع طريق للحصول عليه تنبيه على المتاجر التي تصل إليها: [فعّل تنبيه iPhone Duo](${alert}). يغطي التنبيه الواحد متجرًا واحدًا × خيارًا محددًا واحدًا، ويصل الخبر إلى هاتفك بعد ثوانٍ من عرض ذلك المتجر له.`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `في هذه اللحظة يُعرض iPhone Duo للاستلام في **${N(now.duo)}**، وiPhone 18 Pro Max في **${N(now.max)}**، و18 Pro في **${N(now.pro)}**، من أصل **${count(n, APPLE_STORES)}** ${inC(c)}، ${spread}. ${tax}`,
    crumb: "دليل المتاجر",
    panel: (c: Country) => `اختر هواتفك، ثم حدّد المتاجر ${inC(c)} التي تصل إليها`,
    matrixLabel: "المخزون في كل متجر",
    matrixH2: (c: Country) => <>المخزون متجرًا متجرًا {inC(c)}</>,
    matrixHint: "المعروض الآن / ما نتابعه، لكل طراز.",
    topCaption: (c: Country) => <>ال{regionNoun(c, true)} مرتبة حسب عدد متاجر Apple (من قائمة متاجر Apple للبيع بالتجزئة، كما نتابعها هنا)</>,
    regionHead: (c: Country) => `ال${regionNoun(c)}`,
    colStores: "عدد المتاجر",
    colCities: "مدنها",
    locationsBy: (c: Country) => `أين تقع متاجر Apple، حسب ال${regionNoun(c)}`,
    locationsIn: (c: Country) => `مواقع كل متاجر Apple ${inC(c)}`,
    storeCount: (n: number) => <>{count(n, STORES)}</>,
    storeCountAll: (n: number) => <>{count(n, STORES)}</>,
    whenRestock: (c: Country) => <>في أي ساعة يعود المخزون إلى المتاجر {inC(c)}؟</>,
    howFast: (c: Country) => <>كم يدوم التوفر {inC(c)}؟</>,
    faqTitle: (c: Country) => `متاجر Apple ${inC(c)}: أسئلة`,
    getApp: "ثبّت التطبيق",
    howItWorks: "كيف يعمل RestockWire (بالإنجليزية)",
    pricing: "الأسعار",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: hourLabel,
      range: rangeLabel,
      weekday: weekdayName,
      store: storeAr,
      storeWithPlace: (s: Store) => `${storeAr(s)} (${cityLabel(s.country ?? "us", s.city, L)})`,
    },
    title: (c: Country, place?: RestockTimesPlace) => `في أي ساعة تعيد Apple توفير iPhone Duo ${place ? `في ${place.name}` : inC(c)}؟`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "مدينة" : "متجر") : c.cc === "us" ? "الولاية" : c.regionNoun ? `ال${regionNoun(c)}` : "المتجر";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `تأكد توفر iPhone Duo ${count(t.n, TIMES)} في متاجر Apple ${rtW(x)} منذ ${since}: ${rtPct(w.share)} منها ${between(w.from, w.to)} بالتوقيت المحلي${t.sellout ? `، و${rtPct(t.sellout.within2min)} نفدت خلال دقيقتين` : ""}. جداول حسب الساعة واليوم و${region} والمتجر والخيار.`,
          `منذ ${since} عاد iPhone Duo ${count(t.n, TIMES)} إلى متاجر Apple ${rtW(x)} بتأكيد مزدوج، ${rtPct(w.share)} منها ${between(w.from, w.to)} بتوقيت المتجر. الجداول: الساعة، اليوم، ${region}، الخيار.`,
          `متى يعود iPhone Duo ${rtW(x)}؟ عاد ${count(t.n, TIMES)} منذ ${since}؛ التوزيع حسب الساعة واليوم و${region} والخيار.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `تأكد توفر iPhone Duo ${count(t.n, TIMES)} في متاجر Apple ${rtW(x)} منذ ${since}، من فحوص كل ${secs(SPEED.checkSec)}: حسب الساعة المحلية، يومًا بيوم، وحسب ${region} والمتجر والخيار، وكم دام كل توفر.`,
            `ساعات عودة iPhone Duo ${rtW(x)}: عاد ${count(t.n, TIMES)} بتأكيد مزدوج منذ ${since}، مفصّلًا حسب الساعة واليوم و${region} والخيار.`,
          ], 158)
          : `أوقات توفر iPhone Duo في متاجر Apple ${rtW(x)}، ساعةً بساعة ويومًا بيوم، حسب المتجر والخيار، من قراءة RestockWire لكل متجر كل ${secs(SPEED.checkSec)} منذ ${longDate(t.since)}.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `في أي ساعة تعيد Apple توفير iPhone Duo ${rtW(x)}؟`
      : x.t.n > 0
        ? `في أي ساعة تعيد Apple توفير iPhone Duo ${rtW(x)}؟ ${x.pattern ? `غالبًا ${between(x.w.from, x.w.to)} بالتوقيت المحلي` : "فحوصنا ساعةً بساعة"}`
        : `هل تعيد Apple توفير iPhone Duo ${rtW(x)}؟ ليس حتى الآن، وهذا ما نراقبه`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtW(x);
      return t.unknown ? (
        <>سجل التوفر غير متاح للحظات. ما زالت المتاجر {where} تُفحص كل {secs(SPEED.checkSec)}، وتعود الأرقام عند التحميل التالي للصفحة.</>
      ) : t.n > 0 && pattern ? (
        <>
          <b className="text-ink">{rtPct(w.share)} من حالات توفر iPhone Duo الـ{N(t.n)}</b> التي أكدها RestockWire في {one ? "متجر Apple" : "متاجر Apple"} {where} منذ {longDate(t.since)} وقعت <b className="text-ink">{between(w.from, w.to)}</b> بالتوقيت المحلي للمتجر{x.sell ? <>؛ والتوفر المعتاد نفد خلال نحو {secs(Math.round(x.sell.medianSec / 5) * 5)}</> : null}. <b className="text-ink">وما زال التوفر مستمرًا</b>{tracked > 1 ? <>: شهد {N(t.days)} من الأيام الـ{N(tracked)} المتتبَّعة توفرًا</> : <> (يوم واحد من التتبع حتى الآن)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">نعم.</b> <b className="text-ink">تأكد توفر iPhone Duo {count(t.n, TIMES)} منذ {longDate(t.since)}</b> في {one ? "متجر Apple" : "متاجر Apple"} {where}{tracked > 1 ? <>، في {N(t.days)} من الأيام الـ{N(tracked)}</> : <> (يوم واحد من التتبع حتى الآن)</>}؛ ونذكر الساعة المعتادة حين تبلغ حالات التوفر {N(PATTERN_MIN)} على {count(PATTERN_MIN_DAYS, DAYS)} منفصلة.
        </>
      ) : (
        <>
          <b className="text-ink">ليس حتى الآن.</b> يقرأ RestockWire {one ? "متجر Apple" : `جميع ${theStoresG(x.stores)}`} {where} كل {secs(SPEED.checkSec)} منذ {longDate(t.since)} دون أن يتأكد أي توفر لـiPhone Duo للاستلام.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `عودات مؤكدة منذ ${dateLabel(x.t.since, false)}`,
      window: (x: RestockTimesView) => `${between(x.w.from, x.w.to)} بتوقيت المتجر`,
      days: "أيام شهدت توفرًا",
      now: (one: boolean): string => (one ? "متجر يعرضه للاستلام في هذه اللحظة" : "متاجر تعرضه للاستلام في هذه اللحظة"),
      today: (x: RestockTimesView, today: DayRow) => `اليوم حتى الآن (${dateLabel(today.date)})${x.one ? "" : `، في ${count(today.stores, STORES_G)}`}`,
      weekday: "أكثر أيام الأسبوع نشاطًا حتى الآن",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>آخرها: <b className="text-ink">{latest.config}</b>{x.one ? null : <> في <Link href={storePath(latest.store)} className="underline underline-offset-2">{storeAr(latest.store)}</Link></>}، {localStamp(latest.at, latest.store, L)} بتوقيت المتجر</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>يوم <b className="text-ink">{weekdayName(x.t.peakWeekday)}</b> يحمل أكثر التوفر</> }] : []),
      { text: <>لا يوجد <b className="text-ink">جدول رسمي للتوفر</b>؛ هذه الأرقام من فحوصنا المؤكدة، وتتحدث كل خمس دقائق تقريبًا</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{N(x.duoNow)} من {count(x.stores, STORES_G)}</b> {x.one ? "يعرضه" : "تعرضه"} للاستلام في هذه اللحظة</> },
      { text: <>أول توفر مؤكد يفتتح كل جدول أدناه</>, step: true },
      { text: <>لأنماط الساعة ويوم الأسبوع من أكبر عيّنة، راجع <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">الصفحة الأمريكية (بالإنجليزية)</Link></>, step: true },
    ],
    setUpAlert: "فعّل تنبيهات iPhone Duo",
    logLive: "سجل التوفر المباشر",
    onThisPage: "الأقسام",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "الساعة",
      "day-by-day": "الأيام",
      where: `كل ${rtU(x)}`,
      configuration: "الخيارات",
      "how-long": "سرعة النفاد",
      unavailable: "«غير متوفر»",
      reddit: "ادعاءات Reddit",
      method: "المنهجية",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `في أي ساعة يعود iPhone Duo ${rtW(x)}؟`,
      "day-by-day": `في أي أيام توفر iPhone Duo ${rtW(x)}؟`,
      where: `أين يتوفر iPhone Duo أكثر من غيره ${rtW(x)}؟`,
      configuration: `أي سعة ولون من iPhone Duo يتوفران أكثر ${rtW(x)}؟`,
      "how-long": `كم ثانية يدوم توفر iPhone Duo ${rtW(x)}؟`,
      unavailable: "لماذا يعرض apple.com «غير متوفر حاليًا» في كل متجر؟",
      reddit: "نظريات Reddit عن توفر iPhone Duo، في مواجهة السجل",
      method: "ما الذي يُحتسب توفرًا في RestockWire؟",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
      const fast = secs(SPEED.fastSec);
      return [
        { q: `متى تعيد Apple توفير iPhone Duo ${where}؟`, a: t.n > 0 && pattern
          ? `حملت الفترة ${between(w.from, w.to)} بالتوقيت المحلي للمتجر ${rtPct(w.share)} من حالات التوفر المؤكدة الـ${N(t.n)} منذ ${longDate(t.since)}، وحملت الفترة بين 8:00 و12:00 نسبة ${rtPct(hourShare(t.byHour, 8, 12))}. لا يوجد جدول رسمي؛ هذا هو النمط الذي يرصده RestockWire، ويتحدث كل خمس دقائق تقريبًا.`
          : `في سجل RestockWire ${where} ${t.n === 0 ? "لا توفر مؤكدًا" : `توفر مؤكد ${count(t.n, TIMES)}`} منذ ${longDate(t.since)}${t.days ? ` على مدى ${count(t.days, DAYS)}` : ""}، ولا تعلن Apple أي جدول. وحين تبلغ حالات التوفر ${N(PATTERN_MIN)} على ${count(PATTERN_MIN_DAYS, DAYS)} منفصلة، تذكر هذه الصفحة الساعة المعتادة من تلقاء نفسها.` },
        { q: `هل يتوفر iPhone Duo في عطلة نهاية الأسبوع${us ? "" : ` ${where}`}؟`, a: t.n > 0
          ? `${weekend > 0 ? "نعم" : "ليس حتى الآن"}: وقع ${N(weekend)} من حالات التوفر الـ${N(t.n)} (${rtPct(weekend / t.n)}) يوم سبت أو أحد. ${t.peakWeekday != null ? `أكثر أيام الأسبوع نشاطًا حتى الآن هو ${weekdayName(t.peakWeekday)}.` : `لا نذكر أكثر الأيام نشاطًا إلا حين تغطي البيانات ${count(WEEKDAY_MIN_SPAN, DAYS)}؛ وهي تغطي ${count(tracked, DAYS)} حتى الآن.`}`
          : `لا بيانات لعطلة نهاية الأسبوع ${where} حتى الآن؛ ويكبر جدول الأيام في هذه الصفحة مع كل توفر مؤكد.` },
        { q: "متى أبدأ مراقبة apple.com؟", a: t.n > 0 && pattern
          ? `يدويًا، افتح apple.com مع اختيار الاستلام من الساعة ${hourLabel(w.from)} بالتوقيت المحلي؛ فهذه النافذة من ساعتين تضم ${rtPct(w.share)} من حالات التوفر. ${sell ? `والتوفر المعتاد نفد خلال ${secs(sell.medianSec)} في الوسيط` : "والتوفر المعتاد يدوم نحو دقيقة"}، ولهذا يتفوق تنبيه يُفحص كل ${fast} ([كيف تعمل التنبيهات](/iphone-duo-restock-alerts)، بالإنجليزية) على أي قدر من تحديث الصفحة.`
          : `إلى أن يتشكل النمط ${where}، يمكن للتنبيه أن يراقب عنك: تنتقل المتاجر التي تختارها إلى فحص كل ${fast}، ليلًا ونهارًا ([كيف تعمل التنبيهات](/iphone-duo-restock-alerts)، بالإنجليزية).` },
        { q: "لماذا يظهر iPhone Duo «غير متوفر» في كل متجر Apple؟", a: sell
          ? `لأن التوفر قصير: من حالات التوفر التي نفدت وقسناها ${where} (وعددها ${N(sell.n)})، اختفت ${rtPct(sell.within2min)} خلال دقيقتين و${rtPct(sell.within20min)} خلال 20 دقيقة. وفي هذه اللحظة يعرضه ${N(x.duoNow)} من ${count(x.stores, STORES_G)}، لذا يقول apple.com معظم الوقت «غير متوفر» وهو صادق، حتى في أيام شهدت عشرات حالات التوفر ([ماذا تعني «غير متوفر»](/apple-store-pickup-explained)، بالإنجليزية).`
          : `يظهر مخزون الاستلام لدقائق في كل مرة؛ وفي هذه اللحظة يعرضه ${N(x.duoNow)} من ${count(x.stores, STORES_G)} ${where} ([ماذا تعني «غير متوفر»](/apple-store-pickup-explained)، بالإنجليزية).` },
        { q: "هل يمكن أن يصلني إشعار حين يعود iPhone Duo إلى متجر Apple الذي أريده؟", a: `نعم: تنبيه على ذلك المتجر بالسعة واللون اللذين تريدهما ينقله إلى فحص كل ${fast}، ويصل الخبر إلى هاتفك بعد نحو ${secs(SPEED.alertSec)} من تأكيد التوفر ([فعّل تنبيهًا](${x.alert})؛ [طريقة العمل](/how-restock-alerts-work)، بالإنجليزية).` },
      ];
    },
    sources: {
      applePickup: "Apple: مساعدة التوصيل والاستلام (كيف يعمل توفر الاستلام، بالإنجليزية)",
      newsroom: "Apple Newsroom، 23 أكتوبر 2026 (بالإنجليزية): iPhone Duo يصل إلى متاجر Apple في أنحاء العالم",
      macRumors: "MacRumors: عودة نظام الاستلام من متاجر Apple لـiPhone Duo إلى العمل في الولايات المتحدة وكندا (24 أكتوبر 2026، بالإنجليزية)",
      reports: (tracker: string) => `${tracker}: تقارير توفر iPhone Duo في أسبوع الإطلاق (ملاحظاتهم الخاصة، معروضة على حدة ولا تُحتسب أبدًا)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `أوقات توفر iPhone Duo للاستلام من المتجر، متاجر Apple ${rtW(x)}`,
      description: `حالات توفر iPhone Duo المؤكدة للاستلام من متاجر Apple ${rtW(x)} منذ ${x.t.since} (المتجر والخيار والوقت)، من قراءة RestockWire لكل متجر كل ${secs(SPEED.checkSec)}؛ مجمّعة حسب الساعة المحلية واليوم ${x.place?.kind === "city" ? "" : `وال${rtU(x)} `}والمتجر والخيار.`,
      spatial: `فروع Apple ${rtW(x)}`,
      measured: ["لحظة العودة (بتوقيت المتجر)", "متجر Apple", "سعة iPhone Duo ولونه", "ثوانٍ حتى النفاد"],
      size: `عودة مؤكدة ${count(x.t.n, TIMES)} عبر ${count(x.t.stores, STORES_G)}`,
    }),
    crumb: "ساعات توفر iPhone Duo",

    // ---- time of day
    timeLead: (x: RestockTimesView) => <b>الفترة {between(x.w.from, x.w.to)} بالتوقيت المحلي للمتجر تضم {rtPct(x.w.share)} من حالات التوفر الـ{N(x.t.n)}؛ والفترة بين 8:00 و12:00 تضم {rtPct(hourShare(x.t.byHour, 8, 12))}.</b>,
    busiestHour: (c: number) => `توفر ${count(c, TIMES)} في أكثر ساعة نشاطًا`,
    morning: "من 8:00 إلى 12:00",
    evening: "بعد 17:00، فالمساء ما زال يُحتسب",
    night: "من منتصف الليل إلى 6:00",
    tooFew: (x: RestockTimesView) => <b>الأيام لا تكفي لتحديد ساعة{x.t.n > 0 ? "" : " بعد"}: {x.t.n > 0 ? `تأكد التوفر ${count(x.t.n, TIMES)} على مدى ${count(x.t.days, DAYS)}` : "لا توفر مؤكدًا"} منذ {longDate(x.t.since)}.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>تحديد الساعة المعتادة يتطلب <b className="text-ink">{N(PATTERN_MIN)} حالات توفر على {count(PATTERN_MIN_DAYS, DAYS)} منفصلة</b></> },
      { text: <>دفعة من عشر حالات توفر حدث واحد، لا عادة</>, no: true },
      { text: <>كل يوم جديد من البيانات يحدّث هذه الصفحة تلقائيًا</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `iPhone Duo ${rtW(x)} ساعةً بساعة بتوقيت كل متجر، من ${dateLabel(x.t.since, false)} إلى اليوم؛ المجموع ${N(x.t.n)}`,
    hourHead: ["ساعة المتجر", "العودات", "الحصة"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>ذروة الصباح <b className="text-ink">لا علاقة لها بموعد الافتتاح</b>{x.us ? " (معظم متاجر Apple الأمريكية تفتح الساعة 10:00)" : ""}</> },
      { text: <>تطرح Apple مخزون الاستلام <b className="text-ink">أونلاين</b>، قبل أن تُفتح الأبواب</> },
      { text: <>تراقب يدويًا؟ غطِّ <b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b> صباح أيام العمل</>, step: true },
      { text: <><Link href={x.alert}>التنبيه</Link> يغطي <b className="text-ink">الساعات الـ22 الباقية</b>، حين لا ينظر أحد غيره</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>كل صفحة متجر ترسم ساعاتها الخاصة بتوقيتها (<Link href={x.storesHref}>{x.us ? "متاجر Apple حسب الولاية" : `المتاجر ${rtW(x)}`}</Link>)، فتكتشف المتجر الذي يتوفر فيه المخزون الساعة 8:00 بينما ذروة منطقته الساعة 9:00</>, step: true }],

    // ---- day by day
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>تأكد التوفر {count(t.n, TIMES)}{one ? "" : ` في ${count(t.stores, STORES_G)}`} في اليوم الوحيد المتتبَّع حتى الآن، {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `كل الأيام المتتبَّعة (${N(t.days)})` : `${N(t.days)} من الأيام الـ${N(tracked)} منذ ${longDate(t.since)}`} شهدت توفرًا مؤكدًا واحدًا على الأقل{t.peakWeekday != null ? `؛ ويتصدر ${weekdayName(t.peakWeekday)} أيام الأسبوع` : ""}.</b>
      ) : (
        <b>صفر عودات مؤكدة {rtW(x)} منذ {longDate(t.since)}.</b>
      );
    },
    daysTracked: "أيام متتبَّعة شهدت توفرًا",
    busiestDay: (x: RestockTimesView, day: DayRow) => `في أكبر يوم، ${dateLabel(day.date)}${x.one ? "" : `، في ${count(day.stores, STORES_G)}`}`,
    busiestDayNone: "أكبر يوم",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `متاجر توفر فيها المخزون خلال نصف ساعة واحدة، ${zoneStamp(drop.at, x.c)} (${count(drop.restocks, CONFIGS)})، في طرح على مستوى الدولة`,
    weekend: (x: RestockTimesView) => `في عطلة نهاية الأسبوع (${x.weekend === 0 ? "لا شيء" : count(x.weekend, TIMES)})`,
    dayCaption: (x: RestockTimesView) => `توفر iPhone Duo اليومي ${rtW(x)}${x.t.reports.length ? "؛ والصفوف المعلَّمة «مُبلَّغ عنه» مصدرها ملاحظات منشورة لمتتبعات أخرى قبل أن يبدأ تتبعنا، وهي مدرجة للتسلسل الزمني فقط" : ""}`,
    dayHead: { date: "اليوم", restocks: "العودات", stores: "المتاجر المعنية", busiest: "ساعة الذروة", source: "المرجع" },
    soFar: " · اليوم لم ينتهِ",
    reportedBy: (names: string[]) => <>بحسب {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: يوم الإطلاق، وشُحنت أولى الوحدات لطلبات الأونلاين</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: عاد الاستلام من المتجر{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <>الصفوف <b className="text-ink">المُبلَّغ عنها</b> ملاحظات من {x.reportNames.join(" و")} في أسبوع الإطلاق، مستبعدة من كل عدّ</> }
        : { text: <>يبدأ سجل RestockWire لكل متجر {rtW(x)} في <b className="text-ink">{longDate(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>تحديد أكثر أيام الأسبوع نشاطًا يحتاج بيانات <b className="text-ink">{count(WEEKDAY_MIN_SPAN, DAYS)}</b> (لدينا {count(x.tracked, DAYS)})</>, no: true }] : []),
      { text: <>راقب عمود <b className="text-ink">المتاجر</b>: التوفر الموزع على متاجر أكثر يمنحك فرصًا أفضل</>, step: true },
    ],

    // ---- where
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: توفر {count(hit[0].restocks, TIMES)} في {N(hit[0].stores)} من {count(hit[0].storesTotal, STORES_G)} فيها منذ {dateLabel(x.t.since, false)}{hit[1] ? <>، تليها {hit[1].name} ({N(hit[1].restocks)})</> : null}{hit[2] ? <> ثم {hit[2].name} ({N(hit[2].restocks)})</> : null}؛ {hit.length === total ? `وشهدت كل ال${x.us ? "ولايات" : regionNoun(x.c, true)} توفرًا` : `وشهدت ${N(hit.length)} من ${x.us ? `${N(total)} ولاية` : regionsCount(x.c, total)} توفرًا، و${N(total - hit.length)} لم تشهد أي توفر بعد`}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>لم تشهد أي {rtU(x)} {rtW(x)} توفرًا مؤكدًا حتى الآن؛ وأول توفر يفتتح الجدول.</b>,
    regionCaption: (x: RestockTimesView) => `عودات iPhone Duo المؤكدة ${rtW(x)} موزعة على كل ${rtU(x)}، من ${dateLabel(x.t.since, false)} إلى اليوم`,
    regionHead: (x: RestockTimesView) => [`ال${rtU(x)}`, "التوفر", "متاجر شهدت توفرًا", "أحدث توفر (بالتوقيت المحلي)"],
    ofN: (a: number, b: number) => <>{N(a)}/{N(b)}</>,
    storesCaption: (x: RestockTimesView) => `أكثر المتاجر توفرًا لـiPhone Duo ${rtW(x)}، من ${dateLabel(x.t.since, false)} حتى اليوم`,
    storesHead: ["المتجر", "التوفر", "الأيام", "الساعة المعتادة", "الأحدث (بالتوقيت المحلي)"],
    swaps: (x: RestockTimesView) => [
      { no: "مطاردة المتجر الأول في القائمة مهما بعُد", yes: `متجران أو ثلاثة تصل إليها خلال ساعة من ${x.pattern ? `الساعة ${hourLabel(x.w.from)}` : "الصباح"}`, why: "توفر بعيد عن متناولك لا ينفعك، وحتى أكثر المتاجر نشاطًا يظهر «غير متوفر» طوال اليوم إلا بضع دقائق." },
      { no: "الرهان على متجر واحد", yes: "تنبيه على كلٍّ منها، ثم اذهب إلى الذي يصلك إشعاره", why: "استخدم جدول الأعداد فقط لتقرر إلى أي متاجرك تتجه أولًا." },
    ],
    nearMe: "مخزون Duo قربي، مباشرةً",

    // ---- configuration
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>يتصدر {top.label} بـ{N(top.restocks)} من حالات التوفر الـ{N(x.t.n)} ({rtPct(top.restocks / x.t.n)}){rarest ? `؛ ويأتي ${rarest.label} في الأخير بتوفر ${count(rarest.restocks, TIMES)}` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config} يتوفر أكثر من أي خيار آخر`,
    versus: (a: string, bCount: number, b: string) => `عودات ${a}، و${N(bCount)} فقط لـ${b}`,
    restocksOf: (a: string) => `عودات ${a}`,
    byStorage: "لكل سعة",
    byColour: "لكل لون",
    configNone: (x: RestockTimesView) => <b>لم يشهد أي خيار {rtW(x)} توفرًا مؤكدًا{x.t.n > 0 ? "" : " بعد"}؛ والخيارات الـ{N(x.configs)} كلها مدرجة ليجد أول توفر صفه جاهزًا.</b>,
    configCaption: (x: RestockTimesView) => `عودات iPhone Duo المؤكدة ${rtW(x)}، خيارًا خيارًا، من ${dateLabel(x.t.since, false)} إلى اليوم`,
    configHead: ["الخيار", "التوفر", "النسبة", "أحدث توفر (بالتوقيت المحلي)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>اختيار الخيار أهم <b className="text-ink">من اختيار المتجر</b></> },
      x.storageRatio != null
        ? { text: <>اقبل بالسعة الأكثر توفرًا، فتكون فرصتك نحو <b className="text-ink">{x.storageRatio}×</b> فرصة السعة التالية</> }
        : { text: <>اقبل بالسعة الأكثر توفرًا، فترتفع فرصتك <b className="text-ink">بشدة</b></> },
      { text: <>سعة <b className="text-ink">2TB</b> اطلبها للتوصيل وانتظرها</>, no: true },
      { text: <>الأسعار والمخزون المباشر: <Link href="/iphone-duo-most-restocked-stores">أي iPhone Duo يتوفر أكثر؟ (بالإنجليزية)</Link></>, step: true },
    ],

    // ---- how long
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{secs(sell.medianSec)}: الوسيط لعمر حالات التوفر التي نفدت {rtW(x)} (وعددها {N(sell.n)})؛ اختفت {rtPct(sell.within2min)} خلال دقيقتين و{rtPct(sell.within20min)} خلال 20 دقيقة.</b>,
    secUnit: "ث",
    medianListing: "وسيط مدة العرض، من الظهور حتى الاختفاء",
    within2: "اختفى خلال دقيقتين",
    within20: "اختفى خلال 20 دقيقة",
    fastest: "أسرع نفاد مسجّل",
    howLongNone: (x: RestockTimesView) => <b>حالات النفاد {rtW(x)} لا تكفي للقياس{x.t.n > 0 ? "" : " بعد"}؛ تبدأ هذه الأرقام من عشر حالات، والصفحة الأمريكية فيها المجموعة الكاملة.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>دقيقتان نافذة تناسب <b className="text-ink">التنبيه</b>، لا الضغط على تحديث apple.com</> },
      { text: <>كل رقم آخر في هذه الصفحة ينبع من هذا الرقم</> },
      { text: <>كل توفر وكم ثانية دام، حسب الخيار وال{rtU(x)}: <Link href="/how-fast-does-iphone-duo-sell-out">بأي سرعة ينفد توفر iPhone Duo؟ (بالإنجليزية)</Link></>, step: true },
    ],
    measured: "كل رقم يمتد من الفحص الذي وجد الخيار معروضًا أول مرة إلى الفحص الذي وجده قد اختفى، فهو حدٌّ أعلى: الأعمار الحقيقية أقصر.",

    // ---- unavailable
    unavailableLead: (x: RestockTimesView) => <b>التوفر ومضة لا حالة: {x.one ? "متجر واحد" : count(x.stores, STORES)} × {count(x.configs, CONFIGS)} يعني {N(x.pairs)} عرضًا ممكنًا {rtW(x)}، وفي هذه اللحظة {x.duoNow === 1 ? "يعرض متجر واحد" : `تعرض ${count(x.duoNow, STORES)}`} أي iPhone Duo على الإطلاق.</b>,
    pairs: "عروض «متجر × خيار» ممكنة",
    listingNow: "تعرض iPhone Duo للاستلام الآن",
    goneIn2: "من حالات التوفر انتهت خلال دقيقتين",
    last24: "توفر مؤكد، آخر 24 ساعة",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>خلال 24 ساعة: <b className="text-ink">عاد المخزون {count(x.recent.restocks, TIMES)}</b> في {count(x.recent.stores, STORES_G)} {rtW(x)}</> }
        : today > 0
          ? { text: <>منذ بداية اليوم: <b className="text-ink">عاد المخزون {count(today, TIMES)}</b> {rtW(x)}</> }
          : { text: <>جدول الأيام أعلاه يذكر حالات التوفر التي حدثت فعلًا</> },
      { text: <>كلٌّ منها بقي على apple.com <b className="text-ink">دقيقة أو دقيقتين</b></> },
      { text: <>رؤية «غير متوفر في كل مكان» في اليوم الرابع أو الرابع عشر <b className="text-ink">لا</b> تعني أن Apple توقفت</>, no: true },
    ],
    unavailableLinks: { explained: "«غير متوفر حاليًا للاستلام»: شرح (بالإنجليزية)", howToGet: "الحصول على iPhone Duo خطوة بخطوة (بالإنجليزية)" },

    // ---- reddit
    redditLead: (x: RestockTimesView) => <b>كثير من النصائح في <a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> و<a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> صادق، لكنه مبني على متجر واحد ويتقادم في اليوم التالي؛ وفيما يلي أكثر أربعة ادعاءات تكرارًا، مختبَرة على حالات التوفر المؤكدة الـ{N(x.t.n)} {rtW(x)}.</b>,
    redditCaption: "ادعاءات متكررة على Reddit عن توفر iPhone Duo، مختبَرة على حالات التوفر التي أكدها RestockWire",
    redditHead: ["الادعاء", "ماذا يُظهر السجل"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "«المتاجر يتوفر فيها المخزون ليلًا — افحص الساعة 3 فجرًا.»", answer: t.n > 0 ? <>{rtPct(hourShare(t.byHour, 0, 6))} من حالات التوفر وقعت بين منتصف الليل و6:00 بالتوقيت المحلي، مقابل {rtPct(w.share)} {between(w.from, w.to)}.</> : zero },
        { claim: "«Apple لا توفّر إلا في يوم واحد من الأسبوع.»", answer: t.n > 0 ? (t.peakWeekday != null ? <>{weekdayName(t.peakWeekday)} يتصدر حتى الآن ({N(t.byWeekday[t.peakWeekday])} من {N(t.n)})، ومع ذلك وقع التوفر في {N(t.days)} من الأيام الـ{N(tracked)} المتتبَّعة.</> : <>وقع التوفر في {N(t.days)} من الأيام الـ{N(tracked)} المتتبَّعة{t.days === tracked ? "، ولا يوم واحد بدونه" : ""}؛ ونذكر أكثر أيام الأسبوع نشاطًا بعد بيانات {count(WEEKDAY_MIN_SPAN, DAYS)}.</>) : zero },
        { claim: "«اتصل بالمتجر واسأل متى تصل الشاحنة.»", answer: "لا يوجد جدول توفر منشور؛ مخزون الاستلام يُطرح أونلاين، ويراه المتجر في اللحظة نفسها التي يراه فيها الجميع." },
        { claim: "«إذا قال غير متوفر، فقد نفد نهائيًا.»", answer: recent.restocks > 0 ? <>حالات التوفر المؤكدة خلال آخر 24 ساعة ({N(recent.restocks)} في {count(recent.stores, STORES_G)}) تثبت العكس، وكلٌّ منها عاد إلى «غير متوفر» خلال دقائق.</> : t.n > 0 ? <>حالات التوفر المؤكدة الـ{N(t.n)} منذ {dateLabel(t.since, false)} تثبت العكس، وكلٌّ منها عاد إلى «غير متوفر» خلال دقائق.</> : zero },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>الشائعات تملأ الفراغ حين <b className="text-ink">لا توجد بيانات</b>؛ وهذه الصفحة هي البيانات، وقراءتها مجانية</> },
      { text: <>يصيب Reddit في أمر واحد: <b className="text-ink">التحضير للدفع</b>، بتسجيل الدخول وتجهيز Apple Pay (<Link href="/iphone-duo-restock-checkout-guide">نسختنا في 20 ثانية، بالإنجليزية</Link>)</> },
    ],

    // ---- method
    methodLead: <b>التوفر هو ظهور خيار للاستلام من المتجر على apple.com في متجر لم يكن يعرضه، يؤكده فحصان متطابقان.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>المتاجر التي عليها تنبيه: كل <b className="text-ink">{secs(SPEED.fastSec)}</b>؛ و{x.one ? "متجر Apple" : "كل متجر Apple"} {rtW(x)}: كل <b className="text-ink">{secs(SPEED.checkSec)}</b></> },
      { text: <>الفواصل المنشورة للمتتبعات الأخرى: <b className="text-ink">{others}</b>؛ ونقارن بما ينشرونه فقط</> },
      { text: <>أول «متوفر» يُعاد فحصه <b className="text-ink">بعد نحو ثانية</b> قبل أن يُحتسب</> },
      { text: <>النفاد لا يُعتمد قبل <b className="text-ink">جولة الفحص التالية</b></> },
      { text: <>أول رؤية لمتجر، أو طلب فاشل، أو انتهاء مهلة: <b className="text-ink">لا</b> يُحتسب أبدًا توفرًا ولا «نفادًا»</>, no: true },
      { text: <>كل الساعات والتواريخ <b className="text-ink">بالتوقيت المحلي</b> لكل متجر؛ و«الموجة» هي نصف الساعة نفسه عبر المناطق الزمنية</> },
      { text: <>تقارير المتتبعات الأخرى{x.t.reports.length ? ` (${x.reportNames.join("، ")})` : ""} لها صفوف خاصة معلَّمة، و<b className="text-ink">تُستبعد من كل مجموع</b></> },
      { text: <>تتحدث هذه الجداول كل خمس دقائق تقريبًا؛ أما <Link href={x.logHref}>سجل التوفر</Link> فمباشر</>, step: true },
    ],
    quote: "استشهد بهذه الصفحة: اقتبس أي رقم هنا مع رابط إليها. RestockWire مستقل عن Apple، ويقرأ توفر الاستلام نفسه الذي يراه أي شخص على apple.com، لكن بتكرار أكبر بكثير.",
    alertIn: (x: RestockTimesView) => <>فعّل تنبيهات iPhone Duo{x.one ? "" : ` ${rtW(x)}`}</>,

    // ---- related, FAQ, sources
    related: "أسئلة أخرى عن iPhone Duo",
    sameData: "مبنية على السجل نفسه (بالإنجليزية)",
    questions: {
      sellOut: "كم يدوم التوفر؟",
      alerts: "أسرع طريقة لمعرفة التوفر",
      howToGet: "الحصول عليه عمليًا",
      whichConfig: "الخيار الأكثر توفرًا",
      nearMe: "المخزون المباشر قربي",
      unavailable: "«غير متوفر»: شرح",
    },
    otherCountries: (us: boolean): string => (us ? "هذه الصفحة لدول أخرى" : "دول أخرى"),
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "صفحات المدن",
      storesLive: (x: RestockTimesView) => `متاجر Apple ${rtW(x)}: المخزون المباشر`,
      countryPage: (c: Country) => `ساعات عودة iPhone Duo ${inC(c)}، كل المتاجر`,
      sourcesWhere: (x: RestockTimesView) => `كل متاجر Apple ${rtW(x)} (${x.stores})`,
    },
    faqTitle: "أسئلة شائعة",
  },
};
