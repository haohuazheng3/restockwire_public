/**
 * Chaînes client françaises : install (le guide /phone-alerts et ses écrans dessinés). Les libellés des maquettes reprennent
 * ceux d’iOS, d’Android et de Chrome en français (« Partager », « Sur l’écran d’accueil », « Autoriser »).
 */
import type { CDict } from "../en";

export const install: CDict["install"] = {
  hero: {
    eyebrow: "App de l’écran d’accueil · rien à télécharger",
    title: "Le stock revient ? Votre écran verrouillé le sait.",
    lead: "Quelques secondes entre la confirmation et votre écran verrouillé. Deux prérequis : l’icône RestockWire sur l’écran d’accueil, les notifications acceptées.",
    seeSteps: "Voir le pas-à-pas",
    sendTest: "Envoyer une notification de test",
    turnOn: "Activer les notifications",
    already: "**✓ C’est en place.** Appareils servis : {label}. Pour ajouter celui-ci, suivez le pas-à-pas plus bas. {link}",
    myAlerts: "Mes alertes",
  },
  progress: {
    homeScreen: "Ajoutée à l’écran d’accueil",
    signedIn: "Connecté",
    on: "Notifications autorisées",
    blocked: "Coupées dans les réglages : voir l’étape {n}.",
  },
  steps: {
    title: "Mise en route",
    intro: {
      ios: "Sur iPhone et iPad, pas de notification sans l’icône RestockWire sur l’écran d’accueil.",
      android: "Android : Chrome suffit pour notifier, l’installation reste optionnelle.",
      desktop: "Ordinateur : tout se passe dans le navigateur.",
    },
    tabsLabel: "Choisissez votre appareil",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "Ordinateur" },
    ios: {
      safari: { title: "Safari, adresse restockwire.com", text: "Safari obligatoire : ni Chrome ni les navigateurs internes aux apps ne savent faire." },
      share: { title: "Touchez Partager", text: "iPhone : barre du bas. iPad : barre du haut." },
      choose: { title: "Dans la liste, « Sur l’écran d’accueil »", text: "Pas visible ? Faites défiler la feuille vers le bas." },
      add: { title: "Touchez Ajouter", text: "Laissez le nom RestockWire." },
      open: { title: "Lancez-la depuis l’écran d’accueil et connectez-vous", text: "L’app a sa propre connexion ; utilisez le même e-mail et vos alertes y sont." },
      allow: { title: "« Activer les notifications », puis « Autoriser »", text: "Bouton situé sur la page de vos alertes. iOS ne demande qu’une fois." },
    },
    android: {
      chrome: { title: "Chrome, adresse restockwire.com", text: "Samsung Internet ou Edge conviennent aussi. Les navigateurs internes aux apps, non." },
      install: { title: "Installez l’app", text: "Un seul toucher, sans passer par une boutique d’applications." },
      menu: { title: "Ouvrez ⋮, puis « Ajouter à l’écran d’accueil »", text: "Sur certains téléphones, c’est **Installer l’application**." },
      open: { title: "Lancez RestockWire et connectez-vous", text: "Sur l’écran d’accueil ou dans le tiroir d’applications ; le même e-mail ramène vos alertes." },
      allow: { title: "« Activer les notifications », puis « Autoriser »", text: "Question posée une seule fois. Même un onglet Chrome ordinaire fonctionne." },
    },
    desktop: {
      allow: { title: "Un clic sur « Activer les notifications »", text: "Chrome, Edge, Firefox, Safari 16 ou plus récent. Une seule demande d’autorisation." },
      install: { title: "En option : mode app", text: "Dans Chrome ou Edge, utilisez l’icône d’installation de la barre d’adresse ; les notifications arrivent alors navigateur fermé." },
      phone: { title: "Et le téléphone ?", text: "Même e-mail, même compte. Tout appareil aux notifications actives reçoit toutes les alertes." },
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
    { q: "Et la batterie ?", a: "Intacte. Les contrôles tournent sur nos serveurs, pas sur le téléphone." },
    { q: "Pourquoi Safari sur iPhone ?", a: "L’ajout d’un site à l’écran d’accueil passe par Safari. Les navigateurs internes aux apps n’ont pas cette fonction." },
    { q: "Plusieurs appareils ?", a: "Un seul e-mail pour tous : chaque appareil reçoit toutes les alertes." },
    { q: "L’e-mail dans tout ça ?", a: "Roue de secours : il ne sert que si aucun appareil n’accepte les notifications." },
  ],
  cta: { title: "Pas encore d’alerte ?", button: "En créer une" },

  mocks: {
    share: "Partager",
    shareSheet: { copy: "Copier", readingList: "Ajouter à la liste de lecture", bookmark: "Ajouter un signet", favorites: "Ajouter aux favoris", addToHome: "Sur l’écran d’accueil", markup: "Annotation" },
    addDialog: { cancel: "Annuler", title: "Ajouter à l’écran d’accueil", add: "Ajouter", note: "Une icône sera ajoutée à votre écran d’accueil pour vous permettre d’accéder rapidement à ce site web." },
    iosAlert: { title: "« RestockWire » souhaite vous envoyer des notifications", text: "Les notifications peuvent inclure des alertes, des sons et des pastilles d’icônes. Vous pouvez les configurer dans Réglages.", dontAllow: "Refuser", allow: "Autoriser" },
    chromeMenuLabel: "Menu",
    chromeMenu: { before: ["Nouvel onglet", "Historique", "Téléchargements", "Favoris", "Partager…"], add: "Ajouter à l’écran d’accueil", after: ["Version pour ordinateur"] },
    androidAlert: { title: "Autoriser RestockWire à vous envoyer des notifications ?", dontAllow: "Ne pas autoriser", allow: "Autoriser" },
    desktopAlert: { wantsTo: "restockwire.com souhaite", show: "Afficher des notifications", block: "Bloquer", allow: "Autoriser" },
    desktopInstall: { callout: "Installer", title: "Installer RestockWire ?", text: "Une fenêtre à part, comme une app", cancel: "Annuler", install: "Installer" },
    lockScreen: { date: "jeudi 29 octobre", now: "maintenant", title: "iPhone 18 Pro 512GB Glacier", body: "Apple Champs-Élysées · Paris — En retrait maintenant, réservation sur apple.com." },
  },
};
