import { memo, useMemo } from 'react';
import type { CourtDTO } from '@turfhood/shared';
import { DataTable, Pagination, type ColumnDef } from '@/components/table';
import { Badge } from '@/components/ui';

interface CourtsTableProps {
  courts: CourtDTO[];
  sportNames: Record<string, string>;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const CourtsTable = memo(function CourtsTable({
  courts,
  sportNames,
  isLoading,
  page,
  totalPages,
  onPageChange,
}: CourtsTableProps) {
  const columns = useMemo<ColumnDef<CourtDTO>[]>(
    () => [
      {
        header: 'Court',
        accessor: (court) => {
          const cover = court.images.find((image) => image.isCover) ?? court.images[0];
          return (
            <div className="flex items-center gap-3">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element -- user-hosted court image
                <img src={cover.url} alt="" className="h-10 w-14 rounded object-cover" />
              )}
              <span className="font-medium">{court.name}</span>
            </div>
          );
        },
      },
      {
        header: 'Sports',
        accessor: (court) => court.sportTypeIds.map((id) => sportNames[id] ?? id).join(', '),
      },
      { header: 'Capacity', accessor: (court) => court.capacity },
      { header: 'Slot', accessor: (court) => `${court.slotDurationMinutes} min` },
      {
        header: 'Status',
        accessor: (court) => (
          <Badge variant={court.status === 'active' ? 'success' : 'outline'}>
            {court.status.charAt(0).toUpperCase() + court.status.slice(1)}
          </Badge>
        ),
      },
    ],
    [sportNames],
  );

  return (
    <>
      <DataTable
        columns={columns}
        rows={courts}
        rowKey={(court) => court.id}
        isLoading={isLoading}
        emptyMessage="No courts found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
});
