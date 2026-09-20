import { createClient } from "@/lib/supabase/client";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_KEY = "bmp_demo_vendor_profile";

const EMPTY = { experienceYears: 0, specialty: "", city: "", services: [], credentials: [] };

// ponytail: demo mode keeps the vendor's services/qualifications in one localStorage blob, not per-user.
function readDemo() {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    return { ...EMPTY, ...JSON.parse(window.localStorage.getItem(DEMO_KEY) || "{}") };
  } catch {
    return { ...EMPTY };
  }
}

function writeDemo(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

// ponytail: empty profile on error keeps the vendor page alive while supabase/schema.sql is unapplied.
export async function getVendorProfile(professionalId) {
  if (!professionalId) return { ...EMPTY };
  if (DEMO_MODE) return readDemo();

  try {
    const supabase = createClient();
    const [{ data: pro }, { data: services }, { data: credentials }] = await Promise.all([
      supabase
        .from("professionals")
        .select("experience_years, specialty, city")
        .eq("id", professionalId)
        .maybeSingle(),
      supabase.from("services").select("*").eq("professional_id", professionalId).order("sort"),
      supabase.from("credentials").select("*").eq("professional_id", professionalId),
    ]);
    return {
      experienceYears: pro?.experience_years || 0,
      specialty: pro?.specialty || "",
      city: pro?.city || "",
      services: services || [],
      credentials: credentials || [],
    };
  } catch {
    return { ...EMPTY };
  }
}

export async function updateVendorBasics(professionalId, patch) {
  if (DEMO_MODE) {
    writeDemo({ ...readDemo(), ...patch });
    return { ...readDemo() };
  }
  const supabase = createClient();
  const { error } = await supabase
    .from("professionals")
    .update({
      experience_years: Number(patch.experienceYears) || 0,
      specialty: patch.specialty || "",
      city: patch.city || "",
    })
    .eq("id", professionalId);
  if (error) throw error;
  return patch;
}

export async function saveService(professionalId, service) {
  const row = {
    title: (service.title || "").trim(),
    description: service.description || "",
    price: Number(service.price) || 0,
    duration: service.duration || "",
  };
  if (!row.title) throw new Error("Service title is required.");

  if (DEMO_MODE) {
    const demo = readDemo();
    if (service.id) {
      demo.services = demo.services.map((s) => (s.id === service.id ? { ...s, ...row } : s));
    } else {
      demo.services = [...demo.services, { id: `demo-srv-${Date.now()}`, professional_id: professionalId, sort: demo.services.length, ...row }];
    }
    writeDemo(demo);
    return demo.services;
  }

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
