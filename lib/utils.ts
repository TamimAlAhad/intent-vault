import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function truncate(value: string | null | undefined, length = 120) {
  if (!value) {
    return "";
  }

  if (value.length <= length) {
    return value;
  }

  return `${value.slice(0, length - 1)}…`;
}

export function getDomainFromUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function getReminderState(reminderDate: string | null) {
  if (!reminderDate) {
    return null;
  }

  const reminder = new Date(reminderDate);
  const now = new Date();

  if (Number.isNaN(reminder.getTime())) {
    return null;
  }

  if (reminder < now) {
    return "Overdue";
  }

  const diffHours = Math.round((reminder.getTime() - now.getTime()) / 36e5);

  if (diffHours < 24) {
    return "Due soon";
  }

  return "Scheduled";
}
