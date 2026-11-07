import { PendingLink as Link } from "@/components/ui/PendingLink";
import { Logo } from "./Logo";
import { AuthNav } from "./AuthNav";
import { SiteSearch } from "./SiteSearch";
import { ThemeToggle } from "./ThemeToggle";
import { CountrySwitcher } from "./CountrySwitcher";
import { HeaderNav } from "./HeaderNav";
import { switchCountries } from "./countries";
import type { Locale } from "@/lib/i18n/locales";
import { CDICTS } from "@/lib/i18n/cdict/all";

/** `loc`: the page's language version (the home link goes to that version's home). */
export function Header({ loc }: { loc: Locale }) {
  return (
    <header className="site-header sticky top-0 z-40">
      {/* A masthead, not a floating bar: flat paper, a dateline on wide screens, a double rule underneath. */}
      <div className="mx-auto max-w-6xl px-4">
        {!loc.native && (
          <div className="hidden items-center justify-between border-b border-line py-1.5 font-mono text-[10.5px] uppercase tracking-[.16em] text-ink-3 md:flex">
            <span>Apple Store pickup stock · iPhone Duo · 18 Pro · 18 Pro Max</span>
            <span className="inline-flex items-center gap-2"><span className="dot dot-ok dot-live" aria-hidden /> The restock wire is live</span>
          </div>
        )}
        {/* One row on every width: mark (+ wordmark from 420 px), nav on md+, then My alerts + search. The "Alert me" call to action lives in the floating AlertBar. */}
        <div className="flex items-center justify-between gap-2 py-2.5 sm:gap-3">
          <HomeMark loc={loc} />
          <HeaderNav variant="main" />
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <AuthNav />
            <SiteSearch />
            <CountrySwitcher countries={switchCountries()} />
            <ThemeToggle />
          </div>
        </div>
        {/* Phones and the Home Screen app (no address bar) still need every section one tap away. */}
        <HeaderNav variant="sections" />
      </div>
      <div className="rule-double" aria-hidden />
    </header>
  );
}

function HomeMark({ loc }: { loc: Locale }) {
  return (
    <Link href={loc.native ? `/${loc.id}` : "/"} className="flex min-w-0 shrink items-center" aria-label={CDICTS[loc.lang].chrome.nav.home}>
      <Logo compact />
    </Link>
  );
}
