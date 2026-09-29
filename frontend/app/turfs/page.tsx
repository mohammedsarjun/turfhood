import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AllTurfsPage = dynamic(
  () =>
    import('@/features/home/components/AllTurfsPage').then((m) => ({ default: m.AllTurfsPage })),
  { loading: () => <PageLoader /> },
);

export default function TurfsPage() {
  return <AllTurfsPage />;
}
