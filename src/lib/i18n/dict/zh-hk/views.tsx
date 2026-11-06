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
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
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
const regionWordOf = (x: { us: boolean; c: Country }) => (x.us ? "州" : x.c.regionNoun ? rn(x.c) : "地區");
const yet = (x: RestockTimesMeta) => (x.t.n > 0 ? "" : "暫時");

/* ---------------------------------------------------------------- product × place */

function productTitle(product: Product, place: Place, inStock: number): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const short = zhCfg(product.short);
  const k = place.stores.length;
  if (place.level === "country" && cc !== "us") return fitW([...(inStock > 0 ? [`${cn(cc)} ${n(inStock)} 間 Apple Store 現已上架 ${name}`] : []), `${name} ${cn(cc)}：即時取貨現貨`, `${short} ${cn(cc)}：取貨現貨`, `${short} 取貨現貨`]);
  if (place.level === "country") return fitW([...(inStock > 0 ? [`${name}：現有 ${n(inStock)} 間 Apple Store 可取貨`] : []), `${name}：全美每間 Apple Store 取貨現貨`, `${name}：即時取貨現貨`, `${short} 取貨現貨`]);
  if (place.level === "store") {
    const s = place.store!;
    const now = inStock > 0 ? "現在可取貨" : "取貨現貨及補貨";
    const head = HK_TITLE[s.storeNumber]?.[0] ?? apple(s);
    return fitW([`${head} ${name}：${now}`, `${head} ${short}：${inStock > 0 ? "現在有貨" : "現貨"}`, `${head} ${short} 現貨`, `${shop(s)} ${short} 現貨`, `${short} 現貨 · ${shop(s)}`]);
  }
  const w = placeZh(place);
  return fitW([`${w} ${name}：${n(k)} 間中 ${n(inStock)} 間現已上架`, `${w} ${name}：即時取貨現貨`, `${w} ${short} 現在有貨嗎？`, `${short}（${w}）`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const cc = ccOf(place);
  const name = zhCfg(product.name);
  const week = `本週補貨 ${n(stats.week)} 次`;
  if (place.level === "store") {
    const s = place.store!;
    const loc = cc === "us" ? `${s.city} ${stateCodeOf(s)}` : city(s);
    const head = HK_TITLE[s.storeNumber] ? storeHead(s) : `${apple(s)} · ${loc}`;
    return fitW([
      `${head}的 ${name}：${inStock > 0 ? "最近一次讀取時可取貨" : "現時沒有上架取貨"}，${week}。這間分店幾時補貨、有貨維持多久，下一次補貨用提醒接住。`,
      `${apple(s)} 的 ${name}：${inStock > 0 ? "現在有貨" : "現時沒有貨"}，${week}。補貨時間及提醒。`,
    ], 155);
  }
  const where = place.level === "country" ? `${cn(cc)} Apple Store` : `${placeZh(place)} Apple Store`;
  return fitW([
    `此刻${where} ${n(place.stores.length)} 間中有 ${n(inStock)} 間上架 ${name} 取貨，${week}。逐間分店列出，附補貨時間，下一次補貨用手機提醒接住。`,
    `${name}：${n(place.stores.length)} 間${where}中 ${n(inStock)} 間現在有貨，${week}。逐店即時現貨、補貨時間及提醒。`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const at = placeZh(place);
  const name = zhCfg(product.name);
  const near = nearest ? `；最近有上架的是${nearest.name.includes(nearest.city) ? "" : `${nearest.city}的`} Apple ${nearest.name}，相距約 ${dist(place, nearest.distance)}` : "";
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `${at}現在有 ${name} 現貨嗎？`,
      a: l && l.available.length > 0
        ? `有${product.parts.length > 1 ? `：${lw(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}` : ""}，最近一次讀取時可取貨。`
        : `最近一次讀取時沒有${near}。`,
    });
  } else {
    out.push({
      q: `${at}現在哪幾間 Apple Store 上架 ${name}？`,
      a: inStock.length === 0 ? `最近一次讀取時一間都沒有${near}。` : `最近一次讀取有 ${n(inStock.length)} 間：${lw(inStock.map((l) => apple(l.store)), 4)}。`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${name} 多久會在${at}補一次貨？`,
    a: stats.month === 0 ? `過去 ${n(stats.days)} 日，${at}未有確認的補貨。` : `過去 ${n(stats.days)} 日確認補貨 ${n(stats.month)} 次，其中本週 ${n(stats.week)} 次${peak ? `，集中在當地時間${peak.hour}左右` : ""}。`,
  });
  if (stats.medianMs != null) out.push({ q: `${at}的 ${name} 補貨能維持多久？`, a: `中位數約 ${fmtDuration(stats.medianMs, L)}，之後便再次售罄。` });
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

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => cnOf(c),
    liveMap: "即時地圖",
    restockLog: "補貨記錄",
    alertMe: "接收提醒",
    lastDays: (days: number) => <>{n(days)} 日，逐日列出</>,
    since: "2026年11月2日",
    sourcesWhere: (k: number, c: Country) => (k === 1 ? `${cnOf(c)}唯一一間 Apple Store` : `${cnOf(c)}全部 ${n(k)} 間 Apple Store`),
    checker: (c: Country) => `${cnOf(c)} iPhone 現貨查詢`,
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
    h1Country: (model: string, c: Country) => `${zhCfg(model)} ${cnOf(c)}店舖取貨現貨`,
    h1Place: (model: string, where: string) => `${where}的 ${zhCfg(model)}`,
    inStockNow: "現時上架",
    yes: "有",
    no: "沒有",
    pickup: "取貨",
    configurations: "款式",
    ofStores: (k: number) => `共 ${n(k)} 間分店`,
    restocks24h: "補貨（24 小時）",
    restocksHint: (week: number, month: number, days: number) => `7 日 ${n(week)} 次 · ${n(days)} 日 ${n(month)} 次`,
    sellOuts: (days: number) => `售罄（${n(days)} 日）`,
    stays: (ms: number) => `約維持 ${fmtDuration(ms, L)}`,
    noPairs: "暫未有可配對的售罄",
    lastRestock: "最新補貨",
    noneYet: "暫時未有",
    thisConfig: "此款式",
    inDays: (days: number) => `過去 ${n(days)} 日`,
    notInStockNow: "現時沒有上架",
    configsInStock: (k: number, of: number) => <span>{n(of)} 款中 <b className="text-ink">{n(k)}</b> 款上架</span>,
    inStockAt: (k: number, of: number) => <span>{n(of)} 間分店中 <b className="text-ink">{n(k)}</b> 間上架</span>,
    checked: (live: ReactNode, p: string, tax: string) => <>{live}讀取 · {p}{tax}</>,
    taxNote: (c: Country) => taxNoteZh(c),
    beforeTax: "未連稅",
    buyOnApple: "在 apple.com 訂購",
    allStoresIn: (c: Country) => `${cnOf(c)}每間分店`,
    everyIphoneHere: "這裏的所有 iPhone",
    everyIphone: (where: string) => `${where}所有 iPhone`,
    panel: (model: string, where: string | null) => `${zhCfg(model)}${where ? ` · ${where}` : ""}：先揀款式，再揀分店`,
    unitConfigs: "款式",
    unitStores: "分店",
    otherConfigsHere: "這裏的更多款式",
    byStorageColor: "容量及顏色",
    nearestStores: "最近的分店",
    closest: (link: ReactNode, d: string) => <>最近有上架的分店：{link} · {d}</>,
    storeCity: (store: string, c: string) => <>{store}，{c}</>,
    mostRecentlyInStock: "最近一次上架",
    storesWithItNow: "現時上架的分店",
    storesIn: (where: string) => `${where}的分店`,
    colStatus: "狀態",
    colConfigs: "上架款式",
    noStoreHasIt: "現時沒有分店上架。",
    noStoreHereHasIt: "這一區現時沒有分店上架。",
    moreStores: (k: number) => <>另有 {n(k)} 間分店，下面按地區排列。</>,
    byRegion: (c: Country) => `按${rn(c)}`,
    byCity: "按地區",
    nearbyStores: "鄰近分店",
    latestChanges: "最新變動",
    nothingLogged: "記錄暫時仍是空的。",
    whenRestocks: "通常幾點補貨",
    howFast: "補貨維持多久",
    restocksByConfig: "哪些款式會補貨",
    faqTitleCountry: (model: string, c: Country) => `${zhCfg(model)} ${cnOf(c)}：常見問題`,
    faqTitle: (model: string, where: string) => `${where}的 ${zhCfg(model)}`,
    buySource: (model: string, c: Country) => `Apple：${zhCfg(model)} 購買頁面（${cnOf(c)}）`,
    nearby: "鄰近",
    otherRegions: (c: Country) => `其他${rn(c)}`,
    elsewhereIn: (region: string) => `${region}較遠的分店`,
    everyAppleStoreIn: (c: Country) => `${cnOf(c)} Apple Store 完整列表`,
    across: (model: string, c: Country) => (c.cc === "hk" ? `全港的 ${zhCfg(model)}` : `${cnOf(c)}各地的 ${zhCfg(model)}`),
    itemList: (model: string, where: string) => `${where}的 ${zhCfg(model)}`,
    nearLead: (c: Country, model: string, inStock: number, k: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `此刻${cnOf(c)}沒有 Apple Store 上架 ${model} 取貨，所以「附近」比的是哪間鄰近分店先補貨。在每間你去得到的分店設提醒，一上架，推送幾秒後就到你手機。`
        : `${n(k)} 間分店中有 ${n(inStock)} 間此刻上架 ${model}：${lw(have.slice(0, 5).map((l) => `${l.store}${l.store.includes(l.city) ? "" : ` · ${l.city}`}（${n(l.configs)} 款）`), 5)}。`,
    nearHead: (c: Country) => [rn(c), "現時上架的分店"],
    nearCaption: (c: Country, model: string) => `各${rn(c)}的 ${model} 取貨現貨，最近一次檢查`,
    nearMe: (_c: Country, model: string, alert: string) => `在本頁的提醒設定按「我附近」，每間分店便會按你所在位置排序：按行車路線估算距離（公里），每間都附路線連結。[設定 ${model} 提醒](${alert})。`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => price(L, c, v);
      return {
        price: { q: `${model} 在${cnOf(c)}賣幾錢？`, a: `apple.com 售 ${money(low)} 至 ${money(high)}（${taxNoteZh(c)}），視乎容量。` },
        reserve: { q: `在${cnOf(c)}有辦法預留 ${model} 到店提取嗎？`, a: `不能預先預留：分店上架你要的款式時，你在 apple.com 選擇店舖提取並下單，Apple 會在你揀選的時段為你保留。${inStock === 0 ? "現時沒有分店上架，想搶先一步，就要靠提醒。" : ""}` },
      };
    },
  },

  restocks: {
    metaTitle: (c: Country, k: number) => `${cnOf(c)} iPhone 即時補貨記錄：${k === 1 ? "Apple Store" : `${n(k)} 間 Apple Store`}`,
    metaDescription: (c: Country, k: number) => `${cnOf(c)}${k === 1 ? " Apple Store " : "各間 Apple Store "}每一次已確認的 iPhone Duo、18 Pro 及 Pro Max 店舖取貨補貨：時間、準確款式、地圖。`,
    h1: (c: Country) => `${cnOf(c)} iPhone 補貨，即時記錄`,
    summary: (day: number, week: number, model?: string, region?: string) => <>過去 24 小時補貨 {n(day)} 次 · 7 日 {n(week)} 次{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時間以你自己的時區顯示。</>,
    allModels: "所有型號",
    restocks: "補貨",
    withSoldOut: "補貨及售罄",
    regionLabel: (c: Country) => rn(c),
    allRegions: (c: Country) => `全部${rn(c)}`,
    filter: "套用",
    page: (k: number) => <>第 {n(k)} 頁</>,
    newer: "← 較新",
    older: "較舊 →",
    getAlerts: "設定提醒",
    byPlace: "逐個地點看補貨",
    byRegion: (c: Country) => `按${rn(c)}`,
    datasetName: (c: Country) => `${cnOf(c)} Apple Store iPhone 店舖取貨補貨`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "美國全部 269 間 Apple Store" : `${cnOf(c)}各間 Apple Store`}已確認的 iPhone Duo、iPhone 18 Pro 及 iPhone 18 Pro Max 店舖取貨補貨及售罄：分店、準確款式、時間。每間分店每 15 秒讀取一次（有人設提醒的分店每 5 秒），apple.com 兩次回應相同，補貨才會寫入記錄。`,
    datasetMeasured: ["Apple Store", "iPhone 型號、容量及顏色", "補貨時間", "售罄時間"],
  },

  map: {
    metaTitle: (c: Country, k: number) => `${cnOf(c)} iPhone Duo 即時現貨地圖：${k === 1 ? "Apple Store" : "每間 Apple Store"}`,
    metaDescription: (c: Country, k: number) => `iPhone Duo、18 Pro 及 Pro Max 此刻在哪裏上架店舖取貨：${cnOf(c)}${k === 1 ? " Apple Store " : `全部 ${n(k)} 間 Apple Store `}都在同一張即時地圖上，可按容量及顏色查看。`,
    country: (c: Country) => ({ name: cnOf(c), inName: cnOf(c), regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "所有分店",
    storeCity: (store: string, c: string) => `${store} · ${c}`,
  },

  storesIndex: {
    metaDescription: (c: Country, k: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `，按${rn(c)}及城市排列` : cities > 1 ? `，按${cityNoun(c.cc)}排列` : "";
      return `此刻 ${n(duo)} 間上架 iPhone Duo、${n(max)} 間上架 Pro Max：${cnOf(c)}全部 ${n(k)} 間 Apple Store 即時取貨現貨${by}，包括 18 Pro。`;
    },
    countAnswer: (k: number, spread: string, top: { name: string; count: number }[]) => `${n(k)} 間，${spread}${top.length ? `；${top[0].name}以 ${n(top[0].count)} 間居首${top[1] ? `，領先${top[1].name}（${n(top[1].count)} 間）` : ""}` : ""}。`,
    howMany: (c: Country) => <>{cnOf(c)}有幾多間 Apple Store？</>,
    duoNow: (c: Country, k: number, have: Store[]): FaqItem => ({
      q: `${cnOf(c)}現在哪幾間 Apple Store 上架 iPhone Duo？`,
      a: have.length === 0 ? `最近一次檢查，${n(k)} 間都沒有；任何一間一上架，本頁和地圖即時更新，而提醒會比兩者更早通知你。` : `最近一次檢查，${n(k)} 間中有 ${n(have.length)} 間：${have.slice(0, 6).map((x) => apple(x)).join("、")}${have.length > 6 ? "等" : ""}。`,
    }),
    faq: (ctx: FaqContext) => {
      const cc = ctx.stores[0]?.country ?? "us";
      const peak = ctx.peak ? { hour: hrFromEn(ctx.peak.hour), day: ctx.peak.day ? dayFromEn(ctx.peak.day) : null, total: ctx.peak.total } : ctx.peak;
      return placeFaq({ ...ctx, place: zhPlace(cc, ctx.place), peak, omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L);
    },
    duoBlock: (alert: string) => `想買到一部，最快的路是在你去得到的分店設提醒：[設定 iPhone Duo 提醒](${alert})。一個提醒 = 一間分店 × 一款指定配置，那間分店一上架，幾秒後你的手機就知道。`,
    intro: (c: Country, k: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `此刻有 **${n(now.duo)}** 間上架 iPhone Duo 取貨、**${n(now.max)}** 間上架 iPhone 18 Pro Max、**${n(now.pro)}** 間上架 18 Pro；${cnOf(c)}共有 **${n(k)} 間 Apple Store**，${spread}。${tax}`,
    crumb: "Apple Store",
    panel: (c: Country) => `先揀手機，再剔選${cnOf(c)}你去得到的分店`,
    matrixLabel: "各分店現貨",
    matrixH2: (c: Country) => <>{cnOf(c)}逐間分店現貨</>,
    matrixHint: "每個型號：現時上架／追蹤中。",
    topCaption: (c: Country) => <>按 Apple Store 數目排列的{rn(c)}（根據 Apple 零售店列表，即本站追蹤範圍）</>,
    regionHead: (c: Country) => rn(c),
    colStores: "Apple Store",
    colCities: "城市",
    locationsBy: (c: Country) => `Apple Store 在哪裏，逐${rn(c)}列出`,
    locationsIn: (c: Country) => `${cnOf(c)}每間 Apple Store 的位置`,
    storeCount: (k: number) => <>{n(k)} 間分店</>,
    storeCountAll: (k: number) => <>{n(k)} 間分店</>,
    whenRestock: (c: Country) => <>{cnOf(c)}的分店幾點補貨？</>,
    howFast: (c: Country) => <>{cnOf(c)}一次補貨能維持多久？</>,
    faqTitle: (c: Country) => `${cnOf(c)} Apple Store：常見問題`,
    getApp: "取得 App",
    howItWorks: "運作原理",
    pricing: "收費",
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
    title: (c: Country) => `Apple 幾點在${cnOf(c)}補貨 iPhone Duo？`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const rw = c.cc === "us" ? "州" : c.regionNoun ? rn(c) : "分店";
      /** "按鐘點、日子、分店及款式" from the parts that apply. */
      const by = (...parts: (string | null)[]) => { const p = parts.filter((x): x is string => Boolean(x)); return `按${p.slice(0, -1).join("、")}及${p[p.length - 1]}`; };
      const since = ymd(t.since, false);
      const w2 = cnOf(c);
      return t.n > 0 && pattern
        ? fitW([
          `自${since}起，${w2} Apple Store 補貨 iPhone Duo ${n(t.n)} 次：${pct(w.share)} 落在當地時間${rng(w.from, w.to)}${t.sellout ? `，${pct(t.sellout.within2min)} 在 2 分鐘內售罄` : ""}。${by("鐘點", "日子", rw === "分店" ? null : rw, "分店", "款式")}列表。`,
          `自${since}起，${w2} Apple Store 補貨 iPhone Duo ${n(t.n)} 次：${pct(w.share)} 落在當地時間${rng(w.from, w.to)}。${by("鐘點", "日子", rw, "款式")}列表。`,
          `${w2} iPhone Duo 補貨時間：自${since}起補貨 ${n(t.n)} 次，${by("鐘點", "日子", rw, "款式")}統計。`,
        ], 158)
        : t.n > 0
          ? fitW([
            `自${since}起，${w2} Apple Store 已確認的 iPhone Duo 補貨共 ${n(t.n)} 次，來自每 ${SPEED.checkSec} 秒一次的檢查：${by("當地鐘點", "日子", rw === "分店" ? null : rw, "分店", "款式")}統計，並列出每次維持多久。`,
            `${w2} iPhone Duo 補貨時間：自${since}起確認補貨 ${n(t.n)} 次，${by("鐘點", "日子", rw, "款式")}統計。`,
          ], 158)
          : `${w2} Apple Store 的 iPhone Duo 補貨時間，逐小時、逐日、按分店及款式統計；RestockWire 自${longYmd(t.since)}起每 ${SPEED.checkSec} 秒讀取每間分店一次。`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `Apple 幾點在${cnOf(x.c)}補貨 iPhone Duo？`
      : x.t.n > 0
        ? `Apple 幾點在${cnOf(x.c)}補貨 iPhone Duo？${x.pattern ? `最常在當地時間${rng(x.w.from, x.w.to)}` : "我們自己的檢查，逐小時列出"}`
        : `Apple 有在${cnOf(x.c)}補貨 iPhone Duo 嗎？暫時未有，以下是我們留意的數據`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = cnOf(x.c);
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
    logLive: "即時補貨記錄",
    onThisPage: "段落",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "鐘點",
      "day-by-day": "日子",
      where: `按${regionWordOf(x)}`,
      configuration: "款式",
      "how-long": "售罄速度",
      unavailable: "「沒有貨」",
      reddit: "Reddit 說法",
      method: "方法",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${cnOf(x.c)}的 iPhone Duo 幾點回來？`,
      "day-by-day": `${cnOf(x.c)}的 iPhone Duo 哪幾日補過貨？`,
      where: `${cnOf(x.c)}哪裏最常補 iPhone Duo？`,
      configuration: `${cnOf(x.c)}哪款 iPhone Duo 容量及顏色補貨最多？`,
      "how-long": `${cnOf(x.c)}一次 iPhone Duo 補貨能維持幾多秒？`,
      unavailable: "為何 apple.com 每間分店都顯示「暫時未能提供」？",
      reddit: "Reddit 上的 iPhone Duo 補貨理論，用記錄來驗證",
      method: "RestockWire 怎樣才算一次補貨？",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = cnOf(x.c);
      const window = rng(w.from, w.to);
      return [
        { q: `Apple 幾時在${where}補貨 iPhone Duo？`, a: t.n > 0 && pattern
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
      newsroom: "Apple Newsroom：iPhone Duo 登陸全球 Apple Store（2026 年 10 月 23 日）",
      macRumors: "MacRumors：iPhone Duo 的 Apple Store 取貨系統在美國及加拿大重新上線（2026 年 10 月 24 日）",
      reports: (tracker: string) => `${tracker}：發售週的 iPhone Duo 補貨報告（對方自己的觀察，分開列出，從不計入）`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${cnOf(x.c)} Apple Store 的 iPhone Duo 店舖取貨補貨時間`,
      description: `自 ${x.t.since} 起${cnOf(x.c)} Apple Store 已確認的 iPhone Duo 店舖取貨補貨（分店、款式、時間），來自 RestockWire 每 ${SPEED.checkSec} 秒讀取每間分店一次；按當地鐘點、日子、${regionWordOf(x)}、分店及款式分組。`,
      spatial: `${cnOf(x.c)} Apple Store`,
      measured: ["補貨時間（分店當地時間）", "Apple Store", "iPhone Duo 容量及顏色", "售罄前的秒數"],
      size: `${n(x.t.stores)} 間分店共 ${n(x.t.n)} 次補貨`,
    }),
    crumb: "iPhone Duo 補貨時間",

    timeLead: (x: RestockTimesView) => <b>分店當地時間{rng(x.w.from, x.w.to)}佔 {n(x.t.n)} 次補貨中的 {pct(x.w.share)}；上午 8 點至中午 12 點佔 {pct(hourShare(x.t.byHour, 8, 12))}。</b>,
    busiestHour: (count: number) => `最多補貨的單一鐘點：${n(count)} 次`,
    morning: "上午 8 點至中午 12 點",
    evening: "下午 5 點後，晚上也算數",
    night: "午夜至上午 6 點",
    tooFew: (x: RestockTimesView) => <b>日子不夠，{yet(x)}未能指出鐘點：自{longYmd(x.t.since)}起確認補貨 {n(x.t.n)} 次，分佈在 {n(x.t.days)} 日。</b>,
    tooFewKeys: (): Point[] => [
      { text: <>要指出慣常鐘點，需要 <b className="text-ink">{PATTERN_MIN} 次補貨、分佈在 {PATTERN_MIN_DAYS} 個不同日子</b></> },
      { text: <>一口氣補十次是一次事件，不是習慣</>, no: true },
      { text: <>每多一日數據，本頁便自動更新</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${cnOf(x.c)} ${n(x.t.n)} 次 iPhone Duo 補貨，按分店當地鐘點，${ymd(x.t.since, false)}至今日`,
    hourHead: ["當地鐘點", "補貨", "佔比"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>早上的高峰<b className="text-ink">與開門時間無關</b>{x.us ? "（美國大部分 Apple Store 上午 10 點開門）" : ""}</> },
      { text: <>Apple 在<b className="text-ink">網上</b>釋出取貨存貨，早於開門</> },
      { text: <>手動查？平日早上守住 <b className="text-ink">{rng(x.w.from, x.w.to)}</b></>, step: true },
      { text: <><Link href={x.alert}>提醒</Link>負責<b className="text-ink">其餘 22 小時</b>，那段時間沒有人在看</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>每間分店頁都按自己的時區畫出自己的鐘點（<Link href={x.storesHref}>{x.us ? "按州份查看 Apple Store" : `${cnOf(x.c)}的分店`}</Link>），所以同區 9 點才是高峰時，你可以找出 8 點已補貨的那一間</>, step: true }],

    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>目前唯一追蹤的一日（{ymd(t.daily[t.daily.length - 1]?.date ?? t.since)}），確認補貨 {n(t.n)} 次{one ? "" : `，分佈在 ${n(t.stores)} 間分店`}。</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `追蹤的 ${n(t.days)} 日全部` : `自${longYmd(t.since)}起 ${n(tracked)} 日之中有 ${n(t.days)} 日`}至少有一次確認補貨{t.peakWeekday != null ? `；星期之中以${WEEK[t.peakWeekday]}最多` : ""}。</b>
      ) : (
        <b>自{longYmd(t.since)}起，{cnOf(x.c)}已確認的補貨是零。</b>
      );
    },
    daysTracked: "追蹤日子中有補貨的日子",
    busiestDay: (x: RestockTimesView, day: DayRow) => `最多的一日，${ymd(day.date)}${x.one ? "" : `，分佈在 ${n(day.stores)} 間分店`}`,
    busiestDayNone: "最多的一日",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `間分店在同一個半小時內補貨，${zoneStampZh(drop.at, x.c.cc)}（${n(drop.restocks)} 款）：一次${x.c.cc === "hk" ? "全港" : "全國"}性的釋出`,
    weekend: (x: RestockTimesView) => `落在週末（${n(x.weekend)} 次補貨）`,
    dayCaption: (x: RestockTimesView) => `${cnOf(x.c)} iPhone Duo 每日補貨${x.t.reports.length ? "；標為「報告」的行來自其他追蹤網站在我們開始追蹤前公布的觀察，只為完整時間線" : ""}`,
    dayHead: { date: "日期", restocks: "補貨", stores: "分店", busiest: "最多的鐘點", source: "來源" },
    soFar: " · 暫計",
    reportedBy: (names: string[]) => <>據 {names.join(" / ")}</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{ymd(launch)}</b>：發售日，首批貨送往網上訂單</> },
      { text: <><b className="text-ink">{ymd(resumed)}</b>：店舖取貨恢復{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">報告</b>行是 {x.reportNames.join(" 及 ")} 在發售週的觀察，所有計數都不包括</> }
        : { text: <>RestockWire 對{cnOf(x.c)}每間分店的記錄由 <b className="text-ink">{longYmd(x.t.since)}</b> 開始</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>要指出補貨最多的星期，需要 <b className="text-ink">{WEEKDAY_MIN_SPAN} 日</b>數據（我們目前有 {n(x.tracked)} 日）</>, no: true }] : []),
      { text: <>留意<b className="text-ink">分店</b>一欄：補貨分散到越多分店，你的機會越好</>, step: true },
    ],

    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}：自{ymd(x.t.since, false)}起，{n(hit[0].storesTotal)} 間分店中 {n(hit[0].stores)} 間補貨 {n(hit[0].restocks)} 次{hit[1] ? <>，其次是{hit[1].name}（{n(hit[1].restocks)}）</> : null}{hit[2] ? <>及{hit[2].name}（{n(hit[2].restocks)}）</> : null}；{n(total)} 個{regionWordOf(x)}中有 {n(hit.length)} 個出現過補貨{total - hit.length > 0 ? `，${n(total - hit.length)} 個仍未有` : ""}。</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{cnOf(x.c)}暫時未有任何{regionWordOf(x)}錄得確認補貨；第一次補貨出現，表格便會開始。</b>,
    regionCaption: (x: RestockTimesView) => `${cnOf(x.c)}按${regionWordOf(x)}的 iPhone Duo 補貨（已確認），${ymd(x.t.since, false)}至今日`,
    regionHead: (x: RestockTimesView) => [regionWordOf(x), "補貨", "有補貨的分店", "最新補貨（當地時間）"],
    ofN: (a: number, b: number) => <>{n(b)} 間中 {n(a)} 間</>,
    storesCaption: (x: RestockTimesView) => `${cnOf(x.c)} iPhone Duo 補貨最多的分店，${ymd(x.t.since, false)}至今日`,
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
    restocksOf: (a: string) => `${a} 的補貨次數`,
    byStorage: "按容量",
    byColour: "按顏色",
    configNone: (x: RestockTimesView) => <b>{cnOf(x.c)}{yet(x)}未有任何款式錄得確認補貨；八款配置全部先列出，第一次補貨便有自己的一行。</b>,
    configCaption: (x: RestockTimesView) => `${cnOf(x.c)}按款式的 iPhone Duo 補貨（已確認），${ymd(x.t.since, false)}至今日`,
    configHead: ["款式", "補貨", "佔比", "最新補貨（當地時間）"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>揀款式<b className="text-ink">比揀分店更重要</b></> },
      x.storageRatio != null
        ? { text: <>退一步選補貨最多的容量，機會約是下一個容量的 <b className="text-ink">{x.storageRatio}×</b></> }
        : { text: <>退一步選補貨最多的容量，機會<b className="text-ink">大大提高</b></> },
      { text: <><b className="text-ink">2TB</b> 較適合網上訂購送貨，然後等</>, no: true },
      { text: <>價錢及即時現貨：<Link href="/iphone-duo-most-restocked-stores">哪款 iPhone Duo 補貨最多？</Link></>, step: true },
    ],

    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{n(sell.medianSec)} 秒：{cnOf(x.c)} {n(sell.n)} 次售罄補貨的中位壽命；{pct(sell.within2min)} 在 2 分鐘內售罄，{pct(sell.within20min)} 在 20 分鐘內。</b>,
    secUnit: "秒",
    medianListing: "上架時間中位數，由上架到消失",
    within2: "2 分鐘內售罄",
    within20: "20 分鐘內售罄",
    fastest: "記錄中最快的售罄",
    howLongNone: (x: RestockTimesView) => <b>{cnOf(x.c)}售罄的補貨{yet(x)}太少，未能量度；這些數字要有十次才開始，美國版頁面有完整數據。</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>兩分鐘是留給<b className="text-ink">提醒</b>的時間，不是留給你在 apple.com 按重新整理</> },
      { text: <>本頁其他每個數字，都由這個數字推算出來</> },
      { text: <>每次補貨及其維持的秒數，按款式及{regionWordOf(x)}：<Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duo 補貨幾快售罄？</Link></>, step: true },
    ],
    measured: "每個數字由首次看到該款上架的那次檢查，計到看到它消失的那次檢查，所以是上限：真實壽命更短。",

    unavailableLead: (x: RestockTimesView) => <b>補貨只是一閃而過，不是一種狀態：{x.one ? "一間分店" : `${n(x.stores)} 間分店`} × {n(x.configs)} 款，{cnOf(x.c)}共有 {n(x.pairs)} 個可能的上架組合，而此刻只有 {n(x.duoNow)} 間分店上架任何一款 iPhone Duo。</b>,
    pairs: "可能的「分店 × 款式」上架組合",
    listingNow: "此刻上架 iPhone Duo 取貨",
    goneIn2: "的補貨在兩分鐘內結束",
    last24: "過去 24 小時已確認的補貨",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>過去 24 小時：{cnOf(x.c)} {n(x.recent.stores)} 間分店<b className="text-ink">確認補貨 {n(x.recent.restocks)} 次</b></> }
        : today > 0
          ? { text: <>今日：{cnOf(x.c)}<b className="text-ink">確認補貨 {n(today)} 次</b></> }
          : { text: <>上面的逐日表格列出確實發生過的補貨</> },
      { text: <>每一次在 apple.com 上只出現<b className="text-ink">一兩分鐘</b></> },
      { text: <>發售第四日或第十四日看到「到處都沒有貨」，<b className="text-ink">不代表</b> Apple 已經停止</>, no: true },
    ],
    unavailableLinks: { explained: "「暫時未能提供取貨」說明", howToGet: "一步步買到 iPhone Duo" },

    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a> 和 <a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a> 上的建議大多很真誠，但只根據一間分店，而且翌日便過時；以下是最常出現的四種說法，用{cnOf(x.c)} {n(x.t.n)} 次已確認補貨來驗證。</b>,
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
      { text: <>有提醒的分店：每 <b className="text-ink">{SPEED.fastSec} 秒</b>；{x.one ? `${cnOf(x.c)}的 Apple Store` : `${cnOf(x.c)}每一間 Apple Store`}：每 <b className="text-ink">{SPEED.checkSec} 秒</b></> },
      { text: <>其他追蹤網站公布的間隔：<b className="text-ink">8 秒至 15 分鐘</b>；我們只比較對方公布的數字</> },
      { text: <>首次出現的「有貨」會在<b className="text-ink">約一秒後</b>再查一次才算數</> },
      { text: <>消失的上架會在<b className="text-ink">下一輪</b>確認</> },
      { text: <>分店第一次被看到、請求失敗、逾時：<b className="text-ink">永不</b>當作補貨，也永不當作「沒有貨」</>, no: true },
      { text: <>所有鐘點和日期都按每間分店的<b className="text-ink">當地時間</b>；「補貨潮」= 不同時區的同一個半小時</> },
      { text: <>其他追蹤網站的報告{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}有自己標示的行，<b className="text-ink">不計入任何總數</b></> },
      { text: <>這些表格約每五分鐘更新；<Link href={x.logHref}>補貨記錄</Link>是即時的</>, step: true },
    ],
    quote: "引用本頁：這裏任何數字都歡迎引用，請附上連結。RestockWire 獨立於 Apple，讀取的是任何人在 apple.com 都看得到的取貨供應狀況，只是讀得頻密得多。",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${cnOf(x.c)} `}接收 iPhone Duo 提醒</>,

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
    faqTitle: "常見問題",
  },
};
