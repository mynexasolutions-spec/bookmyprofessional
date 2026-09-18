"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";

export default function VendorPortalPage() {
  const {
    proVendorState,
    bookings,
    updateBookingStatus,
    requestPayout,
    uploadDocument,
  } = useMarketplace();
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState("earnings"); // "earnings" | "bookings" | "schedule" | "verification"
  const [payoutAmountInput, setPayoutAmountInput] = useState(
    proVendorState.availablePayout.toString()
  );
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
                <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold font-heading text-2xl shadow-soft">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="font-heading text-xl sm:text-2xl font-bold text-dark-900">
                      {proVendorState.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Verified Pro
                    </span>
                  </div>
                  <p className="text-xs text-dark-500 mt-0.5">
                    Vendor ID: {proVendorState.id} • 10% Platform Commission Tier
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/professionals/${proVendorState.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold transition-colors"
                >
                  <span>View Public Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* DASHBOARD TABS AND CONTENT */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border px-6 bg-dark-50/50 gap-6 overflow-x-auto no-scrollbar">
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
                        €{proVendorState.totalGrossEarnings}.00
                      </span>
                      <span className="text-xs text-emerald-600 mt-1 block font-medium">
                        From completed client sessions
                      </span>
                    </div>

                    <div className="p-5 bg-surface rounded-2xl border border-border shadow-xs">
                      <span className="text-xs font-medium text-dark-500 block">
                        Platform Fee (10%)
                      </span>
                      <span className="text-2xl font-bold font-heading text-dark-600 block mt-1.5">
                        €
                        {(
                          proVendorState.totalGrossEarnings * proVendorState.commissionRate
                        ).toFixed(2)}
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
                        €{proVendorState.availablePayout}.00
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
                        €{proVendorState.paidOutAmount}.00
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
                          max={proVendorState.availablePayout}
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
                        disabled={proVendorState.availablePayout <= 0}
                        onClick={() => setIsRequestingPayout(true)}
                        className="font-semibold text-xs py-3 px-6 shadow-button bg-primary-500 hover:bg-primary-600"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-1.5" />
                        Request Instant Payout (€{proVendorState.availablePayout}.00)
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
                          {proVendorState.payoutHistory.map((p) => (
                            <tr key={p.id} className="hover:bg-dark-50/50 transition-colors">
                              <td className="p-4 font-mono font-bold text-dark-900">{p.id}</td>
                              <td className="p-4 text-dark-600">{p.date}</td>
                              <td className="p-4 text-dark-600">{p.method}</td>
                              <td className="p-4 font-bold text-emerald-700">€{p.amount}.00</td>
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
                              €{(b.servicePrice * 0.9).toFixed(2)}
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
                            {b.status === "upcoming" && (
                              <button
                                type="button"
                                onClick={() => updateBookingStatus(b.id, "in_progress")}
                                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                              >
                                <Play className="w-3.5 h-3.5" /> Start Service
                              </button>
                            )}
                            {b.status === "in_progress" && (
                              <button
                                type="button"
                                onClick={() => updateBookingStatus(b.id, "completed")}
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

              {/* TAB 4: VERIFICATION */}
              {activeTab === "verification" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-dark-900">
                      Identity & Professional Credentials
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      Verified documents audited according to European compliance guidelines.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {proVendorState.uploadedDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-dark-50 rounded-2xl border border-border"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                              {doc.name}
                            </h4>
                            <p className="text-xs text-dark-500 mt-0.5">
                              {doc.type} • Uploaded on {doc.date}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Upload Simulator */}
                  <div
                    onClick={handleDocUploadSim}
                    className="p-8 border-2 border-dashed border-primary-200 hover:border-primary-400 bg-primary-50/30 rounded-2xl text-center cursor-pointer transition-colors"
                  >
                    <Upload className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                    <h4 className="font-heading text-sm font-bold text-dark-900">
                      Upload Additional License or Insurance Document
                    </h4>
                    <p className="text-xs text-dark-500 max-w-md mx-auto mt-1">
                      Click to simulate uploading your newest liability insurance, tax certificate, or trade degree copy (PDF/JPG).
                    </p>
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
