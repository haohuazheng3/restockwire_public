/**
 * 台灣中文：insight —— Apple 門市取貨狀態、每週補貨報告、最快賣完的門市、門市對比與三篇手機通知教學。
 * 參數都已依台灣寫法格式化（數字、秒數、日期、店名、國名），這裡只寫句子。`w.in` 在非英文頁也只是國名，
 * 介系詞自己用 `w.name` 組。檢查間隔只寫 15 秒與 5 秒；不提退款。iOS 路徑用 Apple 台灣的官方名稱。
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { zs } from "./util";

/** 美國頁寫「Apple Store」，其他國家寫「Apple 直營店」（與 views／place 一致）。 */
const AS = (w: Where) => (w.us ? "Apple Store" : "Apple 直營店");

export const insight: InsightDict = {
  nav: {
    status: "Apple 門市取貨狀態",
    reports: "每週補貨報告",
    fastest: "最快賣完的 Apple 門市",
    compare: "門市對比",
    guides: "手機通知教學",
    otherCountries: "其他國家的同一頁",
    updated: (when: string) => zs(`更新於 ${when}`),
    sources: "資料來源與方法",
    cite: "引用這些數字時，請附上本頁連結作為出處。",
    alertCta: "設定補貨通知",
    logCta: "打開補貨紀錄",
  },

  status: {
    title: (w: Where) => (w.us ? "Apple Store 取貨查詢掛了嗎？美國即時狀態" : zs(`${w.name} Apple 門市取貨即時狀態`)),
    h1: (w: Where) => zs(`${w.name}的 Apple 門市取貨查詢，現在正常嗎？`),
    meta: (v: StatusView) =>
      zs(`即時：過去一分鐘，Apple 回應了${v.w.name} ${v.stores} 家${AS(v.w)}中 ${v.answered} 家的取貨查詢。附失敗率、過去一天的不穩時段，以及查詢卡住時該怎麼做。`),
    answer: (v: StatusView) =>
      zs(
        v.verdict === "ok"
          ? `正常。過去一分鐘，Apple 回應了${v.w.name} ${v.stores} 家${AS(v.w)}中 ${v.answered} 家的取貨查詢；過去一小時失敗率 ${v.failLastHour}。`
          : v.verdict === "slow"
            ? `部分正常。過去一分鐘，Apple 回應了${v.w.name} ${v.stores} 家${AS(v.w)}中 ${v.answered} 家；過去一小時 ${v.failLastHour} 的請求失敗，部分庫存可能延遲顯示。`
            : v.verdict === "down"
              ? `目前不正常。過去一分鐘，Apple 只回應了${v.w.name} ${v.stores} 家${AS(v.w)}中 ${v.answered} 家。恢復之前，apple.com 和這裡顯示的庫存可能是舊的。`
              : `RestockWire 此刻讀不到${v.w.name}的狀態。請一分鐘後重新整理。`,
      ),
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "正常", slow: "偏慢", down: "沒有回應", unknown: "未知" })[v],
    tiles: {
      answered: "過去一分鐘有回應的門市",
      age: "各門市最新一次檢查的中位數時間",
      failHour: "失敗請求，過去 60 分鐘",
      failDay: "失敗請求，過去 24 小時",
    },
    nowH2: "RestockWire 現在看到什麼？",
    nowLead: (v: StatusView) =>
      zs(`過去一分鐘內，${v.stores} 家門市中有 ${v.answered} 家回應${v.age ? `；一般門市在 ${v.age}前剛被讀取` : ""}。`),
    nowPoints: (v: StatusView) =>
      [
        `${v.w.name}每家${AS(v.w)}都在 15 秒一輪的檢查裡；設了通知的門市 5 秒一輪。`,
        v.oldest ? `等最久的門市，上次回應是 ${v.oldest}前。` : "這段時間內還沒有門市回應。",
        Number(v.never) > 0 ? `${v.never} 家門市從未回應：Apple 目前在那裡不提供取貨查詢。` : "每家門市都至少回應過一次。",
      ].map(zs),
    dayH2: "過去 24 小時的狀況如何？",
    dayLead: (v: StatusView) =>
      zs(
        v.roughHours === 0
          ? `很平順：過去 24 小時沒有任何一小時的失敗率達到 5%（整體 ${v.failDay}）。`
          : `過去 24 小時有 ${v.roughHours} 個不穩的小時，失敗率都在 5% 以上：${v.roughList}。整體失敗率 ${v.failDay}。`,
      ),
    hourCaption: (zone: string) => zs(`過去 24 小時每小時的請求與失敗數（${zone}）`),
    hourHead: ["時段", "請求", "失敗", "失敗比例"],
    whyH2: "為什麼 apple.com 顯示每家門市都無法取貨？",
    whyLead: "通常是因為該規格賣完了。偶爾是 Apple 的查詢本身出了狀況。",
    whyPoints: [
      "**賣完：**查詢正常回應，只是沒有列出任何門市。本頁維持綠色。",
      "**查詢故障：**所有門市同時查詢失敗或回傳空白。本頁會在一分鐘內轉為黃色或紅色。",
      "**你的瀏覽狀態：**開太久的 apple.com 分頁可能停在舊答案。相信它之前，先重新整理購物袋頁面。",
    ],
    doH2: "取貨查詢卡住時該怎麼做？",
    doLead: "通知保持開啟，等就好。卡住的查詢會自己恢復，期間出現的補貨一樣會被確認。",
    doSteps: [
      "讓通知繼續跑：RestockWire 會一直查，補貨一經確認就通知你。",
      "不要每幾秒就重新整理 apple.com：這不會讓 Apple 的查詢變快。",
      "五分鐘後再看一次本頁。目前遇過的不穩時段，從幾分鐘到約兩小時不等。",
      "轉回綠色後打開你門市的頁面：補貨紀錄會列出中斷期間出現的補貨。",
    ],
    methodH2: "狀態怎麼量出來的？",
    methodPoints: [
      "**新鮮度：**每家門市最新一次成功的檢查，來自 RestockWire 自己的取貨查詢。",
      "**失敗：**負責該國的檢查輪次每小時的失敗請求數，以我們輪詢主機的紀錄為準。",
      "**判定：**正常 = 過去一分鐘有 90% 門市回應且失敗率低於 5%；沒有回應 = 回應的門市不到一半。",
    ],
    otherH2: "其他國家的取貨狀態",
    faq: (v: StatusView) => [
      {
        q: "apple.com 的門市取貨掛了嗎？",
        a: zs(
          v.verdict === "ok"
            ? `${v.w.name}目前沒有：過去一分鐘 ${v.stores} 家門市中有 ${v.answered} 家回應。`
            : `${v.w.name}目前不太穩：過去一分鐘 ${v.stores} 家門市中只有 ${v.answered} 家回應。`,
        ),
      },
      { q: "紅色狀態代表 iPhone 賣完了嗎？", a: "不是。紅色代表 Apple 的查詢失敗；賣完是正常的回應，狀態仍是綠色。" },
      { q: "本頁多久更新一次？", a: "每次打開都讀取最新數字；數字最多是 30 秒前的。" },
      { q: "查詢故障時會錯過補貨嗎？", a: "可能會晚一點看到。查詢一恢復，RestockWire 就確認每次補貨並立刻通知你。" },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "美國 Apple Store 每週 iPhone 補貨報告" : zs(`${w.name}每週 iPhone 補貨報告`)),
    indexH1: (w: Where) => (w.us ? "每週 iPhone 補貨報告" : zs(`${w.name}每週 iPhone 補貨報告`)),
    indexMeta: (w: Where) =>
      zs(`${w.name}${AS(w)}每一週的 iPhone Duo、18 Pro 與 18 Pro Max 補貨：次數、最常補貨的門市、規格與賣完速度，逐週整理。`),
    indexLead: (w: Where, n: number) =>
      zs(
        n === 0
          ? `某一週累積 ${"20"} 次確認補貨後，${w.name}的第一份報告就會出現。`
          : `${w.name}已有 ${n} 週的報告。每一期都是 RestockWire 一週（當地時間週一到週日）的確認補貨紀錄。`,
      ),
    indexRow: (range: string, restocks: string, complete: boolean) => zs(`${range} · ${restocks} 次補貨${complete ? "" : " · 進行中"}`),
    title: (w: Where, range: string) => (w.us ? zs(`iPhone 補貨報告，${range}`) : zs(`${w.name} iPhone 補貨報告，${range}`)),
    h1: (w: Where, range: string) => zs(`${w.name} iPhone 補貨，${range}這一週`),
    meta: (v: ReportView) =>
      zs(`${v.range}，${v.w.name} ${v.stores} 家${AS(v.w)}共 ${v.restocks} 次確認的 iPhone 補貨。最常補貨的門市與日子、最難買的規格，以及補貨多快賣完。`),
    answer: (v: ReportView) =>
      zs(
        `${v.complete ? "" : "本週到目前為止："}${v.w.name} ${v.stores} 家${AS(v.w)}共 ${v.restocks} 次確認補貨${v.change ? `，比前一週 ${v.change}` : ""}。${v.topStore ? `${v.topStore}最多，${v.topStoreN} 次。` : ""}${v.medianSell ? `一次 iPhone Duo 補貨通常撐 ${v.medianSell}。` : ""}`,
      ),
    partial: (days: number) => zs(`本週已追蹤 ${days} 天。`),
    running: "本週還沒結束；每次確認補貨，數字就跟著更新。",
    tiles: {
      restocks: "確認補貨",
      stores: "有補貨的門市",
      sell: "iPhone Duo 上架時間中位數",
      change: "與前一週相比",
    },
    countH2: "這一週補了幾次貨？",
    countLead: (v: ReportView) =>
      zs(`共 ${v.restocks} 次：iPhone Duo ${v.duo} 次、iPhone 18 Pro ${v.pro} 次、iPhone 18 Pro Max ${v.proMax} 次，涵蓋 ${v.configs} 種規格。`),
    storesH2: "哪些 Apple 門市補貨最多？",
    storesLead: (v: ReportView) => zs(v.topStore ? `${v.topStore}，${v.topStoreN} 次。前十名列在下方。` : "本週沒有門市補貨。"),
    storesHead: ["#", "Apple 門市", "補貨次數"],
    configsH2: "哪些 iPhone Duo 規格補回來了？",
    configsLead: (v: ReportView) =>
      zs(
        v.topConfig
          ? `${v.topConfig}補回最多次（${v.topConfigN}）。${v.lastConfig && v.lastConfig !== v.topConfig ? `${v.lastConfig}最少。` : ""}`
          : "本週沒有任何 iPhone Duo 規格補貨。",
      ),
    configsHead: ["規格", "補貨次數"],
    sellH2: "補貨多快賣完？",
    sellLead: (v: ReportView) =>
      zs(
        v.medianSell
          ? `一次 iPhone Duo 補貨通常撐 ${v.medianSell}；${v.within60}在一分鐘內就沒了（共 ${v.sellN} 次有計時的補貨）。`
          : "本週有計時的售完次數太少，無法判斷。",
      ),
    sellPrev: (v: ReportView) => zs(v.prevMedianSell ? `前一週：${v.prevMedianSell}。` : ""),
    daysH2: "哪幾天補貨最多？",
    daysLead: (v: ReportView) =>
      zs(v.busiestDay ? `${v.busiestDay}最多，${v.busiestDayN} 次${v.quietDay ? `；${v.quietDay}最少` : ""}。` : "還沒有補貨可以按日子分布。"),
    daysHead: ["日子", "補貨次數"],
    weekdays: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    prevH2: "和前一週比起來如何？",
    prevLead: (v: ReportView) =>
      zs(
        v.prevRestocks == null
          ? "沒有前一週的紀錄可以比較。"
          : v.change == null
            ? `前一週紀錄了 ${v.prevRestocks} 次。兩週都完整追蹤並結束後，才會顯示變化。`
            : v.changeDir === "up"
              ? `比較多：${v.restocks} 次，前一週 ${v.prevRestocks} 次（${v.change}）。`
              : v.changeDir === "down"
                ? `比較少：${v.restocks} 次，前一週 ${v.prevRestocks} 次（${v.change}）。`
                : `差不多：${v.restocks} 次，前一週 ${v.prevRestocks} 次。`,
      ),
    prevNote: "還沒結束的一週是拿部分天數和完整一週比；變化請等本週結束再看。",
    readH2: "這一週對想買的人代表什麼？",
    readPoints: (v: ReportView) =>
      [
        v.busiestDay ? `補貨集中在${v.busiestDay}：那一天整天都要開著通知。` : "每天都開著通知：補貨沒有固定時間表。",
        v.medianSell ? `上架時間通常只有 ${v.medianSell}，收到通知後幾秒內就要開始預約。` : "上架時間很短：收到通知後幾秒內就要動作。",
        v.topStore ? `${v.topStore}補貨最多；離你近的話，把它加進通知。` : "盯你到得了的門市；多盯一家附近門市，機會就多一倍。",
      ].map(zs),
    methodH2: "報告怎麼計算？",
    methodPoints: [
      "**補貨：**某家門市的某個規格從無法取貨變成可取貨，並經第二次檢查確認。第一次看到的不算。",
      "**一週：**該國主要時區的週一 00:00 到週日 24:00。",
      "**上架時間：**從確認補貨，到同一家門市、同一規格下一次確認售完為止。",
    ],
    archiveH2: "其他週",
    faq: (v: ReportView) => [
      {
        q: zs(`Apple 這週在${v.w.name}補了多少 iPhone？`),
        a: zs(`RestockWire 確認了 ${v.stores} 家門市共 ${v.restocks} 次補貨；每一次是某個規格在某家門市補回，不是台數。`),
      },
      { q: "Apple 會公布補貨數字嗎？", a: "不會。這些數字是 RestockWire 自己對 Apple 取貨庫存的確認觀察。" },
      { q: "新報告什麼時候發布？", a: "每週一開始新的一週；補貨一經確認就填入頁面，週日深夜結束。" },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "iPhone Duo 賣最快的 Apple Store" : zs(`${w.name}賣最快的 Apple 門市`)),
    h1: (w: Where) => zs(`${w.name}哪些 Apple 門市的 iPhone Duo 賣得最快？`),
    meta: (v: RankView) =>
      zs(`${v.w.name}${v.fastest ?? "最快的門市"}：iPhone Duo 補貨中位數 ${v.fastestSec ?? "幾秒"}就賣完。過去 ${v.days} 天每家上榜門市，以及哪裡還有機會。`),
    answer: (v: RankView) =>
      zs(
        v.fastest
          ? `${v.fastest}最快：一次 iPhone Duo 補貨通常 ${v.fastestSec}就賣完（過去 ${v.days} 天 ${v.fastestN} 次有計時的補貨）。${v.slowest ? `${v.slowest}則撐了 ${v.slowestSec}。` : ""}`
          : `過去 ${v.days} 天${v.w.name}有計時的售完次數太少，還無法排名。`,
      ),
    tiles: { fastest: "最快門市，上架時間中位數", slowest: "上榜最慢門市", ranked: "上榜門市", country: "全國中位數" },
    fastH2: "賣最快的門市",
    fastLead: (v: RankView) => zs(`過去 ${v.days} 天有 ${v.ranked} 家門市累積 ${v.minPairs} 次以上有計時的補貨。中位數最快的排前面。`),
    head: ["#", "Apple 門市", "上架時間中位數", "最快一次", "有計時的補貨", "補貨次數"],
    slowH2: "哪裡還有機會？",
    slowLead: (v: RankView) =>
      zs(v.slowest ? `表格最下方：${v.slowest}一次補貨通常撐 ${v.slowestSec}。上架越久，結帳時間越充裕。` : "資料還不夠。"),
    meansH2: "賣得快的門市對你代表什麼？",
    meansPoints: (v: RankView) =>
      [
        `中位數 ${v.fastestSec ?? "只有幾秒"}，沒時間慢慢挑：先把規格放進購物袋，Apple Pay 準備好。`,
        "再加一家附近賣得較慢的門市到通知：兩家門市，機會多一倍。",
        "賣得快反映的是門市周邊的需求，不是到貨多寡。",
      ].map(zs),
    methodH2: "排名怎麼算？",
    methodPoints: (v: RankView) =>
      [
        `**上架時間：**從確認補貨，到同一家門市同一規格下一次確認售完，只算 iPhone Duo，過去 ${v.days} 天。`,
        `**上榜門市：**至少 ${v.minPairs} 次有計時的補貨；次數太少，一次運氣好的補貨就能左右結果。`,
        "**誤差：**時間是到下一次檢查為止的上限（檢查間隔 5 秒到 15 秒）。",
      ].map(zs),
    faq: (v: RankView) => [
      {
        q: zs(`${v.w.name}哪家 Apple 門市最難買到 iPhone Duo？`),
        a: zs(v.fastest ? `${v.fastest}：補貨賣得最快，中位數 ${v.fastestSec}。` : "資料還不夠，無法判斷。"),
      },
      { q: "賣得快代表手機比較少嗎？", a: "不一定。多半代表等那家門市的人比較多。" },
      { q: "排名多久更新一次？", a: "每幾分鐘更新一次，統計過去 14 天。" },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store 對比：iPhone 補貨誰多" : zs(`${w.name} Apple 門市對比：iPhone 補貨`)),
    indexH1: (w: Where) => zs(`${w.name}同城兩家 Apple 門市：哪家補貨比較多？`),
    indexMeta: (w: Where) =>
      zs(`${w.name}相鄰 Apple 門市並排比較：過去 14 天的 iPhone 補貨、常見補貨時段、一次補貨撐多久，以及該盯哪一家。`),
    indexLead: (n: string) => zs(`共 ${n} 組對比，每組是一家門市和同城最近的另一家。`),
    title: (a: string, b: string) => zs(`${a} vs ${b}：誰補貨多？`),
    h1: (a: string, b: string) => zs(`${a}還是${b}：哪家 iPhone 補貨比較多？`),
    meta: (v: CompareView) =>
      zs(`${v.a.name}對比${v.b.name}，同在${v.city}、相距 ${v.distance}：過去 ${v.days} 天的 iPhone 補貨、常見時段、上架時間，以及該盯哪一家。`),
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name}和${v.b.name}補貨次數一樣多` : `${(v.more === "a" ? v.a : v.b).name}補貨比較多`;
      const nums = `（過去 ${v.days} 天 ${v.a.restocks} 次對 ${v.b.restocks} 次）`;
      const slow = v.slower ? `${(v.slower === "a" ? v.a : v.b).name}的補貨撐得比較久，結帳時間比較充裕。` : "";
      return zs(`${lead}${nums}。${slow}`);
    },
    tableCaption: (days: string) => zs(`並排比較，過去 ${days} 天`),
    rows: { restocks: "全部補貨", duo: "iPhone Duo 補貨", peak: "常見補貨時段（當地）", sell: "iPhone Duo 上架時間中位數", sellN: "有計時的補貨", last: "最近一次補貨" },
    none: "資料不足",
    moreH2: "哪家門市 iPhone 補貨比較多？",
    moreLead: (v: CompareView) =>
      zs(v.more === "tie" ? `一樣多：兩家都是 ${v.a.restocks} 次。` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `，是另一家的 ${v.ratio}` : ""}。`),
    hourH2: "兩家各在什麼時候補貨？",
    hourLead: (v: CompareView) =>
      zs(v.a.peak && v.b.peak ? `${v.a.name}最常在${v.a.peak}前後；${v.b.name}在${v.b.peak}前後。` : "其中一家補貨次數太少，還說不出常見時段。"),
    sellH2: "哪家的補貨撐得比較久？",
    sellLead: (v: CompareView) =>
      zs(
        v.slower
          ? `${(v.slower === "a" ? v.a : v.b).name}：${(v.slower === "a" ? v.a : v.b).medianSell}，另一家 ${(v.slower === "a" ? v.b : v.a).medianSell}。`
          : "目前還看不出明顯差別：有計時的售完次數太少，或兩家的中位數相差不到 15%。",
      ),
    pickH2: "該盯哪一家？",
    pickPoints: (v: CompareView) =>
      [
        `兩家都盯：相距 ${v.distance}，一個通知方案就能涵蓋好幾家門市。`,
        v.more !== "tie" ? `只能去一家的話，${(v.more === "a" ? v.a : v.b).name}補貨比較頻繁。` : "只能去一家的話，選近的：兩家補貨次數相當。",
        v.slower ? `${(v.slower === "a" ? v.a : v.b).name}每次補貨給你多幾秒。` : "從上架時間還看不出哪家勝出。",
      ].map(zs),
    methodH2: "這些數字從哪裡來？",
    methodPoints: (v: CompareView) =>
      [
        `RestockWire 過去 ${v.days} 天在兩家門市確認的補貨；第二次檢查確認後才算一次。`,
        "常見時段至少要 5 次補貨、分布在 3 天以上才會寫出來。",
        "上架時間是到下一次檢查為止的上限，只算 iPhone Duo。",
      ].map(zs),
    storePages: "門市頁面",
    otherPairs: "更多對比",
    faq: (v: CompareView) => [
      {
        q: zs(`${v.a.name}和${v.b.name}，哪家比較適合取 iPhone Duo？`),
        a: zs(
          v.more === "tie"
            ? "過去 14 天兩家補貨一樣頻繁；選近的，或兩家都盯。"
            : `過去 14 天${(v.more === "a" ? v.a : v.b).name}補貨比較頻繁。`,
        ),
      },
      { q: "可以同時盯兩家門市嗎？", a: "可以，設兩則通知就行：一則通知 = 一家門市加一種規格，所以兩家門市會用掉方案裡的兩則通知。" },
      { q: "兩家門市會同時補貨嗎？", a: "通常不會。每家門市各自到貨；可以比較上方的常見時段。" },
    ],
  },

  guides: {
    watch: {
      title: "在 Apple Watch 收 iPhone 補貨通知",
      h1: "怎麼在 Apple Watch 上收到 iPhone 補貨通知？",
      meta: "把 RestockWire 補貨通知送到手腕：加入主畫面、開啟通知、在 Watch App 保持鏡像輸出，以及哪些設定會讓通知改跳到 iPhone。",
      answer: (live: string | null) =>
        zs(
          `把 RestockWire 加入 iPhone 主畫面、開啟通知，並在 Watch App 保持鏡像輸出：iPhone 鎖定時，通知就會送到 Apple Watch。${live ? `補貨中位數只撐 ${live}，手腕一震，就省下找手機的那幾秒。` : ""}`,
        ),
      sections: [
        {
          h2: "需要先準備什麼？",
          lead: "一支 iOS 16.4 以上的 iPhone，已把 RestockWire 加入主畫面並允許通知。",
          points: [
            "用 Safari 打開 restockwire.com，點「分享」，再點「加入主畫面」。",
            "從主畫面打開 RestockWire，登入後點「開啟通知」。",
            "在提示中點「允許」。之後網頁 App 的通知就和一般 App 一樣，會出現在鎖定畫面與通知中心。",
          ],
        },
        {
          h2: "通知怎麼送到手錶？",
          lead: "靠鏡像輸出：Apple 每則通知只送一台裝置，iPhone 鎖定或休眠時就送到手錶。",
          points: [
            "iPhone 已解鎖、正在使用：通知顯示在 iPhone，不在手錶。",
            "iPhone 鎖定或休眠，手錶戴在手上且已解鎖：通知送到手錶。",
            "手錶鎖定或開了勿擾模式：通知改送到 iPhone。",
          ],
        },
        {
          h2: "要檢查哪些 Watch 設定？",
          lead: "兩項：RestockWire 的鏡像輸出，以及手腕放下時是否顯示通知。",
          points: [
            "在 iPhone 打開 Watch App，點「通知」，往下看「鏡像輸出 iPhone 提示」（Mirror iPhone Alerts From）。有列出 RestockWire 的話，保持開啟。",
            "通知會在抬起手腕時顯示。想不抬手腕也看到，打開「手腕放下時顯示通知」（Show Notifications on Wrist Down）。",
            "低耗電模式會關閉常亮顯示，可能要抬起手腕才看得到通知。",
          ],
        },
        {
          h2: "手腕震動時該做什麼？",
          lead: "幾秒內在 iPhone 上動作：預約本身是在 apple.com 完成。",
          points: [
            "在手錶上看門市和規格，然後解鎖 iPhone。",
            "在 iPhone 上點通知，打開門市頁面與 Apple 連結。",
            "在 apple.com 先設好 Apple Pay，結帳只要點幾下。",
          ],
        },
      ],
      faq: [
        { q: "RestockWire 通知能在 Apple Watch 上收到嗎？", a: "可以。主畫面網頁 App 的通知會像一般 App 一樣出現在配對的 Apple Watch 上。" },
        { q: "為什麼通知跳在 iPhone 而不是手錶？", a: "因為當時 iPhone 已解鎖，或手錶鎖定、開了勿擾模式；這時 Apple 會送到 iPhone。" },
        { q: "需要另外裝手錶 App 嗎？", a: "不用。手錶顯示的是 iPhone 收到的通知，手錶上不用裝任何東西。" },
      ],
      sources: [
        { label: "WebKit：iOS 與 iPadOS 網頁 App 的 Web Push", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple 支援：Apple Watch 上的通知", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch 使用手冊：管理通知", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "開專注模式也不漏掉 iPhone 補貨通知",
      h1: "怎麼讓補貨通知穿過專注模式和排程摘要？",
      meta: "讓 RestockWire 補貨通知穿過專注模式、不被排程摘要攔下，並設定成有聲音、顯示在鎖定畫面。iOS 16.4 以上逐步教學。",
      answer: (live: string | null) =>
        zs(
          `把 RestockWire 加進每個專注模式的允許 App，並把通知設為「立即傳送」：開著專注模式，補貨通知照樣會響。${live ? `補貨中位數只撐 ${live}，被留到摘要裡的通知就是太晚的通知。` : ""}`,
        ),
      sections: [
        {
          h2: "怎麼在專注模式裡允許 RestockWire？",
          lead: "打開「設定」>「專注模式」，選一個模式，點「App」，在允許通知的 App 裡加入 RestockWire。",
          points: [
            "Apple 允許專注模式針對你加入主畫面的特定網頁 App 允許或靜音通知。",
            "你用的每個專注模式都要設一次：「睡眠」「工作」「個人」和你自己建立的模式。",
            "同名網頁 App 的專注模式設定會同步到你其他 Apple 裝置。",
          ],
        },
        {
          h2: "怎麼不讓通知進排程摘要？",
          lead: "在摘要清單裡不要勾 RestockWire，或把它的傳送方式設為立即。",
          points: [
            "「設定」>「通知」>「排程摘要」：A 到 Z 的清單決定哪些 App 會被留到摘要裡。",
            "或「設定」>「通知」> RestockWire >「通知傳送方式」>「立即傳送」。",
            "被留到早上 8 點摘要的補貨，那時早就賣完了。",
          ],
        },
        {
          h2: "哪些通知設定最重要？",
          lead: "「允許通知」打開，「鎖定畫面」和「橫幅」打開，「聲音」打開。",
          points: [
            "橫幅樣式選「持續」，通知會留在螢幕上直到你處理。",
            "「顯示預覽」設成「解鎖時」，鎖定畫面上就看不到門市和規格；想一眼看到就選「永遠」。",
            "Apple 沒有為網頁 App 通知提供「時效性通知」等級的說明，別指望它穿過專注模式：靠的是允許清單。",
          ],
        },
        {
          h2: "怎麼測試？",
          lead: "開著專注模式，從 RestockWire 帳號送一則測試通知給自己。",
          points: [
            "從主畫面打開 RestockWire，進入帳號，點「傳送測試通知」。",
            "打開你最常用的專注模式，再送一次。",
            "如果沒聲音或沒收到，重新檢查專注模式的允許清單和傳送方式設定。",
          ],
        },
      ],
      faq: [
        { q: "專注模式會擋掉 RestockWire 通知嗎？", a: "會，除非 RestockWire 在那個專注模式的允許清單裡。每個專注模式加一次就好。" },
        { q: "RestockWire 能送「時效性通知」嗎？", a: "Apple 沒有為網頁 App 推播提供這個等級的說明，所以 RestockWire 改靠專注模式的允許清單。" },
        { q: "為什麼通知早上一次整批出現？", a: "是排程摘要把它們留住了。把 RestockWire 設為「立即傳送」。" },
      ],
      sources: [
        { label: "iPhone 使用手冊：在專注模式中允許或靜音通知", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone 使用手冊：更改通知設定", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit：iOS 與 iPadOS 網頁 App 的 Web Push", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "用 Android 與 Wear OS 收 iPhone 補貨通知",
      h1: "Android 手機或 Wear OS 手錶能收 iPhone 補貨通知嗎？",
      meta: "用 Android 手機等 iPhone 補貨？RestockWire 通知在 Chrome 裡就能用，不必安裝任何東西，也會送到配對的 Wear OS 或 Galaxy 手錶。",
      answer: (live: string | null) =>
        zs(
          `可以。在 Android 的 Chrome 打開 RestockWire、登入，Chrome 詢問時允許通知；之後通知就像一般 App 一樣送達，也能轉到配對的手錶。${live ? `上架中位數只有 ${live}，通知音量要開大。` : ""}`,
        ),
      sections: [
        {
          h2: "怎麼在 Chrome 開啟通知？",
          lead: "在 Chrome 登入 restockwire.com，網站要求傳送通知時點「允許」。",
          points: [
            "不用安裝：網站要通知你時，Chrome 會詢問權限。",
            "之前點過「封鎖」的話，從網址列打開網站設定，改成允許通知。",
            "在 Android 上把 RestockWire 加到主畫面是選擇性的，只是讓網站有自己的圖示。",
          ],
        },
        {
          h2: "通知會送到 Wear OS 或 Galaxy 手錶嗎？",
          lead: "通常會：手機通知預設會轉到配對的 Wear OS 手錶。",
          points: [
            "RestockWire 的通知由 Chrome 發出，所以手錶上會列在 Chrome 底下。",
            "Galaxy Watch：打開 Galaxy Wearable >「手錶設定」>「通知」>「應用程式通知」（Watch settings > Notifications > App notifications），保持 Chrome 開啟。",
            "如果通知停了，檢查省電設定有沒有限制 Chrome 在背景執行。",
          ],
        },
        {
          h2: "筆電呢？",
          lead: "電腦上的 Chrome、Edge 與 Firefox，只要瀏覽器開著，也能顯示同樣的通知。",
          points: [
            "在你最常開著的瀏覽器登入並允許通知。",
            "每台開啟通知的裝置都會收到每一則通知。",
            "沒有任何裝置開啟通知時，RestockWire 改用 Email 寄送通知。",
          ],
        },
      ],
      faq: [
        { q: "用 RestockWire 一定要有 iPhone 嗎？", a: "不用。任何瀏覽器支援網頁通知的手機或電腦都能收到通知。" },
        { q: "為什麼手錶把通知列在 Chrome 底下？", a: "在 Android 上，網站通知由 Chrome 送出，所以手錶把它們歸在 Chrome。" },
        { q: "可以在兩支手機上收通知嗎？", a: "可以。每支都登入並允許通知；每台裝置都會收到每一則通知。" },
      ],
      sources: [
        { label: "Google Chrome 說明：使用通知", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers：Wear OS 上的通知", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung：管理 Galaxy Watch 的通知", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "更多手機通知教學",
  },
};
