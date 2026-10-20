// Pure date/time helpers (no imports, no Supabase) so they can be unit-tested with node:test.
function parseTimeSlot(slot) {
  const m = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(String(slot || ""));
  if (!m) return { hours: 9, minutes: 0 };
  let hours = Number(m[1]) % 12;
  if (/PM/i.test(m[3] || "")) hours += 12;
  return { hours, minutes: Number(m[2]) };
}

function tzOffsetMs(date, timeZone) {
  const parts = {};
  for (const p of new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date)) {
    parts[p.type] = p.value;
  }
  return (
    Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      parts.hour === "24" ? 0 : Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    ) - date.getTime()
  );
}

// ponytail: browser-native tz math, no date lib. Two passes cover DST; ceiling is a wall time inside the
// 1h DST gap resolving to the post-transition instant — swap in a tz lib only if that edge matters.
export function toUtcInstant(date, timeSlot, timezone = "UTC") {
  if (!date || !timeSlot) return null;
  const { hours, minutes } = parseTimeSlot(timeSlot);
  const [y, mo, d] = String(date).split("-").map(Number);
  if (!y || !mo || !d) return null;
  const wallAsUtc = Date.UTC(y, mo - 1, d, hours, minutes, 0, 0);
  try {
    let ts = wallAsUtc;
    for (let i = 0; i < 2; i++) ts = wallAsUtc - tzOffsetMs(new Date(ts), timezone);
    return new Date(ts).toISOString();
  } catch {
    // ponytail: unknown tz string -> treat the wall time as UTC instead of failing the booking insert.
    return new Date(wallAsUtc).toISOString();
  }
}
/**
 * Calculates the UTC millisecond timestamp when a booking appointment starts.
 * Defaults to Asia/Kolkata (+05:30) if no timezone is provided.
 */
export function getBookingStartTimestamp(booking, defaultTimezone = "Asia/Kolkata") {
  if (!booking) return null;
  if (booking.startsAt) {
    const t = new Date(booking.startsAt).getTime();
    if (!isNaN(t)) return t;
  }
  if (booking.date && booking.timeSlot) {
    const iso = toUtcInstant(booking.date, booking.timeSlot, booking.timezone || defaultTimezone);
    if (iso) {
      const t = new Date(iso).getTime();
      if (!isNaN(t)) return t;
    }
    // Fallback IST calculation
    const [y, m, d] = String(booking.date).split("-").map(Number);
    const match = String(booking.timeSlot).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match && y && m && d) {
      let h = Number(match[1]) % 12;
      if (/PM/i.test(match[3] || "")) h += 12;
      const min = Number(match[2]) || 0;
      return Date.UTC(y, m - 1, d, h - 5, min - 30);
    }
  }
  return null;
}

/**
 * Checks if an unstarted upcoming booking has expired past its scheduled appointment window.
 * Default grace window is 60 minutes.
 */
export function isBookingExpired(booking, now = Date.now(), graceWindowMs = 60 * 60 * 1000) {
  if (!booking || booking.status !== "upcoming") return false;
  const startMs = getBookingStartTimestamp(booking);
  if (!startMs) return false;
  return now > startMs + graceWindowMs;
}

/**
 * Returns derived display status for a booking.
 * Returns: 'upcoming' | 'missed' | 'in_progress' | 'completed' | 'cancelled'
 */
export function getDerivedBookingStatus(booking, now = Date.now()) {
  if (!booking) return "upcoming";
  if (booking.status !== "upcoming") return booking.status;
  if (isBookingExpired(booking, now)) return "missed";
  return "upcoming";
}
