/**
 * 한국어 문구: modules — 재입고·매장·재고 모듈(src/components/{restocks,stores,stock}).
 * `label`은 페이지가 만든 조사 없는 장소 명사구("서울", "Apple 강남", "이 매장", "국내")예요. 문장마다 조사를 붙여 써요.
 * 숫자는 날것으로 와서 num()으로 적고, 시간·날짜·비율은 이미 형식이 맞춰져 와요. 확인 주기는 15초(전체)와 5초(알림 매장)뿐이에요.
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

/** The WireNow bulletin groups its counts ("3 891"). */
const WN = (v: number) => v.toLocaleString("ko-KR");
export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${n(days)}일 기록이 비어 있어요. ${label}에서 재입고도 품절도 잡히지 않았고, 첫 변화가 잡히는 날 첫 막대가 생겨요.`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label} · ${n(days)}일 집계: 재입고 ${n(restocks)}번, 품절 ${n(soldouts)}번. 움직임이 있던 날은 ${n(activeDays)}일이에요.`,
    busiest: (day: string, restocks: number) => <> 최다 기록일: <b className="text-ink">{day}</b>, 재입고 {n(restocks)}번.</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day} — 들어옴 ${n(restocks)}, 빠짐 ${n(soldouts)}`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} | 들어옴 ${n(restocks)} | 빠짐 ${n(soldouts)}`,
    legendRestocks: "들어옴",
    legendSoldouts: "빠짐",
  },

  last24: {
    title: (label: string) => `iPhone Duo 재입고 24시간 속보 · ${label}`,
    asOf: (when: string) => `집계 시각 ${when}`,
    localTime: (when: string) => `${when}(현지)`,
    anAppleStore: "Apple Store",
    unknown: "24시간 집계를 잠시 불러오지 못했어요. 실시간 재고와 재입고 로그는 그대로 작동해요.",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}: 지난 24시간 iPhone Duo 재입고 없음</b> · 집계 {asOf}.</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">iPhone Duo 재입고 {n(o.restocks)}번 · {o.one ? o.label : `${o.label} 매장 ${n(o.withStores)}/${n(o.allStores)}곳`}</b>, 지난 24시간. 마지막으로 들어온 건 <b className="text-ink">{o.config}</b>{o.store != null && <>({o.store})</>}, 현지 {o.when}.</>
    ),
    tileRestocks: "24시간 재입고(확인 완료)",
    tileConfigsBack: "돌아온 구성 수",
    tileStores: (configs: number, allConfigs: number) => `들어온 매장 수${configs ? ` · 구성 ${n(configs)}/${n(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>방금 들어옴 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>직전 기록 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "직전 기록 없음",
    caption: (label: string, asOf: string) => `iPhone Duo 구성마다 지난 24시간 확인된 재입고 · ${label} · 집계 ${asOf}`,
    thConfig: "구성",
    thRestocks: "재입고",
    thStores: "매장",
    thLast: "마지막 입고(현지)",
    thNow: "현재 상태",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)}곳`,
    noneIn24: "24시간 동안 0번",
    yes: "있음",
    no: "없음",
    countedTitle: "무엇을 재입고로 세나",
    counted: "출처는 하나, apple.com 매장 픽업 응답을 RestockWire가 직접 읽은 값이에요. 알림이 걸린 매장은 5초, 나머지는 15초 간격으로 읽어요. 두 번 연속 같은 결과가 나와야 기록하고, 매장을 처음 읽은 순간과 외부 트래커 제보는 세지 않아요.",
    alert: (label: string | null) => `다음 재입고를 몇 초 만에 받기${label != null ? ` · ${label}` : ""}`,
  },

  clock: {
    none: (label: string, days: number) => `${label}: ${n(days)}일 동안 재입고 0번.`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}: ${n(days)}일 동안 재입고 ${n(total)}번${dates != null ? `, 날짜로는 ${n(dates)}일` : ""}. 시간대를 짚기엔 표본이 작아요.`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}에 재고가 가장 자주 들어오는 때는 현지 <b className="text-ink">{hour}</b>{day ? <>, 요일로는 <b className="text-ink">{day}</b></> : null}. 근거: {n(days)}일 동안 재입고 {n(total)}번.</>
    ),
    byHour: (zone: string) => `시각 기준 · ${zone}`,
    byWeekday: "요일 기준",
    barReported: (k: number) => ` · 외부 제보 ${n(k)}번 별도`,
    barReportedTitle: (bar: string, k: number) => `${bar} · 외부 트래커 제보 ${n(k)}번`,
    legendOurs: "RestockWire 직접 확인",
  },

  feed: {
    empty: "로그가 아직 비어 있어요.",
    available: "픽업 가능",
    soldOut: "품절",
    soldOutAt: (time: ReactNode) => <>{time}에 빠짐</>,
    since: (time: ReactNode) => <>{time}부터 남아 있음</>,
    restockedAt: (time: ReactNode) => <>{time}에 들어옴</>,
    mapAria: (store: string) => `${store} 위치를 지도에 표시`,
    map: "위치",
    buyAria: (model: string, config: string) => `${model} ${config}, apple.com 주문 페이지 열기`,
    buy: "apple.com 주문 페이지",
  },

  byConfig: {
    empty: (label: string, days: number) => `순위를 매길 재입고가 없어요. ${label}의 ${n(days)}일 기록이 0번이에요.`,
    intro: (label: string, days: number) => `가장 자주 돌아온 구성부터 · ${label} · ${n(days)}일 기록.`,
    times: (k: number) => `${n(k)}번`,
    alert: "이 구성 지켜보기",
  },

  sellout: {
    typical: (label: string, band: string) => `약 ${band}. ${label}에 들어온 iPhone Duo 재고가 품절되기까지 걸린 보통 시간이에요.`,
    half: (label: string, duration: string) => `${label} 재입고는 둘 중 하나꼴로 ${duration} 안에 동났어요.`,
    none: (label: string, days: number) => `${label}에는 ${n(days)}일 동안 '들어왔다가 다 팔린' 기록이 아직 없어요.`,
    whatDuo: "iPhone Duo",
    whatAll: "iPhone 전 모델",
    tileHalf: (what: string) => <>절반이 동나는 시간 · {what}</>,
    tileWithin30: "30초 이내 품절",
    tileWithin60: "60초 이내 품절",
    tileFastest: (k: number, days: number) => <>가장 빠른 기록 · {n(days)}일간 품절 {n(k)}건 중</>,
    caption: (days: number) => `모델마다 · ${n(days)}일 기록`,
    thIphone: "iPhone",
    thSoldOut: "품절 건수",
    thHalf: "절반 소진",
    thWithin30: "≤ 30초",
    thWithin60: "≤ 1분",
    thFastest: "가장 빠름",
    each: "한 줄 = 재입고 한 번",
    barNote: (full: string) => `막대가 길수록 오래 남은 재고 · 끝까지 차면 ${full}`,
    stillListed: (duration: string) => `판매 중 · ${duration}째`,
    approx: (range: string) => `약 ${range}`,
    measuredTitle: "품절 시간을 재는 법",
    measured: (estimated: boolean) =>
      `범위 하나가 확인 두 번 사이의 간격이에요. 예를 들어 ‘45–60초’는 45초째 확인 땐 재고가 남아 있었고 60초째 확인 땐 사라져 있었다는 뜻이에요. 간격은 알림 매장 5초, 나머지 15초예요${estimated ? ". ≈가 붙은 줄은 마지막 확인 시각을 저장하기 전에 생긴 기록이라 15초 간격으로 범위를 잡았어요" : ""}. 두 확인 사이에 잠깐 떴다 사라진 재고는 잡히지 않으니, 30초 안에 동나는 실제 비율은 표의 숫자보다 높아요.`,
  },

  configTable: {
    title: "구성별 픽업 상태",
    titleAt: (store: string) => `${store} · 구성별 픽업 상태`,
    lookupOff: (hasRows: boolean) => `현재 Apple이 이 매장의 픽업 조회를 막아 둔 상태예요${hasRows ? ". 아래는 마지막으로 받은 응답이에요" : ""}`,
    tracked: (k: number) => `추적 구성 ${n(k)}개`,
    firstSweep: "첫 확인 중 · 1분 안에 채워져요",
    inStock: (k: number, total: number) => `픽업 가능 ${n(k)}/${n(total)}`,
    available: "픽업 가능",
    unavailable: "품절 상태",
    noLookup: "조회 막힘",
    notChecked: "확인 대기",
    since: (ago: ReactNode) => <>{ago}부터 남아 있음</>,
    lastAvailable: (ago: ReactNode) => <>마지막으로 잡힌 때 {ago}</>,
    neverHere: "이 매장에서 잡힌 적 없음",
    buy: "주문",
    alertAria: (model: string, config: string, store: string) => `${model} ${config} · ${store} 재입고 알림 설정`,
    alert: "지켜보기 →",
  },

  matrix: {
    store: "매장",
    checked: "확인 시각",
    cellTitle: (model: string, k: number, total: number) => `${model} · 픽업 가능 ${n(k)}/${n(total)}`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} ${n(k)}개`,
    noDuo: (short: string) => `${short} 0개`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `현재 ${n(k)}/${n(total)} 구성 픽업 가능`,
    noneNow: (total: number) => `현재 ${n(total)}개 구성 모두 품절`,
    lookupOff: "현재 Apple이 이 매장의 픽업 조회를 막아 둔 상태예요",
    notChecked: "확인 대기",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>확인 {ago}</>,
    alert: "지켜보기 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>확인 {ago} · 알림 매장 5초, 그 밖 15초 간격</>,
    map: "지도로 위치 보기",
    alert: "이 매장 지켜보기",
    alsoIn: (region: string) => `${region}의 매장 더`,
    acrossLine: "경계 건너편에서 가장 가까운 곳",
    elsewhere: "조금 더 가면 있는 매장",
  },

  hours: {
    title: "문 여는 시간",
    local: (zone: string) => `${zone} 기준`,
    today: (hours: string, week: string) => ` · 오늘은 ${hours} · ${week}`,
    directions: "가는 길",
    applePage: "apple.com 매장 안내",
    liveMap: "라이브 재고 지도",
    storePage: "매장 상세",
    closed: "쉬는 날",
    everyDay: (hours: string) => `연중 매일 ${hours}`,
    openNow: (closes: string) => `지금 열려 있음 · ${closes}까지`,
    opensAt: (opens: string) => `${opens}에 열어요`,
    closedToday: (next: string | null) => (next ? `오늘은 쉬는 날 · ${next}에 열어요` : "오늘은 쉬는 날"),
    closedNow: (next: string | null) => (next ? `지금은 닫힘 · ${next}에 열어요` : "지금은 닫힘"),
    nextOpen: (day: string | null, time: string) => (day ? `${day}요일 ${time}` : `내일 ${time}`),
  },

  liveStats: {
    inStock: "현재 픽업 가능",
    storesWith: "픽업 가능 매장",
    lastCheck: "마지막 확인",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} 픽업 가능 매장: ${n(k)}/${n(stores)}곳`,
    lastCheck: (ago: ReactNode) => <>마지막 확인 {ago}</>,
    firstSweep: "첫 바퀴 확인이 돌고 있어요.",
    noneListed: (model: string, storage: string | null, color: string | null) => `${model}${storage ? ` ${storage}` : ""}${color ? ` ${color}` : ""}: 현재 픽업 가능한 매장 0곳.`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago}부터 남아 있음</>,
    loading: "재고 상태 가져오는 중",
  },
  /** WireNow: 지역·도시·매장·국가·Duo 모델 페이지 맨 위의 속보. `label`은 장소 이름(「서울」「Apple 가로수길」). 모든 수치는 최근 14일. */
  wireNow: {
    eyebrow: (label: string) => `속보 · ${label} iPhone Duo`,
    lastUp: (o: { config: string; store: ReactNode | null; when: string; up: string | null }) => <>마지막 재고 등록: <b className="text-ink">{o.config}</b>{o.store != null && <> · {o.store}</>}, {o.when}{o.up ? <> · {o.up}</> : null}.</>,
    neverYet: (label: string, days: number) => `${label}에서 최근 ${WN(days)}일간 확인된 iPhone Duo 재고 등록이 없어요.`,
    listed: (o: { stamp: string; k: number; n: number; label: string; list: ReactNode }) => <><b className="text-ink">지금 {WN(o.n)}곳 중 {WN(o.k)}곳에 재고 등록</b> ({o.label}, {o.stamp} 기준): {o.list}.</>,
    listedOne: (o: { stamp: string; k: number; total: number; name: string; list: ReactNode }) => <><b className="text-ink">지금 등록 중: {o.total}개 구성 중 {o.k}개</b> ({o.name}, {o.stamp} 기준): {o.list}.</>,
    nothing: (o: { stamp: string; n: number; label: string }) => <><b className="text-ink">{o.stamp} 기준 등록 없음</b>: {o.label} Apple Store {WN(o.n)}곳 어디에도 iPhone Duo 매장 픽업 재고가 없어요.</>,
    nothingOne: (o: { stamp: string; name: string }) => <><b className="text-ink">{o.stamp} 기준 등록 없음</b>: {o.name}에는 iPhone Duo 구성이 하나도 올라와 있지 않아요.</>,
    storeItem: (store: ReactNode, configs: number) => <>{store} ({configs}개 구성)</>,
    configItem: (config: string) => config,
    others: (o: { pro: number; max: number; one: boolean; configs: number }) => (o.one ? `iPhone 18 Pro는 ${o.configs}개 구성 중 ${o.pro}개, 18 Pro Max는 ${o.max}개.` : `iPhone 18 Pro는 ${o.pro}곳, 18 Pro Max는 ${o.max}곳에 있어요.`),
    tRestocks: (days: number) => `최근 ${WN(days)}일 Duo 재입고`,
    tGone60: "측정된 등록 중 1분 안에 사라진 비율",
    tLongest: "이번 주 가장 오래 버틴 등록",
    tWindow: (range: string) => `${range}에 들어온 재입고 비율`,
    tToday: "오늘 재입고 (지금까지)",
    tStores: (n: number) => `${WN(n)}곳 중 기간 내 재입고가 있던 매장`,
    wireTime: (stamp: string) => `속보 시각 ${stamp}`,
    reads: (note: string) => `읽기 주기 ${note}`,
    window: (days: number) => `${WN(days)}일 집계`,
    method: "재입고는 두 번의 읽기가 일치할 때만 세고, 매장의 첫 확인은 빼요",
    zone: () => "매장 현지 시간",
    summary: (o: { range: string; zone: string; pct: string; n: number; stores: number; label: string; days: number; busiest: string; busiestN: number; config: string | null; k: number; median: string | null; one: boolean }) =>
      `${o.label}에 iPhone Duo가 돌아오는 시간은 ${o.range}(${o.zone})이에요. 최근 ${WN(o.days)}일간 RestockWire가 ${o.one ? "이 매장" : `Apple Store ${WN(o.stores)}곳`}에서 기록한 재입고 ${WN(o.n)}건 중 ${o.pct}가 이 시간대였어요. 피크는 ${o.busiest}, ${WN(o.busiestN)}건.${o.config ? ` 가장 많이 들어온 구성은 ${o.config}(${WN(o.k)}/${WN(o.n)}건).` : ""}${o.median ? ` 등록은 중앙값 ${o.median} 만에 사라졌어요.` : ""}`,
    tooFew: (o: { n: number; label: string; days: number; one: boolean; stores: number }) => `최근 ${WN(o.days)}일간 ${o.one ? o.label : `${o.label} Apple Store ${WN(o.stores)}곳`}에서 기록한 iPhone Duo 재입고는 ${WN(o.n)}건. 보통 시간대를 말하기엔 아직 적어서 아래에 하나씩 적었어요.`,
    hourByHour: "매장별·시간대별 전체 →",
    lastThree: (n: number, label: string) => (n === 1 ? `${label} 최근 Duo 등록` : `${label} 최근 Duo 등록 ${WN(n)}건`),
    secs: (n: number) => `${WN(n)}초`,
    mins: (n: number) => `${WN(n)}분`,
    upRange: (low: string, high: string) => `${low}~${high} 유지`,
    upAbout: (x: string) => `약 ${x} 유지`,
    stillUp: (x: string) => `아직 등록 중 (${x})`,
    alerts: (o: { sent: number; stores: number; total: number; days: number; label: string; one: boolean }) => (o.one
      ? `최근 ${WN(o.days)}일간 ${o.label} Duo 재입고로 나간 알림 ${WN(o.sent)}건.`
      : `최근 ${WN(o.days)}일간 ${o.label} ${WN(o.total)}곳 중 ${WN(o.stores)}곳의 Duo 재입고로 나간 알림 ${WN(o.sent)}건.`),
    alertMe: (name: string) => `${name}을(를) 5초마다 지켜보기`,
    unknown: "이번에는 패턴 수치를 읽지 못했어요. 위의 등록 현황은 실시간이에요.",
    allModels: (o: { n: number; days: number; peak: string | null }) => `세 기종 합계: ${WN(o.days)}일간 재입고 ${WN(o.n)}건${o.peak ? `, 피크 ${o.peak}` : ""}.`,
  },
};
