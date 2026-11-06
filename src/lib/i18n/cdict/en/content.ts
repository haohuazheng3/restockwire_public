/**
 * English client strings: content — the first-screen stock checker (components/content/QuickCheck.tsx) and the
 * navigation skeletons (components/ui/RouteSkeletons.tsx). Plain data: "{n}" placeholders (fill), **bold** (Md).
 */
export const content = {
  quickCheck: {
    /** aria-label of the model switch. */
    model: "iPhone model",
    /** Search box label and placeholder. */
    search: "ZIP code, city or Apple Store",
    useLocation: "Locate me",
    nearMe: "📍 Near me",
    locationOff: "This site has no location access. Enter a ZIP code instead.",
    /** {n} of {total}: stores with it now; {what}: the model or configuration ("iPhone 18 Pro Max Burgundy"). */
    storesNow: "The {what} is listed for pickup at **{n} of {total}** US Apple Stores right now",
    /** {place}: the typed ZIP / city / store, or "you". */
    nearestTo: " · closest to {place}",
    you: "you",
    noMatch: "Nothing found. Enter a 5-digit ZIP code or a city.",
    /** {n} configurations of {total} at one store. */
    inStock: "{n}/{total} listed",
    soldOut: "Sold out",
    alertMe: "Get an alert when it is listed",
    allStores: "Browse all {n} stores →",
    /** Drive time under a few hundred metres. */
    here: "here",
  },
  skeleton: {
    /** aria-label while the next page loads. */
    loading: "Loading",
  },
};
