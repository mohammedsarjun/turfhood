// Manual mock for @react-oauth/google. Because this file lives in a __mocks__
// folder adjacent to node_modules, Jest applies it automatically to every
// test that imports it — no jest.mock() call needed anywhere. The real
// GoogleOAuthProvider loads Google's external GSI script and isn't
// meaningfully testable in jsdom, so component tests just need something
// that renders children without crashing; tests that care about the actual
// login flow (useGoogleAuth) override useGoogleLogin with their own
// jest.mock() factory, which takes precedence over this one.
import type { ReactNode } from 'react';

export function GoogleOAuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export const useGoogleLogin = jest.fn(() => jest.fn());
