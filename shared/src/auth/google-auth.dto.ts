import type { PublicUser } from '../user/types.js';

export interface GoogleAuthRequest {
  /** Authorization code returned by Google's popup auth-code flow. */
  code: string;
}

export interface GoogleAuthResponse {
  user: PublicUser;
  accessToken: string;
}
