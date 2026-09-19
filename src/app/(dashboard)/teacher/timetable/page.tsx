import { Card, CardDescription, CardContent } from "@/shared/ui/card";
import { Reveal } from "@/shared/motion";
import { CalendarDays } from "lucide-react";
import { TimetableGrid } from "@/shared/timetable-grid";

import { getSession } from "@/lib/auth";
import { getTeacherTimetable } from "@/features/timetable/actions";

export const dynamic = "force-dynamic";

export default async function TeacherTimetable() {
  const session = await getSession();
  const rows = await getTeacherTimetable(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">My timetable</h1>
        <p className="mt-1 text-sm text-sub">Your weekly teaching schedule</p>
      </div>
      {rows.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <CalendarDays className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink">No classes scheduled</p>
                  <p className="text-sm text-sub">Your week is clear.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <TimetableGrid
          rows={rows}
          renderRow={(r) => (
            <li key={r.id} className="rounded-lg bg-surface px-3 py-2 text-sm">
              <span className="text-xs font-medium text-brand-700">
                {r.startTime}–{r.endTime}
              </span>
              <br />
              <span className="font-medium text-ink">{r.subject.name}</span>
              <span className="text-sub"> · {r.class.name}</span>
            </li>
          )}
        />
      )}
      {rows.length > 0 ? (
        <Reveal delay={0.2}>
          <Card className="mt-4">
            <CardContent className="py-4">
              <CardDescription>{rows.length} sessions across the week</CardDescription>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}
