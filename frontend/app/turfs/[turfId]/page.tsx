import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const TurfDetailPage = dynamic(
  () =>
    import('@/features/home/components/TurfDetailPage').then((m) => ({
      default: m.TurfDetailPage,
    })),
  { loading: () => <PageLoader /> },
);

export default async function Page({ params }: { params: Promise<{ turfId: string }> }) {
  const { turfId } = await params;
  return <TurfDetailPage turfId={turfId} />;
}
