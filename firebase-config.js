// Firebase 프로젝트 설정 파일
//
// 1) https://console.firebase.google.com 에서 무료 프로젝트를 만드세요.
// 2) 프로젝트 설정 > "내 앱" > 웹 앱 추가(</>) 후 나오는 firebaseConfig 값을 아래에 붙여넣으세요.
// 3) 왼쪽 메뉴 "Firestore Database"를 만들고(테스트 모드로 시작), 규칙 탭에서
//    이 저장소의 firestore.rules 파일 내용을 붙여넣고 게시하세요.
// 4) apiKey가 "YOUR_"로 시작하는 동안에는 diary.html이 자동으로
//    "데모 모드"(이 브라우저 탭에서만 임시 저장)로 동작합니다.
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyBahMedQPDm6UlTP-k8Rr_tQxABqaFwZIY",
  authDomain: "ibpyp-diary.firebaseapp.com",
  projectId: "ibpyp-diary",
  storageBucket: "ibpyp-diary.firebasestorage.app",
  messagingSenderId: "390627374346",
  appId: "1:390627374346:web:852d5606e607f2cbe3f6f3",
};

// (선택) Claude AI 첨삭용 Cloud Function 주소.
// cloud-function/ 폴더의 함수를 배포한 뒤 나오는 트리거 URL을 여기에 붙여넣으세요.
// 비워두거나 "YOUR_"로 시작하는 동안에는 무료 LanguageTool 첨삭으로 자동 동작합니다.
window.AI_CHECK_ENDPOINT = "YOUR_CLOUD_FUNCTION_URL";
