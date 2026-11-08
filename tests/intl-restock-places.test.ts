/**
 * The region and city restock-hour pages of the other 18 countries (/{cc}/when-does-iphone-duo-restock/{region}[/{city}]
 * and their native versions): which places get one, where the others 308, restockTimesPath for every country, and the
 * dictionaries naming the place instead of the country in all twelve languages, while the country pages' sentences
 * stay exactly what they were. They are served and linked but, under the narrow index scope, neither indexed nor
 * in the sitemap (lib/seo/indexScope.ts).
 */
import { describe, expect, it } from "vitest";
import { citiesWithStores, placeTarget, statesWithStores, storePath, storesOf } from "@/lib/apple/catalog";
import { COUNTRIES, INTL_CODES, type Country, type CountryCode } from "@/lib/apple/countries";
import { emptyRestockTimes, restockTimesPath, type RestockTimes } from "@/lib/content/restockTimes";
import { RESTOCK_TIMES_SLUG, intlRestockTimesPath, restockPlacePages, restockPlaceTarget } from "@/lib/content/restockPlaces";
import { publicRouteCheck } from "@/lib/seo/routes";
import { inIndexScope } from "@/lib/seo/indexScope";
import { dict } from "@/lib/i18n/dict";
import { LANGS, type Lang } from "@/lib/i18n/locales";
import { cityLabel, countryLabel, regionLabel } from "@/lib/i18n/places";
import type { RestockTimesPlace, RestockTimesView } from "@/lib/i18n/dict/en/views";

const SLUG = RESTOCK_TIMES_SLUG;
const COUNTS: Record<Exclude<CountryCode, "us">, [number, number]> = {
  ca: [4, 4], uk: [6, 3], au: [4, 0], de: [3, 4], fr: [3, 2], it: [4, 1], es: [1, 2], jp: [0, 2], kr: [0, 1],
  hk: [0, 0], sg: [0, 0], ae: [1, 2], ch: [1, 0], nl: [1, 0], se: [0, 0], tw: [0, 0], at: [0, 0], be: [0, 0],
};

describe("which places get a restock-hour page (the store-tree rule: one page per place)", () => {
  it("counts regions and cities per country", () => {
    const got = Object.fromEntries(INTL_CODES.map((cc) => { const p = restockPlacePages(cc); return [cc, [p.regions.length, p.cities.length]]; }));
    expect(got).toEqual(COUNTS);
  });
  it("gives a place a page exactly where its store page is its own", () => {
    for (const cc of INTL_CODES) {
      const pages = restockPlacePages(cc);
      const own = new Set([...pages.regions, ...pages.cities].map((p) => p.path));
      for (const r of statesWithStores(cc)) {
        const t = placeTarget(cc, r.slug)!;
        expect(own.has(`/${cc}/${SLUG}/${r.slug}`), `${cc} ${r.slug}`).toBe(t.indexable);
      }
      for (const c of citiesWithStores(cc)) {
        const t = placeTarget(cc, c.stateSlug, c.slug)!;
        expect(own.has(`/${cc}/${SLUG}/${c.stateSlug}/${c.slug}`), `${cc} ${c.slug}`).toBe(t.indexable);
        if (t.indexable) expect(c.stores.length).toBeGreaterThan(1);
      }
      for (const p of [...pages.regions, ...pages.cities]) {
        expect(publicRouteCheck(p.path), p.path).toBeNull();
        expect(p.storesPath).toBe(p.path.replace(`/${SLUG}/`, "/apple-stores/"));
        // Served, linked, out of the index while the scope is narrow (owner, 2026-11-06).
        expect(inIndexScope(p.path), p.path).toBe(false);
      }
    }
  });
  it("308s every place without a page to its store, its city's page or the country's page", () => {
    for (const cc of INTL_CODES) {
      for (const r of statesWithStores(cc)) {
        const res = restockPlaceTarget(cc, r.slug)!;
        if ("page" in res) continue;
        const here = storesOf(cc).filter((s) => s.state === r.name);
        if (here.length === 1) expect(res.redirect).toBe(storePath(here[0]));
        else if (here.length === storesOf(cc).length) expect(res.redirect).toBe(`/${cc}/${SLUG}`);
        else expect(res.redirect).toBe(`/${cc}/${SLUG}/${r.slug}/${citiesWithStores(cc).find((c) => c.state === r.name)!.slug}`);
        expect(publicRouteCheck(`/${cc}/${SLUG}/${r.slug}`)).toEqual({ redirect: res.redirect });
      }
      for (const c of citiesWithStores(cc).filter((x) => x.stores.length === 1)) {
        expect(publicRouteCheck(`/${cc}/${SLUG}/${c.stateSlug}/${c.slug}`)).toEqual({ redirect: storePath(c.stores[0]) });
      }
    }
    expect(restockPlaceTarget("uk", "atlantis")).toBeNull();
    expect(restockPlaceTarget("uk", "greater-london", "nowhere")).toBeNull();
  });
});

describe("restockTimesPath for every country", () => {
  it("is unchanged for the US", () => {
    expect(restockTimesPath("California")).toBe(`/${SLUG}/california`);
    expect(restockTimesPath("Hawaii")).toBe(`/${SLUG}/hawaii/honolulu`);
  });
  it("names the place's page, or the page it collapses into, everywhere else", () => {
    expect(restockTimesPath("Greater London", undefined, "uk")).toBe(`/uk/${SLUG}/greater-london`);
    expect(restockTimesPath("Greater London", "London", "uk")).toBe(`/uk/${SLUG}/greater-london/london`);
    expect(restockTimesPath("Ontario", "Toronto", "ca")).toBe(`/ca/${SLUG}/ontario/toronto`);
    expect(restockTimesPath("Tokyo", undefined, "jp")).toBe(`/jp/${SLUG}/tokyo/tokyo`);
    expect(restockTimesPath("Singapore", undefined, "sg")).toBe(`/sg/${SLUG}`);
    for (const cc of INTL_CODES) {
      for (const r of statesWithStores(cc)) {
        const p = restockTimesPath(r.name, undefined, cc);
        expect(p).toBe(intlRestockTimesPath(cc, r.name));
        expect(publicRouteCheck(p), `${cc} ${r.name} → ${p}`).toBeNull();
      }
      for (const c of citiesWithStores(cc)) {
        const p = restockTimesPath(c.state, c.name, cc);
        expect(publicRouteCheck(p), `${cc} ${c.name} → ${p}`).toBeNull();
        if (c.stores.length === 1) expect(p).toBe(storePath(c.stores[0]));
      }
    }
  });
});

/* ---------------------------------------------------------------- dictionaries */

function view(c: Country, place?: RestockTimesPlace): RestockTimesView {
  const t: RestockTimes = { ...emptyRestockTimes(c.cc, new Date("2026-11-08T12:00:00Z")), n: 120, stores: 5, days: 6, spanDays: 6, peakHour: 9 };
  t.byHour[9] = 60; t.byHour[10] = 30; t.byHour[18] = 30;
  t.byWeekday[1] = 120;
  t.sellout = { n: 80, medianSec: 70, within2min: 0.7, within20min: 0.95, fastestSec: 12 };
  return {
    c, t, w: { from: 9, to: 11, share: 0.75 }, pattern: true, us: false, one: false, tracked: 7, stores: 5, duoNow: 1, weekend: 10,
    sell: t.sellout, recent: { restocks: 4, stores: 2 }, configs: 8, pairs: 40, storageRatio: 1.5, reportNames: [], alert: "/uk?model=duo#notify",
    logHref: `/${c.cc}/restock-log`, storesHref: `/${c.cc}/apple-stores`, ...(place ? { place } : {}),
  };
}

const UK = COUNTRIES.uk;

describe("English: the country page's sentences are byte-identical; a place page names the place", () => {
  const V = dict("en").views.restockTimes;
  it("keeps the country page as it was", () => {
    const x = view(UK);
    expect(V.title(UK)).toBe("What Time Does Apple Restock the iPhone Duo in the UK?");
    expect(V.h1(x)).toBe("What time does Apple restock the iPhone Duo in the UK? 9–11 AM local time, most often");
    expect(V.metaDescription(x)).toBe("Apple Stores in the UK: 75% of 120 iPhone Duo restocks since Nov 2 came 9–11 AM local time. Hour, day, area and config tables.");
    expect(V.h2(x)["time-of-day"]).toBe("At what hour does the iPhone Duo come back in the UK?");
    expect(V.nav(x).where).toBe("Per area");
    expect(V.faq(x)[0].q).toBe("Which hours bring iPhone Duo restocks in the UK?");
    expect(V.ld(x)).toMatchObject({
      datasetName: "iPhone Duo in-store pickup restock times, Apple Stores in the UK",
      spatial: "Apple Stores in the UK",
      description: "Confirmed iPhone Duo in-store pickup restocks at Apple Stores in the UK since 2026-11-02 (store, configuration, time), from RestockWire reading each store every 15 seconds; grouped by local hour, day, area, store and configuration.",
    });
    expect(V.hourCaption(x)).toBe("120 iPhone Duo restocks in the UK by store local hour, Nov 2 to today");
    expect(V.regionCaption(x)).toBe("iPhone Duo restocks per area in the UK, confirmed, Nov 2 to today");
    expect(V.regionHead(x)).toEqual(["Area", "Restocks", "Stores that restocked", "Latest restock (local time)"]);
  });
  it("says the region or the city instead", () => {
    const region = view(UK, { kind: "region", name: "Greater London", inName: "in Greater London", storesHref: "/uk/apple-stores/greater-london", parentHref: null });
    expect(V.title(UK, region.place)).toBe("What Time Does Apple Restock the iPhone Duo in Greater London?");
    expect(V.h1(region)).toBe("What time does Apple restock the iPhone Duo in Greater London? 9–11 AM local time, most often");
    expect(V.metaDescription(region)).toContain("Apple Stores in Greater London: 75% of 120");
    expect(V.metaDescription(region)).toContain("Hour, day, city and config tables.");
    expect(V.nav(region).where).toBe("Per city");
    expect(V.regionHead(region)[0]).toBe("City");
    const city = view(UK, { kind: "city", name: "London", inName: "in London", storesHref: "/uk/apple-stores/greater-london/london", parentHref: `/uk/${SLUG}/greater-london` });
    expect(V.h2(city)["where"]).toBe("Where in London does the iPhone Duo restock most often?");
    expect(V.nav(city).where).toBe("Per store");
    expect(V.metaDescription(city)).toContain("Hour, day, store and config tables.");
    expect(V.ld(city).description).toContain("grouped by local hour, day, store and configuration");
    expect(V.place.storesLive(city)).toBe("Apple Stores in London: live listings");
    expect(V.place.sourcesWhere(city)).toBe("every one of the 5 Apple Stores in London");
    expect(V.place.countryPage(UK)).toBe("iPhone Duo restock hours in the UK, every store");
  });
});

/** Every dictionary: the place replaces the country in the title, H1, first H2 and first FAQ question. */
const LANG_COUNTRY: Record<Lang, CountryCode> = {
  en: "uk", ja: "jp", ko: "kr", "zh-TW": "tw", "zh-HK": "hk", de: "de", "de-CH": "ch", fr: "fr", "fr-CA": "ca", it: "it", es: "es", nl: "nl", sv: "se", ar: "ae",
};
/** A place of that country (English data) for each language; Taiwan and Hong Kong have none, so a stand-in name. */
const PLACE: Partial<Record<CountryCode, { region: string; city: string }>> = {
  uk: { region: "Greater London", city: "London" }, jp: { region: "Tokyo", city: "Tokyo" }, kr: { region: "Seoul", city: "Seoul" },
  de: { region: "Bavaria", city: "Munich" }, ch: { region: "Zurich", city: "Zurich" }, fr: { region: "Yvelines", city: "Paris" },
  ca: { region: "Ontario", city: "Toronto" }, it: { region: "Milan", city: "Rome" }, es: { region: "Madrid", city: "Barcelona" },
  nl: { region: "North Holland", city: "Amsterdam" }, se: { region: "Stockholm County", city: "Stockholm" }, ae: { region: "Abu Dhabi", city: "Dubai" },
};

describe("every language names the place, not the country, on a place page", () => {
  for (const lang of LANGS) {
    it(lang, () => {
      const cc = LANG_COUNTRY[lang];
      const c = COUNTRIES[cc];
      const V = dict(lang).views.restockTimes;
      const country = countryLabel(cc, lang);
      const base = view(c);
      // The country page is the country page.
      expect(V.title(c)).toBe(V.title(c, undefined));
      expect(V.h1(base)).toBe(V.h1({ ...base, place: undefined }));
      for (const kind of ["region", "city"] as const) {
        const p = PLACE[cc] ?? { region: "Testregion", city: "Teststadt" };
        const name = kind === "region" ? regionLabel(cc, p.region, lang) : cityLabel(cc, p.city, lang);
        const place: RestockTimesPlace = { kind, name, inName: `in ${name}`, storesHref: `/${cc}/apple-stores/x`, parentHref: null };
        const x = view(c, place);
        const strings = { title: V.title(c, place), h1: V.h1(x), h2: V.h2(x)["time-of-day"], faq: V.faq(x)[0].q };
        for (const [k, s] of Object.entries(strings)) {
          expect(s, `${lang} ${kind} ${k}`).toContain(name);
          if (!name.includes(country)) expect(s, `${lang} ${kind} ${k}`).not.toContain(country);
        }
        expect(V.metaDescription(x), `${lang} ${kind} meta`).toContain(name);
        expect(V.ld(x).datasetName, `${lang} ${kind} ld`).toContain(name);
        expect(V.ld(x).spatial, `${lang} ${kind} spatial`).toContain(name);
        expect(V.place.storesLive(x)).toContain(name);
        expect(V.place.sourcesWhere(x)).toContain(name);
        expect(typeof V.place.byCity).toBe("string");
        expect(V.place.countryPage(c).length).toBeGreaterThan(0);
        // The breakdown unit follows the page: a region page by city, a city page by store.
        expect(V.nav(x).where, `${lang} ${kind}`).not.toBe(V.nav(base).where);
      }
    });
  }
});
