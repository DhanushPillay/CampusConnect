import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { TeacherAssignmentsClient } from "./client"
import { getAssignments } from "@/lib/actions/assignments"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherAssignmentsPage() {
  const user = await getCurrentUser()
  const assignments = user?.id ? await getAssignments({ teacherId: user.id }) : []
  const totalSubmissions = assignments.reduce((s: number, a) => s + a._count.submissions, 0)
  const pendingGrading = assignments.filter(
    (a) => a.submissions && a.submissions.some((s: any) => !s.marksObtained)
  ).length

  return (
    <div>
      <PageHeader
        title="Assignments."
        subtitle="Create and manage student assignments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Assignments" value={assignments.length} accentColor="primary" />
        <StatCard label="Submissions" value={totalSubmissions} accentColor="secondary" />
        <StatCard label="Pending Review" value={pendingGrading} accentColor={pendingGrading > 0 ? "accent" : "primary"} />
      </div>

      <TeacherAssignmentsClient assignments={assignments} />
    </div>
  )
}
