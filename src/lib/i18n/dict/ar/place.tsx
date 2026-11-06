/**
 * العربية: place — عناوين صفحات الإمارات (/ar-ae/…) ومقدّماتها بأسلوب «الجواب أولًا»، وأقسام الكلمات المفتاحية، والسعر
 * والضريبة، والأسئلة الشائعة، مبنية من البيانات الحية. لا يلزم أن تصحّ إلا للإمارات (ae)، وتبقى معقولة لغيرها.
 * كلمات البحث (Google Ads، الإمارات، بالعربية، شهريًا): ايفون 18 برو ماكس 6,600 · ابل ستور / آبل ستور 1,900 · متجر ابل 1,000 ·
 * ابل ياس مول 720 · ابل دبي مول 480 · ابل ستور الامارات 480 · ايفون 18 برو 480 · سعر ايفون 18 برو ماكس 390 ·
 * ابل الجيمي مول 320 · ايفون دو 210 · ابل ستور دبي مول 140 · ابل ستور ياس مول 110 · ابل مول الامارات 50 ·
 * ابل ستور ابوظبي 50 · ابل ستور العين 40 · فروع ابل في الامارات 30. كلمات «توفر/مخزون» شبه معدومة البحث، لذا تبدأ
 * العناوين باسم المتجر أو العلامة أو الطراز ثم الوعد. العرض ≤ 60 (fitTitleW)، والوصف ≤ 155.
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, INTL_TRACKING_SINCE, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { alertHref, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { price as priceIn, stamp, list, hour, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, configLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import { content } from "./content";
import {
  CITIES_G, L, N, SEARCHED_MODEL, STORES_G, TIMES, allWord, biCountry, count, country, currencyAr, durAr, forms, inCountry,
  regionNoun, regionsCount, taxAr, taxNoteAr, theStores, theStoresG,
} from "./util";

/** Arabic spellings people search, once in a price heading on the model pages (ايفون 18 برو ماكس 6,600 a month; سعر … 390). */
const priceName = (model: ModelKey, name: string) => (model === "duo" ? name : `${name} (${SEARCHED_MODEL[model]})`);

const money = (c: Country, v: number) => priceIn(L, c, v);
const listAr = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
const pctAr = (n: number) => `${N(n)}%`;
/** A place's name in Arabic (already Arabic stays). */
const placeAr = (i: Pick<IntlPlaceInput, "cc" | "kind" | "name">) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const provinceAr = (p: string) => regionLabel("ca", p, L);
/** "256GB Night Sky" → "256GB سماء الليل". */
const cfgAr = (label: string) => { const [storage, ...rest] = label.split(" "); return configLabel({ storage, color: rest.join(" ") }, L); };
/** Where the shop is: "apple.com/ae (بالإنجليزية)" — Apple's UAE store has no Arabic checkout. */
const shopOf = (c: Country) => `apple.com/${c.buyPath ?? c.shopPath}${c.cc === "ae" ? " (بالإنجليزية)" : ""}`;
/** After «من»: "من 5 متاجر Apple" / "من متجري Apple". */
const APPLE_STORES_G = forms({ one: "متجر Apple واحد", two: "متجري Apple", few: "# متاجر Apple", many: "# متجرًا لـApple", other: "# متجر Apple" });
const RESTOCKS = forms({ one: "عودة توفر واحدة", two: "عودتا توفر", few: "# عودات توفر", many: "# عودةً للتوفر", other: "# عودة توفر" });
/** "الفرعين" / "الفروع الخمسة" / "الفروع الـ39": a country's stores as branches. */
const branches = (n: number) => (n === 2 ? "الفرعين" : allWord(n).replace(/^المتاجر/, "الفروع"));

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 30 * 86400_000 ? "منذ بدء التتبع في 2 نوفمبر" : "خلال آخر 30 يومًا";
}
/** "3 نوفمبر، 10:04 ص بتوقيت الإمارات" (the country's zone). */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return cc === "ae" ? `${stamp(L, iso, COUNTRIES[cc].timeZone)} بتوقيت الإمارات` : stamp(L, iso, COUNTRIES[cc].timeZone, true);
}

/* ------------------------------------------------------------------ tax */

/** Arabic sources where one exists (the UAE's Federal Tax Authority has an Arabic page). */
function taxSource(cc: Exclude<CountryCode, "us">) {
  return cc === "ae" ? { label: "الهيئة الاتحادية للضرائب: ضريبة القيمة المضافة", url: "https://tax.gov.ae/ar/taxes/vat.aspx" } : TAX_SOURCES[cc];
}

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `يصل iPhone Duo بسعة 256GB إلى نحو ${money(c, t.total)} في ${provinceAr(region!)}: سعر Apple البالغ ${money(c, duo)} مضافًا إليه ${t.rate}% ${CA_PROVINCE_TAX[region!].label}.`;
    return `سعر iPhone Duo بسعة 256GB هو ${money(c, duo)} قبل الضريبة، وتضيف مقاطعة متجر الاستلام من 5% إلى 15% عند الدفع.`;
  }
  const r = includedRate(c);
  if (r == null) return `${money(c, duo)} هو السعر الكامل لجهاز iPhone Duo بسعة 256GB عند الاستلام: لا ضريبة مبيعات في هونغ كونغ.`;
  return `${money(c, duo)} هو السعر الكامل لجهاز iPhone Duo بسعة 256GB عند الاستلام ${inCountry(cc)}، شاملًا ${taxAr(c)} ${r}%.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const pa = provinceAr(region!);
      const parts = t.hst ? `${t.hst}% HST` : t.pst ? `${t.gst}% GST و${t.pst}% ${t.label.split(" + ")[1]}` : `${t.gst}% GST (بلا ضريبة مبيعات للمقاطعة)`;
      return {
        id: "price-with-tax",
        h2: `كم يكلّف ${m.name} في ${placeName} بعد ضريبة المبيعات؟`,
        lead: `**نحو ${money(c, withProvinceTax(base, region!)!.total)}** لجهاز ${m.name} بسعة 256GB في متجر في ${placeName}: سعر Apple **${money(c, base)} قبل الضريبة**، مضافًا إليه ${parts} في ${pa}.`,
        blocks: [
          { t: "table", head: ["iPhone", "سعر apple.com", `شاملًا ${t.total}% ${t.label}`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: `ما يكلّفه كل iPhone في ${pa} مع ${t.label} (${t.total}%)`, source: `[${src.label}](${src.url})؛ الأسعار من ${shopOf(c)}` },
          { t: "note", text: "**متجر الاستلام يحدد النسبة:** مقاطعته هي التي تقرر الضريبة، لا عنوان سكنك." },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `كم يكلّف ${m.name} في كندا بعد ضريبة المبيعات، حسب المقاطعة؟`,
      lead: `**من ${money(c, withProvinceTax(base, cheapest)!.total)} في ${provinceAr(cheapest)} إلى ${money(c, withProvinceTax(base, dearest)!.total)} في ${provinceAr(dearest)}** لجهاز ${m.name} بسعة 256GB: سعر Apple البالغ ${money(c, base)} لا يشمل الضريبة، وتضيف مقاطعة متجر الاستلام من ${CA_PROVINCE_TAX[cheapest].total}% إلى ${CA_PROVINCE_TAX[dearest].total}%.`,
      blocks: [{
        t: "table",
        head: ["المقاطعة", "الضريبة", "النسبة", `${m.short} 256GB شاملًا الضريبة`],
        rows: provinces.map((p) => [provinceAr(p), CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "ضريبة المبيعات على الاستلام من المتجر، في كل مقاطعة فيها متجر Apple",
        source: `[${src.label}](${src.url})؛ الأسعار من ${shopOf(c)}`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxAr(c);
  return {
    id: "price",
    h2: `كم سعر ${priceName(model, m.name)} ${inCountry(cc)}؟ ${money(c, base)}، ${taxNoteAr(c)}`,
    lead: r == null
      ? `**${money(c, base)}، أي سعر apple.com بالضبط**، لجهاز ${m.name} بسعة 256GB عند الاستلام في ${placeName}: لا **ضريبة مبيعات** ولا ضريبة قيمة مضافة في هونغ كونغ.`
      : `**${money(c, base)}** لجهاز ${m.name} بسعة 256GB عند الاستلام في ${placeName}، و**${tn} ${r}% مشمولة فيه** (${money(c, beforeTax(c, base))} قبل الضريبة)؛ ولا يُضاف شيء عند الدفع.`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "سعر apple.com"] : ["iPhone", "سعر apple.com", `قبل ${tn} ${r}%`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `أسعار Apple ${inCountry(cc)} كما تُدفع عند الاستلام${r == null ? "" : ` (شاملة ${tn})`}`,
      source: `[${src.label}](${src.url})؛ الأسعار من ${shopOf(c)}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `كم سعر iPhone Duo في ${placeName} شاملًا الضريبة؟`, a: `نحو ${money(c, t.total)} لسعة 256GB: ${t.rate}% ${CA_PROVINCE_TAX[region!].label} في ${provinceAr(region!)} فوق سعر Apple البالغ ${money(c, duo)}، ويحصّلها متجر الاستلام.` }
      : { q: "هل تشمل أسعار Apple في كندا الضريبة؟", a: `لا: سعر iPhone Duo بسعة 256GB هو ${money(c, duo)} قبل الضريبة. وتضيف مقاطعة متجر الاستلام GST أو HST أو ضريبة المبيعات الإقليمية، من 5% في ألبرتا إلى 14.975% في كيبيك.` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "هل تدفع ضريبة مبيعات على iPhone في هونغ كونغ؟", a: `لا: لا ضريبة مبيعات ولا ضريبة قيمة مضافة في هونغ كونغ. يكلّف iPhone Duo بسعة 256GB ${money(c, duo)} عند الاستلام، تمامًا كما يظهر على apple.com.` }
    : { q: `هل ${taxAr(c)} مشمولة في أسعار Apple ${inCountry(cc)}؟`, a: `نعم: سعر ${money(c, duo)} لجهاز iPhone Duo بسعة 256GB يشمل ${taxAr(c)} ${r}%. ولا يُضاف شيء عند الاستلام من المتجر.` };
}

/* ------------------------------------------------------------------ emirate and city pages */

/** The place's own cities when an emirate page spans several ("أبوظبي والعين"). */
function citiesOf(i: IntlPlaceInput): string[] {
  return [...new Set(i.stores.map((s) => cityLabel(i.cc, s.city, L)))];
}

function placeTitle(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeAr(i);
  const cities = citiesOf(i);
  const head = i.kind === "state" && cities.length > 1 ? listAr(cities) : w;
  const names = listAr(i.stores.map((s) => storeLabel(s, L)));
  return fitTitleW([
    ...(n <= 3 && i.kind === "city" ? [`ابل ستور ${w}: ${names}، استلام iPhone مباشرة`] : []),
    ...(n > 1 ? [`ابل ستور ${head}: استلام iPhone Duo في ${allWord(n)} مباشرة`] : []),
    `ابل ستور ${head}: استلام iPhone Duo مباشرة`,
    `ابل ستور ${w}: استلام iPhone Duo مباشرة`,
    `ابل ستور ${w}: مخزون iPhone الآن`,
    `ابل ستور ${w}: مخزون iPhone`,
    `ابل ستور ${w}`,
  ]);
}

/** The description's price clause. */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `، وDuo بنحو ${money(c, t.total)} شاملًا ضريبة ${provinceAr(region!)}` : `، وDuo بسعر ${money(c, duo)} قبل الضريبة`; }
  return `، وDuo بسعر ${money(c, duo)}، ${taxNoteAr(c)}`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeAr(i);
  const duo = i.stockNow.duo;
  const pm = i.stockNow["18-pro-max"];
  const of = `${N(duo)} من ${count(n, APPLE_STORES_G)} في ${w}`;
  return fitTitleW([
    `${of} ${duo === 1 ? "يعرض" : "تعرض"} iPhone Duo للاستلام الآن، و${N(pm)} ${pm === 1 ? "يعرض" : "تعرض"} 18 Pro Max. متجرًا بمتجر، مع ساعات عودة التوفر${priceBit(i.cc, i.region)}.`,
    `${of} ${duo === 1 ? "يعرض" : "تعرض"} iPhone Duo الآن، و${N(pm)} ${pm === 1 ? "يعرض" : "تعرض"} 18 Pro Max. مباشرة لكل متجر، مع ساعات عودة التوفر.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const w = placeAr(i);
  const duo = i.stockNow.duo;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `، الموزّعة على ${count(i.cities, CITIES_G)}،` : "";
  return `**${N(duo)}** من **${count(n, APPLE_STORES_G)}** في ${w}${cities} ${duo === 1 ? "يعرض" : "تعرض"} iPhone Duo للاستلام في هذه الدقيقة؛ وiPhone 18 Pro Max في **${N(i.stockNow["18-pro-max"])}**، وiPhone 18 Pro في **${N(i.stockNow["18-pro"])}**.`;
}

/** "لا يعرض المتجر" / "لا يعرض أيٌّ من المتاجر الخمسة". */
const noneOf = (n: number, where = "") => (n === 1 ? "لا يعرض المتجر" : `لا يعرض أيٌّ من ${allWord(n)}${where}`);

function duoLead(i: IntlPlaceInput): string {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**نعم، في ${N(have.length)} من ${count(n, STORES_G)}**: ${listAr(have.map((s) => appleStoreLabel(s, L)), 4)} ${have.length === 1 ? "يعرض" : "تعرض"} iPhone Duo للاستلام في هذه الدقيقة.`;
  if (st.month > 0) return `**ليس في هذه الدقيقة**: ${noneOf(n)} iPhone Duo، مع أنه عاد ${n === 1 ? "إليه" : "إليها مجتمعةً"} **${count(st.month, TIMES)}** ${sinceWhen()}.`;
  return `**ليس في هذه الدقيقة**: ${noneOf(n)} iPhone Duo، ولم تُسجَّل ${n === 1 ? "فيه" : "في أيٍّ منها"} عودة توفر مؤكدة لـDuo ${sinceWhen()}.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**آخر عودة توفر لـDuo هنا:** ${whenIn(i.cc, st.lastRestock.at)} في ${appleStoreLabel(last, L)}`);
  if (have.length > 0 && st.month > 0) items.push(`**المؤكَّد ${sinceWhen()}:** ${count(st.month, RESTOCKS)} لـDuo في متاجر ${w}`);
  if (st.medianMs != null) items.push(`**كم يدوم العرض:** نحو ${durAr(st.medianMs)} في الوسيط قبل أن ينفد Duo من جديد`);
  const targets = n === 1 ? "في المتجر الذي ستذهب إليه" : n === 2 ? "في المتجرين اللذين ستذهب إليهما" : n === 3 ? "في المتاجر الثلاثة التي ستذهب إليها" : `في أقرب ${N(Math.min(n, 5))} متاجر ستذهب إليها`;
  items.push(`**أقصر طريق إليه:** [فعّل مراقبة iPhone Duo في ${w}](${alert}) ${targets}؛ المتاجر التي عليها تنبيهات تُفحص كل 5 ثوانٍ`);
  items.push("**قاعدة التنبيه الواحدة** = متجر واحد × خيار محدد واحد، ويصل الإشعار بعد نحو 3 ثوانٍ من تأكيد فحص ثانٍ لعودة التوفر");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**قد يتغير ذلك خلال دقيقة:** يرى التنبيه عودة التوفر التالية قبل أن يُظهرها تحديث apple.com بوقت طويل." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeAr(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug || undefined, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  const ofN = count(n, STORES_G);
  const pmNow = i.stockNow["18-pro-max"];
  return [
    {
      id: "iphone-duo",
      h2: `أي متاجر Apple في ${w} فيها iPhone Duo الآن؟`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `هل iPhone 18 Pro Max متوفر في ${w}؟`,
      lead: pmNow > 0
        ? `**نعم، في ${N(pmNow)} من ${ofN}**، و**${pctAr(pairsPct(i, "18-pro-max"))}** من أزواج «متجر × خيار» البالغة ${N(n * pm)} في ${w} معروضة في هذه الدقيقة.`
        : `**ليس في هذه الدقيقة**: ${noneOf(n, ` في ${w}`)} iPhone 18 Pro Max للاستلام.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**الأصعب إيجادًا الآن:** ${listAr(scarce.map((x) => `${cfgAr(x.label)} (${N(x.stores)} من ${ofN})`))}`] : []),
        `**iPhone 18 Pro:** في ${N(i.stockNow["18-pro"])} من ${ofN}، و${pctAr(pairsPct(i, "18-pro"))} من أزواجه معروضة`,
        `**المؤكَّد ${sinceWhen()}:** ${i.max.month ? `${count(i.max.month, RESTOCKS)} لـ18 Pro Max` : "لا عودة توفر لـ18 Pro Max بعد"}`,
        ...(i.max.medianMs != null ? [`**كم يدوم العرض:** نحو ${durAr(i.max.medianMs)} في الوسيط قبل أن ينفد Pro Max من جديد`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const w = inCountry(cc);
  return fitTitleW([
    ...(n > 1 ? [`فروع ابل ستور ${w}: استلام iPhone Duo في ${branches(n)} مباشرة`] : []),
    `فروع ابل ستور ${w}: استلام iPhone Duo مباشرة`,
    `متاجر ابل ${w}: مخزون iPhone مباشرة`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = storesOf(cc).length;
  const head = `ابل ستور ${country(cc)}`;
  return fitTitleW([
    ...(n > 1 ? [`${head}: فحص مخزون iPhone والاستلام مباشرة في ${branches(n)}`] : []),
    `${head}: فحص مخزون iPhone والاستلام مباشرة`,
    `${head}: فحص مخزون iPhone مباشرة`,
    `فحص مخزون iPhone ${inCountry(cc)}: الاستلام مباشرة`,
    head,
  ]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `مخزون استلام iPhone مباشرة في متجر ابل ${inCountry(cc)}` : `مخزون استلام iPhone مباشرة في كل ${theStoresG(n).replace(/Apple/, "ابل")} ${inCountry(cc)}`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `${theStores(1)} ${inCountry(cc)}` : `كل ${theStoresG(n)} ${inCountry(cc)}`;
}

/** Where the stores are: "في 3 مدن ضمن إمارتين" / "كلها في دبي" / "في دبي". */
function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return `في ${cityLabel(cc, cities[0].name, L)}`;
  if (cities.length === 1) return `كلها في ${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `في ${count(cities.length, CITIES_G)}`;
  return `في ${count(cities.length, CITIES_G)} ضمن ${regionsCount(c, regions.length)}`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const ar = SEARCHED_MODEL[model];
  const w = inCountry(cc);
  return {
    title: fitTitleW([
      `هل ${m.name} (${ar}) متوفر ${w}؟ ${theStores(n)} مباشرة`,
      `هل ${m.name} (${ar}) متوفر ${w}؟ مباشرة`,
      `هل ${m.name} متوفر ${w}؟ مباشرة`,
      `مخزون ${m.name} ${w}`,
    ], 70),
    h2: [`أي متاجر Apple ${w} فيها ${m.name} الآن؟`, priceSection(cc, country(cc), undefined, model).h2],
  };
}

function priceFrom(cc: CountryCode, model: ModelKey): string {
  const c = COUNTRIES[cc];
  const r = priceRange(cc, model);
  return cc === "ca" ? `**${money(c, r.low)}** قبل الضريبة` : `**${money(c, r.low)}**، ${taxNoteAr(c)}`;
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const now = inStock === 0
    ? (n === 1 ? `في هذه الدقيقة **لا** يعرض متجر Apple ${inCountry(cc)} ${m.name} للاستلام` : `في هذه الدقيقة **لا يعرض أيٌّ** من ${theStoresG(n)} ${inCountry(cc)} ${m.name} للاستلام`)
    : `في هذه الدقيقة ${inStock === 1 ? "يعرض" : "تعرض"} **${N(inStock)} من ${theStoresG(n)}** ${inCountry(cc)} ${m.name} للاستلام`;
  return `${now} (يُفحص كل متجر **كل 15 ثانية**)؛ والأسعار تبدأ من ${priceFrom(cc, model)}.`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const r = priceRange(cc, model);
  const p = `${money(c, r.low)}${cc === "ca" ? " قبل الضريبة" : ""}`;
  const v = inStock === 1 ? "يعرض" : "تعرض";
  return fitTitleW([
    `هل ${SEARCHED_MODEL[model]} متوفر ${inCountry(cc)}؟ ${N(inStock)} من ${theStoresG(n)} ${v} ${m.name} للاستلام في هذه الدقيقة. متجرًا بمتجر وخيارًا بخيار، من ${p}، مع ساعات عودة التوفر.`,
    `${N(inStock)} من ${count(n, APPLE_STORES_G)} ${inCountry(cc)} ${v} ${m.name} للاستلام في هذه الدقيقة. متجرًا بمتجر وخيارًا بخيار، من ${p}، مع ساعات عودة التوفر.`,
    `${N(inStock)} من ${count(n, APPLE_STORES_G)} ${inCountry(cc)} ${v} ${m.name} الآن. مخزون الاستلام المباشر حسب المتجر والخيار، وساعات عودة التوفر والتنبيهات.`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, N(catalogFor(m.key, cc).length), N(storesNow[m.key] ?? 0), N(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = currencyAr(c.currency);
  const inCur = c.currency === "AED" ? "بالدرهم" : cur.startsWith("ال") ? `ب${cur}` : `بعملة ${cur}`;
  const what = n === 1 ? "الأسعار" : "ساعات عودة التوفر والأسعار";
  return fitTitleW([
    `ابل ستور ${country(cc)}: مخزون استلام iPhone Duo و18 Pro و18 Pro Max مباشرة في ${allStoresPhrase(cc)}، يُفحص كل 15 ثانية. ${what} ${inCur}، وإشعار لحظة عودة التوفر إلى متجرك.`,
    `مخزون استلام iPhone Duo و18 Pro و18 Pro Max مباشرة في ${allStoresPhrase(cc)}، يُفحص كل 15 ثانية. ${what} ${inCur}، وإشعار في اللحظة التي يعود فيها التوفر إلى متجرك.`,
    `مخزون استلام iPhone Duo و18 Pro وPro Max في ${allStoresPhrase(cc)}، كل 15 ثانية. ${what} ${inCur}، وإشعار لحظة عودة التوفر.`,
    `مخزون استلام iPhone مباشرة في ${allStoresPhrase(cc)}، كل 15 ثانية. ${what} ${inCur}، وإشعار لحظة عودة التوفر.`,
    `مخزون استلام iPhone مباشرة في ${allStoresPhrase(cc)}، يُفحص كل 15 ثانية. ${what}، وإشعار لحظة عودة التوفر إلى متجرك.`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return `آخر عودة توفر مؤكدة لـiPhone Duo ${inCountry(cc)}: **{{duo.lastRestock}}**. في هذه الدقيقة يعرض **{{duo.storesNow}} من ${theStoresG(n)}** جهاز Duo للاستلام، و**{{pm.storesNow}}** جهاز iPhone 18 Pro Max، و**{{pro.storesNow}}** جهاز iPhone 18 Pro.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const stores = storesOf(cc);
  const n = stores.length;
  const buy = cc === "ae" ? " (صفحة الشراء بالإنجليزية)" : "";
  return [
    {
      id: "iphone-stock",
      h2: `أي أجهزة iPhone متوفرة ${inCountry(cc)} الآن؟`,
      lead: `الجدول يجيب مباشرة: توفر الاستلام من المتجر كما تنشره apple.com نفسها لكل خيار في ${allStoresPhrase(cc)}، يُفحص كل 15 ثانية${n > 1 ? `، ومفصّلًا حسب المتجر و${c.regionNoun ? `ال${regionNoun(c)}` : "المدينة"} والخيار` : ""}.`,
      blocks: [
        { t: "table", head: ["الطراز", "الخيارات", "متاجر تعرضه الآن", "عودات التوفر المؤكدة"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `حالة الخط ${inCountry(cc)} حتى {{asOf}}` },
        { t: "ul", items: [
          "**«مؤكد» يعني مرتين:** لا يُنشر أي تغيير إلا بعد أن يتطابق معه فحص ثانٍ، فإجابة مضطربة واحدة من apple.com لا تظهر أبدًا كعودة توفر أو نفاد",
          "**أول رصد ليس عودة توفر:** الخيار الذي يُرى لأول مرة يحدد نقطة البداية فقط",
          `**السجل هو المرجع:** كل تغيير مؤكد يدخل [سجل عودة التوفر](${i.restocksPath})، الذي تُرسم منه مخططات عودة التوفر في ${i.index?.indexable ? `[صفحات المتاجر](${i.index.path})` : "صفحة المتجر"}`,
          `**التغطية:** ${spreadPhrase(cc)}، بأسعار Apple وأرقام قطعها ${inCountry(cc)}؛ والمتاجر التي عليها تنبيهات تُفحص كل 5 ثوانٍ`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, country(cc)),
    {
      id: "alerts",
      h2: `كيف تعمل تنبيهات عودة التوفر ${inCountry(cc)}؟`,
      lead: `تختار ${n === 1 ? "المتجر" : "المتاجر"} والهاتف المحدد؛ وحين ${n === 1 ? "يعرضه المتجر" : "يعرضه أحدها"} للاستلام من المتجر، يصل إشعار إلى هاتفك بعد نحو 3 ثوانٍ من تأكيد عودة التوفر.`,
      blocks: [
        { t: "ol", items: [
          n === 1 ? `اختر iPhone والسعة واللون تحت **نبّهني**؛ والمتجر هو ${appleStoreLabel(stores[0], L)} في ${cityLabel(cc, stores[0].city, L)}.` : "اختر iPhone والسعة واللون تحت **نبّهني**، ثم حدّد المتاجر التي يمكنك الوصول إليها؛ الأقرب أولًا، مع المسافة بالكيلومتر على الطريق ووقت القيادة.",
          "على iPhone، أضف RestockWire إلى الشاشة الرئيسية واسمح بالإشعارات؛ فنظام iOS لا يوصل إشعارات الويب إلا إلى تطبيق مثبّت ([طريقة التثبيت](/phone-alerts)).",
          `حين يصل الإشعار، افتح منه apple.com${buy} وأكمل الشراء مع الاستلام من ذلك المتجر.`,
        ] },
        { t: "table", head: ["الباقة", "شهريًا (بالدولار الأمريكي)", "قواعد التنبيه"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "القاعدة الواحدة = متجر واحد × خيار محدد واحد؛ والتصفح يبقى مجانيًا، والسرعة نفسها في كل باقة ([الأسعار](/pricing))" },
        { t: "note", text: "**قراءتنا:** iPhone Duo يستحق تنبيهًا في كل متجر يمكنك الوصول إليه؛ أما 18 Pro وPro Max فانظر إلى الأرقام المباشرة أولًا." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = storesOf(cc).length;
  const p = cc === "us" ? "" : `/${cc}`;
  const confirmed = `${count(rt.n, RESTOCKS)} مؤكدة في ${N(rt.stores)} من ${count(rt.storesTotal, STORES_G)} منذ 2 نوفمبر`;
  const when = rt.n === 0
    ? `لم تتأكد أي عودة توفر بعد منذ بدء التتبع في 2 نوفمبر. صفحة [متى تعيد Apple توفير iPhone Duo ${inCountry(cc)}؟](${rt.path}) تحصي كل واحدة حسب الساعة واليوم بالتوقيت المحلي فور حدوثها.`
    : rt.peakHour != null
      ? `معظمها يقع نحو **الساعة ${hour(L, rt.peakHour, true)} بالتوقيت المحلي**: ${confirmed}. [ساعةً بساعة ويومًا بيوم](${rt.path}).`
      : `${confirmed}، على أيام أقل من أن نحدد منها ساعة معتادة بعد. [ساعةً بساعة ويومًا بيوم](${rt.path}).`;
  const buy = cc === "ae" ? " (صفحة الشراء بالإنجليزية)" : "";
  return [
    { q: `أي متاجر Apple ${inCountry(cc)} تعرض iPhone Duo في هذه الدقيقة؟`, a: `{{duo.storesNow}} من ${count(n, STORES_G)} عند آخر فحص ({{asOf}}). صفحة [مخزون iPhone Duo ${inCountry(cc)}](${p}/in-stock/iphone-duo) تسمّي كل متجر وكل خيار، وتتحدث كل 15 ثانية.` },
    { q: `متى تعيد Apple توفير iPhone Duo ${inCountry(cc)}؟`, a: when },
    { q: `ما سرعة رصد RestockWire لعودة التوفر ${inCountry(cc)}؟`, a: `المتاجر التي عليها تنبيهات تُفحص كل 5 ثوانٍ، و${n === 1 ? `متجر Apple ${inCountry(cc)}` : `كل متجر Apple ${inCountry(cc)}`} كل 15 ثانية؛ وأي «متوفر» أول يُعاد فحصه خلال ثانية. ثم تصل عودة التوفر المؤكدة إلى هاتفك بعد نحو 3 ثوانٍ.` },
    { q: "هل أحتاج إلى باقة لأطّلع على المخزون؟", a: "لا: المخزون المباشر والخريطة وسجل عودة التوفر مجانية. الباقة تضيف قواعد تنبيه تُدفع بالدولار الأمريكي: Plus بـ$5 شهريًا لعشر قواعد، وPro بـ$10 لعشرين، وMax بـ$20 لخمسين، ويمكنك الإلغاء متى شئت ([الأسعار](/pricing))." },
    taxFaq(cc, country(cc)),
    { q: "هل يحجز التنبيه الهاتف لي؟", a: `لا؛ وحده طلب الاستلام على apple.com${buy} يفعل ذلك. التنبيه يوصلك إلى صفحة الدفع قبل غيرك، وتحجز Apple الجهاز بعد أن تدفع ([مساعدة Apple في الاستلام](${pickupHelp(cc).url})، بالإنجليزية).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire لفحص مخزون iPhone ${inCountry(cc)}`,
  offer: "المخزون المباشر والخريطة وسجل عودة التوفر مجانية؛ وباقات التنبيه تبدأ من $5 شهريًا",
  itemList: (cc: CountryCode) => `متاجر Apple ${inCountry(cc)}`,
  restockTimesChip: "ساعات عودة التوفر",
  storesByRegion: (cc: CountryCode) => `المتاجر حسب ال${regionNoun(COUNTRIES[cc])}`,
  browse: (cc: CountryCode) => `المخزون حسب المكان ${inCountry(cc)}`,
  selloutH2: (cc: CountryCode) => `كم تدوم عودة توفر iPhone ${inCountry(cc)}؟`,
  selloutLabel: (cc: CountryCode) => `في متاجر Apple ${biCountry(cc)}`,
  last24Label: (cc: CountryCode) => inCountry(cc),
  newsroom: "Apple Newsroom: وصول iPhone Duo إلى متاجر Apple حول العالم (23 أكتوبر 2026، بالإنجليزية)",
};

/** Store page <title> and H1: "ابل دبي مول: مخزون iPhone اليوم، الاستلام وساعات العمل"; `region` when the store is its city's only one. */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, L);
  const shown = region && !name.includes(region) && !storeLabel(s, L).includes(region) ? region : null;
  return fitTitleW(content.titles.store(name, shown));
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel: (_cc: CountryCode, name: string) => name,
  whenIn,
  taxSentence,
  priceSection,
  taxFaq,
  placeTitle,
  placeDescription,
  placeIntro,
  placeSections,
  storesIndexTitle,
  homeTitle,
  homeH1,
  allStoresPhrase,
  spreadPhrase,
  modelPageTitles,
  modelIntro,
  modelDescription,
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({
    pickupHelp: { label: "Apple: مساعدة الشحن والاستلام (ما تحضره للاستلام، بالإنجليزية)", url: pickupHelp(code).url },
    storeList: { label: `Apple: قائمة متاجر Apple ${inCountry(code)} (بالإنجليزية)`, url: storeListSource(code).url },
    tax: taxSource(code),
  }),
};
