'use client';

import { useCallback, useMemo, useState } from 'react';
import type { AdminTurfSummaryDTO } from '@turfhood/shared';
import { DataTable, Pagination, SearchInput, type ColumnDef } from '@/components/table';
import { Badge, Button, Heading, Text, useToast } from '@/components/ui';
import { ApiError } from '@/types/api/response';
import {
  listAdminTurfs,
  suspendAdminTurf,
  unsuspendAdminTurf,
} from '../actions/adminManagementApi';
import { useAdminManagementList } from '../hooks/useAdminManagementList';
import { SuspendReasonModal } from './SuspendReasonModal';

export function AdminTurfsPage() {
  const loader = useCallback(listAdminTurfs, []);
  const { items, page, totalPages, search, setSearch, isLoading, error, setPage, refetch } =
    useAdminManagementList(loader, 'Failed to load turfs.');
  const { showToast } = useToast();
  const [selectedTurf, setSelectedTurf] = useState<AdminTurfSummaryDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unsuspendingId, setUnsuspendingId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<AdminTurfSummaryDTO>[]>(
    () => [
      { header: 'Turf', accessor: (turf) => turf.name },
      { header: 'Owner', accessor: (turf) => turf.ownerEmail ?? turf.ownerName },
      {
        header: 'Location',
        accessor: (turf) => `${turf.address.city}, ${turf.address.state}`,
      },
      {
        header: 'Status',
        accessor: (turf) => (
          <Badge variant={turf.status === 'suspended' ? 'destructive' : 'success'}>
            {turf.status}
          </Badge>
        ),
      },
      {
        header: 'Actions',
        accessor: (turf) =>
          turf.status === 'suspended' ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={unsuspendingId === turf.id}
              onClick={() => void handleUnsuspend(turf)}
            >
              Unsuspend
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedTurf(turf)}>
              Suspend
            </Button>
          ),
      },
    ],
    [unsuspendingId],
  );

  const handleSuspend = async (reason: string) => {
    if (!selectedTurf) return;
    setIsSubmitting(true);
    try {
      await suspendAdminTurf(selectedTurf.id, reason);
      showToast('Turf suspended successfully.');
      setSelectedTurf(null);
      await refetch();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to suspend turf.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsuspend = async (turf: AdminTurfSummaryDTO) => {
    setUnsuspendingId(turf.id);
    try {
      await unsuspendAdminTurf(turf.id);
      showToast('Turf unsuspended successfully.');
      await refetch();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to unsuspend turf.', 'error');
    } finally {
      setUnsuspendingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
        <Heading variant="h1">Turfs</Heading>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search turfs" />
      </div>
      {error && <Text className="mb-3 text-destructive">{error}</Text>}
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(turf) => turf.id}
        isLoading={isLoading}
        emptyMessage="No turfs found."
      />
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        disabled={isLoading}
        hidden={items.length === 0}
      />
      <SuspendReasonModal
        open={Boolean(selectedTurf)}
        title="Suspend turf"
        subjectName={selectedTurf?.name ?? ''}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedTurf(null)}
        onSubmit={handleSuspend}
      />
    </div>
  );
}
