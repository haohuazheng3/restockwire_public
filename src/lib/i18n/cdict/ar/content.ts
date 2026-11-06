/** العربية: content — فاحص المخزون في الشاشة الأولى (QuickCheck) وهياكل التحميل. */
import type { CDict } from "../en";

export const content: CDict["content"] = {
  quickCheck: {
    model: "طراز iPhone",
    search: "رمز بريدي أو مدينة أو متجر Apple",
    useLocation: "حدّد موقعي",
    nearMe: "📍 بالقرب مني",
    locationOff: "لا يملك هذا الموقع إذنًا بالوصول إلى موقعك. اكتب رمزًا بريديًا بدلًا من ذلك.",
    storesNow: "{what} معروض للاستلام في **{n} من {total}** من متاجر Apple في الولايات المتحدة الآن",
    nearestTo: " · الأقرب إلى {place}",
    you: "موقعك",
    noMatch: "لم نجد شيئًا. اكتب رمزًا بريديًا من 5 أرقام أو مدينة.",
    inStock: "{n}/{total} معروضة",
    soldOut: "نفد",
    alertMe: "نبّهني حين يُعرض",
    allStores: "تصفّح كل المتاجر الـ{n} ←",
    here: "هنا",
  },
  skeleton: {
    loading: "جارٍ التحميل",
  },
};
