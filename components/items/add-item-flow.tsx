"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  ImagePlus,
  Link2,
  Loader2,
  StickyNote,
  type LucideIcon
} from "lucide-react";

import type { AnalysisResult, ItemType } from "@/lib/types/items";
import { CATEGORY_OPTIONS, INTENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AnalyzeResponse {
  draft: {
    itemType: ItemType;
    originalText: string | null;
    originalUrl: string | null;
    imagePath: string | null;
    ocrText: string | null;
    reminderDate: string | null;
  };
  analysis: AnalysisResult;
}

const typeOptions: Array<{
  value: ItemType;
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    value: "text",
    title: "Text note",
    description: "Great for reminders and quick thoughts.",
    icon: StickyNote
  },
  {
    value: "url",
    title: "Paste URL",
    description: "Save links with page metadata when available.",
    icon: Link2
  },
  {
    value: "image",
    title: "Upload screenshot",
    description: "Run OCR, then review the detected intent.",
    icon: ImagePlus
  }
];

export function AddItemFlow() {
  const router = useRouter();
  const [itemType, setItemType] = useState<ItemType>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [contextNote, setContextNote] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [reminderDate, setReminderDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "running" | "done" | "failed">("idle");
  const [ocrProgress, setOcrProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [review, setReview] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function switchType(nextType: ItemType) {
    setItemType(nextType);
    setAnalyzeError(null);
    setSaveError(null);
    setResult(null);
    setReview(null);
  }

  async function handleImageChange(file: File | null) {
    setSelectedFile(file);
    setResult(null);
    setReview(null);
    setAnalyzeError(null);
    setOcrText("");
    setOcrProgress(0);
    setOcrStatus("idle");

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }

    if (!file) {
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setOcrStatus("running");

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await (Tesseract as unknown as {
        createWorker: (
          language: string,
          oem?: number,
          options?: {
            logger?: (message: { status?: string; progress?: number }) => void;
          }
        ) => Promise<{
          recognize: (source: File) => Promise<{ data: { text: string } }>;
          terminate: () => Promise<void>;
        }>;
      }).createWorker("eng", 1, {
        logger: (message) => {
          if (message.status === "recognizing text" && typeof message.progress === "number") {
            setOcrProgress(Math.round(message.progress * 100));
          }
        }
      });

      const output = await worker.recognize(file);
      await worker.terminate();
      setOcrText(output.data.text.trim());
      setOcrStatus("done");
    } catch {
      setOcrStatus("failed");
    }
  }

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAnalyzeError(null);
    setSaveError(null);
    setIsAnalyzing(true);

    try {
      const payload = new FormData();
      payload.append("itemType", itemType);
      payload.append("reminderDate", reminderDate);

      if (itemType === "text") {
        payload.append("text", text);
      }

      if (itemType === "url") {
        payload.append("url", url);
      }

      if (itemType === "image") {
        if (!selectedFile) {
          throw new Error("Please choose an image before continuing.");
        }

        payload.append("image", selectedFile);
        payload.append("ocrText", ocrText);
        payload.append("contextNote", contextNote);
      }

      const response = await fetch("/api/items/analyze", {
        method: "POST",
        body: payload
      });

      const data = (await response.json()) as AnalyzeResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Intent analysis failed.");
      }

      setResult(data);
      setReview(data.analysis);
    } catch (error) {
      setAnalyzeError(
        error instanceof Error ? error.message : "Something went wrong while analyzing the item."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleSave() {
    if (!result || !review) {
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          itemType: result.draft.itemType,
          originalText: result.draft.originalText,
          originalUrl: result.draft.originalUrl,
          imagePath: result.draft.imagePath,
          ocrText: result.draft.ocrText,
          aiTitle: review.title,
          aiSummary: review.summary,
          detectedIntent: review.intent,
          category: review.category,
          suggestedAction: review.suggested_action,
          reminderDate: reminderDate || result.draft.reminderDate
        })
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        throw new Error(data.error ?? "The item could not be saved.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "The item could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="surface border-white/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Step 1</Badge>
            <CardDescription>Add the source and any helpful context.</CardDescription>
          </div>
          <CardTitle className="font-serif text-3xl">Capture the item</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => switchType(option.value)}
                className={cn(
                  "rounded-[24px] border px-4 py-4 text-left transition",
                  itemType === option.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-white/70 hover:bg-white"
                )}
              >
                <option.icon className="size-5 text-primary" />
                <div className="mt-4 text-sm font-semibold text-foreground">{option.title}</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  {option.description}
                </div>
              </button>
            ))}
          </div>

          <form className="space-y-5" onSubmit={handleAnalyze}>
            {itemType === "text" ? (
              <div className="space-y-2">
                <Label htmlFor="text">Your note</Label>
                <Textarea
                  id="text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Remind me to compare this laptop next month..."
                />
              </div>
            ) : null}

            {itemType === "url" ? (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com/article"
                />
              </div>
            ) : null}

            {itemType === "image" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="image">Screenshot or image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      void handleImageChange(file);
                    }}
                  />
                </div>

                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagePreview}
                    alt="Selected preview"
                    className="max-h-72 w-full rounded-[28px] border border-border/70 object-contain bg-white p-3"
                  />
                ) : null}

                <div className="rounded-[24px] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                  {ocrStatus === "running" ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Running OCR… {ocrProgress}%
                    </div>
                  ) : ocrStatus === "done" ? (
                    "OCR finished. Review the text below before analysis."
                  ) : ocrStatus === "failed" ? (
                    "OCR could not detect useful text. You can still type context manually below."
                  ) : (
                    "Upload an image to extract text with OCR."
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ocrText">Detected text</Label>
                  <Textarea
                    id="ocrText"
                    value={ocrText}
                    onChange={(event) => setOcrText(event.target.value)}
                    placeholder="OCR text appears here. You can edit it or type your own."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contextNote">Why does this matter? (optional)</Label>
                  <Textarea
                    id="contextNote"
                    value={contextNote}
                    onChange={(event) => setContextNote(event.target.value)}
                    placeholder="Optional context for the AI, like why you captured this screenshot."
                  />
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reminderDate">Reminder date (optional)</Label>
              <Input
                id="reminderDate"
                type="date"
                value={reminderDate}
                onChange={(event) => setReminderDate(event.target.value)}
              />
            </div>

            {analyzeError ? (
              <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{analyzeError}</p>
            ) : null}

            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 size-4" />
                  Analyze with AI
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="surface border-white/70">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Step 2</Badge>
            <CardDescription>Review the AI output before saving.</CardDescription>
          </div>
          <CardTitle className="font-serif text-3xl">Review and save</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {review ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={review.title}
                  onChange={(event) => setReview({ ...review, title: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  value={review.summary}
                  onChange={(event) => setReview({ ...review, summary: event.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="intent">Intent</Label>
                  <Select
                    id="intent"
                    value={review.intent}
                    onChange={(event) =>
                      setReview({
                        ...review,
                        intent: event.target.value as AnalysisResult["intent"]
                      })
                    }
                  >
                    {INTENTS.map((intent) => (
                      <option key={intent} value={intent}>
                        {intent}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    id="category"
                    value={review.category}
                    onChange={(event) => setReview({ ...review, category: event.target.value })}
                  >
                    {[...CATEGORY_OPTIONS, review.category]
                      .filter(
                        (value, index, list): value is string =>
                          Boolean(value) && list.indexOf(value) === index
                      )
                      .map((categoryOption) => (
                        <option key={categoryOption} value={categoryOption}>
                          {categoryOption}
                        </option>
                      ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="suggestedAction">Suggested action</Label>
                <Input
                  id="suggestedAction"
                  value={review.suggested_action}
                  onChange={(event) =>
                    setReview({ ...review, suggested_action: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reviewReminderDate">Reminder date</Label>
                <Input
                  id="reviewReminderDate"
                  type="date"
                  value={reminderDate}
                  onChange={(event) => setReminderDate(event.target.value)}
                />
              </div>

              {saveError ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save item"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setReview(null);
                    setSaveError(null);
                  }}
                >
                  Start over
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-border bg-white/70 p-6 text-sm leading-7 text-muted-foreground">
              Analyze something on the left to see a draft title, summary, intent, category, and
              suggested next action here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
