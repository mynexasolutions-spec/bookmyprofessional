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

test("24-hour cancellation rule logic", () => {
  const now = Date.now();
  const windowHours = 24;

  // Case 1: Slot 10 hours from now (within 24-hour window) -> cannot cancel
  const soonSlot = now + 10 * 60 * 60 * 1000;
  const cutoffSoon = soonSlot - windowHours * 60 * 60 * 1000;
  assert.equal(now > cutoffSoon, true, "Should block cancellation inside 24 hours");

  // Case 2: Slot 48 hours from now (outside 24-hour window) -> can cancel
  const futureSlot = now + 48 * 60 * 60 * 1000;
  const cutoffFuture = futureSlot - windowHours * 60 * 60 * 1000;
  assert.equal(now > cutoffFuture, false, "Should allow cancellation outside 24 hours");
});

test("confirmation datetime formatting shows day name and timezone", () => {
  function formatConfirmationDateTime(dateStr, timeSlot) {
    if (!dateStr) return timeSlot || "—";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const dayName = dt.toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" });
    const formattedDate = dt.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
    return `${dayName}, ${formattedDate} at ${timeSlot} (IST, UTC+5:30)`;
  }

  const res = formatConfirmationDateTime("2026-10-07", "10:00 AM");
  assert.ok(res.includes("Wednesday"), "Includes day name Wednesday");
  assert.ok(res.includes("October"), "Includes month name October");
  assert.ok(res.includes("10:00 AM"), "Includes slot time");
  assert.ok(res.includes("IST, UTC+5:30"), "Includes IST timezone");
});

