"use server";

import { createClient } from "@/lib/supabase/client";
import fs from "fs";
import path from "path";

const MOCK_FILE = path.join(process.cwd(), "contacts.json");

export async function insertContactMessage(payload) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contacts")
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // Fallback: store locally in contacts.json if table is missing
    let messages = [];
    if (fs.existsSync(MOCK_FILE)) {
      messages = JSON.parse(fs.readFileSync(MOCK_FILE, "utf-8"));
    }
    const newMsg = {
      ...payload,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      status: "open",
    };
    messages.push(newMsg);
    fs.writeFileSync(MOCK_FILE, JSON.stringify(messages, null, 2));
    return newMsg;
  }
}

export async function getContactMessages(client) {
  let dbMessages = [];
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      dbMessages = data || [];
    }
  } catch (err) {
    // Suppress error if table doesn't exist yet to avoid breaking SSR overlay
  }

  // Fallback: merge with local contacts.json if present
  let localMessages = [];
  try {
    if (fs.existsSync(MOCK_FILE)) {
      localMessages = JSON.parse(fs.readFileSync(MOCK_FILE, "utf-8"));
    }
  } catch (err) {
    // ignore fs errors
  }

  // Combine and sort descending by date
  const combined = [...dbMessages, ...localMessages];
  return combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
