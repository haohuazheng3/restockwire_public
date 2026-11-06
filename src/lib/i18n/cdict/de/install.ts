/**
 * German client strings: install (the /phone-alerts guide and its phone illustrations). The mock labels use the words
 * iOS, Android and Chrome show in German (iOS: „Teilen“, „Zum Home-Bildschirm“, „Erlauben“; Android: „Zulassen“).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Home-Bildschirm-App · nichts herunterzuladen",
    title: "Restocks direkt auf den Sperrbildschirm.",
    lead: "Ein bestätigter Restock erreicht Ihren Sperrbildschirm binnen Sekunden. Dafür braucht es zwei Dinge: RestockWire auf dem Home-Bildschirm und erlaubte Mitteilungen.",
    seeSteps: "Schritte zeigen",
    sendTest: "Test-Push senden",
    turnOn: "Mitteilungen einschalten",
    already: "**✓ Bereits eingerichtet.** Ihre Alarme gehen an: {label}. Mit den Schritten unten fügen Sie auch dieses Gerät hinzu. {link}",
    myAlerts: "Meine Alarme",
  },
  progress: {
    homeScreen: "Zum Home-Bildschirm hinzugefügt",
    signedIn: "Angemeldet",
    on: "Mitteilungen erlaubt",
    blocked: "In den Einstellungen blockiert: Schritt {n} behebt das.",
  },
  steps: {
    title: "Mitteilungen einschalten",
    intro: {
      ios: "iPhone und iPad stellen Mitteilungen nur an die Home-Bildschirm-App zu.",
      android: "Auf Android kann Chrome selbst benachrichtigen; die Installation ist optional.",
      desktop: "Läuft im Browser, nichts zu installieren.",
    },
    tabsLabel: "Gerät wählen",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "restockwire.com in Safari aufrufen", text: "Es muss Safari sein; Chrome und In-App-Browser können das nicht." },
      share: { title: "Auf „Teilen“ tippen", text: "iPhone: untere Leiste. iPad: obere Leiste." },
      choose: { title: "„Zum Home-Bildschirm“ wählen", text: "Nicht zu sehen? Das Menü nach unten scrollen." },
      add: { title: "Auf „Hinzufügen“ tippen", text: "Den Namen RestockWire so lassen." },
      open: { title: "Vom Home-Bildschirm starten und anmelden", text: "Die App meldet sich separat an; mit derselben E-Mail sind Ihre Alarme da." },
      allow: { title: "Auf „Mitteilungen einschalten“ tippen, dann „Erlauben“", text: "Der Button steht auf Ihrer Alarmseite. Das iPhone fragt nur einmal." },
    },
    android: {
      chrome: { title: "restockwire.com in Chrome aufrufen", text: "Samsung Internet und Edge funktionieren auch; In-App-Browser nicht." },
      install: { title: "App installieren", text: "Ein Tippen, ganz ohne App Store." },
      menu: { title: "Menü ⋮ → „Zum Startbildschirm hinzufügen“", text: "Auf manchen Handys heißt es **App installieren**." },
      open: { title: "RestockWire starten und anmelden", text: "Auf dem Startbildschirm oder in der App-Übersicht; dieselbe E-Mail bringt Ihre Alarme mit." },
      allow: { title: "Auf „Mitteilungen einschalten“ tippen, dann „Zulassen“", text: "Android fragt nur einmal. Ein Chrome-Tab funktioniert auch." },
    },
    desktop: {
      allow: { title: "Auf „Mitteilungen einschalten“ klicken", text: "Funktioniert in Chrome, Edge, Firefox und Safari 16+; der Browser fragt nur einmal." },
      install: { title: "Optional: als App ausführen", text: "In Chrome oder Edge das Installieren-Symbol in der Adressleiste nutzen; Mitteilungen kommen dann auch bei geschlossenem Browser." },
      phone: { title: "Auch Ihr Handy hinzufügen", text: "Melden Sie sich dort mit derselben E-Mail an. Jedes Gerät mit eingeschalteten Mitteilungen bekommt jeden Alarm." },
    },
  },
  action: {
    install: "RestockWire installieren",
    on: "✓ Dieses Gerät empfängt Mitteilungen.",
    sendTest: "Test-Push senden",
    needsInstall: "Öffnet sich in der Home-Bildschirm-App.",
    signInFirst: "Zum Start anmelden",
    signInThenOn: "Anmelden und einschalten",
    turnOn: "Mitteilungen einschalten",
    denied: "Blockiert: RestockWire in den Einstellungen erlauben, dann neu laden.",
  },
  notes: [
    { q: "Leert das den Akku?", a: "Nein. Geprüft wird auf den Servern von RestockWire, nicht auf Ihrem Handy." },
    { q: "Warum braucht das iPhone Safari?", a: "Eine Website zum Home-Bildschirm hinzuzufügen ist eine Safari-Funktion; In-App-Browsern fehlt sie." },
    { q: "Mehr als ein Gerät?", a: "Nutzen Sie auf jedem dieselbe E-Mail, dann bekommt jedes jeden Alarm." },
    { q: "Und die E-Mail?", a: "Hat kein Gerät Mitteilungen eingeschaltet, geht der Alarm stattdessen an Ihre E-Mail." },
  ],
  cta: { title: "Noch nichts, worüber Sie informiert werden?", button: "Alarme einrichten" },

  mocks: {
    share: "Teilen",
    shareSheet: { copy: "Kopieren", readingList: "Zur Leseliste hinzufügen", bookmark: "Lesezeichen hinzufügen", favorites: "Zu Favoriten hinzufügen", addToHome: "Zum Home-Bildschirm", markup: "Markierungen" },
    addDialog: { cancel: "Abbrechen", title: "Zum Home-Bildschirm", add: "Hinzufügen", note: "Ein Symbol wird zu deinem Home-Bildschirm hinzugefügt, damit du schnell auf diese Website zugreifen kannst." },
    iosAlert: { title: "„RestockWire“ möchte dir Mitteilungen senden", text: "Mitteilungen können Hinweise, Töne und Kennzeichensymbole enthalten. Diese können in „Einstellungen“ konfiguriert werden.", dontAllow: "Nicht erlauben", allow: "Erlauben" },
    chromeMenuLabel: "Menü",
    chromeMenu: { before: ["Neuer Tab", "Verlauf", "Downloads", "Lesezeichen", "Teilen…"], add: "Zum Startbildschirm hinzufügen", after: ["Desktopversion"] },
    androidAlert: { title: "RestockWire erlauben, dir Benachrichtigungen zu senden?", dontAllow: "Nicht zulassen", allow: "Zulassen" },
    desktopAlert: { wantsTo: "restockwire.com möchte", show: "Benachrichtigungen anzeigen", block: "Blockieren", allow: "Zulassen" },
    desktopInstall: { callout: "Installieren", title: "RestockWire installieren", text: "Öffnet sich in einem eigenen Fenster", cancel: "Abbrechen", install: "Installieren" },
    lockScreen: { date: "Donnerstag, 29. Oktober", now: "jetzt", title: "iPhone 18 Pro 256GB Schwarz", body: "Apple Kurfürstendamm · Berlin – Heute verfügbar. Auf apple.com öffnen und reservieren." },
  },
};
