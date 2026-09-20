"use client";

import { useActionState } from "react";
import { Lock, ShieldCheck, User } from "lucide-react";
import { adminLogin } from "@/actions/admin";
import Button from "@/components/Button";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, {});

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 p-4">
      <div className="w-full max-w-sm bg-surface rounded-2xl border border-border shadow-soft p-6 sm:p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-dark-900 leading-tight">
              Admin Access
            </h1>
            <p className="text-xs text-dark-500">BookMyProfessional control panel</p>
          </div>
        </div>

        {state?.error && (
          <div className="mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-dark-700 mb-1.5">
              Admin ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                name="id"
                type="text"
                required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-sm text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dark-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-3 py-2.5 bg-dark-50 border border-border rounded-xl text-sm text-dark-900 focus:bg-white focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="w-full justify-center py-2.5 font-semibold text-sm shadow-button"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
