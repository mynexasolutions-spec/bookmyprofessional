"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
  mapNotification,
} from "@/lib/data/notifications";

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const secs = Math.floor((Date.now() - then) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // ponytail: fetch on mount + on open, no Supabase Realtime. Add a subscription when live
  // updates matter; polling/refetch on focus is enough for now.
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([listMyNotifications(20), unreadCount()]);
      setItems(list);
      setUnread(count);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // ponytail: one channel for the signed-in user's notifications. Ceiling: no reconnect/backoff —
  // if the socket drops, opening the menu still refetches. Add backoff/polling if that matters.
  useEffect(() => {
    let active = true;
    let supabase;
    let channel;

    (async () => {
      try {
        supabase = createClient();
        const { data } = await supabase.auth.getUser();
        const uid = data?.user?.id;
        if (!uid || !active) return;
        channel = supabase
          .channel(`notifications:${uid}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "notifications",
              filter: `user_id=eq.${uid}`,
            },
            (payload) => {
              setItems((prev) => [mapNotification(payload.new), ...prev].slice(0, 20));
              setUnread((count) => count + 1);
            }
          )
          .subscribe();
      } catch {
        // ponytail: realtime unavailable -> fetch-on-open still works
      }
    })();

    return () => {
      active = false;
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, []);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleOpenItem = async (item) => {
    if (!item.read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
      setUnread((count) => Math.max(0, count - 1));
      try {
        await markRead(item.id);
      } catch {
        // ponytail: optimistic — reconcile on next fetch if the update failed
      }
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await markAllRead();
    } catch {
      // ponytail: optimistic — reconcile on next fetch if the update failed
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-haspopup="true"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-dark-600 transition-colors hover:bg-dark-50 hover:text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <p className="text-xs font-bold text-dark-900">Notifications</p>
            {items.some((n) => !n.read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 rounded text-[11px] font-semibold text-primary-600 transition-colors hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-dark-500">
                {loading ? "Loading…" : "You're all caught up."}
              </div>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenItem(item)}
                  className="w-full border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-dark-50 focus:bg-dark-50 focus:outline-none"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        item.read ? "bg-transparent" : "bg-primary-500"
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-dark-900">{item.title}</p>
                      {item.body && (
                        <p className="mt-0.5 line-clamp-2 text-[11px] text-dark-500">{item.body}</p>
                      )}
                      <span className="mt-1 block text-[10px] text-dark-400">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
