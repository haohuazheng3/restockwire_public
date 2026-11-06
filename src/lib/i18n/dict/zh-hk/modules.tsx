/**
 * 繁體中文（香港）: modules — the restock, store and stock modules. `label` is a bare place noun ("香港",
 * "Apple Canton Road（廣東道）", "本店", "你的 3 間分店"); each sentence places it. Only 15 s and 5 s intervals.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CHECK, n, zhCfg } from "./common";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}過去 ${n(days)} 日未有補貨，亦未有售罄，暫時未有圖表可畫。第一次記錄出現，就會畫出第一條棒。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${label}過去 ${n(days)} 日補貨 ${n(restocks)} 次、售罄 ${n(soldouts)} 次，散落在 ${n(activeDays)} 日之中。`,
    busiest: (day: string, restocks: number) => <>最多的一日是 <b className="text-ink">{day}</b>，補貨 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${n(restocks)} 次，售罄 ${n(soldouts)} 次`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 補貨 ${n(restocks)} 次 · 售罄 ${n(soldouts)} 次`,
    legendRestocks: "補貨",
    legendSoldouts: "售罄",
  },

  last24: {
    title: (label: string) => `${label}最近 24 小時的 iPhone Duo 補貨`,
    asOf: (when: string) => `讀取時間：${when}`,
    localTime: (when: string) => `${when}（當地時間）`,
    anAppleStore: "一間 Apple Store",
    unknown: "暫時讀不到 24 小時的數字；本頁的即時現貨和補貨記錄照常運作。",
    none: (label: string, asOf: string) => <><b className="text-ink">{label}最近 24 小時 iPhone Duo 補貨 0 次</b>（讀取時間：{asOf}）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>最近 24 小時，<b className="text-ink">{o.one ? o.label : `${o.label} ${n(o.allStores)} 間 Apple Store 中有 ${n(o.withStores)} 間`}補貨 iPhone Duo 共 {n(o.restocks)} 次</b>；最新一次是 <b className="text-ink">{o.config}</b>{o.store != null && <>，在 {o.store}</>}，當地時間 {o.when}。</>
    ),
    tileRestocks: "24 小時內已確認補貨",
    tileConfigsBack: "重新上架的款式",
    tileStores: (configs: number, allConfigs: number) => `有補貨的分店${configs ? ` · ${n(allConfigs)} 款中 ${n(configs)} 款` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最新 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>再上一次 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "未有更早的記錄",
    caption: (label: string, asOf: string) => `${label}每一款 iPhone Duo：最近 24 小時已確認的補貨，讀取時間 ${asOf}`,
    thConfig: "款式",
    thRestocks: "補貨",
    thStores: "分店",
    thLast: "最新補貨（當地時間）",
    thNow: "現時上架",
    ofStores: (k: number, total: number) => `${n(total)} 間中 ${n(k)} 間`,
    noneIn24: "24 小時內無",
    yes: "有",
    no: "無",
    countedTitle: "這裏怎樣才算一次補貨",
    counted: "全部是 RestockWire 自己讀取 apple.com 店舖取貨的結果：所有分店每 15 秒一次，有提醒的分店每 5 秒一次。兩次檢查一致，補貨才會寫入記錄；第一次讀到某間分店不計；其他追蹤網站公佈的資料一律不混入。",
    alert: (label: string | null) => `${label != null ? `為${label}` : ""}設定提醒：下一次補貨幾秒內就通知你`,
  },

  clock: {
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日暫時未有補貨。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `${label}過去 ${n(days)} 日補貨 ${n(total)} 次${dates != null ? `（分佈在 ${n(dates)} 日）` : ""}：數據未夠，暫時說不出慣常鐘點。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{label}過去 {n(days)} 日補貨 {n(total)} 次。慣常在當地時間<b className="text-ink">{hour}</b>{day ? <>；<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `按鐘點 · ${zone}`,
    byWeekday: "按星期",
    barReported: (k: number) => `（另有 ${n(k)} 次由其他追蹤網站報告）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：其他追蹤網站報告 ${n(k)} 次`,
    legendOurs: "RestockWire 確認",
  },

  feed: {
    empty: "記錄暫時是空的。",
    available: "有貨",
    soldOut: "已售罄",
    soldOutAt: (time: ReactNode) => <>{time} 沽清</>,
    since: (time: ReactNode) => <>{time} 起上架</>,
    restockedAt: (time: ReactNode) => <>{time} 回補</>,
    mapAria: (store: string) => `在地圖上找${store}`,
    map: "地圖",
    buyAria: (model: string, config: string) => `在 apple.com 訂購 ${model} ${config}`,
    buy: "到 apple.com 訂購",
  },

  byConfig: {
    empty: (label: string, days: number) => `暫時未有排名：${label}過去 ${n(days)} 日沒有任何補貨。`,
    intro: (label: string, days: number) => `${label}過去 ${n(days)} 日重新上架的款式，按次數排列。`,
    times: (k: number) => `${n(k)} 次`,
    alert: "設定提醒",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}一次 iPhone Duo 補貨，一般維持約 ${band}便售罄。`,
    half: (label: string, duration: string) => `${duration}：${label}一半補貨售罄所需的時間。`,
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日未有「補貨後再售罄」的記錄。`,
    whatDuo: "iPhone Duo",
    whatAll: "所有 iPhone",
    tileHalf: (what: string) => <>一半售罄於 · {what}</>,
    tileWithin30: "30 秒內售罄",
    tileWithin60: "1 分鐘內售罄",
    tileFastest: (k: number, days: number) => <>最快 · {n(days)} 日內 {n(k)} 次售罄的補貨</>,
    caption: (days: number) => `按 iPhone 型號，過去 ${n(days)} 日`,
    thIphone: "iPhone",
    thSoldOut: "售罄",
    thHalf: "一半售罄於",
    thWithin30: "≤ 30 秒",
    thWithin60: "≤ 1 分鐘",
    thFastest: "最快",
    each: "每次補貨一行",
    barNote: (full: string) => `長條長度 = 上架秒數 · ${full} 為整行`,
    stillListed: (duration: string) => `仍在上架 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "這些時間怎樣量度",
    measured: (estimated: boolean) =>
      `某一行寫「45–60 秒內售罄」，意思是：首次見到上架後 45 秒那次檢查，該款仍然上架；60 秒那次檢查，已經不見了。區間的闊度就是兩次檢查的相隔：有提醒的分店 5 秒，其他分店 15 秒${estimated ? "；標有 ≈ 的行來自我們開始儲存最後一次檢查之前，改以 15 秒一輪為界" : ""}。比一次相隔還短的上架，可能在兩次檢查之間出現又消失，所以 30 秒內售罄的真實比例比表中更高。`,
  },

  configTable: {
    title: "本店所有款式",
    titleAt: (store: string) => `${store}所有款式`,
    lookupOff: (hasRows: boolean) => `Apple 現時關閉了這間分店的店舖取貨查詢${hasRows ? "（下面列出它最近的回應）" : ""}`,
    tracked: (k: number) => `監察中 ${n(k)} 款`,
    firstSweep: "首輪檢查進行中 · 一分鐘內顯示狀態",
    inStock: (k: number, total: number) => `${n(total)} 款中 ${n(k)} 款上架`,
    available: "有貨",
    unavailable: "沒有貨",
    noLookup: "不設取貨查詢",
    notChecked: "尚未檢查",
    since: (ago: ReactNode) => <>{ago}起上架</>,
    lastAvailable: (ago: ReactNode) => <>上次上架：{ago}</>,
    neverHere: "這裏至今未曾上架",
    buy: "訂購",
    alertAria: (model: string, config: string, store: string) => `${store}上架 ${model} ${config} 時提醒我`,
    alert: "設定提醒 →",
  },

  matrix: {
    store: "分店",
    checked: "檢查",
    cellTitle: (model: string, k: number, total: number) => `${model}：${n(total)} 款中 ${n(k)} 款上架`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `沒有 ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `現時 ${n(total)} 款中 ${n(k)} 款上架`,
    noneNow: (total: number) => `現時 ${n(total)} 款中 0 款`,
    lookupOff: "Apple 現時關閉了這間分店的取貨查詢",
    notChecked: "尚未檢查",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>{ago}讀取</>,
    alert: "設定提醒 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago}讀取 · {CHECK}</>,
    map: "在地圖上看",
    alert: "盯住這間分店",
    alsoIn: (region: string) => `${region}更多分店`,
    acrossLine: "州界另一邊最近的分店",
    elsewhere: "再遠一點最近的分店",
  },

  hours: {
    title: "營業時間",
    local: (zone: string) => `${zone}當地時間`,
    today: (hours: string, week: string) => ` · 今日 ${hours} · ${week}`,
    directions: "路線",
    applePage: "apple.com 上的這間分店",
    liveMap: "即時地圖",
    storePage: "分店頁",
    closed: "休息",
    everyDay: (hours: string) => `每日 ${hours}`,
    openNow: (closes: string) => `營業中 · ${closes} 關門`,
    opensAt: (opens: string) => `${opens} 開門`,
    closedToday: (next: string | null) => (next ? `今日休息 · ${next} 開門` : "今日休息"),
    closedNow: (next: string | null) => (next ? `現已關門 · ${next} 開門` : "現已關門"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明日"} ${time}`,
  },

  liveStats: {
    inStock: "現時上架",
    storesWith: "有貨分店",
    lastCheck: "最新檢查",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `現時 ${n(stores)} 間分店中有 ${n(k)} 間上架 ${short}`,
    lastCheck: (ago: ReactNode) => <>最新檢查 {ago}</>,
    firstSweep: "首輪檢查進行中。",
    noneListed: (model: string, storage: string | null, color: string | null) => `此刻沒有分店上架 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${zhCfg(color)}` : ""}。`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    loading: "正在載入現貨",
  },
};
