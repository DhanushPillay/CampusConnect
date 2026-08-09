import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { TeacherExamsClient } from "./client"
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

      <TeacherExamsClient exams={exams} />
    </div>
  )
}
