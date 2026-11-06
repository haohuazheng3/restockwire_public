/**
 * 通知文（プッシュ、入荷メール、「通知が止まりました」メール、端末名、Stripe 決済ページの一行）、日本語。
 * ポーラーからも送るため、型以外の import はしない。
 */
import type { NotifyText } from "./en";

export const notifyJa: NotifyText = {
  pushTitle: (cfg: string) => cfg,
  pushBody: (where: string, quote: string | null) => `${where}${quote ? ` — ${quote}` : ""}。apple.comを開いて予約してください。`,
  testTitle: "RestockWireのテスト：通知は正常に届いています",
  testBody: (time: string, device: string) => `${time}にお使いの${device}へ送信しました。実際の再入荷通知も、確認から数秒後にこれとまったく同じように届きます。`,
  device: {
    iphoneApp: "iPhone（ホーム画面に追加したアプリ）",
    iphoneSafari: "iPhone（Safari）",
    androidApp: "Android（アプリとして追加）",
    android: (browser: string) => `Android${browser ? `（${browser}）` : ""}`,
    computer: (browser: string) => `PC${browser ? `（${browser}）` : ""}`,
    other: "この機器",
  },
  email: {
    subject: (cfg: string, store: string, more: number) => `${cfg} · ${store}${more > 0 ? ` ほか${more}件` : ""}`,
    intro: "現在、店頭受け取りの対象になっています：",
    reserve: "予約する",
    store: "受け取り店舗",
    tip: "店頭受け取りの在庫は長くは続きません。Apple Storeアプリかapple.comで「受け取り」を選び、この店舗を指定してください。",
    manage: (url: string) => `この通知の変更・一時停止：${url}`,
    htmlTitle: "店頭受け取りの在庫が出ました",
    htmlReserve: "apple.comで予約する",
    htmlStorePage: "店舗ページを開く →",
    htmlTip: "店頭受け取りの在庫は長くは続きません。Apple Storeアプリかapple.comで<b>受け取り</b>を選び、この店舗を指定してください。",
    htmlManage: "この通知を変更・一時停止",
    cancel: (url: string) => `もうiPhoneを手に入れましたか？いつでも解約できます：${url}`,
    htmlGotIt: "もうiPhoneを手に入れましたか？",
    htmlCancel: "解約はいつでもどうぞ",
    nudge: (url: string) => `メールは予備の経路です。お使いのアカウントには、通知をオンにしたスマートフォンがありません。プッシュ通知なら、確認済みの再入荷から約3秒で届きます。切り替えるには、ホーム画面からRestockWireを開いて「通知をオンにする」をタップしてください：${url}`,
    htmlNudge: (url: string) => `メールは予備の経路です。お使いのアカウントには、通知をオンにしたスマートフォンがありません。<b>プッシュ通知なら約3秒</b>で、確認済みの再入荷が届きます。ホーム画面からRestockWireを開き、<b>通知をオンにする</b>をタップしてください。<a href="${url}" style="color:#0a7f3f">設定の手順 →</a>`,
  },
  /** Stripe 決済ボタンの横に出る一行。 */
  checkoutSubmit: (plan: string, limit: number, fastSec: number, checkSec: number, alertSec: number) => `${plan}：通知${limit}件。選んだ店舗は${fastSec}秒ごと、ほかの全店舗は${checkSec}秒ごとに確認し、確認済みの再入荷は約${alertSec}秒でスマートフォンに届きます。月額払いで、いつでも解約できます。`,
  stopped: {
    deviceWord: { ios: "iPhone", android: "Android端末", desktop: "PC", other: "機器" },
    subject: (device: string) => `お使いの${device}にRestockWireの通知が届かなくなりました`,
    gone: (device: string) => `プッシュサービスから、お使いの${device}のRestockWire登録が解除されたとの報告がありました。そのため、通知はもう届きません。`,
    byEmail: "通知がオンに戻るまで、再入荷通知はメールで届きます。",
    reopenIos: "直すには、Safariではなくホーム画面からRestockWireを起動し、アカウントページで「通知をオンにする」をタップしてください。",
    reopenOther: "直すには、RestockWireを開いてアカウントページへ進み、「通知をオンにする」をタップしてください。",
    causes: "主な原因は、ホーム画面からアプリを削除した、設定で通知をオフにした、バックアップからスマートフォンを復元した、のいずれかです。",
  },
  nudge: {
    subject: "RestockWireの通知を、約3秒でスマートフォンに届けられます",
    intro: "約3秒。RestockWireが再入荷を確認してから、プッシュ通知がスマートフォンに届くまでの時間です。iPhone Duoの再入荷は1分ほどでなくなることが多く、メールではそれより遅れます。いま通知がメールで届いているのは、お使いのアカウントに通知をオンにしたスマートフォンがないためです。",
    howTitle: "切り替えは1分もかかりません：",
    stepsIos: ["iPhone：Safariでrestockwire.comを開き、「共有」→「ホーム画面に追加」をタップします。", "Safariではなくホーム画面からRestockWireを起動し、ログインします。", "アカウントページで「通知をオンにする」→「許可」をタップします。"],
    stepsOther: "Androidやパソコン：restockwire.com/accountを開き、「通知をオンにする」をタップしてください。",
    after: "端末で通知をオンにするまでは、メールが続きます。オンにした後は通知として届き、メールは止まります。",
    cta: (url: string) => `図解付きの設定手順：${url}`,
  },
};
