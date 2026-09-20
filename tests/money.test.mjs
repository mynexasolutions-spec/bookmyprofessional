import { test } from "node:test";
import assert from "node:assert/strict";
import { CURRENCY, formatMoney } from "../src/lib/money.js";

test("formatMoney renders zero with default 2 decimals", () => {
  assert.equal(formatMoney(0), `${CURRENCY}0.00`);
});

test("formatMoney honours the decimals argument", () => {
  assert.equal(formatMoney(5, 0), `${CURRENCY}5`);
  assert.equal(formatMoney(5, 2), `${CURRENCY}5.00`);
});

test("formatMoney falls back to 0 for non-numeric input", () => {
  assert.equal(formatMoney("not-a-number"), `${CURRENCY}0.00`);
  assert.equal(formatMoney(undefined), `${CURRENCY}0.00`);
  assert.equal(formatMoney(NaN), `${CURRENCY}0.00`);
});

test("formatMoney uses the exported CURRENCY symbol", () => {
  assert.ok(formatMoney(1).startsWith(CURRENCY));
});
