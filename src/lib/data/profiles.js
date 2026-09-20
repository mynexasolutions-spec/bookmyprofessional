import { createClient } from "@/lib/supabase/client";

// ponytail: profile reads fall back to null while supabase/schema.sql is unapplied.
// Remove the try/catch once the profiles table exists in every environment.
export async function getProfile(userId) {
  if (!userId) return null;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch {
    return null;
  }
}

export async function getMyProfile() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    return getProfile(user.id);
  } catch {
    return null;
  }
}

export async function updateProfile(userId, patch) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
