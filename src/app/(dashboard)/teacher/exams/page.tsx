import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
import { getExams } from "@/lib/actions/exams"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherExamsPage() {
  const user = await getCurrentUser()
  const exams = user?.id ? await getExams({ teacherId: user.id }) : []
  const published = exams.filter((e) => e.isPublished).length
  const totalSubmissions = exams.reduce((s: number, e) => s + e._count.submissions, 0)

  return (
    <div>
      <PageHeader
        title="Exams."
        subtitle="Create and manage examinations."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Exams" value={exams.length} accentColor="primary" />
        <StatCard label="Published" value={published} accentColor="secondary" />
        <StatCard label="Drafts" value={exams.length - published} accentColor="accent" />
        <StatCard label="Submissions" value={totalSubmissions} accentColor="primary" />
      </div>

      <DataTable
        data={exams}
        columns={[
          { key: "name", header: "Name", render: (e) => <span className="font-bold">{e.name}</span> },
          { key: "type", header: "Type", render: (e) => <span className="font-hand text-lg">{e.type}</span> },
          { key: "subject", header: "Subject", render: (e) => e.subject.name },
          { key: "totalMarks", header: "Total Marks", render: (e) => String(e.totalMarks) },
          { key: "duration", header: "Duration", render: (e) => `${e.duration} min` },
          { key: "questions", header: "Questions", render: (e) => String(e._count.questions) },
          { key: "submissions", header: "Submissions", render: (e) => String(e._count.submissions) },
          {
            key: "isPublished",
            header: "Status",
            render: (e) => (
              <span className={`font-hand text-lg ${e.isPublished ? "text-secondary" : "text-foreground/40"}`}>
                {e.isPublished ? "Published" : "Draft"}
              </span>
            ),
          },
        ]}
        emptyTitle="No exams yet"
        emptyDescription="Create your first exam for students."
      />
    </div>
  )
}
