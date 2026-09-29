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
