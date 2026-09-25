import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Fetch the payment details to get the PayU transaction ID (mihpayid) and amount
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('amount, provider_ref')
      .eq('booking_id', bookingId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const { amount, provider_ref: mihpayid } = payment;

    // Check if provider_ref is a real PayU ID (not a stub)
    if (!mihpayid || mihpayid.startsWith('STUB-')) {
      console.warn(`[PayU Refund] Bypassing real refund for stubbed payment: ${mihpayid}`);
      return NextResponse.json({ status: 1, message: 'Mock refund successful' });
    }

    const key = process.env.PAYU_MERCHANT_KEY || 'IrXi6J';
    const salt = process.env.PAYU_MERCHANT_SALT || 'Y4ISUf9GfSq4ut4RSIYMx8ckBISf41qR';
    const command = 'cancel_refund_transaction';
    
    // For cancel_refund_transaction, var1 is mihpayid, var2 is Token ID (or txnid), var3 is amount.
    // However, the hash is always: key|command|var1|salt
    const hashString = `${key}|${command}|${mihpayid}|${salt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const params = new URLSearchParams();
    params.append('key', key);
    params.append('command', command);
    params.append('hash', hash);
    params.append('var1', mihpayid);
    params.append('var2', bookingId);
    params.append('var3', amount.toString());

    // Use test URL by default unless specifically overriden
    const payuUrl = process.env.PAYU_BASE_URL || 'https://test.payu.in';

    const response = await fetch(`${payuUrl}/merchant/postservice?form=2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const responseData = await response.json();

    if (responseData.status === 1) {
      return NextResponse.json({ status: 1, message: 'Refund initiated successfully', data: responseData });
    } else {
      console.error('[PayU Refund] Refund failed:', responseData);
      // For testing environment, you might want to return success anyway so the UI updates
      return NextResponse.json({ status: 0, message: responseData.msg || 'Refund failed', data: responseData }, { status: 400 });
    }
  } catch (error) {
    console.error('[PayU Refund] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
