import { renderHook, waitFor, act } from '@testing-library/react';
import { useGoogleLogin } from '@react-oauth/google';
import { push, replace } from '@/__mocks__/next/navigation';
import { ApiError } from '@/types/api/response';
import { googleAuth } from '../../actions/googleAuthApi';
import { useGoogleAuth } from '../useGoogleAuth';
import { useCurrentUser } from '../../../../hooks/useCurrentUser';

jest.mock('../../actions/googleAuthApi');
jest.mock('../../../../hooks/useCurrentUser');
jest.mock('@react-oauth/google', () => ({
  useGoogleLogin: jest.fn(),
}));

const googleAuthMock = jest.mocked(googleAuth);
const useGoogleLoginMock = jest.mocked(useGoogleLogin);
const useCurrentUserMock = jest.mocked(useCurrentUser);
const setUserMock = jest.fn();

describe('useGoogleAuth', () => {
  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    googleAuthMock.mockClear();
    useGoogleLoginMock.mockClear();
    setUserMock.mockClear();
    useCurrentUserMock.mockReturnValue({
      user: null,
      isHydrated: true,
      setUser: setUserMock,
      clearUser: jest.fn(),
    });
  });

  it('exchanges the code and redirects home on success', async () => {
    googleAuthMock.mockResolvedValueOnce({
      user: {
        id: 'user_1',
        name: 'Jordan Lee',
        email: 'jordan@example.com',
        roles: ['customer'],
        isVerified: true,
        status: 'active',
        createdAt: new Date('2026-01-01').toISOString(),
        hasPassword: false,
        authProviders: ['google'],
      },
      accessToken: 'token_123',
      refreshToken: 'refresh_token_123',
    });

    const { result } = renderHook(() => useGoogleAuth());
    const options = useGoogleLoginMock.mock.calls[0]?.[0] as {
      onSuccess: (response: { code: string }) => Promise<void>;
    };

    await act(async () => {
      await options.onSuccess({ code: 'auth-code' });
    });

    expect(googleAuthMock).toHaveBeenCalledWith({ code: 'auth-code' });
    expect(setUserMock).toHaveBeenCalledWith(expect.objectContaining({ id: 'user_1' }));
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/');
    });
    expect(push).not.toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('surfaces an ApiError message when the exchange fails', async () => {
    googleAuthMock.mockRejectedValueOnce(new ApiError('Google sign-in failed.', 401));

    const { result } = renderHook(() => useGoogleAuth());
    const options = useGoogleLoginMock.mock.calls[0]?.[0] as {
      onSuccess: (response: { code: string }) => Promise<void>;
    };

    await act(async () => {
      await options.onSuccess({ code: 'auth-code' });
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Google sign-in failed.');
    });
    expect(replace).not.toHaveBeenCalled();
  });

  it('shows a cancellation error when the Google popup reports an error', () => {
    const { result } = renderHook(() => useGoogleAuth());
    const options = useGoogleLoginMock.mock.calls[0]?.[0] as { onError: () => void };

    act(() => {
      options.onError();
    });

    expect(result.current.error).toMatch(/cancelled or failed/i);
  });
});
