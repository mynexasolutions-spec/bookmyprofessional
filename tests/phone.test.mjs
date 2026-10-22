import test from "node:test";
import assert from "node:assert/strict";
import { cleanPhone, isValidIndianPhone, formatPhoneDisplay } from "../src/lib/phone.js";

test("cleanPhone handles null, undefined and empty strings", () => {
  assert.equal(cleanPhone(null), "");
  assert.equal(cleanPhone(undefined), "");
  assert.equal(cleanPhone(""), "");
});

test("cleanPhone strips non-digit characters", () => {
  assert.equal(cleanPhone("+91 96999 42331"), "9699942331");
  assert.equal(cleanPhone("96999-42331"), "9699942331");
  assert.equal(cleanPhone("(969) 994-2331"), "9699942331");
});

test("cleanPhone strips 91 country code and 0 prefix", () => {
  assert.equal(cleanPhone("919699942331"), "9699942331");
  assert.equal(cleanPhone("09699942331"), "9699942331");
});

test("isValidIndianPhone accepts valid 10-digit mobile numbers starting with 6, 7, 8, 9", () => {
  assert.equal(isValidIndianPhone("9699942331"), true);
  assert.equal(isValidIndianPhone("8888888888"), true);
  assert.equal(isValidIndianPhone("7000000000"), true);
  assert.equal(isValidIndianPhone("6123456789"), true);
  assert.equal(isValidIndianPhone("+91 96999 42331"), true);
  assert.equal(isValidIndianPhone("919699942331"), true);
  assert.equal(isValidIndianPhone("09699942331"), true);
});

test("isValidIndianPhone REJECTS 9-digit numbers (user bug scenario)", () => {
  // Scenario: User typed 9699942331, removed the 1 -> 969994233 (9 digits)
  assert.equal(isValidIndianPhone("969994233"), false);
  assert.equal(isValidIndianPhone("987654321"), false);
});

test("isValidIndianPhone REJECTS numbers starting with 0-5 or invalid lengths", () => {
  assert.equal(isValidIndianPhone("5999942331"), false);
  assert.equal(isValidIndianPhone("1234567890"), false);
  assert.equal(isValidIndianPhone("0000000000"), false);
  assert.equal(isValidIndianPhone("96999423311"), false); // 11 digits
  assert.equal(isValidIndianPhone(""), false);
  assert.equal(isValidIndianPhone(null), false);
});

test("formatPhoneDisplay formats 10-digit Indian numbers cleanly", () => {
  assert.equal(formatPhoneDisplay("9699942331"), "+91 96999 42331");
  assert.equal(formatPhoneDisplay("+91 96999 42331"), "+91 96999 42331");
  assert.equal(formatPhoneDisplay("969994233"), "969994233"); // Preserves incomplete as-is
});
