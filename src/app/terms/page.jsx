import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Terms & Conditions | Book My Professional" };

const sections = [
  {
    h: "1. Use of the Platform",
    p: "BookMyProfessional connects customers with verified service professionals. By booking, you agree to provide accurate contact and service details and to treat professionals with courtesy.",
  },
  {
    h: "2. Booking & Scheduling",
    p: "Bookings are confirmed once payment is captured. Slots are reserved on a first-come basis. Professionals may accept or decline requests; a declined booking is refunded in full.",
  },
  {
    h: "3. Payments & Escrow",
    p: "Payments are processed through our PCI-compliant gateway (PayU). Service fees are held in escrow and released to the professional after the service is marked complete.",
  },
  {
    h: "4. Cancellations & Refunds",
    p: "Bookings can be cancelled up to the cancellation window configured on the platform before the appointment start time. Eligible refunds are returned to the original payment method.",
  },
  {
    h: "5. Verification",
    p: "Professionals display a verified badge after document review. Verification reduces risk but is not a guarantee of outcome; customers should describe issues via reviews and support.",
  },
  {
    h: "6. Acceptable Use",
    p: "Do not misuse the platform: no fake bookings, harassment, off-platform payment evasion of disputes, or unlawful requests. Accounts may be suspended for abuse.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-dark-900">Terms &amp; Conditions</h1>
        <p className="text-sm text-dark-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
        <div className="mt-8 space-y-6">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="font-heading text-lg font-bold text-dark-900">{s.h}</h2>
              <p className="text-sm text-dark-700 mt-2 leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="text-sm text-dark-600 mt-10">
          Questions? Contact us at{" "}
          <Link href="/contact" className="text-primary-600 font-semibold hover:underline">
            our support page
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
