/**
 * 日本語: modules — 入荷・店舗・在庫のモジュール（src/components/{restocks,stores,stock}）。
 * `label` は場所を表す名詞句（「東京」「Apple 銀座」「この店舗」「日本」）で届く。助詞はこちらで付ける。
 * 数値は生の値で届くので num() で整形する。所要時間・時刻・日付・割合は整形済み。チェック間隔は15秒と5秒のみ。
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 「日」→「日曜」、それ以外（「明日」など）はそのまま。 */
const dayWord = (day: string) => (day.length === 1 ? `${day}曜` : day);
const CHECK = "全店舗15秒ごと・通知設定店舗は5秒ごと";

export const modules: Dict["modules"] = {
  daily: {
    empty: (label: string, days: number) => `${label}のグラフはまだ空です。過去${N(days)}日間、入荷も完売もありません。最初の1件で最初のバーが立ちます。`,
    summary: (restocks: number, soldouts: number, label: string, days: number, activeDays: number) =>
      `過去${N(days)}日間の${label}：入荷${N(restocks)}回・完売${N(soldouts)}回（${N(activeDays)}日に分散）。`,
    busiest: (day: string, restocks: number) => <>最多は<b className="text-ink">{day}</b>の{N(restocks)}回です。</>,
    barAria: (day: string, restocks: number, soldouts: number) => `${day}：入荷${N(restocks)}回、完売${N(soldouts)}回`,
    barTitle: (day: string, restocks: number, soldouts: number) => `${day} · 入荷${N(restocks)}回 · 完売${N(soldouts)}回`,
    legendRestocks: "入荷",
    legendSoldouts: "完売",
  },

  last24: {
    title: (label: string) => `${label}のiPhone Duo再入荷：直近24時間`,
    asOf: (when: string) => `${when}時点`,
    localTime: (when: string) => `現地時間 ${when}`,
    anAppleStore: "アップルストア",
    unknown: "24時間の件数はいま取得できません。このページのライブ在庫と入荷履歴には影響ありません。",
    none: (label: string, asOf: string) => <><b className="text-ink">直近24時間、{label}でのiPhone Duo再入荷はゼロ</b>です（{asOf}時点）。</>,
    some: (o: { restocks: number; one: boolean; label: string; withStores: number; allStores: number; config: string; store: ReactNode | null; when: string }) => (
      <>直近24時間で<b className="text-ink">{o.one ? `${o.label}にiPhone Duoが${N(o.restocks)}回再入荷` : `${o.label}のアップルストア${N(o.allStores)}店舗中${N(o.withStores)}店舗にiPhone Duoが計${N(o.restocks)}回再入荷`}</b>。最新は<b className="text-ink">{o.config}</b>{o.store != null && <>（{o.store}）</>}、現地時間{o.when}です。</>
    ),
    tileRestocks: "確認済みの再入荷 · 24時間",
    tileConfigsBack: "再び並んだ構成",
    tileStores: (configs: number, allConfigs: number) => `再入荷のあった店舗${configs ? ` · ${N(allConfigs)}構成中${N(configs)}構成` : ""}`,
    tileLatest: (config: string, store: string | null) => <>最新 · {config}{store != null && <> · {store}</>}</>,
    tileBefore: (config: string, store: string | null, day: string) => <>その1つ前 · {config}{store != null && <> · {store}</>} · {day}</>,
    tileNoEarlier: "それ以前の記録なし",
    caption: (label: string, asOf: string) => `${label}のiPhone Duo全構成：直近24時間の確認済み再入荷（${asOf}時点）`,
    thConfig: "構成",
    thRestocks: "再入荷",
    thStores: "店舗",
    thLast: "最新の再入荷（現地時間）",
    thNow: "いま在庫",
    ofStores: (n: number, total: number) => `${N(total)}店舗中${N(n)}`,
    noneIn24: "24時間なし",
    yes: "あり",
    no: "なし",
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
    byHour: (zone: string) => `時間帯別 · ${zone}`,
    byWeekday: "曜日別",
    barReported: (n: number) => `（他トラッカーの報告 +${N(n)}）`,
    barReportedTitle: (bar: string, n: number) => `${bar}：他トラッカーの報告 ${N(n)}件`,
    legendOurs: "RestockWireが確認",
  },

  feed: {
    empty: "履歴はまだ空です。",
    available: "在庫あり",
    soldOut: "完売",
    soldOutAt: (time: ReactNode) => <>{time}に消えた</>,
    since: (time: ReactNode) => <>{time}から在庫あり</>,
    restockedAt: (time: ReactNode) => <>{time}に再入荷</>,
    mapAria: (store: string) => `${store}を地図で見る`,
    map: "地図",
    buyAria: (model: string, config: string) => `apple.comで${model} ${config}を注文`,
    buy: "apple.comで注文",
  },

  byConfig: {
    empty: (label: string, days: number) => `ランキングはまだありません。過去${N(days)}日間、${label}で再入荷はありません。`,
    intro: (label: string, days: number) => `過去${N(days)}日間に${label}で再入荷した構成を、回数の多い順に並べています。`,
    times: (n: number) => `${N(n)}回`,
    alert: "通知を設定",
  },

  sellout: {
    typical: (label: string, band: string) => `${label}のiPhone Duo再入荷は、ふつう約${band}で売り切れました。`,
    half: (label: string, duration: string) => `${duration}：${label}の再入荷の半数が売り切れるまでの時間です。`,
    none: (label: string, days: number) => `過去${N(days)}日間、${label}で再入荷して売り切れたものはありません。`,
    whatDuo: "iPhone Duo",
    whatAll: "全iPhone",
    tileHalf: (what: string) => <>半数が消えるまで · {what}</>,
    tileWithin30: "30秒以内に完売",
    tileWithin60: "1分以内に完売",
    tileFastest: (n: number, days: number) => <>最速 · 完売した再入荷{N(n)}回・{N(days)}日間</>,
    caption: (days: number) => `iPhone別・過去${N(days)}日間`,
    thIphone: "iPhone",
    thSoldOut: "完売",
    thHalf: "半数が消えるまで",
    thWithin30: "≤ 30秒",
    thWithin60: "≤ 1分",
    thFastest: "最速",
    each: "再入荷ごとに1行",
    barNote: (full: string) => `バーの長さ＝在庫があった秒数 · ${full}で全幅`,
    stillListed: (duration: string) => `在庫継続中 · ${duration}`,
    approx: (range: string) => `≈ ${range}`,
    measuredTitle: "時間の測り方",
    measured: (estimated: boolean) =>
      `「45〜60秒で完売」の行は、最初に見つけてから45秒後のチェックではまだ在庫があり、60秒後のチェックでは消えていたという意味です。範囲の幅はチェックの間隔そのもの：通知を設定した店舗は5秒、それ以外は15秒です${estimated ? "。≈ の行は最後のチェック時刻を保存し始める前のもので、代わりに15秒の巡回で範囲を区切っています" : ""}。チェック1回分より短い在庫は2回のチェックの間に現れて消えることがあるため、30秒以内に消えた本当の割合は表より高くなります。`,
  },

  configTable: {
    title: "この店舗の全構成",
    titleAt: (store: string) => `${store}の全構成`,
    lookupOff: (hasRows: boolean) => `現在、Appleはこの店舗の店頭受け取り在庫照会を停止しています${hasRows ? "（直近の回答を下に表示）" : ""}`,
    tracked: (n: number) => `${N(n)}構成をチェック中`,
    firstSweep: "初回チェック中 · 1分以内に状況が表示されます",
    inStock: (n: number, total: number) => `${N(total)}構成中${N(n)}構成に在庫`,
    available: "受け取り可能",
    unavailable: "受け取り不可",
    noLookup: "在庫照会なし",
    notChecked: "未チェック",
    since: (ago: ReactNode) => <>{ago}から在庫あり</>,
    lastAvailable: (ago: ReactNode) => <>最後の在庫 {ago}</>,
    neverHere: "この店舗ではまだ在庫が出ていません",
    buy: "注文",
    alertAria: (model: string, config: string, store: string) => `${store}に${model} ${config}の在庫が出たら通知`,
    alert: "通知を設定 →",
  },

  matrix: {
    store: "店舗",
    checked: "チェック",
    cellTitle: (model: string, n: number, total: number) => `${model}：${N(total)}構成中${N(n)}構成に在庫`,
  },

  nearby: {
    duo: (short: string, n: number) => `${short} · ${N(n)}`,
    noDuo: (short: string) => `${short}なし`,
  },

  stockByModel: {
    availableNow: (n: number, total: number) => `いま${N(total)}構成中${N(n)}構成に在庫`,
    noneNow: (total: number) => `現在${N(total)}構成とも在庫なし`,
    lookupOff: "現在、Appleはこの店舗の受け取り在庫照会を停止しています",
    notChecked: "未チェック",
    more: (n: number) => `+${N(n)}`,
    checked: (ago: ReactNode) => <>{ago}に取得</>,
    alert: "通知を設定 →",
  },

  storeBlock: {
    checked: (ago: ReactNode) => <>{ago}に取得 · {CHECK}</>,
    map: "地図で見る",
    alert: "この店舗を見張る",
    alsoIn: (region: string) => `${region}のほかの店舗`,
    acrossLine: "県境の向こうの近い店舗",
    elsewhere: "少し離れた近い店舗",
  },

  hours: {
    title: "営業時間",
    local: (zone: string) => `現地時間 · ${zone}`,
    today: (hours: string, week: string) => ` · 本日 ${hours} · ${week}`,
    directions: "経路",
    applePage: "apple.comのこの店舗",
    liveMap: "在庫マップ",
    storePage: "店舗ページ",
    closed: "休業",
    everyDay: (hours: string) => `毎日 ${hours}`,
    openNow: (closes: string) => `営業中 · ${closes}閉店`,
    opensAt: (opens: string) => `${opens}開店`,
    closedToday: (next: string | null) => (next ? `本日休業 · ${next}開店` : "本日休業"),
    closedNow: (next: string | null) => (next ? `営業時間外 · ${next}開店` : "営業時間外"),
    nextOpen: (day: string | null, time: string) => `${day == null ? "明日" : dayWord(day)} ${time}`,
  },

  liveStats: {
    inStock: "いま在庫",
    storesWith: "在庫のある店舗",
    lastCheck: "最新チェック",
    none: "—",
  },

  board: {
    summary: (n: number, stores: number, short: string) => `いま${N(stores)}店舗中${N(n)}店舗に${short}の在庫`,
    lastCheck: (ago: ReactNode) => <>最新チェック {ago}</>,
    firstSweep: "初回チェック中です。",
    noneListed: (model: string, storage: string | null, color: string | null) => `現在、${model}${storage ? ` ${storage}` : ""}${color ? `（${color}）` : ""}の在庫がある店舗はありません。`,
    more: (n: number) => `+${N(n)}`,
    seen: (ago: ReactNode) => <>{ago}に在庫</>,
    loading: "在庫を読み込み中",
  },
};
