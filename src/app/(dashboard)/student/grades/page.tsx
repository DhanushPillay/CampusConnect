import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getStudentGradeSummary } from "@/lib/actions/grades"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentGradesPage() {
  const user = await getCurrentUser()
  const semesterGrades = user?.id ? await getStudentGradeSummary(user.id) : []

  const currentCGPA = semesterGrades[0]?.cgpa || 0
  const totalCredits = semesterGrades.reduce(
    (s: number, sem) => s + sem.grades.length,
    0
  )
  const avgCGPA =
    semesterGrades.length > 0
      ? (
          semesterGrades.reduce((s: number, sem) => s + (sem.cgpa || 0), 0) /
          semesterGrades.length
        ).toFixed(1)
      : "—"

  return (
    <div>
      <PageHeader
        title="My Grades."
        subtitle="View your academic performance."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Current CGPA" value={currentCGPA || "—"} accentColor="primary" />
        <StatCard label="Average CGPA" value={avgCGPA} accentColor="secondary" />
        <StatCard label="Subjects Taken" value={totalCredits} accentColor="primary" />
      </div>

      {semesterGrades.length === 0 ? (
        <Card className="p-12">
          <p className="font-hand text-xl text-foreground/40 text-center">No grades available yet.</p>
          <p className="font-serif text-sm text-foreground/30 text-center mt-1">Your grades will appear here once published.</p>
        </Card>
      ) : (
        <div className="space-y-8">
          {semesterGrades.map((sem) => (
            <div key={sem.name}>
              <h2 className="font-display font-bold text-xl uppercase mb-4">{sem.name}</h2>
              <Card className="overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/20">
                      <th className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70">Subject</th>
                      <th className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70">Marks</th>
                      <th className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70">Grade</th>
                      <th className="px-4 py-3 font-serif text-sm font-semibold text-foreground/70">CGPA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.grades.map((grade) => (
                      <tr key={grade.id} className="border-b border-border/50">
                        <td className="px-4 py-3 font-serif font-bold">{grade.subject.name}</td>
                        <td className="px-4 py-3 font-serif">
                          {grade.marksObtained}/{grade.totalMarks}
                        </td>
                        <td className="px-4 py-3 font-hand text-lg">
                          {grade.grade || "—"}
                        </td>
                        <td className="px-4 py-3 font-serif font-bold">
                          {grade.cgpa || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
