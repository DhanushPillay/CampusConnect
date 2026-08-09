import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10)

  // Find one student
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" }
  })

  // Find one teacher
  const teacher = await prisma.user.findFirst({
    where: { role: "TEACHER" }
  })

  if (student) {
    await prisma.user.update({
      where: { id: student.id },
      data: { password: hashedPassword }
    })
    console.log(`Student Login: ${student.email} / password123`)
  } else {
    console.log("No student found in the database.")
  }

  if (teacher) {
    await prisma.user.update({
      where: { id: teacher.id },
      data: { password: hashedPassword }
    })
    console.log(`Teacher Login: ${teacher.email} / password123`)
  } else {
    console.log("No teacher found in the database.")
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
