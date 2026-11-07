import type { Metadata } from "next";
import { US } from "@/lib/apple/countries";
import { CompareIndexPage, compareIndexMetadata } from "@/components/pages/insight/ComparePages";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> { return compareIndexMetadata(US); }
/** /compare-apple-stores: every pair of neighbouring US Apple Stores. */
export default function Page() { return <CompareIndexPage country={US} />; }
