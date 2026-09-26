import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { generatePaymentHash, verifyPaymentHash, generateRefundHash, toPayuAmount } from "../src/lib/payu.js";

const sha512 = (s) => crypto.createHash("sha512").update(s).digest("hex");

test("request hash matches PayU spec (key|txnid|amount|productinfo|firstname|email + 11 pipes + salt)", () => {
  const params = {
    key: "KEY", txnid: "BMP-12345", amount: "499.00",
    productinfo: "Consultation", firstname: "Soyab", email: "a@b.com", salt: "SALT",
  };
  // canonical sequence, no UDF fields
  const expected = sha512(`KEY|BMP-12345|499.00|Consultation|Soyab|a@b.com|||||||||||SALT`);
  assert.equal(generatePaymentHash(params), expected);
});

test("reverse hash verifies a correct PayU response", () => {
  const response = {
    key: "KEY", salt: "SALT", status: "success", txnid: "BMP-12345",
    amount: "499.00", productinfo: "Consultation", firstname: "Soyab", email: "a@b.com",
  };
  const hash = sha512(`SALT|success|||||||||||a@b.com|Soyab|Consultation|499.00|BMP-12345|KEY`);
  assert.equal(verifyPaymentHash({ ...response, hash }), true);
});

test("reverse hash rejects a tampered amount", () => {
  const response = {
    key: "KEY", salt: "SALT", status: "success", txnid: "BMP-12345",
    amount: "499.00", productinfo: "Consultation", firstname: "Soyab", email: "a@b.com",
  };
  const honestHash = sha512(`SALT|success|||||||||||a@b.com|Soyab|Consultation|499.00|BMP-12345|KEY`);
  assert.equal(verifyPaymentHash({ ...response, hash: honestHash, amount: "1.00" }), false);
});

test("refund hash matches sha512(key|command|var1|salt)", () => {
  const expected = sha512("KEY|cancel_refund_transaction|403993715527059978|SALT");
  assert.equal(
    generateRefundHash({ key: "KEY", command: "cancel_refund_transaction", var1: "403993715527059978", salt: "SALT" }),
    expected
  );
});

test("toPayuAmount always yields a 2-decimal string", () => {
  assert.equal(toPayuAmount(499), "499.00");
  assert.equal(toPayuAmount("499.5"), "499.50");
  assert.equal(toPayuAmount(0), "0.00");
});
