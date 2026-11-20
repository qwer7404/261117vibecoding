import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { SOOKMYUNG_BENEFITS } from '../data/benefits';
import { loadBookmarks, loadStudentUser, saveBookmarks, saveStudentUser } from '../lib/storage';
import {
  filterSeoulEvents,
  getAgeFiltersForUser,
  isBenefitEligibleForAge,
  type AgeFilter
} from '../lib/cultureRules';
import { DriveScene } from '../scene/DriveScene';
import { EVENTS, EventsPanel, VIEW_MIN, evKey } from '../components/EventsPanel';
import { BookmarkButton } from '../components/BookmarkButton';
import { FilterPanel, type Filters } from '../components/FilterPanel';
import type {
  CultureBenefit,
  SeoulEvent,
  StudentUser
} from '../types';
import './app.css';

export function App() {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Top-right Login State
  const [user, setUser] = useState<StudentUser | null>(() => loadStudentUser());
  const [loginOpen, setLoginOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname ?? '');
  const [emailInput, setEmailInput] = useState(user?.email ?? '');
  const [ageInput, setAgeInput] = useState(user ? String(user.age) : '22');

  // 통합 필터 · 검색 전에는 가로 바, 검색 후에는 좌측 패널 + 결과
  const [f, setF] = useState<Filters>(() => ({
    kind: 'all',
    gap: 999,
    bookmarkOnly: false,
    age: getAgeFiltersForUser(user?.age ?? null),
    category: '전체',
    minDiscount: 0,
    sortBy: 'distance',
    group: '전체',
    onlyYouth: false,
    onlyNow: true,
    soon: false,
    deadlineSort: false,
    query: ''
  }));
  const set = (patch: Partial<Filters>) => setF((prev) => ({ ...prev, ...patch }));
  const [searched, setSearched] = useState(false);

  // 북마크 (localStorage)
  const [marks, setMarks] = useState<string[]>(() => loadBookmarks());
  const toggleMark = (key: string) =>
    setMarks((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      saveBookmarks(next);
      return next;
    });

  // Drive Stage State
  const [isDriving, setIsDriving] = useState(true);
  const [selectedBenefitId, setSelectedBenefitId] = useState<string>(SOOKMYUNG_BENEFITS[0].id);
  const [selectedEvent, setSelectedEvent] = useState<SeoulEvent | null>(null);

  const showSpots = f.kind !== 'timed';
  const showEvents = f.kind !== 'permanent';

  const filteredBenefits = useMemo(() => {
    return SOOKMYUNG_BENEFITS.filter((item) => {
      if (f.bookmarkOnly && !marks.includes(`spot:${item.id}`)) return false;
      if (!isBenefitEligibleForAge(item, user?.age ?? null)) return false;
      const benefitAgeGroup: AgeFilter = item.maxAge === 24 ? 'u24' : 'u25_29';
      if (!f.age.includes(benefitAgeGroup)) return false;
      if (f.category !== '전체' && item.category !== f.category) return false;
      if (f.gap !== 999 && item.roundTripMinutes + VIEW_MIN > f.gap) return false;
      if (item.discountPercent < f.minDiscount) return false;
      return true;
    }).sort((x, y) => {
      if (f.sortBy === 'discount') {
        return y.discountPercent - x.discountPercent || x.roundTripMinutes - y.roundTripMinutes;
      }
      return x.roundTripMinutes - y.roundTripMinutes;
    });
  }, [f, marks, user]);

  const filteredEvents = useMemo(() => {
    const eligibleEvents = filterSeoulEvents(EVENTS, f, user?.age ?? null, currentTime);
    return f.bookmarkOnly
      ? eligibleEvents.filter((event) => marks.includes(evKey(event)))
      : eligibleEvents;
  }, [f, marks, user, currentTime]);

  useEffect(() => {
    if (selectedEvent && !filteredEvents.some((event) => event.id === selectedEvent.id)) {
      setSelectedEvent(null);
    }
  }, [filteredEvents, selectedEvent]);

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
    const parsedAge = Math.max(18, Math.min(39, Math.floor(Number(ageInput) || 22)));
    const nextUser: StudentUser = {
      nickname: cleanName,
      email: emailInput.trim(),
      age: parsedAge
    };
    setUser(nextUser);
    saveStudentUser(nextUser);
    set({ age: getAgeFiltersForUser(parsedAge) });
    setSelectedEvent(null);
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    saveStudentUser(null);
    set({ age: getAgeFiltersForUser(null) });
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
                  step={1}
                  className="underline-input"
                  value={ageInput}
                  required
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
        {!searched ? (
          <FilterPanel
            layout="bar"
            f={f}
            set={set}
            bookmarkCount={marks.length}
            userAge={user?.age ?? null}
            onSearch={() => setSearched(true)}
          />
        ) : (
          <div className="editorial-grid">
            <FilterPanel
              layout="side"
              f={f}
              set={set}
              bookmarkCount={marks.length}
              userAge={user?.age ?? null}
              onCollapse={() => setSearched(false)}
            />

            <div className="results-col">
              {f.bookmarkOnly && (
                <p className="caption-uppercase">★ 북마크 중 나이·기간·선택 조건에 맞는 항목만 표시 중</p>
              )}

              {showSpots && (
                <section className="surface-card" aria-labelledby="benefits-heading">
                  <div className="section-head">
                    <h3 id="benefits-heading" className="display-sm">
                      CULTURE SPOTS ({filteredBenefits.length})
                    </h3>
                    <span className="caption-uppercase">상설 · 상시 청년 할인 장소</span>
                    <div className="pill-row">
                      <button type="button" className="btn-pill" aria-pressed={f.sortBy === 'distance'} onClick={() => set({ sortBy: 'distance' })}>
                        가까운순
                      </button>
                      <button type="button" className="btn-pill" aria-pressed={f.sortBy === 'discount'} onClick={() => set({ sortBy: 'discount' })}>
                        할인율순
                      </button>
                    </div>
                  </div>

                  {filteredBenefits.length === 0 ? (
                    <div className="empty-state">
                      <p className="body-prose">
                        {f.bookmarkOnly
                          ? '내 나이와 조건에 맞는 북마크 상설 장소가 없어요.'
                          : user && user.age > 29
                            ? `만 ${user.age}세에게 적용되는 만 24세 이하·만 29세 이하 상설 혜택이 등록되어 있지 않아요.`
                            : '선택한 조건에 맞는 장소가 없어요. 나이 기준이나 할인율 필터를 조정해 보세요.'}
                      </p>
                    </div>
                  ) : (
                    <div className="benefit-list">
                      {filteredBenefits.map((item) => {
                        const isSelected = !selectedEvent && activeDestination?.id === item.id;
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
                              <BookmarkButton active={marks.includes(`spot:${item.id}`)} onToggle={() => toggleMark(`spot:${item.id}`)} />
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
              )}

              {showEvents && (
                <EventsPanel
                  list={filteredEvents}
                  gap={f.gap}
                  selectedId={selectedEvent?.id ?? null}
                  marks={marks}
                  userAge={user?.age ?? null}
                  onToggleMark={toggleMark}
                  onSelect={setSelectedEvent}
                />
              )}
            </div>
          </div>
        )}
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
