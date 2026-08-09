import { SubjectsTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { getSubjects } from "@/lib/actions/subjects"

export default async function SubjectsPage() {
  const subjects = await getSubjects()
  const assigned = subjects.filter((s) => s.teacherId).length
  const unassigned = subjects.length - assigned

  return (
    <div>
      <PageHeader
        title="Subjects."
        subtitle="Manage subjects and teacher assignments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Subjects" value={subjects.length} accentColor="primary" />
        <StatCard label="Assigned" value={assigned} accentColor="secondary" />
        <StatCard label="Unassigned" value={unassigned} accentColor={unassigned > 0 ? "destructive" : "primary"} />
        <StatCard label="Total Exams" value={subjects.reduce((s: number, sub) => s + sub._count.exams, 0)} accentColor="accent" />
      </div>

      <SubjectsTable subjects={subjects} />
    </div>
  )
}
