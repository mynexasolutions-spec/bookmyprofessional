import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  notifyBookingCompleted,
  notifyBookingCancelled,
  notifyRefundProcessed,
  notifyPayoutRequested,
  notifyPayoutPaid,
} from '@/lib/whatsapp';

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { event, bookingId, payoutId, amount } = body || {};

    if (!event) {
      return NextResponse.json({ error: 'event is required' }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    switch (event) {
      case 'booking_completed': {
        if (!bookingId) {
          return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
        }
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();

        if (booking) {
          await notifyBookingCompleted(booking, supabase);
        }
        return NextResponse.json({ ok: true, event });
      }

      case 'booking_cancelled': {
        if (!bookingId) {
          return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
        }
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();

        if (booking) {
          await notifyBookingCancelled(booking, supabase);
        }
        return NextResponse.json({ ok: true, event });
      }

      case 'refund_processed': {
        if (!bookingId) {
          return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
        }
        const { data: booking } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .maybeSingle();

        if (booking) {
          await notifyRefundProcessed(booking, amount || booking.total_paid || 0, supabase);
        }
        return NextResponse.json({ ok: true, event });
      }

      case 'payout_requested': {
        if (!payoutId) {
          return NextResponse.json({ error: 'payoutId is required' }, { status: 400 });
        }
        const { data: payout } = await supabase
          .from('payouts')
          .select('*')
          .eq('id', payoutId)
          .maybeSingle();

        if (payout) {
          await notifyPayoutRequested(payout, supabase);
        }
        return NextResponse.json({ ok: true, event });
      }

      case 'payout_paid': {
        if (!payoutId) {
          return NextResponse.json({ error: 'payoutId is required' }, { status: 400 });
        }
        const { data: payout } = await supabase
          .from('payouts')
          .select('*')
          .eq('id', payoutId)
          .maybeSingle();

        if (payout) {
          await notifyPayoutPaid(payout, supabase);
        }
        return NextResponse.json({ ok: true, event });
      }

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[Notification Event Route Error]', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
