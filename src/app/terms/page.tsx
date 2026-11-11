import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = { title: "Terms of Service", description: "The rules for using RestockWire: stock data as apple.com shows it, alerts on monthly paid plans, acceptable use, and the limits of what any alert can promise.", alternates: { canonical: "/terms" } };
export default function Terms() {
  return (
    <Page title="Terms of Service" lead="Last updated November 11, 2026.">
      <h2>What RestockWire does</h2>
      <p>RestockWire reads the in-store pickup availability apple.com shows for selected iPhone models at Apple Stores and notifies you by phone or e-mail when it changes. We do not sell phones, hold them for you or promise that an alert ends in a purchase.</p>
      <h2>Plans and billing</h2>
      <p>Live stock, the map and the restock log are free to browse. Alerts need a plan: Plus at US$5 a month for 10 alerts, Pro at US$10 for 20, Max at US$20 for 50. Stripe bills in advance and the plan renews monthly until you cancel. Cancel anytime; alerts run to the end of the paid month, then stop. Moving up starts at once and bills only the days left in the month; moving down starts at your next renewal, and the rest of the current month is not refunded or credited. Refunds follow the <a href="/refunds">Refund Policy</a>. Prices may change with 30 days&apos; notice.</p>
      <h2>Your account</h2>
      <p>You sign in with a one-time code sent to your e-mail. Keep that mailbox secure; what happens under your account is your responsibility.</p>
      <h2>Fair use</h2>
      <p>For personal, non-commercial use. No scraping, no reselling alerts, no automated accounts.</p>
      <h2>Accuracy</h2>
      <p>Stock data comes from Apple and can be late, wrong or withdrawn. The service is provided &ldquo;as is&rdquo;, without warranties. Our liability is capped at the fees you paid in the last 3 months.</p>
      <h2>Changes and ending</h2>
      <p>We may change these terms or end the service; material changes are announced by e-mail. Accounts that break these terms may be suspended.</p>
      <h2>Questions</h2>
      <p><a href="mailto:contact@restockwire.com">contact@restockwire.com</a></p>
    </Page>
  );
}
