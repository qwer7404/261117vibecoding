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
