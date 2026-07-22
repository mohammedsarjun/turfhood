import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { TurfImageGallery } from '../TurfImageGallery';

const images = [
  { url: 'https://cdn.test/cover.jpg', isCover: true },
  { url: 'https://cdn.test/second.jpg', isCover: false },
  { url: 'https://cdn.test/third.jpg', isCover: false },
];

describe('TurfImageGallery', () => {
  it('shows a placeholder icon when there are no images', () => {
    const { container } = render(<TurfImageGallery images={[]} altText="Green Turf" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows the cover photo as the main image and does not render a thumbnail strip for a single image', () => {
    render(<TurfImageGallery images={[images[0]]} altText="Green Turf" />);
    expect(screen.getByAltText('Green Turf')).toHaveAttribute('src', images[0].url);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('defaults the main image to the cover photo, with the rest as clickable thumbnails', () => {
    render(<TurfImageGallery images={images} altText="Green Turf" />);

    expect(screen.getByAltText('Green Turf')).toHaveAttribute('src', images[0].url);
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('makes a clicked thumbnail the new main image', async () => {
    const user = userEvent.setup();
    render(<TurfImageGallery images={images} altText="Green Turf" />);

    await user.click(screen.getByRole('button', { name: /show photo 3/i }));

    expect(screen.getByAltText('Green Turf')).toHaveAttribute('src', images[2].url);
  });
});
