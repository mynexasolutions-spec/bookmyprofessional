import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isValidIFSC,
  isValidAccountNumber,
  isValidUPI,
  getBankNameFromIFSC,
  maskAccountNumber,
  validatePayoutDetails,
  hasValidPayoutDetails,
  formatPayoutMethod,
} from "../src/lib/payout-validation.js";

test("isValidIFSC validates standard RBI IFSC format", () => {
  assert.equal(isValidIFSC("HDFC0001234"), true);
  assert.equal(isValidIFSC("SBIN0000456"), true);
  assert.equal(isValidIFSC("ICIC0000001"), true);
  assert.equal(isValidIFSC("hdfc0001234"), true); // case-insensitive

  // Invalid IFSCs
  assert.equal(isValidIFSC("HDFC1001234"), false); // 5th character must be '0'
  assert.equal(isValidIFSC("HDF0001234"), false); // too short
  assert.equal(isValidIFSC("HDFC00012345"), false); // too long
  assert.equal(isValidIFSC("12340001234"), false); // first 4 must be letters
  assert.equal(isValidIFSC(""), false);
  assert.equal(isValidIFSC(null), false);
});

test("isValidAccountNumber validates Indian bank account numbers", () => {
  assert.equal(isValidAccountNumber("1234567890"), true); // 10 digits
  assert.equal(isValidAccountNumber("12345678901234"), true); // 14 digits
  assert.equal(isValidAccountNumber("123456789"), true); // 9 digits
  assert.equal(isValidAccountNumber("123456789012345678"), true); // 18 digits

  // Invalids
  assert.equal(isValidAccountNumber("12345678"), false); // under 9 digits
  assert.equal(isValidAccountNumber("1234567890123456789"), false); // over 18 digits
  assert.equal(isValidAccountNumber("12345ABC89"), false); // letters
  assert.equal(isValidAccountNumber(""), false);
  assert.equal(isValidAccountNumber(null), false);
});

test("isValidUPI validates standard UPI VPAs", () => {
  assert.equal(isValidUPI("user@okhdfcbank"), true);
  assert.equal(isValidUPI("rahul.sharma@paytm"), true);
  assert.equal(isValidUPI("9876543210@ybl"), true);
  assert.equal(isValidUPI("business-name@sbi"), true);

  // Invalids
  assert.equal(isValidUPI("invalid-upi"), false); // no @
  assert.equal(isValidUPI("a@"), false); // no bank handle
  assert.equal(isValidUPI("@okhdfcbank"), false); // no username
  assert.equal(isValidUPI(""), false);
  assert.equal(isValidUPI(null), false);
});

test("maskAccountNumber masks all but last 4 digits", () => {
  assert.equal(maskAccountNumber("123456789012"), "•••• •••• 9012");
  assert.equal(maskAccountNumber("50100234567890"), "•••• •••• 7890");
  assert.equal(maskAccountNumber(""), "");
  assert.equal(maskAccountNumber(null), "");
});

test("getBankNameFromIFSC detects known Indian banks", () => {
  assert.equal(getBankNameFromIFSC("SBIN0000456"), "State Bank of India");
  assert.equal(getBankNameFromIFSC("HDFC0001234"), "HDFC Bank");
  assert.equal(getBankNameFromIFSC("ICIC0000001"), "ICICI Bank");
  assert.equal(getBankNameFromIFSC("UTIB0000001"), "Axis Bank");
  assert.equal(getBankNameFromIFSC("ZZZZ0000001"), "");
});

test("validatePayoutDetails accurately checks Bank Account details", () => {
  const validBank = {
    type: "bank",
    account_holder: "Aarav Sharma",
    account_number: "50100456789012",
    ifsc_code: "HDFC0001234",
    bank_name: "HDFC Bank",
  };
  const result = validatePayoutDetails(validBank);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.match(result.formatted, /HDFC Bank/);
  assert.match(result.formatted, /9012/);
  assert.equal(hasValidPayoutDetails(validBank), true);

  // Missing details
  const invalidBank = {
    type: "bank",
    account_holder: "",
    account_number: "123",
    ifsc_code: "INVALID",
  };
  const invalidResult = validatePayoutDetails(invalidBank);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.account_holder);
  assert.ok(invalidResult.errors.account_number);
  assert.ok(invalidResult.errors.ifsc_code);
  assert.equal(hasValidPayoutDetails(invalidBank), false);
});

test("validatePayoutDetails accurately checks UPI details", () => {
  const validUpi = {
    type: "upi",
    upi_id: "aarav@oksbi",
    account_holder: "Aarav Sharma",
  };
  const result = validatePayoutDetails(validUpi);
  assert.equal(result.valid, true);
  assert.equal(result.formatted, "UPI: aarav@oksbi (Aarav Sharma)");
  assert.equal(hasValidPayoutDetails(validUpi), true);

  // Invalid UPI
  const invalidUpi = {
    type: "upi",
    upi_id: "not-a-valid-vpa",
  };
  const invalidResult = validatePayoutDetails(invalidUpi);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.upi_id);
  assert.equal(hasValidPayoutDetails(invalidUpi), false);
});

test("formatPayoutMethod fallback logic", () => {
  assert.equal(formatPayoutMethod(null), "Bank Transfer");
  assert.equal(formatPayoutMethod("UPI: user@okaxis"), "UPI: user@okaxis");
});
