import { forwardRef, type ElementType, type HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const headingVariants = cva('text-foreground', {
  variants: {
    variant: {
      display: 'text-4xl font-medium leading-10',
      h1: 'text-2xl font-medium leading-8',
      h2: 'text-lg font-medium leading-7',
    },
  },
  defaultVariants: {
    variant: 'h1',
  },
});

type HeadingVariant = NonNullable<VariantProps<typeof headingVariants>['variant']>;

const headingTag: Record<HeadingVariant, ElementType> = {
  display: 'h1',
  h1: 'h1',
  h2: 'h2',
};

export interface HeadingProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  /** Overrides the rendered element (defaults based on `variant`). */
  as?: ElementType;
}

/**
 * Heading primitive covering the Display / Heading 1 / Heading 2 roles.
 *
 * @param variant - `display` | `h1` | `h2`. Determines both styling and the default tag.
 * @param as - Overrides the rendered element without changing styling.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, variant: variantProp, as, ...props }, ref) => {
    const variant = variantProp ?? 'h1';
    const Comp = as ?? headingTag[variant];
    return <Comp ref={ref} className={cn(headingVariants({ variant }), className)} {...props} />;
  }
);
Heading.displayName = 'Heading';

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-sm font-normal leading-5 text-muted-foreground',
      caption: 'text-xs font-normal leading-4 text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type TextVariant = NonNullable<VariantProps<typeof textVariants>['variant']>;

const textTag: Record<TextVariant, ElementType> = {
  body: 'p',
  caption: 'span',
};

export interface TextProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  /** Overrides the rendered element (defaults based on `variant`). */
  as?: ElementType;
}

/**
 * Text primitive covering the Body / Caption roles.
 *
 * @param variant - `body` | `caption`. Determines both styling and the default tag.
 * @param as - Overrides the rendered element without changing styling.
 */
export const Text = forwardRef<HTMLElement, TextProps>(
  ({ className, variant: variantProp, as, ...props }, ref) => {
    const variant = variantProp ?? 'body';
    const Comp = as ?? textTag[variant];
    return <Comp ref={ref} className={cn(textVariants({ variant }), className)} {...props} />;
  }
);
Text.displayName = 'Text';
