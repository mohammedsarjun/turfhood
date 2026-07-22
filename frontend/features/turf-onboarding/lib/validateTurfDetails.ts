import { isValidLocation } from '@turfhood/shared';

export interface TurfDetailsInput {
  name: string;
  description?: string;
  address: {
    line1: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
}

export interface TurfDetailsValidationResult {
  valid: boolean;
  errors: Partial<Record<'name' | 'line1' | 'city' | 'state' | 'country' | 'pincode', string>>;
}

/** Mirrors the backend's SubmitTurfOwnerApplicationUseCase field checks (name + address only — sports are validated separately, see validateSportsSelection). */
export function validateTurfDetails(input: TurfDetailsInput): TurfDetailsValidationResult {
  const errors: TurfDetailsValidationResult['errors'] = {};

  if (input.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  }
  if (!input.address.line1.trim()) {
    errors.line1 = 'Address line is required.';
  }
  if (!input.address.country.trim()) {
    errors.country = 'Country is required.';
  }
  if (!input.address.state.trim()) {
    errors.state = 'State is required.';
  }
  if (!input.address.city.trim()) {
    errors.city = 'City is required.';
  }
  if (
    input.address.country &&
    input.address.state &&
    input.address.city &&
    !isValidLocation(input.address.country, input.address.state, input.address.city)
  ) {
    errors.city = 'Please select a valid country, state, and city combination.';
  }
  if (!input.address.pincode.trim()) {
    errors.pincode = 'Pincode is required.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
