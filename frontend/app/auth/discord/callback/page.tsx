'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { discordAuth } from '@/features/discord-auth/actions/discordAuthApi';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ApiError } from '@/types/api/response';
import { Loader2 } from 'lucide-react';

function DiscordCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useCurrentUser();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'DISCORD_AUTH_ERROR', error: 'Discord authentication was denied or cancelled.' },
          window.location.origin,
        );
        window.close();
        return;
      }
      setError('Discord authorization was denied or cancelled.');
      return;
    }

    if (!code) {
      if (window.opener) {
        window.opener.postMessage(
          { type: 'DISCORD_AUTH_ERROR', error: 'No authorization code received from Discord.' },
          window.location.origin,
        );
        window.close();
        return;
      }
      setError('No authorization code provided.');
      return;
    }

    // Popup flow: Notify opener window
    if (window.opener) {
      window.opener.postMessage({ type: 'DISCORD_AUTH_CODE', code }, window.location.origin);
      window.close();
      return;
    }

    // Full-page redirect fallback flow
    const redirectUri =
      process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ||
      `${window.location.origin}/auth/discord/callback`;

    discordAuth({ code, redirectUri })
      .then((result) => {
        setUser(result.user);
        router.replace('/');
      })
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('Failed to complete Discord sign-in.');
        }
      });
  }, [router, searchParams, setUser]);

  return (
    <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card shadow-lg text-center flex flex-col items-center">
      {error ? (
        <>
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4 text-xl font-bold">
            !
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Authentication Error</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Sign In
          </button>
        </>
      ) : (
        <>
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Authenticating with Discord</h2>
          <p className="text-sm text-muted-foreground">Please wait while we log you into TurfHood…</p>
        </>
      )}
    </div>
  );
}

export default function DiscordCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background text-foreground">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 rounded-xl border border-border bg-card shadow-lg text-center flex flex-col items-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Loading Callback</h2>
          </div>
        }
      >
        <DiscordCallbackContent />
      </Suspense>
    </div>
  );
}
