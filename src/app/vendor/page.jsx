"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { listMyDocuments, uploadDocument } from "@/lib/data/documents";
import {
  getVendorProfile,
  updateVendorBasics,
  updateVendorSchedule,
  saveService,
  deleteService,
  saveCredential,
  deleteCredential,
} from "@/lib/data/vendor-profile";
import { getEarningsSummary, listMyPayouts } from "@/lib/data/payments";
import { uploadImage, ikImage } from "@/lib/imagekit";
import { createClient } from "@/lib/supabase/client";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowUpRight,
  User,
  MapPin,
  Check,
  Play,
  RotateCcw,
  ChevronRight,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Camera,
  Briefcase,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { formatMoney } from "@/lib/money";

const documentTypes = [
  "Government ID",
  "Professional License",
  "Liability Insurance",
  "Tax Certificate",
  "Trade Degree",
];

const docStatusStyles = {
  pending: "text-amber-700 bg-amber-100",
  approved: "text-emerald-700 bg-emerald-100",
  rejected: "text-red-700 bg-red-100",
};

export default function VendorPortalPage() {
  const { proVendorState, bookings, updateBookingStatus, requestPayout } = useMarketplace();
  const { user, showToast, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "professional") {
        router.push("/");
      }
    }
  }, [isLoading, user, router]);

  const [activeTab, setActiveTab] = useState("earnings"); // "earnings" | "bookings" | "schedule" | "verification"
  const [payoutAmountInput, setPayoutAmountInput] = useState(
    proVendorState.availablePayout.toString()
  );
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState(null);

  // Weekly schedule local state
  const [scheduleState, setScheduleState] = useState({
    Monday: true,
    Tuesday: true,
    Wednesday: true,
    Thursday: true,
    Friday: true,
    Saturday: false,
    Sunday: false,
    startTime: "09:00",
    endTime: "18:00",
  });

  const [documents, setDocuments] = useState([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [docType, setDocType] = useState("Government ID");

  // Services, qualifications & experience
  const [vendorProfile, setVendorProfile] = useState({
    experienceYears: 0,
    specialty: "",
    city: "",
    services: [],
    credentials: [],
  });
  const [serviceForm, setServiceForm] = useState({
    id: null,
    title: "",
    description: "",
    price: "",
    duration: "",
  });
  const [credForm, setCredForm] = useState({ title: "", issuer: "", year: "" });

  useEffect(() => {
    if (!user?.id) {
      setIsLoadingDocs(false);
      return;
    }
    let active = true;
    setIsLoadingDocs(true);
    listMyDocuments(user.id)
      .then((rows) => {
        if (active) setDocuments(rows);
      })
      .finally(() => {
        if (active) setIsLoadingDocs(false);
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    getVendorProfile(user.id).then((profile) => {
      if (active) setVendorProfile(profile);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    getEarningsSummary(user.id).then((summary) => {
      if (active && summary) setEarnings(summary);
    });
    listMyPayouts(user.id).then((rows) => {
      if (active && rows) setPayouts(rows);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  // ponytail: fall back to the proVendorState mock when there is no real professional session.
  const stats = earnings || {
    gross: proVendorState.totalGrossEarnings,
    commission: proVendorState.totalGrossEarnings * proVendorState.commissionRate,
    available: proVendorState.availablePayout,
    paidOut: proVendorState.paidOutAmount,
    commissionRate: proVendorState.commissionRate,
  };

  const payoutRows =
    payouts !== null
      ? payouts.map((p) => ({
          id: p.id,
          date: p.requested_at ? new Date(p.requested_at).toLocaleDateString() : "",
          amount: Number(p.amount) || 0,
          status: p.status,
          method: p.method || "SEPA Bank",
        }))
      : proVendorState.payoutHistory;

  useEffect(() => {
    setPayoutAmountInput(String(stats.available));
  }, [stats.available]);

  const allApproved =
    vendorProfile?.verification_status === "approved" ||
    (documents.length > 0 && documents.every((d) => d.status === "approved"));

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmountInput);
    if (!amt || amt <= 0) {
      showToast("Please enter a valid payout amount.", "error");
      return;
    }
    if (amt > stats.available) {
      showToast("Requested amount exceeds available balance.", "error");
      return;
    }
    const success = await requestPayout(amt);
    if (success) {
      setIsRequestingPayout(false);
      if (user?.id) {
        const rows = await listMyPayouts(user.id);
        if (rows) setPayouts(rows);
        const summary = await getEarningsSummary(user.id);
        if (summary) setEarnings(summary);
      }
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!user?.id) {
      showToast("Please sign in to upload verification documents.", "error");
      return;
    }

    setIsUploading(true);
    try {
      const row = await uploadDocument(user.id, file, docType);
      setDocuments((prev) => [row, ...prev]);
      showToast(`${docType} uploaded. Pending admin review.`, "success");
    } catch (error) {
      showToast(error?.message || "Upload failed. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!requireSignIn()) return;
    try {
      const startSplit = scheduleState.startTime.split(":");
      const endSplit = scheduleState.endTime.split(":");
      const startHour = parseInt(startSplit[0], 10);
      const endHour = parseInt(endSplit[0], 10);
      
      const slots = [];
      if (!isNaN(startHour) && !isNaN(endHour) && startHour < endHour) {
        for (let i = startHour; i < endHour; i++) {
          const ampm = i >= 12 ? "PM" : "AM";
          const displayHour = i > 12 ? i - 12 : (i === 0 ? 12 : i);
          slots.push(`${displayHour}:00 ${ampm}`);
        }
      } else {
        slots.push("09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"); // fallback
      }

      const activeDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].filter(d => scheduleState[d]);

      const formatTime = (timeStr) => {
        const [h, m] = timeStr.split(":");
        let hr = parseInt(h, 10);
        const ampm = hr >= 12 ? "PM" : "AM";
        hr = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr);
        return `${hr}:${m} ${ampm}`;
      };

      const hoursDisplay = `${formatTime(scheduleState.startTime)} - ${formatTime(scheduleState.endTime)}`;

      const availability = {
        days: activeDays,
        hours: hoursDisplay,
        slots: slots
      };
      
      await updateVendorSchedule(user.id, availability);
      showToast("Weekly operating hours saved successfully!", "success");
    } catch (err) {
      showToast(err?.message || "Could not save your schedule.", "error");
    }
  };

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
      const supabase = createClient();
      const { error } = await supabase
        .from("professionals")
        .update({ image_url: url })
        .eq("id", user.id);
      
      // Update local state even if supabase fails
      setVendorProfile(prev => ({ ...prev, image_url: url }));
      
      if (error) throw error;
      showToast("Profile photo updated.", "success");
    } catch (err) {
      showToast(err?.message || "Photo upload failed. Please try again.", "error");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
    } catch (err) {
      showToast(err?.message || "Could not update the booking status.", "error");
    }
  };

  const requireSignIn = () => {
    if (!user?.id) {
      showToast("Please sign in to manage your professional profile.", "error");
      return false;
    }
    return true;
  };

  const handleBasicsSave = async (e) => {
    e.preventDefault();
    if (!requireSignIn()) return;
    try {
      await updateVendorBasics(user.id, {
        experienceYears: Number(vendorProfile.experienceYears) || 0,
        specialty: vendorProfile.specialty,
        city: vendorProfile.city,
        hourlyRate: Number(vendorProfile.hourlyRate) || 0,
      });
      showToast("Experience & service location saved.", "success");
    } catch (err) {
      showToast(err?.message || "Could not save your profile.", "error");
    }
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    if (!requireSignIn()) return;
    const isEdit = Boolean(serviceForm.id);
    try {
      const services = await saveService(user.id, serviceForm);
      setVendorProfile((prev) => ({ ...prev, services }));
      setServiceForm({ id: null, title: "", description: "", price: "", duration: "" });
      showToast(isEdit ? "Service updated." : "Service added.", "success");
    } catch (err) {
      showToast(err?.message || "Could not save the service.", "error");
    }
  };

  const handleServiceDelete = async (id) => {
    if (!requireSignIn()) return;
    try {
      const services = await deleteService(user.id, id);
      setVendorProfile((prev) => ({ ...prev, services }));
      showToast("Service removed.", "info");
    } catch (err) {
      showToast(err?.message || "Could not remove the service.", "error");
    }
  };

  const handleCredSubmit = async (e) => {
    e.preventDefault();
    if (!requireSignIn()) return;
    try {
      const credentials = await saveCredential(user.id, credForm);
      setVendorProfile((prev) => ({ ...prev, credentials }));
      setCredForm({ title: "", issuer: "", year: "" });
      showToast("Qualification added.", "success");
    } catch (err) {
      showToast(err?.message || "Could not add the qualification.", "error");
    }
  };

  const handleCredDelete = async (id) => {
    if (!requireSignIn()) return;
    try {
      const credentials = await deleteCredential(user.id, id);
      setVendorProfile((prev) => ({ ...prev, credentials }));
      showToast("Qualification removed.", "info");
    } catch (err) {
      showToast(err?.message || "Could not remove the qualification.", "error");
    }
  };

  const proBookings = bookings;

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
            <span className="text-dark-900 font-semibold">Professional Vendor Portal</span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          {/* TOP VENDOR HERO BANNER */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold font-heading text-2xl shadow-soft overflow-hidden shrink-0 border border-border">
                  {vendorProfile?.image_url ? (
                    <img src={ikImage(vendorProfile.image_url)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <ShieldCheck className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-heading text-xl sm:text-2xl font-bold text-dark-900">
                      {vendorProfile?.name || "Professional"}
                    </h1>
                    {allApproved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified Pro
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3.5 h-3.5" /> Pending verification
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-500 mt-0.5">
                    Vendor ID: {user?.id?.substring(0, 8) || "..."} • 10% Platform Commission Tier
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label
                  className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isUploadingPhoto
                      ? "bg-dark-100 text-dark-400 cursor-wait"
                      : "border border-border hover:bg-dark-50 text-dark-700 cursor-pointer"
                  }`}
                >
                  {isUploadingPhoto ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-dark-400 border-t-transparent rounded-full animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" />
                      Change profile photo
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={isUploadingPhoto}
                  />
                </label>
                <Link
                  href={`/professionals/${user?.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold transition-colors"
                >
                  <span>View Public Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* PENDING VERIFICATION BANNER */}
          {!allApproved && (
            <div className="mb-8 flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Pending verification</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your profile is hidden from the public directory until an admin approves all of
                  your verification documents. Upload them in the Documents &amp; Verification tab.
                </p>
              </div>
            </div>
          )}

          {/* DASHBOARD TABS AND CONTENT */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border px-6 bg-dark-50/50 gap-6 overflow-x-auto no-scrollbar">
              {[
                { id: "earnings", label: "Earnings & Payouts", icon: DollarSign },
                { id: "bookings", label: `Client Bookings (${proBookings.length})`, icon: Calendar },
                { id: "schedule", label: "Working Hours & Schedule", icon: Clock },
                { id: "services", label: "Services & Experience", icon: Briefcase },
                { id: "verification", label: "Documents & Verification", icon: FileCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
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
              {/* TAB 1: EARNINGS & PAYOUTS */}
              {activeTab === "earnings" && (
                <div className="space-y-8">
                  {/* Financial Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs">
                      <span className="text-xs font-medium text-dark-500 block">
                        Total Gross Bookings
                      </span>
                      <span className="text-2xl font-bold font-heading text-dark-900 block mt-1.5">
                        {formatMoney(stats.gross)}
                      </span>
                      <span className="text-xs text-emerald-600 mt-1 block font-medium">
                        From completed client sessions
                      </span>
                    </div>

                    <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs">
                      <span className="text-xs font-medium text-dark-500 block">
                        Platform Fee ({Math.round(stats.commissionRate * 100)}%)
                      </span>
                      <span className="text-2xl font-bold font-heading text-dark-600 block mt-1.5">
                        {formatMoney(stats.commission)}
                      </span>
                      <span className="text-xs text-dark-400 mt-1 block">
                        Standard escrow commission
                      </span>
                    </div>

                    <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-xs">
                      <span className="text-xs font-medium text-emerald-800 block">
                        Available for Payout
                      </span>
                      <span className="text-2xl font-bold font-heading text-emerald-700 block mt-1.5">
                        {formatMoney(stats.available)}
                      </span>
                      <span className="text-xs text-emerald-600 mt-1 block font-medium">
                        Ready for instant withdrawal
                      </span>
                    </div>

                    <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs">
                      <span className="text-xs font-medium text-dark-500 block">
                        Paid Out to Date
                      </span>
                      <span className="text-2xl font-bold font-heading text-dark-900 block mt-1.5">
                        {formatMoney(stats.paidOut)}
                      </span>
                      <span className="text-xs text-dark-400 mt-1 block">
                        Direct to verified IBAN
                      </span>
                    </div>
                  </div>

                  {/* Request Payout Action Box */}
                  <div className="p-6 bg-gradient-to-r from-primary-900 to-dark-900 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-soft">
                    <div>
                      <h3 className="font-heading text-lg font-bold">
                        Withdraw Net Earnings to Bank Account
                      </h3>
                      <p className="text-xs text-white/80 mt-1">
                        Transfers sent via SEPA Instant directly to your verified IBAN (DE89...4401).
                      </p>
                    </div>

                    {isRequestingPayout ? (
                      <form
                        onSubmit={handlePayoutSubmit}
                        className="flex items-center gap-2.5 w-full md:w-auto"
                      >
                        <input
                          type="number"
                          step="0.01"
                          max={stats.available}
                          value={payoutAmountInput}
                          onChange={(e) => setPayoutAmountInput(e.target.value)}
                          className="px-3.5 py-2.5 bg-white text-dark-900 rounded-xl text-xs font-bold w-32 focus:outline-none"
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="text-xs py-2.5 bg-emerald-500 hover:bg-emerald-600 shadow-button"
                        >
                          Confirm
                        </Button>
                        <button
                          type="button"
                          onClick={() => setIsRequestingPayout(false)}
                          className="text-xs text-white/80 hover:text-white px-2"
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        disabled={stats.available <= 0}
                        onClick={() => setIsRequestingPayout(true)}
                        className="font-semibold text-xs py-3 px-6 shadow-button bg-primary-500 hover:bg-primary-600"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-1.5" />
                        Request Instant Payout ({formatMoney(stats.available)})
                      </Button>
                    )}
                  </div>

                  {/* Payout History Table */}
                  <div className="space-y-4">
                    <h3 className="font-heading text-base font-bold text-dark-900">
                      Recent Payouts History
                    </h3>
                    <div className="border border-border rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-dark-50 text-dark-700 font-bold border-b border-border">
                          <tr>
                            <th className="p-4">Payout ID</th>
                            <th className="p-4">Date</th>
                            <th className="p-4">Destination</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {payoutRows.map((p) => (
                            <tr key={p.id} className="hover:bg-dark-50/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-dark-900">{p.id}</td>
                              <td className="p-4 text-dark-600" suppressHydrationWarning>{p.date}</td>
                              <td className="p-4 text-dark-600">{p.method}</td>
                              <td className="p-4 font-bold text-emerald-700">{formatMoney(Number(p.amount))}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                  <CheckCircle2 className="w-3 h-3" /> {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLIENT BOOKINGS */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Client Appointments & Requests
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Update booking status in real-time as you start and complete services for clients.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {proBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 sm:p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs font-bold text-dark-900 bg-dark-50 px-2.5 py-0.5 rounded">
                              #{b.id}
                            </span>
                            <span className="text-dark-300">•</span>
                            <span className="text-xs text-dark-700 font-bold">{b.serviceTitle}</span>
                          </div>
                          <span className="text-xs font-bold text-primary-600 uppercase">
                            Status: {b.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="text-[11px] text-dark-400 block font-medium">Customer</span>
                            <span className="font-bold text-dark-900 block mt-0.5">{b.customerName}</span>
                            <span className="text-dark-500">{b.customerPhone}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-dark-400 block font-medium">Scheduled Time</span>
                            <span className="font-bold text-dark-900 block mt-0.5">
                              {b.date} at {b.timeSlot}
                            </span>
                            <span className="text-dark-500 truncate block">{b.address}</span>
                          </div>

                          <div>
                            <span className="text-[11px] text-dark-400 block font-medium">
                              Net Payout (After 10% Fee)
                            </span>
                            <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                              {formatMoney((b.servicePrice * 0.9))}
                            </span>
                            <span className="text-dark-400 text-[10px]">Held securely in escrow</span>
                          </div>
                        </div>

                        {/* Status Changer Actions */}
                        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                          <span className="text-xs text-dark-500 italic">
                            Customer Notes: {b.customerNotes}
                          </span>

                          <div className="flex items-center gap-2.5">
                            <Link
                              href={`/messages?booking=${b.id}`}
                              className="py-2 px-3.5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Message
                            </Link>
                            {b.status === "upcoming" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.id, "in_progress")}
                                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5" /> Start Service
                              </button>
                            )}
                            {b.status === "in_progress" && (
                              <button
                                type="button"
                                onClick={() => handleStatusChange(b.id, "completed")}
                                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                              >
                                <Check className="w-3.5 h-3.5" /> Mark Completed & Release Escrow
                              </button>
                            )}
                            {b.status === "completed" && (
                              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl">
                                ✓ Payout Credited to Balance
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SCHEDULE */}
              {activeTab === "schedule" && (
                <div className="space-y-6 max-w-2xl">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Weekly Operating Availability
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Toggle active days and configure working hours for customer bookings.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => (
                      <div
                        key={day}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface text-xs"
                      >
                        <span className="font-bold text-dark-900">{day}</span>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={scheduleState[day]}
                            onChange={(e) =>
                              setScheduleState({
                                ...scheduleState,
                                [day]: e.target.checked,
                              })
                            }
                            className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
                          />
                          <span className="text-dark-700 font-medium">
                            {scheduleState[day] ? "Available" : "Closed"}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        Daily Start Time
                      </label>
                      <input
                        type="time"
                        value={scheduleState.startTime}
                        onChange={(e) =>
                          setScheduleState({ ...scheduleState, startTime: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        Daily End Time
                      </label>
                      <input
                        type="time"
                        value={scheduleState.endTime}
                        onChange={(e) =>
                          setScheduleState({ ...scheduleState, endTime: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSaveSchedule}
                    className="font-semibold shadow-button text-xs py-3 px-6"
                  >
                    Save Operating Schedule
                  </Button>
                </div>
              )}

              {/* TAB: SERVICES & EXPERIENCE */}
              {activeTab === "services" && (
                <div className="space-y-10 max-w-3xl">
                  {/* Experience & service location */}
                  <form onSubmit={handleBasicsSave} className="space-y-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-dark-900">
                        Experience & Service Location
                      </h3>
                      <p className="text-xs text-dark-500 mt-0.5">
                        Shown on your public profile to help customers pick the right expert.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                          Years of Experience
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={vendorProfile.experienceYears}
                          onChange={(e) =>
                            setVendorProfile({ ...vendorProfile, experienceYears: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                          Base Hourly Rate (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={vendorProfile.hourlyRate || ""}
                          onChange={(e) =>
                            setVendorProfile({ ...vendorProfile, hourlyRate: e.target.value })
                          }
                          placeholder="e.g. 500"
                          className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                          Specialty
                        </label>
                        <input
                          type="text"
                          value={vendorProfile.specialty}
                          onChange={(e) =>
                            setVendorProfile({ ...vendorProfile, specialty: e.target.value })
                          }
                          placeholder="e.g. Emergency wiring & smart homes"
                          className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                          Service City
                        </label>
                        <input
                          type="text"
                          value={vendorProfile.city}
                          onChange={(e) =>
                            setVendorProfile({ ...vendorProfile, city: e.target.value })
                          }
                          placeholder="Mumbai"
                          className="w-full px-3.5 py-2.5 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="font-semibold shadow-button text-xs py-2.5 px-6"
                    >
                      Save Experience & Location
                    </Button>
                  </form>

                  {/* Services offered */}
                  <div className="pt-8 border-t border-border space-y-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-dark-900">
                        Services & Skills Offered
                      </h3>
                      <p className="text-xs text-dark-500 mt-0.5">
                        Customers pick from these when booking you. Prices are per service.
                      </p>
                    </div>

                    {vendorProfile.services.length === 0 ? (
                      <div className="p-5 rounded-2xl border border-dashed border-border bg-dark-50 text-center text-xs text-dark-500">
                        No services yet. Add your first below.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vendorProfile.services.map((s) => (
                          <div
                            key={s.id}
                            className="flex items-start justify-between gap-4 p-4 bg-dark-50 rounded-2xl border border-border"
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                                {s.title}
                              </h4>
                              {s.description && (
                                <p className="text-xs text-dark-500 mt-0.5">{s.description}</p>
                              )}
                              <p className="text-xs font-semibold text-primary-700 mt-1">
                                {formatMoney(Number(s.price) || 0)}
                                {s.duration ? ` • ${s.duration}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                aria-label="Edit service"
                                onClick={() =>
                                  setServiceForm({
                                    id: s.id,
                                    title: s.title,
                                    description: s.description || "",
                                    price: s.price,
                                    duration: s.duration || "",
                                  })
                                }
                                className="p-2 rounded-lg border border-border text-dark-600 hover:bg-white transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete service"
                                onClick={() => handleServiceDelete(s.id)}
                                className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={handleServiceSubmit}
                      className="p-5 rounded-2xl border border-primary-200 bg-primary-50/30 space-y-3"
                    >
                      <h4 className="font-heading text-sm font-bold text-dark-900">
                        {serviceForm.id ? "Edit service" : "Add a service"}
                      </h4>
                      <input
                        type="text"
                        required
                        value={serviceForm.title}
                        onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                        placeholder="Service title (e.g. Emergency Leak Repair)"
                        className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <input
                        type="text"
                        value={serviceForm.description}
                        onChange={(e) =>
                          setServiceForm({ ...serviceForm, description: e.target.value })
                        }
                        placeholder="Short description (optional)"
                        className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={serviceForm.price}
                          onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                          placeholder="Price"
                          className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                          type="text"
                          value={serviceForm.duration}
                          onChange={(e) =>
                            setServiceForm({ ...serviceForm, duration: e.target.value })
                          }
                          placeholder="Duration (e.g. 60 mins)"
                          className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          className="font-semibold shadow-button text-xs py-2.5 px-5"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1.5" />
                          {serviceForm.id ? "Save Changes" : "Add Service"}
                        </Button>
                        {serviceForm.id && (
                          <button
                            type="button"
                            onClick={() =>
                              setServiceForm({
                                id: null,
                                title: "",
                                description: "",
                                price: "",
                                duration: "",
                              })
                            }
                            className="text-xs text-dark-600 hover:text-dark-900 px-2"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Qualifications */}
                  <div className="pt-8 border-t border-border space-y-4">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-dark-900">
                        Qualifications & Certifications
                      </h3>
                      <p className="text-xs text-dark-500 mt-0.5">
                        Degrees, licenses and certifications shown on your public profile.
                      </p>
                    </div>

                    {vendorProfile.credentials.length === 0 ? (
                      <div className="p-5 rounded-2xl border border-dashed border-border bg-dark-50 text-center text-xs text-dark-500">
                        No qualifications added yet.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {vendorProfile.credentials.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between gap-4 p-4 bg-dark-50 rounded-2xl border border-border"
                          >
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                                {c.title}
                              </h4>
                              <p className="text-xs text-dark-500 mt-0.5">
                                {[c.issuer, c.year].filter(Boolean).join(" • ")}
                              </p>
                            </div>
                            <button
                              type="button"
                              aria-label="Delete qualification"
                              onClick={() => handleCredDelete(c.id)}
                              className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <form
                      onSubmit={handleCredSubmit}
                      className="p-5 rounded-2xl border border-primary-200 bg-primary-50/30 space-y-3"
                    >
                      <h4 className="font-heading text-sm font-bold text-dark-900">
                        Add a qualification
                      </h4>
                      <input
                        type="text"
                        required
                        value={credForm.title}
                        onChange={(e) => setCredForm({ ...credForm, title: e.target.value })}
                        placeholder="Qualification (e.g. Master Electrician Certification)"
                        className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={credForm.issuer}
                          onChange={(e) => setCredForm({ ...credForm, issuer: e.target.value })}
                          placeholder="Issuer (e.g. Maharashtra Board)"
                          className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                        <input
                          type="text"
                          value={credForm.year}
                          onChange={(e) => setCredForm({ ...credForm, year: e.target.value })}
                          placeholder="Year"
                          className="w-full px-3.5 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="font-semibold shadow-button text-xs py-2.5 px-5"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Qualification
                      </Button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: VERIFICATION */}
              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Identity & Professional Credentials
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Upload the documents our compliance team reviews. Your profile stays hidden
                      from the public directory until every document is approved.
                    </p>
                  </div>

                  {isLoadingDocs ? (
                    <div className="flex items-center justify-center py-8 text-xs text-dark-400">
                      <div className="h-4 w-4 border-2 border-primary-400 border-t-transparent rounded-full animate-spin mr-2" />
                      Loading your documents…
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-border bg-dark-50 text-center text-xs text-dark-500">
                      No documents uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-dark-50 rounded-2xl border border-border"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                                {doc.type}
                              </h4>
                              <p className="text-xs text-dark-500 mt-0.5" suppressHydrationWarning>
                                {doc.file_path?.split("/").pop()} • Uploaded{" "}
                                {doc.created_at
                                  ? new Date(doc.created_at).toLocaleDateString()
                                  : "just now"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                              docStatusStyles[doc.status] || "text-dark-600 bg-dark-50"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-6 border-2 border-dashed border-primary-200 bg-primary-50/30 rounded-2xl space-y-4">
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                      <h4 className="font-heading text-sm font-bold text-dark-900">
                        Upload a verification document
                      </h4>
                      <p className="text-xs text-dark-500 max-w-md mx-auto mt-1">
                        PDF or image. New uploads start as pending until an admin reviews them.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        disabled={isUploading}
                        aria-label="Document type"
                        className="w-full sm:w-auto px-3 py-2.5 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      >
                        {documentTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <label
                        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                          isUploading
                            ? "bg-primary-300 text-white cursor-wait"
                            : "bg-primary-500 hover:bg-primary-600 text-white shadow-button cursor-pointer"
                        }`}
                      >
                        {isUploading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading…
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Choose File
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={handleDocUpload}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
