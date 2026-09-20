"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_MODE } from "@/context/AuthContext";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const { login, showToast } = useAuth();

  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    identifier: "alex.morgan@example.com",
    password: "••••••••",
    rememberMe: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.identifier.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }
    if (!form.password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier: form.identifier, password: form.password, role: authRole });
      router.push(authRole === "professional" ? "/vendor" : "/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialAuth = (provider) => {
    showToast(`${provider} sign-in isn't enabled yet. Use email and password.`, "info");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Left Column: Visual Brand Hero */}
      <div className="md:w-1/2 bg-gradient-to-br from-dark-900 via-primary-950 to-primary-900 text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        {/* Brand Logo */}
        <Link href="/" className="relative z-10 flex flex-col group">
          <div className="flex items-baseline font-heading text-2xl font-bold tracking-tight text-white leading-none">
            <span>Book</span>
            <span className="text-primary-400">My</span>
            <span>Professional</span>
          </div>
          <span className="text-xs text-white/70 tracking-normal mt-1 leading-tight font-sans">
            Skilled People. Better Living.
          </span>
        </Link>

        {/* Hero Copy */}
        <div className="relative z-10 my-12 max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-xs font-semibold text-white">
              Trusted by 15,000+ Verified Experts
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight text-white">
            Connect with certified professionals in minutes.
          </h2>

          <p className="text-sm text-white/80 leading-relaxed">
            Manage your bookings, track service milestones, and experience transparent escrow-backed scheduling across India.
          </p>
        </div>

        {/* Footer Guarantee */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-white/60 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit SSL Encrypted & India Data Privacy Compliant</span>
        </div>
      </div>

      {/* Right Column: Login Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-900">
              Welcome Back
            </h1>
            <p className="text-xs sm:text-sm text-dark-500 mt-1">
              Please enter your login details to access your account.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {DEMO_MODE && (
            <div className="p-3 text-xs font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-xl">
              Demo mode — any email and password will sign you in. Pick <strong>Professional</strong> above to log in as a professional.
            </div>
          )}

          {/* Role Switcher */}
          <div className="bg-dark-50 p-1.5 rounded-2xl border border-border flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAuthRole("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                authRole === "customer"
                  ? "bg-surface text-primary-600 shadow-sm border border-border/80"
                  : "text-dark-600 hover:text-dark-900"
              }`}
            >
              <User className="h-4 w-4" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthRole("professional")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                authRole === "professional"
                  ? "bg-surface text-primary-600 shadow-sm border border-border/80"
                  : "text-dark-600 hover:text-dark-900"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Professional</span>
            </button>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              className="flex items-center justify-center py-2.5 px-3 border border-border rounded-xl bg-surface hover:bg-dark-50 text-xs font-semibold text-dark-700 transition-colors gap-2 shadow-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth("Apple")}
              className="flex items-center justify-center py-2.5 px-3 border border-border rounded-xl bg-surface hover:bg-dark-50 text-xs font-semibold text-dark-700 transition-colors gap-2 shadow-xs"
            >
              <svg className="w-4 h-4 fill-current text-dark-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.71-.94 2.76 1.05.08 2.05-.55 2.59-1.27z" />
              </svg>
              <span>Apple</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth("LinkedIn")}
              className="flex items-center justify-center py-2.5 px-3 border border-border rounded-xl bg-surface hover:bg-dark-50 text-xs font-semibold text-dark-700 transition-colors gap-2 shadow-xs"
            >
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-border w-full" />
            <span className="bg-background px-3 text-[11px] font-medium text-dark-400 uppercase tracking-wider">
              Or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="email"
                  required
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-dark-700">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-semibold text-primary-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full justify-center py-3 font-semibold text-sm shadow-button mt-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <ArrowRight className="h-4 w-4 mr-1.5" />
              )}
              Sign In to Account
            </Button>
          </form>

          <p className="text-xs text-center text-dark-500">
            Don't have an account yet?{" "}
            <Link
              href="/register"
              className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Create Free Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
