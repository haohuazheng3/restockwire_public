/**
 * 한국어 문구: modules — 재입고·매장·재고 모듈(src/components/{restocks,stores,stock}).
 * `label`은 페이지가 만든 조사 없는 장소 명사구("서울", "Apple 강남", "이 매장", "국내")예요. 문장마다 조사를 붙여 써요.
 * 숫자는 날것으로 와서 num()으로 적고, 시간·날짜·비율은 이미 형식이 맞춰져 와요. 확인 주기는 15초(전체)와 5초(알림 매장)뿐이에요.
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}에는 아직 차트에 그릴 게 없어요. 최근 ${n(days)}일 동안 재입고도 품절도 없었어요. 첫 기록이 첫 막대가 돼요.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `최근 ${n(days)}일 동안 ${label}에서 재입고 ${n(restocks)}회, 품절 ${n(soldouts)}회가 ${n(activeDays)}일에 걸쳐 있었어요.`,
    busiest: (day: string, restocks: number) => <> 가장 많았던 날은 <b className="text-ink">{day}</b>로, {n(restocks)}회였어요.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}: 재입고 ${n(restocks)}회, 품절 ${n(soldouts)}회`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 재입고 ${n(restocks)}회 · 품절 ${n(soldouts)}회`,
    legendRestocks: "재입고",
    legendSoldouts: "품절",
  },

  last24: {
    title: (label: string) => `${label}의 최근 24시간 iPhone Duo 재입고`,
    asOf: (when: string) => `${when} 확인`,
    localTime: (when: string) => `현지 시간 ${when}`,
    anAppleStore: "Apple Store",
    unknown: "지금은 24시간 집계를 볼 수 없어요. 이 페이지의 실시간 재고와 재입고 기록은 영향이 없어요.",
    none: (label: string, asOf: string) => <><b className="text-ink">최근 24시간 {label}의 iPhone Duo 재입고 0회</b> ({asOf} 확인).</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>최근 24시간 동안 <b className="text-ink">{o.one ? `${o.label}에서` : `${o.label} Apple Store ${n(o.allStores)}곳 중 ${n(o.withStores)}곳에서`} iPhone Duo 재입고 {n(o.restocks)}회</b>. 가장 최근은 <b className="text-ink">{o.config}</b>{o.store != null && <>, {o.store}</>}, 현지 시간 {o.when}이에요.</>
    ),
    tileRestocks: "24시간 동안 확인된 재입고",
    tileConfigsBack: "다시 올라온 구성",
    tileStores: (configs: number, allConfigs: number) => `재입고된 매장${configs ? ` · 구성 ${n(allConfigs)}개 중 ${n(configs)}개` : ""}`,
    tileLatest: (config: string, store: string | null) => <>최신 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>그 전 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "그 전 기록 없음",
    caption: (label: string, asOf: string) => `${label}의 모든 iPhone Duo 구성: 최근 24시간 확인된 재입고, ${asOf} 확인`,
    thConfig: "구성",
    thRestocks: "재입고",
    thStores: "매장",
    thLast: "최근 재입고(현지 시간)",
    thNow: "지금 재고",
    ofStores: (k: number, total: number) => `${n(total)}곳 중 ${n(k)}곳`,
    noneIn24: "24시간 내 없음",
    yes: "있음",
    no: "없음",
    countedTitle: "여기서 재입고로 세는 것",
    counted: "RestockWire가 apple.com 매장 픽업을 직접 읽은 결과예요. 모든 매장은 15초 간격, 알림을 건 매장은 5초 간격으로 읽어요. 두 번의 확인이 일치해야 기록에 올리고, 매장을 처음 읽은 순간은 세지 않으며, 다른 트래커가 공개한 내용은 섞지 않아요.",
    alert: (label: string | null) => `${label != null ? `${label} ` : ""}알림 받기: 다음 재입고를 몇 초 안에 알려 드려요`,
  },

  clock: {
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에는 아직 재입고가 없어요.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `최근 ${n(days)}일 동안 ${label}에서 재입고 ${n(total)}회${dates != null ? `(${n(dates)}일)` : ""}: 보통 시간대를 말하기엔 아직 부족해요.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>최근 {n(days)}일 동안 {label}에서 재입고 {n(total)}회. 보통 시간대는 현지 시간 <b className="text-ink">{hour}</b>이고{day ? <>, 가장 많은 요일은 <b className="text-ink">{day}</b>예요</> : <>예요</>}.</>
    ),
    byHour: (zone: string) => `시간별 · ${zone}`,
    byWeekday: "요일별",
    barReported: (k: number) => ` (+다른 트래커 제보 ${n(k)}회)`,
    barReportedTitle: (bar: string, k: number) => `${bar}: 다른 트래커 제보 ${n(k)}회`,
    legendOurs: "RestockWire 확인",
  },

  feed: {
    empty: "아직 기록이 비어 있어요.",
    available: "재고 있음",
    soldOut: "품절",
    soldOutAt: (time: ReactNode) => <>{time} 사라짐</>,
    since: (time: ReactNode) => <>{time}부터 재고</>,
    restockedAt: (time: ReactNode) => <>{time} 재입고</>,
    mapAria: (store: string) => `지도에서 ${store} 찾기`,
    map: "지도",
    buyAria: (model: string, config: string) => `apple.com에서 ${model} ${config} 주문하기`,
    buy: "apple.com에서 주문하기",
  },

  byConfig: {
    empty: (label: string, days: number) => `아직 순위가 없어요. 최근 ${n(days)}일 동안 ${label}에서 재입고된 게 없어요.`,
    intro: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 다시 올라온 구성을 자주 올라온 순으로 정리했어요.`,
    times: (k: number) => `${n(k)}회`,
    alert: "알림 받기",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}의 iPhone Duo 재입고 재고는 보통 약 ${band} 동안 버틴 뒤 품절됐어요.`,
    half: (label: string, duration: string) => `${duration}: ${label} 재입고의 절반이 품절되기까지 걸린 시간이에요.`,
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 재입고 후 품절까지 간 경우가 없어요.`,
    whatDuo: "iPhone Duo",
    whatAll: "모든 iPhone",
    tileHalf: (what: string) => <>절반이 사라지기까지 · {what}</>,
    tileWithin30: "30초 안에 사라짐",
    tileWithin60: "1분 안에 사라짐",
    tileFastest: (k: number, days: number) => <>최단 · 품절된 재입고 {n(k)}회, {n(days)}일</>,
    caption: (days: number) => `iPhone별, 최근 ${n(days)}일`,
    thIphone: "iPhone",
    thSoldOut: "품절",
    thHalf: "절반이 사라지기까지",
    thWithin30: "≤ 30초",
    thWithin60: "≤ 1분",
    thFastest: "최단",
    each: "재입고마다 한 줄",
    barNote: (full: string) => `막대 길이 = 재고가 떠 있던 초 · ${full}이면 한 줄 가득`,
    stillListed: (duration: string) => `아직 재고 있음 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "이 시간을 재는 방법",
    measured: (estimated: boolean) =>
      `‘45–60초 만에 품절’이라는 줄은, 처음 본 뒤 45초 시점의 확인에서는 그 구성이 아직 있었고 60초 시점의 확인에서는 사라졌다는 뜻이에요. 각 범위의 폭은 확인 간격이에요. 알림을 건 매장은 5초, 그 밖의 매장은 15초예요${estimated ? ". ≈ 표시가 있는 줄은 마지막 확인을 저장하기 전의 기록이라 15초 주기로 범위를 잡았어요" : ""}. 확인 간격보다 짧게 떴던 재고는 두 확인 사이에 나타났다 사라질 수 있어서, 실제로 30초 안에 사라지는 비율은 표보다 높아요.`,
  },

  configTable: {
    title: "이 매장의 모든 구성",
    titleAt: (store: string) => `${store}의 모든 구성`,
    lookupOff: (hasRows: boolean) => `Apple이 지금 이 매장의 매장 픽업 조회를 꺼 두었어요${hasRows ? "(가장 최근 응답은 아래에 있어요)" : ""}`,
    tracked: (k: number) => `확인 중인 구성 ${n(k)}개`,
    firstSweep: "첫 확인 진행 중 · 1분 안에 상태가 채워져요",
    inStock: (k: number, total: number) => `${n(total)}개 중 ${n(k)}개 재고`,
    available: "픽업 가능",
    unavailable: "재고 없음",
    noLookup: "픽업 조회 불가",
    notChecked: "아직 확인 전",
    since: (ago: ReactNode) => <>{ago}부터 재고</>,
    lastAvailable: (ago: ReactNode) => <>마지막 재고 {ago}</>,
    neverHere: "이 매장에는 아직 올라온 적 없음",
    buy: "주문",
    alertAria: (model: string, config: string, store: string) => `${store}에 ${model} ${config} 재고가 올라오면 알림 받기`,
    alert: "알림 받기 →",
  },

  matrix: {
    store: "매장",
    checked: "확인",
    cellTitle: (model: string, k: number, total: number) => `${model}: 구성 ${n(total)}개 중 ${n(k)}개 재고`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `${short} 없음`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `지금 구성 ${n(total)}개 중 ${n(k)}개 재고`,
    noneNow: (total: number) => `지금은 구성 ${n(total)}개 중 0개`,
    lookupOff: "Apple이 지금 이 매장의 픽업 조회를 꺼 두었어요",
    notChecked: "아직 확인 전",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>{ago} 확인</>,
    alert: "알림 받기 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago} 확인 · 15초 간격, 알림 매장은 5초 간격</>,
    map: "지도에서 보기",
    alert: "이 매장 지켜보기",
    alsoIn: (region: string) => `${region} 더 보기`,
    acrossLine: "경계 너머 가장 가까운 매장",
    elsewhere: "조금 더 먼 가까운 매장",
  },

  hours: {
    title: "영업시간",
    local: (zone: string) => `현지 시간 · ${zone}`,
    today: (hours: string, week: string) => ` · 오늘 ${hours} · ${week}`,
    directions: "길찾기",
    applePage: "apple.com의 이 매장",
    liveMap: "실시간 지도",
    storePage: "매장 페이지",
    closed: "휴무",
    everyDay: (hours: string) => `매일 ${hours}`,
    openNow: (closes: string) => `영업 중 · ${closes}에 닫음`,
    opensAt: (opens: string) => `${opens}에 열어요`,
    closedToday: (next: string | null) => (next ? `오늘 휴무 · ${next}에 열어요` : "오늘 휴무"),
    closedNow: (next: string | null) => (next ? `지금 영업 종료 · ${next}에 열어요` : "지금 영업 종료"),
    nextOpen: (day: string | null, time: string) => `${day ? `${day}요일` : "내일"} ${time}`,
  },

  liveStats: {
    inStock: "지금 재고",
    storesWith: "재고 있는 매장",
    lastCheck: "최근 확인",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `지금 매장 ${n(stores)}곳 중 ${n(k)}곳에 ${short} 재고`,
    lastCheck: (ago: ReactNode) => <>최근 확인 {ago}</>,
    firstSweep: "첫 확인 진행 중.",
    noneListed: (model: string, storage: string | null, color: string | null) => `지금은 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""} 재고가 있는 매장이 없어요.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago} 재고</>,
    loading: "재고 불러오는 중",
  },
};
