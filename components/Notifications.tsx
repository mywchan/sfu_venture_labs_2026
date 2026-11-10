'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AppNotification } from '@/lib/seed/data';
import { useStore } from '@/lib/store';

function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  return new Date(iso).toLocaleTimeString('en-CA', { hour: 'numeric', minute: '2-digit' });
}

function useOpenNotification() {
  const { readNotifications } = useStore();
  const router = useRouter();
  return (n: AppNotification) => {
    void readNotifications([n.id]);
    router.push(n.href);
  };
}

/** The bell in the top bar: everything this person has been sent. */
export function NotificationBell() {
  const { notifications, readNotifications } = useStore();
  const [open, setOpen] = useState(false);
  const openNotification = useOpenNotification();
  const unread = notifications.filter((n) => !n.readAt);

  // Shows in the browser tab, so it's noticed when another tab is in front.
  useEffect(() => {
    document.title = unread.length > 0 ? `(${unread.length}) Kestrel Kids Portal` : 'Kestrel Kids Portal';
  }, [unread.length]);

  return (
    <div className="notif-wrap">
      <button
        type="button"
        className="notif-bell"
        aria-expanded={open}
        aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        data-testid="notification-bell"
      >
        <span aria-hidden="true">🔔</span>
        {unread.length > 0 && <span className="notif-count" data-testid="notification-count">{unread.length}</span>}
      </button>
      {open && (
        <div className="notif-panel" data-testid="notification-panel">
          <div className="row between">
            <strong>Notifications</strong>
            {unread.length > 0 && (
              <button type="button" className="ghost small" onClick={() => void readNotifications(unread.map((n) => n.id))} data-testid="notifications-read-all">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 && <p className="muted small">Nothing yet.</p>}
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`notif-item${n.readAt ? '' : ' unread'}`}
              onClick={() => {
                setOpen(false);
                openNotification(n);
              }}
              data-testid={`notification-${n.kind}`}
            >
              <span>{n.message}</span>
              <span className="small muted">{timeAgo(n.createdAt)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Unread notifications at the top of every screen, until someone deals with them. */
export function NotificationBanners() {
  const { notifications, readNotifications } = useStore();
  const openNotification = useOpenNotification();
  const unread = notifications.filter((n) => !n.readAt);
  const shown = [...unread.filter((n) => n.urgent), ...unread.filter((n) => !n.urgent)].slice(0, 3);
  if (shown.length === 0) return null;

  return (
    <div data-testid="notification-banners">
      {shown.map((n) => (
        <div key={n.id} className={`banner ${n.urgent ? 'danger' : 'ok'} notif-banner`} role={n.urgent ? 'alert' : 'status'} data-testid={`banner-${n.kind}`}>
          <span>{n.message}</span>
          <span className="row" style={{ gap: 6 }}>
            <button type="button" className={n.urgent ? 'danger' : 'primary'} onClick={() => openNotification(n)} data-testid={`banner-open-${n.kind}`}>{n.actionLabel}</button>
            <button type="button" className="ghost" onClick={() => void readNotifications([n.id])} data-testid={`banner-dismiss-${n.kind}`}>Dismiss</button>
          </span>
        </div>
      ))}
      {unread.length > shown.length && <p className="small muted">{unread.length - shown.length} more in the bell above.</p>}
    </div>
  );
}
