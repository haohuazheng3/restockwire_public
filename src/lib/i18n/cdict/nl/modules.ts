/** Dutch client strings: modules (MiniMap, and the other-trackers footnote of the restock charts). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "Bekijk {label} op de live kaart",
    cta: "Bekijk op de live kaart →",
  },
  reports: {
    legend: "Gemeld door andere trackers ({sources}), {range}",
    note: "{mark}: {what} die {links} voor {range} publiceerde. Dit zijn waarnemingen van die sites; RestockWire heeft ze niet bevestigd en ze zitten in geen van onze cijfers.",
    what: "aanvullingen van de {models}",
    whatAny: "aanvullingen",
    markDashed: "Gestreept",
    markDashedRings: "Gestreepte ringen",
    markHollowDots: "Holle stippen",
  },
};
