const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { attendanceStatus, gradeLetter, getWeekdays } = require("./seed-helpers");

const prisma = new PrismaClient();
const PASSWORD = "password123";

const teachers = [
  ["sneha.kulkarni@mitadt.edu.in", "Sneha Kulkarni"],
  ["amit.joshi@mitadt.edu.in", "Amit Joshi"],
  ["neha.desai@mitadt.edu.in", "Neha Desai"],
  ["rohan.mehta@mitadt.edu.in", "Rohan Mehta"],
  ["kavita.shah@mitadt.edu.in", "Kavita Shah"],
  ["vikram.patil@mitadt.edu.in", "Vikram Patil"],
  ["meera.iyer@mitadt.edu.in", "Meera Iyer"],
  ["sanjay.reddy@mitadt.edu.in", "Sanjay Reddy"],
  ["anita.sharma@mitadt.edu.in", "Anita Sharma"],
  ["rahul.kapoor@mitadt.edu.in", "Rahul Kapoor"],
  ["pooja.verma@mitadt.edu.in", "Pooja Verma"],
  ["arun.nair@mitadt.edu.in", "Arun Nair"],
];

const firstNames = [
  "Aarav", "Aditi", "Akash", "Ananya", "Arjun", "Avani", "Dev", "Diya", "Esha", "Harsh",
  "Ishaan", "Jhanvi", "Kabir", "Karan", "Kavya", "Krish", "Manav", "Meera", "Mihir", "Nandini",
  "Neel", "Niharika", "Om", "Pallavi", "Parth", "Pranav", "Rhea", "Rishi", "Sahil", "Sakshi",
  "Samarth", "Sanika", "Shivam", "Shruti", "Siddharth", "Simran", "Tanay", "Tanya", "Ved", "Vansh",
];

const lastNames = [
  "Bhosale", "Chavan", "Deshmukh", "Gokhale", "Jadhav", "Joshi", "Kulkarni", "Mahajan", "Mane", "More",
  "Naik", "Nair", "Pawar", "Pillai", "Rane", "Sawant", "Shinde", "Suryawanshi", "Thakur", "Wagh",
];

const subjectTemplates = [
  ["Data Structures", "CS201"],
  ["Database Systems", "CS202"],
  ["Object Oriented Programming", "CS203"],
  ["Computer Networks", "CS204"],
  ["Operating Systems", "CS205"],
  ["Web Technologies", "CS206"],
  ["Software Engineering", "CS207"],
  ["Discrete Mathematics", "MA201"],
];

const examQuestions = [
  ["Which data structure follows LIFO order?", ["Queue", "Stack", "Tree", "Graph"], 1],
  ["What is the average lookup complexity of a hash table?", ["O(n)", "O(log n)", "O(1)", "O(n log n)"], 2],
];

function dateOnly(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

async function upsertUser(password, email, name, role) {
  return prisma.user.upsert({
    where: { email },
    update: { name, role, isActive: true },
    create: { email, password, name, role },
  });
}

function teacherIndexFor(subjectIndex, classIndex) {
  if (classIndex >= 3 && subjectIndex < 4) return 8 + subjectIndex;
  return subjectIndex;
}

async function main() {
  const password = await bcrypt.hash(PASSWORD, 10);
  const admin = await upsertUser(password, "admin@mitadt.edu.in", "Rajesh Patil", "ADMIN");
  const teacherUsers = [];
  for (const [email, name] of teachers) teacherUsers.push(await upsertUser(password, email, name, "TEACHER"));

  const existingStudents = [
    ["aditya.shinde@mitadt.edu.in", "Aditya Shinde"],
    ["priya.nair@mitadt.edu.in", "Priya Nair"],
  ];
  const studentUsers = [];
  for (const [email, name] of existingStudents) studentUsers.push(await upsertUser(password, email, name, "STUDENT"));
  for (let index = 0; index < 198; index += 1) {
    const name = `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
    const email = `student${String(index + 3).padStart(3, "0")}@mitadt.edu.in`;
    studentUsers.push(await upsertUser(password, email, name, "STUDENT"));
  }

  const department = await prisma.department.upsert({
    where: { name: "Computer Science" },
    update: {},
    create: { name: "Computer Science" },
  });
  const classSpecs = [
    ["seed-cse-a", "CSE-A", "A"],
    ["seed-cse-b", "CSE-B", "B"],
    ["seed-cse-c", "CSE-C", "C"],
    ["seed-cse-d", "CSE-D", "D"],
    ["seed-cse-e", "CSE-E", "E"],
  ];
  const classes = [];
  for (const [id, name, section] of classSpecs) {
    classes.push(await prisma.class.upsert({
      where: { id },
      update: { name, section, departmentId: department.id },
      create: { id, name, section, departmentId: department.id },
    }));
  }

  for (let index = 0; index < studentUsers.length; index += 1) {
    const classIndex = Math.floor(index / 40);
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: studentUsers[index].id, classId: classes[classIndex].id } },
      update: {},
      create: { studentId: studentUsers[index].id, classId: classes[classIndex].id },
    });
  }

  const subjects = [];
  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    for (let subjectIndex = 0; subjectIndex < subjectTemplates.length; subjectIndex += 1) {
      const [name, baseCode] = subjectTemplates[subjectIndex];
      const code = classIndex === 0 ? baseCode : `${baseCode}-${classSpecs[classIndex][2]}`;
      subjects.push(await prisma.subject.upsert({
        where: { code },
        update: { name, classId: classes[classIndex].id, teacherId: teacherUsers[teacherIndexFor(subjectIndex, classIndex)].id },
        create: { name, code, classId: classes[classIndex].id, teacherId: teacherUsers[teacherIndexFor(subjectIndex, classIndex)].id },
      }));
    }
  }

  const timeSlots = ["08:00", "09:00", "10:15", "11:15", "13:00", "14:00", "15:15", "16:15"];
  const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  for (let index = 0; index < subjects.length; index += 1) {
    const classIndex = Math.floor(index / subjectTemplates.length);
    const subjectIndex = index % subjectTemplates.length;
    const timetableId = classIndex === 0 && subjectIndex < 3
      ? `seed-tt-${subjectIndex}`
      : `seed-tt-${classIndex}-${subjectIndex}`;
    await prisma.timetable.upsert({
      where: { id: timetableId },
      update: {
        classId: classes[classIndex].id,
        subjectId: subjects[index].id,
        teacherId: teacherUsers[teacherIndexFor(subjectIndex, classIndex)].id,
        dayOfWeek: weekdays[subjectIndex % weekdays.length],
        startTime: timeSlots[subjectIndex],
        endTime: `${String(Number(timeSlots[subjectIndex].slice(0, 2)) + 1).padStart(2, "0")}:${timeSlots[subjectIndex].slice(3)}`,
        room: `C-${201 + classIndex * 10 + subjectIndex}`,
      },
      create: {
        id: timetableId,
        classId: classes[classIndex].id,
        subjectId: subjects[index].id,
        teacherId: teacherUsers[teacherIndexFor(subjectIndex, classIndex)].id,
        dayOfWeek: weekdays[subjectIndex % weekdays.length],
        startTime: timeSlots[subjectIndex],
        endTime: `${String(Number(timeSlots[subjectIndex].slice(0, 2)) + 1).padStart(2, "0")}:${timeSlots[subjectIndex].slice(3)}`,
        room: `C-${201 + classIndex * 10 + subjectIndex}`,
      },
    });
  }

  const attendanceDays = getWeekdays(new Date(), 30);
  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    const classStudents = studentUsers.slice(classIndex * 40, (classIndex + 1) * 40);
    const classSubjects = subjects.slice(classIndex * subjectTemplates.length, (classIndex + 1) * subjectTemplates.length);
    for (let subjectIndex = 0; subjectIndex < classSubjects.length; subjectIndex += 1) {
      const attendanceRows = [];
      for (let dayIndex = 0; dayIndex < attendanceDays.length; dayIndex += 1) {
        for (let studentIndex = 0; studentIndex < classStudents.length; studentIndex += 1) {
          attendanceRows.push({
            studentId: classStudents[studentIndex].id,
            classId: classes[classIndex].id,
            subjectId: classSubjects[subjectIndex].id,
            date: attendanceDays[dayIndex],
            status: attendanceStatus(studentIndex + classIndex * 40, subjectIndex, dayIndex),
            markedById: classSubjects[subjectIndex].teacherId,
          });
        }
      }
      await prisma.attendance.createMany({ data: attendanceRows, skipDuplicates: true });
    }
  }

  for (let subjectIndex = 0; subjectIndex < subjects.length; subjectIndex += 1) {
    const subject = subjects[subjectIndex];
    const classIndex = Math.floor(subjectIndex / subjectTemplates.length);
    const classStudents = studentUsers.slice(classIndex * 40, (classIndex + 1) * 40);
    const assignmentId = `seed-asg-${subjectIndex + 1}`;
    const assignment = await prisma.assignment.upsert({
      where: { id: assignmentId },
      update: {},
      create: {
        id: assignmentId,
        title: `${subject.name} practical assessment`,
        description: `Apply ${subject.name.toLowerCase()} concepts to a small project and submit your findings.`,
        subjectId: subject.id,
        teacherId: subject.teacherId,
        deadline: new Date(Date.now() + (7 + subjectIndex) * 864e5),
        maxMarks: 20,
      },
    });
    const submissionRows = [];
    for (let studentIndex = 0; studentIndex < classStudents.length; studentIndex += 1) {
      if ((studentIndex + subjectIndex) % 5 === 0) continue;
      const submitted = (studentIndex + subjectIndex) % 7 !== 0;
      submissionRows.push({
        assignmentId: assignment.id,
        studentId: classStudents[studentIndex].id,
        content: submitted ? `Submitted solution for ${subject.name}.` : null,
        submittedAt: new Date(Date.now() - (studentIndex + 1) * 864e5),
        marksObtained: submitted ? 12 + ((studentIndex * 3 + subjectIndex) % 9) : null,
        feedback: submitted ? "Good understanding with room for more detailed testing." : null,
        gradedById: submitted ? subject.teacherId : null,
      });
    }
    if (submissionRows.length > 0) await prisma.submission.createMany({ data: submissionRows, skipDuplicates: true });

    const examId = `seed-exam-${subjectIndex + 1}`;
    const exam = await prisma.exam.upsert({
      where: { id: examId },
      update: {},
      create: {
        id: examId,
        name: `${subject.name} mid-term assessment`,
        subjectId: subject.id,
        totalMarks: 20,
        duration: 30,
        isPublished: true,
        createdById: subject.teacherId,
      },
    });
    const questionCount = await prisma.question.count({ where: { examId: exam.id } });
    if (questionCount === 0) {
      await prisma.question.createMany({
        data: examQuestions.map(([questionText, options, correctOption], questionIndex) => ({
          examId: exam.id,
          questionText,
          options: JSON.stringify(options),
          correctOption,
          marks: questionIndex === 0 ? 10 : 10,
        })),
      });
    }
    const questions = await prisma.question.findMany({ where: { examId: exam.id }, orderBy: { id: "asc" } });
    const examSubmissionRows = [];
    for (let studentIndex = 0; studentIndex < classStudents.length; studentIndex += 1) {
      if ((studentIndex + subjectIndex) % 4 === 0) continue;
      const answers = Object.fromEntries(questions.map((question, questionIndex) => [question.id, (studentIndex + questionIndex) % 4]));
      examSubmissionRows.push({
        examId: exam.id,
        studentId: classStudents[studentIndex].id,
        answers: JSON.stringify(answers),
        score: 10 + ((studentIndex * 3 + subjectIndex) % 11),
        submittedAt: new Date(Date.now() - (studentIndex + 2) * 864e5),
      });
    }
    if (examSubmissionRows.length > 0) {
      await prisma.examSubmission.createMany({ data: examSubmissionRows, skipDuplicates: true });
    }
  }

  for (let classIndex = 0; classIndex < classes.length; classIndex += 1) {
    const classSubjects = subjects.slice(classIndex * subjectTemplates.length, (classIndex + 1) * subjectTemplates.length);
    const classStudents = studentUsers.slice(classIndex * 40, (classIndex + 1) * 40);
    const fee = await prisma.feeStructure.upsert({
      where: { id: classIndex === 0 ? "seed-fee-1" : `seed-fee-${classIndex + 1}` },
      update: {},
      create: {
        id: classIndex === 0 ? "seed-fee-1" : `seed-fee-${classIndex + 1}`,
        name: `Semester 5 tuition - ${classes[classIndex].name}`,
        amount: 105000 + classIndex * 2500,
        classId: classes[classIndex].id,
        dueDate: dateOnly(new Date(Date.now() + 30 * 864e5)),
      },
    });
    for (let studentIndex = 0; studentIndex < classStudents.length; studentIndex += 1) {
      const state = (studentIndex + classIndex) % 5;
      const status = state === 0 ? "PAID" : state === 1 ? "PARTIAL" : "UNPAID";
      const invoiceData = {
        studentId: classStudents[studentIndex].id,
        feeStructureId: fee.id,
        amount: fee.amount,
        dueDate: fee.dueDate,
        status,
      };
      const existingInvoice = await prisma.feeInvoice.findFirst({
        where: { studentId: invoiceData.studentId, feeStructureId: invoiceData.feeStructureId },
      });
      const invoice = existingInvoice
        ? await prisma.feeInvoice.update({ where: { id: existingInvoice.id }, data: { status } })
        : await prisma.feeInvoice.create({ data: invoiceData });
      if (status !== "UNPAID") {
        await prisma.feePayment.upsert({
          where: { id: `seed-payment-${classIndex}-${studentIndex}` },
          update: { amount: status === "PAID" ? fee.amount : Math.round(fee.amount * 0.4) },
          create: {
            id: `seed-payment-${classIndex}-${studentIndex}`,
            invoiceId: invoice.id,
            amount: status === "PAID" ? fee.amount : Math.round(fee.amount * 0.4),
            method: ["UPI", "CARD", "NETBANKING"][studentIndex % 3],
            status: "COMPLETED",
          },
        });
      }
    }

    const gradeRows = [];
    for (const [studentIndex, student] of classStudents.entries()) {
      for (const [subjectIndex, subject] of classSubjects.entries()) {
        const marks = 48 + ((studentIndex * 7 + subjectIndex * 5 + classIndex * 3) % 50);
        gradeRows.push({ studentId: student.id, subjectId: subject.id, marksObtained: marks, totalMarks: 100, grade: gradeLetter(marks) });
      }
    }
    await prisma.grade.createMany({ data: gradeRows, skipDuplicates: true });
  }

  const counts = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.class.count(),
    prisma.subject.count(),
    prisma.enrollment.count(),
    prisma.attendance.count(),
    prisma.grade.count(),
    prisma.feeInvoice.count(),
  ]);
  console.log("Seed done", {
    admin: admin.email,
    password: PASSWORD,
    students: counts[0],
    teachers: counts[1],
    classes: counts[2],
    subjects: counts[3],
    enrollments: counts[4],
    attendance: counts[5],
    grades: counts[6],
    invoices: counts[7],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());