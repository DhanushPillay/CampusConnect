import { SetupWizardClient } from "./client"
import { PageHeader } from "@/components/ui/page-header"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { redirect } from "next/navigation"

export default async function SetupWizardPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  // Fetch prerequisites
  const [campuses, departments, teachers, academicYears] = await Promise.all([
    prisma.campus.findMany({ select: { id: true, name: true } }),
    prisma.department.findMany({ select: { id: true, name: true, campusId: true } }),
    prisma.user.findMany({
      where: { role: "TEACHER", isActive: true },
      select: { id: true, name: true, campusId: true }
    }),
    prisma.academicYear.findMany({ select: { id: true, name: true } })
  ])

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <PageHeader 
        title="Semester Setup Wizard" 
        subtitle="Configure the new academic term, classes, and subjects in one place."
      />
      <div className="mt-8">
        <SetupWizardClient 
          campuses={campuses}
          departments={departments}
          teachers={teachers}
          academicYears={academicYears}
        />
      </div>
    </div>
  )
}
