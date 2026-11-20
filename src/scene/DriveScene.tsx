import type { CultureBenefit } from '../types';
import './driveScene.css';

interface DriveSceneProps {
  isDriving: boolean;
  onToggleDrive: () => void;
  destination: Pick<CultureBenefit, 'title' | 'roundTripMinutes'> | null;
}

function SeoulSkylineChunk() {
  return (
    <svg
      className="parallax-chunk"
      viewBox="0 0 480 110"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Namsan Mountain & N Seoul Tower Pixel Silhouette */}
      <rect x="70" y="76" width="110" height="34" fill="#ececec" />
      <rect x="92" y="62" width="66" height="14" fill="#ececec" />
      <rect x="122" y="26" width="6" height="36" fill="#d6d6d6" />
      <rect x="117" y="34" width="16" height="8" fill="#c8c8c8" />
      <rect x="124" y="14" width="2" height="12" fill="#ff385c" />

      {/* Yongsan / Sookmyung Urban Blocks */}
      <rect x="210" y="54" width="44" height="56" fill="#e6e6e6" />
      <rect x="268" y="40" width="52" height="70" fill="#efefef" />
      <rect x="278" y="50" width="8" height="8" fill="#ffffff" />
      <rect x="296" y="50" width="8" height="8" fill="#ffffff" />
      <rect x="342" y="60" width="64" height="50" fill="#e6e6e6" />
      <rect x="422" y="46" width="42" height="64" fill="#efefef" />
    </svg>
  );
}

function MidgroundChunk() {
  return (
    <svg
      className="parallax-chunk"
      viewBox="0 0 480 120"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="56" y="78" width="8" height="42" fill="#8c8c8c" />
      <rect x="40" y="46" width="40" height="32" fill="#bdbdbd" />
      <rect x="48" y="34" width="24" height="12" fill="#bdbdbd" />

      <rect x="220" y="36" width="4" height="84" fill="#9e9e9e" />
      <rect x="220" y="36" width="18" height="4" fill="#9e9e9e" />
      <rect x="232" y="40" width="6" height="4" fill="#ff385c" />

      <rect x="364" y="80" width="8" height="40" fill="#8c8c8c" />
      <rect x="346" y="50" width="44" height="30" fill="#cfcfcf" />
      <rect x="356" y="38" width="24" height="12" fill="#cfcfcf" />
    </svg>
  );
}

export function DriveScene({ isDriving, onToggleDrive, destination }: DriveSceneProps) {
  return (
    <div className="drive-stage-wrap">
      <section
        className="drive-scene"
        data-driving={isDriving ? 'true' : 'false'}
        aria-label="숙명여대 출발 문화예술 드라이브 장면"
      >
        <div className="scene-hud">
          <span className="scene-status">
            <span className="status-dot" aria-hidden="true" />
            {destination
              ? `SOOKMYUNG → ${destination.title} (왕복 ${destination.roundTripMinutes}분)`
              : 'SOOKMYUNG · 공강 문화 드라이브'}
          </span>

          <button type="button" className="hud-toggle-btn" onClick={onToggleDrive}>
            {isDriving ? '주행 정지' : '드라이브 재생'}
          </button>
        </div>

        <div className="parallax-far">
          <SeoulSkylineChunk />
          <SeoulSkylineChunk />
        </div>

        <div className="parallax-mid">
          <MidgroundChunk />
          <MidgroundChunk />
        </div>

        <div className="vehicle-rig">
          <div className="exhaust-puff" aria-hidden="true" />

          {/* 고정 탑승자: 차체 위쪽에 앉아 도트 자동차와 겹치지 않음 */}
          <div className="driver-seat-slot">
            <img
              src="/assets/driver.png"
              alt="탑승자"
              className="driver-avatar-img pixel-art"
              draggable={false}
            />
          </div>

          <svg
            className="car-svg"
            viewBox="0 0 160 90"
            shapeRendering="crispEdges"
            aria-hidden="true"
          >
            <rect x="98" y="28" width="4" height="18" fill="#222222" />
            <rect x="94" y="28" width="4" height="6" fill="#222222" />
            <rect x="92" y="38" width="6" height="3" fill="#222222" />
            <rect x="94" y="41" width="3" height="5" fill="#222222" />

            <rect x="14" y="46" width="132" height="18" fill="#222222" />
            <rect x="10" y="52" width="140" height="12" fill="#222222" />
            <rect x="14" y="53" width="132" height="3" fill="#ff385c" />
            <rect x="18" y="48" width="24" height="2" fill="#4a4a4a" />
            <rect x="104" y="48" width="36" height="2" fill="#4a4a4a" />
            <rect x="146" y="52" width="4" height="5" fill="#ffffff" />
            <rect x="10" y="52" width="4" height="5" fill="#ff385c" />

            <rect x="26" y="56" width="28" height="12" fill="#f7f7f7" />
            <rect x="106" y="56" width="28" height="12" fill="#f7f7f7" />

            <g className="wheel-spin">
              <rect x="30" y="58" width="20" height="20" fill="#111111" />
              <rect x="34" y="62" width="12" height="12" fill="#dddddd" />
              <rect x="38" y="62" width="4" height="12" fill="#222222" />
              <rect x="34" y="66" width="12" height="4" fill="#222222" />
            </g>

            <g className="wheel-spin">
              <rect x="110" y="58" width="20" height="20" fill="#111111" />
              <rect x="114" y="62" width="12" height="12" fill="#dddddd" />
              <rect x="118" y="62" width="4" height="12" fill="#222222" />
              <rect x="114" y="66" width="12" height="4" fill="#222222" />
            </g>
          </svg>
        </div>

        <div className="parallax-road">
          <div className="road-strip">
            <span className="road-dash" />
            <span className="road-dash" />
            <span className="road-dash" />
            <span className="road-dash" />
          </div>
          <div className="road-strip">
            <span className="road-dash" />
            <span className="road-dash" />
            <span className="road-dash" />
            <span className="road-dash" />
          </div>
        </div>
      </section>
    </div>
  );
}
