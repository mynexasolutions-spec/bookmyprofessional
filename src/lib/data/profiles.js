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

  // Server-side pincode validation when pincode is being saved
  if ("pincode" in patch && patch.pincode) {
    const cleanPin = String(patch.pincode).replace(/\D/g, "").slice(0, 6);
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      throw Object.assign(
        new Error("Pincode must be exactly 6 digits and cannot start with 0."),
        { isUserFacing: true, field: "pincode" }
      );
    }
    // Cross-check city when both are present
    if (patch.city?.trim()) {
      try {
        const origin = typeof window !== "undefined"
          ? window.location.origin
          : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
        const res = await fetch(
          `${origin}/api/location/verify-pincode?pincode=${cleanPin}&city=${encodeURIComponent(patch.city.trim())}`,
          { headers: { Accept: "application/json" } }
        );
        const data = await res.json();
        if (data?.cityMismatch) {
          throw Object.assign(new Error(data.error || "City does not match pincode."), {
            isUserFacing: true, field: "city",
          });
        }
        if (!data?.valid && !data?.warning) {
          throw Object.assign(
            new Error(data?.error || `Invalid pincode: ${cleanPin} is not a recognised Indian PIN code.`),
            { isUserFacing: true, field: "pincode" }
          );
        }
      } catch (e) {
        if (e?.isUserFacing) throw e;
        console.warn("[updateProfile] Postal API unreachable, skipping city check:", e?.message);
      }
    }
    patch = { ...patch, pincode: cleanPin };
  }

  const run = (fields) =>
    supabase.from("profiles").update(fields).eq("id", userId).select().maybeSingle();

  let { data, error } = await run(patch);

  if (error && patch && "pincode" in patch) {
    // ponytail: pincode column may not exist yet (schema not applied) — retry without it.
    const { pincode, ...rest } = patch;
    ({ data, error } = await run(rest));
  }

  if (error) throw error;

  // The public professional name lives in its own column; keep it aligned with the account name.
  if (patch?.full_name !== undefined) {
    try {
      await supabase.from("professionals").update({ name: patch.full_name }).eq("id", userId);
    } catch {
      // ponytail: best-effort — profiles_sync_pro_name trigger covers paths this misses.
    }
  }

  return data;
}

