import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { getCurrentUser } from "@/lib/auth"
import { getSubjectsByTeacher } from "@/lib/actions/subjects"
import { getAssignments } from "@/lib/actions/assignments"
import { getAttendanceRecords } from "@/lib/actions/attendance"

export default async function TeacherDashboard() {
  const user = await getCurrentUser()
  const userId = user?.id || ""

  const today = new Date()
  
  const [subjects, assignments, todayAttendance] = await Promise.all([
    getSubjectsByTeacher(userId),
    getAssignments({ teacherId: userId }),
    getAttendanceRecords({ teacherId: userId, date: today }),
  ])

  // Calculate Students
  const totalStudents = subjects.reduce((s, sub) => s + ((sub.class as any)._count?.studentClasses || 0), 0)

  // Calculate Pending Grading
  const pendingGrading = assignments.filter(
    (a) => a.submissions && a.submissions.some((s: any) => !s.marksObtained)
  ).length

  // Calculate Attendance Rate
  const presentCount = todayAttendance.filter((r) => r.status === "PRESENT").length
  const attendanceRate = todayAttendance.length > 0
    ? Math.round((presentCount / todayAttendance.length) * 100)
    : 0

  return (
    <div>
      <PageHeader
        title="Educator Panel."
        subtitle={`Welcome back, ${user?.name}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Classes" value={subjects.length} description="Subjects this semester" accentColor="primary" />
        <StatCard label="Students" value={totalStudents} description="Across all sections" accentColor="secondary" />
        <StatCard label="Pending Review" value={pendingGrading} description="Assignments to grade" accentColor={pendingGrading > 0 ? "accent" : "primary"} />
        <StatCard label="Attendance Rate" value={`${attendanceRate}%`} description="Average today" accentColor={attendanceRate >= 75 ? "primary" : "destructive"} />
      </div>
    </div>
  )
}
