import dynamic from 'next/dynamic';
import { PageLoader } from '@/components/shared';

const AdminUsersPage = dynamic(
  () => import('@/features/admin-management').then((m) => ({ default: m.AdminUsersPage })),
  { loading: () => <PageLoader /> },
);

export default function UsersPage() {
  return <AdminUsersPage />;
}
