export type DotSize = 'small' | 'medium' | 'large';

export type BenefitCategory = '박물관' | '미술관' | '문화예술' | '기타';

export type AgeFilter = 'all' | 'u24' | 'u29';

export interface ProfileAvatar {
  fileName: string;
  dotSize: DotSize;
  removeBg: boolean;
  blob?: Blob;
  previewDataUrl?: string;
}

export interface StoredProfileRecord {
  id: 'driver-profile';
  fileName: string;
  dotSize: DotSize;
  removeBg: boolean;
  blob: Blob;
  updatedAt: number;
}

export interface CultureBenefit {
  id: string;
  title: string;
  category: BenefitCategory;
  maxAge: 24 | 29;
  ageLabel: string;
  discountPercent: number;
  discountBadge: string;
  distanceKm: number;
  routeSummary: string;
  roundTripMinutes: number;
  gapTip: string;
  description: string;
  url: string;
}

export interface StudentUser {
  nickname: string;
  email: string;
  age: number;
}

export type EventGroup = '전시' | '공연' | '영화' | '체험·축제';

/** 서울시 문화행사 CSV(서울문화포털)에서 가공한 숙대 반경 8km 내 무료·청소년/청년 할인 행사 */
export interface SeoulEvent {
  id: number;
  title: string;
  cat: string;
  grp: EventGroup;
  gu: string;
  place: string;
  start: string;
  end: string;
  time: string;
  fee: string;
  free: boolean;
  youth: boolean;
  target: string;
  km: number;
  rt: number;
  lat: number;
  lng: number;
  url: string;
  img: string;
  culday: boolean;
}
