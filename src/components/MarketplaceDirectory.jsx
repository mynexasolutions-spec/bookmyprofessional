"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Filter,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Calendar,
  X,
  ChevronDown,
  Tag,
  Award,
} from "lucide-react";
import Button from "./Button";

export default function MarketplaceDirectory() {
  const {
    filteredProfessionals,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    minRating,
    setMinRating,
    priceRange,
    setPriceRange,
    sortBy,
    setSortBy,
    openProDetail,
    startBooking,
  } = useMarketplace();

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Categories" },
    { id: "Doctors", label: "Doctors & Health" },
    { id: "Tutors", label: "Tutors & Academics" },
    { id: "Electricians", label: "Electricians" },
    { id: "Plumbers", label: "Plumbers" },
    { id: "Beauticians", label: "Beauticians & Salon" },
    { id: "Cleaners", label: "Cleaners & Maid" },
    { id: "IT Professionals", label: "IT & Tech Support" },
    { id: "Consultants", label: "Consultants & Tax" },
  ];

  const locations = [
    { id: "all", label: "All Locations" },
    { id: "Berlin", label: "Berlin, Germany" },
    { id: "Munich", label: "Munich, Germany" },
    { id: "Hamburg", label: "Hamburg, Germany" },
    { id: "Frankfurt", label: "Frankfurt, Germany" },
    { id: "Cologne", label: "Cologne, Germany" },
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedLocation("all");
    setMinRating(0);
    setPriceRange("all");
    setSortBy("featured");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== "all" ||
    selectedLocation !== "all" ||
    minRating > 0 ||
    priceRange !== "all";

  return (
    <section id="find" className="py-14 sm:py-18 bg-background border-b border-border scroll-mt-14">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-3 py-1 mb-2.5">
              <Sparkles className="h-3.5 w-3.5 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">
                Verified Expert Marketplace
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-dark-900">
              Browse & Book <span className="text-primary-500">Verified Professionals</span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-dark-600 font-normal max-w-2xl">
              Compare certified service providers, transparent pricing, verified client reviews, and instant appointment scheduling.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-4 bg-surface py-2.5 px-4 rounded-xl border border-border shadow-xs">
            <div className="text-right">
              <span className="block text-xs font-semibold text-dark-900">
                {filteredProfessionals.length} Experts Available
              </span>
              <span className="block text-[11px] text-emerald-600 font-medium">
                ● 100% Background Verified
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & PRIMARY FILTER BAR */}
        <div className="bg-surface p-3 sm:p-4 rounded-2xl border border-border shadow-soft mb-6 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by skill, service or expert name..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-dark-50/70 border border-border rounded-xl text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Location Selector */}
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-500" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-dark-50/70 border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer appearance-none"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400 pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-2 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2.5 bg-dark-50/70 border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer"
              >
                <option value="featured">✨ Featured</option>
                <option value="rating">★ Highest Rated</option>
                <option value="reviews">💬 Most Reviews</option>
                <option value="price-asc">€ Price: Low to High</option>
                <option value="price-desc">€ Price: High to Low</option>
              </select>
            </div>

            {/* Mobile Filter Drawer Button / Clear Button */}
            <div className="md:col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                  isFilterDrawerOpen || hasActiveFilters
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "bg-surface border-border text-dark-700 hover:bg-dark-50"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters {hasActiveFilters && "(Active)"}</span>
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="p-2.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors"
                  title="Reset all filters"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* CATEGORY FILTER CHIPS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary-500 text-white shadow-button ring-2 ring-primary-300"
                      : "bg-dark-50 hover:bg-primary-50 text-dark-700 hover:text-primary-600 border border-border"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* EXPANDABLE SECONDARY FILTERS DRAWER */}
          {isFilterDrawerOpen && (
            <div className="pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in slide-in-from-top-2 duration-150">
              {/* Rating Filter */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">
                  Minimum Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { val: 0, label: "All" },
                    { val: 4.5, label: "4.5+ ★" },
                    { val: 4.8, label: "4.8+ ★" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setMinRating(r.val)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        minRating === r.val
                          ? "bg-amber-50 border-amber-300 text-amber-700 font-semibold"
                          : "bg-white border-border text-dark-700 hover:bg-dark-50"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">
                  Budget / Price Tier
                </label>
                <div className="flex items-center gap-1.5">
                  {[
                    { val: "all", label: "Any" },
                    { val: "under-40", label: "< €40" },
                    { val: "40-70", label: "€40-€70" },
                    { val: "above-70", label: "€70+" },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setPriceRange(p.val)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                        priceRange === p.val
                          ? "bg-primary-50 border-primary-300 text-primary-700 font-semibold"
                          : "bg-white border-border text-dark-700 hover:bg-dark-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset shortcut */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="w-full justify-center text-dark-600 border-border hover:bg-dark-50 text-xs py-2"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS GRID OR EMPTY STATE */}
        {filteredProfessionals.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-dashed border-border p-12 text-center my-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary-50 text-primary-500 flex items-center justify-center mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-dark-900 mb-1">
              No Professionals Found
            </h3>
            <p className="text-xs sm:text-sm text-dark-600 max-w-md mx-auto mb-4">
              We couldn't find any verified professionals matching your current filters. Try adjusting your search keyword or clearing the filters.
            </p>
            <Button variant="primary" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProfessionals.map((pro) => (
              <div
                key={pro.id}
                className="group relative flex flex-col justify-between bg-surface rounded-2xl border border-border/90 hover:border-primary-300 shadow-card hover:shadow-soft transition-all duration-200 overflow-hidden hover:-translate-y-1"
              >
                {/* Top Image + Badges */}
                <div className="relative">
                  <div className="w-full h-44 sm:h-48 overflow-hidden bg-dark-100">
                    <img
                      src={pro.image}
                      alt={pro.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Gradient bottom shadow over image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Verified Badge */}
                  {pro.verified && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-surface/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-700 shadow-sm border border-emerald-200/80">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Verified Pro</span>
                    </div>
                  )}

                  {/* Category Pill on Image Bottom */}
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block bg-dark-900/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {pro.category}
                    </span>
                  </div>

                  {/* Response Time Badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-[10px] text-white/95 font-medium bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{pro.responseTime}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Rating & Experience */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-dark-900">{pro.rating}</span>
                        <span className="text-dark-500 font-normal">({pro.reviewCount})</span>
                      </div>
                      <span className="text-[11px] font-medium text-dark-600 bg-dark-50 px-2 py-0.5 rounded-full">
                        {pro.experienceYears}+ yrs exp
                      </span>
                    </div>

                    {/* Name & Specialty */}
                    <h3 className="font-heading text-base font-bold text-dark-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                      {pro.name}
                    </h3>
                    <p className="text-xs text-primary-700 font-medium line-clamp-1 mt-0.5">
                      {pro.role}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-dark-500 mt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-dark-400 shrink-0" />
                      <span className="truncate">{pro.location}</span>
                    </div>

                    {/* Bio snippet */}
                    <p className="text-xs text-dark-600 line-clamp-2 mt-2 leading-relaxed">
                      {pro.bio}
                    </p>
                  </div>

                  {/* Pricing and Action Buttons */}
                  <div className="pt-3 border-t border-border/80">
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        <span className="text-[10px] text-dark-400 uppercase font-semibold block">
                          Starting at
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-heading text-lg font-bold text-dark-900">
                            €{pro.price}
                          </span>
                          {pro.originalPrice && (
                            <span className="text-xs text-dark-400 line-through">
                              €{pro.originalPrice}
                            </span>
                          )}
                          <span className="text-[11px] text-dark-500">/{pro.unit}</span>
                        </div>
                      </div>

                      {/* Services count */}
                      <span className="text-[11px] font-medium text-dark-500 bg-primary-50 px-2 py-1 rounded-md text-primary-700">
                        {pro.services?.length || 1} Services
                      </span>
                    </div>

                    {/* Buttons: View Profile & Book Now */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href={`/professionals/${pro.id}`}
                        className="py-2 px-2.5 rounded-lg border border-border bg-surface hover:bg-dark-50 text-xs font-semibold text-dark-800 transition-colors text-center inline-flex items-center justify-center"
                      >
                        View Profile
                      </Link>
                      <Link
                        href={`/book/${pro.id}`}
                        className="py-2 px-2.5 rounded-lg text-xs font-semibold justify-center shadow-button bg-primary-500 hover:bg-primary-600 text-white transition-colors inline-flex items-center"
                      >
                        <Calendar className="h-3.5 w-3.5 mr-1 shrink-0" />
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
