import { describe, expect, it } from "vitest";
import { comparePairs, hasRankingPage, isoWeekOf, roughHours, statusVerdict, trackedDaysOf, weekRange, weeksSince } from "@/lib/content/insight";
import { storesOf } from "@/lib/apple/catalog";
import { ALL_CODES } from "@/lib/apple/countries";

describe("weeks", () => {
  it("names ISO weeks and maps them back to Monday–Sunday", () => {
    expect(isoWeekOf("2026-11-02")).toBe("2026-w45");
    expect(isoWeekOf("2026-11-08")).toBe("2026-w45");
    expect(isoWeekOf("2026-10-29")).toBe("2026-w44");
    expect(isoWeekOf("2027-01-01")).toBe("2026-w53");
    expect(weekRange("2026-w45")).toEqual({ start: "2026-11-02", end: "2026-11-08" });
    expect(weekRange("2026-w99")).toBeNull();
    expect(weekRange("nope")).toBeNull();
  });
  it("lists weeks from the first tracked day, newest first, and counts tracked days", () => {
    expect(weeksSince("us", "2026-11-07")).toEqual(["2026-w45", "2026-w44"]);
    expect(weeksSince("jp", "2026-11-07")).toEqual(["2026-w45"]);
    expect(trackedDaysOf("us", "2026-w44", "2026-11-07")).toBe(4);
    expect(trackedDaysOf("jp", "2026-w45", "2026-11-04")).toBe(3);
  });
});

describe("status verdict", () => {
  it("reads freshness first, then the last hour's failures", () => {
    expect(statusVerdict(40, 40, { requests: 1000, failures: 3 })).toBe("ok");
    expect(statusVerdict(40, 40, { requests: 1000, failures: 80 })).toBe("slow");
    expect(statusVerdict(30, 40, { requests: 1000, failures: 0 })).toBe("slow");
    expect(statusVerdict(10, 40, { requests: 1000, failures: 0 })).toBe("down");
    expect(statusVerdict(0, 0, { requests: 0, failures: 0 })).toBe("unknown");
    expect(roughHours([{ hour: "a", requests: 100, failures: 6 }, { hour: "b", requests: 100, failures: 1 }, { hour: "c", requests: 10, failures: 5 }]).map((h) => h.hour)).toEqual(["a"]);
  });
});

describe("store comparisons", () => {
  it("store slugs are unique inside every country", () => {
    for (const cc of ALL_CODES) { const s = storesOf(cc).map((x) => x.slug); expect(new Set(s).size, cc).toBe(s.length); }
  });
  it("pairs each store with its nearest neighbour in the same city, once", () => {
    const us = comparePairs("us");
    expect(us.length).toBeGreaterThan(20);
    for (const p of us) { expect(p.a.city).toBe(p.b.city); expect(p.a.slug < p.b.slug).toBe(true); }
    expect(new Set(us.map((p) => p.slug)).size).toBe(us.length);
    expect(comparePairs("au")).toEqual([]);
    expect(comparePairs("uk").length).toBeLessThan(10);
  });
  it("ranks countries with five stores or more", () => {
    expect(hasRankingPage("us")).toBe(true);
    expect(hasRankingPage("ae")).toBe(true);
    expect(hasRankingPage("ch")).toBe(false);
  });
});
