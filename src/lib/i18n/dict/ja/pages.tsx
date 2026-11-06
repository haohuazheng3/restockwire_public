/**
 * 日本語: pages — ホームのボード、地域・都市・店舗ページ（/ja-jp/…）。地名は日本語で届く。
 * 入荷モジュールに渡すラベル（inPlace / atPlace / here）は助詞なしの名詞句：「東京」「Apple 銀座」「この店舗」。
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import { countryLabel } from "@/lib/i18n/places";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const country = (cc: CountryCode) => countryLabel(cc, "ja");
const N = (n: number) => num("ja", n);
const CHECK = "全店舗15秒ごと・通知設定店舗は5秒ごと";
/** 地域の呼び方（日本：都道府県）。 */
const REGION: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "都市" };
const regionOf = (cc: CountryCode) => REGION[COUNTRIES[cc].regionNoun ?? "area"] ?? "エリア";
/** 「銀座」→「Apple 銀座」（すでに Apple で始まる名前はそのまま）。 */
const apple = (name: string) => (/^apple\b/i.test(name) ? name : `Apple ${name}`);

export const pages: Dict["pages"] = {
  common: {
    checkNote: CHECK,
    appleStores: "アップルストア一覧",
    showOnMap: "地図で見る",
    restockLogs: "再入荷の記録",
    fullLog: "記録をすべて見る →",
    restocksBy: "再入荷しやすい構成",
    lastDays: (days: number) => `${N(days)}日間の再入荷（1日1本）`,
    nearbyCities: "近くのアップルストアのある都市",
    neighboringStates: "隣接する地域",
    acrossStateLine: "境界のすぐ向こう",
    allUsRestocks: "米国の全再入荷",
    allRestocksIn: (cc: CountryCode) => `${country(cc)}の全再入荷`,
    regionRestocks: (place: string) => `${place}全域の再入荷`,
    onTheMap: (place: string) => `${place}の店舗を地図で`,
    allOf: (place: string) => `${place}の概要`,
    allOfArrow: (place: string) => `${place}の概要 →`,
    storeAndCity: (store: string, city: string) => `${store} · ${city}`,
    appleStorePage: (store: string) => `Apple公式：${store}の店舗ページ`,
    sourcesWhere: (n: number, cc: CountryCode) => `${country(cc)}のアップルストア全${N(n)}店舗`,
    inPlace: (place: string) => place,
    atPlace: (place: string) => place,
    here: "表示中の店舗",
    storesWithIt: "受け取り可の店舗",
    whenRestock: (place: string) => `${place}のアップルストアはいつ再入荷する？`,
    howFast: (place: string) => `${place}の再入荷はどれくらい持つ？`,
    latestIn: (place: string) => `${place}の最新の再入荷`,
    noneIn: (place: string) => `${place}では、まだ再入荷の記録がありません。`,
    faqTitle: (place: string) => `${place}のアップルストアQ&A`,
    itemList: (place: string) => `${place}のアップルストア所在地`,
    alertIn: (place: string) => `${place}の通知を設定`,
    panelPick: (place: string) => `iPhoneを選んでから、行ける${place}の店舗にチェック`,
    matrixH2: "店舗別・全機種の在庫",
    matrixHint: "機種ごとに「いま在庫 / チェック対象」。",
    matrixLabel: "店舗ごとの在庫",
    cityPage: "都市ページへ →",
    storePage: "店舗ページへ →",
    since: "2026年11月2日",
  },
  home: {
    storesWith: (short: string) => `${short}を受け取れる店舗`,
    restocks24: "再入荷 · 直近24時間",
    week: (n: number) => ` · 7日間で${N(n)}回`,
    lastCheck: "最新チェック",
    more: (n: number) => `ほか${N(n)}件`,
    latest: (short: string) => `${short}：最新の再入荷`,
    none: (short: string) => `${short}の再入荷はまだありません。`,
    allRestocks: "再入荷の全記録",
    modelMap: (short: string) => `${short}を地図で見る`,
    buy: "apple.comで注文",
    liveStock: (short: string) => `${short}の在庫（ライブ）`,
    live: "速報",
    alsoTracking: "同時に監視中：",
    liveMap: "在庫の地図",
    allStores: "店舗一覧",
    questions: "Q&A",
  },
  region: {
    counts: (stores: number, cities: number) => `${N(cities)}都市に${N(stores)}店舗 · ${CHECK}にチェック`,
    nearbyOutside: (place: string) => `${place}の外で最寄りのアップルストア`,
    nearbyHint: (place: string) => `${place}の店舗の中心点からの距離。`,
    beyond: (place: string) => `${place}以外`,
    everyStore: (place: string) => `${place}の店舗をひとつずつ`,
    nearestRegions: (cc: CountryCode) => `${country(cc)}の隣接する${regionOf(cc)}`,
  },
  city: {
    counts: (stores: number) => `アップルストア${N(stores)}店舗 · ${CHECK}にチェック`,
    storeHeading: (name: string) => apple(name),
    details: "この店舗について",
    outside: (place: string) => `${place}の外で最寄りの店舗`,
    outsideRegion: (region: string) => `${region}の外で最寄りの店舗`,
    around: (place: string) => `${place}の近く`,
    otherCities: (region: string) => `店舗のある${region}のほかの都市`,
  },
  store: {
    description: (a: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `${a.place}（${a.city}${a.street ? `・${a.street}` : ""}）の店頭受け取り在庫をライブで。iPhone Duo ${N(a.duo)}構成、18 Pro ${N(a.pro)}構成、Pro Max ${N(a.pm)}構成をチェック。営業時間、再入荷の時間帯、近くの店舗も。`,
      `${a.place}（${a.where}）：Duo ${N(a.duo)}・18 Pro ${N(a.pro)}・Pro Max ${N(a.pm)}構成の受け取り在庫をライブで。本日の営業時間といつもの再入荷時間も。`,
      `${a.place}（${a.city}）：Duo ${N(a.duo)}・18 Pro ${N(a.pro)}・Pro Max ${N(a.pm)}構成のライブ在庫、営業時間、再入荷。`,
    ],
    where: (city: string, cc: CountryCode) => `${city}（${country(cc)}）`,
    taxQ: (place: string) => `${place}のiPhone Duo、税込ではいくら？`,
    pickupQ: (place: string) => `apple.comの注文を${place}で店頭受け取りできますか？`,
    pickupA: (place: string) => `はい。購入手続きで「受け取り」と${place}を指定し、Appleの「準備完了」の連絡を待ってから来店します。持参するのは注文番号、写真付きの公的身分証、QRコードかWalletのパスで、スクリーンショットは使えません。`,
    /** 「銀座」→「アップルストア銀座」：人が検索する呼び方。 */
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "アップルストア") : `アップルストア${name}`),
    hoursH2: (storeWord: string) => `${storeWord}：営業時間・所在地・受け取りのルール`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `${place}の所在地は${address}${phone ? `、電話は${phone}` : ""}。本日の営業時間：${today}。1週間：${week}。`,
    pickupRules: (helpUrl: string) => [
      `**来店はAppleの受け取り準備完了の通知が届いてから**（[Appleの受け取りルール](${helpUrl})）`,
      "**持参するもの：**注文番号 · 写真付きの公的身分証 · QRコードかWalletのパス",
      "**使えないもの：**コードを撮ったスクリーンショット",
      "**代理の受け取り：**購入手続きで指定した受取人のみ",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[${place}への経路を調べる](${dirUrl})${appleUrl ? ` · [apple.comのこの店舗](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `${place}：${where}で唯一のアップルストア`,
    onlyInCountry: (place: string, cc: CountryCode) => `${country(cc)}の店頭受け取りはすべて、国内唯一のアップルストアである${place}を通ります。構成がここに並んだとき、代わりの店舗はありません。この店舗の通知こそが作戦のすべてです。`,
    onlyInCity: (city: string, place: string, backups: string) => `${city}のアップルストアは${place}だけです。${backups ? `次に近いのは${backups}。` : ""}`,
    backup: (appleName: string, city: string, dist: string) => `${appleName}（${city}、${dist}）`,
    onlyBlockCountry: (place: string) => `通知1件＝1店舗×1つの構成。${place}にあなたの構成が並べば、数秒でスマートフォンに届きます。`,
    onlyBlock: (place: string) => `${place}にあなたの構成がないときは、これらの代わりの店舗にも通知を。通知1件＝1店舗×1つの構成で、その店舗に並んでから数秒でプッシュが届きます。`,
    intro: (a: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>いま{a.place}{a.street ? `（${a.street}）` : ""}で店頭受け取りできるのは、iPhone Duo <b className="text-ink">{N(a.duoOf)}構成中{N(a.duo)}</b>、iPhone 18 Pro <b className="text-ink">{N(a.proOf)}構成中{N(a.pro)}</b>、iPhone 18 Pro Max <b className="text-ink">{N(a.pmOf)}構成中{N(a.pm)}</b>です。{a.peak ? <>この店舗のいつもの再入荷時間は、現地時間の<b className="text-ink">{a.peak}</b>台です。</> : null}</>
    ),
    restocks30: (n: number) => `14日間で再入荷${N(n)}回`,
    lookupOff: "現在、Appleはこの店舗の店頭受け取り在庫照会を停止しています。RestockWireは30分ごとに問い合わせ直し、Appleが応答した瞬間に在庫を表示します。",
    checked: "チェック",
    alertHere: (short: string) => `この店舗で${short}を見張る`,
    panel: (name: string) => `${apple(name)}：iPhoneを選び、この店舗と行けるほかの店舗にチェック`,
    configsInStock: "受け取り可の構成",
    stockNowH2: "いま店頭受け取りできるもの",
    whenRestock: (name: string) => `${apple(name)}は何時に再入荷する？`,
    howFast: (name: string) => `${apple(name)}の再入荷はどれくらい持つ？`,
    history: "この店舗の再入荷記録",
    historyEmpty: "この店舗にはまだ記録がありません。再入荷も完売もゼロです。",
    nearby: "周辺の店舗",
    elsewhereIn: (region: string) => `${region}の少し離れた店舗`,
    faqTitle: (place: string) => `${place}についてのQ&A`,
    applePage: (place: string) => `Apple公式：${place}のページ（営業時間、イベント）`,
    sourcesWhere: (n: number, cc: CountryCode) => `${country(cc)}の${n === 1 ? "唯一のアップルストア" : `アップルストア全${N(n)}店舗`}`,
    around: (place: string) => `${place}の近く`,
    otherInCity: (city: string) => `${city}にあるほかのアップルストア`,
    cityPage: (city: string) => `${city}の概要`,
    moreIn: (region: string) => `${region}のほかの店舗`,
    everyIn: (cc: CountryCode) => `${country(cc)}のアップルストア一覧（全店舗）`,
    allIn: (cc: CountryCode) => `${country(cc)}の全アップルストア`,
    countryHome: (cc: CountryCode) => `${country(cc)}の概要`,
    footnote: "在庫状況は、直近のチェックでapple.comが店頭受け取りについて示した内容です。",
    footnoteIntl: (cc: CountryCode) => `価格は${COUNTRIES[cc].currency === "JPY" ? "日本円" : COUNTRIES[cc].currency}、距離はkm表示。RestockWireは行政のサイトでも販売店のサイトでもありません。`,
  },
};
