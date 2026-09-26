import crypto from "crypto";

const sha512 = (s) => crypto.createHash("sha512").update(s).digest("hex");

// PayU request hash (no UDF fields): sha512(key|txnid|amount|productinfo|firstname|email|||||||||||salt)
export function generatePaymentHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
  return sha512(`${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`);
}

// PayU reverse hash (no UDF fields): sha512([additionalCharges|]salt|status|||||||||||email|firstname|productinfo|amount|txnid|key)
export function verifyPaymentHash({ salt, status, email, firstname, productinfo, amount, txnid, key, hash, additionalCharges }) {
  const prefix = additionalCharges ? `${additionalCharges}|` : "";
  const expected = sha512(`${prefix}${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`);
  return expected === hash;
}

// PayU postservice API hash: sha512(key|command|var1|salt)
export function generateRefundHash({ key, command, var1, salt }) {
  return sha512(`${key}|${command}|${var1}|${salt}`);
}

export function getPayuConfig() {
  const key = process.env.PAYU_MERCHANT_KEY;
  const salt = process.env.PAYU_MERCHANT_SALT;
  if (!key || !salt) {
    throw new Error("PayU is not configured: set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT.");
  }
  return {
    key,
    salt,
    paymentUrl: process.env.PAYU_PAYMENT_URL || "https://secure.payu.in/_payment",
    refundUrl: process.env.PAYU_REFUND_URL || "https://info.payu.in/merchant/postservice?form=2",
  };
}

// PayU requires amounts as a 2-decimal string (e.g. "499.00").
export function toPayuAmount(value) {
  return (Number(value) || 0).toFixed(2);
}
