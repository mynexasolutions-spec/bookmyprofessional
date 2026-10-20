// Server-only WhatsApp notification via Brevo (WhatsApp channel).
// Never import from a client component.

const BMP_PHONE = '+918919328705'; // BookMyProfessional support line (IST)

/**
 * Format a Date (or ISO string) in IST for display.
 */
function toIST(dt) {
  try {
    const d = typeof dt === 'string' ? new Date(dt) : dt;
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dt);
  }
}

/**
 * Send a WhatsApp message via Brevo.
 * Returns true on success, false on failure (never throws).
 *
 * @param {object} opts
 * @param {string}  opts.to          - E.164 phone number, e.g. "+919876543210"
 * @param {string}  opts.templateName - One of the predefined template IDs below
 * @param {object}  [opts.variables]  - Key-value pairs interpolated into the template body
 */
export async function sendWhatsApp({ to, body }) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || !to) return false;

  // Normalise to E.164
  const phone = to.replace(/\D/g, '');
  if (phone.length < 10) return false;
  const e164 = phone.startsWith('91') && phone.length === 12
    ? `+${phone}`
    : phone.length === 10
    ? `+91${phone}`
    : `+${phone}`;

  try {
    const res = await fetch('https://api.brevo.com/v3/whatsapp/sendMessage', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        senderNumber: BMP_PHONE,
        type: 'text',
        unicodeText: false,
        recipientPhoneNumber: e164,
        textMessage: {
          text: body,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[WhatsApp] Brevo send failed:', res.status, errText);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[WhatsApp] sendWhatsApp error:', err?.message || err);
    return false;
  }
}

/**
 * Send booking-confirmation WhatsApp to a single recipient (customer or professional).
 * Respects whatsapp_consent. Best-effort — never throws.
 *
 * @param {object} profile   - { phone, full_name, whatsapp_consent }
 * @param {object} booking   - { id, service_title, scheduled_at, ... }
 * @param {'customer'|'professional'} recipientType
 */
export async function sendBookingConfirmationWhatsApp(profile, booking, recipientType) {
  if (!profile?.whatsapp_consent || !profile?.phone) return false;

  const slotLabel = toIST(booking.scheduled_at);
  const serviceTitle = booking.service_title || 'your service';

  let body;
  if (recipientType === 'customer') {
    body =
      `✅ *Booking Confirmed!*\n\n` +
      `Hi ${profile.full_name || 'there'}, your booking has been confirmed.\n\n` +
      `📋 *Booking ID:* ${booking.id}\n` +
      `🛠 *Service:* ${serviceTitle}\n` +
      `📅 *Appointment:* ${slotLabel} (IST)\n\n` +
      `Your professional will be with you on time. For any questions reach us at ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  } else {
    body =
      `🔔 *New Booking Alert!*\n\n` +
      `Hi ${profile.full_name || 'there'}, you have a new booking.\n\n` +
      `📋 *Booking ID:* ${booking.id}\n` +
      `🛠 *Service:* ${serviceTitle}\n` +
      `📅 *Appointment:* ${slotLabel} (IST)\n\n` +
      `Please be on time. For support call ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  }

  return await sendWhatsApp({ to: profile.phone, body });
}

/**
 * Send a 1-hour-before reminder WhatsApp.
 * Best-effort — never throws.
 *
 * @param {object} profile   - { phone, full_name, whatsapp_consent }
 * @param {object} booking   - { id, service_title, scheduled_at }
 * @param {'customer'|'professional'} recipientType
 */
export async function sendBookingReminderWhatsApp(profile, booking, recipientType) {
  if (!profile?.whatsapp_consent || !profile?.phone) return false;

  const slotLabel = toIST(booking.scheduled_at);
  const serviceTitle = booking.service_title || 'your service';

  let body;
  if (recipientType === 'customer') {
    body =
      `⏰ *Appointment Reminder*\n\n` +
      `Hi ${profile.full_name || 'there'}, your appointment is in 1 hour!\n\n` +
      `📋 *Booking ID:* ${booking.id}\n` +
      `🛠 *Service:* ${serviceTitle}\n` +
      `📅 *Time:* ${slotLabel} (IST)\n\n` +
      `Please be ready. Need to cancel? Call ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  } else {
    body =
      `⏰ *Appointment Reminder*\n\n` +
      `Hi ${profile.full_name || 'there'}, you have a booking in 1 hour!\n\n` +
      `📋 *Booking ID:* ${booking.id}\n` +
      `🛠 *Service:* ${serviceTitle}\n` +
      `📅 *Time:* ${slotLabel} (IST)\n\n` +
      `Please be on time. For support call ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  }

  return await sendWhatsApp({ to: profile.phone, body });
}

/**
 * Send booking-cancellation WhatsApp to a single recipient.
 * Best-effort — never throws.
 *
 * @param {object} profile   - { phone, full_name, whatsapp_consent }
 * @param {object} booking   - { id, service_title, scheduled_at }
 * @param {'customer'|'professional'} recipientType
 */
export async function sendBookingCancellationWhatsApp(profile, booking, recipientType) {
  if (!profile?.whatsapp_consent || !profile?.phone) return false;

  const slotLabel = toIST(booking.scheduled_at);
  const serviceTitle = booking.service_title || 'your service';

  let body;
  if (recipientType === 'customer') {
    body =
      `❌ *Booking Cancelled*\n\n` +
      `Hi ${profile.full_name || 'there'}, booking ${booking.id} for *${serviceTitle}* ` +
      `(originally scheduled at ${slotLabel} IST) has been cancelled.\n\n` +
      `If you did not request this, please contact us at ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  } else {
    body =
      `❌ *Booking Cancelled*\n\n` +
      `Hi ${profile.full_name || 'there'}, booking ${booking.id} for *${serviceTitle}* ` +
      `(scheduled at ${slotLabel} IST) has been cancelled by the customer.\n\n` +
      `For queries call ${BMP_PHONE}.\n\n` +
      `— BookMyProfessional`;
  }

  return await sendWhatsApp({ to: profile.phone, body });
}

/**
 * Send notifications (confirmation WhatsApp + email) to both customer and professional
 * when a booking is confirmed/paid.
 *
 * @param {object} booking  - full booking row from Supabase
 * @param {object} supabase - admin Supabase client
 */
export async function notifyBookingConfirmed(booking, supabase) {
  if (!booking || !supabase) return;

  try {
    const profileIds = [booking.customer_id, booking.professional_id].filter(Boolean);
    if (!profileIds.length) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, phone, whatsapp_consent')
      .in('id', profileIds);

    if (!profiles?.length) return;

    const customerProfile = profiles.find((p) => p.id === booking.customer_id);
    const proProfile = profiles.find((p) => p.id === booking.professional_id);

    const tasks = [];

    if (customerProfile?.phone && customerProfile?.whatsapp_consent) {
      tasks.push(sendBookingConfirmationWhatsApp(customerProfile, booking, 'customer'));
    }
    if (proProfile?.phone && proProfile?.whatsapp_consent) {
      tasks.push(sendBookingConfirmationWhatsApp(proProfile, booking, 'professional'));
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('[WhatsApp] notifyBookingConfirmed error:', err?.message || err);
  }
}

/**
 * Send cancellation WhatsApp to both customer and professional.
 *
 * @param {object} booking  - full booking row
 * @param {object} supabase - admin Supabase client
 */
export async function notifyBookingCancelled(booking, supabase) {
  if (!booking || !supabase) return;

  try {
    const profileIds = [booking.customer_id, booking.professional_id].filter(Boolean);
    if (!profileIds.length) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, phone, whatsapp_consent')
      .in('id', profileIds);

    if (!profiles?.length) return;

    const customerProfile = profiles.find((p) => p.id === booking.customer_id);
    const proProfile = profiles.find((p) => p.id === booking.professional_id);

    const tasks = [];

    if (customerProfile?.phone && customerProfile?.whatsapp_consent) {
      tasks.push(sendBookingCancellationWhatsApp(customerProfile, booking, 'customer'));
    }
    if (proProfile?.phone && proProfile?.whatsapp_consent) {
      tasks.push(sendBookingCancellationWhatsApp(proProfile, booking, 'professional'));
    }

    await Promise.allSettled(tasks);
  } catch (err) {
    console.error('[WhatsApp] notifyBookingCancelled error:', err?.message || err);
  }
}
