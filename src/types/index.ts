export type DotSize = 'small' | 'medium' | 'large';

export type SeatPosition = 'driver' | 'passenger';

export type AppScreen = 'setup' | 'drive';

export interface CharacterSlot {
  id: string;
  fileName: string;
  dotSize: DotSize;
  seat: SeatPosition;
  hasTransparency: boolean;
  previewDataUrl?: string;
}

export type PlaybackMode = 'sequence' | 'repeat-one' | 'repeat-all';

export type PlayerStatus =
  | 'unstarted'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'ended'
  | 'error';

export interface Track {
  videoId: string;
  url: string;
}

export interface AppPlaybackState {
  tracks: Track[];
  currentIndex: number;
  mode: PlaybackMode;
  status: PlayerStatus;
}
