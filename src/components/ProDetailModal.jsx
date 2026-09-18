"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  X,
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  Award,
  CheckCircle2,
  FileCheck,
  Check,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Share2,
  Heart,
} from "lucide-react";
import Button from "./Button";

export default function ProDetailModal() {
  const { selectedPro, closeProDetail, startBooking } = useMarketplace();
  const [activeTab, setActiveTab] = useState("services"); // "services" | "about" | "credentials" | "reviews" | "schedule"

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedPro) {
        closeProDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPro, closeProDetail]);

  // Lock body scroll
  useEffect(() => {
    if (selectedPro) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setActiveTab("services");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPro]);

  if (!selectedPro) return null;

  return (
    <div className="fixed inset-0 z-[998] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={closeProDetail}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-3xl my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Cover & Close Button */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-r from-dark-900 via-primary-950 to-primary-900 p-4 sm:p-6 flex items-start justify-between">
          {/* Subtle background decorative shapes */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

          {/* Category Tag */}
          <span className="relative z-10 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            {selectedPro.category}
          </span>

          <button
            type="button"
            onClick={closeProDetail}
            className="relative z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Card Summary Banner */}
        <div className="px-5 sm:px-8 pb-4 relative border-b border-border bg-surface">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-3">
            {/* Avatar & Info */}
            <div className="flex items-end gap-3.5">
              <div className="relative">
                <img
                  src={selectedPro.image}
                  alt={selectedPro.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-surface shadow-lg bg-dark-100"
                />
                {selectedPro.verified && (
                  <div
                    className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-surface shadow-xs"
                    title="Verified Identity & License"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-dark-900 leading-tight">
                    {selectedPro.name}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm font-medium text-primary-600 mt-0.5">
                  {selectedPro.role}
                </p>
                <div className="flex items-center gap-3 text-xs text-dark-500 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-dark-400" />
                    {selectedPro.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-dark-400" />
                    {selectedPro.responseTime} response
                  </span>
                </div>
              </div>
            </div>

            {/* Rating & Quick Book Action */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm text-dark-900">{selectedPro.rating}</span>
                <span className="text-xs text-dark-500">({selectedPro.reviewCount} reviews)</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-dark-400 block">Starting from</span>
                <span className="text-lg font-bold text-dark-900">€{selectedPro.price}</span>
                <span className="text-xs text-dark-500">/{selectedPro.unit}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-1 pt-2">
            {[
              { id: "services", label: `Services & Pricing (${selectedPro.services?.length || 0})` },
              { id: "about", label: "About & Bio" },
              { id: "credentials", label: "Credentials & Verification" },
              { id: "reviews", label: `Reviews (${selectedPro.reviews?.length || 0})` },
              { id: "schedule", label: "Weekly Schedule" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-dark-500 hover:text-dark-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SERVICES & PRICING */}
          {activeTab === "services" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-sm font-bold text-dark-900">
                    Available Service Packages
                  </h3>
                  <p className="text-xs text-dark-500">
                    Select a service package below to proceed to date & time selection.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedPro.services?.map((srv) => (
                  <div
                    key={srv.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border hover:border-primary-300 hover:bg-primary-50/20 transition-all bg-surface shadow-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-bold text-dark-900">
                          {srv.title}
                        </h4>
                        <span className="text-[11px] font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                          {srv.duration}
                        </span>
                      </div>
                      <p className="text-xs text-dark-600 leading-relaxed">
                        {srv.description}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <span className="font-heading text-base sm:text-lg font-bold text-dark-900">
                        €{srv.price}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => startBooking(selectedPro, srv)}
                        className="text-xs py-1.5 px-3.5 shadow-button"
                      >
                        Book Package
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT & BIO */}
          {activeTab === "about" && (
            <div className="space-y-5">
              <div>
                <h3 className="font-heading text-sm font-bold text-dark-900 mb-2">
                  Professional Summary
                </h3>
                <p className="text-xs sm:text-sm text-dark-700 leading-relaxed">
                  {selectedPro.about || selectedPro.bio}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-dark-50 rounded-xl border border-border">
                  <span className="block text-[11px] text-dark-400 font-medium">Experience</span>
                  <span className="block text-sm font-bold text-dark-900">
                    {selectedPro.experienceYears}+ Years
                  </span>
                </div>
                <div className="p-3 bg-dark-50 rounded-xl border border-border">
                  <span className="block text-[11px] text-dark-400 font-medium">Verified Status</span>
                  <span className="block text-sm font-bold text-emerald-700">
                    ID & License Checked
                  </span>
                </div>
                <div className="p-3 bg-dark-50 rounded-xl border border-border col-span-2 sm:col-span-1">
                  <span className="block text-[11px] text-dark-400 font-medium">Customer Rating</span>
                  <span className="block text-sm font-bold text-dark-900">
                    {selectedPro.rating} / 5.0 Rating
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>BookMyProfessional Service Guarantee</span>
                </div>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  All bookings with {selectedPro.name} are backed by our escrow protection, satisfaction rematching guarantee, and 24/7 client support.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: CREDENTIALS & LICENSES */}
          {activeTab === "credentials" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-sm font-bold text-dark-900 mb-1">
                  Verified Degrees, Licenses & Certifications
                </h3>
                <p className="text-xs text-dark-500">
                  Credentials reviewed and verified by the BookMyProfessional compliance team.
                </p>
              </div>

              <div className="space-y-2.5">
                {selectedPro.credentials?.map((cred, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-dark-50/80 rounded-xl border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                          {cred.title}
                        </h4>
                        <p className="text-[11px] text-dark-500">
                          Issued by {cred.issuer} • {cred.year}
                        </p>
                      </div>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REVIEWS & RATINGS */}
          {activeTab === "reviews" && (
            <div className="space-y-5">
              {/* Rating Summary Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-dark-50 rounded-xl border border-border">
                <div className="text-center sm:text-left shrink-0">
                  <div className="font-heading text-3xl font-extrabold text-dark-900">
                    {selectedPro.rating}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(selectedPro.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-dark-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-dark-500">
                    Based on {selectedPro.reviews?.length || 0} verified client reviews
                  </span>
                </div>

                <div className="border-t sm:border-t-0 sm:border-l border-border pt-3 sm:pt-0 sm:pl-5 flex-1 w-full space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Service Quality</span>
                    <span className="font-semibold text-dark-900">4.9 / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Punctuality</span>
                    <span className="font-semibold text-dark-900">5.0 / 5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Communication & Value</span>
                    <span className="font-semibold text-dark-900">4.8 / 5.0</span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {selectedPro.reviews?.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-border bg-surface space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-dark-900">
                              {rev.userName}
                            </span>
                            {rev.verifiedBooking && (
                              <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                                Verified Booking
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-dark-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-dark-700 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: WEEKLY SCHEDULE */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              <div>
                <h3 className="font-heading text-sm font-bold text-dark-900 mb-1">
                  Standard Operating Hours
                </h3>
                <p className="text-xs text-dark-500">
                  {selectedPro.name} is available for instant booking during these times:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => {
                  const isAvailable = selectedPro.availability?.days?.includes(day);
                  return (
                    <div
                      key={day}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                        isAvailable
                          ? "bg-surface border-border text-dark-900"
                          : "bg-dark-50/50 border-dashed border-border text-dark-400"
                      }`}
                    >
                      <span className="font-semibold">{day}</span>
                      <span className={isAvailable ? "text-primary-600 font-medium" : "text-dark-400"}>
                        {isAvailable ? selectedPro.availability.hours : "Closed"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Fixed CTA */}
        <div className="p-4 sm:p-5 border-t border-border bg-surface flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="hidden sm:block">
            <span className="text-xs text-dark-500 block">Next Available Slot:</span>
            <span className="text-xs font-bold text-emerald-700">
              Today • 02:00 PM (Instant Confirmation)
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={closeProDetail}
              className="flex-1 sm:flex-none justify-center text-xs py-2.5 px-4"
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => startBooking(selectedPro)}
              className="flex-1 sm:flex-none justify-center text-xs py-2.5 px-6 font-semibold shadow-button"
            >
              <Calendar className="h-4 w-4 mr-1.5" />
              Book Appointment Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
