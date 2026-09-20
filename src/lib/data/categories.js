import { createClient } from "@/lib/supabase/client";

export const DEFAULT_CATEGORIES = [
  "Doctors",
  "Tutors",
  "Electricians",
  "Plumbers",
  "Beauticians",
  "Cleaners",
  "IT Professionals",
  "Consultants",
];

// ponytail: falls back to DEFAULT_CATEGORIES until the categories table is applied/populated.
export async function listCategories() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name")
      .eq("active", true)
      .order("sort", { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;

    const names = data.map((row) => row.name).filter(Boolean);
    return names.length > 0 ? names : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

// ponytail: [] on error -> admin Categories tab shows its empty state until schema is applied.
export async function listAllCategories(client) {
  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, icon, sort, active, created_at")
      .order("sort", { ascending: true });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createCategory(client, { name, icon, sort, active } = {}) {
  const supabase = client || createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({
      name,
      icon: icon || null,
      sort: Number(sort) || 0,
      active: active !== false,
    })
    .select("id, name, icon, sort, active")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(client, id, patch = {}) {
  const supabase = client || createClient();
  const clean = {};
  if (patch.name !== undefined) clean.name = patch.name;
  if (patch.icon !== undefined) clean.icon = patch.icon || null;
  if (patch.sort !== undefined) clean.sort = Number(patch.sort) || 0;
  if (patch.active !== undefined) clean.active = !!patch.active;

  const { data, error } = await supabase
    .from("categories")
    .update(clean)
    .eq("id", id)
    .select("id, name, icon, sort, active")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(client, id) {
  const supabase = client || createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  return true;
}
