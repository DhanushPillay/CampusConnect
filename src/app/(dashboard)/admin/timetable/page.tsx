import { getTimetable, createTimetableEntry, deleteTimetableEntry } from "@/features/timetable/actions";
import { getClasses, getSubjects } from "@/features/classes/actions";
import { getTeacherUsers } from "@/features/users/actions";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input, FieldLabel } from "@/shared/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Reveal } from "@/shared/motion";

import { FormSelect } from "../components";

export const dynamic = "force-dynamic";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default async function AdminTimetable() {
  const [rows, classes, subjects, teachers] = await Promise.all([
    getTimetable(),
    getClasses(),
    getSubjects(),
    getTeacherUsers(),
  ]);
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Timetable</h1>
          <p className="mt-1 text-sm text-sub">Weekly schedule across classes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">New entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add timetable entry</DialogTitle>
            <DialogDescription>One slot in the weekly schedule.</DialogDescription>
            <form
              className="mt-4 space-y-3"
              action={async (formData: FormData) => {
                "use server";
                await createTimetableEntry(
                  String(formData.get("dayOfWeek")),
                  String(formData.get("startTime")),
                  String(formData.get("endTime")),
                  String(formData.get("classId")),
                  String(formData.get("subjectId")),
                  String(formData.get("teacherId")),
                  String(formData.get("room") ?? "")
                );
              }}
            >
              <div>
                <FieldLabel>Day</FieldLabel>
                <FormSelect
                  name="dayOfWeek"
                  placeholder="Select day"
                  options={DAYS.map((d) => ({ value: d, label: d }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Start</FieldLabel>
                  <Input name="startTime" type="time" required />
                </div>
                <div>
                  <FieldLabel>End</FieldLabel>
                  <Input name="endTime" type="time" required />
                </div>
              </div>
              <div>
                <FieldLabel>Class</FieldLabel>
                <FormSelect
                  name="classId"
                  placeholder="Select class"
                  options={classes.map((c) => ({
                    value: c.id,
                    label: `${c.name}${c.section ? ` · Sec ${c.section}` : ""}`,
                  }))}
                />
              </div>
              <div>
                <FieldLabel>Subject</FieldLabel>
                <FormSelect
                  name="subjectId"
                  placeholder="Select subject"
                  options={subjects.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.code})`,
                  }))}
                />
              </div>
              <div>
                <FieldLabel>Teacher</FieldLabel>
                <FormSelect
                  name="teacherId"
                  placeholder="Select teacher"
                  options={teachers.map((t) => ({ value: t.id, label: t.name }))}
                />
              </div>
              <div>
                <FieldLabel>Room (optional)</FieldLabel>
                <Input name="room" placeholder="Room 204" />
              </div>
              <Button type="submit" className="w-full">
                Add entry
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {rows.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <p className="font-display font-bold text-ink">No timetable entries</p>
              <p className="mt-1 text-sm text-sub">Add the first slot to build the schedule.</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Weekly schedule</CardTitle>
                <CardDescription>All classes, subjects, and rooms</CardDescription>
              </div>
              <Badge variant="brand">{rows.length} slots</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <Tr>
                    <Th>Day</Th>
                    <Th>Time</Th>
                    <Th>Class</Th>
                    <Th>Subject</Th>
                    <Th>Teacher</Th>
                    <Th>Room</Th>
                    <Th>Action</Th>
                  </Tr>
                </THead>
                <TBody>
                  {rows.map((r) => (
                    <Tr key={r.id}>
                      <Td>
                        <Badge variant="brand">{r.dayOfWeek}</Badge>
                      </Td>
                      <Td className="text-sub">
                        {r.startTime}–{r.endTime}
                      </Td>
                      <Td className="font-medium">{r.class.name}</Td>
                      <Td>{r.subject.name}</Td>
                      <Td className="text-sub">{r.teacher.name}</Td>
                      <Td className="text-sub">{r.room ?? "—"}</Td>
                      <Td>
                        <form
                          action={async () => {
                            "use server";
                            await deleteTimetableEntry(r.id);
                          }}
                        >
                          <Button variant="ghost" size="sm" type="submit">
                            Delete
                          </Button>
                        </form>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>
        </Reveal>
      )}
    </div>
  );
}
