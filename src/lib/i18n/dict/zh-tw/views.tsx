/**
 * 台灣中文：views —— 產品 × 地點頁、補貨紀錄、即時地圖、iPhone Duo 補貨時段頁與門市索引。
 * `c: Country` 是英文資料，國名一律用 places.countryLabel；`Store`／`Place` 物件也是英文資料，店名、城市、
 * 地區用 places.ts 換成 Apple 台灣的寫法。檢查間隔只寫 15 秒與 5 秒；不提退款。
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, storePath, storeTimeZone, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN } from "@/lib/content/siteFacts";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { distance, fitTitleW, list, num, price } from "../../format";
import { appleStoreLabel, cityLabel, configLabel, regionLabel, storeLabel } from "../../places";
import { L, cn, hh, hrange, longYmdZh, n, regionZh, stampZh, taxNoteZh, weekdayZh, ymdZh, zhCfg, zoneName, zs } from "./util";

/* ---------------------------------------------------------------- 小工具 */

type RTMeta = RestockTimesMeta;
type RTView = RestockTimesView;

const C = (c: Country) => cn(c.cc);
/** 百分比；不到 0.5% 寫「<1%」。 */
const pc = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** 「11 月 2 日 上午 9:30（台北標準時間）」：國家參考時區。 */
const zoneStamp = (iso: string, c: Country) => `${stampZh(iso, c.timeZone)} ${zoneName(c.timeZone, iso)}`;
/** 門市當地時間：「11 月 2 日 下午 2:31」。 */
const local = (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => stampZh(iso, storeTimeZone(store as Store));
/** 補貨時段頁按地區分組時的名詞：美國「州」，其他國家依 regionNoun，沒有就是「地區」。 */
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "州" : x.c.regionNoun ? regionZh(x.c) : "地區");
const apple = (s: Store) => appleStoreLabel(s, L);
/** 地點（英文資料）→ 中文名。 */
function placeName(place: Place): string {
  const code = place.country ?? "us";
  if (place.level === "country") return cn(code);
  if (place.level === "state") return regionLabel(code, place.state!, L);
  if (place.level === "city") return cityLabel(code, place.city!, L);
  return appleStoreLabel(place.store!, L);
}

/* ---------------------------------------------------------------- 產品 × 地點頁的標題、描述與 FAQ */

function productTitle(product: Product, place: Place, inStock: number): string {
  const code = place.country ?? "us";
  const k = place.stores.length;
  const name = zhCfg(product.name);
  const short = zhCfg(product.short);
  const w = placeName(place);
  if (place.level === "country") {
    return fitTitleW([
      ...(inStock > 0 ? [`${w} ${n(inStock)} 家 Apple ${code === "us" ? "Store" : "直營店"}現在上架 ${name}`] : []),
      `${w} ${name}：門市取貨現貨即時看`,
      `${w} ${short}：門市取貨現貨`,
      `${short}門市取貨現貨`,
    ].map(zs));
  }
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${w} 的 ${name}：${inStock > 0 ? "現在可門市取貨" : "取貨現貨與補貨"}`,
      `${w}（${cityLabel(code, s.city, L)}）${short}：${inStock > 0 ? "現在有貨" : "現貨"}`,
      `${w} ${short}現貨`,
      `${storeLabel(s, L)} ${short}`,
    ].map(zs));
  }
  return fitTitleW([
    `${w} ${name}：${n(k)} 家門市中 ${n(inStock)} 家現在上架`,
    `${w} ${name}：門市取貨現貨即時看`,
    `${w} ${short}現在有貨嗎？`,
    `${w} ${short}`,
  ].map(zs));
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const code = place.country ?? "us";
  const name = zhCfg(product.name);
  const week = `本週補貨 ${n(stats.week)} 次`;
  if (place.level === "store") {
    const s = place.store!;
    return fitTitleW([
      `${apple(s)}（${cityLabel(code, s.city, L)}）的 ${name}：${inStock > 0 ? "上次讀取時可門市取貨" : "目前沒有上架門市取貨"}，${week}。這家店幾點補貨、能撐多久，下一次補貨就用通知接。`,
      `${apple(s)} 的 ${name}：${inStock > 0 ? "現在有貨" : "目前沒貨"}，${week}。補貨時段與通知。`,
    ].map(zs), 155);
  }
  const where = place.level === "country" ? `${cn(code)}的 ${code === "us" ? "Apple Store" : "Apple 直營店"}` : `${placeName(place)}的 Apple 直營店`;
  return fitTitleW([
    `此刻${where} ${n(place.stores.length)} 家中有 ${n(inStock)} 家上架 ${name}門市取貨，${week}。逐家門市列出，附補貨時段，下一次補貨用手機通知接。`,
    `${name}：${where} ${n(place.stores.length)} 家中現在 ${n(inStock)} 家有貨，${week}。逐店即時狀態、補貨時段與通知。`,
  ].map(zs), 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const code = place.country ?? "us";
  const name = zhCfg(product.name);
  const at = placeName(place);
  const out: FaqItem[] = [];
  const km = (miles: number) => (miles * 1.609344 < 0.5 ? "不到 1 km" : distance(L, code, miles));
  const near = nearest ? `；最近有上架的是${nearest.city}的 ${/^apple\b/i.test(nearest.name) ? nearest.name : `Apple ${nearest.name}`}，距離${km(nearest.distance)}` : "";
  const have = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: zs(`${at}現在有 ${name}現貨嗎？`),
      a: zs(l && l.available.length > 0
        ? `有${product.parts.length > 1 ? `：${list(L, l.available.map((i) => configLabel(i, L)), 4, (x) => `另外 ${n(x)} 款`)}` : ""}，上次讀取時可門市取貨。`
        : `上次讀取時沒有${near}。`),
    });
  } else {
    out.push({
      q: zs(`${at}現在哪些 Apple 直營店上架 ${name}？`),
      a: zs(have.length === 0
        ? `上次讀取時一家都沒有${near}。`
        : `上次讀取時有 ${n(have.length)} 家：${list(L, have.map((x) => apple(x.store)), 4, (x) => `另外 ${n(x)} 家`)}。`),
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: zs(`${name}多久會在${at}補一次貨？`),
    a: zs(stats.month === 0 ? `最近 ${stats.days} 天，${at}沒有確認的補貨。` : `最近 ${stats.days} 天確認補貨 ${n(stats.month)} 次，其中本週 ${n(stats.week)} 次${peak ? `，集中在當地時間${peak.hour}前後` : ""}。`),
  });
  if (stats.medianMs != null) out.push({ q: zs(`${at}的 ${name}補貨能撐多久？`), a: zs(`中位數約 ${fmtDuration(stats.medianMs, L)}，之後又賣完。`) });
  return out;
}

function priceLabel(product: Product): string {
  const code: CountryCode = product.country ?? "us";
  const prices = catalogFor(product.model, code).filter((x) => product.parts.includes(x.partNumber)).map((x) => x.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[code], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => C(c),
    liveMap: "即時地圖",
    restockLog: "補貨紀錄",
    alertMe: "取得通知",
    lastDays: (days: number) => <>{days} 天，逐日</>,
    since: "2026 年 11 月 2 日",
    sourcesWhere: (k: number, c: Country) => zs(k === 1 ? `${C(c)}唯一的 Apple 直營店` : `${C(c)}全部 ${k} 家 Apple 直營店`),
    checker: (c: Country) => zs(`${C(c)} iPhone 現貨查詢`),
    appleStoresIn: (c: Country) => zs(`${C(c)}的 Apple 直營店`),
    storesWithIt: "家上架門市",
    more: "看更多",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => zs(`${C(c)} ${zhCfg(model)}門市取貨現貨`),
    h1Place: (model: string, where: string) => zs(`${where} ${zhCfg(model)}`),
    inStockNow: "現在上架",
    yes: "是",
    no: "否",
    pickup: "門市取貨",
    configurations: "款規格",
    ofStores: (k: number) => `共 ${k} 家門市`,
    restocks24h: "補貨（24 小時）",
    restocksHint: (week: number, month: number, days: number) => `7 天 ${week} 次 · ${days} 天 ${month} 次`,
    sellOuts: (days: number) => `售完（${days} 天）`,
    stays: (ms: number) => `約撐 ${fmtDuration(ms, L)}`,
    noPairs: "還沒有可配對的售完",
    lastRestock: "最新補貨",
    noneYet: "目前沒有",
    thisConfig: "此規格",
    inDays: (days: number) => `最近 ${days} 天`,
    notInStockNow: "目前沒有上架",
    configsInStock: (k: number, of: number) => <span>{of} 款規格中 <b className="text-ink">{k}</b> 款上架</span>,
    inStockAt: (k: number, of: number) => <span>{of} 家門市中 <b className="text-ink">{k}</b> 家上架</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>讀取於 {live} · {p}{tax}</>,
    taxNote: (c: Country) => taxNoteZh(c),
    beforeTax: "未稅",
    buyOnApple: "到 apple.com 下單",
    allStoresIn: (c: Country) => `${C(c)}每家門市`,
    everyIphoneHere: "這裡的所有 iPhone",
    everyIphone: (where: string) => zs(`${where}所有 iPhone`),
    panel: (model: string, where: string | null) => zs(`${where ? `${where}的 ` : ""}${zhCfg(model)}：先選規格，再選門市`),
    unitConfigs: "規格",
    unitStores: "門市",
    otherConfigsHere: "這裡的更多規格",
    byStorageColor: "容量與顏色",
    nearestStores: "最近的門市",
    closest: (link: ReactNode, dist: string) => <>最近有上架的門市：{link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}（{city}）</>,
    mostRecentlyInStock: "最近一次上架",
    storesWithItNow: "現在上架的門市",
    storesIn: (where: string) => zs(`${where}的門市`),
    colStatus: "狀態",
    colConfigs: "上架規格",
    noStoreHasIt: "目前沒有門市上架。",
    noStoreHereHasIt: "這個區域目前沒有門市上架。",
    moreStores: (k: number) => <>另有 {k} 家門市，下方依地區排列。</>,
    byRegion: (c: Country) => `依${regionZh(c)}`,
    byCity: "依城市",
    nearbyStores: "鄰近門市",
    latestChanges: "最新異動",
    nothingLogged: "紀錄目前還是空的。",
    whenRestocks: "通常幾點補貨",
    howFast: "一次補貨撐多久",
    restocksByConfig: "哪些規格會補貨",
    faqTitleCountry: (model: string, c: Country) => zs(`${C(c)} ${zhCfg(model)}：常見問題`),
    faqTitle: (model: string, where: string) => zs(`${where} ${zhCfg(model)}`),
    buySource: (model: string, c: Country) => zs(`Apple：${zhCfg(model)} 購買頁面（${C(c)}）`),
    nearby: "鄰近",
    otherRegions: (c: Country) => `其他${regionZh(c)}`,
    elsewhereIn: (region: string) => zs(`${region}較遠的門市`),
    everyAppleStoreIn: (c: Country) => zs(`${C(c)} Apple 直營店完整列表`),
    across: (model: string, c: Country) => zs(c.cc === "tw" ? `全台 ${zhCfg(model)}` : `${C(c)}各地 ${zhCfg(model)}`),
    itemList: (model: string, where: string) => zs(`${where} ${zhCfg(model)}`),
    nearLead: (c: Country, model: string, inStock: number, total: number, have: { store: string; city: string; configs: number }[]) =>
      zs(inStock === 0
        ? `此刻${C(c)}沒有任何 Apple 直營店上架 ${model} 門市取貨，所以「我附近」比的是哪家附近門市先補貨。在每家你到得了的門市設好通知，一上架，推播幾秒後就到你手機。`
        : `${n(total)} 家門市中有 ${n(inStock)} 家此刻上架 ${model}：${list(L, have.slice(0, 5).map((l) => `${l.store}（${l.city}，${l.configs} 款規格）`), 5, (x) => `另外 ${n(x)} 家`)}。`),
    nearHead: (c: Country) => [regionZh(c), "現在上架的門市"],
    nearCaption: (c: Country, model: string) => zs(`各${regionZh(c)}的 ${model} 門市取貨現貨，最新一次檢查`),
    nearMe: (_c: Country, model: string, alert: string) => zs(`在本頁的通知設定點「我附近」，每家門市就會依你所在位置排序：按道路估算距離、以公里計，每家都附導航連結。[設定 ${model} 通知](${alert})。`),
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      return {
        price: { q: zs(`${model} 在${C(c)}賣多少？`), a: zs(`apple.com 售價 ${money(low)} 到 ${money(high)}（${taxNoteZh(c)}），依容量而定。`) },
        reserve: { q: zs(`在${C(c)}有辦法預約 ${model} 門市取貨嗎？`), a: zs(`無法事先預約：門市上架你要的規格時，你在 apple.com 下單並選門市取貨，Apple 會依你選的時段保留。${inStock === 0 ? "目前沒有門市上架，所以想搶第一，靠的就是通知。" : ""}`) },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, k: number) => zs(`${C(c)} iPhone 補貨快訊（即時）：${k === 1 ? "Apple 直營店" : `${k} 家 Apple 直營店`}`),
    metaDescription: (c: Country, k: number) => zs(`${C(c)}${k === 1 ? "這家" : "各家"} Apple 直營店每一次經確認的 iPhone Duo、18 Pro 與 Pro Max 門市取貨補貨：時間、確切規格、地圖。`),
    h1: (c: Country) => `${C(c)} iPhone 補貨，即時記錄`,
    summary: (day: number, week: number, model?: string, region?: string) => <>過去 24 小時補貨 {num(L, day)} 次 · 7 天 {num(L, week)} 次{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時間以你自己的時區顯示。</>,
    allModels: "所有機型",
    restocks: "補貨",
    withSoldOut: "補貨與售完",
    regionLabel: (c: Country) => regionZh(c),
    allRegions: (c: Country) => `所有${regionZh(c)}`,
    filter: "套用",
    page: (k: number) => <>第 {k} 頁</>,
    newer: "← 較新",
    older: "較舊 →",
    getAlerts: "設定通知",
    byPlace: "逐地點看補貨",
    byRegion: (c: Country) => `依${regionZh(c)}`,
    datasetName: (c: Country) => zs(`${C(c)} Apple 直營店 iPhone 門市取貨補貨`),
    datasetDescription: (c: Country) => zs(`${c.cc === "us" ? "全美 269 家 Apple Store" : `${C(c)}的 Apple 直營店`}經確認的 iPhone Duo、iPhone 18 Pro 與 iPhone 18 Pro Max 門市取貨補貨與售完：門市、確切規格、時間。每家門市每 15 秒讀取一次（有人設通知的門市每 5 秒），apple.com 兩次回應相同，補貨才會寫進紀錄。`),
    datasetMeasured: ["Apple 直營店", "iPhone 機型、容量與顏色", "補貨時間", "售完時間"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, k: number) => zs(`${C(c)} iPhone Duo 即時現貨地圖：${k === 1 ? "Apple 直營店" : "每家 Apple 直營店"}`),
    metaDescription: (c: Country, k: number) => zs(`iPhone Duo、18 Pro 與 Pro Max 此刻在哪裡上架門市取貨：${C(c)}${k === 1 ? "這家" : `全部 ${k} 家`} Apple 直營店都在同一張即時地圖上，可依容量與顏色查看。`),
    /** 地圖元件在非英文時用 regionNoun 當 key 查 cdict map.nouns，所以這裡維持英文 key；國名它自己用 countryLabel。 */
    country: (c: Country) => ({ name: C(c), inName: C(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "所有門市",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `，依${regionZh(c)}與城市排列` : cities > 1 ? "，依城市排列" : "";
      return zs(`此刻 ${duo} 家上架 iPhone Duo、${max} 家上架 Pro Max：${C(c)}全部 ${k} 家 Apple 直營店的門市取貨即時現貨${by}，18 Pro 也在內。`);
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => zs(`${k} 家，${spread}${top.length ? `；${top[0].name}以 ${top[0].count} 家居首${top[1] ? `，領先${top[1].name}（${top[1].count} 家）` : ""}` : ""}。`),
    howMany: (c: Country) => <>{C(c)}一共有多少家 Apple 直營店？</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: zs(`${C(c)}現在哪些 Apple 直營店上架 iPhone Duo？`),
      a: zs(have.length === 0 ? `最新一次檢查，${k} 家都沒有；只要有一家上架，本頁與地圖馬上更新，而通知會比兩者更早到你手上。` : `最新一次檢查，${k} 家中有 ${have.length} 家：${have.slice(0, 6).map(apple).join("、")}${have.length > 6 ? "等" : ""}。`),
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => zs(`最快拿到一支的路，是在你到得了的門市設好通知：[設定 iPhone Duo 通知](${alert})。一則通知 = 一家門市 × 一種確切規格，那家門市一上架，幾秒後你的手機就知道。`),
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => zs(`此刻有 **${now.duo}** 家上架 iPhone Duo 門市取貨、**${now.max}** 家上架 iPhone 18 Pro Max、**${now.pro}** 家上架 18 Pro；${C(c)}共有 **${k} 家 Apple 直營店**，${spread}。${tax}`),
    crumb: "Apple 直營店",
    panel: (c: Country) => zs(`先選手機，再勾選${C(c)}你到得了的門市`),
    matrixLabel: "各門市現貨",
    matrixH2: (c: Country) => <>{zs(`${C(c)}逐家門市現貨`)}</>,
    matrixHint: "每個機型：現在上架／追蹤中。",
    topCaption: (c: Country) => <>依 Apple 直營店數量排序的{regionZh(c)}（取自 Apple 零售店列表，本站追蹤範圍）</>,
    regionHead: (c: Country) => regionZh(c),
    colStores: "Apple 直營店",
    colCities: "城市",
    locationsBy: (c: Country) => zs(`Apple 直營店在哪裡，逐${regionZh(c)}列出`),
    locationsIn: (c: Country) => zs(`${C(c)}每個 Apple 直營店據點`),
    storeCount: (k: number) => <>{k} 家門市</>,
    storeCountAll: (k: number) => <>{k} 家門市</>,
    whenRestock: (c: Country) => <>{C(c)}的門市幾點補貨？</>,
    howFast: (c: Country) => <>{C(c)}的一次補貨能撐多久？</>,
    faqTitle: (c: Country) => zs(`${C(c)} Apple 直營店：常見問題`),
    getApp: "取得 App",
    howItWorks: "運作方式",
    pricing: "方案價格",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: (x: number) => num(L, x),
      pct: pc,
      date: (ymd: string, weekday = true) => ymdZh(ymd, weekday),
      longDate: longYmdZh,
      zoneStamp,
      local,
      hour: (h: number) => hh(h),
      range: hrange,
      weekday: weekdayZh,
      store: apple,
      storeWithPlace: (s: Store) => `${apple(s)}（${cityLabel(s.country ?? "us", s.city, L)}）`,
    },
    title: (c: Country) => zs(`Apple 幾點在${C(c)}補貨 iPhone Duo？`),
    metaDescription: (x: RTMeta) => {
      const { c, t, w, pattern } = x;
      const region = c.cc === "us" ? "州" : c.regionNoun ? regionZh(c) : "門市";
      const since = ymdZh(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${since}起，${C(c)} Apple 直營店 iPhone Duo 補貨 ${n(t.n)} 次：${pc(w.share)} 落在當地時間${hrange(w.from, w.to)}${t.sellout ? `，${pc(t.sellout.within2min)} 在 2 分鐘內賣光` : ""}。依小時、日期、${region}、門市與規格列表。`,
          `${since}起，${C(c)} Apple 直營店 iPhone Duo 補貨 ${n(t.n)} 次：${pc(w.share)} 落在當地時間${hrange(w.from, w.to)}。依小時、日期、${region}與規格列表。`,
          `${C(c)} iPhone Duo 補貨時段：${since}起補貨 ${n(t.n)} 次，依小時、日期、${region}與規格整理。`,
        ].map(zs), 158)
        : t.n > 0
          ? fitTitleW([
            `${since}起，${C(c)} Apple 直營店經確認的 iPhone Duo 補貨 ${n(t.n)} 次，來自每 15 秒一次的檢查：依當地小時、逐日、${region}、門市與規格整理，並記下每次撐了多久。`,
            `${C(c)} iPhone Duo 補貨時段：${since}起確認補貨 ${n(t.n)} 次，依小時、日期、${region}與規格整理。`,
          ].map(zs), 158)
          : zs(`${C(c)} Apple 直營店的 iPhone Duo 補貨時段，逐小時、逐日、依門市與規格整理；RestockWire 自 ${longYmdZh(t.since)}起每 15 秒讀取每家門市一次。`);
    },
    h1: (x: RTView) => zs(x.t.unknown
      ? `Apple 幾點在${C(x.c)}補貨 iPhone Duo？`
      : x.t.n > 0
        ? `Apple 幾點在${C(x.c)}補貨 iPhone Duo？${x.pattern ? `最常在當地時間${hrange(x.w.from, x.w.to)}` : "我們自己的檢查，逐小時列出"}`
        : `Apple 有在${C(x.c)}補貨 iPhone Duo 嗎？目前還沒有，以下是我們盯著的數據`),
    intro: (x: RTView) => {
      const { t, one, tracked, pattern, w } = x;
      const who = one ? `${C(x.c)}唯一的 Apple 直營店` : `${C(x.c)}的 Apple 直營店`;
      return t.unknown ? (
        <>{zs(`補貨紀錄暫時讀不到。${C(x.c)}的門市仍維持每 15 秒讀取一次，下次載入本頁時數字就會回來。`)}</>
      ) : t.n > 0 && pattern ? (
        <>
          {zs(`自 ${longYmdZh(t.since)}起，RestockWire 在${who}確認的`)}<b className="text-ink">{zs(`${n(t.n)} 次 iPhone Duo 補貨中，有 ${pc(w.share)}`)}</b>落在<b className="text-ink">{zs(`門市當地時間${hrange(w.from, w.to)}`)}</b>{x.sell ? <>{zs(`；一次典型的補貨大約 ${Math.round(x.sell.medianSec / 5) * 5} 秒就沒了`)}</> : null}。<b className="text-ink">補貨還在持續</b>{tracked > 1 ? <>{zs(`：追蹤的 ${tracked} 天中有 ${t.days} 天有補貨`)}</> : <>（記錄才滿一天）</>}。
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">有。</b><b className="text-ink">{zs(`自 ${longYmdZh(t.since)}起補貨 iPhone Duo ${n(t.n)} 次`)}</b>{zs(`，地點是${who}`)}{tracked > 1 ? zs(`，${tracked} 天中有 ${t.days} 天`) : "（記錄才滿一天）"}{zs(`；累積到 ${PATTERN_MIN} 次補貨、分布在 ${PATTERN_MIN_DAYS} 個不同的日子，我們才會寫出通常幾點。`)}
        </>
      ) : (
        <>
          <b className="text-ink">目前還沒有。</b>{zs(`自 ${longYmdZh(t.since)}起，RestockWire 每 15 秒讀取${one ? `${C(x.c)}唯一的 Apple 直營店` : `${C(x.c)}全部 ${x.stores} 家 Apple 直營店`}一次，還沒有確認過任何一次 iPhone Duo 門市取貨補貨。`)}
        </>
      );
    },
    hero: {
      restocks: (x: RTView) => zs(`${ymdZh(x.t.since, false)}起確認的補貨`),
      window: (x: RTView) => `落在${hrange(x.w.from, x.w.to)}，門市當地時間`,
      days: "有補貨的天數",
      now: ((one: boolean): string => (one ? "家門市此刻上架門市取貨" : "家門市此刻上架門市取貨")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RTView, today: DayRow) => `今天到目前（${ymdZh(today.date)}）${x.one ? "" : `，分布在 ${today.stores} 家門市`}`,
      weekday: "至今補貨最多的星期",
    },
    heroPoints: (x: RTView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>最新：<b className="text-ink">{latest.config}</b>{x.one ? null : <>，在 <Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}，當地時間 {local(latest.at, latest.store)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{weekdayZh(x.t.peakWeekday)}</b>補貨最多</> }] : []),
      { text: <>Apple <b className="text-ink">沒有官方補貨時間表</b>；這些數字來自我們自己確認的檢查，大約每五分鐘更新</>, no: true },
    ],
    emptyPoints: (x: RTView): Point[] => [
      { text: <><b className="text-ink">{x.stores} 家中有 {x.duoNow} 家</b>此刻上架門市取貨</> },
      { text: <>第一次確認的補貨出現，下方每張表格就從那裡開始</>, step: true },
      { text: <>想看樣本最大的小時與星期規律，請看<Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">美國頁面</Link></>, step: true },
    ],
    setUpAlert: "取得 iPhone Duo 通知",
    logLive: "補貨快訊（即時）",
    onThisPage: "段落",
    nav: (x: RTView): Record<string, string> => ({
      "time-of-day": "小時",
      "day-by-day": "日期",
      where: `依${rtRegion(x)}`,
      configuration: "規格",
      "how-long": "賣完速度",
      unavailable: "「無法取貨」",
      reddit: "Reddit 說法",
      method: "方法",
    }),
    h2: (x: RTView): Record<string, string> => ({
      "time-of-day": zs(`${C(x.c)}的 iPhone Duo 幾點回來？`),
      "day-by-day": zs(`${C(x.c)}的 iPhone Duo 哪幾天補過貨？`),
      where: zs(`${C(x.c)}哪裡最常補 iPhone Duo？`),
      configuration: zs(`${C(x.c)}哪個 iPhone Duo 容量與顏色最常補貨？`),
      "how-long": zs(`${C(x.c)}一次 iPhone Duo 補貨能撐幾秒？`),
      unavailable: "為什麼 apple.com 每家門市都顯示「目前無法取貨」？",
      reddit: "Reddit 上的 iPhone Duo 補貨理論，拿紀錄來驗證",
      method: "RestockWire 怎樣才算一次補貨？",
    }),
    faq: (x: RTView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = C(x.c);
      const window = hrange(w.from, w.to);
      return [
        { q: zs(`Apple 什麼時候在${where}補貨 iPhone Duo？`), a: zs(t.n > 0 && pattern
          ? `自 ${longYmdZh(t.since)}起確認的 ${n(t.n)} 次補貨中，門市當地時間${window}占了 ${pc(w.share)}，上午 8 點到中午 12 點占了 ${pc(hourShare(t.byHour, 8, 12))}。Apple 沒有官方時間表；這是 RestockWire 觀察到的規律，大約每五分鐘更新。`
          : `自 ${longYmdZh(t.since)}起，RestockWire 在${where}有 ${n(t.n)} 次確認補貨的紀錄${t.days ? `，分布在 ${t.days} 天` : ""}，Apple 不公布任何時間表。累積到 ${PATTERN_MIN} 次補貨、分布在 ${PATTERN_MIN_DAYS} 個不同的日子，本頁會自己寫出通常幾點。`) },
        { q: zs(`${us ? "" : `${where}的 `}iPhone Duo 週末也會補貨嗎？`), a: zs(t.n > 0
          ? `${weekend > 0 ? "會" : "目前還沒有"}：${n(t.n)} 次補貨中有 ${n(weekend)} 次（${pc(weekend / t.n)}）落在週六或週日。${t.peakWeekday != null ? `至今最多的是${weekdayZh(t.peakWeekday)}。` : `資料涵蓋滿 ${WEEKDAY_MIN_SPAN} 天，我們才會說哪一天最忙；目前涵蓋 ${tracked} 天。`}`
          : `${where}目前還沒有週末資料；本頁的每日表格會隨每次確認的補貨增加。`) },
        { q: "應該幾點開始盯 apple.com？", a: zs(t.n > 0 && pattern
          ? `手動的話，從當地時間${hh(w.from)}起就開著 apple.com、選好門市取貨；這兩個小時占了 ${pc(w.share)} 的補貨。一次典型的補貨${sell ? `中位數 ${sell.medianSec} 秒內就沒了` : "大約撐一分鐘"}，所以每 5 秒檢查一次的通知（[通知怎麼運作](/iphone-duo-restock-alerts)）勝過再多次重新整理。`
          : `${where}的規律還在成形，這段時間讓通知替你盯：你選的門市會改為每 5 秒檢查一次，日夜不停（[通知怎麼運作](/iphone-duo-restock-alerts)）。`) },
        { q: "為什麼每家 Apple 直營店的 iPhone Duo 都「無法取貨」？", a: zs(sell
          ? `因為補貨很短：${where}量到的 ${n(sell.n)} 次售完補貨中，${pc(sell.within2min)} 在 2 分鐘內沒了，${pc(sell.within20min)} 在 20 分鐘內。此刻 ${x.stores} 家中有 ${x.duoNow} 家上架，所以大多數時候 apple.com 說「無法取貨」是實話，就算當天補了幾十次也一樣（[「無法取貨」是什麼意思](/apple-store-pickup-explained)）。`
          : `門市取貨的現貨每次只出現幾分鐘；此刻${where} ${x.stores} 家門市中有 ${x.duoNow} 家上架（[「無法取貨」是什麼意思](/apple-store-pickup-explained)）。`) },
        { q: "我的 Apple 直營店補回 iPhone Duo 時，能收到通知嗎？", a: zs(`可以：為那家門市設一則通知，指定確切的容量與顏色，那家門市就改為每 5 秒檢查一次；確認補貨後約 3 秒，你的手機就知道（[設定通知](${x.alert})；[運作方式](/how-restock-alerts-work)）。`) },
      ];
    },
    sources: {
      applePickup: "Apple：送貨與取貨說明（門市取貨供應狀況如何運作）",
      newsroom: "iPhone Duo 於全球 Apple 直營店開賣（Apple Newsroom，2026 年 10 月 23 日）",
      macRumors: "MacRumors：iPhone Duo 的 Apple Store 取貨系統在美國與加拿大重新上線（2026 年 10 月 24 日）",
      reports: (tracker: string) => zs(`${tracker}：上市週的 iPhone Duo 補貨回報（對方自己的觀察，分開列出，從不計入）`),
    },
    ld: (x: RTView) => ({
      datasetName: zs(`${C(x.c)} Apple 直營店 iPhone Duo 門市取貨補貨時段`),
      description: zs(`自 ${x.t.since} 起${C(x.c)} Apple 直營店經確認的 iPhone Duo 門市取貨補貨（門市、規格、時間），來自 RestockWire 每 15 秒讀取每家門市一次；依當地小時、日期、${rtRegion(x)}、門市與規格分組。`),
      spatial: zs(`${C(x.c)}的 Apple 直營店`),
      measured: ["補貨時刻（以門市當地時間計）", "Apple 直營店", "iPhone Duo 容量與顏色", "從上架到賣光的秒數"],
      size: `${x.t.stores} 家門市，${x.t.n} 次補貨`,
    }),
    crumb: "iPhone Duo 補貨時段",

    timeLead: (x: RTView) => <b>{zs(`門市當地時間${hrange(x.w.from, x.w.to)}占了 ${n(x.t.n)} 次補貨中的 ${pc(x.w.share)}；上午 8 點到中午 12 點占 ${pc(hourShare(x.t.byHour, 8, 12))}。`)}</b>,
    busiestHour: (count: number) => `最忙的單一小時補貨 ${n(count)} 次`,
    morning: "上午 8 點到中午 12 點",
    evening: "下午 5 點以後，晚上也算數",
    night: "午夜到清晨 6 點",
    tooFew: (x: RTView) => <b>{zs(`天數還不夠，${x.t.n > 0 ? "" : "目前"}說不出通常幾點：自 ${longYmdZh(x.t.since)}起，${x.t.days} 天內確認補貨 ${n(x.t.n)} 次。`)}</b>,
    tooFewKeys: (): Point[] => [
      { text: <>寫出「通常幾點」的門檻：<b className="text-ink">{PATTERN_MIN} 次補貨、分布在 {PATTERN_MIN_DAYS} 個不同的日子</b></> },
      { text: <>一波連補十次是一次事件，不是習慣</>, no: true },
      { text: <>每多一天資料，本頁就自動更新</>, step: true },
    ],
    hourCaption: (x: RTView) => zs(`${C(x.c)} ${n(x.t.n)} 次 iPhone Duo 補貨，依門市當地小時，${ymdZh(x.t.since, false)}至今天`),
    hourHead: ["當地小時", "補貨", "占比"],
    morningKeys: (x: RTView): Point[] => [
      { text: <>上午的高峰<b className="text-ink">和開門時間無關</b>{x.us ? "（美國多數 Apple Store 上午 10 點開門）" : ""}</> },
      { text: <>Apple 在<b className="text-ink">線上</b>釋出門市取貨的庫存，比開門還早</> },
      { text: <>手動盯？平日上午守住<b className="text-ink">{hrange(x.w.from, x.w.to)}</b></>, step: true },
      { text: <><Link href={x.alert}>通知</Link>負責<b className="text-ink">剩下的 22 小時</b>，那段時間沒人在看</>, step: true },
    ],
    storeChartKeys: (x: RTView): Point[] => [{ text: <>每家門市頁面都用自己的時區畫出自己的時段（<Link href={x.storesHref}>{x.us ? "美國各州 Apple Store" : `${C(x.c)}的門市`}</Link>），所以地區 9 點才是高峰時，你能找出 8 點就補貨的那家</>, step: true }],

    dayLead: (x: RTView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>{zs(`目前唯一追蹤的一天（${ymdZh(t.daily[t.daily.length - 1]?.date ?? t.since)}），確認補貨 ${n(t.n)} 次${one ? "" : `，分布在 ${t.stores} 家門市`}。`)}</b>
      ) : t.n > 0 ? (
        <b>{zs(`${t.days === tracked ? `追蹤的 ${t.days} 天全部` : `自 ${longYmdZh(t.since)}起的 ${tracked} 天中有 ${t.days} 天`}都有確認過的補貨${t.peakWeekday != null ? `；星期之中以${weekdayZh(t.peakWeekday)}最多` : ""}。`)}</b>
      ) : (
        <b>{zs(`自 ${longYmdZh(t.since)}起，${C(x.c)}確認的補貨是零。`)}</b>
      );
    },
    daysTracked: "追蹤的天數中有補貨的天數",
    busiestDay: (x: RTView, day: DayRow) => `最多的一天，${ymdZh(day.date)}${x.one ? "" : `，分布在 ${day.stores} 家門市`}`,
    busiestDayNone: "最多的一天",
    drop: (x: RTView, drop: { at: string; restocks: number }) => `家門市在同一個半小時內補貨，${zoneStamp(drop.at, x.c)}（${n(drop.restocks)} 個規格）：一次全國性的釋出`,
    weekend: (x: RTView) => `落在週末（${n(x.weekend)} 次補貨）`,
    dayCaption: (x: RTView) => zs(`${C(x.c)} iPhone Duo 每日補貨${x.t.reports.length ? "；標示「回報」的列，來自其他追蹤網站在我們開始追蹤前公布的觀察，只為了完整時間線" : ""}`),
    dayHead: { date: "日期", restocks: "補貨", stores: "門市", busiest: "最忙時段", source: "來源" },
    soFar: " · 到目前",
    reportedBy: (names: string[]) => <>依 {names.join("／")}</>,
    dayKeys: (x: RTView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{ymdZh(launch)}</b>：上市日，第一批貨出給線上訂單</> },
      { text: <><b className="text-ink">{ymdZh(resumed)}</b>：門市取貨恢復{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">回報</b>列是 {x.reportNames.join(" 和 ")} 的上市週觀察，所有計數都不含它們</> }
        : { text: <>RestockWire 記錄{C(x.c)}各門市的起點：<b className="text-ink">{longYmdZh(x.t.since)}</b></> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>要說哪個星期最忙，需要 <b className="text-ink">{WEEKDAY_MIN_SPAN} 天</b>資料（目前 {x.tracked} 天）</>, no: true }] : []),
      { text: <>留意<b className="text-ink">門市</b>那一欄：補貨分散到越多門市，你的機會越好</>, step: true },
    ],

    whereLead: (x: RTView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{zs(`${hit[0].name}：${ymdZh(x.t.since, false)}起，${hit[0].storesTotal} 家門市中 ${hit[0].stores} 家補貨 ${n(hit[0].restocks)} 次${hit[1] ? `，其次是${hit[1].name}（${n(hit[1].restocks)} 次）` : ""}${hit[2] ? `與${hit[2].name}（${n(hit[2].restocks)} 次）` : ""}；${total} 個${rtRegion(x)}中有 ${hit.length} 個出現過補貨${total - hit.length > 0 ? `，${total - hit.length} 個還沒有` : ""}。`)}</b>
    ),
    whereNone: (x: RTView) => <b>{zs(`${C(x.c)}目前沒有任何${rtRegion(x)}有確認的補貨；第一次補貨出現，表格就開始。`)}</b>,
    regionCaption: (x: RTView) => zs(`${C(x.c)}各${rtRegion(x)}的 iPhone Duo 補貨（已確認），${ymdZh(x.t.since, false)}至今天`),
    regionHead: (x: RTView) => [rtRegion(x), "補貨", "補過貨的門市", "最新補貨（當地時間）"],
    ofN: (a: number, b: number) => <>{b} 家中 {a} 家</>,
    storesCaption: (x: RTView) => zs(`${C(x.c)} iPhone Duo 補貨最多的門市，${ymdZh(x.t.since, false)}至今天`),
    storesHead: ["門市", "補貨", "天數", "通常時段", "最新（當地時間）"],
    swaps: (x: RTView) => [
      { no: "追著榜首的門市跑，不管多遠", yes: `${x.pattern ? hh(x.w.from) : "上午"}前後一小時內到得了的兩三家門市`, why: "到不了的補貨對你沒用；再忙的門市，一天裡也只有幾分鐘不是「無法取貨」。" },
      { no: "把注押在一家門市", yes: "幾家都設通知，誰先響就往誰跑", why: "次數表只用來決定先往你的哪家門市跑。" },
    ],
    nearMe: "我附近的 Duo 現貨，即時",

    configLead: (x: RTView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{zs(`${top.label}居首：${n(x.t.n)} 次補貨中占 ${n(top.restocks)} 次（${pc(top.restocks / x.t.n)}）${rarest ? `；墊底的 ${rarest.label} 只有 ${n(rarest.restocks)} 次` : ""}。`)}</b>
    ),
    mostRestocked: (config: string) => zs(`${config} 補貨次數比任何規格都多`),
    versus: (a: string, bCount: number, b: string) => zs(`${a} 補貨次數，${b} 為 ${n(bCount)} 次`),
    restocksOf: (a: string) => zs(`${a} 補貨次數`),
    byStorage: "依容量",
    byColour: "依顏色",
    configNone: (x: RTView) => <b>{zs(`${C(x.c)}${x.t.n > 0 ? "" : "目前"}沒有任何規格有確認的補貨；八款規格全部先列好，第一次補貨就有自己的一列。`)}</b>,
    configCaption: (x: RTView) => zs(`${C(x.c)}各規格的 iPhone Duo 補貨（已確認），${ymdZh(x.t.since, false)}至今天`),
    configHead: ["規格", "補貨", "占比", "最新補貨（當地時間）"],
    configKeys: (x: RTView): Point[] => [
      { text: <>選規格<b className="text-ink">比選門市更重要</b></> },
      x.storageRatio != null
        ? { text: <>退一步選最常補貨的容量，機會大約是下一個容量的 <b className="text-ink">{x.storageRatio} 倍</b></> }
        : { text: <>退一步選最常補貨的容量，機會會<b className="text-ink">大幅</b>提高</> },
      { text: <><b className="text-ink">2TB</b> 比較適合下單宅配，然後等</>, no: true },
      { text: <>價格與即時現貨：<Link href="/iphone-duo-most-restocked-stores">哪款 iPhone Duo 最常補貨？</Link></>, step: true },
    ],

    howLongLead: (x: RTView, sell: SelloutFacts) => <b>{zs(`${sell.medianSec} 秒：${C(x.c)} ${n(sell.n)} 次售完補貨的中位壽命；${pc(sell.within2min)} 在 2 分鐘內沒了，${pc(sell.within20min)} 在 20 分鐘內。`)}</b>,
    secUnit: "秒",
    medianListing: "在架時間中位數：從上架到消失",
    within2: "2 分鐘內沒了",
    within20: "20 分鐘內沒了",
    fastest: "紀錄中最快的賣完",
    howLongNone: (x: RTView) => <b>{zs(`${C(x.c)}售完的補貨${x.t.n > 0 ? "" : "目前"}還太少，無法量測；這些數字滿 10 次才開始，完整數據請看美國頁面。`)}</b>,
    howLongKeys: (x: RTView): Point[] => [
      { text: <>兩分鐘是留給<b className="text-ink">通知</b>的時間，不是留給你在 apple.com 按重新整理的</> },
      { text: <>本頁其他每個數字，都是從這個數字推出來的</> },
      { text: <>每次補貨與它撐了幾秒，依規格與{rtRegion(x)}：<Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo 一補貨多久被搶光？</Link></>, step: true },
    ],
    measured: "每個數字都從「第一次看到該規格上架」的檢查，算到「看到它消失」的檢查，所以是上限：實際壽命更短。",

    unavailableLead: (x: RTView) => <b>{zs(`補貨是一閃而過，不是一種狀態：${x.one ? "一家門市" : `${n(x.stores)} 家門市`} × ${x.configs} 種規格，${C(x.c)}共有 ${n(x.pairs)} 個可能的上架組合，而此刻只有 ${x.duoNow} 家門市上架任何一款 iPhone Duo。`)}</b>,
    pairs: "可能的「門市 × 規格」上架組合",
    listingNow: "現在開放 iPhone Duo 門市取貨",
    goneIn2: "的補貨在兩分鐘內結束",
    last24: "近 24 小時已確認補貨",
    unavailableKeys: (x: RTView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>過去 24 小時：{zs(`${C(x.c)} ${x.recent.stores} 家門市`)}<b className="text-ink">確認補貨 {n(x.recent.restocks)} 次</b></> }
        : today > 0
          ? { text: <>今天：{C(x.c)}<b className="text-ink">確認補貨 {n(today)} 次</b></> }
          : { text: <>上方的每日表格，列出的是確實發生過的補貨</> },
      { text: <>每一次在 apple.com 上都只出現<b className="text-ink">一兩分鐘</b></> },
      { text: <>上市第四天或第十四天看到「每家都無法取貨」，<b className="text-ink">不代表</b> Apple 停了</>, no: true },
    ],
    unavailableLinks: { explained: "「目前無法取貨」說明", howToGet: "一步步買到 iPhone Duo" },

    redditLead: (x: RTView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> 和 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> 上的建議多半很誠懇，但只根據一家門市，而且隔天就過時；以下是最常出現的四種說法，拿{zs(`${C(x.c)} ${n(x.t.n)} 次確認的補貨來驗證。`)}</b>,
    redditCaption: "Reddit 上常見的 iPhone Duo 補貨說法，以 RestockWire 確認的補貨驗證",
    redditHead: ["說法", "紀錄怎麼說"],
    claims: (x: RTView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「門市都在半夜補，凌晨 3 點上去看就對了。」", answer: t.n > 0 ? <>{pc(hourShare(t.byHour, 0, 6))} 的補貨落在當地時間午夜到清晨 6 點，相較之下 {pc(w.share)} 落在{hrange(w.from, w.to)}。</> : "目前還沒有紀錄可以驗證。" },
        { claim: "「Apple 只在某一個星期幾補貨。」", answer: t.n > 0 ? (t.peakWeekday != null ? <>目前{weekdayZh(t.peakWeekday)}居首（{n(t.n)} 次中的 {n(t.byWeekday[t.peakWeekday])} 次），但 {tracked} 天中有 {t.days} 天都有補貨。</> : <>追蹤的 {tracked} 天中有 {t.days} 天有補貨{t.days === tracked ? "，沒有一天空白" : ""}；資料滿 {WEEKDAY_MIN_SPAN} 天我們才說哪一天最忙。</>) : "目前還沒有紀錄可以驗證。" },
        { claim: "「打電話問門市貨車什麼時候到。」", answer: "Apple 沒有公布的補貨時間表；門市取貨庫存是線上釋出的，門市和所有人同一刻才看到。" },
        { claim: "「寫著無法取貨，代表再也不會有貨。」", answer: recent.restocks > 0 ? <>過去 24 小時 {recent.stores} 家門市確認補貨 {n(recent.restocks)} 次，證明並非如此，而且每一次都在幾分鐘內變回「無法取貨」。</> : t.n > 0 ? <>{zs(`${ymdZh(t.since, false)}起確認的 ${n(t.n)} 次補貨證明並非如此，而且每一次都在幾分鐘內變回「無法取貨」。`)}</> : "目前還沒有紀錄可以驗證。" },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>沒有<b className="text-ink">數據</b>時，傳言就會補上空缺；這頁就是數據，看了不用錢</> },
      { text: <>Reddit 說對了一件事：<b className="text-ink">結帳準備</b>，先登入、設好 Apple Pay（<Link href="/iphone-duo-restock-checkout-guide">20 秒結帳流程</Link>）</> },
    ],

    methodLead: <b>一次補貨 = 某個規格出現在 apple.com 某家原本沒有上架的門市，可供門市取貨，並經兩次相符的檢查確認。</b>,
    methodKeys: (x: RTView): Point[] => [
      { text: <>有通知的門市：每 <b className="text-ink">5 秒</b>；{zs(x.one ? `${C(x.c)}唯一的 Apple 直營店` : `${C(x.c)}每家 Apple 直營店`)}：每 <b className="text-ink">15 秒</b></> },
      { text: <>其他追蹤網站公布的間隔：<b className="text-ink">8 秒到 15 分鐘</b>；比較時只用對方自己公布的數字</> },
      { text: <>第一次出現的「有貨」會在<b className="text-ink">大約一秒後</b>再查一次，才算數</> },
      { text: <>上架消失，會在<b className="text-ink">下一輪</b>確認</> },
      { text: <>某家門市第一次被看到、請求失敗、逾時：<b className="text-ink">一律不</b>當成補貨，也不當成「沒貨」</>, no: true },
      { text: <>所有時間與日期都用各門市的<b className="text-ink">當地時間</b>；「一波」指不同時區落在同一個半小時的補貨</> },
      { text: <>第三方追蹤站的通報{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}有自己標示的列，<b className="text-ink">不計入任何總數</b></> },
      { text: <>這些表格大約每五分鐘更新；<Link href={x.logHref}>補貨紀錄</Link>是即時的</>, step: true },
    ],
    quote: "引用本頁：這裡的任何數字都歡迎引用，請附上連結。RestockWire 獨立於 Apple，讀取的是任何人在 apple.com 都看得到的門市取貨供應狀況，只是讀得勤得多。",
    alertIn: (x: RTView) => <>{zs(x.one ? "取得 iPhone Duo 通知" : `取得${C(x.c)}的 iPhone Duo 通知`)}</>,

    related: "更多 iPhone Duo 問題",
    sameData: "建立在同一份紀錄上",
    questions: {
      sellOut: "一次補貨能撐多久？",
      alerts: "最快得知補貨的方法",
      howToGet: "實際上怎麼買到",
      whichConfig: "最常補貨的規格",
      nearMe: "我附近的即時現貨",
      unavailable: "「無法取貨」說明",
    },
    otherCountries: ((us: boolean): string => (us ? "其他國家的本頁" : "更多國家／地區")) as Dict["views"]["restockTimes"]["otherCountries"],
    faqTitle: "常見問題",
  },
};
