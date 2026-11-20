import { GAPS, GROUPS } from './EventsPanel';
import type { AgeFilter, BenefitCategory } from '../types';

export type Kind = 'all' | 'permanent' | 'timed';

export interface Filters {
  kind: Kind;
  gap: number;
  bookmarkOnly: boolean;
  // 상설(상시 혜택)
  age: AgeFilter;
  category: '전체' | BenefitCategory;
  minDiscount: number;
  sortBy: 'distance' | 'discount';
  // 기간 한정 행사
  group: (typeof GROUPS)[number];
  onlyYouth: boolean;
  onlyNow: boolean;
  soon: boolean;
  deadlineSort: boolean;
  query: string;
}

const KINDS: { value: Kind; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'permanent', label: '상설 (상시 할인 장소)' },
  { value: 'timed', label: '일정기간 (기간 한정 행사)' }
];
const AGES: { value: AgeFilter; label: string }[] = [
  { value: 'all', label: '전체 연령' },
  { value: 'u24', label: '만 24세 이하' },
  { value: 'u29', label: '만 25~29세' }
];
const CATS: ('전체' | BenefitCategory)[] = ['전체', '박물관', '미술관', '문화예술', '기타'];
const DISCOUNTS = [
  { value: 0, label: '전체 할인' },
  { value: 100, label: '무료 (100%)' },
  { value: 50, label: '50% 이상' },
  { value: 30, label: '30% 이상' }
];

interface Props {
  layout: 'bar' | 'side';
  f: Filters;
  set: (patch: Partial<Filters>) => void;
  bookmarkCount: number;
  onSearch?: () => void;
  onCollapse?: () => void;
}

export function FilterPanel({ layout, f, set, bookmarkCount, onSearch, onCollapse }: Props) {
  const showSpots = f.kind !== 'timed';
  const showEvents = f.kind !== 'permanent';
  const Pill = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) => (
    <button type="button" className="btn-pill" aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );

  return (
    <aside className={`surface-card filter-panel filter-${layout}`} aria-label="필터">
      <div className="section-head">
        <h3 className="display-sm">FILTER</h3>
        {layout === 'side' ? (
          <button type="button" className="btn-pill" onClick={onCollapse}>
            ↺ 가로 필터로
          </button>
        ) : (
          <span className="caption-uppercase">조건을 고르고 검색을 눌러요</span>
        )}
      </div>

      <div className="filter-grid">
        <div className="control-block span-all">
          <span className="caption-uppercase">종류</span>
          <div className="pill-row">
            {KINDS.map((k) => (
              <Pill key={k.value} on={f.kind === k.value} onClick={() => set({ kind: k.value })}>
                {k.label}
              </Pill>
            ))}
            <Pill on={f.bookmarkOnly} onClick={() => set({ bookmarkOnly: !f.bookmarkOnly })}>
              {`★ 북마크만 (${bookmarkCount})`}
            </Pill>
          </div>
        </div>

        <div className="control-block">
          <span className="caption-uppercase">내 시간표 (공통)</span>
          <div className="pill-row">
            {GAPS.map((g) => (
              <Pill key={g.value} on={f.gap === g.value} onClick={() => set({ gap: g.value })}>
                {g.label}
              </Pill>
            ))}
          </div>
        </div>

        {showSpots && (
          <>
            <div className="control-block">
              <span className="caption-uppercase">나이 기준 (상설)</span>
              <div className="pill-row">
                {AGES.map((a) => (
                  <Pill key={a.value} on={f.age === a.value} onClick={() => set({ age: a.value })}>
                    {a.label}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="control-block">
              <span className="caption-uppercase">분야 (상설)</span>
              <div className="pill-row">
                {CATS.map((c) => (
                  <Pill key={c} on={f.category === c} onClick={() => set({ category: c })}>
                    {c}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="control-block">
              <span className="caption-uppercase">할인율 (상설)</span>
              <div className="pill-row">
                {DISCOUNTS.map((d) => (
                  <Pill key={d.value} on={f.minDiscount === d.value} onClick={() => set({ minDiscount: d.value })}>
                    {d.label}
                  </Pill>
                ))}
              </div>
            </div>
          </>
        )}

        {showEvents && (
          <>
            <div className="control-block">
              <span className="caption-uppercase">분야 (일정기간)</span>
              <div className="pill-row">
                {GROUPS.map((g) => (
                  <Pill key={g} on={f.group === g} onClick={() => set({ group: g })}>
                    {g}
                  </Pill>
                ))}
              </div>
            </div>
            <div className="control-block">
              <span className="caption-uppercase">조건 (일정기간)</span>
              <div className="pill-row">
                <Pill on={f.onlyYouth} onClick={() => set({ onlyYouth: !f.onlyYouth })}>청소년·청년 할인만</Pill>
                <Pill on={f.onlyNow} onClick={() => set({ onlyNow: !f.onlyNow })}>지금 진행 중만</Pill>
                <Pill on={f.soon} onClick={() => set({ soon: !f.soon })}>7일 안에 끝나는 행사</Pill>
                <Pill on={f.deadlineSort} onClick={() => set({ deadlineSort: !f.deadlineSort })}>마감 임박순 정렬</Pill>
              </div>
            </div>
            <div className="control-block">
              <span className="caption-uppercase">행사 검색</span>
              <input
                type="search"
                className="underline-input"
                placeholder="행사명 · 장소 · 자치구 (예: 용산, 미술관)"
                value={f.query}
                onChange={(e) => set({ query: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
                aria-label="행사 검색"
              />
            </div>
          </>
        )}
      </div>

      {layout === 'bar' && (
        <div className="filter-actions">
          <span className="caption-uppercase">
            {f.bookmarkOnly ? '북마크한 항목만 보여줘요 (다른 조건은 무시)' : '고른 조건에 맞는 장소와 행사를 찾아드려요'}
          </span>
          <button type="button" className="btn-search" onClick={onSearch}>
            검색
          </button>
        </div>
      )}
    </aside>
  );
}
