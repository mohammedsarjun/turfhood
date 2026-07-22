import { validateCoordinates } from '../validateCoordinates';

describe('validateCoordinates', () => {
  it('accepts valid coordinates', () => {
    expect(validateCoordinates({ lat: 13.0827, lng: 80.2707 }).valid).toBe(true);
  });

  it('rejects null (no location selected)', () => {
    const result = validateCoordinates(null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/pinpoint/i);
  });

  it('rejects out-of-range latitude', () => {
    const result = validateCoordinates({ lat: 999, lng: 80.27 });
    expect(result.valid).toBe(false);
  });

  it('rejects out-of-range longitude', () => {
    const result = validateCoordinates({ lat: 13.08, lng: 999 });
    expect(result.valid).toBe(false);
  });

  it('rejects NaN coordinates', () => {
    const result = validateCoordinates({ lat: NaN, lng: 80.27 });
    expect(result.valid).toBe(false);
  });
});
