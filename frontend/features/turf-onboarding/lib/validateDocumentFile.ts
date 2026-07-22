const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export interface DocumentFileValidationResult {
  valid: boolean;
  error?: string;
}

/** Mirrors the backend's SubmitTurfOwnerApplicationUseCase checks. */
export function validateDocumentFile(file: File): DocumentFileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, WEBP, or PDF files are allowed.' };
  }
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'Each document must be 5MB or smaller.' };
  }
  return { valid: true };
}
