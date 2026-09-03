import { memo, useMemo } from 'react';
import type { CourtDTO } from '@turfhood/shared';
import { DataTable, Pagination, type ColumnDef } from '@/components/table';
import { Badge } from '@/components/ui';
import Link from 'next/link';

interface CourtsTableProps {
  courts: CourtDTO[];
  sportNames: Record<string, string>;
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  turfId: string;
}

export const CourtsTable = memo(function CourtsTable({
  courts,
  sportNames,
  isLoading,
  page,
  totalPages,
  onPageChange,
  turfId,
}: CourtsTableProps) {
  const columns = useMemo<ColumnDef<CourtDTO>[]>(
    () => [
      {
        header: 'Court',
        accessor: (court) => {
          const cover = court.images.find((image) => image.isCover) ?? court.images[0];
          return (
            <div className="flex min-w-48 items-center gap-3">
              {cover && (
                // eslint-disable-next-line @next/next/no-img-element -- user-hosted court image
                <img src={cover.url} alt="" className="h-10 w-14 rounded object-cover" />
              )}
              <span className="min-w-0 break-words font-medium">{court.name}</span>
            </div>
          );
        },
      },
      {
        header: 'Sports',
        accessor: (court) => (
          <span className="block min-w-36 max-w-52 break-words">
            {court.sportTypeIds.map((id) => sportNames[id] ?? id).join(', ')}
          </span>
        ),
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
      {
        header: 'Actions',
        accessor: (court) => (
          <Link
            href={`/turf-portal/${turfId}/courts/${court.id}`}
            className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-medium hover:bg-muted"
          >
            View
          </Link>
        ),
      },
    ],
    [sportNames, turfId],
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
