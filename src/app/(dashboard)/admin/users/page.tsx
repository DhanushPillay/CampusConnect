import { UsersTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { getUsers } from "@/lib/actions/users"
import { getCampuses } from "@/lib/actions/campuses"

export default async function UsersPage() {
  const [users, campuses] = await Promise.all([getUsers(), getCampuses()])
  const totalTeachers = users.filter((u) => u.role === "TEACHER").length
  const totalStudents = users.filter((u) => u.role === "STUDENT").length
  const activeUsers = users.filter((u) => u.isActive).length

  return (
    <div>
      <PageHeader
        title="Users."
        subtitle="Manage all users across your campuses."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Users" value={users.length} accentColor="primary" />
        <StatCard label="Teachers" value={totalTeachers} accentColor="secondary" />
        <StatCard label="Students" value={totalStudents} accentColor="primary" />
        <StatCard label="Active" value={activeUsers} description={`${users.length - activeUsers} inactive`} accentColor="accent" />
      </div>

      <UsersTable users={users} campuses={campuses} />
    </div>
  )
}
