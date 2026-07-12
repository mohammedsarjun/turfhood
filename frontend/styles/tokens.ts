/**
 * Design tokens for the Turfhood design system.
 *
 * This file is the documentation/reference source for the palette and type
 * scale described in the brand guidelines. The values here are mirrored as
 * CSS custom properties in `app/globals.css` (the `:root` / `.dark` blocks
 * feed Tailwind's `@theme inline` mapping) — Tailwind utility classes like
 * `bg-primary` or `text-muted-foreground` read the CSS variables at runtime,
 * not this file. Keep the two in sync when a token changes.
 */

/** Brand palette, by semantic role, with light/dark values (hex). */
export const colors = {
  primary: { light: '#22c55e', dark: '#22c55e' },
  primaryForeground: { light: '#ffffff', dark: '#ffffff' },

  secondary: { light: '#15803d', dark: '#166534' },
  secondaryForeground: { light: '#ffffff', dark: '#ffffff' },

  destructive: { light: '#ef4444', dark: '#ef4444' },
  destructiveForeground: { light: '#ffffff', dark: '#ffffff' },

  muted: { light: '#f1f5f9', dark: '#132a1f' },
  mutedForeground: { light: '#475569', dark: '#94a3b8' },

  background: { light: '#f8fafc', dark: '#0b1f17' },
  foreground: { light: '#0f172a', dark: '#f8fafc' },

  card: { light: '#ffffff', dark: '#0f2a1e' },
  cardForeground: { light: '#0f172a', dark: '#f8fafc' },

  border: { light: '#e2e8f0', dark: '#1e293b' },
  input: { light: '#e2e8f0', dark: '#1e293b' },
  ring: { light: '#22c55e', dark: '#22c55e' },

  success: { light: '#dcfce7', dark: '#14532d' },
  successForeground: { light: '#166534', dark: '#dcfce7' },

  warning: { light: '#fef3c7', dark: '#451a03' },
  warningForeground: { light: '#b45309', dark: '#f59e0b' },

  info: { light: '#dbeafe', dark: '#1e3a8a' },
  infoForeground: { light: '#1d4ed8', dark: '#dbeafe' },

  accent: { light: '#8b5cf6', dark: '#8b5cf6' },
  accentForeground: { light: '#ffffff', dark: '#ffffff' },
} as const;

export type ColorToken = keyof typeof colors;

/** Font family stack — Inter with system-ui fallbacks. */
export const fontFamily = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
} as const;

/**
 * Type scale (xs–4xl). `role` marks the scale step that corresponds to a
 * named role from the brand guidelines (Display, Heading 1, Heading 2,
 * Body, Caption, Button, Badge) so `Typography.tsx` can expose both.
 */
export const fontSize = {
  xs: { size: '0.75rem', lineHeight: '1rem', role: 'caption' },
  sm: { size: '0.875rem', lineHeight: '1.25rem', role: 'body' },
  base: { size: '1rem', lineHeight: '1.5rem', role: null },
  lg: { size: '1.125rem', lineHeight: '1.75rem', role: 'heading2' },
  xl: { size: '1.25rem', lineHeight: '1.75rem', role: null },
  '2xl': { size: '1.5rem', lineHeight: '2rem', role: 'heading1' },
  '3xl': { size: '1.875rem', lineHeight: '2.25rem', role: null },
  '4xl': { size: '2.25rem', lineHeight: '2.5rem', role: 'display' },
} as const;

export type FontSizeToken = keyof typeof fontSize;

/** Font weight scale used across the type system. */
export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export type FontWeightToken = keyof typeof fontWeight;
