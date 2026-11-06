/**
 * 繁體中文（香港）: modules — the restock, store and stock modules. `label` is a bare place noun ("香港",
 * "Apple Canton Road（廣東道）", "本店", "你的 3 間分店"); each sentence places it. Only 15 s and 5 s intervals.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { CHECK, n, zhCfg } from "./common";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `圖表暫時空白：最近 ${n(days)} 日，${label}未錄得任何補貨或售罄。一有記錄，第一條棒便會出現。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `${n(restocks)} 次補貨、${n(soldouts)} 次售罄：${label}最近 ${n(days)} 日的紀錄，其中 ${n(activeDays)} 日有動靜。`,
    busiest: (day: string, restocks: number) => <>高峰日：<b className="text-ink">{day}</b>，一日 {n(restocks)} 次補貨。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}，${n(restocks)} 次補貨，${n(soldouts)} 次售罄`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} | 補 ${n(restocks)} | 清 ${n(soldouts)}`,
    legendRestocks: "補貨次數",
    legendSoldouts: "售罄次數",
  },

  last24: {
    title: (label: string) => `24 小時快訊：${label}的 iPhone Duo 補貨`,
    asOf: (when: string) => `數據時間 ${when}`,
    localTime: (when: string) => `當地 ${when}`,
    anAppleStore: "某間 Apple Store",
    unknown: "24 小時統計暫時缺席；即時現貨及補貨記錄不受影響。",
    none: (label: string, asOf: string) => <>數據時間 {asOf}：<b className="text-ink">24 小時內，{label}未有 iPhone Duo 補貨</b>。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <><b className="text-ink">iPhone Duo 補貨 {n(o.restocks)} 次</b>：這是 24 小時內{o.one ? o.label : `${o.label}（${n(o.withStores)}/${n(o.allStores)} 間 Apple Store）`}的數字。最新：當地 {o.when}，<b className="text-ink">{o.config}</b>{o.store != null && <>，{o.store}</>}。</>
    ),
    tileRestocks: "確認補貨（24 小時）",
    tileConfigsBack: "回到架上的配置",
    tileStores: (configs: number, allConfigs: number) => `補過貨的分店${configs ? ` · 配置 ${n(configs)}/${n(allConfigs)}` : ""}`,
    tileLatest: (config: string, store: string | null) => <>剛剛 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>更早一次 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "沒有更早的紀錄",
    caption: (label: string, asOf: string) => `24 小時內確認的 iPhone Duo 補貨，按配置列出（${label}，數據時間 ${asOf}）`,
    thConfig: "配置",
    thRestocks: "次數",
    thStores: "店數",
    thLast: "最近一次（當地）",
    thNow: "此刻在架",
    ofStores: (k: number, total: number) => `${n(k)}/${n(total)} 間`,
    noneIn24: "24 小時：0",
    yes: "在架",
    no: "—",
    countedTitle: "補貨的定義",
    counted: "數據只有一個來源：RestockWire 讀取 apple.com 店舖取貨的結果。讀取節奏是每間分店 15 秒、設有提醒的分店 5 秒。一次讀數不入帳，要連續兩次一致才記為補貨；首次讀到的分店不當補貨；外部追蹤網站的報告不計入。",
    alert: (label: string | null) => `下一次補貨，幾秒內通知你${label != null ? `（${label}）` : ""} →`,
  },

  clock: {
    none: (label: string, days: number) => `最近 ${n(days)} 日：${label}零補貨。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `最近 ${n(days)} 日，${label}只有 ${n(total)} 次補貨${dates != null ? `，落在 ${n(dates)} 個日子` : ""}。樣本太少，未定出慣常鐘點。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>慣常鐘點：當地<b className="text-ink">{hour}</b>{day ? <>，<b className="text-ink">{day}</b>最密</> : null}。根據是{label}最近 {n(days)} 日的 {n(total)} 次補貨。</>
    ),
    byHour: (zone: string) => `一日 24 個鐘點（${zone}）`,
    byWeekday: "一星期七日",
    barReported: (k: number) => `，外部網站另報 ${n(k)} 次`,
    barReportedTitle: (bar: string, k: number) => `${bar} · 外部網站報告 ${n(k)} 次`,
    legendOurs: "RestockWire 確認",
  },

  feed: {
    empty: "暫時未有快訊。",
    available: "在架",
    soldOut: "已清貨",
    soldOutAt: (time: ReactNode) => <>{time} 沽清</>,
    since: (time: ReactNode) => <>{time} 起上架</>,
    restockedAt: (time: ReactNode) => <>{time} 回補</>,
    mapAria: (store: string) => `地圖上的${store}`,
    map: "位置",
    buyAria: (model: string, config: string) => `前往 apple.com 買 ${model} ${config}`,
    buy: "去 apple.com 買",
  },

  byConfig: {
    empty: (label: string, days: number) => `排名從缺：最近 ${n(days)} 日，${label}零補貨。`,
    intro: (label: string, days: number) => `補貨次數排行榜：${label}，最近 ${n(days)} 日。`,
    times: (k: number) => `× ${n(k)}`,
    alert: "追蹤此款",
  },

  sellout: {
    typical: (label: string, band: string) => `約 ${band}：${label}的 iPhone Duo 補貨，通常撐到這裏便清。`,
    half: (label: string, duration: string) => `${label}的補貨有一半在 ${duration}以內清光。`,
    none: (label: string, days: number) => `最近 ${n(days)} 日，${label}未有一次補貨被賣光的紀錄。`,
    whatDuo: "iPhone Duo",
    whatAll: "全線 iPhone",
    tileHalf: (what: string) => <>中位售罄時間 · {what}</>,
    tileWithin30: "半分鐘內清貨",
    tileWithin60: "一分鐘內清貨",
    tileFastest: (k: number, days: number) => <>最快一次 · {n(days)} 日 {n(k)} 次清貨之中</>,
    caption: (days: number) => `最近 ${n(days)} 日，逐款 iPhone 計`,
    thIphone: "iPhone",
    thSoldOut: "清貨次數",
    thHalf: "中位時間",
    thWithin30: "30 秒或以內",
    thWithin60: "60 秒或以內",
    thFastest: "最短",
    each: "逐次列出",
    barNote: (full: string) => `棒長代表上架秒數 · 滿格 = ${full}`,
    stillListed: (duration: string) => `仍在架 · 已 ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "計時方法",
    measured: (estimated: boolean) =>
      `每個時間都是一個區間。以「45–60 秒」為例：上架後第 45 秒的讀數仍見到貨，第 60 秒的讀數已經沒有。區間寬度等於讀取節奏，設有提醒的分店 5 秒，其餘 15 秒${estimated ? "；帶 ≈ 的紀錄早於我們保存最後一次讀數的日子，一律以 15 秒一輪計" : ""}。有些上架短過一個讀取間隔，出現又消失都未被讀到，所以真正半分鐘內清貨的比例，只會比表上高。`,
  },

  configTable: {
    title: "逐款配置：本店",
    titleAt: (store: string) => `逐款配置：${store}`,
    lookupOff: (hasRows: boolean) => `這間分店的店舖取貨查詢，Apple 目前沒有開放${hasRows ? "；下表是最後一次讀到的結果" : ""}`,
    tracked: (k: number) => `${n(k)} 款在監察名單`,
    firstSweep: "第一輪讀取中 · 狀態一分鐘內出現",
    inStock: (k: number, total: number) => `上架 ${n(k)}/${n(total)} 款`,
    available: "在架",
    unavailable: "未上架",
    noLookup: "Apple 不提供查詢",
    notChecked: "未讀取",
    since: (ago: ReactNode) => <>{ago}起上架</>,
    lastAvailable: (ago: ReactNode) => <>上次上架：{ago}</>,
    neverHere: "本店從未上架過",
    buy: "去買",
    alertAria: (model: string, config: string, store: string) => `${model} ${config} 一在${store}上架就通知我`,
    alert: "追蹤 →",
  },

  matrix: {
    store: "分店名稱",
    checked: "讀取時間",
    cellTitle: (model: string, k: number, total: number) => `${model} 上架 ${n(k)}/${n(total)} 款`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${n(k)}`,
    noDuo: (short: string) => `${short} 未上架`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `此刻上架 ${n(k)}/${n(total)} 款`,
    noneNow: (total: number) => `此刻上架 0/${n(total)} 款`,
    lookupOff: "這間分店的取貨查詢，Apple 目前沒有開放",
    notChecked: "未讀取",
    more: (k: number) => `+${n(k)}`,
    checked: (ago: ReactNode) => <>{ago}讀取</>,
    alert: "追蹤 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago}讀取 · {CHECK}</>,
    map: "在地圖上看",
    alert: "盯住這間分店",
    alsoIn: (region: string) => `${region}其他分店`,
    acrossLine: "跨過州界，最近的是",
    elsewhere: "範圍以外，最近的是",
  },

  hours: {
    title: "開店時間",
    local: (zone: string) => `時間以${zone}計`,
    today: (hours: string, week: string) => ` · ${week} · 今日 ${hours}`,
    directions: "導航",
    applePage: "Apple 官網分店頁",
    liveMap: "存貨地圖",
    storePage: "本店頁面",
    closed: "不營業",
    everyDay: (hours: string) => `一星期七日 ${hours}`,
    openNow: (closes: string) => `正在營業 · ${closes} 關店`,
    opensAt: (opens: string) => `${opens} 開店`,
    closedToday: (next: string | null) => (next ? `今日不營業 · ${next} 再開` : "今日不營業"),
    closedNow: (next: string | null) => (next ? `已關店 · ${next} 再開` : "已關店"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明日"} ${time}`,
  },

  liveStats: {
    inStock: "此刻在架",
    storesWith: "有存貨的分店",
    lastCheck: "上次讀取",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `${short} 此刻在 ${n(k)}/${n(stores)} 間分店上架`,
    lastCheck: (ago: ReactNode) => <>上次讀取：{ago}</>,
    firstSweep: "第一輪讀取仍在進行。",
    noneListed: (model: string, storage: string | null, color: string | null) => `此刻沒有分店上架 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${zhCfg(color)}` : ""}。`,
    more: (k: number) => `+${n(k)}`,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    loading: "正在載入現貨",
  },
};
