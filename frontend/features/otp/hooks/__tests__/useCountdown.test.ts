import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at the seconds remaining until the given deadline', () => {
    const { result } = renderHook(({ expiresAt }) => useCountdown(expiresAt), {
      initialProps: { expiresAt: Date.now() + 60_000 },
    });
    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isExpired).toBe(false);
  });

  it('ticks down as time passes', () => {
    const { result } = renderHook(({ expiresAt }) => useCountdown(expiresAt), {
      initialProps: { expiresAt: Date.now() + 60_000 },
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.secondsLeft).toBeLessThanOrEqual(55);
  });

  it('marks isExpired true once the countdown reaches zero', () => {
    const { result } = renderHook(({ expiresAt }) => useCountdown(expiresAt), {
      initialProps: { expiresAt: Date.now() + 2000 },
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('re-syncs to a fresh deadline when expiresAt changes', () => {
    const { result, rerender } = renderHook(({ expiresAt }) => useCountdown(expiresAt), {
      initialProps: { expiresAt: Date.now() + 2000 },
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.isExpired).toBe(true);

    rerender({ expiresAt: Date.now() + 60_000 });

    expect(result.current.isExpired).toBe(false);
    expect(result.current.secondsLeft).toBe(60);
  });
});
