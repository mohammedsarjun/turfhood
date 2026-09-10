import { Button } from '@/components/ui';

export interface PaginationProps {
  disabled?: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Simple prev/next pager shared by every admin list page. */
export function Pagination({ page, totalPages, onPageChange, disabled = false }: PaginationProps) {
  return (
    <div className="flex items-center justify-between" style={{ marginTop: 12 }}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Prev
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {Math.max(1, totalPages)}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
