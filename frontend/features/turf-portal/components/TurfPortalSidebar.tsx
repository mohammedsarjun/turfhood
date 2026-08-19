'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import {
  FiCalendar,
  FiDollarSign,
  FiGrid,
  FiMapPin,
  FiMessageSquare,
  FiSettings,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';

interface TurfPortalSidebarProps {
  turfId: string;
  open: boolean;
  onNavigate: () => void;
}

interface NavigationItem {
  label: string;
  segment: string;
  icon: IconType;
}

const NAVIGATION_GROUPS: ReadonlyArray<{
  label: string;
  items: ReadonlyArray<NavigationItem>;
}> = [
  {
    label: 'Business Overview',
    items: [{ label: 'Dashboard', segment: 'dashboard', icon: FiGrid }],
  },
  {
    label: 'Operations',
    items: [
      { label: 'My Turf', segment: 'my-turf', icon: FiMapPin },
      { label: 'Court Management', segment: 'courts', icon: FiSettings },
      { label: 'Bookings', segment: 'bookings', icon: FiCalendar },
      { label: 'Slot Management', segment: 'slots', icon: FiGrid },
    ],
  },
  {
    label: 'Finance',
    items: [{ label: 'Revenue', segment: 'revenue', icon: FiDollarSign }],
  },
  {
    label: 'Customers',
    items: [
      { label: 'Customers', segment: 'customers', icon: FiUsers },
      { label: 'Reviews', segment: 'reviews', icon: FiMessageSquare },
    ],
  },
];

export const TurfPortalSidebar = memo(function TurfPortalSidebar({
  turfId,
  open,
  onNavigate,
}: TurfPortalSidebarProps) {
  const pathname = usePathname();
  const basePath = `/turf-portal/${turfId}`;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto bg-sidebar-bg transition-transform duration-200',
        'md:static md:z-auto md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{ padding: 16 }}
    >
      <button
        type="button"
        onClick={onNavigate}
        aria-label="Close menu"
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text md:hidden"
      >
        <FiX size={16} />
      </button>

      <nav aria-label="Turf portal navigation" className="space-y-6 py-2">
        {NAVIGATION_GROUPS.map((group) => (
          <section
            key={group.label}
            aria-labelledby={`nav-${group.label.replaceAll(' ', '-').toLowerCase()}`}
          >
            <h2
              id={`nav-${group.label.replaceAll(' ', '-').toLowerCase()}`}
              className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted"
            >
              {group.label}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => {
                const href = `${basePath}/${item.segment}`;
                const active = pathname === href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.segment}
                    href={href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-active text-sidebar-text'
                        : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text',
                    )}
                  >
                    <Icon size={16} color={active ? 'var(--sidebar-accent)' : undefined} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
});
