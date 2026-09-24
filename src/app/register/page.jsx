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
  Phone,
  Briefcase,
  MapPin,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import Button from "@/components/Button";

export default function RegisterPage() {
  const router = useRouter();
  const { signup, showToast } = useAuth();

  const [authRole, setAuthRole] = useState("customer"); // "customer" | "professional"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    category: "Doctors",
    city: "Mumbai",
    agreeTerms: true,
  });

  const categories = [
    "Doctors",
    "Tutors",
    "IT Professionals",
    "Electricians",
    "Plumbers",
    "Beauticians",
    "Cleaners",
    "Consultants",
    "Carpenters",
    "Painters",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!form.email.trim() || !form.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: authRole,
        category: authRole === "professional" ? form.category : undefined,
        city: authRole === "professional" ? form.city : undefined,
      });
      if (result?.needsEmailConfirmation) {
        showToast("Check your email to confirm your account, then sign in.", "info");
        router.push("/login");
        return;
      }
      router.push(authRole === "professional" ? "/vendor" : "/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Sign up failed. Please try again.");
    } finally {
      setIsLoading(false);
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
              {authRole === "professional"
                ? "Join as a Verified Professional"
                : "Join 100,000+ Happy Customers"}
            </span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl font-bold leading-tight text-white">
            {authRole === "professional"
              ? "Grow your freelance business with instant client appointments."
              : "Find trusted local experts with verified credentials."}
          </h2>

          <p className="text-sm text-white/80 leading-relaxed">
            {authRole === "professional"
              ? "Earn top market rates, manage your weekly availability, and receive guaranteed milestone payouts straight to your IBAN."
              : "Compare prices, schedule in-person or remote consultations, and enjoy guaranteed escrow protection for every booking."}
          </p>
        </div>

        {/* Footer Guarantee */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-white/60 pt-4 border-t border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-bit SSL Encrypted & India Data Privacy Compliant</span>
        </div>
      </div>

      {/* Right Column: Register Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-5">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-dark-900">
              Create Free Account
            </h1>
            <p className="text-xs sm:text-sm text-dark-500 mt-1">
              Join BookMyProfessional today in less than a minute.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email address"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-dark-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="w-full pl-9 pr-3 py-2.5 bg-surface border border-border rounded-xl text-xs text-dark-900 focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Professional Specific Fields */}
            {authRole === "professional" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-primary-50/50 rounded-2xl border border-primary-100">
                <div>
                  <label className="block text-[11px] font-bold text-primary-900 mb-1">
                    Profession Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-primary-900 mb-1">
                    City of Service
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-500" />
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Enter your city"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-primary-200 rounded-xl text-xs text-dark-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-dark-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border border-border rounded-xl text-xs sm:text-sm text-dark-900 focus:outline-none focus:border-primary-500"
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

            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.agreeTerms}
                onChange={(e) => setForm({ ...form, agreeTerms: e.target.checked })}
                className="mt-0.5 rounded text-primary-500 focus:ring-primary-500 h-4 w-4"
              />
              <span className="text-[11px] text-dark-600 leading-tight">
                I agree to the Terms of Service & Privacy Policy of BookMyProfessional.
              </span>
            </label>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full justify-center py-3 font-semibold text-sm shadow-button mt-2"
            >
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1.5" />
              )}
              {authRole === "professional" ? "Register as Professional" : "Create Free Account"}
            </Button>
          </form>

          <p className="text-xs text-center text-dark-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
