import { StructuresTable, InvoicesTable } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Card } from "@/components/ui/card"
import { getFeeStructures, getFeeInvoices } from "@/lib/actions/fees"

export default async function FeesPage() {
  const [structures, invoices] = await Promise.all([
    getFeeStructures(),
    getFeeInvoices(),
  ])

  const totalRevenue = invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum: number, i) => sum + i.amount, 0)
  const pendingAmount = invoices
    .filter((i) => i.status !== "PAID")
    .reduce((sum: number, i) => sum + i.amount, 0)
  const totalPaid = invoices.filter((i) => i.status === "PAID").length
  const collectionRate = invoices.length > 0 ? Math.round((totalPaid / invoices.length) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Fees."
        subtitle="Manage fee structures and track payments."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${(totalRevenue / 1000).toFixed(1)}K`} accentColor="primary" />
        <StatCard label="Pending" value={`₹${(pendingAmount / 1000).toFixed(1)}K`} accentColor="accent" />
        <StatCard label="Collection Rate" value={`${collectionRate}%`} accentColor="secondary" />
        <StatCard label="Invoices" value={invoices.length} description={`${totalPaid} paid`} accentColor="primary" />
      </div>

      <h2 className="font-display font-bold text-xl uppercase mb-4">Fee Structures</h2>
      <StructuresTable structures={structures} />

      <h2 className="font-display font-bold text-xl uppercase mt-8 mb-4">Recent Invoices</h2>
      <InvoicesTable invoices={invoices} />
    </div>
  )
}
