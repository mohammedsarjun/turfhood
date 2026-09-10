import { OAuth2Client } from 'google-auth-library';
import { injectable } from 'tsyringe';
import { GoogleTokenInvalidError } from '@domain/user/errors/GoogleTokenInvalidError';
import type { GoogleProfile, IGoogleAuthService } from '@domain/user/services/IGoogleAuthService';
import { env } from '@config/env';

/**
 * Exchanges the popup auth-code flow's `code` for tokens using the `postmessage` redirect
 * convention (no registered redirect URI needed), then verifies the resulting id_token —
 * that verification is what actually proves the profile came from Google, not just the exchange.
 */
@injectable()
export class GoogleAuthService implements IGoogleAuthService {
  private readonly client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );

  async verifyAndGetProfile(code: string): Promise<GoogleProfile> {
    try {
      const { tokens } = await this.client.getToken(code);

      if (!tokens.id_token) {
        throw new GoogleTokenInvalidError();
      }

      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload?.sub || !payload.email) {
        throw new GoogleTokenInvalidError();
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name ?? payload.email,
        ...(payload.picture ? { avatarUrl: payload.picture } : {}),
        emailVerified: payload.email_verified ?? false,
      };
    } catch (error) {
      if (error instanceof GoogleTokenInvalidError) {
        throw error;
      }
      throw new GoogleTokenInvalidError();
    }
  }
}
