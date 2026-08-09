import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getSubjectsByTeacher } from "@/lib/actions/subjects"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherClassesPage() {
  const user = await getCurrentUser()
  const subjects = user?.id ? await getSubjectsByTeacher(user.id) : []
  const totalStudents = subjects.reduce((s: number, sub) => s + ((sub.class as any)._count?.studentClasses || 0), 0)

  return (
    <div>
      <PageHeader
        title="My Classes."
        subtitle="Subjects you're teaching this semester."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="My Subjects" value={subjects.length} accentColor="primary" />
        <StatCard label="Total Students" value={totalStudents} accentColor="secondary" />
        <StatCard label="Assignments" value={subjects.reduce((s: number, sub) => s + sub._count.assignments, 0)} accentColor="accent" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <Card key={subject.id} className="p-6 border-l-4 border-l-primary">
            <div className="font-hand text-xl text-foreground/60 mb-2">{subject.code}</div>
            <h3 className="font-display font-bold text-2xl uppercase">{subject.name}</h3>
            <p className="font-serif text-sm text-foreground/60 mt-2">
              Class {subject.class.name} {subject.class.section}
            </p>
            <div className="flex gap-4 mt-4 font-hand text-lg">
              <span className="text-foreground/40">{subject._count.assignments} assignments</span>
              <span className="text-foreground/40">{subject._count.exams} exams</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
