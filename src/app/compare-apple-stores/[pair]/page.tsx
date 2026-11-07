import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { US } from "@/lib/apple/countries";
import { ComparePage, compareMetadata } from "@/components/pages/insight/ComparePages";
import { findPair } from "@/lib/content/insight";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/compare-apple-stores/[pair]">): Promise<Metadata> { return compareMetadata(US, (await params).pair); }
/** /compare-apple-stores/{a}-vs-{b}: two neighbouring US Apple Stores side by side. */
export default async function Page({ params }: PageProps<"/compare-apple-stores/[pair]">) {
  const { pair } = await params;
  if (!findPair("us", pair)) notFound();
  return <ComparePage country={US} slug={pair} />;
}
