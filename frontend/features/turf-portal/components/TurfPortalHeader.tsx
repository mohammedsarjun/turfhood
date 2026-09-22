'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBell, FiMenu } from 'react-icons/fi';
import { NotificationDropdown } from '@/features/notifications';

interface TurfPortalHeaderProps {
  turfName: string;
  onMenuClick: () => void;
}

export function TurfPortalHeader({ turfName, onMenuClick }: TurfPortalHeaderProps) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNotificationOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsNotificationOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isNotificationOpen]);

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

      <div className="flex items-center gap-3">
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            aria-label="Notifications"
            aria-haspopup="dialog"
            aria-expanded={isNotificationOpen}
            onClick={() => setIsNotificationOpen((open) => !open)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" aria-label={`${unreadCount} unread notifications`} />
            )}
          </button>
          <NotificationDropdown
            open={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            onUnreadCountChange={setUnreadCount}
          />
        </div>
        <Link
          href="/my-turfs"
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <FiArrowLeft size={16} />
          <span className="hidden sm:inline">Back to My Turfs</span>
          <span className="sm:hidden">Back</span>
        </Link>
      </div>
    </header>
  );
}
