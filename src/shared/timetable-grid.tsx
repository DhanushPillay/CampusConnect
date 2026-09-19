import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Reveal } from "@/shared/motion";
import { CalendarDays } from "lucide-react";

export const WEEK_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_ORDER = new Map(WEEK_DAYS.map((d, i) => [d, i]));

export function prettyDay(d: string) {
  return d.charAt(0) + d.slice(1).toLowerCase();
}

type Row = { id: string; dayOfWeek: string; startTime: string; endTime: string };

export function TimetableGrid<T extends Row>({
  rows,
  renderRow,
}: {
  rows: T[];
  renderRow: (r: T) => React.ReactNode;
}) {
  const sorted = [...rows].sort(
    (a, b) =>
      (DAY_ORDER.get(a.dayOfWeek) ?? 99) - (DAY_ORDER.get(b.dayOfWeek) ?? 99) ||
      a.startTime.localeCompare(b.startTime)
  );
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {WEEK_DAYS.map((d, i) => {
        const list = sorted.filter((r) => r.dayOfWeek === d);
        return (
          <Reveal key={d} delay={Math.min(i * 0.05, 0.2)}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-brand-600" />
                  <CardTitle className="text-base">{prettyDay(d)}</CardTitle>
                </div>
                <CardDescription>
                  {list.length === 0 ? "No classes" : `${list.length} classes`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {list.length === 0 ? (
                  <p className="text-sm text-sub">Free</p>
                ) : (
                  <ul className="space-y-2">{list.map((r) => renderRow(r))}</ul>
                )}
              </CardContent>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}
