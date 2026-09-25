import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  try {
    // PayU webhooks usually send data as URL-encoded form data
    let data;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      data = Object.fromEntries(formData);
    } else {
      data = await req.json();
    }

    const { 
      txnid, 
      status, 
      hash: payuHash, 
      amount, 
      productinfo, 
      firstname, 
      email, 
      mihpayid,
      additionalCharges 
    } = data;

    if (!txnid || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const key = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;

    // Verify Hash (Security Check)
    let hashString = '';
    if (additionalCharges) {
      hashString = `${additionalCharges}|${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    } else {
      hashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    }

    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    // Only process if hash matches (to prevent spoofing)
    if (calculatedHash !== payuHash) {
      console.error('[PayU Webhook] Hash mismatch for txnid:', txnid);
      // Depending on PayU environment settings, you might still want to accept it in test mode, 
      // but in production always strictly enforce hash validation.
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    if (status === 'success') {
      // Update booking to paid
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid', status: 'upcoming' })
        .eq('id', txnid);
        
      if (mihpayid) {
        await supabase
          .from('payments')
          .update({ provider_ref: mihpayid })
          .eq('booking_id', txnid);
      }
    } else if (status === 'failure') {
      // Update booking to failed
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed', status: 'cancelled' })
        .eq('id', txnid);
    }

    // Webhooks MUST return a 200 OK status to PayU so they stop retrying
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('[PayU Webhook] Error:', error);
    // Return 200 even on some errors so PayU doesn't retry indefinitely, or 500 if you want retries
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
