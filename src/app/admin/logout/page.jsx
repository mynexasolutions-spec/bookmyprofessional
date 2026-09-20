"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Home,
  Lock,
  ShieldAlert,
  Server,
  Clock,
  Key,
} from "lucide-react";
import Button from "@/components/Button";

function AdminLogoutContent() {
  const router = useRouter();
  const { user, logout, showToast } = useAuth();

  const [countdown, setCountdown] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [logoutTimestamp, setLogoutTimestamp] = useState("");

  // Perform logout on mount and set timestamp
  useEffect(() => {
    logout();
    setLogoutTimestamp(new Date().toLocaleTimeString("en-GB", { hour12: false }) + " UTC+2");
  }, []);

  // Countdown timer for automatic redirect to /admin/login
  useEffect(() => {
    if (isPaused) return;

    if (countdown <= 0) {
      router.push("/admin/login");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, isPaused, router]);

  return (
    <div className="min-h-screen bg-[#070E17] text-white flex flex-col justify-between selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Decorative Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#0D8EF5_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Home className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
              BookMyProfessional.com
            </span>
          </Link>

          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            Session Safely Terminated
          </span>
        </div>
      </header>

      {/* Main Content Box */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Main Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A121E]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl text-center space-y-6">
            
            {/* Animated Logout Icon */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-primary-500/20 blur-lg animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-[#0B1523] border border-slate-700 flex items-center justify-center text-primary-400 shadow-xl">
                <LogOut className="w-8 h-8 text-primary-400" />
              </div>
            </div>

            {/* Header Titles */}
            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Admin Logged Out
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                You have been safely disconnected from the central administrative console.
              </p>
            </div>

            {/* Security Audit Checklist */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-primary-400">
                  <Lock className="w-3.5 h-3.5" />
                  Security Clearance Audit
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {logoutTimestamp || "LIVE"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Session tokens revoked</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Escrow keys locked</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Admin cache cleared</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Termination logged</span>
                </div>
              </div>
            </div>

            {/* Auto Redirect Banner */}
            <div className="p-3.5 rounded-2xl bg-primary-950/40 border border-primary-900/60 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-400 animate-spin" />
                <span>
                  {isPaused ? (
                    <span className="text-amber-300 font-medium">Redirect paused</span>
                  ) : (
                    <span>
                      Redirecting to login in <strong className="text-primary-300 font-bold">{countdown}s</strong>...
                    </span>
                  )}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              >
                {isPaused ? "Resume" : "Pause"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <Link href="/admin/login" className="block w-full">
                <Button
                  variant="primary"
                  className="w-full justify-center py-3 font-semibold text-sm shadow-button bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-500 hover:to-sky-400 border-0"
                >
                  <Key className="w-4 h-4 mr-2" />
                  <span>Sign Back In to Admin</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link href="/" className="block w-full">
                <Button
                  variant="outline"
                  className="w-full justify-center py-2.5 text-xs hover:!text-white !text-black border-slate-800 hover:bg-slate-900"
                >
                  <Home className="w-3.5 h-3.5 mr-1.5 text-dark-800" />
                  <span>Go to Customer Marketplace</span>
                </Button>
              </Link>
            </div>

          </div>

          {/* Quick Support / Contact note */}
          <p className="text-center text-[11px] text-slate-500">
            For security audits and server queries, contact security@bookmyprofessional.com
          </p>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-xs text-slate-500">
        <p>© 2026 BookMyProfessional.com • Central Administration Authority</p>
      </footer>
    </div>
  );
}

export default function AdminLogoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070E17] text-slate-400 text-sm">
          Processing Admin Signout...
        </div>
      }
    >
      <AdminLogoutContent />
    </Suspense>
  );
}
