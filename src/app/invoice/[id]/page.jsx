import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export const metadata = { title: "Receipt | BookMyProfessional" };

function formatDate(value) {
  if (!value) return null;
  const raw = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function InvoicePage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/invoice/" + id);

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, professionals(name, role_title), customer:profiles(full_name, email)")
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  if (booking.customer_id !== user.id && booking.professional_id !== user.id) notFound();

  const { data: payment } = await supabase
    .from("payments")
    .select("amount, commission, pro_payout, status, provider, provider_ref, created_at")
    .eq("booking_id", id)
    .maybeSingle();

  const pro = booking.professionals || {};
  const customer = booking.customer || {};

  return (
    <div className="min-h-screen bg-background text-dark-800 print:bg-white">
      <main className="mx-auto w-full max-w-3xl px-4 py-10 print:max-w-none print:p-0">
        <div className="rounded-2xl border border-border bg-white p-8 shadow-card print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-heading text-lg font-bold text-dark-900">BookMyProfessional</p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-dark-900">Payment Receipt</h1>
            </div>
            <PrintButton />
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Booking ID</dt>
              <dd className="mt-0.5 text-sm font-semibold text-dark-900">{booking.id}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Booked on</dt>
              <dd className="mt-0.5 text-sm text-dark-900">{formatDate(booking.created_at) || "-"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Service</dt>
              <dd className="mt-0.5 text-sm text-dark-900">{booking.service_title || "-"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Professional</dt>
              <dd className="mt-0.5 text-sm text-dark-900">
                {pro.name || "-"}
                {pro.role_title ? ` (${pro.role_title})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Customer</dt>
              <dd className="mt-0.5 text-sm text-dark-900">{customer.full_name || "-"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Appointment</dt>
              <dd className="mt-0.5 text-sm text-dark-900">
                {formatDate(booking.date) || "-"}
                {booking.time_slot ? ` · ${booking.time_slot}` : ""}
              </dd>
            </div>
            {booking.address && (
              <div className="sm:col-span-2">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Address</dt>
                <dd className="mt-0.5 text-sm text-dark-900">{booking.address}</dd>
              </div>
            )}
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Booking status</dt>
              <dd className="mt-0.5 text-sm capitalize text-dark-900">{booking.status || "-"}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Payment status</dt>
              <dd className="mt-0.5 text-sm capitalize text-dark-900">{booking.payment_status || "-"}</dd>
            </div>
          </dl>

          <div className="mt-8 overflow-hidden rounded-xl border border-border">
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-dark-600">Service price</span>
              <span className="text-dark-900">{formatMoney(booking.service_price)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
              <span className="text-dark-600">Platform fee</span>
              <span className="text-dark-900">{formatMoney(booking.platform_fee)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border bg-dark-50 px-4 py-3 text-sm font-bold">
              <span className="text-dark-900">Total paid</span>
              <span className="text-dark-900">{formatMoney(booking.total_paid)}</span>
            </div>
          </div>

          {payment && (
            <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">Payment method</dt>
                <dd className="mt-0.5 text-sm uppercase text-dark-900">
                  {payment.provider || booking.payment_method || "-"}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-dark-400">
                  Transaction reference
                </dt>
                <dd className="mt-0.5 text-sm text-dark-900">{payment.provider_ref || "-"}</dd>
              </div>
            </dl>
          )}

          <div className="mt-10 border-t border-border pt-4">
            <p className="text-xs text-dark-500">
              This is a system-generated receipt. For support contact support@bookmyprofessional.com.
            </p>
            <p className="mt-1 text-[11px] text-dark-400">
              Tax invoice details will be added once GST registration is configured.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
