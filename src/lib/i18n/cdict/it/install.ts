import type { CDict } from "../en";

/**
 * Italian client strings: install (the /phone-alerts guide and its drawn phone screens). Mock labels are the words iOS,
 * Android and Chrome show in Italian (Condividi, Aggiungi alla schermata Home, Consenti…).
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "Nessun download · un'icona sulla Home e basta",
    title: "I rifornimenti, direttamente sulla schermata di blocco.",
    lead: "Un rifornimento confermato arriva sulla schermata di blocco in pochi secondi. Servono due cose: RestockWire nella schermata Home e le notifiche consentite.",
    seeSteps: "Mostra i passaggi",
    sendTest: "Invia una notifica di prova",
    turnOn: "Accendi le notifiche",
    already: "**✓ Già configurato.** I tuoi avvisi arrivano su: {label}. Segui i passaggi qui sotto per aggiungere anche questo dispositivo. {link}",
    myAlerts: "Apri i miei avvisi",
  },
  progress: {
    homeScreen: "Aggiunta alla schermata Home",
    signedIn: "Sei dentro con la tua email",
    on: "Notifiche consentite",
    blocked: "Notifiche bloccate nelle impostazioni: si sistema al passaggio {n}.",
  },
  steps: {
    title: "Attivare le notifiche",
    intro: {
      ios: "Su iPhone e iPad serve l'icona sulla Home: Safari da solo non riceve notifiche.",
      android: "Su Android Chrome può inviare notifiche da solo; installare è facoltativo.",
      desktop: "Funziona nel browser, niente da installare.",
    },
    tabsLabel: "Scegli il tuo dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Vai su restockwire.com in Safari", text: "Deve essere Safari; Chrome e i browser interni delle app non possono farlo." },
      share: { title: "Tocca Condividi", text: "iPhone: barra in basso. iPad: barra in alto." },
      choose: { title: "Nel pannello, la voce «Aggiungi alla schermata Home»", text: "Manca? Fai scorrere il pannello più giù." },
      add: { title: "Tocca Aggiungi", text: "Lascia il nome RestockWire." },
      open: { title: "Apri l'icona sulla Home ed entra", text: "Nell'app l'accesso è a parte: stessa email, stessi avvisi." },
      allow: { title: "«Accendi le notifiche» e poi Consenti", text: "Il pulsante sta nella pagina dei tuoi avvisi. La domanda di iPhone arriva una volta sola." },
    },
    android: {
      chrome: { title: "Apri restockwire.com con Chrome", text: "Vanno bene anche Samsung Internet ed Edge, non i browser dentro le app." },
      install: { title: "Installa l'app", text: "Un solo tocco, senza passare da un app store." },
      menu: { title: "Dal menu ⋮, la voce «Aggiungi a schermata Home»", text: "Alcuni telefoni la chiamano **Installa app**." },
      open: { title: "Avvia RestockWire e accedi", text: "La trovi nella schermata Home o nell'elenco delle app; la stessa email porta con sé i tuoi avvisi." },
      allow: { title: "«Accendi le notifiche», quindi Consenti", text: "Android lo domanda una sola volta. Va bene anche una normale scheda di Chrome." },
    },
    desktop: {
      allow: { title: "Un clic su «Accendi le notifiche»", text: "Chrome, Edge, Firefox e Safari 16+ vanno tutti bene; il browser fa la domanda una volta sola." },
      install: { title: "Se vuoi, come app", text: "Chrome ed Edge hanno un'icona di installazione nella barra degli indirizzi: le notifiche arrivano anche a browser chiuso." },
      phone: { title: "Poi anche il telefono", text: "Entra con la stessa email. Ogni dispositivo con le notifiche accese riceve tutti gli avvisi." },
    },
  },
  action: {
    install: "Installa RestockWire",
    on: "✓ Questo dispositivo riceve le notifiche.",
    sendTest: "Invia una notifica di prova",
    needsInstall: "Si sblocca dentro l'app nella schermata Home.",
    signInFirst: "Accedi per iniziare",
    signInThenOn: "Accedi e attiva",
    turnOn: "Accendi le notifiche",
    denied: "Bloccate: consenti RestockWire in Impostazioni, poi ricarica.",
  },
  notes: [
    { q: "Consuma la batteria?", a: "No. I controlli avvengono sui server di RestockWire, non sul tuo telefono." },
    { q: "Perché su iPhone serve Safari?", a: "Aggiungere un sito alla schermata Home è una funzione di Safari; i browser interni delle app non ce l'hanno." },
    { q: "Più di un dispositivo?", a: "Usa la stessa email su ognuno, e ognuno riceve ogni avviso." },
    { q: "E l'email?", a: "Se nessun dispositivo ha le notifiche attive, l'avviso viene inviato alla tua email." },
  ],
  cta: { title: "Ancora niente per cui ricevere un avviso?", button: "Imposta gli avvisi" },

  mocks: {
    share: "Condividi",
    shareSheet: { copy: "Copia", readingList: "Aggiungi a Elenco lettura", bookmark: "Aggiungi segnalibro", favorites: "Aggiungi a Preferiti", addToHome: "Aggiungi alla schermata Home", markup: "Markup" },
    addDialog: { cancel: "Annulla", title: "Aggiungi alla schermata Home", add: "Aggiungi", note: "Un'icona verrà aggiunta alla schermata Home per consentirti di accedere rapidamente a questo sito web." },
    iosAlert: { title: "“RestockWire” vorrebbe inviarti delle notifiche", text: "Le notifiche possono includere avvisi, suoni e badge sulle icone. Puoi configurarle in Impostazioni.", dontAllow: "Non consentire", allow: "Consenti" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nuova scheda", "Cronologia", "Download", "Preferiti", "Condividi…"], add: "Aggiungi a schermata Home", after: ["Sito desktop"] },
    androidAlert: { title: "Consentire a RestockWire di inviarti notifiche?", dontAllow: "Non consentire", allow: "Consenti" },
    desktopAlert: { wantsTo: "restockwire.com vuole", show: "Mostrare notifiche", block: "Blocca", allow: "Consenti" },
    desktopInstall: { callout: "Installa", title: "Installa RestockWire", text: "Gira in una finestra tutta sua", cancel: "Annulla", install: "Installa" },
    lockScreen: { date: "giovedì 29 ottobre", now: "ora", title: "iPhone 18 Pro 512GB Nero", body: "Apple Via del Corso · Roma — Disponibile oggi. Apri apple.com per prenotarlo." },
  },
};
