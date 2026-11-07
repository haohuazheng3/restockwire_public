/**
 * Italian strings for RestockWire's own page families (it-it): stato del Ritiro in negozio, report settimanali,
 * Apple Store che esauriscono prima, negozio contro negozio e tre guide per il telefono. Same keys and arguments as
 * dict/en/insight.tsx; every argument arrives already formatted in Italian. `w.name` is the Italian country name:
 * `inNome` adds the right preposition ("in Italia", "negli Stati Uniti", "nel Regno Unito").
 * iOS labels follow Apple Italia (Impostazioni, Full immersion, Riepilogo programmato, Consegna immediata).
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { inNome } from "./util";

const inW = (w: Where) => inNome(w.name);

export const insight: InsightDict = {
  nav: {
    status: "Stato del Ritiro in negozio",
    reports: "Report settimanali dei rifornimenti",
    fastest: "Gli Apple Store che esauriscono prima",
    compare: "Negozio contro negozio",
    guides: "Guide agli avvisi sul telefono",
    otherCountries: "La stessa pagina per un altro paese",
    updated: (when: string) => `Aggiornato: ${when}`,
    sources: "Fonti e metodo",
    cite: "Citi questi numeri? Indica questa pagina come fonte, con il link.",
    alertCta: "Attiva un avviso di rifornimento",
    logCta: "Apri il registro dei rifornimenti",
  },

  status: {
    title: (w: Where) => (w.us ? "Ritiro Apple Store negli USA: funziona? Live" : `Ritiro negli Apple Store ${inW(w)}: stato live`),
    h1: (w: Where) => `La verifica del Ritiro in negozio di Apple funziona ${inW(w)} in questo momento?`,
    meta: (v: StatusView) =>
      `Live: nell'ultimo minuto Apple ha risposto per ${v.answered} Apple Store su ${v.stores} ${inW(v.w)}. Tasso di errore, ore difficili dell'ultimo giorno e cosa fare se i controlli si bloccano.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Sì. Nell'ultimo minuto Apple ha risposto per ${v.answered} Apple Store su ${v.stores} ${inW(v.w)}; richieste fallite nell'ultima ora: ${v.failLastHour}.`
        : v.verdict === "slow"
          ? `In parte. Nell'ultimo minuto Apple ha risposto per ${v.answered} Apple Store su ${v.stores} ${inW(v.w)}; richieste fallite nell'ultima ora: ${v.failLastHour}, quindi una parte della disponibilità può comparire in ritardo.`
          : v.verdict === "down"
            ? `Non adesso. Nell'ultimo minuto Apple ha risposto solo per ${v.answered} Apple Store su ${v.stores} ${inW(v.w)}. Finché non si riprende, la disponibilità mostrata su apple.com e qui può non essere aggiornata.`
            : `In questo momento RestockWire non riesce a leggere lo stato ${inW(v.w)}. Ricarica tra un minuto.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Funziona", slow: "Lento", down: "Non risponde", unknown: "Sconosciuto" })[v],
    tiles: {
      answered: "negozi che hanno risposto nell'ultimo minuto",
      age: "età mediana del controllo più recente di un negozio",
      failHour: "richieste fallite, ultimi 60 minuti",
      failDay: "richieste fallite, ultime 24 ore",
    },
    nowH2: "Che cosa vede RestockWire in questo momento?",
    nowLead: (v: StatusView) =>
      `${v.answered} negozi su ${v.stores} hanno risposto nell'ultimo minuto${v.age ? `; un negozio tipico è stato letto ${v.age} fa` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Ogni Apple Store ${inW(v.w)} viene letto a giri di 15 secondi; i negozi indicati negli avvisi ogni 5 secondi.`,
      v.oldest ? `Il negozio che aspetta da più tempo ha risposto l'ultima volta ${v.oldest} fa.` : "In questa finestra nessun negozio ha ancora risposto.",
      Number(v.never) > 0 ? `Negozi che non hanno mai risposto: ${v.never}. Lì al momento Apple non offre la verifica del ritiro.` : "Ogni negozio ha risposto almeno una volta.",
    ],
    dayH2: "Come sono andate le ultime 24 ore?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Senza intoppi: in nessuna delle ultime 24 ore le richieste fallite hanno raggiunto il 5% (${v.failDay} in tutto).`
        : `Ore difficili nelle ultime 24: ${v.roughHours}, ciascuna con il 5% o più di richieste fallite: ${v.roughList}. Richieste fallite in tutto: ${v.failDay}.`,
    hourCaption: (zone: string) => `Richieste ed errori per ora, ultime 24 ore (${zone})`,
    hourHead: ["Ora", "Richieste", "Fallite", "Quota fallita"],
    whyH2: "Perché apple.com dà tutti i negozi come non disponibili?",
    whyLead: "Di solito perché la configurazione è esaurita. A volte perché è la verifica di Apple ad avere problemi.",
    whyPoints: [
      "**Esaurito:** la verifica risponde normalmente e semplicemente non elenca nessun negozio. Questa pagina resta verde.",
      "**Problemi della verifica:** le risposte falliscono o tornano vuote per tutti i negozi insieme. Entro un minuto questa pagina diventa gialla o rossa.",
      "**La tua sessione:** una scheda di apple.com aperta da tempo può mostrare una risposta vecchia. Ricarica la pagina della borsa prima di fidarti.",
    ],
    doH2: "Cosa fare quando i controlli del ritiro si bloccano?",
    doLead: "Lascia l'avviso attivo e aspetta. La verifica si riprende da sola, e i rifornimenti arrivati nel frattempo vengono comunque confermati.",
    doSteps: [
      "Lascia l'avviso attivo: RestockWire continua a chiedere e ti avvisa appena passa un rifornimento confermato.",
      "Non ricaricare apple.com ogni pochi secondi: la verifica di Apple non diventa più veloce.",
      "Torna su questa pagina tra cinque minuti. I periodi difficili visti finora sono durati da pochi minuti a circa due ore.",
      "Quando torna verde, apri la pagina del tuo negozio: il registro dei rifornimenti mostra quello che è arrivato durante la pausa.",
    ],
    methodH2: "Come si misura lo stato?",
    methodPoints: [
      "**Freschezza:** il controllo riuscito più recente di ogni negozio, dalle verifiche del ritiro fatte da RestockWire.",
      "**Errori:** richieste fallite per ora nel giro che copre questo paese, come registrate dai nostri poller.",
      "**Verdetto:** Funziona = il 90% dei negozi ha risposto nell'ultimo minuto ed errori sotto il 5%; Non risponde = meno della metà.",
    ],
    otherH2: "Stato del ritiro negli altri paesi",
    faq: (v: StatusView) => [
      { q: "Il Ritiro in negozio di apple.com è fuori servizio?", a: v.verdict === "ok" ? `Non ${inW(v.w)}, in questo momento: nell'ultimo minuto hanno risposto ${v.answered} negozi su ${v.stores}.` : `${inW(v.w).replace(/^./, (c) => c.toUpperCase())} in questo momento è in difficoltà: nell'ultimo minuto hanno risposto ${v.answered} negozi su ${v.stores}.` },
      { q: "Uno stato rosso vuol dire che l'iPhone è esaurito?", a: "No. Rosso vuol dire che la verifica di Apple fallisce; esaurito è una risposta normale e lascia lo stato verde." },
      { q: "Ogni quanto si aggiorna questa pagina?", a: "Ogni visita legge numeri freschi; i conteggi hanno al massimo 30 secondi." },
      { q: "Perdo un rifornimento se la verifica è ferma?", a: "Potresti vederlo in ritardo. RestockWire conferma ogni rifornimento appena tornano le risposte e allora ti avvisa." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Report settimanali rifornimenti iPhone, USA" : `Report settimanali rifornimenti iPhone ${inW(w)}`),
    indexH1: (w: Where) => `Report settimanali dei rifornimenti di iPhone ${inW(w)}`,
    indexMeta: (w: Where) => `Ogni settimana di rifornimenti di iPhone Duo, 18 Pro e 18 Pro Max negli Apple Store ${inW(w)}: conteggi, negozi più attivi, configurazioni e velocità di esaurimento.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `Il primo report ${inW(w)} esce quando una settimana arriva a ${"20"} rifornimenti confermati.` : `Settimane in archivio ${inW(w)}: ${n}. Ogni edizione è il registro dei rifornimenti confermati di RestockWire per una settimana da lunedì a domenica, ora locale.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} rifornimenti${complete ? "" : " · finora"}`,
    title: (w: Where, range: string) => (w.us ? `Rifornimenti iPhone USA, ${range}` : `Rifornimenti iPhone ${inW(w)}, ${range}`),
    h1: (w: Where, range: string) => `Rifornimenti di iPhone ${inW(w)}, settimana ${range}`,
    meta: (v: ReportView) => `${v.restocks} rifornimenti di iPhone confermati in ${v.stores} Apple Store ${inW(v.w)}, ${v.range}. Negozio e giorno più attivi, configurazione più difficile e velocità di esaurimento.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "Finora, questa settimana: "}${v.restocks} rifornimenti confermati in ${v.stores} Apple Store ${inW(v.w)}${v.change ? `, ${v.change} rispetto alla settimana prima` : ""}.${v.topStore ? ` In testa ${v.topStore}, con ${v.topStoreN}.` : ""}${v.medianSell ? ` Un rifornimento tipico di iPhone Duo è durato ${v.medianSell}.` : ""}`,
    partial: (days: number) => `Il monitoraggio copre ${days === 1 ? "1 giorno" : `${days} giorni`} di questa settimana.`,
    running: "La settimana è ancora in corso; i numeri si aggiornano a ogni rifornimento confermato.",
    tiles: {
      restocks: "rifornimenti confermati",
      stores: "negozi con un rifornimento",
      sell: "durata mediana di iPhone Duo in vendita",
      change: "rispetto alla settimana prima",
    },
    countH2: "Quanti rifornimenti ha portato la settimana?",
    countLead: (v: ReportView) => `${v.restocks} in tutto: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, su ${v.configs} configurazioni.`,
    storesH2: "Quali Apple Store hanno ricevuto più rifornimenti?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, con ${v.topStoreN} rifornimenti. Qui sotto i primi dieci.` : "Nessun negozio ha ricevuto rifornimenti questa settimana."),
    storesHead: ["#", "Apple Store", "Rifornimenti"],
    configsH2: "Quali configurazioni di iPhone Duo sono tornate?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `È tornata più spesso ${v.topConfig} (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` La meno frequente: ${v.lastConfig}.` : ""}` : "Nessuna configurazione di iPhone Duo è tornata questa settimana.",
    configsHead: ["Configurazione", "Rifornimenti"],
    sellH2: "In quanto tempo si sono esauriti i rifornimenti?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `Un rifornimento tipico di iPhone Duo è durato ${v.medianSell}; spariti entro un minuto: ${v.within60} (${v.sellN} rifornimenti cronometrati).` : "Troppi pochi esaurimenti cronometrati questa settimana per dirlo.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `La settimana prima: ${v.prevMedianSell}.` : ""),
    daysH2: "Quali giorni sono stati i più intensi?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}, con ${v.busiestDayN} rifornimenti${v.quietDay ? `; il più tranquillo: ${v.quietDay.toLowerCase()}` : ""}.` : "Non ci sono ancora rifornimenti da distribuire sui giorni."),
    daysHead: ["Giorno", "Rifornimenti"],
    weekdays: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
    prevH2: "Com'è andata rispetto alla settimana prima?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "In archivio non c'è una settimana precedente con cui confrontare." : v.change == null ? `La settimana prima ne ha registrati ${v.prevRestocks}. La variazione compare quando entrambe le settimane sono complete e monitorate per intero.` : v.changeDir === "up" ? `Più movimento: ${v.restocks} rifornimenti contro ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Più calma: ${v.restocks} rifornimenti contro ${v.prevRestocks} (${v.change}).` : `Più o meno uguale: ${v.restocks} contro ${v.prevRestocks}.`,
    prevNote: "Una settimana in corso mette a confronto una settimana parziale con una completa; leggi la variazione a settimana chiusa.",
    readH2: "Cosa significa questa settimana per chi vuole comprarne uno?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `I rifornimenti si sono concentrati di ${v.busiestDay.toLowerCase()}: tieni gli avvisi attivi per tutto quel giorno.` : "Tieni gli avvisi attivi tutti i giorni: i rifornimenti non hanno un calendario fisso.",
      v.medianSell ? `Con una durata tipica di ${v.medianSell}, la prenotazione deve partire pochi secondi dopo l'avviso.` : "Le disponibilità durano poco: agisci entro pochi secondi dall'avviso.",
      v.topStore ? `${v.topStore} ha ricevuto più rifornimenti; se ti è vicino, mettilo nel tuo avviso.` : "Tieni d'occhio i negozi che puoi raggiungere; un secondo negozio vicino raddoppia le probabilità.",
    ],
    methodH2: "Come si conta il report?",
    methodPoints: [
      "**Rifornimento:** una configurazione che in un negozio passa da non disponibile a disponibile, confermata da un secondo controllo. La prima lettura di un negozio non conta.",
      "**Settimana:** da lunedì alle 00:00 a domenica alle 24:00, nel fuso orario principale del paese.",
      "**Durata in vendita:** da un rifornimento confermato al successivo esaurimento confermato della stessa configurazione nello stesso negozio.",
    ],
    archiveH2: "Altre settimane",
    faq: (v: ReportView) => [
      { q: `Quanti iPhone ha rifornito Apple ${inW(v.w)} questa settimana?`, a: `RestockWire ha confermato ${v.restocks} rifornimenti in ${v.stores} negozi; ognuno è una configurazione che torna in un negozio, non un numero di pezzi.` },
      { q: "Apple pubblica i numeri dei rifornimenti?", a: "No. Questi conteggi sono osservazioni confermate da RestockWire sulla disponibilità per il ritiro di Apple." },
      { q: "Quando esce un nuovo report?", a: "Ogni lunedì comincia una nuova settimana; la sua pagina si riempie man mano che i rifornimenti vengono confermati e si chiude domenica sera." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Apple Store USA dove iPhone Duo finisce prima" : `Apple Store ${inW(w)}: dove finisce prima`),
    h1: (w: Where) => `Quali Apple Store ${inW(w)} esauriscono prima l'iPhone Duo?`,
    meta: (v: RankView) => `${v.fastest ?? "Il negozio più veloce"} ${inW(v.w)}: rifornimenti di iPhone Duo esauriti in ${v.fastestSec ?? "pochi secondi"} di mediana. Tutti i negozi in classifica, ultimi ${v.days} giorni, e dove hai ancora una chance.`,
    answer: (v: RankView) =>
      v.fastest
        ? `Il più veloce è ${v.fastest}: lì un rifornimento tipico di iPhone Duo si è esaurito in ${v.fastestSec} (${v.fastestN} rifornimenti cronometrati, ultimi ${v.days} giorni).${v.slowest ? ` Da ${v.slowest} è durato ${v.slowestSec}.` : ""}`
        : `Negli ultimi ${v.days} giorni ci sono troppi pochi esaurimenti cronometrati ${inW(v.w)} per stilare una classifica.`,
    tiles: { fastest: "negozio più veloce, durata mediana", slowest: "negozio più lento in classifica", ranked: "negozi in classifica", country: "mediana di tutto il paese" },
    fastH2: "I negozi più veloci",
    fastLead: (v: RankView) => `${v.ranked} negozi hanno almeno ${v.minPairs} rifornimenti cronometrati negli ultimi ${v.days} giorni. Prima la mediana più veloce.`,
    head: ["#", "Apple Store", "Durata mediana", "Più rapido", "Rifornimenti cronometrati", "Rifornimenti"],
    slowH2: "Dove hai ancora una chance?",
    slowLead: (v: RankView) => (v.slowest ? `In fondo alla classifica: da ${v.slowest} un rifornimento tipico è rimasto disponibile per ${v.slowestSec}. Più dura, più tempo hai per pagare.` : "Dati ancora insufficienti."),
    meansH2: "Cosa significa per te un negozio veloce?",
    meansPoints: (v: RankView) => [
      `Una mediana di ${v.fastestSec ?? "pochi secondi"} non lascia tempo per guardarsi intorno: tieni la configurazione nella borsa e Apple Pay pronto.`,
      "Aggiungi all'avviso un negozio vicino più lento: due negozi raddoppiano le probabilità.",
      "La velocità riflette la domanda intorno al negozio, non quanta merce arriva.",
    ],
    methodH2: "Come è costruita la classifica?",
    methodPoints: (v: RankView) => [
      `**Durata in vendita:** da un rifornimento confermato al successivo esaurimento confermato della stessa configurazione nello stesso negozio, solo iPhone Duo, ultimi ${v.days} giorni.`,
      `**Negozi in classifica:** almeno ${v.minPairs} rifornimenti cronometrati; con meno deciderebbe un solo rifornimento fortunato.`,
      "**Limiti:** i tempi sono limiti superiori fino al controllo successivo (tra 5 e 15 secondi dopo).",
    ],
    faq: (v: RankView) => [
      { q: `In quale Apple Store ${inW(v.w)} è più difficile comprare un iPhone Duo?`, a: v.fastest ? `Da ${v.fastest}: i suoi rifornimenti si sono esauriti per primi, ${v.fastestSec} di mediana.` : "Dati ancora insufficienti per dirlo." },
      { q: "Un esaurimento veloce vuol dire meno telefoni?", a: "Non per forza. Di solito vuol dire che più persone aspettano quel negozio." },
      { q: "Ogni quanto si aggiorna la classifica?", a: "Ogni pochi minuti, sugli ultimi 14 giorni." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store a confronto: rifornimenti iPhone" : `Apple Store ${inW(w)} a confronto`),
    indexH1: (w: Where) => `Due Apple Store nella stessa città: quale riceve più rifornimenti ${inW(w)}?`,
    indexMeta: (w: Where) => `Apple Store vicini ${inW(w)} fianco a fianco: rifornimenti di iPhone negli ultimi 14 giorni, l'ora abituale, quanto dura un rifornimento e quale tenere d'occhio.`,
    indexLead: (n: string) => `${n} confronti, ognuno tra un negozio e il suo vicino più prossimo nella stessa città.`,
    title: (a: string, b: string) => `${a} o ${b}: chi ha più rifornimenti?`,
    h1: (a: string, b: string) => `${a} o ${b}: quale riceve più rifornimenti di iPhone?`,
    meta: (v: CompareView) => `${v.a.name} contro ${v.b.name}, a ${v.distance} di distanza (${v.city}): rifornimenti di iPhone negli ultimi ${v.days} giorni, ora abituale, durata in vendita e quale negozio seguire.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} e ${v.b.name} hanno ricevuto rifornimenti con la stessa frequenza` : `${(v.more === "a" ? v.a : v.b).name} ha ricevuto più rifornimenti`;
      const nums = ` (${v.a.restocks} contro ${v.b.restocks} negli ultimi ${v.days} giorni)`;
      const slow = v.slower ? ` I rifornimenti sono durati di più da ${(v.slower === "a" ? v.a : v.b).name}, e lì hai più tempo per pagare.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Fianco a fianco, ultimi ${days} giorni`,
    rows: { restocks: "Tutti i rifornimenti", duo: "Rifornimenti di iPhone Duo", peak: "Ora abituale dei rifornimenti (locale)", sell: "Durata mediana di iPhone Duo", sellN: "Rifornimenti cronometrati", last: "Ultimo rifornimento" },
    none: "dati insufficienti",
    moreH2: "Quale negozio riceve più rifornimenti di iPhone?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Nessuno dei due: entrambi ne hanno avuti ${v.a.restocks}.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, ${v.ratio} rispetto all'altro` : ""}.`),
    hourH2: "A che ora riceve i rifornimenti ciascuno?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} il più delle volte verso le ${v.a.peak}; ${v.b.name} verso le ${v.b.peak}.` : "Uno dei due ha ancora troppi pochi rifornimenti per indicare un'ora abituale.",
    sellH2: "Dove dura di più un rifornimento?",
    sellLead: (v: CompareView) =>
      v.slower ? `Da ${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} contro ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "Ancora nessuna differenza netta: troppo pochi esaurimenti cronometrati, oppure le due mediane distano meno del 15%.",
    pickH2: "Quale conviene seguire?",
    pickPoints: (v: CompareView) => [
      `Entrambi: sono a ${v.distance} l'uno dall'altro, e un piano di avvisi copre più negozi.`,
      v.more !== "tie" ? `Se puoi raggiungerne solo uno, ${(v.more === "a" ? v.a : v.b).name} ha ricevuto rifornimenti più spesso.` : "Se puoi raggiungerne solo uno, scegli il più vicino: i rifornimenti sono alla pari.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} ti dà più secondi per ogni rifornimento.` : "Le durate in vendita non indicano ancora un vincitore.",
    ],
    methodH2: "Da dove vengono questi numeri?",
    methodPoints: (v: CompareView) => [
      `Rifornimenti confermati da RestockWire in entrambi i negozi negli ultimi ${v.days} giorni; un rifornimento conta quando un secondo controllo lo conferma.`,
      "L'ora abituale si indica solo da 5 rifornimenti distribuiti su 3 giorni.",
      "Le durate in vendita sono limiti superiori fino al controllo successivo, solo iPhone Duo.",
    ],
    storePages: "Pagine dei negozi",
    otherPairs: "Altri confronti",
    faq: (v: CompareView) => [
      { q: `Meglio ${v.a.name} o ${v.b.name} per ritirare un iPhone Duo?`, a: v.more === "tie" ? "Negli ultimi 14 giorni hanno ricevuto rifornimenti con la stessa frequenza; scegli il più vicino o seguili entrambi." : `Negli ultimi 14 giorni ${(v.more === "a" ? v.a : v.b).name} ha ricevuto rifornimenti più spesso.` },
      { q: "Posso seguire entrambi i negozi?", a: "Sì, con due avvisi. Un avviso è un negozio più una configurazione, quindi due negozi usano due avvisi del tuo piano." },
      { q: "I due negozi ricevono i rifornimenti alla stessa ora?", a: "Di solito no. Ogni negozio ha le sue consegne; confronta le ore abituali qui sopra." },
    ],
  },

  guides: {
    watch: {
      title: "Avvisi di rifornimento iPhone su Apple Watch",
      h1: "Come ricevere gli avvisi di rifornimento di iPhone su Apple Watch?",
      meta: "Gli avvisi di rifornimento di RestockWire al polso: app sulla schermata Home, notifiche attive, duplicazione nell'app Watch e le impostazioni che li mandano invece su iPhone.",
      answer: (live: string | null) =>
        `Aggiungi RestockWire alla schermata Home di iPhone, attiva le sue notifiche e lascia attiva la duplicazione nell'app Watch: gli avvisi arrivano su Apple Watch ogni volta che iPhone è bloccato.${live ? ` Con rifornimenti che durano ${live} di mediana, un tocco al polso ti fa risparmiare i secondi che servono a cercare il telefono.` : ""}`,
      sections: [
        {
          h2: "Che cosa serve prima?",
          lead: "Un iPhone con iOS 16.4 o successivo, RestockWire sulla schermata Home e le notifiche consentite.",
          points: [
            "Apri restockwire.com in Safari, tocca Condividi, poi Aggiungi alla schermata Home.",
            "Apri RestockWire dalla schermata Home, accedi e tocca Accendi le notifiche.",
            "Consenti la richiesta. Da lì le notifiche della web app si comportano come quelle di ogni altra app, sulla schermata di blocco e nel Centro Notifiche.",
          ],
        },
        {
          h2: "Come arrivano gli avvisi sull'orologio?",
          lead: "Con la duplicazione: Apple manda ogni notifica a un solo dispositivo, all'orologio quando iPhone è bloccato o in stop.",
          points: [
            "iPhone sbloccato e in uso: l'avviso compare su iPhone, non sull'orologio.",
            "iPhone bloccato o in stop e orologio sbloccato al polso: l'avviso va all'orologio.",
            "Orologio bloccato o in Non disturbare: l'avviso va invece a iPhone.",
          ],
        },
        {
          h2: "Quali impostazioni di Apple Watch controllare?",
          lead: "Due: la duplicazione per RestockWire e se gli avvisi compaiono anche con il polso abbassato.",
          points: [
            "Su iPhone apri l'app Watch, tocca Notifiche e guarda sotto Duplica avvisi di iPhone da (Mirror iPhone Alerts From). Se RestockWire è nell'elenco, lascialo attivo.",
            "Le notifiche compaiono quando alzi il polso. Per vederle senza alzarlo, attiva Mostra notifiche con il polso abbassato (Show Notifications on Wrist Down).",
            "La modalità Risparmio energetico spegne il display sempre attivo, quindi potresti dover alzare il polso per leggere un avviso.",
          ],
        },
        {
          h2: "Cosa fare quando l'avviso ti tocca il polso?",
          lead: "Agisci su iPhone entro pochi secondi: la prenotazione vera e propria si fa su apple.com.",
          points: [
            "Leggi negozio e configurazione sull'orologio, poi sblocca iPhone.",
            "Tocca l'avviso su iPhone per aprire la pagina del negozio e il link ad Apple.",
            "Tieni Apple Pay configurato su apple.com, così il pagamento richiede un paio di tocchi.",
          ],
        },
      ],
      faq: [
        { q: "Gli avvisi di RestockWire funzionano su Apple Watch?", a: "Sì. Le notifiche di una web app sulla schermata Home compaiono su un Apple Watch abbinato come quelle di qualunque app." },
        { q: "Perché l'avviso è comparso su iPhone e non sull'orologio?", a: "iPhone era sbloccato, oppure l'orologio era bloccato o in Non disturbare; in quei casi Apple consegna a iPhone." },
        { q: "Serve un'app separata per l'orologio?", a: "No. L'orologio mostra gli avvisi che riceve iPhone; sull'orologio non c'è niente da installare." },
      ],
      sources: [
        { label: "WebKit: Web Push per le web app su iOS e iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Supporto Apple: le notifiche su Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Manuale utente di Apple Watch: gestire le notifiche", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Avvisi di rifornimento iPhone con Full immersion",
      h1: "Come far passare gli avvisi di rifornimento con Full immersion e Riepilogo programmato?",
      meta: "Fai passare gli avvisi di RestockWire attraverso una Full immersion, tienili fuori dal Riepilogo programmato e falli suonare sulla schermata di blocco. Passo per passo, da iOS 16.4.",
      answer: (live: string | null) =>
        `Aggiungi RestockWire alle app consentite di ogni Full immersion e imposta le sue notifiche su Consegna immediata: così un avviso di rifornimento suona anche con una Full immersion attiva.${live ? ` Un rifornimento dura ${live} di mediana: un avviso trattenuto per un riepilogo arriva troppo tardi.` : ""}`,
      sections: [
        {
          h2: "Come consentire RestockWire in una Full immersion?",
          lead: "In Impostazioni apri Full immersion, scegli la modalità, tocca App e aggiungi RestockWire sotto Consenti notifiche da.",
          points: [
            "Apple permette a una Full immersion di consentire o silenziare specifiche web app aggiunte alla schermata Home.",
            "Ripeti per ogni Full immersion che usi: Riposo, Lavoro, Personale e quelle che hai creato tu.",
            "Le impostazioni di Full immersion per una web app con lo stesso nome si sincronizzano sugli altri tuoi dispositivi Apple.",
          ],
        },
        {
          h2: "Come tenere gli avvisi fuori dal Riepilogo programmato?",
          lead: "Lascia RestockWire non selezionato nell'elenco del riepilogo, oppure imposta la consegna su immediata.",
          points: [
            "Impostazioni > Notifiche > Riepilogo programmato: l'elenco dalla A alla Z decide quali app vengono trattenute per il riepilogo.",
            "Oppure Impostazioni > Notifiche > RestockWire > Consegna notifiche > Consegna immediata.",
            "Un rifornimento trattenuto fino a un riepilogo delle 8:00 a quell'ora è esaurito da un pezzo.",
          ],
        },
        {
          h2: "Quali impostazioni delle notifiche contano di più?",
          lead: "Consenti notifiche attivo, Schermata di blocco e Banner attivi, Suoni attivi.",
          points: [
            "Lo stile banner Persistente tiene l'avviso sullo schermo finché non lo tocchi.",
            "Mostra anteprime impostato su Se sbloccato nasconde negozio e configurazione a schermo bloccato; scegli Sempre se vuoi leggerli a colpo d'occhio.",
            "Apple non documenta un livello Urgenti (Time Sensitive) per le notifiche delle web app, quindi non contarci per superare una Full immersion: lo fa l'elenco delle app consentite.",
          ],
        },
        {
          h2: "Come provarlo?",
          lead: "Mandati una notifica di prova dal tuo account RestockWire con una Full immersion attiva.",
          points: [
            "Apri RestockWire dalla schermata Home, vai al tuo account e tocca Invia una notifica di prova.",
            "Attiva la Full immersion che usi di più e inviane un'altra.",
            "Se arriva senza suono o non arriva, ricontrolla l'elenco delle app consentite della Full immersion e l'impostazione di consegna.",
          ],
        },
      ],
      faq: [
        { q: "Una Full immersion blocca gli avvisi di RestockWire?", a: "Sì, a meno che RestockWire sia tra le app consentite di quella Full immersion. Aggiungilo una volta per ciascuna." },
        { q: "RestockWire può inviare notifiche urgenti (Time Sensitive)?", a: "Apple non documenta questo livello per le notifiche push delle web app, quindi RestockWire si affida all'elenco delle app consentite della Full immersion." },
        { q: "Perché i miei avvisi arrivano tutti insieme al mattino?", a: "Li trattiene il Riepilogo programmato. Imposta RestockWire su Consegna immediata." },
      ],
      sources: [
        { label: "Manuale utente di iPhone: consentire o silenziare le notifiche per una Full immersion", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "Manuale utente di iPhone: modificare le impostazioni delle notifiche", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: Web Push per le web app su iOS e iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "Avvisi di rifornimento iPhone su Android e Wear OS",
      h1: "Si possono ricevere gli avvisi di rifornimento di iPhone su Android o su un orologio Wear OS?",
      meta: "Cerchi un iPhone da un telefono Android? Gli avvisi di RestockWire funzionano in Chrome senza installare nulla e arrivano anche su un orologio Wear OS o Galaxy abbinato.",
      answer: (live: string | null) =>
        `Sì. Apri RestockWire in Chrome su Android, accedi e consenti le notifiche quando Chrome lo chiede; gli avvisi arrivano come quelli di qualunque app e possono passare a un orologio abbinato.${live ? ` Le disponibilità durano ${live} di mediana: tieni le notifiche ben udibili.` : ""}`,
      sections: [
        {
          h2: "Come attivare gli avvisi in Chrome?",
          lead: "Accedi a restockwire.com in Chrome e tocca Consenti quando il sito chiede di inviare notifiche.",
          points: [
            "Niente da installare: Chrome chiede il permesso quando un sito vuole inviarti notifiche.",
            "Se in passato hai toccato Blocca, apri le impostazioni del sito dalla barra degli indirizzi e consenti le notifiche.",
            "Su Android aggiungere RestockWire alla schermata Home è facoltativo; dà al sito una sua icona.",
          ],
        },
        {
          h2: "Gli avvisi arrivano su un orologio Wear OS o Galaxy?",
          lead: "Di solito sì: le notifiche del telefono passano per impostazione predefinita a un orologio Wear OS abbinato.",
          points: [
            "È Chrome a pubblicare gli avvisi di RestockWire, quindi l'orologio li mostra sotto Chrome.",
            "Su un Galaxy Watch apri Galaxy Wearable > Impostazioni orologio > Notifiche > Notifiche app (Watch settings > Notifications > App notifications) e lascia attivo Chrome.",
            "Se gli avvisi si fermano, controlla che il risparmio batteria non limiti Chrome in background.",
          ],
        },
        {
          h2: "E su un portatile?",
          lead: "Chrome, Edge e Firefox su un computer mostrano gli stessi avvisi finché il browser è aperto.",
          points: [
            "Accedi e consenti le notifiche nel browser che tieni aperto più spesso.",
            "Ogni dispositivo con le notifiche attive riceve ogni avviso.",
            "Se nessun dispositivo ha le notifiche attive, RestockWire invia l'avviso per email.",
          ],
        },
      ],
      faq: [
        { q: "Serve un iPhone per usare RestockWire?", a: "No. Qualunque telefono o computer con un browser che supporta le notifiche web può ricevere gli avvisi." },
        { q: "Perché l'orologio mostra l'avviso sotto Chrome?", a: "Su Android è Chrome a consegnare le notifiche dei siti web, quindi l'orologio le elenca sotto Chrome." },
        { q: "Posso ricevere gli avvisi su due telefoni?", a: "Sì. Accedi e consenti le notifiche su ciascuno; ogni dispositivo riceve ogni avviso." },
      ],
      sources: [
        { label: "Guida di Google Chrome: usare le notifiche", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: notifiche su Wear OS", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: gestire le notifiche su un Galaxy Watch", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Altre guide agli avvisi sul telefono",
  },
};
