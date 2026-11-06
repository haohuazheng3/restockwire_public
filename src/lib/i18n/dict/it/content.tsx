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
    closed: "Chiuso",
    everyDay: (hours: string) => `Tutti i giorni ${hours}`,
    tomorrow: "domani",
    dayAt: (day: string, time: string) => `${day} alle ${time}`,
    closedTodayOpens: (next: string) => `Chiuso oggi · apre ${next}`,
    closedToday: "Chiuso oggi",
    opensAt: (time: string) => `Apre alle ${time}`,
    openNow: (closes: string) => `Aperto ora · chiude alle ${closes}`,
    closedNowOpens: (next: string) => `Chiuso ora · apre ${next}`,
    closedNow: "Chiuso ora",
  },

  duration: {
    underAMinute: "meno di un minuto",
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
    nUsStores: f({ one: "# Apple Store degli Stati Uniti", other: "# Apple Store degli Stati Uniti" }),
    modelStockSome: (count: string) => `${count} all'ultima lettura, ciascuno in elenco in questa pagina con le sue configurazioni.`,
    priceQ: (model: string) => `Quanto costa l'${model}?`,
    priceA: (low: string, high: string, storages: string, colors: string) => `Da ${low} a ${high} sbloccato, in base alla capacità (${storages}), nei colori ${colors}.`,
    modelRestockQ: (model: string) => `Ogni quanto viene rifornito l'${model}?`,
    modelLastsQ: (model: string) => `Quando l'${model} torna, per quanto resta ritirabile?`,
    reserveQ: (model: string) => `Si può prenotare l'${model} per il ritiro?`,
    reserveA: "Non in anticipo: quando un negozio mette a disposizione la tua configurazione la ordini su apple.com con il Ritiro in negozio, e Apple la tiene da parte per la fascia oraria che scegli.",

    storeStockQ: (store: string, model: string) => `${store} ha l'${model}?`,
    nConfigs: f({ one: "# configurazione", other: "# configurazioni" }),
    storeStockYes: (count: string) => `Sì: ${count} all'ultima lettura, con capacità e colore nella tabella di questa pagina.`,
    storeStockNo: (other: { pro: string; proMax: string } | null) => `No, non all'ultima lettura${other ? `; ha però ${other.pro} configurazioni di iPhone 18 Pro e ${other.proMax} di 18 Pro Max` : ", e non ha nemmeno configurazioni di 18 Pro o 18 Pro Max"}.`,
    hoursQ: (store: string) => `Quando è aperto ${store}?`,
    hoursA: ({ hours, today, address, phone }: { hours: string | null; today: string | null; address: string; phone: string | null }) =>
      `${hours ? cap(hours) : "Vedi la tabella degli orari in questa pagina"}${today ? `; oggi ${today}` : ""}; indirizzo: ${address}${phone ? `, tel. ${phone}` : ""}.`,
    storeRestockQ: (store: string) => `Ogni quanto vengono riforniti gli iPhone da ${store}?`,
    storeLastsQ: (store: string) => `Quanto resta ritirabile un rifornimento da ${store}?`,
    storeNearestQ: (store: string) => `Quali Apple Store sono più vicini ${ad(store)}?`,

    placeStockQ: (place: string, model: string) => `Quali Apple Store ${aLuogo(place)} hanno l'${model} ritirabile in questo momento?`,
    placeStockNone: (place: string, model: string) => `Nessuno all'ultima lettura; appena un negozio ${aLuogo(place)} mette a disposizione l'${model}, compare in questa pagina.`,
    nStores: f({ one: "# negozio", other: "# negozi" }),
    placeStockSome: (count: string, stores: string) => `${count} all'ultima lettura: ${stores}.`,
    countQ: (place: string) => `Quanti Apple Store ci sono ${aLuogo(place)}?`,
    nAppleStores: f({ one: "# Apple Store", other: "# Apple Store" }),
    countMany: (count: string, stores: string) => `${count}, tra cui ${stores}.`,
    countOne: (count: string, store: string) => `${count}: ${store}.`,
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
    noneLoggedYet: "ancora nessuno nel registro",
    noneYet: "finora nessuno",
  },

  pattern: {
    none: (days: string) => `Zero rifornimenti confermati negli ultimi ${days} giorni.`,
    nConfirmed: f({ one: "# rifornimento confermato", other: "# rifornimenti confermati" }),
    countIn: (count: string, days: string) => `${count} negli ultimi ${days} giorni`,
    stay: (minutes: string) => `; un rifornimento di solito resta ritirabile ~${minutes} min`,
    nDays: f({ one: "# giorno", other: "# giorni" }),
    tooFew: (count: string, onDays: string | null, stay: string) => `${count}${onDays ? ` in ${onDays}` : ""}, non ancora abbastanza per un orario tipico${stay}.`,
    usual: (hour: string, weekday: string | null, count: string, stay: string) => `Orario tipico dei rifornimenti: le ${hour} ora locale${weekday ? `, con ${ilDay(weekday)} come giorno più intenso` : ""}; ${count}${stay}.`,
  },

  regionNouns: Object.fromEntries(Object.entries(nounForms).map(([k, v]) => [k, { one: v.one, other: v.other }])) as Record<string, Forms>,

  measured: "Come misuriamo i numeri",

  faqTitle: "Domande e risposte",
  breadcrumb: "Percorso di navigazione",
  keepExploring: "Altro da RestockWire",
  browse: {
    storesByState: "Negozi per stato",
    allStatesCities: "Tutti gli stati e le città →",
    liveByModel: "Disponibilità in diretta, modello per modello",
    modelStock: (model: string) => `Disponibilità ${model}`,
    thisPage: "questa pagina",
    restockLog: (short: string) => `Storico rifornimenti ${short}`,
    liveMap: "Mappa in diretta",
    mostStores: "Dove ci sono più negozi",
    allStates: "Tutti gli stati",
    bigCities: "Grandi città",
    cities: "Città",
    storesBy: (region: string) => `Negozi per ${region}`,
    allStoresIn: ({ country }: { inName: string; country: string }) => <>Tutti gli Apple Store {inNome(country)} →</>,
    allRegions: (regions: string) => tuttiPlural(regions),
  },
  modelCards: "Scegli un iPhone",
  narrative: {
    lastRestock: (config: ReactNode, at: ReactNode, ago: ReactNode) => <>{" "}Rifornimento più recente: {config}{at}, {ago}.</>,
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
    storesWithStock: f({ one: "negozio con disponibilità", other: "negozi con disponibilità" }),
    restocks24h: "Rifornimenti, 24 h",
    restocksHint: (week: string, month: string, days: string) => `${week} in 7 g · ${month} in ${days} g`,
    sellOuts: (days: string) => `Esaurimenti ${days} g`,
    stays: (duration: string) => `resta ~${duration}`,
    noPairs: "ancora nessun esaurimento abbinato",
    lastRestock: "Rifornimento più recente",
    noneYet: "finora nessuno",
    inLastDays: (days: string) => `negli ultimi ${days} giorni`,
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
    firstCheckPending: "primo controllo in arrivo",
    inStock: "Disponibile",
    inStockLower: "disponibile",
    none: "nessuno",
    here: "qui",
    notAvailable: "Non disponibile",
    notCheckedYet: "Non ancora controllato",
    availableForPickup: "Ritirabile in negozio",
    since: (ago: ReactNode) => <> · ritirabile da {ago}</>,
    lastInStock: (ago: ReactNode) => <>Ultima volta ritirabile {ago}</>,
    neverSeen: "Finora mai ritirabile in questo negozio",
    firstCheckSoon: "Primo controllo entro un minuto",
    buy: "Ordina su apple.com",
    checked: (checked: ReactNode, note: ReactNode) => <>Letto {checked} · {note}</>,
    checkNote: "ogni 15 s, 5 s con un avviso",
  },

  source: (source: ReactNode) => <>Dati: {source}</>,
  photoCredit: (link: ReactNode) => <>Foto: {link}</>,
  sources: "Fonti",
  allUsStores: "ognuno dei 269 Apple Store degli Stati Uniti",
  trackerSource: (where: ReactNode, since: ReactNode, asOf: ReactNode) => <>Controlli in diretta di RestockWire dal {since}: ogni configurazione di iPhone Duo, 18 Pro e 18 Pro Max in {where}, letta ogni 15 secondi (ogni 5 secondi dove c&apos;è un avviso); numeri di questa pagina aggiornati al {asOf}.</>,
  live: {
    configsCaption: (stores: ReactNode, model: ReactNode) => <>In diretta: quanti dei {stores} Apple Store hanno ogni configurazione di {model} ritirabile</>,
    storage: "Capacità",
    pricesCaption: (model: ReactNode) => <>{model}: prezzo su apple.com (sbloccato, tasse escluse) accanto alla disponibilità per il ritiro in diretta</>,
    price: "Prezzo",
    bestColor: "Colore più presente, negozi ora",
    noRestock: (model: string) => `Per l'${model} non c'è ancora nessun rifornimento nel registro.`,
    clockLabel: (model: string) => `per l'${model} in tutto il paese`,
    storesWithIt: "Negozi che lo hanno ora",
    pairsInStock: "Coppie negozio × configurazione ritirabili",
    restocksLogged: "Rifornimenti nel registro",
    medianTime: "Tempo mediano di disponibilità",
    underOneMin: (min: string) => `< ${min}`,
  },

  /** Italian alt text and captions for the generic photos and Italy's place photos; other ids fall back to English. */
  photos: {
    "apple-store-crowd-inside": { alt: "Una folla in coda dentro un Apple Store affollato in un centro commerciale", caption: "La settimana del lancio dentro un Apple Store: la merce che arriva sugli scaffali sparisce in pochi minuti." },
    "apple-store-glass-canopy": { alt: "Apple Store con facciata in vetro e pensilina in legno di sera", caption: "Un Apple Store con la vetrata illuminata, dopo il tramonto." },
    "apple-store-night-vancouver": { alt: "Un Apple Store illuminato di notte a Vancouver", caption: "Apple Store di notte: la disponibilità per il ritiro può comparire a qualsiasi ora, ma arriva molto più spesso di mattina." },
    "apple-store-pickup-counter": { alt: "Bancone in legno con il cartello Ritiro dentro un Apple Store", caption: "Gli ordini con ritiro vengono consegnati a un bancone come questo." },
    "city-map-phone": { alt: "Due persone guardano la mappa della città su uno smartphone", caption: "Pianificare il percorso fino al negozio." },
    "phone-card-payment": { alt: "Una donna con un iPhone e una carta di credito mentre paga online", caption: "Pagare online per il Ritiro in negozio." },
    "phone-hand-camera": { alt: "Una persona tiene in mano un iPhone con tripla fotocamera", caption: "I modelli Pro sono quelli per cui si fa la fila." },
    "phone-map": { alt: "Mani che usano un'app di mappe su uno smartphone all'aperto", caption: "Quando un rifornimento dura un minuto, la distanza conta più di quanto si pensi." },
    "phone-notification": { alt: "Mano che tiene un telefono con le notifiche sulla schermata di blocco", caption: "Un avviso arriva sulla schermata di blocco." },
    "phone-on-box": { alt: "Uno smartphone nuovo appoggiato sulla sua scatola bianca", caption: "Un telefono nuovo, appena uscito dalla scatola." },
    "place-it-florence": { alt: "Il panorama di Firenze con la cupola del Brunelleschi e il campanile di Giotto", caption: "Firenze e il suo Duomo." },
    "place-it-italy": { alt: "Il Ponte di Rialto sul Canal Grande a Venezia con le gondole, di giorno", caption: "Il Ponte di Rialto, Venezia." },
    "place-it-milan": { alt: "La facciata gotica del Duomo di Milano su piazza del Duomo", caption: "Il Duomo di Milano e la sua piazza." },
    "place-it-rome": { alt: "Castel Sant'Angelo e Ponte Sant'Angelo riflessi nel Tevere, di giorno", caption: "Castel Sant'Angelo sul Tevere, Roma." },
    "place-it-rome-region": { alt: "Il Colosseo incorniciato dagli alberi al tramonto", caption: "Il Colosseo, Roma, al tramonto." },
    "place-it-turin": { alt: "I tetti di Torino e la Mole Antonelliana con le Alpi innevate sullo sfondo", caption: "Torino, la Mole Antonelliana e le Alpi." },
  },
};
