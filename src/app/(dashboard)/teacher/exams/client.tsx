"use client"

import { DataTable } from "@/components/ui/data-table"

interface ClientProps {
  exams: any[]
}

export function TeacherExamsClient({ exams }: ClientProps) {
  return (
    <DataTable
      data={exams}
      columns={[
        { key: "name", header: "Name", render: (e) => <span className="font-bold">{e.name}</span> },
        { key: "type", header: "Type", render: (e) => <span className="font-hand text-lg">{e.type}</span> },
        { key: "subject", header: "Subject", render: (e) => e.subject.name },
        { key: "totalMarks", header: "Total Marks", render: (e) => String(e.totalMarks) },
        { key: "duration", header: "Duration", render: (e) => `${e.duration} min` },
        { key: "questions", header: "Questions", render: (e) => String(e._count.questions) },
        { key: "submissions", header: "Submissions", render: (e) => String(e._count.submissions) },
        {
          key: "isPublished",
          header: "Status",
          render: (e) => (
            <span className={`font-hand text-lg ${e.isPublished ? "text-secondary" : "text-foreground/40"}`}>
              {e.isPublished ? "Published" : "Draft"}
            </span>
          ),
        },
      ]}
      emptyTitle="No exams yet"
      emptyDescription="Create your first exam for students."
    />
  )
}
