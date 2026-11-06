import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ratelimit-test — a dedicated path to prove rate limiting: 10 requests a minute per IP, then 429. */
export async function GET(req: Request) {
  const ok = await rateLimit(`ratelimit-test:${clientIp(req)}`, 10, 60 * 1000);
  return NextResponse.json({ ok }, { status: ok ? 200 : 429, headers: { "cache-control": "no-store" } });
}
