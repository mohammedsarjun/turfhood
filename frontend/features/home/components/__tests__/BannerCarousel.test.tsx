import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test/test-utils';
import { BannerCarousel } from '../BannerCarousel';

const banners = [
  {
    id: '1',
    title: 'First banner',
    description: 'First description',
    imageUrl: 'https://cdn.test/1.webp',
    createdAt: '2026-01-01',
  },
  {
    id: '2',
    title: 'Second banner',
    description: 'Second description',
    imageUrl: 'https://cdn.test/2.webp',
    createdAt: '2026-01-02',
  },
];

describe('BannerCarousel', () => {
  it('lets the customer select a banner', async () => {
    const user = userEvent.setup();
    render(<BannerCarousel banners={banners} />);
    expect(screen.getByRole('heading', { name: 'First banner' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Show banner 2' }));
    expect(screen.getByRole('heading', { name: 'Second banner' })).toBeInTheDocument();
  });
});
