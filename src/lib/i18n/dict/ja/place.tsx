/**
 * 日本語: place — /ja-jp/… の国ページ群（ホーム、店舗一覧、地域・都市、機種ページ）のタイトル、答え先行の導入文、
 * キーワード節、価格・税の節、FAQ。数字はすべてライブのデータから組み立てる。
 * 検索語（Google 広告・日本・月間）：アップルストア 67.3万、apple 銀座 7.4万、iphone duo 7.4万、アップルストア 店舗 2.2万、
 * アップルストア 在庫 確認 1,000、iphone 在庫 確認 880、iphone duo 価格 2,400、iphone 店頭受け取り 110。
 * タイトルは検索される語を先頭に、幅 60（CJK は 2 幅、fitTitleW）。説明文は幅 155。
 */
import { MODELS, catalogFor, citiesWithStores, statesWithStores, storesOf, modelByKey, type ModelKey, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { CA_PROVINCE_TAX, TAX_SOURCES, beforeTax, includedRate, pickupHelp, storeListSource, taxName, withProvinceTax } from "@/content/country-tax";
import { priceOf, priceRange, scarcest, pairsPct, duoStoresNow, INTL_TRACKING_SINCE, type IntlPlaceInput, type HomeCopyInput, type RestockTimesBrief } from "@/lib/seo/countryCopy";
import { alertHref, fmtDuration, type FaqItem } from "@/lib/seo/enrich";
import type { Block, Faq } from "@/lib/content/types";
import type { KeywordSection } from "@/components/content/KeywordSections";
import { num, price as priceIn, stamp, list, hour, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, configLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import { content } from "./content";

const L = "ja" as const;
const N = (n: number) => num(L, n);
const money = (c: Country, v: number) => priceIn(L, c, v);
const country = (cc: CountryCode) => countryLabel(cc, L);
const pctJa = (n: number) => `${n}%`;
const listJa = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
/** 地域の呼び方（日本：都道府県）。 */
const NOUN: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "市" };
const noun = (c: Country) => NOUN[c.regionNoun ?? "area"] ?? "エリア";
/** 価格に含まれる税の日本語名。 */
const taxJa = (c: Country) => {
  const t = taxName(c);
  return t === "consumption tax" ? "消費税" : t === "VAT" ? "付加価値税" : t === "GST" ? "物品サービス税（GST）" : t;
};
/** 地名を日本語に（すでに日本語ならそのまま）。 */
const placeJa = (i: Pick<IntlPlaceInput, "cc" | "kind" | "name">) => (i.kind === "city" ? cityLabel(i.cc, i.name, L) : regionLabel(i.cc, i.name, L));
const provinceJa = (p: string) => regionLabel("ca", p, L);

/** 「計測を始めた11月2日以降」（30日の窓が計測開始より前に届く間）、その後は「過去30日間」。 */
function sinceWhen(now = Date.now()): string {
  return now - Date.parse(`${INTL_TRACKING_SINCE}T00:00:00Z`) < 14 * 86400_000 ? "11月2日の計測開始から" : "直近14日";
}
/** 「11月2日 15:04 JST」（国の時間帯で）。 */
function whenIn(cc: CountryCode, iso: string | Date): string {
  return stamp(L, iso, COUNTRIES[cc].timeZone, true);
}

/* ------------------------------------------------------------------ 税 */

function taxSentence(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    if (t) return `256GBのiPhone Duoは${provinceJa(region!)}で約${money(c, t.total)}。Appleの税抜${money(c, duo)}に、${t.rate}%（${CA_PROVINCE_TAX[region!].label}）が加わります。`;
    return `256GBのiPhone DuoはAppleの価格で${money(c, duo)}（税抜）。受け取る店舗の州に応じて5〜15%の税が加わります。`;
  }
  const r = includedRate(c);
  if (r == null) return `256GBのiPhone Duoは受け取り時の支払いが${money(c, duo)}ですべて。香港には売上税がありません。`;
  return `256GBのiPhone Duoは、${country(cc)}での受け取り時の支払いが${money(c, duo)}ですべて（${taxJa(c)}${r}%込み）。`;
}

const PRICE_ROWS: [ModelKey, string][] = [["duo", "256GB"], ["duo", "1TB"], ["18-pro-max", "256GB"], ["18-pro-max", "1TB"], ["18-pro", "256GB"]];

/** Apple の価格と、日本語で読める税の出典。 */
function taxSource(cc: Exclude<CountryCode, "us">) {
  return cc === "jp" ? { label: "国税庁：No.6101 消費税の基本的なしくみ", url: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6101.htm" } : TAX_SOURCES[cc];
}

function priceSection(cc: CountryCode, placeName: string, region?: string, model: ModelKey = "duo"): KeywordSection {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const base = priceOf(cc, model) ?? 0;
  const src = taxSource(cc as Exclude<CountryCode, "us">);
  const shop = `apple.com/${c.buyPath ?? c.shopPath}`;
  const rows: [string, number][] = PRICE_ROWS.flatMap(([k, st]) => { const p = priceOf(cc, k, st); return p == null ? [] : [[`${modelByKey(k)!.name} ${st}`, p] as [string, number]]; });
  if (cc === "ca") {
    const t = region ? CA_PROVINCE_TAX[region] : undefined;
    if (t) {
      const pj = provinceJa(region!);
      return {
        id: "price-with-tax",
        h2: `${placeName}で${m.name}は税込いくら？`,
        lead: `${placeName}の店舗で256GBの${m.name}は**約${money(c, withProvinceTax(base, region!)!.total)}**。Appleの**税抜${money(c, base)}**に、${pj}の税（${t.label}、計${t.total}%）が加わります。`,
        blocks: [
          { t: "table", head: ["iPhone", "apple.comの価格", `税込（${t.label} ${t.total}%）`], rows: rows.map(([label, p]) => [label, money(c, p), money(c, withProvinceTax(p, region!)!.total)]), caption: `${pj}で各iPhoneにかかる金額（${t.label} ${t.total}%込み）`, source: `[${src.label}](${src.url})；価格は${shop}より` },
          { t: "note", text: "**税率を決めるのは受け取る店舗：**課税は店舗のある州で決まり、自宅の住所は関係ありません。" },
        ],
      };
    }
    const provinces = Object.keys(CA_PROVINCE_TAX).filter((p) => storesOf("ca").some((s) => s.state === p));
    const cheapest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total < CA_PROVINCE_TAX[a].total ? b : a));
    const dearest = provinces.reduce((a, b) => (CA_PROVINCE_TAX[b].total > CA_PROVINCE_TAX[a].total ? b : a));
    return {
      id: "price-with-tax",
      h2: `カナダで${m.name}は税込いくら？州ごとの比較`,
      lead: `256GBの${m.name}は**${provinceJa(cheapest)}の${money(c, withProvinceTax(base, cheapest)!.total)}から${provinceJa(dearest)}の${money(c, withProvinceTax(base, dearest)!.total)}まで**。Appleの${money(c, base)}は税抜で、受け取る店舗の州が${CA_PROVINCE_TAX[cheapest].total}%〜${CA_PROVINCE_TAX[dearest].total}%を加えます。`,
      blocks: [{
        t: "table",
        head: ["州", "税の種類", "税率", `${m.short} 256GB 税込`],
        rows: provinces.map((p) => [provinceJa(p), CA_PROVINCE_TAX[p].label, `${CA_PROVINCE_TAX[p].total}%`, money(c, withProvinceTax(base, p)!.total)]),
        caption: "アップルストアのある全州：店頭受け取りにかかる売上税",
        source: `[${src.label}](${src.url})／価格の出典：${shop}`,
      }],
    };
  }
  const r = includedRate(c);
  const tn = taxJa(c);
  return {
    id: "price",
    h2: r == null ? `${country(cc)}で${m.name}はいくら？${money(c, base)}から（税なし）` : `${country(cc)}で${m.name}はいくら？${money(c, base)}から（${tn}込み）`,
    lead: r == null
      ? `${placeName}で受け取る256GBの${m.name}は**${money(c, base)}、apple.comの価格そのまま**。香港には**売上税も付加価値税もありません**。`
      : `${placeName}で受け取る256GBの${m.name}は**${money(c, base)}**。**${tn}${r}%はすでに込み**（税抜${money(c, beforeTax(c, base))}）で、カウンターで追加されるものはありません。`,
    blocks: [{
      t: "table",
      head: r == null ? ["iPhone", "apple.com価格"] : ["iPhone", "apple.com価格", `税抜価格（${tn}${r}%）`],
      rows: rows.map(([label, p]) => (r == null ? [label, money(c, p)] : [label, money(c, p), money(c, beforeTax(c, p))])),
      caption: `Appleの${country(cc)}価格＝受け取り時の支払額${r == null ? "" : `（${tn}込み）`}`,
      source: `[${src.label}](${src.url})／価格の出典：${shop}`,
    }],
  };
}

function taxFaq(cc: CountryCode, placeName: string, region?: string): FaqItem {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo") ?? 0;
  if (cc === "ca") {
    const t = region ? withProvinceTax(duo, region) : null;
    return t
      ? { q: `${placeName}でiPhone Duoは税込いくら？`, a: `256GBで約${money(c, t.total)}。Appleの${money(c, duo)}に${provinceJa(region!)}の${t.rate}%（${CA_PROVINCE_TAX[region!].label}）が上乗せされ、受け取る店舗が課税します。` }
      : { q: "Appleのカナダ価格は税込ですか？", a: `いいえ。256GBのiPhone Duoは税抜${money(c, duo)}です。受け取る店舗の州がGST、HST、または州売上税を加え、アルバータ州の5%からケベック州の14.975%までです。` };
  }
  const r = includedRate(c);
  return r == null
    ? { q: "香港でiPhoneを買うと売上税はかかる？", a: `かかりません。香港には売上税も付加価値税もなく、256GBのiPhone Duoは受け取り時も${money(c, duo)}、apple.comの表示どおりです。` }
    : { q: `${country(cc)}のAppleの価格に${taxJa(c)}は含まれている？`, a: `はい。256GBのiPhone Duoの${money(c, duo)}には${taxJa(c)}${r}%が含まれています。受け取りカウンターで追加されるものはありません。` };
}

/* ------------------------------------------------------------------ 地域・都市ページ */

function placeTitle(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const w = placeJa(i);
  return fitTitleW([
    `${w}のアップルストア（${n}店舗）：iPhone Duo受け取り在庫をライブで`,
    `${w}のアップルストア（${n}店舗）：iPhone在庫・再入荷`,
    `${w}のアップルストア｜iPhone在庫`,
    `${w}・アップルストア`,
  ]);
}

/** 説明文の価格部分。 */
function priceBit(cc: CountryCode, region?: string): string {
  const c = COUNTRIES[cc];
  const duo = priceOf(cc, "duo");
  if (duo == null) return "";
  if (cc === "ca") { const t = region ? withProvinceTax(duo, region) : null; return t ? `、税込で約${money(c, t.total)}` : `、税別${money(c, duo)}`; }
  return includedRate(c) == null ? `、${money(c, duo)}〜` : `、税込${money(c, duo)}〜`;
}

function placeDescription(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const w = placeJa(i);
  return fitTitleW([
    `いま${w}のアップルストア${n}店舗中${N(i.stockNow.duo)}店舗でiPhone Duoを店頭受け取りでき、18 Pro Maxは${N(i.stockNow["18-pro-max"])}店舗。店舗ごとの在庫と再入荷の時間帯${priceBit(i.cc, i.region)}。`,
    `いま${w}のアップルストア${n}店舗中${N(i.stockNow.duo)}店舗にiPhone Duo、${N(i.stockNow["18-pro-max"])}店舗に18 Pro Max。店舗別ライブ在庫と再入荷の時間帯。`,
  ], 155);
}

function placeIntro(i: IntlPlaceInput): string {
  const w = placeJa(i);
  const cities = i.kind === "state" && i.cities && i.cities > 1 ? `（${N(i.cities)}の都市に分散）` : "";
  return `この瞬間、**${w}のアップルストア${N(i.stores.length)}店舗**${cities}のうち**${N(i.stockNow.duo)}店舗**でiPhone Duoを店頭受け取りできます。iPhone 18 Pro Maxは**${N(i.stockNow["18-pro-max"])}店舗**、iPhone 18 Proは**${N(i.stockNow["18-pro"])}店舗**です。`;
}

/** 「256GB Night Sky」→「256GB ナイトスカイ」。 */
const cfgJa = (label: string) => { const [storage, ...rest] = label.split(" "); return configLabel({ storage, color: rest.join(" ") }, L); };

function duoLead(i: IntlPlaceInput): string {
  const n = N(i.stores.length);
  const have = duoStoresNow(i);
  const st = i.duo;
  if (have.length > 0) return `**あります。${n}店舗中${N(have.length)}店舗**：${listJa(have.map((s) => appleStoreLabel(s, L)), 4)}で、いまiPhone Duoを店頭受け取りできます。`;
  if (st.month > 0) return `**この瞬間はありません**。${n}店舗のどこにもiPhone Duoは並んでいませんが、${sinceWhen()}に合わせて**${N(st.month)}回**再入荷しています。`;
  return `**この瞬間はありません**。${n}店舗のどこにもiPhone Duoは並んでおらず、${sinceWhen()}に確認されたDuoの再入荷もありません。`;
}

function duoPoints(i: IntlPlaceInput, w: string, alert: string): Block[] {
  const n = i.stores.length;
  const have = duoStoresNow(i);
  const st = i.duo;
  const last = st.lastRestock ? i.stores.find((s) => s.storeNumber === st.lastRestock!.storeNumber) : undefined;
  const items: string[] = [];
  if (st.lastRestock && last) items.push(`**ここでの最新のDuo再入荷：**${whenIn(i.cc, st.lastRestock.at)}、${appleStoreLabel(last, L)}`);
  if (have.length > 0 && st.month > 0) items.push(`**${sinceWhen()}に確認：**${w}の店舗でDuoの再入荷${N(st.month)}回`);
  if (st.medianMs != null) items.push(`**在庫が並ぶ時間：**Duoは中央値で約${fmtDuration(st.medianMs, L)}で再び売り切れます`);
  items.push(`**手に入れる最短ルート：**行ける${n <= 3 ? `${N(n)}店舗` : `近い${N(Math.min(n, 5))}店舗`}で[${w}のiPhone Duoを見張る](${alert})。通知を設定した店舗は5秒ごとにチェックします`);
  items.push("**通知1件**＝1店舗 × 1つの構成。2回目のチェックで再入荷を確認してから約3秒でプッシュが届きます");
  const blocks: Block[] = [];
  if (have.length === 0 && st.month === 0) blocks.push({ t: "note", text: "**状況は1分で変わります：**次の再入荷は、apple.comを再読み込みするよりずっと早く通知が見つけます。" });
  blocks.push({ t: "ul", items });
  return blocks;
}

function placeSections(i: IntlPlaceInput): KeywordSection[] {
  const n = i.stores.length;
  const w = placeJa(i);
  const alert = alertHref({ model: "duo", state: i.regionSlug || undefined, city: i.kind === "city" ? i.citySlug : undefined, country: i.cc });
  const scarce = scarcest(i, "18-pro-max");
  const pm = catalogFor("18-pro-max", i.cc).length;
  return [
    {
      id: "iphone-duo",
      h2: `${w}でいまiPhone Duoの在庫があるアップルストアは？`,
      lead: duoLead(i),
      blocks: duoPoints(i, w, alert),
    },
    {
      id: "iphone-18-pro-max",
      h2: `${w}にiPhone 18 Pro Maxの在庫はある？`,
      lead: i.stockNow["18-pro-max"] > 0
        ? `**あります。${N(n)}店舗中${N(i.stockNow["18-pro-max"])}店舗**。${w}の店舗×構成${N(n * pm)}通りのうち、いま**${pctJa(pairsPct(i, "18-pro-max"))}**に在庫があります。`
        : `**この瞬間はありません**。${w}の${N(n)}店舗のどこにも、店頭受け取りできるiPhone 18 Pro Maxは並んでいません。`,
      blocks: [{ t: "ul", items: [
        ...(scarce.length ? [`**いま最も見つけにくい構成：**${listJa(scarce.map((x) => `${cfgJa(x.label)}（${N(n)}店舗中${N(x.stores)}店舗）`))}`] : []),
        `**iPhone 18 Pro：**${N(n)}店舗中${N(i.stockNow["18-pro"])}店舗、組み合わせの${pctJa(pairsPct(i, "18-pro"))}に在庫`,
        `**${sinceWhen()}に確認：**${i.max.month ? `18 Pro Maxの再入荷${N(i.max.month)}回` : "18 Pro Maxの再入荷はまだなし"}`,
        ...(i.max.medianMs != null ? [`**在庫が並ぶ時間：**Pro Maxは中央値で約${fmtDuration(i.max.medianMs, L)}で再び売り切れます`] : []),
      ] }],
    },
    priceSection(i.cc, w, i.cc === "ca" ? i.region : undefined),
  ];
}

/* ------------------------------------------------------------------ 国：店舗一覧とホーム */

function storesIndexTitle(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  const head = cc === "jp" ? "アップルストア店舗一覧" : `アップルストア一覧（${country(cc)}）`;
  return fitTitleW([`${head}（全${n}店舗）：iPhone Duo受け取り在庫をライブで`, `${head}（全${n}店舗）：iPhone在庫`, `${country(cc)}のアップルストア：iPhone在庫をライブで`], 70);
}

function homeTitle(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  const head = cc === "jp" ? "アップルストアの在庫確認" : `アップルストア在庫確認（${country(cc)}）`;
  return fitTitleW([`${head}｜全${n}店舗のiPhone受け取り在庫をライブで`, `${head}｜全${n}店舗のiPhone在庫`, `${head}（全${n}店舗）`, head]);
}

function homeH1(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `${country(cc)}のアップルストア：iPhone受け取り在庫をライブで` : `${country(cc)}のアップルストア全${N(n)}店舗：iPhone受け取り在庫をライブで`;
}

function allStoresPhrase(cc: CountryCode): string {
  const n = storesOf(cc).length;
  return n === 1 ? `${country(cc)}唯一のアップルストア` : `${country(cc)}にある全${N(n)}店舗のアップルストア`;
}

/** 店舗の分布：「6つの都道府県にまたがる6都市」「全店が東京」「東京」。 */
function spreadPhrase(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const regions = statesWithStores(cc);
  const cities = citiesWithStores(cc);
  const n = storesOf(cc).length;
  if (n === 1) return cityLabel(cc, cities[0].name, L);
  if (cities.length === 1) return `全店が${cityLabel(cc, cities[0].name, L)}`;
  if (!c.regionNoun || regions.length === 1) return `${N(cities.length)}つの都市`;
  return `${N(regions.length)}つの${noun(c)}にまたがる${N(cities.length)}都市`;
}

function modelPageTitles(cc: CountryCode, model: ModelKey): { title: string; h2: string[] } {
  const m = modelByKey(model)!;
  const n = storesOf(cc).length;
  const all = n === 1 ? "唯一のアップルストア" : `全${N(n)}店舗のアップルストア`;
  return {
    title: fitTitleW([`${country(cc)}で${m.name}の在庫はある？${all}をライブで`, `${country(cc)}で${m.name}の在庫はある？ライブ`, `${m.name}の在庫（${country(cc)}）`], 70),
    h2: [`いま${m.name}の在庫がある${country(cc)}のアップルストアは？`, priceSection(cc, country(cc), undefined, model).h2],
  };
}

function priceFrom(cc: CountryCode, model: ModelKey): string {
  const c = COUNTRIES[cc];
  const r = priceRange(cc, model);
  if (cc === "ca") return `**${money(c, r.low)}**（税別）`;
  return includedRate(c) == null ? `**${money(c, r.low)}**` : `**${money(c, r.low)}**（${taxJa(c)}を含む）`;
}

function modelIntro(cc: CountryCode, model: ModelKey, inStock: number): string {
  const m = modelByKey(model)!;
  const n = N(storesOf(cc).length);
  const now = inStock === 0
    ? `この瞬間、${m.name}を店頭受け取りできる${country(cc)}のアップルストアは**${n}店舗中ゼロ**です`
    : `この瞬間、${country(cc)}のアップルストア**${n}店舗中${N(inStock)}店舗**で${m.name}を店頭受け取りできます`;
  return `${now}（全店舗を**15秒ごと**にチェック）。価格は${priceFrom(cc, model)}から。`;
}

function modelDescription(cc: CountryCode, model: ModelKey, inStock: number): string {
  const c = COUNTRIES[cc];
  const m = modelByKey(model)!;
  const n = N(storesOf(cc).length);
  const r = priceRange(cc, model);
  const p = `${money(c, r.low)}${cc === "ca" ? "（税別）" : includedRate(c) == null ? "" : "（税込価格）"}`;
  return fitTitleW([
    `この瞬間、${country(cc)}のアップルストア${n}店舗中${N(inStock)}店舗で${m.name}を店頭受け取りできます。店舗別・構成別に、価格は${p}から、再入荷の時間帯も。`,
    `いま${country(cc)}のアップルストア${n}店舗中${N(inStock)}店舗に${m.name}。店舗・構成別のライブ受け取り在庫、再入荷の時間帯、通知。`,
  ], 155);
}

function modelRows(cc: CountryCode, storesNow: Record<ModelKey, number>, restocks: Record<ModelKey, number>): string[][] {
  const prefix = cc === "us" ? "" : `/${cc}`;
  return MODELS.map((m) => [`[${m.name}](${prefix}/in-stock/${m.slug})`, N(catalogFor(m.key, cc).length), N(storesNow[m.key] ?? 0), N(restocks[m.key] ?? 0)]);
}

function homeDescription(cc: CountryCode): string {
  const c = COUNTRIES[cc];
  const n = storesOf(cc).length;
  const cur = c.currency === "JPY" ? "円" : c.currency;
  return fitTitleW([
    `${allStoresPhrase(cc)}のiPhone Duo・18 Pro・18 Pro Max受け取り在庫をライブで。15秒ごとに読み取り。${n === 1 ? "価格" : "再入荷の時間帯と価格"}（${cur}）、店舗に再入荷した瞬間にプッシュ。`,
    `${allStoresPhrase(cc)}のiPhone受け取り在庫を15秒ごとにライブで。${n === 1 ? "価格" : "再入荷の時間帯と価格"}も、再入荷した瞬間にプッシュ。`,
  ], 155);
}

function homeIntro(cc: CountryCode): string {
  const n = N(storesOf(cc).length);
  return `${country(cc)}で確認された最新のiPhone Duo再入荷：**{{duo.lastRestock}}**。この瞬間、アップルストア**${n}店舗中{{duo.storesNow}}店舗**でDuoを店頭受け取りでき、iPhone 18 Pro Maxは**{{pm.storesNow}}店舗**、iPhone 18 Proは**{{pro.storesNow}}店舗**です。`;
}

function homeSections(i: HomeCopyInput): KeywordSection[] {
  const cc = i.cc;
  const c = COUNTRIES[cc];
  const stores = storesOf(cc);
  const n = stores.length;
  return [
    {
      id: "iphone-stock",
      h2: `iPhoneの在庫確認：いま${country(cc)}で在庫があるiPhoneは？`,
      lead: `答えは下の表にライブで出ています。${allStoresPhrase(cc)}について、apple.com自身の店頭受け取り在庫を全構成ぶん15秒ごとに読み取り${n > 1 ? `、店舗別・${c.regionNoun ? noun(c) : "都市"}別・構成別に分けて` : ""}表示しています。`,
      blocks: [
        { t: "table", head: ["機種", "構成", "いま在庫のある店舗", "確認済みの再入荷"], rows: modelRows(cc, i.storesNow, i.restocks), caption: `${country(cc)}の状況（{{asOf}}時点）` },
        { t: "ul", items: [
          "**確認は2回：**2回目のチェックが一致して初めて公開するので、apple.comの一時的な誤表示が再入荷や完売として出ることはありません",
          "**初めて見た在庫は再入荷ではない：**初めて確認した構成は基準になるだけです",
          `**出典は記録：**確認した変化はすべて[再入荷の記録](${i.restocksPath})に入り、${i.index?.indexable ? `[各店舗ページ](${i.index.path})` : "店舗ページ"}の再入荷グラフになります`,
          `**対象：**${N(n)}店舗（${spreadPhrase(cc)}）、価格と型番はAppleの${country(cc)}版。通知を設定した店舗は5秒ごとにチェック`,
        ] },
        { t: "img", id: "phone-notification" },
      ],
    },
    priceSection(cc, country(cc)),
    {
      id: "alerts",
      h2: `${country(cc)}で再入荷通知はどう届く？`,
      lead: `店舗とiPhoneを正確に選ぶだけ。${n === 1 ? "その店舗" : "どれかの店舗"}で店頭受け取りに並ぶと、再入荷を確認してから約3秒でスマートフォンにプッシュが届きます。`,
      blocks: [
        { t: "ol", items: [
          n === 1 ? `**通知を設定**でiPhone、容量、カラーを選びます。店舗は${appleStoreLabel(stores[0], L)}（${cityLabel(cc, stores[0].city, L)}）です。` : "**通知を設定**でiPhone、容量、カラーを選び、行ける店舗にチェック。近い順に、道のりのkmと所要時間つきで並びます。",
          "iPhoneでは、RestockWireをホーム画面に追加して通知を許可します。iOSはインストールしたアプリにしかWebプッシュを届けません（[追加の方法](/phone-alerts)）。",
          "プッシュが届いたらそこからapple.comを開き、その店舗の店頭受け取りで購入します。",
        ] },
        { t: "table", head: ["プラン", "月額（米ドル）", "通知"], rows: [["Plus", "$5", "10件"], ["Pro", "$10", "20件"], ["Max", "$20", "50件"]], caption: "通知1件＝1店舗 × 1つの構成 · 閲覧は無料、速さはどのプランも同じ（[料金](/pricing)）" },
        { t: "note", text: "**私たちの見立て：**Duoは行ける店舗すべてに通知する価値があります。18 Proと18 Pro Maxは、まずライブの数字を確認してから。" },
        { t: "img", id: "apple-store-pickup-counter" },
      ],
    },
  ];
}

function homeFaq(cc: CountryCode, rt: RestockTimesBrief): Faq[] {
  const n = N(storesOf(cc).length);
  const p = cc === "us" ? "" : `/${cc}`;
  const when = rt.n === 0
    ? `11月2日の計測開始以来、確認された再入荷はまだありません。[${country(cc)}でiPhone Duoが再入荷するのはいつ？](${rt.path})で、再入荷があるたびに現地時間の時間帯・曜日ごとに数えます。`
    : rt.peakHour != null
      ? `多くは**現地時間の${hour(L, rt.peakHour, true)}ごろ**。11月2日以降、${N(rt.storesTotal)}店舗中${N(rt.stores)}店舗で確認済みの再入荷が${N(rt.n)}回です。[時間帯別・日別の詳細](${rt.path})。`
      : `11月2日以降、${N(rt.storesTotal)}店舗中${N(rt.stores)}店舗で確認済みの再入荷が${N(rt.n)}回。ただし日数が少なく、いつもの時間帯はまだ言えません。[時間帯別・日別の詳細](${rt.path})。`;
  return [
    { q: `この瞬間、iPhone Duoの在庫がある${country(cc)}のアップルストアは？`, a: `前回の読み取り（{{asOf}}）で${n}店舗中{{duo.storesNow}}店舗。[${country(cc)}のiPhone Duo在庫](${p}/in-stock/iphone-duo)で店舗と構成を一つずつ確認でき、15秒ごとに更新されます。` },
    { q: `iPhone Duoは${country(cc)}でいつ再入荷する？`, a: when },
    { q: `RestockWireは${country(cc)}の再入荷をどれくらい速く捉える？`, a: `通知を設定した店舗は5秒ごと、${country(cc)}の全アップルストアは15秒ごとに読み取ります。最初の「在庫あり」は1秒以内に読み直し、確認済みの再入荷は約3秒後にスマートフォンに届きます。` },
    { q: "在庫を見るのにプランは必要？", a: "いいえ。ライブ在庫、地図、再入荷の記録は無料です。プランで通知が使え、米ドルで請求：Plusは月$5で10件、Proは$10で20件、Maxは$20で50件。いつでも解約できます（[料金](/pricing)）。" },
    taxFaq(cc, country(cc)),
    { q: "通知でiPhoneを確保してもらえる？", a: `いいえ。確保できるのはapple.comの店頭受け取り注文だけです。通知はあなたを誰よりも先に購入画面へ送り、支払いが済めばAppleが商品を確保します（[Appleの受け取りヘルプ](${pickupHelp(cc).url})）。` },
  ];
}

const homeLabels: Dict["place"]["home"] = {
  appName: (cc: CountryCode) => `RestockWire iPhone在庫確認（${country(cc)}）`,
  offer: "ライブ在庫・地図・再入荷の記録は無料、通知プランは月$5から",
  itemList: (cc: CountryCode) => `${country(cc)}のアップルストア所在地一覧`,
  restockTimesChip: "再入荷の時間帯",
  storesByRegion: (cc: CountryCode) => `${noun(COUNTRIES[cc])}ごとの店舗`,
  browse: (cc: CountryCode) => `${country(cc)}の場所別の在庫`,
  selloutH2: (cc: CountryCode) => `${country(cc)}のiPhone再入荷はどれくらい持つ？`,
  selloutLabel: (cc: CountryCode) => `${country(cc)}の全アップルストア`,
  last24Label: (cc: CountryCode) => country(cc),
  newsroom: "Apple Newsroom：iPhone Duo、世界各地のApple Storeに到着（2026年10月23日・英文）",
};

/** 店舗ページの <title> と H1：「Apple 銀座：iPhone在庫・店頭受け取り・営業時間」。`region` はその都市・地域で唯一の店舗のとき。 */
function storeTitle(s: Store, region?: string): string {
  const name = appleStoreLabel(s, L);
  const shown = region && !name.includes(region) && !storeLabel(s, L).includes(region) ? region : null;
  return fitTitleW(content.titles.store(name, shown));
}

export const place: Dict["place"] = {
  sinceWhen,
  placeLabel: (_cc: CountryCode, name: string) => name,
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
  modelRows,
  homeDescription,
  homeIntro,
  homeSections,
  homeFaq,
  home: homeLabels,
  storeTitle,
  sources: (code: Exclude<CountryCode, "us">) => ({
    pickupHelp: { label: "Apple：出荷・配送と受取について（受け取りの流れ）", url: pickupHelp(code).url },
    storeList: { label: code === "jp" ? "Apple：直営店のApple Store一覧（日本）" : `Apple：直営店のApple Store一覧（${country(code)}）`, url: storeListSource(code).url },
    tax: taxSource(code),
  }),
};
