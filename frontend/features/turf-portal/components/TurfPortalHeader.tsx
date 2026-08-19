'use client';

import Link from 'next/link';
import { FiArrowLeft, FiMenu } from 'react-icons/fi';

interface TurfPortalHeaderProps {
  turfName: string;
  onMenuClick: () => void;
}

export function TurfPortalHeader({ turfName, onMenuClick }: TurfPortalHeaderProps) {
  return (
    <header className="flex min-h-16 w-full items-center justify-between gap-4 border-b border-border bg-card px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
        >
          <FiMenu size={20} />
        </button>
        <span className="truncate text-lg font-semibold text-foreground">{turfName}</span>
      </div>

      <Link
        href="/my-turfs"
        className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        <FiArrowLeft size={16} />
        <span className="hidden sm:inline">Back to My Turfs</span>
        <span className="sm:hidden">Back</span>
      </Link>
    </header>
  );
}
