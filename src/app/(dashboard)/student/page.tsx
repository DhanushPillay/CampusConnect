import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { getCurrentUser } from "@/lib/auth"
import { getStudentGradeSummary } from "@/lib/actions/grades"
import { getStudentAttendanceSummary } from "@/lib/actions/attendance"
import { getStudentFees } from "@/lib/actions/fees"
import { getStudentClasses } from "@/lib/actions/student"

export default async function StudentDashboard() {
  const user = await getCurrentUser()
  const userId = user?.id || ""

  // Fetch all necessary data concurrently
  const [grades, attendance, fees, enrollments] = await Promise.all([
    getStudentGradeSummary(userId),
    getStudentAttendanceSummary(userId),
    getStudentFees(userId),
    getStudentClasses(userId),
  ])

  // Calculate CGPA
  const currentCGPA = grades[0]?.cgpa || 0

  // Calculate Credits/Subjects
  const totalSubjects = enrollments.reduce((s, e) => s + e.class.subjects.length, 0)

  // Calculate Attendance
  const overallTotal = attendance.reduce((s, r) => s + r.total, 0)
  const overallPresent = attendance.reduce((s, r) => s + r.present, 0)
  const attendanceRate = overallTotal > 0 ? Math.round((overallPresent / overallTotal) * 100) : 0

  // Calculate Fees
  const totalFees = fees.reduce((s, i) => s + i.amount, 0)
  const totalPaid = fees.filter((i) => i.status === "PAID").reduce((s, i) => s + i.amount, 0)
  const pendingFees = totalFees - totalPaid

  return (
    <div>
      <PageHeader
        title="Student Portal."
        subtitle={`Welcome back, ${user?.name}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current CGPA" value={currentCGPA || "—"} description="Latest semester" accentColor="primary" />
        <StatCard label="Total Subjects" value={totalSubjects} description="Currently enrolled" accentColor="secondary" />
        <StatCard label="Attendance" value={`${attendanceRate}%`} description={attendanceRate >= 75 ? "On track" : "Needs attention"} accentColor={attendanceRate >= 75 ? "primary" : "destructive"} />
        <StatCard label="Pending Fees" value={`₹${pendingFees.toLocaleString("en-IN")}`} description={pendingFees > 0 ? "Outstanding balance" : "All cleared"} accentColor={pendingFees > 0 ? "accent" : "primary"} />
      </div>
    </div>
  )
}
