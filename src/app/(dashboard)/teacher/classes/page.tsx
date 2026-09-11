import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion";
import { BookOpen, Users } from "lucide-react";
import { getTeacherSubjects } from "@/lib/actions/teacher";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function TeacherClasses() {
  const session = await getSession();
  const subjects = await getTeacherSubjects(session!.user.id);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">My classes</h1>
        <p className="mt-1 text-sm text-sub">Subjects you teach this semester</p>
      </div>
      {subjects.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                  <BookOpen className="h-5 w-5 text-brand-600" />
                </span>
                <div>
                  <p className="font-semibold text-ink">No subjects assigned</p>
                  <p className="text-sm text-sub">Check back once the timetable is published.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50">
                      <BookOpen className="h-5 w-5 text-brand-600" />
                    </span>
                    <div>
                      <CardTitle>{s.name}</CardTitle>
                      <CardDescription>
                        {s.code} · {s.class.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="brand">{s.class.name}</Badge>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <p className="text-sm text-sub">
                    {s._count.assignments} assignments · {s._count.exams} exams
                  </p>
                  <Link href={`/teacher/classes/${s.classId}`}>
                    <Button size="sm" variant="secondary">
                      <Users className="h-4 w-4" />
                      Roster
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
