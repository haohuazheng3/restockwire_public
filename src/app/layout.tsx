import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { AlertBar } from "@/components/site/AlertBar";
import { AlertLinkHost } from "@/components/alerts/AlertLinkHost";
import { THEME_BOOT, THEME_COLORS } from "@/lib/theme";
import { Consent } from "@/components/site/Consent";
import { PwaBoot } from "@/components/pwa/PwaBoot";
import { NavSkeleton } from "@/components/ui/NavSkeleton";
import { FreshOnReturn } from "@/components/site/FreshOnReturn";
import { ErrorReporter } from "@/components/site/ErrorReporter";
import { siteLd } from "@/lib/seo/siteLd";
import { headers } from "next/headers";
import { LangProvider } from "@/components/i18n/LangProvider";
import { LangSuggest } from "@/components/i18n/LangSuggest";
import { Suspense } from "react";
import { requestLocale } from "@/lib/i18n/server";
import { APP_LOCALE_HEADER, nativeLocale } from "@/lib/i18n/locales";
import { CDICTS } from "@/lib/i18n/cdict/all";

// "optional": the page renders in the web font only if it is there within ~100 ms (cached after the first
// visit); otherwise it keeps the metric-matched fallback for that view instead of swapping mid-read. Pages now
// paint real text in the first frame, and a late swap re-wrapped the H1 and pushed the content (CLS ~0.15).
// Three faces: a geometric grotesk for headlines (the wire-service voice), Plex Sans for reading, Plex Mono for
// readings — counts, seconds, clock times (the .num / .eyebrow helpers in globals.css).
const display = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"], display: "optional", weight: ["500", "600", "700"] });
const sans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], display: "optional", weight: ["400", "500", "600", "700"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], display: "optional", weight: ["400", "500", "600"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://restockwire.com";
const INDEXABLE = process.env.NEXT_PUBLIC_INDEXABLE === "1";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "RestockWire: iPhone restock alerts for every Apple Store", template: "%s · RestockWire" },
  description:
    "Live iPhone Duo, 18 Pro and 18 Pro Max pickup stock at every US Apple Store, the hours each store restocks, and a phone alert the second yours is back. From $5 a month.",
  applicationName: "RestockWire",
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: { type: "website", siteName: "RestockWire", url: SITE },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "RestockWire", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

// theme-color matches the header band (browsers that still read it: Safari before 26, Chrome on Android);
// THEME_BOOT and the toggle switch it with the theme.
export const viewport: Viewport = { themeColor: THEME_COLORS.dark, width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // The page's language (proxy: native tree, or the person's for app pages); crossing languages is a full load, so this holds for the whole visit.
  const loc = await requestLocale();
  const app = nativeLocale((await headers()).get(APP_LOCALE_HEADER)) ?? null;
  return (
    <html lang={loc.native ? loc.tag : "en"} dir={loc.native && loc.lang === "ar" ? "rtl" : undefined} className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Runs as the parser reaches it — before any paint — so a dark reader never sees a light flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        {/* Who RestockWire is and what it does, on every page an answer engine may land on (lib/seo/siteLd.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteLd) }} />
      </head>
      <body className="flex min-h-full flex-col">
        <LangProvider loc={loc} app={app} d={loc.lang === "en" ? null : CDICTS[loc.lang]}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{ variables: { colorPrimary: "#f5b942" } }}
          signInUrl="/?signin=1"
          signUpUrl="/?signin=1"
        >
          <div className="void-bg" aria-hidden="true" />
          <Header loc={loc} />
          <Suspense fallback={null}><LangSuggest /></Suspense>
          <main className="flex-1 pb-24 sm:pb-28"><NavSkeleton>{children}</NavSkeleton></main>
          <Footer loc={loc} />
          <AlertBar />
          <AlertLinkHost />
          <FreshOnReturn />
          <ErrorReporter />
        </ClerkProvider>
        <Consent />
        <PwaBoot />
        </LangProvider>
      </body>
    </html>
  );
}
