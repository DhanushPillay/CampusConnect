const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@mitadt.edu.in" },
    update: {},
    create: { email: "admin@mitadt.edu.in", password, name: "Rajesh Patil", role: "ADMIN" },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "sneha.kulkarni@mitadt.edu.in" },
    update: {},
    create: {
      email: "sneha.kulkarni@mitadt.edu.in",
      password,
      name: "Sneha Kulkarni",
      role: "TEACHER",
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: "amit.joshi@mitadt.edu.in" },
    update: {},
    create: { email: "amit.joshi@mitadt.edu.in", password, name: "Amit Joshi", role: "TEACHER" },
  });

  const student = await prisma.user.upsert({
    where: { email: "aditya.shinde@mitadt.edu.in" },
    update: {},
    create: {
      email: "aditya.shinde@mitadt.edu.in",
      password,
      name: "Aditya Shinde",
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "priya.nair@mitadt.edu.in" },
    update: {},
    create: { email: "priya.nair@mitadt.edu.in", password, name: "Priya Nair", role: "STUDENT" },
  });

  const dept = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });

  const cls = await prisma.class.upsert({
    where: { id: "seed-cse-a" },
    update: {},
    create: { id: "seed-cse-a", name: "CSE-A", section: "A", departmentId: dept.id },
  });

  for (const s of [student, student2]) {
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: s.id, classId: cls.id } },
      update: {},
      create: { studentId: s.id, classId: cls.id },
    });
  }

  const dsa = await prisma.subject.upsert({
    where: { code: "CS201" },
    update: { teacherId: teacher.id },
    create: { name: "Data Structures", code: "CS201", classId: cls.id, teacherId: teacher.id },
  });

  const dbms = await prisma.subject.upsert({
    where: { code: "CS202" },
    update: { teacherId: teacher2.id },
    create: { name: "Database Systems", code: "CS202", classId: cls.id, teacherId: teacher2.id },
  });

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY"];
  for (const [i, d] of days.entries()) {
    await prisma.timetable.upsert({
      where: { id: `seed-tt-${i}` },
      update: {},
      create: {
        id: `seed-tt-${i}`,
        classId: cls.id,
        subjectId: i % 2 === 0 ? dsa.id : dbms.id,
        teacherId: i % 2 === 0 ? teacher.id : teacher2.id,
        dayOfWeek: d,
        startTime: "09:00",
        endTime: "10:00",
        room: `R-20${i}`,
      },
    });
  }

  await prisma.assignment.upsert({
    where: { id: "seed-asg-1" },
    update: {},
    create: {
      id: "seed-asg-1",
      title: "Linked list implementation",
      description: "Singly + doubly linked list with test cases.",
      subjectId: dsa.id,
      teacherId: teacher.id,
      deadline: new Date(Date.now() + 7 * 864e5),
      maxMarks: 20,
    },
  });

  const exam = await prisma.exam.upsert({
    where: { id: "seed-exam-1" },
    update: {},
    create: {
      id: "seed-exam-1",
      name: "DSA Mid-term MCQ",
      subjectId: dsa.id,
      totalMarks: 20,
      duration: 30,
      isPublished: true,
      createdById: teacher.id,
    },
  });

  const qcount = await prisma.question.count({ where: { examId: exam.id } });
  if (qcount === 0) {
    await prisma.question.createMany({
      data: [
        {
          examId: exam.id,
          questionText: "Time complexity of binary search?",
          options: JSON.stringify(["O(n)", "O(log n)", "O(n log n)", "O(1)"]),
          correctOption: 1,
          marks: 10,
        },
        {
          examId: exam.id,
          questionText: "Which structure is LIFO?",
          options: JSON.stringify(["Queue", "Stack", "Tree", "Graph"]),
          correctOption: 1,
          marks: 10,
        },
      ],
    });
  }

  const fee = await prisma.feeStructure.upsert({
    where: { id: "seed-fee-1" },
    update: {},
    create: {
      id: "seed-fee-1",
      name: "Sem 5 Tuition",
      amount: 105000,
      classId: cls.id,
      dueDate: new Date(Date.now() + 30 * 864e5),
    },
  });

  for (const s of [student, student2]) {
    const existing = await prisma.feeInvoice.findFirst({
      where: { studentId: s.id, feeStructureId: fee.id },
    });
    if (!existing) {
      await prisma.feeInvoice.create({
        data: {
          studentId: s.id,
          feeStructureId: fee.id,
          amount: fee.amount,
          dueDate: fee.dueDate,
          status: "UNPAID",
        },
      });
    }
  }

  console.log("Seed done:", admin.email, teacher.email, student.email);
}

main().finally(() => prisma.$disconnect());
