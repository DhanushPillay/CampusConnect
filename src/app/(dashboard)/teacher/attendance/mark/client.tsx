"use client";

import { bulkMarkAttendance } from "@/features/attendance/actions";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input, FieldLabel } from "@/shared/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import { Reveal } from "@/shared/motion";
import { ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = { id: string; name: string; status: string };

const pillBase =
  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border";

function pillClass(option: string, active: boolean) {
  if (!active) return cn(pillBase, "border-border bg-white text-sub");
  if (option === "PRESENT") return cn(pillBase, "border-border bg-emerald-50 text-emerald-700");
  if (option === "ABSENT") return cn(pillBase, "border-border bg-red-50 text-red-700");
  return cn(pillBase, "border-border bg-amber-50 text-amber-700");
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function MarkClient({
  classes,
  studentsByClass,
  subjects,
  teacherId,
}: {
  classes: { id: string; name: string }[];
  studentsByClass: Record<string, { id: string; name: string }[]>;
  subjects: { id: string; name: string; classId: string }[];
  teacherId: string;
}) {
  const router = useRouter();
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [dateStr, setDateStr] = useState(todayStr());
  const classSubjects = useMemo(() => subjects.filter((s) => s.classId === classId), [subjects, classId]);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const roster = studentsByClass[classId] ?? [];
  const [rows, setRows] = useState<Row[]>(
    roster.map((s) => ({ id: s.id, name: s.name, status: "PRESENT" }))
  );
  const [done, setDone] = useState("");

  function pickClass(v: string) {
    setClassId(v);
    const list = studentsByClass[v] ?? [];
    setRows(list.map((s) => ({ id: s.id, name: s.name, status: "PRESENT" })));
    const first = subjects.find((s) => s.classId === v);
    if (first) setSubjectId(first.id);
    setDone("");
  }

  const subject = subjects.find((s) => s.id === subjectId);
  const presentCount = rows.filter((r) => r.status === "PRESENT").length;

  async function save() {
    if (!subject || !dateStr) return;
    await bulkMarkAttendance({
      classId,
      subjectId: subject.id,
      date: new Date(dateStr),
      markedById: teacherId,
      rows: rows.map((r) => ({ studentId: r.id, status: r.status })),
    });
    setDone(`Marked ${rows.length} students · ${subject.name} · ${dateStr}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Register</CardTitle>
              <CardDescription>Class, subject and date</CardDescription>
            </div>
            <Badge variant="brand">
              {presentCount}/{rows.length} present
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            <div>
              <FieldLabel>Class</FieldLabel>
              <Select value={classId} onValueChange={pickClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Subject</FieldLabel>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {classSubjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel>Date</FieldLabel>
              <Input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} required />
            </div>
          </CardContent>
        </Card>
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Students ({rows.length})</CardTitle>
              <CardDescription>Tap a pill to set each student&apos;s status</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {rows.length === 0 ? (
              <p className="text-sm text-sub">No students enrolled in this class.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {rows.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="text-sm font-medium text-ink">{r.name}</span>
                    <div className="flex gap-1.5">
                      {["PRESENT", "ABSENT", "LATE"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() =>
                            setRows((prev) => prev.map((p) => (p.id === r.id ? { ...p, status: s } : p)))
                          }
                          className={pillClass(s, r.status === s)}
                        >
                          {s === "PRESENT" ? "Present" : s === "ABSENT" ? "Absent" : "Late"}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save}>
            <ClipboardCheck className="h-4 w-4" />
            Save register
          </Button>
          {done ? (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              {done}
            </span>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}
