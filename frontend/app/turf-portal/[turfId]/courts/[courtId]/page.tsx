import { CourtDetailsPage } from '@/features/court-management/components/CourtDetailsPage';

export default async function CourtPage({ params }: { params: Promise<{ turfId: string; courtId: string }> }) {
  const { turfId, courtId } = await params;
  return <CourtDetailsPage turfId={turfId} courtId={courtId} />;
}
