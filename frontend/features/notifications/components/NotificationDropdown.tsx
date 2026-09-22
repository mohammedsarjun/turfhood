'use client';

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'react';
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
  /** Called whenever the resolved unread count changes so the parent bell can show a dot. */
  onUnreadCountChange?: (count: number) => void;
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

interface FetchState {
  items: NotificationDTO[];
  unreadCount: number;
  loading: boolean;
  error: string;
}

type FetchAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; items: NotificationDTO[]; unreadCount: number }
  | { type: 'FETCH_ERROR' }
  | { type: 'SET_UNREAD_COUNT'; unreadCount: number }
  | { type: 'PREPEND_ITEM'; notification: NotificationDTO }
  | { type: 'UPDATE_ITEM'; notification: NotificationDTO };

function fetchReducer(state: FetchState, action: FetchAction): FetchState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.items, unreadCount: action.unreadCount };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: 'Unable to load notifications.' };
    case 'SET_UNREAD_COUNT':
      return { ...state, unreadCount: action.unreadCount };
    case 'PREPEND_ITEM':
      return {
        ...state,
        items: [action.notification, ...state.items].slice(0, 10),
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.notification.id ? action.notification : item,
        ),
      };
    default:
      return state;
  }
}

export function NotificationDropdown({ open, onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [fetchState, dispatch] = useReducer(fetchReducer, {
    items: [],
    unreadCount: 0,
    loading: false,
    error: '',
  });
  const [updatingId, setUpdatingId] = useState<string>();
  const onUnreadCountChangeRef = useRef(onUnreadCountChange);
  useLayoutEffect(() => {
    onUnreadCountChangeRef.current = onUnreadCountChange;
  });

  useEffect(() => {
    onUnreadCountChangeRef.current?.(fetchState.unreadCount);
  }, [fetchState.unreadCount]);

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;
    dispatch({ type: 'FETCH_START' });

    listNotifications(filter)
      .then((result) => {
        if (!isCancelled) {
          dispatch({ type: 'FETCH_SUCCESS', items: result.items, unreadCount: result.unreadCount });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch({ type: 'FETCH_ERROR' });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [filter, open]);

  useEffect(() => {
    const url = socketUrl();
    if (!url) return;
    const socket: Socket = io(url, { withCredentials: true, transports: ['websocket'] });
    socket.on('notification:new', (payload: NotificationSocketPayload) => {
      dispatch({ type: 'SET_UNREAD_COUNT', unreadCount: payload.unreadCount });
      if (filter !== 'read') {
        dispatch({ type: 'PREPEND_ITEM', notification: payload.notification });
      }
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
      dispatch({ type: 'UPDATE_ITEM', notification: updated });
      if (!notification.readAt) {
        dispatch({
          type: 'SET_UNREAD_COUNT',
          unreadCount: Math.max(0, fetchState.unreadCount - 1),
        });
      }
    } finally {
      setUpdatingId(undefined);
    }
  };

  if (!open) return null;

  const { items, unreadCount, loading, error } = fetchState;

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
            onClick={() => setFilter(tab.value)}
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
