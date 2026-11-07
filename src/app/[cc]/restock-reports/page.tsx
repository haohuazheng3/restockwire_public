import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { ReportsIndexPage, reportsIndexMetadata } from "@/components/pages/insight/ReportPages";


export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/restock-reports">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r ? reportsIndexMetadata(r.c, r.loc) : {};
}
/** /{cc}/restock-reports: the country's weekly report archive. */
export default async function Page({ params }: PageProps<"/[cc]/restock-reports">) {
  const r = routeCountryForPage((await params).cc);
  if (!r) notFound();
  return <ReportsIndexPage country={r.c} />;
}
