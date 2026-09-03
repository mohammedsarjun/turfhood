import { BookingDetailsPage } from '@/features/bookings';
export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingDetailsPage id={bookingId} />;
}
