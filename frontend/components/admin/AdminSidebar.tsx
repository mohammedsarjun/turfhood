'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileCheck,
  Images,
  LayoutDashboard,
  Trophy,
  Sparkles,
  Percent,
  ReceiptText,
  WalletCards,
  ChartNoAxesCombined,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Revenue', href: '/admin/revenue', icon: ChartNoAxesCombined },
  { label: 'Withdrawals', href: '/admin/withdrawal-requests', icon: WalletCards },
  { label: 'Sports', href: '/admin/sports', icon: Trophy },
  { label: 'Amenities', href: '/admin/amenities', icon: Sparkles },
  { label: 'Banners', href: '/admin/banners', icon: Images },
  { label: 'Commission', href: '/admin/commission', icon: Percent },
  { label: 'Refunds', href: '/admin/refunds', icon: ReceiptText },
  { label: 'Turf Applications', href: '/admin/turf-owner-applications', icon: FileCheck },
];

export interface AdminSidebarProps {
  /** Whether the mobile slide-in drawer is open. Ignored at the `md` breakpoint and up, where the sidebar is always visible. */
  open?: boolean;
  /** Called after a nav link is clicked (used to close the mobile drawer) and when the mobile close button is clicked. */
  onNavigate?: () => void;
}

/** Admin area navigation — background/active/hover colors come from the dedicated --sidebar-* tokens. */
export function AdminSidebar({ open = false, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-y-auto bg-sidebar-bg transition-transform duration-200',
        'md:static md:z-auto md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
      style={{ padding: 16, gap: 4 }}
    >
      <button
        type="button"
        onClick={onNavigate}
        aria-label="Close menu"
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text md:hidden"
        style={{ marginBottom: 8 }}
      >
        <X className="h-4 w-4" />
      </button>

      {ADMIN_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-sidebar-active text-sidebar-text'
                : 'bg-transparent text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-text',
            )}
            style={{
              gap: 12,
              paddingLeft: 12,
              paddingRight: 12,
              paddingTop: 10,
              paddingBottom: 10,
            }}
          >
            <Icon
              className="h-4 w-4"
              style={{ color: isActive ? 'var(--sidebar-accent)' : undefined }}
            />
            {item.label}
          </Link>
        );
      })}
    </aside>
  );
}
