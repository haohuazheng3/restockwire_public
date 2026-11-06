/**
 * 繁體中文（香港）client strings: install (the /phone-alerts guide and its phone screens). The mock labels are the words
 * iOS, Android and Chrome show in Traditional Chinese (Hong Kong): 分享, 加至主畫面, 加入, 允許, 設定 → 通知.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "主畫面 App · 不用下載",
    title: "補貨消息，直達鎖定畫面。",
    lead: "補貨一經確認，幾秒內就會出現在你的鎖定畫面。只需兩件事：把 RestockWire 加至主畫面，以及允許通知。",
    seeSteps: "顯示步驟",
    sendTest: "發送測試推送",
    turnOn: "開啟通知",
    already: "**✓ 已經設定好。**你的{label}會收到提醒。跟着以下步驟，也可以把這部裝置加進來。{link}",
    myAlerts: "我的提醒",
  },
  progress: {
    homeScreen: "已加至主畫面",
    signedIn: "已登入",
    on: "已允許通知",
    blocked: "已在設定中封鎖：第 {n} 步可以解決。",
  },
  steps: {
    title: "開啟通知",
    intro: {
      ios: "iPhone 和 iPad 只會把通知送到主畫面 App。",
      android: "在 Android 上，Chrome 本身已可發出通知；裝不裝 App 都可以。",
      desktop: "在瀏覽器內運行，不用安裝任何東西。",
    },
    tabsLabel: "選擇你的裝置",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "電腦" },
    ios: {
      safari: { title: "用 Safari 前往 restockwire.com", text: "一定要用 Safari；Chrome 和 App 內置瀏覽器都做不到。" },
      share: { title: "按「分享」", text: "iPhone 在底部列，iPad 在頂部列。" },
      choose: { title: "選擇「加至主畫面」", text: "看不到？把選單向下捲動。" },
      add: { title: "按「加入」", text: "名稱保留 RestockWire 就可以。" },
      open: { title: "從主畫面打開並登入", text: "App 要另外登入；用同一個電郵，提醒就全部在。" },
      allow: { title: "按「開啟通知」，再按「允許」", text: "按鈕在你的提醒頁面。iPhone 只會問一次。" },
    },
    android: {
      chrome: { title: "用 Chrome 前往 restockwire.com", text: "Samsung Internet 和 Edge 也可以；App 內置瀏覽器則不行。" },
      install: { title: "安裝 App", text: "按一下就完成，不用經 App 商店。" },
      menu: { title: "選單 ⋮ →「加至主畫面」", text: "部分手機會寫成**安裝應用程式**。" },
      open: { title: "打開 RestockWire 並登入", text: "在主畫面或應用程式清單找到它；用同一個電郵，提醒就會出現。" },
      allow: { title: "按「開啟通知」，再按「允許」", text: "Android 只會問一次。用 Chrome 分頁也可以。" },
    },
    desktop: {
      allow: { title: "按「開啟通知」", text: "支援 Chrome、Edge、Firefox 及 Safari 16 或以上；瀏覽器只會問一次。" },
      install: { title: "可選：以 App 形式運行", text: "在 Chrome 或 Edge 按網址列上的安裝圖示；之後即使關閉瀏覽器，通知照樣收到。" },
      phone: { title: "手機也加進來", text: "在手機用同一個電郵登入。每部開啟了通知的裝置都會收到每個提醒。" },
    },
  },
  action: {
    install: "安裝 RestockWire",
    on: "✓ 這部裝置可以接收通知。",
    sendTest: "發送測試推送",
    needsInstall: "在主畫面 App 內才會開放。",
    signInFirst: "登入以開始",
    signInThenOn: "登入並開啟",
    turnOn: "開啟通知",
    denied: "已封鎖：請在「設定」允許 RestockWire，然後重新載入。",
  },
  notes: [
    { q: "會很耗電嗎？", a: "不會。檢查在 RestockWire 的伺服器上進行，不是在你的手機。" },
    { q: "為何 iPhone 一定要用 Safari？", a: "把網站加至主畫面是 Safari 的功能；App 內置瀏覽器沒有。" },
    { q: "多過一部裝置？", a: "每部都用同一個電郵，每部都會收到每個提醒。" },
    { q: "電郵又如何？", a: "如果沒有裝置開啟通知，提醒會改為寄到你的電郵。" },
  ],
  cta: { title: "暫時未有要追蹤的東西？", button: "設定提醒" },

  mocks: {
    share: "分享",
    shareSheet: { copy: "拷貝", readingList: "加至閱讀列表", bookmark: "加入書籤", favorites: "加至喜好項目", addToHome: "加至主畫面", markup: "標示" },
    addDialog: { cancel: "取消", title: "加至主畫面", add: "加入", note: "一個圖像將會加至你的主畫面，讓你可以快速取用此網站。" },
    iosAlert: { title: "「RestockWire」想傳送通知給你", text: "通知可能包括提示、聲音和圖像標記。你可在「設定」中設定這些項目。", dontAllow: "不允許", allow: "允許" },
    chromeMenuLabel: "選單",
    chromeMenu: { before: ["新分頁", "記錄", "下載", "書籤", "分享…"], add: "加至主畫面", after: ["電腦版網站"] },
    androidAlert: { title: "要允許 RestockWire 傳送通知給你嗎？", dontAllow: "不允許", allow: "允許" },
    desktopAlert: { wantsTo: "restockwire.com 想", show: "顯示通知", block: "封鎖", allow: "允許" },
    desktopInstall: { callout: "安裝", title: "安裝 RestockWire", text: "會在獨立視窗中開啟", cancel: "取消", install: "安裝" },
    lockScreen: { date: "10月29日 星期四", now: "現在", title: "iPhone 18 Pro 256GB 黑色", body: "Apple Canton Road（廣東道）· 香港尖沙咀——今天可提供。按此在 apple.com 預訂。" },
  },
};
