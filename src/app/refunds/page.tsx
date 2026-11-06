import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = { title: "Refund Policy", description: "A payment is refunded in full if you ask within 7 days and no real restock alert was sent to you after it. Test notifications do not count. How to ask.", alternates: { canonical: "/refunds" } };
export default function Refunds() {
  return (
    <Page title="Refund Policy" lead="Paid, but no real restock alert since? Ask within 7 days and that payment comes back in full.">
      <h2>The rule</h2>
      <ul>
        <li><b>7 days</b>: ask within 7 days of the payment, counted from the moment of the charge.</li>
        <li><b>No real alert since</b>: no restock push went to any of your devices, and no restock e-mail went to you, after that payment. Once one has, that payment has been used.</li>
        <li><b>Tests are free</b>: &ldquo;Send a test notification&rdquo; and &ldquo;Preview on this device&rdquo; never count against a refund.</li>
      </ul>
      <h2>What a refund does</h2>
      <ul>
        <li>The payment is returned in full and the plan ends at once: alerts stop and nothing more is charged.</li>
        <li>Your saved alerts stay on the account and switch back on if you subscribe again.</li>
      </ul>
      <h2>How to ask</h2>
      <p>E-mail <a href="mailto:contact@restockwire.com?subject=Refund%20request">contact@restockwire.com</a> from your account address with &ldquo;Refund&rdquo; in the subject. We check the alert log, answer within two business days and refund to the original payment method; banks usually show it within 5 business days.</p>
      <h2>Cancelling is different</h2>
      <p>Cancelling (Dashboard → Cancel subscription) stops the next renewal; alerts keep running to the end of the paid period. It does not refund anything by itself; if a payment qualifies, ask as above.</p>
      <p>None of this limits your rights under the consumer law where you live.</p>
    </Page>
  );
}
