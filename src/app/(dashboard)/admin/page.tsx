import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  // Fetch real counts from DB
  const [userCount, campusCount, departmentCount, classCount] = await Promise.all([
    prisma.user.count(),
    prisma.campus.count(),
    prisma.department.count(),
    prisma.class.count(),
  ])

  return (
    <div>
      <PageHeader
        title="Admin Panel."
        subtitle={`Welcome back, ${user?.name}`}
      />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={userCount.toString()} description="Registered accounts" accentColor="primary" />
        <StatCard label="Campuses" value={campusCount.toString()} description="Active locations" accentColor="secondary" />
        <StatCard label="Departments" value={departmentCount.toString()} description="Across all campuses" accentColor="primary" />
        <StatCard label="Classes" value={classCount.toString()} description="Total scheduled classes" accentColor="accent" />
      </div>
    </div>
  )
}
