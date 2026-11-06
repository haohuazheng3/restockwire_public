/**
 * Swedish client strings: install (the /phone-alerts guide and its hand-drawn phone screens). The mock labels use the
 * words iOS, Android and Chrome show in Swedish: Dela, Lägg till på hemskärmen, Lägg till, Tillåt, Inställningar.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Ingen nedladdning · hemskärmsapp",
    title: "Nytt lager i butik? Det syns på låsskärmen.",
    lead: "Två steg: lägg RestockWire på hemskärmen och tillåt notiser. Därefter når varje bekräftad påfyllning låsskärmen på några sekunder.",
    seeSteps: "Till stegen",
    sendTest: "Testa en notis",
    turnOn: "Aktivera notiser",
    already: "**✓ Klart sedan tidigare.** Notiser skickas till {label}. Vill du ha dem på den här enheten också? Stegen står nedan. {link}",
    myAlerts: "Till bevakningarna",
  },
  progress: {
    homeScreen: "På hemskärmen",
    signedIn: "Inloggad",
    on: "Notiser: tillåtna",
    blocked: "Spärrade i inställningarna – se steg {n}.",
  },
  steps: {
    title: "Notiser i tre till sex steg",
    intro: {
      ios: "På iPhone och iPad visas notiser enbart via hemskärmsappen.",
      android: "Android: Chrome klarar notiser på egen hand, appen är ett tillval.",
      desktop: "Allt sker i webbläsaren. Ingen installation.",
    },
    tabsLabel: "Enhet",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Dator" },
    ios: {
      safari: { title: "Öppna restockwire.com i Safari", text: "Bara Safari fungerar. Chrome och inbyggda appwebbläsare saknar funktionen." },
      share: { title: "Knappen Dela", text: "Nedtill på iPhone, upptill på iPad." },
      choose: { title: "”Lägg till på hemskärmen” i menyn", text: "Saknas raden? Den ligger längre ner – scrolla." },
      add: { title: "Bekräfta med Lägg till", text: "Namnet RestockWire kan stå kvar." },
      open: { title: "Starta appen från hemskärmen, logga in", text: "Appen har en egen inloggning. Samma e-post = samma bevakningar." },
      allow: { title: "”Aktivera notiser”, sedan Tillåt", text: "Knappen ligger på bevakningssidan. Frågan från iPhone kommer en enda gång." },
    },
    android: {
      chrome: { title: "Öppna restockwire.com i Chrome", text: "Edge och Samsung Internet går också bra. Inbyggda appwebbläsare gör det inte." },
      install: { title: "Installera", text: "Ett tryck. Ingen Play Butik behövs." },
      menu: { title: "⋮-menyn, sedan ”Lägg till på startskärmen”", text: "Vissa modeller kallar raden **Installera app**." },
      open: { title: "Öppna RestockWire, logga in", text: "Ikonen ligger på startskärmen eller i applådan. Samma e-post = samma bevakningar." },
      allow: { title: "”Aktivera notiser”, sedan Tillåt", text: "Android frågar en enda gång. Det går även i en vanlig Chrome-flik." },
    },
    desktop: {
      allow: { title: "Knappen ”Aktivera notiser”", text: "Chrome, Edge, Firefox och Safari 16+ stöds. Frågan kommer en gång." },
      install: { title: "Tillval: eget appfönster", text: "Chrome och Edge har en installationsikon i adressfältet. Med den kommer notiser även när webbläsaren är stängd." },
      phone: { title: "Ta med telefonen", text: "Samma e-post där. Alla enheter med notiser aktiva får samtliga notiser." },
    },
  },
  action: {
    install: "Installera RestockWire",
    on: "✓ Notiser aktiva på den här enheten.",
    sendTest: "Testa en notis",
    needsInstall: "Finns i hemskärmsappen.",
    signInFirst: "Börja med att logga in",
    signInThenOn: "Logga in, aktivera",
    turnOn: "Aktivera notiser",
    denied: "Spärrade. Tillåt RestockWire under Inställningar, ladda om sidan.",
  },
  notes: [
    { q: "Kostar det batteri?", a: "Nej. All kontroll körs på RestockWires servrar; telefonen bara tar emot." },
    { q: "Varför just Safari på iPhone?", a: "Hemskärmsfunktionen sitter i Safari. Inbyggda appwebbläsare har den inte." },
    { q: "Flera enheter samtidigt?", a: "Ja. Logga in med samma e-post överallt; alla får alla notiser." },
    { q: "Kommer det mejl?", a: "Bara som reserv: saknar alla enheter aktiva notiser går notisen till din e-post." },
  ],
  cta: { title: "Inga bevakningar ännu?", button: "Lägg upp bevakningar" },

  mocks: {
    share: "Dela",
    shareSheet: { copy: "Kopiera", readingList: "Lägg till i läslista", bookmark: "Lägg till bokmärke", favorites: "Lägg till i favoriter", addToHome: "Lägg till på hemskärmen", markup: "Markering" },
    addDialog: { cancel: "Avbryt", title: "Lägg till på hemskärmen", add: "Lägg till", note: "En symbol läggs till på hemskärmen så att du snabbt kan komma åt den här webbplatsen." },
    iosAlert: { title: "”RestockWire” vill skicka notiser till dig", text: "Notiser kan innehålla meddelanden, ljud och symbolbrickor. Dessa kan konfigureras i Inställningar.", dontAllow: "Tillåt inte", allow: "Tillåt" },
    chromeMenuLabel: "Meny",
    chromeMenu: { before: ["Ny flik", "Historik", "Nedladdningar", "Bokmärken", "Dela…"], add: "Lägg till på startskärmen", after: ["Datorversion"] },
    androidAlert: { title: "Vill du tillåta att RestockWire skickar aviseringar till dig?", dontAllow: "Tillåt inte", allow: "Tillåt" },
    desktopAlert: { wantsTo: "restockwire.com vill", show: "Visa aviseringar", block: "Blockera", allow: "Tillåt" },
    desktopInstall: { callout: "Installera", title: "Installera RestockWire", text: "Körs i ett separat fönster", cancel: "Avbryt", install: "Installera" },
    lockScreen: { date: "torsdag 29 oktober", now: "nu", title: "iPhone 18 Pro 512GB glaciär", body: "Apple Mall of Scandinavia · Solna – Tillgänglig idag. Reservera på apple.com." },
  },
};
