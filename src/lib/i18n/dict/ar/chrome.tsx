/** العربية: chrome — التذييل، صفحة 404. (عناوين الترويسة نصوص عميل: cdict chrome.nav.) */
import type { ReactNode } from "react";
import type { Dict } from "../en";

export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "مخزون الاستلام من المتجر لحظة بلحظة وتنبيهات عودة التوفر في كل متاجر Apple الـ269 في الولايات المتحدة. البلد كله على خط الـ15 ثانية، والمتاجر التي تسمّيها تنبيهاتك على خط الـ5 ثوانٍ.",
    blurbIn: (allStores: string) => `مخزون الاستلام من المتجر لحظة بلحظة وتنبيهات عودة التوفر في ${allStores}. كل متجر على خط الـ15 ثانية، والمتاجر التي تسمّيها تنبيهاتك على خط الـ5 ثوانٍ.`,
    trademark: "RestockWire خدمة مستقلة لا تربطها أي صلة بشركة Apple Inc. ولا تحظى بتأييدها. Apple وiPhone وApple Store علامات تجارية لشركة Apple Inc.",
    product: "الخدمة",
    duoStock: "مخزون iPhone Duo",
    proStock: "مخزون iPhone 18 Pro",
    proMaxStock: "مخزون iPhone 18 Pro Max",
    restockLog: "سجل عودة التوفر",
    liveMap: "الخريطة المباشرة",
    storesByState: "المتاجر حسب الولاية",
    pricing: "الأسعار",
    company: "عن الشركة",
    howItWorks: "كيف تعمل الخدمة",
    getApp: "احصل على التطبيق",
    about: "من نحن",
    contact: "تواصل معنا",
    allStates: "كل الولايات والمدن ←",
    storesIn: "متاجر Apple",
    allStores: "كل المتاجر ←",
    legal: "الشؤون القانونية",
    privacy: "الخصوصية",
    terms: "الشروط",
    refunds: "الاسترداد",
    englishOnly: "بالإنجليزية فقط",
    questions: "أسئلة عن iPhone Duo",
    restockTimes: "في أي ساعة تعيد Apple توفير iPhone Duo؟",
    countries: "الدول",
    status: "حالة الخدمة",
  },
  notFound: {
    title: "لا توجد صفحة على هذا العنوان",
    body: (stores: ReactNode, map: ReactNode) => <>لم يُنشر شيء هنا. ستعيدك {stores} أو {map} إلى الطريق.</>,
    stores: "قائمة المتاجر حسب الولاية",
    map: "خريطة المخزون المباشرة",
    home: "اذهب إلى الصفحة الرئيسية",
  },
};
