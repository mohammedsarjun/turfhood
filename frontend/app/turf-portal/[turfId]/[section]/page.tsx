import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { PageLoader } from '@/components/shared';

const OwnerDashboardPage = dynamic(
  () => import('@/features/turf-portal').then((m) => ({ default: m.OwnerDashboardPage })),
  { loading: () => <PageLoader /> },
);

const OwnerRevenuePage = dynamic(
  () => import('@/features/turf-portal').then((m) => ({ default: m.OwnerRevenuePage })),
  { loading: () => <PageLoader /> },
);

const OwnerTurfManagementPage = dynamic(
  () => import('@/features/turf-portal').then((m) => ({ default: m.OwnerTurfManagementPage })),
  { loading: () => <PageLoader /> },
);

const OwnerBookingsPage = dynamic(
  () => import('@/features/bookings').then((m) => ({ default: m.OwnerBookingsPage })),
  { loading: () => <PageLoader /> },
);

const OwnerReviewsPage = dynamic(
  () => import('@/features/reviews').then((m) => ({ default: m.OwnerReviewsPage })),
  { loading: () => <PageLoader /> },
);

const OwnerOpenSessionsPage = dynamic(
  () => import('@/features/open-sessions').then((m) => ({ default: m.OwnerOpenSessionsPage })),
  { loading: () => <PageLoader /> },
);

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'my-turf': 'My Turf',
  courts: 'Court Management',
  bookings: 'Bookings',
  'open-sessions': 'Open Sessions',
  revenue: 'Revenue',
  customers: 'Customers',
  reviews: 'Reviews',
};

interface TurfPortalSectionPageProps {
  params: Promise<{ turfId: string; section: string }>;
}

export default async function TurfPortalSectionPage({ params }: TurfPortalSectionPageProps) {
  const { turfId, section } = await params;
  const title = SECTION_TITLES[section];
  if (!title) notFound();
  if (section === 'bookings') return <OwnerBookingsPage turfId={turfId} />;
  if (section === 'reviews') return <OwnerReviewsPage turfId={turfId} />;
  if (section === 'my-turf') return <OwnerTurfManagementPage turfId={turfId} />;
  if (section === 'dashboard') return <OwnerDashboardPage turfId={turfId} />;
  if (section === 'revenue') return <OwnerRevenuePage turfId={turfId} />;
  if (section === 'open-sessions') return <OwnerOpenSessionsPage turfId={turfId} />;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage your turf&apos;s {title.toLowerCase()} from here.
      </p>
    </div>
  );
}
