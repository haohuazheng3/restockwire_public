import type { CDict } from "../en";

/** 한국어 클라이언트 문구: install (/phone-alerts 가이드와 손그림 화면). 목업 라벨은 한국어 iOS·Android·Chrome의 실제 표기를 따라요. */
export const install: CDict["install"] = {
  hero: {
    eyebrow: "홈 화면 앱 · 다운로드 필요 없음",
    title: "재입고 소식을 잠금 화면으로 바로.",
    lead: "확인된 재입고가 몇 초 안에 잠금 화면에 떠요. 필요한 건 두 가지: 홈 화면의 RestockWire, 그리고 알림 허용이에요.",
    seeSteps: "단계 보기",
    sendTest: "테스트 푸시 보내기",
    turnOn: "알림 켜기",
    already: "**✓ 이미 설정됐어요.** 알림은 {label}(으)로 받고 있어요. 이 기기도 추가하려면 아래 단계를 따라 하세요. {link}",
    myAlerts: "내 알림",
  },
  progress: {
    homeScreen: "홈 화면에 추가됨",
    signedIn: "로그인됨",
    on: "알림 허용됨",
    blocked: "설정에서 차단됨: {n}단계에서 해결해요.",
  },
  steps: {
    title: "알림 켜는 방법",
    intro: {
      ios: "iPhone과 iPad는 홈 화면 앱으로만 알림을 보내요.",
      android: "Android에서는 Chrome만으로도 알림이 와요. 설치는 선택이에요.",
      desktop: "브라우저에서 바로 작동해요. 설치할 건 없어요.",
    },
    tabsLabel: "기기 선택",
    tabs: { ios: "iPhone / iPad", android: "Android", desktop: "컴퓨터" },
    ios: {
      safari: { title: "Safari에서 restockwire.com 열기", text: "꼭 Safari여야 해요. Chrome이나 인앱 브라우저로는 안 돼요." },
      share: { title: "공유 탭하기", text: "iPhone은 하단 막대, iPad는 상단 막대에 있어요." },
      choose: { title: "‘홈 화면에 추가’ 선택", text: "안 보이면 시트를 아래로 스크롤하세요." },
      add: { title: "추가 탭하기", text: "이름은 RestockWire 그대로 두세요." },
      open: { title: "홈 화면에서 실행하고 로그인", text: "앱은 로그인이 따로예요. 같은 이메일을 쓰면 알림이 그대로 있어요." },
      allow: { title: "‘알림 켜기’를 누른 뒤 허용", text: "버튼은 내 알림 페이지에 있어요. iPhone은 한 번만 물어봐요." },
    },
    android: {
      chrome: { title: "Chrome에서 restockwire.com 열기", text: "삼성 인터넷과 Edge도 돼요. 인앱 브라우저는 안 돼요." },
      install: { title: "앱 설치", text: "탭 한 번이면 끝, 앱 스토어는 필요 없어요." },
      menu: { title: "메뉴 ⋮ → ‘홈 화면에 추가’", text: "휴대폰에 따라 **앱 설치**로 표시돼요." },
      open: { title: "RestockWire 실행하고 로그인", text: "홈 화면이나 앱 서랍에 있어요. 같은 이메일이면 알림이 그대로예요." },
      allow: { title: "‘알림 켜기’를 누른 뒤 허용", text: "Android는 한 번만 물어봐요. Chrome 탭에서도 돼요." },
    },
    desktop: {
      allow: { title: "‘알림 켜기’ 누르기", text: "Chrome, Edge, Firefox, Safari 16 이상에서 작동하고, 브라우저는 한 번만 물어봐요." },
      install: { title: "선택: 앱으로 실행", text: "Chrome이나 Edge 주소창의 설치 아이콘을 쓰세요. 그러면 브라우저를 닫아도 알림이 와요." },
      phone: { title: "휴대폰도 추가하기", text: "휴대폰에서도 같은 이메일로 로그인하세요. 알림을 켠 기기마다 모든 알림을 받아요." },
    },
  },
  action: {
    install: "RestockWire 설치",
    on: "✓ 이 기기는 알림을 받아요.",
    sendTest: "테스트 푸시 보내기",
    needsInstall: "홈 화면 앱 안에서 열려요.",
    signInFirst: "로그인하고 시작",
    signInThenOn: "로그인하고 켜기",
    turnOn: "알림 켜기",
    denied: "차단됨: 설정에서 RestockWire를 허용한 뒤 새로고침하세요.",
  },
  notes: [
    { q: "배터리가 닳나요?", a: "아니요. 확인은 휴대폰이 아니라 RestockWire 서버에서 해요." },
    { q: "iPhone은 왜 Safari여야 하나요?", a: "사이트를 홈 화면에 추가하는 건 Safari 기능이에요. 인앱 브라우저에는 없어요." },
    { q: "기기가 여러 대라면요?", a: "기기마다 같은 이메일을 쓰면 모든 기기가 모든 알림을 받아요." },
    { q: "이메일은요?", a: "알림을 켠 기기가 하나도 없으면 알림은 대신 이메일로 가요." },
  ],
  cta: { title: "아직 알림 받을 게 없나요?", button: "알림 설정" },

  mocks: {
    share: "공유",
    shareSheet: { copy: "복사", readingList: "읽기 목록에 추가", bookmark: "책갈피 추가", favorites: "즐겨찾기에 추가", addToHome: "홈 화면에 추가", markup: "마크업" },
    addDialog: { cancel: "취소", title: "홈 화면에 추가", add: "추가", note: "이 웹 사이트에 빠르게 접근할 수 있도록 홈 화면에 아이콘이 추가됩니다." },
    iosAlert: { title: "‘RestockWire’에서 알림을 보내고자 합니다", text: "경고, 사운드 및 아이콘 배지가 알림에 포함될 수 있습니다. 설정에서 이를 구성할 수 있습니다.", dontAllow: "허용 안 함", allow: "허용" },
    chromeMenuLabel: "메뉴",
    chromeMenu: { before: ["새 탭", "방문 기록", "다운로드", "북마크", "공유…"], add: "홈 화면에 추가", after: ["데스크톱 사이트"] },
    androidAlert: { title: "RestockWire에서 알림을 보내도록 허용하시겠습니까?", dontAllow: "허용 안함", allow: "허용" },
    desktopAlert: { wantsTo: "restockwire.com에서 다음 권한을 요청합니다.", show: "알림 표시", block: "차단", allow: "허용" },
    desktopInstall: { callout: "설치", title: "RestockWire 앱 설치", text: "별도 창에서 열려요", cancel: "취소", install: "설치" },
    lockScreen: { date: "10월 29일 목요일", now: "지금", title: "iPhone 18 Pro 256GB 블랙", body: "Apple 가로수길 · 서울 — 오늘 픽업 가능. apple.com을 열어 예약하세요." },
  },
};
