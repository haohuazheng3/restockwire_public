import type { ReactNode } from "react";
import type { Dict } from "../en";

/** 繁體中文（香港）: chrome — footer, 404 page. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "美國全部 269 間 Apple Store 的即時店內取貨存貨及補貨提醒。全國分店每 15 秒掃一次；你的提醒指定的分店，每 5 秒一次。",
    blurbIn: (allStores: string) => `${allStores}的即時店內取貨存貨及補貨提醒。每間分店每 15 秒掃一次；你的提醒指定的分店，每 5 秒一次。`,
    trademark: "RestockWire 是獨立服務，與 Apple Inc. 並無任何關連，亦未獲其認可。Apple、iPhone 及 Apple Store 均為 Apple Inc. 的商標。",
    product: "產品",
    duoStock: "iPhone Duo 存貨",
    proStock: "iPhone 18 Pro 存貨",
    proMaxStock: "iPhone 18 Pro Max 存貨",
    restockLog: "補貨記錄",
    liveMap: "即時地圖",
    storesByState: "按州份瀏覽分店",
    pricing: "收費",
    company: "公司",
    howItWorks: "運作原理",
    getApp: "安裝 App",
    about: "關於",
    contact: "聯絡",
    allStates: "全部州份及城市 →",
    storesIn: "Apple Store 分店",
    allStores: "全部分店 →",
    legal: "法律",
    privacy: "私隱",
    terms: "條款",
    refunds: "退款",
    englishOnly: "只有英文版",
    questions: "iPhone Duo 問答",
    restockTimes: "Apple 幾點補貨 iPhone Duo？",
    countries: "國家／地區",
    status: "服務狀態",
  },
  notFound: {
    title: "這個網址沒有頁面",
    body: (stores: ReactNode, map: ReactNode) => <>這裏甚麼也沒有。由{stores}或{map}重新出發吧。</>,
    stores: "按州份分店列表",
    map: "即時存貨地圖",
    home: "前往首頁",
  },
};
