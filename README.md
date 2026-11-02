# CampusConnect

Single-campus academic platform (V1) for MIT-ADT: role-based dashboards for Admin, Teacher, and Student covering users, classes, timetable, attendance, assignments, MCQ exams, grades, and manual fee tracking.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14.2.7 (App Router, TypeScript strict) |
| Auth | next-auth 4.24.7, Credentials provider, bcrypt, JWT |
| DB / ORM | PostgreSQL (Neon) + Prisma 5.19.1 |
| Backend | Server Actions, feature-sliced under `src/features/` |
| Styling | Tailwind CSS + shadcn-style primitives in `src/shared/ui` |
| API routes | One: `/api/auth/[...nextauth]` |

No online payments, email service, cloud storage, or realtime features in V1.

## What each role can do

Login redirects by role: ADMIN -> `/admin`, TEACHER -> `/teacher`, STUDENT -> `/student`.

**Admin** (`src/features/{users,classes,timetable,fees,overview}`)
- Create users, activate/deactivate accounts
- Enroll / unenroll students
- Create classes, subjects, assign teachers
- Create / delete timetable entries
- Create fee structures (auto-creates invoices for enrolled students), single invoices, record payments

**Teacher** (`src/features/{classes,timetable,attendance,assignments,exams,overview}`)
- Bulk mark attendance and view history
- View rosters for classes they teach
- Create assignments, grade submissions (upserts a subject grade)
- Create MCQ exams, add/update/delete questions, publish, view attempts

**Student** (`src/features/{attendance,assignments,timetable,fees,exams,overview}`)
- Submit or resubmit assignments while ungraded
- Take published MCQ exams (one attempt, auto-scored)
- Pay fees manually (recorded, no gateway)
- Read own attendance, grades, timetable, fees, assignments, exams

## Security model

Every Server Action authenticates with `requireUser()` and checks the role it needs. User ids accepted from the client are passed through `scopedUserId()`: a non-admin may only request their own id. Mutation ownership is checked against the database (subject teacher, assignment teacher, exam creator, invoice owner). Writes validate input with the feature Zod schemas, not only client-side forms.

Additional guarantees:
- Attendance is limited to the teacher's own subject and enrolled students.
- Timetable entries verify class/subject/teacher consistency and reject class or teacher overlaps.
- Exams reject edits after publishing, require question marks to equal `totalMarks` before publish, and score answers keyed by question id.
- Fee invoices are unique per student and fee structure; pending totals include partial balances.
- Dates are normalized to UTC calendar days in `src/lib/date.ts`.

See `docs/security.md` for the full model and `docs/rbac-and-workflows.md` for per-role boundaries.

## Quickstart

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev                  # http://localhost:3000
```

Prisma CLI reads `.env` but not `.env.local`. Keep `DATABASE_URL` and `DIRECT_URL` in `.env`, or export them in the shell before running Prisma commands. Next.js loads both files.

Demo accounts are seeded by `prisma/seed.js`; the seeded demo password is defined there. Change it before any shared deployment.

| Role | Email |
|---|---|
| Admin | admin@mitadt.edu.in |
| Teacher | sneha.kulkarni@mitadt.edu.in |
| Student | aditya.shinde@mitadt.edu.in |

## Environment

Five variables (see `docs/environment.md`):

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-me-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `vercel-build` | Generate client, apply migrations, build |
| `npm start` | Start the production server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run boundaries` | Enforce feature/shared import boundaries |
| `npm run lint` | Next.js ESLint (`next/core-web-vitals`) |

## Project layout

```
src/
  app/
    page.tsx                          # landing
    (auth)/login/page.tsx
    (dashboard)/admin/                # dashboard, users, classes, subjects, timetable, fees
    (dashboard)/teacher/              # dashboard, classes, timetable, attendance, assignments, exams
    (dashboard)/student/              # dashboard, attendance, assignments, exams, grades, timetable, fees
    api/auth/[...nextauth]/route.ts   # only API route
  features/                           # actions.ts + schemas.ts per domain
    users/ classes/ timetable/ attendance/ assignments/ exams/ fees/ overview/
  lib/                                # auth, auth-options, date, fees, prisma, utils
  shared/                             # ui primitives, layouts, motion, providers
  middleware.ts                       # route-prefix role gate
prisma/
  schema.prisma                       # 16 models
  migrations/                         # Postgres migrations
  seed.js
scripts/check-boundaries.mjs
docs/
public/mit-adt-crest.png
```

`src/lib/actions/{admin,teacher,student}.ts` remain as compatibility shims that re-export feature actions. New code imports from `@/features/*/actions`.

Models (16): User, Department, Class, Enrollment, Subject, Timetable, Attendance, Assignment, Submission, Exam, Question, ExamSubmission, Grade, FeeStructure, FeeInvoice, FeePayment.

Design: MIT-ADT Light theme, white surfaces, brand purple `#5E2D91`, magenta `#C13584`, ember `#F26522`, crest at `public/mit-adt-crest.png`.

## Docs

- `docs/architecture.md` - runtime, modules, request flow
- `docs/database.md` - schema and integrity rules
- `docs/api.md` - Server Action reference
- `docs/features.md` - implemented features and routes
- `docs/rbac-and-workflows.md` - role matrix and workflows
- `docs/security.md` - authorization, scoping, validation
- `docs/environment.md` - environment variables
- `docs/deployment.md` - Neon + Vercel
- `docs/DESIGN.md` - visual system
- `docs/project-report.md` - project summary

## Roadmap (planned, not shipped)

- Online payment gateway
- Hostel / transport / library modules
- Real-time chat and notices
- CSV bulk import
- Subjective exams with manual grading
- Multi-campus support
