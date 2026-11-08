import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeCountry, routeCountryForPage } from "@/components/pages/locale";
import { RestockTimesPage, restockTimesMetadata, restockTimesScope } from "@/components/pages/RestockTimesPage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/[cc]/when-does-iphone-duo-restock/[region]">): Promise<Metadata> {
  const { cc, region } = await params;
  const r = routeCountry(cc);
  const scope = r ? restockTimesScope(r.c.cc, region) : null;
  return r && scope ? restockTimesMetadata(r.c, r.loc, scope) : {};
}

/**
 * /{cc}/when-does-iphone-duo-restock/{region}: the country's restock-hour page counted over one region's stores.
 * Only regions whose store page is their own have one; the proxy 308s the rest (seo/routes.ts, content/restockPlaces.ts).
 */
export default async function Page({ params }: PageProps<"/[cc]/when-does-iphone-duo-restock/[region]">) {
  const { cc, region } = await params;
  const r = routeCountryForPage(cc);
  if (!r) notFound();
  const scope = restockTimesScope(r.c.cc, region);
  if (!scope) notFound();
  return <RestockTimesPage country={r.c} scope={scope} />;
}
