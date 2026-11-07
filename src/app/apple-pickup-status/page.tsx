import type { Metadata } from "next";
import { US } from "@/lib/apple/countries";
import { StatusPage, statusMetadata } from "@/components/pages/insight/StatusPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return statusMetadata(US); }
/** /apple-pickup-status: is Apple's in-store pickup lookup answering for US Apple Stores right now. */
export default function Page() { return <StatusPage country={US} />; }
