import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex h-11 w-full rounded-md border bg-transparent pl-3 pr-3 py-2 text-sm text-foreground ' +
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
  },
);

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
  /** Error message; also switches the field into its error styling. */
  errorMessage?: string;
  /** Icon rendered inside the field's left edge. */
  icon?: ReactNode;
  /** Content rendered inside the field's right edge (e.g. a password-visibility toggle). */
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, id, icon, rightSlot, style, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hasError = Boolean(error) || Boolean(errorMessage);

    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span
              className="pointer-events-none absolute inset-y-0 flex items-center text-muted-foreground"
              style={{ left: 12 }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(inputVariants({ error: hasError }), className)}
            style={{
              paddingLeft: icon ? 36 : undefined,
              paddingRight: rightSlot ? 36 : undefined,
              ...style,
            }}
            aria-invalid={hasError || undefined}
            aria-describedby={errorMessage ? errorId : undefined}
            {...props}
          />
          {rightSlot && (
            <span className="absolute inset-y-0 flex items-center" style={{ right: 12 }}>
              {rightSlot}
            </span>
          )}
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

Input.displayName = 'Input';
