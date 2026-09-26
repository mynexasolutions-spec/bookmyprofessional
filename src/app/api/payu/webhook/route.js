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

  try {
    let data;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      data = await req.json();
    }

    const { txnid, status, hash, amount, productinfo, firstname, email, mihpayid, additionalCharges } = data;

    if (!txnid || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const valid = verifyPaymentHash({
      salt, status, email, firstname, productinfo, amount, txnid, key, hash, additionalCharges,
    });

    if (!valid) {
      console.error('[PayU Webhook] Hash mismatch for txnid:', txnid);
      return NextResponse.json({ error: 'Invalid hash' }, { status: 400 });
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
    } else if (status === 'failure') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', txnid);
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('booking_id', txnid);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('[PayU Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
