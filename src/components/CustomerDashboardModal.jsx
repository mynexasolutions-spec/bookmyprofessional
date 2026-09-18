"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  CreditCard,
  Star,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Button from "./Button";

export default function CustomerDashboardModal() {
  const {
    isCustomerDashboardOpen,
    setIsCustomerDashboardOpen,
    bookings,
    cancelBooking,
    customerProfile,
    setCustomerProfile,
    setReviewBooking,
    startBooking,
    professionals,
  } = useMarketplace();
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "profile" | "invoices"
  const [bookingFilter, setBookingFilter] = useState("all"); // "all" | "upcoming" | "in_progress" | "completed" | "cancelled"

  // Profile form state
  const [profileForm, setProfileForm] = useState(customerProfile);

  useEffect(() => {
    setProfileForm(customerProfile);
  }, [customerProfile]);

  // Lock body scroll
  useEffect(() => {
    if (isCustomerDashboardOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCustomerDashboardOpen]);

  if (!isCustomerDashboardOpen) return null;

  const handleProfileSave = (e) => {
    e.preventDefault();
    setCustomerProfile(profileForm);
    showToast("Profile details updated successfully!", "success");
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3" /> Upcoming
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3 h-3 animate-spin" /> In Progress
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" /> Cancelled & Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownloadReceipt = (booking) => {
    showToast(`Downloading Receipt_${booking.id}.pdf ...`, "info");
  };

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsCustomerDashboardOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-4xl my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-border bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center font-bold font-heading text-lg">
              {customerProfile.name ? customerProfile.name.charAt(0) : "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold text-dark-900 leading-tight">
                  Customer Dashboard
                </h2>
                <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                  Active Member
                </span>
              </div>
              <p className="text-xs text-dark-500">{customerProfile.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCustomerDashboardOpen(false)}
            className="p-2 rounded-full text-dark-400 hover:text-dark-800 hover:bg-dark-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border px-4 sm:px-6 bg-dark-50/50 gap-4 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "bookings", label: `My Bookings (${bookings.length})`, icon: Calendar },
            { id: "profile", label: "My Profile & Address", icon: User },
            { id: "invoices", label: "Invoices & Receipts", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px transition-all whitespace-nowrap ${
                  isActive
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-dark-500 hover:text-dark-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB 1: MY BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                {[
                  { id: "all", label: "All Bookings" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "completed", label: "Completed" },
                  { id: "cancelled", label: "Cancelled" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${
                      bookingFilter === f.id
                        ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                        : "bg-surface border-border text-dark-600 hover:bg-dark-50"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="p-8 text-center bg-dark-50 rounded-2xl border border-border">
                  <Calendar className="w-10 h-10 text-dark-400 mx-auto mb-2" />
                  <h4 className="font-heading text-sm font-bold text-dark-900">
                    No Bookings in this Category
                  </h4>
                  <p className="text-xs text-dark-500 mt-1">
                    You don't have any bookings matching this status filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 sm:p-5 rounded-2xl border border-border bg-surface shadow-xs space-y-3.5 hover:border-primary-200 transition-all"
                    >
                      {/* Top Row: Ref ID + Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-dark-900">
                            #{b.id}
                          </span>
                          <span className="text-dark-300">•</span>
                          <span className="text-xs text-dark-500">
                            Booked on {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">{getStatusBadge(b.status)}</div>
                      </div>

                      {/* Middle: Pro Info + Date + Address */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={b.proAvatar}
                            alt={b.proName}
                            className="w-12 h-12 rounded-xl object-cover border border-border bg-dark-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-heading text-sm font-bold text-dark-900">
                              {b.proName}
                            </h4>
                            <p className="text-xs text-primary-600 font-medium">
                              {b.serviceTitle}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-dark-500 mt-1">
                              <span className="flex items-center gap-1 font-semibold text-dark-800">
                                <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                {b.date} at {b.timeSlot}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-dark-400" />
                                {b.address}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Amount Box */}
                        <div className="text-left md:text-right shrink-0">
                          <span className="text-[10px] text-dark-400 block">Total Amount</span>
                          <span className="text-base font-bold text-dark-900">
                            €{b.totalPaid}.00
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-medium">
                            Paid via {b.paymentMethod}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Action Row */}
                      <div className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs text-dark-500">
                          Notes: <span className="text-dark-700 italic">{b.customerNotes}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* If upcoming, allow cancellation */}
                          {b.status === "upcoming" && (
                            <button
                              type="button"
                              onClick={() => cancelBooking(b.id)}
                              className="py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}

                          {/* If completed and no review yet, show Rate & Review button */}
                          {b.status === "completed" && !b.hasReview && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setReviewBooking(b);
                              }}
                              className="py-1.5 px-3 text-xs font-semibold shadow-button"
                            >
                              <Star className="w-3.5 h-3.5 mr-1 fill-white" />
                              Write Review
                            </Button>
                          )}

                          {b.status === "completed" && b.hasReview && (
                            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md font-medium border border-amber-200">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              Reviewed ({b.reviewRating}★)
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(b)}
                            className="py-1.5 px-3 rounded-lg border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MY PROFILE & SETTINGS */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900">
                  Personal Information
                </h4>
                <p className="text-xs text-dark-500">
                  Update your contact details for future service appointments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      required
                      value={profileForm.name}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, name: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, email: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Mobile Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phone: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, city: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Default Home / Service Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, address: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="sm" className="font-semibold shadow-button">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* TAB 3: INVOICES & RECEIPTS */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900">
                  Payment History & Downloadable Receipts
                </h4>
                <p className="text-xs text-dark-500">
                  All transactions are encrypted and backed by escrow milestone protection.
                </p>
              </div>

              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-dark-50 border-b border-border text-dark-700 font-semibold">
                    <tr>
                      <th className="p-3">Invoice Ref</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Professional</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-dark-50/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-dark-900">INV-{b.id}</td>
                        <td className="p-3 text-dark-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-medium text-dark-900">{b.proName}</td>
                        <td className="p-3 text-dark-600 max-w-[150px] truncate">
                          {b.serviceTitle}
                        </td>
                        <td className="p-3 font-bold text-dark-900">€{b.totalPaid}.00</td>
                        <td className="p-3">
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {b.paymentStatus === "paid" ? "Paid (Escrow)" : "Refunded"}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadReceipt(b)}
                            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
