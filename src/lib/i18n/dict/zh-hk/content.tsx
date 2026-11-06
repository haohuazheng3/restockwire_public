/**
 * 繁體中文（香港）: content — FAQ answers, browse rows, stat strips, product parts, sources, live widgets, the
 * enrich helpers (hours, durations, titles), live tokens, the restock-pattern sentence and photo text.
 * `where` in the FAQ is a bare place noun; counts arrive with their classifier ("31 次補貨", "2 款").
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import type { Forms } from "@/lib/i18n/format";
import { CHECK, cleanCountry, tidyAddress, tidyPhone } from "./common";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

/** "Apple ifc mall（中環） · 3 km": a nearby store and the line nearLine built ("中環｜3 km"); the place is dropped when the store's name already says it. */
function storeIn(store: string, line: string): string {
  const [place, dist] = line.split("｜");
  if (dist == null) return store.includes(place) ? store : `${store} · ${place}`;
  return store.includes(place) ? `${store} · ${dist}` : `${store} · ${place} ${dist}`;
}

export const content: Dict["content"] = {
  hours: {
    closed: "休息",
    everyDay: (hours: string) => `每日 ${hours}`,
    tomorrow: "明日",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `今日休息 · ${next} 開門`,
    closedToday: "今日休息",
    opensAt: (time: string) => `${time} 開門`,
    openNow: (closes: string) => `營業中 · ${closes} 關門`,
    closedNowOpens: (next: string) => `現已關門 · ${next} 開門`,
    closedNow: "現已關門",
  },

  duration: {
    underAMinute: "不足一分鐘",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `另外 ${k} 個`,
  nearLine: (place: string, distance: string) => `${place}｜${distance}`,

  faq: {
    where: (_kind: Kind, place: string) => place,
    nRestocks: f({ other: "# 次補貨" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${where}過去 ${days} 日補貨 0 次` : `${where}過去 ${days} 日共 ${count}（近一週 ${week} 次）`}${peak ? `，集中在當地時間${peak.hour}左右${peak.day ? `，以${peak.day}最多` : ""}` : ""}；Apple 本身不公布補貨時間表。`,
    lastsNone: (where: string) => `${where}已售罄的補貨仍不夠多，暫時計不出數字。`,
    lasts: (days: string, duration: string) => `中位數約 ${duration}：即過去 ${days} 日，補貨的款式由上架到售罄維持的時間。`,
    storeIn,
    nearestA: (stores: string) => `${stores}。`,

    modelStockQ: (model: string) => `現在哪裏有 ${model} 可供提取？`,
    modelStockNone: (model: string) => `最新一次檢查時，沒有美國 Apple Store 上架；${model} 一出現在任何分店的取貨清單，本頁便會列出第一間。`,
    nUsStores: f({ other: "# 間美國 Apple Store" }),
    modelStockSome: (count: string) => `最新一次檢查有 ${count}，每間都列在本頁並附上款式。`,
    priceQ: (model: string) => `${model} 賣幾多錢？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `無鎖版 ${low} 至 ${high}，價錢按容量（${storages}）而定，有${colors}可選。`,
    modelRestockQ: (model: string) => `${model} 多久補貨一次？`,
    modelLastsQ: (model: string) => `${model} 補貨後，可以在架上留多久？`,
    reserveQ: (model: string) => `有沒有辦法預留 ${model} 到店提取？`,
    reserveA: "不能預先留貨：分店上架你那款時，你在 apple.com 下單並選店舖提取，Apple 會在你揀選的時段為你保留。",

    storeStockQ: (store: string, model: string) => `${store}有 ${model} 現貨嗎？`,
    nConfigs: f({ other: "# 款" }),
    storeStockYes: (count: string) => `有：最新一次檢查有 ${count}，容量和顏色見本頁表格。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `沒有，最新一次檢查時沒有${other ? `；不過它上架了 ${other.pro} 款 iPhone 18 Pro 及 ${other.proMax} 款 18 Pro Max` : "，18 Pro 和 18 Pro Max 亦一款都沒有"}。`,
    hoursQ: (store: string) => `${store}幾點開門？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "營業時間見本頁表格"}${today ? `；今日 ${today.replace(/\s*\((.+)\)$/, "（$1）")}` : ""}；地址：${tidyAddress(address)}${phone ? `，電話 ${tidyPhone(phone)}` : ""}。`,
    storeRestockQ: (store: string) => `${store}多久補一次 iPhone？`,
    storeLastsQ: (store: string) => `${store}的補貨可以在架上留多久？`,
    storeNearestQ: (store: string) => `離${store}最近的 Apple Store 有哪幾間？`,

    placeStockQ: (place: string, model: string) => `${place}現在哪幾間 Apple Store 上架 ${model} 供提取？`,
    placeStockNone: (place: string, model: string) => `最新一次檢查時沒有；${place}一有分店上架 ${model}，就會出現在本頁。`,
    nStores: f({ other: "# 間分店" }),
    placeStockSome: (count: string, stores: string) => `最新一次檢查有 ${count}：${stores}。`,
    countQ: (place: string) => `${place}有幾多間 Apple Store？`,
    nAppleStores: f({ other: "# 間 Apple Store" }),
    countMany: (count: string, stores: string) => `${count}，當中包括${stores}。`,
    countOne: (count: string, store: string) => `${count}：${store}。`,
    placeRestockQ: (place: string) => `${place}多久補一次 iPhone？`,
    placeLastsQ: (place: string) => `${place}補貨後，現貨可以撐多久？`,
    placeNearestQ: (place: string) => `${place}以外，最近的 Apple Store 是哪幾間？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "美國每一間 Apple Store" : `${place}的 Apple Store`;
    return [
      "店舖取貨是一張 apple.com 訂單：結帳時揀好款式和分店，網上付款，再親身到店提取，通常即日可取。電訊商門市和店內現場的存貨是另一回事。",
      `在${at}，RestockWire 每 15 秒讀取一次每款追蹤中的配置，設了提醒的分店每 5 秒一次。變化要經第二次檢查確認才算數，所以偶發異常不會被當成補貨或售罄。`,
      "每個確認的變化都寫入記錄，本頁的補貨圖表和歷史就是由這份記錄畫出來。",
    ];
  },
  alertRule: "一個提醒 = 一間分店加一部指定手機（型號、容量、顏色）；apple.com 一轉為有貨，幾秒內便發出推送，沒有裝置開啟通知時改發電郵。",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store：${stores} 間中 ${duoNow} 間上架 iPhone Duo`,
      `${name} Apple Store：iPhone Duo 即時取貨現貨`,
      `${name} Apple Store：iPhone Duo 現貨`,
      `${name} Apple Store：iPhone 即時現貨`,
    ],
    city: (cityName: string, code: string, duoNow: string, stores: string) => [
      `${cityName}, ${code} Apple Store：${stores} 間中 ${duoNow} 間有 iPhone Duo`,
      `${cityName}, ${code} Apple Store：iPhone Duo 即時取貨`,
      `${cityName}, ${code} Apple Store：iPhone Duo 現貨`,
      `${cityName} Apple Store：iPhone 即時現貨`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone 即時現貨・補貨時段・取貨`,
        `${name}${r}：iPhone 即時現貨及補貨時段`,
        `${name}${r}：iPhone 即時現貨及營業時間`,
        `${name}：iPhone 即時現貨・補貨時段・取貨`,
        `${name}：iPhone 即時現貨及營業時間`,
        `${name}：iPhone 即時現貨`,
        `${name} 即時現貨`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name} 取貨現貨：此刻 ${storesNow} 間 Apple Store 上架`,
      `${name} 取貨現貨：${storesNow} 間 Apple Store`,
      `${name} 店舖取貨即時現貨`,
    ],
  },

  tokens: {
    tooFewToMeasure: "數據仍不足",
    noneLoggedYet: "至今未有記錄",
    noneYet: "至今未有",
  },

  pattern: {
    none: (days: string) => `過去 ${days} 日已確認的補貨 0 次。`,
    nConfirmed: f({ other: "已確認補貨 # 次" }),
    countIn: (count: string, days: string) => `過去 ${days} 日${count}`,
    stay: (minutes: string) => `；每次補貨一般在架上約 ${minutes} 分鐘`,
    nDays: f({ other: "# 日" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `（分佈在 ${onDays}）` : ""}，仍未足以看出一般時段${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `一般補貨時段：當地時間${hour}${weekday ? `，${weekday}最多` : ""}；${count}${stay}。`,
  },

  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "省" }),
    area: f({ other: "地區" }),
    department: f({ other: "省" }),
    prefecture: f({ other: "縣" }),
    emirate: f({ other: "酋長國" }),
    canton: f({ other: "州" }),
    region: f({ other: "大區" }),
    county: f({ other: "郡" }),
    city: f({ other: "縣市" }),
  } as Record<string, Forms>,

  measured: "數字怎樣量度",

  faqTitle: "問與答",
  breadcrumb: "導覽路徑",
  keepExploring: "RestockWire 更多內容",
  browse: {
    storesByState: "按州份看分店",
    allStatesCities: "每個州份及城市 →",
    liveByModel: "逐款型號的即時現貨",
    modelStock: (model: string) => `${model} 現貨`,
    thisPage: "本頁",
    restockLog: (short: string) => `${short} 補貨記錄`,
    liveMap: "即時地圖",
    mostStores: "分店數最多",
    allStates: "全部州份",
    bigCities: "主要城市",
    cities: "城市",
    storesBy: (region: string) => `按${region}看分店`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{cleanCountry(country)}每一間 Apple Store →</>,
    allRegions: (regions: string) => `全部${regions}`,
  },
  modelCards: "揀一部 iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最新補貨：{config}{at}，{ago}。</>,
    at: (store: ReactNode) => <> · {store}</>,
  },
  statStrip: {
    inStockNow: "此刻上架",
    ofStores: (k: string) => `共 ${k} 間分店`,
    stores: "分店",
    nCities: f({ other: "# 個城市" }),
    tracked: "追蹤中",
    modelNow: (short: string) => `${short} 此刻`,
    configsInStock: "款上架",
    storesWithStock: f({ other: "間分店上架" }),
    restocks24h: "補貨，24 小時",
    restocksHint: (week: string, month: string, days: string) => `7 日 ${week} 次 · ${days} 日 ${month} 次`,
    sellOuts: (days: string) => `售罄 ${days} 日`,
    stays: (duration: string) => `約撐 ${duration}`,
    noPairs: "未有可配對的售罄",
    lastRestock: "最新補貨",
    noneYet: "至今未有",
    inLastDays: (days: string) => `過去 ${days} 日`,
  },
  product: {
    chooseIphone: "揀你的 iPhone",
    storage: "容量",
    color: "顏色",
    all: "全部",
    numbersAre: (unit: ReactNode) => <>每個數字 = 此刻上架的{unit}。</>,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    last: (ago: ReactNode) => <>上次 {ago}</>,
    notSeenYet: "至今未上架",
    firstCheckPending: "首次檢查即將進行",
    inStock: "有貨",
    inStockLower: "有貨",
    none: "沒有",
    here: "就在這裏",
    notAvailable: "未上架",
    notCheckedYet: "尚未檢查",
    availableForPickup: "可供提取",
    since: (ago: ReactNode) => <> · {ago}起上架</>,
    lastInStock: (ago: ReactNode) => <>上次上架：{ago}</>,
    neverSeen: "這間分店至今未上架過",
    firstCheckSoon: "一分鐘內進行首次檢查",
    buy: "在 apple.com 訂購",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked}讀取 · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>數據：{source}</>,
  photoCredit: (link: ReactNode) => <>相片：{link}</>,
  sources: "資料來源",
  allUsStores: "美國全部 269 間 Apple Store",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire 自{since}起的即時檢查：{where} 的每一款 iPhone Duo、18 Pro 及 18 Pro Max 配置，每 15 秒讀取一次（設了提醒的分店每 5 秒）；本頁數字讀取於 {asOf}。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>即時：{stores} 間 Apple Store 中，有幾多間上架各款 {model} 供提取</>,
    storage: "容量",
    pricesCaption: (model: ReactNode) => <>{model}：apple.com 價錢（無鎖版，未連稅）對照即時取貨現貨</>,
    price: "價錢",
    bestColor: "此刻最多分店上架的顏色",
    noRestock: (model: string) => `${model} 至今未有補貨記錄。`,
    clockLabel: (model: string) => `全美國的 ${model}`,
    storesWithIt: "此刻上架的分店",
    pairsInStock: "上架中的「分店 × 款式」",
    restocksLogged: "已記錄補貨",
    medianTime: "上架時間中位數",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Store 內設有「Pickup」指示牌的木製取貨櫃檯", caption: "店舖取貨的訂單，就在這樣的櫃檯交收。" },
    "phone-map": { alt: "在戶外用手機地圖 App 導航", caption: "補貨只維持一分鐘時，距離比想像中更重要。" },
    "phone-card-payment": { alt: "女士手持 iPhone 和信用卡在網上付款", caption: "網上付款，再到店提取。" },
    "phone-on-box": { alt: "新手機放在白色包裝盒上", caption: "剛開箱的新手機。" },
    "city-map-phone": { alt: "兩個人用手機查看城市地圖", caption: "規劃前往分店的路線。" },
    "phone-notification": { alt: "手持手機，鎖定畫面顯示通知", caption: "提醒直接出現在鎖定畫面。" },
    "apple-store-crowd-inside": { alt: "商場內人頭湧湧的 Apple Store", caption: "發售週的 Apple Store 人潮：上到貨架的貨，幾分鐘內就賣光。" },
    "apple-store-glass-canopy": { alt: "夜色中玻璃幕牆配木製簷篷的 Apple Store", caption: "入夜後的玻璃外牆 Apple Store。" },
    "apple-store-night-vancouver": { alt: "溫哥華一間夜間亮燈的 Apple Store", caption: "夜晚的 Apple Store：取貨現貨任何鐘點都可能出現，但多數落在早上。" },
    "phone-hand-camera": { alt: "手持配備三鏡頭的 iPhone", caption: "大家排隊搶的，正是 Pro 型號。" },
    "place-hk-hong-kong": { alt: "隔着維多利亞港望向港島天際線及國際金融中心二期", caption: "維多利亞港與國際金融中心二期（Two IFC），香港。" },
  },
};
