import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log("Seeding a test review...");

  // 1. Get a professional
  const { data: pros, error: proError } = await supabase.from("professionals").select("id, name").limit(1);
  if (proError || !pros.length) {
    console.error("No professionals found. Make sure to run seed.mjs first.");
    process.exit(1);
  }
  const pro = pros[0];

  // 2. Get a customer (or just the first user)
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users.users.length) {
    console.error("No users found.");
    process.exit(1);
  }
  // Find a user who is not the professional, if possible
  const customer = users.users.find(u => u.id !== pro.id) || users.users[0];

  console.log(`Using Customer: ${customer.email} and Professional: ${pro.name}`);

  // 3. Create a completed booking
  const bookingId = `BMP-${Math.floor(10000 + Math.random() * 90000)}`;
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      id: bookingId,
      customer_id: customer.id,
      professional_id: pro.id,
      service_title: "General Consultation (Seeded)",
      service_price: 50,
      total_paid: 50,
      date: new Date().toISOString().split("T")[0],
      time_slot: "10:00 AM",
      status: "completed",
      payment_status: "paid"
    })
    .select()
    .single();

  if (bookingError) {
    console.error("Error creating booking:", bookingError.message);
    process.exit(1);
  }
  console.log("Created completed booking:", bookingId);

  // 4. Create a pending review
  const { error: reviewError } = await supabase
    .from("reviews")
    .insert({
      booking_id: bookingId,
      customer_id: customer.id,
      professional_id: pro.id,
      rating: 5,
      comment: "Absolutely fantastic service! The professional was very knowledgeable and helped me solve my problem perfectly.",
      breakdown: { quality: 5, punctuality: 5 },
      status: "pending"
    });

  if (reviewError) {
    console.error("Error creating review:", reviewError.message);
    process.exit(1);
  }

  console.log("✅ Successfully seeded 1 pending review! Check your Admin Dashboard.");
}

main();
