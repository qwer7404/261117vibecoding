import { useMemo, useState, type FormEvent } from 'react';
import { SOOKMYUNG_BENEFITS } from '../data/benefits';
import { loadStudentUser, saveStudentUser } from '../lib/storage';
import { DriveScene } from '../scene/DriveScene';
import { EventsPanel } from '../components/EventsPanel';
import type {
  AgeFilter,
  BenefitCategory,
  CultureBenefit,
  SeoulEvent,
  StudentUser
} from '../types';
import './app.css';

const AGE_OPTIONS: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: '전체 연령' },
  { value: 'u24', label: '만 24세 이하' },
  { value: 'u29', label: '만 25~29세' }
];

const CATEGORY_OPTIONS: ('전체' | BenefitCategory)[] = [
  '전체',
  '박물관',
  '미술관',
  '문화예술',
  '기타'
];

const TIME_OPTIONS: { value: number; label: string }[] = [
  { value: 999, label: '전체 시간' },
  { value: 30, label: '왕복 30분 이내' },
  { value: 45, label: '왕복 45분 이내' },
  { value: 60, label: '왕복 60분 이내' }
];

const DISCOUNT_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: '전체 할인' },
  { value: 100, label: '무료 (100%)' },
  { value: 50, label: '50% 이상' },
  { value: 30, label: '30% 이상' }
];

export function App() {
  // Top-right Login State
  const [user, setUser] = useState<StudentUser | null>(() => loadStudentUser());
  const [loginOpen, setLoginOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname ?? '');
  const [emailInput, setEmailInput] = useState(user?.email ?? '');
  const [ageInput, setAgeInput] = useState(user ? String(user.age) : '22');

  // Culture Benefit Filters
  const [ageFilter, setAgeFilter] = useState<AgeFilter>(() => {
    if (!user) return 'all';
    return user.age <= 24 ? 'u24' : user.age <= 29 ? 'u29' : 'all';
  });
  const [categoryFilter, setCategoryFilter] = useState<'전체' | BenefitCategory>('전체');
  const [maxRoundTrip, setMaxRoundTrip] = useState<number>(999);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'distance' | 'discount'>('distance');

  // Drive Stage State
  const [isDriving, setIsDriving] = useState(true);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string>(SOOKMYUNG_BENEFITS[0].id);
  const [selectedEvent, setSelectedEvent] = useState<SeoulEvent | null>(null);

  const filteredBenefits = useMemo(() => {
    return SOOKMYUNG_BENEFITS.filter((item) => {
      if (ageFilter === 'u24' && item.maxAge < 24) return false;
      if (ageFilter === 'u29' && item.maxAge < 29) return false;
      if (categoryFilter !== '전체' && item.category !== categoryFilter) return false;
      if (item.roundTripMinutes > maxRoundTrip) return false;
      if (item.discountPercent < minDiscount) return false;
      return true;
    }).sort((a, b) => {
      if (sortBy === 'discount') {
        return b.discountPercent - a.discountPercent || a.roundTripMinutes - b.roundTripMinutes;
      }
      return a.roundTripMinutes - b.roundTripMinutes;
    });
  }, [ageFilter, categoryFilter, maxRoundTrip, minDiscount, sortBy]);

  const activeDestination: CultureBenefit | null = useMemo(() => {
    return (
      filteredBenefits.find((b) => b.id === selectedBenefitId) ??
      filteredBenefits[0] ??
      null
    );
  }, [filteredBenefits, selectedBenefitId]);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = nicknameInput.trim() || '숙명 학우';
    const parsedAge = Math.max(18, Math.min(39, Number(ageInput) || 22));
    const nextUser: StudentUser = {
      nickname: cleanName,
      email: emailInput.trim(),
      age: parsedAge
    };
    setUser(nextUser);
    saveStudentUser(nextUser);
    setAgeFilter(parsedAge <= 24 ? 'u24' : parsedAge <= 29 ? 'u29' : 'all');
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    saveStudentUser(null);
    setLoginOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Top Navigation with Right Login Tab */}
      <header className="top-nav">
        <span className="nav-left">SOOKMYUNG · YONGSAN</span>
        <h1 className="wordmark-display">CULTURE DRIVE</h1>
        <div className="nav-right">
          <button
            type="button"
            className="login-tab-btn"
            data-logged-in={user ? 'true' : 'false'}
            onClick={() => setLoginOpen((prev) => !prev)}
          >
            {user ? `${user.nickname} · 만 ${user.age}세` : '로그인'}
          </button>
        </div>
      </header>

      {/* Collapsible Login Panel */}
      {loginOpen && (
        <div className="login-drawer">
          <section className="login-panel" aria-label="숙명여대 학우 로그인">
            <div className="section-head">
              <h2 className="title-md">SOOKMYUNG STUDENT LOGIN</h2>
              <span className="caption-uppercase">내 나이 자동 필터 연동</span>
            </div>
            <form className="login-form-grid" onSubmit={handleLoginSubmit}>
              <label className="control-block">
                <span className="caption-uppercase">닉네임 / 이름</span>
                <input
                  type="text"
                  className="underline-input"
                  placeholder="예: 눈송이"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                />
              </label>
              <label className="control-block">
                <span className="caption-uppercase">숙명 이메일 (선택)</span>
                <input
                  type="email"
                  className="underline-input"
                  placeholder="snow@sookmyung.ac.kr"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </label>
              <label className="control-block">
                <span className="caption-uppercase">내 만 나이</span>
                <input
                  type="number"
                  min={18}
                  max={39}
                  className="underline-input"
                  value={ageInput}
                  onChange={(e) => setAgeInput(e.target.value)}
                />
              </label>
              <div className="login-actions">
                <button type="submit" className="btn-primary-outline">
                  로그인 저장
                </button>
                {user && (
                  <button type="button" className="btn-pill" onClick={handleLogout}>
                    로그아웃
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Side-View Pixel Drive Stage */}
      <DriveScene
        isDriving={isDriving}
        onToggleDrive={() => setIsDriving((d) => !d)}
        destination={
          selectedEvent
            ? { title: selectedEvent.title, roundTripMinutes: selectedEvent.rt }
            : activeDestination
        }
      />

      {/* Editorial Hero Title */}
      <section className="hero-band">
        <p className="caption-uppercase">
          UNDER 24 · UNDER 29 YOUTH ARTS &amp; MUSEUM PASS
        </p>
        <h2 className="hero-h1">SOOKMYUNG GAP-TIME DRIVE</h2>
        <p className="hero-prose">
          숙명여대 출발 거리와 왕복 소요시간, 만 24세·만 29세 이하 청년 할인율을 한눈에 비교하고
          공강과 하교 시간에 가볍게 다녀올 문화예술 공간을 바로 예약하세요.
        </p>
      </section>

      {/* Main 2-Column Editorial Layout */}
      <main className="main-container">
        <div className="editorial-grid">
          {/* Left Column: 1 Profile Photo + Benefit Filters */}
          <aside className="surface-card" aria-label="혜택 필터">
            <div className="section-head">
              <h3 className="display-sm">FILTER</h3>
              <span className="caption-uppercase">내 조건</span>
            </div>

            {/* Age Filter */}
            <div className="control-block">
              <span className="caption-uppercase">내 나이 혜택 기준</span>
              <div className="pill-row">
                {AGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="btn-pill"
                    aria-pressed={ageFilter === opt.value}
                    onClick={() => setAgeFilter(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="control-block">
              <span className="caption-uppercase">분야 선택</span>
              <div className="pill-row">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="btn-pill"
                    aria-pressed={categoryFilter === cat}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Round-Trip Time Filter */}
            <div className="control-block">
              <span className="caption-uppercase">숙대 기준 왕복시간</span>
              <div className="pill-row">
                {TIME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="btn-pill"
                    aria-pressed={maxRoundTrip === opt.value}
                    onClick={() => setMaxRoundTrip(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Discount Filter */}
            <div className="control-block">
              <span className="caption-uppercase">할인율</span>
              <div className="pill-row">
                {DISCOUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="btn-pill"
                    aria-pressed={minDiscount === opt.value}
                    onClick={() => setMinDiscount(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Column: Filtered Culture Benefits */}
          <section className="surface-card" aria-labelledby="benefits-heading">
            <div className="section-head">
              <h3 id="benefits-heading" className="display-sm">
                CULTURE SPOTS ({filteredBenefits.length})
              </h3>
              <div className="pill-row">
                <button
                  type="button"
                  className="btn-pill"
                  aria-pressed={sortBy === 'distance'}
                  onClick={() => setSortBy('distance')}
                >
                  가까운순
                </button>
                <button
                  type="button"
                  className="btn-pill"
                  aria-pressed={sortBy === 'discount'}
                  onClick={() => setSortBy('discount')}
                >
                  할인율순
                </button>
              </div>
            </div>

            {filteredBenefits.length === 0 ? (
              <div className="empty-state">
                <p className="body-prose">
                  선택한 조건에 맞는 혜택이 없습니다. 왕복시간이나 할인율 필터를 완화해 보세요.
                </p>
              </div>
            ) : (
              <div className="benefit-list">
                {filteredBenefits.map((item) => {
                  const isSelected = activeDestination?.id === item.id;
                  return (
                    <article
                      key={item.id}
                      className="benefit-card"
                      data-selected={isSelected ? 'true' : 'false'}
                      onClick={() => {
                        setSelectedBenefitId(item.id);
                        setSelectedEvent(null);
                      }}
                    >
                      <div className="benefit-top">
                        <span className="caption-uppercase">
                          {item.category} · {item.ageLabel}
                        </span>
                        <span className="discount-tag">{item.discountBadge}</span>
                      </div>

                      <h4 className="title-md">{item.title}</h4>
                      <p className="body-prose">{item.description}</p>

                      <div className="benefit-specs">
                        <span>거리 {item.distanceKm}km</span>
                        <span>왕복 약 {item.roundTripMinutes}분</span>
                        <span>{item.gapTip}</span>
                      </div>

                      <div className="benefit-footer">
                        <span className="caption-uppercase">{item.routeSummary}</span>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary-outline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          혜택 링크 이동 ↗
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <EventsPanel selectedId={selectedEvent?.id ?? null} onSelect={setSelectedEvent} />
      </main>

      <footer className="footer-band">
        <p className="footer-fine">
          Sookmyung Women&apos;s University Youth Culture Navigator · Sample Benefit Data
        </p>
        <span className="wordmark-display">CULTURE DRIVE</span>
      </footer>
    </div>
  );
}
