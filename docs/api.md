# Data Layer

There are no REST endpoints. The only API route is next-auth:

- `src/app/api/auth/[...nextauth]/route.ts` - GET/POST handler using `authOptions`.

Auth (`src/lib/auth-options.ts`): next-auth 4.24.7, Credentials provider. `authorize()` looks up `prisma.user` by email, rejects when missing or `isActive` false, compares with `bcrypt.compare`, returns `{ id, email, name, role }`. JWT session strategy; `jwt` callback copies `id` and `role` onto the token; `session` callback copies them onto `session.user`. Sign-in page: `/login`.

Session shape (`src/types/next-auth.d.ts`):

```ts
session.user: { id: string; role: string } & DefaultSession["user"]
token/JWT: { id: string; role: string }
```

All data access is via Server Actions (`"use server"`, Prisma 5.19.1, `revalidatePath` after writes). Implementations live in `src/features/*/actions.ts`; `src/lib/actions/{admin,teacher,student}.ts` are re-export shims.

Authorization is enforced in actions, not by middleware alone:

- `requireUser(allowed?)` validates the session, re-checks the user is active and the current role in the database, and throws `Unauthorized`/`Forbidden`.
- `scopedUserId(me, requestedId?)` lets admins read any user id; non-admins may only read their own.
- Mutations check database ownership (subject teacher, assignment teacher, exam creator, invoice owner).

---

## Users (`src/features/users/actions.ts`)

```ts
getUsers(): Promise<{ id; name; email; role; isActive }[]>            // ADMIN, orderBy name, take 500
toggleUserActive(id: string): Promise<void>                           // ADMIN; blocks self and last admin deactivation
getStudentUsers(): Promise<{ id; name; email }[]>                     // ADMIN, active STUDENT, take 500
getTeacherUsers(): Promise<{ id; name; email }[]>                     // ADMIN, active TEACHER, take 200
createUser(name: string, email: string, password: string, role: string): Promise<void>
enrollStudent(studentId: string, classId: string): Promise<void>      // idempotent; verifies active STUDENT + class
unenrollStudent(studentId: string, classId: string): Promise<void>
```

`createUser` validates with `createUserSchema`, trims/lowercases email, bcrypt-hashes the password, and maps duplicate email (`P2002`) to a readable error.

---

## Classes (`src/features/classes/actions.ts`)

```ts
getClasses(): Promise<Class & { department; _count: { enrollments; subjects } }[]> // ADMIN
createClass(name: string, section: string, departmentId: string): Promise<void>    // ADMIN; department must exist
getSubjects(): Promise<Subject & { class; teacher: { name } | null }[]>            // ADMIN
createSubject(name: string, code: string, classId: string): Promise<void>          // ADMIN; code uppercased, unique
assignTeacher(subjectId: string, teacherId: string): Promise<void>                 // ADMIN; active TEACHER only
getDepartments(): Promise<Department[]>                                            // ADMIN
getClassesWithStudents(): Promise<Class & { department; _count; enrollments: { student }[] }[]> // ADMIN
getTeacherSubjects(teacherId: string): Promise<Subject & { class; _count }[]>      // TEACHER/ADMIN, scoped id
getClassRoster(classId: string): Promise<{ class; students: { id; name; email; present; total; attendancePct; avgPct; gradesCount }[] }>
```

`getClassRoster` requires a teacher to have at least one subject in the class; admins bypass that check.

---

## Timetable (`src/features/timetable/actions.ts`)

```ts
getTimetable(): Promise<Timetable & { class; subject; teacher: { name } | null }[]> // ADMIN, take 200
createTimetableEntry(dayOfWeek: string, startTime: string, endTime: string, classId: string, subjectId: string, teacherId: string, room?: string): Promise<void>
deleteTimetableEntry(id: string): Promise<void>                                     // ADMIN
getTeacherTimetable(teacherId: string): Promise<Timetable & { class; subject }[]>   // scoped
getStudentTimetable(studentId: string): Promise<Timetable & { subject; teacher; class }[]> // scoped
```

Writes normalize `H:MM`/`HH:MM`, verify the subject belongs to the class and is taught by the teacher, and reject overlapping class or teacher slots.

---

## Attendance (`src/features/attendance/actions.ts`)

```ts
bulkMarkAttendance(input: {
  classId: string; subjectId: string; date: Date | string; markedById: string;
  rows: { studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }[];
}): Promise<void>
getAttendanceHistory(teacherId: string, classId?: string, from?: Date, to?: Date)
getStudentAttendance(studentId: string): Promise<{ records; perSubject: { code; name; total; present; pct }[] }>
```

`bulkMarkAttendance` is TEACHER/ADMIN, forces `markedById` to the session user, verifies subject/class/teacher and enrollment for every row, normalizes the date to UTC midnight, and upserts on `[studentId, subjectId, date]`. `getStudentAttendance` returns the last 25 records plus per-subject totals; `LATE` counts as present.

---

## Assignments (`src/features/assignments/actions.ts`)

```ts
getTeacherAssignments(teacherId: string)
createAssignment(input: { title; description?; subjectId; teacherId; deadline: Date | string; maxMarks }): Promise<void>
getPendingSubmissions(teacherId: string)                             // ungraded, take 25
gradeSubmission(id: string, marks: number, feedback: string, graderId: string): Promise<void>
getStudentAssignments(studentId: string)
submitAssignment(assignmentId: string, studentId: string, content: string): Promise<void>
getStudentGrades(studentId: string): Promise<{ grades; examResults }>
```

`createAssignment` forces the teacher id unless admin and verifies the subject belongs to that teacher. `gradeSubmission` verifies assignment ownership, clamps marks to `[0, maxMarks]`, updates the submission, and upserts `Grade` with letter `A>=90 / B>=75 / C>=60 / D>=40 / F`. Students can resubmit while ungraded.

---

## Exams (`src/features/exams/actions.ts`)

```ts
getTeacherExams(teacherId: string)                                  // scoped; questions ordered by id
getExamAttempts(examId: string, teacherId: string)                  // owner check
createExam(input: { name; subjectId; totalMarks; duration; createdById }): Promise<string>
addQuestion(input: { examId; questionText; options: string[]; correctOption; marks }): Promise<void>
updateQuestion(id: string, data: { questionText?; options?; correctOption?; marks? }): Promise<void>
deleteQuestion(id: string): Promise<void>
publishExam(id: string): Promise<void>
getStudentExams(studentId: string)                                  // published + enrolled, scoped
submitExam(examId: string, studentId: string, answers: Record<string, number>): Promise<number>
```

Rules:

- Only the exam creator (or admin) may mutate questions or publish.
- Questions cannot be edited after publishing.
- Adding/updating questions rejects a sum of marks above `totalMarks`; publishing requires at least one question and an exact sum.
- `submitExam` requires a published exam, enrollment, and no prior attempt. Answers are keyed by question id, every question must be answered with a valid option, and scoring is server-side. The score is capped at `totalMarks`.

---

## Fees (`src/features/fees/actions.ts`)

```ts
getFeeOverview(): Promise<{ pending; pendingCount; collected }>      // ADMIN; includes PARTIAL balances
getFeeStructures(): Promise<FeeStructure & { class }[]>              // ADMIN
getFeeInvoices(): Promise<FeeInvoice & { student; feeStructure; payments }[]> // ADMIN, take 500
createFeeStructure(name: string, amount: number, classId: string, dueDate: Date | string): Promise<void>
createFeeInvoice(studentId: string, feeStructureId: string, amount: number, dueDate: Date | string): Promise<void>
recordFeePayment(invoiceId: string, amount: number, method: string): Promise<void>
getStudentFees(studentId: string): Promise<FeeInvoice & { feeStructure; payments }[]> // scoped
payFee(invoiceId: string, amount: number, method: string): Promise<void>
```

Fee behavior:

- Creating a structure creates an UNPAID invoice for every enrolled student.
- Invoices are unique per `[studentId, feeStructureId]` at the database level; the action pre-checks and also catches `P2002`.
- Payments are recorded manually; methods are `CASH`, `UPI`, `CARD`, `NETBANKING`.
- Overpayment and payment on a `PAID` invoice are rejected inside a Serializable transaction.
- Invoice status becomes `PAID` when payments cover the amount, otherwise `PARTIAL`.
- Pending totals subtract recorded payments for both `UNPAID` and `PARTIAL` invoices.

---

## Overview (`src/features/overview/actions.ts`)

```ts
getAdminStats(): Promise<{ users; classes; subjects; pendingFees }>       // ADMIN
getTeacherDashboard(teacherId: string): Promise<{ subjects; assignments; pendingSubs; todayAttendance }> // scoped
getStudentDashboard(studentId: string): Promise<{ subjects; attendancePct; avgPct; pendingFees; pendingCount }> // scoped
```

Teacher "today" uses UTC midnight via `todayStart()`. Student attendance treats every non-`ABSENT` mark as present.

---

## Errors

Actions throw `Error` with readable messages (duplicate email/code, not found, forbidden, invalid or over payment, already submitted). Auth failures surface through next-auth (`Invalid credentials` / inactive user). The middleware returns `403` for wrong-role route access; actions return `Forbidden` for ownership/scoping violations.
