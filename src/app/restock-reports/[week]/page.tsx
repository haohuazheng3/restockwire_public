import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { US } from "@/lib/apple/countries";
import { ReportPage, reportMetadata } from "@/components/pages/insight/ReportPages";
import { weekReport } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/restock-reports/[week]">): Promise<Metadata> { return reportMetadata(US, (await params).week); }
/** /restock-reports/2026-w45: one week of confirmed restocks at US Apple Stores. */
export default async function Page({ params }: PageProps<"/restock-reports/[week]">) {
  const { week } = await params;
  if (!(await weekReport("us", week))) notFound();
  return <ReportPage country={US} week={week} />;
}
