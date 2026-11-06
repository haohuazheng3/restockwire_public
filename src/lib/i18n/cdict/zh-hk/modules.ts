/** 繁體中文（香港）client strings: modules (MiniMap, the other-trackers footnote). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "在即時地圖上查看 {label}",
    cta: "在即時地圖上查看 →",
  },
  reports: {
    legend: "其他追蹤網站的報告（{sources}），{range}",
    note: "{mark}：{links} 公布的 {range} {what}。這些是那些網站的觀察，RestockWire 未有確認，我們的數字亦一概沒有計入。",
    what: "{models} 補貨",
    whatAny: "補貨",
    markDashed: "虛線",
    markDashedRings: "虛線圓圈",
    markHollowDots: "空心點",
  },
};
