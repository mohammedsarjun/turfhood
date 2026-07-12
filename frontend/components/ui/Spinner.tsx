import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin rounded-full border-current border-t-transparent', {
  variants: {
    size: {
      sm: 'h-4 w-4 border-2',
      md: 'h-6 w-6 border-2',
      lg: 'h-10 w-10 border-[3px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  /** Accessible label announced to screen readers. */
  label?: string;
}

/**
 * Spinner primitive — an indeterminate loading indicator.
 *
 * @param size - `sm` | `md` | `lg`.
 * @param label - Accessible label (defaults to "Loading").
 */
export function Spinner({ className, size, label = 'Loading', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
