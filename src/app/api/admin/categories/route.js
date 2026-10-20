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
  if (!name) return NextResponse.json({ error: "Category or subcategory name is required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const parentId = body.parent_id || null;

    // Validate duplicates
    if (parentId) {
      // Check parent exists
      const { data: parent } = await supabase
        .from("categories")
        .select("id, name")
        .eq("id", parentId)
        .maybeSingle();

      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }

      // Check if subcategory with same name already exists under this parent
      const { data: dup } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", parentId)
        .ilike("name", name)
        .maybeSingle();

      if (dup) {
        return NextResponse.json(
          { error: `A subcategory named "${name}" already exists under ${parent.name}.` },
          { status: 400 }
        );
      }
    } else {
      // Check if top-level category already exists
      const { data: dup } = await supabase
        .from("categories")
        .select("id")
        .is("parent_id", null)
        .ilike("name", name)
        .maybeSingle();

      if (dup) {
        return NextResponse.json(
          { error: `A top-level category named "${name}" already exists.` },
          { status: 400 }
        );
      }
    }

    // Blank sort -> append after the highest existing sort instead of defaulting to 0.
    let sort = body.sort;
    if (sort === "" || sort === null || sort === undefined) {
      let query = supabase.from("categories").select("sort").order("sort", { ascending: false }).limit(1);
      if (parentId) query = query.eq("parent_id", parentId);
      else query = query.is("parent_id", null);

      const { data: rows } = await query;
      sort = (rows?.[0]?.sort ?? 0) + 1;
    }

    const category = await createCategory(supabase, {
      name,
      icon: body.icon,
      sort,
      active: body.active,
      parent_id: parentId,
      inclusions: body.inclusions,
      exclusions: body.exclusions,
    });

    await logAdminAction(
      {
        action: parentId ? "subcategory.create" : "category.create",
        entity: "categories",
        entityId: category?.id,
        meta: { name, parent_id: parentId },
      },
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

    // Fetch existing category row to check current values
    const { data: current, error: curError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (curError || !current) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const newName = typeof patch.name === "string" ? patch.name.trim() : current.name;
    const targetParentId = patch.parent_id !== undefined ? (patch.parent_id || null) : current.parent_id;

    // Duplicate validation if name or parent changed
    if (newName !== current.name || targetParentId !== current.parent_id) {
      let dupQuery = supabase
        .from("categories")
        .select("id")
        .neq("id", id)
        .ilike("name", newName);

      if (targetParentId) {
        dupQuery = dupQuery.eq("parent_id", targetParentId);
      } else {
        dupQuery = dupQuery.is("parent_id", null);
      }

      const { data: dup } = await dupQuery.maybeSingle();
      if (dup) {
        return NextResponse.json(
          { error: `Another category/subcategory named "${newName}" already exists under this scope.` },
          { status: 400 }
        );
      }
    }

    const updatedCategory = await updateCategory(supabase, id, { ...patch, name: newName });

    // Protect existing professional profiles: sync renamed category/subcategory
    if (newName !== current.name) {
      if (current.parent_id) {
        // Renamed a subcategory: update all professionals referencing the old subcategory
        await supabase
          .from("professionals")
          .update({ subcategory: newName })
          .eq("subcategory", current.name);

        // Also update role_title if it was specifically set to the old subcategory name
        await supabase
          .from("professionals")
          .update({ role_title: newName })
          .eq("role_title", current.name);
      } else {
        // Renamed a parent category: update professionals referencing the old category
        await supabase
          .from("professionals")
          .update({ category: newName })
          .eq("category", current.name);
      }
    }

    await logAdminAction(
      { action: "category.update", entity: "categories", entityId: id, meta: patch },
      supabase
    );
    return NextResponse.json({ ok: true, category: updatedCategory });
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

    // Fetch existing category
    const { data: current, error: curError } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (curError || !current) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // 1. Check if category has child subcategories
    if (!current.parent_id) {
      const { count: childCount } = await supabase
        .from("categories")
        .select("id", { count: "exact", head: true })
        .eq("parent_id", id);

      if (childCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete category "${current.name}" because it has ${childCount} subcategory(ies). Delete or reassign its subcategories first.`,
          },
          { status: 400 }
        );
      }

      // Check if any professionals are in this category
      const { count: proCount } = await supabase
        .from("professionals")
        .select("id", { count: "exact", head: true })
        .eq("category", current.name);

      if (proCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete category "${current.name}" because it is currently assigned to ${proCount} professional(s). Reassign them first to protect profile data.`,
          },
          { status: 400 }
        );
      }
    } else {
      // 2. Subcategory: check if any professionals are using this subcategory
      const { count: proCount } = await supabase
        .from("professionals")
        .select("id", { count: "exact", head: true })
        .eq("subcategory", current.name);

      if (proCount > 0) {
        return NextResponse.json(
          {
            error: `Cannot delete subcategory "${current.name}" because it is assigned to ${proCount} professional(s). Reassign them first to protect profile data.`,
          },
          { status: 400 }
        );
      }
    }

    await deleteCategory(supabase, id);
    await logAdminAction(
      {
        action: current.parent_id ? "subcategory.delete" : "category.delete",
        entity: "categories",
        entityId: id,
        meta: { name: current.name },
      },
      supabase
    );
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json({ error: error?.message || "Delete failed" }, { status: 500 });
  }
}
