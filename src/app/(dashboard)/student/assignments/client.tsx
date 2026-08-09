"use client"

import { DataTable } from "@/components/ui/data-table"

interface ClientProps {
  assignments: any[]
}

export function StudentAssignmentsClient({ assignments }: ClientProps) {
  return (
    <DataTable
      data={assignments}
      columns={[
        { key: "title", header: "Title", render: (a) => <span className="font-bold">{a.title}</span> },
        { key: "subject", header: "Subject", render: (a) => a.subject.name },
        { key: "maxMarks", header: "Max Marks", render: (a) => String(a.maxMarks) },
        {
          key: "deadline",
          header: "Deadline",
          render: (a) => {
            const d = new Date(a.deadline)
            const now = new Date()
            const isOverdue = d < now && a.submissions.length === 0
            return (
              <span className={isOverdue ? "text-destructive" : ""}>
                {d.toLocaleDateString("en-IN")}
              </span>
            )
          },
        },
        {
          key: "status",
          header: "Status",
          render: (a) => {
            const sub = a.submissions[0]
            if (!sub) return <span className="font-hand text-lg text-foreground/40">Not submitted</span>
            if (sub.marksObtained !== null)
              return <span className="font-hand text-lg text-secondary">Graded: {sub.marksObtained}/{a.maxMarks}</span>
            return <span className="font-hand text-lg text-primary">Submitted</span>
          },
        },
      ]}
      emptyTitle="No assignments"
      emptyDescription="No assignments have been posted for your classes yet."
    />
  )
}
