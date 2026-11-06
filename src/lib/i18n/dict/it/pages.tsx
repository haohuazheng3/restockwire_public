/**
 * Italian strings: pages — the home board and the region, city and store pages of the Italian page tree.
 * Place names arrive already in Italian. Labels handed to the restock modules read "a Roma" / "da Apple Via del Corso" / "qui".
 */
import { COUNTRIES, type CountryCode } from "@/lib/apple/countries";
import type { Dict } from "../en";
import { inPaese, n as N, paese, regione } from "./util";

const CHECK_NOTE = "ogni 15 s, 5 s con un avviso";
/** "a Roma", "ad Arezzo". */
const a = (place: string) => (/^[aA]/.test(place) ? `ad ${place}` : `a ${place}`);

export const pages: Dict["pages"] = {
  common: {
    checkNote: CHECK_NOTE,
    appleStores: "Apple Store",
    showOnMap: "Guardalo sulla mappa",
    restockLogs: "Storico dei rifornimenti",
    fullLog: "Registro completo →",
    restocksBy: "Quali configurazioni tornano",
    lastDays: (days: number) => `${N(days)} giorni di rifornimenti, una barra al giorno`,
    nearbyCities: "Città vicine con un Apple Store",
    neighboringStates: "Stati confinanti",
    acrossStateLine: "Appena oltre il confine dello stato",
    allUsRestocks: "Ogni rifornimento negli Stati Uniti",
    allRestocksIn: (cc: CountryCode) => `Ogni rifornimento ${inPaese(cc)}`,
    /** These five name a region: in Italy a province ("provincia di Roma"). */
    regionRestocks: (place: string) => `Rifornimenti in tutta la provincia di ${place}`,
    onTheMap: (place: string) => `La provincia di ${place} sulla mappa`,
    allOf: (place: string) => `Provincia di ${place}: panoramica`,
    allOfArrow: (place: string) => `Provincia di ${place}: panoramica →`,
    storeAndCity: (store: string, city: string) => `${store} · ${city}`,
    appleStorePage: (store: string) => `La pagina Apple di ${store}`,
    sourcesWhere: (n: number, cc: CountryCode) => `tutti i ${N(n)} Apple Store ${inPaese(cc)}`,
    inPlace: (place: string) => a(place),
    atPlace: (place: string) => `da ${place}`,
    here: "qui",
    storesWithIt: "negozi che lo hanno",
    whenRestock: (place: string) => `Quando rifornisce Apple ${a(place)}?`,
    howFast: (place: string) => `Quanto dura un rifornimento ${a(place)}?`,
    latestIn: (place: string) => `I rifornimenti più recenti ${a(place)}`,
    noneIn: (place: string) => `Finora nessun rifornimento nel registro ${a(place)}.`,
    faqTitle: (place: string) => `Apple Store ${place}: domande`,
    itemList: (place: string) => `Gli Apple Store ${a(place)}`,
    alertIn: (place: string) => `Ricevi avvisi ${a(place)}`,
    panelPick: (place: string) => `Scegli gli iPhone, poi spunta i negozi ${a(place)} che puoi raggiungere`,
    matrixH2: "Disponibilità negozio per negozio, ogni modello",
    matrixHint: "Ritirabili ora / monitorati, per ogni modello.",
    matrixLabel: "Disponibilità per negozio",
    cityPage: "Apri la pagina della città →",
    storePage: "Apri la pagina del negozio →",
    since: "2 novembre 2026",
  },
  home: {
    storesWith: (short: string) => `negozi che hanno il ${short}`,
    restocks24: "rifornimenti, ultime 24 h",
    week: (n: number) => ` · ${N(n)} in 7 g`,
    lastCheck: "ultimo controllo",
    more: (n: number) => `e altri ${N(n)}`,
    latest: (short: string) => `${short}: i rifornimenti più recenti`,
    none: (short: string) => `Finora nessun rifornimento per il ${short}.`,
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
    counts: (stores: number, cities: number) => `${N(stores)} negozi in ${N(cities)} città · controllati ${CHECK_NOTE}`,
    nearbyOutside: (place: string) => `Gli Apple Store più vicini oltre i confini della provincia di ${place}`,
    nearbyHint: (place: string) => `Misurati dal punto medio dei negozi della provincia di ${place}.`,
    beyond: (place: string) => `Fuori dalla provincia di ${place}`,
    everyStore: (place: string) => `Provincia di ${place}, negozio per negozio`,
    nearestRegions: (cc: CountryCode) => {
      const c = COUNTRIES[cc];
      const pl = regione(c, true);
      const m = ["stati", "dipartimenti", "emirati", "cantoni"].includes(pl);
      return `${m ? "Gli" : "Le"} ${pl} confinanti ${inPaese(cc)}`;
    },
  },
  city: {
    counts: (stores: number) => `${N(stores)} Apple Store · controllati ${CHECK_NOTE}`,
    storeHeading: (name: string) => `Apple ${name}`,
    details: "Su questo negozio",
    outside: (place: string) => `I negozi più vicini fuori da ${place}`,
    outsideRegion: (region: string) => `I più vicini fuori dalla provincia di ${region}`,
    around: (place: string) => `Vicino a ${place}`,
    otherCities: (region: string) => `Altre città con un negozio in provincia di ${region}`,
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
    hoursLead: (place: string, address: string, phone: string | undefined, today: string, week: string) => `L'indirizzo di ${place} è ${address}${phone ? `; tel. ${phone}` : ""}. Orari di oggi: ${today}. Nel resto della settimana: ${week}.`,
    pickupRules: (helpUrl: string) => [
      `**Vai in negozio solo dopo la notifica di ritiro di Apple** ([le regole Apple per il ritiro](${helpUrl}))`,
      "**Porta con te:** il numero d'ordine · un documento d'identità con foto · il codice QR o il pass in Wallet",
      "**Non accettato:** uno screenshot del codice",
      "**Mandi qualcun altro?** Solo una persona indicata per il ritiro al momento del pagamento",
    ],
    directions: (place: string, dirUrl: string, appleUrl?: string) => `[Indicazioni per ${place}](${dirUrl})${appleUrl ? ` · [Questo negozio su apple.com](${appleUrl})` : ""}`,
    onlyH2: (where: string, place: string) => `${place}: l'unico Apple Store ${where}`,
    onlyInCountry: (place: string, cc: CountryCode) => `Ogni Ritiro in negozio ${inPaese(cc)} passa da ${place}, l'unico Apple Store del paese. Quando qui compare una configurazione non c'è un negozio di riserva, quindi un avviso su questo negozio è tutto il piano.`,
    onlyInCity: (city: string, place: string, backups: string) => `${place} è l'unico Apple Store ${a(city)}.${backups ? ` I più vicini dopo questo: ${backups}.` : ""}`,
    backup: (apple: string, city: string, dist: string) => `${apple} ${a(city)} (${dist})`,
    onlyBlockCountry: (place: string) => `Un avviso è un negozio più una configurazione esatta; quando ${place} mette a disposizione la tua, il telefono lo sa in pochi secondi.`,
    onlyBlock: (place: string) => `Quando ${place} non ha la tua configurazione, anche quei negozi di riserva meritano un avviso: ogni avviso è un negozio più una configurazione esatta, e la notifica arriva pochi secondi dopo che quel negozio la mette a disposizione.`,
    intro: (x: { place: string; street: string; duo: number; duoOf: number; pro: number; proOf: number; pm: number; pmOf: number; peak: string | null }) => (
      <>In questo momento {x.place}{x.street ? ` (${x.street})` : ""} ha ritirabili in negozio <b className="text-ink">{N(x.duo)} configurazioni su {N(x.duoOf)}</b> di iPhone Duo, <b className="text-ink">{N(x.pro)} su {N(x.proOf)}</b> di iPhone 18 Pro e <b className="text-ink">{N(x.pm)} su {N(x.pmOf)}</b> di iPhone 18 Pro Max.{x.peak ? <> Qui l&apos;ora tipica dei rifornimenti è <b className="text-ink">le {x.peak}</b>, ora locale.</> : null}</>
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
    sourcesWhere: (n: number, cc: CountryCode) => (n === 1 ? `l'unico Apple Store ${inPaese(cc)}` : `tutti i ${N(n)} Apple Store ${inPaese(cc)}`),
    around: (place: string) => `Vicino a ${place}`,
    otherInCity: (city: string) => `Gli altri Apple Store ${a(city)}`,
    cityPage: (city: string) => `${city}: panoramica`,
    moreIn: (region: string) => `Altri negozi in provincia di ${region}`,
    everyIn: (cc: CountryCode) => `Apple Store ${inPaese(cc)}, elenco completo`,
    allIn: (cc: CountryCode) => `Ogni Apple Store ${inPaese(cc)}`,
    countryHome: (cc: CountryCode) => `${paese(cc)}: panoramica`,
    footnote: "Lo stato della disponibilità è quello che apple.com indica per il Ritiro in negozio all'ultimo controllo.",
    /** `regionWord` (the country's region level, English key) is not needed in Italian: "not an official or retailer site". */
    footnoteIntl: (cc: CountryCode) => ` Prezzi in ${COUNTRIES[cc].currency === "EUR" ? "euro" : COUNTRIES[cc].currency}, distanze in chilometri. RestockWire non è un sito istituzionale né di un rivenditore.`,
  },
};
