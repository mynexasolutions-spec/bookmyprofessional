"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import MarketplaceDirectory from "@/components/MarketplaceDirectory";
import { ChevronRight, Sparkles } from "lucide-react";

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
        {/* SEO H1 — visible intro above the directory grid */}
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-900">
            Find &amp; Hire Verified Professionals Near You
          </h1>
          <p className="text-sm text-dark-500 mt-2 max-w-2xl">
            Browse India&apos;s largest directory of background-verified doctors, tutors, electricians,
            plumbers, IT experts, beauticians, and more. Filter by specialty, location, rating, and
            availability to find your perfect match.
          </p>
        </div>

        <MarketplaceDirectory />
      </main>
    </div>
  );
}
