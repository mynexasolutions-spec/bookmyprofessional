import { createClient } from "@/lib/supabase/client";
import { parseInclusions } from "@/lib/inclusions";

const EMPTY = { experienceYears: 0, specialty: "", city: "", pincode: "", category: "", services: [], credentials: [] };
// ponytail: empty profile on error keeps the vendor page alive while supabase/schema.sql is unapplied.
export async function getVendorProfile(professionalId) {
  if (!professionalId) return { ...EMPTY };
  try {
    const supabase = createClient();
    const BASE_COLUMNS =
      "experience_years, specialty, city, name, image_url, verification_status, hourly_rate, category";
    const [{ data: services }, { data: credentials }] = await Promise.all([
      supabase.from("services").select("*").eq("professional_id", professionalId).order("sort"),
      supabase.from("credentials").select("*").eq("professional_id", professionalId),
    ]);
    let { data: pro } = await supabase
      .from("professionals")
      .select(`${BASE_COLUMNS}, pincode`)
      .eq("id", professionalId)
      .maybeSingle();
    if (!pro) {
      // pincode column may not exist yet (schema not applied) — retry without it
      ({ data: pro } = await supabase
        .from("professionals")
        .select(BASE_COLUMNS)
        .eq("id", professionalId)
        .maybeSingle());
    }
    return {
      experienceYears: pro?.experience_years || 0,
      specialty: pro?.specialty || "",
      city: pro?.city || "",
      pincode: pro?.pincode || "",
      category: pro?.category || "",
      name: pro?.name || "",
      image_url: pro?.image_url || "",
      verification_status: pro?.verification_status || "pending",
      hourlyRate: Number(pro?.hourly_rate) || 0,
      services: services || [],
      credentials: credentials || [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export async function updateVendorBasics(professionalId, patch) {
  const supabase = createClient();
  const row = {
    experience_years: Number(patch.experienceYears) || 0,
    specialty: patch.specialty || "",
    city: patch.city || "",
    hourly_rate: Number(patch.hourlyRate) || 0,
  };
  let { error } = await supabase
    .from("professionals")
    .update({ ...row, pincode: patch.pincode || "" })
    .eq("id", professionalId);
  if (error) {
    // pincode column may not exist yet (schema not applied) — save the rest
    ({ error } = await supabase.from("professionals").update(row).eq("id", professionalId));
  }
  if (error) throw error;
  return patch;
}

export async function updateVendorSchedule(professionalId, availability) {
  const supabase = createClient();
  const { error } = await supabase
    .from("professionals")
    .update({ availability })
    .eq("id", professionalId);
  if (error) throw error;
  return availability;
}

export async function saveService(professionalId, service) {
  const row = {
    title: (service.title || "").trim(),
    description: service.description || "",
    price: Number(service.price) || 0,
    duration: service.duration || "",
  };
  if (!row.title) throw new Error("Service title is required.");
  const lists = {
    inclusions: parseInclusions(service.inclusions),
    exclusions: parseInclusions(service.exclusions),
  };

  const supabase = createClient();
  if (service.id) {
    let { error } = await supabase.from("services").update({ ...row, ...lists }).eq("id", service.id);
    if (error) {
      // inclusions column may not exist yet (schema not applied) — save the rest
      ({ error } = await supabase.from("services").update(row).eq("id", service.id));
    }
    if (error) throw error;
  } else {
    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", professionalId);
    let { error } = await supabase
      .from("services")
      .insert({ professional_id: professionalId, sort: count || 0, ...row, ...lists });
    if (error) {
      ({ error } = await supabase
        .from("services")
        .insert({ professional_id: professionalId, sort: count || 0, ...row }));
    }
    if (error) throw error;
  }
  return (await getVendorProfile(professionalId)).services;
}

export async function deleteService(professionalId, serviceId) {
  const supabase = createClient();
  const { error } = await supabase.from("services").delete().eq("id", serviceId);
  if (error) throw error;
  return (await getVendorProfile(professionalId)).services;
}

export async function saveCredential(professionalId, credential) {
  const row = {
    title: (credential.title || "").trim(),
    issuer: credential.issuer || "",
    year: credential.year || "",
  };
  if (!row.title) throw new Error("Qualification title is required.");

  const supabase = createClient();
  const { error } = await supabase
    .from("credentials")
    .insert({ professional_id: professionalId, ...row });
  if (error) throw error;
  return (await getVendorProfile(professionalId)).credentials;
}

export async function deleteCredential(professionalId, credentialId) {
  const supabase = createClient();
  const { error } = await supabase.from("credentials").delete().eq("id", credentialId);
  if (error) throw error;
  return (await getVendorProfile(professionalId)).credentials;
}
