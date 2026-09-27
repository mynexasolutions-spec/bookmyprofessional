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
    console.error('[PayU Callback] Email failed:', error);
  }
}

export async function POST(req) {
  const { key, salt } = getPayuConfig();
  const failure = new URL('/?payment=failure', req.url);
  const errorRedirect = new URL('/?payment=error', req.url);

  try {
    const formData = await req.formData();
    const data = Object.fromEntries(formData);
    const { txnid, status, hash, amount, productinfo, firstname, email, mihpayid, additionalCharges } = data;

    const valid = verifyPaymentHash({
      salt, status, email, firstname, productinfo, amount, txnid, key, hash, additionalCharges,
    });

    if (!valid) {
      console.error('[PayU Callback] Hash mismatch for txnid:', txnid);
      return NextResponse.redirect(errorRedirect, { status: 303 });
    }

    const supabase = supabaseAdmin();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', txnid)
      .single();

    if (bookingError || !booking) {
      console.error('[PayU Callback] Booking not found for txnid:', txnid);
      return NextResponse.redirect(errorRedirect, { status: 303 });
    }

    if (!amountsMatch(booking.total_paid, amount)) {
      console.error('[PayU Callback] Amount mismatch for txnid:', txnid, booking.total_paid, amount);
      return NextResponse.redirect(errorRedirect, { status: 303 });
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
      if (!wasPaid) await notifyBookingPaid(booking);
      return NextResponse.redirect(new URL(`/dashboard?payment=success&bookingId=${txnid}`, req.url), { status: 303 });
    }

    if (status === 'failure') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', txnid);
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('booking_id', txnid);
      return NextResponse.redirect(failure, { status: 303 });
    }

    return NextResponse.redirect(new URL(`/dashboard?payment=pending&bookingId=${txnid}`, req.url), { status: 303 });
  } catch (error) {
    console.error('Error handling PayU callback:', error);
    return NextResponse.redirect(errorRedirect, { status: 303 });
  }
}
