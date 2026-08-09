import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getSubjectsByTeacher } from "@/lib/actions/subjects"
import { getAttendanceRecords } from "@/lib/actions/attendance"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherAttendancePage() {
  const user = await getCurrentUser()
  const subjects = user?.id ? await getSubjectsByTeacher(user.id) : []

  const today = new Date()
  const todayRecords = user?.id
    ? await getAttendanceRecords({
        teacherId: user.id,
        date: today,
      })
    : []

  const presentCount = todayRecords.filter((r) => r.status === "PRESENT").length
  const attendanceRate = todayRecords.length > 0
    ? Math.round((presentCount / todayRecords.length) * 100)
    : 0

  return (
    <div>
      <PageHeader
        title="Attendance."
        subtitle="Mark and track student attendance."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Today's Records" value={todayRecords.length} accentColor="primary" />
        <StatCard label="Present" value={presentCount} accentColor="secondary" />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} accentColor={attendanceRate >= 75 ? "primary" : "destructive"} />
        <StatCard label="Subjects" value={subjects.length} accentColor="accent" />
      </div>

      <h2 className="font-display font-bold text-xl uppercase mb-4">Today's Attendance</h2>
      {todayRecords.length === 0 ? (
        <Card className="p-8">
          <p className="font-hand text-xl text-foreground/40 text-center">No attendance recorded today.</p>
          <p className="font-serif text-sm text-foreground/30 text-center mt-1">Select a subject to start marking.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {todayRecords.map((record) => (
            <Card key={record.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-serif font-bold">{record.student.name}</span>
                <span className="font-hand text-lg text-foreground/40 ml-4">{record.subject.name}</span>
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
      )}
    </div>
  )
}
