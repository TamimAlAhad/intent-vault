import Link from "next/link";
import { notFound } from "next/navigation";

import { getItemById } from "@/lib/items";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemDetailForm } from "@/components/items/item-detail-form";
import { ReminderPill } from "@/components/items/reminder-pill";

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const item = await getItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-6">
        <Card className="surface border-white/70">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{item.detected_intent}</Badge>
              {item.category ? <Badge variant="outline">{item.category}</Badge> : null}
              <ReminderPill reminderDate={item.reminder_date} />
            </div>
            <CardTitle className="font-serif text-4xl">{item.ai_title}</CardTitle>
            <p className="text-sm leading-7 text-muted-foreground">{item.ai_summary}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.ai_title}
                className="w-full rounded-[28px] border border-border/60 object-cover shadow-sm"
              />
            ) : item.original_url ? (
              <div className="rounded-[28px] border border-border/70 bg-white/80 p-5">
                <div className="text-sm font-medium text-foreground">Original URL</div>
                <Link
                  href={item.original_url}
                  className="mt-2 block break-all text-sm text-primary underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.original_url}
                </Link>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-border/70 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Suggested action
                </div>
                <p className="mt-3 text-sm leading-7 text-foreground">
                  {item.suggested_action ?? "No suggested action added yet."}
                </p>
              </div>
              <div className="rounded-[24px] border border-border/70 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Timeline
                </div>
                <p className="mt-3 text-sm text-foreground">Created {formatDateTime(item.created_at)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Updated {formatDateTime(item.updated_at)}
                </p>
              </div>
            </div>

            {item.original_text ? (
              <div className="rounded-[24px] border border-border/70 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Original note
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {item.original_text}
                </p>
              </div>
            ) : null}

            {item.ocr_text ? (
              <div className="rounded-[24px] border border-border/70 bg-white/80 p-5">
                <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  OCR text
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {item.ocr_text}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <aside>
        <ItemDetailForm item={item} />
      </aside>
    </div>
  );
}
