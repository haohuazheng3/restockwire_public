/**
 * 한국어 문구: views — 제품 × 장소 페이지, 재입고 기록, 실시간 지도, iPhone Duo 재입고 시간 답변 페이지, 매장 목록.
 * `c: Country`는 영어 데이터라 나라 이름은 places.countryLabel로, 지역 단위는 한국어 단어로 써요.
 * 한국 페이지에서는 나라를 "국내"라고 불러요(다른 나라는 그 나라 이름).
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, hourLabel, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { includedRate, taxName } from "@/content/country-tax";
import { distance, fitTitleW, list, num, price, stamp, weekdays } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import type { Dict } from "../en";
import { euro, eulReul, eunNeun, iGa, ieyo } from "./common";

const L = "ko" as const;
const n = (x: number) => num(L, x);
const cn = (c: Country | CountryCode) => countryLabel(typeof c === "string" ? c : c.cc, L);
/** "국내"(한국) / 나라 이름(다른 나라). */
const dom = (c: Country) => (c.cc === "kr" ? "국내" : cn(c));
const REGION_WORD: Record<string, string> = { state: "주", province: "주", area: "지역", department: "데파르트망", prefecture: "도도부현", emirate: "토후국", canton: "칸톤", region: "지역", county: "카운티", city: "도시" };
const rw = (c: Country) => REGION_WORD[c.regionNoun ?? "area"] ?? "지역";
const taxNote = (c: Country) => {
  if (c.cc === "ca") return "세전";
  const r = includedRate(c);
  const t = taxName(c);
  return r == null ? "판매세 없음" : `${t === "VAT" ? "부가세" : t === "consumption tax" ? "소비세" : t} ${r}% 포함`;
};
/** 제품 이름 속 영어 색상 이름을 한국어로("iPhone Duo 512GB Night Sky" → "… 나이트 스카이"). */
const COLORS = ["Night Sky", "Star White", "Black", "Burgundy", "Glacier", "Silver"];
const ko = (s: string) => COLORS.reduce((acc, col) => acc.replace(new RegExp(`\\b${col}\\b`), colorLabel(col, L)), s);
/** 장소 이름(한국어). */
const placeKo = (place: Place) => {
  const code = place.country ?? "us";
  if (place.level === "country") return code === "kr" ? "국내" : cn(code);
  if (place.level === "state") return regionLabel(code, place.state!, L);
  if (place.level === "city") return cityLabel(code, place.city!, L);
  return appleStoreLabel(place.store!, L);
};

/* ---------------------------------------------------------------- 재입고 시간 페이지 형식 */

const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`)).replace(" (", "(");
const longDate = (ymd: string) => new Intl.DateTimeFormat("ko-KR", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, c.cc !== "kr");
const hr = (h: number) => hourLabel(h, L);
/** "9–11시". */
const range = (from: number, to: number) => `${from}–${to % 24}시`;
const wd = (d: number) => weekdays(L)[d];
const local = (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L);
const yet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : "아직 ");

/* ---------------------------------------------------------------- 제품 × 장소 */

function productName(product: Product, short = false): string {
  const m = modelByKey(product.model)!;
  return `${short ? m.short : m.name}${product.storage ? ` ${product.storage}` : ""}${product.color ? ` ${colorLabel(product.color, L)}` : ""}`;
}

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = place.country ?? "us";
  const name = productName(product);
  const short = productName(product, true);
  const w = placeKo(place);
  const k = place.stores.length;
  if (place.level === "country") {
    const where = code === "us" ? "미국" : w;
    return fitTitleW([
      ...(inStock > 0 ? [`${name} 픽업 재고: 지금 ${where} Apple Store ${n(inStock)}곳`] : []),
      `${name} ${where} 픽업 재고 실시간`,
      `${short} ${where} 픽업 재고`,
      `${short} 픽업 재고`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${w} ${name} ${inStock > 0 ? "지금 재고 있음" : "픽업 재고"}`,
      `${w} ${short} 재고 · ${cityLabel(code, s.city, L)}`,
      `${w} ${short} 재고`,
      `${storeLabel(s, L)} ${short} 재고`,
    ]);
  }
  return fitTitleW([
    `${w} ${name} 재고: ${n(k)}곳 중 ${n(inStock)}곳`,
    `${w} ${name} 픽업 재고`,
    `${w} ${short} 재고`,
    `${short} · ${w}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const code = place.country ?? "us";
  const name = productName(product);
  const week = `지난 7일 재입고 ${n(stats.week)}회`;
  if (place.level === "store") {
    const s = place.store!;
    const w = placeKo(place);
    return fitTitleW([
      `${w}${w.includes(cityLabel(code, s.city, L)) ? "" : `(${cityLabel(code, s.city, L)})`} ${name} 픽업 재고: ${inStock > 0 ? "지금 재고 있음" : "지금은 없음"}, ${week}. 실시간 상태, 평소 재입고 시간, 알림.`,
      `${w} ${name}: ${inStock > 0 ? "지금 재고 있음" : "지금은 없음"}, ${week}. 실시간 상태와 알림.`,
    ], 155);
  }
  const where = place.level === "country" ? (code === "us" ? "미국 Apple Store" : `${placeKo(place)} Apple Store`) : `${placeKo(place)} Apple Store`;
  return fitTitleW([
    `${name} 픽업 재고: 지금 ${where} ${n(place.stores.length)}곳 중 ${n(inStock)}곳, ${week}. 매장별 실시간 재고, 평소 재입고 시간, 알림.`,
    `${name}: 지금 ${where} ${n(place.stores.length)}곳 중 ${n(inStock)}곳, ${week}. 매장별 실시간 재고와 알림.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const code = place.country ?? "us";
  const name = productName(product);
  const w = placeKo(place);
  const at = `${w}에서`;
  const dist = (miles: number) => distance(L, code, miles);
  const near = nearest ? `${nearest.city}의 Apple ${nearest.name}(${dist(nearest.distance)})` : "";
  const out: FaqItem[] = [];
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${w}에 ${name} 재고가 있나요?`,
      a: l && l.available.length > 0
        ? `네${product.parts.length > 1 ? `, ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (x) => `외 ${n(x)}개`)}` : ""}. 최근 확인 기준이에요.`
        : `최근 확인에서는 없었어요${nearest ? `. 지금 재고가 있는 가장 가까운 매장은 ${ieyo(near)}` : ""}.`,
    });
  } else {
    out.push({
      q: `지금 ${name} 재고가 있는 ${w} Apple Store는 어디인가요?`,
      a: inStock.length === 0
        ? `최근 확인에서는 없었어요${nearest ? `. 지금 재고가 있는 가장 가까운 곳은 ${ieyo(near)}` : ""}.`
        : `최근 확인 기준 ${n(inStock.length)}곳: ${list(L, inStock.map((x) => appleStoreLabel(x.store, L)), 4, (x) => `외 ${n(x)}곳`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${at} ${eunNeun(name)} 얼마나 자주 재입고되나요?`,
    a: stats.month === 0 ? `최근 ${n(stats.days)}일 동안 ${at} 재입고는 0회예요.` : `최근 ${n(stats.days)}일 동안 ${n(stats.month)}회, 지난 7일 ${n(stats.week)}회${peak ? `. 주로 현지 시간 ${peak.hour} 무렵이에요` : "예요"}.`,
  });
  if (stats.medianMs != null) out.push({ q: `${at} 재고가 돌아오면 얼마나 오래 남아 있나요?`, a: `품절되기까지 중앙값으로 약 ${fmtDuration(stats.medianMs, L)}이에요.` });
  return out;
}

function priceLabel(product: Product): string {
  const code = product.country ?? "us";
  const prices = catalogFor(product.model, code).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => dom(c),
    liveMap: "실시간 지도",
    restockLog: "재입고 기록",
    alertMe: "알림 받기",
    lastDays: (days: number) => <>{n(days)}일, 하루씩</>,
    since: "2026년 11월 2일",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cn(c)}의 Apple Store` : `${dom(c)} Apple Store ${n(k)}곳 전체`),
    checker: (c: Country) => `${cn(c)} iPhone 재고 확인`,
    appleStoresIn: (c: Country) => `${cn(c)} Apple Store`,
    storesWithIt: "재고가 올라온 매장",
    more: "더 보기",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${dom(c)} ${ko(model)} 매장 픽업 재고`,
    h1Place: (model: string, where: string) => `${where} ${ko(model)}`,
    inStockNow: "지금 재고",
    yes: "있음",
    no: "없음",
    pickup: "픽업",
    configurations: "구성",
    ofStores: (k: number) => `매장 ${n(k)}곳 중`,
    restocks24h: "재입고 · 24시간",
    restocksHint: (week: number, month: number, days: number) => `7일 ${n(week)} · ${n(days)}일 ${n(month)}`,
    sellOuts: (days: number) => `품절 · ${n(days)}일`,
    stays: (ms: number) => `~${fmtDuration(ms, L)} 유지`,
    noPairs: "아직 짝지은 품절 없음",
    lastRestock: "최신 재입고",
    noneYet: "아직 없음",
    thisConfig: "이 구성",
    inDays: (days: number) => `최근 ${n(days)}일`,
    notInStockNow: "지금은 재고 없음",
    configsInStock: (k: number, of: number) => <span>구성 {n(of)}개 중 <b className="text-ink">{n(k)}</b>개 재고 있음</span>,
    inStockAt: (k: number, of: number) => <span>매장 {n(of)}곳 중 <b className="text-ink">{n(k)}</b>곳에 재고 있음</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{live} 확인 · {p}{tax}</>,
    taxNote,
    beforeTax: "세전",
    buyOnApple: "apple.com에서 주문하기",
    allStoresIn: (c: Country) => `${dom(c)} 모든 매장`,
    everyIphoneHere: "이곳의 모든 iPhone",
    everyIphone: (where: string) => `${where}의 모든 iPhone`,
    panel: (model: string, where: string | null) => `${where ? `${where} ` : ""}${ko(model)}: 구성을 고르고, 매장을 고르세요`,
    unitConfigs: "구성",
    unitStores: "매장",
    otherConfigsHere: "이곳의 다른 구성",
    byStorageColor: "용량과 색상",
    nearestStores: "가장 가까운 매장",
    closest: (link: ReactNode, dist: string) => <>재고가 올라온 가장 가까운 매장: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "가장 최근에 재고가 올라온 곳",
    storesWithItNow: "지금 재고가 올라온 매장",
    storesIn: (where: string) => `${where} 매장`,
    colStatus: "상태",
    colConfigs: "재고 있는 구성",
    noStoreHasIt: "지금은 재고가 올라온 매장이 없어요.",
    noStoreHereHasIt: "지금 이 지역에는 재고가 올라온 매장이 없어요.",
    moreStores: (k: number) => <>매장 {n(k)}곳 더, 아래에 지역별로 정리했어요.</>,
    byRegion: (c: Country) => `${rw(c)}별`,
    byCity: "도시별",
    nearbyStores: "가까운 매장",
    latestChanges: "최신 변화",
    nothingLogged: "아직 기록이 비어 있어요.",
    whenRestocks: "평소 재입고 시간",
    howFast: "재입고가 얼마나 가는지",
    restocksByConfig: "어떤 구성이 재입고되는지",
    faqTitleCountry: (model: string, c: Country) => `${dom(c)} ${ko(model)}: 묻고 답하기`,
    faqTitle: (model: string, where: string) => `${where} ${ko(model)}`,
    buySource: (model: string, c: Country) => `Apple: ${ko(model)} 주문 페이지(${cn(c)})`,
    nearby: "가까운 곳",
    otherRegions: (c: Country) => `다른 ${rw(c)}`,
    elsewhereIn: (region: string) => `${region}의 좀 더 먼 곳`,
    everyAppleStoreIn: (c: Country) => `${dom(c)} Apple Store 전체 목록`,
    across: (model: string, c: Country) => `${c.cc === "us" ? "미국" : dom(c)} 전역 ${ko(model)}`,
    itemList: (model: string, where: string) => `${where} ${ko(model)}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `지금 ${eulReul(ko(model))} 픽업 재고로 올린 ${dom(c)} Apple Store는 없어요. 그래서 ‘내 주변’은 가까운 매장 중 어디가 먼저 재입고되느냐의 문제예요. 갈 수 있는 매장마다 알림을 걸어 두면 한 곳에 뜨는 즉시 몇 초 안에 휴대폰으로 푸시가 와요.`
        : `지금 ${n(k)}곳 중 ${n(inStock)}곳에 ${iGa(ko(model))} 올라와 있어요: ${list(L, have.slice(0, 5).map((l) => `${l.city}의 ${l.store}(구성 ${n(l.configs)}개)`), 5)}.`,
    nearHead: (c: Country) => [rw(c), "지금 재고가 올라온 매장"],
    nearCaption: (c: Country, model: string) => `${rw(c)}별 ${ko(model)} 픽업 재고, 최근 확인 기준`,
    nearMe: (c: Country, model: string, alert: string) => `이 페이지의 알림 설정에서 ‘내 주변’을 누르면 지금 있는 곳에서 가까운 순으로 모든 매장이 정렬돼요. 거리는 도로 기준 ${c.unit === "mi" ? "마일" : "km"} 추정치이고, 매장마다 길찾기 링크가 있어요. [${ko(model)} 알림 설정하기](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      const m = ko(model);
      return {
        price: { q: `${dom(c)}에서 ${m} 가격은 얼마인가요?`, a: `apple.com 기준 ${money(low)}~${money(high)}이고 용량에 따라 달라요(${taxNote(c)}).` },
        reserve: { q: `${dom(c)}에서 ${eulReul(m)} 픽업용으로 미리 예약할 수 있나요?`, a: `미리는 안 돼요. 매장에 원하는 구성이 뜨면 apple.com에서 매장 픽업으로 주문하고, Apple이 고른 시간대까지 보관해 줘요.${inStock === 0 ? " 지금은 재고가 올라온 매장이 없으니, 가장 먼저 닿는 방법은 알림이에요." : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${dom(c)} iPhone 재입고 기록 실시간: ${k === 1 ? "Apple Store" : `Apple Store ${n(k)}곳`}`,
    metaDescription: (c: Country) => `${dom(c)} Apple Store에서 확인된 iPhone Duo, 18 Pro, Pro Max 매장 픽업 재입고를 하나하나 기록해요. 시각, 정확한 구성, 지도까지.`,
    h1: (c: Country) => `${dom(c)} iPhone 재입고, 일어나는 그대로`,
    summary: (day: number, week: number, model?: string, region?: string) => <>최근 24시간 재입고 {n(day)}회 · 7일 {n(week)}회{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. 시간은 내 시간대로 표시돼요.</>,
    allModels: "모든 모델",
    restocks: "재입고",
    withSoldOut: "재입고와 품절",
    regionLabel: (c: Country) => rw(c),
    allRegions: (c: Country) => `모든 ${rw(c)}`,
    filter: "적용",
    page: (k: number) => <>{n(k)}페이지</>,
    newer: "← 최신",
    older: "이전 →",
    getAlerts: "알림 설정하기",
    byPlace: "장소별 재입고",
    byRegion: (c: Country) => `${rw(c)}별`,
    datasetName: (c: Country) => `${dom(c)} Apple Store iPhone 매장 픽업 재입고`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "미국 Apple Store 269곳 전체" : `${dom(c)} Apple Store`}에서 확인된 iPhone Duo, iPhone 18 Pro, iPhone 18 Pro Max의 매장 픽업 재입고와 품절(매장, 정확한 구성, 시각). 매장은 15초마다(알림이 설정된 곳은 5초마다) 확인하고, apple.com이 같은 답을 두 번 줄 때만 재입고로 기록해요.`,
    datasetMeasured: ["Apple Store", "iPhone 모델, 용량, 색상", "재입고 시각", "품절 시각"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `iPhone Duo 실시간 재고 지도: ${dom(c)} ${k === 1 ? "Apple Store" : "모든 Apple Store"}`,
    metaDescription: (c: Country, k: number) => `지금 iPhone Duo, 18 Pro, Pro Max 매장 픽업 재고가 어디에 있는지 한눈에. ${k === 1 ? `${cn(c)}의 Apple Store` : `${dom(c)} Apple Store ${n(k)}곳 전체`}를 용량·색상별로 보여 주는 실시간 지도예요.`,
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "모든 매장",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `${rw(c)}·도시별` : cities > 1 ? "도시별" : "";
      return `지금 iPhone Duo는 ${n(duo)}곳, Pro Max는 ${n(max)}곳에 재고가 있어요. ${dom(c)} Apple Store ${n(k)}곳 전체${by ? `(${by})` : ""}의 실시간 픽업 재고, 18 Pro도 포함.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) =>
      `${n(k)}곳이에요(${spread}).${top.length && !spread.includes(top[0].name) ? ` ${iGa(top[0].name)} ${n(top[0].count)}곳으로 가장 많고${top[1] ? `, ${top[1].name}(${n(top[1].count)}곳)이 뒤를 이어요` : "요"}.` : ""}`,
    howMany: (c: Country) => <>{dom(c)}에는 Apple Store가 몇 곳 있나요?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `지금 iPhone Duo 재고가 있는 ${dom(c)} Apple Store는 어디인가요?`,
      a: have.length === 0
        ? `최근 확인에서는 ${n(k)}곳 모두 없었어요. 한 곳에 뜨는 순간 이 페이지와 지도가 바뀌고, 알림은 그보다 먼저 도착해요.`
        : `최근 확인 기준 ${n(k)}곳 중 ${n(have.length)}곳: ${have.slice(0, 6).map((x) => appleStoreLabel(x, L)).join(", ")}${have.length > 6 ? " 등" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, place: ctx.place === cn("kr") ? "국내" : ctx.place, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `가장 빨리 손에 넣는 길은 갈 수 있는 매장에 알림을 거는 거예요: [iPhone Duo 알림 설정하기](${alert}). 알림 하나는 매장 하나 × 정확한 구성 하나이고, 그 매장에 재고가 뜨면 몇 초 안에 휴대폰이 알려 줘요.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) =>
      `지금 이 순간 iPhone Duo는 **${n(now.duo)}곳**, iPhone 18 Pro Max는 **${n(now.max)}곳**, 18 Pro는 **${n(now.pro)}곳**에서 픽업 재고로 올라와 있어요. ${dom(c)}의 **Apple Store ${n(k)}곳** 기준이에요(${spread}). ${tax}`,
    crumb: "Apple Store",
    panel: (c: Country) => `iPhone을 고르고, 갈 수 있는 ${dom(c)} 매장을 체크하세요`,
    matrixLabel: "매장별 재고",
    matrixH2: (c: Country) => <>{dom(c)} 매장별 재고</>,
    matrixHint: "모델별로 지금 재고 / 추적 중인 구성.",
    topCaption: (c: Country) => <>Apple Store 수로 본 {rw(c)} 순위(Apple 매장 목록 기준, 이 사이트에서 추적 중)</>,
    regionHead: (c: Country) => rw(c),
    colStores: "Apple Store",
    colCities: "도시",
    locationsBy: (c: Country) => `Apple Store는 어디에 있나요: ${rw(c)}별`,
    locationsIn: (c: Country) => `${dom(c)}의 모든 Apple Store 위치`,
    storeCount: (k: number) => <>매장 {n(k)}곳</>,
    storeCountAll: (k: number) => <>매장 {n(k)}곳</>,
    whenRestock: (c: Country) => <>{dom(c)} 매장은 몇 시에 재입고되나요?</>,
    howFast: (c: Country) => <>{dom(c)}에서 재입고는 얼마나 가나요?</>,
    faqTitle: (c: Country) => `${dom(c)} Apple Store: 묻고 답하기`,
    getApp: "앱 받기",
    howItWorks: "작동 방식",
    pricing: "요금제",
  },

  restockTimes: {
    fmt: {
      n,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local,
      hour: hr,
      range,
      weekday: wd,
      store: (s: Store) => appleStoreLabel(s, L),
      storeWithPlace: (s: Store) => `${appleStoreLabel(s, L)}(${cityLabel(s.country ?? "us", s.city, L)})`,
    },
    title: (c: Country) => `${dom(c)} iPhone Duo(아이폰 듀오), Apple은 몇 시에 재입고할까?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "주" : rw(c);
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${since} 이후 ${dom(c)} Apple Store iPhone Duo 재입고 ${n(t.n)}회: ${rtPct(w.share)}가 현지 시간 ${range(w.from, w.to)}${t.sellout ? `, ${rtPct(t.sellout.within2min)}는 2분 안에 품절` : ""}. 시간·날짜·${region}·매장·구성별 표.`,
          `${since} 이후 ${dom(c)} Apple Store iPhone Duo 재입고 ${n(t.n)}회: ${rtPct(w.share)}가 현지 시간 ${range(w.from, w.to)}. 시간·날짜·${region}·구성별 표.`,
          `${dom(c)} iPhone Duo 재입고 시간: ${since} 이후 ${n(t.n)}회, 시간·날짜·${region}·구성별.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${since} 이후 ${dom(c)} Apple Store에서 확인된 iPhone Duo 재입고 ${n(t.n)}회. ${SPEED.checkSec}초마다 확인한 데이터를 현지 시간·날짜·${region}·매장·구성별로, 각 재입고가 얼마나 갔는지까지.`,
            `${dom(c)} iPhone Duo 재입고 시간: ${since} 이후 확인된 재입고 ${n(t.n)}회, 시간·날짜·${region}·구성별.`,
          ], 158)
          : `${dom(c)} Apple Store의 iPhone Duo 재입고 시간을 시간별·날짜별·매장·구성별로. ${longDate(t.since)}부터 RestockWire가 모든 매장을 ${SPEED.checkSec}초마다 읽고 있어요.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${dom(x.c)}에서 Apple은 iPhone Duo를 몇 시에 재입고하나요?`
      : x.t.n > 0
        ? `${dom(x.c)}에서 Apple은 iPhone Duo를 몇 시에 재입고하나요? ${x.pattern ? `가장 잦은 건 현지 시간 ${range(x.w.from, x.w.to)}` : "저희가 직접 확인한 시간별 기록"}`
        : `${dom(x.c)}에서 Apple이 iPhone Duo를 재입고하고 있나요? 아직은 아니에요, 저희가 지켜보는 내용은 이래요`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)} Apple Store`;
      return t.unknown ? (
        <>재입고 기록을 잠시 불러올 수 없어요. {dom(x.c)} 매장은 계속 {SPEED.checkSec}초 주기로 확인 중이고, 다음에 페이지를 열면 수치가 돌아와요.</>
      ) : t.n > 0 && pattern ? (
        <>
          {longDate(t.since)} 이후 RestockWire가 {where}에서 확인한 <b className="text-ink">iPhone Duo 재입고 {n(t.n)}회 중 {rtPct(w.share)}</b>가 매장 현지 시간 <b className="text-ink">{range(w.from, w.to)}</b>에 들어왔어요{x.sell ? <>. 보통은 약 {n(Math.round(x.sell.medianSec / 5) * 5)}초 만에 사라졌어요</> : null}. <b className="text-ink">재입고는 지금도 이어지고 있어요</b>{tracked > 1 ? <>: 추적한 {n(tracked)}일 중 {n(t.days)}일에 재입고가 있었어요</> : <>(아직 추적 1일째)</>}.
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">네.</b> {where}에서 <b className="text-ink">{longDate(t.since)} 이후 iPhone Duo 재입고 {n(t.n)}회</b>{tracked > 1 ? <>(추적한 {n(tracked)}일 중 {n(t.days)}일)</> : <>(아직 추적 1일째)</>}. 서로 다른 {PATTERN_MIN_DAYS}일에 걸쳐 재입고가 {PATTERN_MIN}회 쌓이면 평소 시간대를 알려 드려요.
        </>
      ) : (
        <>
          <b className="text-ink">아직은 아니에요.</b> RestockWire는 {longDate(t.since)}부터 {one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)} Apple Store ${n(x.stores)}곳 전체`}를 {SPEED.checkSec}초마다 읽었지만, 확인된 iPhone Duo 매장 픽업 재입고는 한 번도 없었어요.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `${dateLabel(x.t.since, false)} 이후 확인된 재입고`,
      window: (x: RestockTimesView) => `매장 현지 시간 ${range(x.w.from, x.w.to)}에 들어옴`,
      days: "재입고가 있었던 날",
      // 영어 원문이 문자열 리터럴 타입이라 한국어 문장으로 단언해요.
      now: ((one: boolean): string => (one ? "지금 이 순간 픽업 재고가 있는 매장" : "지금 이 순간 픽업 재고가 있는 매장 수")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `오늘 지금까지(${dateLabel(today.date)})${x.one ? "" : ` · 매장 ${n(today.stores)}곳`}`,
      weekday: "지금까지 가장 바쁜 요일",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>최신: <b className="text-ink">{latest.config}</b>{x.one ? null : <>, <Link href={storePath(latest.store)} className="underline underline-offset-2">{appleStoreLabel(latest.store, L)}</Link></>}, 현지 시간 {local(latest.at, latest.store)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>가장 많은 요일은 <b className="text-ink">{wd(x.t.peakWeekday)}</b></> }] : []),
      { text: <><b className="text-ink">공식 재입고 일정은 없어요</b>. 이 수치는 저희가 직접 확인한 것이고, 약 5분마다 갱신돼요</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>지금 이 순간 <b className="text-ink">{n(x.stores)}곳 중 {n(x.duoNow)}곳</b>에 픽업 재고가 있어요</> },
      { text: <>첫 재입고가 확인되면 아래 표가 모두 채워지기 시작해요</>, step: true },
      { text: <>표본이 가장 큰 시간·요일 패턴은 <Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">미국 페이지(영문)</Link>에서 보세요</>, step: true },
    ],
    setUpAlert: "iPhone Duo 알림 받기",
    logLive: "실시간 재입고 기록",
    onThisPage: "목차",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "시간대",
      "day-by-day": "날짜",
      where: `${x.us ? "주" : rw(x.c)}별`,
      configuration: "구성",
      "how-long": "품절 속도",
      unavailable: "“픽업 불가”",
      reddit: "Reddit 속설",
      method: "방법",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${dom(x.c)}에서 iPhone Duo는 몇 시에 돌아오나요?`,
      "day-by-day": `${dom(x.c)}에서 iPhone Duo가 재입고된 날은 언제였나요?`,
      where: `${dom(x.c)}에서 iPhone Duo가 가장 자주 재입고되는 곳은 어디인가요?`,
      configuration: `${dom(x.c)}에서 가장 많이 재입고되는 iPhone Duo 용량과 색상은?`,
      "how-long": `${dom(x.c)}에서 iPhone Duo 재입고는 몇 초나 가나요?`,
      unavailable: "왜 apple.com은 모든 매장에서 “현재 구매 불가”라고 보여 주나요?",
      reddit: "Reddit의 iPhone Duo 재입고 속설, 기록과 대조해 보기",
      method: "RestockWire에서 재입고로 치는 건 무엇인가요?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = dom(x.c);
      const win = range(w.from, w.to);
      return [
        { q: `${where}에서 Apple은 iPhone Duo를 언제 재입고하나요?`, a: t.n > 0 && pattern
          ? `${longDate(t.since)} 이후 확인된 재입고 ${n(t.n)}회 중 ${rtPct(w.share)}가 매장 현지 시간 ${win}에, ${rtPct(hourShare(t.byHour, 8, 12))}가 오전 8시~정오에 들어왔어요. 공식 일정은 없고, 이건 RestockWire가 관찰한 패턴으로 약 5분마다 갱신돼요.`
          : `RestockWire가 ${longDate(t.since)} 이후 ${where}에서 기록한 확인된 재입고는 ${n(t.n)}회${t.days ? `(${n(t.days)}일)` : ""}이고, Apple은 일정을 알리지 않아요. 서로 다른 ${PATTERN_MIN_DAYS}일에 걸쳐 재입고가 ${PATTERN_MIN}회 쌓이면 이 페이지가 스스로 평소 시간대를 보여 줘요.` },
        { q: `${us ? "" : `${where}에서는 `}주말에도 iPhone Duo가 재입고되나요?`, a: t.n > 0
          ? `${weekend > 0 ? "네, 돼요" : "아직은 없어요"}. ${n(t.n)}회 중 ${n(weekend)}회(${rtPct(weekend / t.n)})가 토요일이나 일요일이었어요. ${t.peakWeekday != null ? `지금까지 가장 바쁜 요일은 ${ieyo(wd(t.peakWeekday))}.` : `가장 바쁜 요일은 데이터가 ${WEEKDAY_MIN_SPAN}일치 쌓여야 말할 수 있어요. 지금은 ${n(tracked)}일치예요.`}`
          : `${where}의 주말 데이터는 아직 없어요. 이 페이지의 날짜 표는 재입고가 확인될 때마다 늘어나요.` },
        { q: "apple.com은 언제부터 지켜보면 되나요?", a: t.n > 0 && pattern
          ? `직접 본다면 현지 시간 ${hr(w.from)}부터 픽업을 선택한 apple.com을 열어 두세요. 그 두 시간에 재입고의 ${rtPct(w.share)}가 몰려 있어요. 재입고는 ${sell ? `중앙값 ${n(sell.medianSec)}초 만에 사라졌으니` : "보통 1분 남짓이라"}, ${SPEED.fastSec}초 주기의 알림([알림 작동 방식](/iphone-duo-restock-alerts))이 아무리 새로고침해도 이길 수 없는 이유예요.`
          : `${where}의 패턴이 아직 만들어지는 중이라면 알림이 대신 지켜볼 수 있어요. 고른 매장은 밤낮없이 ${SPEED.fastSec}초 주기로 확인돼요([알림 작동 방식](/iphone-duo-restock-alerts)).` },
        { q: "왜 모든 Apple Store에서 iPhone Duo가 “구매 불가”인가요?", a: sell
          ? `재입고가 짧기 때문이에요. ${where}에서 품절까지 측정한 재입고 ${n(sell.n)}회 중 ${rtPct(sell.within2min)}가 2분 안에, ${rtPct(sell.within20min)}가 20분 안에 사라졌어요. 지금은 ${n(x.stores)}곳 중 ${n(x.duoNow)}곳에만 재고가 있어서, 재입고가 수십 번 있는 날에도 대부분의 시간에 apple.com은 사실대로 “구매 불가”라고 해요([“구매 불가”의 뜻](/apple-store-pickup-explained)).`
          : `픽업 재고는 몇 분씩만 떠요. 지금 ${where} 매장 ${n(x.stores)}곳 중 ${n(x.duoNow)}곳에 재고가 있어요([“구매 불가”의 뜻](/apple-store-pickup-explained)).` },
        { q: "내 Apple Store에 iPhone Duo가 돌아오면 알림을 받을 수 있나요?", a: `네. 그 매장에 정확한 용량과 색상으로 알림을 걸면 매장이 ${SPEED.fastSec}초 주기로 옮겨지고, 재입고가 확인된 뒤 약 ${SPEED.alertSec}초면 휴대폰이 알려 줘요([알림 설정하기](${x.alert}); [작동 방식](/how-restock-alerts-work)).` },
      ];
    },
    sources: {
      applePickup: "Apple: 배송 및 픽업 도움말(픽업 가능 여부가 정해지는 방식)",
      newsroom: "Apple Newsroom: iPhone Duo, 전 세계 Apple Store에 도착(2026년 10월 23일)",
      macRumors: "MacRumors: 미국·캐나다에서 iPhone Duo Apple Store 픽업 시스템 재개(2026년 10월 24일)",
      reports: (tracker: string) => `${tracker}: 출시 주간 iPhone Duo 재입고 보고(해당 사이트의 자체 관찰, 따로 표시하고 집계에는 넣지 않음)`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${dom(x.c)} Apple Store iPhone Duo 매장 픽업 재입고 시간`,
      description: `${x.t.since} 이후 ${dom(x.c)} Apple Store에서 확인된 iPhone Duo 매장 픽업 재입고(매장, 구성, 시각). RestockWire가 매장마다 ${SPEED.checkSec}초마다 읽은 데이터를 현지 시간, 날짜, ${x.us ? "주" : rw(x.c)}, 매장, 구성별로 묶었어요.`,
      spatial: `${cn(x.c)} Apple Store`,
      measured: ["재입고 시각(매장 현지)", "Apple Store", "iPhone Duo 용량·색상", "품절까지 걸린 초"],
      size: `매장 ${n(x.t.stores)}곳, 재입고 ${n(x.t.n)}회`,
    }),
    crumb: "iPhone Duo 재입고 시간",

    timeLead: (x: RestockTimesView) => <b>매장 현지 시간 {range(x.w.from, x.w.to)}에 재입고 {n(x.t.n)}회 중 {rtPct(x.w.share)}가 몰려 있고, 오전 8시~정오에는 {rtPct(hourShare(x.t.byHour, 8, 12))}가 있어요.</b>,
    busiestHour: (count: number) => `가장 바쁜 한 시간의 재입고 ${n(count)}회`,
    morning: "오전 8시~정오",
    evening: "오후 5시 이후, 저녁도 무시할 수 없어요",
    night: "자정~오전 6시",
    tooFew: (x: RestockTimesView) => <b>시간대를 말하기엔 {yet(x)}날짜가 부족해요: {longDate(x.t.since)} 이후 {n(x.t.days)}일 동안 확인된 재입고 {n(x.t.n)}회.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>평소 시간대를 말하려면 <b className="text-ink">서로 다른 {PATTERN_MIN_DAYS}일에 걸친 재입고 {PATTERN_MIN}회</b>가 필요해요</> },
      { text: <>한 번에 몰린 재입고 10회는 한 번의 일이지, 습관이 아니에요</>, no: true },
      { text: <>데이터가 하루씩 늘 때마다 이 페이지가 알아서 갱신돼요</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재입고 ${n(x.t.n)}회, 매장 현지 시각별, ${dateLabel(x.t.since, false)}부터 오늘까지`,
    hourHead: ["현지 시각", "재입고", "비율"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>오전에 몰리는 건 <b className="text-ink">개점 시간과는 상관없어요</b>{x.us ? "(미국 Apple Store는 대부분 오전 10시에 열어요)" : ""}</> },
      { text: <>Apple은 문을 열기 전에 픽업 재고를 <b className="text-ink">온라인</b>으로 풀어요</> },
      { text: <>직접 지켜본다면 평일 오전 <b className="text-ink">{range(x.w.from, x.w.to)}</b>를 노리세요</>, step: true },
      { text: <>아무도 보지 않는 <b className="text-ink">나머지 22시간</b>은 <Link href={x.alert}>알림</Link>이 맡아요</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>매장 페이지마다 그 매장 시간대로 그린 시간 차트가 있어요(<Link href={x.storesHref}>{x.us ? "주별 Apple Store" : `${dom(x.c)} 매장`}</Link>). 지역 전체는 9시에 몰려도 8시에 재입고되는 매장을 찾아낼 수 있어요</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>아직 추적 1일째인 {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}, {one ? "" : `매장 ${n(t.stores)}곳에서 `}확인된 재입고 {n(t.n)}회.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `추적한 ${n(t.days)}일 모두` : `${longDate(t.since)} 이후 ${n(tracked)}일 중 ${n(t.days)}일`} 확인된 재입고가 한 번 이상 있었어요{t.peakWeekday != null ? `. 요일 중에서는 ${iGa(wd(t.peakWeekday))} 앞서요` : ""}.</b>
      ) : (
        <b>{longDate(t.since)} 이후 {dom(x.c)}에서 확인된 재입고는 0회예요.</b>
      );
    },
    daysTracked: "추적한 날 중 재입고가 있었던 날",
    busiestDay: (x: RestockTimesView, day: DayRow) => `가장 많았던 날, ${dateLabel(day.date)}${x.one ? "" : ` · 매장 ${n(day.stores)}곳`}`,
    busiestDayNone: "가장 많았던 날",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `${zoneStamp(drop.at, x.c)}, 30분 안에 재입고된 매장 수(구성 ${n(drop.restocks)}개): 전국 단위로 풀린 물량`,
    weekend: (x: RestockTimesView) => `주말에 들어옴(재입고 ${n(x.weekend)}회)`,
    dayCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 일별 재입고${x.t.reports.length ? "; “보고” 표시 행은 저희 추적이 시작되기 전 다른 트래커가 공개한 관찰로, 타임라인 참고용으로만 넣었어요" : ""}`,
    dayHead: { date: "날짜", restocks: "재입고", stores: "매장", busiest: "가장 바쁜 시간", source: "출처" },
    soFar: " · 지금까지",
    reportedBy: (names: string[]) => <>{names.join(" / ")} 보고</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: 출시일, 온라인 주문분이 처음 출고됨</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: 매장 픽업 재개{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">보고</b> 행은 {x.reportNames.join(", ")}의 출시 주간 관찰로, 모든 집계에서 빠져 있어요</> }
        : { text: <>{dom(x.c)} 모든 매장에 대한 RestockWire 기록은 <b className="text-ink">{longDate(x.t.since)}</b>부터 시작해요</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>가장 바쁜 요일을 말하려면 <b className="text-ink">{WEEKDAY_MIN_SPAN}일</b>치 데이터가 필요해요(지금 {n(x.tracked)}일)</>, no: true }] : []),
      { text: <><b className="text-ink">매장</b> 열을 보세요: 재입고가 더 많은 매장에 퍼질수록 내 확률이 올라가요</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {dateLabel(x.t.since, false)} 이후 매장 {n(hit[0].storesTotal)}곳 중 {n(hit[0].stores)}곳에서 재입고 {n(hit[0].restocks)}회{hit[1] ? <>, 이어서 {hit[1].name}({n(hit[1].restocks)}회)</> : null}{hit[2] ? <>, {hit[2].name}({n(hit[2].restocks)}회)</> : null}. {x.us ? "주" : rw(x.c)} {n(total)}곳 중 {n(hit.length)}곳에 재입고가 있었어요{total - hit.length > 0 ? `, ${n(total - hit.length)}곳은 아직 없어요` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{dom(x.c)}의 어느 {x.us ? "주" : rw(x.c)}에도 아직 확인된 재입고가 없어요. 첫 재입고부터 표가 시작돼요.</b>,
    regionCaption: (x: RestockTimesView) => `${dom(x.c)} ${x.us ? "주" : rw(x.c)}별 확인된 iPhone Duo 재입고, ${dateLabel(x.t.since, false)}부터 오늘까지`,
    regionHead: (x: RestockTimesView) => [x.us ? "주" : rw(x.c), "재입고", "재입고된 매장", "최신 재입고(현지 시간)"],
    ofN: (a: number, b: number) => <>{n(b)}곳 중 {n(a)}곳</>,
    storesCaption: (x: RestockTimesView) => `${dom(x.c)} iPhone Duo 재입고 상위 매장, ${dateLabel(x.t.since, false)}부터 오늘까지`,
    storesHead: ["매장", "재입고", "일수", "평소 시간대", "최신(현지 시간)"],
    swaps: (x: RestockTimesView) => [
      { no: "멀든 가깝든 목록 1위 매장을 쫓기", yes: `${x.pattern ? hr(x.w.from) : "오전"}부터 1시간 안에 갈 수 있는 매장 2~3곳`, why: "닿을 수 없는 재입고는 소용이 없고, 가장 바쁜 매장도 하루 중 몇 분을 빼면 구매 불가로 보여요." },
      { no: "매장 한 곳에 걸기", yes: "매장마다 알림을 걸고, 먼저 울리는 곳으로 가기", why: "횟수 표는 내 매장 중 어디로 먼저 갈지 정할 때만 쓰세요." },
    ],
    nearMe: "내 주변 Duo 재고, 실시간",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{iGa(top.label)} 재입고 {n(x.t.n)}회 중 {n(top.restocks)}회({rtPct(top.restocks / x.t.n)})로 가장 많아요{rarest ? `. 가장 적은 건 ${euro(rarest.label)} ${n(rarest.restocks)}회예요` : ""}.</b>
    ),
    mostRestocked: (config: string) => `${config}: 다른 어떤 구성보다 많이 재입고됨`,
    versus: (a: string, bCount: number, b: string) => `${a} 재입고(${eunNeun(b)} ${n(bCount)}회)`,
    restocksOf: (a: string) => `${a} 재입고`,
    byStorage: "용량별",
    byColour: "색상별",
    configNone: (x: RestockTimesView) => <b>{dom(x.c)}에서 확인된 재입고가 있는 구성은 {yet(x)}하나도 없어요. 첫 재입고가 바로 들어갈 수 있게 8개 구성을 모두 올려 뒀어요.</b>,
    configCaption: (x: RestockTimesView) => `${dom(x.c)} 구성별 확인된 iPhone Duo 재입고, ${dateLabel(x.t.since, false)}부터 오늘까지`,
    configHead: ["구성", "재입고", "비율", "최신 재입고(현지 시간)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>구성을 고르는 게 <b className="text-ink">매장을 고르는 것보다 중요해요</b></> },
      x.storageRatio != null
        ? { text: <>가장 많이 재입고되는 용량으로 정하면 다음 용량보다 확률이 약 <b className="text-ink">{x.storageRatio}배</b>예요</> }
        : { text: <>가장 많이 재입고되는 용량으로 정하면 확률이 <b className="text-ink">크게</b> 올라가요</> },
      { text: <><b className="text-ink">2TB</b>는 배송으로 주문하고 기다리는 쪽이 나아요</>, no: true },
      { text: <>가격과 실시간 재고: <Link href="/iphone-duo-most-restocked-stores">어떤 iPhone Duo가 가장 많이 재입고될까?</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{n(sell.medianSec)}초: {dom(x.c)}에서 품절된 재입고 {n(sell.n)}회의 수명 중앙값이에요. {rtPct(sell.within2min)}는 2분 안에, {rtPct(sell.within20min)}는 20분 안에 사라졌어요.</b>,
    secUnit: "초",
    medianListing: "뜬 순간부터 사라질 때까지, 중앙값",
    within2: "2분 안에 사라짐",
    within20: "20분 안에 사라짐",
    fastest: "기록상 가장 빠른 품절",
    howLongNone: (x: RestockTimesView) => <b>{dom(x.c)}에서 품절된 재입고가 {yet(x)}측정하기엔 적어요. 이 수치는 10회부터 나오고, 전체 데이터는 미국 페이지에 있어요.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>2분은 apple.com 새로고침이 아니라 <b className="text-ink">알림</b>으로 잡는 시간이에요</> },
      { text: <>이 페이지의 다른 모든 수치는 이 숫자에서 나와요</> },
      { text: <>구성·{x.us ? "주" : rw(x.c)}별로 재입고마다 몇 초 갔는지: <Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo 재입고는 얼마나 빨리 품절될까?</Link></>, step: true },
    ],
    measured: "각 수치는 구성이 처음 올라온 것을 본 확인부터 사라진 것을 본 확인까지라 상한값이에요. 실제 수명은 더 짧아요.",

    unavailableLead: (x: RestockTimesView) => <b>재입고는 상태가 아니라 순간이에요. {x.one ? "매장 1곳" : `매장 ${n(x.stores)}곳`} × 구성 {n(x.configs)}개로 {dom(x.c)}에는 {n(x.pairs)}가지 재고 가능성이 있는데, 지금 iPhone Duo를 하나라도 올린 매장은 {n(x.duoNow)}곳이에요.</b>,
    pairs: "가능한 매장 × 구성 조합",
    listingNow: "지금 iPhone Duo 픽업 재고가 있는 매장",
    goneIn2: "2분 안에 끝난 재입고 비율",
    last24: "확인된 재입고, 최근 24시간",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>최근 24시간: {dom(x.c)} 매장 {n(x.recent.stores)}곳에서 <b className="text-ink">확인된 재입고 {n(x.recent.restocks)}회</b></> }
        : today > 0
          ? { text: <>오늘: {dom(x.c)}에서 <b className="text-ink">확인된 재입고 {n(today)}회</b></> }
          : { text: <>실제로 있었던 재입고는 위 날짜 표에 있어요</> },
      { text: <>각각 apple.com에 <b className="text-ink">1~2분</b> 올라와 있었어요</> },
      { text: <>4일째든 14일째든 “어디서나 구매 불가”가 Apple이 멈췄다는 뜻은 <b className="text-ink">아니에요</b></>, no: true },
    ],
    unavailableLinks: { explained: "“현재 픽업 불가”의 뜻", howToGet: "iPhone Duo 구하는 법, 단계별로" },

    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>와 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>의 조언은 대부분 솔직하지만 매장 한 곳의 경험이고, 다음 날이면 낡아요. 가장 자주 나오는 주장 네 가지를 {dom(x.c)}의 확인된 재입고 {n(x.t.n)}회와 대조했어요.</b>,
    redditCaption: "iPhone Duo 재입고에 관한 흔한 Reddit 주장을 RestockWire의 확인된 재입고와 대조",
    redditHead: ["주장", "기록이 보여 주는 것"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      const none = "아직 대조할 기록이 없어요.";
      return [
        { claim: "“매장은 밤사이 재입고돼요. 새벽 3시에 확인하세요.”", answer: t.n > 0 ? <>재입고의 {rtPct(hourShare(t.byHour, 0, 6))}가 현지 시간 자정~오전 6시에 들어왔고, {range(w.from, w.to)}에는 {rtPct(w.share)}가 들어왔어요.</> : none },
        { claim: "“Apple은 특정 요일에만 재입고해요.”", answer: t.n > 0 ? (t.peakWeekday != null ? <>지금까지는 {iGa(wd(t.peakWeekday))} 앞서지만({n(t.n)}회 중 {n(t.byWeekday[t.peakWeekday])}회), 재입고는 {n(tracked)}일 중 {n(t.days)}일에 있었어요.</> : <>추적한 {n(tracked)}일 중 {n(t.days)}일에 재입고가 있었어요{t.days === tracked ? "(빠진 날 없음)" : ""}. 가장 바쁜 요일은 데이터가 {WEEKDAY_MIN_SPAN}일치 쌓이면 말해요.</>) : none },
        { claim: "“매장에 전화해서 물건이 언제 들어오는지 물어보세요.”", answer: "공개된 재입고 일정은 없어요. 픽업 재고는 온라인으로 풀리고, 매장도 다른 모든 사람과 같은 순간에 그걸 봐요." },
        { claim: "“구매 불가라고 나오면 영영 품절이에요.”", answer: recent.restocks > 0 ? <>최근 24시간 동안 매장 {n(recent.stores)}곳에서 확인된 재입고 {n(recent.restocks)}회가 반대를 증명해요. 각각 몇 분 안에 다시 “구매 불가”로 돌아갔어요.</> : t.n > 0 ? <>{dateLabel(t.since, false)} 이후 확인된 재입고 {n(t.n)}회가 반대를 증명해요. 각각 몇 분 안에 다시 “구매 불가”로 돌아갔어요.</> : none },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>소문은 <b className="text-ink">데이터가 없을 때</b> 빈자리를 채워요. 이 페이지가 그 데이터이고, 보는 건 무료예요</> },
      { text: <>Reddit이 맞히는 한 가지는 <b className="text-ink">결제 준비</b>예요. 로그인해 두고 Apple Pay를 설정해 두세요(<Link href="/iphone-duo-restock-checkout-guide">저희의 20초 버전</Link>)</> },
    ],

    methodLead: <b>재입고란 그 매장에 없던 구성이 apple.com에 매장 픽업으로 나타나고, 두 번의 확인이 일치한 경우예요.</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>알림이 걸린 매장은 <b className="text-ink">{SPEED.fastSec}초</b>마다, {x.one ? `${cn(x.c)}의 Apple Store` : `${dom(x.c)}의 모든 Apple Store`}는 <b className="text-ink">{SPEED.checkSec}초</b>마다</> },
      { text: <>다른 트래커가 공개한 주기: <b className="text-ink">8초~15분</b>. 저희는 그들이 공개한 수치끼리만 비교해요</> },
      { text: <>처음 보인 “구매 가능”은 <b className="text-ink">약 1초 뒤</b> 다시 확인한 다음에야 인정해요</> },
      { text: <>사라진 재고는 <b className="text-ink">다음 회차</b>에서 확정해요</> },
      { text: <>매장을 처음 본 순간, 실패한 요청, 시간 초과: <b className="text-ink">절대</b> 재입고도 “품절”도 아니에요</>, no: true },
      { text: <>모든 시간과 날짜는 각 매장의 <b className="text-ink">현지 시간</b>이에요. “물량 풀림”은 시간대가 달라도 같은 30분을 말해요</> },
      { text: <>다른 트래커의 보고{x.t.reports.length ? `(${x.reportNames.join(", ")})` : ""}는 별도로 표시된 행에 두고 <b className="text-ink">모든 합계에서 빼요</b></> },
      { text: <>이 표들은 약 5분마다 갱신되고, <Link href={x.logHref}>재입고 기록</Link>은 실시간이에요</>, step: true },
    ],
    quote: "이 페이지 인용: 링크만 남겨 주시면 어떤 수치든 인용하셔도 좋아요. RestockWire는 Apple과 무관한 독립 서비스이고, 누구나 apple.com에서 볼 수 있는 픽업 가능 여부를 훨씬 자주 읽을 뿐이에요.",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${dom(x.c)} `}iPhone Duo 알림 받기</>,

    related: "iPhone Duo 질문 더 보기",
    sameData: "같은 기록으로 만든 페이지",
    questions: {
      sellOut: "재입고는 얼마나 가나요?",
      alerts: "재입고 소식을 가장 빨리 듣는 법",
      howToGet: "실제로 손에 넣는 법",
      whichConfig: "가장 많이 재입고되는 구성",
      nearMe: "내 주변 실시간 재고",
      unavailable: "“구매 불가”의 뜻",
    },
    otherCountries: ((us: boolean): string => (us ? "다른 나라의 이 페이지" : "다른 나라")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "자주 묻는 질문",
  },
};
