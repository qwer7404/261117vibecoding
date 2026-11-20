import { useState } from 'react';
import eventsData from '../data/events.json';
import { BookmarkButton } from './BookmarkButton';
import type { EventGroup, SeoulEvent } from '../types';

export const EVENTS = eventsData as SeoulEvent[];
export const TODAY = new Date().toLocaleDateString('sv-SE'); // 한국 시간 기준 YYYY-MM-DD
export const VIEW_MIN = 30; // 현장 관람 최소 시간(분)

export const GAPS = [
  { value: 999, label: '제한 없음 (하교 후)' },
  { value: 60, label: '공강 1시간' },
  { value: 90, label: '공강 1시간 30분' },
  { value: 120, label: '공강 2시간' }
];
export const GROUPS: ('전체' | EventGroup)[] = ['전체', '전시', '공연', '영화', '체험·축제'];

export interface EventFilter {
  gap: number;
  group: '전체' | EventGroup;
  onlyYouth: boolean;
  onlyNow: boolean;
  soon: boolean; // 마감 7일 이내
  deadlineSort: boolean; // 마감 임박순
  query: string;
}

export const evKey = (e: SeoulEvent) => `ev:${e.title}|${e.start}`;

const DAY = 86400000;
export const daysUntil = (d: string) => Math.round((Date.parse(d) - Date.parse(TODAY)) / DAY);
const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const dow = (d: string) => WEEK[new Date(d + 'T00:00:00').getDay()];

export function filterEvents(f: EventFilter): SeoulEvent[] {
  const q = f.query.trim().toLowerCase();
  return EVENTS.filter((e) => {
    if (f.gap !== 999 && e.rt + VIEW_MIN > f.gap) return false;
    if (f.group !== '전체' && e.grp !== f.group) return false;
    if (f.onlyYouth && !e.youth) return false;
    if (f.onlyNow && e.start > TODAY) return false;
    if (f.soon && daysUntil(e.end) > 7) return false;
    if (q && !`${e.title} ${e.place} ${e.gu}`.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) =>
    f.deadlineSort
      ? a.end.localeCompare(b.end) || a.rt - b.rt
      : a.rt - b.rt || a.end.localeCompare(b.end)
  );
}

interface Props {
  list: SeoulEvent[];
  gap: number;
  selectedId: number | null;
  marks: string[];
  onToggleMark: (key: string) => void;
  onSelect: (ev: SeoulEvent) => void;
}

const fmt = (d: string) => `${d.slice(5).replace('-', '.')}(${dow(d)})`;

function dday(e: SeoulEvent) {
  const left = daysUntil(e.end);
  if (left < 0) return { text: '종료', hot: false };
  if (daysUntil(e.start) > 0) return { text: `${fmt(e.start)} 시작`, hot: false };
  if (left === 0) return { text: '오늘 마감', hot: true };
  if (left === 1) return { text: '내일 마감', hot: true };
  return { text: `D-${left}`, hot: left <= 7 };
}

export function EventsPanel({ list, gap, selectedId, marks, onToggleMark, onSelect }: Props) {
  const [limit, setLimit] = useState(12);

  return (
    <section className="surface-card events-panel" aria-labelledby="events-heading">
      <div className="section-head">
        <h3 id="events-heading" className="display-sm">
          SEOUL LIVE EVENTS ({list.length})
        </h3>
        <span className="caption-uppercase">서울문화포털 · 숙대 반경 8km · 일정기간 · 지금 열리는 서울시 행사</span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p className="body-prose">조건에 맞는 행사가 없어요. 시간표나 분야를 넓혀 보세요.</p>
        </div>
      ) : (
        <div className="benefit-list">
          {list.slice(0, limit).map((e) => {
            const left = gap === 999 ? null : gap - e.rt;
            const dd = dday(e);
            return (
              <article key={e.id} className="benefit-card" data-selected={selectedId === e.id ? 'true' : 'false'} onClick={() => onSelect(e)}>
                <div className="benefit-top">
                  <span className="caption-uppercase">{e.grp} · {e.gu} · {e.target || '누구나'}</span>
                  <span className="discount-tag">{e.free ? '무료' : e.youth ? '청년·학생 할인' : e.fee}</span>
                  <span className={dd.hot ? 'deadline-tag hot' : 'deadline-tag'}>{dd.text}</span>
                  <BookmarkButton active={marks.includes(evKey(e))} onToggle={() => onToggleMark(evKey(e))} />
                </div>
                <h4 className="title-md">{e.title}</h4>
                <p className="body-prose">{e.place}</p>
                <div className="benefit-specs">
                  <span className="date-line">📅 {e.start === e.end ? fmt(e.start) : `${fmt(e.start)} ~ ${fmt(e.end)}`}</span>
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
