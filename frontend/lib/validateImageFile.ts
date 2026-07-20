const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export interface ImageFileValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors the backend's server-side checks (UpdateAvatarUseCase, UploadSportsTypeIconUseCase, UploadAmenityIconUseCase). */
export function validateImageFile(file: File): ImageFileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, or WEBP images are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Image must be 5MB or smaller.' };
  }
  return { valid: true };
}
