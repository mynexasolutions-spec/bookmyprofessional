import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// Publishes one demo professional for every active subcategory through the admin API
// (/api/admin/professionals creates + approves), so subcategories come from the DB and
// are never hardcoded here. Re-runnable: skips subcategories that already have a pro.
const BASE = process.env.SEED_BASE_URL || "http://localhost:3000";

const NAMES = [
  "Anita Deshmukh", "Rajesh Iyer", "Priya Nair", "Vikram Singh", "Sneha Kulkarni",
  "Arjun Mehta", "Kavita Rao", "Sanjay Gupta", "Neha Sharma", "Imran Shaikh",
  "Deepa Menon", "Rahul Verma", "Pooja Joshi", "Karan Malhotra", "Asha Pillai",
  "Rohit Chopra", "Meera Reddy", "Farhan Ali", "Divya Kapoor", "Nikhil Bansal",
];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune"];
const IMAGES = [
  "/images/pro_doctor.jpg",
  "/images/pro_tutor.jpg",
  "/images/pro_electrician.jpg",
  "/images/pro_plumber.jpg",
  "/images/pro_beautician.jpg",
];
const IMAGE_BY_CATEGORY = {
  Doctors: "/images/pro_doctor.jpg",
  Tutors: "/images/pro_tutor.jpg",
  Electricians: "/images/pro_electrician.jpg",
  Plumbers: "/images/pro_plumber.jpg",
  Beauticians: "/images/pro_beautician.jpg",
};

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Same signed cookie the admin login sets; avoids driving the server action from a script.
function adminCookie() {
  const payload = Buffer.from(
    JSON.stringify({ id: process.env.ADMIN_ID, role: "admin", exp: Date.now() + 8 * 3600 * 1000 })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "")
    .update(payload)
    .digest("base64url");
  return `bmp-admin-session=${payload}.${sig}`;
}

async function adminPost(path, body, cookie) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  return json;
}

async function main() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: rows, error } = await supabase
    .from("categories")
    .select("id, name, parent_id, active")
    .order("sort", { ascending: true });
  if (error) throw error;

  const nameById = new Map(rows.map((r) => [r.id, r.name]));
  const subcategories = rows
    .filter((r) => r.parent_id && r.active)
    .map((r) => ({ name: r.name, parent: nameById.get(r.parent_id) }));

  const { data: pros } = await supabase.from("professionals").select("subcategory");
  const covered = new Set((pros || []).map((p) => (p.subcategory || "").toLowerCase()));
  const todo = subcategories.filter((s) => !covered.has(s.name.toLowerCase()));

  console.log(`${subcategories.length} subcategories, ${todo.length} without a professional`);
  if (!todo.length) return;

  const password = `Bmp-${crypto.randomBytes(9).toString("base64url")}`;
  const cookie = adminCookie();
  const created = [];

  for (const sub of todo) {
    const idx = subcategories.indexOf(sub);
    const payload = {
      action: "create",
      name: NAMES[idx % NAMES.length],
      email: `${slug(sub.name)}@bmp-demo.com`,
      password,
      category: sub.parent,
      subcategory: sub.name,
      roleTitle: sub.name,
      city: CITIES[idx % CITIES.length],
      phone: `+91 98200 ${String(10001 + idx).padStart(5, "0")}`,
      hourlyRate: 400 + (idx % 8) * 100,
      imageUrl: IMAGE_BY_CATEGORY[sub.parent] || IMAGES[idx % IMAGES.length],
    };
    try {
      const res = await adminPost("/api/admin/professionals", payload, cookie);
      await adminPost("/api/admin/professionals", { id: res.professional.id, action: "approve" }, cookie);
      created.push(payload);
      console.log(`ok  ${sub.parent} / ${sub.name} -> ${payload.name} <${payload.email}>`);
    } catch (err) {
      console.error(`FAIL ${sub.parent} / ${sub.name}: ${err.message}`);
    }
  }

  console.log(`\nCreated + approved ${created.length}/${todo.length} professionals.`);
  if (created.length) console.log(`Demo password for the new accounts: ${password}`);
}

main().catch((err) => {
  console.error("Seeding subcategory professionals failed:", err?.message || err);
  process.exit(1);
});
