# CampusConnect — Project Report (V1, as built)

## 1. Abstract

CampusConnect V1 is a single-campus web platform for MIT-ADT with three role dashboards (Admin, Teacher, Student). It covers user/class/subject setup, timetable, date-and-class-scoped attendance, assignments with grading, MCQ-only auto-graded exams, and manual fee recording. Built with Next.js 14.2.7, next-auth 4.24.7 (Credentials + bcrypt + JWT), Prisma 5.19.1 on SQLite, and Server Actions. One API route exists: `/api/auth/[...nextauth]`.

## 2. Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2.7 App Router + TypeScript |
| Auth | next-auth 4.24.7 Credentials, bcryptjs, JWT; role-direct login (ADMIN → `/admin`, TEACHER → `/teacher`, STUDENT → `/student`) |
| DB / ORM | SQLite (`file:./dev.db`), Prisma 5.19.1, 16 models |
| Backend | Server Actions: `src/lib/actions/admin.ts`, `teacher.ts`, `student.ts` |
| Styling | Tailwind CSS, MIT-ADT Light theme (`#5E2D91`, `#C13584`, `#F26522`), crest `public/mit-adt-crest.png` |
| Env | `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL` |
| Scripts | `dev`, `build`, `start`, `lint`; seed via `npx prisma db seed` (`node prisma/seed.js`) |

## 3. Scope (implemented)

- Admin: `createUser`, `toggleUserActive`, `enrollStudent`/`unenrollStudent`, `createClass`, `createSubject`, `assignTeacher`, `createTimetableEntry`/`deleteTimetableEntry`, `createFeeStructure` (auto-invoices), `createFeeInvoice`, `recordFeePayment`.
- Teacher: `bulkMarkAttendance`, `getAttendanceHistory`, `getClassRoster`, `createAssignment`, `gradeSubmission` (upserts Grade), `createExam`, `add`/`update`/`deleteQuestion`, `publishExam`, `getExamAttempts`.
- Student: `submitAssignment` (resubmit while ungraded), `submitExam` (MCQ auto-grade, single attempt), `payFee` (manual CASH/COMPLETED), plus reads for attendance, grades, timetable, fees.
- Routes: `/`, `/login`, `/admin` (+users, classes, subjects, timetable, fees), `/teacher` (+classes, classes/[classId], timetable, attendance, attendance/mark, assignments, exams), `/student` (+attendance, assignments, exams, exams/[id], grades, timetable, fees).

## 4. Limits (explicitly not in V1)

No online payments, no email service, no real-time chat, no notices module, no hostel/transport/library, no CSV import, no subjective exams, single campus only, no container or cloud deployment. Fees are manual records only; exams are MCQ-only.

## 5. Future scope (Planned)

Online payment gateway, hostel/transport/library modules, chat, CSV import.
