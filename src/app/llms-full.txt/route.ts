import { llmsFullTxt } from "@/lib/content/llms";

export const dynamic = "force-dynamic";

/** llms-full.txt: everything in llms.txt, then one restock-pattern line per Apple Store (usual local hour, weekday, counts, latest restock). */
export async function GET() {
  return new Response(await llmsFullTxt(), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
