import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
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

      <DataTable
        data={assignments}
        columns={[
          { key: "title", header: "Title", render: (a) => <span className="font-bold">{a.title}</span> },
          { key: "subject", header: "Subject", render: (a) => a.subject.name },
          { key: "maxMarks", header: "Max Marks", render: (a) => String(a.maxMarks) },
          {
            key: "deadline",
            header: "Deadline",
            render: (a) => {
              const d = new Date(a.deadline)
              const now = new Date()
              const isOverdue = d < now && a.submissions.length === 0
              return (
                <span className={isOverdue ? "text-destructive" : ""}>
                  {d.toLocaleDateString("en-IN")}
                </span>
              )
            },
          },
          {
            key: "status",
            header: "Status",
            render: (a) => {
              const sub = a.submissions[0]
              if (!sub) return <span className="font-hand text-lg text-foreground/40">Not submitted</span>
              if (sub.marksObtained !== null)
                return <span className="font-hand text-lg text-secondary">Graded: {sub.marksObtained}/{a.maxMarks}</span>
              return <span className="font-hand text-lg text-primary">Submitted</span>
            },
          },
        ]}
        emptyTitle="No assignments"
        emptyDescription="No assignments have been posted for your classes yet."
      />
    </div>
  )
}
