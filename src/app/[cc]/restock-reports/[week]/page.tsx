import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { ReportPage, reportMetadata } from "@/components/pages/insight/ReportPages";
import { weekReport } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/restock-reports/[week]">): Promise<Metadata> {
  const { cc, week } = await params;
  const r = routeCountry(cc);
  return r ? reportMetadata(r.c, week, r.loc) : {};
}
/** /{cc}/restock-reports/{week}: one week of a country's confirmed restocks. */
export default async function Page({ params }: PageProps<"/[cc]/restock-reports/[week]">) {
  const { cc, week } = await params;
  const r = routeCountryForPage(cc);
  if (!r || !(await weekReport(r.c.cc, week))) notFound();
  return <ReportPage country={r.c} week={week} />;
}
