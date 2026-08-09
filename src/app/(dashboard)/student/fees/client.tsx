"use client"

import { DataTable } from "@/components/ui/data-table"

interface ClientProps {
  invoices: any[]
}

export function StudentFeesClient({ invoices }: ClientProps) {
  return (
    <DataTable
      data={invoices}
      columns={[
        { key: "feeStructure", header: "Fee", render: (i) => <span className="font-bold">{i.feeStructure.name}</span> },
        { key: "amount", header: "Amount", render: (i) => <span className="font-serif">₹{i.amount.toLocaleString("en-IN")}</span> },
        { key: "dueDate", header: "Due Date", render: (i) => new Date(i.dueDate).toLocaleDateString("en-IN") },
        {
          key: "status",
          header: "Status",
          render: (i) => (
            <span className={`font-hand text-lg ${
              i.status === "PAID" ? "text-secondary" :
              i.status === "PARTIAL" ? "text-primary" :
              "text-destructive"
            }`}>
              {i.status}
            </span>
          ),
        },
        {
          key: "payments",
          header: "Paid",
          render: (i) => {
            const paid = i.payments.reduce((s: number, p: any) => s + p.amount, 0)
            return paid > 0 ? (
              <span className="font-serif">₹{paid.toLocaleString("en-IN")}</span>
            ) : (
              "—"
            )
          },
        },
      ]}
      emptyTitle="No fee records"
      emptyDescription="Your fee invoices will appear here."
    />
  )
}
