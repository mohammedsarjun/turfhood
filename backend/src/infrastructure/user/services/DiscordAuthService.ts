import { injectable } from 'tsyringe';
import { DISCORD_OAUTH_CONSTANTS } from '@turfhood/shared';
import { DiscordTokenInvalidError } from '@domain/user/errors/DiscordTokenInvalidError';
import type {
  DiscordProfile,
  IDiscordAuthService,
} from '@domain/user/services/IDiscordAuthService';
import { env } from '@config/env';

interface DiscordTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface DiscordUserResponse {
  id: string;
  username: string;
  global_name?: string | null;
  email?: string | null;
  verified?: boolean;
  avatar?: string | null;
}

@injectable()
export class DiscordAuthService implements IDiscordAuthService {
  async verifyAndGetProfile(code: string, redirectUri?: string): Promise<DiscordProfile> {
    try {
      const targetRedirectUri = redirectUri || env.DISCORD_REDIRECT_URI;
      const params = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: targetRedirectUri,
      });

      const tokenResponse = await fetch(DISCORD_OAUTH_CONSTANTS.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!tokenResponse.ok) {
        throw new DiscordTokenInvalidError();
      }

      const tokenData = (await tokenResponse.json()) as DiscordTokenResponse;

      if (!tokenData.access_token) {
        throw new DiscordTokenInvalidError();
      }

      const userResponse = await fetch(DISCORD_OAUTH_CONSTANTS.USER_ME_URL, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new DiscordTokenInvalidError();
      }

      const userData = (await userResponse.json()) as DiscordUserResponse;

      if (!userData?.id || !userData.email) {
        throw new DiscordTokenInvalidError();
      }

      const avatarUrl = userData.avatar
        ? `${DISCORD_OAUTH_CONSTANTS.AVATAR_BASE_URL}/${userData.id}/${userData.avatar}.png`
        : undefined;

      return {
        discordId: userData.id,
        email: userData.email,
        name: userData.global_name ?? userData.username,
        avatarUrl,
        emailVerified: userData.verified ?? false,
      };
    } catch (error) {
      if (error instanceof DiscordTokenInvalidError) {
        throw error;
      }
      throw new DiscordTokenInvalidError();
    }
  }
}
