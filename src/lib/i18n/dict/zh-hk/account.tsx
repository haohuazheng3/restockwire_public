/**
 * 繁體中文（香港）: account (dashboard, its restock modules, install / checkout / pricing pages). Plan names and
 * dollar amounts stay as they are: every plan is billed in US dollars.
 */
import type { Dict } from "../en";
import { SPEED } from "@/lib/plans";
import { n } from "./common";

export const account: Dict["account"] = {
  loading: "正在載入",
  meta: { title: "我的補貨提醒" },
  signedInAs: (email: string) => `帳戶：${email}`,
  title: "我的補貨提醒",
  units: { s: "秒", min: "分鐘", taps: "下" },

  plan: {
    title: "目前方案",
    none: "這個帳戶未有方案，提醒暫停中",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${n(limit)} 個提醒中 ${n(on)} 個運作中`,
    renews: (date: string) => ` · 下次收費 ${date}`,
    ends: (date: string) => ` · ${date} 停止`,
  },

  sent: {
    title: "已送達的提醒",
    last: (ago: string) => `最近一次 ${ago}`,
    none: "暫時未送達任何提醒",
    empty: "暫時未發出任何提醒。",
    channel: { push: "推送", email: "電郵" } as Record<string, string>,
    status: { sent: "已送出", failed: "送不到", skipped: "跳過" } as Record<string, string>,
  },

  fast: {
    title: "20 秒完成預約",
    sub: "除了最後四下，其餘全部預先做好",
    lasts: "一般 Duo 上架維持多久",
    push: "確認補貨 → 手機收到推送",
    tapsLeft: "推送一到，還要按幾下",
    steps: [
      { title: "掌握你的時段", hint: "你分店的慣常補貨鐘點在下面 · 提早 10 分鐘準備好" },
      { title: "預先打開 Apple 結帳", hint: "指定容量和顏色 → 送貨及提取" },
      { title: "預先同意條款 · 或買無鎖版", hint: "無鎖版一次過付清，完全沒有剔選框" },
      { title: "別讓螢幕自動上鎖", hint: "自動鎖定 → 永不 · 每 10–15 分鐘碰一下" },
      { title: "提醒一響：看清楚才出手", hint: "提取 → 提醒寫明的分店 → 第一個時段 → Apple Pay" },
    ],
    guide: "兩分鐘教學",
    window: "你分店的補貨鐘點",
  },

  restock: {
    title: "你的分店慣常幾點補貨",
    anyIphone: "iPhone",
    and: "、",
    yours: (k: number) => (k === 1 ? "你揀的分店" : `你揀的 ${n(k)} 間分店`),
    Yours: (k: number) => (k === 1 ? "你揀的分店" : `你揀的 ${n(k)} 間分店`),
    otherStores: (k: number) => `另外 ${n(k)} 間分店`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · 最近 ${n(days)} 日 · ${n(stores)} 間分店 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `最多補貨的鐘點（${yours}）· 第二位 ${then}` : `最多補貨的鐘點（${yours}）`),
    busiestArea: (stores: number, zone: string) => `最多補貨的鐘點：同時區 ${n(stores)} 間分店合計（${zone}）`,
    next: (inHours: number) => `下一個時段 · ${inHours === 0 ? "就是這一小時" : `${n(inHours)} 小時後`}`,
    typical: "一般上架維持多久",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}暫時未有補貨 · 過去 ${n(days)} 日` : `${yours}的補貨 · 過去 ${n(days)} 日${pattern ? "" : " · 數據未夠看出規律"}`),
    byHour: (busiestInGreen: boolean) => `逐小時${busiestInGreen ? " · 高峰以綠色標示" : ""}`,
    byWeekday: (busiest: string | null) => `逐日${busiest ? ` · 高峰在${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `補貨次數逐個鐘點計，${yours}，${zone}：${items}`,
    weekdayChart: (yours: string, items: string) => `補貨次數逐日計，${yours}：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${n(k)} 次${reported ? `，外部追蹤網站另報 ${n(reported)} 次` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label} · ${yours} ${n(k)} 次${area ? ` · 同時區合計 ${n(area.n)} 次（${area.zone}）` : ""}${reported ? ` · 外部追蹤網站另報 ${n(reported)} 次` : ""}`,
    now: "此刻",
    allZone: (stores: number, zone: string) => `${n(stores)} 間同時區分店（${zone}）`,
    reportMarkBars: "虛線棒",
    reportMarkDots: "空心圓點",
    sellTitle: "你分店的補貨維持多久",
    sellMeta: (what: string, stores: number, days: number) => `${what} · 最近 ${n(days)} 日 · ${n(stores)} 間分店`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "你的提醒已經上線",
    isOn: (plan: string) => `${plan} 已生效`,
    yourPlan: "目前方案",
    received: "付款已確認",
    onPlan: (limit: number) => `你的方案包括 ${n(limit)} 個提醒。`,
    planOn: "你的方案已生效。",
    pending: "請等一等：訂閱很快會出現在你的帳戶。",
    open: "前往我的提醒",
    another: "再設定一個提醒",
    saved: (k: number) => `${n(k)} 個提醒已存好 · Stripe 會把收據寄給你`,
    pushOn: "推送已開",
    pushNext: "還差一步：在手機收提醒",
  },

  install: {
    metaTitle: "安裝 App：補貨提醒直達鎖定畫面",
    metaDescription: "把 RestockWire 加至主畫面，iPhone Duo、18 Pro 或 Pro Max 一在你附近的分店開放取貨，通知即刻送到。",
  },

  pricing: {
    metaTitle: "方案價錢：$5 有 10 個提醒，$10 有 20 個，$20 有 50 個",
    metaDescription: `美國每間 Apple Store 的 iPhone 店舖取貨補貨提醒：你揀選的分店每 ${SPEED.fastSec} 秒檢查一次，確認補貨後約 ${SPEED.alertSec} 秒推送。Plus 每月 $5 有 10 個提醒、Pro $10 有 20 個、Max $20 有 50 個，以美元收費，隨時取消。`,
    title: "方案與價錢",
    lead: "**一個提醒 = 一間分店 × 一款指定 iPhone。**網站其他內容全部免費閱覽。",
    chips: ["美國全部 269 間 Apple Store", "隨時取消", "信用卡或 Link"],
    fastest: "沒有任何 iPhone 現貨追蹤器公布過更短的檢查間隔",
    everyFast: `你的分店每 **${SPEED.fastSec} 秒**檢查一次 · 其他追蹤器公布的間隔：8 秒至 15 分鐘`,
    sellsOut: (band: string) => `**${band}**：一般 iPhone Duo 補貨上架的時間；有些 20–30 秒就沒有了`,
    band: (range: string) => `${range} 秒左右`,
    aboutMinute: "一分鐘上下",
    sameSpeed: "所有方案同一速度",
    rechecked: "你的分店兩次檢查相隔",
    toPhone: "由確認補貨到你的手機",
    listing: "Duo 一般上架多久便售罄",
    note: { plus: "1 款 iPhone × 10 間分店", pro: "2 款 iPhone × 10 間分店", max: "5 款 iPhone × 10 間分店" } as Record<string, string>,
    month: "／月",
    alerts: (k: number) => `提醒 ${n(k)} 個`,
    perks: [`你的分店每 ${SPEED.fastSec} 秒檢查，全部 269 間每 ${SPEED.checkSec} 秒`, `確認補貨約 ${SPEED.alertSec} 秒後送到你的手機`] as string[],
    cancel: "想停就停",
    get: (plan: string) => `揀 ${plan}`,
    billing: "經 Stripe 收費 · 信用卡或 Link · 轉換方案按比例計算",
    refund: "改變主意？只要仍未有補貨提醒送到你手上，[7 日內可全額退款](/refunds)",
  },
};
