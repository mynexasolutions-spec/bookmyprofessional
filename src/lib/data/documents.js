import { createClient } from "@/lib/supabase/client";

const BUCKET = "verification-docs";


function safeFileName(name) {
  return (name || "document").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ponytail: empty list on error keeps the vendor page alive while supabase/schema.sql is unapplied.
export async function listMyDocuments(professionalId, client) {
  if (!professionalId) return [];

  try {
    const supabase = client || createClient();
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function uploadDocument(professionalId, file, type, client) {

  const supabase = client || createClient();
  const path = `${professionalId}/${Date.now()}-${safeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false });
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      professional_id: professionalId,
      type,
      file_path: path,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reviewDocument(documentId, professionalId, status, reviewerId, client) {
  const supabase = client || createClient();

  const { error: docError } = await supabase
    .from("documents")
    .update({
      status,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", documentId);
    
  if (docError) throw docError;

  let all = [];
  try {
    const { data: docs, error: listError } = await supabase
      .from("documents")
      .select("status")
      .eq("professional_id", professionalId);
    if (!listError && docs) all = docs;
  } catch {
    // Ignore listError
  }

  let verificationStatus = "pending";
  if (all.length > 0 && all.every((d) => d.status === "approved")) {
    verificationStatus = "approved";
  } else if (all.some((d) => d.status === "rejected")) {
    verificationStatus = "rejected";
  }

  const { error: proError } = await supabase
    .from("professionals")
    .update({
      verification_status: verificationStatus,
      verified: verificationStatus === "approved",
    })
    .eq("id", professionalId);
  if (proError) throw proError;

  return { documentId, professionalId, verificationStatus };
}
