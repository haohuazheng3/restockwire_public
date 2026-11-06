/**
 * 繁體中文（香港）: place — the copy builders of a country's page tree (English: lib/seo/countryCopy.ts), written for
 * Hong Kong readers. Keywords (Google Ads, Hong Kong, monthly): iphone duo 18,100 · apple 廣東道 9,900 · apple ifc
 * 9,900 · apple apm 2,400 · apple store 香港 1,900 · iphone duo 價錢 590 · iphone 18 pro max 現貨 260 · apple 又一城
 * 260 · apple store 沙田 260 · iphone 現貨 210 · apple 銅鑼灣 210 · iphone duo 香港 140. Hong Kong has no sales tax.
 */
import type { Dict } from "../en";
import { INTL_TRACKING_SINCE, duoStoresNow, modelRows, pairsPct, priceOf, priceRange, scarcest, type HomeCopyInput, type IntlPlaceInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, withProvinceTax } from "@/content/country-tax";
import { catalogFor, citiesWithStores, modelByKey, statesWithStores, storesOf, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { alertHref, fmtDuration, listWords, type FaqItem } from "@/lib/seo/enrich";
import { price } from "@/lib/i18n/format";
import { cityLabel } from "@/lib/i18n/places";
import type { KeywordSection } from "@/components/content/KeywordSections";
import type { Block, Faq, Source } from "@/lib/content/types";
import { CURRENCY, HK_TITLE, L, apple, cityNoun, cn, fitW, hr, n, rn, taxNameZh, taxNoteZh, zhCfg, zhPlace, zoneStampZh } from "./common";

type NonUs = Exclude<CountryCode, "us">;
const money = (cc: CountryCode, v: number) => price(L, COUNTRIES[cc], v);
const lw = (items: string[], max = 6) => listWords(items, max, L);

/** "自11月2日起計" while the 14-day window still reaches back to the start, else "最近 14 日". */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 14 * 86400_000 ? "自11月2日起計" : "最近 14 日";
}

/** The official pages behind a country's lines, in Chinese where the source has a Chinese page (Hong Kong). */
function sources(code: NonUs): { pickupHelp: Source; storeList: Source; tax: Source } {
  if (code === "hk") return {
    pickupHelp: { label: "Apple 香港說明頁：Apple Store 提取（到店要帶的證件）", url: "https://www.apple.com/hk-zh/shop/help/shipping_delivery" },
    storeList: { label: "Apple 香港零售店一覽", url: "https://www.apple.com/hk/retail/storelist/" },
    tax: { label: "稅務局：香港稅制資料", url: "https://www.ird.gov.hk/chi/tax/index.htm" },
  };
  return { pickupHelp: pickupHelp(code), storeList: storeListSource(code), tax: TAX_SOURCES[code] };
}

/* ------------------------------------------------------------------ tax */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `在${zhPlace(cc, region!)}，256GB iPhone Duo 結帳約 ${money(cc, t.total)}：Apple 標價 ${money(cc, duo)}，再加 ${n(t.rate)}% ${CA_PROVINCE_TAX[region!].label}。`;
    return `256GB iPhone Duo 未連稅 ${money(cc, duo)}；取貨分店所在省份會在櫃枱另加 5% 至 15%。`;
  }
  const r = includedRate(c);
  if (r == null) return `${money(cc, duo)} 就是 256GB iPhone Duo 取貨時的全部價錢：香港不加任何銷售稅。`;
  return `${money(cc, duo)} 就是在${cn(cc)}取貨 256GB iPhone Duo 的全部價錢，已含 ${r}% ${taxNameZh(c)}。`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const place = zhPlace(cc, placeName);
  const src = sources(cc as NonUs).tax;
  const shopPath = cc === "hk" ? "hk-zh" : (c.buyPath ?? c.shopPath);
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const prov = zhPlace(cc, region!);
      const table: Block = {
        t: "table",
        head: ["機型", "apple.com 標價", `加 ${n(t.total)}% ${t.label} 後`],
        rows: rows.map(([label, p]) => [label, money(cc, p), money(cc, withProvinceTax(p, region!)!.total)]),
        caption: `在${prov}加上 ${t.label}（${n(t.total)}%）後，每款 iPhone 的結帳價`,
        source: `[${src.label}](${src.url})；標價來源：apple.com/ca`,
      };
      const parts = t.hst ? `${n(t.hst)}% 的 HST` : t.pst ? `${t.gst}% GST 加 ${n(t.pst)}% ${t.label.split(" + ")[1]}` : `${t.gst}% GST（該省沒有省銷售稅）`;
      return {
        id: "price-with-tax",
        h2: `${m.name} 在${place}連銷售稅要幾多錢？`,
        lead: `在${place}的分店取貨 256GB ${m.name}，**約 ${money(cc, withProvinceTax(base, region!)!.total)}**：Apple **未連稅 ${money(cc, base)}**，加上${prov}的 ${parts}。`,
        blocks: [table, { t: "note", text: "**稅率看取貨分店：**由分店所在省份決定，與你的住址無關。" }],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `${m.name} 在加拿大連銷售稅要幾多錢？各省比較`,
      lead: `256GB ${m.name} **由${zhPlace(cc, cheapest)}的 ${money(cc, withProvinceTax(base, cheapest)!.total)} 到${zhPlace(cc, dearest)}的 ${money(cc, withProvinceTax(base, dearest)!.total)}**：Apple 標價 ${money(cc, base)} 不含稅，取貨分店所在省份另加 ${n(CA_PROVINCE_TAX[cheapest].total)}% 至 ${n(CA_PROVINCE_TAX[dearest].total)}%。`,
      blocks: [{
        t: "table",
        head: ["省", "稅種", "合計稅率", `${m.short} 256GB 含稅價`],
        rows: provinces.map((p) => [zhPlace(cc, p), CA_PROVINCE_TAX[p].label, `${n(CA_PROVINCE_TAX[p].total)}%`, money(cc, withProvinceTax(base, p)!.total)]),
        caption: "每個設有 Apple Store 的省份，店內取貨須付的銷售稅",
        source: `[${src.label}](${src.url})；標價來源：apple.com/ca`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxNameZh(c);
  return {
    id: "price",
    h2: r == null ? `${m.name} 在${cn(cc)}幾多錢？${money(cc, base)}，不設銷售稅` : `${m.name} 在${cn(cc)}幾多錢？${money(cc, base)}，已含 ${r}% ${tn}`,
    lead: r == null
      ? `在${place}取貨 256GB ${m.name}，付的就是 **${money(cc, base)}，與 apple.com 標價完全一樣**：香港**不設銷售稅**，亦沒有增值稅。`
      : `在${place}取貨 256GB ${m.name} 付 **${money(cc, base)}**，**已含 ${r}% ${tn}**（未連稅 ${money(cc, beforeTax(c, base))}）；櫃枱不會另外加錢。`,
    blocks: [{
      t: "table",
      head: r == null ? ["機型", "apple.com 標價"] : ["機型", "apple.com 標價", `扣除 ${r}% ${tn}`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(cc, p)] : [label, money(cc, p), money(cc, beforeTax(c, p))])),
      caption: `Apple ${cn(cc)}定價，即取貨時實付${r == null ? "（不設銷售稅）" : `（已含${tn}）`}`,
      source: `[${src.label}](${src.url})；標價來源：apple.com/${shopPath}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  const place = zhPlace(cc, placeName);
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `iPhone Duo 在${place}連稅價是多少？`, a: `256GB 約 ${money(cc, t.total)}：Apple 的 ${money(cc, duo)} 再加${zhPlace(cc, region!)}的 ${n(t.rate)}% ${CA_PROVINCE_TAX[region!].label}，由取貨分店收取。` }
      : { q: "Apple 加拿大的標價已含稅嗎？", a: `未含：256GB iPhone Duo 未連稅 ${money(cc, duo)}。取貨分店所在省份會另加 GST、HST 或省銷售稅，由艾伯塔省的 5% 到魁北克省的 14.975%。` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "在香港買 iPhone 要付銷售稅嗎？", a: `不用：香港不設銷售稅，亦沒有增值稅。256GB iPhone Duo 取貨時付 ${money(cc, duo)}，與 apple.com 標價一模一樣。` }
    : { q: `Apple ${cn(cc)}的價錢已包括${taxNameZh(c)}嗎？`, a: `已包括：256GB iPhone Duo 的 ${money(cc, duo)} 已含 ${r}% ${taxNameZh(c)}。取貨櫃枱不會再加任何費用。` };
}

/* ------------------------------------------------------------------ region / city pages */

const placeOf = (i: IntlPlaceInput) => zhPlace(i.cc, i.name, i.kind === "city" ? "city" : "region");

function placeTitle(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitW([
    `${w} iPhone Duo 現貨：${k === 2 ? "兩間" : `${n(k)} 間`} Apple Store 即時取貨`,
    `${w} iPhone Duo 現貨：Apple Store 即時取貨`,
    `${w} iPhone 現貨查詢：Apple Store`,
    `${w} iPhone 現貨（Apple Store）`,
  ]);
}

function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `，Duo 連${zhPlace(cc, region!)}稅項約 ${money(cc, t.total)}` : `，Duo 未連稅 ${money(cc, duo)}`; }
  return `，Duo 售 ${money(cc, duo)}（${taxNoteZh(c)}）`;
}

function placeDescription(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const w = placeOf(i);
  return fitW([
    `${w} ${n(k)} 間 Apple Store 之中，此刻 ${n(i.stockNow.duo)} 間可取貨 iPhone Duo、${n(i.stockNow["18-pro-max"])} 間有 18 Pro Max。逐店列出，附補貨時間${priceBit(i.cc, i.region)}。`,
    `${w} ${n(k)} 間 Apple Store 之中，此刻 ${n(i.stockNow.duo)} 間有 iPhone Duo、${n(i.stockNow["18-pro-max"])} 間有 18 Pro Max。逐店即時更新，附補貨時間。`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（分佈於 ${n(i.cities)} 個${cityNoun(i.cc)}）` : "";
  return `此刻${placeOf(i)}的 **${n(k)} 間 Apple Store**${cities}之中，**${n(i.stockNow.duo)}** 間可取貨 iPhone Duo；iPhone 18 Pro Max 是 **${n(i.stockNow["18-pro-max"])}** 間，iPhone 18 Pro 是 **${n(i.stockNow["18-pro"])}** 間。`;
}

function duoLead(i: IntlPlaceInput): string {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  if (have.length > 0) return `**有，${n(k)} 間中有 ${n(have.length)} 間**：${lw(have.map((s) => apple(s)), 4)}此刻有 iPhone Duo 可取貨。`;
  if (i.duo.month > 0) return `**此刻沒有**：${n(k)} 間分店都沒有 iPhone Duo，不過${sinceWhen()}它們合共已補貨 **${n(i.duo.month)} 次**。`;
  return `**此刻沒有**：${n(k)} 間分店都沒有 iPhone Duo，${sinceWhen()}亦沒有任何一間確認過 Duo 補貨。`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const k = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**這裏最近一次 Duo 補貨：**${zoneStampZh(st.lastRestock.at, i.cc)}，${apple(last)}`);
  if (have.length > 0 && st.month > 0) items.push(`**${sinceWhen()}已確認：**${w}的分店合共補貨 Duo ${n(st.month)} 次`);
  if (st.medianMs != null) items.push(`**上架可維持多久：**中位數約 ${fmtDuration(st.medianMs, L)}，之後 Duo 又會售罄`);
  items.push(`**最快到手的方法：**[在${w}為 iPhone Duo 設定提醒](${alert})，${k <= 3 ? `剔選${k === 2 ? "兩間" : k === 1 ? "這間" : "三間"}分店` : `剔選你願意去、最近的 ${n(Math.min(k, 5))} 間分店`}；有提醒的分店每 5 秒檢查一次`);
  items.push("**一個提醒規則** = 一間分店 × 一款指定配置；第二次檢查確認補貨後約 3 秒，推送就到");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**下一分鐘就可能不同：**下一次補貨，提醒會比你重新整理 apple.com 早得多發現。" });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const k = i.stores.length;
  const w = placeOf(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `${w}哪些 Apple Store 現在有 iPhone Duo？`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}有 iPhone 18 Pro Max 現貨嗎？`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**有，${n(k)} 間中有 ${n(i.stockNow["18-pro-max"])} 間**；${w}的 ${n(k * pm)} 個「分店 × 款式」組合，此刻有 **${pairsPct(i, "18-pro-max")}%** 上架。`
        : `**此刻沒有**：${w}的 ${n(k)} 間分店都沒有 iPhone 18 Pro Max 可供取貨。`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**此刻最難找：**${lw(scarce.map((x) => `${zhCfg(x.label)}（${x.stores === 0 ? `${n(k)} 間都沒有` : `${n(k)} 間中 ${n(x.stores)} 間有貨`}）`))}`] : []),
        `**iPhone 18 Pro：**${n(k)} 間中 ${n(i.stockNow["18-pro"])} 間，${pairsPct(i, "18-pro")}% 的組合上架`,
        `**${sinceWhen()}已確認：**${i.max.month ? `18 Pro Max 補貨 ${n(i.max.month)} 次` : "暫未有 18 Pro Max 補貨"}`,
        ...(i.max.medianMs != null ? [`**上架可維持多久：**中位數約 ${fmtDuration(i.max.medianMs, L)}，之後 Pro Max 又會售罄`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ country: store index and home */

function storesIndexTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  const w = cn(cc);
  return fitW([
    `${w} Apple Store 一覽：${k === 2 ? "兩間" : `${n(k)} 間`}分店的 iPhone Duo 即時取貨`,
    `${w} Apple Store 一覽：iPhone Duo 即時取貨`,
    `${w} Apple Store 一覽與 iPhone 現貨`,
  ], 70);
}

function homeTitle(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return `${cn(cc)} iPhone 現貨：${k === 1 ? "" : `${n(k)} 間 `}Apple Store 取貨存貨，即時更新`;
}

function homeH1(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `${cn(cc)} Apple Store：iPhone 取貨存貨即時看` : `${cn(cc)} ${n(k)} 間 Apple Store：iPhone 取貨存貨即時看`;
}

function allStoresPhrase(cc: CountryCode): string {
  const k = storesOf(cc).length;
  return k === 1 ? `${cn(cc)}僅有的一間 Apple Store` : `${cn(cc)}共 ${n(k)} 間 Apple Store`;
}

function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const k = storesOf(cc).length;
  const one = (x: { name: string }) => cityLabel(cc, x.name, L);
  if (k === 1) return `設於${one(cities[0])}`;
  if (cities.length === 1) return `全數集中在${one(cities[0])}`;
  if (!c.regionNoun || regions.length === 1) return `遍及 ${n(cities.length)} 個${cityNoun(cc)}`;
  return `遍及 ${n(regions.length)} 個${rn(c)}、${n(cities.length)} 個城市`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const w = cn(cc);
  return {
    title: fitW([`${m.name} ${w}現貨：${k === 1 ? "" : `${n(k)} 間 `}Apple Store 此刻有沒有？`, `${m.name} ${w}現貨：此刻有沒有？`, `${m.name} ${w}現貨`], 70),
    h2: [`${m.name} 此刻在${w}哪幾間 Apple Store 有貨？`, priceSection(cc, w, undefined, model).h2],
  };
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  const p = cc === "ca" ? `**${money(cc, r.low)}** 起，不含稅` : `**${money(cc, r.low)}** 起（${taxNoteZh(c)}）`;
  const now = inStock === 0
    ? (k === 1 ? `${m.name} 店內取貨：${cn(cc)}的 Apple Store 此刻**未上架**` : `${m.name} 店內取貨：${cn(cc)} ${n(k)} 間 Apple Store 此刻**全部未上架**`)
    : `${m.name} 店內取貨：此刻 **${n(inStock)}/${n(k)} 間**${cn(cc)} Apple Store 上架`;
  return `${now}。讀取節奏：每間分店**每 15 秒**一次。售價 ${p}。`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const k = storesOf(cc).length;
  const r = priceRange(cc, model);
  return fitW([
    `${m.name} 現貨：此刻${cn(cc)}有 ${n(inStock)}/${n(k)} 間 Apple Store 可取貨。每間店每款配置都列出，售價 ${money(cc, r.low)} 起${cc === "ca" ? "（不含稅）" : ""}，另附補貨鐘點。`,
    `${m.name} 現貨：此刻${cn(cc)}有 ${n(inStock)}/${n(k)} 間 Apple Store 可取貨。逐店逐款列出取貨存貨、補貨鐘點，並可設提醒。`,
  ], 155);
}

/* ------------------------------------------------------------------ country home */



function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  return `每 15 秒一次：讀取${allStoresPhrase(cc)}的 iPhone Duo、18 Pro、18 Pro Max 取貨存貨。附${k === 1 ? "" : "補貨鐘點、"}${CURRENCY[c.currency] ?? c.currency}標價；你揀的分店一補貨，推送幾秒內到手機。`;
}

function homeIntro(cc: CountryCode): string {
  const k = storesOf(cc).length;
  if (k === 1) return `${cn(cc)}最近一次確認的 iPhone Duo 補貨：**{{duo.lastRestock}}**。此刻${cn(cc)} Apple Store 的取貨存貨：iPhone Duo **{{duo.storesNow}}/1**，iPhone 18 Pro Max **{{pm.storesNow}}/1**，iPhone 18 Pro **{{pro.storesNow}}/1**。`;
  return `${cn(cc)}最近一次確認的 iPhone Duo 補貨：**{{duo.lastRestock}}**。此刻 ${n(k)} 間 Apple Store 之中，**{{duo.storesNow}}** 間可取貨 Duo，iPhone 18 Pro Max 有 **{{pm.storesNow}}** 間，iPhone 18 Pro 有 **{{pro.storesNow}}** 間。`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const k = storesOf(cc).length;
  const stores = storesOf(cc);
  const w = cn(cc);
  const by = k > 1 ? `、${c.regionNoun ? rn(c) : cityNoun(cc)}` : "";
  return [
    {
      id: "iphone-stock",
      h2: `${w}現在有哪些 iPhone 有現貨？`,
      lead: `看這個表就知道：apple.com 上${allStoresPhrase(cc)}每一款配置的店內取貨狀態，每 15 秒讀取一次${k > 1 ? `，並按分店${by}及按款式拆開` : ""}。`,
      blocks: [
        { t: "table", head: ["型號", "款式數目", "現時有貨分店", "已記錄補貨"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `${w}即時狀態，截至 {{asOf}}` },
        { t: "ul", items: [
          "**確認即是查兩次：**第二次讀取一致才會發佈變化，apple.com 偶爾一次異常回應不會變成補貨或售罄",
          "**第一次見到不算補貨：**某款配置第一次出現，只用作基準",
          `**數據出自補貨記錄：**每個確認的變化都寫入[補貨記錄](${i.restocksPath})，${i.index?.indexable ? `[各分店頁](${i.index.path})` : "分店頁"}上的補貨圖表就由它繪成`,
          `**覆蓋範圍：**${spreadPhrase(cc)}，價錢及零件編號均採用 Apple ${w}官方資料；有提醒的分店每 5 秒讀取一次`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, w),
    {
      id: "alerts",
      h2: `${w}的補貨提醒如何運作？`,
      lead: `你揀選分店和確切的手機款式；${k === 1 ? "分店" : "其中任何一間"}一上架店內取貨，補貨確認後約 3 秒，推送就送到你的手機。`,
      blocks: [
        { t: "ol", items: [
          k === 1 ? `在「**提醒我**」揀選 iPhone、容量及顏色；分店就是${apple(stores[0])}（${cityLabel(cc, stores[0].city, L)}）。` : "在「**提醒我**」揀選 iPhone、容量及顏色，再剔選你去得到的分店；最近的排最前，附行車距離（公里）及車程。",
          "在 iPhone 上把 RestockWire 加至主畫面並允許通知；iOS 只會把網頁推送送到已安裝的 App（[安裝方法](/phone-alerts)）。",
          "推送一到，直接由通知打開 apple.com，結帳時選擇於該分店「提取」。",
        ] },
        { t: "table", head: ["方案", "月費（美元）", "提醒規則"], rows: [["Plus", "$5", "10"], ["Pro", "$10", "20"], ["Max", "$20", "50"]], caption: "一個規則 = 一間分店 × 一款指定配置；瀏覽一直免費，每個方案速度都一樣（[收費詳情](/pricing)）" },
        { t: "note", text: "**我們的判斷：**Duo 值得在每一間你去得到的分店都設提醒；18 Pro 和 Pro Max，先看即時數字再說。" },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const k = storesOf(cc).length;
  const w = cn(cc);
  const p = `/${cc}`;
  const when = rt.n === 0
    ? `自11月2日開始追蹤以來，暫未確認任何補貨。[Apple 幾點在${w}補貨 iPhone Duo？](${rt.path})會在補貨出現時，按當地鐘點和星期逐次計入。`
    : rt.peakHour != null
      ? `大多落在**當地時間${hr(rt.peakHour)}左右**：自11月2日以來，${n(rt.storesTotal)} 間中有 ${n(rt.stores)} 間，合共確認補貨 ${n(rt.n)} 次。[逐小時、逐日數據](${rt.path})。`
      : `自11月2日以來，${n(rt.storesTotal)} 間中有 ${n(rt.stores)} 間，合共確認補貨 ${n(rt.n)} 次；日子仍太少，未能指出慣常時段。[逐小時、逐日數據](${rt.path})。`;
  return [
    { q: `${w}哪些 Apple Store 此刻有 iPhone Duo 可取貨？`, a: `最近一次讀取（{{asOf}}）時，${n(k)} 間中有 {{duo.storesNow}} 間。[${w} iPhone Duo 現貨](${p}/in-stock/iphone-duo)逐店逐款列出，每 15 秒更新。` },
    { q: `Apple 幾點在${w}補貨 iPhone Duo？`, a: when },
    { q: `RestockWire 多快能發現${w}的補貨？`, a: `有提醒的分店每 5 秒讀取一次，${w}每間 Apple Store 每 15 秒一次；首次出現「有貨」，一秒內會再讀一次。確認後的補貨約 3 秒就送到你的手機。` },
    { q: "只看存貨也要付費嗎？", a: "不用：即時現貨、地圖和補貨記錄全部免費。方案是用來加提醒規則的，以美元收費：Plus 每月 $5 有 10 個、Pro $10 有 20 個、Max $20 有 50 個，隨時想取消就取消（[收費詳情](/pricing)）。" },
    taxFaq(cc, w),
    { q: "提醒會幫我留貨嗎？", a: `不會；只有 apple.com 的提取訂單才會留貨。提醒讓你搶先去到結帳，付款後 Apple 才會為你保留（[Apple 提取服務說明](${sources(cc as NonUs).pickupHelp.url})）。` },
  ];
}

const home: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire：${cn(cc)} iPhone 補貨快訊`,
  offer: "現貨、地圖、補貨快訊免費看；提醒方案 US$5／月起",
  itemList: (cc: CountryCode) => `${cn(cc)} Apple Store`,
  restockTimesChip: "補貨鐘點",
  storesByRegion: (cc: CountryCode) => `分店：逐個${rn(COUNTRIES[cc])}看`,
  browse: (cc: CountryCode) => `${cn(cc)}現貨：分區瀏覽`,
  selloutH2: (cc: CountryCode) => `${cn(cc)}的 iPhone 補貨，多久便賣光？`,
  selloutLabel: (cc: CountryCode) => `${cn(cc)}所有 Apple Store`,
  last24Label: (cc: CountryCode) => cn(cc),
  newsroom: "Apple Newsroom（2026 年 10 月 23 日）：iPhone Duo 在全球 Apple Store 發售",
};


function storeTitle(s: Store, region?: string): string {
  const own = HK_TITLE[s.storeNumber];
  const name = own ? own[0] : apple(s);
  const where = own ? own[1] : region && !name.includes(region) ? region : null;
  const r = where ? `（${where}）` : "";
  return fitW([
    `${name}${r} iPhone 現貨：補貨鐘點・取貨・開店時間`,
    `${name}${r} iPhone 現貨與開店時間`,
    `${name} iPhone 現貨：補貨鐘點・取貨・開店時間`,
    `${name} iPhone 現貨與開店時間`,
    `${name} iPhone 現貨`,
  ]);
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel: (cc: CountryCode, name: string) => zhPlace(cc, name),
  whenIn: (cc: CountryCode, iso: string | Date) => zoneStampZh(iso, cc),
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
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home,
  storeTitle,
  sources,
};
