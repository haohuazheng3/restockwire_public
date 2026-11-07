/**
 * German strings: RestockWire's own page families — Apple pickup status, weekly restock reports, fastest-selling
 * Apple Stores, store vs store and three phone guides. Mirrors dict/en/insight.tsx key for key. Formal register (Sie);
 * Switzerland reads these with ß → ss (derive.swiss). `w.name` / `w.in` are the bare German country name; the
 * locative (in Deutschland, in der Schweiz, in den USA) comes from util.inOrt. iOS labels as on a German iPhone.
 */
import type { InsightDict, Where, StatusView, ReportView, RankView, CompareView } from "../en/insight";
import { cap, inOrt } from "./util";

/** "in Deutschland", "in der Schweiz", "in den USA". */
const inW = (w: Where) => inOrt(w.name);
const inCity = (city: string) => inOrt(city);

export const insight: InsightDict = {
  nav: {
    status: "Status der Apple-Abholung",
    reports: "Wöchentliche Restock-Berichte",
    fastest: "Apple Stores, die am schnellsten ausverkaufen",
    compare: "Store gegen Store",
    guides: "Anleitungen für Alarme aufs Handy",
    otherCountries: "Dieselbe Seite für ein anderes Land",
    updated: (when: string) => `Aktualisiert ${when}`,
    sources: "Quellen und Methode",
    cite: "Sie zitieren diese Zahlen? Verlinken Sie diese Seite als Quelle.",
    alertCta: "Restock-Alarm einrichten",
    logCta: "Restock-Protokoll öffnen",
  },

  status: {
    title: (w: Where) => (w.us ? "Apple-Abholung gestört? Live-Status, USA" : `Apple-Abholung ${inW(w)}: Live-Status`),
    h1: (w: Where) => (w.us ? "Funktioniert die Abholabfrage von Apple gerade?" : `Funktioniert die Abholabfrage von Apple ${inW(w)} gerade?`),
    meta: (v: StatusView) =>
      `Live: Apple hat in der letzten Minute Abholabfragen für ${v.answered} von ${v.stores} Apple Stores ${inW(v.w)} beantwortet. Fehlerquote, holprige Stunden des letzten Tages und was hilft, wenn Prüfungen stocken.`,
    answer: (v: StatusView) =>
      v.verdict === "ok"
        ? `Ja. Apple hat in der letzten Minute Abholabfragen für ${v.answered} von ${v.stores} Apple Stores ${inW(v.w)} beantwortet; in der letzten Stunde schlugen ${v.failLastHour} der Anfragen fehl.`
        : v.verdict === "slow"
          ? `Teilweise. Apple hat in der letzten Minute für ${v.answered} von ${v.stores} Apple Stores ${inW(v.w)} geantwortet; ${v.failLastHour} der Anfragen der letzten Stunde schlugen fehl, manche Bestände erscheinen daher verspätet.`
          : v.verdict === "down"
            ? `Gerade nicht. Apple hat in der letzten Minute nur für ${v.answered} von ${v.stores} Apple Stores ${inW(v.w)} geantwortet. Bestände auf apple.com und hier können veraltet sein, bis die Abfrage wieder läuft.`
            : `RestockWire kann den Status ${inW(v.w)} gerade nicht lesen. Laden Sie die Seite in einer Minute neu.`,
    verdictWord: (v: StatusView["verdict"]) => ({ ok: "Funktioniert", slow: "Langsam", down: "Antwortet nicht", unknown: "Unbekannt" })[v],
    tiles: {
      answered: "Stores mit Antwort in der letzten Minute",
      age: "Medianalter der neuesten Prüfung pro Store",
      failHour: "fehlgeschlagene Anfragen, letzte 60 Minuten",
      failDay: "fehlgeschlagene Anfragen, letzte 24 Stunden",
    },
    nowH2: "Was sieht RestockWire gerade?",
    nowLead: (v: StatusView) =>
      `${v.answered} von ${v.stores} Stores haben in der letzten Minute geantwortet${v.age ? `; ein typischer Store wurde vor ${v.age} gelesen` : ""}.`,
    nowPoints: (v: StatusView) => [
      `Jeder Apple Store ${inW(v.w)} läuft im 15-Sekunden-Takt, Stores mit Alarm im 5-Sekunden-Takt.`,
      v.oldest ? `Der Store, der am längsten wartet, hat zuletzt vor ${v.oldest} geantwortet.` : "In diesem Zeitfenster hat noch kein Store geantwortet.",
      Number(v.never) > 0 ? `Stores ohne jede Antwort: ${v.never}. Apple bietet dort gerade keine Abholabfrage an.` : "Jeder Store hat mindestens einmal geantwortet.",
    ],
    dayH2: "Wie liefen die letzten 24 Stunden?",
    dayLead: (v: StatusView) =>
      v.roughHours === 0
        ? `Ruhig: Keine der letzten 24 Stunden hatte 5 % oder mehr fehlgeschlagene Anfragen (insgesamt ${v.failDay}).`
        : `${v.roughHours === 1 ? "Eine holprige Stunde" : `${v.roughHours} holprige Stunden`} in den letzten 24, jeweils mit 5 % oder mehr fehlgeschlagenen Anfragen: ${v.roughList}. Insgesamt schlugen ${v.failDay} fehl.`,
    hourCaption: (zone: string) => `Anfragen und Fehler pro Stunde, letzte 24 Stunden (${zone})`,
    hourHead: ["Stunde", "Anfragen", "Fehlgeschlagen", "Fehleranteil"],
    whyH2: "Warum zeigt apple.com jeden Store als nicht verfügbar?",
    whyLead: "Meist, weil die Konfiguration ausverkauft ist. Manchmal, weil Apples Abfrage selbst hakt.",
    whyPoints: [
      "**Ausverkauft:** Die Abfrage antwortet normal und nennt nur keinen Store. Diese Seite bleibt grün.",
      "**Störung der Abfrage:** Antworten schlagen fehl oder kommen für alle Stores gleichzeitig leer zurück. Diese Seite wird binnen einer Minute gelb oder rot.",
      "**Ihre Sitzung:** Ein alter apple.com-Tab hält womöglich eine veraltete Antwort. Laden Sie die Seite mit der Einkaufstasche neu, bevor Sie ihr trauen.",
    ],
    doH2: "Was tun, wenn die Abholprüfung stockt?",
    doLead: "Alarm anlassen und abwarten. Eine stockende Abfrage erholt sich von selbst, und Restocks aus dieser Zeit werden trotzdem bestätigt.",
    doSteps: [
      "Lassen Sie den Alarm laufen: RestockWire fragt weiter und meldet sich, sobald ein bestätigter Restock durchkommt.",
      "Laden Sie apple.com nicht alle paar Sekunden neu: Apples Abfrage wird dadurch nicht schneller.",
      "Schauen Sie in fünf Minuten wieder hier vorbei. Bisherige Störungen dauerten wenige Minuten bis etwa zwei Stunden.",
      "Ist die Seite wieder grün, öffnen Sie die Seite Ihres Stores: Das Restock-Protokoll zeigt alles, was in der Lücke kam.",
    ],
    methodH2: "Wie wird der Status gemessen?",
    methodPoints: [
      "**Aktualität:** die neueste erfolgreiche Prüfung jedes Stores, aus RestockWires eigenen Abholabfragen.",
      "**Fehler:** fehlgeschlagene Anfragen pro Stunde in der Runde, die dieses Land abdeckt, laut Protokoll unserer Abfrageserver.",
      "**Urteil:** Funktioniert = 90 % der Stores haben in der letzten Minute geantwortet und unter 5 % Fehler; Antwortet nicht = weniger als die Hälfte.",
    ],
    otherH2: "Status der Abholung in anderen Ländern",
    faq: (v: StatusView) => [
      { q: "Ist die Abholung im Store auf apple.com gestört?", a: v.verdict === "ok" ? cap(`${inW(v.w)} gerade nicht: ${v.answered} von ${v.stores} Stores haben in der letzten Minute geantwortet.`) : cap(`${inW(v.w)} hakt es gerade: ${v.answered} von ${v.stores} Stores haben in der letzten Minute geantwortet.`) },
      { q: "Heißt ein roter Status, dass das iPhone ausverkauft ist?", a: "Nein. Rot heißt, Apples Abfrage schlägt fehl; ausverkauft ist eine normale Antwort und lässt den Status grün." },
      { q: "Wie oft wird diese Seite aktualisiert?", a: "Jeder Aufruf liest frische Zahlen; die Werte sind höchstens 30 Sekunden alt." },
      { q: "Verpasse ich einen Restock, während die Abfrage ausfällt?", a: "Sie sehen ihn vielleicht später. RestockWire bestätigt jeden Restock, sobald wieder Antworten kommen, und alarmiert Sie dann." },
    ],
  },

  reports: {
    indexTitle: (w: Where) => (w.us ? "iPhone-Restocks in den USA: Wochenberichte" : `iPhone-Restocks ${inW(w)}: Wochenberichte`),
    indexH1: (w: Where) => (w.us ? "Wöchentliche iPhone-Restock-Berichte" : `Wöchentliche iPhone-Restock-Berichte ${inW(w)}`),
    indexMeta: (w: Where) => `Jede Woche iPhone-Duo-, 18-Pro- und 18-Pro-Max-Restocks in den Apple Stores ${inW(w)}: Zahlen, aktivste Stores, Konfigurationen und Ausverkaufstempo, Woche für Woche.`,
    indexLead: (w: Where, n: number) =>
      n === 0 ? `Der erste Bericht ${inW(w)} erscheint, sobald eine Woche ${"20"} bestätigte Restocks hat.` : `${n === 1 ? "Eine Woche" : `${n} Wochen`} ${inW(w)} im Archiv. Jede Ausgabe ist RestockWires Protokoll bestätigter Restocks für eine Woche von Montag bis Sonntag, Ortszeit.`,
    indexRow: (range: string, restocks: string, complete: boolean) => `${range} · ${restocks} Restocks${complete ? "" : " · bisher"}`,
    title: (w: Where, range: string) => (w.us ? `iPhone-Restock-Bericht, ${range}` : `iPhone-Restock-Bericht ${inW(w)}, ${range}`),
    h1: (w: Where, range: string) => `iPhone-Restocks ${inW(w)}, Woche ${range}`,
    meta: (v: ReportView) => `${v.restocks} bestätigte iPhone-Restocks in ${v.stores} Apple Stores ${inW(v.w)}, ${v.range}. Aktivster Store, aktivster Tag, rarste Konfiguration und wie schnell die Restocks weg waren.`,
    answer: (v: ReportView) =>
      `${v.complete ? "" : "Bisher in dieser Woche: "}${v.restocks} bestätigte Restocks in ${v.stores} Apple Stores ${inW(v.w)}${v.change ? `, ${v.change} gegenüber der Vorwoche` : ""}.${v.topStore ? ` Vorn lag ${v.topStore} mit ${v.topStoreN}.` : ""}${v.medianSell ? ` Ein typischer iPhone-Duo-Restock blieb ${v.medianSell} gelistet.` : ""}`,
    partial: (days: number) => (days === 1 ? "Die Erfassung deckt einen Tag dieser Woche ab." : `Die Erfassung deckt ${days} Tage dieser Woche ab.`),
    running: "Diese Woche läuft noch; die Zahlen wachsen mit jedem bestätigten Restock.",
    tiles: {
      restocks: "bestätigte Restocks",
      stores: "Stores mit Restock",
      sell: "iPhone Duo gelistet, Median",
      change: "gegenüber der Vorwoche",
    },
    countH2: "Wie viele Restocks brachte die Woche?",
    countLead: (v: ReportView) => `${v.restocks} insgesamt: iPhone Duo ${v.duo}, iPhone 18 Pro ${v.pro}, iPhone 18 Pro Max ${v.proMax}, verteilt auf ${v.configs} Konfigurationen.`,
    storesH2: "Welche Apple Stores hatten die meisten Restocks?",
    storesLead: (v: ReportView) => (v.topStore ? `${v.topStore}, mit ${v.topStoreN} Restocks. Die zehn aktivsten stehen unten.` : "Diese Woche hatte kein Store einen Restock."),
    storesHead: ["#", "Apple Store", "Restocks"],
    configsH2: "Welche iPhone-Duo-Konfigurationen kamen zurück?",
    configsLead: (v: ReportView) =>
      v.topConfig ? `Am häufigsten ${v.topConfig} (${v.topConfigN}).${v.lastConfig && v.lastConfig !== v.topConfig ? ` Am seltensten ${v.lastConfig}.` : ""}` : "Diese Woche kam keine iPhone-Duo-Konfiguration zurück.",
    configsHead: ["Konfiguration", "Restocks"],
    sellH2: "Wie schnell waren die Restocks ausverkauft?",
    sellLead: (v: ReportView) =>
      v.medianSell ? `Ein typischer iPhone-Duo-Restock blieb ${v.medianSell} gelistet; ${v.within60} waren binnen einer Minute weg (${v.sellN} gemessene Restocks).` : "Diese Woche gab es zu wenige gemessene Ausverkäufe für eine Aussage.",
    sellPrev: (v: ReportView) => (v.prevMedianSell ? `In der Vorwoche: ${v.prevMedianSell}.` : ""),
    daysH2: "Welche Tage waren am aktivsten?",
    daysLead: (v: ReportView) => (v.busiestDay ? `Der ${v.busiestDay}, mit ${v.busiestDayN} Restocks${v.quietDay ? `; am ruhigsten war der ${v.quietDay}` : ""}.` : "Noch keine Restocks, die sich auf Tage verteilen ließen."),
    daysHead: ["Tag", "Restocks"],
    weekdays: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    prevH2: "Wie steht die Woche im Vergleich zur Vorwoche?",
    prevLead: (v: ReportView) =>
      v.prevRestocks == null ? "Es gibt keine Vorwoche im Archiv, mit der sich vergleichen ließe." : v.change == null ? `Die Vorwoche verzeichnete ${v.prevRestocks}. Die Veränderung erscheint, sobald beide Wochen abgeschlossen und vollständig erfasst sind.` : v.changeDir === "up" ? `Mehr los: ${v.restocks} Restocks gegenüber ${v.prevRestocks} (${v.change}).` : v.changeDir === "down" ? `Ruhiger: ${v.restocks} Restocks gegenüber ${v.prevRestocks} (${v.change}).` : `Etwa gleich: ${v.restocks} gegenüber ${v.prevRestocks}.`,
    prevNote: "Eine laufende Woche vergleicht einen Teil der Woche mit einer ganzen; lesen Sie die Veränderung erst nach Wochenschluss.",
    readH2: "Was heißt diese Woche für Ihren Kauf?",
    readPoints: (v: ReportView) => [
      v.busiestDay ? `Die Restocks ballten sich am ${v.busiestDay}: Lassen Sie die Alarme an diesem Tag durchgehend an.` : "Lassen Sie die Alarme jeden Tag an: Restocks folgen keinem festen Plan.",
      v.medianSell ? `Bei typisch ${v.medianSell} gelistet muss die Reservierung Sekunden nach dem Alarm beginnen.` : "Angebote sind kurz: Handeln Sie binnen Sekunden nach einem Alarm.",
      v.topStore ? `${v.topStore} hatte die meisten Restocks; liegt der Store in Ihrer Nähe, gehört er in Ihren Alarm.` : "Beobachten Sie die Stores, die Sie erreichen; ein zweiter Store in der Nähe verdoppelt Ihre Chancen.",
    ],
    methodH2: "Wie wird der Bericht gezählt?",
    methodPoints: [
      "**Restock:** Eine Konfiguration wechselt in einem Store von nicht verfügbar zu verfügbar, bestätigt durch eine zweite Prüfung. Erstsichtungen zählen nicht.",
      "**Woche:** Montag 0:00 bis Sonntag 24:00 Uhr in der Hauptzeitzone des Landes.",
      "**Gelistet:** von einem bestätigten Restock bis zum nächsten bestätigten Ausverkauf derselben Konfiguration im selben Store.",
    ],
    archiveH2: "Andere Wochen",
    faq: (v: ReportView) => [
      { q: `Wie viele iPhones hat Apple diese Woche ${inW(v.w)} nachgeliefert?`, a: `RestockWire hat ${v.restocks} Restock-Ereignisse in ${v.stores} Stores bestätigt; ein Ereignis ist eine Konfiguration, die in einem Store zurückkommt, keine Stückzahl.` },
      { q: "Veröffentlicht Apple Restock-Zahlen?", a: "Nein. Diese Zahlen sind RestockWires eigene, bestätigte Beobachtungen der Abholverfügbarkeit bei Apple." },
      { q: "Wann erscheint ein neuer Bericht?", a: "Jeden Montag beginnt eine neue Woche; ihre Seite füllt sich mit jedem bestätigten Restock und schließt Sonntagnacht." },
    ],
  },

  ranking: {
    title: (w: Where) => (w.us ? "iPhone Duo: Apple Stores, die am schnellsten leer sind" : `Schnellste Apple Stores ${inW(w)}: iPhone Duo`),
    h1: (w: Where) => `Welche Apple Stores ${inW(w)} sind beim iPhone Duo am schnellsten ausverkauft?`,
    meta: (v: RankView) => `${v.fastest ?? "Der schnellste Store"} ${inW(v.w)}: iPhone-Duo-Restocks im Median nach ${v.fastestSec ?? "Sekunden"} weg. Alle bewerteten Stores der letzten ${v.days} Tage und wo Sie noch eine Chance haben.`,
    answer: (v: RankView) =>
      v.fastest
        ? `Am schnellsten ist ${v.fastest}: Ein typischer iPhone-Duo-Restock war dort nach ${v.fastestSec} ausverkauft (${v.fastestN} gemessene Restocks, letzte ${v.days} Tage).${v.slowest ? ` Bei ${v.slowest} hielt er ${v.slowestSec}.` : ""}`
        : cap(`${inW(v.w)} gab es in den letzten ${v.days} Tagen noch zu wenige gemessene Ausverkäufe für eine Rangliste.`),
    tiles: { fastest: "schnellster Store, Median gelistet", slowest: "langsamster bewerteter Store", ranked: "bewertete Stores", country: "Median für das ganze Land" },
    fastH2: "Die schnellsten Stores",
    fastLead: (v: RankView) => `${v.ranked} Stores haben ${v.minPairs} oder mehr gemessene Restocks in den letzten ${v.days} Tagen. Schnellster Median zuerst.`,
    head: ["#", "Apple Store", "Median gelistet", "Am kürzesten", "Gemessene Restocks", "Restocks"],
    slowH2: "Wo haben Sie noch eine Chance?",
    slowLead: (v: RankView) => (v.slowest ? `Am Ende der Tabelle: Bei ${v.slowest} blieb ein typischer Restock ${v.slowestSec} gelistet. Längere Angebote lassen mehr Zeit zum Bezahlen.` : "Noch nicht genug Daten."),
    meansH2: "Was bedeutet ein schneller Store für Sie?",
    meansPoints: (v: RankView) => [
      `Bei einem Median von ${v.fastestSec ?? "wenigen Sekunden"} bleibt keine Zeit zum Stöbern: Haben Sie die Konfiguration in der Einkaufstasche und Apple Pay bereit.`,
      "Nehmen Sie einen langsameren Store in der Nähe in Ihren Alarm auf: Zwei Stores verdoppeln Ihre Chancen.",
      "Das Tempo spiegelt die Nachfrage rund um den Store, nicht die gelieferte Menge.",
    ],
    methodH2: "Wie entsteht die Rangliste?",
    methodPoints: (v: RankView) => [
      `**Gelistet:** von einem bestätigten Restock bis zum nächsten bestätigten Ausverkauf derselben Konfiguration im selben Store, nur iPhone Duo, letzte ${v.days} Tage.`,
      `**Bewertete Stores:** ${v.minPairs} oder mehr gemessene Restocks; bei weniger würde ein einzelner Glücksfall entscheiden.`,
      "**Grenzen:** Die Zeiten sind Obergrenzen bis zur nächsten Prüfung (5 bis 15 Sekunden Abstand).",
    ],
    faq: (v: RankView) => [
      { q: `In welchem Apple Store ${inW(v.w)} ist ein iPhone Duo am schwersten zu bekommen?`, a: v.fastest ? `Bei ${v.fastest}: Dort waren die Restocks am schnellsten weg, im Median nach ${v.fastestSec}.` : "Noch nicht genug Daten für eine Aussage." },
      { q: "Heißt ein schneller Ausverkauf weniger Geräte?", a: "Nicht unbedingt. Meist heißt er, dass mehr Leute auf diesen Store warten." },
      { q: "Wie oft wird die Rangliste aktualisiert?", a: "Alle paar Minuten, über die letzten 14 Tage." },
    ],
  },

  compare: {
    indexTitle: (w: Where) => (w.us ? "Apple Store gegen Apple Store: iPhone-Restocks" : `Apple Stores ${inW(w)} im Vergleich: Restocks`),
    indexH1: (w: Where) => `Zwei Apple Stores in einer Stadt: Welcher hat ${inW(w)} mehr Restocks?`,
    indexMeta: (w: Where) => `Benachbarte Apple Stores ${inW(w)} nebeneinander: iPhone-Restocks der letzten 14 Tage, die übliche Uhrzeit, wie lange ein Restock hält und welchen Sie beobachten sollten.`,
    indexLead: (n: string) => `${n} Vergleiche, jeweils ein Store und sein nächster Nachbar in derselben Stadt.`,
    title: (a: string, b: string) => `${a} oder ${b}: Wer hat mehr Restocks?`,
    h1: (a: string, b: string) => `${a} oder ${b}: Wo gibt es mehr iPhone-Restocks?`,
    meta: (v: CompareView) => `${v.a.name} gegen ${v.b.name}, ${v.distance} voneinander entfernt ${inCity(v.city)}: iPhone-Restocks der letzten ${v.days} Tage, übliche Uhrzeit, Angebotsdauer und welcher Store sich lohnt.`,
    answer: (v: CompareView) => {
      const lead = v.more === "tie" ? `${v.a.name} und ${v.b.name} hatten gleich oft Restocks` : `${(v.more === "a" ? v.a : v.b).name} hatte mehr Restocks`;
      const nums = ` (${v.a.restocks} gegen ${v.b.restocks} in den letzten ${v.days} Tagen)`;
      const slow = v.slower ? ` Bei ${(v.slower === "a" ? v.a : v.b).name} hielten die Restocks länger, Sie haben dort also mehr Zeit zum Bezahlen.` : "";
      return `${lead}${nums}.${slow}`;
    },
    tableCaption: (days: string) => `Nebeneinander, letzte ${days} Tage`,
    rows: { restocks: "Alle Restocks", duo: "iPhone-Duo-Restocks", peak: "Übliche Restock-Uhrzeit (Ortszeit)", sell: "iPhone Duo gelistet, Median", sellN: "Gemessene Restocks", last: "Letzter Restock" },
    none: "zu wenig Daten",
    moreH2: "Welcher Store hat mehr iPhone-Restocks?",
    moreLead: (v: CompareView) => (v.more === "tie" ? `Keiner: Beide hatten ${v.a.restocks}.` : `${(v.more === "a" ? v.a : v.b).name}${v.ratio ? `, mit ${v.ratio} so vielen` : ""}.`),
    hourH2: "Um welche Uhrzeit kommen die Restocks jeweils?",
    hourLead: (v: CompareView) =>
      v.a.peak && v.b.peak ? `${v.a.name} meist gegen ${v.a.peak}; ${v.b.name} gegen ${v.b.peak}.` : "Einer der beiden hat noch zu wenige Restocks für eine übliche Uhrzeit.",
    sellH2: "Wo hält ein Restock länger?",
    sellLead: (v: CompareView) =>
      v.slower ? `Bei ${(v.slower === "a" ? v.a : v.b).name}: ${(v.slower === "a" ? v.a : v.b).medianSell} gegenüber ${(v.slower === "a" ? v.b : v.a).medianSell}.` : "Noch kein klarer Unterschied: zu wenige gemessene Ausverkäufe, oder die beiden Mediane liegen weniger als 15 % auseinander.",
    pickH2: "Welchen sollten Sie beobachten?",
    pickPoints: (v: CompareView) => [
      `Beide: Sie liegen ${v.distance} auseinander, und ein Alarm-Tarif deckt mehrere Stores ab.`,
      v.more !== "tie" ? `Erreichen Sie nur einen, hatte ${(v.more === "a" ? v.a : v.b).name} häufiger Restocks.` : "Erreichen Sie nur einen, nehmen Sie den näheren: Ihre Restock-Zahlen sind gleichauf.",
      v.slower ? `${(v.slower === "a" ? v.a : v.b).name} lässt Ihnen pro Restock mehr Sekunden.` : "Bei den Angebotsdauern gibt es noch keinen klaren Sieger.",
    ],
    methodH2: "Woher kommen diese Zahlen?",
    methodPoints: (v: CompareView) => [
      `RestockWires bestätigte Restocks in beiden Stores über die letzten ${v.days} Tage; ein Restock zählt, sobald eine zweite Prüfung ihn bestätigt.`,
      "Eine übliche Uhrzeit nennen wir erst ab 5 Restocks verteilt auf 3 Tage.",
      "Angebotsdauern sind Obergrenzen bis zur nächsten Prüfung, nur iPhone Duo.",
    ],
    storePages: "Store-Seiten",
    otherPairs: "Weitere Vergleiche",
    faq: (v: CompareView) => [
      { q: `Ist ${v.a.name} oder ${v.b.name} besser für die Abholung eines iPhone Duo?`, a: v.more === "tie" ? "Beide hatten in den letzten 14 Tagen gleich oft Restocks; nehmen Sie den näheren oder beobachten Sie beide." : `${(v.more === "a" ? v.a : v.b).name} hatte in den letzten 14 Tagen häufiger Restocks.` },
      { q: "Kann ich beide Stores beobachten?", a: "Ja, mit zwei Alarmen: Ein Alarm ist ein Store plus eine Konfiguration, zwei Stores belegen also zwei Alarme Ihres Tarifs." },
      { q: "Kommen die Restocks in beiden Stores gleichzeitig?", a: "Meist nicht. Jeder Store bekommt eigene Lieferungen; vergleichen Sie die üblichen Uhrzeiten oben." },
    ],
  },

  /**
   * Three phone guides. iOS labels as on a German iPhone (Einstellungen, Fokus, Mitteilungen, Geplante Zusammenfassung,
   * Sofort zustellen, Dringende Mitteilungen); where the German label is uncertain the English one follows once in
   * parentheses. Facts exactly as the English source.
   */
  guides: {
    watch: {
      title: "iPhone-Restock-Alarme auf der Apple Watch",
      h1: "Wie bekommen Sie iPhone-Restock-Alarme auf Ihre Apple Watch?",
      meta: "RestockWires Restock-Alarme am Handgelenk: App auf dem Home-Bildschirm, Mitteilungen an, Spiegeln in der Watch-App und die Einstellungen, die einen Alarm stattdessen aufs iPhone schicken.",
      answer: (live: string | null) =>
        `Legen Sie RestockWire auf den Home-Bildschirm Ihres iPhone, schalten Sie die Mitteilungen ein und lassen Sie das Spiegeln in der Watch-App an: Dann erreichen die Alarme Ihre Apple Watch, sobald das iPhone gesperrt ist.${live ? ` Ein Restock hält im Median ${live}; ein Tippen am Handgelenk spart die Sekunden, die Sie sonst nach dem Handy suchen.` : ""}`,
      sections: [
        {
          h2: "Was brauchen Sie zuerst?",
          lead: "Ein iPhone mit iOS 16.4 oder neuer, RestockWire auf dem Home-Bildschirm und erlaubte Mitteilungen.",
          points: [
            "Öffnen Sie restockwire.com in Safari, tippen Sie auf „Teilen“ und dann auf „Zum Home-Bildschirm“.",
            "Öffnen Sie RestockWire vom Home-Bildschirm, melden Sie sich an und tippen Sie auf „Mitteilungen einschalten“.",
            "Erlauben Sie die Abfrage. Mitteilungen der Web-App verhalten sich dann wie die jeder App, auf dem Sperrbildschirm und in der Mitteilungszentrale.",
          ],
        },
        {
          h2: "Wie kommen die Alarme auf die Watch?",
          lead: "Durch Spiegeln: Apple stellt jede Mitteilung auf einem Gerät zu, auf der Watch, wenn Ihr iPhone gesperrt ist oder ruht.",
          points: [
            "iPhone entsperrt und in Benutzung: Der Alarm erscheint auf dem iPhone, nicht auf der Watch.",
            "iPhone gesperrt oder im Ruhezustand und die Watch entsperrt am Handgelenk: Der Alarm geht an die Watch.",
            "Watch gesperrt oder in „Nicht stören“: Der Alarm geht stattdessen ans iPhone.",
          ],
        },
        {
          h2: "Welche Watch-Einstellungen sollten Sie prüfen?",
          lead: "Zwei: das Spiegeln für RestockWire und ob Mitteilungen bei gesenktem Handgelenk erscheinen.",
          points: [
            "Öffnen Sie auf dem iPhone die Watch-App, tippen Sie auf „Mitteilungen“ und schauen Sie unter „iPhone-Hinweise spiegeln von“ (Mirror iPhone Alerts From). Steht RestockWire dort, lassen Sie es eingeschaltet.",
            "Mitteilungen erscheinen, wenn Sie das Handgelenk heben. Um sie auch ohne Heben zu sehen, aktivieren Sie „Mitteilungen bei gesenktem Handgelenk“ (Show Notifications on Wrist Down).",
            "Der Stromsparmodus schaltet das Always-On-Display aus; dann müssen Sie das Handgelenk womöglich heben, um einen Alarm zu lesen.",
          ],
        },
        {
          h2: "Was tun, wenn der Alarm am Handgelenk tippt?",
          lead: "Binnen Sekunden am iPhone handeln: Die Reservierung selbst läuft auf apple.com.",
          points: [
            "Lesen Sie Store und Konfiguration auf der Watch, dann entsperren Sie Ihr iPhone.",
            "Tippen Sie auf dem iPhone auf den Alarm, um die Store-Seite und den Apple-Link zu öffnen.",
            "Richten Sie Apple Pay auf apple.com vorab ein, damit das Bezahlen ein paar Taps dauert.",
          ],
        },
      ],
      faq: [
        { q: "Funktionieren RestockWire-Alarme auf der Apple Watch?", a: "Ja. Mitteilungen einer Web-App vom Home-Bildschirm erscheinen auf einer gekoppelten Apple Watch wie die jeder App." },
        { q: "Warum kam der Alarm aufs iPhone und nicht auf die Watch?", a: "Ihr iPhone war entsperrt, oder die Watch war gesperrt bzw. in „Nicht stören“; dann stellt Apple aufs iPhone zu." },
        { q: "Brauche ich eine eigene Watch-App?", a: "Nein. Die Watch zeigt die Alarme, die Ihr iPhone empfängt; auf der Watch muss nichts installiert werden." },
      ],
      sources: [
        { label: "WebKit: Web-Push für Web-Apps unter iOS und iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
        { label: "Apple Support: Mitteilungen auf der Apple Watch", url: "https://support.apple.com/en-us/108369" },
        { label: "Apple Watch Benutzerhandbuch: Mitteilungen verwalten", url: "https://support.apple.com/guide/watch/apd9b833c9f3/watchos" },
      ],
    },
    focus: {
      title: "Restock-Alarme trotz Fokus auf dem iPhone",
      h1: "Wie kommen Restock-Alarme durch Fokus und Geplante Zusammenfassung?",
      meta: "Lassen Sie RestockWires Restock-Alarme durch einen Fokus, halten Sie sie aus der Geplanten Zusammenfassung und mit Ton auf dem Sperrbildschirm. Schritt für Schritt, ab iOS 16.4.",
      answer: (live: string | null) =>
        `Fügen Sie RestockWire in jedem Fokus zu den erlaubten Apps hinzu und stellen Sie die Mitteilungen auf „Sofort zustellen“: Dann ertönt ein Restock-Alarm auch bei aktivem Fokus.${live ? ` Ein Restock hält im Median ${live}; ein Alarm, der auf eine Zusammenfassung wartet, kommt zu spät.` : ""}`,
      sections: [
        {
          h2: "Wie erlauben Sie RestockWire in einem Fokus?",
          lead: "In „Einstellungen“ > „Fokus“ den Fokus wählen, auf „Apps“ tippen und RestockWire unter „Mitteilungen erlauben von“ (Allow Notifications From) hinzufügen.",
          points: [
            "Apple lässt einen Fokus bestimmte Web-Apps vom Home-Bildschirm erlauben oder stummschalten.",
            "Wiederholen Sie das für jeden Fokus, den Sie nutzen: „Schlafen“, „Arbeiten“, „Privat“ und alle selbst erstellten.",
            "Fokus-Einstellungen für eine Web-App mit gleichem Namen werden mit Ihren anderen Apple-Geräten synchronisiert.",
          ],
        },
        {
          h2: "Wie halten Sie Alarme aus der Geplanten Zusammenfassung?",
          lead: "Lassen Sie RestockWire in der Liste der Zusammenfassung abgewählt oder stellen Sie die Zustellung auf sofort.",
          points: [
            "„Einstellungen“ > „Mitteilungen“ > „Geplante Zusammenfassung“: Die Liste von A bis Z bestimmt, welche Apps für die Zusammenfassung zurückgehalten werden.",
            "Oder „Einstellungen“ > „Mitteilungen“ > „RestockWire“ > „Mitteilungszustellung“ > „Sofort zustellen“.",
            "Ein Restock, der bis zur Zusammenfassung um 8 Uhr zurückgehalten wird, ist bis dahin längst ausverkauft.",
          ],
        },
        {
          h2: "Welche Mitteilungseinstellungen zählen am meisten?",
          lead: "„Mitteilungen erlauben“ an, „Sperrbildschirm“ und „Banner“ an, „Töne“ an.",
          points: [
            "Der Bannerstil „Dauerhaft“ hält den Alarm auf dem Bildschirm, bis Sie reagieren.",
            "„Vorschauen zeigen: Wenn entsperrt“ verbirgt Store und Konfiguration auf dem gesperrten Bildschirm; wählen Sie „Immer“, wenn Sie beides auf einen Blick lesen wollen.",
            "Apple dokumentiert für Web-App-Mitteilungen keine Stufe „Dringend“ (Time Sensitive); verlassen Sie sich also nicht darauf, dass sie einen Fokus durchbricht: Das erledigt die Liste der erlaubten Apps.",
          ],
        },
        {
          h2: "Wie testen Sie es?",
          lead: "Schicken Sie sich bei eingeschaltetem Fokus einen Test-Push aus Ihrem RestockWire-Konto.",
          points: [
            "Öffnen Sie RestockWire vom Home-Bildschirm, gehen Sie in Ihr Konto und tippen Sie auf „Test-Push senden“.",
            "Schalten Sie den Fokus ein, den Sie am häufigsten nutzen, und senden Sie noch einen.",
            "Kommt er stumm oder gar nicht an, prüfen Sie die erlaubten Apps des Fokus und die Zustellungseinstellung erneut.",
          ],
        },
      ],
      faq: [
        { q: "Blockiert ein Fokus RestockWire-Alarme?", a: "Ja, außer RestockWire steht in der Liste der erlaubten Apps dieses Fokus. Fügen Sie es einmal pro Fokus hinzu." },
        { q: "Kann RestockWire dringende Mitteilungen senden?", a: "Apple dokumentiert keine solche Stufe für Web-App-Push; RestockWire setzt deshalb auf die erlaubten Apps im Fokus." },
        { q: "Warum kommen meine Alarme morgens gebündelt?", a: "Die Geplante Zusammenfassung hält sie zurück. Stellen Sie RestockWire auf „Sofort zustellen“." },
      ],
      sources: [
        { label: "iPhone Benutzerhandbuch: Mitteilungen für einen Fokus erlauben oder stummschalten", url: "https://support.apple.com/guide/iphone/iph21d43af5b/ios" },
        { label: "iPhone Benutzerhandbuch: Mitteilungseinstellungen ändern", url: "https://support.apple.com/guide/iphone/iph7c3d96bab/ios" },
        { label: "WebKit: Web-Push für Web-Apps unter iOS und iPadOS", url: "https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/" },
      ],
    },
    android: {
      title: "iPhone-Restock-Alarme auf Android und Wear OS",
      h1: "Gibt es iPhone-Restock-Alarme auf einem Android-Handy oder einer Wear-OS-Uhr?",
      meta: "Sie warten mit einem Android-Handy auf ein iPhone? RestockWire-Alarme funktionieren in Chrome ohne Installation und erreichen eine gekoppelte Wear-OS- oder Galaxy-Uhr.",
      answer: (live: string | null) =>
        `Ja. Öffnen Sie RestockWire in Chrome auf Android, melden Sie sich an und erlauben Sie Benachrichtigungen, wenn Chrome fragt; dann kommen die Alarme wie die jeder App und lassen sich an eine gekoppelte Uhr weiterleiten.${live ? ` Angebote halten im Median ${live}, stellen Sie die Benachrichtigungen also laut.` : ""}`,
      sections: [
        {
          h2: "Wie schalten Sie Alarme in Chrome ein?",
          lead: "Melden Sie sich in Chrome auf restockwire.com an und tippen Sie auf „Zulassen“, wenn die Website Benachrichtigungen senden möchte.",
          points: [
            "Nichts zu installieren: Chrome fragt nach der Erlaubnis, wenn eine Website Sie benachrichtigen möchte.",
            "Haben Sie früher „Blockieren“ gewählt, öffnen Sie die Website-Einstellungen über die Adressleiste und lassen Sie Benachrichtigungen zu.",
            "RestockWire auf den Startbildschirm zu legen ist auf Android optional; die Website bekommt damit ein eigenes Symbol.",
          ],
        },
        {
          h2: "Kommen die Alarme auf eine Wear-OS- oder Galaxy-Uhr?",
          lead: "Meist ja: Benachrichtigungen des Handys werden standardmäßig an eine gekoppelte Wear-OS-Uhr weitergegeben.",
          points: [
            "Chrome stellt die RestockWire-Alarme zu, deshalb zeigt die Uhr sie unter Chrome an.",
            "Auf einer Galaxy Watch: „Galaxy Wearable“ > „Uhreinstellungen“ > „Benachrichtigungen“ > „App-Benachrichtigungen“ öffnen und Chrome eingeschaltet lassen.",
            "Bleiben Alarme aus, prüfen Sie, ob der Energiesparmodus Chrome im Hintergrund einschränkt.",
          ],
        },
        {
          h2: "Und am Laptop?",
          lead: "Chrome, Edge und Firefox auf dem Computer zeigen dieselben Alarme, solange der Browser läuft.",
          points: [
            "Melden Sie sich an und erlauben Sie Benachrichtigungen im Browser, den Sie am häufigsten offen haben.",
            "Jedes Gerät mit eingeschalteten Mitteilungen erhält jeden Alarm.",
            "Hat kein Gerät Mitteilungen eingeschaltet, schickt RestockWire den Alarm per E-Mail.",
          ],
        },
      ],
      faq: [
        { q: "Brauche ich ein iPhone, um RestockWire zu nutzen?", a: "Nein. Jedes Handy und jeder Computer mit einem Browser, der Web-Benachrichtigungen unterstützt, kann die Alarme empfangen." },
        { q: "Warum zeigt meine Uhr den Alarm unter Chrome?", a: "Auf Android stellt Chrome die Benachrichtigungen von Websites zu, daher listet die Uhr sie unter Chrome." },
        { q: "Kann ich Alarme auf zwei Handys bekommen?", a: "Ja. Melden Sie sich auf beiden an und erlauben Sie Benachrichtigungen; jedes Gerät erhält jeden Alarm." },
      ],
      sources: [
        { label: "Google Chrome-Hilfe: Benachrichtigungen verwenden", url: "https://support.google.com/chrome/answer/3220216?hl=en&co=GENIE.Platform%3DAndroid" },
        { label: "Android Developers: Benachrichtigungen unter Wear OS", url: "https://developer.android.com/wear/notifications/creating" },
        { label: "Samsung: Benachrichtigungen auf einer Galaxy Watch verwalten", url: "https://www.samsung.com/us/support/answer/ANS00061433/" },
      ],
    },
    related: "Weitere Anleitungen für Alarme aufs Handy",
  },
};
