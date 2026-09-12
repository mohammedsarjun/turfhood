'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { io, type Socket } from 'socket.io-client';
import type { NotificationDTO, NotificationFilter } from '@turfhood/shared';
import { Badge, Button, Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';
import { listNotifications, markNotificationRead } from '../actions/notificationApi';

interface NotificationSocketPayload {
  notification: NotificationDTO;
  unreadCount: number;
}

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

function socketUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) return undefined;
  try {
    const parsed = new URL(base);
    return parsed.origin;
  } catch {
    return undefined;
  }
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string>();
  const [error, setError] = useState('');

  const load = useCallback(async (nextFilter = filter) => {
    setLoading(true);
    setError('');
    try {
      const result = await listNotifications(nextFilter);
      setItems(result.items);
      setUnreadCount(result.unreadCount);
    } catch {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (open) void load();
  }, [load, open]);

  useEffect(() => {
    const url = socketUrl();
    if (!url) return;
    const socket: Socket = io(url, { withCredentials: true, transports: ['websocket'] });
    socket.on('notification:new', (payload: NotificationSocketPayload) => {
      setUnreadCount(payload.unreadCount);
      setItems((current) => {
        if (filter === 'read' || current.some((item) => item.id === payload.notification.id)) {
          return current;
        }
        return [payload.notification, ...current].slice(0, 10);
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [filter]);

  const tabs = useMemo(
    () => [
      { value: 'all' as const, label: 'All' },
      { value: 'read' as const, label: 'Read' },
    ],
    [],
  );

  const markRead = async (notification: NotificationDTO) => {
    setUpdatingId(notification.id);
    try {
      const updated = await markNotificationRead(notification.id);
      setItems((current) =>
        filter === 'read'
          ? current.map((item) => (item.id === updated.id ? updated : item))
          : current.map((item) => (item.id === updated.id ? updated : item)),
      );
      if (!notification.readAt) setUnreadCount((current) => Math.max(0, current - 1));
    } finally {
      setUpdatingId(undefined);
    }
  };

  if (!open) return null;

  return (
    <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
        </div>
        <button
          type="button"
          aria-label="Close notifications"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 border-b border-border px-4 py-3">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            type="button"
            size="sm"
            variant={filter === tab.value ? 'primary' : 'outline'}
            onClick={() => {
              setFilter(tab.value);
              void load(tab.value);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <p role="alert" className="px-4 py-8 text-center text-sm text-destructive">
            {error}
          </p>
        ) : items.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No notifications found.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((notification) => (
              <div key={notification.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={notification.link ?? '#'}
                    onClick={onClose}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{notification.title}</p>
                      {!notification.readAt && <Badge variant="warning">New</Badge>}
                    </div>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </Link>
                  {!notification.readAt && filter === 'all' && (
                    <button
                      type="button"
                      aria-label={`Mark ${notification.title} as read`}
                      disabled={updatingId === notification.id}
                      onClick={() => void markRead(notification)}
                      className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
