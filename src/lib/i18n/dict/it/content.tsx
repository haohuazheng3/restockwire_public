/**
 * Italian strings: content — SEO building blocks, the enrich helpers (hours, durations, FAQ answers, titles),
 * live {{tokens}}, the restock-pattern sentence and photo alt text. Arguments arrive already in Italian.
 */
import type { ReactNode } from "react";
import type { Forms } from "@/lib/i18n/format";
import type { Dict } from "../en";
import { ad, aLuogo, cap, inNome, nounForms, tuttiPlural } from "./util";

const f = (x: Forms): Forms => x;
type Kind = "state" | "city" | "store" | "model";
/** "il martedì" / "la domenica". */
const ilDay = (d: string) => (/^domenic/i.test(d) ? `la ${d}` : `il ${d}`);

export const content: Dict["content"] = {
  hours: {
    everyDay: (hours: string) => `${hours}, sette giorni su sette`,
    closed: "Chiuso",
    tomorrow: "domani",
    dayAt: (day: string, time: string) => `${day}, ore ${time}`,
    closedTodayOpens: (next: string) => `Oggi chiuso · riapre ${next}`,
    closedToday: "Oggi chiuso",
    opensAt: (time: string) => `Apertura alle ${time}`,
    openNow: (closes: string) => `Aperto · chiusura alle ${closes}`,
    closedNowOpens: (next: string) => `Adesso chiuso · riapre ${next}`,
    closedNow: "Adesso chiuso",
  },

  duration: {
    underAMinute: "sotto il minuto",
    pair: (a: string, b: string) => `${a} ${b}`,
  },
  listMore: (n: string) => `altri ${n}`,
  nearLine: (place: string, distance: string) => `${place} (${distance})`,

  faq: {
    where: (kind: Kind, place: string) => (kind === "store" ? `da ${place}` : kind === "model" ? `per l'${place}` : aLuogo(place)),
    nRestocks: f({ one: "# rifornimento", other: "# rifornimenti" }),
    restockA: ({ count, where, days, week, peak }: { count: string | null; where: string; days: string; week: string; peak: { hour: string; day: string | null } | null }) =>
      `${count == null ? `Zero rifornimenti ${where} negli ultimi ${days} giorni` : `${count} ${where} negli ultimi ${days} giorni (${week} nell'ultima settimana)`}${peak ? `, concentrati verso le ${peak.hour} ora locale${peak.day ? `, con ${ilDay(peak.day)} come giorno più intenso` : ""}` : ""}; Apple non annuncia alcun calendario.`,
    lastsNone: (where: string) => `Finora troppo pochi rifornimenti ${where} si sono esauriti per dare un numero.`,
    lasts: (days: string, duration: string) => `Circa ${duration} (mediana): è quanto una configurazione rifornita è rimasta ritirabile prima di esaurirsi, negli ultimi ${days} giorni.`,
    storeIn: (store: string, line: string) => `${store} ${ad(line)}`,
    nearestA: (stores: string) => `${stores}.`,

    modelStockQ: (model: string) => `Dove si può ritirare l'${model} in questo momento?`,
    modelStockNone: (model: string) => `Nessun Apple Store degli Stati Uniti lo aveva all'ultima lettura; questa pagina mostra il primo nell'istante in cui l'${model} diventa ritirabile.`,
    nUsStores: f({ one: "# Apple Store negli USA", other: "# Apple Store negli USA" }),
    modelStockSome: (count: string) => `${count} all'ultima lettura, ciascuno in elenco in questa pagina con le sue configurazioni.`,
    priceQ: (model: string) => `Che prezzo ha l'${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Sbloccato, ${low}–${high} secondo la capacità (${storages}). Colori: ${colors}.`,
    modelRestockQ: (model: string) => `Con che frequenza torna l'${model}?`,
    modelLastsQ: (model: string) => `Quando l'${model} torna, per quanto resta ritirabile?`,
    reserveQ: (model: string) => `Si può prenotare l'${model} per il ritiro?`,
    reserveA: "Non in anticipo: quando un negozio mette a disposizione la tua configurazione la ordini su apple.com con il Ritiro in negozio, e Apple la tiene da parte per la fascia oraria che scegli.",

    storeStockQ: (store: string, model: string) => `${store} ha l'${model}?`,
    nConfigs: f({ one: "# configurazione", other: "# configurazioni" }),
    storeStockYes: (count: string) => `Sì: ${count} all'ultima lettura, con capacità e colore nella tabella di questa pagina.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `Non all'ultimo controllo${other ? `. In compenso: iPhone 18 Pro in ${other.pro} configurazioni, 18 Pro Max in ${other.proMax}` : "; mancano anche 18 Pro e 18 Pro Max"}.`,
    hoursQ: (store: string) => `Quando è aperto ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${today ? `Oggi ${today}. ` : ""}${hours ? `Settimana: ${hours}` : "Orari completi nella tabella della pagina"}. Indirizzo ${address}${phone ? `, telefono ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `${store}: con che frequenza tornano gli iPhone?`,
    storeLastsQ: (store: string) => `Quanto resta ritirabile un rifornimento da ${store}?`,
    storeNearestQ: (store: string) => `Vicino ${ad(store)}, quali altri Apple Store ci sono?`,

    placeStockQ: (place: string, model: string) => `Quali Apple Store ${aLuogo(place)} hanno l'${model} ritirabile in questo momento?`,
    placeStockNone: (place: string, model: string) => `Nessuno all'ultima lettura; appena un negozio ${aLuogo(place)} mette a disposizione l'${model}, compare in questa pagina.`,
    nStores: f({ one: "# negozio", other: "# negozi" }),
    placeStockSome: (count: string, stores: string) => `${count} all'ultima lettura: ${stores}.`,
    countQ: (place: string) => `${cap(aLuogo(place))}, quanti Apple Store ci sono?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count: string, stores: string) => `${count}. Per esempio: ${stores}.`,
    countOne: (count: string, store: string) => `${count}, cioè ${store}.`,
    placeRestockQ: (place: string) => `Ogni quanto vengono riforniti gli iPhone ${aLuogo(place)}?`,
    placeLastsQ: (place: string) => `Quanto dura la disponibilità ${aLuogo(place)} quando torna?`,
    placeNearestQ: (place: string) => `Quali Apple Store fuori da ${place} sono i più vicini?`,
  },

  explainer: (kind: Kind, place: string) => {
    const at = kind === "store" ? `Da ${place}` : kind === "model" ? "In ogni Apple Store degli Stati Uniti" : `Negli Apple Store ${aLuogo(place)}`;
    return [
      "Il Ritiro in negozio è un acquisto su apple.com: scegli configurazione e negozio al momento del pagamento, paghi online e ritiri di persona, spesso in giornata. I negozi degli operatori e la merce sugli scaffali sono un'altra cosa.",
      `${at} RestockWire legge ogni configurazione monitorata ogni 15 secondi, oppure ogni 5 secondi dove c'è un avviso. Un cambiamento conta solo se lo conferma un secondo controllo, così un errore isolato non appare mai come un rifornimento o un esaurimento.`,
      "Ogni cambiamento confermato entra nel registro, e dal registro nascono il grafico dei rifornimenti e lo storico di questa pagina.",
    ];
  },
  alertRule: "Un avviso è un negozio più un telefono esatto (modello, capacità, colore); pochi secondi dopo che apple.com passa a «disponibile» parte una notifica push, oppure un'email se nessun dispositivo riceve notifiche.",

  titles: {
    state: (name: string, duoNow: string, stores: string) => [
      `Apple Store ${name}: iPhone Duo in ${duoNow} negozi su ${stores}`,
      `Apple Store ${name}: iPhone Duo per il ritiro, in diretta`,
      `Apple Store ${name}: disponibilità iPhone Duo ora`,
      `Apple Store ${name}: disponibilità iPhone in diretta`,
    ],
    city: (city: string, code: string, duoNow: string, stores: string) => [
      `Apple Store ${city} (${code}): iPhone Duo in ${duoNow} su ${stores}`,
      `Apple Store ${city} (${code}): iPhone Duo per il ritiro, in diretta`,
      `Apple Store ${city} (${code}): disponibilità iPhone Duo ora`,
      `Apple Store ${city}: disponibilità iPhone in diretta`,
    ],
    store: (name: string, region: string | null) => {
      const r = region ? ` (${region})` : "";
      return [
        `${name}${r}: iPhone in diretta, orari dei rifornimenti, ritiro`,
        `${name}${r}: iPhone in diretta e orari dei rifornimenti`,
        `${name}${r}: iPhone in diretta e orari`,
        `${name}: iPhone in diretta, orari dei rifornimenti, ritiro`,
        `${name}: iPhone in diretta e orari`,
        `${name}: disponibilità iPhone in diretta`,
        `${name} – in diretta`,
      ];
    },
    model: (name: string, storesNow: string) => [
      `${name}: ritirabile ora in ${storesNow} Apple Store`,
      `${name} per il ritiro: ${storesNow} Apple Store ora`,
      `${name}: ritiro in negozio, in diretta`,
    ],
  },

  tokens: {
    tooFewToMeasure: "dati ancora insufficienti",
    noneLoggedYet: "registro ancora vuoto",
    noneYet: "finora nessuno",
  },

  pattern: {
    none: (days: string) => `In ${days} giorni, nessun rifornimento confermato.`,
    nConfirmed: f({ one: "# rifornimento con doppio controllo", other: "# rifornimenti con doppio controllo" }),
    countIn: (count: string, days: string) => `${count} in ${days} giorni`,
    stay: (minutes: string) => `; un rifornimento di solito resta ritirabile ~${minutes} min`,
    nDays: f({ one: "# giorno", other: "# giorni" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` in ${onDays}` : ""}, non ancora abbastanza per un orario tipico${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Orario tipico dei rifornimenti: le ${hour} ora locale${weekday ? `, con ${ilDay(weekday)} come giorno più intenso` : ""}; ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(nounForms).map(([k, v]) => [k, { one: v.one, other: v.other }])) as Record<string, Forms>,

  measured: "Come misuriamo i numeri",

  faqTitle: "Domande e risposte",
  breadcrumb: "Dove ti trovi",
  keepExploring: "Altro da RestockWire",
  browse: {
    storesByState: "Negozi stato per stato",
    allStatesCities: "Ogni stato, ogni città →",
    liveByModel: "Disponibilità in diretta, modello per modello",
    modelStock: (model: string) => `Disponibilità ${model}`,
    thisPage: "sei qui",
    restockLog: (short: string) => `Storico rifornimenti ${short}`,
    liveMap: "Mappa in diretta",
    mostStores: "Dove ci sono più negozi",
    allStates: "L'elenco degli stati",
    bigCities: "Le città principali",
    cities: "Città",
    storesBy: (region: string) => `Negozi, ${region} per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Ogni Apple Store {inNome(country)}, in elenco →</>,
    allRegions: (regions: string) => tuttiPlural(regions),
  },
  modelCards: "Scegli un iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Ultimo ritorno: {config}{at}, {ago}.</>,
    at: (store: ReactNode) => <> da {store}</>,
  },
  statStrip: {
    inStockNow: "Ritirabili ora",
    ofStores: (n: string) => `su ${n} negozi`,
    stores: "Negozi",
    nCities: f({ one: "# città", other: "# città" }),
    tracked: "sotto controllo",
    modelNow: (short: string) => `${short} ora`,
    configsInStock: "configurazioni ritirabili",
    storesWithStock: f({ one: "negozio che ce l'ha", other: "negozi che ce l'hanno" }),
    restocks24h: "Rifornimenti, 24 h",
    restocksHint: (week: string, month: string, days: string) => `${week} in 7 g · ${month} in ${days} g`,
    sellOuts: (days: string) => `Esaurimenti ${days} g`,
    stays: (duration: string) => `resta ~${duration}`,
    noPairs: "ancora nessun esaurimento abbinato",
    lastRestock: "Rifornimento più recente",
    noneYet: "finora nessuno",
    inLastDays: (days: string) => `in ${days} giorni`,
  },
  product: {
    chooseIphone: "Scegli il tuo iPhone",
    storage: "Capacità",
    color: "Colore",
    all: "Tutti",
    numbersAre: (unit: ReactNode) => <>Ogni numero conta {unit} che lo hanno ora.</>,
    seen: (ago: ReactNode) => <>comparso {ago}</>,
    last: (ago: ReactNode) => <>ultima volta {ago}</>,
    notSeenYet: "finora mai comparso",
    firstCheckPending: "il primo controllo sta per partire",
    inStock: "Disponibile",
    inStockLower: "disponibile",
    none: "nessuno",
    here: "qui",
    notAvailable: "Non disponibile",
    notCheckedYet: "In attesa di controllo",
    availableForPickup: "Ritirabile in negozio",
    since: (ago: ReactNode) => <> · ritirabile da {ago}</>,
    lastInStock: (ago: ReactNode) => <>Ritirabile l&apos;ultima volta {ago}</>,
    neverSeen: "Finora mai ritirabile in questo negozio",
    firstCheckSoon: "Primo controllo tra meno di un minuto",
    buy: "Ordina su apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Letto {checked} · {note}</>,
    checkNote: "15 s per tutti, 5 s se c'è un avviso",
  },

  source: (source: ReactNode) => <>Dati: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Fonti",
  allUsStores: "ognuno dei 269 Apple Store degli Stati Uniti",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Controlli in diretta di RestockWire dal {since}: ogni configurazione di iPhone Duo, 18 Pro e 18 Pro Max in {where}, letta ogni 15 secondi (ogni 5 secondi dove c&apos;è un avviso); numeri di questa pagina aggiornati al {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>In diretta: quanti dei {stores} Apple Store hanno ogni configurazione di {model} ritirabile</>,
    storage: "Capacità",
    pricesCaption: (model: ReactNode) => <>{model}, listino apple.com (sbloccato, tasse escluse) e ritiro live a confronto</>,
    price: "Prezzo",
    bestColor: "Colore più presente, negozi ora",
    noRestock: (model: string) => `Per l'${model} non c'è ancora nessun rifornimento nel registro.`,
    clockLabel: (model: string) => `${model}, tutti i negozi del paese`,
    storesWithIt: "Negozi che lo hanno ora",
    pairsInStock: "Coppie negozio × configurazione ritirabili",
    restocksLogged: "Ritorni registrati",
    medianTime: "Durata mediana in vetrina",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Italian alt text and captions for the generic photos and Italy's place photos; other ids fall back to English. */
  photos: {
    "apple-store-crowd-inside": { alt: "Clienti che provano i dispositivi ai tavoli di un Apple Store dentro un centro commerciale di Bangkok", caption: "In negozio i tavoli servono per le prove; la fila del ritiro si forma in fondo." },
    "apple-store-glass-canopy": { alt: "Esterno di un Apple Store moderno in vetro sul fiume, nel centro di Chicago", caption: "Vetro e acciaio sul fiume di Chicago: un Apple Store visto da fuori." },
    "apple-store-night-vancouver": { alt: "Vancouver dall'alto di notte, con lo skyline e il ponte illuminati", caption: "Vancouver di notte. I rifornimenti possono arrivare a qualunque ora, ma la mattina resta la fascia più frequente." },
    "apple-store-pickup-counter": { alt: "Atrio luminoso di un centro commerciale con un Apple Store e le scale mobili", caption: "Nei negozi dentro i centri commerciali il ritiro si rifornisce prima dell'apertura." },
    "city-map-phone": { alt: "Una giovane coppia segue il navigatore sul telefono durante un viaggio in campagna", caption: "Prima di partire, controlla quanta strada c'è fino al negozio." },
    "phone-card-payment": { alt: "Una donna paga contactless con lo smartphone avvicinandolo a un terminale", caption: "Pagamento dal telefono: con il Ritiro in negozio si salda tutto prima di arrivare." },
    "phone-hand-camera": { alt: "Primo piano di una mano che tiene uno smartphone con cover arancione e tre obiettivi", caption: "Tre obiettivi: la fotocamera è il motivo per cui i Pro finiscono per primi." },
    "phone-map": { alt: "Primo piano all'aperto di una mano che tiene uno smartphone con un'app di mappe aperta", caption: "Un rifornimento può durare un minuto: conta quanto sei lontano." },
    "phone-notification": { alt: "Primo piano di una mano che tiene uno smartphone con una frase motivazionale sullo schermo", caption: "Lo schermo del telefono è il posto dove arriva l'avviso." },
    "phone-on-box": { alt: "Uno smartphone nella sua confezione su fondo bianco", caption: "La confezione chiusa: l'obiettivo finale di ogni avviso." },
    "place-it-florence": { alt: "Firenze al crepuscolo, con il Duomo e le colline sullo sfondo", caption: "Firenze al crepuscolo, il Duomo al centro." },
    "place-it-italy": { alt: "Architettura storica di Roma illuminata dalla luce calda del tramonto", caption: "Roma al tramonto, tra monumenti e cupole." },
    "place-it-milan": { alt: "Cielo scuro e temporalesco sopra uno skyline moderno al crepuscolo", caption: "Milano: grattacieli sotto un cielo da temporale." },
    "place-it-rome": { alt: "Il Colosseo e i palazzi intorno, ripresi dall'alto con un drone", caption: "Il Colosseo visto dal drone, Roma." },
    "place-it-rome-region": { alt: "I tetti di Roma con la cupola di San Pietro tra gli edifici storici", caption: "La cupola di San Pietro sopra i tetti di Roma." },
    "place-it-turin": { alt: "Torino con la Mole Antonelliana e le Alpi sotto un cielo azzurro", caption: "Torino, la Mole e le Alpi in una giornata limpida." },
    "compare-pickup-bag": { alt: "Due persone si passano una borsa della spesa in un ambiente interno", caption: "Il ritiro finisce al banco; la scelta del negozio giusto comincia molto prima." },
    "compare-two-stores": { alt: "Passanti riflessi nella vetrina di un negozio su una strada affollata", caption: "Due negozi della stessa città spesso riassortiscono in orari diversi." },
    "guide-android-phone": { alt: "Mano che tiene uno smartphone Android con la schermata Home", caption: "Su Android gli avvisi arrivano tramite Chrome, senza installare nulla." },
    "guide-android-watch": { alt: "Primo piano di una donna con uno smartwatch al polso", caption: "Uno smartwatch Wear OS abbinato mostra gli avvisi che Chrome riceve." },
    "guide-focus-desk": { alt: "Giovane donna controlla lo smartphone alla scrivania dell’ufficio, accanto al portatile", caption: "La modalità Full immersion «Lavoro» è quella in cui ci si dimentica di consentire RestockWire." },
    "guide-focus-phone-night": { alt: "Donna usa lo smartphone in una camera buia, illuminata dallo schermo", caption: "La modalità «Sonno» silenzia gli avvisi se RestockWire non è tra le app consentite." },
    "guide-watch-notification": { alt: "Mano che tocca uno smartwatch al polso, all’aperto", caption: "Leggi il negozio sul polso, poi prenota sull’iPhone." },
    "guide-watch-wrist": { alt: "Primo piano in bianco e nero di uno smartwatch con notifiche al polso", caption: "Con l’iPhone bloccato, l’avviso di riassortimento arriva sull’orologio." },
    "ranking-checkout": { alt: "Cliente che paga con lo smartphone al terminale di cassa di un negozio", caption: "Nei negozi più rapidi la prenotazione va chiusa pochi secondi dopo l’avviso." },
    "ranking-queue": { alt: "Persone in fila davanti a un negozio affollato in una via di città", caption: "Gli esaurimenti rapidi seguono la domanda intorno al negozio, non la quantità consegnata." },
    "reports-delivery-boxes": { alt: "Scatoloni impilati davanti alle banchine di carico di un magazzino", caption: "La merce arriva ai negozi con le consegne; il report settimanale conta ciò che arriva allo scaffale del ritiro." },
    "reports-iphone-boxes": { alt: "Un nuovo iPhone con scatola e accessori di ricarica su un tavolo di legno", caption: "Ogni riassortimento nel report è una configurazione che torna in un negozio." },
    "status-phone-check": { alt: "Donna che osserva da vicino lo smartphone in una stanza poco illuminata", caption: "In attesa di una verifica del ritiro: i minuti in cui conta sapere lo stato della richiesta." },
    "status-store-counter": { alt: "Mano che tiene uno smartphone con un’icona di caricamento", caption: "Una richiesta bloccata appare così; la pagina di stato dice se dipende da Apple o dal tuo telefono." },
  },
};
