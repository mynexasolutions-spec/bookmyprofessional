/**
 * Utilities for validating and formatting Indian mobile phone numbers.
 */

/**
 * Strips formatting, leading zeros, and optional +91/91 country prefix.
 * Returns the underlying digits (target: 10 digits).
 *
 * @param {string|number} phone
 * @returns {string} Clean digit string
 */
export function cleanPhone(phone) {
  if (phone === null || phone === undefined) return "";
  let digits = String(phone).replace(/\D/g, "");

  // If 12 digits starting with 91, strip country code
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // If 11 digits starting with 0, strip leading 0
  else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  return digits;
}

/**
 * Validates whether a phone number is a valid 10-digit Indian mobile number.
 * Indian mobile numbers:
 * - Exactly 10 digits
 * - Must start with 6, 7, 8, or 9 (TRAI National Numbering Plan)
 *
 * @param {string|number} phone
 * @returns {boolean}
 */
export function isValidIndianPhone(phone) {
  const digits = cleanPhone(phone);
  return /^[6-9]\d{9}$/.test(digits);
}

/**
 * Formats a 10-digit number for clean UI display (e.g. +91 96999 42331).
 *
 * @param {string|number} phone
 * @returns {string}
 */
export function formatPhoneDisplay(phone) {
  const digits = cleanPhone(phone);
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return String(phone || "");
}
