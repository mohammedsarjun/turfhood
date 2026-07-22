export interface TurfImageEntry {
  file: File;
  isCover: boolean;
}

export interface TurfImagesValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors the backend's SubmitTurfOwnerApplicationUseCase image checks. */
export function validateTurfImages(images: TurfImageEntry[]): TurfImagesValidationResult {
  if (images.length === 0) {
    return { valid: false, error: 'Upload at least one turf photo.' };
  }
  if (images.length > 10) {
    return { valid: false, error: 'Upload at most 10 turf photos.' };
  }
  const coverCount = images.filter((image) => image.isCover).length;
  if (coverCount !== 1) {
    return { valid: false, error: 'Mark exactly one photo as the cover photo.' };
  }
  return { valid: true };
}
