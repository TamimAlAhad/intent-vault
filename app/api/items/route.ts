import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { saveItemSchema } from "@/lib/validation";

function normalizeReminderDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = saveItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const insertPayload: Database["public"]["Tables"]["saved_items"]["Insert"] = {
    user_id: user.id,
    item_type: parsed.data.itemType,
    original_text: parsed.data.originalText ?? null,
    original_url: parsed.data.originalUrl ?? null,
    image_path: parsed.data.imagePath ?? null,
    ocr_text: parsed.data.ocrText ?? null,
    ai_title: parsed.data.aiTitle,
    ai_summary: parsed.data.aiSummary,
    detected_intent: parsed.data.detectedIntent,
    category: parsed.data.category ?? null,
    suggested_action: parsed.data.suggestedAction ?? null,
    reminder_date: normalizeReminderDate(parsed.data.reminderDate)
  };

  const { data, error } = await (supabase.from("saved_items") as any)
    .insert(insertPayload)
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "The item could not be saved." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
