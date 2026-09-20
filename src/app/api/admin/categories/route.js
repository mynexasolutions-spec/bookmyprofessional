import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-session";
import { createAdminClient } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/data/admin";
import { createCategory, updateCategory, deleteCategory } from "@/lib/data/categories";

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const category = await createCategory(supabase, {
      name,
      icon: body.icon,
      sort: body.sort,
      active: body.active,
    });
    await logAdminAction(
      { action: "category.create", entity: "categories", entityId: category?.id, meta: { name } },
      supabase
    );
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Create failed" }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const category = await updateCategory(supabase, id, patch);
    await logAdminAction(
      { action: "category.update", entity: "categories", entityId: id, meta: patch },
      supabase
    );
    return NextResponse.json({ ok: true, category });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readBody(request);
  const id = body?.id || new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    await deleteCategory(supabase, id);
    await logAdminAction({ action: "category.delete", entity: "categories", entityId: id }, supabase);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
