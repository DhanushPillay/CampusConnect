"use client"

import { DataTable } from "@/components/ui/data-table"

export function ClassesTable({ classes }: { classes: any[] }) {
  return (
    <DataTable
            data={classes}
            columns={[
              { key: "name", header: "Class", render: (c) => <span className="font-bold">{c.name} {c.section}</span> },
              { key: "department", header: "Department", render: (c) => c.department.name },
              { key: "campus", header: "Campus", render: (c) => c.campus.name },
              { key: "students", header: "Students", render: (c) => String(c._count.studentClasses) },
              { key: "subjects", header: "Subjects", render: (c) => String(c._count.subjects) },
            ]}
            emptyTitle="No classes yet"
            emptyDescription="Create your first class to start enrolling students."
          />
  )
}

