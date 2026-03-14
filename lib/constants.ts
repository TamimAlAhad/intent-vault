export const APP_NAME = "IntentVault";
export const STORAGE_BUCKET = "item-images";
export const GEMINI_MODEL = "gemini-2.5-flash-lite";

export const INTENTS = [
  "Buy Later",
  "Watch Later",
  "Read Later",
  "Visit Later",
  "Reply Later",
  "Research Later",
  "Idea",
  "Task"
] as const;

export const CATEGORY_OPTIONS = [
  "Shopping",
  "Media",
  "Reading",
  "Travel",
  "Communication",
  "Research",
  "Inspiration",
  "Productivity",
  "General"
] as const;

export const ITEM_TYPES = ["image", "url", "text"] as const;
