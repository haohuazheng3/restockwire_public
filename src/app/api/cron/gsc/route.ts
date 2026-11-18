import { NextResponse } from "next/server";
import { env, bearerOk } from "@/lib/env";
import { pullSearchAnalytics, submitSitemaps } from "@/lib/gsc";
import { recordError, errorMessage } from "@/lib/errors";
import { logOps } from "@/lib/ops";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron, daily: re-submit the sitemaps (lib/gsc.ts SITEMAPS), then Search Console search analytics (query × page × device × country) into gsc_daily. */
export async function GET(req: Request) {
  if (!bearerOk(req, env.cronSecret())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let sitemaps: Record<string, number> | string = {};
  try {
    sitemaps = await submitSitemaps();
    await logOps("cron", "info", "gsc sitemaps", sitemaps);
  } catch (e) {
    sitemaps = errorMessage(e);
    await recordError("web", `gsc sitemaps: ${sitemaps}`);
  }
  try {
    const r = await pullSearchAnalytics();
    await logOps("cron", "info", "gsc pull", r);
    return NextResponse.json({ ok: true, ...r, sitemaps });
  } catch (e) {
    await recordError("web", `gsc pull: ${errorMessage(e)}`);
    return NextResponse.json({ ok: false, error: errorMessage(e) }, { status: 500 });
  }
}
