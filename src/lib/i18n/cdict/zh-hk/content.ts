/** 繁體中文（香港）client strings: content — the first-screen stock checker and the navigation skeletons. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "iPhone 型號",
    search: "郵遞區號、城市或 Apple Store",
    useLocation: "定位我",
    nearMe: "📍 我附近",
    locationOff: "本網站沒有定位權限。請改為輸入郵遞區號。",
    storesNow: "{what} 現時在 **{total} 間中的 {n} 間**美國 Apple Store 可供取貨",
    nearestTo: " · 最接近{place}",
    you: "你",
    noMatch: "沒有結果。請輸入 5 位數郵遞區號或城市名稱。",
    inStock: "{n}/{total} 有貨",
    soldOut: "已售罄",
    alertMe: "有貨時提醒我",
    allStores: "瀏覽全部 {n} 間分店 →",
    here: "就在這裏",
  },
  skeleton: {
    loading: "載入中",
  },
};
