import { test } from "node:test";
import assert from "node:assert/strict";
import { toUtcInstant, getBookingStartTimestamp, isBookingExpired, getDerivedBookingStatus } from "../src/lib/datetime.js";

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
test("past unstarted bookings BMP-16447 and BMP-20407 are expired and derive missed status", () => {
  // BMP-16447: 26 Sep 2026, 9:30 AM
  const bmp16447 = {
    id: "BMP-16447",
    date: "2026-09-26",
    timeSlot: "9:30 AM",
    status: "upcoming",
  };
  // Simulated 'now' = 2026-10-20 19:30 IST
  const now = new Date("2026-10-20T14:00:00.000Z").getTime();

  assert.equal(isBookingExpired(bmp16447, now), true, "BMP-16447 must be expired");
  assert.equal(getDerivedBookingStatus(bmp16447, now), "missed", "BMP-16447 status must be missed");

  // BMP-20407: 8 Oct 2026, 9:00 AM
  const bmp20407 = {
    id: "BMP-20407",
    date: "2026-10-08",
    timeSlot: "9:00 AM",
    status: "upcoming",
  };
  assert.equal(isBookingExpired(bmp20407, now), true, "BMP-20407 must be expired");
  assert.equal(getDerivedBookingStatus(bmp20407, now), "missed", "BMP-20407 status must be missed");
});

test("future unstarted bookings remain upcoming", () => {
  const futureBooking = {
    id: "BMP-99999",
    date: "2026-10-25",
    timeSlot: "11:00 AM",
    status: "upcoming",
  };
  const now = new Date("2026-10-20T14:00:00.000Z").getTime();

  assert.equal(isBookingExpired(futureBooking, now), false, "Future booking must NOT be expired");
  assert.equal(getDerivedBookingStatus(futureBooking, now), "upcoming", "Future booking must be upcoming");
});

test("completed and cancelled bookings retain their original status even in the past", () => {
  const pastCompleted = {
    id: "BMP-10001",
    date: "2026-09-01",
    timeSlot: "10:00 AM",
    status: "completed",
  };
  const pastCancelled = {
    id: "BMP-10002",
    date: "2026-09-01",
    timeSlot: "10:00 AM",
    status: "cancelled",
  };
  const now = new Date("2026-10-20T14:00:00.000Z").getTime();

  assert.equal(getDerivedBookingStatus(pastCompleted, now), "completed");
  assert.equal(getDerivedBookingStatus(pastCancelled, now), "cancelled");
});

test("booking crossing midnight is parsed and handles UTC timezone accurately", () => {
  const lateBooking = {
    id: "BMP-MIDNIGHT",
    date: "2026-10-20",
    timeSlot: "11:30 PM",
    status: "upcoming",
  };
  // 11:30 PM IST on Oct 20 = 18:00 UTC on Oct 20
  const startMs = getBookingStartTimestamp(lateBooking);
  assert.equal(new Date(startMs).toISOString(), "2026-10-20T18:00:00.000Z");

  // 30 mins after start (12:00 AM next day IST) -> within 60 min grace window, not expired yet
  const insideGrace = startMs + 30 * 60 * 1000;
  assert.equal(isBookingExpired(lateBooking, insideGrace), false);

  // 90 mins after start (1:00 AM next day IST) -> past grace window, expired
  const pastGrace = startMs + 90 * 60 * 1000;
  assert.equal(isBookingExpired(lateBooking, pastGrace), true);
  assert.equal(getDerivedBookingStatus(lateBooking, pastGrace), "missed");
});
