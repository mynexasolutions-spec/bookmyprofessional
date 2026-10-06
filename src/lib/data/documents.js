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
    if (!data) return [];

    // Deduplicate: Keep only the latest document per type so duplicates are never shown
    const latestMap = new Map();
    for (const doc of data) {
      if (!latestMap.has(doc.type)) {
        latestMap.set(doc.type, doc);
      }
    }
    return Array.from(latestMap.values());
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

  // Check if a document of this type already exists for the professional
  const { data: existingDocs } = await supabase
    .from("documents")
    .select("id, file_path")
    .eq("professional_id", professionalId)
    .eq("type", type)
    .order("created_at", { ascending: false });

  let resultDoc = null;

  if (existingDocs && existingDocs.length > 0) {
    const primaryDoc = existingDocs[0];
    // Update existing document to pending with new file path — do not create duplicate
    const { data: updated, error: updateError } = await supabase
      .from("documents")
      .update({
        file_path: path,
        status: "pending",
        created_at: new Date().toISOString(),
        reviewer_id: null,
        reviewed_at: null,
      })
      .eq("id", primaryDoc.id)
      .select()
      .single();

    if (updateError) throw updateError;
    resultDoc = updated;

    // Remove any older duplicate records of the same type if they exist
    if (existingDocs.length > 1) {
      const extraIds = existingDocs.slice(1).map((d) => d.id);
      await supabase.from("documents").delete().in("id", extraIds);
    }
  } else {
    // First time uploading this document type
    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        professional_id: professionalId,
        type,
        file_path: path,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) throw insertError;
    resultDoc = inserted;
  }

  // Re-calculate overall verification status for the professional
  try {
    const { data: all } = await supabase
      .from("documents")
      .select("id, type, status, created_at")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false });

    const latestByType = new Map();
    for (const doc of all || []) {
      if (!latestByType.has(doc.type)) {
        latestByType.set(doc.type, doc);
      }
    }
    const latestDocs = Array.from(latestByType.values());
    let verificationStatus = "pending";
    if (latestDocs.length > 0 && latestDocs.every((d) => d.status === "approved")) {
      verificationStatus = "approved";
    } else if (latestDocs.some((d) => d.status === "rejected")) {
      verificationStatus = "rejected";
    }

    await supabase
      .from("professionals")
      .update({
        verification_status: verificationStatus,
        verified: verificationStatus === "approved",
      })
      .eq("id", professionalId);
  } catch {
    // best-effort
  }

  return resultDoc;
}

export async function reviewDocument(documentId, professionalId, status, reviewerId, client) {
  const supabase = client || createClient();

  const { data: currentDoc, error: docError } = await supabase
    .from("documents")
    .update({
      status,
      reviewer_id: reviewerId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .select("type")
    .single();
    
  if (docError) throw docError;

  // Clean up any older duplicate documents of the same type for this professional
  if (currentDoc?.type) {
    try {
      const { data: typeDocs } = await supabase
        .from("documents")
        .select("id")
        .eq("professional_id", professionalId)
        .eq("type", currentDoc.type)
        .neq("id", documentId);

      if (typeDocs && typeDocs.length > 0) {
        const extraIds = typeDocs.map((d) => d.id);
        await supabase.from("documents").delete().in("id", extraIds);
      }
    } catch {
      // best-effort
    }
  }

  let all = [];
  try {
    const { data: docs, error: listError } = await supabase
      .from("documents")
      .select("id, type, status, created_at")
      .eq("professional_id", professionalId)
      .order("created_at", { ascending: false });
    if (!listError && docs) all = docs;
  } catch {
    // Ignore listError
  }

  // Group by document type to evaluate the latest document status per type
  const latestByType = new Map();
  for (const doc of all) {
    if (!latestByType.has(doc.type)) {
      latestByType.set(doc.type, doc);
    }
  }

  const latestDocs = Array.from(latestByType.values());
  let verificationStatus = "pending";
  if (latestDocs.length > 0 && latestDocs.every((d) => d.status === "approved")) {
    verificationStatus = "approved";
  } else if (latestDocs.some((d) => d.status === "rejected")) {
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
