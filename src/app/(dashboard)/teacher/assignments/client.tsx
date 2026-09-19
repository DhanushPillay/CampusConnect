"use client";

import { createAssignment, gradeSubmission } from "@/features/assignments/actions";
import { createExam, addQuestion, updateQuestion, deleteQuestion, publishExam, getExamAttempts } from "@/features/exams/actions";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Badge, StatusBadge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input, FieldLabel } from "@/shared/ui/input";
import { Table, THead, TBody, Tr, Th, Td } from "@/shared/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/shared/ui/select";
import { Reveal } from "@/shared/motion";
import { FileText, ClipboardCheck, GraduationCap, Plus } from "lucide-react";

function SubjectPicker({
  subjects,
  value,
  onChange,
  label = "Subject",
}: {
  subjects: { id: string; name: string }[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Choose subject" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type PendingItem = {
  id: string;
  content: string | null;
  marksObtained: number | null;
  student: { name: string };
  assignment: { title: string; maxMarks: number };
};

export function AssignmentsClient({
  assignments,
  pending,
  subjects,
  teacherId,
}: {
  assignments: { id: string; title: string; deadline: Date; maxMarks: number; subject: { name: string }; _count: { submissions: number } }[];
  pending: PendingItem[];
  subjects: { id: string; name: string }[];
  teacherId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxMarks, setMaxMarks] = useState("20");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [deadline, setDeadline] = useState("");
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [error, setError] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !deadline || !title.trim()) return;
    await createAssignment({
      title: title.trim(),
      description,
      subjectId,
      teacherId,
      deadline: new Date(deadline),
      maxMarks: Math.max(1, Number(maxMarks) || 20),
    });
    setTitle("");
    setDescription("");
    setMaxMarks("20");
    setOpen(false);
    router.refresh();
  }

  async function grade(p: PendingItem) {
    const raw = Number(marks[p.id] ?? "");
    if (!Number.isFinite(raw) || raw < 0 || raw > p.assignment.maxMarks) {
      setError((m) => ({ ...m, [p.id]: `Enter 0 to ${p.assignment.maxMarks}` }));
      return;
    }
    setError((m) => ({ ...m, [p.id]: "" }));
    await gradeSubmission(p.id, Math.round(raw), feedback[p.id] ?? "", teacherId);
    router.refresh();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Reveal>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <div>
                <CardTitle>Assignments ({assignments.length})</CardTitle>
                <CardDescription>Due dates and submissions</CardDescription>
              </div>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New assignment</DialogTitle>
                <DialogDescription>It appears in the student list right away.</DialogDescription>
                <form onSubmit={create} className="mt-4 grid gap-3">
                  <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
                  <div>
                    <FieldLabel>Title</FieldLabel>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="New assignment title"
                    />
                  </div>
                  <div>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Instructions for students"
                      rows={3}
                      className="w-full rounded-lg border border-input bg-white px-3 py-2 text-[15px] text-ink placeholder:text-sub/60 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Max marks</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={maxMarks}
                        onChange={(e) => setMaxMarks(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Deadline</FieldLabel>
                      <Input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit">Add assignment</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="font-medium text-ink">{a.title}</span>
                    <span className="text-sub"> · {a.subject.name}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge variant="brand">{a._count.submissions} in</Badge>
                    <span className="text-xs text-sub">due {formatDate(a.deadline)}</span>
                  </span>
                </li>
              ))}
              {assignments.length === 0 ? (
                <p className="py-2 text-sm text-sub">No assignments yet.</p>
              ) : null}
            </ul>
          </CardContent>
        </Card>
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-brand-600" />
              <div>
                <CardTitle>Pending grading ({pending.length})</CardTitle>
                <CardDescription>Enter marks out of max</CardDescription>
              </div>
            </div>
            {pending.length > 0 ? <StatusBadge status="PENDING" /> : <StatusBadge status="GRADED" />}
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {pending.map((p) => (
                <li key={p.id} className="rounded-lg border border-border/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      <span className="font-medium text-ink">{p.student.name}</span>
                      <span className="text-sub"> · {p.assignment.title}</span>
                    </span>
                    <Badge variant="brand">/ {p.assignment.maxMarks}</Badge>
                  </div>
                  {p.content ? (
                    <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-sm text-ink">{p.content}</p>
                  ) : (
                    <p className="mt-2 text-sm text-sub">No text content submitted.</p>
                  )}
                  <div className="mt-2">
                    <FieldLabel>Feedback</FieldLabel>
                    <textarea
                      value={feedback[p.id] ?? ""}
                      onChange={(e) => setFeedback((m) => ({ ...m, [p.id]: e.target.value }))}
                      placeholder="Feedback for the student"
                      rows={2}
                      className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-ink placeholder:text-sub/60 outline-none transition-colors focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20"
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={p.assignment.maxMarks}
                      value={marks[p.id] ?? ""}
                      onChange={(e) => setMarks((m) => ({ ...m, [p.id]: e.target.value }))}
                      placeholder={`/ ${p.assignment.maxMarks}`}
                      className="w-24"
                    />
                    <Button size="sm" variant="secondary" onClick={() => grade(p)}>
                      Grade
                    </Button>
                  </div>
                  {error[p.id] ? <p className="mt-1 text-xs text-red-600">{error[p.id]}</p> : null}
                </li>
              ))}
              {pending.length === 0 ? <p className="text-sm text-sub">Nothing waiting.</p> : null}
            </ul>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

type ExamItem = {
  id: string;
  name: string;
  isPublished: boolean;
  totalMarks: number;
  duration: number;
  subject: { name: string };
  questions: { id: string; questionText: string; options: string; correctOption: number; marks: number }[];
  submissions: { id: string; score: number | null; submittedAt: Date; student: { id: string; name: string } }[];
  _count: { questions: number; submissions: number };
};

export function ExamsClient({
  exams,
  subjects,
  teacherId,
}: {
  exams: ExamItem[];
  subjects: { id: string; name: string }[];
  teacherId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [totalMarks, setTotalMarks] = useState("20");
  const [duration, setDuration] = useState("30");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [openId, setOpenId] = useState("");
  const [detailId, setDetailId] = useState("");
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState("A,B,C,D");
  const [correct, setCorrect] = useState("1");
  const [qMarks, setQMarks] = useState("10");
  const [editMarks, setEditMarks] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState<Record<string, { id: string; score: number | null; student: { name: string } }[]>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  async function loadAttempts(examId: string) {
    const rows = await getExamAttempts(examId, teacherId);
    setAttempts((m) => ({ ...m, [examId]: rows }));
  }

  return (
    <div className="space-y-4">
      <Reveal>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-brand-600" />
              <div>
                <CardTitle>MCQ exams ({exams.length})</CardTitle>
                <CardDescription>Build a question set, then publish</CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  New exam
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>New MCQ exam</DialogTitle>
                <DialogDescription>Add questions after creating the exam.</DialogDescription>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!subjectId || !name.trim()) return;
                    await createExam({
                      name: name.trim(),
                      subjectId,
                      totalMarks: Math.max(1, Number(totalMarks) || 20),
                      duration: Math.max(1, Number(duration) || 30),
                      createdById: teacherId,
                    });
                    setName("");
                    setTotalMarks("20");
                    setDuration("30");
                    setDialogOpen(false);
                    router.refresh();
                  }}
                  className="mt-4 grid gap-3"
                >
                  <div>
                    <FieldLabel>Exam name</FieldLabel>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="New MCQ exam name"
                    />
                  </div>
                  <SubjectPicker subjects={subjects} value={subjectId} onChange={setSubjectId} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <FieldLabel>Total marks</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={totalMarks}
                        onChange={(e) => setTotalMarks(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <FieldLabel>Duration (min)</FieldLabel>
                      <Input
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit">Add exam</Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
        </Card>
      </Reveal>
      {exams.map((x, i) => (
        <Reveal key={x.id} delay={Math.min(i * 0.05, 0.2)}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>
                  {x.name} <span className="font-normal text-sub">· {x.subject.name}</span>
                </CardTitle>
                <CardDescription>
                  {x._count.questions} questions · {x._count.submissions} attempts · {x.totalMarks} marks · {x.duration} min
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={x.isPublished ? "PUBLISHED" : "DRAFT"} />
                {!x.isPublished ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      await publishExam(x.id);
                      router.refresh();
                    }}
                  >
                    Publish
                  </Button>
                ) : null}
                <Button size="sm" variant="outline" onClick={() => setOpenId(openId === x.id ? "" : x.id)}>
                  {openId === x.id ? "Close" : "Add Q"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const next = detailId === x.id ? "" : x.id;
                    setDetailId(next);
                    if (next) void loadAttempts(x.id);
                  }}
                >
                  {detailId === x.id ? "Hide" : "Details"}
                </Button>
              </div>
            </CardHeader>
            {openId === x.id ? (
              <CardContent>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await addQuestion({
                      examId: x.id,
                      questionText: q,
                      options: opts.split(",").map((o) => o.trim()),
                      correctOption: Number(correct),
                      marks: Math.max(1, Number(qMarks) || 1),
                    });
                    setQ("");
                    router.refresh();
                  }}
                  className="grid gap-2"
                >
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    required
                    placeholder="Question text"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={opts}
                      onChange={(e) => setOpts(e.target.value)}
                      className="flex-1"
                      placeholder="A,B,C,D"
                    />
                    <Input
                      value={correct}
                      onChange={(e) => setCorrect(e.target.value)}
                      className="sm:w-24"
                      placeholder="Correct #"
                    />
                    <Input
                      type="number"
                      min={1}
                      value={qMarks}
                      onChange={(e) => setQMarks(e.target.value)}
                      className="sm:w-24"
                      placeholder="Marks"
                    />
                    <Button type="submit">Save</Button>
                  </div>
                </form>
              </CardContent>
            ) : null}
            {detailId === x.id ? (
              <CardContent className="grid gap-4">
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-ink">Questions ({x.questions.length})</h4>
                  {x.questions.length === 0 ? (
                    <p className="text-sm text-sub">No questions yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {x.questions.map((qq, idx) => (
                        <li key={qq.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 p-2 text-sm">
                          <span className="flex-1">
                            <span className="font-medium text-ink">{idx + 1}. {qq.questionText}</span>
                            <span className="text-sub"> · {qq.marks} marks · answer {qq.correctOption}</span>
                          </span>
                          <Input
                            type="number"
                            min={0}
                            value={editMarks[qq.id] ?? String(qq.marks)}
                            onChange={(e) => setEditMarks((m) => ({ ...m, [qq.id]: e.target.value }))}
                            className="w-20"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={async () => {
                              await updateQuestion(qq.id, { marks: Math.max(0, Number(editMarks[qq.id] ?? qq.marks) || 0) });
                              router.refresh();
                            }}
                          >
                            Update
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              await deleteQuestion(qq.id);
                              router.refresh();
                            }}
                          >
                            Delete
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-ink">Attempts ({(attempts[x.id] ?? x.submissions).length})</h4>
                  {(attempts[x.id] ?? x.submissions).length === 0 ? (
                    <p className="text-sm text-sub">No attempts yet.</p>
                  ) : (
                    <Table>
                      <THead>
                        <Tr>
                          <Th>Student</Th>
                          <Th>Score</Th>
                        </Tr>
                      </THead>
                      <TBody>
                        {(attempts[x.id] ?? x.submissions).map((a) => (
                          <Tr key={a.id}>
                            <Td className="font-medium">{a.student.name}</Td>
                            <Td>{a.score ?? "-"}</Td>
                          </Tr>
                        ))}
                      </TBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            ) : null}
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
