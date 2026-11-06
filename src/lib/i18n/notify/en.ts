/**
 * Notification texts (push, alert email, "notifications stopped" email, device names), English. Plain TS with no
 * imports: the poller sends these too. Every language mirrors this shape in notify/<lang>.ts.
 */
export const notifyEn = {
  /** Banner headline is the configuration and nothing else, e.g. "iPhone Duo 1TB Star White" (`cfg` in the reader's own spelling); any prefix would cut the colour off a one-line banner. */
  pushTitle: (cfg: string) => cfg,
  /** Banner text. `where` looks like "Apple Michigan Avenue · Chicago, IL"; `quote` carries Apple's pickup phrase when Apple wrote it in the reader's language, else null. */
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}. Open apple.com to reserve it.`,
  testTitle: "RestockWire test: notifications work",
  testBody: (time: string, device: string) => `Sent ${time} to your ${device}. A real restock alert lands exactly like this, seconds after it is confirmed.`,
  device: {
    iphoneApp: "iPhone (Home Screen app)",
    iphoneSafari: "iPhone (Safari)",
    androidApp: "Android (installed app)",
    android: (browser: string) => `Android${browser ? ` (${browser})` : ""}`,
    computer: (browser: string) => `computer${browser ? ` (${browser})` : ""}`,
    other: "this device",
  },
  /** The restock e-mail, sent only when no device has notifications on. */
  email: {
    /** `more` counts the extra alerts bundled into this one e-mail; 0 when it carries a single alert. */
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` +${more} more` : ""}`,
    intro: "Listed for in-store pickup at this moment:",
    reserve: "Reserve",
    store: "Store",
    tip: 'Pickup listings rarely last long. In the Apple Store app or on apple.com, choose "Pick up" and then this store.',
    manage: (url: string) => `Change or pause this alert: ${url}`,
    htmlTitle: "Listed for pickup now",
    htmlReserve: "Reserve on apple.com",
    htmlStorePage: "Open the store page →",
    /** May contain <b>…</b>. */
    htmlTip: "Pickup listings rarely last long. In the Apple Store app or on apple.com, choose <b>Pick up</b> and then this store.",
    htmlManage: "Change or pause this alert",
    /** Footer line of each alert e-mail; `url` points at /account/cancel, which opens straight on the cancel step. */
    cancel: (url: string) => `Have your iPhone now? Cancel anytime: ${url}`,
    htmlGotIt: "Have your iPhone now?",
    htmlCancel: "Cancel anytime",
    /** Footer of each e-mailed alert, pointing to push as the quicker channel; `url` is the phone-alerts guide. */
    nudge: (url: string) => `Email is the fallback: no phone on your account has notifications on. A push lands about 3 seconds after a confirmed restock. To switch, open RestockWire from your Home Screen and tap "Turn on notifications": ${url}`,
    /** May contain <b> and the anchor; `url` arrives escaped. */
    htmlNudge: (url: string) => `Email is the fallback: no phone on your account has notifications on. A <b>push lands about 3 seconds</b> after a confirmed restock. Open RestockWire from your Home Screen and tap <b>Turn on notifications</b>. <a href="${url}" style="color:#0a7f3f">Setup steps →</a>`,
  },
  /** The one e-mail (at most every 14 days) to a member whose alerts go by e-mail: turn notifications on. */
  nudge: {
    subject: "Your RestockWire alerts can reach your phone in about 3 seconds",
    intro: "About 3 seconds: that is how soon a push reaches a phone after RestockWire confirms a restock. A typical iPhone Duo restock is gone in about a minute, and email is slower. Your alerts come by email now because no phone on your account has notifications on.",
    howTitle: "Switching takes less than a minute:",
    stepsIos: ["iPhone: go to restockwire.com in Safari, tap Share, then Add to Home Screen.", "Launch RestockWire from the Home Screen, not Safari, and sign in.", "On the Account page, tap Turn on notifications, then Allow."],
    stepsOther: "Android or computer: go to restockwire.com/account and tap Turn on notifications.",
    after: "Email continues until a device is switched on. After that, alerts arrive as notifications and the emails stop.",
    cta: (url: string) => `Illustrated setup steps: ${url}`,
  },
  /** Shown by Stripe Checkout next to the pay button: plan name, alert count, and the three speeds (store checks, other stores, push). */
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}: ${limit} alerts. Your stores are read every ${fastSec} s and every other store every ${checkSec} s; a confirmed restock reaches your phone in about ${alertSec} s. Billed monthly, cancel anytime.`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android device", desktop: "computer", other: "device" },
    subject: (device: string) => `Your ${device} no longer receives RestockWire notifications`,
    gone: (device: string) => `The push service reports that your ${device} has dropped its RestockWire subscription, so notifications no longer reach it.`,
    byEmail: "Until notifications are back on, your restock alerts come by email.",
    reopenIos: 'To fix it, launch RestockWire from your Home Screen, not Safari, and tap "Turn on notifications" on the Account page.',
    reopenOther: 'To fix it, open RestockWire, go to Account and tap "Turn on notifications".',
    causes: "This usually happens when the app is deleted from the Home Screen, notifications are switched off in Settings, or the phone is restored from a backup.",
  },
};
export type NotifyText = typeof notifyEn;
