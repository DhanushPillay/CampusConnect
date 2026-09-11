# Database

Source of truth: `prisma/schema.prisma`. Provider SQLite (`file:./dev.db`), Prisma 5.19.1. 16 models, no other tables.

---

## Models

### User
- Fields: `id` uuid PK, `email` String unique, `password` String (bcrypt hash), `name` String, `role` String (`ADMIN`/`TEACHER`/`STUDENT`), `phone` String?, `isActive` Boolean default true, `createdAt`, `updatedAt`.
- Relations: teaches subjects/timetables/assignments/created exams, marks attendance, grades submissions; student side: enrollments, attendance, submissions, exam submissions, grades, invoices.

### Department
- Fields: `id` uuid PK, `name` String unique, `createdAt`, `updatedAt`.
- Relations: `classes[]`. No parent reference.

### Class
- Fields: `id` uuid PK, `name` String, `section` String?, `departmentId` String, `createdAt`, `updatedAt`.
- Relations: `department` (onDelete Cascade), `subjects[]`, `enrollments[]`, `timetables[]`, `attendance[]`, `feeStructs[]`.

### Enrollment
- Fields: `id` uuid PK, `studentId`, `classId`, `enrolledAt` default now.
- Relations: `student -> User` (Cascade), `class -> Class` (Cascade).
- Unique: `@@unique([studentId, classId])`.

### Subject
- Fields: `id` uuid PK, `name`, `code` String unique, `classId`, `teacherId` String? (optional), `createdAt`, `updatedAt`.
- Relations: `class` (Cascade); `teacher -> User` (SetNull); `timetables[]`, `attendance[]`, `assignments[]`, `exams[]`, `grades[]`.

### Timetable
- Fields: `id` uuid PK, `classId`, `subjectId`, `teacherId`, `dayOfWeek` String (`MONDAY`..`SATURDAY`), `startTime` String `HH:MM`, `endTime` String `HH:MM`, `room` String?, `createdAt`, `updatedAt`.
- Delete rules: `class` Cascade, `subject` Cascade, `teacher` Restrict.

### Attendance
- Fields: `id` uuid PK, `studentId`, `classId`, `subjectId`, `date` DateTime, `status` String (`PRESENT`/`ABSENT`/`LATE`), `markedById` String?, `createdAt`.
- Delete rules: student Cascade, class Cascade, subject Cascade, `markedBy -> User` SetNull.
- Unique: `@@unique([studentId, subjectId, date])`.

### Assignment
- Fields: `id` uuid PK, `title`, `description` String?, `subjectId`, `teacherId`, `deadline` DateTime, `maxMarks` Int, `createdAt`, `updatedAt`.
- Delete rules: `subject` Cascade, `teacher` Cascade.
- Relations: `submissions[]`.

### Submission
- Fields: `id` uuid PK, `assignmentId`, `studentId`, `content` String?, `submittedAt` default now, `marksObtained` Int?, `feedback` String?, `gradedById` String?.
- Delete rules: assignment Cascade, student Cascade, `gradedBy -> User` SetNull.
- Unique: `@@unique([assignmentId, studentId])`.

### Exam
- Fields: `id` uuid PK, `name`, `subjectId`, `totalMarks` Int, `duration` Int (minutes), `isPublished` Boolean default false, `createdById`, `createdAt`, `updatedAt`.
- Delete rules: `subject` Cascade, `createdBy -> User` Restrict.
- Relations: `questions[]`, `submissions[]`.

### Question
- Fields: `id` uuid PK, `examId`, `questionText` String, `options` String (JSON array string), `correctOption` Int, `marks` Int.
- Relations: `exam` (Cascade). No unique constraint.

### ExamSubmission
- Fields: `id` uuid PK, `examId`, `studentId`, `answers` String (JSON array string), `score` Int?, `submittedAt` default now.
- Delete rules: exam Cascade, student Cascade.
- Unique: `@@unique([examId, studentId])`.

### Grade
- Fields: `id` uuid PK, `studentId`, `subjectId`, `marksObtained` Int, `totalMarks` Int, `grade` String (letter A/B/C/D/F), `createdAt`, `updatedAt`.
- Delete rules: student Cascade, subject Cascade.
- Unique: `@@unique([studentId, subjectId])`.

### FeeStructure
- Fields: `id` uuid PK, `name`, `amount` Float, `classId`, `dueDate` DateTime, `createdAt`.
- Relations: `class` (Cascade), `invoices[]`.

### FeeInvoice
- Fields: `id` uuid PK, `studentId`, `feeStructureId`, `amount` Float, `dueDate` DateTime, `status` String default `UNPAID` (`UNPAID`/`PARTIAL`/`PAID`), `createdAt`, `updatedAt`.
- Delete rules: student Cascade, `feeStructure` Restrict.
- Relations: `payments[]`.

### FeePayment
- Fields: `id` uuid PK, `invoiceId`, `amount` Float, `method` String default `CASH`, `status` String default `COMPLETED`, `paidAt` default now.
- Relations: `invoice -> FeeInvoice` (Cascade).

---

## Notes

- Auth stores the bcrypt hash in `User.password`; `isActive=false` blocks login in `authorize`.
- Scoping keys are `Enrollment(studentId, classId)`, `Subject/Timetable.teacherId`, `Assignment.teacherId`, `Exam.createdById`. There is no tenant id column on any model.
- JSON is stored as `String` (`Question.options`, `ExamSubmission.answers`); parse/stringify in actions.
- Status/role/grade values are plain `String`s validated in code, not DB enums (SQLite).
