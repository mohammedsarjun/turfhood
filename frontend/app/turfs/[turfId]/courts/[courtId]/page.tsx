import { PublicCourtDetailsPage } from '@/features/home/components/PublicCourtDetailsPage';

export default async function Page({ params }: { params: Promise<{ turfId: string; courtId: string }> }) {
  const { turfId, courtId } = await params;
  return <PublicCourtDetailsPage turfId={turfId} courtId={courtId} />;
}
