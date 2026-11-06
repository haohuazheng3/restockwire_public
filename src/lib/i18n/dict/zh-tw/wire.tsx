/**
 * 台灣中文：wire（補貨紀錄的四個模組：星期 × 時段熱度圖、連續與空窗、售完速度排名、補貨次數排行）。
 * `label` 是光秃秃的地點名詞（「台北」「這家店」「日本」），句子自己接；`what` 是機型或規格名，不翻譯。
 * 時長、時段、星期、百分比都已按中文格式化。檢查頻率只寫 15 秒／5 秒。
 */
import type { Dict } from "../en";
import type { ReactNode } from "react";
import { n, zs, REGION_NOUNS } from "./util";

const noun = (s: string): string => REGION_NOUNS[s] ?? s;

export const wire: Dict["wire"] = {
  heatmap: {
    title: (what: string, label: string) => zs(`${label}的 ${what} 幾點補貨？星期 × 時段一覽`),
    unknown: "星期 × 時段熱度圖暫時讀不到；本頁的即時庫存與補貨紀錄不受影響。",
    none: (label: string, days: number) => zs(`${label}近 ${n(days)} 天還沒有確認的補貨，第一次補貨後這張表就會開始填上。`),
    thin: (cnt: number, label: string, days: number, activeDays: number, min: number, minDays: number) =>
      zs(`${label}近 ${n(days)} 天有 ${n(cnt)} 次補貨，分布在 ${n(activeDays)} 天，資料還不足以看出規律（RestockWire 要等到 ${n(min)} 次補貨、橫跨 ${n(minDays)} 天才下判斷）。`),
    pattern: (label: string, weekday: string, window: string, share: string, cnt: number, days: number) => (
      <>{label}的補貨多半落在<b className="text-ink">{weekday}</b>當地時間 <b className="text-ink">{window}</b>（近 {n(days)} 天 {n(cnt)} 次中佔 {share}）。</>
    ),
    patternHours: (label: string, window: string, share: string, cnt: number, spanDays: number) => (
      <>{label}的補貨多半落在當地時間 <b className="text-ink">{window}</b>（{n(cnt)} 次中佔 {share}）；資料只有 {n(spanDays)} 天，還不足以指出星期幾。</>
    ),
    caption: (what: string, label: string, days: number) => zs(`${label}已確認的 ${what} 補貨，依當地星期與時段統計，近 ${n(days)} 天`),
    cell: (weekday: string, hours: string, cnt: number) => zs(`${weekday} ${hours}：${n(cnt)} 次補貨`),
    busiest: (weekday: string, hours: string, cnt: number) => zs(`最熱門 · ${weekday} ${hours} · ${n(cnt)} 次補貨`),
    legendFewer: "少",
    legendMore: "多",
    localTime: "各門市自己的當地時間",
    measuredTitle: "統計方式",
    measured: (min: number, minDays: number, span: number) =>
      zs(`每一格計算 RestockWire 確認過的補貨（兩次檢查結果一致；門市第一次被看到時的庫存一律不算），依門市所在時區，落在該星期、該小時的次數。至少 ${n(min)} 次補貨、分布在 ${n(minDays)} 個不同日子才會說出規律；資料橫跨 ${n(span)} 天後才會指出星期幾。一口氣冒出的十次補貨算一個事件，不算習慣。`),
  },

  streak: {
    title: (what: string, label: string) => zs(`${label}的 ${what} 補貨連續與空窗`),
    unknown: "連續與空窗的數字暫時讀不到；本頁的即時庫存與補貨紀錄不受影響。",
    none: (label: string, days: number) => zs(`${label}近 ${n(days)} 天沒有確認的補貨，整段期間都是空窗。`),
    lead: (o: { label: string; since: ReactNode; longest: string | null; thisWeek: number; lastWeek: number; trend: string | null; days: number }) => (
      <>{o.label}上一次確認補貨：<b className="text-ink">{o.since}</b>{o.longest && <>；近 {n(o.days)} 天最長的空窗是 <b className="text-ink">{o.longest}</b></>}{o.trend && <>；本週 <b className="text-ink">{n(o.thisWeek)}</b> 次，上週 {n(o.lastWeek)} 次（{o.trend}）</>}。</>
    ),
    today: "今天",
    daysAgo: (d: number) => `${n(d)} 天前`,
    hoursAgo: (h: number) => `${n(h)} 小時前`,
    tileSince: "距上次確認補貨",
    tileSinceNone: (days: number) => `${n(days)} 天內沒有補貨`,
    tileLongest: (days: number) => `兩次補貨間最長空窗 · ${n(days)} 天`,
    tileWeek: (prev: number) => `近 7 天補貨次數 · 前一週 ${n(prev)} 次`,
    tileMedian: "補貨波之間的典型間隔",
    up: "↑ 比上週多",
    down: "↓ 比上週少",
    flat: "→ 與上週持平",
    none2: "–",
    measuredTitle: "統計方式",
    measured: "同一個半小時內、這裡統計的門市所有確認補貨算作一波：八款規格一起到貨是一波，不是八波；間隔以波與波之間計算。「本週」是近 7 天，「上週」是再往前的 7 天。確認代表 RestockWire 的兩次檢查結果一致（每家門市每 15 秒檢查，有通知的門市每 5 秒）；門市第一次被看到時的庫存一律不算。",
  },

  ranking: {
    title: (what: string, label: string) => zs(`${label}哪些門市的 ${what} 賣得最快？`),
    unknown: "售完速度排名暫時讀不到；本頁的即時庫存與補貨紀錄不受影響。",
    thin: (label: string, k: number, min: number, days: number) =>
      zs(`${label}有計時的售完紀錄還不夠：近 ${n(days)} 天有 ${n(min)} 次以上補貨售完的門市只有 ${n(k)} 家，排名至少要兩家。`),
    lead: (o: { label: string; fastest: ReactNode; fastSec: string; slowest: ReactNode; slowSec: string; days: number }) => (
      <>{o.label}最快：<b className="text-ink">{o.fastest}</b>，一半的補貨在 <b className="text-ink">{o.fastSec}</b> 內賣完；最慢：<b className="text-ink">{o.slowest}</b>，{o.slowSec}（近 {n(o.days)} 天）。</>
    ),
    caption: (what: string, label: string, days: number, min: number) => zs(`${label}的 ${what} 補貨依售完速度排序，近 ${n(days)} 天；限有 ${n(min)} 次以上計時售完的門市`),
    thRank: "#",
    thStore: "門市",
    thMedian: "一半賣完",
    thFastest: "最快",
    thPairs: "售完的補貨",
    footnote: (ranked: number, total: number) => zs(`${n(total)} 家門市中 ${n(ranked)} 家上榜`),
    measuredTitle: "統計方式",
    measured: (min: number) =>
      zs(`「一半賣完」是從 RestockWire 第一次看到補貨的那次檢查，到第一次看到它消失的那次檢查之間的中位數時間，屬於上限值：有通知的門市每 5 秒檢查，其他門市每 15 秒。只有期間內有 ${n(min)} 次以上補貨售完的門市才列入排名；上架時間短於一次檢查的可能被漏掉，所以極快的門市看起來會比實際慢一點。`),
  },

  leaderboard: {
    title: (what: string, label: string, days: number) => zs(`${label}哪些門市補貨 ${what} 最多？近 ${n(days)} 天`),
    unknown: "補貨排行暫時讀不到；本頁的即時庫存與補貨紀錄不受影響。",
    none: (what: string, label: string, days: number) => zs(`${label}近 ${n(days)} 天沒有確認的 ${what} 補貨。`),
    lead: (o: { store: ReactNode; n: number; total: number; share: string; label: string; days: number }) => (
      <>近 {n(o.days)} 天{o.label}的 {n(o.total)} 次確認補貨中，<b className="text-ink">{o.store}</b>以 <b className="text-ink">{n(o.n)}</b> 次居冠（<b className="text-ink">{o.share}</b>）。</>
    ),
    caption: (what: string, label: string, days: number) => zs(`${label}各 Apple Store 已確認的 ${what} 補貨次數，近 ${n(days)} 天`),
    thRank: "#",
    thStore: "門市",
    thRestocks: "補貨",
    thShare: "佔比",
    footnote: (shown: number, stores: number, total: number) => zs(`有補貨的 ${n(stores)} 家門市中列出 ${n(shown)} 家 · 共 ${n(total)} 次補貨`),
    regionsTitle: (nn: string) => `依${noun(nn)}`,
    regionsCaption: (what: string, label: string, days: number, nn: string) => zs(`${label}已確認的 ${what} 補貨，依${noun(nn)}統計，近 ${n(days)} 天`),
    thRegion: (nn: string) => noun(nn),
    thStores: "門市",
    measuredTitle: "統計方式",
    measured: (what: string) =>
      zs(`近 7 天已確認的 ${what} 補貨，來自 RestockWire 自己對 apple.com 門市取貨的檢查（每家門市每 15 秒，有通知的門市每 5 秒；兩次檢查必須一致；門市第一次被看到時的庫存一律不算）。佔比的分母是同一地點、同一期間的全部確認補貨。`),
  },
};
