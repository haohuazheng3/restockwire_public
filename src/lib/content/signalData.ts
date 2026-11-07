import { unstable_cache } from "next/cache";
import { sql } from "drizzle-orm";
import { db, hasDatabase } from "@/lib/db";
import { partNumbersFor, storesOf, storeTimeZone } from "@/lib/apple/catalog";
import { recordError, errorMessage } from "@/lib/errors";

export interface WeekdayObservation { weekday: number; events: number; dates: number }
export interface WeekendSample { at: string; first: string | null; last: string | null; rows: WeekdayObservation[] }
const iso = (v: Date | string | null) => v ? new Date(v).toISOString() : null;
const cachedWeekend = unstable_cache(async (): Promise<WeekendSample> => {
  // Catalog zones also cover US rows whose database timezone is null. Values remain parameterized.
  const zones = sql.join(storesOf("us").map((s) => sql`(${s.storeNumber}::text, ${storeTimeZone(s)}::text)`), sql`, `);
  const parts = sql.join(partNumbersFor("duo").map((p) => sql`${p}`), sql`, `);
  const result = await db().execute(sql`
    with observations as (
      select e.at, (e.at at time zone z.zone)::date as local_date,
        extract(dow from e.at at time zone z.zone)::int as weekday
      from availability_events e
      join (values ${zones}) as z(store_number, zone) on z.store_number = e.store_number
      where e.kind = 'restock' and e.first_seen = false
        and e.at >= now() - interval '14 days' and e.at <= now()
        and e.part_number in (${parts})
    )
    select weekday, count(*)::int as events, count(distinct local_date)::int as dates,
      min(at) as first, max(at) as last
    from observations group by weekday order by weekday`);
  const rows = result.rows as { weekday: number; events: number; dates: number; first: string | Date; last: string | Date }[];
  return {
    at: new Date().toISOString(),
    first: rows.map((r) => iso(r.first)!).sort()[0] ?? null,
    last: rows.map((r) => iso(r.last)!).sort().at(-1) ?? null,
    rows: Array.from({ length: 7 }, (_, weekday) => {
      const row = rows.find((r) => Number(r.weekday) === weekday);
      return { weekday, events: Number(row?.events ?? 0), dates: Number(row?.dates ?? 0) };
    }),
  };
}, ["signal-weekday-us-duo-v1"], { revalidate: 300 });

export async function weekendSample(): Promise<WeekendSample | null> {
  if (!hasDatabase()) return null;
  try { return await cachedWeekend(); }
  catch (e) { await recordError("web", "signal weekday sample: " + errorMessage(e)); return null; }
}
