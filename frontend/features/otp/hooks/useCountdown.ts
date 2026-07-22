'use client';

import { useEffect, useState } from 'react';

interface UseCountdownResult {
  secondsLeft: number;
  isExpired: boolean;
}

function computeSecondsLeft(expiresAt: number): number {
  return Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
}

/**
 * Tracks seconds remaining until an absolute `expiresAt` deadline (ms since epoch), rather
 * than naively decrementing a counter on each tick — keeps the displayed value accurate even
 * if the tab was backgrounded and timers were throttled.
 *
 * `expiresAt` is expected to come from the backend (initial page load, or a resend response),
 * so a browser refresh — which re-fetches the OTP session — naturally resumes with the true
 * remaining time instead of a client-trusted one.
 *
 * The first render (both the SSR pass and the client's pre-hydration pass) must produce
 * identical output, but `computeSecondsLeft` depends on `Date.now()`, which necessarily differs
 * between the server's render time and the client's — computing it eagerly here would trigger a
 * hydration mismatch. So the real value is only computed inside `useEffect`, which runs exclusively
 * on the client after hydration; both passes render the `null`-derived default beforehand.
 */
export function useCountdown(expiresAt: number): UseCountdownResult {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setSecondsLeft(computeSecondsLeft(expiresAt));
    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  return {
    secondsLeft: secondsLeft ?? 0,
    // Stays false until mounted, so the "Resend Code" button never flashes on
    // first paint before the real countdown has had a chance to compute.
    isExpired: secondsLeft !== null && secondsLeft <= 0,
  };
}
