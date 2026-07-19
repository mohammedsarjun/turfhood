import { render, screen } from '@/test/test-utils';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders the image when src is provided', () => {
    render(<Avatar src="https://cdn.test/avatar.png" alt="Jordan Lee" />);

    const img = screen.getByRole('img', { name: 'Jordan Lee' });
    expect(img).toHaveAttribute('src', 'https://cdn.test/avatar.png');
  });

  it('renders an anonymous placeholder icon when there is no src', () => {
    const { container } = render(<Avatar />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
