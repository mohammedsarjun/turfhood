'use client';

import { useGoogleAuth } from '@/features/google-auth';
import { useDiscordAuth } from '@/features/discord-auth';

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

export function SocialAuthSection() {
  const googleAuth = useGoogleAuth();
  const discordAuth = useDiscordAuth();

  const activeError = googleAuth.error || discordAuth.error;

  return (
    <div style={{ marginTop: 24 }}>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => googleAuth.trigger()}
          disabled={googleAuth.isLoading || discordAuth.isLoading}
          className="group relative flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 shadow-sm active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ gap: 8 }}
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <GoogleIcon />
          </span>
          <span>{googleAuth.isLoading ? 'Google…' : 'Google'}</span>
        </button>

        <button
          type="button"
          onClick={() => discordAuth.trigger()}
          disabled={googleAuth.isLoading || discordAuth.isLoading}
          className="group relative flex h-11 w-full items-center justify-center rounded-lg border border-[#5865F2]/30 bg-[#5865F2]/10 text-sm font-medium text-[#5865F2] hover:bg-[#5865F2] hover:text-white dark:bg-[#5865F2]/20 dark:text-[#7983F5] dark:hover:bg-[#5865F2] dark:hover:text-white transition-all duration-200 shadow-sm hover:shadow-[#5865F2]/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ gap: 8 }}
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <DiscordIcon />
          </span>
          <span>{discordAuth.isLoading ? 'Discord…' : 'Discord'}</span>
        </button>
      </div>

      {activeError && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 text-xs text-destructive"
          style={{
            marginTop: 12,
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: 8,
          }}
        >
          {activeError}
        </p>
      )}

      <div className="flex items-center" style={{ marginTop: 20, marginBottom: 20, gap: 12 }}>
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
