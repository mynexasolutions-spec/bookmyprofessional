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
