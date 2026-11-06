/**
 * 繁體中文（香港）: wire — the four restock-log modules (weekday × hour grid, streaks and droughts, sell-out ranking,
 * restock leaderboard). `label` is a bare place noun（「中環」「本店」「香港」）; `what` is a model or configuration name,
 * never translated. Durations, hours, weekdays and percentages arrive formatted. Check intervals: 15 秒 / 5 秒 only.
 * Spacing between Chinese and Latin is added by panDict for strings; JSX keeps its own spaces.
 */
import type { Dict } from "../en";
import type { ReactNode } from "react";
import { n, REGION_NOUN } from "./common";

const noun = (s: string): string => REGION_NOUN[s] ?? s;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => `${label}的 ${what} 幾點補貨？星期 × 時段一覽`,
    unknown: "星期 × 時段熱度圖暫時讀取不到；本頁的即時存貨及補貨記錄不受影響。",
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日仍未有確認的補貨，第一次補貨後這個表就會開始填上。`,
    thin: (cnt: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      `${label}過去 ${n(days)} 日有 ${n(cnt)} 次補貨，分佈在 ${n(activeDays)} 日，數據仍未足以看出規律（RestockWire 要等到 ${n(min)} 次補貨、橫跨 ${n(minDays)} 日才會下判斷）。`,
    pattern: (label: string, weekday: string, window: string, share: string, cnt: number, days: number) => (
      <>{label}的補貨大多落在<b className="text-ink">{weekday}</b>當地時間 <b className="text-ink">{window}</b>（過去 {n(days)} 日 {n(cnt)} 次之中佔 {share}）。</>
    ),
    patternHours: (label: string, window: string, share: string, cnt: number, spanDays: number) => (
      <>{label}的補貨大多落在當地時間 <b className="text-ink">{window}</b>（{n(cnt)} 次之中佔 {share}）；數據只有 {n(spanDays)} 日，仍未足以指出星期幾。</>
    ),
    caption: (what: string, label: string, days: number) => `${label}已確認的 ${what} 補貨，按當地星期及時段統計，過去 ${n(days)} 日`,
    cell: (weekday: string, hours: string, cnt: number) => `${weekday} ${hours}：${n(cnt)} 次補貨`,
    busiest: (weekday: string, hours: string, cnt: number) => `最繁忙 · ${weekday} ${hours} · ${n(cnt)} 次補貨`,
    legendFewer: "少",
    legendMore: "多",
    localTime: "各分店自己的當地時間",
    measuredTitle: "計算方法",
    measured: (min: number, minDays: number, span: number) =>
      `每一格計算 RestockWire 確認過的補貨（兩次檢查結果一致；分店第一次被發現時的存貨一律不計），按分店所在時區，落在該星期、該小時的次數。最少要有 ${n(min)} 次補貨、分佈在 ${n(minDays)} 個不同日子，才會說出規律；數據橫跨 ${n(span)} 日之後才會指出星期幾。一下子湧出的十次補貨只算一件事，不算習慣。`,
  },

  streak: {
    title: (what: string, label: string) => `${label}的 ${what} 補貨連續期與空窗期`,
    unknown: "連續期及空窗期的數字暫時讀取不到；本頁的即時存貨及補貨記錄不受影響。",
    none: (label: string, days: number) => `${label}過去 ${n(days)} 日沒有確認的補貨，整段時間都是空窗期。`,
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>{o.label}上一次確認補貨：<b className="text-ink">{o.since}</b>{o.longest && <>；過去 {n(o.days)} 日最長的空窗期是 <b className="text-ink">{o.longest}</b></>}{o.trend && <>；本星期 <b className="text-ink">{n(o.thisWeek)}</b> 次，上星期 {n(o.lastWeek)} 次（{o.trend}）</>}。</>
    ),
    today: "今日",
    daysAgo: (d: number) => `${n(d)} 日前`,
    hoursAgo: (h: number) => `${n(h)} 小時前`,
    tileSince: "距離上次確認補貨",
    tileSinceNone: (days: number) => `${n(days)} 日內沒有補貨`,
    tileLongest: (days: number) => `兩次補貨之間最長空窗 · ${n(days)} 日`,
    tileWeek: (prev: number) => `過去 7 日補貨次數 · 再前一星期 ${n(prev)} 次`,
    tileMedian: "每輪補貨之間的一般間隔",
    up: "↑ 比上星期多",
    down: "↓ 比上星期少",
    flat: "→ 與上星期相同",
    none2: "–",
    measuredTitle: "計算方法",
    measured: "同一個半小時內、這裏統計的分店所有確認補貨算作一輪：八款配置一齊到貨是一輪，不是八輪；間隔按輪與輪之間計算。「本星期」是過去 7 日，「上星期」是再之前的 7 日。確認即是 RestockWire 兩次檢查結果一致（每間分店每 15 秒檢查，有提醒的分店每 5 秒）；分店第一次被發現時的存貨一律不計。",
  },

  ranking: {
    title: (what: string, label: string) => `${label}哪些分店的 ${what} 賣得最快？`,
    unknown: "售罄速度排名暫時讀取不到；本頁的即時存貨及補貨記錄不受影響。",
    thin: (label: string, k: number, min: number, days: number) =>
      `${label}有計時的售罄記錄仍不足：過去 ${n(days)} 日有 ${n(min)} 次或以上補貨售罄的分店只有 ${n(k)} 間，排名最少要兩間。`,
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>{o.label}最快：<b className="text-ink">{o.fastest}</b>，一半補貨在 <b className="text-ink">{o.fastSec}</b> 內賣清；最慢：<b className="text-ink">{o.slowest}</b>，{o.slowSec}（過去 {n(o.days)} 日）。</>
    ),
    caption: (what: string, label: string, days: number, min: number) => `${label}的 ${what} 補貨按售罄速度排列，過去 ${n(days)} 日；只計有 ${n(min)} 次或以上計時售罄的分店`,
    thRank: "#",
    thStore: "分店",
    thMedian: "一半賣清",
    thFastest: "最快",
    thPairs: "售罄的補貨",
    footnote: (ranked: number, total: number) => `${n(total)} 間分店之中 ${n(ranked)} 間上榜`,
    measuredTitle: "計算方法",
    measured: (min: number) =>
      `「一半賣清」是由 RestockWire 第一次見到補貨的那次檢查，到第一次見到它消失的那次檢查之間的中位數時間，屬上限值：有提醒的分店每 5 秒檢查，其他分店每 15 秒。只有期內有 ${n(min)} 次或以上補貨售罄的分店才會排名；上架時間短過一次檢查的可能會漏掉，所以極快的分店看起來會比實際慢一點。`,
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => `${label}哪些分店補貨 ${what} 最多？過去 ${n(days)} 日`,
    unknown: "補貨排行榜暫時讀取不到；本頁的即時存貨及補貨記錄不受影響。",
    none: (what: string, label: string, days: number) => `${label}過去 ${n(days)} 日沒有確認的 ${what} 補貨。`,
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <>過去 {n(o.days)} 日{o.label}共 {n(o.total)} 次確認補貨，<b className="text-ink">{o.store}</b>以 <b className="text-ink">{n(o.n)}</b> 次排第一（<b className="text-ink">{o.share}</b>）。</>
    ),
    caption: (what: string, label: string, days: number) => `${label}各 Apple Store 已確認的 ${what} 補貨次數，過去 ${n(days)} 日`,
    thRank: "#",
    thStore: "分店",
    thRestocks: "補貨",
    thShare: "佔比",
    footnote: (shown: number, stores: number, total: number) => `有補貨的 ${n(stores)} 間分店之中列出 ${n(shown)} 間 · 合共 ${n(total)} 次補貨`,
    regionsTitle: (nn: string) => `按${noun(nn)}`,
    regionsCaption: (what: string, label: string, days: number, nn: string) => `${label}已確認的 ${what} 補貨，按${noun(nn)}統計，過去 ${n(days)} 日`,
    thRegion: (nn: string) => noun(nn),
    thStores: "分店",
    measuredTitle: "計算方法",
    measured: (what: string) =>
      `過去 7 日已確認的 ${what} 補貨，來自 RestockWire 自己對 apple.com 店內取貨的檢查（每間分店每 15 秒，有提醒的分店每 5 秒；兩次檢查必須一致；分店第一次被發現時的存貨一律不計）。佔比以同一地點、同一時段的全部確認補貨計算。`,
  },
};
