/**
 * Swedish insight pages (sv-se): Apple pickup status, weekly restock reports, fastest-selling Apple Stores, store vs
 * store and three phone guides. Written in Swedish wire style (du-form) from dict/en/insight.tsx; same keys and
 * argument lists. Numbers, seconds, dates and names arrive formatted. Cadence is 15 s and 5 s only; no refund wording.
 * iOS labels follow Apple's Swedish UI (Inställningar, Fokus, Notiser, Schemalagd sammanfattning).
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { pl } from "./util";

/** "i Japan", "i USA": Swedish pages get the bare country name in both `name` and `in`. */
const i = (w: Where): string => `i ${w.name}`;

export const insight: InsightDict = {
  nav: {
    status: "Apples hämtstatus",
    reports: "Veckorapporter om påfyllningar",
    fastest: "Apple Store-butiker som säljer slut snabbast",
    compare: "Butik mot butik",
    guides: "Guider för notiser i telefonen",
    otherCountries: "Samma sida för ett annat land",
    updated: (when: string) => `Uppdaterad ${when}`,
    sources: "Källor och metod",
    cite: "Citerar du siffrorna? Länka till den här sidan som källa.",
    alertCta: "Få en påfyllningsnotis",
    logCta: "Öppna påfyllningsloggen",
  },

  status: {
    title: (w: Where) => (w.us ? "Ligger Apples hämtning i butik nere? Status, USA" : `Hämtning i Apple Store ${i(w)}: status live`),
    h1: (w: Where) => (w.us ? "Fungerar Apples kontroll av hämtning i butik just nu?" : `Fungerar Apples kontroll av hämtning i butik ${i(w)} just nu?`),
    meta: (v: StatusView) =>
      `Live: Apple svarade på hämtfrågor för ${v.answered} av ${v.stores} Apple Store-butiker ${i(v.w)} senaste minuten. Felandel, tröga timmar senaste dygnet och vad du gör när det stockar sig.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Ja. Apple svarade på hämtfrågor för ${v.answered} av ${v.stores} Apple Store-butiker ${i(v.w)} senaste minuten, och ${v.failLastHour} av förfrågningarna misslyckades senaste timmen.`
        : v.verdict === "slow"
          ? `Delvis. Apple svarade för ${v.answered} av ${v.stores} Apple Store-butiker ${i(v.w)} senaste minuten; ${v.failLastHour} av förfrågningarna misslyckades senaste timmen, så visst lager kan synas sent.`
          : v.verdict === "down"
            ? `Inte just nu. Apple svarade bara för ${v.answered} av ${v.stores} Apple Store-butiker ${i(v.w)} senaste minuten. Lagret på apple.com och här kan vara inaktuellt tills det återhämtar sig.`
            : `RestockWire kan inte läsa av statusen ${i(v.w)} just nu. Ladda om om en minut.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Fungerar", slow: "Långsam", down: "Svarar inte", unknown: "Okänd" })[v],
    tiles: {
      answered: "butiker svarade senaste minuten",
      age: "medianålder på butikens senaste kontroll",
      failHour: "misslyckade förfrågningar, senaste 60 minuterna",
      failDay: "misslyckade förfrågningar, senaste 24 timmarna",
    },
    nowH2: "Vad ser RestockWire just nu?",
    nowLead: (v: StatusView) =>
      `${v.answered} av ${v.stores} butiker svarade inom senaste minuten${v.age ? `; en typisk butik lästes av för ${v.age} sedan` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Varje Apple Store ${i(v.w)} läses av i en runda på 15 sekunder; butiker med bevakningar var 5:e sekund.`,
      v.oldest ? `Butiken som väntat längst svarade senast för ${v.oldest} sedan.` : "Ingen butik har svarat ännu i det här fönstret.",
      Number(v.never) > 0 ? `${pl(Number(v.never), "butik", "butiker")} har aldrig svarat: Apple erbjuder ingen hämtkontroll där just nu.` : "Varje butik har svarat minst en gång.",
    ],
    dayH2: "Hur gick de senaste 24 timmarna?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Utan problem: ingen timme av de senaste 24 hade 5 % eller fler misslyckade förfrågningar (${v.failDay} totalt).`
        : `${pl(v.roughHours, "trög timme", "tröga timmar")} av de senaste 24, var och en med 5 % eller fler misslyckade förfrågningar: ${v.roughList}. Totalt misslyckades ${v.failDay}.`,
    hourCaption: (zone: string) => `Förfrågningar och fel per timme, senaste 24 timmarna (${zone})`,
    hourHead: ["Timme", "Förfrågningar", "Misslyckade", "Andel fel"],
    whyH2: "Varför visar apple.com alla butiker som ej tillgängliga?",
    whyLead: "Oftast för att konfigurationen är slutsåld. Ibland för att Apples egen kontroll har problem.",
    whyPoints: [
      "**Slutsåld:** kontrollen svarar som vanligt men listar ingen butik. Sidan här förblir grön.",
      "**Problem i kontrollen:** svaren misslyckas eller kommer tomma för alla butiker samtidigt. Sidan blir gul eller röd inom en minut.",
      "**Din session:** en gammal apple.com-flik kan hålla kvar ett gammalt svar. Ladda om kassasidan innan du litar på den.",
    ],
    doH2: "Vad gör du när hämtkontrollen stockar sig?",
    doLead: "Låt bevakningen vara på och vänta. Kontrollen återhämtar sig själv, och påfyllningar under tiden verifieras ändå.",
    doSteps: [
      "Låt bevakningen gå: RestockWire fortsätter fråga och skickar notis så fort en verifierad påfyllning kommer igenom.",
      "Uppdatera inte apple.com med några sekunders mellanrum: det gör inte Apples kontroll snabbare.",
      "Titta på sidan igen om fem minuter. Störningar hittills har varat från några minuter till ungefär två timmar.",
      "När den blir grön, öppna din butiks sida: påfyllningsloggen visar allt som kom in under avbrottet.",
    ],
    methodH2: "Hur mäts statusen?",
    methodPoints: [
      "**Färskhet:** varje butiks senaste lyckade kontroll, från RestockWires egna hämtfrågor.",
      "**Fel:** misslyckade förfrågningar per timme i rundan som täcker landet, enligt våra pollers loggar.",
      "**Bedömning:** Fungerar = 90 % av butikerna svarade senaste minuten och under 5 % fel; Svarar inte = under hälften.",
    ],
    otherH2: "Hämtstatus i andra länder",
    faq: (v: StatusView) => [
      { q: "Ligger hämtning i butik på apple.com nere?", a: v.verdict === "ok" ? `Inte ${i(v.w)} just nu: ${v.answered} av ${v.stores} butiker svarade senaste minuten.` : `Den har problem ${i(v.w)} just nu: ${v.answered} av ${v.stores} butiker svarade senaste minuten.` },
      { q: "Betyder röd status att iPhonen är slutsåld?", a: "Nej. Rött betyder att Apples kontroll inte svarar; slutsåld är ett vanligt svar och håller statusen grön." },
      { q: "Hur ofta uppdateras sidan?", a: "Varje besök läser färska siffror; de är högst 30 sekunder gamla." },
      { q: "Missar jag en påfyllning medan kontrollen ligger nere?", a: "Du kan se den sent. RestockWire verifierar varje påfyllning så fort svaren kommer tillbaka och skickar notisen då." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Veckorapporter: iPhone-påfyllningar i USA" : `Veckorapporter: iPhone-påfyllningar ${i(w)}`),
    indexH1: (w: Where) => (w.us ? "Veckorapporter om iPhone-påfyllningar" : `Veckorapporter om iPhone-påfyllningar ${i(w)}`),
    indexMeta: (w: Where) => `Varje vecka av påfyllningar av iPhone Duo, 18 Pro och 18 Pro Max i Apple Store-butiker ${i(w)}: antal, flitigaste butiker, konfigurationer och hur snabbt det tog slut.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `Den första rapporten ${i(w)} kommer när en vecka har ${"20"} verifierade påfyllningar.` : `${pl(n, "vecka", "veckor")} sparade ${i(w)}. Varje utgåva är RestockWires logg över verifierade påfyllningar för en vecka, måndag till söndag, lokal tid.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} påfyllningar${complete ? "" : " · hittills"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone-påfyllningar, ${range}` : `iPhone-påfyllningar ${i(w)}, ${range}`),
    h1: (w: Where, range: string) => `iPhone-påfyllningar ${i(w)}, veckan ${range}`,
    meta: (v: ReportView) => `${v.restocks} verifierade iPhone-påfyllningar i ${v.stores} Apple Store-butiker ${i(v.w)}, ${v.range}. Flitigaste butik, flitigaste dag, svåraste konfiguration och hur snabbt det tog slut.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "Hittills i veckan: "}${v.restocks} verifierade påfyllningar i ${v.stores} Apple Store-butiker ${i(v.w)}${v.change ? `, ${v.change} mot veckan innan` : ""}.${v.topStore ? ` ${v.topStore} ledde med ${v.topStoreN}.` : ""}${v.medianSell ? ` En typisk påfyllning av iPhone Duo varade ${v.medianSell}.` : ""}`,
    partial: (days: number) => `Bevakningen täcker ${pl(days, "dag", "dagar")} av veckan.`,
    running: "Veckan pågår fortfarande; siffrorna uppdateras med varje verifierad påfyllning.",
    tiles: {
      restocks: "verifierade påfyllningar",
      stores: "butiker med påfyllning",
      sell: "median för iPhone Duo i lager",
      change: "mot veckan innan",
    },
    countH2: "Hur många påfyllningar kom under veckan?",
    countLead: (v: ReportView) => `${v.restocks} totalt: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, fördelat på ${v.configs} konfigurationer.`,
    storesH2: "Vilka Apple Store-butiker fylldes på oftast?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, med ${v.topStoreN} påfyllningar. Topp tio nedan.` : "Ingen butik fylldes på den här veckan."),
    storesHead: ["#", "Apple Store", "Påfyllningar"],
    configsH2: "Vilka konfigurationer av iPhone Duo kom tillbaka?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `${v.topConfig} kom tillbaka oftast (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` ${v.lastConfig} kom tillbaka mest sällan.` : ""}` : "Ingen konfiguration av iPhone Duo fylldes på den här veckan.",
    configsHead: ["Konfiguration", "Påfyllningar"],
    sellH2: "Hur snabbt sålde påfyllningarna slut?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `En typisk påfyllning av iPhone Duo varade ${v.medianSell}; ${v.within60} var borta inom en minut (${v.sellN} tidsmätta påfyllningar).` : "För få tidsmätta slutförsäljningar den här veckan för att säga något.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `Veckan innan: ${v.prevMedianSell}.` : ""),
    daysH2: "Vilka dagar var mest intensiva?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}, med ${v.busiestDayN} påfyllningar${v.quietDay ? `; ${v.quietDay.toLowerCase()} var lugnast` : ""}.` : "Inga påfyllningar att fördela över dagarna ännu."),
    daysHead: ["Dag", "Påfyllningar"],
    weekdays: ["Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag", "Söndag"],
    prevH2: "Hur står den sig mot veckan innan?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "Det finns ingen tidigare vecka sparad att jämföra med." : v.change == null ? `Veckan innan loggade ${v.prevRestocks}. Förändringen visas när båda veckorna är kompletta och helt bevakade.` : v.changeDir === "up" ? `Mer: ${v.restocks} påfyllningar mot ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Mindre: ${v.restocks} påfyllningar mot ${v.prevRestocks} (${v.change}).` : `Ungefär lika: ${v.restocks} mot ${v.prevRestocks}.`,
    prevNote: "En ofullständig vecka jämför en delvecka med en hel; läs förändringen när veckan är slut.",
    readH2: "Vad betyder veckan för dig som vill köpa?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Påfyllningarna samlades på ${v.busiestDay.toLowerCase()}: ha bevakningarna på hela den dagen.` : "Ha bevakningarna på varje dag: påfyllningar följer inget fast schema.",
      v.medianSell ? `När en typisk påfyllning varar ${v.medianSell} måste reservationen börja inom sekunder efter notisen.` : "Lagret ligger ute kort tid: agera inom sekunder efter en notis.",
      v.topStore ? `${v.topStore} fylldes på oftast; ligger den nära dig, lägg den i din bevakning.` : "Bevaka butikerna du kan nå; en andra butik i närheten dubblar dina chanser.",
    ],
    methodH2: "Hur räknas rapporten?",
    methodPoints: [
      "**Påfyllning:** en konfiguration som går från ej tillgänglig till tillgänglig i en butik, verifierad av en andra kontroll. Första observationer räknas inte.",
      "**Vecka:** måndag 00.00 till söndag 24.00 i landets huvudsakliga tidszon.",
      "**Tid i lager:** från en verifierad påfyllning till nästa verifierade slutförsäljning för samma butik och konfiguration.",
    ],
    archiveH2: "Andra veckor",
    faq: (v: ReportView) => [
      { q: `Hur många iPhone fyllde Apple på ${i(v.w)} den här veckan?`, a: `RestockWire verifierade ${v.restocks} påfyllningar i ${v.stores} butiker; varje påfyllning är en konfiguration som kommer tillbaka i en butik, inte ett antal enheter.` },
      { q: "Publicerar Apple siffror om påfyllningar?", a: "Nej. Siffrorna är RestockWires egna verifierade observationer av Apples hämttillgänglighet." },
      { q: "När kommer en ny rapport?", a: "Varje måndag börjar en ny vecka; sidan fylls på i takt med verifierade påfyllningar och stängs söndag kväll." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Apple Store där iPhone Duo tar slut snabbast" : `Snabbast slutsålda Apple Store ${i(w)}`),
    h1: (w: Where) => `Vilka Apple Store-butiker ${i(w)} säljer slut på iPhone Duo snabbast?`,
    meta: (v: RankView) => `${v.fastest ?? "Den snabbaste butiken"} ${i(v.w)}: påfyllningar av iPhone Duo borta på ${v.fastestSec ?? "sekunder"} i median. Alla rankade butiker, senaste ${v.days} dagarna, och var du fortfarande har en chans.`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest} är snabbast: en typisk påfyllning av iPhone Duo sålde slut på ${v.fastestSec} där (${v.fastestN} tidsmätta påfyllningar, senaste ${v.days} dagarna).${v.slowest ? ` I ${v.slowest} varade den ${v.slowestSec}.` : ""}`
        : `För få tidsmätta slutförsäljningar ${i(v.w)} de senaste ${v.days} dagarna för att ranka butiker ännu.`,
    tiles: { fastest: "snabbaste butik, median i lager", slowest: "långsammaste rankade butik", ranked: "rankade butiker", country: "median för hela landet" },
    fastH2: "De snabbaste butikerna",
    fastLead: (v: RankView) => `${v.ranked} butiker har ${v.minPairs} eller fler tidsmätta påfyllningar de senaste ${v.days} dagarna. Snabbaste median först.`,
    head: ["#", "Apple Store", "Median i lager", "Snabbast", "Tidsmätta påfyllningar", "Påfyllningar"],
    slowH2: "Var har du fortfarande en chans?",
    slowLead: (v: RankView) => (v.slowest ? `Längst ner i tabellen: ${v.slowest} höll en typisk påfyllning i ${v.slowestSec}. Längre tid i lager ger mer tid att gå till kassan.` : "Inte tillräckligt med data ännu."),
    meansH2: "Vad betyder en snabb butik för dig?",
    meansPoints: (v: RankView) => [
      `En median på ${v.fastestSec ?? "några sekunder"} ger ingen tid att titta runt: ha konfigurationen i kassen och Apple Pay redo.`,
      "Lägg till en långsammare butik i närheten i din bevakning: två butiker dubblar dina chanser.",
      "Hastigheten speglar efterfrågan runt butiken, inte hur mycket lager som kommer in.",
    ],
    methodH2: "Hur byggs rankningen?",
    methodPoints: (v: RankView) => [
      `**Tid i lager:** från en verifierad påfyllning till nästa verifierade slutförsäljning av samma konfiguration i samma butik, endast iPhone Duo, senaste ${v.days} dagarna.`,
      `**Rankade butiker:** ${v.minPairs} eller fler tidsmätta påfyllningar; färre skulle låta en enda tursam påfyllning avgöra.`,
      "**Gränser:** tiderna är övre gränser fram till nästa kontroll (5 till 15 sekunder emellan).",
    ],
    faq: (v: RankView) => [
      { q: `Vilken Apple Store ${i(v.w)} är svårast att köpa en iPhone Duo i?`, a: v.fastest ? `${v.fastest}: där sålde påfyllningarna slut snabbast, ${v.fastestSec} i median.` : "Inte tillräckligt med data ännu för att säga." },
      { q: "Betyder snabb slutförsäljning färre telefoner?", a: "Inte nödvändigtvis. Det betyder mest att fler väntar på just den butiken." },
      { q: "Hur ofta uppdateras rankningen?", a: "Med några minuters mellanrum, över de senaste 14 dagarna." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store mot Apple Store: påfyllningar" : `Apple Store ${i(w)} jämförda: påfyllningar`),
    indexH1: (w: Where) => `Två Apple Store i samma stad: vilken fylls på oftare ${i(w)}?`,
    indexMeta: (w: Where) => `Närliggande Apple Store-butiker ${i(w)} sida vid sida: iPhone-påfyllningar senaste 14 dagarna, vanlig timme, hur länge en påfyllning varar och vilken du ska bevaka.`,
    indexLead: (n: string) => `${n} jämförelser, var och en en butik och dess närmaste granne i samma stad.`,
    title: (a: string, b: string) => `${a} mot ${b}: vilken fylls på oftare?`,
    h1: (a: string, b: string) => `${a} eller ${b}: vilken får fler iPhone-påfyllningar?`,
    meta: (v: CompareView) => `${v.a.name} mot ${v.b.name}, ${v.distance} isär i ${v.city}: iPhone-påfyllningar senaste ${v.days} dagarna, vanlig timme, tid i lager och vilken butik du ska bevaka.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} och ${v.b.name} fylldes på lika ofta` : `${(v.more === "a" ? v.a : v.b).name} fylldes på oftare`;
      const nums = ` (${v.a.restocks} mot ${v.b.restocks} senaste ${v.days} dagarna)`;
      const slow = v.slower ? ` Påfyllningarna varade längre i ${(v.slower === "a" ? v.a : v.b).name}, vilket ger dig mer tid i kassan.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Sida vid sida, senaste ${days} dagarna`,
    rows: { restocks: "Alla påfyllningar", duo: "Påfyllningar av iPhone Duo", peak: "Vanlig påfyllningstimme (lokal tid)", sell: "Median för iPhone Duo i lager", sellN: "Tidsmätta påfyllningar", last: "Senaste påfyllning" },
    none: "för lite data",
    moreH2: "Vilken butik får fler iPhone-påfyllningar?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Ingen av dem: båda hade ${v.a.restocks}.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, ${v.ratio} så många` : ""}.`),
    hourH2: "Vilken tid fylls respektive butik på?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} oftast runt ${v.a.peak}; ${v.b.name} runt ${v.b.peak}.` : "En av de två har för få påfyllningar för att ange en vanlig timme ännu.",
    sellH2: "Var varar en påfyllning längre?",
    sellLead: (v: CompareView) =>
      v.slower ? `I ${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} mot ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "Ingen tydlig skillnad än: för få tidsmätta slutförsäljningar, eller så skiljer sig de två medianerna mindre än 15 %.",
    pickH2: "Vilken ska du bevaka?",
    pickPoints: (v: CompareView) => [
      `Båda: de ligger ${v.distance} isär, och en bevakningsplan täcker flera butiker.`,
      v.more !== "tie" ? `Kan du bara ta dig till en, fylldes ${(v.more === "a" ? v.a : v.b).name} på oftare.` : "Kan du bara ta dig till en, välj den närmaste: antalet påfyllningar är lika.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} ger dig fler sekunder per påfyllning.` : "Tiderna i lager visar ingen tydlig vinnare ännu.",
    ],
    methodH2: "Var kommer siffrorna ifrån?",
    methodPoints: (v: CompareView) => [
      `RestockWires verifierade påfyllningar i båda butikerna de senaste ${v.days} dagarna; en påfyllning räknas när en andra kontroll bekräftar den.`,
      "En vanlig timme anges först efter 5 påfyllningar fördelade över 3 dagar.",
      "Tiderna i lager är övre gränser fram till nästa kontroll, endast iPhone Duo.",
    ],
    storePages: "Butikssidor",
    otherPairs: "Fler jämförelser",
    faq: (v: CompareView) => [
      { q: `Är ${v.a.name} eller ${v.b.name} bäst för att hämta en iPhone Duo?`, a: v.more === "tie" ? "De fylldes på lika ofta de senaste 14 dagarna; välj den närmaste eller bevaka båda." : `${(v.more === "a" ? v.a : v.b).name} fylldes på oftare de senaste 14 dagarna.` },
      { q: "Kan jag bevaka båda butikerna?", a: "Ja, med två bevakningar. En bevakning är en butik och en konfiguration, så två butiker tar två av planens bevakningar." },
      { q: "Fylls de två butikerna på samtidigt?", a: "Oftast inte. Varje butik får egna leveranser; jämför deras vanliga timmar ovan." },
    ],
  },

  guides: {
    watch: {
      title: "Påfyllningsnotiser på Apple Watch: så gör du",
      h1: "Hur får du påfyllningsnotiser för iPhone på din Apple Watch?",
      meta: "Få RestockWires påfyllningsnotiser på handleden: app på hemskärmen, notiser på, spegling i Watch-appen och inställningarna som skickar notisen till iPhone i stället.",
      answer: (live: string | null) =>
        `Lägg RestockWire på iPhonens hemskärm, slå på notiser och låt speglingen vara på i Watch-appen: då når notiserna din Apple Watch när iPhonen är låst.${live ? ` När en påfyllning varar ${live} i median sparar en knackning på handleden sekunderna det tar att hitta telefonen.` : ""}`,
      sections: [
        {
          h2: "Vad behöver du först?",
          lead: "En iPhone med iOS 16.4 eller senare, RestockWire på hemskärmen och notiser tillåtna.",
          points: [
            "Öppna restockwire.com i Safari, tryck på Dela och sedan Lägg till på hemskärmen.",
            "Öppna RestockWire från hemskärmen, logga in och tryck på knappen för att slå på notiser.",
            "Tillåt frågan. Webbappens notiser beter sig sedan som alla appars, på låsskärmen och i Notiscenter.",
          ],
        },
        {
          h2: "Hur når notiserna klockan?",
          lead: "Genom spegling: Apple skickar varje notis till en enhet, klockan när iPhonen är låst eller i viloläge.",
          points: [
            "iPhone upplåst och i användning: notisen visas på iPhonen, inte på klockan.",
            "iPhone låst eller i viloläge och klockan upplåst på handleden: notisen går till klockan.",
            "Klockan låst eller i Stör ej: notisen går till iPhonen i stället.",
          ],
        },
        {
          h2: "Vilka klockinställningar ska du kontrollera?",
          lead: "Två: spegling för RestockWire, och om notiser visas med handleden nere.",
          points: [
            "Öppna Watch-appen på iPhone, tryck på Notiser och titta under Spegla iPhone-notiser från (Mirror iPhone Alerts From). Står RestockWire där, låt den vara på.",
            "Notiser visas när du lyfter handleden. Vill du se dem utan att lyfta, slå på Visa notiser med handleden nere (Show Notifications on Wrist Down).",
            "Strömsparläge stänger av den alltid aktiva skärmen, så du kan behöva lyfta handleden för att läsa en notis.",
          ],
        },
        {
          h2: "Vad gör du när notisen knackar på handleden?",
          lead: "Agera på iPhonen inom sekunder: själva reservationen görs på apple.com.",
          points: [
            "Läs butik och konfiguration på klockan och lås sedan upp iPhonen.",
            "Tryck på notisen på iPhonen för att öppna butikens sida och länken till Apple.",
            "Ha Apple Pay inställt på apple.com så att kassan tar ett par tryck.",
          ],
        },
      ],
      faq: [
        { q: "Fungerar RestockWires notiser på Apple Watch?", a: "Ja. Notiser från en webbapp på hemskärmen visas på en parkopplad Apple Watch som från vilken app som helst." },
        { q: "Varför kom notisen på iPhonen och inte på klockan?", a: "iPhonen var upplåst, eller så var klockan låst eller i Stör ej; då levererar Apple till iPhonen." },
        { q: "Behöver jag en separat klockapp?", a: "Nej. Klockan visar notiserna som iPhonen tar emot; det finns inget att installera på klockan." },
      ],
      sources: [
        { label: "WebKit: webbnotiser för webbappar på iOS och iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple Support: notiser på Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Användarhandbok för Apple Watch: hantera notiser", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Missa inga påfyllningsnotiser i Fokus",
      h1: "Hur släpper du igenom påfyllningsnotiser i Fokus och Schemalagd sammanfattning?",
      meta: "Släpp igenom RestockWires påfyllningsnotiser i ett Fokus, håll dem utanför Schemalagd sammanfattning och låt dem höras och synas på låsskärmen. Steg för steg, iOS 16.4 och senare.",
      answer: (live: string | null) =>
        `Lägg till RestockWire bland tillåtna appar i varje Fokus och ställ in notiserna på omedelbar leverans: då hörs en påfyllningsnotis även när ett Fokus är på.${live ? ` En påfyllning varar ${live} i median, så en notis som hålls kvar till en sammanfattning kommer för sent.` : ""}`,
      sections: [
        {
          h2: "Hur tillåter du RestockWire i ett Fokus?",
          lead: "Gå till Inställningar > Fokus, välj fokus, tryck på Appar och lägg till RestockWire under Tillåt notiser från.",
          points: [
            "Apple låter ett Fokus tillåta eller tysta specifika webbappar som du har lagt till på hemskärmen.",
            "Upprepa för varje Fokus du använder: Sömn, Arbete, Personligt och de du har skapat själv.",
            "Fokusinställningar för en webbapp med samma namn synkas till dina andra Apple-enheter.",
          ],
        },
        {
          h2: "Hur håller du notiserna utanför Schemalagd sammanfattning?",
          lead: "Låt RestockWire vara avmarkerad i sammanfattningslistan, eller ställ in leveransen på omedelbar.",
          points: [
            "Inställningar > Notiser > Schemalagd sammanfattning: listan A–Ö avgör vilka appar som hålls kvar till sammanfattningen.",
            "Eller Inställningar > Notiser > RestockWire > Notisleverans > Omedelbar leverans (Immediate Delivery).",
            "En påfyllning som hålls kvar till en sammanfattning klockan 08.00 är slutsåld sedan länge.",
          ],
        },
        {
          h2: "Vilka notisinställningar spelar störst roll?",
          lead: "Tillåt notiser på, Låsskärm och Banners på, Ljud på.",
          points: [
            "Bannerstilen Bestående håller kvar notisen på skärmen tills du gör något med den.",
            "Visa förhandsvisningar När upplåst döljer butik och konfiguration på låst skärm; välj Alltid om du vill läsa dem med en blick.",
            "Apple dokumenterar ingen nivå för tidskänsliga notiser för webbappar, så räkna inte med att den bryter igenom ett Fokus: det gör listan över tillåtna appar.",
          ],
        },
        {
          h2: "Hur testar du det?",
          lead: "Skicka en testnotis till dig själv från ditt RestockWire-konto med ett Fokus påslaget.",
          points: [
            "Öppna RestockWire från hemskärmen, gå till ditt konto och tryck på knappen för testnotis.",
            "Slå på det Fokus du använder mest och skicka en till.",
            "Kommer den tyst eller inte alls, kontrollera listan över tillåtna appar i Fokus och leveransinställningen igen.",
          ],
        },
      ],
      faq: [
        { q: "Blockerar ett Fokus RestockWires notiser?", a: "Ja, om inte RestockWire finns bland tillåtna appar i det Fokuset. Lägg till den en gång per Fokus." },
        { q: "Kan RestockWire skicka tidskänsliga notiser?", a: "Apple dokumenterar ingen sådan nivå för webbnotiser, så RestockWire förlitar sig på listan över tillåtna appar i Fokus i stället." },
        { q: "Varför kommer mina notiser i en klump på morgonen?", a: "Schemalagd sammanfattning håller kvar dem. Ställ in RestockWire på Omedelbar leverans." },
      ],
      sources: [
        { label: "Användarhandbok för iPhone: tillåta eller tysta notiser för ett Fokus", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "Användarhandbok för iPhone: ändra notisinställningar", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: webbnotiser för webbappar på iOS och iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "iPhone-påfyllningsnotiser på Android och Wear OS",
      h1: "Kan du få påfyllningsnotiser för iPhone på en Android-telefon eller Wear OS-klocka?",
      meta: "Bevakar du en iPhone från en Android-telefon? RestockWires notiser fungerar i Chrome utan att du installerar något, och de når en parkopplad Wear OS- eller Galaxy-klocka.",
      answer: (live: string | null) =>
        `Ja. Öppna RestockWire i Chrome på Android, logga in och tillåt notiser när Chrome frågar; notiserna kommer sedan som från vilken app som helst och kan föras vidare till en parkopplad klocka.${live ? ` Lagret ligger ute ${live} i median, så ha notisljudet högt.` : ""}`,
      sections: [
        {
          h2: "Hur slår du på notiser i Chrome?",
          lead: "Logga in på restockwire.com i Chrome och tryck på Tillåt när webbplatsen ber om att få skicka notiser.",
          points: [
            "Inget att installera: Chrome frågar om lov när en webbplats vill skicka notiser.",
            "Tryckte du på Blockera tidigare, öppna webbplatsinställningarna från adressfältet och tillåt notiser.",
            "Att lägga RestockWire på startskärmen är valfritt på Android; det ger webbplatsen en egen ikon.",
          ],
        },
        {
          h2: "Når notiserna en Wear OS- eller Galaxy-klocka?",
          lead: "Oftast ja: telefonens notiser förs som standard vidare till en parkopplad Wear OS-klocka.",
          points: [
            "Chrome skickar RestockWires notiser, så klockan visar dem under Chrome.",
            "På en Galaxy Watch, öppna Galaxy Wearable > Klockinställningar > Notiser > Appnotiser och låt Chrome vara på.",
            "Slutar notiserna komma, kontrollera att batterisparläget inte begränsar Chrome i bakgrunden.",
          ],
        },
        {
          h2: "Och en bärbar dator?",
          lead: "Chrome, Edge och Firefox på en dator kan visa samma notiser medan webbläsaren är igång.",
          points: [
            "Logga in och tillåt notiser i den webbläsare du oftast har öppen.",
            "Varje enhet med notiser på får varje notis.",
            "Har ingen enhet notiser på skickar RestockWire notisen med e-post i stället.",
          ],
        },
      ],
      faq: [
        { q: "Behöver jag en iPhone för att använda RestockWire?", a: "Nej. Alla telefoner och datorer med en webbläsare som stöder webbnotiser kan ta emot notiserna." },
        { q: "Varför visar klockan notisen under Chrome?", a: "På Android levererar Chrome webbplatsers notiser, så klockan listar dem under Chrome." },
        { q: "Kan jag få notiser på två telefoner?", a: "Ja. Logga in och tillåt notiser på båda; varje enhet får varje notis." },
      ],
      sources: [
        { label: "Hjälp för Google Chrome: använda notiser", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: notiser på Wear OS", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: hantera notiser på en Galaxy Watch", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Fler guider för notiser i telefonen",
  },
};
