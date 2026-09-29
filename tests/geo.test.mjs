import { test } from "node:test";
import assert from "node:assert/strict";
import { distanceKm, byDistanceFrom } from "../src/lib/geo.js";

const MUMBAI = { latitude: 19.076, longitude: 72.8777 };
const PUNE = { latitude: 18.5204, longitude: 73.8567 };
const DELHI = { latitude: 28.6139, longitude: 77.209 };

test("computes great-circle distance in km", () => {
  assert.ok(Math.abs(distanceKm(MUMBAI, PUNE) - 120) < 20);
  assert.ok(Math.abs(distanceKm(MUMBAI, DELHI) - 1150) < 50);
  assert.equal(distanceKm(MUMBAI, MUMBAI), 0);
});

test("returns null when coordinates are missing", () => {
  assert.equal(distanceKm(MUMBAI, { latitude: null, longitude: 1 }), null);
  assert.equal(distanceKm(null, MUMBAI), null);
});

test("sorts nearest first and pushes coordinate-less entries last", () => {
  const pros = [
    { id: "far", latitude: DELHI.latitude, longitude: DELHI.longitude },
    { id: "near", latitude: PUNE.latitude, longitude: PUNE.longitude },
    { id: "none" },
    { id: "home", latitude: MUMBAI.latitude, longitude: MUMBAI.longitude },
  ];
  assert.deepEqual(
    pros.slice().sort(byDistanceFrom(MUMBAI)).map((p) => p.id),
    ["home", "near", "far", "none"]
  );
});
