import { createAdminClient } from './supabase/admin.js';
import { generateRefundHash, getPayuConfig, toPayuAmount } from './payu.js';
import { sendUserEmail } from './email.js';
import { formatMoney } from './money.js';

async function emailRefundCustomer(bookingId, customerId, amount) {
  if (!customerId) return;
  try {
    await sendUserEmail(customerId, {
      kind: 'bookings',
      subject: 'Refund processed',
      text: `Your refund of ${formatMoney(amount)} for booking ${bookingId} has been processed.\nIt should reflect in your original payment method within 5-7 business days.\n— BookMyProfessional`,
    });
  } catch {
    // best-effort email notification
  }
}

async function alertAdminsOnRefundFailure(supabase, bookingId, reason, amount) {
  try {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    const adminList = admins && admins.length > 0 ? admins : [];
    for (const admin of adminList) {
      await supabase.from('notifications').insert({
        user_id: admin.id,
        title: `Refund Failed for ${bookingId}`,
        body: `Refund for booking ${bookingId} (${formatMoney(amount)}) failed: ${reason}. Please review in the Admin Dashboard.`,
        type: 'alert',
        link: '/admin',
      });
    }
  } catch (err) {
    console.error('[PayU Refund Alert] Failed to notify admins:', err);
  }
}

export async function processRefund({
  bookingId,
  simulateFailure = false,
  client = null,
  adminUser = null,
}) {
  const supabase = client || createAdminClient();

  // 1. Fetch booking
  const { data: booking, error: bookingErr } = await supabase
    .from('bookings')
    .select('id, customer_id, total_paid, payment_status, status')
    .eq('id', bookingId)
    .single();

  if (bookingErr || !booking) {
    return { ok: false, error: 'Booking not found' };
  }

  // 2. Fetch payment row
  const { data: payment, error: paymentErr } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (paymentErr) {
    return { ok: false, error: paymentErr.message };
  }

  const refundAmount = Number(payment?.amount || booking.total_paid || 0);

  if (!payment || refundAmount <= 0) {
    return {
      ok: true,
      skipped: true,
      message: 'No paid amount to refund for this booking.',
    };
  }

  // If already refunded with a verified provider_ref, don't re-refund
  if (payment.status === 'refunded' && payment.provider_ref && booking.payment_status === 'refunded') {
    return {
      ok: true,
      alreadyRefunded: true,
      refundId: payment.provider_ref,
      message: 'Booking is already refunded.',
    };
  }

  // 3. Handle simulated failure (for testing / verification)
  if (simulateFailure) {
    const failReason = 'Simulated payment gateway failure (test)';
    await alertAdminsOnRefundFailure(supabase, bookingId, failReason, refundAmount);
    await supabase.from('audit_log').insert({
      admin_id: adminUser?.id || null,
      action: 'booking.refund_failed',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        reason: failReason,
        amount: refundAmount,
        admin_name: adminUser?.name || 'Admin',
        simulated: true,
      },
    });
    return {
      ok: false,
      error: failReason,
      refundStatus: 'refund_pending',
    };
  }

  const mihpayid = payment.provider_ref;

  // 4. Missing PayU transaction ID (cannot refund via PayU without transaction ref)
  if (!mihpayid) {
    const failReason = 'Payment is missing PayU transaction reference (provider_ref)';
    await alertAdminsOnRefundFailure(supabase, bookingId, failReason, refundAmount);
    await supabase.from('audit_log').insert({
      admin_id: adminUser?.id || null,
      action: 'booking.refund_failed',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        reason: failReason,
        amount: refundAmount,
        admin_name: adminUser?.name || 'Admin',
      },
    });
    return {
      ok: false,
      error: failReason,
      refundStatus: 'refund_pending',
    };
  }

  // 5. Stubbed payment bypass
  if (mihpayid.startsWith('STUB-')) {
    const refundId = `RFD_STUB_${Date.now()}`;
    await supabase
      .from('payments')
      .update({ status: 'refunded', provider_ref: refundId })
      .eq('id', payment.id);

    await supabase
      .from('bookings')
      .update({ payment_status: 'refunded' })
      .eq('id', bookingId);

    await supabase.from('audit_log').insert({
      admin_id: adminUser?.id || null,
      action: 'booking.refund_processed',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        refund_id: refundId,
        amount: refundAmount,
        stub: true,
        admin_name: adminUser?.name || 'Admin',
      },
    });

    await emailRefundCustomer(bookingId, booking.customer_id, refundAmount);

    return {
      ok: true,
      status: 'refunded',
      refundId,
      amount: refundAmount,
      message: 'Stub refund successful',
    };
  }

  // 6. Real PayU refund transaction call
  try {
    const { key, salt, refundUrl } = getPayuConfig();
    const command = 'cancel_refund_transaction';
    const amount = toPayuAmount(refundAmount);
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

    const responseData = await response.json().catch(() => ({}));

    if (responseData.status === 1) {
      const confirmedRefundId =
        responseData.request_id || responseData.txnid || refundToken;

      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          provider_ref: confirmedRefundId,
        })
        .eq('id', payment.id);

      await supabase
        .from('bookings')
        .update({ payment_status: 'refunded' })
        .eq('id', bookingId);

      await supabase.from('audit_log').insert({
        admin_id: adminUser?.id || null,
        action: 'booking.refund_processed',
        entity: 'bookings',
        entityId: bookingId,
        meta: {
          refund_id: confirmedRefundId,
          original_txn_id: mihpayid,
          amount: refundAmount,
          admin_name: adminUser?.name || 'Admin',
          payu_msg: responseData.msg || 'Success',
        },
      });

      await emailRefundCustomer(bookingId, booking.customer_id, refundAmount);

      return {
        ok: true,
        status: 'refunded',
        refundId: confirmedRefundId,
        amount: refundAmount,
        message: 'Refund initiated successfully at PayU',
      };
    }

    // PayU returned failure
    const failMsg = responseData.msg || responseData.message || 'Refund failed at payment gateway';
    await alertAdminsOnRefundFailure(supabase, bookingId, failMsg, refundAmount);
    await supabase.from('audit_log').insert({
      admin_id: adminUser?.id || null,
      action: 'booking.refund_failed',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        error: failMsg,
        original_txn_id: mihpayid,
        amount: refundAmount,
        admin_name: adminUser?.name || 'Admin',
        payu_response: responseData,
      },
    });

    return {
      ok: false,
      error: failMsg,
      refundStatus: 'refund_pending',
      amount: refundAmount,
    };
  } catch (netErr) {
    const errorMsg = netErr.message || 'Network error communicating with PayU';
    await alertAdminsOnRefundFailure(supabase, bookingId, errorMsg, refundAmount);
    await supabase.from('audit_log').insert({
      admin_id: adminUser?.id || null,
      action: 'booking.refund_failed',
      entity: 'bookings',
      entityId: bookingId,
      meta: {
        error: errorMsg,
        amount: refundAmount,
        admin_name: adminUser?.name || 'Admin',
      },
    });

    return {
      ok: false,
      error: errorMsg,
      refundStatus: 'refund_pending',
      amount: refundAmount,
    };
  }
}
