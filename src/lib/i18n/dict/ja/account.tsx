/**
 * 日本語: account（マイ通知ページ、そこに出る入荷モジュール、/phone-alerts、/checkout/success、/pricing）。
 * **太字** と [ラベル](リンク) は <Md> で表示。プラン名とドル金額は訳さない（全言語で米ドル課金）。
 */
import { OTHER_TRACKERS, SPEED } from "@/lib/plans";
import { num } from "@/lib/i18n/format";
import type { Dict } from "../en";

const N = (n: number) => num("ja", n);
/** 他のトラッカーが公表しているチェック間隔（"8 seconds to 15 minutes" → 「8秒〜15分」）。 */
const others = (() => {
  const m = OTHER_TRACKERS.match(/^(\d+) seconds? to (\d+) minutes?$/);
  return m ? `${m[1]}秒から${m[2]}分` : OTHER_TRACKERS;
})();

export const account: Dict["account"] = {
  loading: "読み込んでいます",
  meta: { title: "通知の管理" },
  signedInAs: (email: string) => `ログイン中：${email}`,
  title: "通知の管理",
  units: { s: "秒", min: "分", taps: "回" },

  plan: {
    title: "ご利用プラン",
    none: "このアカウントにはプランがないため、通知は停止中です",
    summary: (plan: string, on: number, limit: number) => `${plan} · 通知${N(limit)}件中${N(on)}件が稼働中`,
    renews: (date: string) => ` · 次回請求 ${date}`,
    ends: (date: string) => ` · ${date}に停止`,
  },

  sent: {
    title: "届けた通知",
    last: (ago: string) => `最新 ${ago}`,
    none: "まだ届けていません",
    empty: "まだ通知は送られていません。",
    channel: { push: "プッシュ", email: "Eメール" },
    status: { sent: "送信完了", failed: "送信失敗", skipped: "送信せず" },
  },

  fast: {
    title: "20秒で予約する",
    sub: "最後の4タップ以外は、すべて先に済ませておく",
    lasts: "Duoの在庫が並んでいる時間（通常）",
    push: "再入荷を確認 → スマートフォンにプッシュ",
    tapsLeft: "プッシュが届いてから残るタップ数",
    steps: [
      { title: "時間帯を把握する", hint: "店舗のいつもの時間帯は下に · 10分前には準備完了" },
      { title: "Appleの購入画面を先に開く", hint: "容量とカラーを正確に → お届け・受け取り" },
      { title: "規約は先に同意 · またはSIMフリーで", hint: "SIMフリー・一括払いならチェック欄は出ません" },
      { title: "画面ロックを止める", hint: "自動ロック → なし · 10〜15分ごとに軽く触れる" },
      { title: "届いたら：読んで、すぐ動く", hint: "受け取り → 指定の店舗 → 最初の枠 → Apple Pay" },
    ],
    guide: "2分でわかる手順",
    window: "あなたの再入荷の時間帯",
  },

  restock: {
    title: "あなたの店舗が再入荷する時間帯",
    anyIphone: "iPhone",
    and: "、",
    yours: (n: number) => (n === 1 ? "あなたの店舗" : `あなたの${N(n)}店舗`),
    Yours: (k: number) => (k === 1 ? "あなたの店舗" : `あなたの${N(k)}店舗`),
    otherStores: (n: number) => `そのほか${N(n)}店舗`,
    meta: (label: string, count: number, span: number, tz: string) => `${label} · 対象${N(count)}店舗 · 直近${N(span)}日 · ${tz}`,
    busiest: (mine: string, then: string | null) => (then ? `${mine}のピーク時間 · 次いで${then}` : `${mine}のピーク時間`),
    busiestArea: (count: number, tz: string) => `${tz}の全${N(count)}店舗でのピーク`,
    next: (inHours: number) => `次の山 · ${inHours === 0 ? "1時間以内" : `あと${N(inHours)}時間`}`,
    typical: "在庫が並んでいる時間（通常）",
    count: (yours: string, days: number, total: number, pattern: boolean) => (total === 0 ? `${yours}ではまだ再入荷なし · 過去${N(days)}日間` : `${yours}の再入荷 · 過去${N(days)}日間${pattern ? "" : " · 傾向を出すにはまだ不足"}`),
    byHour: (busiestInGreen: boolean) => `1時間ごと${busiestInGreen ? " · ピークは緑" : ""}`,
    byWeekday: (busiest: string | null) => `曜日ごと${busiest ? ` · ピークは${busiest}` : ""}`,
    hourChart: (mine: string, tz: string, items: string) => `${mine}の時間帯別の再入荷（${tz}）：${items}`,
    weekdayChart: (mine: string, items: string) => `${mine}の曜日別の再入荷：${items}`,
    chartItem: (slot: string, n: number, reported: number) => `${slot} ${N(n)}${reported ? `（他トラッカーの報告 +${N(reported)}）` : ""}`,
    barTitle: (slot: string, n: number, mine: string, area: { n: number; zone: string } | null, reported: number) =>
      `${slot}：${mine}で再入荷${N(n)}回${area ? ` · ${area.zone}全体で${N(area.n)}回` : ""}${reported ? ` · 他トラッカーの報告${N(reported)}回` : ""}`,
    now: "いま",
    allZone: (stores: number, zone: string) => `${zone}・全${N(stores)}店舗`,
    reportMarkBars: "点線の棒",
    reportMarkDots: "中抜きの点",
    sellTitle: "あなたの店舗で再入荷は何秒残るか",
    sellMeta: (label: string, count: number, span: number) => `${label} · 対象${N(count)}店舗 · 直近${N(span)}日`,
    sellLabel: (yours: string) => yours,
  },

  success: {
    metaTitle: "通知が稼働しました",
    isOn: (plan: string) => `${plan}が有効です`,
    yourPlan: "あなたのプラン",
    received: "お支払いを確認しました",
    onPlan: (limit: number) => `このプランでは通知を${N(limit)}件使えます。`,
    planOn: "プランが有効です。",
    pending: "少しお待ちください。サブスクリプションはまもなくアカウントに表示されます。",
    open: "マイ通知へ",
    another: "通知をもう1件設定する",
    saved: (n: number) => `通知${N(n)}件を登録済み · 領収書はStripeからメールで届きます`,
    pushOn: "プッシュ通知",
    pushNext: "あと1ステップ：スマートフォンで通知を受け取る",
  },

  install: {
    metaTitle: "アプリを入手：再入荷通知をロック画面に直接",
    metaDescription: "RestockWireをホーム画面に追加すれば、近くのアップルストアでiPhone Duo、18 Pro、Pro Maxが店頭受け取りに並んだ瞬間に通知が届きます。",
  },

  pricing: {
    metaTitle: "料金：通知10件$5、20件$10、50件$20",
    metaDescription: `アップルストアのiPhone店頭受け取りの再入荷通知。選んだ店舗は${SPEED.fastSec}秒間隔でチェックし、再入荷を確認してから約${SPEED.alertSec}秒でプッシュ。Plusは月$5で10件、Proは$10で20件、Maxは$20で50件。いつでも解約できます。`,
    title: "プランと料金",
    lead: "**通知1件＝1店舗 × 1台のiPhone（容量・カラーまで指定）。** それ以外はすべて無料で見られます。",
    chips: ["日本の全11店舗をカバー", "解約はいつでも", "カード／Link対応"],
    fastest: "これより短いチェック間隔を公表しているiPhone在庫トラッカーはありません",
    everyFast: `あなたの店舗のチェック間隔は**${SPEED.fastSec}秒** · 他のトラッカーの公表値：${others}`,
    sellsOut: (band: string) => `**${band}**：iPhone Duoの再入荷が並んでいる時間（通常）。20〜30秒で消えることも`,
    band: (range: string) => `${range.replace(/[–-]/, "〜")}秒`,
    aboutMinute: "1分ほど",
    sameSpeed: "全プラン同じ速さ",
    rechecked: "あなたの店舗のチェック間隔",
    toPhone: "再入荷の確認からスマートフォンまで",
    listing: "Duoの在庫が並んでから消えるまで（通常）",
    note: { plus: "1構成 × 10店舗", pro: "2構成 × 10店舗", max: "5構成 × 10店舗" },
    month: "／月",
    alerts: (n: number) => `通知${N(n)}件まで`,
    perks: [
      `あなたの店舗は${SPEED.fastSec}秒、ほかの全店舗は${SPEED.checkSec}秒間隔で確認`,
      `確認済みの再入荷を約${SPEED.alertSec}秒でスマートフォンへ`,
    ],
    cancel: "いつでも解約",
    get: (plan: string) => `${plan}を選ぶ`,
    billing: "Stripeで決済 · カードまたはLink · プラン変更は日割り",
    refund: "気が変わったら：入荷通知がまだ届いていなければ、[7日以内なら全額返金](/refunds)できます",
  },
};
