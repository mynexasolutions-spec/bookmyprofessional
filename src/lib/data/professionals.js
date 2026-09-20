import { createClient } from "@/lib/supabase/client";
import { listLocations, DEFAULT_LOCATIONS } from "./locations";

const DEFAULT_REVIEW_AVATAR =
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80";

export const DEFAULT_PAGE_SIZE = 8;

function buildLocationMap(locations) {
  const map = {};
  (locations || []).forEach((loc) => {
    if (loc.city) map[loc.city.toLowerCase()] = loc;
  });
  return map;
}

function normalizeAvailability(availability) {
  const a = availability && typeof availability === "object" ? availability : {};
  return {
    days: Array.isArray(a.days) ? a.days : [],
    hours: a.hours || "",
    slots: Array.isArray(a.slots) ? a.slots : [],
  };
}

function mapReview(row) {
  return {
    id: row.id,
    userName: "Verified Client",
    userAvatar: DEFAULT_REVIEW_AVATAR,
    rating: Number(row.rating) || 0,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString() : "",
    comment: row.comment || "",
    breakdown: row.breakdown || {},
    verifiedBooking: true,
  };
}

// Rating & count come from actual review rows so the header always matches the reviews list
// (no fabricated counts). A pro with no reviews reads as 0 / "New".
function summarizeReviews(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  if (!list.length) return { rating: 0, reviewCount: 0 };
  const avg = list.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / list.length;
  return { rating: Math.round(avg * 10) / 10, reviewCount: list.length };
}

function mapProfessional(row, locMap) {
  const city = row.city || "";
  const loc = city ? locMap[city.toLowerCase()] : null;
  const hourlyRate = Number(row.hourly_rate) || 0;
  const reviews = (row.reviews || []).map(mapReview);

  return {
    id: row.id,
    name: row.name,
    role: row.role_title || "Professional",
    category: row.category || "",
    specialty: row.specialty || "",
    ...summarizeReviews(reviews),
    location: loc ? `${city}, ${loc.country}` : city,
    city,
    latitude: row.latitude ?? loc?.latitude ?? null,
    longitude: row.longitude ?? loc?.longitude ?? null,
    experienceYears: row.experience_years || 0,
    verified: row.verified ?? false,
    verificationStatus: row.verification_status || "approved",
    isActive: row.is_active !== false,
    hourlyRate,
    price: hourlyRate,
    unit: row.unit || "hour",
    responseTime: row.response_time || "",
    image: row.image_url || "",
    bio: row.bio || "",
    about: row.about || "",
    credentials: (row.credentials || []).map((c) => ({
      title: c.title,
      issuer: c.issuer,
      year: c.year,
    })),
    services: (row.services || [])
      .slice()
      .sort((a, b) => (a.sort || 0) - (b.sort || 0))
      .map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        price: Number(s.price) || 0,
        duration: s.duration,
      })),
    availability: normalizeAvailability(row.availability),
    reviews,
  };
}

function withCoordinates(pro, locMap) {
  if (pro.latitude != null && pro.longitude != null) return pro;
  const city = (pro.city || (pro.location || "").split(",")[0] || "").trim();
  const loc = city ? locMap[city.toLowerCase()] : null;
  return {
    ...pro,
    city: pro.city || city || null,
    latitude: loc?.latitude ?? null,
    longitude: loc?.longitude ?? null,
  };
}

// ponytail: ilike scan across name/role_title/category/specialty — no tsvector index yet.
// Swap for .textSearch()/an RPC over a generated tsvector column once the catalog is large.
function applySearch(query, term) {
  const q = String(term || "")
    .trim()
    .replace(/[,.()%*:"]/g, " ")
    .trim();
  if (!q) return query;
  return query.or(
    ["name", "role_title", "category", "specialty"]
      .map((col) => `${col}.ilike.%${q}%`)
      .join(",")
  );
}

function applyFilters(query, opts) {
  let q = applySearch(query, opts.search);

  if (opts.category && opts.category !== "all") q = q.ilike("category", opts.category);
  if (opts.location && opts.location !== "all") q = q.ilike("city", opts.location);
  if (opts.minRating > 0) q = q.gte("rating", opts.minRating);
  if (opts.minExperience > 0) q = q.gte("experience_years", opts.minExperience);

  if (opts.priceRange === "under-40") q = q.lt("hourly_rate", 40);
  else if (opts.priceRange === "40-70") q = q.gte("hourly_rate", 40).lte("hourly_rate", 70);
  else if (opts.priceRange === "above-70") q = q.gt("hourly_rate", 70);

  const avail = {};
  if (opts.availabilityDay && opts.availabilityDay !== "all") avail.days = [opts.availabilityDay];
  if (opts.availabilitySlot && opts.availabilitySlot !== "all") avail.slots = [opts.availabilitySlot];
  if (Object.keys(avail).length) q = q.contains("availability", avail);

  return q;
}

const SORT_COLUMNS = {
  rating: ["rating", false],
  "price-asc": ["hourly_rate", true],
  "price-desc": ["hourly_rate", false],
  reviews: ["review_count", false],
  featured: ["created_at", false],
};

function applySort(query, sortBy) {
  const [col, asc] = SORT_COLUMNS[sortBy] || SORT_COLUMNS.featured;
  return query.order(col, { ascending: asc }).order("id", { ascending: true });
}

function clientFilter(rows, opts) {
  return rows.filter((pro) => {
    if (pro.verificationStatus && pro.verificationStatus !== "approved") return false;
    if (pro.isActive === false) return false;

    if (opts.search && opts.search.trim()) {
      const q = opts.search.toLowerCase();
      const hay = [pro.name, pro.role, pro.category, pro.specialty, pro.location];
      if (!hay.some((v) => (v || "").toLowerCase().includes(q))) return false;
    }

    if (opts.category && opts.category !== "all") {
      if ((pro.category || "").toLowerCase() !== opts.category.toLowerCase()) return false;
    }

    if (opts.location && opts.location !== "all") {
      if (!(pro.location || "").toLowerCase().includes(opts.location.toLowerCase())) return false;
    }

    if (opts.availabilityDay && opts.availabilityDay !== "all") {
      const days = pro.availability?.days || [];
      if (!days.some((d) => d.toLowerCase() === opts.availabilityDay.toLowerCase())) return false;
    }

    if (opts.availabilitySlot && opts.availabilitySlot !== "all") {
      const slots = pro.availability?.slots || [];
      if (!slots.includes(opts.availabilitySlot)) return false;
    }

    if (opts.minRating > 0 && pro.rating < opts.minRating) return false;

    if (opts.minExperience > 0 && (pro.experienceYears || 0) < opts.minExperience) return false;

    if (opts.priceRange === "under-40" && pro.price >= 40) return false;
    if (opts.priceRange === "40-70" && (pro.price < 40 || pro.price > 70)) return false;
    if (opts.priceRange === "above-70" && pro.price <= 70) return false;

    return true;
  });
}

function clientSort(rows, sortBy) {
  const sorted = rows.slice();
  if (sortBy === "rating") sorted.sort((a, b) => b.rating - a.rating);
  else if (sortBy === "price-asc") sorted.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") sorted.sort((a, b) => b.price - a.price);
  else if (sortBy === "reviews") sorted.sort((a, b) => b.reviewCount - a.reviewCount);
  return sorted;
}

function fallbackList(seed, locations, opts, sortBy, page, pageSize) {
  const locMap = buildLocationMap(locations || DEFAULT_LOCATIONS);
  const all = (seed || []).map((pro) => {
    const p = withCoordinates(pro, locMap);
    return { ...p, ...summarizeReviews(p.reviews) };
  });
  const filtered = clientSort(clientFilter(all, opts), sortBy);
  const start = (page - 1) * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  };
}

// ponytail: mock seed fallback until supabase/schema.sql is applied and approved pros exist.
// Remove the seed fallback once the professionals table is populated in every environment.
export async function listProfessionals(options = {}) {
  const {
    search = "",
    category = "all",
    location = "all",
    minRating = 0,
    minExperience = 0,
    priceRange = "all",
    sortBy = "featured",
    availabilityDay = "all",
    availabilitySlot = "all",
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    seed = [],
    locations = null,
  } = options;

  const safePage = Math.max(1, Number(page) || 1);
  const safeSize = Math.max(1, Number(pageSize) || DEFAULT_PAGE_SIZE);
  const opts = {
    search,
    category,
    location,
    minRating,
    minExperience,
    priceRange,
    availabilityDay,
    availabilitySlot,
  };

  try {
    const supabase = createClient();
    let query = supabase
      .from("professionals")
      .select("*, services(*), credentials(*), reviews(*)", { count: "exact" })
      .eq("verification_status", "approved")
      .eq("is_active", true);

    query = applyFilters(query, opts);
    query = applySort(query, sortBy);

    const from = (safePage - 1) * safeSize;
    const { data, error, count } = await query.range(from, from + safeSize - 1);

    if (error) throw error;

    if (data && data.length > 0) {
      const locs = locations || (await listLocations());
      const locMap = buildLocationMap(locs);
      return {
        rows: data.map((row) => mapProfessional(row, locMap)),
        total: typeof count === "number" ? count : data.length,
        page: safePage,
        pageSize: safeSize,
      };
    }
  } catch {
    // fall through to the seed fallback below
  }

  return fallbackList(seed, locations, opts, sortBy, safePage, safeSize);
}
