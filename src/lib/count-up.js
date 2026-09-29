export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Place-by-place counter, odometer style: the ones place fills 1..9, then the
// tens 10..90, then the hundreds, ... until the admin-configured target.
export function placeValues(target) {
  if (!Number.isInteger(target) || target <= 0) return [];

  const seq = [];
  for (let p = 1; p <= target; p *= 10) {
    const maxDigit = p * 10 > target ? Math.floor(target / p) : 9;
    for (let d = 1; d <= maxDigit; d++) {
      const v = d * p;
      if (v !== seq[seq.length - 1]) seq.push(v);
    }
  }
  if (seq[seq.length - 1] !== target) seq.push(target);
  return seq;
}

// Splits a marketing stat like "10,000+" into a target number plus a formatter
// that preserves the original prefix, comma grouping, decimals and suffix.
export function parseStatValue(value) {
  const str = String(value ?? "");
  const match = str.match(/\d[\d,]*(?:\.\d+)?/);
  if (!match) return null;

  const raw = match[0];
  const target = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;

  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  const withCommas = raw.includes(",");
  const prefix = str.slice(0, match.index);
  const suffix = str.slice(match.index + raw.length);

  const format = (n) =>
    prefix +
    (withCommas
      ? n.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      : n.toFixed(decimals)) +
    suffix;

  return { target, format };
}
