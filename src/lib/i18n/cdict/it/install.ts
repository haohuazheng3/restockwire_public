import type { CDict } from "../en";

/**
 * Italian client strings: install (the /phone-alerts guide and its drawn phone screens). Mock labels are the words iOS,
 * Android and Chrome show in Italian (Condividi, Aggiungi alla schermata Home, Consenti…).
 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "App nella schermata Home · niente da scaricare",
    title: "I rifornimenti, direttamente sulla schermata di blocco.",
    lead: "Un rifornimento confermato arriva sulla schermata di blocco in pochi secondi. Servono due cose: RestockWire nella schermata Home e le notifiche consentite.",
    seeSteps: "Mostra i passaggi",
    sendTest: "Invia una notifica di prova",
    turnOn: "Attiva le notifiche",
    already: "**✓ Già configurato.** I tuoi avvisi arrivano su: {label}. Segui i passaggi qui sotto per aggiungere anche questo dispositivo. {link}",
    myAlerts: "I miei avvisi",
  },
  progress: {
    homeScreen: "Aggiunta alla schermata Home",
    signedIn: "Accesso effettuato",
    on: "Notifiche consentite",
    blocked: "Bloccate nelle impostazioni: il passaggio {n} risolve.",
  },
  steps: {
    title: "Attivare le notifiche",
    intro: {
      ios: "iPhone e iPad consegnano le notifiche solo all'app nella schermata Home.",
      android: "Su Android Chrome può inviare notifiche da solo; installare è facoltativo.",
      desktop: "Funziona nel browser, niente da installare.",
    },
    tabsLabel: "Scegli il tuo dispositivo",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Computer" },
    ios: {
      safari: { title: "Vai su restockwire.com in Safari", text: "Deve essere Safari; Chrome e i browser interni delle app non possono farlo." },
      share: { title: "Tocca Condividi", text: "iPhone: barra in basso. iPad: barra in alto." },
      choose: { title: "Scegli «Aggiungi alla schermata Home»", text: "Non lo vedi? Scorri il pannello verso il basso." },
      add: { title: "Tocca Aggiungi", text: "Lascia il nome RestockWire." },
      open: { title: "Avviala dalla schermata Home e accedi", text: "L'app ha un accesso separato; usa la stessa email e i tuoi avvisi sono lì." },
      allow: { title: "Tocca «Attiva le notifiche», poi Consenti", text: "Trovi il pulsante nella pagina dei tuoi avvisi. iPhone lo chiede una volta sola." },
    },
    android: {
      chrome: { title: "Vai su restockwire.com in Chrome", text: "Funzionano anche Samsung Internet ed Edge; i browser interni delle app no." },
      install: { title: "Installa l'app", text: "Un solo tocco, senza passare da un app store." },
      menu: { title: "Menu ⋮ → «Aggiungi a schermata Home»", text: "Su alcuni telefoni si chiama **Installa app**." },
      open: { title: "Avvia RestockWire e accedi", text: "La trovi nella schermata Home o nell'elenco delle app; la stessa email porta con sé i tuoi avvisi." },
      allow: { title: "Tocca «Attiva le notifiche», poi Consenti", text: "Android lo chiede una volta sola. Funziona anche una scheda di Chrome." },
    },
    desktop: {
      allow: { title: "Fai clic su «Attiva le notifiche»", text: "Funziona in Chrome, Edge, Firefox e Safari 16+; il browser lo chiede una volta sola." },
      install: { title: "Facoltativo: usala come app", text: "In Chrome o Edge usa l'icona di installazione nella barra degli indirizzi; così le notifiche arrivano anche con il browser chiuso." },
      phone: { title: "Aggiungi anche il telefono", text: "Accedi lì con la stessa email. Ogni dispositivo con le notifiche attive riceve ogni avviso." },
    },
  },
  action: {
    install: "Installa RestockWire",
    on: "✓ Questo dispositivo riceve le notifiche.",
    sendTest: "Invia una notifica di prova",
    needsInstall: "Si sblocca dentro l'app nella schermata Home.",
    signInFirst: "Accedi per iniziare",
    signInThenOn: "Accedi e attiva",
    turnOn: "Attiva le notifiche",
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
    desktopInstall: { callout: "Installa", title: "Installa RestockWire", text: "Si apre in una finestra dedicata", cancel: "Annulla", install: "Installa" },
    lockScreen: { date: "giovedì 29 ottobre", now: "ora", title: "iPhone 18 Pro 256GB Nero", body: "Apple Via del Corso · Roma — Disponibile oggi. Apri apple.com per prenotarlo." },
  },
};
