import { test } from "node:test";
import assert from "node:assert/strict";
import { toUtcInstant } from "../src/lib/datetime.js";

test("Asia/Kolkata (+05:30) is converted to UTC", () => {
  assert.equal(toUtcInstant("2026-01-15", "10:00 AM", "Asia/Kolkata"), "2026-01-15T04:30:00.000Z");
});

test("UTC timezone is a no-op", () => {
  assert.equal(toUtcInstant("2026-01-15", "10:00 AM", "UTC"), "2026-01-15T10:00:00.000Z");
});

test("US timezone tracks the DST boundary", () => {
  // January -> EST (UTC-5); July -> EDT (UTC-4).
  assert.equal(toUtcInstant("2026-01-15", "10:00 AM", "America/New_York"), "2026-01-15T15:00:00.000Z");
  assert.equal(toUtcInstant("2026-07-15", "10:00 AM", "America/New_York"), "2026-07-15T14:00:00.000Z");
});

test("invalid timezone does not throw and treats wall time as UTC", () => {
  assert.equal(toUtcInstant("2026-01-15", "10:00 AM", "Not/AZone"), "2026-01-15T10:00:00.000Z");
});

test("missing date or slot returns null", () => {
  assert.equal(toUtcInstant("", "10:00 AM", "UTC"), null);
  assert.equal(toUtcInstant("2026-01-15", "", "UTC"), null);
});
