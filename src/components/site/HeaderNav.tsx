"use client";
/**
 * The header's section links. English pages (the US and every English country tree) keep the links they always had
 * (/in-stock/iphone-duo…: pages with search and AI traffic keep their internal links as they were); a native version
 * links into its own tree (/ja-jp/in-stock/iphone-duo), and app pages into the person's language version.
 */
import { usePathname } from "next/navigation";
import { PendingLink as Link } from "@/components/ui/PendingLink";
import { useAppLocale, useT } from "@/components/i18n/LangProvider";
import { isAppPath, localeFromSegment } from "@/lib/i18n/locales";

/** The prefix of the country tree a path belongs to ("" for the US). */
export function treePrefix(pathname: string, app: string | null): string {
  const seg = pathname.split("/")[1];
  if (localeFromSegment(seg)?.native) return `/${seg}`;
  return isAppPath(pathname) && app ? `/${app}` : "";
}

export function HeaderNav({ variant }: { variant: "main" | "sections" }) {
  const pathname = usePathname() ?? "/";
  const app = useAppLocale();
  const d = useT().chrome.nav;
  const p = treePrefix(pathname, app?.id ?? null);
  const links: [string, string][] = [[`${p}/in-stock/iphone-duo`, d.duoStock], [`${p}/restock-log`, d.restocks], [`${p}/live-map`, d.map], [`${p}/apple-stores`, d.stores], ["/pricing", d.pricing]];
  if (variant === "main") {
    return (
      <nav className="hidden items-center md:flex" aria-label={d.main}>
        {links.map(([href, label]) => <Link key={href} className="nav-link" href={href}>{label}</Link>)}
      </nav>
    );
  }
  return (
    <nav className="-mx-1 flex overflow-x-auto border-t border-line md:hidden [scrollbar-width:none]" aria-label={d.sections}>
      {links.map(([href, label]) => <Link key={href} className="nav-link shrink-0" href={href}>{label}</Link>)}
      <Link className="nav-link not-in-app shrink-0" href="/phone-alerts">{d.getApp}</Link>
    </nav>
  );
}
