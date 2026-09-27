import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateRefundHash, getPayuConfig, toPayuAmount } from '@/lib/payu';
import { sendUserEmail } from '@/lib/email';
import { formatMoney } from '@/lib/money';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// ponytail: email is best-effort — a mail failure must never fail the refund.
async function emailRefundCustomer(bookingId, customerId, amount) {
  if (!customerId) return;
  try {
    await sendUserEmail(customerId, {
      kind: 'bookings',
      subject: 'Refund processed',
      text: `Your refund of ${formatMoney(amount)} for booking ${bookingId} has been processed.\nIt should reflect in your original payment method within 5-7 business days.\n— BookMyProfessional`,
    });
  } catch {
    // ignore
  }
}

export async function POST(req) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('amount, provider_ref')
      .eq('booking_id', bookingId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    const mihpayid = payment.provider_ref;

    let customerId = null;
    try {
      const { data: booking } = await supabase
        .from('bookings')
        .select('customer_id')
        .eq('id', bookingId)
        .maybeSingle();
      customerId = booking?.customer_id || null;
    } catch {
      // ignore — the refund still proceeds without the notification
    }

    if (!mihpayid || mihpayid.startsWith('STUB-')) {
      console.warn(`[PayU Refund] Bypassing real refund for stubbed payment: ${mihpayid}`);
      await emailRefundCustomer(bookingId, customerId, payment.amount);
      return NextResponse.json({ status: 1, message: 'Mock refund successful' });
    }

    const { key, salt, refundUrl } = getPayuConfig();
    const command = 'cancel_refund_transaction';
    const amount = toPayuAmount(payment.amount);
    // ponytail: var2 must be unique per refund (<=23 chars); a second refund of the same booking
    // with the same token is rejected by PayU, which is the desired idempotency for full refunds.
    const refundToken = `RFD${Date.now()}`;

    const hash = generateRefundHash({ key, command, var1: mihpayid, salt });

    const params = new URLSearchParams();
    params.append('key', key);
    params.append('command', command);
    params.append('hash', hash);
    params.append('var1', mihpayid);
    params.append('var2', refundToken);
    params.append('var3', amount);

    const response = await fetch(refundUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const responseData = await response.json();

    if (responseData.status === 1) {
      await emailRefundCustomer(bookingId, customerId, payment.amount);
      return NextResponse.json({ status: 1, message: 'Refund initiated successfully', data: responseData });
    }

    console.error('[PayU Refund] Refund failed:', responseData);
    return NextResponse.json({ status: 0, message: responseData.msg || 'Refund failed', data: responseData }, { status: 400 });
  } catch (error) {
    console.error('[PayU Refund] Error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
