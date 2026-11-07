/**
 * 繁體中文（香港）: insight — Apple 取貨狀態、每週補貨報告、清貨最快的 Apple Store、分店對比，以及三篇手機提醒教學。
 * Numbers, seconds, dates, store and country names arrive formatted; `w.in` is just the country name here, so every
 * sentence builds its own wording around `w.name`. Only 15 秒 / 5 秒 intervals; no refunds. iOS labels follow Apple's
 * Hong Kong (zh-HK) wording; where unsure, the English label follows once in parentheses.
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";

const at = (w: Where) => (w.us ? "美國" : w.name);

export const insight: InsightDict = {
  nav: {
    status: "Apple 取貨狀態",
    reports: "每週補貨報告",
    fastest: "清貨最快的 Apple Store",
    compare: "分店對比",
    guides: "手機提醒教學",
    otherCountries: "其他國家或地區的同一頁",
    updated: (when: string) => `更新於 ${when}`,
    sources: "來源與計法",
    cite: "引用這些數字？請附上本頁連結作來源。",
    alertCta: "設定補貨提醒",
    logCta: "打開補貨紀錄",
  },

  status: {
    title: (w: Where) => (w.us ? "Apple Store 取貨查詢壞了嗎？美國即時狀態" : `${w.name} Apple Store 取貨即時狀態`),
    h1: (w: Where) => (w.us ? "Apple 店內取貨查詢此刻正常嗎？" : `${w.name}的 Apple 店內取貨查詢此刻正常嗎？`),
    meta: (v: StatusView) =>
      `即時：過去一分鐘，${at(v.w)} ${v.stores} 間 Apple Store 中有 ${v.answered} 間回應了取貨查詢。附失敗率、過去一日的不穩時段，以及查詢卡住時該怎樣做。`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `正常。過去一分鐘，${at(v.w)} ${v.stores} 間 Apple Store 中有 ${v.answered} 間回應取貨查詢；過去一小時失敗的請求佔 ${v.failLastHour}。`
        : v.verdict === "slow"
          ? `部分正常。過去一分鐘，${at(v.w)} ${v.stores} 間 Apple Store 中有 ${v.answered} 間回應；過去一小時失敗佔 ${v.failLastHour}，部分存貨可能遲一點才顯示。`
          : v.verdict === "down"
            ? `此刻不正常。過去一分鐘，${at(v.w)} ${v.stores} 間 Apple Store 只有 ${v.answered} 間回應。恢復之前，apple.com 和本站顯示的存貨可能已過時。`
            : `RestockWire 此刻讀不到${at(v.w)}的狀態，請一分鐘後再重新載入。`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "正常", slow: "緩慢", down: "無回應", unknown: "未知" })[v],
    tiles: {
      answered: "過去一分鐘有回應的分店",
      age: "各分店最新一次檢查的中位數時距",
      failHour: "失敗請求，過去 60 分鐘",
      failDay: "失敗請求，過去 24 小時",
    },
    nowH2: "RestockWire 此刻見到甚麼？",
    nowLead: (v: StatusView) =>
      `${v.stores} 間分店中，${v.answered} 間在過去一分鐘內有回應${v.age ? `；一間普通分店上次讀取在 ${v.age}前` : ""}。`,
    nowPoints: (v: StatusView) => [
      `${at(v.w)}每間 Apple Store 每 15 秒讀取一輪；設有提醒的分店每 5 秒一次。`,
      v.oldest ? `等得最久的分店，上次回應在 ${v.oldest}前。` : "這段時間內暫時未有分店回應。",
      Number(v.never) > 0 ? `${v.never} 間分店從未回應：Apple 目前沒有為這些分店提供取貨查詢。` : "每間分店都至少回應過一次。",
    ],
    dayH2: "過去 24 小時情況如何？",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `平穩：過去 24 小時沒有一小時的失敗請求達 5% 或以上（全日共 ${v.failDay}）。`
        : `過去 24 小時有 ${v.roughHours} 個不穩時段，每小時失敗請求達 5% 或以上：${v.roughList}。全日失敗共 ${v.failDay}。`,
    hourCaption: (zone: string) => `每小時請求與失敗次數，過去 24 小時（${zone}）`,
    hourHead: ["鐘點", "請求", "失敗", "失敗比例"],
    whyH2: "為何 apple.com 顯示每間分店都無貨？",
    whyLead: "通常是因為該配置賣清了；有時是 Apple 的查詢本身出問題。",
    whyPoints: [
      "**賣清：**查詢正常回應，只是沒有分店可提取。本頁保持綠色。",
      "**查詢故障：**所有分店同時失敗或回應空白。本頁會在一分鐘內轉為琥珀色或紅色。",
      "**你的頁面：**開了很久的 apple.com 分頁可能仍顯示舊結果。信它之前，先重新載入購物袋頁面。",
    ],
    doH2: "取貨查詢卡住時該怎樣做？",
    doLead: "提醒保持開啟，等就可以。查詢會自行恢復，期間出現的補貨一樣會被確認。",
    doSteps: [
      "提醒不用關：RestockWire 會繼續查詢，補貨一經確認就通知你。",
      "不要每幾秒刷新 apple.com：這不會令 Apple 的查詢變快。",
      "五分鐘後再看本頁。目前見過的不穩時段，由幾分鐘到約兩小時不等。",
      "轉回綠色後，打開你那間分店的頁面：補貨紀錄會列出空檔期間出現的補貨。",
    ],
    methodH2: "狀態怎樣計算？",
    methodPoints: [
      "**新鮮度：**每間分店最新一次成功檢查的時間，來自 RestockWire 自己的取貨查詢。",
      "**失敗：**負責這個國家或地區的檢查輪次中，每小時失敗的請求，由我們的輪詢主機記錄。",
      "**判定：**正常 = 九成分店在過去一分鐘內回應，且失敗低於 5%；無回應 = 回應的分店不足一半。",
    ],
    otherH2: "其他國家或地區的取貨狀態",
    faq: (v: StatusView) => [
      { q: "apple.com 店內取貨是不是壞了？", a: v.verdict === "ok" ? `${at(v.w)}此刻沒有：過去一分鐘 ${v.stores} 間分店中有 ${v.answered} 間回應。` : `${at(v.w)}此刻不太穩定：過去一分鐘 ${v.stores} 間分店中有 ${v.answered} 間回應。` },
      { q: "紅色是否代表 iPhone 賣清了？", a: "不是。紅色代表 Apple 的查詢出錯；賣清是正常回應，狀態仍是綠色。" },
      { q: "本頁多久更新一次？", a: "每次打開都讀取最新數字，最多是 30 秒前的數據。" },
      { q: "查詢故障期間會不會錯過補貨？", a: "可能遲一點才見到。查詢一恢復，RestockWire 便會確認每次補貨並即時通知你。" },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "美國 Apple Store 每週 iPhone 補貨報告" : `${w.name}每週 iPhone 補貨報告`),
    indexH1: (w: Where) => (w.us ? "每週 iPhone 補貨報告" : `${w.name}每週 iPhone 補貨報告`),
    indexMeta: (w: Where) => `${at(w)} Apple Store 每一週的 iPhone Duo、18 Pro 及 18 Pro Max 補貨：次數、最多補貨的分店、配置與清貨速度，逐週列出。`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `${at(w)}一週累積 ${"20"} 次確認補貨後，第一份報告便會出現。` : `${at(w)}已存檔 ${n} 週。每一期是 RestockWire 一個星期（星期一至星期日，當地時間）的確認補貨紀錄。`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} 次補貨${complete ? "" : " · 暫計"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone 補貨報告，${range}` : `${w.name} iPhone 補貨報告，${range}`),
    h1: (w: Where, range: string) => `${at(w)} iPhone 補貨，${range}這一週`,
    meta: (v: ReportView) => `${v.range}，${at(v.w)} ${v.stores} 間 Apple Store 共 ${v.restocks} 次確認 iPhone 補貨。最多補貨的分店、最忙的一日、最難買的配置，以及多快賣清。`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "本週暫計："}${at(v.w)} ${v.stores} 間 Apple Store 共 ${v.restocks} 次確認補貨${v.change ? `，比上一週 ${v.change}` : ""}。${v.topStore ? `${v.topStore}最多，有 ${v.topStoreN} 次。` : ""}${v.medianSell ? `一次普通的 iPhone Duo 補貨上架 ${v.medianSell}。` : ""}`,
    partial: (days: number) => `本週只追蹤了 ${days} 日。`,
    running: "本週仍未完結；每確認一次補貨，數字便會更新。",
    tiles: {
      restocks: "確認補貨",
      stores: "有補貨的分店",
      sell: "iPhone Duo 上架時間中位數",
      change: "對比上一週",
    },
    countH2: "這一週補貨多少次？",
    countLead: (v: ReportView) => `共 ${v.restocks} 次：iPhone Duo ${v.duo} 次、iPhone 18 Pro ${v.pro} 次、iPhone 18 Pro Max ${v.proMax} 次，涉及 ${v.configs} 款配置。`,
    storesH2: "哪些 Apple Store 補貨最多？",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}，共 ${v.topStoreN} 次。頭十名見下表。` : "本週沒有分店補貨。"),
    storesHead: ["#", "Apple Store", "補貨次數"],
    configsH2: "哪些 iPhone Duo 配置有補貨？",
    configsLead: (v: ReportView) =>
      v.topConfig ? `${v.topConfig}補貨最多（${v.topConfigN} 次）。${v.lastConfig && v.lastConfig !== v.topConfig ? `${v.lastConfig}最少。` : ""}` : "本週沒有 iPhone Duo 配置補貨。",
    configsHead: ["配置", "補貨次數"],
    sellH2: "補貨多快賣清？",
    sellLead: (v: ReportView) =>
      v.medianSell ? `一次普通的 iPhone Duo 補貨上架 ${v.medianSell}；${v.within60} 在一分鐘內賣清（計時補貨 ${v.sellN} 次）。` : "本週有計時的清貨太少，未能下結論。",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `上一週：${v.prevMedianSell}。` : ""),
    daysH2: "哪幾日最忙？",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}，共 ${v.busiestDayN} 次補貨${v.quietDay ? `；${v.quietDay}最靜` : ""}。` : "暫時未有補貨可按日分佈。"),
    daysHead: ["日子", "補貨次數"],
    weekdays: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    prevH2: "與上一週相比如何？",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "未有上一週的紀錄可作比較。" : v.change == null ? `上一週錄得 ${v.prevRestocks} 次。兩週都完結並完整追蹤後，才會顯示變化。` : v.changeDir === "up" ? `較忙：${v.restocks} 次補貨，上一週 ${v.prevRestocks} 次（${v.change}）。` : v.changeDir === "down" ? `較靜：${v.restocks} 次補貨，上一週 ${v.prevRestocks} 次（${v.change}）。` : `差不多：${v.restocks} 次，上一週 ${v.prevRestocks} 次。`,
    prevNote: "未完結的一週是拿半週與整週比較；變化要等這一週結束才好看。",
    readH2: "這一週對想買機的你有何意義？",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `補貨集中在${v.busiestDay}：那一日全日保持提醒開啟。` : "每日都保持提醒開啟：補貨沒有固定時間表。",
      v.medianSell ? `普通一次上架只有 ${v.medianSell}，收到提醒後幾秒內就要開始預約。` : "上架時間很短：收到提醒後幾秒內就要行動。",
      v.topStore ? `${v.topStore}補貨最多；如果就在你附近，把它加入提醒。` : "盯緊你去得到的分店；多加一間附近分店，機會就多一倍。",
    ],
    methodH2: "報告怎樣計算？",
    methodPoints: [
      "**補貨：**某分店的某款配置由無貨轉為有貨，並經第二次檢查確認。首次發現的存貨不計。",
      "**一週：**以該國家或地區主要時區計，星期一 00:00 至星期日 24:00。",
      "**上架時間：**由確認補貨，到同一分店同一配置下一次確認賣清為止。",
    ],
    archiveH2: "其他週份",
    faq: (v: ReportView) => [
      { q: `Apple 本週在${at(v.w)}補了多少部 iPhone？`, a: `RestockWire 在 ${v.stores} 間分店確認了 ${v.restocks} 次補貨；每次是一款配置在一間分店重新有貨，不是部數。` },
      { q: "Apple 會公佈補貨數字嗎？", a: "不會。這些數字是 RestockWire 自己對 Apple 取貨存貨的確認觀察。" },
      { q: "新報告何時發佈？", a: "每逢星期一開始新一週；頁面隨確認補貨逐步填上，星期日晚上截止。" },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "iPhone Duo 清貨最快的 Apple Store" : `${w.name}清貨最快的 Apple Store`),
    h1: (w: Where) => `${at(w)}哪些 Apple Store 的 iPhone Duo 賣清得最快？`,
    meta: (v: RankView) => `${at(v.w)}${v.fastest ?? "最快的分店"}：iPhone Duo 補貨中位數 ${v.fastestSec ?? "幾秒"}便賣清。過去 ${v.days} 日每間上榜分店，以及哪裏你仍有機會。`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest}最快：一次普通的 iPhone Duo 補貨 ${v.fastestSec} 便賣清（計時補貨 ${v.fastestN} 次，過去 ${v.days} 日）。${v.slowest ? `${v.slowest}則可上架 ${v.slowestSec}。` : ""}`
        : `過去 ${v.days} 日${at(v.w)}有計時的清貨太少，暫時未能排名。`,
    tiles: { fastest: "最快分店，上架時間中位數", slowest: "上榜最慢的分店", ranked: "上榜分店", country: "全國或全地區中位數" },
    fastH2: "清貨最快的分店",
    fastLead: (v: RankView) => `過去 ${v.days} 日，${v.ranked} 間分店有 ${v.minPairs} 次或以上計時補貨。中位數最快的排先。`,
    head: ["#", "Apple Store", "上架中位數", "最快", "計時補貨", "補貨次數"],
    slowH2: "哪裏你仍有機會？",
    slowLead: (v: RankView) => (v.slowest ? `排在表尾：${v.slowest}一次普通補貨可上架 ${v.slowestSec}。上架越久，結帳時間越充裕。` : "數據暫時不足。"),
    meansH2: "分店清貨快，對你有何影響？",
    meansPoints: (v: RankView) => [
      `中位數只有 ${v.fastestSec ?? "幾秒"}，沒時間慢慢揀：先把配置放入購物袋，Apple Pay 準備好。`,
      "把附近一間較慢的分店加入提醒：兩間分店，機會多一倍。",
      "快慢反映分店附近的需求，不是到貨多少。",
    ],
    methodH2: "排名怎樣得出？",
    methodPoints: (v: RankView) => [
      `**上架時間：**由確認補貨，到同一分店同一配置下一次確認賣清為止；只計 iPhone Duo，過去 ${v.days} 日。`,
      `**上榜分店：**計時補貨 ${v.minPairs} 次或以上；少於此數，一次幸運補貨便足以左右排名。`,
      "**上限：**時間是到下一次檢查為止的上限值（檢查相隔 5 至 15 秒）。",
    ],
    faq: (v: RankView) => [
      { q: `${at(v.w)}哪間 Apple Store 最難買到 iPhone Duo？`, a: v.fastest ? `${v.fastest}：補貨賣清得最快，中位數 ${v.fastestSec}。` : "數據暫時不足，未能回答。" },
      { q: "賣清得快，是否代表貨少？", a: "不一定。多數只代表等那間分店的人更多。" },
      { q: "排名多久更新一次？", a: "每幾分鐘更新一次，涵蓋過去 14 日。" },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store 對 Apple Store：iPhone 補貨比較" : `${w.name} Apple Store 對比：iPhone 補貨`),
    indexH1: (w: Where) => `${at(w)}同一城市的兩間 Apple Store：哪間補貨較多？`,
    indexMeta: (w: Where) => `${at(w)}相鄰的 Apple Store 並排比較：過去 14 日的 iPhone 補貨、慣常鐘點、每次上架多久，以及該盯哪一間。`,
    indexLead: (n: string) => `共 ${n} 組對比，每組是一間分店與同城最近的另一間。`,
    title: (a: string, b: string) => `${a}對${b}：哪間補貨較多？`,
    h1: (a: string, b: string) => `${a}還是${b}：哪間 iPhone 補貨較多？`,
    meta: (v: CompareView) => `${v.a.name}對${v.b.name}，同在${v.city}、相距 ${v.distance}：過去 ${v.days} 日的 iPhone 補貨、慣常鐘點、上架時間，以及該盯哪一間。`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name}與${v.b.name}補貨次數相同` : `${(v.more === "a" ? v.a : v.b).name}補貨較多`;
      const nums = `（過去 ${v.days} 日 ${v.a.restocks} 次對 ${v.b.restocks} 次）`;
      const slow = v.slower ? `${(v.slower === "a" ? v.a : v.b).name}的補貨上架較久，結帳時間較充裕。` : "";
      return `${lead}${nums}。${slow}`;
    },
    tableCaption: (days: string) => `並排比較，過去 ${days} 日`,
    rows: { restocks: "全部補貨", duo: "iPhone Duo 補貨", peak: "慣常補貨鐘點（當地）", sell: "iPhone Duo 上架中位數", sellN: "計時補貨", last: "最近一次補貨" },
    none: "數據不足",
    moreH2: "哪間分店 iPhone 補貨較多？",
    moreLead: (v: CompareView) => (v.more === "tie" ? `不分高下：兩間都是 ${v.a.restocks} 次。` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `，次數是另一間的 ${v.ratio}` : ""}。`),
    hourH2: "兩間各在甚麼鐘點補貨？",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name}多數在 ${v.a.peak}前後；${v.b.name}在 ${v.b.peak}前後。` : "其中一間補貨次數太少，暫時說不出慣常鐘點。",
    sellH2: "哪間補貨上架較久？",
    sellLead: (v: CompareView) =>
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name}：${(v.slower === "a" ? v.a : v.b).medianSell}，另一間 ${(v.slower === "a" ? v.b : v.a).medianSell}。` : "暫時看不出明顯分別：有計時的清貨太少，或兩間的中位數相差不足 15%。",
    pickH2: "該盯哪一間？",
    pickPoints: (v: CompareView) => [
      `兩間都盯：相距只有 ${v.distance}，一個提醒方案可涵蓋多間分店。`,
      v.more !== "tie" ? `如果只去得到一間，${(v.more === "a" ? v.a : v.b).name}補貨較頻密。` : "如果只去得到一間，揀較近那間：兩間補貨次數一樣。",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name}每次補貨給你多幾秒。` : "上架時間暫時未分高下。",
    ],
    methodH2: "這些數字從何而來？",
    methodPoints: (v: CompareView) => [
      `RestockWire 過去 ${v.days} 日在兩間分店的確認補貨；第二次檢查確認後才計一次補貨。`,
      "至少 5 次補貨、分佈在 3 日，才會說出慣常鐘點。",
      "上架時間是到下一次檢查為止的上限值，只計 iPhone Duo。",
    ],
    storePages: "分店頁面",
    otherPairs: "更多對比",
    faq: (v: CompareView) => [
      { q: `${v.a.name}還是${v.b.name}較適合提取 iPhone Duo？`, a: v.more === "tie" ? "過去 14 日兩間補貨次數一樣；揀較近那間，或者兩間都盯。" : `過去 14 日${(v.more === "a" ? v.a : v.b).name}補貨較頻密。` },
      { q: "可以同時盯兩間分店嗎？", a: "可以，設兩個提醒便行。一個提醒是一間分店加一款配置，所以兩間分店會用掉方案中的兩個提醒。" },
      { q: "兩間分店會同時補貨嗎？", a: "通常不會。每間分店各自到貨；可對比上面的慣常鐘點。" },
    ],
  },

  guides: {
    watch: {
      title: "Apple Watch 收 iPhone 補貨提醒：設定教學",
      h1: "怎樣在 Apple Watch 上收到 iPhone 補貨提醒？",
      meta: "把 RestockWire 的補貨提醒戴在手腕上：加至主畫面、開啟通知、在 Watch App 保持鏡像輸出，以及哪些設定會令提醒改送到 iPhone。",
      answer: (live: string | null) =>
        `在 iPhone 把 RestockWire 加至主畫面、開啟它的通知，並在 Watch App 保持鏡像輸出：iPhone 鎖定時，提醒便會送到 Apple Watch。${live ? `補貨上架中位數只有 ${live}，手腕一震，省下找手機的幾秒。` : ""}`,
      sections: [
        {
          h2: "先要準備甚麼？",
          lead: "一部 iOS 16.4 或以上的 iPhone，已把 RestockWire 加至主畫面並允許通知。",
          points: [
            "用 Safari 打開 restockwire.com，點「分享」，再點「加至主畫面」。",
            "從主畫面打開 RestockWire，登入後點「開啟通知」。",
            "在彈出視窗按「允許」。之後網頁 App 的通知與一般 App 無異，會出現在鎖定畫面和通知中心。",
          ],
        },
        {
          h2: "提醒怎樣送到手錶？",
          lead: "靠鏡像輸出：Apple 每則通知只送到一部裝置；iPhone 鎖定或休眠時，就送到手錶。",
          points: [
            "iPhone 已解鎖並正在使用：提醒顯示在 iPhone，不在手錶。",
            "iPhone 鎖定或休眠，手錶戴在手上且已解鎖：提醒送到手錶。",
            "手錶鎖定或開了「請勿打擾」：提醒改送到 iPhone。",
          ],
        },
        {
          h2: "要檢查哪些 Watch 設定？",
          lead: "兩項：RestockWire 的鏡像輸出，以及手腕垂下時會否顯示提醒。",
          points: [
            "在 iPhone 打開 Watch App，點「通知」，查看「鏡像輸出 iPhone 提示」（Mirror iPhone Alerts From）之下。如列出 RestockWire，保持開啟。",
            "通知在你提起手腕時顯示。如想不提手腕也看到，開啟「手腕垂下時顯示通知」（Show Notifications on Wrist Down）。",
            "「低耗電模式」會關掉常亮顯示，你可能要提起手腕才看到提醒。",
          ],
        },
        {
          h2: "手腕收到提醒後該怎樣做？",
          lead: "幾秒內在 iPhone 上行動：預約本身要在 apple.com 完成。",
          points: [
            "在手錶看清分店和配置，然後解鎖 iPhone。",
            "在 iPhone 點提醒，打開分店頁面和 Apple 連結。",
            "預先在 apple.com 設好 Apple Pay，結帳只需點兩三下。",
          ],
        },
      ],
      faq: [
        { q: "RestockWire 的提醒可以在 Apple Watch 上收到嗎？", a: "可以。主畫面網頁 App 的通知，會像其他 App 一樣出現在已配對的 Apple Watch。" },
        { q: "為何提醒出現在 iPhone 而不是手錶？", a: "當時 iPhone 已解鎖，或手錶鎖定、開了「請勿打擾」；這時 Apple 會送到 iPhone。" },
        { q: "需要另裝手錶 App 嗎？", a: "不用。手錶顯示 iPhone 收到的提醒，手錶上不用安裝任何東西。" },
      ],
      sources: [
        { label: "WebKit：iOS 與 iPadOS 網頁 App 的 Web Push", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple 支援：Apple Watch 上的通知", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch 使用手冊：管理通知", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "開了專注模式也不錯過 iPhone 補貨提醒",
      h1: "怎樣令補貨提醒穿過專注模式和定時摘要？",
      meta: "讓 RestockWire 的補貨提醒穿過專注模式、不被收進定時摘要，並在鎖定畫面響鬧及顯示。逐步教學，適用於 iOS 16.4 或以上。",
      answer: (live: string | null) =>
        `把 RestockWire 加入每個專注模式的允許 App，並把它的通知設為「即時傳送」：開著專注模式，補貨提醒照樣會響。${live ? `補貨上架中位數是 ${live}，被留到摘要才送的提醒，到時已經太遲。` : ""}`,
      sections: [
        {
          h2: "怎樣在專注模式中允許 RestockWire？",
          lead: "在「設定」打開「專注模式」，揀一個模式，點「App」，在「允許以下來源的通知」加入 RestockWire。",
          points: [
            "Apple 容許專注模式對你加至主畫面的指定網頁 App 允許或靜音通知。",
            "你用的每個專注模式都要做一次：睡眠、工作、個人，以及你自設的模式。",
            "同名網頁 App 的專注模式設定，會同步到你其他 Apple 裝置。",
          ],
        },
        {
          h2: "怎樣避免提醒被收進定時摘要？",
          lead: "在摘要清單中不要勾選 RestockWire，或把它的傳送方式設為即時。",
          points: [
            "「設定」>「通知」>「定時摘要」（Scheduled Summary）：A 至 Z 清單決定哪些 App 留待摘要。",
            "或「設定」>「通知」> RestockWire >「通知傳送方式」>「即時傳送」。",
            "被留到早上 8 時摘要的補貨，到時早已賣清。",
          ],
        },
        {
          h2: "哪些通知設定最重要？",
          lead: "「允許通知」開啟，「鎖定畫面」和「橫額」開啟，「聲音」開啟。",
          points: [
            "橫額樣式選「持續」，提醒會留在畫面上直到你處理。",
            "「顯示預覽」設為「解鎖時」，鎖定畫面不會顯示分店和配置；想一眼看到，就選「永遠」。",
            "Apple 沒有為網頁 App 通知提供「時效性」等級的說明，別指望它穿過專注模式：靠的是允許清單。",
          ],
        },
        {
          h2: "怎樣測試？",
          lead: "開著專注模式，從你的 RestockWire 帳戶發一則測試通知給自己。",
          points: [
            "從主畫面打開 RestockWire，進入帳戶，點「發送測試通知」。",
            "開啟你最常用的專注模式，再發一則。",
            "如果無聲送到或根本沒到，重新檢查專注模式的允許清單和傳送設定。",
          ],
        },
      ],
      faq: [
        { q: "專注模式會擋住 RestockWire 的提醒嗎？", a: "會，除非 RestockWire 在該專注模式的允許清單內。每個專注模式加一次即可。" },
        { q: "RestockWire 可以發「時效性」通知嗎？", a: "Apple 沒有為網頁 App 推送提供這個等級的說明，所以 RestockWire 改靠專注模式的允許清單。" },
        { q: "為何提醒在早上一次過送來？", a: "是定時摘要把它們留住了。把 RestockWire 設為「即時傳送」。" },
      ],
      sources: [
        { label: "iPhone 使用手冊：在專注模式中允許或靜音通知", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone 使用手冊：更改通知設定", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit：iOS 與 iPadOS 網頁 App 的 Web Push", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "Android 和 Wear OS 收 iPhone 補貨提醒",
      h1: "Android 手機或 Wear OS 手錶能收到 iPhone 補貨提醒嗎？",
      meta: "用 Android 手機等 iPhone 補貨？RestockWire 的提醒在 Chrome 上不用安裝任何東西便能用，還會送到已配對的 Wear OS 或 Galaxy 手錶。",
      answer: (live: string | null) =>
        `能。在 Android 用 Chrome 打開 RestockWire，登入後在 Chrome 詢問時允許通知；提醒便會像一般 App 一樣送到，並可轉到已配對的手錶。${live ? `上架中位數只有 ${live}，通知音量要開大。` : ""}`,
      sections: [
        {
          h2: "怎樣在 Chrome 開啟提醒？",
          lead: "用 Chrome 在 restockwire.com 登入，網站要求發送通知時點「允許」。",
          points: [
            "不用安裝：網站想通知你時，Chrome 會先問你。",
            "如果之前點了「封鎖」，從網址列打開網站設定，允許通知。",
            "在 Android 上把 RestockWire 加至主畫面是可選的，只是讓網站有自己的圖示。",
          ],
        },
        {
          h2: "提醒會送到 Wear OS 或 Galaxy 手錶嗎？",
          lead: "通常會：手機通知預設會轉到已配對的 Wear OS 手錶。",
          points: [
            "RestockWire 的提醒由 Chrome 發出，所以手錶會把它列在 Chrome 之下。",
            "Galaxy Watch：打開 Galaxy Wearable >「手錶設定」>「通知」>「應用程式通知」（Watch settings > Notifications > App notifications），保持 Chrome 開啟。",
            "如果提醒停了，檢查省電設定有沒有限制 Chrome 在背景運作。",
          ],
        },
        {
          h2: "手提電腦又如何？",
          lead: "電腦上的 Chrome、Edge 和 Firefox，在瀏覽器開著時也能顯示同樣的提醒。",
          points: [
            "在你最常開著的瀏覽器登入並允許通知。",
            "每部開了通知的裝置都會收到每則提醒。",
            "如果沒有任何裝置開了通知，RestockWire 會改以電郵發出提醒。",
          ],
        },
      ],
      faq: [
        { q: "用 RestockWire 一定要有 iPhone 嗎？", a: "不用。任何手機或電腦，只要瀏覽器支援網頁通知，都能收到提醒。" },
        { q: "為何手錶把提醒列在 Chrome 之下？", a: "在 Android 上，網站通知由 Chrome 發出，所以手錶把它們列在 Chrome 之下。" },
        { q: "可以兩部手機都收到提醒嗎？", a: "可以。在每部手機登入並允許通知；每部裝置都會收到每則提醒。" },
      ],
      sources: [
        { label: "Google Chrome 說明：使用通知", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers：Wear OS 上的通知", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung：管理 Galaxy Watch 的通知", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "更多手機提醒教學",
  },
};
