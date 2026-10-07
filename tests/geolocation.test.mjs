import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm, byDistanceFrom } from "../src/lib/geo.js";

test("distanceKm calculates haversine distance correctly", () => {
  // Mumbai (19.076, 72.8777) to Pune (18.5204, 73.8567) is approx 118-120 km
  const mumbai = { latitude: 19.076, longitude: 72.8777 };
  const pune = { latitude: 18.5204, longitude: 73.8567 };
  const dist = distanceKm(mumbai, pune);
  assert.ok(dist >= 115 && dist <= 125, `Expected ~120km, got ${dist}`);

  // Same coordinates have 0 distance
  assert.equal(distanceKm(mumbai, mumbai), 0);

  // Missing coordinates return null
  assert.equal(distanceKm(mumbai, { latitude: null, longitude: null }), null);
  assert.equal(distanceKm(null, pune), null);
});

test("byDistanceFrom sorts professionals nearest first using real coordinates", () => {
  const userLocation = { latitude: 19.076, longitude: 72.8777 }; // Mumbai

  const proNear = { id: "pro-bandra", name: "Dr. Near", latitude: 19.0596, longitude: 72.8295 }; // Bandra, Mumbai (~5-6 km)
  const proMid = { id: "pro-thane", name: "Dr. Mid", latitude: 19.2183, longitude: 72.9781 }; // Thane (~18 km)
  const proFar = { id: "pro-pune", name: "Dr. Far", latitude: 18.5204, longitude: 73.8567 }; // Pune (~120 km)
  const proNoCoords = { id: "pro-none", name: "Dr. NoCoords", latitude: null, longitude: null };

  const pros = [proFar, proNoCoords, proMid, proNear];
  const sorted = pros.slice().sort(byDistanceFrom(userLocation));

  // Confirm order is nearest first: Bandra -> Thane -> Pune -> NoCoords
  assert.deepEqual(
    sorted.map((p) => p.id),
    ["pro-bandra", "pro-thane", "pro-pune", "pro-none"]
  );
  assert.equal(sorted[0].id, "pro-bandra");
  assert.equal(sorted[1].id, "pro-thane");
  assert.equal(sorted[2].id, "pro-pune");
  assert.equal(sorted[3].id, "pro-none");
});

test("two nearby pros with real coordinates are correctly differentiated", () => {
  // User at Banjara Hills, Hyderabad (17.4156, 78.4357)
  const userCoords = { latitude: 17.4156, longitude: 78.4357 };

  // Pro A at Jubilee Hills (~2.5 km away)
  const proA = { id: "pro-jubilee", name: "Pro Jubilee", latitude: 17.4319, longitude: 78.4074 };
  // Pro B at Hitec City (~7.5 km away)
  const proB = { id: "pro-hitec", name: "Pro Hitec", latitude: 17.4474, longitude: 78.3762 };

  const pros = [proB, proA];
  const sorted = pros.slice().sort(byDistanceFrom(userCoords));

  assert.equal(sorted[0].id, "pro-jubilee");
  assert.equal(sorted[1].id, "pro-hitec");
});

test("missing or invalid pincode does not invent one", () => {
  const sanitizePincode = (raw) => {
    const clean = (raw || "").replace(/\s/g, "");
    return /^[1-9]\d{5}$/.test(clean) ? clean : "";
  };

  assert.equal(sanitizePincode("500034"), "500034");
  assert.equal(sanitizePincode("500 034"), "500034");
  assert.equal(sanitizePincode("050034"), ""); // Invalid: starts with 0
  assert.equal(sanitizePincode("50003"), ""); // Invalid: 5 digits
  assert.equal(sanitizePincode("abc123"), ""); // Invalid: letters
  assert.equal(sanitizePincode(null), "");
  assert.equal(sanitizePincode(undefined), "");
});
