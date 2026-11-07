/**
 * Dutch strings: insight — Apple-ophaalstatus, weekrapporten, snelst uitverkochte Apple Stores, winkel tegen winkel
 * en drie telefoongidsen, zoals /nl-nl en /nl-be ze tonen. Zelfde sleutels en argumenten als dict/en/insight.tsx.
 * Getallen, seconden, datums en winkelnamen komen al in het Nederlands binnen; hier staan alleen de zinnen eromheen.
 * iOS-labels volgen Apple Nederland (Instellingen > Berichtgeving, Focus, Geplande samenvatting, Direct afleveren).
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";

/** "in Nederland", "in de Verenigde Staten", "in het Verenigd Koninkrijk". */
const inW = (w: Where) => {
  if (/^Verenigd Koninkrijk/.test(w.name)) return `in het ${w.name}`;
  if (w.us || /^(Verenigde|VS\b)/.test(w.name)) return `in de ${w.name}`;
  return `in ${w.name}`;
};
const pick = (v: CompareView, k: "a" | "b") => (k === "a" ? v.a : v.b);
const other = (v: CompareView, k: "a" | "b") => (k === "a" ? v.b : v.a);

export const insight: InsightDict = {
  nav: {
    status: "Status Apple-ophalen",
    reports: "Wekelijkse aanvulrapporten",
    fastest: "Snelst uitverkochte Apple Stores",
    compare: "Winkel tegen winkel",
    guides: "Gidsen voor alerts op je telefoon",
    otherCountries: "Dezelfde pagina voor een ander land",
    updated: (when: string) => `Bijgewerkt ${when}`,
    sources: "Bronnen en methode",
    cite: "Neem je deze cijfers over? Link dan naar deze pagina als bron.",
    alertCta: "Krijg een aanvulalert",
    logCta: "Open het aanvullogboek",
  },

  status: {
    title: (w: Where) => (w.us ? "Werkt Apple Store-ophalen? Live status VS" : `Status Apple Store-ophalen ${inW(w)}, live`),
    h1: (w: Where) => (w.us ? "Werkt Apples ophaalcheck in de winkel op dit moment?" : `Werkt Apples ophaalcheck in de winkel ${inW(w)} op dit moment?`),
    meta: (v: StatusView) =>
      `Live: Apple gaf de afgelopen minuut ophaalantwoord voor ${v.answered} van ${v.stores} Apple Stores ${inW(v.w)}. Foutpercentage, lastige uren van het afgelopen etmaal en wat je doet als checks haperen.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Ja. Apple gaf de afgelopen minuut ophaalantwoord voor ${v.answered} van ${v.stores} Apple Stores ${inW(v.w)}; het afgelopen uur mislukte ${v.failLastHour} van de verzoeken.`
        : v.verdict === "slow"
          ? `Deels. Apple gaf de afgelopen minuut antwoord voor ${v.answered} van ${v.stores} Apple Stores ${inW(v.w)}; het afgelopen uur mislukte ${v.failLastHour} van de verzoeken, dus voorraad kan later verschijnen.`
          : v.verdict === "down"
            ? `Nu niet. Apple gaf de afgelopen minuut maar voor ${v.answered} van ${v.stores} Apple Stores ${inW(v.w)} antwoord. Voorraad op apple.com en hier kan verouderd zijn tot het herstelt.`
            : `RestockWire kan de status ${inW(v.w)} nu niet uitlezen. Laad over een minuut opnieuw.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Werkt", slow: "Traag", down: "Geen antwoord", unknown: "Onbekend" })[v],
    tiles: {
      answered: "winkels gaven antwoord in de laatste minuut",
      age: "mediane leeftijd van de nieuwste check per winkel",
      failHour: "mislukte verzoeken, laatste 60 minuten",
      failDay: "mislukte verzoeken, laatste 24 uur",
    },
    nowH2: "Wat ziet RestockWire op dit moment?",
    nowLead: (v: StatusView) =>
      `${v.answered} van ${v.stores} winkels gaven antwoord in de laatste minuut${v.age ? `; een gemiddelde winkel is ${v.age} geleden uitgelezen` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Elke Apple Store ${inW(v.w)} wordt elke 15 seconden uitgelezen; winkels waar een alert op staat elke 5 seconden.`,
      v.oldest ? `De winkel die het langst wacht, gaf ${v.oldest} geleden voor het laatst antwoord.` : "In dit venster heeft nog geen enkele winkel antwoord gegeven.",
      Number(v.never) > 0 ? `${v.never} winkel(s) gaven nooit antwoord: Apple biedt daar nu geen ophaalcheck aan.` : "Elke winkel heeft minstens één keer antwoord gegeven.",
    ],
    dayH2: "Hoe gingen de laatste 24 uur?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Zonder haperingen: geen enkel uur van de laatste 24 had 5% of meer mislukte verzoeken (${v.failDay} in totaal).`
        : `${v.roughHours} lastig(e) uur/uren in de laatste 24, elk met 5% of meer mislukte verzoeken: ${v.roughList}. In totaal mislukte ${v.failDay}.`,
    hourCaption: (zone: string) => `Verzoeken en fouten per uur, laatste 24 uur (${zone})`,
    hourHead: ["Uur", "Verzoeken", "Mislukt", "Aandeel mislukt"],
    whyH2: "Waarom toont apple.com elke winkel als niet beschikbaar?",
    whyLead: "Meestal omdat de configuratie uitverkocht is. Soms omdat Apples check zelf hapert.",
    whyPoints: [
      "**Uitverkocht:** de check antwoordt normaal en noemt gewoon geen winkel. Deze pagina blijft groen.",
      "**Storing in de check:** antwoorden mislukken of komen leeg terug voor alle winkels tegelijk. Deze pagina wordt binnen een minuut oranje of rood.",
      "**Je sessie:** een oud apple.com-tabblad kan een oud antwoord vasthouden. Laad de tasjespagina opnieuw voor je erop vertrouwt.",
    ],
    doH2: "Wat doe je als de ophaalchecks haperen?",
    doLead: "Laat je alert aan staan en wacht. Een haperende check herstelt vanzelf, en aanvullingen in de tussentijd worden alsnog bevestigd.",
    doSteps: [
      "Laat de alert lopen: RestockWire blijft vragen en waarschuwt zodra een bevestigde aanvulling binnenkomt.",
      "Ververs apple.com niet om de paar seconden: dat maakt Apples check niet sneller.",
      "Kijk over vijf minuten opnieuw op deze pagina. Storingen tot nu toe duurden van minuten tot ongeveer twee uur.",
      "Staat hij weer op groen, open dan de pagina van je winkel: het aanvullogboek toont wat er tijdens de onderbreking binnenkwam.",
    ],
    methodH2: "Hoe wordt de status gemeten?",
    methodPoints: [
      "**Versheid:** de nieuwste geslaagde check van elke winkel, uit RestockWires eigen ophaalchecks.",
      "**Fouten:** mislukte verzoeken per uur in de ronde die dit land dekt, zoals onze pollers ze vastleggen.",
      "**Oordeel:** Werkt = 90% van de winkels gaf antwoord in de laatste minuut en minder dan 5% fouten; Geen antwoord = minder dan de helft.",
    ],
    otherH2: "Ophaalstatus in andere landen",
    faq: (v: StatusView) => [
      { q: "Ligt ophalen in de winkel via apple.com plat?", a: v.verdict === "ok" ? `Nu niet ${inW(v.w)}: ${v.answered} van ${v.stores} winkels gaven antwoord in de laatste minuut.` : `Het hapert nu ${inW(v.w)}: ${v.answered} van ${v.stores} winkels gaven antwoord in de laatste minuut.` },
      { q: "Betekent een rode status dat de iPhone uitverkocht is?", a: "Nee. Rood betekent dat Apples check faalt; uitverkocht is een normaal antwoord en houdt de status groen." },
      { q: "Hoe vaak wordt deze pagina bijgewerkt?", a: "Elk bezoek leest verse cijfers; de tellingen zijn hooguit 30 seconden oud." },
      { q: "Mis ik een aanvulling als de check plat ligt?", a: "Je ziet hem misschien later. RestockWire bevestigt elke aanvulling zodra er weer antwoorden komen en waarschuwt je dan." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "Wekelijkse iPhone-aanvulrapporten, Apple Stores VS" : `Wekelijkse iPhone-aanvulrapporten ${inW(w)}`),
    indexH1: (w: Where) => (w.us ? "Wekelijkse iPhone-aanvulrapporten" : `Wekelijkse iPhone-aanvulrapporten ${inW(w)}`),
    indexMeta: (w: Where) => `Elke week aanvullingen van iPhone Duo, 18 Pro en 18 Pro Max in Apple Stores ${inW(w)}: aantallen, drukste winkels, configuraties en hoe snel ze uitverkocht waren.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `Het eerste rapport ${inW(w)} verschijnt zodra een week ${"20"} bevestigde aanvullingen heeft.` : `${n} week/weken in het archief ${inW(w)}. Elke editie is RestockWires logboek van bevestigde aanvullingen voor één week van maandag tot en met zondag, lokale tijd.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} aanvullingen${complete ? "" : " · tot nu toe"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone-aanvulrapport, ${range}` : `iPhone-aanvulrapport ${inW(w)}, ${range}`),
    h1: (w: Where, range: string) => `iPhone-aanvullingen ${inW(w)}, week van ${range}`,
    meta: (v: ReportView) => `${v.restocks} bevestigde iPhone-aanvullingen in ${v.stores} Apple Stores ${inW(v.w)}, ${v.range}. Drukste winkel, drukste dag, lastigste configuratie en hoe snel aanvullingen op waren.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "Deze week tot nu toe: "}${v.restocks} bevestigde aanvullingen in ${v.stores} Apple Stores ${inW(v.w)}${v.change ? `, ${v.change} ten opzichte van de week ervoor` : ""}.${v.topStore ? ` ${v.topStore} ging voorop met ${v.topStoreN}.` : ""}${v.medianSell ? ` Een gemiddelde iPhone Duo-aanvulling bleef ${v.medianSell} staan.` : ""}`,
    partial: (days: number) => `De tracking dekt ${days} dag(en) van deze week.`,
    running: "Deze week loopt nog; de cijfers worden bij elke bevestigde aanvulling bijgewerkt.",
    tiles: {
      restocks: "bevestigde aanvullingen",
      stores: "winkels met een aanvulling",
      sell: "mediane iPhone Duo-beschikbaarheid",
      change: "ten opzichte van de week ervoor",
    },
    countH2: "Hoeveel aanvullingen bracht de week?",
    countLead: (v: ReportView) => `${v.restocks} in totaal: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, verspreid over ${v.configs} configuraties.`,
    storesH2: "Welke Apple Stores vulden het vaakst aan?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, met ${v.topStoreN} aanvullingen. De top tien staat hieronder.` : "Deze week vulde geen enkele winkel aan."),
    storesHead: ["#", "Apple Store", "Aanvullingen"],
    configsH2: "Welke iPhone Duo-configuraties kwamen terug?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `${v.topConfig} kwam het vaakst terug (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` ${v.lastConfig} kwam het minst terug.` : ""}` : "Deze week is geen enkele iPhone Duo-configuratie aangevuld.",
    configsHead: ["Configuratie", "Aanvullingen"],
    sellH2: "Hoe snel waren aanvullingen uitverkocht?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `Een gemiddelde iPhone Duo-aanvulling bleef ${v.medianSell} staan; ${v.within60} was binnen een minuut weg (${v.sellN} getimede aanvullingen).` : "Te weinig getimede uitverkopen deze week om iets te zeggen.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `De week ervoor: ${v.prevMedianSell}.` : ""),
    daysH2: "Welke dagen waren het drukst?",
    daysLead: (v: ReportView) => (v.busiestDay ? `${v.busiestDay}, met ${v.busiestDayN} aanvullingen${v.quietDay ? `; ${v.quietDay} was het rustigst` : ""}.` : "Nog geen aanvullingen om over de dagen te verdelen."),
    daysHead: ["Dag", "Aanvullingen"],
    weekdays: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
    prevH2: "Hoe verhoudt deze week zich tot de vorige?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "Er is geen vorige week in het archief om mee te vergelijken." : v.change == null ? `De week ervoor telde ${v.prevRestocks}. Het verschil verschijnt zodra beide weken compleet en volledig getrackt zijn.` : v.changeDir === "up" ? `Drukker: ${v.restocks} aanvullingen tegen ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Rustiger: ${v.restocks} aanvullingen tegen ${v.prevRestocks} (${v.change}).` : `Ongeveer gelijk: ${v.restocks} tegen ${v.prevRestocks}.`,
    prevNote: "Een lopende week vergelijkt een deel van een week met een volle; lees het verschil pas als de week dicht is.",
    readH2: "Wat betekent deze week als je er een wilt kopen?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Aanvullingen clusterden op ${v.busiestDay}: laat je alerts die dag zeker aan staan.` : "Laat je alerts elke dag aan staan: aanvullingen volgen geen vast schema.",
      v.medianSell ? `Met een gemiddelde beschikbaarheid van ${v.medianSell} moet je reservering binnen seconden na de alert beginnen.` : "Beschikbaarheid is kort: handel binnen seconden na een alert.",
      v.topStore ? `${v.topStore} vulde het vaakst aan; ligt die bij jou in de buurt, zet hem dan op je alert.` : "Volg de winkels die je kunt bereiken; een tweede winkel in de buurt verdubbelt je kans.",
    ],
    methodH2: "Hoe wordt het rapport geteld?",
    methodPoints: [
      "**Aanvulling:** een configuratie die in één winkel van niet beschikbaar naar beschikbaar gaat, bevestigd door een tweede check. Eerste waarnemingen tellen niet mee.",
      "**Week:** maandag 00:00 tot zondag 24:00 in de belangrijkste tijdzone van het land.",
      "**Beschikbaarheid:** van een bevestigde aanvulling tot de volgende bevestigde uitverkoop van dezelfde winkel en configuratie.",
    ],
    archiveH2: "Andere weken",
    faq: (v: ReportView) => [
      { q: `Hoeveel iPhones heeft Apple deze week ${inW(v.w)} aangevuld?`, a: `RestockWire bevestigde ${v.restocks} aanvullingen in ${v.stores} winkels; elke aanvulling is één configuratie die terugkomt in één winkel, geen aantal toestellen.` },
      { q: "Publiceert Apple aanvulcijfers?", a: "Nee. Deze tellingen zijn RestockWires eigen bevestigde waarnemingen van Apples ophaalbeschikbaarheid." },
      { q: "Wanneer verschijnt een nieuw rapport?", a: "Elke maandag begint een nieuwe week; de pagina vult zich naarmate aanvullingen bevestigd worden en sluit op zondagavond." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "Snelst uitverkochte Apple Stores voor de iPhone Duo" : `Snelst uitverkochte Apple Stores ${inW(w)}`),
    h1: (w: Where) => `Welke Apple Stores ${inW(w)} verkopen de iPhone Duo het snelst uit?`,
    meta: (v: RankView) => `${v.fastest ?? "De snelste winkel"} ${inW(v.w)}: iPhone Duo-aanvullingen mediaan in ${v.fastestSec ?? "seconden"} weg. Elke gerangschikte winkel, laatste ${v.days} dagen, en waar je nog kans maakt.`,
    answer: (v: RankView) =>
      v.fastest
        ? `${v.fastest} is het snelst: een gemiddelde iPhone Duo-aanvulling was daar in ${v.fastestSec} uitverkocht (${v.fastestN} getimede aanvullingen, laatste ${v.days} dagen).${v.slowest ? ` Bij ${v.slowest} bleef hij ${v.slowestSec} staan.` : ""}`
        : `Te weinig getimede uitverkopen ${inW(v.w)} in de laatste ${v.days} dagen om winkels al te rangschikken.`,
    tiles: { fastest: "snelste winkel, mediane beschikbaarheid", slowest: "traagste gerangschikte winkel", ranked: "winkels gerangschikt", country: "mediaan voor het hele land" },
    fastH2: "De snelste winkels",
    fastLead: (v: RankView) => `${v.ranked} winkels hebben ${v.minPairs} of meer getimede aanvullingen in de laatste ${v.days} dagen. Snelste mediaan bovenaan.`,
    head: ["#", "Apple Store", "Mediane beschikbaarheid", "Snelst", "Getimede aanvullingen", "Aanvullingen"],
    slowH2: "Waar maak je nog kans?",
    slowLead: (v: RankView) => (v.slowest ? `Onderaan de tabel: bij ${v.slowest} bleef een gemiddelde aanvulling ${v.slowestSec} staan. Langere beschikbaarheid geeft meer tijd om af te rekenen.` : "Nog niet genoeg gegevens."),
    meansH2: "Wat betekent een snelle winkel voor jou?",
    meansPoints: (v: RankView) => [
      `Een mediaan van ${v.fastestSec ?? "een paar seconden"} laat geen tijd om rond te kijken: zet de configuratie in je tasje en houd Apple Pay klaar.`,
      "Zet een tragere winkel in de buurt op je alert: twee winkels verdubbelen je kans.",
      "Snelheid zegt iets over de vraag rond de winkel, niet over hoeveel voorraad er binnenkomt.",
    ],
    methodH2: "Hoe komt de ranglijst tot stand?",
    methodPoints: (v: RankView) => [
      `**Beschikbaarheid:** van een bevestigde aanvulling tot de volgende bevestigde uitverkoop van dezelfde configuratie in dezelfde winkel, alleen iPhone Duo, laatste ${v.days} dagen.`,
      `**Gerangschikte winkels:** ${v.minPairs} of meer getimede aanvullingen; met minder zou één toevallige aanvulling de doorslag geven.`,
      "**Marges:** tijden zijn bovengrenzen tot de volgende check (5 tot 15 seconden ertussen).",
    ],
    faq: (v: RankView) => [
      { q: `In welke Apple Store ${inW(v.w)} is een iPhone Duo het lastigst te kopen?`, a: v.fastest ? `${v.fastest}: daar waren aanvullingen het snelst uitverkocht, mediaan ${v.fastestSec}.` : "Nog niet genoeg gegevens om dat te zeggen." },
      { q: "Betekent snel uitverkocht dat er minder telefoons zijn?", a: "Niet per se. Meestal wachten er gewoon meer mensen op die winkel." },
      { q: "Hoe vaak wordt de ranglijst bijgewerkt?", a: "Om de paar minuten, over de laatste 14 dagen." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store tegen Apple Store: iPhone-aanvullingen" : `Apple Stores ${inW(w)} vergeleken: aanvullingen`),
    indexH1: (w: Where) => `Twee Apple Stores in één stad: welke vult vaker aan ${inW(w)}?`,
    indexMeta: (w: Where) => `Naburige Apple Stores ${inW(w)} naast elkaar: iPhone-aanvullingen in de laatste 14 dagen, het gebruikelijke uur, hoe lang een aanvulling blijft staan en welke je moet volgen.`,
    indexLead: (n: string) => `${n} vergelijkingen, telkens een winkel en zijn dichtstbijzijnde buur in dezelfde stad.`,
    title: (a: string, b: string) => `${a} of ${b}: wie vult vaker aan?`,
    h1: (a: string, b: string) => `${a} of ${b}: welke krijgt meer iPhone-aanvullingen?`,
    meta: (v: CompareView) => `${v.a.name} tegen ${v.b.name}, ${v.distance} uit elkaar in ${v.city}: iPhone-aanvullingen in de laatste ${v.days} dagen, gebruikelijk uur, beschikbaarheid en welke winkel je volgt.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} en ${v.b.name} vulden even vaak aan` : `${pick(v, v.more).name} vulde vaker aan`;
      const nums = ` (${v.a.restocks} tegen ${v.b.restocks} in de laatste ${v.days} dagen)`;
      const slow = v.slower ? ` Bij ${pick(v, v.slower).name} bleven aanvullingen langer staan, dus daar heb je meer tijd om af te rekenen.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Naast elkaar, laatste ${days} dagen`,
    rows: { restocks: "Alle aanvullingen", duo: "iPhone Duo-aanvullingen", peak: "Gebruikelijk aanvuluur (lokaal)", sell: "Mediane iPhone Duo-beschikbaarheid", sellN: "Getimede aanvullingen", last: "Laatste aanvulling" },
    none: "niet genoeg gegevens",
    moreH2: "Welke winkel krijgt meer iPhone-aanvullingen?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Geen van beide: allebei ${v.a.restocks}.` : `${pick(v, v.more).name}${v.ratio ? `, ${v.ratio} zo veel` : ""}.`),
    hourH2: "Hoe laat vult elke winkel aan?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} meestal rond ${v.a.peak}; ${v.b.name} rond ${v.b.peak}.` : "Een van de twee heeft nog te weinig aanvullingen om een gebruikelijk uur te noemen.",
    sellH2: "Waar blijft een aanvulling langer staan?",
    sellLead: (v: CompareView) =>
      v.slower ? `Bij ${pick(v, v.slower).name}: ${pick(v, v.slower).medianSell} tegen ${other(v, v.slower).medianSell}.` : "Nog geen duidelijk verschil: te weinig getimede uitverkopen, of de twee medianen liggen minder dan 15% uit elkaar.",
    pickH2: "Welke moet je volgen?",
    pickPoints: (v: CompareView) => [
      `Allebei: ze liggen ${v.distance} uit elkaar, en één alertabonnement dekt meerdere winkels.`,
      v.more !== "tie" ? `Kun je er maar één bereiken, dan vulde ${pick(v, v.more).name} vaker aan.` : "Kun je er maar één bereiken, kies dan de dichtstbijzijnde: ze vulden even vaak aan.",
      v.slower ? `${pick(v, v.slower).name} geeft je meer seconden per aanvulling.` : "De beschikbaarheid wijst nog geen duidelijke winnaar aan.",
    ],
    methodH2: "Waar komen deze cijfers vandaan?",
    methodPoints: (v: CompareView) => [
      `RestockWires bevestigde aanvullingen in beide winkels over de laatste ${v.days} dagen; een aanvulling telt zodra een tweede check hem bevestigt.`,
      "Een gebruikelijk uur noemen we pas vanaf 5 aanvullingen verspreid over 3 dagen.",
      "Beschikbaarheid is een bovengrens tot de volgende check, alleen iPhone Duo.",
    ],
    storePages: "Winkelpagina's",
    otherPairs: "Meer vergelijkingen",
    faq: (v: CompareView) => [
      { q: `Is ${v.a.name} of ${v.b.name} beter om een iPhone Duo op te halen?`, a: v.more === "tie" ? "Ze vulden de laatste 14 dagen even vaak aan; kies de dichtstbijzijnde of volg ze allebei." : `${pick(v, v.more).name} vulde de laatste 14 dagen vaker aan.` },
      { q: "Kan ik beide winkels volgen?", a: "Ja, met twee alerts. Eén alert is één winkel en één configuratie, dus twee winkels kosten twee alerts van je abonnement." },
      { q: "Vullen de twee winkels tegelijk aan?", a: "Meestal niet. Elke winkel krijgt eigen leveringen; vergelijk hierboven hun gebruikelijke uren." },
    ],
  },

  guides: {
    watch: {
      title: "iPhone-aanvulalerts op je Apple Watch instellen",
      h1: "Hoe krijg je iPhone-aanvulalerts op je Apple Watch?",
      meta: "Krijg RestockWires aanvulalerts op je pols: app op het beginscherm, meldingen aan, synchronisatie in de Apple Watch-app, en de instellingen die een alert naar je iPhone sturen.",
      answer: (live: string | null) =>
        `Zet RestockWire op het beginscherm van je iPhone, zet de meldingen aan en laat synchronisatie aan in de Apple Watch-app: alerts komen dan op je Apple Watch binnen zodra je iPhone vergrendeld is.${live ? ` Een aanvulling blijft mediaan ${live} staan, dus een tikje op je pols scheelt de seconden die je kwijt bent aan je telefoon zoeken.` : ""}`,
      sections: [
        {
          h2: "Wat heb je eerst nodig?",
          lead: "Een iPhone met iOS 16.4 of nieuwer, met RestockWire op het beginscherm en meldingen toegestaan.",
          points: [
            "Open restockwire.com in Safari, tik op Deel en dan op Zet op beginscherm.",
            "Open RestockWire vanaf het beginscherm, log in en tik op Zet meldingen aan.",
            "Tik op Sta toe. Meldingen van de webapp gedragen zich dan als die van elke andere app, op het toegangsscherm en in het berichtencentrum.",
          ],
        },
        {
          h2: "Hoe komen alerts op de watch?",
          lead: "Via synchronisatie: Apple stuurt elke melding naar één apparaat, de watch als je iPhone vergrendeld is of slaapt.",
          points: [
            "iPhone ontgrendeld en in gebruik: de alert verschijnt op de iPhone, niet op de watch.",
            "iPhone vergrendeld of in slaap en de watch ontgrendeld om je pols: de alert gaat naar de watch.",
            "Watch vergrendeld of op Niet storen: de alert gaat naar de iPhone.",
          ],
        },
        {
          h2: "Welke Apple Watch-instellingen controleer je?",
          lead: "Twee: synchronisatie voor RestockWire, en of meldingen verschijnen als je pols omlaag is.",
          points: [
            "Open op je iPhone de Apple Watch-app, tik op Berichtgeving en kijk onder Synchroniseer iPhone-meldingen van (Mirror iPhone Alerts From). Staat RestockWire erbij, laat hem dan aan.",
            "Meldingen verschijnen als je je pols optilt. Wil je ze zien zonder op te tillen, zet dan Toon meldingen bij pols omlaag (Show Notifications on Wrist Down) aan.",
            "Energiebesparingsmodus zet Altijd aan uit, dus misschien moet je je pols optillen om een alert te lezen.",
          ],
        },
        {
          h2: "Wat doe je als de alert op je pols tikt?",
          lead: "Handel binnen seconden op je iPhone: de reservering zelf gebeurt op apple.com.",
          points: [
            "Lees de winkel en configuratie op de watch en ontgrendel dan je iPhone.",
            "Tik op de iPhone op de alert om de winkelpagina en de Apple-link te openen.",
            "Houd Apple Pay ingesteld op apple.com, zodat afrekenen een paar tikken kost.",
          ],
        },
      ],
      faq: [
        { q: "Werken RestockWire-alerts op de Apple Watch?", a: "Ja. Meldingen van een webapp op het beginscherm verschijnen op een gekoppelde Apple Watch zoals die van elke app." },
        { q: "Waarom kwam de alert op mijn iPhone en niet op mijn watch?", a: "Je iPhone was ontgrendeld, of de watch was vergrendeld of stond op Niet storen; Apple levert dan op de iPhone af." },
        { q: "Heb ik een aparte watch-app nodig?", a: "Nee. De watch toont de alerts die je iPhone ontvangt; op de watch hoef je niets te installeren." },
      ],
      sources: [
        { label: "WebKit: webpush voor webapps op iOS en iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple Support: meldingen op je Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch-gebruikershandleiding: meldingen beheren", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Mis geen iPhone-aanvulalerts met Focus aan",
      h1: "Hoe laat je aanvulalerts door Focus en Geplande samenvatting heen komen?",
      meta: "Laat RestockWires aanvulalerts door een focus heen, houd ze uit de Geplande samenvatting en laat ze geluid maken op het toegangsscherm. Stap voor stap, iOS 16.4 en nieuwer.",
      answer: (live: string | null) =>
        `Voeg RestockWire toe aan de toegestane apps van elke focus en zet de levering op Direct afleveren: dan klinkt een aanvulalert ook als een focus aan staat.${live ? ` Een aanvulling blijft mediaan ${live} staan, dus een alert die wacht op een samenvatting komt te laat.` : ""}`,
      sections: [
        {
          h2: "Hoe sta je RestockWire toe in een focus?",
          lead: "Ga naar Instellingen > Focus, kies de focus, tik op Apps en voeg RestockWire toe onder Sta meldingen toe van.",
          points: [
            "Met een focus kun je meldingen van specifieke webapps op je beginscherm toestaan of dempen.",
            "Herhaal dit voor elke focus die je gebruikt: Slaap, Werk, Persoonlijk en de focussen die je zelf hebt gemaakt.",
            "Focusinstellingen voor een webapp met dezelfde naam worden gesynchroniseerd met je andere Apple-apparaten.",
          ],
        },
        {
          h2: "Hoe houd je alerts uit de Geplande samenvatting?",
          lead: "Laat RestockWire uitgevinkt in de samenvattingslijst, of zet de levering op Direct afleveren.",
          points: [
            "Instellingen > Berichtgeving > Geplande samenvatting: de lijst van A tot Z bepaalt welke apps voor de samenvatting worden vastgehouden.",
            "Of Instellingen > Berichtgeving > RestockWire > Meldingslevering (Notification Delivery) > Direct afleveren.",
            "Een aanvulling die tot een samenvatting van 8:00 wacht, is dan allang uitverkocht.",
          ],
        },
        {
          h2: "Welke meldingsinstellingen tellen het zwaarst?",
          lead: "Sta meldingen toe aan, Toegangsscherm en Stroken aan, Geluiden aan.",
          points: [
            "Strookstijl Blijvend houdt de alert op het scherm tot je erop reageert.",
            "Toon voorvertoning Indien ontgrendeld verbergt winkel en configuratie op een vergrendeld scherm; kies Altijd als je ze in één oogopslag wilt lezen.",
            "Apple documenteert geen Tijdgevoelig-niveau voor meldingen van webapps, dus reken er niet op om door een focus te breken: de lijst met toegestane apps doet dat.",
          ],
        },
        {
          h2: "Hoe test je het?",
          lead: "Stuur jezelf een testpush vanuit je RestockWire-account met een focus aan.",
          points: [
            "Open RestockWire vanaf het beginscherm, ga naar je account en tik op Stuur een testpush.",
            "Zet de focus aan die je het meest gebruikt en stuur er nog een.",
            "Komt hij stil of helemaal niet binnen, controleer dan de toegestane apps van de focus en de leveringsinstelling.",
          ],
        },
      ],
      faq: [
        { q: "Blokkeert een focus RestockWire-alerts?", a: "Ja, tenzij RestockWire bij de toegestane apps van die focus staat. Voeg hem per focus één keer toe." },
        { q: "Kan RestockWire tijdgevoelige meldingen sturen?", a: "Apple documenteert zo'n niveau niet voor webpush, dus RestockWire leunt op de lijst met toegestane apps van je focus." },
        { q: "Waarom komen mijn alerts 's ochtends in een bundel binnen?", a: "De Geplande samenvatting houdt ze vast. Zet RestockWire op Direct afleveren." },
      ],
      sources: [
        { label: "iPhone-gebruikershandleiding: meldingen voor een focus toestaan of dempen", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone-gebruikershandleiding: meldingsinstellingen wijzigen", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: webpush voor webapps op iOS en iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "iPhone-aanvulalerts op Android en Wear OS",
      h1: "Krijg je iPhone-aanvulalerts op een Android-telefoon of Wear OS-horloge?",
      meta: "Wacht je op een iPhone met een Android-telefoon in je hand? RestockWire-alerts werken in Chrome zonder iets te installeren, en ze komen op een gekoppeld Wear OS- of Galaxy-horloge.",
      answer: (live: string | null) =>
        `Ja. Open RestockWire in Chrome op Android, log in en tik op Toestaan als Chrome om meldingen vraagt; alerts komen dan binnen zoals die van elke app en kunnen doorgestuurd worden naar een gekoppeld horloge.${live ? ` Beschikbaarheid duurt mediaan ${live}, dus zet je meldingen luid.` : ""}`,
      sections: [
        {
          h2: "Hoe zet je alerts aan in Chrome?",
          lead: "Log in op restockwire.com in Chrome en tik op Toestaan als de site vraagt of hij meldingen mag sturen.",
          points: [
            "Niets te installeren: Chrome vraagt om toestemming als een site je meldingen wil sturen.",
            "Tikte je eerder op Blokkeren, open dan de site-instellingen via de adresbalk en sta meldingen toe.",
            "RestockWire op je startscherm zetten is op Android optioneel; de site krijgt er een eigen icoon door.",
          ],
        },
        {
          h2: "Komen alerts op een Wear OS- of Galaxy-horloge?",
          lead: "Meestal wel: telefoonmeldingen gaan standaard door naar een gekoppeld Wear OS-horloge.",
          points: [
            "Chrome plaatst de alerts van RestockWire, dus het horloge toont ze onder Chrome.",
            "Op een Galaxy Watch: open Galaxy Wearable > Horloge-instellingen > Meldingen > App-meldingen en laat Chrome aan.",
            "Stoppen de alerts, controleer dan of batterijbesparing Chrome op de achtergrond niet beperkt.",
          ],
        },
        {
          h2: "En op een laptop?",
          lead: "Chrome, Edge en Firefox op een computer tonen dezelfde alerts zolang de browser draait.",
          points: [
            "Log in en sta meldingen toe in de browser die je het vaakst open hebt.",
            "Elk apparaat met meldingen aan krijgt elke alert.",
            "Staan op geen enkel apparaat meldingen aan, dan mailt RestockWire de alert.",
          ],
        },
      ],
      faq: [
        { q: "Heb ik een iPhone nodig om RestockWire te gebruiken?", a: "Nee. Elke telefoon of computer met een browser die webmeldingen ondersteunt, kan de alerts ontvangen." },
        { q: "Waarom toont mijn horloge de alert onder Chrome?", a: "Op Android levert Chrome de meldingen van websites af, dus het horloge zet ze onder Chrome." },
        { q: "Kan ik alerts op twee telefoons krijgen?", a: "Ja. Log op elk toestel in en sta meldingen toe; elk apparaat krijgt elke alert." },
      ],
      sources: [
        { label: "Google Chrome Help: meldingen gebruiken", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: meldingen op Wear OS", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: meldingen beheren op een Galaxy Watch", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Meer gidsen voor alerts op je telefoon",
  },
};
