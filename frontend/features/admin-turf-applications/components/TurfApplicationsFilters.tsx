import { Select } from '@/components/ui';

export type StatusFilterValue = 'pending' | 'approved' | 'rejected' | undefined;

export interface TurfApplicationsFiltersProps {
  statusFilter: StatusFilterValue;
  onStatusFilterChange: (value: StatusFilterValue) => void;
}

export function TurfApplicationsFilters({
  statusFilter,
  onStatusFilterChange,
}: TurfApplicationsFiltersProps) {
  return (
    <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
      <div style={{ maxWidth: 200 }}>
        <Select
          aria-label="Filter by status"
          value={statusFilter ?? 'all'}
          onChange={(event) => {
            const { value } = event.target;
            onStatusFilterChange(value === 'all' ? undefined : (value as StatusFilterValue));
          }}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
        />
      </div>
    </div>
  );
}
