import { test } from "node:test";
import assert from "node:assert/strict";
import { shouldEmail } from "../src/lib/email.js";

test("shouldEmail defaults to on when prefs are missing", () => {
  assert.equal(shouldEmail({}, "bookings"), true);
});

test("shouldEmail honours an explicit opt-out", () => {
  assert.equal(shouldEmail({ bookings: false }, "bookings"), false);
});

test("shouldEmail always sends account mail even when prefs opt out", () => {
  assert.equal(shouldEmail({ bookings: false }, "account"), true);
});

test("shouldEmail defaults to on when prefs is null", () => {
  assert.equal(shouldEmail(null, "reviewReplies"), true);
});

test("shouldEmail honours an announcements opt-out", () => {
  assert.equal(shouldEmail({ announcements: false }, "announcements"), false);
});
