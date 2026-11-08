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
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import type { Dict } from "../en";
import { euro, eulReul, iGa, ieyo } from "./common";

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
      ...(inStock > 0 ? [`${where} ${name} 픽업 가능 매장 ${n(inStock)}곳 · 라이브`] : []),
      `${where} ${name} 매장 픽업 재고 · 라이브`,
      `${where} ${short} 매장 픽업 재고`,
      `${short} 매장 픽업 재고`,
    ]);
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${name} · ${w} ${inStock > 0 ? "현재 픽업 가능" : "픽업 재고 현황"}`,
      `${short} 픽업 재고 · ${w}(${cityLabel(code, s.city, L)})`,
      `${short} 픽업 재고 · ${w}`,
      `${short} 재고 현황 · ${storeLabel(s, L)}`,
    ]);
  }
  return fitTitleW([
    `${name} · ${w} 매장 ${n(inStock)}/${n(k)}곳 픽업 가능`,
    `${name} 매장 픽업 재고 · ${w}`,
    `${short} 픽업 재고 · ${w}`,
    `${w}의 ${short}`,
  ]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const code = place.country ?? "us";
  const name = productName(product);
  const week = `이번 7일 재입고 ${n(stats.week)}번`;
  if (place.level === "store") {
    const s = place.store!;
    const w = placeKo(place);
    return fitTitleW([
      `${inStock > 0 ? "현재 픽업 가능" : "현재 픽업 불가"} · ${week}. ${w}${w.includes(cityLabel(code, s.city, L)) ? "" : `(${cityLabel(code, s.city, L)})`}의 ${name} 상태를 라이브로 보고, 재입고가 몰리는 시간을 확인하고, 다시 들어오면 알림을 받으세요.`,
      `${w} ${name}: ${inStock > 0 ? "현재 픽업 가능" : "현재 픽업 불가"} · ${week}. 라이브 상태와 재입고 알림.`,
    ], 155);
  }
  const where = place.level === "country" ? (code === "us" ? "미국 Apple Store" : `${placeKo(place)} Apple Store`) : `${placeKo(place)} Apple Store`;
  return fitTitleW([
    `${where} ${n(place.stores.length)}곳 중 ${n(inStock)}곳에서 ${name} 픽업 가능 · ${week}. 매장마다 라이브 재고, 재입고가 몰리는 시간, 다시 들어올 때 받는 알림까지.`,
    `${name} 픽업 가능 매장 ${n(inStock)}/${n(place.stores.length)}곳(${where}) · ${week}. 매장마다 라이브 재고와 알림.`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const code = place.country ?? "us";
  const name = productName(product);
  const w = placeKo(place);
  const at = `${w}에서`;
  const dist = (miles: number) => distance(L, code, miles);
  const near = nearest ? `${nearest.city}의 Apple ${nearest.name}, ${dist(nearest.distance)} 거리` : "";
  const out: FaqItem[] = [];
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `지금 ${w}에서 ${eulReul(name)} 픽업할 수 있나요?`,
      a: l && l.available.length > 0
        ? `할 수 있어요${product.parts.length > 1 ? `. 잡힌 구성: ${list(L, l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4, (x) => `+${n(x)}개`)}` : ""}. 마지막 확인 결과예요.`
        : `마지막 확인 때는 안 잡혔어요${nearest ? `. 지금 잡힌 곳 중 가장 가까운 매장은 ${ieyo(near)}` : ""}.`,
    });
  } else {
    out.push({
      q: `${w}에서 지금 ${eulReul(name)} 픽업할 수 있는 매장은?`,
      a: inStock.length === 0
        ? `마지막 확인 때는 한 곳도 없었어요${nearest ? `. 지금 잡힌 곳 중 가장 가까운 매장은 ${ieyo(near)}` : ""}.`
        : `마지막 확인 때 ${n(inStock.length)}곳이에요. ${list(L, inStock.map((x) => appleStoreLabel(x.store, L)), 4, (x) => `+${n(x)}곳`)}.`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${w} ${name} 재입고, 얼마나 자주 있나요?`,
    a: stats.month === 0 ? `${n(stats.days)}일 기록상 0번이에요.` : `${n(stats.days)}일 동안 ${n(stats.month)}번, 그중 이번 7일이 ${n(stats.week)}번${peak ? `. 몰리는 때는 현지 ${peak.hour} 전후예요` : "이에요"}.`,
  });
  if (stats.medianMs != null) out.push({ q: `${at} 들어온 재고는 몇 분이나 남나요?`, a: `중앙값 약 ${fmtDuration(stats.medianMs, L)} 뒤에 다시 품절돼요.` });
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

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? x.place.name : dom(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "도시" : "매장") : (x.us ? "주" : rw(x.c)));
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => dom(c),
    liveMap: "라이브 재고 지도",
    restockLog: "재입고 로그",
    alertMe: "지켜보기 시작",
    lastDays: (days: number) => <>{n(days)}일치 · 막대 하나가 하루</>,
    since: "2026년 11월 2일",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cn(c)}의 유일한 Apple Store` : `${dom(c)} 내 Apple Store ${n(k)}곳 모두`),
    checker: (c: Country) => `${cn(c)} iPhone 픽업 재고 체커`,
    appleStoresIn: (c: Country) => `${cn(c)} Apple Store`,
    storesWithIt: "픽업 가능 매장",
    more: "더 펼치기",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${ko(model)}, ${dom(c)} 어느 매장에서 픽업할 수 있나`,
    h1Place: (model: string, where: string) => `${ko(model)} · ${where}`,
    inStockNow: "현재 픽업 가능",
    yes: "있음",
    no: "없음",
    pickup: "픽업",
    configurations: "구성",
    ofStores: (k: number) => `${n(k)}곳 가운데`,
    restocks24h: "지난 24시간 재입고",
    restocksHint: (week: number, month: number, days: number) => `7일 ${n(week)} · ${n(days)}일 ${n(month)}`,
    sellOuts: (days: number) => `품절 · ${n(days)}일`,
    stays: (ms: number) => `~${fmtDuration(ms, L)} 유지`,
    noPairs: "품절까지 이어진 기록 0건",
    lastRestock: "재입고 속보",
    noneYet: "아직 0건",
    thisConfig: "이 구성",
    inDays: (days: number) => `${n(days)}일 기록`,
    notInStockNow: "현재 픽업 불가",
    configsInStock: (k: number, of: number) => <span>픽업 가능 구성 <b className="text-ink">{n(k)}</b>/{n(of)}개</span>,
    inStockAt: (k: number, of: number) => <span>픽업 가능 매장 <b className="text-ink">{n(k)}</b>/{n(of)}곳</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{live} 확인 · {p}{tax}</>,
    taxNote,
    beforeTax: "세전",
    buyOnApple: "apple.com 주문 페이지",
    allStoresIn: (c: Country) => `${dom(c)} 매장 목록`,
    everyIphoneHere: "여기서 추적하는 iPhone 전부",
    everyIphone: (where: string) => `${where}에서 추적하는 iPhone 전부`,
    panel: (model: string, where: string | null) => `${ko(model)}${where ? ` · ${where}` : ""}: 구성 먼저, 그다음 매장`,
    unitConfigs: "구성",
    unitStores: "매장",
    otherConfigsHere: "같은 곳, 다른 구성",
    byStorageColor: "용량 × 색상",
    nearestStores: "거리순 매장",
    closest: (link: ReactNode, dist: string) => <>픽업 가능한 곳 중 최단 거리: {link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}, {city}</>,
    mostRecentlyInStock: "직전에 재고가 잡혔던 곳",
    storesWithItNow: "현재 픽업 가능 매장",
    storesIn: (where: string) => `${where}의 매장`,
    colStatus: "현재 상태",
    colConfigs: "픽업 가능 구성",
    noStoreHasIt: "현재 픽업 가능 매장 0곳.",
    noStoreHereHasIt: "이 지역 현재 픽업 가능 매장 0곳.",
    moreStores: (k: number) => <>나머지 {n(k)}곳은 아래 지역 목록에.</>,
    byRegion: (c: Country) => `${rw(c)}별`,
    byCity: "도시 단위",
    nearbyStores: "근처 매장",
    latestChanges: "방금 바뀐 것",
    nothingLogged: "로그가 아직 비어 있어요.",
    whenRestocks: "재입고가 몰리는 시간",
    howFast: "들어온 재고가 버티는 시간",
    restocksByConfig: "자주 돌아오는 구성",
    faqTitleCountry: (model: string, c: Country) => `${ko(model)} · ${dom(c)}, 자주 받는 질문`,
    faqTitle: (model: string, where: string) => `${ko(model)} · ${where}, 자주 받는 질문`,
    buySource: (model: string, c: Country) => `apple.com ${ko(model)} 구매 페이지(${cn(c)})`,
    nearby: "근처",
    otherRegions: (c: Country) => `그 밖의 ${rw(c)}`,
    elsewhereIn: (region: string) => `${region}에서 조금 더 먼 곳`,
    everyAppleStoreIn: (c: Country) => `${dom(c)} Apple Store 목록`,
    across: (model: string, c: Country) => `${ko(model)} · ${c.cc === "us" ? "미국" : dom(c)} 전체`,
    itemList: (model: string, where: string) => `${ko(model)} 픽업 매장 · ${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `${dom(c)} 매장 중 ${eulReul(ko(model))} 픽업으로 내놓은 곳은 현재 0곳이에요. 그러니 ‘내 근처’의 답은 어느 매장에 먼저 들어오느냐에 달려 있어요. 갈 수 있는 매장마다 알림을 걸어 두면, 어디든 먼저 들어오는 곳의 소식이 몇 초 만에 휴대폰에 떠요.`
        : `${ko(model)} 픽업 가능 매장 ${n(inStock)}/${n(k)}곳: ${list(L, have.slice(0, 5).map((l) => `${l.store}, ${l.city} · 구성 ${n(l.configs)}개`), 5)}.`,
    nearHead: (c: Country) => [rw(c), "현재 픽업 가능 매장"],
    nearCaption: (c: Country, model: string) => `${ko(model)} 픽업 재고를 ${rw(c)} 단위로 · 마지막 확인 결과`,
    nearMe: (c: Country, model: string, alert: string) => `알림 설정에서 ‘가까운 매장’을 누르면 현재 위치 기준으로 매장이 거리순으로 다시 줄을 서요. 거리는 도로를 따라 잰 ${c.unit === "mi" ? "마일" : "km"} 추정값이고, 매장마다 길찾기 링크가 붙어요. [${ko(model)} 지켜보기 시작](${alert}).`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      const m = ko(model);
      return {
        price: { q: `${m}, ${dom(c)} 출고가는 얼마부터인가요?`, a: `${money(low)}부터 ${money(high)}까지예요. 차이는 용량에서 나고, 금액은 apple.com 표시가(${taxNote(c)})예요.` },
        reserve: { q: `${eulReul(m)} ${dom(c)} 매장 픽업으로 미리 잡아 둘 수 있나요?`, a: `사전 예약은 없어요. 원하는 구성이 매장에 뜬 순간 apple.com에서 ‘매장 픽업’으로 결제하면, 고른 픽업 시간까지 Apple이 맡아 둬요.${inStock === 0 ? " 현재 픽업 가능한 매장이 0곳이라, 첫 재고를 잡는 길은 알림뿐이에요." : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${dom(c)} iPhone 재입고 속보 · ${k === 1 ? "Apple Store" : `매장 ${n(k)}곳`} 라이브 로그`,
    metaDescription: (c: Country) => `확인된 재입고만 한 줄씩. ${dom(c)} Apple Store에 iPhone Duo·18 Pro·Pro Max 픽업 재고가 들어온 시각과 구성, 위치를 지도와 함께 바로 남겨요.`,
    h1: (c: Country) => `${dom(c)} iPhone 재입고 속보`,
    summary: (day: number, week: number, model?: string, region?: string) => <>재입고 {n(day)}번(24시간) · {n(week)}번(7일){model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}. 시각은 보는 사람의 시간대로 바뀌어요.</>,
    allModels: "모델 무관",
    restocks: "재입고만",
    withSoldOut: "재입고·품절 모두",
    regionLabel: (c: Country) => rw(c),
    allRegions: (c: Country) => `${rw(c)} 무관`,
    filter: "보기",
    page: (k: number) => <>{n(k)}쪽</>,
    newer: "← 더 최근",
    older: "더 이전 →",
    getAlerts: "재입고 알림 걸기",
    byPlace: "지역마다 재입고",
    byRegion: (c: Country) => `${rw(c)} 단위`,
    datasetName: (c: Country) => `${dom(c)} Apple Store iPhone 매장 픽업 재입고 로그`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "미국 Apple Store 269곳" : `${dom(c)} Apple Store`}의 iPhone Duo·iPhone 18 Pro·iPhone 18 Pro Max 매장 픽업 재입고와 품절 로그. 항목마다 매장, 정확한 구성, 시각이 붙어요. 알림 매장은 5초, 나머지는 15초 간격으로 읽고, apple.com 응답이 두 번 연속 같을 때만 재입고로 남겨요.`,
    datasetMeasured: ["Apple Store 매장", "iPhone 모델·용량·색상", "재입고 확인 시각", "품절 확인 시각"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `${dom(c)} iPhone Duo 재고 지도 · ${k === 1 ? "Apple Store" : "Apple Store 전체"} 라이브`,
    metaDescription: (c: Country, k: number) => `점 하나가 매장 하나. ${k === 1 ? `${cn(c)}의 유일한 Apple Store` : `${dom(c)} Apple Store ${n(k)}곳`}에서 지금 iPhone Duo·18 Pro·Pro Max를 픽업할 수 있는지, 용량과 색상으로 걸러 라이브로 보여 줘요.`,
    country: (c: Country) => ({ name: c.name, inName: c.inName, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "매장 전부",
    storeCity: (store: string, city: string) => `${city}의 ${store}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `${rw(c)}·도시로 정리` : cities > 1 ? "도시로 정리" : "";
      return `현재 iPhone Duo 픽업 가능 ${n(duo)}곳, Pro Max ${n(max)}곳. ${by ? `${by}한 ` : ""}${dom(c)} Apple Store ${n(k)}곳의 매장별 라이브 픽업 재고를 18 Pro까지 한 페이지에서 확인하세요.`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) =>
      `모두 ${n(k)}곳(${spread}).${top.length && !spread.includes(top[0].name) ? ` 1위는 ${top[0].name} ${n(top[0].count)}곳${top[1] ? `, 2위는 ${top[1].name} ${n(top[1].count)}곳이에요` : "이에요"}.` : ""}`,
    howMany: (c: Country) => <>{dom(c)} Apple Store, 모두 몇 개예요?</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `${dom(c)}에서 지금 iPhone Duo를 픽업할 수 있는 매장은?`,
      a: have.length === 0
        ? `마지막 확인 때 ${n(k)}곳 모두 안 잡혔어요. 한 곳이라도 잡히면 이 페이지와 지도가 바로 바뀌고, 알림은 그보다 먼저 휴대폰에 닿아요.`
        : `마지막 확인 때 ${n(have.length)}/${n(k)}곳: ${have.slice(0, 6).map((x) => appleStoreLabel(x, L)).join(", ")}${have.length > 6 ? " 외" : ""}.`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, place: ctx.place === cn("kr") ? "국내" : ctx.place, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `[iPhone Duo 지켜보기 시작](${alert}): 갈 수 있는 매장에 알림을 걸어 두는 게 가장 빠른 길이에요. 매장 1곳 × 정확한 구성 1개가 알림 1개이고, 재고가 잡히면 몇 초 만에 휴대폰이 울려요.`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) =>
      `현재 픽업 가능 매장 수: iPhone Duo **${n(now.duo)}곳**, iPhone 18 Pro Max **${n(now.max)}곳**, 18 Pro **${n(now.pro)}곳**. 모수는 ${dom(c)} **Apple Store ${n(k)}곳**이에요(${spread}). ${tax}`,
    crumb: "Apple Store",
    panel: (c: Country) => `구성을 정하고, 갈 수 있는 ${dom(c)} 매장에 체크하세요`,
    matrixLabel: "매장마다 픽업 현황",
    matrixH2: (c: Country) => <>{dom(c)} 매장 × 모델 픽업 현황</>,
    matrixHint: "칸마다: 픽업 가능 구성 / 추적 중인 구성.",
    topCaption: (c: Country) => <>Apple Store가 많은 {rw(c)} 순(Apple 매장 목록 기준, RestockWire가 추적하는 매장)</>,
    regionHead: (c: Country) => rw(c),
    colStores: "Apple Store 수",
    colCities: "도시 수",
    locationsBy: (c: Country) => `${rw(c)}마다 Apple Store 위치`,
    locationsIn: (c: Country) => `${dom(c)} Apple Store 위치 전체`,
    storeCount: (k: number) => <>{n(k)}곳</>,
    storeCountAll: (k: number) => <>모두 {n(k)}곳</>,
    whenRestock: (c: Country) => <>{dom(c)} 매장에는 몇 시에 재고가 들어오나요?</>,
    howFast: (c: Country) => <>{dom(c)}에 들어온 재고, 몇 분이면 동나나요?</>,
    faqTitle: (c: Country) => `${dom(c)} Apple Store, 자주 받는 질문`,
    getApp: "홈 화면 앱 받기",
    howItWorks: "알림이 오는 원리",
    pricing: "요금 안내",
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
    title: (c: Country, place?: RestockTimesPlace) => `${place?.name ?? dom(c)} iPhone Duo(아이폰 듀오), Apple은 몇 시에 재입고할까?`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const region = x.place ? (x.place.kind === "region" ? "도시" : "매장") : c.cc === "us" ? "주" : rw(c);
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `현지 ${range(w.from, w.to)}에 ${rtPct(w.share)}. ${rtW(x)} 애플스토어에 iPhone Duo가 ${n(t.n)}번 들어옴(${since}~)${t.sellout ? `, 그중 ${rtPct(t.sellout.within2min)}는 2분 안에 품절` : ""}. 시각·날짜·${region}·매장·구성으로 나눈 표.`,
          `현지 ${range(w.from, w.to)}에 ${rtPct(w.share)}. ${rtW(x)} 애플스토어 iPhone Duo 입고 ${n(t.n)}건(${since}~)을 시각·날짜·${region}·구성으로 나눈 표.`,
          `${rtW(x)} iPhone Duo가 들어오는 시각: ${since}부터 ${n(t.n)}건, ${region}·구성으로 나눠 봄.`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${rtW(x)} 애플스토어에서 iPhone Duo 입고 ${n(t.n)}건(${since}~)을 확인했어요. ${SPEED.checkSec}초 간격 확인 데이터를 현지 시각·날짜·${region}·매장·구성으로 나누고, 재고가 몇 초 버텼는지도 붙였어요.`,
            `${rtW(x)} iPhone Duo가 들어오는 시각: ${since}부터 확인된 재입고 ${n(t.n)}건, ${region}·구성으로 나눠 봄.`,
          ], 158)
          : `${rtW(x)} Apple Store에 iPhone Duo가 들어오는 시각을 시간·날짜·매장·구성으로 정리하는 페이지. ${longDate(t.since)}부터 RestockWire가 모든 매장을 ${SPEED.checkSec}초 간격으로 읽고 있어요.`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${rtW(x)}에서 Apple은 iPhone Duo를 몇 시에 재입고하나요?`
      : x.t.n > 0
        ? `${rtW(x)}에서 Apple은 iPhone Duo를 몇 시에 재입고하나요? ${x.pattern ? `가장 잦은 건 현지 시간 ${range(x.w.from, x.w.to)}` : "저희가 직접 확인한 시간별 기록"}`
        : `${rtW(x)}에서 Apple이 iPhone Duo를 재입고하고 있나요? 아직은 아니에요, 저희가 지켜보는 내용은 이래요`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = one ? `${rtW(x)}의 Apple Store` : `${rtW(x)} Apple Store`;
      return t.unknown ? (
        <>재입고 기록을 잠시 불러올 수 없어요. {rtW(x)} 매장은 계속 {SPEED.checkSec}초 주기로 확인 중이고, 다음에 페이지를 열면 수치가 돌아와요.</>
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
          <b className="text-ink">아직은 아니에요.</b> RestockWire는 {longDate(t.since)}부터 {one ? `${rtW(x)}의 Apple Store` : `${rtW(x)} Apple Store ${n(x.stores)}곳 전체`}를 {SPEED.checkSec}초마다 읽었지만, 확인된 iPhone Duo 매장 픽업 재입고는 한 번도 없었어요.
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `확인된 재입고 · ${dateLabel(x.t.since, false)}~`,
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
    logLive: "재입고 속보 로그",
    onThisPage: "목차",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "시간대",
      "day-by-day": "날짜",
      where: `${rtU(x)}별`,
      configuration: "구성",
      "how-long": "품절 속도",
      unavailable: "“픽업 불가”",
      reddit: "Reddit 속설",
      method: "방법",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${rtW(x)}에서 iPhone Duo는 몇 시에 돌아오나요?`,
      "day-by-day": `${rtW(x)}에서 iPhone Duo가 재입고된 날은 언제였나요?`,
      where: `${rtW(x)}에서 iPhone Duo가 가장 자주 재입고되는 곳은 어디인가요?`,
      configuration: `${rtW(x)}에서 가장 많이 재입고되는 iPhone Duo 용량과 색상은?`,
      "how-long": `${rtW(x)}에서 iPhone Duo 재입고는 몇 초나 가나요?`,
      unavailable: "왜 apple.com은 모든 매장에서 “현재 구매 불가”라고 보여 주나요?",
      reddit: "Reddit의 iPhone Duo 재입고 속설, 기록과 대조해 보기",
      method: "RestockWire에서 재입고로 치는 건 무엇인가요?",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
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
      datasetName: `${rtW(x)} Apple Store iPhone Duo 매장 픽업 재입고 시간`,
      description: `${x.t.since} 이후 ${rtW(x)} Apple Store에서 확인된 iPhone Duo 매장 픽업 재입고(매장, 구성, 시각). RestockWire가 매장마다 ${SPEED.checkSec}초마다 읽은 데이터를 현지 시간, 날짜, ${x.place?.kind === "city" ? "" : `${rtU(x)}, `}매장, 구성별로 묶었어요.`,
      spatial: `${rtW(x)} Apple Store`,
      measured: ["매장 현지 기준 재입고 시각", "Apple Store 매장", "iPhone Duo 용량과 색상", "품절까지 버틴 초"],
      size: `재입고 ${n(x.t.n)}건 · 매장 ${n(x.t.stores)}곳`,
    }),
    crumb: "iPhone Duo 입고 시각",

    timeLead: (x: RestockTimesView) => <b>매장 현지 시간 {range(x.w.from, x.w.to)}에 재입고 {n(x.t.n)}회 중 {rtPct(x.w.share)}가 몰려 있고, 오전 8시~정오에는 {rtPct(hourShare(x.t.byHour, 8, 12))}가 있어요.</b>,
    busiestHour: (count: number) => `가장 바쁜 한 시간의 재입고 ${n(count)}회`,
    morning: "아침 8시부터 낮 12시",
    evening: "오후 5시 이후, 저녁도 무시할 수 없어요",
    night: "밤 12시부터 새벽 6시",
    tooFew: (x: RestockTimesView) => <b>시간대를 말하기엔 {yet(x)}날짜가 부족해요: {longDate(x.t.since)} 이후 {n(x.t.days)}일 동안 확인된 재입고 {n(x.t.n)}회.</b>,
    tooFewKeys: (): Point[] => [
      { text: <>평소 시간대를 말하려면 <b className="text-ink">서로 다른 {PATTERN_MIN_DAYS}일에 걸친 재입고 {PATTERN_MIN}회</b>가 필요해요</> },
      { text: <>한 번에 몰린 재입고 10회는 한 번의 일이지, 습관이 아니에요</>, no: true },
      { text: <>데이터가 하루씩 늘 때마다 이 페이지가 알아서 갱신돼요</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${rtW(x)} iPhone Duo 재입고 ${n(x.t.n)}회, 매장 현지 시각별, ${dateLabel(x.t.since, false)}부터 오늘까지`,
    hourHead: ["매장 현지 시각", "재입고 건수", "점유율"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>오전에 몰리는 건 <b className="text-ink">개점 시간과는 상관없어요</b>{x.us ? "(미국 Apple Store는 대부분 오전 10시에 열어요)" : ""}</> },
      { text: <>Apple은 문을 열기 전에 픽업 재고를 <b className="text-ink">온라인</b>으로 풀어요</> },
      { text: <>직접 지켜본다면 평일 오전 <b className="text-ink">{range(x.w.from, x.w.to)}</b>를 노리세요</>, step: true },
      { text: <>아무도 보지 않는 <b className="text-ink">나머지 22시간</b>은 <Link href={x.alert}>알림</Link>이 맡아요</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>매장 페이지마다 그 매장 시간대로 그린 시간 차트가 있어요(<Link href={x.storesHref}>{x.us ? "주별 Apple Store" : `${rtW(x)} 매장`}</Link>). 지역 전체는 9시에 몰려도 8시에 재입고되는 매장을 찾아낼 수 있어요</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>추적 첫날 {dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}: 재입고 {n(t.n)}건 확인{one ? "" : `, 매장 ${n(t.stores)}곳`}.</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `추적한 ${n(t.days)}일 모두` : `${longDate(t.since)} 이후 ${n(tracked)}일 중 ${n(t.days)}일`} 확인된 재입고가 한 번 이상 있었어요{t.peakWeekday != null ? `. 요일 중에서는 ${iGa(wd(t.peakWeekday))} 앞서요` : ""}.</b>
      ) : (
        <b>{longDate(t.since)} 이후 {rtW(x)}에서 확인된 재입고는 0회예요.</b>
      );
    },
    daysTracked: "추적한 날 중 재입고가 있었던 날",
    busiestDay: (x: RestockTimesView, day: DayRow) => `가장 많았던 날, ${dateLabel(day.date)}${x.one ? "" : ` · 매장 ${n(day.stores)}곳`}`,
    busiestDayNone: "최다 기록일",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `${zoneStamp(drop.at, x.c)}, 30분 안에 재입고된 매장 수(구성 ${n(drop.restocks)}개): 전국 단위로 풀린 물량`,
    weekend: (x: RestockTimesView) => `주말에 들어옴(재입고 ${n(x.weekend)}회)`,
    dayCaption: (x: RestockTimesView) => `${rtW(x)} iPhone Duo 일별 재입고${x.t.reports.length ? "; “보고” 표시 행은 저희 추적이 시작되기 전 다른 트래커가 공개한 관찰로, 타임라인 참고용으로만 넣었어요" : ""}`,
    dayHead: { date: "날짜", restocks: "재입고", stores: "매장", busiest: "가장 바쁜 시간", source: "출처" },
    soFar: " · 현재까지 집계",
    reportedBy: (names: string[]) => <>{names.join(" / ")} 보고</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>: 출시일, 온라인 주문분이 처음 출고됨</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>: 매장 픽업 재개{x.us ? " (MacRumors)" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">보고</b> 행은 {x.reportNames.join(", ")}의 출시 주간 관찰로, 모든 집계에서 빠져 있어요</> }
        : { text: <>{rtW(x)} 모든 매장에 대한 RestockWire 기록은 <b className="text-ink">{longDate(x.t.since)}</b>부터 시작해요</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>가장 바쁜 요일을 말하려면 <b className="text-ink">{WEEKDAY_MIN_SPAN}일</b>치 데이터가 필요해요(지금 {n(x.tracked)}일)</>, no: true }] : []),
      { text: <><b className="text-ink">매장</b> 열을 보세요: 재입고가 더 많은 매장에 퍼질수록 내 확률이 올라가요</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}: {dateLabel(x.t.since, false)} 이후 매장 {n(hit[0].storesTotal)}곳 중 {n(hit[0].stores)}곳에서 재입고 {n(hit[0].restocks)}회{hit[1] ? <>, 이어서 {hit[1].name}({n(hit[1].restocks)}회)</> : null}{hit[2] ? <>, {hit[2].name}({n(hit[2].restocks)}회)</> : null}. {rtU(x)} {n(total)}곳 중 {n(hit.length)}곳에 재입고가 있었어요{total - hit.length > 0 ? `, ${n(total - hit.length)}곳은 아직 없어요` : ""}.</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{rtW(x)}의 어느 {rtU(x)}에도 아직 확인된 재입고가 없어요. 첫 재입고부터 표가 시작돼요.</b>,
    regionCaption: (x: RestockTimesView) => `iPhone Duo 확인 재입고를 ${rtU(x)} 단위로 · ${rtW(x)} · ${dateLabel(x.t.since, false)}~오늘`,
    regionHead: (x: RestockTimesView) => [rtU(x), "재입고", "재입고된 매장", "최신 재입고(현지 시간)"],
    ofN: (a: number, b: number) => <>{n(b)}곳 중 {n(a)}곳</>,
    storesCaption: (x: RestockTimesView) => `${rtW(x)} iPhone Duo 재입고 상위 매장, ${dateLabel(x.t.since, false)}부터 오늘까지`,
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
    versus: (a: string, bCount: number, b: string) => `${a} 재입고 · 비교: ${b} ${n(bCount)}번`,
    restocksOf: (a: string) => `${a} 재입고`,
    byStorage: "용량별",
    byColour: "색상별",
    configNone: (x: RestockTimesView) => <b>{rtW(x)}에서 확인된 재입고가 있는 구성은 {yet(x)}하나도 없어요. 첫 재입고가 바로 들어갈 수 있게 8개 구성을 모두 올려 뒀어요.</b>,
    configCaption: (x: RestockTimesView) => `iPhone Duo 확인 재입고를 구성 단위로 · ${rtW(x)} · ${dateLabel(x.t.since, false)}~오늘`,
    configHead: ["구성", "재입고", "비율", "최신 재입고(현지 시간)"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>구성을 고르는 게 <b className="text-ink">매장을 고르는 것보다 중요해요</b></> },
      x.storageRatio != null
        ? { text: <>가장 많이 재입고되는 용량으로 정하면 다음 용량보다 확률이 약 <b className="text-ink">{x.storageRatio}배</b>예요</> }
        : { text: <>가장 많이 재입고되는 용량으로 정하면 확률이 <b className="text-ink">크게</b> 올라가요</> },
      { text: <><b className="text-ink">2TB</b>는 배송으로 주문하고 기다리는 쪽이 나아요</>, no: true },
      { text: <>가격과 실시간 재고: <Link href="/iphone-duo-most-restocked-stores">어떤 iPhone Duo가 가장 많이 재입고될까?</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{n(sell.medianSec)}초: {rtW(x)}에서 품절된 재입고 {n(sell.n)}회의 수명 중앙값이에요. {rtPct(sell.within2min)}는 2분 안에, {rtPct(sell.within20min)}는 20분 안에 사라졌어요.</b>,
    secUnit: "초",
    medianListing: "뜬 순간부터 사라질 때까지, 중앙값",
    within2: "2분 안에 사라짐",
    within20: "20분 안에 사라짐",
    fastest: "기록상 가장 빠른 품절",
    howLongNone: (x: RestockTimesView) => <b>{rtW(x)}에서 품절된 재입고가 {yet(x)}측정하기엔 적어요. 이 수치는 10회부터 나오고, 전체 데이터는 미국 페이지에 있어요.</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>2분은 apple.com 새로고침이 아니라 <b className="text-ink">알림</b>으로 잡는 시간이에요</> },
      { text: <>이 페이지의 다른 모든 수치는 이 숫자에서 나와요</> },
      { text: <>구성·{rtU(x)}별로 재입고마다 몇 초 갔는지: <Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo 재입고는 얼마나 빨리 품절될까?</Link></>, step: true },
    ],
    measured: "각 수치는 구성이 처음 올라온 것을 본 확인부터 사라진 것을 본 확인까지라 상한값이에요. 실제 수명은 더 짧아요.",

    unavailableLead: (x: RestockTimesView) => <b>재입고는 상태가 아니라 순간이에요. {x.one ? "매장 1곳" : `매장 ${n(x.stores)}곳`} × 구성 {n(x.configs)}개로 {rtW(x)}에는 {n(x.pairs)}가지 재고 가능성이 있는데, 지금 iPhone Duo를 하나라도 올린 매장은 {n(x.duoNow)}곳이에요.</b>,
    pairs: "가능한 매장 × 구성 조합",
    listingNow: "지금 iPhone Duo 픽업 재고가 있는 매장",
    goneIn2: "2분 안에 끝난 재입고 비율",
    last24: "확인된 재입고, 최근 24시간",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <><b className="text-ink">재입고 {n(x.recent.restocks)}건 확인</b> · 지난 24시간 · {rtW(x)} 매장 {n(x.recent.stores)}곳</> }
        : today > 0
          ? { text: <><b className="text-ink">재입고 {n(today)}건 확인</b> · 오늘 · {rtW(x)}</> }
          : { text: <>실제로 있었던 재입고는 위 날짜 표에 있어요</> },
      { text: <>각각 apple.com에 <b className="text-ink">1~2분</b> 올라와 있었어요</> },
      { text: <>4일째든 14일째든 “어디서나 구매 불가”가 Apple이 멈췄다는 뜻은 <b className="text-ink">아니에요</b></>, no: true },
    ],
    unavailableLinks: { explained: "“현재 픽업 불가”의 뜻", howToGet: "iPhone Duo 구하는 법, 단계별로" },

    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>와 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>의 조언은 대부분 솔직하지만 매장 한 곳의 경험이고, 다음 날이면 낡아요. 가장 자주 나오는 주장 네 가지를 {rtW(x)}의 확인된 재입고 {n(x.t.n)}회와 대조했어요.</b>,
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
      { text: <>알림이 걸린 매장은 <b className="text-ink">{SPEED.fastSec}초</b>마다, {x.one ? `${rtW(x)}의 Apple Store` : `${rtW(x)}의 모든 Apple Store`}는 <b className="text-ink">{SPEED.checkSec}초</b>마다</> },
      { text: <>다른 트래커가 공개한 주기: <b className="text-ink">8초~15분</b>. 저희는 그들이 공개한 수치끼리만 비교해요</> },
      { text: <>처음 보인 “구매 가능”은 <b className="text-ink">약 1초 뒤</b> 다시 확인한 다음에야 인정해요</> },
      { text: <>사라진 재고는 <b className="text-ink">다음 회차</b>에서 확정해요</> },
      { text: <>매장을 처음 본 순간, 실패한 요청, 시간 초과: <b className="text-ink">절대</b> 재입고도 “품절”도 아니에요</>, no: true },
      { text: <>모든 시간과 날짜는 각 매장의 <b className="text-ink">현지 시간</b>이에요. “물량 풀림”은 시간대가 달라도 같은 30분을 말해요</> },
      { text: <>다른 트래커의 보고{x.t.reports.length ? `(${x.reportNames.join(", ")})` : ""}는 별도로 표시된 행에 두고 <b className="text-ink">모든 합계에서 빼요</b></> },
      { text: <>이 표들은 약 5분마다 갱신되고, <Link href={x.logHref}>재입고 기록</Link>은 실시간이에요</>, step: true },
    ],
    quote: "이 페이지 인용: 링크만 남겨 주시면 어떤 수치든 인용하셔도 좋아요. RestockWire는 Apple과 무관한 독립 서비스이고, 누구나 apple.com에서 볼 수 있는 픽업 가능 여부를 훨씬 자주 읽을 뿐이에요.",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${rtW(x)} `}iPhone Duo 알림 받기</>,

    related: "iPhone Duo 질문 더 보기",
    sameData: "같은 기록으로 만든 페이지",
    questions: {
      sellOut: "재입고는 얼마나 가나요?",
      alerts: "재입고 소식을 가장 빨리 듣는 법",
      howToGet: "실제로 손에 넣는 법",
      whichConfig: "자주 돌아오는 구성은?",
      nearMe: "내 주변 실시간 재고",
      unavailable: "“구매 불가”의 뜻",
    },
    otherCountries: ((us: boolean): string => (us ? "다른 나라의 이 페이지" : "다른 나라")) as Dict["views"]["restockTimes"]["otherCountries"],
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "도시별 페이지",
      storesLive: (x: RestockTimesView) => `${rtW(x)} Apple Store 실시간 재고`,
      countryPage: (c: Country) => `${dom(c)} iPhone Duo 재입고 시각, 전체 매장`,
      sourcesWhere: (x: RestockTimesView) => `${rtW(x)} Apple Store ${x.stores}곳 전체`,
    },
    faqTitle: "자주 받는 질문",
  },
};
