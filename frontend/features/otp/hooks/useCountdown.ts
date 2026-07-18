'use client';

import { useCallback, useEffect, useState } from 'react';

interface UseCountdownResult {
  secondsLeft: number;
  isExpired: boolean;
  reset: (seconds?: number) => void;
}

/**
 * Reads a persisted deadline verbatim — including one already in the past.
 * Returns null only when nothing has been stored yet, so a genuinely expired
 * deadline is preserved (not mistaken for "no deadline yet" and replaced
 * with a fresh one) across refreshes.
 */
function readStoredDeadline(storageKey: string): number | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(storageKey);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Tracks seconds remaining until a deadline computed from Date.now(), rather
 * than naively decrementing a counter on each tick — keeps the displayed
 * value accurate even if the tab was backgrounded and timers were throttled.
 *
 * When `storageKey` is given, the deadline is persisted to sessionStorage so
 * a browser refresh resumes the same countdown — or the same expired state —
 * instead of restarting it. Read lazily in an effect (not the initial state)
 * so the server-rendered and first-client-render output still match and
 * hydration stays clean.
 */
export function useCountdown(initialSeconds: number, storageKey?: string): UseCountdownResult {
  const [deadline, setDeadline] = useState(() => Date.now() + initialSeconds * 1000);
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!storageKey) return;
    const stored = readStoredDeadline(storageKey);
    if (stored !== null) {
      // Adopt the stored deadline as-is, even if it's already in the past —
      // that's a genuinely expired OTP and must stay expired until resend().
      setDeadline(stored);
    } else {
      window.sessionStorage.setItem(storageKey, String(deadline));
    }
    // Only re-run when the storage key itself changes (e.g. a different email/purpose).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    const tick = () => {
      setSecondsLeft(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    tick();
    const intervalId = setInterval(tick, 250);
    return () => clearInterval(intervalId);
  }, [deadline]);

  const reset = useCallback(
    (seconds: number = initialSeconds) => {
      const newDeadline = Date.now() + seconds * 1000;
      setDeadline(newDeadline);
      if (storageKey && typeof window !== 'undefined') {
        window.sessionStorage.setItem(storageKey, String(newDeadline));
      }
    },
    [initialSeconds, storageKey]
  );

  return { secondsLeft, isExpired: secondsLeft <= 0, reset };
}
