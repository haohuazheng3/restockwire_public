import type { CDict } from "../en";

/** 日本語クライアント文言: install（/phone-alerts のガイドと手描きの画面イラスト）。イラスト内の文言は iOS・Android・Chrome の日本語表示に合わせる。 */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "ホーム画面のアプリ · ダウンロード不要",
    title: "再入荷を、そのままロック画面へ。",
    lead: "確認済みの再入荷は、数秒でロック画面に届きます。必要なのは2つだけ。RestockWireをホーム画面に置くことと、通知を許可することです。",
    seeSteps: "手順を表示",
    sendTest: "テスト通知を送る",
    turnOn: "通知をオンにする",
    already: "**✓ 設定済みです。** 通知は{label}に届いています。この端末も追加するには、下の手順に進んでください。{link}",
    myAlerts: "マイ通知",
  },
  progress: {
    homeScreen: "ホーム画面に追加済み",
    signedIn: "ログイン済み",
    on: "通知を許可済み",
    blocked: "設定でブロックされています。手順{n}で解除できます。",
  },
  steps: {
    title: "通知をオンにする手順",
    intro: {
      ios: "iPhoneとiPadで通知が届くのは、ホーム画面に追加したアプリだけです。",
      android: "AndroidではChromeだけで通知を受け取れます。インストールは任意です。",
      desktop: "ブラウザで動くので、インストールは不要です。",
    },
    tabsLabel: "端末を選ぶ",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "パソコン" },
    ios: {
      safari: { title: "Safariでrestockwire.comを開く", text: "Safariでなければできません。Chromeやアプリ内ブラウザでは追加できません。" },
      share: { title: "「共有」をタップ", text: "iPhoneは下のバー、iPadは上のバーにあります。" },
      choose: { title: "「ホーム画面に追加」を選ぶ", text: "見当たらなければ、シートを下へスクロールしてください。" },
      add: { title: "「追加」をタップ", text: "名前はRestockWireのままにしておきます。" },
      open: { title: "ホーム画面から起動してログイン", text: "アプリのログインはSafariとは別です。同じメールアドレスを使えば、通知の設定はそのまま残っています。" },
      allow: { title: "「通知をオンにする」→「許可」をタップ", text: "ボタンはマイ通知のページにあります。iPhoneが尋ねるのは一度だけです。" },
    },
    android: {
      chrome: { title: "Chromeでrestockwire.comを開く", text: "Samsung InternetやEdgeでも使えます。アプリ内ブラウザでは使えません。" },
      install: { title: "アプリをインストール", text: "タップ1回で完了。アプリストアは使いません。" },
      menu: { title: "メニュー ⋮ →「ホーム画面に追加」", text: "機種によっては **アプリをインストール** と表示されます。" },
      open: { title: "RestockWireを起動してログイン", text: "ホーム画面かアプリ一覧にあります。同じメールアドレスなら通知の設定もそのままです。" },
      allow: { title: "「通知をオンにする」→「許可」をタップ", text: "Androidが尋ねるのは一度だけです。Chromeのタブのままでも使えます。" },
    },
    desktop: {
      allow: { title: "「通知をオンにする」をタップ", text: "Chrome、Edge、Firefox、Safari 16以降で使えます。ブラウザが尋ねるのは一度だけです。" },
      install: { title: "任意：アプリとして使う", text: "ChromeかEdgeなら、アドレスバーのインストールアイコンから。ブラウザを閉じていても通知が届くようになります。" },
      phone: { title: "スマートフォンも追加する", text: "スマートフォンでも同じメールアドレスでログインしてください。通知をオンにした端末それぞれに、すべての通知が届きます。" },
    },
  },
  action: {
    install: "RestockWireをインストール",
    on: "✓ この端末は通知を受け取れます。",
    sendTest: "テスト通知を送る",
    needsInstall: "ホーム画面のアプリの中で使えるようになります。",
    signInFirst: "ログインして始める",
    signInThenOn: "ログインしてオンにする",
    turnOn: "通知をオンにする",
    denied: "ブロックされています。設定でRestockWireを許可してから、再読み込みしてください。",
  },
  notes: [
    { q: "バッテリーは減りますか？", a: "減りません。確認作業はスマートフォンではなく、RestockWireのサーバーで行っています。" },
    { q: "なぜiPhoneではSafariが必要？", a: "サイトをホーム画面に追加するのはSafariの機能です。アプリ内ブラウザにはありません。" },
    { q: "複数の端末で使えますか？", a: "それぞれで同じメールアドレスを使えば、どの端末にもすべての通知が届きます。" },
    { q: "メールはどうなりますか？", a: "通知をオンにした端末がない場合は、代わりにメールで届きます。" },
  ],
  cta: { title: "まだ通知を設定していませんか？", button: "通知を設定する" },

  mocks: {
    share: "共有",
    shareSheet: { copy: "コピー", readingList: "リーディングリストに追加", bookmark: "ブックマークを追加", favorites: "お気に入りに追加", addToHome: "ホーム画面に追加", markup: "マークアップ" },
    addDialog: { cancel: "キャンセル", title: "ホーム画面に追加", add: "追加", note: "このWebサイトにすばやくアクセスできるように、ホーム画面にアイコンを追加します。" },
    iosAlert: { title: "“RestockWire”は通知を送信します。よろしいですか？", text: "通知方法は、“通知”、“サウンド”、“アイコンバッジ”が利用できる可能性があります。通知方法は“設定”で設定できます。", dontAllow: "許可しない", allow: "許可" },
    chromeMenuLabel: "メニュー",
    chromeMenu: { before: ["新しいタブ", "履歴", "ダウンロード", "ブックマーク", "共有…"], add: "ホーム画面に追加", after: ["PC版サイト"] },
    androidAlert: { title: "RestockWire に通知の送信を許可しますか？", dontAllow: "許可しない", allow: "許可" },
    desktopAlert: { wantsTo: "restockwire.com が次の許可を求めています", show: "通知の表示", block: "ブロック", allow: "許可" },
    desktopInstall: { callout: "インストール", title: "アプリをインストールしますか？", text: "専用のウィンドウで開きます", cancel: "キャンセル", install: "インストール" },
    lockScreen: { date: "10月29日 木曜日", now: "今", title: "iPhone 18 Pro 256GB ブラック", body: "Apple 銀座 · 東京 — 本日受け取り可能。apple.comを開いて予約してください。" },
  },
};
