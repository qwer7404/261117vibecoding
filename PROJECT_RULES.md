# PROJECT_RULES — 픽셀 드라이브 (가칭) MVP

## 1. 기술 스택 및 아키텍처 제약 (절대 준수)
- **구성:** Vite + React + TypeScript 정적 웹 앱 (서버, 로그인, DB 없음)
- **스타일:** 일반 CSS (`tokens.css` 디자인 변수 사용), 외부 UI/애니메이션 라이브러리 금지
- **상태 관리:** React 내장 훅(`useState`, `useReducer`, Context)만 사용 (Redux/Zustand 금지)
- **로컬 저장:** 원본 PNG Blob은 `IndexedDB`, YouTube 재생목록·설정은 `localStorage`에 저장 (`localStorage`에 Base64 이미지 저장 금지)

## 2. 디자인 시스템 규칙
- **컬러:** 배경 `#ffffff`, 기본 잉크 `#222222`, 보조 표면 `#f7f7f7` / `#f2f2f2`, 경계선 `#dddddd`, 주요 CTA 포인트 컬러만 Rausch `#ff385c`
- **형태:** 카드 라운드 `14px`, 버튼/입력창 `8px`, 캡슐/원형 버튼 `9999px`
- **반응형:** 모바일 세로 화면(`< 744px`) 우선, 버튼 터치 영역 최소 `48x48px` 확보
- **접근성:** `prefers-reduced-motion: reduce` 대응 필수

## 3. 도메인 및 정책 준수 규칙
- **도트 변환:** HTML Canvas API 사용, `imageSmoothingEnabled = false` 및 CSS `image-rendering: pixelated` 적용. 자동 배경 제거 미지원 안내 표시.
- **자동차 장면:** 완전한 측면(side view) 고정, 캐릭터 최대 2명(운전석/조수석 중복 불가). CSS keyframes/transform 애니메이션만 사용.
- **YouTube IFrame API:** YouTube Data API 키 미사용. 플레이어 숨김/투명 처리/오버레이 가림 금지(최소 `200x200px`, 권장 `480x270px` 이상). 재생 상태 이벤트와 CSS 주행 애니메이션 동기화.
