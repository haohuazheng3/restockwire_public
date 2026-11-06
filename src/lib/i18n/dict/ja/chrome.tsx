import type { ReactNode } from "react";
import type { Dict } from "../en";

/** 日本語: chrome — フッター、404、言語版の案内。 */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "米国のアップルストア全269店舗の店頭受け取り在庫をライブで表示し、再入荷を通知します。全店舗は15秒間隔、通知を設定した店舗は5秒間隔でチェック。",
    blurbIn: (allStores: string) => `${allStores}の店頭受け取り在庫をライブで表示し、再入荷を通知します。全店舗は15秒間隔、通知を設定した店舗は5秒間隔でチェック。`,
    trademark: "RestockWireは独立したサービスで、Apple Inc.との提携や承認はありません。Apple、iPhone、Apple StoreはApple Inc.の商標です。",
    product: "サービス",
    duoStock: "iPhone Duoの在庫",
    proStock: "iPhone 18 Proの在庫",
    proMaxStock: "iPhone 18 Pro Maxの在庫",
    restockLog: "再入荷の記録",
    liveMap: "在庫マップ",
    storesByState: "州別の店舗",
    pricing: "料金",
    company: "RestockWire",
    howItWorks: "仕組み",
    getApp: "アプリを入手",
    about: "RestockWireについて",
    contact: "お問い合わせ",
    allStates: "すべての州と都市 →",
    storesIn: "アップルストア",
    allStores: "全店舗 →",
    legal: "規約・ポリシー",
    privacy: "プライバシー",
    terms: "利用規約",
    refunds: "返金",
    englishOnly: "英語のみ",
    questions: "iPhone Duoの疑問",
    restockTimes: "AppleがiPhone Duoを再入荷するのは何時？",
    countries: "国・地域",
    status: "稼働状況",
  },
  notFound: {
    title: "このアドレスにページはありません",
    body: (stores: ReactNode, map: ReactNode) => <>ここには何も公開されていません。{stores}か{map}から戻れます。</>,
    stores: "州別の店舗一覧",
    map: "ライブ在庫マップ",
    home: "ホームへ",
  },
};
