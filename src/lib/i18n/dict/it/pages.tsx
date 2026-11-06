/**
 * Italian strings: pages — the home board and the region, city and store pages of the Italian page tree.
 * Place names arrive already in Italian. The restock modules receive labels with their preposition already attached ("a Roma", "qui", "da" + a store).
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import type { Dict } from "../en";
import { inPaese, n as N, paese, regione } from "./util";

const CHECK_NOTE = "15 s per tutti, 5 s se c'è un avviso";
/** "a Roma", "ad Arezzo". */
const a = (place: string) => (/^[aA]/.test(place) ? `ad ${place}` : `a ${place}`);

export const pages: Dict["pages"] = {
  common: {
    checkNote: CHECK_NOTE,
    appleStores: "Apple Store",
    showOnMap: "Guardalo sulla mappa",
    restockLogs: "Diari dei rifornimenti",
    fullLog: "Tutto il registro →",
    restocksBy: "Quali configurazioni tornano",
    lastDays: (days: number) => `${N(days)} giorni di rifornimenti, una barra al giorno`,
    nearbyCities: "Altre città con Apple Store, qui intorno",
    neighboringStates: "Gli stati accanto",
    acrossStateLine: "Subito dopo il confine di stato",
    allUsRestocks: "Ogni rifornimento negli Stati Uniti",
    allRestocksIn: (cc: CountryCode) => `Ogni rifornimento ${inPaese(cc)}`,
    /** These five name a region: in Italy a province ("provincia di Roma"). */
    regionRestocks: (place: string) => `Provincia di ${place}: tutti i rifornimenti`,
    onTheMap: (place: string) => `La provincia di ${place} sulla mappa`,
    allOf: (place: string) => `Provincia di ${place}: panoramica`,
    allOfArrow: (place: string) => `Provincia di ${place}: panoramica →`,
    storeAndCity: (store: string, city: string) => `${store} (${city})`,
    appleStorePage: (store: string) => `La pagina Apple di ${store}`,
    sourcesWhere: (n: number, cc: CountryCode) => `i ${N(n)} Apple Store ${inPaese(cc)}, nessuno escluso`,
    inPlace: (place: string) => a(place),
    atPlace: (place: string) => `da ${place}`,
    here: "qui",
    storesWithIt: "negozi che lo hanno",
    whenRestock: (place: string) => `Quando rifornisce Apple ${a(place)}?`,
    howFast: (place: string) => `Quanto dura un rifornimento ${a(place)}?`,
    latestIn: (place: string) => `Ultimi ritorni ${a(place)}`,
    noneIn: (place: string) => `Registro ancora vuoto ${a(place)}.`,
    faqTitle: (place: string) => `Apple Store ${place}: domande`,
    itemList: (place: string) => `Gli Apple Store ${a(place)}`,
    alertIn: (place: string) => `Ricevi avvisi ${a(place)}`,
    panelPick: (place: string) => `Scegli gli iPhone, poi spunta i negozi ${a(place)} che puoi raggiungere`,
    matrixH2: "Ogni negozio, ogni modello: cosa c'è adesso",
    matrixHint: "Ritirabili ora / monitorati, per ogni modello.",
    matrixLabel: "Negozio per negozio",
    cityPage: "Scheda della città →",
    storePage: "Scheda del negozio →",
    since: "2 novembre 2026",
  },
  home: {
    storesWith: (short: string) => `negozi con il ${short}`,
    restocks24: "rifornimenti, ultime 24 h",
    week: (n: number) => ` · ${N(n)} in 7 g`,
    lastCheck: "letto",
    more: (n: number) => `più altri ${N(n)}`,
    latest: (short: string) => `${short}: i rifornimenti più recenti`,
    none: (short: string) => `${short}: registro ancora vuoto.`,
    allRestocks: "Registro completo dei rifornimenti",
    modelMap: (short: string) => `${short} sulla mappa`,
    buy: "Ordina su apple.com",
    liveStock: (short: string) => `Disponibilità ${short}, in diretta`,
    live: "In diretta",
    alsoTracking: "Monitorati anche:",
    liveMap: "Mappa in diretta",
    allStores: "Ogni negozio",
    questions: "Domande frequenti",
  },
  region: {
    counts: (stores: number, cities: number) => `${N(cities)} città, ${N(stores)} negozi · controlli: ${CHECK_NOTE}`,
    nearbyOutside: (place: string) => `Oltre i confini della provincia di ${place}: gli Apple Store più vicini`,
    nearbyHint: (place: string) => `Distanze calcolate dal centro dei negozi della provincia di ${place}.`,
    beyond: (place: string) => `Oltre la provincia di ${place}`,
    everyStore: (place: string) => `Provincia di ${place}, negozio per negozio`,
    nearestRegions: (cc: CountryCode) => {
      const c = COUNTRIES[cc];
      const pl = regione(c, true);
      const m = ["stati", "dipartimenti", "emirati", "cantoni"].includes(pl);
      return `${m ? "Gli" : "Le"} ${pl} accanto, ${inPaese(cc)}`;
    },
  },
  city: {
    counts: (stores: number) => `${N(stores)} Apple Store · controlli: ${CHECK_NOTE}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Su questo negozio",
    outside: (place: string) => `Fuori da ${place}: i negozi più vicini`,
    outsideRegion: (region: string) => `Oltre la provincia di ${region}: i più vicini`,
    around: (place: string) => `Vicino a ${place}`,
    otherCities: (region: string) => `In provincia di ${region}, altre città con un negozio`,
  },
  store: {
    description: (x: { place: string; street: string; city: string; where: string; duo: number; pro: number; pm: number }) => [
      `Disponibilità per il Ritiro in negozio in diretta da ${x.place} (${x.street}, ${x.city}): monitorate ${N(x.duo)} configurazioni di iPhone Duo, ${N(x.pro)} di 18 Pro e ${N(x.pm)} di Pro Max, con orari, ore dei rifornimenti e negozi vicini.`,
      `${x.place}, ${x.where}: disponibilità per il ritiro di ${N(x.duo)} configurazioni Duo, ${N(x.pro)} 18 Pro e ${N(x.pm)} Pro Max, in diretta, con gli orari di oggi e le ore tipiche dei rifornimenti.`,
      `${x.place}, ${x.city}: ${N(x.duo)} configurazioni Duo, ${N(x.pro)} 18 Pro, ${N(x.pm)} Pro Max in diretta, più orari e rifornimenti.`,
    ],
    where: (city: string, cc: CountryCode) => `${city}, ${paese(cc)}`,
    taxQ: (place: string) => `Quanto costa l'iPhone Duo da ${place}, tasse incluse?`,
    pickupQ: (place: string) => `${place} fa il Ritiro in negozio per gli ordini su apple.com?`,
    pickupA: (place: string) => `Sì: al pagamento scegli «Ritiro» e ${place}, aspetta che Apple ti dica che l'ordine è pronto, poi porta il numero d'ordine, un documento d'identità con foto e il codice QR o il pass in Wallet (uno screenshot del codice non viene accettato).`,
    storeWord: (name: string) => (/^apple\b/i.test(name) ? name.replace(/^apple\s*/i, "Apple Store ") : `Apple Store ${name}`),
    hoursH2: (storeWord: string) => `${storeWord}: orari di apertura, indirizzo e regole per il ritiro`,
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `Oggi ${place} osserva questo orario: ${today}. Resto della settimana: ${week}. Si trova in ${address}${phone ? `, telefono ${phone}` : ""}.`,
    pickupRules: (helpUrl: string) => [
      `**Vai in negozio solo dopo la notifica di ritiro di Apple** ([le regole Apple per il ritiro](${helpUrl}))`,
      "**Da avere in mano:** numero d'ordine, documento con foto, codice QR o pass in Wallet",
      "**Screenshot del codice:** non vale, serve l'originale",
      "**Mandi qualcun altro?** Solo una persona indicata per il ritiro al momento del pagamento",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Indicazioni per ${place}](${dirUrl})${appleUrl ? ` · [Questo negozio su apple.com](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `${place}, solo Apple Store ${where}`,
    onlyInCountry: (place: string, cc: CountryCode) => `${place} non ha alternative: è l'unico Apple Store del paese e ogni Ritiro in negozio ${inPaese(cc)} passa da qui. Senza un negozio di riserva, l'avviso su questo negozio è l'intera strategia.`,
    onlyInCity: (city: string, place: string, backups: string) => `Un solo Apple Store ${a(city)}: ${place}.${backups ? ` Le alternative più vicine: ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple} (${city}, ${dist})`,
    onlyBlockCountry: (place: string) => `Un avviso è un negozio più una configurazione esatta; quando ${place} mette a disposizione la tua, il telefono lo sa in pochi secondi.`,
    onlyBlock: (place: string) => `Quando ${place} non ha la tua configurazione, anche quei negozi di riserva meritano un avviso: ogni avviso è un negozio più una configurazione esatta, e la notifica arriva pochi secondi dopo che quel negozio la mette a disposizione.`,
    intro: (x: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>{x.place}{x.street ? ` (${x.street})` : ""}, configurazioni ritirabili adesso: iPhone Duo <b className="text-ink">{N(x.duo)}/{N(x.duoOf)}</b>, iPhone 18 Pro <b className="text-ink">{N(x.pro)}/{N(x.proOf)}</b>, iPhone 18 Pro Max <b className="text-ink">{N(x.pm)}/{N(x.pmOf)}</b>.{x.peak ? <> Ora tipica dei rifornimenti qui: <b className="text-ink">le {x.peak}</b> (ora del negozio).</> : null}</>
    ),
    restocks30: (n: number) => `${N(n)} rifornimenti in 30 giorni`,
    lookupOff: "Per ora Apple ha disattivato la verifica del Ritiro in negozio per questo negozio. RestockWire riprova ogni 30 minuti e mostra la disponibilità nell'istante in cui Apple risponde.",
    checked: "Controllato",
    alertHere: (short: string) => `Tieni d'occhio questo negozio per il ${short}`,
    panel: (name: string) => `Apple ${name}: scegli gli iPhone, poi spunta questo negozio e gli altri che puoi raggiungere`,
    configsInStock: "configurazioni ritirabili",
    stockNowH2: "Ritirabile in questo momento",
    whenRestock: (name: string) => `A che ora rifornisce Apple ${name}?`,
    howFast: (name: string) => `Quanto dura un rifornimento da Apple ${name}?`,
    history: "Registro dei rifornimenti di questo negozio",
    historyEmpty: "Ancora niente registrato in questo negozio, né un rifornimento né un esaurimento.",
    nearby: "Negozi qui vicino",
    elsewhereIn: (region: string) => `Più lontano, in provincia di ${region}`,
    faqTitle: (place: string) => `${place}: domande`,
    applePage: (place: string) => `La pagina Apple di ${place} (orari, eventi)`,
    sourcesWhere: (n: number, cc: CountryCode) => (n === 1 ? `l'Apple Store ${inPaese(cc)}, che è uno solo` : `i ${N(n)} Apple Store ${inPaese(cc)}, nessuno escluso`),
    around: (place: string) => `Vicino a ${place}`,
    otherInCity: (city: string) => `Gli altri Apple Store ${a(city)}`,
    cityPage: (city: string) => `${city}: panoramica`,
    moreIn: (region: string) => `Altri negozi in provincia di ${region}`,
    everyIn: (cc: CountryCode) => `Apple Store ${inPaese(cc)}, elenco completo`,
    allIn: (cc: CountryCode) => `Ogni Apple Store ${inPaese(cc)}`,
    countryHome: (cc: CountryCode) => `${paese(cc)}: panoramica`,
    footnote: "Lo stato della disponibilità è quello che apple.com indica per il Ritiro in negozio all'ultimo controllo.",
    /** Italian drops `regionWord` (English region-level key): the line simply says the site is neither official nor a retailer's. */
    footnoteIntl: (cc: CountryCode) => ` Prezzi in ${COUNTRIES[cc].currency === "EUR" ? "euro" : COUNTRIES[cc].currency}, distanze in chilometri. RestockWire è un servizio indipendente: non è di Apple né di un rivenditore.`,
  },
};
