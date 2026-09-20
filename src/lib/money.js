// Single source of truth for money display. Change the symbol here if the currency ever changes.
export const CURRENCY = "₹";

export function formatMoney(amount, decimals = 2) {
  const n = Number(amount);
  return `${CURRENCY}${(Number.isFinite(n) ? n : 0).toFixed(decimals)}`;
}
