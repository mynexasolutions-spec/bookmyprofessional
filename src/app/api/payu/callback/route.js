import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPaymentHash, getPayuConfig } from '@/lib/payu';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(req) {
  const { key, salt } = getPayuConfig();
  const failure = new URL('/?payment=failure', req.url);

  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData);
    const { txnid, status, hash, amount, productinfo, firstname, email, mihpayid, additionalCharges } = data;

    const valid = verifyPaymentHash({
      salt, status, email, firstname, productinfo, amount, txnid, key, hash, additionalCharges,
    });

    if (!valid) {
      console.error('[PayU Callback] Hash mismatch for txnid:', txnid);
      return NextResponse.redirect(new URL('/?payment=error', req.url), { status: 303 });
    }

    const supabase = supabaseAdmin();

    if (status === 'success') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'upcoming' })
        .eq('id', txnid);
      await supabase
        .from('payments')
        .update({ status: 'held', provider: 'payu', provider_ref: mihpayid || null })
        .eq('booking_id', txnid);
      return NextResponse.redirect(new URL(`/dashboard?payment=success&bookingId=${txnid}`, req.url), { status: 303 });
    }

    await supabase
      .from('bookings')
      .update({ payment_status: 'failed', status: 'cancelled' })
      .eq('id', txnid);
    await supabase
      .from('payments')
      .update({ status: 'failed' })
      .eq('booking_id', txnid);
    return NextResponse.redirect(failure, { status: 303 });
  } catch (error) {
    console.error('Error handling PayU callback:', error);
    return NextResponse.redirect(new URL('/?payment=error', req.url), { status: 303 });
  }
}
