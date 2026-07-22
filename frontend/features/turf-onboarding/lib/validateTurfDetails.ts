export interface TurfDetailsInput {
  name: string;
  description?: string;
  address: {
    line1: string;
    city: string;
    cityCode: string;
    state: string;
    stateCode: string;
    country: string;
    countryCode: string;
    pincode: string;
  };
}

export interface TurfDetailsValidationResult {
  valid: boolean;
  errors: Partial<Record<'name' | 'line1' | 'city' | 'state' | 'country' | 'pincode', string>>;
}

/**
 * Mirrors the backend's SubmitTurfOwnerApplicationUseCase field checks (name + address only —
 * sports are validated separately, see validateSportsSelection). Country/state/city combination
 * validity is guaranteed by the cascading dropdowns themselves (each one's options come from the
 * backend's location catalog scoped to the parent selection), so only presence is checked here.
 */
export function validateTurfDetails(input: TurfDetailsInput): TurfDetailsValidationResult {
  const errors: TurfDetailsValidationResult['errors'] = {};

  if (input.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }
  if (!input.address.line1.trim()) {
    errors.line1 = 'Address line is required.';
  }
  if (!input.address.country.trim() || !input.address.countryCode.trim()) {
    errors.country = 'Country is required.';
  }
  if (!input.address.state.trim() || !input.address.stateCode.trim()) {
    errors.state = 'State is required.';
  }
  if (!input.address.city.trim() || !input.address.cityCode.trim()) {
    errors.city = 'City is required.';
  }
  if (!input.address.pincode.trim()) {
    errors.pincode = 'Pincode is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
