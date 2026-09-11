import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion";
import { CalendarDays } from "lucide-react";
import { getTeacherTimetable } from "@/lib/actions/teacher";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

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
        <div className="grid gap-4 md:grid-cols-3">
          {days.map((d, i) => {
            const list = rows.filter((r) => r.dayOfWeek === d);
            return (
              <Reveal key={d} delay={Math.min(i * 0.05, 0.2)}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-brand-600" />
                      <CardTitle className="text-base capitalize">{d.toLowerCase()}</CardTitle>
                    </div>
                    <Badge variant={list.length === 0 ? "muted" : "brand"}>
                      {list.length === 0 ? "Free" : `${list.length} classes`}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {list.length === 0 ? (
                      <p className="text-sm text-sub">Free</p>
                    ) : (
                      <ul className="space-y-2">
                        {list.map((r) => (
                          <li key={r.id} className="rounded-lg bg-surface px-3 py-2 text-sm">
                            <span className="text-xs font-medium text-brand-700">
                              {r.startTime}–{r.endTime}
                            </span>
                            <br />
                            <span className="font-medium text-ink">{r.subject.name}</span>
                            <span className="text-sub"> · {r.class.name}</span>
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
      {rows.length > 0 ? (
        <Reveal delay={0.2}>
          <Card className="mt-4">
            <CardContent className="py-4">
              <CardDescription>
                {rows.length} sessions across the week
              </CardDescription>
            </CardContent>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}
