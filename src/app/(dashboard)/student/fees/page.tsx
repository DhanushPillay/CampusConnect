import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { StudentFeesClient } from "./client"
import { getStudentFees } from "@/lib/actions/fees"
import { getCurrentUser } from "@/lib/auth"

export default async function StudentFeesPage() {
  const user = await getCurrentUser()
  const invoices = user?.id ? await getStudentFees(user.id) : []

  const totalFees = invoices.reduce((s: number, i) => s + i.amount, 0)
  const totalPaid = invoices
    .filter((i) => i.status === "PAID")
    .reduce((s: number, i) => s + i.amount, 0)
  const pendingAmount = totalFees - totalPaid

  const nextDue = invoices
    .filter((i) => i.status !== "PAID")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]

  return (
    <div>
      <PageHeader
        title="My Fees."
        subtitle="View your fee details and payment history."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Fees" value={`₹${totalFees.toLocaleString("en-IN")}`} accentColor="primary" />
        <StatCard label="Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} accentColor="secondary" />
        <StatCard label="Pending" value={`₹${pendingAmount.toLocaleString("en-IN")}`} accentColor={pendingAmount > 0 ? "accent" : "primary"} />
        <StatCard
          label="Next Due"
          value={nextDue ? new Date(nextDue.dueDate).toLocaleDateString("en-IN") : "All paid"}
          accentColor="primary"
        />
      </div>

      <StudentFeesClient invoices={invoices} />
    </div>
  )
}
