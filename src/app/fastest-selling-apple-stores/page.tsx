import type { Metadata } from "next";
import { US } from "@/lib/apple/countries";
import { RankingPage, rankingMetadata } from "@/components/pages/insight/RankingPage";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return rankingMetadata(US); }
/** /fastest-selling-apple-stores: US Apple Stores ranked by how fast their iPhone Duo restocks sell out. */
export default function Page() { return <RankingPage country={US} />; }
