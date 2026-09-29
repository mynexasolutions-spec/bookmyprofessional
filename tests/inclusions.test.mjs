import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInclusions, formatInclusions } from "../src/lib/inclusions.js";

test("parseInclusions trims, drops blanks and de-duplicates", () => {
  assert.deepEqual(parseInclusions("Visit & diagnosis\n\n  Spare parts at actuals  \nVisit & diagnosis"), [
    "Visit & diagnosis",
    "Spare parts at actuals",
  ]);
});

test("parseInclusions round-trips arrays from the database", () => {
  const list = ["30 min consultation", "Written prescription"];
  assert.deepEqual(parseInclusions(formatInclusions(list)), list);
});

test("parseInclusions handles empty, null and non-array input", () => {
  assert.deepEqual(parseInclusions(""), []);
  assert.deepEqual(parseInclusions(null), []);
  assert.deepEqual(parseInclusions(undefined), []);
  assert.deepEqual(parseInclusions(42), ["42"]);
});

test("parseInclusions caps the list at 30 items", () => {
  const many = Array.from({ length: 50 }, (_, i) => `item ${i}`).join("\n");
  assert.equal(parseInclusions(many).length, 30);
});
