import { SearchInput } from '@/components/table';
import { Select } from '@/components/ui';

export interface SportsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  isListedFilter: boolean | undefined;
  onIsListedFilterChange: (value: boolean | undefined) => void;
}

export function SportsFilters({
  search,
  onSearchChange,
  isListedFilter,
  onIsListedFilterChange,
}: SportsFiltersProps) {
  return (
    <div className="flex items-center" style={{ gap: 12, marginBottom: 16 }}>
      <div style={{ maxWidth: 280 }}>
        <SearchInput
          placeholder="Search sports…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div style={{ maxWidth: 180 }}>
        <Select
          aria-label="Filter by status"
          value={isListedFilter === undefined ? 'all' : String(isListedFilter)}
          onChange={(event) => {
            const { value } = event.target;
            onIsListedFilterChange(value === 'all' ? undefined : value === 'true');
          }}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Listed', value: 'true' },
            { label: 'Unlisted', value: 'false' },
          ]}
        />
      </div>
    </div>
  );
}
