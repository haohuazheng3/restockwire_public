/**
 * English client strings: install (the /phone-alerts guide and its hand-drawn phone screens). The mock labels imitate the
 * operating system's own UI ("Share", "Add to Home Screen", "Allow"): a translation uses the words iOS, Android and
 * Chrome show in that language, not a fresh rendering.
 */
export const install = {
  hero: {
    eyebrow: "Home Screen app · nothing to download",
    title: "Restocks, straight to your lock screen.",
    lead: "A confirmed restock reaches your lock screen within seconds. It takes two things: RestockWire on your Home Screen, and notifications allowed.",
    seeSteps: "Show the steps",
    sendTest: "Send a test push",
    turnOn: "Turn on notifications",
    /** A device on the account already gets alerts: {label} is its name ("iPhone app"), {link} the "My alerts" link. */
    already: "**✓ Already set up.** Your {label} gets your alerts. Follow the steps below to add this device as well. {link}",
    myAlerts: "My alerts",
  },
  progress: {
    homeScreen: "Added to Home Screen",
    signedIn: "Signed in",
    on: "Notifications allowed",
    blocked: "Blocked in settings: step {n} fixes it.",
  },
  steps: {
    title: "Turning notifications on",
    intro: {
      ios: "iPhone and iPad deliver notifications only to the Home Screen app.",
      android: "On Android, Chrome can notify by itself; installing is optional.",
      desktop: "Runs in the browser, nothing to install.",
    },
    tabsLabel: "Choose your device",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Go to restockwire.com in Safari", text: "It has to be Safari; Chrome and in-app browsers cannot do this." },
      share: { title: "Tap Share", text: "iPhone: bottom bar. iPad: top bar." },
      choose: { title: "Choose “Add to Home Screen”", text: "Not in view? Scroll the sheet down." },
      add: { title: "Tap Add", text: "Leave the name as RestockWire." },
      open: { title: "Launch it from the Home Screen and sign in", text: "The app signs in separately; use the same email and your alerts are there." },
      allow: { title: "Tap “Turn on notifications”, then Allow", text: "You will find the button on your alerts page. iPhone asks only once." },
    },
    android: {
      chrome: { title: "Go to restockwire.com in Chrome", text: "Samsung Internet and Edge work as well; in-app browsers do not." },
      /** Chrome offered its install prompt. */
      install: { title: "Install the app", text: "A single tap, no app store involved." },
      /** No prompt: Chrome's menu. */
      menu: { title: "Menu ⋮ → “Add to Home screen”", text: "On some phones it reads **Install app**." },
      open: { title: "Launch RestockWire and sign in", text: "Find it on the Home Screen or in the app drawer; the same email brings your alerts." },
      allow: { title: "Tap “Turn on notifications”, then Allow", text: "Android asks only once. A Chrome tab works too." },
    },
    desktop: {
      allow: { title: "Tap “Turn on notifications”", text: "Works in Chrome, Edge, Firefox and Safari 16+; the browser asks only once." },
      install: { title: "Optional: run it as an app", text: "In Chrome or Edge, use the install icon in the address bar; notifications then arrive with the browser closed." },
      phone: { title: "Add your phone as well", text: "Sign in there with the same email. Each device with notifications on receives each alert." },
    },
  },
  action: {
    install: "Install RestockWire",
    on: "✓ This device takes notifications.",
    sendTest: "Send a test push",
    needsInstall: "Opens up inside the Home Screen app.",
    signInFirst: "Sign in to start",
    signInThenOn: "Sign in and turn on",
    turnOn: "Turn on notifications",
    denied: "Blocked: allow RestockWire in Settings, then reload.",
  },
  notes: [
    { q: "Does it drain the battery?", a: "No. The checking happens on RestockWire's servers, not on your phone." },
    { q: "Why does iPhone need Safari?", a: "Adding a site to the Home Screen is a Safari feature; in-app browsers lack it." },
    { q: "More than one device?", a: "Use the same email on each one, and each one receives every alert." },
    { q: "What about email?", a: "If no device has notifications on, the alert is sent to your email instead." },
  ],
  cta: { title: "Nothing to be alerted about yet?", button: "Set up alerts" },

  /** The illustrations (components/push/Mocks.tsx): the OS's own labels in that language. */
  mocks: {
    share: "Share",
    shareSheet: { copy: "Copy", readingList: "Add to Reading List", bookmark: "Add Bookmark", favorites: "Add to Favorites", addToHome: "Add to Home Screen", markup: "Markup" },
    addDialog: { cancel: "Cancel", title: "Add to Home Screen", add: "Add", note: "An icon will be added to your Home Screen so you can quickly access this website." },
    iosAlert: { title: "“RestockWire” Would Like to Send You Notifications", text: "Notifications may include alerts, sounds and icon badges. These can be configured in Settings.", dontAllow: "Don’t Allow", allow: "Allow" },
    chromeMenuLabel: "Menu",
    /** Chrome's ⋮ menu: the rows above "Add to Home screen", that row, the rows below it. */
    chromeMenu: { before: ["New tab", "History", "Downloads", "Bookmarks", "Share…"], add: "Add to Home screen", after: ["Desktop site"] },
    androidAlert: { title: "Allow RestockWire to send you notifications?", dontAllow: "Don’t allow", allow: "Allow" },
    desktopAlert: { wantsTo: "restockwire.com wants to", show: "Show notifications", block: "Block", allow: "Allow" },
    desktopInstall: { callout: "Install", title: "Install RestockWire", text: "Opens in its own window", cancel: "Cancel", install: "Install" },
    lockScreen: { date: "Thursday, October 29", now: "now", title: "iPhone 18 Pro 256GB Black", body: "Apple Fifth Avenue · New York, NY — Available Today. Open apple.com to reserve it." },
  },
};
