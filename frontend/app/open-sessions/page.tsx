import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const OpenSessionsPage = dynamic(
  () => import('@/features/open-sessions').then((m) => ({ default: m.OpenSessionsPage })),
  { loading: () => <PageLoader /> },
);

export default function Page() {
  return <OpenSessionsPage />;
}
