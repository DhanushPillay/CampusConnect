import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { StudentAssignmentsClient } from "./client"
import { getStudentAssignments } from "@/lib/actions/student"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentAssignmentsPage() {
  const user = await getCurrentUser()
  const assignments = user?.id ? await getStudentAssignments(user.id) : []

  const submitted = assignments.filter((a) => a.submissions.length > 0).length
  const pending = assignments.length - submitted
  const graded = assignments.filter(
    (a) => a.submissions.length > 0 && a.submissions[0].marksObtained !== null
  ).length

  return (
    <div>
      <PageHeader
        title="My Assignments."
        subtitle="View and submit your assignments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total" value={assignments.length} accentColor="primary" />
        <StatCard label="Submitted" value={submitted} accentColor="secondary" />
        <StatCard label="Pending" value={pending} accentColor={pending > 0 ? "accent" : "primary"} />
        <StatCard label="Graded" value={graded} accentColor="primary" />
      </div>

      <StudentAssignmentsClient assignments={assignments} />
    </div>
  )
}
