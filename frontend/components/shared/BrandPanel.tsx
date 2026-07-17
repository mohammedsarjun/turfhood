import type { ReactNode } from 'react';
import { Check, MapPin } from 'lucide-react';

interface BrandPanelProps {
  headingLine1: string;
  headingLine2: string;
  description: string;
  footerNote: string;
  children: ReactNode;
}

/** Dark green hero panel used on auth pages: logo, headline, and a slot for a checklist or stats. */
export function BrandPanel({ headingLine1, headingLine2, description, footerNote, children }: BrandPanelProps) {
  return (
    <div
      className="relative flex h-full min-h-[560px] flex-col justify-between overflow-hidden bg-[#0b1f17] text-white"
      style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 40, paddingBottom: 40 }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(34,197,94,0.35),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#166534]/40" />

      <div className="relative">
        <div className="flex items-center" style={{ gap: 10 }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <MapPin className="h-5 w-5 text-primary" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold">TurfHood</span>
        </div>

        <h1 className="text-4xl font-medium leading-tight" style={{ marginTop: 56 }}>
          {headingLine1}
          <br />
          <span className="text-primary">{headingLine2}</span>
        </h1>

        <p className="max-w-sm text-sm leading-6 text-white/70" style={{ marginTop: 16 }}>
          {description}
        </p>

        <div style={{ marginTop: 40 }}>{children}</div>
      </div>

      <p className="relative text-sm text-white/50">{footerNote}</p>
    </div>
  );
}

export function BrandChecklistItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-center text-sm text-white/90" style={{ gap: 12 }}>
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      {children}
    </li>
  );
}

export function BrandStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
