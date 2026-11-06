import type { ReactNode } from "react";
import type { Dict } from "../en";

/** 한국어 문구: chrome — 푸터, 404 페이지, 언어 버전 안내. */
export const chrome: Dict["chrome"] = {
  footer: {
    blurb: "미국 Apple Store 269곳 전체의 매장 픽업 실시간 재고와 재입고 알림. 미국 전역은 15초 간격으로, 알림에 넣은 매장은 5초 간격으로 확인해요.",
    blurbIn: (allStores: string) => `${allStores}의 매장 픽업 실시간 재고와 재입고 알림. 모든 매장은 15초 간격으로, 알림에 넣은 매장은 5초 간격으로 확인해요.`,
    trademark: "RestockWire는 Apple Inc.와 제휴하거나 보증을 받지 않은 독립 서비스입니다. Apple, iPhone, Apple Store는 Apple Inc.의 상표입니다.",
    product: "서비스",
    duoStock: "iPhone Duo 재고",
    proStock: "iPhone 18 Pro 재고",
    proMaxStock: "iPhone 18 Pro Max 재고",
    restockLog: "재입고 기록",
    liveMap: "실시간 지도",
    storesByState: "주별 매장",
    pricing: "요금제",
    company: "회사",
    howItWorks: "작동 방식",
    getApp: "앱 받기",
    about: "소개",
    contact: "문의",
    allStates: "모든 주와 도시 →",
    storesIn: "Apple Store",
    allStores: "모든 매장 →",
    legal: "법적 고지",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    refunds: "환불",
    englishOnly: "영문만 제공",
    questions: "iPhone Duo 질문",
    restockTimes: "Apple은 iPhone Duo를 몇 시에 재입고하나요?",
    countries: "국가",
    status: "상태",
  },
  notFound: {
    title: "이 주소에는 페이지가 없어요",
    body: (stores: ReactNode, map: ReactNode) => <>여기에는 게시된 내용이 없어요. {stores}이나 {map}에서 다시 시작해 보세요.</>,
    stores: "주별 매장 목록",
    map: "실시간 재고 지도",
    home: "홈으로 가기",
  },
};
