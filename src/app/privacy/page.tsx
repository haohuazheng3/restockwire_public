import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = { title: "Privacy Policy", description: "What RestockWire keeps about you, who processes it (Clerk, Stripe, FlowGlance, Resend, Cloudflare), how analytics capture works, and how to switch it off.", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (
    <Page title="Privacy Policy" lead="Last updated November 6, 2026.">
      <h2>The short version</h2>
      <p>We keep what it takes to run your alerts and bill your plan. We do not sell or rent personal data, and we run no advertising trackers.</p>
      <h2>What we keep, and why</h2>
      <ul>
        <li><b>E-mail address</b>: you sign in with a one-time code sent by e-mail. Clerk runs sign-in and keeps you signed in with a session cookie. We also use the address for alert e-mails when no device has notifications on.</li>
        <li><b>Alert settings</b>: the model, storage, color and stores you picked. If you share your location, your browser uses it to sort nearby stores; it is never sent to us.</li>
        <li><b>Push subscriptions</b>: when you turn on notifications, your browser hands us a delivery endpoint and two encryption keys for that device. We store the endpoint with your account and delete it when you turn notifications off or remove the device.</li>
        <li><b>Payments</b>: Stripe runs checkout and your subscription. We keep your Stripe customer and subscription ids, never card numbers.</li>
        <li><b>Analytics</b>: FlowGlance records how the site is used, including deep capture of page interactions, the text you submit in forms and images you upload. Details and your choice are under <a href="#analytics">Analytics</a>.</li>
        <li><b>Server logs</b>: IP address and request details, for security and rate limiting, kept 30 days.</li>
      </ul>
      <h2>Who processes it for us</h2>
      <ul>
        <li><b>Clerk</b>: e-mail codes, sign-in and session cookies.</li>
        <li><b>Stripe</b>: checkout, subscriptions and invoices.</li>
        <li><b>FlowGlance</b>: analytics.</li>
        <li><b>Resend</b>: delivery of alert e-mails.</li>
        <li><b>Cloudflare</b>: DNS, and e-mail routing for contact@ and test@ addresses.</li>
        <li><b>Linode</b>: the servers that host our database.</li>
        <li><b>Vercel</b>: hosting of the website.</li>
        <li><b>Apple, Google and Mozilla push services</b>: carrying notifications to your device.</li>
      </ul>
      <p>Each acts on our instructions and under its own privacy terms.</p>
      <h2 id="analytics">Analytics: what runs, and how to switch it off</h2>
      <p>FlowGlance is our only analytics tool. Its deep capture records the pages you open, your clicks and other page interactions, the text you type into and submit through forms, images you upload, your device and browser type, and a rough location from your network address. When you are signed in, the record carries your account id and e-mail, so a support question can be matched to what you saw.</p>
      <ul>
        <li><b>Visitors in the EU, the EEA, the UK or Switzerland</b>, or anywhere we cannot locate: a consent banner asks first. FlowGlance loads only after <b>Accept</b>; after <b>Decline</b> it never loads.</li>
        <li><b>Everywhere else</b>, the US included: FlowGlance runs by default. Choose <b>Do not track me</b> at the foot of any page to stop it; if it was running, the page reloads once without it. A <a href="https://globalprivacycontrol.org" rel="noopener">Global Privacy Control</a> signal counts as the same opt-out.</li>
      </ul>
      <p>The <code>rw_consent</code> cookie keeps your choice for 180 days; switch it back any time with the analytics link in the page footer. To pick the right rule, your browser asks our host (Vercel) once for the country of your network address; the answer sits in the <code>rw_region</code> cookie for 180 days and is not stored on our servers.</p>
      <h2>Cookies</h2>
      <p>Clerk&apos;s session cookies keep you signed in. Ours are <code>rw_consent</code> (your analytics choice) and <code>rw_region</code> (whether the consent banner applies). FlowGlance sets a first-party cookie only while it runs. No third-party advertising cookies.</p>
      <h2>How long we keep it</h2>
      <p>Account data and alerts stay while your account exists. To delete your account, write from your account address; it is gone within 7 days, except the payment records tax law makes us keep.</p>
      <h2>Your rights</h2>
      <p>Ask <a href="mailto:contact@restockwire.com">contact@restockwire.com</a> to see, correct or delete your data, or to object to its use. Where analytics rests on your consent (EU, EEA, UK, Switzerland), you can withdraw it at any time; earlier collection is unaffected. EU and UK residents may also complain to their supervisory authority. California residents: we do not sell or share personal information as the CCPA defines it, and we honor Global Privacy Control.</p>
    </Page>
  );
}
