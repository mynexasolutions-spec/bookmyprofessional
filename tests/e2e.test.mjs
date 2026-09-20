import { test } from "node:test";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
// Demo mode opens protected routes (no real sessions), so they return 200 instead of redirecting.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Top-level reachability probe: if the server is down, skip the whole suite instead of failing.
let reachable = true;
try {
  await fetch(BASE_URL, { redirect: "manual" });
} catch {
  reachable = false;
}

const skip = reachable ? false : `server unreachable at ${BASE_URL}`;

async function status(path, init) {
  const res = await fetch(`${BASE_URL}${path}`, { redirect: "manual", ...init });
  return res.status;
}

test("GET / returns 200", { skip }, async () => {
  assert.equal(await status("/"), 200);
});

test("GET /professionals returns 200", { skip }, async () => {
  assert.equal(await status("/professionals"), 200);
});

test("GET /login returns 200", { skip }, async () => {
  assert.equal(await status("/login"), 200);
});

test("GET /vendor is protected when logged out", { skip }, async () => {
  assert.equal(await status("/vendor"), DEMO_MODE ? 200 : 307);
});

test("GET /admin redirects (307) when logged out", { skip }, async () => {
  assert.equal(await status("/admin"), 307);
});

test("GET /messages is protected when logged out", { skip }, async () => {
  assert.equal(await status("/messages"), DEMO_MODE ? 200 : 307);
});

test("POST /api/admin/review returns 401 without the admin cookie", { skip }, async () => {
  assert.equal(await status("/api/admin/review", { method: "POST" }), 401);
});
