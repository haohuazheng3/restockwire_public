import { describe, expect, it } from "vitest";
import { publicRouteCheck } from "@/lib/seo/routes";
import { MODELS, STORES, citySlug, stateSlug, storePath } from "@/lib/apple/catalog";

const store = STORES[0];
const state = stateSlug(store.state);
const city = citySlug(store.city);

describe("publicRouteCheck (proxy: real 404 / 308 before the page streams)", () => {
  it("lets every real address through", () => {
    expect(publicRouteCheck("/")).toBeNull();
    expect(publicRouteCheck("/stock-check-timing")).toBeNull();
    expect(publicRouteCheck("/apple-stores")).toBeNull();
    expect(publicRouteCheck(`/apple-stores/${state}`)).toBeNull();
    expect(publicRouteCheck("/apple-stores/texas/houston")).toBeNull();
    expect(publicRouteCheck(`/apple-stores/${state}/${city}/${store.slug}`)).toBeNull();
    expect(publicRouteCheck(storePath(store))).toBeNull();
    for (const m of MODELS) expect(publicRouteCheck(`/in-stock/${m.slug}`)).toBeNull();
    expect(publicRouteCheck("/restock-log")).toBeNull();
    expect(publicRouteCheck("/account/anything")).toBeNull();
  });
  it("answers 404 for unknown states, cities, stores, models and extra segments", () => {
    expect(publicRouteCheck("/apple-stores/notastate")).toEqual({ notFound: true });
    expect(publicRouteCheck(`/apple-stores/${state}/nowhere`)).toEqual({ notFound: true });
    expect(publicRouteCheck(`/apple-stores/${state}/${city}/nonexistent-store`)).toEqual({ notFound: true });
    expect(publicRouteCheck(`/apple-stores/${state}/${city}/${store.slug}/extra`)).toEqual({ notFound: true });
    expect(publicRouteCheck("/in-stock/iphone-nope")).toEqual({ notFound: true });
    expect(publicRouteCheck(`/in-stock/${MODELS[0].slug}/x`)).toEqual({ notFound: true });
  });
  it("rejects a real store under the wrong city or state", () => {
    const other = STORES.find((s) => citySlug(s.city) !== city || stateSlug(s.state) !== state)!;
    expect(publicRouteCheck(`/apple-stores/${state}/${city}/${other.slug}`)).toEqual({ notFound: true });
  });
  it("redirects the old /apple-stores/{state}/{store} address to the city URL", () => {
    expect(publicRouteCheck(`/apple-stores/${state}/${store.slug}`)).toEqual({ redirect: storePath(store) });
  });
  it("folds one-store cities and states into their store page, one-city states into their city page", () => {
    // Birmingham, AL has one store: the city address is that store.
    expect(publicRouteCheck(`/apple-stores/${state}/${city}`)).toEqual({ redirect: storePath(store) });
    const delaware = STORES.find((s) => s.state === "Delaware")!;
    expect(publicRouteCheck("/apple-stores/delaware")).toEqual({ redirect: storePath(delaware) });
    expect(publicRouteCheck("/apple-stores/hawaii")).toEqual({ redirect: "/apple-stores/hawaii/honolulu" });
    expect(publicRouteCheck("/apple-stores/hawaii/honolulu")).toBeNull();
  });
  it("serves the blog: home and categories pass, unknown categories and posts are a real 404", () => {
    expect(publicRouteCheck("/blog")).toBeNull();
    expect(publicRouteCheck("/blog/restock-guides")).toBeNull();
    expect(publicRouteCheck("/blog/how-to-find-iphone-18-pro-in-stock-near-you")).toEqual({ notFound: true });
    expect(publicRouteCheck("/blog/restock-guides/no-such-post")).toEqual({ notFound: true });
  });
  it("never confuses a city slug with a legacy store slug", () => {
    for (const s of STORES) expect(publicRouteCheck(storePath(s))).toBeNull();
  });
});

describe("the state and city restock-times pages (/when-does-iphone-duo-restock/{state}[/{city}])", () => {
  it("lets every place with a page through and 404s the rest", () => {
    expect(publicRouteCheck("/when-does-iphone-duo-restock")).toBeNull();
    expect(publicRouteCheck("/when-does-iphone-duo-restock/california")).toBeNull();
    expect(publicRouteCheck("/when-does-iphone-duo-restock/california/los-angeles")).toBeNull();
    expect(publicRouteCheck("/when-does-iphone-duo-restock/new-york/new-york")).toBeNull();
    expect(publicRouteCheck("/when-does-iphone-duo-restock/notastate")).toEqual({ notFound: true });
    expect(publicRouteCheck("/when-does-iphone-duo-restock/california/nowhere")).toEqual({ notFound: true });
    expect(publicRouteCheck("/when-does-iphone-duo-restock/california/los-angeles/extra")).toEqual({ notFound: true });
  });
  it("folds one-store places into their store page and a one-city state into its city's page", () => {
    const delaware = STORES.find((s) => s.state === "Delaware")!;
    expect(publicRouteCheck("/when-does-iphone-duo-restock/delaware")).toEqual({ redirect: storePath(delaware) });
    expect(publicRouteCheck("/when-does-iphone-duo-restock/hawaii")).toEqual({ redirect: "/when-does-iphone-duo-restock/hawaii/honolulu" });
    expect(publicRouteCheck("/when-does-iphone-duo-restock/hawaii/honolulu")).toBeNull();
    // Birmingham, AL has one store: the city address is that store.
    expect(publicRouteCheck(`/when-does-iphone-duo-restock/${state}/${city}`)).toEqual({ redirect: storePath(store) });
  });
});
