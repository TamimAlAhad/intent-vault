import Link from "next/link";
import { ExternalLink, ImageIcon, Link2, StickyNote } from "lucide-react";

import type { ItemWithPreview } from "@/lib/types/items";
import { formatDate, getDomainFromUrl, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReminderPill } from "@/components/items/reminder-pill";

interface ItemCardProps {
  item: ItemWithPreview;
}

export function ItemCard({ item }: ItemCardProps) {
  const domain = getDomainFromUrl(item.original_url);

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <Card className="surface h-full border-white/70 transition group-hover:-translate-y-0.5 group-hover:shadow-glow">
        <CardContent className="grid h-full gap-5 p-5">
          <div className="overflow-hidden rounded-[24px] border border-border/60 bg-white/80">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.ai_title}
                className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-52 flex-col justify-between bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5">
                <div className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  {item.item_type === "url" ? (
                    <Link2 className="size-5" />
                  ) : item.item_type === "text" ? (
                    <StickyNote className="size-5" />
                  ) : (
                    <ImageIcon className="size-5" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {item.item_type}
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    {domain ?? "Saved item"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{item.detected_intent}</Badge>
              {item.category ? <Badge variant="outline">{item.category}</Badge> : null}
              <ReminderPill reminderDate={item.reminder_date} />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground">{item.ai_title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {truncate(item.ai_summary, 150)}
              </p>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatDate(item.created_at)}</span>
              {item.original_url ? (
                <span className="inline-flex items-center gap-1.5">
                  {domain}
                  <ExternalLink className="size-3.5" />
                </span>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
