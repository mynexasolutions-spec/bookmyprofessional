import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction, updateSettings } from "@/lib/data/admin";

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
      { error: "key must be 'commission' or 'cancellation'" },
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
