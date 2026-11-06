/**
 * 台灣中文：account（「我的通知」儀表板、上面的補貨模組、安裝／結帳成功／價格方案頁）。方案名稱與美元金額不翻；
 * {zone} 在中文是 Intl 的時區全名（「台北標準時間」），本身已經含「時間」，所以句子不再加。
 */
import type { Dict } from "../en";
import { n } from "./util";

export const account: Dict["account"] = {
  loading: "載入中",
  meta: { title: "我的通知" },
  signedInAs: (email: string) => `帳號：${email}`,
  title: "我的通知",
  units: { s: "秒", min: "分鐘", taps: "下" },

  plan: {
    title: "方案",
    none: "這個帳號沒有方案，通知暫停中",
    summary: (plan: string, on: number, limit: number) => `${plan} · ${limit} 則通知中 ${on} 則運作中`,
    renews: (date: string) => ` · 下次扣款 ${date}`,
    ends: (date: string) => ` · ${date} 停止`,
  },

  sent: {
    title: "已送達的通知",
    last: (ago: string) => `最近一則 ${ago}`,
    none: "還沒有送達任何通知",
    empty: "目前還沒有發出任何通知。",
    channel: { push: "推播", email: "Email" } as Record<string, string>,
    status: { sent: "已送出", failed: "失敗", skipped: "略過" } as Record<string, string>,
  },

  fast: {
    title: "20 秒完成預約",
    sub: "除了最後四下，其他全部事先做好",
    lasts: "一般 Duo 上架能撐多久",
    push: "確認補貨 → 推播到你的手機",
    tapsLeft: "推播到了之後還要點幾下",
    steps: [
      { title: "掌握你的時段", hint: "你的門市平常補貨的時段在下方 · 提前 10 分鐘就位" },
      { title: "先把 Apple 結帳頁準備好", hint: "確切容量與顏色 → 送貨與取貨" },
      { title: "先同意條款 · 或改買空機", hint: "空機一次付清，根本沒有勾選框" },
      { title: "別讓螢幕自動鎖定", hint: "自動鎖定 → 永不 · 每 10–15 分鐘碰一下" },
      { title: "通知響了：先看清楚再動手", hint: "取貨 → 通知寫的那家門市 → 第一個時段 → Apple Pay" },
    ],
    guide: "兩分鐘教學",
    window: "你的補貨時段",
  },

  restock: {
    title: "你的門市幾點補貨",
    anyIphone: "iPhone",
    and: " 和 ",
    yours: (k: number) => (k === 1 ? "你的門市" : `你的 ${k} 家門市`),
    Yours: (k: number) => (k === 1 ? "你的門市" : `你的 ${k} 家門市`),
    otherStores: (k: number) => `其他 ${k} 家門市`,
    meta: (what: string, stores: number, days: number, zone: string) => `${what} · ${stores} 家門市 · 最近 ${days} 天 · ${zone}`,
    busiest: (yours: string, then: string | null) => (then ? `${yours}的高峰時段 · 其次是 ${then}` : `${yours}的高峰時段`),
    busiestArea: (stores: number, zone: string) => `${zone}全部 ${stores} 家門市的高峰時段`,
    next: (inHours: number) => `下一個時段 · ${inHours === 0 ? "就在這個小時" : `${inHours} 小時後`}`,
    typical: "一般上架能撐多久",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}目前沒有補貨 · 最近 ${days} 天` : `${yours}的補貨 · 最近 ${days} 天${pattern ? "" : " · 資料不足以看出規律"}`),
    byHour: (busiestInGreen: boolean) => `逐小時${busiestInGreen ? " · 綠色為高峰" : ""}`,
    byWeekday: (busiest: string | null) => `逐日${busiest ? ` · 高峰在${busiest}` : ""}`,
    hourChart: (yours: string, zone: string, items: string) => `${yours}依小時的補貨（${zone}）：${items}`,
    weekdayChart: (yours: string, items: string) => `${yours}依星期的補貨：${items}`,
    chartItem: (label: string, k: number, reported: number) => `${label} ${k}${reported ? `（另有 ${reported} 次為其他追蹤網站回報）` : ""}`,
    barTitle: (label: string, k: number, yours: string, area: { n: number; zone: string } | null, reported: number) =>
      `${label}：${yours}補貨 ${n(k)} 次${area ? ` · ${area.zone}合計 ${area.n} 次` : ""}${reported ? ` · 其他追蹤網站回報 ${reported} 次` : ""}`,
    now: "現在",
    allZone: (stores: number, zone: string) => `${zone}的全部 ${stores} 家門市`,
    reportMarkBars: "虛線",
    reportMarkDots: "空心點",
    sellTitle: "你的門市補貨能撐多久",
    sellMeta: (what: string, stores: number, days: number) => `${what} · ${stores} 家門市 · 最近 ${days} 天`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "你的通知已上線",
    isOn: (plan: string) => `${plan} 已生效`,
    yourPlan: "你的方案",
    received: "付款已確認",
    onPlan: (limit: number) => `你的方案包含 ${limit} 則通知。`,
    planOn: "你的方案已生效。",
    pending: "稍等一下：訂閱很快就會出現在你的帳號裡。",
    open: "前往我的通知",
    another: "再設定一則通知",
    saved: (k: number) => `已儲存 ${k} 則通知 · 收據由 Stripe 寄出`,
    pushOn: "通知",
    pushNext: "還差一步：讓通知送到手機",
  },

  install: {
    metaTitle: "安裝 App：補貨通知直達鎖定畫面",
    metaDescription: "把 RestockWire 加入主畫面，你附近的門市一開放 iPhone Duo、18 Pro 或 Pro Max 門市取貨，通知馬上就到。",
  },

  pricing: {
    metaTitle: "價格方案：10 則通知 $5、20 則 $10、50 則 $20",
    metaDescription: "全美 Apple Store 的 iPhone 門市取貨補貨通知：你選的門市每 5 秒檢查一次，補貨確認後約 3 秒推播到手機。Plus 每月 $5 可設 10 則、Pro $10 可設 20 則、Max $20 可設 50 則，隨時可取消。",
    title: "價格方案",
    lead: "**一則通知 = 一家門市 × 一款確切的 iPhone。**網站上其他內容都可免費瀏覽。",
    chips: ["全美 269 家 Apple Store 全部涵蓋", "隨時可取消", "信用卡或 Link"],
    fastest: "沒有任何 iPhone 現貨追蹤網站公布過更短的檢查間隔",
    everyFast: "你的門市每 **5 秒**檢查一次 · 其他追蹤網站公布的間隔：8 秒到 15 分鐘",
    sellsOut: (band: string) => `**${band}**：一次 iPhone Duo 補貨通常上架這麼久；有些 20–30 秒就沒了`,
    band: (range: string) => `${range} 秒`,
    aboutMinute: "大約 1 分鐘",
    sameSpeed: "所有方案同一種速度",
    rechecked: "你的門市兩次檢查的間隔",
    toPhone: "從確認補貨到你的手機",
    listing: "一般 Duo 從上架到賣完",
    note: { plus: "1 款 iPhone × 10 家門市", pro: "2 款 iPhone × 10 家門市", max: "5 款 iPhone × 10 家門市" } as Record<string, string>,
    month: "/ 月",
    alerts: (k: number) => `${k} 則通知`,
    perks: ["你的門市每 5 秒檢查一次，全部 269 家每 15 秒一次", "補貨確認後約 3 秒推播到手機"],
    cancel: "隨時可取消",
    get: (plan: string) => `選擇 ${plan}`,
    billing: "透過 Stripe 計費 · 信用卡或 Link · 變更方案按比例計算",
    refund: "改變主意了？只要還沒有任何補貨通知送到你手上，[7 天內可全額退款](/refunds)",
  },
};
