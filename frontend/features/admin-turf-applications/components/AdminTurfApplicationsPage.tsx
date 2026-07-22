'use client';

import { useState } from 'react';
import { Heading } from '@/components/ui';
import type { TurfApplicationSummary } from '@turfhood/shared';
import { useTurfApplicationsList } from '../hooks/useTurfApplicationsList';
import { ApplicationReviewModal } from './ApplicationReviewModal';
import { TurfApplicationsFilters } from './TurfApplicationsFilters';
import { TurfApplicationsTable } from './TurfApplicationsTable';

export function AdminTurfApplicationsPage() {
  const { items, totalPages, page, setPage, statusFilter, setStatusFilter, isLoading, refetch } =
    useTurfApplicationsList();
  const [selected, setSelected] = useState<TurfApplicationSummary | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Heading variant="h1">Turf Owner Applications</Heading>
      </div>

      <TurfApplicationsFilters statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

      <TurfApplicationsTable
        items={items}
        isLoading={isLoading}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        onReview={setSelected}
      />

      <ApplicationReviewModal
        application={selected}
        onClose={() => setSelected(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
