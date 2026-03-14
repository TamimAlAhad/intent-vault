import { Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate, getReminderState } from "@/lib/utils";

interface ReminderPillProps {
  reminderDate: string | null;
}

export function ReminderPill({ reminderDate }: ReminderPillProps) {
  if (!reminderDate) {
    return null;
  }

  const state = getReminderState(reminderDate);
  const label = state ?? "Scheduled";

  return (
    <Badge variant={label === "Overdue" ? "warning" : "secondary"} className="gap-1.5">
      <Clock3 className="size-3" />
      {label}: {formatDate(reminderDate)}
    </Badge>
  );
}
