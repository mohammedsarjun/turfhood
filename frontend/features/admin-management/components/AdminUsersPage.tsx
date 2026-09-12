'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AdminUserSummaryDTO } from '@turfhood/shared';
import { DataTable, Pagination, SearchInput, type ColumnDef } from '@/components/table';
import { Badge, Button, Heading, Text, useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import {
  listAdminUsers,
  suspendAdminUser,
  unsuspendAdminUser,
} from '../actions/adminManagementApi';
import { useAdminManagementList } from '../hooks/useAdminManagementList';
import { SuspendReasonModal } from './SuspendReasonModal';

export function AdminUsersPage() {
  const loader = useCallback(listAdminUsers, []);
  const { items, page, totalPages, search, setSearch, isLoading, error, setPage, refetch } =
    useAdminManagementList(loader, 'Failed to load users.');
  const { showToast } = useToast();
  const [selectedUser, setSelectedUser] = useState<AdminUserSummaryDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unsuspendingId, setUnsuspendingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<AdminUserSummaryDTO>[]>(
    () => [
      { header: 'Name', accessor: (user) => user.name },
      { header: 'Email', accessor: (user) => user.email ?? '-' },
      { header: 'Phone', accessor: (user) => user.phone ?? '-' },
      { header: 'Roles', accessor: (user) => user.roles.join(', ') },
      {
        header: 'Status',
        accessor: (user) => (
          <Badge variant={user.status === 'suspended' ? 'destructive' : 'success'}>
            {user.status}
          </Badge>
        ),
      },
      {
        header: 'Actions',
        accessor: (user) =>
          user.status === 'suspended' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={unsuspendingId === user.id}
              onClick={() => void handleUnsuspend(user)}
            >
              Unsuspend
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
              Suspend
            </Button>
          ),
      },
    ],
    [unsuspendingId],
  );

  const handleSuspend = async (reason: string) => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await suspendAdminUser(selectedUser.id, reason);
      showToast('User suspended successfully.');
      setSelectedUser(null);
      await refetch();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to suspend user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsuspend = async (user: AdminUserSummaryDTO) => {
    setUnsuspendingId(user.id);
    try {
      await unsuspendAdminUser(user.id);
      showToast('User unsuspended successfully.');
      await refetch();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to unsuspend user.', 'error');
    } finally {
      setUnsuspendingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <Heading variant="h1">Users</Heading>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" />
      </div>
      {error && <Text className="mb-3 text-destructive">{error}</Text>}
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="No users found."
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        disabled={isLoading}
        hidden={items.length === 0}
      />
      <SuspendReasonModal
        open={Boolean(selectedUser)}
        title="Suspend user"
        subjectName={selectedUser?.name ?? ''}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedUser(null)}
        onSubmit={handleSuspend}
      />
    </div>
  );
}
