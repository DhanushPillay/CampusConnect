"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface SemesterSetupData {
  campusId: string
  departmentId: string
  academicYear: {
    id?: string // existing
    name: string
    startDate: string // ISO string
    endDate: string // ISO string
  }
  semester: {
    name: string
    startDate: string // ISO string
    endDate: string // ISO string
  }
  classes: {
    name: string
    section?: string
    subjects: {
      name: string
      code: string
      teacherId?: string
    }[]
  }[]
}

export async function publishSemesterSetup(data: SemesterSetupData) {
  try {
    // We use a transaction so if any part fails (e.g. creating subjects), the whole semester is rolled back
    await prisma.$transaction(async (tx) => {
      // 1. Resolve Academic Year
      let academicYearId = data.academicYear.id
      
      if (!academicYearId) {
        const newAy = await tx.academicYear.create({
          data: {
            name: data.academicYear.name,
            startDate: new Date(data.academicYear.startDate),
            endDate: new Date(data.academicYear.endDate),
            campusId: data.campusId,
          }
        })
        academicYearId = newAy.id
      }

      // 2. Create Semester
      const semester = await tx.semester.create({
        data: {
          name: data.semester.name,
          startDate: new Date(data.semester.startDate),
          endDate: new Date(data.semester.endDate),
          academicYearId: academicYearId,
        }
      })

      // 3. Create Classes & Subjects
      for (const classData of data.classes) {
        const newClass = await tx.class.create({
          data: {
            name: classData.name,
            section: classData.section,
            departmentId: data.departmentId,
            campusId: data.campusId,
            academicYearId: academicYearId,
          }
        })

        // 4. Create Subjects for this class and map to teachers
        if (classData.subjects && classData.subjects.length > 0) {
          await tx.subject.createMany({
            data: classData.subjects.map(subj => ({
              name: subj.name,
              code: subj.code,
              classId: newClass.id,
              teacherId: subj.teacherId || null,
            }))
          })
        }
      }
    })

    revalidatePath("/admin/dashboard")
    return { success: true }
  } catch (error: any) {
    console.error("Semester setup failed:", error)
    return { success: false, error: error.message || "Failed to setup semester" }
  }
}
