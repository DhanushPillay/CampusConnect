import { Card, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Reveal } from "@/shared/motion";
import { TimetableGrid } from "@/shared/timetable-grid";

import { getSession } from "@/lib/auth";
import { getStudentTimetable } from "@/features/timetable/actions";

export const dynamic = "force-dynamic";

export default async function StudentTimetable() {
  const session = await getSession();
  const rows = await getStudentTimetable(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Timetable</h1>
        <p className="mt-1 text-sm text-sub">Your weekly schedule</p>
      </div>
      {rows.length === 0 ? (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>No classes scheduled</CardTitle>
              <CardDescription>Check back once classes are assigned.</CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      ) : (
        <TimetableGrid
          rows={rows}
          renderRow={(r) => (
            <li key={r.id} className="flex gap-3">
              <div className="w-1 shrink-0 rounded-full bg-brand-600" />
              <div className="text-sm">
                <p className="text-sub">
                  {r.startTime}–{r.endTime}
                </p>
                <p className="font-medium text-ink">{r.subject.name}</p>
                <p className="text-sub">{r.teacher.name}</p>
              </div>
            </li>
          )}
        />
      )}
    </div>
  );
}
