import { createClient } from "@/lib/supabase/client";

// ponytail: []/false on error or no session so the heart button just renders unfilled.
export async function listMyWishlist() {
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return [];
    const { data, error } = await supabase
      .from("wishlists")
      .select("professional_id")
      .eq("user_id", auth.user.id);
    if (error) throw error;
    return (data || []).map((row) => row.professional_id);
  } catch {
    return [];
  }
}

export async function isWished(professionalId) {
  if (!professionalId) return false;
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return false;
    const { data, error } = await supabase
      .from("wishlists")
      .select("professional_id")
      .eq("user_id", auth.user.id)
      .eq("professional_id", professionalId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  } catch {
    return false;
  }
}

export async function addWish(professionalId) {
  if (!professionalId) return false;
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return false;
    const { error } = await supabase
      .from("wishlists")
      .upsert(
        { user_id: auth.user.id, professional_id: professionalId },
        { onConflict: "user_id,professional_id", ignoreDuplicates: true }
      );
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function removeWish(professionalId) {
  if (!professionalId) return false;
  try {
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return false;
    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", auth.user.id)
      .eq("professional_id", professionalId);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}
