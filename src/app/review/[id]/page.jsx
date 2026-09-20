"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Button from "@/components/Button";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

export default function ReviewBookingPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;
  const { bookings, submitReview } = useMarketplace();

  // Find target booking. No fallback: an unknown id must show "Booking not found", not someone else's.
  const booking = bookings.find((b) => b.id === bookingId);

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [qualityScore, setQualityScore] = useState(5);
  const [punctualityScore, setPunctualityScore] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const ratingDescriptions = {
    1: "Poor - Did not meet expectations",
    2: "Fair - Needs improvement",
    3: "Good - Satisfactory experience",
    4: "Very Good - Highly capable & reliable",
    5: "Exceptional! - Exceeded all expectations",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitReview(
        booking.id,
        booking.proId,
        rating,
        comment,
        { quality: qualityScore, punctuality: punctualityScore }
      );
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-dark-800">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-8 text-center shadow-card">
            <div className="w-14 h-14 mx-auto rounded-full bg-dark-50 text-dark-500 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="mt-4 font-heading text-lg font-bold text-dark-900">Booking not found</h1>
            <p className="mt-1 text-xs text-dark-500">
              We couldn&apos;t find that booking. It may have been removed or you may not have access to it.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-button transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-dark-800">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-8 text-center shadow-card">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h1 className="mt-4 font-heading text-lg font-bold text-dark-900">Review submitted</h1>
            <p className="mt-1 text-xs text-dark-500">
              Thanks for your feedback. It will appear on the profile once it passes moderation.
            </p>
            <Link
              href="/dashboard"
              className="mt-5 inline-flex items-center justify-center py-2.5 px-5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-button transition-colors"
            >
              Back to Dashboard
            </Link>
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
            <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
              Customer Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-dark-400" />
            <span className="text-dark-900 font-semibold">Write Verified Review</span>
          </div>
        </div>
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h1 className="font-heading text-2xl font-bold text-dark-900">
                Rate & Review Professional
              </h1>
              <p className="text-xs text-dark-500 mt-1">
                Verified Booking Ref #{booking.id}
              </p>
            </div>

            {/* Target Pro Card */}
            <div className="flex items-center gap-4 p-4 bg-dark-50 rounded-2xl border border-border">
              <img
                src={booking.proAvatar}
                alt={booking.proName}
                className="w-14 h-14 rounded-xl object-cover border border-border bg-dark-100 shrink-0"
              />
              <div>
                <h3 className="font-heading text-base font-bold text-dark-900">
                  {booking.proName}
                </h3>
                <p className="text-xs text-primary-600 font-semibold mt-0.5">
                  {booking.serviceTitle}
                </p>
                <span className="text-[11px] text-dark-400">
                  Service Completed on {booking.date}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Star Rating */}
              <div className="text-center py-3 bg-dark-50/50 rounded-2xl border border-border">
                <label className="block text-xs font-bold text-dark-700 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-dark-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="block text-xs font-bold text-amber-600 mt-2">
                  {ratingDescriptions[hoverRating || rating]}
                </span>
              </div>

              {/* Sub Scores */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-dark-50 rounded-2xl border border-border text-xs">
                <div>
                  <span className="block font-bold text-dark-700 mb-1.5">Quality of Work</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQualityScore(s)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                          qualityScore === s
                            ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                            : "bg-white border-border text-dark-700"
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block font-bold text-dark-700 mb-1.5">Punctuality</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setPunctualityScore(s)}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-semibold ${
                          punctualityScore === s
                            ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                            : "bg-white border-border text-dark-700"
                        }`}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Written Review */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                  Detailed Feedback & Experience
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about punctuality, quality of work, and communication to help other customers..."
                  className="w-full p-4 bg-dark-50 border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              {/* Recommendation */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recommend}
                  onChange={(e) => setRecommend(e.target.checked)}
                  className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
                />
                <span className="text-xs text-dark-800 font-medium">
                  I recommend {booking.proName} to other customers in India
                </span>
              </label>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <Link
                  href="/dashboard"
                  className="py-3 px-5 rounded-xl border border-border hover:bg-dark-50 text-dark-700 text-xs font-semibold"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || !comment.trim()}
                  className="flex-1 justify-center py-3 font-semibold text-xs shadow-button"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  )}
                  Publish Verified Review
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
