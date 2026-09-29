import { test } from "node:test";
import assert from "node:assert/strict";
import { easeInOutCubic, parseStatValue, placeValues } from "../src/lib/count-up.js";

test("parseStatValue preserves formatting while counting", () => {
  assert.equal(parseStatValue("10,000+").format(10000), "10,000+");
  assert.equal(parseStatValue("10,000+").format(2500), "2,500+");
  assert.equal(parseStatValue("50,000+").format(0), "0+");
  assert.equal(parseStatValue("100+").format(50), "50+");
  assert.equal(parseStatValue("4.8/5").format(4.8), "4.8/5");
  assert.equal(parseStatValue("4.8/5").format(0), "0.0/5");
  assert.equal(parseStatValue("98.4%").format(98.4), "98.4%");
  assert.equal(parseStatValue("45 mins").format(45), "45 mins");
});

test("parseStatValue returns null for values without digits", () => {
  assert.equal(parseStatValue("no digits"), null);
  assert.equal(parseStatValue(undefined), null);
  assert.equal(parseStatValue(""), null);
});

test("easeInOutCubic starts at 0 and ends at 1", () => {
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  assert.ok(easeInOutCubic(0.5) > 0.4 && easeInOutCubic(0.5) < 0.6);
});

test("placeValues fills the ones place first, then the tens, then up", () => {
  const seq = placeValues(10000);
  assert.deepEqual(seq.slice(0, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  for (const v of [20, 90, 100, 900, 1000, 9000]) assert.ok(seq.includes(v), `missing ${v}`);
  assert.equal(seq.at(-1), 10000);
  for (let i = 1; i < seq.length; i++) assert.ok(seq[i] > seq[i - 1]);
});

test("placeValues handles partial top places and non-round targets", () => {
  const fiftyK = placeValues(50000);
  assert.equal(fiftyK.at(-1), 50000);
  assert.ok(fiftyK.includes(40000));
  assert.ok(!fiftyK.includes(90000));
  assert.equal(placeValues(1234).at(-1), 1234);
  assert.ok(placeValues(1234).includes(1000));
  assert.equal(placeValues(100).at(-1), 100);
});

test("placeValues returns nothing for decimals and non-positive numbers", () => {
  assert.deepEqual(placeValues(4.8), []);
  assert.deepEqual(placeValues(0), []);
  assert.deepEqual(placeValues(-5), []);
});
