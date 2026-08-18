import { notFound } from 'next/navigation';

const SECTION_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  'my-turf': 'My Turf',
  courts: 'Court Management',
  bookings: 'Bookings',
  slots: 'Slot Management',
  revenue: 'Revenue',
  customers: 'Customers',
  reviews: 'Reviews',
};

interface TurfPortalSectionPageProps {
  params: Promise<{ section: string }>;
}

export default async function TurfPortalSectionPage({ params }: TurfPortalSectionPageProps) {
  const { section } = await params;
  const title = SECTION_TITLES[section];
  if (!title) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage your turf&apos;s {title.toLowerCase()} from here.
      </p>
    </div>
  );
}
