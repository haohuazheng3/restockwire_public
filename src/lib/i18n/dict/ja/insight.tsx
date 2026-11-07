/**
 * 日本語: insight — Apple 店頭受け取りの稼働状況、週間入荷レポート、売り切れが速いアップルストア、店舗比較、
 * スマートフォン通知ガイド（/ja-jp/…）。英語 dict/en/insight.tsx と同じキー・同じ引数。
 * 数字・秒・日付・店舗名・国名は日本語で整形済みで届く。`w.in` は国名だけなので助詞（「日本の」「日本で」）はここで付ける。
 * チェック間隔は 15 秒と 5 秒のみ。返金には触れない。
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";

export const insight: InsightDict = {
  nav: {
    status: "Apple 店頭受け取りの稼働状況",
    reports: "週間入荷レポート",
    fastest: "売り切れが速いアップルストア",
    compare: "店舗どうしの比較",
    guides: "スマートフォン通知ガイド",
    otherCountries: "ほかの国の同じページ",
    updated: (when: string) => `${when} 更新`,
    sources: "出典と集計方法",
    cite: "この数字を引用するときは、出典としてこのページへのリンクをお願いします。",
    alertCta: "入荷通知を受け取る",
    logCta: "入荷履歴を開く",
  },

  status: {
    title: (w: Where) => (w.us ? "Apple店頭受け取りは不調？米国のライブ状況" : `${w.in}のApple店頭受け取り状況（ライブ）`),
    h1: (w: Where) => (w.us ? "Appleの店頭受け取り確認は、いま正常に動いていますか？" : `${w.in}のAppleの店頭受け取り確認は、いま正常に動いていますか？`),
    meta: (v: StatusView) =>
      `ライブ：直近1分で${v.w.in}のアップルストア${v.stores}店舗中${v.answered}店舗の受け取り照会にAppleが応答。失敗率、過去24時間の不調な時間帯、止まったときの対処法。`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `動いています。直近1分で${v.w.in}のアップルストア${v.stores}店舗中${v.answered}店舗の受け取り照会にAppleが応答し、過去1時間の失敗は${v.failLastHour}です。`
        : v.verdict === "slow"
          ? `一部だけです。直近1分でAppleが応答したのは${v.w.in}のアップルストア${v.stores}店舗中${v.answered}店舗。過去1時間の失敗は${v.failLastHour}で、在庫の表示が遅れることがあります。`
          : v.verdict === "down"
            ? `いまは動いていません。直近1分でAppleが応答したのは${v.w.in}のアップルストア${v.stores}店舗中${v.answered}店舗だけです。回復するまで、apple.comとこのサイトの在庫表示は古い可能性があります。`
            : `RestockWireはいま${v.w.in}の状況を読み取れません。1分後に再読み込みしてください。`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "正常", slow: "遅延", down: "応答なし", unknown: "不明" })[v],
    tiles: {
      answered: "直近1分で応答した店舗",
      age: "各店舗の最新チェックからの経過（中央値）",
      failHour: "失敗したリクエスト（直近60分）",
      failDay: "失敗したリクエスト（直近24時間）",
    },
    nowH2: "RestockWireにはいま何が見えていますか？",
    nowLead: (v: StatusView) =>
      `直近1分以内に${v.stores}店舗中${v.answered}店舗が応答しました${v.age ? `。標準的な店舗の最終確認は${v.age}前です` : ""}。`,
    nowPoints: (v: StatusView) => [
      `${v.w.in}のアップルストアは全店舗を15秒ごとに、通知が設定された店舗は5秒ごとに確認しています。`,
      v.oldest ? `いちばん待たされている店舗の最終応答は${v.oldest}前です。` : "この時間帯にはまだどの店舗も応答していません。",
      Number(v.never) > 0 ? `${v.never}店舗は一度も応答していません。現在Appleがその店舗で受け取り照会を提供していないためです。` : "すべての店舗が少なくとも1回は応答しています。",
    ],
    dayH2: "過去24時間はどうでしたか？",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `順調でした。過去24時間で失敗が5%以上になった時間帯はありません（全体で${v.failDay}）。`
        : `過去24時間で、失敗が5%以上になった時間帯が${v.roughHours}つありました：${v.roughList}。全体の失敗は${v.failDay}です。`,
    hourCaption: (zone: string) => `1時間ごとのリクエスト数と失敗数、過去24時間（${zone}）`,
    hourHead: ["時刻", "リクエスト", "失敗", "失敗率"],
    whyH2: "apple.comで全店舗が「購入不可」になるのはなぜ？",
    whyLead: "たいていはその構成が売り切れだからです。ときどき、Appleの照会そのものが不調なこともあります。",
    whyPoints: [
      "**売り切れ：**照会は正常に応答し、単に店舗が1つも返ってきません。このページは緑のままです。",
      "**照会の不調：**全店舗の応答が一斉に失敗するか、空で返ってきます。このページは1分以内に黄色か赤になります。",
      "**あなたのブラウザ：**開きっぱなしのapple.comのタブは古い応答を表示し続けることがあります。信じる前にバッグのページを再読み込みしてください。",
    ],
    doH2: "受け取り確認が止まったらどうすればいい？",
    doLead: "通知をオンのまま待つのが正解です。止まった照会は自然に回復し、その間の入荷も確認されます。",
    doSteps: [
      "通知はそのままに：RestockWireは照会を続け、確認できた入荷はすぐに通知します。",
      "apple.comを数秒おきに再読み込みしないでください。Appleの照会は速くなりません。",
      "5分後にこのページをもう一度確認してください。これまでの不調は数分から2時間ほどで終わっています。",
      "緑に戻ったら店舗ページを開いてください。止まっていた間の入荷は入荷履歴に残っています。",
    ],
    methodH2: "稼働状況はどう測っていますか？",
    methodPoints: [
      "**鮮度：**RestockWire自身の受け取り照会による、各店舗の最新の成功チェック。",
      "**失敗：**この国を担当する巡回での1時間あたりの失敗リクエスト数（巡回サーバーの記録）。",
      "**判定：**正常＝直近1分で店舗の90%が応答し失敗が5%未満。応答なし＝応答が半数未満。",
    ],
    otherH2: "ほかの国の受け取り状況",
    faq: (v: StatusView) => [
      { q: "apple.comの店頭受け取りは止まっていますか？", a: v.verdict === "ok" ? `${v.w.in}ではいま止まっていません。直近1分で${v.stores}店舗中${v.answered}店舗が応答しました。` : `${v.w.in}ではいま不調です。直近1分で応答したのは${v.stores}店舗中${v.answered}店舗です。` },
      { q: "赤い表示はiPhoneが売り切れという意味？", a: "いいえ。赤はAppleの照会が失敗しているという意味です。売り切れは正常な応答なので、表示は緑のままです。" },
      { q: "このページはどのくらいの頻度で更新されますか？", a: "開くたびに最新の数字を読み込みます。数字は最大でも30秒前のものです。" },
      { q: "照会が止まっている間の入荷は見逃しますか？", a: "気づくのが遅れることはあります。応答が戻ればRestockWireは入荷をすぐ確認し、その時点で通知します。" },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "米国アップルストアの週間iPhone入荷レポート" : `${w.in}の週間iPhone入荷レポート`),
    indexH1: (w: Where) => (w.us ? "週間iPhone入荷レポート" : `${w.in}の週間iPhone入荷レポート`),
    indexMeta: (w: Where) => `${w.in}のアップルストアでのiPhone Duo、18 Pro、18 Pro Maxの入荷を毎週集計。件数、入荷の多い店舗、構成、売り切れまでの速さを週ごとに。`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `${w.in}の最初のレポートは、1週間で確認済みの入荷が${"20"}件に達すると公開されます。` : `${w.in}のレポートは${n}週分あります。各号は、現地時間の月曜から日曜までの1週間についてRestockWireが確認した入荷の記録です。`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · 入荷${restocks}件${complete ? "" : " · 集計中"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone入荷レポート ${range}` : `${w.in}のiPhone入荷レポート ${range}`),
    h1: (w: Where, range: string) => `${w.in}のiPhone入荷、${range}の週`,
    meta: (v: ReportView) => `${v.range}、${v.w.in}のアップルストア${v.stores}店舗で確認したiPhoneの入荷は${v.restocks}件。入荷の多い店舗と曜日、手に入りにくい構成、売り切れまでの速さ。`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "今週ここまで："}${v.w.in}のアップルストア${v.stores}店舗で確認済みの入荷は${v.restocks}件${v.change ? `（前週比${v.change}）` : ""}。${v.topStore ? `最多は${v.topStore}で${v.topStoreN}件。` : ""}${v.medianSell ? `iPhone Duoの入荷は標準で${v.medianSell}並びました。` : ""}`,
    partial: (days: number) => `今週のうち${days}日分を集計しています。`,
    running: "今週はまだ集計中です。入荷が確認されるたびに数字が更新されます。",
    tiles: {
      restocks: "確認済みの入荷",
      stores: "入荷のあった店舗",
      sell: "iPhone Duoの掲載時間（中央値）",
      change: "前週比",
    },
    countH2: "今週の入荷は何件でしたか？",
    countLead: (v: ReportView) => `合計${v.restocks}件：iPhone Duo ${v.duo}件、iPhone 18 Pro ${v.pro}件、iPhone 18 Pro Max ${v.proMax}件。構成は${v.configs}種類です。`,
    storesH2: "入荷が多かったアップルストアは？",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}で、入荷は${v.topStoreN}件。上位10店舗は下の表のとおりです。` : "今週はどの店舗にも入荷がありませんでした。"),
    storesHead: ["#", "アップルストア", "入荷"],
    configsH2: "戻ってきたiPhone Duoの構成は？",
    configsLead: (v: ReportView) =>
      v.topConfig ? `最も多く戻ったのは${v.topConfig}（${v.topConfigN}件）。${v.lastConfig && v.lastConfig !== v.topConfig ? `最も少なかったのは${v.lastConfig}です。` : ""}` : "今週はiPhone Duoのどの構成も入荷しませんでした。",
    configsHead: ["構成", "入荷"],
    sellH2: "入荷はどのくらいで売り切れましたか？",
    sellLead: (v: ReportView) =>
      v.medianSell ? `iPhone Duoの入荷は標準で${v.medianSell}並び、${v.within60}が1分以内に消えました（売り切れまで計測できた入荷${v.sellN}件）。` : "今週は売り切れまで計測できた入荷が少なく、まだ言えません。",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `前週は${v.prevMedianSell}でした。` : ""),
    daysH2: "入荷が多かった曜日は？",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}で、入荷は${v.busiestDayN}件${v.quietDay ? `。最も少なかったのは${v.quietDay}` : ""}。` : "曜日別に分けられる入荷はまだありません。"),
    daysHead: ["曜日", "入荷"],
    weekdays: ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"],
    prevH2: "前週と比べるとどうですか？",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "比較できる前週の記録がありません。" : v.change == null ? `前週の記録は${v.prevRestocks}件です。増減は、両方の週が終わり全日集計できてから表示します。` : v.changeDir === "up" ? `増えました：入荷${v.restocks}件、前週は${v.prevRestocks}件（${v.change}）。` : v.changeDir === "down" ? `減りました：入荷${v.restocks}件、前週は${v.prevRestocks}件（${v.change}）。` : `ほぼ同じです：${v.restocks}件、前週は${v.prevRestocks}件。`,
    prevNote: "週の途中では、途中までの週と丸1週間を比べることになります。増減は週が終わってから見てください。",
    readH2: "今週の結果から、買うために何をすべき？",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `入荷は${v.busiestDay}に集中しました。その日は一日中通知をオンにしておきましょう。` : "入荷に決まった予定はありません。毎日通知をオンにしておきましょう。",
      v.medianSell ? `標準の掲載時間が${v.medianSell}なので、予約は通知から数秒以内に始める必要があります。` : "掲載は短時間です。通知から数秒以内に動いてください。",
      v.topStore ? `入荷が最も多かったのは${v.topStore}。近くにあるなら通知に入れておきましょう。` : "行ける店舗を見張りましょう。近くの2店舗目を足せばチャンスは2倍です。",
    ],
    methodH2: "レポートはどう数えていますか？",
    methodPoints: [
      "**入荷：**1店舗である構成が「購入不可」から「受け取り可」に変わり、2回目のチェックで確認できたもの。初めて見えた在庫は数えません。",
      "**週：**その国の主なタイムゾーンで月曜0:00から日曜24:00まで。",
      "**掲載時間：**確認済みの入荷から、同じ店舗・同じ構成の次の確認済み売り切れまで。",
    ],
    archiveH2: "ほかの週",
    faq: (v: ReportView) => [
      { q: `今週、Appleは${v.w.in}で何台のiPhoneを入荷しましたか？`, a: `RestockWireが確認した入荷は${v.stores}店舗で${v.restocks}件です。1件は1店舗で1つの構成が戻ったことを指し、台数ではありません。` },
      { q: "Appleは入荷数を公表していますか？", a: "いいえ。この件数は、Appleの店頭受け取り在庫をRestockWireが独自に観測・確認したものです。" },
      { q: "新しいレポートはいつ公開されますか？", a: "毎週月曜に新しい週が始まります。入荷が確認されるたびにページが埋まり、日曜の夜に締まります。" },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "iPhone Duoが最速で売り切れるアップルストア" : `${w.in}で売り切れが速いアップルストア`),
    h1: (w: Where) => `${w.in}でiPhone Duoが最も速く売り切れるアップルストアは？`,
    meta: (v: RankView) => `${v.w.in}で最速は${v.fastest ?? "上位の店舗"}：iPhone Duoの入荷が中央値${v.fastestSec ?? "数秒"}で消えます。過去${v.days}日間の全ランキングと、まだチャンスがある店舗。`,
    answer: (v: RankView) =>
      v.fastest
        ? `最速は${v.fastest}です。iPhone Duoの入荷は標準で${v.fastestSec}で売り切れました（計測できた入荷${v.fastestN}件、過去${v.days}日間）。${v.slowest ? `${v.slowest}では${v.slowestSec}並びました。` : ""}`
        : `過去${v.days}日間、${v.w.in}では売り切れまで計測できた入荷が少なく、まだ店舗を順位付けできません。`,
    tiles: { fastest: "最速の店舗、掲載時間の中央値", slowest: "ランキング内で最も遅い店舗", ranked: "ランキング対象の店舗", country: "国全体の中央値" },
    fastH2: "売り切れが速い店舗",
    fastLead: (v: RankView) => `過去${v.days}日間に計測できた入荷が${v.minPairs}件以上ある店舗は${v.ranked}店舗。中央値が速い順に並べています。`,
    head: ["#", "アップルストア", "掲載時間（中央値）", "最短", "計測できた入荷", "入荷"],
    slowH2: "まだチャンスがある店舗は？",
    slowLead: (v: RankView) => (v.slowest ? `表のいちばん下：${v.slowest}では標準的な入荷が${v.slowestSec}並びました。掲載が長いほど購入手続きの時間があります。` : "まだデータが足りません。"),
    meansH2: "売り切れが速い店舗は、あなたにとって何を意味する？",
    meansPoints: (v: RankView) => [
      `中央値${v.fastestSec ?? "数秒"}では選んでいる時間はありません。構成をバッグに入れ、Apple Payを準備しておきましょう。`,
      "近くの売り切れが遅い店舗も通知に加えましょう。2店舗でチャンスは2倍です。",
      "速さは店舗周辺の需要を表し、入荷量を表すものではありません。",
    ],
    methodH2: "ランキングはどう作っていますか？",
    methodPoints: (v: RankView) => [
      `**掲載時間：**確認済みの入荷から、同じ店舗・同じ構成の次の確認済み売り切れまで。iPhone Duoのみ、過去${v.days}日間。`,
      `**対象店舗：**計測できた入荷が${v.minPairs}件以上。それより少ないと、たまたまの1件で順位が決まってしまいます。`,
      "**上限値：**時間は次のチェックまでの上限値です（チェック間隔は5秒〜15秒）。",
    ],
    faq: (v: RankView) => [
      { q: `${v.w.in}でiPhone Duoを最も買いにくいアップルストアは？`, a: v.fastest ? `${v.fastest}です。入荷が最も速く売り切れ、中央値は${v.fastestSec}でした。` : "まだ判断できるだけのデータがありません。" },
      { q: "売り切れが速いのは入荷台数が少ないから？", a: "そうとは限りません。多くの場合、その店舗を待っている人が多いということです。" },
      { q: "ランキングはどのくらいの頻度で更新されますか？", a: "数分ごとに、過去14日間のデータで更新します。" },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "アップルストア比較：iPhone入荷数" : `${w.in}のアップルストア比較：iPhone入荷`),
    indexH1: (w: Where) => `同じ街の2つのアップルストア、${w.in}で入荷が多いのはどっち？`,
    indexMeta: (w: Where) => `${w.in}の近隣アップルストアを並べて比較。過去14日間のiPhone入荷数、よく入荷する時刻、入荷が並ぶ時間、見張るべき店舗。`,
    indexLead: (n: string) => `${n}組の比較。どれも、ある店舗と同じ街でいちばん近い店舗の組み合わせです。`,
    title: (a: string, b: string) => `${a}と${b}、入荷が多いのは？`,
    h1: (a: string, b: string) => `${a}と${b}、iPhoneの入荷が多いのはどっち？`,
    meta: (v: CompareView) => `${v.city}で${v.distance}離れた${v.a.name}と${v.b.name}を比較。過去${v.days}日間のiPhone入荷数、よく入荷する時刻、掲載時間、見張るべき店舗。`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name}と${v.b.name}の入荷回数は同じでした` : `入荷が多かったのは${(v.more === "a" ? v.a : v.b).name}です`;
      const nums = `（過去${v.days}日間で${v.a.restocks}件対${v.b.restocks}件）`;
      const slow = v.slower ? `入荷が長く並んだのは${(v.slower === "a" ? v.a : v.b).name}で、購入手続きの時間に余裕があります。` : "";
      return `${lead}${nums}。${slow}`;
    },
    tableCaption: (days: string) => `並べて比較、過去${days}日間`,
    rows: { restocks: "すべての入荷", duo: "iPhone Duoの入荷", peak: "よく入荷する時刻（現地）", sell: "iPhone Duoの掲載時間（中央値）", sellN: "計測できた入荷", last: "最新の入荷" },
    none: "データ不足",
    moreH2: "iPhoneの入荷が多いのはどちらの店舗？",
    moreLead: (v: CompareView) => (v.more === "tie" ? `どちらでもありません。両店とも${v.a.restocks}件でした。` : `${(v.more === "a" ? v.a : v.b).name}です${v.ratio ? `（件数は${v.ratio}）` : ""}。`),
    hourH2: "それぞれ何時ごろに入荷しますか？",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name}は${v.a.peak}ごろ、${v.b.name}は${v.b.peak}ごろが最も多くなっています。` : "どちらかの入荷がまだ少なく、よく入荷する時刻を示せません。",
    sellH2: "入荷が長く並ぶのはどちら？",
    sellLead: (v: CompareView) =>
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name}です。${(v.slower === "a" ? v.a : v.b).medianSell}対${(v.slower === "a" ? v.b : v.a).medianSell}でした。` : "まだはっきりした差はありません。売り切れまで計測できた入荷が少ないか、2店舗の中央値の差が15%以内です。",
    pickH2: "どちらを見張るべき？",
    pickPoints: (v: CompareView) => [
      `両方です。${v.distance}しか離れておらず、1つのプランで複数の店舗をカバーできます。`,
      v.more !== "tie" ? `片方しか行けないなら、入荷が多かったのは${(v.more === "a" ? v.a : v.b).name}です。` : "片方しか行けないなら近いほうを。入荷回数は互角です。",
      v.slower ? `1回の入荷で数秒多く余裕があるのは${(v.slower === "a" ? v.a : v.b).name}です。` : "掲載時間ではまだ優劣がついていません。",
    ],
    methodH2: "この数字はどこから来ていますか？",
    methodPoints: (v: CompareView) => [
      `過去${v.days}日間に両店でRestockWireが確認した入荷。2回目のチェックで確認できた時点で1件と数えます。`,
      "よく入荷する時刻は、3日以上にわたる5回以上の入荷があるときだけ示します。",
      "掲載時間は次のチェックまでの上限値で、iPhone Duoのみです。",
    ],
    storePages: "店舗ページ",
    otherPairs: "ほかの比較",
    faq: (v: CompareView) => [
      { q: `iPhone Duoを受け取るなら${v.a.name}と${v.b.name}のどちらがいい？`, a: v.more === "tie" ? "過去14日間の入荷回数は同じでした。近いほうを選ぶか、両方を見張りましょう。" : `過去14日間は${(v.more === "a" ? v.a : v.b).name}のほうが入荷が多くありました。` },
      { q: "両方の店舗を見張れますか？", a: "はい、通知を2件設定すれば見張れます。通知1件は1店舗×1つの構成なので、2店舗ならプランの通知枠を2件使います。" },
      { q: "2つの店舗は同時に入荷しますか？", a: "たいていは別々です。店舗ごとに納品があるので、上のよく入荷する時刻を比べてください。" },
    ],
  },

  guides: {
    watch: {
      title: "Apple WatchでiPhone入荷通知を受け取る方法",
      h1: "Apple WatchでiPhoneの入荷通知を受け取るには？",
      meta: "RestockWireの入荷通知を手首で受け取る方法。ホーム画面に追加、通知をオン、Watch Appの通知の反映、そして通知がiPhone側に届く条件まで。",
      answer: (live: string | null) =>
        `RestockWireをiPhoneのホーム画面に追加して通知をオンにし、Watch Appで通知の反映をオンのままにします。これでiPhoneがロック中なら通知はApple Watchに届きます。${live ? `入荷は中央値${live}で消えるので、手首のタップでiPhoneを探す数秒を節約できます。` : ""}`,
      sections: [
        {
          h2: "最初に何が必要ですか？",
          lead: "iOS 16.4以降のiPhoneで、RestockWireをホーム画面に追加し、通知を許可しておくことです。",
          points: [
            "Safariでrestockwire.comを開き、「共有」をタップして「ホーム画面に追加」を選びます。",
            "ホーム画面からRestockWireを開いてサインインし、「通知をオンにする」をタップします。",
            "表示される確認で「許可」を選びます。以降、Webアプリの通知はほかのアプリと同じようにロック画面と通知センターに表示されます。",
          ],
        },
        {
          h2: "通知はどうやってウォッチに届きますか？",
          lead: "通知の反映によってです。Appleは各通知を1台にだけ届け、iPhoneがロック中かスリープ中ならウォッチに送ります。",
          points: [
            "iPhoneのロックを解除して使っている間：通知はウォッチではなくiPhoneに表示されます。",
            "iPhoneがロック中かスリープ中で、ウォッチを手首に着けてロック解除している：通知はウォッチに届きます。",
            "ウォッチがロック中か「おやすみモード」：通知はiPhoneに届きます。",
          ],
        },
        {
          h2: "どのWatchの設定を確認すべき？",
          lead: "2つです。RestockWireの通知の反映と、手首を下げているときに通知を表示するかどうか。",
          points: [
            "iPhoneで「Watch」Appを開き、「通知」をタップして、iPhoneから反映する通知の一覧（Mirror iPhone Alerts From）を確認します。RestockWireがあればオンのままに。",
            "通知は手首を上げると表示されます。上げずに見たいなら、手首を下げているときに通知を表示する設定（Show Notifications on Wrist Down）をオンにします。",
            "「低電力モード」では常時表示がオフになるため、通知を読むには手首を上げる必要があることがあります。",
          ],
        },
        {
          h2: "手首に通知が来たら何をする？",
          lead: "数秒以内にiPhoneで動きます。予約そのものはapple.comで行います。",
          points: [
            "ウォッチで店舗と構成を確認し、iPhoneのロックを解除します。",
            "iPhoneの通知をタップして、店舗ページとAppleへのリンクを開きます。",
            "apple.comでApple Payを設定しておけば、購入手続きは数回のタップで済みます。",
          ],
        },
      ],
      faq: [
        { q: "RestockWireの通知はApple Watchで使えますか？", a: "はい。ホーム画面のWebアプリの通知は、ほかのアプリと同じようにペアリングしたApple Watchに表示されます。" },
        { q: "通知がウォッチではなくiPhoneに出たのはなぜ？", a: "iPhoneのロックが解除されていたか、ウォッチがロック中か「おやすみモード」だったためです。その場合AppleはiPhoneに届けます。" },
        { q: "ウォッチ用のアプリは別に必要ですか？", a: "いいえ。ウォッチはiPhoneが受け取った通知を表示するだけで、ウォッチに入れるものはありません。" },
      ],
      sources: [
        { label: "WebKit：iOSとiPadOSのWebアプリ向けWebプッシュ", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Appleサポート：Apple Watchの通知", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watchユーザガイド：通知を管理する", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "集中モード中もiPhone入荷通知を逃さない設定",
      h1: "集中モードや時刻指定要約でも入荷通知を受け取るには？",
      meta: "RestockWireの入荷通知を集中モード中も通し、時刻指定要約に回さず、ロック画面にサウンド付きで表示する設定を手順で解説。iOS 16.4以降。",
      answer: (live: string | null) =>
        `各集中モードの許可するAppにRestockWireを追加し、通知の配信を「即時配信」にします。これで集中モード中でも入荷通知が鳴ります。${live ? `入荷は中央値${live}で消えるので、要約まで待たされた通知は手遅れです。` : ""}`,
      sections: [
        {
          h2: "集中モードでRestockWireを許可するには？",
          lead: "「設定」>「集中モード」でモードを選び、「App」をタップして「通知を許可」にRestockWireを追加します。",
          points: [
            "集中モードでは、ホーム画面に追加したWebアプリごとに通知を許可したり消音したりできます。",
            "使っている集中モードすべてで繰り返します：「睡眠」「仕事」「パーソナル」と自分で作ったモード。",
            "同じ名前のWebアプリの集中モード設定は、ほかのAppleデバイスにも同期されます。",
          ],
        },
        {
          h2: "通知を時刻指定要約に回さないには？",
          lead: "要約の一覧でRestockWireのチェックを外したままにするか、配信を「即時配信」にします。",
          points: [
            "「設定」>「通知」>「時刻指定要約」：A〜Zの一覧で、要約に回すAppが決まります。",
            "または「設定」>「通知」>「RestockWire」>「通知の配信」>「即時配信」。",
            "朝8時の要約に回された入荷は、その頃にはとっくに売り切れています。",
          ],
        },
        {
          h2: "大事な通知設定はどれ？",
          lead: "「通知を許可」をオン、「ロック画面」と「バナー」をオン、「サウンド」をオンです。",
          points: [
            "「バナースタイル」を「持続的」にすると、操作するまで通知が画面に残ります。",
            "「プレビューを表示」が「ロックされていないときのみ」だと、ロック画面で店舗と構成が隠れます。ひと目で読みたいなら「常に」を選びます。",
            "AppleはWebアプリの通知に「即時通知」レベルがあるとは説明していません。集中モードを通すのに頼れるのは許可リストです。",
          ],
        },
        {
          h2: "どうやってテストする？",
          lead: "集中モードをオンにした状態で、RestockWireのアカウントからテスト通知を送ります。",
          points: [
            "ホーム画面からRestockWireを開き、アカウントで「テスト通知を送る」をタップします。",
            "いちばんよく使う集中モードをオンにして、もう一度送ります。",
            "音が鳴らない、または届かないときは、集中モードの許可リストと通知の配信設定を見直してください。",
          ],
        },
      ],
      faq: [
        { q: "集中モードはRestockWireの通知を止めますか？", a: "止めます。その集中モードの許可リストにRestockWireが入っていない場合です。集中モードごとに一度追加してください。" },
        { q: "RestockWireは「即時通知」を送れますか？", a: "AppleはWebアプリのプッシュにそのレベルがあるとは説明していません。RestockWireは集中モードの許可リストで通します。" },
        { q: "通知が朝にまとめて届くのはなぜ？", a: "時刻指定要約が通知をためているからです。RestockWireを「即時配信」にしてください。" },
      ],
      sources: [
        { label: "iPhoneユーザガイド：集中モードで通知を許可または消音する", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhoneユーザガイド：通知設定を変更する", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit：iOSとiPadOSのWebアプリ向けWebプッシュ", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "AndroidとWear OSでiPhone入荷通知を受け取る",
      h1: "AndroidスマホやWear OSウォッチでiPhoneの入荷通知は受け取れる？",
      meta: "AndroidからiPhoneの入荷を見張るなら、RestockWireの通知はChromeでインストール不要で使え、ペアリングしたWear OSやGalaxyのウォッチにも届きます。",
      answer: (live: string | null) =>
        `受け取れます。AndroidのChromeでRestockWireを開いてサインインし、Chromeの確認で通知を許可すれば、ほかのアプリと同じように通知が届き、ペアリングしたウォッチにも転送できます。${live ? `掲載は中央値${live}なので、通知音は大きめにしておきましょう。` : ""}`,
      sections: [
        {
          h2: "Chromeで通知をオンにするには？",
          lead: "Chromeでrestockwire.comにサインインし、通知の送信を求められたら「許可」をタップします。",
          points: [
            "インストールは不要です。サイトが通知を送りたいとき、Chromeが許可を求めます。",
            "以前「ブロック」をタップした場合は、アドレスバーからサイトの設定を開いて通知を許可します。",
            "Androidではホーム画面への追加は任意です。追加するとサイト専用のアイコンができます。",
          ],
        },
        {
          h2: "Wear OSやGalaxyのウォッチに通知は届く？",
          lead: "たいていは届きます。スマホの通知は、ペアリングしたWear OSウォッチに標準で転送されます。",
          points: [
            "RestockWireの通知はChromeが表示するので、ウォッチでは「Chrome」の通知として出ます。",
            "Galaxy Watchでは、Galaxy Wearableアプリでウォッチの設定 > 通知 > アプリの通知（Watch settings > Notifications > App notifications）を開き、Chromeをオンのままにします。",
            "通知が止まったら、省電力設定がChromeのバックグラウンド動作を制限していないか確認してください。",
          ],
        },
        {
          h2: "パソコンでは？",
          lead: "パソコンのChrome、Edge、Firefoxでも、ブラウザが起動している間は同じ通知を表示できます。",
          points: [
            "いちばんよく開いているブラウザでサインインし、通知を許可します。",
            "通知をオンにしたデバイスにはすべての通知が届きます。",
            "通知がオンのデバイスが1台もないときは、RestockWireが通知をメールで送ります。",
          ],
        },
      ],
      faq: [
        { q: "RestockWireを使うのにiPhoneは必要？", a: "いいえ。Web通知に対応したブラウザがあれば、どのスマホやパソコンでも通知を受け取れます。" },
        { q: "ウォッチで通知が「Chrome」として表示されるのはなぜ？", a: "AndroidではWebサイトの通知をChromeが届けるため、ウォッチでもChromeの通知として表示されます。" },
        { q: "2台のスマホで通知を受け取れますか？", a: "はい。それぞれでサインインして通知を許可すれば、すべてのデバイスにすべての通知が届きます。" },
      ],
      sources: [
        { label: "Google Chrome ヘルプ：通知を使用する", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers：Wear OSの通知", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung：Galaxy Watchの通知を管理する", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "ほかのスマートフォン通知ガイド",
  },
};
