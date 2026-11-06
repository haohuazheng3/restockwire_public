/**
 * 台灣中文：place —— 各國頁面樹（首頁、門市索引、地區、城市、機型頁）的文案產生器，以台灣（tw）為主。
 * 與英文 lib/seo/countryCopy.ts 同樣的參數與回傳形狀；句子依即時數字組成。關鍵字：iPhone Duo、現貨查詢、
 * Apple 直營店、門市取貨、價格（Google Ads 台灣：iphone duo 33,100、apple 直營店 8,100、iphone duo 價格 1,900、
 * iphone 現貨 查詢 170）。地名參數多半是英文資料，這裡一律用 places.ts 換成 Apple 台灣的寫法。
 */
import * as cc from "@/lib/seo/countryCopy";
import type { HomeCopyInput, IntlPlaceInput, RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, CA_TAX_SOURCE, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { catalogFor, citiesWithStores, modelByKey, statesWithStores, storesOf, type ModelKey, type Store } from "@/lib/apple/catalog";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq, Source } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { fitTitleW, list, price } from "../../format";
import { appleStoreLabel, cityLabel, regionLabel, storeLabel } from "../../places";
import type { Dict } from "../en";
import { content } from "./content";
import { L, cn, currencyZh, hh, n, regionZh, stampZh, taxName, taxNoteZh, zhCfg, zoneName, zs } from "./util";

const money = (c: Country, v: number) => price(L, c, v);
const TRACKING_START = "2026-11-02";

/** 「自 11 月 2 日開始追蹤以來」／「最近 30 天」。 */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${TRACKING_START}T00:00:00Z`) < 30 * 86400_000 ? "從 11 月 2 日開始記錄至今" : "最近 30 天";
}

/** 地名參數（英文資料或已是中文）→ Apple 台灣的寫法。 */
const placeOf = (i: IntlPlaceInput) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));

/** 「11 月 3 日 上午 10:31（台北標準時間）」。 */
function whenIn(code: CountryCode, iso: string | Date): string {
  const tz = COUNTRIES[code].timeZone;
  return `${stampZh(iso, tz)}（${zoneName(tz, iso)}）`;
}

/* ------------------------------------------------------------------ 稅與價格 */

function taxSentence(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return zs(`在${region}，256GB 的 iPhone Duo 結帳約 ${money(c, t.total)}：Apple 標價 ${money(c, duo)}，再加 ${t.rate}% ${CA_PROVINCE_TAX[region!].label}。`);
    return zs(`256GB 的 iPhone Duo 未稅 ${money(c, duo)}；取貨門市所在的省份會在櫃台另加 5% 到 15%。`);
  }
  const r = includedRate(c);
  if (r == null) return zs(`${money(c, duo)} 就是 256GB iPhone Duo 取貨時的全部價格：香港不加任何銷售稅。`);
  return zs(`${money(c, duo)} 就是在${cn(code)}取貨 256GB iPhone Duo 的全部價格，已含 ${r}% ${taxName(code)}。`);
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** 各國的稅務來源；台灣指向財政部賦稅署中文網站。 */
function taxSource(code: Exclude<CountryCode, "us">): Source {
  return code === "tw" ? { label: "營業稅（財政部賦稅署）", url: "https://www.dot.gov.tw/" } : TAX_SOURCES[code];
}

function priceSection(code: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const base = cc.priceOf(code, model) ?? 0;
  const src: Source = code === "us" ? { label: "apple.com", url: "https://www.apple.com/shop/buy-iphone" } : taxSource(code);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = cc.priceOf(code, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (code === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      return {
        id: "price-with-tax",
        h2: zs(`${m.name} 在${placeName}加上銷售稅要多少錢？`),
        lead: zs(`在${placeName}的門市取貨 256GB ${m.name}，**約 ${money(c, withProvinceTax(base, region!)!.total)}**：Apple **未稅 ${money(c, base)}**，加上${region}的 ${t.total}% ${t.label}。`),
        blocks: [
          { t: "table", head: ["iPhone", "apple.com 價格", `含 ${t.total}% ${t.label}`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: zs(`在${region}加上 ${t.label}（${t.total}%）後，每款 iPhone 的結帳價`), source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url})；價格取自 apple.com/ca` },
          { t: "note", text: "**稅率看取貨門市：**由門市所在的省份決定，跟你的住址無關。" },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: zs(`${m.name} 在加拿大加上銷售稅要多少錢？各省比較`),
      lead: zs(`256GB ${m.name} **從${cheapest}的 ${money(c, withProvinceTax(base, cheapest)!.total)} 到${dearest}的 ${money(c, withProvinceTax(base, dearest)!.total)}**：Apple 標價 ${money(c, base)} 不含稅，取貨門市所在省份另加 ${CA_PROVINCE_TAX[cheapest].total}% 到 ${CA_PROVINCE_TAX[dearest].total}%。`),
      blocks: [{
        t: "table",
        head: ["省份", "稅", "稅率", `${m.short} 256GB 含稅`],
        rows: provinces.map((p) => [p, CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "每個有 Apple 直營店的省份，門市取貨要付的銷售稅",
        source: `[${CA_TAX_SOURCE.label}](${CA_TAX_SOURCE.url})；價格取自 apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxName(code);
  return {
    id: "price",
    h2: zs(`${m.name} 在${cn(code)}多少錢？${money(c, base)}，${taxNoteZh(c)}`),
    lead: r == null
      ? zs(`在${placeName}取貨 256GB ${m.name}，付的就是 **${money(c, base)}，和 apple.com 標價完全一樣**：香港**不收銷售稅**，也沒有加值稅。`)
      : zs(`在${placeName}取貨 256GB ${m.name} 付 **${money(c, base)}**，**已含 ${r}% ${tn}**（未稅 ${money(c, beforeTax(c, base))}）；櫃台不會再加任何費用。`),
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "apple.com 價格"] : ["iPhone", "apple.com 價格", `扣除 ${r}% ${tn}前`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: zs(`Apple ${cn(code)}售價，即取貨時實付${r == null ? "" : `（已含${tn}）`}`),
      source: `[${src.label}](${src.url})；價格取自 apple.com/${c.buyPath ?? c.shopPath}`,
    }],
  };
}

function taxFaq(code: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo") ?? 0;
  if (code === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: zs(`iPhone Duo 在${placeName}含稅價是多少？`), a: zs(`256GB 約 ${money(c, t.total)}：Apple 的 ${money(c, duo)} 再加${region}的 ${t.rate}% ${CA_PROVINCE_TAX[region!].label}，由取貨門市收取。`) }
      : { q: "Apple 加拿大的標價含稅嗎？", a: zs(`不含：256GB 的 iPhone Duo 未稅 ${money(c, duo)}。取貨門市所在的省份會另加 GST、HST 或省銷售稅，從 Alberta 的 5% 到 Quebec 的 14.975%。`) };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "香港買 iPhone 另外要繳稅嗎？", a: zs(`不用：香港沒有銷售稅，也沒有加值稅。256GB 的 iPhone Duo 取貨時付 ${money(c, duo)}，和 apple.com 標價一模一樣。`) }
    : { q: zs(`Apple ${cn(code)}的價格已經含${taxName(code)}了嗎？`), a: zs(`是的：256GB iPhone Duo 的 ${money(c, duo)} 已含 ${r}% ${taxName(code)}。取貨櫃台不會再加任何費用。`) };
}

/* ------------------------------------------------------------------ 地區、城市頁 */

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitTitleW([
    `${w} Apple 直營店：iPhone Duo 門市取貨即時現貨，${k === 2 ? "兩家" : `${n(k)} 家`}全看`,
    `${w} Apple 直營店：iPhone Duo 門市取貨即時現貨`,
    `${w} Apple 直營店：iPhone 現貨查詢`,
    `${w} Apple 直營店 iPhone 現貨`,
  ].map(zs));
}

function priceBit(code: CountryCode, region?: string): string {
  const c = COUNTRIES[code];
  const duo = cc.priceOf(code, "duo");
  if (duo == null) return "";
  if (code === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `，Duo 含${region}稅約 ${money(c, t.total)}` : `，Duo 未稅 ${money(c, duo)}`; }
  return `，Duo 售價 ${money(c, duo)}（${taxNoteZh(c)}）`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitTitleW([
    `${w} ${n(k)} 家 Apple 直營店中，此刻 ${n(i.stockNow.duo)} 家可門市取貨 iPhone Duo、${n(i.stockNow["18-pro-max"])} 家有 18 Pro Max。逐店列出，附補貨時段${priceBit(i.cc, i.region)}。`,
    `${w} ${n(k)} 家 Apple 直營店中，此刻 ${n(i.stockNow.duo)} 家有 iPhone Duo、${n(i.stockNow["18-pro-max"])} 家有 18 Pro Max。逐店即時更新，附補貨時段。`,
  ].map(zs), 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（分布在 ${n(i.cities)} 個城市）` : "";
  return zs(`此刻${placeOf(i)}的 **${n(k)} 家 Apple 直營店**${cities}中，**${n(i.stockNow.duo)}** 家可門市取貨 iPhone Duo；iPhone 18 Pro Max 是 **${n(i.stockNow["18-pro-max"])}** 家，iPhone 18 Pro 是 **${n(i.stockNow["18-pro"])}** 家。`);
}

/** Duo 區塊的答案句：哪幾家現在有。 */
function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return zs(`**有，${n(k)} 家中有 ${n(have.length)} 家**：${list(L, have.map((s) => appleStoreLabel(s, L)), 4, (x) => `另外 ${n(x)} 家`)}此刻可門市取貨 iPhone Duo。`);
  if (st.month > 0) return zs(`**此刻沒有**：${n(k)} 家門市都沒有 iPhone Duo，不過${sinceWhen()}它們合計已補貨 **${n(st.month)} 次**。`);
  return zs(`**此刻沒有**：${n(k)} 家門市都沒有 iPhone Duo，${sinceWhen()}也沒有任何一家確認過 Duo 補貨。`);
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = cc.duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**這裡最近一次 Duo 補貨：**${whenIn(i.cc, st.lastRestock.at)}，${appleStoreLabel(last, L)}`);
  if (have.length > 0 && st.month > 0) items.push(`**${sinceWhen()}已確認：**${w}的門市共補貨 Duo ${n(st.month)} 次`);
  if (st.medianMs != null) items.push(`**上架能撐多久：**中位數約 ${fmtDuration(st.medianMs, L)}，之後 Duo 又會賣完`);
  items.push(`**最快拿到的方法：**[在${w}幫 iPhone Duo 設補貨通知](${alert})，${k <= 3 ? (k === 1 ? "設在這家門市" : k === 2 ? "兩家都設" : "三家都設") : `設在你願意跑一趟、最近的 ${n(Math.min(k, 5))} 家`}；有通知的門市每 5 秒檢查一次`);
  items.push("**一則通知規則** = 一家門市 × 一種確切規格；第二次檢查確認補貨後約 3 秒，推播就到");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**下一分鐘就可能不同：**下一次補貨，通知會比你重新整理 apple.com 早得多看到。" });
  blocks.push({ t: "ul", items: items.map(zs) });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = placeOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = cc.scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: zs(`現在${w}哪幾家 Apple 直營店有 iPhone Duo 可取？`),
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: zs(`${w}有 iPhone 18 Pro Max 現貨嗎？`),
      lead: i.stockNow["18-pro-max"] > 0
        ? zs(`**有，${n(k)} 家中有 ${n(i.stockNow["18-pro-max"])} 家**；${w}的 ${n(k * pm)} 個「門市 × 規格」組合，此刻有 **${cc.pairsPct(i, "18-pro-max")}%** 上架。`)
        : zs(`**此刻沒有**：${w}的 ${n(k)} 家門市都沒有 iPhone 18 Pro Max 可門市取貨。`),
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**此刻最難找：**${list(L, scarce.map((x) => `${zhCfg(x.label)}（${n(k)} 家中 ${n(x.stores)} 家）`))}`] : []),
        `**iPhone 18 Pro：**${n(k)} 家中 ${n(i.stockNow["18-pro"])} 家，${cc.pairsPct(i, "18-pro")}% 的組合上架`,
        `**${sinceWhen()}已確認：**${i.max.month ? `18 Pro Max 補貨 ${n(i.max.month)} 次` : "還沒有 18 Pro Max 補貨"}`,
        ...(i.max.medianMs != null ? [`**上架能撐多久：**中位數約 ${fmtDuration(i.max.medianMs, L)}，之後 Pro Max 又會賣完`] : []),
      ].map(zs) }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ 國家：門市索引與首頁 */

/** 店名（不含 Apple）：「台北 101」。 */
const shortName = (s: Store) => storeLabel(s, L);

function storesIndexTitle(code: CountryCode): string {
  const stores = storesOf(code);
  const k = stores.length;
  const w = cn(code);
  return fitTitleW([
    k <= 3 ? `${w} Apple 直營店：${stores.map(shortName).join("、")} iPhone 即時現貨` : `${w} Apple 直營店：${n(k)} 家 iPhone Duo 門市取貨即時現貨`,
    `${w} Apple 直營店：iPhone Duo 門市取貨即時現貨`,
    `${w} Apple 直營店：iPhone 即時現貨`,
  ].map(zs), 70);
}

function homeTitle(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  return fitTitleW([
    `${w} iPhone 現貨查詢：${n(k)} 家 Apple 直營店門市取貨即時庫存`,
    `${w} iPhone 現貨查詢：Apple 直營店門市取貨即時庫存`,
    `${w} iPhone 現貨查詢`,
  ].map(zs));
}

function homeH1(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  return zs(k === 1 ? `${w} Apple 直營店的 iPhone 門市取貨即時現貨` : `${w}${k === 2 ? "兩家" : `全部 ${n(k)} 家`} Apple 直營店的 iPhone 門市取貨即時現貨`);
}

function allStoresPhrase(code: CountryCode): string {
  const k = storesOf(code).length;
  return zs(k === 1 ? `${cn(code)}唯一的 Apple 直營店` : `${cn(code)}全部 ${n(k)} 家 Apple 直營店`);
}

function spreadPhrase(code: CountryCode): string {
  const c = COUNTRIES[code];
  const regions = statesWithStores(code);
  const cities = citiesWithStores(code);
  const k = storesOf(code).length;
  const city = (x: string) => cityLabel(code, x, L);
  if (k === 1) return `位於${city(cities[0].name)}`;
  if (cities.length === 1) return `都在${city(cities[0].name)}`;
  if (!c.regionNoun || regions.length === 1) return `分布在 ${n(cities.length)} 個城市`;
  return `分布在 ${n(regions.length)} 個${regionZh(c)}的 ${n(cities.length)} 個城市`;
}

function modelPageTitles(code: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const all = k === 1 ? "Apple 直營店" : k === 2 ? "兩家 Apple 直營店" : `全部 ${n(k)} 家 Apple 直營店`;
  return {
    title: fitTitleW([`${w}有 ${m.name} 現貨嗎？${all}即時庫存`, `${w}有 ${m.name} 現貨嗎？即時庫存`, `${m.name} ${w}現貨`].map(zs), 70),
    h2: [zs(`現在${w}哪幾家 Apple 直營店有 ${m.name} 可取？`), priceSection(code, w, undefined, model).h2],
  };
}

function modelIntro(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const r = cc.priceRange(code, model);
  const p = code === "ca" ? `**${money(c, r.low)}** 起（未稅）` : `**${money(c, r.low)}** 起（${taxNoteZh(c)}）`;
  const head = inStock === 0
    ? (k === 1 ? `此刻${w}的 Apple 直營店**沒有**上架 ${m.name} 的門市取貨` : `此刻${w}的 ${n(k)} 家 Apple 直營店**沒有一家**上架 ${m.name} 的門市取貨`)
    : `此刻${w} ${n(k)} 家 Apple 直營店中，有 **${n(inStock)} 家**上架 ${m.name} 的門市取貨`;
  return zs(`${head}（每家門市**每 15 秒**讀取一次）；售價 ${p}。`);
}

function modelDescription(code: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[code];
  const m = modelByKey(model)!;
  const k = storesOf(code).length;
  const w = cn(code);
  const r = cc.priceRange(code, model);
  return fitTitleW([
    `${w} ${n(k)} 家 Apple 直營店中，此刻 ${n(inStock)} 家可門市取貨 ${m.name}。逐店、逐規格列出，售價 ${money(c, r.low)} 起${code === "ca" ? "（未稅）" : ""}，附補貨時段。`,
    `${w} ${n(k)} 家 Apple 直營店中，此刻 ${n(inStock)} 家有 ${m.name}。逐店、逐規格的門市取貨即時現貨、補貨時段與通知。`,
  ].map(zs), 155);
}

function homeDescription(code: CountryCode): string {
  const c = COUNTRIES[code];
  const k = storesOf(code).length;
  return zs(`${allStoresPhrase(code)}的 iPhone Duo、18 Pro 與 18 Pro Max 門市取貨即時現貨，每 15 秒讀取一次。${k === 1 ? "價格" : "價格與各店補貨時段"}以${currencyZh(c)}標示；你的門市一補貨，推播立刻送到。`);
}

function homeIntro(code: CountryCode): string {
  const k = storesOf(code).length;
  const w = cn(code);
  if (k === 1) return zs(`${w}最近一次確認的 iPhone Duo 補貨：**{{duo.lastRestock}}**。此刻${w}的 Apple 直營店門市取貨：iPhone Duo **{{duo.storesNow}} / 1**、iPhone 18 Pro Max **{{pm.storesNow}} / 1**、iPhone 18 Pro **{{pro.storesNow}} / 1**（1 = 有貨）。`);
  return zs(`${w}最近一次確認的 iPhone Duo 補貨：**{{duo.lastRestock}}**。此刻 ${n(k)} 家 Apple 直營店中，**{{duo.storesNow}} 家**可門市取貨 Duo，iPhone 18 Pro Max **{{pm.storesNow}} 家**、iPhone 18 Pro **{{pro.storesNow}} 家**。`);
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const code = i.cc;
  const c = COUNTRIES[code];
  const w = cn(code);
  const stores = storesOf(code);
  const k = stores.length;
  return [
    {
      id: "iphone-stock",
      h2: zs(`${w}現在有哪些 iPhone 有現貨？`),
      lead: zs(`看這張表就知道：apple.com 上${allStoresPhrase(code)}每一種規格的門市取貨供應狀態，每 15 秒讀取一次${k > 1 ? `，並依門市、${regionZh(c)}與規格拆開` : ""}。`),
      blocks: [
        { t: "table", head: ["機型", "規格數", "此刻有貨門市", "已記錄補貨"], rows: cc.modelRows(code, i.storesNow, i.restocks), caption: zs(`${w}即時狀態，截至 {{asOf}}`) },
        { t: "ul", items: [
          "**確認就是看兩次：**第二次讀取一致才會發布變化，apple.com 偶發的錯誤回應不會變成補貨或售完",
          "**第一次看到不算補貨：**某個規格第一次出現，只拿來當基準",
          `**資料出自補貨紀錄：**每次確認的變化都寫進[補貨紀錄](${i.restocksPath})，${i.index?.indexable ? `[各門市頁面](${i.index.path})` : "門市頁面"}上的補貨圖表就是由它畫出`,
          `**涵蓋範圍：**${spreadPhrase(code)}，價格與零件編號都採用 Apple ${w}官網；有通知的門市每 5 秒讀取一次`,
        ].map(zs) },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(code, w),
    {
      id: "alerts",
      h2: zs(`${w}的補貨通知怎麼運作？`),
      lead: zs(`你選門市和確切的手機規格；${k === 1 ? "門市" : "其中任何一家"}一上架門市取貨，補貨確認後約 3 秒，推播就送到你的手機。`),
      blocks: [
        { t: "ol", items: [
          k === 1 ? `在 **通知我** 選擇 iPhone、容量與顏色；門市就是${cityLabel(code, stores[0].city, L)}的 ${appleStoreLabel(stores[0], L)}。` : "在 **通知我** 選擇 iPhone、容量與顏色，再勾選你到得了的門市；最近的排最前面，附道路距離（公里）與車程。",
          "在 iPhone 上，把 RestockWire 加入主畫面並允許通知；iOS 只把網頁推播送給已安裝的 App（[安裝方式](/phone-alerts)）。",
          "推播一到，從推播直接打開 apple.com，結帳時選擇在那家門市取貨。",
        ].map(zs) },
        { t: "table", head: ["方案", "每月（美元）", "通知規則"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "一則規則 = 一家門市 × 一種確切規格；瀏覽一直免費，每個方案速度都一樣（[價格方案](/pricing)）" },
        { t: "note", text: zs("**我們的判斷：**Duo 值得在你到得了的每一家門市都設通知；18 Pro 和 Pro Max，先看即時數字再說。") },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(code: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(code).length;
  const w = cn(code);
  const p = code === "us" ? "" : `/${code}`;
  const when = rt.n === 0
    ? `從 11 月 2 日開始記錄至今，還沒有任何確認的補貨。[Apple 幾點在${w}補貨 iPhone Duo？](${rt.path})會在補貨出現時，依當地小時與星期逐次計入。`
    : rt.peakHour != null
      ? `多半落在**當地時間${hh(rt.peakHour)}**前後：自 11 月 2 日起，${n(rt.storesTotal)} 家門市中有 ${n(rt.stores)} 家，共確認補貨 ${n(rt.n)} 次。[逐小時、逐日看](${rt.path})。`
      : `自 11 月 2 日起，${n(rt.storesTotal)} 家門市中有 ${n(rt.stores)} 家，共確認補貨 ${n(rt.n)} 次；天數還太少，說不出通常幾點。[逐小時、逐日看](${rt.path})。`;
  return [
    { q: zs(`${w}哪些 Apple 直營店此刻有 iPhone Duo 可取貨？`), a: zs(`最近一次讀取（{{asOf}}）時，${n(k)} 家中有 {{duo.storesNow}} 家。[${w} iPhone Duo 現貨](${p}/in-stock/iphone-duo)逐一列出門市與規格，每 15 秒更新。`) },
    { q: zs(`Apple 幾點在${w}補貨 iPhone Duo？`), a: zs(when) },
    { q: zs(`RestockWire 多快能看到${w}的補貨？`), a: zs(`有通知的門市每 5 秒讀取一次，${w}每家 Apple 直營店每 15 秒一次；第一次出現「有貨」，一秒內就會再讀一次。確認後的補貨約 3 秒就送到你的手機。`) },
    { q: "只看庫存也要付費嗎？", a: zs("不用：即時現貨、地圖與補貨紀錄都免費。方案是用來加通知規則的，以美元計費：Plus 每月 $5 可設 10 則、Pro $10 可設 20 則、Max $20 可設 50 則，想取消隨時取消（[價格方案](/pricing)）。") },
    taxFaq(code, w),
    { q: "通知會幫我保留手機嗎？", a: zs(`不會；只有 apple.com 的取貨訂單才會保留。通知讓你搶先進到結帳，付款完成後 Apple 才會替你保留（[Apple 取貨說明](${pickupHelp(code).url})）。`) },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (code: CountryCode) => zs(`RestockWire ${cn(code)} iPhone 現貨查詢`),
  offer: zs("即時現貨、地圖與補貨紀錄免費；通知方案每月 $5 起"),
  itemList: (code: CountryCode) => zs(`${cn(code)}的 Apple 直營店`),
  restockTimesChip: "補貨時段",
  storesByRegion: (code: CountryCode) => `依${regionZh(code)}看門市`,
  browse: (code: CountryCode) => `${cn(code)}各地現貨`,
  selloutH2: (code: CountryCode) => zs(`${cn(code)}的 iPhone 補貨能撐多久？`),
  selloutLabel: (code: CountryCode) => zs(`${cn(code)} Apple 直營店`),
  last24Label: (code: CountryCode) => cn(code),
  newsroom: "iPhone Duo 全球 Apple 直營店同步開賣（Apple Newsroom，2026 年 10 月 23 日）",
};

/** 門市頁的 <title> 與 H1：「Apple 信義 A13：iPhone 現貨查詢、庫存、門市取貨與營業時間」。 */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, L);
  const shown = region && !name.toLowerCase().includes(region.toLowerCase()) ? region : null;
  return fitTitleW(content.titles.store(name, shown).map(zs));
}

function sources(code: Exclude<CountryCode, "us">): { pickupHelp: Source; storeList: Source; tax: Source } {
  const w = cn(code);
  return {
    pickupHelp: { label: zs(`Apple ${w}：取貨說明（取貨要帶什麼）`), url: pickupHelp(code).url },
    storeList: { label: zs(`Apple ${w}：直營店列表`), url: storeListSource(code).url },
    tax: taxSource(code),
  };
}

export const place: Dict["place"] = {
  sinceWhen,
  /** 中文地名不會和美國地名撞名，原樣使用。 */
  placeLabel: (_code: CountryCode, name: string) => name,
  whenIn,
  taxSentence,
  priceSection,
  taxFaq,
  placeTitle,
  placeDescription,
  placeIntro,
  placeSections,
  storesIndexTitle,
  homeTitle,
  homeH1,
  allStoresPhrase,
  spreadPhrase,
  modelPageTitles,
  modelIntro,
  modelDescription,
  modelRows: cc.modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources,
};
