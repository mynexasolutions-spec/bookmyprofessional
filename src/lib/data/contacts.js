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
