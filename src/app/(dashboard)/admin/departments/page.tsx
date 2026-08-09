import { DepartmentsTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { getDepartments } from "@/lib/actions/departments"

export default async function DepartmentsPage() {
  const departments = await getDepartments()

  return (
    <div>
      <PageHeader
        title="Departments."
        subtitle="Organize your academic departments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Departments" value={departments.length} accentColor="primary" />
        <StatCard label="Total Classes" value={departments.reduce((s: number, d) => s + d._count.classes, 0)} accentColor="secondary" />
      </div>

      <DepartmentsTable departments={departments} />
    </div>
  )
}
