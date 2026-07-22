import { DataTable, Pagination, type ColumnDef } from '@/components/table';
import { Badge, Button } from '@/components/ui';
import type { TurfApplicationSummary } from '@turfhood/shared';

export interface TurfApplicationsTableProps {
  items: TurfApplicationSummary[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReview: (application: TurfApplicationSummary) => void;
}

const STATUS_BADGE: Record<
  TurfApplicationSummary['status'],
  'success' | 'warning' | 'destructive'
> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
};

export function TurfApplicationsTable({
  items,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onReview,
}: TurfApplicationsTableProps) {
  const columns: ColumnDef<TurfApplicationSummary>[] = [
    { header: 'Turf Name', accessor: (item) => item.name },
    { header: 'City', accessor: (item) => `${item.address.city}, ${item.address.state}` },
    {
      header: 'Status',
      accessor: (item) => <Badge variant={STATUS_BADGE[item.status]}>{item.status}</Badge>,
    },
    { header: 'Submitted', accessor: (item) => new Date(item.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      accessor: (item) => (
        <Button type="button" variant="outline" size="sm" onClick={() => onReview(item)}>
          Review
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No applications found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
