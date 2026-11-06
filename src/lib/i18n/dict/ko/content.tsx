/**
 * 한국어 문구: content — SEO 구성 요소(FAQ, 둘러보기, 숫자 띠, 제품 부분, 출처, 실시간 위젯), enrich 도우미
 * (영업시간, 기간, FAQ 답, 제목), 실시간 {{토큰}}, 재입고 패턴 문장, 사진 대체 텍스트.
 * 인자는 이미 한국어로 형식이 맞춰져 와요(숫자, 기간, 거리, 매장·도시·색상 이름, "재입고 31회" 같은 개수+명사).
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { eulReul, eunNeun, ieyo, krAddress } from "./common";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
const CHECK = "15초마다, 알림 매장은 5초마다";

export const content: Dict["content"] = {
  hours: {
    closed: "휴무",
    everyDay: (hours: string) => `매일 ${hours}`,
    tomorrow: "내일",
    dayAt: (day: string, time: string) => (/^[월화수목금토일]$/.test(day) ? `${day}요일 ${time}` : `${day} ${time}`),
    closedTodayOpens: (next: string) => `오늘 휴무 · ${next} 오픈`,
    closedToday: "오늘 휴무",
    opensAt: (time: string) => `${time} 오픈`,
    openNow: (closes: string) => `영업 중 · ${closes} 마감`,
    closedNowOpens: (next: string) => `영업 종료 · ${next} 오픈`,
    closedNow: "영업 종료",
  },

  duration: {
    underAMinute: "1분 미만",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `외 ${n}곳`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}의` : `${place}에서`),
    nRestocks: f({ other: "재입고 #회" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `최근 ${days}일 동안 ${where} 재입고는 0회예요` : `최근 ${days}일 동안 ${where} ${count}(지난 7일 ${week}회)예요`}${peak ? `. 주로 현지 시간 ${peak.hour} 무렵에 몰리고${peak.day ? `, 가장 잦은 요일은 ${peak.day}이에요` : "요"}` : ""}. Apple은 재입고 일정을 따로 알리지 않아요.`,
    lastsNone: (where: string) => `${where} 재입고 후 품절까지 이어진 기록이 아직 적어서 수치로 말하기 어려워요.`,
    lasts: (days: string, duration: string) => `중앙값으로 약 ${duration}이에요. 최근 ${days}일 동안 재입고된 구성이 품절되기 전까지 목록에 떠 있던 시간이에요.`,
    storeIn: (store: string, line: string) => `${store}(${line})`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `지금 ${model} 픽업 재고는 어디에 있나요?`,
    modelStockNone: (model: string) => `최근 확인에서는 미국 Apple Store 어디에도 없었어요. ${model} 픽업 재고가 뜨면 첫 매장이 바로 이 페이지에 올라와요.`,
    nUsStores: f({ other: "미국 Apple Store #곳" }),
    modelStockSome: (count: string) => `최근 확인 기준 ${ieyo(count)}. 매장마다 재고 있는 구성이 이 페이지에 나와요.`,
    priceQ: (model: string) => `${model} 가격은 얼마인가요?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `자급제 기준 ${low}~${high}이고 용량(${storages})에 따라 달라요. 색상은 ${ieyo(colors)}.`,
    modelRestockQ: (model: string) => `${eunNeun(model)} 얼마나 자주 재입고되나요?`,
    modelLastsQ: (model: string) => `${model} 재고가 돌아오면 얼마나 오래 남아 있나요?`,
    reserveQ: (model: string) => `${eulReul(model)} 픽업용으로 미리 예약할 수 있나요?`,
    reserveA: "미리는 안 돼요. 매장에 원하는 구성이 뜨면 apple.com에서 매장 픽업으로 주문하고, Apple이 고른 픽업 시간대까지 보관해 줘요.",

    storeStockQ: (store: string, model: string) => `${store}에 ${model} 재고가 있나요?`,
    nConfigs: f({ other: "#개 구성" }),
    storeStockYes: (count: string) => `네, 최근 확인 기준 ${ieyo(count)}. 용량과 색상은 이 페이지 표에서 볼 수 있어요.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `아니요, 최근 확인에서는 없었어요${other ? `. 대신 iPhone 18 Pro ${other.pro}개, 18 Pro Max ${other.proMax}개 구성은 올라와 있어요` : `. 18 Pro와 18 Pro Max 구성도 없어요`}.`,
    hoursQ: (store: string) => `${store} 영업시간은 어떻게 되나요?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "영업시간은 이 페이지 표를 확인하세요"}${today ? ` · 오늘 ${today}` : ""}. 주소: ${krAddress(address)}${phone ? ` · 전화 ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `${store}에서는 iPhone이 얼마나 자주 재입고되나요?`,
    storeLastsQ: (store: string) => `${store}에서 재입고된 재고는 얼마나 오래 남아 있나요?`,
    storeNearestQ: (store: string) => `${store}에서 가장 가까운 Apple Store는 어디인가요?`,

    placeStockQ: (place: string, model: string) => `지금 ${model} 픽업 재고가 있는 ${place} Apple Store는 어디인가요?`,
    placeStockNone: (place: string, model: string) => `최근 확인에서는 없었어요. ${place} 매장에 ${model} 재고가 뜨는 순간 이 페이지에 나타나요.`,
    nStores: f({ other: "#곳" }),
    placeStockSome: (count: string, stores: string) => `최근 확인 기준 ${count}: ${stores}.`,
    countQ: (place: string) => `${place}에는 Apple Store가 몇 곳 있나요?`,
    nAppleStores: f({ other: "Apple Store #곳" }),
    countMany: (count: string, stores: string) => `${ieyo(count)}. ${stores} 등이 있어요.`,
    countOne: (count: string, store: string) => `${count}, ${ieyo(store)}.`,
    placeRestockQ: (place: string) => `${place}에서는 iPhone이 얼마나 자주 재입고되나요?`,
    placeLastsQ: (place: string) => `${place}에서는 재고가 돌아오면 얼마나 오래 남아 있나요?`,
    placeNearestQ: (place: string) => `${place} 밖에서 가장 가까운 Apple Store는 어디인가요?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "미국의 모든 Apple Store" : `${place} Apple Store`;
    return [
      "매장 픽업은 apple.com 구매 방식이에요. 결제할 때 구성과 매장을 고르고 온라인으로 결제한 뒤 매장에서 직접 받아요. 당일 픽업도 흔해요. 통신사 매장이나 매장 진열 재고와는 별개예요.",
      `RestockWire는 ${at}에서 추적하는 모든 구성을 15초마다, 알림이 설정된 곳은 5초마다 확인해요. 변화는 두 번째 확인으로 맞아야만 인정되므로, 일시적인 오류가 재입고나 품절로 잡히는 일은 없어요.`,
      "확인된 변화는 모두 기록에 남고, 이 기록으로 이 페이지의 재입고 차트와 이력이 그려져요.",
    ];
  },
  alertRule: "알림 하나는 매장 하나와 정확한 iPhone 하나(모델·용량·색상)예요. apple.com이 구매 가능으로 바뀌면 몇 초 안에 푸시가 가고, 알림을 받는 기기가 없으면 이메일로 가요.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store: ${stores}곳 중 ${duoNow}곳에 iPhone Duo`,
      `${name} Apple Store · iPhone Duo 픽업 재고 실시간`,
      `${name} Apple Store · 지금 iPhone Duo 재고`,
      `${name} Apple Store · iPhone 재고 실시간`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}, ${code} Apple Store: ${stores}곳 중 ${duoNow}곳에 iPhone Duo`,
      `${city}, ${code} Apple Store · iPhone Duo 픽업 실시간`,
      `${city}, ${code} Apple Store · 지금 iPhone Duo 재고`,
      `${city} Apple Store · iPhone 재고 실시간`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone 실시간 재고·재입고 시간·픽업`,
        `${name}${r}: iPhone 실시간 재고·재입고 시간`,
        `${name}${r}: iPhone 실시간 재고·영업시간`,
        `${name}: iPhone 실시간 재고·재입고 시간·픽업`,
        `${name}: iPhone 실시간 재고·영업시간`,
        `${name}: iPhone 실시간 재고`,
        `${name} 실시간 재고`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} 픽업 재고: 지금 Apple Store ${storesNow}곳에 있어요`,
      `${name} 픽업 재고: 지금 Apple Store ${storesNow}곳`,
      `${name} 매장 픽업 재고 실시간`,
    ],
  },

  tokens: {
    tooFewToMeasure: "아직 데이터 부족",
    noneLoggedYet: "아직 기록 없음",
    noneYet: "아직 없음",
  },

  pattern: {
    none: (days: string) => `최근 ${days}일 동안 확인된 재입고는 0회예요.`,
    nConfirmed: f({ other: "확인된 재입고 #회" }),
    countIn: (count: string, days: string) => `최근 ${days}일 동안 ${count}`,
    stay: (minutes: string) => `, 재입고 후 보통 ~${minutes}분 동안 남아 있어요`,
    nDays: f({ other: "#일" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `(${onDays})` : ""}. 평소 시간대를 말하기엔 아직 부족해요${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `평소 재입고 시간: 현지 시간 ${hour}${weekday ? `, 가장 잦은 요일은 ${weekday}` : ""}. ${count}${stay}.`,
  },

  regionNouns: {
    state: f({ other: "주" }),
    province: f({ other: "주" }),
    area: f({ other: "지역" }),
    department: f({ other: "데파르트망" }),
    prefecture: f({ other: "도도부현" }),
    emirate: f({ other: "토후국" }),
    canton: f({ other: "칸톤" }),
    region: f({ other: "지역" }),
    county: f({ other: "카운티" }),
    city: f({ other: "도시" }),
  },

  measured: "수치를 재는 방법",

  faqTitle: "묻고 답하기",
  breadcrumb: "탐색 경로",
  keepExploring: "RestockWire 더 보기",
  browse: {
    storesByState: "주별 매장",
    allStatesCities: "모든 주와 도시 →",
    liveByModel: "모델별 실시간 재고",
    modelStock: (model: string) => `${model} 재고`,
    thisPage: "이 페이지",
    restockLog: (short: string) => `${short} 재입고 기록`,
    liveMap: "실시간 지도",
    mostStores: "매장이 가장 많은 곳",
    allStates: "모든 주",
    bigCities: "주요 도시",
    cities: "도시",
    storesBy: (region: string) => `${region}별 매장`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{country}의 모든 Apple Store →</>,
    allRegions: (regions: string) => `모든 ${regions}`,
  },
  modelCards: "iPhone 고르기",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}최신 재입고: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> · {store}</>,
  },
  statStrip: {
    inStockNow: "지금 재고",
    ofStores: (n: string) => `전체 ${n}곳 중`,
    stores: "매장",
    nCities: f({ other: "도시 #곳" }),
    tracked: "실시간 확인 중",
    modelNow: (short: string) => `지금 ${short}`,
    configsInStock: "재고 있는 구성",
    storesWithStock: f({ other: "재고 있는 매장" }),
    restocks24h: "재입고 · 24시간",
    restocksHint: (week: string, month: string, days: string) => `7일 ${week} · ${days}일 ${month}`,
    sellOuts: (days: string) => `품절 · ${days}일`,
    stays: (duration: string) => `~${duration} 유지`,
    noPairs: "아직 짝지은 품절 없음",
    lastRestock: "최신 재입고",
    noneYet: "아직 없음",
    inLastDays: (days: string) => `최근 ${days}일`,
  },
  product: {
    chooseIphone: "iPhone 고르기",
    storage: "용량",
    color: "색상",
    all: "전체",
    numbersAre: (unit: ReactNode) => <>숫자는 지금 재고가 있는 {unit} 수예요.</>,
    seen: (ago: ReactNode) => <>{ago} 재고</>,
    last: (ago: ReactNode) => <>마지막 {ago}</>,
    notSeenYet: "아직 재고 없음",
    firstCheckPending: "첫 확인 진행 중",
    inStock: "재고 있음",
    inStockLower: "재고 있음",
    none: "없음",
    here: "바로 여기",
    notAvailable: "재고 없음",
    notCheckedYet: "아직 확인 전",
    availableForPickup: "픽업 가능",
    since: (ago: ReactNode) => <> · {ago}부터 재고</>,
    lastInStock: (ago: ReactNode) => <>마지막 재고 {ago}</>,
    neverSeen: "이 매장에는 아직 재고가 뜬 적이 없어요",
    firstCheckSoon: "1분 안에 첫 확인이 진행돼요",
    buy: "apple.com에서 주문하기",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked} 확인 · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>데이터: {source}</>,
  photoCredit: (link: ReactNode) => <>사진: {link}</>,
  sources: "출처",
  allUsStores: "미국 Apple Store 269곳 전체",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire 자체 실시간 확인({since}부터): {where}의 iPhone Duo, 18 Pro, 18 Pro Max 모든 구성을 15초마다(알림이 설정된 곳은 5초마다) 읽어요. 이 페이지의 수치는 {asOf} 기준이에요.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>실시간: {model} 구성별로 픽업 재고가 있는 Apple Store 수(전체 {stores}곳)</>,
    storage: "용량",
    pricesCaption: (model: ReactNode) => <>{model}: apple.com 가격(자급제, 세전)과 실시간 픽업 재고</>,
    price: "가격",
    bestColor: "재고가 가장 많은 색상(지금 매장 수)",
    noRestock: (model: string) => `${model} 재입고 기록은 아직 없어요.`,
    clockLabel: (model: string) => `미국 전역의 ${model}`,
    storesWithIt: "지금 재고 있는 매장",
    pairsInStock: "재고 있는 매장 × 구성",
    restocksLogged: "기록된 재입고",
    medianTime: "재고 유지 시간(중앙값)",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Store 안, ‘Pickup’ 표지가 달린 나무 픽업 카운터", caption: "픽업 주문은 이런 카운터에서 건네받아요." },
    "phone-map": { alt: "야외에서 스마트폰 지도 앱으로 길을 찾는 두 손", caption: "재입고가 1분이면 끝날 때, 매장까지의 거리는 생각보다 중요해요." },
    "phone-card-payment": { alt: "iPhone과 신용카드를 들고 온라인으로 결제하는 여성", caption: "매장 픽업을 위해 온라인으로 결제하는 모습." },
    "phone-on-box": { alt: "흰 상자 위에 놓인 새 스마트폰", caption: "상자에서 막 꺼낸 새 휴대폰." },
    "city-map-phone": { alt: "휴대폰으로 도시 지도를 함께 보는 두 사람", caption: "매장까지 가는 길을 미리 확인하기." },
    "phone-notification": { alt: "잠금 화면에 알림이 뜬 휴대폰을 든 손", caption: "잠금 화면에 알림이 도착해요." },
    "apple-store-crowd-inside": { alt: "쇼핑몰 안 붐비는 Apple Store에서 줄을 선 사람들", caption: "출시 주간 Apple Store의 인파: 매장에 풀린 재고는 몇 분 만에 사라져요." },
    "apple-store-glass-canopy": { alt: "밤에 본 유리 외관과 나무 캐노피의 Apple Store", caption: "해가 진 뒤의 유리 외관 Apple Store." },
    "apple-store-night-vancouver": { alt: "밤에 불을 밝힌 밴쿠버의 Apple Store", caption: "밤의 Apple Store: 픽업 재고는 언제든 뜰 수 있지만 오전에 훨씬 자주 들어와요." },
    "phone-hand-camera": { alt: "트리플 카메라 iPhone을 손에 든 사람", caption: "사람들이 줄을 서는 건 Pro 모델이에요." },
    "place-kr-seoul": { alt: "해 질 녘 석촌호수와 서울 스카이라인 위로 솟은 롯데월드타워", caption: "롯데월드타워. Apple 잠실은 타워 아래 롯데월드몰에 있어요." },
    "place-kr-south-korea": { alt: "맑은 하늘 아래 경복궁의 정문 광화문", caption: "서울 경복궁 광화문." },
  },
};
