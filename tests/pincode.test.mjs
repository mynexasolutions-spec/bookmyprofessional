import { test } from "node:test";
import assert from "node:assert/strict";
import { sharedPincodeDigits, byPincodeProximity } from "../src/lib/pincode.js";

test("counts shared leading digits", () => {
  assert.equal(sharedPincodeDigits("400001", "400058"), 4);
  assert.equal(sharedPincodeDigits("400001", "411001"), 1);
  assert.equal(sharedPincodeDigits("400001", "560001"), 0);
  assert.equal(sharedPincodeDigits("", "400001"), 0);
  assert.equal(sharedPincodeDigits(null, "400001"), 0);
});

test("sorts professionals nearest-first by PIN proximity", () => {
  const pros = [
    { id: "far", pincode: "560001" },
    { id: "near", pincode: "400058" },
    { id: "mid", pincode: "411001" },
    { id: "none", pincode: "" },
  ];
  assert.deepEqual(
    pros.slice().sort(byPincodeProximity("400001")).map((p) => p.id),
    ["near", "mid", "far", "none"]
  );
});

test("pincode format validation: exactly 6 digits, no letters, no 5 digits, no 0 prefix", async () => {
  const { isValidPincodeFormat, cleanPincode } = await import("../src/lib/pincode.js");

  // Rejects 5 digits
  assert.equal(isValidPincodeFormat("50121"), false);
  assert.equal(isValidPincodeFormat("12345"), false);

  // Rejects letters
  assert.equal(isValidPincodeFormat("50121a"), false);
  assert.equal(isValidPincodeFormat("abcdef"), false);
  assert.equal(isValidPincodeFormat("HYD123"), false);

  // Rejects starting with 0
  assert.equal(isValidPincodeFormat("050121"), false);

  // Rejects empty or null
  assert.equal(isValidPincodeFormat(""), false);
  assert.equal(isValidPincodeFormat(null), false);

  // Accepts valid 6-digit PIN codes
  assert.equal(isValidPincodeFormat("501218"), true);
  assert.equal(isValidPincodeFormat("110001"), true);
  assert.equal(isValidPincodeFormat("400001"), true);

  // Clean pincode strips non-digits and caps at 6
  assert.equal(cleanPincode("501-218"), "501218");
  assert.equal(cleanPincode("50121899"), "501218");
  assert.equal(cleanPincode("abc501218"), "501218");
});

test("pincode verification for Hyderabad 501218 returns valid and detected city", async () => {
  const { verifyPincode } = await import("../src/lib/pincode.js");
  const result = await verifyPincode("501218");

  assert.equal(result.valid, true);
  assert.equal(result.pincode, "501218");
  assert.equal(result.state, "Telangana");
  assert.ok(
    result.city.toLowerCase().includes("hyderabad") ||
    result.district.toLowerCase().includes("rangareddy") ||
    result.city.toLowerCase().includes("shamshabad"),
    "City or district should match Hyderabad metro region"
  );
});

test("pincode verification rejects invalid 5-digit and non-existent codes", async () => {
  const { verifyPincode } = await import("../src/lib/pincode.js");

  const fiveDigit = await verifyPincode("50121");
  assert.equal(fiveDigit.valid, false);

  const fakePin = await verifyPincode("999999");
  assert.equal(fakePin.valid, false);
});

