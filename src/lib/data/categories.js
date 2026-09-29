import { createClient } from "@/lib/supabase/client";
import { subcategoriesByParent } from "@/lib/subcategories";
import { parseInclusions } from "@/lib/inclusions";

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
      .is("parent_id", null)
      .order("sort", { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_CATEGORIES;

    const names = data.map((row) => row.name).filter(Boolean);
    return names.length > 0 ? names : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

// Active categories with their admin-uploaded tile image (icon). Falls back to bare names.
export async function listCategoryTiles() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("name, icon")
      .eq("active", true)
      .is("parent_id", null)
      .order("sort", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_CATEGORIES.map((name) => ({ name, icon: "" }));
    }

    const tiles = data
      .filter((row) => row.name)
      .map((row) => ({ name: row.name, icon: row.icon || "" }));
    return tiles.length > 0 ? tiles : DEFAULT_CATEGORIES.map((name) => ({ name, icon: "" }));
  } catch {
    return DEFAULT_CATEGORIES.map((name) => ({ name, icon: "" }));
  }
}

// ponytail: [] on error -> admin Categories tab shows its empty state until schema is applied.
export async function listAllCategories(client) {
  try {
    const supabase = client || createClient();
    const WITH_LISTS = "id, name, icon, sort, active, parent_id, inclusions, exclusions, created_at";
    const BASE = "id, name, icon, sort, active, parent_id, created_at";
    let { data, error } = await supabase
      .from("categories")
      .select(WITH_LISTS)
      .order("sort", { ascending: true });
    if (error) {
      // inclusions/exclusions columns may not exist yet (schema not applied) — load without them
      ({ data, error } = await supabase
        .from("categories")
        .select(BASE)
        .order("sort", { ascending: true }));
    }
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createCategory(client, { name, icon, sort, active, parent_id, inclusions, exclusions } = {}) {
  const supabase = client || createClient();
  const row = {
    name,
    icon: icon || null,
    sort: Number(sort) || 0,
    active: active !== false,
    parent_id: parent_id || null,
  };
  let { data, error } = await supabase
    .from("categories")
    .insert({ ...row, inclusions: parseInclusions(inclusions), exclusions: parseInclusions(exclusions) })
    .select("id, name, icon, sort, active, parent_id, inclusions, exclusions")
    .single();
  if (error) {
    // inclusions/exclusions columns may not exist yet (schema not applied) — create without them
    ({ data, error } = await supabase
      .from("categories")
      .insert(row)
      .select("id, name, icon, sort, active, parent_id")
      .single());
  }
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
  if (patch.parent_id !== undefined) clean.parent_id = patch.parent_id || null;
  const lists = {};
  if (patch.inclusions !== undefined) lists.inclusions = parseInclusions(patch.inclusions);
  if (patch.exclusions !== undefined) lists.exclusions = parseInclusions(patch.exclusions);

  let { data, error } = await supabase
    .from("categories")
    .update({ ...clean, ...lists })
    .eq("id", id)
    .select("id, name, icon, sort, active, parent_id, inclusions, exclusions")
    .single();
  if (error) {
    // inclusions/exclusions columns may not exist yet (schema not applied) — update the rest
    ({ data, error } = await supabase
      .from("categories")
      .update(clean)
      .eq("id", id)
      .select("id, name, icon, sort, active, parent_id")
      .single());
  }
  if (error) throw error;
  return data;
}

// Active subcategories grouped by parent name: { "Tutors": ["Dance Tutor", ...] }.
export async function listSubcategories() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, parent_id")
      .eq("active", true)
      .order("sort", { ascending: true });

    if (error || !data || data.length === 0) return {};
    return subcategoriesByParent(data);
  } catch {
    return {};
  }
}

export async function deleteCategory(client, id) {
  const supabase = client || createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  return true;
}
