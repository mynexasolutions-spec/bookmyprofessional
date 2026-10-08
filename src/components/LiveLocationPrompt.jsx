"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocation } from "@/context/LocationContext";
import { MapPin, Navigation, X, CheckCircle2, AlertCircle, Loader2, RotateCw } from "lucide-react";
import Button from "./Button";

export default function LiveLocationPrompt() {
  const pathname = usePathname();

  const {
    liveLocation,
    isLocating,
    locationError,
    permissionStatus,
    requestLiveLocation,
    dismissPrompt,
    clearLiveLocation,
  } = useLocation();

  const [minimized, setMinimized] = useState(false);

  // Never show on admin dashboard or admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // If granted, show a subtle live location pill
  if (permissionStatus === "granted" && liveLocation) {
    if (minimized) return null;
    return (
      <div className="bg-emerald-900 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs transition-all relative z-40">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-200">Live Location Active:</span>
            <span className="text-white font-medium">
              {liveLocation.city
                ? `${liveLocation.city}${liveLocation.state ? `, ${liveLocation.state}` : ""}`
                : liveLocation.state || liveLocation.formatted || "Detected"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={requestLiveLocation}
              disabled={isLocating}
              title="Refresh Live Location"
              className="text-emerald-200 hover:text-white p-1 rounded-md hover:bg-emerald-800 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setMinimized(true)}
              className="text-emerald-300 hover:text-white text-xs ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If user has not decided yet or prompt is active
  if (permissionStatus === "prompt") {
    return (
      <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-dark-900 text-white p-3.5 shadow-lg border-b border-primary-700/50 relative z-40 animate-fadeIn">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-400/40 flex items-center justify-center shrink-0 text-primary-300 mt-0.5 sm:mt-0">
              <Navigation className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                Enable Live Location Detection
              </p>
              <p className="text-[11px] text-primary-200/90 leading-tight">
                Allow location access so we can accurately match your pincode and show verified local professionals in your exact area.
              </p>
              {locationError && (
                <p className="text-[11px] text-red-300 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {locationError}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={dismissPrompt}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              Not Now
            </button>
            <button
              type="button"
              onClick={requestLiveLocation}
              disabled={isLocating}
              className="text-xs font-semibold py-2 px-4 rounded-xl shadow-md bg-primary-500 hover:bg-primary-600 active:scale-95 text-white border-0 flex items-center gap-1.5 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLocating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span className="text-white font-semibold">Detecting...</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-white" />
                  <span className="text-white font-semibold">Allow Location</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
