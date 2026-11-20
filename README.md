# 픽셀 드라이브 (Pixel Drive) — 1단계 프로젝트 기반

PRD v2.0의 **1단계 (Vite + React + TypeScript 프로젝트 생성 및 Vercel 연결)** 스캐폴드입니다.

## 로컬 실행 방법
```bash
npm install
npm run dev
```

## 빌드 및 테스트 검증
```bash
npm test
npm run build
```

## Vercel 연결 방법
1. 이 폴더의 파일들을 GitHub 새 저장소에 업로드(Push)합니다.
2. [Vercel](https://vercel.com) 대시보드에서 **Add New... > Project**를 선택합니다.
3. 업로드한 GitHub 저장소를 Import 합니다.
4. 아래 설정을 확인한 뒤 **Deploy**를 클릭합니다:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

## 개인화 및 행사 기간 판정
- 로그인 프로필의 만 나이를 기준으로 해당 나이 상한을 넘는 상설 할인 혜택은 목록에서 제외합니다.
- 상설 혜택의 `만 24세 이하`와 `만 25~29세 기준` 필터는 중복 선택할 수 있으며, 로그인 나이로 받을 수 없는 기준은 비활성화됩니다.
- 행사 종료일은 한국 시간(Asia/Seoul)으로 판정합니다. 종료일 당일 운영시간이 `10:00~17:00`처럼 명시된 행사는 17:00 이후 제외되며, 명시된 요일별 운영시간도 반영합니다.
- 앱이 열린 상태에서도 30초 간격으로 행사 유효 기간을 다시 계산합니다.
- 종료 시각을 알 수 없는 행사 데이터는 종료일 23:59까지 유효한 것으로 처리합니다. 원본 데이터가 별도 종료 시각을 제공하지 않는 경우 정확한 종료 시각 판정은 불가능합니다.
