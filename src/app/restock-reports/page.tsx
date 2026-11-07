import type { Metadata } from "next";
import { US } from "@/lib/apple/countries";
import { ReportsIndexPage, reportsIndexMetadata } from "@/components/pages/insight/ReportPages";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return reportsIndexMetadata(US); }
/** /restock-reports: every weekly restock report for US Apple Stores. */
export default function Page() { return <ReportsIndexPage country={US} />; }
