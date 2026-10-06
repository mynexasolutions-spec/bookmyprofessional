import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude are required." },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: "Invalid coordinates provided." },
        { status: 400 }
      );
    }

    // 1. Primary reverse geocoding via BigDataCloud client API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
        { signal: controller.signal }
      );

      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || "";
        const state = data.principalSubdivision || "";
        const country = data.countryName || "India";

        // Try extracting district from administrative array
        let district = "";
        if (Array.isArray(data.localityInfo?.administrative)) {
          const districtEntry = data.localityInfo.administrative.find(
            (adm) => adm.description?.toLowerCase().includes("district") || adm.name?.toLowerCase().includes("district")
          );
          district = districtEntry ? districtEntry.name.replace(/\s+district/i, "").trim() : "";
        }
        if (!district) district = city;

        return NextResponse.json({
          success: true,
          latitude,
          longitude,
          city,
          district,
          state,
          country,
          formatted: `${city || district}, ${state}`,
        });
      }
    } catch (primaryErr) {
      console.warn("[Reverse Geocode] Primary API failed, trying fallback:", primaryErr?.message);
    } finally {
      clearTimeout(timeout);
    }

    // 2. Fallback to OpenStreetMap Nominatim
    try {
      const fallbackRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "BookMyProfessional/1.0 (contact@bookmyprofessional.com)",
            Accept: "application/json",
          },
        }
      );

      if (fallbackRes.ok) {
        const osmData = await fallbackRes.json();
        const addr = osmData.address || {};
        const city = addr.city || addr.town || addr.village || addr.suburb || "";
        const district = (addr.state_district || addr.county || city).replace(/\s+district/i, "").trim();
        const state = addr.state || "";
        const country = addr.country || "India";

        return NextResponse.json({
          success: true,
          latitude,
          longitude,
          city,
          district,
          state,
          country,
          formatted: `${city || district}, ${state}`,
        });
      }
    } catch (fallbackErr) {
      console.error("[Reverse Geocode] Fallback API also failed:", fallbackErr?.message);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Unable to detect exact address from coordinates.",
      },
      { status: 502 }
    );
  } catch (error) {
    console.error("[Reverse Geocode] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
