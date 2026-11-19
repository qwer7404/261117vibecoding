import { useState } from 'react';
import type { AppScreen } from '../types';
import './app.css';

export function App() {
  const [screen, setScreen] = useState<AppScreen>('setup');

  return (
    <div className="app-shell">
      <header className="top-nav">
        <h1 className="brand-title">
          <span className="brand-dot" aria-hidden="true" />
          픽셀 드라이브
        </h1>
        <span className="step-badge">1단계 · 프로젝트 초기화 완료</span>
      </header>

      <main className="main-container">
        <section className="status-card">
          <h2>
            {screen === 'setup'
              ? '1단계: Vite + React + TypeScript & Vercel 기반 구성 완료'
              : '감상 화면 전환 테스트 완료'}
          </h2>
          <p>
            PRD v2.0 및 디자인 시스템 토큰 기준으로 기본 폴더 구조, 타입 정의, 빌드·배포 설정이
            준비되었습니다.
          </p>
          <ul className="checklist">
            <li>
              <strong>기술 스택:</strong> Vite + React + TypeScript + Vitest (외부 상태·애니메이션
              라이브러리 미사용)
            </li>
            <li>
              <strong>디자인 토큰:</strong> 순백 캔버스(#ffffff), 잉크(#222222), Rausch(#ff385c),
              모션 축소(prefers-reduced-motion) 반영
            </li>
            <li>
              <strong>배포 설정:</strong> Vercel Vite 프리셋 및 SPA 리라이트(vercel.json) 포함
            </li>
          </ul>

          <button
            type="button"
            className="primary-btn"
            onClick={() => setScreen((prev) => (prev === 'setup' ? 'drive' : 'setup'))}
          >
            {screen === 'setup' ? '감상 화면 전환 테스트' : '설정 화면으로 돌아가기'}
          </button>
        </section>
      </main>
    </div>
  );
}
