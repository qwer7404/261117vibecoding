import { describe, expect, it } from 'vitest';
import { SOOKMYUNG_BENEFITS } from '../../data/benefits';
import { validateAvatarFile } from '../pixelate';

describe('Sookmyung Culture Drive data and avatar validation', () => {
  it('contains mock cultural benefits with valid external links and round-trip times', () => {
    expect(SOOKMYUNG_BENEFITS.length).toBeGreaterThanOrEqual(8);
    for (const item of SOOKMYUNG_BENEFITS) {
      expect(item.url.startsWith('https://')).toBe(true);
      expect(item.roundTripMinutes).toBeGreaterThan(0);
    }
  });

  it('validates supported avatar formats', () => {
    expect(validateAvatarFile({ type: 'image/png', name: 'me.png', size: 2048 })).toBeNull();
    expect(validateAvatarFile({ type: 'image/jpeg', name: 'me.jpg', size: 2048 })).toBeNull();
    expect(validateAvatarFile({ type: 'application/pdf', name: 'doc.pdf', size: 2048 })).not.toBeNull();
  });
});
