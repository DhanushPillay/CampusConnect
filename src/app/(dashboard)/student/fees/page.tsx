import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { DataTable } from "@/components/ui/data-table"
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

      <DataTable
        data={invoices}
        columns={[
          { key: "feeStructure", header: "Fee", render: (i) => <span className="font-bold">{i.feeStructure.name}</span> },
          { key: "amount", header: "Amount", render: (i) => <span className="font-serif">₹{i.amount.toLocaleString("en-IN")}</span> },
          { key: "dueDate", header: "Due Date", render: (i) => new Date(i.dueDate).toLocaleDateString("en-IN") },
          {
            key: "status",
            header: "Status",
            render: (i) => (
              <span className={`font-hand text-lg ${
                i.status === "PAID" ? "text-secondary" :
                i.status === "PARTIAL" ? "text-primary" :
                "text-destructive"
              }`}>
                {i.status}
              </span>
            ),
          },
          {
            key: "payments",
            header: "Paid",
            render: (i) => {
              const paid = i.payments.reduce((s: number, p) => s + p.amount, 0)
              return paid > 0 ? (
                <span className="font-serif">₹{paid.toLocaleString("en-IN")}</span>
              ) : (
                "—"
              )
            },
          },
        ]}
        emptyTitle="No fee records"
        emptyDescription="Your fee invoices will appear here."
      />
    </div>
  )
}
