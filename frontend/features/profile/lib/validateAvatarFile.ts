const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export interface AvatarFileValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors backend/src/application/user/use-cases/UpdateAvatarUseCase.ts's server-side checks. */
export function validateAvatarFile(file: File): AvatarFileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, or WEBP images are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Image must be 5MB or smaller.' };
  }
  return { valid: true };
}
