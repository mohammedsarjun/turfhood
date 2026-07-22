export interface CoordinatesValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors the backend's SubmitTurfOwnerApplicationUseCase range check. */
export function validateCoordinates(
  coordinates: { lat: number; lng: number } | null,
): CoordinatesValidationResult {
  if (!coordinates) {
    return { valid: false, error: "Please pinpoint your turf's location on the map." };
  }
  const { lat, lng } = coordinates;
  if (
    typeof lat !== 'number' ||
    typeof lng !== 'number' ||
    Number.isNaN(lat) ||
    Number.isNaN(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return { valid: false, error: 'Invalid coordinates — please select a location on the map.' };
  }
  return { valid: true };
}
