import type { Metadata } from "next";
import { Page } from "@/components/site/Page";
export const metadata: Metadata = { title: "About", description: "RestockWire is the wire service for iPhone restocks: live in-store pickup stock at every Apple Store, the hours each store restocks, and a phone alert.", alternates: { canonical: "/about" } };
export default function About() {
  return (
    <Page title="What RestockWire is" lead="The wire service for iPhone restocks. On the wire the second it lands.">
      <h2>What you get</h2>
      <p>Live in-store pickup stock at every Apple Store, the hours each store usually restocks, and a phone alert the moment your configuration is back. Browsing is free; alerts are a paid plan.</p>
      <h2>Where the data comes from</h2>
      <p>apple.com shows pickup stock for the stores near one ZIP code. RestockWire reads all 269 US Apple Stores every 15 seconds and the stores your alerts point at every 5 seconds. A change counts only when a second check confirms it, and every confirmed restock goes into the public log.</p>
      <h2>Independent of Apple</h2>
      <p>RestockWire is not affiliated with, endorsed by or sponsored by Apple Inc. We never ask for your Apple ID. Apple, iPhone and Apple Store are trademarks of Apple Inc.</p>
      <h2>Reach us</h2>
      <p>Write to <a href="mailto:contact@restockwire.com">contact@restockwire.com</a> or use the <a href="/contact">contact form</a>. We answer within two business days.</p>
    </Page>
  );
}
