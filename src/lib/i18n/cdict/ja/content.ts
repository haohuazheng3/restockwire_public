import type { CDict } from "../en";

/** 日本語クライアント文言: content（ファーストビューの在庫チェッカーと、画面遷移中のスケルトン）。 */
export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhoneの機種",
    search: "ZIPコード、都市、アップルストア",
    useLocation: "現在地を取得",
    nearMe: "📍 現在地の近く",
    locationOff: "このサイトは位置情報にアクセスできません。代わりにZIPコードを入力してください。",
    storesNow: "{what}は現在、米国のアップルストア **{total}店舗中{n}店舗** で店頭受け取りの対象です",
    nearestTo: " · {place}から近い順",
    you: "現在地",
    noMatch: "見つかりませんでした。5桁のZIPコードか都市名を入力してください。",
    inStock: "{n}/{total} 受け取り可",
    soldOut: "売り切れ",
    alertMe: "受け取り可能になったら通知",
    allStores: "全{n}店舗を見る →",
    here: "現在地",
  },
  skeleton: {
    loading: "読み込み中",
  },
};
