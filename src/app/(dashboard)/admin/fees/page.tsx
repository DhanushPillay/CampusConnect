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
import {
  getFeeOverview,
  getFeeStructures,
  getFeeInvoices,
  getClasses,
  getStudentUsers,
  createFeeStructure,
  createFeeInvoice,
  recordFeePayment,
} from "@/lib/actions/admin";
import { formatINR } from "@/lib/utils";
import { Wallet, CalendarDays } from "lucide-react";
import { FormSelect } from "../_components";

export const dynamic = "force-dynamic";

export default async function AdminFees() {
  const [f, structures, invoices, classes, students] = await Promise.all([
    getFeeOverview(),
    getFeeStructures(),
    getFeeInvoices(),
    getClasses(),
    getStudentUsers(),
  ]);
  const stats = [
    {
      label: "Collected",
      value: formatINR(f.collected),
      hint: "Paid invoices",
      icon: Wallet,
    },
    {
      label: "Pending",
      value: formatINR(f.pending),
      hint: `${f.pendingCount} unpaid invoices`,
      icon: CalendarDays,
    },
  ];
  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">Fees</h1>
          <p className="mt-1 text-sm text-sub">Collection vs pending across campus</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                New invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create invoice</DialogTitle>
              <DialogDescription>Bill a single student.</DialogDescription>
              <form
                className="mt-4 space-y-3"
                action={async (formData: FormData) => {
                  "use server";
                  await createFeeInvoice(
                    String(formData.get("studentId")),
                    String(formData.get("feeStructureId")),
                    Number(formData.get("amount")),
                    String(formData.get("dueDate"))
                  );
                }}
              >
                <div>
                  <FieldLabel>Student</FieldLabel>
                  <FormSelect
                    name="studentId"
                    placeholder="Select student"
                    options={students.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.email})`,
                    }))}
                  />
                </div>
                <div>
                  <FieldLabel>Fee structure</FieldLabel>
                  <FormSelect
                    name="feeStructureId"
                    placeholder="Select structure"
                    options={structures.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </div>
                <div>
                  <FieldLabel>Amount</FieldLabel>
                  <Input name="amount" type="number" min={1} step="any" required />
                </div>
                <div>
                  <FieldLabel>Due date</FieldLabel>
                  <Input name="dueDate" type="date" required />
                </div>
                <Button type="submit" className="w-full">
                  Create invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">New fee structure</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create fee structure</DialogTitle>
              <DialogDescription>
                Auto-creates an unpaid invoice per enrolled student.
              </DialogDescription>
              <form
                className="mt-4 space-y-3"
                action={async (formData: FormData) => {
                  "use server";
                  await createFeeStructure(
                    String(formData.get("name")),
                    Number(formData.get("amount")),
                    String(formData.get("classId")),
                    String(formData.get("dueDate"))
                  );
                }}
              >
                <div>
                  <FieldLabel>Name</FieldLabel>
                  <Input name="name" placeholder="Term 1 Tuition" required />
                </div>
                <div>
                  <FieldLabel>Amount</FieldLabel>
                  <Input name="amount" type="number" min={1} step="any" required />
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
                  <FieldLabel>Due date</FieldLabel>
                  <Input name="dueDate" type="date" required />
                </div>
                <Button type="submit" className="w-full">
                  Create structure
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <Reveal key={stat.label} delay={i * 0.06}>
            <Card>
              <CardContent className="flex items-start gap-3">
                <span className="rounded-lg bg-brand-50 p-2 text-brand-700">
                  <stat.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-display text-2xl font-extrabold text-ink">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-sm font-medium text-ink">{stat.label}</span>
                  <span className="block text-xs text-sub">{stat.hint}</span>
                </span>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1} className="mt-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Payment status per student</CardDescription>
            </div>
            <Badge variant="brand">{invoices.length} total</Badge>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {invoices.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-sub">
                No invoices yet. Create a fee structure to bill a whole class.
              </p>
            ) : (
              <Table>
                <THead>
                  <Tr>
                    <Th>Student</Th>
                    <Th>Structure</Th>
                    <Th>Amount</Th>
                    <Th>Paid</Th>
                    <Th>Status</Th>
                    <Th>Action</Th>
                  </Tr>
                </THead>
                <TBody>
                  {invoices.map((inv) => {
                    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                    return (
                      <Tr key={inv.id}>
                        <Td className="font-medium">{inv.student.name}</Td>
                        <Td className="text-sub">{inv.feeStructure.name}</Td>
                        <Td>{formatINR(inv.amount)}</Td>
                        <Td className="text-sub">{formatINR(paid)}</Td>
                        <Td>
                          <StatusBadge status={inv.status} />
                        </Td>
                        <Td>
                          {inv.status !== "PAID" && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Record payment
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogTitle>Record payment</DialogTitle>
                                <DialogDescription>
                                  {inv.student.name} owes {formatINR(inv.amount - paid)}.
                                </DialogDescription>
                                <form
                                  className="mt-4 space-y-3"
                                  action={async (formData: FormData) => {
                                    "use server";
                                    await recordFeePayment(
                                      inv.id,
                                      Number(formData.get("amount")),
                                      String(formData.get("method"))
                                    );
                                  }}
                                >
                                  <div>
                                    <FieldLabel>Amount</FieldLabel>
                                    <Input
                                      name="amount"
                                      type="number"
                                      min={1}
                                      step="any"
                                      defaultValue={inv.amount - paid}
                                      required
                                    />
                                  </div>
                                  <div>
                                    <FieldLabel>Method</FieldLabel>
                                    <FormSelect
                                      name="method"
                                      placeholder="Select method"
                                      defaultValue="CASH"
                                      options={[
                                        { value: "CASH", label: "Cash" },
                                        { value: "UPI", label: "UPI" },
                                        { value: "CARD", label: "Card" },
                                        { value: "NETBANKING", label: "Netbanking" },
                                      ]}
                                    />
                                  </div>
                                  <Button type="submit" className="w-full">
                                    Record payment
                                  </Button>
                                </form>
                              </DialogContent>
                            </Dialog>
                          )}
                        </Td>
                      </Tr>
                    );
                  })}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
