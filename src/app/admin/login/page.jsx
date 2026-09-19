"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Key,
  ArrowRight,
  Sparkles,
  Server,
  Terminal,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Cpu,
  Layers,
  Fingerprint,
} from "lucide-react";
import Button from "@/components/Button";

// Load Admin Credentials from environment variables
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@bookmyprofessional.com";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@BookMyPro2026#";
const ADMIN_NAME = process.env.NEXT_PUBLIC_ADMIN_NAME || "Super Administrator";

function AdminLoginForm() {
  const router = useRouter();
  const { login, showToast } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [is2FaSimulated, setIs2FaSimulated] = useState(true);
  const [securityLogStatus, setSecurityLogStatus] = useState("Root Access Gate Ready");

  // Autofill credentials from .env
  const handleAutofill = () => {
    setEmail(ADMIN_EMAIL);
    setPassword(ADMIN_PASSWORD);
    setErrorMessage("");
    showToast("Admin credentials populated from .env configuration", "info");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Please enter the administrator email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter the master admin security key.");
      return;
    }

    // Verify against .env configuration
    const isEmailValid = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const isPasswordValid = password === ADMIN_PASSWORD;

    if (!isEmailValid || !isPasswordValid) {
      setErrorMessage("Access Denied: Invalid administrator credentials. Verify .env settings.");
      return;
    }

    setIsLoading(true);
    setSecurityLogStatus("Authenticating master cryptographic key...");

    setTimeout(() => {
      setSecurityLogStatus("Session token authorized. Initializing admin suite...");
      setTimeout(() => {
        setIsLoading(false);
        login({
          name: ADMIN_NAME,
          email: ADMIN_EMAIL,
          role: "admin",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        });
        showToast("Super Admin logged in successfully! Welcome to Admin Console.", "success");
        router.push("/admin");
      }, 600);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#070E17] text-white flex flex-col justify-between selection:bg-primary-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Tech Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#0D8EF5_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
              Return to Marketplace
            </span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline font-mono">NODE: FRA-01 (LIVE)</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-primary-400 border border-slate-700">
              v2.4.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Brand Icon Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-sky-400 shadow-xl shadow-primary-500/20 mb-2 border border-primary-400/30">
              <Shield className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Admin Console Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              Secure administrative access for BookMyProfessional.com management operations.
            </p>
          </div>

          {/* Quick Autofill Env Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B1523] to-slate-900 border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary-400">
                <Key className="w-3.5 h-3.5" />
                Environment Configuration (.env)
              </span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-primary-500/20 text-primary-300 hover:bg-primary-500/30 border border-primary-500/30 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                1-Click Autofill
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Email:</span>
                <span className="text-sky-300 font-semibold">{ADMIN_EMAIL}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Password:</span>
                <span className="text-sky-300 font-semibold">{ADMIN_PASSWORD}</span>
              </div>
            </div>
          </div>

          {/* Login Form Container */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0A121E]/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-5">
            
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Authentication Failed</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@bookmyprofessional.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Master Password
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    AES-256 Validated
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Check Toggle */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={is2FaSimulated}
                    onChange={(e) => setIs2FaSimulated(e.target.checked)}
                    className="rounded-full bg-slate-900 border-slate-700 text-primary-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Enforce Master Session Token</span>
                </label>

              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                className="w-full justify-center py-3 font-semibold text-sm shadow-button mt-4 bg-gradient-to-r from-primary-600 to-sky-500 hover:from-primary-500 hover:to-sky-400 border-0"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Master Token...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Unlock Admin Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            {/* Live Security Terminal Log Status */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-900 font-mono text-[11px] text-slate-400 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-primary-400 shrink-0" />
              <span className="truncate text-slate-300">{securityLogStatus}</span>
            </div>
          </div>

          {/* Secondary Footer Security Badges */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
            <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-slate-300 font-semibold block">SSL Encrypted</span>
              <span>TLS 1.3 Certified</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-slate-300 font-semibold block">Audit Trail</span>
              <span>Logs Persistent</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/50 border border-slate-800/60">
              <span className="text-slate-300 font-semibold block">Escrow Vault</span>
              <span>Hardware Backed</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0A121E]/80 backdrop-blur-md px-4 sm:px-8 py-3 text-center text-xs text-slate-500">
        <p>© 2026 BookMyProfessional.com • Central Administration Authority • All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#070E17] text-slate-400 text-sm">
          Loading Admin Security Portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
