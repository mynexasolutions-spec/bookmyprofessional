import { createClient } from "@/lib/supabase/client";

const BUCKET = "verification-docs";
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const DEMO_KEY = "bmp_demo_documents";

// ponytail: demo mode keeps uploaded documents in localStorage — one shared list, not per-user.
function readDemoDocs() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DEMO_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeDemoDocs(list) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DEMO_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / privacy-mode errors
  }
}

function safeFileName(name) {
  return (name || "document").replace(/[^a-zA-Z0-9._-]/g, "_");
}

// ponytail: empty list on error keeps the vendor page alive while supabase/schema.sql is unapplied.
export async function listMyDocuments(professionalId, client) {
  if (!professionalId) return [];
  if (DEMO_MODE) return readDemoDocs();

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
  if (DEMO_MODE) {
    const doc = {
      id: `demo-doc-${Date.now()}`,
      professional_id: professionalId,
      type,
      file_path: `${professionalId}/${safeFileName(file?.name || "document.pdf")}`,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    writeDemoDocs([doc, ...readDemoDocs()]);
    return doc;
  }

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

  let dbError = null;
  try {
    const { error: docError } = await supabase
      .from("documents")
      .update({
        status,
        reviewer_id: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", documentId);
    if (docError) dbError = docError;
  } catch (err) {
    dbError = err;
  }

  // Update local JSON fallback
  let localFound = false;
  try {
    const fs = require("fs");
    const path = require("path");
    const dbPath = path.join(process.cwd(), "data", "documents.json");
    if (fs.existsSync(dbPath)) {
      const documents = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const idx = documents.findIndex((d) => d.id === documentId);
      if (idx >= 0) {
        documents[idx].status = status;
        documents[idx].reviewed_at = new Date().toISOString();
        documents[idx].reviewer_id = reviewerId;
        fs.writeFileSync(dbPath, JSON.stringify(documents, null, 2));
        localFound = true;
      }
    }
  } catch (e) {
    console.error("Local document update failed:", e);
  }

  if (dbError && !localFound) throw dbError;

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
