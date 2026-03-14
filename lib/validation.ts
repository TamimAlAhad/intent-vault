import { z } from "zod";

import { INTENTS, ITEM_TYPES } from "@/lib/constants";
import { analysisResultSchema } from "@/lib/types/items";

export function normalizeOptionalStringInput(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

export function normalizeNullableStringInput(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized || null;
}

export function normalizeRequiredStringInput(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

const optionalInputString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => normalizeOptionalStringInput(value));

const nullableString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => normalizeNullableStringInput(value));

function requiredString(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()])
    .transform((value) => normalizeRequiredStringInput(value))
    .pipe(z.string().min(1).max(max));
}

const intentInput = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => normalizeRequiredStringInput(value))
  .pipe(z.enum(INTENTS));

export const analyzeItemPayloadSchema = z
  .object({
    itemType: z.enum(ITEM_TYPES),
    text: optionalInputString,
    url: optionalInputString,
    ocrText: optionalInputString,
    contextNote: optionalInputString,
    reminderDate: optionalInputString
  })
  .superRefine((value, ctx) => {
    if (value.itemType === "text" && !value.text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["text"],
        message: "Please enter a note before continuing."
      });
    }

    if (value.itemType === "url") {
      if (!value.url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["url"],
          message: "Please paste a URL before continuing."
        });
        return;
      }

      try {
        new URL(value.url);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["url"],
          message: "Please provide a valid URL."
        });
      }
    }
  });

export const saveItemSchema = z.object({
  itemType: z.enum(ITEM_TYPES),
  originalText: nullableString,
  originalUrl: nullableString,
  imagePath: nullableString,
  ocrText: nullableString,
  aiTitle: requiredString(120),
  aiSummary: requiredString(320),
  detectedIntent: intentInput,
  category: nullableString,
  suggestedAction: nullableString,
  reminderDate: nullableString
});

export const updateItemSchema = z.object({
  aiTitle: requiredString(120),
  aiSummary: requiredString(320),
  detectedIntent: intentInput,
  category: nullableString,
  suggestedAction: nullableString,
  reminderDate: nullableString
});

export const parsedAnalysisSchema = analysisResultSchema;
