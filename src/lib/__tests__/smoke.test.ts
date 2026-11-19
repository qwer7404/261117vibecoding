import { describe, expect, it } from 'vitest';
import type { AppPlaybackState, DotSize } from '../../types';

describe('Step 1 baseline domain types', () => {
  it('initializes valid playback state structure', () => {
    const sizes: DotSize[] = ['small', 'medium', 'large'];
    const initialState: AppPlaybackState = {
      tracks: [],
      currentIndex: 0,
      mode: 'repeat-all',
      status: 'unstarted'
    };

    expect(sizes).toHaveLength(3);
    expect(initialState.mode).toBe('repeat-all');
    expect(initialState.status).toBe('unstarted');
  });
});
