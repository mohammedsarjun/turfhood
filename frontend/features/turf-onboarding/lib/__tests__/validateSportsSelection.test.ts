import { validateSportsSelection } from '../validateSportsSelection';

describe('validateSportsSelection', () => {
  it('accepts at least one selected sport', () => {
    expect(validateSportsSelection(['sport_1']).valid).toBe(true);
  });

  it('rejects an empty selection', () => {
    const result = validateSportsSelection([]);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/select at least one sport/i);
  });
});
