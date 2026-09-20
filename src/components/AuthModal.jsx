"use client";

import React, { useState, useEffect } from "react";
import { useAuth, DEMO_MODE } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import Button from "./Button";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    authRole,
    setAuthModalTab,
    setAuthRole,
    closeAuthModal,
    login,
    signup,
    showToast,
    toastMessage,
  } = useAuth();

  // Mode: "auth" (login/signup) or "forgot-password"
  const [viewMode, setViewMode] = useState("auth");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);

  // Form states
  const [loginForm, setLoginForm] = useState({
    identifier: "",
    password: "",
    rememberMe: true,
  });

  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "Doctors",
    city: "Mumbai",
    agreeTerms: true,
  });

  const [forgotEmail, setForgotEmail] = useState("");

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset view modes on close
      setTimeout(() => {
        setViewMode("auth");
        setErrorMessage("");
        setForgotPasswordSubmitted(false);
      }, 200);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return <ToastNotification toastMessage={toastMessage} />;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginForm.identifier.trim()) {
      setErrorMessage("Please enter your email or phone number");
      return;
    }
    if (!loginForm.password) {
      setErrorMessage("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await login({ identifier: loginForm.identifier, password: loginForm.password, role: authRole });
    } catch (error) {
      setErrorMessage(error?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!signupForm.fullName.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!signupForm.email.trim() || !signupForm.email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    if (!signupForm.password || signupForm.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }
    if (!signupForm.agreeTerms) {
      setErrorMessage("Please accept the Terms of Service & Privacy Policy");
      return;
    }

    setIsLoading(true);
    try {
      await signup({
        fullName: signupForm.fullName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        role: authRole,
        category: authRole === "professional" ? signupForm.category : undefined,
        city: authRole === "professional" ? signupForm.city : undefined,
      });
    } catch (error) {
      setErrorMessage(error?.message || "Unable to create your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setForgotPasswordSubmitted(true);
    } catch (error) {
      setErrorMessage(error?.message || "Unable to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ponytail: OAuth providers need dashboard config + credentials before they can work.
  // Wire supabase.auth.signInWithOAuth per provider when those exist.
  const handleSocialAuth = (provider) => {
    showToast(`${provider} sign-in is not enabled yet. Please use email and password.`, "info");
  };

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
    "Event Planners",
    "Fitness Trainers",
  ];

  return (
    <>
      {/* Toast Notification Container */}
      <ToastNotification toastMessage={toastMessage} />

      {/* Main Modal Backdrop */}
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Dark Backdrop Overlay with Blur */}
        <div
          className="fixed inset-0 bg-dark-900/65 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={closeAuthModal}
          aria-hidden="true"
        />

        {/* Modal Window Container */}
        <div
          className="relative w-full max-w-[480px] my-auto bg-surface rounded-2xl shadow-2xl border border-border/80 overflow-hidden z-10 transition-all duration-300 animate-in zoom-in-95 fade-in"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Decorative Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary-500 via-primary-400 to-sky-400" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full text-dark-400 hover:text-dark-800 hover:bg-dark-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 z-10"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-5 sm:p-7">
            {/* Logo & Header */}
            <div className="text-center mb-5">
              <div className="inline-flex items-baseline font-heading text-xl sm:text-2xl font-bold tracking-tight text-dark-900 leading-none">
                <span>Book</span>
                <span className="text-primary-500">My</span>
                <span>Professional</span>
              </div>
              <p className="text-xs text-dark-500 mt-1 font-sans">
                {viewMode === "forgot-password"
                  ? "Reset your account password"
                  : authModalTab === "login"
                  ? "Welcome back! Please enter your details to sign in."
                  : "Join thousands of clients & top verified experts today."}
              </p>
            </div>

            {/* ERROR ALERT */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 p-3 text-xs sm:text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {DEMO_MODE && viewMode !== "forgot-password" && (
              <div className="mb-4 p-3 text-[11px] font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg">
                Demo mode — any email and password works.
              </div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {viewMode === "forgot-password" ? (
              <div className="space-y-4">
                {forgotPasswordSubmitted ? (
                  <div className="text-center py-4 space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading font-semibold text-dark-900 text-base">
                      Password Reset Link Sent
                    </h3>
                    <p className="text-xs text-dark-600 max-w-xs mx-auto">
                      We've sent an email to <span className="font-semibold text-dark-800">{forgotEmail}</span> with instructions to reset your password.
                    </p>
                    <Button
                      variant="primary"
                      className="w-full mt-3 justify-center"
                      onClick={() => {
                        setViewMode("auth");
                        setAuthModalTab("login");
                        setForgotPasswordSubmitted(false);
                      }}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1.5">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-dark-50 border border-border rounded-lg text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="w-full justify-center py-2.5 font-semibold text-sm shadow-button"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <KeyRound className="h-4 w-4 mr-2" />
                      )}
                      Send Reset Instructions
                    </Button>

                    <button
                      type="button"
                      onClick={() => setViewMode("auth")}
                      className="w-full text-center text-xs font-medium text-dark-600 hover:text-primary-600 pt-1"
                    >
                      ← Back to Login
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                {/* ROLE SWITCHER: Customer vs Professional */}
                <div className="mb-4 bg-dark-50 p-1 rounded-xl border border-border flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthRole("customer")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      authRole === "customer"
                        ? "bg-surface text-primary-600 shadow-sm border border-border/80"
                        : "text-dark-600 hover:text-dark-900"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Customer (I need help)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthRole("professional")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      authRole === "professional"
                        ? "bg-surface text-primary-600 shadow-sm border border-border/80"
                        : "text-dark-600 hover:text-dark-900"
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Professional (I offer services)</span>
                  </button>
                </div>

                {/* LOGIN / SIGN UP TABS */}
                <div className="flex border-b border-border mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab("login");
                      setErrorMessage("");
                    }}
                    className={`flex-1 pb-2.5 text-sm font-semibold transition-all text-center relative ${
                      authModalTab === "login"
                        ? "text-primary-600"
                        : "text-dark-500 hover:text-dark-800"
                    }`}
                  >
                    Sign In
                    {authModalTab === "login" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalTab("signup");
                      setErrorMessage("");
                    }}
                    className={`flex-1 pb-2.5 text-sm font-semibold transition-all text-center relative ${
                      authModalTab === "signup"
                        ? "text-primary-600"
                        : "text-dark-500 hover:text-dark-800"
                    }`}
                  >
                    Create Account
                    {authModalTab === "signup" && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </button>
                </div>

                {/* SOCIAL BUTTONS (GOOGLE / APPLE / LINKEDIN) */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    type="button"
                    onClick={() => handleSocialAuth("Google")}
                    className="flex items-center justify-center py-2 px-3 border border-border rounded-lg bg-surface hover:bg-dark-50 text-xs font-medium text-dark-700 transition-colors gap-1.5 shadow-xs"
                    title="Continue with Google"
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
                    className="flex items-center justify-center py-2 px-3 border border-border rounded-lg bg-surface hover:bg-dark-50 text-xs font-medium text-dark-700 transition-colors gap-1.5 shadow-xs"
                    title="Continue with Apple"
                  >
                    <svg className="w-4 h-4 fill-current text-dark-900" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 1.01-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.71-.94 2.76 1.05.08 2.05-.55 2.59-1.27z" />
                    </svg>
                    <span>Apple</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialAuth("LinkedIn")}
                    className="flex items-center justify-center py-2 px-3 border border-border rounded-lg bg-surface hover:bg-dark-50 text-xs font-medium text-dark-700 transition-colors gap-1.5 shadow-xs"
                    title="Continue with LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                    <span>LinkedIn</span>
                  </button>
                </div>

                {/* OR DIVIDER */}
                <div className="relative flex items-center justify-center mb-4">
                  <div className="border-t border-border w-full" />
                  <span className="bg-surface px-3 text-[11px] font-medium text-dark-400 uppercase tracking-wider">
                    Or with email
                  </span>
                </div>

                {/* LOGIN FORM */}
                {authModalTab === "login" && (
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1">
                        Email or Mobile Number
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="text"
                          required
                          value={loginForm.identifier}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, identifier: e.target.value })
                          }
                          placeholder="e.g. alex@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-dark-700">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setViewMode("forgot-password")}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, password: e.target.value })
                          }
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={loginForm.rememberMe}
                          onChange={(e) =>
                            setLoginForm({ ...loginForm, rememberMe: e.target.checked })
                          }
                          className="rounded border-border text-primary-500 focus:ring-primary-500 h-4 w-4"
                        />
                        <span className="text-xs text-dark-600 font-medium">
                          Remember me for 30 days
                        </span>
                      </label>
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="w-full justify-center py-2.5 mt-2 font-semibold text-sm shadow-button"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <ArrowRight className="h-4 w-4 mr-1.5" />
                      )}
                      Sign In to Account
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-dark-500">
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalTab("signup");
                            setErrorMessage("");
                          }}
                          className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Sign Up free
                        </button>
                      </p>
                    </div>
                  </form>
                )}

                {/* SIGN UP FORM */}
                {authModalTab === "signup" && (
                  <form onSubmit={handleSignupSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-dark-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                        <input
                          type="text"
                          required
                          value={signupForm.fullName}
                          onChange={(e) =>
                            setSignupForm({ ...signupForm, fullName: e.target.value })
                          }
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-10 pr-3.5 py-2 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                          <input
                            type="email"
                            required
                            value={signupForm.email}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, email: e.target.value })
                            }
                            placeholder="name@example.com"
                            className="w-full pl-10 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                          <input
                            type="tel"
                            value={signupForm.phone}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, phone: e.target.value })
                            }
                            placeholder="+91 98200 12345"
                            className="w-full pl-10 pr-3 py-2 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* PROFESSIONAL SPECIFIC EXTRA FIELDS */}
                    {authRole === "professional" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-2.5 bg-primary-50/50 rounded-xl border border-primary-100 animate-in fade-in">
                        <div>
                          <label className="block text-[11px] font-semibold text-primary-900 mb-1">
                            Your Profession / Specialty
                          </label>
                          <select
                            value={signupForm.category}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, category: e.target.value })
                            }
                            className="w-full px-2.5 py-2 bg-white border border-primary-200 rounded-lg text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-primary-900 mb-1">
                            City / Area of Service
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-500" />
                            <input
                              type="text"
                              value={signupForm.city}
                              onChange={(e) =>
                                setSignupForm({ ...signupForm, city: e.target.value })
                              }
                              placeholder="Mumbai, Delhi..."
                              className="w-full pl-8 pr-2.5 py-2 bg-white border border-primary-200 rounded-lg text-xs text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PASSWORDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={signupForm.password}
                            onChange={(e) =>
                              setSignupForm({ ...signupForm, password: e.target.value })
                            }
                            placeholder="Min 6 chars"
                            className="w-full pl-10 pr-8 py-2 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                          >
                            {showPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-dark-700 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            value={signupForm.confirmPassword}
                            onChange={(e) =>
                              setSignupForm({
                                ...signupForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="Re-enter password"
                            className="w-full pl-10 pr-8 py-2 bg-dark-50 border border-border rounded-lg text-xs sm:text-sm text-dark-900 placeholder:text-dark-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-700"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={signupForm.agreeTerms}
                        onChange={(e) =>
                          setSignupForm({ ...signupForm, agreeTerms: e.target.checked })
                        }
                        className="mt-0.5 rounded border-border text-primary-500 focus:ring-primary-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] text-dark-600 leading-tight">
                        I agree to BookMyProfessional's{" "}
                        <a href="#terms" className="text-primary-600 hover:underline">
                          Terms
                        </a>{" "}
                        &{" "}
                        <a href="#privacy" className="text-primary-600 hover:underline">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isLoading}
                      className="w-full justify-center py-2.5 mt-2 font-semibold text-sm shadow-button"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-1.5" />
                      )}
                      {authRole === "professional"
                        ? "Register as Professional"
                        : "Create Free Account"}
                    </Button>

                    <div className="text-center pt-1">
                      <p className="text-xs text-dark-500">
                        Already have an account?{" "}
                        <button
                          type="button"
                          onClick={() => {
                            setAuthModalTab("login");
                            setErrorMessage("");
                          }}
                          className="font-semibold text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Sign In
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </>
            )}

            {/* TRUST BADGE AT FOOTER */}
            <div className="mt-5 pt-3 border-t border-border/80 flex items-center justify-center gap-1.5 text-[11px] text-dark-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>256-bit SSL Encrypted & Verified Privacy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Crisp Toast component
function ToastNotification({ toastMessage }) {
  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[1000] max-w-sm bg-dark-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-dark-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <p className="text-xs sm:text-sm font-medium leading-snug">
        {toastMessage.message}
      </p>
    </div>
  );
}
