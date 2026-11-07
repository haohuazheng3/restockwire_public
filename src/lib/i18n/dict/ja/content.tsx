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
    everyDay: (hours: string) => `全曜日 ${hours}`,
    tomorrow: "あす",
    /** 曜日は「日」のような一文字で届く → 「日曜日 11:00」。 */
    dayAt: (day: string, time: string) => `${day.length === 1 ? `${day}曜日` : day} ${time}`,
    closedTodayOpens: (next: string) => `本日は休業 · 次の開店は${next}`,
    closedToday: "本日は休業",
    opensAt: (time: string) => `${time}に開店`,
    openNow: (closes: string) => `営業中 · ${closes}まで`,
    closedNowOpens: (next: string) => `ただいま営業時間外 · 次の開店は${next}`,
    closedNow: "ただいま営業時間外",
  },

  duration: {
    underAMinute: "1分足らず",
    pair: (a: string, b: string) => `${a}${b}`,
  },
  listMore: (n: string) => `他${n}件`,
  nearLine: (place: string, distance: string) => `${place}（${distance}）`,

  faq: {
    /** 文頭に置く：「Apple 銀座の場合、」「東京の場合、」「iPhone Duo全体では、」。 */
    where: (kind: Kind, place: string) => (kind === "model" ? `${place}全体では、` : `${place}の場合、`),
    nRestocks: f({ other: "#回の入荷" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `${where}直近${days}日の入荷はゼロです` : `${where}直近${days}日で${count}（うち最近7日は${week}回）`}${peak ? `。現地時間の${peak.hour}前後に集中し${peak.day ? `、曜日では${peak.day}が最多です` : "ています"}` : ""}。Apple自身は入荷スケジュールを発表していません。`,
    lastsNone: (where: string) => `${where}完売まで追えた入荷がまだ少なく、数字にできません。`,
    lasts: (days: string, duration: string) => `中央値で約${duration}。過去${days}日間、入荷した構成が完売するまで掲載されていた時間です。`,
    storeIn: (store: string, line: string) => `${store}（${line}）`,
    nearestA: (stores: string) => `最寄りは${stores}。`,

    modelStockQ: (model: string) => `いま${model}を店頭受け取りできるのはどこ？`,
    modelStockNone: (model: string) => `最新のチェックでは、米国のアップルストアに掲載はありませんでした。${model}が受け取り可能になれば、最初の1店舗をすぐにこのページに載せます。`,
    nUsStores: f({ other: "米国のアップルストア#店舗" }),
    modelStockSome: (count: string) => `最新のチェックで${count}。各店舗と在庫のある構成をこのページに掲載しています。`,
    priceQ: (model: string) => `${model}はいくら？`,
    priceA: (low: string, high: string, storages: string, colors: string) => `SIMフリー版は${low}から${high}まで。差がつくのは容量（${storages}）だけで、色は${colors}から選べます。`,
    modelRestockQ: (model: string) => `${model}はどのくらいの頻度で再入荷する？`,
    modelLastsQ: (model: string) => `${model}は再入荷後、どのくらい在庫が残る？`,
    reserveQ: (model: string) => `${model}を店頭受け取りで取り置きする方法は？`,
    reserveA: "事前の予約はできません。店舗に希望の構成が掲載されたらapple.comで店頭受け取りを選んで注文すると、選んだ時間枠までAppleが確保します。",

    storeStockQ: (store: string, model: string) => `${store}に${model}の在庫はある？`,
    nConfigs: f({ other: "#種類の構成" }),
    storeStockYes: (count: string) => `はい。直近のチェックでは${count}が受け取り可能です。容量と色の内訳は下の表にあります。`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `直近のチェックでは掲載ゼロです${other ? `。同じ店舗ではiPhone 18 Proが${other.pro}構成、18 Pro Maxが${other.proMax}構成、受け取り可能です` : `。18 Proと18 Pro Maxも掲載なしです`}。`,
    hoursQ: (store: string) => `${store}は何時から何時まで？`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ?? "曜日ごとの営業時間は下の表のとおりです"}${today ? `。きょうは${today}` : ""}。住所：${address}${phone ? `／電話：${phone}` : ""}。`,
    storeRestockQ: (store: string) => `${store}のiPhoneはどのくらいの頻度で再入荷する？`,
    storeLastsQ: (store: string) => `${store}で入荷した在庫はどのくらい残る？`,
    storeNearestQ: (store: string) => `${store}から近いアップルストアは？`,

    placeStockQ: (place: string, model: string) => `${place}で${model}を店頭受け取りできるアップルストアは、いまどこ？`,
    placeStockNone: (place: string, model: string) => `直近のチェックでは0店です。${place}のどこかに${model}が載った時点で、このページに出ます。`,
    nStores: f({ other: "#店" }),
    placeStockSome: (count: string, stores: string) => `直近のチェックでは${count}：${stores}。`,
    countQ: (place: string) => `${place}のアップルストアは何店舗？`,
    nAppleStores: f({ other: "#店" }),
    countMany: (count: string, stores: string) => `全部で${count}。主な店舗は${stores}。`,
    countOne: (count: string, store: string) => `${store}の${count}のみです。`,
    placeRestockQ: (place: string) => `${place}のiPhoneはどのくらいの頻度で再入荷する？`,
    placeLastsQ: (place: string) => `${place}で再入荷した在庫はどのくらい残る？`,
    placeNearestQ: (place: string) => `${place}の外で近いアップルストアは？`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? place : kind === "model" ? "米国内の全Apple Store" : `${place}の各Apple Store`;
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
      `iPhone Duoの受け取り在庫｜${city}（${code}）のアップルストア`,
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
    noneLoggedYet: "記録待ち",
    noneYet: "現時点でなし",
  },

  pattern: {
    none: (days: string) => `過去${days}日間、確認済みの入荷はゼロです。`,
    nConfirmed: f({ other: "確認できた入荷#回" }),
    countIn: (count: string, days: string) => `過去${days}日間で${count}`,
    stay: (minutes: string) => `。入荷した在庫はふつう約${minutes}分掲載されます`,
    nDays: f({ other: "#日間" }),
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
  breadcrumb: "現在位置",
  keepExploring: "RestockWireのほかのページ",
  browse: {
    storesByState: "州ごとの店舗一覧",
    allStatesCities: "全州・全都市を見る →",
    liveByModel: "機種ごとのいまの在庫",
    modelStock: (model: string) => `${model}の在庫状況`,
    thisPage: "現在のページ",
    restockLog: (short: string) => `${short}の入荷記録`,
    liveMap: "ライブマップ",
    mostStores: "店舗が多いエリア",
    allStates: "全州一覧",
    bigCities: "大都市",
    cities: "都市一覧",
    storesBy: (region: string) => `${region}ごとの店舗`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>{country}のすべてのアップルストア →</>,
    allRegions: (regions: string) => `${regions}一覧`,
  },
  modelCards: "機種を選ぶ",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>直近の入荷は{config}{at}、{ago}。</>,
    at: (store: ReactNode) => <>（{store}）</>,
  },
  statStrip: {
    inStockNow: "いま掲載中",
    ofStores: (n: string) => `全${n}店舗のうち`,
    stores: "店舗数",
    nCities: f({ other: "#つの都市" }),
    tracked: "監視中",
    modelNow: (short: string) => `いまの${short}`,
    configsInStock: "掲載中の構成",
    storesWithStock: f({ other: "在庫を掲載中の店舗" }),
    restocks24h: "入荷（24時間）",
    restocksHint: (week: string, month: string, days: string) => `7日で${week}回 · ${days}日で${month}回`,
    sellOuts: (days: string) => `完売（${days}日）`,
    stays: (duration: string) => `掲載は約${duration}`,
    noPairs: "完売の記録はまだなし",
    lastRestock: "直近の入荷",
    noneYet: "現時点でなし",
    inLastDays: (days: string) => `直近${days}日`,
  },
  product: {
    chooseIphone: "機種を選ぶ",
    storage: "ストレージ",
    color: "色",
    all: "全部",
    numbersAre: (unit: ReactNode) => <>数字は、いま在庫を掲載している{unit}の数です。</>,
    seen: (ago: ReactNode) => <>{ago}に掲載</>,
    last: (ago: ReactNode) => <>直近 {ago}</>,
    notSeenYet: "まだ掲載なし",
    firstCheckPending: "最初の確認待ち",
    inStock: "受け取り可",
    inStockLower: "受け取り可",
    none: "ゼロ",
    here: "この場所",
    notAvailable: "掲載なし",
    notCheckedYet: "確認前",
    availableForPickup: "店頭受け取りOK",
    since: (ago: ReactNode) => <> · {ago}から掲載中</>,
    lastInStock: (ago: ReactNode) => <>最後の掲載：{ago}</>,
    neverSeen: "この店舗ではまだ掲載されたことがありません",
    firstCheckSoon: "最初の確認は1分以内",
    buy: "apple.comで注文",
    checked: (checked: ReactNode, note: ReactNode) => <>{checked}に読み取り · {note}</>,
    checkNote: "15秒ごと、通知ありは5秒ごと",
  },

  source: (source: ReactNode) => <>データ：{source}</>,
  photoCredit: (link: ReactNode) => <>撮影：{link}</>,
  sources: "参照元",
  allUsStores: "全米269店舗のアップルストア",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>{since}から続くRestockWire独自のライブチェック：{where}のiPhone Duo、18 Pro、18 Pro Maxの全構成を15秒ごと（通知が設定された店舗は5秒ごと）に読み取り。このページの数値は{asOf}時点のものです。</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>ライブ：{model}の構成ごとに、店頭受け取りを掲載しているアップルストアの数（{stores}店舗中）</>,
    storage: "ストレージ",
    pricesCaption: (model: ReactNode) => <>{model}：apple.comの価格（SIMフリー、税抜）とライブの受け取り在庫</>,
    price: "本体価格",
    bestColor: "掲載の多いカラー（いまの店舗数）",
    noRestock: (model: string) => `${model}の入荷記録はまだありません。`,
    clockLabel: (model: string) => `全米の${model}`,
    storesWithIt: "いま掲載中の店舗",
    pairsInStock: "掲載中の店舗×構成",
    restocksLogged: "入荷の記録数",
    medianTime: "掲載時間（中央値）",
    underOneMin: (min: string) => `< ${min}`,
  },

  photos: {
    "apple-store-pickup-counter": { alt: "Apple Storeが入る、エスカレーターと自然光のある広々としたショッピングモールの吹き抜け", caption: "こうしたモール内の店舗は、開店前に受け取り在庫が補充されます。" },
    "phone-map": { alt: "屋外で地図アプリを表示したスマートフォンを手に持つ様子", caption: "受け取りの店舗までは、まず地図で距離を確かめます。" },
    "phone-card-payment": { alt: "決済端末にスマートフォンをかざしてタッチ決済をする女性", caption: "支払いはスマートフォンのタッチ決済で。" },
    "phone-on-box": { alt: "白い背景に置かれた、箱入りのスマートフォン", caption: "白い背景の上の、箱入りスマートフォン。" },
    "city-map-phone": { alt: "郊外のドライブ中、スマートフォンでルートを確かめる若いカップル", caption: "移動中もスマートフォンでルートを確認。" },
    "phone-notification": { alt: "「Hard Work Forever Pays.」という言葉を表示したスマートフォンを持つ手", caption: "スマートフォンの画面に映る一言。" },
    "apple-store-crowd-inside": { alt: "バンコクのショッピングモール内のApple Storeで、テーブルの製品を試す買い物客", caption: "店内のテーブルはすべて試用コーナー。受け取りの列は奥にできます。" },
    "apple-store-glass-canopy": { alt: "シカゴ中心部の川沿いに建つ、ガラス張りのApple Storeの外観", caption: "シカゴの川沿いに建つガラス張りのApple Store。" },
    "apple-store-night-vancouver": { alt: "夜景にライトアップされた橋が浮かぶバンクーバーの空撮", caption: "夜のバンクーバーを上空から。" },
    "phone-hand-camera": { alt: "オレンジのケースに3眼カメラのスマートフォンを持つ手のアップ", caption: "3眼カメラのスマートフォンを手に。" },
    "place-jp-japan": { alt: "曇り空の下、奥に富士山がそびえる東京の街並みのパノラマ", caption: "日本：東京の街並みの奥にそびえる富士山。" },
    "place-jp-tokyo": { alt: "夕暮れどき、街の明かりがともり始めた東京の街並み", caption: "東京：夕暮れの街並みと明かり。" },
    "place-jp-osaka": { alt: "高層ビル群と、その奥に山並みが見える大阪の街並み", caption: "大阪：高層ビルの向こうに連なる山並み。" },
    "compare-pickup-bag": { alt: "屋内でショッピングバッグを手渡す二人", caption: "受け取りはカウンターで終わりますが、店舗選びはずっと前から始まっています。" },
    "compare-two-stores": { alt: "人通りの多い通りで、ガラスの店頭に映る歩行者", caption: "同じ街の2店舗でも、補充の時間帯はしばしば違います。" },
    "guide-android-phone": { alt: "ホーム画面を表示したAndroidスマートフォンを持つ手", caption: "Androidなら、何もインストールせずにChromeが通知を届けます。" },
    "guide-android-watch": { alt: "スマートウォッチを着けた女性の手元のクローズアップ", caption: "ペアリングしたWear OSウォッチに、Chromeが受け取った通知が表示されます。" },
    "guide-focus-desk": { alt: "オフィスのデスクでノートパソコンの横でスマートフォンを確認する若い女性", caption: "RestockWireを許可リストに入れ忘れやすいのが「仕事」集中モードです。" },
    "guide-focus-phone-night": { alt: "暗い寝室で画面の光に照らされながらスマートフォンを使う女性", caption: "「睡眠」集中モードは、RestockWireが許可リストにない限り通知を止めます。" },
    "guide-watch-notification": { alt: "屋外で、手首に着けたスマートウォッチをタップする手", caption: "店舗は手首で確認し、予約はiPhoneで行います。" },
    "guide-watch-wrist": { alt: "手首のスマートウォッチに通知が表示されたモノクロのクローズアップ", caption: "iPhoneがロック中なら、補充の通知はウォッチに届きます。" },
    "ranking-checkout": { alt: "店のレジ端末でスマートフォンを使って支払う客", caption: "最速の店舗では、通知から数秒以内に予約を終える必要があります。" },
    "ranking-queue": { alt: "街中のにぎわう店の前に並ぶ人々", caption: "すぐ売り切れるのは、入荷量ではなく店舗周辺の需要によるものです。" },
    "reports-delivery-boxes": { alt: "倉庫の搬入口の前に積み上げられた段ボール箱", caption: "在庫は配送で店舗に届きます。週次レポートが数えるのは、受け取り棚に並んだ分です。" },
    "reports-iphone-boxes": { alt: "木のテーブルに並べられた新しいiPhone、箱、充電アクセサリ", caption: "レポートの補充1件は、1店舗で1つの構成が戻ったことを指します。" },
    "status-phone-check": { alt: "薄暗い部屋でスマートフォンをじっと見る女性", caption: "受け取り確認を待つ数分間こそ、照会の状態を知る意味があります。" },
    "status-store-counter": { alt: "読み込み中のスピナーが表示されたスマートフォンを持つ手", caption: "照会が止まるとこう見えます。原因がAppleか手元の端末かは、ステータスページでわかります。" },
  },
};
