/**
 * Dutch client strings: install (the /phone-alerts guide and its drawn phone screens). The mock labels are the words
 * iOS, Android and Chrome show in Dutch: Deel, Zet op beginscherm, Voeg toe, Sta toe, Toevoegen aan startscherm.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "App op je beginscherm · niets te downloaden",
    title: "Aanvullingen, direct op je toegangsscherm.",
    lead: "Een bevestigde aanvulling staat binnen seconden op je toegangsscherm. Daarvoor zijn twee dingen nodig: RestockWire op je beginscherm, en meldingen toegestaan.",
    seeSteps: "Toon de stappen",
    sendTest: "Stuur een testpush",
    turnOn: "Zet meldingen aan",
    already: "**✓ Al ingesteld.** Je {label} krijgt je alerts. Volg de stappen hieronder om ook dit apparaat toe te voegen. {link}",
    myAlerts: "Mijn alerts",
  },
  progress: {
    homeScreen: "Op beginscherm gezet",
    signedIn: "Ingelogd",
    on: "Meldingen toegestaan",
    blocked: "Geblokkeerd in de instellingen: stap {n} lost het op.",
  },
  steps: {
    title: "Meldingen aanzetten",
    intro: {
      ios: "iPhone en iPad geven meldingen alleen aan de app op het beginscherm.",
      android: "Op Android kan Chrome zelf meldingen geven; installeren is optioneel.",
      desktop: "Draait in de browser, niets te installeren.",
    },
    tabsLabel: "Kies je apparaat",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Ga in Safari naar restockwire.com", text: "Het moet Safari zijn; Chrome en browsers in apps kunnen dit niet." },
      share: { title: "Tik op Deel", text: "iPhone: balk onderaan. iPad: balk bovenaan." },
      choose: { title: "Kies “Zet op beginscherm”", text: "Niet te zien? Scrol het venster omlaag." },
      add: { title: "Tik op Voeg toe", text: "Laat de naam op RestockWire staan." },
      open: { title: "Start het vanaf je beginscherm en log in", text: "De app logt apart in; gebruik hetzelfde e-mailadres en je alerts staan klaar." },
      allow: { title: "Tik op “Zet meldingen aan” en dan op Sta toe", text: "De knop staat op je alertspagina. De iPhone vraagt het maar één keer." },
    },
    android: {
      chrome: { title: "Ga in Chrome naar restockwire.com", text: "Samsung Internet en Edge werken ook; browsers in apps niet." },
      install: { title: "Installeer de app", text: "Eén tik, zonder appwinkel." },
      menu: { title: "Menu ⋮ → “Toevoegen aan startscherm”", text: "Op sommige telefoons heet het **App installeren**." },
      open: { title: "Start RestockWire en log in", text: "Je vindt het op het startscherm of in het app-overzicht; hetzelfde e-mailadres brengt je alerts mee." },
      allow: { title: "Tik op “Zet meldingen aan” en dan op Toestaan", text: "Android vraagt het maar één keer. Een Chrome-tabblad werkt ook." },
    },
    desktop: {
      allow: { title: "Klik op “Zet meldingen aan”", text: "Werkt in Chrome, Edge, Firefox en Safari 16+; de browser vraagt het maar één keer." },
      install: { title: "Optioneel: gebruik het als app", text: "Gebruik in Chrome of Edge het installatie-icoon in de adresbalk; meldingen komen dan ook binnen als de browser dicht is." },
      phone: { title: "Voeg ook je telefoon toe", text: "Log daar in met hetzelfde e-mailadres. Elk apparaat met meldingen aan krijgt elke alert." },
    },
  },
  action: {
    install: "Installeer RestockWire",
    on: "✓ Dit apparaat ontvangt meldingen.",
    sendTest: "Stuur een testpush",
    needsInstall: "Wordt beschikbaar in de app op je beginscherm.",
    signInFirst: "Log in om te beginnen",
    signInThenOn: "Log in en zet aan",
    turnOn: "Zet meldingen aan",
    denied: "Geblokkeerd: sta RestockWire toe in Instellingen en laad de pagina opnieuw.",
  },
  notes: [
    { q: "Kost het veel batterij?", a: "Nee. Het checken gebeurt op de servers van RestockWire, niet op je telefoon." },
    { q: "Waarom heeft de iPhone Safari nodig?", a: "Een site op het beginscherm zetten is een functie van Safari; browsers in apps hebben die niet." },
    { q: "Meer dan één apparaat?", a: "Gebruik op elk apparaat hetzelfde e-mailadres, dan krijgt elk apparaat elke alert." },
    { q: "En e-mail?", a: "Staan op geen enkel apparaat meldingen aan, dan gaat de alert naar je e-mail." },
  ],
  cta: { title: "Nog niets om een alert voor te krijgen?", button: "Alerts instellen" },

  mocks: {
    share: "Deel",
    shareSheet: { copy: "Kopieer", readingList: "Voeg toe aan leeslijst", bookmark: "Voeg bladwijzer toe", favorites: "Voeg toe aan favorieten", addToHome: "Zet op beginscherm", markup: "Markering" },
    addDialog: { cancel: "Annuleer", title: "Zet op beginscherm", add: "Voeg toe", note: "Er wordt een symbool aan je beginscherm toegevoegd, zodat je snel naar deze website kunt gaan." },
    iosAlert: { title: "“RestockWire” wil je berichten sturen", text: "Berichtgeving kan meldingen, geluiden en symboolbadges bevatten. Deze kunnen in Instellingen worden geconfigureerd.", dontAllow: "Sta niet toe", allow: "Sta toe" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nieuw tabblad", "Geschiedenis", "Downloads", "Bladwijzers", "Delen…"], add: "Toevoegen aan startscherm", after: ["Desktopsite"] },
    androidAlert: { title: "Toestaan dat RestockWire je meldingen stuurt?", dontAllow: "Niet toestaan", allow: "Toestaan" },
    desktopAlert: { wantsTo: "restockwire.com wil", show: "Meldingen weergeven", block: "Blokkeren", allow: "Toestaan" },
    desktopInstall: { callout: "Installeren", title: "RestockWire installeren", text: "Opent in een eigen venster", cancel: "Annuleren", install: "Installeren" },
    lockScreen: { date: "donderdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB Zwart", body: "Apple Amsterdam · Amsterdam — Vandaag beschikbaar. Reserveer hem op apple.com." },
  },
};
