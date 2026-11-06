/**
 * 台灣中文：modules —— 補貨、門市與現貨模組。`label` 是頁面給的地點名詞（「台灣」「台北」「Apple 信義 A13」
 * 「這家店」），句子自己接上；數字到這裡是原始數字，在這裡加千分位。檢查間隔只寫 15 秒與 5 秒。
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { colorLabel } from "../../places";
import { L, n, zs } from "./util";

const CHECK = "全部門市每 15 秒，有通知的門市每 5 秒";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => zs(`${label}最近 ${days} 天沒有補貨也沒有售完，暫時畫不出圖表。第一筆紀錄出現，第一根長條就會出現。`),
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      zs(`${label}最近 ${days} 天補貨 ${n(restocks)} 次、售完 ${n(soldouts)} 次，落在 ${activeDays} 天裡。`),
    busiest: (day: string, restocks: number) => <>最熱鬧的一天是 <b className="text-ink">{day}</b>，補貨 {n(restocks)} 次。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：補貨 ${restocks} 次，售完 ${soldouts} 次`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 補貨 ${restocks} 次 · 售完 ${soldouts} 次`,
    legendRestocks: "補貨",
    legendSoldouts: "售完",
  },

  last24: {
    title: (label: string) => zs(`${label}最近 24 小時的 iPhone Duo 補貨`),
    asOf: (when: string) => `讀取時間 ${when}`,
    localTime: (when: string) => `當地時間 ${when}`,
    anAppleStore: "一家 Apple Store",
    unknown: "24 小時統計目前讀不到；本頁的即時現貨與補貨紀錄照常更新。",
    none: (label: string, asOf: string) => <><b className="text-ink">{zs(`${label}最近 24 小時 iPhone Duo 補貨 0 次`)}</b>（讀取時間 {asOf}）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>最近 24 小時，<b className="text-ink">{zs(o.one ? `${o.label}的 iPhone Duo 補貨 ${n(o.restocks)} 次` : `${o.label} ${o.allStores} 家 Apple Store 中有 ${o.withStores} 家補了 iPhone Duo，共 ${n(o.restocks)} 次`)}</b>；最新一筆是 <b className="text-ink">{o.config}</b>{o.store != null && <>，在 {o.store}</>}，當地時間 {o.when}。</>
    ),
    tileRestocks: "24 小時內確認的補貨",
    tileConfigsBack: "重新上架的規格",
    tileStores: (configs: number, allConfigs: number) => `有補貨的門市${configs ? ` · ${allConfigs} 種規格中的 ${configs} 種` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最新 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>前一筆 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "沒有更早的紀錄",
    caption: (label: string, asOf: string) => zs(`${label}每一種 iPhone Duo 規格：最近 24 小時確認的補貨，讀取時間 ${asOf}`),
    thConfig: "規格",
    thRestocks: "補貨",
    thStores: "門市",
    thLast: "最新補貨（當地時間）",
    thNow: "目前上架",
    ofStores: (k: number, total: number) => `${total} 家中 ${k} 家`,
    noneIn24: "24 小時內無",
    yes: "是",
    no: "否",
    countedTitle: "這裡怎麼算一次補貨",
    counted: "這些都是 RestockWire 自己讀取 apple.com 門市取貨的結果：全部門市每 15 秒一次，有通知的門市每 5 秒一次。兩次檢查結果一致，補貨才會寫進紀錄；第一次讀到某家門市不算；其他追蹤網站發布的資料一概不混入。",
    alert: (label: string | null) => zs(`設定${label != null ? `${label}的` : ""}通知：下一次補貨幾秒內就會通知你`),
  },

  clock: {
    none: (label: string, days: number) => zs(`${label}最近 ${days} 天目前還沒有補貨。`),
    thin: (total: number, label: string, days: number, dates: number | null) =>
      zs(`${label}最近 ${days} 天補貨 ${n(total)} 次${dates != null ? `（在 ${dates} 天裡）` : ""}：資料還不夠，說不出固定的時段。`),
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>{zs(`${label}最近 ${days} 天補貨 ${n(total)} 次。通常落在當地時間`)}<b className="text-ink">{hour}</b>{day ? <>；<b className="text-ink">{day}</b>最多</> : null}。</>
    ),
    byHour: (zone: string) => `依小時 · ${zone}`,
    byWeekday: "依星期",
    barReported: (k: number) => `（另 ${k} 次來自第三方追蹤站）`,
    barReportedTitle: (bar: string, k: number) => `${bar}：第三方追蹤站通報 ${k} 次`,
    legendOurs: "RestockWire 確認",
  },

  feed: {
    empty: "紀錄目前還是空的。",
    available: "有現貨",
    soldOut: "已售完",
    soldOutAt: (time: ReactNode) => <>{time} 賣完</>,
    since: (time: ReactNode) => <>{time} 起上架</>,
    restockedAt: (time: ReactNode) => <>{time} 回補</>,
    mapAria: (store: string) => zs(`在地圖上找${store}`),
    map: "地圖",
    buyAria: (model: string, config: string) => `到 apple.com 訂購 ${model} ${config}`,
    buy: "到 apple.com 訂購",
  },

  byConfig: {
    empty: (label: string, days: number) => zs(`還沒有排名：${label}最近 ${days} 天沒有任何補貨。`),
    intro: (label: string, days: number) => zs(`${label}最近 ${days} 天重新上架的規格，依次數排序。`),
    times: (k: number) => `${n(k)} 次`,
    alert: "設定通知",
  },

  sellout: {
    typical: (label: string, band: string) => zs(`在${label}，一次 iPhone Duo 補貨通常撐約 ${band}就賣完。`),
    half: (label: string, duration: string) => zs(`${duration}：${label}一半的補貨在這段時間內賣完。`),
    none: (label: string, days: number) => zs(`${label}最近 ${days} 天沒有「補貨後又賣完」的紀錄。`),
    whatDuo: "iPhone Duo",
    whatAll: "所有 iPhone",
    tileHalf: (what: string) => <>一半賣完於 · {what}</>,
    tileWithin30: "30 秒內賣完",
    tileWithin60: "1 分鐘內賣完",
    tileFastest: (k: number, days: number) => <>最快 · {days} 天內賣完的補貨 {n(k)} 次</>,
    caption: (days: number) => `依 iPhone 機型，最近 ${days} 天`,
    thIphone: "iPhone",
    thSoldOut: "售完",
    thHalf: "一半賣完於",
    thWithin30: "≤ 30 秒",
    thWithin60: "≤ 1 分鐘",
    thFastest: "最快",
    each: "每次補貨一列",
    barNote: (full: string) => `長條長度 = 上架秒數 · ${full}為整列`,
    stillListed: (duration: string) => `仍在架上 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "這些時間怎麼量",
    measured: (estimated: boolean) =>
      `某一列寫「45–60 秒內賣完」，意思是：第一次看到上架後 45 秒的那次檢查，這個規格還在；60 秒的那次檢查，它已經不見了。區間的寬度就是兩次檢查的間隔：有通知的門市 5 秒，其他門市 15 秒${estimated ? "；標 ≈ 的列來自我們開始儲存「最後一次檢查」之前，改以 15 秒一輪為界" : ""}。比一次間隔還短的上架，可能在兩次檢查之間出現又消失，所以 30 秒內賣完的真實比例比表上更高。`,
  },

  configTable: {
    title: "這家門市的全部規格",
    titleAt: (store: string) => zs(`${store}的全部規格`),
    lookupOff: (hasRows: boolean) => `Apple 目前關閉了這家門市的取貨查詢${hasRows ? "（下方列出它最近的回應）" : ""}`,
    tracked: (k: number) => `監看中的規格 ${k} 種`,
    firstSweep: "首輪讀取還在跑 · 一分鐘內出現狀態",
    inStock: (k: number, total: number) => `${total} 款中 ${k} 款上架`,
    available: "有現貨",
    unavailable: "無現貨",
    noLookup: "無取貨查詢",
    notChecked: "尚未檢查",
    since: (ago: ReactNode) => <>{ago}起上架</>,
    lastAvailable: (ago: ReactNode) => <>上次上架 {ago}</>,
    neverHere: "這裡目前從未上架",
    buy: "訂購",
    alertAria: (model: string, config: string, store: string) => zs(`${store}上架 ${model} ${config}時通知我`),
    alert: "設定通知 →",
  },

  matrix: {
    store: "門市",
    checked: "檢查",
    cellTitle: (model: string, k: number, total: number) => `${model}：${total} 款規格中 ${k} 款上架`,
  },

  nearby: {
    duo: (short: string, k: number) => `${short} · ${k}`,
    noDuo: (short: string) => `無 ${short}`,
  },

  stockByModel: {
    availableNow: (k: number, total: number) => `目前 ${total} 款規格中 ${k} 款上架`,
    noneNow: (total: number) => `目前 ${total} 款規格中 0 款`,
    lookupOff: "Apple 目前關閉了這家門市的取貨查詢",
    notChecked: "尚未檢查",
    more: (k: number) => `+${k}`,
    checked: (ago: ReactNode) => <>讀取於 {ago}</>,
    alert: "設定通知 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>讀取於 {ago} · {CHECK}</>,
    map: "在地圖上看",
    alert: "盯這家門市",
    alsoIn: (region: string) => zs(`${region}更多門市`),
    acrossLine: "州界另一邊最近的門市",
    elsewhere: "再遠一點最近的門市",
  },

  hours: {
    title: "營業時間",
    local: (zone: string) => `${zone}當地時間`,
    today: (hours: string, week: string) => ` · 今天 ${hours} · ${week}`,
    directions: "路線",
    applePage: "apple.com 上的這家門市",
    liveMap: "即時地圖",
    storePage: "門市頁面",
    closed: "休息",
    everyDay: (hours: string) => `每天 ${hours}`,
    openNow: (closes: string) => `營業中 · ${closes} 打烊`,
    opensAt: (opens: string) => `${opens} 開門`,
    closedToday: (next: string | null) => (next ? `今天休息 · ${next} 開門` : "今天休息"),
    closedNow: (next: string | null) => (next ? `已打烊 · ${next} 開門` : "已打烊"),
    nextOpen: (day: string | null, time: string) => `${day ?? "明天"} ${time}`,
  },

  liveStats: {
    inStock: "目前上架",
    storesWith: "有貨門市",
    lastCheck: "最新檢查",
    none: "—",
  },

  board: {
    summary: (k: number, stores: number, short: string) => `目前 ${stores} 家門市中有 ${k} 家上架 ${short}`,
    lastCheck: (ago: ReactNode) => <>最新檢查 {ago}</>,
    firstSweep: "首輪讀取還在跑。",
    noneListed: (model: string, storage: string | null, color: string | null) => `此刻沒有任何門市上架 ${model}${storage ? ` ${storage}` : ""}${color ? ` ${colorLabel(color, L)}` : ""}。`,
    more: (k: number) => `+${k}`,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    loading: "正在載入現貨",
  },
};
