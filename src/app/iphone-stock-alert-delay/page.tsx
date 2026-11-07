import { signalGuides } from "@/content/signals/guides";
import { SignalPage, signalMetadata } from "@/components/signals/SignalPage";
const guide = signalGuides[1];
export const dynamic = "force-dynamic";
export const metadata = signalMetadata(guide);
export default function Page() { return <SignalPage guide={guide} />; }
