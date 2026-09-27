"use server";

import { createClient } from "@/lib/supabase/server";

export async function insertContactMessage(payload) {
  const supabase = await createClient();
  const { ticket_number, name, email, phone, topic, subject, message } = payload;
  
  const { data, error } = await supabase
    .from("contacts")
    .insert([{ 
      ticket_number, 
      name, 
      email, 
      phone, 
      topic: topic || "customer_support", 
      subject, 
      message, 
      status: 'open' 
    }])
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(error.message || "Failed to submit contact message");
  }
  return data;
}

export async function getContactMessages(client) {
  const supabase = client || await createClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

// ponytail: reuses the contacts table (topic "newsletter") so no new table/migration is needed.
// Move to a dedicated subscribers table if you need to export/segment the list.
export async function subscribeNewsletter(email) {
  const trimmed = (email || "").trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@")) throw new Error("Please enter a valid email address");

  const supabase = await createClient();
  const { error } = await supabase.from("contacts").insert([
    {
      ticket_number: `NL-${Date.now()}`,
      name: "Newsletter Subscriber",
      email: trimmed,
      topic: "newsletter",
      subject: "Newsletter subscription",
      message: trimmed,
      status: "open",
    },
  ]);

  if (error) {
    console.error("Newsletter insert error:", error);
    throw new Error("Could not subscribe right now. Please try again.");
  }
  return true;
}
