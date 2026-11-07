import type { Metadata } from "next";
import { GuidePage, guideMetadata } from "@/components/pages/insight/GuidePage";

export const dynamic = "force-dynamic";
export function generateMetadata(): Metadata { return guideMetadata("android"); }
/** /restock-alerts-on-android: phone guide (English). */
export default function Page() { return <GuidePage guide="android" />; }
