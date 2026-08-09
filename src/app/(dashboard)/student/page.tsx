import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  return (
    <div>
      <PageHeader
        title="Student Portal."
        subtitle={`Welcome back, ${user?.name}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Current GPA" value="3.8" description="This semester" accentColor="primary" />
        <StatCard label="Credits Earned" value="102" description="18 remaining" accentColor="secondary" />
        <StatCard label="Attendance" value="87%" description="Above 75% target" accentColor="primary" />
        <StatCard label="Pending Fees" value="₹12,500" description="Due by March 15" accentColor="accent" />
      </div>
    </div>
  )
}
