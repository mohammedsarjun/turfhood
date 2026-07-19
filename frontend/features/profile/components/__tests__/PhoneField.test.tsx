import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import { validProfile } from '@/test/fixtures/profile.fixture';
import { updatePhone } from '../../actions/profileApi';
import { PhoneField } from '../PhoneField';

jest.mock('../../actions/profileApi');
const updatePhoneMock = jest.mocked(updatePhone);

describe('PhoneField', () => {
  beforeEach(() => {
    updatePhoneMock.mockClear();
  });

  it('shows the current phone number as read-only text with an Edit button', () => {
    render(<PhoneField profile={validProfile} onUpdated={jest.fn()} />);

    expect(screen.getByText(validProfile.phone as string)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit phone number/i })).toBeInTheDocument();
  });

  it('shows an "Add phone number" prompt instead of an empty box when there is no phone on file', () => {
    render(<PhoneField profile={{ ...validProfile, phone: undefined }} onUpdated={jest.fn()} />);

    expect(screen.getByRole('button', { name: /add phone number/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/phone number/i)).not.toBeInTheDocument();
  });

  it('reveals the input from the "Add phone number" prompt and submits it', async () => {
    const user = userEvent.setup();
    const onUpdated = jest.fn();
    const updatedUser = { ...validProfile, phone: '9876543210' };
    updatePhoneMock.mockResolvedValueOnce({ user: updatedUser });

    render(<PhoneField profile={{ ...validProfile, phone: undefined }} onUpdated={onUpdated} />);

    await user.click(screen.getByRole('button', { name: /add phone number/i }));
    await user.type(screen.getByLabelText(/phone number/i), '9876543210');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(updatePhoneMock).toHaveBeenCalledWith({ phone: '9876543210' });
    });
    expect(onUpdated).toHaveBeenCalledWith(updatedUser);
  });
});
