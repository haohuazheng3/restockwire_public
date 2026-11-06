/**
 * 台灣中文：content —— SEO 積木（FAQ、瀏覽連結、數字條、產品元件、資料來源、即時元件）、enrich 的營業時間與
 * FAQ 答句、頁面標題、即時 {{token}}、補貨規律句與圖片說明。參數已是中文、數字已格式化；這裡只負責排字。
 * 機型名、容量、Apple Store、RestockWire、apple.com 不翻。檢查間隔只寫 15 秒與 5 秒。
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { zs } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "休息",
    everyDay: (hours: string) => `每天 ${hours}`,
    tomorrow: "明天",
    dayAt: (day: string, time: string) => `${day} ${time}`,
    closedTodayOpens: (next: string) => `今天休息 · ${next} 開門`,
    closedToday: "今天休息",
    opensAt: (time: string) => `${time} 開門`,
    openNow: (closes: string) => `營業中 · ${closes} 打烊`,
    closedNowOpens: (next: string) => `已打烊 · ${next} 開門`,
    closedNow: "已打烊",
  },

  duration: {
    underAMinute: "不到 1 分鐘",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (k: string) => `另有 ${k} 個`,
  nearLine: (place: string, distance: string) => `${place} · ${distance}`,

  faq: {
    /** 句子以地點開頭（「Apple 信義 A13 最近 30 天…」），所以這裡只給名詞。 */
    where: (_kind: Kind, place: string) => place,
    nRestocks: f({ other: "補貨 # 次" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      zs(`${count == null ? `${where}最近 ${days} 天補貨 0 次` : `${where}最近 ${days} 天${count}（近一週 ${week} 次）`}${peak ? `，集中在當地時間${peak.hour}前後${peak.day ? `，以${peak.day}最多` : ""}` : ""}；Apple 本身不公布補貨時間表。`),
    lastsNone: (where: string) => zs(`${where}賣完的補貨還不夠多，暫時算不出數字。`),
    lasts: (days: string, duration: string) => zs(`中位數約 ${duration}：這是最近 ${days} 天裡，補貨的規格從上架到賣完維持的時間。`),
    storeIn: (store: string, line: string) => `${store}（${line}）`,
    nearestA: (stores: string) => `${stores}。`,

    modelStockQ: (model: string) => zs(`現在哪裡有 ${model} 可門市取貨？`),
    modelStockNone: (model: string) => zs(`最新一次檢查時，沒有美國 Apple Store 上架；${model} 一出現在任何門市的取貨清單，本頁就會列出第一家。`),
    nUsStores: f({ other: "# 家美國 Apple Store" }),
    modelStockSome: (count: string) => zs(`最新一次檢查時有 ${count}，每家都列在本頁並附上規格。`),
    priceQ: (model: string) => zs(`${model} 賣多少錢？`),
    priceA: (low: string, high: string, storages: string, colors: string) => zs(`空機 ${low} 到 ${high}，價格依容量（${storages}）而定，顏色有${colors}。`),
    modelRestockQ: (model: string) => zs(`${model} 隔多久會補一次貨？`),
    modelLastsQ: (model: string) => zs(`${model} 補貨後，能在架上待多久？`),
    reserveQ: (model: string) => zs(`有辦法預約 ${model} 門市取貨嗎？`),
    reserveA: "無法事先預約：門市上架你的規格時，你在 apple.com 下單並選門市取貨，Apple 會在你選的時段替你保留。",

    storeStockQ: (store: string, model: string) => zs(`${store}有 ${model} 現貨嗎？`),
    nConfigs: f({ other: "# 款規格" }),
    storeStockYes: (count: string) => zs(`有：最新一次檢查時有 ${count}，容量與顏色見本頁表格。`),
    storeStockNo: (other: { pro: string; proMax: string } | null) => zs(`沒有，最新一次檢查時沒有${other ? `；不過它上架了 iPhone 18 Pro ${other.pro} 款、18 Pro Max ${other.proMax} 款規格` : "，18 Pro 和 18 Pro Max 也一款都沒有"}。`),
    hoursQ: (store: string) => zs(`${store}幾點開門？`),
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      zs(`${hours ?? "營業時間見本頁表格"}${today ? `；今天 ${today}` : ""}；地址：${address}${phone ? `，電話 ${phone}` : ""}。`),
    storeRestockQ: (store: string) => zs(`${store}多久補一次 iPhone？`),
    storeLastsQ: (store: string) => zs(`${store}的補貨能在架上待多久？`),
    storeNearestQ: (store: string) => zs(`離${store}最近的 Apple 直營店有哪些？`),

    placeStockQ: (place: string, model: string) => zs(`${place}現在哪些 Apple 直營店上架 ${model} 門市取貨？`),
    placeStockNone: (place: string, model: string) => zs(`最新一次檢查時沒有；${place}一有門市上架 ${model}，就會出現在本頁。`),
    nStores: f({ other: "# 家" }),
    placeStockSome: (count: string, stores: string) => zs(`最新一次檢查時有 ${count}：${stores}。`),
    countQ: (place: string) => zs(`${place}一共有多少家 Apple 直營店？`),
    nAppleStores: f({ other: "# 家" }),
    countMany: (count: string, stores: string) => zs(`${count}，其中包括${stores}。`),
    countOne: (count: string, store: string) => zs(`${count}：${store}。`),
    placeRestockQ: (place: string) => zs(`${place}多久補一次 iPhone？`),
    placeLastsQ: (place: string) => zs(`${place}補貨後，現貨能撐多久？`),
    placeNearestQ: (place: string) => zs(`${place}以外，最近的 Apple 直營店是哪幾家？`),
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "每一家美國 Apple Store" : `${place}的 Apple 直營店`;
    return [
      "門市取貨是一筆 apple.com 訂單：結帳時選好規格和門市，線上付款、親自到店領取，常常當天就拿得到。電信門市和店內現場的庫存是另一回事。",
      zs(`在${at}，RestockWire 每 15 秒讀取一次每種追蹤中的規格，設了通知的門市每 5 秒一次。變化要經第二次檢查確認才算數，所以偶發的異常不會被當成補貨或售完。`),
      "每次確認的變化都寫進紀錄，本頁的補貨圖表與歷史就是從這份紀錄畫出來的。",
    ];
  },
  alertRule: "一則通知 = 一家門市加一支確切的手機（機型、容量、顏色）；apple.com 一轉為可取貨，幾秒內就送出推播，沒有裝置開啟通知時改寄 Email。",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name} Apple Store：${stores} 家中 ${duoNow} 家上架 iPhone Duo`,
      `${name} 各 Apple Store 的 iPhone Duo 取貨庫存（即時）`,
      `${name} Apple Store 現在有沒有 iPhone Duo`,
      `${name} Apple Store 的 iPhone 庫存快訊`,
    ].map(zs),
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}（${code}）Apple Store：${stores} 家中 ${duoNow} 家有 iPhone Duo`,
      `${city}（${code}）各店 iPhone Duo 取貨庫存（即時）`,
      `${city}（${code}）Apple Store 現在有沒有 iPhone Duo`,
      `${city} Apple Store 的 iPhone 庫存快訊`,
    ].map(zs),
    /** 門市頁 <title> 與 H1：店名在前（大家搜的就是「apple 信義 a13」），再接即時現貨、補貨時段、取貨。 */
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone 即時現貨、補貨時段與門市取貨`,
        `${name}${r}：iPhone 即時現貨與補貨時段`,
        `${name}${r}：iPhone 即時現貨與營業時間`,
        `${name}：iPhone 即時現貨、補貨時段與門市取貨`,
        `${name}：iPhone 即時現貨與營業時間`,
        `${name}：iPhone 即時現貨`,
        `${name} 即時現貨`,
      ].map(zs);
    },
    model: (name: string, storesNow: string) => [
      `${name} 門市取貨現貨：此刻 ${storesNow} 家 Apple Store 上架`,
      `${name} 門市取貨現貨：${storesNow} 家 Apple Store`,
      `${name}：門市取貨庫存快訊`,
    ].map(zs),
  },

  tokens: {
    tooFewToMeasure: "資料還不夠",
    noneLoggedYet: "目前還沒有紀錄",
    noneYet: "目前還沒有",
  },

  pattern: {
    none: (days: string) => `最近 ${days} 天確認的補貨 0 次。`,
    nConfirmed: f({ other: "確認補貨 # 次" }),
    countIn: (count: string, days: string) => `最近 ${days} 天${count}`,
    stay: (minutes: string) => `；每次補貨通常在架上約 ${minutes} 分鐘`,
    nDays: f({ other: "# 天" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `，分布在 ${onDays}` : ""}，還不足以看出平常的時段${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `平常的補貨時段：當地時間${hour}${weekday ? `，${weekday}最多` : ""}；${count}${stay}。`,
  },

  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "省" }),
    area: f({ other: "地區" }),
    department: f({ other: "省" }),
    prefecture: f({ other: "都道府縣" }),
    emirate: f({ other: "酋長國" }),
    canton: f({ other: "州" }),
    region: f({ other: "大區" }),
    county: f({ other: "省" }),
    city: f({ other: "縣市" }),
  } as Record<string, Forms>,

  measured: "數字怎麼量出來的",

  faqTitle: "問與答",
  breadcrumb: "導覽路徑",
  keepExploring: "RestockWire 的更多內容",
  browse: {
    storesByState: "依州看門市",
    allStatesCities: "每個州與城市 →",
    liveByModel: "逐款機型的即時現貨",
    modelStock: (model: string) => `${model} 現貨`,
    thisPage: "本頁",
    restockLog: (short: string) => `${short} 補貨紀錄`,
    liveMap: "即時地圖",
    mostStores: "門市數最多",
    allStates: "所有州",
    bigCities: "主要城市",
    cities: "城市",
    storesBy: (region: string) => `依${region}看門市`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{zs(`${country}每一家 Apple 直營店`)} →</>,
    allRegions: (regions: string) => `全部${regions}`,
  },
  modelCards: "選一支 iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最新補貨：{config}{at}，{ago}。</>,
    at: (store: ReactNode) => <>（{store}）</>,
  },
  statStrip: {
    inStockNow: "此刻上架",
    ofStores: (k: string) => `共 ${k} 家門市`,
    stores: "門市",
    nCities: f({ other: "# 個城市" }),
    tracked: "追蹤中",
    modelNow: (short: string) => `${short} 此刻`,
    configsInStock: "款規格上架",
    storesWithStock: f({ other: "家門市上架" }),
    restocks24h: "補貨，24 小時",
    restocksHint: (week: string, month: string, days: string) => `7 天 ${week} 次 · ${days} 天 ${month} 次`,
    sellOuts: (days: string) => `售完 ${days} 天`,
    stays: (duration: string) => `約撐 ${duration}`,
    noPairs: "還沒有可配對的售完",
    lastRestock: "最新補貨",
    noneYet: "目前還沒有",
    inLastDays: (days: string) => `最近 ${days} 天`,
  },
  product: {
    chooseIphone: "選你的 iPhone",
    storage: "容量",
    color: "顏色",
    all: "全部",
    numbersAre: (unit: ReactNode) => <>每個數字 = 此刻上架的{unit}數。</>,
    seen: (ago: ReactNode) => <>{ago}上架</>,
    last: (ago: ReactNode) => <>上次 {ago}</>,
    notSeenYet: "目前還沒上架過",
    firstCheckPending: "第一次檢查即將進行",
    inStock: "有現貨",
    inStockLower: "有現貨",
    none: "沒有",
    here: "就在這",
    notAvailable: "未上架",
    notCheckedYet: "尚未檢查",
    availableForPickup: "可門市取貨",
    since: (ago: ReactNode) => <> · {ago}起上架</>,
    lastInStock: (ago: ReactNode) => <>上次上架：{ago}</>,
    neverSeen: "這家門市至今還沒上架過",
    firstCheckSoon: "一分鐘內進行第一次檢查",
    buy: "在 apple.com 訂購",
    checked: (checked: ReactNode, note: ReactNode) => <>讀取於 {checked} · {note}</>,
    checkNote: "全部門市 15 秒一輪，有通知的門市 5 秒一輪",
  },

  source: (source: ReactNode) => <>資料：{source}</>,
  photoCredit: (link: ReactNode) => <>照片：{link}</>,
  sources: "資料來源",
  allUsStores: "全美全部 269 家 Apple Store",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>RestockWire 自 {since}起的即時檢查：{where}的每一款 iPhone Duo、18 Pro 與 18 Pro Max 規格，每 15 秒讀取一次（設了通知的門市每 5 秒）；本頁數字讀取於 {asOf}。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>即時：{stores} 家 Apple Store 中，有幾家上架各款 {model} 規格供取貨</>,
    storage: "容量",
    pricesCaption: (model: ReactNode) => <>{model}：apple.com 價格（空機、未稅）對照即時取貨現貨</>,
    price: "價格",
    bestColor: "此刻最多門市上架的顏色",
    noRestock: (model: string) => zs(`${model} 目前還沒有補貨紀錄。`),
    clockLabel: (model: string) => zs(`全美的 ${model}`),
    storesWithIt: "此刻上架的門市",
    pairsInStock: "上架中的「門市 × 規格」組合",
    restocksLogged: "已記錄的補貨",
    medianTime: "在架時間（中位數）",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** 圖片說明：只翻通用圖與台灣的地點圖，其他 id 沿用英文。 */
  photos: {
    "apple-store-pickup-counter": { alt: "寬敞的購物中心中庭，有 Apple Store、手扶梯和自然光", caption: "像這樣的商場門市，通常在開門前就補好取貨庫存。" },
    "phone-map": { alt: "戶外特寫：一隻手拿著開啟地圖 App 的手機", caption: "貨架只撐一分鐘，離門市多遠就是關鍵。" },
    "phone-card-payment": { alt: "女性拿手機在刷卡機上感應付款", caption: "先在網路上付款，人再到店取機。" },
    "phone-on-box": { alt: "白色背景前，一支還裝在盒子裡的手機", caption: "還沒拆封，已經是你的。" },
    "city-map-phone": { alt: "一對年輕情侶在鄉間公路旅行中用手機導航", caption: "先排好去門市的路。" },
    "phone-notification": { alt: "特寫：手裡的手機螢幕顯示勵志標語「Hard Work Forever Pays.」", caption: "補貨通知會跳上這個螢幕。" },
    "apple-store-crowd-inside": { alt: "曼谷一座購物中心裡的 Apple Store，顧客在桌邊試用裝置", caption: "店裡每張桌子都是體驗區，取貨的隊伍排在後面。" },
    "apple-store-glass-canopy": { alt: "芝加哥市中心河畔，一家玻璃建築的現代 Apple Store 外觀", caption: "芝加哥河畔的玻璃 Apple Store。" },
    "apple-store-night-vancouver": { alt: "夜間空拍溫哥華，天際線和大橋燈火通明", caption: "取貨庫存任何時刻都可能冒出來，只是早上冒出來的機會大得多。" },
    "phone-hand-camera": { alt: "特寫：手裡拿著橘色手機殼、三顆鏡頭的手機", caption: "排隊的人，多半是衝著 Pro 來的。" },
    "place-tw-taiwan": { alt: "台北夜間天際線，摩天大樓燈火通明", caption: "台灣：台北的夜景。" },
  },
};
