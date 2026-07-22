import { GoogleTokenInvalidError } from '../../src/domain/user/errors/GoogleTokenInvalidError.js';
import type {
  GoogleProfile,
  IGoogleAuthService,
} from '../../src/domain/user/services/IGoogleAuthService.js';

/**
 * In-memory stand-in for the real google-auth-library-backed GoogleAuthService.
 * Pass a profile to simulate a successful exchange; omit it to simulate an invalid/expired code.
 */
export class FakeGoogleAuthService implements IGoogleAuthService {
  constructor(private readonly profile: GoogleProfile | null = null) {}

  async verifyAndGetProfile(): Promise<GoogleProfile> {
    if (!this.profile) {
      throw new GoogleTokenInvalidError();
    }
    return this.profile;
  }
}
