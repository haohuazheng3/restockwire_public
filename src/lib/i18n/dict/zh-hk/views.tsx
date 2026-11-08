/**
 * 繁體中文（香港）: views — product × place pages, the restock log, the live map, the iPhone Duo restock-times page
 * and the store index. `c: Country` is English data: named here with cn(); Store / Place objects are named with
 * places.ts; English product names get Apple's Chinese colour names (zhCfg). Only 15 s and 5 s intervals; no refunds.
 */
import type { ReactNode } from "react";
import type { Dict } from "../en";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, stateCodeOf, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, listWords, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { SPEED } from "@/lib/plans";
import { distance, price } from "@/lib/i18n/format";
import { cityLabel, colorLabel, regionLabel } from "@/lib/i18n/places";
import type { RestockTimesMeta, RestockTimesView, RestockTimesPlace } from "../en/views";
import { HK_TITLE, L, WEEK, apple, city, cityNoun, cn, cnOf, dayFromEn, fitW, hr, hrFromEn, longYmd, n, rn, rng, shop, storeHead, taxNoteZh, ymd, zhCfg, zhPlace, zoneStampZh } from "./common";

const lw = (items: string[], max = 6) => listWords(items, max, L);
const ccOf = (p: { country?: CountryCode }): CountryCode => p.country ?? "us";
/** A place of the product tree in Chinese: "香港", "尖沙咀", "Apple Canton Road（廣東道）". */
function placeZh(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return cn(cc);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return apple(place.store!);
}
const dist = (place: Place, miles: number) => distance(L, ccOf(place), miles);

/** Whole-percent shares; under half a percent "<1%". */
const pct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
const regionWordOf = (x: { us: boolean; c: Country }) => (x.us ? "州份" : x.c.regionNoun ? rn(x.c) : "區域");
const yet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : "暫時");

/* ---------------------------------------------------------------- product × place */

function productTitle(product: Product, place: Place, inStock: number): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const short = zhCfg(product.short);
  const k = place.stores.length;
  if (place.level === "country" && cc !== "us") return fitW([...(inStock > 0 ? [`${name} ${cn(cc)}現貨：${n(inStock)} 間 Apple Store 有得取`] : []), `${name} ${cn(cc)}現貨：Apple Store 即時取貨`, `${short} ${cn(cc)}現貨（店內取貨）`, `${short} 店內取貨現貨`]);
  if (place.level === "country") return fitW([...(inStock > 0 ? [`${name} 現貨：此刻 ${n(inStock)} 間 Apple Store 有得取`] : []), `${name} 現貨：美國 Apple Store 逐間看`, `${name} 現貨：店內取貨即時看`, `${short} 店內取貨現貨`]);
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "此刻有得取" : "現貨與補貨鐘點";
    const head = HK_TITLE[s.storeNumber]?.[0] ?? apple(s);
    return fitW([`${name}｜${head}：${now}`, `${short}｜${head}：${inStock > 0 ? "此刻有貨" : "現貨"}`, `${short} 現貨｜${head}`, `${short} 現貨｜${shop(s)}`, `${shop(s)}：${short}`]);
  }
  const w = placeZh(place);
  return fitW([`${name} ${w}現貨：${n(inStock)}/${n(k)} 間分店有得取`, `${name} ${w}現貨：店內取貨即時看`, `${short} ${w}此刻有貨嗎？`, `${w}：${short}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const week = `近 7 日補貨 ${n(stats.week)} 次`;
  if (place.level === "store") {
    const s = place.store!;
    const loc = cc === "us" ? `${s.city} ${stateCodeOf(s)}` : city(s);
    const head = HK_TITLE[s.storeNumber] ? storeHead(s) : `${apple(s)} · ${loc}`;
    return fitW([
      `${name}｜${head}：${inStock > 0 ? "上一輪讀取可取貨" : "上一輪讀取未上架"}；${week}。附本店補貨鐘點、每次上架多久，以及下一次補貨的手機提醒。`,
      `${name}｜${apple(s)}：${inStock > 0 ? "此刻有貨" : "此刻無貨"}；${week}。補貨鐘點與提醒。`,
    ], 155);
  }
  const where = place.level === "country" ? `${cn(cc)} Apple Store` : `${placeZh(place)} Apple Store`;
  return fitW([
    `${name}：此刻 ${n(inStock)}/${n(place.stores.length)} 間${where}可取貨；${week}。每間分店逐一列出，附補貨鐘點；下一次補貨，手機提醒幾秒內到。`,
    `${name}：${n(inStock)}/${n(place.stores.length)} 間${where}此刻有貨；${week}。逐店現貨、補貨鐘點與提醒。`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = placeZh(place);
  const name = zhCfg(product.name);
  const near = nearest ? `。約 ${dist(place, nearest.distance)} 外的${nearest.name.includes(nearest.city) ? "" : `${nearest.city} `} Apple ${nearest.name}倒有上架` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${name} 此刻在${at}有得取嗎？`,
      a: l && l.available.length > 0
        ? `有。上一輪讀取可取貨${product.parts.length > 1 ? `：${lw(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}` : ""}。`
        : `上一輪讀取未見上架${near}。`,
    });
  } else {
    out.push({
      q: `${name} 此刻在${at}哪幾間 Apple Store 有貨？`,
      a: inStock.length === 0 ? `上一輪讀取：零間${near}。` : `上一輪讀取：${n(inStock.length)} 間，包括${lw(inStock.map((l) => apple(l.store)), 4)}。`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${at}隔多久補一次 ${name}？`,
    a: stats.month === 0 ? `最近 ${n(stats.days)} 日：${at}零確認補貨。` : `最近 ${n(stats.days)} 日確認 ${n(stats.month)} 次，近 7 日佔 ${n(stats.week)} 次${peak ? `；多在當地${peak.hour}前後` : ""}。`,
  });
  if (stats.medianMs != null) out.push({ q: `${name} 在${at}補貨後多久賣光？`, a: `${fmtDuration(stats.medianMs, L)}左右（中位數）便再次清貨。` });
  return out;
}

function priceLabel(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => price(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`;
}

/* ---------------------------------------------------------------- views */

/** 2026-11-08: a place page (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]) names its region or city where the country page names the country. */
const rtW = (x: { c: Country; place?: RestockTimesPlace }) => (x.place ? x.place.name : cnOf(x.c));
const rtU = (x: { us: boolean; c: Country; place?: RestockTimesPlace }) => (x.place ? (x.place.kind === "region" ? "城市" : "分店") : regionWordOf(x));
export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => cnOf(c),
    liveMap: "存貨地圖",
    restockLog: "補貨快訊",
    alertMe: "設提醒",
    lastDays: (days: number) => <>{n(days)} 日，逐日列出</>,
    since: "2026年11月2日",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cnOf(c)}僅有的一間 Apple Store` : `${n(k)} 間 Apple Store（${cnOf(c)}）`),
    checker: (c: Country) => `${cnOf(c)} iPhone 補貨快訊`,
    appleStoresIn: (c: Country) => `${cnOf(c)} Apple Store`,
    storesWithIt: "間有上架的分店",
    more: "查看更多",
  },

  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${cnOf(c)}哪裏有 ${zhCfg(model)}？店內取貨現貨`,
    h1Place: (model: string, where: string) => `${zhCfg(model)} 現貨：${where}`,
    inStockNow: "此刻在架",
    yes: "在架",
    no: "—",
    pickup: "店內取貨",
    configurations: "配置",
    ofStores: (k: number) => `／${n(k)} 間分店`,
    restocks24h: "補貨（24 小時）",
    restocksHint: (week: number, month: number, days: number) => `近 7 日：${n(week)} 次 · 近 ${n(days)} 日：${n(month)} 次`,
    sellOuts: (days: number) => `售罄（${n(days)} 日）`,
    stays: (ms: number) => `約維持 ${fmtDuration(ms, L)}`,
    noPairs: "暫未有可配對的售罄",
    lastRestock: "最新補貨",
    noneYet: "暫時未有",
    thisConfig: "這款配置",
    inDays: (days: number) => `最近 ${n(days)} 日`,
    notInStockNow: "現時沒有上架",
    configsInStock: (k: number, of: number) => <span>{n(of)} 款中 <b className="text-ink">{n(k)}</b> 款上架</span>,
    inStockAt: (k: number, of: number) => <span>{n(of)} 間分店中 <b className="text-ink">{n(k)}</b> 間上架</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{live}讀取 · {p}{tax}</>,
    taxNote: (c: Country) => taxNoteZh(c),
    beforeTax: "不含稅",
    buyOnApple: "去 apple.com 買",
    allStoresIn: (c: Country) => `${cnOf(c)}分店一覽`,
    everyIphoneHere: "本店全線 iPhone",
    everyIphone: (where: string) => `全線 iPhone：${where}`,
    panel: (model: string, where: string | null) => `${zhCfg(model)}${where ? ` · ${where}` : ""}：第一步揀配置，第二步揀分店`,
    unitConfigs: "款配置",
    unitStores: "間分店",
    otherConfigsHere: "本頁以外的配置",
    byStorageColor: "容量 × 顏色",
    nearestStores: "就近分店",
    closest: (link: ReactNode, d: string) => <>最近有上架的分店：{link} · {d}</>,
    storeCity: (store: string, c: string) => <>{store}，{c}</>,
    mostRecentlyInStock: "最近一次上架",
    storesWithItNow: "現時上架的分店",
    storesIn: (where: string) => `分店：${where}`,
    colStatus: "現況",
    colConfigs: "上架款式",
    noStoreHasIt: "現時沒有分店上架。",
    noStoreHereHasIt: "這一區現時沒有分店上架。",
    moreStores: (k: number) => <>另有 {n(k)} 間分店，下面按地區排列。</>,
    byRegion: (c: Country) => `逐個${rn(c)}`,
    byCity: "逐區",
    nearbyStores: "鄰近分店",
    latestChanges: "最新變動",
    nothingLogged: "記錄暫時仍是空的。",
    whenRestocks: "通常幾點補貨",
    howFast: "補貨維持多久",
    restocksByConfig: "哪些款式會補貨",
    faqTitleCountry: (model: string, c: Country) => `${cnOf(c)}買 ${zhCfg(model)}：讀者常問`,
    faqTitle: (model: string, where: string) => `${zhCfg(model)}｜${where}：讀者常問`,
    buySource: (model: string, c: Country) => `${zhCfg(model)} 購買頁 · Apple ${cnOf(c)}`,
    nearby: "附近",
    otherRegions: (c: Country) => `其餘${rn(c)}`,
    elsewhereIn: (region: string) => `${region}較遠的分店`,
    everyAppleStoreIn: (c: Country) => `${cnOf(c)} Apple Store 完整列表`,
    across: (model: string, c: Country) => (c.cc === "hk" ? `全港的 ${zhCfg(model)}` : `${cnOf(c)}各地的 ${zhCfg(model)}`),
    itemList: (model: string, where: string) => `${zhCfg(model)} 分店名單：${where}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `${model}：${cnOf(c)}此刻零間 Apple Store 可取貨。「最近」於是變成「哪間先補貨」——每間你會去的分店各設一個提醒，誰先上架，推送幾秒後便到。`
        : `${model}：此刻 ${n(inStock)}/${n(k)} 間分店可取貨——${lw(have.slice(0, 5).map((l) => `${l.store}${l.store.includes(l.city) ? "" : `（${l.city}）`} ${n(l.configs)} 款`), 5)}。`,
    nearHead: (c: Country) => [rn(c), "可取貨分店數"],
    nearCaption: (c: Country, model: string) => `${model} 取貨現貨，逐個${rn(c)}（上一輪讀取）`,
    nearMe: (_c: Country, model: string, alert: string) => `想按遠近排列？在本頁提醒設定按「附近分店」：分店會以估算行車距離（公里）由近至遠排好，每間附導航連結。[設 ${model} 提醒](${alert})。`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      return {
        price: { q: `${cnOf(c)}的 ${model} 售價？`, a: `${money(low)}–${money(high)}，按容量而定（apple.com 標價，${taxNoteZh(c)}）。` },
        reserve: { q: `${model} 在${cnOf(c)}可以先留貨再取嗎？`, a: `不可以。只有分店已上架時，在 apple.com 下單並揀店內取貨，Apple 才按你揀的時段留貨。${inStock === 0 ? "此刻零間上架，要搶先只能靠提醒。" : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${cnOf(c)} iPhone 補貨快訊：${k === 1 ? "Apple Store" : `${n(k)} 間 Apple Store`}即時更新`,
    metaDescription: (c: Country, k: number) => `iPhone Duo、18 Pro、Pro Max 一補貨就上快訊：${cnOf(c)}${k === 1 ? " Apple Store " : "各 Apple Store "}經兩次讀取確認的店內取貨補貨，列明時間、配置、分店位置。`,
    h1: (c: Country) => `補貨快訊：${cnOf(c)} iPhone`,
    summary: (day: number, week: number, model?: string, region?: string) => <>24 小時：{n(day)} 次 · 7 日：{n(week)} 次{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時間已換算成你的時區。</>,
    allModels: "全部機型",
    restocks: "只看補貨",
    withSoldOut: "連售罄一併看",
    regionLabel: (c: Country) => rn(c),
    allRegions: (c: Country) => `不限${rn(c)}`,
    filter: "篩選",
    page: (k: number) => <>頁 {n(k)}</>,
    newer: "← 新一頁",
    older: "舊一頁 →",
    getAlerts: "設提醒",
    byPlace: "補貨快訊：按地點",
    byRegion: (c: Country) => `逐個${rn(c)}`,
    datasetName: (c: Country) => `RestockWire 補貨快訊：${cnOf(c)} Apple Store iPhone 店內取貨`,
    datasetDescription: (c: Country) => `每一行是一次已確認的補貨或售罄（分店、配置、時間），範圍是${c.cc === "us" ? "美國 269 間 Apple Store" : `${cnOf(c)}各 Apple Store`}的 iPhone Duo、iPhone 18 Pro、iPhone 18 Pro Max。讀取節奏：每間分店 15 秒，設有提醒的分店 5 秒；apple.com 連續兩次回應一致才入帳。`,
    datasetMeasured: ["分店（Apple Store）", "機型、容量、顏色", "補貨時刻", "售罄時刻"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `iPhone Duo 存貨地圖：${cnOf(c)}${k === 1 ? " Apple Store" : "各 Apple Store"}即時`,
    metaDescription: (c: Country, k: number) => `一張地圖看${cnOf(c)}${k === 1 ? "的 Apple Store" : ` ${n(k)} 間 Apple Store`}：iPhone Duo、18 Pro、Pro Max 哪裏此刻可店內取貨，可按容量、顏色篩選，數據每 15 秒更新。`,
    country: (c: Country) => ({ name: cnOf(c), inName: cnOf(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "分店一覽",
    storeCity: (store: string, c: string) => `${store}（${c}）`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `，以${rn(c)}和城市分組` : cities > 1 ? `，以${cityNoun(c.cc)}分組` : "";
      return `${cnOf(c)} ${n(k)} 間 Apple Store 一覽${by}。此刻 iPhone Duo 在 ${n(duo)} 間、Pro Max 在 ${n(max)} 間可店內取貨，18 Pro 亦有列出。`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `共 ${n(k)} 間，${spread}${top.length ? `。最多的是${top[0].name}（${n(top[0].count)} 間）${top[1] ? `，${top[1].name}次之（${n(top[1].count)} 間）` : ""}` : ""}。`,
    howMany: (c: Country) => <>{cnOf(c)}一共有多少間 Apple Store？</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `iPhone Duo 此刻在${cnOf(c)}哪幾間 Apple Store 有得取？`,
      a: have.length === 0 ? `上一輪讀取：0/${n(k)} 間。一有分店上架，本頁與地圖即時更新——提醒更早一步。` : `上一輪讀取：${n(have.length)}/${n(k)} 間，包括${have.slice(0, 6).map((x) => apple(x)).join("、")}${have.length > 6 ? "等" : ""}。`,
    }),
    faq: (ctx: FaqContext) => {
      const cc = ctx.stores[0]?.country ?? "us";
      const peak = ctx.peak ? { hour: hrFromEn(ctx.peak.hour), day: ctx.peak.day ? dayFromEn(ctx.peak.day) : null, total: ctx.peak.total } : ctx.peak;
      return placeFaq({ ...ctx, place: zhPlace(cc, ctx.place), peak, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L);
    },
    duoBlock: (alert: string) => `最快買到的方法：替你會去的分店設提醒（[設 iPhone Duo 提醒](${alert})）。一間分店 × 一款配置 = 一個提醒；分店一上架，幾秒後手機便收到。`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `${cnOf(c)}共 **${n(k)} 間 Apple Store**，${spread}。此刻店內取貨：iPhone Duo **${n(now.duo)}** 間、iPhone 18 Pro Max **${n(now.max)}** 間、18 Pro **${n(now.pro)}** 間。${tax}`,
    crumb: "Apple Store",
    panel: (c: Country) => `第一步揀手機，第二步剔選${cnOf(c)}你會去的分店`,
    matrixLabel: "分店現貨總表",
    matrixH2: (c: Country) => <>現貨總表：{cnOf(c)}分店 × 機型</>,
    matrixHint: "格內數字＝在架款式／監察款式。",
    topCaption: (c: Country) => <>{rn(c)}排名：Apple Store 數目（來源：Apple 零售店一覽，亦即我們的追蹤範圍）</>,
    regionHead: (c: Country) => rn(c),
    colStores: "Apple Store",
    colCities: "城市數",
    locationsBy: (c: Country) => `分店位置：逐個${rn(c)}`,
    locationsIn: (c: Country) => `${cnOf(c)} Apple Store 地址一覽`,
    storeCount: (k: number) => <>分店 {n(k)} 間</>,
    storeCountAll: (k: number) => <>合共 {n(k)} 間</>,
    whenRestock: (c: Country) => <>{cnOf(c)}的 Apple Store 通常幾點補貨？</>,
    howFast: (c: Country) => <>{cnOf(c)}的補貨多久便賣光？</>,
    faqTitle: (c: Country) => `關於${cnOf(c)} Apple Store 的提問`,
    getApp: "安裝 App",
    howItWorks: "提醒如何運作",
    pricing: "方案價錢",
  },

  restockTimes: {
    fmt: {
      n,
      pct,
      date: (d: string, weekday = true) => ymd(d, weekday),
      longDate: longYmd,
      zoneStamp: (iso: string, c: Country) => zoneStampZh(iso, c.cc),
      local: (iso: string, store: Pick<Store, "storeNumber" | "country" | "timeZone" | "state">) => localStamp(iso, store, L),
      hour: (h: number) => hr(h),
      range: (from: number, to: number) => rng(from, to),
      weekday: (d: number) => WEEK[d],
      store: (s: Store) => apple(s),
      storeWithPlace: (s: Store) => { const a = apple(s); const c = city(s); return a.includes(c) ? a : `${a} · ${c}`; },
    },
    title: (c: Country, place?: RestockTimesPlace) => `Apple 幾點在${place?.name ?? cnOf(c)}補貨 iPhone Duo？`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const rw = x.place ? (x.place.kind === "region" ? "城市" : "分店") : c.cc === "us" ? "州" : c.regionNoun ? rn(c) : "分店";
      /** "按鐘點、日子、分店及款式" from the parts that apply. */
      const by = (...parts: (string | null)[]) => { const p = parts.filter((x): x is string => Boolean(x)); return `按${p.slice(0, -1).join("、")}及${p[p.length - 1]}`; };
      const since = ymd(t.since, false);
      const w2 = rtW(x);
      return t.n > 0 && pattern
        ? fitW([
          `自${since}起，${w2} Apple Store 補貨 iPhone Duo ${n(t.n)} 次：${pct(w.share)} 落在當地時間${rng(w.from, w.to)}${t.sellout ? `，${pct(t.sellout.within2min)} 在 2 分鐘內售罄` : ""}。${by("鐘點", "日子", rw === "分店" ? null : rw, "分店", "款式")}列表。`,
          `自${since}起，${w2} Apple Store 補貨 iPhone Duo ${n(t.n)} 次：${pct(w.share)} 落在當地時間${rng(w.from, w.to)}。${by("鐘點", "日子", rw, "款式")}列表。`,
          `${w2} iPhone Duo 幾點補貨？${since}至今 ${n(t.n)} 次，${by("鐘點", "日子", rw, "款式")}拆解。`,
        ], 158)
        : t.n > 0
          ? fitW([
            `自${since}起，${w2} Apple Store 已確認的 iPhone Duo 補貨共 ${n(t.n)} 次，來自每 ${SPEED.checkSec} 秒一次的檢查：${by("當地鐘點", "日子", rw === "分店" ? null : rw, "分店", "款式")}統計，並列出每次維持多久。`,
            `${w2} iPhone Duo 幾點補貨？${since}至今確認 ${n(t.n)} 次，${by("鐘點", "日子", rw, "款式")}拆解。`,
          ], 158)
          : `${w2} Apple Store 的 iPhone Duo 補貨時間，逐小時、逐日、按分店及款式統計；RestockWire 自${longYmd(t.since)}起每 ${SPEED.checkSec} 秒讀取每間分店一次。`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `Apple 幾點在${rtW(x)}補貨 iPhone Duo？`
      : x.t.n > 0
        ? `Apple 幾點在${rtW(x)}補貨 iPhone Duo？${x.pattern ? `最常在當地時間${rng(x.w.from, x.w.to)}` : "我們自己的檢查，逐小時列出"}`
        : `Apple 有在${rtW(x)}補貨 iPhone Duo 嗎？暫時未有，以下是我們留意的數據`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = rtW(x);
      const who = one ? `${where}的 Apple Store` : `${where}各間 Apple Store`;
      return t.unknown ? (
        <>補貨記錄暫時未能讀取。{where}的分店仍然每 {SPEED.checkSec} 秒讀取一次，本頁下次載入時數字便會回來。</>
      ) : t.n > 0 && pattern ? (
        <>
          自{longYmd(t.since)}起，RestockWire 在{who}確認的<b className="text-ink">{n(t.n)} 次 iPhone Duo 補貨中，有 {pct(w.share)}</b>落在<b className="text-ink">分店當地時間{rng(w.from, w.to)}</b>{x.sell ? <>；一次典型的補貨約 {Math.round(x.sell.medianSec / 5) * 5} 秒便售罄</> : null}。<b className="text-ink">補貨仍在持續</b>{tracked > 1 ? <>：追蹤的 {n(tracked)} 日之中有 {n(t.days)} 日有補貨</> : <>（目前只追蹤了一日）</>}。
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">有。</b><b className="text-ink">自{longYmd(t.since)}起補貨 iPhone Duo {n(t.n)} 次</b>，地點是{who}{tracked > 1 ? <>，{n(tracked)} 日之中有 {n(t.days)} 日</> : <>（目前只追蹤了一日）</>}；要累積到 {PATTERN_MIN} 次補貨、分佈在 {PATTERN_MIN_DAYS} 個不同日子，我們才會指出慣常鐘點。
        </>
      ) : (
        <>
          <b className="text-ink">暫時未有。</b>自{longYmd(t.since)}起，RestockWire 每 {SPEED.checkSec} 秒讀取{one ? `${where}的 Apple Store` : `${where}全部 ${n(x.stores)} 間 Apple Store`}一次，仍未確認任何一次 iPhone Duo 店舖取貨補貨。
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `自${ymd(x.t.since, false)}起確認的補貨`,
      window: (x: RestockTimesView) => `落在${rng(x.w.from, x.w.to)}，分店當地時間`,
      days: "有補貨的日子",
      // English infers a literal return type here; the cast keeps the same signature.
      now: ((one: boolean): string => (one ? "間分店此刻上架取貨" : "間分店此刻上架取貨")) as Dict["views"]["restockTimes"]["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `今日暫計（${ymd(today.date)}）${x.one ? "" : `，分佈在 ${n(today.stores)} 間分店`}`,
      weekday: "目前補貨最多的星期",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>最新：<b className="text-ink">{latest.config}</b>{x.one ? null : <>，<Link href={storePath(latest.store)} className="underline underline-offset-2">{apple(latest.store)}</Link></>}，當地時間 {localStamp(latest.at, latest.store, L)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <><b className="text-ink">{WEEK[x.t.peakWeekday]}</b>補貨最多</> }] : []),
      { text: <>Apple <b className="text-ink">沒有官方補貨時間表</b>；這些數字來自我們自己確認的檢查，約每五分鐘更新</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <><b className="text-ink">{n(x.stores)} 間中有 {n(x.duoNow)} 間</b>此刻上架取貨</> },
      { text: <>第一次確認的補貨出現，下面每個表格便由那裏開始</>, step: true },
      { text: <>想看樣本最大的鐘點及星期規律，請看<Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">美國版頁面</Link></>, step: true },
    ],
    setUpAlert: "接收 iPhone Duo 提醒",
    logLive: "補貨快訊（即時）",
    onThisPage: "段落",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "幾點",
      "day-by-day": "逐日",
      where: `逐個${rtU(x)}`,
      configuration: "配置",
      "how-long": "售罄速度",
      unavailable: "「沒有貨」",
      reddit: "Reddit 說法",
      method: "方法",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${rtW(x)}的 iPhone Duo 幾點回來？`,
      "day-by-day": `${rtW(x)}的 iPhone Duo 哪幾日補過貨？`,
      where: `${rtW(x)}哪裏最常補 iPhone Duo？`,
      configuration: `${rtW(x)}哪款 iPhone Duo 容量及顏色補貨最多？`,
      "how-long": `${rtW(x)}一次 iPhone Duo 補貨能維持幾多秒？`,
      unavailable: "為何 apple.com 每間分店都顯示「暫時未能提供」？",
      reddit: "Reddit 上的 iPhone Duo 補貨理論，用記錄來驗證",
      method: "RestockWire 怎樣才算一次補貨？",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = rtW(x);
      const window = rng(w.from, w.to);
      return [
        { q: `${where}的 iPhone Duo 一般在一日裏哪個時段補貨？`, a: t.n > 0 && pattern
          ? `自${longYmd(t.since)}起確認的 ${n(t.n)} 次補貨中，分店當地時間${window}佔 ${pct(w.share)}，上午 8 點至中午 12 點佔 ${pct(hourShare(t.byHour, 8, 12))}。Apple 沒有官方時間表；這是 RestockWire 觀察到的規律，約每五分鐘更新。`
          : `自${longYmd(t.since)}起，RestockWire 在${where}錄得 ${n(t.n)} 次已確認補貨${t.days ? `，分佈在 ${n(t.days)} 日` : ""}，而 Apple 不會公布任何時間表。累積到 ${PATTERN_MIN} 次補貨、分佈在 ${PATTERN_MIN_DAYS} 個不同日子，本頁會自行指出慣常鐘點。` },
        { q: `${us ? "" : `${where}的 `}iPhone Duo 週末也會補貨嗎？`, a: t.n > 0
          ? `${weekend > 0 ? "會" : "暫時未有"}：${n(t.n)} 次補貨中有 ${n(weekend)} 次（${pct(weekend / t.n)}）落在星期六或星期日。${t.peakWeekday != null ? `目前補貨最多的是${WEEK[t.peakWeekday]}。` : `數據要橫跨 ${WEEKDAY_MIN_SPAN} 日，我們才會指出哪一日最多；目前有 ${n(tracked)} 日。`}`
          : `${where}暫時未有週末數據；本頁的逐日表格會隨每次確認的補貨增加。` },
        { q: "應該幾點開始留意 apple.com？", a: t.n > 0 && pattern
          ? `如果手動查，由當地時間${hr(w.from)}起開着 apple.com、揀好店舖提取；這兩小時佔了 ${pct(w.share)} 的補貨。一次典型的補貨${sell ? `中位數 ${n(sell.medianSec)} 秒內便售罄` : "只維持約一分鐘"}，所以每 ${SPEED.fastSec} 秒檢查一次的提醒（[提醒怎樣運作](/iphone-duo-restock-alerts)）勝過重新整理多少次都好。`
          : `${where}的規律仍在成形，這段時間讓提醒替你留意：你揀選的分店會改為每 ${SPEED.fastSec} 秒檢查一次，日夜不停（[提醒怎樣運作](/iphone-duo-restock-alerts)）。` },
        { q: "為何每間 Apple Store 的 iPhone Duo 都「沒有貨」？", a: sell
          ? `因為補貨很短暫：${where}量度到的 ${n(sell.n)} 次售罄補貨中，${pct(sell.within2min)} 在 2 分鐘內售罄，${pct(sell.within20min)} 在 20 分鐘內。此刻 ${n(x.stores)} 間中有 ${n(x.duoNow)} 間上架，所以大部分時間 apple.com 顯示「沒有貨」是實情，即使當日補了幾十次也一樣（[「沒有貨」是甚麼意思](/apple-store-pickup-explained)）。`
          : `取貨現貨每次只出現幾分鐘；此刻${where} ${n(x.stores)} 間分店中有 ${n(x.duoNow)} 間上架（[「沒有貨」是甚麼意思](/apple-store-pickup-explained)）。` },
        { q: "我的 Apple Store 補回 iPhone Duo 時，可以收到通知嗎？", a: `可以：為那間分店設一個提醒，指定容量及顏色，該分店便會改為每 ${SPEED.fastSec} 秒檢查一次；確認補貨後約 ${SPEED.alertSec} 秒，你的手機便知道（[設定提醒](${x.alert})；[運作原理](/how-restock-alerts-work)）。` },
      ];
    },
    sources: {
      applePickup: "Apple：送貨及取貨說明（店舖取貨供應狀況怎樣運作）",
      newsroom: "Apple Newsroom（2026 年 10 月 23 日）：iPhone Duo 在全球 Apple Store 發售",
      macRumors: "MacRumors：iPhone Duo 的 Apple Store 取貨系統在美國及加拿大重新上線（2026 年 10 月 24 日）",
      reports: (tracker: string) => `${tracker}：發售週的 iPhone Duo 補貨報告（對方自己的觀察，分開列出，從不計入）`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${rtW(x)} Apple Store 的 iPhone Duo 店舖取貨補貨時間`,
      description: `自 ${x.t.since} 起${rtW(x)} Apple Store 已確認的 iPhone Duo 店舖取貨補貨（分店、款式、時間），來自 RestockWire 每 ${SPEED.checkSec} 秒讀取每間分店一次；按當地鐘點、日子、${x.place?.kind === "city" ? "" : `${rtU(x)}、`}分店及款式分組。`,
      spatial: `${rtW(x)} Apple Store`,
      measured: ["補貨時刻（以分店當地時間計）", "分店（Apple Store）", "iPhone Duo 容量、顏色", "上架至售罄的秒數"],
      size: `補貨 ${n(x.t.n)} 次，涉及 ${n(x.t.stores)} 間分店`,
    }),
    crumb: "iPhone Duo 補貨鐘點",

    timeLead: (x: RestockTimesView) => <b>分店當地時間{rng(x.w.from, x.w.to)}佔 {n(x.t.n)} 次補貨中的 {pct(x.w.share)}；上午 8 點至中午 12 點佔 {pct(hourShare(x.t.byHour, 8, 12))}。</b>,
    busiestHour: (count: number) => `${n(count)} 次：最旺的一個鐘點`,
    morning: "早上 8 點到中午",
    evening: "下午 5 點以後（包括晚上）",
    night: "凌晨 0–6 點",
    tooFew: (x: RestockTimesView) => <b>日子不夠，{yet(x)}未能指出鐘點：自{longYmd(x.t.since)}起確認補貨 {n(x.t.n)} 次，分佈在 {n(x.t.days)} 日。</b>,
    tooFewKeys: (): Point[] => [
      { text: <>門檻：<b className="text-ink">{PATTERN_MIN} 次補貨，而且橫跨 {PATTERN_MIN_DAYS} 個日子</b>，才定出慣常鐘點</> },
      { text: <>同一刻連補十款，只算一次事件，不算規律</>, no: true },
      { text: <>數據逐日累積，本頁自動重算</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `逐個鐘點：${rtW(x)} iPhone Duo 補貨 ${n(x.t.n)} 次（分店當地時間，${ymd(x.t.since, false)}起）`,
    hourHead: ["鐘點（當地）", "次數", "比例"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>早上的高峰<b className="text-ink">與開門時間無關</b>{x.us ? "（美國大部分 Apple Store 上午 10 點開門）" : ""}</> },
      { text: <>Apple 在<b className="text-ink">網上</b>釋出取貨存貨，早於開門</> },
      { text: <>手動查？平日早上守住 <b className="text-ink">{rng(x.w.from, x.w.to)}</b></>, step: true },
      { text: <><Link href={x.alert}>提醒</Link>負責<b className="text-ink">其餘 22 小時</b>，那段時間沒有人在看</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>每間分店頁都按自己的時區畫出自己的鐘點（<Link href={x.storesHref}>{x.us ? "按州份查看 Apple Store" : `${rtW(x)}的分店`}</Link>），所以同區 9 點才是高峰時，你可以找出 8 點已補貨的那一間</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>目前唯一追蹤的一日（{ymd(t.daily[t.daily.length - 1]?.date ?? t.since)}），確認補貨 {n(t.n)} 次{one ? "" : `，分佈在 ${n(t.stores)} 間分店`}。</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `追蹤的 ${n(t.days)} 日全部` : `自${longYmd(t.since)}起 ${n(tracked)} 日之中有 ${n(t.days)} 日`}至少有一次確認補貨{t.peakWeekday != null ? `；星期之中以${WEEK[t.peakWeekday]}最多` : ""}。</b>
      ) : (
        <b>自{longYmd(t.since)}起，{rtW(x)}已確認的補貨是零。</b>
      );
    },
    daysTracked: "追蹤日子中有補貨的日子",
    busiestDay: (x: RestockTimesView, day: DayRow) => `最多的一日，${ymd(day.date)}${x.one ? "" : `，分佈在 ${n(day.stores)} 間分店`}`,
    busiestDayNone: "最多的一日",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `間分店在同一個半小時內補貨，${zoneStampZh(drop.at, x.c.cc)}（${n(drop.restocks)} 款）：一次${x.c.cc === "hk" ? "全港" : "全國"}性的釋出`,
    weekend: (x: RestockTimesView) => `落在週末（${n(x.weekend)} 次補貨）`,
    dayCaption: (x: RestockTimesView) => `逐日：${rtW(x)} iPhone Duo 補貨${x.t.reports.length ? "。「報告」行是外部追蹤網站在我們開始追蹤前的觀察，只用來補齊時間線" : ""}`,
    dayHead: { date: "日子", restocks: "次數", stores: "店數", busiest: "最旺鐘點", source: "出處" },
    soFar: " · 未完",
    reportedBy: (names: string[]) => <>據 {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{ymd(launch)}</b>：發售日，首批貨送往網上訂單</> },
      { text: <><b className="text-ink">{ymd(resumed)}</b>：店舖取貨恢復{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">報告</b>行是 {x.reportNames.join(" 及 ")} 在發售週的觀察，所有計數都不包括</> }
        : { text: <>RestockWire 對{rtW(x)}每間分店的記錄由 <b className="text-ink">{longYmd(x.t.since)}</b> 開始</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>要指出補貨最多的星期，需要 <b className="text-ink">{WEEKDAY_MIN_SPAN} 日</b>數據（我們目前有 {n(x.tracked)} 日）</>, no: true }] : []),
      { text: <>留意<b className="text-ink">分店</b>一欄：補貨分散到越多分店，你的機會越好</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}：自{ymd(x.t.since, false)}起，{n(hit[0].storesTotal)} 間分店中 {n(hit[0].stores)} 間補貨 {n(hit[0].restocks)} 次{hit[1] ? <>，其次是{hit[1].name}（{n(hit[1].restocks)}）</> : null}{hit[2] ? <>及{hit[2].name}（{n(hit[2].restocks)}）</> : null}；{n(total)} 個{rtU(x)}中有 {n(hit.length)} 個出現過補貨{total - hit.length > 0 ? `，${n(total - hit.length)} 個仍未有` : ""}。</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{rtW(x)}暫時未有任何{rtU(x)}錄得確認補貨；第一次補貨出現，表格便會開始。</b>,
    regionCaption: (x: RestockTimesView) => `${rtW(x)}按${rtU(x)}的 iPhone Duo 補貨（已確認），${ymd(x.t.since, false)}至今日`,
    regionHead: (x: RestockTimesView) => [rtU(x), "補貨", "有補貨的分店", "最新補貨（當地時間）"],
    ofN: (a: number, b: number) => <>{n(a)}/{n(b)} 間</>,
    storesCaption: (x: RestockTimesView) => `分店排行：${rtW(x)} iPhone Duo 補貨次數（${ymd(x.t.since, false)}起）`,
    storesHead: ["分店", "補貨", "日數", "慣常鐘點", "最新（當地時間）"],
    swaps: (x: RestockTimesView) => [
      { no: "追着榜首的分店跑，無論多遠", yes: `${x.pattern ? hr(x.w.from) : "早上"}前後一小時內去得到的兩三間分店`, why: "去不到的補貨對你毫無用處；即使最忙的分店，一日裏也只有幾分鐘不是顯示沒有貨。" },
      { no: "把注押在一間分店", yes: "每間都設提醒，哪間先響就去哪間", why: "次數表只用來決定先去你那幾間之中的哪一間。" },
    ],
    nearMe: "我附近的 Duo 現貨，即時",

    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>{top.label}居首：{n(x.t.n)} 次補貨中佔 {n(top.restocks)} 次（{pct(top.restocks / x.t.n)}）{rarest ? `；最少的 ${rarest.label} 只有 ${n(rarest.restocks)} 次` : ""}。</b>
    ),
    mostRestocked: (config: string) => `${config} 的補貨次數比任何款式都多`,
    versus: (a: string, bCount: number, b: string) => `${a} 的補貨次數，${b} 則為 ${n(bCount)} 次`,
    restocksOf: (a: string) => `${a}：補貨次數`,
    byStorage: "逐個容量",
    byColour: "逐隻顏色",
    configNone: (x: RestockTimesView) => <b>{rtW(x)}{yet(x)}未有任何款式錄得確認補貨；八款配置全部先列出，第一次補貨便有自己的一行。</b>,
    configCaption: (x: RestockTimesView) => `${rtW(x)}按款式的 iPhone Duo 補貨（已確認），${ymd(x.t.since, false)}至今日`,
    configHead: ["款式", "補貨", "佔比", "最新補貨（當地時間）"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>機會大小，<b className="text-ink">配置決定得比分店多</b></> },
      x.storageRatio != null
        ? { text: <>退一步選補貨最多的容量，機會約是下一個容量的 <b className="text-ink">{x.storageRatio}×</b></> }
        : { text: <>退一步選補貨最多的容量，機會<b className="text-ink">大大提高</b></> },
      { text: <><b className="text-ink">2TB</b> 較適合網上訂購送貨，然後等</>, no: true },
      { text: <>價錢及即時現貨：<Link href="/iphone-duo-most-restocked-stores">哪款 iPhone Duo 補貨最多？</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{n(sell.medianSec)} 秒：{rtW(x)} {n(sell.n)} 次售罄補貨的中位壽命；{pct(sell.within2min)} 在 2 分鐘內售罄，{pct(sell.within20min)} 在 20 分鐘內。</b>,
    secUnit: "秒",
    medianListing: "中位上架時間（出現至消失）",
    within2: "兩分鐘內清貨",
    within20: "二十分鐘內清貨",
    fastest: "最快一次清貨",
    howLongNone: (x: RestockTimesView) => <b>{rtW(x)}售罄的補貨{yet(x)}太少，未能量度；這些數字要有十次才開始，美國版頁面有完整數據。</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>兩分鐘是留給<b className="text-ink">提醒</b>的時間，不是留給你在 apple.com 按重新整理</> },
      { text: <>本頁其他每個數字，都由這個數字推算出來</> },
      { text: <>每次補貨及其維持的秒數，按款式及{rtU(x)}：<Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo 補貨幾快售罄？</Link></>, step: true },
    ],
    measured: "每個數字由首次看到該款上架的那次檢查，計到看到它消失的那次檢查，所以是上限：真實壽命更短。",

    unavailableLead: (x: RestockTimesView) => <b>補貨只是一閃而過，不是一種狀態：{x.one ? "一間分店" : `${n(x.stores)} 間分店`} × {n(x.configs)} 款，{rtW(x)}共有 {n(x.pairs)} 個可能的上架組合，而此刻只有 {n(x.duoNow)} 間分店上架任何一款 iPhone Duo。</b>,
    pairs: "可能的「分店 × 款式」上架組合",
    listingNow: "此刻上架 iPhone Duo 取貨",
    goneIn2: "的補貨在兩分鐘內結束",
    last24: "24 小時內確認補貨",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>過去 24 小時：{rtW(x)} {n(x.recent.stores)} 間分店<b className="text-ink">確認補貨 {n(x.recent.restocks)} 次</b></> }
        : today > 0
          ? { text: <>今日：{rtW(x)}<b className="text-ink">確認補貨 {n(today)} 次</b></> }
          : { text: <>確實發生過的補貨，見上方逐日表</> },
      { text: <>每次在 apple.com 停留<b className="text-ink">一至兩分鐘</b>便消失</> },
      { text: <>發售第四日或第十四日看到「到處都沒有貨」，<b className="text-ink">不代表</b> Apple 已經停止</>, no: true },
    ],
    unavailableLinks: { explained: "「暫時未能提供取貨」說明", howToGet: "一步步買到 iPhone Duo" },

    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> 和 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> 上的建議大多很真誠，但只根據一間分店，而且翌日便過時；以下是最常出現的四種說法，用{rtW(x)} {n(x.t.n)} 次已確認補貨來驗證。</b>,
    redditCaption: "Reddit 上常見的 iPhone Duo 補貨說法，以 RestockWire 已確認的補貨驗證",
    redditHead: ["說法", "記錄怎樣說"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「分店半夜補貨，凌晨 3 點去查。」", answer: t.n > 0 ? <>{pct(hourShare(t.byHour, 0, 6))} 的補貨落在當地時間午夜至上午 6 點，相比之下 {pct(w.share)} 落在{rng(w.from, w.to)}。</> : "暫時未有記錄可以驗證。" },
        { claim: "「Apple 只在星期某一日補貨。」", answer: t.n > 0 ? (t.peakWeekday != null ? <>目前{WEEK[t.peakWeekday]}居首（{n(t.n)} 次中佔 {n(t.byWeekday[t.peakWeekday])} 次），但 {n(tracked)} 日之中有 {n(t.days)} 日都有補貨。</> : <>追蹤的 {n(tracked)} 日之中有 {n(t.days)} 日有補貨{t.days === tracked ? "，沒有一日空白" : ""}；數據滿 {WEEKDAY_MIN_SPAN} 日我們才指出哪一日最多。</>) : "暫時未有記錄可以驗證。" },
        { claim: "「打電話問分店幾時有貨車到。」", answer: "Apple 沒有公布補貨時間表；取貨存貨是網上釋出的，分店與所有人同一刻看到。" },
        { claim: "「顯示沒有貨，就是永遠賣完。」", answer: recent.restocks > 0 ? <>過去 24 小時 {n(recent.stores)} 間分店確認補貨 {n(recent.restocks)} 次，證明並非如此，而且每次都在幾分鐘內再次顯示沒有貨。</> : t.n > 0 ? <>自{ymd(t.since, false)}起確認的 {n(t.n)} 次補貨證明並非如此，而且每次都在幾分鐘內再次顯示沒有貨。</> : "暫時未有記錄可以驗證。" },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>沒有<b className="text-ink">數據</b>時，傳聞便會填補空白；本頁就是數據，免費查看</> },
      { text: <>Reddit 說對了一件事：<b className="text-ink">結帳準備</b>，先登入、設定好 Apple Pay（<Link href="/iphone-duo-restock-checkout-guide">我們的 20 秒版本</Link>）</> },
    ],

    methodLead: <b>一次補貨 = 某款配置在 apple.com 出現於一間原本沒有上架的分店、可供店舖取貨，並經兩次相符的檢查確認。</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>有提醒的分店：每 <b className="text-ink">{SPEED.fastSec} 秒</b>；{x.one ? `${rtW(x)}的 Apple Store` : `${rtW(x)}每一間 Apple Store`}：每 <b className="text-ink">{SPEED.checkSec} 秒</b></> },
      { text: <>其他追蹤網站公布的間隔：<b className="text-ink">8 秒至 15 分鐘</b>；我們只比較對方公布的數字</> },
      { text: <>新出現的「有貨」：<b className="text-ink">約一秒後</b>重讀，一致才入帳</> },
      { text: <>貨消失：等<b className="text-ink">下一輪</b>讀數確認</> },
      { text: <>分店第一次被看到、請求失敗、逾時：<b className="text-ink">永不</b>當作補貨，也永不當作「沒有貨」</>, no: true },
      { text: <>所有鐘點和日期都按每間分店的<b className="text-ink">當地時間</b>；「補貨潮」= 不同時區的同一個半小時</> },
      { text: <>其他追蹤網站的報告{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}有自己標示的行，<b className="text-ink">不計入任何總數</b></> },
      { text: <>這些表格約每五分鐘更新；<Link href={x.logHref}>補貨記錄</Link>是即時的</>, step: true },
    ],
    quote: "引用本頁：這裏任何數字都歡迎引用，請附上連結。RestockWire 獨立於 Apple，讀取的是任何人在 apple.com 都看得到的取貨供應狀況，只是讀得頻密得多。",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${rtW(x)} `}接收 iPhone Duo 提醒</>,

    related: "更多 iPhone Duo 問題",
    sameData: "建基於同一份記錄",
    questions: {
      sellOut: "一次補貨能維持多久？",
      alerts: "最快得知補貨的方法",
      howToGet: "實際上怎樣買到",
      whichConfig: "補貨最多的款式",
      nearMe: "我附近的即時現貨",
      unavailable: "「沒有貨」說明",
    },
    otherCountries: ((us: boolean): string => (us ? "其他國家的本頁" : "更多國家／地區")) as Dict["views"]["restockTimes"]["otherCountries"],
    /** Place pages (a region or a city of this country), and the rows on the country page that lead to them. */
    place: {
      byCity: "城市頁面",
      storesLive: (x: RestockTimesView) => `${rtW(x)} Apple Store：即時庫存`,
      countryPage: (c: Country) => `${cnOf(c)} iPhone Duo 補貨時間，全部分店`,
      sourcesWhere: (x: RestockTimesView) => `${rtW(x)}全部 ${x.stores} 間 Apple Store`,
    },
    faqTitle: "讀者常問",
  },
};
