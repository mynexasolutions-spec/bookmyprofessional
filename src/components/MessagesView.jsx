"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { MessageSquare, Send, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { listThreads, listMessages, sendMessage, markThreadRead } from "@/lib/data/messages";

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

export default function MessagesView({ initialBookingId = null }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeId, setActiveId] = useState(initialBookingId);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true);
    const rows = await listThreads();
    setThreads(rows);
    setLoadingThreads(false);
    setActiveId((prev) => prev || rows[0]?.bookingId || null);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    let active = true;
    setLoadingMessages(true);
    listMessages(activeId).then((rows) => {
      if (!active) return;
      setMessages(rows);
      setLoadingMessages(false);
      markThreadRead(activeId);
      setThreads((prev) =>
        prev.map((t) => (t.bookingId === activeId ? { ...t, unread: 0 } : t))
      );
    });
    return () => {
      active = false;
    };
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const active = threads.find((t) => t.bookingId === activeId) || null;

  const handleSend = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setError(null);
    try {
      const row = await sendMessage({
        bookingId: active.bookingId,
        recipientId: active.otherId,
        body: text,
      });
      setMessages((prev) => [...prev, row]);
      setDraft("");
      setThreads((prev) =>
        prev.map((t) =>
          t.bookingId === active.bookingId
            ? { ...t, lastMessage: row.body, lastAt: row.createdAt }
            : t
        )
      );
    } catch (err) {
      setError(err?.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
      <div className="mb-5">
        <h1 className="font-heading text-2xl font-bold text-dark-900">Messages</h1>
        <p className="text-sm text-muted mt-1">
          Chat with your customers and professionals about a booking.
        </p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] rounded-2xl border border-border bg-surface shadow-card overflow-hidden md:h-[640px]">
        {/* Conversation list */}
        <aside
          className={`md:block border-b md:border-b-0 md:border-r border-border overflow-y-auto ${
            active ? "hidden md:block" : "block"
          }`}
        >
          {loadingThreads ? (
            <div className="p-8 text-center text-xs text-dark-400">Loading conversations…</div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-dark-300 mx-auto mb-3" />
              <p className="text-xs text-dark-500">
                No conversations yet. Messages appear once you have a booking.
              </p>
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.bookingId}
                type="button"
                onClick={() => setActiveId(t.bookingId)}
                className={`w-full flex items-start gap-3 border-b border-border px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-dark-50 focus:bg-dark-50 focus:outline-none ${
                  activeId === t.bookingId ? "bg-primary-50/60" : ""
                }`}
              >
                {t.otherAvatar ? (
                  <img
                    src={t.otherAvatar}
                    alt={t.otherName}
                    className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0">
                    {t.otherName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-bold text-dark-900">{t.otherName}</p>
                    <span className="text-[10px] text-dark-400 shrink-0">{timeAgo(t.lastAt)}</span>
                  </div>
                  <p className="truncate text-[11px] text-primary-600 font-medium mt-0.5">
                    {t.serviceTitle}
                  </p>
                  <p className="truncate text-[11px] text-dark-500 mt-0.5">
                    {t.lastMessage || "No messages yet"}
                  </p>
                </div>
                {t.unread > 0 && (
                  <span className="mt-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shrink-0">
                    {t.unread > 9 ? "9+" : t.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </aside>

        {/* Thread pane */}
        <section className={`flex flex-col min-w-0 ${active ? "flex" : "hidden md:flex"}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center p-10 text-center">
              <div>
                <MessageSquare className="w-12 h-12 text-dark-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-dark-700">Select a conversation</p>
                <p className="text-xs text-dark-500 mt-1">
                  Choose a booking on the left to read and reply.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveId(null)}
                  className="md:hidden p-1.5 rounded-lg text-dark-500 hover:bg-dark-50"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-dark-900">{active.otherName}</p>
                  <p className="truncate text-[11px] text-dark-500">
                    {active.serviceTitle} • Booking #{active.bookingId}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-dark-50/40">
                {loadingMessages ? (
                  <p className="text-center text-xs text-dark-400">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-xs text-dark-400 py-8">
                    No messages yet. Say hello to get started.
                  </p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                            mine
                              ? "bg-primary-500 text-white rounded-br-sm"
                              : "bg-surface border border-border text-dark-800 rounded-bl-sm"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.body}</p>
                          <span
                            className={`mt-1 block text-[10px] ${
                              mine ? "text-white/70" : "text-dark-400"
                            }`}
                          >
                            {timeAgo(m.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-border p-3 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  aria-label="Message"
                  className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 px-3 pb-3 text-[11px] text-red-600"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
