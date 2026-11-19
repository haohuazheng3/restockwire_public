import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { emailPlan } from "@/lib/stock/notify";
import { hasMobileDevice } from "@/lib/push/platform";

/**
 * 2026-11-18 (owner): a member whose notification devices are all computers also gets every alert by email, because a
 * computer only shows a push while it is awake; once a phone or tablet has them on, email pauses. Only the fallback
 * emails are recorded, so each alert keeps one notification row.
 */
describe("computers only → email too", () => {
  const all = ["a", "b", "c"];
  it("no device → every alert by email", () => {
    expect(emailPlan(all, all, false, true)).toEqual({ send: all, record: all });
  });
  it("a phone got the push → no email", () => {
    expect(emailPlan(all, [], true, false)).toEqual({ send: [], record: [] });
  });
  it("push to one store failed → that store by email", () => {
    expect(emailPlan(all, ["c"], true, false)).toEqual({ send: ["c"], record: ["c"] });
  });
  it("computers only: every alert by email, only the fallback ones recorded", () => {
    expect(emailPlan(all, [], true, true)).toEqual({ send: all, record: [] });
    expect(emailPlan(all, ["c"], true, true)).toEqual({ send: all, record: ["c"] });
  });
  it("any phone or tablet counts; unknown counts as a computer", () => {
    expect(hasMobileDevice([{ platform: "desktop" }])).toBe(false);
    expect(hasMobileDevice([{ platform: "desktop" }, { platform: "unknown" }])).toBe(false);
    expect(hasMobileDevice([{ platform: "desktop" }, { platform: "ios" }])).toBe(true);
    expect(hasMobileDevice([{ platform: "android" }])).toBe(true);
  });
  it("the alert path uses it and never records an empty batch", () => {
    const src = readFileSync("src/lib/stock/notify.ts", "utf8");
    expect(src).toMatch(/emailPlan\(g\.hits, byEmail, devices\.length > 0, !hasMobileDevice\(devices\)\)/);
    expect(src).toMatch(/if \(mail\.record\.length\) await record\(mail\.record, "email", "failed"/);
  });
});
