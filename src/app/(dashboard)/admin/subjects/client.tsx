"use client"

import { DataTable } from "@/components/ui/data-table"

export function SubjectsTable({ subjects }: { subjects: any[] }) {
  return (
    <DataTable
            data={subjects}
            columns={[
              { key: "name", header: "Name", render: (s) => <span className="font-bold">{s.name}</span> },
              { key: "code", header: "Code", render: (s) => <span className="font-hand text-lg">{s.code}</span> },
              { key: "class", header: "Class", render: (s) => `${s.class.name} ${s.class.section || ""}` },
              { key: "teacher", header: "Teacher", render: (s) => s.teacher?.name || <span className="text-destructive">Unassigned</span> },
              { key: "assignments", header: "Assignments", render: (s) => String(s._count.assignments) },
              { key: "exams", header: "Exams", render: (s) => String(s._count.exams) },
            ]}
            emptyTitle="No subjects yet"
            emptyDescription="Add subjects to your classes."
          />
  )
}

