import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const selectVariants = cva(
  'flex h-11 w-full appearance-none rounded-md border bg-transparent pl-3 pr-9 py-2 text-sm text-foreground ' +
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      error: {
        true: 'border-destructive focus-visible:ring-destructive',
        false: 'border-input',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends SelectHTMLAttributes<HTMLSelectElement>, VariantProps<typeof selectVariants> {
  /** Error message; also switches the field into its error styling. */
  errorMessage?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, errorMessage, id, options, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hasError = Boolean(error) || Boolean(errorMessage);

    return (
      <div className="w-full">
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(selectVariants({ error: hasError }), className)}
            aria-invalid={hasError || undefined}
            aria-describedby={errorMessage ? errorId : undefined}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-muted-foreground"
            style={{ right: 12 }}
          />
        </div>
        {errorMessage && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';
