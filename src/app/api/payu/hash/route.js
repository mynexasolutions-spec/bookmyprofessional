import { NextResponse } from 'next/server';
import { generatePaymentHash, getPayuConfig, toPayuAmount } from '@/lib/payu';

export async function POST(req) {
  try {
    const body = await req.json();
    const { txnid, amount, productinfo, firstname, email, phone, surl, furl } = body;

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { key, salt, paymentUrl } = getPayuConfig();
    const amountStr = toPayuAmount(amount);

    const hash = generatePaymentHash({ key, txnid, amount: amountStr, productinfo, firstname, email, salt });

    return NextResponse.json({
      hash,
      key,
      txnid,
      amount: amountStr,
      productinfo,
      firstname,
      email,
      phone,
      surl,
      furl,
      action: paymentUrl,
    });
  } catch (error) {
    console.error('Error generating PayU hash:', error);
    return NextResponse.json({ error: error?.message || 'Failed to generate hash' }, { status: 500 });
  }
}
