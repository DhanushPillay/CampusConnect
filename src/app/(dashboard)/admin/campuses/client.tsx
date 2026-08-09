"use client"

import { DataTable } from "@/components/ui/data-table"

export function CampusesTable({ campuses }: { campuses: any[] }) {
  return (
    <DataTable
            data={campuses}
            columns={[
              { key: "name", header: "Name", render: (c) => <span className="font-bold">{c.name}</span> },
              { key: "address", header: "Address", render: (c) => c.address || "—" },
              { key: "phone", header: "Phone", render: (c) => c.phone || "—" },
              { key: "email", header: "Email", render: (c) => c.email || "—" },
              { key: "users", header: "Users", render: (c) => String(c._count.users) },
              { key: "departments", header: "Depts", render: (c) => String(c._count.departments) },
              { key: "classes", header: "Classes", render: (c) => String(c._count.classes) },
            ]}
            emptyTitle="No campuses yet"
            emptyDescription="Create your first campus to get started."
          />
  )
}

