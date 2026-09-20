import Navbar from "@/components/Navbar";
import MessagesView from "@/components/MessagesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Messages | BookMyProfessional",
};

export default async function MessagesPage({ searchParams }) {
  const params = await searchParams;
  const bookingId = typeof params?.booking === "string" ? params.booking : null;

  return (
    <div className="flex min-h-screen flex-col bg-background text-dark-800">
      <Navbar />
      <main className="flex-1 py-8 sm:py-10">
        <MessagesView initialBookingId={bookingId} />
      </main>
    </div>
  );
}
