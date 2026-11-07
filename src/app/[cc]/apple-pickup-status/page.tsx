import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { StatusPage, statusMetadata } from "@/components/pages/insight/StatusPage";


export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps<"/[cc]/apple-pickup-status">): Promise<Metadata> {
  const r = routeCountry((await params).cc);
  return r ? statusMetadata(r.c, r.loc) : {};
}
/** /{cc}/apple-pickup-status: Apple pickup status for another country (English tree or native version). */
export default async function Page({ params }: PageProps<"/[cc]/apple-pickup-status">) {
  const r = routeCountryForPage((await params).cc);
  if (!r) notFound();
  return <StatusPage country={r.c} />;
}
