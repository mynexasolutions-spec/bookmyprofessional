import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queryProfessionals } from "@/lib/data/professionals";

export async function GET(request) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "all";
    const location = searchParams.get("location") || "all";
    const pincode = searchParams.get("pincode") || "";
    const minRating = Number(searchParams.get("minRating")) || 0;
    const minExperience = Number(searchParams.get("minExperience")) || 0;
    const priceRange = searchParams.get("priceRange") || "all";
    const sortBy = searchParams.get("sortBy") || "featured";
    const availabilityDay = searchParams.get("availabilityDay") || "all";
    const availabilitySlot = searchParams.get("availabilitySlot") || "all";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 8);
    const nearLat = searchParams.get("nearLat");
    const nearLng = searchParams.get("nearLng");
    const near = nearLat && nearLng ? { latitude: Number(nearLat), longitude: Number(nearLng) } : null;

    const result = await queryProfessionals(supabase, {
      search,
      category,
      location,
      pincode,
      minRating,
      minExperience,
      priceRange,
      sortBy,
      availabilityDay,
      availabilitySlot,
      page,
      pageSize,
      near,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Error in /api/professionals:", err);
    return NextResponse.json({ error: "Failed to fetch professionals", rows: [], total: 0 }, { status: 500 });
  }
}
