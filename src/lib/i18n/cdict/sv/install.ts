/**
 * Swedish client strings: install (the /phone-alerts guide and its hand-drawn phone screens). The mock labels use the
 * words iOS, Android and Chrome show in Swedish: Dela, Lägg till på hemskärmen, Lägg till, Tillåt, Inställningar.
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "Hemskärmsapp · inget att ladda ner",
    title: "Påfyllningar, direkt till låsskärmen.",
    lead: "En bekräftad påfyllning når din låsskärm inom några sekunder. Det krävs två saker: RestockWire på hemskärmen och tillåtna notiser.",
    seeSteps: "Visa stegen",
    sendTest: "Skicka en testnotis",
    turnOn: "Slå på notiser",
    already: "**✓ Redan klart.** Notiserna går till {label}. Följ stegen nedan för att lägga till den här enheten också. {link}",
    myAlerts: "Mina bevakningar",
  },
  progress: {
    homeScreen: "Tillagd på hemskärmen",
    signedIn: "Inloggad",
    on: "Notiser tillåtna",
    blocked: "Blockerade i inställningarna: steg {n} löser det.",
  },
  steps: {
    title: "Så slår du på notiser",
    intro: {
      ios: "iPhone och iPad levererar notiser bara till appen på hemskärmen.",
      android: "På Android kan Chrome skicka notiser själv; att installera är valfritt.",
      desktop: "Körs i webbläsaren, inget att installera.",
    },
    tabsLabel: "Välj din enhet",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Dator" },
    ios: {
      safari: { title: "Gå till restockwire.com i Safari", text: "Det måste vara Safari; Chrome och webbläsare inuti appar klarar inte det här." },
      share: { title: "Tryck på Dela", text: "iPhone: nedre fältet. iPad: övre fältet." },
      choose: { title: "Välj ”Lägg till på hemskärmen”", text: "Syns det inte? Scrolla ner i menyn." },
      add: { title: "Tryck på Lägg till", text: "Låt namnet vara RestockWire." },
      open: { title: "Starta den från hemskärmen och logga in", text: "Appen loggar in separat; använd samma e-post så finns dina bevakningar där." },
      allow: { title: "Tryck på ”Slå på notiser” och sedan Tillåt", text: "Knappen finns på sidan med dina bevakningar. iPhone frågar bara en gång." },
    },
    android: {
      chrome: { title: "Gå till restockwire.com i Chrome", text: "Samsung Internet och Edge fungerar också; webbläsare inuti appar gör det inte." },
      install: { title: "Installera appen", text: "Ett enda tryck, ingen appbutik inblandad." },
      menu: { title: "Meny ⋮ → ”Lägg till på startskärmen”", text: "På vissa telefoner heter det **Installera app**." },
      open: { title: "Starta RestockWire och logga in", text: "Du hittar den på startskärmen eller i applådan; samma e-post ger dig dina bevakningar." },
      allow: { title: "Tryck på ”Slå på notiser” och sedan Tillåt", text: "Android frågar bara en gång. En Chrome-flik fungerar också." },
    },
    desktop: {
      allow: { title: "Tryck på ”Slå på notiser”", text: "Fungerar i Chrome, Edge, Firefox och Safari 16+; webbläsaren frågar bara en gång." },
      install: { title: "Valfritt: kör den som app", text: "I Chrome eller Edge, använd installationsikonen i adressfältet; då kommer notiserna även när webbläsaren är stängd." },
      phone: { title: "Lägg till telefonen också", text: "Logga in där med samma e-post. Varje enhet med notiser på får varje notis." },
    },
  },
  action: {
    install: "Installera RestockWire",
    on: "✓ Den här enheten tar emot notiser.",
    sendTest: "Skicka en testnotis",
    needsInstall: "Blir tillgängligt i appen på hemskärmen.",
    signInFirst: "Logga in för att börja",
    signInThenOn: "Logga in och slå på",
    turnOn: "Slå på notiser",
    denied: "Blockerade: tillåt RestockWire i Inställningar och ladda sedan om.",
  },
  notes: [
    { q: "Drar det batteri?", a: "Nej. Kontrollerna sker på RestockWires servrar, inte i din telefon." },
    { q: "Varför behöver iPhone Safari?", a: "Att lägga till en sajt på hemskärmen är en funktion i Safari; webbläsare inuti appar saknar den." },
    { q: "Fler än en enhet?", a: "Använd samma e-post på var och en, så får varje enhet varje notis." },
    { q: "Och mejl?", a: "Om ingen enhet har notiser på skickas notisen till din e-post i stället." },
  ],
  cta: { title: "Inget att bevaka än?", button: "Skapa bevakningar" },

  mocks: {
    share: "Dela",
    shareSheet: { copy: "Kopiera", readingList: "Lägg till i läslista", bookmark: "Lägg till bokmärke", favorites: "Lägg till i favoriter", addToHome: "Lägg till på hemskärmen", markup: "Markering" },
    addDialog: { cancel: "Avbryt", title: "Lägg till på hemskärmen", add: "Lägg till", note: "En symbol läggs till på hemskärmen så att du snabbt kan komma åt den här webbplatsen." },
    iosAlert: { title: "”RestockWire” vill skicka notiser till dig", text: "Notiser kan innehålla meddelanden, ljud och symbolbrickor. Dessa kan konfigureras i Inställningar.", dontAllow: "Tillåt inte", allow: "Tillåt" },
    chromeMenuLabel: "Meny",
    chromeMenu: { before: ["Ny flik", "Historik", "Nedladdningar", "Bokmärken", "Dela…"], add: "Lägg till på startskärmen", after: ["Datorversion"] },
    androidAlert: { title: "Vill du tillåta att RestockWire skickar aviseringar till dig?", dontAllow: "Tillåt inte", allow: "Tillåt" },
    desktopAlert: { wantsTo: "restockwire.com vill", show: "Visa aviseringar", block: "Blockera", allow: "Tillåt" },
    desktopInstall: { callout: "Installera", title: "Installera RestockWire", text: "Öppnas i ett eget fönster", cancel: "Avbryt", install: "Installera" },
    lockScreen: { date: "torsdag 29 oktober", now: "nu", title: "iPhone 18 Pro 256GB svart", body: "Apple Mall of Scandinavia · Solna – Tillgänglig idag. Öppna apple.com för att reservera." },
  },
};
