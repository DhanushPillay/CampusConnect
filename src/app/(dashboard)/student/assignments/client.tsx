"use client";

import { submitAssignment } from "@/features/assignments/actions";
import { submitExam } from "@/features/exams/actions";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Reveal } from "@/shared/motion";
import { FileText, ClipboardCheck, GraduationCap } from "lucide-react";

import { formatDate } from "@/lib/utils";

type AssignmentItem = {
  id: string;
  title: string;
  deadline: Date;
  maxMarks: number;
  subject: { name: string };
  submissions: { content: string | null; marksObtained: number | null; feedback: string | null }[];
};

export function StudentAssignmentsClient({
  items,
  studentId,
}: {
  items: AssignmentItem[];
  studentId: string;
}) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function handleSubmit(a: AssignmentItem) {
    const text = drafts[a.id] ?? a.submissions[0]?.content ?? "";
    if (!text.trim()) return;
    setPending((p) => ({ ...p, [a.id]: true }));
    await submitAssignment(a.id, studentId, text);
    setPending((p) => ({ ...p, [a.id]: false }));
    setSaved((s) => ({ ...s, [a.id]: true }));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {items.map((a, i) => {
        const sub = a.submissions[0];
        const graded = sub?.marksObtained != null;
        return (
          <Reveal key={a.id} delay={Math.min(i * 0.05, 0.2)}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-brand-600" />
                  <div>
                    <CardTitle>{a.title}</CardTitle>
                    <CardDescription>
                      {a.subject.name} · due {formatDate(a.deadline)}
                    </CardDescription>
                  </div>
                </div>
                {graded ? (
                  <StatusBadge status="GRADED" />
                ) : sub ? (
                  <StatusBadge status="SUBMITTED" />
                ) : (
                  <Badge variant="brand">Due</Badge>
                )}
              </CardHeader>
              <CardContent>
                {graded ? (
                  <div className="space-y-2">
                    <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-ink">
                      Graded: {sub.marksObtained}/{a.maxMarks}
                    </div>
                    {sub.feedback ? (
                      <p className="rounded-lg bg-surface px-4 py-3 text-sm text-sub">
                        Feedback: {sub.feedback}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      await handleSubmit(a);
                    }}
                    className="space-y-2"
                  >
                    {sub ? (
                      <p className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-sub">
                        Submitted — waiting for grading. You can edit and resubmit below.
                      </p>
                    ) : null}
                    <div className="flex gap-2">
                      <Input
                        value={drafts[a.id] ?? sub?.content ?? ""}
                        onChange={(e) => {
                          setDrafts((d) => ({ ...d, [a.id]: e.target.value }));
                          setSaved((s) => ({ ...s, [a.id]: false }));
                        }}
                        required
                        placeholder="Paste your answer or link"
                      />
                      <Button type="submit" disabled={!!pending[a.id]}>
                        {pending[a.id] ? "Saving…" : sub ? "Resubmit" : "Submit"}
                      </Button>
                    </div>
                    {saved[a.id] ? (
                      <p className="text-sm font-medium text-ink">Saved.</p>
                    ) : null}
                  </form>
                )}
              </CardContent>
            </Card>
          </Reveal>
        );
      })}
      {items.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-sm text-sub">No assignments.</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function StudentExamsClient({
  exams,
}: {
  exams: {
    id: string;
    name: string;
    subject: { name: string };
    submissions: { score: number | null }[];
  }[];
}) {
  return (
    <div className="space-y-4">
      {exams.map((x, i) => {
        const attempt = x.submissions[0];
        return (
          <Reveal key={x.id} delay={Math.min(i * 0.05, 0.2)}>
            <Card>
              <CardContent>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-4 w-4 text-brand-600" />
                    <p className="font-semibold text-ink">
                      {x.name} <span className="font-normal text-sub">· {x.subject.name}</span>
                    </p>
                  </div>
                  {attempt ? (
                    <Badge variant="success">Scored {attempt.score}</Badge>
                  ) : (
                    <a href={`/student/exams/${x.id}`}>
                      <Button size="sm">Start</Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        );
      })}
    </div>
  );
}

export function TakeExamClient({
  examId,
  studentId,
  questions,
}: {
  examId: string;
  studentId: string;
  questions: { id: string; questionText: string; options: string }[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  return (
    <div className="space-y-4">
      {questions.map((q, qi) => {
        const opts: string[] = JSON.parse(q.options);
        return (
          <Reveal key={q.id} delay={Math.min(qi * 0.05, 0.2)}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand-600" />
                  <CardTitle>
                    Q{qi + 1}. {q.questionText}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {opts.map((o, i) => {
                    const selected = answers[q.id] === i;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                        aria-pressed={selected}
                        className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                          selected
                            ? "border-border bg-brand-50 font-semibold text-brand-700"
                            : "border-border bg-white text-ink hover:bg-brand-50"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        );
      })}
      <Reveal delay={0.1}>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            disabled={submitting || result != null}
            onClick={async () => {
              setSubmitting(true);
              const arr = questions.map((q) => answers[q.id] ?? -1);
              const s = await submitExam(examId, studentId, arr);
              setResult(s);
              setSubmitting(false);
              router.refresh();
            }}
          >
            {submitting ? "Submitting…" : result != null ? "Submitted" : "Submit exam"}
          </Button>
          {result != null ? (
            <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-ink">
              Score: {result}
            </div>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}
