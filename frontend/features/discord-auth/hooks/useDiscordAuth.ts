'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DISCORD_OAUTH_CONSTANTS } from '@turfhood/shared';
import { discordAuth } from '../actions/discordAuthApi';
import { ApiError } from '@/types/api/response';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { getSafeAuthRedirect } from '@/lib/auth/redirect';

export function useDiscordAuth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextPath = getSafeAuthRedirect(searchParams.get('next'));

  const trigger = useCallback(() => {
    setError(null);
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI ||
      `${window.location.origin}/auth/discord/callback`;

    if (!clientId || clientId.startsWith('replace-with')) {
      setError('Discord Client ID is not configured.');
      return;
    }

    const discordAuthUrl = `${DISCORD_OAUTH_CONSTANTS.AUTHORIZE_URL}?client_id=${encodeURIComponent(
      clientId,
    )}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri,
    )}&scope=${encodeURIComponent(DISCORD_OAUTH_CONSTANTS.SCOPE)}`;

    // Attempt popup login flow first
    const width = 500;
    const height = 750;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      discordAuthUrl,
      'Discord Login',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes`,
    );

    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      // Popup blocked — fallback to full-page redirect
      window.location.href = discordAuthUrl;
      return;
    }

    setIsLoading(true);

    let codeReceived = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'DISCORD_AUTH_CODE') {
        codeReceived = true;
        if (timer) clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        const { code } = event.data;

        try {
          const result = await discordAuth({ code, redirectUri });
          setUser(result.user);
          router.replace(nextPath);
        } catch (caughtError) {
          if (caughtError instanceof ApiError) {
            setError(caughtError.message);
          } else {
            setError('Something went wrong with Discord sign-in.');
          }
        } finally {
          setIsLoading(false);
        }
      } else if (event.data?.type === 'DISCORD_AUTH_ERROR') {
        codeReceived = true;
        if (timer) clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        setError(event.data.error || 'Discord sign-in failed.');
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Poll to detect if user closed the popup window manually before finishing auth
    timer = setInterval(() => {
      if (popup.closed) {
        if (timer) clearInterval(timer);
        window.removeEventListener('message', handleMessage);
        if (!codeReceived) {
          setIsLoading((loading) => {
            if (loading) setError('Discord sign-in was cancelled or closed.');
            return false;
          });
        }
      }
    }, 1000);
  }, [nextPath, router, setUser]);

  return { trigger, isLoading, error };
}
