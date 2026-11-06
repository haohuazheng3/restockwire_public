/**
 * 한국어 문구: place — 국가 페이지 트리의 카피 빌더(제목, 답변 우선 도입부, 키워드 섹션, 가격·세금 섹션, FAQ).
 * 영어판(lib/seo/countryCopy.ts)과 같은 인자, 같은 반환 형태. 실시간 수치로 문장을 만들어요.
 * 검색어(Google Ads, 한국, 월간): 애플스토어 49,500 · 아이폰 듀오 27,100 · 아이폰 듀오 가격 2,400 · 애플스토어 재고 확인 210 ·
 * 애플스토어 매장 210 · 아이폰 재고 110. 제품명은 "iPhone Duo" 그대로, 제목·H1·도입부에 "아이폰 듀오"를 한 번 곁들여요.
 * 지역·도시 이름은 영어 데이터로 들어오므로 places.ts로 한국어 이름을 써요(이미 한국어면 그대로 돌아와요).
 */
import * as cc from "@/lib/seo/countryCopy";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, INTL_TRACKING_SINCE, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, taxName, withProvinceTax } from "@/content/country-tax";
import { fitTitleW, list, num, pct, price, stamp } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import { alertHref, fmtDuration, storeTitle as enStoreTitle, type FaqItem } from "@/lib/seo/enrich";
import { hourLabel } from "@/lib/content/siteFacts";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Dict } from "../en";
import { eulReul } from "./common";

const L = "ko" as const;
const n = (x: number) => num(L, x);
const money = (code: CountryCode, v: number) => price(L, COUNTRIES[code], v);
/** 나라 이름: 한국은 "대한민국". */
const cn = (code: CountryCode) => countryLabel(code, L);
/** "국내" (한국) / "일본" (다른 나라): 가격·재고 앞에 붙는 말. */
const dom = (code: CountryCode) => (code === "kr" ? "국내" : cn(code));
/** 시·도처럼 그 나라의 지역 단위(한국어). */
const REGION_WORD: Record<string, string> = { state: "주", province: "시·도", area: "지역", department: "도", prefecture: "도도부현", emirate: "토후국", canton: "칸톤", region: "지역", county: "주", city: "시" };
const regionWord = (code: CountryCode) => REGION_WORD[COUNTRIES[code].regionNoun ?? "area"] ?? "지역";
/** 가격 안의 세금 이름. */
const taxKo = (code: CountryCode) => {
  const t = taxName(COUNTRIES[code]);
  return t === "VAT" ? "부가세" : t === "consumption tax" ? "소비세" : t;
};
/** "부가세 10% 포함" / "세전" / "판매세 없음". */
const taxNote = (code: CountryCode) => {
  if (code === "ca") return "세전";
  const r = includedRate(COUNTRIES[code]);
  return r == null ? "판매세 없음" : `${taxKo(code)} ${r}% 포함`;
};
/** 장소 이름(영어 데이터 → 한국어). */
const nameOf = (i: IntlPlaceInput) => {
  const nm = i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L);
  // 매장 목록 페이지는 나라 이름을 넘겨요: 한국에서는 "국내".
  return nm === cn(i.cc) ? dom(i.cc) : nm;
};
/** scarcest()의 "256GB Silver" → "256GB 실버". */
const cfgKo = (label: string) => {
  const [storage, ...color] = label.split(" ");
  return `${storage} ${colorLabel(color.join(" "), L)}`;
};

/** 한국 부가가치세율(10%)의 근거: 부가가치세법 제30조. */
const KR_TAX: Source = { label: "국가법령정보센터: 부가가치세법 제30조(세율 10%)", url: "https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%B6%80%EA%B0%80%EA%B0%80%EC%B9%98%EC%84%B8%EB%B2%95" };
const taxSource = (code: Exclude<CountryCode, "us">): Source => (code === "kr" ? KR_TAX : TAX_SOURCES[code]);
const helpSource = (code: CountryCode): Source => ({ label: "Apple 지원: 매장 픽업 시 필요한 것", url: pickupHelp(code).url });

/* ------------------------------------------------------------------ 기간, 이름, 시각 */

function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 14 * 86400_000 ? "11월 2일 추적을 켠 뒤로" : "지난 14일 사이";
}

/** 미국 매장 도시·주와 이름이 같은 곳은 나라를 붙여요("Manchester(영국)"). */
function placeLabel(code: CountryCode, name: string): string {
  return cc.placeLabel(code, name) === name ? name : `${name}(${cn(code)})`;
}

/** "11월 2일 오후 3:04"(한국 시간), 다른 나라는 시간대 표기를 붙여요. */
function whenIn(code: CountryCode, iso: string | Date): string {
  return stamp(L, iso, COUNTRIES[code].timeZone, code !== "kr");
}

/* ------------------------------------------------------------------ 세금 */

function taxSentence(code: CountryCode, region?: string): string {
  const duo = priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `${regionLabel(code, region!, L)}에서 256GB iPhone Duo는 약 ${money(code, t.total)}이에요. Apple 가격 ${money(code, duo)}에 ${t.rate}% ${CA_PROVINCE_TAX[region!].label}가 더해진 금액이에요.`;
    return `256GB iPhone Duo는 세전 ${money(code, duo)}이에요. 픽업 매장이 있는 주에 따라 계산할 때 5%~15%가 더 붙어요.`;
  }
  const r = includedRate(COUNTRIES[code]);
  if (r == null) return `256GB iPhone Duo는 픽업할 때 ${money(code, duo)}이 전부예요. 홍콩은 판매세가 없어요.`;
  return `${dom(code)}에서 256GB iPhone Duo를 픽업할 때 내는 금액은 ${money(code, duo)}이 전부예요. ${taxKo(code)} ${r}%가 포함돼 있어요.`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const base = priceOf(code, model) ?? 0;
  const src = taxSource(code as Exclude<CountryCode, "us">);
  const shop = `apple.com/${c.buyPath ?? c.shopPath}`;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const rk = regionLabel(code, region!, L);
      const parts = t.hst ? `HST ${t.hst}%` : t.pst ? `GST ${t.gst}%와 ${t.label.split(" + ")[1]} ${t.pst}%` : `GST ${t.gst}%(주 판매세 없음)`;
      return {
        id: "price-with-tax",
        h2: `${placeName}에서 ${m.name}는 세금까지 얼마인가요?`,
        lead: `${placeName} 매장에서 256GB ${m.name}는 **약 ${money(code, withProvinceTax(base, region!)!.total)}**이에요. Apple 가격 **세전 ${money(code, base)}**에 ${rk}의 ${parts}가 더해져요.`,
        blocks: [
          { t: "table", head: ["iPhone", "apple.com 가격", `${t.label} ${t.total}% 포함`], rows: rows.map(([label, p]) => [label, money(code, p), money(code, withProvinceTax(p, region!)!.total)]), caption: `${rk}에서 ${t.label}(${t.total}%)를 더한 iPhone별 금액`, source: `[${src.label}](${src.url}); 가격: apple.com/ca` },
          { t: "note", text: "**세율은 픽업 매장이 정해요:** 집 주소가 아니라 매장이 있는 주의 세금이 붙어요." },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `캐나다에서 ${m.name}는 세금까지 얼마인가요? 주별 정리`,
      lead: `256GB ${m.name}는 **${regionLabel(code, cheapest, L)} ${money(code, withProvinceTax(base, cheapest)!.total)}부터 ${regionLabel(code, dearest, L)} ${money(code, withProvinceTax(base, dearest)!.total)}까지**예요. Apple 가격 ${money(code, base)}은 세전이고, 픽업 매장이 있는 주에 따라 ${CA_PROVINCE_TAX[cheapest].total}%~${CA_PROVINCE_TAX[dearest].total}%가 붙어요.`,
      blocks: [{
        t: "table",
        head: ["주", "세목", "합산 세율", `${m.short} 256GB 최종가`],
        rows: provinces.map((p) => [regionLabel(code, p, L), CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(code, withProvinceTax(base, p)!.total)]),
        caption: "Apple Store가 있는 모든 주의 매장 픽업 판매세",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url}); 가격: apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tk = taxKo(code);
  return {
    id: "price",
    h2: model === "duo" && code === "kr"
      ? `iPhone Duo(아이폰 듀오) 가격은 얼마인가요? ${money(code, base)}, ${taxNote(code)}`
      : `${dom(code)}에서 ${m.name}는 얼마인가요? ${money(code, base)}, ${taxNote(code)}`,
    lead: r == null
      ? `${placeName}에서 256GB ${m.name}를 픽업하면 **${money(code, base)}, apple.com 가격 그대로**예요. 홍콩은 **판매세도 부가세도 없어요**.`
      : `${placeName}에서 256GB ${m.name}를 픽업하면 **${money(code, base)}**이고, **${tk} ${r}%가 이미 포함**돼 있어요(세전 ${money(code, beforeTax(c, base))}). 계산대에서 더 붙는 금액은 없어요.`,
    blocks: [{
      t: "table",
      head: r == null ? ["모델·용량", "apple.com 표시가"] : ["모델·용량", "apple.com 표시가", `${tk} ${r}% 뺀 금액`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(code, p)] : [label, money(code, p), money(code, beforeTax(c, p))])),
      caption: `Apple ${dom(code)} 표시가 = 픽업 때 결제액${r == null ? "" : ` · ${tk} 포함`}`,
      source: `[${src.label}](${src.url}); 가격: ${shop}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const duo = priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `${placeName} 매장에서 iPhone Duo를 받으면 세금 포함 최종가는?`, a: `약 ${money(code, t.total)}(256GB)예요. 세전 ${money(code, duo)}에 ${regionLabel(code, region!, L)}의 ${CA_PROVINCE_TAX[region!].label} ${t.rate}%가 매장 기준으로 더해진 값이에요.` }
      : { q: "캐나다 apple.com 가격은 세금이 빠진 금액인가요?", a: `네, 빠져 있어요. 256GB iPhone Duo 세전 ${money(code, duo)}에 픽업 매장이 속한 주의 GST·HST·주 판매세가 더해지고, 범위는 앨버타 5%에서 퀘벡 14.975%예요.` };
  }
  const r = includedRate(COUNTRIES[code]);
  return r == null
    ? { q: "홍콩 Apple Store에서 사면 세금이 따로 붙나요?", a: `안 붙어요. 홍콩은 판매세·부가세가 없어서, 256GB iPhone Duo는 apple.com 표시가 ${money(code, duo)}이 곧 결제액이에요.` }
    : { q: `${dom(code)} apple.com 가격은 ${taxKo(code)} 포함인가요?`, a: `포함이에요. 256GB iPhone Duo ${money(code, duo)} 안에 ${taxKo(code)} ${r}%가 들어 있어서, 픽업 때 추가로 낼 돈은 없어요.` };
}

/* ------------------------------------------------------------------ 지역·도시 페이지 */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  return fitTitleW([
    `${w} 애플스토어 ${k}곳: iPhone Duo(아이폰 듀오) 픽업 실시간`,
    `${w} 애플스토어 ${k}곳: iPhone Duo 픽업 실시간`,
    `${w} 애플스토어: 지금 iPhone 재고`,
    `${w} Apple Store iPhone 재고`,
  ]);
}

function priceBit(code: CountryCode, region?: string): string {
  const duo = priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `, Duo는 세금 포함 약 ${money(code, t.total)}` : `, Duo는 세전 ${money(code, duo)}`; }
  return `, Duo는 ${money(code, duo)}(${taxNote(code)})`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeLabel(i.cc, nameOf(i));
  return fitTitleW([
    `지금 ${w} Apple Store ${k}곳 중 ${i.stockNow.duo}곳에서 iPhone Duo 픽업 가능, 18 Pro Max는 ${i.stockNow["18-pro-max"]}곳. 매장별 재고와 재입고 시간${priceBit(i.cc, i.region)}.`,
    `지금 ${w} Apple Store ${k}곳 중 iPhone Duo ${i.stockNow.duo}곳, 18 Pro Max ${i.stockNow["18-pro-max"]}곳. 매장별 실시간 재고와 재입고 시간.`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = nameOf(i);
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? ` ${n(i.cities)}개 도시` : "";
  return `지금 이 순간 ${w}${cities}의 **Apple Store ${n(k)}곳** 중 **${n(i.stockNow.duo)}곳**에서 iPhone Duo(아이폰 듀오)를 매장 픽업할 수 있어요. iPhone 18 Pro Max는 **${n(i.stockNow["18-pro-max"])}곳**, iPhone 18 Pro는 **${n(i.stockNow["18-pro"])}곳**이에요.`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**네, ${n(k)}곳 중 ${n(have.length)}곳**이에요. 지금 ${list(L, have.map((s) => appleStoreLabel(s, L)), 4, (x) => `그 외 ${n(x)}곳`)}에서 iPhone Duo를 픽업할 수 있어요.`;
  if (st.month > 0) return `**지금은 없어요.** ${n(k)}곳 모두 iPhone Duo가 없지만, ${sinceWhen()} 합쳐서 **${n(st.month)}회** 재입고됐어요.`;
  return `**지금은 없어요.** ${n(k)}곳 모두 iPhone Duo가 없고, ${sinceWhen()} 확인된 Duo 재입고도 없어요.`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**이곳의 최근 Duo 재입고:** ${whenIn(i.cc, st.lastRestock.at)} · ${appleStoreLabel(last, L)}`);
  if (have.length > 0 && st.month > 0) items.push(`**${sinceWhen()} 확인:** ${w} 매장 전체에서 Duo 재입고 ${n(st.month)}회`);
  if (st.medianMs != null) items.push(`**재고가 떠 있는 시간:** 중앙값 기준 약 ${fmtDuration(st.medianMs, L)} 뒤에 Duo가 다시 품절돼요`);
  items.push(`**가장 빨리 구하는 방법:** 갈 수 있는 ${k <= 3 ? `매장 ${n(k)}곳 모두` : `가까운 매장 ${n(Math.min(k, 5))}곳`}에 [${w} iPhone Duo 알림 설정](${alert}). 알림을 건 매장은 5초 간격으로 확인해요`);
  items.push("**알림 규칙 하나** = 매장 하나 × 정확한 구성 하나. 두 번째 확인으로 재입고가 확정되고 약 3초 뒤 푸시가 와요");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**1분 뒤엔 달라질 수 있어요:** 다음 재입고는 apple.com을 새로고침하는 것보다 알림이 훨씬 먼저 잡아요." });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = nameOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `지금 iPhone Duo가 있는 ${w} Apple Store는 어디인가요?`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}에 iPhone 18 Pro Max 재고가 있나요?`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**네, ${n(k)}곳 중 ${n(i.stockNow["18-pro-max"])}곳**이에요. 지금 ${w}의 매장 × 구성 ${n(k * pm)}개 중 **${pct(L, pairsPct(i, "18-pro-max"))}**에 재고가 떠 있어요.`
        : `**지금은 없어요.** ${w}의 ${n(k)}곳 모두 iPhone 18 Pro Max를 픽업할 수 없어요.`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**지금 가장 구하기 어려운 구성:** ${list(L, scarce.map((x) => `${cfgKo(x.label)}(${n(k)}곳 중 ${n(x.stores)}곳)`))}`] : []),
        `**iPhone 18 Pro 쪽은:** 매장 ${n(i.stockNow["18-pro"])}/${n(k)}곳, 매장×구성 조합으로는 ${pct(L, pairsPct(i, "18-pro"))}가 픽업 가능`,
        `**${sinceWhen()} 확인:** ${i.max.month ? `18 Pro Max 재입고 ${n(i.max.month)}회` : "아직 18 Pro Max 재입고 없음"}`,
        ...(i.max.medianMs != null ? [`**재고가 떠 있는 시간:** 중앙값 기준 약 ${fmtDuration(i.max.medianMs, L)} 뒤에 Pro Max가 다시 품절돼요`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ 나라: 매장 목록과 홈 */

function storesIndexTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitTitleW([
    `${dom(code)} 애플스토어 ${k}곳: iPhone Duo(아이폰 듀오) 픽업 실시간`,
    `${dom(code)} 애플스토어 ${k}곳: iPhone Duo 픽업 실시간`,
    `${cn(code)} Apple Store: iPhone 재고 실시간`,
  ], 70);
}

function homeTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  return fitTitleW([
    `iPhone 재고 확인 ${cn(code)}: 애플스토어 ${k}곳 픽업 실시간`,
    `iPhone 재고 확인 ${cn(code)}: 픽업 재고 실시간`,
  ], 70);
}

function homeH1(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `${cn(code)} Apple Store의 iPhone 픽업 재고, 실시간` : `${dom(code)} Apple Store ${k}곳 전체의 iPhone 픽업 재고, 실시간`;
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return k === 1 ? `${cn(code)}의 하나뿐인 Apple Store` : `${dom(code)} Apple Store ${n(k)}곳 전체`;
}

/** 매장이 있는 곳 한 줄: "서울 6곳 · 경기도 1곳" / "8개 시·도, 22개 도시". */
function spreadPhrase(code: CountryCode): string {
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const stores = storesOf(code);
  if (stores.length === 1) return cityLabel(code, cities[0].name, L);
  if (cities.length === 1) return `모두 ${cityLabel(code, cities[0].name, L)}`;
  if (!COUNTRIES[code].regionNoun || regions.length === 1) {
    if (cities.length <= 4) return cities.map((x) => ({ name: cityLabel(code, x.name, L), k: stores.filter((s) => s.city === x.name).length })).sort((a, b) => b.k - a.k).map((x) => `${x.name} ${n(x.k)}곳`).join(" · ");
    return `${n(cities.length)}개 도시`;
  }
  if (regions.length <= 4) return regions.map((r) => ({ name: regionLabel(code, r.name, L), k: stores.filter((s) => s.state === r.name).length })).sort((a, b) => b.k - a.k).map((r) => `${r.name} ${n(r.k)}곳`).join(" · ");
  return `${regionWord(code)} ${n(regions.length)}곳에 걸친 도시 ${n(cities.length)}곳`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const name = model === "duo" ? "아이폰 듀오(iPhone Duo)" : m.name;
  const all = k === 1 ? "애플스토어" : `매장 ${k}곳`;
  return {
    title: fitTitleW([`${dom(code)} ${name} 재고 있나요? ${all} 실시간`, `${dom(code)} ${m.name} 재고 있나요? 실시간`, `${m.name} ${dom(code)} 재고`], 70),
    h2: [`지금 ${m.name}가 있는 ${dom(code)} Apple Store는 어디인가요?`, priceSection(code, dom(code), undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = priceRange(code, model);
  const p = code === "ca" ? `최저 **${money(code, r.low)}**(세전)` : `최저 **${money(code, r.low)}**(${taxNote(code)})`;
  return inStock === 0
    ? `지금 이 순간 ${eulReul(m.name)} 매장 픽업할 수 있는 ${dom(code)} Apple Store는 **없어요**(${k === 1 ? "단 한 곳" : `${n(k)}곳 모두`}, 모든 매장을 **15초 간격**으로 확인). 가격은 ${p}예요.`
    : `지금 이 순간 ${dom(code)} Apple Store **${n(k)}곳 중 ${n(inStock)}곳**에서 ${eulReul(m.name)} 매장 픽업할 수 있어요(모든 매장을 **15초 간격**으로 확인). 가격은 ${p}예요.`;
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const r = priceRange(code, model);
  return fitTitleW([
    `지금 ${dom(code)} Apple Store ${n(k)}곳 중 ${n(inStock)}곳에서 ${m.name} 픽업 가능. 매장별·구성별 재고, ${money(code, r.low)}부터${code === "ca" ? "(세전)" : ""}, 재입고 시간까지.`,
    `지금 ${dom(code)} Apple Store ${n(k)}곳 중 ${n(inStock)}곳에 ${m.name} 재고. 매장·구성별 실시간 픽업 재고, 재입고 시간, 알림.`,
  ], 155);
}

/* ------------------------------------------------------------------ 나라 홈 */

function homeDescription(code: CountryCode): string {
  const k = storesOf(code).length;
  const cur = COUNTRIES[code].currency === "KRW" ? "원화" : COUNTRIES[code].currency;
  return fitTitleW([
    `${allStoresPhrase(code)}의 iPhone Duo, 18 Pro, 18 Pro Max 픽업 재고를 15초 간격으로 확인. ${k === 1 ? "" : "재입고 시간과 "}${cur} 가격, 내 매장에 재입고되는 순간 푸시 알림.`,
    `${allStoresPhrase(code)}의 iPhone 픽업 재고를 15초 간격으로 확인. 재입고 시간, ${cur} 가격, 푸시 알림.`,
  ], 155);
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  return `${dom(code)} 최근 확인된 iPhone Duo(아이폰 듀오) 재입고: **{{duo.lastRestock}}**. 지금 이 순간 Apple Store **${n(k)}곳 중 {{duo.storesNow}}곳**에서 Duo를 픽업할 수 있고, iPhone 18 Pro Max는 **{{pm.storesNow}}곳**, iPhone 18 Pro는 **{{pro.storesNow}}곳**이에요.`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const k = storesOf(code).length;
  const stores = storesOf(code);
  return [
    {
      id: "iphone-stock",
      h2: `지금 ${dom(code)}에서 재고 있는 iPhone은?`,
      lead: `아래 표가 실시간으로 답해요. ${allStoresPhrase(code)}의 모든 구성에 대해 apple.com의 매장 픽업 가능 여부를 15초 간격으로 읽고${k > 1 ? `, 매장별·${regionWord(code)}별·구성별로 나눠 보여 줘요` : " 그대로 보여 줘요"}.`,
      blocks: [
        { t: "table", head: ["모델", "구성", "지금 재고 있는 매장", "확인된 재입고"], rows: cc.modelRows(code, i.storesNow, i.restocks), caption: `${dom(code)} 현황, {{asOf}} 기준` },
        { t: "ul", items: [
          "**두 번 확인해야 인정:** 두 번째 확인이 일치해야 변화를 게시해요. apple.com의 일시적 오류 한 번이 재입고나 품절로 보이지 않아요",
          "**처음 보인 건 재입고가 아니에요:** 처음 보이는 구성은 기준점으로만 기록해요",
          `**기록이 출처예요:** 확인된 변화는 모두 [재입고 기록](${i.restocksPath})에 남고, ${i.index?.indexable ? `[매장 페이지](${i.index.path})` : "매장 페이지"}의 재입고 차트도 여기서 그려져요`,
          `**범위:** ${spreadPhrase(code)} · 가격과 부품 번호는 Apple ${dom(code)} 기준. 알림을 건 매장은 5초 간격으로 확인해요`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, dom(code)),
    {
      id: "alerts",
      h2: `${dom(code)} 재입고 알림은 어떻게 작동하나요?`,
      lead: `매장${k === 1 ? "" : "들"}과 정확한 iPhone을 고르면, ${k === 1 ? "그 매장" : "그중 한 곳"}에 매장 픽업 재고가 뜰 때 재입고가 확정되고 약 3초 뒤 휴대폰으로 푸시가 와요.`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `**알림 받기**에서 iPhone, 용량, 색상을 고르세요. 매장은 ${cityLabel(code, stores[0].city, L)}의 ${appleStoreLabel(stores[0], L)}예요.` : "**알림 받기**에서 iPhone, 용량, 색상을 고른 뒤 갈 수 있는 매장을 체크하세요. 가까운 순으로, 도로 거리(km)와 운전 시간이 함께 나와요.",
          "iPhone에서는 RestockWire를 홈 화면에 추가하고 알림을 허용하세요. iOS는 설치된 앱에만 웹 푸시를 보내요([설치 방법](/phone-alerts)).",
          "푸시를 누르면 apple.com이 열려요. 결제 단계에서 ‘매장 픽업’과 알림 속 그 매장을 고르면 끝이에요.",
        ] },
        { t: "table", head: ["요금제", "월 요금(USD)", "알림 규칙"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "규칙 하나 = 매장 하나 × 정확한 구성 하나 · 둘러보기는 계속 무료, 속도는 모든 요금제가 같아요([요금제](/pricing))" },
        { t: "note", text: "**저희 판단:** Duo는 갈 수 있는 모든 매장에 알림을 걸 만해요. 18 Pro와 Pro Max는 실시간 수치부터 확인하세요." },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const p = code === "us" ? "" : `/${code}`;
  const when = rt.n === 0
    ? `아직 0건이에요. 11월 2일부터 추적 중이고, 첫 재입고가 확인되면 [${dom(code)} iPhone Duo 재입고 시간표](${rt.path})에 현지 시각과 요일로 쌓여요.`
    : rt.peakHour != null
      ? `**현지 ${hourLabel(rt.peakHour, L)} 무렵**이 가장 잦아요. 근거는 11월 2일 이후 확인된 재입고 ${n(rt.n)}건(매장 ${n(rt.stores)}/${n(rt.storesTotal)}곳)이에요. [시각·요일별 표](${rt.path}).`
      : `11월 2일 이후 ${n(rt.n)}건(매장 ${n(rt.stores)}/${n(rt.storesTotal)}곳)이 확인됐어요. 날짜 수가 모자라 몰리는 시간을 짚기엔 아직 일러요. [시각·요일별 표](${rt.path}).`;
  return [
    { q: `지금 이 순간 iPhone Duo를 픽업할 수 있는 ${dom(code)} Apple Store는 어디인가요?`, a: `마지막 확인({{asOf}}) 기준 ${n(k)}곳 중 {{duo.storesNow}}곳이에요. [${dom(code)} iPhone Duo 재고](${p}/in-stock/iphone-duo)에 매장과 구성별로 나오고, 15초 간격으로 갱신돼요.` },
    { q: `${dom(code)} 애플스토어에 iPhone Duo는 몇 시쯤 들어오나요?`, a: when },
    { q: `RestockWire는 ${dom(code)} 재입고를 얼마나 빨리 잡나요?`, a: `알림을 건 매장은 5초 간격, ${dom(code)}의 모든 Apple Store는 15초 간격으로 확인해요. 처음 보인 ‘재고 있음’은 1초 안에 다시 확인하고, 확정된 재입고는 약 3초 뒤 휴대폰에 도착해요.` },
    { q: "재고를 보려면 요금제가 필요한가요?", a: "아니요. 실시간 재고, 지도, 재입고 기록은 무료예요. 요금제는 알림 규칙을 더해 주고 미국 달러로 청구돼요. Plus 월 $5에 10개, Pro $10에 20개, Max $20에 50개이며 언제든 해지할 수 있어요([요금제](/pricing))." },
    taxFaq(code, dom(code)),
    { q: "알림이 iPhone을 대신 잡아 두나요?", a: `아니요. 그건 apple.com 픽업 주문만 할 수 있어요. 알림은 먼저 결제 화면에 도착하게 해 주고, 결제하면 Apple이 제품을 보관해 둬요([Apple 픽업 도움말](${pickupHelp(code).url})).` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code: CountryCode) => `RestockWire iPhone 재고 확인 · ${cn(code)}`,
  offer: "실시간 재고, 지도, 재입고 기록은 무료, 알림 요금제는 월 $5부터",
  itemList: (code: CountryCode) => `${cn(code)} Apple Store`,
  restockTimesChip: "재입고 몰리는 시간",
  storesByRegion: (code: CountryCode) => `${regionWord(code)}별 매장`,
  browse: (code: CountryCode) => `${dom(code)} 지역별 재고`,
  selloutH2: (code: CountryCode) => `${dom(code)} iPhone 재입고 재고는 얼마나 버티나요?`,
  selloutLabel: (code: CountryCode) => `${dom(code)} Apple Store`,
  last24Label: (code: CountryCode) => dom(code),
  newsroom: "Apple Newsroom(2026년 10월 23일): iPhone Duo 전 세계 Apple Store 판매 개시",
};

/** 매장 페이지 <title>·H1: "Apple 가로수길: 오늘 iPhone 재고·매장 픽업·영업시간" (도시의 유일한 매장이면 괄호에 도시). */
function storeTitle(s: Store, region?: string): string {
  return enStoreTitle(s, undefined, undefined, region, L);
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel,
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
  modelRows: cc.modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({ pickupHelp: helpSource(code), storeList: { label: `Apple ${cn(code)} 매장 찾기 목록`, url: storeListSource(code).url }, tax: taxSource(code) }),
};

