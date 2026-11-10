/**
 * 한국어 문구: account (대시보드, 그 안의 재입고 모듈, 설치·결제 완료·요금제 페이지). 숫자는 날것으로 와서 num()으로 적어요.
 * **굵게** / [라벨](링크)는 <Md>로 렌더링돼요. 요금제 이름과 달러 금액은 번역하지 않아요(모든 언어에서 USD 청구).
 */
import { SPEED } from "@/lib/plans";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const n = (x: number) => num("ko", x);

export const account: Dict["account"] = {
  loading: "계정 정보 여는 중",
  meta: { title: "내 알림" },
  signedInAs: (email: string) => `계정: ${email}`,
  title: "내 알림",
  units: { s: "초", min: "분", taps: "번" },

  plan: {
    title: "요금제",
    none: "이 계정에 요금제가 없어 알림이 멈춰 있어요",
    summary: (plan: string, on: number, limit: number) => `${plan} · 알림 ${n(limit)}개 중 ${n(on)}개 작동 중`,
    renews: (date: string) => ` · 다음 결제 ${date}`,
    ends: (date: string) => ` · ${date} 종료`,
  },

  sent: {
    title: "발송 내역",
    last: (ago: string) => `마지막 발송 ${ago}`,
    none: "발송 내역 없음",
    empty: "아직 나간 알림이 없어요.",
    channel: { push: "푸시", email: "메일" },
    status: { sent: "전달", delivered: "도착함", failed: "전달 실패", skipped: "보내지 않음" },
  },

  fast: {
    title: "알림부터 예약까지 20초",
    sub: "마지막 네 번의 탭만 빼고 전부 미리 해 두기",
    lasts: "Duo 재고가 남아 있는 보통 시간",
    push: "재입고 확정 → 휴대폰 푸시",
    tapsLeft: "푸시 받은 뒤 누를 횟수",
    steps: [
      { title: "내 시간대 알기", hint: "내 매장의 보통 시간대는 아래에 · 10분 전에 준비" },
      { title: "Apple 결제 화면 미리 띄우기", hint: "정확한 용량과 색상 → 배송 및 픽업" },
      { title: "약관은 미리 동의 · 아니면 자급제로", hint: "자급제를 일시불로 사면 체크박스 자체가 없어요" },
      { title: "화면 잠금 끄기", hint: "자동 잠금 → 안 함 · 10–15분마다 한 번씩 터치" },
      { title: "알림이 오면: 읽고 나서 움직이기", hint: "픽업 → 알림 속 매장 → 첫 시간대 → Apple Pay" },
    ],
    guide: "2분 안내",
    window: "내 매장이 채워지는 시간",
  },

  restock: {
    /** "Restock by restock" on the dashboard: each restock against the member's alerts (lib/alertMarks.ts). */
    mark: { delivered: "알림 도착", sent: "알림 발송됨", other: "내 알림 대상 아님", before: "알림 설정 전" },
    title: "내 매장의 재입고 시간",
    anyIphone: "iPhone",
    and: " 및 ",
    yours: (k: number) => (k === 1 ? "지켜보는 매장" : `지켜보는 매장 ${n(k)}곳`),
    Yours: (k: number) => (k === 1 ? "지켜보는 매장" : `지켜보는 매장 ${n(k)}곳`),
    otherStores: (k: number) => `그 밖의 매장 ${n(k)}곳`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${n(stores)}개 매장 · ${n(days)}일 기록 · ${zone} 기준`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}에서 가장 잦은 시간 · 2위 ${then}` : `${yours}에서 가장 잦은 시간`),
    busiestArea: (stores: number, zone: string) => `가장 잦은 시간 · ${zone}의 ${n(stores)}개 매장 합산`,
    next: (inHours: number) => `다음 시간대 · ${inHours === 0 ? "이번 시간" : `${n(inHours)}시간 뒤`}`,
    typical: "재고가 보통 떠 있는 시간",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours} 재입고 아직 없음 · 최근 ${n(days)}일` : `${yours} 재입고 · 최근 ${n(days)}일${pattern ? "" : " · 패턴을 말하기엔 부족"}`),
    byHour: (busiestInGreen: boolean) => `시간별${busiestInGreen ? " · 피크는 초록색" : ""}`,
    byWeekday: (busiest: string | null) => `요일별${busiest ? ` · 피크 ${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `시각별로 본 ${yours} 재입고(${zone}): ${items}`,
    weekdayChart: (yours: string, items: string) => `요일별로 본 ${yours} 재입고: ${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)}번${reported ? `, 외부 제보 ${n(reported)}번 별도` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label} · ${yours} ${n(k)}번${area ? ` · ${area.zone} 합산 ${n(area.n)}번` : ""}${reported ? ` · 외부 제보 ${n(reported)}번` : ""}`,
    now: "현재",
    allZone: (stores: number, zone: string) => `${zone}의 ${n(stores)}개 매장 합산`,
    reportMarkBars: "점선",
    reportMarkDots: "빈 점",
    sellTitle: "내 매장 재입고 재고는 얼마나 버티나",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${n(stores)}개 매장 · ${n(days)}일 기록`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "알림이 작동하기 시작했어요",
    isOn: (plan: string) => `${plan} 요금제가 활성화됐어요`,
    yourPlan: "가입한 요금제",
    received: "결제 확인됨",
    onPlan: (limit: number) => `내 요금제에는 알림 ${n(limit)}개가 들어 있어요.`,
    planOn: "요금제가 활성화됐어요.",
    pending: "잠시만요. 구독이 곧 계정에 표시돼요.",
    open: "내 알림으로 가기",
    another: "알림 하나 더 설정하기",
    saved: (k: number) => `알림 ${n(k)}개 저장됨 · 영수증은 Stripe가 보내요`,
    pushOn: "알림",
    pushNext: "한 단계 더: 휴대폰으로 알림 받기",
  },

  install: {
    metaTitle: "앱 받기: 잠금 화면으로 바로 오는 재입고 알림",
    metaDescription: "RestockWire를 홈 화면에 추가하면, 가까운 매장에 iPhone Duo, 18 Pro, Pro Max 픽업 재고가 올라오는 순간 알림이 와요.",
  },

  pricing: {
    metaTitle: "요금 안내 · $5에 알림 10개, $10에 20개, $20에 50개",
    metaDescription: `Apple Store 매장 픽업 iPhone 재입고 알림: 고른 매장은 ${SPEED.fastSec}초 간격으로 확인하고, 재입고가 확정되면 약 ${SPEED.alertSec}초 뒤 푸시. Plus 월 $5에 알림 10개, Pro $10에 20개, Max $20에 50개. 언제든 해지.`,
    title: "요금제",
    lead: "**알림 하나 = 매장 하나 × 정확한 iPhone 하나.** 그 밖의 사이트 내용은 모두 무료로 볼 수 있어요.",
    chips: ["국내 Apple Store 7곳 모두", "언제든 해지", "카드 또는 Link"],
    fastest: "이보다 짧은 확인 간격을 공개한 iPhone 재고 트래커는 없어요",
    everyFast: `내 매장 확인 간격 **${SPEED.fastSec}초** · 다른 트래커가 공개한 간격: 8초~15분`,
    sellsOut: (band: string) => `**${band}**: iPhone Duo 재입고 재고가 보통 떠 있는 시간이고, 20–30초 만에 사라지기도 해요`,
    band: (range: string) => `${range}초`,
    aboutMinute: "약 1분",
    sameSpeed: "요금제가 달라도 속도는 하나",
    rechecked: "내 매장 확인 간격",
    toPhone: "재입고 확정부터 휴대폰까지",
    listing: "Duo 재고가 올라와서 사라지기까지(보통)",
    note: { plus: "예: 매장 10곳 × iPhone 1대", pro: "예: 매장 10곳 × iPhone 2대", max: "예: 매장 10곳 × iPhone 5대" },
    month: "/ 월",
    alerts: (k: number) => `알림 ${n(k)}개`,
    perks: [`내 매장은 ${SPEED.fastSec}초 간격, 모든 매장은 ${SPEED.checkSec}초 간격으로 확인`, `재입고가 확정되면 약 ${SPEED.alertSec}초 뒤 휴대폰으로`],
    cancel: "해지는 아무 때나",
    get: (plan: string) => `${plan} 선택`,
    billing: "Stripe로 결제 · 카드 또는 Link · 요금제 변경은 일할 계산",
    refund: "마음이 바뀌셨나요? 재입고 알림을 한 번도 받지 않았다면 [7일 이내 전액 환불](/refunds)을 받을 수 있어요",
  },
};
