import { useState, type FormEvent } from 'react';
import type {
  AppScreen,
  CharacterSlot,
  DotSize,
  PlaybackMode,
  PlayerStatus,
  SeatPosition,
  Track
} from '../types';
import './app.css';

const DOT_OPTIONS: { value: DotSize; label: string }[] = [
  { value: 'small', label: '작게' },
  { value: 'medium', label: '보통' },
  { value: 'large', label: '크게' }
];

const MODE_OPTIONS: { value: PlaybackMode; label: string }[] = [
  { value: 'sequence', label: '순차' },
  { value: 'repeat-one', label: '1곡 반복' },
  { value: 'repeat-all', label: '전체 반복' }
];

const INITIAL_SLOTS: CharacterSlot[] = [
  { id: 'slot-1', fileName: 'CHAR_01.PNG (미등록)', dotSize: 'medium', seat: 'driver', hasTransparency: true },
  { id: 'slot-2', fileName: 'CHAR_02.PNG (미등록)', dotSize: 'medium', seat: 'passenger', hasTransparency: true }
];

const INITIAL_TRACKS: Track[] = [
  { videoId: 'jfKfPfyJRdk', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' }
];

export function App() {
  const [screen, setScreen] = useState<AppScreen>('setup');
  const [slots, setSlots] = useState<CharacterSlot[]>(INITIAL_SLOTS);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [urlInput, setUrlInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<PlaybackMode>('repeat-all');
  const [status, setStatus] = useState<PlayerStatus>('paused');

  const updateSlotDotSize = (id: string, dotSize: DotSize) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, dotSize } : s)));
  };

  const assignSeat = (id: string, seat: SeatPosition) => {
    setSlots((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, seat } : { ...s, seat: seat === 'driver' ? 'passenger' : 'driver' }
      )
    );
  };

  const handleAddTrack = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed || tracks.length >= 10) return;
    // shortcut: 2단계 레이아웃 검증용 임시 ID 부여, 6단계에서 실제 YouTube URL 파서로 교체
    setTracks((prev) => [...prev, { videoId: `track-${prev.length + 1}`, url: trimmed }]);
    setUrlInput('');
  };

  const moveTrack = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= tracks.length) return;
    setTracks((prev) => {
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
    setCurrentIndex((prev) => Math.max(0, Math.min(prev, tracks.length - 2)));
  };

  const startDrive = () => {
    if (tracks.length === 0) return;
    setCurrentIndex(0);
    setStatus('playing');
    setScreen('drive');
  };

  const activeTrack = tracks[currentIndex];

  return (
    <div className="page-frame">
      <header className="top-banner">
        <h1 className="banner-title">PIXEL DRIVE. BUILD YOUR OWN RIDE.</h1>
        <div className="banner-right">
          <span className="buy-sticker">
            DRIVE <span className="sticker-purple">a</span> PIXEL
          </span>
          <span className="phone-callout">1-800-PXL-DRIV</span>
        </div>
      </header>

      <main className="main-container">
        {screen === 'setup' ? (
          <div className="setup-layout">
            <aside className="left-rail">
              <div className="eyebrow-olive">PIXEL DRIVE SYSTEMS</div>

              <section className="cta-block-red" aria-label="주행 시작 안내">
                <p>
                  At PixelDrive.local, configure your 8-bit passengers, queue up to 10 YouTube BGM
                  tracks, and hit the road in pure side-scrolling style.
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={tracks.length === 0}
                  onClick={startDrive}
                >
                  드라이브 시작 ({tracks.length}곡)
                </button>
              </section>
            </aside>

            <div className="right-stack">
              <section className="ribbon-card" aria-labelledby="char-heading">
                <div className="ribbon-title-bar">
                  <span id="char-heading">CHARACTER SLOTS — PNG MAX 2 (5MB)</span>
                  <span className="new-burst">NEW!</span>
                </div>
                <div className="ribbon-body-sage">
                  <p style={{ margin: 0 }}>
                    투명 배경 PNG를 권장합니다. 자동 배경 제거 기능은 지원하지 않습니다. (3단계에서 업로드 및 Canvas 도트 변환 연결)
                  </p>

                  {slots.map((slot, idx) => (
                    <div key={slot.id} className="slot-box">
                      <div className="slot-top">
                        <div>
                          <strong>SLOT 0{idx + 1}</strong>
                          <div>{slot.fileName}</div>
                        </div>
                        <div className="photo-notch pixel-art">
                          3단계
                          <br />
                          CANVAS
                        </div>
                      </div>

                      <div>
                        <span className="field-label">도트 크기</span>
                        <div className="btn-row">
                          {DOT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={slot.dotSize === opt.value ? 'btn-primary' : 'btn-secondary'}
                              aria-pressed={slot.dotSize === opt.value}
                              onClick={() => updateSlotDotSize(slot.id, opt.value)}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="field-label">탑승 좌석</span>
                        <div className="btn-row">
                          {(['driver', 'passenger'] as SeatPosition[]).map((seat) => (
                            <button
                              key={seat}
                              type="button"
                              className={slot.seat === seat ? 'btn-primary' : 'btn-secondary'}
                              aria-pressed={slot.seat === seat}
                              onClick={() => assignSeat(slot.id, seat)}
                            >
                              {seat === 'driver' ? '운전석' : '조수석'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="ribbon-card" aria-labelledby="bgm-heading">
                <div className="ribbon-title-bar">
                  <span id="bgm-heading">BGM PLAYLIST — {tracks.length} / 10 TRACKS</span>
                </div>
                <div className="ribbon-body-sky">
                  <form className="url-form" onSubmit={handleAddTrack}>
                    <input
                      type="url"
                      className="text-input"
                      placeholder="https://www.youtube.com/watch?v=..."
                      aria-label="YouTube URL 입력"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      disabled={tracks.length >= 10}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={!urlInput.trim() || tracks.length >= 10}
                    >
                      추가
                    </button>
                  </form>

                  <ul className="track-list">
                    {tracks.map((track, idx) => (
                      <li key={`${track.videoId}-${idx}`} className="track-item">
                        <span className="track-url">
                          {idx + 1}. {track.url}
                        </span>
                        <div className="track-actions">
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="위로 이동"
                            disabled={idx === 0}
                            onClick={() => moveTrack(idx, -1)}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="아래로 이동"
                            disabled={idx === tracks.length - 1}
                            onClick={() => moveTrack(idx, 1)}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            aria-label="삭제"
                            onClick={() => removeTrack(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div>
                    <span className="field-label">재생 모드</span>
                    <div className="btn-row">
                      {MODE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={mode === opt.value ? 'btn-primary' : 'btn-secondary'}
                          aria-pressed={mode === opt.value}
                          onClick={() => setMode(opt.value)}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="drive-layout">
            <section className="ribbon-card" aria-label="픽셀 주행 장면">
              <div className="ribbon-title-bar">
                <span>SIDE-VIEW DRIVE STAGE</span>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setScreen('setup')}
                >
                  설정으로 돌아가기
                </button>
              </div>
              <div className="ribbon-body-peach stage-viewport">
                <div className="stage-top-row">
                  <strong>
                    {status === 'playing' ? 'STATUS: DRIVING (5단계 애니메이션 연결)' : 'STATUS: PAUSED'}
                  </strong>
                  <div className="cert-seal" aria-hidden="true">
                    8-BIT
                    <br />
                    READERS
                    <br />
                    CHOICE
                  </div>
                </div>

                <div className="car-placeholder">
                  <span>
                    조수석: {slots.find((s) => s.seat === 'passenger')?.dotSize ?? '-'}
                  </span>
                  <span>[SIDE-CAR]</span>
                  <span>
                    운전석: {slots.find((s) => s.seat === 'driver')?.dotSize ?? '-'}
                  </span>
                </div>
              </div>
            </section>

            <section className="ribbon-card" aria-label="YouTube 플레이어 및 컨트롤">
              <div className="ribbon-title-bar">
                <span>YOUTUBE IFRAME DECK</span>
              </div>
              <div className="ribbon-body-periwinkle">
                <div className="yt-embed-box">
                  <div>
                    <strong>YouTube IFrame 영역 (6단계 연결)</strong>
                    <p style={{ margin: '6px 0 0' }}>{activeTrack?.url ?? '재생할 곡 없음'}</p>
                  </div>
                </div>

                <div className="transport-row">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={tracks.length <= 1}
                    onClick={() => setCurrentIndex((i) => (i - 1 + tracks.length) % tracks.length)}
                  >
                    이전 곡
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    aria-pressed={status === 'playing'}
                    onClick={() => setStatus((s) => (s === 'playing' ? 'paused' : 'playing'))}
                  >
                    {status === 'playing' ? '일시정지' : '재생'}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={tracks.length <= 1}
                    onClick={() => setCurrentIndex((i) => (i + 1) % tracks.length)}
                  >
                    다음 곡
                  </button>
                </div>

                <div className="btn-row">
                  {MODE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={mode === opt.value ? 'btn-primary' : 'btn-secondary'}
                      aria-pressed={mode === opt.value}
                      onClick={() => setMode(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <footer className="footer-band">
        <nav className="icon-label-nav" aria-label="하단 메뉴">
          <button type="button" className="nav-cell" onClick={() => setScreen('setup')}>
            FIND
          </button>
          <button type="button" className="nav-cell" onClick={() => setScreen('setup')}>
            HOME
          </button>
          <button type="button" className="nav-cell" onClick={startDrive}>
            DRIVE STAGE
          </button>
          <button type="button" className="nav-cell" onClick={() => setScreen('setup')}>
            SETUP &amp; HELP
          </button>
        </nav>
        <div>
          <a href="#top" className="classic-link" onClick={(e) => e.preventDefault()}>
            Copyright
          </a>{' '}
          (Local Browser Mode)
        </div>
        <p className="footer-caption">
          This site is best viewed with modern browsers. All PNG &amp; playlist data stay locally in your browser.
        </p>
      </footer>
    </div>
  );
}
