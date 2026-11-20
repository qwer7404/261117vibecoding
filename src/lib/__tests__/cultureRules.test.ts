import { describe, expect, it } from 'vitest';
import type { CultureBenefit, SeoulEvent } from '../../types';
import {
  filterSeoulEvents,
  getAgeFiltersForUser,
  getEventTimeWindow,
  getTargetAgeRange,
  isBenefitEligibleForAge,
  isEventExpired
} from '../cultureRules';

const eventFixture = (overrides: Partial<SeoulEvent> = {}): SeoulEvent => ({
  id: 1,
  title: '테스트 전시',
  cat: '전시',
  grp: '전시',
  gu: '용산구',
  place: '테스트 미술관',
  start: '2026-11-19',
  end: '2026-11-20',
  time: '금요일 10:00~17:00',
  fee: '일반 10,000원',
  free: false,
  youth: true,
  target: '누구나',
  km: 1,
  rt: 20,
  lat: 37.5,
  lng: 126.9,
  url: 'https://example.com',
  img: '',
  culday: false,
  ...overrides
});

const benefitFixture = (maxAge: 24 | 29): CultureBenefit => ({
  id: `age-${maxAge}`,
  title: '연령 할인 테스트',
  category: '미술관',
  maxAge,
  ageLabel: `만 ${maxAge}세 이하`,
  discountPercent: 50,
  discountBadge: '50% 할인',
  distanceKm: 1,
  routeSummary: '테스트 경로',
  roundTripMinutes: 20,
  gapTip: '테스트',
  description: '테스트 혜택',
  url: 'https://example.com'
});

describe('Culture Drive age and event-period rules', () => {
  it('removes events after the closing time on the final day using Korea time', () => {
    const event = eventFixture();
    // 2026-11-20 20:00 KST
    expect(isEventExpired(event, new Date('2026-11-20T11:00:00.000Z'))).toBe(true);
    // 2026-11-20 16:59 KST
    expect(isEventExpired(event, new Date('2026-11-20T07:59:00.000Z'))).toBe(false);
  });

  it('hides an exhibition that ended at 10:00 even if its end date is today', () => {
    const morningExhibition = eventFixture({ time: '금요일 09:00~10:00' });
    // 2026-11-20 20:00 KST
    expect(isEventExpired(morningExhibition, new Date('2026-11-20T11:00:00.000Z'))).toBe(true);
  });

  it('uses the matching weekday schedule rather than another day’s closing time', () => {
    const friday = getEventTimeWindow('목, 금 20:00~21:00', 5);
    const saturday = getEventTimeWindow('월-금 10:00~17:00 / 주말 휴관', 6);
    expect(friday.closeMinute).toBe(21 * 60);
    expect(saturday.closed).toBe(true);
  });

  it('does not confuse a 21:00 closing event with one that closes at 17:00', () => {
    const eveningEvent = eventFixture({ time: '목, 금 20:00~21:00' });
    // 2026-11-20 20:00 KST
    expect(isEventExpired(eveningEvent, new Date('2026-11-20T11:00:00.000Z'))).toBe(false);
  });

  it('parses explicit target age ranges', () => {
    expect(getTargetAgeRange('21~24세 청년 (2002.1.1. ~ 2005.12.31. 출생자)')).toEqual({ min: 21, max: 24 });
    expect(getTargetAgeRange('만 24세 이하')).toEqual({ min: 0, max: 24 });
    expect(getTargetAgeRange('누구나')).toBeNull();
  });

  it('personalizes standing benefits and exposes overlapping age-filter groups', () => {
    expect(isBenefitEligibleForAge(benefitFixture(24), 30)).toBe(false);
    expect(isBenefitEligibleForAge(benefitFixture(29), 28)).toBe(true);
    expect(getAgeFiltersForUser(23)).toEqual(['u24', 'u25_29']);
    expect(getAgeFiltersForUser(27)).toEqual(['u25_29']);
    expect(getAgeFiltersForUser(30)).toEqual([]);
  });

  it('filters an age-restricted event for a user outside its stated audience', () => {
    const event = eventFixture({ target: '21~24세 청년' });
    const filtered = filterSeoulEvents([event], {
      gap: 999,
      group: '전체',
      onlyYouth: false,
      onlyNow: false,
      soon: false,
      deadlineSort: false,
      query: ''
    }, 30, new Date('2026-11-20T07:00:00.000Z'));
    expect(filtered).toHaveLength(0);
  });
});
