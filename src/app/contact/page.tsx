import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
import { ContactForm } from "@/components/site/ContactForm";
export const metadata: Metadata = { title: "Contact", description: "Write to RestockWire about an alert, a payment, a refund or a store that looks wrong. A person reads every message and answers within two business days.", alternates: { canonical: "/contact" } };
export default function Contact() {
  return (
    <Page title="Contact RestockWire" lead="We answer within two business days.">
      <p>The form below reaches the same inbox as <a href="mailto:contact@restockwire.com">contact@restockwire.com</a>. Alerts, billing, refunds, a store we got wrong: all welcome.</p>
      <ContactForm />
    </Page>
  );
}
