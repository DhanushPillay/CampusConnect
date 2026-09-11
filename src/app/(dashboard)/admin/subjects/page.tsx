import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, FieldLabel } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Reveal } from "@/components/motion";
import {
  getSubjects,
  getClasses,
  getTeacherUsers,
  createSubject,
  assignTeacher,
} from "@/lib/actions/admin";
import { FormSelect } from "../components";

export const dynamic = "force-dynamic";

export default async function AdminSubjects() {
  const [subjects, classes, teachers] = await Promise.all([
    getSubjects(),
    getClasses(),
    getTeacherUsers(),
  ]);
  const teacherOptions = teachers.map((t) => ({
    value: t.id,
    label: `${t.name} (${t.email})`,
  }));
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Subjects</h1>
          <p className="mt-1 text-sm text-sub">Teacher assignment per subject</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">New subject</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create subject</DialogTitle>
            <DialogDescription>Codes must be unique across campus.</DialogDescription>
            <form
              className="mt-4 space-y-3"
              action={async (formData: FormData) => {
                "use server";
                await createSubject(
                  String(formData.get("name")),
                  String(formData.get("code")),
                  String(formData.get("classId"))
                );
              }}
            >
              <div>
                <FieldLabel>Name</FieldLabel>
                <Input name="name" placeholder="Data Structures" required />
              </div>
              <div>
                <FieldLabel>Code</FieldLabel>
                <Input name="code" placeholder="CS201" required />
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
              <Button type="submit" className="w-full">
                Create subject
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {subjects.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <p className="font-display font-bold text-ink">No subjects</p>
              <p className="mt-1 text-sm text-sub">Create a subject to assign teachers.</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>All subjects</CardTitle>
                <CardDescription>Codes, classes, and assigned teachers</CardDescription>
              </div>
              <Badge variant="brand">{subjects.length} total</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <Tr>
                    <Th>Subject</Th>
                    <Th>Code</Th>
                    <Th>Class</Th>
                    <Th>Teacher</Th>
                  </Tr>
                </THead>
                <TBody>
                  {subjects.map((s) => (
                    <Tr key={s.id}>
                      <Td className="font-medium">{s.name}</Td>
                      <Td>
                        <Badge variant="outline">{s.code}</Badge>
                      </Td>
                      <Td className="text-sub">{s.class.name}</Td>
                      <Td>
                        {s.teacher?.name ?? (
                          <form
                            className="flex min-w-48 items-center gap-2"
                            action={async (formData: FormData) => {
                              "use server";
                              await assignTeacher(s.id, String(formData.get("teacherId")));
                            }}
                          >
                            <FormSelect
                              name="teacherId"
                              placeholder="Assign teacher"
                              options={teacherOptions}
                            />
                            <Button variant="outline" size="sm" type="submit">
                              Assign
                            </Button>
                          </form>
                        )}
                        {s.teacher?.name && (
                          <span className="text-sub">{s.teacher.name}</span>
                        )}
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
