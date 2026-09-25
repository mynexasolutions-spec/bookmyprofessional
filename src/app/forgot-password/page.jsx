"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSuccess(false);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link.');
      }
      
      setIsSuccess(true);
    } catch (err) {
      setErrorMessage(err.message || "Failed to process request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md bg-surface p-8 sm:p-10 rounded-3xl shadow-xl shadow-primary-900/5 border border-border">
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-baseline font-heading text-2xl font-bold tracking-tight leading-none mb-6 group">
            <span className="text-dark-900 group-hover:text-primary-600 transition-colors">Book</span>
            <span className="text-primary-600">My</span>
            <span className="text-dark-900 group-hover:text-primary-600 transition-colors">Professional</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold text-dark-900">Forgot Password?</h1>
          <p className="text-sm text-dark-500 mt-2">Enter your email and we'll send you a reset link.</p>
        </div>

        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-dark-900">Check Your Email</h2>
            <p className="text-sm text-dark-600">
              We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <div className="pt-6">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
                <ArrowLeft className="w-4 h-4" />
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-xl text-sm text-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center py-3.5 rounded-xl font-semibold shadow-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <Sparkles className="h-4 w-4 ml-2 opacity-80" />
                </>
              )}
            </Button>
            
            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold text-dark-500 hover:text-dark-900 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
