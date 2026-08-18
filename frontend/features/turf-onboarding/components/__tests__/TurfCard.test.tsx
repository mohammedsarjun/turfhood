import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { TurfApplicationStatus } from '@turfhood/shared';
import { TurfCard } from '../TurfCard';
import type { TurfApplicationSummary } from '../../types';

const baseApplication: TurfApplicationSummary = {
  id: 'application_1',
  name: 'Green Turf Arena',
  address: {
    line1: '1 Main St',
    city: 'Chennai',
    cityCode: '1',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    country: 'India',
    countryCode: 'IN',
    pincode: '600002',
  },
  location: { type: 'Point', coordinates: [80.27, 13.08] },
  sportsOffered: [],
  amenities: [],
  documents: [],
  images: [
    { url: 'https://cdn.test/cover.jpg', isCover: true },
    { url: 'https://cdn.test/other.jpg', isCover: false },
  ],
  status: TurfApplicationStatus.PENDING,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('TurfCard', () => {
  it('shows the name, city/state, status badge, and cover image', () => {
    render(<TurfCard application={baseApplication} onClick={jest.fn()} />);

    expect(screen.getByText('Green Turf Arena')).toBeInTheDocument();
    expect(screen.getByText('Chennai, Tamil Nadu')).toBeInTheDocument();
    expect(screen.getByText(/pending review/i)).toBeInTheDocument();
    expect(screen.getByAltText('Green Turf Arena')).toHaveAttribute(
      'src',
      'https://cdn.test/cover.jpg',
    );
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<TurfCard application={baseApplication} onClick={onClick} />);

    await user.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalled();
  });

  it('does not crash for a legacy application predating the images field', () => {
    const legacyApplication = {
      ...baseApplication,
      images: undefined,
    } as unknown as TurfApplicationSummary;

    render(<TurfCard application={legacyApplication} onClick={jest.fn()} />);

    expect(screen.getByText('Green Turf Arena')).toBeInTheDocument();
  });

  it('shows the dashboard link only for approved turfs', () => {
    const { rerender } = render(
      <TurfCard
        application={{ ...baseApplication, status: TurfApplicationStatus.APPROVED }}
        onClick={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', { name: /view dashboard/i })).toHaveAttribute(
      'href',
      '/turf-portal/application_1/dashboard',
    );

    rerender(<TurfCard application={baseApplication} onClick={jest.fn()} />);
    expect(screen.queryByRole('link', { name: /view dashboard/i })).not.toBeInTheDocument();
  });
});
