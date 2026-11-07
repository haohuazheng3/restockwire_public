import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Logo } from "./Logo";
import { topStates } from "@/lib/seo/links";
import { TrackingChoice } from "./Consent";
import { switchCountries } from "./countries";
import type { Locale } from "@/lib/i18n/locales";
import { dict } from "@/lib/i18n/dict";
import { cityPages, regionPages, storeRefs } from "@/lib/seo/countryLinks";
import { cityLabel, regionLabel, storeLabel } from "@/lib/i18n/places";

/** English pages keep the US-wide footer; a native version gets its own country's links in its language. */
export function Footer({ loc }: { loc: Locale }) {
  if (loc.native) return <NativeFooter loc={loc} />;
  return (
    <footer className="mt-24 w-full border-t border-line bg-[var(--bg-2)]/40 pb-10">
      <div className="mx-auto max-w-6xl px-4">
      <div className="pt-10 text-[0.8125rem]">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-3">
              The wire service for iPhone restocks: every restock at all 269 US Apple Stores, logged by store, configuration and minute.
            </p>
            <p className="mt-3 text-xs text-ink-3">RestockWire runs on its own; Apple Inc. neither backs nor runs it. Apple, iPhone and Apple Store belong to Apple Inc. as trademarks.</p>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">Live data</div>
            <ul className="space-y-2 text-ink-2">
              <li><Link href="/in-stock/iphone-duo" className="hover:text-ink">iPhone Duo: live stock</Link></li>
              <li><Link href="/in-stock/iphone-18-pro" className="hover:text-ink">iPhone 18 Pro: live stock</Link></li>
              <li><Link href="/in-stock/iphone-18-pro-max" className="hover:text-ink">iPhone 18 Pro Max: live stock</Link></li>
              <li><Link href="/restock-log" className="hover:text-ink">The restock wire</Link></li>
              <li><Link href="/live-map" className="hover:text-ink">Stock map</Link></li>
              <li><Link href="/apple-stores" className="hover:text-ink">Every Apple Store, state by state</Link></li>
              <li><Link href="/pricing" className="hover:text-ink">Pricing</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">RestockWire</div>
            <ul className="space-y-2 text-ink-2">
              <li><Link href="/how-restock-alerts-work" className="hover:text-ink">How the alerts work</Link></li>
              <li className="not-in-app"><Link href="/phone-alerts" className="hover:text-ink">Alerts on your phone</Link></li>
              <li><Link href="/about" className="hover:text-ink">About</Link></li>
              <li><Link href="/blog" className="hover:text-ink">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">States with the most stores</div>
            <ul className="space-y-2 text-ink-2">
              {topStates(8).map((s) => <li key={s.slug}><Link href={s.href} className="hover:text-ink">{s.name}</Link></li>)}
              <li><Link href="/apple-stores" className="hover:text-ink">Every state and city →</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">The fine print</div>
            <ul className="space-y-2 text-ink-2">
              <li><Link href="/privacy" className="hover:text-ink">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-ink">Terms</Link></li>
              <li><Link href="/refunds" className="hover:text-ink">Refunds</Link></li>
              <li><TrackingChoice /></li>
            </ul>
          </div>
        </div>
        <div className="hairline mt-8 pt-5 text-sm">
          <div className="eyebrow mb-3">Asked about the iPhone Duo</div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-ink-2">
            <li><Link href="/when-does-iphone-duo-restock" className="hover:text-ink">What time does the iPhone Duo restock?</Link></li>
            <li><Link href="/how-fast-does-iphone-duo-sell-out" className="hover:text-ink">How long does a restock last?</Link></li>
            <li><Link href="/iphone-duo-restock-alerts" className="hover:text-ink">Restock alerts, 5-second checks</Link></li>
            <li><Link href="/iphone-duo-in-stock-near-me" className="hover:text-ink">Which stores near me have it?</Link></li>
            <li><Link href="/how-to-buy-an-iphone-duo-in-store" className="hover:text-ink">Buying an iPhone Duo in store</Link></li>
            <li><Link href="/iphone-duo-restock-checkout-guide" className="hover:text-ink">Checking out a restock, step by step</Link></li>
            <li><Link href="/iphone-duo-most-restocked-stores" className="hover:text-ink">Most-restocked stores and configs</Link></li>
            <li><Link href="/apple-store-pickup-explained" className="hover:text-ink">“Unavailable for pickup”, explained</Link></li>
            <li><Link href="/is-iphone-duo-back-in-stock" className="hover:text-ink">Is the iPhone Duo back yet?</Link></li>
            <li><Link href="/iphone-duo-availability-checker" className="hover:text-ink">Check iPhone Duo availability</Link></li>
            <li><Link href="/where-to-buy-iphone-duo-today" className="hover:text-ink">Where to buy it today</Link></li>
          </ul>
        </div>
        <div className="hairline mt-6 pt-5 text-sm">
          <div className="eyebrow mb-3">Other countries</div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-ink-2">
            {[...switchCountries()].sort((a, b) => a.name.localeCompare(b.name)).map((c) => <li key={c.cc}><Link href={c.cc === "us" ? "/" : `/${c.cc}`} className="hover:text-ink">{c.name}</Link></li>)}
          </ul>
        </div>
        <div className="hairline mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 text-xs text-ink-3">
          <span>© {new Date().getFullYear()} RestockWire</span>
          <Link href="/api/health" className="hover:text-ink">Wire status</Link>
        </div>
      </div>
      </div>
    </footer>
  );
}

function NativeFooter({ loc }: { loc: Locale }) {
  const D = dict(loc.lang);
  const F = D.chrome.footer;
  const cc = loc.cc;
  const p = `/${cc}`;
  const places = [
    ...regionPages(cc).map((r) => ({ href: r.href, label: regionLabel(cc, r.name, loc.lang) })),
    ...cityPages(cc).map((c) => ({ href: c.href, label: cityLabel(cc, c.name, loc.lang) })),
  ];
  const list = (places.length ? places : storeRefs(cc).map((x) => ({ href: x.href, label: storeLabel(x.store, loc.lang) }))).slice(0, 8);
  const names = switchCountries();
  return (
    <footer className="mt-24 w-full border-t border-line bg-[var(--bg-2)]/40 pb-10" lang={loc.tag}>
      <div className="mx-auto max-w-6xl px-4">
      <div className="pt-10 text-[0.8125rem]">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-3">{F.blurbIn(D.place.allStoresPhrase(cc))}</p>
            <p className="mt-3 text-xs text-ink-3">{F.trademark}</p>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">{F.product}</div>
            <ul className="space-y-2 text-ink-2">
              <li><Link href={`${p}/in-stock/iphone-duo`} className="hover:text-ink">{F.duoStock}</Link></li>
              <li><Link href={`${p}/in-stock/iphone-18-pro`} className="hover:text-ink">{F.proStock}</Link></li>
              <li><Link href={`${p}/in-stock/iphone-18-pro-max`} className="hover:text-ink">{F.proMaxStock}</Link></li>
              <li><Link href={`${p}/restock-log`} className="hover:text-ink">{F.restockLog}</Link></li>
              <li><Link href={`${p}/live-map`} className="hover:text-ink">{F.liveMap}</Link></li>
              <li><Link href={`${p}/when-does-iphone-duo-restock`} className="hover:text-ink">{F.restockTimes}</Link></li>
              <li><Link href="/pricing" className="hover:text-ink">{F.pricing}</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">{F.company}</div>
            <ul className="space-y-2 text-ink-2">
              <li className="not-in-app"><Link href="/phone-alerts" className="hover:text-ink">{F.getApp}</Link></li>
              <li><Link href="/how-restock-alerts-work" className="hover:text-ink">{F.howItWorks}</Link> <span className="text-xs text-ink-3">· {F.englishOnly}</span></li>
              <li><Link href="/about" className="hover:text-ink">{F.about}</Link></li>
              <li><Link href="/contact" className="hover:text-ink">{F.contact}</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">{F.storesIn}</div>
            <ul className="space-y-2 text-ink-2">
              {list.map((x) => <li key={x.href}><Link href={x.href} className="hover:text-ink">{x.label}</Link></li>)}
              <li><Link href={`${p}/apple-stores`} className="hover:text-ink">{F.allStores}</Link></li>
            </ul>
          </div>
          <div className="text-sm">
            <div className="eyebrow mb-3">{F.legal} <span className="normal-case tracking-normal text-ink-3">· {F.englishOnly}</span></div>
            <ul className="space-y-2 text-ink-2">
              <li><Link href="/privacy" className="hover:text-ink">{F.privacy}</Link></li>
              <li><Link href="/terms" className="hover:text-ink">{F.terms}</Link></li>
              <li><Link href="/refunds" className="hover:text-ink">{F.refunds}</Link></li>
              <li><TrackingChoice /></li>
            </ul>
          </div>
        </div>
        <div className="hairline mt-6 pt-5 text-sm">
          <div className="eyebrow mb-3">{F.countries}</div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-ink-2">
            {names.map((c) => <li key={c.cc}><Link href={c.cc === "us" ? "/" : `/${c.cc}`} className="hover:text-ink">{c.names?.[loc.lang] ?? c.name}</Link></li>)}
          </ul>
        </div>
        <div className="hairline mt-6 flex flex-wrap items-center justify-between gap-3 pt-5 text-xs text-ink-3">
          <span>© {new Date().getFullYear()} RestockWire</span>
          <Link href="/api/health" className="hover:text-ink">{F.status}</Link>
        </div>
      </div>
      </div>
    </footer>
  );
}
