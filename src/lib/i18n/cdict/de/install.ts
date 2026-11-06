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
      ios: "Push gibt es auf iPhone und iPad nur in der App vom Home-Bildschirm, nicht in Safari.",
      android: "Auf Android kann Chrome selbst benachrichtigen; die Installation ist optional.",
      desktop: "Läuft im Browser, nichts zu installieren.",
    },
    tabsLabel: "Gerät wählen",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "restockwire.com in Safari aufrufen", text: "Es muss Safari sein; Chrome und In-App-Browser können das nicht." },
      share: { title: "„Teilen“ antippen", text: "iPhone: untere Leiste. iPad: obere Leiste." },
      choose: { title: "Im Menü: „Zum Home-Bildschirm“", text: "Nicht zu sehen? Das Menü nach unten scrollen." },
      add: { title: "Mit „Hinzufügen“ bestätigen", text: "Den Namen RestockWire so lassen." },
      open: { title: "App auf dem Home-Bildschirm öffnen, anmelden", text: "Die App meldet sich separat an; mit derselben E-Mail sind Ihre Alarme da." },
      allow: { title: "Button „Mitteilungen einschalten“ → „Erlauben“", text: "Sie finden den Button unter „Meine Alarme“. Die Frage kommt genau einmal." },
    },
    android: {
      chrome: { title: "restockwire.com in Chrome aufrufen", text: "Samsung Internet und Edge funktionieren auch; In-App-Browser nicht." },
      install: { title: "App installieren", text: "Direkt aus Chrome installiert, ohne Umweg über den Play Store." },
      menu: { title: "Drei-Punkte-Menü: „Zum Startbildschirm hinzufügen“", text: "Auf manchen Handys heißt es **App installieren**." },
      open: { title: "RestockWire starten und anmelden", text: "Auf dem Startbildschirm oder in der App-Übersicht; dieselbe E-Mail bringt Ihre Alarme mit." },
      allow: { title: "Button „Mitteilungen einschalten“ → „Zulassen“", text: "Android fragt nur einmal. Ein Chrome-Tab funktioniert auch." },
    },
    desktop: {
      allow: { title: "„Mitteilungen einschalten“ anklicken", text: "Funktioniert in Chrome, Edge, Firefox und Safari 16+; der Browser fragt nur einmal." },
      install: { title: "Optional: als App ausführen", text: "In Chrome oder Edge das Installieren-Symbol in der Adressleiste nutzen; Mitteilungen kommen dann auch bei geschlossenem Browser." },
      phone: { title: "Auch Ihr Handy hinzufügen", text: "Mit derselben E-Mail anmelden – dann erhält jedes Gerät mit aktiven Mitteilungen alle Alarme." },
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
    shareSheet: { copy: "Kopieren", readingList: "Zur Schnellnotiz hinzufügen", bookmark: "Lesezeichen hinzufügen", favorites: "Auf der Seite suchen", addToHome: "Zum Home-Bildschirm", markup: "Markierungen" },
    addDialog: { cancel: "Abbrechen", title: "Zum Home-Bildschirm", add: "Hinzufügen", note: "Auf deinem Home-Bildschirm erscheint ein Symbol, mit dem du diese Website direkt öffnest." },
    iosAlert: { title: "„RestockWire“ möchte dir Mitteilungen senden", text: "Möglich sind Hinweise, Töne und Kennzeichensymbole. Anpassen lässt sich das unter „Einstellungen“.", dontAllow: "Nicht erlauben", allow: "Erlauben" },
    chromeMenuLabel: "Menü",
    chromeMenu: { before: ["Neuer Tab", "Verlauf", "Downloads", "Lesezeichen", "Teilen…"], add: "Zum Startbildschirm hinzufügen", after: ["Desktopversion"] },
    androidAlert: { title: "RestockWire erlauben, dir Benachrichtigungen zu senden?", dontAllow: "Nicht zulassen", allow: "Zulassen" },
    desktopAlert: { wantsTo: "restockwire.com möchte", show: "Benachrichtigungen anzeigen", block: "Blockieren", allow: "Zulassen" },
    desktopInstall: { callout: "Installieren", title: "RestockWire installieren", text: "Startet künftig als eigenes Fenster", cancel: "Abbrechen", install: "Installieren" },
    lockScreen: { date: "Donnerstag, 29. Oktober", now: "jetzt", title: "iPhone 18 Pro Max 512GB Burgunder", body: "Apple Kurfürstendamm · Berlin – Heute verfügbar. Jetzt auf apple.com sichern." },
  },
};
