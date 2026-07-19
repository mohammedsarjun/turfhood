export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export interface IGoogleAuthService {
  /** Exchanges a popup auth-code for a verified Google profile. Throws GoogleTokenInvalidError on failure. */
  verifyAndGetProfile(code: string): Promise<GoogleProfile>;
}
