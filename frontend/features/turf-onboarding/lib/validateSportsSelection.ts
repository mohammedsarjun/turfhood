export interface SportsSelectionValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors the backend's SubmitTurfOwnerApplicationUseCase check — sportsOffered is required. */
export function validateSportsSelection(sportsOffered: string[]): SportsSelectionValidationResult {
  if (sportsOffered.length === 0) {
    return { valid: false, error: 'Select at least one sport offered at your turf.' };
  }
  return { valid: true };
}
