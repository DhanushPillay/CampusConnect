import { CampusesTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { getCampuses } from "@/lib/actions/campuses"

export default async function CampusesPage() {
  const campuses = await getCampuses()
  const totalStudents = campuses.reduce((sum: number, c) => sum + c._count.users, 0)

  return (
    <div>
      <PageHeader
        title="Campuses."
        subtitle="Manage your institution's campuses."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Campuses" value={campuses.length} accentColor="primary" />
        <StatCard label="Total Users" value={totalStudents} accentColor="secondary" />
        <StatCard label="Departments" value={campuses.reduce((s: number, c) => s + c._count.departments, 0)} accentColor="primary" />
        <StatCard label="Classes" value={campuses.reduce((s: number, c) => s + c._count.classes, 0)} accentColor="accent" />
      </div>

      <CampusesTable campuses={campuses} />
    </div>
  )
}
