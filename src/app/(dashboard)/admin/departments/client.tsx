"use client"

import { DataTable } from "@/components/ui/data-table"

export function DepartmentsTable({ departments }: { departments: any[] }) {
  return (
    <DataTable
            data={departments}
            columns={[
              { key: "name", header: "Name", render: (d) => <span className="font-bold">{d.name}</span> },
              { key: "campus", header: "Campus", render: (d) => d.campus.name },
              { key: "classes", header: "Classes", render: (d) => String(d._count.classes) },
              {
                key: "createdAt",
                header: "Created",
                render: (d) => new Date(d.createdAt).toLocaleDateString("en-IN"),
              },
            ]}
            emptyTitle="No departments yet"
            emptyDescription="Create your first department to organize classes."
          />
  )
}

