import { validateTurfDetails } from '../validateTurfDetails';

function buildInput(overrides: Partial<Parameters<typeof validateTurfDetails>[0]> = {}) {
  return {
    name: 'Green Turf Arena',
    address: {
      line1: '12 Anna Salai',
      city: 'Chennai',
      cityCode: '1',
      state: 'Tamil Nadu',
      stateCode: 'TN',
      country: 'India',
      countryCode: 'IN',
      pincode: '600002',
    },
    ...overrides,
  };
}

describe('validateTurfDetails', () => {
  it('accepts valid details', () => {
    const result = validateTurfDetails(buildInput());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('rejects a name shorter than 2 characters', () => {
    const result = validateTurfDetails(buildInput({ name: 'A' }));
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('rejects a missing address line', () => {
    const result = validateTurfDetails(
      buildInput({ address: { ...buildInput().address, line1: '' } }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.line1).toBeDefined();
  });

  it('rejects a missing city selection', () => {
    const result = validateTurfDetails(
      buildInput({ address: { ...buildInput().address, city: '', cityCode: '' } }),
    );
    expect(result.valid).toBe(false);
    expect(result.errors.city).toBeDefined();
  });
});
