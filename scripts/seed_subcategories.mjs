import { createClient } from "@supabase/supabase-js";
import { subcategoriesByParent } from "../src/lib/subcategories.js";

// Insert-only seed: existing categories/subcategories are never updated or deleted.
// Safe to re-run — duplicate names are skipped (categories.name is unique).
const SEEDS = [
  ["Doctors", "General Physician"],
  ["Doctors", "Dentist"],
  ["Doctors", "Dermatologist"],
  ["Tutors", "Dance Tutor"],
  ["Tutors", "Music Tutor"],
  ["Tutors", "Maths Tutor"],
  ["Tutors", "Spoken English Tutor"],
  ["IT Professionals", "Web Developer"],
  ["IT Professionals", "Mobile App Developer"],
  ["Electricians", "Wiring & Installation"],
  ["Electricians", "Fan & Light Fitting"],
  ["Plumbers", "Pipe Fitting"],
  ["Plumbers", "Leak Repair"],
  ["Beauticians", "Bridal Makeup"],
  ["Beauticians", "Hair Styling"],
  ["Cleaners", "Deep Cleaning"],
  ["Cleaners", "Sofa & Carpet Cleaning"],
  ["Consultants", "Tax Consultant"],
  ["Consultants", "Business Consultant"],
];

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: rows, error } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("sort", { ascending: true });
  if (error) throw error;

  const parentId = {};
  rows.filter((r) => !r.parent_id).forEach((r) => (parentId[r.name] = r.id));

  const payload = [];
  for (const [parent, name] of SEEDS) {
    const pid = parentId[parent];
    if (!pid) {
      console.warn(`skip "${name}": parent category "${parent}" not found`);
      continue;
    }
    payload.push({ name, parent_id: pid });
  }

  const { error: insError } = await supabase
    .from("categories")
    .upsert(payload, { onConflict: "name", ignoreDuplicates: true });
  if (insError) throw insError;

  const { data: after } = await supabase
    .from("categories")
    .select("id, name, parent_id")
    .order("sort", { ascending: true });

  const tree = subcategoriesByParent(after || []);
  console.log(`\nCategories in DB: ${after.length} (${Object.values(tree).flat().length} subcategories)`);
  for (const parent of Object.keys(tree)) {
    console.log(`  ${parent}`);
    tree[parent].forEach((child) => console.log(`    └─ ${child}`));
  }
}

main().catch((err) => {
  console.error("Seeding subcategories failed:", err?.message || err);
  process.exit(1);
});
