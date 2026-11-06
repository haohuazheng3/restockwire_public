/** 台灣中文：chrome（頁尾、404 頁）。 */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "全美 269 家 Apple Store 的即時門市取貨庫存與補貨通知。全國門市每 15 秒掃一輪；你的通知指定的門市，每 5 秒一次。",
    blurbIn: (allStores: string) => `${allStores}的即時門市取貨庫存與補貨通知。每家門市每 15 秒掃一輪；你的通知指定的門市，每 5 秒一次。`,
    trademark: "RestockWire 是獨立服務，與 Apple Inc. 沒有任何關係，也未獲其背書。Apple、iPhone 與 Apple Store 是 Apple Inc. 的商標。",
    product: "產品",
    duoStock: "iPhone Duo 庫存",
    proStock: "iPhone 18 Pro 庫存",
    proMaxStock: "iPhone 18 Pro Max 庫存",
    restockLog: "補貨紀錄",
    liveMap: "即時地圖",
    storesByState: "依州瀏覽門市",
    pricing: "方案與價格",
    company: "公司",
    howItWorks: "運作方式",
    getApp: "下載 App",
    about: "關於",
    contact: "聯絡",
    allStates: "所有州與城市 →",
    storesIn: "Apple 直營店",
    allStores: "所有門市 →",
    legal: "法律",
    privacy: "隱私權",
    terms: "條款",
    refunds: "退款",
    englishOnly: "僅英文版",
    questions: "iPhone Duo 問答",
    restockTimes: "Apple 幾點補貨 iPhone Duo？",
    countries: "國家／地區",
    status: "服務狀態",
  },
  notFound: {
    title: "這個網址沒有頁面",
    body: (stores: ReactNode, map: ReactNode) => <>這裡沒有任何內容。從{stores}或{map}就能回到正軌。</>,
    stores: "各州門市列表",
    map: "即時庫存地圖",
    home: "前往首頁",
  },
};
