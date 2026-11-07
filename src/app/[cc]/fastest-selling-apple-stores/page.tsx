import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { RankingPage, rankingMetadata } from "@/components/pages/insight/RankingPage";
import { hasRankingPage } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/fastest-selling-apple-stores">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r ? rankingMetadata(r.c, r.loc) : {};
}
/** /{cc}/fastest-selling-apple-stores: countries with five stores or more. */
export default async function Page({ params }: PageProps<"/[cc]/fastest-selling-apple-stores">) {
  const r = routeCountryForPage((await params).cc);
  if (!r || !(hasRankingPage(r.c.cc))) notFound();
  return <RankingPage country={r.c} />;
}
