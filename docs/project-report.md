# CampusConnect - Project Report (V1, as built)

## 1. Abstract

CampusConnect V1 is a single-campus web platform for MIT-ADT with three role dashboards (Admin, Teacher, Student). It covers user/class/subject setup, timetable, date-and-class-scoped attendance, assignments with grading, MCQ-only auto-graded exams, and manual fee recording. Built with Next.js 14.2.7, next-auth 4.24.7 (Credentials + bcrypt + JWT), Prisma 5.19.1 on PostgreSQL (Neon), and Server Actions. One API route exists: `/api/auth/[...nextauth]`.

## 2. Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2.7 App Router + TypeScript |
| Auth | next-auth 4.24.7 Credentials, bcryptjs, JWT; role-direct login (ADMIN -> `/admin`, TEACHER -> `/teacher`, STUDENT -> `/student`) |
| DB / ORM | PostgreSQL (Neon), Prisma 5.19.1, 16 models |
| Backend | Server Actions in `src/features/*/actions.ts`; compatibility shims in `src/lib/actions/` |
| Styling | Tailwind CSS, MIT-ADT Light theme (`#5E2D91`, `#C13584`, `#F26522`), crest `public/mit-adt-crest.png` |
| Env | `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXT_PUBLIC_APP_URL` |
| Scripts | `dev`, `build`, `vercel-build`, `start`, `typecheck`, `test`, `boundaries`; seed via `npx prisma db seed` |

## 3. Scope (implemented)

- Admin: create users, activate/deactivate, enroll/unenroll students, create classes/subjects, assign teachers, create/delete timetable entries, create fee structures (auto-invoices), create invoices, record payments.
- Teacher: bulk mark attendance and view history, view rosters for own classes, create assignments, grade submissions (upserts a subject grade), create MCQ exams, add/update/delete questions before publishing, publish, view attempts.
- Student: submit/resubmit assignments while ungraded, take published MCQ exams (single attempt, auto-graded), pay fees manually, and read own attendance, grades, timetable, fees, assignments, and exams.
- Routes: `/`, `/login`, `/admin` (+users, classes, subjects, timetable, fees), `/teacher` (+classes, classes/[classId], timetable, attendance, attendance/mark, assignments, exams), `/student` (+attendance, assignments, exams, exams/[id], grades, timetable, fees).

## 4. Security and integrity

- Every action authenticates with `requireUser`; client-supplied user ids are constrained by `scopedUserId`.
- Teacher mutations verify subject/assignment/exam ownership against the database.
- Attendance validates enrollment and forces the marker to the session user.
- Timetable rejects class/teacher overlaps and subject/teacher mismatches.
- Exams block edits after publishing, require exact marks before publishing, and score answers keyed by question id.
- Fee invoices are unique per student and structure; payments run in Serializable transactions and pending totals include partial balances.
- Dates are normalized to UTC calendar days.

Full detail: `docs/security.md`.

## 5. Limits (explicitly not in V1)

No online payments, email service, real-time chat, notices module, hostel/transport/library, CSV import, subjective exams, or multi-campus support. Fees are manual records; exams are MCQ-only. Exam duration is stored but not enforced with a countdown.

## 6. Future scope (planned)

Online payment gateway, hostel/transport/library modules, chat/notices, CSV import, subjective exams, multi-campus support.
