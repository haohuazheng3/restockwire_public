/** English client strings: modules (MiniMap, and the other-trackers footnote that server and client modules share). */
export const modules = {
  /** MiniMap on a store page: {label} is the store's name ("Apple Fifth Avenue"). */
  minimap: {
    aria: "See {label} on the live map",
    cta: "See it on the live map →",
  },
  /**
   * Restocks other trackers published (dashed / hollow marks in the charts). {sources} their names, {range} the dates
   * ("Oct 26 – Nov 1"), {mark} how the chart draws them, {what} "iPhone Duo restocks", {links} the trackers' names
   * linked to their sites.
   */
  reports: {
    legend: "Reported by other trackers ({sources}), {range}",
    note: "{mark}: {what} that {links} published for {range}. These are observations from those sites; RestockWire did not confirm them and none of our figures include them.",
    /** {models} "iPhone Duo" or "iPhone Duo and iPhone 18 Pro". */
    what: "{models} restocks",
    whatAny: "restocks",
    /** How each chart draws them (the footnote starts with it). */
    markDashed: "Dashed",
    markDashedRings: "Dashed rings",
    markHollowDots: "Hollow dots",
  },
};
