"use client"

import { DataTable } from "@/components/ui/data-table"

export function StructuresTable({ structures }: { structures: any[] }) {
  return (
    <DataTable
            data={structures}
            columns={[
              { key: "name", header: "Name", render: (f) => <span className="font-bold">{f.name}</span> },
              { key: "amount", header: "Amount", render: (f) => <span className="font-serif">₹{f.amount.toLocaleString("en-IN")}</span> },
              { key: "class", header: "Class", render: (f) => `${f.class.name} ${f.class.section || ""}` },
              { key: "semester", header: "Semester", render: (f) => f.semester.name },
              { key: "dueDate", header: "Due Date", render: (f) => f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "—" },
              { key: "invoices", header: "Invoices", render: (f) => String(f._count.invoices) },
            ]}
            emptyTitle="No fee structures"
            emptyDescription="Create fee structures to start generating invoices."
          />
  )
}

export function InvoicesTable({ invoices }: { invoices: any[] }) {
  return (
    <DataTable
            data={invoices.slice(0, 20)}
            columns={[
              { key: "student", header: "Student", render: (i) => <span className="font-bold">{i.student.name}</span> },
              { key: "feeStructure", header: "Fee", render: (i) => i.feeStructure.name },
              { key: "amount", header: "Amount", render: (i) => <span className="font-serif">₹{i.amount.toLocaleString("en-IN")}</span> },
              { key: "dueDate", header: "Due", render: (i) => new Date(i.dueDate).toLocaleDateString("en-IN") },
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
            ]}
            emptyTitle="No invoices yet"
            emptyDescription="Generate invoices from fee structures."
          />
  )
}

