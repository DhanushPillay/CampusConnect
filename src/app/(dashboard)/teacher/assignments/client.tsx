"use client"

import { DataTable } from "@/components/ui/data-table"

interface ClientProps {
  assignments: any[]
}

export function TeacherAssignmentsClient({ assignments }: ClientProps) {
  return (
    <DataTable
      data={assignments}
      columns={[
        { key: "title", header: "Title", render: (a) => <span className="font-bold">{a.title}</span> },
        { key: "subject", header: "Subject", render: (a) => a.subject.name },
        { key: "class", header: "Class", render: (a) => `${a.subject.class.name} ${a.subject.class.section || ""}` },
        { key: "maxMarks", header: "Max Marks", render: (a) => String(a.maxMarks) },
        {
          key: "deadline",
          header: "Deadline",
          render: (a) => {
            const deadline = new Date(a.deadline)
            const now = new Date()
            const isOverdue = deadline < now
            return (
              <span className={isOverdue ? "text-destructive" : ""}>
                {deadline.toLocaleDateString("en-IN")}
              </span>
            )
          },
        },
        { key: "submissions", header: "Submissions", render: (a) => String(a._count.submissions) },
      ]}
      emptyTitle="No assignments yet"
      emptyDescription="Create your first assignment for students."
    />
  )
}
