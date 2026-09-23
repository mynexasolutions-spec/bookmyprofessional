"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import { reportReview } from "@/lib/data/reviews";
import { ikImage } from "@/lib/imagekit";
import {
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
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Share2,
  Heart,
  Phone,
  Mail,
  Shield,
  Zap,
  Flag,
} from "lucide-react";
import { formatMoney } from "@/lib/money";

export default function ProfessionalDetailPage({ params }) {
  const unwrappedParams = use(params);
  const proId = unwrappedParams.id;
  const { professionals, startBooking, isLoadingProfessionals } = useMarketplace();
  const { showToast } = useAuth();

  const [activeTab, setActiveTab] = useState("services"); // "services" | "about" | "credentials" | "reviews" | "schedule"
  const [isSaved, setIsSaved] = useState(false);
  const [reported, setReported] = useState({});

  const handleReport = async (review) => {
    try {
      await reportReview(review.id);
      setReported((prev) => ({ ...prev, [review.id]: true }));
      showToast("Review reported. Thanks for helping keep the marketplace safe.", "success");
    } catch {
      showToast("Unable to report this review right now.", "error");
    }
  };

  // Find professional by id or slug. No silent fallback: an unknown id must not render someone else.
  const pro =
    professionals.find((p) => p.id === proId) ||
    professionals.find((p) => p.name.toLowerCase().replace(/[^a-z0-9]/g, "-").includes(proId));

  if (!pro) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-dark-800">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h1 className="font-heading text-2xl font-bold text-dark-900">
              {isLoadingProfessionals ? "Loading professional…" : "Professional not found"}
            </h1>
            {!isLoadingProfessionals && (
              <>
                <p className="text-sm text-dark-500 mt-2">
                  This professional may have been removed or is no longer available.
                </p>
                <Link
                  href="/professionals"
                  className="inline-flex items-center justify-center mt-5 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-button transition-colors"
                >
                  Browse Professionals
                </Link>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

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
            <Link href="/professionals" className="hover:text-primary-600 transition-colors">
              Professionals
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
            <span className="text-dark-900 font-semibold truncate">{pro.name}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          {/* TOP PROFILE HERO CARD */}
          <div className="bg-surface rounded-3xl border border-border shadow-card overflow-hidden mb-8">
            {/* Header Banner Background */}
            <div className="relative h-40 sm:h-52 bg-gradient-to-r from-dark-900 via-primary-950 to-primary-900 p-6 flex items-start justify-between overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

              <span className="relative z-10 bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {pro.category}
              </span>

              <div className="relative z-10 flex items-center gap-2">
                <Link
                  href="/messages"
                  className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title="Message Professional"
                >
                  <MessageSquare className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                  title="Save Professional"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                </button>
              </div>
            </div>

            {/* Profile Bar Details */}
            <div className="px-6 sm:px-8 pb-6 relative">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 -mt-16 sm:-mt-20 mb-6">
                {/* Avatar & Title */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={ikImage(pro.image)}
                      alt={pro.name}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-surface shadow-xl bg-dark-100"
                    />
                    {pro.verified && (
                      <div
                        className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-2 border-surface shadow-md"
                        title="Identity & License Verified"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-900">
                        {pro.name}
                      </h1>
                      {pro.verified && (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Verified Expert
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-primary-600 mt-1">
                      {pro.role}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-dark-500 mt-2">
                      <span className="flex items-center gap-1 text-dark-700 font-medium">
                        <MapPin className="h-3.5 w-3.5 text-primary-500" />
                        {pro.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-dark-400" />
                        {pro.responseTime} response time
                      </span>
                      <span>•</span>
                      <span className="text-dark-700 font-medium bg-dark-50 px-2 py-0.5 rounded-md">
                        {pro.experienceYears}+ Years Experience
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating & Action */}
                <div className="flex flex-col sm:items-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <div>
                      {pro.reviewCount > 0 ? (
                        <>
                          <span className="font-heading font-bold text-base text-dark-900">
                            {pro.rating}
                          </span>
                          <span className="text-xs text-dark-500 ml-1 font-normal">
                            ({pro.reviewCount} reviews)
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-primary-700">New professional</span>
                      )}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-dark-400 block font-semibold uppercase">
                      Starting from
                    </span>
                    <span className="font-heading text-2xl font-bold text-dark-900">
                      {formatMoney(pro.price, 0)}
                    </span>
                    <span className="text-xs text-dark-500">/{pro.unit}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-border overflow-x-auto no-scrollbar gap-2 pt-2">
                {[
                  { id: "services", label: `Services & Pricing (${pro.services?.length || 0})` },
                  { id: "about", label: "About & Background" },
                  { id: "credentials", label: "Credentials & Verification" },
                  { id: "reviews", label: `Client Reviews (${pro.reviews?.length || 0})` },
                  { id: "schedule", label: "Operating Schedule" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600 bg-primary-50/50 rounded-t-lg"
                        : "border-transparent text-dark-600 hover:text-dark-900 hover:bg-dark-50 rounded-t-lg"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN TWO COLUMN CONTENT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (2 Cols) - Dynamic Tabs Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* TAB 1: SERVICES & PRICING */}
              {activeTab === "services" && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-4">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-dark-900">
                      Available Service Packages
                    </h2>
                    <p className="text-xs text-dark-500">
                      Select a service package below to book with instant confirmation.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    {pro.services?.map((srv) => (
                      <div
                        key={srv.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border hover:border-primary-300 hover:bg-primary-50/20 transition-all bg-surface shadow-xs"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="font-heading text-base font-bold text-dark-900">
                              {srv.title}
                            </h3>
                            <span className="text-[11px] font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full">
                              {srv.duration}
                            </span>
                          </div>
                          <p className="text-xs text-dark-600 leading-relaxed">
                            {srv.description}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                          <span className="font-heading text-xl font-bold text-dark-900">
                            {formatMoney(srv.price)}
                          </span>
                          <Link
                            href={`/book/${pro.id}?service=${srv.id}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs shadow-button transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5 mr-1.5" />
                            Book Package
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT & BACKGROUND */}
              {activeTab === "about" && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-dark-900 mb-2">
                      About {pro.name}
                    </h2>
                    <p className="text-sm text-dark-700 leading-relaxed">
                      {pro.about || pro.bio}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-dark-50 rounded-xl border border-border">
                      <span className="block text-xs text-dark-400 font-medium">Experience</span>
                      <span className="block text-base font-bold text-dark-900 mt-1">
                        {pro.experienceYears}+ Years Active
                      </span>
                    </div>
                    <div className="p-4 bg-dark-50 rounded-xl border border-border">
                      <span className="block text-xs text-dark-400 font-medium">Verification</span>
                      <span className="block text-base font-bold text-emerald-700 mt-1">
                        100% ID & License
                      </span>
                    </div>
                    <div className="p-4 bg-dark-50 rounded-xl border border-border col-span-2 sm:col-span-1">
                      <span className="block text-xs text-dark-400 font-medium">Satisfaction</span>
                      <span className="block text-base font-bold text-dark-900 mt-1">
                        {pro.reviewCount > 0 ? `${pro.rating} / 5.0 Star Rating` : "No ratings yet"}
                      </span>
                    </div>
                  </div>

                  {/* Guarantee banner */}
                  <div className="p-5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-heading text-xs sm:text-sm font-bold text-emerald-900">
                        BookMyProfessional Escrow & Rematching Protection
                      </h4>
                      <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                        Your payment is held safely in escrow and only released once your service is fulfilled. Free cancellation up to 24h prior to appointment.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CREDENTIALS & LICENSES */}
              {activeTab === "credentials" && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-5">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-dark-900 mb-1">
                      Verified Credentials, Degrees & Licenses
                    </h2>
                    <p className="text-xs text-dark-500">
                      All documents independently reviewed and verified by our compliance team.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {pro.credentials?.map((cred, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-dark-50 rounded-xl border border-border"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold text-dark-900">
                              {cred.title}
                            </h4>
                            <p className="text-xs text-dark-500 mt-0.5">
                              Issued by {cred.issuer} • {cred.year}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full shrink-0">
                          Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: REVIEWS */}
              {activeTab === "reviews" && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-6">
                  {/* Rating Header Breakdown */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 bg-dark-50 rounded-xl border border-border">
                    <div className="text-center sm:text-left shrink-0">
                      <div className="font-heading text-4xl font-extrabold text-dark-900">
                        {pro.reviewCount > 0 ? pro.rating : "—"}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1 my-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(pro.rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-dark-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-dark-500 font-medium">
                        Based on {pro.reviews?.length || 0} verified client reviews
                      </span>
                    </div>

                    {/* Sub-scores averaged from real review breakdown data (hidden until any exists) */}
                    {(() => {
                      const rows = (pro.reviews || []).filter(
                        (r) => r.breakdown && Object.keys(r.breakdown).length
                      );
                      if (!rows.length) return null;
                      const keys = [...new Set(rows.flatMap((r) => Object.keys(r.breakdown)))];
                      return (
                        <div className="border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6 flex-1 w-full space-y-2 text-xs">
                          {keys.map((k) => {
                            const vals = rows
                              .map((r) => Number(r.breakdown[k]))
                              .filter((n) => Number.isFinite(n));
                            if (!vals.length) return null;
                            const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
                            return (
                              <div key={k} className="flex items-center justify-between">
                                <span className="text-dark-600 font-medium capitalize">{k}</span>
                                <span className="font-bold text-dark-900">{avg} / 5.0</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3.5">
                    {(!pro.reviews || pro.reviews.length === 0) && (
                      <div className="p-8 text-center bg-dark-50 rounded-2xl border border-dashed border-border">
                        <p className="text-sm font-semibold text-dark-900">No reviews yet</p>
                        <p className="text-xs text-dark-500 mt-1">
                          Be the first to book {pro.name} and share your experience.
                        </p>
                      </div>
                    )}
                    {pro.reviews?.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-xl border border-border bg-surface space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={rev.userAvatar}
                              alt={rev.userName}
                              className="w-9 h-9 rounded-full object-cover border border-border"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-dark-900">
                                  {rev.userName}
                                </span>
                                {rev.verifiedBooking && (
                                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    Verified Booking
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-dark-400">{rev.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                              {[...Array(rev.rating)].map((_, idx) => (
                                <Star
                                  key={idx}
                                  className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              disabled={reported[rev.id]}
                              onClick={() => handleReport(rev)}
                              title="Report this review"
                              aria-label="Report this review"
                              className="inline-flex items-center gap-1 rounded text-[10px] font-semibold text-dark-400 transition-colors hover:text-red-600 disabled:cursor-default disabled:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                              <Flag className="w-3 h-3" />
                              {reported[rev.id] ? "Reported" : "Report"}
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-dark-700 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SCHEDULE */}
              {activeTab === "schedule" && (
                <div className="bg-surface rounded-2xl border border-border p-6 shadow-card space-y-5">
                  <div>
                    <h2 className="font-heading text-lg font-bold text-dark-900 mb-1">
                      Operating Hours & Availability
                    </h2>
                    <p className="text-xs text-dark-500">
                      Standard operating schedule for in-person or remote consultations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => {
                      const isAvailable = pro.availability?.days?.includes(day);
                      return (
                        <div
                          key={day}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
                            isAvailable
                              ? "bg-surface border-border text-dark-900 font-medium"
                              : "bg-dark-50 border-dashed border-border text-dark-400"
                          }`}
                        >
                          <span className="font-bold">{day}</span>
                          <span
                            className={
                              isAvailable
                                ? "text-primary-600 font-semibold"
                                : "text-dark-400 italic"
                            }
                          >
                            {isAvailable ? pro.availability.hours : "Closed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (1 Col) - Sticky Booking Sidebar */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-card sticky top-24 space-y-5">
                <div>
                  <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wider block mb-1">
                    Instant Online Booking
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="font-heading text-2xl font-bold text-dark-900">
                      {formatMoney(pro.price)}
                    </span>
                    <span className="text-xs text-dark-500 font-medium">/{pro.unit}</span>
                  </div>
                </div>

                <div className="p-3.5 bg-dark-50 rounded-xl space-y-2 text-xs border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Response Time:</span>
                    <span className="font-bold text-dark-900">{pro.responseTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Next Available:</span>
                    <span className="font-bold text-emerald-700">Today • 02:00 PM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-600">Escrow Protected:</span>
                    <span className="font-bold text-emerald-700">100% Guaranteed</span>
                  </div>
                </div>

                <Link
                  href={`/book/${pro.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm shadow-button transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                </Link>

                <p className="text-[11px] text-center text-dark-500">
                  No payment charged until service milestones are confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
