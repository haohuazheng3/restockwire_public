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
const CHECK = "알림 매장 5초 · 그 밖의 매장 15초 간격";

export const content: Dict["content"] = {
  hours: {
    closed: "휴무",
    everyDay: (hours: string) => `매일 ${hours}`,
    tomorrow: "내일",
    dayAt: (day: string, time: string) => (/^[월화수목금토일]$/.test(day) ? `${day}요일 ${time}` : `${day} ${time}`),
    closedTodayOpens: (next: string) => `오늘은 쉬는 날 · ${next}에 열어요`,
    closedToday: "오늘은 쉬는 날",
    opensAt: (time: string) => `${time}에 열어요`,
    openNow: (closes: string) => `지금 열려 있음 · ${closes}까지`,
    closedNowOpens: (next: string) => `지금은 닫힘 · ${next}에 열어요`,
    closedNow: "지금은 닫힘",
  },

  duration: {
    underAMinute: "1분 안쪽",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `외 ${n}곳`,
  nearLine: (place: string, distance: string) => `${place} · ${distance}`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}의` : `${place}에서`),
    nRestocks: f({ other: "#번" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${days}일 기록상 ${where} 재입고는 한 번도 없었어요` : `${days}일 기록상 ${where} 재입고 ${count}, 이 중 이번 7일이 ${week}번이에요`}${peak ? `. 몰리는 때는 현지 ${peak.hour} 전후${peak.day ? `, 요일로는 ${peak.day}` : ""}예요` : ""}. 재입고 일정은 Apple이 미리 공개하지 않아요.`,
    lastsNone: (where: string) => `${where} 재입고 후 품절까지 이어진 기록이 아직 적어서 수치로 말하기 어려워요.`,
    lasts: (days: string, duration: string) => `중앙값으로 약 ${duration}이에요. 최근 ${days}일 동안 재입고된 구성이 품절되기 전까지 목록에 떠 있던 시간이에요.`,
    storeIn: (store: string, line: string) => `${store}(${line})`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `지금 ${model} 픽업 재고는 어디에 있나요?`,
    modelStockNone: (model: string) => `최근 확인에서는 미국 Apple Store 어디에도 없었어요. ${model} 픽업 재고가 뜨면 첫 매장이 바로 이 페이지에 올라와요.`,
    nUsStores: f({ other: "미국 내 매장 #곳" }),
    modelStockSome: (count: string) => `최근 확인 기준 ${ieyo(count)}. 매장마다 재고 있는 구성이 이 페이지에 나와요.`,
    priceQ: (model: string) => `${model} 출고가는 얼마인가요?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `가장 낮은 구성 ${low}, 가장 높은 구성 ${high}(자급제). 가격을 가르는 건 용량(${storages})이고, 색상 선택지는 ${ieyo(colors)}.`,
    modelRestockQ: (model: string) => `${model} 재입고 주기는 어떻게 되나요?`,
    modelLastsQ: (model: string) => `${model} 재고가 돌아오면 얼마나 오래 남아 있나요?`,
    reserveQ: (model: string) => `${eulReul(model)} 픽업용으로 미리 예약할 수 있나요?`,
    reserveA: "미리는 안 돼요. 매장에 원하는 구성이 뜨면 apple.com에서 매장 픽업으로 주문하고, Apple이 고른 픽업 시간대까지 보관해 줘요.",

    storeStockQ: (store: string, model: string) => `지금 ${store}에서 ${eulReul(model)} 픽업할 수 있나요?`,
    nConfigs: f({ other: "구성 #개" }),
    storeStockYes: (count: string) => `네. 마지막 확인 때 픽업 가능한 건 ${ieyo(count)}. 용량·색상별 상태는 아래 표에 있어요.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `아니요. 마지막 확인 때는 잡히지 않았어요${other ? `. iPhone 18 Pro는 ${other.pro}개, 18 Pro Max는 ${other.proMax}개 구성이 지금 픽업 가능해요` : `. 18 Pro·18 Pro Max도 마찬가지예요`}.`,
    hoursQ: (store: string) => `${eunNeun(store)} 몇 시에 열고 닫나요?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "요일별 시간은 이 페이지 표에 있어요"}${today ? ` · 오늘은 ${today}` : ""}. 위치: ${krAddress(address)}${phone ? ` · 전화번호 ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `${store}에서는 iPhone이 얼마나 자주 재입고되나요?`,
    storeLastsQ: (store: string) => `${store}에서 재입고된 재고는 얼마나 오래 남아 있나요?`,
    storeNearestQ: (store: string) => `${store}에서 가장 가까운 Apple Store는 어디인가요?`,

    placeStockQ: (place: string, model: string) => `${place}에서 지금 ${model} 픽업 재고가 잡힌 매장은 어디예요?`,
    placeStockNone: (place: string, model: string) => `마지막 확인 때는 한 곳도 없었어요. ${place}의 어느 매장이든 ${model} 재고가 잡히면 곧바로 여기에 떠요.`,
    nStores: f({ other: "매장 #곳" }),
    placeStockSome: (count: string, stores: string) => `마지막 확인 때 ${count}: ${stores}.`,
    countQ: (place: string) => `${place}의 Apple Store는 모두 몇 개예요?`,
    nAppleStores: f({ other: "모두 #곳" }),
    countMany: (count: string, stores: string) => `${ieyo(count)}. 대표적으로 ${stores}.`,
    countOne: (count: string, store: string) => `${count}뿐이에요. 그 한 곳이 ${ieyo(store)}.`,
    placeRestockQ: (place: string) => `${place}에서는 iPhone이 얼마나 자주 재입고되나요?`,
    placeLastsQ: (place: string) => `${place}에서는 재고가 돌아오면 얼마나 오래 남아 있나요?`,
    placeNearestQ: (place: string) => `${eulReul(place)} 벗어나면 가장 가까운 Apple Store는 어디예요?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "미국 전역 Apple Store" : `${place}의 Apple Store`;
    return [
      "매장 픽업은 apple.com 구매 방식이에요. 결제할 때 구성과 매장을 고르고 온라인으로 결제한 뒤 매장에서 직접 받아요. 당일 픽업도 흔해요. 통신사 매장이나 매장 진열 재고와는 별개예요.",
      `RestockWire는 ${at}에서 추적하는 모든 구성을 15초마다, 알림이 설정된 곳은 5초마다 확인해요. 변화는 두 번째 확인으로 맞아야만 인정되므로, 일시적인 오류가 재입고나 품절로 잡히는 일은 없어요.`,
      "확인된 변화는 모두 기록에 남고, 이 기록으로 이 페이지의 재입고 차트와 이력이 그려져요.",
    ];
  },
  alertRule: "알림 하나는 매장 하나와 정확한 iPhone 하나(모델·용량·색상)예요. apple.com이 구매 가능으로 바뀌면 몇 초 안에 푸시가 가고, 알림을 받는 기기가 없으면 이메일로 가요.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} iPhone Duo 재고: Apple Store ${stores}곳 중 ${duoNow}곳`,
      `iPhone Duo 픽업 재고 라이브 · ${name} Apple Store`,
      `${name} Apple Store · 지금 iPhone Duo 재고`,
      `${name} Apple Store · iPhone 재고 실시간`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}, ${code} iPhone Duo 재고: ${stores}곳 중 ${duoNow}곳`,
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
      `${name} 매장 픽업 재고 · 라이브`,
    ],
  },

  tokens: {
    tooFewToMeasure: "아직 데이터 부족",
    noneLoggedYet: "기록 0건",
    noneYet: "아직 0건",
  },

  pattern: {
    none: (days: string) => `최근 ${days}일 동안 확인된 재입고는 0회예요.`,
    nConfirmed: f({ other: "재입고 #번 확인" }),
    countIn: (count: string, days: string) => `최근 ${days}일 사이 ${count}`,
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
  breadcrumb: "현재 위치",
  keepExploring: "RestockWire 더 보기",
  browse: {
    storesByState: "주마다 매장 보기",
    allStatesCities: "모든 주와 도시 →",
    liveByModel: "모델마다 실시간 재고",
    modelStock: (model: string) => `${model} 재고`,
    thisPage: "지금 보는 페이지",
    restockLog: (short: string) => `${short} 재입고 로그`,
    liveMap: "라이브 재고 지도",
    mostStores: "매장이 가장 많은 곳",
    allStates: "모든 주",
    bigCities: "큰 도시",
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
    inStockNow: "현재 픽업 가능",
    ofStores: (n: string) => `${n}곳 가운데`,
    stores: "매장",
    nCities: f({ other: "도시 #곳" }),
    tracked: "실시간 확인 중",
    modelNow: (short: string) => `지금 ${short}`,
    configsInStock: "픽업 가능 구성",
    storesWithStock: f({ other: "픽업 가능 매장" }),
    restocks24h: "재입고 · 24시간",
    /** A tile that counts one model only (its short name first). */
    scoped: (label: string, model: string) => `${model} · ${label}`,
    restocksHint: (week: string, month: string, days: string) => `7일 ${week} · ${days}일 ${month}`,
    sellOuts: (days: string) => `품절 · ${days}일`,
    stays: (duration: string) => (duration === "1분 안쪽" ? `${duration} 유지` : `~${duration} 유지`),
    noPairs: "아직 짝지은 품절 없음",
    lastRestock: "최신 재입고",
    noneYet: "아직 0건",
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
    inStock: "재고 잡힘",
    inStockLower: "재고 잡힘",
    none: "없음",
    here: "바로 여기",
    notAvailable: "재고 안 잡힘",
    notCheckedYet: "확인 대기",
    availableForPickup: "픽업 가능 상태",
    since: (ago: ReactNode) => <> · {ago}부터 재고</>,
    lastInStock: (ago: ReactNode) => <>마지막으로 잡힌 때 {ago}</>,
    neverSeen: "이 매장에는 아직 재고가 뜬 적이 없어요",
    firstCheckSoon: "1분 안에 첫 확인이 진행돼요",
    buy: "apple.com에서 주문하기",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked} 확인 · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>데이터: {source}</>,
  photoCredit: (link: ReactNode) => <>사진: {link}</>,
  sources: "출처",
  allUsStores: "미국 내 Apple Store 269곳 모두",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire 자체 실시간 확인({since}부터): {where}의 iPhone Duo, 18 Pro, 18 Pro Max 모든 구성을 15초마다(알림이 설정된 곳은 5초마다) 읽어요. 이 페이지의 수치는 {asOf} 기준이에요.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>실시간: {model} 구성별로 픽업 재고가 있는 Apple Store 수(전체 {stores}곳)</>,
    storage: "용량",
    pricesCaption: (model: ReactNode) => <>{model}: apple.com 가격(자급제, 세전)과 실시간 픽업 재고</>,
    price: "가격",
    bestColor: "재고가 가장 많은 색상(지금 매장 수)",
    noRestock: (model: string) => `${model} 재입고 기록은 아직 없어요.`,
    clockLabel: (model: string) => `미국 전역의 ${model}`,
    storesWithIt: "현재 픽업 가능 매장",
    pairsInStock: "픽업 가능한 매장×구성 조합",
    restocksLogged: "기록한 재입고 수",
    medianTime: "재고가 남는 시간 · 중앙값",
    underOneMin: (min: string) => `${min} 미만`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Store가 들어선 쇼핑몰의 넓은 아트리움과 에스컬레이터, 자연광", caption: "이런 쇼핑몰 매장은 문을 열기 전에 픽업 재고를 채워요." },
    "phone-map": { alt: "야외에서 지도 앱을 띄운 스마트폰을 든 손 클로즈업", caption: "재입고가 1분이면 끝날 때, 매장까지의 거리는 생각보다 중요해요." },
    "phone-card-payment": { alt: "결제 단말기에 스마트폰을 대고 비접촉 결제를 하는 여성", caption: "결제는 온라인으로 미리, 수령은 매장에서." },
    "phone-on-box": { alt: "흰 배경에 놓인, 상자에 담긴 스마트폰", caption: "아직 상자 안이지만, 이미 예약된 한 대." },
    "city-map-phone": { alt: "시골길 여행 중 휴대폰으로 길을 찾는 젊은 커플", caption: "매장까지 가는 길을 미리 확인하기." },
    "phone-notification": { alt: "‘Hard Work Forever Pays.’라는 문구가 뜬 스마트폰을 든 손 클로즈업", caption: "알림은 바로 이 화면으로 와요." },
    "apple-store-crowd-inside": { alt: "방콕의 한 쇼핑몰 안 Apple Store에서 테이블 위 기기를 써 보는 사람들", caption: "매장 안 테이블은 모두 체험용, 픽업 줄은 안쪽에 생겨요." },
    "apple-store-glass-canopy": { alt: "시카고 도심 강변에 자리한, 유리로 지은 현대적인 Apple Store 외관", caption: "시카고 강변의 유리 Apple Store." },
    "apple-store-night-vancouver": { alt: "밤에 불을 밝힌 밴쿠버 스카이라인과 다리의 항공 사진", caption: "밤의 밴쿠버. 픽업 재고는 언제든 뜰 수 있지만 오전에 훨씬 자주 들어와요." },
    "phone-hand-camera": { alt: "주황색 케이스에 카메라 렌즈 세 개가 달린 스마트폰을 쥔 손 클로즈업", caption: "줄이 가장 길게 늘어서는 쪽은 Pro 모델." },
    "place-kr-seoul": { alt: "밤에 화려하게 불을 밝힌 서울 도심의 항공 사진", caption: "서울: 불 켜진 도심을 위에서." },
    "place-kr-south-korea": { alt: "잔잔한 물가에 비친 도심의 고층 빌딩들", caption: "한국: 물가에 비친 고층 빌딩." },
    "compare-pickup-bag": { alt: "실내에서 쇼핑백을 건네는 두 사람", caption: "픽업은 카운터에서 끝나지만, 매장 선택은 훨씬 전에 시작돼요." },
    "compare-two-stores": { alt: "붐비는 거리의 유리 쇼윈도에 비친 행인들", caption: "같은 도시의 두 매장도 재입고 시간이 다른 경우가 많아요." },
    "guide-android-phone": { alt: "홈 화면이 켜진 Android 스마트폰을 든 손", caption: "Android에서는 아무것도 설치하지 않아도 Chrome이 알림을 전해요." },
    "guide-android-watch": { alt: "스마트워치를 찬 여성의 손목 클로즈업", caption: "페어링된 Wear OS 워치에 Chrome이 받은 알림이 표시돼요." },
    "guide-focus-desk": { alt: "사무실 책상에서 노트북 옆에 두고 스마트폰을 확인하는 젊은 여성", caption: "RestockWire를 허용 목록에 넣는 걸 가장 자주 잊는 곳이 업무 집중 모드예요." },
    "guide-focus-phone-night": { alt: "어두운 침실에서 화면 불빛을 받으며 스마트폰을 보는 여성", caption: "수면 집중 모드는 RestockWire가 허용 목록에 없으면 알림을 막아요." },
    "guide-watch-notification": { alt: "야외에서 손목의 스마트워치를 탭하는 손", caption: "매장은 손목에서 확인하고, 예약은 iPhone에서 하세요." },
    "guide-watch-wrist": { alt: "손목의 스마트워치에 알림이 뜬 흑백 클로즈업", caption: "iPhone이 잠겨 있으면 재입고 알림은 워치로 와요." },
    "ranking-checkout": { alt: "매장 계산대 단말기에서 스마트폰으로 결제하는 손님", caption: "가장 빠른 매장에서는 알림 후 몇 초 안에 예약을 끝내야 해요." },
    "ranking-queue": { alt: "도심 거리의 붐비는 매장 앞에 줄 선 사람들", caption: "빨리 품절되는 건 입고량이 아니라 매장 주변 수요 때문이에요." },
    "reports-delivery-boxes": { alt: "물류창고 하역장 앞에 쌓인 골판지 상자", caption: "재고는 배송으로 매장에 도착해요. 주간 리포트는 픽업 진열대에 오른 수량을 셉니다." },
    "reports-iphone-boxes": { alt: "나무 테이블 위에 놓인 새 iPhone과 상자, 충전 액세서리", caption: "리포트의 재입고 1건은 한 매장에 한 구성이 돌아온 것을 뜻해요." },
    "status-phone-check": { alt: "어두운 방에서 스마트폰을 유심히 보는 여성", caption: "픽업 조회를 기다리는 몇 분, 조회 상태를 알아야 하는 순간이에요." },
    "status-store-counter": { alt: "로딩 표시가 돌아가는 스마트폰을 든 손", caption: "조회가 멈추면 이렇게 보여요. 원인이 Apple인지 내 폰인지는 상태 페이지가 알려줘요." },
  },
};
