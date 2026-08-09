import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
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

      <DataTable
        data={assignments}
        columns={[
          { key: "title", header: "Title", render: (a) => <span className="font-bold">{a.title}</span> },
          { key: "subject", header: "Subject", render: (a) => a.subject.name },
          { key: "class", header: "Class", render: (a) => `${a.subject.class.name} ${a.subject.class.section || ""}` },
          { key: "maxMarks", header: "Max Marks", render: (a) => String(a.maxMarks) },
          {
            key: "deadline",
            header: "Deadline",
            render: (a) => {
              const deadline = new Date(a.deadline)
              const now = new Date()
              const isOverdue = deadline < now
              return (
                <span className={isOverdue ? "text-destructive" : ""}>
                  {deadline.toLocaleDateString("en-IN")}
                </span>
              )
            },
          },
          { key: "submissions", header: "Submissions", render: (a) => String(a._count.submissions) },
        ]}
        emptyTitle="No assignments yet"
        emptyDescription="Create your first assignment for students."
      />
    </div>
  )
}
