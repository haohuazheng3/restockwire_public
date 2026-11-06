import { NextResponse } from "next/server";
import { recordError } from "@/lib/errors";
import { bearerOk, env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/selftest?kind=server — Authorization: Bearer CRON_SECRET only: records a deliberate server error in
 * the inbox and answers 500, to prove the error inbox, /api/health and the owner alert end to end. Resolve the group
 * on /admin/errors afterwards.
 */
export async function GET(req: Request) {
  if (!bearerOk(req, env.cronSecret())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const kind = new URL(req.url).searchParams.get("kind") ?? "server";
  if (kind !== "server") return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  const err = new Error("selftest: deliberate server error");
  await recordError("web", `${err.name}: ${err.message}`, { route: "/api/selftest", stack: err.stack?.slice(0, 1500) });
  return NextResponse.json({ ok: false, recorded: true }, { status: 500 });
}
