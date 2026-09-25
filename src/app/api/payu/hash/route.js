import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const body = await req.json();
    const { txnid, amount, productinfo, firstname, email, phone, surl, furl } = body;

    const key = process.env.PAYU_MERCHANT_KEY || 'IrXi6J';
    const salt = process.env.PAYU_MERCHANT_SALT || 'Y4ISUf9GfSq4ut4RSIYMx8ckBISf41qR';

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // PayU Hash sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    return NextResponse.json({ hash, key, txnid, amount, productinfo, firstname, email, phone, surl, furl });
  } catch (error) {
    console.error('Error generating PayU hash:', error);
    return NextResponse.json({ error: 'Failed to generate hash' }, { status: 500 });
  }
}
