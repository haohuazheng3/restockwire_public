import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { ComparePage, compareMetadata } from "@/components/pages/insight/ComparePages";
import { findPair } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/compare-apple-stores/[pair]">): Promise<Metadata> {
  const { cc, pair } = await params;
  const r = routeCountry(cc);
  return r ? compareMetadata(r.c, pair, r.loc) : {};
}
/** /{cc}/compare-apple-stores/{a}-vs-{b}. */
export default async function Page({ params }: PageProps<"/[cc]/compare-apple-stores/[pair]">) {
  const { cc, pair } = await params;
  const r = routeCountryForPage(cc);
  if (!r || !(findPair(r.c.cc, pair))) notFound();
  return <ComparePage country={r.c} slug={pair} />;
}
