# Data Layer

There are no REST endpoints. The only API route is next-auth:

- `src/app/api/auth/[...nextauth]/route.ts` — GET/POST handler using `authOptions`.

Auth (`src/lib/auth-options.ts`): next-auth 4.24.7, Credentials provider. `authorize()` looks up `prisma.user` by email, rejects when missing or `isActive` false, compares with `bcrypt.compare`, returns `{ id, email, name, role }`. JWT session strategy; `jwt` callback copies `id` and `role` onto the token; `session` callback copies them onto `session.user`. Sign-in page: `/login`.

Session shape (`src/types/next-auth.d.ts`):

```ts
session.user: { id: string; role: string } & DefaultSession["user"]
token/JWT: { id: string; role: string }
```

All data access is via Server Actions (`"use server"`, Prisma 5.19.1, `revalidatePath` after writes). 53 functions total. Callers pass the current user id explicitly (from `getServerSession(authOptions)`); there is no token-passing or fetch layer.

---

## Admin (`src/lib/actions/admin.ts`, 24)

```ts
getAdminStats(): Promise<{ users: number; classes: number; subjects: number; pendingFees: number }>
getUsers(): Promise<{ id; name; email; role; isActive }[]>            // orderBy name, take 100
toggleUserActive(id: string): Promise<void>                           // flips isActive; revalidates /admin/users
getClasses(): Promise<Class & { department; _count: { enrollments; subjects } }[]>
createClass(name: string, section: string, departmentId: string): Promise<void>
getSubjects(): Promise<Subject & { class; teacher: { name } | null }[]>
getTimetable(): Promise<Timetable & { class; subject; teacher: { name } | null }[]> // take 100
getFeeOverview(): Promise<{ pending: number; pendingCount: number; collected: number }>
getDepartments(): Promise<Department[]>
getStudentUsers(): Promise<{ id; name; email }[]>                     // role STUDENT, take 200
getTeacherUsers(): Promise<{ id; name; email }[]>                     // role TEACHER, take 200
getClassesWithStudents(): Promise<Class & { department; _count; enrollments: { student: { id; name; email } }[] }[]>
getFeeStructures(): Promise<FeeStructure & { class: { name; section } }[]>
getFeeInvoices(): Promise<FeeInvoice & { student: { name; email }; feeStructure: { name }; payments: { amount }[] }[]> // take 200
createUser(name: string, email: string, password: string, role: string): Promise<void> // lowercases email, throws on duplicate, bcrypt-hashes
enrollStudent(studentId: string, classId: string): Promise<void>      // no-op if Enrollment exists; revalidates /admin/classes, /student, /student/timetable
unenrollStudent(studentId: string, classId: string): Promise<void>    // deleteMany
createSubject(name: string, code: string, classId: string): Promise<void> // code uppercased, throws on duplicate
assignTeacher(subjectId: string, teacherId: string): Promise<void>
createTimetableEntry(dayOfWeek: string, startTime: string, endTime: string, classId: string, subjectId: string, teacherId: string, room?: string): Promise<void>
deleteTimetableEntry(id: string): Promise<void>
createFeeStructure(name: string, amount: number, classId: string, dueDate: string | Date): Promise<void> // also createMany UNPAID FeeInvoice for every enrolled student
createFeeInvoice(studentId: string, feeStructureId: string, amount: number, dueDate: string | Date): Promise<void> // status UNPAID
recordFeePayment(invoiceId: string, amount: number, method: string): Promise<void> // inserts FeePayment; flips invoice to PAID when sum >= amount
```

---

## Teacher (`src/lib/actions/teacher.ts`, 19)

```ts
getTeacherDashboard(teacherId: string): Promise<{ subjects: number; assignments: number; pendingSubs: number; todayAttendance: number }>
getTeacherSubjects(teacherId: string): Promise<Subject & { class; _count: { assignments; exams } }[]>
getTeacherTimetable(teacherId: string): Promise<Timetable & { class; subject }[]>
getTodayAttendance(teacherId: string)                                 // markedById + date >= today 00:00, take 50
getAttendanceHistory(teacherId: string, classId?: string, from?: Date, to?: Date)
bulkMarkAttendance(input: { classId: string; subjectId: string; date: Date; markedById: string; rows: { studentId: string; status: string }[] }): Promise<void> // per-row upsert on @@unique[studentId, subjectId, date]
getTeacherAssignments(teacherId: string): Promise<Assignment & { subject; _count: { submissions } }[]>
createAssignment(input: { title: string; description: string; subjectId: string; teacherId: string; deadline: Date; maxMarks: number }): Promise<void>
getPendingSubmissions(teacherId: string)                              // marksObtained null, take 25
gradeSubmission(id: string, marks: number, feedback: string, graderId: string): Promise<void> // clamps to [0, maxMarks]; upserts Grade with letter A>=90 / B>=75 / C>=60 / D>=40 / F; revalidates /teacher/assignments, /student/assignments, /student/grades, /student
getTeacherExams(teacherId: string): Promise<Exam & { subject; questions; submissions: { student: { id; name } }[]; _count }[]>
getExamAttempts(examId: string, teacherId: string)                    // guards exam.createdById
getExamQuestions(examId: string): Promise<Question[]>
createExam(input: { name: string; subjectId: string; totalMarks: number; duration: number; createdById: string }): Promise<string> // returns exam id
addQuestion(input: { examId: string; questionText: string; options: string[]; correctOption: number; marks: number }): Promise<void> // options stored via JSON.stringify
updateQuestion(id: string, data: { questionText?: string; options?: string[]; correctOption?: number; marks?: number }): Promise<void>
deleteQuestion(id: string): Promise<void>
publishExam(id: string): Promise<void>                                // sets isPublished true
getClassRoster(classId: string): Promise<{ class: Class | null; students: { id; name; email; present; total; attendancePct; avgPct; gradesCount }[] }>
```

---

## Student (`src/lib/actions/student.ts`, 10)

```ts
getStudentDashboard(studentId: string): Promise<{ subjects: number; attendancePct: number; avgPct: number; pendingFees: number; pendingCount: number }>
getStudentAttendance(studentId: string): Promise<{ records: (Attendance & { subject: { name; code } })[]; perSubject: { code; name; total; present; pct }[] }> // last 60, non-ABSENT counts as present
getStudentAssignments(studentId: string)                              // assignments in enrolled classes + own submission { content; marksObtained; feedback }
submitAssignment(assignmentId: string, studentId: string, content: string): Promise<void> // upsert on @@unique[assignmentId, studentId]
getStudentGrades(studentId: string): Promise<{ grades: (Grade & { subject: { name; code } })[]; examResults: (ExamSubmission & { exam: { name; totalMarks; subject: { name; code } } })[] }> // only isPublished exams
getStudentTimetable(studentId: string): Promise<Timetable & { subject; teacher: { name } | null; class }[]>
getStudentFees(studentId: string): Promise<FeeInvoice & { feeStructure; payments }[]>
payFee(invoiceId: string, amount: number, method: string): Promise<void> // validates amount, rejects paid/excess; creates FeePayment (default CASH/COMPLETED at DB level); PAID when fully covered else PARTIAL
getStudentExams(studentId: string)                                    // isPublished exams in enrolled classes + own submissions
submitExam(examId: string, studentId: string, answers: number[]): Promise<number> // MCQ auto-score vs correctOption, upsert on @@unique[examId, studentId], returns score
```

Errors: actions throw `Error` (duplicate email/code, submission/exam/invoice not found, invalid/over payment). Auth failures surface as next-auth `authorize` errors ("Invalid credentials" / "User not found or inactive" / "Invalid password"). Role violations are enforced in `src/middleware.ts` (403), not in the actions.
