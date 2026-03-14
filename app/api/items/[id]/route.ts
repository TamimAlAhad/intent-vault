import { NextResponse } from "next/server";

import { STORAGE_BUCKET } from "@/lib/constants";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { updateItemSchema } from "@/lib/validation";

function normalizeReminderDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const updatePayload: Database["public"]["Tables"]["saved_items"]["Update"] = {
    ai_title: parsed.data.aiTitle,
    ai_summary: parsed.data.aiSummary,
    detected_intent: parsed.data.detectedIntent,
    category: parsed.data.category ?? null,
    suggested_action: parsed.data.suggestedAction ?? null,
    reminder_date: normalizeReminderDate(parsed.data.reminderDate)
  };

  const { error } = await (supabase.from("saved_items") as any)
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: item, error: fetchError } = await (supabase.from("saved_items") as any)
    .select("image_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }

  const { error: deleteError } = await supabase
    .from("saved_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const imagePath = (item as { image_path: string | null } | null)?.image_path;

  if (imagePath) {
    try {
      const admin = createSupabaseAdminClient();
      await admin.storage.from(STORAGE_BUCKET).remove([imagePath]);
    } catch {
      // Best effort cleanup. The item row is already deleted.
    }
  }

  return NextResponse.json({ ok: true });
}
