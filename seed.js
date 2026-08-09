const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Campus
  const campus = await prisma.campus.create({
    data: {
      name: 'Greenwood International School',
      address: '123 Education Lane, Bangalore, Karnataka 560001',
      phone: '+91 80 2345 6789',
      email: 'info@greenwood.edu',
    },
  })

  // Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025-2026',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-04-30'),
      campusId: campus.id,
    },
  })

  const semester1 = await prisma.semester.create({
    data: {
      name: 'Semester 1',
      academicYearId: academicYear.id,
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-11-30'),
    },
  })

  const semester2 = await prisma.semester.create({
    data: {
      name: 'Semester 2',
      academicYearId: academicYear.id,
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-04-30'),
    },
  })

  // Departments
  const deptScience = await prisma.department.create({
    data: { name: 'Science & Technology', campusId: campus.id },
  })
  const deptCommerce = await prisma.department.create({
    data: { name: 'Commerce & Management', campusId: campus.id },
  })
  const deptArts = await prisma.department.create({
    data: { name: 'Arts & Humanities', campusId: campus.id },
  })

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@greenwood.edu' },
    update: {},
    create: {
      email: 'admin@greenwood.edu',
      name: 'Priya Sharma',
      password: hashedPassword,
      role: 'ADMIN',
      campusId: campus.id,
      phone: '+91 98765 43210',
    },
  })

  // Teachers
  const teachers = []
  const teacherData = [
    { name: 'Rajesh Kumar', email: 'rajesh@greenwood.edu', phone: '+91 98765 10001' },
    { name: 'Anita Desai', email: 'anita@greenwood.edu', phone: '+91 98765 10002' },
    { name: 'Vikram Patel', email: 'vikram@greenwood.edu', phone: '+91 98765 10003' },
    { name: 'Meera Nair', email: 'meera@greenwood.edu', phone: '+91 98765 10004' },
    { name: 'Arjun Reddy', email: 'arjun@greenwood.edu', phone: '+91 98765 10005' },
  ]

  for (const t of teacherData) {
    const teacher = await prisma.user.create({
      data: {
        ...t,
        password: hashedPassword,
        role: 'TEACHER',
        campusId: campus.id,
      },
    })
    teachers.push(teacher)
  }

  // Students
  const students = []
  const studentData = [
    { name: 'Aarav Mehta', email: 'aarav@student.greenwood.edu' },
    { name: 'Diya Gupta', email: 'diya@student.greenwood.edu' },
    { name: 'Ishaan Joshi', email: 'ishaan@student.greenwood.edu' },
    { name: 'Kavya Singh', email: 'kavya@student.greenwood.edu' },
    { name: 'Rohan Verma', email: 'rohan@student.greenwood.edu' },
    { name: 'Sneha Rao', email: 'sneha@student.greenwood.edu' },
    { name: 'Aditya Kumar', email: 'aditya@student.greenwood.edu' },
    { name: 'Nisha Agarwal', email: 'nisha@student.greenwood.edu' },
    { name: 'Vivek Choudhary', email: 'vivek@student.greenwood.edu' },
    { name: 'Pooja Mishra', email: 'pooja@student.greenwood.edu' },
    { name: 'Karan Malhotra', email: 'karan@student.greenwood.edu' },
    { name: 'Shreya Iyer', email: 'shreya@student.greenwood.edu' },
    { name: 'Nikhil Bansal', email: 'nikhil@student.greenwood.edu' },
    { name: 'Tanvi Kulkarni', email: 'tanvi@student.greenwood.edu' },
    { name: 'Varun Saxena', email: 'varun@student.greenwood.edu' },
  ]

  for (const s of studentData) {
    const student = await prisma.user.create({
      data: {
        ...s,
        password: hashedPassword,
        role: 'STUDENT',
        campusId: campus.id,
      },
    })
    students.push(student)
  }

  // Classes
  const class10A = await prisma.class.create({
    data: {
      name: 'Class 10',
      section: 'A',
      departmentId: deptScience.id,
      campusId: campus.id,
      academicYearId: academicYear.id,
    },
  })

  const class10B = await prisma.class.create({
    data: {
      name: 'Class 10',
      section: 'B',
      departmentId: deptScience.id,
      campusId: campus.id,
      academicYearId: academicYear.id,
    },
  })

  const class11 = await prisma.class.create({
    data: {
      name: 'Class 11',
      section: 'A',
      departmentId: deptCommerce.id,
      campusId: campus.id,
      academicYearId: academicYear.id,
    },
  })

  // Subjects
  const subjectPhysics = await prisma.subject.create({
    data: {
      name: 'Physics',
      code: 'PHY101',
      classId: class10A.id,
      teacherId: teachers[0].id,
    },
  })

  const subjectChemistry = await prisma.subject.create({
    data: {
      name: 'Chemistry',
      code: 'CHM101',
      classId: class10A.id,
      teacherId: teachers[1].id,
    },
  })

  const subjectMath = await prisma.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MTH101',
      classId: class10A.id,
      teacherId: teachers[2].id,
    },
  })

  const subjectEnglish = await prisma.subject.create({
    data: {
      name: 'English',
      code: 'ENG101',
      classId: class10A.id,
      teacherId: teachers[3].id,
    },
  })

  const subjectBiology = await prisma.subject.create({
    data: {
      name: 'Biology',
      code: 'BIO101',
      classId: class10B.id,
      teacherId: teachers[4].id,
    },
  })

  const subjectAccounts = await prisma.subject.create({
    data: {
      name: 'Accountancy',
      code: 'ACC101',
      classId: class11.id,
      teacherId: teachers[1].id,
    },
  })

  // Enroll students in classes
  for (let i = 0; i < 8; i++) {
    await prisma.studentClass.create({
      data: { studentId: students[i].id, classId: class10A.id },
    })
  }
  for (let i = 8; i < 12; i++) {
    await prisma.studentClass.create({
      data: { studentId: students[i].id, classId: class10B.id },
    })
  }
  for (let i = 12; i < 15; i++) {
    await prisma.studentClass.create({
      data: { studentId: students[i].id, classId: class11.id },
    })
  }

  // Classrooms
  const room101 = await prisma.classroom.create({
    data: { name: 'Room 101', capacity: 40, campusId: campus.id },
  })
  const room102 = await prisma.classroom.create({
    data: { name: 'Room 102', capacity: 40, campusId: campus.id },
  })
  const lab1 = await prisma.classroom.create({
    data: { name: 'Physics Lab', capacity: 30, campusId: campus.id },
  })

  // Timetable
  const days = ['MONDAY', 'WEDNESDAY', 'FRIDAY']
  const times = [
    { start: 9, end: 10 },
    { start: 10, end: 11 },
    { start: 11, end: 12 },
  ]

  const subjects = [subjectPhysics, subjectChemistry, subjectMath, subjectEnglish]
  const classrooms = [room101, room102, lab1]

  for (const day of days) {
    for (let i = 0; i < 3; i++) {
      await prisma.timetable.create({
        data: {
          classId: class10A.id,
          subjectId: subjects[i].id,
          teacherId: teachers[i].id,
          dayOfWeek: day,
          startTime: new Date(`2025-06-01T${String(times[i].start).padStart(2, '0')}:00:00`),
          endTime: new Date(`2025-06-01T${String(times[i].end).padStart(2, '0')}:00:00`),
          classroomId: classrooms[i].id,
          campusId: campus.id,
        },
      })
    }
  }

  // Attendance (sample for first 5 students in class10A, physics, last week)
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE']
  const today = new Date()
  for (let d = 0; d < 5; d++) {
    const date = new Date(today)
    date.setDate(date.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    for (let i = 0; i < 5; i++) {
      await prisma.attendance.create({
        data: {
          studentId: students[i].id,
          classId: class10A.id,
          subjectId: subjectPhysics.id,
          date,
          status: statuses[i],
          markedById: teachers[0].id,
        },
      })
    }
  }

  // Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Newton\'s Laws Problem Set',
      description: 'Solve problems 1-15 from Chapter 4. Show all working.',
      subjectId: subjectPhysics.id,
      teacherId: teachers[0].id,
      deadline: new Date('2025-07-15'),
      maxMarks: 30,
    },
  })

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Chemical Bonding Worksheet',
      description: 'Complete the worksheet on ionic and covalent bonds.',
      subjectId: subjectChemistry.id,
      teacherId: teachers[1].id,
      deadline: new Date('2025-07-20'),
      maxMarks: 20,
    },
  })

  const assignment3 = await prisma.assignment.create({
    data: {
      title: 'Quadratic Equations Practice',
      description: 'Solve all 20 problems. Use the quadratic formula where applicable.',
      subjectId: subjectMath.id,
      teacherId: teachers[2].id,
      deadline: new Date('2025-07-18'),
      maxMarks: 40,
    },
  })

  // Submissions
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students[0].id,
      marksObtained: 25,
      feedback: 'Good work on the derivations. Review problem 12.',
      gradedById: teachers[0].id,
      gradedAt: new Date(),
    },
  })

  await prisma.submission.create({
    data: {
      assignmentId: assignment2.id,
      studentId: students[1].id,
      // Not graded yet
    },
  })

  // Exams
  const exam1 = await prisma.exam.create({
    data: {
      name: 'Physics Mid-Term',
      type: 'BOTH',
      subjectId: subjectPhysics.id,
      totalMarks: 50,
      mcqMarks: 20,
      subjectiveMarks: 30,
      duration: 90,
      startTime: new Date('2025-08-15T09:00:00'),
      isPublished: true,
      createdById: teachers[0].id,
    },
  })

  await prisma.examQuestion.create({
    data: {
      examId: exam1.id,
      questionText: 'What is the SI unit of force?',
      options: JSON.stringify(['Joule', 'Newton', 'Watt', 'Pascal']),
      correctOption: 1,
      marks: 2,
    },
  })

  await prisma.examQuestion.create({
    data: {
      examId: exam1.id,
      questionText: 'State Newton\'s second law of motion.',
      options: JSON.stringify(['F = ma', 'E = mc²', 'V = IR', 'PV = nRT']),
      correctOption: 0,
      marks: 2,
    },
  })

  // Grades
  await prisma.grade.create({
    data: {
      studentId: students[0].id,
      subjectId: subjectPhysics.id,
      semesterId: semester1.id,
      marksObtained: 42,
      totalMarks: 50,
      grade: 'A',
      cgpa: 3.8,
    },
  })

  await prisma.grade.create({
    data: {
      studentId: students[0].id,
      subjectId: subjectMath.id,
      semesterId: semester1.id,
      marksObtained: 38,
      totalMarks: 50,
      grade: 'B+',
      cgpa: 3.5,
    },
  })

  await prisma.grade.create({
    data: {
      studentId: students[1].id,
      subjectId: subjectPhysics.id,
      semesterId: semester1.id,
      marksObtained: 45,
      totalMarks: 50,
      grade: 'A+',
      cgpa: 4.0,
    },
  })

  // Fee structures
  const feeTuition = await prisma.feeStructure.create({
    data: {
      name: 'Tuition Fee - Semester 1',
      amount: 45000,
      campusId: campus.id,
      classId: class10A.id,
      semesterId: semester1.id,
      dueDate: new Date('2025-07-01'),
    },
  })

  const feeLab = await prisma.feeStructure.create({
    data: {
      name: 'Lab Fee',
      amount: 5000,
      campusId: campus.id,
      classId: class10A.id,
      semesterId: semester1.id,
      dueDate: new Date('2025-07-01'),
    },
  })

  // Fee invoices
  for (let i = 0; i < 5; i++) {
    const invoice = await prisma.feeInvoice.create({
      data: {
        studentId: students[i].id,
        feeStructureId: feeTuition.id,
        amount: 45000,
        dueDate: new Date('2025-07-01'),
        status: i < 3 ? 'PAID' : 'UNPAID',
      },
    })

    if (i < 3) {
      await prisma.feePayment.create({
        data: {
          invoiceId: invoice.id,
          amount: 45000,
          paymentMethod: 'UPI',
          status: 'COMPLETED',
          paidAt: new Date('2025-06-20'),
        },
      })
    }
  }

  // Books
  const book1 = await prisma.book.create({
    data: {
      title: 'Fundamentals of Physics',
      author: 'H.C. Verma',
      isbn: '978-8174091772',
      campusId: campus.id,
      totalCopies: 5,
      availableCopies: 3,
    },
  })

  const book2 = await prisma.book.create({
    data: {
      title: 'Chemistry: The Central Science',
      author: 'Theodore L. Brown',
      isbn: '978-0321910417',
      campusId: campus.id,
      totalCopies: 3,
      availableCopies: 2,
    },
  })

  // Notices
  await prisma.notice.create({
    data: {
      title: 'Mid-Term Examination Schedule',
      content: 'Mid-term examinations will begin from August 15, 2025. Please check your respective class timetables for detailed schedule.',
      campusId: campus.id,
      postedById: teachers[0].id,
    },
  })

  await prisma.notice.create({
    data: {
      title: 'Annual Sports Day',
      content: 'Annual Sports Day will be held on September 20, 2025. All students are encouraged to participate.',
      campusId: campus.id,
      postedById: teachers[0].id,
    },
  })

  console.log('Database seeded successfully!')
  console.log(`  - 1 Campus`)
  console.log(`  - 3 Departments`)
  console.log(`  - 1 Admin, 5 Teachers, 15 Students`)
  console.log(`  - 3 Classes with enrollments`)
  console.log(`  - 6 Subjects`)
  console.log(`  - Timetable, Attendance, Assignments, Exams, Grades, Fees, Books, Notices`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
