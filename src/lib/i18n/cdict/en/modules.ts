/** English client strings: modules (MiniMap, and the other-trackers footnote that server and client modules share). */
export const modules = {
  /** MiniMap on a store page: {label} is the store's name ("Apple Fifth Avenue"). */
  minimap: {
    aria: "See {label} on the live map",
    cta: "See it on the live map →",
  },
  /**
   * Third-party restock reports, drawn as dashed or hollow marks. Placeholders: {sources} = tracker names; {range} =
   * the date span, e.g. Oct 26 – Nov 1; {mark} = the drawing style named first in the footnote; {what} = the models'
   * restocks; {links} = the same tracker names as links.
   */
  reports: {
    legend: "Reports from other trackers ({sources}), {range}",
    note: "{mark}: {what} that {links} published for {range}. These are observations from those sites; RestockWire did not confirm them and none of our figures include them.",
    /** {models}: one model name, or two joined with and. */
    what: "{models} restocks",
    whatAny: "restocks",
    /** How each chart draws them (the footnote starts with it). */
    markDashed: "Dashed",
    markDashedRings: "Dashed rings",
    markHollowDots: "Hollow dots",
  },
};
