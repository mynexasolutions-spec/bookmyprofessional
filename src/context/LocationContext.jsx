"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LocationContext = createContext(null);

const STORAGE_KEY = "bmp_live_location";
const DISMISSED_KEY = "bmp_location_prompt_dismissed";

// State aliases/normalizations for Indian states
function normalizeState(stateStr) {
  if (!stateStr) return "";
  const s = String(stateStr).trim().toLowerCase();
  if (s.includes("delhi")) return "delhi";
  if (s.includes("maharashtra")) return "maharashtra";
  if (s.includes("karnataka")) return "karnataka";
  if (s.includes("tamil nadu")) return "tamil nadu";
  if (s.includes("telangana")) return "telangana";
  if (s.includes("andhra")) return "andhra pradesh";
  if (s.includes("uttar pradesh")) return "uttar pradesh";
  if (s.includes("madhya pradesh")) return "madhya pradesh";
  if (s.includes("west bengal")) return "west bengal";
  if (s.includes("gujarat")) return "gujarat";
  if (s.includes("rajasthan")) return "rajasthan";
  if (s.includes("kerala")) return "kerala";
  if (s.includes("punjab")) return "punjab";
  if (s.includes("haryana")) return "haryana";
  if (s.includes("bihar")) return "bihar";
  if (s.includes("odisha") || s.includes("orissa")) return "odisha";
  return s;
}

export function LocationProvider({ children }) {
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [permissionStatus, setPermissionStatus] = useState("unknown"); // "unknown" | "prompt" | "granted" | "denied" | "dismissed"

  // 1. Initialize from localStorage / sessionStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.state) {
          setLiveLocation(parsed);
          setPermissionStatus("granted");
          return;
        }
      }

      const dismissed = sessionStorage.getItem(DISMISSED_KEY);
      if (dismissed) {
        setPermissionStatus("dismissed");
      } else {
        setPermissionStatus("prompt");
      }
    } catch {
      setPermissionStatus("prompt");
    }
  }, []);

  // 2. Request user GPS live location
  const requestLiveLocation = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setPermissionStatus("denied");
      return null;
    }

    setIsLocating(true);
    setLocationError("");

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `/api/location/reverse-geocode?lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();

            if (res.ok && data?.success) {
              const locationPayload = {
                latitude,
                longitude,
                city: data.city || "",
                district: data.district || "",
                state: data.state || "",
                country: data.country || "India",
                formatted: data.formatted || `${data.city}, ${data.state}`,
                detectedAt: Date.now(),
              };

              setLiveLocation(locationPayload);
              setPermissionStatus("granted");
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(locationPayload));
              } catch {}
              setIsLocating(false);
              resolve(locationPayload);
              return;
            }

            throw new Error(data?.error || "Failed to reverse geocode location.");
          } catch (err) {
            console.error("[Location] Error detecting address:", err);
            setLocationError("Location detected, but unable to resolve city name.");
            setIsLocating(false);
            resolve(null);
          }
        },
        (err) => {
          console.warn("[Location] Geolocation permission denied or unavailable:", err.message);
          setLocationError("Location access was denied. Please allow location to verify your address.");
          setPermissionStatus("denied");
          setIsLocating(false);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  // 3. User dismisses prompt banner
  const dismissPrompt = useCallback(() => {
    setPermissionStatus("dismissed");
    try {
      sessionStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
  }, []);

  // 4. Reset location (e.g. to re-detect)
  const clearLiveLocation = useCallback(() => {
    setLiveLocation(null);
    setPermissionStatus("prompt");
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(DISMISSED_KEY);
    } catch {}
  }, []);

  /**
   * Strictly verifies if an entered pincode's detected state/district matches the user's live location.
   * If live location is detected in Pune (Maharashtra), and user enters a Delhi pincode:
   * Returns { matched: false, error: "..." }
   */
  const checkPincodeLocationMatch = useCallback(
    (pincodeData) => {
      if (!pincodeData || !pincodeData.valid) {
        return { matched: false, error: pincodeData?.error || "Invalid pincode." };
      }

      // If user's live location is known, enforce strict state match
      if (liveLocation?.state) {
        const liveNorm = normalizeState(liveLocation.state);
        const pinNorm = normalizeState(pincodeData.state);

        if (liveNorm && pinNorm && liveNorm !== pinNorm) {
          return {
            matched: false,
            error: `Location Mismatch: Your live location is detected in ${
              liveLocation.city || liveLocation.district
            } (${liveLocation.state}), but pincode ${
              pincodeData.pincode
            } belongs to ${pincodeData.state}. You can only enter pincodes for your current area (${liveLocation.state}).`,
          };
        }
      }

      return {
        matched: true,
        message: liveLocation?.state
          ? `Verified: Pincode matches your current region (${liveLocation.state}).`
          : "Pincode verified.",
      };
    },
    [liveLocation]
  );

  return (
    <LocationContext.Provider
      value={{
        liveLocation,
        isLocating,
        locationError,
        permissionStatus,
        requestLiveLocation,
        dismissPrompt,
        clearLiveLocation,
        checkPincodeLocationMatch,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}

/** Safe version — returns null when used outside a LocationProvider (e.g. admin area) */
export function useLocationSafe() {
  return useContext(LocationContext); // returns null if no provider
}
