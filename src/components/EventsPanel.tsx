import { useMemo, useState } from 'react';
import eventsData from '../data/events.json';
import type { EventGroup, SeoulEvent } from '../types';

const EVENTS = eventsData as SeoulEvent[];
const TODAY = new Date().toISOString().slice(0, 10);
const VIEW_MIN = 30; // 현장 관람 최소 시간(분)

const GAPS = [
  { value: 999, label: '시간 제한 없음 (하교 후)' },
  { value: 60, label: '공강 1시간' },
  { value: 90, label: '공강 1시간 30분' },
  { value: 120, label: '공강 2시간' }
];
const GROUPS: ('전체' | EventGroup)[] = ['전체', '전시', '공연', '영화', '체험·축제'];

interface Props {
  selectedId: number | null;
  onSelect: (ev: SeoulEvent) => void;
}

const fmt = (d: string) => d.slice(5).replace('-', '.');

export function EventsPanel({ selectedId, onSelect }: Props) {
  const [gap, setGap] = useState(999);
  const [group, setGroup] = useState<'전체' | EventGroup>('전체');
  const [onlyYouth, setOnlyYouth] = useState(false);
  const [onlyNow, setOnlyNow] = useState(true);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(12);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EVENTS.filter((e) => {
      if (gap !== 999 && e.rt + VIEW_MIN > gap) return false;
      if (group !== '전체' && e.grp !== group) return false;
      if (onlyYouth && !e.youth) return false;
      if (onlyNow && e.start > TODAY) return false;
      if (q && !`${e.title} ${e.place} ${e.gu}`.toLowerCase().includes(q)) return false;
      return true;
    }).sort((a, b) => a.rt - b.rt || a.end.localeCompare(b.end));
  }, [gap, group, onlyYouth, onlyNow, query]);

  return (
    <section className="surface-card events-panel" aria-labelledby="events-heading">
      <div className="section-head">
        <h3 id="events-heading" className="display-sm">
          SEOUL LIVE EVENTS ({list.length})
        </h3>
        <span className="caption-uppercase">서울문화포털 · 숙대 반경 8km · 무료/청소년·청년 할인</span>
      </div>

      <div className="control-block">
        <span className="caption-uppercase">내 시간표</span>
        <div className="pill-row">
          {GAPS.map((g) => (
            <button key={g.value} type="button" className="btn-pill" aria-pressed={gap === g.value} onClick={() => setGap(g.value)}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-block">
        <span className="caption-uppercase">분야 · 조건</span>
        <div className="pill-row">
          {GROUPS.map((g) => (
            <button key={g} type="button" className="btn-pill" aria-pressed={group === g} onClick={() => setGroup(g)}>
              {g}
            </button>
          ))}
          <button type="button" className="btn-pill" aria-pressed={onlyYouth} onClick={() => setOnlyYouth((v) => !v)}>
            청소년·청년 할인만
          </button>
          <button type="button" className="btn-pill" aria-pressed={onlyNow} onClick={() => setOnlyNow((v) => !v)}>
            지금 진행 중만
          </button>
        </div>
      </div>

      <input
        type="search"
        className="underline-input"
        placeholder="행사명 · 장소 · 자치구 검색 (예: 용산, 미술관)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="행사 검색"
      />

      {list.length === 0 ? (
        <div className="empty-state">
          <p className="body-prose">조건에 맞는 행사가 없어요. 시간표나 분야를 넓혀 보세요.</p>
        </div>
      ) : (
        <div className="benefit-list">
          {list.slice(0, limit).map((e) => {
            const left = gap === 999 ? null : gap - e.rt;
            const daysLeft = Math.ceil((Date.parse(e.end) - Date.parse(TODAY)) / 86400000);
            return (
              <article key={e.id} className="benefit-card" data-selected={selectedId === e.id ? 'true' : 'false'} onClick={() => onSelect(e)}>
                <div className="benefit-top">
                  <span className="caption-uppercase">{e.grp} · {e.gu} · {e.target || '누구나'}</span>
                  <span className="discount-tag">{e.free ? '무료' : e.youth ? '청년·학생 할인' : e.fee}</span>
                </div>
                <h4 className="title-md">{e.title}</h4>
                <p className="body-prose">{e.place}</p>
                <div className="benefit-specs">
                  <span>{fmt(e.start)} ~ {fmt(e.end)}{daysLeft <= 7 ? ` · D-${daysLeft}` : ''}</span>
                  <span>{e.km}km · 왕복 약 {e.rt}분</span>
                  {e.time && <span>{e.time}</span>}
                  {left !== null && <span>공강 중 관람 가능 {left}분</span>}
                </div>
                <div className="benefit-footer">
                  <span className="caption-uppercase">{e.youth && !e.free ? '현장 신분증·학생증 확인 필요' : e.fee}</span>
                  <a href={e.url} target="_blank" rel="noopener noreferrer" className="btn-primary-outline" onClick={(ev) => ev.stopPropagation()}>
                    상세 보기 ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {list.length > limit && (
        <button type="button" className="btn-pill" onClick={() => setLimit((l) => l + 12)}>
          더 보기 ({list.length - limit}개 남음)
        </button>
      )}
      <p className="footer-fine">
        이동시간은 직선거리 기반 추정치예요. 시간·요금·할인 대상은 상세 페이지에서 꼭 다시 확인하세요.
      </p>
    </section>
  );
}
