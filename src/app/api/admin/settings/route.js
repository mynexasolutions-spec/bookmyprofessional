import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateSettings } from "@/lib/data/admin";

const cleanText = (value, max) => String(value ?? "").trim().slice(0, max);

const cleanStatRows = (rows, withDetail) => {
  if (!Array.isArray(rows)) return null;
  return rows.slice(0, 8).map((row) =>
    withDetail
      ? {
          value: cleanText(row?.value, 40),
          label: cleanText(row?.label, 60),
          detail: cleanText(row?.detail, 120),
        }
      : { value: cleanText(row?.value, 40), label: cleanText(row?.label, 60) }
  );
};

const SHAPES = {
  commission: (value) => {
    const rate = Number(value?.rate);
    if (!Number.isFinite(rate) || rate < 0 || rate > 1) return null;
    return { rate };
  },
  cancellation: (value) => {
    const hours = Number(value?.window_hours);
    if (!Number.isFinite(hours) || hours < 0) return null;
    return { window_hours: hours };
  },
  marketing: (value) => {
    if (!value || typeof value !== "object") return null;
    const home = cleanStatRows(value.home, false);
    const about = cleanStatRows(value.about, true);
    if (!home || !about) return null;
    return { home, about, ctaCustomers: cleanText(value.ctaCustomers, 20) };
  },
  testimonials: (value) => {
    if (!Array.isArray(value)) return null;
    return value.slice(0, 12).map((t) => ({
      name: cleanText(t?.name, 60),
      location: cleanText(t?.location, 80),
      comment: cleanText(t?.comment, 400),
      avatar: cleanText(t?.avatar, 500),
      rating: Math.min(5, Math.max(1, Number(t?.rating) || 5)),
    }));
  },
  social: (value) => {
    if (!value || typeof value !== "object") return null;
    const out = {};
    for (const key of ["facebook", "instagram", "twitter", "linkedin", "youtube"]) {
      out[key] = cleanText(value[key], 300);
    }
    return out;
  },
};

export async function POST(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { key, value } = body || {};
  const shape = SHAPES[key];
  if (!shape) {
    return NextResponse.json(
      { error: `key must be one of: ${Object.keys(SHAPES).join(", ")}` },
      { status: 400 }
    );
  }

  const normalized = shape(value);
  if (!normalized) {
    return NextResponse.json({ error: `Invalid value for '${key}'` }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const setting = await updateSettings(supabase, key, normalized);
    await logAdminAction(
      { action: `settings.${key}`, entity: "settings", entityId: key, meta: normalized },
      supabase
    );
    return NextResponse.json({ ok: true, setting });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Settings update failed" }, { status: 500 });
  }
}
