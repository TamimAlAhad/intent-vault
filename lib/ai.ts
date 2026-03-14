import { GEMINI_MODEL, INTENTS } from "@/lib/constants";
import { parsedAnalysisSchema } from "@/lib/validation";
import type { AnalysisResult, ItemType, UrlMetadata } from "@/lib/types/items";

interface AnalyzeIntentInput {
  itemType: ItemType;
  originalText?: string | null;
  originalUrl?: string | null;
  ocrText?: string | null;
  contextNote?: string | null;
  urlMetadata?: UrlMetadata | null;
}

const GEMINI_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "A concise title for what the user saved."
    },
    summary: {
      type: "string",
      description: "A short summary of why the user likely saved this item."
    },
    intent: {
      type: "string",
      enum: [...INTENTS],
      description: "The user's likely intent. Must match one of the allowed intents exactly."
    },
    category: {
      type: "string",
      description: "A practical top-level category for this saved item."
    },
    suggested_action: {
      type: "string",
      description: "A useful next step the user might take later."
    }
  },
  required: ["title", "summary", "intent", "category", "suggested_action"]
} as const;

function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || null;
}

function normalizeWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function getNonEmptyString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = normalizeWhitespace(value);
  return normalized || null;
}

function guessIntent(source: string) {
  const value = source.toLowerCase();

  if (/(buy|price|cart|shop|purchase|deal|order)/.test(value)) {
    return { intent: "Buy Later", category: "Shopping", suggested_action: "Compare options before buying." } as const;
  }

  if (/(watch|youtube|trailer|video|movie|episode)/.test(value)) {
    return { intent: "Watch Later", category: "Media", suggested_action: "Set aside time to watch it later." } as const;
  }

  if (/(read|article|blog|thread|newsletter|book)/.test(value)) {
    return { intent: "Read Later", category: "Reading", suggested_action: "Save a reading slot for this item." } as const;
  }

  if (/(restaurant|cafe|visit|place|hotel|flight|map)/.test(value)) {
    return { intent: "Visit Later", category: "Travel", suggested_action: "Revisit the location when planning." } as const;
  }

  if (/(reply|respond|email|message|follow up)/.test(value)) {
    return { intent: "Reply Later", category: "Communication", suggested_action: "Follow up while the context is still fresh." } as const;
  }

  if (/(research|compare|learn|investigate|review)/.test(value)) {
    return { intent: "Research Later", category: "Research", suggested_action: "Collect a few supporting sources next." } as const;
  }

  if (/(idea|inspiration|moodboard|concept|brand)/.test(value)) {
    return { intent: "Idea", category: "Inspiration", suggested_action: "Capture the key takeaway in your own words." } as const;
  }

  if (/(task|todo|remind me|remember|schedule|call|send)/.test(value)) {
    return { intent: "Task", category: "Productivity", suggested_action: "Turn this into a dated next step." } as const;
  }

  return { intent: "Research Later", category: "General", suggested_action: "Review this again when you are ready." } as const;
}

function buildFallbackTitle(input: AnalyzeIntentInput, source: string) {
  const candidates = [
    input.urlMetadata?.title,
    input.originalText,
    input.contextNote,
    input.ocrText,
    input.originalUrl
  ]
    .map((value) => normalizeWhitespace(value))
    .filter(Boolean);

  const title = candidates[0] ?? source;
  return title.slice(0, 80) || "Untitled item";
}

export function buildFallbackAnalysis(input: AnalyzeIntentInput): AnalysisResult {
  const source = normalizeWhitespace(
    [
      input.originalText,
      input.contextNote,
      input.ocrText,
      input.originalUrl,
      input.urlMetadata?.title,
      input.urlMetadata?.description
    ]
      .filter(Boolean)
      .join(" ")
  );
  const guess = guessIntent(source);

  return {
    title: buildFallbackTitle(input, source),
    summary:
      source.slice(0, 180) ||
      "IntentVault saved this item for later review. Update the details before saving if needed.",
    intent: guess.intent,
    category: guess.category,
    suggested_action: guess.suggested_action
  };
}

function normalizeModelAnalysis(
  input: AnalyzeIntentInput,
  value: unknown
): AnalysisResult {
  const fallback = buildFallbackAnalysis(input);

  if (!value || typeof value !== "object") {
    return fallback;
  }

  const candidate = value as Record<string, unknown>;
  const intent = getNonEmptyString(candidate.intent);

  return {
    title: getNonEmptyString(candidate.title) ?? fallback.title,
    summary: getNonEmptyString(candidate.summary) ?? fallback.summary,
    intent: INTENTS.includes(intent as AnalysisResult["intent"])
      ? (intent as AnalysisResult["intent"])
      : fallback.intent,
    category: getNonEmptyString(candidate.category) ?? fallback.category,
    suggested_action:
      getNonEmptyString(candidate.suggested_action) ?? fallback.suggested_action
  };
}

export async function analyzeIntent(input: AnalyzeIntentInput): Promise<AnalysisResult> {
  const geminiApiKey = getGeminiApiKey();

  if (!geminiApiKey) {
    return buildFallbackAnalysis(input);
  }

  const payload = {
    item_type: input.itemType,
    original_text: normalizeWhitespace(input.originalText),
    original_url: normalizeWhitespace(input.originalUrl),
    ocr_text: normalizeWhitespace(input.ocrText),
    context_note: normalizeWhitespace(input.contextNote),
    url_metadata: input.urlMetadata ?? null
  };

  try {
    const prompt = [
      "You determine the user's intent from saved content.",
      "Return valid JSON with title, summary, intent, category, and suggested_action.",
      "Intent must be exactly one of: Buy Later, Watch Later, Read Later, Visit Later, Reply Later, Research Later, Idea, Task.",
      "Keep title under 80 characters, summary under 220 characters, and suggested_action under 120 characters.",
      "",
      "Analyze this saved item and infer why the user wants it later:",
      JSON.stringify(payload, null, 2)
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseJsonSchema: GEMINI_RESPONSE_SCHEMA
          }
        }),
        cache: "no-store"
      }
    );

    if (!response.ok) {
      return buildFallbackAnalysis(input);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const raw =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text ?? "")
        .join("")
        .trim() ?? null;

    if (!raw) {
      return buildFallbackAnalysis(input);
    }

    const normalizedAnalysis = normalizeModelAnalysis(input, JSON.parse(raw));
    const parsed = parsedAnalysisSchema.safeParse(normalizedAnalysis);

    if (!parsed.success) {
      return buildFallbackAnalysis(input);
    }

    return parsed.data;
  } catch {
    return buildFallbackAnalysis(input);
  }
}
