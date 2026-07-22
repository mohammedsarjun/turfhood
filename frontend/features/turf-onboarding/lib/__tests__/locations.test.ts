import { getCities, getCountries, getStates, isValidLocation } from '@turfhood/shared';

describe('shared locations dataset (country -> state -> city cascade)', () => {
  it('lists India as an available country', () => {
    expect(getCountries()).toContain('India');
  });

  it('lists Tamil Nadu among India\'s states', () => {
    expect(getStates('India')).toContain('Tamil Nadu');
  });

  it('returns no states for an unknown country', () => {
    expect(getStates('Atlantis')).toEqual([]);
  });

  it('lists Chennai and Coimbatore under Tamil Nadu', () => {
    const cities = getCities('India', 'Tamil Nadu');
    expect(cities).toContain('Chennai');
    expect(cities).toContain('Coimbatore');
  });

  it('does not leak cities from a different state', () => {
    const tamilNaduCities = getCities('India', 'Tamil Nadu');
    expect(tamilNaduCities).not.toContain('Bengaluru');
  });

  it('validates a correct country/state/city combination', () => {
    expect(isValidLocation('India', 'Tamil Nadu', 'Chennai')).toBe(true);
  });

  it('rejects a city that does not belong to the given state', () => {
    expect(isValidLocation('India', 'Tamil Nadu', 'Bengaluru')).toBe(false);
  });

  it('rejects an unknown country entirely', () => {
    expect(isValidLocation('Atlantis', 'Tamil Nadu', 'Chennai')).toBe(false);
  });
});
