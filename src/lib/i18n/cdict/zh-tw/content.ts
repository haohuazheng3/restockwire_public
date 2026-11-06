/** 台灣中文客戶端字串：content —— 首屏庫存查詢（美國首頁）與換頁骨架。 */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone 機型",
    search: "郵遞區號、城市或 Apple Store",
    useLocation: "定位我的位置",
    nearMe: "📍 我附近",
    locationOff: "這個網站沒有定位權限，請改輸入郵遞區號。",
    storesNow: "{what} 此刻在 **{total} 家中的 {n} 家**美國 Apple Store 開放門市取貨",
    nearestTo: " · 離{place}最近",
    you: "你",
    noMatch: "沒有結果。請輸入 5 碼郵遞區號或城市。",
    inStock: "{n}/{total} 上架",
    soldOut: "已售完",
    alertMe: "上架時通知我",
    allStores: "瀏覽全部 {n} 家門市 →",
    here: "就在這裡",
  },
  skeleton: {
    loading: "載入中",
  },
};
