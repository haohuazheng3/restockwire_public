/**
 * 通知文字，台灣中文（推播、補貨 Email、「通知已停止」Email、Stripe 結帳頁按鈕上方那行）。輪詢主機也會送出
 * 這些文字，所以除了型別不 import 任何東西。
 */
import type { NotifyText } from "./en";

/** 裝置名稱是英文（iPhone）時，前後補半形空格（中英混排）。 */
const w = (s: string) => `${/^[A-Za-z0-9]/.test(s) ? " " : ""}${s}${/[A-Za-z0-9]$/.test(s) ? " " : ""}`;

export const notifyZhTW: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}。前往 apple.com 預訂。`,
  testTitle: "RestockWire 測試：通知正常",
  testBody: (time: string, device: string) => `已於 ${time} 送到你的${w(device).trimEnd()}。真正的補貨通知就會像這樣，在確認後幾秒內送達。`,
  device: {
    iphoneApp: "iPhone（主畫面 App）",
    iphoneSafari: "iPhone（Safari）",
    androidApp: "Android（已安裝的 App）",
    android: (browser: string) => `Android${browser ? `（${browser}）` : ""}`,
    computer: (browser: string) => `電腦${browser ? `（${browser}）` : ""}`,
    other: "這台裝置",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` 另有 ${more} 則` : ""}`,
    intro: "此刻開放門市取貨：",
    reserve: "預訂",
    store: "門市",
    tip: "門市取貨的庫存通常很快就沒了。在 Apple Store App 或 apple.com 選擇「取貨」，再選這家門市。",
    manage: (url: string) => `變更或暫停這則通知：${url}`,
    htmlTitle: "現在開放取貨",
    htmlReserve: "在 apple.com 預訂",
    htmlStorePage: "前往門市頁面 →",
    htmlTip: "門市取貨的庫存通常很快就沒了。在 Apple Store App 或 apple.com 選擇 <b>取貨</b>，再選這家門市。",
    htmlManage: "變更或暫停這則通知",
    cancel: (url: string) => `已經買到 iPhone 了？隨時可以取消：${url}`,
    htmlGotIt: "已經買到 iPhone 了？",
    htmlCancel: "隨時取消",
    nudge: (url: string) => `Email 只是備援：你帳號裡沒有任何手機開啟通知。推播在確認補貨後約 3 秒送達。要改用推播，請從主畫面打開 RestockWire，點「開啟通知」：${url}`,
    htmlNudge: (url: string) => `Email 只是備援：你帳號裡沒有任何手機開啟通知。<b>推播在確認補貨後約 3 秒</b>送達。請從主畫面打開 RestockWire，點 <b>開啟通知</b>。<a href="${url}" style="color:#0a7f3f">設定步驟 →</a>`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}：可設 ${limit} 則通知。你選的門市 ${fastSec} 秒讀一次、其他門市 ${checkSec} 秒一次；補貨一經確認，約 ${alertSec} 秒就推到手機。按月付費，想停隨時停。`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android 手機", desktop: "電腦", other: "裝置" },
    subject: (device: string) => `你的${w(device)}已不再接收 RestockWire 通知`,
    gone: (device: string) => `推播服務回報你的${w(device)}已取消 RestockWire 的訂閱，所以通知送不到它了。`,
    byEmail: "在通知重新開啟之前，你的補貨通知會改寄到 Email。",
    reopenIos: "解決方法：從主畫面（不是 Safari）打開 RestockWire，在「帳號」頁點「開啟通知」。",
    reopenOther: "解決方法：打開 RestockWire，前往「帳號」，點「開啟通知」。",
    causes: "通常是因為 App 從主畫面刪除、在「設定」裡關閉了通知，或手機從備份還原過。",
  },
  nudge: {
    subject: "你的 RestockWire 通知可以在約 3 秒內送到手機",
    intro: "約 3 秒：這是 RestockWire 確認補貨後，推播送到手機所需的時間。一次 iPhone Duo 補貨通常約一分鐘就沒了，而 Email 更慢。你的通知目前以 Email 寄送，因為你帳號裡沒有任何手機開啟通知。",
    howTitle: "切換不用一分鐘：",
    stepsIos: ["iPhone：用 Safari 前往 restockwire.com，點「分享」，再點「加入主畫面」。", "從主畫面（不是 Safari）打開 RestockWire 並登入。", "在「帳號」頁點「開啟通知」，再點「允許」。"],
    stepsOther: "Android 或電腦：前往 restockwire.com/account，點「開啟通知」。",
    after: "在有裝置開啟通知之前，Email 會繼續寄送。之後通知會以推播送達，Email 也會停止。",
    cta: (url: string) => `圖解設定步驟：${url}`,
  },
};
