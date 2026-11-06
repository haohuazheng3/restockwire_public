import type { CDict } from "../en";

/** 日本語クライアント文言: modules（ミニマップと、他の在庫サイトの報告に関する注記）。 */
export const modules: CDict["modules"] = {
  minimap: {
    aria: "{label}をライブマップで見る",
    cta: "ライブマップで見る →",
  },
  reports: {
    legend: "他の在庫サイトの報告（{sources}）、{range}",
    note: "{mark}：{links}が{range}について公開した{what}です。これは各サイトによる観測で、RestockWireは確認しておらず、当サイトの数値にも一切含めていません。",
    what: "{models}の再入荷",
    whatAny: "再入荷",
    markDashed: "破線",
    markDashedRings: "破線の円",
    markHollowDots: "白抜きの点",
  },
};
