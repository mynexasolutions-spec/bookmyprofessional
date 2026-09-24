import { createClient } from "@/lib/supabase/client";

const EMPTY = { experienceYears: 0, specialty: "", city: "", services: [], credentials: [] };
// ponytail: empty profile on error keeps the vendor page alive while supabase/schema.sql is unapplied.
export async function getVendorProfile(professionalId) {
  if (!professionalId) return { ...EMPTY };
  try {
    const supabase = createClient();
    const [{ data: pro }, { data: services }, { data: credentials }] = await Promise.all([
      supabase
        .from("professionals")
        .select("experience_years, specialty, city, name, image_url, verification_status, hourly_rate")
        .eq("id", professionalId)
        .maybeSingle(),
      supabase.from("services").select("*").eq("professional_id", professionalId).order("sort"),
      supabase.from("credentials").select("*").eq("professional_id", professionalId),
    ]);
    return {
      experienceYears: pro?.experience_years || 0,
      specialty: pro?.specialty || "",
      city: pro?.city || "",
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
  const { error } = await supabase
    .from("professionals")
    .update({
      experience_years: Number(patch.experienceYears) || 0,
      specialty: patch.specialty || "",
      city: patch.city || "",
      hourly_rate: Number(patch.hourlyRate) || 0,
    })
    .eq("id", professionalId);
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

  const supabase = createClient();
  if (service.id) {
    const { error } = await supabase.from("services").update(row).eq("id", service.id);
    if (error) throw error;
  } else {
    const { count } = await supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("professional_id", professionalId);
    const { error } = await supabase
      .from("services")
      .insert({ professional_id: professionalId, sort: count || 0, ...row });
    if (error) throw error;
  }
  return (await getVendorProfile(professionalId)).services;
}

export async function deleteService(professionalId, serviceId) {
  if (DEMO_MODE) {
    const demo = readDemo();
    demo.services = demo.services.filter((s) => s.id !== serviceId);
    writeDemo(demo);
    return demo.services;
  }
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

  if (DEMO_MODE) {
    const demo = readDemo();
    demo.credentials = [...demo.credentials, { id: `demo-cred-${Date.now()}`, professional_id: professionalId, ...row }];
    writeDemo(demo);
    return demo.credentials;
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("credentials")
    .insert({ professional_id: professionalId, ...row });
  if (error) throw error;
  return (await getVendorProfile(professionalId)).credentials;
}

export async function deleteCredential(professionalId, credentialId) {
  if (DEMO_MODE) {
    const demo = readDemo();
    demo.credentials = demo.credentials.filter((c) => c.id !== credentialId);
    writeDemo(demo);
    return demo.credentials;
  }
  const supabase = createClient();
  const { error } = await supabase.from("credentials").delete().eq("id", credentialId);
  if (error) throw error;
  return (await getVendorProfile(professionalId)).credentials;
}
