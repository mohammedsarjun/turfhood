import { TurfDetailPage } from '@/features/home/components/TurfDetailPage';

export default async function Page({ params }: { params: Promise<{ turfId: string }> }) {
  const { turfId } = await params;
  return <TurfDetailPage turfId={turfId} />;
}
