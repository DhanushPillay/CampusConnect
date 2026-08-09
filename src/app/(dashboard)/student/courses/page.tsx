import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getStudentClasses } from "@/lib/actions/student"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentCoursesPage() {
  const user = await getCurrentUser()
  const enrollments = user?.id ? await getStudentClasses(user.id) : []
  const totalSubjects = enrollments.reduce(
    (s: number, e) => s + e.class.subjects.length,
    0
  )

  return (
    <div>
      <PageHeader
        title="My Courses."
        subtitle="Subjects you're enrolled in."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Enrolled Classes" value={enrollments.length} accentColor="primary" />
        <StatCard label="Total Subjects" value={totalSubjects} accentColor="secondary" />
      </div>

      <div className="space-y-6">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id}>
            <h2 className="font-display font-bold text-xl uppercase mb-3">
              {enrollment.class.name} {enrollment.class.section} — {enrollment.class.department.name}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrollment.class.subjects.map((subject) => (
                <Card key={subject.id} className="p-5 border-l-4 border-l-secondary">
                  <div className="font-hand text-lg text-foreground/40 mb-1">{subject.code}</div>
                  <h3 className="font-serif font-bold text-lg">{subject.name}</h3>
                  <p className="font-hand text-foreground/60 mt-2">
                    {subject.teacher?.name || "No teacher assigned"}
                  </p>
                  <div className="flex gap-3 mt-3 font-hand text-foreground/40">
                    <span>{subject._count.assignments} assignments</span>
                    <span>{subject._count.exams} exams</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
