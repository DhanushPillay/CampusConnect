import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/motion";
import { CalendarDays } from "lucide-react";
import { getStudentTimetable } from "@/lib/actions/student";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function prettyDay(d: string) {
  return d.charAt(0) + d.slice(1).toLowerCase();
}

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
        <div className="grid gap-4 md:grid-cols-3">
          {days.map((d, i) => {
            const list = rows.filter((r) => r.dayOfWeek === d);
            return (
              <Reveal key={d} delay={Math.min(i * 0.05, 0.2)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-brand-600" />
                      <CardTitle>{prettyDay(d)}</CardTitle>
                    </div>
                    <CardDescription>
                      {list.length === 0 ? "No classes" : `${list.length} classes`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {list.length === 0 ? (
                      <p className="text-sm text-sub">Free</p>
                    ) : (
                      <ul className="space-y-3">
                        {list.map((r) => (
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
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
