import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { GuidePage, guideMetadata } from "@/components/pages/insight/GuidePage";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/restock-alerts-on-apple-watch">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r?.loc.native ? guideMetadata("watch", r.loc) : {};
}
/** /{lang}-{cc}/restock-alerts-on-apple-watch: the guide in a native version (English country trees have none; the English guide is at the root). */
export default async function Page({ params }: PageProps<"/[cc]/restock-alerts-on-apple-watch">) {
  const r = routeCountryForPage((await params).cc);
  if (!r?.loc.native) notFound();
  return <GuidePage guide="watch" />;
}
