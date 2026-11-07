/**
 * 한국어 문구: insight — Apple 매장 픽업 상태, 주간 재입고 리포트, 가장 빨리 팔리는 Apple Store, 매장 비교, 휴대폰 알림 가이드 3편.
 * 숫자·초·날짜·매장 이름·나라 이름은 이미 한국어 형식으로 들어와요. 여기서는 문장만 만들어요.
 * `w.in`도 한국어에서는 나라 이름 그대로라서 조사("의", "에서")는 직접 붙여요.
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { eunNeun, iGa, gwaWa, ieyo } from "./common";

export const insight: InsightDict = {
  nav: {
    status: "Apple 매장 픽업 상태",
    reports: "주간 재입고 리포트",
    fastest: "가장 빨리 팔리는 Apple Store",
    compare: "매장 대 매장",
    guides: "휴대폰 알림 가이드",
    otherCountries: "다른 나라의 같은 페이지",
    updated: (when: string) => `업데이트: ${when}`,
    sources: "출처와 집계 방법",
    cite: "이 숫자를 인용한다면 출처로 이 페이지를 링크해 주세요.",
    alertCta: "재입고 알림 받기",
    logCta: "재입고 기록 보기",
  },

  status: {
    title: (w: Where) => (w.us ? "미국 Apple Store 픽업 장애? 실시간 상태" : `${w.name} Apple Store 픽업 상태 · 실시간`),
    h1: (w: Where) => (w.us ? "지금 Apple 매장 픽업 조회가 정상인가요?" : `지금 ${w.name}에서 Apple 매장 픽업 조회가 정상인가요?`),
    meta: (v: StatusView) =>
      `실시간: 최근 1분 동안 ${v.w.name} Apple Store ${v.stores}곳 중 ${v.answered}곳의 픽업 조회에 Apple이 응답했어요. 실패율, 지난 24시간의 불안정 시간대, 조회가 멈췄을 때 할 일까지.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `정상이에요. 최근 1분 동안 ${v.w.name} Apple Store ${v.stores}곳 중 ${v.answered}곳의 픽업 조회에 Apple이 응답했고, 지난 1시간 실패한 요청은 ${v.failLastHour}예요.`
        : v.verdict === "slow"
          ? `일부만 정상이에요. 최근 1분 동안 ${v.w.name} Apple Store ${v.stores}곳 중 ${v.answered}곳만 응답했고, 지난 1시간 요청의 ${v.failLastHour}가 실패했어요. 일부 재고는 늦게 보일 수 있어요.`
          : v.verdict === "down"
            ? `지금은 아니에요. 최근 1분 동안 ${v.w.name} Apple Store ${v.stores}곳 중 ${v.answered}곳만 응답했어요. 회복될 때까지 apple.com과 이 사이트의 재고는 늦은 정보일 수 있어요.`
            : `지금은 RestockWire가 ${v.w.name}의 상태를 읽지 못하고 있어요. 1분 뒤에 새로고침해 주세요.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "정상", slow: "느림", down: "응답 없음", unknown: "알 수 없음" })[v],
    tiles: {
      answered: "최근 1분 동안 응답한 매장",
      age: "매장별 최신 확인의 중간 경과 시간",
      failHour: "실패한 요청, 최근 60분",
      failDay: "실패한 요청, 최근 24시간",
    },
    nowH2: "지금 RestockWire에는 어떻게 보이나요?",
    nowLead: (v: StatusView) =>
      `매장 ${v.stores}곳 중 ${v.answered}곳이 최근 1분 안에 응답했어요${v.age ? `. 보통 매장은 ${v.age} 전에 확인됐어요` : ""}.`,
    nowPoints: (v: StatusView) => [
      `${v.w.name}의 모든 Apple Store는 15초 간격으로, 알림이 걸린 매장은 5초 간격으로 확인해요.`,
      v.oldest ? `가장 오래 기다린 매장의 마지막 응답은 ${v.oldest} 전이에요.` : "이 구간에서는 아직 응답한 매장이 없어요.",
      Number(v.never) > 0 ? `${v.never}곳은 한 번도 응답하지 않았어요. 지금 그 매장은 Apple이 픽업 조회를 제공하지 않아요.` : "모든 매장이 한 번 이상 응답했어요.",
    ],
    dayH2: "지난 24시간은 어땠나요?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `순조로웠어요. 지난 24시간 중 실패율이 5% 이상인 시간대는 없었어요(전체 ${v.failDay}).`
        : `지난 24시간 중 실패율 5% 이상인 시간대가 ${v.roughHours}개 있었어요: ${v.roughList}. 전체 실패율은 ${v.failDay}예요.`,
    hourCaption: (zone: string) => `시간대별 요청과 실패, 최근 24시간(${zone})`,
    hourHead: ["시간", "요청", "실패", "실패율"],
    whyH2: "apple.com에서 모든 매장이 픽업 불가로 나오는 이유는?",
    whyLead: "대개는 그 구성이 품절이라서예요. 가끔은 Apple 조회 자체가 버벅여서예요.",
    whyPoints: [
      "**품절:** 조회는 정상으로 응답하고, 표시할 매장이 없을 뿐이에요. 이 페이지는 초록색 그대로예요.",
      "**조회 장애:** 모든 매장의 응답이 한꺼번에 실패하거나 비어서 와요. 1분 안에 이 페이지가 주황색이나 빨간색으로 바뀌어요.",
      "**내 브라우저:** 오래 열어 둔 apple.com 탭은 예전 응답을 붙잡고 있을 수 있어요. 믿기 전에 장바구니 페이지를 새로고침하세요.",
    ],
    doH2: "픽업 조회가 멈췄을 때는 어떻게 하나요?",
    doLead: "알림을 켜 둔 채 기다리세요. 멈춘 조회는 스스로 회복되고, 그사이 들어온 재입고도 결국 확인돼요.",
    doSteps: [
      "알림은 그대로 두세요. RestockWire가 계속 조회하다가 재입고가 확정되는 즉시 알려 드려요.",
      "apple.com을 몇 초마다 새로고침하지 마세요. Apple 조회가 빨라지지 않아요.",
      "5분 뒤에 이 페이지를 다시 보세요. 지금까지의 불안정 구간은 몇 분에서 길어야 2시간 정도였어요.",
      "초록색으로 돌아오면 내 매장 페이지를 여세요. 공백 동안 들어온 재입고가 재입고 기록에 남아 있어요.",
    ],
    methodH2: "상태는 어떻게 측정하나요?",
    methodPoints: [
      "**신선도:** 매장마다 가장 최근에 성공한 확인. RestockWire가 직접 보낸 픽업 조회 기준이에요.",
      "**실패:** 이 나라를 맡은 조회 라운드의 시간당 실패 요청. 우리 폴러의 기록이에요.",
      "**판정:** 정상 = 최근 1분 동안 매장 90%가 응답하고 실패 5% 미만, 응답 없음 = 응답 매장이 절반 미만.",
    ],
    otherH2: "다른 나라의 픽업 상태",
    faq: (v: StatusView) => [
      { q: "apple.com 매장 픽업이 지금 장애인가요?", a: v.verdict === "ok" ? `지금 ${v.w.name}에서는 아니에요. 최근 1분 동안 매장 ${v.stores}곳 중 ${v.answered}곳이 응답했어요.` : `지금 ${v.w.name}에서는 불안정해요. 최근 1분 동안 매장 ${v.stores}곳 중 ${v.answered}곳만 응답했어요.` },
      { q: "빨간색이면 iPhone이 품절이라는 뜻인가요?", a: "아니에요. 빨간색은 Apple 조회가 실패한다는 뜻이에요. 품절은 정상 응답이라 상태는 초록색으로 남아요." },
      { q: "이 페이지는 얼마나 자주 갱신되나요?", a: "열 때마다 새 숫자를 읽어요. 숫자는 길어야 30초 전 것이에요." },
      { q: "조회가 멈춘 동안 재입고를 놓치나요?", a: "늦게 볼 수는 있어요. 응답이 돌아오는 즉시 RestockWire가 재입고를 확인하고 그때 알려 드려요." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "미국 Apple Store 주간 iPhone 재입고 리포트" : `${w.name} 주간 iPhone 재입고 리포트`),
    indexH1: (w: Where) => (w.us ? "주간 iPhone 재입고 리포트" : `${w.name} 주간 iPhone 재입고 리포트`),
    indexMeta: (w: Where) => `${w.name} Apple Store의 iPhone Duo, 18 Pro, 18 Pro Max 재입고를 주 단위로: 횟수, 가장 바쁜 매장, 구성, 품절까지 걸린 시간.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `${w.name}의 첫 리포트는 한 주에 확정 재입고가 ${"20"}건 쌓이면 올라와요.` : `${w.name} 리포트 ${n}주 분량. 각 호는 현지 시간 월요일부터 일요일까지 한 주의 RestockWire 확정 재입고 기록이에요.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · 재입고 ${restocks}건${complete ? "" : " · 집계 중"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone 재입고 리포트, ${range}` : `${w.name} iPhone 재입고 리포트, ${range}`),
    h1: (w: Where, range: string) => `${w.name} iPhone 재입고, ${range} 주간`,
    meta: (v: ReportView) => `${v.range}, ${v.w.name} Apple Store ${v.stores}곳에서 확정된 iPhone 재입고 ${v.restocks}건. 가장 바쁜 매장과 요일, 구하기 어려운 구성, 품절까지 걸린 시간.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "이번 주 지금까지: "}${v.w.name} Apple Store ${v.stores}곳에서 확정 재입고 ${v.restocks}건${v.change ? `, 전주 대비 ${v.change}` : ""}.${v.topStore ? ` 1위는 ${v.topStore}(${v.topStoreN}건).` : ""}${v.medianSell ? ` iPhone Duo 재입고는 보통 ${v.medianSell} 동안 남아 있었어요.` : ""}`,
    partial: (days: number) => `이번 주 중 ${days}일치만 집계됐어요.`,
    running: "이번 주는 아직 진행 중이에요. 재입고가 확정될 때마다 숫자가 바뀌어요.",
    tiles: {
      restocks: "확정 재입고",
      stores: "재입고가 있었던 매장",
      sell: "iPhone Duo 재고 유지 시간(중간값)",
      change: "전주 대비",
    },
    countH2: "이번 주 재입고는 몇 건이었나요?",
    countLead: (v: ReportView) => `모두 ${v.restocks}건: iPhone Duo ${v.duo}건, iPhone 18 Pro ${v.pro}건, iPhone 18 Pro Max ${v.proMax}건, 구성 ${v.configs}개에 걸쳐서예요.`,
    storesH2: "재입고가 가장 많았던 Apple Store는?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, ${v.topStoreN}건이에요. 상위 10곳은 아래에 있어요.` : "이번 주에는 재입고가 있었던 매장이 없어요."),
    storesHead: ["#", "Apple Store", "재입고"],
    configsH2: "어떤 iPhone Duo 구성이 다시 들어왔나요?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `가장 많이 들어온 구성은 ${v.topConfig}(${v.topConfigN}건).${v.lastConfig && v.lastConfig !== v.topConfig ? ` 가장 적게 들어온 구성은 ${v.lastConfig}.` : ""}` : "이번 주에는 재입고된 iPhone Duo 구성이 없어요.",
    configsHead: ["구성", "재입고"],
    sellH2: "재입고는 얼마나 빨리 품절됐나요?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `iPhone Duo 재입고는 보통 ${v.medianSell} 동안 남아 있었고, ${v.within60}가 1분 안에 사라졌어요(시간을 잰 재입고 ${v.sellN}건).` : "이번 주는 시간을 잰 품절이 너무 적어서 말하기 어려워요.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `전주: ${v.prevMedianSell}.` : ""),
    daysH2: "어느 요일이 가장 바빴나요?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}, 재입고 ${v.busiestDayN}건${v.quietDay ? `. 가장 조용했던 날은 ${v.quietDay}` : ""}.` : "요일별로 나눌 재입고가 아직 없어요."),
    daysHead: ["요일", "재입고"],
    weekdays: ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"],
    prevH2: "전주와 비교하면 어떤가요?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "비교할 전주 기록이 없어요." : v.change == null ? `전주에는 ${v.prevRestocks}건이 기록됐어요. 증감은 두 주가 모두 끝나고 온전히 집계되면 표시해요.` : v.changeDir === "up" ? `더 바빴어요. ${v.restocks}건 대 전주 ${v.prevRestocks}건(${v.change}).` : v.changeDir === "down" ? `더 조용했어요. ${v.restocks}건 대 전주 ${v.prevRestocks}건(${v.change}).` : `비슷했어요. ${v.restocks}건 대 전주 ${v.prevRestocks}건.`,
    prevNote: "진행 중인 주는 일부 기간을 한 주 전체와 비교하는 셈이에요. 증감은 주가 끝난 뒤에 보세요.",
    readH2: "이번 주 흐름이 구매에 주는 의미는?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `재입고가 ${v.busiestDay}에 몰렸어요. 그날은 하루 종일 알림을 켜 두세요.` : "매일 알림을 켜 두세요. 재입고에는 정해진 일정이 없어요.",
      v.medianSell ? `재고가 보통 ${v.medianSell}만 남아 있으니, 알림이 오면 몇 초 안에 예약을 시작해야 해요.` : "재고는 금방 사라져요. 알림이 오면 몇 초 안에 움직이세요.",
      v.topStore ? `재입고가 가장 많았던 곳은 ${v.topStore}. 가깝다면 알림에 넣으세요.` : "갈 수 있는 매장을 지켜보세요. 가까운 매장을 하나 더 넣으면 기회가 두 배예요.",
    ],
    methodH2: "리포트는 어떻게 집계하나요?",
    methodPoints: [
      "**재입고:** 한 매장에서 어떤 구성이 픽업 불가에서 가능으로 바뀌고, 두 번째 확인으로 확정된 것. 처음 발견된 재고는 세지 않아요.",
      "**주:** 그 나라 기준 시간대로 월요일 00:00부터 일요일 24:00까지.",
      "**재고 유지 시간:** 확정된 재입고부터 같은 매장·같은 구성이 다음에 품절로 확정될 때까지.",
    ],
    archiveH2: "다른 주",
    faq: (v: ReportView) => [
      { q: `이번 주 ${v.w.name}에서 Apple이 iPhone을 몇 대 재입고했나요?`, a: `RestockWire는 매장 ${v.stores}곳에서 재입고 ${v.restocks}건을 확정했어요. 1건은 한 매장에 한 구성이 다시 들어온 것이고, 대수가 아니에요.` },
      { q: "Apple이 재입고 수량을 공개하나요?", a: "아니요. 이 숫자는 RestockWire가 Apple 픽업 재고를 직접 관찰해 확정한 기록이에요." },
      { q: "새 리포트는 언제 올라오나요?", a: "매주 월요일에 새 주가 시작돼요. 재입고가 확정될 때마다 채워지고 일요일 밤에 마감돼요." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "iPhone Duo 가장 빨리 팔리는 Apple Store" : `${w.name}에서 가장 빨리 팔리는 Apple Store`),
    h1: (w: Where) => `${w.name}에서 iPhone Duo가 가장 빨리 품절되는 Apple Store는?`,
    meta: (v: RankView) => `${v.w.name}에서 가장 빠른 곳은 ${v.fastest ?? "가장 빠른 매장"}: iPhone Duo 재입고가 중간값 ${v.fastestSec ?? "몇 초"} 만에 사라져요. 최근 ${v.days}일 매장 순위와 아직 기회가 있는 곳.`,
    answer: (v: RankView) =>
      v.fastest
        ? `가장 빠른 곳은 ${v.fastest}. iPhone Duo 재입고가 보통 ${v.fastestSec} 만에 품절됐어요(시간을 잰 재입고 ${v.fastestN}건, 최근 ${v.days}일).${v.slowest ? ` ${v.slowest}에서는 ${v.slowestSec} 동안 남아 있었어요.` : ""}`
        : `최근 ${v.days}일 ${v.w.name}에서는 시간을 잰 품절이 너무 적어 아직 순위를 매길 수 없어요.`,
    tiles: { fastest: "가장 빠른 매장, 유지 시간 중간값", slowest: "순위 안 가장 느린 매장", ranked: "순위에 오른 매장", country: "전국 중간값" },
    fastH2: "가장 빠른 매장",
    fastLead: (v: RankView) => `최근 ${v.days}일 동안 시간을 잰 재입고가 ${v.minPairs}건 이상인 매장은 ${v.ranked}곳이에요. 중간값이 짧은 순서예요.`,
    head: ["#", "Apple Store", "유지 시간 중간값", "최단", "시간을 잰 재입고", "재입고"],
    slowH2: "아직 기회가 있는 곳은?",
    slowLead: (v: RankView) => (v.slowest ? `표의 맨 아래, ${eunNeun(v.slowest)} 재입고가 보통 ${v.slowestSec} 동안 남아 있었어요. 오래 남을수록 결제할 시간이 생겨요.` : "아직 데이터가 부족해요."),
    meansH2: "빠른 매장이라는 건 무슨 뜻인가요?",
    meansPoints: (v: RankView) => [
      `중간값이 ${v.fastestSec ?? "몇 초"}라면 둘러볼 시간이 없어요. 구성을 장바구니에 담아 두고 Apple Pay를 준비하세요.`,
      "가까운 느린 매장을 알림에 하나 더 넣으세요. 매장 두 곳이면 기회도 두 배예요.",
      "속도는 그 매장 주변의 수요를 보여 줘요. 들어오는 재고량이 아니에요.",
    ],
    methodH2: "순위는 어떻게 만드나요?",
    methodPoints: (v: RankView) => [
      `**재고 유지 시간:** 확정된 재입고부터 같은 매장·같은 구성이 다음에 품절로 확정될 때까지. iPhone Duo만, 최근 ${v.days}일.`,
      `**순위 대상:** 시간을 잰 재입고 ${v.minPairs}건 이상. 그보다 적으면 운 좋은 재입고 한 번이 순위를 정해 버려요.`,
      "**오차 범위:** 시간은 다음 확인까지의 상한값이에요(확인 간격 5초~15초).",
    ],
    faq: (v: RankView) => [
      { q: `${v.w.name}에서 iPhone Duo를 사기 가장 어려운 Apple Store는?`, a: v.fastest ? `${v.fastest}. 재입고가 가장 빨리 품절됐어요. 중간값 ${v.fastestSec}.` : "아직 말할 만큼 데이터가 없어요." },
      { q: "빨리 품절되면 들어오는 수량이 적다는 뜻인가요?", a: "꼭 그렇지는 않아요. 대개는 그 매장을 기다리는 사람이 더 많다는 뜻이에요." },
      { q: "순위는 얼마나 자주 갱신되나요?", a: "몇 분마다, 최근 14일 기준으로요." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store 비교: iPhone 재입고" : `${w.name} Apple Store 비교: iPhone 재입고`),
    indexH1: (w: Where) => `${w.name}, 같은 도시의 Apple Store 두 곳 중 재입고가 많은 곳은?`,
    indexMeta: (w: Where) => `${w.name}의 이웃한 Apple Store를 나란히: 최근 14일 iPhone 재입고, 주로 들어오는 시간, 재고 유지 시간, 지켜볼 매장.`,
    indexLead: (n: string) => `비교 ${n}건. 매장마다 같은 도시에서 가장 가까운 매장과 짝지었어요.`,
    title: (a: string, b: string) => `${a} vs ${b}: 재입고가 많은 곳은?`,
    h1: (a: string, b: string) => `${gwaWa(a)} ${b}, iPhone 재입고가 더 많은 곳은?`,
    meta: (v: CompareView) => `${v.city}에서 ${v.distance} 떨어진 ${gwaWa(v.a.name)} ${v.b.name}: 최근 ${v.days}일 iPhone 재입고, 주로 들어오는 시간, 재고 유지 시간, 지켜볼 매장.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${gwaWa(v.a.name)} ${v.b.name}의 재입고 횟수는 같았어요` : `재입고가 더 많았던 곳은 ${(v.more === "a" ? v.a : v.b).name}`;
      const nums = `(최근 ${v.days}일 ${v.a.restocks}건 대 ${v.b.restocks}건)`;
      const slow = v.slower ? ` 재고가 더 오래 남은 곳은 ${ieyo((v.slower === "a" ? v.a : v.b).name)}. 그만큼 결제할 시간이 더 있어요.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `나란히 비교, 최근 ${days}일`,
    rows: { restocks: "전체 재입고", duo: "iPhone Duo 재입고", peak: "주로 들어오는 시간(현지)", sell: "iPhone Duo 유지 시간 중간값", sellN: "시간을 잰 재입고", last: "최근 재입고" },
    none: "데이터 부족",
    moreH2: "iPhone 재입고가 더 많은 매장은?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `같아요. 둘 다 ${v.a.restocks}건이에요.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, ${v.ratio} 많아요` : ""}.`),
    hourH2: "각 매장은 몇 시에 재입고되나요?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${eunNeun(v.a.name)} 주로 ${v.a.peak} 무렵, ${eunNeun(v.b.name)} ${v.b.peak} 무렵이에요.` : "둘 중 한 곳은 재입고가 너무 적어 아직 주된 시간을 말할 수 없어요.",
    sellH2: "재입고가 더 오래 남는 곳은?",
    sellLead: (v: CompareView) =>
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} 대 ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "아직 뚜렷한 차이가 없어요. 품절 측정이 너무 적거나, 두 매장의 중앙값 차이가 15% 이내예요.",
    pickH2: "어느 매장을 지켜봐야 하나요?",
    pickPoints: (v: CompareView) => [
      `둘 다요. 두 매장은 ${v.distance} 거리이고, 요금제 하나로 여러 매장을 지켜볼 수 있어요.`,
      v.more !== "tie" ? `한 곳만 갈 수 있다면 재입고가 더 잦았던 ${(v.more === "a" ? v.a : v.b).name}.` : "한 곳만 갈 수 있다면 더 가까운 곳을 고르세요. 재입고 횟수는 같아요.",
      v.slower ? `${iGa((v.slower === "a" ? v.a : v.b).name)} 재입고마다 몇 초를 더 줘요.` : "재고 유지 시간으로는 아직 확실한 승자가 없어요.",
    ],
    methodH2: "이 숫자는 어디서 나오나요?",
    methodPoints: (v: CompareView) => [
      `최근 ${v.days}일 두 매장에서 RestockWire가 확정한 재입고. 두 번째 확인으로 확정돼야 1건으로 세요.`,
      "주로 들어오는 시간은 3일 이상에 걸친 재입고 5건이 쌓여야 표시해요.",
      "재고 유지 시간은 다음 확인까지의 상한값이고, iPhone Duo만 집계해요.",
    ],
    storePages: "매장 페이지",
    otherPairs: "다른 비교",
    faq: (v: CompareView) => [
      { q: `iPhone Duo 픽업에는 ${gwaWa(v.a.name)} ${v.b.name} 중 어디가 나은가요?`, a: v.more === "tie" ? "최근 14일 재입고 횟수가 같았어요. 더 가까운 곳을 고르거나 둘 다 지켜보세요." : `최근 14일 재입고가 더 잦았던 곳은 ${ieyo((v.more === "a" ? v.a : v.b).name)}.` },
      { q: "두 매장을 모두 지켜볼 수 있나요?", a: "네, 알림 2개로요. 알림 1개는 매장 1곳 × 구성 1개라서, 두 매장이면 요금제 알림 2개를 써요." },
      { q: "두 매장은 같은 시간에 재입고되나요?", a: "보통은 아니에요. 매장마다 입고가 따로 와요. 위의 주된 시간을 비교해 보세요." },
    ],
  },

  /**
   * 휴대폰 가이드 3편. 사실관계는 영어판과 같아요(Apple 지원 문서, WebKit, Google 출처).
   * 설정 경로는 한국어 iOS·Android 메뉴 이름으로, 확실하지 않은 이름은 영어 이름을 괄호로 한 번 덧붙였어요.
   */
  guides: {
    watch: {
      title: "Apple Watch로 iPhone 재입고 알림 받기",
      h1: "Apple Watch에서 iPhone 재입고 알림을 받으려면?",
      meta: "RestockWire 재입고 알림을 손목으로: 홈 화면 앱, 알림 켜기, Watch 앱의 미러링, 그리고 알림이 iPhone으로 가는 경우까지.",
      answer: (live: string | null) =>
        `iPhone 홈 화면에 RestockWire를 추가하고 알림을 켠 뒤, Watch 앱에서 미러링을 켜 두세요. 그러면 iPhone이 잠겨 있을 때마다 알림이 Apple Watch로 와요.${live ? ` 재입고가 중간값 ${live}만 남아 있으니, 손목의 진동이 휴대폰을 찾는 몇 초를 아껴 줘요.` : ""}`,
      sections: [
        {
          h2: "먼저 무엇이 필요한가요?",
          lead: "iOS 16.4 이상 iPhone, 홈 화면에 추가한 RestockWire, 그리고 허용한 알림이에요.",
          points: [
            "Safari에서 restockwire.com을 열고 공유 버튼을 탭한 뒤 '홈 화면에 추가'를 탭하세요.",
            "홈 화면에서 RestockWire를 열고 로그인한 뒤 알림 켜기를 탭하세요.",
            "권한 요청을 허용하세요. 이후 웹 앱 알림도 다른 앱처럼 잠금 화면과 알림 센터에 떠요.",
          ],
        },
        {
          h2: "알림은 어떻게 워치로 가나요?",
          lead: "미러링으로요. Apple은 알림을 한 기기에만 보내고, iPhone이 잠겨 있거나 잠자기 상태면 워치로 보내요.",
          points: [
            "iPhone 잠금이 풀려 있고 사용 중이면 알림은 워치가 아니라 iPhone에 떠요.",
            "iPhone이 잠겨 있거나 잠자기 상태이고 워치가 손목에서 잠금 해제돼 있으면 워치로 가요.",
            "워치가 잠겨 있거나 방해금지 모드이면 대신 iPhone으로 가요.",
          ],
        },
        {
          h2: "Watch 설정은 무엇을 확인하나요?",
          lead: "두 가지예요. RestockWire 미러링, 그리고 손목을 내린 상태에서도 알림을 보여 줄지.",
          points: [
            "iPhone에서 Watch 앱을 열고 '알림'을 탭한 뒤 'iPhone 알림 미러링'(Mirror iPhone Alerts From) 목록을 보세요. RestockWire가 있으면 켜 두세요.",
            "알림은 손목을 들면 보여요. 들지 않고도 보려면 '손목을 내린 상태에서 알림 보기'(Show Notifications on Wrist Down)를 켜세요.",
            "저전력 모드에서는 상시표시형 디스플레이가 꺼져서, 알림을 읽으려면 손목을 들어야 할 수 있어요.",
          ],
        },
        {
          h2: "손목에 알림이 오면 무엇을 하나요?",
          lead: "몇 초 안에 iPhone에서 움직이세요. 예약은 apple.com에서 해요.",
          points: [
            "워치에서 매장과 구성을 확인하고 iPhone 잠금을 해제하세요.",
            "iPhone에서 알림을 탭하면 매장 페이지와 Apple 링크가 열려요.",
            "apple.com에 Apple Pay를 미리 설정해 두면 결제가 몇 번의 탭으로 끝나요.",
          ],
        },
      ],
      faq: [
        { q: "RestockWire 알림이 Apple Watch에서도 되나요?", a: "네. 홈 화면 웹 앱의 알림도 다른 앱처럼 페어링된 Apple Watch에 떠요." },
        { q: "왜 알림이 워치가 아니라 iPhone에 떴나요?", a: "iPhone 잠금이 풀려 있었거나, 워치가 잠겨 있거나 방해금지 모드였기 때문이에요. 그럴 때 Apple은 iPhone으로 보내요." },
        { q: "워치용 앱을 따로 설치해야 하나요?", a: "아니요. 워치는 iPhone이 받은 알림을 보여 줄 뿐이라 워치에 설치할 건 없어요." },
      ],
      sources: [
        { label: "WebKit: iOS·iPadOS 웹 앱의 웹 푸시", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple 지원: Apple Watch의 알림", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch 사용 설명서: 알림 관리하기", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "집중 모드에서도 재입고 알림 놓치지 않기",
      h1: "집중 모드와 시간 지정 요약 중에도 재입고 알림을 받으려면?",
      meta: "집중 모드에서 RestockWire 알림을 허용하고, 시간 지정 요약에서 빼고, 잠금 화면에 소리와 함께 뜨게 하는 방법. iOS 16.4 이상, 단계별로.",
      answer: (live: string | null) =>
        `집중 모드마다 허용된 앱에 RestockWire를 넣고 알림 전달을 '즉시 전달'로 바꾸세요. 그러면 집중 모드 중에도 재입고 알림이 울려요.${live ? ` 재입고는 중간값 ${live}만 남아 있어서, 요약으로 미뤄진 알림은 이미 늦은 알림이에요.` : ""}`,
      sections: [
        {
          h2: "집중 모드에서 RestockWire를 허용하려면?",
          lead: "설정 > 집중 모드에서 해당 집중 모드를 고르고, 앱을 탭한 뒤 알림 허용 목록(Allow Notifications From)에 RestockWire를 추가하세요.",
          points: [
            "Apple은 홈 화면에 추가한 웹 앱을 집중 모드에서 따로 허용하거나 끌 수 있게 해요.",
            "쓰는 집중 모드마다 반복하세요. 수면, 업무, 개인, 직접 만든 모드까지.",
            "같은 이름의 웹 앱에 대한 집중 모드 설정은 다른 Apple 기기와 동기화돼요.",
          ],
        },
        {
          h2: "시간 지정 요약에서 알림을 빼려면?",
          lead: "요약 목록에서 RestockWire를 체크하지 않거나, 전달 방식을 즉시로 바꾸세요.",
          points: [
            "설정 > 알림 > 시간 지정 요약: 가나다(A–Z) 목록이 요약으로 모을 앱을 정해요.",
            "또는 설정 > 알림 > RestockWire > 알림 전달 > 즉시 전달.",
            "오전 8시 요약으로 미뤄진 재입고는 그때쯤 이미 품절이에요.",
          ],
        },
        {
          h2: "가장 중요한 알림 설정은?",
          lead: "알림 허용 켬, 잠금 화면과 배너 켬, 사운드 켬.",
          points: [
            "배너 스타일을 '지속적'으로 하면 처리할 때까지 알림이 화면에 남아요.",
            "미리보기 표시가 '잠금 해제 시'면 잠긴 화면에서 매장과 구성이 가려져요. 한눈에 보려면 '항상'을 고르세요.",
            "Apple은 웹 앱 알림에 '시간 민감' 단계를 문서화하지 않았어요. 집중 모드를 뚫는 데 그것을 기대하지 말고, 허용 목록을 쓰세요.",
          ],
        },
        {
          h2: "제대로 되는지 확인하려면?",
          lead: "집중 모드를 켠 상태에서 RestockWire 계정에서 테스트 알림을 보내 보세요.",
          points: [
            "홈 화면에서 RestockWire를 열고 계정으로 가서 테스트 알림 보내기를 탭하세요.",
            "가장 자주 쓰는 집중 모드를 켜고 한 번 더 보내세요.",
            "소리 없이 오거나 아예 안 오면 집중 모드 허용 목록과 전달 설정을 다시 확인하세요.",
          ],
        },
      ],
      faq: [
        { q: "집중 모드가 RestockWire 알림을 막나요?", a: "네, 그 집중 모드의 허용 목록에 RestockWire가 없다면요. 집중 모드마다 한 번씩 추가하세요." },
        { q: "RestockWire가 시간 민감 알림을 보낼 수 있나요?", a: "Apple은 웹 앱 푸시에 그런 단계를 문서화하지 않았어요. 그래서 RestockWire는 집중 모드 허용 목록을 써요." },
        { q: "왜 알림이 아침에 한꺼번에 오나요?", a: "시간 지정 요약이 붙잡고 있어서예요. RestockWire를 즉시 전달로 바꾸세요." },
      ],
      sources: [
        { label: "iPhone 사용 설명서: 집중 모드에서 알림 허용 또는 차단하기", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone 사용 설명서: 알림 설정 변경하기", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: iOS·iPadOS 웹 앱의 웹 푸시", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "Android·Wear OS로 iPhone 재입고 알림 받기",
      h1: "Android 휴대폰이나 Wear OS 워치로 iPhone 재입고 알림을 받을 수 있나요?",
      meta: "Android 휴대폰으로 iPhone을 노린다면: RestockWire 알림은 설치 없이 Chrome에서 되고, 페어링된 Wear OS나 Galaxy Watch로도 와요.",
      answer: (live: string | null) =>
        `네. Android의 Chrome에서 RestockWire를 열고 로그인한 뒤, Chrome이 물으면 알림을 허용하세요. 알림이 다른 앱처럼 오고, 페어링된 워치로도 넘어가요.${live ? ` 재고는 중간값 ${live}만 남아 있으니 알림 소리는 크게 두세요.` : ""}`,
      sections: [
        {
          h2: "Chrome에서 알림을 켜려면?",
          lead: "Chrome으로 restockwire.com에 로그인하고, 사이트가 알림을 보내도 되는지 물으면 '허용'을 탭하세요.",
          points: [
            "설치할 건 없어요. 사이트가 알림을 보내려 하면 Chrome이 권한을 물어요.",
            "예전에 '차단'을 눌렀다면 주소창에서 사이트 설정을 열고 알림을 허용하세요.",
            "Android에서는 홈 화면 추가가 선택이에요. 추가하면 사이트에 아이콘이 생겨요.",
          ],
        },
        {
          h2: "Wear OS나 Galaxy Watch로도 오나요?",
          lead: "대개는요. 휴대폰 알림은 기본으로 페어링된 Wear OS 워치에 넘어가요.",
          points: [
            "RestockWire 알림은 Chrome이 띄우기 때문에 워치에서는 Chrome 알림으로 보여요.",
            "Galaxy Watch는 Galaxy Wearable > 워치 설정 > 알림 > 앱 알림에서 Chrome을 켜 두세요.",
            "알림이 끊기면 배터리 절약 설정이 Chrome의 백그라운드 동작을 제한하지 않는지 확인하세요.",
          ],
        },
        {
          h2: "노트북은요?",
          lead: "컴퓨터의 Chrome, Edge, Firefox도 브라우저가 켜져 있는 동안 같은 알림을 보여 줘요.",
          points: [
            "가장 오래 켜 두는 브라우저에서 로그인하고 알림을 허용하세요.",
            "알림을 켠 기기마다 모든 알림을 받아요.",
            "알림을 켠 기기가 하나도 없으면 RestockWire가 대신 이메일로 보내요.",
          ],
        },
      ],
      faq: [
        { q: "RestockWire를 쓰려면 iPhone이 있어야 하나요?", a: "아니요. 웹 알림을 지원하는 브라우저가 있는 휴대폰이나 컴퓨터라면 알림을 받을 수 있어요." },
        { q: "왜 워치에 알림이 Chrome으로 표시되나요?", a: "Android에서는 Chrome이 웹사이트 알림을 전달하기 때문에 워치에도 Chrome 아래에 표시돼요." },
        { q: "휴대폰 두 대로 알림을 받을 수 있나요?", a: "네. 두 기기에서 각각 로그인하고 알림을 허용하세요. 모든 기기가 모든 알림을 받아요." },
      ],
      sources: [
        { label: "Google Chrome 고객센터: 알림 사용하기", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: Wear OS의 알림", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: Galaxy Watch 알림 관리", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "다른 휴대폰 알림 가이드",
  },
};
