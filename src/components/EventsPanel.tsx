import { useState } from 'react';
import eventsData from '../data/events.json';
import { getEventDiscountLabel, getKoreaDateTime, isEventDiscountEligible } from '../lib/cultureRules';
import { BookmarkButton } from './BookmarkButton';
import type { EventGroup, SeoulEvent } from '../types';

export const EVENTS = eventsData as SeoulEvent[];
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

function daysUntil(date: string): number {
  const today = getKoreaDateTime().date;
  return Math.round(
    (Date.parse(`${date}T00:00:00+09:00`) - Date.parse(`${today}T00:00:00+09:00`)) / 86400000
  );
}

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const dow = (date: string) =>
  WEEK[getKoreaDateTime(new Date(`${date}T12:00:00+09:00`)).weekday];
const fmt = (date: string) => `${date.slice(5).replace('-', '.')}(${dow(date)})`;

function dday(event: SeoulEvent) {
  const left = daysUntil(event.end);
  if (left < 0) return { text: '종료', hot: false };
  if (daysUntil(event.start) > 0) return { text: `${fmt(event.start)} 시작`, hot: false };
  if (left === 0) return { text: '오늘 마감', hot: true };
  if (left === 1) return { text: '내일 마감', hot: true };
  return { text: `D-${left}`, hot: left <= 7 };
}

interface Props {
  list: SeoulEvent[];
  gap: number;
  selectedId: number | null;
  marks: string[];
  userAge: number | null;
  onToggleMark: (key: string) => void;
  onSelect: (ev: SeoulEvent) => void;
}

export function EventsPanel({
  list,
  gap,
  selectedId,
  marks,
  userAge,
  onToggleMark,
  onSelect
}: Props) {
  const [limit, setLimit] = useState(12);

  return (
    <section className="surface-card events-panel" aria-labelledby="events-heading">
      <div className="section-head">
        <h3 id="events-heading" className="display-sm">
          SEOUL LIVE EVENTS ({list.length})
        </h3>
        <span className="caption-uppercase">서울문화포털 · 숙대 반경 8km · 일정기간 · 현재 유효한 행사</span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">
          <p className="body-prose">조건에 맞는 행사가 없어요. 시간표나 분야를 넓혀 보세요.</p>
        </div>
      ) : (
        <div className="benefit-list">
          {list.slice(0, limit).map((event) => {
            const left = gap === 999 ? null : gap - event.rt;
            const deadline = dday(event);
            const discountEligible = isEventDiscountEligible(event, userAge);
            return (
              <article
                key={event.id}
                className="benefit-card"
                data-selected={selectedId === event.id ? 'true' : 'false'}
                onClick={() => onSelect(event)}
              >
                <div className="benefit-top">
                  <span className="caption-uppercase">
                    {event.grp} · {event.gu} · {event.target || '누구나'}
                  </span>
                  <span className="discount-tag">{getEventDiscountLabel(event, userAge)}</span>
                  <span className={deadline.hot ? 'deadline-tag hot' : 'deadline-tag'}>
                    {deadline.text}
                  </span>
                  <BookmarkButton
                    active={marks.includes(evKey(event))}
                    onToggle={() => onToggleMark(evKey(event))}
                  />
                </div>
                <h4 className="title-md">{event.title}</h4>
                <p className="body-prose">{event.place}</p>
                <div className="benefit-specs">
                  <span className="date-line">
                    📅 {event.start === event.end ? fmt(event.start) : `${fmt(event.start)} ~ ${fmt(event.end)}`}
                  </span>
                  <span>{event.km}km · 왕복 약 {event.rt}분</span>
                  {event.time && <span>{event.time}</span>}
                  {left !== null && <span>공강 중 관람 가능 {left}분</span>}
                </div>
                <div className="benefit-footer">
                  <span className="caption-uppercase">
                    {discountEligible && !event.free ? '현장 신분증·학생증 확인 필요' : event.fee}
                  </span>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-outline"
                    onClick={(clickEvent) => clickEvent.stopPropagation()}
                  >
                    상세 보기 ↗
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
      {list.length > limit && (
        <button type="button" className="btn-pill" onClick={() => setLimit((count) => count + 12)}>
          더 보기 ({list.length - limit}개 남음)
        </button>
      )}
      <p className="footer-fine">
        종료일의 운영 종료 시각이 지난 행사는 자동으로 제외해요. 이동시간은 직선거리 기반 추정치이며, 시간·요금·할인 대상은 상세 페이지에서 다시 확인하세요.
      </p>
    </section>
  );
}
