import { ClassesTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { getClasses } from "@/lib/actions/classes"

export default async function ClassesPage() {
  const classes = await getClasses()
  const totalStudents = classes.reduce((s: number, c) => s + c._count.studentClasses, 0)
  const avgSize = classes.length > 0 ? Math.round(totalStudents / classes.length) : 0

  return (
    <div>
      <PageHeader
        title="Classes."
        subtitle="Manage classes and student enrollments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Classes" value={classes.length} accentColor="primary" />
        <StatCard label="Total Enrollments" value={totalStudents} accentColor="secondary" />
        <StatCard label="Avg Class Size" value={avgSize} accentColor="primary" />
        <StatCard label="Subjects" value={classes.reduce((s: number, c) => s + c._count.subjects, 0)} accentColor="accent" />
      </div>

      <ClassesTable classes={classes} />
    </div>
  )
}
