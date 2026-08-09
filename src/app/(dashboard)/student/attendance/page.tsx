import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getStudentAttendanceSummary, getAttendanceRecords } from "@/lib/actions/attendance"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentAttendancePage() {
  const user = await getCurrentUser()
  const summary = user?.id ? await getStudentAttendanceSummary(user.id) : []
  const records = user?.id
    ? await getAttendanceRecords({ studentId: user.id })
    : []

  const overallTotal = summary.reduce((s: number, r) => s + r.total, 0)
  const overallPresent = summary.reduce((s: number, r) => s + r.present, 0)
  const overallPercentage = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0
  const belowTarget = summary.filter((r) => r.percentage < 75).length

  return (
    <div>
      <PageHeader
        title="My Attendance."
        subtitle="Track your attendance across all subjects."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Overall Attendance" value={`${overallPercentage}%`} accentColor={overallPercentage >= 75 ? "primary" : "destructive"} />
        <StatCard label="Total Classes" value={overallTotal} accentColor="secondary" />
        <StatCard label="Present" value={overallPresent} accentColor="primary" />
        <StatCard label="Below 75%" value={belowTarget} accentColor={belowTarget > 0 ? "destructive" : "primary"} />
      </div>

      <h2 className="font-display font-bold text-xl uppercase mb-4">By Subject</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {summary.map((s) => (
          <Card key={s.subjectId} className="p-5">
            <h3 className="font-serif font-bold text-lg">{s.subjectName}</h3>
            <div className="mt-3">
              <div className="flex justify-between font-hand text-lg mb-1">
                <span className="text-foreground/60">{s.present}/{s.total} classes</span>
                <span className={s.percentage >= 75 ? "text-secondary" : "text-destructive"}>
                  {s.percentage}%
                </span>
              </div>
              <div className="h-2 bg-muted/30 w-full">
                <div
                  className={`h-full ${s.percentage >= 75 ? "bg-secondary" : "bg-destructive"}`}
                  style={{ width: `${Math.min(s.percentage, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="font-display font-bold text-xl uppercase mb-4">Recent Records</h2>
      <div className="space-y-2">
        {records.slice(0, 10).map((record) => (
          <Card key={record.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-serif font-bold">{record.subject.name}</span>
              <span className="font-hand text-foreground/40 ml-4">
                {new Date(record.date).toLocaleDateString("en-IN")}
              </span>
            </div>
            <span className={`font-hand text-lg ${
              record.status === "PRESENT" ? "text-secondary" :
              record.status === "LATE" ? "text-primary" :
              "text-destructive"
            }`}>
              {record.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
