import { render, screen } from '@/test/test-utils';
import { googleOnlyProfile, validProfile } from '@/test/fixtures/profile.fixture';
import { PasswordSection } from '../PasswordSection';

jest.mock('../../actions/profileApi');

describe('PasswordSection', () => {
  it('renders the change-password form (current + new + confirm) for an account with a password', () => {
    render(<PasswordSection profile={validProfile} onUpdated={jest.fn()} />);

    expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
  });

  it('renders the set-password form (no current-password field) for a Google-only account', () => {
    render(<PasswordSection profile={googleOnlyProfile} onUpdated={jest.fn()} />);

    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /set password/i })).toBeInTheDocument();
    expect(screen.getByText(/currently signs in with Google only/i)).toBeInTheDocument();
  });
});
