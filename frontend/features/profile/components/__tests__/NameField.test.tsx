import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@/test/test-utils';
import { validProfile } from '@/test/fixtures/profile.fixture';
import { updateName } from '../../actions/profileApi';
import { NameField } from '../NameField';

jest.mock('../../actions/profileApi');
const updateNameMock = jest.mocked(updateName);

describe('NameField', () => {
  beforeEach(() => {
    updateNameMock.mockClear();
  });

  it('renders the current name as read-only text with an Edit button, not an editable input', () => {
    render(<NameField profile={validProfile} onUpdated={jest.fn()} />);

    expect(screen.getByText(validProfile.name)).toBeInTheDocument();
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit name/i })).toBeInTheDocument();
  });

  it('reveals the editable input only after clicking Edit, and submits on Save', async () => {
    const user = userEvent.setup();
    const onUpdated = jest.fn();
    const updatedUser = { ...validProfile, name: 'New Name' };
    updateNameMock.mockResolvedValueOnce({ user: updatedUser });

    render(<NameField profile={validProfile} onUpdated={onUpdated} />);

    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /edit name/i }));
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/^name$/i));
    await user.type(screen.getByLabelText(/^name$/i), 'New Name');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(updateNameMock).toHaveBeenCalledWith({ name: 'New Name' });
    });
    expect(onUpdated).toHaveBeenCalledWith(updatedUser);
    // Returns to read-only display after a successful save.
    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
  });

  it('cancels back to read-only view without submitting', async () => {
    const user = userEvent.setup();
    render(<NameField profile={validProfile} onUpdated={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit name/i }));
    await user.clear(screen.getByLabelText(/^name$/i));
    await user.type(screen.getByLabelText(/^name$/i), 'Some Draft');
    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByLabelText(/^name$/i)).not.toBeInTheDocument();
    expect(screen.getByText(validProfile.name)).toBeInTheDocument();
    expect(updateNameMock).not.toHaveBeenCalled();
  });

  it('blocks submission and shows an error for a too-short name', async () => {
    const user = userEvent.setup();
    render(<NameField profile={validProfile} onUpdated={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: /edit name/i }));
    await user.clear(screen.getByLabelText(/^name$/i));
    await user.type(screen.getByLabelText(/^name$/i), 'A');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/at least 2 characters/i)).toBeInTheDocument();
    expect(updateNameMock).not.toHaveBeenCalled();
  });
});
