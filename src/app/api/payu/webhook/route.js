import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPaymentHash, getPayuConfig, amountsMatch } from '@/lib/payu';
import { sendUserEmail } from '@/lib/email';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

async function notifyBookingPaid(booking) {
  try {
    const serviceTitle = booking.service_title || `Booking ${booking.id}`;
    await sendUserEmail(booking.customer_id, {
      subject: 'Payment received',
      kind: 'bookings',
      text: `Your payment for booking ${booking.id} (${serviceTitle}) was received.`,
    });
    if (booking.professional_id) {
      await sendUserEmail(booking.professional_id, {
        subject: 'New booking confirmed',
        kind: 'bookings',
        text: `Booking ${booking.id} (${serviceTitle}) is confirmed and paid.`,
      });
    }
  } catch (error) {
    console.error('[PayU Webhook] Email failed:', error);
  }
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

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', txnid)
      .single();

    if (bookingError || !booking) {
      console.error('[PayU Webhook] Booking not found for txnid:', txnid);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!amountsMatch(booking.total_paid, amount)) {
      console.error('[PayU Webhook] Amount mismatch for txnid:', txnid, booking.total_paid, amount);
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    if (status === 'success') {
      const wasPaid = booking.payment_status === 'paid';
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'upcoming' })
        .eq('id', txnid);
      await supabase
        .from('payments')
        .update({ status: 'held', provider: 'payu', provider_ref: mihpayid || null })
        .eq('booking_id', txnid);
      // ponytail: callback/webhook race can still double-send; dedupe on a payments row if it ever matters.
      if (!wasPaid) await notifyBookingPaid(booking);
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
