'use client';

import { useState, type ReactNode } from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

/**
 * Header spans the full width across the top; sidebar + content sit in a row underneath.
 * Below the `md` breakpoint the sidebar becomes a slide-in drawer (opened via the header's
 * hamburger button) over a dimmed backdrop, instead of a permanently visible column.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        {sidebarOpen && (
          <div
            role="presentation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
          />
        )}
        <AdminSidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
