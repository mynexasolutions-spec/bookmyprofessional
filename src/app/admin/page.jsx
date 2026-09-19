"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useMarketplace } from "@/context/MarketplaceContext";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  ShieldCheck,
  Tag,
  CalendarDays,
  CreditCard,
  Percent,
  Star,
  FileText,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Lock,
  Eye,
  Trash2,
  Edit,
  ShieldAlert,
  SlidersHorizontal,
  RefreshCw,
  Bell,
  Menu,
  X,
  Sparkles,
  Award,
  Clock,
  MapPin,
  FileCheck,
  Send,
  MoreVertical,
  Check,
  BarChart3,
  PieChart,
  Layers,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Key,
} from "lucide-react";
import Button from "@/components/Button";

export default function AdminDashboardPage() {
  const {
    professionals,
    bookings,
    customers,
    categoriesList,
    pendingVerifications,
    payoutRequests,
    platformSettings,
    updateCustomerStatus,
    updateProStatus,
    approveDocumentVerification,
    rejectDocumentVerification,
    addCategory,
    updateCategory,
    deleteCategory,
    adminOverrideBooking,
    updatePlatformCommission,
    moderateReview,
    approveVendorPayout,
    exportReport,
  } = useMarketplace();

  const { user, showToast, isAuthLoading } = useAuth();

  // If auth is still initializing from persistent session, display sleek authorization loader
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#070E17] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#0D8EF5_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 animate-spin shadow-lg">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-bold text-base text-white">Verifying Clearance...</h3>
            <p className="text-xs font-mono text-slate-400">Validating administrative cryptography token</p>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated as an Admin, enforce Security Gate
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#070E17] text-white flex flex-col justify-between selection:bg-primary-500 selection:text-white relative overflow-hidden">
        {/* Background Decorative Tech Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#0D8EF5_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[140px] pointer-events-none" />

        <header className="relative z-10 border-b border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition-colors" />
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                Return to Marketplace
              </span>
            </Link>
            <span className="text-xs font-mono text-rose-400 flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
              <ShieldAlert className="w-3.5 h-3.5" />
              Restricted Area
            </span>
          </div>
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0A121E]/95 border border-slate-800 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
                Admin Clearance Required
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                This management console is strictly restricted to authorized platform administrators.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono text-left space-y-1">
              <div className="flex justify-between">
                <span>Access Status:</span>
                <span className="text-rose-400 font-bold">Unauthenticated</span>
              </div>
              <div className="flex justify-between">
                <span>Required Role:</span>
                <span className="text-sky-300 font-bold">Super Administrator</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link href="/admin/login" className="block w-full">
                <Button
                  variant="primary"
                  className="w-full justify-center py-3 font-semibold text-sm shadow-button bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-500 hover:to-sky-400 border-0"
                >
                  <Key className="w-4 h-4 mr-2" />
                  <span>Authenticate with Admin Key</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-center py-2.5 text-xs text-slate-300 hover:text-white border-slate-800 hover:bg-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  <span>Return to Home Page</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative z-10 border-t border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-6 py-3 text-center text-xs text-slate-500">
          <p>© 2026 BookMyProfessional.com • Security Subsystem</p>
        </footer>
      </div>
    );
  }

  // Active Tab State:
  // "overview" | "customers" | "professionals" | "verification" | "categories" | "bookings" | "escrow" | "commission" | "reviews" | "reports"
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search & Filter States
  const [globalSearch, setGlobalSearch] = useState("");
  const [customerFilterStatus, setCustomerFilterStatus] = useState("all");
  const [proCategoryFilter, setProCategoryFilter] = useState("all");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState("all");

  // Inspect Modal States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProModal, setSelectedProModal] = useState(null);
  const [selectedDocPreview, setSelectedDocPreview] = useState(null);
  const [selectedBookingModal, setSelectedBookingModal] = useState(null);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    title: "",
    description: "",
    icon: "Sparkles",
    baseCommission: platformSettings.globalCommission,
  });

  // Commission Local State for interactive slider
  const [tempCommissionRate, setTempCommissionRate] = useState(platformSettings.globalCommission);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [adminReplyInput, setAdminReplyInput] = useState({});

  // Key Platform Calculations
  const metrics = useMemo(() => {
    const totalGmv = bookings.reduce((sum, b) => sum + (b.servicePrice || 0), 0) + 148500;
    const platformRevenue = (totalGmv * (platformSettings.globalCommission / 100)).toFixed(2);
    const totalEscrowHeld = bookings
      .filter((b) => b.status === "upcoming" || b.status === "in_progress")
      .reduce((sum, b) => sum + (b.servicePrice || 0), 0) + 8450;
    const completedBookingsCount = bookings.filter((b) => b.status === "completed").length + 120400;
    const activeVendorsCount = professionals.length + 15230;
    const registeredCustomersCount = customers.length + 54810;

    return {
      totalGmv,
      platformRevenue,
      totalEscrowHeld,
      completedBookingsCount,
      activeVendorsCount,
      registeredCustomersCount,
    };
  }, [bookings, professionals, customers, platformSettings]);

  // Flattened Reviews list across all professionals
  const allReviews = useMemo(() => {
    const list = [];
    professionals.forEach((p) => {
      if (p.reviews && p.reviews.length > 0) {
        p.reviews.forEach((r) => {
          list.push({
            ...r,
            proId: p.id,
            proName: p.name,
            proRole: p.role,
            proCategory: p.category,
          });
        });
      }
    });
    return list;
  }, [professionals]);

  // Navigation Items
  const navItems = [
    { id: "overview", label: "Platform Overview", icon: LayoutDashboard, badge: null },
    { id: "customers", label: "Customer Management", icon: Users, badge: customers.length },
    { id: "professionals", label: "Professionals / Vendors", icon: Briefcase, badge: professionals.length },
    { id: "verification", label: "Verification Queue", icon: ShieldCheck, badge: pendingVerifications.length, highlight: pendingVerifications.length > 0 },
    { id: "categories", label: "Categories & Services", icon: Tag, badge: categoriesList.length },
    { id: "bookings", label: "Bookings & Disputes", icon: CalendarDays, badge: bookings.length },
    { id: "escrow", label: "Escrow & Payouts", icon: CreditCard, badge: payoutRequests.length, highlight: payoutRequests.length > 0 },
    { id: "commission", label: "Commission Settings", icon: Percent, badge: `${platformSettings.globalCommission}%` },
    { id: "reviews", label: "Reviews Moderation", icon: Star, badge: allReviews.length },
    { id: "reports", label: "Reports & Analytics", icon: BarChart3, badge: "Export" },
  ];

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    if (!newCategoryForm.name) return;
    addCategory(newCategoryForm);
    setNewCategoryForm({
      name: "",
      title: "",
      description: "",
      icon: "Sparkles",
      baseCommission: platformSettings.globalCommission,
    });
    setIsAddCategoryModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070E17] text-slate-100 flex flex-col font-sans selection:bg-primary-500 selection:text-white">
      
      {/* TOP ADMIN BAR */}
      <header className="sticky top-0 z-40 bg-[#0B1523]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Platform Console Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary-500/20 border border-primary-500/40 flex items-center justify-center text-primary-400 shadow-sm group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-heading font-extrabold text-base tracking-tight text-white">
                  BookMy<span className="text-primary-400">Professional</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-500/20 text-primary-300 border border-primary-500/30 px-1.5 py-0.5 rounded">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Central Platform Control & Governance
              </p>
            </div>
          </Link>
        </div>

        {/* Top Right Live Indicators & Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Live Escrow Pulse */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Escrow Vault Active (€{metrics.totalEscrowHeld.toLocaleString()})</span>
          </div>

          {/* Quick Site Return Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <span>Live Marketplace</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* Admin Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              AD
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="block text-xs font-bold text-white">Super Admin</span>
              <span className="block text-[10px] text-primary-400">Full Access</span>
            </div>
          </div>

          {/* Admin Logout Button */}
          <Link
            href="/admin/logout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-colors shadow-xs"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT (SIDEBAR + CONTENT) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* DESKTOP SIDEBAR (FIXED) */}
        <aside className="hidden lg:flex lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:w-64 flex-col justify-between bg-[#0A121E] border-r border-slate-800/80 p-3 shrink-0 z-30">

          <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between  px-3 py-2.5 rounded-[5px] text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-primary-500 text-white shadow-button"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : item.highlight
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-auto border-t border-slate-800/80 px-2 space-y-2 shrink-0">
            <Link
              href="/admin/logout"
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[5px] text-xs font-bold text-rose-300 bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/50 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Logout Session</span>
            </Link>

            <div className="p-3 rounded-[5px] bg-slate-900/90 border border-slate-800 text-[11px] space-y-1">
              <span className="text-emerald-400 font-semibold block">● Database Synchronized</span>
            </div>
          </div>
        </aside>

        {/* MOBILE DRAWER SIDEBAR */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#0A121E] p-4 flex flex-col h-full border-r border-slate-800 z-10 overflow-y-auto">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
                <span className="font-heading font-bold text-sm text-white">Admin Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1.5 flex-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary-500 text-white"
                          : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== null && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 mt-auto border-t border-slate-800 space-y-2">
                <Link
                  href="/admin/logout"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout Admin</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#070E17] lg:ml-64 min-h-[calc(100vh-4rem)]">
          
          {/* ===================================================
              TAB 1: PLATFORM OVERVIEW & KPI ANALYTICS
             =================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Top Banner Alert if any pending actions */}
              {(pendingVerifications.length > 0 || payoutRequests.length > 0) && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-bold text-amber-200">
                        Pending Administrative Actions
                      </h3>
                      <p className="text-xs text-amber-300/80">
                        {pendingVerifications.length} vendor document verifications and {payoutRequests.length} SEPA payout withdrawals require authorization.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => setActiveTab("verification")}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold transition-colors"
                    >
                      Review Verifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("escrow")}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                    >
                      View Payouts
                    </button>
                  </div>
                </div>
              )}

              {/* 6 Metric KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Metric 1: Total GMV */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Gross GMV</span>
                    <div className="w-7 h-7 rounded-lg bg-primary-500/20 text-primary-400 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-white">
                      €{metrics.totalGmv.toLocaleString()}
                    </span>
                    <span className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% MoM
                    </span>
                  </div>
                </div>

                {/* Metric 2: Net Commission Revenue */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Platform Revenue</span>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-emerald-400">
                      €{metrics.platformRevenue}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      {platformSettings.globalCommission}% Avg Commission
                    </span>
                  </div>
                </div>

                {/* Metric 3: Escrow Vault */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Escrow in Vault</span>
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-sky-400">
                      €{metrics.totalEscrowHeld.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-medium block mt-1">
                      100% Protected
                    </span>
                  </div>
                </div>

                {/* Metric 4: Completed Bookings */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Completed Jobs</span>
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-white">
                      {metrics.completedBookingsCount.toLocaleString()}
                    </span>
                    <span className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 98.4% Success
                    </span>
                  </div>
                </div>

                {/* Metric 5: Active Pros */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Verified Pros</span>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-white">
                      {metrics.activeVendorsCount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block mt-1">
                      Across 8 Categories
                    </span>
                  </div>
                </div>

                {/* Metric 6: Registered Customers */}
                <div className="p-4 rounded-2xl bg-[#0B1523] border border-slate-800/90 shadow-card flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">Customers</span>
                    <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="font-heading text-xl font-bold text-white">
                      {metrics.registeredCustomersCount.toLocaleString()}
                    </span>
                    <span className="flex items-center text-[11px] text-emerald-400 font-semibold mt-1">
                      <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.1% Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Monthly Revenue & Volume Bar Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Monthly Volume Chart (8 cols) */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        Platform Volume & Revenue Trends (2026)
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Monthly Gross Merchandise Value (GMV) in EUR (€)
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-primary-400 font-semibold bg-primary-500/10 px-2.5 py-1 rounded-lg border border-primary-500/20">
                        <TrendingUp className="w-3.5 h-3.5" /> +24% YoY Growth
                      </span>
                    </div>
                  </div>

                  {/* Simulated SVG / CSS Bar Chart */}
                  <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-slate-800 pb-2">
                    {[
                      { month: "Jan", val: 65, gmv: "€65k" },
                      { month: "Feb", val: 78, gmv: "€78k" },
                      { month: "Mar", val: 92, gmv: "€92k" },
                      { month: "Apr", val: 84, gmv: "€84k" },
                      { month: "May", val: 110, gmv: "€110k" },
                      { month: "Jun", val: 125, gmv: "€125k" },
                      { month: "Jul", val: 140, gmv: "€140k" },
                      { month: "Aug", val: 132, gmv: "€132k", current:true },
                      { month: "Sep", val: 185, gmv: "€185k", current: true },
                      { month: "Oct (Est)", val: 195, gmv: "€195k", est: true },
                      { month: "Nov (Est)", val: 210, gmv: "€210k", est: true },
                      { month: "Dec (Est)", val: 240, gmv: "€240k", est: true },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 px-1.5 py-0.5 rounded shadow">
                          {bar.gmv}
                        </div>
                        <div
                          style={{ height: `${(bar.val / 240) * 100}%` }}
                          className={`w-full max-w-[32px] rounded-t-lg transition-all duration-300 ${
                            bar.current
                              ? "bg-gradient-to-t from-primary-600 to-sky-400 ring-2 ring-primary-400"
                              : bar.est
                              ? "bg-slate-800/80 border border-dashed border-slate-700 hover:bg-slate-700/80"
                              : "bg-slate-700/70 hover:bg-primary-500/80"
                          }`}
                        />
                        <span className="text-[10px] font-semibold text-slate-400">
                          {bar.month}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-primary-500" /> Current Month (Sep)
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-700" /> Historical
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-800 border border-dashed border-slate-600" /> Forecast
                      </span>
                    </div>
                    <span className="font-semibold text-slate-300">
                      Platform Run-Rate: €2.2M / yr
                    </span>
                  </div>
                </div>

                {/* Category Revenue Distribution (4 cols) */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white mb-1">
                      Revenue by Discipline
                    </h3>
                    <p className="text-xs text-slate-400 mb-5">
                      Share of gross bookings volume
                    </p>

                    <div className="space-y-3.5">
                      {[
                        { cat: "Doctors & Healthcare", pct: 28, color: "bg-sky-500" },
                        { cat: "Tutors & Academics", pct: 22, color: "bg-amber-500" },
                        { cat: "Electricians & Trades", pct: 18, color: "bg-orange-500" },
                        { cat: "Cleaners & Maid", pct: 14, color: "bg-emerald-500" },
                        { cat: "Consultants & Tax", pct: 12, color: "bg-indigo-500" },
                        { cat: "Others (Beauticians/IT)", pct: 6, color: "bg-rose-500" },
                      ].map((item, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{item.cat}</span>
                            <span className="font-bold text-white">{item.pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${item.pct}%` }}
                              className={`h-full rounded-full ${item.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Active Categories</span>
                    <span className="font-bold text-white">{categoriesList.length} Disciplines</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Stream & Quick Action Shortcuts */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recent Bookings Feed (8 cols) */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-base font-bold text-white">
                      Live Platform Bookings Feed
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bookings")}
                      className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800">
                    {bookings.slice(0, 4).map((b) => (
                      <div key={b.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.proAvatar || "/images/cat_doctor.jpg"}
                            alt={b.proName}
                            className="w-9 h-9 rounded-xl object-cover bg-slate-800"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{b.id}</span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  b.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : b.status === "upcoming"
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {b.customerName} booked <span className="text-slate-200">{b.proName}</span> ({b.serviceTitle})
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-heading text-sm font-bold text-white block">
                            €{b.totalPaid}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {b.date}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Admin Actions (4 cols) */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white mb-1">
                      Administrative Actions
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Fast-track routine management tasks
                    </p>

                    <div className="space-y-2.5">
                      <button
                        type="button"
                        onClick={() => setIsAddCategoryModalOpen(true)}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <Plus className="w-4 h-4 text-primary-400" />
                          <span>Add New Service Category</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("verification")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>Review Pending Credentials ({pendingVerifications.length})</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab("commission")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <Percent className="w-4 h-4 text-amber-400" />
                          <span>Configure Platform Commission</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        type="button"
                        onClick={() => exportReport("monthly_revenue_summary")}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-white transition-colors border border-slate-700/80"
                      >
                        <div className="flex items-center gap-2.5">
                          <Download className="w-4 h-4 text-sky-400" />
                          <span>Export Financial Summary (CSV)</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
                    All administrative actions are logged with immutable audit timestamps.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 2: CUSTOMER MANAGEMENT
             =================================================== */}
          {activeTab === "customers" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Customer Directory & Governance
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Search registered clients, inspect lifetime booking spend, and manage account statuses.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    Total: {customers.length} Accounts
                  </span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-3 bg-[#0B1523] rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search by name, email, or city..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={customerFilterStatus}
                    onChange={(e) => setCustomerFilterStatus(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                  </select>
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-[#0B1523] rounded-2xl border border-slate-800 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Contact</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Joined</th>
                        <th className="py-3.5 px-4">Bookings</th>
                        <th className="py-3.5 px-4">Total Spent</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {customers
                        .filter((c) => {
                          if (customerFilterStatus !== "all" && c.status !== customerFilterStatus) return false;
                          if (globalSearch) {
                            const q = globalSearch.toLowerCase();
                            return (
                              c.name.toLowerCase().includes(q) ||
                              c.email.toLowerCase().includes(q) ||
                              c.city.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((cust) => (
                          <tr key={cust.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={cust.avatar}
                                  alt={cust.name}
                                  className="w-8 h-8 rounded-full object-cover bg-slate-800"
                                />
                                <span className="font-bold text-white">{cust.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div>{cust.email}</div>
                              <div className="text-[11px] text-slate-400">{cust.phone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">{cust.city}</td>
                            <td className="py-3.5 px-4 text-slate-400">{cust.joinedDate}</td>
                            <td className="py-3.5 px-4 font-semibold text-white">{cust.totalBookings} jobs</td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">€{cust.totalSpent}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  cust.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {cust.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedCustomer(cust)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                  title="Inspect Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                {cust.status === "active" ? (
                                  <button
                                    type="button"
                                    onClick={() => updateCustomerStatus(cust.id, "suspended")}
                                    className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold text-[10px] border border-red-500/30 transition-colors"
                                  >
                                    Suspend
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => updateCustomerStatus(cust.id, "active")}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[10px] border border-emerald-500/30 transition-colors"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Customer Detail Drawer / Modal */}
              {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-[#0B1523] border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-heading font-bold text-base text-white">
                        Customer Account Details
                      </h3>
                      <button
                        type="button"
                        onClick={() => setSelectedCustomer(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <img
                        src={selectedCustomer.avatar}
                        alt={selectedCustomer.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-500"
                      />
                      <div>
                        <h4 className="font-heading text-lg font-bold text-white">
                          {selectedCustomer.name}
                        </h4>
                        <p className="text-xs text-slate-400">{selectedCustomer.email}</p>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md uppercase mt-1 ${
                            selectedCustomer.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          Account {selectedCustomer.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 block">Phone Number</span>
                        <span className="font-semibold text-slate-200">{selectedCustomer.phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Location City</span>
                        <span className="font-semibold text-slate-200">{selectedCustomer.city}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Lifetime Bookings</span>
                        <span className="font-semibold text-slate-200">{selectedCustomer.totalBookings} orders</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Spend (Escrow)</span>
                        <span className="font-bold text-emerald-400">€{selectedCustomer.totalSpent}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                        className="border-slate-700 text-dark hover:bg-slate-800 hover:text-white"
                      >
                        Close
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          const newSt = selectedCustomer.status === "active" ? "suspended" : "active";
                          updateCustomerStatus(selectedCustomer.id, newSt);
                          setSelectedCustomer({ ...selectedCustomer, status: newSt });
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                          selectedCustomer.status === "active"
                            ? "bg-red-600 hover:bg-red-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        {selectedCustomer.status === "active" ? "Suspend Account" : "Activate Account"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================
              TAB 3: PROFESSIONAL / VENDOR MANAGEMENT
             =================================================== */}
          {activeTab === "professionals" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Vendor & Professional Network
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Manage service providers, verify credentials, and review catalog participation.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    {professionals.length} Active Vendors
                  </span>
                </div>
              </div>

              {/* Filters */}
              <div className="p-3 bg-[#0B1523] rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search vendor by name, discipline, or city..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={proCategoryFilter}
                    onChange={(e) => setProCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid of Professionals */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {professionals
                  .filter((p) => {
                    if (proCategoryFilter !== "all" && p.category.toLowerCase() !== proCategoryFilter.toLowerCase())
                      return false;
                    if (globalSearch) {
                      const q = globalSearch.toLowerCase();
                      return (
                        p.name.toLowerCase().includes(q) ||
                        p.role.toLowerCase().includes(q) ||
                        p.location.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((pro) => (
                    <div
                      key={pro.id}
                      className="bg-[#0B1523] rounded-2xl border border-slate-800 hover:border-primary-500/50 p-4 shadow-card flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Top Row: Avatar + Verified Badge */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <img
                            src={pro.image}
                            alt={pro.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700"
                          />
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                pro.verified
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              <ShieldCheck className="w-3 h-3" />
                              <span>{pro.verified ? "Verified Pro" : "Unverified"}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {pro.category}
                            </span>
                          </div>
                        </div>

                        {/* Name & Role */}
                        <h4 className="font-heading text-sm font-bold text-white line-clamp-1">
                          {pro.name}
                        </h4>
                        <p className="text-xs text-primary-400 font-medium line-clamp-1 mt-0.5">
                          {pro.role}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{pro.location}</span>
                        </p>

                        {/* Rating & Rate */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
                          <div className="flex items-center gap-1 font-bold text-amber-400">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{pro.rating}</span>
                            <span className="text-slate-500 font-normal">({pro.reviewCount})</span>
                          </div>
                          <span className="font-bold text-white">
                            €{pro.price}/{pro.unit}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                        <Link
                          href={`/professionals/${pro.id}`}
                          target="_blank"
                          className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-center text-xs font-semibold text-slate-300 hover:text-white transition-colors inline-flex items-center justify-center gap-1"
                        >
                          <span>Public Page</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => updateProStatus(pro.id, !pro.verified)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                            pro.verified
                              ? "bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-black border border-amber-500/30"
                              : "bg-emerald-500 hover:bg-emerald-600 text-white"
                          }`}
                        >
                          {pro.verified ? "Revoke Badge" : "Grant Verified"}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ===================================================
              TAB 4: DOCUMENT VERIFICATION & APPROVAL CENTER
             =================================================== */}
          {activeTab === "verification" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Vendor Credential Verification Queue
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Review uploaded master trade licenses, medical approbations, police clearances, and insurance policies.
                  </p>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                  {pendingVerifications.length} Submissions Pending Review
                </span>
              </div>

              {pendingVerifications.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-[#0B1523] border border-dashed border-slate-800">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-white mb-1">
                    Verification Queue Clean!
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    All submitted vendor licenses and identity checks have been reviewed and processed.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pendingVerifications.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#0B1523] rounded-3xl border border-slate-800 p-5 shadow-card flex flex-col justify-between space-y-4"
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase">
                            Pending Audit
                          </span>
                          <span className="text-xs text-slate-400">{item.submittedDate}</span>
                        </div>

                        {/* Pro Info */}
                        <h4 className="font-heading text-base font-bold text-white">
                          {item.proName}
                        </h4>
                        <p className="text-xs text-primary-400 font-semibold">{item.proRole}</p>
                        <span className="inline-block text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded mt-1">
                          Category: {item.category}
                        </span>

                        {/* Document Details Card */}
                        <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center gap-2 text-slate-300 font-semibold">
                            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{item.docName}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <strong>Type:</strong> {item.docType}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <strong>License/ID No:</strong> {item.certificateNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <strong>Issued by:</strong> {item.issuer}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setSelectedDocPreview(item)}
                          className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect Document Preview</span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => approveDocumentVerification(item.id, item.proId)}
                            className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-button transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Verify</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => rejectDocumentVerification(item.id, item.proId, "Image resolution too low")}
                            className="py-2 px-3 rounded-xl bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Document Preview Modal */}
              {selectedDocPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-[#0B1523] border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div>
                        <h3 className="font-heading font-bold text-base text-white">
                          Document Inspector
                        </h3>
                        <p className="text-xs text-slate-400">
                          {selectedDocPreview.proName} — {selectedDocPreview.docType}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDocPreview(null)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="h-64 rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 relative flex items-center justify-center">
                      <img
                        src={selectedDocPreview.previewUrl || "/images/cat_doctor.jpg"}
                        alt="Document Preview"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div className="text-xs text-white">
                          <p className="font-bold">{selectedDocPreview.docName}</p>
                          <p className="text-slate-300 text-[11px]">
                            Certificate ID: {selectedDocPreview.certificateNumber} | {selectedDocPreview.issuer}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocPreview(null)}
                        className="border-slate-700 text-slate-300"
                      >
                        Close
                      </Button>
                      <button
                        type="button"
                        onClick={() => {
                          approveDocumentVerification(selectedDocPreview.id, selectedDocPreview.proId);
                          setSelectedDocPreview(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                      >
                        Approve & Grant Verified Badge
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================
              TAB 5: CATEGORY & SERVICE CATALOG BUILDER
             =================================================== */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Category & Standardized Catalog Builder
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Create new service categories, configure discipline base commissions, and organize services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-xs shadow-button transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Category</span>
                </button>
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-5 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary-500/20 border border-primary-500/30 text-primary-400 flex items-center justify-center font-bold text-sm">
                          {cat.name.charAt(0)}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {cat.baseCommission}% Base Comm.
                        </span>
                      </div>

                      <h3 className="font-heading text-base font-bold text-white">
                        {cat.title || cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <span>{cat.proCount || 12} Verified Pros</span>
                        <span>{cat.activeServices || 30} Active Packages</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => showToast(`Category "${cat.name}" services opened for edit.`, "info")}
                        className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
                      >
                        Manage Packages →
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Category Modal */}
              {isAddCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
                  <div className="bg-[#0B1523] border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="font-heading font-bold text-base text-white">
                        Create New Service Category
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsAddCategoryModalOpen(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={handleAddCategorySubmit} className="space-y-3.5 text-xs">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Category Identifier (e.g. Interior Designers) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newCategoryForm.name}
                          onChange={(e) =>
                            setNewCategoryForm({
                              ...newCategoryForm,
                              name: e.target.value,
                              title: newCategoryForm.title || e.target.value,
                            })
                          }
                          placeholder="e.g. Interior Designers"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Display Title
                        </label>
                        <input
                          type="text"
                          value={newCategoryForm.title}
                          onChange={(e) =>
                            setNewCategoryForm({ ...newCategoryForm, title: e.target.value })
                          }
                          placeholder="Interior Designers & Decorators"
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={newCategoryForm.description}
                          onChange={(e) =>
                            setNewCategoryForm({ ...newCategoryForm, description: e.target.value })
                          }
                          placeholder="Professional space design, renovation plans, and home aesthetics."
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Discipline Base Commission (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={newCategoryForm.baseCommission}
                          onChange={(e) =>
                            setNewCategoryForm({
                              ...newCategoryForm,
                              baseCommission: parseFloat(e.target.value) || 10,
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddCategoryModalOpen(false)}
                          className="border-slate-700 text-slate-300"
                        >
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit">
                          Create Category
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================================================
              TAB 6: BOOKINGS & DISPUTE RESOLUTION
             =================================================== */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Platform Bookings & Dispute Arbitration
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Monitor live escrow milestones, override appointment statuses, and execute dispute refunds.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    {bookings.length} Platform Bookings
                  </span>
                </div>
              </div>

              {/* Filter */}
              <div className="p-3 bg-[#0B1523] rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    placeholder="Search by Booking ID (e.g. BMP-84920), customer, or pro..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="in_progress">In-Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Master Bookings Table */}
              <div className="bg-[#0B1523] rounded-2xl border border-slate-800 overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Booking ID</th>
                        <th className="py-3.5 px-4">Customer</th>
                        <th className="py-3.5 px-4">Professional</th>
                        <th className="py-3.5 px-4">Service & Slot</th>
                        <th className="py-3.5 px-4">Escrow Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Admin Override</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {bookings
                        .filter((b) => {
                          if (bookingStatusFilter !== "all" && b.status !== bookingStatusFilter) return false;
                          if (globalSearch) {
                            const q = globalSearch.toLowerCase();
                            return (
                              b.id.toLowerCase().includes(q) ||
                              b.customerName?.toLowerCase().includes(q) ||
                              b.proName.toLowerCase().includes(q) ||
                              b.serviceTitle.toLowerCase().includes(q)
                            );
                          }
                          return true;
                        })
                        .map((b) => (
                          <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-white">{b.id}</td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div className="font-semibold text-white">{b.customerName}</div>
                              <div className="text-[11px] text-slate-400">{b.customerPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div className="font-semibold text-primary-400">{b.proName}</div>
                              <div className="text-[11px] text-slate-400">{b.proRole}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <div>{b.serviceTitle}</div>
                              <div className="text-[11px] text-slate-400">
                                {b.date} • {b.timeSlot}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-emerald-400">
                              €{b.totalPaid}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                  b.status === "completed"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : b.status === "upcoming"
                                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                                    : b.status === "cancelled"
                                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                    : "bg-amber-500/20 text-amber-400"
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {b.status !== "completed" && (
                                  <button
                                    type="button"
                                    onClick={() => adminOverrideBooking(b.id, "completed", false)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[10px] border border-emerald-500/30 transition-colors"
                                  >
                                    Force Complete
                                  </button>
                                )}
                                {b.status !== "cancelled" && (
                                  <button
                                    type="button"
                                    onClick={() => adminOverrideBooking(b.id, "cancelled", true)}
                                    className="px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold text-[10px] border border-red-500/30 transition-colors"
                                  >
                                    Refund Escrow
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 7: ESCROW VAULT & PAYOUT MANAGEMENT
             =================================================== */}
          {activeTab === "escrow" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Escrow Vault & Vendor Payout Authorization
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Monitor held customer escrow deposits and authorize vendor SEPA bank transfer requests.
                  </p>
                </div>
              </div>

              {/* Escrow Balance Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-primary-900/60 to-[#0B1523] border border-primary-500/30">
                  <span className="text-xs text-primary-300 font-semibold block mb-1">
                    Escrow Vault Balance
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-white block">
                    €{metrics.totalEscrowHeld.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-primary-300/80 mt-1 block">
                    Held securely under EU Escrow Directives
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#0B1523] border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    Pending SEPA Requests
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-amber-400 block">
                    €{payoutRequests.reduce((sum, p) => sum + p.amount, 0)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    {payoutRequests.length} Vendor Payouts Awaiting Approval
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#0B1523] border border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block mb-1">
                    Released to Vendors (MTD)
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-emerald-400 block">
                    €132,400
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Zero dispute withholdings
                  </span>
                </div>
              </div>

              {/* Pending Payout Authorization Queue */}
              <div className="bg-[#0B1523] rounded-3xl border border-slate-800 p-6 shadow-card space-y-4">
                <h3 className="font-heading text-base font-bold text-white">
                  Pending SEPA Payout Authorization Queue
                </h3>

                {payoutRequests.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No pending payout requests.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {payoutRequests.map((p) => (
                      <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading text-sm font-bold text-white">{p.proName}</span>
                            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                              {p.category}
                            </span>
                            <span className="text-xs text-amber-400 font-semibold">● {p.requestedDate}</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">
                            Bank Account: <span className="font-mono text-slate-200">{p.method}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">Bank Name: {p.bankName}</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-heading text-xl font-bold text-emerald-400">
                            €{p.amount}
                          </span>
                          <button
                            type="button"
                            onClick={() => approveVendorPayout(p.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-button transition-colors"
                          >
                            Authorize Transfer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 8: COMMISSION & FEE CONFIGURATION
             =================================================== */}
          {activeTab === "commission" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Platform Commission & Take-Rate Rules
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Adjust the platform commission rate across global transactions and discipline categories.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Global Commission Slider (7 cols) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card space-y-6">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white mb-1">
                      Global Platform Commission
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standard fee automatically deducted from gross booking milestones before releasing funds to vendors.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-3">
                    <span className="font-heading text-4xl sm:text-5xl font-extrabold text-primary-400">
                      {tempCommissionRate}%
                    </span>
                    <p className="text-xs text-slate-400">Current Take-Rate per booking</p>

                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      value={tempCommissionRate}
                      onChange={(e) => setTempCommissionRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-1">
                      <span>0% (Free)</span>
                      <span>10% (Default)</span>
                      <span>20%</span>
                      <span>30% (Max)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <span className="text-xs text-slate-400">
                      Changes apply instantly to newly booked appointments.
                    </span>
                    <button
                      type="button"
                      onClick={() => updatePlatformCommission(tempCommissionRate)}
                      className="px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-button transition-colors"
                    >
                      Save Global Rate
                    </button>
                  </div>
                </div>

                {/* Live Revenue Estimation Widget (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-heading text-base font-bold text-white mb-1">
                      Revenue Impact Simulator
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Estimated earnings based on €185,000 monthly GMV
                    </p>

                    <div className="space-y-3 text-xs bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Monthly GMV Benchmark:</span>
                        <span className="font-bold text-white">€185,000</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Take Rate ({tempCommissionRate}%):</span>
                        <span className="font-bold text-emerald-400">
                          €{((185000 * tempCommissionRate) / 100).toLocaleString()} / mo
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Annualized Run-Rate:</span>
                        <span className="font-bold text-primary-400">
                          €{(((185000 * tempCommissionRate) / 100) * 12).toLocaleString()} / yr
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-xs text-primary-300">
                    💡 Vendor payout requests automatically reflect the customized commission calculation.
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 9: RATINGS & REVIEWS MODERATION
             =================================================== */}
          {activeTab === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Ratings & Reviews Moderation
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Audit client testimonials, filter flagged reviews, and reply on behalf of platform support.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                    {allReviews.length} Verified Reviews
                  </span>
                </div>
              </div>

              {/* Review Stream List */}
              <div className="space-y-4">
                {allReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80"}
                          alt={rev.userName}
                          className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{rev.userName}</span>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                              Verified Appointment
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Reviewed <span className="text-primary-400 font-semibold">{rev.proName}</span> ({rev.proRole}) • {rev.date}
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-800 text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Quote */}
                    <p className="text-xs sm:text-sm text-slate-200 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800/80 leading-relaxed">
                      "{rev.comment}"
                    </p>

                    {/* Admin Actions */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400 text-[11px]">
                        Review ID: <span className="font-mono text-slate-300">{rev.id}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => moderateReview(rev.proId, rev.id, "approve")}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-xs transition-colors"
                        >
                          Keep / Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => moderateReview(rev.proId, rev.id, "delete")}
                          className="px-3 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove Review</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ===================================================
              TAB 10: REPORTS & DATA EXPORTERS
             =================================================== */}
          {activeTab === "reports" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
                    Compliance & Financial Reports Exporter
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                    Generate instant monthly transaction ledgers, tax withholding statements, and vendor audits.
                  </p>
                </div>
              </div>

              {/* 4 Report Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Report 1 */}
                <div className="p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mb-3">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">
                      Monthly Platform Revenue & Escrow Statement
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Complete CSV breakdown of all funded bookings, customer payments, escrow release timestamps, and platform fees.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Format: <strong>.CSV (Excel compatible)</strong></span>
                      <span>•</span>
                      <span>Includes: <strong>All completed bookings</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportReport("monthly_revenue_summary")}
                    className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-button transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Revenue CSV</span>
                  </button>
                </div>

                {/* Report 2 */}
                <div className="p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">
                      Tax & VAT Compliance Summary (EU-Wide)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Financial summary formatted for German Finanzamt and European cross-border reverse-charge VAT reporting.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Format: <strong>.PDF Statement</strong></span>
                      <span>•</span>
                      <span>Certified: <strong>Yes</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportReport("tax_compliance_pdf")}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-button transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Generate Tax PDF</span>
                  </button>
                </div>

                {/* Report 3 */}
                <div className="p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">
                      Verified Vendors & License Audit Log
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Complete list of active professionals with verified government ID numbers, trade chamber registrations, and expiration dates.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Format: <strong>.CSV</strong></span>
                      <span>•</span>
                      <span>Total: <strong>15,000+ records</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportReport("vendor_audit_log")}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Vendor Audit CSV</span>
                  </button>
                </div>

                {/* Report 4 */}
                <div className="p-6 rounded-3xl bg-[#0B1523] border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-white">
                      Customer Retention & Conversion Metrics
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Cohort analysis detailing first-time bookings to recurring retention ratios across all 8 service categories.
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Format: <strong>.PDF Presentation</strong></span>
                      <span>•</span>
                      <span>Coverage: <strong>Q1-Q3 2026</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => exportReport("customer_retention_analytics")}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Growth Analytics</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
}
