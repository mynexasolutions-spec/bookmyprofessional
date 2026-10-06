// Indian PIN codes are geographic: the more leading digits two PINs share, the closer
// the areas (same sorting district > same postal circle > same region).
export function sharedPincodeDigits(a, b) {
  const x = String(a || "").trim();
  const y = String(b || "").trim();
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i += 1;
  return i;
}

// Stable comparator: professionals whose PIN is closest to `target` come first.
export function byPincodeProximity(target) {
  return (a, b) =>
    sharedPincodeDigits(b.pincode, target) - sharedPincodeDigits(a.pincode, target);
}

// Sanitizes input to digits only, max 6 characters
export function cleanPincode(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

// Format check: Exactly 6 digits, first digit between 1 and 9
export function isValidPincodeFormat(pincode) {
  const clean = cleanPincode(pincode);
  return /^[1-9][0-9]{5}$/.test(clean);
}

// Client-side in-memory cache for fast lookups
const CLIENT_PINCODE_CACHE = new Map();

/**
 * Strictly verifies a 6-digit Indian Pincode.
 * Resolves to { valid: true, pincode, district, state, city, area, formattedLocation }
 * or { valid: false, error: string }
 */
export async function verifyPincode(rawPincode) {
  const pincode = cleanPincode(rawPincode);

  if (!isValidPincodeFormat(pincode)) {
    return {
      valid: false,
      error: "Please enter a valid 6-digit Indian pincode (cannot start with 0).",
      pincode,
    };
  }

  if (CLIENT_PINCODE_CACHE.has(pincode)) {
    return CLIENT_PINCODE_CACHE.get(pincode);
  }

  if (typeof window !== "undefined") {
    try {
      // Try the application's internal API route first in browser
      const res = await fetch(`/api/location/verify-pincode?pincode=${pincode}`);
      const data = await res.json();

      if (res.ok && data?.valid) {
        CLIENT_PINCODE_CACHE.set(pincode, data);
        return data;
      }

      if (data?.error) {
        const errRes = { valid: false, error: data.error, pincode };
        CLIENT_PINCODE_CACHE.set(pincode, errRes);
        return errRes;
      }
    } catch (apiErr) {
      console.warn("[Pincode] Internal API unreachable, trying direct postal lookup:", apiErr);
    }
  }

  // Direct fallback to Postal API if internal API fails
  try {
    const directRes = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const json = await directRes.json();
    const result = Array.isArray(json) ? json[0] : json;

    if (result && result.Status === "Success" && Array.isArray(result.PostOffice) && result.PostOffice.length > 0) {
      const firstPo = result.PostOffice[0];
      const isHyderabad = result.PostOffice.some(po => 
        (po.Region && /hyderabad/i.test(po.Region)) ||
        (po.Division && /hyderabad/i.test(po.Division))
      );
      const detectedCity = isHyderabad ? "Hyderabad" : (firstPo.District || firstPo.Block || "");
      const allOffices = result.PostOffice.map((po) => po.Name).filter(Boolean);

      const verified = {
        valid: true,
        pincode,
        district: firstPo.District || "",
        state: firstPo.State || "",
        city: detectedCity,
        area: firstPo.Name || "",
        postOffices: allOffices,
        formattedLocation: `${detectedCity}, ${firstPo.State}`,
      };
      CLIENT_PINCODE_CACHE.set(pincode, verified);
      return verified;
    }

    const failed = {
      valid: false,
      error: `Invalid Pincode: No postal area found in India for ${pincode}.`,
      pincode,
    };
    CLIENT_PINCODE_CACHE.set(pincode, failed);
    return failed;
  } catch (err) {
    console.error("[Pincode] Verification error:", err);
    return {
      valid: false,
      error: "Network error verifying pincode. Please check your internet connection.",
      pincode,
    };
  }
}
