import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { CompareIndexPage, compareIndexMetadata } from "@/components/pages/insight/ComparePages";
import { comparePairs } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/compare-apple-stores">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r ? compareIndexMetadata(r.c, r.loc) : {};
}
/** /{cc}/compare-apple-stores: neighbouring stores of a country. */
export default async function Page({ params }: PageProps<"/[cc]/compare-apple-stores">) {
  const r = routeCountryForPage((await params).cc);
  if (!r || !(comparePairs(r.c.cc).length > 0)) notFound();
  return <CompareIndexPage country={r.c} />;
}
