/**
 * 日本語: content — SEO の部品（FAQ、関連リンク、数値の帯、製品ページの部品、出典、ライブ部品）、enrich の補助
 * （営業時間、所要時間、FAQ の答え、タイトル）、ライブ {{tokens}}、入荷パターンの一文、写真の代替テキスト。
 * 数値・所要時間・店舗名・都市名・カラー名は日本語に整形済みで届く。機種名、容量、Apple Store、RestockWire、apple.com は訳さない。
 * チェック間隔は 15 秒と 5 秒のみ。
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";

const f = (x: Forms): Forms => x;

type Kind = "state" | "city" | "store" | "model";

export const content: Dict["content"] = {
  hours: {
    closed: "定休",
    everyDay: (hours: string) => `毎日 ${hours}`,
    tomorrow: "明日",
    /** 曜日は「日」のような一文字で届く：「日曜 11:00」。 */
    dayAt: (day: string, time: string) => `${day.length === 1 ? `${day}曜` : day} ${time}`,
    closedTodayOpens: (next: string) => `本日は休業 · 次の開店は${next}`,
    closedToday: "本日は休業",
    opensAt: (time: string) => `${time}に開店`,
    openNow: (closes: string) => `営業中 · ${closes}まで`,
    closedNowOpens: (next: string) => `ただいま営業時間外 · 次の開店は${next}`,
    closedNow: "ただいま営業時間外",
  },

  duration: {
    underAMinute: "1分未満",
    pair: (a: string, b: string) => `${a}${b}`,
  },
  listMore: (n: string) => `ほか${n}件`,
  nearLine: (place: string, distance: string) => `${place}・${distance}`,

  faq: {
    /** 文の主題として使う：「Apple 銀座では」「東京では」「iPhone Duoは」。 */
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}は` : `${place}では`),
    nRestocks: f({ other: "#回の入荷" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${where}過去${days}日間、入荷はゼロです` : `${where}過去${days}日間で${count}（直近1週間は${week}回）`}${peak ? `。現地時間の${peak.hour}前後に集中し${peak.day ? `、曜日では${peak.day}が最多です` : "ています"}` : ""}。Apple自身は入荷スケジュールを発表していません。`,
    lastsNone: (where: string) => `${where}完売まで追えた入荷がまだ少なく、数字にできません。`,
    lasts: (days: string, duration: string) => `中央値で約${duration}。過去${days}日間、入荷した構成が完売するまで掲載されていた時間です。`,
    storeIn: (store: string, line: string) => `${store}（${line}）`,
    nearestA: (stores: string) => `${stores}です。`,

    modelStockQ: (model: string) => `いま${model}を店頭受け取りできるのはどこ？`,
    modelStockNone: (model: string) => `最新のチェックでは、米国のアップルストアに掲載はありませんでした。${model}が受け取り可能になれば、最初の1店舗をすぐにこのページに載せます。`,
    nUsStores: f({ other: "米国のアップルストア#店舗" }),
    modelStockSome: (count: string) => `最新のチェックで${count}。各店舗と在庫のある構成をこのページに掲載しています。`,
    priceQ: (model: string) => `${model}の価格は？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `SIMフリーで${low}〜${high}。価格は容量（${storages}）で決まり、カラーは${colors}です。`,
    modelRestockQ: (model: string) => `${model}はどのくらいの頻度で再入荷する？`,
    modelLastsQ: (model: string) => `${model}は再入荷後、どのくらい在庫が残る？`,
    reserveQ: (model: string) => `${model}を店頭受け取りで取り置きする方法は？`,
    reserveA: "事前の予約はできません。店舗に希望の構成が掲載されたらapple.comで店頭受け取りを選んで注文すると、選んだ時間枠までAppleが確保します。",

    storeStockQ: (store: string, model: string) => `${store}に${model}の在庫はある？`,
    nConfigs: f({ other: "#構成" }),
    storeStockYes: (count: string) => `あります。最新のチェックで${count}。容量とカラーはこのページの表のとおりです。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `最新のチェックではありません${other ? `。iPhone 18 Proは${other.pro}構成、18 Pro Maxは${other.proMax}構成が掲載されています` : `。18 Proと18 Pro Maxの構成もありません`}。`,
    hoursQ: (store: string) => `${store}の営業時間は？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "営業時間はこのページの表をご覧ください"}${today ? `。本日は${today}` : ""}。所在地：${address}${phone ? `、電話：${phone}` : ""}。`,
    storeRestockQ: (store: string) => `${store}のiPhoneはどのくらいの頻度で再入荷する？`,
    storeLastsQ: (store: string) => `${store}で入荷した在庫はどのくらい残る？`,
    storeNearestQ: (store: string) => `${store}から近いアップルストアは？`,

    placeStockQ: (place: string, model: string) => `${place}で、いま${model}を店頭受け取りできるアップルストアは？`,
    placeStockNone: (place: string, model: string) => `最新のチェックではゼロです。${place}の店舗に${model}が掲載されれば、その瞬間このページに表示されます。`,
    nStores: f({ other: "#店舗" }),
    placeStockSome: (count: string, stores: string) => `最新のチェックで${count}：${stores}。`,
    countQ: (place: string) => `${place}のアップルストアは何店舗？`,
    nAppleStores: f({ other: "#店舗" }),
    countMany: (count: string, stores: string) => `${count}です。${stores}など。`,
    countOne: (count: string, store: string) => `${count}、${store}です。`,
    placeRestockQ: (place: string) => `${place}のiPhoneはどのくらいの頻度で再入荷する？`,
    placeLastsQ: (place: string) => `${place}で再入荷した在庫はどのくらい残る？`,
    placeNearestQ: (place: string) => `${place}の外で近いアップルストアは？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "米国の全アップルストア" : `${place}のアップルストア`;
    return [
      "店頭受け取りはapple.comでの購入です。注文時に構成と店舗を選び、オンラインで支払って店舗で受け取ります。当日受け取れることも珍しくありません。キャリアショップや店頭に並ぶ在庫とは別枠です。",
      `RestockWireは${at}の対象構成をすべて15秒ごと、通知が設定された店舗は5秒ごとに読み取ります。変化は2回目のチェックで確認できてから記録するので、一時的な不具合が入荷や完売として表示されることはありません。`,
      "確認した変化はすべて記録に入り、その記録からこのページの入荷グラフと履歴を描いています。",
    ];
  },
  alertRule: "通知1件＝1店舗＋1台の正確な構成（機種・容量・カラー）。apple.comが受け取り可能に切り替わってから数秒でプッシュ通知を送ります。通知を受け取れる端末がなければメールで届きます。",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `${name}のアップルストア：iPhone Duoは${stores}店舗中${duoNow}店舗に在庫`,
      `${name}のアップルストア｜iPhone Duoの受け取り在庫をライブで`,
      `${name}のアップルストア｜いまのiPhone Duo在庫`,
      `${name}のアップルストア｜iPhone在庫をライブで`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `${city}（${code}）のアップルストア：iPhone Duoは${stores}店舗中${duoNow}店舗`,
      `${city}（${code}）のアップルストア｜iPhone Duoの受け取り在庫`,
      `${city}（${code}）のアップルストア｜いまのiPhone Duo在庫`,
      `${city}のアップルストア｜iPhone在庫をライブで`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? `（${region}）` : "";
      return [
        `${name}${r}：iPhone在庫・入荷時間・店頭受け取り`,
        `${name}${r}：iPhone在庫と入荷時間`,
        `${name}${r}：iPhone在庫と営業時間`,
        `${name}：iPhone在庫・入荷時間・店頭受け取り`,
        `${name}：iPhone在庫と営業時間`,
        `${name}：iPhone在庫をライブで`,
        `${name}｜ライブ在庫`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name}の受け取り在庫：いま${storesNow}店舗のアップルストアに掲載`,
      `${name}の受け取り在庫：いま${storesNow}店舗`,
      `${name}の店頭受け取り在庫をライブで`,
    ],
  },

  tokens: {
    tooFewToMeasure: "まだデータ不足",
    noneLoggedYet: "まだ記録なし",
    noneYet: "まだなし",
  },

  pattern: {
    none: (days: string) => `過去${days}日間、確認済みの入荷はゼロです。`,
    nConfirmed: f({ other: "確認済みの入荷#回" }),
    countIn: (count: string, days: string) => `過去${days}日間で${count}`,
    stay: (minutes: string) => `。入荷した在庫はふつう約${minutes}分掲載されます`,
    nDays: f({ other: "#日" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? `（${onDays}に分散）` : ""}。いつもの時間帯を言うにはまだ足りません${stay}。`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `いつもの入荷時間：現地時間の${hour}${weekday ? `、曜日では${weekday}が最多` : ""}。${count}${stay}。`,
  },

  regionNouns: {
    state: f({ other: "州" }),
    province: f({ other: "州" }),
    area: f({ other: "エリア" }),
    department: f({ other: "県" }),
    prefecture: f({ other: "都道府県" }),
    emirate: f({ other: "首長国" }),
    canton: f({ other: "州" }),
    region: f({ other: "地域" }),
    county: f({ other: "県" }),
    city: f({ other: "都市" }),
  } as Record<string, Forms>,

  measured: "数値の測り方",

  faqTitle: "質問と回答",
  breadcrumb: "パンくずリスト",
  keepExploring: "RestockWireのほかのページ",
  browse: {
    storesByState: "州別の店舗",
    allStatesCities: "すべての州と都市 →",
    liveByModel: "機種別のライブ在庫",
    modelStock: (model: string) => `${model}の在庫`,
    thisPage: "このページ",
    restockLog: (short: string) => `${short}の入荷記録`,
    liveMap: "ライブマップ",
    mostStores: "店舗数の多い地域",
    allStates: "すべての州",
    bigCities: "主要都市",
    cities: "都市",
    storesBy: (region: string) => `${region}別の店舗`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{country}のすべてのアップルストア →</>,
    allRegions: (regions: string) => `すべての${regions}`,
  },
  modelCards: "iPhoneを選ぶ",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>最新の入荷：{config}{at}、{ago}。</>,
    at: (store: ReactNode) => <>（{store}）</>,
  },
  statStrip: {
    inStockNow: "いま掲載中",
    ofStores: (n: string) => `${n}店舗中`,
    stores: "店舗",
    nCities: f({ other: "#都市" }),
    tracked: "チェック対象",
    modelNow: (short: string) => `いまの${short}`,
    configsInStock: "掲載中の構成",
    storesWithStock: f({ other: "在庫を掲載中の店舗" }),
    restocks24h: "入荷（24時間）",
    restocksHint: (week: string, month: string, days: string) => `7日で${week}回 · ${days}日で${month}回`,
    sellOuts: (days: string) => `完売（${days}日）`,
    stays: (duration: string) => `掲載は約${duration}`,
    noPairs: "完売の記録はまだなし",
    lastRestock: "最新の入荷",
    noneYet: "まだなし",
    inLastDays: (days: string) => `過去${days}日間`,
  },
  product: {
    chooseIphone: "iPhoneを選ぶ",
    storage: "容量",
    color: "カラー",
    all: "すべて",
    numbersAre: (unit: ReactNode) => <>数字は、いま在庫を掲載している{unit}の数です。</>,
    seen: (ago: ReactNode) => <>{ago}に掲載</>,
    last: (ago: ReactNode) => <>最終 {ago}</>,
    notSeenYet: "まだ掲載なし",
    firstCheckPending: "初回チェック待ち",
    inStock: "在庫あり",
    inStockLower: "在庫あり",
    none: "なし",
    here: "現在地",
    notAvailable: "掲載なし",
    notCheckedYet: "未チェック",
    availableForPickup: "受け取り可能",
    since: (ago: ReactNode) => <> · {ago}から掲載中</>,
    lastInStock: (ago: ReactNode) => <>最後の掲載：{ago}</>,
    neverSeen: "この店舗ではまだ掲載されたことがありません",
    firstCheckSoon: "1分以内に初回チェック",
    buy: "apple.comで注文",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked}に読み取り · {note}</>,
    checkNote: "15秒ごと、通知ありは5秒ごと",
  },

  source: (source: ReactNode) => <>データ：{source}</>,
  photoCredit: (link: ReactNode) => <>写真：{link}</>,
  sources: "出典",
  allUsStores: "米国のアップルストア全269店舗",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{since}から続くRestockWire独自のライブチェック：{where}のiPhone Duo、18 Pro、18 Pro Maxの全構成を15秒ごと（通知が設定された店舗は5秒ごと）に読み取り。このページの数値は{asOf}時点のものです。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>ライブ：{model}の構成ごとに、店頭受け取りを掲載しているアップルストアの数（{stores}店舗中）</>,
    storage: "容量",
    pricesCaption: (model: ReactNode) => <>{model}：apple.comの価格（SIMフリー、税抜）とライブの受け取り在庫</>,
    price: "価格",
    bestColor: "掲載の多いカラー（いまの店舗数）",
    noRestock: (model: string) => `${model}の入荷記録はまだありません。`,
    clockLabel: (model: string) => `全米の${model}`,
    storesWithIt: "いま掲載中の店舗",
    pairsInStock: "掲載中の店舗×構成",
    restocksLogged: "記録した入荷",
    medianTime: "掲載時間（中央値）",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Store店内の「Pickup」の表示がある木製の受け取りカウンター", caption: "店頭受け取りの注文は、こうしたカウンターで手渡されます。" },
    "phone-map": { alt: "屋外でスマートフォンの地図アプリを操作する手元", caption: "入荷が1分で消えるなら、店舗までの距離は思っている以上に重要です。" },
    "phone-card-payment": { alt: "iPhoneとクレジットカードを手にオンラインで支払う女性", caption: "店頭受け取りの代金はオンラインで支払います。" },
    "phone-on-box": { alt: "白い箱の上に置かれた新品のスマートフォン", caption: "箱から出したばかりの新しいiPhone。" },
    "city-map-phone": { alt: "スマートフォンで街の地図を確認する二人", caption: "店舗までのルートを確認。" },
    "phone-notification": { alt: "ロック画面に通知が表示されたスマートフォンを持つ手", caption: "入荷通知はロック画面に届きます。" },
    "apple-store-crowd-inside": { alt: "ショッピングセンター内の混雑したApple Storeに並ぶ人たち", caption: "発売週のApple Store店内。店頭に届いた在庫は数分でなくなります。" },
    "apple-store-glass-canopy": { alt: "夜の、ガラス張りで木製のひさしがあるApple Store", caption: "夜のガラス張りのApple Store。" },
    "apple-store-night-vancouver": { alt: "夜に明かりがともるバンクーバーのApple Store", caption: "夜のApple Store。受け取り在庫はいつでも出得ますが、朝のほうがはるかに多く出ます。" },
    "phone-hand-camera": { alt: "トリプルカメラのiPhoneを持つ人", caption: "行列ができるのはProモデルです。" },
    "place-jp-japan": { alt: "晴れた日の新倉山浅間公園の忠霊塔と富士山", caption: "富士山と忠霊塔（山梨県）。" },
    "place-jp-tokyo": { alt: "青空の下、東京スカイツリーと東京の街を上空から望む", caption: "上空から見た東京とスカイツリー。" },
    "place-jp-osaka": { alt: "大阪・道頓堀の運河沿いに並ぶ色とりどりの看板", caption: "大阪・道頓堀。" },
  },
};
