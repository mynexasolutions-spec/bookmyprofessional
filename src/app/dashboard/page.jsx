"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { getNotificationPrefs, updateNotificationPrefs } from "@/lib/data/notifications";
import { getProfile, updateProfile } from "@/lib/data/profiles";
import {
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
  ChevronRight,
  ArrowRight,
  MessageSquare,
  Camera,
  Heart,
} from "lucide-react";
import { uploadImage, ikImage } from "@/lib/imagekit";
import { formatMoney } from "@/lib/money";

export default function CustomerDashboardPage() {
  const {
    bookings,
    cancelBooking,
    customerProfile,
    setCustomerProfile,
    professionals: marketplacePros,
  } = useMarketplace();
  const { showToast, user, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "profile" | "invoices" | "wishlist"
  const [bookingFilter, setBookingFilter] = useState("all"); // "all" | "upcoming" | "in_progress" | "completed" | "cancelled"
  const [profileForm, setProfileForm] = useState(customerProfile);
  const [prefs, setPrefs] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [savedProIds, setSavedProIds] = useState([]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!user?.id) {
      showToast("Please sign in to update your profile photo.", "error");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const url = await uploadImage(file);
      await updateProfile(user.id, { avatar_url: url });
      
      setCustomerProfile(prev => ({ ...prev, avatar_url: url }));
      setProfileForm(prev => ({ ...prev, avatar_url: url }));
      
      showToast("Profile photo updated.", "success");
    } catch (err) {
      showToast(err?.message || "Photo upload failed. Please try again.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    const saved = window.localStorage.getItem("customerActiveTab");
    if (saved) {
      setActiveTab(saved);
    }
    
    // Load wishlist from localStorage
    const savedIds = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("saved_pro_") && window.localStorage.getItem(key) === "true") {
        savedIds.push(key.replace("saved_pro_", ""));
      }
    }
    setSavedProIds(savedIds);
  }, []);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("customerActiveTab", tabId);
    }
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    setProfileForm(customerProfile);
  }, [customerProfile]);

  // Load the real profile row for signed-in (non-demo) users so edits round-trip to Supabase.
  useEffect(() => {
    if (!user) return;
    
    const meta = user.user_metadata || {};
    // Immediately set base values from user metadata
    setCustomerProfile((prev) => ({
      ...prev,
      name: prev.name || meta.full_name || meta.name || user.name || "",
      email: prev.email || user.email || "",
      phone: prev.phone || meta.phone || "",
      city: prev.city || meta.city || "",
    }));

    if (user.demo || !user.id) return;

    let active = true;
    getProfile(user.id).then((p) => {
      if (!active || !p) return;
      setCustomerProfile((prev) => ({
        ...prev,
        name: p.full_name || prev.name,
        email: p.email || prev.email,
        phone: p.phone || prev.phone,
        city: p.city || prev.city,
        address: p.address || prev.address,
        avatar_url: p.avatar_url || prev.avatar_url,
      }));
    });
    return () => {
      active = false;
    };
  }, [user, setCustomerProfile]);

  useEffect(() => {
    getNotificationPrefs().then(setPrefs);
  }, []);

  const handlePrefToggle = async (key) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    const saved = await updateNotificationPrefs({ [key]: next[key] });
    if (saved) {
      setPrefs(saved);
      showToast("Notification preferences updated.", "success");
    } else {
      showToast("Unable to save preferences right now.", "error");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    // Persist to Supabase for real sessions; demo mode keeps the local-only mock.
    if (user?.id && !user.demo) {
      try {
        await updateProfile(user.id, {
          full_name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
          city: profileForm.city,
          address: profileForm.address,
        });
      } catch (err) {
        showToast(err?.message || "Could not save your profile right now.", "error");
        return;
      }
    }

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

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
    } catch (err) {
      showToast(err?.message || "Unable to cancel this booking.", "error");
    }
  };

  // Prefer the real UTC instant when present; fall back to the display date + slot.
  const formatWhen = (b) => {
    if (b.startsAt) {
      const d = new Date(b.startsAt);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
      }
    }
    return `${b.date} at ${b.timeSlot}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-dark-800">
      <Navbar />

      {/* BREADCRUMBS */}
      <div className="bg-surface border-b border-border py-3">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-dark-500 font-medium">
            <Link href="/" className="hover:text-primary-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
            <span className="text-dark-900 font-semibold">Customer Dashboard</span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          {/* HEADER HERO */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-500 text-white flex items-center justify-center font-bold font-heading text-2xl shadow-soft overflow-hidden">
                  {customerProfile.avatar_url ? (
                    <img src={ikImage(customerProfile.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                  ) : customerProfile.name ? customerProfile.name.charAt(0) : "A"}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-heading text-xl sm:text-2xl font-bold text-dark-900">
                      {customerProfile.name}
                    </h1>
                    <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
                      Verified Member
                    </span>
                  </div>
                  <p className="text-xs text-dark-500 mt-0.5">
                    {customerProfile.email} • {customerProfile.phone}
                  </p>
                </div>
              </div>

              <Link
                href="/professionals"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs shadow-button transition-colors"
              >
                <Calendar className="w-4 h-4" />
                <span>Book a New Service</span>
              </Link>
            </div>
          </div>

          {/* DASHBOARD TABS AND CONTENT */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border px-6 bg-dark-50/50 gap-6 overflow-x-auto no-scrollbar">
              {[
                { id: "bookings", label: `My Bookings (${bookings.length})`, icon: Calendar },
                { id: "wishlist", label: "My Wishlist", icon: Heart },
                { id: "profile", label: "My Profile & Address", icon: User },
                { id: "invoices", label: "Invoices & Receipts", icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`py-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px transition-all whitespace-nowrap ${
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

            {/* TAB CONTENTS */}
            <div className="p-6 sm:p-8">
              {/* TAB 1: MY BOOKINGS */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  {/* Status Filters */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
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
                        className={`px-4 py-2 rounded-xl border transition-all ${
                          bookingFilter === f.id
                            ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                            : "bg-surface border-border text-dark-600 hover:bg-dark-50"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {filteredBookings.length === 0 ? (
                    <div className="p-12 text-center bg-dark-50 rounded-2xl border border-dashed border-border">
                      <Calendar className="w-12 h-12 text-dark-400 mx-auto mb-3" />
                      <h3 className="font-heading text-base font-bold text-dark-900">
                        No Bookings Found
                      </h3>
                      <p className="text-xs text-dark-500 mt-1 max-w-sm mx-auto">
                        You don't have any appointments in this status category.
                      </p>
                      <Link
                        href="/professionals"
                        className="inline-flex items-center justify-center mt-4 px-5 py-2.5 rounded-xl bg-primary-500 text-white text-xs font-semibold shadow-button"
                      >
                        Explore Verified Professionals
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((b) => (
                        <div
                          key={b.id}
                          className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4 hover:border-primary-200 transition-all"
                        >
                          {/* Top Row: Ref ID + Status */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-bold text-dark-900 bg-dark-50 px-2 py-0.5 rounded">
                                #{b.id}
                              </span>
                              <span className="text-dark-300">•</span>
                              <span className="text-xs text-dark-500" suppressHydrationWarning>
                                Booked on {new Date(b.createdAt).toLocaleDateString("en-IN")}
                              </span>
                            </div>
                            <div>{getStatusBadge(b.status)}</div>
                          </div>

                          {/* Middle Row: Pro Info + Date + Location */}
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <img
                                src={b.proAvatar}
                                alt={b.proName}
                                className="w-14 h-14 rounded-2xl object-cover border border-border bg-dark-100 shrink-0"
                              />
                              <div>
                                <h3 className="font-heading text-base font-bold text-dark-900">
                                  {b.proName}
                                </h3>
                                <p className="text-xs text-primary-600 font-semibold mt-0.5">
                                  {b.serviceTitle}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500 mt-1.5">
                                  <span className="flex items-center gap-1 font-semibold text-dark-900">
                                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                                    {formatWhen(b)}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-dark-400" />
                                    {b.address}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Price Box */}
                            <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                              <span className="text-[11px] text-dark-400 block uppercase font-semibold">
                                Total Amount
                              </span>
                              <span className="text-xl font-bold font-heading text-dark-900">
                                {formatMoney(b.totalPaid)}
                              </span>
                              <span className="block text-[11px] text-emerald-600 font-medium mt-0.5">
                                {b.paymentStatus === "refunded"
                                  ? "Refunded"
                                  : `Paid via ${b.paymentMethod || "—"}`}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Row: Notes & Actions */}
                          <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs text-dark-500">
                              Instructions:{" "}
                              <span className="text-dark-700 italic">{b.customerNotes}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              {b.status === "upcoming" && (
                                <button
                                  type="button"
                                  onClick={() => handleCancel(b.id)}
                                  className="py-2 px-3.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                                >
                                  Cancel Booking
                                </button>
                              )}

                              {b.status === "completed" && !b.hasReview && (
                                <Link
                                  href={`/review/${b.id}`}
                                  className="inline-flex items-center py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors"
                                >
                                  <Star className="w-3.5 h-3.5 mr-1.5 fill-white" />
                                  Write Review
                                </Link>
                              )}

                              {b.status === "completed" && b.hasReview && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl font-medium border border-amber-200">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  Reviewed ({b.reviewRating}★)
                                </span>
                              )}

                              <Link
                                href={`/messages?booking=${b.id}`}
                                className="py-2 px-3.5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Message</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleDownloadReceipt(b)}
                                className="py-2 px-3.5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Receipt PDF</span>
                              </button>

                              <Link
                                href={`/book/${b.proId}`}
                                className="py-2 px-3.5 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
                              >
                                Book Again
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY PROFILE */}
              {activeTab === "profile" && (
                <>
                <form onSubmit={handleProfileSave} className="space-y-6 max-w-xl">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Personal Contact Details
                    </h3>
                    <p className="text-xs text-dark-500 mt-1">
                      Keep your information current for smooth appointment confirmations.
                    </p>
                  </div>

                  <div className="mb-6 flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-2xl bg-dark-100 border border-border shadow-soft overflow-hidden shrink-0">
                      {profileForm.avatar_url ? (
                        <img src={ikImage(profileForm.avatar_url)} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-400">
                          <User className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-dark-900 mb-2">Profile Photo</h4>
                      <label className={`cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border bg-white hover:bg-dark-50 text-dark-700 text-xs font-semibold shadow-soft transition-colors ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        {isUploadingPhoto ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        {isUploadingPhoto ? "Uploading..." : "Change Photo"}
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploadingPhoto} />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
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
                          className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
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
                          className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="tel"
                          value={profileForm.phone || ""}
                          placeholder="e.g. +91 98765 43210"
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, phone: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        City
                      </label>
                      <input
                        type="text"
                        value={profileForm.city || ""}
                        placeholder="e.g. Mumbai"
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, city: e.target.value })
                        }
                        className="w-full px-3 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        Default Home Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="text"
                          value={profileForm.address || ""}
                          placeholder="e.g. 123 Main Street, Appt 4B"
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, address: e.target.value })
                          }
                          className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" variant="primary" size="md" className="font-semibold shadow-button text-xs py-2.5 px-6">
                    Save Profile Changes
                  </Button>
                </form>

                <div className="mt-8 pt-8 border-t border-border max-w-xl space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Notification Preferences
                    </h3>
                    <p className="text-xs text-dark-500 mt-1">
                      Choose which updates you want to hear about.
                    </p>
                  </div>

                  {!prefs ? (
                    <p className="text-xs text-dark-400">Loading preferences…</p>
                  ) : (
                    <div className="space-y-2.5">
                      {[
                        {
                          key: "bookings",
                          label: "Booking updates",
                          hint: "Confirmations, status changes and cancellations.",
                        },
                        {
                          key: "reviewReplies",
                          label: "Review replies",
                          hint: "When a professional responds to your review.",
                        },
                        {
                          key: "announcements",
                          label: "Announcements",
                          hint: "Platform news and important notices.",
                        },
                      ].map((row) => (
                        <label
                          key={row.key}
                          className="flex items-start justify-between gap-4 p-4 rounded-xl border border-border bg-dark-50/50 cursor-pointer"
                        >
                          <span>
                            <span className="block text-xs font-semibold text-dark-900">
                              {row.label}
                            </span>
                            <span className="block text-[11px] text-dark-500 mt-0.5">
                              {row.hint}
                            </span>
                          </span>
                          <input
                            type="checkbox"
                            checked={!!prefs[row.key]}
                            onChange={() => handlePrefToggle(row.key)}
                            className="mt-0.5 rounded text-primary-500 focus:ring-primary-500 h-4 w-4 shrink-0"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                </>
              )}

              {/* TAB 3: INVOICES */}
              {activeTab === "invoices" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Payment History & Transaction Invoices
                    </h3>
                    <p className="text-xs text-dark-500 mt-1">
                      Download digital receipts for tax filing and personal records.
                    </p>
                  </div>

                  <div className="overflow-x-auto border border-border rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-dark-50 border-b border-border text-dark-700 font-bold">
                        <tr>
                          <th className="p-4">Invoice #</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Professional</th>
                          <th className="p-4">Service</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-dark-50/50 transition-colors">
                            <td className="p-4 font-mono font-bold text-dark-900">INV-{b.id}</td>
                            <td className="p-4 text-dark-600" suppressHydrationWarning>
                              {new Date(b.createdAt).toLocaleDateString("en-IN")}
                            </td>
                            <td className="p-4 font-semibold text-dark-900">{b.proName}</td>
                            <td className="p-4 text-dark-600 max-w-[160px] truncate">
                              {b.serviceTitle}
                            </td>
                            <td className="p-4 font-bold text-dark-900">{formatMoney(b.totalPaid)}</td>
                            <td className="p-4">
                              <span className="block font-semibold text-dark-900">
                                {b.paymentMethod || "—"}
                              </span>
                              <span
                                className={`inline-block mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                                  b.paymentStatus === "paid"
                                    ? "text-emerald-700 bg-emerald-50"
                                    : b.paymentStatus === "refunded"
                                    ? "text-red-700 bg-red-50"
                                    : "text-amber-700 bg-amber-50"
                                }`}
                              >
                                {b.paymentStatus === "paid"
                                  ? "Paid (Escrow)"
                                  : b.paymentStatus === "refunded"
                                  ? "Refunded"
                                  : "Unpaid"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button
                                type="button"
                                onClick={() => handleDownloadReceipt(b)}
                                className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-bold"
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

              {/* TAB 4: WISHLIST */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      My Wishlist
                    </h3>
                    <p className="text-xs text-dark-500 mt-1">
                      Professionals you've saved for later.
                    </p>
                  </div>

                  {savedProIds.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-dark-50 rounded-xl border border-dashed border-border">
                      <Heart className="w-8 h-8 text-dark-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-dark-800">Your wishlist is empty</h4>
                      <p className="text-xs text-dark-500 mt-1 max-w-sm mx-auto mb-4">
                        Save professionals you like by clicking the heart icon on their profile.
                      </p>
                      <Link href="/professionals" className="inline-flex items-center justify-center bg-white border border-border shadow-soft rounded-lg px-4 py-2 text-xs font-semibold text-dark-700 hover:text-primary-600 hover:border-primary-200 transition-colors">
                        Browse Professionals
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {savedProIds.map(id => {
                        const pro = marketplacePros?.find(p => p.id === id);
                        if (!pro) return null;
                        return (
                          <div key={pro.id} className="group bg-surface rounded-card border border-border shadow-card hover:shadow-soft hover:border-primary-200 transition-all duration-200 overflow-hidden flex flex-col justify-between">
                            <Link href={`/professionals/${pro.id}`} className="block">
                              <div className="relative aspect-square w-full bg-dark-100 overflow-hidden">
                                <img
                                  src={ikImage(pro.image || "")}
                                  alt={pro.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.localStorage.removeItem(`saved_pro_${pro.id}`);
                                    setSavedProIds(prev => prev.filter(pId => pId !== pro.id));
                                    showToast(`${pro.name} removed from wishlist`, "info");
                                  }}
                                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-red-500 hover:bg-white transition-colors shadow-xs"
                                >
                                  <Heart className="w-3.5 h-3.5 fill-red-500" />
                                </button>
                              </div>
                              <div className="p-3.5">
                                <h3 className="font-heading font-bold text-sm text-dark-900 leading-tight truncate group-hover:text-primary-600 transition-colors">
                                  {pro.name}
                                </h3>
                                <p className="text-xs text-dark-600 font-medium mt-0.5">
                                  {pro.role}
                                </p>
                              </div>
                            </Link>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
