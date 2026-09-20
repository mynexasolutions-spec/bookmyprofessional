import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/admin-session";
import {
  getAnalytics,
  getSettings,
  listAllBookings,
  listAllProfessionals,
  listPayouts,
  listPendingDocuments,
  listPendingReviews,
  listUsers,
} from "@/lib/data/admin";
import { listAllCategories } from "@/lib/data/categories";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Panel | BookMyProfessional",
};

export default async function AdminPage() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  const session = verifyAdminToken(token);
  if (!session) redirect("/admin/login");

  const supabase = createAdminClient();

  const [analytics, documents, reviews, bookings, users, payouts, categories, professionals, settings] =
    await Promise.all([
      getAnalytics(supabase),
      listPendingDocuments(supabase),
      listPendingReviews(supabase),
      listAllBookings(supabase),
      listUsers(supabase),
      listPayouts(supabase),
      listAllCategories(supabase),
      listAllProfessionals(supabase),
      getSettings(supabase),
    ]);

  return (
    <AdminDashboard
      analytics={analytics}
      documents={documents}
      reviews={reviews}
      bookings={bookings}
      users={users}
      payouts={payouts}
      categories={categories}
      professionals={professionals}
      settings={settings}
      adminId={session.id}
    />
  );
}
