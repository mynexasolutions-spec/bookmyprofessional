import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Privacy Policy | Book My Professional" };

const sections = [
  {
    h: "What we collect",
    p: "Account details (name, email, phone), booking and service information, and — for professionals — verification documents you upload.",
  },
  {
    h: "How we use it",
    p: "To match customers with professionals, process bookings and payments, send booking notifications, and meet legal obligations. We do not sell your data.",
  },
  {
    h: "Payments",
    p: "Card/UPI credentials are handled directly by our payment gateway (PayU). Card numbers never touch our servers.",
  },
  {
    h: "Storage & security",
    p: "Data is stored in encrypted Postgres (Supabase) with row-level security; documents live in private storage buckets accessible only to you and our verification team.",
  },
  {
    h: "Your rights",
    p: "You can update or delete your account data from your dashboard, or request deletion by contacting support. We honour data-erasure requests within 30 days.",
  },
  {
    h: "Cookies",
    p: "We use essential session cookies to keep you signed in, and optional analytics cookies to improve the service.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-dark-900">Privacy Policy</h1>
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
          Privacy questions? Reach us via{" "}
          <Link href="/contact" className="text-primary-600 font-semibold hover:underline">
            the contact page
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
