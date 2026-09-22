export const DISCORD_OAUTH_CONSTANTS = {
  AUTHORIZE_URL: 'https://discord.com/oauth2/authorize',
  TOKEN_URL: 'https://discord.com/api/v10/oauth2/token',
  USER_ME_URL: 'https://discord.com/api/v10/users/@me',
  AVATAR_BASE_URL: 'https://cdn.discordapp.com/avatars',
  SCOPE: 'identify email',
} as const;
