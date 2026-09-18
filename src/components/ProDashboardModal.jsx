"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
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
} from "lucide-react";
import Button from "./Button";

export default function ProDashboardModal() {
  const {
    isProDashboardOpen,
    setIsProDashboardOpen,
    proVendorState,
    bookings,
    updateBookingStatus,
    requestPayout,
    uploadDocument,
  } = useMarketplace();
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState("earnings"); // "earnings" | "bookings" | "schedule" | "verification"
  const [payoutAmountInput, setPayoutAmountInput] = useState("");
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

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

  // Lock body scroll
  useEffect(() => {
    if (isProDashboardOpen) {
      document.body.style.overflow = "hidden";
      setPayoutAmountInput(proVendorState.availablePayout.toString());
    } else {
      document.body.style.overflow = "unset";
      setIsRequestingPayout(false);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isProDashboardOpen, proVendorState.availablePayout]);

  if (!isProDashboardOpen) return null;

  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(payoutAmountInput);
    if (!amt || amt <= 0) {
      showToast("Please enter a valid payout amount.", "error");
      return;
    }
    const success = requestPayout(amt);
    if (success) {
      setIsRequestingPayout(false);
    }
  };

  const handleDocUploadSim = () => {
    uploadDocument("Trade & Liability Insurance Certificate", "Liability_Insurance_2026.pdf");
  };

  const handleSaveSchedule = () => {
    showToast("Weekly operating hours saved successfully!", "success");
  };

  const proBookings = bookings;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setIsProDashboardOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-4xl my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border bg-surface flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-heading text-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-base sm:text-lg font-bold text-dark-900 leading-tight">
                  Professional Vendor Portal
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <Check className="w-3 h-3 stroke-[3]" /> Verified Pro
                </span>
              </div>
              <p className="text-xs text-dark-500">
                Logged in as {proVendorState.name} • 10% Platform Commission Tier
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsProDashboardOpen(false)}
            className="p-2 rounded-full text-dark-400 hover:text-dark-800 hover:bg-dark-50 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-border px-4 sm:px-6 bg-dark-50/50 gap-4 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: "earnings", label: "Earnings & Payouts", icon: DollarSign },
            { id: "bookings", label: `Client Bookings (${proBookings.length})`, icon: Calendar },
            { id: "schedule", label: "Working Hours & Schedule", icon: Clock },
            { id: "verification", label: "Documents & Verification", icon: FileCheck },
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: EARNINGS & PAYOUTS */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              {/* Financial Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 bg-surface rounded-xl border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-dark-500 block">Total Gross Bookings</span>
                  <span className="text-xl font-bold font-heading text-dark-900 block mt-1">
                    €{proVendorState.totalGrossEarnings}.00
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1 block">From completed sessions</span>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-dark-500 block">Platform Fee (10%)</span>
                  <span className="text-xl font-bold font-heading text-dark-600 block mt-1">
                    €{(proVendorState.totalGrossEarnings * proVendorState.commissionRate).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-dark-400 mt-1 block">Standard market commission</span>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[11px] font-medium text-emerald-800 block">Available for Payout</span>
                  <span className="text-xl font-bold font-heading text-emerald-700 block mt-1">
                    €{proVendorState.availablePayout}.00
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-1 block">Ready for instant transfer</span>
                </div>

                <div className="p-4 bg-surface rounded-xl border border-border shadow-xs">
                  <span className="text-[11px] font-medium text-dark-500 block">Paid Out to Date</span>
                  <span className="text-xl font-bold font-heading text-dark-900 block mt-1">
                    €{proVendorState.paidOutAmount}.00
                  </span>
                  <span className="text-[10px] text-dark-400 mt-1 block">Transferred to Bank Account</span>
                </div>
              </div>

              {/* Request Payout Action Box */}
              <div className="p-5 bg-gradient-to-r from-primary-900 to-dark-900 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft">
                <div>
                  <h3 className="font-heading text-base font-bold">
                    Withdraw Earnings to Bank Account
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Transfers are sent via SEPA Instant directly to your verified IBAN (DE89...4401).
                  </p>
                </div>

                {isRequestingPayout ? (
                  <form onSubmit={handlePayoutSubmit} className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="number"
                      step="0.01"
                      max={proVendorState.availablePayout}
                      value={payoutAmountInput}
                      onChange={(e) => setPayoutAmountInput(e.target.value)}
                      className="px-3 py-2 bg-white text-dark-900 rounded-lg text-xs font-bold w-28 focus:outline-none"
                    />
                    <Button type="submit" variant="primary" size="sm" className="text-xs py-2 bg-emerald-500 hover:bg-emerald-600">
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
                    size="sm"
                    disabled={proVendorState.availablePayout <= 0}
                    onClick={() => setIsRequestingPayout(true)}
                    className="font-semibold text-xs py-2.5 px-5 shadow-button bg-primary-500 hover:bg-primary-600"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    Request Payout (€{proVendorState.availablePayout}.00)
                  </Button>
                )}
              </div>

              {/* Payout History Table */}
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900 mb-2">
                  Recent Payout History
                </h4>
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-dark-50 text-dark-700 font-semibold border-b border-border">
                      <tr>
                        <th className="p-3">Payout ID</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {proVendorState.payoutHistory.map((p) => (
                        <tr key={p.id} className="hover:bg-dark-50/50">
                          <td className="p-3 font-mono font-bold text-dark-900">{p.id}</td>
                          <td className="p-3 text-dark-600">{p.date}</td>
                          <td className="p-3 text-dark-600">{p.method}</td>
                          <td className="p-3 font-bold text-emerald-700">€{p.amount}.00</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
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
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900">
                  Client Appointments & Requests
                </h4>
                <p className="text-xs text-dark-500">
                  Update booking statuses as you fulfill services for your clients.
                </p>
              </div>

              <div className="space-y-3">
                {proBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl border border-border bg-surface shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-dark-900">
                          #{b.id}
                        </span>
                        <span className="text-dark-300">•</span>
                        <span className="text-xs text-dark-600 font-semibold">{b.serviceTitle}</span>
                      </div>
                      <span className="text-xs font-bold text-primary-600 uppercase">
                        Status: {b.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-[11px] text-dark-400 block">Customer</span>
                        <span className="font-bold text-dark-900 block">{b.customerName}</span>
                        <span className="text-dark-500">{b.customerPhone}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-dark-400 block">Scheduled Time</span>
                        <span className="font-bold text-dark-900 block">
                          {b.date} at {b.timeSlot}
                        </span>
                        <span className="text-dark-500 truncate block">{b.address}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-dark-400 block">Payout (After 10% Fee)</span>
                        <span className="font-bold text-emerald-700 block">
                          €{(b.servicePrice * 0.9).toFixed(2)}
                        </span>
                        <span className="text-dark-400 text-[10px]">Held securely in escrow</span>
                      </div>
                    </div>

                    {/* Status Changer Actions */}
                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                      <span className="text-xs text-dark-500 italic">
                        Notes: {b.customerNotes}
                      </span>

                      <div className="flex items-center gap-2">
                        {b.status === "upcoming" && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, "in_progress")}
                            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <Play className="w-3.5 h-3.5" /> Start Service
                          </button>
                        )}
                        {b.status === "in_progress" && (
                          <button
                            type="button"
                            onClick={() => updateBookingStatus(b.id, "completed")}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Mark Completed & Release Escrow
                          </button>
                        )}
                        {b.status === "completed" && (
                          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
                            ✓ Payout Credited
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
            <div className="space-y-4 max-w-xl">
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900">
                  Weekly Operating Schedule
                </h4>
                <p className="text-xs text-dark-500">
                  Clients can only book appointments during your active days and hours.
                </p>
              </div>

              <div className="space-y-2">
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
                    className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface text-xs"
                  >
                    <span className="font-semibold text-dark-900">{day}</span>
                    <label className="flex items-center gap-2 cursor-pointer">
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
                      <span className="text-dark-600 font-medium">
                        {scheduleState[day] ? "Available" : "Off Day"}
                      </span>
                    </label>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Daily Start Time
                  </label>
                  <input
                    type="time"
                    value={scheduleState.startTime}
                    onChange={(e) =>
                      setScheduleState({ ...scheduleState, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-700 mb-1">
                    Daily End Time
                  </label>
                  <input
                    type="time"
                    value={scheduleState.endTime}
                    onChange={(e) =>
                      setScheduleState({ ...scheduleState, endTime: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-dark-50 border border-border rounded-lg text-xs"
                  />
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveSchedule}
                className="font-semibold shadow-button text-xs py-2.5 px-4"
              >
                Save Operating Schedule
              </Button>
            </div>
          )}

          {/* TAB 4: VERIFICATION & DOCUMENTS */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-heading text-sm font-bold text-dark-900">
                  Identity & Professional Licenses
                </h4>
                <p className="text-xs text-dark-500">
                  All verified documents are audited according to European compliance guidelines.
                </p>
              </div>

              <div className="space-y-3">
                {proVendorState.uploadedDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-dark-50 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-bold text-dark-900">
                          {doc.name}
                        </h5>
                        <p className="text-[11px] text-dark-500">
                          {doc.type} • Uploaded on {doc.date}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  </div>
                ))}
              </div>

              {/* Upload simulation card */}
              <div
                onClick={handleDocUploadSim}
                className="p-6 border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/30 rounded-2xl text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                <h5 className="font-heading text-xs sm:text-sm font-bold text-dark-900">
                  Upload Additional License or Insurance Document
                </h5>
                <p className="text-xs text-dark-500 max-w-sm mx-auto mt-1">
                  Click to simulate uploading your newest liability insurance, tax certificate, or degree copy (PDF/JPG).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
