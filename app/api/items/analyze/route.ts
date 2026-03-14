import { NextResponse } from "next/server";

import { analyzeIntent } from "@/lib/ai";
import { STORAGE_BUCKET } from "@/lib/constants";
import { extractUrlMetadata } from "@/lib/metadata";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { analyzeItemPayloadSchema } from "@/lib/validation";
import type { ItemType } from "@/lib/types/items";

function normalizeReminderDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop() : "png";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const itemType = String(formData.get("itemType") ?? "") as ItemType;

  const parsed = analyzeItemPayloadSchema.safeParse({
    itemType,
    text: formData.get("text"),
    url: formData.get("url"),
    ocrText: formData.get("ocrText"),
    contextNote: formData.get("contextNote"),
    reminderDate: formData.get("reminderDate")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  let originalText: string | null = null;
  let originalUrl: string | null = null;
  let imagePath: string | null = null;
  let ocrText: string | null = null;
  let urlMetadata = null;

  try {
    if (parsed.data.itemType === "text") {
      originalText = parsed.data.text?.trim() ?? null;
    }

    if (parsed.data.itemType === "url") {
      originalUrl = parsed.data.url?.trim() ?? null;

      if (originalUrl) {
        urlMetadata = await extractUrlMetadata(originalUrl);
      }
    }

    if (parsed.data.itemType === "image") {
      const image = formData.get("image");

      if (!(image instanceof File) || image.size === 0) {
        return NextResponse.json(
          { error: "Please upload an image before continuing." },
          { status: 400 }
        );
      }

      const bytes = Buffer.from(await image.arrayBuffer());
      const fileExtension = getFileExtension(image.name);
      imagePath = `${user.id}/${crypto.randomUUID()}.${fileExtension}`;
      const admin = createSupabaseAdminClient();

      const { error: uploadError } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(imagePath, bytes, {
          contentType: image.type,
          upsert: false
        });

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
      }

      ocrText = parsed.data.ocrText?.trim() || null;
      originalText = parsed.data.contextNote?.trim() || null;
    }

    const analysis = await analyzeIntent({
      itemType: parsed.data.itemType,
      originalText,
      originalUrl,
      ocrText,
      contextNote: parsed.data.contextNote?.trim() || null,
      urlMetadata
    });

    return NextResponse.json({
      draft: {
        itemType: parsed.data.itemType,
        originalText,
        originalUrl,
        imagePath,
        ocrText,
        reminderDate: normalizeReminderDate(parsed.data.reminderDate)
      },
      analysis
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the item."
      },
      { status: 500 }
    );
  }
}
