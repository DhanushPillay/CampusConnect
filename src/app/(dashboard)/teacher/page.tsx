import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { getCurrentUser } from "@/lib/auth"

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  return (
    <div>
      <PageHeader
        title="Educator Panel."
        subtitle={`Welcome back, ${user?.name}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Classes" value="5" description="3 subjects this semester" accentColor="primary" />
        <StatCard label="Students" value="127" description="Across all sections" accentColor="secondary" />
        <StatCard label="Pending Review" value="18" description="Assignments to grade" accentColor="accent" />
        <StatCard label="Attendance Rate" value="91%" description="Average this month" accentColor="primary" />
      </div>
    </div>
  )
}
