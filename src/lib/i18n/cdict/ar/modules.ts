/** العربية: modules (الخريطة المصغّرة، وحاشية المتتبعات الأخرى المشتركة بين وحدات الخادم والعميل). */
import type { CDict } from "../en";

export const modules: CDict["modules"] = {
  minimap: {
    aria: "اعرض {label} على الخريطة المباشرة",
    cta: "اعرضه على الخريطة المباشرة ←",
  },
  reports: {
    legend: "أبلغت عنها متتبعات أخرى ({sources})، {range}",
    note: "{mark}: {what} نشرتها {links} للفترة {range}. هذه ملاحظات من تلك المواقع؛ لم يؤكدها RestockWire، ولا يدخل أيٌّ منها في أرقامنا.",
    what: "عودات توفر {models}",
    whatAny: "عودات التوفر",
    markDashed: "الأعمدة المتقطعة",
    markDashedRings: "الحلقات المتقطعة",
    markHollowDots: "النقاط المفرغة",
  },
};
