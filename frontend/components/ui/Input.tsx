import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm text-foreground ' +
    'transition-colors placeholder:text-muted-foreground focus-visible:outline-none ' +
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
    'disabled:cursor-not-allowed disabled:opacity-50',
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
  }
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /** Error message; also switches the field into its error styling. */
  errorMessage?: string;
}


export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error) || Boolean(errorMessage);

    return (
      <div className="w-full">
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ error: hasError }), className)}
          aria-invalid={hasError || undefined}
          aria-describedby={errorMessage ? errorId : undefined}
          {...props}
        />
        {errorMessage && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
