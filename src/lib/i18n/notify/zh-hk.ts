/**
 * 繁體中文（香港）notification texts (push, alert email, "notifications stopped" email, Stripe checkout line).
 * Poller-safe: type imports only. Apple Hong Kong calls in-store pickup 提取.
 */
import type { NotifyText } from "./en";

/** "你的 iPhone 已…" but "你的電腦已…": spaces only around a Latin name. */
const yourDevice = (d: string): string => `你的${/^[A-Za-z]/.test(d) ? " " : ""}${d}${/[A-Za-z)]$/.test(d) ? " " : ""}`;

export const notifyZhHK: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? `——${quote}` : ""}。到 apple.com 預訂。`,
  testTitle: "RestockWire 測試：通知正常",
  testBody: (time: string, device: string) => `已於 ${time} 發送到${yourDevice(device).trimEnd()}。真正的補貨提醒就會這樣，在確認後幾秒內送到。`,
  device: {
    iphoneApp: "iPhone（主畫面 App）",
    iphoneSafari: "iPhone（Safari）",
    androidApp: "Android（已安裝 App）",
    android: (browser: string) => `Android${browser ? `（${browser}）` : ""}`,
    computer: (browser: string) => `電腦${browser ? `（${browser}）` : ""}`,
    other: "此裝置",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` 另有 ${more} 個` : ""}`,
    intro: "此刻可到店提取：",
    reserve: "去預訂",
    store: "門市",
    tip: "可提取的存貨通常很快便沒有。在 Apple Store App 或 apple.com 選擇「提取」，再揀這間分店。",
    manage: (url: string) => `更改或暫停這個提醒：${url}`,
    htmlTitle: "現在可供提取",
    htmlReserve: "到 apple.com 預訂",
    htmlStorePage: "前往分店頁 →",
    htmlTip: "可提取的存貨通常很快便沒有。在 Apple Store App 或 apple.com 選擇<b>提取</b>，再揀這間分店。",
    htmlManage: "更改或暫停這個提醒",
    cancel: (url: string) => `iPhone 到手了？可隨時取消方案：${url}`,
    htmlGotIt: "iPhone 到手了？",
    htmlCancel: "取消方案",
    nudge: (url: string) => `電郵只是後備：你帳戶內沒有手機開啟通知。推送在補貨確認後約 3 秒送到。如要改用推送，請從主畫面打開 RestockWire，按「開啟通知」：${url}`,
    htmlNudge: (url: string) => `電郵只是後備：你帳戶內沒有手機開啟通知。<b>推送在補貨確認後約 3 秒</b>送到。請從主畫面打開 RestockWire，按<b>開啟通知</b>。<a href="${url}" style="color:#0a7f3f">設定步驟 →</a>`,
  },
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android 機", desktop: "電腦", other: "設備" },
    subject: (device: string) => `${yourDevice(device)}已不再接收 RestockWire 通知`,
    gone: (device: string) => `推送服務表示${yourDevice(device)}已取消 RestockWire 的訂閱，所以通知再送不到它。`,
    byEmail: "通知重新開啟之前，你的補貨提醒會改以電郵發送。",
    reopenIos: "解決方法：從主畫面（不是 Safari）打開 RestockWire，在「帳戶」頁按「開啟通知」。",
    reopenOther: "解決方法：打開 RestockWire，前往「帳戶」，按「開啟通知」。",
    causes: "通常是因為 App 從主畫面刪除、在「設定」中關閉了通知，或手機曾從備份還原。",
  },
  nudge: {
    subject: "你的 RestockWire 提醒可以在約 3 秒內送到手機",
    intro: "約 3 秒：這是 RestockWire 確認補貨後，推送送到手機所需的時間。一次 iPhone Duo 補貨通常約一分鐘便售罄，而電郵更慢。你的提醒現時以電郵發送，因為你帳戶內沒有手機開啟通知。",
    howTitle: "切換不用一分鐘：",
    stepsIos: ["iPhone：用 Safari 前往 restockwire.com，按「分享」，再按「加至主畫面」。", "從主畫面（不是 Safari）打開 RestockWire 並登入。", "在「帳戶」頁按「開啟通知」，再按「允許」。"],
    stepsOther: "Android 或電腦：前往 restockwire.com/account，按「開啟通知」。",
    after: "有裝置開啟通知之前，電郵會繼續發送。之後提醒會以推送送到，電郵亦會停止。",
    cta: (url: string) => `圖解設定步驟：${url}`,
  },
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}：${limit} 個提醒。你的分店每 ${fastSec} 秒讀取一次，其他分店每 ${checkSec} 秒一次；補貨確認後約 ${alertSec} 秒送到你的手機。按月收費，隨時取消。`,
};
