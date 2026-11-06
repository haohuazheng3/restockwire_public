/**
 * 日本語: modules — 入荷・店舗・在庫のモジュール（src/components/{restocks,stores,stock}）。
 * `label` は場所を表す名詞句（「東京」「Apple 銀座」「この店舗」「日本」）で届く。助詞はこちらで付ける。
 * 数値は生の値で届くので num() で整形する。所要時間・時刻・日付・割合は整形済み。チェック間隔は15秒と5秒のみ。
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 「日」→「日曜日」。それ以外（「あす」など）は手を加えない。 */
const dayWord = (day: string) => (day.length === 1 ? `${day}曜日` : day);
const CHECK = "全店舗15秒ごと・通知設定店舗は5秒ごと";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}のグラフはまだ空です。過去${N(days)}日間、入荷も完売もありません。最初の1件で最初のバーが立ちます。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `過去${N(days)}日間の${label}：入荷${N(restocks)}回・完売${N(soldouts)}回（${N(activeDays)}日に分散）。`,
    busiest: (day: string, restocks: number) => <>最多は<b className="text-ink">{day}</b>の{N(restocks)}回です。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}の記録：入荷${N(restocks)}回／完売${N(soldouts)}回`,
    barTitle: (day: string, ins: number, outs: number) => `${day}｜入荷${N(ins)}・完売${N(outs)}`,
    legendRestocks: "入荷した",
    legendSoldouts: "売り切れた",
  },

  last24: {
    title: (label: string) => `${label}のiPhone Duo再入荷：直近24時間`,
    asOf: (when: string) => `${when}現在`,
    localTime: (when: string) => `${when}（現地）`,
    anAppleStore: "Apple Storeのいずれか",
    unknown: "24時間の件数はいま取得できません。このページのライブ在庫と入荷履歴には影響ありません。",
    none: (label: string, asOf: string) => <><b className="text-ink">直近24時間、{label}でのiPhone Duo再入荷はゼロ</b>です（{asOf}時点）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>直近24時間で<b className="text-ink">{o.one ? `${o.label}にiPhone Duoが${N(o.restocks)}回再入荷` : `${o.label}のアップルストア${N(o.allStores)}店舗中${N(o.withStores)}店舗にiPhone Duoが計${N(o.restocks)}回再入荷`}</b>。最新は<b className="text-ink">{o.config}</b>{o.store != null && <>（{o.store}）</>}、現地時間{o.when}です。</>
    ),
    tileRestocks: "確認済みの再入荷 · 24時間",
    tileConfigsBack: "再び並んだ構成",
    tileStores: (configs: number, allConfigs: number) => `再入荷のあった店舗${configs ? ` · ${N(allConfigs)}構成中${N(configs)}構成` : ""}`,
    tileLatest: (config: string, store: string | null) => <>直近 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>その1つ前 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "それ以前の記録なし",
    caption: (label: string, asOf: string) => `${label}のiPhone Duo全構成：直近24時間の確認済み再入荷（${asOf}時点）`,
    thConfig: "構成（容量・色）",
    thRestocks: "再入荷",
    thStores: "入荷した店舗",
    thLast: "最新の再入荷（現地時間）",
    thNow: "いま在庫",
    ofStores: (n: number, total: number) => `${N(n)}／${N(total)}店舗`,
    noneIn24: "24時間ゼロ",
    yes: "受け取り可",
    no: "在庫なし",
    countedTitle: "ここで数える「再入荷」とは",
    counted: "RestockWire自身がapple.comの店頭受け取り在庫を読んだ結果です。全店舗を15秒ごと、通知を設定した店舗は5秒ごとにチェック。2回のチェックが一致して初めて記録し、ある店舗を初めて読んだときの在庫は数えません。他の入荷トラッカーの情報は一切混ぜていません。",
    alert: (label: string | null) => `${label != null ? `${label}の` : ""}通知を設定：次の再入荷は数秒で届きます`,
  },

  clock: {
    none: (label: string, days: number) => `過去${N(days)}日間、${label}の再入荷はまだありません。`,
    thin: (total: number, label: string, days: number, dates: number | null) =>
      `過去${N(days)}日間の${label}の再入荷は${N(total)}回${dates != null ? `（${N(dates)}日分）` : ""}。いつもの時間帯を示すにはまだ足りません。`,
    pattern: (total: number, label: string, days: number, hour: string, day: string | null) => (
      <>過去{N(days)}日間、{label}で再入荷{N(total)}回。多いのは現地時間の<b className="text-ink">{hour}</b>台{day ? <>、曜日では<b className="text-ink">{day}</b>が最多</> : null}です。</>
    ),
    byHour: (zone: string) => `何時に多いか · ${zone}`,
    byWeekday: "何曜日に多いか",
    barReported: (n: number) => `（他トラッカーの報告 +${N(n)}）`,
    barReportedTitle: (bar: string, n: number) => `${bar}：他トラッカーの報告 ${N(n)}件`,
    legendOurs: "RestockWireが確認",
  },

  feed: {
    empty: "履歴はまだ空です。",
    available: "受け取り可",
    soldOut: "完売",
    soldOutAt: (time: ReactNode) => <>{time}に消えた</>,
    since: (time: ReactNode) => <>{time}から在庫あり</>,
    restockedAt: (time: ReactNode) => <>{time}に再入荷</>,
    mapAria: (store: string) => `${store}を地図で見る`,
    map: "地図へ",
    buyAria: (model: string, config: string) => `apple.comで${model} ${config}を注文`,
    buy: "apple.comで注文",
  },

  byConfig: {
    empty: (label: string, days: number) => `ランキングはまだありません。過去${N(days)}日間、${label}で再入荷はありません。`,
    intro: (label: string, days: number) => `過去${N(days)}日間に${label}で再入荷した構成を、回数の多い順に並べています。`,
    times: (n: number) => `計${N(n)}回`,
    alert: "通知を設定",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}のiPhone Duo再入荷は、ふつう約${band}で売り切れました。`,
    half: (label: string, duration: string) => `${duration}：${label}の再入荷の半数が売り切れるまでの時間です。`,
    none: (label: string, days: number) => `過去${N(days)}日間、${label}で再入荷して売り切れたものはありません。`,
    whatDuo: "iPhone Duo",
    whatAll: "iPhone全機種",
    tileHalf: (what: string) => <>半数が消えるまで · {what}</>,
    tileWithin30: "30秒もたずに完売",
    tileWithin60: "1分もたずに完売",
    tileFastest: (n: number, days: number) => <>最速 · 完売した再入荷{N(n)}回・{N(days)}日間</>,
    caption: (days: number) => `iPhone別・過去${N(days)}日間`,
    thIphone: "iPhone",
    thSoldOut: "完売回数",
    thHalf: "半数が消えるまで",
    thWithin30: "30秒以内",
    thWithin60: "1分以内",
    thFastest: "最短",
    each: "再入荷ごとに1行",
    barNote: (full: string) => `バーの長さ＝在庫があった秒数 · ${full}で全幅`,
    stillListed: (duration: string) => `在庫継続中 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "時間の測り方",
    measured: (estimated: boolean) =>
      `「45〜60秒で完売」の行は、最初に見つけてから45秒後のチェックではまだ在庫があり、60秒後のチェックでは消えていたという意味です。範囲の幅はチェックの間隔そのもの：通知を設定した店舗は5秒、それ以外は15秒です${estimated ? "。≈ の行は最後のチェック時刻を保存し始める前のもので、代わりに15秒の巡回で範囲を区切っています" : ""}。チェック1回分より短い在庫は2回のチェックの間に現れて消えることがあるため、30秒以内に消えた本当の割合は表より高くなります。`,
  },

  configTable: {
    title: "この店舗で扱う構成すべて",
    titleAt: (store: string) => `${store}で扱う構成すべて`,
    lookupOff: (hasRows: boolean) => `現在、Appleはこの店舗の店頭受け取り在庫照会を停止しています${hasRows ? "（直近の回答を下に表示）" : ""}`,
    tracked: (n: number) => `監視中の構成：${N(n)}`,
    firstSweep: "初回チェック中 · 1分以内に状況が表示されます",
    inStock: (n: number, total: number) => `受け取り可は${N(n)}／${N(total)}構成`,
    available: "受け取り可",
    unavailable: "在庫なし",
    noLookup: "照会できません",
    notChecked: "確認前",
    since: (ago: ReactNode) => <>{ago}から在庫あり</>,
    lastAvailable: (ago: ReactNode) => <>最後の在庫 {ago}</>,
    neverHere: "この店舗ではまだ在庫が出ていません",
    buy: "注文",
    alertAria: (model: string, config: string, store: string) => `${store}に${model} ${config}の在庫が出たら通知`,
    alert: "通知を設定 →",
  },

  matrix: {
    store: "店舗名",
    checked: "確認時刻",
    cellTitle: (model: string, n: number, total: number) => `${model}：${N(total)}構成中${N(n)}構成に在庫`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `${short}ゼロ`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `いま${N(total)}構成中${N(n)}構成に在庫`,
    noneNow: (total: number) => `いまは${N(total)}構成すべて在庫なし`,
    lookupOff: "現在、Appleはこの店舗の受け取り在庫照会を停止しています",
    notChecked: "確認前",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>{ago}に取得</>,
    alert: "通知を設定 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago}に取得 · {CHECK}</>,
    map: "地図で見る",
    alert: "この店舗を見張る",
    alsoIn: (region: string) => `同じ${region}内の店舗`,
    acrossLine: "県境の向こうの近い店舗",
    elsewhere: "少し離れた近い店舗",
  },

  hours: {
    title: "営業時間と所在地",
    local: (zone: string) => `時刻は現地（${zone}）`,
    today: (hrs: string, wk: string) => ` · きょう ${hrs} · ${wk}`,
    directions: "道順",
    applePage: "apple.comのこの店舗",
    liveMap: "ライブ地図",
    storePage: "この店舗のページ",
    closed: "定休",
    everyDay: (hours: string) => `全曜日 ${hours}`,
    openNow: (closes: string) => `営業中（${closes}まで）`,
    opensAt: (opens: string) => `${opens}から営業`,
    closedToday: (next: string | null) => (next ? `きょうは定休 · ${next}から営業` : "きょうは定休"),
    closedNow: (next: string | null) => (next ? `ただいま閉店中 · ${next}から営業` : "ただいま閉店中"),
    nextOpen: (day: string | null, time: string) => `${day == null ? "あす" : dayWord(day)} ${time}`,
  },

  liveStats: {
    inStock: "いま在庫",
    storesWith: "受け取り可の店舗",
    lastCheck: "最新チェック",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `いま${N(stores)}店舗中${N(n)}店舗に${short}の在庫`,
    lastCheck: (ago: ReactNode) => <>最新チェック {ago}</>,
    firstSweep: "最初の確認を実行中です。",
    noneListed: (model: string, storage: string | null, color: string | null) => `${model}${storage ? ` ${storage}` : ""}${color ? `（${color}）` : ""}は、いまどの店舗にも在庫がありません。`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>{ago}に在庫</>,
    loading: "在庫を取得しています",
  },
};
