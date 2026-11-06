import { describe, expect, it } from "vitest";
import { isDeadlock, retryDeadlock } from "@/lib/db";

describe("deadlock retry (relay and fast lane both write store_sku_status)", () => {
  it("recognises Postgres 40P01, also wrapped by drizzle", () => {
    expect(isDeadlock({ code: "40P01" })).toBe(true);
    expect(isDeadlock({ message: "Failed query: x", cause: { code: "40P01" } })).toBe(true);
    expect(isDeadlock({ message: "Failed query: deadlock detected — update …" })).toBe(true);
    expect(isDeadlock({ code: "23505" })).toBe(false);
  });
  it("runs the statement again after a deadlock, never after another error", async () => {
    let n = 0;
    const ok = await retryDeadlock(async () => { if (++n < 3) throw { code: "40P01" }; return "done"; }, 3, async () => {});
    expect(ok).toBe("done");
    expect(n).toBe(3);
    let m = 0;
    await expect(retryDeadlock(async () => { m++; throw { code: "23505" }; }, 3, async () => {})).rejects.toEqual({ code: "23505" });
    expect(m).toBe(1);
  });
});
