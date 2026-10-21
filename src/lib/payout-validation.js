/**
 * Payout Details Validation & Formatting Helpers
 * Supports Bank Account (NEFT / IMPS) and UPI ID validation in accordance with Indian banking standards.
 */

export const KNOWN_IFSC_BANKS = {
  SBIN: "State Bank of India",
  HDFC: "HDFC Bank",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  PUNB: "Punjab National Bank",
  BARB: "Bank of Baroda",
  CNRB: "Canara Bank",
  UBIN: "Union Bank of India",
  IDFB: "IDFC First Bank",
  YESB: "Yes Bank",
  INDB: "IndusInd Bank",
  FDRL: "Federal Bank",
  IOBA: "Indian Overseas Bank",
  IDIB: "Indian Bank",
  MAHB: "Bank of Maharashtra",
  PSIB: "Punjab & Sind Bank",
  CBIN: "Central Bank of India",
  UCOB: "UCO Bank",
  BKID: "Bank of India",
  PAYT: "Paytm Payments Bank",
  AIRP: "Airtel Payments Bank",
  IPOS: "India Post Payments Bank",
  JAKA: "Jammu & Kashmir Bank",
  KARB: "Karnataka Bank",
  KVBL: "Karur Vysya Bank",
  SIBL: "South Indian Bank",
  CSBK: "CSB Bank",
  RBLN: "RBL Bank",
};

/**
 * Detect bank name from the first 4 characters of an IFSC code.
 */
export function getBankNameFromIFSC(ifsc) {
  if (!ifsc || typeof ifsc !== "string") return "";
  const prefix = ifsc.trim().toUpperCase().slice(0, 4);
  return KNOWN_IFSC_BANKS[prefix] || "";
}

/**
 * Validates an Indian IFSC Code (11 characters: 4 letters, '0', 6 alphanumeric).
 */
export function isValidIFSC(ifsc) {
  if (!ifsc || typeof ifsc !== "string") return false;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase());
}

/**
 * Validates an Indian Bank Account Number (typically 9 to 18 numeric digits).
 */
export function isValidAccountNumber(accountNumber) {
  if (!accountNumber) return false;
  const clean = String(accountNumber).trim();
  return /^\d{9,18}$/.test(clean);
}

/**
 * Validates an Indian UPI ID / Virtual Payment Address (VPA).
 * Format: username@bankhandle (e.g. name@okhdfcbank, 9876543210@paytm)
 */
export function isValidUPI(upiId) {
  if (!upiId || typeof upiId !== "string") return false;
  const clean = upiId.trim();
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(clean);
}

/**
 * Masks account number for secure UI display: '•••• •••• 1234'
 */
export function maskAccountNumber(accountNumber) {
  if (!accountNumber) return "";
  const clean = String(accountNumber).trim();
  if (clean.length < 4) return clean;
  const last4 = clean.slice(-4);
  return `•••• •••• ${last4}`;
}

/**
 * Validates full payout details payload.
 *
 * @param {Object} details
 * @returns {{ valid: boolean, errors: Record<string, string>, formatted: string }}
 */
export function validatePayoutDetails(details) {
  const errors = {};
  if (!details || typeof details !== "object") {
    return { valid: false, errors: { general: "Payout details are required." }, formatted: "" };
  }

  const type = details.type || (details.upi_id ? "upi" : "bank");

  if (type === "upi") {
    const upiId = String(details.upi_id || "").trim();
    if (!upiId) {
      errors.upi_id = "UPI ID is required.";
    } else if (!isValidUPI(upiId)) {
      errors.upi_id = "Invalid UPI ID format (e.g. username@bank).";
    }

    const holder = String(details.account_holder || "").trim();
    if (holder && holder.length < 2) {
      errors.account_holder = "Name must be at least 2 characters.";
    }

    const valid = Object.keys(errors).length === 0;
    return {
      valid,
      errors,
      formatted: valid ? `UPI: ${upiId}${holder ? ` (${holder})` : ""}` : "",
    };
  }

  // Otherwise assume bank transfer
  const holder = String(details.account_holder || "").trim();
  const accNum = String(details.account_number || "").trim();
  const ifsc = String(details.ifsc_code || "").trim().toUpperCase();
  const bankName = String(details.bank_name || getBankNameFromIFSC(ifsc) || "").trim();

  if (!holder || holder.length < 2) {
    errors.account_holder = "Account holder name is required (at least 2 characters).";
  } else if (!/^[a-zA-Z\s.'-]{2,100}$/.test(holder)) {
    errors.account_holder = "Account holder name contains invalid characters.";
  }

  if (!accNum) {
    errors.account_number = "Bank account number is required.";
  } else if (!isValidAccountNumber(accNum)) {
    errors.account_number = "Account number must be between 9 and 18 digits.";
  }

  if (!ifsc) {
    errors.ifsc_code = "IFSC code is required.";
  } else if (!isValidIFSC(ifsc)) {
    errors.ifsc_code = "Invalid IFSC code (e.g. HDFC0001234, SBIN0000456).";
  }

  const valid = Object.keys(errors).length === 0;
  const last4 = accNum.slice(-4);
  const formattedBank = bankName ? `${bankName} ` : "";
  const formatted = valid
    ? `Bank Transfer: ${formattedBank}A/C ending in ${last4} (IFSC: ${ifsc}, Holder: ${holder})`
    : "";

  return {
    valid,
    errors,
    formatted,
  };
}

/**
 * Checks whether payout details are present and pass validation.
 */
export function hasValidPayoutDetails(details) {
  if (!details || typeof details !== "object") return false;
  return validatePayoutDetails(details).valid;
}

/**
 * Generates human-readable string for payout destination.
 */
export function formatPayoutMethod(details) {
  if (!details) return "Bank Transfer";
  if (typeof details === "string") return details;
  const { formatted } = validatePayoutDetails(details);
  return formatted || "Bank Transfer";
}
