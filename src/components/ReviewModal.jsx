"use client";

import React, { useState, useEffect } from "react";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  X,
  Star,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import Button from "./Button";

export default function ReviewModal() {
  const { reviewBooking, setReviewBooking, submitReview } = useMarketplace();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [recommend, setRecommend] = useState(true);
  const [qualityScore, setQualityScore] = useState(5);
  const [punctualityScore, setPunctualityScore] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Lock body scroll
  useEffect(() => {
    if (reviewBooking) {
      document.body.style.overflow = "hidden";
      setRating(5);
      setComment("");
      setError(null);
      setSuccess(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [reviewBooking]);

  if (!reviewBooking) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        <div className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm" aria-hidden="true" />
        <div
          className="relative w-full max-w-md my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 p-8 text-center z-10 animate-in zoom-in-95 fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Review submitted"
        >
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="mt-4 font-heading text-base font-bold text-dark-900">Review submitted</h3>
          <p className="mt-1 text-xs text-dark-500">
            Thanks for your feedback. It will appear on the profile once it passes moderation.
          </p>
          <Button
            variant="primary"
            onClick={() => setReviewBooking(null)}
            className="mt-5 w-full justify-center py-2.5 text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    );
  }

  const ratingDescriptions = {
    1: "Poor - Did not meet expectations",
    2: "Fair - Needs improvement",
    3: "Good - Satisfactory experience",
    4: "Very Good - Highly capable",
    5: "Exceptional! - Exceeded all expectations",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await submitReview(
        reviewBooking.id,
        reviewBooking.proId,
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

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark-900/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={() => setReviewBooking(null)}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="relative w-full max-w-lg my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 animate-in zoom-in-95 fade-in"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-border bg-surface flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-dark-900">
                Rate & Review Professional
              </h3>
              <p className="text-[11px] text-dark-500">
                Verified Booking #{reviewBooking.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setReviewBooking(null)}
            className="p-1.5 rounded-full text-dark-400 hover:text-dark-800 hover:bg-dark-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Target Pro Summary */}
          <div className="flex items-center gap-3 p-3 bg-dark-50 rounded-xl border border-border">
            <img
              src={reviewBooking.proAvatar}
              alt={reviewBooking.proName}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div>
              <h4 className="text-xs font-bold text-dark-900">{reviewBooking.proName}</h4>
              <p className="text-[11px] text-primary-600 font-medium">
                {reviewBooking.serviceTitle}
              </p>
            </div>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-semibold text-dark-700 mb-2">
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
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-dark-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="block text-xs font-semibold text-amber-600 mt-1.5">
              {ratingDescriptions[hoverRating || rating]}
            </span>
          </div>

          {/* Detailed Criteria */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-dark-50/70 rounded-xl border border-border text-xs">
            <div>
              <span className="block font-semibold text-dark-700 mb-1">Quality of Work</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQualityScore(s)}
                    className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                      qualityScore === s
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white border-border text-dark-600"
                    }`}
                  >
                    {s}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block font-semibold text-dark-700 mb-1">Punctuality</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPunctualityScore(s)}
                    className={`px-2 py-0.5 rounded border text-[11px] font-semibold ${
                      punctualityScore === s
                        ? "bg-primary-500 text-white border-primary-500"
                        : "bg-white border-border text-dark-600"
                    }`}
                  >
                    {s}★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-xs font-semibold text-dark-700 mb-1">
              Your Written Review
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other customers about your experience with this professional..."
              className="w-full p-3 bg-dark-50 border border-border rounded-xl text-xs text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          {/* Recommend Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={recommend}
              onChange={(e) => setRecommend(e.target.checked)}
              className="rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
            />
            <span className="text-xs text-dark-700 font-medium">
              I recommend {reviewBooking.proName} to other customers
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

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || !comment.trim()}
              className="w-full justify-center py-2.5 font-semibold text-xs shadow-button"
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
  );
}
