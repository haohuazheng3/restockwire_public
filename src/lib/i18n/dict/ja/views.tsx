/**
 * 日本語: views — 製品×場所ページ、入荷履歴、在庫マップ、iPhone Duo の入荷時間ページ、店舗一覧（/ja-jp/…）。
 * `c: Country` は英語データ：国名は countryLabel、地域の呼び方は日本語の対応表で書く。
 * `name` `place` `region` `city` `store` `config` の文字列は日本語で届く。`Store` / `Place` オブジェクトは英語データなので places で名前を引く。
 * モジュールへ渡すラベル（inPlace / inCountry）は助詞なしの名詞句（「東京」「Apple 銀座」「日本」）。
 * 機種名・容量・Apple Store・RestockWire・URL・型番は訳さない。チェック間隔は 15 秒と 5 秒のみ。返金には触れない。
 */
import type { ReactNode } from "react";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import type { Point } from "@/components/ui/Viz";
import type { Faq } from "@/lib/content/types";
import { catalogFor, modelByKey, storePath, type Store } from "@/lib/apple/catalog";
import { COUNTRIES, type Country, type CountryCode } from "@/lib/apple/countries";
import { faq as placeFaq, fmtDuration, peakOf, type FaqContext, type FaqItem } from "@/lib/seo/enrich";
import type { Place, Product } from "@/lib/seo/products";
import type { StoreLine } from "@/lib/seo/productData";
import type { PlaceStats, RestockStats } from "@/lib/stock/queries";
import { hourShare, type DayRow, type SelloutFacts } from "@/lib/content/restockTimes";
import { PATTERN_MIN, PATTERN_MIN_DAYS, WEEKDAY_MIN_SPAN, localStamp } from "@/lib/content/siteFacts";
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { includedRate, taxName } from "@/content/country-tax";
import { num, list, stamp, weekdays, price as priceIn, distance, fitTitleW } from "@/lib/i18n/format";
import { appleStoreLabel, cityLabel, colorLabel, countryLabel, regionLabel, storeLabel } from "@/lib/i18n/places";
import type { Dict } from "../en";
import type { RestockTimesMeta, RestockTimesView } from "../en/views";
import { content } from "./content";

type RT = Dict["views"]["restockTimes"];

const L = "ja" as const;
const N = (n: number) => num(L, n);
const country = (c: Pick<Country, "cc">) => countryLabel(c.cc, L);
const listJa = (items: string[], max = 6) => list(L, items, max, (n) => content.listMore(N(n)));
/** 地域の呼び方（日本：都道府県）。 */
const NOUN: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "市" };
const noun = (c: Country) => NOUN[c.regionNoun ?? "area"] ?? "エリア";
/** 他サイトが公表しているチェック間隔（「8秒〜15分」）。 */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `${m[1]}秒〜${m[2]}分` : OTHER_TRACKERS;
})();
/** 価格に含まれる税：「消費税（10%）込み」。 */
function taxNoteJa(c: Country): string {
  if (c.cc === "us") return "税抜（州により異なる）";
  if (c.cc === "ca") return "税抜（GST/HSTと州税は別）";
  const r = includedRate(c);
  if (r == null) return "香港は売上税なし";
  const t = taxName(c);
  return `${t === "consumption tax" ? "消費税" : t === "VAT" ? "付加価値税" : t}（${r}%）込み`;
}

/* ---------------------------------------------------------------- 製品×場所の名前 */

const ccOf = (p: { country?: CountryCode }) => p.country ?? "us";
/** 「iPhone Duo 512GB ナイトスカイ」。 */
function productName(p: Product, short = false): string {
  const m = modelByKey(p.model)!;
  return `${short ? m.short : m.name}${p.storage ? ` ${p.storage}` : ""}${p.color ? ` ${colorLabel(p.color, L)}` : ""}`;
}
/** 店舗名に都市名が含まれないときだけ「（東京）」を添える。 */
const cityNote = (s: Store) => { const city = cityLabel(s.country ?? "us", s.city, L); return appleStoreLabel(s, L).includes(city) ? "" : `（${city}）`; };
/** 場所の日本語名：国、地域、都市、「Apple 銀座」。 */
function placeNameJa(place: Place): string {
  const cc = ccOf(place);
  if (place.level === "country") return countryLabel(cc, L);
  if (place.level === "state") return regionLabel(cc, place.state!, L);
  if (place.level === "city") return cityLabel(cc, place.city!, L);
  return appleStoreLabel(place.store!, L);
}
const apple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

function productTitle(product: Product, place: Place, inStock: number): string {
  const n = place.stores.length;
  const name = productName(product), short = productName(product, true);
  if (place.level === "country") {
    const w = countryLabel(ccOf(place), L);
    return fitTitleW([...(inStock > 0 ? [`${w}のアップルストア${N(inStock)}店舗がいま${name}を掲載`] : []), `${w}の${name}：受け取り在庫をライブで`, `${w}の${short}：受け取り在庫`, `${short}の受け取り在庫`]);
  }
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "いま受け取り可能" : "受け取り在庫と入荷";
    return fitTitleW([`${a}の${name}：${now}`, `${a}${cityNote(s)}の${short}`, `${a}の${short}`, `${storeLabel(s, L)}の${short}`]);
  }
  const w = placeNameJa(place);
  return fitTitleW([`${w}の${name}：いま${N(n)}店舗中${N(inStock)}店舗が掲載`, `${w}の${name}：受け取り在庫をライブで`, `${w}の${short}：いま在庫ある？`, `${w}の${short}`]);
}

function productDescription(product: Product, place: Place, inStock: number, stats: PlaceStats): string {
  const name = productName(product);
  const week = `今週の入荷は${N(stats.week)}回`;
  if (place.level === "store") {
    const s = place.store!;
    const a = appleStoreLabel(s, L);
    const now = inStock > 0 ? "最新の読み取りで受け取り可能" : "いまは受け取り不可";
    return fitTitleW([
      `${a}${cityNote(s)}の${name}：${now}、${week}。この店舗の入荷時間、在庫が残る時間、次の入荷を知らせる通知。`,
      `${a}の${name}：${now}、${week}。入荷時間と通知。`,
    ], 155);
  }
  const where = `${placeNameJa(place)}のアップルストア`;
  const n = N(place.stores.length);
  return fitTitleW([
    `いま${where}${n}店舗中${N(inStock)}店舗が${name}の店頭受け取りを掲載、${week}。店舗ごとの在庫、入荷時間、次の入荷を知らせる通知。`,
    `${name}：${where}${n}店舗中${N(inStock)}店舗に在庫、${week}。店舗別ライブ在庫、入荷時間、通知。`,
  ], 155);
}

function productFaq(product: Product, place: Place, lines: StoreLine[], stats: PlaceStats, clock: RestockStats, nearest: { name: string; city: string; distance: number } | null): FaqItem[] {
  const out: FaqItem[] = [];
  const name = productName(product);
  const at = placeNameJa(place);
  const cc = ccOf(place);
  const near = nearest ? `${apple(nearest.name)}（${nearest.city}・${distance(L, cc, nearest.distance)}）` : null;
  const inStock = lines.filter((l) => l.available.length > 0);
  if (place.level === "store") {
    const l = lines[0];
    out.push({
      q: `いま${at}に${name}の在庫はある？`,
      a: l && l.available.length > 0
        ? product.parts.length > 1 ? `あります。最新の読み取りで${listJa(l.available.map((i) => `${i.storage} ${colorLabel(i.color, L)}`), 4)}が受け取り可能でした。` : "あります。最新の読み取りで受け取り可能でした。"
        : `最新の読み取りではありません${near ? `。掲載中の最寄り店舗は${near}です` : ""}。`,
    });
  } else {
    out.push({
      q: `いま${at}で${name}を掲載しているアップルストアは？`,
      a: inStock.length === 0
        ? `最新の読み取りではゼロです${near ? `。掲載中の最寄り店舗は${near}です` : ""}。`
        : `最新の読み取りで${N(inStock.length)}店舗：${listJa(inStock.map((x) => appleStoreLabel(x.store, L)), 4)}。`,
    });
  }
  const peak = peakOf(clock, L);
  out.push({
    q: `${at}では${name}がどのくらいの頻度で再入荷する？`,
    a: stats.month === 0 ? `過去${N(stats.days)}日間、${at}で確認済みの入荷はありません。` : `過去${N(stats.days)}日間で確認済みの入荷${N(stats.month)}回、うち今週${N(stats.week)}回${peak ? `。現地時間の${peak.hour}前後に集中しています` : ""}。`,
  });
  if (stats.medianMs != null) out.push({ q: `${at}で${name}の入荷はどのくらい残る？`, a: `中央値で約${fmtDuration(stats.medianMs, L)}。その後また完売します。` });
  return out;
}

function priceLabelJa(product: Product): string {
  const cc = ccOf(product);
  const prices = catalogFor(product.model, cc).filter((c) => product.parts.includes(c.partNumber)).map((c) => c.price);
  const lo = Math.min(...prices), hi = Math.max(...prices);
  const f = (v: number) => priceIn(L, COUNTRIES[cc], v);
  return lo === hi ? f(lo) : `${f(lo)}〜${f(hi)}`;
}

/* ---------------------------------------------------------------- 入荷時間ページの書式 */

/** 0〜1 の割合を整数％で（0.5% 未満は「<1%」）。 */
const rtPct = (x: number) => (x > 0 && x < 0.005 ? "<1%" : `${Math.round(x * 100)}%`);
/** 暦日（YYYY-MM-DD）：「11月3日(火)」、曜日なしで「11月3日」。 */
const dateLabel = (ymd: string, weekday = true) => new Intl.DateTimeFormat("ja-JP", { timeZone: "UTC", month: "short", day: "numeric", ...(weekday ? { weekday: "short" as const } : {}) }).format(new Date(`${ymd}T12:00:00Z`));
const longDate = (ymd: string) => new Intl.DateTimeFormat("ja-JP", { timeZone: "UTC", month: "long", day: "numeric", year: "numeric" }).format(new Date(`${ymd}T12:00:00Z`));
const zoneStamp = (iso: string, c: Country) => stamp(L, iso, c.timeZone, true);
const hourLabel = (h: number) => `${h}時`;
/** 「9〜11時」。 */
const rangeLabel = (from: number, to: number) => `${from}〜${to}時`;
const weekdayName = (d: number) => weekdays(L)[d];
const storeJa = (s: Store) => appleStoreLabel(s, L);
const rtRegion = (x: { us: boolean; c: Country }) => (x.us ? "州" : noun(x.c));
const zero = "検証できる入荷がまだ記録されていません。";

/** 英語の時刻（「10 AM」）と曜日（「Tuesday」）で届いた peak を日本語に。 */
function peakJa(p: FaqContext["peak"]): FaqContext["peak"] {
  if (!p) return p;
  const m = p.hour.match(/^(\d{1,2}) (AM|PM)$/);
  const hour = m ? `${(Number(m[1]) % 12) + (m[2] === "PM" ? 12 : 0)}時` : p.hour;
  const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(p.day ?? "");
  return { ...p, hour, day: en >= 0 ? weekdayName(en) : p.day };
}

export const views: Dict["views"] = {
  common: {
    inCountry: (c: Country) => country(c),
    liveMap: "ライブマップ",
    restockLog: "入荷記録",
    alertMe: "通知を受け取る",
    lastDays: (days: number) => <>{N(days)}日間の日別推移</>,
    since: "2026年11月2日",
    sourcesWhere: (n: number, c: Country) => `${country(c)}の${n === 1 ? "アップルストア" : `アップルストア全${N(n)}店舗`}`,
    checker: (c: Country) => `${country(c)}のiPhone在庫チェッカー`,
    appleStoresIn: (c: Country) => `${country(c)}のアップルストア`,
    storesWithIt: "掲載中の店舗",
    more: "もっと見る",
  },

  /* ---------------------------------------------------------------- /in-stock/{product}/{place…} */
  product: {
    title: productTitle,
    description: productDescription,
    faq: productFaq,
    priceLabel: priceLabelJa,
    inPlace: (name: string) => name,
    h1Country: (model: string, c: Country) => `${country(c)}の${model}店頭受け取り在庫`,
    h1Place: (model: string, where: string) => `${where}の${model}`,
    inStockNow: "いま掲載中",
    yes: "あり",
    no: "なし",
    pickup: "店頭受け取り",
    configurations: "構成",
    ofStores: (n: number) => `${N(n)}店舗中`,
    restocks24h: "入荷（24時間）",
    restocksHint: (week: number, month: number, days: number) => `7日で${N(week)}回 · ${N(days)}日で${N(month)}回`,
    sellOuts: (days: number) => `完売（${N(days)}日）`,
    stays: (ms: number) => `掲載は約${fmtDuration(ms, L)}`,
    noPairs: "完売の記録はまだなし",
    lastRestock: "最新の入荷",
    noneYet: "まだなし",
    thisConfig: "この構成",
    inDays: (days: number) => `過去${N(days)}日間`,
    notInStockNow: "いまは掲載なし",
    configsInStock: (n: number, of: number) => <span>{N(of)}構成中<b className="text-ink">{N(n)}</b>構成が掲載中</span>,
    inStockAt: (n: number, of: number) => <span>{N(of)}店舗中<b className="text-ink">{N(n)}</b>店舗が掲載中</span>,
    checked: (live: ReactNode, price: string, tax: string) => <>{live}に読み取り · {price}{tax}</>,
    taxNote: (c: Country) => taxNoteJa(c),
    beforeTax: "税抜",
    buyOnApple: "apple.comで注文",
    allStoresIn: (c: Country) => `${country(c)}のすべての店舗`,
    everyIphoneHere: "この場所のすべてのiPhone",
    everyIphone: (where: string) => `${where}のすべてのiPhone`,
    panel: (model: string, where: string | null) => `${where ? `${where}の` : ""}${model}：構成を選んでから店舗を選択`,
    unitConfigs: "構成",
    unitStores: "店舗",
    otherConfigsHere: "この場所のほかの構成",
    byStorageColor: "容量とカラー",
    nearestStores: "近い店舗",
    closest: (link: ReactNode, dist: string) => <>掲載中の最寄り店舗：{link} · {dist}</>,
    storeCity: (store: string, city: string) => <>{store}（{city}）</>,
    mostRecentlyInStock: "直近に掲載された店舗",
    storesWithItNow: "いま掲載中の店舗",
    storesIn: (where: string) => `${where}の店舗`,
    colStatus: "状況",
    colConfigs: "掲載中の構成",
    noStoreHasIt: "いま掲載している店舗はありません。",
    noStoreHereHasIt: "このエリアでいま掲載している店舗はありません。",
    moreStores: (n: number) => <>ほか{N(n)}店舗は、下の地域別一覧にあります。</>,
    byRegion: (c: Country) => `${noun(c)}別`,
    byCity: "都市別",
    nearbyStores: "近くの店舗",
    latestChanges: "最新の変化",
    nothingLogged: "記録はまだ空です。",
    whenRestocks: "いつもの入荷時間",
    howFast: "入荷した在庫が残る時間",
    restocksByConfig: "入荷する構成",
    faqTitleCountry: (model: string, c: Country) => `${country(c)}の${model}：質問と回答`,
    faqTitle: (model: string, where: string) => `${where}の${model}`,
    buySource: (model: string, c: Country) => `Apple：${model}の購入ページ（${country(c)}）`,
    nearby: "近く",
    otherRegions: (c: Country) => `ほかの${noun(c)}`,
    elsewhereIn: (region: string) => `${region}のもう少し先`,
    everyAppleStoreIn: (c: Country) => `${country(c)}のアップルストア全一覧`,
    across: (model: string, c: Country) => `${country(c)}全体の${model}`,
    itemList: (model: string, where: string) => `${where}の${model}`,
    nearLead: (c: Country, model: string, inStock: number, n: number, have: { store: string; city: string; configs: number }[]) =>
      inStock === 0
        ? `いま${model}の店頭受け取りを掲載している${country(c)}のアップルストアはありません。「近くで買える店」は、近くのどの店舗に先に入荷するかで決まります。行ける店舗それぞれに通知を設定すれば、掲載から数秒でスマートフォンにプッシュ通知が届きます。`
        : `いま${model}を掲載しているのは${N(n)}店舗中${N(inStock)}店舗：${listJa(have.slice(0, 5).map((l) => `${l.store}（${l.city}・${N(l.configs)}構成）`), 5)}。`,
    nearHead: (c: Country) => [noun(c), "いま掲載中の店舗"],
    nearCaption: (c: Country, model: string) => `${noun(c)}別の${model}受け取り在庫（最新のチェック）`,
    nearMe: (_c: Country, model: string, alert: string) => `このページの通知設定で「現在地から探す」をタップすると、いる場所から全店舗を道のりの推定距離（km）順に並べ、それぞれに経路リンクを付けます。[${model}の通知を設定](${alert})。`,
    modelFaq: (c: Country, model: string, low: number, high: number, inStock: number): { price: FaqItem; reserve: FaqItem } => {
      const money = (v: number) => priceIn(L, c, v);
      return {
        price: { q: `${country(c)}での${model}の価格は？`, a: `apple.comで${money(low)}〜${money(high)}（${taxNoteJa(c)}）。価格は容量で決まります。` },
        reserve: { q: `${country(c)}で${model}を店頭受け取りで取り置きする方法は？`, a: `事前の予約はできません。店舗に希望の構成が掲載されたらapple.comで店頭受け取りを選んで注文すると、選んだ時間枠までAppleが確保します。${inStock === 0 ? "いまはどの店舗にも掲載がないので、先回りするなら通知です。" : ""}` },
      };
    },
  },

  /* ---------------------------------------------------------------- /restock-log */
  restocks: {
    metaTitle: (c: Country, n: number) => `${country(c)}のiPhone入荷記録をライブで：${n === 1 ? "アップルストア" : `アップルストア${N(n)}店舗`}`,
    metaDescription: (c: Country, n: number) => `${country(c)}の${n === 1 ? "アップルストア" : "各アップルストア"}で確認したiPhone Duo・18 Pro・Pro Maxの店頭受け取りの入荷をすべて記録。時刻、正確な構成、地図つき。`,
    h1: (c: Country) => `${country(c)}のiPhone入荷、リアルタイム`,
    summary: (day: number, week: number, model?: string, region?: string) => <>過去24時間の入荷{N(day)}回 · 7日間で{N(week)}回{model ? ` · ${model}` : ""}{region ? ` · ${region}` : ""}。時刻はお使いのタイムゾーンで表示しています。</>,
    allModels: "すべての機種",
    restocks: "入荷",
    withSoldOut: "入荷と完売",
    regionLabel: (c: Country) => noun(c),
    allRegions: (c: Country) => `すべての${noun(c)}`,
    filter: "適用",
    page: (k: number) => <>{N(k)}ページ目</>,
    newer: "← 新しい順",
    older: "古い順 →",
    getAlerts: "通知を設定",
    byPlace: "場所ごとの入荷",
    byRegion: (c: Country) => `${noun(c)}別`,
    datasetName: (c: Country) => `${country(c)}のアップルストアにおけるiPhone店頭受け取りの入荷`,
    datasetDescription: (c: Country) => `${c.cc === "us" ? "米国のアップルストア全269店舗" : `${country(c)}のアップルストア`}で確認した、iPhone Duo、iPhone 18 Pro、iPhone 18 Pro Maxの店頭受け取りの入荷と完売（店舗、正確な構成、時刻）。各店舗を15秒ごと（通知が設定された店舗は5秒ごと）に読み取り、apple.comが同じ回答を2回返したときだけ入荷として記録します。`,
    datasetMeasured: ["アップルストア", "iPhoneの機種・容量・カラー", "入荷時刻", "完売時刻"],
  },

  /* ---------------------------------------------------------------- /live-map */
  map: {
    metaTitle: (c: Country, n: number) => `iPhone Duo在庫ライブマップ：${country(c)}の${n === 1 ? "アップルストア" : "全アップルストア"}`,
    metaDescription: (c: Country, n: number) => `いまiPhone Duo・18 Pro・Pro Maxの店頭受け取りを掲載しているのはどこか。${country(c)}の${n === 1 ? "アップルストア" : `アップルストア全${N(n)}店舗`}をひとつのライブマップに、容量・カラー別で表示します。`,
    country: (c: Country) => ({ name: country(c), inName: `${country(c)}の`, regionNoun: c.regionNoun, regionNounPlural: c.regionNounPlural }),
    everyStore: "全店舗",
    storeCity: (store: string, city: string) => `${store} · ${city}`,
  },

  /* ---------------------------------------------------------------- /{cc}/apple-stores */
  storesIndex: {
    metaDescription: (c: Country, n: number, regions: number, cities: number, duo: number, max: number) => {
      const by = c.regionNoun && regions > 1 ? `${noun(c)}・都市別に` : cities > 1 ? "都市別に" : "";
      return `いまiPhone Duoを掲載中は${N(duo)}店舗、Pro Maxは${N(max)}店舗。${country(c)}のアップルストア全${N(n)}店舗の受け取り在庫を${by}ライブで。18 Proも掲載。`;
    },
    countAnswer: (n: number, spread: string, top: { name: string; count: number }[]) => `${N(n)}店舗、${spread}です${top.length ? `。最多は${top[0].name}の${N(top[0].count)}店舗${top[1] ? `で、${top[1].name}（${N(top[1].count)}店舗）が続きます` : ""}` : ""}。`,
    howMany: (c: Country) => <>{country(c)}のアップルストアは何店舗？</>,
    duoNow: (c: Country, n: number, have: Store[]): FaqItem => ({
      q: `いまiPhone Duoを掲載している${country(c)}のアップルストアは？`,
      a: have.length === 0 ? `最新のチェックでは${N(n)}店舗ともゼロです。掲載が出た瞬間にこのページと地図が切り替わり、通知はそのどちらよりも先に届きます。` : `最新のチェックで${N(n)}店舗中${N(have.length)}店舗：${have.slice(0, 6).map(storeJa).join("、")}${have.length > 6 ? "ほか" : ""}。`,
    }),
    faq: (ctx: FaqContext) => placeFaq({ ...ctx, peak: peakJa(ctx.peak), omit: [...(ctx.omit ?? []), "count", "stock", "lasts"] }, L),
    duoBlock: (alert: string) => `いちばんの近道は、行ける店舗に通知を設定することです：[iPhone Duoの通知を設定](${alert})。通知1件で1店舗×1つの正確な構成をカバーし、その店舗に掲載されてから数秒でスマートフォンが知らせます。`,
    intro: (c: Country, n: number, spread: string, now: { duo: number; max: number; pro: number }, tax: string) => `いま店頭受け取りを掲載しているのは、iPhone Duoが**${N(now.duo)}店舗**、iPhone 18 Pro Maxが**${N(now.max)}店舗**、18 Proが**${N(now.pro)}店舗**。対象は${country(c)}の**アップルストア${N(n)}店舗**で、${spread}にあります。${tax}`,
    crumb: "アップルストア",
    panel: (c: Country) => `iPhoneを選んでから、行ける${country(c)}の店舗にチェック`,
    matrixLabel: "店舗ごとの在庫",
    matrixH2: (c: Country) => <>{country(c)}の店舗別在庫</>,
    matrixHint: "機種ごとに「いま掲載中 / チェック対象」。",
    topCaption: (c: Country) => <>アップルストアの数が多い{noun(c)}（Appleの直営店一覧に基づき、当サイトで追跡中のもの）</>,
    regionHead: (c: Country) => noun(c),
    colStores: "アップルストア",
    colCities: "都市",
    locationsBy: (c: Country) => `${noun(c)}ごとのアップルストアの場所`,
    locationsIn: (c: Country) => `${country(c)}のアップルストア所在地一覧`,
    storeCount: (n: number) => <>{N(n)}店舗</>,
    storeCountAll: (n: number) => <>{N(n)}店舗</>,
    whenRestock: (c: Country) => <>{country(c)}の店舗は何時に入荷する？</>,
    howFast: (c: Country) => <>{country(c)}では入荷した在庫がどのくらい残る？</>,
    faqTitle: (c: Country) => `${country(c)}のアップルストア：質問と回答`,
    getApp: "アプリを入手",
    howItWorks: "仕組み（英語）",
    pricing: "料金",
  },

  /* ---------------------------------------------------------------- /when-does-iphone-duo-restock */
  restockTimes: {
    fmt: {
      n: N,
      pct: rtPct,
      date: dateLabel,
      longDate,
      zoneStamp,
      local: (iso: string, store: Parameters<typeof localStamp>[1]) => localStamp(iso, store, L),
      hour: hourLabel,
      range: rangeLabel,
      weekday: weekdayName,
      store: storeJa,
      storeWithPlace: (s: Store) => `${storeJa(s)}（${cityLabel(s.country ?? "us", s.city, L)}）`,
    },
    title: (c: Country) => `${country(c)}のアップルストア、iPhone Duoは何時に再入荷する？`,
    metaDescription: (x: RestockTimesMeta) => {
      const { c, t, w, pattern } = x;
      const w0 = country(c);
      const region = c.cc === "us" ? "州" : c.regionNoun ? noun(c) : "店舗";
      const since = dateLabel(t.since, false);
      return t.n > 0 && pattern
        ? fitTitleW([
          `${since}以降、${w0}のアップルストアでiPhone Duoの入荷${N(t.n)}回。${rtPct(w.share)}が現地時間${rangeLabel(w.from, w.to)}${t.sellout ? `、${rtPct(t.sellout.within2min)}は2分以内に完売` : ""}。時間帯・日・${region}・店舗・構成別の表。`,
          `${since}以降、${w0}のアップルストアでiPhone Duoの入荷${N(t.n)}回。${rtPct(w.share)}が現地時間${rangeLabel(w.from, w.to)}。時間帯・日・${region}・構成別の表。`,
          `${w0}のiPhone Duo入荷時間：${since}以降の${N(t.n)}回を時間帯・日・${region}・構成別に。`,
        ], 158)
        : t.n > 0
          ? fitTitleW([
            `${since}以降、${w0}のアップルストアで確認したiPhone Duoの入荷${N(t.n)}回。${SPEED.checkSec}秒ごとのチェックをもとに、現地の時間帯・日別・${region}・店舗・構成別に、それぞれの在庫が残った時間まで。`,
            `${w0}のiPhone Duo入荷時間：${since}以降の確認済み入荷${N(t.n)}回を時間帯・日・${region}・構成別に。`,
          ], 158)
          : `${w0}のアップルストアでiPhone Duoが入荷する時間を、時間帯・日・店舗・構成別に。RestockWireが${longDate(t.since)}から全店舗を${SPEED.checkSec}秒ごとに読み取ったデータです。`;
    },
    h1: (x: RestockTimesView) => x.t.unknown
      ? `${country(x.c)}でAppleがiPhone Duoを再入荷するのは何時？`
      : x.t.n > 0
        ? `${country(x.c)}でAppleがiPhone Duoを再入荷するのは何時？ ${x.pattern ? `最も多いのは現地時間${rangeLabel(x.w.from, x.w.to)}` : "独自チェックを1時間ごとに"}`
        : `${country(x.c)}でiPhone Duoの再入荷はある？ いまのところなし。見張っている内容はこちら`,
    intro: (x: RestockTimesView) => {
      const { t, one, tracked, pattern, w } = x;
      const where = country(x.c);
      return t.unknown ? (
        <>入荷記録を一時的に表示できません。{where}の店舗は引き続き{SPEED.checkSec}秒ごとにチェックしており、次にページを読み込むと数値が戻ります。</>
      ) : t.n > 0 && pattern ? (
        <>
          {longDate(t.since)}以降、RestockWireが{where}のアップルストアで確認した<b className="text-ink">iPhone Duoの入荷{N(t.n)}回のうち{rtPct(w.share)}</b>が、店舗の現地時間で<b className="text-ink">{rangeLabel(w.from, w.to)}</b>に入っています{x.sell ? <>。典型的な入荷は約{N(Math.round(x.sell.medianSec / 5) * 5)}秒で消えました</> : null}。<b className="text-ink">入荷はいまも続いています</b>{tracked > 1 ? <>：追跡した{N(tracked)}日のうち{N(t.days)}日に入荷がありました</> : <>（追跡はまだ1日目）</>}。
        </>
      ) : t.n > 0 ? (
        <>
          <b className="text-ink">あります。</b>{where}のアップルストアで<b className="text-ink">{longDate(t.since)}以降、iPhone Duoの入荷{N(t.n)}回</b>{tracked > 1 ? <>（{N(tracked)}日中{N(t.days)}日）</> : <>（追跡はまだ1日目）</>}。いつもの時間帯は、{PATTERN_MIN}回の入荷が{PATTERN_MIN_DAYS}つの別々の日にそろってから示します。
        </>
      ) : (
        <>
          <b className="text-ink">いまのところありません。</b>RestockWireは{longDate(t.since)}から{one ? `${where}のアップルストア` : `${where}のアップルストア全${N(x.stores)}店舗`}を{SPEED.checkSec}秒ごとに読み取っていますが、iPhone Duoの店頭受け取りの入荷は1件も確認していません。
        </>
      );
    },
    hero: {
      restocks: (x: RestockTimesView) => `${dateLabel(x.t.since, false)}以降に確認した入荷`,
      window: (x: RestockTimesView) => `${rangeLabel(x.w.from, x.w.to)}に入荷（店舗の現地時間）`,
      days: "入荷があった日",
      // 英語の型は戻り値が文字列リテラルなので、日本語の文字列を渡すために型を合わせる。
      now: (() => "いま店頭受け取りを掲載中の店舗") as unknown as RT["hero"]["now"],
      today: (x: RestockTimesView, today: DayRow) => `今日（${dateLabel(today.date)}）ここまで${x.one ? "" : ` · ${N(today.stores)}店舗`}`,
      weekday: "これまでで最も多い曜日",
    },
    heroPoints: (x: RestockTimesView, latest: { config: string; store: Store; at: string } | null): Point[] => [
      ...(latest ? [{ text: <>最新：<b className="text-ink">{latest.config}</b>{x.one ? null : <>（<Link href={storePath(latest.store)} className="underline underline-offset-2">{storeJa(latest.store)}</Link>）</>}、現地時間{localStamp(latest.at, latest.store, L)}</> }] : []),
      ...(x.t.peakWeekday != null ? [{ text: <>最も多いのは<b className="text-ink">{weekdayName(x.t.peakWeekday)}</b></> }] : []),
      { text: <><b className="text-ink">公式の入荷スケジュールはありません</b>。これは私たちが自ら確認したチェックの数字で、約5分ごとに更新しています</>, no: true },
    ],
    emptyPoints: (x: RestockTimesView): Point[] => [
      { text: <>いま店頭受け取りを掲載しているのは<b className="text-ink">{N(x.stores)}店舗中{N(x.duoNow)}店舗</b></> },
      { text: <>最初の確認済み入荷から、下の表がすべて動き出します</>, step: true },
      { text: <>最も多くのデータに基づく時間帯・曜日の傾向は<Link href="/when-does-iphone-duo-restock" className="underline underline-offset-2">米国版ページ（英語）</Link>へ</>, step: true },
    ],
    setUpAlert: "iPhone Duoの通知を受け取る",
    logLive: "ライブ入荷記録",
    onThisPage: "セクション",
    nav: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": "時間帯",
      "day-by-day": "日別",
      where: `${rtRegion(x)}別`,
      configuration: "構成",
      "how-long": "完売の速さ",
      unavailable: "「受け取り不可」",
      reddit: "Redditの説",
      method: "方法",
    }),
    h2: (x: RestockTimesView): Record<string, string> => ({
      "time-of-day": `${country(x.c)}でiPhone Duoが戻ってくるのは何時？`,
      "day-by-day": `${country(x.c)}でiPhone Duoが入荷したのはどの日？`,
      where: `${country(x.c)}でiPhone Duoの入荷が最も多いのはどこ？`,
      configuration: `${country(x.c)}で入荷が多いiPhone Duoの容量とカラーは？`,
      "how-long": `${country(x.c)}でiPhone Duoの入荷は何秒もつ？`,
      unavailable: "apple.comがどの店舗でも「現在ご利用いただけません」と表示するのはなぜ？",
      reddit: "RedditのiPhone Duo入荷説を、記録で検証",
      method: "RestockWireで「入荷」と数えるのは何？",
    }),
    faq: (x: RestockTimesView): Faq[] => {
      const { t, w, pattern, sell, us, weekend, tracked } = x;
      const where = country(x.c);
      const window = rangeLabel(w.from, w.to);
      return [
        { q: `${where}でAppleがiPhone Duoを再入荷するのはいつ？`, a: t.n > 0 && pattern
          ? `${longDate(t.since)}以降の確認済み入荷${N(t.n)}回のうち、店舗の現地時間${window}が${rtPct(w.share)}、8〜12時が${rtPct(hourShare(t.byHour, 8, 12))}でした。公式のスケジュールはなく、これはRestockWireが観測した傾向で、約5分ごとに更新しています。`
          : `RestockWireが${longDate(t.since)}以降に${where}で記録した確認済み入荷は${N(t.n)}回${t.days ? `（${N(t.days)}日間）` : ""}。Appleはスケジュールを発表していません。${PATTERN_MIN}回の入荷が${PATTERN_MIN_DAYS}つの別々の日にそろえば、このページが自動でいつもの時間帯を示します。` },
        { q: `${us ? "" : `${where}では`}週末にもiPhone Duoは入荷する？`, a: t.n > 0
          ? `${weekend > 0 ? "入荷します" : "いまのところゼロです"}。${N(t.n)}回のうち${N(weekend)}回（${rtPct(weekend / t.n)}）が土曜か日曜でした。${t.peakWeekday != null ? `これまで最も多い曜日は${weekdayName(t.peakWeekday)}です。` : `最も多い曜日は、データが${WEEKDAY_MIN_SPAN}日分そろってから示します（現在${N(tracked)}日分）。`}`
          : `${where}の週末のデータはまだありません。確認済みの入荷が増えるたびに、このページの日別の表が育っていきます。` },
        { q: "apple.comは何時から見張ればいい？", a: t.n > 0 && pattern
          ? `手動なら、現地時間の${hourLabel(w.from)}から店頭受け取りを選んだ状態でapple.comを開いておきましょう。その2時間に入荷の${rtPct(w.share)}が集まっています。典型的な入荷は${sell ? `中央値${N(sell.medianSec)}秒で消える` : "1分ほどしかもたない"}ので、${SPEED.fastSec}秒ごとにチェックする通知（[通知の仕組み（英語）](/iphone-duo-restock-alerts)）のほうが、どれだけ再読み込みするよりも確実です。`
          : `${where}の傾向がまだ固まらないうちは、見張りを通知に任せられます。選んだ店舗は昼夜を問わず${SPEED.fastSec}秒ごとにチェックされます（[通知の仕組み（英語）](/iphone-duo-restock-alerts)）。` },
        { q: "なぜどのアップルストアでもiPhone Duoが「受け取り不可」なの？", a: sell
          ? `入荷が短いからです。${where}で計測した完売済みの入荷${N(sell.n)}回のうち、${rtPct(sell.within2min)}が2分以内、${rtPct(sell.within20min)}が20分以内に消えました。いま掲載しているのは${N(x.stores)}店舗中${N(x.duoNow)}店舗。数十回の入荷があった日でも、apple.comはほとんどの時間「受け取り不可」と正しく表示しています（[「受け取り不可」の意味（英語）](/apple-store-pickup-explained)）。`
          : `店頭受け取りの在庫は数分単位でしか現れません。いま${where}で掲載しているのは${N(x.stores)}店舗中${N(x.duoNow)}店舗です（[「受け取り不可」の意味（英語）](/apple-store-pickup-explained)）。` },
        { q: "行きつけのアップルストアにiPhone Duoが戻ったら通知してもらえる？", a: `できます。その店舗に、容量とカラーまで指定した通知を設定すると、店舗は${SPEED.fastSec}秒ごとのチェックに切り替わり、入荷を確認してから約${SPEED.alertSec}秒でスマートフォンに届きます（[通知を設定](${x.alert})、[仕組み（英語）](/how-restock-alerts-work)）。` },
      ];
    },
    sources: {
      applePickup: "Apple：配送と受け取りのヘルプ（店頭受け取りの在庫表示の仕組み、英語）",
      newsroom: "Apple Newsroom：iPhone Duoが世界のApple Storeに登場（2026年10月23日、英語）",
      macRumors: "MacRumors：米国とカナダでiPhone DuoのApple Store受け取りが再開（2026年10月24日、英語）",
      reports: (tracker: string) => `${tracker}：発売週のiPhone Duo入荷報告（同サイト自身の観測。区別して表示し、集計には含めません）`,
    },
    ld: (x: RestockTimesView) => ({
      datasetName: `${country(x.c)}のアップルストアにおけるiPhone Duo店頭受け取りの入荷時間`,
      description: `${x.t.since}以降に${country(x.c)}のアップルストアで確認したiPhone Duoの店頭受け取りの入荷（店舗、構成、時刻）。RestockWireが各店舗を${SPEED.checkSec}秒ごとに読み取ったデータを、現地の時間帯・日・${rtRegion(x)}・店舗・構成別に集計しています。`,
      spatial: `${country(x.c)}のアップルストア`,
      measured: ["入荷時刻（店舗の現地時間）", "アップルストア", "iPhone Duoの容量とカラー", "完売までの秒数"],
      size: `${N(x.t.stores)}店舗で入荷${N(x.t.n)}回`,
    }),
    crumb: "iPhone Duoの入荷時間",

    // ---- 時間帯
    timeLead: (x: RestockTimesView) => <b>店舗の現地時間{rangeLabel(x.w.from, x.w.to)}に{N(x.t.n)}回の入荷のうち{rtPct(x.w.share)}、8〜12時に{rtPct(hourShare(x.t.byHour, 8, 12))}が集まっています。</b>,
    busiestHour: (count: number) => `最も多い1時間に${N(count)}回の入荷`,
    morning: "8〜12時",
    evening: "17時以降。夜も無視できません",
    night: "0〜6時",
    tooFew: (x: RestockTimesView) => <b>時間帯を言うにはまだ日数が足りません：{longDate(x.t.since)}以降、{N(x.t.days)}日間で確認済みの入荷{N(x.t.n)}回。</b>,
    tooFewKeys: (): Point[] => [
      { text: <>いつもの時間帯を示すには<b className="text-ink">{PATTERN_MIN}回の入荷が{PATTERN_MIN_DAYS}つの別々の日に</b>必要です</> },
      { text: <>10回まとめて入荷しても、それは1回の出来事で、習慣ではありません</>, no: true },
      { text: <>データが1日増えるごとに、このページは自動で更新されます</>, step: true },
    ],
    hourCaption: (x: RestockTimesView) => `${country(x.c)}のiPhone Duoの入荷${N(x.t.n)}回、店舗の現地時間別（${dateLabel(x.t.since, false)}〜今日）`,
    hourHead: ["現地時間", "入荷", "割合"],
    morningKeys: (x: RestockTimesView): Point[] => [
      { text: <>朝のピークは<b className="text-ink">開店時間とは無関係</b>です{x.us ? "（米国のアップルストアの多くは10時開店）" : ""}</> },
      { text: <>Appleは店のドアが開く前に、受け取り在庫を<b className="text-ink">オンラインで</b>放出します</> },
      { text: <>手動で見張るなら、平日の朝<b className="text-ink">{rangeLabel(x.w.from, x.w.to)}</b>を押さえましょう</>, step: true },
      { text: <>誰も見ていない<b className="text-ink">残りの22時間</b>は<Link href={x.alert}>通知</Link>がカバーします</>, step: true },
    ],
    storeChartKeys: (x: RestockTimesView): Point[] => [{ text: <>各店舗のページには、その店舗の現地時間でのグラフがあります（<Link href={x.storesHref}>{x.us ? "州別のアップルストア" : `${country(x.c)}の店舗`}</Link>）。地域のピークが9時でも8時に入荷する店舗を見つけられます</>, step: true }],

    // ---- 日別
    dayLead: (x: RestockTimesView) => {
      const { t, tracked, one } = x;
      return t.n > 0 && tracked === 1 ? (
        <b>追跡はまだ1日目（{dateLabel(t.daily[t.daily.length - 1]?.date ?? t.since)}）で、確認済みの入荷は{N(t.n)}回{one ? "" : `（${N(t.stores)}店舗）`}です。</b>
      ) : t.n > 0 ? (
        <b>{t.days === tracked ? `追跡した${N(t.days)}日すべて` : `${longDate(t.since)}以降の${N(tracked)}日中${N(t.days)}日`}に、確認済みの入荷が1回以上ありました{t.peakWeekday != null ? `。曜日では${weekdayName(t.peakWeekday)}が最多です` : ""}。</b>
      ) : (
        <b>{longDate(t.since)}以降、{country(x.c)}で確認済みの入荷はゼロです。</b>
      );
    },
    daysTracked: "入荷があった追跡日",
    busiestDay: (x: RestockTimesView, day: DayRow) => `最多の日：${dateLabel(day.date)}${x.one ? "" : `、${N(day.stores)}店舗`}`,
    busiestDayNone: "最多の日",
    drop: (x: RestockTimesView, drop: { at: string; restocks: number }) => `店舗が30分以内に一斉入荷（${zoneStamp(drop.at, x.c)}、${N(drop.restocks)}構成）。全国規模の放出`,
    weekend: (x: RestockTimesView) => `週末の入荷（${N(x.weekend)}回）`,
    dayCaption: (x: RestockTimesView) => `${country(x.c)}のiPhone Duoの日別入荷${x.t.reports.length ? "。「報告」の行は、私たちの追跡開始前に他サイトが公開した観測で、時系列の参考としてのみ載せています" : ""}`,
    dayHead: { date: "日付", restocks: "入荷", stores: "店舗", busiest: "最多の時間帯", source: "出典" },
    soFar: " · ここまで",
    reportedBy: (names: string[]) => <>{names.join(" / ")}による</>,
    dayKeys: (x: RestockTimesView, launch: string, resumed: string): Point[] => [
      { text: <><b className="text-ink">{dateLabel(launch)}</b>：発売日。最初の出荷はオンライン注文分</> },
      { text: <><b className="text-ink">{dateLabel(resumed)}</b>：店頭受け取りが再開{x.us ? "（MacRumors）" : ""}</> },
      x.t.reports.length
        ? { text: <><b className="text-ink">報告</b>の行は{x.reportNames.join("・")}による発売週の観測で、どの集計にも含めません</> }
        : { text: <>{country(x.c)}の全店舗についてのRestockWireの記録は<b className="text-ink">{longDate(x.t.since)}</b>から</> },
      ...(x.t.n > 0 && x.t.peakWeekday == null ? [{ text: <>最も多い曜日を示すには<b className="text-ink">{WEEKDAY_MIN_SPAN}日分</b>のデータが必要です（現在{N(x.tracked)}日分）</>, no: true }] : []),
      { text: <><b className="text-ink">店舗</b>の列に注目：入荷が多くの店舗に分散した日ほど、チャンスは広がります</>, step: true },
    ],

    // ---- 場所
    whereLead: (x: RestockTimesView, hit: { name: string; restocks: number; stores: number; storesTotal: number }[], total: number) => (
      <b>{hit[0].name}：{dateLabel(x.t.since, false)}以降、{N(hit[0].storesTotal)}店舗中{N(hit[0].stores)}店舗で{N(hit[0].restocks)}回{hit[1] ? <>、続いて{hit[1].name}（{N(hit[1].restocks)}回）</> : null}{hit[2] ? <>、{hit[2].name}（{N(hit[2].restocks)}回）</> : null}。{N(total)}の{rtRegion(x)}のうち{N(hit.length)}で入荷がありました{total - hit.length > 0 ? `。残る${N(total - hit.length)}はまだゼロです` : ""}。</b>
    ),
    whereNone: (x: RestockTimesView) => <b>{country(x.c)}で確認済みの入荷がある{rtRegion(x)}は、まだひとつもありません。最初の入荷から表が始まります。</b>,
    regionCaption: (x: RestockTimesView) => `${country(x.c)}の${rtRegion(x)}別・iPhone Duoの確認済み入荷（${dateLabel(x.t.since, false)}〜今日）`,
    regionHead: (x: RestockTimesView) => [rtRegion(x), "入荷", "入荷した店舗", "最新の入荷（現地時間）"],
    ofN: (a: number, b: number) => <>{N(b)}店舗中{N(a)}</>,
    storesCaption: (x: RestockTimesView) => `${country(x.c)}でiPhone Duoの入荷が多い店舗（${dateLabel(x.t.since, false)}〜今日）`,
    storesHead: ["店舗", "入荷", "日数", "いつもの時間帯", "最新（現地時間）"],
    swaps: (x: RestockTimesView) => [
      { no: "どれだけ遠くても、一覧のトップの店舗を追いかける", yes: `${x.pattern ? hourLabel(x.w.from) : "朝"}から1時間以内に行ける2〜3店舗`, why: "行けない店舗の入荷は役に立ちません。いちばん多い店舗でも、1日のうち数分以外は受け取り不可です。" },
      { no: "1店舗に賭ける", yes: "各店舗に通知を設定し、鳴った店舗へ向かう", why: "回数の表は、自分の店舗のうちどこへ先に向かうかを決めるためだけに使いましょう。" },
    ],
    nearMe: "近くのDuo在庫をライブで（英語）",

    // ---- 構成
    configLead: (x: RestockTimesView, top: { label: string; restocks: number }, rarest: { label: string; restocks: number } | null) => (
      <b>トップは{top.label}で、{N(x.t.n)}回の入荷のうち{N(top.restocks)}回（{rtPct(top.restocks / x.t.n)}）{rarest ? `。最も少ないのは${rarest.label}の${N(rarest.restocks)}回` : ""}。</b>
    ),
    mostRestocked: (config: string) => `${config}：入荷がどの構成よりも多い`,
    versus: (a: string, bCount: number, b: string) => `${a}の入荷（${b}は${N(bCount)}回）`,
    restocksOf: (a: string) => `${a}の入荷`,
    byStorage: "容量別",
    byColour: "カラー別",
    configNone: (x: RestockTimesView) => <b>{country(x.c)}で確認済みの入荷がある構成はまだありません。最初の入荷に備えて、{N(x.configs)}つの構成すべての行を用意しています。</b>,
    configCaption: (x: RestockTimesView) => `${country(x.c)}のiPhone Duo、構成別の確認済み入荷（${dateLabel(x.t.since, false)}〜今日）`,
    configHead: ["構成", "入荷", "割合", "最新の入荷（現地時間）"],
    configKeys: (x: RestockTimesView): Point[] => [
      { text: <>構成選びは<b className="text-ink">店舗選びより重要</b>です</> },
      x.storageRatio != null
        ? { text: <>入荷が最も多い容量で妥協すれば、チャンスは次の容量の約<b className="text-ink">{x.storageRatio}倍</b></> }
        : { text: <>入荷が最も多い容量で妥協すれば、チャンスは<b className="text-ink">大きく</b>上がります</> },
      { text: <><b className="text-ink">2TB</b>は配送で注文して待つのが現実的です</>, no: true },
      { text: <>価格とライブ在庫：<Link href="/iphone-duo-most-restocked-stores">入荷が最も多いiPhone Duoは？（英語）</Link></>, step: true },
    ],

    // ---- 持続時間
    howLongLead: (x: RestockTimesView, sell: SelloutFacts) => <b>{N(sell.medianSec)}秒：{country(x.c)}で完売した入荷{N(sell.n)}回の掲載時間の中央値です。{rtPct(sell.within2min)}が2分以内、{rtPct(sell.within20min)}が20分以内に消えました。</b>,
    secUnit: "秒",
    medianListing: "掲載から消えるまで（中央値）",
    within2: "2分以内に完売",
    within20: "20分以内に完売",
    fastest: "記録上最速の完売",
    howLongNone: (x: RestockTimesView) => <b>{country(x.c)}で完売した入荷は、まだ測定できるほどありません。数値は10回から示します。全体のデータは米国版ページにあります。</b>,
    howLongKeys: (x: RestockTimesView): Point[] => [
      { text: <>2分は<b className="text-ink">通知</b>のための時間で、apple.comを再読み込みするための時間ではありません</> },
      { text: <>このページのほかの数字は、すべてこの数字から導かれます</> },
      { text: <>入荷ごとの秒数を構成・{rtRegion(x)}別に：<Link href="/how-fast-does-iphone-duo-sell-out">iPhone Duoの入荷は何秒で完売する？（英語）</Link></>, step: true },
    ],
    measured: "各数値は、構成の掲載を最初に見つけたチェックから、消えたことを確認したチェックまでの時間です。つまり上限値で、実際の掲載時間はこれより短くなります。",

    // ---- 受け取り不可
    unavailableLead: (x: RestockTimesView) => <b>入荷は「状態」ではなく一瞬の点です。{x.one ? "1店舗" : `${N(x.stores)}店舗`}×{N(x.configs)}構成で、{country(x.c)}で掲載されうる組み合わせは{N(x.pairs)}通り。そしていま、何らかのiPhone Duoを掲載している店舗は{N(x.duoNow)}店舗です。</b>,
    pairs: "掲載されうる店舗×構成の組み合わせ",
    listingNow: "いまiPhone Duoの店頭受け取りを掲載中",
    goneIn2: "2分以内に終わった入荷",
    last24: "過去24時間の確認済み入荷",
    unavailableKeys: (x: RestockTimesView, today: number): Point[] => [
      x.recent.restocks > 0
        ? { text: <>過去24時間：{country(x.c)}の{N(x.recent.stores)}店舗で<b className="text-ink">確認済みの入荷{N(x.recent.restocks)}回</b></> }
        : today > 0
          ? { text: <>今日：{country(x.c)}で<b className="text-ink">確認済みの入荷{N(today)}回</b></> }
          : { text: <>実際にあった入荷は、上の日別の表にあります</> },
      { text: <>どれもapple.comに出ていたのは<b className="text-ink">1〜2分</b></> },
      { text: <>4日目でも14日目でも、「どこも受け取り不可」はAppleが止めたという意味では<b className="text-ink">ありません</b></>, no: true },
    ],
    unavailableLinks: { explained: "「受け取り不可」の意味（英語）", howToGet: "iPhone Duoを手に入れる手順（英語）" },

    // ---- Reddit
    redditLead: (x: RestockTimesView) => <b><a href="https://www.reddit.com/r/applestore/" target="_blank" rel="noopener nofollow">r/applestore</a>や<a href="https://www.reddit.com/r/iphone/" target="_blank" rel="noopener nofollow">r/iphone</a>のアドバイスの多くは誠実ですが、1店舗の経験に基づき、翌日には古くなります。よく出る4つの説を、{country(x.c)}で確認した{N(x.t.n)}回の入荷で検証しました。</b>,
    redditCaption: "iPhone Duoの入荷に関するRedditの定番の説を、RestockWireの確認済み入荷で検証",
    redditHead: ["説", "記録が示すこと"],
    claims: (x: RestockTimesView): { claim: string; answer: ReactNode }[] => {
      const { t, w, tracked, recent } = x;
      return [
        { claim: "「入荷は夜中。午前3時にチェックしろ」", answer: t.n > 0 ? <>現地時間0〜6時の入荷は{rtPct(hourShare(t.byHour, 0, 6))}、{rangeLabel(w.from, w.to)}は{rtPct(w.share)}でした。</> : zero },
        { claim: "「Appleが入荷するのは特定の曜日だけ」", answer: t.n > 0 ? (t.peakWeekday != null ? <>いまのところ最多は{weekdayName(t.peakWeekday)}（{N(t.n)}回中{N(t.byWeekday[t.peakWeekday])}回）ですが、入荷は{N(tracked)}日中{N(t.days)}日にありました。</> : <>追跡した{N(tracked)}日のうち{N(t.days)}日に入荷がありました{t.days === tracked ? "。入荷のない日は1日もありません" : ""}。最も多い曜日は、データが{WEEKDAY_MIN_SPAN}日分そろってから示します。</>) : zero },
        { claim: "「店に電話して、トラックが来る日を聞け」", answer: "公表された入荷スケジュールはありません。受け取り在庫はオンラインで放出され、店舗もほかの全員と同じ瞬間にそれを知ります。" },
        { claim: "「受け取り不可なら、もう二度と入らない」", answer: recent.restocks > 0 ? <>過去24時間に{N(recent.stores)}店舗で確認した{N(recent.restocks)}回の入荷が反証です。どれも数分で「受け取り不可」に戻りました。</> : t.n > 0 ? <>{dateLabel(t.since, false)}以降に確認した{N(t.n)}回の入荷が反証です。どれも数分で「受け取り不可」に戻りました。</> : zero },
      ];
    },
    redditKeys: (): Point[] => [
      { text: <>うわさは<b className="text-ink">データがない</b>ところを埋めるもの。このページがそのデータで、読むのは無料です</> },
      { text: <>Redditが正しいのは<b className="text-ink">購入手続きの準備</b>：サインイン済み、Apple Payを設定済み（<Link href="/iphone-duo-restock-checkout-guide">20秒でわかる私たちの版（英語）</Link>）</> },
    ],

    // ---- 方法
    methodLead: <b>入荷とは、それまで掲載していなかった店舗で、ある構成がapple.comの店頭受け取りに現れることです。2回のチェックが一致して初めて確定します。</b>,
    methodKeys: (x: RestockTimesView): Point[] => [
      { text: <>通知が設定された店舗は<b className="text-ink">{SPEED.fastSec}秒ごと</b>、{x.one ? `${country(x.c)}のアップルストア` : `${country(x.c)}の全アップルストア`}は<b className="text-ink">{SPEED.checkSec}秒ごと</b></> },
      { text: <>他サイトが公表しているチェック間隔：<b className="text-ink">{others}</b>。比べるのは公表値だけです</> },
      { text: <>最初の「在庫あり」は<b className="text-ink">約1秒後</b>に再確認してから数えます</> },
      { text: <>消えた掲載は<b className="text-ink">次の巡回</b>で確定します</> },
      { text: <>店舗の初回の観測、失敗したリクエスト、タイムアウト：入荷にも「在庫切れ」にも<b className="text-ink">数えません</b></>, no: true },
      { text: <>時刻と日付はすべて各店舗の<b className="text-ink">現地時間</b>。「波」はタイムゾーンをまたいだ同じ30分のことです</> },
      { text: <>他サイトの報告{x.t.reports.length ? `（${x.reportNames.join("、")}）` : ""}は専用の行に表示し、<b className="text-ink">どの合計にも含めません</b></> },
      { text: <>表は約5分ごとに更新。<Link href={x.logHref}>入荷記録</Link>はライブです</>, step: true },
    ],
    quote: "このページの引用について：数値はリンクを添えて自由に引用できます。RestockWireはAppleから独立したサービスで、誰でもapple.comで見られる受け取り在庫を、はるかに高い頻度で読み取っています。",
    alertIn: (x: RestockTimesView) => <>{x.one ? "" : `${country(x.c)}で`}iPhone Duoの通知を受け取る</>,

    // ---- 関連、FAQ、出典
    related: "iPhone Duoのほかの質問",
    sameData: "同じ記録から作ったページ（英語）",
    questions: {
      sellOut: "入荷はどのくらいもつ？",
      alerts: "入荷をいちばん早く知る方法",
      howToGet: "実際に手に入れるには",
      whichConfig: "最も入荷が多い構成",
      nearMe: "近くのライブ在庫",
      unavailable: "「受け取り不可」の意味",
    },
    otherCountries: ((us: boolean) => (us ? "ほかの国のこのページ" : "ほかの国・地域")) as unknown as RT["otherCountries"],
    faqTitle: "よくある質問",
  },
};
