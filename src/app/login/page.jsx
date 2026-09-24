"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
  const { login, loginWithProvider, resendVerificationEmail, showToast } = useAuth();

  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    identifier: "",
    password: "",
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

  const handleSocialAuth = async (provider) => {
    try {
      await loginWithProvider(provider.toLowerCase());
    } catch (err) {
      setErrorMessage(err.message || `Failed to sign in with ${provider}.`);
    }
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
            <div className="flex flex-col gap-2 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.toLowerCase().includes("email not confirmed") && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await resendVerificationEmail(form.identifier);
                      setErrorMessage("");
                    } catch (err) {
                      setErrorMessage(err.message || "Failed to resend email.");
                    }
                  }}
                  className="mt-1 text-red-700 font-bold underline hover:text-red-900 text-left"
                >
                  Click here to resend verification email
                </button>
              )}
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
                  placeholder="Enter your email address"
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
