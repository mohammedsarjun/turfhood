import { CourtManagementPage } from '@/features/court-management';

export default async function CourtsPage({ params }: { params: Promise<{ turfId: string }> }) {
  const { turfId } = await params;
  return <CourtManagementPage turfId={turfId} />;
}
