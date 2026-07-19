import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import { googleOnlyProfile, validProfile } from '@/test/fixtures/profile.fixture';
import { ApiError } from '@/types/api/response';
import { confirmEmailChange, requestEmailChange } from '../../actions/profileApi';
import { EmailChangeSection } from '../EmailChangeSection';

jest.mock('../../actions/profileApi');
const requestEmailChangeMock = jest.mocked(requestEmailChange);
const confirmEmailChangeMock = jest.mocked(confirmEmailChange);

async function typeCode(code: string) {
  const user = userEvent.setup();
  for (let i = 0; i < code.length; i++) {
    await user.type(screen.getByLabelText(`Digit ${i + 1}`), code[i] as string);
  }
  return user;
}

describe('EmailChangeSection', () => {
  beforeEach(() => {
    requestEmailChangeMock.mockClear();
    confirmEmailChangeMock.mockClear();
  });

  it('shows the current email with a Change button by default', () => {
    render(<EmailChangeSection profile={validProfile} onUpdated={jest.fn()} />);

    expect(screen.getByDisplayValue(validProfile.email)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
  });

  it('hides the Change button and shows an explanation for a Google-linked account', () => {
    render(<EmailChangeSection profile={googleOnlyProfile} onUpdated={jest.fn()} />);

    expect(screen.getByDisplayValue(googleOnlyProfile.email)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /change/i })).not.toBeInTheDocument();
    expect(screen.getByText(/managed by Google/i)).toBeInTheDocument();
  });

  it('requests a code for the new address, then confirms it and updates the profile', async () => {
    const user = userEvent.setup();
    const onUpdated = jest.fn();
    requestEmailChangeMock.mockResolvedValueOnce({
      message: 'Verification code sent.',
      expiresInSeconds: 60,
    });
    const updatedUser = { ...validProfile, email: 'new@example.com' };
    confirmEmailChangeMock.mockResolvedValueOnce({
      message: 'Email updated successfully.',
      user: updatedUser,
    });

    render(<EmailChangeSection profile={validProfile} onUpdated={onUpdated} />);

    await user.click(screen.getByRole('button', { name: /change/i }));
    await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
    await user.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => {
      expect(requestEmailChangeMock).toHaveBeenCalledWith({ newEmail: 'new@example.com' });
    });

    // The old email must still be shown while verification is pending.
    expect(screen.getByText(validProfile.email)).toBeInTheDocument();

    await typeCode('123456');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(confirmEmailChangeMock).toHaveBeenCalledWith({ otp: '123456' });
    });
    expect(onUpdated).toHaveBeenCalledWith(updatedUser);
  });

  it('shows an error and keeps the old email active when the code is wrong', async () => {
    const user = userEvent.setup();
    requestEmailChangeMock.mockResolvedValueOnce({
      message: 'Verification code sent.',
      expiresInSeconds: 60,
    });
    confirmEmailChangeMock.mockRejectedValueOnce(new ApiError('Invalid code.', 400));

    render(<EmailChangeSection profile={validProfile} onUpdated={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /change/i }));
    await user.type(screen.getByLabelText(/new email/i), 'new@example.com');
    await user.click(screen.getByRole('button', { name: /send code/i }));

    await waitFor(() => expect(requestEmailChangeMock).toHaveBeenCalled());

    await typeCode('000000');
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText(/invalid code/i)).toBeInTheDocument();
  });
});
