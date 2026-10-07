import { NextResponse } from 'next/server';
import { updateEmailLogStatus } from '@/lib/data/email-logs';

/**
 * Brevo Transactional Email Webhook Handler
 * Listens for events: delivered, soft_bounce, hard_bounce, blocked, spam, opened.
 */
export async function POST(req) {
  try {
    const body = await req.json();

    // Brevo can send single event object or array of events
    const events = Array.isArray(body) ? body : [body];

    for (const ev of events) {
      const eventName = (ev.event || '').toLowerCase();
      const messageId = ev['message-id'] || ev.messageId || null;
      const email = ev.email || null;
      const date = ev.date || new Date().toISOString();
      const reason = ev.reason || ev.description || null;

      let status = 'sent';
      if (['delivered', 'opened', 'click', 'first_opening'].includes(eventName)) {
        status = 'delivered';
      } else if (['soft_bounce', 'hard_bounce', 'blocked', 'spam', 'error', 'invalid_email'].includes(eventName)) {
        status = 'bounced';
      }

      if (messageId || email) {
        await updateEmailLogStatus({
          messageId,
          email,
          status,
          reason,
          eventTime: date,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Brevo webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
