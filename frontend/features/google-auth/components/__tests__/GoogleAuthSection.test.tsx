import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { GoogleAuthSection } from '../GoogleAuthSection';

describe('GoogleAuthSection', () => {
  it('calls onClick when the button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();

    render(<GoogleAuthSection onClick={onClick} />);
    await user.click(screen.getByRole('button', { name: /google/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and shows a connecting label while loading', () => {
    render(<GoogleAuthSection onClick={jest.fn()} loading />);

    const button = screen.getByRole('button', { name: /connecting/i });
    expect(button).toBeDisabled();
  });

  it('renders the error message when provided', () => {
    render(<GoogleAuthSection onClick={jest.fn()} error="Google sign-in was cancelled." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in was cancelled.');
  });

  it('renders no alert when there is no error', () => {
    render(<GoogleAuthSection onClick={jest.fn()} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
