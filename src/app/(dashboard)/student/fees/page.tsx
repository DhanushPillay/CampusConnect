import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/shared/ui/card";
import { Table, THead, TBody, Tr, Th, Td } from "@/shared/ui/table";
import { StatusBadge } from "@/shared/ui/badge";
import { Reveal } from "@/shared/motion";
import { Wallet } from "lucide-react";

import { getSession } from "@/lib/auth";
import { getStudentFees } from "@/features/fees/actions";
import { formatINR, formatDate } from "@/lib/utils";
import { PayFeeDialog } from "./client";

export const dynamic = "force-dynamic";

export default async function StudentFees() {
  const session = await getSession();
  const invoices = await getStudentFees(session!.user.id);
  const pending = invoices.filter((i) => i.status === "UNPAID" || i.status === "PARTIAL");
  const paidSum = (i: { payments: { amount: number }[] }) =>
    i.payments.reduce((s, p) => s + p.amount, 0);
  const pendingTotal = pending.reduce((sum, i) => sum + (Number(i.amount) - paidSum(i)), 0);
  const paidTotal = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.amount), 0);
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-extrabold text-ink">Fees</h1>
        <p className="mt-1 text-sm text-sub">
          {pending.length
            ? `${pending.length} unpaid · next due ${formatDate(pending[0].dueDate)}`
            : "All clear — nothing unpaid"}
        </p>
      </div>
      {invoices.length === 0 ? (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>No invoices</CardTitle>
              <CardDescription>Fee invoices will appear here.</CardDescription>
            </CardHeader>
          </Card>
        </Reveal>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Reveal delay={0.05}>
              <Card>
                <CardContent>
                  <div className="flex items-center gap-2 text-sub">
                    <Wallet className="h-4 w-4 text-brand-600" />
                    <p className="text-sm">Pending due</p>
                  </div>
                  <p className="mt-2 font-display text-2xl font-extrabold text-ink">
                    {formatINR(pendingTotal)}
                  </p>
                  <p className="mt-1 text-sm text-sub">{pending.length} unpaid invoices</p>
                </CardContent>
              </Card>
            </Reveal>
            <Reveal delay={0.1}>
              <Card>
                <CardContent>
                  <div className="rounded-lg bg-emerald-50 px-4 py-3">
                    <p className="text-sm text-sub">Paid total</p>
                    <p className="mt-1 font-display text-2xl font-extrabold text-ink">
                      {formatINR(paidTotal)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <Card className="mt-4">
              <CardHeader>
                <div>
                  <CardTitle>Invoices</CardTitle>
                  <CardDescription>Amounts, due dates and status</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <THead>
                    <Tr>
                      <Th>Invoice</Th>
                      <Th>Amount</Th>
                      <Th>Due</Th>
                      <Th>Status</Th>
                      <Th>Action</Th>
                    </Tr>
                  </THead>
                  <TBody>
                    {invoices.map((i) => {
                      const paid = paidSum(i);
                      const remaining = Number(i.amount) - paid;
                      const payable = i.status === "UNPAID" || i.status === "PARTIAL";
                      return (
                        <Tr key={i.id}>
                          <Td className="font-medium">{i.feeStructure.name}</Td>
                          <Td className="text-sm">{formatINR(Number(i.amount))}</Td>
                          <Td className="text-sm text-sub">{formatDate(i.dueDate)}</Td>
                          <Td>
                            <StatusBadge status={i.status} />
                          </Td>
                          <Td>
                            {payable ? (
                              <PayFeeDialog
                                invoiceId={i.id}
                                remaining={remaining}
                                studentLabel={i.feeStructure.name}
                              />
                            ) : (
                              <span className="text-sm text-sub">—</span>
                            )}
                          </Td>
                        </Tr>
                      );
                    })}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          </Reveal>
          <div className="mt-4 space-y-4">
            {invoices.map((i, idx) => (
              <Reveal key={i.id} delay={Math.min(idx * 0.05, 0.2)}>
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle>{i.feeStructure.name} — payments</CardTitle>
                      <CardDescription>
                        Paid {formatINR(paidSum(i))} of {formatINR(Number(i.amount))}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {i.payments.length === 0 ? (
                      <p className="text-sm text-sub">No payments yet.</p>
                    ) : (
                      <Table>
                        <THead>
                          <Tr>
                            <Th>Amount</Th>
                            <Th>Method</Th>
                            <Th>Date</Th>
                          </Tr>
                        </THead>
                        <TBody>
                          {i.payments.map((p) => (
                            <Tr key={p.id}>
                              <Td className="text-sm font-medium">{formatINR(p.amount)}</Td>
                              <Td className="text-sm">{p.method}</Td>
                              <Td className="text-sm text-sub">{formatDate(p.paidAt)}</Td>
                            </Tr>
                          ))}
                        </TBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
