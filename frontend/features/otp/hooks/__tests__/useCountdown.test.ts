import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts at the given number of seconds', () => {
    const { result } = renderHook(() => useCountdown(60));
    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isExpired).toBe(false);
  });

  it('ticks down as time passes', () => {
    const { result } = renderHook(() => useCountdown(60));

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.secondsLeft).toBeLessThanOrEqual(55);
  });

  it('marks isExpired true once the countdown reaches zero', () => {
    const { result } = renderHook(() => useCountdown(2));

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isExpired).toBe(true);
  });

  it('reset() restores the countdown to a fresh window', () => {
    const { result } = renderHook(() => useCountdown(2));

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.isExpired).toBe(true);

    act(() => {
      result.current.reset(60);
    });
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current.isExpired).toBe(false);
    expect(result.current.secondsLeft).toBe(60);
  });
});
