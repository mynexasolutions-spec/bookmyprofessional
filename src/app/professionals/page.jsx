"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MarketplaceDirectory from "@/components/MarketplaceDirectory";
import { ChevronRight, ShieldCheck, Clock, Award, CreditCard } from "lucide-react";

export default function BrowseProfessionalsPage() {
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
            <span className="text-dark-900 font-semibold">Find a Professional</span>
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* SEO HERO & DIRECTORY INTRO */}
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <div className="max-w-3xl">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-900 tracking-tight">
              Find &amp; Hire Verified Professionals Near You
            </h1>
            <p className="text-sm sm:text-base text-dark-600 mt-3 leading-relaxed">
              Explore India&apos;s trusted directory of background-checked experts across healthcare,
              education, home maintenance, wellness, technology, and business consulting. Compare verified
              credentials, authentic customer reviews, transparent hourly rates, and live appointment slots
              to hire with complete confidence.
            </p>
          </div>

          {/* VALUE PILLARS STRIP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-border/80">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-heading text-xs font-bold text-dark-900">100% ID Verified</p>
                <p className="text-[11px] text-dark-500 mt-0.5 leading-snug">Govt ID &amp; certification audited</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="font-heading text-xs font-bold text-dark-900">Escrow Protected</p>
                <p className="text-[11px] text-dark-500 mt-0.5 leading-snug">Pay only when service is complete</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-heading text-xs font-bold text-dark-900">Instant Booking</p>
                <p className="text-[11px] text-dark-500 mt-0.5 leading-snug">Real-time availability calendars</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-heading text-xs font-bold text-dark-900">Rated &amp; Reviewed</p>
                <p className="text-[11px] text-dark-500 mt-0.5 leading-snug">Feedback from verified customers</p>
              </div>
            </div>
          </div>
        </div>

        <MarketplaceDirectory />
      </main>
    </div>
  );
}
