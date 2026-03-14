"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import type { ItemWithPreview } from "@/lib/types/items";
import { CATEGORY_OPTIONS, INTENTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ItemDetailFormProps {
  item: ItemWithPreview;
}

export function ItemDetailForm({ item }: ItemDetailFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(item.ai_title);
  const [summary, setSummary] = useState(item.ai_summary);
  const [intent, setIntent] = useState(item.detected_intent);
  const [category, setCategory] = useState(item.category ?? "General");
  const [suggestedAction, setSuggestedAction] = useState(item.suggested_action ?? "");
  const [reminderDate, setReminderDate] = useState(item.reminder_date?.slice(0, 10) ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          aiTitle: title,
          aiSummary: summary,
          detectedIntent: intent,
          category,
          suggestedAction,
          reminderDate
        })
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "The item could not be updated.");
      }

      setSuccess("Changes saved.");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The item could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this item? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "DELETE"
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "The item could not be deleted.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "The item could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className="surface border-white/70">
      <CardHeader className="space-y-3">
        <CardTitle className="font-serif text-3xl">Edit item</CardTitle>
        <CardDescription>Adjust the saved details without breaking the original source.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiTitle">Title</Label>
            <Input id="aiTitle" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aiSummary">Summary</Label>
            <Textarea
              id="aiSummary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="intent">Intent</Label>
              <Select id="intent" value={intent} onChange={(event) => setIntent(event.target.value)}>
                {INTENTS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {[...CATEGORY_OPTIONS, category]
                  .filter(
                    (value, index, list): value is string =>
                      Boolean(value) && list.indexOf(value) === index
                  )
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="suggestedAction">Suggested action</Label>
            <Input
              id="suggestedAction"
              value={suggestedAction}
              onChange={(event) => setSuggestedAction(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminderDate">Reminder date</Label>
            <Input
              id="reminderDate"
              type="date"
              value={reminderDate}
              onChange={(event) => setReminderDate(event.target.value)}
            />
          </div>

          {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
          {success ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save changes"
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Deleting
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 size-4" />
                  Delete item
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
