export interface IPasswordResetTokenService {
  /** Generates a plaintext, URL-safe random token to email to the user. */
  generateToken(): string;
  /** Deterministically hashes a raw token for storage/lookup (not a slow salted hash — the token itself is high-entropy). */
  hashToken(rawToken: string): string;
}
