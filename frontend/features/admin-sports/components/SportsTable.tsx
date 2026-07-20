import { DataTable, Pagination, type ColumnDef } from '@/components/table';
import { Badge, Button } from '@/components/ui';
import type { SportsType } from '../types';

export interface SportsTableProps {
  items: SportsType[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (item: SportsType) => void;
  onToggleListed: (item: SportsType) => void;
  togglingId: string | null;
}

export function SportsTable({
  items,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onToggleListed,
  togglingId,
}: SportsTableProps) {
  const columns: ColumnDef<SportsType>[] = [
    { header: 'Name', accessor: (item) => item.name },
    {
      header: 'Icon',
      accessor: (item) =>
        item.icon ? (
          // eslint-disable-next-line @next/next/no-img-element -- arbitrary Cloudinary-hosted icon
          <img src={item.icon} alt="" className="h-8 w-8 rounded object-cover" />
        ) : (
          '—'
        ),
    },
    {
      header: 'Status',
      accessor: (item) => (
        <Badge variant={item.isListed ? 'success' : 'outline'}>
          {item.isListed ? 'Listed' : 'Unlisted'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (item) => (
        <div className="flex items-center" style={{ gap: 8 }}>
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={togglingId === item.id}
            onClick={() => onToggleListed(item)}
          >
            {item.isListed ? 'Unlist' : 'List'}
          </Button>
        </div>
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
        emptyMessage="No sports found."
      />
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </>
  );
}
