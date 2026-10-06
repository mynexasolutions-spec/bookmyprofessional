import { NextResponse } from 'next/server';
import { processRefund } from '@/lib/payu-refund';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { bookingId, simulate_failure } = body || {};

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const result = await processRefund({
      bookingId,
      simulateFailure: Boolean(simulate_failure),
    });

    if (result.ok) {
      return NextResponse.json({
        status: 1,
        message: result.message || 'Refund initiated successfully',
        refundId: result.refundId,
        amount: result.amount,
      });
    }

    return NextResponse.json(
      {
        status: 0,
        message: result.error || 'Refund failed',
        refundStatus: result.refundStatus || 'refund_pending',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('[PayU Refund Route Error]', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
