import type { PublicUser } from '../user/types.js';
export interface DiscordAuthRequest {
    /** Authorization code returned by Discord's OAuth2 flow. */
    code: string;
    /** Optional redirect URI used during code acquisition. */
    redirectUri?: string;
}
export interface DiscordAuthResponse {
    user: PublicUser;
    accessToken: string;
    refreshToken: string;
}
