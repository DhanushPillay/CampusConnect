const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

/** Normalizes a calendar date to UTC midnight so the stored day never shifts by timezone. */
export function dateOnly(value: string | Date): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error("Invalid date");
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const match = DATE_RE.exec(value.trim());
  if (!match) throw new Error("Invalid date, use YYYY-MM-DD");
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Invalid date");
  }
  return date;
}

export function endOfDate(value: string | Date): Date {
  const date = dateOnly(value);
  date.setUTCHours(23, 59, 59, 999);
  return date;
}

export function todayStart(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Accepts H:MM or HH:MM and returns zero-padded 00:00-23:59. */
export function normalizeTime(value: string): string {
  const match = TIME_RE.exec(value.trim());
  if (!match) throw new Error("Invalid time, use HH:MM");
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new Error("Invalid time, use HH:MM");
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
