"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { adminLogout } from "@/actions/admin";
import {
  LayoutDashboard,
  FileCheck,
  Star,
  Calendar,
  Users,
  DollarSign,
  Check,
  X,
  EyeOff,
  ShieldCheck,
  Menu,
  ChevronLeft,
  LogOut,
  ExternalLink,
  User,
  Banknote,
  Tag,
  Pencil,
  Trash2,
  UserX,
  UserCheck,
  SlidersHorizontal,
  Megaphone,
} from "lucide-react";
import { formatMoney } from "@/lib/money";

const statusStyles = {
  pending: "text-amber-700 bg-amber-100",
  requested: "text-amber-700 bg-amber-100",
  processing: "text-blue-700 bg-blue-100",
  approved: "text-emerald-700 bg-emerald-100",
  paid: "text-emerald-700 bg-emerald-100",
  rejected: "text-red-700 bg-red-100",
  hidden: "text-red-700 bg-red-100",
  upcoming: "text-blue-700 bg-blue-100",
  in_progress: "text-amber-700 bg-amber-100",
  completed: "text-emerald-700 bg-emerald-100",
  cancelled: "text-red-700 bg-red-100",
  unpaid: "text-amber-700 bg-amber-100",
  refunded: "text-red-700 bg-red-100",
  admin: "text-violet-700 bg-violet-100",
  professional: "text-primary-700 bg-primary-100",
  customer: "text-dark-600 bg-dark-100",
};

function StatusPill({ value }) {
  if (!value) return <span className="text-dark-400">—</span>;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md capitalize ${
        statusStyles[value] || "text-dark-600 bg-dark-100"
      }`}
    >
      {String(value).replace("_", " ")}
    </span>
  );
}

function EmptyState({ icon: Icon, title, hint }) {
  return (
    <div className="p-12 text-center bg-dark-50 rounded-2xl border border-dashed border-border">
      {Icon ? <Icon className="w-12 h-12 text-dark-400 mx-auto mb-3" /> : null}
      <h3 className="font-heading text-base font-bold text-dark-900">{title}</h3>
      {hint ? <p className="text-xs text-dark-500 mt-1 max-w-sm mx-auto">{hint}</p> : null}
    </div>
  );
}

export default function AdminDashboard({
  analytics = {},
  documents = [],
  reviews = [],
  bookings = [],
  users = [],
  payouts = [],
  categories = [],
  professionals = [],
  settings = {},
  adminId = "admin",
}) {
  const router = useRouter();
  const { showToast } = useAuth();
  const [activeSection, setActiveSection] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", sort: "" });
  const [editingCategory, setEditingCategory] = useState(null);
  const [commissionRate, setCommissionRate] = useState(
    String(Number(settings?.commission?.rate ?? 0.1) * 100)
  );
  const [cancelWindow, setCancelWindow] = useState(
    String(settings?.cancellation?.window_hours ?? 24)
  );
  const [announcementForm, setAnnouncementForm] = useState({ title: "", body: "" });

  const post = async (url, body, method = "POST") => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error || "Request failed");
    return json;
  };

  const run = async (key, url, body, successMessage, method = "POST") => {
    setBusy(key);
    try {
      await post(url, body, method);
      showToast(successMessage, "success");
      router.refresh();
    } catch (error) {
      showToast(error?.message || "Action failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const groups = [
    {
      label: "Overview",
      items: [{ id: "overview", label: "Dashboard", icon: LayoutDashboard }],
    },
    {
      label: "Marketplace",
      items: [
        { id: "verification", label: "Verification", icon: FileCheck, count: documents.length },
        { id: "bookings", label: "Bookings", icon: Calendar, count: bookings.length },
        { id: "reviews", label: "Reviews", icon: Star, count: reviews.length },
        { id: "payouts", label: "Payouts", icon: DollarSign, count: payouts.length },
        { id: "professionals", label: "Professionals", icon: ShieldCheck },
        { id: "categories", label: "Categories", icon: Tag },
      ],
    },
    {
      label: "Accounts",
      items: [{ id: "users", label: "Users", icon: Users, count: users.length }],
    },
    {
      label: "System",
      items: [
        { id: "announcements", label: "Announcements", icon: Megaphone },
        { id: "settings", label: "Settings", icon: SlidersHorizontal },
      ],
    },
  ];

  const cards = [
    {
      label: "Total Revenue",
      value: `${formatMoney(Number(analytics.grossRevenue || 0).toFixed(2))}`,
      icon: Banknote,
      tint: "bg-amber-100 text-amber-600",
    },
    {
      label: "Total Bookings",
      value: analytics.bookings ?? 0,
      icon: Calendar,
      tint: "bg-primary-100 text-primary-600",
    },
    {
      label: "Customers",
      value: analytics.users ?? 0,
      icon: Users,
      tint: "bg-emerald-100 text-emerald-600",
    },
    {
      label: "Professionals",
      value: analytics.professionals ?? 0,
      icon: ShieldCheck,
      tint: "bg-violet-100 text-violet-600",
    },
  ];

  const recentBookings = bookings.slice(0, 8);

  const goTo = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-dark-50/80 border-r border-border transition-all duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-64 lg:w-[76px]" : "w-64"}`}
      >
        <div className="flex items-center gap-3 h-16 px-4 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-primary-500 text-white flex items-center justify-center font-heading font-bold shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-heading font-bold text-sm text-dark-900 leading-tight truncate">
                BookMyProfessional
              </p>
              <p className="text-[11px] text-muted">Admin Panel</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {groups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(item.id)}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-surface text-primary-600 shadow-xs border border-border"
                          : "text-dark-600 hover:bg-surface/70 hover:text-dark-900 border border-transparent"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                      {!collapsed && item.count > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-border shrink-0">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="hidden lg:flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-dark-500 hover:bg-surface hover:text-dark-800 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-surface border-b border-border flex items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-dark-600 hover:bg-dark-50"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-heading font-bold text-base sm:text-lg text-dark-900 truncate">
              Admin Dashboard
            </h1>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-semibold text-dark-600 hover:bg-dark-50 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Site
            </Link>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-dark-100 flex items-center justify-center text-dark-500">
                <User className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-dark-900 truncate max-w-[160px]">{adminId}</p>
                <p className="text-[11px] text-muted">Administrator</p>
              </div>
            </div>
            <form action={adminLogout}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-white px-3.5 py-2 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </form>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeSection === "overview" && (
            <div>
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-dark-900">Overview</h2>
                <p className="text-sm text-muted mt-1">
                  Welcome back. Here&apos;s what&apos;s happening with your marketplace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="p-5 bg-surface rounded-2xl border border-border shadow-card"
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.tint}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-bold font-heading text-dark-900 mt-4">
                        {card.value}
                      </p>
                      <p className="text-xs text-muted mt-1">{card.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                  <h3 className="font-heading font-semibold text-sm text-dark-900">
                    Recent bookings
                  </h3>
                  <button
                    type="button"
                    onClick={() => goTo("bookings")}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    View all
                  </button>
                </div>
                {recentBookings.length === 0 ? (
                  <div className="p-10 text-center text-xs text-dark-500">
                    No bookings yet. Bookings placed on the marketplace will appear here.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-muted">
                        <tr className="border-b border-border">
                          <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Booking</th>
                          <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Amount</th>
                          <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                          <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Payment</th>
                          <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {recentBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-dark-900 whitespace-nowrap">
                              #{b.id}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-dark-900 whitespace-nowrap">
                              {formatMoney(Number(b.total_paid || 0))}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={b.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={b.payment_status} />
                            </td>
                            <td className="px-5 py-3.5 text-dark-500 whitespace-nowrap">
                              {b.created_at ? new Date(b.created_at).toLocaleDateString() : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === "verification" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Verification</h2>
                <p className="text-sm text-muted mt-1">Review professional documents awaiting approval.</p>
              </div>
              {documents.length === 0 ? (
                <EmptyState
                  icon={FileCheck}
                  title="No pending documents"
                  hint="Uploaded professional documents awaiting review will appear here."
                />
              ) : (
                <div className="space-y-3.5">
                  {documents.map((doc) => {
                    const key = `doc:${doc.id}`;
                    const isBusy = busy === key;
                    return (
                      <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-surface rounded-2xl border border-border shadow-card"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-dark-900">{doc.type}</h3>
                            <p className="text-xs text-dark-500 mt-0.5">
                              {doc.professional?.full_name || "Unknown professional"}
                              {doc.file_path ? ` • ${doc.file_path.split("/").pop()}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              run(
                                key,
                                "/api/admin/verify",
                                { documentId: doc.id, professionalId: doc.professional_id, status: "approved" },
                                "Document approved"
                              )
                            }
                            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              run(
                                key,
                                "/api/admin/verify",
                                { documentId: doc.id, professionalId: doc.professional_id, status: "rejected" },
                                "Document rejected"
                              )
                            }
                            className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSection === "reviews" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Reviews</h2>
                <p className="text-sm text-muted mt-1">Moderate reviews submitted by customers.</p>
              </div>
              {reviews.length === 0 ? (
                <EmptyState
                  icon={Star}
                  title="No pending reviews"
                  hint="Submitted reviews awaiting approval or hiding will appear here."
                />
              ) : (
                <div className="space-y-3.5">
                  {reviews.map((review) => {
                    const key = `review:${review.id}`;
                    const isBusy = busy === key;
                    return (
                      <div
                        key={review.id}
                        className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {review.rating}
                            </span>
                            <span className="text-xs text-dark-600">
                              {review.customer?.full_name || "Customer"} →{" "}
                              {review.professional?.name || "Professional"}
                            </span>
                          </div>
                          <StatusPill value={review.status} />
                        </div>
                        {review.comment ? (
                          <p className="text-xs text-dark-700 italic">&ldquo;{review.comment}&rdquo;</p>
                        ) : null}
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              run(key, "/api/admin/review", { reviewId: review.id, status: "approved" }, "Review approved")
                            }
                            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              run(key, "/api/admin/review", { reviewId: review.id, status: "hidden" }, "Review hidden")
                            }
                            className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <EyeOff className="w-3.5 h-3.5" /> Hide
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeSection === "bookings" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Bookings</h2>
                <p className="text-sm text-muted mt-1">Every booking placed on the marketplace.</p>
              </div>
              {bookings.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="No bookings yet"
                  hint="Bookings placed on the marketplace will appear here."
                />
              ) : (
                <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-card">
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Ref</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Service</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Customer</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Professional</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Schedule</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Total</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Payment</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide text-right">Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {bookings.map((booking) => {
                        const key = `booking:${booking.id}`;
                        const isBusy = busy === key;
                        return (
                          <tr key={booking.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-mono font-bold text-dark-900">{booking.id}</td>
                            <td className="px-5 py-3.5 text-dark-700 max-w-[160px] truncate">
                              {booking.service_title || "—"}
                            </td>
                            <td className="px-5 py-3.5 text-dark-700">{booking.customer?.full_name || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-700">{booking.professionals?.name || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-600 whitespace-nowrap">
                              {booking.date} {booking.time_slot}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-dark-900">
                              {formatMoney(Number(booking.total_paid || 0))}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={booking.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={booking.payment_status} />
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <select
                                disabled={isBusy}
                                value={booking.status}
                                onChange={(e) =>
                                  run(
                                    key,
                                    "/api/admin/bookings",
                                    { id: booking.id, status: e.target.value },
                                    "Booking status updated"
                                  )
                                }
                                className="rounded-lg border border-border bg-surface px-2 py-1.5 text-xs font-semibold text-dark-700 capitalize disabled:opacity-50"
                              >
                                {["upcoming", "in_progress", "completed", "cancelled"].map((s) => (
                                  <option key={s} value={s}>
                                    {s.replace("_", " ")}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "users" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Users</h2>
                <p className="text-sm text-muted mt-1">Registered customer and professional profiles.</p>
              </div>
              {users.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No users found"
                  hint="Registered customer and professional profiles will appear here."
                />
              ) : (
                <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-card">
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Name</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Email</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Role</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">City</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Joined</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {users.map((profile) => {
                        const key = `user:${profile.id}`;
                        const isBusy = busy === key;
                        return (
                          <tr key={profile.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-dark-900">{profile.full_name || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-600">{profile.email || "—"}</td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={profile.role} />
                            </td>
                            <td className="px-5 py-3.5 text-dark-600">{profile.city || "—"}</td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                                  profile.suspended
                                    ? "text-red-700 bg-red-100"
                                    : "text-emerald-700 bg-emerald-100"
                                }`}
                              >
                                {profile.suspended ? "Suspended" : "Active"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-dark-500 whitespace-nowrap">
                              {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-2.5">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    run(
                                      key,
                                      "/api/admin/users",
                                      { userId: profile.id, action: profile.suspended ? "unsuspend" : "suspend" },
                                      profile.suspended ? "User unsuspended" : "User suspended"
                                    )
                                  }
                                  className="py-2 px-3.5 rounded-xl border border-border text-dark-700 hover:bg-dark-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {profile.suspended ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" /> Unsuspend
                                    </>
                                  ) : (
                                    <>
                                      <UserX className="w-3.5 h-3.5" /> Suspend
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    if (!window.confirm("Delete this user? This cannot be undone.")) return;
                                    run(
                                      key,
                                      "/api/admin/users",
                                      { userId: profile.id },
                                      "User deleted",
                                      "DELETE"
                                    );
                                  }}
                                  className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "payouts" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Payouts</h2>
                <p className="text-sm text-muted mt-1">Withdrawal requests from professionals.</p>
              </div>
              {payouts.length === 0 ? (
                <EmptyState
                  icon={DollarSign}
                  title="No payout requests"
                  hint="Withdrawal requests from professionals will appear here."
                />
              ) : (
                <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-card">
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Professional</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Amount</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Method</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Requested</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {payouts.map((payout) => {
                        const key = `payout:${payout.id}`;
                        const isBusy = busy === key;
                        const canAct = payout.status === "requested" || payout.status === "processing";
                        return (
                          <tr key={payout.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-dark-900">
                              {payout.professional?.full_name || "—"}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-dark-900">
                              {formatMoney(Number(payout.amount || 0))}
                            </td>
                            <td className="px-5 py-3.5 text-dark-600">{payout.method || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-500 whitespace-nowrap">
                              {payout.requested_at ? new Date(payout.requested_at).toLocaleDateString() : "—"}
                            </td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={payout.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              {canAct ? (
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      run(key, "/api/admin/payout", { payoutId: payout.id, status: "paid" }, "Payout marked paid")
                                    }
                                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Mark Paid
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      run(key, "/api/admin/payout", { payoutId: payout.id, status: "rejected" }, "Payout rejected")
                                    }
                                    className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="block text-right text-dark-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeSection === "categories" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Categories</h2>
                <p className="text-sm text-muted mt-1">Manage the marketplace service categories.</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const name = categoryForm.name.trim();
                  if (!name) return;
                  run(
                    "category:new",
                    "/api/admin/categories",
                    { name, sort: categoryForm.sort },
                    "Category added"
                  ).then(() => setCategoryForm({ name: "", sort: "" }));
                }}
                className="flex flex-col sm:flex-row gap-3 p-4 bg-surface rounded-2xl border border-border shadow-card"
              >
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Category name"
                  className="flex-1 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <input
                  value={categoryForm.sort}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, sort: e.target.value }))}
                  type="number"
                  placeholder="Sort"
                  className="w-full sm:w-28 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
                <button
                  type="submit"
                  disabled={busy === "category:new"}
                  className="py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  Add Category
                </button>
              </form>

              {categories.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title="No categories"
                  hint="Create your first category, or apply supabase/schema.sql to seed the defaults."
                />
              ) : (
                <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-card">
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Name</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Sort</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Status</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {categories.map((category) => {
                        const key = `category:${category.id}`;
                        const isBusy = busy === key;
                        const isEditing = editingCategory?.id === category.id;
                        return (
                          <tr key={category.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5">
                              {isEditing ? (
                                <input
                                  value={editingCategory.name}
                                  onChange={(e) =>
                                    setEditingCategory((c) => ({ ...c, name: e.target.value }))
                                  }
                                  className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-dark-900"
                                />
                              ) : (
                                <span className="font-semibold text-dark-900">{category.name}</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editingCategory.sort}
                                  onChange={(e) =>
                                    setEditingCategory((c) => ({ ...c, sort: e.target.value }))
                                  }
                                  className="w-20 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-dark-900"
                                />
                              ) : (
                                <span className="text-dark-600">{category.sort}</span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                                  category.active
                                    ? "text-emerald-700 bg-emerald-100"
                                    : "text-dark-600 bg-dark-100"
                                }`}
                              >
                                {category.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-2.5">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() =>
                                        run(
                                          key,
                                          "/api/admin/categories",
                                          {
                                            id: category.id,
                                            name: editingCategory.name,
                                            sort: editingCategory.sort,
                                          },
                                          "Category updated",
                                          "PATCH"
                                        ).then(() => setEditingCategory(null))
                                      }
                                      className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCategory(null)}
                                      className="py-2 px-3.5 rounded-xl border border-border text-dark-700 hover:bg-dark-50 text-xs font-semibold"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() =>
                                        run(
                                          key,
                                          "/api/admin/categories",
                                          { id: category.id, active: !category.active },
                                          category.active ? "Category deactivated" : "Category activated",
                                          "PATCH"
                                        )
                                      }
                                      className="py-2 px-3.5 rounded-xl border border-border text-dark-700 hover:bg-dark-50 text-xs font-semibold disabled:opacity-50"
                                    >
                                      {category.active ? "Deactivate" : "Activate"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingCategory({
                                          id: category.id,
                                          name: category.name,
                                          sort: category.sort,
                                        })
                                      }
                                      className="py-2 px-3.5 rounded-xl border border-border text-dark-700 hover:bg-dark-50 text-xs font-semibold flex items-center gap-1.5"
                                    >
                                      <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isBusy}
                                      onClick={() => {
                                        if (!window.confirm("Delete this category?")) return;
                                        run(
                                          key,
                                          "/api/admin/categories",
                                          { id: category.id },
                                          "Category deleted",
                                          "DELETE"
                                        );
                                      }}
                                      className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "professionals" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Professionals</h2>
                <p className="text-sm text-muted mt-1">
                  Approve verification and toggle marketplace visibility.
                </p>
              </div>
              {professionals.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No professionals"
                  hint="Professional profiles will appear here once registered."
                />
              ) : (
                <div className="overflow-x-auto bg-surface border border-border rounded-2xl shadow-card">
                  <table className="w-full text-left text-xs">
                    <thead className="text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Name</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Category</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">City</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Rating</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Verification</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide">Visibility</th>
                        <th className="px-5 py-3 font-semibold uppercase text-[10px] tracking-wide text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {professionals.map((pro) => {
                        const key = `pro:${pro.id}`;
                        const isBusy = busy === key;
                        return (
                          <tr key={pro.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="px-5 py-3.5 font-semibold text-dark-900">{pro.name || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-600">{pro.category || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-600">{pro.city || "—"}</td>
                            <td className="px-5 py-3.5 text-dark-600">{pro.rating ?? 0}</td>
                            <td className="px-5 py-3.5">
                              <StatusPill value={pro.verification_status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                                  pro.is_active
                                    ? "text-emerald-700 bg-emerald-100"
                                    : "text-dark-600 bg-dark-100"
                                }`}
                              >
                                {pro.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-2.5">
                                {pro.verification_status !== "approved" && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      run(key, "/api/admin/professionals", { id: pro.id, action: "approve" }, "Professional approved")
                                    }
                                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                )}
                                {pro.verification_status !== "rejected" && (
                                  <button
                                    type="button"
                                    disabled={isBusy}
                                    onClick={() =>
                                      run(key, "/api/admin/professionals", { id: pro.id, action: "reject" }, "Professional rejected")
                                    }
                                    className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() =>
                                    run(
                                      key,
                                      "/api/admin/professionals",
                                      { id: pro.id, action: pro.is_active ? "deactivate" : "activate" },
                                      pro.is_active ? "Professional deactivated" : "Professional activated"
                                    )
                                  }
                                  className="py-2 px-3.5 rounded-xl border border-border text-dark-700 hover:bg-dark-50 text-xs font-semibold disabled:opacity-50"
                                >
                                  {pro.is_active ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeSection === "announcements" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Announcements</h2>
                <p className="text-sm text-muted mt-1">
                  Send a notification to every registered account.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const title = announcementForm.title.trim();
                  if (!title) return;
                  run(
                    "announcement:new",
                    "/api/admin/broadcast",
                    { title, body: announcementForm.body.trim() },
                    "Announcement sent"
                  ).then(() => setAnnouncementForm({ title: "", body: "" }));
                }}
                className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3 max-w-2xl"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-dark-500">
                    Delivered to every user&apos;s notification bell. No scheduling or targeting.
                  </p>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-dark-700 mb-1.5"
                    htmlFor="announcement-title"
                  >
                    Title
                  </label>
                  <input
                    id="announcement-title"
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g. New categories are live"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold text-dark-700 mb-1.5"
                    htmlFor="announcement-body"
                  >
                    Message
                  </label>
                  <textarea
                    id="announcement-body"
                    rows={4}
                    value={announcementForm.body}
                    onChange={(e) =>
                      setAnnouncementForm((f) => ({ ...f, body: e.target.value }))
                    }
                    placeholder="Write the announcement…"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy === "announcement:new" || !announcementForm.title.trim()}
                  className="py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {busy === "announcement:new" ? "Sending…" : "Send Announcement"}
                </button>
              </form>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-dark-900">Settings</h2>
                <p className="text-sm text-muted mt-1">Platform-wide commission and cancellation policy.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      "settings:commission",
                      "/api/admin/settings",
                      { key: "commission", value: { rate: Number(commissionRate) / 100 } },
                      "Commission updated"
                    );
                  }}
                  className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3"
                >
                  <label className="block text-xs font-semibold text-dark-700" htmlFor="commission-rate">
                    Commission rate (%)
                  </label>
                  <input
                    id="commission-rate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    type="submit"
                    disabled={busy === "settings:commission"}
                    className="py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Save Commission
                  </button>
                </form>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      "settings:cancellation",
                      "/api/admin/settings",
                      { key: "cancellation", value: { window_hours: Number(cancelWindow) } },
                      "Cancellation window updated"
                    );
                  }}
                  className="p-5 bg-surface rounded-2xl border border-border shadow-card space-y-3"
                >
                  <label className="block text-xs font-semibold text-dark-700" htmlFor="cancel-window">
                    Cancellation window (hours)
                  </label>
                  <input
                    id="cancel-window"
                    type="number"
                    min="0"
                    value={cancelWindow}
                    onChange={(e) => setCancelWindow(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    type="submit"
                    disabled={busy === "settings:cancellation"}
                    className="py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    Save Window
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
