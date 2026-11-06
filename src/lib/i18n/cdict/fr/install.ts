/**
 * Chaînes client françaises : install (le guide /phone-alerts et ses écrans dessinés). Les libellés des maquettes reprennent
 * ceux d’iOS, d’Android et de Chrome en français (« Partager », « Sur l’écran d’accueil », « Autoriser »).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "App de l’écran d’accueil · rien à télécharger",
    title: "Les retours en stock, droit sur votre écran verrouillé.",
    lead: "Un retour en stock confirmé arrive sur votre écran verrouillé en quelques secondes. Il faut deux choses : RestockWire sur votre écran d’accueil, et les notifications autorisées.",
    seeSteps: "Afficher les étapes",
    sendTest: "Envoyer une notification de test",
    turnOn: "Activer les notifications",
    already: "**✓ Déjà configuré.** Vos alertes arrivent sur : {label}. Suivez les étapes ci-dessous pour ajouter aussi cet appareil. {link}",
    myAlerts: "Mes alertes",
  },
  progress: {
    homeScreen: "Ajoutée à l’écran d’accueil",
    signedIn: "Connecté",
    on: "Notifications autorisées",
    blocked: "Bloquées dans les réglages : l’étape {n} règle cela.",
  },
  steps: {
    title: "Activer les notifications",
    intro: {
      ios: "iPhone et iPad ne délivrent les notifications qu’à l’app de l’écran d’accueil.",
      android: "Sur Android, Chrome peut notifier tout seul ; l’installation est facultative.",
      desktop: "Fonctionne dans le navigateur, rien à installer.",
    },
    tabsLabel: "Choisissez votre appareil",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordinateur" },
    ios: {
      safari: { title: "Allez sur restockwire.com dans Safari", text: "Il faut Safari ; Chrome et les navigateurs intégrés aux apps n’en sont pas capables." },
      share: { title: "Touchez Partager", text: "iPhone : barre du bas. iPad : barre du haut." },
      choose: { title: "Choisissez « Sur l’écran d’accueil »", text: "Pas visible ? Faites défiler la feuille vers le bas." },
      add: { title: "Touchez Ajouter", text: "Laissez le nom RestockWire." },
      open: { title: "Lancez-la depuis l’écran d’accueil et connectez-vous", text: "L’app a sa propre connexion ; utilisez le même e-mail et vos alertes y sont." },
      allow: { title: "Touchez « Activer les notifications », puis Autoriser", text: "Le bouton se trouve sur votre page d’alertes. L’iPhone ne demande qu’une fois." },
    },
    android: {
      chrome: { title: "Allez sur restockwire.com dans Chrome", text: "Samsung Internet et Edge fonctionnent aussi ; les navigateurs intégrés aux apps, non." },
      install: { title: "Installez l’app", text: "Un seul toucher, sans passer par une boutique d’applications." },
      menu: { title: "Menu ⋮ → « Ajouter à l’écran d’accueil »", text: "Sur certains téléphones, c’est **Installer l’application**." },
      open: { title: "Lancez RestockWire et connectez-vous", text: "Sur l’écran d’accueil ou dans le tiroir d’applications ; le même e-mail ramène vos alertes." },
      allow: { title: "Touchez « Activer les notifications », puis Autoriser", text: "Android ne demande qu’une fois. Un onglet Chrome fonctionne aussi." },
    },
    desktop: {
      allow: { title: "Cliquez sur « Activer les notifications »", text: "Fonctionne dans Chrome, Edge, Firefox et Safari 16+ ; le navigateur ne demande qu’une fois." },
      install: { title: "Facultatif : l’utiliser comme une app", text: "Dans Chrome ou Edge, utilisez l’icône d’installation de la barre d’adresse ; les notifications arrivent alors navigateur fermé." },
      phone: { title: "Ajoutez aussi votre téléphone", text: "Connectez-vous-y avec le même e-mail. Chaque appareil aux notifications activées reçoit chaque alerte." },
    },
  },
  action: {
    install: "Installer RestockWire",
    on: "✓ Cet appareil reçoit les notifications.",
    sendTest: "Envoyer une notification de test",
    needsInstall: "S’active dans l’app de l’écran d’accueil.",
    signInFirst: "Connectez-vous pour commencer",
    signInThenOn: "Se connecter et activer",
    turnOn: "Activer les notifications",
    denied: "Bloquées : autorisez RestockWire dans Réglages, puis rechargez.",
  },
  notes: [
    { q: "Est-ce que ça vide la batterie ?", a: "Non. Les vérifications se font sur les serveurs de RestockWire, pas sur votre téléphone." },
    { q: "Pourquoi l’iPhone a-t-il besoin de Safari ?", a: "Ajouter un site à l’écran d’accueil est une fonction de Safari ; les navigateurs intégrés aux apps ne l’ont pas." },
    { q: "Plusieurs appareils ?", a: "Utilisez le même e-mail sur chacun : chacun reçoit chaque alerte." },
    { q: "Et l’e-mail ?", a: "Si aucun appareil n’a les notifications activées, l’alerte part sur votre e-mail à la place." },
  ],
  cta: { title: "Rien à surveiller pour l’instant ?", button: "Créer des alertes" },

  mocks: {
    share: "Partager",
    shareSheet: { copy: "Copier", readingList: "Ajouter à la liste de lecture", bookmark: "Ajouter un signet", favorites: "Ajouter aux favoris", addToHome: "Sur l’écran d’accueil", markup: "Annotation" },
    addDialog: { cancel: "Annuler", title: "Ajouter à l’écran d’accueil", add: "Ajouter", note: "Une icône sera ajoutée à votre écran d’accueil pour vous permettre d’accéder rapidement à ce site web." },
    iosAlert: { title: "« RestockWire » souhaite vous envoyer des notifications", text: "Les notifications peuvent inclure des alertes, des sons et des pastilles d’icônes. Vous pouvez les configurer dans Réglages.", dontAllow: "Refuser", allow: "Autoriser" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nouvel onglet", "Historique", "Téléchargements", "Favoris", "Partager…"], add: "Ajouter à l’écran d’accueil", after: ["Version pour ordinateur"] },
    androidAlert: { title: "Autoriser RestockWire à vous envoyer des notifications ?", dontAllow: "Ne pas autoriser", allow: "Autoriser" },
    desktopAlert: { wantsTo: "restockwire.com souhaite", show: "Afficher des notifications", block: "Bloquer", allow: "Autoriser" },
    desktopInstall: { callout: "Installer", title: "Installer RestockWire ?", text: "S’ouvre dans sa propre fenêtre", cancel: "Annuler", install: "Installer" },
    lockScreen: { date: "jeudi 29 octobre", now: "maintenant", title: "iPhone 18 Pro 256GB Noir", body: "Apple Champs-Élysées · Paris — Disponible aujourd’hui. Ouvrez apple.com pour le réserver." },
  },
};
