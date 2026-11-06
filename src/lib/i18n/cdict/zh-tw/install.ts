/**
 * 台灣中文客戶端字串：install（/phone-alerts 教學與手繪的手機畫面）。示意圖上的字用 iOS、Android、Chrome 繁體中文
 * （台灣）介面本身的字：分享、加入主畫面、加入、允許、設定 → 通知、加到主畫面。
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "主畫面 App · 免下載",
    title: "補貨消息，直達鎖定畫面。",
    lead: "確認補貨後，幾秒內就會出現在你的鎖定畫面。只需要兩件事：把 RestockWire 加入主畫面，並允許通知。",
    seeSteps: "顯示步驟",
    sendTest: "傳送測試推播",
    turnOn: "開啟通知",
    already: "**✓ 已經設定完成。**你的{label}會收到通知。照下面的步驟，也能把這台裝置加進來。{link}",
    myAlerts: "我的通知",
  },
  progress: {
    homeScreen: "已加入主畫面",
    signedIn: "已登入",
    on: "已允許通知",
    blocked: "已在設定中封鎖：步驟 {n} 可以解決。",
  },
  steps: {
    title: "開啟通知",
    intro: {
      ios: "iPhone 和 iPad 只會把通知送到主畫面 App。",
      android: "在 Android 上，Chrome 本身就能發通知；安裝與否都可以。",
      desktop: "在瀏覽器裡執行，不必安裝任何東西。",
    },
    tabsLabel: "選擇你的裝置",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "電腦" },
    ios: {
      safari: { title: "用 Safari 前往 restockwire.com", text: "一定要用 Safari；Chrome 和 App 內建瀏覽器都做不到。" },
      share: { title: "點「分享」", text: "iPhone 在下方工具列，iPad 在上方工具列。" },
      choose: { title: "選擇「加入主畫面」", text: "沒看到？把選單往下滑。" },
      add: { title: "點「加入」", text: "名稱保留 RestockWire 即可。" },
      open: { title: "從主畫面開啟並登入", text: "App 要另外登入；用同一個 Email，通知就都在。" },
      allow: { title: "先按「開啟通知」，接著按「允許」", text: "按鈕就在通知頁上；這個詢問 iPhone 只跳一次。" },
    },
    android: {
      chrome: { title: "用 Chrome 前往 restockwire.com", text: "Samsung Internet 和 Edge 也可以；App 內建瀏覽器不行。" },
      install: { title: "安裝 App", text: "點一下就好，不經過應用程式商店。" },
      menu: { title: "選單 ⋮ →「加到主畫面」", text: "有些手機上會寫成 **安裝應用程式**。" },
      open: { title: "開啟 RestockWire 並登入", text: "在主畫面或應用程式清單裡找到它；用同一個 Email，通知就會出現。" },
      allow: { title: "按「開啟通知」→「允許」", text: "Android 只會問一次。用 Chrome 分頁也可以。" },
    },
    desktop: {
      allow: { title: "點「開啟通知」", text: "支援 Chrome、Edge、Firefox 與 Safari 16 以上；瀏覽器只會問一次。" },
      install: { title: "選用：當成 App 執行", text: "在 Chrome 或 Edge 用網址列上的安裝圖示；之後即使關掉瀏覽器，通知照樣會到。" },
      phone: { title: "把手機也加進來", text: "在手機上用同一個 Email 登入。每台開啟通知的裝置都會收到每一則通知。" },
    },
  },
  action: {
    install: "安裝 RestockWire",
    on: "✓ 這台裝置可接收通知。",
    sendTest: "傳送測試推播",
    needsInstall: "在主畫面 App 裡才會開放。",
    signInFirst: "登入以開始",
    signInThenOn: "登入並開啟",
    turnOn: "開啟通知",
    denied: "已封鎖：請到「設定」允許 RestockWire，再重新整理。",
  },
  notes: [
    { q: "會很耗電嗎？", a: "不會。檢查是在 RestockWire 的伺服器上進行，不是在你的手機上。" },
    { q: "為什麼 iPhone 一定要用 Safari？", a: "把網站加入主畫面是 Safari 的功能；App 內建瀏覽器沒有。" },
    { q: "不只一台裝置？", a: "每台都用同一個 Email，每台都會收到每一則通知。" },
    { q: "那 Email 呢？", a: "如果沒有任何裝置開啟通知，通知會改寄到你的 Email。" },
  ],
  cta: { title: "還沒有要追蹤的東西？", button: "設定通知" },

  mocks: {
    share: "分享",
    shareSheet: { copy: "拷貝", readingList: "加入閱讀列表", bookmark: "加入書籤", favorites: "加入喜好項目", addToHome: "加入主畫面", markup: "標示" },
    addDialog: { cancel: "取消", title: "加入主畫面", add: "加入", note: "將會在你的主畫面加入一個圖像，讓你能快速取用此網站。" },
    iosAlert: { title: "「RestockWire」想要傳送通知給你", text: "通知可能包含提示、聲音和圖像標記。這些可在「設定」中設定。", dontAllow: "不允許", allow: "允許" },
    chromeMenuLabel: "選單",
    chromeMenu: { before: ["新分頁", "歷史記錄", "下載", "書籤", "分享…"], add: "加到主畫面", after: ["電腦版網站"] },
    androidAlert: { title: "要允許「RestockWire」傳送通知給你嗎？", dontAllow: "不允許", allow: "允許" },
    desktopAlert: { wantsTo: "restockwire.com 要求取得以下權限：", show: "顯示通知", block: "封鎖", allow: "允許" },
    desktopInstall: { callout: "安裝", title: "要安裝 RestockWire 嗎？", text: "以獨立視窗執行", cancel: "取消", install: "安裝" },
    lockScreen: { date: "10月29日 星期四", now: "現在", title: "iPhone 18 Pro 256GB 黑色", body: "Apple 信義 A13（台北）今天有貨可取 · 點按即到 apple.com 預訂" },
  },
};
