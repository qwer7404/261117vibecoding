import type { CultureBenefit, EventGroup, SeoulEvent } from '../types';

export type AgeFilter = 'u24' | 'u25_29';

export interface KoreaDateTime {
  date: string;
  minuteOfDay: number;
  weekday: number;
}

const KOREA_DATE_TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});
const KOREA_WEEKDAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Seoul',
  weekday: 'short'
});
const ENGLISH_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

export function getKoreaDateTime(now: Date = new Date()): KoreaDateTime {
  const parts = KOREA_DATE_TIME_FORMATTER.formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00';
  const year = read('year');
  const month = read('month');
  const day = read('day');
  const hour = Number(read('hour'));
  const minute = Number(read('minute'));
  const date = `${year}-${month}-${day}`;
  const weekday = ENGLISH_WEEKDAY_INDEX[KOREA_WEEKDAY_FORMATTER.format(now)] ?? 0;

  return { date, minuteOfDay: hour * 60 + minute, weekday };
}

const WEEKDAY_INDEX: Record<string, number> = {
  일: 0,
  월: 1,
  화: 2,
  수: 3,
  목: 4,
  금: 5,
  토: 6
};

function segmentAppliesToWeekday(segment: string, weekday: number): boolean {
  const normalized = segment.replace(/요일/g, '').replace(/매일/g, ' ');
  const selected = new Set<number>();
  let hasDayRule = false;

  if (/평일|주중/.test(normalized)) {
    hasDayRule = true;
    [1, 2, 3, 4, 5].forEach((day) => selected.add(day));
  }
  if (/주말/.test(normalized)) {
    hasDayRule = true;
    selected.add(0);
    selected.add(6);
  }

  const rangePattern = /([월화수목금토일])\s*[-~〜～]\s*([월화수목금토일])/g;
  let rangeMatch: RegExpExecArray | null;
  let withoutRanges = normalized;
  while ((rangeMatch = rangePattern.exec(normalized)) !== null) {
    hasDayRule = true;
    const start = WEEKDAY_INDEX[rangeMatch[1]];
    const end = WEEKDAY_INDEX[rangeMatch[2]];
    let day = start;
    selected.add(day);
    while (day !== end) {
      day = (day + 1) % 7;
      selected.add(day);
    }
    withoutRanges = withoutRanges.replace(rangeMatch[0], ' ');
  }

  const singlePattern = /(?:^|[\s,·/()[\]{}])([월화수목금토일])(?=$|[\s,·/()[\]{}])/g;
  let singleMatch: RegExpExecArray | null;
  while ((singleMatch = singlePattern.exec(withoutRanges)) !== null) {
    hasDayRule = true;
    selected.add(WEEKDAY_INDEX[singleMatch[1]]);
  }

  return !hasDayRule || selected.has(weekday);
}

function hasWeekdayRule(segment: string): boolean {
  const normalized = segment.replace(/요일/g, '').replace(/매일/g, ' ');
  return /평일|주중|주말/.test(normalized) ||
    /[월화수목금토일]\s*[-~〜～]\s*[월화수목금토일]/.test(normalized) ||
    /(?:^|[\s,·/()[\]{}])[월화수목금토일](?=$|[\s,·/()[\]{}])/.test(normalized);
}

interface TimeWindow {
  openMinute: number | null;
  closeMinute: number | null;
  closed: boolean;
}

/** 운영시간 텍스트에서 해당 요일에 적용되는 첫 개장·마지막 종료 시각을 추출합니다. */
export function getEventTimeWindow(timeText: string, weekday: number): TimeWindow {
  const segments = timeText.split(/[\/\n;]/).map((segment) => segment.trim()).filter(Boolean);
  const rangePattern = /(\d{1,2})\s*:\s*(\d{2})\s*(?:~|〜|∼|–|—|-)\s*(\d{1,2})\s*:\s*(\d{2})/g;
  const windows: Array<{ open: number; close: number }> = [];
  let hasDaySchedule = false;
  let matchingClosedDay = false;
  let matchingTimeRangeSegment = false;
  let hasAnyTimeRangeSegment = false;

  for (const segment of segments) {
    if (hasWeekdayRule(segment)) hasDaySchedule = true;
    const applies = segmentAppliesToWeekday(segment, weekday);

    let match: RegExpExecArray | null;
    const segmentWindows: Array<{ open: number; close: number }> = [];
    while ((match = rangePattern.exec(segment)) !== null) {
      const startHour = Number(match[1]);
      const startMinute = Number(match[2]);
      const endHour = Number(match[3]);
      const endMinute = Number(match[4]);
      if (
        startHour > 24 || endHour > 24 ||
        startMinute > 59 || endMinute > 59 ||
        (startHour === 24 && startMinute !== 0) ||
        (endHour === 24 && endMinute !== 0)
      ) continue;
      segmentWindows.push({
        open: startHour * 60 + startMinute,
        close: endHour * 60 + endMinute
      });
    }
    rangePattern.lastIndex = 0;
    if (segmentWindows.length > 0) hasAnyTimeRangeSegment = true;
    if (applies) {
      const lower = segment.toLowerCase();
      if (/휴관|휴무|미운영|운영\s*안|휴일/.test(lower)) matchingClosedDay = true;
    }
    if (applies && segmentWindows.length > 0) {
      matchingTimeRangeSegment = true;
      windows.push(...segmentWindows);
    }
  }

  if (windows.length === 0) {
    return {
      openMinute: null,
      closeMinute: null,
      closed: matchingClosedDay || (hasDaySchedule && hasAnyTimeRangeSegment && !matchingTimeRangeSegment)
    };
  }

  return {
    openMinute: Math.min(...windows.map((window) => window.open)),
    closeMinute: Math.max(...windows.map((window) => window.close)),
    closed: false
  };
}

export function isEventExpired(event: SeoulEvent, now: Date = new Date()): boolean {
  const current = getKoreaDateTime(now);
  if (!event.start || !event.end || event.end < event.start) return true;
  if (event.end < current.date) return true;
  if (event.end > current.date) return false;

  const window = getEventTimeWindow(event.time ?? '', current.weekday);
  if (window.closed) return true;
  return window.closeMinute !== null && current.minuteOfDay >= window.closeMinute;
}

export function hasEventStarted(event: SeoulEvent, now: Date = new Date()): boolean {
  const current = getKoreaDateTime(now);
  if (event.start < current.date) return true;
  if (event.start > current.date) return false;

  const window = getEventTimeWindow(event.time ?? '', current.weekday);
  return !window.closed && (window.openMinute === null || current.minuteOfDay >= window.openMinute);
}

export function getTargetAgeRange(target: string): { min: number; max: number } | null {
  const normalized = target.replace(/만\s*/g, '').replace(/\s/g, '');
  const range = normalized.match(/(\d{1,2})세?(?:~|〜|～|-)(\d{1,2})세/);
  if (range) {
    return { min: Number(range[1]), max: Number(range[2]) };
  }

  const min = normalized.match(/(\d{1,2})세이상/);
  const max = normalized.match(/(\d{1,2})세이하/);
  if (min && max) return { min: Number(min[1]), max: Number(max[1]) };

  const maxOnly = normalized.match(/(\d{1,2})세이하/);
  if (maxOnly) return { min: 0, max: Number(maxOnly[1]) };

  const minOnly = normalized.match(/(\d{1,2})세이상/);
  if (minOnly) return { min: Number(minOnly[1]), max: 120 };

  return null;
}

export function isBenefitEligibleForAge(benefit: CultureBenefit, age: number | null): boolean {
  return age === null || age <= benefit.maxAge;
}

export function getAgeFiltersForUser(age: number | null): AgeFilter[] {
  if (age === null || age <= 24) return ['u24', 'u25_29'];
  if (age <= 29) return ['u25_29'];
  return [];
}

export function filterSeoulEvents(
  events: SeoulEvent[],
  filters: {
    gap: number;
    group: '전체' | EventGroup;
    onlyYouth: boolean;
    onlyNow: boolean;
    soon: boolean;
    deadlineSort: boolean;
    query: string;
  },
  age: number | null,
  now: Date = new Date()
): SeoulEvent[] {
  const current = getKoreaDateTime(now);
  const query = filters.query.trim().toLowerCase();
  const dayMs = 86400000;
  const daysUntil = (date: string) =>
    Math.round((Date.parse(`${date}T00:00:00+09:00`) - Date.parse(`${current.date}T00:00:00+09:00`)) / dayMs);

  return events.filter((event) => {
    if (isEventExpired(event, now)) return false;
    if (filters.onlyNow && !hasEventStarted(event, now)) return false;
    if (filters.gap !== 999 && event.rt + 30 > filters.gap) return false;
    if (filters.group !== '전체' && event.grp !== filters.group) return false;
    if (filters.onlyYouth && (!event.youth || (age !== null && age > 29))) return false;
    if (filters.soon && daysUntil(event.end) > 7) return false;

    const targetAgeRange = getTargetAgeRange(event.target ?? '');
    if (age !== null && targetAgeRange && (age < targetAgeRange.min || age > targetAgeRange.max)) {
      return false;
    }

    if (query && !`${event.title} ${event.place} ${event.gu}`.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  }).sort((a, b) =>
    filters.deadlineSort
      ? a.end.localeCompare(b.end) || a.rt - b.rt
      : a.rt - b.rt || a.end.localeCompare(b.end)
  );
}

export function getEventDiscountLabel(event: SeoulEvent, age: number | null): string {
  if (event.free) return '무료';
  if (event.youth && (age === null || age <= 29)) return '청년·학생 할인';
  return event.fee;
}

export function isEventDiscountEligible(event: SeoulEvent, age: number | null): boolean {
  return event.youth && (age === null || age <= 29);
}
