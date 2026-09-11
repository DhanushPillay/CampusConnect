import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
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
import { getUsers, toggleUserActive, createUser } from "@/lib/actions/admin";
import { FormSelect } from "../components";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await getUsers();
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Users</h1>
          <p className="mt-1 text-sm text-sub">
            {users.length} members · deactivate instead of delete
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">New user</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>Accounts can sign in immediately.</DialogDescription>
            <form
              className="mt-4 space-y-3"
              action={async (formData: FormData) => {
                "use server";
                await createUser(
                  String(formData.get("name")),
                  String(formData.get("email")),
                  String(formData.get("password")),
                  String(formData.get("role"))
                );
              }}
            >
              <div>
                <FieldLabel>Name</FieldLabel>
                <Input name="name" placeholder="Aarav Sharma" required />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <Input name="email" type="email" placeholder="user@campus.edu" required />
              </div>
              <div>
                <FieldLabel>Password</FieldLabel>
                <Input name="password" type="password" minLength={6} required />
              </div>
              <div>
                <FieldLabel>Role</FieldLabel>
                <FormSelect
                  name="role"
                  placeholder="Select role"
                  options={[
                    { value: "ADMIN", label: "Admin" },
                    { value: "TEACHER", label: "Teacher" },
                    { value: "STUDENT", label: "Student" },
                  ]}
                />
              </div>
              <Button type="submit" className="w-full">
                Create user
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {users.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent>
              <p className="font-display font-bold text-ink">No users yet</p>
              <p className="mt-1 text-sm text-sub">Create the first account to get started.</p>
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>All members</CardTitle>
                <CardDescription>Roles and account status</CardDescription>
              </div>
              <Badge variant="brand">{users.length} total</Badge>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <Table>
                <THead>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </Tr>
                </THead>
                <TBody>
                  {users.map((u) => (
                    <Tr key={u.id}>
                      <Td className="font-medium">{u.name}</Td>
                      <Td className="text-sub">{u.email}</Td>
                      <Td>
                        <Badge variant="outline">{u.role}</Badge>
                      </Td>
                      <Td>
                        <StatusBadge status={u.isActive ? "Active" : "Inactive"} />
                      </Td>
                      <Td>
                        <form
                          action={async () => {
                            "use server";
                            await toggleUserActive(u.id);
                          }}
                        >
                          <Button variant="outline" size="sm" type="submit">
                            {u.isActive ? "Deactivate" : "Activate"}
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
