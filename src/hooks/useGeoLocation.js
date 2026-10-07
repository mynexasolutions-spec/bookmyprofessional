"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Reverse-geocode a lat/lon pair to a city/pincode.
 * Tries BigDataCloud client API first (CORS-friendly, fast for client browsers),
 * falls back to OpenStreetMap Nominatim.
 * Returns { city, pincode, displayName } or null.
 * Missing pincode is returned as empty string — never invented.
 */
async function reverseGeocode(latitude, longitude) {
  // 1. Try BigDataCloud reverse geocode client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const res = await fetch(bdcUrl, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      const city =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        "";
      const rawPin = (data.postcode || "").replace(/\s/g, "");
      const pincode = /^[1-9]\d{5}$/.test(rawPin) ? rawPin : "";
      const state = data.principalSubdivision || "";
      if (city || pincode) {
        return {
          city: city.trim(),
          pincode,
          state,
          displayName: city.trim() ? (pincode ? `${city.trim()} (${pincode})` : city.trim()) : pincode,
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  // 2. Fallback to OpenStreetMap Nominatim
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: { "Accept-Language": "en" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const addr = data?.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.village ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        "";
      const state = addr.state || "";
      const rawPin = (addr.postcode || "").replace(/\s/g, "");
      const pincode = /^[1-9]\d{5}$/.test(rawPin) ? rawPin : "";
      return {
        city: city.trim(),
        pincode,
        state,
        displayName: city.trim() ? (pincode ? `${city.trim()} (${pincode})` : city.trim()) : pincode,
      };
    }
  } catch {
    // Both failed
  }

  return null;
}

/**
 * useGeoLocation
 *
 * Requests browser location ONLY when locate() is called (never on mount).
 * Returns status, coordinates, reverse-geocoded city and pincode, and error message.
 */
export function useGeoLocation() {
  const [status, setStatus] = useState("idle"); // idle | locating | geocoding | ready | denied | timeout | unsupported | error
  const [coords, setCoords] = useState(null);
  const [geoCity, setGeoCity] = useState("");
  const [geoPincode, setGeoPincode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const locate = useCallback((onSuccess, onError) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      const msg = "Geolocation is not supported by your browser.";
      setErrorMessage(msg);
      if (onError) onError({ code: "UNSUPPORTED", message: msg });
      return;
    }

    setStatus("locating");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const coordinates = { latitude, longitude };
        setCoords(coordinates);
        setStatus("geocoding");

        const geo = await reverseGeocode(latitude, longitude);
        const city = geo?.city || "";
        const pincode = geo?.pincode || "";
        const state = geo?.state || "";
        const display = geo?.displayName || (city || "Current Location");

        setGeoCity(city);
        setGeoPincode(pincode);
        setDisplayName(display);
        setStatus("ready");

        if (onSuccess) {
          onSuccess({
            coords: coordinates,
            city,
            pincode,
            state,
            displayName: display,
          });
        }
      },
      (err) => {
        let msg = "Could not retrieve your location.";
        let errStatus = "error";

        if (err.code === 1) { // PERMISSION_DENIED
          errStatus = "denied";
          msg = "Location permission denied. You can enter your city or pincode manually.";
        } else if (err.code === 3) { // TIMEOUT
          errStatus = "timeout";
          msg = "Location request timed out. Please enter your location manually.";
        } else if (err.code === 2) { // POSITION_UNAVAILABLE
          errStatus = "error";
          msg = "Location unavailable. Please enter your city or pincode manually.";
        }

        setStatus(errStatus);
        setErrorMessage(msg);
        if (onError) onError({ code: errStatus, message: msg });
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  }, []);

  const clear = useCallback(() => {
    setStatus("idle");
    setCoords(null);
    setGeoCity("");
    setGeoPincode("");
    setDisplayName("");
    setErrorMessage("");
  }, []);

  return {
    locate,
    status,
    coords,
    geoCity,
    geoPincode,
    displayName,
    errorMessage,
    clear,
  };
}
