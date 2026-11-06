/**
 * 日本語: wire — 再入荷記録の4モジュール（src/components/restocks/{RestockHeatmap,RestockStreak,SellOutRanking,RestockLeaderboard}.tsx）。
 * `label` は場所を表す名詞句（「東京」「Apple 銀座」「この店舗」「日本」）で届く。助詞はこちらで付ける。
 * `what` は機種名・構成名で訳さない。件数は生の値（num() で整形）、時間・時刻・曜日・割合は整形済み。
 * チェック間隔は15秒（全店舗）と5秒（通知設定店舗）のみ。しきい値（5回・3日、14日、3回）は事実なので変えない。
 */
import type { ReactNode } from "react";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 地域の呼び方（英語の名詞 → 日本語）。 */
const NOUN: Record<string, string> = { state: "州", province: "州", area: "エリア", department: "県", prefecture: "都道府県", emirate: "首長国", canton: "州", region: "地域", county: "県", city: "都市" };
const nounJa = (noun: string) => NOUN[noun] ?? noun;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `${label}で${what}が再入荷するのはいつ？曜日×時間帯`,
    unknown: "曜日×時間帯のグラフをいま読み込めませんでした。このページのライブ在庫と再入荷の記録には影響ありません。",
    none: (label: string, days: number) => `過去${N(days)}日間、${label}で確認された再入荷はまだありません。最初の1件からグラフが埋まっていきます。`,
    thin: (n: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `過去${N(days)}日間の${label}の再入荷は${N(activeDays)}日に${N(n)}回。傾向を言うにはまだ足りません（RestockWireは${N(minDays)}日にわたる${N(min)}回の再入荷を待ちます）。`,
    pattern: (label: string, weekday: string, window: string, share: string, n: number, days: number) => (
      <>{label}の再入荷は<b className="text-ink">{weekday}</b>、現地時間<b className="text-ink">{window}</b>が最多です（過去{N(days)}日間の{N(n)}回中{share}）。</>
    ),
    patternHours: (label: string, window: string, share: string, n: number, spanDays: number) => (
      <>{label}の再入荷は現地時間<b className="text-ink">{window}</b>が最多です（{N(n)}回中{share}）。データはまだ{N(spanDays)}日分で、曜日を言うには足りません。</>
    ),
    caption: (what: string, label: string, days: number) => `${label}で確認された${what}の再入荷：現地の曜日×時間帯、過去${N(days)}日間`,
    cell: (weekday: string, hours: string, n: number) => `${weekday} ${hours}：再入荷${N(n)}回`,
    busiest: (weekday: string, hours: string, n: number) => `最多 · ${weekday} ${hours} · 再入荷${N(n)}回`,
    legendFewer: "少",
    legendMore: "多",
    localTime: "各店舗の現地時間",
    measuredTitle: "測り方",
    measured: (min: number, minDays: number, span: number) =>
      `各マスは、期間中にその曜日・その現地時間帯に起きたRestockWireの確認済み再入荷（2回のチェックが一致したもの。店舗を初めて見たときの在庫は数えません）を、店舗ごとのタイムゾーンで数えたものです。傾向は${N(minDays)}日にわたる${N(min)}回の再入荷から示し、曜日はデータが${N(span)}日に達してから。1回にまとめて来た10件の再入荷は1つの出来事で、習慣ではありません。`,
  },

  streak: {
    title: (what: string, label: string) => `${label}の${what}：再入荷の連続と空白`,
    unknown: "連続・空白の数字をいま読み込めませんでした。このページのライブ在庫と再入荷の記録には影響ありません。",
    none: (label: string, days: number) => `過去${N(days)}日間、${label}で確認された再入荷はありません。期間まるごとが静かなままです。`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>{o.label}で最後に確認された再入荷：<b className="text-ink">{o.since}</b>{o.longest && <>。{N(o.days)}日間で最も長い空白は<b className="text-ink">{o.longest}</b></>}{o.trend && <>。今週は<b className="text-ink">{N(o.thisWeek)}回</b>、先週は{N(o.lastWeek)}回（{o.trend}）</>}。</>
    ),
    today: "今日",
    daysAgo: (n: number) => `${N(n)}日前`,
    hoursAgo: (n: number) => `${N(n)}時間前`,
    tileSince: "最後の確認済み再入荷から",
    tileSinceNone: (days: number) => `${N(days)}日間再入荷なし`,
    tileLongest: (days: number) => `再入荷の間の最長の空白 · ${N(days)}日間`,
    tileWeek: (prev: number) => `直近7日間の再入荷 · その前の週は${N(prev)}回`,
    tileMedian: "再入荷の波の間隔（通常）",
    up: "↑ 先週より増加",
    down: "↓ 先週より減少",
    flat: "→ 先週と同じ",
    none2: "–",
    measuredTitle: "測り方",
    measured: "「再入荷の波」は、ここで数える店舗で同じ30分以内に起きた確認済み再入荷をまとめたものです。8つの構成が一緒に来ても波は1つで、8つではありません。間隔は波と波の間で測ります。「今週」は直近7日間、「先週」はその前の7日間。確認済みとは、RestockWireのチェック2回が一致したもの（全店舗15秒ごと、通知設定店舗は5秒ごと）。店舗を初めて見たときの在庫は数えません。",
  },

  ranking: {
    title: (what: string, label: string) => `${label}で${what}がいちばん早く売り切れる店舗は？`,
    unknown: "売り切れランキングをいま読み込めませんでした。このページのライブ在庫と再入荷の記録には影響ありません。",
    thin: (label: string, k: number, min: number, days: number) =>
      `${label}では、時間を測れた売り切れがまだ足りません。過去${N(days)}日間に売り切れた再入荷が${N(min)}回以上ある店舗は${N(k)}店舗で、ランキングには2店舗必要です。`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>{o.label}で最速は<b className="text-ink">{o.fastest}</b>、再入荷の半数が<b className="text-ink">{o.fastSec}</b>以内に消えます。最も遅いのは<b className="text-ink">{o.slowest}</b>で{o.slowSec}（過去{N(o.days)}日間）。</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `${label}の${what}再入荷を売り切れの速さ順に（過去${N(days)}日間、時間を測れた売り切れが${N(min)}回以上の店舗）`,
    thRank: "#",
    thStore: "店舗",
    thMedian: "半数が消えるまで",
    thFastest: "最速",
    thPairs: "売り切れた再入荷",
    footnote: (ranked: number, total: number) => `${N(total)}店舗中${N(ranked)}店舗をランク付け`,
    measuredTitle: "測り方",
    measured: (min: number) =>
      `「半数が消えるまで」は、RestockWireのチェックが再入荷を最初に見つけてから、消えたことを最初に見つけるまでの時間の中央値です。上限値であり、通知を設定した店舗は5秒ごと、ほかの店舗は15秒ごとにチェックします。期間中に売り切れた再入荷が${N(min)}回以上ある店舗だけをランク付けしています。チェック1回分より短い在庫は見逃すことがあるため、非常に速い店舗は実際より少し遅く見えます。`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `${label}で${what}の再入荷が多かった店舗は？過去${N(days)}日間`,
    unknown: "ランキングをいま読み込めませんでした。このページのライブ在庫と再入荷の記録には影響ありません。",
    none: (what: string, label: string, days: number) => `過去${N(days)}日間、${label}で確認された${what}の再入荷はありません。`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <>過去{N(o.days)}日間、{o.label}のトップは<b className="text-ink">{o.store}</b>。確認済み再入荷{N(o.total)}回のうち<b className="text-ink">{N(o.n)}回</b>（<b className="text-ink">{o.share}</b>）でした。</>
    ),
    caption: (what: string, label: string, days: number) => `${label}のアップルストア：確認済みの${what}再入荷の多い順、過去${N(days)}日間`,
    thRank: "#",
    thStore: "店舗",
    thRestocks: "再入荷",
    thShare: "割合",
    footnote: (shown: number, stores: number, total: number) => `再入荷のあった${N(stores)}店舗中${N(shown)}店舗 · 再入荷は計${N(total)}回`,
    regionsTitle: (noun: string) => `${nounJa(noun)}別`,
    regionsCaption: (what: string, label: string, days: number, noun: string) => `${label}で確認された${what}の再入荷：${nounJa(noun)}別、過去${N(days)}日間`,
    thRegion: (noun: string) => nounJa(noun),
    thStores: "店舗",
    measuredTitle: "測り方",
    measured: (what: string) =>
      `直近7日間に確認された${what}の再入荷。RestockWire自身がapple.comの店頭受け取りをチェックした結果です（全店舗15秒ごと、通知設定店舗は5秒ごと。2回のチェックの一致が必要で、店舗を初めて見たときの在庫は数えません）。割合は、同じ場所・同じ期間の確認済み再入荷全体に対するものです。`,
  },
};
