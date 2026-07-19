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
 */
export function useCountdown(expiresAt: number): UseCountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(() => computeSecondsLeft(expiresAt));

  useEffect(() => {
    const tick = () => setSecondsLeft(computeSecondsLeft(expiresAt));
    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [expiresAt]);

  return { secondsLeft, isExpired: secondsLeft <= 0 };
}
