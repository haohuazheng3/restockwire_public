/**
 * English client strings: account (the dashboard's client parts, the notification card every app page shows, the
 * device labels the server sends with it). Plain data: "{name}" → fill(), { one, other } → plural(), **bold** → <Rich>
 * (or the class-less <b> renderer in PushSetup).
 */
export const account = {
  signOut: "Sign out",

  /** Names for devices (lib/devices.ts boils them down to one {label} for the card) plus the per-device list. */
  devices: {
    iphone: "iPhone",
    ipad: "iPad",
    /** A Home Screen install of the site: "iPhone app". */
    app: "{device} app",
    android: "Android phone",
    computer: "computer",
    device: "device",
    many: { one: "{n} device", other: "{n} devices" },
    platforms: { ios: "iPhone / iPad", android: "Android", desktop: "Computer", unknown: "Device" } as Record<string, string>,
    homeScreenApp: "Home Screen app",
    browser: "browser",
    /** Follows the platform name; keep the leading " · ". */
    meta: " · {kind} · added {added}",
    lastAlert: " · last alert {when}",
    stopped: "stopped: switch it back on from that device",
    remove: "Remove",
  },

  /** The notification card (PushSetup) and its state machine (usePush). */
  push: {
    title: "Notifications on this device",
    pill: { checking: "Checking…", "in-app-browser": "Use Safari", "needs-install": "App not added", unsupported: "Not supported", "needs-signin": "Sign in", denied: "Blocked", ready: "Off", on: "On" },
    explain: {
      checking: "Looking at this device…",
      inAppBrowser: "This in-app browser cannot notify you: tap ··· and pick **Open in Safari** (or Chrome).",
      needsInstall: "iPhone and iPad deliver notifications only to the Home Screen app.",
      unsupported: "This browser cannot show notifications, so your alerts arrive by email.",
      needsSignin: "Notifications need you signed in on this device.",
      deniedIos: "Switch them on in **Settings → Notifications → RestockWire**, then reload.",
      denied: "Switch them on in this site's browser settings, then reload.",
      readyIos: "Alerts reach you by email until this device is on. Tap **Turn on notifications**, then **Allow**, and they land here within seconds.",
      readyDevice: "Alerts reach you by email until this device is on. Tap **Turn on notifications** and they land here within seconds.",
      readyBrowser: "Alerts reach you by email until this browser is on. Tap **Turn on notifications** and they land here within seconds.",
      on: "A restock lands here within seconds, app open or closed.",
    },
    /** Another device on the account already gets the alerts; {label} is a device name ("iPhone app", "2 devices"). */
    elsewhere: {
      needsInstall: "Your {label} gets your alerts. On iPhone only the Home Screen app can show them, not Safari.",
      ready: "Your {label} gets your alerts. Switch them on here as well to add this device.",
      denied: "Your {label} gets your alerts. This browser has notifications blocked.",
      other: "Your {label} gets your alerts.",
    },
    turnOnToo: "Add this device",
    sendTest: "Send a test push",
    showMeHow: "How to do it",
    signIn: "Sign in",
    installApp: "Add the app",
    turnOn: "Turn on notifications",
    turnOff: "Turn off",
    setupGuide: "Setup steps",
    /** iPhone in Safari: the three steps under the card (iOS's own words for Share / Add to Home Screen). */
    miniSteps: ["In Safari, tap Share", "Choose Add to Home Screen", "Open the app and allow notifications"],
    /** "Send a test": what the server answered. {device} names come from the server. */
    test: {
      gone: "The push service reports this device's subscription has expired. Switch notifications off and back on from that device.",
      none: "The test reached no device{error}. Switch notifications off and back on.",
      noneError: " ({error})",
      soon: "Test push goes out in {s} seconds. Close this app or lock the phone now: iPhone hides banners while the app is on screen.",
      iosHint: "Nothing popped up? iPhone hides banners while this app is on screen. Pull down from the top edge: the test is in Notification Center.",
      away: "Test push sent while the app was in the background. Missed the banner? Pull down from the top edge and check Notification Center.",
      sent: "Test push sent at {when} to {where}. Expect it within seconds; the banner shows the device name and the time.{failed}",
      one: "your {device}",
      many: "{n} devices ({list})",
      /** Appended after a space. */
      failed: { one: "{n} device did not receive it.", other: "{n} devices did not receive it." },
    },
    errors: {
      notSaved: "This device was not saved; please retry",
      notConfigured: "Notifications are not set up yet",
      allow: "Notifications must be allowed to go on",
      notSavedPlain: "This device was not saved",
      noTest: "The test push failed to send",
      noServiceWorker: "No service worker available",
    },
    onNotice: "This device takes notifications. Send a test push to watch one arrive.",
  },

  /**
   * The restock timeline. {zone} is "Eastern" in English (hence "{zone} time"); in other languages it is the full
   * zone name from Intl ("日本標準時", "Mitteleuropäische Zeit"), which already says "time": translations drop the word.
   * {time} and {gap} arrive formatted ("9:25 AM", "2 h 5 min").
   */
  timeline: {
    title: "Restock times through the day",
    badge: "History · not a prediction",
    window: "{yours} · past {days} days",
    order: "{zone} time, from early to late",
    bars: "the longer the bar, the more often",
    mixedSome: "few at yours, so other stores in this zone are added",
    mixedNone: "nothing at yours so far, so other stores in this zone stand in",
    otherStores: "More stores on {zone} time",
    empty: "Empty for now. Each restock adds a row.",
    listLabel: "Restock times ({zone} time)",
    now: "Now",
    nowLabel: "Now, {time}",
    nowNext: ". Upcoming restock time {soon}",
    aboutNow: "right about now",
    in: "in {gap}",
    reportedPrefix: "Reported · ",
    tomorrow: "tomorrow",
    nextTomorrow: "Up next: {time} tomorrow, {soon}",
    /** Row labels for screen readers. */
    rowReported: { one: "{time} · {where} · {n} restock, per other trackers", other: "{time} · {where} · {n} restocks, per other trackers" },
    rowMine: { one: "{time} · {where} · {n} restock", other: "{time} · {where} · {n} restocks" },
    rowArea: { one: "{time} ({zone} time) · {where} · {n} restock", other: "{time} ({zone} time) · {where} · {n} restocks" },
    rowNext: ", next",
    rowNextTomorrow: ", next, tomorrow",
    /** Tooltip on a row's bar. */
    often: { one: "{n} restock near this time over the past {days} days", other: "{n} restocks near this time over the past {days} days" },
    oftenReported: { one: "{n} restock near this time over the past {days} days, reported by other trackers", other: "{n} restocks near this time over the past {days} days, reported by other trackers" },
    hidden: { one: "Only your peak times are shown; {n} restock at a quieter time is left out.", other: "Only your peak times are shown; {n} restocks at quieter times are left out." },
    /** First words of the footnote that credits restocks taken from other trackers' public logs. */
    reportMark: "Dashed rings",
  },
  /** The dashboard's language setting. */
  language: {
    title: "Language",
    label: "Language of this page, your alerts and your emails",
    help: "Pushes, alert emails and Stripe checkout use this language; prices stay in each store's currency and times in each store's own time zone.",
    alertsIn: "Alerts go out in {lang} at the moment.",
    saving: "Saving…",
  },
};
