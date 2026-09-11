# CampusConnect

Single-campus academic platform (V1) for MIT-ADT: role-based dashboards for Admin, Teacher, and Student covering users, classes, timetable, attendance, assignments, MCQ exams, grades, and manual fee tracking.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2.7 (App Router, TypeScript) |
| Auth | next-auth 4.24.7, Credentials provider, bcrypt, JWT |
| DB / ORM | SQLite (`DATABASE_URL=file:./dev.db`) + Prisma 5.19.1 |
| Backend | Server Actions (`src/lib/actions/`) |
| Styling | Tailwind CSS + shadcn-style UI |
| API routes | One: `/api/auth/[...nextauth]` |

No online payments, email service, or cloud storage in V1.

## What each role can do

Login redirects by role: ADMIN → `/admin`, TEACHER → `/teacher`, STUDENT → `/student`.

**Admin** (`src/lib/actions/admin.ts`)
- `createUser`, `toggleUserActive`
- `enrollStudent` / `unenrollStudent` (`enroll/unenrollStudent` naming in UI)
- `createClass`, `createSubject`, `assignTeacher`
- `createTimetableEntry` / `deleteTimetableEntry`, `getTimetable`
- `createFeeStructure` (auto-creates UNPAID invoices for enrolled students), `createFeeInvoice`, `recordFeePayment`

**Teacher** (`src/lib/actions/teacher.ts`)
- `bulkMarkAttendance` (date + class scoped), `getAttendanceHistory`, `getClassRoster`
- `createAssignment`, `gradeSubmission` (upserts `Grade` with letter)
- `createExam`, `addQuestion` / `updateQuestion` / `deleteQuestion`, `publishExam`, `getExamAttempts`

**Student** (`src/lib/actions/student.ts`)
- `submitAssignment` (resubmit allowed while ungraded), `submitExam` (MCQ auto-graded, single attempt, no retake), `payFee`
- Reads: own attendance, grades, timetable, fees, assignments, published exams

Rules: exams are MCQ-only (options stored as JSON, `correctOption` index). Fees are manual cash-style records (`method` defaults CASH, `status` COMPLETED via `payFee` / `recordFeePayment`). No online gateway.

## Quickstart

```bash
npm install
cp .env.example .env.local   # Windows: copy .env.example .env.local
npx prisma db push
npx prisma db seed            # runs node prisma/seed.js per package.json
npm run dev                   # http://localhost:3000
```

## Demo accounts (password: `password123`)

| Role | Email |
|---|---|
| Admin | admin@mitadt.edu.in |
| Teacher | sneha.kulkarni@mitadt.edu.in |
| Student | aditya.shinde@mitadt.edu.in |

## Environment (.env.example)

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Project tree (real)

```
src/
  app/
    page.tsx                          # landing
    (auth)/login/page.tsx
    (dashboard)/admin/                # page, users, classes, subjects, timetable, fees
    (dashboard)/teacher/              # page, classes, classes/[classId], timetable,
                                      # attendance, attendance/mark, assignments, exams
    (dashboard)/student/              # page, attendance, assignments, exams, exams/[id],
                                      # grades, timetable, fees
    api/auth/[...nextauth]/route.ts   # only API route
  lib/actions/                        # admin.ts, teacher.ts, student.ts
  lib/                                # auth.ts, auth-options.ts, prisma.ts, utils.ts
  middleware.ts                       # role-direct on /login
prisma/
  schema.prisma                       # 16 models
  seed.js
public/mit-adt-crest.png
```

Models (16): User, Department, Class, Enrollment, Subject, Timetable, Attendance, Assignment, Submission, Exam, Question, ExamSubmission, Grade, FeeStructure, FeeInvoice, FeePayment.

Design: MIT-ADT Light theme, white surfaces, brand purple `#5E2D91`, magenta `#C13584`, ember `#F26522`, crest at `public/mit-adt-crest.png`.

## Roadmap (Planned, not shipped)

- Online payments (gateway integration)
- Hostel / transport / library modules
- Real-time chat and notices
- CSV bulk import
