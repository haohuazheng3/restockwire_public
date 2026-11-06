/**
 * 한국어 문구: wire — 재입고 기록 모듈 네 개(RestockHeatmap, RestockStreak, SellOutRanking, RestockLeaderboard).
 * `label`은 조사 없는 장소 명사구("서울", "Apple 강남", "이 매장")라 문장마다 조사를 붙여요. `what`은 기종·구성 이름으로 번역하지 않아요.
 * 기간·시간대·요일·비율은 이미 한국어 형식으로 와요. 확인 간격은 15초(모든 매장)와 5초(알림 매장)뿐이에요.
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { iGa, eunNeun } from "./common";

const n = (x: number) => num("ko", x);
/** 영어로 오는 지역 단위("prefecture", "province")를 한국어로. */
const NOUN: Record<string, string> = { state: "주", province: "시·도", area: "지역", department: "도", prefecture: "도도부현", emirate: "토후국", canton: "칸톤", region: "지역", county: "주", city: "시" };
const noun = (w: string) => NOUN[w] ?? w;
const UNKNOWN = "지금은 읽어 오지 못했어요. 이 페이지의 실시간 재고와 재입고 기록은 영향이 없어요.";

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `${label}에서 ${eunNeun(what)} 언제 재입고되나요? 요일 × 시간`,
    unknown: `요일별·시간별 표를 ${UNKNOWN}`,
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 확인된 재입고가 아직 없어요. 첫 재입고부터 표가 채워져요.`,
    thin: (k: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `최근 ${n(days)}일 중 ${n(activeDays)}일 동안 ${label}에서 재입고 ${n(k)}회. 패턴을 말하기엔 아직 데이터가 부족해요(RestockWire는 ${n(minDays)}일에 걸친 재입고 ${n(min)}회를 기다려요).`,
    pattern: (label: string, weekday: string, window: string, share: string, k: number, days: number) => (
      <>{label}의 재입고는 대부분 <b className="text-ink">{weekday}</b> 현지 시간 <b className="text-ink">{window}</b>에 들어와요(최근 {n(days)}일 {n(k)}회 중 {share}).</>
    ),
    patternHours: (label: string, window: string, share: string, k: number, spanDays: number) => (
      <>{label}의 재입고는 대부분 현지 시간 <b className="text-ink">{window}</b>에 들어와요({n(k)}회 중 {share}). 데이터가 {n(spanDays)}일치라 요일을 말하기엔 아직 일러요.</>
    ),
    caption: (what: string, label: string, days: number) => `${label}에서 확인된 ${what} 재입고, 현지 요일·시간별, 최근 ${n(days)}일`,
    cell: (weekday: string, hours: string, k: number) => `${weekday} ${hours}: 재입고 ${n(k)}회`,
    busiest: (weekday: string, hours: string, k: number) => `가장 많음 · ${weekday} ${hours} · 재입고 ${n(k)}회`,
    legendFewer: "적음",
    legendMore: "많음",
    localTime: "매장마다 그 매장의 현지 시간",
    measuredTitle: "측정 방법",
    measured: (min: number, minDays: number, span: number) =>
      `각 칸은 기간 동안 그 요일의 그 현지 시간대에 들어온 RestockWire의 확인된 재입고(두 번의 확인이 일치, 매장을 처음 본 순간은 세지 않음)를 매장의 시간대 기준으로 센 거예요. 패턴은 서로 다른 ${n(minDays)}일에 걸친 재입고 ${n(min)}회부터, 요일은 데이터가 ${n(span)}일 이상 쌓인 뒤에만 말해요. 한 번에 몰린 재입고 10회는 습관이 아니라 한 번의 사건이니까요.`,
  },

  streak: {
    title: (what: string, label: string) => `${label}의 ${what} 재입고 연속 기록과 공백`,
    unknown: `연속 기록 수치를 ${UNKNOWN}`,
    none: (label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 확인된 재입고가 없어요. 기간 전체가 지금의 공백이에요.`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>{o.label}의 마지막 확인된 재입고: <b className="text-ink">{o.since}</b>{o.longest && <>. {n(o.days)}일 중 가장 긴 공백은 <b className="text-ink">{o.longest}</b></>}{o.trend && <>. 이번 주 재입고 <b className="text-ink">{n(o.thisWeek)}회</b>, 지난주 {n(o.lastWeek)}회({o.trend})</>}.</>
    ),
    today: "오늘",
    daysAgo: (k: number) => `${n(k)}일 전`,
    hoursAgo: (k: number) => `${n(k)}시간 전`,
    tileSince: "마지막 확인된 재입고 이후",
    tileSinceNone: (days: number) => `${n(days)}일 동안 재입고 없음`,
    tileLongest: (days: number) => `재입고 사이 가장 긴 공백 · ${n(days)}일`,
    tileWeek: (prev: number) => `최근 7일 재입고 · 그 전 주 ${n(prev)}회`,
    tileMedian: "재입고 묶음 사이의 보통 간격",
    up: "↑ 지난주보다 많음",
    down: "↓ 지난주보다 적음",
    flat: "→ 지난주와 같음",
    none2: "–",
    measuredTitle: "측정 방법",
    measured: "재입고 묶음은 여기서 세는 매장들에서 같은 30분 안에 확인된 재입고를 하나로 묶은 거예요. 구성 8개가 함께 들어오면 8번이 아니라 한 번이고, 간격은 묶음 사이로 재요. ‘이번 주’는 최근 7일, ‘지난주’는 그 전 7일이에요. 확인됐다는 건 RestockWire의 확인 두 번이 일치했다는 뜻이고(모든 매장은 15초 간격, 알림 매장은 5초 간격), 매장을 처음 본 순간은 세지 않아요.",
  },

  ranking: {
    title: (what: string, label: string) => `${label}에서 ${iGa(what)} 가장 빨리 품절되는 매장은?`,
    unknown: `품절 속도 순위를 ${UNKNOWN}`,
    thin: (label: string, k: number, min: number, days: number) =>
      `${label}에는 아직 시간을 잰 품절이 부족해요. 최근 ${n(days)}일 동안 품절된 재입고가 ${n(min)}회 이상인 매장이 ${n(k)}곳이고, 순위를 매기려면 두 곳이 필요해요.`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>{o.label}에서 가장 빠른 곳: <b className="text-ink">{o.fastest}</b>, 재입고의 절반이 <b className="text-ink">{o.fastSec}</b> 안에 사라져요. 가장 느린 곳: <b className="text-ink">{o.slowest}</b>, {o.slowSec}(최근 {n(o.days)}일).</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `${label}의 ${what} 재입고, 품절 속도순, 최근 ${n(days)}일 · 시간을 잰 품절이 ${n(min)}회 이상인 매장`,
    thRank: "#",
    thStore: "매장",
    thMedian: "절반이 사라지기까지",
    thFastest: "최단",
    thPairs: "품절된 재입고",
    footnote: (ranked: number, total: number) => `매장 ${n(total)}곳 중 ${n(ranked)}곳 순위`,
    measuredTitle: "측정 방법",
    measured: (min: number) =>
      `‘절반이 사라지기까지’는 RestockWire가 재입고를 처음 본 확인부터 사라진 걸 처음 본 확인까지 걸린 시간의 중앙값이에요. 상한값이에요. 알림 매장은 5초 간격, 그 밖의 매장은 15초 간격으로 확인하니까요. 기간 안에 품절된 재입고가 ${n(min)}회 이상인 매장만 순위에 넣어요. 확인 간격보다 짧은 재고는 놓칠 수 있어서, 아주 빠른 매장은 실제보다 조금 느려 보여요.`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `${label}에서 ${iGa(what)} 가장 많이 재입고된 매장은? 최근 ${n(days)}일`,
    unknown: `순위표를 ${UNKNOWN}`,
    none: (what: string, label: string, days: number) => `최근 ${n(days)}일 동안 ${label}에서 확인된 ${what} 재입고가 없어요.`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <>최근 {n(o.days)}일 {o.label} 1위: <b className="text-ink">{o.store}</b>, 확인된 재입고 {n(o.total)}회 중 <b className="text-ink">{n(o.n)}회</b>(<b className="text-ink">{o.share}</b>).</>
    ),
    caption: (what: string, label: string, days: number) => `${label}의 Apple Store, 확인된 ${what} 재입고순, 최근 ${n(days)}일`,
    thRank: "#",
    thStore: "매장",
    thRestocks: "재입고",
    thShare: "비율",
    footnote: (shown: number, stores: number, total: number) => `재입고가 있었던 매장 ${n(stores)}곳 중 ${n(shown)}곳 · 전체 재입고 ${n(total)}회`,
    regionsTitle: (w: string) => `${noun(w)}별`,
    regionsCaption: (what: string, label: string, days: number, w: string) => `${label}에서 확인된 ${what} 재입고, ${noun(w)}별, 최근 ${n(days)}일`,
    thRegion: (w: string) => noun(w),
    thStores: "매장",
    measuredTitle: "측정 방법",
    measured: (what: string) =>
      `최근 7일 동안 확인된 ${what} 재입고로, RestockWire가 apple.com 매장 픽업을 직접 확인한 결과예요(모든 매장은 15초 간격, 알림 매장은 5초 간격, 두 번의 확인이 일치해야 하고, 매장을 처음 본 순간은 세지 않아요). 비율은 같은 장소, 같은 기간에 확인된 전체 재입고 대비예요.`,
  },
};
