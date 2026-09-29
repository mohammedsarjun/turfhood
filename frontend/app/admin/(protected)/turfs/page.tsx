import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminTurfsPage = dynamic(
  () => import('@/features/admin-management').then((m) => ({ default: m.AdminTurfsPage })),
  { loading: () => <PageLoader /> },
);

export default function TurfsPage() {
  return <AdminTurfsPage />;
}
