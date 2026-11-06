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
    closed: "不營業",
    everyDay: (hours: string) => `一星期七日 ${hours}`,
    tomorrow: "明日",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `今日不營業 · ${next} 再開`,
    closedToday: "今日不營業",
    opensAt: (time: string) => `${time} 開店`,
    openNow: (closes: string) => `正在營業 · ${closes} 關店`,
    closedNowOpens: (next: string) => `已關店 · ${next} 再開`,
    closedNow: "已關店",
  },

  duration: {
    underAMinute: "一分鐘以內",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `另外 ${k} 個`,
  nearLine: (place: string, distance: string) => `${place}｜${distance}`,

  faq: {
    where: (_kind: Kind, place: string) => place,
    nRestocks: f({ other: "# 次補貨" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `最近 ${days} 日，${where}未錄得補貨` : `最近 ${days} 日，${where}錄得 ${count}，其中近 7 日 ${week} 次`}${peak ? `；多數落在當地${peak.hour}前後${peak.day ? `，${peak.day}最密` : ""}` : ""}。Apple 從不公開補貨時間表。`,
    lastsNone: (where: string) => `${where}賣光過的補貨太少，暫時未能計算。`,
    lasts: (days: string, duration: string) => `${duration}左右（中位數）。這是最近 ${days} 日，一款貨由上架到賣光所需的時間。`,
    storeIn,
    nearestA: (stores: string) => `${stores}。`,

    modelStockQ: (model: string) => `${model} 此刻在哪裏可以到店提取？`,
    modelStockNone: (model: string) => `一間都沒有：上一輪檢查，美國的 Apple Store 全部未上架。${model} 一在任何分店的取貨清單出現，那間分店會第一時間列在本頁。`,
    nUsStores: f({ other: "美國 # 間 Apple Store" }),
    modelStockSome: (count: string) => `上一輪檢查，${count} 有貨；每間分店及其款式都列在本頁。`,
    priceQ: (model: string) => `${model} 售價多少？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `${low} 起，最高 ${high}（無鎖版）。價錢視乎容量（${storages}），顏色有${colors}。`,
    modelRestockQ: (model: string) => `${model} 隔多久補一次貨？`,
    modelLastsQ: (model: string) => `${model} 補貨後通常多久賣光？`,
    reserveQ: (model: string) => `${model} 可以預留嗎？`,
    reserveA: "不可以。要等分店上架你要的款式，再在 apple.com 下單並揀「提取」；Apple 會按你揀的時段替你留貨。",

    storeStockQ: (store: string, model: string) => `${store}現在可以提取 ${model} 嗎？`,
    nConfigs: f({ other: "# 款配置" }),
    storeStockYes: (count: string) => `可以。上一輪檢查有 ${count}上架，容量及顏色列在本頁表格。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `暫時不可以，上一輪檢查未見上架${other ? `。同店倒有 ${other.pro} 款 iPhone 18 Pro、${other.proMax} 款 18 Pro Max` : "；18 Pro 及 18 Pro Max 同樣一款都沒有"}。`,
    hoursQ: (store: string) => `${store}的營業時間是？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "營業時間列在本頁表格"}${today ? `。今日：${today.replace(/\s*\((.+)\)$/, "（$1）")}` : ""}。地址 ${tidyAddress(address)}${phone ? `；電話 ${tidyPhone(phone)}` : ""}。`,
    storeRestockQ: (store: string) => `${store}隔多久補一次 iPhone？`,
    storeLastsQ: (store: string) => `${store}補貨後，貨通常留多久？`,
    storeNearestQ: (store: string) => `${store}附近還有哪些 Apple Store？`,

    placeStockQ: (place: string, model: string) => `${place}此刻哪些 Apple Store 可提取 ${model}？`,
    placeStockNone: (place: string, model: string) => `上一輪檢查一間都沒有。${place}有分店上架 ${model} 時，本頁會即時列出。`,
    nStores: f({ other: "# 間店" }),
    placeStockSome: (count: string, stores: string) => `上一輪檢查有 ${count}有貨，包括${stores}。`,
    countQ: (place: string) => `${place}共有多少間 Apple Store？`,
    nAppleStores: f({ other: "# 間 Apple Store" }),
    countMany: (count: string, stores: string) => `共 ${count}，包括${stores}。`,
    countOne: (count: string, store: string) => `只有 ${count}，即${store}。`,
    placeRestockQ: (place: string) => `${place}的 Apple Store 隔多久補一次 iPhone？`,
    placeLastsQ: (place: string) => `${place}的補貨通常多久賣光？`,
    placeNearestQ: (place: string) => `${place}以外最近有哪些 Apple Store？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "全美國的 Apple Store" : `${place}各間 Apple Store`;
    return [
      `讀取節奏：${at}的每款配置 15 秒一次；有人設了提醒的分店 5 秒一次。一次讀數不算數，要下一次讀數確認，才記為補貨或售罄。`,
      "本頁的圖表和補貨記錄，全部來自這些已確認的變化，沒有估算。",
      "所謂店舖取貨，就是 apple.com 上的一張網上訂單：先揀款式及分店、在網上付款，多數即日可到店拿貨。店內陳列的現貨和電訊商門市的存貨，都不在此列。",
    ];
  },
  alertRule: "提醒的單位：一間分店 × 一款指定配置（型號、容量、顏色）。apple.com 一顯示可提取，推送在幾秒內發出；你的裝置全部未開通知，才改寄電郵。",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store：${stores} 間中 ${duoNow} 間上架 iPhone Duo`,
      `${name} iPhone Duo 現貨：Apple Store 即時取貨`,
      `${name} iPhone Duo 現貨：各 Apple Store`,
      `${name} Apple Store：iPhone 即時現貨`,
    ],
    city: (cityName: string, code: string, duoNow: string, stores: string) => [
      `${cityName}, ${code}：${duoNow}/${stores} 間 Apple Store 有 iPhone Duo`,
      `${cityName}, ${code} iPhone Duo：Apple Store 即時取貨`,
      `${cityName}, ${code} iPhone Duo 現貨：Apple Store`,
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
      `${name}：Apple Store 取貨即時現貨`,
    ],
  },

  tokens: {
    tooFewToMeasure: "數據仍不足",
    noneLoggedYet: "至今未有記錄",
    noneYet: "至今未有",
  },

  pattern: {
    none: (days: string) => `最近 ${days} 日未有確認補貨。`,
    nConfirmed: f({ other: "確認補貨 # 次" }),
    countIn: (count: string, days: string) => `最近 ${days} 日內${count}`,
    stay: (minutes: string) => `；每次通常上架約 ${minutes} 分鐘便賣光`,
    nDays: f({ other: "# 日" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `，散落 ${onDays}` : ""}；數據未夠，暫時看不出慣常鐘點${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `慣常補貨：當地${hour}${weekday ? `，${weekday}最密` : ""}。${count}${stay}。`,
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

  measured: "數字從何而來",

  faqTitle: "常見疑問",
  breadcrumb: "所在位置",
  keepExploring: "RestockWire 更多內容",
  browse: {
    storesByState: "按州份看分店",
    allStatesCities: "每個州份及城市 →",
    liveByModel: "按機型看即時現貨",
    modelStock: (model: string) => `${model} 存貨`,
    thisPage: "你在此頁",
    restockLog: (short: string) => `${short} 補貨快訊`,
    liveMap: "存貨地圖",
    mostStores: "分店最多",
    allStates: "所有州份",
    bigCities: "大城市",
    cities: "城市",
    storesBy: (region: string) => `按${region}看分店`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{cleanCountry(country)}每一間 Apple Store →</>,
    allRegions: (regions: string) => `所有${regions}`,
  },
  modelCards: "揀一部 iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最新補貨：{config}{at}，{ago}。</>,
    at: (store: ReactNode) => <> · {store}</>,
  },
  statStrip: {
    inStockNow: "此刻上架",
    ofStores: (k: string) => `／${k} 間分店`,
    stores: "分店數目",
    nCities: f({ other: "# 個城市" }),
    tracked: "正在追蹤",
    modelNow: (short: string) => `${short} 此刻`,
    configsInStock: "款上架",
    storesWithStock: f({ other: "間分店上架" }),
    restocks24h: "補貨，24 小時",
    restocksHint: (week: string, month: string, days: string) => `近 7 日：${week} 次 · 近 ${days} 日：${month} 次`,
    sellOuts: (days: string) => `售罄 ${days} 日`,
    stays: (duration: string) => `約撐 ${duration}`,
    noPairs: "未有可配對的售罄",
    lastRestock: "最新補貨",
    noneYet: "至今未有",
    inLastDays: (days: string) => `最近 ${days} 日`,
  },
  product: {
    chooseIphone: "揀你的 iPhone",
    storage: "儲存容量",
    color: "機身顏色",
    all: "不限",
    numbersAre: (unit: ReactNode) => <>每個數字 = 此刻上架的{unit}。</>,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    last: (ago: ReactNode) => <>最近一次：{ago}</>,
    notSeenYet: "至今未上架",
    firstCheckPending: "首次檢查即將進行",
    inStock: "有存貨",
    inStockLower: "有存貨",
    none: "無貨",
    here: "你就在此",
    notAvailable: "未上架",
    notCheckedYet: "未讀取",
    availableForPickup: "可到店提取",
    since: (ago: ReactNode) => <> · {ago}起上架</>,
    lastInStock: (ago: ReactNode) => <>上次上架：{ago}</>,
    neverSeen: "這間分店至今未上架過",
    firstCheckSoon: "一分鐘內進行首次檢查",
    buy: "在 apple.com 訂購",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked}讀取 · {note}</>,
    checkNote: CHECK,
  },

  source: (source: ReactNode) => <>數據：{source}</>,
  photoCredit: (link: ReactNode) => <>圖片來源：{link}</>,
  sources: "參考來源",
  allUsStores: "美國 269 間 Apple Store（全部）",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire 自{since}起的即時檢查：{where} 的每一款 iPhone Duo、18 Pro 及 18 Pro Max 配置，每 15 秒讀取一次（設了提醒的分店每 5 秒）；本頁數字讀取於 {asOf}。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>即時：{stores} 間 Apple Store 中，有幾多間上架各款 {model} 供提取</>,
    storage: "儲存容量",
    pricesCaption: (model: ReactNode) => <>{model}：apple.com 價錢（無鎖版，未連稅）對照即時取貨現貨</>,
    price: "售價",
    bestColor: "此刻最多分店上架的顏色",
    noRestock: (model: string) => `${model} 至今未有補貨記錄。`,
    clockLabel: (model: string) => `${model}（美國所有分店）`,
    storesWithIt: "此刻上架的分店",
    pairsInStock: "上架中的「分店 × 款式」",
    restocksLogged: "補貨記錄數",
    medianTime: "上架時長（中位數）",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "寬敞的商場中庭，設有 Apple Store 和扶手電梯，自然光灑入", caption: "這類商場分店，多數在開門前已補好取貨存貨。" },
    "phone-map": { alt: "一隻手拿着手機，螢幕顯示地圖導航", caption: "貨只上架一分鐘，路程遠近就是勝負。" },
    "phone-card-payment": { alt: "一名女士用手機在收款機上感應付款", caption: "先在網上付款，之後到店拿貨。" },
    "phone-on-box": { alt: "白色背景上一部仍在盒中的手機", caption: "未拆盒，已留給你。" },
    "city-map-phone": { alt: "一對年輕情侶在郊外公路旅程中用手機導航", caption: "住得遠，出發前先計好去分店的路。" },
    "phone-notification": { alt: "一隻手拿着手機，螢幕顯示勵志句子「Hard Work Forever Pays.」", caption: "提醒就會彈上這個螢幕。" },
    "apple-store-crowd-inside": { alt: "曼谷一個商場內的 Apple Store，顧客在枱邊試用產品", caption: "店內每張枱都用來試機，取貨人龍排在後面。" },
    "apple-store-glass-canopy": { alt: "芝加哥市中心河畔一間現代玻璃建築 Apple Store 的外觀", caption: "芝加哥河畔的玻璃 Apple Store。" },
    "apple-store-night-vancouver": { alt: "溫哥華夜景航拍，天際線與大橋燈火通明", caption: "取貨現貨隨時可能出現，不過早上最多。" },
    "phone-hand-camera": { alt: "一隻手拿着配橙色機殼、有三個鏡頭的手機", caption: "人人搶的，是 Pro 型號。" },
    "place-hk-hong-kong": { alt: "高樓林立的城市景觀，背後是連綿山巒", caption: "香港：高樓背後就是山。" },
  },
};
