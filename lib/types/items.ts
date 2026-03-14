import { z } from "zod";

import { INTENTS, ITEM_TYPES } from "@/lib/constants";
import type { Database } from "@/lib/types/database";

export type SavedItem = Database["public"]["Tables"]["saved_items"]["Row"];
export type ItemType = (typeof ITEM_TYPES)[number];
export type Intent = (typeof INTENTS)[number];

export interface UrlMetadata {
  title: string | null;
  description: string | null;
  siteName: string | null;
  textSnippet: string | null;
}

export const analysisResultSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(320),
  intent: z.enum(INTENTS),
  category: z.string().min(1).max(40),
  suggested_action: z.string().min(1).max(160)
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export interface ItemWithPreview extends SavedItem {
  imageUrl: string | null;
}
