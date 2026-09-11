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
  getClassesWithStudents,
  getDepartments,
  getStudentUsers,
  createClass,
  enrollStudent,
  unenrollStudent,
} from "@/lib/actions/admin";
import { FormSelect } from "../_components";

export const dynamic = "force-dynamic";

export default async function AdminClasses() {
  const [classes, departments, students] = await Promise.all([
    getClassesWithStudents(),
    getDepartments(),
    getStudentUsers(),
  ]);
  const studentOptions = students.map((s) => ({
    value: s.id,
    label: `${s.name} (${s.email})`,
  }));
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Classes</h1>
          <p className="mt-1 text-sm text-sub">Enrollments and subjects per class</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">New class</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create class</DialogTitle>
            <DialogDescription>Group students under a department.</DialogDescription>
            <form
              className="mt-4 space-y-3"
              action={async (formData: FormData) => {
                "use server";
                await createClass(
                  String(formData.get("name")),
                  String(formData.get("section")),
                  String(formData.get("departmentId"))
                );
              }}
            >
              <div>
                <FieldLabel>Name</FieldLabel>
                <Input name="name" placeholder="B.Tech CSE Year 2" required />
              </div>
              <div>
                <FieldLabel>Section</FieldLabel>
                <Input name="section" placeholder="A" />
              </div>
              <div>
                <FieldLabel>Department</FieldLabel>
                <FormSelect
                  name="departmentId"
                  placeholder="Select department"
                  options={departments.map((d) => ({ value: d.id, label: d.name }))}
                />
              </div>
              <Button type="submit" className="w-full">
                Create class
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {classes.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <p className="font-display font-bold text-ink">No classes</p>
              <p className="mt-1 text-sm text-sub">Create a class to start enrolling students.</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>All classes</CardTitle>
                <CardDescription>Enrollments and subject counts</CardDescription>
              </div>
              <Badge variant="brand">{classes.length} total</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <Tr>
                    <Th>Class</Th>
                    <Th>Department</Th>
                    <Th>Students</Th>
                    <Th>Subjects</Th>
                    <Th>Enroll</Th>
                  </Tr>
                </THead>
                <TBody>
                  {classes.map((c) => (
                    <Tr key={c.id}>
                      <Td className="font-medium">
                        {c.name}
                        {c.section ? ` · Sec ${c.section}` : ""}
                      </Td>
                      <Td className="text-sub">{c.department.name}</Td>
                      <Td>
                        <Badge variant="brand">{c._count.enrollments} students</Badge>
                      </Td>
                      <Td>
                        <Badge variant="muted">{c._count.subjects} subjects</Badge>
                      </Td>
                      <Td>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>
                              {c.name}
                              {c.section ? ` · Sec ${c.section}` : ""}
                            </DialogTitle>
                            <DialogDescription>
                              {c.enrollments.length} enrolled students
                            </DialogDescription>
                            <div className="mt-4 space-y-2">
                              {c.enrollments.length === 0 && (
                                <p className="text-sm text-sub">No students enrolled yet.</p>
                              )}
                              {c.enrollments.map((e) => (
                                <div
                                  key={e.student.id}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2"
                                >
                                  <span className="text-sm font-medium text-ink">
                                    {e.student.name}
                                    <span className="block text-xs font-normal text-sub">
                                      {e.student.email}
                                    </span>
                                  </span>
                                  <form
                                    action={async () => {
                                      "use server";
                                      await unenrollStudent(e.student.id, c.id);
                                    }}
                                  >
                                    <Button variant="ghost" size="sm" type="submit">
                                      Remove
                                    </Button>
                                  </form>
                                </div>
                              ))}
                            </div>
                            <form
                              className="mt-4 space-y-3 border-t border-border pt-4"
                              action={async (formData: FormData) => {
                                "use server";
                                await enrollStudent(String(formData.get("studentId")), c.id);
                              }}
                            >
                              <div>
                                <FieldLabel>Enroll student</FieldLabel>
                                <FormSelect
                                  name="studentId"
                                  placeholder="Select student"
                                  options={studentOptions}
                                />
                              </div>
                              <Button type="submit" size="sm" className="w-full">
                                Enroll
                              </Button>
                            </form>
                          </DialogContent>
                        </Dialog>
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
