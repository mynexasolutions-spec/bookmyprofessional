import { createClient } from "@/lib/supabase/client";

// ponytail: no browser geolocation prompt — the hero/manual location input is enough for now.
// Add navigator.geolocation + reverse lookup only when "use my location" is an actual requirement.

// ponytail: seed list used until supabase/schema.sql is applied and the locations table is populated.
// Remove once every environment has location rows.
export const DEFAULT_LOCATIONS = [
  { id: "Mumbai", label: "Mumbai, India", city: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777 },
  { id: "Delhi", label: "Delhi, India", city: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { id: "Bangalore", label: "Bangalore, India", city: "Bangalore", country: "India", latitude: 12.9716, longitude: 77.5946 },
  { id: "Hyderabad", label: "Hyderabad, India", city: "Hyderabad", country: "India", latitude: 17.385, longitude: 78.4867 },
  { id: "Pune", label: "Pune, India", city: "Pune", country: "India", latitude: 18.5204, longitude: 73.8567 },
];

export async function listLocations() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("locations")
      .select("city, country, latitude, longitude")
      .order("city", { ascending: true });

    if (error || !data || data.length === 0) return DEFAULT_LOCATIONS;

    return data.map((row) => ({
      id: row.city,
      label: `${row.city}, ${row.country}`,
      city: row.city,
      country: row.country,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  } catch {
    return DEFAULT_LOCATIONS;
  }
}
