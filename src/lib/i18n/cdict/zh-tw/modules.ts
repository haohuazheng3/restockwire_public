/** 台灣中文客戶端字串：modules（迷你地圖，以及伺服器與客戶端共用的「其他追蹤網站回報」註腳）。 */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "在即時地圖上查看 {label}",
    cta: "在即時地圖上查看 →",
  },
  reports: {
    legend: "其他追蹤網站回報（{sources}），{range}",
    note: "{mark}：{links} 公布的 {range} {what}。這些是那些網站的觀察，RestockWire 沒有確認過，我們的數字也都沒有計入。",
    what: "{models} 補貨",
    whatAny: "補貨",
    markDashed: "虛線",
    markDashedRings: "虛線圓圈",
    markHollowDots: "空心點",
  },
};
