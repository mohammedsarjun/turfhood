export interface DiscordProfile {
  discordId: string;
  email: string;
  name: string;
  avatarUrl?: string | undefined;
  emailVerified: boolean;
}

export interface IDiscordAuthService {
  /** Exchanges an OAuth authorization code for a verified Discord profile. Throws DiscordTokenInvalidError on failure. */
  verifyAndGetProfile(code: string, redirectUri?: string): Promise<DiscordProfile>;
}
